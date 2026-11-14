// 11/15 4컷 2칸 — 소파에 쓰러진 수험생, 전단을 보고 눈이 커진 아빠·엄마
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: "#b9b9b3", tiles: 6 });
  K.box(40, 20, 1, 0xb0b0aa, 0, 10, -8, scene);
  K.box(4.2, 3, 0.2, 0xe8e8e2, -1.0, 7.4, -7.4, scene); K.box(0.12, 3, 0.25, 0x3a3a38, -1.0, 7.4, -7.3, scene);
  const clockG = new THREE.Group(); clockG.position.set(3.4, 9.2, -7.4); scene.add(clockG);
  const cf = K.cyl(0.9, 0.9, 0.15, 0xf0f0ea, 0, 0, 0, clockG); cf.rotation.x = Math.PI / 2;
  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.05), K.flat(0x111111)); hand.geometry.translate(0, 0.35, 0); hand.position.z = 0.1; clockG.add(hand);
  const lampG = new THREE.Group(); lampG.position.set(0.5, 13, -3); scene.add(lampG); K.line([[0, 0, 0], [0, -3, 0]], lampG); K.cyl(0.35, 1.1, 0.8, 0x1a1a1a, 0, -3.4, 0, lampG);
  const swing = ph => { lampG.rotation.z = Math.sin(ph) * 0.14; lampG.rotation.x = Math.cos(ph) * 0.05; hand.rotation.z = -ph; };
  const DAD = o => K.person(scene, Object.assign({ coat: 0x9a9a96 }, o));
  const MOM = o => K.person(scene, Object.assign({ coat: 0xcacac4, hair: "bun" }, o));
  K.box(6, 1.4, 2.4, 0x6a6a68, -5.4, 0.7, -5, scene); K.box(6, 2.0, 0.6, 0x5a5a58, -5.4, 2.2, -6.1, scene);
  // 소파에 누운 지우(사람 인형을 옆으로 눕힘)
  const J = K.person(scene, { x: -5.4, z: -4.8, coat: 0x6e6e6a, hair: 'long', scale: 0.85 }); J.root.rotation.z = Math.PI / 2;
  K.box(5, 0.3, 2.6, 0x4a4a48, 3.4, 3.2, -3.6, scene); [1.2, 5.6].forEach(x => K.box(0.3, 3.1, 0.3, 0x3a3a38, x, 1.55, -3.6, scene));
  const tk = K.box(0.7, 0.05, 0.9, 0xf4f4f0, 3.4, 3.4, -3.4, scene);
  const D = DAD({ x: 1.0, z: -1.2, rot: -2.4 }), M = MOM({ x: 6.0, z: -1.4, rot: 2.4 });
  const fD = K.box(0.7, 0.9, 0.05, 0xf4f4f0, 0, 1.4, -1.3, D.torso), fM = K.box(0.7, 0.9, 0.05, 0xf4f4f0, 0, 1.4, -1.3, M.torso);
  const zz = [0, 1, 2].map(i => { const z = K.box(0.35, 0.35, 0.05, 0x222222, -2.6 + i * 0.5, 3.6 + i * 0.6, -4.8, scene); return z; });
  cam.position.set(0, 5.4, 13); cam.lookAt(0, 3.8, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1); swing(ph);
    J.root.position.y = 2.25 + Math.sin(ph * 2) * 0.04; J.pose({ headPitch: 0.1, armL: { fwd: 0.2 }, armR: { fwd: 0.3 } }); J.root.position.y = 2.25 + Math.sin(ph * 2) * 0.04;
    zz.forEach((z, i) => { z.position.y = 3.6 + i * 0.6 + Math.sin(ph + i) * 0.15; z.rotation.z = Math.sin(ph * 2 + i) * 0.3; });
    tk.rotation.y = Math.sin(ph) * 0.1;
    const wow = W(0.2, 0.8);
    D.pose({ bob: 0.15 * Math.abs(Math.sin(ph * 6)) * wow, lean: -0.15 * wow, headPitch: -0.2 * wow, headYaw: 0.4 * Math.sin(ph), armR: { fwd: 1.3 + 0.8 * wow, elbow: 0.4 }, armL: { fwd: 1.3 + 0.6 * wow, elbow: 0.5 } });
    M.pose({ bob: 0.15 * Math.abs(Math.sin(ph * 6 + 1)) * wow, lean: -0.15 * wow, headPitch: -0.2 * wow, headYaw: -0.4 * Math.sin(ph), armR: { fwd: 1.3 + 0.6 * wow, elbow: 0.5 }, armL: { fwd: 1.3 + 0.8 * wow, elbow: 0.4 } });
    fD.position.set(0, 1.4 + 0.8 * wow, -1.3 - 0.3 * wow); fM.position.set(0, 1.4 + 0.8 * wow, -1.3 - 0.3 * wow);
  };
}
