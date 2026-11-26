const $ = (id) => document.getElementById(id);
const BASE_PATH = location.pathname.replace(/\/[^/]+\/?$/, '').replace(/\/$/, '');
const apiUrl = (p) => `${BASE_PATH}${p.startsWith('/') ? p : '/' + p}`;
const state = {
  token: sessionStorage.getItem('trm_admin_token') || '',
  tab: 'overview',
  overview: null,
  users: [],
  servers: [],
};

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtBytes(b) {
  const n = Number(b) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function fmtTime(ts) {
  if (!ts) return '-';
  return new Date(ts).toLocaleString();
}

function toast(text, kind = 'ok') {
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = text;
  $('toasts').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

async function api(url, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { Authorization: `Bearer ${state.token}` },
  };
  if (body !== null) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const r = await fetch(apiUrl(url), opts);
  if (r.status === 401) {
    sessionStorage.removeItem('trm_admin_token');
    state.token = '';
    $('adm-app').classList.add('hidden');
    $('adm-login').classList.remove('hidden');
    throw new Error('Unauthorized');
  }
  return r.json();
}

function showAuthLoader(text) {
  if ($('auth-loader-text')) $('auth-loader-text').textContent = text || 'Loading...';
  $('auth-loader')?.classList.remove('hidden');
}
function hideAuthLoader() {
  $('auth-loader')?.classList.add('hidden');
}

async function login() {
  $('adm-login-err').textContent = '';
  const key = $('adm-key-input').value.trim();
  showAuthLoader('Signing in...');
  const res = await fetch(apiUrl('/api/admin/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  }).then((r) => r.json()).catch(() => ({ ok: false, error: 'Network error' }));
  if (!res.ok) {
    hideAuthLoader();
    $('adm-login-err').textContent = res.error || 'Invalid key';
    return;
  }
  state.token = res.token;
  sessionStorage.setItem('trm_admin_token', state.token);
  setTimeout(() => {
    $('adm-login').classList.add('hidden');
    $('adm-app').classList.remove('hidden');
    hideAuthLoader();
    loadAll();
  }, 450);
}

$('adm-login-btn').onclick = login;
$('adm-key-input').onkeydown = (e) => { if (e.key === 'Enter') login(); };
$('adm-logout').onclick = () => {
  showAuthLoader('Signing out...');
  sessionStorage.removeItem('trm_admin_token');
  setTimeout(() => location.reload(), 450);
};
$('adm-refresh').onclick = loadAll;

document.querySelectorAll('.adm-tab').forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll('.adm-tab').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.tab = btn.dataset.tab;
    render();
  };
});

async function loadAll() {
  try {
    const [ov, us, sv] = await Promise.all([
      api('/api/admin/overview'),
      api('/api/admin/users'),
      api('/api/admin/servers'),
    ]);
    if (ov.ok) state.overview = ov;
    if (us.ok) state.users = us.users || [];
    if (sv.ok) state.servers = sv.servers || [];
    render();
  } catch {}
}

