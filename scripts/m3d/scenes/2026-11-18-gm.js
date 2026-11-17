// 11/18 안광주 미니 사설 「TV 광고에 버튼이 생기면, 성적표도 바뀐다」
// 밤 거실, TV 앞 클로즈업: 손 하나가 리모컨을 들어 누르면 화면 속 투표 버튼이 차례로 깜박이고 체크 표시가 톡 튀어나온다. 옆 탁자의 보고서 막대가 한 칸씩 자란다.
export const secs = 3;
export const meta = { place: '밤 거실 TV 앞 소파 팔걸이', where: 'indoor', time: 'night', camera: 'close', floor: 'carpet', figures: 'hands-only', motion: ['remote-press', 'button-blink', 'check-pop', 'bar-grow'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  const R = K.room(scene, { w: 20, d: 14, h: 8, wall: 'stripe', wallColor: '#8f8b86', floorStyle: 'carpet', windowAt: [-6, 4.5, 3, 3], curtain: true });
  scene.background = new THREE.Color(0x2a2a2a);
  const amb = scene.children.find(o => o.isAmbientLight); if (amb) amb.intensity = 0.5;
  // TV
  K.box(8.4, 4.9, 0.3, 0x111111, 1, 4.2, -6.6, scene); K.box(4, 1.1, 1.2, 0x3a3a3a, 1, 0.55, -6.4, scene);
  const mk = (on, k) => K.canvasTex(512, 300, (g, w, h) => { g.fillStyle = '#e4e2dc'; g.fillRect(0, 0, w, h); g.fillStyle = '#555'; g.fillRect(40, 50, 170, 200);
    g.fillStyle = '#2a2a2a'; for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) if ((i * 7 + j * 3) % 5 < 2 || (i < 2 && j < 2)) g.fillRect(250 + j * 16, 40 + i * 16, 16, 16);
    [0, 1].forEach(b => { g.fillStyle = (on && b === k) ? '#1a1a1a' : '#bdbab4'; g.beginPath(); g.roundRect(250 + b * 120, 160, 100, 50, 25); g.fill(); });
    g.fillStyle = '#9a9792'; g.fillRect(250, 228, 220, 34); });
  const T0 = mk(false, 0), T1 = mk(true, 0), T2 = mk(true, 1);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.6), new THREE.MeshBasicMaterial({ map: T0 })); scr.position.set(1, 4.2, -6.43); scene.add(scr);
  const check = K.box(0.5, 0.5, 0.15, 0x1a1a1a, 1.5, 6.2, -6.3, scene);
  // 소파 팔걸이 + 손 + 리모컨
  K.box(6, 1.6, 2.2, 0x5a5652, -2.5, 0.8, 3.6, scene); K.box(1.0, 2.4, 2.4, 0x4c4844, 0.8, 1.2, 3.6, scene);
  const hand = new THREE.Group(); hand.position.set(0.9, 2.7, 3.2); scene.add(hand);
  K.cyl(0.35, 0.4, 2.0, 0x6a6662, 0, 0, 0.9, hand, 12).rotation.x = Math.PI / 2;
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), K.lam(0xb8b4ae)); palm.scale.set(1, 0.7, 1.2); hand.add(palm);
  const remote = K.box(0.36, 0.18, 1.5, 0x222222, 0, 0.3, -0.6, hand);
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.3, 3, 6), K.lam(0xb8b4ae)); thumb.rotation.x = Math.PI / 2; thumb.position.set(0.05, 0.48, -0.5); hand.add(thumb);
  // 탁자 위 보고서(막대 그래프 입체)
  K.box(3.2, 0.2, 2.2, 0x6a5f52, 5.6, 2.0, 1.6, scene); [-1.4, 1.4].forEach(a => K.box(0.15, 2, 0.15, 0x333333, 5.6 + a, 1, 1.6, scene));
  const bars = [0, 1, 2, 3].map(i => K.box(0.4, 1, 0.4, i === 3 ? 0x1a1a1a : 0x8a8782, 4.6 + i * 0.65, 2.6, 1.6, scene));
  cam.position.set(2.4, 4.0, 7.6); cam.lookAt(1.6, 3.6, -3);
  return (t, ph) => {
    const u = ph / (Math.PI * 2);
    const press = K.win(ph, 0.15, 0.3, 0.05) + K.win(ph, 0.55, 0.7, 0.05);
    thumb.position.y = 0.48 - 0.12 * press; hand.rotation.x = -0.08 * press;
    scr.material.map = u < 0.22 ? T0 : u < 0.62 ? T1 : T2;
    const pop = K.win(ph, 0.62, 0.95, 0.06); check.scale.setScalar(0.01 + pop); check.position.y = 6.2 + 0.4 * pop; check.rotation.z = 0.6 * pop;
    bars.forEach((b, i) => { const h = 0.6 + i * 0.35 + (i === 3 ? 0.9 * K.win(ph, 0.3, 0.95, 0.15) : 0); b.scale.y = h; b.position.y = 2.1 + h / 2; });
    R.update(ph, 0.08);
  };
}
