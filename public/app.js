const ICO = {
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  edit: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  close: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
  upload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  newFile: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
  newFolder: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',
  shield: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  chevRight: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>',
  chevDown: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
  folder: '<svg width="15" height="15" viewBox="0 0 24 24" fill="#dcb67a" stroke="#dcb67a" stroke-width="1"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  file: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b949e" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  server: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3794ff" stroke-width="1.8"><rect x="2" y="3" width="20" height="7" rx="1.5"/><rect x="2" y="14" width="20" height="7" rx="1.5"/></svg>',
  term: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
  docker: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3794ff" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
  monitor: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  share: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
};

const state = {
  userId: '',
  token: '',
  clientId: '',
  ws: null,
  view: 'hosts',
  touchMods: { ctrl: false, alt: false },
  hosts: [],
  sharesOut: [],
  sharesIn: [],
  sharesAccepted: [],
  snippets: [],
  settings: { font_size: 14, scrollback: 5000, keepalive: 30 },
  knownHosts: [],
  mcpLinks: [],
  sessions: new Map(),
  activeSid: null,
  tabs: [],
  activeTab: 0,
  vncTabs: [],
  activeVncTab: 0,
  layout: (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('trm_layout') || 'null');
      if (saved && saved.mode) return saved;
    } catch {}
    return {
      mode: 'classic',
      customMode: 'rows',
      zones: { editor: 'top', vnc: 'top', term: 'bottom' },
      order: ['editor', 'vnc', 'term'],
      termRatio: 35,
      colWidths: [50, 50],
      col3Widths: [33, 34, 33],
    };
  })(),
  terms: [],
  conns: [],
  activeTermId: null,
  activeConnId: null,
  dragTermReqId: null,
  nextReqId: 1,
  dockerData: new Map(),
  searchResults: [],
  collapsedCats: new Set(),
  vncRfbs: new Map(),
};

const $ = (id) => document.getElementById(id);
const BASE_PATH = location.pathname.replace(/\/(index\.html)?$/, '').replace(/\/$/, '');
const apiUrl = (p) => `${BASE_PATH}${p.startsWith('/') ? p : '/' + p}`;
function showAuthLoader(text) {
  if ($('auth-loader-text')) $('auth-loader-text').textContent = text || 'Loading...';
  $('auth-loader')?.classList.remove('hidden');
}
function hideAuthLoader() {
  $('auth-loader')?.classList.add('hidden');
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const recentToasts = new Map();
function toast(text, kind = 'info') {
  const key = `${kind}:${text}`;
  const now = Date.now();
  const prev = recentToasts.get(key) || 0;
  if (now - prev < 1500) return;
  recentToasts.set(key, now);
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = text;
  $('toasts').appendChild(el);
  setTimeout(() => el.remove(), kind === 'err' ? 5000 : 3000);
}

async function boot() {
  applyStaticI18n();
  const toggleLang = () => {
    const next = getLang() === 'en' ? 'tr' : 'en';
    localStorage.setItem('trm_lang', next);
    applyStaticI18n();
    renderSidebar();
    renderWelcomeRecent();
    renderTabs();
    renderVncTabs();
    renderTermTabs();
    if (!state.activeSid) $('status-left').textContent = t('not_connected');
  };
  if ($('btn-lang')) $('btn-lang').onclick = toggleLang;
  if ($('landing-lang')) $('landing-lang').onclick = toggleLang;
  state.token = sessionStorage.getItem('trm_web_token') || '';

  const st = await fetch(apiUrl('/api/auth/status')).then((r) => r.json()).catch(() => ({ auth_required: true, registration_enabled: true }));
  if (st.setup_required) {
    await showSetupScreen();
  }
  if (st.registration_enabled === false) {
    $('register-btn')?.classList.add('hidden');
    document.querySelector('.auth-divider')?.classList.add('hidden');
  }
  if (!st.auth_required || state.token) connectWs();
  else $('login-screen').classList.remove('hidden');
}

async function showSetupScreen() {
  const info = await fetch(apiUrl('/api/setup/info')).then((r) => r.json()).catch(() => null);
  if (!info || !info.ok) return;
  return new Promise((resolve) => {
    showModal(`
      <h3 style="margin:0 0 8px;">Termitron Initial Setup</h3>
      <p class="muted" style="font-size:12.5px;margin-bottom:14px;">Save your credentials and choose your Admin Panel path. This screen is only shown once.</p>
      <label class="field-label">Admin Panel Path (e.g. /adamento)</label>
      <input id="stp-admin-path" class="mono" value="${esc(info.adminPath || '/admin')}" placeholder="/adamento" />
      <label class="field-label">Admin Key</label>
      <input id="stp-admin-key" class="mono" value="${esc(info.adminKey || '')}" />
      <label class="field-label">Default Access Token</label>
      <input id="stp-access-tok" class="mono" readonly value="${esc(info.accessToken || '')}" />
      <div id="stp-err" class="err-text"></div>
      <div class="modal-actions">
        <button class="btn primary full" id="stp-save">Complete Setup</button>
      </div>
    `);
    $('stp-save').onclick = async () => {
      $('stp-err').textContent = '';
      const adminPath = $('stp-admin-path').value.trim() || '/admin';
      const adminKey = $('stp-admin-key').value.trim();
      const res = await fetch(apiUrl('/api/setup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPath, adminKey }),
      }).then((r) => r.json()).catch(() => ({ ok: false, error: 'Network error' }));
      if (!res.ok) {
        $('stp-err').textContent = res.error || 'Setup failed';
        return;
      }
      closeModal();
      resolve();
    };
  });
}

$('login-btn').onclick = submitLogin;
$('login-token').onkeydown = (e) => { if (e.key === 'Enter') submitLogin(); };
$('register-btn').onclick = async () => {
  $('login-err').textContent = '';
  const res = await fetch(apiUrl('/api/register'), { method: 'POST' })
    .then((r) => r.json())
    .catch(() => ({ ok: false, error: t('login_err_net') }));
  if (!res.ok) {
    $('login-err').textContent = res.error || t('login_err_net');
    return;
  }
  $('reg-key-val').value = res.access_key;
  $('reg-key-box').classList.remove('hidden');
  $('register-btn').classList.add('hidden');
  $('reg-copy-btn').onclick = async () => {
    try { await navigator.clipboard.writeText(res.access_key); } catch {}
    $('reg-copy-btn').textContent = t('reg_copied');
    setTimeout(() => { $('reg-copy-btn').textContent = t('reg_copy'); }, 1500);
  };
  $('reg-enter-btn').onclick = () => {
    showAuthLoader(getLang() === 'tr' ? 'Çalışma alanına giriliyor...' : 'Entering workspace...');
    state.token = res.session_token;
    sessionStorage.setItem('trm_web_token', state.token);
    setTimeout(() => {
      $('login-screen').classList.add('hidden');
      connectWs();
      hideAuthLoader();
    }, 450);
  };
};

async function submitLogin() {
  const token = $('login-token').value.trim();
  $('login-err').textContent = '';
  showAuthLoader(getLang() === 'tr' ? 'Giriş yapılıyor...' : 'Signing in...');
  const res = await fetch(apiUrl('/api/auth'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  }).then((r) => r.json()).catch(() => ({ ok: false, error: t('login_err_net') }));

  if (res.ok) {
    state.token = res.session_token;
    sessionStorage.setItem('trm_web_token', state.token);
    setTimeout(() => {
      $('login-screen').classList.add('hidden');
      connectWs();
      hideAuthLoader();
    }, 450);
  } else {
    hideAuthLoader();
    $('login-err').textContent = res.error || t('login_err_bad');
  }
}

function connectWs() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const url = `${proto}//${location.host}${apiUrl('/ws')}${state.token ? '?token=' + encodeURIComponent(state.token) : ''}`;
  const ws = new WebSocket(url);
  state.ws = ws;
  let opened = false;

  ws.onopen = () => {
    opened = true;
    $('login-screen').classList.add('hidden');
    $('titlebar').classList.remove('hidden');
    $('app').classList.remove('hidden');
    $('status-bar').classList.remove('hidden');
    $('status-right').textContent = t('ws_connected');
    if (isMobileOrTablet()) setSidebarOpen(true);
    wsSend({ type: 'init', clientId: sessionStorage.getItem('trm_client_id') || '' });
  };

  ws.onmessage = (ev) => handleServerMsg(JSON.parse(ev.data));
  ws.onclose = () => {
    $('status-right').textContent = t('ws_disconnected');
    if (!opened) {
      sessionStorage.removeItem('trm_web_token');
      state.token = '';
      $('titlebar').classList.add('hidden');
      $('app').classList.add('hidden');
      $('status-bar').classList.add('hidden');
      $('login-screen').classList.remove('hidden');
    } else if (state.ws === ws) {
      setTimeout(() => {
        if (!state.ws || state.ws.readyState > 1) connectWs();
      }, 2000);
    }
  };
}

function wsSend(obj) {
  if (state.ws && state.ws.readyState === 1) state.ws.send(JSON.stringify(obj));
}

