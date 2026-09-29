import json, re, urllib.request
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36", "Accept-Language": "ko-KR,ko;q=0.9"}
out = {}
def get(u):
    with urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=15) as r: return r.status, r.read().decode("utf-8", "replace")
for name, u in [("pb_short_daily", "https://playboard.co/chart/short/most-viewed-all-videos-in-south-korea-daily"),
                ("pb_video_weekly", "https://playboard.co/chart/video/most-viewed-all-videos-in-south-korea-weekly"),
                ("trends24", "https://trends24.in/south-korea/"),
                ("getdaytrends", "https://getdaytrends.com/korea/")]:
    try:
        st, x = get(u)
        o = {"status": st, "len": len(x)}
        if name.startswith("pb"):
            o["rows"] = len(re.findall(r'class="chart__row', x)); o["vids"] = re.findall(r'/video/([A-Za-z0-9_-]{11})', x)[:5]
            o["period"] = re.findall(r'title-bar__period[^>]*>\s*([^<]+)', x)[:1]
        else:
            o["sample"] = re.findall(r'<a[^>]+href="[^"]*(?:twitter|x)\.com/search[^"]*"[^>]*>([^<]+)</a>', x)[:12] or re.findall(r'class="trend-name"[^>]*>(?:<a[^>]*>)?([^<]+)', x)[:12]
            o["head"] = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", x))[:200]
        out[name] = o
    except Exception as e:
        out[name] = "ERR " + str(e)[:150]
json.dump(out, open("probe.json", "w"), ensure_ascii=False, indent=1)
