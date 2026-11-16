// 11/17 오늘의 광고인 김석년 — 숲이 보이는 창가에서 원고를 쓰는 뒷모습 실루엣, 종이 위 어린 나무들이 흔들리며 자란다(얼굴 세부 없음)
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b0b0aa', tiles: 5 });
  K.box(40, 20, 1, 0x9a9a96, 0, 10, -9, scene);
  const forest = K.canvasTex(512, 300, (g, w, h) => { g.fillStyle = '#e8e8e2'; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { const x = i * 34 + (i % 3) * 6, hh = 120 + (i * 37 % 110); g.fillStyle = ['#555', '#777', '#333'][i % 3]; g.beginPath(); g.moveTo(x, h - hh); g.lineTo(x - 30, h); g.lineTo(x + 30, h); g.fill(); } });
  forest.repeat.set(1, 1);
  const win = K.screen(scene, { tex: forest, x: 0, y: 11, z: -8.3, w: 14, h: 7, frame: 0x222222, border: 0.6 });
  K.box(0.3, 7, 0.2, 0x222222, 0, 11, -8.0, scene);
  // 책상
  K.box(12, 0.4, 4, 0x2a2a2a, 0, 4.2, -3, scene); [[-5.6, -4.6], [5.6, -4.6], [-5.6, -1.4], [5.6, -1.4]].forEach(([x, z]) => K.box(0.3, 4.2, 0.3, 0x1a1a1a, x, 2.1, z, scene));
  K.box(3.2, 0.06, 2.2, 0xf6f6f2, 1.6, 4.43, -3, scene);
  // 종이 위 어린 나무 셋
  const trees = [0.6, 1.6, 2.6].map((x, i) => { const g = new THREE.Group(); g.position.set(x, 4.46, -3.3 + (i % 2) * 0.4); scene.add(g); K.cyl(0.05, 0.08, 1.4 + i * 0.4, 0x2a2a2a, 0, (1.4 + i * 0.4) / 2, 0, g, 6);
    const c = K.inked(new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.1, 10), K.lam([0x6a6a68, 0x8a8a86, 0x4a4a48][i]))); c.position.y = 1.4 + i * 0.4; g.add(c); return g; });
  // 뒷모습 실루엣(얼굴 없음): 카메라를 등진 사람
  const P = K.person(scene, { x: -1.2, z: 0.2, rot: 0, coat: 0x1e1e1e, pants: 0x161616, skin: 0x2a2a2a, scale: 1.05 });
  const pen = K.cyl(0.04, 0.04, 0.7, 0x111111, 0, 0, 0, scene, 6);
  const lamp = new THREE.Group(); lamp.position.set(3, 17, -2); scene.add(lamp); K.line([[0, 0, 0], [0, -4.5, 0]], lamp); K.cyl(0.3, 1.2, 0.8, 0x1a1a1a, 0, -4.8, 0, lamp, 14);
  const b = K.bird(scene, { cx: 0, cy: 12.5, cz: -9.8, rx: 5, rz: 0.2, s: 1.2 });
  cam.position.set(0, 7.2, 10); cam.lookAt(0, 6.0, -4);
  return (t, ph) => {
    trees.forEach((g, i) => { g.rotation.z = Math.sin(ph * 2 + i) * 0.12; const s = 0.85 + 0.15 * (0.5 + 0.5 * Math.sin(ph + i * 2)); g.scale.set(s, s, s); });
    lamp.rotation.z = Math.sin(ph) * 0.1; b.update(ph);
    const w = Math.sin(ph * 6);
    P.pose({ headPitch: 0.35, headYaw: -0.15 + 0.1 * Math.sin(ph), lean: 0.15, armR: { fwd: 1.0, out: -0.25 + 0.06 * w, elbow: 0.7 }, armL: { fwd: 0.9, out: -0.1, elbow: 0.9 } });
    P.root.updateMatrixWorld(true); const v = new THREE.Vector3(0.75 - 0.06 * w, 0.9, -1.6); P.torso.localToWorld(v); pen.position.copy(v); pen.rotation.set(0.6, 0, -0.5 + 0.1 * w);
  };
}
