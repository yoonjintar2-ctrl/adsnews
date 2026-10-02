"""Keep each day's whole paper as a back issue (지난 호), frozen at 23:59 KST.

archive/YYYY-MM-DD/ gets data.json, live.json (trimmed), puzzle.json and hidden.json.
- Between 23:45 and 23:59 KST every run overwrites today's folder, so the last write of the
  day is the 23:59 state.
- If a day was missed (runner gap), the first run of the next day before 06:40 fills it from
  the current files, which have not changed much yet.
archive/index.json lists the editions: [{date, issue, headline}] newest first.
"""
import json, os, shutil
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
FIRST = datetime(2026, 9, 29, tzinfo=KST)  # 제1호


def issue_no(date):
    d = datetime.strptime(date, "%Y-%m-%d").replace(tzinfo=KST)
    return (d - FIRST).days + 1


def load(p, default=None):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return default


def trim_live(live, data):
    """Drop what a back issue never shows, to keep the archive small."""
    if not live:
        return {}
    live = dict(live)
    live.pop("ogTried", None)
    urls = set()
    for x in (data.get("live") or []) + (data.get("campaigns") or []) + (data.get("tvNew") or []):
        urls.add(x.get("url"))
    urls.add((data.get("person") or {}).get("url"))
    for n in (data.get("agencies") or {}).get("news") or []:
        urls.add(n.get("url"))
    for p in data.get("platforms") or []:
        for it in p.get("items") or []:
            if isinstance(it, dict):
                urls.add(it.get("url"))
    for r in data.get("reports") or []:
        urls.add(r.get("url"))
    bn = {}
    for k, b in (live.get("bnews") or {}).items():
        b = dict(b)
        b["items"] = [{k: it.get(k) for k in ("title", "date", "src", "url", "photo") if it.get(k)} for it in (b.get("items") or [])[:6]]
        for it in b["items"]:
            urls.add(it.get("url"))
        bn[k] = b
    live["bnews"] = bn
    live["og"] = {u: v for u, v in (live.get("og") or {}).items() if u in urls}
    return live


def write(date, src="."):
    data = load(os.path.join(src, "data.json"), {})
    if not data:
        return False
    out = os.path.join("archive", date)
    os.makedirs(out, exist_ok=True)
    json.dump(data, open(os.path.join(out, "data.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(trim_live(load(os.path.join(src, "live.json"), {}), data), open(os.path.join(out, "live.json"), "w", encoding="utf-8"),
              ensure_ascii=False, separators=(",", ":"))
    for f in ("puzzle.json", "hidden.json", "jipiltae.json", "grok.json", "debate.json"):
        if os.path.exists(os.path.join(src, f)):
            shutil.copyfile(os.path.join(src, f), os.path.join(out, f))
    return True


def reindex():
    items = []
    if os.path.isdir("archive"):
        for d in sorted(os.listdir("archive"), reverse=True):
            p = os.path.join("archive", d, "data.json")
            if len(d) == 10 and os.path.exists(p):
                data = load(p, {})
                items.append({"date": d, "issue": issue_no(d), "headline": (data.get("brief") or {}).get("headline", "")})
    old = load("archive/index.json", None)
    if old != items:
        json.dump(items, open("archive/index.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def main():
    now = datetime.now(KST)
    today = now.strftime("%Y-%m-%d")
    yday = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    if now.hour == 23 and now.minute >= 45:
        write(today) and print("archived edition", today)
    elif (now.hour < 6 or (now.hour == 6 and now.minute < 40)) and not os.path.exists(os.path.join("archive", yday, "data.json")):
        write(yday) and print("archived edition (late)", yday)
    reindex()


if __name__ == "__main__":
    main()
