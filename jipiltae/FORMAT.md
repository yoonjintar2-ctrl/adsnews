# 지필태 기자 원고 형식 (adsnews-jipiltae/1)

지필태 기자(ChatGPT 기반)의 원고는 **JSON 1개 + 그림 파일**로 받습니다. 금로동 기자(Claude)가 검사해서 `jipiltae.json`에 반영하고 GitHub에 올립니다.

## 흐름
1. `python scripts/make_jp_pack.py` → `jipiltae/inbox/<날짜>.md` (오늘의 자료 + 빈 원고 틀)
2. 발행인이 이 자료를 ChatGPT(지필태)에게 전달 → 원고 JSON과 그림 파일을 받아 옴
3. `python scripts/ingest_jipiltae.py 원고.json --assets 그림폴더` → 검사, `img/jp/`에 그림 저장, `jipiltae.json` 반영
4. 숨은그림은 `jipiltae/preview/hidden-<날짜>.png`(정답 위치 빨간 원)를 눈으로 확인 → `--approve-hidden` 해야 공개
5. 커밋·푸시는 `jipiltae.json`, `img/jp/`, `jipiltae/manuscripts/`만

## JSON
| 키 | 내용 | 검사 |
|---|---|---|
| format | `"adsnews-jipiltae/1"` | |
| edition | 호 날짜 `YYYY-MM-DD` | |
| author | `"지필태"` | 다르면 거부 |
| model | 사용한 GPT 모델 이름 | 화면·기록에 남김 |
| editorial | `{headline, lede, body, sources[{t,url}], cartoon?{file,caption,bubble,bubblePos}}` | 본문 400~700자(목표 500~600), 출처 URL 1개 이상. cartoon = 지필태 사설에 붙는 만평 |
| editorialCartoon | `{file, caption, bubble, bubblePos}` | 사설은 이미 받았고 만평만 따로 보낼 때 |
| cartoon | `{file, caption, bubble, bubblePos, alt}` — 금로동 사설용 만평 | png/jpg/webp(→1600px JPEG로 저장), 4MB 이하 |
| campaign | `{url, review}` — 오늘의 캠페인 분석(120~260자, 목표 150~200) | url이 오늘의 캠페인과 같아야 화면에 나옴 |
| live | `[{id, url, comment}]` — 이슈별 한 줄(40자 안팎) | url이 현재 실시간 목록에 있어야 함 |
| trend | `{tag, title, body, point, sources, file?}` | 최근 30일 태그와 겹치면 거부, 출처 필수 |
| trendImage | `{file, alt?}` | 이미 받은 지필태 트렌드 노트에 그림만 붙일 때 |
| trendArt | `{file, tag, alt?}` | 금로동 트렌드 노트에 붙는 지필태 그림(태그가 같아야 표시) |
| person | `{file, name, alt?}` | 오늘의 인물 시네마틱 일러스트(이름이 같아야 표시, 'AI 일러스트' 표기) |
| publisher | `{file}` | 필진 소개용 발행인 초상 |
| hidden | `{file, title, inspired, targets?}` | 물건 6~10개, 그림 안 좌표, 미리보기 확인 후 공개 |
| avatar | `{file}` | 프로필 그림(처음 한 번) |

빠진 항목은 기존 내용을 그대로 둡니다. 날짜가 오늘 호와 다르면 화면에는 '준비 중'으로 나옵니다(숨은그림은 날짜와 함께 계속 유지).

## 저장 위치 (금로동·자동 수집과 분리)
- `jipiltae.json` — 지필태 원고 전부. 예약 작업·GitHub Action은 이 파일을 쓰지 않음
- `img/jp/` — 지필태 그림
- `jipiltae/manuscripts/` — 받은 원고 원본 보관
- `archive/<날짜>/jipiltae.json` — 지난 호 보존(23:45~23:59 자동 복사)

## 그림을 받아 오는 길
ChatGPT 화면의 그림은 파일로 내려받지 않습니다(발행인 결정). 금로동이 크롬에서 그림만 화면 가득 띄워 캡처 → GitHub `jp-inbox` 브랜치에 업로드(사이트에 게시되지 않음) → 여기서 받아 테두리를 잘라 `img/jp/`로 반영합니다. 그림마다 손·팔 개수, 얼굴, 원근을 금로동이 먼저 확인하고 이상하면 돌려보냅니다.
