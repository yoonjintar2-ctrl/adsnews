// 11/15 안광주 미니 사설 「'1위'가 열 개면, 브리프엔 1위가 없다」 — 엘리베이터·지하철을 메운 '1위' 광고
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b0b0aa', tiles: 5 });
  K.box(40, 20, 1, 0x9e9e98, 0, 10, -9, scene);
  const medal = (k) => K.canvasTex(256, 192, (g, w, h) => { g.fillStyle = '#ecece6'; g.fillRect(0, 0, w, h); g.fillStyle = '#555';
    for (let i = 0; i < 5; i++) { const hh = 30 + i * 22 + (i + k) % 2 * 10; g.fillRect(20 + i * 30, h - 14 - hh, 22, hh); }
    g.fillStyle = '#222'; g.beginPath(); g.moveTo(180, 20); g.lineTo(200, 60); g.lineTo(220, 20); g.fill(); g.fillStyle = '#fff'; g.strokeStyle = '#222'; g.lineWidth = 6; g.beginPath(); g.arc(200, 82, 28, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#222'; g.beginPath(); for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? 7 : 17; g.lineTo(200 + Math.cos(a) * r, 82 + Math.sin(a) * r); } g.fill(); });
  const scr = [-9, -4.5, 0, 4.5, 9].map((x, i) => K.screen(scene, { tex: medal(i), x, y: 7.2, z: -8.3, w: 3.8, h: 2.85 }));
  // 엘리베이터 칸(앞이 열린 상자) + 그 안 대형 화면
  K.box(0.4, 12, 6, 0x6a6a68, -6.5, 6, -3, scene); K.box(0.4, 12, 6, 0x6a6a68, 6.5, 6, -3, scene); K.box(13.4, 0.4, 6, 0x5a5a58, 0, 12, -3, scene);
  const big = K.screen(scene, { tex: medal(3), x: 3.2, y: 7.8, z: -5.6, w: 4.6, h: 3.4 });
  const lampG = new THREE.Group(); lampG.position.set(-1.5, 11.8, -2); scene.add(lampG); K.line([[0, 0, 0], [0, -1.6, 0]], lampG); K.cyl(0.3, 1.0, 0.6, 0x1a1a1a, 0, -1.9, 0, lampG, 14);
  const ind = K.box(0.5, 0.5, 0.1, 0xffffff, 5.2, 10.8, -5.9, scene);
  const A = K.person(scene, { x: -2.6, z: -1.5, rot: -2.6, coat: 0x2a2a2a, pants: 0x1e1e1e, scale: 1.05 });
  const B = K.person(scene, { x: 1.2, z: 0.8, rot: 2.7, coat: 0xbcbcb6, hair: 'long', scale: 1.0 });
  cam.position.set(0, 5.6, 14.5); cam.lookAt(0, 5.4, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    scr.forEach((s, i) => { s.update(ph, 0); s.s.material.color.setScalar(0.78 + 0.22 * Math.max(0, Math.sin(ph * 2 + i * 1.3))); });
    big.update(ph, 0); big.s.material.color.setScalar(0.85 + 0.15 * Math.sin(ph * 3));
    ind.material.color.setScalar(Math.sin(ph * 4) > 0 ? 1 : 0.4);
    lampG.rotation.z = Math.sin(ph) * 0.15; lampG.rotation.x = Math.cos(ph) * 0.05;
    const pt = W(0.1, 0.6), look = W(0.45, 0.95);
    A.pose({ headYaw: -0.9 * pt + 0.7 * look, headPitch: -0.15, torsoYaw: -0.3 * pt, armR: { fwd: 2.2 * pt + 0.1, out: -0.3 * pt, point: pt > 0.4 }, armL: { fwd: 0.1 } });
    B.pose({ headYaw: 0.5 * look + 0.2 * Math.sin(ph), headTilt: 0.2 + 0.1 * Math.sin(ph * 2), headPitch: -0.1, armR: { fwd: 0.9, elbow: 2.3 }, armL: { fwd: 0.6, elbow: 1.4 } });
  };
}
