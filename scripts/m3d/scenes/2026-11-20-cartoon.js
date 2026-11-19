// 11/20 금로동 사설 「흰 가운이 의심받는 시대, 광고가 꺼낼 증거」(도안나 그림)
// 밤 병원 대기실 구석: 스탠드 옷걸이에 걸린 빈 흰 가운이 혼자 살랑 흔들리고, 옆에 선 사람(옆모습)이 신분증 카드를 들어 올려 보인다. 형광등이 깜박인다.
export const secs = 3;
export const meta = { place: '밤 병원 대기실 구석 스탠드 옷걸이', where: 'indoor', time: 'night', camera: 'close', floor: 'carpet', figures: 'solo-side', motion: ['coat-sway', 'card-raise', 'tube-flicker'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.room(scene, { w: 16, d: 10, h: 8, wall: 'panel', wallColor: '#9e9c97', floorStyle: 'carpet', windowAt: [-5, 4.5, 3, 2.4], curtain: false });
  // 대기 의자 줄
  for (let i = 0; i < 3; i++) { K.box(1.3, 0.15, 1.2, 0x4a4844, 3.2 + i * 1.5, 1.1, -3.4, scene); K.box(1.3, 1.3, 0.15, 0x4a4844, 3.2 + i * 1.5, 1.8, -4.0, scene); }
  K.box(4.6, 0.12, 0.12, 0x2a2a2a, 4.7, 0.5, -3.4, scene);
  // 스탠드 옷걸이
  K.cyl(0.07, 0.07, 5.2, 0x2a2a2a, -1.5, 2.6, -2.5, scene, 10); K.cyl(0.7, 0.8, 0.12, 0x2a2a2a, -1.5, 0.06, -2.5, scene, 18);
  const coat = new THREE.Group(); coat.position.set(-1.5, 4.9, -2.3); scene.add(coat);
  K.line([[-0.6, -0.35, 0], [0, 0, 0], [0.6, -0.35, 0]], coat);
  K.box(1.5, 2.6, 0.35, 0xeeeee8, 0, -1.7, 0, coat); // 몸판
  const sl = K.box(0.35, 2.0, 0.3, 0xe4e4de, -0.9, -1.4, 0, coat); sl.rotation.z = 0.12;
  const sr = K.box(0.35, 2.0, 0.3, 0xe4e4de, 0.9, -1.4, 0, coat); sr.rotation.z = -0.12;
  K.box(0.08, 2.4, 0.38, 0x8a8a86, 0, -1.7, 0.01, coat);
  K.box(0.4, 0.3, 0.05, 0xc8c8c2, 0.42, -1.3, 0.2, coat);
  // 형광등(천장 평판)
  const tube = new THREE.Mesh(new THREE.BoxGeometry(3, 0.12, 0.6), new THREE.MeshBasicMaterial({ color: 0xf4f2ec })); tube.position.set(0, 7.9, -1); scene.add(tube);
  // 사람(옆모습) + 카드
  const P = K.person(scene, { x: 1.3, z: -1.6, rot: Math.PI / 2 - 0.3, coat: 0x55534f, hair: 'short', scale: 1.0 });
  const card = K.box(0.7, 0.45, 0.04, 0xf2f0ea, 0, 0, 0, scene); K.box(0.22, 0.26, 0.05, 0x5a5a56, -0.18, 0, 0.01, card);
  K.shot(cam, 'close', [0, 3.0, -2.2], 18); cam.position.set(0.2, 3.4, 5.2); cam.lookAt(-0.1, 3.0, -2.2);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.12);
    coat.rotation.z = 0.06 * Math.sin(ph); coat.rotation.y = 0.12 * Math.sin(ph + 1);
    const up = W(0.2, 0.75);
    P.pose({ headYaw: -0.25 + 0.2 * up, headPitch: -0.05, armR: { fwd: 0.4 + 1.2 * up, out: 0.1, elbow: 0.6 }, armL: { fwd: 0.1 } });
    card.position.set(1.3 - 0.75 - 0.7 * up, 2.6 + 1.0 * up, -1.6 + 0.3); card.rotation.y = -0.6;
    tube.material.color.setScalar(Math.sin(ph * 7) > 0.85 ? 0.55 : 0.96);
  };
}
