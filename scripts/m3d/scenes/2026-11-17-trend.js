// 11/17 도안나 트렌드 노트 #수집 카드 — 반짝이는 카드를 부채처럼 펼쳐 든 사람, 놀라 가리키는 친구, 펄럭이는 바인더
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b8b8b2', tiles: 5 });
  K.box(40, 20, 1, 0xa2a29e, 0, 10, -9, scene);
  // 벽 액자들
  [[-8, 11], [-3.5, 12], [7, 11.5]].forEach(([x, y], i) => K.box(2.6, 3.4, 0.2, [0xeeeeea, 0x6a6a68, 0xd8d8d2][i], x, y, -8.3, scene));
  // 탁자와 바인더(한 장이 넘어간다)
  K.box(7, 0.3, 3, 0x2a2a2a, 1.5, 3.4, -3, scene); [[-1.8, -4.2], [4.8, -4.2], [-1.8, -1.8], [4.8, -1.8]].forEach(([x, z]) => K.box(0.25, 3.4, 0.25, 0x1a1a1a, x, 1.7, z, scene));
  K.box(3.6, 0.15, 2.4, 0x8a8a86, 1.5, 3.62, -3, scene);
  const page = new THREE.Group(); page.position.set(1.5, 3.72, -3); scene.add(page); K.box(1.7, 0.05, 2.2, 0xeeeeea, 0.85, 0, 0, page);
  const A = K.person(scene, { x: -3.6, z: 2, rot: Math.PI + 0.35, coat: 0xeeeeea, hair: 'long', scale: 1.08 });
  const fan = new THREE.Group(); scene.add(fan); const cards = [0, 1, 2, 3].map(i => { const c = K.box(0.75, 1.1, 0.04, [0xf4f4f0, 0x8a8a86, 0xd8d8d2, 0x4a4a48][i], 0, 0.5, 0, fan); c.geometry.translate(0, 0.0, 0); return c; });
  const B = K.person(scene, { x: 4.2, z: 2.4, rot: Math.PI - 0.5, coat: 0x6a6a68, hair: 'cap', scale: 1.05 });
  const sp = K.motes(scene, { n: 16, box: [3, 3, 2], z0: 0, size: 0.18 }); scene.children[scene.children.length - 1].position.set(-4.4, 5.6, 0.8);
  const lamp = new THREE.Group(); lamp.position.set(1.5, 17, -3); scene.add(lamp); K.line([[0, 0, 0], [0, -4, 0]], lamp); K.cyl(0.3, 1.2, 0.8, 0x1a1a1a, 0, -4.3, 0, lamp, 14);
  const hand = (a, e, sd = 1) => new THREE.Vector3(sd * 0.92, 1.3 - 0.84 * Math.cos(a) - 0.95 * Math.cos(a + e), -0.84 * Math.sin(a) - 0.95 * Math.sin(a + e));
  cam.position.set(0, 6.2, 14.5); cam.lookAt(0, 6.0, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    page.rotation.z = Math.PI * W(0.2, 0.6) * 0.95; lamp.rotation.z = Math.sin(ph) * 0.1;
    const r = W(0.05, 0.9);
    A.pose({ headYaw: -0.4, headPitch: -0.2, armR: { fwd: 1.8 * r + 0.4, out: 0, elbow: 0.5 }, armL: { fwd: 0.4, elbow: 1.4 } });
    A.root.updateMatrixWorld(true); const v = hand(1.8 * r + 0.4, 0.5); A.torso.localToWorld(v); fan.position.copy(v); fan.rotation.set(0, A.root.rotation.y, 0);
    cards.forEach((c, i) => { c.rotation.z = (i - 1.5) * 0.32 * (0.3 + 0.7 * r); c.position.z = i * 0.03; c.rotation.y = 0.2 * Math.sin(ph * 3 + i); });
    sp.update(ph); 
    const p = W(0.3, 0.95);
    B.pose({ headYaw: 0.5, headPitch: -0.2 * p, lean: -0.1 * p, armL: { fwd: 1.9 * p + 0.2, out: 0.2 * p, point: p > 0.4 }, armR: { fwd: 0.6, elbow: 2.2 * p }, bob: 0.08 * p * Math.abs(Math.sin(ph * 6)) });
  };
}
