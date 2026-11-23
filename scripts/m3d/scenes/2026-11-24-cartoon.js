// 11/24 금로동 사설 「36년 묵은 추억, 맥도날드가 다시 데웠다」 삽화
// 밤 옥상 야외 영화 객석: 추억의 눈 오는 집이 흐르는 스크린 앞, 관객들이 손뼉 치고 고개를 돌려 서로 본다. 맨 앞 빈 의자 하나에만 김 나는 쟁반.
export const secs = 3;
export const meta = { place: '밤 옥상 야외 영화 객석', where: 'outdoor', time: 'night', camera: 'wide', floor: 'asphalt', figures: 'crowd', motion: ['screen-flicker', 'clap', 'tray-steam', 'turn-to-neighbor'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'night', stars: 30, moon: true });
  K.floor(scene, { style: 'asphalt' });
  // 옥상 난간
  K.box(30, 1.1, 0.25, 0x3a3a38, 0, 0.55, -13, scene);
  // 스크린(추억 장면: 눈 오는 집과 트리, 글자 없음)
  const tex = K.canvasTex(512, 300, (g, w, h) => { g.fillStyle = '#dcdad2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#5a5a58'; g.beginPath(); g.moveTo(140, 250); g.lineTo(140, 150); g.lineTo(230, 80); g.lineTo(320, 150); g.lineTo(320, 250); g.fill();
    g.fillStyle = '#e8e6df'; g.fillRect(205, 190, 45, 60); g.fillRect(160, 165, 35, 30);
    g.fillStyle = '#3a3a38'; g.beginPath(); g.moveTo(400, 250); g.lineTo(440, 120); g.lineTo(480, 250); g.fill();
    g.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc((i * 97) % w, (i * 53) % h, 3, 0, 7); g.fill(); } });
  const S = K.screen(scene, { tex, x: 0, y: 5.2, z: -11, w: 11, h: 6.4, frame: 0x222222 });
  K.cyl(0.12, 0.12, 3, 0x333333, -5.4, 1.5, -11.3, scene, 8); K.cyl(0.12, 0.12, 3, 0x333333, 5.4, 1.5, -11.3, scene, 8);
  // 객석 의자 두 줄
  const chair = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); K.box(1.3, 0.15, 1.2, 0x2e2e2c, 0, 1.0, 0, g); K.box(1.3, 1.3, 0.15, 0x2e2e2c, 0, 1.7, 0.55, g); [-0.55, 0.55].forEach(a => K.box(0.1, 1.0, 0.1, 0x222222, a, 0.5, 0, g)); return g; };
  const seats = [];
  [-4.2, -1.4, 1.4, 4.2].forEach(x => seats.push([x, -2])); [-5.6, -2.8, 0, 2.8, 5.6].forEach(x => seats.push([x, 1.4]));
  seats.forEach(([x, z]) => chair(x, z));
  // 관객(뒷모습 앉은 자세 대신 의자 뒤에 서서 손뼉) — 빈 자리: 앞줄 -1.4
  const ppl = []; const spots = [[-4.2, -1.3], [1.4, -1.3], [4.2, -1.3], [-5.6, 2.1], [-2.8, 2.1], [2.8, 2.1], [5.6, 2.1]];
  spots.forEach(([x, z], i) => ppl.push(K.person(scene, { x, z, rot: 0, coat: [0x5a5a58, 0x8a8682, 0x3e3e3c, 0x9a968f][i % 4], hair: ['short', 'long', 'bun', 'cap'][i % 4], scale: 0.7 })));
  // 빈 의자 위 쟁반 + 상자 + 김
  K.box(1.0, 0.08, 0.7, 0xb8b4ac, -1.4, 1.15, -2, scene); K.box(0.55, 0.4, 0.45, 0xe6e4de, -1.4, 1.4, -2.05, scene);
  const steam = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf4f4f0, transparent: true })); scene.add(m); return m; });
  // 영사기 빛 원뿔
  const beam = new THREE.Mesh(new THREE.ConeGeometry(4.5, 16, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xf0eee6, transparent: true, opacity: 0.08, side: THREE.DoubleSide }));
  beam.rotation.x = -Math.PI / 2 + 0.25; beam.position.set(0, 5.6, 0); beam.scale.set(0.6, 1, 0.35);
  cam.position.set(-1.0, 3.4, 8.4); cam.lookAt(-0.6, 2.9, -4);
  return (t, ph) => {
    const u = ph / 6.2832;
    S.s.material.color.setScalar(0.88 + 0.12 * Math.abs(Math.sin(ph * 5)));
    
    ppl.forEach((P, i) => { const c = Math.sin(ph * 6 + i) * 0.5 + 0.5;
      const turn = i === 1 || i === 4 ? K.win(ph, 0.35, 0.75) : 0;
      P.pose({ headYaw: (i % 2 ? -1 : 1) * 1.1 * turn, headPitch: -0.15, torsoYaw: (i % 2 ? -1 : 1) * 0.4 * turn,
        armL: { fwd: 1.3, elbow: 1.4 + c * 0.5, out: -0.15 + c * 0.2 }, armR: { fwd: 1.3, elbow: 1.4 + c * 0.5, out: -0.15 + c * 0.2 } }); });
    steam.forEach((m, i) => { const v = (u * 2 + i / 4) % 1; m.position.set(-1.4 + Math.sin(ph * 2 + i) * 0.1, 1.7 + v * 1.4, -2.05); m.material.opacity = 0.8 * (1 - v); m.scale.setScalar(1 + v * 1.6); });
  };
}
