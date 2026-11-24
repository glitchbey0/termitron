function execCmd(conn, cmd, timeoutMs = 20000, maxBytes = 8 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
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

function stripAnsi(s) {
  return String(s || '').replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').replace(/\r/g, '');
}

function quote(s) {
  return `'${String(s ?? '').replace(/'/g, "'\\''")}'`;
}

async function probeSys(conn) {
  const script = `
if [ -f /etc/os-release ]; then . /etc/os-release; fi
echo "NAME=\${PRETTY_NAME:-$(uname -s)}"
echo "ARCH=$(uname -m)"
echo "KERNEL=$(uname -sr)"
if command -v docker >/dev/null 2>&1; then
  echo "DOCKER=$(docker --version 2>&1)"
  echo "INFO=$(docker info --format '{{.ServerVersion}}' 2>&1)"
fi
`;
  const { out } = await execCmd(conn, script);
  const kv = {};
  for (const line of out.split(/\r?\n/)) {
    const idx = line.indexOf('=');
    if (idx > 0) kv[line.slice(0, idx)] = line.slice(idx + 1);
  }
  const dver = (kv.DOCKER || '').match(/(\d+\.\d+[^\s,]*)/)?.[1] || '';
  const info = kv.INFO || '';
  let dockerStatus = 'missing';
  if (kv.DOCKER) {
    if (/permission denied/i.test(info)) dockerStatus = 'no_access';
    else if (/cannot connect|not running/i.test(info)) dockerStatus = 'stopped';
    else if (info && !/error/i.test(info)) dockerStatus = 'ready';
  }
  return { os: kv.NAME || 'Linux', arch: kv.ARCH || '', kernel: kv.KERNEL || '', dockerStatus, dockerVersion: dver };
}

function jlines(s) {
  return s.split(/\r?\n/).filter((l) => l.trim().startsWith('{')).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

async function getDockerData(conn) {
  const cmd = `
TDIR=$(mktemp -d 2>/dev/null || echo "/tmp/.trm_dk_$$")
mkdir -p "$TDIR"
docker ps -a --no-trunc --format '{{json .}}' >"$TDIR/ps" 2>"$TDIR/err" &
P1=$!
docker stats --no-stream --format '{{json .}}' >"$TDIR/st" 2>/dev/null &
P2=$!
docker images --no-trunc --format '{{json .}}' >"$TDIR/im" 2>>"$TDIR/err" &
P3=$!
docker volume ls --format '{{json .}}' >"$TDIR/vo" 2>>"$TDIR/err" &
P4=$!
docker network ls --no-trunc --format '{{json .}}' >"$TDIR/ne" 2>>"$TDIR/err" &
P5=$!
wait $P1 $P2 $P3 $P4 $P5 2>/dev/null
cat "$TDIR/ps" 2>/dev/null
echo "===STAT==="
cat "$TDIR/st" 2>/dev/null
echo "===IMG==="
cat "$TDIR/im" 2>/dev/null
echo "===VOL==="
cat "$TDIR/vo" 2>/dev/null
echo "===NET==="
cat "$TDIR/ne" 2>/dev/null
cat "$TDIR/err" >&2 2>/dev/null
rm -rf "$TDIR" 2>/dev/null
`;
  const { out, err } = await execCmd(conn, cmd);
  const [p1 = '', r0 = ''] = out.split('===STAT===');
  const [pStat = '', r1 = ''] = r0.split('===IMG===');
  const [p2 = '', r2 = ''] = r1.split('===VOL===');
  const [p3 = '', p4 = ''] = r2.split('===NET===');

  const statMap = new Map();
  for (const st of jlines(pStat)) {
    const sid = (st.ID || '').slice(0, 12);
    if (sid) statMap.set(sid, st);
    if (st.Name) statMap.set(st.Name, st);
  }

  const containers = jlines(p1).map((v) => {
    const cid = (v.ID || '').slice(0, 12);
    const st = statMap.get(cid) || statMap.get(v.Names || '') || null;
    return {
      id: cid,
      name: v.Names || '',
      image: v.Image || '',
      state: (v.State || '').toLowerCase(),
      status: v.Status || '',
      ports: v.Ports || '',
      mounts: v.Mounts || '',
      networks: v.Networks || '',
      cpu: st ? (st.CPUPerc || '') : '',
      mem: st ? (st.MemUsage || '') : '',
      memPerc: st ? (st.MemPerc || '') : '',
      netIO: st ? (st.NetIO || '') : '',
    };
  });
  const images = jlines(p2).map((v) => ({
    id: (v.ID || '').replace('sha256:', '').slice(0, 12),
    repo: v.Repository || '',
    tag: v.Tag || '',
    size: v.Size || '',
  }));
  const volumes = jlines(p3).map((v) => ({ name: v.Name || '', driver: v.Driver || '' }));
  const networks = jlines(p4).map((v) => ({ id: (v.ID || '').slice(0, 12), name: v.Name || '', driver: v.Driver || '', scope: v.Scope || '' }));

  const errMsg = stripAnsi(err || '').trim();
  if (!containers.length && !images.length && !volumes.length && errMsg) {
    return { error: errMsg, containers, images, volumes, networks };
  }
  return { containers, images, volumes, networks };
}

module.exports = { execCmd, stripAnsi, quote, probeSys, getDockerData };
