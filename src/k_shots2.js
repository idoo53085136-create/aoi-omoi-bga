
// ================================================================== pieces
const LIB = { puff: [] };
function buildLibrary(){ for (let i = 0; i < 8; i++) LIB.puff.push(makePuff2(3500 + i * 59, 320 + (i % 3) * 80, 150 + (i % 2) * 30, i % 3 === 2 ? K.puff2 : K.puff)); }
const TRIS = [[0, -.62, .36, .5, -.3, .34], [0, -.72, .2, .56, -.2, .44], [-.52, -.38, .56, .08, -.18, .5], [0, -.55, .5, .45, -.5, .45], [-.08, -.8, .3, .62, -.26, .18]];
// r11: the song's first and last frame (one white triangle alone on navy): [x, y, size, rot], drawn with TRIS[3]
const BOOK_NAVY = '#03368b', BOOK_TRI = [640, 560, 62, .18];
function triK(g, x, y, s, rot, flip, col, k){ withT(g, x, y, rot, s, () => { g.scale(Math.cos(flip * TAU) || .02, 1); poly(g, TRIS[k % TRIS.length], col); }); }
function dotShape(g, kind, x, y, r, rot, style = 0, sp = 20, off = 0){
  if (r < 2) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.beginPath();
  if (kind === 0) g.arc(0, 0, r, 0, TAU);
  else if (kind === 1){ g.moveTo(0, -r); g.lineTo(r * .9, r * .7); g.lineTo(-r * .9, r * .7); g.closePath(); }
  else { g.arc(0, 0, r, -1.9, 1.9); g.arc(r * .45, 0, r * .8, 1.75, -1.75, true); g.closePath(); }
  g.clip();
  if (style === 1) rect(g, -r * 1.6, -r * 1.6, r * 3.2, r * 3.2, K.navy);
  dots(g, -r * 1.5, -r * 1.5, r * 1.5, r * 1.5, sp, sp * .2, K.white, off, 0);
  g.restore();
}
function navyArc(g, cx, cy, r0, r1, a0, a1, d0, d1, dotOff = 0){
  g.beginPath(); g.arc(cx, cy, r1, a0, a1); g.arc(cx, cy, r0, a1, a0, true); g.closePath(); g.fillStyle = K.navy; g.fill();
  if (d1 > d0){ g.save(); g.beginPath(); g.arc(cx, cy, r1, d0, d1); g.arc(cx, cy, r0, d1, d0, true); g.closePath(); g.clip(); dots(g, cx - r1, cy - r1, cx + r1, cy + r1, 20, 4.2, K.white, dotOff, 0); g.restore(); }
}
function stripeArc(g, cx, cy, r0, r1, a0, a1, off){ g.save(); g.beginPath(); g.arc(cx, cy, r1, a0, a1); g.arc(cx, cy, r0, a1, a0, true); g.closePath(); g.clip(); stripes(g, cx, cy, -.75, 30, off); g.restore(); }
function lines2(g, path, u0, u1, w, gap = 16){
  swoosh(g, path, u0, u1, w);
  swoosh(g, u => { const p = path(u), q = path(Math.min(1, u + .003)); const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [p[0] - dy / l * gap, p[1] + dx / l * gap]; }, u0 + .04, Math.max(u0 + .04, u1 - .02), w * .55);
}
// four-point sparkle: NOT a key-visual shape (jury r3), so it is drawn only in hush (the night sky and the vortex,
// which were approved as they are); everywhere else sparkle4 is a no-op
function sparkle4(){}
// r18 (r15 review: four-point star glints read stiff; prefer soft lights and natural dissipation; jury_r18_*): the glints
// are now a soft round light, a faint halo round a small core (a = alpha, r = halo radius)
// r30: ?hush=S previews hush's four-point stars as soft round lights (hush is locked; the default is unchanged)
const HUSH_VAR = (typeof Q !== 'undefined' && Q.get('hush')) || 'A';
// r26: a halo from r0 (alpha a) feathering out to nothing at r1 (no hard edge to cut rays or bands into a cog)
function softHalo(g, x, y, r0, r1, a, rgb = '255,254,242'){ if (a <= 0 || r1 <= r0) return; const gr = g.createRadialGradient(x, y, r0, x, y, r1); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r1, 0, TAU); g.arc(x, y, r0, TAU, 0, true); g.fill(); }
// r26: a soft band of light round (x, y): transparent at r - w and r + w, alpha a at r (a wave, not a drawn line)
function softBand(g, x, y, r, w, a, rgb = '255,254,242'){ if (a <= 0 || r + w <= 0) return; const r0 = Math.max(0, r - w), gr = g.createRadialGradient(x, y, r0, x, y, r + w), m = (r - r0) / (r + w - r0);
  gr.addColorStop(0, `rgba(${rgb},0)`); gr.addColorStop(m, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r + w, 0, TAU); g.arc(x, y, r0, TAU, 0, true); g.fill(); }
function softGlow(g, x, y, r, a, col = '#fffef2'){ if (r < .5 || a <= 0) return; g.globalAlpha = .28 * a; circle(g, x, y, r, col); g.globalAlpha = a; circle(g, x, y, r * .36, col); g.globalAlpha = 1; }
// r18: a soft light running along a white line given as a path function u -> [x, y] (the finale's comet: the head eases
// along, 20 stamps .006 behind it, white core only at the head; a = 0 at both ends of the run)
function pathLight(g, P, f, a){ const hd = eio(clamp(f)); if (a <= 0) return;
  for (let q = 19; q >= 1; q--){ const vv = hd - q * .006; if (vv <= 0) continue; const [x, y] = P(vv), sz = 1 - q / 20, fa = a * clamp(vv / .03);
    g.globalAlpha = .1 * fa * sz; circle(g, x, y, 34 * sz, '#e7ffff'); g.globalAlpha = .55 * fa * sz; circle(g, x, y, 7 * sz, '#fffef2'); }
  if (hd > 0){ const [x, y] = P(hd); g.globalAlpha = .28 * a * clamp(hd / .03); circle(g, x, y, 34, '#e7ffff'); g.globalAlpha = .9 * a * clamp(hd / .03); circle(g, x, y, 12, '#fffef2'); }
  g.globalAlpha = 1; }
function star4(g, x, y, s, rot, col){ if (s < 1) return; withT(g, x, y, rot, s, () => { g.beginPath(); g.moveTo(0, -1); g.quadraticCurveTo(.12, -.12, 1, 0); g.quadraticCurveTo(.12, .12, 0, 1); g.quadraticCurveTo(-.12, .12, -1, 0); g.quadraticCurveTo(-.12, -.12, 0, -1); g.fillStyle = col; g.fill(); }); }
// flat light rays from a point
function raysFan(g, cx, cy, n, r1, rot, col, frac = .5){ g.beginPath(); for (let i = 0; i < n; i++){ const a = rot + i * TAU / n; g.moveTo(cx, cy); g.arc(cx, cy, r1, a, a + frac * TAU / n); g.closePath(); } g.fillStyle = col; g.fill(); }
const pop = a => a <= 0 ? 0 : eback(clamp(a / .9));
const slideIn = (a, dur = 1.5) => eout(clamp(a / dur));
const lift = x => { const f = fract(x); return 1.9 * Math.pow(Math.sin(Math.PI * f), 2) * Math.exp(-2 * f); };
const bob = (t, k, amp = 8) => Math.sin(t * .9 + k * 1.7) * amp;
const LINE = (y0, y1, a, ph = 0) => u => [lerp(-80, 2000, u), lerp(y0, y1, u) - Math.sin(u * Math.PI * 1.1 + ph) * a];
function vgrad(g, top, bot){ const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(-W, -H, 3 * W, 3 * H); }

// ================================================================== layouts: the key visual's parts rearranged; each part enters on a beat and leaves at the end
function stripeCorner(g, corner, sz, off){
  g.save();
  if (corner === 'bl' || corner === 'tl'){ g.translate(W, 0); g.scale(-1, 1); }
  if (corner === 'tr' || corner === 'tl'){ g.translate(0, H); g.scale(1, -1); }
  g.beginPath(); g.moveTo(W - 470 * sz, H + 30); g.quadraticCurveTo(W - 230 * sz, H - 280 * sz, W + 30, H - 640 * sz); g.lineTo(W + 300, H - 640 * sz); g.lineTo(W + 300, H + 300); g.closePath(); g.clip();
  stripes(g, W - 200 * sz, H - 300 * sz, -.72, 40 * Math.max(.6, sz), off, [K.navy, K.royal, K.navy, K.light]);
  g.restore();
}
function partState(s, P, endBeat){
  const at = P.at || 0, dur = P.dur || 1.4;
  const ei = s.lb < at ? 0 : (P.ease || eback)(clamp((s.lb - at) / dur));
  const ob = P.out !== undefined ? P.out : endBeat - (P.outDur || 1.2);
  const eo = P.stay ? 0 : (P.outEase || ein)(clamp((s.lb - ob) / (P.outDur || 1.2)));   // r29: optional P.outEase (default ein)
  return [ei, eo];
}
function drawLayout(g, s, parts, endBeat){
  for (const P of parts){
    const [ei, eo] = partState(s, P, endBeat); if (ei <= 0 || eo >= 1) continue;
    const f = P.from || [0, 0], to = P.to || f;
    const dx = f[0] * (1 - ei) + to[0] * eo, dy = f[1] * (1 - ei) + to[1] * eo, pk = P.pop ? clamp(ei, 0, 1.2) * (1 - eo) : 1;
    g.save(); g.translate(dx, dy);
    // r3 "light only the newest": a piece with `recede` fades back to that alpha 2 beats after it entered (he-drowns / scualee)
    if (P.recede !== undefined) g.globalAlpha = lerp(1, P.recede, eio(clamp((s.lb - (P.at || 0) - 2) / 1.5)));
    const b = Math.sin(s.T * .8 + (P.x || 0) * .01) * (P.bob === undefined ? 6 : P.bob);
    switch (P.t){
      // (r29 rules audit: with ck 1.4 on the raw kick the collar jumped ~35 px in 2 frames on every kick, steps at 12.2 /
      // 12.88 / 13.23 s) the collar breathes on the smoothed kick (5-frame rise) and at a fifth of the strength
      case 'disc': disc(g, P.x, P.y, (P.R0 !== undefined ? lerp(P.R0, P.R, ei) : P.R) * pk * (1 + .012 * pulse(s.beat, 5)),   /* r8d: R0 = radius on entry (match cut) */ (P.collar === undefined ? 1 : P.collar) * (1 + .2 * (P.ck || 0) * smoothEnv(kickAt, s.t))); break;   // r6: ck = collar breathes on the kick
      case 'cloud': cloudS(g, P.c, P.x, P.y + b, P.s * pk, 0, !!P.flip); break;
      // (r25 advocate: the corner still snapped a notch every 2 beats, ~72 px in .3 of the step, a visible twitch;
      // homeShot's wedge was fixed in r20) each notch glides over 90 % of its step; (r25b framescan: with eio, peak 3x the mean
      // speed, Drop 1's corner, a notch a beat, still surged on every beat) a sine ease, peak ~1.75x the mean
      case 'stripes': stripeCorner(g, P.corner, P.s, stepEase(s.beat / (P.every || 2), .9, esin) * 80 * P.s); break;
      case 'arc': navyArc(g, P.cx, P.cy, P.r0, P.r1, P.a0, P.a1, P.d0 || 0, P.d1 || 0, s.T * 18); break;
      case 'dots': dotShape(g, P.k, P.x, P.y + b, P.r * pk, P.rot || 0, P.style || 0, P.sp || 20, s.T * 14); break;
      case 'tri': triK(g, P.x + b, P.y + b * .8, P.s * pk * (1 + (P.kick !== undefined ? P.kick * s.k : .12 * pulse(s.beat + (P.x || 0) * .001, 6))), /* r6: P.kick = breathe on the real kick */ (P.rot || 0) + Math.sin(s.T * .5 + P.x) * .12, Math.sin(s.T * .3 + P.y) * .06, P.col, P.k || 0); break;
      case 'spark': sparkle4(g, P.x, P.y + b * .5, P.s * pk * (.8 + .35 * pulse(s.beat + P.x * .003, 4)), s.T * .2 + P.x, P.col || K.white); break;
      case 'puff': sprite(g, LIB.puff[P.i], P.x + (P.drift || 0) * s.T, P.y + b * .5, P.s * pk); break;
      case 'line': { const d = eio(clamp((s.lb - (P.at || 0)) / (P.draw || 6))); if (P.double) lines2(g, P.path, eo, Math.max(eo, d), P.w, P.gap || 16); else swoosh(g, P.path, eo, Math.max(eo, d), P.w);
        if (P.plane && !s.noPlane && d > 0 && d < 1){ const p = P.path(d), q = P.path(Math.min(1, d + .003)); paperPlane(g, p[0], p[1], P.plane, Math.atan2(q[1] - p[1], q[0] - p[0])); } break; }
    }
    g.restore(); g.globalAlpha = 1;
  }
}
// ---------------- the camera flies through a field of graphic pieces: triangles, dot shapes, sparkles, light puffs, rings
function makeShapeField(seed, n, depth){
  const R = mulberry32(seed), o = [];
  const kinds = ['tri', 'tri', 'spark', 'dot', 'tri', 'spark', 'ring'];
  for (let i = 0; i < n; i++){ const a = R() * TAU, rr = 560 + R() * 1500; o.push({ x: Math.cos(a) * rr * 1.25, y: Math.sin(a) * rr * .7, z: R() * depth, kind: kinds[i % kinds.length], k: (R() * 5) | 0, rot: R() * 6, vr: (R() - .5) * 1.4, col: TRI_COLS[(R() * 6) | 0], st: (R() * 3) | 0, i }); }
  return { o, depth };
}
function drawShapeField(g, s, Fd, camZ, alpha = 1, F = 900){
  const vis = [];
  for (const o of Fd.o){ const z = ((o.z - camZ) % Fd.depth + Fd.depth) % Fd.depth + 90; vis.push([z, o]); }
  vis.sort((a, b) => b[0] - a[0]);
  for (const [z, o] of vis){
    const k = F / z, X = W / 2 + o.x * k, Y = H / 2 + o.y * k, fade = alpha * clamp((Fd.depth - z) / (Fd.depth * .35)) * clamp((z - 90) / 120);
    if (fade <= .01 || X < -500 || X > W + 500 || Y < -500 || Y > H + 500) continue;
    g.globalAlpha = fade; const r = o.rot + o.vr * s.T;
    if (o.kind === 'tri') triK(g, X, Y, 120 * k * (1 + .2 * pulse(s.beat + o.i * .07, 6)), r, s.T * .2 + o.i * .1, o.col, o.k);
    else if (o.kind === 'dot') dotShape(g, o.k % 3, X, Y, 170 * k, r * .3, o.st === 2 ? 1 : 0, Math.max(4, 22 * k));
    else if (o.kind === 'spark') sparkle4(g, X, Y, 70 * k * (1 + .3 * pulse(s.beat + o.i * .11, 4)), r * .2, o.st ? K.white : K.cyan);
    else if (o.kind === 'ring'){ const rr = 120 * k; ring(g, X, Y, rr * .82, rr, o.st === 1 ? K.white : o.st === 2 ? K.mint : K.cyan); }
    else sprite(g, LIB.puff[o.i % 8], X, Y, 1.5 * k, 0);
  }
  g.globalAlpha = 1;
}

// ================================================================== shots
// 0–8: an empty sky; the pieces of the key visual arrive one by one; the disc rises like a sun
// r6 (gate r5b: the music has full drums from bar 0, the picture ignored them): one piece on each downbeat (lb 0, 4, 8 =
// the sun starts, 12, 16, 20, 24, 28); the sun climbs one step per bar on bars 2-7 (stepEase, landing at y 1180 for the
// cut); its collar, the sky glow and the triangles breathe on the real kick; one in, one out: a triangle leaves 8 beats
// after it came (advocate: at most 5 accents). No sparks (no-ops that left holes), no halftone "C", no dawn_l.
const L_DAWN = [
  { t: 'disc', x: 960, y: 1180, R: 560, at: 8, dur: 24, from: [0, 520], ease: u => stepEase(u * 6, .35, eout) / 6, ck: 1.4, stay: true, keep: true },
  { t: 'line', path: LINE(560, 470, 150), w: 7, at: 0, draw: 8, stay: true, plane: 62 },   // r6c: drawn over bars 0-1 (fresh eyes)
  { t: 'tri', x: 1480, y: 230, s: 86, rot: -.4, col: K.mint, k: 1, at: 4, pop: 1 },
  { t: 'tri', x: 300, y: 690, s: 64, rot: .9, col: K.azure, k: 2, at: 12, pop: 1 },
  { t: 'line', path: LINE(820, 640, 90, .6), w: 5, at: 16, draw: 10, double: true, stay: true, plane: 54 },
  // (r29 rules audit: it came in at ~48 px a frame (eout5) and left at up to ~47 (ein)) in over 5 beats and out over 4.5,
  // both sine in-out (<= ~17 and ~22 px a frame); it is gone before the cut at 32
  { t: 'cloud', c: 'dawn_r', x: 1620, y: 1030, s: .85, flip: 1, at: 20, dur: 5, from: [1100, 0], ease: esin, stay: true },
  { t: 'tri', x: 1650, y: 640, s: 78, rot: 2.8, col: K.white, k: 3, at: 24, pop: 1 },
  { t: 'tri', x: 820, y: 170, s: 54, rot: -1.1, col: K.navy, k: 4, at: 28, pop: 1 },
];
L_DAWN.forEach(P => { if (P.t === 'tri') P.kick = .16; });   // r6b (fresh eyes, rhythm juror): twice the kick response
// r3: in the last beat of dawn every piece except the rising sun falls out of frame (lines withdraw), so the cut at
// bar 8 only carries the sun (rhythm juror: "the sun keeps rising, the pieces fall away"); r6: earlier triangles shrink
// away 8 beats after they came
// r16 audit (advocate, self: the pieces FELL out of frame in the last beat, the cloud sank down-right, and ~0.5 s
// round the cut was empty sky): nothing falls any more. The cloud drifts out to the right (slightly up), the last
// triangles fly out sideways, and the two white lines are not withdrawn: they carry on into tower1, which withdraws them
// from their tails over its first bar (L_TOWER below draws the same two paths)
L_DAWN.forEach(P => { if (P.keep || P.t === 'line') return; P.stay = false; P.outDur = 1.2;
  // r8f (rhythm juror: dawn's small cloud at x 1850 became tower1's at x 1650 across the cut): the cloud leaves earlier
  const early = P.t === 'tri' && P.at + 8 < 30.8; P.out = early ? P.at + 8 : P.t === 'cloud' ? 27.3 : 30.8;
  if (P.t === 'cloud'){ P.outDur = 4.5; P.outEase = esin; }   // (re-audit, advocate: flung out in .27 s against a calm sunrise) it drifts out; (r29) over 4.5 beats, sine
  P.to = early ? [0, 0] : P.t === 'cloud' ? [1300, -60] : [P.x > 960 ? 800 : -800, -120];
  // (r25c whole-song review, fresh eyes: at 0:04.5 the mint triangle shrank to nothing in place in ~.35 s, "gone") the early
  // ones drift off up and out to their side over 3 beats as they shrink
  if (early){ P.to = [P.x > 960 ? 600 : -600, -220]; P.outDur = 3; } });
SC_.dawn = (g, s) => {
  skyBg(g, 960, lerp(1250, 800, eio(span(s.lbar, 1.5, 7))), 1 + .1 * s.k);   // r6b: from bar 0, twice as strong
  // r11 (review: the first picture can join up with the last: at the very start only this one small triangle, then the
  // next second the starry sky; mind the flow, nothing sudden): the song opens on its own last frame, the white
  // triangle alone on flat navy at (640, 560); the navy lifts into dawn's sky and the stars come on from the zenith down
  // over the first 1.5 s, then go out from the horizon up as the light comes (r7c)
  { const cv = 1 - eio(span(s.t, .3, 1.8)); if (cv > 0){ g.globalAlpha = cv; bgFill(g, BOOK_NAVY); g.globalAlpha = 1; } }
  // r14 (review: at the start there is nothing; the instant the first note sounds the small triangle is born, and
  // then the story slowly unfolds): the stars come on only after the triangle is born
  drawStars(g, s, Math.min(eio(span(s.t, .5, 2.2)), 1 - eio(span(s.lbar, .8, 5))), 1);
  g.save(); g.translate(W / 2, H / 2); g.scale(1.06 - .06 * eio(s.lbar / 8), 1.06 - .06 * eio(s.lbar / 8)); g.translate(-W / 2, -H / 2);
  drawLayout(g, s, L_DAWN, 32);
  g.restore();
  // the bookend triangle: exactly the tail's last pose at t = 0; its drift and kick breath ease in over 1.5 s; it leaves
  // like the other early triangles 8 beats in (shrinks away over 1.2 beats)
  // r14: frames 0-9 (0-0.166 s, silence in the WAV) are empty navy; on the first note (0.166 s) the triangle is generated:
  // it springs out of a point with a thin ring of light and four small glints
  const FIRST = .166;
  if (s.t >= FIRST){ const a = s.t - FIRST, born = eback(clamp(a / .24)), w = eio(clamp(a / 1.5)), lv = ein(span(s.lb, 8, 9.2));
    { const u = a / .7; if (u < 1){ const r = lerp(16, 190, eout(u)); g.globalAlpha = 1 - u; ring(g, 640, 567, r, r + lerp(7, 1.5, u), '#e7ffff'); g.globalAlpha = 1;
      for (let j = 0; j < 2; j++){ const an = j ? 2.6 : -.5, d = lerp(30, 150 - 40 * j, eout(u)); softGlow(g, 640 + Math.cos(an) * d, 567 + Math.sin(an) * d, (16 - 5 * j) * (1 - .4 * u), 1 - u); }   /* r14b (visual: four glints read as a crosshair): two, off-axis; r18: soft round lights */ } }
    if (lv < 1) triK(g, 640 + bob(s.T, 0) * w, 560 + bob(s.T, 3) * .8 * w, BOOK_TRI[2] * born * (1 - lv) * (1 + .16 * s.k * w), BOOK_TRI[3] + Math.sin(s.T * .5) * .12 * w + .6 * (1 - clamp(a / .24)), 0, K.white, 3); }
};
// 8–16: a second arrangement; one big cloud on the right, the disc up left; it all leaves on the last beat
const L_TOWER = [
  // r3: the sun keeps rising across the cut at bar 8 (same disc, same place on the cut frame); r5 (visual juror): it
  // rises on out of the frame to the upper left and stays there as an edge arc, so tower1's subject is the cloud
  // r8d (review: at 10 s and 11 s the half circles were different sizes, no transition): it enters at dawn's exact size
  // (R 560, collar breathing like dawn's) and only grows to 640 while it rises away
  // (r25 rhythm juror: the sun stopped on 12.0, just as the second half of the phrase starts and the music fills up) it
  // rises on and arrives at its edge place on 14.0, where bar 14 takes it to the centre; (r25 liveness: spread evenly over 6
  // bars it took the motion out of bars 9-10) 85 % of the way still goes in bars 8-11 (eio), the last 15 % over 8-13 (esin)
  { t: 'disc', x: 40, y: -80, R: 640, R0: 560, ck: 1.4, at: 0, dur: 24, from: [920, 1260], ease: u => .85 * eio(u * 1.5) + .15 * esin(u) },
  // r6 (health 0:12 EMPTY): the cloud lands on bar 9 (4 beats, was 10) and the line starts on the cut, so the frame
  // is never half empty sky after the sun leaves
  { t: 'line', path: LINE(900, 300, 60, .3), w: 9, at: 0, draw: 8, double: true, plane: 66 },
  { t: 'cloud', c: 'tower1', x: 1560, y: 760, s: 1.05, at: 0, dur: 2.5, from: [0, 760], ease: eout },   // r8f: rises from fully below the frame (dawn's cloud has left by then); r16 audit: quicker (the cut read empty)
  // (r25b advocate: only a ~90x40 px chip of this arc's end showed, stuck at the top edge from 13.9 to 20.7 s; a longer
  // arc would end inside the frame, since an inner radius of 950 round the centre never reaches the right edge) it now
  // stays just above the top edge (a1 -.55 -> -.62)
  { t: 'arc', cx: 960, cy: 540, r0: 950, r1: 1020, a0: -1.25, a1: -.62, d0: -1.1, d1: -.8, at: 8, dur: 4, from: [400, -300], ease: eout },
  { t: 'stripes', corner: 'bl', s: .9, at: 12, dur: 3, from: [-500, 400], ease: eout },
  { t: 'arc', cx: 960, cy: 540, r0: 1000, r1: 1060, a0: 2.2, a1: 3.0, d0: 2.4, d1: 2.8, at: 6, dur: 4, from: [-400, 300], ease: eout },
  // (r25b advocate: these two still popped up in place) they glide in from outside the frame like bars 12-13's
  { t: 'tri', x: 1180, y: 250, s: 70, rot: .6, col: K.white, k: 0, at: 4, dur: 4, from: [300, -420], ease: eout },
  { t: 'tri', x: 900, y: 820, s: 60, rot: 2.6, col: K.mint, k: 2, at: 10, dur: 4, from: [-250, 330], ease: eout },
  // (r25 advocate: in bars 12-13 these popped up in place) they glide in from outside the frame (eout)
  { t: 'dots', k: 2, x: 200, y: 150, r: 130, rot: 3.6, at: 16, dur: 4, from: [-450, -350], ease: eout },
  { t: 'spark', x: 360, y: 640, s: 40, at: 17, pop: 1 },
  { t: 'dots', k: 1, x: 1720, y: 210, r: 120, rot: .18, at: 18, dur: 4, from: [150, -380], ease: eout, style: 1 },   // r5: a halftone triangle, not a ball
  { t: 'tri', x: 1340, y: 470, s: 80, rot: -.8, col: K.navy, k: 1, at: 20, dur: 3, from: [640, -160], ease: eout },
  { t: 'tri', x: 260, y: 900, s: 58, rot: 1.2, col: K.azure, k: 3, at: 24, pop: 1 },
  { t: 'spark', x: 1860, y: 420, s: 30, col: K.cyan, at: 25, pop: 1 },
  { t: 'line', path: LINE(240, 760, -80, 1.2), w: 5, at: 24, draw: 6, plane: 54 },
];
L_TOWER.forEach(P => { const f = P.from || [P.x > 960 ? 900 : -900, 0]; P.to = [f[0] || ((P.x || 0) > 960 ? 900 : -900), f[1]]; P.outDur = 1.5; P.stay = true; });
// r16 audit: dawn's two white lines, already drawn, carried across the cut and withdrawn from their tails over beats 1-3
L_TOWER.unshift({ t: 'line', path: L_DAWN[1].path, w: 7, at: -99, draw: .01, out: 1, outDur: 2, to: [0, 0] },
  { t: 'line', path: L_DAWN[4].path, w: 5, at: -99, draw: .01, double: true, out: 1.5, outDur: 2, to: [0, 0] });
