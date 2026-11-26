const crypto = require('crypto');
const { Client: SshClient } = require('ssh2');
const store = require('./store');
const vpnMgr = require('./vpn_mgr');
const dockerMgr = require('./docker_mgr');

const TOOLS = [
  {
    name: 'servers',
    description: 'Manage SSH servers.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['list', 'connect', 'disconnect', 'add', 'update', 'delete'] },
        server_id: { type: 'string' },
        name: { type: 'string' },
        host: { type: 'string' },
        port: { type: 'number' },
        user: { type: 'string' },
        password: { type: 'string' },
        opts: { type: 'object', description: 'auth,private_key,group,note' },
      },
      required: ['action'],
    },
  },
  {
    name: 'exec',
    description: 'Run shell cmd(s) on server.',
    inputSchema: {
      type: 'object',
      properties: {
        server_id: { type: 'string' },
        command: { type: 'string' },
        commands: { type: 'array', items: { type: 'string' } },
        cwd: { type: 'string' },
        sudo: { type: 'boolean' },
      },
      required: ['server_id'],
    },
  },
  {
    name: 'files',
    description: 'SFTP ops: list(+pattern), search(grep), read(path/paths[]), write, create, edit(old_text->new_text/append), delete, rename.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['list', 'search', 'read', 'write', 'create', 'edit', 'delete', 'rename'] },
        server_id: { type: 'string' },
        path: { type: 'string' },
        paths: { type: 'array', items: { type: 'string' } },
        pattern: { type: 'string' },
        new_path: { type: 'string' },
        content: { type: 'string' },
        old_text: { type: 'string' },
        new_text: { type: 'string' },
        opts: { type: 'object', description: 'type,append,recursive,details,start_line,end_line,force' },
      },
      required: ['action', 'server_id'],
    },
  },
  {
    name: 'docker',
    description: 'Docker ops.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['list', 'start', 'stop', 'restart'] },
        server_id: { type: 'string' },
        container_id: { type: 'string' },
        full: { type: 'boolean' },
      },
      required: ['action', 'server_id'],
    },
  },
  {
    name: 'shares',
    description: 'Server sharing.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['my_id', 'list', 'create', 'respond', 'revoke', 'leave'] },
        data: { type: 'object', description: 'target_user_id,server_ids,permissions,share_id,decision' },
      },
      required: ['action'],
    },
  },
];

function findServer(userId, uStore, serverIdOrName) {
  const q = String(serverIdOrName || '').trim();
  const hosts = uStore.loadHosts();
  const own = hosts.find((x) => x.id === q || (x.name || '').toLowerCase() === q.toLowerCase() || (x.host || '').toLowerCase() === q.toLowerCase());
  if (own) return { profile: own, targetUid: userId, targetStore: uStore, shared: null };
  const sharedList = store.listSharedHostsForUser(userId);
  const sh = sharedList.find((x) =>
    x.id === q ||
    x.rawHostId === q ||
    (x.name || '').toLowerCase() === q.toLowerCase() ||
    (x.showAddress && (x.host || '').toLowerCase() === q.toLowerCase())
  );
  if (sh) {
    const resolved = store.resolveSharedHost(userId, sh.rawHostId, sh.ownerId);
    if (resolved) {
      return {
        profile: resolved.host,
        targetUid: resolved.ownerId,
        targetStore: store.forUser(resolved.ownerId),
        shared: { ownerId: resolved.ownerId, hostId: resolved.host.id, permissions: resolved.permissions },
      };
    }
  }
  throw new Error(`Server not found: ${q}`);
}

async function openMcpSsh(userId, uStore, profile, depth = 0) {
  if (depth > 3) throw new Error('Jump host chain too deep.');
  const hostStr = String(profile.host || '').trim();
  const portNum = Number(profile.port) || 22;
  const safeTargetIp = await vpnMgr.resolveAndValidateTarget(hostStr, portNum);
  const secrets = uStore.loadSecrets();
  const pid = profile.id || '';
  const password = (pid && secrets[pid]?.password) || '';
  const privateKey = (pid && secrets[pid]?.privateKey) || '';
  const passphrase = (pid && secrets[pid]?.passphrase) || '';
  const proxyPass = (pid && secrets[pid]?.proxy_pass) || '';

  let sockStream;
  if (profile.jump_id) {
    const jh = uStore.loadHosts().find((x) => x.id === profile.jump_id);
    if (!jh) throw new Error('Jump host not found.');
    const jConn = await openMcpSsh(userId, uStore, jh, depth + 1);
    sockStream = await new Promise((res, rej) => {
      jConn.forwardOut('127.0.0.1', 0, safeTargetIp, portNum, (e, s) => {
        if (e) { try { jConn.end(); } catch {} return rej(e); }
        s.on('close', () => { try { jConn.end(); } catch {} });
        res(s);
      });
    });
  } else {
    const vpnCfg = profile.proxy_mode === 'socks5' && profile.proxy_host
      ? {
          mode: 'socks5',
          socksHost: String(profile.proxy_host).trim(),
          socksPort: Number(profile.proxy_port) || 1080,
          socksUser: profile.proxy_user || '',
          socksPass: proxyPass,
        }
      : { mode: 'default' };
    sockStream = await vpnMgr.connectThroughVpn(userId, uStore, store.DATA_DIR, vpnCfg, safeTargetIp, portNum, store.getGlobalPolicy());
  }

  const conn = new SshClient();
  const khName = portNum === 22 ? hostStr : `[${hostStr}]:${portNum}`;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { try { conn.end(); } catch {} reject(new Error('SSH connect timed out')); }, 25000);
    conn.on('ready', () => {
      clearTimeout(timer);
      conn._sock?.setNoDelay?.(true);
      resolve();
    });
    conn.on('error', (e) => { clearTimeout(timer); reject(e); });
    conn.on('keyboard-interactive', (n, i, l, prompts, finish) => finish(prompts.map(() => password)));
    const keepaliveSec = Math.max(5, Number(profile.keepalive) || 20);
    const cfg = {
      host: safeTargetIp,
      port: portNum,
      username: profile.user || 'root',
      tryKeyboard: true,
      readyTimeout: 25000,
      keepaliveInterval: keepaliveSec * 1000,
      keepaliveCountMax: 3,
      hostVerifier: (keyBuf, cb) => {
        const b64 = keyBuf.toString('base64');
        const fp = uStore.fingerprintB64(b64);
        const kh = uStore.loadKnownHosts();
        const same = kh.filter((e) => e.host === khName);
        if (same.some((e) => e.key === b64)) return cb(true);
        if (same.length === 0) {
          kh.push({ host: khName, ktype: 'ssh-key', key: b64, fp });
          uStore.saveKnownHosts(kh);
          return cb(true);
        }
        return cb(false);
      },
    };
    if (sockStream) cfg.sock = sockStream;
    if (profile.auth === 'key' && privateKey) {
      cfg.privateKey = privateKey;
      if (passphrase) cfg.passphrase = passphrase;
    } else if (profile.auth === 'agent') {
      if (userId !== 'default' || !['1', 'true'].includes((process.env.TERM_ALLOW_SSH_AGENT || '').toLowerCase())) {
        clearTimeout(timer);
        return reject(new Error('SSH agent authentication is disabled on this server.'));
      }
      cfg.agent = process.env.SSH_AUTH_SOCK;
    } else {
      cfg.password = password;
    }
    conn.connect(cfg);
  });
  return conn;
}

