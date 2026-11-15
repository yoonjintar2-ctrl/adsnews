// 11/16 4컷 3칸 — 포장 뒷면을 돋보기로 뒤지는 하늘, 가슴에 손 얹고 웃는 점장
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
  K.box(8, 0.3, 2, 0x2a2a2a, -6, 3.2, -7, scene); K.box(8, 3, 2, 0x6a6a68, -6, 1.5, -7, scene); for (let i = 0; i < 4; i++) cupM(scene, -8.6 + i * 1.8, 3.35, -7, 0.8, 0xbdbdb6);
  const clockG = new THREE.Group(); clockG.position.set(5, 11, -8.4); scene.add(clockG); const cf = K.cyl(1.2, 1.2, 0.2, 0xf0f0ea, 0, 0, 0, clockG); cf.rotation.x = Math.PI / 2;
  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 0.05), K.flat(0x111111)); hand.geometry.translate(0, 0.45, 0); hand.position.z = 0.15; clockG.add(hand);
  const H = HN({ x: -2.5, z: 0.4, rot: Math.PI - 0.4 });
  const pk = new THREE.Group(); H.torso.add(pk); K.box(1.3, 1.7, 0.3, 0xf0f0ea, 0, 0, 0, pk); [0, 1, 2, 3].forEach(i => K.box(0.9, 0.06, 0.02, 0x222222, 0, 0.5 - i * 0.25, -0.17, pk));
  const mg = new THREE.Group(); H.torso.add(mg); const ringM = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.07, 8, 20), K.lam(0x222222)); mg.add(ringM); K.box(0.1, 0.8, 0.1, 0x222222, 0, -0.8, 0, mg);
  const B = BS({ x: 4.6, z: 0.8, rot: Math.PI + 0.6 });
  const lampG = new THREE.Group(); lampG.position.set(0, 17, -4); scene.add(lampG); K.line([[0, 0, 0], [0, -3, 0]], lampG); K.cyl(0.3, 1.0, 0.6, 0x1a1a1a, 0, -3.3, 0, lampG, 14);
  cam.position.set(0, 7, 16.5); cam.lookAt(0, 5.8, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    lampG.rotation.z = Math.sin(ph) * 0.13; hand.rotation.z = -ph;
    const sc = Math.sin(ph * 2);
    pk.position.set(-0.4, 0.8, -1.2); pk.rotation.y = Math.PI + 0.3 * Math.sin(ph);
    mg.position.set(0.2 + 0.5 * sc, 1.0 + 0.25 * Math.cos(ph * 2), -1.5); mg.rotation.y = Math.PI / 2 - 0.3;
    H.pose({ headPitch: 0.25, headYaw: 0.15 * sc, lean: 0.12, armL: { fwd: 1.2, elbow: 1.2 }, armR: { fwd: 1.4 + 0.2 * sc, out: -0.2, elbow: 1.0 } });
    const lg = W(0.3, 0.9);
    B.pose({ headPitch: -0.2 * lg, bob: 0.08 * Math.abs(Math.sin(ph * 8)) * lg, headYaw: 0.6, armR: { fwd: 0.8, out: -0.4, elbow: 2.2 }, armL: { fwd: 0.4 + 0.8 * lg, out: 0.4, elbow: 0.6 } });
  };
}
