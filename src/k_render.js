// ================================================================== compositor
function sceneAt(bar){ let i = 0; while (i < STORY.length - 1 && bar >= STORY[i + 1][1]) i++; return i; }
function stateFor(i, t){ const b0 = STORY[i][1], bar = (t - T0) / BAR; return { t, bar, beat: (t - T0) / BEAT, lbar: bar - b0, lb: (bar - b0) * 4, T: t - B(b0), k: kickAt(t) }; }
// r3 energy ladder (rhythm juror, jury_r3_edit_rhythm.md §5.1, scheme A): per-kick zoom = .012·PUNCH = 0.007·AMT,
// so C1 (burst, AMT 1.0) 0.70 % < C2 (rings, 1.25) 0.875 % < C3 (radiance, 1.5) 1.05 %. assemble keeps its old 1.75 %
// (locked in review). A value can be a function of the scene's local bar for the steps inside a scene.
// r6: dawn follows the drums from bar 2 (gate r5b; .2 = 0.24 %, the smallest that reads)
// r16 (review: at 32-33 s the shake suddenly stopped matching while nothing else changed): the music runs
// on unchanged over the 24 cut, so assemble's big kick pump eases down to .6 over its last 3 bars and kvHold carries on
// from .6 to its .35 over its first 2 (continuous across the cut)
const PUNCH = { dawn: .2, tower1: .23, assemble: L => lerp(1.46, .6, eio(span(L, 5, 8))), kvHold: L => lerp(.6, .35, eio(span(L, 0, 2))), stripeRide: L => L < 2 ? .35 : .18, airy: 0, voyage: L => L < 4 ? .35 : L < 10 ? .1 : .3,
  approach: .2 /* r11c: the formation flight glides, no kick pump */, solo: 0, burst: .58, tilt: L => L < 3 ? .58 : .35,
  plunge: .2 /* r11 (review: at 80 s, not stuck on the drum hits): the glide no longer pumps on the kick */, hover: 0, horizon: .1 /* r15 (review: at 91 s, no jumping with the drums) */, band: .58, arcs: .58, montage: L => L < 1.5 ? .64 : .35,
  trance: L => L < 1 ? .58 * (1 - eio(L)) /* r19 (rhythm #1): arcs' kick pump carries on through bar 80, where the drums still play, and dies away into 81's quiet */ : L >= 14 ? .18 : 0, bloom: L => L < 2 ? .18 : L < 10 ? .35 : L < 14 ? .47 : .29, inhale: L => L < 1 ? .12 : 0,
  rings: L => lerp(.73, .41, eio(span(L, 7, 8))) /* r16 audit: eases to sunburst's pump (the drop runs on) */, sunburst: .41, hush: .1, radiance: .3,   /* r7: night drop; a 1 % kick zoom made the dense star trails flash (health JUMPs) */ finale: L => .3 * (1 - eio(span(L, 7.75, 7.875))) /* r23: the last night is radiance's drop carried on, so its .3 pump carries on too, to the frozen beat (r17b had eased it out over 146 under the plate) */, settle: L => L >= 4 && L < 8 ? .25 : 0, tail: 0 };
const punchOf = (name, lbar) => { const v = PUNCH[name]; return typeof v === 'function' ? v(lbar) : (v || 0); };
// three impact tiers (mtt's punch / hit / bigHit): bigHit only on the three drops, growing C1 < C2 < C3; hit on the first
// beat of the 4-bar blocks of the energetic sections. [bar, zoom, flash, roll]. The drops keep their own white flashes.
const IMPACTS = [[50, .06, 0, .015], [114, .08, 0, .02], [130, .10, 0, .025],
  [54, .025, .12, 0], [58, .025, .12, 0], [66, .025, .12, 0], [70, .025, 0, 0] /* re-audit: no flash (horizon has already wiped band in) */, [74, .025, .12, 0], [78, .025, .12, 0],
  [48, .04, 0, 0], [49, .025, 0, 0],   // r7: the 1:06 cut and the 1:07.37 flip hit
  [47, .02, 0, 0],   // r16: the big triangle fuses (first colour card)
  [68, .01, .05, 0], [71, .012, .05, 0], [72, .012, .05, 0], [73, .012, .05, 0],   // r6: horizon's camera change, band's angle switches
  [98, .015, 0, 0], [106, .01, .05, 0], [118, .031, .15, 0], [122, .031, 0, 0] /* re-audit (visual: a white wash on a cut that already matches) */, [134, .0375, 0, 0], [138, .0375, 0, 0], [142, .0375, 0, 0],
  [146, .031, 0, 0] /* r8: no flash; the key visual is built in bar 145 and the lines draw on the hit (134-142 flashes gone too) */, [150, .012, .05, 0]];   // r5 (rhythm juror): the finale sits under the final drop's peak
