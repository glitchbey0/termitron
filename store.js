const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.resolve(process.env.TERM_DATA_DIR || path.join(__dirname, 'data'));

function ensureDir(dir = DATA_DIR) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
}

let cachedMasterKey = null;
function getMasterKey() {
  if (cachedMasterKey) return cachedMasterKey;
  if (process.env.TERM_MASTER_KEY) {
    cachedMasterKey = crypto.scryptSync(process.env.TERM_MASTER_KEY, 'termitron-master-v1', 32);
    return cachedMasterKey;
  }
  ensureDir(DATA_DIR);
  const keyPath = path.join(DATA_DIR, '.master.key');
  if (fs.existsSync(keyPath)) {
    const hex = fs.readFileSync(keyPath, 'utf8').trim();
    if (/^[a-f0-9]{64}$/i.test(hex)) {
      cachedMasterKey = Buffer.from(hex, 'hex');
      return cachedMasterKey;
    }
  }
  cachedMasterKey = crypto.randomBytes(32);
  fs.writeFileSync(keyPath, cachedMasterKey.toString('hex') + '\n', { encoding: 'utf8', mode: 0o600 });
  return cachedMasterKey;
}

const fileKeyCache = new Map();
function deriveFileKey(dir, name) {
  const rel = path.relative(DATA_DIR, dir) || 'root';
  const cacheKey = `${rel}:${name}`;
  let key = fileKeyCache.get(cacheKey);
  if (key) return key;
  key = Buffer.from(crypto.hkdfSync('sha256', getMasterKey(), Buffer.from(rel, 'utf8'), Buffer.from(`termitron-file:${name}`, 'utf8'), 32));
  if (fileKeyCache.size >= 2000) {
    const first = fileKeyCache.keys().next().value;
    if (first) fileKeyCache.delete(first);
  }
  fileKeyCache.set(cacheKey, key);
  return key;
}

