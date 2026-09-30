"""Search-engine pages: every edition as plain HTML that crawlers can read without JavaScript.

  e/YYYY-MM-DD.html  — that day's 미니 사설 (full text + 만평), 오늘의 광고 캠페인 (+ 금로동 기자의 한마디),
                       오늘의 광고인, 실시간 이슈 headlines with 금로동 기자 comments
  e/index.html       — list of all editions (지난 호 모아보기)
  sitemap.xml        — for Google Search Console / 네이버 서치어드바이저
Back issues come from archive/YYYY-MM-DD/data.json; today's page from data.json.
Files are rewritten only when their content changes.
"""
import html, json, os, re
from datetime import datetime, timedelta, timezone

SITE = "https://yoonjintar2-ctrl.github.io/adsnews/"
KST = timezone(timedelta(hours=9))
FIRST = datetime(2026, 9, 27, tzinfo=KST)


def esc(x):
    return html.escape(str(x or ""), quote=True)


def issue_no(d):
    return (datetime.strptime(d, "%Y-%m-%d").replace(tzinfo=KST) - FIRST).days + 1


def md(d):
    dt = datetime.strptime(d, "%Y-%m-%d")
    return f"{dt.month}월 {dt.day}일({'월화수목금토일'[dt.weekday()]})"


def clip(t, n):
    t = re.sub(r"\s+", " ", str(t or "")).strip()
    return t if len(t) <= n else t[: n - 1].rstrip() + "…"


def safe_svg(v):
    v = v or ""
    if not v.startswith("<svg") or re.search(r"<script|\son\w+=|javascript:|<foreignObject", v, re.I):
        return ""
    return v


def load(p, default=None):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return default


def put(path, text):
    try:
        if open(path, encoding="utf-8").read() == text:
            return False
    except Exception:
        pass
    open(path, "w", encoding="utf-8").write(text)
    return True


CSS = """body{margin:0;background:#f1efe9;color:#1a1a1a;font-family:"Noto Serif KR","AppleMyungjo","Batang",serif;line-height:1.75;word-break:keep-all}
.w{max-width:760px;margin:0 auto;padding:20px 18px 48px}
header{border-bottom:3px double #1a1a1a;padding-bottom:8px;margin-bottom:18px;text-align:center}
header a.m{font-size:2.2rem;font-weight:900;color:inherit;text-decoration:none;letter-spacing:-.02em}
header p{margin:4px 0 0;font-size:.85rem;font-weight:700}
h1{font-size:1.7rem;line-height:1.35;margin:.2em 0 .5em}
h2{font-size:1.05rem;border-top:2px solid #1a1a1a;padding-top:6px;margin:34px 0 10px}
h3{font-size:1.1rem;margin:.3em 0}
.k{font-size:.8rem;font-weight:700;color:#a01e1e}
figure{margin:14px 0;border:1px solid #1a1a1a;background:#f4f4f2;padding:4px}
figure svg{display:block;width:100%;height:auto}
figcaption{text-align:center;font-weight:700;font-size:.9rem}
.op{background:#fff;border:1px solid #bbb;border-radius:10px;padding:8px 12px}
.op b{display:block;font-size:.8rem}
ul{padding-left:1.1em}li{margin:.3em 0}
.meta{color:#666;font-size:.85rem}
nav{display:flex;justify-content:space-between;gap:10px;border-top:3px double #1a1a1a;margin-top:36px;padding-top:10px;font-size:.9rem}
a{color:#1a1a1a}
.go{display:block;text-align:center;border:1px solid #1a1a1a;padding:10px;margin:18px 0;font-weight:700;text-decoration:none;background:#fff}"""