// which window of the light ladder each scene's sky uses (by local bar); scenes that paint their own ground ignore it
const TONE = {
  dawn: L => L < 1 ? TONES.N : L < 4 ? toneMix('N', 'R', span(L, 1, 4)) : L < 7.5 ? toneMix('R', 'S', span(L, 4, 7.5)) : toneMix('S', 'P', span(L, 7.5, 8)),
  tower1: () => TONES.P, airy: L => toneMix('P', 'S', span(L, 2, 8.5)),
  approach: L => L < 4 ? TONES.S : toneMix('S', 'P', span(L, 4, 5)), tilt: L => L < 3 ? toneMix('S', 'R', span(L, 0, .25)) : toneMix('R', 'S', span(L, 3, 4)),   // r7: back to plunge's sky by 58
  hover: L => toneMix('H', 'P', span(L, 0, 1)), horizon: L => toneMix('P', 'S', span(L, 0, .75)) /* r11: hover's sky carries over the match cut */, band: L => toneMix('S', 'R', span(L, 0, .25)),
  tail: L => toneMix('S', 'N', span(L, 1.5, 6.0)),   // r5: the sky itself deepens to navy at the end; r9: earlier (177.5-182) so the returning stars come with the dark
  inhale: L => toneMix('S', 'P', span(L, -.25, .5)), rings: () => TONES.R };
const toneFor = (name, L) => TONE[name] ? TONE[name](L) : null;
function impactAt(t){ let z = 0, f = 0, r = 0;
  for (const [b, zz, ff, rr] of IMPACTS){ const d = t - B(b); if (d < 0 || d > 1.2) continue;
    z += zz * Math.exp(-10 * d); f = Math.max(f, ff * Math.exp(-14 * d)); r += rr * Math.exp(-8 * d) * Math.cos(20 * d); }
  return [z, f, r]; }
// every shot has its own camera (learned from the PDoom video): a slow push / pan / roll across the shot,
// and in the drops a small shake on the kick. Values per second: px/py pan, zr zoom, rr roll; rs = roll sway, sh = shake px.
// r5: no pan / zoom drift in scenes whose cut must stay anchored on the disc (stripeRide, hover, horizon, band, bloom)
const CAMP = { tower1: { px: 7, py: -3, out: [6, 7] } /* r11b (fresh eyes: the ring at 22.09 sat 80 px off the iris): the pan returns to neutral during the snare roll */, stripeRide: {},
  burst: { sh: 7, zr: .004 }, tilt: { sh: 6 }, horizon: {} /* r15: no kick shake */, band: { sh: 5 },
  arcs: { rr: .012, sh: 4, rrOut: [4, 5.75] },   /* r8d: the roll unwinds before the cut into trance (the frame jumped ~6 deg) */
  montage: { sh: 5 }, trance: { rs: .022, zr: .0025, px: 3, out: [14.5, 16] },   // r11: these were swallowed by the comment above (rings' kick shake stays off)
  sunburst: { sh: 5, zr: .006, out: [3.25, 4] } /* r16 (review: 2:53 slightly out of place): the 3 % creep zoom eases back before hush */, radiance: { rs: .02, out: [14, 16] } /* r16: the sway settles before the reunion (no 1 deg jump on 146) */ };   // r7: no kick shake over the fine star trails
