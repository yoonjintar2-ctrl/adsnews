// 11/20 오늘의 광고인 오틀 아이허(도안나 그림)
// 낮 육상 경기장 트랙 옆을 옆에서: 커다란 픽토그램 표지판(달리는 사람 도형)이 바람에 살짝 흔들리고, 두 사람이 마주 보며 표지판을 가리킨다. 새가 지나간다.
export const secs = 3;
export const meta = { place: '낮 육상 경기장 트랙 옆 픽토그램 표지판', where: 'outdoor', time: 'day', camera: 'side', floor: 'grass', figures: 'two-facing', motion: ['sign-swing', 'point', 'bird'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'day', sun: true, clouds: 2 });
  K.floor(scene, { style: 'grass' });
  // 트랙 레인
  K.box(40, 0.05, 6, 0x8c6f62, 0, 0.03, -4, scene);
  for (let i = 0; i < 5; i++) K.box(40, 0.02, 0.08, 0xf0eee8, 0, 0.07, -6.8 + i * 1.4, scene);
  // 관중석 계단
  for (let i = 0; i < 4; i++) K.box(40, 0.8, 1.6, 0x9a9893, 0, 0.4 + i * 0.8, -10 - i * 1.6, scene);
  // 픽토그램 표지판 (캔버스 그림 — 도형만)
  const tex = K.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.lineCap = 'round'; g.strokeStyle = '#1a1a1a'; g.lineWidth = 22;
    g.beginPath(); g.arc(140, 60, 22, 0, 7); g.fill();
    g.beginPath(); g.moveTo(130, 92); g.lineTo(115, 150); g.moveTo(115, 150); g.lineTo(75, 195); g.moveTo(115, 150); g.lineTo(160, 170); g.lineTo(150, 220);
    g.moveTo(128, 100); g.lineTo(175, 125); g.moveTo(128, 100); g.lineTo(85, 95); g.stroke(); });
  const sign = new THREE.Group(); sign.position.set(0, 3.0, -1.5); scene.add(sign);
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.12), [K.lam(0x2a2a2a), K.lam(0x2a2a2a), K.lam(0x2a2a2a), K.lam(0x2a2a2a), new THREE.MeshLambertMaterial({ map: tex }), K.lam(0x2a2a2a)]);
  board.position.y = -1.4; sign.add(board); K.inked(board);
  K.cyl(0.08, 0.08, 4.6, 0x222222, -1.2, 2.3, -1.6, scene, 8); K.cyl(0.08, 0.08, 4.6, 0x222222, 1.2, 2.3, -1.6, scene, 8); K.box(2.8, 0.1, 0.1, 0x222222, 0, 4.6, -1.6, scene);
  const A = K.person(scene, { x: -2.6, z: 0.6, rot: -Math.PI / 2 + 0.6, coat: 0x4c4a46, hair: 'short', scale: 1 });
  const B = K.person(scene, { x: 2.6, z: 0.6, rot: Math.PI / 2 - 0.6, coat: 0x8a8782, hair: 'long', scale: 0.97 });
  const bd = K.bird(scene, { cx: 0, cy: 9, cz: -6, rx: 10, rz: 2, s: 1 });
  K.shot(cam, 'side', [0, 2.2, 0], 12); cam.position.set(0.6, 2.6, 12); cam.lookAt(0, 2.4, -1);
  return (t, ph) => {
    sign.rotation.x = 0.08 * Math.sin(ph); sign.rotation.z = 0.03 * Math.sin(ph + 1);
    const a = K.win(ph, 0.1, 0.55, 0.1), b = K.win(ph, 0.5, 0.95, 0.1);
    A.pose({ headYaw: -0.6 + 0.9 * a, headPitch: -0.15 * a, armR: { fwd: 0.3 + 1.6 * a, out: -0.2, point: true }, armL: { fwd: 0.1 } });
    B.pose({ headYaw: 0.6 - 0.9 * b, headPitch: -0.15 * b, armL: { fwd: 0.3 + 1.6 * b, out: -0.2, point: true }, armR: { fwd: 0.4 * a, elbow: 2.0 * a } });
    bd && bd.update && bd.update(ph);
  };
}
