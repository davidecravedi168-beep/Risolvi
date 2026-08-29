from pathlib import Path
import json,re

idx=Path('index.html')
s=idx.read_text(encoding='utf-8')
orig=s

s=s.replace('<title>RISOLVI V7 — Case Intelligence</title>','<title>RISOLVI V8 — Premium Case Intelligence</title>')
s=s.replace("const VERSION='7.0.0-case-intelligence';","const VERSION='8.0.0-premium-case-intelligence';")
s=s.replace('V7 Case Intelligence Beta','V8 Premium Case Intelligence')

if 'function getIntelligenceState()' not in s:
    anchor='  function init(){'
    if anchor not in s: raise SystemExit('missing init anchor')
    fn="""  function getIntelligenceState(){
    return {state:JSON.parse(JSON.stringify(state)),currentAnalysis:currentAnalysis?JSON.parse(JSON.stringify(currentAnalysis)):null,rulesUpdated:RULES_UPDATED};
  }

"""
    s=s.replace(anchor,fn+anchor,1)
if 'return {VERSION,getIntelligenceState,' not in s:
    anchor='  return {VERSION,'
    if anchor not in s: raise SystemExit('missing return API anchor')
    s=s.replace(anchor,'  return {VERSION,getIntelligenceState,',1)

css=Path('src/risolvi-case-ui.css').read_text(encoding='utf-8')
css_block='/* RISOLVI_CASE_UI_V8 */\n'+css+'\n'
if '/* RISOLVI_CASE_UI_V8 */' in s:
    s,n=re.subn(r'/\* RISOLVI_CASE_UI_V8 \*/\n.*?(?=</style>)',lambda m:css_block,s,count=1,flags=re.S)
    if n!=1: raise SystemExit('could not refresh V8 css block')
elif '/* RISOLVI_CASE_UI_V7 */' in s:
    s,n=re.subn(r'/\* RISOLVI_CASE_UI_V7 \*/\n.*?(?=</style>)',lambda m:css_block,s,count=1,flags=re.S)
    if n!=1: raise SystemExit('could not upgrade V7 css block')
else:
    pos=s.find('</style>')
    if pos<0: raise SystemExit('missing </style>')
    s=s[:pos]+'\n'+css_block+s[pos:]

core=Path('src/risolvi-case-core.js').read_text(encoding='utf-8')
layer=Path('src/risolvi-case-intelligence.js').read_text(encoding='utf-8')
core_block='<script id="risolvi-case-core-v8">\n'+core+'\n</script>'
layer_block='<script id="risolvi-case-intelligence-v8">\n'+layer+'\n</script>'
if re.search(r'<script id="risolvi-case-core-v[78]">.*?</script>',s,flags=re.S):
    s=re.sub(r'<script id="risolvi-case-core-v[78]">.*?</script>',lambda m:core_block,s,count=1,flags=re.S)
else:
    pos=s.rfind('</body>')
    if pos<0: raise SystemExit('missing </body>')
    s=s[:pos]+'\n'+core_block+'\n'+s[pos:]
if re.search(r'<script id="risolvi-case-intelligence-v[78]">.*?</script>',s,flags=re.S):
    s=re.sub(r'<script id="risolvi-case-intelligence-v[78]">.*?</script>',lambda m:layer_block,s,count=1,flags=re.S)
else:
    pos=s.rfind('</body>')
    if pos<0: raise SystemExit('missing </body>')
    s=s[:pos]+'\n'+layer_block+'\n'+s[pos:]

idx.write_text(s,encoding='utf-8')
for marker in ['8.0.0-premium-case-intelligence','getIntelligenceState','RISOLVI_CASE_UI_V8','risolvi-case-core-v8','risolvi-case-intelligence-v8','V8 PREMIUM']:
    if marker not in s: raise SystemExit(f'missing index marker: {marker}')

wp=Path('worker.js')
w=wp.read_text(encoding='utf-8')
w=re.sub(r"const API_VERSION = '[^']+';","const API_VERSION = '2026-08-29.1';",w,count=1)
replacement='const INDEX_HTML = '+json.dumps(s,ensure_ascii=False)+';\n'
w2,n=re.subn(r'const INDEX_HTML = .*?;\n',lambda m:replacement,w,count=1,flags=re.S)
if n!=1: raise SystemExit('could not sync INDEX_HTML into worker')
wp.write_text(w2,encoding='utf-8')
if 'RISOLVI_CASE_UI_V8' not in w2 or '8.0.0-premium-case-intelligence' not in w2 or 'V8 PREMIUM' not in w2:
    raise SystemExit('worker V8 sync contract failed')
print('RISOLVI V8 premium migration applied' if s!=orig else 'RISOLVI V8 already applied; worker resynced')
