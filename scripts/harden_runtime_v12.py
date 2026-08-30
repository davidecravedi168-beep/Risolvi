from pathlib import Path
import json

INDEX=Path('index.html')
WORKER=Path('worker.js')
V9=Path('src/risolvi-operations-governance-v9.js')

BEGIN='<!-- RISOLVI_OPERATIONS_GOVERNANCE_V9_INLINE_BEGIN -->'
END='<!-- RISOLVI_OPERATIONS_GOVERNANCE_V9_INLINE_END -->'
EXTERNAL='<script src="src/risolvi-operations-governance-v9.js?v=9.0"></script>'

html=INDEX.read_text(encoding='utf-8')
v9=V9.read_text(encoding='utf-8').strip()
block=f'{BEGIN}\n<script id="risolvi-operations-governance-v9">\n{v9}\n</script>\n{END}'

if BEGIN in html:
    start=html.index(BEGIN)
    stop=html.index(END,start)+len(END)
    html=html[:start]+block+html[stop:]
elif EXTERNAL in html:
    html=html.replace(EXTERNAL,block,1)
else:
    raise SystemExit('V9 runtime hook not found')

# Keep the strict privacy CSP: runtime modules must be inline, not enabled by
# broadening script-src. This also prevents accidental CDN dependencies.
if "script-src 'unsafe-inline'" not in html:
    raise SystemExit('unexpected CSP: inline-only contract changed')
if EXTERNAL in html:
    raise SystemExit('external V9 script still present')

# App-shell version should describe the current product generation. Submodules
# retain their own independent versions (Case Intelligence V8, Governance V9).
html=html.replace('<title>RISOLVI V8 — Premium Case Intelligence</title>',
                  '<title>RISOLVI V11 — Resolution Command</title>')

INDEX.write_text(html,encoding='utf-8')

# Keep Cloudflare Worker shell byte-for-byte aligned with GitHub Pages shell.
worker=WORKER.read_text(encoding='utf-8')
prefix='const INDEX_HTML = '
pos=worker.find(prefix)
if pos<0:
    raise SystemExit('worker INDEX_HTML constant missing')
value_start=pos+len(prefix)
value,consumed=json.JSONDecoder().raw_decode(worker[value_start:])
if not isinstance(value,str):
    raise SystemExit('worker INDEX_HTML is not a JSON string literal')
encoded=json.dumps(html,ensure_ascii=False)
worker=worker[:value_start]+encoded+worker[value_start+consumed:]
WORKER.write_text(worker,encoding='utf-8')

check=WORKER.read_text(encoding='utf-8')
value2,_=json.JSONDecoder().raw_decode(check[check.index(prefix)+len(prefix):])
if value2!=html:
    raise SystemExit('worker/index shell parity failed')

print('RISOLVI V12 runtime hardening PASS')
