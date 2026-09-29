import json, re, urllib.request
HDR = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36", "Accept-Language": "ko-KR,ko;q=0.9", "Content-Type": "application/json"}
CTX = {"client": {"clientName": "WEB", "clientVersion": "2.20250925.01.00", "hl": "ko", "gl": "KR"}}
def post(ep, body):
    r = urllib.request.Request(f"https://www.youtube.com/youtubei/v1/{ep}?prettyPrint=false", data=json.dumps(dict(body, context=CTX)).encode(), headers=HDR)
    with urllib.request.urlopen(r, timeout=10) as f: return f.read().decode()
out = {}
for vid in ["zKs7uOia0uQ", "YkNkVtzTl0A", "xWFRGzWJLwA", "ej852z1HjDk", "GM8yYSJvjrw"]:
    o = {}
    try:
        x = post("next", {"videoId": vid})
        o["next_len"] = len(x)
        o["next_hits"] = re.findall(r'"(?:originalViewCount|viewCount|shortViewCount)"\s*:\s*(\{[^{}]{0,120}|"[^"]{0,40}")', x)[:6]
        o["factoid"] = re.findall(r'"factoidRenderer".{0,300}', x)[:2]
        o["err"] = re.findall(r'"(?:status|reason)":"[^"]{0,60}"', x)[:3]
    except Exception as e:
        o["next_err"] = str(e)[:100]
    try:
        x = post("updated_metadata", {"videoId": vid})
        o["upd"] = re.findall(r'"viewCount".{0,160}', x)[:2] or x[:200]
    except Exception as e:
        o["upd_err"] = str(e)[:100]
    out[vid] = o
json.dump(out, open("probe.json", "w"), ensure_ascii=False, indent=1)