function encryptPayload(data, dir, name) {
  const key = deriveFileKey(dir, name);
  const iv = crypto.randomBytes(12);
  const aad = Buffer.from(`${path.relative(DATA_DIR, dir) || 'root'}:${name}`, 'utf8');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(aad);
  const pt = Buffer.from(JSON.stringify(data), 'utf8');
  const ct = Buffer.concat([cipher.update(pt), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    v: 1,
    alg: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ct: ct.toString('base64'),
  };
}

function decryptPayload(env, dir, name) {
  const key = deriveFileKey(dir, name);
  const iv = Buffer.from(env.iv, 'base64');
  const tag = Buffer.from(env.tag, 'base64');
  const ct = Buffer.from(env.ct, 'base64');
  const aad = Buffer.from(`${path.relative(DATA_DIR, dir) || 'root'}:${name}`, 'utf8');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAAD(aad);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return JSON.parse(pt.toString('utf8'));
}

const jsonCache = new Map();

function cloneVal(v) {
  return v !== null && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v;
}

function loadJson(name, fallback, dir = DATA_DIR) {
  try {
    const p = path.join(dir, name);
    let st;
    try {
      st = fs.statSync(p);
    } catch {
      jsonCache.delete(p);
      return fallback;
    }
    const cached = jsonCache.get(p);
    if (cached && cached.mtimeMs === st.mtimeMs) {
      return cloneVal(cached.data);
    }
    const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
    let data;
    if (raw && raw.v === 1 && raw.alg === 'aes-256-gcm' && raw.iv && raw.tag && raw.ct) {
      data = decryptPayload(raw, dir, name);
    } else {
      data = raw;
      saveJson(name, raw, 0o600, dir);
      try { st = fs.statSync(p); } catch {}
    }
    if (jsonCache.size >= 1000) {
      const first = jsonCache.keys().next().value;
      if (first) jsonCache.delete(first);
    }
    jsonCache.set(p, { mtimeMs: st.mtimeMs, data: cloneVal(data) });
    return data;
  } catch {
    return fallback;
  }
}

function saveJson(name, data, _mode = 0o600, dir = DATA_DIR) {
  ensureDir(dir);
  const p = path.join(dir, name);
  const tmp = `${p}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  const enc = encryptPayload(data, dir, name);
  fs.writeFileSync(tmp, JSON.stringify(enc), { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(tmp, p);
  try {
    const st = fs.statSync(p);
    jsonCache.set(p, { mtimeMs: st.mtimeMs, data: cloneVal(data) });
  } catch {
    jsonCache.delete(p);
  }
}

const DEFAULT_SETTINGS = {
  font_size: 14,
  scrollback: 5000,
  keepalive: 30,
  term_theme: 'Vercel',
};

function fingerprintB64(b64) {
  try {
    const buf = Buffer.from(b64, 'base64');
    return 'SHA256:' + crypto.createHash('sha256').update(buf).digest('base64').replace(/=+$/, '');
  } catch {
    return '';
  }
}

function hashKey(key) {
  return crypto.createHmac('sha256', getMasterKey()).update(String(key)).digest('hex');
}

function legacyHashKey(key) {
  return crypto.createHash('sha256').update(String(key)).digest('hex');
}

function safeStrEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ha = crypto.createHmac('sha256', getMasterKey()).update(a).digest();
  const hb = crypto.createHmac('sha256', getMasterKey()).update(b).digest();
  return crypto.timingSafeEqual(ha, hb) && a.length === b.length;
}

function registerUser() {
  const accessKey = 'trm_' + crypto.randomBytes(16).toString('hex');
  const userId = crypto.randomBytes(8).toString('hex');
  const users = loadJson('users.json', {});
  users[hashKey(accessKey)] = { userId, createdAt: Date.now() };
  saveJson('users.json', users, 0o600);
  return { userId, accessKey };
}

function findUserByKey(key) {
  if (!key || typeof key !== 'string' || key.length > 256) return null;
  const users = loadJson('users.json', {});
  const hmac = hashKey(key);
  let rec = users[hmac];
  if (!rec) {
    const leg = legacyHashKey(key);
    if (users[leg]) {
      rec = users[leg];
      users[hmac] = rec;
      delete users[leg];
      saveJson('users.json', users, 0o600);
    }
  }
  if (!rec || rec.disabled) return null;
  return rec.userId;
}

function getOrCreateAdminKey() {
  if (process.env.TERM_ADMIN_KEY) return process.env.TERM_ADMIN_KEY;
  const cur = loadJson('admin.json', null);
  if (cur && cur.adminKey) return cur.adminKey;
  const adminKey = 'adm_' + crypto.randomBytes(16).toString('hex');
  saveJson('admin.json', { adminKey, updatedAt: Date.now() }, 0o600);
  return adminKey;
}

function setAdminKey(newKey) {
  const adminKey = String(newKey || '').trim();
  if (adminKey.length < 8) throw new Error('Admin key must be at least 8 characters.');
  saveJson('admin.json', { adminKey, updatedAt: Date.now() }, 0o600);
  return adminKey;
}

function listUsers() {
  const users = loadJson('users.json', {});
  return Object.entries(users).map(([keyHash, rec]) => ({
    keyHash: keyHash.slice(0, 12),
    userId: rec.userId,
    createdAt: rec.createdAt || 0,
    disabled: !!rec.disabled,
  }));
}

function setUserDisabled(userId, disabled) {
  const users = loadJson('users.json', {});
  let changed = false;
  for (const k of Object.keys(users)) {
    if (users[k].userId === userId) {
      users[k].disabled = !!disabled;
      changed = true;
    }
  }
  if (changed) saveJson('users.json', users, 0o600);
  return changed;
}

function deleteUser(userId) {
  const users = loadJson('users.json', {});
  let changed = false;
  for (const k of Object.keys(users)) {
    if (users[k].userId === userId) {
      delete users[k];
      changed = true;
    }
  }
  if (changed) saveJson('users.json', users, 0o600);
  const safeId = String(userId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  if (safeId && safeId !== 'default') {
    const dir = path.join(DATA_DIR, 'users', safeId);
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
  const shares = loadJson('shares.json', []);
  const nextShares = shares.filter((s) => s.ownerId !== userId && s.targetId !== userId);
  if (nextShares.length !== shares.length) saveJson('shares.json', nextShares, 0o600);
  const mcpMap = loadJson('mcp_tokens.json', {});
  let mcpChanged = false;
  for (const [tok, rec] of Object.entries(mcpMap)) {
    if (rec && rec.userId === userId) {
      delete mcpMap[tok];
      mcpChanged = true;
    }
  }
  if (mcpChanged) saveJson('mcp_tokens.json', mcpMap, 0o600);
  return changed;
}

function isValidUserId(userId) {
  if (!userId || typeof userId !== 'string') return false;
  if (userId === 'default') return true;
  return /^[a-f0-9]{16}$/.test(userId);
}

function userExists(userId) {
  if (!isValidUserId(userId)) return false;
  if (userId === 'default') return true;
  const users = loadJson('users.json', {});
  return Object.values(users).some((rec) => rec.userId === userId && !rec.disabled);
}

function forUser(userId) {
  if (!isValidUserId(userId)) {
    throw new Error('Invalid user identifier');
  }
  const dir = userId === 'default' ? DATA_DIR : path.resolve(DATA_DIR, 'users', userId);
  if (userId !== 'default' && !dir.startsWith(path.resolve(DATA_DIR, 'users') + path.sep)) {
    throw new Error('Invalid user directory');
  }
  return {
    DATA_DIR: dir,
    loadHosts: () => loadJson('hosts.json', [], dir),
    saveHosts: (v) => saveJson('hosts.json', v, 0o600, dir),
    loadSnippets: () => loadJson('snippets.json', [], dir),
    saveSnippets: (v) => saveJson('snippets.json', v, 0o600, dir),
    loadSettings: () => ({ ...DEFAULT_SETTINGS, ...loadJson('settings.json', {}, dir) }),
    saveSettings: (v) => saveJson('settings.json', v, 0o600, dir),
    loadKnownHosts: () => loadJson('known_hosts.json', [], dir),
    saveKnownHosts: (v) => saveJson('known_hosts.json', v, 0o600, dir),
    loadSecrets: () => loadJson('secrets.json', {}, dir),
    saveSecrets: (v) => saveJson('secrets.json', v, 0o600, dir),
    loadVpn: () => loadJson('vpn.json', { mode: 'default', socksHost: '127.0.0.1', socksPort: 1080, socksUser: '', socksPass: '' }, dir),
    saveVpn: (v) => saveJson('vpn.json', v, 0o600, dir),
    fingerprintB64,
  };
}

function getGlobalPolicy() {
  return { vpnEnabled: true, allowWithoutVpn: false, ...loadJson('policy.json', {}) };
}

function saveGlobalPolicy(patch) {
  const next = { ...getGlobalPolicy(), ...(patch || {}) };
  saveJson('policy.json', next, 0o600);
  return next;
}

function listMcpTokens(userId) {
  const uid = userId || 'default';
  const map = loadJson('mcp_tokens.json', {});
  const out = [];
  for (const [tok, rec] of Object.entries(map)) {
    if (rec.userId === uid) {
      out.push({
        id: rec.id || tok.slice(0, 12),
        token: tok,
        label: rec.label || 'Default MCP',
        createdAt: rec.createdAt || 0,
        lastUsedAt: rec.lastUsedAt || 0,
        lastIp: rec.lastIp || '',
        lastClient: rec.lastClient || '',
        calls: rec.calls || 0,
      });
    }
  }
  if (!out.length) {
    const created = createMcpToken(uid, 'Default MCP');
    out.push(created);
  }
  return out.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}

function createMcpToken(userId, label = 'MCP Link') {
  const uid = userId || 'default';
  const map = loadJson('mcp_tokens.json', {});
  const tok = 'mcp_' + crypto.randomBytes(16).toString('hex');
  const id = crypto.randomBytes(6).toString('hex');
  const cleanLabel = String(label || 'MCP Link').trim().slice(0, 40) || 'MCP Link';
  const rec = { id, userId: uid, label: cleanLabel, createdAt: Date.now(), lastUsedAt: 0, lastIp: '', lastClient: '', calls: 0 };
  map[tok] = rec;
  saveJson('mcp_tokens.json', map, 0o600);
  return { ...rec, token: tok };
}

function deleteMcpToken(userId, idOrToken) {
  const uid = userId || 'default';
  const map = loadJson('mcp_tokens.json', {});
  let removedToken = null;
  for (const [tok, rec] of Object.entries(map)) {
    if (rec.userId === uid && (safeStrEqual(tok, idOrToken) || rec.id === idOrToken || tok.slice(0, 12) === idOrToken)) {
      removedToken = tok;
      delete map[tok];
    }
  }
  if (removedToken) saveJson('mcp_tokens.json', map, 0o600);
  return removedToken;
}

let mcpFlushTimer = null;
const pendingMcpUpdates = new Map();

function flushMcpActivity() {
  mcpFlushTimer = null;
  if (!pendingMcpUpdates.size) return;
  const map = loadJson('mcp_tokens.json', {});
  let dirty = false;
  for (const [tok, upd] of pendingMcpUpdates.entries()) {
    const rec = map[tok];
    if (rec) {
      rec.lastUsedAt = upd.lastUsedAt;
      if (upd.lastIp) rec.lastIp = upd.lastIp;
      if (upd.lastClient) rec.lastClient = upd.lastClient;
      rec.calls = (rec.calls || 0) + upd.calls;
      dirty = true;
    }
  }
  pendingMcpUpdates.clear();
  if (dirty) saveJson('mcp_tokens.json', map, 0o600);
}

function recordMcpActivity(tok, ip = '', client = '') {
  if (!tok || typeof tok !== 'string' || !tok.startsWith('mcp_')) return;
  const prev = pendingMcpUpdates.get(tok) || { calls: 0, lastUsedAt: 0, lastIp: '', lastClient: '' };
  prev.calls += 1;
  prev.lastUsedAt = Date.now();
  if (ip) prev.lastIp = String(ip).slice(0, 64);
  if (client) prev.lastClient = String(client).slice(0, 80);
  pendingMcpUpdates.set(tok, prev);
  if (!mcpFlushTimer) {
    mcpFlushTimer = setTimeout(flushMcpActivity, 4000);
    mcpFlushTimer.unref?.();
  }
}

function getOrCreateMcpToken(userId) {
  return listMcpTokens(userId)[0].token;
}

function rotateMcpToken(userId) {
  const uid = userId || 'default';
  const map = loadJson('mcp_tokens.json', {});
  for (const [tok, rec] of Object.entries(map)) {
    if (rec.userId === uid) delete map[tok];
  }
  saveJson('mcp_tokens.json', map, 0o600);
  return createMcpToken(uid, 'Default MCP').token;
}

function findUserByMcpToken(tok) {
  if (!tok || typeof tok !== 'string' || !tok.startsWith('mcp_') || tok.length > 128) return null;
  const map = loadJson('mcp_tokens.json', {});
  for (const [k, rec] of Object.entries(map)) {
    if (safeStrEqual(k, tok)) {
      if (!userExists(rec.userId)) return null;
      return rec.userId;
    }
  }
  return null;
}

const DEFAULT_SHARE_PERMISSIONS = {
  terminal: true,
  files_read: true,
  files_write: false,
  docker: false,
  vnc: false,
  edit_host: false,
  show_address: false,
  sudo: false,
};

function normalizePermissions(perms) {
  const p = perms && typeof perms === 'object' ? perms : {};
  const sudo = p.sudo !== undefined ? !!p.sudo : DEFAULT_SHARE_PERMISSIONS.sudo;
  if (sudo) {
    return {
      terminal: true,
      files_read: true,
      files_write: true,
      docker: true,
      vnc: true,
      edit_host: true,
      show_address: true,
      sudo: true,
    };
  }
  const files_write = p.files_write !== undefined ? !!p.files_write : DEFAULT_SHARE_PERMISSIONS.files_write;
  const files_read = files_write ? true : (p.files_read !== undefined ? !!p.files_read : DEFAULT_SHARE_PERMISSIONS.files_read);
  const edit_host = p.edit_host !== undefined ? !!p.edit_host : DEFAULT_SHARE_PERMISSIONS.edit_host;
  const show_address = edit_host ? true : (p.show_address !== undefined ? !!p.show_address : DEFAULT_SHARE_PERMISSIONS.show_address);
  return {
    terminal: p.terminal !== undefined ? !!p.terminal : DEFAULT_SHARE_PERMISSIONS.terminal,
    files_read,
    files_write,
    docker: p.docker !== undefined ? !!p.docker : DEFAULT_SHARE_PERMISSIONS.docker,
    vnc: p.vnc !== undefined ? !!p.vnc : DEFAULT_SHARE_PERMISSIONS.vnc,
    edit_host,
    show_address,
    sudo: false,
  };
}

function listSharesByOwner(ownerId) {
  const uid = ownerId || 'default';
  const shares = loadJson('shares.json', []);
  return shares.filter((s) => s.ownerId === uid);
}

function listSharesForTarget(targetId) {
  const uid = targetId || 'default';
  const shares = loadJson('shares.json', []);
  return shares.filter((s) => s.targetId === uid);
}

function listPendingInvitesForTarget(targetId) {
  return listSharesForTarget(targetId).filter((s) => (s.status || 'accepted') === 'pending');
}

function listAcceptedSharesForTarget(targetId) {
  return listSharesForTarget(targetId).filter((s) => (s.status || 'accepted') === 'accepted');
}

function leaveShare(targetId, shareId) {
  const uid = targetId || 'default';
  const shares = loadJson('shares.json', []);
  const removed = shares.find((s) => (s.id === shareId || s.ownerId === shareId) && s.targetId === uid) || null;
  if (!removed) return null;
  const next = shares.filter((s) => !((s.id === shareId || s.ownerId === shareId) && s.targetId === uid));
  saveJson('shares.json', next, 0o600);
  return removed;
}

function upsertShare(ownerId, { id, targetId, hostIds, permissions }) {
  const owner = ownerId || 'default';
  const target = String(targetId || '').trim();
  if (!target) throw new Error('Target user ID is required.');
  if (target === owner) throw new Error('Cannot share servers with yourself.');
  if (!userExists(target)) throw new Error('Target user ID not found.');
  const ownerHosts = forUser(owner).loadHosts();
  const validHostIds = new Set(ownerHosts.map((h) => h.id));
  const cleanHostIds = Array.from(new Set((Array.isArray(hostIds) ? hostIds : []).filter((hid) => validHostIds.has(hid))));
  const cleanPerms = normalizePermissions(permissions);
  const shares = loadJson('shares.json', []);
  const now = Date.now();
  let rec = id ? shares.find((s) => s.id === id && s.ownerId === owner) : null;
  if (!rec) rec = shares.find((s) => s.ownerId === owner && s.targetId === target);
  if (rec) {
    rec.targetId = target;
    rec.hostIds = cleanHostIds;
    rec.permissions = cleanPerms;
    if (rec.status === 'declined') rec.status = 'pending';
    else if (!rec.status) rec.status = 'pending';
    rec.updatedAt = now;
  } else {
    rec = {
      id: 'sh_' + crypto.randomBytes(6).toString('hex'),
      ownerId: owner,
      targetId: target,
      hostIds: cleanHostIds,
      permissions: cleanPerms,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    shares.push(rec);
  }
  saveJson('shares.json', shares, 0o600);
  return rec;
}

function respondToShare(targetId, shareId, accept) {
  const uid = targetId || 'default';
  const shares = loadJson('shares.json', []);
  const rec = shares.find((s) => (s.id === shareId || s.ownerId === shareId) && s.targetId === uid);
  if (!rec) return null;
  rec.status = accept ? 'accepted' : 'declined';
  rec.updatedAt = Date.now();
  saveJson('shares.json', shares, 0o600);
  return rec;
}

function deleteShare(ownerId, shareId) {
  const owner = ownerId || 'default';
  const shares = loadJson('shares.json', []);
  const removed = shares.find((s) => (s.id === shareId || s.targetId === shareId) && s.ownerId === owner) || null;
  if (!removed) return null;
  const next = shares.filter((s) => !((s.id === shareId || s.targetId === shareId) && s.ownerId === owner));
  saveJson('shares.json', next, 0o600);
  return removed;
}

function resolveSharedHost(targetUserId, rawHostId, ownerId = '') {
  const uid = targetUserId || 'default';
  const shares = listSharesForTarget(uid);
  for (const s of shares) {
    if ((s.status || 'accepted') !== 'accepted') continue;
    if (ownerId && s.ownerId !== ownerId) continue;
    if (!userExists(s.ownerId)) continue;
    if (!Array.isArray(s.hostIds) || !s.hostIds.includes(rawHostId)) continue;
    const ownerHosts = forUser(s.ownerId).loadHosts();
    const host = ownerHosts.find((h) => h.id === rawHostId);
    if (!host) continue;
    return {
      share: s,
      ownerId: s.ownerId,
      host,
      permissions: normalizePermissions(s.permissions),
    };
  }
  return null;
}

function listSharedHostsForUser(targetUserId) {
  const uid = targetUserId || 'default';
  const shares = listSharesForTarget(uid);
  const out = [];
  const seen = new Set();
  for (const s of shares) {
    if ((s.status || 'accepted') !== 'accepted') continue;
    if (!userExists(s.ownerId)) continue;
    const ownerHosts = forUser(s.ownerId).loadHosts();
    const hostMap = new Map(ownerHosts.map((h) => [h.id, h]));
    const perms = normalizePermissions(s.permissions);
    for (const hid of s.hostIds || []) {
      const h = hostMap.get(hid);
      if (!h) continue;
      const vid = `sh:${s.ownerId}:${h.id}`;
      if (seen.has(vid)) continue;
      seen.add(vid);
      const showAddr = !!perms.show_address;
      out.push({
        id: vid,
        rawHostId: h.id,
        name: h.name || (showAddr ? h.host : 'Shared Server'),
        host: showAddr ? h.host : '',
        port: showAddr ? (h.port || 22) : 0,
        user: showAddr ? h.user : '',
        auth: h.auth || 'password',
        color: h.color,
        group: `Shared (${s.ownerId})`,
        note: h.note || '',
        shared: true,
        showAddress: showAddr,
        shareId: s.id,
        ownerId: s.ownerId,
        permissions: perms,
      });
    }
  }
  return out;
}

module.exports = {
  DATA_DIR,
  registerUser,
  findUserByKey,
  userExists,
  getOrCreateAdminKey,
  setAdminKey,
  listUsers,
  setUserDisabled,
  deleteUser,
  getGlobalPolicy,
  saveGlobalPolicy,
  listMcpTokens,
  createMcpToken,
  deleteMcpToken,
  recordMcpActivity,
  getOrCreateMcpToken,
  rotateMcpToken,
  findUserByMcpToken,
  DEFAULT_SHARE_PERMISSIONS,
  normalizePermissions,
  listSharesByOwner,
  listSharesForTarget,
  listPendingInvitesForTarget,
  listAcceptedSharesForTarget,
  upsertShare,
  respondToShare,
  leaveShare,
  deleteShare,
  resolveSharedHost,
  listSharedHostsForUser,
  forUser,
  ...forUser('default'),
};
