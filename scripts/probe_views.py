import json, re, urllib.request
VID = "GM8yYSJvjrw"
out = {}
def req(url, data=None, hdr=None):
    h = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36", "Accept-Language": "ko-KR,ko;q=0.9"}
    h.update(hdr or {})
    r = urllib.request.Request(url, data=json.dumps(data).encode() if data else None, headers=h)
    with urllib.request.urlopen(r, timeout=20) as f:
        return f.read().decode("utf-8", "replace")
def probe(name, fn):
    try: out[name] = fn()
    except Exception as e: out[name] = "ERR " + str(e)[:100]
def vc(x):
    m = re.search(r'"viewCount"\s*:\s*"(\d+)"', x); return m.group(1) if m else "miss:" + x[:80]
probe("watch_www", lambda: vc(req(f"https://www.youtube.com/watch?v={VID}")))
probe("watch_m", lambda: vc(req(f"https://m.youtube.com/watch?v={VID}", hdr={"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"})))
for cname, ver, extra in [("WEB", "2.20250925.01.00", {}), ("ANDROID", "19.44.38", {"androidSdkVersion": 34}), ("IOS", "19.45.4", {"deviceModel": "iPhone16,2"}), ("TVHTML5_SIMPLY_EMBEDDED_PLAYER", "2.0", {}), ("MWEB", "2.20250925.01.00", {})]:
    ctx = {"client": dict({"clientName": cname, "clientVersion": ver, "hl": "ko", "gl": "KR"}, **extra)}
    probe("player_" + cname, lambda: vc(req("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {"context": ctx, "videoId": VID}, {"Content-Type": "application/json"})))
    probe("next_" + cname, lambda: (lambda x: (re.search(r'"viewCount":\{"videoViewCountRenderer":\{"viewCount":\{"simpleText":"([^"]+)"', x) or re.search(r'"originalViewCount":"(\d+)"', x) or [None, "miss:" + x[:60]])[1])(req("https://www.youtube.com/youtubei/v1/next?prettyPrint=false", {"context": ctx, "videoId": VID}, {"Content-Type": "application/json"})))
probe("ryd", lambda: json.loads(req(f"https://returnyoutubedislikeapi.com/votes?videoId={VID}")).get("viewCount"))
json.dump(out, open("probe.json", "w"), ensure_ascii=False, indent=1)
print(out)
