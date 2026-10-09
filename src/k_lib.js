
// ================================================================== rhythm helpers
const ONSETS = [];
if (KICK) for (let f = 2; f < KICK.length - 2; f++){ const k = KICK[f]; if (k > 120 && k >= KICK[f - 1] && k > KICK[f + 1] && KICK[f - 2] < k - 30) ONSETS.push([f / 60, k / 255, ONSETS.length]); }
function onsetsIn(a, b){ const o = []; for (const e of ONSETS){ if (e[0] >= b) break; if (e[0] >= a) o.push(e); } return o; }
function spawnPops(t, win, f){ for (const n of notesIn(t - win, t + 1e-6)) f(n, t - n.t0); }
// beat events: fn(beatIndex, ageSeconds) for beats in the last `nb` beats, not before `from` (absolute beat)
function beatEvents(s, nb, from, fn, every = 1){ const b0 = Math.floor(s.beat); for (let b = b0 - nb; b <= b0; b++){ if (b < from || b % every) continue; fn(b, (s.beat - b) * BEAT); } }

// white swoosh events: a curve draws in, then its tail chases the head out
function swooshPath(id, mode = 0){
  const R = mulberry32(9000 + id * 7), dir = R() < .5 ? 1 : -1;
  const y0 = H * (.08 + .84 * R()), y1 = H * (.08 + .84 * R()), a1 = (R() - .5) * 760, a2 = (R() - .5) * 420;
  if (mode === 1) return u => { const x = lerp(-140, W + 140, dir > 0 ? u : 1 - u); return [x, H * .5 + (y0 - H * .5) * .55 + Math.sin(u * Math.PI) * a1 * .5 + Math.sin(u * TAU) * a2 * .3]; };
  return u => { const x = lerp(-140, W + 140, dir > 0 ? u : 1 - u); return [x, lerp(y0, y1, u) + Math.sin(u * Math.PI) * a1 + Math.sin(u * TAU) * a2 * .4]; };
}
function swooshEvt(g, id, age, life, w, mode = 0){ if (age < 0 || age > life) return; const hd = eout(age / (life * .45)), tl = ein(clamp((age - life * .25) / (life * .75))); swoosh(g, swooshPath(id, mode), tl, Math.max(tl, hd), w); }
// triangle bursts
function triBurst(g, id, age, x, y, n, dist, life, sz){
  if (age < 0 || age > life) return; const R = mulberry32(7000 + id * 13), e = eout5(age / life), fade = 1 - ein(age / life);
  for (let j = 0; j < n; j++){ const a = R() * TAU, d = dist * (.35 + .65 * R()); tri(g, x + Math.cos(a) * d * e, y + Math.sin(a) * d * e * .8 + age * age * 60, sz * (.5 + .8 * R()) * fade, R() * 6 + age * (R() - .5) * 6, age * (.4 + R()) , TRI_COLS[(R() * 6) | 0]); }
}
// halftone pop (on notes)
function dotPop(g, id, age, life, x, y, r, col = K.white){ if (age < 0 || age > life) return; const e = eback(age / (life * .3)) * (1 - ein(span(age, life * .6, life))); const rr = r * e; if (rr < 2) return; g.save(); g.beginPath(); g.arc(x, y, rr, 0, TAU); g.clip(); dots(g, x - rr, y - rr, x + rr, y + rr, 18, 3.6, col, x, y); g.restore(); }

