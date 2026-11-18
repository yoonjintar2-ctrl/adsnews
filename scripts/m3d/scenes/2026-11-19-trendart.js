// 11/19 금로동 트렌드 「5천 원 화장품, 판이 커졌다」(도안나 그림)
// 낮 마트 계산대 컨베이어를 위에서: 작은 화장품 병들이 벨트를 따라 흘러가고, 손님 손이 돋보기로 한 병의 성분표를 들여다본다. 동전 하나가 돌다 눕는다.
export const secs = 3;
export const meta = { place: '낮 마트 계산대 컨베이어 벨트', where: 'indoor', time: 'day', camera: 'high', floor: 'plain', figures: 'hands-only', motion: ['belt-flow', 'magnifier-hover', 'coin-spin'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.floor(scene, { style: 'plain', color: '#a8a6a0' });
  scene.background = new THREE.Color(0xb9b7b1);
  K.box(12, 1.6, 3.4, 0x4c4a46, 0, 0.8, 0, scene); // 계산대 몸통
  const beltTex = K.canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#2e2e2e'; g.fillRect(0, 0, w, h); g.fillStyle = '#555'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 6, h); });
  beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping; beltTex.repeat.set(4, 1);
  const belt = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.4), new THREE.MeshLambertMaterial({ map: beltTex })); belt.rotation.x = -Math.PI / 2; belt.position.set(-0.6, 1.62, 0); scene.add(belt);
  K.box(1.4, 0.2, 3.4, 0x8a8884, 5.3, 1.7, 0, scene); // 스캐너 쪽 판
  // 작은 병·튜브
  const items = []; const kinds = [[0.22, 0.7, 0xe8e6e0], [0.3, 0.5, 0x9a9892], [0.18, 0.9, 0xd0cec8], [0.26, 0.6, 0x6e6c68], [0.2, 0.75, 0xeeeeea]];
  for (let i = 0; i < 7; i++) { const [r, h, c] = kinds[i % 5]; const g = new THREE.Group(); scene.add(g); K.cyl(r, r, h, c, 0, h / 2, 0, g, 16); K.cyl(r * 0.6, r * 0.6, 0.18, 0x222222, 0, h + 0.09, 0, g, 12); items.push([g, i, ((i * 37) % 10) / 10 - 0.5]); }
  // 동전
  const coin = K.cyl(0.32, 0.32, 0.05, 0x9c9a94, 3.6, 1.9, 1.2, scene, 24);
  // 돋보기 든 손(위에서)
  const H = new THREE.Group(); scene.add(H);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 8, 28), K.flat(0x1a1a1a)); ring.rotation.x = Math.PI / 2; H.add(ring);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.52, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })); lens.rotation.x = -Math.PI / 2; H.add(lens);
  const handle = K.cyl(0.08, 0.1, 1.2, 0x2a2a2a, 1.05, 0, 0.35, H, 10); handle.rotation.z = Math.PI / 2; handle.rotation.y = -0.3;
  const fist = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), K.lam(0xb8b4ae)), 30); fist.position.set(1.75, 0, 0.55); H.add(fist);
  const arm = K.inked(new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 2.2, 4, 10), K.lam(0x7a766f)), 40); arm.rotation.z = Math.PI / 2; arm.rotation.y = -0.35; arm.position.set(3.1, 0, 1.05); H.add(arm);
  K.shot(cam, 'high', [0.2, 1.6, 0], 9.5);
  return (t, ph) => {
    const u = ph / 6.2832;
    beltTex.offset.x = -u * 1.0;
    items.forEach(([g, i, z]) => { const x = ((i / 7 + u / 3) % 1) * 10 - 5.6; g.position.set(x, 1.63, z * 1.2); });
    H.position.set(-0.2 + 0.6 * Math.sin(ph), 2.9 + 0.15 * Math.sin(ph * 2), 0.1 + 0.3 * Math.cos(ph));
    const w = K.win(ph, 0.3, 0.8, 0.12); coin.rotation.z = Math.PI / 2 * (1 - w) + Math.sin(ph * 6) * 0.3 * (1 - w); coin.rotation.y = ph * 4 * (1 - w); coin.position.y = 1.9 + 0.2 * (1 - w);
  };
}
