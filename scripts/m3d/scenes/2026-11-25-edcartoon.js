// 11/25 도안나 미니 사설 「답 한가운데 앉은 광고, 어떤 얼굴이어야 할까」
// 밤 서재 책상 위 펼친 책을 가까이: 문장 줄 사이로 짙은 카드가 쑥 들어왔다 나가고, 연필 쥔 손이 그 둘레에 경계선을 긋는다.
// 오른쪽 페이지 끝이 넘어가다 돌아오고, 책상 스탠드 빛이 살짝 일렁인다.
export const secs = 3;
export const meta = { place: '밤 서재 책상 위 펼친 책', where: 'indoor', time: 'night', camera: 'close', floor: 'wood', figures: 'hands-only', motion: ['card-slide', 'pencil-trace', 'page-lift', 'lamp-glow'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  scene.background = new THREE.Color(0x1c1c1c); if (scene.fog) { scene.fog.color = new THREE.Color(0x1c1c1c); }
  K.box(20, 0.5, 12, 0x6a5a48, 0, -0.25, 0, scene);
  // 펼친 책
  const pageM = K.lam(0xf4f2ec);
  const L = new THREE.Mesh(new THREE.BoxGeometry(4, 0.12, 5.4), pageM); L.position.set(-2.05, 0.1, 0); L.rotation.z = 0.05; scene.add(L);
  const R = new THREE.Mesh(new THREE.BoxGeometry(4, 0.12, 5.4), pageM); R.position.set(2.05, 0.1, 0); R.rotation.z = -0.05; scene.add(R);
  for (let i = 0; i < 8; i++) { if (i === 4) continue; K.box(3.0, 0.02, 0.09, 0x2a2a2a, -2.1, 0.22, -2.1 + i * 0.55, scene); K.box(3.0, 0.02, 0.09, 0x2a2a2a, 2.1, 0.22, -2.1 + i * 0.55, scene); }
  const card = K.box(3.0, 0.08, 0.7, 0x5a5a56, -2.1, 0.26, 0.1, scene);
  const tag = K.box(0.6, 0.1, 0.3, 0x111111, -3.2, 0.3, 0.1, scene);
  // 넘어가는 페이지(오른쪽, 척추 기준)
  const flipG = new THREE.Group(); flipG.position.set(0.05, 0.18, 0); scene.add(flipG);
  const flip = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 5.2), new THREE.MeshLambertMaterial({ color: 0xfaf8f2, side: THREE.DoubleSide })); flip.rotation.x = -Math.PI / 2; flip.position.x = 1.95; flipG.add(flip);
  // 점선 경계(오른쪽 페이지) — 연필이 그리는 만큼 보인다
  const dashes = []; for (let i = 0; i < 14; i++) { const d = K.box(0.18, 0.02, 0.05, 0x1a1a1a, 0, 0.24, 0, scene); const a = i / 14; const per = 2 * (3 + 0.7); let p = a * per, x, z; if (p < 3) { x = 0.6 + p; z = -0.25; } else if (p < 3.7) { x = 3.6; z = -0.25 + (p - 3); } else if (p < 6.7) { x = 3.6 - (p - 3.7); z = 0.45; } else { x = 0.6; z = 0.45 - (p - 6.7); } d.position.x = x; d.position.z = z; if (p >= 3 && p < 3.7 || p >= 6.7) d.rotation.y = Math.PI / 2; dashes.push([d, a]); }
  // 연필 든 손
  const hand = new THREE.Group(); scene.add(hand);
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 10), K.lam(0xcfcbc4)); palm.scale.set(1, 0.7, 1.2); hand.add(palm);
  const fore = K.cyl(0.32, 0.38, 3, 0x8a8680, 0, 0, 0, hand, 12); fore.rotation.z = Math.PI / 2; fore.position.set(1.6, 0.2, 0.3);
  const pencil = K.cyl(0.06, 0.06, 1.6, 0xe8e2d0, 0, 0, 0, hand, 8); pencil.rotation.x = 0.6; pencil.position.set(-0.3, -0.4, -0.3);
  // 스탠드(책상 위에 선 것)
  K.cyl(0.6, 0.7, 0.2, 0x2a2a2a, -5.5, 0.1, -3, scene, 16); K.cyl(0.06, 0.06, 3, 0x2a2a2a, -5.5, 1.6, -3, scene, 6);
  const shade = K.cyl(0.3, 1.0, 0.9, 0x3a3a3a, -4.8, 3.1, -2.6, scene, 16); shade.rotation.z = -0.5;
  const glow = new THREE.PointLight(0xfff4e0, 30, 14); glow.position.set(-4.3, 2.4, -2.2); scene.add(glow);
  cam.position.set(0.2, 7.2, 5.6); cam.lookAt(0.3, 0, 0.2);
  return (t, ph) => {
    const u = ph / (Math.PI * 2);
    const sl = K.win(ph, 0.08, 0.92, 0.12);
    card.position.x = -2.1 - (1 - sl) * 4.2; tag.position.x = card.position.x - 1.1;
    const tr = Math.min(1, Math.max(0, (u - 0.15) / 0.6));
    dashes.forEach(([d, a]) => { d.visible = a <= tr && u < 0.95; });
    const per = 7.4; let p = tr * per, x, z; if (p < 3) { x = 0.6 + p; z = -0.25; } else if (p < 3.7) { x = 3.6; z = -0.25 + (p - 3); } else if (p < 6.7) { x = 3.6 - (p - 3.7); z = 0.45; } else { x = 0.6; z = 0.45 - (p - 6.7); }
    hand.position.set(x + 0.4, 1.0 + 0.1 * Math.sin(ph * 6), z + 0.5);
    flipG.rotation.z = 0.5 * K.win(ph, 0.55, 0.85, 0.1);
    glow.intensity = 26 + 4 * Math.sin(ph * 3);
  };
}
