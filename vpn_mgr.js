const net = require('net');
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');

const activeTunnels = new Map();
const pendingStarts = new Map();
const DEFAULT_VPN_DIR = path.join(__dirname, 'vpn_default');

function ensureDefaultVpnDir() {
  fs.mkdirSync(DEFAULT_VPN_DIR, { recursive: true });
  return DEFAULT_VPN_DIR;
}

function loadDefaultWgConf() {
  ensureDefaultVpnDir();
  const files = fs.readdirSync(DEFAULT_VPN_DIR)
    .filter((f) => f.toLowerCase().endsWith('.conf'))
    .sort();
  if (!files.length) {
    throw new Error('Default VPN config missing: place a .conf file inside vpn_default/');
  }
  const file = files[0];
  const wgConf = fs.readFileSync(path.join(DEFAULT_VPN_DIR, file), 'utf8');
  return { file, wgConf };
}

function findWireproxyBin() {
  const candidates = [];
  if (process.env.WIREPROXY_PATH) candidates.push(process.env.WIREPROXY_PATH);
  const exe = process.platform === 'win32' ? 'wireproxy.exe' : 'wireproxy';
  candidates.push(path.join(__dirname, 'bin', exe));
  candidates.push(path.join(__dirname, exe));
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch {}
  }
  try {
    const cmd = process.platform === 'win32' ? 'where' : 'which';
    const out = execFileSync(cmd, ['wireproxy'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (out) return out.split(/\r?\n/)[0].trim();
  } catch {}
  return null;
}

function parseWgConf(raw) {
  const text = String(raw || '').replace(/\r\n/g, '\n');
  const iface = {};
  const peer = {};
  let section = '';
  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    if (/^\[interface\]$/i.test(line)) { section = 'iface'; continue; }
    if (/^\[peer\]$/i.test(line)) { section = 'peer'; continue; }
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim().toLowerCase();
    const v = line.slice(eq + 1).trim();
    if (!v || /[\r\n]/.test(v)) continue;
    if (section === 'iface') iface[k] = v;
    else if (section === 'peer') peer[k] = v;
  }
  if (!iface.privatekey || !iface.address || !peer.publickey || !peer.endpoint) {
    throw new Error('Invalid WireGuard config: PrivateKey, Address, PublicKey, and Endpoint are required.');
  }
  if (!/^[A-Za-z0-9+/=]{42,46}$/.test(iface.privatekey) || !/^[A-Za-z0-9+/=]{42,46}$/.test(peer.publickey)) {
    throw new Error('Invalid WireGuard key format.');
  }
  if (peer.presharedkey && !/^[A-Za-z0-9+/=]{42,46}$/.test(peer.presharedkey)) {
    throw new Error('Invalid WireGuard PresharedKey format.');
  }
  if (!/^[a-zA-Z0-9.\[\]:_-]+:\d{1,5}$/.test(peer.endpoint)) {
    throw new Error('Invalid WireGuard Endpoint format.');
  }
  if (iface.mtu) {
    const mtu = Number(iface.mtu);
    if (!Number.isInteger(mtu) || mtu < 576 || mtu > 9000) throw new Error('Invalid MTU value.');
  }
  return { iface, peer };
}

function allocLocalPort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close((err) => (err ? reject(err) : resolve(port)));
    });
  });
}

function waitForPort(host, port, timeoutMs = 6000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const sock = net.connect(port, host);
      sock.once('connect', () => { sock.destroy(); resolve(); });
      sock.once('error', () => {
        sock.destroy();
        if (Date.now() >= deadline) return reject(new Error('WireGuard tunnel startup timed out'));
        setTimeout(attempt, 120);
      });
    };
    attempt();
  });
}

function buildWireproxyConf(parsed, socksPort) {
  const lines = ['[Interface]'];
  lines.push(`PrivateKey = ${parsed.iface.privatekey}`);
  lines.push(`Address = ${parsed.iface.address}`);
  if (parsed.iface.dns) lines.push(`DNS = ${parsed.iface.dns}`);
  lines.push(`MTU = ${parsed.iface.mtu || '1280'}`);
  lines.push('');
  lines.push('[Peer]');
  lines.push(`PublicKey = ${parsed.peer.publickey}`);
  if (parsed.peer.presharedkey) lines.push(`PresharedKey = ${parsed.peer.presharedkey}`);
  lines.push(`Endpoint = ${parsed.peer.endpoint}`);
  lines.push(`AllowedIPs = ${parsed.peer.allowedips || '0.0.0.0/0, ::/0'}`);
  lines.push(`PersistentKeepalive = ${parsed.peer.persistentkeepalive || '25'}`);
  lines.push('');
  lines.push('[Socks5]');
  lines.push(`BindAddress = 127.0.0.1:${socksPort}`);
  return lines.join('\n') + '\n';
}

