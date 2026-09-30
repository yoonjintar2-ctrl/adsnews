"""Share pages for the 링크 복사 buttons, so a pasted link previews the content itself.

For every archived editorial (editorials.json) and featured campaign (featured.json) this writes
  s/ed-YYYY-MM-DD.html   + s/ed-YYYY-MM-DD.png  (1200x630 card: headline + 만평)
  s/camp-YYYY-MM-DD.html (preview image = the campaign's own photo)
Each page carries its own og:title / og:description / og:image for messenger previews
(KakaoTalk, Slack, etc.) and sends a human visitor on to the right spot of the paper
(index.html#ed-… / #camp-…). A page is rebuilt only when its content changes.
"""
import hashlib, html, json, os, re

SITE = "https://yoonjintar2-ctrl.github.io/adsnews/"
OUT = "s"
KEEP_DAYS = 60


def esc(x):
    return html.escape(str(x or ""), quote=True)


def clip(t, n):
    t = re.sub(r"\s+", " ", str(t or "")).strip()
    return t if len(t) <= n else t[: n - 1].rstrip() + "…"


def md(d):
    m = re.match(r"(\d{4})-(\d\d)-(\d\d)", d or "")
    return f"{int(m.group(2))}월 {int(m.group(3))}일" if m else ""


def safe_svg(v):
    v = v or ""
    if not v.startswith("<svg") or re.search(r"<script|\son\w+=|javascript:|<foreignObject", v, re.I):
        return ""
    return v


def page(key, title, desc, image, w, h, target, sig):
    url = SITE + f"{OUT}/{key}.html"
    return f"""<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="share-sig" content="{sig}">
<title>{esc(title)} · 광고늬우스</title>
<meta name="description" content="{esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="광고늬우스">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{esc(url)}">
<meta property="og:image" content="{esc(image)}">
{f'<meta property="og:image:width" content="{w}"><meta property="og:image:height" content="{h}">' if w else ''}
<meta property="og:locale" content="ko_KR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(desc)}">
<meta name="twitter:image" content="{esc(image)}">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<script>location.replace("../{target}")</script>
<style>body{{font-family:"Noto Serif KR",serif;background:#f1efe9;color:#1a1a1a;margin:0;display:grid;place-items:center;min-height:100vh;text-align:center;padding:24px}}a{{color:inherit}}</style>
</head><body><p><b>광고늬우스</b><br>{esc(title)}<br><br><a href="../{target}">기사 보러 가기 →</a></p></body></html>
"""


CARD = """<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&display=swap">
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#f1efe9;font-family:"Noto Serif KR","Noto Serif CJK KR",serif;color:#1a1a1a;overflow:hidden;position:relative;word-break:keep-all}
.p{position:absolute;inset:34px 44px;border-top:6px solid #1a1a1a;border-bottom:2px solid #1a1a1a}
.top{display:flex;justify-content:space-between;font-size:21px;font-weight:700;padding:10px 2px 8px;border-bottom:1px solid #1a1a1a}
.l{position:absolute;left:0;top:78px;width:520px;bottom:18px;display:flex;flex-direction:column}
.k{font-size:22px;font-weight:900;letter-spacing:1px;border-bottom:3px double #1a1a1a;padding-bottom:10px;margin-bottom:18px}
h1{font-size:50px;font-weight:900;line-height:1.28;letter-spacing:-1.5px}
.d{font-size:22px;line-height:1.55;color:#444;margin-top:18px}
.by{margin-top:auto;font-size:20px;font-weight:700}
.r{position:absolute;right:0;top:86px;width:540px}
.r svg{width:540px;height:auto;display:block;border:3px solid #1a1a1a;background:#f4f4f2}
.cap{font-size:19px;margin-top:10px;text-align:right;color:#333}
</style></head><body><div class="p">
<div class="top"><span>광고늬우스</span><span>__DATE__</span></div>
<div class="l"><div class="k">__KICK__</div><h1>__HEAD__</h1><p class="d">__LEDE__</p><div class="by">금로동 기자 · 발행인 SM C&amp;C 윤석진</div></div>
<div class="r">__SVG__<div class="cap">__CAP__</div></div>
</div></body></html>"""


