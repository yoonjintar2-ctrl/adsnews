# GPT 그림 받아 오기 (발행인 지시 10/31·11/11: "요청 안 해도 매일 GPT 그림을 써라")

클라우드 예약 작업에는 크롬이 안 붙는다. 크롬이 붙는 대화(발행인과의 광고늬우스 대화)에서 매일 07:20에 한다. 2026-11-12에 7종 전부 이 방법으로 교체함.

1. 맥 크롬 새 탭 → ChatGPT '광고늬우스' 프로젝트의 '그림 교체 완료' 대화
   https://chatgpt.com/g/g-p-6abf7f967e68819187ac248505fdec1f-gwanggonyiuseu/c/6adfda79-13c8-83ee-8e8b-db556f969280
   (새 채팅 입력창에는 다른 작업 초안이 남아 있을 수 있으니 건드리지 않는다)
2. capture.js 내용을 javascript_tool로 실행. 입력창 클릭 → 주문 입력 → Return.
   주문 머리말: "업로드 없이 이 대화에 이미지 1장만(가로 3:2). 흑백 신문 펜화·스크린톤, 잉크 선과 해칭, 글자·로고·실존 인물 얼굴 없이. 장면: …"
   4컷은 "정사각 1:1, 한 장 안에 2×2 네 컷, 칸 사이 넓은 흰 여백, 같은 인물·화풍, 말풍선·글자 없이" + 등장인물 차림 + 칸별 장면. 광고인은 "세로 4:5, 얼굴 세부 없는 검은 실루엣".
3. 한 장에 1~3분. `computer wait 10`을 3~4번 묶어 기다린 뒤 `__last()`로 파일ID가 바뀌었는지 확인(바뀌기 전에 캡처하면 앞 그림이 찍힌다). 바뀐 뒤 4초 더 기다린다.
4. 캡처(맥 창이 좁아 뷰포트가 606×756일 때 기준, 창 크기 조절은 안 먹는다):
   - 가로 3:2 → `__gptShow(950)`, 타일 2장: (0,0) 그리고 `__gptAt(606,0)` → "354,0"
   - 정사각 → `__gptShow(1000)`, 타일 4장: (0,0), `__gptAt(606,0)`, `__gptAt(0,756)`, `__gptAt(606,756)`
   - 세로 4:5 → `__gptShow(600)`, 타일 1장
   타일마다 `computer hover [603,753]`(커서 치우기, 처음 한 번) → `computer zoom region [0,0,606,756] scale 1 save_to_disk true`. 끝나면 `__gptHide()`.
   캡처와 다음 주문 입력을 browser_batch 하나로 묶으면 빠르다.
5. `python3 scripts/gpt/stitch_grid.py out.jpg W H VW "x,y:타일.png" … --width 1400` (4컷은 --width 없이 만든 뒤 `split4.py out.jpg 폴더 strip`)
6. 같은 파일명으로 img 교체, JSON의 img에 `?v=gpt`, model을 "ChatGPT 이미지 생성 — 그림 도안나 대리"로 (apply_example.py 참고: 날짜와 alt만 바꿔 쓴다). 두세 장마다 커밋·푸시.
7. 탭 닫기. 숨은그림찾기는 SVG 그대로. 한도·오류면 남은 그림은 SVG로 두고 보고.
넓은 창(뷰포트 1400 이상)이면 stitch.py(세로 타일)도 쓸 수 있다.

## 사진 빈칸 채우기 (11/12 추가 — 같은 07:20 작업에서 GPT 그림 다음에 한다)
data.json의 campaigns·live 가운데 photo가 비었거나 `img/jp/thumb-…`(SVG 대체 그림)인 항목을 진짜 기사 사진으로 바꾼다.
GitHub Action(fill_photos.py)이 못 받는 매체(news1·아시아경제·스포츠경향 등은 러너를 막는다)도 맥 크롬으로는 열린다.
1. 맥 크롬 새 탭에서 항목의 url을 열고 javascript_tool로 og:image를 읽는다(? & = 는 ' QQ ' ' AA ' ' EE '로 바꿔 받아 되돌린다):
   `const g=n=>(document.querySelector('meta[property="'+n+'"],meta[name="'+n+'"]')||{}).content||''; (g('og:image')||g('twitter:image')||'NONE').replace(/\?/g,' QQ ').replace(/&/g,' AA ').replace(/=/g,' EE ')`
2. og:image가 매체 로고(파일명에 logo·sns·default)거나 없으면: WebSearch로 같은 캠페인의 올해 기사를 찾아 그 기사의 og:image를 쓴다(제목으로 같은 캠페인인지, 연도가 맞는지 확인. 지난해 기사 사진은 쓰지 않는다).
3. data.json에서는 그 항목의 photo만 바꾼다(url이 같은 항목만). 탭은 닫는다. 끝내 못 찾은 것만 SVG 그대로 두고 보고한다.
'오늘의 캠페인'(feature:true) 사진은 지면에서 가장 크게 보이므로 반드시 확인한다.
