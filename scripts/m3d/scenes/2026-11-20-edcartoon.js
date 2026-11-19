// 11/20 도안나 미니 사설 「시계탑 하나가 거리의 시대를 정한다」
// 해 질 녘 눈 내리는 마켓 광장을 아래에서 올려다본다: 높은 시계탑의 분침이 돌고, 작은 노점 지붕 사이로 사람들이 모여 휴대폰을 들어 올린다.
export const secs = 3;
export const meta = { place: '해 질 녘 눈 오는 마켓 광장 시계탑 아래', where: 'outdoor', time: 'sunset', camera: 'low', floor: 'plain', figures: 'crowd', motion: ['snow', 'clock-hand', 'phone-raise'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'sunset', clouds: 3 });
  K.floor(scene, { style: 'plain', color: '#cfcdc6' });
  // 시계탑
  K.box(3, 16, 3, 0x8a8782, 0, 8, -12, scene);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 4, 4), K.lam(0x2a2a2a)); roof.position.set(0, 18, -12); roof.rotation.y = Math.PI / 4; K.inked(roof); scene.add(roof);
  const face = K.cyl(1.2, 1.2, 0.2, 0xf2f0e8, 0, 13, -10.4, scene, 32); face.rotation.x = Math.PI / 2;
  const mh = K.box(0.12, 1.0, 0.06, 0x111111, 0, 13, -10.2, scene); const hh = K.box(0.16, 0.65, 0.06, 0x111111, 0, 13, -10.18, scene);
  // 노점 지붕들
  const stalls = [[-7, -7], [7, -7], [-10, -2], [10, -2]];
  stalls.forEach(([x, z], i) => { K.box(3.6, 2.4, 2.4, i % 2 ? 0x77746f : 0x9a9690, x, 1.2, z, scene);
    const r = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.6, 4), K.lam(0x3a3a38)); r.position.set(x, 3.2, z); r.rotation.y = Math.PI / 4; K.inked(r); scene.add(r); });
  K.tree(scene, { x: -4, z: -9, h: 5, kind: 'pine' }); K.tree(scene, { x: 4.5, z: -9, h: 4.5, kind: 'pine' });
  const snow = K.weather(scene, { kind: 'snow', n: 140, box: [30, 18, 16], z0: -4 });
  const crowd = [[-2.6, -3.5, 0x4a4844], [0.2, -2.8, 0x6a6864], [2.8, -3.7, 0x3c3a38], [-1.0, -1.6, 0x5c5a56]].map(([x, z, c], i) => K.person(scene, { x, z, rot: 0, coat: c, hair: i % 2 ? 'long' : 'short', scale: 1 }));
  const phones = crowd.map(() => K.box(0.28, 0.5, 0.05, 0x111111, 0, 0, 0, scene));
  K.shot(cam, 'low', [0, 6, -6], 16); cam.position.set(0.5, 0.7, 11); cam.lookAt(0, 7.5, -8);
  return (t, ph) => {
    snow.update && snow.update(ph);
    mh.rotation.z = -ph; mh.position.set(Math.sin(ph) * 0.5, 13 + Math.cos(ph) * 0.5, -10.2);
    hh.rotation.z = -ph / 12;
    crowd.forEach((P, i) => { const up = K.win(ph, 0.1 + i * 0.12, 0.6 + i * 0.08, 0.1);
      P.pose({ headPitch: 0.35 * up, headYaw: (i - 1.5) * 0.15, armR: { fwd: 0.3 + 2.1 * up, elbow: 0.3 }, armL: { fwd: 0.1 }, bob: 0 });
      const [x, z] = [[-2.6, -3.5], [0.2, -2.8], [2.8, -3.7], [-1.0, -1.6]][i];
      phones[i].position.set(x + 0.45, 1.6 + 1.9 * up, z - 0.4 * up); });
  };
}
