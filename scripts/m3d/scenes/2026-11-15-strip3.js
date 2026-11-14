// 11/15 4컷 3칸 — 빛바랜 옛날 수험표를 내미는 아빠, 가리키며 웃음 참는 엄마
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
  K.box(3.4, 5, 2, 0x6a6a68, -6.2, 2.5, -6, scene);
  const drawer = K.box(3.0, 1.2, 2.0, 0x8a8a86, -6.2, 3.4, -5.4, scene);
  K.box(6, 1.4, 2.4, 0x6a6a68, 5.4, 0.7, -5.5, scene); K.box(6, 2.0, 0.6, 0x5a5a58, 5.4, 2.2, -6.6, scene);
  const D = DAD({ x: -2.6, z: -1.6, rot: -2.2 }), M = MOM({ x: 2.6, z: -1.6, rot: 2.2 });
  const tk = K.box(0.9, 1.2, 0.05, 0xb0b0a8, 0, 0, 0, D.torso);
  const mo = K.motes(scene, { n: 22, box: [6, 6, 4], z0: -4, size: 0.1 });
  cam.position.set(0, 5.4, 12.5); cam.lookAt(0, 4.4, -3);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1); swing(ph); mo.update(ph);
    drawer.position.z = -5.4 + 0.6 + 0.3 * Math.sin(ph);
    const show = W(0.1, 0.85);
    D.pose({ lean: -0.1 * show, headPitch: -0.15, headYaw: -0.2, armR: { fwd: 1.6 + 0.9 * show, out: -0.25, elbow: 0.2 }, armL: { fwd: 0.6, elbow: 1.6 } });
    const fa = 1.6 + 0.9 * show; tk.position.set(0.85, 1.3 - 2.0 * Math.cos(fa), -2.0 * Math.sin(fa)); tk.rotation.set(0, 0, Math.sin(ph * 3) * 0.12);
    const lol = W(0.3, 0.95);
    M.pose({ bob: Math.abs(Math.sin(ph * 10)) * 0.08 * lol, lean: 0.2 * lol, headTilt: 0.2 * lol, armL: { fwd: 1.9 * lol + 0.1, out: 0.1, point: lol > 0.4 }, armR: { fwd: 0.9, elbow: 2.3 * lol } });
  };
}
