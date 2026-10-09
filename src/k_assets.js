
// ================================================================== real assets: graded photo plates, photo cloud cutouts, footage
// ASSETS (injected by build.py from assets/manifest_used.json): id -> { k: 'plate'|'cut'|'video', src, w, h, dur? }
const ASSETS = __ASSETS__;
const IMG = {}, VID = {};
let VID_REQ = null;                     // when non-null, renderAt only records which footage it needs (see prepare)
function loadAssets(){
  const jobs = [];
  for (const [id, a] of Object.entries(ASSETS)){
    if (a.k === 'video'){
      const v = document.createElement('video'); v.src = 'assets/' + a.src; v.muted = true; v.playsInline = true; v.preload = 'auto'; v.loop = false;
      VID[id] = v;
      jobs.push(new Promise(res => { v.addEventListener('loadeddata', res, { once: true }); v.addEventListener('error', res, { once: true }); }));
    } else {
      // r8 (the r8 export lost the tower clouds of 0-63 s: with 4 export pages hammering the local server some image
      // requests failed and nothing retried): retry a failed image up to 8 times; window.MISSING lists what never loaded
      const im = new Image(); IMG[id] = im;
      jobs.push(new Promise(res => { let tries = 0;
        const go = () => { im.onload = () => im.decode().catch(() => {}).then(res); im.onerror = () => { if (++tries <= 8) setTimeout(go, 200 + 250 * tries); else res(); }; im.src = 'assets/' + a.src + (tries ? '?r=' + tries : ''); };
        go(); }));
    }
  }
  return Promise.all(jobs);
}
// draw an image covering the frame (or a w x h box) with a slow Ken Burns move.
// o: { x, y (centre, default frame centre), s (extra scale), pan: [dx, dy] px over the whole move, z: zoom over the move,
//      u: 0..1 progress of the move, alpha, flip }
function plate(g, id, o = {}){
  const im = IMG[id]; if (!im || !im.width) return;
  const bw = o.w || W, bh = o.h || H, cover = Math.max(bw / im.width, bh / im.height);
  const u = o.u === undefined ? 0 : o.u, s = cover * (o.s || 1.06) * (1 + (o.z || 0) * u);
  const x = (o.x === undefined ? W / 2 : o.x) + (o.pan ? o.pan[0] * (u - .5) : 0), y = (o.y === undefined ? H / 2 : o.y) + (o.pan ? o.pan[1] * (u - .5) : 0);
  g.save(); if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  g.translate(x, y); if (o.rot) g.rotate(o.rot); g.scale(o.flip ? -s : s, s);
  g.drawImage(im, -im.width / 2, -im.height / 2); g.restore();
}
// a photo cloud cutout (premultiplied alpha PNG/WebP) centred at x, y; s = height in px of the 1920 frame
function cut(g, id, x, y, hpx, o = {}){
  const im = IMG[id]; if (!im || !im.width || hpx < 1) return;
  const s = hpx / im.height;
  g.save(); if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  g.translate(x, y); if (o.rot) g.rotate(o.rot); g.scale(o.flip ? -s : s, s);
  g.drawImage(im, -im.width / 2, -im.height / 2); g.restore();
}
// footage: draw clip `id` at clip time ct (seconds) covering the frame like plate()
function footage(g, id, ct, o = {}){
  const a = ASSETS[id]; if (!a) return;
  ct = clamp(ct, 0, Math.max(0, (a.dur || 1) - .05));
  if (VID_REQ){ VID_REQ.push([id, ct]); return; }
  const v = VID[id]; if (!v || v.readyState < 2) return;
  if (!TEST && Math.abs(v.currentTime - ct) > .15){ v.currentTime = ct; }
  const bw = o.w || W, bh = o.h || H, cover = Math.max(bw / v.videoWidth, bh / v.videoHeight), u = o.u === undefined ? 0 : o.u, s = cover * (o.s || 1.04) * (1 + (o.z || 0) * u);
  g.save(); if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  g.translate((o.x === undefined ? W / 2 : o.x) + (o.pan ? o.pan[0] * (u - .5) : 0), (o.y === undefined ? H / 2 : o.y) + (o.pan ? o.pan[1] * (u - .5) : 0)); g.scale(s, s);
  g.drawImage(v, -v.videoWidth / 2, -v.videoHeight / 2); g.restore();
}
// export path: find out which clips frame t needs, seek them exactly, then the caller renders
async function prepare(t){
  VID_REQ = []; const keep = ctx.getTransform();
  try { renderAt(t); } catch (e) {} finally { const req = VID_REQ; VID_REQ = null; ctx.setTransform(keep);
    await Promise.all(req.map(([id, ct]) => new Promise(res => { const v = VID[id]; if (!v){ res(); return; } if (Math.abs(v.currentTime - ct) < 1e-3 && v.readyState >= 2){ res(); return; }
      const done = () => { v.removeEventListener('seeked', done); res(); }; v.addEventListener('seeked', done); v.currentTime = ct; }))); }
}
window.prepare = prepare;
// clip a drawing function to a shape (photo "windows")
function inCircle(g, x, y, r, fn){ if (r <= 0) return; g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); fn(); g.restore(); }
function inPath(g, pathFn, fn){ g.save(); g.beginPath(); pathFn(); g.clip(); fn(); g.restore(); }
// one shared film layer over everything: soft vignette (grain is added by the export encoder's noise-free JPEGs → keep it subtle)
function filmLayer(g, k = 1){
  const gr = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05);
  gr.addColorStop(0, 'rgba(4,55,139,0)'); gr.addColorStop(1, `rgba(4,40,110,${.28 * k})`);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
