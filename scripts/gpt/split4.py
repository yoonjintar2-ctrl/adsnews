"""2×2 네 컷 그림을 네 장으로 자른다(가운데 여백·테두리 자동 정리).
python3 scripts/gpt/split4.py 네컷.jpg 출력폴더 접두어   →  접두어-1.jpg … 접두어-4.jpg
"""
import sys, os
from PIL import Image, ImageChops, ImageOps
src, outd, pre = sys.argv[1:4]; os.makedirs(outd, exist_ok=True)
im = Image.open(src).convert('RGB'); W, H = im.size
def trim(c):
    g = ImageOps.grayscale(c); bg = Image.new('L', g.size, 255)
    box = ImageChops.difference(g, bg).point(lambda v: 255 if v > 28 else 0).getbbox()
    c = c.crop(box) if box else c
    w, h = c.size; m = max(2, round(min(w, h) * 0.012))
    return c.crop((m, m, w - m, h - m))
for k, (x, y) in enumerate([(0, 0), (1, 0), (0, 1), (1, 1)], 1):
    c = trim(im.crop((x * W // 2, y * H // 2, (x + 1) * W // 2, (y + 1) * H // 2)))
    p = os.path.join(outd, f'{pre}-{k}.jpg'); c.save(p, quality=90); print(p, c.size)
