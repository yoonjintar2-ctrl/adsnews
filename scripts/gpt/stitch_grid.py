"""좁은 창에서 가로·세로 타일로 캡처한 그림을 이어 붙인다.
python3 scripts/gpt/stitch_grid.py 출력.jpg W H VW "x,y:타일.png" "x,y:타일.png" … [--width 1400]
W·H = 화면에 띄운 그림 크기(css px), VW = 뷰포트 너비(css px), x,y = 그 타일을 찍을 때 그림을 민 거리(css px, __gptAt 반환값)
"""
import sys
from PIL import Image
a=sys.argv[1:]; width=None
if '--width' in a: i=a.index('--width'); width=int(a[i+1]); del a[i:i+2]
out,W,H,VW=a[0],int(a[1]),int(a[2]),int(a[3]); tiles=a[4:]
first=Image.open(tiles[0].split(':',1)[1]); s=first.width/VW
canvas=Image.new('RGB',(round(W*s),round(H*s)),'white')
for t in tiles:
    xy,p=t.split(':',1); x,y=[int(v) for v in xy.split(',')]
    im=Image.open(p).convert('RGB')
    w=min(im.width,round((W-x)*s)); h=min(im.height,round((H-y)*s))
    canvas.paste(im.crop((0,0,w,h)),(round(x*s),round(y*s)))
if width and canvas.width>width: canvas=canvas.resize((width,round(canvas.height*width/canvas.width)),Image.LANCZOS)
canvas.save(out,quality=90); print(out,canvas.size,'scale',round(s,3))
