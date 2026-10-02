"""지필태 원고(JSON + 그림 파일)를 검사해 jipiltae.json에 반영한다.

사용법
  python scripts/ingest_jipiltae.py 원고.json [--assets 그림폴더]   # 검사 후 반영 (숨은그림은 '검증 대기')
  python scripts/ingest_jipiltae.py --approve-hidden                  # 미리보기를 눈으로 확인한 뒤 숨은그림 공개
  python scripts/ingest_jipiltae.py 원고.json --dry-run               # 검사만

원고 형식은 jipiltae/FORMAT.md 참고. 원고에 있는 항목만 바꾸고, 없는 항목은 그대로 둔다.
실시간 이슈 코멘트는 기사 URL 단위로 합친다(같은 URL은 새 코멘트로 교체, 나머지는 유지).
원본 원고는 jipiltae/manuscripts/에 날짜별로 보관한다.
"""
import argparse, json, os, re, shutil, sys
sys.path.insert(0, os.path.dirname(__file__))
from jp_common import (JP_FILE, JP_IMG, AUTHOR, now_kst, load, dump, live_sig, empty_jp,
                       feature_campaign, clean_svg)

IMG_EXT = {".png", ".jpg", ".jpeg", ".webp", ".svg"}
errors, warns = [], []


def err(m): errors.append(m)
def warn(m): warns.append(m)


def chk_len(name, t, lo, hi):
    n = len(re.sub(r"\s", "", t or ""))
    if n < lo or n > hi:
        warn(f"{name}: 공백 뺀 글자 수 {n} (권장 {lo}~{hi})")
    return bool(t and t.strip())


def chk_sources(name, src):
    ok = [s for s in (src or []) if isinstance(s, dict) and re.match(r"https?://", s.get("url") or "")]
    if not ok:
        err(f"{name}: 출처(sources)에 기사·보고서 URL이 하나 이상 필요해요")
    return [{"t": s.get("t") or s.get("title") or "출처", "url": s["url"]} for s in ok]


def put_image(src_dir, fname, kind, date):
    if not fname:
        return None
    p = os.path.join(src_dir, fname)
    ext = os.path.splitext(fname)[1].lower()
    if ext not in IMG_EXT:
        err(f"{kind}: 지원하지 않는 그림 형식 {fname}")
        return None
    if not os.path.exists(p):
        err(f"{kind}: 그림 파일을 찾을 수 없어요 — {fname}")
        return None
    if os.path.getsize(p) > 4 * 1024 * 1024:
        err(f"{kind}: 그림이 4MB를 넘어요 — {fname}")
        return None
    if ext == ".svg":
        s = clean_svg(open(p, encoding="utf-8").read())
        if not s:
            err(f"{kind}: SVG에 스크립트·외부 링크가 있거나 <svg>로 시작하지 않아요")
            return None
    os.makedirs(JP_IMG, exist_ok=True)
    out = f"{JP_IMG}/{kind}-{date}{'.jpg' if ext == '.jpeg' else ext}"
    if ext in (".png", ".jpg", ".jpeg", ".webp"):
        try:  # 너무 큰 그림은 가로 1600px로 줄인다
            from PIL import Image
            im = Image.open(p)
            if im.width > 1600:
                im = im.resize((1600, round(im.height * 1600 / im.width)))
            im.save(out)
            return out
        except Exception:
            pass
    shutil.copyfile(p, out)
    return out


def img_size(path):
    if path.endswith(".svg"):
        m = re.search(r'viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)', open(path, encoding="utf-8").read())
        return (float(m.group(1)), float(m.group(2))) if m else (None, None)
    from PIL import Image
    im = Image.open(path)
    return im.width, im.height


def svg_targets(path):
    """SVG 안의 <g id="hidden-1" data-name="열쇠"> 같은 묶음의 실제 위치를 브라우저로 재서 정답 좌표를 만든다."""
    from playwright.sync_api import sync_playwright
    svg = open(path, encoding="utf-8").read()
    with sync_playwright() as p:
        b = None
        for kw in ({"channel": "chrome"}, {}, {"executable_path": "/opt/pw-browsers/chromium"}):
            try:
                b = p.chromium.launch(**kw); break
            except Exception:
                continue
        pg = b.new_page()
        pg.set_content(f"<html><body style='margin:0'>{svg}</body></html>")
        res = pg.evaluate("""()=>[...document.querySelectorAll('svg [id^="hidden-"],svg [data-name]')].map(e=>{const b=e.getBBox();
          return {name:e.getAttribute('data-name')||e.id,x:b.x+b.width/2,y:b.y+b.height/2,w:b.width,h:b.height}})""")
        b.close()
    out, seen = [], set()
    for t in res:
        if t["name"] in seen or t["w"] <= 0:
            continue
        seen.add(t["name"])
        out.append({"name": t["name"], "x": round(t["x"], 1), "y": round(t["y"], 1),
                    "r": round(max(14, 0.6 * max(t["w"], t["h"])), 1), "w": round(t["w"], 1), "h": round(t["h"], 1)})
    return out


