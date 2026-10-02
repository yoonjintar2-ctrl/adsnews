"""Keep every day's 미니 사설 in editorials.json so readers can page back through past editorials.

The 06:50 content task rewrites data.json `brief`; this step (run in the trends Action) copies
the current brief into editorials.json under its date, updating it if it changed during the day.
It also keeps each edition's featured campaign in featured.json for shared #camp-YYYY-MM-DD links.
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
             "cartoon": {k: c.get(k) for k in ("svg", "caption", "img", "bubble") if c.get(k)}, "weekly": bool(b.get("weekly"))}
    old = next((e for e in arr if e.get("date") == date), None)
    if old == entry:
        return
    arr = [e for e in arr if e.get("date") != date] + [entry]
    arr.sort(key=lambda e: e["date"], reverse=True)
    json.dump(arr[:400], open("editorials.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("archived editorial", date)


def archive_campaign():
    """Keep each edition's 오늘의 광고 캠페인 (feature + 4 picks) in featured.json so shared links keep working."""
    d = json.load(open("data.json", encoding="utf-8"))
    camps = d.get("campaigns") or []
    if not camps:
        return
    main_c = next((c for c in camps if c.get("feature")), camps[0])
    picks = [c for c in camps if c is not main_c][:4]
    date = ((d.get("brief") or {}).get("cartoon") or {}).get("date") or datetime.now(KST).strftime("%Y-%m-%d")
    try:
        arr = json.load(open("featured.json", encoding="utf-8"))
    except Exception:
        arr = []
    entry = {"date": date, "main": main_c, "picks": picks}
    if next((e for e in arr if e.get("date") == date), None) == entry:
        return
    arr = [e for e in arr if e.get("date") != date] + [entry]
    arr.sort(key=lambda e: e["date"], reverse=True)
    json.dump(arr[:200], open("featured.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("archived campaign", date)


def archive_person():
    """Keep every day's 오늘의 광고인 in people.json (so the content task never repeats a person)."""
    p = json.load(open("data.json", encoding="utf-8")).get("person") or {}
    if not p.get("name") or not p.get("date"):
        return
    try:
        arr = json.load(open("people.json", encoding="utf-8"))
    except Exception:
        arr = []
    entry = {k: p.get(k) for k in ("date", "name", "nameEn", "years", "role", "url")}
    if next((e for e in arr if e.get("date") == p["date"]), None) == entry:
        return
    arr = [e for e in arr if e.get("date") != p["date"]] + [entry]
    arr.sort(key=lambda e: e["date"], reverse=True)
    json.dump(arr, open("people.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("archived person", p["date"])


def archive_trends():
    """Keep the tags of every day's 트렌드 노트 in trendnotes.json so topics are not repeated."""
    t = json.load(open("data.json", encoding="utf-8")).get("trendNotes") or {}
    if not t.get("date") or not t.get("items"):
        return
    try:
        arr = json.load(open("trendnotes.json", encoding="utf-8"))
    except Exception:
        arr = []
    tags = [x.get("tag") for x in t["items"]]
    try:  # 지필태 기자의 같은 날 트렌드 주제도 함께 기록 → 두 기자 모두 30일 안에 같은 주제를 피한다
        jt = (json.load(open("jipiltae.json", encoding="utf-8")).get("trend") or {})
        if jt.get("date") == t["date"] and jt.get("tag") and jt["tag"] not in tags:
            tags.append(jt["tag"])
    except Exception:
        pass
    entry = {"date": t["date"], "tags": tags}
    if next((e for e in arr if e.get("date") == t["date"]), None) == entry:
        return
    arr = [e for e in arr if e.get("date") != t["date"]] + [entry]
    arr.sort(key=lambda e: e["date"], reverse=True)
    json.dump(arr, open("trendnotes.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("archived trend notes", t["date"])


if __name__ == "__main__":
    main()
    archive_campaign()
    archive_person()
    archive_trends()