function stopWireproxy(key) {
  const cur = activeTunnels.get(key);
  if (!cur) return;
  activeTunnels.delete(key);
  try { cur.proc.kill('SIGTERM'); } catch {}
  if (cur.confPath) {
    try { fs.unlinkSync(cur.confPath); } catch {}
  }
}

async function ensureWireproxy(key, dataDir, wgConf) {
  const parsed = parseWgConf(wgConf);
  const existing = activeTunnels.get(key);
  if (existing && existing.wgConf === wgConf && existing.proc && !existing.proc.killed) {
    return { host: '127.0.0.1', port: existing.port, endpoint: parsed.peer.endpoint };
  }
  if (pendingStarts.has(key)) {
    return pendingStarts.get(key);
  }
  const startPromise = (async () => {
    stopWireproxy(key);

    const bin = findWireproxyBin();
    if (!bin) {
      throw new Error('wireproxy binary not found. Install wireproxy in PATH or ./bin/wireproxy.');
    }

    const port = await allocLocalPort();
    const confBody = buildWireproxyConf(parsed, port);
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
    const confPath = path.join(dataDir, `wireproxy_${String(key).replace(/[^a-zA-Z0-9_-]/g, '')}.conf`);
    fs.writeFileSync(confPath, confBody, { encoding: 'utf8', mode: 0o600 });

    const proc = spawn(bin, ['-c', confPath, '-s'], {
      env: { ...process.env, GOMAXPROCS: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let errLog = '';
    proc.stderr.on('data', (d) => { if (errLog.length < 1024) errLog += d.toString('utf8'); });
    proc.on('exit', () => {
      const cur = activeTunnels.get(key);
      if (cur && cur.proc === proc) activeTunnels.delete(key);
    });

    activeTunnels.set(key, { proc, port, wgConf, confPath, endpoint: parsed.peer.endpoint });
    try {
      await waitForPort('127.0.0.1', port, 8000);
    } catch (e) {
      stopWireproxy(key);
      throw new Error(errLog.trim() || e.message);
    }
    return { host: '127.0.0.1', port, endpoint: parsed.peer.endpoint };
  })();
  pendingStarts.set(key, startPromise);
  try {
    return await startPromise;
  } finally {
    if (pendingStarts.get(key) === startPromise) pendingStarts.delete(key);
  }
}

async function ensureDefaultTunnel(baseDataDir) {
  const { wgConf } = loadDefaultWgConf();
  return ensureWireproxy('__default__', baseDataDir, wgConf);
}

function socks5HandshakeOverStream(sock, targetHost, targetPort, username = '', password = '', timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let rx = Buffer.alloc(0);
    let waiter = null;

    const onData = (chunk) => {
      rx = Buffer.concat([rx, chunk]);
      if (waiter && rx.length >= waiter.n) {
        const w = waiter;
        waiter = null;
        const out = rx.subarray(0, w.n);
        rx = rx.subarray(w.n);
        w.res(out);
      }
    };
    const onErr = (err) => fail(err);
    const onClose = () => fail(new Error('SOCKS5 socket closed'));

    const cleanup = () => {
      sock.off('data', onData);
      sock.off('error', onErr);
      sock.off('close', onClose);
    };
    const fail = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      sock.destroy();
      if (waiter) {
        const w = waiter;
        waiter = null;
        w.rej(err instanceof Error ? err : new Error(String(err)));
      }
      reject(err instanceof Error ? err : new Error(String(err)));
    };
    const timer = setTimeout(() => fail(new Error('SOCKS5 connection timed out')), timeoutMs);

    const readExact = (n) => {
      if (rx.length >= n) {
        const out = rx.subarray(0, n);
        rx = rx.subarray(n);
        return Promise.resolve(out);
      }
      return new Promise((res, rej) => {
        waiter = { n, res, rej };
      });
    };

    sock.on('data', onData);
    sock.on('error', onErr);
    sock.on('close', onClose);
    sock.resume();

    (async () => {
      try {
        const useAuth = Boolean(username || password);
        sock.write(useAuth ? Buffer.from([0x05, 0x02, 0x00, 0x02]) : Buffer.from([0x05, 0x01, 0x00]));
        const greet = await readExact(2);
        if (greet[0] !== 0x05) throw new Error('Invalid SOCKS5 greeting');
        if (greet[1] === 0x02) {
          const u = Buffer.from(String(username || ''), 'utf8');
          const p = Buffer.from(String(password || ''), 'utf8');
          if (u.length > 255 || p.length > 255) throw new Error('SOCKS5 credentials too long');
          sock.write(Buffer.concat([Buffer.from([0x01, u.length]), u, Buffer.from([p.length]), p]));
          const authRes = await readExact(2);
          if (authRes[1] !== 0x00) throw new Error('SOCKS5 authentication failed');
        } else if (greet[1] !== 0x00) {
          throw new Error('SOCKS5 no acceptable auth method');
        }

        const cleanHost = String(targetHost || '').trim();
        if (!cleanHost || cleanHost.length > 253 || /[\s\x00-\x1f]/.test(cleanHost)) {
          throw new Error('Invalid target host');
        }
        const portBuf = Buffer.alloc(2);
        portBuf.writeUInt16BE(Number(targetPort) || 22, 0);
        let addrPart;
        const ipVer = net.isIP(cleanHost);
        if (ipVer === 4) {
          addrPart = Buffer.concat([Buffer.from([0x01]), Buffer.from(cleanHost.split('.').map(Number))]);
        } else if (ipVer === 6) {
          const expanded = cleanHost.split(':');
          if (expanded.length <= 8) {
            const hBuf = Buffer.from(cleanHost, 'utf8');
            addrPart = Buffer.concat([Buffer.from([0x03, hBuf.length]), hBuf]);
          }
        } else {
          const hBuf = Buffer.from(cleanHost, 'utf8');
          if (hBuf.length > 255) throw new Error('Target hostname too long');
          addrPart = Buffer.concat([Buffer.from([0x03, hBuf.length]), hBuf]);
        }
        sock.write(Buffer.concat([Buffer.from([0x05, 0x01, 0x00]), addrPart, portBuf]));

        const repHead = await readExact(4);
        if (repHead[0] !== 0x05 || repHead[1] !== 0x00) {
          throw new Error(`SOCKS5 connect failed (code ${repHead[1]})`);
        }
        const atyp = repHead[3];
        if (atyp === 0x01) await readExact(6);
        else if (atyp === 0x04) await readExact(18);
        else if (atyp === 0x03) {
          const len = await readExact(1);
          await readExact(len[0] + 2);
        }

        settled = true;
        clearTimeout(timer);
        sock.pause();
        cleanup();
        sock.setNoDelay?.(true);
        if (rx.length > 0) {
          sock.unshift(rx);
        }
        resolve(sock);
      } catch (e) {
        fail(e);
      }
    })();
  });
}

