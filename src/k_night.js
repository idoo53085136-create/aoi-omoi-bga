
// ================================================================== night sky (r7, 10-08: trance and the final drop become a night sky)
// Everything flat and on the key visual's ladder (visual juror r7): no black, no translucent white glows.
const NIGHT = { top: '#03368b', mid: '#0550b8', bot: '#0771e4' };
// vertical night gradient; lift 0..1 eases it toward the day sky (dawn)
function nightSky(g, lift = 0){
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, lerpCol(NIGHT.top, '#0a9ef7', lift)); gr.addColorStop(.6, lerpCol(NIGHT.mid, '#2cbff8', lift)); gr.addColorStop(1, lerpCol(NIGHT.bot, '#7bdcfa', lift));
  g.fillStyle = gr; g.fillRect(-W, -H, 3 * W, 3 * H);
}
// three fixed layers (deterministic); [x, y, r, order] -- order = when the star lights in a "stars come on" reveal
let STARS = null;
function buildStars(){
  const R = mulberry32(4242), mk = (n, r0, r1) => Array.from({ length: n }, () => { const x = R() * 2200 - 140, y = R() * 1140 - 30; return { x, y, r: r0 + R() * (r1 - r0), o: clamp(y / 1100 + R() * .15), h: R() }; });
  STARS = { far: mk(220, 1, 1.6), mid: mk(70, 2.6, 4), near: mk(12, 9, 15) };
  // near stars stay in the outer thirds (never over a centred subject)
  STARS.near.forEach((p, i) => { if (Math.abs(p.x - 960) < 420) p.x += (p.x < 960 ? -1 : 1) * 520; });
  // r18 (jury_r18: the final drop's time-lapse turns ~3x faster, up to ~1 rad round the pole (1600, -300)): the field
  // gets a copy turned back by 1 rad, kept only where it lies outside the field. At any turn r <= 1 every point of the
  // frame is then covered by exactly one of the two (the field star from r back, or the copy), so the sky that turns in
  // is never empty or doubled (appended: the beat-lit indices are unchanged; off frame for every unturned use)
  // (r23: the last night turns up to ~1.6 rad) a second copy turned back by 2 rad, kept only where neither the field nor the
  // first copy lies, so every turn up to 2 rad is covered exactly once
  const P0 = [1600, -300], inF = p => p.x > -140 && p.x < 2060 && p.y > -30 && p.y < 1110, rot = (p, r) => { const dx = p.x - P0[0], dy = p.y - P0[1], c = Math.cos(r), sn = Math.sin(r); return Object.assign({}, p, { x: P0[0] + dx * c - dy * sn, y: P0[1] + dx * sn + dy * c, o: 0 }); };
  for (const k of ['far', 'mid', 'near']){ const add = [];
    for (const p of STARS[k]){ const q1 = rot(p, -1), q2 = rot(p, -2); if (!inF(q1)) add.push(q1); if (!inF(q2) && !inF(q1)) add.push(q2); }
    STARS[k].push(...add); }
}
// reveal 0..1 lights stars from the zenith down; kick lights 3 mid stars, snare 1 near star (no random twinkle)
function drawStars(g, s, reveal = 1, alpha = 1){
  if (!STARS) buildStars();
  if (alpha <= 0) return;
  const on = p => clamp((reveal * 1.15 - p.o) / .15), bt = Math.floor(s.beat), kk = s.k, sn = snareAt(s.t);
  g.fillStyle = '#12abf4'; g.globalAlpha = alpha; g.beginPath();
  for (const p of STARS.far){ const a = on(p); if (a <= 0) continue; const r = p.r * a; g.moveTo(p.x + r, p.y); g.arc(p.x, p.y, r, 0, TAU); }
  g.fill();
  // r8d (review: some stars appeared and then vanished abruptly): the lit set used to switch on the beat boundary while the
  // star was still swollen; now each star that is picked on a beat swells and then fades smoothly over the next 2 beats
  // (an exponential from its own beat), and its colour eases instead of flipping
  const fade = (pick, k) => { let v = 0; for (let b = bt - 2; b <= bt; b++) if (pick(b)) v = Math.max(v, Math.exp(-(s.beat - b) * k)); return v; };
  STARS.mid.forEach((p, i) => { const a = on(p); if (a <= 0) return; const lit = fade(b => i % 23 === (b * 7) % 23 || i % 23 === (b * 7 + 5) % 23 || i % 23 === (b * 7 + 11) % 23, 2.2);
    circle(g, p.x, p.y, p.r * a * (1 + .9 * lit), lerpCol('#9ee9ff', '#e7ffff', lit)); });
  STARS.near.forEach((p, i) => { const a = on(p); if (a <= 0) return; const lit = fade(b => i === ((b % 12) + 12) % 12, 1.6);
    // r18 (jury_r18: no four-point glints): the near stars are round, a small core in a faint halo (like the outro's)
    const al = g.globalAlpha; softGlow(g, p.x, p.y, p.r * a * (1 + .6 * lit), al, i % 6 === 2 ? K.mint : '#e7ffff'); g.globalAlpha = al; });
  g.globalAlpha = 1;
}
// one flat meteor: a tapered solid band (glow band #0874ff under a cream -> #9ee9ff core) with a four-point head.
// u = 0..1 life; the head flies along the angle with eout, the tail grows to len and then is reeled in
// r20 (audit, fresh eyes: crossing the finale's pale day disc, the #0874ff glow band read as a dark double scratch):
// optional glow colour (the finale passes a pale one)
function meteor(g, x0, y0, ang, dist, len, u, w = 10, round = true, glow = '#0874ff'){   // r18: round heads everywhere (one meteor for the song)
  if (u <= 0 || u >= 1) return;
  const hd = eout(u) * dist, tl = Math.max(0, hd - len * Math.min(1, u * 3)) + (u > .6 ? (hd - Math.max(0, hd - len)) * ein((u - .6) / .4) : 0);
  w *= 1 - eio(span(u, .75, 1));   // r7 (health: one-frame JUMPs as meteors ended): the band and head thin to nothing
  if (w < .3) return;
  const c = Math.cos(ang), sn = Math.sin(ang), hx = x0 + c * hd, hy = y0 + sn * hd, tx = x0 + c * tl, ty = y0 + sn * tl, nx = -sn, ny = c;
  const band = (ww, col) => { g.beginPath(); g.moveTo(tx, ty); g.lineTo(hx + nx * ww, hy + ny * ww); g.arc(hx, hy, ww, Math.atan2(ny, nx), Math.atan2(-ny, -nx)); g.closePath(); g.fillStyle = col; g.fill(); };
  band(w * 1.9, glow); band(w * .9, '#9ee9ff'); band(w * .45, '#fffef2');
  if (round) circle(g, hx, hy, w * 1.15 * (1 - .3 * u), '#fffef2');   // (r17b visual: no four-point glints in the finale)
  else star4(g, hx, hy, w * 2.4 * (1 - .4 * u), ang * .5, '#e7ffff');
}
// a flat bloom (visual juror r7, fresh eyes): 6 key-visual triangles open like petals around (x, y) with a mint centre and
// one thin ring; u = 0..1 over its life (eback open, then it fades by shrinking)
function bloom(g, x, y, u, sz = 1, rot = 0, r0 = 0){
  if (u <= 0 || u >= 1) return;
  // r0 > 0: the petals open round a subject of that radius (the sun), with no centre dot
  const op = eback(clamp(u / .3)), fade = 1 - ein(span(u, .55, 1)), d = r0 + 150 * sz * eout(clamp(u / .4)), r = r0 + 330 * sz * eout(u);
  g.globalAlpha = fade; ring(g, x, y, r, r + 8 * sz * (1 - u), '#9ee9ff'); g.globalAlpha = 1;
  for (let i = 0; i < 6; i++){ const a = rot + i * TAU / 6 + u * .6; triK(g, x + Math.cos(a) * d, y + Math.sin(a) * d, 46 * sz * op * fade, a + Math.PI / 2, 0, i % 2 ? '#e7ffff' : '#9ee9ff', 3); }
  if (!r0) circle(g, x, y, 22 * sz * op * fade, K.mint);
}
// a flat firework (research night_sky_r7, tamao / THE SEASONS): 12 spokes, then a ring of 24 dots drifting out; u = 0..1
function firework(g, x, y, u, R = 300, cols = ['#e7ffff', '#9ee9ff', '#42cefb'], ns = 12){
  if (u <= 0 || u >= 1) return;
  const e = eout(clamp(u / .5)), fade = 1 - ein(span(u, .5, 1));
  g.lineCap = 'round';
  for (let i = 0; i < ns; i++){ const a = i * TAU / ns, r0 = R * .25 * e + R * .55 * ein(span(u, .3, 1)), r1 = R * e;
    if (r1 - r0 < 2) continue; g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.strokeStyle = cols[i % 3]; g.lineWidth = 5 * (1 - .6 * u) * fade; g.stroke(); }
  for (let i = 0; i < ns * 2; i++){ const a = (i + .5) * TAU / (ns * 2), r = R * 1.15 * e; circle(g, x + Math.cos(a) * r, y + Math.sin(a) * r + 40 * u * u, 6 * fade, cols[(i + 1) % 3]); }
}
// star trails: n concentric arcs around (cx, cy); each arc spans len radians and the whole field is turned by rot
function starTrails(g, cx, cy, n, len, rot, alpha = 1){
  if (!STARS) buildStars();
  g.globalAlpha = alpha; g.lineCap = 'round';
  for (let i = 0; i < n; i++){ const p = STARS.mid[i % STARS.mid.length], r = Math.hypot(p.x - cx, p.y - cy), a0 = Math.atan2(p.y - cy, p.x - cx) + rot;
    g.beginPath(); g.arc(cx, cy, r, a0 - len, a0); g.strokeStyle = i % 5 === 0 ? '#e7ffff' : i % 2 ? '#9ee9ff' : '#12abf4'; g.lineWidth = i % 5 === 0 ? 3 : 2; g.stroke(); }
  g.globalAlpha = 1;
}
