#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const express = require('express');
const { WebSocketServer } = require('ws');
const { Client: SshClient } = require('ssh2');

const store = require('./store');
const dockerMgr = require('./docker_mgr');
const vpnMgr = require('./vpn_mgr');
const mcp = require('./mcp_handler');

function argVal(flag) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && idx + 1 < process.argv.length ? process.argv[idx + 1] : null;
}

const defaultBind = process.env.PORT ? `0.0.0.0:${process.env.PORT}` : '127.0.0.1:8080';
const bindStr = argVal('--bind') || process.env.TERM_BIND || defaultBind;
const lastColon = bindStr.lastIndexOf(':');
const BIND_HOST = lastColon > 0 ? bindStr.slice(0, lastColon) : '127.0.0.1';
const BIND_PORT = parseInt(lastColon > 0 ? bindStr.slice(lastColon + 1) : '8080', 10) || 8080;

const NO_AUTH =
  process.argv.includes('--no-auth') ||
  ['1', 'true'].includes((process.env.TERM_NO_AUTH || '').toLowerCase());

const SECRET =
  argVal('--password') ||
  argVal('--token') ||
  process.env.TERM_WEB_PASSWORD ||
  process.env.TERM_WEB_TOKEN ||
  crypto.randomBytes(16).toString('hex');

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const ADMIN_TTL_MS = 12 * 60 * 60 * 1000;
const sessionTokens = new Map();
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb) && a.length === b.length;
}
function isSafeId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_:-]{1,64}$/.test(id) && id !== '__proto__' && id !== 'constructor' && id !== 'prototype';
}
function issueSessionToken(userId) {
  if (sessionTokens.size >= 10000) {
    const first = sessionTokens.keys().next().value;
    if (first) sessionTokens.delete(first);
  }
  const tok = crypto.randomBytes(24).toString('hex');
  sessionTokens.set(tok, { userId, exp: Date.now() + SESSION_TTL_MS });
  return tok;
}
function authenticateToken(tok, { allowMcp = false } = {}) {
  if (NO_AUTH) return { ok: true, userId: 'default' };
  if (!tok || typeof tok !== 'string' || tok.length > 256) return null;
  if (safeEqual(tok, SECRET)) return { ok: true, userId: 'default' };
  const sRec = sessionTokens.get(tok);
  if (sRec) {
    if (Date.now() > sRec.exp || !store.userExists(sRec.userId)) {
      sessionTokens.delete(tok);
      return null;
    }
    sRec.exp = Date.now() + SESSION_TTL_MS;
    return { ok: true, userId: sRec.userId };
  }
  const kUid = store.findUserByKey(tok);
  if (kUid && store.userExists(kUid)) return { ok: true, userId: kUid };
  if (allowMcp) {
    const mUid = store.findUserByMcpToken(tok);
    if (mUid && store.userExists(mUid)) return { ok: true, userId: mUid };
  }
  return null;
}

const regLimits = new Map();
function checkRegRate(ip) {
  const now = Date.now();
  const rec = regLimits.get(ip);
  if (!rec || now > rec.resetAt) {
    if (regLimits.size >= 5000) {
      const first = regLimits.keys().next().value;
      if (first) regLimits.delete(first);
    }
    regLimits.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (rec.count >= 10) return false;
  rec.count++;
  return true;
}

const authFailures = new Map();
function checkAuthRate(ip) {
  const now = Date.now();
  const rec = authFailures.get(ip);
  if (!rec || now > rec.resetAt) return true;
  return rec.count < 10;
}
function recordAuthFailure(ip) {
  const now = Date.now();
  const rec = authFailures.get(ip);
  if (!rec || now > rec.resetAt) {
    if (authFailures.size >= 5000) {
      const first = authFailures.keys().next().value;
      if (first) authFailures.delete(first);
    }
    authFailures.set(ip, { count: 1, resetAt: now + 60000 });
  } else {
    rec.count++;
  }
}

const downloads = new Map();

function posixJoin(a, b) {
  if (b.startsWith('/')) return b;
  return a.endsWith('/') ? `${a}${b}` : `${a}/${b}`;
}
function posixParent(p) {
  const t = p.replace(/\/+$/, '');
  const idx = t.lastIndexOf('/');
  return idx <= 0 ? '/' : t.slice(0, idx);
}
function posixBase(p) {
  const t = p.replace(/\/+$/, '');
  const idx = t.lastIndexOf('/');
  return idx === -1 ? t : t.slice(idx + 1);
}

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https://cdn.jsdelivr.net; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self' ws: wss:; frame-ancestors 'none';"
  );
  next();
});
const BASE_PATH = (process.env.TERM_BASE_PATH || process.env.PASSENGER_BASE_URI || '').replace(/\/+$/, '');
function stripBasePath(u) {
  if (!u) return '/';
  if (BASE_PATH && (u === BASE_PATH || u.startsWith(BASE_PATH + '/') || u.startsWith(BASE_PATH + '?'))) {
    return u.slice(BASE_PATH.length) || '/';
  }
  const adminSeg = (store.getSetup().adminPath || '/admin').replace(/^\/+|\/+$/g, '');
  const adminEsc = adminSeg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const routeRe = new RegExp(`^\\/([^/?#]+)(\\/(?:api|ws|ws-vnc|admin|download|mcp|novnc|oauth|\\.well-known${adminEsc ? '|' + adminEsc : ''})(?:[/?#].*)?|\\/[^/?#]+\\.(?:js|css|html|svg|png|ico)(?:\\?.*)?)$`);
  const m = u.match(routeRe);
  if (m && !/^(?:api|ws|ws-vnc|admin|download|mcp|novnc|oauth|\.well-known)$/i.test(m[1])) return m[2];
  return u;
}

