// 11/17 금로동 트렌드 노트 #한유주 코어 — 반짝이 대신 향 하나
// 해 질 녘 창가 방, 비스듬히 기운 구도: 긴 코트에 목도리를 두른 사람이 눈을 감고 향수를 뿌리고,
// 향수 방울이 공기 중에 퍼진다. 커튼이 흔들리고, 반짝이 옷걸이는 방 구석으로 천천히 밀려난다.
export const secs = 3;
export const meta = { place: '해 질 녘 창가 방', where: 'indoor', time: 'sunset', camera: 'dutch', floor: 'carpet', figures: 'solo-front', motion: ['perfume-mist', 'curtain-sway', 'rack-slide'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  const R = K.room(scene, { w: 16, d: 12, h: 9, wall: 'panel', wallColor: '#a8a49c', floorStyle: 'carpet', windowAt: [-2.5, 5, 5, 4] });
  const key = scene.children.find(o => o.isDirectionalLight); if (key) { key.intensity = 1.6; key.position.set(-6, 6, -10); }
  const P = K.person(scene, { x: 1.2, z: -1, rot: Math.PI + 0.25, coat: 0x2e2e2c, hair: 'long', scale: 1.05 });
  const scarf = K.inked(new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.16, 8, 18), K.lam(0xd8d4cc)), 30); scarf.rotation.x = Math.PI / 2; scarf.position.y = 1.5; P.torso.add(scarf);
  const bottle = K.cyl(0.18, 0.22, 0.5, 0x8a8a88, 0, 0, 0, scene, 10);
  const mist = K.weather(scene, { kind: 'bubbles', n: 24, box: [3, 3, 2], z0: 1.6 }); mist.mesh.position.set(1.8, 3.0, 0.8); mist.mesh.scale.setScalar(0.45);
  // 반짝이 옷걸이(행거 + 반짝이 조각)
  const rack = new THREE.Group(); scene.add(rack); K.box(3, 0.1, 0.1, 0x333333, 0, 5, 0, rack); [-1.4, 1.4].forEach(x => K.box(0.1, 5, 0.1, 0x333333, x, 2.5, 0, rack));
  for (let i = 0; i < 4; i++) { const d = K.inked(new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.4, 6), K.lam(0xd8d6d0)), 30); d.position.set(-1 + i * 0.7, 3.6, 0); rack.add(d); }
  K.box(1.2, 2, 0.6, 0x6e6a62, -5.5, 1, -4.5, scene); const rose = K.cyl(0.3, 0.2, 0.9, 0x8a8682, -5.5, 2.45, -4.5, scene, 10);
  cam.position.set(6.5, 4.6, 9); cam.lookAt(0.2, 3.6, -1); cam.rotation.z += 0.13;
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    R.update(ph, 0.15); mist.update(ph);
    const spray = W(0.15, 0.8);
    P.pose({ headPitch: 0.15 * spray, headTilt: 0.12 * spray, armR: { fwd: 1.6, out: 0.2, elbow: 1.2 }, armL: { fwd: 0.2 } });
    bottle.position.set(P.root.position.x + 0.9, 4.0, -0.2);
    rack.position.set(6.2 + 0.6 * Math.sin(ph), 0, -3.8);
  };
}
