
// ------------------------------------------------------------------ the key-visual composition ("home shot"), animated
// a: assembly 0..1 per layer (clouds from the edges, bands sweep in, lines draw), t: seconds for idle motion
// the nine triangles [x, y, size, rot, colour] and the five white lines (u -> [x, y], t = seconds) of the composition
// (shared with the finale, which writes the lines and lands the triangles itself)
const HOME_TRIS = [[180, 230, 50, 2.2, K.azure], [310, 425, 36, 1.1, K.white], [80, 690, 44, -.4, K.mint], [130, 760, 64, -.9, K.azure], [1755, 90, 40, 2.6, K.white], [1850, 180, 70, .3, K.navy], [1800, 265, 46, 2.9, K.mint], [1880, 730, 56, 3.3, K.cyan], [1815, 975, 44, 2.6, K.mint]];
const HOME_LINES = t => [
  u => [lerp(-40, 1960, u), 225 + Math.sin(u * 3.1 + .3) * -170 + u * 330 + Math.sin(t * .6 + u * 2) * 8],
  u => [lerp(300, 1960, u), 800 - u * 420 + Math.sin(u * 3) * 30 + Math.sin(t * .7 + u * 3) * 6],
  u => [lerp(320, 1780, u), 790 - u * 330 + Math.sin(u * 2.4) * 40],
  u => [lerp(780, 1960, u), 1080 - u * 340 + Math.sin(u * 2) * 20 + Math.sin(t * .5) * 6],
  u => [lerp(640, 1960, u), 1035 - u * 135 - Math.sin(u * 2.5) * 15],
];
const HOME_LW = [11, 7, 5, 12, 8];
function homeShot(g, s, a = {}, set = 'A'){
  const C = n => 'H' + set + '_' + n;
  const A = k => a[k] === undefined ? 1 : a[k];
  const t = s.T, bt = s.beat, kp = pulse(bt, 5);
  // r18: optional a.breath (px, already smoothed and enveloped by the caller): the groups push outward from the middle,
  // each its own way (kvHold breathes on the kick like the finale's reunion); default 0, so every other use is unchanged
  const brh = a.breath || 0;
  if (!a.noSky) skyBg(g, 960, 540);   // r8: a.noSky / a.noDisc let radiance's last bar build the key visual round its own sun
  // collar + disc
  // r5: optional a.discR / a.discXY (outro: the sun shrinks to nothing and drifts); defaults keep assemble unchanged
  if (!a.noDisc){ const dX = a.discXY ? a.discXY[0] : 960 + Math.sin(t * .2) * 10, dY = a.discXY ? a.discXY[1] : 540, dR = a.discR !== undefined ? a.discR : 720 * (.2 + .8 * eout(A('disc'))) * (1 + .012 * kp);
    // r6d (research #2): optional a.ringSeg(k) = alpha of the collar's 8 segments (the outro's countdown to the triangle)
    const segs = a.ringSeg && dR > 0 && a.ringSeg(0) < 1;   // full collar (no wedge seams) until the countdown starts
    if (segs) for (let k = 0; k < 8; k++){ const al = a.ringSeg(k); if (al <= 0) continue; const a0 = -Math.PI / 2 + k * TAU / 8, a1 = a0 + TAU / 8;
      g.globalAlpha = al; g.beginPath(); g.arc(dX, dY, dR * 1.075, a0, a1); g.arc(dX, dY, dR, a1, a0, true); g.closePath(); g.fillStyle = K.ring; g.fill(); g.globalAlpha = 1; }
    disc(g, dX, dY, dR, segs ? 0 : 1);
    // r24b: optional a.discDim (0..1) darkens the whole disc with the dusk (a flat deep blue over it)
    if (a.discDim > 0 && dR > 0){ g.globalAlpha = Math.min(1, a.discDim); circle(g, dX, dY, dR * 1.08, '#0a5fcf'); g.globalAlpha = 1; } }
  // top-left corner: navy arc band with dots, stripes wedge
  const tl = A('corners');
  if (tl > 0){
    g.save(); g.translate(-420 * (1 - eout(tl)) - brh, -320 * (1 - eout(tl)) - .7 * brh);
    g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(330, 0); g.quadraticCurveTo(120, 90, 0, 230); g.closePath(); g.clip(); stripes(g, 0, 0, .78, 18, t * 40, [K.royal, K.navy]); g.restore();
    g.beginPath(); g.arc(960, 540, 1010, Math.PI * 1.08, Math.PI * 1.3); g.arc(960, 540, 940, Math.PI * 1.3, Math.PI * 1.08, true); g.closePath(); g.fillStyle = K.navy; g.fill();
    // r11 (review: clean up the white dots in the upper left at 34 s): optional a.tlDots scales these dots
    // (kvHold shrinks them away over its first bar); default 1, so assemble is unchanged
    const td = a.tlDots === undefined ? 1 : a.tlDots;
    if (td > .05){
    g.save(); g.beginPath(); g.arc(960, 540, 1010, Math.PI * 1.12, Math.PI * 1.24); g.arc(960, 540, 940, Math.PI * 1.24, Math.PI * 1.12, true); g.closePath(); g.clip(); dots(g, -100, -200, 700, 500, 20, 4.2 * td, K.white, t * 20, 0); g.restore();
    g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(150, 0); g.lineTo(0, 120); g.closePath(); g.clip(); dots(g, 0, 0, 160, 130, 17, 3.6 * td, K.white); g.restore(); }
    g.restore();
  }
  // bottom-right: curved band of diagonal stripes, dots on white below
  const br = A('stripes');
  if (br > 0){
    g.save(); g.translate(560 * (1 - eout(br)) + brh, 420 * (1 - eout(br)) + .7 * brh);
    const band = () => { g.beginPath(); g.moveTo(1470, 1100); g.quadraticCurveTo(1700, 820, 1940, 470); g.lineTo(2100, 470); g.lineTo(2100, 1200); g.lineTo(1470, 1200); g.closePath(); };
    // r6: optional a.stripeEvery (beats per step, default 2; settle's kick bars step every beat)
    // (r20 audit, advocate + framescan: the wedge snapped a notch every 2 beats at 34.5 / 35.2 / 35.9 / 36.5, a visible
    // twitch) each notch now glides over 80 % of its interval (eio): the beat still shows, the snap is gone
    g.save(); band(); g.clip(); stripes(g, 1750, 850, -.72, 40, stepEase(bt / (a.stripeEvery || 2), .8, eio) * 80, [K.navy, K.royal, K.navy, K.light]); g.restore();
    g.save(); g.beginPath(); g.moveTo(1960, 520); g.quadraticCurveTo(1860, 600, 1800, 640); g.lineTo(1960, 740); g.closePath(); g.clip(); rect(g, 1780, 500, 200, 260, K.navy); dots(g, 1780, 500, 1960, 760, 19, 3.8, K.white, 0, t * 15); g.restore();
    g.save(); g.beginPath(); g.moveTo(1960, 900); g.quadraticCurveTo(1860, 1000, 1800, 1090); g.lineTo(1960, 1090); g.closePath(); g.clip(); rect(g, 1780, 880, 200, 220, K.white); dots(g, 1780, 880, 1960, 1090, 15, 2.6, K.azure); g.restore();
    g.restore();
  }
  // white swoosh lines
  const ln = A('lines');
  if (ln > 0){
    const L = HOME_LINES(t), ws = HOME_LW;
    L.forEach((f, i) => { const d = eout(clamp(ln * 1.6 - i * .15)); swoosh(g, f, 0, d, ws[i]); });
  }
  // clouds: left tower, bottom bank, right group, top-right streaks
  const cl = A('clouds');
  const ct = a.tower !== undefined ? Math.min(a.tower, cl) : cl;   // r6c: optional a.tower lets the tower leave before the bank (settle)
  // r24: optional a.cloudFx = { tower, bank, right: [dx, dy, alpha] } moves / fades the cloud groups on their own (the outro
  // lets them rise, thin out or leave sideways; reversing `clouds` would slide the bank DOWN, which the rules forbid)
  const fx = k => (a.cloudFx && a.cloudFx[k]) || [0, 0, 1];
  if (ct > 0){
    const e = eout(ct), bob = Math.sin(t * .5) * 6, [fx0, fy0, fa0] = fx('tower');
    if (fa0 > 0){ g.globalAlpha = fa0; cloudS(g, C('tower'), -20 - 500 * (1 - e) - brh + fx0, 450 + bob + fy0, .9); g.globalAlpha = 1; }
  }
  // bottom-left navy arc with dots
  const bl = A('arc');
  // r4: optional a.arcSpin turns the arc by steps (finale); default 0, so assemble is unchanged
  // r16 audit (advocate: leaving at 0:38 by turning, one end swung into the frame and showed its square cut):
  // a.arcSlide makes it leave whole, sliding out down-left (ends always off the frame)
  if (bl > 0){ const r0 = 520, r1 = 580, sl = a.arcSlide ? ein(1 - bl) : 0, ang = a.arcSlide ? 0 : lerp(-1.2, 0, eout(bl)) + (a.arcSpin || 0);
    g.save(); g.translate(-60 - 800 * sl, 1120 + 620 * sl); g.rotate(ang);
    g.beginPath(); g.arc(0, 0, r1, -Math.PI * .5, -Math.PI * .02); g.arc(0, 0, r0, -Math.PI * .02, -Math.PI * .5, true); g.closePath(); g.fillStyle = K.navy; g.fill();
    g.beginPath(); g.arc(0, 0, r1 + 40, -Math.PI * .34, -Math.PI * .04); g.arc(0, 0, r1, -Math.PI * .04, -Math.PI * .34, true); g.closePath(); g.save(); g.clip(); rect(g, -100, -800, 900, 900, K.navy); dots(g, -100, -800, 800, 100, 21, 4.4, K.white); g.restore();
    g.restore(); }
  if (cl > 0){
    const e = eout(cl), bob = a.bob !== undefined ? a.bob : Math.sin(t * .5) * 6;   // r6b: optional a.bob (settle: one bob a bar)
    const [bx0, by0, ba0] = fx('bank'), [rx0, ry0, ra0] = fx('right');
    if (ba0 > 0){ g.globalAlpha = ba0;
    cloudS(g, C('low'), 60 - 600 * (1 - e) - .5 * brh + bx0, 860 + bob * .6 + .6 * brh + by0, 1.15);
    // r6b (visual juror): set B's bank is staggered (b0 up, b4 down) so its top edge rises and falls instead of a flat strip
    const sb = set === 'B' ? [-90, 60] : [0, 0];
    cloudS(g, C('b0'), 480 + bx0, 1150 + sb[0] + 400 * (1 - e) - bob * .5 + by0, .95); cloudS(g, C('b2'), 860 + bx0, 1190 + 420 * (1 - e) + bob * .3 + by0, .8); cloudS(g, C('b7'), 1450 + bx0, 1180 + 420 * (1 - e) - bob * .3 + by0, .75);
    cloudS(g, C('b4'), 1150 + bx0, 1160 + sb[1] + 450 * (1 - e) + bob * .4 + by0, .8); g.globalAlpha = 1; }
    if (ra0 > 0){ g.globalAlpha = ra0;
    cloudS(g, C('r1'), 1720 + 500 * (1 - e) + brh + rx0, 1120 - bob * .3 + .5 * brh + ry0, .7, 0, true);
    cloudS(g, C('r5'), 1820 + 400 * (1 - e) + brh + rx0, 560 + bob * .5 + ry0, .55, 0, true);
    cloudS(g, C('tr'), 1790 + 450 * (1 - e) + brh + rx0, 30 + bob * .5 - .5 * brh + ry0, .5, 0, true); g.globalAlpha = 1; }
  }
  // triangles
  const tr = A('tris');
  if (tr > 0){
    const P = HOME_TRIS;
    // r4: optional a.triPulse(i) adds to a triangle's scale (the snare lights existing triangles); default none
    // r24: optional a.triScale(i) replaces the staggered pop (the last night grows each triangle in as its constellation lands)
    P.forEach(([x, y, sz, r, c], i) => { const sc = a.triScale ? a.triScale(i) : eback(clamp(tr * 2 - i * .1)); if (sc <= 0) return; tri(g, x + Math.sin(t * .9 + i) * 6, y + Math.cos(t * .8 + i) * 6, sz * sc * (1 + (a.triPulse ? a.triPulse(i) : 0)), r + Math.sin(t * .6 + i) * .1, Math.sin(t * .5 + i) * .08, c); });
  }
}
