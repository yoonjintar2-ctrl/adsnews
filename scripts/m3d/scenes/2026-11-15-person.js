// 11/15 오늘의 광고인 빌 배커 — 뒷모습 실루엣, 노랫말을 적는 책상과 창밖 언덕의 사람들(얼굴 세부 없음)
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#a8a8a2', tiles: 5 });
  K.box(30, 20, 1, 0x8c8c88, 0, 10, -6, scene);
  const hill = K.canvasTex(512, 320, (g, w, h) => { g.fillStyle = '#e4e4de'; g.fillRect(0, 0, w, h); g.fillStyle = '#9a9a94'; g.beginPath(); g.moveTo(0, 230); g.quadraticCurveTo(250, 120, 512, 210); g.lineTo(512, 320); g.lineTo(0, 320); g.fill();
    g.fillStyle = '#2a2a2a'; for (let i = 0; i < 11; i++) { const x = 60 + i * 38, y = 190 - Math.sin(i / 10 * Math.PI) * 30; g.beginPath(); g.arc(x, y - 22, 7, 0, 7); g.fill(); g.fillRect(x - 7, y - 15, 14, 24); if (i < 10) g.fillRect(x + 6, y - 8, 28, 3); } });
  const win = K.screen(scene, { tex: hill, x: 0, y: 8.4, z: -5.3, w: 9, h: 5.6, frame: 0x2a2a2a, border: 0.7 });
  K.box(0.25, 5.6, 0.2, 0x2a2a2a, 0, 8.4, -5.1, scene);
  // 책상·종이·스탠드
  K.box(10, 0.4, 3.6, 0x4a4a48, 0, 4.0, -2.6, scene); [-4.6, 4.6].forEach(x => K.box(0.4, 4, 3.2, 0x3a3a38, x, 2, -2.6, scene));
  const paper = K.box(2.0, 0.04, 1.4, 0xf4f4f0, 0.6, 4.25, -2.2, scene); paper.rotation.y = 0.2;
  K.box(1.4, 1.0, 1.0, 0x6a6a68, -3.2, 4.7, -3.0, scene); K.box(1.3, 0.6, 0.9, 0x8a8a86, -3.2, 5.5, -3.0, scene);
  const lampG = new THREE.Group(); lampG.position.set(3.6, 12.5, -2.6); scene.add(lampG); K.line([[0, 0, 0], [0, -3.2, 0]], lampG); K.cyl(0.3, 1.0, 0.6, 0x1a1a1a, 0, -3.5, 0, lampG, 14);
  // 떠다니는 음표
  const notes = [[-3, 9.5], [-1.4, 10.6], [1.6, 9.8], [3, 11]].map(([x, y], i) => { const g = new THREE.Group(); g.position.set(x, y, -4.4); scene.add(g);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), K.flat(0x111111)); h.scale.set(1.3, 0.9, 0.6); g.add(h); const s = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.0, 0.07), K.flat(0x111111)); s.position.set(0.28, 0.5, 0); g.add(s);
    const fl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.07), K.flat(0x111111)); fl.position.set(0.45, 0.95, 0); fl.rotation.z = -0.5; g.add(fl); return g; });
  // 뒷모습 남자(실루엣)
  const P = K.person(scene, { x: 0.2, z: 0.6, rot: 0, coat: 0x2a2a2a, pants: 0x1e1e1e, skin: 0x3a3a3a, scale: 1.25 });
  const birdA = K.bird(scene, { cx: 0, cy: 9.6, cz: -5.0, rx: 3.6, rz: 0.1, s: 0.6 });
  cam.position.set(0, 6.4, 13.5); cam.lookAt(0, 6.6, -3);
  return (t, ph) => {
    lampG.rotation.z = Math.sin(ph) * 0.12; birdA.update(ph);
    notes.forEach((g, i) => { g.position.y = [9.5, 10.6, 9.8, 11][i] + Math.sin(ph + i * 1.6) * 0.35; g.rotation.z = Math.sin(ph + i) * 0.25; });
    const w = Math.sin(ph * 6) * 0.08;
    P.pose({ lean: 0.18, headPitch: 0.25 + 0.15 * K.win(ph, 0.55, 0.9, 0.1) * -2, headYaw: 0.15 * Math.sin(ph), armR: { fwd: 1.1, elbow: 0.7 + w, out: -0.15 }, armL: { fwd: 1.0, elbow: 0.9, out: 0.05 } });
  };
}
