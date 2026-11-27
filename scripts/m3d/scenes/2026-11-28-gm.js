// 11/28 안광주 미니 사설 「모델료 대신 '맞는 얼굴'에 예산을 쓰는 법」
// 낮 회의실 원목 테이블 위 천칭을 가까이: 왼쪽 접시엔 큰 별 하나, 오른쪽 접시에 손이 얼굴 카드(글자 없음)를 한 장씩 올리자
// 기울었던 저울대가 천천히 수평을 찾는다. 옆 동전 탑이 살짝 흔들리고 창 커튼이 나부낀다.
export const secs = 3;
export const meta = { place: '낮 회의실 원목 테이블 위 천칭', where: 'indoor', time: 'day', camera: 'close', floor: 'wood', figures: 'hands-only', motion: ['beam-balance', 'card-drop', 'hand-place', 'curtain', 'coin-wobble'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  const Rm = K.room(scene, { w: 24, d: 14, h: 10, wall: 'stripe', wallColor: '#c2bfb8', floorStyle: 'wood', windowAt: [-6, 6, 5, 4] });
  K.box(14, 0.4, 6, 0x8a7a66, 0, 2.6, 0, scene);
  [-6, 6].forEach(x => [-2.4, 2.4].forEach(z => K.box(0.4, 2.6, 0.4, 0x5a4e42, x, 1.3, z, scene)));
  // 천칭
  K.cyl(1.0, 1.2, 0.3, 0x333333, 0, 2.95, 0, scene, 16); K.cyl(0.12, 0.12, 3.2, 0x444444, 0, 4.6, 0, scene, 8);
  const beam = new THREE.Group(); beam.position.set(0, 6.2, 0); scene.add(beam);
  K.box(6.4, 0.18, 0.18, 0x2a2a2a, 0, 0, 0, beam);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 10), K.lam(0xdedad2)); beam.add(knob);
  const pans = [-3, 3].map(x => { const g = new THREE.Group(); scene.add(g); g.userData.x = x;
    [[-0.8, 0], [0.8, 0], [0, 0.8]].forEach(([a, b]) => K.line([[0, 0, 0], [a, -1.8, b]], g));
    K.cyl(1.0, 0.8, 0.12, 0xe2e0da, 0, -1.85, 0, g, 18); return g; });
  // 별(왼쪽)
  const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.38 : 0.9, a = Math.PI / 2 + i * Math.PI / 5; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const star = K.inked(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.25, bevelEnabled: false }), K.lam(0x5a5a58)), 20); star.position.set(0, -0.9, -0.1); pans[0].add(star);
  // 얼굴 카드(오른쪽) 다섯 장
  const faceTex = K.canvasTex(64, 96, (g, w, h) => { g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1a1a1a'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4); g.beginPath(); g.arc(w / 2, 36, 14, 0, 7); g.stroke(); g.beginPath(); g.arc(w / 2, 92, 26, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); });
  const cards = [0, 1, 2, 3, 4].map(i => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.8, 0.05), [K.lam(0xdddddd), K.lam(0xdddddd), K.lam(0xdddddd), K.lam(0xdddddd), new THREE.MeshLambertMaterial({ map: faceTex }), K.lam(0xdddddd)]); K.inked(m, 20); pans[1].add(m); return m; });
  // 손(오른쪽 위에서)
  const hand = new THREE.Group(); scene.add(hand);
  const fo = K.inked(new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.6, 4, 10), K.lam(0x3a3a3a)), 30); fo.rotation.z = 1.0; fo.position.set(0.95, 0.5, 0); hand.add(fo);
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), K.lam(0xb8b4ae)); palm.scale.set(1.2, 0.7, 1); hand.add(palm);
  // 동전 탑
  const coins = new THREE.Group(); coins.position.set(-5.2, 2.8, 1.2); scene.add(coins);
  for (let i = 0; i < 6; i++) K.cyl(0.4, 0.4, 0.12, 0xcfccc4, (i % 2) * 0.05, i * 0.13, 0, coins, 14);
  cam.position.set(0.6, 6.6, 9.5); cam.lookAt(0.3, 4.6, 0);
  return (t, ph) => {
    Rm.update(ph, 0.15);
    const u = ph / (Math.PI * 2);
    const n = Math.min(5, Math.floor(u / 0.15)); // 놓인 장 수
    const reset = K.win(ph, 0.9, 1.05, 0.04);
    const tilt = 0.28 * (1 - n / 5) * (1 - reset) + 0.28 * reset;
    beam.rotation.z = tilt + Math.sin(ph * 6) * 0.01;
    pans.forEach(g => { const x = g.userData.x; g.position.set(x * Math.cos(tilt), 6.2 + x * Math.sin(tilt), 0); });
    cards.forEach((c, i) => { const on = i < n && reset < 0.5; c.visible = on || i === n; c.position.set(-0.4 + (i % 3) * 0.4, -1.4 + Math.floor(i / 3) * 0.1 + i * 0.06, -0.2 + (i % 2) * 0.3); c.rotation.set(-1.45, 0, (i - 2) * 0.25); });
    const f = (u % 0.15) / 0.15, cur = cards[Math.min(n, 4)];
    if (n < 5) { cur.position.y += (1 - f) * 1.6; cur.rotation.x = -1.45 + (1 - f) * 1.2; }
    const hp = new THREE.Vector3(); cur.getWorldPosition(hp);
    hand.position.set(hp.x + 0.2, hp.y + 0.35 + (n < 5 ? 0 : 1.5), hp.z); hand.visible = n < 5;
    coins.rotation.z = Math.sin(ph * 5) * 0.02;
  };
}
