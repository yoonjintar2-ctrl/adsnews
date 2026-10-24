"""Search-engine hub pages (called from make_seo.py, rebuilt by the GitHub Action every few minutes).

Keyword targets — what ad people actually type into 네이버/구글:
  e/campaign/      "<브랜드> 광고", "<브랜드> 광고 모델", "<캠페인명> 광고"      — 오늘의 광고 캠페인 한 건씩 (분석·족보·X 반응)
  e/trend/         "<신조어> 뜻", "<트렌드> 사례"                              — 트렌드 노트 한 개씩
  e/people/        "<광고인 이름>", "<이름> 광고"                              — 오늘의 광고인 한 명씩
  e/calendar/      "11월 마케팅 캘린더", "11월 마케팅 이슈", "11월 기념일"     — 달마다 한 장
  e/glossary.html  "광고 용어", "CPM 뜻" 같은 "<용어> 뜻"                      — 용어 사전 한 장
All text is what the paper already published (data.json / archive / staff json); nothing is invented here.
Files are rewritten only when their content changes.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from staff_names import rename as staff_rename  # noqa: E402
from urllib.parse import quote
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
CAT = {"holiday": "공휴일·연휴", "season": "시즌·기념일", "event": "이벤트·행사", "sport": "스포츠"}


def esc(x):
    return html.escape(str(x or ""), quote=True)


def clip(t, n):
    t = re.sub(r"\s+", " ", str(t or "")).strip()
    return t if len(t) <= n else t[: n - 1].rstrip() + "…"


def slug(t):
    t = re.sub(r"[\s/\\?#%&'\"<>|:*.,·!()\[\]{}]+", "-", str(t or "").strip()).strip("-")
    return t[:40] or "x"


def enc(u):
    """Percent-encode the Korean part of a URL (sitemaps and canonicals want ASCII)."""
    return quote(str(u or ""), safe=":/?#=&-._~%")


def md(d):
    dt = datetime.strptime(d, "%Y-%m-%d")
    return f"{dt.month}월 {dt.day}일({'월화수목금토일'[dt.weekday()]})"


def load(p, default=None):
    try:
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


NAV = [("", "지난 호"), ("campaign/", "광고 캠페인"), ("calendar/", "마케팅 캘린더"),
       ("trend/", "트렌드 사전"), ("people/", "광고인 열전"), ("glossary.html", "광고 용어 사전")]


def josa(w, pair):
    """pair: '은는' / '이가' / '이란' — picks by the last syllable's final consonant."""
    w = str(w or "")
    ch = w[-1:] if w else ""
    has = "가" <= ch <= "힣" and (ord(ch) - 0xAC00) % 28 != 0
    if pair == "이란":
        return w + ("이란" if has else "란")
    return w + (pair[0] if has else pair[1])


def nav(depth):
    """depth = folder depth of the page from the site root (e/x.html → 1, e/campaign/x.html → 2)."""
    root, e = "../" * depth, "../" * (depth - 1)
    return "<p class=\"meta\" style=\"text-align:center\">" + " · ".join(
        [f"<a href=\"{root}\" style=\"white-space:nowrap\">오늘 신문</a>"]
        + [f"<a href=\"{e or './'}{h}\" style=\"white-space:nowrap\">{esc(t)}</a>" for h, t in NAV]) + "</p>"


def shell(SITE, CSS, path, title, desc, body, depth, ld=None, kind="website", img=None):
    url = enc(SITE + path)
    up = "../" * depth
    lds = ld if isinstance(ld, list) else ([ld] if ld else [])
    return f"""<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{esc(url)}">
<meta property="og:type" content="{kind}"><meta property="og:site_name" content="광고늬우스">
<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{esc(url)}"><meta property="og:image" content="{esc(img or SITE + 'og.png')}"><meta property="og:locale" content="ko_KR">
<link rel="icon" href="{up}favicon.svg" type="image/svg+xml">
{"".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in lds)}
<style>{CSS}</style></head><body><div class="w">
<header><a class="m" href="{up}">광고늬우스</a><p>광고·마케팅 업계 뉴스 · 발행인 SM C&amp;C 윤석진</p></header>
{nav(depth)}
{body}
<a class="go" href="{up}">오늘의 광고늬우스 보기 →</a>
</div></body></html>
"""