// r11 (review: at 17 s the cloud suddenly got bigger as it left; use the fast snare roll here: quickly draw
// everything into the middle, switch the colour, the small triangle appears, then it blooms open like 22 s; and
// at 20-21 s the camera pulled back a little, a hitch): no camera pin / pull-back. Bar 14 is one long 16th-note snare
// roll: everything is drawn into the centre in a spiral, a small pull on every 16th, faster and faster (each piece with
// its own small delay); on 15 (the dropout) navy opens out of the centre and the white triangle springs up; in the last
// beat it turns into a white ring that opens with assemble's iris, three small triangles flying off it like petals.
// r18: the small pieces' turn round the centre before and through the gather (rad; ein from 12 to 14, then on at the
// speed it reached: .15 rad a bar)
// (r25, jury_r25_advocate / _rhythm: a monotone turn to .1 rad is all bars 12-13 could show, ~30 px) a wind-up: bar 12
// pulls back anticlockwise to -9.6 deg, bar 13 flings them clockwise, faster and faster with the hats (1, 2, then 4 a
// beat); at 14.0 the angle (.1) and the speed (.15 rad a bar) are what they were, so bar 14 is unchanged
const twrTheta = L => { if (L < 4) return 0; if (L < 6){ const x = (L - 4) / 2; return .1 * ein(x) - .18 * Math.sin(Math.PI * x) ** 2; } return .1 + .15 * (L - 6); };
const TWR_SPIN = it => it.i >= 0 && ['tri', 'dots', 'spark'].includes(L_TOWER[it.i].t);
const tSuck = L => { const n = clamp((L - 6) * 16, 0, 16), st = (Math.floor(n) + eout(clamp(fract(n) / .6))) / 16; return L >= 7 ? 1 : st * st; };
// r16: each piece of tower1's layout (and the bar's line pair, i = -1): where it stands (anchor), its 16th in bar 14
// (sweeping clockwise from the top; the pieces that only appear in bar 14 go last), how long it squashes, its triangle
let TG_ = null;
function towerGather(){
  if (TG_) return TG_;
  const cl = (x, y) => [clamp(x, 90, W - 90), clamp(y, 90, H - 90)], out = [];
  L_TOWER.forEach((P, i) => { let p;
    if (P.out !== undefined && P.out < 20) return;   // (dawn's carried-over lines are long gone by bar 14)
    if (P.t === 'disc') p = [220, 180];
    else if (P.t === 'line') p = typeof P.path === 'function' ? P.path(.5) : [960, 540];
    else if (P.t === 'arc'){ const a = (P.a0 + P.a1) / 2, r = (P.r0 + P.r1) / 2; p = [P.cx + Math.cos(a) * r, P.cy + Math.sin(a) * r]; }
    else if (P.t === 'stripes') p = [220, 900];
    else p = [P.x, P.y];
    p = cl(p[0], p[1]); out.push({ i, x: p[0], y: p[1], late: (P.at || 0) >= 24, cloud: P.t === 'cloud', sun: P.t === 'disc', big: P.t === 'disc' || P.t === 'stripes' || P.t === 'arc' }); });
  out.push({ i: -1, x: 960, y: 380, late: false, cloud: false, big: true });
  out.forEach(o => { o.a = Math.atan2(o.y - 540, o.x - 960); o.r = Math.hypot(o.x - 960, (o.y - 540) / .9); o.key = ((o.a + Math.PI / 2) % TAU + TAU) % TAU + (o.late ? 100 : 0); });
  out.sort((p, q) => p.key - q.key);
  out.forEach((o, n) => { o.at = 6 + n / out.length; o.line = o.i < 0 || L_TOWER[o.i].t === 'line'; o.dur = o.cloud ? .5 : o.line ? Math.min(.2, 6.995 - o.at) : o.big ? .2 : .12; o.sz = 52 + 14 * hash(n * 7); o.col = [K.white, K.mint, '#fffef2'][n % 3]; o.k = n; });   // (self-check: 34-44 px did not read)
  return (TG_ = out);
}
let TCR_ = null; const TOWER_CARRY = () => TCR_ || (TCR_ = L_TOWER.filter(P => P.out !== undefined && P.out < 20));
let TGS_ = null; const TG_SUNFIRST = () => TGS_ || (TGS_ = towerGather().slice().sort((p, q) => (q.sun ? 1 : 0) - (p.sun ? 1 : 0)));   // the sun is drawn behind the rest
function triRing(g, x, y, sz, rot, m){
  // the key-visual triangle (TRIS[3]) morphing into assemble's iris at radius 0: a white ring 60-90 round a K.ring disc
  // (r11b, self-check: a ring of its own made a double ring with the iris on its first frames)
  const T3 = TRIS[3], nv = T3.length / 2, N = 60, per = [];
  for (let i = 0; i < nv; i++){ const a = [T3[i * 2], T3[i * 2 + 1]], b = [T3[(i + 1) % nv * 2], T3[(i + 1) % nv * 2 + 1]]; for (let j = 0; j < N / nv; j++){ const u = j / (N / nv); per.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]); } }
  g.save(); g.translate(x, y); g.rotate(rot); g.beginPath();
  per.forEach(([px, py], i) => { const ang = Math.atan2(py, px), X = lerp(px * sz, Math.cos(ang) * 90, m), Y = lerp(py * sz, Math.sin(ang) * 90, m); i ? g.lineTo(X, Y) : g.moveTo(X, Y); });
  g.closePath(); g.fillStyle = K.white; g.fill();
  if (m > 0) circle(g, 0, 0, 60 * m, K.ring);
  g.restore();
}
SC_.tower1 = (g, s) => {
  const L = s.lbar, su = tSuck(L);
  { const u = eio(span(L, 0, 2)); skyBg(g, lerp(960, 600, u), lerp(800, 400, u)); }   // r8d: the light starts where dawn left it
  // r11b (visual juror: a soft glow is not flat cartoon): the light gathering in the centre is a hard-edged cream disc
  // growing to R 120 as the pieces are drawn in; the navy then opens out of it
  // r16b: the cream core is now the sun itself (see the gather below); it stays for the navy to open out of it
  if (L >= 7 && L < 7.2) circle(g, 960, 540, 120 * 1.075 * 1.04, '#fffef2');
  const z = 1 + .04 * eio(clamp(L / 6));
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  // r16 (review: at 20 s the contraction felt wrong, badly designed; it should be a designed effect, not things stiffly
  // crammed together; advocate's proposal D): no more shrinking the whole layout into a clump. On the 16th-note
  // snare roll of bar 14 the pieces go one per 16th, sweeping round the frame: each one squashes into a point where it
  // stands while a small key-visual triangle springs out of it, and that triangle flies a spiral into the centre; the
  // cloud does not turn into a triangle, it sinks out of the frame. All the triangles arrive on 15.0, where the white
  // triangle springs up (unchanged).
  if (L < 7){
    // r16 audit: dawn's lines, withdrawn over beats 1-3.5 (r20 audit, advocate: drawn here they were under tower1's sun,
    // so on the cut their stretch across the disc vanished) now drawn right after the sun, below the other pieces
    // (r25 rhythm juror: bar 13 has eighth-note hats all through) in bar 13 the pair sweeps every half bar, alternating
    const hb = L >= 5 && L < 6, ph = hb ? fract(2 * L) : fract(L), dirOdd = hb ? (Math.floor(2 * L) + 1) % 2 : Math.floor(L) % 2;
    const lineP = dirOdd ? v => [lerp(-100, 2020, v), 520 - v * 360 + Math.sin(v * 3) * 50] : v => [lerp(2020, -100, v), 300 + v * 260 - Math.sin(v * 2.6) * 50];
    for (const it of TG_SUNFIRST()){ const v = clamp((L - it.at) / it.dur);
      // r16b (advocate: a navy circle appeared from nowhere in the middle while the big sun just faded): the sun
      // itself glides to the centre over the whole bar, shrinking to R 120 and turning cream: it IS the core the triangles
      // fly into, and on 15.0 the navy opens out of it
      if (it.sun){ if (L < 6){ drawLayout(g, s, [L_TOWER[it.i]], 32); if (L < 1.5) drawLayout(g, s, TOWER_CARRY(), 32); continue; } const u = eio(clamp(L - 6)), x = lerp(40, 960, u), y = lerp(-80, 540, u), R = lerp(640, 120, u) * (1 + .012 * pulse(s.beat, 5));
        disc(g, x, y, R, 1 + .28 * smoothEnv(kickAt, s.t) * (1 - u));   /* (r29: as the layout's collar, smoothed and gentler) */ const cr = eio(clamp((L - 6.45) / .55)); if (cr > 0){ g.globalAlpha = cr; circle(g, x, y, R * 1.075, '#fffef2'); g.globalAlpha = 1; } continue; }
      const draw = () => it.i < 0 ? (L >= 1 && kvLines(g, lineP, ein(clamp(ph * 1.4 - .4)), eout(clamp(ph * 3.5)), 8)) : drawLayout(g, s, [L_TOWER[it.i]], 32);
      // r18 (liveness audit: 0:16.6-0:19.4 ranked .9 in the music and .2 in the picture; jury_r18): bar 14's spiral is
      // foreshadowed: from 12 the small pieces start to turn clockwise round the centre (ein, 5.7 deg by 14, then on at
      // the same speed into the gather) and the cloud rises 40 px and drifts 60 px right, the way it will leave
      // (r25 advocate: the cloud eased to a stop at 14.0 and then set off again to leave) from 11.0 it gathers speed over
      // a bar (ein) and then drifts on at ~89 px a bar right and ~21 px a bar up, without stopping, into its exit
      const sp = TWR_SPIN(it) ? twrTheta(L) : 0, cx = L < 3 ? 0 : L < 4 ? (L - 3) ** 4 / 4 : .25 + (L - 4), cd = it.cloud ? cx : 0;
      g.save(); if (sp){ g.translate(960, 540); g.rotate(sp); g.translate(-960, -540); } if (cd) g.translate(89 * cd, -21 * cd);
      if (v <= 0) draw();
      else if (it.cloud){ if (v < 1){ g.translate(1100 * ein(v), -50 * ein(v)); draw(); } }   // r16 audit: out to the right (it sank)
      // (r20 audit, advocate: the long white line across the core shrank from 87 % to nothing in ~3 frames at 0:20.6)
      // a line draws in towards its middle and fades (eio), never collapsing to a point at the end
      else if (v < 1 && it.line){ const e = eio(v); g.globalAlpha = 1 - e; g.translate(it.x, it.y); g.scale(1 - .6 * e, 1 - .6 * e); g.translate(-it.x, -it.y); draw(); g.globalAlpha = 1; }
      else if (v < 1){ const e = ein(v); g.translate(it.x, it.y); g.rotate(.35 * e); g.scale(1 - e, 1 - e); g.translate(-it.x, -it.y); draw(); }
      g.restore(); }
  }
  g.restore();
  // the triangles born from the pieces fly a spiral into the centre, all landing on 15.0
  if (L >= 6 && L < 7.05) for (const it of towerGather()){ if (it.cloud || it.sun) continue; const v = clamp((L - it.at) / it.dur), born = eback(clamp(v * 1.4)); if (v <= 0) continue;
    // (r18: a turned piece's triangle starts from where the piece stands now, turned by twrTheta at its 16th)
    const th = TWR_SPIN(it) ? twrTheta(it.at) : 0, ix = 960 + (it.x - 960) * Math.cos(th) - (it.y - 540) * Math.sin(th), iy = 540 + (it.x - 960) * Math.sin(th) + (it.y - 540) * Math.cos(th);
    const ia = Math.atan2(iy - 540, ix - 960), ir = Math.hypot(ix - 960, (iy - 540) / .9);
    const f = eio(clamp((L - it.at - it.dur * .5) / (7 - it.at - it.dur * .5))), a = ia + 1.1 * Math.PI * f, r = ir * Math.pow(1 - f, 1.25), x = 960 + Math.cos(a) * r, y = 540 + Math.sin(a) * r * .9;
    // a small light ring puffs where the piece turned (as at the factory's take-off point)
    if (v < 1){ const q = eout(v); g.globalAlpha = .4 * (1 - v); /* r16b (fresh eyes: read as soap bubbles) */ ring(g, ix, iy, lerp(12, 110, q), lerp(12, 110, q) + lerp(9, 2, v), '#fffef2'); g.globalAlpha = 1; }
    if (L < 7) triK(g, x, y, it.sz * born * (1 - .5 * f), a + Math.PI / 2 + 3 * f, 0, it.col, it.k); }
  if (L < 7) return;
  // 15: navy opens out of the centre (half a beat), the triangle springs up in it and turns slowly through the dropout
  const nv = eout(span(L, 7, 7.12)); circle(g, 960, 540, 1300 * nv, '#03368b');
  const tp = eback(span(L, 7.03, 7.25)), m = eio(span(L, 7.8, 8)), sz = 66 * tp * (1 + .14 * eio(span(L, 7.25, 7.8)));
  const rot = .18 + .55 * eio(span(L, 7, 7.8)) + 2.4 * ein(span(L, 7.75, 8));
  if (L < 8 && sz > 1) triRing(g, 960, 540, sz, rot, m);   // at 8 the iris's own rings take over from exactly this picture
  // the bloom: three petals leave the ring with assemble's iris (tower1 is drawn outside the iris for one beat)
  if (L >= 8){ const u = clamp((L - 8) * 4), rI = eio(u) * 2300;
    // r16 audit (advocate: on the cut three cyan petals popped in at full size): they spring out of the ring's centre
    for (let j = 0; j < 3; j++){ const a = rot + j * TAU / 3 - Math.PI / 2, sp = eback(clamp(u * 3)), d = lerp(20, Math.max(110, rI + 90), clamp(sp)) + 300 * eout(u);
      triK(g, 960 + Math.cos(a) * d, 540 + Math.sin(a) * d, 46 * sp * (1 - .4 * u), a + Math.PI / 2 + u * 3, 0, [K.white, K.mint, K.cyan][j], 3); } }
};
// 24–28: the assembled key visual holds; a slow push towards the stripes; one new piece per bar
SC_.kvHold = (g, s) => {
  // r7 (review: the camera push into the next section was pointless and not pretty): no push-in; only a slow 3 % breath,
  // and in bar 27 the stripes take over the frame from the bottom-right corner one notch per beat (see the end)
  const u = eio(s.lbar / 4), z = 1 + .03 * u;
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  // r18 (liveness audit: 0:33-0:36 ranked .7-.9 in the music and .2 in the picture; jury_r18): the plate breathes like the
  // finale's reunion: its groups push 6 px outward on the kick (5-frame smoothed), easing in over half a bar from
  // assemble and out over the last half bar so voyage takes the picture over exactly where it was; a soft light runs
  // along one of the plate's white lines each bar
  const kb = 6 * smoothEnv(kickAt, s.t) * eio(span(s.lbar, 0, .5)) * (1 - eio(span(s.lbar, 2.5, 3)));
  homeShot(g, s, { tlDots: 0, breath: kb });   // r11/r14: no upper-left white dots (assemble has none either now)
  { const t = s.T, LP = [u => [lerp(300, 1960, u), 800 - u * 420 + Math.sin(u * 3) * 30 + Math.sin(t * .7 + u * 3) * 6], u => [lerp(-40, 1960, u), 225 + Math.sin(u * 3.1 + .3) * -170 + u * 330 + Math.sin(t * .6 + u * 2) * 8], u => [lerp(780, 1960, u), 1080 - u * 340 + Math.sin(u * 2) * 20 + Math.sin(t * .5) * 6]];
    if (s.lbar < 3){ const f = fract(s.lbar); pathLight(g, LP[Math.floor(s.lbar) % 3], f, Math.sin(Math.PI * f)); } }
  const ph = fract(s.lbar); if (s.lbar < 1 || s.lbar >= 3) swoosh(g, v => [lerp(320, 1960, v), 860 - v * 360 + Math.sin(v * 2.6) * 30], ein(clamp(ph * 1.4 - .4)), eout(clamp(ph * 1.4)), 5);
  { const t0 = BAR * .9, t1 = BAR * 3.1; if (s.T > t0) flight(g, τ => { const u = (τ - t0) / (t1 - t0); return [lerp(-220, 2160, u), 940 - 600 * u + Math.sin(u * 4.5) * 46]; }, s.T, 60, { trail: 1.1, from: t0, w: 5 }); }
  dotShape(g, 1, 1240, 170, 90 * pop(s.lb - 4), .18, 1, 18, s.T * 10);   // r5: a halftone triangle, not a ball
  triK(g, 1080 + bob(s.T, 1), 300, 44 * pop(s.lb - 8), .6 + s.T * .1, 0, K.navy, 1);
  sparkle4(g, 1500 + bob(s.T, 2), 430, 34 * pop(s.lb - 12), s.T * .2, K.white);
  g.restore();
  // r7 (review: at 0:32-0:33 lines suddenly vanished): assemble's contrails that are still in flight at the cut (born before
  // beat 96 = bar 24) finish their own life here instead of disappearing on the cut frame
  beatEvents(s, 6, -1e9, (bb, ag) => { if (bb < 96) swooshEvt(g, bb, ag, BEAT * 3, 5 + 5 * hash(bb)); }, 2);
  // r7: bar 27 = the stripes corner grows over the frame one notch per beat (stepEase .3 eout), full on 28.0 with exactly
  // stripeRide's opening stripes (same angle, width, colours and phase), so the cut at 28 is seamless
  // r8: kvHold ends at 27 and voyage slices it away, so the stripe takeover is off (kept for reference)
  if (false && s.lbar >= 3){ const gr = Math.min(1, stepEase((s.lbar - 3) * 4, .3, eout) / 4), dd = lerp(W + H - 160, -140, gr);
    g.save(); g.beginPath(); g.moveTo(dd + 100, -100); g.lineTo(W + 200, -100); g.lineTo(W + 200, H + 200); g.lineTo(-100, H + 200); g.lineTo(-100, dd + 100); g.closePath(); g.clip();
    stripes(g, 960, 540, -.72, 84, stepEase(s.beat, .3, eout) * 84, ['#03368b', '#0874ff', '#03368b', '#167cff']); g.restore(); }
};
// 28–31: the stripes ARE the ground (r3 P3, learned from c.s.q.n.: one pattern fills the frame and steps on the beat).
// kvHold's push into the stripes corner hands over to a full frame of the key visual's own stripes at its own angle;
// a double contrail is drawn along them; in bar 29 a single mint triangle slides along a stripe; in bar 30 the stripes
// widen and step every 2 beats (the energy drops); the stripe wipe at bar 31 sweeps them away into airy's sky.
SC_.stripeRide = (g, s) => {
  // r4 (advocate): full-frame stripes only for bar 28, then they narrow back to a wide band across the sky with the
  // disc (no long dark block); no triangle at the head of the line (it read as the paper plane)
  // r5 (visual juror): after bar 28 the stripes withdraw into the key visual's own lower-right wedge, (760,1080) to (1920,180)
  // r6 (rhythm juror): the wedge starts ON 29.0 and its fastest moment is the beat (it used to spend a third off screen);
  // the widening lands within 1 beat of 30.0
  const L = s.lbar, wide = eout(span(L, 2, 2.25)), w = lerp(84, 150, wide), bx = lerp(-1400, 760, eout(span(L, 1, 1.5)));
  const step = (L < 2 ? stepEase(s.beat, .3, eout) : 2 * stepEase(s.beat / 2, .3, eout)) * 84;
  skyBg(g, 600, 300, 1.1);
  disc(g, 380, 260, 520);
  g.save(); g.beginPath(); g.moveTo(bx - 129, 1180); g.lineTo(bx + 1650, -200); g.lineTo(2200, -200); g.lineTo(2200, 1180); g.closePath(); g.clip();
  stripes(g, 960, 540, -.72, w, step, ['#03368b', '#0874ff', '#03368b', '#167cff']); g.restore();
  { const hd = eio(span(s.lb, 0, 6)), path = v => [lerp(-80, 2000, v), 1000 - v * 820]; lines2(g, path, 0, hd, 10, 20); }
};
// BREAKDOWN 31–40: a wide quiet sky; the disc on the left; one cloud drifts; puffs cross one at a time; one long line.
// In the last bar everything but the disc drifts away and the disc glides to the centre: the next shot starts from it.
let AIRY_N = null;
function airyNodes(){
  AIRY_N = [];
  for (const n of NOTE){ if (n.tr !== 2 || n.t0 < B(31) - .01 || n.t0 >= B(39.75)) continue; const lb = (n.t0 - T0) / BAR - 31, last = AIRY_N[AIRY_N.length - 1];
    if (last && Math.abs(last.lb - lb) < .02) last.p = Math.max(last.p, n.p); else AIRY_N.push({ lb, p: n.p }); }
  AIRY_N.sort((a, b) => a.lb - b.lb);
  // r7d (advocate: the spikes were the "wiggly line" rejected in r3): the SHAPE has one node per half bar
  // (that half bar's highest note), +-70 px round the mid line, neighbours <= 40 px apart, Catmull-Rom smooth; only the
  // head's progress steps with every chord
  AIRY_G = [];
  for (let k = 0; k <= 18; k++){ const ns = AIRY_N.filter(n => n.lb >= k / 2 && n.lb < k / 2 + .5), p = ns.length ? Math.max(...ns.map(n => n.p)) : null; AIRY_G.push(p); }
  let lo = 1, hi = 0; for (const p of AIRY_G) if (p !== null){ lo = Math.min(lo, p); hi = Math.max(hi, p); }
  let prev = 0; AIRY_G = AIRY_G.map(p => { let y = p === null ? prev : lerp(90, -90, (p - lo) / Math.max(.01, hi - lo)); y = clamp(y, prev - 50, prev + 50); prev = y; return y; });
  AIRY_G = AIRY_G.map((y, k, G) => (G[Math.max(0, k - 1)] + y + G[Math.min(G.length - 1, k + 1)]) / 3);   /* r7d jury: 3-node moving average */
  { const a = Math.min(...AIRY_G), b = Math.max(...AIRY_G); AIRY_G = AIRY_G.map(y => lerp(-80, 80, (y - a) / Math.max(1, b - a))); }   /* r7e (all four: too flat to read as melody): the smoothed contour fills +-80 px */
}
let AIRY_G = null;
const airyX = lb => 160 + lb * 420;
function airyY(lb){ const G = AIRY_G, f = clamp(lb * 2, 0, G.length - 1.001), i = Math.floor(f), u = f - i, p0 = G[Math.max(0, i - 1)], p1 = G[i], p2 = G[Math.min(G.length - 1, i + 1)], p3 = G[Math.min(G.length - 1, i + 2)];
  return 760 + .5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u); }
function airyLine(g, s, leave){
  if (!AIRY_N) airyNodes();
  const L = s.lbar, N = AIRY_N; let i = -1; while (i + 1 < N.length && N[i + 1].lb <= L) i++;
  if (i < 0) return;
  const hLb = lerp(i > 0 ? N[i - 1].lb : N[0].lb - .25, N[i].lb, eio(clamp((L - N[i].lb) * 32))), hx = airyX(hLb), hy = airyY(hLb);
  const off = Math.max(0, hx - 1240), tLb = Math.max(N[0].lb - .25, lerp(L - 3.5, hLb, eio(span(L, 8.25, 9))));
  g.save(); g.translate(-off, 0); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [w, col] of [[14, '#7bdcfa'], [7, '#e7ffff']]){ g.beginPath(); g.moveTo(airyX(tLb), airyY(tLb));
    for (let v = tLb; v < hLb; v += .04) g.lineTo(airyX(v), airyY(v));
    g.lineTo(hx, hy); g.strokeStyle = col; g.lineWidth = w; g.stroke(); }
  { const r = (1 + .3 * s.k) * (1 - leave); circle(g, hx, hy, 24 * r, '#9ee9ff'); circle(g, hx, hy, 10 * r, '#e7ffff'); }   /* r7d: a round head (a triangle on a line read as the paper plane) */
  g.restore();
}
SC_.airy = (g, s) => {
  // r3: the disc starts exactly where stripeRide left it (380, 260, R 520) and glides into place over 2 bars
  const tilt = eio(span(s.lbar, 4, 8)), leave = eio(span(s.lbar, 8, 9)), arrive = eio(span(s.lbar, 0, 2));
  skyBg(g, lerp(600, 960, leave), lerp(500, 540, leave));
  g.save(); g.translate(0, 160 * tilt * (1 - leave));
  // r4 (fresh eyes F6): a small disc up left here, so airy no longer shares Drop 1's and the final drop's "big disc +
  // cloud" layout; it glides to the centre at R 260 in bar 39 for approach (anchored)
  // r6 (gate r5b: a soft kick on every beat of the breakdown, the picture ignored it): the disc breathes on the kick, the
  // cloud takes one step per bar (moves in the first half, rests in the second) with one bob per bar, and it leaves only
  // in the last 2 beats; the line's head advances on the beats
  { const dx = lerp(lerp(380, 500, arrive), 960, leave), dy = lerp(lerp(260, 330, arrive) - 60 * tilt * (1 - leave), 540, leave), dR = lerp(lerp(520, 200, arrive) + 14 * s.k * clamp(s.lbar - 1), 260, leave);
    disc(g, dx, dy, dR);
    // r6d (research calm_sections_r6 #5, Skyward blast 0:44): 8 dots inside the rim light one per soft kick (beat) and
    // reset every 2 bars, so the breakdown counts the beats without adding a new object
    if (false && s.lbar >= 1 && leave < 1){ const n   /* r7: rim dots removed (advocate, fresh eyes: read as a dial) */ = Math.floor(s.beat) % 8; for (let i = 0; i < 8; i++){ const a = -Math.PI / 2 + i * TAU / 8, on = i <= n, r = dR * .78;
      circle(g, dx + Math.cos(a) * r, dy + Math.sin(a) * r, dR * (on ? .045 : .03), on ? `rgba(255,255,244,${(.9 - .5 * (i < n ? 1 : 0) * (1 - pulse(s.beat, 3))) * (1 - leave)})` : `rgba(255,255,244,${.18 * (1 - leave)})`); } } }
  g.restore();
  // r7c (review: only a cloud squirming, ugly; edit + fresh-eyes jurors chose the melody line over a bigger cloud): no
  // cloud. One white line WRITES the melody: every chord of track 2 adds a node (x = time, y = its top note) and the head
  // reaches it in 1/8 beat (eout), so the line steps exactly with the notes; the score scrolls once the head passes
  // x 1300; the tail is 3.5 bars long; the head is a mint triangle that swells on the soft kick. In the last bar the tail
  // is reeled in to the head while the disc glides to the centre.
  airyLine(g, s, leave);
  spawnPops(s.t, 1.6, (n, a) => { if (n.i % 2 || leave > .5) return; const x = 980 + hash(n.i) * 820, y = 160 + hash(n.i + 7) * 520; triK(g, x, y - a * 26, 30 * pop(a / BEAT) * (1 - ein(span(a, 1.1, 1.6))), hash(n.i) * 6 + a * .6, a * .3, TRI_COLS[n.i % 6], n.i); });
};
// REBUILD 40–48 (0:55–1:06): the key visual's pieces gather round the disc into a turning rosette, one piece per bar.
// The rosette turns in steps: once a bar, then every half bar, then on every beat (the build speeds up with the music).
// In the last bar the camera dives into the disc, so the frame is all its blue when the colour cards cut in.
const rosStep = lb => lb < 16 ? stepEase(lb / 4, .35, eback) : lb < 24 ? 4 + stepEase((lb - 16) / 2, .35, eback) : 8 + stepEase(lb - 24, .35, eback);
function arcSweep(g, cx, cy, rx, ry, a0, len, age, life, w){ if (age < 0 || age > life) return; const hd = eout(age / (life * .45)), tl = ein(clamp((age - life * .25) / (life * .75))); swoosh(g, u => [cx + Math.cos(a0 + u * len) * rx, cy + Math.sin(a0 + u * len) * ry], tl, Math.max(tl, hd), w); }
// ================================================================== APPROACH r11c (40-48, 0:55-1:06): formation flight
// (r11 fresh eyes: 0:43-1:06 was 23 s of "a centred disc with a ring of things round it"; the old rosette of concentric
// arcs read as a gauge.) The triangles that were drawn into the sun at 39.5 burst out of it as a flock; the sun slides to
// the upper right and grows (the frame opens); each bar the flock flies a new formation, changing over round the
// downbeat (eio, rippling one triangle after another): 40 out of the sun, 41 an S-string, 42 a V, 43 a travelling wave,
// 44 two parallel strings (the key visual's double contrail), 45 a zigzag, 46 a turning wheel, 47 one big triangle made of
// the small ones. Over the last half bar the pieces leave (sun up-right, arc and clouds to their sides), navy opens out of
// the formation's centre and the fifteen merge into the ONE white triangle that solo (48) starts with.
const AP_N = 15;
const AP_T = (() => { const T3 = TRIS[3], P = [[T3[0], T3[1]], [T3[2], T3[3]], [T3[4], T3[5]]], o = [];
  for (let k = 0; k < AP_N; k++){ const e = Math.floor(k / 5), u = (k % 5) / 5, a = P[e], b = P[(e + 1) % 3]; o.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]); } return o; })();
