// 11/16 금로동 트렌드 노트 #안목자본 — 비슷한 머그 셋 가운데 하나를 들어 살피는 사람, 끄덕이는 친구
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b6b6b0', tiles: 5 });
  K.box(40, 20, 1, 0x9e9e9a, 0, 10, -9, scene);
  K.box(12, 0.3, 2.4, 0x4a4a48, -3, 5.0, -6.5, scene); K.box(12, 4.8, 2.2, 0x6e6e6a, -3, 2.4, -6.5, scene);
  const mug = (p, x, y, z, c = 0xeeeeea) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); K.cyl(0.6, 0.55, 1.3, c, 0, 0.65, 0, g, 20);
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.09, 8, 16), K.lam(c)); h.position.set(0.7, 0.7, 0); g.add(h); return g; };
  const m1 = mug(scene, -7, 5.15, -6.4), m2 = mug(scene, -4.2, 5.15, -6.4), m3 = mug(scene, -1.4, 5.15, -6.4);
  // 액자
  K.box(4, 3, 0.2, 0x2a2a2a, 6, 11, -8.4, scene); K.box(3.4, 2.4, 0.1, 0x8a8a86, 6, 11, -8.25, scene);
  const lampG = new THREE.Group(); lampG.position.set(-4, 17.5, -5); scene.add(lampG); K.line([[0, 0, 0], [0, -3.5, 0]], lampG); K.cyl(0.3, 1.1, 0.7, 0x1a1a1a, 0, -3.8, 0, lampG, 14);
  const A = K.person(scene, { x: 1.6, z: -2.4, rot: Math.PI + 0.9, coat: 0x3a3a38, scale: 1.08 });
  const held = mug(A.torso, 0, 0, 0, 0xdedede); // 오른손 근처에 들고 있음
  const B = K.person(scene, { x: 6.2, z: 0.6, rot: Math.PI + 0.5, coat: 0xeeeeea, hair: 'long', scale: 1.02 });
  m3.visible = false;
  cam.position.set(0, 7.2, 16.5); cam.lookAt(-0.5, 5.6, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    lampG.rotation.z = Math.sin(ph) * 0.14; lampG.rotation.x = Math.cos(ph) * 0.05;
    const up = 0.5 + 0.5 * Math.sin(ph);
    held.position.set(0.9, 0.9 + 0.4 * up, -1.0); held.rotation.y = ph; held.rotation.z = 0.1 * Math.sin(ph * 2);
    A.pose({ headYaw: 0.25, headPitch: -0.1 * up, torsoYaw: 0.1, armR: { fwd: 1.2 + 0.4 * up, elbow: 0.9 }, armL: { fwd: 1.0 + 0.3 * up, elbow: 1.3 } });
    const nod = W(0.3, 0.9);
    B.pose({ headYaw: -0.3, headPitch: 0.25 * Math.max(0, Math.sin(ph * 6)) * nod, torsoYaw: 0.3, armL: { fwd: 0.4, elbow: 1.6 }, armR: { fwd: 0.3 } });
    m1.rotation.y = 0.15 * Math.sin(ph + 1); m2.rotation.y = 0.15 * Math.sin(ph + 2);
  };
}