function execViaShell(conn, cmd, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomBytes(6).toString('hex');
    const startMark = `__TRM_S_${id}__`;
    const endMark = `__TRM_E_${id}__`;
    conn.shell({ term: 'xterm', rows: 24, cols: 200 }, (err, stream) => {
      if (err) return reject(err);
      let buf = '';
      let sent = false;
      let enterSent = false;
      let anyKeySent = false;
      let sawCountdown = false;
      let settled = false;
      let countdownTimer = null;
      const done = (res) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        clearTimeout(fallbackTimer);
        clearTimeout(countdownTimer);
        try { stream.close(); } catch {}
        resolve(res);
      };
      const timer = setTimeout(() => {
        done({ out: dockerMgr.stripAnsi(buf).trim(), err: 'Shell command timed out', code: 124 });
      }, Math.max(timeoutMs, 100000));
      const sendCmd = () => {
        if (sent || settled) return;
        sent = true;
        clearTimeout(fallbackTimer);
        clearTimeout(countdownTimer);
        const payload = `printf '\\n%s\\n' '${startMark}'; ${cmd}; printf '\\n%s:%d\\n' '${endMark}' "$?"\n`;
        stream.write(payload);
      };
      const fallbackTimer = setTimeout(() => {
        if (!sawCountdown) sendCmd();
      }, 2500);
      stream.on('data', (d) => {
        buf += d.toString('utf8');
        const clean = dockerMgr.stripAnsi(buf).replace(/\r/g, '');
        if (!enterSent && /Press ENTER to continue/i.test(clean)) {
          enterSent = true;
          try { stream.write('\n'); } catch {}
        }
        if (!anyKeySent && /Press any key to continue/i.test(clean)) {
          anyKeySent = true;
          try { stream.write('\n'); } catch {}
        }
        if (!sawCountdown && /Continuing in \d+ sec/i.test(clean)) {
          sawCountdown = true;
          clearTimeout(fallbackTimer);
          countdownTimer = setTimeout(sendCmd, 65000);
        }
        if (!sent && /(?:└─#|root@[^\n]*[#$])\s*$/.test(clean)) {
          setTimeout(sendCmd, 200);
        }
        const endRe = new RegExp(`\\n${endMark}:(\\d+)\\s*\\n?`);
        const mEnd = clean.match(endRe);
        if (mEnd) {
          const sIdx = clean.lastIndexOf(`\n${startMark}\n`);
          const out = sIdx !== -1 ? clean.slice(sIdx + startMark.length + 2, mEnd.index).trim() : clean.slice(0, mEnd.index).trim();
          done({ out, err: '', code: parseInt(mEnd[1], 10) || 0 });
        }
      });
      stream.on('close', () => {
        if (!settled) done({ out: dockerMgr.stripAnsi(buf).trim(), err: '', code: 0 });
      });
      stream.on('error', (e) => {
        if (!settled) { clearTimeout(timer); clearTimeout(fallbackTimer); settled = true; reject(e); }
      });
    });
  });
}

const mcpPersistentConns = new Map();
const MCP_CONN_IDLE_MS = 10 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [k, rec] of mcpPersistentConns.entries()) {
    if (!isConnHealthy(rec.conn) || now - (rec.lastUsedAt || 0) > MCP_CONN_IDLE_MS) {
      closePersistentConn(k);
    }
  }
}, 60 * 1000).unref?.();

function getPersistentKey(userId, found) {
  return found.shared
    ? `${userId}:sh:${found.shared.ownerId}:${found.shared.hostId}`
    : `${userId}:${found.profile.id}`;
}

function closePersistentConn(key) {
  const rec = mcpPersistentConns.get(key);
  if (rec) {
    mcpPersistentConns.delete(key);
    try { if (rec.sftp) rec.sftp.end(); } catch {}
    try { rec.conn.end(); } catch {}
  }
}

function closeUserConns(uid) {
  if (!uid) return;
  for (const [k, rec] of Array.from(mcpPersistentConns.entries())) {
    if (rec.userId === uid || k.startsWith(`${uid}:`) || k.includes(`:sh:${uid}:`)) {
      closePersistentConn(k);
    }
  }
}

function closeSharedConns(ownerId, targetId) {
  if (!ownerId || !targetId) return;
  const prefix = `${targetId}:sh:${ownerId}:`;
  for (const k of Array.from(mcpPersistentConns.keys())) {
    if (k.startsWith(prefix)) closePersistentConn(k);
  }
}

function closeAllConns() {
  for (const k of Array.from(mcpPersistentConns.keys())) {
    closePersistentConn(k);
  }
  sessionOutputHashes.clear();
}

function execSudoCmd(conn, pw, cmd, timeoutMs = 20000, maxBytes = 8 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const full = pw ? `sudo -S -p '' sh -c ${dockerMgr.quote(cmd)}` : `sudo -n sh -c ${dockerMgr.quote(cmd)}`;
    conn.exec(full, (err, stream) => {
      if (err) return reject(err);
      const outChunks = [];
      const errChunks = [];
      let bytes = 0;
      let errBytes = 0;
      let settled = false;
      const done = (res) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(res);
      };
      const timer = setTimeout(() => {
        try { stream.close(); } catch {}
        done({
          out: Buffer.concat(outChunks).toString('utf8'),
          err: Buffer.concat(errChunks).toString('utf8') || 'Command timed out',
          code: 124,
        });
      }, timeoutMs);
      if (pw) {
        stream.write(pw + '\n');
        stream.end();
      }
      stream.on('data', (d) => {
        if (bytes < maxBytes) {
          const slice = bytes + d.length > maxBytes ? d.subarray(0, maxBytes - bytes) : d;
          outChunks.push(slice);
          bytes += slice.length;
        }
      });
      stream.stderr.on('data', (d) => {
        if (errBytes < 262144) {
          const slice = errBytes + d.length > 262144 ? d.subarray(0, 262144 - errBytes) : d;
          errChunks.push(slice);
          errBytes += slice.length;
        }
      });
      stream.on('close', (code) => done({
        out: Buffer.concat(outChunks).toString('utf8'),
        err: Buffer.concat(errChunks).toString('utf8'),
        code: code ?? 0,
      }));
    });
  });
}

function getPooledSftp(conn, pRec, cb) {
  if (pRec && pRec.sftp) {
    return cb(null, pRec.sftp, false);
  }
  conn.sftp((err, sftp) => {
    if (err) return cb(err);
    if (pRec) {
      pRec.sftp = sftp;
      sftp.on('close', () => { if (pRec.sftp === sftp) pRec.sftp = null; });
      sftp.on('error', () => { if (pRec.sftp === sftp) pRec.sftp = null; });
      return cb(null, sftp, false);
    }
    return cb(null, sftp, true);
  });
}

function isConnHealthy(conn) {
  if (!conn) return false;
  if (conn._sock && (conn._sock.destroyed || conn._sock.writable === false)) return false;
  return true;
}

function isTransientSshErr(err) {
  const msg = String(err?.message || err || '').toLowerCase();
  return /not connected|timed out|timeout|econnreset|epipe|etimedout|socket|channel open failure|closed|ended/.test(msg);
}

async function openMcpSshWithRetry(userId, uStore, profile) {
  try {
    return await openMcpSsh(userId, uStore, profile);
  } catch (e) {
    if (!isTransientSshErr(e)) throw e;
    return openMcpSsh(userId, uStore, profile);
  }
}