function apForm(i, k, lb, sx, sy, sR){
  const u = k / (AP_N - 1);
  switch (i){
    // r11c (jurors: they stopped in a ring round the sun for 0.7 s): shot straight from the sun's centre to their places
    // in the S-string, landing on 41's downbeat
    case 0: { const e = eout(span(lb, k * .02, 3.6 + k * .02)), p = apForm(1, k, lb); return [lerp(sx, p[0], e), lerp(sy, p[1], e)]; }
    case 1: { const v = .04 + .92 * u; return [lerp(140, 1760, v), 860 - 560 * v + Math.sin(v * 6.2 + lb * .6) * 70]; }
    case 2: { const j = Math.ceil(k / 2), sd = k % 2 ? -1 : 1, ax = 1150 + 30 * Math.sin(lb * .7), ay = 520 + 20 * Math.sin(lb * .5), c = Math.cos(-.3), s = Math.sin(-.3), lx = -j * 78, ly = sd * j * 52;
      return [ax + lx * c - ly * s + 6 * Math.sin(lb * 1.3 + k), ay + lx * s + ly * c + 6 * Math.cos(lb * 1.1 + k)]; }
    case 3: return [lerp(140, 1780, u), 560 + 170 * Math.sin(u * TAU * 1.2 - lb * .9)];
    // r11c (rhythm juror: the music speeds up from 44, the formations did not): in 44 and 45 the formation also turns
    // over on beat 3 (the two strings swap sides, the zigzag flips); in 46 the spiral turns on with a push each beat
    case 4: { const j = Math.floor(k / 2), v = .06 + .88 * j / 7, o = (k % 2 ? 66 : -66) * lerp(1, -1, eio(span(lb, 17.8, 18.6))), x = lerp(220, 1700, v), y = lerp(880, 260, v) + Math.sin(v * 3 + lb * .4) * 40; return [x + o * .4, y + o]; }
    case 5: return [lerp(150, 1760, u), 560 + (k % 2 ? -1 : 1) * lerp(1, -1, eio(span(lb, 21.8, 22.6))) * 160 * (1 - .25 * Math.sin(lb * .6 + u * 3))];
    // r11c (visual: the wheel was another ring): a spiral winding in round (640, 560) as it turns, into 47's triangle
    case 6: { const f = fract(lb), a = k * TAU / AP_N * 1.6 + lb * .3 + .5 * (eout(f) - f), r = lerp(300, 150, eio(span(lb, 24, 28))) * (.55 + .45 * u); return [640 + Math.cos(a) * r, 560 + Math.sin(a) * r]; }
    default: { const p = AP_T[k], c = Math.cos(.18), s = Math.sin(.18), sc = 500 + 20 * Math.sin(lb * .8); return [640 + (p[0] * c - p[1] * s) * sc, 560 + (p[0] * s + p[1] * c) * sc]; }   // (advocate: 1.5x, it holds the frame)
  }
}
function apPos(k, lb, sx, sy, sR){
  // r11c (all jurors: mid-change the flock read as confetti): the change takes 3/4 beat round the downbeat and ripples
  // only .015 beat a triangle, so a formation morphs as a whole and holds for the rest of the bar
  const i = clamp(Math.floor((lb - k * .015 + .3) / 4), 0, 7), w = eio(span(lb - k * .015, 4 * i - .3, 4 * i + .65));
  const a = apForm(Math.max(0, i - 1), k, lb, sx, sy, sR), b = apForm(i, k, lb, sx, sy, sR);
  // (r11d fresh eyes: a straight move read as "scattering"): each triangle swings over on a shallow arc to its new place
  const bow = .2 * Math.sin(Math.PI * w);
  return i === 0 ? b : [lerp(a[0], b[0], w) - (b[1] - a[1]) * bow, lerp(a[1], b[1], w) + (b[0] - a[0]) * bow];
}
SC_.approach = (g, s) => {
  const L = s.lbar, lb = s.lb, sn = snareAt(s.t);
  // (r16 audit: the glow jumped from voyage's centre on the cut) it moves with the sun over bar 40
  { const m0 = eio(span(L, 0, 1.25)); skyBg(g, lerp(960, 1300, m0), lerp(540, 380, m0), lerp(1, .95, m0)); }
  // the sun: voyage's (960, 540, R 260) -> upper right (1420, 340, R 400) over bar 40; it slides off up-right in 47
  // r16 (review: at 64 s the little triangles bunching together did not work; let them form a big triangle, then on the beat
  // the assembled triangle, with the background colour changing, gives one shake and fuses into a big triangle, then like
  // later, a few hits, a few colour changes): the frame's pieces leave during 46 (gone by 47.0, when the colour cards
  // start), so the sun now slides off 46.2-46.95
  // (r16 audit, advocate: sun, clouds, arc and wedge all left within ~.6 beat and the sun read as fading) staggered,
  // each its own way: wedge 46.0, arc 46.15, clouds 46.3, and the sun slides off up-right over most of the bar
  const m1 = eio(span(L, 0, 1.25)), off = eio(span(L, 6.0, 6.95));
  const sx = lerp(lerp(960, 1420, m1), 2300, off), sy = lerp(lerp(540, 340, m1), -420, off), sR = lerp(260, 400, m1) * (1 + .012 * s.k);
  disc(g, sx, sy, sR);
  // a light ring leaves the sun on each downbeat 41-46
  if (L >= 0 && L < 6){ const u = fract(L); if (u < .7){   /* r16 audit: also on 40.0 (the flock bursting out of the lone sun) */ const r = lerp(sR + 30, sR + 520, eout(u / .7)); g.globalAlpha = (1 - u / .7) * clamp(u / .036); /* r20 audit (advocate: on 40.0 a thick opaque ring popped in on the cut frame): fades in over 3 frames */ ring(g, sx, sy, r, r + lerp(12, 2, u / .7), '#e7ffff'); g.globalAlpha = 1; } }
  // the frame (as in the key visual): a corner arc lower left, ends off-frame, turning slowly; the stripes wedge lower
  // right from 42, scrolling; both come in from their corners and leave to them in 47
  // r11c (jurors): the pieces leave half a beat apart (wedge 46.6, arc 46.75, clouds 46.9, sun 46.6-47.6), not together
  // clouds (fresh eyes: a flat strip read as a long cloud): a big cumulus cluster lower left, behind the corner arc, rising
  // in; wisps drift in upper left; they leave sideways
  // (r28e cloud audit: eio over .6 bar flung them out at up to ~70 px a frame, gone in ~.15 s at 1:03.9) they set off
  // earlier and slide out over a bar (esin, <= ~23 px a frame), still gone before the colour cards on 47.0
  // (and they rise in with a sine in-out too: eout's first frames were ~19 px a frame, now ~10)
  { const c1 = esin(span(L, .4, 1.6)), ex = esin(span(L, 5.9, 6.9));
    if (c1 > 0 && ex < 1){ cloudS(g, 'HB_tower', 40 - 1200 * ex - 10 * s.T, 640 + 620 * (1 - c1), .85); cloudS(g, 'HB_low', 260 - 1200 * ex - 14 * s.T, 1030 + 520 * (1 - c1), 1.05); }
    const c2 = esin(span(L, 1, 2.2)); if (c2 > 0 && ex < 1){ cloudS(g, 'HA_tr', 260 - 700 * (1 - c2) - 900 * ex - 8 * s.T, 90, .5); cloudS(g, 'HA_r5', 700 - 700 * (1 - c2) - 900 * ex - 10 * s.T, 50, .38, 0, true); } }
  { const inA = eout(span(L, .4, 1.6)) * (1 - eio(span(L, 6.15, 6.7))), o = 900 * (1 - inA);
    if (inA > 0) kvArc(g, -320 - o, 1320 + o, 760, -1.75 + .05 * s.T, 2.0, s.T * 14);
    const inS = eout(span(L, 2, 3)) * (1 - eio(span(L, 6.0, 6.55))); if (inS > 0) kvStripeBand(g, s.T * .9, inS); }
  // a key-visual line pair crosses the top third once a bar (41-46), clear of the flock (advocate)
  if (L >= 1 && L < 7){ const ph = fract(L), P = Math.floor(L) % 2 ? v => [lerp(-100, 2020, v), 330 - v * 240 + Math.sin(v * 3) * 30] : v => [lerp(2020, -100, v), 90 + v * 200 - Math.sin(v * 2.6) * 30];
    kvLines(g, P, ein(clamp(ph * 1.4 - .4)), eout(clamp(ph * 3.5)), 8); }
  // r16: bar 47 (the break before solo: hits on every beat, then 16ths 47.81 / 47.87 / 47.93, from the WAV) is a run of
  // colour cards: on each hit the ground changes colour and the big triangle squashes, springs back a size smaller (and
  // swaps to navy on the pale cards); the last card is solo's own first frame (navy, white triangle 120 at (640, 560))
  // r16b (visual: a full-screen cream card and three big flips in 0.3 s are a flash risk; advocate: the last two cards
  // were 80 ms apart): five cards, every step's luminance change <= .17 (sky .36 -> cyan .52 -> sky .36 -> royal .20 ->
  // navy .05); the last (47.875) is solo's own first frame
  const AP_HIT = [[7, '#12abf4', K.white, 500], [7.25, '#42cefb', K.navy, 400], [7.5, '#12abf4', K.white, 300], [7.75, '#0874ff', K.white, 200], [7.875, K.navy, K.white, 120]];
  let hit = -1; for (let h = 0; h < AP_HIT.length; h++) if (L >= AP_HIT[h][0]) hit = h;
  if (hit >= 0) bgFill(g, AP_HIT[hit][1]);
  // the flock. 46: each triangle leaves its zigzag place and lands in the big triangle's outline, two on each eighth
  // note (the bar's 8 hits), so the outline is built on the beat
  const fuse = eout(span(L, 7, 7.07));
  for (let k = 0; k < AP_N; k++){
    const slot = 24 + Math.floor(k / 2) * .5, dep = slot - .6, posAt = q => { if (q < dep) return apPos(k, q, sx, sy, sR); const a = apPos(k, dep, sx, sy, sR), p = AP_T[k], c = Math.cos(.18), sn2 = Math.sin(.18), b = [640 + (p[0] * c - p[1] * sn2) * 500, 560 + (p[0] * sn2 + p[1] * c) * 500], w = eout(span(q, dep, slot)), bow = .15 * Math.sin(Math.PI * w);
      return [lerp(a[0], b[0], w) - (b[1] - a[1]) * bow, lerp(a[1], b[1], w) + (b[0] - a[0]) * bow]; };
    const [x, y] = posAt(lb), [x0, y0] = posAt(lb - .25), landed = lb >= slot;
    const rot = landed ? .18 + (k % 2 ? .3 : -.3) : Math.atan2(y - y0 - 3, x - x0 + 6) + Math.PI / 2, born = lerp(.3, 1, eout(span(lb, k * .05, .6 + k * .05)));   /* (voyage handed them over at .3 size) */
    // r11c (all jurors: four colours, navy ones invisible on the blue, too small): white and mint only, ~30 % bigger
    const sz = (54 + 8 * (k % 3)) * born * (1 + .15 * s.k) * (1 + .25 * Math.sin(Math.PI * clamp((lb - slot) / .5))) * (1 - fuse);
    // 47.0: the one shake, then they fuse
    const sh = L >= 7 ? 12 * Math.sin((L - 7) * 900) * (1 - fuse) : 0;
    if (sz > .5) triK(g, x + sh, y + sh * .5, sz, rot, 0, k % 2 ? K.mint : K.white, 3);
    if (sn > .05 && L > .3 && L < 6 && (Math.floor(s.beat) * 7 + k) % 15 < 2) softGlow(g, x, y - sz * .2, 22 + 14 * sn, .7 * sn); }   // r18: a soft light, not a star
  // the big triangle: fused on 47.0, then one size smaller on each hit (squash on the hit, spring back), ending as solo's
  // (r16 audit, advocate: the squash-stretch made its orientation seem to jump on every card) a uniform pop only, the
  // angle fixed at solo's .18
  if (hit >= 0){ const [t0, , col, S] = AP_HIT[hit], S0 = hit ? AP_HIT[hit - 1][3] : 500, e = eout(span(L, t0, t0 + .06)), sz = lerp(S0, S, e) * fuse, sp = hit ? 1 + .12 * Math.sin(Math.PI * clamp((L - t0) / .08)) : 1;
    const sh = 14 * Math.sin((L - 7) * 900) * (1 - eout(span(L, 7, 7.1)));
    g.save(); g.translate(640 + sh, 560); g.rotate(.18); g.scale(sp, sp); poly(g, TRIS[3].map(v => v * sz), col); g.restore(); }
};
SC_.approachB = (g, s) => {   // (the r3-r10 rosette, replaced by the formation flight above)
  const lb = s.lb, cx = 960, cy = 540, dive = ein(span(lb, 28, 32));
  const st = rosStep(Math.min(lb, 28)) + 3 * dive;
  const enter = i => eback(span(lb, i * 4, i * 4 + 2.2)), grow = i => 1 + .7 * (1 - eout(span(lb, i * 4, i * 4 + 2.2)));
  skyBg(g, cx, cy, .95);
  const z = (1 + .1 * eio(span(lb, 0, 28))) * Math.pow(9, dive);
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  // bar 4: two white arcs, drawn on, turning slowly
  if (lb > 16){ const e = eout(span(lb, 16, 19)), r = -st * .25 - .6; for (const o of [0, Math.PI]){ g.beginPath(); g.arc(cx, cy, 842, r + o, r + o + 1.7 * e); g.arc(cx, cy, 830, r + o + 1.7 * e, r + o, true); g.closePath(); g.fillStyle = K.white; g.fill();
    g.beginPath(); g.arc(cx, cy, 866, r + o + .2, r + o + .2 + 1.2 * e); g.arc(cx, cy, 860, r + o + .2 + 1.2 * e, r + o + .2, true); g.closePath(); g.fill(); } }
  // bar 5: four halftone shapes on the diagonals, one per beat
  for (let j = 0; j < 4; j++){ const a = j * TAU / 4 + .78 + st * .15, p = pop(lb - 20 - j); if (p <= 0) continue; dotShape(g, j % 2 ? 0 : 2, cx + Math.cos(a) * 990, cy + Math.sin(a) * 990 * .62, 92 * p, a + Math.PI, j % 2, 18, s.T * 10); }
  // bar 3: the stripe arc comes in from outside
  if (lb > 12){ const r = grow(3), e = clamp(enter(3), 0, 1.1), a = st * .35 + Math.PI; stripeArc(g, cx, cy, 680 * r, 752 * r, a, a + 3.2 * Math.min(1, e), s.T * 40); }
  // bar 2: a ring of triangles, one pops in on every eighth note
  // r8f (health: 40.7 EMPTY; and the factory's garland had just been drawn into this disc): the ring of triangles is the
  // garland coming back out: from the downbeat they fly out of the disc one after another (one every 1/5 beat, eout over
  // 2 beats) to their places on the ring, white and mint like the garland
  for (let j = 0; j < 10; j++){ const u = span(lb, j * .2, j * .2 + 2); if (u <= 0) continue; const a = j * TAU / 10 - st * .4, d = lerp(40, 590, eout(u)), p = Math.min(1, u * 4);
    triK(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, (34 + (j % 3) * 7) * p * (1 + .2 * pulse(s.beat + j * .1, 6)), a + Math.PI / 2, 0, j % 2 ? K.mint : K.white, j); }
  // bar 1: the navy dotted arc
  if (lb > 4){ const r = grow(1), e = clamp(enter(1), 0, 1.1), a = st * .6 - 1.2; navyArc(g, cx, cy, 430 * r, 482 * r, a, a + 4.1 * Math.min(1, e), a + 1.1, a + 2.9 * Math.min(1, e), s.T * 18); }
  // bar 0: the disc, and a thin white ring drawn round it
  const e0 = eout(span(lb, 0, 3)); if (e0 > 0){ g.beginPath(); g.arc(cx, cy, 392, -1.57, -1.57 + TAU * e0); g.arc(cx, cy, 382, -1.57 + TAU * e0, -1.57, true); g.closePath(); g.fillStyle = K.white; g.fill(); }
  disc(g, cx, cy, lerp(260, 330, eio(span(lb, 0, 4))) + 10 * s.k);
  // bar 6: sparkles in the gaps, one more on every half beat, twinkling on the beat
  for (let j = 0; j < 8; j++){ const p = pop((lb - 24 - j * .5) * 2); if (p <= 0) continue; const a = j * TAU / 8 + .4 + st * .2; sparkle4(g, cx + Math.cos(a) * 530, cy + Math.sin(a) * 530, 24 * p * (1 + .5 * pulse(s.beat + j * .25, 5)), a, j % 2 ? K.cyan : K.white); }
  g.restore();
  // the protagonist circles the rosette, then spirals into the disc ahead of the camera
  if (lb > 2 && lb < 30.6){
    const Pp = τ => { const b = τ / BEAT, R = b < 6 ? lerp(1500, 860, eout(span(b, 2, 6))) : b < 24 ? 860 : lerp(860, 0, ein(span(b, 24, 30.6))), A = -2.2 + b * TAU / 16; return [cx + Math.cos(A) * R, cy + Math.sin(A) * R * .56]; };
    const sc = lerp(58, 6, ein(span(lb, 24, 30.6)));
    flight(g, Pp, s.T, sc, { trail: .9, from: 2 * BEAT, w: 6 * sc / 58 + 1 });
  }
  // r8b: no blinds any more (jury: hard rectangles read as a glitch); voyage's disc gathers into this disc on bar 39 and
  // its five key-visual lines (all there at the cut) are reeled in from their tails over this first bar (health: 40.7 EMPTY)
  /* r8d: (the factory version of voyage ends with the flock streaming into this disc; no lines to reel in) */
};
// 48–50 (1:06–1:08): the frame empties. On the downbeat it is one flat colour (navy) with ONE small white triangle
// in it (the 1:05 request; c.s.q.n. 1:24 / Memory Of Sunrise 0:28 use the same move: one readable mark on a
// flat ground before the drop). It does not fly and draws no line; it only breathes on the kick. On bar 49 it squashes
// and springs back and the ground flips to sky blue on that same frame (the change is caused by its move). In the last
// two beats it turns and grows where it is until its white fills the frame: the white flash that opens Drop 1.
SC_.solo = (g, s) => {
  const q = s.lb, flip = q >= 4;
  bgFill(g, flip ? K.sky : K.navy);
  const sq = flip ? span(q, 4, 4.5) : 0, squash = flip ? 1 - .32 * Math.sin(Math.PI * clamp(sq * 2)) * (sq < .5 ? 1 : 0) : 0;
  const re = flip && sq >= .5 ? eback(span(q, 4.25, 5)) : 1;
  // r7 (review: the idea is right but it had no impact): a bigger triangle that pops in on the cut, and a shock ring on
  // 48.0 (cream) and on the flip at 49.0 (navy), both with a hit in IMPACTS
  for (const [q0, col] of [[0, K.white], [4, K.navy]]){ const u = span(q, q0, q0 + 1.5); if (u > 0 && u < 1){ const r = lerp(80, 900, eout(u)); ring(g, 640, 560, r, r + lerp(10, 2, u), col); } }   /* r7c (visual): 10 px */
  const gr = ein(span(q, 6, 8)), sz = 120 * (1 + .06 * s.k) * Math.pow(24, gr);   // r11c: approach's flock merges into this triangle at full size, so no pop on 48
  const x = lerp(640, 960, eio(span(q, 6, 8))), y = 560 - 40 * gr, rot = .18 + 2.1 * eio(span(q, 6, 8));
  g.save(); g.translate(x, y); g.rotate(rot);
  if (flip && sq < .5) g.scale(1 + (1 - squash) * .9, squash); else if (flip && q < 5) g.scale(lerp(1.15, 1, re), lerp(.85, 1, re));
  poly(g, TRIS[3].map(v => v * sz), K.white);   // r4: the isosceles key-visual triangle (the slender one read as a mouse pointer)
  g.restore();
  const wf = ein(span(q, 7.3, 8)); if (wf > 0){ g.globalAlpha = wf; rect(g, 0, 0, W, H, K.white); g.globalAlpha = 1; }
};
// DROP 1 50–54: a new arrangement of the key visual slams in, one piece per beat
// r3 (jury): Drop 1 is ONE big event on the first beat (the disc springs open from a point with its frame: the stripes
// corner and the navy dotted arc land together), then a cloud rises; after that one accent per bar, and each new one
// replaces the last (in one, out one), so the frame never goes past 1 subject + 5 accents. The disc is smaller than
// the final drop's (C1 < C2 < C3).
const L_BURST = [
  { t: 'disc', x: 1240, y: 470, R: 470, at: 0, dur: .9, pop: 1, stay: true },
  // r16 audit (rhythm juror: the dotted arc hugging the disc had its upper end floating in the frame): the key visual's
  // corner arc, centre off the frame lower left, both ends past the edges, dotted along its whole length
  // r16 audit (rhythm juror: at 54 the stripe wipe came half a beat after the flash): tilt now cuts on the 54 flash, so
  // every piece except the disc (tilt carries it on) leaves in burst's last beat, back the way it came; the halftone
  // triangle slides in from the upper left instead of popping
  // (re-audit, rhythm juror: leaving over 14.8-16 the frame was an empty disc by the last frames, then tilt's arc popped
  // in) they start leaving half a beat before the cut and tilt draws the rest of their exits in its turning frame
  { t: 'stripes', corner: 'tl', s: 1.0, at: 0, dur: .5, from: [-700, -500], ease: eout5, out: 15.5, outDur: 1.3, to: [-700, -500], every: 1 },   // r4: steps on every beat
  { t: 'arc', cx: -60, cy: 1140, r0: 560, r1: 615, a0: -1.95, a1: .25, d0: -1.95, d1: .25, at: 0, dur: .5, from: [-500, 500], ease: eout5, out: 15.6, outDur: 1.3, to: [-600, 600] },
  { t: 'cloud', c: 'burst', x: 1580, y: 1000, s: 1.1, flip: 1, at: 1, dur: 2.2, from: [300, 700], ease: eout, out: 15.6, outDur: 1.4, to: [1000, -40] },
  { t: 'line', path: LINE(980, 260, 120, .2), w: 11, at: 2, draw: 2, double: true, out: 15.3, outDur: 1.5, to: [0, 0] },
  { t: 'tri', x: 820, y: 660, s: 90, rot: .5, col: K.white, k: 0, at: 4, pop: 1, out: 7.2, outDur: .8 },
  { t: 'tri', x: 1760, y: 170, s: 80, rot: 2.4, col: K.mint, k: 1, at: 8, pop: 1, out: 11.2, outDur: .8 },
  { t: 'dots', k: 1, x: 620, y: 220, r: 150, rot: .3, at: 12, dur: 2, from: [-600, -420], ease: eout, style: 1, out: 15.5, outDur: 1.3, to: [-600, -420] },
];
const L_BURST_OUT = L_BURST.filter(P => P.out !== undefined && P.out > 15);
SC_.burst = (g, s) => {
  skyBg(g, 1240, 470);
  // r16 audit: the roll settles to 0 over the last half bar (tilt starts at 0: it jumped ~1 deg on the cut)
  const z = 1.0 + .01 * pulse(s.beat, 5), roll = rollSnap(s, .03) * (1 - eio(span(s.lb, 14, 16)));   // r3: the extra per-kick zoom is gone (PUNCH covers it)
  g.save(); g.translate(W / 2, H / 2); g.rotate(roll); g.scale(z, z); g.translate(-W / 2, -H / 2);
  drawLayout(g, s, L_BURST, 16);
  g.restore();
  beatEvents(s, 3, 200, (b, a) => swooshEvt(g, b * 3 + 1, a, BEAT * 2.2, 8 + 7 * hash(b)), 2);   // (r16 audit: own beats only, from 200)
  for (const [t, kk, id] of onsetsIn(Math.max(s.t - .7, B(50)), s.t + 1e-6)) triBurst(g, id, s.t - t, W * (.25 + .5 * hash(id)), H * (.3 + .4 * hash(id + 3)), 2, 380 * kk, .7, 40);
  if (s.lb < .4){ g.globalAlpha = 1 - s.lb / .4; rect(g, 0, 0, W, H, K.white); g.globalAlpha = 1; }
};
// 54–58: the frame tilts; long white lines race; the stripes band sweeps every two bars; triangles race on the beat
SC_.tilt = (g, s) => {
  // r3: in bar 57 the frame rights itself and the disc settles in the centre at R 300 = plunge's first ring (anchored cut)
  // r5 (visual juror): the disc is a big edge arc at the lower right (fewer "big disc" frames), then settles in the centre
  // r9 (jury whole-song pass: the disc jumped from burst's (1240, 470, R 470) to a huge edge arc on the cut, and the
  // 4 loud bars were a disc and one band): the disc starts exactly where burst left it and glides out to the lower
  // right over 2 beats while the frame tilts in; the key visual's corner arc frames the upper left (a step a beat);
  // a long white line pair crosses the frame each bar; triangles race on the beat
  const k57 = eio(span(s.lbar, 3, 4)), kin = eio(span(s.lb, 0, 2)), roll = lerp(lerp(0, -.3, kin) + .04 * Math.sin(s.T * .8) * kin, 0, k57);
  const dx = lerp(lerp(1240, 1560, kin), 960, k57), dy = lerp(lerp(470, 980, kin), 540, k57), dR = lerp(lerp(470, 760, kin) + 15 * s.k, 300, k57);
  skyBg(g, lerp(lerp(1240, 600, kin), 960, k57), lerp(lerp(470, 540, kin), 540, k57));   // r16 audit: the glow starts where burst's was and ends where plunge's is
  // r16 audit: burst's contrails and triangle bursts still in flight on the cut finish here (they were cut off)
  beatEvents(s, 3, -1e9, (b, a) => { if (b < 216) swooshEvt(g, b * 3 + 1, a, BEAT * 2.2, 8 + 7 * hash(b)); }, 2);
  for (const [t, kk, id] of onsetsIn(s.t - .7, Math.min(s.t, B(54)) + 1e-6)) triBurst(g, id, s.t - t, W * (.25 + .5 * hash(id)), H * (.3 + .4 * hash(id + 3)), 2, 380 * kk, .7, 40);
  g.save(); g.translate(W / 2, H / 2); g.rotate(roll); g.translate(-W / 2, -H / 2);
  disc(g, dx, dy, dR);
  // (re-audit) burst's pieces finish leaving here, in the turning frame (on burst's clock: lb + 16, T + 4 bars)
  if (s.lb < 1.4) drawLayout(g, Object.assign({}, s, { lb: s.lb + 16, T: s.T + 4 * BAR }), L_BURST_OUT, 16);
  // r14 (review: at 79-80 s the change was too sudden; it should transform, or one side tightens into a vortex and then
  // blooms open into 80 s): over bar 57 everything in the frame is drawn into a vortex round the sun, turning faster
  // and shrinking into it, while six spiral arms wind tighter and tighter onto its rim; plunge opens with the same arms
  // unwinding outward (see vortexArms), so the cut at 58 is the vortex blooming open
  const vx = ein(span(s.lbar, 3, 4));
  // (r14b, advocate: drawn into the vortex the corner arc curled into a small "C" hanging mid-frame) the arc is not
  // part of the vortex: it slides out up-left as before
  // (r16 audit, my pass: on the cut from burst the arc was simply there) it slides in from beyond the upper left over the first beat
  { const ang = stepEase(s.lb, .3, eout) * .04 - .5 * (1 - kin) - .4 * k57, ex = eio(span(s.lbar, 3.1, 3.8)), en = 1 - eout(span(s.lb, 0, 1));
    g.save(); g.translate(-80 - 760 * ex - 760 * en, -60 - 560 * ex - 560 * en); g.rotate(ang);
    // r11 (review: at 75 s the upper-left arc still popped out; it should run on into the edge, no gap): the arc turns a step a
    // beat (up to .6 rad) inside a frame rolled by -.3, so its upper end came into view; both ends now run ~1 rad further
    g.beginPath(); g.arc(0, 0, 700, -1.3, 2.5); g.arc(0, 0, 630, 2.5, -1.3, true); g.closePath(); g.fillStyle = K.navy; g.fill();
    g.beginPath(); g.arc(0, 0, 745, -1.3, 2.5); g.arc(0, 0, 700, 2.5, -1.3, true); g.closePath(); g.save(); g.clip(); rect(g, -900, -900, 1800, 1800, K.navy); dots(g, -900, -900, 900, 900, 21, 4.4, K.white); g.restore(); g.restore(); }
  g.save(); if (vx > 0){ g.translate(dx, dy); g.rotate(3.2 * vx * vx); g.scale(Math.max(.001, 1 - vx), Math.max(.001, 1 - vx)); g.translate(-dx, -dy); }
  { const ph = fract(s.lbar), P = Math.floor(s.lbar) % 2 ? v => [lerp(-100, 2020, v), 980 - v * 700 + Math.sin(v * 3) * 50] : v => [lerp(-100, 2020, v), 760 - v * 640 - Math.sin(v * 2.6) * 60];
    kvLines(g, P, ein(clamp(ph * 1.4 - .4)), eout(clamp(ph * 3.5)), 9); }
  // r9b (visual juror: the band sweeping across read as a floating strip cutting the frame in two): the key visual's own
  // lower-right stripes wedge instead, stepping on every beat (it leaves as the disc settles in bar 57)
  kvStripeBand(g, stepEase(s.beat, .3, eout) / 2, eout(span(s.lb, 1, 2.5)) * (1 - eio(span(s.lbar, 2.75, 3.25))));   // r16 audit: it slides out over a beat before the vortex takes hold
  // (r16 audit: from tilt's own first beat, 216; events born earlier popped in mid-flight on the cut)
  beatEvents(s, 3, 216, (b, a) => { const u = a / (BEAT * 2.4); if (u > 1) return; const y = 180 + hash(b) * 720; triK(g, lerp(W + 200, -200, eout(u)), y, 60 + 30 * hash(b + 2), u * 6, u, TRI_COLS[b % 6], b); });
  beatEvents(s, 3, 216, (b, a) => swooshEvt(g, b * 3 + 2, a, BEAT * 2.2, 7 + 6 * hash(b)), 2);
  g.restore();   // the vortex
  vortexArms(g, dx, dy, dR, 1300 * (1 - .55 * vx), s.T * .5 + 5 * vx * vx, clamp(vx * 2.5), lerp(10, 16, vx));
  g.restore();
  // (r16 audit, rhythm juror: tilt's own triangle bursts read as confetti on the disc; removed, the racing triangles carry the beat)
};
// six spiral arms from the disc's rim (radius R) out to R + ext, turning 0.9 of a turn, phase ph (tilt's vortex, plunge's
// bloom)
// r14b (all three jurors: ~10 thin white turns read as a hypnosis disc / target and competed with hush's vortex): six
// pale-cyan arms, each only 0.6 of a turn, thick at the rim end and tapering out (filled wedge-like strokes)
// r15 (fresh eyes: all-light arms read as the same move as hush's white vortex): the arms alternate the key visual's
// stripe navy and pale cyan
function vortexArms(g, cx, cy, R, ext, ph, al, w){
  if (al <= 0 || ext < 2) return; g.globalAlpha = al;
  for (let a = 0; a < 6; a++){ const p0 = ph + a * TAU / 6, N = 28, P = []; g.fillStyle = a % 2 ? K.navy : '#9ee9ff';
    for (let i = 0; i <= N; i++){ const u = i / N, th = p0 + u * TAU * .6, r = R + 6 + ext * (1 - u), hw = (w * (.2 + .8 * u)) / 2, nx = Math.cos(th), ny = Math.sin(th);
      P.push([cx + nx * (r + hw), cy + ny * (r + hw), cx + nx * (r - hw), cy + ny * (r - hw)]); }
    g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); for (let i = P.length - 1; i >= 0; i--) g.lineTo(P[i][2], P[i][3]); g.closePath(); g.fill(); }
  g.globalAlpha = 1;
}
// 58–63: diving into the disc through rings of the key visual's arcs; white at the end
// 12 different clouds, 4 a layer (r12c fresh eyes: the flattest, 2:1 and wider, swapped for taller cumulus)
const PL_CL = ['HA_b0', 'HB_b4', 'fin_l', 'tower1', 'HB_r1', 'HB_low', 'HA_b4', 'burst', 'HB_b0', 'fin_r', 'HB_tower', 'HA_r1'];
const PL_RISE = ['HB_tower', 'fin_r', 'HA_b0', 'burst', 'tower1', 'HB_b0', 'fin_l', 'HB_low', 'HB_b4'];   // (whole-song pass: HA_r1's outline read as a rabbit)   // r16: the rising clouds (round cumulus only)
SC_.plunge = (g, s) => {
  const u = s.lbar / 5;
  skyBg(g, 960, 540);
  const R0 = lerp(300, 2400, Math.pow(u, 2.2));
  disc(g, 960, 540, R0);
  // r14: the bloom out of tilt's vortex: the same six arms (same phase, width and reach at the cut) unwind outward and
  // fade, a cream ring opens, eight triangles spring out of the rim like petals (first half bar)
  { const ub = span(s.lbar, 0, .5); if (ub < 1){ const e = eout(ub);
    vortexArms(g, 960, 540, R0, 585 + 1500 * e, (4 * BAR + s.T) * .5 + 5 + 2.2 * e, 1 - ein(ub), 16 * (1 - .5 * ub));
    // (r14b, visual: the bloom's ring and petals hardly showed) a 24 px cream ring, eight 56 px cream / mint petals
    const r = lerp(310, 1500, e); g.globalAlpha = (1 - ein(ub)) * clamp(ub / .072); /* r20 audit: fades in over 3 frames (it popped in whole on the cut) */ ring(g, 960, 540, r, r + lerp(24, 4, ub), '#fffef2'); g.globalAlpha = 1;
    for (let j = 0; j < 8; j++){ const a = j * TAU / 8 + .2, d = lerp(320, 1150, e); triK(g, 960 + Math.cos(a) * d, 540 + Math.sin(a) * d * .85, 56 * eout(Math.min(1, ub * 4)) * (1 - .4 * ub), a + Math.PI / 2, 0, j % 2 ? K.mint : '#fffef2', 3); }
    // (rhythm juror: clouds popped in on the cut and then the frame emptied) the bloom throws the first clouds out of
    // the sun towards the corners
    /* (r16: the clouds thrown out of the sun are gone; see the rising clouds below) */ } }
  // r6 (rhythm juror): the dive surges on each beat (60 % of the distance in the half beat after the kick) over a 40 %
  // constant floor, so it never stutters; from 62 (sparse kicks, the white comes) it is linear again. Same mean speed.
  // r11 (review: at 80 s, smoother, no stepping along the drum hits): one steady glide, a little faster towards the end
  const camZ = 1700 * (s.T + .08 * s.T * s.T / BAR);
  // r12 (jury whole-song pass: "centred disc + concentric rings" was used too often; the rings read as a gauge): we dive
  // through the cloud deck. About one layer a beat: a loose ring of cream clouds with a gap in the middle that we pass
  // through; every third layer is instead a key-visual arc piece sweeping past one side (centre off to the side, so it is
  // never a ring round the sun). Far layers come in out of the sky (alpha), near ones leave past the frame edges.
  // r12b (all jurors: 15-25 small look-alike clouds on screen read as stickers): only the two nearest layers are drawn
  // (at most 8 clouds), each layer four DIFFERENT big clouds out in the four corners framing a clear gap round the sun;
  // a layer comes in at depth 1500 growing from 0.3 to full size (opaque, no fading), and only layers that came in after
  // the cut are shown (nothing pops in on the cut); every third layer is left open
  // r16 (review: at 80 s these clouds suddenly appeared, a bit abrupt; they should rise slowly instead;
  // all four jurors: from below): we sink through the cloud deck, so the clouds RISE past us. One cloud every 2 beats,
  // left and right in turn, is born below the bottom edge (nothing on the cut frame, nothing appears inside the frame),
  // rises at a steady speed over 7 beats while it grows and drifts outward (it comes nearer), and leaves over the top;
  // three or four are on screen at a time. None are born after 62.25 (the white comes at 62.4).
  // (r16 audit, rhythm juror: thin at 58.1-58.3, and the overlap order flipped): two rise from 58.0, one each side; the
  // newest (farthest) are drawn first so the nearer, older ones stay in front
  for (let k = 9; k >= 0; k--){ const bornB = k < 2 ? 58 : 58 + (k - 1) * .5; if (bornB > 62.25) continue; const age = (s.t - B(bornB)) / (7 * BEAT); if (age <= 0 || age >= 1) continue;
    const side = k % 2 ? 1 : -1, x0 = 960 + side * (240 + 260 * hash(k * 5 + 1)), y = lerp(H + 420, -640, age), sc = lerp(.6, 1.5, age);
    cloudS(g, PL_RISE[k % PL_RISE.length], x0 + side * 420 * age, y, sc, 0, side > 0); }   // r16b (visual: HA_b4 showed a seam): own list
  // (r16 audit, my pass: a contrail popped in mid-flight on the cut from tilt) only plunge's own beats (from 232)
  beatEvents(s, 4, 232, (b, a) => { const R = mulberry32(b * 7); const v = a / (BEAT * 4); if (v > 1) return; const ang = R() * TAU, d = lerp(80, 1300, ein(v)); triK(g, 960 + Math.cos(ang) * d, 540 + Math.sin(ang) * d * .6, lerp(10, 90, v), R() * 6 + v * 4, v, TRI_COLS[(R() * 6) | 0], b); });
  beatEvents(s, 3, 232, (b, a) => swooshEvt(g, b * 3 + 3, a, BEAT * 2.4, 6 + 6 * hash(b), 1), 2);
  const wf = eio(span(s.lbar, 4.4, 5)); if (wf > 0){ g.globalAlpha = wf; rect(g, 0, 0, W, H, K.white); g.globalAlpha = 1; }
};
// GLIDE 63–66 (1:27–1:31): out of the white, the protagonist up close. The camera flies with the paper plane; the sun
// drifts behind it, light lines stream past on the half beats, a triangle passes on each beat; then it dives out of frame.
SC_.hover = (g, s) => {
  // r5 (visual juror, fresh eyes): out of the white we are ABOVE the clouds: no disc here, the subject is one big cloud
  // top sliding past under a pale sky (the light comes from the upper right); in the last 2 beats the camera tilts up and
  // horizon's sun jumps up out of its cloud sea
  // r11 (review: at 88 s the cloud must not slide downwards, it looks strange): no camera lift on 64 and no
  // tilt-up at the end any more. The cloud keeps flowing left; in the last beat it speeds away to the left (the way it
  // was already going), uncovering the sun, which is exactly horizon's sun on the cut (960, 890, R 420; horizon jumps it
  // up from there)
  // r16 audit (rhythm juror: the cloud was flung out in .17 s, ~6500 px/s): it accelerates out from 65.0, gone by 65.9
  // (r29 rules audit: ein over 3.6 beats still flung it out at ~22 -> 72 px a frame at 1:29.8-1:30.2) it sets off from
  // beat 6 and slides out with a sine in-out (2100 px: its 2400 px box is wholly out by 11.9; <= ~27 px a frame)
  const zip = esin(span(s.lb, 6, 11.9)), xo = -2100 * zip;
  const sx = 1260 - s.T * 46;
  skyBg(g, sx, 420);
  // r9 (advocate whole-song pass: "only clouds here"): from 64 horizon's sun shows its upper rim behind the cloud
  // top, rising a little each bar; a key-visual long line pair crosses the frame each bar
  // r9b (UA: at 64.8 still only clouds): the rim is up above the cloud from 64.0 and rises a step each bar after that
  { const y = s.lbar < 1.25 ? lerp(1560, 1010, eout(span(s.lbar, .5, 1.25))) : 1010 - 60 * stepEase(s.lbar - 1.25, .4, eout); if (y < 1520) disc(g, lerp(sx - 120, 960, eio(span(s.lbar, 2.25, 3))), y, 420 + 8 * s.k); }
  { const ph = fract(s.lbar), P = Math.floor(s.lbar) % 2 ? v => [lerp(-100, 2020, v), 420 - v * 260 + Math.sin(v * 3) * 50] : v => [lerp(2020, -100, v), 300 + v * 160 - Math.sin(v * 2.6) * 50];
    kvLines(g, P, ein(clamp(ph * 1.4 - .4)), eout(clamp(ph * 3.5)), 8); }
  hzFarSea(g, s.beat);   // r16 audit: horizon's far / mid cloud bands rise behind the sun in the last beat (see hzSeaRise)
  cloudS(g, 'hov_top', 980 - s.T * 40 + xo, 1190, 1.0);
  // far: sparkles drifting slowly; mid: light lines streaming past, a new one every half beat; near: one triangle per beat
  for (let i = 0; i < 7; i++){ const x = fract(hash(i + 70) - s.T * .07) * 2300 - 190 + xo * .3, y = 120 + hash(i + 80) * 820; sparkle4(g, x, y, 14 + 12 * hash(i + 90), s.T * .3 + i, i % 2 ? K.cyan : K.white); }
  // (r16 audit: the oldest line vanished ~60 px from the edge: 8 kept so each leaves the frame; they thin out over the last beat)
  { const fo = 1 - eio(span(s.lb, 11, 12)); if (fo > 0){ g.globalAlpha = fo; for (let k = 0; k < 8; k++){ const hb = Math.floor(s.beat * 2) - k, age = (s.beat * 2 - hb) * BEAT / 2; const y = 140 + hash(hb * 3.3) * 800; if (Math.abs(y - 560) < 90) continue; const x = W + 300 - age * 2600 + xo * .6; swoosh(g, u => [x + u * (520 + 900 * zip), y], 0, 1, 3 + 3 * hash(hb)); } g.globalAlpha = 1; } }
  // the plane: big, gliding, lifting a little on every beat; in the last half bar it noses down and dives out of frame
  const sb = s.t - s.T, D = τ => ein(span(τ / BAR, 2.45, 3));
  const P = τ => [760 + Math.sin(τ * .9) * 40 - (s.T - τ) * 900 + 1500 * D(τ), 540 + Math.sin(τ * 1.7) * 30 - 18 * lift((sb + τ - T0) / BEAT) + 900 * D(τ)];
  // r4: triangles keep at least 80 px off the disc's edge (near the edge they read as a speech-bubble tail)
  beatEvents(s, 3, 252, (b, a) => { const u = a / (BEAT * 3); if (u > 1 || b > 261) return;   /* r16 audit: 3 beats to cross (was 1.6); none born after 65.25 */ const R = mulberry32(b * 5 + 1), y = R() < .5 ? 60 + R() * 120 : 900 + R() * 140, x = W + 200 - u * 2600 + xo;
    if (Math.hypot(x - sx, y - 420) < 470 + 80 + 60) return; triK(g, x, y, 110 + 40 * R(), u * 4 + R() * 6, u, TRI_COLS[b % 6], b); });
  const wf = 1 - eout(span(s.lb, 0, 1.2)); if (wf > 0){ g.globalAlpha = wf; rect(g, 0, 0, W, H, K.white); g.globalAlpha = 1; }
};
// EXPANSION 66–70 (r4): the sun jumps up from behind a sea of clouds. No rays and no road grid any more: the fresh-eyes
// reviewer warned that a half sun on a horizon with alternating rays can read as a flag, and the grid as generic
// synthwave. The cloud sea drifts slowly; on the beat a triangle flies out of the distance; a contrail every 2 beats.
SC_.horizon = (g, s) => {
  const hz = H * .56;
  skyBg(g, 760, hz);
  // r6: the camera change at 68 (rhythm juror, advocate): a 6 % push toward the sun in 1 beat (not in the montage,
  // whose cuts are anchored on this disc); the sun hops a little on each kick (fresh eyes)
  const cam = s.noPlane ? 0 : eout(span(s.lbar, 2, 2.25)); g.translate(760, hz + 30); g.scale(1 + .06 * cam, 1 + .06 * cam); g.translate(-760, -hz - 30);
  disc(g, 760, hz + 30 + 520 * (1 - eback(span(s.lb, 0, 1.4))) - 8 * s.k, 420 + 10 * s.k);
  // r5 (visual juror): one cloud only (two read as a band with a seam); it rises in on the first beat (no pop on the cut)
  // r6: the cloud steps once per bar (was a linear drift); the bar-68 camera change is a planned hit in IMPACTS
  const dr = 22 * stepEase(s.lbar, .4, eout); if (!s.noPlane) cloudS(g, 'hz_a', 420 - dr, 1060 + 260 * (1 - eout(span(s.lb, 0, 1.5))), .9);   // r6b (visual, fresh eyes): no cloud in the montage (it floated as a loaf)
  beatEvents(s, 4, -1e9, (b, a) => swooshEvt(g, b * 5 + 7, a, BEAT * 2.4, 6), 2);
  beatEvents(s, 4, -1e9, (b, a) => { const u = a / (BEAT * 3); if (u > 1) return; const k = 1 / Math.max(.12, 1 - u); triK(g, 760 + (hash(b) - .5) * 600 * k, hz - 160 * k * .7, 20 * k, b + u * 3, u, TRI_COLS[b % 6], b); });
};
// 70–74: the stripes fill the frame again, but now they turn on every bar (c.s.q.n. 0:46–0:56; r3 visual P3): 50°,
// then mirrored, then flat, then upright and stepping on every 16th in the fill bar; two colours only. The disc is a
// window cut out of the stripes (the first time it appears as a hole). In the last beat the window glides to the
// centre and shrinks to arcs' disc, so the cut at 74 is anchored.
const BAND_ANG = [-.87, .87, 0, Math.PI / 2], BAND_W = [92, 72, 120, 64];
SC_.band = (g, s) => {
  // r6 (health: 6 JUMPs + SNAPs; rhythm juror): the angle switches ON the downbeat frame of 71 / 72 / 73 (a planned hit
  // in IMPACTS), no 5-frame swing through a vertical-stripe flash frame; in the fill bar 73 the stripes step only on the
  // real onsets (16ths 2, 4, 6, 10, 13, 15 from drums16), half a stripe each, eased over a whole 16th
  // (final check, visual: the angle switch on each downbeat was a 1-frame jump) it turns over the first 1/8 beat of the bar
  // (r25c whole-song review, advocate and fresh eyes both: the whole frame turned 45-100 deg in ~5 frames on each
  // downbeat, jumping with the drums, a glitch) each turn now spans 2 beats round its downbeat (esin, from a beat
  // before to a beat after; at most ~3.8 deg a frame)
  const L = s.lbar, tw = k => esin(span(L, k - .25, k + .25));
  let ang = BAND_ANG[0], w = BAND_W[0]; for (let k = 1; k <= 3; k++){ const e = tw(k); ang += (BAND_ANG[k] - BAND_ANG[k - 1]) * e; w += (BAND_W[k] - BAND_W[k - 1]) * e; }
  // r16e (frame scan: the whole stripe field jumped half a stripe on every beat, a full-frame twitch): the stripes
  // flow continuously (half a stripe a beat) with only a soft swell after each beat, and the fill bar 73 does the same
  const fb = fract(s.beat), step = (s.beat + .18 * (eout(fb) - fb)) * w / 2;
  bgFill(g, '#03368b');
  stripes(g, 960, 540, ang, w, step, ['#03368b', '#0874ff']);
  const toArcs = eio(span(s.lb, 15, 16)), cx = lerp(1260, 960, toArcs), cy = lerp(500, 540, toArcs), R = lerp(380 + 10 * s.k, 330, toArcs);
  // r16 (review: 96-100 s was clearly thin, very little content; jurors B): the stripes are lanes: on every beat a small
  // cream / mint triangle slides along this bar's stripes across the whole frame (2 beats, passing behind the window),
  // at most ~3 at a time; they never step
  // (self-check: one a beat at 30-46 px hardly read) one every eighth, 40-62 px; the last leaves before the cut at 74
  { const h0 = Math.floor(s.beat * 2);
    for (let hb = h0 - 4; hb <= h0; hb++){ const bb = hb / 2, u = (s.beat - bb) / 2; if (u <= 0 || u >= 1 || bb < 280 || bb > 293.5) continue;
      // (r25c) they ride the field as it turns (its current angle), so they never cross the stripes
      const a2 = ang, ddx = -Math.sin(a2), ddy = Math.cos(a2), off = (hash(hb * 3) - .5) * 1500, dir = hb % 2 ? 1 : -1, along = lerp(-1250, 1250, u) * dir;
      const x = 960 + Math.cos(a2) * off + ddx * along, y = 540 + Math.sin(a2) * off + ddy * along;
      triK(g, x, y, 56 + 24 * hash(hb), Math.atan2(ddy * dir, ddx * dir) + Math.PI / 2, 0, hb % 3 ? '#fffef2' : K.mint, hb); } }   // (r16e rhythm: bigger)
  // (final check, rhythm juror: still thin) a key-visual long line pair crosses the stripes each bar from 71, reeled in by
  // the end of its bar (gone on the cut); (r16e visual: across the window it read as Saturn's ring) drawn behind the window
  if (L >= 1){ const ph = fract(L), P = Math.floor(L) % 2 ? v => [lerp(-100, 2020, v), 980 - v * 760 + Math.sin(v * 3) * 50] : v => [lerp(2020, -100, v), 200 + v * 640 - Math.sin(v * 2.6) * 50];
    kvLines(g, P, ein(clamp(ph * 1.4 - .4)), eout(clamp(ph * 3)), 8); }
  // a key-visual dotted arc band hugs the window (three quarters of a turn, turning slowly and steadily)
  // (it shortens away from its tail over the last 2 beats: arcs has no such band)
  // r16 audit (visual, self: at 73.5 the window's clouds vanished in one frame, and on the cut the stripes vanished in one
  // frame): over the last 2 beats the stripes are covered by arcs' sky (to 100 % on the cut) and arcs' two corner arcs
  // sweep in, all drawn BEFORE the window (the window used to be redrawn plain on top, wiping its clouds)
  // (re-audit: the overlay used band's own royal tone, a step darker than arcs' sky) it is painted in arcs' tone (S)
  { const u = eio(span(s.lb, 14, 16)); if (u > 0){ const sv = SKYT; SKYT = TONES.S; g.globalAlpha = u; skyBg(g, 960, 540); g.globalAlpha = 1; SKYT = sv;
    const fo = 700 * (1 - eout(span(s.lb, 14, 16)));
    arcsMorph(g, s.t, 0, 0, fo, 0); if (s.lb >= 14.4) arcsWisps(g, (s.lb - 16) / 4); } }   // r15: the same shape arcs then turns and wraps round the disc; r21: arcs' first wisp comes in over band's last beat
  // r16b (fresh eyes: three quarters of a ring round the window read as a gauge again): a third of a turn, sweeping round;
  // (audit, visual: shortening away it broke into stubs) it now leaves whole, widening out past the frame
  // (r16 audit, rhythm juror: its two ends floated in the frame, a repeated review note): removed
  ring(g, cx, cy, R, R + 34, K.ring);
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip(); disc(g, cx, cy, R, 0);
  // the window: the key visual's day sky flows past inside it (two cloud layers drifting left at two speeds; in bar 73
  // a small V of triangles crosses it), so the stripes outside and the sky inside are one picture
  // (audit: before the cut into arcs the clouds slide out of the window the way they drift, to the left)
  const wo = 1000 * ein(span(s.lb, 13.5, 15.5));
  for (let j = 0; j < 4 && wo < 999; j++){ const far = j < 2, sp = far ? 70 : 150, per = 1500, x = cx + 760 - (((s.T + 3.1 * j) * sp + j * 520) % per) - wo * (far ? .7 : 1), y = cy + (far ? -150 + j * 120 : 120 + (j - 2) * 140);
    g.globalAlpha = far ? .55 : .95; cloudS(g, ['HA_b2', 'HB_r1', 'HA_b0', 'HB_b4'][j], x, y, far ? .34 : .5); g.globalAlpha = 1; }
  { const u = span(L, 3, 4); if (u > 0 && u < 1) for (let j = 0; j < 5; j++){ const o = Math.abs(j - 2), x = lerp(cx + R + 160, cx - R - 160, u) + o * 60, y = cy - 40 + (j - 2) * 46; triK(g, x, y, 26, -Math.PI / 2, 0, j % 2 ? K.mint : '#fffef2', j); } }
  g.restore();
  // one contrail crosses in bars 70-72, and one white triangle rides the edge of the window on the beat
  { const hd = eio(span(s.lb, 0, 6)), tl = ein(span(s.lb, 5, 9)), path = v => [lerp(-80, 2000, v), 1020 - v * 700 + Math.sin(v * 3) * 40]; if (hd > tl) lines2(g, path, tl, hd, 9, 18); }
  { const a = -Math.PI / 2 + stepEase(s.beat, .5, eout) * TAU / 8, sz = 44 * (1 - eio(span(s.lb, 14, 15.5)));   /* r6: eout over half a beat (no whip); audit: it shrinks away before the cut */ if (sz > .5) triK(g, cx + Math.cos(a) * (R + 70), cy + Math.sin(a) * (R + 70), sz, a + Math.PI / 2, 0, K.white, 0); }
  // (r9b's sky fade and corner arcs are drawn above, before the window)
};
// 74–78: concentric navy arcs turn around the disc, a step per bar; lines orbit; puffs pass
// r15 (review: at 106 s the two rings were too big; at 107 s these two rings should close round the circle, one
// animation): the two key-visual corner arcs (smaller than before; centres outside the frame so both ends run past the
// edges) and their wrap round the disc are one shape: every point of each arc glides, in polar coordinates round the
// disc, from its place on the corner arc (m 0) to its place on a ring round the disc (m 1): the lower-left arc becomes
// the left half, the upper-right arc the right half, so they never cross. The dotted band stays on the disc side.
// st = slow turn of the corner arcs, fo = how far they still are outside their corners (band's sweep-in), rot = the
// ring's own slow turn once closed
// r15b (visual, advocate: point by point the arcs bent into an S / went straight on the way; fresh eyes: the two
// halves met at different radii): circle to circle instead. Each arc stays a true circular arc the whole way: its centre
// slides from its corner to the disc's centre, its radius shrinks 860 / 820 -> RO, its span opens 0.72 pi -> pi, so its
// bend only ever tightens; both end on the same radius as the two halves of one ring (navy band inside, dotted band
// outside, as on the corners). On the way they pass behind the disc (arcs draws the disc over them).
// r15c (self-check: sent to the far halves they crossed into an X over the disc): each arc slides along its own
// shrinking circle, both turning the same way (anticlockwise) like a pinwheel: the lower-left arc becomes the left half,
// the upper-right arc the right half, so they never meet until they close
// r16 (review, a second time: at 104 s the rings were even bigger; they should be smaller, then one whole animation joining onto
// the middle circle): the corner arcs are now the key visual's own corner-arc size (r 520 / 500, as in horizon), their
// centres just outside the corners (both ends still run off the frame), and the closed ring's navy band starts right on
// the disc's rim (RO 332 = disc 330 + its rim) so the ring and the circle become one piece
const ARC2 = [{ cx: -60, cy: 1140, r: 520, a0: -Math.PI * .62, sg: 1, f1: -Math.PI * 1.5, ox: -1, oy: 1 }, { cx: 1980, cy: -60, r: 500, a0: Math.PI * .38, sg: -1, f1: -Math.PI * .5, ox: 1, oy: -1 }];
function arcsMorph(g, sT, m, st, fo, rot){
  const D = [960, 540], RO = 332, LEN = Math.PI * .72;
  for (const A of ARC2){
    const cx = lerp(A.cx + A.ox * fo, D[0], m), cy = lerp(A.cy + A.oy * fo, D[1], m), r = lerp(A.r, RO, m);
    const a0 = lerp(A.a0 + A.sg * st, A.f1 + rot, m), len = lerp(LEN, Math.PI, m);
    const band = (d0, d1) => { g.beginPath(); g.arc(cx, cy, r + d1, a0, a0 + len); g.arc(cx, cy, r + d0, a0 + len, a0, true); g.closePath(); };
    band(0, 26); g.fillStyle = K.navy; g.fill();
    g.save(); band(34, 76); g.fillStyle = K.navy; g.fill(); g.clip(); dots(g, -200, -200, 2200, 1300, 21, 4.4, K.white, sT * 14, 0); g.restore(); }
}
// r25c: the closed ring (arcsMorph at m 1) at any radius round the disc: no ends at all
function arcsRing(g, sT, r){
  const band = (d0, d1) => { g.beginPath(); g.arc(960, 540, r + d1, 0, TAU); g.arc(960, 540, r + d0, TAU, 0, true); g.closePath(); };
  band(0, 26); g.fillStyle = K.navy; g.fill();
  g.save(); band(34, 76); g.fillStyle = K.navy; g.fill(); g.clip(); dots(g, -200, -200, 2200, 1300, 21, 4.4, K.white, sT * 14, 0); g.restore();
}
// arcs' two passes of key-visual wisps across the upper sky (L = bars from 74; the first pass starts in band's last beat)
function arcsWisps(g, L){
  for (const [l0, y0] of [[-.4, 120], [2, 70]]){ const u = span(L, l0, l0 + 2.2); if (u > 0 && u < 1){ cloudS(g, 'HA_tr', lerp(2300, -700, u), y0, .5, 0, true); cloudS(g, 'HA_r5', lerp(2700, -400, u), y0 - 50, .38); } }
}
SC_.arcs = (g, s) => {
  skyBg(g, 960, 540);
  // r7 (review: the 1:46-1:49 montage "suddenly turned several times"): no montage any more; arcs runs 74-80 as one shot
  // that sets into night: in bar 78 the arcs close in on the disc one notch per beat, in bar 79 the disc sinks out of
  // frame while the sky deepens to trance's night and its stars come on, so the cut at 80 is the same night
  // r16: the close-in is one smooth move with the wrap (it stepped a notch per beat)
  const L = s.lbar, con = eio(span(L, 4, 5)), sink = eio(span(L, 5, 6)), night = eio(span(L, 4.5, 5.75));
  // r7c (jury r7b: 2 s of empty navy at 1:49.5): the stars are lit from 79-79.5 (reveal .45, >= 30 mid stars) and the disc
  // only sets to y ~1150 like a sunset (it keeps sinking under trance's first bar); the arcs fade out over 79.25-79.9
  // (r16 audit, visual: 1:49.4-1:50.3 was ~1.3 s of only cloud silhouettes and a few stars) more stars, and one meteor
  // across the new night over 79.2-79.9 (gone before the cut)
  // r19 (rhythm #1, open since r13: the night fell ~2 bars before the music's quiet on 81; the drums play on through 79-80):
  // arcs only sets into a dusk (the night sky lifted .45, royal blue) with the first few stars at the zenith; trance
  // presses it to navy over 80.5-81 and lights the stars over 80.75-81.25, so the night lands on 81's quiet
  if (night > 0){ g.globalAlpha = night; nightSky(g, .45); g.globalAlpha = 1; drawStars(g, s, night * .3, night);
    meteor(g, 1700, -120, MET_ANG, 2400, 760, span(L, 5.2, 5.9), 8); meteor(g, 1250, -140, MET_ANG + .03, 2200, 640, span(L, 5.45, 5.98), 6); }   // re-audit: a second one
  const arcA = 1 - eio(span(L, 5.25, 5.9));
  // r19: the sun only sets half way in 79 (its top still well above the cloud line at the cut); trance finishes the setting
  g.save(); g.translate(0, 420 * sink); g.translate(960, 540); g.scale(1 - .4 * con, 1 - .4 * con); g.translate(-960, -540);
  // r3: at bar 76 a soft camera change (K): the disc slides half out of frame to the right and the arcs, 1.5x bigger,
  // fill the left -- the navy dotted arcs become the subject (rhythm juror; advocate #8)
  // r5: the shift returns to the centre in the last half bar, so the montage's first cut is anchored on the disc
  /* (r14: since r9 a mid-line comment had swallowed this camera shift and its g.save(), so it never ran and an extra
     g.restore() below popped drawScene's state; the approved look is the one without it, so it stays off and the
     save / restore pairs are balanced again) */
  // r16e (health: STILL at 75.4 once the corner arcs were smaller and smooth): two key-visual wisps drift slowly across the
  // upper sky from the right over 74-78 and are gone (out to the left) before the wrap
  // (whole-song pass, advocate: 1:42-1:48 still "one thing moving") two passes of wisps (74-76, 76-78), and a light
  // ring leaves the sun on each downbeat 75-77 (the corner arcs cannot turn further: their ends would come into frame)
  // (r20 audit, visual: ~1 beat round the cut from band was only the pale disc and the corner arcs) the downbeat ring also
  // leaves on 74.0, and the first wisp is already on its way: band draws it from 73.6 (arcsWisps, same clock), so it
  // comes over the right edge ~73.75 and carries on across the cut
  arcsWisps(g, L);
  // (r22 whole-song pass, both jurors: 1:42-1:47 still one disc and two corner arcs on empty blue) a key-visual cloud bank
  // rises slowly from below the lower left over 74.5-76 and one at the lower right over 75.5-77; both drift, and leave
  // sideways (left / right) over 77.2-78, before the wrap and before the night's silhouettes rise
  // (r22 framescan: the right one's top was already in frame when it started, and the ein exits ran out at ~59 px a frame)
  // both start wholly below the frame and rise with eio; they leave with eio over the last 1.4-1.6 bars (~13 px a frame)
  // (r23b: with the cubic eio these peaked at ~13 px a frame rising and ~30 leaving) sine in-out: ~7 rising, ~15 leaving
  { const lu = esin(span(L, .4, 2)), lo = esin(span(L, 2.4, 4)); if (lu > 0 && lo < 1) cloudS(g, 'HB_low', 220 - 18 * L - 1300 * lo, 1500 - 560 * lu, 1.0); }
  { const ru = esin(span(L, 1.4, 3)), ro = esin(span(L, 2.6, 4)); if (ru > 0 && ro < 1) cloudS(g, 'HA_b0', 1760 + 14 * L + 1100 * ro, 1500 - 510 * ru, .9, 0, true); }
  if (L >= 0 && L < 4){ const u = fract(L); if (u < .7){ const r = lerp(360, 1100, eout(u / .7)); g.globalAlpha = .7 * (1 - u / .7) * clamp(u / .03); ring(g, 960, 540, r, r + lerp(14, 3, u / .7), '#fffef2'); g.globalAlpha = 1; } }
  // r15b: the arcs are drawn before the disc so on their way round they pass behind it; (rhythm juror: the ring closed
  // 0.4 beat before any beat) the wrap now runs over the whole of bar 78 and locks on the 79 downbeat
  // (r25c whole-song review, advocate + fresh eyes: winding into the ring, the two arcs' flat ends hung in mid-frame
  // over 1:47.7-1:48.3, the rule "arc ends never float in the frame") the wrap now closes beyond the frame: the corner
  // arcs swing out past their corners (3.9-4.6, ends always off the frame), and the ring, already closed, comes back in
  // from beyond all four corners and settles on the disc's rim on the 79 downbeat (4.1-5.0, sine in-out); it is the same
  // ring as before from 5.0 on
  // (self-check: with the arcs out by ~4.15 and the ring in from ~4.45 there was ~.4 s of the bare disc) the arcs leave
  // the frame ~4.3 and the ring comes over the corners ~4.37
  // (r26 fresh eyes: still ~.3 s of the bare disc at 1:47.4-1:47.7) the ring sets off earlier and overlaps the arcs' exit
  g.globalAlpha = arcA; if (arcA > 0){ const out = esin(span(L, 4.05, 4.6)), rin = esin(span(L, 3.85, 5));
    if (out < 1) arcsMorph(g, s.t, 0, .02 * s.lb, 900 * out, 0);
    if (rin > 0) arcsRing(g, s.t, lerp(1350, 332, rin)); }
  g.globalAlpha = 1;
  disc(g, 960, 540, 330 + 8 * s.k);
  g.globalAlpha = arcA; if (arcA > 0){
  // r9 (jury whole-song pass: short arc stubs and thin ellipses round a centred disc = a gauge, and "broken arcs" again):
  // two WHOLE key-visual corner arcs, their centres outside the frame (lower left, upper right) so both ends always run
  // past the edges, turning a step per beat in opposite directions; in bar 78 they close in on the disc a notch a beat
  // (self-check: as they closed in their ends came into the frame) while closing in they also lengthen, and at the end
  // of bar 78 they are the two halves of one ring round the disc (as in inhale)
  // (cut audit: they popped in on the cut from band) they sweep in from outside the frame over the first 1.5 beats
  // r9b (rhythm juror: the cut from band's full stripes to light sky was "fullest to emptiest"): the arcs now sweep in
  // over band's last 2 beats (see band), so here they are already in place
  // r9b (all four: closing in, the two arcs crossed into an "S / 6"): in bar 78 the corner arcs slide back out of the
  // frame over its first half, and over its second half two half-rings are drawn round the disc one step per beat,
  // meeting at 3 and 9 o'clock (the same "two halves make a ring" as inhale)
  // r15: the corner arcs turn slowly and smoothly (no beat steps), and over bar 78 they wrap round the disc in one move
  // (drawn above, behind the disc)
  // (audit, visual: on the cut from band a whole contrail appeared in ~5 frames) the first bar's pair draws in over a beat
  // (r16 audit, visual: a contrail crossing the closed ring read as "Saturn") none from bar 78, when the ring wraps
  if (L < 4){ const ph = fract(L), P = Math.floor(L) % 2 ? v => [lerp(-100, 2020, v), 900 - v * 640 + Math.sin(v * 3) * 50] : v => [lerp(2020, -100, v), 860 - v * 560 - Math.sin(v * 2.6) * 50];
    kvLines(g, P, ein(clamp(ph * 1.4 - .4)), L < 1 ? eio(clamp(ph * 3)) : eout(clamp(ph * 3.5)), 8); }
  spawnPops(s.t, .8, (n, a) => { if (n.i % 2) return; const ang = hash(n.i) * TAU; triK(g, 960 + Math.cos(ang) * 640, 540 + Math.sin(ang) * 380, 36 * pop(a / BEAT) * (1 - ein(span(a, .5, .8))), ang, 0, TRI_COLS[n.i % 6], n.i); });
  } g.globalAlpha = 1;
  g.restore();
  // r8: the night cloud silhouettes rise in over bar 79 (trance keeps them), so the night has a horizon from the start
  // r8d (review: at 109-110 s the clouds at the bottom suddenly jerked left): arcs' camera rolls ~6 degrees over the shot and
  // resets on the cut; the cloud horizon is drawn outside the camera so it is the same picture on both sides of 80
  // (r16 audit, visual: their tops showed at the bottom edge from the first frame) from 700 px down, rising smoothly from 78.75
  // r19 (framescan: against the brighter dusk the dark silhouettes rose ~11 px a frame and flagged as pops; the rule: clouds
  // rise SLOWLY) the rise starts half a bar earlier, runs 1.7 bars and starts only 450 px down, so the tops come over the
  // bottom edge around 79.1 at ~5 px a frame and slow from there (from 700 px they entered at their fastest)
  // (r23b: the cubic eio peaks at 3x the mean, so this was ~10 px a frame, not ~5) a sine in-out: ~5 px a frame
  if (L >= 4.25){ g.save(); g.setTransform(SC, 0, 0, SC, 0, 0); nightClouds(g, s.t - B(79), 450 * (1 - esin(span(L, 4.25, 5.95)))); g.restore(); }
};
// r5: horizon / arcs / horizon; every cut is anchored on the same disc point (centre, R 330); no third full-frame stripes
SC_.montage = (g, s) => { const k = s.lb >= 6 ? 0 : [0, 2, 0][Math.floor(s.lb / 2) % 3]; const up = eio(span(s.lb, 7, 12)), ss = Object.assign({}, s, { lb: s.lb + 8, lbar: s.lbar + 2, noPlane: true, mUp: up });
  g.save(); g.translate(0, 760 * up); if (k === 0){ g.translate(960, 540); g.scale(330 / 420, 330 / 420); g.translate(-760, -635); } (k === 0 ? SC_.horizon : SC_.arcs)(g, ss); g.restore(); };
