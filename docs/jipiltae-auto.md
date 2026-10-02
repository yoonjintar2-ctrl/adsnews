# (보류) 지필태 자동 호출 설계

지금은 **수동 전달**로 운영합니다. 아래는 API로 자동화할 때의 설계이며, 아직 연결되지 않았습니다.

## 필요한 설정
- GitHub Secret `OPENAI_API_KEY` (발행인이 직접 입력)
- (선택) Repository variable `JP_MODEL` — 사용할 GPT 모델 이름
- 새 워크플로 `.github/workflows/jipiltae.yml`과 스크립트 `scripts/jp_call.py` (추가 예정)

## 호출 흐름
1. **정규 발행분** (06:30 KST): 금로동 06:05 실행이 `data.json`을 올린 뒤 → `make_jp_pack.py`가 만드는 자료를 그대로 프롬프트로 사용 → 응답 JSON을 `ingest_jipiltae.py`로 검사·반영. 그림은 이미지 생성 API로 받아 같은 검사를 거침. 숨은그림은 SVG로 받아 정답 좌표를 자동 측정, 검사 실패 시 공개하지 않음.
2. **실시간 이슈 코멘트**: `data.json`이 바뀌어 push될 때만 실행(`on: push, paths: [data.json]`).
   - `pending_live()`로 **새 이슈·내용이 바뀐 이슈만** 묶어서 한 번에 호출 (URL, 확인한 내용, 수집 시각 포함)
   - 변경 없는 이슈는 기존 코멘트 재사용(제목·요약 지문 `sig` 비교)
3. **반복 실행 방지**
   - 이 워크플로는 `jipiltae.json`만 커밋하고, 트리거는 `data.json` 경로에만 걸어서 자기 커밋으로 다시 실행되지 않음
   - 보낼 이슈가 0건이면 호출하지 않음
   - 같은 이슈 지문(sig)은 실패해도 1시간에 1번까지만 재시도, 하루 호출 횟수 상한
   - 응답 검사 실패 시 기존 코멘트 유지(또는 '준비 중'), 금로동이 대신 쓰지 않음

## 바뀌는 파일 (자동화 시)
- 추가: `.github/workflows/jipiltae.yml`, `scripts/jp_call.py`
- 그대로 사용: `scripts/jp_common.py`, `scripts/make_jp_pack.py`, `scripts/ingest_jipiltae.py`
