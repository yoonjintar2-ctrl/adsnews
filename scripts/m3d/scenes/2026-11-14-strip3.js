// 11/14 4컷 3칸 — '하나씩 딱 말해!' 동시에 손가락
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  // 같은 집(부엌+거실) — 4컷 1~3칸 공통 무대
  K.ground(scene, { color: '#b9b9b3', tiles: 6 });
  K.box(40, 20, 1, 0xb0b0aa, 0, 10, -8, scene);
  const win = K.box(4.2, 3, 0.2, 0xe8e8e2, -1.2, 7.4, -7.4, scene); K.box(0.12, 3, 0.25, 0x3a3a38, -1.2, 7.4, -7.3, scene);
  K.box(2.8, 6.4, 2.2, 0xdcdcd6, -6.4, 3.2, -6.2, scene); K.box(2.4, 5.8, 0.1, 0xf4f4f0, -6.4, 3.3, -5.08, scene);
  [1.4, 3.2, 4.8].forEach(y => K.box(2.3, 0.08, 1.8, 0x9a9a98, -6.4, y, -6.0, scene));
  const doorG = new THREE.Group(); doorG.position.set(-5.0, 3.2, -5.1); scene.add(doorG); K.box(2.8, 6.3, 0.25, 0xd0d0ca, -1.4, 0, 0.12, doorG).position.x = 1.4;
  const clockG = new THREE.Group(); clockG.position.set(-3.0, 9.2, -7.4); scene.add(clockG);
  const cf = K.cyl(0.9, 0.9, 0.15, 0xf0f0ea, 0, 0, 0, clockG); cf.rotation.x = Math.PI / 2;
  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.05), K.flat(0x111111)); hand.geometry.translate(0, 0.35, 0); hand.position.z = 0.1; clockG.add(hand);
  const hand2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.05), K.flat(0x111111)); hand2.geometry.translate(0, 0.22, 0); hand2.position.z = 0.1; hand2.rotation.z = -2.6; clockG.add(hand2);
  K.box(7, 1.6, 2.4, 0x6a6a68, 4.2, 0.8, -4.6, scene); K.box(7, 2.0, 0.6, 0x5a5a58, 4.2, 2.4, -5.6, scene);
  [0.6, 7.8].forEach(x => K.box(0.6, 2.2, 2.4, 0x4a4a48, x, 1.1, -4.6, scene));
  const lampG = new THREE.Group(); lampG.position.set(0.5, 13, -3); scene.add(lampG); K.line([[0, 0, 0], [0, -3, 0]], lampG); K.cyl(0.35, 1.1, 0.8, 0x1a1a1a, 0, -3.4, 0, lampG);
  const swing = ph => { lampG.rotation.z = Math.sin(ph) * 0.14; lampG.rotation.x = Math.cos(ph) * 0.05; hand.rotation.z = -ph; };
  const MOM = o => K.person(scene, Object.assign({ coat: 0xc8c8c2, hair: 'long' }, o));
  const DAD = o => K.person(scene, Object.assign({ coat: 0x7a7a78 }, o));
  const KID = o => K.person(scene, Object.assign({ coat: 0xe2e2dc, scale: 0.68 }, o));
  const D = DAD({ x: 2.4, z: -2.2, rot: Math.PI }), C = KID({ x: 5.2, z: -2.0, rot: Math.PI });
  const M = MOM({ x: -1.6, z: 3.4, rot: -0.35 });
  cam.position.set(0.6, 5.0, 11.6); cam.lookAt(1.8, 4.0, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.07); swing(ph); doorG.rotation.y = 0.05;
    const cross = W(0.0, 0.95) * 0 + 1;
    M.pose({ headPitch: 0.05, headYaw: Math.sin(ph * 2) * 0.1, lean: -0.05, armL: { fwd: 1.25, out: -0.35, elbow: 2.0 }, armR: { fwd: 1.15, out: -0.35, elbow: 2.0 } });
    const go = W(0.35, 0.85), jump = Math.max(0, Math.sin((ph - 2.2) * 3)) * go;
    D.pose({ bob: 0.35 * jump, headPitch: -0.1 * go, headYaw: 0.4 * go, armR: { fwd: 2.9 * go, out: 0.1, point: go > 0.3 }, armL: { fwd: 0.5 * go, out: 0.6 * go } });
    C.pose({ bob: 0.3 * jump, headPitch: -0.15 * go, headYaw: -0.4 * go, armR: { fwd: 2.9 * go, out: 0.1, point: go > 0.3 }, armL: { fwd: 0.5 * go, out: 0.6 * go } });
  };
}
