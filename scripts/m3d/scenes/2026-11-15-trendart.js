// 11/15 금로동 트렌드 #발연기 챌린지 — 휴대폰 앞 과장 연기와 웃음 터진 친구
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b8b8b2', tiles: 5 });
  K.box(40, 20, 1, 0xa8a8a2, 0, 10, -8, scene);
  K.box(8, 1.8, 2.8, 0x6a6a68, 2.2, 0.9, -5.8, scene); K.box(8, 2.6, 0.7, 0x5a5a58, 2.2, 2.6, -7.0, scene);
  // 삼각대 + 휴대폰 + 링라이트
  const tri = new THREE.Group(); tri.position.set(-4.4, 0, 1.0); scene.add(tri);
  [0, 2.1, 4.2].forEach(a => { const l = K.cyl(0.06, 0.06, 4.6, 0x222222, Math.cos(a) * 0.5, 2.2, Math.sin(a) * 0.5, tri, 6); l.rotation.set(Math.sin(a) * 0.15, 0, -Math.cos(a) * 0.15); });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.16, 10, 40), K.flat(0xffffff)); ring.position.set(0, 5.6, 0); ring.rotation.y = -0.45; tri.add(ring);
  const ph1 = K.box(0.8, 1.4, 0.12, 0x111111, 0, 5.6, 0, tri); ph1.rotation.y = -0.45;
  const rec = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), K.flat(0xffffff)); rec.position.set(0.3, 6.5, 0.3); tri.add(rec);
  const lampG = new THREE.Group(); lampG.position.set(2, 13, -3); scene.add(lampG); K.line([[0, 0, 0], [0, -2.8, 0]], lampG); K.cyl(0.3, 1.0, 0.6, 0x1a1a1a, 0, -3.1, 0, lampG, 14);
  const Act = K.person(scene, { x: 0.6, z: -2.2, rot: 2.0, coat: 0x8a8a86, scale: 1.05 });
  const Fr = K.person(scene, { x: 4.6, z: -1.0, rot: 2.5, coat: 0xdcdcd6, hair: 'long', scale: 1.0 });
  const mo = K.motes(scene, { n: 18, size: 0.14 });
  cam.position.set(0.4, 5.0, 10.5); cam.lookAt(0, 4.6, -3);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.08); mo.update(ph);
    lampG.rotation.z = Math.sin(ph) * 0.14; ring.material.color.setScalar(0.8 + 0.2 * Math.sin(ph * 2)); rec.visible = Math.sin(ph * 6) > 0;
    const drama = W(0.1, 0.6), faint = W(0.6, 0.95);
    Act.pose({ lean: -0.2 * drama + 0.15 * faint, headPitch: -0.4 * drama + 0.2 * faint, headTilt: 0.3 * drama, torsoYaw: 0.2 * Math.sin(ph * 2),
      armL: { fwd: 2.6 * drama + 0.6 * faint, out: 0.4, elbow: 1.8 * drama }, armR: { fwd: 1.6 * drama + 2.4 * faint, out: -0.6 * drama, elbow: 0.2 } });
    const lol = W(0.2, 0.95);
    Fr.pose({ bob: Math.abs(Math.sin(ph * 10)) * 0.1 * lol, lean: 0.25 * lol, headYaw: 0.3 * Math.sin(ph * 2), headTilt: 0.2 * lol,
      armR: { fwd: 2.0 * lol, out: -0.2, point: lol > 0.4 }, armL: { fwd: 0.9, elbow: 2.2 * lol } });
  };
}
