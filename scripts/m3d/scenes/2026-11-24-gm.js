// 11/24 안광주 미니 사설 「'최저가' 한 줄이 빠지면 브리프부터 바뀐다」 삽화
// 낮 중고차 매매 단지 주차장을 위에서: 차 앞유리의 작은 가격표에서 긴 영수증이 바닥으로 줄줄 풀려나오고, 딜러와 손님이 마주 서서 손님이 그 끝을 가리킨다. 깃발이 펄럭인다.
export const secs = 3;
export const meta = { place: '낮 중고차 매매 단지 주차장', where: 'outdoor', time: 'day', camera: 'high', floor: 'asphalt', figures: 'two-facing', motion: ['receipt-unroll', 'flag-wave', 'point', 'head-shake'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'day', clouds: 2 });
  K.floor(scene, { style: 'asphalt' });
  // 주차선
  for (let i = -3; i <= 3; i++) K.box(0.12, 0.02, 5, 0xe8e6e0, i * 3.2 - 1.6, 0.02, 0, scene);
  const cars = [[-6.4, 0x8a8a86], [-3.2, 0x5a5a58], [0, 0xa8a6a0], [3.2, 0x6e6e6a], [6.4, 0x9a9894]].map(([x, c]) => K.car(scene, { x, z: 0, rot: Math.PI / 2, c }));
  // 가운데 차 앞유리 가격표
  const tag = K.box(0.9, 0.6, 0.05, 0xf2f0ea, 0, 2.0, 1.0, scene); tag.rotation.x = -0.5;
  // 영수증 줄(여러 장이 이어져 바닥으로)
  const N = 9; const slips = Array.from({ length: N }, () => K.box(0.8, 0.02, 0.62, 0xf2f0ea, 0, 0.05, 0, scene));
  // 깃발 줄
  const flags = []; for (let i = 0; i < 8; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9, 4, 1), new THREE.MeshLambertMaterial({ color: i % 2 ? 0x4a4a48 : 0xd8d6d0, side: THREE.DoubleSide })); f.position.set(-8 + i * 2.3, 4.2, -4); scene.add(f); flags.push(f); }
  K.cyl(0.08, 0.08, 4.8, 0x333333, -9, 2.4, -4, scene, 6); K.cyl(0.08, 0.08, 4.8, 0x333333, 9, 2.4, -4, scene, 6);
  K.line([[-9, 4.7, -4], [9, 4.7, -4]], scene);
  // 딜러(정장)와 손님(패딩) 마주 보기
  const D = K.person(scene, { x: -1.6, z: 5.6, rot: -Math.PI / 2 - 0.2, coat: 0x3a3a38, hair: 'short', scale: 0.9 });
  const C = K.person(scene, { x: 1.9, z: 5.8, rot: Math.PI / 2 + 0.25, coat: 0x9a968e, hair: 'long', scale: 0.85 });
  K.shot(cam, 'high', [0, 1, 3.2], 13);
  return (t, ph) => {
    const u = ph / 6.2832; const k = 0.5 - 0.5 * Math.cos(ph);   // 풀렸다 감겼다
    slips.forEach((s, i) => { const on = i / N < 0.25 + 0.75 * k; s.visible = on; const r = i * 0.68; s.position.set(Math.sin(i * 0.5) * 0.4, 0.04 + i * 0.002, 1.6 + r); s.rotation.y = Math.sin(i * 0.7 + ph) * 0.08; });
    tag.rotation.z = 0.15 * Math.sin(ph * 4);
    flags.forEach((f, i) => { const p = f.geometry.attributes.position; for (let j = 0; j < p.count; j++) p.setZ(j, Math.sin(ph * 2 + p.getX(j) * 4 + i) * 0.15 * (p.getX(j) + 0.35)); p.needsUpdate = true; });
    C.pose({ headPitch: 0.35, headYaw: 0.2 * Math.sin(ph), armR: { fwd: 0.9 + 0.2 * K.win(ph, 0.2, 0.8), point: true }, armL: { fwd: 0.2 } });
    D.pose({ headYaw: 0.35 * Math.sin(ph * 2) * K.win(ph, 0.4, 0.9), armL: { fwd: 1.0, elbow: 1.6 }, armR: { fwd: 0.6 + 0.3 * K.win(ph, 0.5, 0.9), out: 0.3 } });
  };
}
