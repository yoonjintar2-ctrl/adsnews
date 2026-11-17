#!/usr/bin/env python3
"""3D 삽화 다양성 검사 (발행인 11/17: "삽화 재활용 하지 마라. 같은 것도 다르게 그려야 할 마당에 뉴스가 매일 비슷한 것을 보여주면 되겠냐")

사용:  python3 scripts/m3d/variety.py 2026-11-18            # 그날 장면들 검사 (실패하면 종료코드 1)
       python3 scripts/m3d/variety.py 2026-11-18 --sheet    # + 최근 7일 포스터와 오늘 정지 컷을 한 장으로 → /tmp/m3d-variety.jpg (Read로 직접 비교)

장면 파일마다 맨 위에 meta를 반드시 쓴다:
  export const meta = {
    place: '골목 포장마차',            // 구체적인 장소(한 덩어리 말). '사무실'·'광장'처럼 뭉뚱그리지 않는다
    where: 'outdoor',                // indoor | outdoor
    time: 'night',                   // day | sunset | night | dawn | overcast
    camera: 'low',                   // wide | high | low | close | ots | side | top | dutch
    floor: 'asphalt',                // floor()/room() 바닥 스타일
    figures: 'two-facing',           // 인물 배치: solo-front, solo-side, two-facing, two-back, crowd, hands-only, none ...
    motion: ['rain', 'umbrella-tilt', 'steam'],   // 움직이는 것들
  };
규칙(어기면 실패):
 1. meta가 없거나 칸이 빠진 장면
 2. 같은 날 장면끼리 place가 같거나 camera가 같다(카메라는 날마다 최소 4종류)
 3. 최근 7일에 쓴 place를 또 쓴다
 4. 같은 날 outdoor 2개 미만, day가 아닌 시간대(sunset·night·dawn·overcast) 1개 미만
 5. 같은 날 figures 'two-back'(뒷모습 둘) 1개 넘게, 최근 7일 'two-back' 3개 넘게
 6. 최근 7일 안에 lanternString(줄 등)·building(창문 빌딩)·옛 ground() 타일 바닥·천장 매달린 등을 2번 넘게
 7. 같은 날 motion 겹침이 장면 쌍마다 절반 이상
"""
import re, sys, glob, os, json, datetime, subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))
SC = os.path.join(ROOT, 'scenes')
REQ = ['place', 'where', 'time', 'camera', 'figures', 'motion']
STOCK = {'lanternString': r'K\.lanternString\(', 'building': r'K\.building\(', 'tile-ground': r'K\.ground\(', 'hanging-lamp': r'(?i)(pendant|hanging|lampCord|ceilingLamp|매달린|const lamp\b|K\.line\(\[\[0,\s*0,\s*0\],\s*\[0,\s*-)'}


def meta_of(path):
    s = open(path, encoding='utf-8').read()
    m = re.search(r'export\s+const\s+meta\s*=\s*(\{.*?\});', s, re.S)
    if not m:
        return None, s
    js = m.group(1)
    try:
        out = subprocess.run(['node', '-e', f'console.log(JSON.stringify({js}))'], capture_output=True, text=True, timeout=10)
        return json.loads(out.stdout), s
    except Exception:
        return {}, s


def scenes_of(day):
    return sorted(p for p in glob.glob(os.path.join(SC, f'{day}-*.js')) if 'strip' not in os.path.basename(p))


