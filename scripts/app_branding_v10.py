from pathlib import Path
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]; AS=ROOT/'assets'; AS.mkdir(exist_ok=True)
BG=(6,16,27); GREEN=(97,230,168); BLUE=(126,176,255); INK=(245,248,252)
def icon(size):
    im=Image.new('RGB',(size,size),BG); d=ImageDraw.Draw(im)
    pad=size*.16; w=max(4,int(size*.055))
    d.rounded_rectangle((pad,pad,size-pad,size-pad),radius=int(size*.18),outline=BLUE,width=max(3,int(size*.018)))
    # decision/check glyph
    d.line([(size*.30,size*.53),(size*.45,size*.67),(size*.72,size*.34)],fill=GREEN,width=w,joint='curve')
    d.ellipse((size*.62,size*.22,size*.77,size*.37),fill=INK)
    return im
for s in (180,192,512): icon(s).save(AS/f'risolvi-icon-{s}.png',optimize=True)
(ROOT/'manifest.webmanifest').write_text('''{
  "name":"RISOLVI",
  "short_name":"RISOLVI",
  "start_url":"./",
  "scope":"./",
  "display":"standalone",
  "background_color":"#06101b",
  "theme_color":"#07101c",
  "icons":[
    {"src":"assets/risolvi-icon-192.png","sizes":"192x192","type":"image/png","purpose":"any maskable"},
    {"src":"assets/risolvi-icon-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}
  ]
}''',encoding='utf-8')
p=ROOT/'index.html'; s=p.read_text(encoding='utf-8')
links='''\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" type="image/png" sizes="192x192" href="assets/risolvi-icon-192.png">\n<link rel="apple-touch-icon" sizes="180x180" href="assets/risolvi-icon-180.png">\n<meta name="apple-mobile-web-app-title" content="RISOLVI">'''
if 'risolvi-icon-180.png' not in s:s=s.replace('</title>','</title>'+links,1)
old='<span class="brandmark">R</span>'
new='<img class="brandmark" src="assets/risolvi-icon-192.png" alt="" width="30" height="30" style="object-fit:cover;padding:0">'
if old in s:s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8'); print('RISOLVI branding ready')
