"""Track today's YouTube view gains for the 요즘 뜨는 영상 section.

Runs inside the same GitHub Action as fetch_trends.py (about every 5 min),
but only hits YouTube when the last read is 14+ minutes old or the KST date
changed. For every candidate video in data.json (trends.poolDaily,
trends.adPoolDaily plus the four shown lists) it reads the current total
view count from the watch page and stores, in live.json["views"]:

  date  - KST date the baseline belongs to (YYYY-MM-DD)
  at    - ISO time of the last read
  base  - {id: total views at the first read of the day}   -> reset at 00시
  bt    - {id: "HH:MM"} only for videos whose baseline was taken after 01시
  cur   - {id: latest total views}
  prev  - {"g": [ids], "a": [ids]} yesterday's final daily order (for ▲▼)

The page shows today's gain (cur - base) big and the total (cur) small.
"""
import json, re, time, urllib.request
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))
HDR = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36",
       "Accept-Language": "ko-KR,ko;q=0.9", "Cookie": "CONSENT=YES+1; SOCS=CAI"}


DIAG = {}


def _get(url):
    req = urllib.request.Request(url, headers=HDR)
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", "replace")


def _next_web(vid):
    body = json.dumps({"context": {"client": {"clientName": "WEB", "clientVersion": "2.20250925.01.00", "hl": "ko", "gl": "KR"}},
                       "videoId": vid}).encode()
    req = urllib.request.Request("https://www.youtube.com/youtubei/v1/next?prettyPrint=false", data=body,
                                 headers=dict(HDR, **{"Content-Type": "application/json"}))
    with urllib.request.urlopen(req, timeout=20) as r:
        x = r.read().decode("utf-8", "replace")
    m = re.search(r'"originalViewCount":"(\d+)"', x)
    if m:
        return int(m.group(1))
    m = re.search(r'"videoViewCountRenderer":\{"viewCount":\{"simpleText":"([^"]+)"', x)
    if m:
        digits = re.sub(r"\D", "", m.group(1))
        return int(digits) if digits else None
    return None


def total_views(vid, prefer=None):
    """Return (count, source). Keeps one source per video for the whole day so
    today's gain is never computed across two differently-timed counters."""
    # 1) YouTube's own web API (live count, same number the watch page shows); one retry
    for attempt in (0, 1):
      try:
        n = _next_web(vid)
        if n:
            DIAG["yt"] = DIAG.get("yt", 0) + 1
            return n, "yt"
      except Exception as e:
        DIAG.setdefault("yt_err", str(e)[:120])
      time.sleep(1.5)
    if prefer == "yt":
        return None, None
    n = _ryd(vid)
    return (n, "ryd") if n else (None, None)


def _ryd(vid):
    # Return YouTube Dislike public API (cached, can lag by hours)
    try:
        j = json.loads(_get(f"https://returnyoutubedislikeapi.com/votes?videoId={vid}"))
        if j.get("viewCount"):
            DIAG["ryd"] = DIAG.get("ryd", 0) + 1
            return int(j["viewCount"])
    except Exception as e:
        DIAG.setdefault("ryd_err", str(e)[:120])
    return None


def order(pool, v):
    """Daily order the page would show: today's gain, one video per channel."""
    rows, seen = [], set()
    for it in sorted(pool, key=lambda it: -(v["cur"].get(it["id"], 0) - v["base"].get(it["id"], v["cur"].get(it["id"], 0)))):
        if it["id"] not in v["cur"] or it.get("channel") in seen:
            continue
        seen.add(it.get("channel")); rows.append(it["id"])
    return rows[:10]


def main():
    data = json.load(open("data.json", encoding="utf-8"))
    live = json.load(open("live.json", encoding="utf-8"))
    T = data.get("trends", {})
    gpool = T.get("poolDaily") or T.get("generalDaily") or []
    apool = T.get("adPoolDaily") or T.get("adDaily") or []
    ids = []
    for k in (gpool, apool, T.get("generalDaily", []), T.get("adDaily", [])):
        for it in k:
            if it.get("id") and it["id"] not in ids:
                ids.append(it["id"])

    now = datetime.now(KST)
    today = now.strftime("%Y-%m-%d")
    v = live.get("views") or {}
    new_day = v.get("date") != today
    if not new_day and v.get("at"):
        last = datetime.fromisoformat(v["at"])
        if (now - last).total_seconds() < 9 * 60:
            print("views: read", int((now - last).total_seconds() // 60), "min ago, skip"); return

    if new_day:
        prev = {"g": order(gpool, v), "a": order(apool, v)} if v.get("cur") else v.get("prev", {})
        v = {"date": today, "base": {}, "bt": {}, "cur": {}, "src": {}, "prev": prev}
    v.setdefault("src", {})

    ok = 0
    for vid in ids[:60]:
        try:
            n, src = total_views(vid, v["src"].get(vid))
        except Exception as e:
            print("views", vid, "failed:", e); continue
        if n is None:
            print("views", vid, "no count"); continue
        ok += 1
        if v["src"].get(vid) == "ryd" and src == "yt" and vid in v["base"]:
            # upgrade to the live counter but keep the gain counted so far
            v["base"][vid] = n - (v["cur"][vid] - v["base"][vid])
        v["cur"][vid] = n
        v["src"][vid] = src
        time.sleep(0.4)
        if vid not in v["base"]:
            v["base"][vid] = n
            if now.hour >= 1:
                v["bt"][vid] = now.strftime("%H:%M")
    keep = set(ids)
    for key in ("cur", "base", "bt", "src"):
        v[key] = {k: val for k, val in v[key].items() if k in keep}
    v["at"] = now.isoformat(timespec="minutes")
    v["diag"] = DIAG
    print("views: read", ok, "of", len(ids))
    if ok == 0 and not new_day:
        return
    live["views"] = v
    json.dump(live, open("live.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
