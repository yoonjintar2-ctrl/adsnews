// 11/16 4컷 4칸 — 다시 벤치, 신제품에 또 다른 과자를 부숴 넣는 하늘(시즌 2), 문 옆에서 수첩에 받아 적는 점장
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
  store(); bench(); const cup = cupM(scene, -1, 2.2, -3, 1, 0xbdbdb6); const tp = tripod(7.6, 0.6);
  const stars = [0, 1, 2, 3].map(i => { const sh = new THREE.Shape(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5, rr = k % 2 ? 0.12 : 0.3; const px = Math.cos(a) * rr, py = Math.sin(a) * rr; k ? sh.lineTo(px, py) : sh.moveTo(px, py); }
    const m = K.inked(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false }), K.lam(0xeeeeea))); scene.add(m); return m; });
  const H = HN({ x: -3.6, z: -1.0, rot: Math.PI - 0.25 });
  const bag = K.box(0.9, 1.3, 0.4, 0x3a3a38, 0, 0, 0, scene);
  const B = BS({ x: 4.6, z: -6.6, rot: Math.PI + 0.5, scale: 0.9 });
  const note = K.box(0.6, 0.8, 0.05, 0xf4f4f0, 0, 0, 0, B.torso);
  const lampG = new THREE.Group(); lampG.position.set(-1, 15, -2); scene.add(lampG); K.line([[0, 0, 0], [0, -2, 0]], lampG); K.cyl(0.3, 1.0, 0.6, 0x1a1a1a, 0, -2.3, 0, lampG, 14);
  cam.position.set(0, 6.6, 16); cam.lookAt(0, 5.4, -3);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    lampG.rotation.z = Math.sin(ph + 1) * 0.14;
    const sh = Math.sin(ph * 6);
    H.pose({ headYaw: -0.25, headPitch: 0.2, torsoYaw: -0.1, bob: 0.06 * Math.abs(sh), armR: { fwd: 2.0, out: -0.3, elbow: 0.6 + 0.15 * sh }, armL: { fwd: 1.0, elbow: 1.0 } });
    bag.position.set(-1.6 + 0.1 * sh, 5.6, -2.6); bag.rotation.z = -1.9 + 0.15 * sh;
    stars.forEach((r, i) => { const u = ((ph / 6.283) * 2 + i / 4) % 1; r.position.set(-1.2 + 0.3 * Math.sin(i * 3), 5.2 - u * 2.6, -2.9); r.rotation.set(u * 6 + i, u * 4, 0); });
    const wr = Math.sin(ph * 8) * 0.12;
    note.position.set(-0.3, 1.3, -0.9); note.rotation.x = -0.4;
    B.pose({ headYaw: 0.7 + 0.2 * Math.sin(ph), headPitch: 0.15 + 0.1 * W(0.2, 0.5), torsoYaw: 0.2, armL: { fwd: 1.1, elbow: 1.2 }, armR: { fwd: 1.0 + wr, elbow: 1.3 } });
  };
}
