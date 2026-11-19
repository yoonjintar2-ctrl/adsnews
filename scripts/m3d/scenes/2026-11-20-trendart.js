// 11/20 금로동 트렌드 「잠도 돈도 '최대치'로, 맥싱 시대」(도안나 그림)
// 새벽 침실을 넓게: 베개를 높이 쌓고 안대를 쓴 채 누운 사람, 벽의 계기판 바늘이 최대치로 올라갔다 내려오고, 협탁 자명종이 떨린다. 커튼 틈으로 새벽빛.
export const secs = 3;
export const meta = { place: '새벽 침실 베개 탑 침대', where: 'indoor', time: 'dawn', camera: 'wide', floor: 'carpet', figures: 'solo-lying', motion: ['gauge-needle', 'clock-shake', 'breath'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  const rm = K.room(scene, { w: 18, d: 10, h: 8, wall: 'stripe', wallColor: '#a9a69f', floorStyle: 'carpet', windowAt: [5.5, 4.6, 2.6, 2.6], curtain: true });
  scene.background = new THREE.Color(0x8a8780);
  // 침대
  K.box(7, 0.8, 4, 0x3a3836, -1, 0.6, -2, scene); K.box(6.8, 0.5, 3.8, 0xdedad2, -1, 1.25, -2, scene); K.box(0.4, 2.6, 4, 0x2a2826, -4.6, 1.3, -2, scene);
  const blanket = K.box(4.4, 0.45, 3.9, 0x8a8782, 0.3, 1.6, -2, scene);
  // 베개 탑
  for (let i = 0; i < 5; i++) K.box(1.6 - i * 0.05, 0.38, 2.4, i % 2 ? 0xeeeae2 : 0xcfcbc3, -3.4, 1.7 + i * 0.38, -2, scene);
  const head = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), K.lam(0xb8b4ae)), 30); head.position.set(-3.0, 3.75, -2); scene.add(head);
  const hair = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.57, 16, 12, 0, Math.PI * 2, 0, 1.3), K.lam(0x1e1e1e)), 30); hair.rotation.z = Math.PI / 2; hair.position.set(-3.1, 3.75, -2); scene.add(hair);
  K.box(0.15, 0.25, 1.15, 0x111111, -2.5, 3.85, -2, scene); // 안대
  // 계기판
  const g0 = new THREE.Group(); g0.position.set(0.8, 5.0, -4.85); scene.add(g0);
  const dial = new THREE.Mesh(new THREE.CircleGeometry(1.2, 32, 0, Math.PI), K.lam(0xf0ede6)); g0.add(dial); K.inked(dial);
  const needle = K.box(0.08, 1.0, 0.05, 0x111111, 0, 0.5, 0.05, g0); const piv = new THREE.Group(); g0.add(piv); piv.add(needle);
  // 협탁과 자명종
  K.box(1.4, 1.6, 1.4, 0x5a5652, 3.6, 0.8, -3, scene);
  const clk = new THREE.Group(); clk.position.set(3.6, 1.95, -3); scene.add(clk);
  const cb = K.cyl(0.4, 0.4, 0.25, 0xe6e2da, 0, 0, 0, clk, 20); cb.rotation.x = Math.PI / 2;
  [-0.25, 0.25].forEach(x => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), K.lam(0x2a2a2a)); b.position.set(x, 0.38, 0); clk.add(b); });
  K.shot(cam, 'wide', [0, 2.6, -3], 10.5);
  return (t, ph) => {
    piv.rotation.z = 1.4 - 2.6 * K.win(ph, 0.15, 0.7, 0.12);
    const ring = K.win(ph, 0.55, 0.85, 0.05); clk.rotation.z = Math.sin(ph * 40) * 0.12 * ring; clk.position.y = 1.95 + Math.abs(Math.sin(ph * 40)) * 0.05 * ring;
    blanket.scale.y = 1 + 0.12 * Math.sin(ph * 2);
    rm && rm.update && rm.update(ph);
  };
}