function handleServerMsg(msg) {
  switch (msg.type) {
    case 'init_state':
      state.userId = msg.userId || '';
      state.clientId = msg.clientId || '';
      if (state.clientId) sessionStorage.setItem('trm_client_id', state.clientId);
      state.hosts = msg.hosts || [];
      state.sharesOut = msg.shares_out || [];
      state.sharesIn = msg.shares_in || [];
      state.sharesAccepted = msg.shares_accepted || [];
      state.snippets = msg.snippets || [];
      state.settings = msg.settings || state.settings;
      state.knownHosts = msg.known_hosts || [];
      if (msg.mcp_links) state.mcpLinks = msg.mcp_links;
      restoreWorkspace(msg.restored_sessions || [], msg.restored_terms || []);
      renderSidebar();
      renderWelcomeRecent();
      break;
    case 'hosts_update':
      state.hosts = msg.hosts || [];
      renderSidebar();
      renderWelcomeRecent();
      break;
    case 'shares_update':
      state.sharesOut = msg.shares_out || [];
      if (msg.shares_in) state.sharesIn = msg.shares_in;
      if (msg.shares_accepted) state.sharesAccepted = msg.shares_accepted;
      if (state.view === 'share') renderSidebar();
      break;
    case 'shares_in_update':
      state.sharesIn = msg.shares_in || [];
      if (msg.shares_accepted) state.sharesAccepted = msg.shares_accepted;
      if (state.view === 'hosts' || state.view === 'share') renderSidebar();
      break;
    case 'mcp_links':
      state.mcpLinks = msg.mcp_links || [];
      if (state.view === 'settings') renderSidebar();
      break;
    case 'toast':
      toast(msg.text, msg.kind);
      break;
    case 'connected': {
      const c = state.conns.find((x) => x.sid === msg.sid && !x.error);
      if (msg.ok) {
        const perms = msg.permissions || null;
        state.sessions.set(msg.sid, {
          name: msg.name,
          root: msg.root || '/',
          sudo: false,
          shared: !!msg.shared,
          permissions: perms,
          dirs: new Map(),
          expanded: new Set([msg.root || '/']),
        });
        state.activeSid = msg.sid;
        sessionStorage.setItem('trm_active_sid', msg.sid);
        toast(t('connected_toast', { name: msg.name }), 'ok');
        if (!msg.shared || !perms || perms.terminal) {
          if (c) c.authed = performance.now();
          openTerminal(msg.sid, c ? c.id : null);
        } else {
          if (c) {
            c.el.remove();
            state.conns = state.conns.filter((x) => x !== c);
          }
          if (perms.vnc) state.view = 'vnc';
          else if (perms.docker) state.view = 'docker';
          else if (perms.files_read) state.view = 'explorer';
          document.querySelectorAll('.act-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === state.view));
        }
        renderSidebar();
        $('status-left').textContent = `SSH: ${msg.name}`;
      } else {
        if (c) {
          c.error = msg.error || t('conn_failed');
          c.errorAt = performance.now();
        } else {
          toast(t('connect_err_toast', { err: msg.error }), 'err');
        }
      }
      break;
    }
    case 'sftp_ready': {
      const s = state.sessions.get(msg.sid);
      if (!s) break;
      if (msg.ok) {
        s.root = msg.root || '/';
        s.expanded = new Set([s.root]);
        if (!s.shared || s.permissions?.files_read) {
          wsSend({ type: 'fs_list', sid: msg.sid, dir: s.root });
        }
      }
      if (state.view === 'explorer' && state.activeSid === msg.sid) renderSidebar();
      break;
    }
    case 'disconnected':
      state.sessions.delete(msg.sid);
      state.terms = state.terms.filter((tm) => {
        if (tm.sid !== msg.sid) return true;
        try { tm.term?.dispose?.(); } catch {}
        tm.el?.remove?.();
        return false;
      });
      if (state.activeTermId && !state.terms.some((tm) => tm.termId === state.activeTermId)) {
        state.activeTermId = state.terms[0]?.termId || null;
      }
      renderTermTabs();
      state.tabs = state.tabs.filter((tb) => tb.sid !== msg.sid);
      state.activeTab = Math.max(0, Math.min(state.activeTab, state.tabs.length - 1));
      renderTabs();
      state.vncTabs = state.vncTabs.filter((vt) => {
        if (vt.sid !== msg.sid) return true;
        const rfb = state.vncRfbs.get(vt.id);
        if (rfb) { try { rfb.disconnect(); } catch {} state.vncRfbs.delete(vt.id); }
        $('vnc-view').querySelector(`[data-vnc-id="${vt.id}"]`)?.remove();
        return false;
      });
      state.activeVncTab = Math.max(0, Math.min(state.activeVncTab, state.vncTabs.length - 1));
      renderVncTabs();
      if (state.activeSid === msg.sid) state.activeSid = state.sessions.keys().next().value || null;
      $('status-left').textContent = state.activeSid ? `SSH: ${state.sessions.get(state.activeSid)?.name}` : t('not_connected');
      renderSidebar();
      renderWelcomeRecent();
      break;
    case 'fs_swapped': {
      const s = state.sessions.get(msg.sid);
      if (!s) break;
      if (msg.ok) {
        s.sudo = msg.sudo;
        s.dirs.clear();
        wsSend({ type: 'fs_list', sid: msg.sid, dir: s.root });
        toast(msg.sudo ? t('sudo_on_toast') : t('sudo_off_toast'), 'ok');
        if (state.view === 'explorer') renderSidebar();
      } else {
        toast(msg.error || t('sudo_err_toast'), 'err');
      }
      break;
    }
    case 'fs_listed': {
      const s = state.sessions.get(msg.sid);
      if (!s) break;
      if (msg.error) toast(msg.error, 'err');
      else s.dirs.set(msg.dir, msg.entries);
      if (state.view === 'explorer') renderSidebar();
      break;
    }
    case 'fs_reload':
      wsSend({ type: 'fs_list', sid: msg.sid, dir: msg.dir });
      break;
    case 'fs_file':
      if (msg.error) return toast(msg.error, 'err');
      openFileTab(msg.sid, msg.path, msg.text);
      break;
    case 'fs_saved': {
      const t = state.tabs.find((x) => x.type === 'file' && x.sid === msg.sid && x.path === msg.path);
      if (t) { t.dirty = false; renderTabs(); }
      break;
    }
    case 'download_ready': {
      const a = document.createElement('a');
      a.href = `${apiUrl(msg.url)}?token=${encodeURIComponent(state.token)}`;
      a.download = msg.name;
      a.click();
      break;
    }
    case 'term_ready': {
      const term = state.terms.find((t) => t.reqId === msg.reqId);
      if (term) {
        term.termId = msg.termId;
        term.title = uniqueTermTitle(msg.title, term.reqId);
        const c = state.conns.find((x) => x.sid === msg.sid && !x.error && !x.done);
        if (c) {
          c.done = performance.now();
          setTimeout(() => {
            const idx = state.conns.indexOf(c);
            if (idx !== -1) {
              c.el.remove();
              state.conns.splice(idx, 1);
              if (state.activeConnId === c.id) {
                state.activeConnId = null;
                state.activeTermId = term.termId || term.reqId;
              }
              term.pendingConnId = null;
              renderTermTabs();
            }
          }, 950);
        }
        renderTermTabs();
      }
      break;
    }
    case 'term_data': {
      const term = state.terms.find((t) => t.termId === msg.termId);
      if (term) term.xterm.write(b64ToBytes(msg.data));
      break;
    }
    case 'term_exit': {
      const term = state.terms.find((t) => t.termId === msg.termId);
      if (term) term.xterm.write(t('term_exited'));
      break;
    }
    case 'docker_data':
      state.dockerBusy = null;
      clearTimeout(state.dockerBusyTimer);
      state.dockerData.set(msg.sid, msg.data);
      renderDockerTab(msg.sid);
      break;
    case 'docker_logs':
      state.dockerLogs = { id: msg.id, logs: msg.logs };
      if (state.selectedDockerId === msg.id && state.dockerDrawerTab === 'logs') {
        const pre = $('dk-drawer-logs');
        if (pre) pre.textContent = msg.logs;
      } else {
        showModal(`<h3>${t('docker_logs')}</h3><pre class="mono" style="max-height:360px;overflow:auto;background:#181818;padding:10px;border-radius:4px;">${esc(msg.logs)}</pre><div class="modal-actions"><button class="btn primary" data-close-modal>${t('close')}</button></div>`);
      }
      break;
    case 'search_results':
      state.searchResults = msg.results || [];
      if (state.view === 'search') renderSidebar();
      break;
    case 'known_hosts':
      state.knownHosts = msg.entries || [];
      if (state.view === 'known') renderSidebar();
      break;
    case 'ask_hostkey':
      showModal(`
        <h3>${t('hk_title')} (${msg.kind === 'new' ? t('hk_new') : t('hk_changed')})</h3>
        <p class="muted">${esc(msg.host)}</p>
        <p class="mono" style="font-size:12px;word-break:break-all;">${esc(msg.fp)}</p>
        <div class="modal-actions">
          <button class="btn" id="hk-no">${t('hk_reject')}</button>
          <button class="btn primary" id="hk-yes">${t('hk_trust')}</button>
        </div>
      `);
      $('hk-no').onclick = () => { wsSend({ type: 'reply_hostkey', reqId: msg.reqId, allow: false }); closeModal(); };
      $('hk-yes').onclick = () => { wsSend({ type: 'reply_hostkey', reqId: msg.reqId, allow: true }); closeModal(); };
      break;
    case 'ask_secret':
      showModal(`
        <h3>${esc(msg.title)}</h3>
        <p class="muted">${esc(msg.target)}</p>
        <input id="sec-val" type="password" placeholder="${t('sec_pw_ph')}" />
        ${msg.allowSave ? `<label style="display:flex;gap:8px;align-items:center;margin-top:10px;font-size:12px;"><input id="sec-save" type="checkbox" checked style="width:auto;" /> ${t('sec_save')}</label>` : ''}
        <div class="modal-actions">
          <button class="btn" id="sec-cancel">${t('cancel')}</button>
          <button class="btn primary" id="sec-ok">${t('connect')}</button>
        </div>
      `);
      $('sec-val').focus();
      $('sec-val').onkeydown = (e) => { if (e.key === 'Enter') $('sec-ok').click(); };
      $('sec-cancel').onclick = () => { wsSend({ type: 'reply_secret', reqId: msg.reqId, secret: null }); closeModal(); };
      $('sec-ok').onclick = () => {
        wsSend({ type: 'reply_secret', reqId: msg.reqId, secret: { value: $('sec-val').value, save: !!$('sec-save')?.checked } });
        closeModal();
      };
      break;
  }
}

function isMobileOrTablet() {
  return window.innerWidth <= 900;
}
function syncSidebarBackdrop() {
  const sb = $('sidebar');
  const bd = $('sidebar-backdrop');
  if (!sb || !bd) return;
  const open = !sb.classList.contains('hidden') && isMobileOrTablet();
  bd.classList.toggle('hidden', !open);
}
function setSidebarOpen(open) {
  const sb = $('sidebar');
  if (!sb) return;
  sb.classList.toggle('hidden', !open);
  syncSidebarBackdrop();
  setTimeout(() => window.dispatchEvent(new Event('resize')), 30);
}
function closeMobileSidebarIfNeeded() {
  if (isMobileOrTablet()) setSidebarOpen(false);
}

$('btn-toggle-sidebar').onclick = () => {
  setSidebarOpen($('sidebar').classList.contains('hidden'));
};
if ($('sidebar-backdrop')) {
  $('sidebar-backdrop').onclick = () => setSidebarOpen(false);
}
$('btn-toggle-panel').onclick = () => {
  $('term-panel').classList.toggle('hidden');
  applyLayout();
};
$('btn-close-panel').onclick = () => {
  $('term-panel').classList.add('hidden');
  applyLayout();
};

$('top-quick-connect').onkeydown = (e) => {
  if (e.key === 'Enter') {
    quickConnect($('top-quick-connect').value);
    $('top-quick-connect').value = '';
    $('top-quick-connect').blur();
  }
};

document.querySelectorAll('.act-btn[data-view]').forEach((btn) => {
  btn.onclick = () => {
    const targetView = btn.dataset.view;
    const sbOpen = !$('sidebar').classList.contains('hidden');
    if (state.view === targetView && sbOpen) {
      setSidebarOpen(false);
      return;
    }
    document.querySelectorAll('.act-btn[data-view]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.view = targetView;
    setSidebarOpen(true);
    renderSidebar();
  };
});

function renderWelcomeRecent() {
  const el = $('welcome-recent');
  if (!el) return;
  if (!state.hosts.length) {
    el.innerHTML = `<span class="muted" style="font-size:12.5px;">${t('no_hosts')}</span>`;
    return;
  }
  el.innerHTML = '';
  for (const h of state.hosts.slice(0, 6)) {
    const b = document.createElement('button');
    b.className = 'link-row';
    b.innerHTML = `${ICO.server}<span>${esc(h.name || h.host)}</span><span class="muted mono" style="font-size:11.5px;">${esc(h.user)}@${esc(h.host)}</span>`;
    b.onclick = () => startConnect(h.id, h);
    el.appendChild(b);
  }
}

function renderSidebar() {
  const el = $('sidebar-content');
  if (state.view === 'hosts') {
    el.innerHTML = `
      <div class="side-header">
        <span>${t('hdr_hosts')}</span>
        <div style="display:flex;gap:3px;">
          <button class="icon-btn" id="btn-share-hosts" title="${t('share_btn')}">${ICO.share}</button>
          <button class="icon-btn" id="btn-add-host" title="${t('tt_new_host')}">${ICO.plus}</button>
        </div>
      </div>
      <div class="side-body" id="hosts-list"></div>
    `;
    $('btn-share-hosts').onclick = () => openShareModal();
    $('btn-add-host').onclick = () => openHostModal();
    const list = $('hosts-list');
    if (state.sharesIn && state.sharesIn.length) {
      const invWrap = document.createElement('div');
      invWrap.style.cssText = 'padding:8px;margin:6px;border:1px solid var(--accent);border-radius:5px;background:rgba(55,148,255,0.08);';
      invWrap.innerHTML = `
        <div style="font-size:11px;font-weight:600;color:var(--accent);margin-bottom:6px;">${t('share_invites')} (${state.sharesIn.length})</div>
        ${state.sharesIn.map((inv) => `
          <div style="padding:6px;border-radius:4px;background:var(--bg-editor);border:1px solid var(--border-strong);margin-bottom:4px;">
            <div class="mono" style="font-size:11px;color:var(--ink-bright);margin-bottom:4px;">${esc(inv.ownerId)} (${(inv.hostIds || []).length})</div>
            <div style="display:flex;gap:4px;">
              <button class="btn primary sm inv-acc" data-id="${esc(inv.id)}" style="flex:1;justify-content:center;">${t('share_accept')}</button>
              <button class="btn danger sm inv-dec" data-id="${esc(inv.id)}" style="flex:1;justify-content:center;">${t('share_decline')}</button>
            </div>
          </div>
        `).join('')}
      `;
      invWrap.querySelectorAll('.inv-acc').forEach((b) => {
        b.onclick = () => wsSend({ type: 'share_respond', id: b.dataset.id, accept: true });
      });
      invWrap.querySelectorAll('.inv-dec').forEach((b) => {
        b.onclick = () => wsSend({ type: 'share_respond', id: b.dataset.id, accept: false });
      });
      list.appendChild(invWrap);
    }
    if (!state.hosts.length && !(state.sharesIn && state.sharesIn.length)) list.innerHTML = `<p class="muted" style="padding:8px;">${t('no_hosts')}</p>`;
    const groups = new Map();
    for (const h of state.hosts) {
      const g = (h.group || '').trim();
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(h);
    }
    const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b);
    });
    const showCatHeaders = sortedKeys.length > 1 || (sortedKeys.length === 1 && sortedKeys[0] !== '');

    for (const gKey of sortedKeys) {
      const items = groups.get(gKey);
      const collapsed = showCatHeaders && state.collapsedCats.has(gKey);
      if (showCatHeaders) {
        const hdr = document.createElement('div');
        hdr.className = 'cat-header';
        hdr.innerHTML = `${collapsed ? ICO.chevRight : ICO.chevDown}<span>${esc(gKey || t('cat_uncategorized'))}</span><span class="cat-count">${items.length}</span>`;
        hdr.onclick = () => {
          if (state.collapsedCats.has(gKey)) state.collapsedCats.delete(gKey);
          else state.collapsedCats.add(gKey);
          renderSidebar();
        };
        list.appendChild(hdr);
      }
      if (collapsed) continue;
      for (const h of items) {
        const online = state.sessions.has(h.id);
        const row = document.createElement('div');
        row.className = 'list-item' + (state.selectedHostId === h.id ? ' selected' : '');
        row.title = t('dblclick_connect');
        const canEdit = !h.shared || !!h.permissions?.edit_host;
        const subText = h.shared && !h.showAddress
          ? `ID: ${esc(h.ownerId)}`
          : `${esc(h.user)}@${esc(h.host)}:${h.port || 22}`;
        row.innerHTML = `
          <div class="list-item-main">
            <span class="dot" style="background:${online ? 'var(--success)' : '#52525b'}"></span>
            <div class="list-item-text">
              <div class="list-item-title">${esc(h.name || h.host)}${h.shared ? ` <span class="badge" style="font-size:9.5px;padding:1px 5px;background:rgba(55,148,255,0.18);color:var(--accent);border-radius:3px;margin-left:4px;">${t('shared_badge')}</span>` : ''}</div>
              <div class="list-item-sub mono">${subText}</div>
            </div>
          </div>
          <div class="list-item-acts">
            <button class="icon-btn xs act-conn" title="${t('connect')}">${ICO.term}</button>
            ${canEdit ? `<button class="icon-btn xs act-edit" title="${t('tt_edit')}">${ICO.edit}</button>` : ''}
            ${canEdit && !h.shared ? `<button class="icon-btn xs act-del" title="${t('tt_delete')}">${ICO.trash}</button>` : ''}
          </div>
        `;
        row.onclick = (e) => {
          if (e.target.closest('.act-conn')) {
            return startConnect(h.id, h);
          }
          if (canEdit && e.target.closest('.act-edit')) return openHostModal(h);
          if (!h.shared && e.target.closest('.act-del')) {
            state.hosts = state.hosts.filter((x) => x.id !== h.id);
            wsSend({ type: 'save_hosts', hosts: state.hosts });
            renderWelcomeRecent();
            return renderSidebar();
          }
          const wasSelected = state.selectedHostId === h.id;
          state.selectedHostId = h.id;
          list.querySelectorAll('.list-item').forEach((el) => el.classList.remove('selected'));
          row.classList.add('selected');
          if (wasSelected || isMobileOrTablet() || window.matchMedia?.('(pointer: coarse)').matches) {
            startConnect(h.id, h);
          }
        };
        row.ondblclick = (e) => {
          if (e.target.closest('.list-item-acts')) return;
          startConnect(h.id, h);
        };
        list.appendChild(row);
      }
    }
  } else if (state.view === 'explorer') {
    if (!state.activeSid || !state.sessions.has(state.activeSid)) {
      el.innerHTML = `<div class="side-header"><span>${t('hdr_explorer')}</span></div><div class="side-body"><p class="muted" style="padding:8px;">${t('need_connect')}</p></div>`;
      return;
    }
    const s = state.sessions.get(state.activeSid);
    el.innerHTML = `
      <div class="side-header">
        <span>${esc(s.name)}${s.sudo ? ' (root)' : ''}</span>
        <div style="display:flex;gap:3px;">
          <button class="icon-btn ${s.sudo ? 'active-sudo' : ''}" id="ex-sudo" title="${s.sudo ? t('tt_sudo_on') : t('tt_sudo_off')}">${ICO.shield}</button>
          <button class="icon-btn" id="ex-up" title="${t('tt_upload')}">${ICO.upload}</button>
          <button class="icon-btn" id="ex-newf" title="${t('tt_new_file')}">${ICO.newFile}</button>
          <button class="icon-btn" id="ex-newd" title="${t('tt_new_folder')}">${ICO.newFolder}</button>
        </div>
      </div>
      <div class="side-body" id="tree-root"></div>
    `;
    $('ex-sudo').onclick = () => wsSend({ type: 'fs_swap_sudo', sid: state.activeSid, sudo: !s.sudo });
    $('ex-up').onclick = () => triggerUpload(state.activeSid, s.root);
    $('ex-newf').onclick = () => promptNewItem(state.activeSid, s.root, false);
    $('ex-newd').onclick = () => promptNewItem(state.activeSid, s.root, true);
    renderTree($('tree-root'), state.activeSid, s, s.root, 0);
  } else if (state.view === 'snippets') {
    el.innerHTML = `<div class="side-header"><span>${t('hdr_snippets')}</span><button class="icon-btn" id="btn-add-snip" title="${t('snip_new')}">${ICO.plus}</button></div><div class="side-body" id="snip-list"></div>`;
    $('btn-add-snip').onclick = () => openSnippetModal();
    const list = $('snip-list');
    for (const sn of state.snippets) {
      const c = document.createElement('div');
      c.className = 'list-item';
      c.innerHTML = `
        <div class="list-item-main"><div class="list-item-text"><div class="list-item-title">${esc(sn.name)}</div><div class="list-item-sub mono">${esc(sn.command)}</div></div></div>
        <div class="list-item-acts"><button class="icon-btn xs del" title="Sil">${ICO.trash}</button></div>
      `;
      c.onclick = (e) => {
        if (e.target.closest('.del')) {
          state.snippets = state.snippets.filter((x) => x.id !== sn.id);
          wsSend({ type: 'save_snippets', snippets: state.snippets });
          return renderSidebar();
        }
        if (state.activeTermId) {
          wsSend({ type: 'term_input', termId: state.activeTermId, data: sn.command + '\n' });
          closeMobileSidebarIfNeeded();
        } else toast('Aktif terminal yok.', 'warn');
      };
      list.appendChild(c);
    }
  } else if (state.view === 'docker') {
    el.innerHTML = `<div class="side-header"><span>${t('hdr_docker')}</span></div><div class="side-body" id="dk-side"></div>`;
    const body = $('dk-side');
    if (!state.activeSid) { body.innerHTML = `<p class="muted" style="padding:8px;">${t('need_connect')}</p>`; return; }
    const btn = document.createElement('button');
    btn.className = 'btn primary full';
    btn.innerHTML = `${ICO.docker}<span>${t('open_docker')}</span>`;
    btn.onclick = () => openDockerTab(state.activeSid);
    body.appendChild(btn);
  } else if (state.view === 'vnc') {
    el.innerHTML = `<div class="side-header"><span>${t('hdr_vnc')}</span></div><div class="side-body" id="vnc-side"></div>`;
    const body = $('vnc-side');
    if (!state.sessions.size) {
      body.innerHTML = `<p class="muted" style="padding:8px;">${t('need_connect')}</p>`;
      return;
    }
    const targetSid = state.sessions.has(state.activeSid) ? state.activeSid : state.sessions.keys().next().value;
    const sessOpts = Array.from(state.sessions.entries())
      .map(([sid, s]) => `<option value="${esc(sid)}" ${sid === targetSid ? 'selected' : ''}>${esc(s.name)}</option>`)
      .join('');
    body.innerHTML = `
      <label class="field-label">${t('vnc_server')}</label>
      <select id="vnc-sid">${sessOpts}</select>
      <label class="field-label">${t('vnc_host')}</label>
      <input id="vnc-host" type="text" value="127.0.0.1" placeholder="127.0.0.1" />
      <label class="field-label">${t('vnc_port')}</label>
      <input id="vnc-port" type="number" value="5900" placeholder="5900" />
      <label class="field-label">${t('vnc_pw')}</label>
      <input id="vnc-pw" type="password" placeholder="${t('vnc_pw_ph')}" />
      <button id="vnc-connect-btn" class="btn primary full">${t('vnc_connect')}</button>
    `;
    $('vnc-connect-btn').onclick = () => {
      const sid = $('vnc-sid').value || targetSid;
      const h = $('vnc-host').value.trim() || '127.0.0.1';
      const p = parseInt($('vnc-port').value, 10) || 5900;
      const pw = $('vnc-pw').value;
      openVncTab(sid, h, p, pw);
    };
  } else if (state.view === 'search') {
    el.innerHTML = `
      <div class="side-header"><span>${t('hdr_search')}</span></div>
      <div class="side-body">
        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <input id="grep-q" type="text" placeholder="${t('grep_ph')}" />
          <button id="grep-go" class="btn primary sm">${t('search_btn')}</button>
        </div>
        <div id="grep-res"></div>
      </div>
    `;
    $('grep-go').onclick = () => wsSend({ type: 'search_grep', sid: state.activeSid, dir: '/', query: $('grep-q').value });
    $('grep-q').onkeydown = (e) => { if (e.key === 'Enter') $('grep-go').click(); };
    const resEl = $('grep-res');
    for (const r of state.searchResults || []) {
      const d = document.createElement('div');
      d.className = 'list-item';
      d.innerHTML = `<div class="list-item-main"><div class="list-item-text"><div class="list-item-title mono" style="font-size:12px;">${esc(r.path)}:${r.line}</div><div class="list-item-sub mono">${esc(r.text)}</div></div></div>`;
      d.onclick = () => wsSend({ type: 'fs_read', sid: state.activeSid, path: r.path });
      resEl.appendChild(d);
    }
  } else if (state.view === 'known') {
    el.innerHTML = `<div class="side-header"><span>${t('hdr_known')}</span></div><div class="side-body" id="kh-list"></div>`;
    const list = $('kh-list');
    for (const k of state.knownHosts) {
      const c = document.createElement('div');
      c.className = 'list-item';
      c.innerHTML = `<div class="list-item-main"><div class="list-item-text"><div class="list-item-title mono">${esc(k.host)}</div><div class="list-item-sub mono">${esc(k.fp)}</div></div></div><div class="list-item-acts"><button class="icon-btn xs del">${ICO.trash}</button></div>`;
      c.querySelector('.del').onclick = () => wsSend({ type: 'remove_known_host', host: k.host });
      list.appendChild(c);
    }
  } else if (state.view === 'settings') {
    const curLang = getLang();
    el.innerHTML = `
      <div class="side-header"><span>${t('hdr_settings')}</span></div>
      <div class="side-body">
        <label class="field-label">${t('set_lang')}</label>
        <select id="set-lang">
          <option value="en" ${curLang === 'en' ? 'selected' : ''}>English</option>
          <option value="tr" ${curLang === 'tr' ? 'selected' : ''}>Türkçe</option>
        </select>
        <label class="field-label">${t('set_font')}</label>
        <input id="set-fs" type="number" value="${state.settings.font_size || 14}" />
        <label class="field-label">${t('set_sb')}</label>
        <input id="set-sb" type="number" value="${state.settings.scrollback || 5000}" />
        <button id="set-save" class="btn primary full">${t('set_save')}</button>
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-strong);">
          <label class="field-label">${t('share_my_id')}</label>
          <div style="display:flex;gap:6px;margin-bottom:8px;">
            <input id="my-uid-val" class="mono" readonly value="${esc(state.userId || '')}" style="flex:1;font-size:11.5px;" />
            <button id="my-uid-copy" class="btn sm">${t('reg_copy')}</button>
          </div>
          <button id="set-open-share" class="btn full">${t('share_btn')} (${(state.sharesOut || []).length})</button>
        </div>
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-strong);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <span style="font-size:12px;font-weight:600;color:var(--ink-bright);">MCP Connections (${(state.mcpLinks || []).length})</span>
            <button id="mcp-refresh-btn" class="icon-btn xs" title="${t('refresh')}">↻</button>
          </div>
          <div style="display:flex;gap:6px;margin-bottom:8px;">
            <input id="mcp-new-label" placeholder="Client name (e.g. Cursor)" style="flex:1;" />
            <button id="mcp-add-btn" class="btn primary sm">+</button>
          </div>
          <div id="mcp-links-list" style="display:flex;flex-direction:column;gap:8px;">
            ${(state.mcpLinks || []).map((l) => {
              const p = l.permissions || {};
              const permItems = [
                ['connect', curLang === 'tr' ? 'Sunucuya Bağlanma' : 'Connect Server'],
                ['exec', curLang === 'tr' ? 'Komut Çalıştırma' : 'Run Commands'],
                ['hosts_add', curLang === 'tr' ? 'Sunucu Ekleme' : 'Add Server'],
                ['hosts_edit', curLang === 'tr' ? 'Sunucu Düzenleme' : 'Edit Server'],
                ['hosts_delete', curLang === 'tr' ? 'Sunucu Silme' : 'Delete Server'],
                ['files_read', curLang === 'tr' ? 'Dosya Okuma' : 'Read Files'],
                ['files_write', curLang === 'tr' ? 'Dosya Oluştur/Düzenle' : 'Create/Edit Files'],
                ['files_delete', curLang === 'tr' ? 'Dosya Silme' : 'Delete Files'],
                ['docker', 'Docker'],
                ['share', curLang === 'tr' ? 'Paylaşım' : 'Sharing'],
              ];
              return `
              <div style="padding:8px;border-radius:4px;background:var(--bg-editor);border:1px solid var(--border-strong);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                  <span style="font-size:12px;font-weight:500;color:var(--ink-bright);display:flex;align-items:center;gap:6px;">
                    <span class="dot" style="background:${l.connected ? 'var(--success)' : (l.lastUsedAt ? 'var(--accent)' : '#52525b')}"></span>
                    ${esc(l.label)}
                  </span>
                  <span class="muted" style="font-size:10.5px;">${l.connected ? 'Connected' : (l.calls ? `${l.calls} calls` : 'Idle')}</span>
                </div>
                ${l.lastIp ? `<div class="muted mono" style="font-size:10.5px;margin-bottom:4px;">IP: ${esc(l.lastIp)}</div>` : ''}
                <input class="mono" readonly value="${esc(location.origin + apiUrl('/mcp/' + l.token))}" style="font-size:11px;margin-bottom:6px;" />
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 6px;margin-bottom:8px;padding:6px;background:var(--bg-sidebar);border:1px solid var(--border);border-radius:4px;">
                  ${permItems.map(([pk, plabel]) => `
                    <label style="display:flex;align-items:center;gap:5px;font-size:11px;cursor:pointer;user-select:none;">
                      <input type="checkbox" class="mcp-perm-cb" data-mcp-id="${esc(l.id)}" data-perm="${pk}" ${p[pk] !== false ? 'checked' : ''} style="width:auto;margin:0;" />
                      <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(plabel)}</span>
                    </label>
                  `).join('')}
                </div>
                <div style="display:flex;gap:4px;">
                  <button class="btn sm mcp-copy" data-url="${esc(location.origin + apiUrl('/mcp/' + l.token))}" style="flex:1;justify-content:center;">${t('reg_copy')}</button>
                  <button class="btn sm mcp-disc" data-id="${esc(l.id)}" title="Disconnect">Disconnect</button>
                  <button class="btn danger sm mcp-del" data-id="${esc(l.id)}" title="${t('tt_delete')}">${t('tt_delete')}</button>
                </div>
              </div>
            `;
            }).join('')}
          </div>
        </div>
        <button id="set-logout" class="btn danger full" style="margin-top:14px;">${t('sign_out')}</button>
      </div>
    `;
    $('set-logout').onclick = () => {
      showAuthLoader(getLang() === 'tr' ? 'Çıkış yapılıyor...' : 'Signing out...');
      sessionStorage.removeItem('trm_web_token');
      sessionStorage.removeItem('trm_client_id');
      sessionStorage.removeItem('trm_active_sid');
      sessionStorage.removeItem('trm_active_term');
      setTimeout(() => location.reload(), 450);
    };
    if ($('my-uid-copy')) {
      $('my-uid-copy').onclick = async () => {
        try { await navigator.clipboard.writeText(state.userId || ''); } catch {}
        $('my-uid-copy').textContent = t('reg_copied');
        setTimeout(() => { if ($('my-uid-copy')) $('my-uid-copy').textContent = t('reg_copy'); }, 1500);
      };
    }
    if ($('set-open-share')) {
      $('set-open-share').onclick = () => openShareModal();
    }
    if ($('mcp-refresh-btn')) {
      $('mcp-refresh-btn').onclick = () => wsSend({ type: 'mcp_list' });
    }
    if ($('mcp-add-btn')) {
      $('mcp-add-btn').onclick = () => {
        wsSend({ type: 'mcp_create', label: $('mcp-new-label').value.trim() || 'MCP Link' });
        $('mcp-new-label').value = '';
      };
    }
    document.querySelectorAll('.mcp-copy').forEach((b) => {
      b.onclick = async () => {
        try { await navigator.clipboard.writeText(b.dataset.url); } catch {}
        b.textContent = t('reg_copied');
        setTimeout(() => { b.textContent = t('reg_copy'); }, 1500);
      };
    });
    document.querySelectorAll('.mcp-disc').forEach((b) => {
      b.onclick = () => wsSend({ type: 'mcp_disconnect', id: b.dataset.id });
    });
    document.querySelectorAll('.mcp-del').forEach((b) => {
      b.onclick = () => wsSend({ type: 'mcp_delete', id: b.dataset.id });
    });
    document.querySelectorAll('.mcp-perm-cb').forEach((cb) => {
      cb.onchange = () => {
        const mcpId = cb.dataset.mcpId;
        const boxes = document.querySelectorAll(`.mcp-perm-cb[data-mcp-id="${CSS.escape(mcpId)}"]`);
        const permissions = {};
        boxes.forEach((x) => { permissions[x.dataset.perm] = x.checked; });
        if ((permissions.files_write || permissions.files_delete) && cb.dataset.perm !== 'files_read') {
          permissions.files_read = true;
        } else if (cb.dataset.perm === 'files_read' && !cb.checked) {
          permissions.files_write = false;
          permissions.files_delete = false;
        }
        wsSend({ type: 'mcp_update_perms', id: mcpId, permissions });
      };
    });
    $('set-lang').onchange = () => {
      localStorage.setItem('trm_lang', $('set-lang').value);
      applyStaticI18n();
      renderSidebar();
      renderWelcomeRecent();
      renderTabs();
      renderVncTabs();
      renderTermTabs();
      if (!state.activeSid) $('status-left').textContent = t('not_connected');
    };
    $('set-save').onclick = () => {
      state.settings.font_size = Number($('set-fs').value) || 14;
      state.settings.scrollback = Number($('set-sb').value) || 5000;
      wsSend({ type: 'save_settings', settings: state.settings });
      toast(t('set_saved'), 'ok');
    };
  } else if (state.view === 'share') {
    renderShareSidebar(el);
  }
}

