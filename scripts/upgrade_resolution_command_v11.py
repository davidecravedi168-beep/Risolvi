from pathlib import Path
import json

INDEX=Path('index.html')
WORKER=Path('worker.js')
SRC=Path('src/risolvi-resolution-command-v11.js')
BEGIN='<!-- RISOLVI_RESOLUTION_COMMAND_V11_BEGIN -->'
END='<!-- RISOLVI_RESOLUTION_COMMAND_V11_END -->'

html=INDEX.read_text(encoding='utf-8')
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

# RISOLVI's CSP is intentionally inline-only. Keep the V11 runtime inline so the
# privacy posture does not require a broader script-src policy.
if "script-src 'unsafe-inline'" not in html:
    raise SystemExit('unexpected CSP: inline runtime contract changed')
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

# Strong shell parity: the Worker must serve exactly the same UI shell as index.
check=WORKER.read_text(encoding='utf-8')
value2,_=json.JSONDecoder().raw_decode(check[check.index(prefix)+len(prefix):])
if value2!=html:
    raise SystemExit('worker/index shell parity failed')
print('RISOLVI V11 shell + Worker parity PASS')