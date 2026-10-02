"""금로동 기자 Threads 계정에 하루 세 번 자동 게시.

  아침(ed)    : 오늘의 미니 사설 — 공유 카드(제목+만평) 이미지와 링크
  점심(tn)    : 금기자의 트렌드 노트 첫 번째 트렌드 카드
  저녁(person): 오늘의 광고인 카드
같은 날 같은 코너는 한 번만 올린다(threads.json에 기록). 카드 이미지가 아직
공개 주소에 없으면 건너뛰고 다음 예약 때 다시 시도한다.

GitHub Secret THREADS_TOKEN: Threads 장기 액세스 토큰(threads_basic, threads_content_publish).
장기 토큰은 약 60일 뒤 만료되므로 그 전에 새로 발급해 Secret 값을 바꿔 넣어야 한다.
"""
import json, os, sys, time, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
API = "https://graph.threads.net/v1.0"
SITE = "https://yoonjintar2-ctrl.github.io/adsnews/"
STATE = "threads.json"
TAGS = "#광고 #마케팅 #광고인 #광고늬우스"


def load(p, d):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return d


def clip(t, n):
    t = " ".join(str(t or "").split())
    return t if len(t) <= n else t[: n - 1].rstrip() + "…"


def req(method, url, params=None):
    data = None
    if params and method == "GET":
        url += ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    elif params:
        data = urllib.parse.urlencode(params).encode()
    r = urllib.request.Request(url, data=data, method=method)
    with urllib.request.urlopen(r, timeout=60) as f:
        return json.loads(f.read().decode())


def live(url):
    try:
        r = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(r, timeout=30) as f:
            return f.status == 200
    except Exception:
        return False


def fit(text, limit=490):
    # Threads 본문은 500자 제한. 링크·태그가 있는 끝부분은 살리고 본문을 줄인다.
    if len(text) <= limit:
        return text
    head, _, tail = text.rpartition("\n\n→")
    tail = "\n\n→" + tail
    return clip(head, limit - len(tail)) + tail


def build(slot, D, today):
    if slot == "ed":
        b = D.get("brief") or {}
        d = (b.get("cartoon") or {}).get("date")
        if d != today or not b.get("headline"):
            return None
        key, page = f"ed-{d}", f"s/ed-{d}"
        text = (f"[오늘의 미니 사설] {b['headline']}\n\n{clip(b.get('lede') or b.get('body'), 220)}"
                f"\n\n→ 금로동 기자의 만평과 전문: {SITE}{page}.html\n\n{TAGS}")
    elif slot == "tn":
        T = D.get("trendNotes") or {}
        d, items = T.get("date"), T.get("items") or []
        if d != today or not items:
            return None
        t = items[0]
        key, page = f"tn-{d}", f"s/tn-{d}-1"
        text = (f"[금기자의 트렌드 노트] #{t.get('tag', '')} — {t.get('title', '')}\n\n{clip(t.get('body'), 230)}"
                + (f"\n\n광고인 포인트: {clip(t.get('point'), 110)}" if t.get("point") else "")
                + f"\n\n→ 오늘의 트렌드 {len(items)}가지: {SITE}{page}.html\n\n{TAGS}")
    else:
        P = D.get("person") or {}
        d = P.get("date")
        if d != today or not P.get("name"):
            return None
        meta = " · ".join(x for x in (P.get("nameEn"), P.get("years"), P.get("role")) if x)
        key, page = f"person-{d}", f"s/person-{d}"
        text = (f"[오늘의 광고인] {P['name']}\n{meta}\n\n{clip(P.get('line'), 80)}"
                + (f"\n\n금로동 기자의 한마디: {clip(P.get('lesson'), 120)}" if P.get("lesson") else "")
                + f"\n\n→ 전문 읽기: {SITE}{page}.html\n\n{TAGS}")
    return key, SITE + page + ".png", fit(text)


def main():
    token = os.environ.get("THREADS_TOKEN")
    if not token:
        print("THREADS_TOKEN not set — skip")
        return
    now = datetime.now(KST)
    slot = (sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] in ("ed", "tn", "person")
            else "ed" if now.hour < 11 else "tn" if now.hour < 16 else "person")
    state = load(STATE, {"posted": {}})
    today = now.strftime("%Y-%m-%d")
    got = build(slot, load("data.json", {}), today)
    if not got:
        print("nothing to post for", slot, today)
    else:
        key, img, text = got
        if key in state["posted"]:
            print("already posted", key)
        elif not live(img):
            print("card not live yet:", img)
        else:
            uid = req("GET", f"{API}/me", {"fields": "id,username", "access_token": token})["id"]
            c = req("POST", f"{API}/{uid}/threads",
                    {"media_type": "IMAGE", "image_url": img, "text": text, "access_token": token})
            time.sleep(30)
            p = req("POST", f"{API}/{uid}/threads_publish", {"creation_id": c["id"], "access_token": token})
            state["posted"][key] = {"id": p.get("id"), "at": datetime.now(KST).isoformat(timespec="seconds")}
            print("posted", key, p.get("id"))
    cut = (now - timedelta(days=60)).strftime("%Y-%m-%d")
    state["posted"] = {k: v for k, v in state["posted"].items() if k[-10:] >= cut}
    json.dump(state, open(STATE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
