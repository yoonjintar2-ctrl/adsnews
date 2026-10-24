"""필진 이름 바꾸기 (10/25부터 Claude 1인 다역).

예전 칸 이름(지필태·제민아·김그록)은 그날 원고 파일(archive/<날짜>/…json 또는 지금 파일)의 author를 보고
그날 실제 필진 이름으로 바꿔 보여 준다. 지난 호는 그때 이름 그대로 남는다.
"""
import functools, json, os

SLOTS = (("jipiltae.json", "지필태 대리", "지필태"), ("gemini.json", "제민아 대리", "제민아"), ("grok.json", "김그록 사원", "김그록"))


def _author(fname, d):
    p = os.path.join("archive", d or "", fname)
    for path in ((p,) if d and os.path.exists(p) else ()) + (fname,):
        try:
            return (json.load(open(path, encoding="utf-8")).get("author") or {})
        except Exception:
            pass
    return {}


@functools.lru_cache(maxsize=None)
def staff_map(d):
    m = {}
    for f, old, dn in SLOTS:
        A = _author(f, d)
        if A.get("name") and A["name"] != dn:
            m[old] = f"{A['name']} {A.get('title') or old.split()[-1]}"
    if m:
        m["AI 4대장의 썰전"] = "필진 4인의 썰전"
        m["AI 4대장"] = "필진 4인"
    return tuple(m.items())


def rename(text, d):
    if not isinstance(text, str):
        return text
    for a, b in staff_map(d):
        text = text.replace(a, b)
    return text
