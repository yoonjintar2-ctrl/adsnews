// 11/21 도안나 트렌드 노트 「같은 제품, 겨울 한 철만 다른 옷」
// 화장품 매대 선반 클로즈업: 아래 칸엔 늘 보던 병들, 위 칸엔 같은 병이 목도리를 두르고 눈송이 상자 옷을 입었다. 손 하나가 위 칸 상자로 뻗어 오고, 상자 하나의 뚜껑이 톡 튀어 오르며, 목도리 끝이 살랑인다.
export const secs = 3;
export const meta = { place: '저녁 화장품 매대 선반 두 칸', where: 'indoor', time: 'sunset', camera: 'close', floor: 'carpet', figures: 'hands-only', motion: ['hand-reach', 'lid-pop', 'scarf-sway'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.room(scene, { w: 20, d: 10, h: 9, wall: 'panel', wallColor: '#a9a59e', floorStyle: 'carpet', windowAt: null, sides: false });
  // 선반 두 칸
  K.box(10, 0.18, 2.0, 0x4a4844, 0, 1.6, -3.2, scene); K.box(10, 0.18, 2.0, 0x4a4844, 0, 4.0, -3.2, scene); K.box(10, 5.2, 0.15, 0x6a6662, 0, 2.8, -4.2, scene);
  // 아래 칸: 평소 병
  for (let i = 0; i < 5; i++) { K.cyl(0.42, 0.42, 1.3, 0xdedcd6, -3.6 + i * 1.8, 2.35, -3.0, scene, 16); K.cyl(0.2, 0.2, 0.3, 0x2a2a2a, -3.6 + i * 1.8, 3.15, -3.0, scene, 12); }
  // 위 칸: 겨울옷 입은 상자 + 목도리
  const lids = [], scarves = [];
  for (let i = 0; i < 5; i++) { const x = -3.6 + i * 1.8;
    const bx = K.box(1.1, 1.3, 1.1, 0x8c8882, x, 4.75, -3.0, scene);
    const sn = K.canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#8c8882'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f2f2ee'; g.lineWidth = 6; for (let a = 0; a < 3; a++) { g.beginPath(); const r = a * Math.PI / 3; g.moveTo(64 - Math.cos(r) * 40, 64 - Math.sin(r) * 40); g.lineTo(64 + Math.cos(r) * 40, 64 + Math.sin(r) * 40); g.stroke(); } });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshLambertMaterial({ map: sn })); face.position.set(x, 4.75, -2.44); scene.add(face);
    const lid = K.box(1.2, 0.2, 1.2, 0x3a3836, x, 5.5, -3.0, scene); lids.push(lid);
    const sc = K.box(1.2, 0.22, 1.2, 0x5e5a56, x, 4.35, -3.0, scene);
    const tail = new THREE.Group(); tail.position.set(x + 0.35, 4.3, -2.38); scene.add(tail); K.box(0.22, 0.8, 0.06, 0x5e5a56, 0, -0.4, 0, tail); scarves.push(tail); }
  // 손(오른쪽에서 뻗어 옴)
  const hand = new THREE.Group(); scene.add(hand);
  const fa = K.cyl(0.22, 0.26, 3.4, 0x6e6c68, 0, 0, 0, hand, 12); fa.rotation.z = Math.PI / 2; fa.position.x = 1.8;
  const pm = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), K.lam(0xb8b4ae)); pm.scale.set(1.2, 0.7, 1); hand.add(pm);
  [-0.15, 0, 0.15].forEach(z => { const f = K.cyl(0.06, 0.06, 0.4, 0xb8b4ae, -0.35, 0, z, hand, 6); f.rotation.z = Math.PI / 2; });
  cam.position.set(0.8, 4.0, 4.6); cam.lookAt(0.2, 3.7, -3.0);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.12);
    const r = W(0.15, 0.8);
    hand.position.set(6.5 - 3.7 * r, 4.9 + 0.1 * Math.sin(ph * 2), -2.1);
    lids.forEach((l, i) => { const pop = i === 3 ? K.win(ph, 0.45, 0.6, 0.06) : 0; l.position.y = 5.5 + 0.5 * pop; l.rotation.z = 0.25 * pop; });
    scarves.forEach((s, i) => { s.rotation.z = 0.25 * Math.sin(ph * 2 + i); s.rotation.x = 0.1 * Math.cos(ph + i); });
  };
}
