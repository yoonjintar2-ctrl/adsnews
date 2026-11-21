// 11/22 금로동 트렌드 노트 「할머니 옥반지, 2030 손끝에 앉다」(#옥코어, 그림 도안나)
// 이른 아침 종로 길가 좌판, 바로 위에서 내려다본 구도: 천 깔린 나무 쟁반에 옥반지가 줄지어 놓이고,
// 손님의 손이 반지 하나를 집어 들어 올렸다 내려놓고, 주인의 손이 다른 반지를 앞으로 밀어 준다. 천 귀퉁이가 바람에 들썩이고 동전이 맴돈다.
export const secs = 3;
export const meta = { place: '이른 아침 종로 길가 좌판 옥반지 쟁반', where: 'outdoor', time: 'dawn', camera: 'top', floor: 'asphalt', figures: 'hands-only', motion: ['ring-pick', 'hand-push', 'cloth-flap', 'coin-spin'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'dawn' });
  K.floor(scene, { style: 'asphalt', color: '#7c7c78' });
  // 좌판 접이 탁자 + 쟁반 + 천
  K.box(12, 0.3, 8, 0x5e554a, 0, 1.0, 0, scene);
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(10, 6.4, 10, 6), new THREE.MeshLambertMaterial({ color: 0x4a4a48, side: THREE.DoubleSide })); cloth.rotation.x = -Math.PI / 2; cloth.position.set(0, 1.17, 0); scene.add(cloth);
  const rings = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    const g = new THREE.Group(); g.position.set(-3.75 + c * 1.5, 1.25, -1.8 + r * 1.8); scene.add(g);
    const band = K.inked(new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.07, 8, 20), K.lam(0xb8b4aa)), 40); band.rotation.x = -Math.PI / 2; g.add(band);
    const jade = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), K.lam((r + c) % 3 ? 0x8a948a : 0xc8ccc4)), 40); jade.scale.set(1, 0.6, 0.8); jade.position.set(0, 0.12, -0.34); g.add(jade);
    rings.push(g); }
  // 동전
  const coin = K.cyl(0.35, 0.35, 0.06, 0xd8d4c8, 4.4, 1.25, 2.6, scene, 20);
  // 손(손님: 화면 아래에서, 주인: 화면 위에서)
  const hand = (coat) => { const g = new THREE.Group(); scene.add(g);
    const sleeve = K.cyl(0.42, 0.42, 3, coat, 0, 0, 1.8, g, 12); sleeve.rotation.x = Math.PI / 2;
    const palm = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), K.lam(0xd0ccc4)), 40); palm.scale.set(1, 0.45, 1.2); g.add(palm);
    [-0.27, -0.09, 0.09, 0.27].forEach((x, i) => { const f = K.cyl(0.075, 0.075, 0.55 - Math.abs(x) * 0.4, 0xd0ccc4, x, 0, -0.65, g, 6); f.rotation.x = Math.PI / 2; });
    const th = K.cyl(0.08, 0.08, 0.4, 0xd0ccc4, 0.45, 0, -0.2, g, 6); th.rotation.set(Math.PI / 2, 0, -0.8); return g; };
  const H1 = hand(0x6a6a68), H2 = hand(0x3a3836); H2.rotation.y = Math.PI;
  cam.position.set(0.01, 15.5, 0.6); cam.lookAt(0, 1.2, 0.3);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    const pick = W(0.15, 0.6);
    const tgt = rings[13];
    H1.position.set(-0.75 + 0.0, 1.6 + 1.2 * pick, 3.6 - 1.3 * W(0.05, 0.75));
    tgt.position.set(-0.75, 1.25 + 1.1 * pick, 1.8 + 0.0 * pick); tgt.rotation.z = 0.4 * pick;
    H2.position.set(2.25, 1.6, -3.6 + 1.0 * W(0.55, 0.95)); rings[3].position.z = -1.8 + 0.6 * W(0.6, 0.95);
    const p = cloth.geometry.attributes.position; for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k); p.setZ(k, x > 4 && y < -2 ? Math.sin(ph * 2 + x) * 0.25 * (x - 4) : 0); } p.needsUpdate = true;
    coin.rotation.z = Math.sin(ph * 2) * 0.3; coin.rotation.y = ph * 2; coin.position.x = 4.4 + Math.cos(ph) * 0.3;
  };
}
