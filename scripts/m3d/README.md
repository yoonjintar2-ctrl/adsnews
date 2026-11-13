# 움직이는 3D 삽화 (발행인 지시 2026-11-13)

> "3D로 삽화를 그리고 3초쯤 살짝 움직이게. 배경 말고 오브젝트도 움직이게(갓등이 흔들리고, 사람이 서로 마주 보고 신기해하거나 손가락으로 가리키는 등). 가능한 많은 삽화를 매일 이렇게."

three.js로 장면을 세우고 신문 망점·윤곽선 후처리를 입혀 흑백 펜화처럼 만든 뒤, 3초(90프레임) 반복 MP4로 굽는다.
사이트(index.html의 `__vidUp`)는 JSON에서 `img` 옆에 `video`가 있는 칸을 찾아 그 그림 자리를 소리 없는 반복 영상으로 바꾼다.
- 데이터 절약·'동작 줄이기' 설정을 켠 독자는 그림(img) 그대로 본다. 그래서 img는 지우지 않는다(GPT 그림이나 SVG).
- 포스터는 영상과 같은 이름의 .jpg(렌더러가 첫 프레임으로 자동 생성).

## 만들기
1. 장면 파일 `scripts/m3d/scenes/<날짜>-<칸>.js` 를 쓴다(예: `2026-11-13-cartoon.js`를 복사해 고친다).
2. 검수용 정지 컷 3장(움직임이 가장 많은 순간): 
   `node scripts/m3d/render.cjs scenes/<파일>.js /tmp/s1.jpg --still 0.3` (0.3·1.2·2.1초 등) → Read로 직접 본다.
3. 본 렌더(약 30초): `node scripts/m3d/render.cjs scenes/<파일>.js img/jp/<칸>-<날짜>-3d.mp4` → 같은 이름 .jpg 포스터도 생긴다. 1MB 안팎.
4. JSON의 그 칸에 `"video": "img/jp/<칸>-<날짜>-3d.mp4"` 추가(img는 그대로).
   - 사설 삽화 jipiltae.json `cartoon`, 도안나 미니 사설 `editorial.cartoon`, 안광주 미니 사설 gemini.json `editorial.cartoon`(파일은 img/gm/),
     광고인 `person`, 트렌드 `trend`·`trendArt`, 4컷 grok.json `strip.panels[n]`(파일은 img/gk/, 칸마다 하나).
   - ingest 스크립트가 덮어쓸 수 있으니 ingest가 끝난 뒤 마지막에 넣는다.
NODE_PATH=$(npm root -g) 로 playwright를 찾는다. 크로미움은 /opt/pw-browsers/chromium 이 있으면 그것을 쓴다(소프트웨어 WebGL, swiftshader).

## 장면 파일 규칙
```js
export const secs = 3;
export default function (K) {           // K = kit.js 전부 + {THREE, scene, cam, R, render}
  K.ground(scene); K.building(scene, x, z, w, d, h, seed, rot); ...
  const P = K.person(scene, { x, z, coat, hair:'short'|'long'|'bun'|'cap', backpack, scale, rot });
  cam.position.set(...); cam.lookAt(...);          // 카메라는 고정(움직이면 영상이 2~3배 무거워진다)
  return (t, ph) => {                               // ph: 0→2π 한 바퀴 = 영상 한 번
    const W = (a, b) => K.win(ph, a, b, 0.1);       // 반복 안에서 a~b 구간만 1 (손짓 타이밍)
    P.pose({ headYaw, headPitch, headTilt, torsoYaw, lean, bob, armL:{fwd,out,elbow,point}, armR:{...} });
  };
}
```
- 모든 움직임은 ph의 sin/cos 또는 `K.win`으로 → 3초 끝과 처음이 이어져 끊김 없이 반복된다.
- 사람은 -z(화면 안쪽)를 본다. `headYaw>0` 왼쪽으로 고개, `fwd` 팔을 앞으로 드는 각(2.4≈위를 가리킴), `point:true` 검지, `elbow:-2` 손을 얼굴로.
  뒷모습 구도에서 서로 마주 보게 하려면 headYaw ±1.3, torsoYaw ±0.5 정도까지 돌려야 옆얼굴이 보인다.
- 움직일 거리: 사람 몸짓(가리키기·마주 보기·놀라기·고개 끄덕이기), 매달린 것(`K.lanternString` 흔들림), 화면 속 영상(`K.screen` + drift),
  깜박이는 간판, 먼지(`K.motes`), 새(`K.bird`). 장면마다 오브젝트 2~3개 이상은 움직이게 한다.
- 도구: `K.box`, `K.cyl`, `K.line`, `K.canvasTex`(캔버스로 간판·포스터·화면 그림), `K.imgTex('/repo/img/...')`(저장소 그림을 화면 텍스처로), `K.windowsTex`.
- 실존 인물은 얼굴 세부 없이(뒷모습·인형 얼굴), 실제 로고·브랜드 디자인·글자 금지(간판은 도형·기호로), 논란 장면 재현 금지.
- 망점·해칭은 쓰지 않는다(움직이면 무늬가 일렁여 어지럽다, 발행인 11/13). 후처리는 먹 농담 4단 + 윤곽선.
- 반복 무늬(창문 격자·바닥 타일·먼지)는 옅고 성기게, 화면 속 사진은 흐르게 하지 않는다(drift 0). 큰 배경은 멈추고 오브젝트만 움직인다.
