// 11/17 금로동 트렌드 노트 #한유주 코어 — 둥근 거울 앞에서 향수를 뿌리는 사람, 끄덕이는 친구, 흔들리는 장미와 행거
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b4b4ae', tiles: 5 });
  K.box(40, 20, 1, 0x9c9c98, 0, 10, -9, scene);
  // 둥근 거울
  const mir = K.inked(new THREE.Mesh(new THREE.CapsuleGeometry(2.4, 5, 8, 24), K.lam(0xdcdcd8))); mir.scale.z = 0.08; mir.position.set(2.5, 7, -8.3); scene.add(mir);
  // 선반 위 꽃병과 장미
  K.box(5, 0.3, 1.6, 0x1a1a1a, -7, 6, -7.6, scene); K.cyl(0.5, 0.7, 1.6, 0x8a8a86, -7.8, 7, -7.6, scene, 14);
  const roses = [-8.4, -7.8, -7.2].map((x, i) => { const g = new THREE.Group(); g.position.set(-7.8, 7.6, -7.6); scene.add(g); K.line([[0, 0, 0], [x + 7.8, 1.6 + i * 0.3, 0]], g);
    const r = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), K.lam(0x3a3a38))); r.position.set(x + 7.8, 1.8 + i * 0.3, 0); g.add(r); return g; });
  K.box(0.7, 0.9, 0.7, 0xf0f0ea, -5.6, 6.6, -7.6, scene);
  // 밀려난 반짝이 행거
  K.box(0.15, 7, 0.15, 0x1a1a1a, 9, 3.5, -6, scene); K.box(0.15, 7, 0.15, 0x1a1a1a, 13, 3.5, -6, scene); K.box(4.3, 0.15, 0.15, 0x1a1a1a, 11, 7, -6, scene);
  const clothes = [9.8, 11, 12.2].map((x, i) => { const g = new THREE.Group(); g.position.set(x, 6.9, -6); scene.add(g); K.box(1, 2.6, 0.3, [0xd8d8d2, 0x8a8a86, 0xeeeeea][i], 0, -1.4, 0, g); return g; });
  const A = K.person(scene, { x: -1.5, z: 1.6, rot: Math.PI + 0.35, coat: 0x3a3a38, hair: 'long', scale: 1.1 });
  const bottle = K.box(0.35, 0.55, 0.35, 0xf0f0ea, 0, 0, 0, scene);
  const mist = K.motes(scene, { n: 14, box: [2.5, 1.6, 1.5], z0: 0, size: 0.13 }); scene.children[scene.children.length - 1].position.set(-1.6, 6.4, 0.8);
  const B = K.person(scene, { x: 4.6, z: 2.6, rot: Math.PI - 0.6, coat: 0xd8d8d2, scale: 1.04 });
  const hand = (a, e, sd = 1) => new THREE.Vector3(sd * 0.92, 1.3 - 0.84 * Math.cos(a) - 0.95 * Math.cos(a + e), -0.84 * Math.sin(a) - 0.95 * Math.sin(a + e));
  cam.position.set(0, 5.6, 14); cam.lookAt(0, 5.0, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    roses.forEach((g, i) => g.rotation.z = Math.sin(ph + i) * 0.08);
    clothes.forEach((g, i) => g.rotation.z = Math.sin(ph * 2 + i * 1.3) * 0.12);
    const r = W(0.1, 0.8);
    A.pose({ headYaw: -0.3, headPitch: -0.15 * r, headTilt: 0.15 * r, armR: { fwd: 1.9 * r + 0.3, out: 0, elbow: 0.5 }, armL: { fwd: 0.4, elbow: 1.6 } });
    A.root.updateMatrixWorld(true); const v = hand(1.9 * r + 0.3, 0.5); A.torso.localToWorld(v); bottle.position.copy(v);
    mist.update(ph); 
    const n = Math.abs(Math.sin(ph * 4)) * W(0.45, 0.95);
    B.pose({ headYaw: -0.7, torsoYaw: -0.2, headPitch: 0.25 * n, armL: { fwd: 0.4, elbow: 2.0 }, armR: { fwd: 0.4, elbow: 2.1 } });
  };
}