async function withSsh(userId, serverId, reqPerm, fn, getActiveSessions) {
  const q = String(serverId || '').trim();
  const active = typeof getActiveSessions === 'function' ? getActiveSessions(userId) : [];
  const live = active.find((a) =>
    a.sid === q ||
    a.sess?.profile?.id === q ||
    (a.sess?.shared && (a.sess.shared.hostId === q || `sh:${a.sess.shared.ownerId}:${a.sess.shared.hostId}` === q)) ||
    (a.sess?.profile?.name || '').toLowerCase() === q.toLowerCase() ||
    ((!a.sess?.shared || a.sess.shared.permissions?.show_address) && (a.sess?.profile?.host || '').toLowerCase() === q.toLowerCase())
  );
  if (live && isConnHealthy(live.sess?.conn)) {
    let liveShared = null;
    if (live.sess.shared) {
      const check = store.resolveSharedHost(userId, live.sess.shared.hostId, live.sess.shared.ownerId);
      if (!check) throw new Error('Shared server access revoked or not accepted.');
      if (reqPerm && !check.permissions[reqPerm]) throw new Error(`Permission denied: ${reqPerm}`);
      liveShared = { ...live.sess.shared, permissions: check.permissions };
    }
    try {
      return await fn(live.sess.conn, live.sess.profile, live.sess, live.sess.shared ? store.forUser(live.sess.shared.ownerId) : store.forUser(userId), liveShared);
    } catch (e) {
      if (!isTransientSshErr(e)) throw e;
    }
  }
  const uStore = store.forUser(userId);
  const found = findServer(userId, uStore, serverId);
  if (found.shared && reqPerm && !found.shared.permissions[reqPerm]) {
    throw new Error(`Permission denied: ${reqPerm}`);
  }
  const pKey = getPersistentKey(userId, found);
  let pRec = mcpPersistentConns.get(pKey);
  if (pRec && isConnHealthy(pRec.conn)) {
    pRec.lastUsedAt = Date.now();
    try {
      return await fn(pRec.conn, found.profile, pRec, found.targetStore, found.shared);
    } catch (e) {
      closePersistentConn(pKey);
      if (!isTransientSshErr(e)) throw e;
    }
  } else if (pRec) {
    closePersistentConn(pKey);
  }
  const conn = await openMcpSshWithRetry(found.targetUid, found.targetStore, found.profile);
  pRec = {
    conn,
    sftp: null,
    userId,
    hostId: found.profile.id,
    connectedAt: Date.now(),
    lastUsedAt: Date.now(),
  };
  conn.on('close', () => mcpPersistentConns.delete(pKey));
  conn.on('end', () => mcpPersistentConns.delete(pKey));
  conn.on('error', () => mcpPersistentConns.delete(pKey));
  mcpPersistentConns.set(pKey, pRec);
  return await fn(conn, found.profile, pRec, found.targetStore, found.shared);
}

const TOOL_PERMISSION_MAP = {
  connect_server: 'connect',
  disconnect_server: 'connect',
  add_server: 'hosts_add',
  create_server: 'hosts_add',
  update_server: 'hosts_edit',
  edit_server: 'hosts_edit',
  delete_server: 'hosts_delete',
  remove_server: 'hosts_delete',
  ssh_exec: 'exec',
  sftp_list: 'files_read',
  sftp_search: 'files_read',
  sftp_read: 'files_read',
  sftp_write: 'files_write',
  sftp_create: 'files_write',
  sftp_mkdir: 'files_write',
  sftp_edit: 'files_write',
  sftp_rename: 'files_write',
  sftp_delete: 'files_delete',
  docker_list: 'docker',
  docker_action: 'docker',
  share_list: 'share',
  share_create: 'share',
  share_invite: 'share',
  share_update: 'share',
  share_respond: 'share',
  share_revoke: 'share',
  share_remove: 'share',
  share_delete: 'share',
  share_leave: 'share',
};

