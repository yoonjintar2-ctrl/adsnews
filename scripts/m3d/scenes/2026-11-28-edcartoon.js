// 11/28 도안나 미니 사설 「지하철역이 쇼윈도가 되는 계절」
// 해 질 녘 지하철 출구 계단을 위에서 내려다본다: 계단을 오르는 세 사람, 계단 끝 아치 눈높이에 걸린 크리스탈 줄이 바람에 흔들리고,
// 맨 앞 사람이 고개를 들어 줄을 가리킨다. 출구 위 화살표판은 비워 두었다.
export const secs = 3;
export const meta = { place: '해 질 녘 지하철 출구 계단 아치', where: 'outdoor', time: 'sunset', camera: 'high', floor: 'plain', figures: 'crowd', motion: ['crystal-sway', 'climb-bob', 'look-up-point', 'sparkle'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'sunset', sun: true, clouds: 2 });
  K.floor(scene, { style: 'plain' });
  // 계단: 앞(+z, 바닥)에서 안쪽(-z, 거리 높이)으로 올라간다
  const N = 12;
  for (let i = 0; i < N; i++) { K.box(7, 0.45 * (i + 1), 1.1, i % 2 ? 0xc6c4be : 0xb4b2ac, 0, 0.225 * (i + 1), 6 - i * 1.1, scene);
    [-1, 1].forEach(sd => K.box(0.5, 0.45 * (i + 1) + 1.0, 1.1, 0x8e8c88, sd * 3.75, (0.45 * (i + 1) + 1.0) / 2, 6 - i * 1.1, scene)); }
  // 위 지면(거리)
  K.box(30, 5.4, 12, 0xbdbdb7, 0, 2.7, -12.6, scene);
  // 아치
  const arch = new THREE.Group(); arch.position.set(0, 5.4, -6.9); scene.add(arch);
  [-3.6, 3.6].forEach(x => K.box(0.5, 6, 0.5, 0x3a3a3a, x, 3, 0, arch));
  K.box(7.7, 0.6, 0.6, 0x3a3a3a, 0, 6, 0, arch);
  K.box(2.2, 0.8, 0.12, 0x1a1a1a, 0, 7.0, 0, arch);
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 3), K.flat(0xf2f0ea)); arrow.rotation.z = -Math.PI / 2; arrow.position.set(0.4, 7.0, 0.08); arch.add(arrow);
  K.box(0.8, 0.12, 0.05, 0xf2f0ea, -0.15, 7.0, 0.08, arch);
  // 크리스탈 줄 두 가닥(줄 대신 사슬로 직접)
  const gems = [];
  [5.2, 4.4].forEach((yy, j) => {
    const pts = []; for (let k = 0; k <= 12; k++) { const x = -3.4 + k * (6.8 / 12); pts.push([x, yy - Math.sin(k / 12 * Math.PI) * 0.7, 0.2]); }
    K.line(pts, arch);
    pts.slice(1, -1).forEach(([x, y, z], k) => { const g = new THREE.Group(); g.position.set(x, y, z); arch.add(g);
      const m = K.inked(new THREE.Mesh(new THREE.OctahedronGeometry(0.22), K.lam(0xf4f4f0)), 10); m.position.y = -0.35; m.scale.y = 1.5; g.add(m); K.line([[0, 0, 0], [0, -0.15, 0]], g); gems.push([g, m, k + j * 3]); });
  });
  // 오르는 사람들
  const ppl = [[1.2, 2.2, 0x8a8680, 'short'], [-1.4, 4.2, 0x5a5854, 'long'], [0.6, 6.4, 0x9a968e, 'cap']].map(([x, z, c, h]) => {
    const step = Math.round((6 - z) / 1.1); const y = 0.45 * (step + 1);
    const p = K.person(scene, { x, z, coat: c, hair: h, scale: 0.85 }); p.base = y; return p; });
  cam.position.set(5.5, 15, 17); cam.lookAt(0, 4.2, -2.5);
  return (t, ph) => {
    gems.forEach(([g, m, k]) => { g.rotation.z = Math.sin(ph * 2 + k * 0.5) * 0.25; m.rotation.y = ph * 2 + k; });
    ppl.forEach((p, i) => {
      const b = Math.abs(Math.sin(ph * 4 + i)) * 0.12;
      p.root.position.y = p.base + b;
      if (i === 0) { const up = K.win(ph, 0.2, 0.85, 0.1);
        p.pose({ bob: p.base + b, headPitch: -0.5 * up, headYaw: 0.2 * up, armR: { fwd: 0.4 + up * 2.0, out: 0.1, point: up > 0.4 }, armL: { fwd: Math.sin(ph * 4) * 0.3 } }); }
      else p.pose({ bob: p.base + b, headPitch: i === 1 ? -0.35 * K.win(ph, 0.45, 0.95, 0.1) : 0.15, armL: { fwd: Math.sin(ph * 4 + i) * 0.35 }, armR: { fwd: -Math.sin(ph * 4 + i) * 0.35 } });
    });
  };
}
