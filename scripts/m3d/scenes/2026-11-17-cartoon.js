// 11/17 금로동 사설 「홍대 거리 광고에 매출 영수증이 붙었다」
// 밤 횡단보도, 아래에서 올려다본 구도: 가게 2층 창에서 영수증이 끝없이 풀려 내려와 인도까지 닿고,
// 퇴근길 청년이 멈춰 서서 고개를 젖혀 올려다보며 가리킨다. 가로등이 깜박인다.
export const secs = 3;
export const meta = { place: '밤 횡단보도 앞 가게 2층 창', where: 'outdoor', time: 'night', camera: 'low', floor: 'asphalt', figures: 'solo-side', motion: ['receipt-unroll', 'lamp-flicker', 'head-tilt-up'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'night', moon: true, stars: 18 });
  K.floor(scene, { style: 'asphalt' });
  // 인도와 횡단보도
  K.box(60, 0.3, 6, 0x9a9894, 0, 0.15, -6, scene);
  for (let i = 0; i < 7; i++) K.box(1.2, 0.02, 5, 0xe8e6e0, -7 + i * 2.2, 0.02, 2.5, scene);
  // 2층 가게 정면(창 하나, 간판은 도형만)
  const wall = K.box(12, 13, 1, 0x7c7a76, 3, 7, -10, scene);
  const winF = K.box(6.4, 4.4, 0.4, 0x2a2a2a, 3, 10.5, -9.4, scene);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), K.flat(0xf1eee4)); glow.position.set(3, 10.5, -9.15); scene.add(glow);
  K.box(9, 1.6, 0.5, 0x2c2c2c, 3, 7.4, -9.3, scene);
  [0, 1, 2].forEach(i => K.cyl(0.45, 0.45, 0.2, 0xdedcd4, 0 + i * 3, 7.4, -9.0, scene).rotation.x = Math.PI / 2);
  K.box(10, 9, 1, 0x5e5d5a, -12, 4.5, -14, scene); K.box(9, 16, 1, 0x6a6966, 16, 8, -16, scene);
  const bulb0 = K.streetLamp(scene, { x: -8, z: -4.5, h: 7.5 });
  // 영수증: 창에서 내려와 인도에 접혀 쌓이는 종이 띠(마디마다 살랑)
  const segs = []; const N = 26;
  for (let i = 0; i < N; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.42), new THREE.MeshLambertMaterial({ color: 0xf6f4ee, side: THREE.DoubleSide })); scene.add(m); segs.push(m);
    const ln = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.04), K.flat(0x555555)); ln.position.z = 0.01; m.add(ln); }
  // 청년(옆모습, 가방)
  const P = K.person(scene, { x: -3.2, z: -3.2, rot: -Math.PI / 2 + 0.35, coat: 0x5a5a58, hair: 'short', backpack: true, scale: 1.05 });
  // 지나가는 차(반복: 왼→오, 한 번에 지나감)
  const bulb = K.streetLamp(scene, { x: 10, z: -5, h: 6.5 });
  K.shot(cam, 'low', [0, 4.5, -5], 16); cam.position.set(-7, 0.9, 7); cam.lookAt(1, 7.5, -8);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.12);
    const u = ph / (Math.PI * 2);
    // 영수증: 창(높이 10)에서 내려와 바닥(0.4)까지, 바닥에 닿은 뒤로는 앞으로 접혀 나온다
    for (let i = 0; i < N; i++) { const s = (i + u * 2) % N; const y = 10 - s * 0.42; const m = segs[i];
      if (y > 0.4) { m.position.set(3 + Math.sin(s * 0.5 + ph) * 0.35, y, -9.0 + s * 0.04); m.rotation.set(0, Math.sin(s * 0.7 + ph) * 0.3, 0); }
      else { const k = (0.4 - y) / 0.42; m.position.set(3 + Math.sin(k) * 0.4, 0.35 + (k % 2) * 0.05, -8.6 + k * 0.42); m.rotation.set(-Math.PI / 2, 0, (k % 2 ? 0.2 : -0.2)); } }
    bulb0.scale.setScalar(1 + 0.25 * Math.max(0, Math.sin(ph * 3)));
    const look = W(0.15, 0.85);
    P.pose({ headPitch: 0.75 * look, headYaw: 0.25 * look, lean: -0.08 * look,
      armL: { fwd: 0.15 }, armR: { fwd: 1.9 * W(0.35, 0.75), out: 0.15, point: true }, bob: 0 });
  };
}
