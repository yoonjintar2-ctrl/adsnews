// 11/22 오늘의 광고인 스티브 잡스(광고주) — 실존 인물이라 얼굴 없이 뒷모습·옆 실루엣으로
// 해 질 녘 차고 작업실, 옆에서 잡은 구도: 핀으로 꽂힌 광고 스케치 판 앞에서 검은 니트 차림 사람이 한 장을 가리키고 고개를 끄덕인다.
// 창으로 드는 노을빛에 먼지가 떠다니고, 선풍기 바람에 스케치 종이 귀퉁이가 들썩인다.
export const secs = 3;
export const meta = { place: '해 질 녘 차고 작업실 스케치 핀 보드', where: 'indoor', time: 'sunset', camera: 'side', floor: 'plain', figures: 'solo-back', motion: ['point-nod', 'paper-flutter', 'fan-spin', 'motes'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  const Rm = K.room(scene, { w: 20, d: 12, h: 8, wall: 'brick', wallColor: '#9e9890', floorStyle: 'plain', windowAt: [6.5, 5.2, 3, 2.2] });
  const key = scene.children.find(o => o.isDirectionalLight); if (key) { key.position.set(12, 6, 4); key.intensity = 1.3; }
  // 차고 셔터(왼쪽 벽 대신 큰 골판)
  K.box(0.3, 6.5, 9, 0x77736e, -9.6, 3.25, -0.5, scene); for (let i = 0; i < 12; i++) K.box(0.34, 0.06, 9, 0x5e5a56, -9.6, 0.6 + i * 0.5, -0.5, scene);
  // 핀 보드
  K.box(8.4, 4.4, 0.3, 0x8a7a64, -1, 4.6, -5.7, scene);
  const sk = (k) => K.canvasTex(200, 150, (g, w, h) => { g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h); g.strokeStyle = '#222'; g.lineWidth = 6;
    if (k === 0) { g.beginPath(); g.arc(100, 75, 40, 0, 7); g.stroke(); }
    if (k === 1) { g.beginPath(); g.moveTo(30, 120); g.lineTo(100, 30); g.lineTo(170, 120); g.closePath(); g.stroke(); }
    if (k === 2) { for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(30, 35 + i * 25); g.lineTo(170 - i * 25, 35 + i * 25); g.stroke(); } }
    if (k === 3) { g.strokeRect(50, 35, 100, 70); g.fillStyle = '#555'; g.fillRect(80, 110, 40, 12); }
    if (k === 4) { g.beginPath(); g.moveTo(20, 110); g.quadraticCurveTo(100, 10, 180, 110); g.stroke(); } });
  const papers = [[-3.8, 5.6], [-1.6, 5.7], [0.7, 5.5], [-3.4, 3.6], [-0.9, 3.5], [1.5, 3.6]].map(([x, y], i) => {
    const g = new THREE.Group(); g.position.set(x, y + 0.7, -5.5); scene.add(g);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.4), new THREE.MeshLambertMaterial({ map: sk(i % 5), side: THREE.DoubleSide })); m.position.y = -0.7; g.add(m);
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), K.flat(0x222222)); pin.position.z = 0.05; g.add(pin); return g; });
  // 작업대 + 상자 + 선풍기
  K.box(7, 0.2, 2, 0x6a5f52, -1, 2.4, -3.8, scene); [-4.2, 2.2].forEach(x => K.box(0.2, 2.4, 1.8, 0x333333, x, 1.2, -3.8, scene));
  K.box(1.4, 1.0, 1.0, 0xd8d4cc, -3.2, 3.0, -3.8, scene);
  const fanG = new THREE.Group(); fanG.position.set(1.8, 3.4, -3.6); scene.add(fanG); K.cyl(0.06, 0.06, 0.8, 0x333333, 0, -0.4, 0, fanG, 6);
  const blades = new THREE.Group(); fanG.add(blades); [0, 1, 2].forEach(i => { const b = K.box(0.12, 0.6, 0.04, 0x444444, 0, 0.3, 0, null); const p = new THREE.Group(); p.rotation.z = i * 2.09; p.add(b); blades.add(p); });
  fanG.rotation.y = -0.8;
  // 사람(검은 니트, 뒷모습에 가깝게 보드를 봄)
  const P = K.person(scene, { x: -1.2, z: -1.6, rot: 0.25, coat: 0x1e1e1e, pants: 0x4a4a48, hair: 'short', hairC: 0x2a2a2a, scale: 1.05 });
  const dust = K.motes(scene, { n: 30, box: [10, 6, 6], z0: -2, size: 0.06 });
  cam.position.set(9.5, 4.6, 3.6); cam.lookAt(-1.2, 3.8, -3.4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.12);
    const pt = W(0.2, 0.7);
    P.pose({ headPitch: 0.1 * Math.sin(ph * 4) * W(0.5, 0.9) - 0.1, headYaw: 0.15, armR: { fwd: 0.3 + 1.6 * pt, out: 0.05, point: true }, armL: { fwd: 0.6, elbow: 2.1, out: -0.1 } });
    papers.forEach((g, i) => { g.rotation.x = (Math.sin(ph * 2 + i) * 0.5 + 0.5) * 0.25 * (i % 2 ? 1 : 0.5); });
    blades.rotation.z = ph * 3;
    if (dust && dust.update) dust.update(ph);
    Rm.update(ph, 0.08);
  };
}