function renderTree(container, sid, sess, dir, depth) {
  const entries = sess.dirs.get(dir) || [];
  for (const e of entries) {
    const full = dir.endsWith('/') ? `${dir}${e.name}` : `${dir}/${e.name}`;
    const row = document.createElement('div');
    row.className = 'tree-row';
    row.style.paddingLeft = `${8 + depth * 14}px`;
    const open = e.isDir && sess.expanded.has(full);
    row.innerHTML = `
      <span class="tree-label">
        ${e.isDir ? (open ? ICO.chevDown : ICO.chevRight) : '<span style="width:12px;display:inline-block;"></span>'}
        ${e.isDir ? ICO.folder : ICO.file}
        <span class="tree-name">${esc(e.name)}</span>
      </span>
      <span class="tree-acts">
        ${e.isDir ? `<button class="icon-btn xs up" title="${t('tt_upload')}">${ICO.upload}</button>` : `<button class="icon-btn xs dl" title="${t('tt_download')}">${ICO.download}</button>`}
        <button class="icon-btn xs ren" title="${t('tt_rename')}">${ICO.edit}</button>
        <button class="icon-btn xs del" title="${t('tt_delete')}">${ICO.trash}</button>
      </span>
    `;
    row.onclick = (ev) => {
      if (ev.target.closest('.up')) return triggerUpload(sid, full);
      if (ev.target.closest('.dl')) return wsSend({ type: 'fs_download', sid, path: full });
      if (ev.target.closest('.ren')) {
        return openRenameModal(sid, dir, e.name, full, e.isDir);
      }
      if (ev.target.closest('.del')) {
        if (confirm(`${e.name} silinsin mi?`)) wsSend({ type: 'fs_delete', sid, path: full, isDir: e.isDir });
        return;
      }
      if (e.isDir) {
        if (sess.expanded.has(full)) sess.expanded.delete(full);
        else {
          sess.expanded.add(full);
          if (!sess.dirs.has(full)) wsSend({ type: 'fs_list', sid, dir: full });
        }
        renderSidebar();
      } else {
        const kind = getMediaKind(full);
        if (kind) openMediaTab(sid, full, kind);
        else wsSend({ type: 'fs_read', sid, path: full });
      }
    };
    container.appendChild(row);
    if (open) renderTree(container, sid, sess, full, depth + 1);
  }
}

function openRenameModal(sid, dir, oldName, full, isDir) {
  showModal(`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
      <h3 style="margin:0;">${isDir ? t('ren_folder') : t('ren_file')}</h3>
      <button class="icon-btn" data-close-modal title="${t('close')}">${ICO.close}</button>
    </div>
    <label class="field-label">${t('new_name')}</label>
    <input id="ren-input" type="text" value="${esc(oldName)}" />
    <div class="modal-actions">
      <button class="btn" data-close-modal>${t('cancel')}</button>
      <button class="btn primary" id="ren-save">${t('save')}</button>
    </div>
  `);
  const inp = $('ren-input');
  inp.focus();
  const dot = !isDir ? oldName.lastIndexOf('.') : -1;
  inp.setSelectionRange(0, dot > 0 ? dot : oldName.length);
  const submit = () => {
    const nn = inp.value.trim();
    if (!nn) return;
    if (nn !== oldName) {
      const base = dir === '/' ? '' : dir.replace(/\/$/, '');
      wsSend({ type: 'fs_rename', sid, oldPath: full, newPath: `${base}/${nn}` });
    }
    closeModal();
  };
  $('ren-save').onclick = submit;
  inp.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
}

function getMediaKind(filePath) {
  const ext = (filePath.split('.').pop() || '').toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'mov', 'mkv', 'ogv'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus'].includes(ext)) return 'audio';
  return null;
}

function mediaUrl(sid, filePath) {
  return `${apiUrl('/api/media')}?token=${encodeURIComponent(state.token)}&clientId=${encodeURIComponent(state.clientId)}&sid=${encodeURIComponent(sid)}&path=${encodeURIComponent(filePath)}`;
}

function openMediaTab(sid, filePath, mediaKind) {
  closeMobileSidebarIfNeeded();
  let idx = state.tabs.findIndex((t) => t.type === 'media' && t.sid === sid && t.path === filePath);
  if (idx === -1) {
    state.tabs.push({
      type: 'media',
      mediaKind,
      title: filePath.split('/').pop() || filePath,
      sid,
      path: filePath,
      fit: true,
    });
    idx = state.tabs.length - 1;
  }
  state.activeTab = idx;
  renderTabs();
}

function renderMediaViewer(tab) {
  const mv = $('media-viewer');
  const url = esc(mediaUrl(tab.sid, tab.path));
  let body = '';
  if (tab.mediaKind === 'image') {
    body = `<img src="${url}" class="${tab.fit ? 'fit' : 'raw'}" alt="${esc(tab.title)}" />`;
  } else if (tab.mediaKind === 'video') {
    body = `<video src="${url}" controls autoplay playsinline></video>`;
  } else {
    body = `
      <div class="media-audio-card">
        <div class="mono" style="color:var(--ink-bright);font-size:13.5px;word-break:break-all;text-align:center;">${esc(tab.title)}</div>
        <audio src="${url}" controls autoplay></audio>
      </div>
    `;
  }
  mv.innerHTML = `
    <div class="editor-toolbar">
      <span class="mono muted">${esc(tab.path)}</span>
      <div style="display:flex;gap:6px;">
        ${tab.mediaKind === 'image' ? `<button class="btn sm" id="mv-fit">${tab.fit ? t('mv_raw') : t('mv_fit')}</button>` : ''}
        <button class="btn sm" id="mv-dl">${t('tt_download')}</button>
      </div>
    </div>
    <div class="media-stage">${body}</div>
  `;
  if ($('mv-fit')) {
    $('mv-fit').onclick = () => { tab.fit = !tab.fit; renderMediaViewer(tab); };
  }
  $('mv-dl').onclick = () => wsSend({ type: 'fs_download', sid: tab.sid, path: tab.path });
}

function openFileTab(sid, filePath, text) {
  closeMobileSidebarIfNeeded();
  let idx = state.tabs.findIndex((t) => t.type === 'file' && t.sid === sid && t.path === filePath);
  if (idx === -1) {
    state.tabs.push({ type: 'file', title: filePath.split('/').pop() || filePath, sid, path: filePath, text, dirty: false });
    idx = state.tabs.length - 1;
  }
  state.activeTab = idx;
  renderTabs();
}

function openDockerTab(sid) {
  closeMobileSidebarIfNeeded();
  let idx = state.tabs.findIndex((t) => t.type === 'docker' && t.sid === sid);
  if (idx === -1) {
    state.tabs.push({ type: 'docker', title: 'Docker', sid });
    idx = state.tabs.length - 1;
  }
  state.activeTab = idx;
  wsSend({ type: 'docker_list', sid });
  renderTabs();
}

function uniqueTermTitle(baseTitle, excludeReqId) {
  const used = new Set(
    state.terms.filter((t) => t.reqId !== excludeReqId && t.title).map((t) => t.title)
  );
  if (!used.has(baseTitle)) return baseTitle;
  let n = 2;
  while (used.has(`${baseTitle} (${n})`)) n++;
  return `${baseTitle} (${n})`;
}

function makeDraggableTab(el, idx, list, onMove) {
  el.draggable = true;
  el.ondragstart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
    el.classList.add('dragging');
  };
  el.ondragend = () => el.classList.remove('dragging');
  el.ondragover = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    el.classList.add('drag-over');
  };
  el.ondragleave = () => el.classList.remove('drag-over');
  el.ondrop = (e) => {
    el.classList.remove('drag-over');
    const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!Number.isInteger(from) || from === idx || from < 0 || from >= list.length) return;
    e.preventDefault();
    e.stopPropagation();
    const [item] = list.splice(from, 1);
    list.splice(idx, 0, item);
    onMove(from, idx);
  };
}

function openVncTab(sid, host = '127.0.0.1', port = 5900, password = '') {
  closeMobileSidebarIfNeeded();
  const sName = state.sessions.get(sid)?.name || host;
  let idx = state.vncTabs.findIndex((t) => t.sid === sid && t.host === host && t.port === port);
  if (idx === -1) {
    state.vncTabs.push({
      type: 'vnc',
      id: `vnc-${++state.nextReqId}`,
      title: `VNC: ${sName} (:${port})`,
      sid,
      host,
      port,
      password,
    });
    idx = state.vncTabs.length - 1;
  } else if (password) {
    state.vncTabs[idx].password = password;
  }
  state.activeVncTab = idx;
  renderVncTabs();
  applyLayout();
}

function renderVncTabs() {
  const pane = $('vnc-pane');
  const bar = $('vnc-tabs');
  bar.innerHTML = '';
  if (!state.vncTabs.length) {
    pane.classList.add('hidden');
    $('editor-pane').classList.remove('hidden');
    applyLayout();
    return;
  }
  pane.classList.remove('hidden');
  if (!state.tabs.length) $('editor-pane').classList.add('hidden');
  state.vncTabs.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = `tab ${i === state.activeVncTab ? 'active' : ''}`;
    el.innerHTML = `${ICO.monitor}<span>${esc(t.title)}</span><span class="tab-close">${ICO.close}</span>`;
    el.onclick = (e) => {
      if (e.target.closest('.tab-close')) {
        const rfb = state.vncRfbs.get(t.id);
        if (rfb) { try { rfb.disconnect(); } catch {} state.vncRfbs.delete(t.id); }
        $('vnc-view').querySelector(`[data-vnc-id="${t.id}"]`)?.remove();
        state.vncTabs.splice(i, 1);
        state.activeVncTab = Math.max(0, Math.min(state.activeVncTab, state.vncTabs.length - 1));
        return renderVncTabs();
      }
      state.activeVncTab = i;
      renderVncTabs();
    };
    makeDraggableTab(el, i, state.vncTabs, (from, to) => {
      if (state.activeVncTab === from) state.activeVncTab = to;
      else if (from < state.activeVncTab && to >= state.activeVncTab) state.activeVncTab--;
      else if (from > state.activeVncTab && to <= state.activeVncTab) state.activeVncTab++;
      renderVncTabs();
    });
    bar.appendChild(el);
  });
  mountVncTab(state.vncTabs[state.activeVncTab]);
}

async function mountVncTab(tab) {
  const view = $('vnc-view');
  let slot = view.querySelector(`[data-vnc-id="${tab.id}"]`);
  for (const child of view.children) child.classList.add('hidden');
  if (slot) {
    slot.classList.remove('hidden');
    return;
  }
  slot = document.createElement('div');
  slot.className = 'vnc-slot';
  slot.dataset.vncId = tab.id;
  slot.innerHTML = `
    <div class="vnc-toolbar">
      <div class="vnc-toolbar-left">
        <span class="mono">${esc(tab.title)}</span>
        <span class="vnc-status" data-role="status">${t('vnc_connecting')}</span>
      </div>
      <div class="vnc-toolbar-right">
        <select class="vnc-sel" data-role="quality">
          <option value="fast" selected>${t('vnc_q_fast')}</option>
          <option value="bal">${t('vnc_q_bal')}</option>
          <option value="high">${t('vnc_q_high')}</option>
        </select>
        <button class="btn sm" data-role="cad">Ctrl+Alt+Del</button>
        <button class="btn sm" data-role="scale">${t('vnc_fit_on')}</button>
        <button class="btn sm" data-role="fullscreen">${t('vnc_fs')}</button>
        <button class="btn sm" data-role="reconnect">${t('vnc_reload')}</button>
      </div>
    </div>
    <div class="vnc-stage"></div>
  `;
  view.appendChild(slot);

  const stage = slot.querySelector('.vnc-stage');
  const statusEl = slot.querySelector('[data-role="status"]');
  const scaleBtn = slot.querySelector('[data-role="scale"]');
  const fsBtn = slot.querySelector('[data-role="fullscreen"]');
  const qualSel = slot.querySelector('[data-role="quality"]');
  let scale = true;

  const applyQuality = (rfb) => {
    if (!rfb) return;
    const q = qualSel.value;
    if (q === 'fast') { rfb.qualityLevel = 4; rfb.compressionLevel = 1; }
    else if (q === 'bal') { rfb.qualityLevel = 6; rfb.compressionLevel = 2; }
    else { rfb.qualityLevel = 9; rfb.compressionLevel = 4; }
  };

  const connectRfb = async () => {
    const old = state.vncRfbs.get(tab.id);
    if (old) { try { old.disconnect(); } catch {} state.vncRfbs.delete(tab.id); }
    stage.innerHTML = '';
    statusEl.textContent = t('vnc_connecting');
    statusEl.className = 'vnc-status';
    try {
      const { default: RFB } = await import(apiUrl('/novnc/core/rfb.js'));
      const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${proto}//${location.host}${apiUrl('/ws-vnc')}?token=${encodeURIComponent(state.token)}&clientId=${encodeURIComponent(state.clientId)}&sid=${encodeURIComponent(tab.sid)}&host=${encodeURIComponent(tab.host)}&port=${tab.port}`;
      const rfb = new RFB(stage, url, tab.password ? { credentials: { password: tab.password } } : {});
      rfb.scaleViewport = scale;
      rfb.resizeSession = false;
      rfb.showDotCursor = true;
      applyQuality(rfb);
      rfb.addEventListener('connect', () => {
        statusEl.textContent = t('vnc_connected');
        statusEl.className = 'vnc-status ok';
      });
      rfb.addEventListener('disconnect', (e) => {
        statusEl.textContent = e.detail?.clean ? t('vnc_closed') : t('vnc_failed');
        statusEl.className = 'vnc-status err';
      });
      rfb.addEventListener('credentialsrequired', () => {
        const pw = prompt(t('vnc_pw_prompt'));
        if (pw !== null) rfb.sendCredentials({ password: pw });
      });
      state.vncRfbs.set(tab.id, rfb);
    } catch (e) {
      statusEl.textContent = `${e.message || e}`;
      statusEl.className = 'vnc-status err';
    }
  };

  qualSel.onchange = () => applyQuality(state.vncRfbs.get(tab.id));
  slot.querySelector('[data-role="cad"]').onclick = () => state.vncRfbs.get(tab.id)?.sendCtrlAltDel();
  scaleBtn.onclick = () => {
    scale = !scale;
    scaleBtn.textContent = scale ? t('vnc_fit_on') : t('vnc_fit_off');
    const rfb = state.vncRfbs.get(tab.id);
    if (rfb) rfb.scaleViewport = scale;
  };
  fsBtn.onclick = () => {
    if (document.fullscreenElement === slot) document.exitFullscreen();
    else slot.requestFullscreen?.();
  };
  slot.addEventListener('fullscreenchange', () => {
    fsBtn.textContent = document.fullscreenElement === slot ? t('vnc_fs_exit') : t('vnc_fs');
  });
  slot.querySelector('[data-role="reconnect"]').onclick = connectRfb;
  connectRfb();
}

function renderTabs() {
  const bar = $('tab-bar');
  bar.innerHTML = '';
  const termHost = $('term-editor-host');
  if (!state.tabs.length) {
    $('editor-pane').classList.toggle('hidden', state.vncTabs.length > 0);
    $('welcome-view').classList.remove('hidden');
    $('code-editor-wrap').classList.add('hidden');
    $('docker-view').classList.add('hidden');
    $('media-viewer').classList.add('hidden');
    termHost.classList.add('hidden');
    applyLayout();
    return;
  }
  $('editor-pane').classList.remove('hidden');
  state.tabs.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = `tab ${i === state.activeTab ? 'active' : ''}`;
    const ico = t.type === 'docker' ? ICO.docker : t.type === 'term' ? ICO.term : ICO.file;
    el.innerHTML = `${ico}<span>${t.dirty ? '● ' : ''}${esc(t.title)}</span><span class="tab-close">${ICO.close}</span>`;
    el.onclick = (e) => {
      if (e.target.closest('.tab-close')) {
        if (t.type === 'term') {
          const term = t.term;
          if (term?.termId) wsSend({ type: 'term_close', termId: term.termId });
          term?.xterm.dispose();
          term?.el.remove();
          state.terms = state.terms.filter((x) => x !== term);
        }
        state.tabs.splice(i, 1);
        state.activeTab = Math.max(0, Math.min(state.activeTab, state.tabs.length - 1));
        return renderTabs();
      }
      state.activeTab = i;
      renderTabs();
    };
    makeDraggableTab(el, i, state.tabs, (from, to) => {
      if (state.activeTab === from) state.activeTab = to;
      else if (from < state.activeTab && to >= state.activeTab) state.activeTab--;
      else if (from > state.activeTab && to <= state.activeTab) state.activeTab++;
      renderTabs();
    });
    bar.appendChild(el);
  });

  const cur = state.tabs[state.activeTab];
  $('welcome-view').classList.add('hidden');
  $('code-editor-wrap').classList.add('hidden');
  $('docker-view').classList.add('hidden');
  $('media-viewer').classList.add('hidden');
  termHost.classList.add('hidden');
  for (const ch of termHost.children) ch.classList.add('hidden');

  if (cur.type === 'file') {
    $('code-editor-wrap').classList.remove('hidden');
    $('editor-path').textContent = cur.path;
    $('code-editor').value = cur.text;
  } else if (cur.type === 'docker') {
    $('docker-view').classList.remove('hidden');
    renderDockerTab(cur.sid);
  } else if (cur.type === 'media') {
    $('media-viewer').classList.remove('hidden');
    renderMediaViewer(cur);
  } else if (cur.type === 'term' && cur.term) {
    termHost.classList.remove('hidden');
    if (cur.term.el.parentElement !== termHost) termHost.appendChild(cur.term.el);
    cur.term.el.classList.remove('hidden');
    setTimeout(() => cur.term.fit.fit(), 15);
  }
  applyLayout();
}

$('code-editor').oninput = () => {
  const cur = state.tabs[state.activeTab];
  if (cur?.type === 'file') { cur.text = $('code-editor').value; cur.dirty = true; }
};
$('editor-save-btn').onclick = saveCurrentFile;
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveCurrentFile(); }
});
function saveCurrentFile() {
  const cur = state.tabs[state.activeTab];
  if (cur?.type === 'file') wsSend({ type: 'fs_write', sid: cur.sid, path: cur.path, text: cur.text });
}

function closeDockerDrawerTerm() {
  if (!state.dockerDrawerTerm) return;
  if (state.dockerDrawerTerm.termId) {
    wsSend({ type: 'term_close', termId: state.dockerDrawerTerm.termId });
  }
  const oldIdx = state.terms.indexOf(state.dockerDrawerTerm);
  if (oldIdx !== -1) state.terms.splice(oldIdx, 1);
  try { state.dockerDrawerTerm.xterm?.dispose(); } catch {}
  state.dockerDrawerTerm.el?.remove();
  state.dockerDrawerTerm = null;
}

function attachDockerDrawerTerm(sid, cid, cname, mountEl) {
  if (!mountEl) return;
  if (state.dockerDrawerTerm && state.dockerDrawerTerm.cid === cid && mountEl.contains(state.dockerDrawerTerm.el)) {
    setTimeout(() => state.dockerDrawerTerm.fit?.fit(), 30);
    return;
  }
  closeDockerDrawerTerm();

  const reqId = state.nextReqId++;
  const el = document.createElement('div');
  el.className = 'term-slot';
  el.style.width = '100%';
  el.style.height = '100%';
  mountEl.innerHTML = '';
  mountEl.appendChild(el);

  const xterm = new Terminal({
    cursorBlink: true,
    cursorStyle: 'bar',
    cursorWidth: 2,
    fontSize: 12,
    lineHeight: 1.2,
    drawBoldTextInBrightColors: true,
    scrollback: 2500,
    theme: {
      background: '#121212',
      foreground: '#cccccc',
      cursor: '#ffffff',
      brightBlack: '#444444',
      selectionBackground: 'rgba(55, 148, 255, 0.48)',
      selectionInactiveBackground: 'rgba(55, 148, 255, 0.42)',
    },
  });
  const fit = new FitAddon.FitAddon();
  xterm.loadAddon(fit);
  xterm.open(el);
  setTimeout(() => fit.fit(), 50);
  attachSmoothCursor(xterm, el);
  attachTouchScroll(xterm, el);

  const inst = {
    reqId,
    termId: null,
    sid,
    title: cname,
    xterm,
    fit,
    el,
    cid,
    isDockerDrawer: true,
  };
  state.terms.push(inst);
  state.dockerDrawerTerm = inst;

  xterm.onData((data) => {
    if (inst.termId) sendTermInputWithMods(inst.termId, data);
  });
  xterm.onResize(({ rows, cols }) => {
    if (inst.termId) wsSend({ type: 'term_resize', termId: inst.termId, rows, cols });
  });
  wsSend({
    type: 'term_open',
    reqId,
    sid,
    rows: xterm.rows || 24,
    cols: xterm.cols || 80,
    dockerId: cid,
    dockerName: cname,
  });
}

