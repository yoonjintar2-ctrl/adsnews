// 11/22 도안나 미니 사설 「케이크 열 개를 '재생 목록'에 담으면」
// 흐린 날 제과점 쇼윈도 앞 인도, 가까이 잡은 옆 구도: 진열대 칸마다 케이크가 하나씩, 가운데 케이크 받침이 천천히 돌고
// 행인이 손가락으로 칸을 차례로 짚어 넘긴다. 처마 끝 나무 간판(도형만)이 바람에 흔들린다.
export const secs = 3;
export const meta = { place: '흐린 날 제과점 쇼윈도 앞 인도', where: 'outdoor', time: 'overcast', camera: 'close', floor: 'asphalt', figures: 'solo-side', motion: ['cake-turntable', 'finger-swipe', 'sign-swing', 'breath'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'overcast', clouds: 2 });
  K.floor(scene, { style: 'asphalt', color: '#8a8a86' });
  K.box(30, 0.25, 6, 0xa8a6a0, 0, 0.12, -3, scene);
  // 가게 정면
  K.box(16, 9, 0.6, 0x8c8680, 0, 4.5, -6.3, scene);
  const fr = K.box(10.4, 5.4, 0.3, 0x2a2a2a, 0, 3.8, -5.9, scene);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), K.flat(0xe6e2d8)); gl.position.set(0, 3.8, -5.72); scene.add(gl);
  // 진열 칸 3x2 (선반)
  [2.2, 4.5].forEach(y => K.box(9.6, 0.12, 1.2, 0x5a5550, 0, y, -5.2, scene));
  const cakes = [];
  [[-3.2, 2.3], [0, 2.3], [3.2, 2.3], [-3.2, 4.6], [0, 4.6], [3.2, 4.6]].forEach(([x, y], i) => {
    const g = new THREE.Group(); g.position.set(x, y, -5.2); scene.add(g);
    K.cyl(0.6, 0.6, 0.06, 0xdedcd4, 0, 0.06, 0, g, 18);
    K.cyl(0.55, 0.55, 0.45, i % 2 ? 0xf0eee8 : 0x8a847c, 0, 0.32, 0, g, 18);
    K.cyl(0.4, 0.4, 0.35, i % 2 ? 0x7a746c : 0xf0eee8, 0, 0.72, 0, g, 18);
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), K.flat(0x222222)); top.position.y = 0.98; g.add(top);
    cakes.push(g); });
  // 처마 간판(동그란 케이크 기호, 글자 없음)
  K.box(0.15, 0.15, 1.6, 0x333333, 5.6, 7.6, -5.2, scene);
  const sign = new THREE.Group(); sign.position.set(5.6, 7.6, -4.5); scene.add(sign);
  K.line([[0, 0.01, 0], [0, -0.5, 0]], sign);
  const plate = K.cyl(0.9, 0.9, 0.12, 0x6a5f52, 0, -1.3, 0, sign, 20); plate.rotation.x = Math.PI / 2;
  const mark = K.cyl(0.4, 0.4, 0.14, 0xeeeeea, 0, -1.3, 0.02, sign, 14); mark.rotation.x = Math.PI / 2;
  // 행인(옆모습, 창을 봄)
  const P = K.person(scene, { x: -4.6, z: -2.4, rot: -0.25, coat: 0x9a9690, hair: 'long', hairC: 0x2a2a2a, scale: 1.05 });
  const breath = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf4f4f0, transparent: true })); scene.add(m); return m; });
  cam.position.set(-8.5, 4.4, 4.5); cam.lookAt(-0.8, 3.6, -5);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    const u = ((ph / 6.2832) % 1);
    // 손가락으로 칸을 차례로 짚기: 왼쪽 → 가운데 → 오른쪽
    const sw = Math.sin(ph) * 0.5 + 0.5;
    P.pose({ headYaw: 0.35 - 0.45 * sw, headPitch: -0.1, torsoYaw: 0.15 - 0.2 * sw, armR: { fwd: 1.45 + 0.15 * Math.sin(ph * 2), out: -0.2 - 0.35 * sw, point: true }, armL: { fwd: 0.2, elbow: 0.6 } });
    cakes.forEach((g, i) => { g.rotation.y = (i === 4 ? ph : 0); g.scale.setScalar(i === Math.floor(sw * 2.99) ? 1.08 : 1); });
    sign.rotation.x = Math.sin(ph) * 0.18;
    breath.forEach((m, i) => { const v = ((u * 2 + i * 0.5) % 1); m.position.set(-4.4 + v * 0.6, 4.25 + v * 0.3, -3.2 - v * 0.4); m.material.opacity = 0.7 * (1 - v); m.scale.setScalar(1 + v * 2); });
  };
}
