from pathlib import Path
import json

INDEX=Path('index.html')
WORKER=Path('worker.js')
CORE=Path('src/risolvi-case-core.js')
SRC=Path('src/risolvi-resolution-command-v11.js')
BEGIN='<!-- RISOLVI_RESOLUTION_COMMAND_V11_BEGIN -->'
END='<!-- RISOLVI_RESOLUTION_COMMAND_V11_END -->'
CORE_OPEN='<script id="risolvi-case-core-v8">'
CORE_CLOSE='</script>'

html=INDEX.read_text(encoding='utf-8')

# Keep the case engine inline and in sync with src. This app intentionally uses
# an inline-only CSP, so source updates must be reflected into the public shell.
core_js=CORE.read_text(encoding='utf-8').strip()
core_start=html.find(CORE_OPEN)
if core_start<0:
    raise SystemExit('index.html missing risolvi-case-core-v8 block')
core_body=core_start+len(CORE_OPEN)
core_stop=html.find(CORE_CLOSE,core_body)
if core_stop<0:
    raise SystemExit('index.html case core closing script missing')
html=html[:core_body]+'\n'+core_js+'\n'+html[core_stop:]

js=SRC.read_text(encoding='utf-8').strip()
block=f"{BEGIN}\n<script id=\"risolvi-resolution-command-v11\">\n{js}\n</script>\n{END}"

if BEGIN in html:
    start=html.index(BEGIN)
    stop=html.index(END,start)+len(END)
    html=html[:start]+block+html[stop:]
else:
    if '</body>' not in html:
        raise SystemExit('index.html missing </body>')
    html=html.replace('</body>',block+'\n</body>',1)

if "script-src 'unsafe-inline'" not in html:
    raise SystemExit('unexpected CSP: inline runtime contract changed')
if 'tacticsFor' not in html:
    raise SystemExit('professional tactics missing from public case core')
INDEX.write_text(html,encoding='utf-8')

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
print('RISOLVI V11 case core + Resolution Command + Worker parity PASS')