// 11/17 안광주 미니 사설 「PT가 돌아올 때, 브리프부터 다시 읽자」 — 열리는 문, 동그라미 늘어나는 달력, 브리프를 읽으며 끄덕이는 AE와 문을 가리키는 동료
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b4b4ae', tiles: 6 });
  K.box(40, 20, 1, 0x9c9c98, 0, 10, -9, scene);
  // 달력(동그라미가 늘어남)
  const cal = n => K.canvasTex(320, 260, (g, w, h) => { g.fillStyle = '#efefe9'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.fillRect(0, 0, w, 44); g.strokeStyle = '#444'; g.lineWidth = 3;
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) { g.strokeRect(18 + i * 60, 60 + j * 48, 44, 36); } g.lineWidth = 6; g.strokeStyle = '#111';
    const C = [[0, 0], [3, 0], [1, 1], [4, 1], [2, 2], [0, 3], [3, 3], [4, 2]]; C.slice(0, n).forEach(([i, j]) => { g.beginPath(); g.arc(40 + i * 60, 78 + j * 48, 22, 0, 7); g.stroke(); }); });
  const texs = [3, 5, 8].map(cal); texs.forEach(t => { t.repeat.set(0.96, 0.96); t.offset.set(0.02, 0.02); });
  const scr = K.screen(scene, { tex: texs[0], x: -7, y: 10, z: -8.3, w: 7, h: 5.7, frame: 0x161616, border: 0.3 });
  // 문
  K.box(5, 9.2, 0.3, 0x2a2a2a, 7.5, 4.6, -8.3, scene); K.box(4.4, 8.6, 0.1, 0xf0f0ea, 7.5, 4.3, -8.1, scene);
  const door = new THREE.Group(); door.position.set(5.3, 0, -7.9); scene.add(door); K.box(4.4, 8.6, 0.25, 0x5a5a58, 2.2, 4.3, 0, door);
  const lamp = new THREE.Group(); lamp.position.set(-1, 17, -3); scene.add(lamp); K.line([[0, 0, 0], [0, -3.5, 0]], lamp); K.cyl(0.3, 1.2, 0.8, 0x1a1a1a, 0, -3.8, 0, lamp, 14);
  const A = K.person(scene, { x: 0.5, z: 2, rot: Math.PI - 0.2, coat: 0x3a3a38, scale: 1.12 });
  const doc = new THREE.Group(); A.torso.add(doc); doc.position.set(0, 1.0, -1.25); doc.rotation.x = -0.5; [0, 1, 2].forEach(i => K.box(1.5, 1.05, 0.08, i ? 0xdcdcd6 : 0xf6f6f2, 0.04 * i, -0.04 * i, 0.06 * i, doc));
  const B = K.person(scene, { x: -3.6, z: 3.2, rot: -1.3, coat: 0x8a8a86, hair: 'long', scale: 1.05 });
  const mo = K.motes(scene, { n: 18, box: [8, 8, 4], z0: -6, size: 0.14 });
  cam.position.set(0, 6.0, 14); cam.lookAt(0, 6.0, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    const u = ((ph / 6.283) % 1 + 1) % 1; scr.s.material.map = texs[Math.min(2, Math.floor(u * 3))];
    door.rotation.y = -1.0 * W(0.08, 0.7);
    lamp.rotation.z = Math.sin(ph) * 0.12; mo.update(ph);
    A.pose({ headPitch: 0.35 + 0.12 * Math.sin(ph * 4), headYaw: 0.05, armL: { fwd: 1.25, out: -0.3, elbow: 1.0 }, armR: { fwd: 1.25, out: -0.3, elbow: 1.0 } });
    doc.rotation.z = 0.05 * Math.sin(ph * 2);
    const p = W(0.2, 0.85);
    B.pose({ headYaw: -1.0 * (1 - p), torsoYaw: 0.1 * p, armR: { fwd: 1.6 * p + 0.2, out: 0.3 * p, point: p > 0.4 }, armL: { fwd: 0.3, elbow: 0.5 } });
  };
}
