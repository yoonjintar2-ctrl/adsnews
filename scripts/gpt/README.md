# GPT 그림 받아 오기 (발행인 지시 2026-10-31: "요청 안 해도 매일 GPT 그림을 써라")

필진 아침 작업이 맥 크롬(Claude in Chrome)의 ChatGPT로 그림을 직접 주문하고, 화면 캡처로 받아 온다.
(크롬 도구는 base64 반환이 막혀 있어 화면 타일 캡처 → 이어 붙이기 방식을 쓴다.)

1. 맥 크롬 새 탭 → https://chatgpt.com/ (새 대화 하나, 제목은 GPT가 정함). 하루 한 대화에서 그림 하나씩 주문.
2. 응답이 끝나면(정지 버튼 사라짐) capture.js 내용을 javascript_tool로 실행 → `await __gptShow()` 결과의 W·H·T·VW·tiles 기록.
3. `computer hover [frameW-8, frameH-10]`(커서를 흰 여백으로) → 타일마다 `__gptTile(k)` → `computer zoom region [0,0,frameW,frameH] save_to_disk:true scale:1`.
4. `__gptHide()` 후 `python3 scripts/gpt/stitch.py 출력.jpg W H T VW 타일1.png 타일2.png … --width 1400`.
5. 4컷은 2×2 한 장으로 주문 → `python3 scripts/gpt/split4.py 네컷.jpg 폴더 strip`.
6. 결과 그림을 Read로 보고 검수(글자·로고·실존 인물 얼굴·손) 후 ingest 스크립트의 그림 폴더에 넣는다.
GPT가 "한도"·"생성할 수 없음"이라고 답하면 남은 그림은 SVG로 대신 그린다.
