# python tools/tsheet.py out cols rows sec1 sec2 ... -> jsheet.py with STORY parsed from src/k_story.js (times in seconds)
import json, os, re, subprocess, sys
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = open(os.path.join(D, 'src', 'k_story.js'), encoding='utf-8').read()
story = [[a, float(b)] for a, b in re.findall(r"\['(\w+)',\s*([\d.]+)", s)]
subprocess.run([sys.executable, os.path.join(D, 'tools', 'jsheet.py')] + sys.argv[1:], env=dict(os.environ, STORY=json.dumps(story)), check=True)
