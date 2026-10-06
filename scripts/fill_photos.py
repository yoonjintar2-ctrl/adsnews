"""Fill missing article photos (og:image) for live / campaigns items in data.json.

The hourly content task only uses web search (no page fetching, so it never
needs approval); this step, run inside the GitHub Action, opens each article
once and copies its og:image. Tried URLs are remembered in live.json so a page
without an image is not fetched again.
"""
import json, re, html, urllib.request

HDR = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36",
       "Accept-Language": "ko-KR,ko;q=0.9"}


def og_image(url):
    req = urllib.request.Request(url, headers=HDR)
    with urllib.request.urlopen(req, timeout=10) as r:
        x = r.read(400000).decode("utf-8", "replace")
    m = (re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', x, re.I)
         or re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image', x, re.I)
         or re.search(r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)', x, re.I))
    if not m:
        return None
    u = html.unescape(m.group(1)).strip()
    if u.startswith("//"):
        u = "https:" + u
    return u if u.startswith("http") else None


def main():
    data = json.load(open("data.json", encoding="utf-8"))
    live = json.load(open("live.json", encoding="utf-8"))
    tried = set(live.get("ogTried") or [])
    changed = False
    todo = [it for it in (data.get("live") or []) + (data.get("campaigns") or [])
            if not it.get("photo") and it.get("url") and it["url"] not in tried]
    fails = live.get("ogFail") or {}
    for it in todo[:20]:
        try:
            u = og_image(it["url"])
        except Exception as e:
            # 일시적 실패는 3번까지 다시 시도한다(한 번 실패로 사진이 영영 비던 문제, 10/6 스파오·동국제약·아디다스)
            fails[it["url"]] = fails.get(it["url"], 0) + 1
            if fails[it["url"]] >= 3:
                tried.add(it["url"])
            print("og", it["url"][:60], "failed:", e); continue
        tried.add(it["url"])
        if u:
            it["photo"] = u; changed = True
    live["ogTried"] = list(tried)[-400:]
    live["ogFail"] = dict(list(fails.items())[-200:])
    json.dump(live, open("live.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    if changed:
        json.dump(data, open("data.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("photos filled:", changed, "checked", len(todo[:20]))


if __name__ == "__main__":
    main()
