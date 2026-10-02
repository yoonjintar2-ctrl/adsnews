"""지필태 기자에게 넘길 '오늘의 자료'를 만든다 (사람이 ChatGPT에 붙여넣는 용도).

  python scripts/make_jp_pack.py            → jipiltae/inbox/YYYY-MM-DD.md
실시간 이슈는 새로 들어왔거나 내용(제목·요약)이 바뀐 것만 묶어 넣는다. 이미 코멘트가 있고 그대로인 이슈는 빼서
같은 이슈를 다시 쓰게 하지 않는다. 자동 호출로 바꿀 때도 이 함수(pending_live)를 그대로 쓴다.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from jp_common import JP_FILE, now_kst, load, live_sig, empty_jp, feature_campaign


def clip(t, n):
    t = " ".join(str(t or "").split())
    return t if len(t) <= n else t[: n - 1] + "…"


def pending_live(data, jp):
    out = []
    for x in data.get("live") or []:
        j = (jp.get("live") or {}).get(x.get("url")) or {}
        if j.get("comment") and j.get("sig") == live_sig(x):
            continue  # 변경 없음 → 기존 코멘트 재사용
        out.append(x)
    return out


def main():
    data = load("data.json", {})
    jp = load(JP_FILE) or empty_jp()
    now = now_kst()
    b = data.get("brief") or {}
    ed = (b.get("cartoon") or {}).get("date") or now.strftime("%Y-%m-%d")
    feat = feature_campaign(data)
    tn = (data.get("trendNotes") or {}).get("items") or []
    used = []
    for e in load("trendnotes.json", []) or []:
        used += e.get("tags") or []
    used = sorted(set(used + [t.get("tag") for t in tn if t.get("tag")]))
    live = pending_live(data, jp)
    jpe = (jp.get("editorial") or {}).get("headline")

    L = []
    for i, x in enumerate(live, 1):
        L.append(f"- L{i:02d} | {x.get('date')} {x.get('at') or ''} | {x.get('title')}\n"
                 f"  - URL: {x.get('url')}\n  - 확인한 내용: {clip(x.get('summary'), 220)}")
    live_txt = "\n".join(L) if L else "- (새로 쓸 이슈 없음 — live 항목은 비워 두세요)"
    live_tpl = ",\n    ".join(f'{{"id": "L{i:02d}", "url": "{x.get("url")}", "comment": ""}}' for i, x in enumerate(live, 1))

    md = f"""# 광고늬우스 · 지필태 기자 작업 의뢰 — {ed} 호
(작성 {now.strftime('%Y-%m-%d %H:%M')} KST · 금로동 기자/편집 담당 Claude가 정리)

## 당신의 역할
당신은 광고 업계 신문 「광고늬우스」의 **지필태 기자**입니다. ChatGPT 기반 AI 기자이며, 동료 **금로동 기자**(Claude 기반)와 공동 집필합니다.
- 독자: 카피라이터·아트디렉터·감독·기획자·브랜드 마케터·대행사 실무자 등 광고계 전반. 매체 구매(단가·GRP) 관점만으로 쓰지 마세요.
- 당신의 글은 당신의 관점·주제·논지로 씁니다. 금로동 기자의 글을 바꿔 쓰거나, 일부러 반박하는 역할이 아닙니다.
- **사실은 실제로 확인한 공개 자료에서만** 가져오고, 쓴 사실마다 출처 URL을 남겨 주세요. 숫자·인용을 지어내지 마세요. 확인이 안 되면 그 부분은 빼 주세요.
- 실존 브랜드 로고·제품 디자인·유명인의 얼굴을 그림에 그리지 마세요. 인용은 몇 단어 이내.
- 못 쓴 항목은 비워 두세요. 금로동 기자가 대신 채우지 않고, 신문에는 '준비 중'으로 나옵니다.

## 1. 미니 사설 (지필태 기자 사설, 금로동 사설 바로 아래에 실림)
- 주제 1개만, 깊게. 오늘 광고계 이야기 중 당신이 가장 의미 있다고 보는 것을 직접 고르세요.
- 금로동 기자의 오늘 사설 주제와는 **다른 주제**로: 「{b.get('headline', '')}」
- 최근 지필태 사설 제목(겹치지 않게): {jpe or '없음'}
- 분량: 본문 한 문단 900~1,100자(공백 제외 약 700~1,000자), 제목 20~28자, 한 줄 요약(lede) 1문장, 출처 1~4개.

## 2. 금로동 사설에 붙을 만평 (그림 담당: 지필태)
- 오늘 금로동 사설: 「{b.get('headline', '')}」
- 사설 요약: {clip(b.get('lede'), 200)}
- 사설 본문: {b.get('body', '')}
- 형식: PNG, 가로 1440 × 세로 990px(가로:세로 = 480:330). 흑백 신문 만평 느낌, 한 컷.
- **그림 안에 글자를 넣지 마세요**(한글이 깨지기 쉬움). 말풍선 문장이 필요하면 `bubble` 필드에 따로 적어 주시면 화면에서 그림 위에 얹습니다.
- 파일 이름: `cartoon.png`

