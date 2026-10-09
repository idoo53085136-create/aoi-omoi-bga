
// ------------------------------------------------------------------ primitives (1920x1080 space)
function poly(g, pts, col){ g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fillStyle = col; g.fill(); }
function circle(g, x, y, r, col){ if (r <= 0) return; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = col; g.fill(); }
function ring(g, x, y, r0, r1, col){ if (r1 <= 0) return; g.beginPath(); g.arc(x, y, r1, 0, TAU); g.arc(x, y, Math.max(0, r0), 0, TAU, true); g.fillStyle = col; g.fill(); }
function rect(g, x, y, w, h, col){ g.fillStyle = col; g.fillRect(x, y, w, h); }
function withT(g, x, y, rot, s, fn){ g.save(); g.translate(x, y); if (rot) g.rotate(rot); if (s !== 1) g.scale(s, s); fn(); g.restore(); }
function bgFill(g, col){ g.fillStyle = col; g.fillRect(-W, -H, W * 3, H * 3); }

// scalloped circle (crinkly anime-cloud edge) appended to a path
function scallop(p, x, y, R, lobe = 9, amp = 2.4){
  const k = Math.max(3, Math.round(Math.PI * R / lobe)), n = k * 6, a = Math.min(amp, R * .12);
  for (let i = 0; i <= n; i++){ const th = i / n * TAU; const r = R - a + a * Math.abs(Math.sin(k * th)); const px = x + Math.cos(th) * r, py = y + Math.sin(th) * r; i ? p.lineTo(px, py) : p.moveTo(px, py); }
  p.closePath();
}
// r3 colour script (visual juror, jury_r3_visual.md §2): every ground colour comes from the key visual's 11-step light
// ladder; each section owns one window of it (N navy / R royal / S the key visual's own sky / P pale sky / H high key)
// and neighbours differ. [centre, middle, edge] of the radial sky. Changes between windows are always gradual.
const TONES = {
  N: ['#0771e4', '#03368b', '#03368b'], R: ['#0874ff', '#0771e4', '#03368b'], S: ['#12abf4', '#0a9ef7', '#0771e4'],
  P: ['#7bdcfa', '#2cbff8', '#0ea4f2'], H: ['#e7ffff', '#9ee9ff', '#7bdcfa'] };
