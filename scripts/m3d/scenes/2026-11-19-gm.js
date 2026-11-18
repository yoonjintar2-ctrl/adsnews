// 11/19 안광주 미니 사설 「10년 비워 둔 모델 자리, 겨울 한 철에 앉혔다」
// 밤 소극장 빈 무대, 넓게: 스포트라이트 아래 오래 비어 있던 의자. 정장 차림 AE가 의자를 빼 주며 목도리를 걸치고, 조명이 천천히 흔들리며 먼지가 빛 속에서 떠다닌다. 무대 뒤 막이 살랑인다.
export const secs = 3;
export const meta = { place: '밤 소극장 빈 무대 스포트라이트', where: 'indoor', time: 'night', camera: 'wide', floor: 'wood', figures: 'solo-side', motion: ['spot-sway', 'chair-slide', 'scarf-swing', 'curtain-ripple', 'dust'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  scene.background = new THREE.Color(0x0c0c0c); if (scene.fog) scene.fog.color = new THREE.Color(0x0c0c0c);
  const amb = scene.children.find(o => o.isAmbientLight); if (amb) amb.intensity = 0.35;
  K.floor(scene, { style: 'wood', size: 60 });
  K.box(22, 1.0, 10, 0x4a4238, 0, 0.5, -3, scene); // 무대
  // 뒤 막(주름)
  const cur = new THREE.Mesh(new THREE.PlaneGeometry(22, 9, 40, 1), new THREE.MeshLambertMaterial({ color: 0x3a3634, side: THREE.DoubleSide })); cur.position.set(0, 5.5, -8); scene.add(cur);
  // 스포트라이트 원뿔(옅게) + 바닥 빛 원
  const cone = new THREE.Mesh(new THREE.ConeGeometry(2.6, 9, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xf4f2ea, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }));
  const coneG = new THREE.Group(); coneG.position.set(0.5, 10.5, -3); scene.add(coneG); cone.position.y = -4.5; coneG.add(cone);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(2.6, 40), new THREE.MeshBasicMaterial({ color: 0xe6e3da, transparent: true, opacity: 0.55 })); pool.rotation.x = -Math.PI / 2; pool.position.set(0.5, 1.02, -3); scene.add(pool);
  const spot = new THREE.SpotLight(0xffffff, 60, 30, 0.35, 0.5); spot.position.set(0.5, 10.5, -3); spot.target.position.set(0.5, 1, -3); scene.add(spot); scene.add(spot.target);
  // 의자
  const chair = new THREE.Group(); chair.position.set(0.5, 1.0, -3); scene.add(chair);
  K.box(1.4, 0.15, 1.3, 0x8a7d6c, 0, 1.0, 0, chair); K.box(1.4, 1.6, 0.15, 0x8a7d6c, 0, 1.85, 0.6, chair);
  [[-0.6, -0.55], [0.6, -0.55], [-0.6, 0.55], [0.6, 0.55]].forEach(([x, z]) => K.box(0.1, 1.0, 0.1, 0x333333, x, 0.5, z, chair));
  const scarf = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 1.8, 1, 8), new THREE.MeshLambertMaterial({ color: 0xcfcac0, side: THREE.DoubleSide })); scarf.position.set(0.45, 1.9, 0.5); chair.add(scarf);
  // 작은 탁자 + 접시 덮개(겨울 메뉴)
  K.cyl(0.9, 0.9, 0.1, 0x6e655a, 3.0, 2.3, -3.2, scene, 20); K.cyl(0.12, 0.12, 1.3, 0x333333, 3.0, 1.65, -3.2, scene, 8);
  const dome = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), K.lam(0xd8d6d0)), 40); dome.position.set(3.0, 2.35, -3.2); scene.add(dome);
  // AE(옆모습)
  const P = K.person(scene, { x: -1.8, z: -3.0, rot: -Math.PI / 2, coat: 0x2e2e30, hair: 'short', scale: 1.0 }); P.root.position.y = 1.0;
  const dust = K.motes(scene, { n: 40, box: [4, 8, 3], z0: -3, size: 0.06 });
  K.shot(cam, 'wide', [0.4, 3.0, -3], 10.5);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    const sw = 0.05 * Math.sin(ph); coneG.rotation.z = sw; pool.position.x = 0.5 - sw * 9; spot.target.position.x = pool.position.x;
    const pull = W(0.15, 0.75); chair.position.x = 0.5 - 0.5 * pull; chair.rotation.y = 0.25 * pull;
    P.pose({ lean: 0.18 * pull, headPitch: 0.2 * pull, headYaw: -0.3 * W(0.6, 0.95), armR: { fwd: 1.2 * pull + 0.1, elbow: 0.5 * pull }, armL: { fwd: 1.0 * pull + 0.1, elbow: 0.4 }, bob: 1.0 });
    const sp = scarf.geometry.attributes.position; for (let k = 0; k < sp.count; k++) { const y = sp.getY(k); sp.setZ(k, Math.sin(ph * 2 + y * 2) * 0.12 * (0.9 - y) / 1.8); } sp.needsUpdate = true;
    const cp = cur.geometry.attributes.position; for (let k = 0; k < cp.count; k++) { const x = cp.getX(k); cp.setZ(k, Math.sin(x * 2.2 + ph) * 0.18); } cp.needsUpdate = true;
    if (dust.update) dust.update(ph);
  };
}