// TRANCE 80–96 (1:49.9–2:11.8): soothing, hazy, one long shot (r3: visual §6.3, ideas §3.4, advocate). The sky
// deepens to navy and the frame narrows (a lit column in the middle, navy at the sides: the narrowest stereo of the
// song); the moon rises 82–84 and at 84 (1:55.37) the shot slowly opens: the column widens, one ripple leaves the
// moon every 2 bars, ONE slow line at a time is drawn and withdrawn; the 16th-note pulse is only single halftone dots
// lighting up beside the column. 88–94: one night-coloured cloud drifts across the moon. Nothing else.
const TR_LINES = [[4, -1, .80], [8, 1, .88], [11, -1, .84]];   // [start bar (local: 84, 88, 91), direction, height] (r5: below the moon); r16 audit: the last starts at 91 so it is fully withdrawn by the cut (it was cut off half way)
// r6 (health: trance STILL x6, motion .39, the lowest of the song; gate r5b consensus): from 83, where the drums come in,
// one ripple leaves the moon on each downbeat: an opaque ladder ring (#0b8ef4), 10 px, that spreads out with eout over
// 2 bars and thins as it goes (no translucent white, so no grey). TRANCE_DOTS = option B for the jury: rings of the key
// visual's halftone dots instead (one per bar, every half bar from 88, 4-bar life, dots swell on the hats).
let TRANCE_DOTS = false;
let TR_MOON = null;   // [x, y, R] of the moon this frame, so breathe() can keep its rim visible above the low-cut veil
const TR_RIP = [2.75, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
function tranceRipples(g, s, mx, my, mR){
  const L = s.lbar;
  /* r7c (rhythm juror): the first ripple leaves on 82.75 (the fill into the drums), then one per downbeat from 84 */
  // r15 (review: at 120 s the ripples vanished abruptly: the third one wiped out the first before it had faded): each ripple
  // lives 2.6 bars and fades out completely over its second half (so up to three overlap); the last ones are shortened
  // so they are gone before the 96 cut
  for (const born of TR_RIP){ const life = Math.min(2.6, 15.8 - born), age = L - born; if (age < 0 || age >= life) continue;
    const u = eout(age / 2.6), r = lerp(mR + 110, 1100, u), w = lerp(10, 2, age / 2.6); g.globalAlpha = 1 - eio(span(age, life * .45, life)); ring(g, mx, my, r, r + w, '#0b8ef4'); g.globalAlpha = 1; }
  // r14 (rhythm juror: 94-96 the music builds, the picture did not): from 94 a short ripple on every beat, all run out
  // by 95.75 so the match cut at 96 stays clean (r27 removed them for the flock's dive; r28: the flock is off, they are back)
  if (!TRANCE_FLOCK) for (let born = 14; born < 15.3; born += .25){ const age = L - born; if (age < 0 || age >= .5) continue;
    const u = eout(age / .5), r = lerp(mR + 60, mR + 420, u); g.globalAlpha = 1 - age / .5; ring(g, mx, my, r, r + lerp(8, 2, u), '#42cefb'); g.globalAlpha = 1; }
}
const TR_RINGS = (() => { const r = []; for (let b = 3; b < 8; b++) r.push(b); for (let b = 8; b < 15; b += .5) r.push(b); return r; })();
function tranceRings(g, s, mx, my, mR){
  const L = s.lbar, hat = hatAt(s.t);
  for (let i = 0; i < TR_RINGS.length; i++){ const age = L - TR_RINGS[i]; if (age < 0) break; const u = age / 4; if (u >= 1) continue;
    const r = lerp(mR + 120, 1400, 1 - Math.pow(1 - u, 1.6)), rd = lerp(7, 3, u) * (1 + .4 * hat), n = Math.max(12, Math.floor(TAU * r / 34)), ph = (i % 2 ? 1 : -1) * s.T * .04 + i * .37;
    g.globalAlpha = Math.pow(1 - u, 1.3) * .8 * Math.min(1, age * 4); g.fillStyle = '#9ee9ff'; g.beginPath();
    for (let j = 0; j < n; j++){ const a = ph + j * TAU / n, x = mx + Math.cos(a) * r, y = my + Math.sin(a) * r; if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue; g.moveTo(x + rd, y); g.arc(x, y, rd, 0, TAU); }
    g.fill(); }
  g.globalAlpha = 1;
}
// r28 (review, after seeing it: revert it, no chase needed): the r27 flock is off; trance is r26b's again
const TRANCE_FLOCK = false;
// the moon's wander (L = bars from 80, T = the scene's seconds); see the r10 / r13 notes in SC_.trance
function trMoonAt(L, T){ const rise = eout(span(L, 1, 3)), wp = eio(span(L, 3, 15)), wand = Math.sin(Math.PI * wp);
  return [960 - 380 * Math.sin(TAU * wp), lerp(1300, 400, rise) - 70 * wand + 10 * Math.sin(T * .25) * (1 - eio(span(L, 15, 16))) + 360 * eio(span(L, 15, 16))]; }
// r27 (fresh eyes twice: "a screensaver, one moon drifting for 19 s while the music builds"; jury_r27_advocate / _rhythm):
// the nine wander the night ONCE (a loop would read as "the same every few bars"). They rise out of the cloud sea
// (84), turn up the right side, cross under the moon the other way (89), climb the left side and, with the build (92-94),
// sweep over the top and slip behind the moon at its upper-left rim (94-95.5); the moon then sets into bloom's sun. They
// never pulse or flash on the drums; until the dive every member keeps >= R + 150 px from the moon (advocate's check:
// nearest 392 px at 89.4; at most ~6 px a frame). It also starts the song's thread of the nine triangles (the outro).
const TRF_K = [[84, 1350, 1150], [86, 1560, 520], [87.25, 1560, 700], [89, 960, 760], [90.5, 420, 690], [91.75, 360, 420], [93, 460, 190], [94, 700, 150], [95.5, 1010, 300]];
function hermKeys(P, b){ let i = 0; while (i + 2 < P.length && b >= P[i + 1][0]) i++; const n = P.length, h = P[i + 1][0] - P[i][0], u = clamp((b - P[i][0]) / h), u2 = u * u, u3 = u2 * u;
  const tan = (m, j) => m <= 0 || m >= n - 1 ? 0 : .5 * (P[m + 1][j] - P[m - 1][j]) / (P[m + 1][0] - P[m - 1][0]);
  return [1, 2].map(j => (2 * u3 - 3 * u2 + 1) * P[i][j] + (u3 - 2 * u2 + u) * h * tan(i, j) + (-2 * u3 + 3 * u2) * P[i + 1][j] + (u3 - u2) * h * tan(i + 1, j)); }
// spaced along the path (40 px a place, two abreast +-24 px), as the outro's flock (outSlot)
const TRF_DT = 1 / 240; let TRF_S = null;
function trfArc(){ if (TRF_S) return TRF_S; const n = Math.ceil((95.5 - 84) / TRF_DT) + 1, S = new Float64Array(n); let p = hermKeys(TRF_K, 84);
  for (let i = 1; i < n; i++){ const q = hermKeys(TRF_K, 84 + i * TRF_DT); S[i] = S[i - 1] + Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; } return (TRF_S = S); }
const trfArcAt = b => { const S = trfArc(), f = clamp((b - 84) / TRF_DT, 0, S.length - 1), i = Math.min(S.length - 2, Math.floor(f)); return S[i] + (S[i + 1] - S[i]) * (f - i); };
function trfTimeAt(d){ const S = trfArc(); if (d <= 0) return 84; if (d >= S[S.length - 1]) return 95.5; let lo = 0, hi = S.length - 1; while (hi - lo > 1){ const m = (lo + hi) >> 1; if (S[m] <= d) lo = m; else hi = m; }
  return 84 + (lo + (S[hi] > S[lo] ? (d - S[lo]) / (S[hi] - S[lo]) : 0)) * TRF_DT; }
function tranceFlock(g, s, mx, my){
  const b = 80 + s.lbar; if (b < 84 || b >= 95.5) return;
  // in the dive the spacing closes (esin) and they move with the setting moon, so they stay behind it
  const sNow = trfArcAt(b), gap = 40 * (1 - .6 * esin(span(b, 94.5, 95.3))), dv = esin(span(b, 94.75, 95.3)), [rx, ry] = trMoonAt(14.75, s.T + (14.75 - s.lbar) * BAR);
  for (let k = 8; k >= 0; k--){ const d = sNow - k * gap; if (d <= 0) continue;   // (still at the start, below the frame)
    const [x0, y0] = hermKeys(TRF_K, trfTimeAt(d)), p0 = hermKeys(TRF_K, trfTimeAt(d - 12)), p1 = hermKeys(TRF_K, trfTimeAt(d + 12)), dx = p1[0] - p0[0], dy = p1[1] - p0[1], l = Math.hypot(dx, dy) || 1;
    const lat = k ? 24 * Math.cos(Math.PI * k) * clamp(d / 80) : 0, x = x0 - dy / l * lat + (mx - rx) * dv, y = y0 + dx / l * lat + (my - ry) * dv;
    // the leader cream, 56 px; the others 34-46 px, cream and mint (not #9ee9ff, the moon's colour), pointing the way they fly
    triK(g, x, y, k ? 34 + 12 * hash(k * 7 + 5) : 56, Math.atan2(dy, dx) + Math.PI / 2 + .15 * Math.sin(s.T * .8 + k), 0, k ? (k % 2 ? '#fffef2' : '#3bedcf') : '#fffef2', 3); }
}
SC_.trance = (g, s) => {
  // r5: the column opens a little further on 88 and 92 (one light change each, rhythm juror)
  // r6 (rhythm juror): the moon rises from 81 and lands on 83 as the drums come in (it no longer waits for 82 behind an
  // empty column); under the low-cut veil (bar 81.3-81.8) its rim stays lit (breathe() draws it above the veil)
  // r19 (rhythm #1): the moon rises from 81 (the quiet), after the sun has set; it still lands on 83.0
  const L = s.lbar, rise = eout(span(L, 1, 3)), /* r7c (rhythm juror): rises from 80.5, lands on 83.0 */ open = eio(span(L, 4, 6)), step = eback(span(L, 8, 8.4)) + eback(span(L, 12, 12.4));
  const colW = lerp(1320, 1680, open) * lerp(.85, 1, eio(span(L, 0, 2))) * (1 + .05 * step), x0 = 960 - colW / 2;
  // r7 (10-08 brief: add stars, the whole thing like a night sky: lyrical, wandering, dreamy): the lit column is gone
  // (fresh eyes: an empty column read as a stage light); a flat night sky on the ladder, the stars come on from the
  // zenith down over 81-84 and drift sideways very slowly (the dreamy pan); the sky breathes a little on the half notes
  // r19 (rhythm #1): arcs' dusk (lift .45) is pressed to navy over 80.5-81; the stars come on over 80.75-81.25 (from
  // arcs' 30 % at the zenith) and the last ones by 84; the setting sun's top stays above the cloud line to ~80.6
  nightSky(g, .45 * (1 - eio(span(L, .5, 1))) + .06 * pulse(s.beat / 2, 4) * clamp(L - 3));
  g.save(); g.translate(-14 * s.T, 0); drawStars(g, s, lerp(.3, .85, eio(span(L, .75, 1.25))) + .15 * eio(span(L, 1.25, 4))); g.restore();
  // r7c: arcs' setting disc (y 960 since r19, R 198 at the cut) finishes going down under the horizon in the first bar
  if (L < 1.3) disc(g, 960, lerp(960, 1300, eio(span(L, 0, 1.3))), 198);
  // two meteors only (advocate): on 88 and 92, high in the sky, away from the moon
  meteor(g, 1760, 110, Math.PI - .28, 2300, 560, span(L, .25, 1.75), 6);   /* r8d: crosses the whole sky */   /* r7c: one slow meteor while the moon is still below (health: 80-81 EMPTY) */
  meteor(g, 120, 70, .32, 2300, 640, span(L, 8, 9), 7); meteor(g, 1820, 40, Math.PI - .12, 2300, 600, span(L, 12, 13), 7);
  // r10: a meteor about every 2 bars (84, 86, 90, 94 added), alternating sides, high in the sky
  for (const [b, x, y, a] of [[4, 1880, 90, Math.PI - .3], [6, 60, 120, .28], [10, 1700, 30, Math.PI - .22], [14, 220, 40, .2]]) meteor(g, x, y, a, 2300, 560, span(L, b, b + 1), 6);
  // r14 (rhythm juror): two more in the build, 94.5 and 95, both gone by 95.75
  meteor(g, 1700, 70, Math.PI - .26, 2300, 560, span(L, 14.5, 15.25), 6); meteor(g, 160, 110, .24, 2300, 560, span(L, 15, 15.75), 6);
  // r5: in the last bar the moon sinks to where bloom's sun starts (anchored through the fade at 96)
  // r6: from 94 the four-on-the-floor kick is back and the moon pulses with it
  // r10 (advocate whole-song pass: "84-96 looks the same every 2 bars"): the moon wanders up and to the left over
  // the section and comes back to the centre by 95 (bloom's match point is unchanged)
  // r13 (whole-song pass: at 3 s a frame the 230 px wander did not read): it drifts left, then right across the sky
  // (±380 px) and back to the centre for bloom's match cut, rising a little in the middle
  const [mx, my] = trMoonAt(L, s.T), mR =lerp(230, 300, eio(span(L, 15, 16))) + (L >= 14 ? 6 * s.k : 0);   // r7: a smaller moon (more night sky); back to bloom's R 300 as it sinks
  TR_MOON = [mx, my, mR, g.getTransform(), s.t];
  // 16th pulse: single halftone dots light up beside the column (arpeggio notes), never near the moon, at most 3 (r6: from 83)
  spawnPops(s.t, BEAT, (n, a) => { if (n.tr !== 2 || L < 3) return; const side = n.i % 2 ? -1 : 1, x = 960 + side * (colW / 2 + 60 + hash(n.i) * 220), y = 120 + hash(n.i + 3) * 840;
    if (Math.hypot(x - mx, y - my) < 360) return; const e = 1 - a / BEAT; circle(g, x, y, 4 + 4 * e, `rgba(158,233,255,${.25 + .6 * e})`); });
  if (TRANCE_DOTS) tranceRings(g, s, mx, my, mR); else tranceRipples(g, s, mx, my, mR);
  /* r8 (review: the 112 s transition was wrong): the low-cut veil is gone altogether */
  // r27: from 94 the flock is drawn behind the moon, so in the dive they slip behind its face (no shrinking, no fading)
  if (TRANCE_FLOCK && L >= 14) tranceFlock(g, s, mx, my);
  g.globalAlpha = .5; ring(g, mx, my, mR + 14, mR + 110, '#0771e4'); g.globalAlpha = 1;   // r6b (advocate): the halo at half strength (it read as a bullseye)
  // r6d (research #6, jury approved): the moon's bright side turns a step on the 84 / 88 / 92 downbeats (eout, 1 beat);
  // on 94 (the kick returns) one flat halo opens once: R -> R + 200 in 2 beats, #9ee9ff at most 30 %
  const hl = 2.63 - .8 * (eout(span(L, 4, 4.25)) + eout(span(L, 8, 8.25)) + eout(span(L, 12, 12.25)));
  if (rise > 0){ circle(g, mx, my, mR + 14, '#0b8ef4'); discLad(g, mx, my, mR, '#9ee9ff', '#7bdcfa', '#42cefb', null, .075, hl); }   /* r7c (visual): a paler moon */
  { const u = span(L, 14, 14.5); if (u > 0 && u < 1){ const r = mR + 20 + 200 * eout(u); g.globalAlpha = .3 * (1 - u); ring(g, mx, my, r, r + 30, '#9ee9ff'); g.globalAlpha = 1; } }
  // r8 (review: before 112 s it was too boring): two layers of night cloud silhouettes along the bottom (continuing from
  // arcs' bar 79); the setting sun went down behind them and the moon rises out of them; they sink away in the last bar
  // (r16 audit, visual: in the last bar they sank down and vanished, the forbidden "clouds sliding down") they part to the
  // sides over the last bar, out of the frame by the cut
  { g.save(); g.setTransform(SC, 0, 0, SC, 0, 0); nightClouds(g, s.t - B(79), 0, 1800 * ein(span(L, 15, 15.95))); g.restore(); }   // r8d: outside the camera (continuous with arcs)
  // r27: until 94 the flock flies in front of the cloud sea (it rises out of it at 84)
  if (TRANCE_FLOCK && L < 14) tranceFlock(g, s, mx, my);

  // one slow line at a time: drawn over 2 bars, held 1, withdrawn over 2 (core #E7FFFF + a soft #7BDCFA glow)
  for (const [b0, dir, hy] of TR_LINES){ const hu = span(L, b0, b0 + 2), tu = eio(span(L, b0 + 3, b0 + 5)); if (hu <= 0 || tu >= 1) continue;
    const P = u => { const v = dir > 0 ? u : 1 - u; return [lerp(-60, 1980, v), H * hy + Math.sin(v * Math.PI) * -90 * dir]; };
    swoosh(g, P, tu, Math.max(tu, eio(hu)), 18, 'rgba(123,220,250,.35)'); swoosh(g, P, tu, Math.max(tu, eio(hu)), 6, '#e7ffff'); }   // r6: thicker (they read as hairlines)
};
// ================================================================== the note highway ("走带")
// The notes come out of the rising sun along a road of lanes and land on a white judgement line. The paper plane is the
// cursor: it slides only as far as it must to meet each note (learned from the lane section of the Death by Glamour MV),
// and each hit throws up a column of light and a small fan of triangles. A line slides down the road on every beat.
const HW = { b0: 96, b1: 106.6, hz: 560, yh: 965, x0: 190, x1: 1730, f: 1.25, look: 3.0 };   // r3: the road runs to 106
let HWN = null, HWP = null;
function hwBuild(){
  const a = B(HW.b0), b = B(HW.b1);
  // r8 (review, a second time: the piano blocks still did not line up; tools/note_sync.py: the FLP notes and WAV3 differ
  // here, e.g. FLP 0,3,5,7,10,12,14 vs audio 0,4,7,9,11,14 in bar 98): the blocks are the AUDIO's harmonic onsets
  // (tools/hw_onsets.py, drums removed), snapped to the 16th grid; the lane = the pitch of the strongest partial (4 lanes);
  // the strongest third are the big white blocks
  // r8b (the composer then supplied the piano part's MIDI): the blocks are the MIDI's onsets (its beat 0 = bar 98), one block per
  // onset = the chord's top note; the lane = the top note's rank among this section's top notes (4 quartiles, low ->
  // left); held notes keep their length; the downbeat onsets are the big white blocks
  // r15 (review: use exactly this MIDI for the waterfall): the blocks now come from the composer's melody MIDI (PIANO_HW, one
  // note per onset), the old chord MIDI only if it is missing
  const ons = new Map(); for (const [bt, du, p, v] of (PIANO_HW.length ? PIANO_HW : PIANO)){ const t0 = T0 + bt * BEAT; if (t0 < a || t0 >= b) continue; const k = Math.round(bt * 4), o = ons.get(k);
    if (!o || p > o.p) ons.set(k, { t0, t1: t0 + Math.max(du, .2) * BEAT, p, v, bt }); }
  const tops = [...ons.values()].sort((p, q) => p.t0 - q.t0), ps = tops.map(o => o.p).sort((p, q) => p - q), q4 = k => ps[Math.floor(ps.length * k / 4)];
  HWN = tops.map((o, k) => ({ t0: o.t0, t1: o.t1, p: o.p, tr: Math.abs(o.bt % 4) < 1e-3 || o.p >= q4(3.6) ? 1 : 2, i: 90000 + k, lane: o.p >= q4(3) ? 3 : o.p >= q4(2) ? 2 : o.p >= q4(1) ? 1 : 0 }));
  if (!HWN.length){ const S16 = BEAT / 4; HWN = HW_ONS.map((o, k) => { const t0 = T0 + Math.round((o[0] - T0) / S16) * S16; return { t0, t1: t0 + S16 * .9, p: o[1], tr: 2, i: 90000 + k, lane: Math.min(3, Math.floor(o[1] * 4)) }; }).filter(n => n.t0 >= a && n.t0 < b); }
  const lw = (HW.x1 - HW.x0) / 4;
  for (const n of HWN){ n.hx = HW.x0 + lw * (n.lane + .5); n.hw = n.tr === 1 ? lw - 40 : lw - 120; }
  const groups = []; for (const n of HWN){ const gr = groups[groups.length - 1]; if (gr && Math.abs(gr.t - n.t0) < .03) gr.n.push(n); else groups.push({ t: n.t0, n: [n] }); }
  HWP = []; let x = 960, last = -1e9;
  for (const gr of groups){ let best = gr.n[0].hx; for (const n of gr.n) if (Math.abs(n.hx - x) < Math.abs(best - x)) best = n.hx;
    const t0 = Math.max(last + .02, gr.t - .2), t1 = Math.max(t0 + .01, gr.t - .03); if (Math.abs(best - x) > 1) HWP.push([t0, t1, x, best]); x = best; last = gr.t; }
}
function hwPlaneX(t){ let x = 960; for (const m of HWP){ if (t < m[0]) break; x = t >= m[1] ? m[3] : lerp(m[2], m[3], eout(clamp((t - m[0]) / (m[1] - m[0])))); } return x; }
const hwP = (xw, d) => { const k = 1 / (1 + d * HW.f); return [960 + (xw - 960) * k, HW.hz + (HW.yh - HW.hz) * k]; };
function hwQuad(x0, x1, d0, d1, col){ const a = hwP(x0, d0), b = hwP(x1, d0), c = hwP(x1, d1), d = hwP(x0, d1); poly(g_, [a[0], a[1], b[0], b[1], c[0], c[1], d[0], d[1]], col); }
let g_ = null;
function highway(g, s, drop, withPlane){
  if (!HWN) hwBuild();
  const t = s.t, D0 = -.16; g_ = g;
  // r3: the road starts narrow (a third of the width: the narrowest stereo) and opens out on bar 98 (134.57 s)
  const wf = lerp(.34, 1, eout(span(t, B(98), B(98) + BEAT)));
  g.save(); g.translate(0, drop); g.translate(960, 0); g.scale(wf, 1); g.translate(-960, 0);
  const gr = g.createLinearGradient(0, HW.hz, 0, H); gr.addColorStop(0, K.royal); gr.addColorStop(1, K.navy); g.fillStyle = gr; g.fillRect(-W, HW.hz, 3 * W, H * 2);
  hwQuad(HW.x0, HW.x1, D0, HW.look, 'rgba(255,255,244,.06)');
  for (let i = 0; i <= 4; i++){ const x = lerp(HW.x0, HW.x1, i / 4), e = i === 0 || i === 4; /* r7: 4 lanes (was 8) */ hwQuad(x - (e ? 4 : 1.5), x + (e ? 4 : 1.5), D0, HW.look, `rgba(255,255,244,${e ? .4 : .13})`); }
  for (let bt = Math.ceil((t + D0 - T0) / BEAT); ; bt++){ const d = T0 + bt * BEAT - t; if (d > HW.look) break; const down = bt % 4 === 0; hwQuad(HW.x0, HW.x1, d, d + (down ? .035 : .018), `rgba(255,255,244,${(down ? .5 : .25) * clamp((HW.look - d) / .8)})`); }
  // r16 (review: around the piano waterfall it was a bit empty; add small elements): roadside pieces, one a beat,
  // alternating sides, riding the road's own perspective at the notes' speed (so each passes the line on its beat and
  // nothing steps): key-visual shapes only (a triangle, a navy / royal stripe tile, a halftone triangle, a small ringed sun)
  for (let bt = Math.ceil((t - .45 - T0) / BEAT); ; bt++){ const d = T0 + bt * BEAT - t; if (d > HW.look) break; if (d < -.45) continue;
    // (whole-song pass, advocate: the pale circles / stripe ellipses read as stickers) triangles and halftone triangles only
    const side = bt % 2 ? 1 : -1, kind = ((bt >> 1) % 2) ? 2 : 0, xw = side > 0 ? HW.x1 + 200 + 110 * hash(bt) : HW.x0 - 200 - 110 * hash(bt), [px, py] = hwP(xw, d), k = 1 / (1 + d * HW.f), sz = 92 * k;   // r16b (visual, UA: too small): ~90 px at the line
    g.globalAlpha = clamp((HW.look - d) / .8);
    if (kind === 0) triK(g, px, py - sz * .8, sz, bt * .7 + t * .6 * side, 0, bt % 4 < 2 ? '#fffef2' : K.mint, bt);
    else if (kind === 1){ g.save(); g.translate(px, py - sz * .7); g.beginPath(); g.moveTo(-sz * .7, sz * .45); g.lineTo(-sz * .2, -sz * .45); g.lineTo(sz * .9, -sz * .45); g.lineTo(sz * .4, sz * .45); g.closePath(); g.clip(); stripes(g, 0, 0, -.72, Math.max(1, 9 * k), t * 30, [K.navy, K.royal]); g.restore(); }
    else if (kind === 2) dotShape(g, 1, px, py - sz * .8, sz * .9, side * .3 + t * .4, 1, Math.max(6, 18 * k), t * 10);
    else { circle(g, px, py - sz * .9, sz * .78, '#0771e4'); disc(g, px, py - sz * .9, sz * .62); }
    g.globalAlpha = 1; }
  // the judgement line, glowing on the kick
  hwQuad(HW.x0 - 10, HW.x1 + 10, -.02, .02, `rgba(59,237,207,${.35 + .4 * s.k})`); hwQuad(HW.x0 - 10, HW.x1 + 10, -.006, .006, K.white);
  // r8d (review, a third time: the piano blocks still did not line up; the rhythm juror measured
  // them within 0-2 frames, so what is missing is a readable HIT): like a rhythm game, each note is a short tile that is
  // eaten the instant it reaches the line; a held note leaves only a thin tail behind it
  const TILE = .09;
  for (const n of HWN){ const d0 = n.t0 - t; if (d0 > HW.look) break; const d1 = Math.max(d0 + TILE, n.t1 - t); if (d1 < 0) continue;
    const f = Math.max(0, d0), al = clamp((HW.look - f) / .7); g.globalAlpha = al;
    if (d1 > d0 + TILE + .05){ g.globalAlpha = al * .55; hwQuad(n.hx - n.hw * .16, n.hx + n.hw * .16, Math.max(0, d0 + TILE), d1, n.tr === 1 ? K.white : K.cyan); g.globalAlpha = al; }
    if (d0 >= 0){ hwQuad(n.hx - n.hw / 2, n.hx + n.hw / 2, d0, d0 + TILE, n.tr === 1 ? K.white : K.cyan); hwQuad(n.hx - n.hw / 2, n.hx + n.hw / 2, d0, d0 + .022, n.tr === 1 ? K.mint : K.white); } }
  g.globalAlpha = 1;
  // hits: the lane lights up, and on the line a white four-point burst and a flat ring open (the moment you hear it)
  for (const n of HWN){ const age = t - n.t0; if (age < 0) break; if (age > .4) continue; const u = age / .4;
    g.globalAlpha = .75 * (1 - u); hwQuad(n.hx - n.hw / 2 - 6, n.hx + n.hw / 2 + 6, 0, 1.1 * (1 - u), n.tr === 1 ? K.white : K.cyan); g.globalAlpha = 1;
    { const [px, py] = hwP(n.hx, 0), e = eout(u); g.save(); g.translate(px, py); g.scale(1, .32); g.globalAlpha = 1 - u; ring(g, 0, 0, (n.hw * .5 + 20) + 120 * e, (n.hw * .5 + 20) + 120 * e + lerp(14, 2, u), K.white); g.restore(); g.globalAlpha = 1;
      // r18 (jury_r18: the four-point burst on every note was the most visible glint of the song): a flat cream light on the
      // line that spreads 1.6x while it fades
      // (r18b, fresh eyes: a ~4 px dot inside the ring, weaker than the old burst) bigger and rounder
      { const r = (n.tr === 1 ? 56 : 40) * (1 + .5 * eout(u)); g.save(); g.translate(px, py - 6); g.scale(1, .5); g.globalAlpha = .5 * (1 - u); circle(g, 0, 0, r, '#fffef2'); g.globalAlpha = .9 * (1 - eout(u)); circle(g, 0, 0, r * .4, K.white); g.restore(); g.globalAlpha = 1; } }
    if (n.tr === 1) for (let j = 0; j < 2; j++){ const a = -Math.PI / 2 + (hash(n.i * 7 + j) - .5) * 2.2, d = 40 + 190 * eout(u); triK(g, n.hx + Math.cos(a) * d, HW.yh + Math.sin(a) * d, 22 * (1 - u), a + u * 4, u, TRI_COLS[(n.i + j) % 6], j); } }
  if (withPlane){ const enter = eout(span(s.lbar, 0, 1.3));
    flight(g, τ => [hwPlaneX(τ), HW.yh + 30 + (t - τ) * 340 + 420 * (1 - eout(span((τ - B(HW.b0)) / BAR, 0, 1.3)))], t, 64, { trail: 1.0, w: 7 }); }
  g.restore();
}
// 96–111 (2:12–2:32): hope building. First the highway at dawn (96–104), the sun rising behind the road; then the road
// sinks away and the morning opens: rings spread, a petal of line grows out of the sun on each bar.
// r7 (review: the background was too empty; jury: the spectrum, here only): the music's own spectrum as a skyline on the
// horizon behind the rising sun: 32 log bands (60 Hz-12 kHz, tools/spectrum_aoi.py), flat #0771e4 columns quantised to
// 8 px with a #9ee9ff cap, the 3 loudest get a cream cap; it sinks with the road on 106
function hwSkyline(g, s, drop, al){
  if (al <= 0) return;
  const t = s.t, v = [], cw = 1440 / 32;
  for (let b = 0; b < 32; b++) v.push(specAt(t, b));
  const top = v.map((x, i) => [x, i]).sort((p, q) => q[0] - p[0]).slice(0, 3).map(p => p[1]);
  g.globalAlpha = al;
  // r8d (review: the spectrum just appeared half way; give it more animation, growing from the bottom up): over
  // 96.5-98.5 the columns grow up out of the horizon one after another, from the middle outwards
  const gl = s.lbar;
  for (let b = 0; b < 32; b++){ const gw = eout(span(gl, .5 + Math.abs(b - 15.5) / 16 * 1.4, 1.1 + Math.abs(b - 15.5) / 16 * 1.4)); const h = Math.floor(v[b] * 220 * gw / 8) * 8; if (h <= 0) continue; const x = 240 + b * cw + 3, w = cw - 6, y = HW.hz + drop - h;
    rect(g, x, y, w, h, '#0771e4'); rect(g, x, y, w, 4, top.includes(b) ? K.white : '#9ee9ff'); }
  g.globalAlpha = 1;
}
SC_.bloom = (g, s) => {
  // r9 (jury whole-song pass: 106-111 thin and empty): after the road sinks the morning really comes (sky up to day blue
  // by 109.5), the key visual's cloud cluster rises in lower left (106) and wisps upper right (107), and the thin petal
  // lines become the key visual's long white lines, one more each bar
  const L = s.lbar, dawn = Math.max(eio(span(L, 2, 15)), eio(span(L, 10, 13.5)));
  vgrad(g, lerpCol(K.navy, K.sky2, dawn), lerpCol(K.royal, K.disc1, dawn));
  // r7: the trance's stars are still there when the road comes in and fade out as the sky lightens (96-100)
  // r8: the stars keep trance's slow pan (they jumped 300 px on the cut)
  // (r22b whole-song pass, advocate: 2:15-2:25 the upper 40 % was empty navy) the stars stay longer, fading with the
  // dawn over 98-104, and a slow meteor crosses high up on 98, 100 and 102 (alternating sides)
  { const sa = 1 - eio(span(L, 2, 8)); if (sa > 0){ g.save(); g.translate(-14 * (s.T + 16 * BAR), 0); drawStars(g, s, 1, sa); g.restore(); } }
  for (const [b, x, y, a] of [[2, 1880, 60, Math.PI - .25], [4, 40, 90, .25], [6, 1860, 40, Math.PI - .2]]) meteor(g, x, y, a, 2300, 560, span(L, b, b + 1.25), 6);
  // r8 (review: at 132 s the two big circles were in different places): a match cut. Trance's moon ends at (960, 760) R 300;
  // here the same disc keeps the moon's colours and halo for a bar while it turns into the sun, and the road rises into
  // the frame from below over 3 beats (it used to be there on the cut frame, hiding the lower half of the disc)
  const rise = 1 - eout(span(L, 0, .75));
  // r3: in the last beat the sun contracts to inhale's small disc (R 150, centre): the "inhale" itself, no iris
  const shrink = eio(span(L, 14.5, 15));   // r9 (fresh eyes: R 420 -> 150 in a quarter beat read as a cut): over 2 beats
  const cy = L < 10 ? lerp(HW.hz + 200, 560, eio(span(L, 0, 10))) : lerp(560, 540, shrink), R = lerp(lerp(300, 420, eio(span(L, 9, 15))) + 14 * s.k, 150, shrink);

  // r3: the road sinks on bar 106 (145.54 s, rhythm juror), then the morning opens: rings, a petal line per bar
  const bl = eout(span(L, 10, 10.5));   // r6 (health 2:26 EMPTY): the rings burst ON 106 as the road drops (was eio 10-12)
  // r8f (cut audit: bloom's rings and petal lines vanished on the cut into inhale): in the last bar the petal lines are
  // reeled in from their tips (the halo shrinks with the sun)
  // (r25c whole-song review, advocate, a third time after r21b and r22: 2-4 thin white rings round the centred sun
  // read as a dartboard) no rings: the morning light is a flat halo behind the sun (a pale disc, as softGlow) that
  // breathes every 2 beats (eio) and grows with the morning; breathed in with the sun over the last 2 beats
  if (bl > 0){ const br = .5 - .5 * Math.cos(Math.PI * s.beat), gw = eio(span(L, 10, 12));   // br: a smooth 2-beat breath
    /* (self-check: two halos plus the collar still stacked into bands) one halo; (r26 advocate: it vanished in one frame on
       the cut) it fades out over the last 2 beats with the lines */ { const r = R * lerp(1, 1.3 + .08 * br, gw); g.globalAlpha = .16 * bl * (.8 + .2 * br) * (1 - eio(span(L, 14.5, 15))); circle(g, 960, cy, r, '#fffef2'); } g.globalAlpha = 1; }
  { const mo = 1 - eio(span(L, 0, 1)); if (mo > 0){ g.globalAlpha = .5 * mo; ring(g, 960, cy, R + 14, R + 110, '#0771e4'); g.globalAlpha = mo; circle(g, 960, cy, R + 14, '#0b8ef4'); g.globalAlpha = 1; } }
  disc(g, 960, cy, R);
  { const mo = 1 - eio(span(L, 0, 1)); if (mo > 0){ g.globalAlpha = mo; discLad(g, 960, cy, R, '#9ee9ff', '#7bdcfa', '#42cefb', null, .075, .23); g.globalAlpha = 1; } }
  // r11 (review: at 132 s, the spectrum in front of the circle, not hiding the middle): drawn after the sun
  hwSkyline(g, s, esout(span(L, 10, 11)) * 720 + rise * 560, 1 - eio(span(L, 10, 10.6)));   // (r26) sinks with the road
  // the key visual's long lines, one more on each downbeat 106-109 (drawn in over a beat), reeled in over the last half bar
  // (re-audit, visual: the reeled-in lines left stubs at the right edge until the cut) they are reeled in by 110.9
  // (final check, visual: the last bits still sat at the right edge for a few frames) they also slide out to the right as they go
  // (r25c whole-song review, advocate: at 2:31.7 everything went in ~0.35 s) the lines are reeled in over the last 2
  // beats and slide out right with them (esin)
  if (bl > 0){ const bk = eio(span(L, 14.5, 15)); g.save(); g.translate(260 * esin(span(L, 14.5, 15)), 0); [0, 3, 1].forEach((li, i) => {   /* (UA: at most 3 long lines, the sunrise must stay the subject) */ const grow = eout(span(L, 10 + i, 10.25 + i)); if (grow > 0 && bk < 1) swoosh(g, KVL[li], bk, Math.max(bk, grow), KVL_W[li]); }); g.restore(); }
  // the cloud cluster rises in lower left on 106 and wisps upper right on 107; they sink / drift out in the last half bar
  // r11b (cut audit: a corner of the sinking cluster was still in frame at the cut; and no sliding down): they leave
  // sideways, the cluster to the left and the wisps to the right
  // (r25c, advocate: they shot out at ~60 px a frame in the last .7 bar) they leave over the whole last bar (esin, <= ~22 px a frame)
  // (r26 advocate: at 2:25.6 the day picture came in within ~0.3 s, the cluster shooting up from below) they come in over a
  // bar each (esout, at most ~13 px a frame)
  { const c1 = esout(span(L, 10, 11)), c2 = esout(span(L, 11, 12)), out = esin(span(L, 14, 15));
    if (c1 > 0 && out < 1){ cloudS(g, 'HB_tower', 70 - 1150 * out, 560 + 700 * (1 - c1), .85); cloudS(g, 'HB_low', 200 - 1150 * out, 1010 + 600 * (1 - c1), 1.05); }
    if (c2 > 0 && out < 1){ cloudS(g, 'HA_tr', 1700 + 500 * (1 - c2) + 900 * out, 110, .5, 0, true); cloudS(g, 'HA_r5', 1460 + 600 * (1 - c2) + 900 * out, 60, .4); } }
  // r5: the road drops ON bar 106 (eio landed 23 frames late); (r26 advocate: with eout it fell ~30 px a frame on the
  // downbeat, the picture switched in ~0.3 s) a sine ease-out over a bar: it still moves on the downbeat, at ~14 px a frame
  const off = esout(span(L, 10, 11));
  if (off < 1) highway(g, s, off * 720 + rise * 560, false);
  if (L > 12 && L < 14.5) for (const [t, kk, id] of onsetsIn(s.t - .9, s.t + 1e-6)) triBurst(g, id + 4000, s.t - t, 960, cy, 2, 520 * kk, .9, 34);
};
// PRE-DROP 2 111–114 (2:32–2:36): the plane draws one big loop round the disc. The ring it leaves pulses on the beats,
// swells in the last beat and bursts on the drop into the rings of the next shot.
SC_.inhale = (g, s) => {
  // r3: the loop draws itself from beat 0 (no plane draws it any more), one turn in 11 beats
  const b = s.lb, C = [960, 540], R = 430, swell = ein(span(b, 11, 12)), A = bb => Math.PI / 2 - TAU * bb / 11;
  skyBg(g, 960, 540);
  const z = 1 + .3 * swell; g.save(); g.translate(960, 540); g.scale(z, z); g.translate(-960, -540);
  // r3 (visual §6.4): a small disc, a dark "pupil" on the pale sky; in the last beat it swells (156.17 -> 156.51)
  disc(g, 960, 540, 150 + 60 * ein(span(b, 11, 12)) + 8 * s.k);
  const done = lerp(.03, 1, clamp(b / 11));   // r6 (visual juror): the line's head is there on the cut frame
  if (done >= 1) ring(g, C[0], C[1], R - 5 - 5 * pulse(s.beat, 5), R + 5 + 5 * pulse(s.beat, 5), K.white);
  else if (done > 0) swoosh(g, u => { const a = A(u * 11 * done); return [C[0] + Math.cos(a) * R, C[1] + Math.sin(a) * R]; }, 0, 1, 9, K.navy, 120);
  // as the line passes each quarter, a small key-visual triangle settles just outside it
  for (let q = 0; q < 4; q++){ const bq = [3, 6, 8, 11][q], a = A(bq), p = pop((b - bq) * 1.6); /* r6 (rhythm juror): on beats, not 2.75 / 5.5 / 8.25 */ if (p <= 0) continue; triK(g, C[0] + Math.cos(a) * (R + 80), C[1] + Math.sin(a) * (R + 80), 34 * p * (1 + .15 * pulse(s.beat, 5)), a + Math.PI / 2, 0, q % 2 ? K.mint : K.white, q); }
  g.restore();
  const P = τ => { const bb = τ / BEAT; if (bb < 3){ const u = bb / 3; return [lerp(-220, 960, u), lerp(860, C[1] + R, u)]; } if (bb <= 11){ const a = A(bb); return [C[0] + Math.cos(a) * R, C[1] + Math.sin(a) * R]; } const u = bb - 11; return [960 + u * 1300, C[1] + R - u * u * 560]; };

};
// DROP 2 114–120: the disc bursts into rings, one per beat; rays
SC_.rings = (g, s) => {
  // r3: was .2 rad per bar, more sway than the final drop; at 118 (2:42) the camera tilts: the rings become ellipses
  // r6 (rhythm juror): the roll steps only on 116 / 118 / 120 (117 and 121 have no downbeat kick), .03 rad, eout, no overshoot
  // r16 audit (visual: at the cut a round iris met the camera's ellipse, and the small blue disc became sunburst's big
  // cream sun in 1/4 beat): over bar 121 the camera rights itself (no roll, no squash), the disc grows to sunburst's
  // R 380 and turns cream, the sky and sunburst's rays come in behind it, so sunburst simply cuts in (no iris)
  const unT = eio(span(s.lbar, 7, 7.75)), rot = rollSnap(s, .03, 2, eout, .25) * (1 - unT), obl = eback(span(s.lbar, 4, 4.3)) * (1 - unT);
  skyBg(g, 960, 540);
  const cols = [K.disc0, K.ring, K.disc1, K.royal, 'NAVYDOT', K.sky, 'STRIPE', K.disc1];
  const camT = g.getTransform(), sq = lerp(1, .58, clamp(obl, 0, 1.1)), sgrow = eback(span(s.lbar, 4, 4.4)) * (1 - eio(span(s.lbar, 7.1, 7.5)));   // r8: the 3D spectrum; r11b (advocate: at 121.5-122 the front-only bars round the oval read as a grinning face) they sink back before 121.5
  g.save(); g.translate(W / 2, H / 2); g.rotate(rot); g.scale(1, lerp(1, .58, clamp(obl, 0, 1.1))); g.translate(-W / 2, -H / 2);
  // r6: no new rings from 121 (the snare fill): the last ones spread out and leave the centre to sunburst's iris
  for (let k = 9; k >= 0; k--){ if (Math.floor(s.lb) - k >= 28) continue; const age = fract(s.lb) + k, r1 = Math.pow(age, 1.25) * 150 + 40, r0 = r1 - 150; const born = Math.floor(s.lb) - k, ci = (born % cols.length + cols.length) % cols.length;
    const col = born >= 16 ? [K.disc0, K.ring, K.disc1][born % 3] : cols[ci];   // r8b: rings born from 118 use 3 tones only (with the 3D spectrum)
    if (col === 'NAVYDOT'){ ring(g, W / 2, H / 2, Math.max(0, r0), r1, K.navy); g.save(); g.beginPath(); g.arc(W / 2, H / 2, r1, 0, TAU); g.arc(W / 2, H / 2, Math.max(0, r0), 0, TAU, true); g.clip('evenodd'); dots(g, -100, -100, W + 100, H + 100, 22, 4.4, K.white, W / 2, H / 2); g.restore(); }
    else if (col === 'STRIPE'){ g.save(); g.beginPath(); g.arc(W / 2, H / 2, r1, 0, TAU); g.arc(W / 2, H / 2, Math.max(0, r0), 0, TAU, true); g.clip('evenodd'); stripes(g, W / 2, H / 2, -.75, 34, s.T * 120); g.restore(); }
    else ring(g, W / 2, H / 2, Math.max(0, r0), r1, col); }
  const n = 0, pb = pulse(s.beat, 4);   // (whole-song pass, fresh eyes: concentric bands + 8 white spokes read as a dartboard) no spokes /* r3: 16 -> 8 rays (budget); r8b: none from 118 (3D spectrum) */ for (let i = 0; i < n; i++){ const a = i * TAU / n + s.T * .15, d0 = 260 + 120 * pb, d1 = d0 + 260 + (i % 2) * 220 + 200 * pb; swoosh(g, v => [W / 2 + Math.cos(a) * lerp(d0, d1, v), H / 2 + Math.sin(a) * lerp(d0, d1, v)], 0, 1, 10 + (i % 2) * 6, K.white, 22); }
  for (let i = 0; i < 6; i++){ const a = i * TAU / 6 - s.T * .3, d = 640 + 40 * Math.sin(s.T * 2 + i); sparkle4(g, W / 2 + Math.cos(a) * d, H / 2 + Math.sin(a) * d, 36 + 12 * pulse(s.beat + i * .2, 4), a, i % 2 ? K.white : K.cyan); }
  // (r16 audit, visual: sinking, the bars lay down as a ring of white bits) they fade as they sink
  const sA = s.lbar > 6 ? eio(clamp(sgrow)) : 1;
  if (sgrow > 0){ g.save(); g.setTransform(camT); g.globalAlpha = sA; spec3D(g, s, W / 2, H / 2, rot, sq, sgrow, 'back'); g.globalAlpha = 1; g.restore(); }
  // r16 audit: sunburst's sky and rays come in behind the growing disc over the last half bar (rays at sunburst's angle)
  // (r20 audit, visual: cross-faded over the concentric bands, the rays made a dartboard for ~1/3 s) they are no longer
  // faded in: sunburst's sky and rays open out opaque from behind the growing disc in a widening circle that pushes the
  // last bands out of the frame (full frame on 122.0)
  // (r21 recheck, visual: while the circle was small its hard edge cut the rays into a ring of short teeth, a cog) the
  // opening is faint while it hugs the disc and opaque once it is 300 px out
  { const sb = eio(span(s.lbar, 7.4, 8)); if (sb > 0){ const rr = (s.lbar - 8) * BAR * .1, R1 = lerp(150, 1180, sb), DRn = lerp(150, 380, eio(span(s.lbar, 7.25, 8)));
    g.save(); g.globalAlpha = clamp((R1 - DRn - 20) / 280); g.beginPath(); g.arc(960, 540, R1, 0, TAU); g.clip(); bgFill(g, K.sky); raysFan(g, 960, 540, 8, 2400, rr, '#0771e4', .22); raysFan(g, 960, 540, 8, 2400, rr + TAU / 16, '#0884ef', .22); g.restore(); } }
  { const gr = eio(span(s.lbar, 7.25, 8)), DR = lerp(150 + 12 * s.k * (1 - gr), 380, gr); disc(g, W / 2, H / 2, DR, lerp(.6, 1, gr));   // r5: the scene's own kick swell capped (was +40 %)
    const cr = eio(span(s.lbar, 7.5, 8)); if (cr > 0){ g.globalAlpha = cr; discLad(g, 960, 540, DR * .995, '#e7ffff', '#9ee9ff', '#42cefb', null, .075); g.globalAlpha = 1; } }
  g.restore();
  g.globalAlpha = sA; spec3D(g, s, W / 2, H / 2, rot, sq, sgrow, 'front'); g.globalAlpha = 1;
  beatEvents(s, 3, 456, (b, a) => triBurst(g, b + 3000, a, W / 2, H / 2, 2, 900, BEAT * 3, 44), 2);
  beatEvents(s, 4, -1e9, (b, a) => { if (b < 472) swooshEvt(g, b + 1500, a, BEAT * 2.2, 8 + 6 * hash(b)); }, 2);   // r8b: no crossing white arcs from 118
};
// 120–126: a clean sunburst: two blues of flat rays turning behind the disc, one white line per beat, triangles only on the kicks
SC_.sunburst = (g, s) => {
  bgFill(g, K.sky);
  // r12 (jury whole-song pass: grey and flat after rings' saturated bands): the rays are the key visual's stripe colours,
  // navy and royal alternating; they turn steadily with a small push on each beat (no ticking steps)
  const f = fract(s.lb), rot = s.T * .1 + TAU / 48 * (Math.floor(s.lb) + eout(f));
  // r9b (visual: a centred disc with alternating rays risks a "rising sun" flag; fresh: the disc never changes): 8 rays only;
  // the disc builds a step each bar (R 380 -> 460 over the 4 bars)
  // r12b (all jurors: high-contrast navy / royal rays round a centred sun risk the rising-sun-flag reading): two mid blues,
  // low contrast against the sky
  raysFan(g, 960, 540, 8, 2400, rot, '#0771e4', .22); raysFan(g, 960, 540, 8, 2400, rot + TAU / 16, '#0884ef', .22);
  const DR = 380 + 20 * stepEase(clamp(s.lbar, 0, 3.999), .25, eio);   // +20 on each downbeat (hush's porthole sees the final 460)
  // (r16 audit, my pass: on the cut the rings of onsets before 122 popped in half grown) only sunburst's own onsets
  // (r25c whole-song review, advocate: thin white rings spreading over the rays made a dartboard, flagged since r21b)
  // each onset is a flat pale halo behind the sun that swells out and fades (a filled light, not a line)
  // (r26 advocate: its hard edge over the rays read as a cog) the halo feathers out from the rim (softHalo)
  for (const [t, kk] of onsetsIn(Math.max(s.t - .8, B(122)), s.t + 1e-6)){ const a = (s.t - t) / .8, r = DR + 60 + 220 * eout(a); softHalo(g, 960, 540, DR, r, .2 * kk * (1 - eio(a))); }
  // r9 (fresh eyes: "4 bars of almost the same frame; the arc hugging the disc reads as a gauge"): no hugging arc; a
  // key-visual long line pair crosses the whole frame each bar; on the snare three triangles fly out from the rim
  // (r16 audit, fresh eyes: in hush's window a new pair started on the cut, popping in at the right edge: review note 9
  // again) inside hush's window (noPlane, bar >= 4) no new pair starts; bar 125's pair has already been reeled in
  if (!(s.noPlane && s.lbar >= 4)){ const ph = fract(s.lbar), P = Math.floor(s.lbar) % 2 ? v => [lerp(-100, 2020, v), 880 - v * 620 + Math.sin(v * 3) * 50] : v => [lerp(2020, -100, v), 820 - v * 520 - Math.sin(v * 2.6) * 60];
    kvLines(g, P, ein(clamp(ph * 1.4 - .4)), s.lbar < 1 ? eio(clamp(ph * 3)) : eout(clamp(ph * 3.5)), 9); }   // (re-audit, visual: on the cut from rings the first pair shot in) drawn over a beat in bar 122
  beatEvents(s, 2, 488, (b, a) => { if (b % 2 !== 1) return; const u = a / (BEAT * 1.6); if (u > 1) return;
    for (let j = 0; j < 3; j++){ const ang = hash(b * 3 + j) * TAU, d = lerp(DR + 20, 980, eout(u)); triK(g, 960 + Math.cos(ang) * d, 540 + Math.sin(ang) * d * .8, 40 * (1 - ein(u)), ang + Math.PI / 2 + u * 2, 0, j % 2 ? K.mint : K.white, j); } });
  disc(g, 960, 540, DR + 12 * s.k);
  discLad(g, 960, 540, (DR + 12 * s.k) * .995, '#e7ffff', '#9ee9ff', '#42cefb', null, .075);   // r12: the brightest sun so far (cream core)
  // (r16 audit: its whole trail popped in on the cut) the trail grows from the cut
  // (r29 rules audit: on the cut into hush (whose window does not draw it) the comet's ~40 px head vanished in one frame)
  // the comet fades out over sunburst's last ~10 frames
  const cfo = 1 - eio(span(s.lbar, 3.88, 4));
  if (!s.noPlane && cfo > 0){ const orb = τ => { const A = Math.PI / 2 + τ / BEAT * TAU / 12; return [960 + Math.cos(A) * 640, 540 + Math.sin(A) * 400]; };
    g.globalAlpha = cfo; flight(g, orb, s.T, 62, { trail: 1.2, w: 9, from: 0 }); g.globalAlpha = 1;
    // (r22 whole-song pass, fresh eyes: "the white arc round the sun stops in mid-air", a headless trail since the plane was
    // retired) a soft light leads it, so it reads as a comet circling the sun
    { const [hx, hy] = orb(s.T); softGlow(g, hx, hy, 40, .9 * clamp(s.T / (BEAT * .5)) * cfo); } }
};
// FINAL APPROACH 126–130: the camera follows the plane up out of the sunburst into the night (no colour cards);
// then the vortex: everything is drawn into one point (learned from the PDoom
// "Omega Point" shot): spiral arms wind in, the key visual's pieces stream along them faster and faster, the camera
// rolls and pushes, the point swells, rays flare out and the light fills the frame for the final drop.
const OMEGA = Array.from({ length: 40 }, (_, j) => ({ h: hash(j * 3.1 + 1), sp: .3 + hash(j + 7) * .35, k: j % 5, col: [K.white, K.cyan, K.mint, K.white, K.azure][j % 5], s: 16 + hash(j + 11) * 20 }));
SC_.hush = (g, s) => {
  if (s.lb < 8){
    // r8 (review: the vortex's idea is right, but it lacked a link; it got big too suddenly): no more scrolling the
    // sunburst away. The whole sunburst is drawn in through a shrinking round window into the vortex's centre (its disc
    // eases R 380 -> 40 over 1.75 bars at the same centre: a match on the circle), while the vortex itself grows from a
    // small swirl round that point to its full size exactly on 128 (the locked part starts from there unchanged)
    const night = eio(span(s.lb, 1, 7.5)), f = lerp(1, 40 / 380, eio(span(s.lb, 1, 8)));
    // r8d (review: the vortex was good now, but it suddenly turned transparent): the round window used to stop at R 121
    // and vanish on 128; now it closes all the way down to the centre disc's size (R 44) and its light rim fades out
    // over the last bar, so on 128 there is nothing left to vanish
    const rp = lerp(1150, 44, eio(span(s.lb, 1, 8))), rimA = 1 - eio(span(s.lb, 4, 8));
    vgrad(g, '#022560', K.navy);
    g.save(); g.beginPath(); g.arc(960, 540, rp, 0, TAU); g.clip();
    g.translate(960, 540); g.scale(f, f); g.translate(-960, -540); SC_.sunburst(g, Object.assign({}, s, { lb: s.lb + 16, lbar: s.lbar + 4, T: s.T + 4 * BAR, noPlane: true }));
    g.globalAlpha = .55 * night; bgFill(g, K.navy); g.globalAlpha = 1; g.restore();
    if (f < .995 && rimA > 0){ g.globalAlpha = rimA; ring(g, 960, 540, rp, rp + 6, '#9ee9ff'); g.globalAlpha = 1; }
    for (let i = 0; i < 9; i++){ const tw = night * (.55 + .45 * Math.sin(s.T * 3 + i * 2)); if (tw <= .05) continue; const sx0 = 120 + hash(i + 300) * 1680, sy0 = 80 + hash(i + 310) * 760, ss0 = 8 + 10 * hash(i + 320);
      if (HUSH_VAR === 'S'){ softGlow(g, sx0, sy0, ss0 * 1.6, tw, i % 3 ? '#fffef2' : '#9ee9ff'); continue; }   // (r30 variant: soft round lights)
      g.globalAlpha = tw; star4(g, sx0, sy0, ss0, 0, i % 3 ? K.white : K.cyan); }
    g.globalAlpha = 1;
    // r16 (review: at 172-173 s something suddenly appeared slightly out of place): the plane used to restart at the bottom
    // centre on the cut while sunburst left it orbiting at the upper left; now its path (and trail) carries on along
    // sunburst's orbit (scaled with the window) and eases onto the climb over the first 2 beats
    // (r16 audit, fresh eyes: climbing across the disc it read as a scratch) it fades to .5 over those 2 beats
    g.globalAlpha = 1 - .65 * eio(span(s.lb, 0, 1.5));
    flight(g, τ => { const u = τ / (7 * BEAT), A = Math.PI / 2 + (τ + 16 * BEAT) / BEAT * TAU / 12, w = eio(clamp(τ / (2 * BEAT)));
      const ox = 960 + Math.cos(A) * 640 * f, oy = 540 + Math.sin(A) * 400 * f; return [lerp(ox, bez(960, 520, 1040, u), w), lerp(oy, bez(940, 700, -260, u), w)]; }, s.T, 64, { trail: 1.3, w: 9 });
    g.globalAlpha = 1;
    // r7 (review: the vortex suddenly appeared; it needs an animated entrance): over bar 127 the vortex winds itself up:
    // its centre fades in over 2 beats and its 5 arms draw in from the edge one after another (one every .8 beat), on the
    // same path and spin as the locked vortex (128-130 unchanged), so at 128.0 they are simply already there
    if (s.lb >= 2){ const C = [960, 540], tt = (s.lb - 8) * BEAT, spin = tt * .7, vs = lerp(.12, 1, eio(span(s.lb, 2, 8)));
      g.globalAlpha = .16 * eout(span(s.lb, 2, 3));
      for (let b = 0; b < 5; b++) swoosh(g, u => { const a = b * TAU / 5 + u * 4.2 + spin, r = (1300 * Math.pow(1 - u, 1.4) + 30) * vs; return [C[0] + Math.cos(a) * r, C[1] + Math.sin(a) * r * .8]; }, 0, 1, b % 2 ? 3 : 6);
      g.globalAlpha = 1;
      // the locked part's glow round the centre fades in over the last half bar (it popped in on 128.0)
      const gw = eio(span(s.lb, 6, 8)), gr = 40 + 12 * pulse(s.beat, 4); if (gw > 0){ circle(g, C[0], C[1], gr * 3.2, `rgba(158,233,255,${.08 * gw})`); circle(g, C[0], C[1], gr * 2, `rgba(158,233,255,${.14 * gw})`); }
      const cf = eio(span(s.lb, 6, 8)); if (cf > 0){ g.globalAlpha = cf; disc(g, C[0], C[1], gr, .6); g.globalAlpha = 1; } }
    return;
  }
  const k = span(s.lb, 8, 16), tt = (s.lb - 8) * BEAT, flare = ein(span(s.lb, 14.6, 16)), C = [960, 540];
  vgrad(g, '#022560', K.navy);
  g.save(); g.translate(W / 2, H / 2); g.rotate(.25 * eio(k)); g.scale(1 + .12 * eio(k), 1 + .12 * eio(k)); g.translate(-W / 2, -H / 2);
  const spin = tt * .7 + 3.2 * k * k;
  g.globalAlpha = .16 + .3 * k;
  for (let b = 0; b < 5; b++) swoosh(g, u => { const a = b * TAU / 5 + u * 4.2 + spin, r = 1300 * Math.pow(1 - u, 1.4) + 30; return [C[0] + Math.cos(a) * r, C[1] + Math.sin(a) * r * .8]; }, 0, 1, b % 2 ? 3 : 6);
  g.globalAlpha = 1;
  for (const p of OMEGA){ const q = fract(p.h + tt * p.sp * (1 + 1.6 * k)), r = 1250 * Math.pow(1 - q, 1.3) + 20, a = p.h * TAU + q * 3 + spin;
    const x = C[0] + Math.cos(a) * r, y = C[1] + Math.sin(a) * r * .8, sz = p.s * (.35 + .65 * (1 - q)); g.globalAlpha = clamp(q * 5) * clamp((1 - q) * 8) * clamp(k * 6);
    if (p.k % 2){ if (HUSH_VAR === 'S'){ const al = g.globalAlpha; g.globalAlpha = 1; softGlow(g, x, y, sz * 1.1, al, p.col); } else star4(g, x, y, sz, a, p.col); }   // (r30 variant: soft round lights)
    else triK(g, x, y, sz * 1.3, a + Math.PI / 2, q, p.col, p.k); }
  g.globalAlpha = 1;
  const gr = 40 + 70 * k + 12 * pulse(s.beat, 4);
  circle(g, C[0], C[1], gr * 3.2, 'rgba(158,233,255,.08)'); circle(g, C[0], C[1], gr * 2, 'rgba(158,233,255,.14)');
  disc(g, C[0], C[1], gr, .6);
  if (flare > 0){ raysFan(g, C[0], C[1], 12, 220 + 1800 * flare, tt * .5, `rgba(255,255,244,${.55 * flare})`, .16); circle(g, C[0], C[1], gr + 1300 * flare * flare, K.white); }
  g.restore();
};
// FINAL DROP 130–146 (2:58.45–3:20.40), r4: "the sky clears", now with the energy of the biggest drop (fresh-eyes F1,
// advocate r4). On the hit the white recedes within a beat and the clouds are pushed apart from the centre; a
// whole sun rises from the bottom in 4 steps (one ladder step brighter each time), the sky stays saturated key-visual
// blue (never washed out). Beat layers only light / move what is there: the sun's collar thickens on every beat, a
// thick ring of light leaves the sun on every bar, the snare (beats 2 and 4) throws a few key-visual triangles off the
// sun's edge, and the melody writes a pair of contrails, a new direction each phrase. At 138 the key visual's frame
// comes back at the edges; at 146 we cut on a hit into the key visual itself (finale).
const bez = (a, b, c, u) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * b + u * u * c;
function discLad(g, x, y, R, c0, c1, c2, collar, cw = .075, hl = null){
  if (collar) circle(g, x, y, R * (1 + cw), collar);
  // r6d: optional hl = angle of the highlight (trance: the moon's bright side turns on 84 / 88 / 92)
  const fx = hl === null ? -.43 : Math.cos(hl) * .49, fy = hl === null ? .24 : Math.sin(hl) * .49;
  const gr = g.createRadialGradient(x + fx * R, y + fy * R, 0, x + fx * .23 * R, y + fy * .2 * R, R * 1.2);
  gr.addColorStop(0, c0); gr.addColorStop(.55, c1); gr.addColorStop(1, c2);
  g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = gr; g.fill();
}
// [local bar, centre y, radius, sky centre / middle / edge, sun inner / middle / edge]
// r5 (visual juror): the sky keeps the key visual's bright blue and the sun's core climbs the ladder to #E7FFFF, so the
// final drop is the brightest part of the song without washing out (saturation stays >= 0.44)
// r6 (gate r5b, advocate: the sun's core equalled the sky and read as a ring): the visual juror's measured r4 §4.2
// values; L .68 -> .775, S >= .44, the sun always one ladder step above the sky behind it
const RAD_STEPS = [
  [0, 1150, 640, '#42cefb', '#2cbff8', '#0ea4f2', '#7bdcfa', '#42cefb', '#2cbff8'],
  [4, 1040, 660, '#42cefb', '#42cefb', '#2cbff8', '#9ee9ff', '#7bdcfa', '#42cefb'],
  [8, 900, 690, '#7bdcfa', '#42cefb', '#42cefb', '#c9e8fe', '#9ee9ff', '#7bdcfa'],
  [12, 760, 720, '#7bdcfa', '#42cefb', '#42cefb', '#e7ffff', '#c9e8fe', '#9ee9ff']];
function radStep(L){
  let i = 0; while (i < RAD_STEPS.length - 1 && L >= RAD_STEPS[i + 1][0]) i++;
  const cur = RAD_STEPS[i], prev = RAD_STEPS[Math.max(0, i - 1)], u = i === 0 ? 1 : eback(clamp((L - cur[0]) * BAR / .35)), uc = i === 0 ? 1 : eio(clamp((L - cur[0]) * 2));
  return { cy: lerp(prev[1], cur[1], u), R: lerp(prev[2], cur[2], u), sky: [3, 4, 5].map(k => lerpCol(prev[k], cur[k], uc)), sun: [6, 7, 8].map(k => lerpCol(prev[k], cur[k], uc)) };
}
// a contrail written by the melody: the head steps forward on every track-2 note between bars a and b
function melodyLine(g, s, a, b, P, w, tail){
  const ta = B(a), tb = B(b), ns = NOTE.filter(n => n.tr === 2 && n.t0 >= ta && n.t0 < tb), N = Math.max(1, ns.length);
  let k = 0, last = ta; for (const n of ns){ if (n.t0 <= s.t){ k++; last = n.t0; } }
  const hd = k === 0 ? 0 : clamp((k - 1 + eout(clamp((s.t - last) / .09))) / N);
  if (hd <= tail + .002) return;
  swoosh(g, P, tail, hd, w * 2.2, 'rgba(231,255,255,.35)'); swoosh(g, P, tail, hd, w);
}
const offsetPath = (P, d) => u => { const p = P(u), q = P(Math.min(1, u + .004)), r = P(Math.max(0, u - .004)); const dx = q[0] - r[0], dy = q[1] - r[1], l = Math.hypot(dx, dy) || 1; return [p[0] - dy / l * d, p[1] + dx / l * d]; };
const RAD_LINES = [[0, [-80, 760], [900, 380], [2000, 260]], [4, [2000, 700], [1000, 300], [-80, 220]], [8, [-80, 330], [960, 110], [2000, 380]], [12, [2000, 300], [960, 60], [-80, 180]]];
// r7: the day version of the final drop, kept for reference only (no longer in STORY)
SC_.radianceDay = (g, s) => {
  const L = s.lbar, st = radStep(L);
  // r5: in the last bar the sun eases into the finale's first framing of the key-visual disc (anchored cut at 146)
  // r6 (advocate: everything changed in one frame at 146): the finale now opens close on the cloud tower (1.42x at
  // (520, 640)), so in the last bar the camera pushes in to exactly that framing, the sun eases onto the key visual's disc
  // (960, 540, R 720) and takes its colours; the two clouds sink away and the last contrails withdraw before the cut
  const toF = eio(span(L, 15, 16)); st.cy = lerp(st.cy, 540, toF); st.R = lerp(st.R, 720, toF) * (1 + .03 * s.k);
  const cz = lerp(1, 1.42, toF); g.save(); g.translate(W / 2, H / 2); g.scale(cz, cz); g.translate(-lerp(960, 520, toF), -lerp(540, 640, toF));
  { const gr = g.createRadialGradient(960, st.cy, 0, 960, st.cy, 1700); gr.addColorStop(0, st.sky[0]); gr.addColorStop(.5, st.sky[1]); gr.addColorStop(1, st.sky[2]); g.fillStyle = gr; g.fillRect(-W, -H, 3 * W, 3 * H); }
  // a thick ring of light leaves the sun on every bar
  // r5: a thick ring every 2 beats, every beat from 138 (rhythm juror: the final drop moved too little on the beat)
  { const age = L < 8 ? fract(L * 2) : fract(L * 4), r = lerp(st.R * 1.08, 1700, eout(age)); g.globalAlpha = .9 * (1 - eout(age)); ring(g, 960, st.cy, r, r + lerp(14, 4, age), K.white); g.globalAlpha = 1; }
  // the sun: whole, rising; its collar thickens on every beat (+60 %, 120 ms)
  const cw = .075 * (1 + .6 * Math.exp(-fract(s.beat) * BEAT / .12));
  discLad(g, 960, st.cy, st.R, st.sun[0], st.sun[1], st.sun[2], '#0b8ef4', cw);
  if (toF > 0){ g.globalAlpha = toF; disc(g, 960, st.cy, st.R); g.globalAlpha = 1; }   // r6: becomes the key visual's disc
  // the snare (beats 2 and 4): a few key-visual triangles thrown off the sun's upper edge, gone within a beat
  beatEvents(s, 1, -1e9, (b, ag) => { if (b % 2 === 0 || L < .25) return; const u = ag / BEAT; if (u > 1) return; const R0 = mulberry32(b * 31 + 5);
    for (let j = 0; j < 3; j++){ const a = -Math.PI * (.15 + .7 * R0()), /* r6 (advocate): 3 per snare, not 6 */ d =st.R * 1.12 + 260 * eout(u), tang = a + Math.PI / 2;
      triK(g, 960 + Math.cos(a) * d + Math.cos(tang) * 90 * u, st.cy + Math.sin(a) * d + Math.sin(tang) * 90 * u, 34 * (1 - ein(u)), a + u * 3, 0, [K.white, K.mint, K.white][j % 3], 3); } });
  // the melody writes a pair of contrails, a new direction each phrase; the old pair withdraws during the next phrase
  for (const [b0, p0, p1, p2] of RAD_LINES){ if (L < b0 || L > b0 + 6) continue;
    const P = u => [bez(p0[0], p1[0], p2[0], u), bez(p0[1], p1[1], p2[1], u)], tail = b0 === 12 ? eio(span(L, 15.75, 16)) : eio(span(L, b0 + 4, b0 + 6));
    melodyLine(g, s, 130 + b0, 130 + b0 + 4, P, 12, tail); melodyLine(g, s, 130 + b0, 130 + b0 + 4, offsetPath(P, 26), 6, tail); }
  // two clouds pushed apart from the centre on the hit, then they ride the sides (lit side toward the sun)
  const push = eout(span(L, 0, 1)), bob = Math.sin(s.T * .6) * 8, sink = 560 * ein(span(L, 15.75, 16.0));   // r6: they sink before the cut
  cloudS(g, 'fin_l', lerp(1080, 1560, push), lerp(980, 900, push) + bob + sink, .8, 0, true);
  cloudS(g, 'fin_r', lerp(840, 360, push), lerp(1000, 880, push) - bob + sink, .95);
  // 138: the key visual's frame comes back at the edges, one piece per beat, and stays into the finale
  const p1 = eout(span(L, 8, 8.3)), p2 = eout(span(L, 8.25, 8.55)), p3 = pop((L - 8.5) * 4);
  if (p1 > 0){ g.save(); g.translate(-60 - 400 * (1 - p1), 1120 + 300 * (1 - p1)); g.rotate(stepEase(Math.max(0, L - 8), .2, eback) * .05); const r0 = 520, r1 = 580;
    g.beginPath(); g.arc(0, 0, r1, -Math.PI * .5, -Math.PI * .02); g.arc(0, 0, r0, -Math.PI * .02, -Math.PI * .5, true); g.closePath(); g.fillStyle = K.navy; g.fill();
    g.beginPath(); g.arc(0, 0, r1 + 40, -Math.PI * .34, -Math.PI * .04); g.arc(0, 0, r1, -Math.PI * .04, -Math.PI * .34, true); g.closePath(); g.save(); g.clip(); rect(g, -100, -800, 900, 900, K.navy); dots(g, -100, -800, 800, 100, 21, 4.4, K.white); g.restore();
    g.restore(); }
  if (p2 > 0){ g.save(); g.translate(560 * (1 - p2), 420 * (1 - p2)); g.beginPath(); g.moveTo(1470, 1100); g.quadraticCurveTo(1700, 820, 1940, 470); g.lineTo(2100, 470); g.lineTo(2100, 1200); g.lineTo(1470, 1200); g.closePath(); g.clip();
    stripes(g, 1750, 850, -.72, 40, stepEase(s.beat, .3, eout) * 40, [K.navy, K.royal, K.navy, K.light]); g.restore(); }
  if (p3 > 0) triK(g, 1780, 210, 60 * p3, .18, 0, K.mint, 3);
  g.restore();
  // the vortex's white recedes within one beat
  const w0 = 1 - eout(span(L, 0, .25)); if (w0 > 0){ g.globalAlpha = w0; rect(g, 0, 0, W, H, K.white); g.globalAlpha = 1; }
};
// FINAL DRIVE 144–154: out of the light; lines circle the disc like rings round a planet; the key visual's pieces orbit with them

// r3: at 150 a soft camera change (the orbit plane turns toward side view, the disc moves left); from 151 the orbit
// slows down and at 153.4 everything stops: the only completely still, clean frame of the song (ideas juror), held to 154.
SC_.orbit = (g, s) => {
  const L = s.lbar, T5 = 5 * BAR, D = 2.4 * BAR, dt = clamp(s.T - T5, 0, D), Tw = s.T < T5 ? s.T : T5 + dt - dt * dt / (2 * D);
  s = Object.assign({}, s, { T: Tw }); const still = L >= 7.4;
  const k150 = eback(span(L, 4, 4.3));
  skyBg(g, 960, 540);
  const cx = lerp(960, 780, k150), cy = H / 2;

  const fl = lerp(1, .5, clamp(k150, 0, 1.1));
  const rings2 = [[700, 150 * fl, -.28, 1], [820, 190 * fl, .2, -1.3], [620, 120 * fl, -.05, .8]];
  const P = (j, ph) => v => { const [rx, ry, tl] = rings2[j]; const a = v * TAU + ph; const x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(tl) - y * Math.sin(tl), cy + x * Math.sin(tl) + y * Math.cos(tl)]; };
  const phs = rings2.map(r => s.T * r[3]);
  const back = (j, ph) => v => Math.sin(v * TAU + ph) < 0;
  navyArc(g, cx, cy, 900, 960, s.T * .15, s.T * .15 + 1.2, s.T * .15 + .3, s.T * .15 + .9, s.T * 20);
  stripeArc(g, cx, cy, 940, 1010, s.T * .15 + 3, s.T * .15 + 4, s.T * 50);
  rings2.forEach((r, j) => { for (const [a, b] of runs(120, back(j, phs[j]))) swoosh(g, P(j, phs[j]), a, Math.min(.999, b), 8 - j * 2); });
  const pa = s.T * 1.25 + 1, pBack = Math.sin(pa) < 0, PL = τ => P(0, τ * 1.25 + 1)(0);
  if (pBack) flight(g, PL, s.T, 34, { trail: 0 });
  disc(g, cx, cy, lerp(330, 380, k150) + (still ? 0 : 20 * s.k));
  rings2.forEach((r, j) => { for (const [a, b] of runs(120, v => !back(j, phs[j])(v))) swoosh(g, P(j, phs[j]), a, Math.min(.999, b), 10 - j * 2); });
  if (!pBack) flight(g, PL, s.T, 44 + 12 * Math.sin(pa), { trail: 0 });
  // r3: three triangles ride the orbit (was 9 pieces + 4 floating halftone shapes, which are not key-visual objects)
  for (let i = 0; i < 3; i++){ const a = i * TAU / 3 - s.T * .5, d = 470 + 26 * Math.sin(s.T + i); triK(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d * .45 * fl, 34 + (still ? 0 : 12 * pulse(s.beat + i * .25, 5)), a * 2, s.T * .3 + i * .1, [K.white, K.mint, K.white][i], i); }
  if (L < 5) for (const [t, kk, id] of onsetsIn(s.t - .7, s.t + 1e-6)) triBurst(g, id + 8000, s.t - t, cx, cy, 2, 480 * kk, .7, 34);
  if (s.lb < 1){ g.globalAlpha = 1 - eout(s.lb); rect(g, 0, 0, W, H, K.white); g.globalAlpha = 1; }
};
// ================================================================== FINAL DROP 130-146, r7: the night sky (10-08)
// 130: the vortex's white clears to a full star sky with a pale sun as the pole. Meteors fall at the key visual's stripe
// angle, denser each phrase (one per half bar -> one per beat -> a shower with extra snare meteors, at most ~6 on
// screen). On every phrase downbeat (130/134/138/142) a bloom opens round the sun; from 134 star trails turn round the
// sun (+4 deg a beat); 138-141 one firework per downbeat. 142-146 the dawn: the sky lightens a step a bar, the trails
// speed up and fade, the sun rises and grows, and the camera pushes into the finale's first framing (day key visual at 146).
const KV_DISC = [998, 364, 765];   // r8: the disc of the key visual image (centre x, y, radius inside the collar)
const MET_ANG = Math.PI - .62;   // falling down-left along the key visual's stripe angle
function nightMeteors(g, s){
  const b0 = Math.floor(s.beat);
  for (let b = b0 - 3; b <= b0; b++){ const lb = b - 520; if (lb < 0 || lb >= 56) continue;   // beat 520 = bar 130; none after 144
    // per beat: 130-133 every 2nd beat; 134-137 one; 138-141 two, three on the snare (2, 4); 142-143 eighth notes (two,
    // the second half a beat late) plus one fireball on 142.0
    // r7c (jury r7b: 130-133 the emptiest moment, 138-141 too busy): a burst of 3 on every downbeat of 130-133 (1 on beat 3);
    // 134-137 one a beat (2 on the downbeat); 138-139 one a beat; 140-141 two; 142-143 eighth notes
    // r10 (advocate: 130-134 still "a disc standing still"): 5 bright meteors on each downbeat of 130-133
    const bar = Math.floor(lb / 4), bt = lb % 4, n = bar < 4 ? (bt === 0 ? 5 : bt === 2 ? 2 : 0) : bar < 8 ? (bt === 0 ? 2 : 1) : bar < 10 ? 1 : 2;
    for (let j = 0; j < n; j++){ const R = mulberry32(b * 13 + j * 7), delay = bar >= 12 && j === 1 ? .5 : j * .12, u = (s.beat - b - delay) / (j ? 1.6 : 2.0); if (u <= 0 || u >= 1) continue;   /* r8d: longer flights (they cross the whole sky now) */
      // r8d (review: let the meteors travel further; stopping half way is not pretty): every meteor now crosses the whole
      // sky (2400 / 2000 px) and leaves the frame while still bright, instead of fading in the middle of the screen
      const big = j === 0; meteor(g, 700 + R() * 1500, -160 + R() * 300, MET_ANG + (R() - .5) * .06, big ? 2600 : 2100, big ? 760 : bar < 4 ? 680 : 420, u, big ? 9 : bar < 4 ? 8 : 5); } }
  { const u = (s.beat - 568) / 3; if (u > 0 && u < 1) meteor(g, 2100, -160, MET_ANG, 2600, 1500, u, 16); }   // the fireball, 142.0, across the whole sky
}
// r7c (advocate: the triangle petals read as arrows / a compass): 138-141 one key-visual piece opens off the sun's
// rim on each downbeat (eback, half a beat) and they stay, so the key visual is rebuilt round the sun before the dawn:
// a dotted navy arc, a stripe arc, a pair of white arcs, a second navy arc. They turn a step a beat and are reeled in 144-145.
// r16b (advocate: at 3:19.6-3:20.3 the arc pieces vanished first and left one big sun at the end of the climax):
// they are no longer reeled in at 144-145; the reunion (finale) flies them outward off the sun and fades them (fly 0..1)
function sunPieces(g, s, sx, sy, sR, fly = 0, cut = null, pa = null){
  // r18 (jury_r18: flow, not a tick a beat): the pieces turn continuously at the same mean speed (.06 rad a beat)
  const L = s.lbar, back = 1, st = (s.beat + .6) * .06;
  if (fly >= 1) return;
  if (fly > 0){ g.save(); g.globalAlpha = 1 - fly; g.translate(sx, sy); g.scale(1 + 1.4 * fly, 1 + 1.4 * fly); g.translate(-sx, -sy); }
  sunPiecesIn(g, s, sx, sy, sR, back, st, cut, pa);
  if (fly > 0){ g.restore(); g.globalAlpha = 1; }
}
// r23: the radiance pieces (in sunPiecesIn's order), and the point at fraction f along piece pi at a given global beat
// (the finale breaks them up from their tails into small triangles)
const SUN_P = [[2, 2.2, 'white'], [4, -2.5, 'navy'], [6, .35, 'stripe'], [9, -.6, 'navy']];
function sunPieceAt(pi, beat, sx, sy, sR, f){ const [, a0, kind] = SUN_P[pi], a = a0 + (beat + .6) * .06 * (kind === 'white' ? -1 : 1) + f * 1.75, r = sR * 1.28 + (kind === 'white' ? 181 : kind === 'stripe' ? 100 : 0);
  return [sx + Math.cos(a) * r, sy + Math.sin(a) * r]; }
