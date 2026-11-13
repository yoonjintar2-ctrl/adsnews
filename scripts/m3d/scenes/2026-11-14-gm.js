// 11/14 안광주 미니 사설 「크리에이터 영상, 어느 줄에 적을 건가」 — 섭외와 집행, 한 줄로 잇는다
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#acaca7', tiles: 5 });
  K.box(40, 20, 1, 0xc2c2bc, 0, 10, -10, scene);
  K.box(13, 7, 0.4, 0x222222, 0, 6.5, -9.2, scene); K.box(12.4, 6.4, 0.42, 0xefefea, 0, 6.5, -9.15, scene); K.box(0.12, 6, 0.44, 0x555555, 0, 6.5, -9.1, scene);
  const cam1 = K.canvasTex(256, 200, (g, w, h) => { g.fillStyle = '#efefea'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.fillRect(40, 60, 176, 110); g.fillRect(70, 40, 50, 24); g.fillStyle = '#efefea'; g.beginPath(); g.arc(128, 115, 38, 0, 7); g.fill(); g.fillStyle = '#222'; g.beginPath(); g.arc(128, 115, 20, 0, 7); g.fill(); });
  const play = K.canvasTex(256, 200, (g, w, h) => { g.fillStyle = '#efefea'; g.fillRect(0, 0, w, h); g.strokeStyle = '#222'; g.lineWidth = 12; g.strokeRect(30, 30, 196, 140); g.fillStyle = '#222'; g.beginPath(); g.moveTo(105, 65); g.lineTo(165, 100); g.lineTo(105, 135); g.fill(); });
  [[cam1, -3], [play, 3]].forEach(([tx, x]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.5), new THREE.MeshBasicMaterial({ map: tx })); m.position.set(x, 7.6, -8.9); scene.add(m); });
  // 두 칸을 잇는 줄(그려지는 중)
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1, 0.22, 0.05), K.flat(0x1a1a1a)); bar.position.set(-1.5, 5.4, -8.88); scene.add(bar);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 3), K.flat(0x1a1a1a)); head.rotation.z = -Math.PI / 2; head.position.set(1.6, 5.4, -8.86); scene.add(head);
  // 천장 갓등 셋
  const lamps = [-6, 0, 6].map(x => { const g = new THREE.Group(); g.position.set(x, 13, -3); scene.add(g); K.line([[0, 0, 0], [0, -2, 0]], g); K.cyl(0.3, 1.0, 0.8, 0x1a1a1a, 0, -2.3, 0, g); return g; });
  // 링라이트 + 크리에이터
  const ring = K.inked(new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.12, 8, 30), K.lam(0xf4f4f0)), 10); ring.position.set(-6.4, 5.6, -1.5); scene.add(ring); K.cyl(0.06, 0.06, 4.6, 0x222222, -6.4, 2.3, -1.5, scene);
  const C = K.person(scene, { x: -4.4, z: 0.2, rot: Math.PI - 0.5, coat: 0xd2d2cc, hair: 'bun' });
  const phone = K.box(0.5, 0.9, 0.08, 0x111111, 0, 0, 0, scene);
  const AE = K.person(scene, { x: 2.8, z: 2.6, coat: 0x2a2a2a });
  const mo = K.motes(scene, { n: 24 });
  cam.position.set(0, 4.8, 15); cam.lookAt(0, 5, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    lamps.forEach((g, i) => { g.rotation.z = Math.sin(ph + i) * 0.1; }); mo.update(ph);
    const draw = W(0.1, 0.92); const u = Math.min(1, draw * 1.0);
    bar.scale.x = 0.05 + 3.0 * u; bar.position.x = -1.5 + bar.scale.x / 2; head.visible = u > 0.95; head.position.x = bar.position.x + bar.scale.x / 2 + 0.2;
    ring.rotation.y = Math.sin(ph) * 0.2;
    const wave = W(0.2, 0.85);
    C.pose({ headYaw: 0.3, armL: { fwd: 1.5, out: 0.2, elbow: 0.9 }, armR: { fwd: 0.2 + 0.4 * wave, out: 1.6 * wave + Math.sin(ph * 8) * 0.35 * wave, elbow: 0.6 * wave } });
    phone.position.set(-4.4 + 0.5, 3.7, 0.2 + 0.9); phone.rotation.y = 0.5;
    const look = W(0.5, 0.92);
    AE.pose({ headPitch: 0.12, headYaw: 1.25 * look, torsoYaw: 0.35 * look, armR: { fwd: 2.2 * (1 - look * 0.4), out: -0.5, elbow: 0.15, point: true }, armL: { fwd: 0.1 } });
  };
}