def crumbs(SITE, items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": enc(SITE + p)} for i, (n, p) in enumerate(items)]}


def src_links(srcs):
    return " · ".join(f"<a href=\"{esc(x.get('url'))}\" rel=\"nofollow noopener\">{esc(x.get('t') or x.get('title') or '출처')}</a>"
                      for x in srcs or [] if x.get("url"))


def build(SITE, CSS, eds, jps, put):
    """eds: {date: data.json}, jps: {date: jipiltae.json (+ '_gm' gemini)}. Returns ([(path, lastmod)], files_written)."""
    urls, n = [], 0
    dates = sorted(eds)
    gks = {d: load(os.path.join("archive", d, "grok.json"), {}) or {} for d in dates}
    if dates:  # the newest edition is the live one — read the live grok.json (archive copy can lag)
        gks[dates[-1]] = load("grok.json", {}) or gks.get(dates[-1]) or {}
    for sub in ("campaign", "trend", "people", "calendar"):
        os.makedirs(os.path.join("e", sub), exist_ok=True)

    # ---------- 광고 캠페인 ----------
    camp_rows = []
    for d in dates:
        D, J = eds[d], jps.get(d) or {}
        camps = D.get("campaigns") or []
        f = next((c for c in camps if c.get("feature")), None)
        if not f or not f.get("title"):
            continue
        brand, title = f.get("brand") or "", f.get("title") or ""
        path = f"e/campaign/{d}-{slug(brand)}.html"
        G = (J.get("_gm") or {})
        lin = G.get("lineage") or {}
        X = (gks.get(d) or {}).get("xpulse") or {}
        jk = J.get("campaign") or {}
        h1 = f"{brand} 광고 캠페인 「{title}」"
        desc = clip(f"{brand} 광고 「{title}」 — " + (f.get("story") or f.get("why") or ""), 155)
        b = [f"<p class=\"meta\">광고 캠페인 분석 · {esc(md(d))} 오늘의 광고 캠페인</p><h1>{esc(h1)}</h1>"]
        info = [x for x in [f.get("date") and f["date"] not in (f.get("metric") or "") and f"공개 {f['date']}", " · ".join(f.get("media") or []),
                            f.get("model") and f"모델 {f['model']}", f.get("agency") and f.get("agency") != "미공개" and f"제작 {f['agency']}",
                            f.get("metric")] if x]
        if info:
            b.append(f"<p class=\"meta\">{esc(' · '.join(info))}</p>")
        b.append(f"<h2>{esc(brand)} 광고, 어떤 캠페인인가</h2><p>{esc(f.get('story'))}</p>")
        if f.get("why"):
            b.append(f"<p><b>주목할 이유</b> {esc(f['why'])}</p>")
        if f.get("review"):
            b.append(f"<div class=\"op\"><b>금로동 과장의 분석</b>{esc(f['review'])}</div>")
        if jk.get("review") and jk.get("url") == f.get("url"):
            b.append(f"<div class=\"op\" style=\"margin-top:8px\"><b>지필태 대리의 분석</b>{esc(jk['review'])}</div>")
        if lin.get("rows") and (not lin.get("url") or lin.get("url") == f.get("url")):
            b.append(f"<h2>{esc(brand)} 광고 족보 — 지난 캠페인 흐름</h2><ul>" + "".join(
                f"<li><b>{esc(r.get('year'))} {esc(r.get('name'))}</b> — {esc(r.get('desc'))}"
                + (f" <a class=\"meta\" href=\"{esc(r['src'])}\" rel=\"nofollow noopener\">출처</a>" if r.get("src") else "") + "</li>"
                for r in lin["rows"]) + "</ul>" + (f"<p><b>흐름</b> {esc(lin.get('flow'))}</p>" if lin.get("flow") else "")
                + "<p class=\"meta\">정리 제민아 대리</p>")
        if X.get("summary") and (not X.get("url") or X.get("url") == f.get("url")):
            lk = " · ".join(f"<a href=\"{esc(u)}\" rel=\"nofollow noopener\">X 글 {i + 1}</a>" for i, u in enumerate(X.get("links") or []))
            b.append(f"<h2>{esc(brand)} 광고 반응 — X(트위터)</h2><p><b>온도: {esc(X.get('temp'))}</b> {esc(X.get('summary'))}</p>"
                     + (f"<p><i>김그록 사원: {esc(X.get('quip'))}</i></p>" if X.get("quip") else "") + (f"<p class=\"meta\">{lk}</p>" if lk else ""))
        if f.get("url"):
            b.append(f"<p class=\"meta\"><a href=\"{esc(f['url'])}\" rel=\"nofollow noopener\">관련 기사 원문 ↗</a> · <a href=\"../{d}.html\">{esc(md(d))} 광고늬우스 전체</a></p>")
        others = [c for c in camps if c is not f and c.get("title")][:4]
        if others:
            b.append("<h2>같은 날 함께 본 광고 캠페인</h2><ul>" + "".join(
                f"<li><b>{esc(c.get('brand'))}</b> 「{esc(c.get('title'))}」 — {esc(clip(c.get('story'), 110))}</li>" for c in others) + "</ul>")
        ld = [{"@context": "https://schema.org", "@type": "Article", "headline": clip(h1, 110), "description": desc,
               "datePublished": f"{d}T07:00:00+09:00", "inLanguage": "ko", "mainEntityOfPage": enc(SITE + path),
               "about": [{"@type": "Organization", "name": brand}], "author": {"@type": "Person", "name": "금로동 과장"},
               "publisher": {"@type": "Organization", "name": "광고늬우스", "logo": {"@type": "ImageObject", "url": SITE + "icon-512.png"}}},
              crumbs(SITE, [("광고늬우스", ""), ("광고 캠페인 모음", "e/campaign/"), (f"{brand} {title}", path)])]
        n += put(path, staff_rename(shell(SITE, CSS, path, f"{brand} 광고 「{title}」 분석·반응 | 광고늬우스", desc, "\n".join(b), 2, ld, "article"), d))
        urls.append((path, d))
        camp_rows.append((d, brand, title, path, f))
    idx = ["<h1>광고 캠페인 모음 — 요즘 화제의 광고</h1><p>광고늬우스가 매일 하나씩 고른 '오늘의 광고 캠페인'을 모았습니다. 브랜드별 광고 아이디어, 모델, 반응, 지난 광고 족보까지 한 번에 볼 수 있어요.</p><ul>"]
    for d, brand, title, path, f in reversed(camp_rows):
        idx.append(f"<li><a href=\"{esc(path[len('e/campaign/'):])}\"><b>{esc(brand)}</b> 「{esc(title)}」</a> <span class=\"meta\">{esc(md(d))}</span><br>{esc(clip(f.get('story'), 120))}</li>")
    idx.append("</ul>")
    p = "e/campaign/"
    n += put(p + "index.html", shell(SITE, CSS, p, "광고 캠페인 모음 — 요즘 화제의 광고·신규 광고 분석 | 광고늬우스",
                                    "요즘 화제가 된 국내 광고 캠페인을 매일 하나씩 골라 분석합니다. 브랜드 광고 아이디어, 광고 모델, 반응, 지난 광고 족보까지.",
                                    "\n".join(idx), 2, crumbs(SITE, [("광고늬우스", ""), ("광고 캠페인 모음", p)])))
    urls.append((p, dates[-1] if dates else None))

    # ---------- 트렌드 사전 ----------
    trends = {}
    for d in dates:
        D, J = eds[d], jps.get(d) or {}
        tn = (D.get("trendNotes") or {})
        for t in (tn.get("items") or [])[:1]:
            if t.get("tag") and t.get("body"):
                trends.setdefault(t["tag"], (tn.get("date") or d, dict(t, by="금로동 과장")))
        jt = J.get("trend") or {}
        if jt.get("tag") and jt.get("body") and jt.get("date") == d:
            trends.setdefault(jt["tag"], (d, dict(jt, by="지필태 대리")))
    trow = []
    for tag, (d, t) in sorted(trends.items(), key=lambda x: x[1][0]):
        path = f"e/trend/{slug(tag)}.html"
        desc = clip(f"{tag} 뜻과 사례 — {t.get('title') or ''}. {t.get('body')}", 155)
        b = [f"<p class=\"meta\">트렌드 사전 · {esc(md(d))} 트렌드 노트 · 글 {esc(t.get('by'))}</p>",
             f"<h1>{esc(tag)} — 뜻과 사례</h1>", f"<p><b>{esc(t.get('title'))}</b></p>",
             f"<h2>{esc(josa(tag, '이란'))}?</h2><p>{esc(t.get('body'))}</p>"]
        if t.get("point"):
            b.append(f"<h2>광고·마케팅에 어떻게 쓸까</h2><p>{esc(t['point'])}</p>")
        s = src_links(t.get("sources"))
        if s:
            b.append(f"<p class=\"meta\">참고 · {s}</p>")
        b.append(f"<p class=\"meta\"><a href=\"../{d}.html\">{esc(md(d))} 광고늬우스 전체</a></p>")
        ld = [{"@context": "https://schema.org", "@type": "DefinedTerm", "name": tag, "description": clip(t.get("body"), 300),
               "inDefinedTermSet": SITE + "e/trend/", "url": enc(SITE + path)},
              crumbs(SITE, [("광고늬우스", ""), ("트렌드 사전", "e/trend/"), (tag, path)])]
        n += put(path, staff_rename(shell(SITE, CSS, path, f"{tag} 뜻·사례 — 요즘 트렌드 | 광고늬우스 트렌드 사전", desc, "\n".join(b), 2, ld, "article"), d))
        urls.append((path, d))
        trow.append((d, tag, t, path))
    idx = ["<h1>트렌드 사전 — 요즘 뜨는 소비·마케팅 트렌드 뜻</h1><p>광고늬우스 트렌드 노트에 실린 신조어·소비 트렌드를 모았습니다. 뜻, 사례, 광고·마케팅에 쓰는 법까지.</p><ul>"]
    for d, tag, t, path in reversed(trow):
        idx.append(f"<li><a href=\"{esc(path[len('e/trend/'):])}\"><b>#{esc(tag)}</b> — {esc(t.get('title'))}</a> <span class=\"meta\">{esc(md(d))}</span></li>")
    idx.append("</ul>")
    p = "e/trend/"
    n += put(p + "index.html", shell(SITE, CSS, p, "트렌드 사전 — 요즘 소비 트렌드·신조어 뜻과 마케팅 사례 | 광고늬우스",
                                    "요즘 뜨는 소비 트렌드와 신조어의 뜻, 사례, 광고·마케팅 활용법을 정리한 트렌드 사전.",
                                    "\n".join(idx), 2, crumbs(SITE, [("광고늬우스", ""), ("트렌드 사전", p)])))
    urls.append((p, dates[-1] if dates else None))

    # ---------- 광고인 열전 ----------
    prow = []
    seen = set()
    for d in dates:
        P = eds[d].get("person") or {}
        if not P.get("name") or not P.get("intro") or P["name"] in seen:
            continue
        seen.add(P["name"])
        J = jps.get(d) or {}
        jp = J.get("person") or {}
        path = f"e/people/{slug(P['name'])}.html"
        role = P.get("role") or ""
        desc = clip(f"{P['name']}({P.get('nameEn') or ''}) — {role}. {P.get('line') or ''} {P.get('intro')}", 155)
        b = [f"<p class=\"meta\">광고인 열전 · {esc(md(d))} 오늘의 광고인</p>",
             f"<h1>{esc(P['name'])} <span class=\"meta\">{esc(' · '.join(x for x in [P.get('nameEn'), P.get('years'), P.get('country')] if x))}</span></h1>",
             f"<p class=\"meta\">{esc(role)}</p><p><b>{esc(P.get('line'))}</b></p>"]
        if jp.get("img") and jp.get("date") == d:
            b.append(f"<figure><img src=\"../../{esc(jp['img'])}\" alt=\"{esc(P['name'])} 일러스트\" style=\"display:block;width:100%\"><figcaption>그림 지필태 대리</figcaption></figure>")
        b.append(f"<h2>{esc(josa(P['name'], '은는'))} 누구인가</h2><p>{esc(P.get('intro'))}</p>")
        if P.get("works"):
            ws = [(f"<a href=\"{esc(w.get('url'))}\" rel=\"nofollow noopener\">{esc(w.get('t'))}</a>" if isinstance(w, dict) and w.get("url") else esc(w.get("t") if isinstance(w, dict) else w)) for w in P["works"]]
            b.append(f"<h2>{esc(P['name'])}의 대표 광고·작업</h2><ul>" + "".join(f"<li>{w}</li>" for w in ws) + "</ul>")
        if P.get("lesson"):
            b.append(f"<div class=\"op\"><b>오늘의 광고인이 배울 점</b>{esc(P['lesson'])}</div>")
        ex = " · ".join(x for x in [P.get("url") and f"<a href=\"{esc(P['url'])}\" rel=\"nofollow noopener\">관련 기사</a>", P.get("wiki") and f"<a href=\"{esc(P['wiki'])}\" rel=\"nofollow noopener\">위키백과</a>"] if x)
        b.append(f"<p class=\"meta\">{ex}{' · ' if ex else ''}<a href=\"../{d}.html\">{esc(md(d))} 광고늬우스 전체</a></p>")
        ld = [{"@context": "https://schema.org", "@type": "ProfilePage", "mainEntity": {"@type": "Person", "name": P["name"],
               "alternateName": P.get("nameEn") or None, "jobTitle": role, "description": clip(P.get("intro"), 300)}},
              crumbs(SITE, [("광고늬우스", ""), ("광고인 열전", "e/people/"), (P["name"], path)])]
        n += put(path, staff_rename(shell(SITE, CSS, path, f"{P['name']} — {role} | 광고인 열전 · 광고늬우스", desc, "\n".join(b), 2, ld, "profile"), d))
        urls.append((path, d))
        prow.append((d, P, path))
    idx = ["<h1>광고인 열전 — 광고를 바꾼 사람들</h1><p>카피라이터, 아트디렉터, 광고 감독, 크리에이티브 디렉터부터 광고에 큰 영향을 준 사람들까지. 광고늬우스 '오늘의 광고인'을 모았습니다.</p><ul>"]
    for d, P, path in reversed(prow):
        idx.append(f"<li><a href=\"{esc(path[len('e/people/'):])}\"><b>{esc(P['name'])}</b></a> <span class=\"meta\">{esc(P.get('role'))} · {esc(P.get('years'))}</span><br>{esc(P.get('line'))}</li>")
    idx.append("</ul>")
    p = "e/people/"
    n += put(p + "index.html", shell(SITE, CSS, p, "광고인 열전 — 유명 카피라이터·광고 감독·크리에이티브 디렉터 | 광고늬우스",
                                    "광고를 바꾼 카피라이터, 아트디렉터, 광고 감독, 크리에이티브 디렉터를 한 명씩 소개합니다. 대표 광고와 오늘의 광고인이 배울 점까지.",
                                    "\n".join(idx), 2, crumbs(SITE, [("광고늬우스", ""), ("광고인 열전", p)])))
    urls.append((p, dates[-1] if dates else None))

    # ---------- 마케팅 캘린더 ----------
    items, kw = {}, {}
    for d in dates:
        D = eds[d]
        for r in D.get("roadmap") or []:
            if r.get("s") and r.get("t"):
                items[(r["s"], r["t"])] = r
        for k in D.get("searchKeywords") or []:
            if k.get("m") and k.get("words"):
                kw[k["m"]] = k["words"]
    months = {}
    for (s, t), r in items.items():
        a = datetime.strptime(s, "%Y-%m-%d")
        e = datetime.strptime(r.get("e") or s, "%Y-%m-%d")
        m = a.replace(day=1)
        while m <= e:
            months.setdefault(m.strftime("%Y-%m"), []).append(r)
            m = (m + timedelta(days=32)).replace(day=1)
    crow = []
    for m in sorted(months):
        y, mo = int(m[:4]), int(m[5:])
        rs = sorted(months[m], key=lambda r: (r["s"], r["t"]))
        path = f"e/calendar/{m}.html"
        title = f"{y}년 {mo}월 마케팅 캘린더 — 기념일·시즌 이슈·검색 키워드 | 광고늬우스"
        top = ", ".join(r["t"] for r in rs[:6])
        desc = clip(f"{y}년 {mo}월 마케팅 캘린더: {top} 등 {mo}월 마케팅 이슈와 기념일, 광고 기획 팁, 이달의 검색 키워드.", 155)
        b = [f"<h1>{y}년 {mo}월 마케팅 캘린더</h1>",
             f"<p>{mo}월 광고·마케팅 기획에 챙길 기념일, 시즌 이슈, 쇼핑·스포츠·콘텐츠 이벤트를 날짜순으로 정리했습니다. 항목마다 마케터를 위한 한 줄 팁이 붙어 있어요.</p>"]
        if kw.get(m):
            b.append(f"<h2>{mo}월 검색 키워드</h2><p>" + " · ".join(f"<b>{esc(w)}</b>" for w in kw[m]) + "</p>")
        for c in ("holiday", "season", "event", "sport"):
            cs = [r for r in rs if r.get("cat") == c]
            if not cs:
                continue
            b.append(f"<h2>{mo}월 {esc(CAT[c])}</h2><ul>")
            for r in cs:
                when = r["s"][5:].replace("-", ".") + (("~" + r["e"][5:].replace("-", ".")) if r.get("e") else "")
                b.append(f"<li><b>{esc(when)} {esc(r['t'])}</b> — {esc(r.get('d'))}" + (f"<br><span class=\"meta\">마케팅 팁 · {esc(r['tip'])}</span>" if r.get("tip") else "")
                         + (f" <a class=\"meta\" href=\"{esc(r['url'])}\" rel=\"nofollow noopener\">출처</a>" if r.get("url") else "") + "</li>")
            b.append("</ul>")
        prev_m = (datetime(y, mo, 1) - timedelta(days=1)).strftime("%Y-%m")
        next_m = (datetime(y, mo, 28) + timedelta(days=5)).strftime("%Y-%m")
        b.append("<nav>" + (f"<a href=\"{prev_m}.html\">‹ {int(prev_m[5:])}월 캘린더</a>" if prev_m in months else "<span></span>")
                 + "<a href=\"./\">전체</a>" + (f"<a href=\"{next_m}.html\">{int(next_m[5:])}월 캘린더 ›</a>" if next_m in months else "<span></span>") + "</nav>")
        ld = crumbs(SITE, [("광고늬우스", ""), ("마케팅 캘린더", "e/calendar/"), (f"{y}년 {mo}월", path)])
        n += put(path, shell(SITE, CSS, path, title, desc, "\n".join(b), 2, ld))
        urls.append((path, dates[-1] if dates else None))
        crow.append((m, len(rs)))
    idx = ["<h1>마케팅 캘린더 — 월별 마케팅 이슈·기념일</h1><p>광고·마케팅 기획에 쓰는 월별 캘린더입니다. 공휴일과 연휴, 시즌 기념일, 쇼핑·스포츠·콘텐츠 이벤트와 그달의 검색 키워드를 정리했어요.</p><ul>"]
    for m, k in reversed(crow):
        idx.append(f"<li><a href=\"{m}.html\"><b>{int(m[:4])}년 {int(m[5:])}월 마케팅 캘린더</b></a> <span class=\"meta\">{k}개 일정</span></li>")
    idx.append("</ul>")
    p = "e/calendar/"
    n += put(p + "index.html", shell(SITE, CSS, p, "마케팅 캘린더 — 월별 마케팅 이슈·기념일·시즌 일정 | 광고늬우스",
                                    "광고·마케팅 기획자를 위한 월별 마케팅 캘린더. 공휴일·연휴, 기념일, 쇼핑 행사, 스포츠·콘텐츠 이벤트와 검색 키워드를 정리했습니다.",
                                    "\n".join(idx), 2, crumbs(SITE, [("광고늬우스", ""), ("마케팅 캘린더", p)])))
    urls.append((p, dates[-1] if dates else None))

    # ---------- 광고 용어 사전 ----------
    words = (load("adterms.json", {}) or {}).get("words") or []
    seenw, ws = set(), []
    for w in words:
        a, c = (w.get("a") or "").strip(), (w.get("c") or "").strip()
        if a and c and a not in seenw:
            seenw.add(a)
            ws.append((a, c))
    ws.sort()
    b = [f"<h1>광고 용어 사전 — 광고·마케팅 용어 뜻 {len(ws)}개</h1>",
         "<p>광고주, 대행사, 매체사가 매일 쓰는 광고·마케팅 용어의 뜻을 짧게 정리했습니다. 광고늬우스 '광고 낱말 퍼즐'에 나오는 낱말들이에요.</p><dl>"]
    for a, c in ws:
        b.append(f"<dt id=\"{esc(slug(a))}\"><b>{esc(a)}</b> 뜻</dt><dd style=\"margin:0 0 10px 0\">{esc(c)}</dd>")
    b.append("</dl>")
    ld = [{"@context": "https://schema.org", "@type": "DefinedTermSet", "name": "광고 용어 사전", "url": SITE + "e/glossary.html",
           "hasDefinedTerm": [{"@type": "DefinedTerm", "name": a, "description": c} for a, c in ws]},
          crumbs(SITE, [("광고늬우스", ""), ("광고 용어 사전", "e/glossary.html")])]
    p = "e/glossary.html"
    n += put(p, shell(SITE, CSS, p, f"광고 용어 사전 — 광고·마케팅 용어 뜻 {len(ws)}개 정리 | 광고늬우스",
                      f"광고·마케팅 용어 뜻 {len(ws)}개를 한 페이지에. " + ", ".join(a for a, _ in ws[:12]) + " 등 광고 업계 용어를 쉽게 정리했습니다.",
                      "\n".join(b), 1, ld))
    urls.append((p, dates[-1] if dates else None))
    return urls, n
