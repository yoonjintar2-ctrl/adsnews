// 11/19 도안나 트렌드 「반듯한 그리드 대신, 일부러 삐뚤게」
// 맑은 낮 골목 공사장 가림막, 가까이: 반듯하게 붙은 포스터 격자 중 한 장만 손이 일부러 비스듬히 붙인다. 모서리가 바람에 들썩이고 마른 잎이 날린다.
export const secs = 3;
export const meta = { place: '낮 골목 공사장 가림막 포스터 벽', where: 'outdoor', time: 'day', camera: 'close', floor: 'asphalt', figures: 'hands-only', motion: ['hand-tilt', 'corner-flap', 'leaves'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'day', sun: true });
  K.floor(scene, { style: 'asphalt' });
  K.box(14, 5, 0.3, 0x9c9a94, 0, 2.5, -2, scene); // 가림막
  const shapes = ['c', 's', 't'];
  const tile = (i, j) => K.canvasTex(128, 160, (g, w, h) => { g.fillStyle = '#ecebe6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#222'; g.lineWidth = 4; g.strokeRect(3, 3, w - 6, h - 6); g.fillStyle = ['#555', '#888', '#333'][(i + j) % 3];
    const s = shapes[(i * 3 + j) % 3]; if (s === 'c') { g.beginPath(); g.arc(64, 80, 34, 0, 7); g.fill(); } else if (s === 's') g.fillRect(30, 46, 68, 68); else { g.beginPath(); g.moveTo(64, 40); g.lineTo(104, 118); g.lineTo(24, 118); g.fill(); } });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { if (i === 1 && j === 2) continue; const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), new THREE.MeshLambertMaterial({ map: tile(i, j) })); m.position.set(-2.1 + j * 1.3, 4.0 - i * 1.6, -1.83); scene.add(m); }
  // 비뚤게 붙는 한 장(손으로 그린 듯한 얼룩 도형)
  const odd = new THREE.Group(); odd.position.set(-2.1 + 2 * 1.3, 4.0 - 1.6, -1.8); scene.add(odd);
  const oddTex = K.canvasTex(128, 160, (g, w, h) => { g.fillStyle = '#d8d6cf'; g.fillRect(0, 0, w, h); g.strokeStyle = '#222'; g.lineWidth = 5; g.beginPath(); g.moveTo(6, 8); g.lineTo(120, 4); g.lineTo(124, 154); g.lineTo(4, 150); g.closePath(); g.stroke();
    g.fillStyle = '#2a2a2a'; g.beginPath(); g.moveTo(40, 50); g.bezierCurveTo(90, 20, 110, 90, 80, 115); g.bezierCurveTo(50, 135, 20, 90, 40, 50); g.fill(); });
  const oddM = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4, 4, 4), new THREE.MeshLambertMaterial({ map: oddTex, side: THREE.DoubleSide })); odd.add(oddM);
  // 손(손바닥 + 손가락) — 팔은 화면 오른쪽 아래에서
  const hand = new THREE.Group(); scene.add(hand);
  const palm = K.inked(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.18), K.lam(0xb8b4ae)), 30); hand.add(palm);
  for (let f = 0; f < 4; f++) { const fg = K.inked(new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.3, 3, 6), K.lam(0xb8b4ae)), 30); fg.position.set(-0.2 + f * 0.135, 0.5, 0); hand.add(fg); }
  const thumb = K.inked(new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.25, 3, 6), K.lam(0xb8b4ae)), 30); thumb.position.set(-0.36, 0.05, 0); thumb.rotation.z = 0.9; hand.add(thumb);
  const sleeve = K.inked(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 2.4, 14), K.lam(0x4a4a48)), 40); sleeve.position.set(0.2, -1.5, 0.2); sleeve.rotation.z = -0.35; hand.add(sleeve);
  const leaves = K.weather(scene, { kind: 'leaves', n: 30, box: [10, 6, 4], z0: 0 });
  K.shot(cam, 'close', [0.4, 2.6, -1.8], 16);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.12);
    const press = W(0.1, 0.6);
    odd.rotation.z = -0.05 - 0.17 * press;
    hand.position.set(1.0 + 0.35 * (1 - press), 2.25 + 0.15 * press, -1.55 + 0.3 * (1 - press)); hand.rotation.z = -0.2 - 0.15 * press;
    const p = oddM.geometry.attributes.position; for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k); p.setZ(k, (x > 0.3 && y > 0.4 ? 0.12 : 0) * (0.5 + 0.5 * Math.sin(ph * 2)) * (1 - 0.7 * press)); } p.needsUpdate = true;
    leaves.update(ph);
  };
}