CAMP = """<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&display=swap">
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#f1efe9;font-family:"Noto Serif KR","Noto Serif CJK KR",serif;color:#1a1a1a;overflow:hidden;position:relative;word-break:keep-all}
.p{position:absolute;inset:34px 44px;border-top:6px solid #1a1a1a;border-bottom:2px solid #1a1a1a}
.top{display:flex;justify-content:space-between;font-size:21px;font-weight:700;padding:10px 2px 8px;border-bottom:1px solid #1a1a1a}
.ph{position:absolute;left:0;top:78px;width:560px;height:420px;background:#2b2b2b;overflow:hidden;display:flex;align-items:flex-end}
.ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ph img+b{display:none}
.ph b{position:relative;color:#fff;font-size:30px;font-weight:900;padding:18px 22px}
.l{position:absolute;right:0;top:78px;width:520px;bottom:18px;display:flex;flex-direction:column}
.k{font-size:22px;font-weight:900;letter-spacing:1px;border-bottom:3px double #1a1a1a;padding-bottom:10px;margin-bottom:16px}
.b{font-size:24px;font-weight:900;color:#a01e1e;margin-bottom:6px}
h1{font-size:46px;font-weight:900;line-height:1.28;letter-spacing:-1.5px}
.d{font-size:21px;line-height:1.55;color:#444;margin-top:16px}
.by{margin-top:auto;font-size:20px;font-weight:700}
</style></head><body><div class="p">
<div class="top"><span>광고늬우스</span><span>__DATE__</span></div>
<div class="ph">__IMG__<b>__BRAND__</b></div>
<div class="l"><div class="k">오늘의 광고 캠페인</div><div class="b">__BRAND__</div><h1>__HEAD__</h1><p class="d">__LEDE__</p><div class="by">금로동 기자 · 발행인 SM C&amp;C 윤석진</div></div>
</div></body></html>"""


def render_cards(jobs):
    if not jobs:
        return
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = None
        for kw in ({"channel": "chrome"}, {}, {"executable_path": "/opt/pw-browsers/chromium"}):
            try:
                b = p.chromium.launch(**kw)
                break
            except Exception:
                continue
        if not b:
            raise RuntimeError("no browser")
        pg = b.new_page(viewport={"width": 1200, "height": 630})
        for card_html, out in jobs:
            try:
                pg.set_content(card_html, wait_until="load", timeout=30000)
            except Exception:
                pass
            pg.evaluate("[...document.images].forEach(i=>{if(!i.complete||!i.naturalWidth)i.remove()})")
            try:
                pg.evaluate("document.fonts.ready")
            except Exception:
                pass
            # 제목이 길면 글자를 줄여 박스 안에 맞춤
            pg.evaluate("""()=>{const h=document.querySelector('h1'),l=document.querySelector('.l');let s=parseFloat(getComputedStyle(h).fontSize);
              while(s>30&&l.scrollHeight>l.clientHeight+1){s-=2;h.style.fontSize=s+'px'}
              const d=document.querySelector('.d');while(d.textContent.length>20&&l.scrollHeight>l.clientHeight+1){d.textContent=d.textContent.replace(/\\s*\\S+…?$/,'…')}}""")
            pg.wait_for_timeout(150)
            pg.screenshot(path=out, type="png")
        b.close()


def old_sig(path):
    try:
        m = re.search(r'name="share-sig" content="([^"]+)"', open(path, encoding="utf-8").read())
        return m.group(1) if m else ""
    except Exception:
        return ""


