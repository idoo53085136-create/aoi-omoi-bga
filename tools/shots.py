"""Render frames from the local page (python -m http.server 8767 --directory build).

  python tools/shots.py OUTPREFIX t1 t2 ...         one PNG per time (1920 wide by default, --w to change)
  python tools/shots.py --sheet OUT.jpg --step 2      labelled contact sheet over the whole song (or --times ...)
Labels show m:ss.ss, bar number and scene name.
"""
import argparse, base64, json, sys, time
import cv2, numpy as np
from playwright.sync_api import sync_playwright

T0 = 0.16848072562358277; BAR = 240 / 175


def open_page(p, w, port=8767, pre=None, page='index.html'):
    b = p.chromium.launch(channel='chrome')
    pg = b.new_page(viewport={'width': w, 'height': w * 9 // 16}); pg.set_default_timeout(300000)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'favicon' not in m.location.get('url', '') else None)
    pg.goto(f'http://127.0.0.1:{port}/{page}?test=1&w={w}')
    try: pg.wait_for_function('window.READY === true', timeout=60000)
    except Exception: raise SystemExit('page never became READY; page errors: ' + ' | '.join(errs[:5]))
    e = pg.evaluate('window.ERR || ""')
    if e: print('PAGE ERROR', e[:2000])
    if pre: pg.evaluate('() => { ' + pre + '; }')   # debug / A-B prototypes: JS run once before rendering (e.g. override a scene)
    return b, pg, errs


def grab(pg, t, fmt='image/png', q=0.9):
    url = pg.evaluate(f"""async () => {{ if (window.prepare) await window.prepare({t}); renderAt({t});
        return document.getElementById('gl').toDataURL('{fmt}', {q}); }}""")
    return cv2.imdecode(np.frombuffer(base64.b64decode(url.split(',', 1)[1]), np.uint8), 1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('prefix', nargs='?')
    ap.add_argument('times', nargs='*', type=float)
    ap.add_argument('--w', type=int, default=1920)
    ap.add_argument('--sheet')
    ap.add_argument('--step', type=float, default=0)
    ap.add_argument('--cols', type=int, default=6)
    ap.add_argument('--pre', default=None, help='JS evaluated once before rendering (prototype overrides)')
    ap.add_argument('--port', type=int, default=8767, help='8767 = v12 build, 8768 = the handoff v11 build')
    ap.add_argument('--page', default='index.html', help='page under build/ (next.html = a work-in-progress build)')
    ap.add_argument('--times', dest='times_opt', nargs='+', type=float, default=None, help='sheet times (seconds)')
    a = ap.parse_args()
    if a.sheet and a.prefix is not None and not a.step:   # sheet mode: a leading positional number is a time, not a prefix
        try: a.times = [float(a.prefix)] + list(a.times); a.prefix = None
        except ValueError: pass
    if a.times_opt: a.times = list(a.times or []) + a.times_opt
    with sync_playwright() as p:
        if a.sheet:
            w = 480 if a.w == 1920 else a.w
            b, pg, errs = open_page(p, w, port=a.port, pre=a.pre, page=a.page)
            story = pg.evaluate('STORY.map(s => [s[0], s[1]])')
            ts = a.times or [round(1 + i * a.step, 2) for i in range(int(251 / a.step))]
            if a.prefix and not a.times:
                ts = [float(a.prefix)] + ts
            ims = []
            for t in ts:
                im = grab(pg, t, 'image/jpeg', .85)
                bar = (t - T0) / BAR; name = story[0][0]
                for n, b0 in story:
                    if bar >= b0: name = n
                lab = '%d:%05.2f b%.1f %s' % (int(t // 60), t % 60, bar, name)
                cv2.rectangle(im, (0, 0), (10 + 10 * len(lab), 24), (40, 30, 10), -1)
                cv2.putText(im, lab, (5, 17), 0, .5, (255, 255, 255), 1, cv2.LINE_AA)
                ims.append(im)
            b.close()
            per = a.cols * 8
            for k in range(0, len(ims), per):
                ch = ims[k:k + per]
                while len(ch) % a.cols: ch.append(np.zeros_like(ims[0]))
                fn = a.sheet.replace('.jpg', '_%02d.jpg' % (k // per))
                cv2.imencode('.jpg', np.vstack([np.hstack(ch[i:i + a.cols]) for i in range(0, len(ch), a.cols)]), [cv2.IMWRITE_JPEG_QUALITY, 82])[1].tofile(fn)
                print('wrote', fn)
        else:
            b, pg, errs = open_page(p, a.w, port=a.port, pre=a.pre, page=a.page)
            for t in a.times:
                t0 = time.time(); im = grab(pg, t)
                cv2.imencode('.png', im)[1].tofile(f'{a.prefix}_{t:07.2f}.png')
                print('t', t, 'ms', round((time.time() - t0) * 1000))
            b.close()
        if errs: print('errors:', errs[:6])


if __name__ == '__main__':
    main()


