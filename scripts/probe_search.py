import json, re, urllib.request
HDR = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36", "Accept-Language": "ko-KR,ko;q=0.9", "Content-Type": "application/json"}
CTX = {"client": {"clientName": "WEB", "clientVersion": "2.20250925.01.00", "hl": "ko", "gl": "KR"}}
def post(ep, body):
    r = urllib.request.Request(f"https://www.youtube.com/youtubei/v1/{ep}?prettyPrint=false", data=json.dumps(dict(body, context=CTX)).encode(), headers=HDR)
    with urllib.request.urlopen(r, timeout=20) as f: return json.loads(f.read())
def walk(o, key, out):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == key: out.append(v)
            else: walk(v, key, out)
    elif isinstance(o, list):
        for v in o: walk(v, key, out)
    return out
out = {}
for q, sp in [("ㅋㅋ", "CAMSAggC"), ("#shorts", "CAMSAggC"), ("뉴스", "CAMSAggC"), ("광고", "CAMSAggC"), ("CF", "CAMSAggC"), ("먹방", "EgIIAg%3D%3D")]:
    try:
        j = post("search", {"query": q, "params": sp.replace("%3D", "=")})
        vids = walk(j, "videoRenderer", [])
        reels = walk(j, "reelItemRenderer", []) + walk(j, "shortsLockupViewModel", [])
        out[q] = {"videos": len(vids), "reels": len(reels), "sample": [
            [v.get("videoId"), "".join(r.get("text", "") for r in v.get("title", {}).get("runs", []))[:40], (v.get("viewCountText") or {}).get("simpleText"), (v.get("publishedTimeText") or {}).get("simpleText"), "".join(r.get("text", "") for r in (v.get("ownerText") or {}).get("runs", []))] for v in vids[:6]]}
    except Exception as e:
        out[q] = "ERR " + str(e)[:120]
for bid in ["FEtrending", "FEexplore"]:
    try:
        j = post("browse", {"browseId": bid}); out[bid] = {"videos": len(walk(j, "videoRenderer", [])), "keys": list(j.keys())[:6]}
    except Exception as e: out[bid] = "ERR " + str(e)[:100]
json.dump(out, open("probe.json", "w"), ensure_ascii=False, indent=1)
