"""Keep every day's 미니 사설 in editorials.json so readers can page back through past editorials.

The 06:50 content task rewrites data.json `brief`; this step (run in the trends Action) copies
the current brief into editorials.json under its date, updating it if it changed during the day.
"""
import json
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))


def main():
    b = json.load(open("data.json", encoding="utf-8")).get("brief") or {}
    if not b.get("headline"):
        return
    c = b.get("cartoon") or {}
    date = c.get("date") or datetime.now(KST).strftime("%Y-%m-%d")
    try:
        arr = json.load(open("editorials.json", encoding="utf-8"))
    except Exception:
        arr = []
    entry = {"date": date, "headline": b["headline"], "body": b.get("body") or b.get("lede") or "", "lede": b.get("lede", ""),
             "cartoon": {"svg": c.get("svg", ""), "caption": c.get("caption", "")}}
    old = next((e for e in arr if e.get("date") == date), None)
    if old == entry:
        return
    arr = [e for e in arr if e.get("date") != date] + [entry]
    arr.sort(key=lambda e: e["date"], reverse=True)
    json.dump(arr[:400], open("editorials.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("archived editorial", date)


if __name__ == "__main__":
    main()
