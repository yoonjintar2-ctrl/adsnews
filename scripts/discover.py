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
import json, re, time, urllib.request
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))
HDR = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36",
       "Accept-Language": "ko-KR,ko;q=0.9", "Content-Type": "application/json"}
CTX = {"client": {"clientName": "WEB", "clientVersion": "2.20250925.01.00", "hl": "ko", "gl": "KR"}}
TODAY_BY_VIEWS = "CAMSAggC"   # upload date: last 24h, sort: view count
GEN_Q = ["ㅋㅋ", "뉴스", "자막뉴스", "예능", "하이라이트", "브이로그", "먹방", "MV", "드라마", "리뷰", "챌린지",
         "축구", "야구", "아시안게임", "게임", "쇼츠", "요리", "여행", "리액션", "숏폼"]
AD_Q = ["TVCF", "CF", "광고 영상", "캠페인 영상", "브랜드 필름"]
# Major Korean advertisers: their own channels' uploads count as 광고 영상.
# name -> extra lowercase tokens that appear in their channel names
BRANDS = {"삼성전자": ["samsung"], "LG전자": ["lg global", "lg전자", "lge"], "현대자동차": ["hyundai"], "기아": ["kia"],
          "제네시스": ["genesis"], "BMW": ["bmw"], "메르세데스-벤츠": ["mercedes", "벤츠"], "SK텔레콤": ["sk telecom", "skt"],
          "KT": ["kt "], "LG유플러스": ["lg u+", "lgu+", "유플러스"], "쿠팡": ["coupang"], "배달의민족": ["배민", "baemin"],
          "토스": ["toss"], "카카오뱅크": ["kakaobank"], "네이버": ["naver"], "농심": ["nongshim"], "오뚜기": ["ottogi"],
          "하이트진로": ["진로", "jinro", "hite"], "롯데칠성": ["lotte chilsung"], "CJ제일제당": ["cj cheiljedang", "비비고"],
          "아모레퍼시픽": ["amorepacific"], "올리브영": ["oliveyoung", "olive young"], "무신사": ["musinsa"], "코웨이": ["coway"],
          "삼성생명": [], "한화생명": ["hanwha life"], "교보생명": [], "삼성화재": [], "DB손해보험": ["db손보"], "현대해상": [],
          "KB국민은행": ["kb국민", "kbstar"], "신한은행": ["shinhan"], "하나은행": ["hana bank"], "우리은행": [],
          "맥도날드": ["mcdonald"], "버거킹": ["burger king"], "스타벅스": ["starbucks"], "나이키": ["nike"],
          "컬리": ["kurly"], "당근": ["daangn", "karrot"], "야놀자": ["yanolja"], "여기어때": [], "한국타이어": ["hankook tire"],
          "넥슨": ["nexon"], "엔씨소프트": ["ncsoft"], "넷마블": ["netmarble"], "대한항공": ["korean air"], "동원": ["dongwon"],
          "빙그레": ["binggrae"], "오리온": ["orion"], "롯데웰푸드": [], "SK매직": [], "청호나이스": [], "바디프랜드": ["bodyfriend"]}
THIS_MONTH = "EgIIBA%3D%3D"


def brand_of(ch):
    c = ch.lower()
    if re.search(r"e스포츠|esports|e-sports|이글스|위즈|트윈스|라이온즈|자이언츠|랜더스|타이거즈|농구단|배구단|축구단|fc\b", c):
        return None   # sports teams owned by the brand, not its ads
    for b, alias in BRANDS.items():
        if b.lower() in c or any(a in c for a in alias):
            return b
    return None
KIDS = re.compile(r"키즈|동요|유아|아기|어린이|핑크퐁|코코비|베베핀|뽀로로|타요|kids|nursery|baby", re.I)
ADW = re.compile(r"TVCF|\bCF\b|\d+초\s?(광고|TVCF|CF)|광고\s?영상|캠페인\s?(영상|필름)|브랜드\s?필름|Brand ?Film", re.I)
NOT_AD = re.compile(r"광고\s?X|광고\s?아님|광고 들어온|공익광고|리뷰|리액션|반응", re.I)
HANGUL = re.compile(r"[가-힣]")


def post(body):
    req = urllib.request.Request("https://www.youtube.com/youtubei/v1/search?prettyPrint=false",
                                 data=json.dumps(dict(body, context=CTX)).encode(), headers=HDR)
    with urllib.request.urlopen(req, timeout=8) as r:
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


def upload_date(pub, now):
    """Approximate upload date (YYYY-MM-DD) from '3일 전', '2주 전', '1개월 전'."""
    m = re.search(r"(\d+)\s*(분|시간|일|주|개월)", pub or "")
    if not m:
        return None
    n = int(m.group(1))
    h = {"분": n / 60, "시간": n, "일": n * 24, "주": n * 24 * 7, "개월": n * 24 * 30}[m.group(2)]
    return (now - timedelta(hours=h)).strftime("%Y-%m-%d")


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
    t0 = time.time()
    # ad videos uploaded in the last 31 days (kept across days) for the 1-month ranking
    M = live.get("adMonth") or {}
    cutoff = (now - timedelta(days=31)).strftime("%Y-%m-%d")
    M = {k: v for k, v in M.items() if v.get("ud", "") >= cutoff}
    found = 0
    for q, kind in [(q, "gen") for q in GEN_Q] + [(q, "ad") for q in AD_Q]:
        if time.time() - t0 > 90:
            break
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
            b = brand_of(ch)
            if b or (ADW.search(title) and not NOT_AD.search(title)):
                k = "ad"
            elif kind == "gen":
                k = "gen"
            else:
                k = None
            if not k:
                continue
            h = hours_ago(pub)
            if k == "ad":
                M[vid] = {"t": title[:80], "ch": brand_of(ch) or ch[:40], "ud": now.strftime("%Y-%m-%d")}
            it = d["items"].get(vid) or {"t": title[:80], "ch": ch[:40], "fmt": "영상", "kind": k,
                                         "since0": h is not None and h < since_midnight}
            d["items"][vid] = it
            found += 1
    # sweep major advertisers' own channels (uploads this week)
    for b in BRANDS:
        if time.time() - t0 > 170:
            print("disc: time budget reached"); break
        try:
            j = post({"query": b, "params": THIS_MONTH.replace("%3D", "=")})
        except Exception as e:
            print("disc brand", b, "failed:", e); continue
        for v in walk(j, "videoRenderer", [])[:10]:
            vid, title, ch = v.get("videoId"), txt(v.get("title")), txt(v.get("ownerText"))
            pub = txt(v.get("publishedTimeText"))
            if not vid or "스트리밍" in pub or brand_of(ch) != b:
                continue
            h = hours_ago(pub)
            ud = upload_date(pub, now)
            if ud:
                M[vid] = {"t": title[:80], "ch": b, "ud": ud}
            if h is not None and h <= 24 * 7 and vid not in d["items"]:
                d["items"][vid] = {"t": title[:80], "ch": b, "fmt": "영상", "kind": "ad",
                                   "since0": h < since_midnight}
                found += 1
    # keep the list bounded: newest first discovered are kept
    if len(d["items"]) > 160:
        d["items"] = dict(list(d["items"].items())[-160:])
    d["at"] = now.isoformat(timespec="minutes")
    live["disc"] = d
    live["adMonth"] = M
    json.dump(live, open("live.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("disc:", found, "hits,", len(d["items"]), "kept")


if __name__ == "__main__":
    main()
