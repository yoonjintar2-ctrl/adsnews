// 11/16 도안나 트렌드 노트 #푸드 오브제 — 만두 모양 가방과 버터 모양 립밤 앞에서 놀라 가리키는 손님, 고개를 내미는 친구
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b8b8b2', tiles: 5 });
  K.box(40, 20, 1, 0xa4a4a0, 0, 10, -9, scene);
  K.box(5, 3, 2.6, 0x6a6a68, -6, 1.5, -5, scene); K.box(5.4, 0.3, 3, 0x1a1a1a, -6, 3.15, -5, scene);
  K.box(4, 2.6, 2.4, 0x6a6a68, 0.5, 1.3, -5, scene); K.box(4.4, 0.3, 2.8, 0x1a1a1a, 0.5, 2.75, -5, scene);
  // 만두 가방: 반구 + 주름 + 손잡이
  const bag = new THREE.Group(); bag.position.set(-6, 3.3, -5); scene.add(bag);
  const dome = K.inked(new THREE.Mesh(new THREE.SphereGeometry(1.8, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), K.lam(0xeeeeea)), 30); dome.scale.set(1.15, 1.0, 0.75); bag.add(dome);
  for (let i = 0; i < 7; i++) { const p = K.cyl(0.08, 0.16, 0.5, 0xd8d8d2, -1.2 + i * 0.4, 1.9, 0, bag, 8); }
  const handle = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.09, 8, 24, Math.PI), K.lam(0x222222)); handle.position.y = 1.9; bag.add(handle);
  // 버터 립밤: 버터 덩어리 + 작은 립밤
  const butter = new THREE.Group(); butter.position.set(0.5, 2.9, -5); scene.add(butter);
  K.box(2.4, 1.1, 1.4, 0xe8e8de, 0, 0.55, 0, butter); K.box(0.5, 0.9, 0.5, 0xeeeeea, 0.2, 1.55, 0, butter); const capB = K.box(0.55, 0.5, 0.55, 0x2a2a2a, 0.2, 2.2, 0, butter);
  // 냄새 김(곡선 막대)
  const wisps = [0, 1, 2].map(i => K.box(0.08, 1.2, 0.08, 0x222222, -6.8 + i * 0.8, 6.3, -5, scene));
  const lamps = [-6, 0.5].map(x => { const g = new THREE.Group(); g.position.set(x, 17, -5); scene.add(g); K.line([[0, 0, 0], [0, -3.5, 0]], g); K.cyl(0.3, 1.1, 0.7, 0x1a1a1a, 0, -3.8, 0, g, 14); return g; });
  const A = K.person(scene, { x: 5.4, z: 0.8, rot: Math.PI + 0.55, coat: 0x8a8a86, hair: 'long', scale: 1.08 });
  const B = K.person(scene, { x: 8.6, z: 1.4, rot: Math.PI + 0.5, coat: 0xeeeeea, hair: 'cap', scale: 1.02 });
  cam.position.set(0, 7, 17.5); cam.lookAt(0, 5.6, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    lamps.forEach((g, i) => { g.rotation.z = Math.sin(ph + i * 1.3) * 0.13; });
    bag.rotation.y = 0.25 * Math.sin(ph); handle.rotation.x = 0.2 * Math.sin(ph * 2);
    capB.position.y = 2.2 + 0.5 * W(0.2, 0.7); capB.rotation.z = 0.4 * W(0.2, 0.7);
    wisps.forEach((w, i) => { w.position.y = 6.3 + Math.sin(ph + i * 2) * 0.4; w.rotation.z = Math.sin(ph * 2 + i) * 0.4; });
    const pt = W(0.1, 0.8);
    A.pose({ headYaw: -0.3, torsoYaw: 0, lean: -0.1 * pt, headPitch: -0.1, armR: { fwd: 1.6 * pt, out: -0.45 * pt, point: pt > 0.3 }, armL: { fwd: 1.4 * pt, elbow: 2.2 * pt } });
    const sn = W(0.35, 0.95);
    B.pose({ lean: 0.25 * sn, headPitch: 0.2 * sn, headYaw: -0.2, headTilt: 0.15 * Math.sin(ph * 4) * sn, armL: { fwd: 0.6, elbow: 1.8 * sn }, armR: { fwd: 0.3 } });
  };
}