def check_targets(ts, w, h):
    if not (6 <= len(ts) <= 10):
        err(f"숨은그림: 찾을 물건은 6~10개여야 해요 (지금 {len(ts)}개)")
    names = [t.get("name") for t in ts]
    if len(set(names)) != len(names) or not all(names):
        err("숨은그림: 물건 이름이 비었거나 겹쳐요")
    for t in ts:
        try:
            x, y, r = float(t["x"]), float(t["y"]), float(t.get("r") or 0)
        except Exception:
            err(f"숨은그림: 좌표가 숫자가 아니에요 — {t}"); continue
        if not (0 <= x <= w and 0 <= y <= h):
            err(f"숨은그림: '{t.get('name')}' 좌표가 그림 밖이에요 ({x},{y})")
        if r < 10 or r > min(w, h) * 0.12:
            warn(f"숨은그림: '{t.get('name')}' 정답 반경 {r}이 너무 작거나 커요")
        if w - 70 < x and h - 70 < y:
            warn(f"숨은그림: '{t.get('name')}'이 오른쪽 아래 낙관 자리와 겹쳐요")
    for i, a in enumerate(ts):
        for b in ts[i + 1:]:
            try:
                if ((float(a["x"]) - float(b["x"])) ** 2 + (float(a["y"]) - float(b["y"])) ** 2) ** .5 < float(a["r"]) + float(b["r"]) * .5:
                    warn(f"숨은그림: '{a['name']}'과 '{b['name']}'이 너무 가까워 한 번에 같이 맞을 수 있어요")
            except Exception:
                pass


