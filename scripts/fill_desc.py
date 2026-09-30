"""One-line descriptions for the videos shown in 요즘 뜨는 영상.

Stores live.json["desc"] = {videoId: "한 줄 설명"}. Descriptions come from
YouTube's own watch-next / player endpoints (no login). Runs inside the
trends Action; each run fills at most ~40 missing ids within ~60 s.
"""
import json, re, time, urllib.request

HDR = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36",
       "Accept-Language": "ko-KR,ko;q=0.9", "Cookie": "CONSENT=YES+1; SOCS=CAI", "Content-Type": "application/json"}
CTX = {"client": {"clientName": "WEB", "clientVersion": "2.20250925.01.00", "hl": "ko", "gl": "KR"}}
URL = re.compile(r"https?://\S+|www\.\S+")
SKIP = re.compile(r"^(#|@|\*|※|▶|►|http|구독|subscribe|follow|instagram|facebook|tiktok|문의|contact|copyright|ⓒ|©|\[?광고\]?$)", re.I)


def post(ep, vid):
    body = json.dumps({"context": CTX, "videoId": vid}).encode()
    req = urllib.request.Request("https://www.youtube.com/youtubei/v1/%s?prettyPrint=false" % ep, data=body, headers=HDR)
    with urllib.request.urlopen(req, timeout=8) as r:
        return r.read().decode("utf-8", "replace")


def raw_desc(vid):
    try:
        x = post("next", vid)
        m = re.search(r'"attributedDescription":\{"content":"((?:[^"\\]|\\.)*)"', x)
        if m:
            return json.loads('"' + m.group(1) + '"')
    except Exception as e:
        print("desc next", vid, e)
    try:
        j = json.loads(post("player", vid))
        return (j.get("videoDetails") or {}).get("shortDescription") or ""
    except Exception as e:
        print("desc player", vid, e)
    return None


def one_line(text, title=""):
    for ln in (text or "").splitlines():
        ln = URL.sub("", ln)
        ln = re.sub(r"#\S+", "", ln)
        ln = re.sub(r"\s+", " ", ln).strip(" -–—|·:")
        if len(ln) < 6 or SKIP.search(ln) or not re.search(r"[가-힣A-Za-z]", ln):
            continue
        if title and ln.replace(" ", "") == title.replace(" ", ""):
            continue
        return ln[:90]
    return ""


def wanted(live, data):
    ids = []
    d = (live.get("disc") or {}).get("items") or {}
    ids += list(d.keys())
    ids += list((live.get("adMonth") or {}).keys())
    T = data.get("trends") or {}
    for k in ("poolDaily", "adPoolDaily"):
        ids += [x.get("id") for x in T.get(k) or [] if x.get("id")]
    for g in T.get("adMonthlyGroup") or []:
        if isinstance(g, dict):
            ids.append(g.get("id"))
    # most recently discovered first
    seen, out = set(), []
    for i in reversed(ids):
        if i and i not in seen:
            seen.add(i); out.append(i)
    return out


def main():
    live = json.load(open("live.json", encoding="utf-8"))
    data = json.load(open("data.json", encoding="utf-8"))
    D = live.get("desc") or {}
    titles = {k: v.get("t", "") for k, v in ((live.get("disc") or {}).get("items") or {}).items()}
    ids = wanted(live, data)
    t0, n = time.time(), 0
    for vid in ids:
        if vid in D:
            continue
        if n >= 40 or time.time() - t0 > 60:
            break
        r = raw_desc(vid)
        n += 1
        if r is None:
            continue
        D[vid] = one_line(r, titles.get(vid, ""))
    keep = set(ids)
    live["desc"] = {k: v for k, v in D.items() if k in keep}
    json.dump(live, open("live.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("desc: fetched", n, "stored", len(live["desc"]))


if __name__ == "__main__":
    main()
