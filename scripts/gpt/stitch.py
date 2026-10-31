"""크롬 zoom 캡처 타일을 이어 붙여 원본 그림을 복원한다.
python3 gpt_stitch.py 출력.jpg 원본W 원본H 타일H(css px) 뷰포트W(css px) 타일1.png 타일2.png ... [--width 1200]
"""
import sys
from PIL import Image
a=sys.argv[1:]; width=None
if '--width' in a: i=a.index('--width'); width=int(a[i+1]); del a[i:i+2]
out,W,H,T,VW=a[0],int(a[1]),int(a[2]),int(a[3]),int(a[4]); tiles=a[5:]
im0=Image.open(tiles[0]); s=im0.width/VW
CW,CH=round(W*s),round(H*s)
canvas=Image.new('RGB',(CW,CH),'white')
for k,p in enumerate(tiles):
    t=Image.open(p).convert('RGB'); top=round(k*T*s); h=min(round(T*s),CH-top)
    canvas.paste(t.crop((0,0,CW,h)),(0,top))
if width and CW>width: canvas=canvas.resize((width,round(CH*width/CW)),Image.LANCZOS)
canvas.save(out,quality=88); print(out,canvas.size,'scale',round(s,3))