def page_html(d, D, prev_d, next_d, has_card):
    b = D.get("brief") or {}
    camps = D.get("campaigns") or []
    feat = next((c for c in camps if c.get("feature")), camps[0] if camps else {})
    picks = [c for c in camps if c is not feat][:4]
    P = D.get("person") or {}
    live = (D.get("live") or [])[:12]
    no = issue_no(d)
    head = b.get("headline") or "광고늬우스"
    title = f"{head} · 광고늬우스 제{no}호 {md(d)}"
    desc = clip(b.get("lede") or b.get("body"), 150)
    url = SITE + f"e/{d}.html"
    img = SITE + (f"s/ed-{d}.png" if has_card else "og.png")
    kick = "이번 주 광고계 결산" if b.get("weekly") else "미니 사설"
    ld = {
        "@context": "https://schema.org", "@type": "NewsArticle", "headline": head[:110], "description": desc,
        "datePublished": f"{d}T06:50:00+09:00", "dateModified": f"{d}T23:59:00+09:00", "inLanguage": "ko",
        "image": [img], "mainEntityOfPage": url,
        "author": {"@type": "Person", "name": "금로동 기자"},
        "publisher": {"@type": "Organization", "name": "광고늬우스", "logo": {"@type": "ImageObject", "url": SITE + "icon-512.png"}},
    }
    out = [f"""<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{esc(url)}">
<meta property="og:type" content="article"><meta property="og:site_name" content="광고늬우스">
<meta property="og:title" content="{esc(head)}"><meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{esc(url)}"><meta property="og:image" content="{esc(img)}"><meta property="og:locale" content="ko_KR">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>{CSS}</style></head><body><div class="w">
<header><a class="m" href="../">광고늬우스</a><p>제{no}호 · {esc(md(d))} · 발행인 SM C&amp;C 윤석진</p></header>
<article>
<span class="k">{esc(kick)} · 금로동 기자</span>
<h1>{esc(head)}</h1>"""]
    svg = safe_svg((b.get("cartoon") or {}).get("svg"))
    if svg:
        cap = (b.get("cartoon") or {}).get("caption")
        out.append(f"<figure>{svg}{f'<figcaption>{esc(cap)}</figcaption>' if cap else ''}</figure>")
    body = b.get("body") or b.get("lede") or ""
    for para in [p for p in re.split(r"\n+", body) if p.strip()]:
        out.append(f"<p>{esc(para)}</p>")
    out.append("</article>")
    if feat.get("title"):
        out.append(f"""<section><h2>오늘의 광고 캠페인</h2>
<span class="k">{esc(feat.get('brand'))}</span><h3>{esc(feat.get('title'))}</h3>
<p class="meta">{esc(' · '.join([x for x in [feat.get('date'), ' · '.join(feat.get('media') or []), feat.get('metric')] if x]))}</p>
<p>{esc(feat.get('story'))}</p>""")
        if feat.get("review") or feat.get("why"):
            out.append(f"<div class=\"op\"><b>금로동 기자의 한마디</b>{esc(feat.get('review') or feat.get('why'))}</div>")
        if feat.get("url"):
            out.append(f"<p class=\"meta\"><a href=\"{esc(feat['url'])}\" rel=\"nofollow noopener\">관련 기사 ↗</a></p>")
        if picks:
            out.append("<h3>함께 볼 캠페인</h3><ul>" + "".join(
                f"<li><b>{esc(c.get('brand'))}</b> — {esc(c.get('title'))}. {esc(clip(c.get('story'), 120))}</li>" for c in picks) + "</ul>")
        out.append("</section>")
    if P.get("name"):
        out.append(f"""<section><h2>오늘의 광고인</h2>
<h3>{esc(P.get('name'))} <span class="meta">{esc(' · '.join([x for x in [P.get('nameEn'), P.get('years'), P.get('country')] if x]))}</span></h3>
<p class="meta">{esc(P.get('role'))}</p><p><b>{esc(P.get('line'))}</b></p><p>{esc(P.get('intro'))}</p>""")
        sv = safe_svg(P.get("svg"))
        if sv:
            out.append(f"<figure>{sv}{f'<figcaption>{esc(P.get(chr(99)+chr(97)+chr(112)+chr(116)+chr(105)+chr(111)+chr(110)))}</figcaption>' if P.get('caption') else ''}</figure>")
        if P.get("works"):
            ws = []
            for w in P["works"]:
                if isinstance(w, dict):
                    ws.append(f"<a href=\"{esc(w.get('url'))}\" rel=\"nofollow noopener\">{esc(w.get('t'))}</a>" if w.get("url") else esc(w.get("t")))
                else:
                    ws.append(esc(w))
            out.append("<p><b>대표 작업</b> · " + " · ".join(ws) + "</p>")
        if P.get("lesson"):
            out.append(f"<div class=\"op\"><b>금로동 기자의 한마디</b>{esc(P['lesson'])}</div>")
        out.append("</section>")
    if live:
        out.append("<section><h2>실시간 이슈</h2><ul>")
        for x in live:
            ins = f"<br><i>금로동 기자: {esc(x['insight'])}</i>" if x.get("insight") else ""
            out.append(f"<li><b>{esc(x.get('title'))}</b> <span class=\"meta\">{esc(x.get('date'))}</span><br>{esc(x.get('summary'))}{ins}"
                       + (f" <a class=\"meta\" href=\"{esc(x['url'])}\" rel=\"nofollow noopener\">기사 ↗</a>" if x.get("url") else "") + "</li>")
        out.append("</ul></section>")
    out.append(f"<a class=\"go\" href=\"../?d={d}\">{esc(md(d))}자 신문 전체 보기 →</a>")
    out.append("<nav>" + (f"<a href=\"{prev_d}.html\">‹ 지난 호 {esc(md(prev_d))}</a>" if prev_d else "<span></span>")
               + "<a href=\"./\">모아보기</a>"
               + (f"<a href=\"{next_d}.html\">다음 호 {esc(md(next_d))} ›</a>" if next_d else "<span></span>") + "</nav>")
    out.append("</div></body></html>\n")
    return "\n".join(out)