const toneMix = (a, b, u) => u <= 0 ? TONES[a] : u >= 1 ? TONES[b] : TONES[a].map((c, i) => lerpCol(c, TONES[b][i], u));
let SKYT = null;   // set per scene by drawScene (k_render.js); null = the key visual's own sky (S)
// sky background: deeper toward the corners, centred on the disc
function skyBg(g, cx, cy, k = 1){
  const T = SKYT || TONES.S, gr = g.createRadialGradient(cx, cy, 0, cx, cy, 1500 * k);
  gr.addColorStop(0, T[0]); gr.addColorStop(.45, T[1]); gr.addColorStop(1, T[2]);
  g.fillStyle = gr; g.fillRect(-W, -H, W * 3, H * 3);
}
// the big sky disc with its darker collar
function disc(g, x, y, R, collar = 1){
  if (R <= 0) return;
  if (collar > 0) circle(g, x, y, R * (1 + .075 * collar), K.ring);
  const gr = g.createRadialGradient(x - R * .1, y - R * .05, 0, x, y, R);
  gr.addColorStop(0, K.disc0); gr.addColorStop(.75, '#22b9f7'); gr.addColorStop(1, K.disc1);
  g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = gr; g.fill();
}
// slender triangle confetti; flip (0..1 turn) squashes it like a card turning in the air
const TRI = [0, -.62, .36, .5, -.3, .34];
function tri(g, x, y, s, rot, flip, col){ withT(g, x, y, rot, s, () => { g.scale(Math.cos(flip * TAU) || .02, 1); poly(g, TRI, col); }); }
// white swoosh line along a path fn(u)->[x,y]; drawn from u0 to u1 with tapered tips
function swoosh(g, path, u0, u1, w, col = K.white, n = 80){
  if (u1 - u0 < .002) return;
  const L = [], R = [];
  for (let i = 0; i <= n; i++){
    const u = lerp(u0, u1, i / n), p = path(u), q = path(Math.min(1, u + .002)), p0 = path(Math.max(0, u - .002));
    let dx = q[0] - p0[0], dy = q[1] - p0[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const tp = Math.min(1, i / n * 7, (n - i) / n * 9); const h = w * .5 * tp;
    L.push(p[0] - dy * h, p[1] + dx * h); R.push(p[0] + dy * h, p[1] - dx * h);
  }
  g.beginPath(); g.moveTo(L[0], L[1]); for (let i = 2; i < L.length; i += 2) g.lineTo(L[i], L[i + 1]); for (let i = R.length - 2; i >= 0; i -= 2) g.lineTo(R[i], R[i + 1]); g.closePath(); g.fillStyle = col; g.fill();
}
// halftone dots inside the current clip
// halftone dots and stripes are filled from cached canvas patterns (one tile each), scaled and moved by the pattern matrix
const PAT = {};
function dotPattern(g, col, ratio){
  const key = 'd' + col + Math.round(ratio * 100); if (PAT[key]) return PAT[key];
  const B = 64, c = makeCanvas(B, B * 2), x = c.getContext('2d'), r = ratio * B; x.fillStyle = col;
  for (const [px, py] of [[0, 0], [B, 0], [0, 2 * B], [B, 2 * B], [B / 2, B]]){ x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); }
  return PAT[key] = g.createPattern(c, 'repeat');
}
function dots(g, x0, y0, x1, y1, sp, r, col, ox = 0, oy = 0){
  if (sp < 1.5 || r <= 0) return;
  const pt = dotPattern(g, col, r / sp); pt.setTransform(new DOMMatrix().translate(ox, oy).scale(sp / 64));
  g.fillStyle = pt; g.fillRect(x0 - sp, y0 - sp, x1 - x0 + 2 * sp, y1 - y0 + 2 * sp);
}
function stripePattern(g, cols){
  const key = 's' + cols.join(''); if (PAT[key]) return PAT[key];
  const c = makeCanvas(64 * cols.length, 4), x = c.getContext('2d'); cols.forEach((cl, i) => { x.fillStyle = cl; x.fillRect(i * 64, 0, 64.5, 4); });
  return PAT[key] = g.createPattern(c, 'repeat');
}
// diagonal stripes (navy / royal / light) inside the current clip
function stripes(g, cx, cy, ang, w, off, cols = [K.navy, K.royal, K.navy, K.light]){
  if (w <= .3) return;
  const P = w * cols.length, o = ((off % P) + P) % P;
  const pt = stripePattern(g, cols); pt.setTransform(new DOMMatrix().translate(cx, cy).rotate(ang * 180 / Math.PI).translate(-2600 - P + o, 0).scale(w / 64, 1));
  g.fillStyle = pt; g.fillRect(-W, -H, W * 3, H * 3);
}

