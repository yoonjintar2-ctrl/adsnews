// 11/16 안광주 미니 사설 「AI가 답을 주면, 검색 광고 칸은 어디로 가나」 — 답변 카드에 밀려 떨어지는 광고 칸
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b6b6b0', tiles: 5 });
  K.box(40, 20, 1, 0xa0a09c, 0, 10, -9, scene);
  const tx = K.canvasTex(640, 400, (g, w, h) => { g.fillStyle = '#efefe9'; g.fillRect(0, 0, w, h); g.strokeStyle = '#222'; g.lineWidth = 6;
    g.beginPath(); g.roundRect(40, 30, 560, 50, 25); g.stroke(); g.beginPath(); g.arc(560, 55, 12, 0, 7); g.stroke();
    g.fillStyle = '#d4d4ce'; g.beginPath(); g.roundRect(40, 110, 560, 250, 20); g.fill(); g.stroke(); g.fillStyle = '#222';
    g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 9 : 22; g.lineTo(90 + Math.cos(a) * rr, 150 + Math.sin(a) * rr); } g.fill();
    [440, 480, 400, 330, 250].forEach((L, i) => g.fillRect(130, 140 + i * 42, L, 12)); });
  const scr = K.screen(scene, { tex: tx, x: -2, y: 8.6, z: -7.6, w: 12, h: 7.5, frame: 0x161616, border: 0.8 });
  K.box(1.2, 2, 0.6, 0x3a3a38, -2, 4.1, -7.8, scene);
  K.box(14, 0.35, 3.4, 0x5a5a58, -1, 3.1, -6.6, scene); [-7.6, 5.6].forEach(x => K.box(0.3, 3, 0.3, 0x333333, x, 1.5, -6.6, scene));
  // 광고 칸(카드) — 책상 끝으로 밀려 기울고 떨어짐
  const cards = [0, 1, 2].map(i => { const g = new THREE.Group(); g.position.set(2.6 + i * 1.6, 3.35, -6.0); scene.add(g);
    const c = K.box(1.5, 0.12, 0.9, 0x7a7a76, 0.75, 0.06, 0, g); K.box(0.4, 0.14, 0.4, 0xe8e8e2, 0.4, 0.07, 0, g); return g; });
  const A = K.person(scene, { x: -7.8, z: 1.0, rot: Math.PI - 0.5, coat: 0x8a8a86, scale: 1.08 });
  const B = K.person(scene, { x: 7.5, z: 1.4, rot: Math.PI + 0.7, coat: 0x3a3a38, hair: 'bun', scale: 1.08 });
  K.box(0.8, 1.0, 0.05, 0xf4f4f0, 0, 0.6, -0.7, B.torso);
  const lampG = new THREE.Group(); lampG.position.set(2, 17.5, -4); scene.add(lampG); K.line([[0, 0, 0], [0, -2.6, 0]], lampG); K.cyl(0.3, 1.1, 0.7, 0x1a1a1a, 0, -2.9, 0, lampG, 14);
  cam.position.set(0, 7.2, 18); cam.lookAt(0, 6, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    lampG.rotation.z = Math.sin(ph) * 0.14;
    cards.forEach((g, i) => { const u = ((ph / 6.283) + i / 3) % 1; const tip = Math.min(1, u * 2.2); g.rotation.z = -tip * 1.2 * (0.6 + i * 0.2); g.position.y = 3.35 - Math.max(0, u - 0.45) * 5 * (u > 0.45 ? 1 : 0) * (1 - Math.max(0, (u - 0.9) * 10)); });
    const sur = W(0.2, 0.7);
    A.pose({ lean: -0.12 * sur, headPitch: -0.2 * sur, headYaw: -0.4, armL: { fwd: 1.6 * sur, out: 0.4 * sur, elbow: 0.6 }, armR: { fwd: 2.0 * sur, out: 0.3, elbow: 0.8 } });
    const pt = W(0.35, 0.95);
    B.pose({ headYaw: 0.5 + 0.3 * Math.sin(ph), torsoYaw: 0.4, armR: { fwd: 1.9 * pt, out: -0.4 * pt, point: pt > 0.3 }, armL: { fwd: 1.0, elbow: 1.2 }, headPitch: 0.1 * Math.sin(ph * 4) * (1 - pt) });
  };
}
