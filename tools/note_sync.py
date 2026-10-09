import os
# python tools/note_sync.py bar0 bar1 -> for each note track in [bar0, bar1): how well its onsets line up with the audio
# (mean spectral-flux onset strength at note time + offset, offsets -120..+120 ms), so we can see which track is audible
# and whether the note data is early / late. Reads the WAV only (no changes).
import json, sys, wave, numpy as np
T0 = 0.16848072562358277; BEAT = 60 / 175; BAR = 4 * BEAT
WAV = os.environ.get('AOI_WAV', 'AOI OMOI.wav')   # path to the song's WAV (not included in this repo)
b0, b1 = float(sys.argv[1]), float(sys.argv[2])
w = wave.open(WAV); sr = w.getframerate(); n = w.getnframes(); ch = w.getnchannels(); sw = w.getsampwidth()
a0, a1 = int((T0 + b0 * BAR - 1) * sr), int((T0 + b1 * BAR + 1) * sr)
w.setpos(max(0, a0)); raw = w.readframes(a1 - a0)
if sw == 3:
    b = np.frombuffer(raw, np.uint8).reshape(-1, 3); x = (b[:, 0].astype(np.int32) | (b[:, 1].astype(np.int32) << 8) | (b[:, 2].astype(np.int32) << 16)); x = np.where(x >= 1 << 23, x - (1 << 24), x).astype(np.float32)
else: x = np.frombuffer(raw, dtype={2: np.int16, 4: np.int32}[sw]).astype(np.float32)
x = x.reshape(-1, ch).mean(1)
hop, nf = 256, 2048
fr = np.lib.stride_tricks.sliding_window_view(x, nf)[::hop] * np.hanning(nf)
S = np.abs(np.fft.rfft(fr, axis=1)); f = np.fft.rfftfreq(nf, 1 / sr)
def flux(lo, hi):
    m = (f >= lo) & (f < hi); L = np.log1p(S[:, m] * 10); d = np.maximum(0, np.diff(L, axis=0)).sum(1); return (d - d.mean()) / (d.std() + 1e-9)
bands = {'low 40-200': flux(40, 200), 'mid 200-2k': flux(200, 2000), 'high 2k-8k': flux(2000, 8000)}
tf = lambda t: int(((t - (a0 / sr)) * sr) / hop)
d = json.load(open('src/notes_flp.json'))
N = [(T0 + d[i] * BEAT, d[i + 2], d[i + 3]) for i in range(0, len(d), 4)]
N = [q for q in N if T0 + b0 * BAR <= q[0] < T0 + b1 * BAR]
for tr in sorted(set(q[2] for q in N)):
    ts = sorted(set(round(q[0], 3) for q in N if q[2] == tr))
    print('track', tr, len(ts), 'onsets; pitch', round(min(q[1] for q in N if q[2] == tr), 2), '-', round(max(q[1] for q in N if q[2] == tr), 2))
    for name, F in bands.items():
        row = []
        for off in range(-120, 121, 20):
            v = [F[tf(t + off / 1000)] for t in ts if 0 <= tf(t + off / 1000) < len(F)]
            row.append('%+4d:%5.2f' % (off, np.mean(v)))
        print('   ', name.ljust(11), ' '.join(row))
# random baseline: on-grid 16ths
g16 = [T0 + (b0 * 4 + k / 4) * BEAT for k in range(int((b1 - b0) * 16))]
S16 = BEAT / 4
for tr in sorted(set(q[2] for q in N)):
    ts = sorted(set(round(q[0], 3) for q in N if q[2] == tr))
    print('track', tr, 'shift in 16ths (phase -30 ms), mid / high:', ' '.join('%+d:%.2f/%.2f' % (k, np.mean([bands['mid 200-2k'][tf(t + k * S16 - .03)] for t in ts if 0 <= tf(t + k * S16 - .03) < len(F)]), np.mean([bands['high 2k-8k'][tf(t + k * S16 - .03)] for t in ts if 0 <= tf(t + k * S16 - .03) < len(F)])) for k in range(-4, 5)))
g4 = [T0 + (b0 * 4 + k) * BEAT for k in range(int((b1 - b0) * 4))]
for nm, G in (('16th grid', g16), ('beat grid', g4)):
    for k, F in bands.items():
        print(nm, k.ljust(11), ' '.join('%+4d:%5.2f' % (off, np.mean([F[tf(t + off / 1000)] for t in G if 0 <= tf(t + off / 1000) < len(F)])) for off in range(-120, 121, 10)))
