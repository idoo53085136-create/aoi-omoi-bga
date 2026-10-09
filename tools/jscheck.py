# python tools/jscheck.py -> loads build/index.html from the local server and prints any page / console errors and
# whether READY came up (r8: mid-line // comments swallowed code twice; run this after every build)
import sys
from playwright.sync_api import sync_playwright
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome'); pg = b.new_page(viewport={"width": 480, "height": 270})
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: errs.append('console.' + m.type + ': ' + m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
    pg.on('response', lambda r: errs.append('HTTP %d %s' % (r.status, r.url)) if r.status >= 400 and 'favicon' not in r.url else None)
    pg.goto('http://127.0.0.1:8767/index.html?test=1&w=480')
    try:
        pg.wait_for_function('window.READY === true', timeout=15000); ok = True
        miss = pg.evaluate('window.MISSING || []')
        if miss: errs.append('missing images: %s' % miss)
        for t in (40, 95, 135, 165, 200, 240): pg.evaluate(f'renderAt({t})')
    except Exception as e:
        ok = False; errs.append(str(e).splitlines()[0])
    b.close()
print('READY' if ok else 'NOT READY'); [print(e) for e in errs]
sys.exit(0 if ok and not errs else 1)
