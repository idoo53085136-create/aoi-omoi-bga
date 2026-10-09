"""Per-frame spectrum for the highway skyline (r7, jury-approved; read-only analysis, the audio is never changed).

  python tools/spectrum_aoi.py "path/to/AOI OMOI.wav"

Writes src/spec_u8.bin: header = 2 x uint16 (first 60 fps frame, number of frames), then frames x 32 bands uint8.
32 log-spaced bands 60 Hz - 12 kHz over bars 95.5-122.5 (the highway; r8 also the rings' 3D spectrum 118-122), dB-scaled to 0..255; attack 1 frame,
release ~7 frames (exponential), then a 3-tap smoothing across neighbouring bands (rhythm / visual jurors r7).
"""
import os, sys
import numpy as np
from scipy.io import wavfile

T0, BAR, FPS, NB = 0.16848072562358277, 240 / 175, 60, 32


def main():
    sr, x = wavfile.read(sys.argv[1])
    x = x.astype(np.float32); x = x.mean(1) if x.ndim > 1 else x
    x /= max(1.0, np.abs(x).max())
    f0, f1 = int((T0 + 26 * BAR) * FPS), int((T0 + 122.5 * BAR) * FPS)   # r11: from 26 (voyage's ring spectrum 31-40)
    k0 = int((T0 + 95.5 * BAR) * FPS) - f0   # (the levels are still normalised on 95.5-122.5 only, so that part is unchanged)
    n = 4096; win = np.hanning(n).astype(np.float32); freqs = np.fft.rfftfreq(n, 1 / sr)
    edges = np.geomspace(60, 12000, NB + 1)
    idx = [(np.searchsorted(freqs, edges[i]), max(np.searchsorted(freqs, edges[i + 1]), np.searchsorted(freqs, edges[i]) + 1)) for i in range(NB)]
    S = np.zeros((f1 - f0, NB), np.float32)
    for k, f in enumerate(range(f0, f1)):
        c = int(f / FPS * sr); seg = x[max(0, c - n // 2): c + n // 2]
        if len(seg) < n: seg = np.pad(seg, (0, n - len(seg)))
        m = np.abs(np.fft.rfft(seg * win))
        S[k] = [m[a:b].mean() for a, b in idx]
    D = 20 * np.log10(S + 1e-6); lo, hi = np.percentile(D[k0:], 5), np.percentile(D[k0:], 99.5)
    V = np.clip((D - lo) / (hi - lo), 0, 1)
    out = np.zeros_like(V); rel = np.exp(-1 / 7)
    for k in range(len(V)):
        prev = out[k - 1] if k else V[0]
        out[k] = np.where(V[k] > prev, V[k], prev * rel + V[k] * (1 - rel))
    out = (np.roll(out, 1, 1) * .25 + out * .5 + np.roll(out, -1, 1) * .25); out[:, 0] = out[:, 0] * 1.0
    b = (np.clip(out, 0, 1) * 255 + .5).astype(np.uint8)
    p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'spec_u8.bin')
    with open(p, 'wb') as fh:
        fh.write(np.array([f0, f1 - f0], np.uint16).tobytes()); fh.write(b.tobytes())
    print('frames', f1 - f0, 'from', f0, 'bytes', b.nbytes)


if __name__ == '__main__':
    main()
