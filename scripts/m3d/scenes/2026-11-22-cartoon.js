// 11/22 금로동 사설 「두 해의 AI 실험 끝, 코카콜라 성탄에 사람이 돌아왔다」(그림 도안나)
// 눈 내리는 밤 시골집 마당, 땅에서 올려다본 구도: 나무 상자 위에 올라선 사람이 손을 뻗어 전나무 꼭대기에 별을 얹고,
// 아래 사람이 장식 공을 건네며 고개를 든다. 별이 반짝이고 장식 공이 흔들리고 눈이 내린다.
export const secs = 3;
export const meta = { place: '눈 내리는 밤 시골집 마당 전나무 앞', where: 'outdoor', time: 'night', camera: 'low', floor: 'snow-plain', figures: 'two-facing', motion: ['snow', 'star-placing', 'ornament-sway', 'star-twinkle'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'night', moon: true, stars: 30 });
  K.floor(scene, { style: 'plain', color: '#dcdad4' });
  // 시골집(멀리) — 낮은 지붕 + 창 하나
  K.box(10, 4, 5, 0x6a6662, -16, 2, -42, scene); const roof = K.box(11, 0.4, 6.4, 0x3a3836, -16, 4.8, -42, scene); roof.rotation.z = 0.08;
  const wl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), K.flat(0xefe9da)); wl.position.set(-18, 2.2, -39.45); scene.add(wl);
  // 전나무
  const T = K.tree(scene, { x: 0, z: -4, h: 10, kind: 'pine', s: 1.25 });
  const balls = []; [[-1.6, 4.6, -2.5], [1.5, 5.2, -2.6], [-0.9, 6.6, -3.0], [1.0, 7.4, -3.2], [-1.9, 3.5, -2.2], [0.3, 4.2, -1.6]].forEach(([x, y, z], i) => {
    const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); K.line([[0, 0.01, 0], [0, -0.35, 0]], g);
    const b = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), K.lam(i % 2 ? 0xe8e6e0 : 0x555555)), 40); b.position.y = -0.6; g.add(b); balls.push(g); });
  // 별
  const star = new THREE.Group(); scene.add(star);
  const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.28 : 0.7, a = Math.PI / 2 + i * Math.PI / 5; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const sm = K.inked(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.15, bevelEnabled: false }), K.flat(0xf6f4ec)), 30); star.add(sm);
  // 나무 상자 + 올라선 사람(나무 옆, 측면)
  K.box(1.6, 1.4, 1.6, 0x7a6a58, 2.6, 0.7, -3.4, scene);
  const A = K.person(scene, { x: 2.6, z: -3.4, rot: -Math.PI / 2 - 0.3, coat: 0x8a8682, hair: 'bun', scale: 1.0 }); A.root.position.y = 1.4;
  // 아래 사람(앞쪽, 장식 공을 들고 위를 봄)
  const B = K.person(scene, { x: -3.0, z: -1.2, rot: Math.PI / 2 + 0.5, coat: 0x4a4a48, hair: 'short', scale: 1.0 });
  const gift = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), K.lam(0xe8e6e0)), 40); scene.add(gift);
  const snow = K.weather(scene, { kind: 'snow', n: 160, box: [30, 16, 18], z0: -4 });
  cam.position.set(-1.5, 0.7, 10); cam.lookAt(0.3, 5.6, -3);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.12);
    const up = W(0.15, 0.75);
    A.root.position.y = 1.4; A.pose({ headPitch: 0.5, headYaw: -0.2, armR: { fwd: 2.2 + 0.35 * up, out: 0.1, elbow: 0.3 }, armL: { fwd: 1.4 * up, out: 0.3 }, lean: -0.05 });
    // 별: 오른손 끝 근처 → 꼭대기
    star.position.set(0.6 - 0.6 * up, 10.6 + 0.2 * Math.sin(ph), -3.6 + 0.0 * up); star.rotation.z = 0.1 * Math.sin(ph * 2);
    sm.material.color.setScalar(0.75 + 0.25 * Math.max(0, Math.sin(ph * 4)));
    B.pose({ headPitch: 0.55 + 0.1 * Math.sin(ph), headYaw: 0.15, armR: { fwd: 1.5 + 0.4 * W(0.3, 0.9), out: 0.1, elbow: 0.4 }, armL: { fwd: 0.2 } });
    gift.position.set(-3.0 + 0.9, 3.2 + 0.4 * W(0.3, 0.9), -1.2 - 0.5);
    balls.forEach((g, i) => { g.rotation.z = Math.sin(ph * 2 + i) * 0.25; });
    T.update(ph, 0.02); snow.update(ph);
  };
}
