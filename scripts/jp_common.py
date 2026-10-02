"""지필태(GPT 기반 기자) 공동 집필 — 공용 함수.

지필태 원고는 data.json(금로동·자동 수집 담당)과 완전히 분리해 jipiltae.json 한 파일에만 저장한다.
예약 작업과 GitHub Action은 이 파일을 쓰지 않는다(읽기·보관만). 그래서 서로 덮어쓰지 않는다.
"""
import hashlib, json, os, re
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
JP_FILE = "jipiltae.json"
JP_IMG = "img/jp"
AUTHOR = {"name": "지필태", "role": "GPT 기반 기자", "ai": "ChatGPT (OpenAI)"}


def now_kst():
    return datetime.now(KST)


def load(p, d=None):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return d


def dump(p, obj):
    os.makedirs(os.path.dirname(p) or ".", exist_ok=True)
    json.dump(obj, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def live_sig(item):
    """이슈 내용 지문: 제목·요약이 바뀌면 달라진다 → 지필태 코멘트를 다시 받아야 하는 이슈."""
    s = (item.get("title") or "") + "|" + (item.get("summary") or "")
    return hashlib.sha1(s.encode("utf-8")).hexdigest()[:12]


def empty_jp():
    return {"author": AUTHOR, "updatedAt": None, "editorial": None, "cartoon": None, "campaign": None,
            "trend": None, "hidden": None, "live": {}}


def feature_campaign(data):
    cs = data.get("campaigns") or []
    return next((c for c in cs if c.get("feature")), cs[0] if cs else {})


def clean_svg(v):
    v = (v or "").strip()
    if not v.startswith("<svg") or re.search(r"<script|\son\w+\s*=|javascript:|<foreignObject|xlink:href\s*=\s*\"http|href\s*=\s*\"http", v, re.I):
        return ""
    return v
