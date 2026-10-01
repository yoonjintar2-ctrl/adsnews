"""Illustrations by OpenAI's image model for 만평 · 오늘의 광고인 · 트렌드 노트.

금로동 기자 (the content task) writes an `imagePrompt` next to each drawing in data.json.
This step (in the trends Action) sends new prompts to the OpenAI Images API, saves the result as a
small grayscale JPEG under img/, and records the path in the same object as `img`.
The page shows `img` when it exists and falls back to the hand-drawn SVG otherwise.

Needs the GitHub secret OPENAI_API_KEY. Model can be changed with the IMAGE_MODEL secret/env.
At most MAX_PER_DAY new images are made per KST day, so a bad loop can never run up a bill.
"""
import base64, hashlib, io, json, os, sys, urllib.request
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
MAX_PER_DAY = 8
MODELS = [m for m in [os.environ.get("IMAGE_MODEL"), "gpt-image-2", "gpt-image-1.5", "gpt-image-1"] if m]
STYLE = ("Black-and-white pen-and-ink newspaper editorial illustration. Clean confident line art with "
         "cross-hatching and stippled shading on plain off-white paper, like a classic Korean newspaper "
         "cartoon. Strictly monochrome: no color, no gray wash backgrounds. Absolutely no text, letters, "
         "numbers, captions, speech bubbles, logos, brand marks or watermarks anywhere in the image. "
         "Generic invented characters only; do not depict the likeness of any real person. Scene: ")


def kst_today():
    return datetime.now(KST).strftime("%Y-%m-%d")


def call(prompt, key):
    last = None
    for model in MODELS:
        body = json.dumps({"model": model, "prompt": STYLE + prompt, "size": "1536x1024",
                           "quality": "medium", "n": 1}).encode()
        req = urllib.request.Request("https://api.openai.com/v1/images/generations", data=body,
                                     headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                j = json.loads(r.read())
            d = j["data"][0]
            if d.get("b64_json"):
                return base64.b64decode(d["b64_json"]), model
            if d.get("url"):
                with urllib.request.urlopen(d["url"], timeout=60) as r:
                    return r.read(), model
        except urllib.error.HTTPError as e:
            last = f"{model}: {e.code} {e.read()[:300]!r}"
            if e.code in (400, 404):  # unknown model or bad request → try the next model
                continue
            break
        except Exception as e:  # network etc.
            last = f"{model}: {e}"
            break
    raise RuntimeError(last or "no image")


def save(raw, path):
    from PIL import Image
    im = Image.open(io.BytesIO(raw)).convert("L")
    im.thumbnail((1200, 1200))
    im.save(path, "JPEG", quality=72, optimize=True, progressive=True)


def jobs(data):
    """(object, kind) pairs that carry an imagePrompt."""
    out = []
    c = (data.get("brief") or {}).get("cartoon") or {}
    if c.get("imagePrompt"):
        out.append((c, "toon", c.get("date")))
    p = data.get("person") or {}
    if p.get("imagePrompt"):
        out.append((p, "person", p.get("date")))
    t = data.get("trendNotes") or {}
    for i, it in enumerate(t.get("items") or []):
        if it.get("imagePrompt"):
            out.append((it, f"trend{i + 1}", t.get("date")))
    return out


def main():
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    data = json.load(open("data.json", encoding="utf-8"))
    todo = []
    for obj, kind, date in jobs(data):
        h = hashlib.md5(obj["imagePrompt"].encode()).hexdigest()[:8]
        name = f"img/{date or kst_today()}-{kind}-{h}.jpg"
        if obj.get("img") == name and os.path.exists(name):
            continue
        if os.path.exists(name):  # made earlier, just link it
            obj["img"] = name
            continue
        todo.append((obj, name))
    linked = [o for o, n in todo if o.get("img") == n]
    todo = [(o, n) for o, n in todo if o.get("img") != n]
    if not todo:
        if linked:
            json.dump(data, open("data.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        return
    if not key:
        print("images: OPENAI_API_KEY not set, skipping", len(todo))
        return
    os.makedirs("img", exist_ok=True)
    log_p = "img/.count.json"
    try:
        log = json.load(open(log_p))
    except Exception:
        log = {}
    today = kst_today()
    made = 0
    for obj, name in todo:
        if log.get(today, 0) >= MAX_PER_DAY:
            print("images: daily cap reached")
            break
        try:
            raw, model = call(obj["imagePrompt"], key)
            save(raw, name)
            obj["img"] = name
            log[today] = log.get(today, 0) + 1
            made += 1
            print("image", name, "via", model)
        except Exception as e:
            log[today] = log.get(today, 0) + 1  # failed calls also count toward the cap
            print("image failed", name, e, file=sys.stderr)
    log = {k: v for k, v in log.items() if k >= (datetime.now(KST) - timedelta(days=7)).strftime("%Y-%m-%d")}
    json.dump(log, open(log_p, "w"))
    json.dump(data, open("data.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("images made:", made)


if __name__ == "__main__":
    main()
