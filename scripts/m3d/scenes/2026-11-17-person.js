// 11/17 오늘의 광고인 김석년 — 글이 숲이 된다
// 흐린 날 숲 가장자리에 놓인 책상을 가까이서 본 구도: 펜을 쥔 손이 원고를 쓰고, 종이 위에서 어린 나무 세 그루가 자라며 흔들린다.
// 뒤로 소나무 숲이 이어진다. (인물 얼굴 없음 — 손만)
export const secs = 3;
export const meta = { place: '숲 가장자리 야외 책상', where: 'outdoor', time: 'overcast', camera: 'close', floor: 'sand', figures: 'hands-only', motion: ['pen-write', 'sapling-grow', 'pine-sway'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'overcast' });
  K.floor(scene, { style: 'sand' });
  const pines = []; for (let i = 0; i < 9; i++) pines.push(K.tree(scene, { x: -16 + i * 4 + (i % 2), z: -14 - (i % 3) * 3, h: 8 + (i % 3), kind: 'pine' }));
  K.box(8, 0.35, 4.4, 0x5c544a, 0, 3, 0, scene); [[-3.6, -1.9], [3.6, -1.9], [-3.6, 1.9], [3.6, 1.9]].forEach(([x, z]) => K.box(0.3, 3, 0.3, 0x3e3830, x, 1.5, z, scene));
  const paper = K.box(3.4, 0.04, 2.4, 0xf4f2ec, -0.4, 3.2, 0.3, scene);
  const lines = []; for (let i = 0; i < 5; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.05), K.flat(0x555555)); l.rotation.x = -Math.PI / 2; l.position.set(-0.4, 3.23, -0.5 + i * 0.4); l.scale.x = 0.01; scene.add(l); lines.push(l); }
  const saps = [-1.4, -0.4, 0.6].map((x, i) => { const g = new THREE.Group(); g.position.set(x, 3.22, -0.5); scene.add(g); K.cyl(0.04, 0.06, 1, 0x3e3830, 0, 0.5, 0, g, 6); const top = K.inked(new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 8), K.lam(0x6b7564)), 30); top.position.y = 1.2; g.add(top); return g; });
  // 손과 펜
  const hand = new THREE.Group(); scene.add(hand);
  { const a = K.cyl(0.26, 0.32, 5, 0x4a4a48, 0, 0, 0, null, 12); const g = new THREE.Group(); g.add(a); a.position.y = 2.5; g.rotation.set(-1.1, 0, -0.9); hand.add(g); }
  const palm = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10), K.lam(0xb8b4ae)), 40); palm.scale.set(1, 0.6, 1.2); hand.add(palm);
  const pen = K.cyl(0.05, 0.05, 1.3, 0x1e1e1e, -0.25, 0.4, -0.3, hand, 6); pen.rotation.x = 0.7;
  cam.position.set(-1.5, 6.4, 6.4); cam.lookAt(-0.3, 3.5, -0.8);
  return (t, ph) => {
    const u = ph / (Math.PI * 2);
    pines.forEach((p, i) => p.update(ph, 0.03, i));
    const row = Math.min(4, Math.floor(u * 5)), fr = (u * 5) % 1;
    lines.forEach((l, i) => { l.scale.x = i < row ? 1 : i === row ? Math.max(0.01, fr) : 0.01; l.position.x = -0.4 - 1.3 * (1 - l.scale.x); });
    hand.position.set(-1.6 + 2.6 * fr, 3.55 + Math.abs(Math.sin(ph * 12)) * 0.05, -0.5 + row * 0.4 + 0.3);
    saps.forEach((g, i) => { const s = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(ph - i * 0.8)); g.scale.setScalar(s); g.rotation.z = Math.sin(ph * 2 + i) * 0.12; });
  };
}
