const crypto = require('crypto');
const { Client: SshClient } = require('ssh2');
const store = require('./store');
const vpnMgr = require('./vpn_mgr');
const dockerMgr = require('./docker_mgr');

const TOOLS = [
  {
    name: 'list_servers',
    description: 'List saved and shared SSH servers for the authenticated user.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_my_user_id',
    description: 'Get your user ID so others can share servers with you.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'share_list',
    description: 'List all server shares: servers you shared with others, pending invitations you received, and servers shared with you.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'share_create',
    description: 'Share one or more of your servers with another user by their user ID, or update an existing share.',
    inputSchema: {
      type: 'object',
      properties: {
        target_user_id: { type: 'string', description: 'Recipient user ID' },
        server_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of server IDs or names to share',
        },
        permissions: {
          type: 'object',
          description: 'Permission flags: terminal, files_read, files_write, docker, vnc, edit_host, show_address, sudo',
          properties: {
            terminal: { type: 'boolean', description: 'Allow SSH terminal access (default true)' },
            files_read: { type: 'boolean', description: 'Allow SFTP file read (default true)' },
            files_write: { type: 'boolean', description: 'Allow SFTP file write (auto-enables files_read)' },
            docker: { type: 'boolean', description: 'Allow Docker management' },
            vnc: { type: 'boolean', description: 'Allow noVNC remote desktop' },
            edit_host: { type: 'boolean', description: 'Allow editing server settings (auto-enables show_address)' },
            show_address: { type: 'boolean', description: 'Show server address/host and username' },
            sudo: { type: 'boolean', description: 'Root access (enables all permissions)' },
          },
        },
        share_id: { type: 'string', description: 'Optional share ID if updating an existing share' },
      },
      required: ['target_user_id', 'server_ids'],
    },
  },
  {
    name: 'share_respond',
    description: 'Accept or decline a pending server share invitation.',
    inputSchema: {
      type: 'object',
      properties: {
        share_id: { type: 'string', description: 'Share ID from pending_invitations' },
        action: { type: 'string', enum: ['accept', 'decline'], description: 'Accept or decline the invitation' },
      },
      required: ['share_id', 'action'],
    },
  },
  {
    name: 'share_revoke',
    description: 'Revoke / delete a server share you previously created for another user.',
    inputSchema: {
      type: 'object',
      properties: {
        share_id: { type: 'string', description: 'Share ID to revoke' },
      },
      required: ['share_id'],
    },
  },
  {
    name: 'share_leave',
    description: 'Leave / disconnect from a server share that was shared with you.',
    inputSchema: {
      type: 'object',
      properties: {
        share_id: { type: 'string', description: 'Share ID to leave' },
      },
      required: ['share_id'],
    },
  },
  {
    name: 'update_server',
    description: 'Update settings for an owned server or a shared server with edit_host permission.',
    inputSchema: {
      type: 'object',
      properties: {
        server_id: { type: 'string', description: 'Server ID or name' },
        name: { type: 'string', description: 'New name for the server' },
        group: { type: 'string', description: 'New group category' },
        note: { type: 'string', description: 'Note/description' },
        env: { type: 'string', description: 'Environment variables' },
      },
      required: ['server_id'],
    },
  },
  {
    name: 'ssh_exec',
    description: 'Execute a shell command on a saved SSH server (routed through VPN/Proxy policy).',
    inputSchema: {
      type: 'object',
      properties: {
        server_id: { type: 'string', description: 'Server ID or name from list_servers' },
        command: { type: 'string', description: 'Shell command to execute' },
        timeout_ms: { type: 'number', description: 'Timeout in milliseconds (default 20000, max 60000)' },
      },
      required: ['server_id', 'command'],
    },
  },
  {
    name: 'sftp_list',
    description: 'List files and directories at a remote path via SFTP.',
    inputSchema: {
      type: 'object',
      properties: {
        server_id: { type: 'string', description: 'Server ID or name' },
        path: { type: 'string', description: 'Remote directory path (default /)' },
      },
      required: ['server_id'],
    },
  },
  {
    name: 'sftp_read',
    description: 'Read a UTF-8 text file from a remote server via SFTP (max 512 KB).',
    inputSchema: {
      type: 'object',
      properties: {
        server_id: { type: 'string', description: 'Server ID or name' },
        path: { type: 'string', description: 'Remote file path' },
      },
      required: ['server_id', 'path'],
    },
  },
  {
    name: 'sftp_write',
    description: 'Write UTF-8 text content to a remote file via SFTP (max 512 KB).',
    inputSchema: {
      type: 'object',
      properties: {
        server_id: { type: 'string', description: 'Server ID or name' },
        path: { type: 'string', description: 'Remote file path' },
        content: { type: 'string', description: 'File text content' },
      },
      required: ['server_id', 'path', 'content'],
    },
  },
  {
    name: 'docker_list',
    description: 'List Docker containers on a saved server.',
    inputSchema: {
      type: 'object',
      properties: {
        server_id: { type: 'string', description: 'Server ID or name' },
      },
      required: ['server_id'],
    },
  },
  {
    name: 'docker_action',
    description: 'Start, stop, or restart a Docker container on a saved server.',
    inputSchema: {
      type: 'object',
      properties: {
        server_id: { type: 'string', description: 'Server ID or name' },
        action: { type: 'string', enum: ['start', 'stop', 'restart'] },
        container_id: { type: 'string', description: 'Container ID or name' },
      },
      required: ['server_id', 'action', 'container_id'],
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
  if (!hostStr || hostStr.length > 253 || /[\s\x00-\x1f]/.test(hostStr)) {
    throw new Error('Invalid server host.');
  }
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
      jConn.forwardOut('127.0.0.1', 0, hostStr, portNum, (e, s) => {
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
    sockStream = await vpnMgr.connectThroughVpn(userId, uStore, store.DATA_DIR, vpnCfg, hostStr, portNum, store.getGlobalPolicy());
  }

  const conn = new SshClient();
  const khName = portNum === 22 ? hostStr : `[${hostStr}]:${portNum}`;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { try { conn.end(); } catch {} reject(new Error('SSH connect timed out')); }, 15000);
    conn.on('ready', () => { clearTimeout(timer); resolve(); });
    conn.on('error', (e) => { clearTimeout(timer); reject(e); });
    conn.on('keyboard-interactive', (n, i, l, prompts, finish) => finish(prompts.map(() => password)));
    const cfg = {
      host: hostStr,
      port: portNum,
      username: profile.user || 'root',
      tryKeyboard: true,
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

async function withSsh(userId, serverId, reqPerm, fn, getActiveSessions) {
  const q = String(serverId || '').trim();
  const active = typeof getActiveSessions === 'function' ? getActiveSessions(userId) : [];
  const live = active.find((a) =>
    a.sid === q ||
    a.sess?.profile?.id === q ||
    (a.sess?.shared && (a.sess.shared.hostId === q || `sh:${a.sess.shared.ownerId}:${a.sess.shared.hostId}` === q)) ||
    (a.sess?.profile?.name || '').toLowerCase() === q.toLowerCase() ||
    (a.sess?.profile?.host || '').toLowerCase() === q.toLowerCase()
  );
  if (live && live.sess?.conn) {
    if (live.sess.shared) {
      const check = store.resolveSharedHost(userId, live.sess.shared.hostId, live.sess.shared.ownerId);
      if (!check) throw new Error('Shared server access revoked or not accepted.');
      if (reqPerm && !check.permissions[reqPerm]) throw new Error(`Permission denied: ${reqPerm}`);
    }
    return fn(live.sess.conn, live.sess.profile, live.sess);
  }
  const uStore = store.forUser(userId);
  const found = findServer(userId, uStore, serverId);
  if (found.shared && reqPerm && !found.shared.permissions[reqPerm]) {
    throw new Error(`Permission denied: ${reqPerm}`);
  }
  const conn = await openMcpSsh(found.targetUid, found.targetStore, found.profile);
  try {
    return await fn(conn, found.profile, null);
  } finally {
    try { conn.end(); } catch {}
  }
}

async function callTool(userId, name, args = {}, getActiveSessions = null, onShareChange = null) {
  const uStore = store.forUser(userId);
  switch (name) {
    case 'list_servers': {
      const active = typeof getActiveSessions === 'function' ? getActiveSessions(userId) : [];
      const connectedIds = new Set(active.map((a) => a.sess?.profile?.id).filter(Boolean));
      const ownHosts = uStore.loadHosts().map((h) => ({
        id: h.id,
        name: h.name || h.host,
        host: h.host,
        port: Number(h.port) || 22,
        user: h.user || 'root',
        group: h.group || '',
        proxy_mode: h.proxy_mode || 'none',
        shared: false,
        connected: connectedIds.has(h.id),
      }));
      const sharedHosts = store.listSharedHostsForUser(userId).map((h) => ({
        id: h.id,
        raw_host_id: h.rawHostId,
        name: h.name,
        ...(h.showAddress ? { host: h.host, port: Number(h.port) || 22, user: h.user || 'root' } : { show_address: false }),
        group: h.group,
        shared: true,
        owner_id: h.ownerId,
        permissions: h.permissions,
        connected: connectedIds.has(h.rawHostId) || connectedIds.has(h.id),
      }));
      const hosts = [...ownHosts, ...sharedHosts];
      const connected_sessions = active.map((a) => ({
        sid: a.sid,
        id: a.sess?.profile?.id || a.sid,
        name: a.sess?.profile?.name || a.sess?.profile?.host || a.sid,
        ...(a.sess?.shared && !a.sess.shared.permissions?.show_address
          ? { show_address: false }
          : {
              host: a.sess?.profile?.host || '',
              port: Number(a.sess?.profile?.port) || 22,
              user: a.sess?.profile?.user || 'root',
            }),
        sftpReady: !!a.sess?.sftp,
        sudo: !!a.sess?.sudo,
        shared: !!a.sess?.shared,
        permissions: a.sess?.shared ? a.sess.shared.permissions : null,
        connected: true,
      }));
      return { my_user_id: userId, servers: hosts, connected_sessions };
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
      if (typeof onShareChange === 'function') {
        onShareChange({ type: 'leave', ownerId: removed.ownerId, targetId: userId });
      }
      return { ok: true, message: 'Left shared access', share_id: shareId };
    }
    case 'update_server': {
      const found = findServer(userId, uStore, args.server_id);
      if (found.shared) {
        if (!found.shared.permissions?.edit_host) {
          throw new Error('Permission denied: edit_host');
        }
        const canEditEnv = !!found.shared.permissions?.sudo;
        const ownerStore = store.forUser(found.shared.ownerId);
        const ownerHosts = ownerStore.loadHosts();
        const nextHosts = ownerHosts.map((h) => {
          if (h.id === found.shared.hostId) {
            return {
              ...h,
              ...(args.name !== undefined ? { name: String(args.name).trim() || h.name } : {}),
              ...(args.group !== undefined ? { group: String(args.group).trim() } : {}),
              ...(args.note !== undefined ? { note: String(args.note) } : {}),
              ...(canEditEnv && args.env !== undefined ? { env: String(args.env) } : {}),
            };
          }
          return h;
        });
        ownerStore.saveHosts(nextHosts);
        if (typeof onShareChange === 'function') {
          onShareChange({ type: 'update', ownerId: found.shared.ownerId, targetId: userId });
        }
        return { ok: true, server_id: found.shared.hostId, updated: true, shared: true };
      } else {
        const hosts = uStore.loadHosts();
        const nextHosts = hosts.map((h) => {
          if (h.id === found.profile.id) {
            return {
              ...h,
              ...(args.name !== undefined ? { name: String(args.name).trim() || h.name } : {}),
              ...(args.group !== undefined ? { group: String(args.group).trim() } : {}),
              ...(args.note !== undefined ? { note: String(args.note) } : {}),
              ...(args.env !== undefined ? { env: String(args.env) } : {}),
            };
          }
          return h;
        });
        uStore.saveHosts(nextHosts);
        return { ok: true, server_id: found.profile.id, updated: true, shared: false };
      }
    }
    case 'ssh_exec': {
      const cmd = String(args.command || '');
      if (!cmd) throw new Error('command is required');
      const timeoutMs = Math.max(1000, Math.min(60000, Number(args.timeout_ms) || 20000));
      return withSsh(userId, args.server_id, 'terminal', async (conn) => {
        const res = await dockerMgr.execCmd(conn, cmd, timeoutMs);
        if (res.code === 124 && /when attempting ssh remote command execution/i.test(res.err || '')) {
          return execViaShell(conn, cmd, timeoutMs);
        }
        return res;
      }, getActiveSessions);
    }
    case 'sftp_list': {
      const dir = String(args.path || '/');
      return withSsh(userId, args.server_id, 'files_read', (conn, _p, liveSess) => new Promise((resolve, reject) => {
        const useSftp = (sftp, closeAfter) => {
          sftp.readdir(dir, (e, list) => {
            if (closeAfter) try { sftp.end(); } catch {}
            if (e) return reject(e);
            const entries = list
              .filter((x) => x.filename !== '.' && x.filename !== '..')
              .map((x) => ({
                name: x.filename,
                isDir: ((x.attrs?.mode || 0) & 0o170000) === 0o040000 || (x.longname && x.longname.startsWith('d')),
                size: x.attrs?.size || 0,
              }));
            resolve({ path: dir, entries });
          });
        };
        if (liveSess?.sftp) return useSftp(liveSess.sftp, false);
        conn.sftp((err, sftp) => (err ? reject(err) : useSftp(sftp, true)));
      }), getActiveSessions);
    }
    case 'sftp_read': {
      const filePath = String(args.path || '');
      if (!filePath) throw new Error('path is required');
      return withSsh(userId, args.server_id, 'files_read', (conn, _p, liveSess) => new Promise((resolve, reject) => {
        const useSftp = (sftp, closeAfter) => {
          const chunks = [];
          let total = 0;
          const finish = (fn, arg) => {
            if (closeAfter) try { sftp.end(); } catch {}
            fn(arg);
          };
          const rs = sftp.createReadStream(filePath);
          rs.on('data', (c) => {
            total += c.length;
            if (total > 512 * 1024) { try { rs.destroy(); } catch {} return finish(reject, new Error('File exceeds 512 KB limit')); }
            chunks.push(c);
          });
          rs.on('error', (e) => finish(reject, e));
          rs.on('end', () => finish(resolve, { path: filePath, text: Buffer.concat(chunks).toString('utf8') }));
        };
        if (liveSess?.sftp) return useSftp(liveSess.sftp, false);
        conn.sftp((err, sftp) => (err ? reject(err) : useSftp(sftp, true)));
      }), getActiveSessions);
    }
    case 'sftp_write': {
      const filePath = String(args.path || '');
      const content = String(args.content ?? '');
      if (!filePath) throw new Error('path is required');
      const buf = Buffer.from(content, 'utf8');
      if (buf.length > 512 * 1024) throw new Error('Content exceeds 512 KB limit');
      return withSsh(userId, args.server_id, 'files_write', (conn, _p, liveSess) => new Promise((resolve, reject) => {
        const useSftp = (sftp, closeAfter) => {
          const finish = (fn, arg) => {
            if (closeAfter) try { sftp.end(); } catch {}
            fn(arg);
          };
          const ws = sftp.createWriteStream(filePath);
          ws.on('error', (e) => finish(reject, e));
          ws.on('close', () => finish(resolve, { ok: true, path: filePath, bytes: buf.length }));
          ws.end(buf);
        };
        if (liveSess?.sftp) return useSftp(liveSess.sftp, false);
        conn.sftp((err, sftp) => (err ? reject(err) : useSftp(sftp, true)));
      }), getActiveSessions);
    }
    case 'docker_list': {
      return withSsh(userId, args.server_id, 'docker', (conn) => dockerMgr.getDockerData(conn), getActiveSessions);
    }
    case 'docker_action': {
      const act = String(args.action || '');
      const cid = String(args.container_id || '');
      if (!['start', 'stop', 'restart'].includes(act)) throw new Error('Invalid action');
      if (!/^[a-zA-Z0-9_.-]+$/.test(cid)) throw new Error('Invalid container_id');
      return withSsh(userId, args.server_id, 'docker', (conn) => dockerMgr.execCmd(conn, `docker ${act} -- ${dockerMgr.quote(cid)}`), getActiveSessions);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleRpc(userId, msg, getActiveSessions = null, onShareChange = null) {
  if (!msg || msg.jsonrpc !== '2.0') {
    return { jsonrpc: '2.0', id: msg?.id ?? null, error: { code: -32600, message: 'Invalid Request' } };
  }
  const id = msg.id ?? null;
  if (msg.method === 'notifications/initialized') return null;
  try {
    if (msg.method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'termitron-mcp', version: '1.0.0' },
        },
      };
    }
    if (msg.method === 'ping') {
      return { jsonrpc: '2.0', id, result: {} };
    }
    if (msg.method === 'tools/list') {
      return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
    }
    if (msg.method === 'tools/call') {
      const toolName = msg.params?.name;
      const toolArgs = msg.params?.arguments || {};
      const data = await callTool(userId, toolName, toolArgs, getActiveSessions, onShareChange);
      return {
        jsonrpc: '2.0',
        id,
        result: { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] },
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

module.exports = { TOOLS, handleRpc };
