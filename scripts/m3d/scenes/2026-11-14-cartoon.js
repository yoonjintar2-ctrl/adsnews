// 11/14 금로동 사설 「진지한 얼굴의 반전, 보험 광고를 끝까지 보게 하다」 — 진지할수록 반전은 커진다
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#a9a9a4', line: '#9a9a95', tiles: 4 });
  K.box(44, 22, 1, 0xa0a09c, 0, 11, -12, scene);
  K.box(14, 0.8, 6, 0xdadad4, 0, 0.4, -5, scene);
  // 뒤쪽 모니터 여섯 대(여섯 편) — 화면 속 그림은 고정, 밝기만 깜박
  const icons = [0, 1, 2, 0, 1, 2].map((k, i) => K.canvasTex(256, 176, (g, w, h) => { g.fillStyle = '#e8e8e2'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.strokeStyle = '#222'; g.lineWidth = 8;
    if (k === 0) { g.beginPath(); g.arc(128, 70, 26, 0, 7); g.fill(); g.fillRect(84, 104, 88, 50); }
    if (k === 1) { g.beginPath(); g.moveTo(60, 150); g.lineTo(120, 50); g.lineTo(180, 150); g.fill(); g.beginPath(); g.arc(196, 52, 18, 0, 7); g.fill(); }
    if (k === 2) { g.beginPath(); g.arc(98, 76, 20, 0, 7); g.arc(158, 76, 20, 0, 7); g.fill(); g.beginPath(); g.arc(128, 104, 40, 0.2, Math.PI - 0.2); g.stroke(); } }));
  const scr = icons.map((tex, i) => K.screen(scene, { tex, x: -10 + i * 4, y: 8.6, z: -11.2, w: 3.2, h: 2.2 }));
  const lamps = K.lanternString(scene, { x0: -9, x1: 9, y: 11.0, z: -2.5, n: 7, sag: 0.8, size: 0.8 });
  // 진지한 남자(정면)
  const M = K.person(scene, { x: -0.6, z: -5, rot: Math.PI, coat: 0x2a2a2a, pants: 0x1e1e1e, scale: 1.15 });
  // 깜짝 상자: 용수철 + 웃는 얼굴
  const jb = K.box(1.3, 1.1, 1.3, 0x5a5a58, 3.4, 1.35, -4.4, scene);
  const lid = K.box(1.35, 0.12, 1.35, 0x3a3a38, 0, 0, 0); const lidG = new THREE.Group(); lidG.position.set(3.4, 1.9, -5.05); lid.position.set(0, 0, 0.65); lidG.add(lid); scene.add(lidG);
  const spring = K.cyl(0.12, 0.12, 1, 0x222222, 3.4, 1.9, -4.4, scene, 8);
  const jh = new THREE.Group(); scene.add(jh);
  const face = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 14), K.lam(0xeeeeea)), 60); jh.add(face);
  [-1, 1].forEach(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), K.flat(0x111111)); e.position.set(s * 0.18, 0.1, 0.5); jh.add(e); });
  const sm = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 6, 16, Math.PI), K.flat(0x111111)); sm.rotation.z = Math.PI; sm.position.set(0, -0.08, 0.5); jh.add(sm);
  const hat = K.cyl(0.0, 0.3, 0.6, 0x444444, 0, 0.75, 0, jh, 12);
  // 앞쪽 관객 둘(뒷모습)
  const A = K.person(scene, { x: -4.2, z: 4.6, coat: 0x8a8a8a });
  const B = K.person(scene, { x: 4.4, z: 4.8, coat: 0xcfcfca, hair: 'long', scale: 0.95 });
  const mo = K.motes(scene, { n: 30 });
  cam.position.set(0, 4.2, 13.5); cam.lookAt(0, 4.6, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.08);
    scr.forEach((s, i) => { s.update(ph, 0); s.s.material.color.setScalar(0.8 + 0.2 * Math.max(0, Math.sin(ph * 2 + i))); });
    lamps.update(ph, 0.16); mo.update(ph);
    const pop = W(0.22, 0.8);
    spring.scale.y = 0.15 + 2.3 * pop; spring.position.y = 1.9 + spring.scale.y / 2;
    jh.position.set(3.4 + Math.sin(ph * 6) * 0.12 * pop, 1.9 + spring.scale.y + 0.6, -4.4); jh.rotation.z = Math.sin(ph * 6) * 0.25 * pop; jh.scale.setScalar(0.4 + 1.0 * pop);
    lidG.rotation.x = -1.9 * pop;
    const glance = W(0.36, 0.72);
    M.pose({ bob: 0.8, headYaw: 0.9 * glance, headPitch: -0.05, torsoYaw: 0.15 * glance, armL: { fwd: 0.9, out: 0.1, elbow: 1.5 }, armR: { fwd: 0.05 } });
    const laugh = W(0.32, 0.9), pt = W(0.3, 0.7);
    A.pose({ bob: Math.abs(Math.sin(ph * 9)) * 0.08 * laugh, lean: 0.12 * laugh, headYaw: -0.2 * pt, headPitch: 0.1,
      armR: { fwd: 2.0 * pt, out: -0.25 * pt, elbow: 0.1, point: pt > 0.3 }, armL: { fwd: 0.6 * laugh, elbow: 1.6 * laugh } });
    B.pose({ bob: Math.abs(Math.sin(ph * 9 + 1)) * 0.08 * laugh, lean: 0.18 * laugh, headYaw: 0.9 * W(0.5, 0.88), torsoYaw: 0.3 * W(0.5, 0.88), headTilt: 0.15 * laugh,
      armL: { fwd: 0.9 * laugh, out: 0.2, elbow: 2.3 * laugh }, armR: { fwd: 0.05 } });
  };
}