// ------------------------------------------------------------------ cloud sprites (pre-rendered once)
function makeCanvas(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function island(g, R, cx, cy, size, col){
  const p = new Path2D(), m = 4 + ((R() * 4) | 0), a0 = R() * TAU, span = 1.2 + R() * 1.6, rc = size * (.5 + R() * .4);
  for (let k = 0; k < m; k++){ const a = a0 + span * k / (m - 1); const r = size * (.28 + R() * .3); scallop(p, cx + Math.cos(a) * rc * (.6 + .5 * R()), cy + Math.sin(a) * rc * .6, r, 6, 1.3); }
  g.fillStyle = col; g.fill(p);
}
function shadeIslands(g, R, blobs, w, h, n){
  for (let i = 0; i < n; i++){
    const b = blobs[(R() * blobs.length) | 0];
    const cx = b[0] - b[2] * (.1 + .35 * R()), cy = b[1] + b[2] * (R() * .5 - .1), size = b[2] * (.38 + R() * .3);
    const low = cy > h * .68;
    const c0 = low ? (R() < .5 ? K.shade1 : '#93b6f4') : (R() < .65 ? K.shade0 : K.shade1);
    island(g, R, cx, cy, size, c0);
    if (R() < .45) island(g, R, cx - size * .15, cy + size * .15, size * .45, c0 === K.shade0 ? K.shade1 : '#8aaaf0');
    if (R() < .4){ const q = new Path2D(); scallop(q, cx + size * (R() - .2) * .5, cy - size * .25, size * (.12 + .1 * R()), 5, 1); g.fillStyle = K.white; g.fill(q); }
  }
}
function makeCumulus(seed, w, h, tower = .5, solid = false){
  const R = mulberry32(seed), c = makeCanvas(w, h), g = c.getContext('2d');
  const blobs = []; let nb = 5 + ((R() * 3) | 0);
  if (solid){ const r0 = Math.min(h * .15, w * .12); nb = Math.ceil(w * .74 / (r0 * 1.15)) + 1; }
  for (let i = 0; i < nb; i++){ const r = Math.min(h * (.12 + .06 * R()), w * .12) * (solid ? 1.12 : 1); blobs.push([w * (.13 + .74 * i / (nb - 1)) + (R() - .5) * w * (solid ? .01 : .04), h - r * 1.08, r]); }
  const cx = w * (.3 + .4 * R());
  const maxB = Math.round(30 + 30 * tower), spread = 2.5 - 1.3 * tower;
  for (let k = 0; k < 900 && blobs.length < maxB; k++){
    const hi = !solid && tower > .7 && R() < .55 ? blobs.slice().sort((a1, b1) => a1[1] - b1[1]).slice(0, Math.max(2, Math.ceil(blobs.length * .25))) : blobs;
    const p = hi[(R() * hi.length) | 0], a = -Math.PI / 2 + (R() - .5) * spread, r = Math.max(h * .05, p[2] * (tower > .8 ? .84 + .18 * R() : .66 + .28 * R())), d = (p[2] + r) * .5;
    const x = p[0] + Math.cos(a) * d, y = p[1] + Math.sin(a) * d;
    const env = h * (.2 + .62 * tower) * Math.pow(Math.max(0, 1 - Math.abs((x - cx) / (w * .5))), .8);
    if (h * .88 - (y - r) > env + h * .14 || x - r < 10 || x + r > w - 10 || y - r < 10 || y + r > h - 6) continue;
    blobs.push([x, y, r]);
  }
  const inside = (x, y, rr) => blobs.some(b => Math.hypot(x - b[0], y - b[1]) < b[2] - rr * 1.1);
  const puffs = [];
  for (const b of blobs){ const m = Math.round(b[2] * TAU / 60); for (let j = 0; j < m; j++){ const a = -Math.PI * (R() * 1.15 - .075) + (R() < .2 ? Math.PI * .8 : 0); const r = 14 + R() * 26; const x = b[0] + Math.cos(a) * (b[2] - r * .35), y = b[1] + Math.sin(a) * (b[2] - r * .35);
    if (x - r > 4 && x + r < w - 4 && y - r > 4 && y + r < h - 2 && !inside(x, y, r)) puffs.push([x, y, r]); } }
  const body = new Path2D(); for (const b of blobs) scallop(body, b[0], b[1], b[2], 8, 1.6); for (const p of puffs) scallop(body, p[0], p[1], p[2], 6, 1.3);
  if (solid){ const pts = blobs.map(b => [b[0], b[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = []; for (const q of pts){ while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); } for (let i = pts.length - 1; i >= 0; i--){ const q = pts[i]; while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    const hull = lo.slice(0, -1).concat(up.slice(0, -1)); if (hull.length > 2){ body.moveTo(hull[0][0], hull[0][1]); for (const q of hull) body.lineTo(q[0], q[1]); body.closePath();
      // lobes along each hull edge, so the core never shows a straight side
      const rad = q => { const b = blobs.find(bb => bb[0] === q[0] && bb[1] === q[1]); return b ? b[2] : 40; };
      for (let i = 0; i < hull.length; i++){ const A = hull[i], Bq = hull[(i + 1) % hull.length], ra = rad(A), rb = rad(Bq), L = Math.hypot(Bq[0] - A[0], Bq[1] - A[1]); const n = Math.floor(L / (Math.min(ra, rb) * .8));
        for (let k = 1; k < n; k++){ const u = k / n, rr = lerp(ra, rb, u) * (.78 + .12 * Math.sin(k * 2.3)); scallop(body, lerp(A[0], Bq[0], u), lerp(A[1], Bq[1], u), rr, 7, 1.5); } } } }
  g.fillStyle = K.white; g.fill(body);
  g.save(); g.clip(body);
  // layered lobes: shaded back lobes show through the gaps between white front lobes (cel-shaded cumulus)
  const order = blobs.slice().sort((a, b) => a[1] - b[1]);
  for (const b of order){
    const dark = clamp((b[1] / h - .45) * 1.3 + (1 - b[0] / w) * .25);
    const sh = new Path2D(); scallop(sh, b[0] - b[2] * .16, b[1] + b[2] * .12, b[2] * .9, 7, 1.5);
    g.fillStyle = dark > .8 ? '#8fb0f2' : dark > .5 ? K.shade1 : K.shade0; g.fill(sh);
    if (dark > .35){ const sh2 = new Path2D(); scallop(sh2, b[0] - b[2] * .32, b[1] + b[2] * .3, b[2] * .5, 6, 1.3); g.fillStyle = dark > .85 ? K.shade2 : dark > .55 ? '#8fb0f2' : K.shade1; g.fill(sh2); }
    const wl = new Path2D(); const m = 4 + ((R() * 3) | 0);
    for (let k = 0; k < m; k++){ const a = -Math.PI * (.05 + .9 * R()) + .3, d = b[2] * (.25 + .4 * R()), r = b[2] * (.32 + .22 * R()); scallop(wl, b[0] + Math.cos(a) * d + b[2] * .08, b[1] + Math.sin(a) * d - b[2] * .05, r, 6, 1.3); }
    scallop(wl, b[0] + b[2] * .12, b[1] - b[2] * .14, b[2] * .62, 7, 1.4);
    g.fillStyle = K.white; g.fill(wl);
  }
  // a few loose white specks inside shadows
  for (let i = 0; i < blobs.length * .4; i++){ const b = blobs[(R() * blobs.length) | 0]; const q = new Path2D(); scallop(q, b[0] - b[2] * (.2 + .3 * R()), b[1] + b[2] * (.1 + .3 * R()), b[2] * (.08 + .07 * R()), 5, 1); g.fillStyle = K.white; g.fill(q); }
  g.restore();
  return c;
}
// streak cloud: a row of puffs along a diagonal, thin wisps trailing at the tail, shaded underside
function makeStreak(seed, w, h){
  const R = mulberry32(seed), c = makeCanvas(w, h), g = c.getContext('2d');
  const bend = (R() - .5) * .3;
  const spine = u => [w * (.04 + .86 * u), h * (.6 - .14 * u + Math.sin(u * Math.PI) * bend * .5)];
  const th = u => h * .3 * (.12 + .88 * Math.pow(Math.sin(Math.min(1, u * 1.15) * Math.PI * .5), .8));
  const body = new Path2D();
  const N = 50, top = [], bot = [];
  for (let i = 0; i <= N; i++){ const u = i / N, q = spine(u), t = th(u); top.push([q[0], q[1] - t * .1]); bot.push([q[0], q[1] + t * .5]); }
  body.moveTo(top[0][0], top[0][1]); for (const q of top) body.lineTo(q[0], q[1]); for (let i = bot.length - 1; i >= 0; i--) body.lineTo(bot[i][0], bot[i][1]); body.closePath();
  for (let u = .12; u < .97; u += .045 + .05 * R()){ const q = spine(u), t = th(u); scallop(body, q[0] + (R() - .5) * 8, q[1] - t * .15, t * (.42 + .4 * R()), 6, 1.3); }
  const hq = spine(.93); scallop(body, hq[0], hq[1], th(.93) * .7, 6, 1.4);
  // trailing wisps
  for (let k = 0; k < 3; k++){ const off = (k - 1) * h * .07; body.moveTo(w * .02, h * .66 + off + k * 4); body.quadraticCurveTo(w * .14, h * .6 + off, w * .3, h * .54 + off * .5); body.lineTo(w * .3, h * .56 + off * .5 + 5); body.quadraticCurveTo(w * .15, h * .63 + off, w * .02, h * .66 + off + k * 4); }
  g.fillStyle = K.white; g.fill(body);
  g.save(); g.clip(body);
  const under = new Path2D();
  for (let i = 0; i <= N; i++){ const u = i / N, q = spine(u), t = th(u); i ? under.lineTo(q[0], q[1] + t * .12) : under.moveTo(q[0], q[1] + t * .12); }
  for (let i = N; i >= 0; i--){ const u = i / N, q = spine(u), t = th(u); under.lineTo(q[0], q[1] + t * .7); }
  under.closePath(); g.fillStyle = K.shade0; g.fill(under);
  for (let u = .2; u < .95; u += .08){ const q = spine(u), t = th(u); const ip = new Path2D(); scallop(ip, q[0] - t * .2, q[1] + t * .32, t * (.2 + .15 * R()), 5, 1.1); g.fillStyle = K.shade1; g.fill(ip); }
  g.restore();
  return c;
}
// small flat sky-blue puffs (no white)
function makePuff(seed, w, h, col = K.puff){
  const R = mulberry32(seed), c = makeCanvas(w, h), g = c.getContext('2d');
  const p = new Path2D(); const n = 4 + ((R() * 4) | 0);
  for (let i = 0; i < n; i++){ const u = i / (n - 1); const r = h * (.16 + .16 * Math.sin(u * Math.PI)) * (.8 + .4 * R()); scallop(p, w * (.15 + .7 * u), h * .62 - r * .5, r, 7, 1.8); }
  p.rect(w * .15, h * .6, w * .7, h * .06);
  g.fillStyle = col; g.fill(p);
  return c;
}
const SPR = { cu: [], st: [], pf: [], cu2: [] };
function buildSprites(){
  const sizes = [[1100, 700, .8], [900, 560, .55], [1000, 520, .35], [700, 1100, 1], [1200, 640, .5], [700, 420, .45], [900, 760, 1], [1000, 480, .3]];
  sizes.forEach(([w, h, tw], i) => SPR.cu.push(makeCumulus(101 + i * 17, w, h, tw)));
  for (let i = 0; i < 6; i++) SPR.st.push(makeStreak(301 + i * 13, 900, 330));
  for (let i = 0; i < 6; i++) SPR.pf.push(makePuff(501 + i * 7, 360, 160, i % 3 === 2 ? K.puff2 : K.puff));
  [[700, 420, .45], [1100, 560, .4], [1000, 480, .3], [900, 760, .8], [900, 560, .55], [1200, 600, .35], [1000, 700, .7], [900, 800, .85], [1000, 620, .6], [900, 520, .5]].forEach(([w, h, tw], i) => SPR.cu2.push(makeCumulus(5003 + i * 61, w, h, tw, true)));
}
// draw a sprite centred at x,y with scale and rotation (sprite pixels -> 1920 space)
function sprite(g, img, x, y, s, rot = 0, flip = false){
  g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.scale(flip ? -s : s, s); g.drawImage(img, -img.width / 2, -img.height / 2); g.restore();
}
