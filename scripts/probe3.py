import json, re, urllib.request
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36", "Accept-Language": "ko-KR,ko;q=0.9"}
out = {}
with urllib.request.urlopen(urllib.request.Request("https://getdaytrends.com/korea/", headers=H), timeout=15) as r: x = r.read().decode()
out["gdt_links"] = re.findall(r'href="(/korea/trend/[^"]+)"[^>]*>([^<]{1,60})<', x)[:15]
i = x.find('/korea/trend/'); out["gdt_ctx"] = x[max(0,i-600):i+400]
CTX = {"client": {"clientName": "WEB", "clientVersion": "2.20250925.01.00", "hl": "ko", "gl": "KR"}}
def search(q, sp):
    r = urllib.request.Request("https://www.youtube.com/youtubei/v1/search?prettyPrint=false", data=json.dumps({"context": CTX, "query": q, "params": sp}).encode(), headers=dict(H, **{"Content-Type": "application/json"}))
    with urllib.request.urlopen(r, timeout=15) as f: return f.read().decode()
for sp in ["CAMSBAgCEAk=", "EgIQCQ==", "CAMSBAgDEAk="]:
    try:
        x = search("ㅋㅋ", sp)
        out["yt_"+sp] = {"reel": x.count('"reelItemRenderer"'), "lockup": x.count('shortsLockupViewModel'), "video": x.count('"videoRenderer"'),
                        "ids": re.findall(r'"videoId":"([A-Za-z0-9_-]{11})"', x)[:6], "views": re.findall(r'조회수 [\d.,]+[만천억]?회', x)[:6],
                        "acc": re.findall(r'"accessibilityText":"([^"]{0,90})"', x)[:4]}
    except Exception as e:
        out["yt_"+sp] = "ERR " + str(e)[:100]
json.dump(out, open("probe.json", "w"), ensure_ascii=False, indent=1)
