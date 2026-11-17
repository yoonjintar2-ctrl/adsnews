// 11/18 오늘의 광고인 앨버트 래스커 — '깎아 먹는 오렌지를 마시는 주스로'
// 새벽 오렌지 과수원, 아래에서 올려다본 구도: 모자 쓴 신사(옆모습, 얼굴 세부 없음)가 가지 끝 오렌지를 가리키고, 오렌지가 흔들리며 하나가 주스 잔으로 떨어진다. 새가 지나간다.
export const secs = 3;
export const meta = { place: '새벽 오렌지 과수원 고랑', where: 'outdoor', time: 'dawn', camera: 'low', floor: 'grass', figures: 'solo-side', motion: ['orange-sway', 'orange-drop', 'point-up', 'bird'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'dawn', sun: true, clouds: 3 });
  K.floor(scene, { style: 'grass' });
  const trees = [[-5, -4, 1.3], [4.5, -5, 1.4], [-11, -12, 1.1], [11, -13, 1.1], [0, -16, 1]].map(([x, z, s], i) => K.tree(scene, { x, z, h: 6, kind: 'round', s }));
  // 가지 끝 오렌지(살랑)
  const oranges = []; [[-4.2, 6.6, -2.6], [-6.0, 7.4, -3.4], [3.6, 7.0, -3.4], [5.4, 8.0, -4.2], [-5.2, 5.9, -2.2]].forEach(([x, y, z], i) => { const piv = new THREE.Group(); piv.position.set(x, y, z); scene.add(piv); K.line([[0, 0.05, 0], [0.02, -0.5, 0]], piv); const o = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), K.lam(0xe2dccb)), 60); o.position.y = -0.9; piv.add(o); oranges.push(piv); });
  // 신사(모자, 옆모습)
  const P = K.person(scene, { x: 1.5, z: 0, rot: -Math.PI / 2 - 0.4, coat: 0x3a3836, hair: 'short', scale: 1.05 });
  K.cyl(0.36, 0.36, 0.45, 0x1e1e1e, 0, 0.82, 0, P.headG); K.cyl(0.62, 0.62, 0.06, 0x1e1e1e, 0, 0.6, 0, P.headG);
  // 나무 상자 위 주스 잔 + 떨어지는 오렌지
  K.box(1.6, 1.0, 1.2, 0x6a5f52, -2.4, 0.5, 1.2, scene);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.9, 16, 1, true), new THREE.MeshLambertMaterial({ color: 0xdedbd2, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })); glass.position.set(-2.4, 1.45, 1.2); scene.add(glass);
  const juice = K.cyl(0.3, 0.25, 0.5, 0x8c8270, -2.4, 1.25, 1.2, scene, 16);
  const drop = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.38, 14, 10), K.lam(0xe2dccb)), 60); scene.add(drop);
  const bird = K.bird(scene, { cx: 0, cy: 11, cz: -8, rx: 12, rz: 3 });
  cam.position.set(-1.0, 0.7, 9.5); cam.lookAt(0, 4.6, -2);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    trees.forEach((tr, i) => tr.update(ph, 0.03, i));
    oranges.forEach((o, i) => { o.rotation.z = Math.sin(ph * 2 + i) * 0.18; o.rotation.x = Math.cos(ph * 2 + i * 0.7) * 0.1; });
    const pt = W(0.1, 0.7);
    P.pose({ headPitch: -0.45 * pt, headYaw: 0.15, armR: { fwd: 2.3 * pt, out: 0.1, point: true }, armL: { fwd: 0.15 } });
    const u = ph / (Math.PI * 2); const f = Math.min(1, Math.max(0, (u - 0.35) / 0.45));
    drop.position.set(-2.4, 6.0 - 4.3 * f * f, 1.2); drop.visible = u > 0.33 && u < 0.82;
    juice.scale.y = 1 + 0.25 * K.win(ph, 0.8, 0.98, 0.05);
    if (bird && bird.update) bird.update(ph);
  };
}