const dkIco = {
  docker: `<svg class="dk-ico" style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5"></path><rect x="2" y="11" width="20" height="9" rx="2"></rect><path d="M10 7h4"></path></svg>`,
  container: `<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
  term: `<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
  play: `<svg class="dk-ico" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>`,
  stop: `<svg class="dk-ico" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2"></rect></svg>`,
  restart: `<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path></svg>`,
  logs: `<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
  info: `<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  settings: `<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  refresh: `<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
  copy: `<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
  close: `<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  trash: `<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  search: `<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  cube: `<svg class="dk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`
};

function renderDockerTab(sid) {
  const view = $('docker-view');
  const d = state.dockerData.get(sid);
  if (!d) {
    view.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:320px;color:#94a3b8;gap:10px;"><span class="btn-spinner"></span><span>${t('docker_loading')}</span></div>`;
    return;
  }
  if (d.error) {
    let title = t('docker_err_title');
    let desc = esc(d.error);
    let fixCmd = '';
    if (/permission denied/i.test(d.error) && /docker\.sock/i.test(d.error)) {
      title = t('docker_err_perm_title');
      desc = t('docker_err_perm_desc');
      fixCmd = 'sudo usermod -aG docker $USER';
    } else if (/cannot connect to the docker daemon|is the docker daemon running/i.test(d.error)) {
      title = t('docker_err_down_title');
      desc = t('docker_err_down_desc');
      fixCmd = 'sudo systemctl start docker';
    } else if (/command not found|not found/i.test(d.error)) {
      title = t('docker_err_missing_title');
      desc = t('docker_err_missing_desc');
    }
    view.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <h3 style="margin:0;font-size:17px;font-weight:700;">Docker</h3>
        </div>
        <button class="btn sm" id="dk-ref">${dkIco.refresh} <span style="margin-left:4px;">${t('refresh')}</span></button>
      </div>
      <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:16px 18px;">
        <div style="font-weight:600;color:#f87171;margin-bottom:6px;font-size:14px;">${title}</div>
        <div class="muted" style="font-size:12.5px;line-height:1.5;">${desc}</div>
        ${fixCmd ? `<div style="display:flex;align-items:center;gap:8px;margin-top:12px;"><code class="mono" style="background:#090a0f;padding:7px 12px;border-radius:5px;border:1px solid rgba(255,255,255,0.1);font-size:12px;color:#f1f5f9;">${esc(fixCmd)}</code><button class="btn sm" id="dk-copy-fix">${dkIco.copy} <span style="margin-left:4px;">${t('copy')}</span></button></div>` : ''}
      </div>
    `;
    $('dk-ref').onclick = () => wsSend({ type: 'docker_list', sid });
    if ($('dk-copy-fix')) {
      $('dk-copy-fix').onclick = () => {
        navigator.clipboard.writeText(fixCmd).then(() => toast(t('cmd_copied'), 'ok')).catch(() => {});
      };
    }
    return;
  }
  const containers = d.containers || [];
  const images = d.images || [];
  const volumes = d.volumes || [];
  const networks = d.networks || [];
  const runningCount = containers.filter((c) => c.state === 'running').length;
  const stoppedCount = containers.length - runningCount;
  if (!state.dockerSubTab) state.dockerSubTab = 'containers';
  if (state.dockerFilter === undefined) state.dockerFilter = '';
  if (!state.dockerStateFilter) state.dockerStateFilter = 'all';
  if (!state.dockerDrawerTab) state.dockerDrawerTab = 'terminal';
  const selC = state.selectedDockerId ? containers.find((x) => x.id === state.selectedDockerId) : null;

  const q = state.dockerFilter.toLowerCase();
  let filtered = containers;
  if (state.dockerStateFilter === 'running') filtered = filtered.filter((c) => c.state === 'running');
  else if (state.dockerStateFilter === 'stopped') filtered = filtered.filter((c) => c.state !== 'running');
  if (q) {
    filtered = filtered.filter((c) => (c.name || '').toLowerCase().includes(q) || (c.image || '').toLowerCase().includes(q) || (c.id || '').toLowerCase().includes(q));
  }

  const pctNum = (s) => Math.min(100, Math.max(0, parseFloat(String(s || '0').replace('%', '')) || 0));

  function renderActBtn(act, cid, textKey, btnCls = 'dk-btn-restart', ico = '') {
    const isThisBusy = state.dockerBusy && state.dockerBusy.id === cid && state.dockerBusy.act === act;
    const anyBusy = !!state.dockerBusy;
    if (isThisBusy) {
      return `<button class="dk-btn-action ${btnCls}" disabled><span class="btn-spinner"></span><span>${t('docker_' + act + 'ing') || t(textKey)}</span></button>`;
    }
    return `<button class="dk-btn-action ${btnCls} ${anyBusy ? 'btn-disabled' : ''}" ${anyBusy ? 'disabled' : ''} data-dk-act="${act} ${esc(cid)}">${ico}<span>${t(textKey)}</span></button>`;
  }

  function cleanPort(p) {
    const m = p.match(/(\d+)->(\d+)/);
    if (m) return `${m[1]}:${m[2]}`;
    const m2 = p.match(/(\d+\/[a-z]+)/);
    return m2 ? m2[1] : p;
  }

  view.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:12px;flex-wrap:wrap;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:30px;height:30px;border-radius:7px;background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.25);display:flex;align-items:center;justify-content:center;color:#60a5fa;">
          ${dkIco.docker}
        </div>
        <div>
          <div style="font-size:16px;font-weight:700;letter-spacing:-0.01em;color:#f8fafc;display:flex;align-items:center;gap:8px;">
            <span>Docker</span>
            <span class="badge" style="background:rgba(59,130,246,0.12);color:#60a5fa;border:1px solid rgba(59,130,246,0.25);border-radius:9999px;padding:1px 7px;font-size:11px;font-weight:600;">${runningCount} / ${containers.length}</span>
          </div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="position:relative;display:flex;align-items:center;">
          <span style="position:absolute;left:9px;color:#64748b;display:flex;align-items:center;">${dkIco.search}</span>
          <input id="dk-search" value="${esc(state.dockerFilter)}" placeholder="${t('docker_search')}" style="padding:6px 10px 6px 28px;font-size:12px;background:#111622;border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#f1f5f9;width:200px;" />
          ${state.dockerFilter ? `<button id="dk-search-clear" style="position:absolute;right:8px;background:transparent;border:none;color:#94a3b8;cursor:pointer;padding:0;display:flex;align-items:center;">${dkIco.close}</button>` : ''}
        </div>
        <button class="btn sm" id="dk-ref" ${state.dockerBusy ? 'disabled' : ''} style="display:flex;align-items:center;gap:4px;">
          ${dkIco.refresh}<span>${t('refresh')}</span>
        </button>
      </div>
    </div>

    <div class="dk-stat-grid">
      <div class="dk-stat-card">
        <div class="dk-stat-title"><span style="width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 6px #10b981;"></span><span>${t('docker_running')}</span></div>
        <div class="dk-stat-val" style="color:#10b981;">${runningCount}</div>
      </div>
      <div class="dk-stat-card">
        <div class="dk-stat-title"><span style="width:7px;height:7px;border-radius:50%;background:#64748b;"></span><span>${t('docker_stopped')}</span></div>
        <div class="dk-stat-val" style="color:#94a3b8;">${stoppedCount}</div>
      </div>
      <div class="dk-stat-card">
        <div class="dk-stat-title"><span style="width:7px;height:7px;border-radius:50%;background:#38bdf8;"></span><span>${t('docker_images')}</span></div>
        <div class="dk-stat-val" style="color:#38bdf8;">${images.length}</div>
      </div>
      <div class="dk-stat-card">
        <div class="dk-stat-title"><span style="width:7px;height:7px;border-radius:50%;background:#f59e0b;"></span><span>${t('docker_tab_volumes')}</span></div>
        <div class="dk-stat-val" style="color:#f59e0b;">${volumes.length} <span style="font-size:12px;color:#64748b;font-weight:400;">/ ${networks.length}</span></div>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:10px;flex-wrap:wrap;">
      <div style="display:flex;gap:5px;">
        <button class="btn sm ${state.dockerSubTab === 'containers' ? 'primary' : ''}" data-dk-sub="containers">${t('docker_tab_containers')} (${containers.length})</button>
        <button class="btn sm ${state.dockerSubTab === 'images' ? 'primary' : ''}" data-dk-sub="images">${t('docker_tab_images')} (${images.length})</button>
        <button class="btn sm ${state.dockerSubTab === 'volumes' ? 'primary' : ''}" data-dk-sub="volumes">${t('docker_tab_volumes')} (${volumes.length})</button>
        <button class="btn sm ${state.dockerSubTab === 'networks' ? 'primary' : ''}" data-dk-sub="networks">${t('docker_tab_networks')} (${networks.length})</button>
      </div>
      ${state.dockerSubTab === 'containers' ? `
        <div style="display:flex;gap:4px;">
          <button class="dk-filter-pill ${state.dockerStateFilter === 'all' ? 'active' : ''}" data-dk-fstate="all">${t('docker_all')} (${containers.length})</button>
          <button class="dk-filter-pill ${state.dockerStateFilter === 'running' ? 'active' : ''}" data-dk-fstate="running">${t('docker_running')} (${runningCount})</button>
          <button class="dk-filter-pill ${state.dockerStateFilter === 'stopped' ? 'active' : ''}" data-dk-fstate="stopped">${t('docker_stopped')} (${stoppedCount})</button>
        </div>
      ` : ''}
    </div>

    ${state.dockerSubTab === 'containers' ? `
      <div class="dk-main-split">
        <div class="dk-table-wrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>${t('col_name')}</th>
                ${!selC ? `<th>${t('col_image')}</th>` : ''}
                <th>${t('col_status')}</th>
                ${!selC ? `<th>${t('docker_resources')}</th>` : ''}
                <th style="text-align:right;">${t('col_actions')}</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `<tr><td colspan="${selC ? 3 : 5}" style="text-align:center;padding:32px;color:#64748b;">${t('docker_select_hint')}</td></tr>` : ''}
              ${filtered.map((c) => {
                const cpuVal = pctNum(c.cpu);
                const memVal = pctNum(c.memPerc);
                const isSel = selC && selC.id === c.id;
                const isRunning = c.state === 'running';
                const anyBusy = !!state.dockerBusy;
                const portChips = (c.ports || '').split(',').map((p) => p.trim()).filter(Boolean);
                return `
                <tr data-dk-row="${esc(c.id)}" class="${isSel ? 'selected' : ''}" style="cursor:pointer;">
                  <td>
                    <div style="display:flex;align-items:center;gap:9px;">
                      <div class="dk-c-avatar ${isRunning ? '' : 'stopped'}">
                        ${dkIco.cube}
                      </div>
                      <div style="min-width:0;">
                        <div style="font-weight:600;color:#f8fafc;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(c.name)}</div>
                        <div style="margin-top:2px;display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
                          <span class="mono muted" style="font-size:10.5px;">${esc(c.id)}</span>
                          ${portChips.length ? `<span class="dk-port-pill">${esc(cleanPort(portChips[0]))}</span>` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  ${!selC ? `
                  <td>
                    <span class="mono" style="font-size:11px;color:#94a3b8;background:rgba(255,255,255,0.04);padding:2px 7px;border-radius:4px;border:1px solid rgba(255,255,255,0.06);max-width:180px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(c.image)}">${esc(c.image)}</span>
                  </td>
                  ` : ''}
                  <td>
                    <span class="dk-status-pill ${isRunning ? 'running' : 'stopped'}">
                      <span class="dk-dot"></span>
                      <span style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${isRunning ? esc(c.status || t('docker_running')) : (c.status ? esc(c.status) : t('docker_stopped'))}</span>
                    </span>
                  </td>
                  ${!selC ? `
                  <td>
                    ${isRunning ? `
                      <div class="dk-meter-wrap">
                        <div class="dk-meter-row">
                          <div class="dk-meter-track"><div class="dk-meter-fill cpu" style="width:${cpuVal}%;"></div></div>
                          <span class="dk-meter-txt">${c.cpu ? esc(c.cpu) : '0%'}</span>
                        </div>
                        <div class="dk-meter-row">
                          <div class="dk-meter-track"><div class="dk-meter-fill mem" style="width:${memVal}%;"></div></div>
                          <span class="dk-meter-txt">${c.mem ? esc(c.mem.split('/')[0].trim()) : (c.memPerc ? esc(c.memPerc) : '0%')}</span>
                        </div>
                      </div>
                    ` : `<span class="muted" style="font-size:11px;">-</span>`}
                  </td>
                  ` : ''}
                  <td style="white-space:nowrap;text-align:right;">
                    <button class="dk-btn-action dk-btn-term ${anyBusy ? 'btn-disabled' : ''}" ${anyBusy ? 'disabled' : ''} data-dk-term="${esc(c.id)}" data-dk-name="${esc(c.name)}">${dkIco.term} <span>${t('docker_terminal')}</span></button>
                    ${isRunning ? renderActBtn('restart', c.id, 'restart', 'dk-btn-restart', dkIco.restart + ' ') : ''}
                    ${isRunning ? renderActBtn('stop', c.id, 'stop', 'dk-btn-stop', dkIco.stop + ' ') : renderActBtn('start', c.id, 'start', 'dk-btn-start', dkIco.play + ' ')}
                    <button class="dk-btn-action dk-btn-logs ${anyBusy ? 'btn-disabled' : ''}" ${anyBusy ? 'disabled' : ''} data-dk-logs="${esc(c.id)}">${dkIco.logs} <span>${t('logs')}</span></button>
                  </td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
        </div>

        ${selC ? `
        <div class="dk-drawer">
            <div class="dk-drawer-header">
              <div style="display:flex;align-items:center;gap:9px;min-width:0;">
                <span class="dk-dot" style="width:7px;height:7px;border-radius:50%;background:${selC.state === 'running' ? '#10b981' : '#64748b'};${selC.state === 'running' ? 'box-shadow:0 0 6px #10b981;' : ''}"></span>
                <div style="min-width:0;">
                  <div class="mono" style="font-weight:700;font-size:13.5px;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(selC.name)}</div>
                  <div class="mono muted" style="font-size:10.5px;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(selC.id)} • ${esc(selC.image)}</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:5px;flex-shrink:0;">
                ${selC.state === 'running' ? renderActBtn('restart', selC.id, 'restart', 'dk-btn-restart', dkIco.restart + ' ') : ''}
                ${selC.state === 'running' ? renderActBtn('stop', selC.id, 'stop', 'dk-btn-stop', dkIco.stop + ' ') : renderActBtn('start', selC.id, 'start', 'dk-btn-start', dkIco.play + ' ')}
                <button class="btn sm" id="dk-close-drawer" style="padding:4px;border-radius:5px;display:flex;align-items:center;justify-content:center;">${dkIco.close}</button>
              </div>
            </div>

            <div class="dk-drawer-tabs">
              <button class="dk-seg-btn ${state.dockerDrawerTab === 'terminal' ? 'active' : ''}" data-dk-dtab="terminal">${dkIco.term} <span>${t('docker_tab_terminal')}</span></button>
              <button class="dk-seg-btn ${state.dockerDrawerTab === 'overview' ? 'active' : ''}" data-dk-dtab="overview">${dkIco.info} <span>${t('docker_tab_overview')}</span></button>
              <button class="dk-seg-btn ${state.dockerDrawerTab === 'logs' ? 'active' : ''}" data-dk-dtab="logs">${dkIco.logs} <span>${t('docker_tab_logs')}</span></button>
              <button class="dk-seg-btn ${state.dockerDrawerTab === 'limits' ? 'active' : ''}" data-dk-dtab="limits">${dkIco.settings} <span>${t('docker_tab_limits')}</span></button>
            </div>

            <div class="dk-drawer-body">
              ${state.dockerDrawerTab === 'terminal' ? `
                ${selC.state === 'running' ? `
                  <div class="dk-term-box">
                    <div class="dk-term-header">
                      <div class="mono muted" style="font-size:11px;">${esc(selC.name)} — /bin/sh</div>
                      <div style="display:flex;gap:4px;">
                        <button class="btn sm" id="dk-term-reconnect" style="font-size:10.5px;padding:2px 8px;">${dkIco.refresh} <span>${t('docker_term_restart')}</span></button>
                        <button class="btn sm" id="dk-term-clear" style="font-size:10.5px;padding:2px 8px;">${t('docker_term_clear')}</button>
                      </div>
                    </div>
                    <div id="dk-term-mount" style="flex:1;min-height:0;position:relative;overflow:hidden;"></div>
                  </div>
                ` : `
                  <div style="padding:36px 18px;text-align:center;background:rgba(255,255,255,0.02);border:1px dashed rgba(255,255,255,0.08);border-radius:8px;">
                    <div style="color:#94a3b8;font-size:12.5px;margin-bottom:12px;">${t('docker_term_not_running')}</div>
                    ${renderActBtn('start', selC.id, 'start', 'dk-btn-start', dkIco.play + ' ')}
                  </div>
                `}
              ` : ''}

              ${state.dockerDrawerTab === 'overview' ? `
                <div class="dk-info-grid">
                  <div class="dk-info-card">
                    <div class="dk-info-label">${t('col_status')}</div>
                    <div class="dk-info-val">
                      <span class="dk-status-pill ${selC.state === 'running' ? 'running' : 'stopped'}">
                        <span class="dk-dot"></span>
                        <span>${esc(selC.status || selC.state)}</span>
                      </span>
                    </div>
                  </div>
                  <div class="dk-info-card">
                    <div class="dk-info-label">${t('docker_ip_network')}</div>
                    <div class="dk-info-val mono">${esc(selC.networks || 'bridge')}</div>
                  </div>
                  <div class="dk-info-card" style="grid-column:span 2;">
                    <div class="dk-info-label">${t('docker_ports_label')}</div>
                    <div class="dk-info-val mono" style="font-size:11.5px;">${selC.ports ? esc(selC.ports) : '-'}</div>
                  </div>
                  <div class="dk-info-card" style="grid-column:span 2;">
                    <div class="dk-info-label">${t('docker_volumes_label')}</div>
                    <div class="dk-info-val mono" style="font-size:11px;">${selC.mounts ? esc(selC.mounts) : '-'}</div>
                  </div>
                  <div class="dk-info-card">
                    <div class="dk-info-label">CPU</div>
                    <div class="dk-info-val mono" style="color:#60a5fa;">${selC.cpu ? esc(selC.cpu) : '-'}</div>
                  </div>
                  <div class="dk-info-card">
                    <div class="dk-info-label">RAM</div>
                    <div class="dk-info-val mono" style="color:#a78bfa;">${selC.mem ? esc(selC.mem) : '-'}</div>
                  </div>
                  <div class="dk-info-card" style="grid-column:span 2;">
                    <div class="dk-info-label">${t('col_image')}</div>
                    <div class="dk-info-val mono" style="font-size:11px;color:#94a3b8;">${esc(selC.image)}</div>
                  </div>
                </div>
              ` : ''}

              ${state.dockerDrawerTab === 'logs' ? `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                  <span class="muted" style="font-size:11.5px;">${t('docker_logs')}</span>
                  <div style="display:flex;gap:5px;">
                    <button class="btn sm" id="dk-logs-refresh">${dkIco.refresh} <span>${t('refresh')}</span></button>
                    <button class="btn sm" id="dk-copy-logs">${dkIco.copy} <span>${t('docker_copy_logs')}</span></button>
                  </div>
                </div>
                <pre id="dk-drawer-logs" class="mono" style="flex:1;min-height:360px;max-height:480px;overflow:auto;background:#080a10;padding:10px 12px;border-radius:6px;border:1px solid rgba(255,255,255,0.07);font-size:11px;line-height:1.45;color:#cbd5e1;">${esc(state.dockerLogs?.id === selC.id ? state.dockerLogs.logs : t('docker_loading'))}</pre>
              ` : ''}

              ${state.dockerDrawerTab === 'limits' ? `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                  <div class="dk-stat-card" style="padding:10px 12px;">
                    <div class="dk-stat-title"><span>CPU</span></div>
                    <div class="dk-stat-val" style="font-size:18px;color:#60a5fa;">${selC.cpu ? esc(selC.cpu) : '-'}</div>
                  </div>
                  <div class="dk-stat-card" style="padding:10px 12px;">
                    <div class="dk-stat-title"><span>RAM</span></div>
                    <div class="dk-stat-val" style="font-size:18px;color:#a78bfa;">${selC.mem ? esc(selC.mem) : '-'}</div>
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">
                  <div>
                    <label style="display:block;font-size:11.5px;color:#94a3b8;margin-bottom:4px;">${t('docker_cpu_limit')}</label>
                    <input id="dk-d-cpu" placeholder="1.0" style="width:100%;padding:7px 9px;background:#090c13;border:1px solid rgba(255,255,255,0.08);border-radius:5px;color:#f1f5f9;font-size:12px;" />
                  </div>
                  <div>
                    <label style="display:block;font-size:11.5px;color:#94a3b8;margin-bottom:4px;">${t('docker_mem_limit')}</label>
                    <input id="dk-d-mem" placeholder="512m" style="width:100%;padding:7px 9px;background:#090c13;border:1px solid rgba(255,255,255,0.08);border-radius:5px;color:#f1f5f9;font-size:12px;" />
                  </div>
                  <div>
                    <label style="display:block;font-size:11.5px;color:#94a3b8;margin-bottom:4px;">${t('docker_restart_policy')}</label>
                    <select id="dk-d-rst" style="width:100%;padding:7px 9px;background:#090c13;border:1px solid rgba(255,255,255,0.08);border-radius:5px;color:#f1f5f9;font-size:12px;">
                      <option value="unless-stopped">unless-stopped</option>
                      <option value="always">always</option>
                      <option value="on-failure">on-failure</option>
                      <option value="no">no</option>
                    </select>
                  </div>
                  <button class="btn primary" id="dk-d-save" style="margin-top:6px;display:flex;align-items:center;justify-content:center;gap:6px;">${dkIco.save} <span>${t('docker_save_limits')}</span></button>
                </div>
              ` : ''}
            </div>
        </div>
        ` : ''}
      </div>
    ` : ''}

    ${state.dockerSubTab === 'images' ? `
      <div class="dk-table-wrap">
        <table class="tbl">
          <thead><tr><th>Repository</th><th>Tag</th><th>ID</th><th>Size</th><th style="text-align:right;">${t('col_actions')}</th></tr></thead>
          <tbody>
            ${images.map((img) => `
              <tr>
                <td><span class="mono" style="font-weight:600;color:#f8fafc;">${esc(img.repo)}</span></td>
                <td><span class="dk-port-pill">${esc(img.tag)}</span></td>
                <td><span class="mono muted" style="font-size:11px;">${esc(img.id)}</span></td>
                <td><span class="mono" style="font-size:12px;">${esc(img.size)}</span></td>
                <td style="text-align:right;">
                  <button class="dk-btn-action dk-btn-stop" data-dk-act="rmi ${esc(img.id)}">${dkIco.trash} <span>${t('delete')}</span></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}

    ${state.dockerSubTab === 'volumes' ? `
      <div class="dk-table-wrap">
        <table class="tbl">
          <thead><tr><th>Volume Name</th><th>Driver</th><th style="text-align:right;">${t('col_actions')}</th></tr></thead>
          <tbody>
            ${volumes.map((vol) => `
              <tr>
                <td><span class="mono" style="font-weight:600;color:#f8fafc;">${esc(vol.name)}</span></td>
                <td><span class="dk-port-pill">${esc(vol.driver)}</span></td>
                <td style="text-align:right;">
                  <button class="dk-btn-action dk-btn-stop" data-dk-act="volume rm ${esc(vol.name)}">${dkIco.trash} <span>${t('delete')}</span></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}

    ${state.dockerSubTab === 'networks' ? `
      <div class="dk-table-wrap">
        <table class="tbl">
          <thead><tr><th>Network Name</th><th>ID</th><th>Driver</th><th>Scope</th><th style="text-align:right;">${t('col_actions')}</th></tr></thead>
          <tbody>
            ${networks.map((net) => `
              <tr>
                <td><span class="mono" style="font-weight:600;color:#f8fafc;">${esc(net.name)}</span></td>
                <td><span class="mono muted" style="font-size:11px;">${esc(net.id)}</span></td>
                <td><span class="dk-port-pill">${esc(net.driver)}</span></td>
                <td><span class="mono muted" style="font-size:11px;">${esc(net.scope)}</span></td>
                <td style="text-align:right;">
                  <button class="dk-btn-action dk-btn-stop" data-dk-act="network rm ${esc(net.id)}">${dkIco.trash} <span>${t('delete')}</span></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}
  `;

  $('dk-ref').onclick = () => wsSend({ type: 'docker_list', sid });
  const searchInput = $('dk-search');
  if (searchInput) {
    searchInput.oninput = () => {
      state.dockerFilter = searchInput.value;
      clearTimeout(state.dkSearchTimer);
      state.dkSearchTimer = setTimeout(() => {
        renderDockerTab(sid);
        const newInput = $('dk-search');
        if (newInput) {
          newInput.focus();
          newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
        }
      }, 100);
    };
  }
  if ($('dk-search-clear')) {
    $('dk-search-clear').onclick = () => {
      state.dockerFilter = '';
      renderDockerTab(sid);
    };
  }
  view.querySelectorAll('[data-dk-sub]').forEach((b) => {
    b.onclick = () => { state.dockerSubTab = b.dataset.dkSub; renderDockerTab(sid); };
  });
  view.querySelectorAll('[data-dk-fstate]').forEach((b) => {
    b.onclick = () => { state.dockerStateFilter = b.dataset.dkFstate; renderDockerTab(sid); };
  });
  view.querySelectorAll('[data-dk-row]').forEach((tr) => {
    tr.onclick = (e) => {
      if (e.target.closest('button')) return;
      state.selectedDockerId = tr.dataset.dkRow;
      renderDockerTab(sid);
    };
  });
  if ($('dk-close-drawer')) {
    $('dk-close-drawer').onclick = () => {
      closeDockerDrawerTerm();
      state.selectedDockerId = null;
      renderDockerTab(sid);
    };
  }
  view.querySelectorAll('[data-dk-dtab]').forEach((b) => {
    b.onclick = () => {
      state.dockerDrawerTab = b.dataset.dkDtab;
      renderDockerTab(sid);
    };
  });
  view.querySelectorAll('[data-dk-term]').forEach((b) => {
    b.onclick = () => {
      state.selectedDockerId = b.dataset.dkTerm;
      state.dockerDrawerTab = 'terminal';
      renderDockerTab(sid);
    };
  });
  view.querySelectorAll('[data-dk-logs]').forEach((b) => {
    b.onclick = () => {
      state.selectedDockerId = b.dataset.dkLogs;
      state.dockerDrawerTab = 'logs';
      renderDockerTab(sid);
      wsSend({ type: 'docker_logs', sid, id: b.dataset.dkLogs });
    };
  });
  if ($('dk-logs-refresh') && selC) {
    $('dk-logs-refresh').onclick = () => {
      wsSend({ type: 'docker_logs', sid, id: selC.id });
    };
  }
  if ($('dk-copy-logs') && state.dockerLogs?.logs) {
    $('dk-copy-logs').onclick = () => {
      navigator.clipboard.writeText(state.dockerLogs.logs).then(() => toast(t('docker_logs_copied'), 'ok')).catch(() => {});
    };
  }
  if ($('dk-d-save') && selC) {
    $('dk-d-save').onclick = () => {
      wsSend({
        type: 'docker_update',
        sid,
        id: selC.id,
        cpus: $('dk-d-cpu').value.trim(),
        memory: $('dk-d-mem').value.trim(),
        restart: $('dk-d-rst').value,
      });
    };
  }
  view.querySelectorAll('[data-dk-act]').forEach((b) => {
    b.onclick = () => {
      if (state.dockerBusy) return;
      const parts = (b.dataset.dkAct || '').trim().split(' ');
      const act = parts[0];
      const cid = parts[1];
      state.dockerBusy = { id: cid, act };
      renderDockerTab(sid);
      wsSend({ type: 'docker_act', sid, args: b.dataset.dkAct });
      clearTimeout(state.dockerBusyTimer);
      state.dockerBusyTimer = setTimeout(() => {
        if (state.dockerBusy) {
          state.dockerBusy = null;
          renderDockerTab(sid);
        }
      }, 15000);
    };
  });

  if (selC && state.dockerDrawerTab === 'terminal' && selC.state === 'running') {
    const mount = $('dk-term-mount');
    if (mount) {
      attachDockerDrawerTerm(sid, selC.id, selC.name, mount);
      if ($('dk-term-clear') && state.dockerDrawerTerm) {
        $('dk-term-clear').onclick = () => state.dockerDrawerTerm.xterm?.clear();
      }
      if ($('dk-term-reconnect')) {
        $('dk-term-reconnect').onclick = () => {
          closeDockerDrawerTerm();
          renderDockerTab(sid);
        };
      }
    }
  } else if (state.dockerDrawerTerm && (!selC || state.dockerDrawerTab !== 'terminal')) {
    closeDockerDrawerTerm();
  }
}
window.dockerAct = (sid, args) => wsSend({ type: 'docker_act', sid, args });
window.dockerLogs = (sid, id) => wsSend({ type: 'docker_logs', sid, id });

function restoreWorkspace(restoredSessions, restoredTerms) {
  if (!restoredSessions.length && !restoredTerms.length) return;
  for (const rs of restoredSessions) {
    if (!state.sessions.has(rs.sid)) {
      state.sessions.set(rs.sid, {
        name: rs.name,
        root: rs.root || '/',
        sudo: !!rs.sudo,
        shared: !!rs.shared,
        permissions: rs.permissions || null,
        dirs: new Map(),
        expanded: new Set([rs.root || '/']),
      });
    }
    if (rs.sftpReady && (!rs.shared || rs.permissions?.files_read)) {
      wsSend({ type: 'fs_list', sid: rs.sid, dir: rs.root || '/' });
    }
  }
  const savedSid = sessionStorage.getItem('trm_active_sid');
  state.activeSid = (savedSid && state.sessions.has(savedSid)) ? savedSid : (restoredSessions[0]?.sid || null);
  if (state.activeSid) {
    $('status-left').textContent = `SSH: ${state.sessions.get(state.activeSid)?.name}`;
  }
  if (restoredTerms.length) {
    $('term-panel').classList.remove('hidden');
    for (const rt of restoredTerms) {
      if (state.terms.some((t) => t.termId === rt.termId)) continue;
      const reqId = state.nextReqId++;
      const el = document.createElement('div');
      el.className = 'term-slot';
      $('term-containers').appendChild(el);
      const xterm = new Terminal({
        cursorBlink: true,
        cursorStyle: 'bar',
        cursorWidth: 2,
        smoothScrollDuration: 120,
        fastScrollSensitivity: 2,
        scrollSensitivity: 1,
        fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
        fontSize: state.settings.font_size || 14,
        lineHeight: 1.2,
        drawBoldTextInBrightColors: true,
        scrollback: state.settings.scrollback || 5000,
        theme: {
      background: '#181818',
      foreground: '#cccccc',
      cursor: '#ffffff',
      brightBlack: '#444444',
      selectionBackground: 'rgba(55, 148, 255, 0.48)',
      selectionInactiveBackground: 'rgba(55, 148, 255, 0.42)',
    },
      });
      const fit = new FitAddon.FitAddon();
      xterm.loadAddon(fit);
      xterm.open(el);
      fit.fit();
      attachSmoothCursor(xterm, el);
      attachTouchScroll(xterm, el, fit);
      if (rt.scrollback) {
        xterm.write(b64ToBytes(rt.scrollback));
      }
      const inst = {
        reqId,
        termId: rt.termId,
        sid: rt.sid,
        title: uniqueTermTitle(rt.title, reqId),
        xterm,
        fit,
        el,
        pendingConnId: null,
      };
      state.terms.push(inst);
      xterm.onData((data) => sendTermInputWithMods(rt.termId, data));
      xterm.onResize(({ rows, cols }) => wsSend({ type: 'term_resize', termId: rt.termId, rows, cols }));
    }
    const savedTerm = Number(sessionStorage.getItem('trm_active_term'));
    const hasSaved = state.terms.some((t) => t.termId === savedTerm);
    state.activeTermId = hasSaved ? savedTerm : (state.terms[0]?.termId || null);
    closeMobileSidebarIfNeeded();
    renderTermTabs();
    applyLayout();
  }
}

function syncViewportHeight() {
  const appEl = $('app');
  if (!appEl) return;
  const vvH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const tbH = $('titlebar') && !$('titlebar').classList.contains('hidden') ? $('titlebar').offsetHeight : 35;
  const sbH = $('status-bar') && !$('status-bar').classList.contains('hidden') ? $('status-bar').offsetHeight : 22;
  appEl.style.height = `${Math.max(200, Math.floor(vvH - tbH - sbH))}px`;
  if (window.visualViewport && window.visualViewport.offsetTop > 0) {
    window.scrollTo(0, 0);
  }
  syncSidebarBackdrop();
  window.dispatchEvent(new Event('resize'));
}
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', syncViewportHeight);
  window.visualViewport.addEventListener('scroll', () => {
    if (window.visualViewport.offsetTop > 0) window.scrollTo(0, 0);
  });
}
window.addEventListener('orientationchange', () => setTimeout(syncViewportHeight, 120));

function getActiveTermInst() {
  if (state.dockerDrawerTerm && state.dockerDrawerTerm.termId && !state.dockerDrawerTerm.el?.classList.contains('hidden')) {
    const curTab = state.tabs[state.activeTab];
    if (curTab?.type === 'docker') return state.dockerDrawerTerm;
  }
  const curTab = state.tabs[state.activeTab];
  if (curTab?.type === 'term' && curTab.term?.termId) return curTab.term;
  return state.terms.find((t) => t.termId && t.termId === state.activeTermId) || state.terms.find((t) => t.termId) || null;
}

function updateTouchModButtons() {
  const bar = $('term-touch-bar');
  if (!bar) return;
  bar.querySelectorAll('[data-tmod]').forEach((b) => {
    b.classList.toggle('active', !!state.touchMods[b.dataset.tmod]);
  });
}

function applyTouchModsToData(data) {
  if (!data || (!state.touchMods.ctrl && !state.touchMods.alt)) return data;
  let out = data;
  if (state.touchMods.ctrl && out.length === 1) {
    const code = out.toUpperCase().charCodeAt(0);
    if (code >= 64 && code <= 95) {
      out = String.fromCharCode(code - 64);
    } else if (out === ' ') {
      out = '\x00';
    }
  }
  if (state.touchMods.alt) {
    out = '\x1b' + out;
  }
  state.touchMods.ctrl = false;
  state.touchMods.alt = false;
  updateTouchModButtons();
  return out;
}

function sendTermInputWithMods(termId, data) {
  if (!termId) return;
  wsSend({ type: 'term_input', termId, data: applyTouchModsToData(data) });
}

(() => {
  const bar = $('term-touch-bar');
  if (!bar) return;
  const keyMap = {
    ESC: '\x1b',
    TAB: '\t',
    CTRL_C: '\x03',
    UP: '\x1b[A',
    DOWN: '\x1b[B',
    RIGHT: '\x1b[C',
    LEFT: '\x1b[D',
    HOME: '\x1b[H',
    END: '\x1b[F',
    PGUP: '\x1b[5~',
    PGDN: '\x1b[6~',
  };
  bar.querySelectorAll('.ttb-key').forEach((btn) => {
    const handlePress = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const mod = btn.dataset.tmod;
      if (mod) {
        state.touchMods[mod] = !state.touchMods[mod];
        updateTouchModButtons();
        return;
      }
      const inst = getActiveTermInst();
      const act = btn.dataset.tact;
      if (act === 'kbd') {
        inst?.xterm?.focus();
        return;
      }
      if (act === 'paste') {
        if (!inst?.termId) return;
        let text = '';
        try {
          text = await navigator.clipboard.readText();
        } catch {
          text = prompt(getLang() === 'tr' ? 'Terminale yapıştırılacak metin:' : 'Paste text to terminal:') || '';
        }
        if (text) wsSend({ type: 'term_input', termId: inst.termId, data: text });
        return;
      }
      if (!inst?.termId) return;
      const k = btn.dataset.tkey;
      const seq = k ? keyMap[k] : btn.dataset.tseq;
      if (seq) {
        sendTermInputWithMods(inst.termId, seq);
      }
    };
    btn.addEventListener('pointerdown', handlePress);
  });
})();

function copyTextFallback(text) {
  if (!text) return Promise.resolve(false);
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch {}
      ta.remove();
      return ok;
    });
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch {}
  ta.remove();
  return Promise.resolve(ok);
}

(() => {
  const selBar = $('term-sel-bar');
  if (!selBar) return;
  const copyBtn = $('term-sel-copy');
  const allBtn = $('term-sel-all');
  const clearBtn = $('term-sel-clear');
  if (copyBtn) copyBtn.textContent = getLang() === 'tr' ? 'Kopyala' : 'Copy';
  if (allBtn) allBtn.textContent = getLang() === 'tr' ? 'Tümü' : 'All';
  if (clearBtn) clearBtn.textContent = getLang() === 'tr' ? 'Temizle' : 'Clear';

  copyBtn?.addEventListener('pointerdown', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const inst = getActiveTermInst();
    const txt = inst?.xterm?.getSelection() || '';
    if (!txt) return;
    const ok = await copyTextFallback(txt);
    toast(ok ? (getLang() === 'tr' ? 'Panoya kopyalandı' : 'Copied to clipboard') : (getLang() === 'tr' ? 'Kopyalanamadı' : 'Copy failed'), ok ? 'ok' : 'err');
    inst?.xterm?.clearSelection();
    selBar.classList.add('hidden');
  });
  allBtn?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const inst = getActiveTermInst();
    inst?.xterm?.selectAll();
  });
  clearBtn?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const inst = getActiveTermInst();
    inst?.xterm?.clearSelection();
    selBar.classList.add('hidden');
  });
})();

function attachTouchScroll(xterm, el, fit = null) {
  let lastY = null;
  let startX = 0;
  let startY = 0;
  let curX = 0;
  let curY = 0;
  let acc = 0;
  let vel = 0;
  let lastTs = 0;
  let inertiaId = 0;
  let pinchDist0 = 0;
  let pinchFont0 = 14;
  let longPressTimer = 0;
  let selecting = false;
  let hasMovedForScroll = false;
  let anchorCell = null;
  let suppressMouseUntil = 0;

  const stopInertia = () => {
    if (inertiaId) {
      cancelAnimationFrame(inertiaId);
      inertiaId = 0;
    }
  };

  const clearLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = 0;
    }
  };

  const getLineH = () => {
    const screen = el.querySelector('.xterm-screen');
    if (screen && xterm.rows) {
      return Math.max(12, screen.clientHeight / xterm.rows);
    }
    return 18;
  };

  const coordsToCell = (clientX, clientY) => {
    const screen = el.querySelector('.xterm-screen') || el;
    const rect = screen.getBoundingClientRect();
    const cols = xterm.cols || 80;
    const rows = xterm.rows || 24;
    const cellW = Math.max(1, rect.width / cols);
    const cellH = Math.max(1, rect.height / rows);
    const col = Math.max(0, Math.min(cols - 1, Math.floor((clientX - rect.left) / cellW)));
    const vRow = Math.max(0, Math.min(rows - 1, Math.floor((clientY - rect.top) / cellH)));
    const row = (xterm.buffer?.active?.viewportY || 0) + vRow;
    return { col, row };
  };

  const selectWordAt = (cell) => {
    const line = xterm.buffer?.active?.getLine(cell.row)?.translateToString(true) || '';
    if (!line) {
      xterm.select(0, cell.row, Math.max(1, xterm.cols || 80));
      return;
    }
    const clampCol = Math.min(cell.col, Math.max(0, line.length - 1));
    const isWordChar = (ch) => ch && /[^\s"'`<>()[\]{};,]/.test(ch);
    let s = clampCol;
    let e = clampCol;
    if (isWordChar(line[clampCol])) {
      while (s > 0 && isWordChar(line[s - 1])) s--;
      while (e + 1 < line.length && isWordChar(line[e + 1])) e++;
      xterm.select(s, cell.row, Math.max(1, e - s + 1));
    } else {
      const trimmedLen = line.trimEnd().length;
      if (trimmedLen > 0) {
        xterm.select(0, cell.row, trimmedLen);
      } else {
        xterm.select(cell.col, cell.row, 1);
      }
    }
  };

  const updateRangeSelection = (a, b) => {
    let start = a;
    let end = b;
    if (b.row < a.row || (b.row === a.row && b.col < a.col)) {
      start = b;
      end = a;
    }
    const cols = xterm.cols || 80;
    const len = (end.row - start.row) * cols + (end.col - start.col) + 1;
    xterm.select(start.col, start.row, Math.max(1, len));
  };

  const syncSelBar = () => {
    const selBar = $('term-sel-bar');
    if (!selBar) return;
    if (xterm.hasSelection()) {
      const copyBtn = $('term-sel-copy');
      const allBtn = $('term-sel-all');
      const clearBtn = $('term-sel-clear');
      if (copyBtn) copyBtn.textContent = getLang() === 'tr' ? 'Kopyala' : 'Copy';
      if (allBtn) allBtn.textContent = getLang() === 'tr' ? 'Tümü' : 'All';
      if (clearBtn) clearBtn.textContent = getLang() === 'tr' ? 'Temizle' : 'Clear';
      selBar.classList.remove('hidden');
    } else {
      selBar.classList.add('hidden');
    }
  };
  xterm.onSelectionChange(syncSelBar);

  const blockSyntheticMouse = (e) => {
    if (selecting || performance.now() < suppressMouseUntil) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
    }
  };
  el.addEventListener('mousedown', blockSyntheticMouse, true);
  el.addEventListener('mouseup', blockSyntheticMouse, true);
  el.addEventListener('click', blockSyntheticMouse, true);

  const scrollByLines = (lines) => {
    if (!lines) return;
    if (xterm.buffer?.active?.type === 'alternate') {
      const inst = state.terms.find((t) => t.xterm === xterm);
      if (inst?.termId) {
        const seq = lines > 0 ? '\x1b[B' : '\x1b[A';
        const count = Math.min(8, Math.abs(lines));
        wsSend({ type: 'term_input', termId: inst.termId, data: seq.repeat(count) });
      }
    } else {
      xterm.scrollLines(lines);
    }
  };

  el.addEventListener('contextmenu', (e) => {
    if (window.matchMedia?.('(pointer: coarse)').matches || isMobileOrTablet() || selecting || performance.now() < suppressMouseUntil) {
      e.preventDefault();
    }
  });

  el.addEventListener('touchstart', (e) => {
    stopInertia();
    clearLongPress();
    if (e.touches.length === 1) {
      const t0 = e.touches[0];
      startX = t0.clientX;
      startY = t0.clientY;
      curX = t0.clientX;
      curY = t0.clientY;
      lastY = t0.clientY;
      acc = 0;
      vel = 0;
      lastTs = performance.now();
      selecting = false;
      hasMovedForScroll = false;
      longPressTimer = setTimeout(() => {
        if (hasMovedForScroll) return;
        selecting = true;
        suppressMouseUntil = performance.now() + 2000;
        anchorCell = coordsToCell(startX, startY);
        const nowCell = coordsToCell(curX, curY);
        if (nowCell.row !== anchorCell.row || Math.abs(nowCell.col - anchorCell.col) > 1) {
          updateRangeSelection(anchorCell, nowCell);
        } else {
          selectWordAt(anchorCell);
        }
        syncSelBar();
        try { navigator.vibrate?.(25); } catch {}
      }, 340);
    } else if (e.touches.length === 2) {
      lastY = null;
      selecting = false;
      hasMovedForScroll = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist0 = Math.hypot(dx, dy);
      pinchFont0 = xterm.options.fontSize || 14;
    } else {
      lastY = null;
      selecting = false;
    }
  }, { passive: true });

  el.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && pinchDist0 > 20) {
      clearLongPress();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const nextFs = Math.max(9, Math.min(24, Math.round(pinchFont0 * (dist / pinchDist0))));
      if (xterm.options.fontSize !== nextFs) {
        xterm.options.fontSize = nextFs;
        const inst = state.terms.find((t) => t.xterm === xterm);
        (fit || inst?.fit)?.fit();
      }
      if (e.cancelable) e.preventDefault();
      return;
    }
    if (e.touches.length !== 1) return;
    const t0 = e.touches[0];
    curX = t0.clientX;
    curY = t0.clientY;
    if (selecting && anchorCell) {
      suppressMouseUntil = performance.now() + 2000;
      const screen = el.querySelector('.xterm-screen') || el;
      const rect = screen.getBoundingClientRect();
      if (t0.clientY < rect.top + 18) xterm.scrollLines(-1);
      else if (t0.clientY > rect.bottom - 18) xterm.scrollLines(1);
      const curCell = coordsToCell(t0.clientX, t0.clientY);
      updateRangeSelection(anchorCell, curCell);
      syncSelBar();
      if (e.cancelable) e.preventDefault();
      return;
    }
    const moveDist = Math.hypot(t0.clientX - startX, t0.clientY - startY);
    if (moveDist > 16) {
      hasMovedForScroll = true;
      clearLongPress();
    }
    if (!hasMovedForScroll) {
      if (e.cancelable) e.preventDefault();
      return;
    }
    if (lastY === null) return;
    const now = performance.now();
    const y = t0.clientY;
    const dy = lastY - y;
    const dt = Math.max(8, now - lastTs);
    vel = 0.7 * (dy / dt) + 0.3 * vel;
    lastY = y;
    lastTs = now;
    acc += dy;
    const lineH = getLineH();
    const lines = Math.trunc(acc / lineH);
    if (lines !== 0) {
      scrollByLines(lines);
      acc -= lines * lineH;
    }
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  const onTouchEnd = (e) => {
    clearLongPress();
    if (selecting) {
      suppressMouseUntil = performance.now() + 800;
      selecting = false;
      anchorCell = null;
      lastY = null;
      acc = 0;
      syncSelBar();
      if (e && e.cancelable) e.preventDefault();
      return;
    }
    if (hasMovedForScroll && lastY !== null && Math.abs(vel) > 0.25 && xterm.buffer?.active?.type !== 'alternate') {
      let curVel = vel * 16;
      const lineH = getLineH();
      let rem = 0;
      const step = () => {
        curVel *= 0.91;
        if (Math.abs(curVel) < 0.6) {
          inertiaId = 0;
          return;
        }
        rem += curVel;
        const lines = Math.trunc(rem / lineH);
        if (lines !== 0) {
          xterm.scrollLines(lines);
          rem -= lines * lineH;
        }
        inertiaId = requestAnimationFrame(step);
      };
      inertiaId = requestAnimationFrame(step);
    }
    lastY = null;
    acc = 0;
    pinchDist0 = 0;
  };
  el.addEventListener('touchend', onTouchEnd, { passive: false });
  el.addEventListener('touchcancel', () => { clearLongPress(); stopInertia(); selecting = false; anchorCell = null; lastY = null; acc = 0; pinchDist0 = 0; }, { passive: true });
}

