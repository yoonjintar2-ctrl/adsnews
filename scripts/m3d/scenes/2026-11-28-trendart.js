// 11/28 금로동 트렌드 「장금이 한복」에 붙는 그림
// 늦은 오후 궁궐 기와 담장 아래 돌길을 멀리서: 쪽머리에 긴 치마 차림 두 사람이 마주 서서, 한 사람은 휴대폰으로 찍고
// 다른 사람은 두 손을 모았다 흔들며 포즈를 바꾼다. 낙엽이 날리고 담장 너머 나무가 흔들린다.
export const secs = 3;
export const meta = { place: '늦은 오후 궁궐 기와 담장 아래 돌길', where: 'outdoor', time: 'sunset', camera: 'wide', floor: 'grass', figures: 'two-facing', motion: ['leaves', 'phone-raise', 'pose-change', 'tree-sway', 'skirt-sway'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  const Sk = K.sky(scene, { time: 'sunset', clouds: 3 });
  K.floor(scene, { style: 'grass' });
  // 돌길
  for (let i = 0; i < 9; i++) K.box(2.6, 0.15, 1.8, 0xb8b6b0, -8 + i * 2.8, 0.08, 1.2 + (i % 2) * 0.2, scene);
  // 담장 + 기와 지붕
  K.box(34, 4, 1.0, 0xc4c0b8, 0, 2, -4, scene);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 35, 3), K.lam(0x3a3a3a)); roof.rotation.z = Math.PI / 2; roof.rotation.x = Math.PI; roof.position.set(0, 4.4, -4); K.inked(roof, 20); scene.add(roof);
  for (let i = 0; i < 34; i++) K.box(0.08, 0.9, 1.9, 0x1a1a1a, -17 + i, 4.3, -4, scene);
  // 담장 너머 큰 지붕(먼 전각의 실루엣)
  const far = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 18, 3), K.lam(0x5a5a58)); far.rotation.z = Math.PI / 2; far.rotation.x = Math.PI; far.position.set(4, 8.6, -18); scene.add(far);
  K.box(14, 4, 6, 0x8a8682, 4, 4.8, -18, scene);
  const trees = [K.tree(scene, { x: -10, z: -7, h: 9, kind: 'round' }), K.tree(scene, { x: 13, z: -8, h: 8, kind: 'bare' })];
  // 두 사람: 긴 치마(원뿔) + 쪽머리
  const mk = (x, z, rot, c) => { const p = K.person(scene, { x, z, rot, coat: c, hair: 'bun', scale: 0.95 });
    const sk = K.inked(new THREE.Mesh(new THREE.ConeGeometry(1.15, 2.3, 18, 1, true), new THREE.MeshLambertMaterial({ color: 0x4a4a48, side: THREE.DoubleSide })), 30); sk.position.y = 1.15; p.root.add(sk); p.sk = sk; return p; };
  const A = mk(-2.6, 1.3, -Math.PI / 2 + 0.25, 0xe6e4de);   // 찍는 사람(오른쪽을 봄)
  const B = mk(2.4, 1.0, Math.PI / 2 - 0.35, 0xdcdad4);    // 포즈 잡는 사람(왼쪽을 봄)
  const ph1 = K.box(0.35, 0.6, 0.06, 0x1a1a1a, 0, 0, 0, scene);
  const Lv = K.weather(scene, { kind: 'leaves', n: 50, box: [30, 12, 10], z0: 0 });
  cam.position.set(0, 4.0, 12.5); cam.lookAt(0, 3.0, -1);
  return (t, ph) => {
    Sk.update(ph); Lv.update(ph); trees.forEach((tr, i) => tr.update(ph, 0.05, i));
    const up = K.win(ph, 0.1, 0.9, 0.1), snap = K.win(ph, 0.45, 0.55, 0.03);
    A.pose({ headPitch: -0.05, lean: -0.05, armR: { fwd: 0.4 + up * 1.15, elbow: 0.9 * up }, armL: { fwd: 0.4 + up * 1.15, elbow: 0.9 * up }, bob: snap * 0.03 });
    const hp = new THREE.Vector3(); A.root.localToWorld(hp.set(0, 3.55 + up * 0.2, -1.05 - up * 0.3)); ph1.position.copy(hp); ph1.rotation.y = A.root.rotation.y;
    const pose2 = K.win(ph, 0.5, 0.95, 0.08);
    B.pose({ headTilt: 0.15 * (1 - pose2) - 0.15 * pose2, headYaw: 0, armL: { fwd: 1.0 + pose2 * 1.4 + Math.sin(ph * 8) * 0.2 * pose2, out: 0.2, elbow: 1.8 * (1 - pose2) + 0.3 }, armR: { fwd: 1.0, elbow: 2.0 * (1 - pose2) + 0.2 * pose2 } });
    A.sk.rotation.y = Math.sin(ph * 2) * 0.05; B.sk.rotation.z = Math.sin(ph * 2 + 1) * 0.03;
  };
}
