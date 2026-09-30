"""Build the daily 광고 낱말 퍼즐 grid from the advertising glossary adterms.json.

Each day (KST) a date-seeded sample of ~70 terms is tried and the best grid is kept. Writes puzzle.json:
  {date, size:[rows, cols], words:[{n, dir:"across"|"down", r, c, a, clue}], sig}
Each cell holds one Hangul syllable. Placement is deterministic for a given word list.
"""
import hashlib, json, random

N = 13


def fits(grid, a, r, c, d):
    dr, dc = (0, 1) if d == "across" else (1, 0)
    if r < 0 or c < 0 or r + dr * (len(a) - 1) >= N or c + dc * (len(a) - 1) >= N:
        return -1
    if (r - dr, c - dc) in grid or (r + dr * len(a), c + dc * len(a)) in grid:
        return -1
    cross = 0
    touch = 0
    for i, ch in enumerate(a):
        rr, cc = r + dr * i, c + dc * i
        g = grid.get((rr, cc))
        if g:
            if g[0] != ch or g[1] != ("down" if d == "across" else "across"):
                return -1
            cross += 1
        else:
            for sr, sc in ((dc, dr), (-dc, -dr)):
                if (rr + sr, cc + sc) in grid:
                    touch += 1
    # 한국식 낱말퍼즐: 옆 칸이 붙는 건 허용하되 너무 많이 붙으면 헷갈리므로 제한
    if touch > 0:
        return -1
    return cross


def put(grid, placed, w, r, c, d):
    grid = dict(grid)
    dr, dc = (0, 1) if d == "across" else (1, 0)
    for i, ch in enumerate(w["a"]):
        key = (r + dr * i, c + dc * i)
        grid[key] = (ch, "both") if key in grid else (ch, d)
    return grid, placed + [{"a": w["a"], "clue": w["c"], "r": r, "c": c, "dir": d}]


def ends_ok(g, p):
    for x in p:
        dr, dc = (0, 1) if x["dir"] == "across" else (1, 0)
        if (x["r"] - dr, x["c"] - dc) in g or (x["r"] + dr * len(x["a"]), x["c"] + dc * len(x["a"])) in g:
            return False
    return True


def build(words, seed, beam=200):
    """Beam search: keep the best partial grids, add one crossing word at a time."""
    rnd = random.Random(seed)
    starts = []
    for w in sorted(words, key=lambda w: -len(w["a"])):
        g, p = put({}, [], w, N // 2, max(0, (N - len(w["a"])) // 2), "across")
        starts.append((g, p))
    states, best = starts, max(starts, key=lambda s: len(s[1]))

    def score(st):
        g, p = st
        rs = [r for r, _ in g]; cs = [c for _, c in g]
        area = (max(rs) - min(rs) + 1) * (max(cs) - min(cs) + 1)
        both = sum(1 for v in g.values() if v[1] == "both")
        adj = sum(1 for (r, c) in g for (a, b) in ((r + 1, c), (r, c + 1)) if (a, b) in g)
        return len(p) * 100 + both * 10 - area * 0.5 - adj * 3 + rnd.random()

    for _ in range(len(words)):
        nxt = []
        seen = set()
        for g, p in states:
            used = {x["a"] for x in p}
            for w in words:
                if w["a"] in used:
                    continue
                for (gr, gc), (ch, _) in g.items():
                    for i, wc in enumerate(w["a"]):
                        if wc != ch:
                            continue
                        for d in ("across", "down"):
                            r, c = (gr, gc - i) if d == "across" else (gr - i, gc)
                            if fits(g, w["a"], r, c, d) > 0:
                                ng, np_ = put(g, p, w, r, c, d)
                                if not ends_ok(ng, np_):
                                    continue
                                key = frozenset((k, v[0]) for k, v in ng.items())
                                if key in seen:
                                    continue
                                seen.add(key)
                                nxt.append((ng, np_))
        if not nxt:
            break
        nxt.sort(key=score, reverse=True)
        states = nxt[:beam]
        if len(states[0][1]) > len(best[1]) or score(states[0]) > score(best):
            best = states[0]
    return best[1], best[0]


def pick(bank, date, k):
    """Date-seeded sample of glossary terms, dropping any word contained in another."""
    rnd = random.Random("adterms-" + date + "-" + str(k))
    cand = rnd.sample(bank, min(len(bank), 70))
    return [w for w in cand if not any(o is not w and w["a"] in o["a"] for o in cand)]


def main():
    from datetime import datetime, timezone, timedelta
    date = datetime.now(timezone(timedelta(hours=9))).strftime("%Y-%m-%d")
    bank = [w for w in json.load(open("adterms.json", encoding="utf-8"))["words"] if 2 <= len(w["a"]) <= 6 and w.get("c")]
    sig = hashlib.md5((date + json.dumps(bank, ensure_ascii=False, sort_keys=True)).encode()).hexdigest()[:10]
    try:
        old = json.load(open("puzzle.json", encoding="utf-8"))
        if old.get("sig") == sig:
            return
    except Exception:
        pass
    best = None
    for k in range(8):
        words = pick(bank, date, k)
        placed, grid = build(words, sig + str(k), beam=120)
        rs = [r for r, _ in grid]; cs = [c for _, c in grid]
        area = (max(rs) - min(rs) + 1) * (max(cs) - min(cs) + 1)
        score = len(placed) * 10 - area * 0.05
        if not best or score > best[0]:
            best = (score, placed, grid, words)
        if len(placed) >= 18:
            break
    _, placed, grid, words = best
    # trim to the used area
    rs = [r for r, _ in grid]; cs = [c for _, c in grid]
    r0, c0 = min(rs), min(cs)
    for p in placed:
        p["r"] -= r0; p["c"] -= c0
    rows, cols = max(rs) - r0 + 1, max(cs) - c0 + 1
    # numbering: row-major by start cell
    starts = sorted({(p["r"], p["c"]) for p in placed})
    num = {s: i + 1 for i, s in enumerate(starts)}
    out = [{"n": num[(p["r"], p["c"])], "dir": p["dir"], "r": p["r"], "c": p["c"], "a": p["a"], "clue": p["clue"]} for p in placed]
    out.sort(key=lambda p: (p["dir"], p["n"]))
    puzzle = {"date": date, "size": [rows, cols], "words": out, "sig": sig}
    json.dump(puzzle, open("puzzle.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("puzzle:", len(out), "words on", rows, "x", cols)


if __name__ == "__main__":
    main()