function attachSmoothCursor(xterm, el) {
  const screen = el.querySelector('.xterm-screen');
  if (!screen) return;
  const cursor = document.createElement('div');
  cursor.className = 'smooth-term-cursor';
  screen.appendChild(cursor);
  const update = () => {
    const buf = xterm.buffer.active;
    const cellW = screen.clientWidth / (xterm.cols || 80);
    const cellH = screen.clientHeight / (xterm.rows || 24);
    const x = buf.cursorX * cellW;
    const h = Math.max(12, Math.round(cellH * 0.78));
    const y = buf.cursorY * cellH + Math.round((cellH - h) / 2);
    cursor.style.height = `${h}px`;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    cursor.classList.add('typing');
    clearTimeout(cursor._t);
    cursor._t = setTimeout(() => cursor.classList.remove('typing'), 400);
  };
  xterm.onCursorMove(update);
  xterm.onWriteParsed(update);
  xterm.onResize(update);
  setTimeout(update, 50);

  xterm.attachCustomKeyEventHandler((e) => {
    if (e.type === 'keydown' && e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.code === 'KeyC')) {
      e.preventDefault();
      e.stopPropagation();
      if (xterm.hasSelection()) {
        navigator.clipboard.writeText(xterm.getSelection()).catch(() => {});
      }
      return false;
    }
    return true;
  });
}

