// 11/22 도안나 트렌드 노트 「매장 대신 마을을 짓는 겨울」(#크리스마스 마켓)
// 밤 크리스마스 마켓 오두막 골목, 비스듬히 기울여 잡은 구도: 뾰족 지붕 나무 오두막 넷이 골목 양쪽에 서고, 처마 전구가 차례로 반짝인다.
// 컵을 든 두 사람이 골목을 걸어 들어오고(제자리 걸음), 컵에서 김이 오르고, 굴뚝 연기가 피어오른다.
export const secs = 3;
export const meta = { place: '밤 크리스마스 마켓 나무 오두막 골목', where: 'outdoor', time: 'night', camera: 'dutch', floor: 'wood', figures: 'crowd', motion: ['bulb-chase', 'walk-bob', 'cup-steam', 'chimney-smoke'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'night', stars: 25 });
  K.floor(scene, { style: 'wood', color: '#7f776c' });
  const bulbs = [];
  const hut = (x, z, rot) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
    K.box(4, 3, 3, 0x6e6458, 0, 1.5, 0, g);
    [-1, 1].forEach(sd => { const r = K.box(2.6, 0.18, 3.6, 0x3a3632, sd * 1.05, 3.65, 0, g); r.rotation.z = -sd * 0.65; });
    K.box(3.0, 1.2, 0.1, 0x1e1e1e, 0, 1.9, 1.52, g);  // 판매 창(어두움)
    K.box(3.4, 0.15, 0.7, 0x5a5048, 0, 1.25, 1.75, g); // 판매대
    for (let i = 0; i < 3; i++) { const j = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), K.lam(i % 2 ? 0xdedcd4 : 0x7a7a74)); j.position.set(-0.9 + i * 0.9, 1.55, 1.75); g.add(j); }
    for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), K.flat(0xf2efe4)); b.position.set(-1.9 + i * 0.63, 2.95 + Math.sin(i / 6 * Math.PI) * -0.18, 1.62); g.add(b); bulbs.push(b); }
    return g; };
  hut(-5.2, -3, 0.55); hut(-6.6, -10, 0.45); hut(5.2, -3, -0.55); hut(6.6, -10, -0.45);
  // 굴뚝 + 연기
  K.box(0.5, 1.4, 0.5, 0x3a3836, 6.0, 4.4, -10.3, scene);
  const smoke = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ color: 0x9a9a98, transparent: true })); scene.add(m); return m; });
  K.tree(scene, { x: 0, z: -16, h: 7, kind: 'pine', s: 1.3 });
  // 사람들
  const mk = (x, z, coat, hair, rot, sc) => K.person(scene, { x, z, rot, coat, hair, scale: sc });
  const A = mk(-0.8, 1.5, 0x5a5a58, 'long', 0.1, 1.0), B = mk(0.9, 1.7, 0x9a9690, 'cap', -0.1, 1.05);
  const C = mk(-1.6, -7, 0x3a3a3a, 'bun', Math.PI - 0.2, 0.9), D = mk(1.8, -8.5, 0x7a7a76, 'short', 0.4, 0.9);
  const cups = [A, B].map(() => K.cyl(0.18, 0.15, 0.35, 0xeeeeea, 0, 0, 0, scene, 12));
  const steam = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf6f6f2, transparent: true })); scene.add(m); return m; });
  cam.position.set(10, 4.2, 9); cam.lookAt(-1, 2.4, -5); cam.rotation.z += 0.13;
  return (t, ph) => {
    const u = ((ph / 6.2832) % 1);
    bulbs.forEach((b, i) => { const on = Math.sin(ph * 3 - i * 0.9) > 0.2; b.material.color.setScalar(on ? 0.98 : 0.45); });
    const step = (P, o, lk) => P.pose({ bob: Math.abs(Math.sin(ph * 4 + o)) * 0.08, headYaw: lk, armL: { fwd: 0.3 * Math.sin(ph * 4 + o) }, armR: { fwd: 1.2, elbow: 1.6 } });
    step(A, 0, -0.5 + 0.3 * Math.sin(ph)); step(B, 1.5, 0.5 + 0.2 * Math.sin(ph + 1));
    C.pose({ headYaw: 0.4 * Math.sin(ph), armR: { fwd: 0.8, point: true } }); D.pose({ headPitch: 0.1 * Math.sin(ph * 2), armL: { fwd: 0.6, elbow: 1.0 } });
    [[A, -0.8, 1.5], [B, 0.9, 1.7]].forEach(([P, x, z], i) => cups[i].position.set(x + 0.55 * (i ? 1 : 1), 3.05 + P.root.position.y, z - 0.75));
    steam.forEach((m, i) => { const v = ((u * 2 + i / 4) % 1); const c = cups[i % 2].position; m.position.set(c.x + Math.sin(ph * 2 + i) * 0.08, c.y + 0.3 + v * 0.9, c.z); m.material.opacity = 0.7 * (1 - v); m.scale.setScalar(1 + v * 1.5); });
    smoke.forEach((m, i) => { const v = ((u + i / 4) % 1); m.position.set(6.0 + v * 1.2, 5.3 + v * 2.8, -10.3); m.material.opacity = 0.7 * (1 - v); m.scale.setScalar(1 + v * 2); });
  };
}
