// 11/14 오늘의 광고인 폴 아든 — 얼마나 잘하고 싶으냐를 묻는 얇은 책
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#a7a7a2', tiles: 4 });
  K.box(30, 20, 1, 0xb8b8b2, 0, 10, -8, scene);
  // 창: 지붕·굴뚝 실루엣(캔버스)
  const roofs = K.canvasTex(512, 320, (g, w, h) => { g.fillStyle = '#e4e4de'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a5a58'; g.beginPath(); g.moveTo(0, 230); [[60, 170], [120, 220], [120, 190], [200, 140], [280, 200], [280, 175], [360, 150], [420, 190], [512, 160], [512, 320], [0, 320]].forEach(p => g.lineTo(...p)); g.fill(); [70, 240, 440].forEach(x => g.fillRect(x, 120, 20, 60)); g.strokeStyle = '#333'; g.lineWidth = 3; g.beginPath(); g.arc(400, 70, 30, 0, 7); g.stroke(); });
  const win = K.screen(scene, { tex: roofs, x: 0, y: 8.4, z: -7.3, w: 9, h: 5.6, frame: 0x2a2a2a });
  K.box(0.2, 5.6, 0.1, 0x2a2a2a, 0, 8.4, -7.0, scene); K.box(9, 0.2, 0.1, 0x2a2a2a, 0, 8.4, -7.0, scene);
  // 책상·스탠드·얇은 책 더미
  K.box(10, 0.4, 3.4, 0x6a6a68, 0, 3.6, -3.6, scene); [-4.6, 4.6].forEach(x => K.box(0.4, 3.4, 3, 0x4a4a48, x, 1.7, -3.6, scene));
  for (let i = 0; i < 5; i++) K.box(2.0, 0.18, 1.4, i % 2 ? 0xdedede : 0x8a8a88, -3.4, 3.9 + i * 0.19, -3.8, scene);
  K.cyl(0.4, 0.5, 0.15, 0x1a1a1a, 3.6, 3.88, -4.4, scene); K.cyl(0.06, 0.06, 2.2, 0x1a1a1a, 3.6, 5.0, -4.4, scene);
  const lampHead = K.cyl(0.15, 0.6, 0.6, 0x1a1a1a, 3.0, 6.0, -4.1, scene); lampHead.rotation.z = 0.6;
  // 펼친 책: 넘어가는 한 장
  const pg = K.canvasTex(128, 160, (g, w, h) => { g.fillStyle = '#f3f3ee'; g.fillRect(0, 0, w, h); g.fillStyle = '#444'; for (let i = 0; i < 6; i++) g.fillRect(14, 20 + i * 22, i % 3 ? 90 : 60, 5); });
  [-0.55, 0.55].forEach(x => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), new THREE.MeshBasicMaterial({ map: pg })); m.rotation.x = -Math.PI / 2; m.position.set(0.9 + x, 3.82, -3.0); scene.add(m); });
  const flipG = new THREE.Group(); flipG.position.set(0.9, 3.84, -3.0); scene.add(flipG);
  const leaf = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), new THREE.MeshBasicMaterial({ map: pg, side: THREE.DoubleSide })); leaf.geometry.translate(0.55, 0, 0); leaf.rotation.x = -Math.PI / 2; flipG.add(K.inked(leaf));
  // 벽 메모(살랑)
  const notes = [[-6.8, 9, -7.4], [6.6, 8.2, -7.4], [-6, 6.4, -7.4]].map(([x, y, z], i) => { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); const m = K.box(1.3, 1.5, 0.04, 0xf0f0ea, 0, -0.75, 0, g); return g; });
  const b1 = K.bird(scene, { cx: 0, cy: 9.6, cz: -7.1, rx: 3.6, rz: 0.01, s: 0.7 });
  // 뒷모습: 서서 메모하는 사람
  const P = K.person(scene, { x: -0.9, z: -1.2, coat: 0x8c8c88, scale: 1.35 });
  cam.position.set(0, 6.2, 9.5); cam.lookAt(0, 5.6, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.08);
    win.update(ph, 0); b1.update(ph);
    notes.forEach((g, i) => { g.rotation.z = Math.sin(ph * 2 + i) * 0.06; g.rotation.x = Math.sin(ph + i) * 0.1; });
    flipG.rotation.z = Math.PI * W(0.4, 0.75) * 0.98;
    const write = 1 - W(0.38, 0.78), lookUp = W(0.42, 0.75);
    P.pose({ lean: 0.25 * write, headPitch: 0.45 * write - 0.15 * lookUp, headYaw: 0.25 * lookUp, torsoYaw: 0.08 * lookUp,
      armR: { fwd: 0.9 + Math.sin(ph * 10) * 0.06 * write, out: -0.2, elbow: 0.9 + Math.sin(ph * 10 + 1) * 0.12 * write }, armL: { fwd: 0.85, out: -0.1, elbow: 0.7 } });
  };
}