def main():
    os.makedirs(OUT, exist_ok=True)
    try:
        eds = json.load(open("editorials.json", encoding="utf-8"))[:KEEP_DAYS]
    except Exception:
        eds = []
    try:
        feats = json.load(open("featured.json", encoding="utf-8"))[:KEEP_DAYS]
    except Exception:
        feats = []
    try:
        og = json.load(open("live.json", encoding="utf-8")).get("og") or {}
    except Exception:
        og = {}

    jobs, pages = [], []
    for e in eds:
        d = e.get("date")
        if not d or not e.get("headline"):
            continue
        key = f"ed-{d}"
        kick = "이번 주 광고계 결산" if e.get("weekly") else "오늘의 미니 사설"
        svg = safe_svg((e.get("cartoon") or {}).get("svg"))
        lede = clip(e.get("lede") or e.get("body"), 90)
        sig = hashlib.md5(json.dumps([e.get("headline"), lede, svg, kick, 2], ensure_ascii=False).encode()).hexdigest()[:12]
        hp = f"{OUT}/{key}.html"
        if old_sig(hp) == sig and os.path.exists(f"{OUT}/{key}.png"):
            continue
        card = (CARD.replace("__DATE__", esc(md(d)) + "자")
                .replace("__KICK__", esc(kick)).replace("__HEAD__", esc(e["headline"]))
                .replace("__LEDE__", esc(lede)).replace("__SVG__", svg)
                .replace("__CAP__", esc((e.get("cartoon") or {}).get("caption"))))
        jobs.append((card, f"{OUT}/{key}.png"))
        desc = f"[{kick} · {md(d)}] " + clip(e.get("lede") or e.get("body"), 110)
        pages.append((hp, page(key, e["headline"], desc, SITE + f"{OUT}/{key}.png?v={sig[:6]}", 1200, 630, f"#{key}", sig)))

    for f in feats:
        d, c = f.get("date"), f.get("main") or {}
        if not d or not c.get("title"):
            continue
        key = f"camp-{d}"
        img = c.get("photo") or (og.get(c.get("url")) or {}).get("i") or ""
        title = f"{c.get('brand', '')} 「{c.get('title')}」" if c.get("brand") else c.get("title")
        desc = f"[오늘의 광고 캠페인 · {md(d)}] " + clip(c.get("review") or c.get("story") or c.get("why"), 110)
        lede = clip(c.get("story") or c.get("why"), 90)
        sig = hashlib.md5(json.dumps([title, desc, img, lede, 3], ensure_ascii=False).encode()).hexdigest()[:12]
        hp = f"{OUT}/{key}.html"
        if old_sig(hp) == sig and os.path.exists(f"{OUT}/{key}.png"):
            continue
        im = f'<img src="{esc(img)}" referrerpolicy="no-referrer" alt="">' if img.startswith("http") else ""
        card = (CAMP.replace("__DATE__", esc(md(d)) + "자").replace("__IMG__", im)
                .replace("__BRAND__", esc(c.get("brand"))).replace("__HEAD__", esc(c.get("title")))
                .replace("__LEDE__", esc(lede)))
        jobs.append((card, f"{OUT}/{key}.png"))
        pages.append((hp, page(key, title, desc, SITE + f"{OUT}/{key}.png?v={sig[:6]}", 1200, 630, f"#{key}", sig)))

    try:
        render_cards(jobs)
    except Exception as ex:  # 카드 이미지를 못 만들면 사설 페이지는 다음 기회에
        print("card render failed:", ex)
        pages = []
    for path, body in pages:
        open(path, "w", encoding="utf-8").write(body)
    # 오래된 공유 페이지 정리
    keep = {f"ed-{e.get('date')}" for e in eds} | {f"camp-{f.get('date')}" for f in feats}
    for fn in os.listdir(OUT):
        if os.path.splitext(fn)[0] not in keep:
            os.remove(os.path.join(OUT, fn))
    print("share pages:", len(pages), "cards:", len(jobs))


if __name__ == "__main__":
    main()
