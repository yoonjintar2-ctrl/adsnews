// 11/24 도안나 트렌드 노트 「패키지 맨 앞에 선 요리사의 이름」(#셰프 이름표)
// 낮 백화점 식품관 오픈 직전 셔터 앞(기울인 구도): 셔터가 조금씩 올라가며 진열대 위 상자들이 보이고 — 상자 앞면 가장 큰 자리에 요리사 모자 모양 —
// 줄 선 사람들이 발돋움하고 앞사람이 손가락으로 가리킨다. 천장 거는 배너가 흔들린다(글자 없음).
export const secs = 3;
export const meta = { place: '낮 백화점 식품관 셔터 앞 오픈런 줄', where: 'indoor', time: 'day', camera: 'dutch', floor: 'carpet', figures: 'crowd', motion: ['shutter-rise', 'tiptoe', 'point', 'banner-sway'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.room(scene, { w: 26, d: 16, h: 9, wall: 'stripe', wallColor: '#b9b5ae', floorStyle: 'carpet' });
  // 매장 입구와 진열대·상자
  K.box(10, 0.3, 2, 0x6a625a, 0, 2.0, -6.4, scene); K.box(9.6, 1.9, 1.8, 0x4a443e, 0, 0.95, -6.4, scene);
  const hatBox = (x, s) => { const g = new THREE.Group(); g.position.set(x, 2.15, -6.4); g.scale.setScalar(s); scene.add(g);
    K.box(1.6, 2.0, 1.0, 0xeeece6, 0, 1.0, 0, g);
    [-0.32, 0, 0.32].forEach((a, i) => { const p = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), K.lam(0xd0cec8)); p.position.set(a, 1.55 + (i === 1 ? 0.12 : 0), 0.52); g.add(K.inked(p, 40)); });
    K.box(0.9, 0.22, 0.06, 0xd0cec8, 0, 1.25, 0.52, g); K.box(0.5, 0.08, 0.06, 0x555555, 0, 0.3, 0.52, g); return g; };
  hatBox(-3, 0.9); hatBox(0, 1.1); hatBox(3, 0.9);
  // 셔터(슬랫)
  const sh = new THREE.Group(); scene.add(sh);
  for (let i = 0; i < 12; i++) K.box(11, 0.42, 0.1, i % 2 ? 0x7a7a76 : 0x8a8a86, 0, 0.21 + i * 0.42, -5.2, sh);
  // 배너(무지)
  const ban = []; for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.4, 1, 4), new THREE.MeshLambertMaterial({ color: i === 1 ? 0x3a3a38 : 0xd8d6d0, side: THREE.DoubleSide })); b.position.set(-5 + i * 5, 7, -4); scene.add(K.inked(b)); ban.push(b); }
  // 줄 선 사람들(비스듬한 줄)
  const Q = []; for (let i = 0; i < 6; i++) Q.push(K.person(scene, { x: -3.4 + i * 1.5, z: -2.4 + i * 0.55, rot: 0.15, coat: [0x5a5a58, 0x9a968e, 0x3a3a38, 0x7a766e][i % 4], hair: ['long', 'cap', 'short', 'bun'][i % 4], scale: 0.85 }));
  cam.position.set(7, 4.0, 10); cam.lookAt(0, 2.4, -3.5); cam.rotation.z += 0.14;
  return (t, ph) => {
    const up = 0.5 - 0.5 * Math.cos(ph); sh.position.y = up * 3.6;
    ban.forEach((b, i) => { b.rotation.y = 0.25 * Math.sin(ph + i); });
    Q.forEach((P, i) => { const tip = Math.max(0, Math.sin(ph * 2 + i * 0.8)) * 0.15 * up;
      P.pose({ bob: tip, headPitch: -0.2 * up, headYaw: i === 2 ? 1.1 * K.win(ph, 0.5, 0.85) : 0.1 * Math.sin(ph + i),
        armR: i === 0 ? { fwd: 1.6 + 0.6 * up, point: true } : { fwd: 0.2 }, armL: i === 3 ? { fwd: 1.3, elbow: 1.8 } : { fwd: 0.1 } }); });
  };
}
