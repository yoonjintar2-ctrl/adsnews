"""Find videos that are rising *today* (KST) on Korean YouTube.

Runs from the GitHub Action about every 30 minutes. It searches YouTube
(upload date: last 24 hours, sorted by views) for a set of broad Korean
queries and keeps the Korean, non-kids results in live.json["disc"]:

  disc = {date, at, items: {id: {t, ch, fmt, pub, kind, since0}}}

kind is "ad" (brand / campaign film) or "gen". since0 is true when the video
was published after 00:00 KST today, so its whole view count is today's.
fetch_views.py then reads live view counts for these ids as well, and the
page ranks everything by views gained today.
"""
import json, re, urllib.request
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))
HDR = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36",
       "Accept-Language": "ko-KR,ko;q=0.9", "Content-Type": "application/json"}
CTX = {"client": {"clientName": "WEB", "clientVersion": "2.20250925.01.00", "hl": "ko", "gl": "KR"}}
TODAY_BY_VIEWS = "CAMSAggC"   # upload date: last 24h, sort: view count
GEN_Q = ["ㅋㅋ", "뉴스", "자막뉴스", "예능", "하이라이트", "브이로그", "먹방", "MV", "드라마", "리뷰", "챌린지",
         "축구", "야구", "아시안게임", "게임", "쇼츠", "요리", "여행", "리액션", "숏폼"]
AD_Q = ["광고", "CF", "TVCF", "캠페인 영상", "브랜드 필름", "광고 모델", "신제품 광고"]
KIDS = re.compile(r"키즈|동요|유아|아기|어린이|핑크퐁|코코비|베베핀|뽀로로|타요|kids|nursery|baby", re.I)
ADW = re.compile(r"광고|\bCF\b|TVC|캠페인|브랜드\s?필름|Brand ?Film|Campaign|\bAD\b|공식\s?영상", re.I)
HANGUL = re.compile(r"[가-힣]")


def post(body):
    req = urllib.request.Request("https://www.youtube.com/youtubei/v1/search?prettyPrint=false",
                                 data=json.dumps(dict(body, context=CTX)).encode(), headers=HDR)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())


def walk(o, key, out):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == key:
                out.append(v)
            else:
                walk(v, key, out)
    elif isinstance(o, list):
        for v in o:
            walk(v, key, out)
    return out


def txt(o):
    if not o:
        return ""
    return o.get("simpleText") or "".join(r.get("text", "") for r in o.get("runs", []))


def hours_ago(s):
    m = re.search(r"(\d+)\s*(분|시간|일)", s or "")
    if not m:
        return None
    n = int(m.group(1))
    return {"분": n / 60, "시간": n, "일": n * 24}[m.group(2)]


def main():
    live = json.load(open("live.json", encoding="utf-8"))
    now = datetime.now(KST)
    today = now.strftime("%Y-%m-%d")
    d = live.get("disc") or {}
    if d.get("date") != today:
        d = {"date": today, "items": {}, "prev": d.get("items", {})}
    elif d.get("at") and (now - datetime.fromisoformat(d["at"])).total_seconds() < 25 * 60:
        print("disc: recent, skip"); return
    since_midnight = now.hour + now.minute / 60
    found = 0
    for q, kind in [(q, "gen") for q in GEN_Q] + [(q, "ad") for q in AD_Q]:
        try:
            j = post({"query": q, "params": TODAY_BY_VIEWS})
        except Exception as e:
            print("disc", q, "failed:", e); continue
        for v in walk(j, "videoRenderer", [])[:12]:
            vid, title, ch = v.get("videoId"), txt(v.get("title")), txt(v.get("ownerText"))
            pub = txt(v.get("publishedTimeText"))
            if not vid or "스트리밍" in pub or "예정" in pub:
                continue
            if not (HANGUL.search(title) or HANGUL.search(ch)) or KIDS.search(title + " " + ch):
                continue
            k = "ad" if (kind == "ad" and ADW.search(title + " " + ch)) else ("gen" if kind == "gen" and not ADW.search(title) else None)
            if not k:
                continue
            h = hours_ago(pub)
            it = d["items"].get(vid) or {"t": title[:80], "ch": ch[:40], "fmt": "영상", "kind": k,
                                         "since0": h is not None and h < since_midnight}
            d["items"][vid] = it
            found += 1
    # keep the list bounded: newest first discovered are kept
    if len(d["items"]) > 120:
        d["items"] = dict(list(d["items"].items())[-120:])
    d["at"] = now.isoformat(timespec="minutes")
    live["disc"] = d
    json.dump(live, open("live.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("disc:", found, "hits,", len(d["items"]), "kept")


if __name__ == "__main__":
    main()
