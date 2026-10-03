"""김그록 사원의 4컷 만평(각본 JSON + 컷 그림)을 검사해 grok.json에 반영한다.

- 각본(글)은 김그록 사원, 그림은 지필태 대리(또는 그록)가 맡는다. 금로동은 검수·반영만 한다.
- grok.json은 data.json·jipiltae.json과 따로 저장한다. 예약 작업·GitHub Action은 이 파일을 쓰지 않는다.

사용:
  python scripts/ingest_grok.py 각본.json [--art 그림폴더 --art-by "지필태 대리"] [--dry-run]
  그림폴더에는 panel1.png ~ panel4.png (또는 strip.png 한 장을 4등분) 를 둔다.
  python scripts/ingest_grok.py 밈.json [--art 그림폴더]      # '요즘 밈' 코너 ({"memes": [...]})
"""
import argparse, json, os, shutil, sys
sys.path.insert(0, os.path.dirname(__file__))
from jp_common import now_kst, load, dump

GK_FILE = "grok.json"
GK_IMG = "img/gk"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("--art", help="컷 그림 폴더 (panel1~4.png 또는 strip.png)")
    ap.add_argument("--art-by", default="")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    M = json.load(open(a.script, encoding="utf-8"))
    if M.get("xpulse") and not M.get("panels"):
        return ingest_xpulse(M, a)
    if M.get("live") and not M.get("panels"):
        return ingest_live(M, a)
    if M.get("memes") and not M.get("panels"):
        return ingest_memes(M, a)
    errs = []
    P = M.get("panels") or []
    if len(P) != 4:
        errs.append(f"컷은 정확히 4개여야 해요 (지금 {len(P)}개)")
    for i, p in enumerate(P, 1):
        for d in p.get("dialogue") or []:
            if len(d.get("line") or "") > 40:
                errs.append(f"{i}컷 대사가 너무 길어요: {d.get('line')}")
        if not (p.get("scene") or "").strip():
            errs.append(f"{i}컷 장면 설명이 비었어요")
    iss = M.get("issue") or {}
    if not iss.get("url", "").startswith("http"):
        errs.append("issue.url(출처)이 필요해요")
    if errs:
        print("\n".join("✗ " + e for e in errs)); sys.exit("반영하지 않았어요")
    date = M.get("edition") or now_kst().strftime("%Y-%m-%d")
    imgs = [None] * 4
    if a.art:
        from PIL import Image
        os.makedirs(GK_IMG, exist_ok=True)
        files = [os.path.join(a.art, f"panel{i}.png") for i in range(1, 5)]
        if all(os.path.exists(f) for f in files):
            srcs = [Image.open(f) for f in files]
        elif os.path.exists(os.path.join(a.art, "strip.png")):
            im = Image.open(os.path.join(a.art, "strip.png"))
            w, h = im.size
            srcs = [im.crop((w * i // 4, 0, w * (i + 1) // 4, h)) for i in range(4)] if w > h * 2 else \
                   [im.crop(((i % 2) * w // 2, (i // 2) * h // 2, (i % 2 + 1) * w // 2, (i // 2 + 1) * h // 2)) for i in range(4)]
        else:
            sys.exit("그림 폴더에 panel1~4.png 또는 strip.png가 없어요")
        for i, im in enumerate(srcs):
            im = im.convert("RGB")
            if im.width > 900:
                im = im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS)
            out = f"{GK_IMG}/strip-{date}-{i + 1}.jpg"
            if not a.dry_run:
                im.save(out, "JPEG", quality=86, optimize=True, progressive=True)
            imgs[i] = out
    if a.dry_run:
        print("검사 통과(dry-run)"); return
    gk = load(GK_FILE, {}) or {}
    gk.setdefault("author", {"name": "김그록", "role": "사원", "ai": "Grok (xAI)"})
    stamp = now_kst().isoformat(timespec="seconds")
    prev = gk.get("strip") or {}
    panels = []
    for i, p in enumerate(P):
        img = imgs[i] or ((prev.get("panels") or [{}] * 4)[i].get("img") if prev.get("date") == date and prev.get("title") == M.get("title") else None)
        panels.append({"scene": " ".join(p["scene"].split()), "dialogue": [{"who": d.get("who", ""), "line": d.get("line", "")} for d in p.get("dialogue") or []], "img": img})
    gk["strip"] = {"date": date, "title": M.get("title", ""), "issue": {"id": iss.get("id", ""), "title": iss.get("title", ""), "url": iss["url"]},
                   "cast": M.get("cast") or [], "panels": panels, "punchline": (M.get("punchline") or "").strip(),
                   "artBy": a.art_by or (prev.get("artBy") if prev.get("date") == date else ""), "model": M.get("model", "Grok"), "at": stamp}
    gk["updatedAt"] = stamp
    dump(GK_FILE, gk)
    os.makedirs("grok/manuscripts", exist_ok=True)
    shutil.copyfile(a.script, f"grok/manuscripts/{date}-{now_kst().strftime('%H%M')}.json")
    print("grok.json 반영:", M.get("title"), "/ 그림", sum(1 for x in imgs if x), "컷")


def ingest_xpulse(M, a):
    """X 반응 체크: {"xpulse": {"url": 오늘의 캠페인 URL, "temp", "summary", "quip", "links": []}}"""
    X = M["xpulse"]
    data = load("data.json", {})
    feat = next((c for c in data.get("campaigns") or [] if c.get("feature")), {})
    if X.get("url") != feat.get("url"):
        print("⚠ 오늘의 캠페인 URL과 달라요 — 화면에는 같은 캠페인일 때만 나와요")
    if X.get("temp") not in ("뜨거움", "따뜻함", "미지근함", "차가움", "반응 적음"):
        sys.exit("온도는 뜨거움/따뜻함/미지근함/차가움/반응 적음 중 하나")
    gk = load(GK_FILE, {}) or {}
    stamp = now_kst().isoformat(timespec="seconds")
    gk["xpulse"] = {"date": M.get("edition"), "url": X.get("url"), "temp": X["temp"], "summary": " ".join(X.get("summary", "").split()),
                    "quip": (X.get("quip") or "").strip(), "links": [u for u in X.get("links") or [] if u.startswith("http")][:3], "at": stamp}
    gk["updatedAt"] = stamp
    if not a.dry_run:
        dump(GK_FILE, gk)
    print("X 반응 체크 반영:", X["temp"])


def ingest_live(M, a):
    """실시간 이슈 한마디: {"live": [{"url": ..., "comment": ...}]} — URL이 지금 목록에 있어야 반영."""
    data = load("data.json", {})
    cur = {x.get("url"): x for x in data.get("live") or []}
    gk = load(GK_FILE, {}) or {}
    gk.setdefault("author", {"name": "김그록", "role": "사원", "ai": "Grok (xAI)"})
    live = gk.setdefault("live", {})
    stamp = now_kst().isoformat(timespec="seconds")
    n = 0
    for x in M["live"]:
        u, c = x.get("url"), " ".join((x.get("comment") or "").split())
        if u not in cur or not c:
            print("건너뜀:", u); continue
        if len(c) > 70:
            print(f"⚠ 길어요({len(c)}자):", c)
        live[u] = {"comment": c, "title": cur[u].get("title", ""), "at": stamp}
        n += 1
    keep = set(cur) | set(list(live)[-300:])
    gk["live"] = {k: v for k, v in live.items() if k in keep}
    gk["updatedAt"] = stamp
    if a.dry_run:
        print("검사 통과(dry-run)", n); return
    dump(GK_FILE, gk)
    print("김그록 한마디", n, "건 반영")




VIDEO_RE = {"youtube": r"^[\w-]{11}$", "tiktok": r"^\d{8,25}$", "instagram": r"^[\w-]{5,40}$"}


def ingest_memes(M, a):
    """'요즘 밈' 코너: 글은 김그록 사원, 원본 영상 확인은 금로동, 영상이 없으면 그림은 지필태 대리.
    {"edition": "YYYY-MM-DD", "memes": [{"name", "what", "usage", "origin", "quip",
      "video": {"platform": "youtube|tiktok|instagram", "id", "title", "channel", "vertical": bool, "start": 초, "note": "원본/화제가 된 방송 등"},
      "img": "그림 파일명(--art 폴더 안)", "imgAlt", "imgBy": "지필태 대리",
      "links": [{"t", "url"}], "tip": "금로동 광고인 포인트(선택)"}]}
    원본 영상은 공식 플레이어(유튜브·틱톡·인스타 임베드)로만 붙인다. 내려받아 다시 올리지 않는다."""
    import re
    errs, out = [], []
    date = M.get("edition") or now_kst().strftime("%Y-%m-%d")
    for i, m in enumerate(M["memes"][:4], 1):
        name = (m.get("name") or "").strip()
        what = " ".join((m.get("what") or "").split())
        if not name or not what:
            errs.append(f"{i}번 밈: name·what이 필요해요"); continue
        if len(what) > 260:
            errs.append(f"{i}번 밈 설명이 너무 길어요({len(what)}자)")
        v = m.get("video") or None
        if v:
            pf = v.get("platform")
            if pf not in VIDEO_RE or not re.match(VIDEO_RE[pf], str(v.get("id") or "")):
                errs.append(f"{i}번 밈 영상 id/platform 확인: {v}")
            v = {k: v[k] for k in ("platform", "id", "title", "channel", "vertical", "start", "note") if v.get(k) not in (None, "")}
        img = None
        if m.get("img"):
            src = os.path.join(a.art or ".", m["img"])
            if not os.path.exists(src):
                errs.append(f"{i}번 밈 그림 파일이 없어요: {src}")
            elif not a.dry_run:
                img = put_meme_img(src, date, i)
        if not v and not img and not m.get("imgKeep"):
            errs.append(f"{i}번 밈: 원본 영상이나 설명 그림 중 하나는 있어야 해요")
        links = [{"t": l.get("t", "원본"), "url": l["url"]} for l in m.get("links") or [] if str(l.get("url", "")).startswith("http")][:3]
        out.append({k: x for k, x in {"name": name, "what": what, "usage": " ".join((m.get("usage") or "").split()),
                    "origin": " ".join((m.get("origin") or "").split()), "quip": (m.get("quip") or "").strip(),
                    "video": v, "img": img or m.get("imgKeep"), "imgAlt": (m.get("imgAlt") or "").strip(), "imgBy": m.get("imgBy") or ("지필태 대리" if img else ""),
                    "links": links, "tip": (m.get("tip") or "").strip()}.items() if x})
    if errs:
        sys.exit("\n".join(["✗ " + e for e in errs]))
    gk = load(GK_FILE, {}) or {}
    stamp = now_kst().isoformat(timespec="seconds")
    gk["memes"] = {"date": date, "items": out, "at": stamp}
    gk["updatedAt"] = stamp
    if not a.dry_run:
        dump(GK_FILE, gk)
    print("요즘 밈 반영:", ", ".join(x["name"] for x in out), "/ 영상", sum(1 for x in out if x.get("video")), "· 그림", sum(1 for x in out if x.get("img")))


def put_meme_img(src, date, i):
    from PIL import Image
    os.makedirs(GK_IMG, exist_ok=True)
    im = Image.open(src).convert("RGB")
    if im.width > 1400:
        im = im.resize((1400, round(im.height * 1400 / im.width)))
    rel = f"{GK_IMG}/meme-{date}-{i}.jpg"
    im.save(rel, quality=86, optimize=True)
    return rel + "?v=" + now_kst().strftime("%H%M")

if __name__ == "__main__":
    main()
