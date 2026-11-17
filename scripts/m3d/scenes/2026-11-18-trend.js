// 11/18 도안나 트렌드 노트 「촉감 디자인」
// 낮 뜨개 공방, 측면 구도: 벽에 걸린 큰 뜨개 견본을 한 사람이 손바닥으로 쓸어 보면 견본이 물결처럼 일렁이고, 탁자 위 털실 뭉치가 굴러가며 실이 풀린다. 뜨개바늘이 까딱인다.
export const secs = 3;
export const meta = { place: '낮 뜨개 공방 견본 벽', where: 'indoor', time: 'day', camera: 'side', floor: 'wood', figures: 'solo-side', motion: ['swatch-ripple', 'hand-stroke', 'yarn-roll', 'needle-tap'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  const R = K.room(scene, { w: 22, d: 12, h: 8, wall: 'brick', wallColor: '#a8a49c', floorStyle: 'wood', windowAt: [6, 4.6, 3.6, 3], curtain: true });
  // 뜨개 견본(캔버스 니트 무늬, 일렁이는 평면)
  const knit = K.canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#cfcbc2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#4a4744'; g.lineWidth = 4; for (let y = 0; y < h; y += 26) for (let x = 0; x < w; x += 26) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 13, y + 18); g.lineTo(x + 26, y); g.stroke(); } });
  const sw = new THREE.Mesh(new THREE.PlaneGeometry(5, 5.4, 24, 24), new THREE.MeshLambertMaterial({ map: knit, side: THREE.DoubleSide })); sw.position.set(-2.5, 4.1, -5.7); scene.add(sw);
  K.cyl(0.08, 0.08, 5.6, 0x3a3a3a, -2.5, 6.9, -5.6, scene, 8).rotation.z = Math.PI / 2;
  const P = K.person(scene, { x: 0.6, z: -4.1, rot: -Math.PI / 2 + 0.9, coat: 0x7a766f, hair: 'long', scale: 1.0 });
  // 탁자 + 털실 + 바늘
  K.box(4.2, 0.2, 2.2, 0x6a5f52, -7.4, 2.4, -2.8, scene); [-1.8, 1.8].forEach(a => K.box(0.15, 2.4, 0.15, 0x333333, -7.4 + a, 1.2, -2.8, scene));
  const ball = K.inked(new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 1), K.lam(0x8e8a84)), 20); scene.add(ball);
  const ball2 = K.inked(new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), K.lam(0x5a5754)), 20); ball2.position.set(-6.0, 2.82, -3.3); scene.add(ball2);
  const needles = new THREE.Group(); needles.position.set(-8.6, 2.55, -2.4); scene.add(needles); [-0.1, 0.1].forEach(a => { const n = K.cyl(0.04, 0.04, 2.2, 0x2a2a2a, a, 0, 0, needles, 6); n.rotation.z = Math.PI / 2 - 0.2; });
  const yarn = []; for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 5, 4), K.flat(0x55524e)); scene.add(s); yarn.push(s); }
  cam.position.set(11.5, 4.0, -1.0); cam.lookAt(0, 3.6, -4.2);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.12);
    const st = W(0.1, 0.85); const sweep = Math.sin(ph * 2);
    P.pose({ headYaw: 0.1, headTilt: 0.1 * st, armR: { fwd: 1.4 * st + 0.1, out: 0.1 + 0.15 * sweep * st, elbow: 0.4 }, armL: { fwd: 0.2 } });
    const p = sw.geometry.attributes.position; const hx = 1.6 * sweep * st;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k); const d = Math.hypot(x - hx, y - 0.2); p.setZ(k, 0.18 * st * Math.cos(d * 2.4 - ph * 3) * Math.exp(-d * 0.5)); } p.needsUpdate = true; sw.geometry.computeVertexNormals();
    const u = (Math.sin(ph) + 1) / 2; ball.position.set(-8.6 + u * 2.4, 2.9, -2.4); ball.rotation.z = -u * 4.4;
    yarn.forEach((s, i) => { const k = i / 13; s.position.set(-9.2 + k * (ball.position.x + 9.2), 2.52 + Math.sin(k * 3.14) * 0.05, -2.4); });
    needles.rotation.y = 0.15 * Math.sin(ph * 4);
    R.update(ph, 0.06);
  };
}