function sftpReadBuffer(sftp, filePath, maxBytes = 512 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    const rs = sftp.createReadStream(filePath);
    rs.on('data', (c) => {
      total += c.length;
      if (total > maxBytes) {
        try { rs.destroy(); } catch {}
        return reject(new Error(`File exceeds ${Math.round(maxBytes / 1024)} KB limit`));
      }
      chunks.push(c);
    });
    rs.on('error', reject);
    rs.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

function sftpWriteBuffer(sftp, filePath, buf) {
  return new Promise((resolve, reject) => {
    const ws = sftp.createWriteStream(filePath);
    ws.on('error', reject);
    ws.on('close', () => resolve({ ok: true, path: filePath, bytes: buf.length }));
    ws.end(buf);
  });
}

function cleanTerminalNoise(str) {
  if (!str) return '';
  let s = String(str)
    .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')
    .replace(/\x1b[()][AB012]/g, '');
  s = dockerMgr.stripAnsi(s);
  s = s.replace(/[^\n]*\r(?!\n)/g, '').replace(/\r/g, '');
  const rawLines = s.split('\n');
  const out = [];
  let prevLine = null;
  let repeatCount = 0;
  let blankRun = 0;
  const flushRepeat = () => {
    if (repeatCount > 1) {
      out[out.length - 1] = `${prevLine} [x${repeatCount}]`;
    }
    repeatCount = 0;
  };
  for (const rawLine of rawLines) {
    const line = rawLine.replace(/[ \t]+$/g, '').replace(/ {3,}/g, ' ');
    const t = line.trim();
    if (/^[0-9a-f]{12}:\s*(Pulling fs layer|Waiting|Downloading|Verifying Checksum|Extracting|Download complete|Pull complete|Already exists)\b/i.test(t)) continue;
    if (/^\(Reading database \.\.\. \d+%\)$/.test(t)) continue;
    if (/\b\d{1,3}%\s*\[[#=>.\- ]{4,}\]/.test(t)) continue;
    if (t === '') {
      flushRepeat();
      prevLine = null;
      blankRun++;
      if (blankRun <= 1) out.push('');
      continue;
    }
    blankRun = 0;
    if (line === prevLine) {
      repeatCount++;
    } else {
      flushRepeat();
      prevLine = line;
      repeatCount = 1;
      out.push(line);
    }
  }
  flushRepeat();
  return out.join('\n').trim();
}

function formatCompactDirList(entries, details = false) {
  if (details) {
    return entries.map((x) => {
      const isDir = ((x.attrs?.mode || 0) & 0o170000) === 0o040000 || (x.longname && x.longname.startsWith('d'));
      return isDir ? `${x.filename}/` : `${x.filename} (${x.attrs?.size || 0}B)`;
    }).join('\n');
  }
  const dirs = [];
  const files = [];
  for (const x of entries) {
    const isDir = ((x.attrs?.mode || 0) & 0o170000) === 0o040000 || (x.longname && x.longname.startsWith('d'));
    if (isDir) dirs.push(`${x.filename}/`);
    else files.push(x.filename);
  }
  if (files.length < 8) {
    return [...dirs, ...files].join(', ');
  }
  const suffixGroups = new Map();
  const ungrouped = [];
  for (const f of files) {
    const m = f.match(/(\.[a-zA-Z0-9_-]{1,12}(?:\.[a-zA-Z0-9_-]{1,8})?)$/);
    const ext = m ? m[1] : '';
    if (ext && f.length > ext.length) {
      if (!suffixGroups.has(ext)) suffixGroups.set(ext, []);
      suffixGroups.get(ext).push(f.slice(0, -ext.length));
    } else {
      ungrouped.push(f);
    }
  }
  const lines = [];
  if (dirs.length) lines.push(`dirs(${dirs.length}): ${dirs.join(', ')}`);
  for (const [ext, stems] of suffixGroups.entries()) {
    if (stems.length >= 4) {
      lines.push(`*${ext}(${stems.length}): ${stems.join(', ')}`);
    } else {
      for (const st of stems) ungrouped.push(st + ext);
    }
  }
  if (ungrouped.length) lines.push(ungrouped.join(', '));
  return lines.join('\n');
}

const sessionOutputHashes = new Map();
const SESSION_CACHE_TTL_MS = 30 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [sid, rec] of sessionOutputHashes.entries()) {
    if (now - rec.ts > SESSION_CACHE_TTL_MS) sessionOutputHashes.delete(sid);
  }
}, 5 * 60 * 1000).unref?.();

function clearSessionDedup(mcpSessionId) {
  if (mcpSessionId) sessionOutputHashes.delete(mcpSessionId);
}

function dedupSessionOutput(mcpSessionId, cacheKey, text, force = false) {
  if (!mcpSessionId || force || !text || text.length < 250) return text;
  let rec = sessionOutputHashes.get(mcpSessionId);
  if (!rec) {
    if (sessionOutputHashes.size > 200) {
      const oldest = sessionOutputHashes.keys().next().value;
      if (oldest) sessionOutputHashes.delete(oldest);
    }
    rec = { ts: Date.now(), hashes: new Map() };
    sessionOutputHashes.set(mcpSessionId, rec);
  }
  rec.ts = Date.now();
  const hash = crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
  const prev = rec.hashes.get(cacheKey);
  if (prev === hash) {
    return `[unchanged (${text.length} chars, identical to earlier output in this session); pass opts:{force:true} to resend]`;
  }
  if (rec.hashes.size > 100) {
    const oldestKey = rec.hashes.keys().next().value;
    if (oldestKey) rec.hashes.delete(oldestKey);
  }
  rec.hashes.set(cacheKey, hash);
  return text;
}

function getUserServerSummary(userId) {
  try {
    const uStore = store.forUser(userId);
    const out = [];
    for (const h of uStore.loadHosts()) {
      const label = h.name || h.host;
      if (!label) continue;
      out.push(h.host && h.host !== label ? `${label}(${h.host})` : label);
    }
    for (const h of store.listSharedHostsForUser(userId)) {
      if (!h.name) continue;
      out.push(h.showAddress && h.host ? `${h.name}(${h.host})` : h.name);
    }
    return [...new Set(out)].slice(0, 20);
  } catch {
    return [];
  }
}

function resolveUnifiedCall(name, rawArgs) {
  const base = rawArgs && typeof rawArgs === 'object' ? rawArgs : {};
  const nested = (base.opts && typeof base.opts === 'object' ? base.opts : null)
    || (base.data && typeof base.data === 'object' ? base.data : null)
    || {};
  const a = { ...nested, ...base };
  if (!a.server_id && (a.server || a.s)) a.server_id = a.server || a.s;
  if (!a.command && a.cmd) a.command = a.cmd;
  if (!a.path && (a.file_path || a.file)) a.path = a.file_path || a.file;
  if (!a.new_path && (a.dest || a.to)) a.new_path = a.dest || a.to;
  if (a.old_text === undefined && (a.old_str !== undefined || a.search !== undefined)) {
    a.old_text = a.old_str !== undefined ? a.old_str : a.search;
  }
  if (a.new_text === undefined && (a.new_str !== undefined || a.replace !== undefined)) {
    a.new_text = a.new_str !== undefined ? a.new_str : a.replace;
  }
  if (!a.pattern && a.query) a.pattern = a.query;

  if (name === 'servers') {
    const map = {
      list: 'list_servers',
      connect: 'connect_server',
      disconnect: 'disconnect_server',
      add: 'add_server',
      update: 'update_server',
      delete: 'delete_server',
    };
    return { tool: map[a.action] || 'list_servers', args: a };
  }
  if (name === 'exec') {
    return { tool: 'ssh_exec', args: a };
  }
  if (name === 'files') {
    const map = {
      list: 'sftp_list',
      search: 'sftp_search',
      read: 'sftp_read',
      write: 'sftp_write',
      create: 'sftp_create',
      edit: 'sftp_edit',
      delete: 'sftp_delete',
      rename: 'sftp_rename',
    };
    const mappedArgs = a.action === 'rename' && a.path && !a.old_path ? { ...a, old_path: a.path } : a;
    return { tool: map[a.action] || 'sftp_list', args: mappedArgs };
  }
  if (name === 'docker') {
    if (a.action === 'list') return { tool: 'docker_list', args: a };
    return { tool: 'docker_action', args: a };
  }
  if (name === 'shares') {
    const map = {
      my_id: 'get_my_user_id',
      list: 'share_list',
      create: 'share_create',
      respond: 'share_respond',
      revoke: 'share_revoke',
      leave: 'share_leave',
    };
    const mappedArgs = a.action === 'respond' && a.decision ? { ...a, action: a.decision } : a;
    return { tool: map[a.action] || 'share_list', args: mappedArgs };
  }
  return { tool: name, args: a };
}

async function callTool(userId, rawName, rawArgs = {}, getActiveSessions = null, onShareChange = null, mcpPerms = null, mcpSessionId = '') {
  const { tool: name, args } = resolveUnifiedCall(rawName, rawArgs);
  const perms = store.normalizeMcpPermissions(mcpPerms);
  const reqMcpPerm = TOOL_PERMISSION_MAP[name];
  if (reqMcpPerm && !perms[reqMcpPerm]) {
    throw new Error(`MCP token permission denied: '${reqMcpPerm}' is disabled for this MCP link.`);
  }
  const uStore = store.forUser(userId);
  switch (name) {
    case 'list_servers': {
      const active = typeof getActiveSessions === 'function' ? getActiveSessions(userId) : [];
      const connectedIds = new Set(active.map((a) => a.sess?.profile?.id).filter(Boolean));
      for (const [k, rec] of mcpPersistentConns.entries()) {
        if (k.startsWith(`${userId}:`)) connectedIds.add(rec.hostId);
      }
      const lines = [];
      for (const h of uStore.loadHosts()) {
        const port = Number(h.port) && Number(h.port) !== 22 ? `:${h.port}` : '';
        const grp = h.group ? ` [${h.group}]` : '';
        const st = connectedIds.has(h.id) ? ' *' : '';
        lines.push(`${h.name || h.host} (id:${h.id}, ${h.user || 'root'}@${h.host}${port})${grp}${st}`);
      }
      for (const h of store.listSharedHostsForUser(userId)) {
        const addr = h.showAddress ? `, ${h.user || 'root'}@${h.host}:${Number(h.port) || 22}` : '';
        const st = (connectedIds.has(h.rawHostId) || connectedIds.has(h.id)) ? ' *' : '';
        lines.push(`${h.name} (id:${h.id}${addr}, shared)${st}`);
      }
      const rawOut = lines.length ? lines.join('\n') : '(no servers)';
      return { __rawText: dedupSessionOutput(mcpSessionId, 'servers:list', rawOut, !!args.force) };
    }
    case 'get_my_user_id': {
      return { user_id: userId };
    }
    case 'share_list': {
      const ownHosts = uStore.loadHosts();
      const hostMap = new Map(ownHosts.map((h) => [h.id, h.name || h.host]));
      const sharesOut = store.listSharesByOwner(userId).map((s) => ({
        id: s.id,
        target_user_id: s.targetId,
        status: s.status || 'accepted',
        servers: (s.hostIds || []).map((hid) => ({ id: hid, name: hostMap.get(hid) || hid })),
        permissions: store.normalizePermissions(s.permissions),
        created_at: s.createdAt || 0,
        updated_at: s.updatedAt || 0,
      }));
      const pendingIn = store.listPendingInvitesForTarget(userId).map((inv) => {
        const ownerStore = store.forUser(inv.ownerId);
        const oHosts = ownerStore.loadHosts();
        const oMap = new Map(oHosts.map((h) => [h.id, h.name || 'Shared Server']));
        return {
          id: inv.id,
          owner_id: inv.ownerId,
          status: 'pending',
          servers: (inv.hostIds || []).map((hid) => ({ id: hid, name: oMap.get(hid) || 'Shared Server' })),
          permissions: store.normalizePermissions(inv.permissions),
          created_at: inv.createdAt || 0,
        };
      });
      const acceptedIn = store.listAcceptedSharesForTarget(userId).map((acc) => {
        const ownerStore = store.forUser(acc.ownerId);
        const oHosts = ownerStore.loadHosts();
        const oMap = new Map(oHosts.map((h) => [h.id, h.name || 'Shared Server']));
        return {
          id: acc.id,
          owner_id: acc.ownerId,
          status: 'accepted',
          servers: (acc.hostIds || []).map((hid) => ({ id: hid, name: oMap.get(hid) || 'Shared Server' })),
          permissions: store.normalizePermissions(acc.permissions),
          created_at: acc.createdAt || 0,
        };
      });
      return {
        my_user_id: userId,
        shares_out: sharesOut,
        pending_invitations: pendingIn,
        shared_with_me: acceptedIn,
      };
    }
    case 'share_create':
    case 'share_invite':
    case 'share_update': {
      const targetId = String(args.target_user_id || args.email || '').trim();
      if (!targetId) throw new Error('target_user_id is required');
      const rawServers = Array.isArray(args.server_ids) ? args.server_ids : (args.server_id ? [args.server_id] : []);
      if (!rawServers.length && !args.share_id && !args.member_id) throw new Error('server_ids is required');
      const ownHosts = uStore.loadHosts();
      const hostIds = [];
      for (const s of rawServers) {
        const str = String(s).trim();
        const match = ownHosts.find((h) => h.id === str || (h.name || '').toLowerCase() === str.toLowerCase());
        if (match) hostIds.push(match.id);
        else if (ownHosts.some((h) => h.id === str)) hostIds.push(str);
      }
      let perms = args.permissions;
      if (Array.isArray(perms)) {
        const pObj = {};
        for (const k of perms) {
          const cleanK = String(k).replace(/\./g, '_');
          pObj[cleanK] = true;
        }
        perms = pObj;
      }
      const rec = store.upsertShare(userId, {
        id: args.share_id || args.member_id,
        targetId,
        hostIds: hostIds.length ? hostIds : undefined,
        permissions: perms,
      });
      if (typeof onShareChange === 'function') {
        onShareChange({ type: 'create', ownerId: userId, targetId });
      }
      return { ok: true, share: rec };
    }
    case 'share_respond': {
      const shareId = String(args.share_id || '').trim();
      if (!shareId) throw new Error('share_id is required');
      const accept = args.action === 'accept' || args.accept === true;
      const rec = store.respondToShare(userId, shareId, accept);
      if (!rec) throw new Error('Invitation not found');
      if (typeof onShareChange === 'function') {
        onShareChange({ type: accept ? 'accept' : 'decline', ownerId: rec.ownerId, targetId: userId });
      }
      return { ok: true, status: rec.status, share_id: rec.id };
    }
    case 'share_revoke':
    case 'share_remove':
    case 'share_delete': {
      const shareId = String(args.share_id || args.member_id || '').trim();
      if (!shareId) throw new Error('share_id is required');
      const removed = store.deleteShare(userId, shareId);
      if (!removed) throw new Error('Share not found or not owned by you');
      closeSharedConns(userId, removed.targetId);
      if (typeof onShareChange === 'function') {
        onShareChange({ type: 'revoke', ownerId: userId, targetId: removed.targetId });
      }
      return { ok: true, message: 'Share revoked', share_id: shareId };
    }
    case 'share_leave': {
      const shareId = String(args.share_id || '').trim();
      if (!shareId) throw new Error('share_id is required');
      const removed = store.leaveShare(userId, shareId);
      if (!removed) throw new Error('Shared server access not found');
      closeSharedConns(removed.ownerId, userId);
      if (typeof onShareChange === 'function') {
        onShareChange({ type: 'leave', ownerId: removed.ownerId, targetId: userId });
      }
      return { ok: true, message: 'Left shared access', share_id: shareId };
    }
    case 'connect_server': {
      const found = findServer(userId, uStore, args.server_id);
      if (found.shared && !found.shared.permissions?.terminal) {
        throw new Error('Permission denied: terminal');
      }
      const pKey = getPersistentKey(userId, found);
      let pRec = mcpPersistentConns.get(pKey);
      let conn = pRec?.conn || null;
      if (conn && !isConnHealthy(conn)) {
        closePersistentConn(pKey);
        conn = null;
        pRec = null;
      }
      if (!conn) {
        conn = await openMcpSshWithRetry(found.targetUid, found.targetStore, found.profile);
        pRec = {
          conn,
          sftp: null,
          userId,
          hostId: found.profile.id,
          connectedAt: Date.now(),
          lastUsedAt: Date.now(),
          sysInfo: null,
        };
        conn.on('close', () => mcpPersistentConns.delete(pKey));
        conn.on('end', () => mcpPersistentConns.delete(pKey));
        conn.on('error', () => mcpPersistentConns.delete(pKey));
        mcpPersistentConns.set(pKey, pRec);
      } else {
        pRec.lastUsedAt = Date.now();
      }
      if (args.system_info && !pRec.sysInfo) {
        try {
          pRec.sysInfo = await dockerMgr.probeSys(conn);
        } catch {}
      }
      const displayName = found.profile.name || (found.shared && !found.shared.permissions?.show_address ? 'Shared Server' : found.profile.host);
      return {
        ok: true,
        connected: true,
        server_id: found.shared ? `sh:${found.shared.ownerId}:${found.shared.hostId}` : found.profile.id,
        name: displayName,
        ...(pRec.sysInfo ? { system: pRec.sysInfo } : {}),
      };
    }
    case 'disconnect_server': {
      const found = findServer(userId, uStore, args.server_id);
      const pKey = getPersistentKey(userId, found);
      const had = mcpPersistentConns.has(pKey);
      closePersistentConn(pKey);
      return {
        ok: true,
        disconnected: had,
        server_id: found.shared ? `sh:${found.shared.ownerId}:${found.shared.hostId}` : found.profile.id,
      };
    }
    case 'add_server':
    case 'create_server': {
      const hostAddr = String(args.host || '').trim();
      if (!hostAddr) throw new Error('host is required');
      const port = Math.floor(Number(args.port) || 22);
      if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port (1-65535)');
      const hosts = uStore.loadHosts();
      if (hosts.length >= 500) throw new Error('Maximum server limit (500) reached');
      const id = crypto.randomBytes(6).toString('hex');
      const safeColor = /^#[0-9a-fA-F]{6}$/.test(String(args.color || '')) ? String(args.color) : '#5b8def';
      const newHost = {
        id,
        name: String(args.name || '').trim() || hostAddr,
        host: hostAddr,
        port,
        user: String(args.user || '').trim() || 'root',
        auth: args.auth === 'key' ? 'key' : 'password',
        color: safeColor,
        group: String(args.group || '').trim(),
        tags: Array.isArray(args.tags) ? args.tags.map((t) => String(t).slice(0, 64)).slice(0, 20) : [],
        jump_id: String(args.jump_id || ''),
        startup_snippet: '',
        startup: String(args.startup || ''),
        keepalive: Math.max(5, Math.min(600, Math.floor(Number(args.keepalive) || 30))),
        note: String(args.note || ''),
        env: String(args.env || ''),
        options: String(args.options || ''),
        proxy_mode: args.proxy_mode === 'socks5' ? 'socks5' : 'none',
        proxy_host: String(args.proxy_host || '').trim(),
        proxy_port: Math.max(1, Math.min(65535, Math.floor(Number(args.proxy_port) || 1080))),
        proxy_user: String(args.proxy_user || ''),
      };
      hosts.push(newHost);
      uStore.saveHosts(hosts);
      const secrets = uStore.loadSecrets();
      secrets[id] = {
        ...(args.password ? { password: String(args.password) } : {}),
        ...(args.private_key ? { privateKey: String(args.private_key).trim() } : {}),
        ...(args.passphrase ? { passphrase: String(args.passphrase) } : {}),
        ...(args.proxy_pass ? { proxy_pass: String(args.proxy_pass) } : {}),
      };
      uStore.saveSecrets(secrets);
      if (typeof onShareChange === 'function') {
        onShareChange({ type: 'hosts_change', ownerId: userId, targetId: userId });
      }
      return { ok: true, created: true, server: newHost };
    }
    case 'update_server':
    case 'edit_server': {
      const found = findServer(userId, uStore, args.server_id);
      if (found.shared) {
        if (!found.shared.permissions?.edit_host) {
          throw new Error('Permission denied: edit_host');
        }
        const ownerStore = store.forUser(found.shared.ownerId);
        const ownerHosts = ownerStore.loadHosts();
        const nextHosts = ownerHosts.map((h) => {
          if (h.id !== found.shared.hostId) return h;
          return {
            ...h,
            ...(args.name !== undefined ? { name: String(args.name).trim() || h.name } : {}),
            ...(args.group !== undefined ? { group: String(args.group).trim() } : {}),
            ...(args.note !== undefined ? { note: String(args.note) } : {}),
          };
        });
        ownerStore.saveHosts(nextHosts);
        if (typeof onShareChange === 'function') {
          onShareChange({ type: 'update', ownerId: found.shared.ownerId, targetId: userId });
        }
        return { ok: true, server_id: found.shared.hostId, updated: true, shared: true };
      }
      const nextPort = args.port !== undefined ? Math.floor(Number(args.port)) : null;
      if (nextPort !== null && (!Number.isInteger(nextPort) || nextPort < 1 || nextPort > 65535)) {
        throw new Error('Invalid port (1-65535)');
      }
      const applyHostPatch = (h) => ({
        ...h,
        ...(args.name !== undefined ? { name: String(args.name).trim() || h.name } : {}),
        ...(args.host !== undefined ? { host: String(args.host).trim() || h.host } : {}),
        ...(nextPort !== null ? { port: nextPort } : {}),
        ...(args.user !== undefined ? { user: String(args.user).trim() || h.user || 'root' } : {}),
        ...(args.auth !== undefined && ['password', 'key'].includes(args.auth) ? { auth: args.auth } : {}),
        ...(args.color !== undefined && /^#[0-9a-fA-F]{6}$/.test(String(args.color)) ? { color: String(args.color) } : {}),
        ...(args.group !== undefined ? { group: String(args.group).trim() } : {}),
        ...(args.note !== undefined ? { note: String(args.note) } : {}),
        ...(args.env !== undefined ? { env: String(args.env) } : {}),
        ...(args.startup !== undefined ? { startup: String(args.startup) } : {}),
        ...(args.proxy_mode !== undefined ? { proxy_mode: args.proxy_mode === 'socks5' ? 'socks5' : 'none' } : {}),
        ...(args.proxy_host !== undefined ? { proxy_host: String(args.proxy_host).trim() } : {}),
        ...(args.proxy_port !== undefined ? { proxy_port: Math.max(1, Math.min(65535, Math.floor(Number(args.proxy_port) || 1080))) } : {}),
        ...(args.proxy_user !== undefined ? { proxy_user: String(args.proxy_user) } : {}),
      });
      const hosts = uStore.loadHosts();
      const prevHost = found.profile;
      const patchedHost = applyHostPatch(prevHost);
      const targetChanged = patchedHost.host !== prevHost.host || Number(patchedHost.port) !== Number(prevHost.port) || patchedHost.user !== prevHost.user;
      const nextHosts = hosts.map((h) => (h.id === prevHost.id ? patchedHost : h));
      uStore.saveHosts(nextHosts);
      const hasSecretArgs = args.password !== undefined || args.private_key !== undefined || args.passphrase !== undefined || args.proxy_pass !== undefined;
      if (targetChanged || hasSecretArgs) {
        const sec = uStore.loadSecrets();
        if (targetChanged) delete sec[prevHost.id];
        if (hasSecretArgs) {
          sec[prevHost.id] = sec[prevHost.id] || {};
          if (args.password !== undefined) sec[prevHost.id].password = String(args.password);
          if (args.private_key !== undefined) sec[prevHost.id].privateKey = String(args.private_key).trim();
          if (args.passphrase !== undefined) sec[prevHost.id].passphrase = String(args.passphrase);
          if (args.proxy_pass !== undefined) sec[prevHost.id].proxy_pass = String(args.proxy_pass);
        }
        uStore.saveSecrets(sec);
      }
      closePersistentConn(getPersistentKey(userId, found));
      if (typeof onShareChange === 'function') {
        onShareChange({ type: 'hosts_change', ownerId: userId, targetId: userId });
      }
      return { ok: true, server_id: prevHost.id, updated: true, shared: false };
    }
    case 'delete_server':
    case 'remove_server': {
      const found = findServer(userId, uStore, args.server_id);
      if (found.shared) {
        throw new Error('Cannot delete a server owned by another user. Use share_leave instead.');
      }
      const hostId = found.profile.id;
      const hosts = uStore.loadHosts().filter((h) => h.id !== hostId);
      uStore.saveHosts(hosts);
      const secrets = uStore.loadSecrets();
      if (secrets[hostId]) {
        delete secrets[hostId];
        uStore.saveSecrets(secrets);
      }
      closePersistentConn(getPersistentKey(userId, found));
      if (typeof onShareChange === 'function') {
        onShareChange({ type: 'hosts_change', ownerId: userId, targetId: userId });
      }
      return { ok: true, deleted: true, server_id: hostId, name: found.profile.name || found.profile.host };
    }
    case 'ssh_exec': {
      const cmdList = Array.isArray(args.commands) && args.commands.length
        ? args.commands.map((c) => String(c || '').trim()).filter(Boolean)
        : (args.command ? [String(args.command)] : []);
      if (!cmdList.length) throw new Error('command or commands is required');
      const timeoutMs = Math.max(1000, Math.min(60000, Number(args.timeout_ms) || 20000));
      const runOne = async (conn, profile, liveSess, targetStore, sharedMeta, rawCmd) => {
        let cmd = rawCmd;
        if (args.cwd) cmd = `cd ${dockerMgr.quote(String(args.cwd))} && ${cmd}`;
        let res;
        if (args.sudo) {
          if (sharedMeta && !sharedMeta.permissions?.sudo) {
            throw new Error('Permission denied: sudo');
          }
          const sec = targetStore ? targetStore.loadSecrets() : uStore.loadSecrets();
          const pw = (profile?.id && sec[profile.id]?.password) || '';
          res = await execSudoCmd(conn, pw, cmd, timeoutMs);
        } else {
          res = await dockerMgr.execCmd(conn, cmd, timeoutMs);
          if (res.code === 124 && /when attempting ssh remote command execution/i.test(res.err || '')) {
            res = await execViaShell(conn, cmd, timeoutMs);
          }
        }
        const out = cleanTerminalNoise(res.out || '').trimEnd();
        const err = cleanTerminalNoise(res.err || '').trimEnd();
        const code = res.code || 0;
        let text = out;
        if (err) text += (text ? '\n' : '') + `[stderr]\n${err}`;
        if (code !== 0) text += (text ? '\n' : '') + `[exit ${code}]`;
        return text || '(ok)';
      };
      return withSsh(userId, args.server_id, 'terminal', async (conn, profile, liveSess, targetStore, sharedMeta) => {
        if (cmdList.length === 1) {
          return { __rawText: await runOne(conn, profile, liveSess, targetStore, sharedMeta, cmdList[0]) };
        }
        const parts = [];
        for (const c of cmdList) {
          parts.push(`$ ${c}\n${await runOne(conn, profile, liveSess, targetStore, sharedMeta, c)}`);
        }
        return { __rawText: parts.join('\n---\n') };
      }, getActiveSessions);
    }
    case 'sftp_list': {
      const dir = String(args.path || '/');
      const pattern = String(args.pattern || '').trim().toLowerCase();
      const details = !!args.details;
      const limit = Number(args.limit) > 0 ? Math.floor(Number(args.limit)) : null;
      return withSsh(userId, args.server_id, 'files_read', (conn, _p, liveSess) => new Promise((resolve, reject) => {
        const useSftp = (sftp, closeAfter) => {
          sftp.readdir(dir, (e, list) => {
            if (closeAfter) try { sftp.end(); } catch {}
            if (e) return reject(e);
            let all = list.filter((x) => x.filename !== '.' && x.filename !== '..');
            if (pattern) {
              all = all.filter((x) => x.filename.toLowerCase().includes(pattern));
            }
            const sliced = limit ? all.slice(0, limit) : all;
            const body = formatCompactDirList(sliced, details);
            const rawOut = `${dir} (${all.length})\n${body}`;
            resolve({ __rawText: dedupSessionOutput(mcpSessionId, `files:list:${args.server_id}:${dir}:${pattern}:${details}`, rawOut, !!args.force) });
          });
        };
        if (liveSess?.sftp) return useSftp(liveSess.sftp, false);
        getPooledSftp(conn, liveSess, (err, sftp, closeAfter) => (err ? reject(err) : useSftp(sftp, closeAfter)));
      }), getActiveSessions);
    }
    case 'sftp_search': {
      const dir = String(args.path || '/');
      const pat = String(args.pattern || '').trim();
      if (!pat) throw new Error('pattern is required for search');
      return withSsh(userId, args.server_id, 'files_read', async (conn) => {
        const cmd = `grep -rnI --color=never -- ${dockerMgr.quote(pat)} ${dockerMgr.quote(dir)} 2>/dev/null`;
        const res = await dockerMgr.execCmd(conn, cmd, 20000);
        const text = cleanTerminalNoise(res.out || '').trim();
        return { __rawText: text || '(no matches)' };
      }, getActiveSessions);
    }
    case 'sftp_read': {
      const pathList = Array.isArray(args.paths) && args.paths.length
        ? args.paths.map((p) => String(p || '').trim()).filter(Boolean)
        : (args.path ? [String(args.path).trim()] : []);
      if (!pathList.length) throw new Error('path or paths is required');
      const startLine = Number(args.start_line) > 0 ? Math.floor(Number(args.start_line)) : null;
      const endLine = Number(args.end_line) > 0 ? Math.floor(Number(args.end_line)) : null;
      return withSsh(userId, args.server_id, 'files_read', (conn, _p, liveSess) => new Promise((resolve, reject) => {
        const useSftp = async (sftp, closeAfter) => {
          try {
            const readOne = async (fp) => {
              const buf = await sftpReadBuffer(sftp, fp);
              let text = buf.toString('utf8');
              if (startLine !== null || endLine !== null) {
                const lines = text.split('\n');
                const s = Math.max(1, startLine || 1) - 1;
                const e = endLine ? Math.min(lines.length, endLine) : lines.length;
                text = lines.slice(s, e).join('\n');
              }
              return text;
            };
            if (pathList.length === 1) {
              const txt = await readOne(pathList[0]);
              return resolve({ __rawText: dedupSessionOutput(mcpSessionId, `files:read:${args.server_id}:${pathList[0]}:${startLine || ''}:${endLine || ''}`, txt, !!args.force) });
            }
            const parts = [];
            for (const fp of pathList) {
              try {
                parts.push(`=== ${fp} ===\n${await readOne(fp)}`);
              } catch (err) {
                parts.push(`=== ${fp} ===\n[error: ${err.message || err}]`);
              }
            }
            const joined = parts.join('\n\n');
            resolve({ __rawText: dedupSessionOutput(mcpSessionId, `files:read:${args.server_id}:${pathList.join(',')}:${startLine || ''}:${endLine || ''}`, joined, !!args.force) });
          } catch (e) {
            reject(e);
          } finally {
            if (closeAfter) try { sftp.end(); } catch {}
          }
        };
        if (liveSess?.sftp) return useSftp(liveSess.sftp, false);
        getPooledSftp(conn, liveSess, (err, sftp, closeAfter) => (err ? reject(err) : useSftp(sftp, closeAfter)));
      }), getActiveSessions);
    }
    case 'sftp_write': {
      const filePath = String(args.path || '');
      const content = String(args.content ?? '');
      if (!filePath) throw new Error('path is required');
      const buf = Buffer.from(content, 'utf8');
      if (buf.length > 512 * 1024) throw new Error('Content exceeds 512 KB limit');
      return withSsh(userId, args.server_id, 'files_write', (conn, _p, liveSess) => new Promise((resolve, reject) => {
        const useSftp = async (sftp, closeAfter) => {
          try {
            await sftpWriteBuffer(sftp, filePath, buf);
            resolve({ __rawText: `ok: wrote ${filePath} (${buf.length}B)` });
          } catch (e) {
            reject(e);
          } finally {
            if (closeAfter) try { sftp.end(); } catch {}
          }
        };
        if (liveSess?.sftp) return useSftp(liveSess.sftp, false);
        getPooledSftp(conn, liveSess, (err, sftp, closeAfter) => (err ? reject(err) : useSftp(sftp, closeAfter)));
      }), getActiveSessions);
    }
    case 'sftp_create':
    case 'sftp_mkdir': {
      const targetPath = String(args.path || '').trim();
      if (!targetPath) throw new Error('path is required');
      const isDir = name === 'sftp_mkdir' || args.type === 'directory';
      const recursive = args.recursive !== false;
      return withSsh(userId, args.server_id, 'files_write', async (conn, _p, liveSess) => {
        if (isDir) {
          if (recursive) {
            await dockerMgr.execCmd(conn, `mkdir -p -- ${dockerMgr.quote(targetPath)}`);
            return { __rawText: `ok: created dir ${targetPath}` };
          }
          return new Promise((resolve, reject) => {
            const useSftp = (sftp, closeAfter) => {
              sftp.mkdir(targetPath, (e) => {
                if (closeAfter) try { sftp.end(); } catch {}
                if (e) return reject(e);
                resolve({ __rawText: `ok: created dir ${targetPath}` });
              });
            };
            if (liveSess?.sftp) return useSftp(liveSess.sftp, false);
            getPooledSftp(conn, liveSess, (err, sftp, closeAfter) => (err ? reject(err) : useSftp(sftp, closeAfter)));
          });
        }
        if (recursive && targetPath.includes('/')) {
          const parentDir = targetPath.slice(0, targetPath.lastIndexOf('/')) || '/';
          if (parentDir !== '/') {
            try { await dockerMgr.execCmd(conn, `mkdir -p -- ${dockerMgr.quote(parentDir)}`); } catch {}
          }
        }
        const buf = Buffer.from(String(args.content ?? ''), 'utf8');
        if (buf.length > 512 * 1024) throw new Error('Content exceeds 512 KB limit');
        return new Promise((resolve, reject) => {
          const useSftp = async (sftp, closeAfter) => {
            try {
              await sftpWriteBuffer(sftp, targetPath, buf);
              resolve({ __rawText: `ok: created ${targetPath} (${buf.length}B)` });
            } catch (e) {
              reject(e);
            } finally {
              if (closeAfter) try { sftp.end(); } catch {}
            }
          };
          if (liveSess?.sftp) return useSftp(liveSess.sftp, false);
          getPooledSftp(conn, liveSess, (err, sftp, closeAfter) => (err ? reject(err) : useSftp(sftp, closeAfter)));
        });
      }, getActiveSessions);
    }
    case 'sftp_edit': {
      const filePath = String(args.path || '').trim();
      if (!filePath) throw new Error('path is required');
      return withSsh(userId, args.server_id, 'files_write', (conn, _p, liveSess) => new Promise((resolve, reject) => {
        const useSftp = async (sftp, closeAfter) => {
          try {
            let nextText = '';
            if (args.old_text !== undefined) {
              const curBuf = await sftpReadBuffer(sftp, filePath);
              const curText = curBuf.toString('utf8');
              const oldStr = String(args.old_text);
              const newStr = String(args.new_text ?? '');
              if (!curText.includes(oldStr)) {
                throw new Error('old_text was not found in the file');
              }
              nextText = curText.split(oldStr).join(newStr);
            } else if (args.append) {
              let curText = '';
              try {
                const curBuf = await sftpReadBuffer(sftp, filePath);
                curText = curBuf.toString('utf8');
              } catch {}
              nextText = curText + String(args.content ?? '');
            } else {
              nextText = String(args.content ?? '');
            }
            const outBuf = Buffer.from(nextText, 'utf8');
            if (outBuf.length > 512 * 1024) throw new Error('Edited file exceeds 512 KB limit');
            await sftpWriteBuffer(sftp, filePath, outBuf);
            resolve({ __rawText: `ok: edited ${filePath} (${outBuf.length}B)` });
          } catch (e) {
            reject(e);
          } finally {
            if (closeAfter) try { sftp.end(); } catch {}
          }
        };
        if (liveSess?.sftp) return useSftp(liveSess.sftp, false);
        getPooledSftp(conn, liveSess, (err, sftp, closeAfter) => (err ? reject(err) : useSftp(sftp, closeAfter)));
      }), getActiveSessions);
    }
    case 'sftp_delete': {
      const targetPath = String(args.path || '').trim();
      const normTarget = targetPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
      if (!targetPath || normTarget === '/' || normTarget === '/*' || normTarget === '/.' || normTarget === '/..') {
        throw new Error('Valid non-root path is required');
      }
      return withSsh(userId, args.server_id, 'files_write', async (conn, _p, liveSess) => {
        if (args.recursive) {
          const res = await dockerMgr.execCmd(conn, `rm -rf -- ${dockerMgr.quote(targetPath)}`);
          if (res.code !== 0) throw new Error(res.err || `Failed to delete ${targetPath}`);
          return { __rawText: `ok: deleted ${targetPath}` };
        }
        return new Promise((resolve, reject) => {
          const useSftp = (sftp, closeAfter) => {
            sftp.stat(targetPath, (stErr, stats) => {
              if (stErr) {
                if (closeAfter) try { sftp.end(); } catch {}
                return reject(stErr);
              }
              const isDir = ((stats?.mode || 0) & 0o170000) === 0o040000;
              const fn = isDir ? sftp.rmdir.bind(sftp) : sftp.unlink.bind(sftp);
              fn(targetPath, (e) => {
                if (closeAfter) try { sftp.end(); } catch {}
                if (e) return reject(e);
                resolve({ __rawText: `ok: deleted ${targetPath}` });
              });
            });
          };
          if (liveSess?.sftp) return useSftp(liveSess.sftp, false);
          getPooledSftp(conn, liveSess, (err, sftp, closeAfter) => (err ? reject(err) : useSftp(sftp, closeAfter)));
        });
      }, getActiveSessions);
    }
    case 'sftp_rename': {
      const oldPath = String(args.old_path || '').trim();
      const newPath = String(args.new_path || '').trim();
      if (!oldPath || !newPath) throw new Error('old_path and new_path are required');
      return withSsh(userId, args.server_id, 'files_write', (conn, _p, liveSess) => new Promise((resolve, reject) => {
        const useSftp = (sftp, closeAfter) => {
          sftp.rename(oldPath, newPath, (e) => {
            if (closeAfter) try { sftp.end(); } catch {}
            if (e) return reject(e);
            resolve({ __rawText: `ok: moved ${oldPath} -> ${newPath}` });
          });
        };
        if (liveSess?.sftp) return useSftp(liveSess.sftp, false);
        getPooledSftp(conn, liveSess, (err, sftp, closeAfter) => (err ? reject(err) : useSftp(sftp, closeAfter)));
      }), getActiveSessions);
    }
    case 'docker_list': {
      if (args.full) {
        return withSsh(userId, args.server_id, 'docker', (conn) => dockerMgr.getDockerData(conn), getActiveSessions);
      }
      return withSsh(userId, args.server_id, 'docker', async (conn) => {
        const res = await dockerMgr.execCmd(conn, "docker ps -a --format '{{.ID}}|{{.Names}}|{{.Image}}|{{.State}}|{{.Status}}|{{.Ports}}' 2>&1", 10000);
        if (res.code !== 0) return { __rawText: cleanTerminalNoise(res.out || res.err || 'Docker error') };
        const text = cleanTerminalNoise(res.out || '').trim();
        const rawOut = text || '(no containers)';
        return { __rawText: dedupSessionOutput(mcpSessionId, `docker:list:${args.server_id}`, rawOut, !!args.force) };
      }, getActiveSessions);
    }
    case 'docker_action': {
      const act = String(args.action || '');
      const cid = String(args.container_id || '');
      if (!['start', 'stop', 'restart'].includes(act)) throw new Error('Invalid action');
      if (!/^[a-zA-Z0-9_.-]+$/.test(cid)) throw new Error('Invalid container_id');
      return withSsh(userId, args.server_id, 'docker', async (conn) => {
        const res = await dockerMgr.execCmd(conn, `docker ${act} -- ${dockerMgr.quote(cid)}`);
        return { __rawText: cleanTerminalNoise(res.out || res.err || `ok: ${act} ${cid}`).trim() };
      }, getActiveSessions);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleRpc(userId, msg, getActiveSessions = null, onShareChange = null, mcpPerms = null, mcpSessionId = '') {
  if (Array.isArray(msg)) {
    if (msg.length > 50) {
      return { jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Batch too large' } };
    }
    const results = [];
    for (const item of msg) {
      const r = await handleRpc(userId, item, getActiveSessions, onShareChange, mcpPerms, mcpSessionId);
      if (r !== null) results.push(r);
    }
    return results.length ? results : null;
  }
  if (!msg || msg.jsonrpc !== '2.0') {
    return { jsonrpc: '2.0', id: msg?.id ?? null, error: { code: -32600, message: 'Invalid Request' } };
  }
  const hasId = Object.prototype.hasOwnProperty.call(msg, 'id') && msg.id !== undefined;
  const id = hasId ? msg.id : null;
  if (!hasId || String(msg.method || '').startsWith('notifications/')) return null;
  try {
    if (msg.method === 'initialize') {
      clearSessionDedup(mcpSessionId);
      const reqVer = msg.params?.protocolVersion;
      const protocolVersion = (typeof reqVer === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(reqVer.trim()))
        ? reqVer.trim()
        : '2025-03-26';
      const srvSummary = getUserServerSummary(userId);
      const srvHint = srvSummary.length ? `Servers: ${srvSummary.join(', ')}. ` : '';
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: 'termitron-mcp', version: '1.0.0' },
          instructions: `${srvHint}Use server name directly as server_id (skip servers list). Batch all steps (setup+config+verify) into ONE exec call using && or commands[] with quiet flags (-q/-qq/-sS). Use files search or list+pattern/grep/tail instead of dumping large dirs/logs. Reply briefly with final result only.`,
        },
      };
    }
    if (msg.method === 'ping') {
      return { jsonrpc: '2.0', id, result: {} };
    }
    if (msg.method === 'tools/list') {
      const perms = store.normalizeMcpPermissions(mcpPerms);
      const srvSummary = getUserServerSummary(userId);
      const srvTag = srvSummary.length ? ` [${srvSummary.join(', ')}]` : '';
      const allowedTools = TOOLS.filter((t) => {
        if (t.name === 'exec') return !!perms.exec;
        if (t.name === 'docker') return !!perms.docker;
        if (t.name === 'shares') return !!perms.share;
        if (t.name === 'files') return !!(perms.files_read || perms.files_write || perms.files_delete);
        return true;
      }).map((t) => {
        if (t.name === 'exec') {
          return { ...t, description: `Run shell cmd(s) in 1 batched call (&& or commands[]).${srvTag}` };
        }
        if (t.name === 'servers') {
          const acts = ['list'];
          if (perms.connect) acts.push('connect', 'disconnect');
          if (perms.hosts_add) acts.push('add');
          if (perms.hosts_edit) acts.push('update');
          if (perms.hosts_delete) acts.push('delete');
          return {
            ...t,
            inputSchema: {
              ...t.inputSchema,
              properties: { ...t.inputSchema.properties, action: { type: 'string', enum: acts } },
            },
          };
        }
        if (t.name === 'files') {
          const acts = [];
          if (perms.files_read) acts.push('list', 'search', 'read');
          if (perms.files_write) acts.push('write', 'create', 'edit', 'rename');
          if (perms.files_delete) acts.push('delete');
          return {
            ...t,
            inputSchema: {
              ...t.inputSchema,
              properties: { ...t.inputSchema.properties, action: { type: 'string', enum: acts } },
            },
          };
        }
        return t;
      });
      return { jsonrpc: '2.0', id, result: { tools: allowedTools } };
    }
    if (msg.method === 'prompts/list') {
      return { jsonrpc: '2.0', id, result: { prompts: [] } };
    }
    if (msg.method === 'resources/list') {
      return { jsonrpc: '2.0', id, result: { resources: [] } };
    }
    if (msg.method === 'resources/templates/list') {
      return { jsonrpc: '2.0', id, result: { resourceTemplates: [] } };
    }
    if (msg.method === 'tools/call') {
      const toolName = msg.params?.name;
      const toolArgs = msg.params?.arguments || {};
      const data = await callTool(userId, toolName, toolArgs, getActiveSessions, onShareChange, mcpPerms, mcpSessionId);
      const outText = (data && typeof data === 'object' && typeof data.__rawText === 'string')
        ? data.__rawText
        : JSON.stringify(data);
      return {
        jsonrpc: '2.0',
        id,
        result: { content: [{ type: 'text', text: outText }] },
      };
    }
    return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${msg.method}` } };
  } catch (e) {
    if (msg.method === 'tools/call') {
      return {
        jsonrpc: '2.0',
        id,
        result: { content: [{ type: 'text', text: e.message || String(e) }], isError: true },
      };
    }
    return { jsonrpc: '2.0', id, error: { code: -32000, message: e.message || String(e) } };
  }
}

module.exports = { TOOLS, handleRpc, clearSessionDedup, closeUserConns, closeSharedConns, closeAllConns };
