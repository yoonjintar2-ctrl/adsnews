// 11/14 도안나 미니 사설 「'다크' 한 단어가 팔레트를 정한다」 — 색을 빼야 시가 보인다
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#bdbdb7', line: '#a5a5a0', tiles: 6 });
  K.box(40, 20, 1, 0xb4b4ae, 0, 10, -10, scene);
  [-9, 9].forEach((x, i) => { K.box(4.2, 5.6, 0.3, 0x2a2a2a, x, 7, -9.4, scene); K.box(3.4, 4.8, 0.32, i ? 0x6a6a68 : 0x4a4a48, x, 7, -9.3, scene); });
  K.box(4, 1.4, 3, 0xe2e2dc, 0, 0.7, -5, scene);
  // 마네킹: 검은 롱코트(원뿔 자락) + 머리
  const mq = new THREE.Group(); mq.position.set(0, 1.4, -5); scene.add(mq);
  const coat = K.inked(new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.35, 4.2, 20), K.lam(0x1c1c1c)), 30); coat.position.y = 2.1; mq.add(coat);
  const sh = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.8, 18, 10, 0, 6.3, 0, 1.6), K.lam(0x1c1c1c)), 30); sh.scale.set(1.25, 0.45, 0.9); sh.position.y = 4.2; mq.add(sh);
  K.cyl(0.15, 0.15, 0.4, 0xd8d8d2, 0, 4.5, 0, mq); const hd = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.45, 18, 14), K.lam(0xd8d8d2)), 60); hd.position.y = 5.0; mq.add(hd);
  // 위에서 흔들리는 갓등 하나
  const lampG = new THREE.Group(); lampG.position.set(0, 13, -5); scene.add(lampG);
  K.line([[0, 0, 0], [0, -3.2, 0]], lampG); const shade = K.cyl(0.4, 1.3, 1.0, 0x1a1a1a, 0, -3.6, 0, lampG); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), K.flat(0xffffff)); bulb.position.y = -4.1; lampG.add(bulb);
  // 떠다니는 시 종이 셋
  const pt = K.canvasTex(256, 180, (g, w, h) => { g.fillStyle = '#f2f2ec'; g.fillRect(0, 0, w, h); g.fillStyle = '#333'; for (let i = 0; i < 5; i++) g.fillRect(28, 30 + i * 28, i % 2 ? 170 : 120, 7); });
  const papers = [[-3.6, 7.2, -4], [3.8, 6.4, -3.6], [2.6, 9.2, -6]].map(([x, y, z]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.12), new THREE.MeshBasicMaterial({ map: pt, side: THREE.DoubleSide })); m.position.set(x, y, z); scene.add(K.inked(m)); return { m, x, y }; });
  const A = K.person(scene, { x: -3.4, z: 3.2, coat: 0xcfcfca, hair: 'long', scale: 0.95 });
  const B = K.person(scene, { x: 3.4, z: 3.4, coat: 0x7a7a78 });
  cam.position.set(0, 4.6, 13.5); cam.lookAt(0, 4.6, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    lampG.rotation.z = Math.sin(ph) * 0.12; lampG.rotation.x = Math.cos(ph) * 0.05;
    papers.forEach((p, i) => { p.m.position.y = p.y + Math.sin(ph + i * 2) * 0.35; p.m.position.x = p.x + Math.cos(ph + i) * 0.2; p.m.rotation.z = Math.sin(ph + i) * 0.25; p.m.rotation.y = Math.sin(ph + i * 1.7) * 0.5; });
    mq.rotation.y = Math.sin(ph) * 0.12;
    const point = W(0.08, 0.55), turn = W(0.45, 0.9), chin = W(0.15, 0.85), nod = W(0.55, 0.9);
    A.pose({ headPitch: 0.15, headYaw: -1.3 * turn, torsoYaw: -0.45 * turn, armR: { fwd: 2.1 * point, out: -0.35 * point, elbow: 0.1, point: point > 0.3 }, armL: { fwd: 0.05 } });
    B.pose({ headPitch: 0.1 + Math.sin(ph * 4) * 0.12 * nod, headYaw: 0.25 + 1.0 * nod, torsoYaw: 0.35 * nod, armL: { fwd: 0.9 * chin, out: 0.15, elbow: 2.3 * chin }, armR: { fwd: 0.35 * chin, elbow: 1.2 * chin } });
  };
}