function connectSocks5(proxyHost, proxyPort, targetHost, targetPort, username = '', password = '', timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const sock = net.connect(Number(proxyPort), proxyHost);
    let connected = false;
    const onErr = (err) => {
      if (!connected) {
        sock.destroy();
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };
    sock.once('error', onErr);
    sock.once('connect', () => {
      connected = true;
      sock.removeListener('error', onErr);
      socks5HandshakeOverStream(sock, targetHost, targetPort, username, password, timeoutMs).then(resolve, reject);
    });
  });
}

async function connectThroughVpn(userId, uStore, baseDataDir, vpnCfg, targetHost, targetPort, policy = { vpnEnabled: true, allowWithoutVpn: false }) {
  const mode = vpnCfg?.mode === 'socks5' ? 'socks5' : 'default';
  if (!policy?.vpnEnabled) {
    if (!policy?.allowWithoutVpn) {
      throw new Error('VPN is disabled by administrator. Connections are blocked.');
    }
    if (mode === 'socks5') {
      return connectSocks5(
        vpnCfg.socksHost || '127.0.0.1',
        Number(vpnCfg.socksPort) || 1080,
        targetHost,
        targetPort,
        vpnCfg.socksUser || '',
        vpnCfg.socksPass || ''
      );
    }
    return null;
  }
  const defTun = await ensureDefaultTunnel(baseDataDir);
  if (mode === 'socks5') {
    const hop1 = await connectSocks5(
      defTun.host,
      defTun.port,
      vpnCfg.socksHost || '127.0.0.1',
      Number(vpnCfg.socksPort) || 1080
    );
    return socks5HandshakeOverStream(
      hop1,
      targetHost,
      targetPort,
      vpnCfg.socksUser || '',
      vpnCfg.socksPass || ''
    );
  }
  return connectSocks5(defTun.host, defTun.port, targetHost, targetPort);
}

