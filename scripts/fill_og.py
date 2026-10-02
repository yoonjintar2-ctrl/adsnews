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


def decode(raw, ctype=""):
    """한국 언론사 중 EUC-KR(CP949) 페이지가 있어 UTF-8로만 읽으면 글자가 깨진다 → 선언된 문자셋을 따르고, 없으면 차례로 시도."""
    cands = []
    m = re.search(r"charset=([\w-]+)", ctype or "", re.I) or re.search(rb"<meta[^>]+charset=[\"']?([\w-]+)", raw[:6000], re.I)
    if m:
        cs = m.group(1)
        cands.append(cs.decode() if isinstance(cs, bytes) else cs)
    cands += ["utf-8", "cp949"]
    for cs in cands:
        try:
            return raw.decode({"euc-kr": "cp949", "ks_c_5601-1987": "cp949"}.get(cs.lower(), cs))
        except Exception:
            continue
    return raw.decode("utf-8", "replace")


def fetch(url):
    req = urllib.request.Request(url, headers=HDR)
    with urllib.request.urlopen(req, timeout=10) as r:
        final = r.geturl()
        ctype = r.headers.get("Content-Type", "")
        if "html" not in ctype:
            return {"i": "", "d": ""}
        x = decode(r.read(500000), ctype)
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
    if "\ufffd" in d:  # 그래도 깨졌으면 설명은 비운다
        d = ""
    return {"i": img, "d": d}


def urls(data, live):
    out = [(data.get("person") or {}).get("url")] + [x.get("url") for x in data.get("tvNew") or []]
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
    for u in [u for u, v in OG.items() if "\ufffd" in (v.get("d") or "")]:
        OG.pop(u)  # 예전에 문자셋을 잘못 읽어 깨진 설명은 다시 가져온다
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
