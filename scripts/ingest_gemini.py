"""재미나 대리(Gemini)의 원고를 검사해 gemini.json에 반영한다.

- 캠페인 족보(리서치): {"lineage": {"url": 오늘의 캠페인 URL, "rows": [{"year": "2022", "name": "…", "desc": "…", "src": "https://…"}], "flow": "…"}}
- 자기소개: {"intro": "…"}
- gemini.json은 data.json·jipiltae.json·grok.json과 따로 저장한다. 금로동은 검수·반영만 한다(글을 대신 쓰지 않는다).

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
    gm.setdefault("author", {})
    gm["author"].update({"name": "재미나", "role": "대리", "ai": "Gemini (Google)"})
    stamp = now_kst().isoformat(timespec="seconds")
    date = M.get("edition") or now_kst().strftime("%Y-%m-%d")
    L = M.get("lineage")
    if L:
        data = load("data.json", {})
        feat = next((c for c in data.get("campaigns") or [] if c.get("feature")), {})
        if L.get("url") != feat.get("url"):
            print("⚠ 오늘의 캠페인 URL과 달라요 — 화면에는 같은 캠페인일 때만 나와요")
        rows = []
        for r in L.get("rows") or []:
            row = {k: " ".join(str(r.get(k, "")).split()) for k in ("year", "name", "desc", "src")}
            if not row["src"].startswith("http"):
                print("✗ 출처 없는 줄은 뺐어요:", row["name"]); continue
            if not (row["year"] and row["name"]):
                continue
            rows.append(row)
        if not (2 <= len(rows) <= 6):
            sys.exit(f"족보는 출처 있는 줄이 2~6줄이어야 해요 (지금 {len(rows)}줄)")
        gm["lineage"] = {"date": date, "url": L.get("url"), "rows": rows, "flow": " ".join(str(L.get("flow", "")).split()), "at": stamp}
    gm.pop("video", None)
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
    print("gemini.json 반영:", ", ".join(k for k in ("lineage", "intro", "avatar") if M.get(k)))


if __name__ == "__main__":
    main()
