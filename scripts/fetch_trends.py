"""Refresh live.json with real-time Korean trend keywords.

Runs on GitHub Actions every 5 minutes. Each source is read on its own;
a source that fails keeps its previous list. The X list is filled by a
separate hourly job and is never touched here.
"""
import json, re, html, urllib.request
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
        if t and t not in seen and len(t) <= 40:
            seen.add(t); out.append(t)
    return out[:n]


def google():
    x = get("https://trends.google.com/trending/rss?geo=KR&hl=ko")
    return clean(re.findall(r"<item>\s*<title>(.*?)</title>", x, re.S), 20)


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
    meta = {"google": ("구글", "https://trends.google.co.kr/trending?geo=KR&hours=4", google),
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
    live["updatedAt"] = iso
    live["updatedLabel"] = f"{now.month}월 {now.day}일 {now:%H:%M}"
    json.dump(live, open("live.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("changed" if changed else "no change")


if __name__ == "__main__":
    main()
