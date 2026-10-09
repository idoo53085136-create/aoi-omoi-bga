
// ================================================================== clouds: flat key-visual clouds traced from real cloud photos
// Every slot that used a drawn cumulus sprite now gets its own cloud (no cloud appears twice in the song, except the
// key-visual "home" composition, which returns on purpose with a different set). Each photo cloud is fitted into the
// slot's original canvas box (bottom-aligned, centred) so every position, size and motion of v11 stays the same.
// CLOUD_SLOTS is filled from assets/clouds.json by build.py: { slotName: [assetId, boxW, boxH], ... }
const CLOUD_SLOTS = __CLOUD_SLOTS__;
const CLOUD = {};
function fitCloud(id, bw, bh, flip, wmax){
  const im = IMG[id]; if (!im || !im.width) return makeCanvas(bw, bh);
  const s = Math.min((wmax || bw) / im.width, bh / im.height), w = im.width * s, h = im.height * s;
  const c = makeCanvas(Math.max(bw, Math.ceil(w)), bh); bw = c.width;   // wmax lets a tall slot take a wider cloud
  const x = c.getContext('2d'); if (flip){ x.translate(bw, 0); x.scale(-1, 1); } x.drawImage(im, (bw - w) / 2, bh - h, w, h);
  return c;
}
// r3: a night version of a cloud (trance): its 4 flat tones are mapped onto the key visual's dark ladder steps, and the
// top edge (facing the moon) gets a thin ice-blue rim. Done once at load, so the cloud is still flat and graphic.
function nightCloud(c){
  const x = c.getContext('2d'), im = x.getImageData(0, 0, c.width, c.height), d = im.data, w = c.width;
  // r4 (fresh eyes): one flat silhouette colour with the key visual's scalloped edge and a thin rim; drawn at ~55 %
  const src = [[255, 253, 242], [196, 226, 250], [156, 196, 248], [108, 146, 234]], dst = [[7, 113, 228], [7, 113, 228], [7, 113, 228], [7, 113, 228]];
  const a = i => d[i * 4 + 3];
  for (let i = 0; i < d.length / 4; i++){ if (!a(i)) continue; let best = 0, bd = 1e9;
    for (let k = 0; k < 4; k++){ const e = (d[i * 4] - src[k][0]) ** 2 + (d[i * 4 + 1] - src[k][1]) ** 2 + (d[i * 4 + 2] - src[k][2]) ** 2; if (e < bd){ bd = e; best = k; } }
    const up = i - 3 * w; const rim = up < 0 || a(up) < 40;
    const c2 = rim ? [158, 233, 255] : dst[best]; d[i * 4] = c2[0]; d[i * 4 + 1] = c2[1]; d[i * 4 + 2] = c2[2]; }
  x.putImageData(im, 0, 0); return c;
}
function buildClouds(){ for (const [slot, [id, bw, bh, flip, wmax]] of Object.entries(CLOUD_SLOTS)){ CLOUD[slot] = fitCloud(id, bw, bh, !!flip, wmax); if (slot === 'night') nightCloud(CLOUD[slot]); } }
// draw a cloud slot like sprite(): centred at x, y, scale s (slot canvas pixels -> 1920 frame)
function cloudS(g, slot, x, y, s, rot = 0, flip = false){ const c = CLOUD[slot]; if (c) sprite(g, c, x, y, s, rot, flip); }