function getUserStatus() {
  const def = activeTunnels.get('__default__');
  let defaultConfigured = false;
  try {
    defaultConfigured = !!loadDefaultWgConf().file;
  } catch {}
  return {
    wireproxyAvailable: !!findWireproxyBin(),
    defaultConfigured,
    defaultRunning: !!(def && def.proc && !def.proc.killed),
  };
}

function listDefaultConfs() {
  ensureDefaultVpnDir();
  const files = fs.readdirSync(DEFAULT_VPN_DIR)
    .filter((f) => f.toLowerCase().endsWith('.conf'))
    .sort();
  return files.map((file, idx) => {
    const full = path.join(DEFAULT_VPN_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
    let endpoint = '';
    let address = '';
    try {
      const p = parseWgConf(raw);
      endpoint = p.peer.endpoint;
      address = p.iface.address;
    } catch {}
    return { file, active: idx === 0, endpoint, address, size: raw.length };
  });
}

function saveDefaultConf(filename, content) {
  parseWgConf(content);
  ensureDefaultVpnDir();
  let safe = path.basename(String(filename || 'default.conf')).replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!safe.toLowerCase().endsWith('.conf')) safe += '.conf';
  fs.writeFileSync(path.join(DEFAULT_VPN_DIR, safe), String(content), { encoding: 'utf8', mode: 0o600 });
  stopWireproxy('__default__');
  return safe;
}

function deleteDefaultConf(filename) {
  const safe = path.basename(String(filename || ''));
  const target = path.join(DEFAULT_VPN_DIR, safe);
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
    stopWireproxy('__default__');
    return true;
  }
  return false;
}

function getAdminStatus() {
  const def = activeTunnels.get('__default__');
  const files = listDefaultConfs();
  const activeConf = files.find((f) => f.active) || null;
  return {
    wireproxyAvailable: !!findWireproxyBin(),
    defaultRunning: !!(def && def.proc && !def.proc.killed),
    defaultFile: activeConf?.file || '',
    defaultEndpoint: def?.endpoint || activeConf?.endpoint || '',
    defaultAddress: activeConf?.address || '',
    files,
  };
}

async function testDefaultExitIp(baseDataDir) {
  const tun = await ensureDefaultTunnel(baseDataDir);
  const s = await connectSocks5(tun.host, tun.port, 'api.ipify.org', 80, '', '', 8000);
  return new Promise((resolve, reject) => {
    let out = '';
    const t = setTimeout(() => { s.destroy(); reject(new Error('Exit IP test timed out')); }, 8000);
    s.on('data', (d) => { out += d.toString('utf8'); });
    s.on('error', (e) => { clearTimeout(t); reject(e); });
    s.on('end', () => {
      clearTimeout(t);
      const body = out.split('\r\n\r\n')[1] || '';
      resolve(body.trim() || 'unknown');
    });
    s.write('GET / HTTP/1.1\r\nHost: api.ipify.org\r\nConnection: close\r\n\r\n');
  });
}

function stopAll() {
  for (const key of Array.from(activeTunnels.keys())) stopWireproxy(key);
}

process.once('exit', stopAll);

module.exports = {
  DEFAULT_VPN_DIR,
  ensureDefaultVpnDir,
  loadDefaultWgConf,
  findWireproxyBin,
  parseWgConf,
  ensureWireproxy,
  ensureDefaultTunnel,
  stopWireproxy,
  connectSocks5,
  connectThroughVpn,
  getUserStatus,
  listDefaultConfs,
  saveDefaultConf,
  deleteDefaultConf,
  getAdminStatus,
  testDefaultExitIp,
  stopAll,
};
