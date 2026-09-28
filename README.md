# 애드 레이더

광고·미디어 기획자를 위한 실시간 신문형 대시보드.

- `index.html` — 페이지. `data.json`은 60초, `live.json`은 30초마다 다시 불러옵니다.
- `data.json` — 뉴스·캠페인·영상 순위·리포트 등 (Claude 예약 작업이 매시간 갱신)
- `live.json` — 실시간 트렌드 원본 목록 (GitHub Actions가 5분마다 구글·시그널·네이트·줌 갱신, X는 매시간)
- `scripts/fetch_trends.py` — 5분 갱신 스크립트
