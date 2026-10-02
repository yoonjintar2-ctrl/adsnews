"""제민아 대리(Gemini)의 원고를 검사해 gemini.json에 반영한다.

- 영상 해부: {"video": {"url": 오늘의 캠페인 URL, "videoUrl": 영상 URL, "timeline": [{"t": "0:00–0:03", "text": "…"}], "notes": ["…"]}}
- 자기소개: {"intro": "…"}
- gemini.json은 data.json·jipiltae.json·grok.json과 따로 저장한다. 금로동은 검수·반영만 한다.

사용: python scripts/ingest_gemini.py 원고.json [--dry-run]
"""
import argparse, json, os, shutil, sys
sys.path.insert(0, os.path.dirname(__file__))
from jp_common import now_kst, load, dump

GM_FILE = "gemini.json"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("manuscript")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    M = json.load(open(a.manuscript, encoding="utf-8"))
    gm = load(GM_FILE, {}) or {}
    gm.setdefault("author", {"name": "제민아", "role": "대리", "ai": "Gemini (Google)"})
    stamp = now_kst().isoformat(timespec="seconds")
    date = M.get("edition") or now_kst().strftime("%Y-%m-%d")
    V = M.get("video")
    if V:
        data = load("data.json", {})
        feat = next((c for c in data.get("campaigns") or [] if c.get("feature")), {})
        if V.get("url") != feat.get("url"):
            print("⚠ 오늘의 캠페인 URL과 달라요 — 화면에는 같은 캠페인일 때만 나와요")
        tl = [{"t": str(r.get("t", "")).strip(), "text": " ".join(str(r.get("text", "")).split())} for r in V.get("timeline") or [] if r.get("text")]
        if not (3 <= len(tl) <= 8):
            sys.exit(f"타임라인은 3~8줄이어야 해요 (지금 {len(tl)}줄)")
        gm["video"] = {"date": date, "url": V.get("url"), "videoUrl": V.get("videoUrl") if str(V.get("videoUrl", "")).startswith("http") else "",
                       "timeline": tl, "notes": [" ".join(n.split()) for n in V.get("notes") or [] if n.strip()][:4], "at": stamp}
    if M.get("intro"):
        gm["author"]["intro"] = " ".join(M["intro"].split())
    if M.get("avatar"):
        gm["author"]["avatar"] = M["avatar"]
    gm["updatedAt"] = stamp
    if a.dry_run:
        print("검사 통과(dry-run)"); return
    dump(GM_FILE, gm)
    os.makedirs("gemini/manuscripts", exist_ok=True)
    shutil.copyfile(a.manuscript, f"gemini/manuscripts/{date}-{now_kst().strftime('%H%M')}.json")
    print("gemini.json 반영:", ", ".join(k for k in ("video", "intro", "avatar") if M.get(k)))


if __name__ == "__main__":
    main()
