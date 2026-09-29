"""Refresh live.json with real-time Korean trend keywords.

Runs on GitHub Actions every 5 minutes. Each source is read on its own;
a source that fails keeps its previous list. The X list is filled by a
separate hourly job and is never touched here.
"""
import json, re, html, urllib.request, urllib.parse
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36",
      "Accept-Language": "ko-KR,ko;q=0.9"}


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", "replace")


def clean(items, n):
    out, seen = [], set()
    for t in items:
        t = html.unescape(re.sub(r"<[^>]+>", "", t)).strip()
        if not t or not re.fullmatch(r"[\s\u0020-\u024f\uac00-\ud7a3\u3130-\u318f·]+", t):
            continue  # drop other scripts (e.g. Thai "weather" rows in the Google feed)
        if t.lower() in ("weather", "날씨"):
            continue
        if t not in seen and len(t) <= 40:
            seen.add(t); out.append(t)
    return out[:n]


GNEWS = {}   # keyword -> news headline that came with the Google Trends item


def google():
    x = get("https://trends.google.com/trending/rss?geo=KR&hl=ko")
    for item in re.findall(r"<item>(.*?)</item>", x, re.S):
        t = re.search(r"<title>(.*?)</title>", item, re.S)
        n = re.search(r"<ht:news_item_title>(.*?)</ht:news_item_title>", item, re.S)
        src = re.search(r"<ht:news_item_source>(.*?)</ht:news_item_source>", item, re.S)
        u = re.search(r"<ht:news_item_url>(.*?)</ht:news_item_url>", item, re.S)
        if t and n:
            GNEWS[html.unescape(t.group(1)).strip()] = {"t": clean_text(n.group(1)), "s": clean_text(src.group(1)) if src else "",
                                                         "u": html.unescape(u.group(1)).strip() if u else ""}
    return clean(re.findall(r"<item>\s*<title>(.*?)</title>", x, re.S), 20)


def clean_text(t):
    t = html.unescape(re.sub(r"<!\[CDATA\[|\]\]>", "", t))
    return html.unescape(re.sub(r"<[^>]+>", "", t)).strip()


def why(keyword):
    """Latest Korean news headline for a keyword (Google News RSS)."""
    q = urllib.parse.quote(keyword.lstrip("#"))
    x = get(f"https://news.google.com/rss/search?q={q}+when:1d&hl=ko&gl=KR&ceid=KR:ko")
    item = re.search(r"<item>(.*?)</item>", x, re.S)
    if not item:
        return None
    t = clean_text(re.search(r"<title>(.*?)</title>", item.group(1), re.S).group(1))
    src = re.search(r"<source[^>]*>(.*?)</source>", item.group(1), re.S)
    link = re.search(r"<link>(.*?)</link>", item.group(1), re.S)
    s = clean_text(src.group(1)) if src else ""
    if s and t.endswith(" - " + s):
        t = t[: -len(s) - 3]
    return {"t": t, "s": s, "u": link.group(1).strip() if link else ""}


def update_reasons(live, now):
    """Keep one 'why is this trending' headline per current keyword (refreshed every 2h)."""
    R = live.get("reasons") or {}
    kws = []
    for src in live.get("sources", {}).values():
        for k in src.get("items", []):
            if k not in kws:
                kws.append(k)
    R = {k: v for k, v in R.items() if k in kws}
    budget = 30
    for k in kws:
        old = R.get(k)
        if old and (now - datetime.fromisoformat(old["at"])).total_seconds() < 7200:
            continue
        if k in GNEWS:
            R[k] = dict(GNEWS[k], at=now.isoformat(timespec="minutes")); continue
        if budget <= 0:
            continue
        budget -= 1
        try:
            r = why(k)
        except Exception as e:
            print("why", k, "failed:", e); continue
        norm = lambda z: re.sub(r"[\s#·'\"‘’“”]", "", z).lower()
        if r and norm(k) and norm(k)[:6] in norm(r["t"]):
            R[k] = dict(r, at=now.isoformat(timespec="minutes"))
        else:
            R[k] = {"t": "", "s": "", "u": "", "at": now.isoformat(timespec="minutes")}   # no matching headline; retry in 2h
    live["reasons"] = R
    print("reasons:", len(R), "of", len(kws))


def xtrends():
    """X(트위터) 한국 실시간 트렌드 — getdaytrends.com 'Now' 표 (로그인 불필요)."""
    x = get("https://getdaytrends.com/korea/")
    i = x.find('id="trends"')
    seg = x[i:i + 60000] if i >= 0 else x
    items = [urllib.parse.unquote(t) for t in re.findall(r'<td class="main"><a class="string" href="/korea/trend/[^"]+/">([^<]{1,60})</a>', seg)]
    return clean(items, 20)


def signal():
    x = json.loads(get("https://api.signal.bz/news/realtime"))
    rows = x.get("top10") or x.get("data") or []
    return clean([r.get("keyword", "") for r in sorted(rows, key=lambda r: r.get("rank", 99))], 10)


def nate():
    x = get("https://www.nate.com/")
    i = x.find("실시간 이슈 키워드")
    seg = x[i:i + 20000] if i >= 0 else x
    items = re.findall(r'<span class="txt[^"]*">([^<]+)</span>', seg)
    return clean(items, 10)


def zum():
    x = get("https://zum.com/")
    items = re.findall(r'"keyword"\s*:\s*"([^"]+)"', x) or re.findall(r'class="[^"]*issue[^"]*keyword[^"]*"[^>]*>([^<]+)<', x)
    return clean(items, 10)


def main():
    try:
        live = json.load(open("live.json", encoding="utf-8"))
    except Exception:
        live = {"sources": {}}
    now = datetime.now(KST)
    iso = now.isoformat(timespec="minutes")
    changed = False
    meta = {"x": ("X", "https://getdaytrends.com/korea/", xtrends),
            "google": ("구글", "https://trends.google.co.kr/trending?geo=KR&hours=4", google),
            "signal": ("시그널", "https://www.signal.bz/", signal),
            "nate": ("네이트", "https://www.nate.com/", nate),
            "zum": ("줌", "https://zum.com/", zum)}
    for key, (label, url, fn) in meta.items():
        try:
            items = fn()
        except Exception as e:
            print(key, "failed:", e); continue
        if len(items) < 3:
            print(key, "too few items, kept previous"); continue
        src = live.setdefault("sources", {}).setdefault(key, {"label": label, "url": url})
        if src.get("items") != items:
            changed = True
        src.update({"label": label, "url": url, "items": items, "at": iso})
        print(key, items[:5])
    try:
        update_reasons(live, now)
    except Exception as e:
        print("reasons failed:", e)
    live["updatedAt"] = iso
    live["updatedLabel"] = f"{now.month}월 {now.day}일 {now:%H:%M}"
    json.dump(live, open("live.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("changed" if changed else "no change")


if __name__ == "__main__":
    main()