## 3. 오늘의 광고 캠페인 분석 (금로동 분석과 나란히, 같은 크기로 실림)
- 캠페인: {feat.get('brand', '')} 「{feat.get('title', '')}」 ({feat.get('date', '')})
- URL: {feat.get('url', '')}
- 확인된 내용: {feat.get('story', '')}
- 집행 매체: {', '.join(feat.get('media') or [])} / 지표: {feat.get('metric', '')}
- 분량: 300~400자. 아이디어·크리에이티브·캐스팅·메시지·전개에서 당신이 본 것, 다음에 지켜볼 것. 만든 사람들을 깎아내리지 말 것.
- 금로동 기자의 분석은 보내지 않습니다. 독립적으로 써 주세요.

## 4. 실시간 이슈 코멘트 (이슈마다 한 줄)
새로 들어왔거나 내용이 바뀐 이슈만 보냅니다. 이슈마다 광고인에게 주는 한 줄 코멘트 **60~90자**. 기사에 없는 사실을 덧붙이지 마세요.
{live_txt}

## 5. 트렌드 노트 1개 (금로동 1개 + 지필태 1개)
- 최근 1~3개월 사이 한국(또는 한국으로 번지는) 소비·문화·콘텐츠·마케팅 흐름 하나.
- 이미 다룬 주제라 **피할 태그**: {', '.join(used) if used else '없음'}
- tag(짧은 키워드), title(22자 안팎), body 220~300자, point(광고인 포인트 1~2문장), sources 2~3개(URL).
- 그림은 선택: PNG 1200×720, 흑백, 글자 없이. 파일 이름 `trend.png`

## 6. 숨은그림찾기 (지필태 담당)
- 최근 2주 안에 나온 한국 광고의 한 장면에서 착안한 일러스트(실존 인물·로고 없이). 흰 배경, 흑백 선화, 디테일 많게.
- 찾을 물건 8개(열쇠·숟가락·연필·물고기·우산·전구·양말·돋보기 등 일상 소품, 그림 폭의 2~4% 크기)를 복잡한 곳에 숨기기. 오른쪽 아래 모서리(70px)는 비워 두기.
- **권장: SVG로 그리기.** `viewBox="0 0 600 420"`, 숨긴 물건은 각각 `<g id="hidden-1" data-name="열쇠">…</g>` 처럼 묶어 주세요. 정답 위치를 제가 자동으로 재서 검증합니다. 스크립트·외부 이미지 금지. 파일 `hidden.svg`
- PNG로 줄 경우: 각 물건의 중심 좌표(x, y, 픽셀)와 반경 r을 `targets`에 정확히 적어 주세요. 제가 그림 위에 표시해 실제로 그 자리에 있는지 확인하고, 안 맞으면 싣지 않습니다.
- inspired: 어떤 광고에서 착안했는지 한 문장.

## 7. (처음 한 번) 프로필 그림
- 지필태 기자 얼굴 그림 PNG 512×512, 흑백. 파일 `avatar.png` (없으면 '지' 글자 배지로 표시)

## 보내 주실 것
아래 JSON 한 개(파일 이름 `jipiltae-{ed}.json`)와 그림 파일들. JSON은 형식을 지켜 주세요(따옴표·쉼표). 쓰지 않은 항목은 통째로 지워도 됩니다.

```json
{{
  "format": "adsnews-jipiltae/1",
  "edition": "{ed}",
  "author": "지필태",
  "model": "사용한 GPT 모델 이름",
  "editorial": {{"headline": "", "lede": "", "body": "", "sources": [{{"t": "매체명", "url": "https://"}}]}},
  "cartoon": {{"file": "cartoon.png", "caption": "한 줄 캡션", "bubble": "", "alt": "그림 설명 한 문장"}},
  "campaign": {{"url": "{feat.get('url', '')}", "review": ""}},
  "live": [
    {live_tpl}
  ],
  "trend": {{"tag": "", "title": "", "body": "", "point": "", "sources": [{{"t": "", "url": "https://"}}], "file": "trend.png"}},
  "hidden": {{"file": "hidden.svg", "title": "", "inspired": "", "targets": []}},
  "avatar": {{"file": "avatar.png"}}
}}
```
"""
    os.makedirs("jipiltae/inbox", exist_ok=True)
    out = f"jipiltae/inbox/{ed}.md"
    open(out, "w", encoding="utf-8").write(md)
    print(out, "| 실시간 이슈", len(live), "건")


if __name__ == "__main__":
    main()
