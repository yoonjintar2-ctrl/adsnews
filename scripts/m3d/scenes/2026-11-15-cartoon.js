// 11/15 금로동 사설 「모델료 11억 반환 판결, 얼굴값에 환불 규정이 붙다」 — 얼굴은 내려도, 이야기는 남겨 둬야
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b4b4ae', tiles: 4 });
  K.building(scene, -15, -14, 8, 6, 16, 3); K.building(scene, 15, -14, 8, 6, 18, 7);
  // 광고판 + 얼굴 없는 모델 포스터(위로 말려 올라가는 중)
  K.box(16, 9.5, 0.6, 0x2a2a2a, 0, 8.2, -9.4, scene);
  K.box(15.2, 8.7, 0.1, 0x8e8e8a, 0, 8.2, -9.05, scene);
  [-5, 5].forEach(x => K.cyl(0.3, 0.3, 3.6, 0x222222, x, 1.8, -9.4, scene, 8));
  const poster = K.canvasTex(512, 300, (g, w, h) => { g.fillStyle = '#e6e6e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a3a3a';
    g.beginPath(); g.arc(256, 110, 52, 0, 7); g.fill(); g.beginPath(); g.moveTo(150, 300); g.quadraticCurveTo(256, 150, 362, 300); g.fill(); });
  const pG = new THREE.Group(); pG.position.set(0, 12.4, -8.95); scene.add(pG);
  const pm = new THREE.Mesh(new THREE.PlaneGeometry(14.6, 8.2), new THREE.MeshBasicMaterial({ map: poster })); pm.geometry.translate(0, -4.1, 0); pG.add(pm);
  const roll = K.cyl(0.45, 0.45, 14.8, 0xdcdcd6, 0, 0, 0, scene, 16); roll.rotation.z = Math.PI / 2;
  // 갓등 셋(흔들림)
  const lamps = [-5, 0, 5].map(x => { const g = new THREE.Group(); g.position.set(x, 15.2, -8); scene.add(g); K.line([[0, 0, 0], [0, -1.4, 0]], g); K.cyl(0.25, 0.9, 0.6, 0x1a1a1a, 0, -1.6, 0, g, 14); return g; });
  // 사다리 + 인부
  const lx = 8.6; [-0.7, 0.7].forEach(dx => { const r = K.box(0.18, 11, 0.18, 0x333333, lx + dx, 5.4, -7.8, scene); r.rotation.x = -0.12; });
  for (let i = 0; i < 9; i++) K.box(1.4, 0.12, 0.14, 0x333333, lx, 0.8 + i * 1.15, -7.8 + 0.12 * (0.8 + i * 1.15) * 0.12, scene);
  const W1 = K.person(scene, { x: lx, z: -7.2, rot: 0.15, coat: 0x8a8a86, hair: 'cap', scale: 0.85 });
  // 마케터 둘 — 계약서 vs 스케치북
  const A = K.person(scene, { x: -3.2, z: 1.5, rot: -2.1, coat: 0x2a2a2a, pants: 0x1e1e1e, scale: 1.1 });
  const B = K.person(scene, { x: 3.0, z: 1.5, rot: 2.1, coat: 0xbdbdb8, hair: 'long', scale: 1.05 });
  const scroll = K.cyl(0.18, 0.18, 0.9, 0xf0f0ea, 0, 1.05, -0.75, A.torso, 10); scroll.rotation.z = Math.PI / 2;
  const sk = K.canvasTex(256, 192, (g, w, h) => { g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, w, h); g.strokeStyle = '#222'; g.lineWidth = 8; g.beginPath(); g.arc(128, 80, 36, 0, 7); g.stroke(); g.beginPath(); g.moveTo(108, 130); g.lineTo(148, 130); g.stroke();
    [[128, 22, 128, 6], [70, 80, 52, 80], [186, 80, 204, 80]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }); });
  const book = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), new THREE.MeshBasicMaterial({ map: sk, side: THREE.DoubleSide })); book.position.set(0, 1.2, -0.8); book.rotation.y = Math.PI; B.torso.add(book);
  const mo = K.motes(scene, { n: 40, size: 0.1 });
  cam.position.set(0, 6.2, 16); cam.lookAt(0, 6.2, -5);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    lamps.forEach((g, i) => { g.rotation.z = Math.sin(ph + i * 0.9) * 0.16; g.rotation.x = Math.cos(ph + i) * 0.06; }); mo.update(ph);
    const r = 0.55 + 0.25 * Math.sin(ph); pG.scale.y = r; roll.position.set(0, 12.4 - 8.2 * r, -8.7); roll.rotation.x = -ph * 2;
    W1.pose({ armL: { fwd: 2.9, out: 0.1, elbow: 0.2 + 0.2 * Math.sin(ph * 2) }, armR: { fwd: 2.7, elbow: 0.3 + 0.2 * Math.cos(ph * 2) }, headPitch: -0.4, bob: 4.6 });
    const pt = W(0.35, 0.8), nod = W(0.1, 0.35);
    A.pose({ headYaw: -0.1, headPitch: -0.05 + 0.15 * Math.sin(ph * 6) * nod, armR: { fwd: 1.0, elbow: 1.1 }, armL: { fwd: 0.9, elbow: 1.3 }, lean: 0.06 * pt });
    B.pose({ headYaw: 0.15 * Math.sin(ph), armL: { fwd: 1.0, elbow: 1.1 }, armR: { fwd: 0.9 + 1.1 * pt, out: -0.2 * pt, elbow: 0.9 * (1 - pt), point: pt > 0.4 }, lean: 0.05 });
  };
}