def preview_hidden(img, ts, w, h, out):
    """정답 위치를 빨간 원으로 표시한 미리보기 — 사람이 눈으로 확인한다."""
    from playwright.sync_api import sync_playwright
    href = os.path.abspath(img)
    marks = "".join(f'<circle cx="{t["x"]}" cy="{t["y"]}" r="{t["r"]}" fill="none" stroke="red" stroke-width="3"/>'
                    f'<text x="{t["x"]}" y="{float(t["y"]) - float(t["r"]) - 4}" font-size="14" fill="red" text-anchor="middle" font-weight="700">{t["name"]}</text>'
                    for t in ts)
    page = (f"<html><body style='margin:0'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' width='{min(1200, w * 2)}'>"
            f"<image href='file://{href}' width='{w}' height='{h}'/>{marks}</svg></body></html>")
    with sync_playwright() as p:
        b = None
        for kw in ({"channel": "chrome"}, {}, {"executable_path": "/opt/pw-browsers/chromium"}):
            try:
                b = p.chromium.launch(**kw); break
            except Exception:
                continue
        pg = b.new_page(viewport={"width": 1200, "height": 900})
        pg.set_content(page); pg.wait_for_timeout(400)
        pg.locator("svg").screenshot(path=out)
        b.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("manuscript", nargs="?")
    ap.add_argument("--assets", default=None)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--approve-hidden", action="store_true")
    a = ap.parse_args()

    jp = load(JP_FILE) or empty_jp()
    if a.approve_hidden:
        h = jp.get("hidden")
        if not h:
            sys.exit("검증할 숨은그림이 없어요")
        h["verified"] = now_kst().isoformat(timespec="seconds")
        dump(JP_FILE, jp)
        print("숨은그림 공개:", h.get("date"), h.get("title"))
        return

    M = load(a.manuscript)
    if not isinstance(M, dict):
        sys.exit("원고 JSON을 읽을 수 없어요")
    src_dir = a.assets or os.path.dirname(os.path.abspath(a.manuscript))
    data = load("data.json", {})
    date = M.get("edition") or now_kst().strftime("%Y-%m-%d")
    if not re.fullmatch(r"\d{4}-\d\d-\d\d", date):
        sys.exit("edition 날짜 형식은 YYYY-MM-DD")
    if (M.get("author") or "지필태") != "지필태":
        err("author는 '지필태'여야 해요")
    model = M.get("model") or "ChatGPT"
    stamp = now_kst().isoformat(timespec="seconds")
    new = json.loads(json.dumps(jp))
    new["author"] = dict(AUTHOR, model=model)

    E = M.get("editorial")
    if E:
        if chk_len("사설 본문", E.get("body"), 700, 1300) and E.get("headline"):
            gh = (data.get("brief") or {}).get("headline", "")
            if gh and len(set(gh.split()) & set(E["headline"].split())) >= 3:
                warn("사설: 금로동 사설 제목과 단어가 많이 겹쳐요 — 독립 주제인지 확인")
            new["editorial"] = {"date": date, "headline": E["headline"].strip(), "lede": (E.get("lede") or "").strip(),
                                "body": " ".join(E["body"].split()), "sources": chk_sources("사설", E.get("sources")),
                                "model": model, "at": stamp}
        else:
            err("사설: headline과 body가 필요해요")

    C = M.get("cartoon")
    if C:
        p = put_image(src_dir, C.get("file"), "cartoon", date) if not a.dry_run else C.get("file")
        if p:
            new["cartoon"] = {"date": date, "for": date, "img": p, "caption": (C.get("caption") or "").strip(),
                              "bubble": (C.get("bubble") or "").strip(), "alt": (C.get("alt") or C.get("caption") or "만평").strip(),
                              "forHeadline": (data.get("brief") or {}).get("headline", ""), "model": model, "at": stamp}

    K = M.get("campaign")
    if K:
        feat = feature_campaign(data)
        if K.get("url") != feat.get("url"):
            warn(f"캠페인: 오늘의 캠페인과 URL이 달라요 (오늘: {feat.get('brand')} {feat.get('title')}) — 화면에는 같은 캠페인일 때만 나와요")
        if chk_len("캠페인 분석", K.get("review"), 250, 480):
            new["campaign"] = {"date": date, "url": K.get("url"), "title": feat.get("title") if K.get("url") == feat.get("url") else K.get("title", ""),
                               "review": " ".join(K["review"].split()), "model": model, "at": stamp}

    L = M.get("live") or []
    if L:
        cur = {x.get("url"): x for x in data.get("live") or []}
        n = 0
        for x in L:
            u, c = x.get("url"), (x.get("comment") or "").strip()
            if u not in cur:
                warn(f"실시간 코멘트: 지금 목록에 없는 기사라 건너뜀 — {u}"); continue
            if not (20 <= len(c) <= 140):
                warn(f"실시간 코멘트 길이 {len(c)}자 — {cur[u].get('title')}")
            if not c:
                continue
            new["live"][u] = {"comment": c, "title": cur[u].get("title", ""), "sig": live_sig(cur[u]), "at": stamp, "model": model}
            n += 1
        print("실시간 코멘트", n, "건 반영")
    # 목록에서 빠진 지 오래된 코멘트 정리(최근 300건만)
    keep = {x.get("url") for x in data.get("live") or []}
    old = sorted((k for k in new["live"] if k not in keep), key=lambda k: new["live"][k].get("at", ""))
    for k in old[:-300] if len(old) > 300 else []:
        new["live"].pop(k, None)

    T = M.get("trend")
    if T:
        used = set()
        for e in load("trendnotes.json", []) or []:
            used |= set(e.get("tags") or [])
        used |= {t.get("tag") for t in (data.get("trendNotes") or {}).get("items") or []}
        if T.get("tag") in used:
            err(f"트렌드: '#{T.get('tag')}'는 최근에 이미 다룬 주제예요")
        if chk_len("트렌드 본문", T.get("body"), 180, 360) and T.get("tag") and T.get("title"):
            img = put_image(src_dir, T.get("file"), "trend", date) if (T.get("file") and not a.dry_run) else None
            new["trend"] = {"date": date, "tag": T["tag"].lstrip("#"), "title": T["title"], "body": " ".join(T["body"].split()),
                            "point": (T.get("point") or "").strip(), "sources": chk_sources("트렌드", T.get("sources")),
                            "img": img, "model": model, "at": stamp}
        else:
            err("트렌드: tag, title, body가 필요해요")

    Hd = M.get("hidden")
    if Hd and not a.dry_run:
        p = put_image(src_dir, Hd.get("file"), "hidden", date)
        if p:
            w, h = img_size(p)
            if not w:
                err("숨은그림: 그림 크기를 알 수 없어요 (SVG는 viewBox 필요)")
            else:
                ts = svg_targets(p) if p.endswith(".svg") and not Hd.get("targets") else (Hd.get("targets") or [])
                check_targets(ts, w, h)
                prev = f"jipiltae/preview/hidden-{date}.png"
                os.makedirs("jipiltae/preview", exist_ok=True)
                preview_hidden(p, ts, w, h, prev)
                new["hidden"] = {"date": date, "title": Hd.get("title", ""), "inspired": Hd.get("inspired", ""),
                                 "img": p, "w": w, "h": h, "targets": [{k: t[k] for k in ("name", "x", "y", "r")} for t in ts],
                                 "verified": None, "preview": prev, "model": model, "at": stamp}
                print("숨은그림 미리보기:", prev, "— 눈으로 확인 후 --approve-hidden")

    if M.get("avatar") and not a.dry_run:
        p = put_image(src_dir, M["avatar"].get("file"), "avatar", "profile")
        if p:
            new["author"]["avatar"] = p

    for w_ in warns:
        print("⚠", w_)
    for e in errors:
        print("✗", e)
    if errors:
        sys.exit("반영하지 않았어요 — 위 오류를 지필태에게 돌려보내 주세요")
    if a.dry_run:
        print("검사 통과(dry-run)"); return
    new["updatedAt"] = stamp
    dump(JP_FILE, new)
    os.makedirs("jipiltae/manuscripts", exist_ok=True)
    shutil.copyfile(a.manuscript, f"jipiltae/manuscripts/{date}-{now_kst().strftime('%H%M')}.json")
    print("jipiltae.json 반영 완료:", ", ".join(k for k in ("editorial", "cartoon", "campaign", "trend", "hidden") if M.get(k)),
          f"/ 실시간 {len(L)}건")


if __name__ == "__main__":
    main()
