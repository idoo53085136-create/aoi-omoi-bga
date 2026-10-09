import os
# python tools/hw_onsets.py [z] [mingap] -> src/hw_onsets.json = [[t, p, strength], ...] for the highway (bars 96-106.6)
# r8 (review, twice: the piano blocks did not line up with the rhythm / melody; tools/note_sync.py showed the FLP notes
# hardly coincide with audible onsets in this section): the blocks now come from the AUDIO. Harmonic/percussive
# separation (median filters, Fitzgerald 2010) removes the drums; onsets of the harmonic part between 200 Hz and 4 kHz are
# peak-picked (z >= 1.0, >= 0.1 s apart); p = the log-frequency of the strongest harmonic peak at the onset, 0..1 over the
# section (the lane). Reads the WAV only.
import json, sys, wave, numpy as np
from scipy.ndimage import median_filter
T0 = 0.16848072562358277; BEAT = 60 / 175; BAR = 4 * BEAT
WAV = os.environ.get('AOI_WAV', 'AOI OMOI.wav')   # path to the song's WAV (not included in this repo)
Z = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0
GAP = float(sys.argv[2]) if len(sys.argv) > 2 else .1
b0, b1 = 96, 106.6
w = wave.open(WAV); sr = w.getframerate(); ch = w.getnchannels()
a0, a1 = int((T0 + b0 * BAR - 1) * sr), int((T0 + b1 * BAR + 1) * sr)
w.setpos(a0); raw = w.readframes(a1 - a0)
b = np.frombuffer(raw, np.uint8).reshape(-1, 3); x = (b[:, 0].astype(np.int32) | (b[:, 1].astype(np.int32) << 8) | (b[:, 2].astype(np.int32) << 16))
x = np.where(x >= 1 << 23, x - (1 << 24), x).astype(np.float32).reshape(-1, ch).mean(1)
hop, nf = 256, 4096
fr = np.lib.stride_tricks.sliding_window_view(x, nf)[::hop] * np.hanning(nf)
S = np.abs(np.fft.rfft(fr, axis=1)); f = np.fft.rfftfreq(nf, 1 / sr)
Hm = median_filter(S, size=(17, 1)); Pm = median_filter(S, size=(1, 17))
Hs = S * (Hm ** 2 / (Hm ** 2 + Pm ** 2 + 1e-9))   # soft harmonic mask
m = (f >= 200) & (f < 4000); Lg = np.log1p(Hs[:, m] * 10)
F = np.maximum(0, np.diff(Lg, axis=0)).sum(1); F = np.convolve(F, [.25, .5, .25], 'same'); F = (F - np.median(F)) / (F.std() + 1e-9)
tt = lambda i: a0 / sr + (i + 1) * hop / sr + nf / 2 / sr   # frame i of the diff -> centre time
pk = [i for i in range(1, len(F) - 1) if F[i] >= Z and F[i] >= F[i - 1] and F[i] > F[i + 1]]
out, last = [], -1e9
for i in sorted(pk, key=lambda i: -F[i]):
    t = tt(i)
    if not (T0 + b0 * BAR <= t < T0 + b1 * BAR): continue
    if any(abs(t - o[0]) < GAP for o in out): continue
    spec = Hs[i + 2][m]; fm = f[m][int(np.argmax(spec))]
    out.append([round(t, 4), float(np.log2(fm)), round(float(F[i]), 2)])
out.sort()
lo, hi = min(o[1] for o in out), max(o[1] for o in out)
for o in out: o[1] = round((o[1] - lo) / (hi - lo + 1e-9), 3)
print(len(out), 'onsets; per bar:', {bb: sum(1 for o in out if int((o[0] - T0) / BAR) == bb) for bb in range(96, 107)})
# phase check: where do the onsets sit relative to the 16th grid (ms)?
ph = [((o[0] - T0) / (BEAT / 4) - round((o[0] - T0) / (BEAT / 4))) * BEAT / 4 * 1000 for o in out]
print('offset from nearest 16th (ms): median %.0f, IQR %.0f..%.0f' % (np.median(ph), np.percentile(ph, 25), np.percentile(ph, 75)))
json.dump(out, open('src/hw_onsets.json', 'w'))
