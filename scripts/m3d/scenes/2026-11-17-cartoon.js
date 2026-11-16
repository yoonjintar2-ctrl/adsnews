// 11/17 금로동 사설 「홍대 거리 광고에 매출 영수증이 붙었다」 — 벽 광고를 가리키는 두 청년, 긴 영수증을 펼치는 직원
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b4b4ae', tiles: 6 });
  K.building(scene, -14, -14, 10, 6, 22, 3); K.building(scene, 14, -14, 10, 6, 18, 5);
  K.box(18, 20, 1, 0x8e8e8a, 0, 10, -10, scene);
  // 벽 광고: 버거 + 달력(글자 없음)
  const tx = K.canvasTex(640, 360, (g, w, h) => { g.fillStyle = '#eeeee8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#9a9a96'; g.beginPath(); g.ellipse(200, 160, 120, 80, 0, Math.PI, 0); g.fill(); g.fillStyle = '#333'; g.fillRect(85, 175, 230, 34); g.fillStyle = '#777'; g.fillRect(90, 215, 220, 40);
    g.fillStyle = '#fff'; g.fillRect(400, 80, 160, 190); g.fillStyle = '#222'; g.fillRect(400, 80, 160, 40); [0, 1, 2, 3].forEach(i => g.fillRect(425 + i * 32, 145, 14, 100)); });
  K.screen(scene, { tex: tx, x: 0, y: 12.5, z: -9.3, w: 13, h: 7.3, frame: 0x161616, border: 0.6 });
  // 가게 문과 차양
  K.box(8, 0.5, 2.2, 0x3a3a38, 8.5, 6.4, -8.4, scene); K.box(3.2, 6, 0.3, 0x2a2a2a, 8.5, 3, -9.3, scene);
  const sign = K.box(2.2, 2.2, 0.25, 0xeeeeea, 13.5, 8.5, -8, scene);
  const lan = K.lanternString(scene, { x0: -12, x1: 12, y: 16.5, z: -4, n: 9, sag: 1.4 });
  // 두 청년과 직원
  const A = K.person(scene, { x: -4.6, z: 2, rot: Math.PI - 0.15, coat: 0x6a6a68, hair: 'cap', scale: 1.1 });
  const B = K.person(scene, { x: -1.4, z: 2.6, rot: Math.PI + 0.15, coat: 0xd8d8d2, hair: 'long', scale: 1.05 });
  const C = K.person(scene, { x: 6.2, z: -0.5, rot: Math.PI - 0.4, coat: 0xeeeeea, pants: 0x3a3a38, scale: 1.05 });
  // 영수증: 손에서 바닥까지 늘어지는 종이(마디)
  const rc = new THREE.Group(); scene.add(rc); const segs = []; for (let i = 0; i < 9; i++) { const m = K.box(0.9, 0.62, 0.04, 0xf4f4f0, 0, 0, 0, rc); segs.push(m); }
  const mo = K.motes(scene, { n: 22, box: [24, 12, 6], z0: -2, size: 0.14 });
  cam.position.set(0, 6.2, 17); cam.lookAt(0, 7.2, -6);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    lan.update ? lan.update(ph) : null; mo.update(ph);
    sign.rotation.y = Math.sin(ph) * 0.5;
    const p = W(0.1, 0.8);
    A.pose({ headPitch: -0.5, headYaw: -0.3 * p, armR: { fwd: 2.6 * p + 0.2, out: -0.2, point: p > 0.4 }, armL: { fwd: 0.2 }, bob: 0.05 * Math.abs(Math.sin(ph * 4)) });
    const q = W(0.35, 0.95);
    B.pose({ headYaw: 1.0 * (1 - q) - 0.1, headPitch: -0.45 * q, torsoYaw: 0.3 * (1 - q), armL: { fwd: 2.4 * q + 0.1, out: 0.1, point: q > 0.4 }, armR: { fwd: 0.3, elbow: 1.8 } });
    const u = 0.5 + 0.5 * Math.sin(ph);
    C.pose({ headPitch: 0.25 * u, headYaw: 0.4, armL: { fwd: 1.3, elbow: 0.6 }, armR: { fwd: 1.1, elbow: 0.4 } });
    // 영수증 마디를 손 앞에서 바닥 쪽으로
    C.root.updateMatrixWorld(true); const base = new THREE.Vector3(); C.torso.localToWorld(base.set(0, 0.7, -1.6));
    segs.forEach((m, i) => { const k = i / 8; m.position.set(base.x - 0.2 * i * u, base.y - i * 0.55 * (0.7 + 0.3 * u), base.z + i * 0.5 * u); m.rotation.x = -0.4 - k * 0.8 * u; m.visible = i < 3 + Math.round(6 * u); });
  };
}