// r3: no random 24 fps jitter (Project SEKAI 2DMVs use no screen shake; mtt uses a damped directional kick):
// the frame dips along a fixed direction on each kick and springs back, max 3 px.
function shakeXY(t, amt){ const k = Math.min(amt, 3) * kickAt(t); const ph = Math.floor((t - T0) / BEAT) % 2 ? 1 : -1; return [ph * .4 * k, .9 * k]; }
function drawScene(g, i, t){
  // r3: the per-kick zoom was 5-10x the references (rhythm-game-bga: 0.007; he-drowns 1.4 %·amt) and made every frame
  // look busy; now at most ~1.3 % (PUNCH 1.1). The big hits are separate (IMPACTS), only on the three drops.
  const [iz, , ir] = impactAt(t);
  g.save(); const name = STORY[i][0], s = stateFor(i, t), c = CAMP[name] || {}, p = (1 + .012 * punchOf(name, s.lbar) * kickAt(t)) * breatheZoom(t) * (1 + iz);
  // r8d: c.out = [l0, l1] eases the shot's whole camera drift (pan, zoom, roll) back to the neutral frame before its cut
  // (review: at 131-132 s trance's 66 px pan and 5 % zoom put the moon somewhere else than bloom's sun)
  if (c){ const ko = c.out ? 1 - eio(span(s.lbar, c.out[0], c.out[1])) : 1, [sx, sy] = c.sh ? shakeXY(t, c.sh) : [0, 0], z = p * (1 + (c.zr || 0) * s.T * ko), r = ((c.rr || 0) * s.T + (c.rs || 0) * Math.sin(s.T * .35)) * ko * (c.rrOut ? 1 - eio(span(s.lbar, c.rrOut[0], c.rrOut[1])) : 1) + ir;
    g.translate(W / 2 + sx, H / 2 + sy); g.rotate(r); g.scale(z, z); g.translate(-W / 2 - (c.px || 0) * s.T * ko, -H / 2 - (c.py || 0) * s.T * ko); }
  else if (p !== 1){ g.translate(W / 2, H / 2); g.scale(p, p); g.translate(-W / 2, -H / 2); }
  SKYT = toneFor(name, s.lbar); SC_[name](g, s); SKYT = null; g.restore(); }