// ================================================================== 3D fly-through field of key-visual elements
function makeField(seed, n, mix, spread = [3200, 1800], depth = 9000){
  const R = mulberry32(seed), o = [];
  for (let i = 0; i < n; i++){ let r = R(), type = mix[mix.length - 1][0], acc = 0; for (const [t, w] of mix){ acc += w; if (r < acc){ type = t; break; } }
    o.push({ type, x: (R() * 2 - 1) * spread[0], y: (R() * 2 - 1) * spread[1], z: R() * depth, v: (R() * 8) | 0, s: .55 + R() * .9, rot: (R() - .5) * .8, vr: (R() - .5) * 1.6, col: TRI_COLS[(R() * 6) | 0], ph: R() * 6, i }); }
  return { o, depth };
}
function drawObj(g, o, X, Y, k, s){
  const t = s.T;
  switch (o.type){
    case 'cu': sprite(g, SPR.cu[o.v % SPR.cu.length], X, Y, o.s * k, 0, (o.i & 1) === 1); break;
    case 'st': sprite(g, SPR.st[o.v % SPR.st.length], X, Y, o.s * k * .9, -.62 + o.rot * .15); break;
    case 'pf': sprite(g, SPR.pf[o.v % SPR.pf.length], X, Y, o.s * k * 1.3, o.rot * .2); break;
    case 'tri': tri(g, X, Y, 80 * o.s * k * (1 + .25 * pulse(s.beat + o.ph, 6)), o.rot + o.vr * t, (t * .35 + o.ph) * Math.sign(o.vr || 1), o.col); break;
    case 'dot': { const r = 140 * o.s * k; if (r < 3) break; g.save(); g.beginPath(); g.arc(X, Y, r, 0, TAU); g.clip(); if (o.v % 2) circle(g, X, Y, r, K.navy); dots(g, X - r, Y - r, X + r, Y + r, Math.max(5, 24 * k * o.s), Math.max(1, 4.6 * k * o.s), K.white, X, Y); g.restore(); break; }
    case 'stp': { const w = 560 * o.s * k, h = 140 * o.s * k; if (h < 2) break; g.save(); g.translate(X, Y); g.rotate(o.rot + .55); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip(); stripes(g, 0, 0, -.75, Math.max(3, 26 * o.s * k), stepEase(s.beat, .3, eout) * 52 * o.s * k, [K.navy, K.royal, K.navy, K.light]); g.restore(); break; }
  }
}
function drawField(g, s, Fd, camZ, cam = {}){
  const F = cam.F || 1000, depth = Fd.depth, near = cam.near || 70;
  const vis = [];
  for (const o of Fd.o){ const z = ((o.z - camZ) % depth + depth) % depth + near; vis.push([z, o]); }
  vis.sort((a, b) => b[0] - a[0]);
  const cx = W / 2 + (cam.x || 0), cy = H / 2 + (cam.y || 0);
  g.save(); g.translate(W / 2, H / 2); g.rotate(cam.roll || 0); g.scale(cam.zoom || 1, cam.zoom || 1); g.translate(-W / 2, -H / 2);
  for (const [z, o] of vis){
    const k = F / z, X = cx + o.x * k, Y = cy + o.y * k;
    const fade = clamp((depth - z) / (depth * .28)) * clamp((z - near) / 140);
    if (fade <= 0.01) continue;
    const R0 = (o.type === 'cu' ? 650 : o.type === 'st' ? 450 : o.type === 'stp' ? 300 : 160) * o.s * k;
    if (X + R0 < -150 || X - R0 > W + 150 || Y + R0 < -150 || Y - R0 > H + 150) continue;
    g.globalAlpha = fade; drawObj(g, o, X, Y, k, s);
  }
  g.globalAlpha = 1; g.restore();
}
// camera roll that snaps on bar lines (stop-motion feel), with a little overshoot
// r6: optional ease / duration (rings: eout over .25 with no overshoot, rhythm juror)
const rollSnap = (s, step, every = 1, ease = eback, dur = .14) => { const x = s.lbar / every, n = Math.floor(x), e = ease(clamp(fract(x) / dur)); return lerp(Math.sin((n - 1) * 2.3) * step, Math.sin(n * 2.3) * step, e); };
// cloud wall from one side (side -1 left, +1 right) covering 'cover' of the half screen
function cloudWall(g, side, cover, t, seed = 0){
  const edge = side < 0 ? lerp(-420, W / 2 + 60, cover) : lerp(W + 420, W / 2 - 60, cover);
  rect(g, side < 0 ? -W : edge + 200, -100, side < 0 ? edge - 200 + W : W * 2, H + 200, K.white);
  for (let i = 0; i < 5; i++){ const y = -60 + i * 270 + Math.sin(t * .7 + i + seed) * 16; const sp = SPR.cu[[0, 4, 6, 1, 2][(i + seed) % 5]];
    sprite(g, sp, edge - side * sp.width * .3 + side * ((i + seed) % 2) * 80, y, 1.0, 0, side > 0); }
}

function runs(n, pred){ const o = []; let st = -1; for (let i = 0; i <= n; i++){ const ok = i < n && pred(i / n); if (ok && st < 0) st = i; if (!ok && st >= 0){ o.push([st / n, i / n]); st = -1; } } return o; }
function lerpCol(a, b, u){ const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const c = k => Math.round(lerp((pa >> k) & 255, (pb >> k) & 255, clamp(u))); return `rgb(${c(16)},${c(8)},${c(0)})`; }
const SC_ = {};