function openTerminal(sid, pendingConnId = null, dockerOpts = null) {
  $('term-panel').classList.remove('hidden');
  const reqId = state.nextReqId++;
  const el = document.createElement('div');
  el.className = 'term-slot';
  $('term-containers').appendChild(el);

  const xterm = new Terminal({
    cursorBlink: true,
    cursorStyle: 'bar',
    cursorWidth: 2,
    smoothScrollDuration: 120,
    fastScrollSensitivity: 2,
    scrollSensitivity: 1,
    fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
    fontSize: state.settings.font_size || 14,
    lineHeight: 1.2,
    drawBoldTextInBrightColors: true,
    scrollback: state.settings.scrollback || 5000,
    theme: {
      background: '#181818',
      foreground: '#cccccc',
      cursor: '#ffffff',
      brightBlack: '#444444',
      selectionBackground: 'rgba(55, 148, 255, 0.48)',
      selectionInactiveBackground: 'rgba(55, 148, 255, 0.42)',
    },
  });
  const fit = new FitAddon.FitAddon();
  xterm.loadAddon(fit);
  xterm.open(el);
  fit.fit();
  attachSmoothCursor(xterm, el);
  attachTouchScroll(xterm, el);

  const baseName = dockerOpts ? dockerOpts.name : (state.sessions.get(sid)?.name || t('conn_connecting'));
  const inst = { reqId, termId: null, sid, title: uniqueTermTitle(baseName, reqId), xterm, fit, el, pendingConnId, pane: 'term' };
  state.terms.push(inst);
  if (!pendingConnId) state.activeTermId = reqId;
  renderTermTabs();
  applyLayout();

  xterm.onData((data) => { if (inst.termId) sendTermInputWithMods(inst.termId, data); });
  xterm.onResize(({ rows, cols }) => { if (inst.termId) wsSend({ type: 'term_resize', termId: inst.termId, rows, cols }); });
  wsSend({
    type: 'term_open',
    reqId,
    sid,
    rows: xterm.rows,
    cols: xterm.cols,
    ...(dockerOpts ? { dockerId: dockerOpts.id, dockerName: dockerOpts.name } : {}),
  });
}

function renderTermTabs() {
  const bar = $('term-tabs');
  bar.innerHTML = '';

  state.conns.forEach((c, idx) => {
    const active = state.activeConnId === c.id;
    c.el.classList.toggle('hidden', !active);
    const el = document.createElement('div');
    el.className = `term-tab ${active ? 'active' : ''}`;
    el.innerHTML = `<span class="dot" style="background:${c.error ? 'var(--error)' : c.done ? 'var(--success)' : 'var(--accent)'}"></span><span>${esc(c.name)}</span><span class="tab-close">${ICO.close}</span>`;
    el.onclick = (e) => {
      if (e.target.closest('.tab-close')) {
        c.el.remove();
        state.conns.splice(idx, 1);
        if (state.activeConnId === c.id) state.activeConnId = null;
        return renderTermTabs();
      }
      state.activeConnId = c.id;
      state.activeTermId = null;
      renderTermTabs();
    };
    bar.appendChild(el);
  });

function moveTermToPane(term, targetPane) {
  if (!term || term.pane === targetPane) return;
  term.pane = targetPane;
  if (targetPane === 'editor') {
    $('term-editor-host').appendChild(term.el);
    let idx = state.tabs.findIndex((x) => x.type === 'term' && x.term === term);
    if (idx === -1) {
      state.tabs.push({ type: 'term', title: term.title, term });
      idx = state.tabs.length - 1;
    }
    state.activeTab = idx;
  } else {
    const idx = state.tabs.findIndex((x) => x.type === 'term' && x.term === term);
    if (idx !== -1) {
      state.tabs.splice(idx, 1);
      state.activeTab = Math.max(0, Math.min(state.activeTab, state.tabs.length - 1));
    }
    $('term-containers').appendChild(term.el);
    $('term-panel').classList.remove('hidden');
    state.activeConnId = null;
    state.activeTermId = term.termId || term.reqId;
  }
  renderTabs();
  renderTermTabs();
  applyLayout();
}

  state.terms.forEach((t, idx) => {
    if (t.pane === 'editor' || t.isDockerDrawer) return;
    const waitingAnim = !!(t.pendingConnId && state.conns.some((c) => c.id === t.pendingConnId));
    if (waitingAnim) {
      t.el.classList.add('hidden');
      return;
    }
    const active = !state.activeConnId && ((t.termId && t.termId === state.activeTermId) || (!t.termId && t.reqId === state.activeTermId));
    t.el.classList.toggle('hidden', !active);
    if (active) {
      if (t.termId) sessionStorage.setItem('trm_active_term', String(t.termId));
      setTimeout(() => t.fit.fit(), 10);
    }

    const el = document.createElement('div');
    el.className = `term-tab ${active ? 'active' : ''}`;
    el.innerHTML = `${ICO.term}<span>${esc(t.title)}</span><span class="tab-close" data-act="close">${ICO.close}</span>`;
    el.onclick = (e) => {
      if (e.target.closest('[data-act="close"]') || e.target.closest('.tab-close')) {
        if (t.termId) wsSend({ type: 'term_close', termId: t.termId });
        t.xterm.dispose();
        t.el.remove();
        state.terms.splice(idx, 1);
        const next = state.terms.find((x) => x.pane !== 'editor');
        state.activeTermId = next ? (next.termId || next.reqId) : null;
        return renderTermTabs();
      }
      state.activeConnId = null;
      state.activeTermId = t.termId || t.reqId;
      renderTermTabs();
    };
    makeDraggableTab(el, idx, state.terms, () => renderTermTabs());
    bar.appendChild(el);
  });
}

let resizeRaf = 0;
window.addEventListener('resize', () => {
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    for (const t of state.terms) if (!t.el.classList.contains('hidden')) t.fit.fit();
  });
});

$('btn-new-term').onclick = () => {
  if (!state.activeSid) return toast(t('need_connect'), 'warn');
  openTerminal(state.activeSid);
};
$('btn-toggle-term-max').onclick = () => {
  $('term-panel').classList.toggle('max');
  state.layout.termRatio = $('term-panel').classList.contains('max') ? 70 : 35;
  applyLayout();
};

function saveLayout() {
  localStorage.setItem('trm_layout', JSON.stringify(state.layout));
}

function applyLayout() {
  const main = $('main-area');
  const hasVnc = !$('vnc-pane').classList.contains('hidden');
  const hasTerm = !$('term-panel').classList.contains('hidden');
  const hideEmptyEditor = state.tabs.length === 0 && (hasVnc || hasTerm);
  $('editor-pane').classList.toggle('hidden', hideEmptyEditor);
  const hasEditor = !hideEmptyEditor;
  const L = state.layout;
  const r = Math.max(15, Math.min(75, Number(L.termRatio) || 35));
  const topR = 100 - r;
  if (!Array.isArray(L.colWidths) || L.colWidths.length !== 2) L.colWidths = [50, 50];
  if (!Array.isArray(L.col3Widths) || L.col3Widths.length !== 3) L.col3Widths = [33, 34, 33];
  const c2 = Math.max(15, Math.min(85, Number(L.colWidths[0]) || 50));
  const col2Str = `${c2}% ${100 - c2}%`;
  const col3Str = `${L.col3Widths[0]}% ${L.col3Widths[1]}% ${L.col3Widths[2]}%`;

  let areas = '"editor"';
  let colArr = [100];
  let cols = '1fr';
  let rows = '1fr';

  const vis = L.order.filter((p) => (p === 'editor' && hasEditor) || (p === 'vnc' && hasVnc) || (p === 'term' && hasTerm));
  const isNarrowMobile = window.innerWidth <= 640;
  if (!vis.length) {
    areas = '"editor"';
  } else if (isNarrowMobile) {
    areas = vis.map((p) => `"${p}"`).join(' ');
    cols = '1fr';
    colArr = [100];
    if (vis.length === 1) rows = '1fr';
    else if (vis.length === 2) rows = `${topR}% ${r}%`;
    else rows = `${Math.round(topR / 2)}% ${Math.round(topR / 2)}% ${r}%`;
  } else if (L.mode === 'classic') {
    if (hasEditor && hasVnc && hasTerm) { areas = '"editor vnc" "term term"'; cols = col2Str; colArr = [c2, 100 - c2]; rows = `${topR}% ${r}%`; }
    else if (hasEditor && hasVnc) { areas = '"editor vnc"'; cols = col2Str; colArr = [c2, 100 - c2]; }
    else if (hasVnc && hasTerm) { areas = '"vnc" "term"'; rows = `${topR}% ${r}%`; }
    else if (hasEditor && hasTerm) { areas = '"editor" "term"'; rows = `${topR}% ${r}%`; }
    else { areas = `"${vis[0]}"`; }
  } else if (L.mode === 'vnc-top') {
    if (hasEditor && hasVnc && hasTerm) { areas = '"vnc vnc" "editor term"'; cols = col2Str; colArr = [c2, 100 - c2]; rows = `${topR}% ${r}%`; }
    else if (hasVnc && hasEditor) { areas = '"vnc" "editor"'; rows = `${topR}% ${r}%`; }
    else if (hasVnc && hasTerm) { areas = '"vnc" "term"'; rows = `${topR}% ${r}%`; }
    else if (hasEditor && hasTerm) { areas = '"editor term"'; cols = col2Str; colArr = [c2, 100 - c2]; }
    else { areas = `"${vis[0]}"`; }
  } else if (L.mode === 'columns') {
    areas = `"${vis.join(' ')}"`;
    if (vis.length === 2) { cols = col2Str; colArr = [c2, 100 - c2]; }
    else if (vis.length === 3) { cols = col3Str; colArr = [...L.col3Widths]; }
  } else if (L.mode === 'editor-top') {
    if (hasEditor && hasVnc && hasTerm) { areas = '"editor editor" "vnc term"'; cols = col2Str; colArr = [c2, 100 - c2]; rows = `${topR}% ${r}%`; }
    else if (hasEditor && hasVnc) { areas = '"editor" "vnc"'; rows = `${topR}% ${r}%`; }
    else if (hasEditor && hasTerm) { areas = '"editor" "term"'; rows = `${topR}% ${r}%`; }
    else if (hasVnc && hasTerm) { areas = '"vnc" "term"'; rows = `${topR}% ${r}%`; }
    else { areas = `"${vis[0]}"`; }
  } else if (L.mode === 'vnc-right') {
    if (hasEditor && hasVnc && hasTerm) { areas = '"editor vnc" "term vnc"'; cols = col2Str; colArr = [c2, 100 - c2]; rows = `${topR}% ${r}%`; }
    else if (hasEditor && hasVnc) { areas = '"editor vnc"'; cols = col2Str; colArr = [c2, 100 - c2]; }
    else if (hasTerm && hasVnc) { areas = '"term vnc"'; cols = col2Str; colArr = [c2, 100 - c2]; }
    else if (hasEditor && hasTerm) { areas = '"editor" "term"'; rows = `${topR}% ${r}%`; }
    else { areas = `"${vis[0]}"`; }
  } else {
    if (L.customMode === 'cols') {
      areas = `"${vis.join(' ')}"`;
      if (vis.length === 2) { cols = col2Str; colArr = [c2, 100 - c2]; }
      else if (vis.length === 3) { cols = col3Str; colArr = [...L.col3Widths]; }
    } else {
      const top = vis.filter((p) => L.zones[p] === 'top');
      const bot = vis.filter((p) => L.zones[p] !== 'top');
      if (!top.length || !bot.length) {
        const one = top.length ? top : bot;
        if (one.length === 1) {
          areas = `"${one[0]}"`;
        } else if (one.length === 2) {
          areas = `"${one[0]}" "${one[1]}"`;
          rows = `${topR}% ${r}%`;
        } else {
          areas = `"${one[0]}" "${one[1]}" "${one[2]}"`;
          rows = '1fr 1fr 1fr';
        }
      } else if (top.length === 1 && bot.length === 1) {
        areas = `"${top[0]}" "${bot[0]}"`;
        cols = '1fr';
        colArr = [100];
        rows = `${topR}% ${r}%`;
      } else {
        const span = top.length === bot.length ? top.length : top.length * bot.length;
        const expand = (arr) => arr.flatMap((p) => Array(span / arr.length).fill(p)).join(' ');
        areas = `"${expand(top)}" "${expand(bot)}"`;
        if (span === 2) { cols = col2Str; colArr = [c2, 100 - c2]; }
        else { cols = Array(span).fill('1fr').join(' '); colArr = Array(span).fill(100 / span); }
        rows = `${topR}% ${r}%`;
      }
    }
  }

  main.style.gridTemplateAreas = areas;
  main.style.gridTemplateColumns = cols;
  main.style.gridTemplateRows = rows;
  renderColResizers(colArr);
  setTimeout(() => state.terms.forEach((t) => { if (!t.el.classList.contains('hidden')) t.fit.fit(); }), 25);
}