def main():
    day = sys.argv[1]
    d0 = datetime.date.fromisoformat(day)
    past_days = [(d0 - datetime.timedelta(days=i)).isoformat() for i in range(1, 8)]
    today = scenes_of(day)
    errs = []
    if not today:
        print('오늘 장면 파일이 없습니다:', day); sys.exit(1)
    T = []
    for p in today:
        m, src = meta_of(p)
        n = os.path.basename(p)
        if not m:
            errs.append(f'{n}: meta 없음'); continue
        miss = [k for k in REQ if not m.get(k)]
        if miss:
            errs.append(f'{n}: meta 빠짐 {miss}')
        T.append((n, m, src))
    P = []
    for d in past_days:
        for p in scenes_of(d):
            m, src = meta_of(p)
            P.append((os.path.basename(p), m or {}, src))
    # 2. 같은 날 place·camera
    for key in ['place', 'camera']:
        seen = {}
        for n, m, _ in T:
            v = (m.get(key) or '').strip()
            if v and v in seen:
                errs.append(f'같은 날 {key} 겹침: {seen[v]} · {n} → "{v}"')
            seen[v] = n
    if len({m.get('camera') for _, m, _ in T}) < min(4, len(T)):
        errs.append(f'카메라 구도가 {len({m.get("camera") for _, m, _ in T})}종류뿐 — 하루 최소 4종류(wide/high/low/close/ots/side/top/dutch)')
    # 3. 최근 7일 place
    past_places = {(m.get('place') or '').strip(): n for n, m, _ in P if m.get('place')}
    for n, m, _ in T:
        v = (m.get('place') or '').strip()
        if v in past_places:
            errs.append(f'{n}: place "{v}"를 최근 7일({past_places[v]})에 이미 씀')
    # 4. 야외·시간대
    if len(T) >= 3:
        if sum(1 for _, m, _ in T if m.get('where') == 'outdoor') < 2:
            errs.append('야외(outdoor) 장면이 2개 미만')
        if sum(1 for _, m, _ in T if m.get('time') not in (None, '', 'day')) < 1:
            errs.append('낮이 아닌 시간대(sunset·night·dawn·overcast) 장면이 하나도 없음')
    # 5. 뒷모습 둘
    tb = [n for n, m, _ in T if m.get('figures') == 'two-back']
    if len(tb) > 1:
        errs.append(f"'뒷모습 둘(two-back)' 구도가 오늘 {len(tb)}개: {tb}")
    ptb = sum(1 for _, m, s in P if m.get('figures') == 'two-back')
    if ptb + len(tb) > 3:
        errs.append(f"최근 7일 '뒷모습 둘' 구도가 {ptb + len(tb)}개(3개까지)")
    # 6. 상투 소품
    for k, rx in STOCK.items():
        used_past = sum(1 for _, _, s in P if re.search(rx, s))
        used_now = [n for n, _, s in T if re.search(rx, s)]
        if used_now and used_past + len(used_now) > 2:
            errs.append(f'상투 소품 {k}: 최근 7일 {used_past}번 + 오늘 {used_now} → 빼고 다른 것으로')
    # 7. motion 겹침
    for i in range(len(T)):
        for j in range(i + 1, len(T)):
            a, b = set(T[i][1].get('motion') or []), set(T[j][1].get('motion') or [])
            if a and b and len(a & b) * 2 >= min(len(a), len(b)):
                errs.append(f'움직임 겹침 {T[i][0]} · {T[j][0]}: {sorted(a & b)}')
    if '--sheet' in sys.argv:
        sheet(day, past_days)
    if errs:
        print('다양성 검사 실패 — 장면을 고친 뒤 다시 돌리세요:'); [print(' -', e) for e in errs]; sys.exit(1)
    print(f'다양성 검사 통과: {len(T)}개 장면 ·', ', '.join(f"{m.get('place')}/{m.get('camera')}/{m.get('time')}" for _, m, _ in T))


def sheet(day, past_days):
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print('PIL 없음 — 시트 생략'); return
    repo = os.path.dirname(os.path.dirname(ROOT))
    rows = []
    for d in [day] + past_days[:6]:
        fs = [f for f in sorted(glob.glob(os.path.join(repo, 'img', '*', f'*{d}*-3d.jpg'))) if 'strip' not in f]
        if d == day:
            fs += sorted(glob.glob('/tmp/m3d-still-*.jpg'))
        if fs:
            rows.append((d, fs[:8]))
    W, H = 240, 160
    c = Image.new('RGB', (W * 8 + 90, len(rows) * (H + 6)), 'white'); dr = ImageDraw.Draw(c)
    for r, (d, fs) in enumerate(rows):
        dr.text((4, r * (H + 6) + 70), d[5:], fill='black')
        for i, f in enumerate(fs):
            try:
                c.paste(Image.open(f).convert('RGB').resize((W, H)), (90 + i * W, r * (H + 6)))
            except Exception:
                pass
    c.save('/tmp/m3d-variety.jpg', quality=82); print('비교 시트: /tmp/m3d-variety.jpg (맨 윗줄이 오늘) — Read로 보고 지난 날과 닮은 장면이 있으면 다시 그린다')


if __name__ == '__main__':
    main()