// r23 preview variant (index.html?rad=B; both jurors of the r21b whole-song pass: the pieces hugging the sun plus thin rings
// read as a HUD dial): the pieces sit far out (2.6 R) and are long enough that both ends run past the frame, like the key
// visual's own corner arcs; the triangle flowers become sprays thrown out along the meteors' direction
const RAD_VAR = (typeof Q !== 'undefined' && Q.get('rad')) || 'A';
function sunPiecesIn(g, s, sx, sy, sR, back, st, cut = null, pa = null){
  const L = s.lbar;
  if (RAD_VAR === 'B'){ const P = [[2, 2.6, 'white'], [4, -2.0, 'navy'], [6, .55, 'stripe'], [9, -.9, 'navy']];
    for (const [b, a0, kind] of P){ const op = eio(span(L, b, b + .5)); if (op <= 0) continue; const len = 2.2 * op * back, a = a0 + st * (kind === 'white' ? -1 : 1), r0 = sR * 2.6 + (kind === 'white' ? 120 : 0);
      if (len < .02) continue;
      if (kind === 'navy') kvArc(g, sx, sy, r0, a - len / 2, len, s.T * 20, '#42cefb');
      else if (kind === 'stripe') stripeArc(g, sx, sy, r0 + 70, r0 + 130, a - len / 2, a + len / 2, s.T * 40);
      else for (const dr of [0, 22]){ g.beginPath(); g.arc(sx, sy, r0 + dr, a - len / 2, a + len / 2); g.strokeStyle = '#fffef2'; g.lineWidth = dr ? 4 : 8; g.lineCap = 'round'; g.stroke(); } }
    return; }
  // r10 (advocate: 130-134 must not be "a disc standing still"): the key visual is rebuilt round the sun across the
  // whole drop, one piece every 2 bars from 132 (was 138-141 only)
  // (r23: cut[pi] = the fraction already broken away from the piece's tail)
  for (let pi = 0; pi < SUN_P.length; pi++){ const [b, a0, kind] = SUN_P[pi], op = eback(span(L, b, b + .125)), c = cut ? cut[pi] : 0; if (op <= 0 || c >= 1) continue;
    const len0 = 1.75 * op * back, len = len0 * (1 - c), a = a0 + st * (kind === 'white' ? -1 : 1) + len0 * c, r0 = sR * 1.28, al = pa ? pa[pi] : 1;
    if (len < .02 || al <= 0) continue;
    const ga = g.globalAlpha; g.globalAlpha = ga * al;
    // r8 (review: only half of it had white dots, ugly): like the key visual's own arc, a solid navy band and, just
    // outside it, a navy band dotted along its WHOLE length
    if (kind === 'navy') kvArc(g, sx, sy, r0, a, len, s.T * 20, '#42cefb');   // r8b: outlined so the solid band reads on the night
    else if (kind === 'stripe') stripeArc(g, sx, sy, r0 + 70, r0 + 130, a, a + len, s.T * 40);
    else for (const dr of [0, 22]){ g.beginPath(); g.arc(sx, sy, r0 + 170 + dr, a, a + len); g.strokeStyle = '#fffef2'; g.lineWidth = dr ? 4 : 8; g.lineCap = 'round'; g.stroke(); }
    g.globalAlpha = ga; }
}
// r7c (visual juror: thin spokes read as generic and fuzzy): a triangle flower: 8 cream key-visual triangles open with
// eback to R 110 round a mint core, then drift outwards and shrink away over 2 beats
function triFlower(g, x, y, u, R = 110){
  if (u <= 0 || u >= 1) return;
  const op = eback(clamp(u / .3)), fade = 1 - ein(span(u, .45, 1)), r = R * op + 50 * eout(u);
  for (let i = 0; i < 8; i++){ const a = i * TAU / 8 + u * .5; triK(g, x + Math.cos(a) * r, y + Math.sin(a) * r, 40 * fade, a + Math.PI / 2, 0, i % 2 ? '#fffef2' : '#e7ffff', 3); }
  circle(g, x, y, 20 * op * fade, K.mint);
}
// r16 (r15 review, marked as the most important part: at 197-198, maybe do not jump straight out of the drop's flashy animation; this
// section can be performed differently; and at 211 s, entering pure piano had no feeling): the drop runs at full energy
// to 154 (refs_r16.md), so radiance no longer builds the key visual in bar 145 and opens it with a round window. It stays
// the night drop to 146 with the dawn only half way (sky .55, stars at half), and the sun travels home on one clock over
// 144-148 (RAD_HOME), half way at the cut; finale (the "reunion", 146-154) carries every one of these on.
const RAD_HOME = t => eio(span((t - T0) / BAR, 145, 148.5));   // (re-audit, fresh eyes: at 145.5-146 the growing sun filled ~80 % of the frame) home a bar later
const RAD_DAWN = L => .45 * eio(span(L, 13, 16));
// r18 (liveness audit: radiance's odd bars ranked .7-.9 in the music and .1-.3 in the picture; jury_r18: keep the sun and
// the camera, make the time-lapse real): the sky turns round the pole .007 rad a beat on 130 (was .0045), speeding
// smoothly to .016 by 144 and holding it (the finale carries it on); the star trails come in from 136 at half strength
// (was 140), full by 140.5. lb = beats since 130, L = bars since 130.
const RAD_STAR_ROT0 = lb => lb <= 56 ? .007 * lb + .009 / 112 * lb * lb : .644 + .016 * (lb - 56);
// r23 (the last night, 146-154): the time-lapse speeds up from .016 to .032 rad a beat by 152 (lb 88), then slows to a stop
// by 153.875 (lb 95.5) for the frozen beat; integrated numerically (radiance's own range is unchanged)
const FIN_ROT_RATE = x => .016 + .016 * eio(span(x, 64, 88)) - .032 * eio(span(x, 88, 95.5));
const RAD_STAR_ROT = lb => { if (lb <= 64) return RAD_STAR_ROT0(lb); const e = Math.min(lb, 95.5), n = 48, h = (e - 64) / n; let a = 0; for (let i = 0; i < n; i++) a += FIN_ROT_RATE(64 + (i + .5) * h) * h; return RAD_STAR_ROT0(64) + a; };
// (r18b, fresh eyes: 131-135 still looked like r17d) the trails start on 132 at .15, short and slow, full by 140; they
// reach exactly r18's length by 146 so the finale's carry-over is unchanged
const RAD_TRAIL = L => { const bt = Math.max(0, (L - 2) * 4); return TAU / 90 * (bt * .5 + Math.max(0, bt - 32) * 1.5 + Math.max(0, bt - 40) * 4 + Math.max(0, bt - 48) * 4); };
const RAD_TRAIL_A = L => L < 2 ? 0 : lerp(.375, 1, clamp((L - 2) / 8)) * clamp((L - 2) * 2);
SC_.radiance = (g, s) => {
  const L = s.lbar, dawn = RAD_DAWN(L), toF = 0;
  // r7c (fresh eyes, third time: the last bar was a flat full-screen disc): no camera push any more; the sun only grows
  // to R 380, the trails stay faint to 146 and a quarter-beat white flash (IMPACTS 146) cuts into the finale
  // r8 (review: at 200 s go back to the most basic picture; the 200 s transition had big problems, change the
  // method): no white flash and no close-up any more. Across 145 the night sun grows into the key visual's own disc
  // (R 720 at the centre) while the key visual's pieces come home one group per beat, each sliding in from its own
  // edge: the corners (145.0), the stripes (145.25), the arc and the clouds (145.5), the triangles (145.75); on 146 the
  // white lines draw on the hit and the finale IS the key visual
  g.save();
  nightSky(g, .18 + .82 * dawn);   // two ladder steps brighter than the trance from the start; half way to day by 146
  const nf = 1 - .5 * eio(span(L, 14, 16));   // r16: stars and trails at half by 146 (the reunion fades the rest)
  // r10 (advocate: "the biggest climax, again a disc standing still in the middle"): from 130 the whole star field
  // turns slowly round the off-frame pole (1600, -300) like a time-lapse; from 140 the star trails continue that motion
  { const tr = RAD_STAR_ROT(s.lb); g.save(); g.translate(1600, -300); g.rotate(tr); g.translate(-1600, 300); drawStars(g, s, eout(span(L, 0, 2)), nf); g.restore(); }
  // the sun: a pale glowing core at the pole; in the dawn it grows into the key visual's disc
  // r8: the key visual image's own disc is at (998, 364), R 765 (tools/kv_asset.py, fitted on its collar); the sun lands
  // exactly there by 145.5, then the picture opens out from its rim (below)
  // (r16 audit, fresh eyes: the sun started 60 px below hush's centre, a blue crescent beside the white) from (960, 540)
  const home = RAD_HOME(s.t), sx = lerp(960, KV_DISC[0], home), sy = lerp(lerp(540, 560, eout(span(L, 0, 4))), KV_DISC[1], home),
    sR = lerp(200 * (1 + .12 * (eback(span(L, 4, 4.4)) + eback(span(L, 8, 8.4)) + eback(span(L, 12, 12.4))) + .06 * (eback(span(L, 2, 2.4)) + eback(span(L, 6, 6.4)) + eback(span(L, 10, 10.4)))), KV_DISC[2], home)   /* r10: and a half step between (132/136/140): it grows every 2 bars */ * (1 + .018 * s.k * (1 - home));   /* r16 audit: 1.8 % (3.5 % read as a pulsing face) */   // r7c: a step bigger each phrase (134/138/142)
  // star trails from 134: the stars turn round the sun, +4 deg a beat, faster from 142 and 144, fading with the dawn
  // r7c (rhythm juror: 138-142 too busy): trails come in from 140 only, 30 arcs at .4, and speed up from 142
  if (L >= 2){ const len = RAD_TRAIL(L); starTrails(g, 1600, -300, 30, Math.min(TAU, len * .6), len * .3, .4 * nf * RAD_TRAIL_A(L)); }   /* r7c (visual): pole off frame, so the arcs sweep across instead of a target round the sun */
  // a ring of light leaves the sun every 2 bars
  { const age = fract(L / 2), r = lerp(sR * 1.1, 1500, eout(age)); g.globalAlpha = .5 * (1 - eout(age)) * (1 - dawn) * clamp(age / .03); ring(g, sx, sy, r, r + lerp(10, 3, age), '#9ee9ff'); g.globalAlpha = 1; }   // (r29: fades in over ~3 frames)
  nightMeteors(g, s);   // r7: behind the sun (they crossed in front of it)
  { const ha = 1 - toF; if (ha > 0){ g.globalAlpha = ha; circle(g, sx, sy, sR * 1.3, lerpCol('#0550b8', '#2cbff8', dawn)); g.globalAlpha = 1; } }
  discLad(g, sx, sy, sR, '#e7ffff', '#9ee9ff', '#42cefb', '#0b8ef4', .075 * (1 + .6 * Math.exp(-fract(s.beat) * BEAT / .12)));
  // r7c (advocate: the triangle ring at 130 read as arrows): 130 opens with one plain light ring; the blooms on
  // 134/138/142 are 1.5x+ bigger
  { const u = span(L, 0, .5); if (u > 0 && u < 1){ const r = lerp(sR * 1.2, sR + 500, eout(u)); g.globalAlpha = .8 * (1 - u); ring(g, sx, sy, r, r + lerp(16, 3, u), '#e7ffff'); g.globalAlpha = 1; } }   /* r7c (rhythm juror): 2 beats, R + 500 */
  // r7c (visual / advocate): the phrase steps 134 / 138 / 142 are an opaque light ring R x1.1 -> 2.2 (no full-frame flash)
  // (r29 rules audit: on 138 / 142 (and 134) this ring appeared whole and opaque in one frame) it fades in over ~3 frames
  // and out at the end (the look is unchanged; radiance's rings are kept as they are)
  for (const p of [4, 8, 12]){ const u = span(L, p, p + .2); if (u > 0 && u < 1){ const r = sR * lerp(1.1, 2.2, eout(u)); g.globalAlpha = clamp(u / .25) * (1 - ein(span(u, .7, 1))); ring(g, sx, sy, r, r + lerp(18, 2, u), '#9ee9ff'); g.globalAlpha = 1; } }
  sunPieces(g, s, sx, sy, sR);
  if (RAD_VAR === 'B'){ for (let k = 0; k < 4; k++){ const u = span(L, 8 + k, 8.75 + k); if (u <= 0 || u >= 1) continue; const x0 = k % 2 ? 1500 : 420, y0 = k % 2 ? 330 : 280;
      for (let i = 0; i < 6; i++){ const a = MET_ANG + (i - 2.5) * .22, d = 40 + 520 * eout(u); triK(g, x0 + Math.cos(a) * d, y0 + Math.sin(a) * d, 40 * (1 - ein(u)), a + Math.PI / 2 + u * 2, 0, i % 2 ? '#fffef2' : '#e7ffff', 3); } } }
  else for (let k = 0; k < 4; k++) triFlower(g, k % 2 ? 1500 : 420, k % 2 ? 330 : 280, span(L, 8 + k, 8.5 + k), 120);
  // r7c (a translucent white over the night read grey): the vortex's white closes as an opaque iris into the sun in one beat
  // (r16 audit, fresh eyes: once closed onto the sun the white vanished in one frame, revealing the blue sun) it now stays on
  // the sun's face and fades over the next quarter bar
  // (r20 audit, fresh eyes: with hush's own white the frame stayed flat cream ~0.2 s, then the disc shrank in a blink)
  // the iris starts at R 1110 (just covering the corners) so it opens at once, and closes over 1.5 beats
  // (r21 check: with eio it still covered the frame a quarter beat after the cut) eout: the corners open at once and the
  // iris settles softly onto the sun
  { const u = span(L, 0, .375), fo = 1 - eio(span(L, .375, .625)); if (fo > 0){ g.globalAlpha = fo; circle(g, sx, sy, lerp(1110, sR * .98, eout(u)), K.white); g.globalAlpha = 1; } }
  g.restore();
};

