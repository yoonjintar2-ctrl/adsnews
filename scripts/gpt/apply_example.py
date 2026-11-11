import json,sys,shutil,os
from PIL import Image
S=os.path.dirname(os.path.abspath(__file__)); D='2026-11-12'; M='ChatGPT 이미지 생성 — 그림 도안나 대리'
def put(src,dst,w):
    im=Image.open(os.path.join(S,src)).convert('RGB')
    if im.width>w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
    im.save(dst,quality=88)
def load(f): return json.load(open(f,encoding='utf-8'))
def save(f,o): json.dump(o,open(f,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
what=sys.argv[1:]
j=load('jipiltae.json'); g=load('gemini.json'); k=load('grok.json')
if 'cartoon' in what:
    put('cartoon.jpg',f'img/jp/cartoon-{D}.jpg',1400); c=j['cartoon']; c['img']=f'img/jp/cartoon-{D}.jpg?v=gpt'; c['model']=M
    c['alt']='밤 골목 꽃게 식당 앞에서 앞치마 두른 사장님이 꽃게 그림이 찍힌 전용 봉투를 건네고, 작업복에 두꺼운 장갑을 낀 환경미화원이 손잡이로 받아 드는 펜화'
if 'strip' in what:
    for i,p in enumerate(k['strip']['panels'],1):
        put(f'strip-{i}.jpg',f'img/gk/strip-{D}-{i}.jpg',900); p['img']=f'img/gk/strip-{D}-{i}.jpg?v=gpt'
    k['strip']['model']=M
if 'jped' in what:
    put('jped.jpg',f'img/jp/edcartoon-{D}.jpg',1400); c=j['editorial']['cartoon']; c['img']=f'img/jp/edcartoon-{D}.jpg?v=gpt'; j['editorial']['model']=M
if 'gmed' in what:
    put('gmed.jpg',f'img/gm/edcartoon-{D}.jpg',1400); c=g['editorial']['cartoon']; c['img']=f'img/gm/edcartoon-{D}.jpg?v=gpt'; c['model']=M
if 'person' in what:
    put('person.jpg',f'img/jp/person-{D}.jpg',1000); j['person']['img']=f'img/jp/person-{D}.jpg?v=gpt'; j['person']['model']=M
if 'trend' in what:
    put('trend.jpg',f'img/jp/trend-{D}.jpg',1400); j['trend']['img']=f'img/jp/trend-{D}.jpg?v=gpt'; j['trend']['model']=M
if 'trendart' in what:
    put('trendart.jpg',f'img/jp/trendart-{D}.jpg',1400); j['trendArt']['img']=f'img/jp/trendart-{D}.jpg?v=gpt'; j['trendArt']['model']=M
save('jipiltae.json',j); save('gemini.json',g); save('grok.json',k); print('applied',what)
