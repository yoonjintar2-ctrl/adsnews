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
    with urllib.request.urlopen(req, timeout=8) as r:
        return r.read().decode("utf-8", "replace")


def _live_count(vid):
    """Exact live view count from YouTube's updated_metadata endpoint (what the watch page polls)."""
    body = json.dumps({"context": {"client": {"clientName": "WEB", "clientVersion": "2.20250925.01.00", "hl": "ko", "gl": "KR"}},
                       "videoId": vid}).encode()
    req = urllib.request.Request("https://www.youtube.com/youtubei/v1/updated_metadata?prettyPrint=false", data=body,
                                 headers=dict(HDR, **{"Content-Type": "application/json"}))
    with urllib.request.urlopen(req, timeout=8) as r:
        x = r.read().decode("utf-8", "replace")
    m = re.search(r'"videoViewCountRenderer":\{"viewCount":\{"simpleText":"([^"]+)"', x) or re.search(r'"originalViewCount":"(\d+)"', x)
    if not m:
        return None
    digits = re.sub(r"\D", "", m.group(1))
    return int(digits) if digits else None


def total_views(vid, prefer=None):
    """Return (count, source). Only YouTube's live counter is used: cached third-party counts
    jump by hours at a time and would show fake 'today' gains."""
    try:
        n = _live_count(vid)
        if n:
            DIAG["yt"] = DIAG.get("yt", 0) + 1
            return n, "yt"
        DIAG["miss"] = DIAG.get("miss", 0) + 1
    except Exception as e:
        DIAG["err"] = DIAG.get("err", 0) + 1
        DIAG.setdefault("yt_err", str(e)[:120])
    return None, None


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
    disc = (live.get("disc") or {})
    ditems = disc.get("items", {}) if disc.get("date") == datetime.now(KST).strftime("%Y-%m-%d") else {}
    gpool = gpool + [{"id": k, "channel": x.get("ch")} for k, x in ditems.items() if x.get("kind") == "gen"]
    apool = apool + [{"id": k, "channel": x.get("ch")} for k, x in ditems.items() if x.get("kind") == "ad"]
    ids = []
    mpool = [{"id": k} for k in (live.get("adMonth") or {})]
    for k in (gpool, apool, T.get("generalDaily", []), T.get("adDaily", []), mpool):
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
        if v.get("cur") and v.get("date"):
            # keep 30 days of per-video daily ad gains for the rolling 1-month ranking
            H = live.get("adHist") or {}
            dd = live.get("disc") or {}
            yitems = dd.get("prev", {}) if dd.get("date") == today else dd.get("items", {})
            yad = [{"id": k, "channel": x.get("ch"), "title": x.get("t")} for k, x in yitems.items() if x.get("kind") == "ad"]
            day = {}
            for it in (T.get("adPoolDaily") or []) + yad:
                i = it["id"]
                if i in v["cur"] and i in v["base"] and not v.get("bt", {}).get(i):
                    g = v["cur"][i] - v["base"][i]
                    if g > 0:
                        day[i] = [g, it.get("channel") or "", (it.get("title") or "")[:60]]
            H[v["date"]] = day
            live["adHist"] = {k: H[k] for k in sorted(H)[-30:]}
        prev = {"g": order(gpool, v), "a": order(apool, v)} if v.get("cur") else v.get("prev", {})
        v = {"date": today, "base": {}, "bt": {}, "cur": {}, "src": {}, "prev": prev}
    v.setdefault("src", {})

    ok = 0
    from concurrent.futures import ThreadPoolExecutor
    t0 = time.time()
    todo = ids[:450]

    def read(vid):
        if time.time() - t0 > 150:      # hard time budget so the 5-minute loop never stalls
            return vid, None, None
        try:
            return (vid,) + total_views(vid, v["src"].get(vid))
        except Exception as e:
            print("views", vid, "failed:", e)
            return vid, None, None

    with ThreadPoolExecutor(max_workers=6) as ex:
        results = list(ex.map(read, todo))
    for vid, n, src in results:
        if n is None:
            continue
        ok += 1
        if v["src"].get(vid) not in (None, "yt"):
            # counted earlier from a cached source: restart this video's count from now
            v["base"].pop(vid, None)
        v["cur"][vid] = n
        v["src"][vid] = src
        if vid not in v["base"]:
            if ditems.get(vid, {}).get("since0"):
                v["base"][vid] = 0          # uploaded after 00시: every view is today's
            else:
                v["base"][vid] = n
                if now.hour >= 1:
                    v["bt"][vid] = now.strftime("%H:%M")
    keep = set(ids)
    for key in ("cur", "base", "bt", "src"):
        v[key] = {k: val for k, val in v[key].items() if k in keep}
    print("views: took", int(time.time() - t0), "s")
    v["at"] = now.isoformat(timespec="minutes")
    v["diag"] = DIAG
    print("views: read", ok, "of", len(ids))
    if ok == 0 and not new_day:
        return
    live["views"] = v
    json.dump(live, open("live.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
