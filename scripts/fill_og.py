"""Photo + one-line summary for the bottom-row lists (팔로잉·매체·리포트·업계 소식).

Opens each article once and keeps its og:image and og:description in
live.json["og"] = {url: {"i": image, "d": description}}. An empty entry means
"tried, nothing found" so the page is not fetched again. ~40 pages per run.
"""
import html, json, re, time, urllib.request

HDR = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36",
       "Accept-Language": "ko-KR,ko;q=0.9"}


def meta(x, *names):
    for n in names:
        m = (re.search(r'<meta[^>]+(?:property|name)=["\']%s["\'][^>]+content=["\']([^"\']*)' % re.escape(n), x, re.I)
             or re.search(r'<meta[^>]+content=["\']([^"\']*)["\'][^>]+(?:property|name)=["\']%s["\']' % re.escape(n), x, re.I))
        if m and m.group(1).strip():
            return html.unescape(m.group(1)).strip()
    return ""


def fetch(url):
    req = urllib.request.Request(url, headers=HDR)
    with urllib.request.urlopen(req, timeout=10) as r:
        final = r.geturl()
        ctype = r.headers.get("Content-Type", "")
        if "html" not in ctype:
            return {"i": "", "d": ""}
        x = r.read(500000).decode("utf-8", "replace")
    # Google News article links answer with a small page that points to the publisher
    if "news.google.com" in final:
        m = re.search(r'data-n-au=["\']([^"\']+)', x) or re.search(r'<a[^>]+href=["\'](https?://(?!news\.google)[^"\']+)', x)
        if m:
            return fetch(html.unescape(m.group(1)))
    img = meta(x, "og:image", "twitter:image")
    if img.startswith("//"):
        img = "https:" + img
    if not img.startswith("http"):
        img = ""
    d = re.sub(r"\s+", " ", meta(x, "og:description", "description", "twitter:description"))[:160]
    return {"i": img, "d": d}


def urls(data, live):
    out = [x.get("url") for x in data.get("tvNew") or []]
    for n in (data.get("agencies") or {}).get("news") or []:
        out.append(n.get("url"))
    for p in data.get("platforms") or []:
        for it in p.get("items") or []:
            if isinstance(it, dict):
                out.append(it.get("url"))
    for r in data.get("reports") or []:
        u = r.get("url") or ""
        if not u.lower().endswith(".pdf"):
            out.append(u)
    for b in (live.get("bnews") or {}).values():
        for it in (b.get("items") or [])[:4]:
            out.append(it.get("url"))
    return [u for u in out if u and u.startswith("http")]


def main():
    data = json.load(open("data.json", encoding="utf-8"))
    live = json.load(open("live.json", encoding="utf-8"))
    OG = live.get("og") or {}
    want = urls(data, live)
    t0, n = time.time(), 0
    for u in want:
        if u in OG:
            continue
        if n >= 40 or time.time() - t0 > 70:
            break
        n += 1
        try:
            OG[u] = fetch(u)
        except Exception as e:
            print("og", u[:80], e)
            OG[u] = {"i": "", "d": ""}
    keep = set(want)
    live["og"] = {k: v for k, v in OG.items() if k in keep}
    json.dump(live, open("live.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("og: fetched", n, "stored", len(live["og"]))


if __name__ == "__main__":
    main()
