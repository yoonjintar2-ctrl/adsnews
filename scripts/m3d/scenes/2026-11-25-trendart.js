// 11/25 금로동 트렌드 노트 그림 「커피 한 잔에 오늘의 운세」(#운세 마케팅)
// 새벽 카페 창가 바 테이블을 바로 위에서: 테이크아웃 컵 뚜껑 틈으로 운세 종이가 솟아오르고, 손이 다가와 집는다.
// 테이블 위 작은 별 조각들이 반짝이고 김이 오른다.
export const secs = 3;
export const meta = { place: '새벽 카페 창가 바 테이블', where: 'indoor', time: 'dawn', camera: 'top', floor: 'wood', figures: 'hands-only', motion: ['slip-rise', 'star-twinkle', 'hand-reach', 'steam'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  scene.background = new THREE.Color(0x9a9c9e);
  K.box(16, 0.4, 7, 0x8a7a66, 0, -0.2, 0, scene);
  // 창틀 그림자 띠
  for (let i = 0; i < 4; i++) K.box(16, 0.02, 0.25, 0x6a5e50, 0, 0.01, -3 + i * 2, scene);
  const cup = K.cyl(1.0, 0.75, 2.6, 0xf0eee8, 0, 1.3, 0, scene, 24);
  K.cyl(1.08, 1.08, 0.25, 0xd8d6d0, 0, 2.7, 0, scene, 24);
  K.cyl(1.02, 0.9, 0.8, 0x8a8a86, 0, 1.4, 0, scene, 24);
  const slip = new THREE.Group(); scene.add(slip);
  const paper = K.box(0.9, 0.04, 1.6, 0xfaf8f2, 0, 0, 0, slip);
  for (let i = 0; i < 4; i++) K.box(0.6, 0.05, 0.06, 0x333333, 0, 0.02, -0.5 + i * 0.25, slip);
  const st = new THREE.Mesh(new THREE.CircleGeometry(0.18, 5), K.flat(0x1a1a1a)); st.rotation.x = -Math.PI / 2; st.position.set(0, 0.05, 0.55); slip.add(st);
  const stars = []; for (let i = 0; i < 9; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), K.flat(i % 2 ? 0xf4f4f0 : 0x2a2a2a)); const a = i * 0.7; s.position.set(Math.cos(a) * (2.4 + i * 0.25), 0.3, Math.sin(a) * (1.6 + i * 0.1)); scene.add(s); stars.push(s); }
  const steam = []; for (let i = 0; i < 10; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })); scene.add(s); steam.push(s); }
  const hand = new THREE.Group(); scene.add(hand);
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), K.lam(0xcfcbc4)); palm.scale.set(1.1, 0.6, 1.3); hand.add(palm);
  const arm = K.cyl(0.38, 0.45, 5, 0x5a5a56, 0, 0, 0, hand, 12); arm.rotation.z = Math.PI / 2; arm.position.x = 2.8;
  [-0.3, 0, 0.3].forEach(z => { const f = K.cyl(0.1, 0.1, 0.6, 0xcfcbc4, -0.6, 0, z, hand, 8); f.rotation.z = Math.PI / 2; });
  K.shot(cam, 'top', [0, 0, 0], 9); cam.position.set(0.4, 12, 3.2); cam.lookAt(0, 1, 0);
  return (t, ph) => {
    const u = ph / (Math.PI * 2);
    const rise = K.win(ph, 0.05, 0.85, 0.15);
    slip.position.set(0.1, 2.8 + rise * 2.2, 0.1); slip.rotation.z = Math.sin(ph * 3) * 0.2 * rise; slip.rotation.y = 0.4 + rise * 0.3;
    const reach = K.win(ph, 0.4, 0.85, 0.12);
    hand.position.set(6.5 - reach * 5.4, 3.5 + reach * 1.6, 1.5 - reach * 1.2);
    stars.forEach((s, i) => { const k = 0.6 + 0.6 * Math.max(0, Math.sin(ph * 2 + i * 1.3)); s.scale.setScalar(k); s.rotation.y = ph + i; });
    steam.forEach((s, i) => { const k = (u + i / 10) % 1; s.position.set(-0.4 + Math.sin(ph * 2 + i) * 0.3, 2.9 + k * 3, -0.3); s.scale.setScalar(0.5 + k); s.material.opacity = 0.5 * (1 - k); });
  };
}
