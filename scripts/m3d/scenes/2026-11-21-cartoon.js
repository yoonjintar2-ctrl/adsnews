// 11/21 금로동 사설 「은행이 꺼낸 80년 전 배, 광고가 기억을 맡았다」(도안나 그림)
// 밤 방파제 끝 등대 아래: 한 사람이 바다 쪽을 보다 수평선의 작은 배를 손으로 가리킨다. 기둥 끝 리본이 바람에 펄럭이고 발치 등불 불꽃이 일렁이며, 등대 불빛이 천천히 돌며, 작은 배가 물결에 까딱인다.
export const secs = 3;
export const meta = { place: '밤 방파제 끝 등대 아래', where: 'outdoor', time: 'night', camera: 'wide', floor: 'water', figures: 'solo-back', motion: ['ribbon-flutter', 'boat-bob', 'beam-sweep', 'point', 'flame-flicker'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'night', moon: true, stars: 40 });
  K.floor(scene, { style: 'water' });
  // 방파제(안쪽으로 뻗은 콘크리트 둑)
  const pier = K.box(5, 1.2, 26, 0x8d8b86, -3, 0.6, -4, scene);
  for (let i = 0; i < 7; i++) { const t = K.box(1.3, 1.3, 1.3, 0x7a7874, -6.2 + (i % 2) * 0.4, 0.5, 6 - i * 3.6, scene); t.rotation.set(0.4 * i, 0.7 * i, 0.2); }
  // 등대
  K.cyl(0.9, 1.2, 6, 0xd8d6d0, -3.5, 4.2, -15, scene, 16); K.cyl(1.0, 1.0, 0.5, 0x2a2a2a, -3.5, 7.4, -15, scene, 16);
  const lhLamp = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), K.flat(0xf6f4ec)); lhLamp.position.set(-3.5, 8.0, -15); scene.add(lhLamp);
  K.cyl(0.2, 1.1, 0.6, 0x2a2a2a, -3.5, 8.8, -15, scene, 12);
  const beam = new THREE.Group(); beam.position.set(-3.5, 8.0, -15); scene.add(beam);
  const bm = new THREE.Mesh(new THREE.ConeGeometry(2.2, 22, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xf4f2ea, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }));
  bm.rotation.z = Math.PI / 2; bm.position.x = 11; beam.add(bm);
  // 등불 기둥
  K.cyl(0.08, 0.1, 3.4, 0x2a2a2a, -1.4, 2.9, 1.2, scene, 8); K.box(1.0, 0.08, 0.08, 0x2a2a2a, -1.0, 4.55, 1.2, scene);
  // 기둥 끝 리본 깃발(바람에 펄럭) + 발치에 놓인 등불(불꽃이 일렁)
  const lan = new THREE.Group(); lan.position.set(-0.5, 4.5, 1.2); scene.add(lan);
  const rib = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35, 8, 1), new THREE.MeshLambertMaterial({ color: 0xdedad2, side: THREE.DoubleSide })); rib.position.x = 0.7; lan.add(rib);
  K.box(0.45, 0.6, 0.45, 0x3a3a3a, -4.2, 1.5, 1.6, scene);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), K.flat(0xfaf6e6)); glow.position.set(-4.2, 1.5, 1.36); scene.add(glow);
  // 사람(뒷모습 → 오른쪽 바다를 봄)
  const P = K.person(scene, { x: -2.6, z: 0.2, rot: -0.9, coat: 0x4a4846, hair: 'bun', scale: 1.0 }); P.root.position.y = 1.2;
  // 작은 배
  const boat = new THREE.Group(); boat.position.set(9, 0.1, -12); scene.add(boat);
  K.box(2.6, 0.6, 1.0, 0x3a3836, 0, 0.3, 0, boat); K.box(0.9, 0.7, 0.7, 0xbab8b2, -0.3, 0.95, 0, boat);
  const bl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), K.flat(0xfaf6e6)); bl.position.set(0.9, 1.0, 0); boat.add(bl);
  cam.position.set(1.2, 3.8, 8.5); cam.lookAt(-0.5, 3.0, -5);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    const rp = rib.geometry.attributes.position; for (let k = 0; k < rp.count; k++) { const x = rp.getX(k) + 0.7; rp.setZ(k, Math.sin(ph * 3 - x * 3) * 0.18 * x); } rp.needsUpdate = true;
    glow.scale.setScalar(1 + 0.25 * Math.sin(ph * 5)); glow.material.color.setScalar(0.85 + 0.15 * Math.sin(ph * 3));
    beam.rotation.y = -0.6 + 0.9 * Math.sin(ph);
    boat.position.y = 0.1 + 0.12 * Math.sin(ph * 2); boat.rotation.z = 0.08 * Math.sin(ph * 2 + 1); boat.rotation.x = 0.05 * Math.cos(ph * 2);
    const pt = W(0.3, 0.8);
    P.pose({ headYaw: -0.3 - 0.3 * pt, headPitch: 0.05, torsoYaw: -0.15 * pt, armR: { fwd: 0.3 + 1.2 * pt, out: 0.5 * pt, point: pt > 0.5 }, armL: { fwd: 0.1 } });
  };
}
