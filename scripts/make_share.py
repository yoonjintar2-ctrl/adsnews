"""Share pages for the 링크 복사 buttons, so a pasted link previews the content itself.

For every archived editorial (editorials.json) and featured campaign (featured.json) this writes
  s/ed-YYYY-MM-DD.html   + s/ed-YYYY-MM-DD.png  (1200x630 card: headline + 만평)
  s/camp-YYYY-MM-DD.html (preview image = the campaign's own photo)
  s/person-YYYY-MM-DD.html, s/tn-YYYY-MM-DD-N.html (+ .png: 오늘의 광고인 / 트렌드 노트 with 금기자's drawing)
Each page carries its own og:title / og:description / og:image for messenger previews
(KakaoTalk, Slack, etc.) and sends a human visitor on to the right spot of the paper
(index.html#ed-… / #camp-…). A page is rebuilt only when its content changes.
"""
import hashlib, html, json, os, re

SITE = "https://yoonjintar2-ctrl.github.io/adsnews/"
BY_GEUM = "금로동 기자 · 발행인 SM C&amp;C 윤석진"
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


def page(key, title, desc, image, w, h, target, sig, canon=None):
    url = SITE + f"{OUT}/{key}.html"
    return f"""<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="share-sig" content="{sig}">
<meta name="robots" content="noindex,follow">
{f'<link rel="canonical" href="{esc(canon)}">' if canon else ''}
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
<div class="l"><div class="k">__KICK__</div><h1>__HEAD__</h1><p class="d">__LEDE__</p><div class="by">__BY__</div></div>
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


def daily_items():
    """오늘의 광고인 / 트렌드 노트 by date: today's data.json plus every back issue in archive/."""
    srcs = ["data.json"]
    if os.path.isdir("archive"):
        srcs += [os.path.join("archive", d, "data.json") for d in sorted(os.listdir("archive"), reverse=True)[:KEEP_DAYS]]
    persons, trends = {}, {}
    for f in srcs:
        try:
            data = json.load(open(f, encoding="utf-8"))
        except Exception:
            continue
        p = data.get("person") or {}
        if p.get("date") and p.get("name") and p["date"] not in persons:
            persons[p["date"]] = p
        t = data.get("trendNotes") or {}
        if t.get("date") and t.get("items") and t["date"] not in trends:
            trends[t["date"]] = t["items"][:1] if t["date"] >= JP_START else t["items"][:3]
    return persons, trends


JP_START = "2026-10-02"


def load_json(path):
    try:
        return json.load(open(path, encoding="utf-8")) or {}
    except Exception:
        return {}


def side_hist(name):
    """{date: content} for a staff file (jipiltae/gemini/grok/debate.json): today's copy plus archived back issues."""
    out = {}
    srcs = [name]
    if os.path.isdir("archive"):
        srcs += [os.path.join("archive", d, name) for d in sorted((x for x in os.listdir("archive") if len(x) == 10), reverse=True)[:KEEP_DAYS]]
    for f in srcs:
        J = load_json(f)
        if not J:
            continue
        for k in ("editorial", "trend", "lineage", "strip", "memes"):
            d = (J.get(k) or {}).get("date")
            if d and d not in out:
                out[d] = J
        if J.get("date") and J.get("turns") and J["date"] not in out:
            out[J["date"]] = J
    return out


def local_img(path):
    f = str(path or "").split("?")[0]
    return f if f and os.path.exists(f) else ""


def data_uri(path, w=600):
    """로컬 그림을 카드에 넣을 때 data: URI로(about:blank 카드에서 file:// 그림은 막힌다)."""
    f = local_img(path)
    if not f:
        return ""
    try:
        import base64, io
        from PIL import Image
        im = Image.open(f).convert("RGB")
        if im.width > w:
            im = im.resize((w, round(im.height * w / im.width)))
        b = io.BytesIO()
        im.save(b, "JPEG", quality=82)
        return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()
    except Exception:
        return ""


