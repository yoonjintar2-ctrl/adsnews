// 11/21 도안나 미니 사설 「스케이터와 가수를 한 장에 세우는 법」
// 낮 스케이트파크 램프 끝, 발목 높이에서 올려다본 구도: 옷차림이 제각각인 다섯이 나란히 섰는데 신발만 똑같은 흰 줄 운동화다. 가운데 사람이 몸을 숙여 옆 사람 신발을 가리키고, 양옆이 고개를 돌려 내려다본다. 앞에서 스케이트보드가 굴러갔다 돌아온다.
export const secs = 3;
export const meta = { place: '낮 스케이트파크 콘크리트 램프 끝', where: 'outdoor', time: 'day', camera: 'low', floor: 'plain', figures: 'crowd', motion: ['board-roll', 'lean-point', 'heads-down', 'cloud-drift'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  const S = K.sky(scene, { time: 'day', clouds: 3 });
  K.floor(scene, { style: 'plain', color: '#b9b8b2' });
  // 램프(경사판) + 쿼터파이프 난간
  const r1 = K.box(14, 0.4, 5, 0xa8a7a2, 0, 1.4, -6.5, scene); r1.rotation.x = 0.5;
  K.cyl(0.08, 0.08, 14, 0x333333, 0, 3.0, -8.4, scene, 8).rotation.z = Math.PI / 2;
  const coats = [0x6a6a68, 0xc9c6bf, 0x2e2d2c, 0x8f8a84, 0x55524f], hairs = ['cap', 'long', 'short', 'bun', 'short'];
  const C = coats.map((c, i) => { const p = K.person(scene, { x: -4.4 + i * 2.2, z: -1.6, rot: Math.PI, coat: c, hair: hairs[i], pants: i % 2 ? 0x4a4a48 : 0x2c2c2c, scale: 0.95 });
    // 똑같은 운동화: 흰 밑창 + 흰 줄
    [-0.22, 0.22].forEach(sx => { K.box(0.38, 0.07, 0.62, 0xf2f2ee, sx, 0.03, -0.08, p.root); K.box(0.36, 0.05, 0.06, 0xf2f2ee, sx, 0.12, -0.2, p.root); });
    return p; });
  // 스케이트보드
  const bd = new THREE.Group(); scene.add(bd);
  K.box(2.0, 0.08, 0.6, 0x3a3836, 0, 0.32, 0, bd);
  const wh = [-0.7, 0.7].flatMap(a => [-0.22, 0.22].map(b => { const w = K.cyl(0.13, 0.13, 0.1, 0xe8e8e2, a, 0.14, b, bd, 10); w.rotation.x = Math.PI / 2; return w; }));
  cam.position.set(0.6, 0.45, 5.2); cam.lookAt(0, 1.1, -1.6);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    bd.position.set(4.0 * Math.sin(ph), 0, 3.4); wh.forEach(w => { w.rotation.y = ph * 6; });
    const lk = W(0.2, 0.85);
    C[2].pose({ lean: 0.35 * lk, headPitch: 0.5 * lk, armR: { fwd: 0.9 * lk, out: 0.2, point: lk > 0.5 }, armL: { fwd: 0.1 } });
    C.forEach((p, i) => { if (i === 2) return; const d = W(0.3 + i * 0.03, 0.9); const sd = i < 2 ? 1 : -1;
      p.pose({ headPitch: 0.45 * d, headYaw: sd * 0.3 * d, armL: { fwd: 0.1, elbow: i === 0 ? 1.2 : 0 }, armR: { fwd: 0.1, elbow: i === 4 ? 1.0 : 0 } }); });
    S.update(ph, 2);
  };
}
