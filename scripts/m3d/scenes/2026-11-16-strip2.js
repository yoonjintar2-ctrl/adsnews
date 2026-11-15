// 11/16 4컷 2칸 — 진열대에 같은 조합 신제품이 가득, 놀라 가리키는 하늘과 뿌듯한 점장
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b8b8b2', tiles: 5 });
  const store = () => { K.box(40, 20, 1, 0x9e9e9a, 0, 10, -9, scene); K.box(18, 1.6, 0.4, 0x1a1a1a, -1, 15.5, -8.6, scene);
    K.box(7, 6.5, 0.2, 0xdedede, -5, 7.2, -8.5, scene); for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) K.box(1.1, 1.4, 0.2, 0xf2f2ec, -7.4 + c * 1.6, 8.6 - r * 2.2, -8.3, scene);
    K.box(6, 8, 0.2, 0xcfcfca, 4.5, 4.0, -8.5, scene); K.box(0.15, 8, 0.3, 0x2a2a2a, 4.5, 4.0, -8.4, scene); };
  const cupM = (p, x, y, z, s = 1, c = 0xeeeeea) => { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); p.add(g); K.cyl(0.85, 0.65, 1.5, c, 0, 0.75, 0, g, 18); K.cyl(0.86, 0.86, 0.08, 0xffffff, 0, 1.5, 0, g, 18); return g; };
  const ring = (x, y, z, s = 1) => { const m = K.inked(new THREE.Mesh(new THREE.TorusGeometry(0.22 * s, 0.09 * s, 8, 14), K.lam(0xd8d8d0))); m.position.set(x, y, z); scene.add(m); return m; };
  const HN = o => K.person(scene, Object.assign({ coat: 0xeeeeea, hair: "long", scale: 1.05 }, o));
  const BS = o => { const p = K.person(scene, Object.assign({ coat: 0x3a3a38, scale: 1.05 }, o)); K.box(1.1, 1.6, 0.05, 0xf0f0ea, 0, 0.6, -0.66, p.torso); return p; };
  const bench = () => { K.box(8, 0.35, 1.6, 0x6a6a66, -2, 2.0, -3, scene); [-5.4, 1.4].forEach(x => K.box(0.3, 2.0, 1.4, 0x3a3a38, x, 1.0, -3, scene)); };
  const tripod = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); [[-0.5, 0.3], [0.5, 0.3], [0, -0.5]].forEach(([a, b]) => K.line([[0, 4.2, 0], [a, 0, b]], g)); K.box(0.7, 1.2, 0.15, 0x111111, 0, 4.7, 0, g); return g; };
  K.box(40, 20, 1, 0x9e9e9a, 0, 10, -9, scene);
  const cups = []; [3.2, 6.4, 9.6].forEach((y, r) => { K.box(13, 0.3, 2, 0x2a2a2a, -3, y, -7, scene); for (let i = 0; i < 7; i++) { const c = cupM(scene, -8.6 + i * 1.85, y + 0.15, -7, 0.85, r === 1 ? 0xeeeeea : 0xbdbdb6); cups.push(c); if (r === 1) { const rg = ring(-8.6 + i * 1.85, y + 1.6, -6.2, 0.9); cups.push(rg); } } });
  K.box(13, 3, 2, 0x6a6a68, -3, 1.5, -7, scene);
  const H = HN({ x: 7, z: 0.6, rot: Math.PI + 0.55 });
  const B = BS({ x: -1, z: 0.4, rot: Math.PI - 0.3 });
  const lampG = new THREE.Group(); lampG.position.set(-3, 17, -5); scene.add(lampG); K.line([[0, 0, 0], [0, -3, 0]], lampG); K.cyl(0.3, 1.0, 0.6, 0x1a1a1a, 0, -3.3, 0, lampG, 14);
  const mo = K.motes(scene, { n: 25, box: [14, 8, 3], z0: -6, size: 0.18 });
  cam.position.set(0, 7, 17); cam.lookAt(0, 6, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    lampG.rotation.z = Math.sin(ph) * 0.13; mo.update(ph);
    const pt = W(0.1, 0.85);
    H.pose({ headYaw: -0.35, torsoYaw: 0, lean: -0.12 * pt, bob: 0.1 * Math.abs(Math.sin(ph * 6)) * pt, armR: { fwd: 1.7 * pt, out: -0.5 * pt, point: pt > 0.3 }, armL: { fwd: 1.6 * pt, elbow: 2.3 * pt } });
    B.pose({ headYaw: -0.4 + 0.3 * Math.sin(ph), headPitch: 0.15 * Math.max(0, Math.sin(ph * 4)), lean: -0.06, armL: { fwd: 0.5, out: 0.5, elbow: 1.6 }, armR: { fwd: 0.5, out: 0.5, elbow: 1.6 } });
  };
}