def old_body(path):
    try:
        return open(path, encoding="utf-8").read()
    except Exception:
        return ""


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

    jobs, pages, keep_pages = [], [], []
    jp_toon = {}  # 지필태 대리가 그린 그날 메인 사설 삽화
    for f in ["jipiltae.json"] + ([os.path.join("archive", x, "jipiltae.json") for x in sorted(os.listdir("archive")) if len(x) == 10] if os.path.isdir("archive") else []):
        C = (load_json(f).get("cartoon") or {})
        if C.get("for") and C.get("img") and C["for"] not in jp_toon:
            jp_toon[C["for"]] = (C["img"], C.get("caption") or "")
    for e in eds:
        d = e.get("date")
        if not d or not e.get("headline"):
            continue
        key = f"ed-{d}"
        kick = "이번 주 광고계 결산" if e.get("weekly") else "오늘의 사설"
        svg = safe_svg((e.get("cartoon") or {}).get("svg"))
        jt = jp_toon.get(d) or ("", "")
        cimg = jt[0] or (e.get("cartoon") or {}).get("img")
        ccap = jt[1] if jt[0] else (e.get("cartoon") or {}).get("caption")
        if cimg and data_uri(cimg):
            svg = f'<img src="{data_uri(cimg)}" style="display:block;width:540px;height:auto;border:3px solid #1a1a1a;filter:grayscale(1)">'

        lede = clip(e.get("lede") or e.get("body"), 90)
        sig = hashlib.md5(json.dumps([e.get("headline"), lede, svg, kick, 2], ensure_ascii=False).encode()).hexdigest()[:12]
        hp = f"{OUT}/{key}.html"
        desc = f"[{kick} · {md(d)}] " + clip(e.get("lede") or e.get("body"), 110)
        body = page(key, e["headline"], desc, SITE + f"{OUT}/{key}.png?v={sig[:6]}", 1200, 630, f"?d={d}#ed", sig, SITE + f"e/{d}.html")
        if old_sig(hp) == sig and os.path.exists(f"{OUT}/{key}.png"):
            if old_body(hp) != body:
                keep_pages.append((hp, body))
            continue
        card = (CARD.replace("__DATE__", esc(md(d)) + "자").replace("__BY__", BY_GEUM)
                .replace("__KICK__", esc(kick)).replace("__HEAD__", esc(e["headline"]))
                .replace("__LEDE__", esc(lede)).replace("__SVG__", svg)
                .replace("__CAP__", esc(ccap)))
        jobs.append((card, f"{OUT}/{key}.png"))
        pages.append((hp, body))

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
        body = page(key, title, desc, SITE + f"{OUT}/{key}.png?v={sig[:6]}", 1200, 630, f"?d={d}#camp", sig, SITE + f"e/{d}.html")
        if old_sig(hp) == sig and os.path.exists(f"{OUT}/{key}.png"):
            if old_body(hp) != body:
                keep_pages.append((hp, body))
            continue
        im = f'<img src="{esc(img)}" referrerpolicy="no-referrer" alt="">' if img.startswith("http") else ""
        card = (CAMP.replace("__DATE__", esc(md(d)) + "자").replace("__IMG__", im)
                .replace("__BRAND__", esc(c.get("brand"))).replace("__HEAD__", esc(c.get("title")))
                .replace("__LEDE__", esc(lede)))
        jobs.append((card, f"{OUT}/{key}.png"))
        pages.append((hp, body))

    def add_card(key, d, hash_, title, desc, kick, head, lede, svg, cap, by=None):
        sig = hashlib.md5(json.dumps([title, desc, kick, head, lede, svg, cap, 1] + ([by] if by else []), ensure_ascii=False).encode()).hexdigest()[:12]
        hp = f"{OUT}/{key}.html"
        body = page(key, title, desc, SITE + f"{OUT}/{key}.png?v={sig[:6]}", 1200, 630, f"?d={d}#{hash_}", sig, SITE + f"e/{d}.html")
        if old_sig(hp) == sig and os.path.exists(f"{OUT}/{key}.png"):
            if old_body(hp) != body:
                keep_pages.append((hp, body))
            return
        card = (CARD.replace("__DATE__", esc(md(d)) + "자").replace("__KICK__", esc(kick)).replace("__BY__", esc(by) if by else BY_GEUM)
                .replace("__HEAD__", esc(head)).replace("__LEDE__", esc(lede))
                .replace("__SVG__", svg).replace("__CAP__", esc(cap)))
        jobs.append((card, f"{OUT}/{key}.png"))
        pages.append((hp, body))

    persons, trends = daily_items()
    for d, p in persons.items():
        name = p["name"] + (f" ({p['nameEn']})" if p.get("nameEn") else "")
        meta = " · ".join(x for x in (p.get("years"), p.get("role")) if x)
        add_card(f"person-{d}", d, "person", f"오늘의 광고인 · {name}",
                 f"[오늘의 광고인 · {md(d)}] " + clip(p.get("line") or p.get("intro"), 40) + " " + clip(p.get("intro"), 80),
                 "오늘의 광고인", p["name"], clip((p.get("line") or "") + (" — " + meta if meta else ""), 90),
                 safe_svg(p.get("svg")), p.get("caption") or f"금로동 기자가 그린 {p['name']}")
    for d, items in trends.items():
        for i, t in enumerate(items, 1):
            if not t.get("title"):
                continue
            add_card(f"tn-{d}-{i}", d, f"tn{i}", f"#{t.get('tag', '')} — {t['title']}",
                     f"[금기자의 트렌드 노트 · {md(d)}] " + clip(t.get("body"), 110),
                     f"금기자의 트렌드 노트 · #{t.get('tag', '')}", t["title"], clip(t.get("body"), 90),
                     safe_svg(t.get("svg")), "")

    extra_keep = set()

    # ── 새 코너(미니 사설·4컷 만평·AI 4대장 썰전·캠페인 족보·요즘 밈·지필태 트렌드 노트) ──
    def pic(path, w=540):
        u = data_uri(path)
        return f'<img src="{u}" style="display:block;width:{w}px;height:auto;max-height:420px;object-fit:cover;border:3px solid #1a1a1a">' if u else ""

    feat_by_date = {f.get("date"): (f.get("main") or {}) for f in feats}
    for d, J in side_hist("jipiltae.json").items():
        E = J.get("editorial") or {}
        if E.get("date") == d and E.get("headline") and E.get("body"):
            key = f"mini-{d}-jp"; extra_keep.add(key)
            add_card(key, d, "mini-jp", E["headline"], f"[미니 사설 · 지필태 대리 · {md(d)}] " + clip(E.get("lede") or E.get("body"), 110),
                     "미니 사설 · 지필태 대리", E["headline"], clip(E.get("lede") or E.get("body"), 90),
                     pic((E.get("cartoon") or {}).get("img")), (E.get("cartoon") or {}).get("caption") or "", "지필태 대리 · 광고늬우스")
        T = J.get("trend") or {}
        if T.get("date") == d and T.get("title") and T.get("body"):
            key = f"tn-{d}-2"; extra_keep.add(key)
            add_card(key, d, "tn2", f"#{T.get('tag', '')} — {T['title']}", f"[지필태 대리의 트렌드 노트 · {md(d)}] " + clip(T.get("body"), 110),
                     f"트렌드 노트 · #{T.get('tag', '')}", T["title"], clip(T.get("body"), 90), pic(T.get("img")), "", "지필태 대리 · 광고늬우스")
    for d, G in side_hist("gemini.json").items():
        E = G.get("editorial") or {}
        if E.get("date") == d and E.get("headline") and E.get("body"):
            key = f"mini-{d}-gm"; extra_keep.add(key)
            add_card(key, d, "mini-gm", E["headline"], f"[미니 사설 · 제민아 대리 · {md(d)}] " + clip(E.get("lede") or E.get("body"), 110),
                     "미니 사설 · 제민아 대리", E["headline"], clip(E.get("lede") or E.get("body"), 90),
                     pic((E.get("cartoon") or {}).get("img")), (E.get("cartoon") or {}).get("caption") or "", "제민아 대리 · 광고늬우스")
        L = G.get("lineage") or {}
        c = feat_by_date.get(d) or {}
        if L.get("date") == d and L.get("rows") and c.get("url") == L.get("url"):
            key = f"lineage-{d}"; extra_keep.add(key)
            rows = "".join(f'<div style="display:flex;gap:16px;padding:9px 0;border-bottom:1px solid #bbb;font-size:21px;line-height:1.4"><b style="color:#a01e1e;flex:none;width:64px">{esc(r.get("year"))}</b><span><b>{esc(r.get("name"))}</b><br><span style="font-size:17px;color:#444">{esc(clip(r.get("desc"), 34))}</span></span></div>' for r in L["rows"][:5])
            add_card(key, d, "lineage", f"캠페인 족보 — {c.get('brand', '')} {c.get('title', '')}".strip(),
                     f"[캠페인 족보 · 제민아 대리 · {md(d)}] " + clip(L.get("flow"), 110), "캠페인 족보 · 제민아 대리",
                     f"{c.get('brand', '')} 캠페인 족보", clip(L.get("flow"), 90),
                     f'<div style="border-top:3px solid #1a1a1a;padding-top:4px">{rows}</div>', "", "제민아 대리 · 광고늬우스")
    for d, G in side_hist("grok.json").items():
        S = G.get("strip") or {}
        P = [x for x in (S.get("panels") or []) if x.get("img")]
        if S.get("date") == d and S.get("title") and len(P) == 4:
            key = f"strip-{d}"; extra_keep.add(key)
            grid = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;width:540px">' + "".join(
                (lambda u: f'<img src="{u}" style="display:block;width:267px;height:200px;object-fit:cover;border:2px solid #1a1a1a">' if u else "")(data_uri(x["img"], 400)) for x in P) + "</div>"
            add_card(key, d, "strip", f"「{S['title']}」 — 김그록 사원의 4컷 만평", f"[오늘의 4컷 만평 · {md(d)}] " + clip(S.get("punchline") or (S.get("issue") or {}).get("title"), 110),
                     "오늘의 4컷 만평", S["title"], clip(S.get("punchline"), 90), grid, "", "글 김그록 사원 · 그림 지필태 대리")
        MM = G.get("memes") or {}
        if MM.get("date") == d:
            for i, m in enumerate((MM.get("items") or [])[:3], 1):
                v = m.get("video") or {}
                # 원본 영상 썸네일은 남의 그림이라 카드에 굽지 않는다(지면에서만 공식 플레이어로 보여 줌)
                if m.get("img"):
                    right = pic(m["img"])
                elif m.get("phrase"):
                    right = f'<div style="border:3px solid #1a1a1a;background:#fff;padding:34px 30px;font-size:34px;font-weight:900;line-height:1.5;letter-spacing:-1px"><span style="color:#a01e1e">“</span>{esc(m["phrase"])}<span style="color:#a01e1e">”</span></div>'
                elif v:
                    right = f'<div style="border:3px solid #1a1a1a;background:#111;color:#fff;padding:40px 30px;font-size:26px;font-weight:700;line-height:1.5"><div style="display:inline-block;background:#a01e1e;border-radius:12px;padding:6px 22px;font-size:30px;margin-bottom:16px">▶</div><br>원본 영상은 지면에서 바로 재생<br><span style="font-size:19px;font-weight:400;color:#ccc">{esc(v.get("channel") or "")} · {esc(clip(v.get("title"), 40))}</span></div>'
                else:
                    right = ""
                key = f"meme-{d}-{i}"; extra_keep.add(key)
                add_card(key, d, f"meme{i}", f"요즘 밈 · {m.get('name')}", f"[요즘 밈 · {md(d)}] " + clip(m.get("what"), 110),
                         "요즘 밈 · 김그록 사원", m.get("name") or "", clip(m.get("usage") or m.get("what"), 90), right, "", "김그록 사원 · 광고늬우스")
    for d, B in side_hist("debate.json").items():
        T = B.get("turns") or []
        if B.get("date") == d and T and B.get("topic"):
            key = f"debate-{d}"; extra_keep.add(key)
            SA = (load_json("jipiltae.json").get("staffArt") or {})
            who = [("금로동 과장", SA.get("geum")), ("지필태 대리", (load_json("jipiltae.json").get("author") or {}).get("avatar")),
                   ("김그록 사원", SA.get("grok")), ("제민아 대리", SA.get("gemini"))]
            spk = {t.get("who") for t in T}
            who = [x for x, k in zip(who, ("geum", "jp", "gk", "gm")) if k in spk] or who
            faces = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;width:540px">' + "".join(
                (lambda u, n: f'<div style="text-align:center"><img src="{u}" style="width:170px;height:170px;border-radius:50%;object-fit:cover;border:3px solid #1a1a1a;background:#fff"><div style="font-size:20px;font-weight:900;margin-top:4px">{esc(n)}</div></div>' if u else "")(data_uri(w, 300), n) for n, w in who) + "</div>"
            add_card(key, d, "debate", f"AI 4대장의 썰전 — {B['topic']}", f"[AI 4대장의 썰전 · {md(d)}] " + clip(T[0].get("text"), 110),
                     "AI 4대장의 썰전", B["topic"], clip(T[0].get("text"), 90), faces, "", " · ".join(n.split()[0] for n, _ in who))

    try:
        render_cards(jobs)
    except Exception as ex:  # 카드 이미지를 못 만들면 사설 페이지는 다음 기회에
        print("card render failed:", ex)
        pages = []
    for path, body in pages + keep_pages:
        open(path, "w", encoding="utf-8").write(body)
    # 오래된 공유 페이지 정리
    keep = {f"ed-{e.get('date')}" for e in eds} | {f"camp-{f.get('date')}" for f in feats} | {f"person-{d}" for d in persons}
    keep |= {f"tn-{d}-{i}" for d, items in trends.items() for i in range(1, len(items) + 1)}
    keep |= extra_keep
    for fn in os.listdir(OUT):
        if os.path.splitext(fn)[0] not in keep:
            os.remove(os.path.join(OUT, fn))
    print("share pages:", len(pages) + len(keep_pages), "cards:", len(jobs))


if __name__ == "__main__":
    main()
