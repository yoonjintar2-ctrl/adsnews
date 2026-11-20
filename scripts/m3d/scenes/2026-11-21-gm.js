// 11/21 안광주 미니 사설 「모델료 없는 2000만 뷰, 견적서는 어디서 줄었나」(그림 도안나)
// 새벽 원룸 부엌, 삼각대 카메라 어깨 너머: 화면 안쪽 식탁에서 평범한 사람이 컵을 들어 한 모금 마시고, 김이 오른다. 카메라의 촬영 표시등이 깜박이고 창 커튼이 흔들린다. 스타 의자는 없다.
export const secs = 3;
export const meta = { place: '새벽 원룸 부엌 식탁과 삼각대 카메라', where: 'indoor', time: 'dawn', camera: 'ots', floor: 'wood', figures: 'solo-front', motion: ['cup-sip', 'steam', 'tally-blink', 'curtain'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  const R = K.room(scene, { w: 16, d: 11, h: 8, wall: 'stripe', wallColor: '#b6b2aa', floorStyle: 'wood', windowAt: [3.5, 4.6, 3.6, 2.6] });
  // 싱크대 줄
  K.box(5, 2.6, 1.2, 0x8f8a84, -4.5, 1.3, -4.8, scene); K.box(5.2, 0.12, 1.4, 0x3a3a3a, -4.5, 2.66, -4.8, scene);
  K.cyl(0.06, 0.06, 0.9, 0x333333, -4.5, 3.1, -5.1, scene, 8);
  // 식탁 + 의자
  K.box(3.4, 0.14, 1.8, 0x6a5f52, 0, 2.2, -2.2, scene); [[-1.5, -1], [1.5, -1], [-1.5, 1], [1.5, 1]].forEach(([a, b]) => K.cyl(0.07, 0.07, 2.2, 0x333333, a, 1.1, -2.2 + b * 0.75, scene, 8));
  K.box(0.8, 0.1, 0.4, 0xeeeee8, -0.9, 2.3, -2.0, scene); // 접시
  // 사람(식탁 너머, 카메라 쪽을 봄)
  const P = K.person(scene, { x: 0.2, z: -3.5, rot: Math.PI, coat: 0xd2cec6, hair: 'long', scale: 0.95 });
  const cup = K.cyl(0.16, 0.13, 0.32, 0xf0efe9, 0, 0, 0, scene, 12);
  const steam = [0, 1, 2].map(i => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf6f6f2, transparent: true, opacity: 0.8 })); scene.add(m); return m; });
  // 삼각대 카메라(앞쪽)
  const tri = new THREE.Group(); tri.position.set(2.6, 0, 3.4); scene.add(tri);
  [0, 2.1, 4.2].forEach(a => { const l = K.cyl(0.04, 0.04, 2.8, 0x222222, Math.sin(a) * 0.45, 1.3, Math.cos(a) * 0.45, tri, 6); l.rotation.set(Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3); });
  K.box(1.0, 0.7, 0.8, 0x1e1e1e, 0, 2.9, 0, tri); const lens = K.cyl(0.26, 0.3, 0.5, 0x333333, 0, 2.9, -0.6, tri, 14); lens.rotation.x = Math.PI / 2;
  const tally = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), K.flat(0xf4f4f0)); tally.position.set(0.32, 3.3, -0.41); tri.add(tally);
  cam.position.set(2.9, 3.9, 6.2); cam.lookAt(0.0, 3.0, -3.0);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.12);
    const sip = W(0.25, 0.7);
    P.pose({ headPitch: -0.15 * sip, headYaw: 0.1, armR: { fwd: 0.6 + 0.9 * sip, out: -0.05, elbow: 1.3 + 0.9 * sip }, armL: { fwd: 0.35, elbow: 0.8 } });
    // 컵: 탁자 위 → 입가 (오른손 위치를 대충 따라감)
    cup.position.set(0.2 - 0.75 + 0.25 * sip, 2.45 + 1.55 * sip, -3.5 + 0.75 - 0.35 * sip);
    steam.forEach((s, i) => { const u = ((ph / 6.283 + i / 3) % 1); s.position.set(cup.position.x + Math.sin(ph * 2 + i) * 0.12, cup.position.y + 0.25 + u * 1.0, cup.position.z); s.material.opacity = 0.8 * (1 - u); s.scale.setScalar(1 + u * 1.5); });
    tally.material.color.setScalar(Math.sin(ph * 4) > 0 ? 0.98 : 0.3);
    R.update(ph, 0.15);
  };
}
