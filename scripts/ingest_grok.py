"""김그록 사원의 4컷 만평(각본 JSON + 컷 그림)을 검사해 grok.json에 반영한다.

- 각본(글)은 김그록 사원, 그림은 지필태 대리(또는 그록)가 맡는다. 금로동은 검수·반영만 한다.
- grok.json은 data.json·jipiltae.json과 따로 저장한다. 예약 작업·GitHub Action은 이 파일을 쓰지 않는다.

사용:
  python scripts/ingest_grok.py 각본.json [--art 그림폴더 --art-by "지필태 대리"] [--dry-run]
  그림폴더에는 panel1.png ~ panel4.png (또는 strip.png 한 장을 4등분) 를 둔다.
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


if __name__ == "__main__":
    main()
