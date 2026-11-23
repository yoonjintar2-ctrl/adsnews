// 11/24 금로동 트렌드 노트 그림 「내 기준에 바늘을 맞추다」(#영점소비)
// 해 질 녘 재래시장 저울 좌판을 바로 위에서: 큰 접시저울 바늘이 이리저리 흔들리다 0에 멈추고, 상인 손이 영점 손잡이를 돌린다.
// 손님이 사과 바구니를 들었다 놓고, 바람에 좌판 차양 끝이 들썩인다.
export const secs = 3;
export const meta = { place: '해 질 녘 재래시장 저울 좌판', where: 'outdoor', time: 'sunset', camera: 'top', floor: 'asphalt', figures: 'two-facing', motion: ['needle-zero', 'knob-turn', 'basket-lift', 'awning-flap'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'sunset' });
  K.floor(scene, { style: 'asphalt', color: '#7a7672' });
  // 좌판(나무 판) + 채소 상자
  K.box(7, 0.25, 4, 0x8a7a66, 0, 1.2, 0, scene);
  [[-2.6, -1.2], [-2.6, 1.2], [2.6, 1.3]].forEach(([x, z], i) => { K.box(1.5, 0.5, 1.2, 0x6a5a48, x, 1.55, z, scene);
    for (let j = 0; j < 6; j++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), K.lam(i === 1 ? 0x4a4a46 : 0xb8b2a6)); s.position.set(x - 0.45 + (j % 3) * 0.45, 1.9, z - 0.25 + Math.floor(j / 3) * 0.5); scene.add(s); } });
  // 저울: 받침 + 다이얼(위를 보게 눕힘) + 바늘
  const dial = new THREE.Group(); dial.position.set(0.3, 1.9, 0); scene.add(dial);
  K.cyl(1.2, 1.3, 0.5, 0xd8d6d0, 0, -0.15, 0, dial, 32);
  const face = new THREE.Mesh(new THREE.CircleGeometry(1.0, 40), K.flat(0xf2f0ea)); face.rotation.x = -Math.PI / 2; face.position.y = 0.11; dial.add(face);
  for (let i = -6; i <= 6; i++) { const tk = K.box(0.04, 0.02, i === 0 ? 0.3 : 0.18, 0x1a1a1a, 0, 0.12, 0, dial); const a = i * 0.22; tk.position.set(Math.sin(a) * 0.82, 0.12, -Math.cos(a) * 0.82); tk.rotation.y = -a; }
  const needle = new THREE.Group(); needle.position.y = 0.14; dial.add(needle); K.box(0.06, 0.03, 0.85, 0x1a1a1a, 0, 0, -0.4, needle); K.cyl(0.09, 0.09, 0.05, 0x1a1a1a, 0, 0, 0, needle, 10);
  const knob = K.cyl(0.18, 0.18, 0.3, 0x333333, 1.45, 1.85, 0, scene, 10); knob.rotation.z = Math.PI / 2;
  // 차양 앞자락
  const aw = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.2, 8, 2), new THREE.MeshLambertMaterial({ color: 0x5a5a56, side: THREE.DoubleSide })); aw.rotation.x = -Math.PI / 2; aw.position.set(0, 4.6, -2.9); scene.add(aw);
  // 상인(뒤)과 손님(앞) 마주 보기
  const M = K.person(scene, { x: 0.8, z: -3.2, rot: Math.PI, coat: 0x4a4a48, hair: 'cap', scale: 0.95 });
  const C = K.person(scene, { x: -0.6, z: 3.3, rot: 0, coat: 0x9a968e, hair: 'long', scale: 0.92 });
  const basket = K.cyl(0.5, 0.38, 0.45, 0x8a7a62, 0, 0, 0, scene, 14);
  K.shot(cam, 'top', [0, 1.5, 0], 9);
  return (t, ph) => {
    const settle = K.win(ph, 0.55, 0.95, 0.12);
    needle.rotation.y = (1 - settle) * (0.9 * Math.sin(ph * 5) * Math.exp(-((ph / 6.2832) % 1) * 2));
    knob.rotation.x = ph * 2;
    const lift = K.win(ph, 0.05, 0.45, 0.1);
    basket.position.set(-0.4, 1.6 + lift * 1.2, 2.2 - lift * 0.4);
    C.pose({ headPitch: 0.4, armR: { fwd: 1.0 + lift * 0.6, elbow: 0.4 }, armL: { fwd: 1.0 + lift * 0.6, elbow: 0.4 } });
    M.pose({ headPitch: 0.45, headTilt: 0.1 * Math.sin(ph * 2), armL: { fwd: 1.2, elbow: 0.8 + 0.3 * Math.sin(ph * 4) }, armR: { fwd: 0.9, point: true } });
    const p = aw.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(ph * 2 + p.getX(i)) * 0.18 * (p.getY(i) + 0.6)); p.needsUpdate = true;
  };
}