function renderColResizers(colArr) {
  const main = $('main-area');
  main.querySelectorAll('.col-resizer').forEach((el) => el.remove());
  if (!colArr || colArr.length < 2) return;
  let cum = 0;
  for (let i = 0; i < colArr.length - 1; i++) {
    cum += colArr[i];
    const bar = document.createElement('div');
    bar.className = 'col-resizer';
    bar.style.left = `${cum}%`;
    bar.title = t('tt_col_resize');
    bar.addEventListener('mousedown', (e) => {
      e.preventDefault();
      bar.classList.add('dragging');
      document.body.style.cursor = 'ew-resize';
      const rect = main.getBoundingClientRect();
      const onMove = (ev) => {
        const pct = Math.max(15, Math.min(85, ((ev.clientX - rect.left) / Math.max(200, rect.width)) * 100));
        if (colArr.length === 2) {
          state.layout.colWidths = [Math.round(pct), Math.round(100 - pct)];
        } else if (colArr.length === 3) {
          const w = state.layout.col3Widths;
          if (i === 0) {
            const max0 = 100 - w[2] - 15;
            const n0 = Math.max(15, Math.min(max0, Math.round(pct)));
            w[1] = Math.max(15, 100 - n0 - w[2]);
            w[0] = 100 - w[1] - w[2];
          } else {
            const min2 = 15;
            const leftSum = Math.max(w[0] + 15, Math.min(85, Math.round(pct)));
            w[1] = leftSum - w[0];
            w[2] = Math.max(min2, 100 - leftSum);
          }
        }
        applyLayout();
      };
      const onUp = () => {
        bar.classList.remove('dragging');
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        saveLayout();
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });
    main.appendChild(bar);
  }
}

function openLayoutModal() {
  const presets = [
    { id: 'classic', label: t('ly_p_classic') },
    { id: 'vnc-top', label: t('ly_p_vnctop') },
    { id: 'columns', label: t('ly_p_cols') },
    { id: 'editor-top', label: t('ly_p_edtop') },
    { id: 'vnc-right', label: t('ly_p_vncright') },
    { id: 'custom', label: t('ly_p_custom') },
  ];
  const names = { editor: t('ly_editor'), vnc: t('ly_vnc'), term: t('ly_term') };
  const render = () => {
    const L = state.layout;
    showModal(`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <h3 style="margin:0;">${t('ly_title')}</h3>
        <button class="icon-btn" id="m-close-x" title="${t('close')}">${ICO.close}</button>
      </div>
      <div class="layout-grid-cards">
        ${presets.map((p) => `<button class="layout-card ${L.mode === p.id ? 'active' : ''}" data-preset="${p.id}">${esc(p.label)}</button>`).join('')}
      </div>
      <div style="border-top:1px solid var(--border);padding-top:10px;margin-top:4px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span class="muted" style="font-size:12px;">${t('ly_custom')}</span>
          <div style="display:flex;gap:4px;">
            <button class="btn sm ${L.customMode === 'rows' ? 'primary' : ''}" id="ly-cm-rows">${t('ly_rows')}</button>
            <button class="btn sm ${L.customMode === 'cols' ? 'primary' : ''}" id="ly-cm-cols">${t('ly_cols')}</button>
          </div>
        </div>
        <div id="ly-zone-list">
        ${L.order.map((p, idx) => `
          <div class="layout-zone-row" draggable="true" data-ly-idx="${idx}" data-ly-pane="${p}">
            <span style="display:flex;align-items:center;gap:8px;"><span class="muted" style="cursor:grab;">⋮⋮</span>${esc(names[p])}</span>
            <div style="display:flex;gap:6px;align-items:center;">
              <button class="btn sm ${L.customMode === 'rows' && L.zones[p] === 'top' ? 'primary' : ''}" data-zone="${p}:top">${t('ly_top')}</button>
              <button class="btn sm ${L.customMode === 'rows' && L.zones[p] === 'bottom' ? 'primary' : ''}" data-zone="${p}:bottom">${t('ly_bot')}</button>
              <button class="btn sm" data-move="${idx}:-1" ${idx === 0 ? 'disabled' : ''}>↑</button>
              <button class="btn sm" data-move="${idx}:1" ${idx === L.order.length - 1 ? 'disabled' : ''}>↓</button>
            </div>
          </div>
        `).join('')}
        </div>
        <label class="field-label">${t('ly_height', { v: `<span id="ly-r-val">${L.termRatio}</span>` })}</label>
        <input id="ly-ratio" type="range" min="15" max="75" value="${L.termRatio}" />
      </div>
      <div class="modal-actions"><button class="btn primary" id="m-ok">${t('ok')}</button></div>
    `);
    $('m-close-x').onclick = closeModal;
    document.querySelectorAll('[data-preset]').forEach((b) => {
      b.onclick = () => { L.mode = b.dataset.preset; saveLayout(); applyLayout(); render(); };
    });
    $('ly-cm-rows').onclick = () => { L.mode = 'custom'; L.customMode = 'rows'; saveLayout(); applyLayout(); render(); };
    $('ly-cm-cols').onclick = () => { L.mode = 'custom'; L.customMode = 'cols'; saveLayout(); applyLayout(); render(); };
    document.querySelectorAll('.layout-zone-row').forEach((row) => {
      row.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', row.dataset.lyIdx);
        row.classList.add('dragging');
      };
      row.ondragend = () => row.classList.remove('dragging');
      row.ondragover = (e) => { e.preventDefault(); row.classList.add('drag-over'); };
      row.ondragleave = () => row.classList.remove('drag-over');
      row.ondrop = (e) => {
        e.preventDefault();
        row.classList.remove('drag-over');
        const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
        const to = parseInt(row.dataset.lyIdx, 10);
        if (!Number.isInteger(from) || from === to) return;
        const [item] = L.order.splice(from, 1);
        L.order.splice(to, 0, item);
        L.mode = 'custom';
        saveLayout(); applyLayout(); render();
      };
    });
    document.querySelectorAll('[data-zone]').forEach((b) => {
      b.onclick = () => {
        const [p, z] = b.dataset.zone.split(':');
        L.mode = 'custom';
        L.customMode = 'rows';
        L.zones[p] = z;
        saveLayout(); applyLayout(); render();
      };
    });
    document.querySelectorAll('[data-move]').forEach((b) => {
      b.onclick = () => {
        const [idx, dir] = b.dataset.move.split(':').map(Number);
        const ni = idx + dir;
        if (ni < 0 || ni >= L.order.length) return;
        const [item] = L.order.splice(idx, 1);
        L.order.splice(ni, 0, item);
        L.mode = 'custom';
        saveLayout(); applyLayout(); render();
      };
    });
    $('ly-ratio').oninput = () => {
      L.termRatio = Number($('ly-ratio').value);
      $('ly-r-val').textContent = L.termRatio;
      saveLayout(); applyLayout();
    };
    $('m-ok').onclick = closeModal;
  };
  render();
}
$('btn-layout').onclick = openLayoutModal;
applyLayout();

(() => {
  const resizer = $('term-resizer');
  const panel = $('term-panel');
  let dragging = false;
  const startDrag = (e) => {
    if (e.cancelable) e.preventDefault();
    dragging = true;
    panel.classList.remove('max');
    resizer.classList.add('dragging');
    document.body.style.cursor = 'ns-resize';
  };
  const moveDrag = (clientY) => {
    if (!dragging) return;
    const rect = $('main-area').getBoundingClientRect();
    const pct = Math.round(((rect.bottom - clientY) / Math.max(200, rect.height)) * 100);
    state.layout.termRatio = Math.max(15, Math.min(82, pct));
    applyLayout();
  };
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    resizer.classList.remove('dragging');
    document.body.style.cursor = '';
    saveLayout();
    applyLayout();
  };
  resizer.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', (e) => moveDrag(e.clientY));
  window.addEventListener('mouseup', endDrag);
  resizer.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('touchmove', (e) => {
    if (!dragging || !e.touches.length) return;
    if (e.cancelable) e.preventDefault();
    moveDrag(e.touches[0].clientY);
  }, { passive: false });
  window.addEventListener('touchend', endDrag);
  window.addEventListener('touchcancel', endDrag);
})();

$('quick-connect-btn').onclick = () => quickConnect($('quick-connect-input').value);
$('quick-connect-input').onkeydown = (e) => { if (e.key === 'Enter') quickConnect($('quick-connect-input').value); };
function startConnect(sid, profile) {
  closeMobileSidebarIfNeeded();
  if (profile?.shared && profile.permissions && !profile.permissions.terminal) {
    toast(t('connecting_toast', { name: profile.name || t('shared_badge') }), 'info');
    wsSend({ type: 'connect', sid, profile });
    return;
  }
  $('term-panel').classList.remove('hidden');
  state.conns = state.conns.filter((c) => {
    if (c.sid === sid) { c.el.remove(); return false; }
    return true;
  });
  const id = state.nextReqId++;
  const wrap = document.createElement('div');
  wrap.className = 'term-slot';
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'center';
  wrap.style.justifyContent = 'center';

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  wrap.appendChild(canvas);

  const actBar = document.createElement('div');
  actBar.style.cssText = 'position:absolute;bottom:22px;display:flex;gap:8px;';
  wrap.appendChild(actBar);
  $('term-containers').appendChild(wrap);

  const conn = {
    id, sid,
    name: profile.name || profile.host,
    color: profile.color || '#5b8def',
    profile,
    started: performance.now(),
    authed: null,
    done: null,
    error: null,
    errorAt: null,
    el: wrap,
    canvas,
    actBar,
  };
  state.conns.push(conn);
  state.activeConnId = id;
  renderTermTabs();
  wsSend({ type: 'connect', sid, profile });
  requestAnimationFrame(() => drawConnAnim(conn));
}