// transitions are motion wipes made of the key visual's own pieces
function cloudFront(u){ return lerp(W + 700, -700, eio(u)); }
const BANDS = [0, .14, .05, .18, .09];
const bandFront = (u, i) => lerp(-1500, 1500, eio(clamp((u - BANDS[i]) / .82)));
function maskPath(g, tr, u){
  g.beginPath();
  switch (tr.type){
    case 'iris': g.arc(W / 2, H / 2, eio(u) * 2300, 0, TAU); break;
    case 'cloud': g.rect(cloudFront(u), -100, W * 2, H + 200); break;
    case 'stripe': { g.save(); g.translate(W / 2, H / 2); g.rotate(.62); for (let i = 0; i < 5; i++){ const p = bandFront(u, i); g.rect(-2400, -1400 + i * 560, p + 2400, 562); } g.restore(); break; }
    case 'flash': case 'fade': g.rect(-W, -H, 3 * W, 3 * H); break;
  }
}
function decor(g, tr, u, t){
  switch (tr.type){
    case 'iris': { const r = eio(u) * 2300; ring(g, W / 2, H / 2, r, r + 60, K.ring); ring(g, W / 2, H / 2, r + 60, r + 90, K.white); break; }
    case 'cloud': { const x = cloudFront(u); rect(g, x - 260, -100, 520, H + 200, K.white);
      for (let i = 0; i < 5; i++){ const y = -100 + i * 290; sprite(g, SPR.cu[(i * 3) % 8], x - 300 - (i % 2) * 60, y, .85, Math.PI / 2); sprite(g, SPR.cu[(i * 3 + 1) % 8], x + 300 + (i % 2) * 60, y + 140, .85, -Math.PI / 2); }
      for (let i = 0; i < 6; i++) tri(g, x + (hash(i) - .5) * 900, H * hash(i + 3), 40 + 30 * hash(i + 5), u * 8 + i, u * 2 + i * .2, TRI_COLS[i % 6]); break; }
    case 'stripe': { g.save(); g.translate(W / 2, H / 2); g.rotate(.62);
      for (let i = 0; i < 5; i++){ const p = bandFront(u, i), y0 = -1400 + i * 560; if (p < -1450 || p > 1450) continue;
        g.save(); g.beginPath(); g.rect(p - 170, y0, 170, 562); g.clip(); stripes(g, 0, 0, -1.4, 34, u * 400 + i * 40); g.restore();
        rect(g, p - 200, y0, 26, 562, K.white); }
      g.restore(); break; }
    case 'flash': g.globalAlpha = Math.pow(1 - u, 5); rect(g, 0, 0, W, H, '#fffef2'); g.globalAlpha = 1; break;   // (re-audit, visual: still a grey wash) gone within ~1/3 beat   // r5: C2's white lasts longer; r16 audit (visual: the long linear fade washed the frame grey): cream, falling off fast
  }
}
let READY_SPR = false;
function renderAt(t){
  if (!READY_SPR){ buildSprites(); buildLibrary(); buildClouds(); READY_SPR = true; }
  t = clamp(t, 0, DUR);
  const bar = (t - T0) / BAR, i = sceneAt(bar);
  const tr = STORY[i][3], lb = (bar - STORY[i][1]) * 4;
  ctx.setTransform(SC, 0, 0, SC, 0, 0);
  if (i > 0 && tr && tr.type !== 'cut' && lb < tr.beats){
    const u = clamp(lb / tr.beats);
    if (tr.type === 'flash'){ drawScene(ctx, i, t); ctx.setTransform(SC, 0, 0, SC, 0, 0); decor(ctx, tr, u, t); return; }
    drawScene(ctx, i - 1, t);
    if (!BUF) BUF = makeBuf();
    const bg = BUF.getContext('2d'); bg.setTransform(SC, 0, 0, SC, 0, 0); drawScene(bg, i, t);
    ctx.save(); maskPath(ctx, tr, u); ctx.clip(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (tr.type === 'fade') ctx.globalAlpha = eio(u); ctx.drawImage(BUF, 0, 0); ctx.restore();
    ctx.setTransform(SC, 0, 0, SC, 0, 0); decor(ctx, tr, u, t);
  } else drawScene(ctx, i, t);
  breathe(ctx, t);
}
// v12: the picture holds its breath with the music (rhythm juror): bar 15 sub drop = a slight dim and pull-back,
// 111.60-112.28 low cut = the graphics recede behind a deep-blue veil, released on the new phrase
// r3: bar 15 is now a slight pull-back only (the navy dim turned the cream clouds grey; advocate)
function breatheZoom(t){ const b15 = eout(span(t, B(15), B(15) + BEAT * .5)) * (1 - eio(span(t, B(16) - BEAT * .5, B(16)))); return 1 - .035 * b15; }
function breathe(g, t){
  g.setTransform(SC, 0, 0, SC, 0, 0);
  const [, hf] = impactAt(t); if (hf > .004){ g.globalAlpha = hf; rect(g, 0, 0, W, H, '#fffef2'); g.globalAlpha = 1; }
  const lc = span(t, 111.60, 111.60 + BEAT / 8) * (1 - span(t, 112.28, 112.28 + BEAT / 4));
  if (lc > 0 && false){ g.globalAlpha = .78 * lc;   /* r7c: moved into trance, under the moon (the moon turned grey under it) */ rect(g, 0, 0, W, H, K.navy); g.globalAlpha = 1;
    // r6 (visual juror): hold the breath without a blackout: the rising moon's rim stays lit above the veil
    // r6b: dropped again (fresh eyes: it read as a lone ghost ring on navy) }
  }
}
window.renderAt = renderAt;
