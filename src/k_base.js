// ------------------------------------------------------------------ math / easing
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const fract = x => x - Math.floor(x);
const eio = u => { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
const eout = u => { u = clamp(u); return 1 - Math.pow(1 - u, 3); };
const eout5 = u => { u = clamp(u); return 1 - Math.pow(1 - u, 5); };
const ein = u => { u = clamp(u); return u * u * u; };
// r23b (jury: the cubic eio peaks at 3x the mean speed, as fast as eout; it only moves the fastest part into the middle):
// a sine in-out peaks at ~1.57x the mean speed, for things that must move SLOWLY (clouds)
const esin = u => (1 - Math.cos(Math.PI * clamp(u))) / 2;
// r26: sine ease-out: moves on the downbeat at once, but its peak (at the start) is only ~1.57x the mean (eout's is 3x)
const esout = u => Math.sin(Math.PI / 2 * clamp(u));
const eback = u => { u = clamp(u); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
const esine = u => .5 - .5 * Math.cos(Math.PI * clamp(u));
const span = (x, a, b) => clamp((x - a) / (b - a));
const TAU = Math.PI * 2;
function hash(n){ n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// stop-motion stepping: advances one unit per step, easing over the first k of each step
const stepEase = (x, k = .4, e = eout) => Math.floor(x) + e(clamp(fract(x) / k));
// beat-decay pulse (1 on the beat, decays)
const pulse = (x, k = 6) => Math.exp(-fract(x) * k);

// ------------------------------------------------------------------ music data
function b64bytes(s){ const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
let KICK = null; try { if (KICK_B64.length > 100) KICK = b64bytes(KICK_B64); } catch (e) {}
const kickAt = t => { if (!KICK) return 0; const i = Math.round(t * 60); return i >= 0 && i < KICK.length ? KICK[i] / 255 : 0; };
const envOf = s => { try { return s.length > 100 ? b64bytes(s) : null; } catch (e) { return null; } };
const SNARE = envOf(SNARE_B64), HAT = envOf(HAT_B64), LOUD = envOf(LOUD_B64);
const envAt = (E, t) => { if (!E) return 0; const i = Math.round(t * 60); return i >= 0 && i < E.length ? E[i] / 255 : 0; };
const snareAt = t => envAt(SNARE, t), hatAt = t => envAt(HAT, t), loudAt = t => envAt(LOUD, t);
const SPEC = envOf(SPEC_B64), SPEC_F0 = SPEC ? SPEC[0] | (SPEC[1] << 8) : 0, SPEC_N = SPEC ? SPEC[2] | (SPEC[3] << 8) : 0;
// band 0..31 at time t, 0..1 (0 outside the analysed span)
const specAt = (t, b) => { if (!SPEC) return 0; const i = Math.round(t * 60) - SPEC_F0; return i >= 0 && i < SPEC_N ? SPEC[4 + i * 32 + b] / 255 : 0; };
const NOTE = []; for (let i = 0; i < NOTES.length; i += 4) NOTE.push({ t0: T0 + NOTES[i] * BEAT, t1: T0 + NOTES[i + 1] * BEAT, p: NOTES[i + 2], tr: NOTES[i + 3], i: i / 4 });
NOTE.sort((a, b) => a.t0 - b.t0);
function notesIn(a, b){ const o = []; let lo = 0, hi = NOTE.length; while (lo < hi){ const m = (lo + hi) >> 1; if (NOTE[m].t0 < a) lo = m + 1; else hi = m; } for (let i = lo; i < NOTE.length && NOTE[i].t0 < b; i++) o.push(NOTE[i]); return o; }

// ------------------------------------------------------------------ canvas
const cv = document.getElementById('gl'); cv.width = CW; cv.height = CH;
const ctx = cv.getContext('2d', { alpha: false });
let SC = CW / W;
function setRes(w){ CW = w; CH = Math.round(w * 9 / 16); cv.width = CW; cv.height = CH; SC = CW / W; BUF = null; }
let BUF = null;                        // offscreen buffer for transitions
function makeBuf(){ const c = document.createElement('canvas'); c.width = CW; c.height = CH; return c; }

