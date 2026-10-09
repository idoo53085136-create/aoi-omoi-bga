# minimal Standard MIDI File reader (no dependencies): notes(path) -> (ppq, tempos, [(start_beat, end_beat, pitch, vel, track, ch)])
# python tools/midi_read.py file.mid   prints a summary (tempo, note count, range, first notes, notes per bar)
import struct, sys


def _vlq(b, i):
    v = 0
    while True:
        c = b[i]; i += 1; v = (v << 7) | (c & 0x7f)
        if not c & 0x80: return v, i


def notes(path):
    b = open(path, 'rb').read()
    assert b[:4] == b'MThd'
    fmt, ntr, ppq = struct.unpack('>HHH', b[8:14]); i = 8 + struct.unpack('>I', b[4:8])[0]
    out, tempos = [], []
    for tr in range(ntr):
        assert b[i:i + 4] == b'MTrk', b[i:i + 4]
        ln = struct.unpack('>I', b[i + 4:i + 8])[0]; j, end = i + 8, i + 8 + ln; i = end
        tick, run, on = 0, None, {}
        while j < end:
            d, j = _vlq(b, j); tick += d
            st = b[j]
            if st == 0xff:
                typ = b[j + 1]; ln2, j = _vlq(b, j + 2)
                if typ == 0x51: tempos.append((tick, int.from_bytes(b[j:j + 3], 'big')))
                j += ln2; continue
            if st in (0xf0, 0xf7):
                ln2, j = _vlq(b, j + 1); j += ln2; continue
            if st & 0x80: run = st; j += 1
            hi, ch = run & 0xf0, run & 0x0f
            if hi in (0xc0, 0xd0): j += 1; continue
            d1, d2 = b[j], b[j + 1]; j += 2
            if hi == 0x90 and d2 > 0: on.setdefault((ch, d1), []).append((tick, d2))
            elif hi == 0x80 or (hi == 0x90 and d2 == 0):
                if on.get((ch, d1)):
                    t0, v = on[(ch, d1)].pop(0); out.append((t0 / ppq, tick / ppq, d1, v, tr, ch))
    out.sort()
    return ppq, tempos, out


if __name__ == '__main__':
    ppq, tempos, N = notes(sys.argv[1])
    print('ppq', ppq, 'tempos', [(t, round(60e6 / u, 3)) for t, u in tempos][:5], 'notes', len(N))
    if N:
        print('first beat %.3f last beat %.3f  pitch %d..%d  tracks %s' % (N[0][0], N[-1][1], min(n[2] for n in N), max(n[2] for n in N), sorted(set((n[4], n[5]) for n in N))))
        print('first 12:', [(round(n[0], 3), n[2]) for n in N[:12]])
        bars = {}
        for n in N: bars[int(n[0] // 4)] = bars.get(int(n[0] // 4), 0) + 1
        print('notes per bar:', bars)