function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function drawConnAnim(c) {
  if (!state.conns.includes(c)) return;
  const canvas = c.canvas;
  const rect = canvas.getBoundingClientRect();
  if (rect.width > 10 && rect.height > 10) {
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    ctx.clearRect(0, 0, W, H);

    const now = performance.now() / 1000;
    const accent = '#0078d4', ok = '#3fb950', bad = '#f85149', hair = '#3c3c3c';
    const cx = W / 2;
    const span = Math.max(70, Math.min(150, (W - 160) / 2));
    const cy = Math.max(60, Math.min(190, H * 0.36));
    const lx = cx - span, rx = cx + span;
    const failed = !!c.error, finished = !!c.done;
    const broke = c.errorAt ? (performance.now() - c.errorAt) / 1000 : 0;
    const doneS = c.done ? (performance.now() - c.done) / 1000 : 0;
    const gap = failed ? Math.min(1, broke * 3) * 16 : 0;
    const x0 = lx + 26, x1 = rx - 26;

    const drawDashed = (from, to, col, lw, scroll) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      let x = from - (scroll % 12);
      ctx.beginPath();
      while (x < to) {
        const a = Math.max(from, x), b = Math.min(to, x + 6);
        if (b > a) { ctx.moveTo(a, cy); ctx.lineTo(b, cy); }
        x += 12;
      }
      ctx.stroke();
    };

    if (failed) {
      drawDashed(x0, cx - gap, 'rgba(248,81,73,0.9)', 2.5, 0);
      drawDashed(cx + gap, x1, hair, 2.5, 0);
    } else if (finished) {
      ctx.strokeStyle = ok; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.stroke();
    } else {
      drawDashed(x0, x1, hair, 2.5, now * 14);
      if (c.authed) {
        const fill = Math.min(1, (performance.now() - c.authed) / 450);
        ctx.strokeStyle = accent; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x0 + (x1 - x0) * fill, cy); ctx.stroke();
      }
      const speed = c.authed ? 0.9 : 0.55;
      for (let k = 0; k < 4; k++) {
        const ph = (now * speed + k * 0.25) % 1;
        const e = ph * ph * (3 - 2 * ph);
        const x = x0 + (x1 - x0) * e;
        const a = Math.max(0, Math.min(1, ph * (1 - ph) * 4));
        for (let tail = 0; tail < 5; tail++) {
          const tx = x - tail * 5;
          if (tx > x0) {
            ctx.fillStyle = `rgba(0,120,212,${a * (1 - tail * 0.2)})`;
            ctx.beginPath(); ctx.arc(tx, cy, 4 - tail * 0.7, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
    }

    if (!failed && !finished) {
      for (let k = 0; k < 3; k++) {
        const ph = (now * 0.7 + k / 3) % 1;
        ctx.strokeStyle = `rgba(0,120,212,${(1 - ph) * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(rx, cy, 24 + ph * 22, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (finished) {
      const t = Math.min(1, doneS);
      ctx.strokeStyle = `rgba(63,185,80,${Math.pow(1 - t, 2)})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(rx, cy, 24 + t * 40, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = `rgba(63,185,80,${Math.pow(1 - t, 2) * 0.6})`;
      ctx.beginPath(); ctx.arc(lx, cy, 24 + t * 30, 0, Math.PI * 2); ctx.stroke();
    }

    const shake = failed ? Math.sin(broke * 30) * (1 - Math.min(1, broke * 2)) * 4 : 0;
    const drawNode = (x, strokeCol) => {
      ctx.fillStyle = '#242424';
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x - 23, cy - 23, 46, 46, 10);
      ctx.fill(); ctx.stroke();
    };
    drawNode(lx + shake, failed ? bad : finished ? ok : hair);
    drawNode(rx - shake, failed ? 'rgba(248,81,73,0.6)' : finished ? ok : c.color);

    ctx.strokeStyle = '#cccccc'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(lx + shake - 7, cy - 5); ctx.lineTo(lx + shake - 1, cy); ctx.lineTo(lx + shake - 7, cy + 5);
    ctx.moveTo(lx + shake + 1, cy + 5); ctx.lineTo(lx + shake + 8, cy + 5); ctx.stroke();

    ctx.strokeStyle = failed ? '#8b949e' : c.color;
    ctx.strokeRect(rx - shake - 9, cy - 8, 18, 7);
    ctx.strokeRect(rx - shake - 9, cy + 1, 18, 7);

    ctx.font = '11.5px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8b949e';
    ctx.fillText(t('conn_browser'), lx, cy + 38);
    ctx.fillStyle = '#cccccc';
    ctx.fillText(c.name, rx, cy + 38);

    if (failed) {
      const t = easeOutBack(Math.min(1, broke * 2.5));
      ctx.fillStyle = bad;
      ctx.beginPath(); ctx.arc(cx, cy, 14 * t, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4;
      const s = 4.5 * t;
      ctx.beginPath(); ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s);
      ctx.moveTo(cx - s, cy + s); ctx.lineTo(cx + s, cy - s); ctx.stroke();
    } else if (finished) {
      const t = Math.min(1, doneS * 3);
      ctx.fillStyle = ok;
      ctx.beginPath(); ctx.arc(cx, cy, 14 * easeOutBack(Math.min(1, t / 0.6)), 0, Math.PI * 2); ctx.fill();
      const tt = Math.max(0, Math.min(1, (t - 0.4) / 0.6));
      if (tt > 0) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.moveTo(cx - 5.5, cy + 0.5);
        if (tt < 0.4) {
          ctx.lineTo(cx - 5.5 + 4 * (tt / 0.4), cy + 0.5 + 4 * (tt / 0.4));
        } else {
          ctx.lineTo(cx - 1.5, cy + 4.5);
          const p2 = (tt - 0.4) / 0.6;
          ctx.lineTo(cx - 1.5 + 7.5 * p2, cy + 4.5 - 8.5 * p2);
        }
        ctx.stroke();
      }
    }

    const dots = '.'.repeat((Math.floor(now * 2.5) % 3) + 1);
    const statusTxt = failed ? t('conn_failed') : finished ? t('conn_connected') : `${t('conn_connecting').replace(/\.+$/, '')}${dots}`;
    ctx.font = '600 13.5px "Segoe UI", sans-serif';
    ctx.fillStyle = failed ? bad : finished ? ok : '#cccccc';
    ctx.fillText(statusTxt, cx, cy + 66);

    if (failed) {
      ctx.font = '12px Consolas, monospace';
      ctx.fillStyle = '#8b949e';
      ctx.fillText(String(c.error).slice(0, 72), cx, cy + 88);
      if (!c.actBar.dataset.failedRendered) {
        c.actBar.dataset.failedRendered = '1';
        c.actBar.innerHTML = `<button class="btn primary sm" id="retry-${c.id}">${t('conn_retry')}</button><button class="btn sm" id="close-${c.id}">${t('close')}</button>`;
        $(`retry-${c.id}`).onclick = () => startConnect(c.sid, c.profile);
        $(`close-${c.id}`).onclick = () => {
          c.el.remove();
          state.conns = state.conns.filter((x) => x.id !== c.id);
          if (state.activeConnId === c.id) state.activeConnId = null;
          renderTermTabs();
        };
      }
    } else if (!finished) {
      const sec = Math.floor((performance.now() - c.started) / 1000);
      ctx.font = '11.5px "Segoe UI", sans-serif';
      ctx.fillStyle = '#8b949e';
      ctx.fillText(`${sec} sn`, cx, cy + 86);
    }

    ctx.restore();
    if ((failed && broke > 1.2) || (finished && doneS > 1.2)) return;
  }
  requestAnimationFrame(() => drawConnAnim(c));
}

function quickConnect(val) {
  const txt = (val || '').trim();
  if (!txt) return;
  const [user, rest] = txt.includes('@') ? txt.split('@') : ['root', txt];
  const [host, portStr] = rest.includes(':') ? rest.split(':') : [rest, '22'];
  startConnect('qc_' + Date.now(), { name: `${user}@${host}`, host, port: Number(portStr) || 22, user, auth: 'password' });
}

$('welcome-add-host').onclick = () => openHostModal();

const HOST_COLORS = ['#5b8def', '#3ecf8e', '#b682f0', '#f5b942', '#f0616d', '#4cc9e0', '#ef7fb4', '#8b91a7'];

function openHostModal(h = null) {
  const isNew = !h;
  const draft = {
    id: h?.id || Math.random().toString(16).slice(2, 14),
    name: h?.name || '',
    host: h?.host || '',
    port: h?.port || 22,
    user: h?.user || '',
    auth: h?.auth || 'password',
    key_path: h?.key_path || '',
    color: /^#[0-9a-fA-F]{6}$/.test(String(h?.color || '')) ? String(h.color) : HOST_COLORS[0],
    group: h?.group || '',
    tags: Array.isArray(h?.tags) ? h.tags.join(', ') : (h?.tags || ''),
    jump_id: h?.jump_id || '',
    startup_snippet: h?.startup_snippet || '',
    startup: h?.startup || '',
    keepalive: h?.keepalive || 30,
    note: h?.note || '',
    env: h?.env || '',
    options: h?.options || '',
    proxy_mode: h?.proxy_mode === 'socks5' ? 'socks5' : 'none',
    proxy_host: h?.proxy_host || '',
    proxy_port: h?.proxy_port || 1080,
    proxy_user: h?.proxy_user || '',
    proxy_pass: h?.proxy_pass || '',
    had_pw: !!h?.had_pw,
    had_key: !!h?.had_key,
  };
  let curTab = 0;
  let pwVal = '';
  let passVal = '';
  let keyText = '';

  const jumpOpts = state.hosts
    .filter((x) => x.id !== draft.id)
    .map((x) => `<option value="${esc(x.id)}" ${draft.jump_id === x.id ? 'selected' : ''}>${esc(x.name || x.host)}</option>`)
    .join('');
  const snipOpts = state.snippets
    .map((x) => `<option value="${esc(x.id)}" ${draft.startup_snippet === x.id ? 'selected' : ''}>${esc(x.name)}</option>`)
    .join('');
  const catOpts = Array.from(new Set(state.hosts.map((x) => (x.group || '').trim()).filter(Boolean)))
    .sort()
    .map((g) => `<option value="${esc(g)}"></option>`)
    .join('');

  showModal(`
    <div class="host-dlg-head">
      <div id="hd-tile" class="host-dlg-tile" style="background:${draft.color}28;border:1px solid ${draft.color}70;color:${draft.color};">
        ${ICO.server.replace('width="15" height="15"', 'width="22" height="22"').replace('stroke="#3794ff"', 'stroke="currentColor"')}
      </div>
      <div>
        <h3 id="hd-title" style="margin:0;">${esc(draft.name || (isNew ? t('hd_new') : t('tt_edit')))}</h3>
        <div id="hd-sub" class="muted mono" style="font-size:12px;">${draft.host ? esc((draft.user ? draft.user + '@' : '') + draft.host) : t('hd_new_sub')}</div>
      </div>
    </div>

    <div class="seg-tabs">
      <button class="seg-tab active" data-t="0">${t('hd_tab_conn')}</button>
      <button class="seg-tab" data-t="1">${t('hd_tab_adv')}</button>
      <button class="seg-tab" data-t="2">${t('hd_tab_env')}</button>
    </div>

    <div class="dlg-scroll">
      <div id="hd-pane-0">
        <div class="row2" style="grid-template-columns: 1fr 1fr;">
          <div><label class="field-label">${t('hd_name')}</label><input id="h-name" value="${esc(draft.name)}" placeholder="${t('hd_name_ph')}" /></div>
          <div><label class="field-label">${t('hd_group')}</label><input id="h-group" list="h-group-list" value="${esc(draft.group)}" placeholder="${t('hd_group_ph')}" /><datalist id="h-group-list">${catOpts}</datalist></div>
        </div>
        <div class="row2" style="grid-template-columns: 1fr 90px;">
          <div><label class="field-label">${t('hd_host')}</label><input id="h-host" value="${esc(draft.host)}" placeholder="${t('hd_host_ph')}" /></div>
          <div><label class="field-label">${t('hd_port')}</label><input id="h-port" type="number" value="${draft.port}" /></div>
        </div>
        <label class="field-label">${t('hd_user')}</label>
        <input id="h-user" value="${esc(draft.user)}" placeholder="root" />

        <label class="field-label">${t('hd_auth')}</label>
        <div class="seg-tabs" id="h-auth-tabs" style="margin-bottom:8px;">
          <button class="seg-tab ${draft.auth === 'password' ? 'active' : ''}" data-a="password">${t('hd_auth_pw')}</button>
          <button class="seg-tab ${draft.auth === 'key' ? 'active' : ''}" data-a="key">${t('hd_auth_key')}</button>
          <button class="seg-tab ${draft.auth === 'agent' ? 'active' : ''}" data-a="agent">${t('hd_auth_agent')}</button>
        </div>

        <div id="auth-pane-password" class="${draft.auth === 'password' ? '' : 'hidden'}">
          <label class="field-label">${t('hd_pw')}</label>
          <div style="display:flex;gap:6px;align-items:center;">
            <input id="h-pw" type="password" value="" placeholder="${draft.had_pw ? '••••••••' : t('hd_pw_ph')}" style="flex:1;" />
            <button type="button" class="icon-btn" id="h-pw-eye" title="${t('hd_pw_toggle')}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <div id="auth-pane-key" class="${draft.auth === 'key' ? '' : 'hidden'}">
          <label class="field-label">${t('hd_key_lbl')}</label>
          <div style="display:flex;gap:6px;margin-bottom:6px;">
            <input id="h-key-file" type="file" style="padding:4px;" />
          </div>
          <textarea id="h-key-pem" rows="3" class="mono" placeholder="${draft.had_key ? t('hd_key_saved') : '-----BEGIN OPENSSH PRIVATE KEY-----'}"></textarea>
          <label class="field-label">${t('hd_passphrase')}</label>
          <input id="h-passphrase" type="password" value="" placeholder="${h?.had_passphrase ? '••••••••' : t('hd_passphrase_ph')}" />
        </div>

        <div id="auth-pane-agent" class="${draft.auth === 'agent' ? '' : 'hidden'}">
          <div class="hint-note" style="padding:6px 0;">${t('hd_agent_note')}</div>
        </div>

        <label class="field-label">${t('hd_color')}</label>
        <div class="color-swatches" id="h-colors">
          ${HOST_COLORS.map((c) => `<div class="swatch ${draft.color === c ? 'active' : ''}" data-c="${c}" style="background:${c}"></div>`).join('')}
        </div>
      </div>

      <div id="hd-pane-1" class="hidden">
        <label class="field-label">${t('hd_tags')}</label><input id="h-tags" value="${esc(draft.tags)}" placeholder="${t('hd_tags_ph')}" />
        <label class="field-label">${t('hd_jump')}</label>
        <select id="h-jump"><option value="">${t('hd_none')}</option>${jumpOpts}</select>
        <label class="field-label">${t('hd_proxy')}</label>
        <select id="h-proxy-mode">
          <option value="none" ${draft.proxy_mode === 'none' ? 'selected' : ''}>${t('hd_proxy_none')}</option>
          <option value="socks5" ${draft.proxy_mode === 'socks5' ? 'selected' : ''}>${t('hd_proxy_socks5')}</option>
        </select>
        <div id="h-proxy-box" class="${draft.proxy_mode === 'socks5' ? '' : 'hidden'}">
          <div class="hint-note" style="margin-top:6px;">${t('vpn_socks_hop')}</div>
          <div class="row2" style="grid-template-columns: 1fr 90px;">
            <div><label class="field-label">${t('vpn_socks_host')}</label><input id="h-proxy-host" value="${esc(draft.proxy_host)}" placeholder="127.0.0.1" /></div>
            <div><label class="field-label">${t('vpn_socks_port')}</label><input id="h-proxy-port" type="number" value="${draft.proxy_port}" placeholder="1080" /></div>
          </div>
          <div class="row2" style="grid-template-columns: 1fr 1fr;">
            <div><label class="field-label">${t('vpn_socks_user')}</label><input id="h-proxy-user" value="${esc(draft.proxy_user)}" /></div>
            <div><label class="field-label">${t('vpn_socks_pass')}</label><input id="h-proxy-pass" type="password" value="" placeholder="${h?.had_proxy_pass ? '••••••••' : ''}" /></div>
          </div>
        </div>
        <label class="field-label">${t('hd_snip')}</label>
        <select id="h-snip"><option value="">${t('hd_none')}</option>${snipOpts}</select>
        <div class="row2" style="grid-template-columns: 1fr 110px;">
          <div><label class="field-label">${t('hd_startup')}</label><input id="h-startup" class="mono" value="${esc(draft.startup)}" placeholder="${t('hd_startup_ph')}" /></div>
          <div><label class="field-label">${t('hd_ka')}</label><input id="h-ka" type="number" value="${draft.keepalive}" /></div>
        </div>
        <label class="field-label">${t('hd_note')}</label>
        <textarea id="h-note" rows="2">${esc(draft.note)}</textarea>
      </div>

      <div id="hd-pane-2" class="hidden">
        <label class="field-label">${t('hd_env')}</label>
        <textarea id="h-env" rows="4" class="mono" placeholder="LANG=en_US.UTF-8&#10;EDITOR=nano">${esc(draft.env)}</textarea>
        <div class="hint-note">${t('hd_env_hint')}</div>
        <label class="field-label" style="margin-top:12px;">${t('hd_opts')}</label>
        <textarea id="h-opts" rows="4" class="mono" placeholder="ServerAliveInterval=30&#10;Compression=yes&#10;SetEnv=FOO=bar">${esc(draft.options)}</textarea>
        <div class="hint-note">${t('hd_opts_hint')}</div>
      </div>
    </div>

    <div id="h-err" class="err-text"></div>
    <div class="modal-actions">
      <button class="btn" data-close-modal>${t('cancel')}</button>
      <button class="btn primary" id="h-save">${t('save')}</button>
    </div>
  `);

  document.querySelectorAll('.seg-tabs:not(#h-auth-tabs) .seg-tab').forEach((b) => {
    b.onclick = () => {
      curTab = Number(b.dataset.t);
      document.querySelectorAll('.seg-tabs:not(#h-auth-tabs) .seg-tab').forEach((x) => x.classList.toggle('active', Number(x.dataset.t) === curTab));
      [0, 1, 2].forEach((i) => $(`hd-pane-${i}`).classList.toggle('hidden', i !== curTab));
    };
  });

  document.querySelectorAll('#h-auth-tabs .seg-tab').forEach((b) => {
    b.onclick = () => {
      draft.auth = b.dataset.a;
      document.querySelectorAll('#h-auth-tabs .seg-tab').forEach((x) => x.classList.toggle('active', x.dataset.a === draft.auth));
      ['password', 'key', 'agent'].forEach((a) => $(`auth-pane-${a}`).classList.toggle('hidden', a !== draft.auth));
    };
  });

  document.querySelectorAll('#h-colors .swatch').forEach((s) => {
    s.onclick = () => {
      draft.color = s.dataset.c;
      document.querySelectorAll('#h-colors .swatch').forEach((x) => x.classList.toggle('active', x.dataset.c === draft.color));
      const t = $('hd-tile');
      t.style.background = `${draft.color}28`;
      t.style.borderColor = `${draft.color}70`;
      t.style.color = draft.color;
    };
  });

  const syncHeader = () => {
    $('hd-title').textContent = $('h-name').value.trim() || (isNew ? t('hd_new') : t('tt_edit'));
    const u = $('h-user').value.trim();
    const ho = $('h-host').value.trim();
    $('hd-sub').textContent = ho ? `${u ? u + '@' : ''}${ho}` : t('hd_new_sub');
  };
  $('h-name').oninput = syncHeader;
  $('h-host').oninput = syncHeader;
  $('h-user').oninput = syncHeader;

  $('h-pw-eye').onclick = () => {
    const inp = $('h-pw');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  };
  $('h-proxy-mode').onchange = () => {
    $('h-proxy-box').classList.toggle('hidden', $('h-proxy-mode').value !== 'socks5');
  };
  $('h-key-file').onchange = async () => {
    const f = $('h-key-file').files?.[0];
    if (f) $('h-key-pem').value = await f.text();
  };

  $('h-save').onclick = () => {
    const hostAddr = $('h-host').value.trim();
    if (!hostAddr) { $('h-err').textContent = t('hd_err_host'); return; }
    const port = Number($('h-port').value);
    if (!port || port < 1 || port > 65535) { $('h-err').textContent = t('hd_err_port'); return; }

    const item = {
      id: draft.id,
      name: $('h-name').value.trim() || hostAddr,
      host: hostAddr,
      port,
      user: $('h-user').value.trim() || 'root',
      auth: draft.auth,
      color: draft.color,
      group: $('h-group').value.trim(),
      tags: $('h-tags').value.split(',').map((s) => s.trim()).filter(Boolean),
      jump_id: $('h-jump').value,
      startup_snippet: $('h-snip').value,
      startup: $('h-startup').value,
      keepalive: Number($('h-ka').value) || 30,
      note: $('h-note').value,
      env: $('h-env').value,
      options: $('h-opts').value,
      proxy_mode: $('h-proxy-mode').value === 'socks5' ? 'socks5' : 'none',
      proxy_host: $('h-proxy-host').value.trim(),
      proxy_port: Number($('h-proxy-port').value) || 1080,
      proxy_user: $('h-proxy-user').value,
      had_pw: draft.had_pw || !!$('h-pw').value,
      had_key: draft.had_key || !!$('h-key-pem').value.trim(),
      had_passphrase: !!h?.had_passphrase || !!$('h-passphrase').value,
      had_proxy_pass: !!h?.had_proxy_pass || !!$('h-proxy-pass').value,
    };

    if (h?.shared) {
      wsSend({
        type: 'save_shared_host',
        ownerId: h.ownerId,
        rawHostId: h.rawHostId,
        host: item,
        secrets: {
          password: $('h-pw').value,
          passphrase: $('h-passphrase').value,
          proxy_pass: $('h-proxy-pass').value,
          privateKey: $('h-key-pem').value.trim(),
        },
      });
      closeModal();
      return;
    }

    if (h) state.hosts = state.hosts.map((x) => (x.id === draft.id ? item : x));
    else state.hosts.push(item);

    wsSend({
      type: 'save_hosts',
      hosts: state.hosts,
      hostId: draft.id,
      secrets: {
        password: $('h-pw').value,
        passphrase: $('h-passphrase').value,
        proxy_pass: $('h-proxy-pass').value,
        privateKey: $('h-key-pem').value.trim(),
      },
    });
    closeModal();
    renderSidebar();
    renderWelcomeRecent();
  };
}

function openSnippetModal() {
  showModal(`
    <h3>${t('snip_new')}</h3>
    <label class="field-label">${t('snip_name')}</label><input id="sn-name" placeholder="System Update" />
    <label class="field-label">${t('snip_cmd')}</label><input id="sn-cmd" placeholder="sudo apt update && sudo apt upgrade -y" />
    <div class="modal-actions"><button class="btn" data-close-modal>${t('cancel')}</button><button class="btn primary" id="sn-save">${t('save')}</button></div>
  `);
  $('sn-save').onclick = () => {
    state.snippets.push({ id: Date.now().toString(16), name: $('sn-name').value.trim(), command: $('sn-cmd').value });
    wsSend({ type: 'save_snippets', snippets: state.snippets });
    closeModal();
    renderSidebar();
  };
}

function promptNewItem(sid, dir, folder) {
  const name = prompt(folder ? t('new_folder_prompt') : t('new_file_prompt'));
  if (!name) return;
  const full = dir.endsWith('/') ? `${dir}${name}` : `${dir}/${name}`;
  wsSend({ type: folder ? 'fs_mkdir' : 'fs_touch', sid, path: full });
}

function triggerUpload(sid, dir) {
  const inp = $('file-upload-input');
  inp.onchange = async () => {
    for (const f of inp.files) {
      if (f.size > 18 * 1024 * 1024) {
        toast(`${f.name}: > 18 MB`, 'err');
        continue;
      }
      const b64 = await new Promise((res, rej) => {
        const rd = new FileReader();
        rd.onload = () => {
          const s = String(rd.result || '');
          const idx = s.indexOf(',');
          res(idx !== -1 ? s.slice(idx + 1) : '');
        };
        rd.onerror = rej;
        rd.readAsDataURL(f);
      });
      wsSend({ type: 'fs_upload', sid, dir, name: f.name, base64: b64 });
    }
    inp.value = '';
  };
  inp.click();
}

function showModal(html) {
  $('modal-box').innerHTML = html;
  $('modal-box').querySelectorAll('[data-close-modal]').forEach((b) => { b.onclick = closeModal; });
  $('modal-backdrop').classList.remove('hidden');
}
window.closeModal = () => $('modal-backdrop').classList.add('hidden');
$('modal-backdrop').addEventListener('click', (e) => {
  if (e.target === $('modal-backdrop')) closeModal();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('modal-backdrop').classList.contains('hidden')) closeModal();
});

(() => {
  const panes = [
    { id: 'editor', el: $('editor-pane'), handle: $('tab-bar') },
    { id: 'vnc', el: $('vnc-pane'), handle: $('vnc-tabs') },
    { id: 'term', el: $('term-panel'), handle: document.querySelector('.term-panel-title') },
  ];
  let dragPane = null;
  for (const p of panes) {
    if (!p.el || !p.handle) continue;
    p.handle.draggable = true;
    p.handle.title = t('tt_pane_drag');
    p.handle.addEventListener('dragstart', (e) => {
      if (e.target.closest('.tab, .term-tab, button')) return;
      dragPane = p.id;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/x-trm-pane', p.id);
      p.el.classList.add('pane-dragging');
    });
    p.handle.addEventListener('dragend', () => {
      dragPane = null;
      panes.forEach((x) => x.el.classList.remove('pane-dragging', 'pane-drop-target'));
    });
    p.el.addEventListener('dragover', (e) => {
      if (!dragPane || dragPane === p.id) return;
      e.preventDefault();
      p.el.classList.add('pane-drop-target');
    });
    p.el.addEventListener('dragleave', (e) => {
      if (!p.el.contains(e.relatedTarget)) p.el.classList.remove('pane-drop-target');
    });
    p.el.addEventListener('drop', (e) => {
      if (!dragPane || dragPane === p.id) return;
      e.preventDefault();
      p.el.classList.remove('pane-drop-target');
      const L = state.layout;
      const i1 = L.order.indexOf(dragPane);
      const i2 = L.order.indexOf(p.id);
      if (i1 !== -1 && i2 !== -1) {
        [L.order[i1], L.order[i2]] = [L.order[i2], L.order[i1]];
      }
      const z1 = L.zones[dragPane];
      L.zones[dragPane] = L.zones[p.id];
      L.zones[p.id] = z1;
      L.mode = 'custom';
      saveLayout();
      applyLayout();
      dragPane = null;
    });
  }
})();

function renderShareSidebar(el) {
  const ownHosts = state.hosts.filter((h) => !h.shared);
  const permKeys = ['terminal', 'files_read', 'files_write', 'docker', 'vnc', 'edit_host', 'show_address', 'sudo'];
  const permDefaults = { terminal: true, files_read: true, files_write: false, docker: false, vnc: false, edit_host: false, show_address: false, sudo: false };
  const hostMap = new Map(ownHosts.map((h) => [h.id, h.name || h.host]));
  const shares = state.sharesOut || [];
  const pendingIn = state.sharesIn || [];
  const acceptedIn = state.sharesAccepted || [];

  el.innerHTML = `
    <div class="side-header">
      <span>${t('hdr_share')}</span>
      <button id="sh-refresh" class="icon-btn xs" title="${t('refresh')}">↻</button>
    </div>
    <div class="side-body">
      <label class="field-label">${t('share_my_id')}</label>
      <div style="display:flex;gap:6px;margin-bottom:12px;">
        <input class="mono" readonly value="${esc(state.userId || '')}" style="flex:1;font-size:11.5px;" />
        <button id="sh-copy-uid" class="btn sm">${t('reg_copy')}</button>
      </div>

      ${pendingIn.length ? `
        <div style="margin-bottom:14px;padding:8px;border:1px solid var(--accent);border-radius:4px;background:rgba(55,148,255,0.08);">
          <div style="font-size:11.5px;font-weight:600;color:var(--accent);margin-bottom:6px;">${t('share_invites')} (${pendingIn.length})</div>
          ${pendingIn.map((inv) => `
            <div style="padding:6px;border-radius:4px;background:var(--bg-editor);border:1px solid var(--border-strong);margin-bottom:4px;">
              <div class="mono" style="font-size:11px;color:var(--ink-bright);margin-bottom:4px;">${esc(inv.ownerId)} (${(inv.hostIds || []).length})</div>
              <div style="display:flex;gap:4px;">
                <button class="btn primary sm sh-in-acc" data-id="${esc(inv.id)}" style="flex:1;justify-content:center;">${t('share_accept')}</button>
                <button class="btn danger sm sh-in-dec" data-id="${esc(inv.id)}" style="flex:1;justify-content:center;">${t('share_decline')}</button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <input type="hidden" id="sh-edit-id" value="" />
      <label class="field-label">${t('share_target_id')}</label>
      <input id="sh-target" class="mono" placeholder="${t('share_target_ph')}" style="margin-bottom:10px;" />
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <label class="field-label" style="margin:0;">${t('share_servers')}</label>
        <div style="display:flex;gap:4px;">
          <button id="sh-all" class="btn sm">${t('share_select_all')}</button>
          <button id="sh-none" class="btn sm">${t('share_select_none')}</button>
        </div>
      </div>
      <div style="max-height:130px;overflow:auto;border:1px solid var(--border-strong);border-radius:4px;padding:6px;margin-bottom:10px;background:var(--bg-editor);">
        ${ownHosts.length ? ownHosts.map((h) => `
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;padding:3px 0;cursor:pointer;">
            <input type="checkbox" class="sh-host-cb" value="${esc(h.id)}" style="width:auto;" />
            <span>${esc(h.name || h.host)}</span>
          </label>
        `).join('') : `<div class="muted" style="font-size:12px;">${t('no_hosts')}</div>`}
      </div>
      <label class="field-label">${t('share_perms')}</label>
      <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:12px;">
        ${permKeys.map((k) => `
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
            <input type="checkbox" id="sh-perm-${k}" ${permDefaults[k] ? 'checked' : ''} style="width:auto;" />
            <span>${t(`share_perm_${k}`)}</span>
          </label>
        `).join('')}
      </div>
      <button id="sh-save" class="btn primary full" style="margin-bottom:14px;">${t('share_save')}</button>

      <label class="field-label">${t('share_existing')}</label>
      <div id="share-list-box" style="margin-bottom:14px;">
        ${shares.length ? shares.map((s) => {
          const names = (s.hostIds || []).map((id) => hostMap.get(id) || id);
          const activePerms = permKeys.filter((k) => s.permissions && s.permissions[k]).map((k) => t(`share_perm_${k}`));
          const st = s.status || 'accepted';
          const stColor = st === 'accepted' ? 'var(--success)' : (st === 'declined' ? '#f0616d' : '#f5b942');
          return `
            <div style="padding:8px;border:1px solid var(--border-strong);border-radius:4px;background:var(--bg-editor);margin-bottom:6px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:4px;">
                <span class="mono" style="font-size:11.5px;color:var(--ink-bright);font-weight:600;overflow:hidden;text-overflow:ellipsis;">${esc(s.targetId)}</span>
                <span style="font-size:10px;padding:1px 5px;border-radius:3px;border:1px solid ${stColor};color:${stColor};">${t(`share_status_${st}`)}</span>
              </div>
              <div class="muted" style="font-size:11px;margin-bottom:3px;">${t('share_servers')}: ${names.length ? esc(names.join(', ')) : '0'}</div>
              <div class="muted" style="font-size:11px;margin-bottom:6px;">${t('share_perms')}: ${activePerms.length ? esc(activePerms.join(', ')) : '-'}</div>
              <div style="display:flex;gap:4px;">
                <button class="btn sm sh-edit" data-id="${esc(s.id)}" style="flex:1;justify-content:center;">${t('tt_edit')}</button>
                <button class="btn danger sm sh-del" data-id="${esc(s.id)}" style="flex:1;justify-content:center;">${t('share_revoke')}</button>
              </div>
            </div>
          `;
        }).join('') : `<div class="muted" style="font-size:12px;">${t('share_none')}</div>`}
      </div>

      ${acceptedIn.length ? `
        <label class="field-label">${t('share_accepted_title')} (${acceptedIn.length})</label>
        <div>
          ${acceptedIn.map((acc) => `
            <div style="padding:8px;border:1px solid var(--border-strong);border-radius:4px;background:var(--bg-editor);margin-bottom:6px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                <div>
                  <div class="mono" style="font-size:11.5px;color:var(--ink-bright);font-weight:600;">${esc(acc.ownerId)}</div>
                  <div class="muted" style="font-size:11px;">${(acc.hostIds || []).length} ${t('hdr_hosts').toLowerCase()}</div>
                </div>
                <button class="btn danger sm sh-leave" data-id="${esc(acc.id)}">${t('share_leave')}</button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  $('sh-refresh').onclick = () => wsSend({ type: 'share_list' });
  $('sh-copy-uid').onclick = async () => {
    try { await navigator.clipboard.writeText(state.userId || ''); } catch {}
    $('sh-copy-uid').textContent = t('reg_copied');
    setTimeout(() => { if ($('sh-copy-uid')) $('sh-copy-uid').textContent = t('reg_copy'); }, 1500);
  };
  el.querySelectorAll('.sh-in-acc').forEach((b) => {
    b.onclick = () => wsSend({ type: 'share_respond', id: b.dataset.id, accept: true });
  });
  el.querySelectorAll('.sh-in-dec').forEach((b) => {
    b.onclick = () => wsSend({ type: 'share_respond', id: b.dataset.id, accept: false });
  });
  el.querySelectorAll('.sh-leave').forEach((b) => {
    b.onclick = () => wsSend({ type: 'share_leave', id: b.dataset.id });
  });
  $('sh-all').onclick = () => el.querySelectorAll('.sh-host-cb').forEach((cb) => { cb.checked = true; });
  $('sh-none').onclick = () => el.querySelectorAll('.sh-host-cb').forEach((cb) => { cb.checked = false; });
  for (const k of permKeys) {
    const cb = $(`sh-perm-${k}`);
    if (!cb) continue;
    cb.onchange = () => {
      if (k === 'sudo' && cb.checked) {
        for (const pk of permKeys) { const pEl = $(`sh-perm-${pk}`); if (pEl) pEl.checked = true; }
      } else if (k !== 'sudo' && !cb.checked) {
        if ($('sh-perm-sudo')) $('sh-perm-sudo').checked = false;
      }
      if (k === 'files_write' && cb.checked && $('sh-perm-files_read')) {
        $('sh-perm-files_read').checked = true;
      } else if (k === 'files_read' && !cb.checked && $('sh-perm-files_write')) {
        $('sh-perm-files_write').checked = false;
      }
      if (k === 'edit_host' && cb.checked && $('sh-perm-show_address')) {
        $('sh-perm-show_address').checked = true;
      } else if (k === 'show_address' && !cb.checked && $('sh-perm-edit_host')) {
        $('sh-perm-edit_host').checked = false;
      }
    };
  }
  $('sh-save').onclick = () => {
    const targetId = $('sh-target').value.trim();
    const hostIds = Array.from(el.querySelectorAll('.sh-host-cb:checked')).map((cb) => cb.value);
    const permissions = {};
    for (const k of permKeys) permissions[k] = !!$(`sh-perm-${k}`)?.checked;
    wsSend({ type: 'share_save', id: $('sh-edit-id').value.trim(), targetId, hostIds, permissions });
    $('sh-edit-id').value = '';
  };
  el.querySelectorAll('.sh-edit').forEach((b) => {
    b.onclick = () => {
      const s = (state.sharesOut || []).find((x) => x.id === b.dataset.id);
      if (!s) return;
      $('sh-edit-id').value = s.id;
      $('sh-target').value = s.targetId;
      const set = new Set(s.hostIds || []);
      el.querySelectorAll('.sh-host-cb').forEach((cb) => { cb.checked = set.has(cb.value); });
      for (const k of permKeys) {
        const cb = $(`sh-perm-${k}`);
        if (cb) cb.checked = !!(s.permissions && s.permissions[k]);
      }
    };
  });
  el.querySelectorAll('.sh-del').forEach((b) => {
    b.onclick = () => wsSend({ type: 'share_delete', id: b.dataset.id });
  });
}

function openShareModal() {
  state.view = 'share';
  document.querySelectorAll('.act-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === 'share'));
  wsSend({ type: 'share_list' });
  renderSidebar();
}

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

boot();
