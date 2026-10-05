"""News and buzz per brand for 팔로잉 브랜드 소식.

Google News search RSS aggregates many Korean outlets (dailies, trade press,
online media), so each brand gets what's being said about it anywhere, not only
its own press releases. Stores live.json["bnews"] =
  {brand: {"at": iso, "items": [{"date": "MM.DD", "title", "url", "src"}]}}
Brands = follow.json "brands" + the advertiser list in discover.py.
Each brand is refreshed every ~90 min; one run handles at most 25 brands.
"""
import json, re, sys, time, urllib.parse, urllib.request
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

sys.path.insert(0, "scripts")
KST = timezone(timedelta(hours=9))
HDR = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36"}


def clean(s):
    s = re.sub(r"<!\[CDATA\[|\]\]>", "", s)
    s = re.sub(r"<[^>]+>", "", s)
    return (s.replace("&amp;", "&").replace("&quot;", '"').replace("&#39;", "'")
             .replace("&lt;", "<").replace("&gt;", ">").strip())


# 같은 사안을 매체마다 다시 쓴 기사는 한 건만 남긴다(발행인 지적 10/6: '롯백 제니'만 몇 번째냐).
# 브랜드명·흔한 단어를 뺀 제목 글자 2-gram이 4개 이상, 짧은 쪽의 30% 이상 겹치면 같은 사안으로 본다.
STORY_STOP = set("광고 출시 신규 공개 캠페인 브랜드 모델 기념 행사 진행 이벤트 고객 할인 선보 선봬 오픈 개최 서비스 시작 "
                 "강화 확대 나선 나서 이유 위해 위한 대표 업계 시장 국내 글로벌 소비 제품 신제품 판매 매장 기업 그룹 회장 사장".split())


def story_grams(title, brand):
    s = re.sub(r"\s", "", title)
    for b in (brand, re.sub(r"\s", "", brand)):
        if b:
            s = s.replace(b, "")
    s = re.sub(r"[^0-9A-Za-z가-힣]", "", s).lower()
    return {s[i:i + 2] for i in range(len(s) - 1)} - STORY_STOP


QUOTE = "'\"‘’“”「」『』`"


def quoted(title):
    """제목 속 따옴표로 묶은 고유어(사람·제품·캠페인 이름) — 같으면 같은 사안으로 본다."""
    return {re.sub(r"\s", "", q) for q in re.findall(r"[%s]([^%s]{1,20})[%s]" % (QUOTE, QUOTE, QUOTE), title)} - {""}


def same_story(a, b):
    (ga, qa), (gb, qb) = a, b
    if qa & qb:
        return True
    n = len(ga & gb)
    return bool(ga and gb) and n >= 4 and n / min(len(ga), len(gb)) >= 0.3


def dedupe_stories(items, brand):
    kept, grams = [], []
    for o in items:
        t = o.get("title", "")
        g = (story_grams(t, brand), quoted(t))
        if any(same_story(g, k) for k in grams):
            continue
        kept.append(o); grams.append(g)
    return kept


def fetch(brand):
    q = urllib.parse.quote('"%s" when:14d' % brand)
    url = "https://news.google.com/rss/search?q=%s&hl=ko&gl=KR&ceid=KR:ko" % q
    x = urllib.request.urlopen(urllib.request.Request(url, headers=HDR), timeout=10).read().decode("utf-8", "replace")
    out, seen = [], set()
    key = re.sub(r"\s", "", brand).lower()
    for it in re.findall(r"<item>(.*?)</item>", x, re.S):
        t = clean((re.search(r"<title>(.*?)</title>", it, re.S) or [None, ""])[1] if re.search(r"<title>", it) else "")
        src = re.search(r"<source[^>]*>(.*?)</source>", it, re.S)
        s = clean(src.group(1)) if src else ""
        if s and t.endswith(" - " + s):
            t = t[: -len(s) - 3]
        u = (re.search(r"<link>(.*?)</link>", it, re.S) or [None, ""])[1] if re.search(r"<link>", it) else ""
        pd = re.search(r"<pubDate>(.*?)</pubDate>", it, re.S)
        try:
            dt = parsedate_to_datetime(pd.group(1)).astimezone(KST)
        except Exception:
            continue
        norm = re.sub(r"\W", "", t)[:40]
        if not t or norm in seen:
            continue
        seen.add(norm)
        out.append({"ts": dt.isoformat(), "date": dt.strftime("%m.%d"), "title": t[:120], "url": u.strip(), "src": s[:30],
                    "hit": key in re.sub(r"\s", "", t).lower()})
    # headlines that name the brand first, then newest
    out.sort(key=lambda o: o["ts"], reverse=True)
    out.sort(key=lambda o: not o["hit"])
    out = dedupe_stories(out, brand)
    top = [o for o in out if o["hit"]][:10] or out[:6]
    top.sort(key=lambda o: o["ts"], reverse=True)
    for o in top:
        o.pop("hit", None); o.pop("ts", None)
    return top


def main():
    live = json.load(open("live.json", encoding="utf-8"))
    try:
        extra = json.load(open("follow.json", encoding="utf-8")).get("brands", [])
    except Exception:
        extra = []
    try:
        from discover import BRANDS
        base = list(BRANDS.keys())
    except Exception:
        base = []
    brands = []
    for b in extra + base:
        if b and b not in brands:
            brands.append(b)
    B = {k: v for k, v in (live.get("bnews") or {}).items() if k in brands}
    now = datetime.now(KST)
    # stalest first; brands from follow.json get priority when equally stale
    def age(b):
        a = (B.get(b) or {}).get("at")
        return (now - datetime.fromisoformat(a)).total_seconds() if a else 1e9
    todo = [b for b in sorted(brands, key=lambda b: (-age(b), b not in extra)) if age(b) > 90 * 60]
    t0, n = time.time(), 0
    for b in todo[:25]:
        if time.time() - t0 > 60:
            break
        try:
            B[b] = {"at": now.isoformat(timespec="minutes"), "items": fetch(b)}
            n += 1
        except Exception as e:
            print("bnews", b, "failed:", e)
    for b, v in B.items():  # 예전에 받아 둔 목록도 같은 사안 중복을 걷어 낸다
        v["items"] = dedupe_stories(v.get("items") or [], b)
    live["bnews"] = B
    json.dump(live, open("live.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("bnews: refreshed", n, "brands, total", len(B))


if __name__ == "__main__":
    main()