app.use((req, res, next) => {
  req.url = stripBasePath(req.url);
  if (/^\/(?:api|oauth|mcp)(?:\/|$)/.test(req.url)) {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/novnc', express.static(path.join(__dirname, 'node_modules', '@novnc', 'novnc')));

app.get('/api/auth/status', (req, res) => {
  res.json({
    auth_required: !NO_AUTH,
    registration_enabled: store.getGlobalPolicy().registrationEnabled !== false,
    setup_required: !store.getSetup().setupDone,
  });
});

app.get('/api/setup/info', (req, res) => {
  const st = store.getSetup();
  if (st.setupDone) return res.status(403).json({ ok: false, error: 'Setup already completed.' });
  res.json({
    ok: true,
    adminKey: ADMIN_KEY,
    accessToken: SECRET,
    adminPath: st.adminPath || '/admin',
  });
});

app.post('/api/setup', (req, res) => {
  const st = store.getSetup();
  if (st.setupDone) return res.status(403).json({ ok: false, error: 'Setup already completed.' });
  try {
    if (req.body?.adminKey && String(req.body.adminKey).trim()) {
      ADMIN_KEY = store.setAdminKey(req.body.adminKey);
    }
    const saved = store.saveSetup({
      setupDone: true,
      adminPath: req.body?.adminPath || '/admin',
    });
    res.json({ ok: true, adminPath: saved.adminPath });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

app.post('/api/auth', (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (!checkAuthRate(ip)) {
    return res.status(429).json({ ok: false, error: 'Too many failed attempts. Try again in 1 minute.' });
  }
  const tok = String(req.body?.token || '').trim();
  const auth = authenticateToken(tok);
  if (auth) {
    authFailures.delete(ip);
    const session_token = issueSessionToken(auth.userId);
    return res.json({ ok: true, session_token });
  }
  recordAuthFailure(ip);
  return res.status(401).json({ ok: false, error: 'Invalid access key.' });
});

app.post('/api/register', (req, res) => {
  if (store.getGlobalPolicy().registrationEnabled === false) {
    return res.status(403).json({ ok: false, error: 'Registration is disabled by administrator.' });
  }
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (!checkRegRate(ip)) {
    return res.status(429).json({ ok: false, error: 'Too many registrations. Try again later.' });
  }
  const { userId, accessKey } = store.registerUser();
  const session_token = issueSessionToken(userId);
  res.json({ ok: true, access_key: accessKey, session_token });
});

const mcpSseSessions = new Map();
const mcpActiveCalls = new Map();

function resolveMcpAuth(req) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (!checkAuthRate(ip)) return null;
  const hdr = req.headers.authorization || '';
  const tok = req.params?.token || (hdr.startsWith('Bearer ') ? hdr.slice(7).trim() : '') || String(req.headers['x-api-key'] || req.query.token || '');
  const auth = authenticateToken(tok, { allowMcp: true });
  if (!auth) {
    recordAuthFailure(ip);
    return null;
  }
  return { ...auth, rawToken: tok };
}

function buildUserMcpLinks(uid) {
  const links = store.listMcpTokens(uid);
  return links.map((l) => {
    let liveSse = 0;
    for (const s of mcpSseSessions.values()) if (s.userId === uid && s.token === l.token) liveSse++;
    let liveCalls = 0;
    for (const c of mcpActiveCalls.values()) if (c.userId === uid && c.token === l.token) liveCalls++;
    return { ...l, liveSse, liveCalls, connected: liveSse > 0 || liveCalls > 0 };
  });
}

function disconnectMcpByToken(uid, idOrToken) {
  const links = store.listMcpTokens(uid);
  const match = links.find((l) => l.id === idOrToken || l.token === idOrToken);
  const tok = match ? match.token : idOrToken;
  let closed = 0;
  for (const [sid, s] of mcpSseSessions.entries()) {
    if (s.userId === uid && s.token === tok) {
      clearInterval(s.hb);
      try { s.res.end(); } catch {}
      mcpSseSessions.delete(sid);
      closed++;
    }
  }
  for (const [cid, c] of mcpActiveCalls.entries()) {
    if (c.userId === uid && c.token === tok) {
      c.aborted = true;
      mcpActiveCalls.delete(cid);
      closed++;
    }
  }
  return closed;
}

function getPublicBaseUrl(req) {
  const rawProto = String(req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0].trim().toLowerCase();
  const proto = rawProto === 'http' ? 'http' : 'https';
  const rawHost = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost').split(',')[0].trim();
  const host = /^[a-zA-Z0-9._:\[\]-]{1,253}$/.test(rawHost) ? rawHost : 'localhost';
  const origPath = (req.originalUrl || req.url || '').split('?')[0];
  let prefix = BASE_PATH;
  if (!prefix) {
    const m = origPath.match(/^\/([^/]+)\/(?:mcp|oauth|\.well-known)(?:\/|$)/);
    if (m && !/^(?:api|ws|ws-vnc|admin|download|mcp|novnc|oauth|\.well-known)$/i.test(m[1])) {
      prefix = '/' + m[1];
    }
  }
  return `${proto}://${host}${prefix}`;
}

app.use(['/.well-known', '/oauth', '/mcp', '/mcp/:token'], (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID');
  res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id, WWW-Authenticate');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

function extractMcpTokenFromPath(p) {
  const m = String(p || '').match(/\/(mcp_[a-fA-F0-9]{16,64})(?:\/|$)/);
  return m ? m[1] : '';
}

app.get([
  '/.well-known/oauth-protected-resource',
  '/.well-known/oauth-protected-resource/*',
  '/mcp/.well-known/oauth-protected-resource',
  '/mcp/:token/.well-known/oauth-protected-resource',
], (req, res) => {
  const baseUrl = getPublicBaseUrl(req);
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const origin = `${proto}://${host}`;
  const origPath = (req.originalUrl || req.url || '').split('?')[0];
  let resourceUrl = `${baseUrl}/mcp`;
  const wkIdx = origPath.indexOf('/.well-known/oauth-protected-resource');
  if (wkIdx !== -1) {
    const before = origPath.slice(0, wkIdx);
    const after = origPath.slice(wkIdx + '/.well-known/oauth-protected-resource'.length);
    if (after && after.length > 1) {
      resourceUrl = `${origin}${after.startsWith('/term') || ! baseUrl.endsWith('/term') ? after : '/term' + after}`;
    } else if (before && /\/mcp(?:\/|$)/.test(before)) {
      resourceUrl = `${origin}${before}`;
    }
  }
  const tok = req.params?.token || extractMcpTokenFromPath(origPath);
  const authServer = tok ? `${baseUrl}/mcp/${tok}` : baseUrl;
  res.json({
    resource: resourceUrl,
    authorization_servers: [authServer],
    bearer_methods_supported: ['header', 'query'],
  });
});

app.get([
  '/.well-known/oauth-authorization-server',
  '/.well-known/oauth-authorization-server/*',
  '/.well-known/openid-configuration',
  '/.well-known/openid-configuration/*',
  '/mcp/.well-known/oauth-authorization-server',
  '/mcp/:token/.well-known/oauth-authorization-server',
  '/mcp/.well-known/openid-configuration',
  '/mcp/:token/.well-known/openid-configuration',
], (req, res) => {
  const baseUrl = getPublicBaseUrl(req);
  const origPath = (req.originalUrl || req.url || '').split('?')[0];
  const tok = req.params?.token || extractMcpTokenFromPath(origPath);
  const issuer = tok ? `${baseUrl}/mcp/${tok}` : baseUrl;
  const authEndpoint = tok ? `${baseUrl}/oauth/authorize?token=${encodeURIComponent(tok)}` : `${baseUrl}/oauth/authorize`;
  const tokenEndpoint = tok ? `${baseUrl}/oauth/token?token=${encodeURIComponent(tok)}` : `${baseUrl}/oauth/token`;
  res.json({
    issuer,
    authorization_endpoint: authEndpoint,
    token_endpoint: tokenEndpoint,
    registration_endpoint: `${baseUrl}/oauth/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token', 'client_credentials'],
    token_endpoint_auth_methods_supported: ['none', 'client_secret_post', 'client_secret_basic'],
    code_challenge_methods_supported: ['S256', 'plain'],
  });
});

const oauthClients = new Map();
const oauthCodes = new Map();
const TRUSTED_OAUTH_HOSTS = new Set([
  'vertexaisearch.google.com',
  'gemini.google.com',
  'claude.ai',
  'chatgpt.com',
  'chat.openai.com',
  'localhost',
  '127.0.0.1',
]);

function escHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function isAllowedRedirectUri(rawUri, clientId = '') {
  try {
    const u = new URL(String(rawUri || ''));
    const isLocal = u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1');
    if (u.protocol !== 'https:' && !isLocal) return false;
    if (clientId && oauthClients.has(clientId)) {
      const rec = oauthClients.get(clientId);
      if (rec.redirectUris.length > 0) return rec.redirectUris.includes(u.toString());
    }
    return TRUSTED_OAUTH_HOSTS.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function issueOauthCode(rawToken, redirectUri, codeChallenge = '', codeChallengeMethod = '') {
  if (oauthCodes.size >= 1000) {
    const first = oauthCodes.keys().next().value;
    if (first) oauthCodes.delete(first);
  }
  const code = 'oa_' + crypto.randomBytes(24).toString('hex');
  oauthCodes.set(code, {
    rawToken,
    redirectUri,
    codeChallenge,
    codeChallengeMethod,
    exp: Date.now() + 2 * 60 * 1000,
  });
  return code;
}

app.post('/oauth/register', (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (!checkRegRate(ip)) return res.status(429).json({ error: 'too_many_requests' });
  const rawUris = Array.isArray(req.body?.redirect_uris) ? req.body.redirect_uris : [];
  const validUris = [];
  for (const r of rawUris.slice(0, 10)) {
    try {
      const u = new URL(String(r));
      const isLocal = u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1');
      if (u.protocol === 'https:' || isLocal) validUris.push(u.toString());
    } catch {}
  }
  if (oauthClients.size >= 500) {
    const first = oauthClients.keys().next().value;
    if (first) oauthClients.delete(first);
  }
  const clientId = 'trm_client_' + crypto.randomBytes(8).toString('hex');
  const clientSecret = 'trm_secret_' + crypto.randomBytes(16).toString('hex');
  oauthClients.set(clientId, { clientSecret, redirectUris: validUris, createdAt: Date.now() });
  res.status(201).json({
    client_id: clientId,
    client_secret: clientSecret,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    client_secret_expires_at: 0,
    redirect_uris: validUris,
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: req.body?.token_endpoint_auth_method || 'none',
  });
});

app.get('/oauth/authorize', (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (!checkAuthRate(ip)) return res.status(429).send('Too many requests');
  const redirectUri = String(req.query.redirect_uri || '').trim();
  const state = String(req.query.state || '').slice(0, 512);
  const clientId = String(req.query.client_id || '').slice(0, 128);
  const codeChallenge = String(req.query.code_challenge || '').slice(0, 256);
  const codeChallengeMethod = String(req.query.code_challenge_method || '').slice(0, 16);
  if (!isAllowedRedirectUri(redirectUri, clientId)) {
    return res.status(400).send('Invalid redirect_uri');
  }
  const preToken = String(req.query.token || '').trim();
  if (preToken && authenticateToken(preToken, { allowMcp: true })) {
    const code = issueOauthCode(preToken, redirectUri, codeChallenge, codeChallengeMethod);
    const u = new URL(redirectUri);
    u.searchParams.set('code', code);
    if (state) u.searchParams.set('state', state);
    return res.redirect(u.toString());
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Termitron MCP Authorization</title><style>body{background:#121212;color:#eee;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px}form{background:#1e1e1e;border:1px solid #333;border-radius:8px;padding:24px;width:100%;max-width:380px}input{width:100%;box-sizing:border-box;padding:10px;margin:10px 0 16px;background:#2a2a2a;border:1px solid #444;color:#fff;border-radius:4px;font-size:14px}button{width:100%;padding:10px;background:#0078d4;color:#fff;border:none;border-radius:4px;font-size:14px;font-weight:600;cursor:pointer}</style></head><body><form method="POST" action=""><h3 style="margin:0 0 8px">Authorize Termitron MCP</h3><p style="font-size:13px;color:#aaa;margin:0 0 12px">Enter your Termitron MCP Token (mcp_...):</p><input type="hidden" name="redirect_uri" value="${escHtml(redirectUri)}"><input type="hidden" name="state" value="${escHtml(state)}"><input type="hidden" name="client_id" value="${escHtml(clientId)}"><input type="hidden" name="code_challenge" value="${escHtml(codeChallenge)}"><input type="hidden" name="code_challenge_method" value="${escHtml(codeChallengeMethod)}"><input type="password" name="token" placeholder="mcp_..." required autofocus><button type="submit">Approve &amp; Connect</button></form></body></html>`);
});

app.post('/oauth/authorize', express.urlencoded({ extended: false }), (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (!checkAuthRate(ip)) return res.status(429).send('Too many requests');
  const redirectUri = String(req.body?.redirect_uri || '').trim();
  const state = String(req.body?.state || '').slice(0, 512);
  const clientId = String(req.body?.client_id || '').slice(0, 128);
  const codeChallenge = String(req.body?.code_challenge || '').slice(0, 256);
  const codeChallengeMethod = String(req.body?.code_challenge_method || '').slice(0, 16);
  const tok = String(req.body?.token || '').trim();
  if (!isAllowedRedirectUri(redirectUri, clientId)) {
    return res.status(400).send('Invalid redirect_uri');
  }
  if (!tok || !authenticateToken(tok, { allowMcp: true })) {
    recordAuthFailure(ip);
    return res.status(401).send('Invalid token');
  }
  authFailures.delete(ip);
  const code = issueOauthCode(tok, redirectUri, codeChallenge, codeChallengeMethod);
  const u = new URL(redirectUri);
  u.searchParams.set('code', code);
  if (state) u.searchParams.set('state', state);
  return res.redirect(u.toString());
});

app.post('/oauth/token', express.urlencoded({ extended: false }), (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (!checkAuthRate(ip)) return res.status(429).json({ error: 'too_many_requests' });
  const grantType = String(req.body?.grant_type || 'authorization_code');
  if (grantType === 'refresh_token') {
    const rt = String(req.body?.refresh_token || '').trim();
    if (!rt || !authenticateToken(rt, { allowMcp: true })) {
      recordAuthFailure(ip);
      return res.status(400).json({ error: 'invalid_grant' });
    }
    return res.json({ access_token: rt, token_type: 'Bearer', expires_in: 3600, refresh_token: rt });
  }
  const code = String(req.body?.code || '').trim();
  const rec = code ? oauthCodes.get(code) : null;
  if (code) oauthCodes.delete(code);
  if (!rec || Date.now() > rec.exp) {
    const qTok = String(req.query?.token || '').trim();
    if (grantType === 'client_credentials' && qTok && authenticateToken(qTok, { allowMcp: true })) {
      return res.json({ access_token: qTok, token_type: 'Bearer', expires_in: 3600 });
    }
    recordAuthFailure(ip);
    return res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid or expired code' });
  }
  if (req.body?.redirect_uri && String(req.body.redirect_uri) !== rec.redirectUri) {
    return res.status(400).json({ error: 'invalid_grant', error_description: 'redirect_uri mismatch' });
  }
  if (rec.codeChallenge) {
    const verifier = String(req.body?.code_verifier || '');
    const expected = rec.codeChallengeMethod === 'S256'
      ? crypto.createHash('sha256').update(verifier).digest('base64url')
      : verifier;
    if (!verifier || !safeEqual(expected, rec.codeChallenge)) {
      return res.status(400).json({ error: 'invalid_grant', error_description: 'PKCE verification failed' });
    }
  }
  if (!authenticateToken(rec.rawToken, { allowMcp: true })) {
    return res.status(400).json({ error: 'invalid_grant' });
  }
  res.json({
    access_token: rec.rawToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: rec.rawToken,
  });
});

app.head(['/mcp', '/mcp/:token', '/mcp/:token/sse'], (req, res) => {
  const auth = resolveMcpAuth(req);
  if (!auth) {
    const baseUrl = getPublicBaseUrl(req);
    res.setHeader('WWW-Authenticate', `Bearer resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`);
    return res.status(401).end();
  }
  res.status(200).end();
});

app.get(['/mcp', '/mcp/:token', '/mcp/:token/sse'], (req, res) => {
  const auth = resolveMcpAuth(req);
  if (!auth) {
    const baseUrl = getPublicBaseUrl(req);
    res.setHeader('WWW-Authenticate', `Bearer resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`);
    return res.status(401).send('Unauthorized');
  }
  const accept = String(req.headers.accept || '');
  if (accept && !accept.includes('text/event-stream') && !accept.includes('*/*')) {
    return res.status(200).json({
      name: 'termitron-mcp',
      version: '1.0.0',
      protocolVersion: '2025-03-26',
      status: 'ok',
    });
  }
  const sid = crypto.randomBytes(12).toString('hex');
  res.set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    'X-LiteSpeed-Cache-Control': 'no-cache, no-store',
    'Content-Encoding': 'identity',
  });
  res.flushHeaders?.();
  const origPath = (req.originalUrl || req.url || '').split('?')[0];
  const mcpIdx = origPath.indexOf('/mcp');
  const prefix = BASE_PATH || (mcpIdx > 0 ? origPath.slice(0, mcpIdx) : '');
  const base = req.params?.token ? `${prefix}/mcp/${encodeURIComponent(req.params.token)}` : `${prefix}/mcp`;
  res.write(`: ${' '.repeat(2048)}\n\nevent: endpoint\ndata: ${base}?sessionId=${sid}\n\n`);
  const hb = setInterval(() => {
    try { res.write(': ping\n\n'); } catch {}
  }, 15000);
  store.recordMcpActivity(auth.rawToken, req.ip || '', req.headers['user-agent'] || '');
  mcpSseSessions.set(sid, { userId: auth.userId, token: auth.rawToken, res, hb, connectedAt: Date.now() });
  req.on('close', () => {
    clearInterval(hb);
    mcpSseSessions.delete(sid);
  });
});

app.delete(['/mcp', '/mcp/:token', '/mcp/:token/sse'], (req, res) => {
  const auth = resolveMcpAuth(req);
  if (!auth) return res.status(401).end();
  const sid = String(req.headers['mcp-session-id'] || req.query.sessionId || '');
  if (sid) mcp.clearSessionDedup?.(sid);
  if (sid && mcpSseSessions.has(sid)) {
    const s = mcpSseSessions.get(sid);
    if (s.userId === auth.userId) {
      clearInterval(s.hb);
      try { s.res.end(); } catch {}
      mcpSseSessions.delete(sid);
    }
  }
  res.status(204).end();
});

const activeClientSessions = new Map();
const clientWorkspaces = new Map();

function buildClientHosts(uid) {
  const us = store.forUser(uid);
  const secrets = us.loadSecrets();
  const own = us.loadHosts().map((h) => ({
    ...h,
    shared: false,
    had_pw: !!(h.id && secrets[h.id]?.password),
    had_key: !!(h.id && secrets[h.id]?.privateKey),
    had_passphrase: !!(h.id && secrets[h.id]?.passphrase),
    had_proxy_pass: !!(h.id && secrets[h.id]?.proxy_pass),
  }));
  return [...own, ...store.listSharedHostsForUser(uid)];
}

function closeSharedSessionsFor(cw, ownerId) {
  for (const [sid, s] of cw.sessions.entries()) {
    if (s.shared && s.shared.ownerId === ownerId) {
      for (const [tid, t] of cw.terms.entries()) {
        if (t.sid === sid) {
          try { t.close(); } catch {}
          cw.terms.delete(tid);
          try { cw.send({ type: 'term_exit', termId: tid }); } catch {}
        }
      }
      if (s.primeStream) try { s.primeStream.close(); } catch {}
      if (s.conn) try { s.conn.end(); } catch {}
      cw.sessions.delete(sid);
      activeClientSessions.delete(`${cw.clientId}:${sid}`);
      try { cw.send({ type: 'disconnected', sid }); } catch {}
    }
  }
}

function syncShareStateForUsers(ownerId, targetId) {
  for (const cw of clientWorkspaces.values()) {
    if (cw.userId === ownerId) {
      try {
        cw.send({
          type: 'shares_update',
          shares_out: store.listSharesByOwner(ownerId),
          shares_in: store.listPendingInvitesForTarget(ownerId),
          shares_accepted: store.listAcceptedSharesForTarget(ownerId),
        });
        cw.send({ type: 'hosts_update', hosts: buildClientHosts(ownerId) });
      } catch {}
    }
    if (cw.userId === targetId) {
      try {
        cw.send({
          type: 'shares_in_update',
          shares_in: store.listPendingInvitesForTarget(targetId),
          shares_accepted: store.listAcceptedSharesForTarget(targetId),
        });
        cw.send({ type: 'hosts_update', hosts: buildClientHosts(targetId) });
      } catch {}
    }
  }
}

function onMcpShareChange({ type, ownerId, targetId }) {
  if (type === 'revoke' || type === 'leave') {
    for (const cw of clientWorkspaces.values()) {
      if (cw.userId === (type === 'revoke' ? targetId : ownerId)) {
        closeSharedSessionsFor(cw, type === 'revoke' ? ownerId : targetId);
      }
    }
  }
  syncShareStateForUsers(ownerId, targetId);
}

function getMcpActiveSessions(uid) {
  const out = [];
  for (const [key, sess] of activeClientSessions.entries()) {
    if (sess.userId === uid) {
      const colon = key.indexOf(':');
      out.push({ sid: key.slice(colon + 1), sess });
    }
  }
  return out;
}

app.post(['/mcp', '/mcp/:token', '/mcp/:token/sse'], express.text({ type: '*/*', limit: '1mb' }), async (req, res) => {
  const auth = resolveMcpAuth(req);
  if (!auth) {
    const baseUrl = getPublicBaseUrl(req);
    res.setHeader('WWW-Authenticate', `Bearer resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`);
    return res.status(401).json({ jsonrpc: '2.0', id: req.body?.id ?? null, error: { code: -32001, message: 'Unauthorized' } });
  }
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const sid = String(req.query.sessionId || '');
  const sse = sid ? mcpSseSessions.get(sid) : null;
  if (sse && sse.userId !== auth.userId) return res.status(403).end();
  store.recordMcpActivity(auth.rawToken, req.ip || '', req.headers['user-agent'] || '');
  const callId = crypto.randomBytes(6).toString('hex');
  mcpActiveCalls.set(callId, { userId: auth.userId, token: auth.rawToken, startedAt: Date.now() });
  const reqMethod = Array.isArray(body) ? body.find((x) => x?.method === 'initialize')?.method : body?.method;
  const mcpSid = String(req.headers['mcp-session-id'] || sid || '') || (reqMethod === 'initialize' ? crypto.randomBytes(12).toString('hex') : '');
  let resp;
  try {
    const mcpPerms = store.getMcpTokenPermissions(auth.rawToken);
    resp = await mcp.handleRpc(auth.userId, body, getMcpActiveSessions, onMcpShareChange, mcpPerms, mcpSid);
  } finally {
    mcpActiveCalls.delete(callId);
  }
  if (sse) {
    if (resp) {
      try { sse.res.write(`event: message\ndata: ${JSON.stringify(resp)}\n\n`); } catch {}
    }
    return res.status(202).end();
  }
  if (mcpSid) res.setHeader('Mcp-Session-Id', mcpSid);
  if (!resp) return res.status(202).end();
  res.json(resp);
});

let ADMIN_KEY = store.getOrCreateAdminKey();
const adminTokens = new Map();
const trafficStats = { totalRx: 0, totalTx: 0, byUser: new Map() };
function recordTraffic(uid, rx, tx) {
  const key = uid || 'default';
  let rec = trafficStats.byUser.get(key);
  if (!rec) {
    rec = { rx: 0, tx: 0 };
    trafficStats.byUser.set(key, rec);
  }
  if (rx > 0) { trafficStats.totalRx += rx; rec.rx += rx; }
  if (tx > 0) { trafficStats.totalTx += tx; rec.tx += tx; }
}

function requireAdmin(req, res, next) {
  const hdr = req.headers.authorization || '';
  const tok = hdr.startsWith('Bearer ') ? hdr.slice(7).trim() : (req.headers['x-admin-token'] || '');
  const exp = tok ? adminTokens.get(tok) : 0;
  if (!exp || Date.now() > exp) {
    if (tok) adminTokens.delete(tok);
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  adminTokens.set(tok, Date.now() + ADMIN_TTL_MS);
  req.adminToken = tok;
  next();
}

app.get(/^\/[^/]+\/?$/, (req, res, next) => {
  const cleanPath = req.path.replace(/\/+$/, '') || '/';
  const adminPath = store.getSetup().adminPath || '/admin';
  if (cleanPath === adminPath) {
    return res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  }
  if (cleanPath === '/api' || cleanPath === '/mcp' || cleanPath.includes('.')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/admin/login', (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (!checkAuthRate(ip)) {
    return res.status(429).json({ ok: false, error: 'Too many failed attempts. Try again in 1 minute.' });
  }
  const key = String(req.body?.key || '').trim();
  if (key && safeEqual(key, ADMIN_KEY)) {
    authFailures.delete(ip);
    if (adminTokens.size >= 500) {
      const first = adminTokens.keys().next().value;
      if (first) adminTokens.delete(first);
    }
    const token = crypto.randomBytes(24).toString('hex');
    adminTokens.set(token, Date.now() + ADMIN_TTL_MS);
    return res.json({ ok: true, token });
  }
  recordAuthFailure(ip);
  return res.status(401).json({ ok: false, error: 'Invalid admin key.' });
});

app.get('/api/admin/overview', requireAdmin, (req, res) => {
  const activeSessions = [];
  for (const [key, sess] of activeClientSessions.entries()) {
    const colon = key.indexOf(':');
    activeSessions.push({
      key,
      clientId: key.slice(0, colon),
      sid: key.slice(colon + 1),
      userId: sess.userId || 'default',
      name: sess.profile?.name || sess.profile?.host || '',
      host: sess.profile?.host || '',
      port: Number(sess.profile?.port) || 22,
      proxy: sess.profile?.proxy_mode === 'socks5' && sess.profile?.proxy_host
        ? `${sess.profile.proxy_host}:${sess.profile.proxy_port || 1080}`
        : 'Default VPN',
      connectedAt: sess.connectedAt || 0,
      bytesRx: sess.traffic?.rx || 0,
      bytesTx: sess.traffic?.tx || 0,
    });
  }
  res.json({
    ok: true,
    uptimeSec: Math.floor(process.uptime()),
    memoryMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    nodeVersion: process.version,
    wsClients: wss.clients.size,
    activeSessions,
    traffic: { totalRx: trafficStats.totalRx, totalTx: trafficStats.totalTx },
    registrationEnabled: store.getGlobalPolicy().registrationEnabled !== false,
    vpn: { ...vpnMgr.getAdminStatus(), ...store.getGlobalPolicy() },
  });
});

app.post('/api/admin/registration/policy', requireAdmin, (req, res) => {
  const policy = store.saveGlobalPolicy({ registrationEnabled: !!req.body?.registrationEnabled });
  res.json({ ok: true, registrationEnabled: policy.registrationEnabled !== false });
});

app.post('/api/admin/vpn/policy', requireAdmin, (req, res) => {
  const policy = store.saveGlobalPolicy({ allowWithoutVpn: !!req.body?.allowWithoutVpn });
  res.json({ ok: true, vpn: { ...vpnMgr.getAdminStatus(), ...policy } });
});

app.post('/api/admin/vpn/save', requireAdmin, (req, res) => {
  try {
    const filename = vpnMgr.saveDefaultConf(req.body?.filename, req.body?.content);
    res.json({ ok: true, filename, vpn: { ...vpnMgr.getAdminStatus(), ...store.getGlobalPolicy() } });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

app.post('/api/admin/vpn/delete', requireAdmin, (req, res) => {
  const ok = vpnMgr.deleteDefaultConf(req.body?.filename);
  res.json({ ok, vpn: { ...vpnMgr.getAdminStatus(), ...store.getGlobalPolicy() } });
});

function closeAllActiveSessions(reason) {
  let count = 0;
  try { mcp.closeAllConns?.(); } catch {}
  for (const [key, sess] of activeClientSessions.entries()) {
    try { sess.primeStream?.close(); } catch {}
    try { sess.conn?.end(); } catch {}
    activeClientSessions.delete(key);
    count++;
  }
  for (const wsState of clientWorkspaces.values()) {
    for (const [tid, t] of wsState.terms.entries()) {
      try { t.close(); } catch {}
      wsState.terms.delete(tid);
    }
    for (const sid of Array.from(wsState.sessions.keys())) {
      wsState.sessions.delete(sid);
      try { wsState.send({ type: 'disconnected', sid }); } catch {}
    }
    if (reason) {
      try { wsState.toast(reason, 'warn'); } catch {}
    }
  }
  return count;
}

app.post('/api/admin/vpn/action', requireAdmin, async (req, res) => {
  const act = String(req.body?.action || '');
  try {
    if (act === 'test') {
      const exitIp = await vpnMgr.testDefaultExitIp(store.DATA_DIR);
      return res.json({ ok: true, exitIp, vpn: { ...vpnMgr.getAdminStatus(), ...store.getGlobalPolicy() } });
    }
    if (act === 'stop') {
      closeAllActiveSessions('VPN stopped by administrator. Active connections closed.');
      vpnMgr.stopWireproxy('__default__');
      const policy = store.saveGlobalPolicy({ vpnEnabled: false });
      return res.json({ ok: true, vpn: { ...vpnMgr.getAdminStatus(), ...policy } });
    }
    closeAllActiveSessions('VPN restarted by administrator. Active connections closed.');
    if (act === 'restart') vpnMgr.stopWireproxy('__default__');
    const policy = store.saveGlobalPolicy({ vpnEnabled: true });
    await vpnMgr.ensureDefaultTunnel(store.DATA_DIR);
    res.json({ ok: true, vpn: { ...vpnMgr.getAdminStatus(), ...policy } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, vpn: { ...vpnMgr.getAdminStatus(), ...store.getGlobalPolicy() } });
  }
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = store.listUsers().map((u) => {
    const us = store.forUser(u.userId);
    const hosts = us.loadHosts();
    let activeCount = 0;
    for (const s of activeClientSessions.values()) if (s.userId === u.userId) activeCount++;
    const tr = trafficStats.byUser.get(u.userId) || { rx: 0, tx: 0 };
    return { ...u, hostCount: hosts.length, activeSessions: activeCount, bytesRx: tr.rx, bytesTx: tr.tx };
  });
  res.json({ ok: true, users });
});

app.post('/api/admin/users/create', requireAdmin, (req, res) => {
  const { userId, accessKey } = store.registerUser();
  res.json({ ok: true, userId, accessKey });
});

function evictUserEverywhere(uid) {
  if (!uid || uid === 'default') return;
  try { mcp.closeUserConns?.(uid); } catch {}
  for (const [tok, rec] of sessionTokens.entries()) {
    if (rec.userId === uid) sessionTokens.delete(tok);
  }
  for (const [sid, s] of mcpSseSessions.entries()) {
    if (s.userId === uid) {
      clearInterval(s.hb);
      try { s.res.end(); } catch {}
      mcpSseSessions.delete(sid);
    }
  }
  for (const [cid, c] of mcpActiveCalls.entries()) {
    if (c.userId === uid) {
      c.aborted = true;
      mcpActiveCalls.delete(cid);
    }
  }
  for (const [key, sess] of activeClientSessions.entries()) {
    if (sess.userId === uid) {
      try { sess.primeStream?.close(); } catch {}
      try { sess.conn?.end(); } catch {}
      activeClientSessions.delete(key);
    }
  }
  for (const [cid, cw] of clientWorkspaces.entries()) {
    if (cw.userId === uid) {
      if (cw.cleanupTimer) clearTimeout(cw.cleanupTimer);
      for (const t of cw.terms.values()) try { t.close(); } catch {}
      for (const s of cw.sessions.values()) {
        try { s.primeStream?.close(); } catch {}
        try { s.conn?.end(); } catch {}
      }
      clientWorkspaces.delete(cid);
    }
  }
  for (const client of wss.clients) {
    if (client._userId === uid) {
      try { client.close(1008, 'Account disabled'); } catch {}
    }
  }
  for (const client of vncWss.clients) {
    if (client._userId === uid) {
      try { client.close(1008, 'Account disabled'); } catch {}
    }
  }
}

app.post('/api/admin/users/toggle', requireAdmin, (req, res) => {
  const uid = String(req.body?.userId || '');
  if (!store.isValidUserId(uid) || uid === 'default') {
    return res.status(400).json({ ok: false, error: 'Invalid user identifier' });
  }
  const disabled = !!req.body?.disabled;
  store.setUserDisabled(uid, disabled);
  if (disabled) evictUserEverywhere(uid);
  res.json({ ok: true });
});

app.post('/api/admin/users/note', requireAdmin, (req, res) => {
  const uid = String(req.body?.userId || '');
  if (!store.isValidUserId(uid)) {
    return res.status(400).json({ ok: false, error: 'Invalid user identifier' });
  }
  const note = String(req.body?.note || '');
  store.setUserNote(uid, note);
  res.json({ ok: true });
});

app.post('/api/admin/users/delete', requireAdmin, (req, res) => {
  const uid = String(req.body?.userId || '');
  if (!store.isValidUserId(uid) || uid === 'default') {
    return res.status(400).json({ ok: false, error: 'Invalid user identifier' });
  }
  evictUserEverywhere(uid);
  store.deleteUser(uid);
  res.json({ ok: true });
});

app.get('/api/admin/servers', requireAdmin, (req, res) => {
  const list = [];
  const collect = (uid) => {
    const us = store.forUser(uid);
    const sec = us.loadSecrets();
    for (const h of us.loadHosts()) {
      list.push({
        userId: uid,
        id: h.id,
        name: h.name || h.host,
        host: h.host,
        port: Number(h.port) || 22,
        user: h.user || 'root',
        auth: h.auth || 'password',
        group: h.group || '',
        proxy_mode: h.proxy_mode || 'none',
        proxy: h.proxy_mode === 'socks5' && h.proxy_host ? `${h.proxy_host}:${h.proxy_port || 1080}` : '',
        had_pw: !!(h.id && sec[h.id]?.password),
      });
    }
  };
  collect('default');
  for (const u of store.listUsers()) collect(u.userId);
  res.json({ ok: true, servers: list });
});

app.post('/api/admin/servers/delete', requireAdmin, (req, res) => {
  const uid = String(req.body?.userId || 'default');
  const hid = String(req.body?.hostId || '');
  if (!store.isValidUserId(uid) || !isSafeId(hid)) {
    return res.status(400).json({ ok: false, error: 'Invalid identifier' });
  }
  const us = store.forUser(uid);
  const hosts = us.loadHosts().filter((h) => h.id !== hid);
  us.saveHosts(hosts);
  const sec = us.loadSecrets();
  if (sec[hid]) { delete sec[hid]; us.saveSecrets(sec); }
  res.json({ ok: true });
});

app.post('/api/admin/sessions/kill', requireAdmin, (req, res) => {
  const targetKey = req.body?.key;
  const killAll = !!req.body?.all;
  let killed = 0;
  for (const [key, sess] of activeClientSessions.entries()) {
    if (killAll || key === targetKey) {
      try { sess.primeStream?.close(); } catch {}
      try { sess.conn?.end(); } catch {}
      activeClientSessions.delete(key);
      killed++;
    }
  }
  res.json({ ok: true, killed });
});

app.post('/api/admin/key', requireAdmin, (req, res) => {
  try {
    ADMIN_KEY = store.setAdminKey(req.body?.newKey);
    for (const tok of Array.from(adminTokens.keys())) {
      if (tok !== req.adminToken) adminTokens.delete(tok);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

function sudoExec(conn, pw, cmd, timeoutMs = 20000, maxBytes = 10 * 1024 * 1024, stdinBuf = null) {
  return new Promise((resolve, reject) => {
    const full = pw ? `sudo -S -p '' ${cmd}` : `sudo -n ${cmd}`;
    conn.exec(full, (err, stream) => {
      if (err) return reject(err);
      const outChunks = [];
      const errChunks = [];
      let total = 0, settled = false;
      const done = (res) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(res);
      };
      const timer = setTimeout(() => {
        try { stream.close(); } catch {}
        done({ out: Buffer.concat(outChunks), err: 'Command timed out', code: 124 });
      }, timeoutMs);
      if (pw) stream.write(pw + '\n');
      if (stdinBuf) {
        stream.end(stdinBuf);
      } else if (pw) {
        stream.end();
      }
      stream.on('data', (d) => {
        if (total < maxBytes) {
          outChunks.push(d);
          total += d.length;
        }
      });
      stream.stderr.on('data', (d) => {
        if (errChunks.length < 64) errChunks.push(d);
      });
      stream.on('close', (code) => {
        done({
          out: Buffer.concat(outChunks),
          err: Buffer.concat(errChunks).toString('utf8'),
          code: code ?? 0,
        });
      });
    });
  });
}

async function sudoList(conn, pw, dir) {
  const q = dockerMgr.quote(dir);
  const r = await sudoExec(conn, pw, `sh -c ${dockerMgr.quote(`ls -laL --time-style=+%s ${q} 2>/dev/null || ls -la ${q}`)}`);
  if (r.code !== 0) throw new Error(r.err || 'Root listing failed');
  const lines = r.out.toString('utf8').split(/\r?\n/);
  const out = [];
  for (const line of lines) {
    if (!line || line.startsWith('total ')) continue;
    const m = line.match(/^([dl\-cbps])[\w\-+@.]+\s+\d+\s+\S+\s+\S+\s+(\d+)\s+(\d+)\s+(.+)$/);
    if (!m) continue;
    const name = m[4];
    if (name === '.' || name === '..') continue;
    const isDir = m[1] === 'd';
    out.push({ name, isDir, size: isDir ? 0 : Number(m[2]) || 0, mtime: Number(m[3]) || 0 });
  }
  out.sort((a, b) => (a.isDir !== b.isDir ? (a.isDir ? -1 : 1) : a.name.toLowerCase().localeCompare(b.name.toLowerCase())));
  return out;
}

app.get('/download/:id/:name', async (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (!checkAuthRate(ip)) return res.status(429).send('Too many requests');
  const auth = authenticateToken(req.query.token);
  if (!auth) {
    recordAuthFailure(ip);
    return res.status(401).send('Unauthorized');
  }
  const item = downloads.get(req.params.id);
  if (!item || item.userId !== auth.userId) return res.status(404).send('Not found');
  downloads.delete(req.params.id);
  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${String(item.name || 'file').replace(/[\r\n"\\/;]/g, '_')}"`,
    'Cache-Control': 'no-store',
  });
  if (item.sudo) {
    try {
      const r = await sudoExec(item.conn, item.sudoPw, `cat -- ${dockerMgr.quote(item.path)}`);
      if (r.code !== 0) return res.status(500).type('text/plain').send(r.err || 'Read error');
      return res.send(r.out);
    } catch (e) {
      return res.status(500).type('text/plain').send(e?.message || 'Read error');
    }
  }
  const rs = item.sftp.createReadStream(item.path);
  rs.on('error', (e) => {
    if (!res.headersSent) res.status(500).type('text/plain').send(e?.message || 'Read error');
  });
  rs.pipe(res);
});

const MEDIA_MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.bmp': 'image/bmp', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.mkv': 'video/x-matroska', '.ogv': 'video/ogg',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.flac': 'audio/flac',
  '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.opus': 'audio/opus',
};

app.get('/api/media', async (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (!checkAuthRate(ip)) return res.status(429).type('text/plain').send('Too many requests');
  const auth = authenticateToken(req.query.token);
  if (!auth) {
    recordAuthFailure(ip);
    return res.status(401).type('text/plain').send('Unauthorized');
  }
  const sess = activeClientSessions.get(`${req.query.clientId || ''}:${req.query.sid || ''}`);
  const filePath = String(req.query.path || '');
  if (!sess || sess.userId !== auth.userId || !filePath) return res.status(404).type('text/plain').send('Not found');
  let liveShare = null;
  if (sess.shared) {
    liveShare = store.resolveSharedHost(auth.userId, sess.shared.hostId, sess.shared.ownerId);
    if (!liveShare || !liveShare.permissions.files_read) return res.status(403).type('text/plain').send('Forbidden');
  }
  const ext = path.extname(filePath).toLowerCase();
  const mime = MEDIA_MIME[ext] || 'application/octet-stream';
  if (ext === '.svg') res.setHeader('Content-Security-Policy', 'sandbox');

  if (sess.sudo) {
    if (sess.shared && !liveShare?.permissions?.sudo) return res.status(403).type('text/plain').send('Forbidden');
    try {
      const r = await sudoExec(sess.conn, sess.sudoPw, `cat -- ${dockerMgr.quote(filePath)}`);
      if (r.code !== 0) return res.status(500).type('text/plain').send(r.err || 'Read error');
      res.set({ 'Content-Type': mime, 'Cache-Control': 'no-store' });
      return res.send(r.out);
    } catch (e) {
      return res.status(500).type('text/plain').send(e?.message || 'Read error');
    }
  }

  if (!sess.sftp) return res.status(503).type('text/plain').send('SFTP is not ready');
  sess.sftp.stat(filePath, (err, st) => {
    if (err || !st) return res.status(404).type('text/plain').send(err?.message || 'File not found');
    const total = st.size || 0;
    const range = req.headers.range;
    if (range && total > 0) {
      const m = range.match(/bytes=(\d*)-(\d*)/);
      const start = m && m[1] ? parseInt(m[1], 10) : 0;
      const end = m && m[2] ? Math.min(total - 1, parseInt(m[2], 10)) : total - 1;
      if (start >= total || start > end) {
        return res.status(416).set('Content-Range', `bytes */${total}`).end();
      }
      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(end - start + 1),
        'Content-Type': mime,
      });
      const rs = sess.sftp.createReadStream(filePath, { start, end });
      rs.on('error', () => { if (!res.headersSent) res.status(500).end(); });
      return rs.pipe(res);
    }
    res.set({
      'Content-Type': mime,
      'Content-Length': String(total),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
    });
    const rs = sess.sftp.createReadStream(filePath);
    rs.on('error', (e) => { if (!res.headersSent) res.status(500).type('text/plain').send(e?.message || 'Read error'); });
    rs.pipe(res);
  });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err && Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  res.status(status).json({ ok: false, error: status === 400 ? 'Bad request' : 'Internal server error' });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true, maxPayload: 25 * 1024 * 1024 });
const vncWss = new WebSocketServer({ noServer: true, perMessageDeflate: false, maxPayload: 16 * 1024 * 1024 });

server.on('upgrade', (req, socket, head) => {
  const ip = req.socket?.remoteAddress || 'unknown';
  if (!checkAuthRate(ip)) {
    socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n');
    return socket.destroy();
  }
  const origin = req.headers.origin;
  const expectedHosts = new Set(
    [req.headers.host, req.headers['x-forwarded-host']]
      .filter(Boolean)
      .map((h) => String(h).split(',')[0].trim().toLowerCase())
  );
  if (origin && expectedHosts.size > 0) {
    try {
      const oHost = new URL(origin).host.toLowerCase();
      if (!expectedHosts.has(oHost)) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        return socket.destroy();
      }
    } catch {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      return socket.destroy();
    }
  }
  let url;
  try {
    const rawUrl = stripBasePath(req.url || '/');
    url = new URL(rawUrl, 'http://localhost');
  } catch {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    return socket.destroy();
  }
  const auth = authenticateToken(url.searchParams.get('token'));
  if (!auth) {
    recordAuthFailure(ip);
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    return socket.destroy();
  }
  if (url.pathname === '/ws') {
    return wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req, auth.userId));
  }
  if (url.pathname === '/ws-vnc') {
    return vncWss.handleUpgrade(req, socket, head, (ws) => vncWss.emit('connection', ws, url, auth.userId));
  }
  return socket.destroy();
});

vncWss.on('connection', (ws, url, userId) => {
  ws._userId = userId;
  ws._socket?.setNoDelay?.(true);
  const clientId = url.searchParams.get('clientId') || '';
  const sid = url.searchParams.get('sid') || '';
  const vncHost = (url.searchParams.get('host') || '127.0.0.1').trim();
  const vncPort = parseInt(url.searchParams.get('port') || '5900', 10);
  if (!/^[a-zA-Z0-9._:\[\]-]{1,253}$/.test(vncHost) || !Number.isInteger(vncPort) || vncPort < 1 || vncPort > 65535) {
    ws.close(1008, 'Invalid VNC target');
    return;
  }
  const sess = activeClientSessions.get(`${clientId}:${sid}`);
  if (!sess?.conn || sess.userId !== userId) {
    ws.close(1011, 'No active SSH session found');
    return;
  }
  if (sess.shared) {
    const live = store.resolveSharedHost(userId, sess.shared.hostId, sess.shared.ownerId);
    if (!live || !live.permissions.vnc) {
      ws.close(1008, 'VNC permission denied');
      return;
    }
    if (!live.permissions.sudo && !['127.0.0.1', 'localhost', '::1'].includes(vncHost.toLowerCase())) {
      ws.close(1008, 'Shared VNC restricted to localhost');
      return;
    }
  }
  sess.conn.forwardOut('127.0.0.1', 0, vncHost, vncPort, (err, stream) => {
    if (err || !stream) {
      ws.close(1011, err?.message || 'Failed to open VNC tunnel');
      return;
    }
    let paused = false;
    let drainTimer = null;
    const clearDrain = () => {
      if (drainTimer) {
        clearInterval(drainTimer);
        drainTimer = null;
      }
    };
    stream.on('data', (chunk) => {
      if (ws.readyState !== 1) return;
      ws.send(chunk, { binary: true });
      if (!paused && ws.bufferedAmount > 512 * 1024) {
        paused = true;
        stream.pause();
        clearDrain();
        drainTimer = setInterval(() => {
          if (ws.readyState !== 1 || ws.bufferedAmount < 128 * 1024) {
            clearDrain();
            paused = false;
            if (ws.readyState === 1) stream.resume();
          }
        }, 16);
      }
    });
    ws.on('error', () => {});
    stream.on('close', () => {
      clearDrain();
      if (ws.readyState === 1) ws.close();
    });
    stream.on('error', () => {
      clearDrain();
      if (ws.readyState === 1) ws.close(1011, 'VNC stream error');
    });
    ws.on('message', (data) => {
      const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
      if (stream.writable) stream.write(buf);
    });
    ws.on('close', () => {
      clearDrain();
      try { stream.close(); } catch {}
    });
  });
});

wss.on('connection', (ws, req, userId = 'default') => {
  ws._userId = userId;
  const uStore = store.forUser(userId);
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  let clientId = '';
  let wsState = null;
  let sessions = new Map();
  let terms = new Map();
  const pendingHostKeys = new Map();
  const pendingSecrets = new Map();
  const allocId = () => (wsState ? wsState.nextId++ : 1);

  const send = (obj) => {
    if (ws.readyState === 1) ws.send(JSON.stringify(obj));
  };
  const toast = (text, kind = 'info') => (wsState ? wsState.toast(text, kind) : send({ type: 'toast', text, kind }));

  function askHostKey(kind, host, fp, old) {
    return new Promise((resolve) => {
      const reqId = allocId();
      const timer = setTimeout(() => {
        if (pendingHostKeys.delete(reqId)) resolve(false);
      }, 120000);
      pendingHostKeys.set(reqId, (allow) => { clearTimeout(timer); resolve(allow); });
      (wsState ? wsState.send : send)({ type: 'ask_hostkey', reqId, kind, host, fp, old });
    });
  }

  function askSecret(title, target, allowSave) {
    return new Promise((resolve) => {
      const reqId = allocId();
      const timer = setTimeout(() => {
        if (pendingSecrets.delete(reqId)) resolve(null);
      }, 120000);
      pendingSecrets.set(reqId, (sec) => { clearTimeout(timer); resolve(sec); });
      (wsState ? wsState.send : send)({ type: 'ask_secret', reqId, title, target, allowSave });
    });
  }

  function parseHostOptions(profile) {
    const env = {};
    let keepalive = 0;
    let compress = false;

    for (const raw of (profile?.env || '').split(/\r?\n/)) {
      const line = raw.trim().replace(/^export\s+/, '');
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq > 0) {
        const k = line.slice(0, eq).trim();
        const v = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        if (k) env[k] = v;
      }
    }

    for (const raw of (profile?.options || '').split(/\r?\n/)) {
      let line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      if (line.startsWith('-o ')) line = line.slice(3).trim();
      else if (line.startsWith('-o=')) line = line.slice(3).trim();

      const m = line.match(/^([A-Za-z0-9_]+)\s*(?:=|\s+)\s*(.+)$/);
      if (!m) continue;
      const key = m[1].toLowerCase();
      const val = m[2].trim();

      if (key === 'serveraliveinterval') {
        const n = parseInt(val, 10);
        if (Number.isFinite(n) && n > 0) keepalive = n;
      } else if (key === 'compression') {
        compress = /^(yes|true|1)$/i.test(val);
      } else if (key === 'setenv') {
        const eq = val.indexOf('=');
        if (eq > 0) {
          const k = val.slice(0, eq).trim();
          const v = val.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
          if (k) env[k] = v;
        }
      }
    }
    return { env, keepalive, compress };
  }

  async function connectSsh(profile, depth = 0, targetUid = userId, targetStore = uStore, sharedMeta = null) {
    if (depth > 3) throw new Error('Jump host chain too deep.');
    const savedHosts = targetStore.loadHosts();
    const pid = isSafeId(profile?.id) ? profile.id : '';
    const savedHost = pid ? savedHosts.find((h) => h.id === pid) : null;
    const matchesSaved = !!(
      savedHost &&
      String(profile?.host || '').trim() === String(savedHost.host || '').trim() &&
      (Number(profile?.port) || 22) === (Number(savedHost.port) || 22) &&
      (profile?.user || 'root') === (savedHost.user || 'root')
    );
    const effectiveProfile = matchesSaved
      ? {
          ...profile,
          ...savedHost,
          host: savedHost.host,
          port: savedHost.port,
          user: savedHost.user,
          auth: savedHost.auth,
          jump_id: savedHost.jump_id,
          proxy_mode: savedHost.proxy_mode,
          proxy_host: savedHost.proxy_host,
          proxy_port: savedHost.proxy_port,
          proxy_user: savedHost.proxy_user,
          startup: savedHost.startup,
          env: savedHost.env,
          options: savedHost.options,
        }
      : profile;
    const hostStr = String(effectiveProfile?.host || '').trim();
    const portNum = Number(effectiveProfile?.port) || 22;
    const safeTargetIp = await vpnMgr.resolveAndValidateTarget(hostStr, portNum);
    const secrets = matchesSaved ? targetStore.loadSecrets() : {};
    const conn = new SshClient();
    const { keepalive, compress } = parseHostOptions(effectiveProfile);
    const hideAddr = !!(sharedMeta && !sharedMeta.permissions?.show_address);
    const displayTarget = hideAddr ? (effectiveProfile.name || 'Shared Server') : `${effectiveProfile.user || 'root'}@${hostStr}`;

    let password = pid && secrets[pid]?.password ? secrets[pid].password : (targetUid === userId ? effectiveProfile.password || '' : '');
    if ((effectiveProfile.auth || 'password') === 'password' && !password) {
      const ans = await askSecret('SSH Password', displayTarget, !!pid && matchesSaved && targetUid === userId);
      if (!ans) throw new Error('Connection cancelled.');
      password = ans.value;
      if (ans.save && pid && matchesSaved && targetUid === userId) {
        const allSec = targetStore.loadSecrets();
        allSec[pid] = { ...(allSec[pid] || {}), password };
        targetStore.saveSecrets(allSec);
      }
    }

    let privateKey;
    let passphrase = pid && secrets[pid]?.passphrase ? secrets[pid].passphrase : (targetUid === userId ? effectiveProfile.passphrase || '' : '');
    if (effectiveProfile.auth === 'key' && pid && secrets[pid]?.privateKey) {
      privateKey = secrets[pid].privateKey;
    }

    let sockStream;
    if (effectiveProfile.jump_id) {
      const jumpHost = savedHosts.find((h) => h.id === effectiveProfile.jump_id);
      if (jumpHost) {
        const jConn = await connectSsh(jumpHost, depth + 1, targetUid, targetStore, sharedMeta);
        sockStream = await new Promise((res, rej) => {
          jConn.forwardOut('127.0.0.1', 0, safeTargetIp, portNum, (err, s) => {
            if (err) { try { jConn.end(); } catch {} return rej(err); }
            s.on('close', () => { try { jConn.end(); } catch {} });
            res(s);
          });
        });
      }
    } else {
      const proxyPass = (pid && secrets[pid]?.proxy_pass) || (targetUid === userId ? effectiveProfile.proxy_pass || '' : '');
      const vpnCfg = effectiveProfile.proxy_mode === 'socks5' && effectiveProfile.proxy_host
        ? {
            mode: 'socks5',
            socksHost: String(effectiveProfile.proxy_host).trim(),
            socksPort: Number(effectiveProfile.proxy_port) || 1080,
            socksUser: effectiveProfile.proxy_user || '',
            socksPass: proxyPass,
          }
        : { mode: 'default' };
      sockStream = await vpnMgr.connectThroughVpn(
        targetUid,
        targetStore,
        store.DATA_DIR,
        vpnCfg,
        safeTargetIp,
        portNum,
        store.getGlobalPolicy()
      );
    }

    const traffic = { rx: 0, tx: 0 };
    if (sockStream) {
      sockStream.on('data', (chunk) => {
        traffic.rx += chunk.length;
        recordTraffic(userId, chunk.length, 0);
      });
      const origWrite = sockStream.write.bind(sockStream);
      sockStream.write = (chunk, ...args) => {
        const len = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk || ''));
        traffic.tx += len;
        recordTraffic(userId, 0, len);
        return origWrite(chunk, ...args);
      };
      conn._traffic = traffic;
    }

    const khName = Number(effectiveProfile.port || 22) === 22 ? hostStr : `[${hostStr}]:${effectiveProfile.port}`;
    const displayKhName = hideAddr ? (effectiveProfile.name || 'Shared Server') : khName;
    await new Promise((resolve, reject) => {
      conn.on('ready', () => {
        conn._sock?.setNoDelay?.(true);
        resolve();
      });
      conn.on('error', reject);
      conn.on('keyboard-interactive', (n, i, l, prompts, finish) => finish(prompts.map(() => password)));

      const cfg = {
        host: safeTargetIp,
        port: portNum,
        username: effectiveProfile.user || 'root',
        tryKeyboard: true,
        readyTimeout: 25000,
        keepaliveInterval: (Number(effectiveProfile.keepalive) || 30) * 1000,
        keepaliveCountMax: 3,
        hostVerifier: (keyBuf, cb) => {
          const b64 = keyBuf.toString('base64');
          const fp = targetStore.fingerprintB64(b64);
          const kh = targetStore.loadKnownHosts();
          const same = kh.filter((e) => e.host === khName);
          if (same.some((e) => e.key === b64)) return cb(true);
          askHostKey(same.length === 0 ? 'new' : 'changed', displayKhName, fp, same.map((e) => targetStore.fingerprintB64(e.key))).then((allow) => {
            if (allow && targetUid === userId) {
              const filtered = kh.filter((e) => e.host !== khName);
              filtered.push({ host: khName, ktype: 'ssh-key', key: b64, fp });
              targetStore.saveKnownHosts(filtered);
            }
            cb(allow);
          });
        },
      };
      if (sockStream) cfg.sock = sockStream;
      if (effectiveProfile.auth === 'key' && privateKey) {
        cfg.privateKey = privateKey;
        if (passphrase) cfg.passphrase = passphrase;
      } else if (effectiveProfile.auth === 'agent') {
        if (targetUid !== 'default' || !['1', 'true'].includes((process.env.TERM_ALLOW_SSH_AGENT || '').toLowerCase())) {
          return reject(new Error('SSH agent authentication is disabled on this server.'));
        }
        cfg.agent = process.env.SSH_AUTH_SOCK;
      } else {
        cfg.password = password;
      }
      if (keepalive > 0) cfg.keepaliveInterval = keepalive * 1000;
      if (compress) cfg.compress = true;
      conn.connect(cfg);
    });
    return conn;
  }

  function requirePerm(s, perm, silent = false) {
    if (!s?.shared) return true;
    const now = Date.now();
    let live = s.shared._cachedLive;
    if (!live || !s.shared._checkedAt || now - s.shared._checkedAt > 2000) {
      live = store.resolveSharedHost(userId, s.shared.hostId, s.shared.ownerId);
      s.shared._cachedLive = live;
      s.shared._checkedAt = now;
    }
    if (!live) {
      if (s.primeStream) try { s.primeStream.close(); } catch {}
      if (s.conn) try { s.conn.end(); } catch {}
      for (const [k, v] of sessions.entries()) {
        if (v === s) {
          sessions.delete(k);
          activeClientSessions.delete(`${clientId}:${k}`);
          send({ type: 'disconnected', sid: k });
        }
      }
      if (!silent) toast('Share access revoked.', 'err');
      return false;
    }
    s.shared.permissions = live.permissions;
    if (!live.permissions[perm]) {
      if (!silent) toast(`Permission denied: ${perm}`, 'err');
      return false;
    }
    return true;
  }

  ws.on('message', async (raw) => {
    if (!NO_AUTH && !store.userExists(userId)) {
      try { ws.close(1008, 'Account disabled'); } catch {}
      return;
    }
    let msg;
    try { msg = JSON.parse(raw.toString('utf8')); } catch { return; }

    try {
      switch (msg.type) {
        case 'init': {
          const reqCid = typeof msg.clientId === 'string' && /^[a-f0-9]{16}$/.test(msg.clientId) ? msg.clientId : '';
          if (reqCid && clientWorkspaces.has(reqCid) && clientWorkspaces.get(reqCid).userId === userId) {
            if (wsState && wsState.clientId !== reqCid && wsState.sessions.size === 0 && wsState.terms.size === 0) {
              clientWorkspaces.delete(wsState.clientId);
            }
            wsState = clientWorkspaces.get(reqCid);
            clientId = reqCid;
            if (wsState.cleanupTimer) {
              clearTimeout(wsState.cleanupTimer);
              wsState.cleanupTimer = null;
            }
            wsState.send = send;
            wsState.toast = (text, kind = 'info') => send({ type: 'toast', text, kind });
          } else if (!wsState) {
            if (clientWorkspaces.size >= 1000) {
              const first = clientWorkspaces.keys().next().value;
              if (first) clientWorkspaces.delete(first);
            }
            clientId = crypto.randomBytes(8).toString('hex');
            wsState = {
              clientId,
              userId,
              sessions: new Map(),
              terms: new Map(),
              nextId: 1,
              send,
              toast: (text, kind = 'info') => send({ type: 'toast', text, kind }),
              cleanupTimer: null,
            };
            clientWorkspaces.set(clientId, wsState);
          }
          sessions = wsState.sessions;
          terms = wsState.terms;

          const hosts = buildClientHosts(userId);
          const restored_sessions = [];
          for (const [sid, s] of sessions.entries()) {
            restored_sessions.push({
              sid,
              name: s.profile?.name || s.profile?.host || sid,
              root: s.root || '/',
              sudo: !!s.sudo,
              sftpReady: !!s.sftp,
              shared: !!s.shared,
              permissions: s.shared ? s.shared.permissions : null,
            });
          }
          const restored_terms = [];
          for (const [tid, t] of terms.entries()) {
            const buf = t.chunks?.length ? Buffer.concat(t.chunks) : Buffer.alloc(0);
            restored_terms.push({
              termId: tid,
              sid: t.sid,
              title: t.title,
              scrollback: buf.toString('base64'),
            });
          }
          send({
            type: 'init_state',
            userId,
            clientId,
            hosts,
            shares_out: store.listSharesByOwner(userId),
            shares_in: store.listPendingInvitesForTarget(userId),
            shares_accepted: store.listAcceptedSharesForTarget(userId),
            snippets: uStore.loadSnippets(),
            settings: uStore.loadSettings(),
            known_hosts: uStore.loadKnownHosts(),
            mcp_links: buildUserMcpLinks(userId),
            restored_sessions,
            restored_terms,
          });
          break;
        }
        case 'share_list':
          send({
            type: 'shares_update',
            shares_out: store.listSharesByOwner(userId),
            shares_in: store.listPendingInvitesForTarget(userId),
            shares_accepted: store.listAcceptedSharesForTarget(userId),
          });
          break;
        case 'share_save': {
          const rec = store.upsertShare(userId, msg);
          send({
            type: 'shares_update',
            shares_out: store.listSharesByOwner(userId),
            shares_in: store.listPendingInvitesForTarget(userId),
            shares_accepted: store.listAcceptedSharesForTarget(userId),
          });
          toast('Share settings saved.', 'ok');
          syncShareStateForUsers(userId, rec.targetId);
          break;
        }
        case 'share_respond': {
          const rec = store.respondToShare(userId, msg.id, !!msg.accept);
          send({
            type: 'shares_in_update',
            shares_in: store.listPendingInvitesForTarget(userId),
            shares_accepted: store.listAcceptedSharesForTarget(userId),
          });
          send({ type: 'hosts_update', hosts: buildClientHosts(userId) });
          if (rec) {
            toast(msg.accept ? 'Invitation accepted.' : 'Invitation declined.', 'ok');
            syncShareStateForUsers(rec.ownerId, userId);
          }
          break;
        }
        case 'share_leave': {
          const removed = store.leaveShare(userId, msg.id);
          if (removed) {
            try { mcp.closeSharedConns?.(removed.ownerId, userId); } catch {}
            for (const cw of clientWorkspaces.values()) {
              if (cw.userId === userId) {
                closeSharedSessionsFor(cw, removed.ownerId);
              }
            }
            toast('Left shared access.', 'ok');
            syncShareStateForUsers(removed.ownerId, userId);
          } else {
            send({
              type: 'shares_in_update',
              shares_in: store.listPendingInvitesForTarget(userId),
              shares_accepted: store.listAcceptedSharesForTarget(userId),
            });
            send({ type: 'hosts_update', hosts: buildClientHosts(userId) });
          }
          break;
        }
        case 'share_delete': {
          const removed = store.deleteShare(userId, msg.id);
          send({
            type: 'shares_update',
            shares_out: store.listSharesByOwner(userId),
            shares_in: store.listPendingInvitesForTarget(userId),
            shares_accepted: store.listAcceptedSharesForTarget(userId),
          });
          if (removed) {
            try { mcp.closeSharedConns?.(userId, removed.targetId); } catch {}
            toast('Share revoked.', 'ok');
            for (const cw of clientWorkspaces.values()) {
              if (cw.userId === removed.targetId) {
                closeSharedSessionsFor(cw, userId);
              }
            }
            syncShareStateForUsers(userId, removed.targetId);
          }
          break;
        }
        case 'save_shared_host': {
          const resolved = store.resolveSharedHost(userId, msg.rawHostId, msg.ownerId);
          if (!resolved || !resolved.permissions.edit_host) {
            return toast('Permission denied: edit_host', 'err');
          }
          const ownerStore = store.forUser(resolved.ownerId);
          const ownerHosts = ownerStore.loadHosts();
          const cleanHost = msg.host && typeof msg.host === 'object' ? msg.host : {};
          const nextHosts = ownerHosts.map((h) => {
            if (h.id !== resolved.host.id) return h;
            return {
              ...h,
              name: cleanHost.name !== undefined ? String(cleanHost.name).trim() || h.name : h.name,
              group: cleanHost.group !== undefined ? String(cleanHost.group).trim() : h.group,
              note: cleanHost.note !== undefined ? String(cleanHost.note) : h.note,
              color: cleanHost.color || h.color,
              tags: Array.isArray(cleanHost.tags) ? cleanHost.tags : h.tags,
              keepalive: Number(cleanHost.keepalive) || h.keepalive || 30,
            };
          });
          ownerStore.saveHosts(nextHosts);
          toast('Shared server updated.', 'ok');
          send({ type: 'hosts_update', hosts: buildClientHosts(userId) });
          for (const cw of clientWorkspaces.values()) {
            if (cw.userId === resolved.ownerId) {
              cw.send({ type: 'hosts_update', hosts: buildClientHosts(resolved.ownerId) });
            }
          }
          break;
        }
        case 'mcp_list':
          send({ type: 'mcp_links', mcp_links: buildUserMcpLinks(userId) });
          break;
        case 'mcp_create':
          if (store.listMcpTokens(userId).length >= 25) {
            return toast('Maximum MCP links reached (25).', 'err');
          }
          store.createMcpToken(userId, msg.label || 'MCP Link', msg.permissions || null);
          send({ type: 'mcp_links', mcp_links: buildUserMcpLinks(userId) });
          break;
        case 'mcp_update_perms':
          store.updateMcpTokenPermissions(userId, msg.id, msg.permissions || {});
          send({ type: 'mcp_links', mcp_links: buildUserMcpLinks(userId) });
          break;
        case 'mcp_disconnect':
          disconnectMcpByToken(userId, msg.id);
          send({ type: 'mcp_links', mcp_links: buildUserMcpLinks(userId) });
          toast('MCP connection disconnected.', 'ok');
          break;
        case 'mcp_delete':
          disconnectMcpByToken(userId, msg.id);
          store.deleteMcpToken(userId, msg.id);
          send({ type: 'mcp_links', mcp_links: buildUserMcpLinks(userId) });
          toast('MCP link deleted.', 'ok');
          break;
        case 'save_hosts': {
          const prevHosts = new Map(uStore.loadHosts().map((h) => [h.id, h]));
          const nextOwn = (Array.isArray(msg.hosts) ? msg.hosts : [])
            .slice(0, 500)
            .filter((h) => h && typeof h === 'object' && !h.shared && isSafeId(h.id))
            .map(({ had_pw, had_key, had_passphrase, had_proxy_pass, password, passphrase, proxy_pass, shared, shareId, ownerId, permissions, rawHostId, ...rest }) => rest);
          uStore.saveHosts(nextOwn);
          const s = uStore.loadSecrets();
          let secDirty = false;
          for (const nh of nextOwn) {
            const oldH = prevHosts.get(nh.id);
            if (oldH && s[nh.id] && (oldH.host !== nh.host || Number(oldH.port || 22) !== Number(nh.port || 22) || (oldH.user || 'root') !== (nh.user || 'root'))) {
              delete s[nh.id];
              secDirty = true;
            }
          }
          if (isSafeId(msg.hostId) && msg.secrets) {
            s[msg.hostId] = { ...(s[msg.hostId] || {}) };
            if (msg.secrets.password) { s[msg.hostId].password = msg.secrets.password; secDirty = true; }
            if (msg.secrets.passphrase) { s[msg.hostId].passphrase = msg.secrets.passphrase; secDirty = true; }
            if (msg.secrets.proxy_pass) { s[msg.hostId].proxy_pass = msg.secrets.proxy_pass; secDirty = true; }
            if (msg.secrets.privateKey) { s[msg.hostId].privateKey = msg.secrets.privateKey; secDirty = true; }
          }
          if (secDirty) uStore.saveSecrets(s);
          send({ type: 'hosts_update', hosts: buildClientHosts(userId) });
          for (const sh of store.listSharesByOwner(userId)) {
            for (const cw of clientWorkspaces.values()) {
              if (cw.userId === sh.targetId) {
                cw.send({ type: 'hosts_update', hosts: buildClientHosts(sh.targetId) });
              }
            }
          }
          break;
        }
        case 'save_snippets': {
          const cleanSnips = (Array.isArray(msg.snippets) ? msg.snippets : [])
            .slice(0, 500)
            .filter((x) => x && typeof x === 'object')
            .map((x) => ({
              id: isSafeId(x.id) ? x.id : crypto.randomBytes(6).toString('hex'),
              name: String(x.name || '').slice(0, 120),
              command: String(x.command || '').slice(0, 8192),
            }));
          uStore.saveSnippets(cleanSnips);
          break;
        }
        case 'save_settings': {
          const rawS = msg.settings && typeof msg.settings === 'object' ? msg.settings : {};
          const curS = uStore.loadSettings();
          const cleanS = {
            ...curS,
            ...(rawS.font_size !== undefined ? { font_size: Math.max(8, Math.min(32, Number(rawS.font_size) || 14)) } : {}),
            ...(rawS.scrollback !== undefined ? { scrollback: Math.max(100, Math.min(50000, Number(rawS.scrollback) || 5000)) } : {}),
            ...(rawS.keepalive !== undefined ? { keepalive: Math.max(0, Math.min(600, Number(rawS.keepalive) || 30)) } : {}),
            ...(typeof rawS.term_theme === 'string' ? { term_theme: rawS.term_theme.slice(0, 40) } : {}),
          };
          uStore.saveSettings(cleanS);
          break;
        }
        case 'remove_known_host': {
          const kh = uStore.loadKnownHosts().filter((e) => e.host !== msg.host);
          uStore.saveKnownHosts(kh);
          send({ type: 'known_hosts', entries: kh });
          break;
        }
        case 'connect': {
          if (sessions.size >= 15) {
            return send({ type: 'connected', sid: msg.sid, ok: false, error: 'Maximum concurrent SSH sessions reached (15).' });
          }
          let profile = msg.profile;
          let targetUid = userId;
          let targetStore = uStore;
          let sharedMeta = null;
          const sid = msg.sid || profile?.id || crypto.randomBytes(6).toString('hex');
          if (profile?.shared || String(sid).startsWith('sh:')) {
            const parts = String(sid).startsWith('sh:') ? String(sid).split(':') : [];
            const ownerId = profile?.ownerId || parts[1] || '';
            const rawHostId = profile?.rawHostId || parts[2] || profile?.id || '';
            const resolved = store.resolveSharedHost(userId, rawHostId, ownerId);
            if (!resolved) {
              return send({ type: 'connected', sid, ok: false, error: 'Shared server not found or access revoked.' });
            }
            profile = resolved.host;
            targetUid = resolved.ownerId;
            targetStore = store.forUser(resolved.ownerId);
            sharedMeta = {
              shareId: resolved.share.id,
              ownerId: resolved.ownerId,
              hostId: resolved.host.id,
              permissions: resolved.permissions,
            };
          }
          try {
            const conn = await connectSsh(profile, 0, targetUid, targetStore, sharedMeta);
            const sess = { userId, profile, conn, sftp: null, root: '/', sudo: false, sudoPw: '', sftpPromise: null, primeStream: null, connectedAt: Date.now(), traffic: conn._traffic || { rx: 0, tx: 0 }, shared: sharedMeta };
            sessions.set(sid, sess);
            activeClientSessions.set(`${clientId}:${sid}`, sess);
            send({ type: 'connected', sid, ok: true, root: '/', name: profile.name || profile.host, shared: !!sharedMeta, permissions: sharedMeta ? sharedMeta.permissions : null });
            dockerMgr.probeSys(conn).then((sys) => send({ type: 'sysinfo', sid, sys })).catch(() => {});

            sess.sftpPromise = (async () => {
              const { env } = parseHostOptions(profile);
              if (Object.keys(env).length > 0) {
                await new Promise((res) => {
                  const timer = setTimeout(res, 1200);
                  try {
                    conn.shell({ term: 'xterm', rows: 24, cols: 80 }, { env }, (err, stream) => {
                      if (!err && stream) {
                        sess.primeStream = stream;
                        stream.on('data', () => {});
                        stream.stderr?.on('data', () => {});
                      }
                      setTimeout(() => { clearTimeout(timer); res(); }, 1000);
                    });
                  } catch {
                    clearTimeout(timer);
                    res();
                  }
                });
              }

              let lastErr = null;
              for (let attempt = 0; attempt < 5; attempt++) {
                if (!sessions.has(sid)) return;
                try {
                  const hasEnv = Object.keys(env).length > 0;
                  const sftp = await new Promise((res, rej) => {
                    const st = setTimeout(() => rej(new Error('SFTP open timed out')), 10000);
                    const cb = (e, s) => { clearTimeout(st); e ? rej(e) : res(s); };
                    if (hasEnv) conn.sftp(env, cb);
                    else conn.sftp(cb);
                  });
                  const root = await new Promise((res) => {
                    const rt = setTimeout(() => res('/'), 5000);
                    sftp.realpath('.', (e, p) => { clearTimeout(rt); res(e ? '/' : p); });
                  });
                  sess.sftp = sftp;
                  sess.root = root;
                  wsState.send({ type: 'sftp_ready', sid, ok: true, root });
                  return;
                } catch (sftpErr) {
                  lastErr = sftpErr;
                  await new Promise((r) => setTimeout(r, 2000));
                }
              }
              wsState.send({ type: 'sftp_ready', sid, ok: false, error: lastErr?.message || String(lastErr) });
              wsState.toast(`Failed to open SFTP (${lastErr?.message || lastErr}); terminal only.`, 'warn');
            })();
          } catch (e) {
            send({ type: 'connected', sid, ok: false, error: e.message || String(e) });
          }
          break;
        }
        case 'disconnect': {
          const s = sessions.get(msg.sid);
          if (s?.primeStream) try { s.primeStream.close(); } catch {}
          if (s?.conn) try { s.conn.end(); } catch {}
          sessions.delete(msg.sid);
          activeClientSessions.delete(`${clientId}:${msg.sid}`);
          send({ type: 'disconnected', sid: msg.sid });
          break;
        }
        case 'fs_swap_sudo': {
          const s = sessions.get(msg.sid);
          if (!s?.conn) return;
          if (!requirePerm(s, 'sudo', true)) return send({ type: 'fs_swapped', sid: msg.sid, sudo: false, ok: false, error: 'Permission denied: sudo' });
          if (!msg.sudo) {
            s.sudo = false;
            s.sudoPw = '';
            send({ type: 'fs_swapped', sid: msg.sid, sudo: false, ok: true });
            return;
          }
          const secStore = s.shared ? store.forUser(s.shared.ownerId) : uStore;
          const secrets = secStore.loadSecrets();
          const savedPw = s.profile?.id && secrets[s.profile.id]?.password ? secrets[s.profile.id].password : '';
          const tried = [''];
          if (savedPw) tried.push(savedPw);
          let okPw = null;
          for (const pw of tried) {
            const r = await sudoExec(s.conn, pw, 'true');
            if (r.code === 0) { okPw = pw; break; }
          }
          if (okPw === null) {
            const ans = await askSecret('sudo password (root)', s.profile.name || s.profile.host, false);
            if (ans && ans.value) {
              const r = await sudoExec(s.conn, ans.value, 'true');
              if (r.code === 0) okPw = ans.value;
            }
          }
          if (okPw !== null) {
            s.sudo = true;
            s.sudoPw = okPw;
            send({ type: 'fs_swapped', sid: msg.sid, sudo: true, ok: true });
          } else {
            send({ type: 'fs_swapped', sid: msg.sid, sudo: false, ok: false, error: 'Failed to verify root (sudo) privileges.' });
          }
          break;
        }
        case 'fs_list': {
          const s = sessions.get(msg.sid);
          if (!s?.conn) return;
          if (!requirePerm(s, 'files_read', true)) return send({ type: 'fs_listed', sid: msg.sid, dir: msg.dir, error: 'Permission denied: files_read' });
          if (s.sftpPromise) await s.sftpPromise;
          if (!s.sftp && !s.sudo) {
            return send({ type: 'fs_listed', sid: msg.sid, dir: msg.dir, error: 'SFTP is not available on this server.' });
          }
          if (s.sudo) {
            try {
              const entries = await sudoList(s.conn, s.sudoPw, msg.dir);
              send({ type: 'fs_listed', sid: msg.sid, dir: msg.dir, entries });
            } catch (e) {
              send({ type: 'fs_listed', sid: msg.sid, dir: msg.dir, error: e.message });
            }
            break;
          }
          s.sftp.readdir(msg.dir, (err, list) => {
            if (err) return send({ type: 'fs_listed', sid: msg.sid, dir: msg.dir, error: err.message });
            const entries = list
              .filter((e) => e.filename !== '.' && e.filename !== '..')
              .map((e) => {
                const mode = e.attrs?.mode || 0;
                const isDir = (mode & 0o170000) === 0o040000 || (e.longname && e.longname.startsWith('d'));
                return { name: e.filename, isDir, size: isDir ? 0 : e.attrs?.size || 0, mtime: e.attrs?.mtime || 0 };
              })
              .sort((a, b) => (a.isDir !== b.isDir ? (a.isDir ? -1 : 1) : a.name.toLowerCase().localeCompare(b.name.toLowerCase())));
            send({ type: 'fs_listed', sid: msg.sid, dir: msg.dir, entries });
          });
          break;
        }
        case 'fs_mkdir': {
          const s = sessions.get(msg.sid);
          if (!s?.conn || (!s.sftp && !s.sudo)) return;
          if (!requirePerm(s, 'files_write')) return;
          if (s.sudo) {
            const r = await sudoExec(s.conn, s.sudoPw, `mkdir -p -- ${dockerMgr.quote(msg.path)}`);
            if (r.code !== 0) toast(r.err || 'Failed to create folder.', 'err');
            else send({ type: 'fs_reload', sid: msg.sid, dir: posixParent(msg.path) });
            break;
          }
          s.sftp.mkdir(msg.path, (e) => {
            if (e) toast(e.message, 'err');
            else send({ type: 'fs_reload', sid: msg.sid, dir: posixParent(msg.path) });
          });
          break;
        }
        case 'fs_touch': {
          const s = sessions.get(msg.sid);
          if (!s?.conn || (!s.sftp && !s.sudo)) return;
          if (!requirePerm(s, 'files_write')) return;
          if (s.sudo) {
            const r = await sudoExec(s.conn, s.sudoPw, `touch -- ${dockerMgr.quote(msg.path)}`);
            if (r.code !== 0) toast(r.err || 'Failed to create file.', 'err');
            else send({ type: 'fs_reload', sid: msg.sid, dir: posixParent(msg.path) });
            break;
          }
          const wsStream = s.sftp.createWriteStream(msg.path);
          wsStream.on('error', (e) => toast(e.message, 'err'));
          wsStream.on('close', () => send({ type: 'fs_reload', sid: msg.sid, dir: posixParent(msg.path) }));
          wsStream.end();
          break;
        }
        case 'fs_rename': {
          const s = sessions.get(msg.sid);
          if (!s?.conn || (!s.sftp && !s.sudo)) return;
          if (!requirePerm(s, 'files_write')) return;
          if (s.sudo) {
            const r = await sudoExec(s.conn, s.sudoPw, `mv -- ${dockerMgr.quote(msg.oldPath)} ${dockerMgr.quote(msg.newPath)}`);
            if (r.code !== 0) toast(r.err || 'Failed to rename.', 'err');
            else send({ type: 'fs_reload', sid: msg.sid, dir: posixParent(msg.newPath) });
            break;
          }
          s.sftp.rename(msg.oldPath, msg.newPath, (e) => {
            if (e) toast(e.message, 'err');
            else send({ type: 'fs_reload', sid: msg.sid, dir: posixParent(msg.newPath) });
          });
          break;
        }
        case 'fs_delete': {
          const s = sessions.get(msg.sid);
          if (!s?.conn || (!s.sftp && !s.sudo)) return;
          if (!requirePerm(s, 'files_write')) return;
          const delPath = String(msg.path || '').trim();
          if (!delPath || delPath === '/' || delPath === '/*') {
            return toast('Cannot delete root directory.', 'err');
          }
          if (s.sudo) {
            const r = await sudoExec(s.conn, s.sudoPw, `rm -rf -- ${dockerMgr.quote(msg.path)}`);
            if (r.code !== 0) toast(r.err || 'Failed to delete.', 'err');
            else { toast('Deleted.', 'ok'); send({ type: 'fs_reload', sid: msg.sid, dir: posixParent(msg.path) }); }
            break;
          }
          if (msg.isDir) {
            await dockerMgr.execCmd(s.conn, `rm -rf -- ${dockerMgr.quote(msg.path)}`);
          } else {
            await new Promise((res, rej) => s.sftp.unlink(msg.path, (e) => (e ? rej(e) : res())));
          }
          toast('Deleted.', 'ok');
          send({ type: 'fs_reload', sid: msg.sid, dir: posixParent(msg.path) });
          break;
        }
        case 'fs_read': {
          const s = sessions.get(msg.sid);
          if (!s?.conn) return;
          if (!requirePerm(s, 'files_read', true)) return send({ type: 'fs_file', sid: msg.sid, path: msg.path, error: 'Permission denied: files_read' });
          if (!s.sftp && !s.sudo) {
            return send({ type: 'fs_file', sid: msg.sid, path: msg.path, error: 'SFTP is not available.' });
          }
          const MAX_EDIT_BYTES = 1024 * 1024;
          if (s.sudo) {
            const qPath = dockerMgr.quote(msg.path);
            const stRes = await sudoExec(s.conn, s.sudoPw, `sh -c ${dockerMgr.quote(`stat -c %s -- ${qPath} 2>/dev/null || wc -c < ${qPath}`)}`);
            const sz = parseInt(stRes.out.toString('utf8').trim(), 10);
            if (Number.isFinite(sz) && sz > MAX_EDIT_BYTES) {
              return send({ type: 'fs_file', sid: msg.sid, path: msg.path, error: 'File exceeds the 1 MB editor limit; you can download it instead.' });
            }
            const r = await sudoExec(s.conn, s.sudoPw, `head -c ${MAX_EDIT_BYTES + 1} -- ${qPath}`);
            if (r.code !== 0) return send({ type: 'fs_file', sid: msg.sid, path: msg.path, error: r.err || 'Failed to read file.' });
            if (r.out.length > MAX_EDIT_BYTES) return send({ type: 'fs_file', sid: msg.sid, path: msg.path, error: 'File exceeds the 1 MB editor limit; you can download it instead.' });
            if (r.out.subarray(0, 4096).includes(0)) {
              return send({ type: 'fs_file', sid: msg.sid, path: msg.path, error: 'Binary files cannot be opened in the text editor; you can download it instead.' });
            }
            return send({ type: 'fs_file', sid: msg.sid, path: msg.path, text: r.out.toString('utf8') });
          }
          s.sftp.stat(msg.path, (statErr, st) => {
            if (statErr || !st) {
              return send({ type: 'fs_file', sid: msg.sid, path: msg.path, error: statErr?.message || 'Failed to read file.' });
            }
            if ((st.size || 0) > MAX_EDIT_BYTES) {
              return send({ type: 'fs_file', sid: msg.sid, path: msg.path, error: 'File exceeds the 1 MB editor limit; you can download it instead.' });
            }
            const chunks = [];
            let total = 0;
            let aborted = false;
            const rs = s.sftp.createReadStream(msg.path);
            rs.on('data', (c) => {
              if (aborted) return;
              total += c.length;
              if (total > MAX_EDIT_BYTES || (chunks.length === 0 && c.subarray(0, 4096).includes(0))) {
                aborted = true;
                try { rs.destroy(); } catch {}
                const msgErr = total > MAX_EDIT_BYTES
                  ? 'File exceeds the 1 MB editor limit; you can download it instead.'
                  : 'Binary files cannot be opened in the text editor; you can download it instead.';
                return send({ type: 'fs_file', sid: msg.sid, path: msg.path, error: msgErr });
              }
              chunks.push(c);
            });
            rs.on('error', (e) => {
              if (!aborted) send({ type: 'fs_file', sid: msg.sid, path: msg.path, error: e.message });
            });
            rs.on('end', () => {
              if (aborted) return;
              const buf = Buffer.concat(chunks);
              if (buf.subarray(0, 4096).includes(0)) {
                return send({ type: 'fs_file', sid: msg.sid, path: msg.path, error: 'Binary files cannot be opened in the text editor; you can download it instead.' });
              }
              send({ type: 'fs_file', sid: msg.sid, path: msg.path, text: buf.toString('utf8') });
            });
          });
          break;
        }
        case 'fs_write': {
          const s = sessions.get(msg.sid);
          if (!s?.conn || (!s.sftp && !s.sudo)) return;
          if (!requirePerm(s, 'files_write')) return;
          if (typeof msg.text !== 'string' || msg.text.length > 5 * 1024 * 1024) {
            return toast('File size limit exceeded.', 'err');
          }
          const buf = Buffer.from(msg.text, 'utf8');
          if (s.sudo) {
            const r = await sudoExec(s.conn, s.sudoPw, `tee -- ${dockerMgr.quote(msg.path)} >/dev/null`, 25000, 1024 * 1024, buf);
            if (r.code !== 0) toast(r.err || 'Failed to save.', 'err');
            else { toast(`Saved: ${posixBase(msg.path)}`, 'ok'); send({ type: 'fs_saved', sid: msg.sid, path: msg.path }); }
            break;
          }
          const w = s.sftp.createWriteStream(msg.path);
          w.on('error', (e) => toast(`Failed to save: ${e.message}`, 'err'));
          w.on('close', () => {
            toast(`Saved: ${posixBase(msg.path)}`, 'ok');
            send({ type: 'fs_saved', sid: msg.sid, path: msg.path });
          });
          w.end(buf);
          break;
        }
        case 'fs_upload': {
          const s = sessions.get(msg.sid);
          if (!s?.conn || (!s.sftp && !s.sudo)) return;
          if (!requirePerm(s, 'files_write')) return;
          const safeName = posixBase(String(msg.name || '').trim());
          if (!safeName || safeName === '.' || safeName === '..') {
            return toast('Invalid file name.', 'err');
          }
          if (typeof msg.base64 !== 'string' || msg.base64.length > 26 * 1024 * 1024) {
            return toast('File size limit exceeded.', 'err');
          }
          const dst = posixJoin(String(msg.dir || '/'), safeName);
          const buf = Buffer.from(msg.base64, 'base64');
          if (s.sudo) {
            const r = await sudoExec(s.conn, s.sudoPw, `tee -- ${dockerMgr.quote(dst)} >/dev/null`, 60000, 1024 * 1024, buf);
            if (r.code !== 0) toast(r.err || 'Upload failed.', 'err');
            else { toast(`Uploaded: ${safeName}`, 'ok'); send({ type: 'fs_reload', sid: msg.sid, dir: msg.dir }); }
            break;
          }
          const w = s.sftp.createWriteStream(dst);
          w.on('error', (e) => toast(`Upload failed: ${e.message}`, 'err'));
          w.on('close', () => {
            toast(`Uploaded: ${safeName}`, 'ok');
            send({ type: 'fs_reload', sid: msg.sid, dir: msg.dir });
          });
          w.end(buf);
          break;
        }
        case 'fs_download': {
          const s = sessions.get(msg.sid);
          if (!s?.conn || (!s.sftp && !s.sudo)) return;
          if (!requirePerm(s, 'files_read')) return;
          if (downloads.size >= 500) {
            const first = downloads.keys().next().value;
            if (first) downloads.delete(first);
          }
          const tok = crypto.randomBytes(16).toString('hex');
          const name = posixBase(msg.path);
          downloads.set(tok, { userId, sftp: s.sftp, conn: s.conn, sudo: s.sudo, sudoPw: s.sudoPw, path: msg.path, name });
          setTimeout(() => downloads.delete(tok), 10 * 60 * 1000).unref();
          send({ type: 'download_ready', name, url: `/download/${tok}/${encodeURIComponent(name)}` });
          break;
        }
        case 'term_open': {
          if (terms.size >= 30) return toast('Maximum concurrent terminals reached (30).', 'err');
          const termId = allocId();
          const s = sessions.get(msg.sid);
          if (!s?.conn) return toast('Connect to a server first.', 'warn');
          if (!requirePerm(s, 'terminal')) return;
          const dockerId = msg.dockerId ? String(msg.dockerId).trim() : '';
          if (dockerId) {
            if (!requirePerm(s, 'docker')) return;
            if (!/^[a-zA-Z0-9_.-]+$/.test(dockerId)) return toast('Invalid container ID.', 'err');
          }
          const { env } = parseHostOptions(s.profile);
          const shellOpts = Object.keys(env).length ? { env } : {};
          const onStream = (err, stream) => {
            if (err) return toast(err.message, 'err');
            const title = dockerId ? (msg.dockerName || dockerId) : (s.profile.name || s.profile.host);
            const termObj = {
              sid: msg.sid,
              title,
              chunks: [],
              bytes: 0,
              write: (d) => stream.write(d),
              resize: (r, c) => stream.setWindow(r, c, 0, 0),
              close: () => stream.close(),
            };
            terms.set(termId, termObj);
            wsState.send({ type: 'term_ready', reqId: msg.reqId, termId, sid: msg.sid, title });
            const envLines = (s.profile.env || '')
              .split(/\r?\n/)
              .map((l) => l.trim().replace(/^export\s+/, ''))
              .filter((l) => l && !l.startsWith('#') && l.includes('='));
            const exports = envLines
              .map((l) => {
                const i = l.indexOf('=');
                const k = l.slice(0, i).trim();
                if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(k)) return '';
                const v = l.slice(i + 1).trim().replace(/^["']|["']$/g, '').replace(/'/g, "'\\''");
                return `export ${k}='${v}';`;
              })
              .filter(Boolean)
              .join(' ');
            if (exports) stream.write(` ${exports} clear\n`);
            if (msg.cwd) stream.write(`cd ${dockerMgr.quote(msg.cwd)} && clear\n`);
            else if (s.profile.startup) stream.write(`${s.profile.startup}\n`);
            if (s.profile.startup_snippet) {
              const sn = uStore.loadSnippets().find((x) => x.id === s.profile.startup_snippet);
              if (sn?.command) stream.write(`${sn.command}\n`);
            }
            stream.on('data', (d) => {
              termObj.chunks.push(d);
              termObj.bytes += d.length;
              while (termObj.bytes > 65536 && termObj.chunks.length > 1) {
                termObj.bytes -= termObj.chunks.shift().length;
              }
              wsState.send({ type: 'term_data', termId, data: d.toString('base64') });
            });
            stream.on('close', () => {
              terms.delete(termId);
              wsState.send({ type: 'term_exit', termId });
            });
          };
          const ptyOpts = { term: 'xterm-256color', rows: msg.rows || 24, cols: msg.cols || 80 };
          if (dockerId) {
            s.conn.exec(`docker exec -it ${dockerMgr.quote(dockerId)} /bin/sh -c 'command -v bash >/dev/null 2>&1 && exec bash || exec sh'`, { pty: ptyOpts }, onStream);
          } else {
            s.conn.shell(ptyOpts, shellOpts, onStream);
          }
          break;
        }
        case 'term_input': {
          const t = terms.get(msg.termId);
          if (!t || typeof msg.data !== 'string' || msg.data.length > 65536) break;
          const s = sessions.get(t.sid);
          if (s?.shared && !requirePerm(s, 'terminal')) break;
          t.write(msg.data);
          break;
        }
        case 'term_resize': {
          const r = Math.max(1, Math.min(500, Math.floor(Number(msg.rows) || 24)));
          const c = Math.max(1, Math.min(500, Math.floor(Number(msg.cols) || 80)));
          terms.get(msg.termId)?.resize(r, c);
          break;
        }
        case 'term_close':
          terms.get(msg.termId)?.close();
          terms.delete(msg.termId);
          break;
        case 'docker_list': {
          const s = sessions.get(msg.sid);
          if (!s?.conn) return;
          if (!requirePerm(s, 'docker', true)) return send({ type: 'docker_data', sid: msg.sid, data: { error: 'Permission denied: docker' } });
          const data = await dockerMgr.getDockerData(s.conn);
          send({ type: 'docker_data', sid: msg.sid, data });
          break;
        }
        case 'docker_act': {
          const s = sessions.get(msg.sid);
          if (!s?.conn) return;
          if (!requirePerm(s, 'docker')) return;
          const m = String(msg.args || '').trim().match(/^(start|stop|restart|rmi|volume rm|network rm)\s+([a-zA-Z0-9_.-]+)$/);
          if (!m) return toast('Invalid Docker action.', 'err');
          const r = await dockerMgr.execCmd(s.conn, `docker ${m[1]} -- ${dockerMgr.quote(m[2])}`);
          if (r.code !== 0) toast(r.err || 'Docker error', 'err');
          else toast('Done.', 'ok');
          const data = await dockerMgr.getDockerData(s.conn);
          send({ type: 'docker_data', sid: msg.sid, data });
          break;
        }
        case 'docker_logs': {
          const s = sessions.get(msg.sid);
          if (!s?.conn) return;
          if (!requirePerm(s, 'docker')) return;
          const id = String(msg.id || '').trim();
          if (!/^[a-zA-Z0-9_.-]+$/.test(id)) return toast('Invalid container ID.', 'err');
          const r = await dockerMgr.execCmd(s.conn, `docker logs --tail 250 -- ${dockerMgr.quote(id)} 2>&1`);
          send({ type: 'docker_logs', sid: msg.sid, id, logs: dockerMgr.stripAnsi(r.out) });
          break;
        }
        case 'docker_update': {
          const s = sessions.get(msg.sid);
          if (!s?.conn) return;
          if (!requirePerm(s, 'docker')) return;
          const id = String(msg.id || '').trim();
          if (!/^[a-zA-Z0-9_.-]+$/.test(id)) return toast('Invalid container ID.', 'err');
          const flags = [];
          if (msg.cpus !== undefined && String(msg.cpus).trim() !== '') {
            const c = Number(msg.cpus);
            if (!Number.isFinite(c) || c <= 0) return toast('Invalid CPU limit.', 'err');
            flags.push(`--cpus ${c}`);
          }
          if (msg.memory !== undefined && String(msg.memory).trim() !== '') {
            const m = String(msg.memory).trim();
            if (!/^\d+[bBkKmMgG]?$/.test(m)) return toast('Invalid memory limit (e.g. 512m, 1g).', 'err');
            flags.push(`--memory ${m} --memory-swap -1`);
          }
          if (msg.restart && /^(no|always|unless-stopped|on-failure)$/.test(msg.restart)) {
            flags.push(`--restart ${msg.restart}`);
          }
          if (!flags.length) return toast('No resource changes specified.', 'warn');
          const r = await dockerMgr.execCmd(s.conn, `docker update ${flags.join(' ')} ${dockerMgr.quote(id)}`);
          if (r.code !== 0) toast(r.err || r.out || 'Docker update failed.', 'err');
          else {
            toast('Container resources updated.', 'ok');
            send({ type: 'docker_data', sid: msg.sid, data: await dockerMgr.getDockerData(s.conn) });
          }
          break;
        }
        case 'search_grep': {
          const s = sessions.get(msg.sid);
          if (!s?.conn) return toast('Connect to a server first.', 'warn');
          if (!requirePerm(s, 'files_read')) return send({ type: 'search_results', results: [] });
          const cmd = `grep -rnF -- ${dockerMgr.quote(msg.query)} ${dockerMgr.quote(msg.dir || '/')} 2>/dev/null | head -200`;
          const { out } = await dockerMgr.execCmd(s.conn, cmd);
          const results = out.split(/\r?\n/).filter(Boolean).map((line) => {
            const i1 = line.indexOf(':');
            const i2 = i1 > -1 ? line.indexOf(':', i1 + 1) : -1;
            if (i1 > -1 && i2 > -1) {
              return { path: line.slice(0, i1), line: line.slice(i1 + 1, i2), text: line.slice(i2 + 1).trim() };
            }
            return null;
          }).filter(Boolean);
          send({ type: 'search_results', results });
          break;
        }
        case 'reply_hostkey': {
          const fn = pendingHostKeys.get(msg.reqId);
          if (fn) { pendingHostKeys.delete(msg.reqId); fn(!!msg.allow); }
          break;
        }
        case 'reply_secret': {
          const fn = pendingSecrets.get(msg.reqId);
          if (fn) { pendingSecrets.delete(msg.reqId); fn(msg.secret || null); }
          break;
        }
      }
    } catch (e) {
      toast(e.message || String(e), 'err');
    }
  });

  ws.on('error', () => {});
  ws.on('close', () => {
    if (!wsState || wsState.send !== send) return;
    wsState.cleanupTimer = setTimeout(() => {
      for (const t of wsState.terms.values()) try { t.close(); } catch {}
      for (const [sid, s] of wsState.sessions.entries()) {
        activeClientSessions.delete(`${wsState.clientId}:${sid}`);
        if (s.primeStream) try { s.primeStream.close(); } catch {}
        if (s.conn) try { s.conn.end(); } catch {}
      }
      clientWorkspaces.delete(wsState.clientId);
    }, 10 * 60 * 1000);
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [t, rec] of sessionTokens.entries()) if (now > rec.exp) sessionTokens.delete(t);
  for (const [t, exp] of adminTokens.entries()) if (now > exp) adminTokens.delete(t);
  for (const [c, rec] of oauthCodes.entries()) if (now > rec.exp) oauthCodes.delete(c);
  for (const [ip, rec] of regLimits.entries()) if (now > rec.resetAt) regLimits.delete(ip);
  for (const [ip, rec] of authFailures.entries()) if (now > rec.resetAt) authFailures.delete(ip);
}, 10 * 60 * 1000).unref();

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err?.stack || err);
});
process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err?.stack || err);
});

setInterval(() => {
  for (const client of wss.clients) {
    if (client.isAlive === false) { try { client.terminate(); } catch {} continue; }
    client.isAlive = false;
    try { client.ping(); } catch {}
  }
}, 25000).unref();

server.listen(BIND_PORT, BIND_HOST, () => {
  console.log(`Termitron (Node.js) started: http://${BIND_HOST}:${BIND_PORT}`);
});
