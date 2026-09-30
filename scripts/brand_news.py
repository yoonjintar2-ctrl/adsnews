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
    out.sort(key=lambda o: (not o["hit"], o["ts"]), reverse=False)
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
    live["bnews"] = B
    json.dump(live, open("live.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("bnews: refreshed", n, "brands, total", len(B))


if __name__ == "__main__":
    main()
