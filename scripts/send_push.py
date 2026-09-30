"""Morning web push: today's mini editorial (cartoon image + headline + lede) -> site.

Usage (from .github/workflows/push.yml):
  python scripts/send_push.py check    -> prints "go" when a push should be sent today
  python scripts/send_push.py render   -> writes toon.png from data.json brief.cartoon.svg
  python scripts/send_push.py send     -> sends through OneSignal, records lastSent in push.json

Needs push.json appId and the ONESIGNAL_REST_KEY secret; without them it does nothing.
"""
import json, os, subprocess, sys, urllib.request
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))
SITE = "https://yoonjintar2-ctrl.github.io/adsnews/"


def today():
    return datetime.now(KST).strftime("%Y-%m-%d")


def load(p):
    return json.load(open(p, encoding="utf-8"))


def brief_ok(data):
    b = data.get("brief") or {}
    c = b.get("cartoon") or {}
    return bool(b.get("headline")) and c.get("date") == today()


def check():
    cfg, data = load("push.json"), load("data.json")
    if not cfg.get("appId") or not os.environ.get("ONESIGNAL_REST_KEY"):
        print("skip: push not configured"); return
    if cfg.get("lastSent") == today():
        print("skip: already sent today"); return
    if not brief_ok(data):
        print("skip: today's editorial not ready yet"); return
    print("go")


def render():
    svg = ((load("data.json").get("brief") or {}).get("cartoon") or {}).get("svg") or ""
    if not svg:
        return
    svg = svg.replace("Noto Serif KR", "Noto Serif CJK KR")
    open("toon.svg", "w", encoding="utf-8").write(svg)
    # 2:1 landscape works best for notification images
    subprocess.run(["rsvg-convert", "-w", "1024", "-b", "#f4f4f2", "-o", "toon.png", "toon.svg"], check=True)
    os.remove("toon.svg")
    print("rendered toon.png")


def send():
    cfg, data = load("push.json"), load("data.json")
    b = data["brief"]
    t = today()
    img = SITE + "toon.png?d=" + t
    lede = (b.get("lede") or b.get("body") or "")[:110]
    body = {
        "app_id": cfg["appId"],
        "included_segments": ["Total Subscriptions"],
        "headings": {"en": "광고늬우스 · 오늘의 사설", "ko": "광고늬우스 · 오늘의 사설"},
        "contents": {"en": b["headline"] + " — " + lede, "ko": b["headline"] + " — " + lede},
        "url": SITE + "?from=push&d=" + t,
        "chrome_web_image": img,
        "big_picture": img,
        "chrome_web_icon": SITE + "icon-192.png",
        "web_push_topic": "daily-" + t,
    }
    req = urllib.request.Request("https://api.onesignal.com/notifications", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json",
                                          "Authorization": "Key " + os.environ["ONESIGNAL_REST_KEY"]})
    with urllib.request.urlopen(req, timeout=20) as r:
        print(r.status, r.read()[:300])
    cfg["lastSent"] = t
    json.dump(cfg, open("push.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    {"check": check, "render": render, "send": send}[sys.argv[1]]()