function render() {
  const root = $('adm-content');
  const ov = state.overview || {};
  const vpn = ov.vpn || {};

  if (state.tab === 'overview') {
    const sess = ov.activeSessions || [];
    root.innerHTML = `
      <div class="adm-cards">
        <div class="adm-card"><div class="adm-card-lbl">VPN Tunnel</div><div class="adm-card-val"><span class="badge ${vpn.defaultRunning ? 'ok' : 'err'}">${vpn.defaultRunning ? 'ACTIVE' : 'STOPPED'}</span></div></div>
        <div class="adm-card"><div class="adm-card-lbl">Active SSH Sessions</div><div class="adm-card-val">${sess.length}</div></div>
        <div class="adm-card"><div class="adm-card-lbl">WebSocket Clients</div><div class="adm-card-val">${ov.wsClients || 0}</div></div>
        <div class="adm-card"><div class="adm-card-lbl">Total Download (RX)</div><div class="adm-card-val">${fmtBytes(ov.traffic?.totalRx)}</div></div>
        <div class="adm-card"><div class="adm-card-lbl">Total Upload (TX)</div><div class="adm-card-val">${fmtBytes(ov.traffic?.totalTx)}</div></div>
      </div>

      <div class="adm-panel">
        <h3>
          <span>Active SSH Sessions & Live Traffic (${sess.length})</span>
          ${sess.length ? '<button class="btn danger sm" id="kill-all-btn">Kill All Sessions</button>' : ''}
        </h3>
        <table class="tbl">
          <thead><tr><th>User</th><th>Server</th><th>Route</th><th>RX / TX</th><th>Connected</th><th>Action</th></tr></thead>
          <tbody>
            ${sess.length ? sess.map((s) => `
              <tr>
                <td class="mono">${esc(s.userId)}</td>
                <td><b>${esc(s.name)}</b> <span class="muted mono">${esc(s.host)}:${s.port}</span></td>
                <td class="mono muted">${esc(s.proxy)}</td>
                <td class="mono">${fmtBytes(s.bytesRx)} / ${fmtBytes(s.bytesTx)}</td>
                <td class="muted">${fmtTime(s.connectedAt)}</td>
                <td><button class="btn danger sm kill-sess" data-key="${esc(s.key)}">Disconnect</button></td>
              </tr>
            `).join('') : '<tr><td colspan="6" class="muted">No active SSH sessions.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
    if ($('kill-all-btn')) {
      $('kill-all-btn').onclick = async () => {
        await api('/api/admin/sessions/kill', 'POST', { all: true });
        toast('All sessions closed.');
        loadAll();
      };
    }
    root.querySelectorAll('.kill-sess').forEach((b) => {
      b.onclick = async () => {
        await api('/api/admin/sessions/kill', 'POST', { key: b.dataset.key });
        toast('Session disconnected.');
        loadAll();
      };
    });
  } else if (state.tab === 'vpn') {
    const files = vpn.files || [];
    root.innerHTML = `
      <div class="adm-panel">
        <h3>
          <span>Default VPN Status</span>
          <div style="display:flex;gap:6px;">
            <button class="btn sm" id="vpn-start">Start</button>
            <button class="btn sm" id="vpn-restart">Restart</button>
            <button class="btn danger sm" id="vpn-stop">Stop</button>
            <button class="btn primary sm" id="vpn-test">Test Exit IP</button>
          </div>
        </h3>
        <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12.5px;">
          <div>Policy: <span class="badge ${vpn.vpnEnabled !== false ? 'ok' : 'err'}">${vpn.vpnEnabled !== false ? 'VPN Enabled' : 'VPN Disabled'}</span></div>
          <div>Engine: <span class="badge ${vpn.wireproxyAvailable ? 'ok' : 'err'}">${vpn.wireproxyAvailable ? 'wireproxy Ready' : 'Missing'}</span></div>
          <div>Tunnel: <span class="badge ${vpn.defaultRunning ? 'ok' : 'err'}">${vpn.defaultRunning ? 'Running' : 'Stopped'}</span></div>
          <div>Active File: <span class="mono">${esc(vpn.defaultFile || 'None')}</span></div>
          <div>Endpoint: <span class="mono">${esc(vpn.defaultEndpoint || '-')}</span></div>
          <div id="vpn-exit-ip"></div>
        </div>
        ${vpn.vpnEnabled === false ? `
          <div style="margin-top:14px;padding:12px;border-radius:5px;background:var(--bg-editor);border:1px solid ${vpn.allowWithoutVpn ? 'var(--warn)' : 'var(--error)'};">
            <div style="font-weight:500;color:var(--ink-bright);margin-bottom:8px;">VPN is stopped — Allow users to connect without VPN?</div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <button class="btn sm ${vpn.allowWithoutVpn ? 'primary' : ''}" id="vpn-allow-yes">Yes (Direct / Proxy without VPN)</button>
              <button class="btn sm ${!vpn.allowWithoutVpn ? 'danger' : ''}" id="vpn-allow-no">No (Block all connections & proxies)</button>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="adm-panel">
        <h3><span>vpn_default/ Config Files (${files.length})</span></h3>
        <table class="tbl">
          <thead><tr><th>File</th><th>Endpoint</th><th>Address</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${files.length ? files.map((f) => `
              <tr>
                <td class="mono">${esc(f.file)}</td>
                <td class="mono">${esc(f.endpoint)}</td>
                <td class="mono muted">${esc(f.address)}</td>
                <td>${f.active ? '<span class="badge ok">Active</span>' : '<span class="badge">Standby</span>'}</td>
                <td><button class="btn danger sm del-conf" data-file="${esc(f.file)}">Delete</button></td>
              </tr>
            `).join('') : '<tr><td colspan="5" class="muted">No .conf files in vpn_default/.</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="adm-panel">
        <h3><span>Upload / Add WireGuard .conf to vpn_default/</span></h3>
        <label class="field-label">Select .conf File</label>
        <input id="adm-wg-file" type="file" accept=".conf,.txt" />
        <label class="field-label">Filename</label>
        <input id="adm-wg-name" placeholder="mullvad-nl.conf" />
        <label class="field-label">Config Content</label>
        <textarea id="adm-wg-body" rows="8" class="mono" placeholder="[Interface]&#10;PrivateKey = ...&#10;Address = ...&#10;&#10;[Peer]&#10;PublicKey = ...&#10;Endpoint = ...:51820"></textarea>
        <button id="adm-wg-save" class="btn primary" style="margin-top:12px;">Save Config</button>
      </div>
    `;
    const runVpnAct = async (action) => {
      const r = await api('/api/admin/vpn/action', 'POST', { action });
      if (!r.ok) toast(r.error || 'Error', 'err');
      else if (r.exitIp) {
        toast(`Exit IP: ${r.exitIp}`);
        if ($('vpn-exit-ip')) $('vpn-exit-ip').innerHTML = `Exit IP: <b class="mono" style="color:var(--success);">${esc(r.exitIp)}</b>`;
      } else {
        toast(`VPN ${action} done.`);
      }
      if (r.vpn && state.overview) { state.overview.vpn = r.vpn; }
      if (action !== 'test') render();
    };
    $('vpn-start').onclick = () => runVpnAct('start');
    $('vpn-restart').onclick = () => runVpnAct('restart');
    $('vpn-stop').onclick = () => runVpnAct('stop');
    $('vpn-test').onclick = () => runVpnAct('test');
    const setAllow = async (allowWithoutVpn) => {
      const r = await api('/api/admin/vpn/policy', 'POST', { allowWithoutVpn });
      if (r.vpn && state.overview) state.overview.vpn = r.vpn;
      toast(allowWithoutVpn ? 'Users can connect without VPN.' : 'All connections blocked while VPN is stopped.');
      render();
    };
    if ($('vpn-allow-yes')) $('vpn-allow-yes').onclick = () => setAllow(true);
    if ($('vpn-allow-no')) $('vpn-allow-no').onclick = () => setAllow(false);

    root.querySelectorAll('.del-conf').forEach((b) => {
      b.onclick = async () => {
        if (!confirm(`Delete ${b.dataset.file}?`)) return;
        await api('/api/admin/vpn/delete', 'POST', { filename: b.dataset.file });
        toast('Config deleted.');
        loadAll();
      };
    });
    $('adm-wg-file').onchange = async () => {
      const f = $('adm-wg-file').files?.[0];
      if (!f) return;
      $('adm-wg-name').value = f.name;
      $('adm-wg-body').value = await f.text();
    };
    $('adm-wg-save').onclick = async () => {
      const r = await api('/api/admin/vpn/save', 'POST', {
        filename: $('adm-wg-name').value.trim() || 'default.conf',
        content: $('adm-wg-body').value,
      });
      if (!r.ok) return toast(r.error || 'Invalid config', 'err');
      toast(`Saved: ${r.filename}`);
      loadAll();
    };
  } else if (state.tab === 'users') {
    const regEnabled = ov.registrationEnabled !== false;
    root.innerHTML = `
      <div class="adm-panel">
        <h3>
          <span>Users (${state.users.length}) &nbsp;<span class="badge ${regEnabled ? 'ok' : 'err'}">${regEnabled ? 'Registration Open' : 'Registration Closed'}</span></span>
          <div style="display:flex;gap:6px;">
            <button class="btn sm ${regEnabled ? 'danger' : ''}" id="adm-toggle-reg">${regEnabled ? 'Disable Registration' : 'Enable Registration'}</button>
            <button class="btn primary sm" id="adm-new-user">+ Create User Key</button>
          </div>
        </h3>
        <div id="adm-new-key-box" class="reg-key-box hidden" style="margin-bottom:12px;"></div>
        <table class="tbl">
          <thead><tr><th>User ID</th><th>Note</th><th>Created</th><th>Servers</th><th>Active</th><th>Traffic (RX/TX)</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${state.users.length ? state.users.map((u) => `
              <tr>
                <td class="mono">${esc(u.userId)}</td>
                <td><span class="muted" title="${esc(u.note || '')}" style="max-width:180px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;">${esc(u.note || '-')}</span></td>
                <td class="muted">${fmtTime(u.createdAt)}</td>
                <td>${u.hostCount}</td>
                <td>${u.activeSessions}</td>
                <td class="mono">${fmtBytes(u.bytesRx)} / ${fmtBytes(u.bytesTx)}</td>
                <td><span class="badge ${u.disabled ? 'err' : 'ok'}">${u.disabled ? 'Disabled' : 'Active'}</span></td>
                <td>
                  <button class="btn sm note-user" data-id="${esc(u.userId)}" data-note="${esc(u.note || '')}">Note</button>
                  <button class="btn sm toggle-user" data-id="${esc(u.userId)}" data-dis="${u.disabled ? '0' : '1'}">${u.disabled ? 'Enable' : 'Disable'}</button>
                  <button class="btn danger sm del-user" data-id="${esc(u.userId)}">Delete</button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="8" class="muted">No registered users yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
    $('adm-toggle-reg').onclick = async () => {
      const next = !(ov.registrationEnabled !== false);
      const r = await api('/api/admin/registration/policy', 'POST', { registrationEnabled: next });
      if (r.ok && state.overview) state.overview.registrationEnabled = r.registrationEnabled;
      toast(next ? 'User registration enabled.' : 'User registration disabled.');
      render();
    };
    $('adm-new-user').onclick = async () => {
      const r = await api('/api/admin/users/create', 'POST', {});
      if (r.ok) {
        const box = $('adm-new-key-box');
        box.classList.remove('hidden');
        box.innerHTML = `New User (${esc(r.userId)}): <code class="mono" style="color:var(--ink-bright);">${esc(r.accessKey)}</code>`;
        loadAll();
      }
    };
    root.querySelectorAll('.note-user').forEach((b) => {
      b.onclick = () => {
        const uid = b.dataset.id;
        const curNote = b.dataset.note || '';
        const bd = $('adm-modal-backdrop');
        const box = $('adm-modal-box');
        box.innerHTML = `
          <h3 style="margin:0 0 6px;">User Note</h3>
          <p class="muted mono" style="font-size:12px;margin:0 0 12px;">${esc(uid)}</p>
          <label class="field-label">Note</label>
          <textarea id="adm-note-inp" rows="4" placeholder="e.g. Ahmet - Prod Server" maxlength="200" style="width:100%;resize:vertical;word-break:break-word;">${esc(curNote)}</textarea>
          <div class="modal-actions">
            <button class="btn" id="adm-note-cancel">Cancel</button>
            <button class="btn primary" id="adm-note-save">Save</button>
          </div>
        `;
        bd.classList.remove('hidden');
        const inp = $('adm-note-inp');
        inp.focus();
        inp.select();
        const close = () => bd.classList.add('hidden');
        const save = async () => {
          await api('/api/admin/users/note', 'POST', { userId: uid, note: inp.value });
          close();
          toast('Note saved.');
          loadAll();
        };
        $('adm-note-cancel').onclick = close;
        $('adm-note-save').onclick = save;
        inp.onkeydown = (e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); }
          if (e.key === 'Escape') close();
        };
        bd.onclick = (e) => { if (e.target === bd) close(); };
      };
    });
    root.querySelectorAll('.toggle-user').forEach((b) => {
      b.onclick = async () => {
        await api('/api/admin/users/toggle', 'POST', { userId: b.dataset.id, disabled: b.dataset.dis === '1' });
        toast('User updated.');
        loadAll();
      };
    });
    root.querySelectorAll('.del-user').forEach((b) => {
      b.onclick = async () => {
        if (!confirm(`Delete user ${b.dataset.id} and all their servers?`)) return;
        await api('/api/admin/users/delete', 'POST', { userId: b.dataset.id });
        toast('User deleted.');
        loadAll();
      };
    });
  } else if (state.tab === 'servers') {
    root.innerHTML = `
      <div class="adm-panel">
        <h3><span>All Saved Servers (${state.servers.length})</span></h3>
        <table class="tbl">
          <thead><tr><th>User</th><th>Name</th><th>Address</th><th>Category</th><th>Proxy</th><th>Action</th></tr></thead>
          <tbody>
            ${state.servers.length ? state.servers.map((s) => `
              <tr>
                <td class="mono muted">${esc(s.userId)}</td>
                <td>${esc(s.name)}</td>
                <td class="mono">${esc(s.user)}@${esc(s.host)}:${s.port}</td>
                <td class="muted">${esc(s.group || '-')}</td>
                <td class="mono muted">${esc(s.proxy || 'None')}</td>
                <td><button class="btn danger sm del-srv" data-uid="${esc(s.userId)}" data-hid="${esc(s.id)}">Delete</button></td>
              </tr>
            `).join('') : '<tr><td colspan="6" class="muted">No saved servers.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
    root.querySelectorAll('.del-srv').forEach((b) => {
      b.onclick = async () => {
        if (!confirm('Delete this server?')) return;
        await api('/api/admin/servers/delete', 'POST', { userId: b.dataset.uid, hostId: b.dataset.hid });
        toast('Server deleted.');
        loadAll();
      };
    });
  } else if (state.tab === 'system') {
    root.innerHTML = `
      <div class="adm-cards">
        <div class="adm-card"><div class="adm-card-lbl">Uptime</div><div class="adm-card-val">${ov.uptimeSec || 0}s</div></div>
        <div class="adm-card"><div class="adm-card-lbl">Memory (RSS)</div><div class="adm-card-val">${ov.memoryMb || 0} MB</div></div>
        <div class="adm-card"><div class="adm-card-lbl">Node.js</div><div class="adm-card-val">${esc(ov.nodeVersion || '')}</div></div>
      </div>
      <div class="adm-panel">
        <h3><span>Change Admin Key</span></h3>
        <div style="display:flex;gap:8px;max-width:440px;">
          <input id="adm-new-key" type="password" placeholder="New admin key (min 8 chars)" />
          <button id="adm-save-key" class="btn primary">Update</button>
        </div>
      </div>
    `;
    $('adm-save-key').onclick = async () => {
      const r = await api('/api/admin/key', 'POST', { newKey: $('adm-new-key').value });
      if (!r.ok) return toast(r.error || 'Error', 'err');
      $('adm-new-key').value = '';
      toast('Admin key updated.');
    };
  }
}

if (state.token) {
  $('adm-login').classList.add('hidden');
  $('adm-app').classList.remove('hidden');
  loadAll();
}
setInterval(() => {
  if (state.token && state.tab === 'overview') loadAll();
}, 4000);
