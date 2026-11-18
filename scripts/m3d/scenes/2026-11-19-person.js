// 11/19 오늘의 광고인 할 라이니 — 따뜻한 목소리 하나로 광고의 온도를 바꾼 사람
// 새벽 라디오 녹음 부스, 옆에서: 실루엣 낭독자가 옛 리본 마이크 앞에서 원고를 넘기며 고개를 끄덕이듯 읽고, 유리창 너머 지평선의 해가 천천히 떠오른다. 녹음 중 램프가 깜박인다.
export const secs = 3;
export const meta = { place: '새벽 라디오 녹음 부스 마이크 앞', where: 'indoor', time: 'dawn', camera: 'side', floor: 'carpet', figures: 'solo-side', motion: ['page-turn', 'head-nod', 'sunrise', 'onair-blink'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.room(scene, { w: 14, d: 10, h: 7, wall: 'stripe', wallColor: '#8f8c87', floorStyle: 'carpet', sides: false });
  // 창(뒤 벽): 새벽 하늘 + 지평선 집들
  const winTex = K.canvasTex(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9fa3a6'); gr.addColorStop(1, '#ece6d8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#4a4846'; [[20, 60], [90, 40], [150, 70], [230, 50], [300, 80], [370, 45], [440, 65]].forEach(([x, hh]) => { g.fillRect(x, h - hh, 55, hh); g.beginPath(); g.moveTo(x - 5, h - hh); g.lineTo(x + 27, h - hh - 25); g.lineTo(x + 60, h - hh); g.fill(); }); });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), new THREE.MeshBasicMaterial({ map: winTex })); win.position.set(1, 4.2, -4.9); scene.add(win);
  const sun = new THREE.Mesh(new THREE.CircleGeometry(0.7, 32), K.flat(0xfbf8ee)); scene.add(sun);
  K.box(8.3, 0.25, 0.3, 0x2a2a2a, 1, 2.1, -4.8, scene); K.box(8.3, 0.25, 0.3, 0x2a2a2a, 1, 6.3, -4.8, scene); K.box(0.25, 4.4, 0.3, 0x2a2a2a, 1, 4.2, -4.8, scene);
  // 책상 + 마이크
  K.box(2.4, 0.2, 2.6, 0x5c5248, -0.6, 2.0, -2.2, scene); K.box(2.2, 2.0, 0.2, 0x3a3a3a, -0.6, 1.0, -3.4, scene);
  K.cyl(0.08, 0.08, 1.4, 0x222222, -0.6, 2.8, -2.1, scene, 8);
  const mic = K.inked(new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.55, 6, 14), K.lam(0x9a9894)), 40); mic.position.set(-0.6, 3.75, -2.1); scene.add(mic);
  // 원고 묶음 + 넘어가는 한 장
  K.box(1.2, 0.06, 0.9, 0xe6e2d8, -0.6, 2.14, -1.5, scene);
  const page = new THREE.Group(); page.position.set(-1.2, 2.19, -1.5); scene.add(page);
  const pg = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.2), new THREE.MeshLambertMaterial({ color: 0xf0ede4, side: THREE.DoubleSide })); pg.rotation.x = -Math.PI / 2; pg.position.x = 0.45; page.add(pg);
  // 녹음 중 램프(벽, 기호만)
  const onair = new THREE.Mesh(new THREE.CircleGeometry(0.25, 20), K.flat(0xf4f2ea)); onair.position.set(-4.2, 5.6, -4.88); scene.add(onair);
  // 낭독자(옆모습 실루엣에 가깝게 어두운 옷), 헤드폰
  const P = K.person(scene, { x: -0.6, z: -0.6, rot: 0, coat: 0x2b2b2b, skin: 0x5a5856, hair: 'short', scale: 1.0 });
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.05, 6, 20, Math.PI), K.flat(0x111111)); band.position.y = 0.32;  P.headG.add(band);
  [-1, 1].forEach(sd => K.cyl(0.16, 0.16, 0.12, 0x111111, sd * 0.44, 0.3, 0, P.headG, 12).rotation.z = Math.PI / 2);
  K.box(0.9, 0.12, 0.9, 0x333333, -0.6, 1.6, 0.2, scene);
  cam.position.set(6.5, 3.8, -0.9); cam.lookAt(-0.4, 3.4, -1.9);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    const u = ph / 6.2832; sun.position.set(2.6, 2.6 + 0.9 * Math.sin(u * Math.PI), -4.88);
    const nod = 0.08 * Math.sin(ph * 3);
    const turn = W(0.45, 0.85);
    page.rotation.z = Math.PI * 0.85 * turn;
    P.pose({ headPitch: 0.12 + nod, headYaw: 0, lean: 0.12, bob: 0, armL: { fwd: 1.1, elbow: 1.2 }, armR: { fwd: 0.9 + 0.3 * turn, elbow: 1.0, out: 0.1 * turn } });
    onair.material.color.setScalar(W(0, 0.5) > 0.5 ? 0.95 : 0.55);
  };
}