def main():
    os.makedirs("e", exist_ok=True)
    eds = {}
    if os.path.isdir("archive"):
        for d in os.listdir("archive"):
            p = os.path.join("archive", d, "data.json")
            if re.fullmatch(r"\d{4}-\d\d-\d\d", d) and os.path.exists(p):
                eds[d] = load(p, {})
    cur = load("data.json", {})
    today = ((cur.get("brief") or {}).get("cartoon") or {}).get("date") or datetime.now(KST).strftime("%Y-%m-%d")
    if cur.get("brief"):
        eds[today] = cur
    dates = sorted(eds)
    n = 0
    for i, d in enumerate(dates):
        prev_d = dates[i - 1] if i > 0 else None
        next_d = dates[i + 1] if i + 1 < len(dates) else None
        n += put(f"e/{d}.html", page_html(d, eds[d], prev_d, next_d, os.path.exists(f"s/ed-{d}.png")))
    rows = "".join(
        f"<li><a href=\"{d}.html\"><b>제{issue_no(d)}호 · {esc(md(d))}</b> {esc((eds[d].get('brief') or {}).get('headline'))}</a>"
        + (f"<br><span class=\"meta\">캠페인 · {esc(next((c.get('brand', '') + ' ' + c.get('title', '') for c in eds[d].get('campaigns') or [] if c.get('feature')), ''))}"
           + (f" / 인물 · {esc((eds[d].get('person') or {}).get('name'))}" if (eds[d].get('person') or {}).get('name') else "") + "</span>")
        + "</li>" for d in reversed(dates))
    idx = f"""<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>지난 호 모아보기 · 광고늬우스</title>
<meta name="description" content="광고늬우스 금로동 기자의 미니 사설·오늘의 광고 캠페인·오늘의 광고인을 날짜별로 모았습니다.">
<link rel="canonical" href="{SITE}e/"><link rel="icon" href="../favicon.svg" type="image/svg+xml">
<style>{CSS}</style></head><body><div class="w">
<header><a class="m" href="../">광고늬우스</a><p>지난 호 모아보기 · 발행인 SM C&amp;C 윤석진</p></header>
<p>매일 아침 금로동 기자가 쓰는 미니 사설과 만평, 오늘의 광고 캠페인, 오늘의 광고인을 날짜별로 모았어요.</p>
<ul>{rows}</ul>
<a class="go" href="../">오늘 신문 보기 →</a>
</div></body></html>
"""
    n += put("e/index.html", idx)
    urls = [(SITE, dates[-1] if dates else None), (SITE + "e/", dates[-1] if dates else None)] + [(SITE + f"e/{d}.html", d) for d in dates]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(
        f"  <url><loc>{u}</loc>{f'<lastmod>{d}</lastmod>' if d else ''}</url>\n" for u, d in urls) + "</urlset>\n"
    n += put("sitemap.xml", sm)
    print("seo pages written:", n, "editions:", len(dates))


if __name__ == "__main__":
    main()
