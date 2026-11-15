// 11/16 금로동 사설 「하트는 9.9원, 다시 올 이유는 얼마인가」 — 숫자는 사도, 다시 오는 발걸음은 못 산다
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b4b4ae', tiles: 5 });
  K.box(40, 20, 1, 0x9c9c98, 0, 10, -9, scene);
  // 벽 화면: 하트 가득
  const hearts = (g, w, h, n, seed) => { let s = seed; const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h, z = 10 + r() * 22; g.fillStyle = r() > 0.5 ? '#222' : '#777'; g.beginPath(); g.moveTo(x, y + z * 0.9); g.bezierCurveTo(x - z * 1.6, y - z * 0.2, x - z * 0.9, y - z * 1.3, x, y - z * 0.45); g.bezierCurveTo(x + z * 0.9, y - z * 1.3, x + z * 1.6, y - z * 0.2, x, y + z * 0.9); g.fill(); } };
  const tx = K.canvasTex(640, 380, (g, w, h) => { g.fillStyle = '#ecece6'; g.fillRect(0, 0, w, h); hearts(g, w, h, 60, 3); });
  const scr = K.screen(scene, { tex: tx, x: -4.5, y: 9.2, z: -8.3, w: 11, h: 6.4, frame: 0x161616, border: 0.6 });
  // 화면 밖으로 떠오르는 하트들
  const hg = []; for (let i = 0; i < 7; i++) { const sh = new THREE.Shape(); sh.moveTo(0, -0.45); sh.bezierCurveTo(-0.8, 0.1, -0.45, 0.65, 0, 0.22); sh.bezierCurveTo(0.45, 0.65, 0.8, 0.1, 0, -0.45);
    const m = K.inked(new THREE.Mesh(new THREE.ShapeGeometry(sh), K.flat(i % 2 ? 0x222222 : 0xeeeeea))); m.position.set(-9 + i * 1.6, 12.6, -7.6); scene.add(m); hg.push(m); }
  // 테이블 둘 + 의자(텅 빔)
  const table = (x, z) => { K.box(3.4, 0.25, 2.2, 0x6a6a66, x, 2.8, z, scene); [[-1.4, -0.8], [1.4, -0.8], [-1.4, 0.8], [1.4, 0.8]].forEach(([a, b]) => K.box(0.2, 2.8, 0.2, 0x333333, x + a, 1.4, z + b, scene));
    [-2.4, 2.4].forEach(a => { K.box(1.2, 0.2, 1.2, 0x8a8a86, x + a, 1.7, z, scene); K.box(0.2, 1.8, 1.2, 0x5a5a58, x + a + Math.sign(a) * 0.55, 2.6, z, scene); }); K.cyl(0.25, 0.25, 0.6, 0xf0f0ea, x, 3.2, z, scene, 10); };
  table(-8, -3); table(-1, -1);
  // 문(오른쪽)과 들어오는 단골
  K.box(4.2, 8.4, 0.3, 0x2a2a2a, 9.5, 4.2, -8.3, scene); K.box(3.6, 7.8, 0.1, 0xd8d8d2, 9.5, 4.0, -8.1, scene);
  const door = new THREE.Group(); door.position.set(11.3, 0, -8.0); scene.add(door); const dl = K.box(3.6, 7.8, 0.25, 0x5a5a58, -1.8, 3.9, 0, door);
  const C = K.person(scene, { x: 9.4, z: -6.8, rot: Math.PI, coat: 0x4a4a48, scale: 1.0 });
  // 사장님(앞치마)과 마케터(태블릿)
  const O = K.person(scene, { x: 3.2, z: 1.2, rot: Math.PI - 0.35, coat: 0xeeeeea, pants: 0x3a3a38, scale: 1.12 });
  K.box(1.1, 1.5, 0.05, 0xffffff, 0, 0.7, -0.66, O.torso);
  const M = K.person(scene, { x: 6.6, z: 1.6, rot: Math.PI + 0.6, coat: 0x8a8a86, hair: 'long', scale: 1.05 });
  const tab = K.box(1.1, 0.8, 0.08, 0x111111, 0, 1.25, -0.95, M.torso); const htx = K.canvasTex(128, 96, (g, w, h) => { g.fillStyle = '#eee'; g.fillRect(0, 0, w, h); hearts(g, w, h, 1, 7); });
  const tf = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.65), new THREE.MeshBasicMaterial({ map: htx })); tf.position.set(0, 1.25, -1.0); tf.rotation.y = Math.PI; M.torso.add(tf);
  const lamps = [-6, 1].map(x => { const g = new THREE.Group(); g.position.set(x, 17, -3); scene.add(g); K.line([[0, 0, 0], [0, -3, 0]], g); K.cyl(0.3, 1.1, 0.7, 0x1a1a1a, 0, -3.3, 0, g, 14); return g; });
  cam.position.set(0, 7.2, 17); cam.lookAt(0, 6, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    lamps.forEach((g, i) => { g.rotation.z = Math.sin(ph + i) * 0.14; g.rotation.x = Math.cos(ph + i) * 0.05; });
    hg.forEach((m, i) => { const u = ((ph / 6.283 + i / 7) % 1); m.position.y = 11.6 + u * 2.6; m.scale.setScalar(0.6 + 0.5 * Math.sin(u * Math.PI)); m.rotation.z = Math.sin(ph + i) * 0.3; });
    door.rotation.y = -0.9 * W(0.05, 0.6);
    C.pose({ armR: { fwd: 2.6, out: 0.4 + 0.3 * Math.sin(ph * 6), elbow: 0.5 }, headYaw: -0.2 });
    const sigh = W(0.3, 0.7);
    O.pose({ headPitch: 0.35 * sigh, lean: 0.12 * sigh, bob: -0.08 * sigh, headYaw: -0.6 * W(0.7, 0.98), armL: { fwd: 0.3, elbow: 0.4 }, armR: { fwd: 0.4 + 1.6 * sigh, elbow: 2.2 * sigh } });
    M.pose({ headYaw: 0.5, torsoYaw: 0.15, armL: { fwd: 1.2, elbow: 0.9 }, armR: { fwd: 1.0 + 0.6 * W(0.1, 0.4), elbow: 0.8, point: false }, headTilt: 0.1 * Math.sin(ph) });
  };
}
