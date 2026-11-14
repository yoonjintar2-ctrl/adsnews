// 11/15 4컷 4칸 — 튜브·수경 챙긴 아빠·엄마가 곯아떨어진 수험생을 깨운다
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
  // 침대 + 이불 + 잠든 지우(머리만)
  K.box(7, 1.6, 4, 0x5a5a58, -2.4, 0.8, -4.4, scene); K.box(0.5, 3.6, 4, 0x3a3a38, -6.0, 1.8, -4.4, scene);
  const quilt = K.box(5.4, 0.8, 3.8, 0x9e9e9a, -1.6, 2.0, -4.4, scene);
  const head = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.55, 18, 14), K.lam(0xb8b4ae)), 60); head.position.set(-4.8, 2.4, -4.4); scene.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.58, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.6), K.lam(0x1e1e1e)); hair.rotation.z = Math.PI / 2; hair.position.copy(head.position); scene.add(hair);
  const D = DAD({ x: 1.6, z: -1.4, rot: 2.3 }), M = MOM({ x: 5.0, z: -0.6, rot: 2.6 });
  const tube = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.35, 10, 24), K.lam(0xe8e8e2)); scene.add(K.inked(tube, 30));
  const gog = new THREE.Group(); [-0.25, 0.25].forEach(x => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 6, 14), K.flat(0x111111)); r.position.x = x; gog.add(r); }); scene.add(gog);
  cam.position.set(0, 5.4, 12.5); cam.lookAt(0, 3.6, -3);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1); swing(ph);
    quilt.scale.y = 1 + 0.08 * Math.sin(ph * 2); head.position.y = 2.4 + 0.03 * Math.sin(ph * 2);
    const shake = W(0.15, 0.85);
    D.pose({ bob: -1.2, lean: 0.45, headPitch: 0.2, headYaw: 0.15 * Math.sin(ph * 2), armR: { fwd: 1.6, elbow: 0.3 + 0.25 * Math.sin(ph * 10) * shake }, armL: { fwd: 1.2, elbow: 0.6 } });
    M.pose({ lean: 0.1, headTilt: 0.15 * Math.sin(ph), headYaw: -0.3 * shake, armL: { fwd: 1.0, elbow: 1.2 }, armR: { fwd: 0.4 + 2.0 * W(0.5, 0.9), elbow: 0.2 } });
    tube.position.set(5.6, 4.6 + 0.15 * Math.sin(ph * 2), 0.1); tube.rotation.set(0.3, 0.6, Math.sin(ph) * 0.2);
    gog.position.set(4.3, 5.4 + 0.5 * W(0.5, 0.9), -0.4); gog.rotation.z = Math.sin(ph * 4) * 0.3;
  };
}
