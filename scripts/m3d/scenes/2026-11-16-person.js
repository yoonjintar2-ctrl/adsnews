// 11/16 오늘의 광고인 클로드 C. 홉킨스 — 뒷모습 실루엣이 쿠폰 두 더미를 비교, 벽 막대가 자란다(얼굴 세부 없음)
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#a8a8a2', tiles: 5 });
  K.box(30, 20, 1, 0x8c8c88, 0, 10, -6, scene);
  K.box(7, 5.4, 0.3, 0x4a4a48, -4.2, 9.2, -5.4, scene); K.box(6.4, 4.8, 0.1, 0xe4e4de, -4.2, 9.2, -5.2, scene);
  const bars = [[-5.6, 0x8a8a86], [-2.8, 0x2a2a2a]].map(([x, c]) => { const geo = new THREE.BoxGeometry(1.4, 1, 0.2); geo.translate(0, 0.5, 0); const b = K.inked(new THREE.Mesh(geo, K.lam(c))); b.position.set(x, 7.0, -5.0); scene.add(b); return b; });
  K.box(10, 0.4, 3.6, 0x4a4a48, 0, 4.0, -2.6, scene); [-4.6, 4.6].forEach(x => K.box(0.4, 4, 3.2, 0x3a3a38, x, 2, -2.6, scene));
  const stack = (x, n) => { const a = []; for (let i = 0; i < n; i++) { const c = K.box(1.6, 0.08, 0.8, 0xf2f2ec, x, 4.25 + i * 0.1, -2.4, scene); c.rotation.y = (i * 37 % 11 - 5) * 0.05; a.push(c); } return a; };
  const sA = stack(-3.2, 5), sB = stack(3.2, 10);
  const fly = [0, 1, 2].map(i => K.box(1.0, 0.05, 0.5, 0xf2f2ec, 3.2, 6, -2.4, scene));
  const lampG = new THREE.Group(); lampG.position.set(0, 13, -2.6); scene.add(lampG); K.line([[0, 0, 0], [0, -3.2, 0]], lampG); K.cyl(0.3, 1.0, 0.6, 0x1a1a1a, 0, -3.5, 0, lampG, 14);
  const P = K.person(scene, { x: 0, z: 0.6, rot: 0, coat: 0x2a2a2a, pants: 0x1e1e1e, skin: 0x3a3a3a, scale: 1.25 });
  cam.position.set(0, 6.6, 13.5); cam.lookAt(0, 6.4, -3);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.12);
    lampG.rotation.z = Math.sin(ph) * 0.12; lampG.rotation.x = Math.cos(ph) * 0.04;
    bars[0].scale.y = 1.6 + 0.3 * Math.sin(ph); bars[1].scale.y = 2.6 + 0.6 * Math.sin(ph + 0.5);
    fly.forEach((c, i) => { const u = ((ph / 6.283) + i / 3) % 1; c.position.set(3.2 - u * 1.5, 4.6 + Math.sin(u * Math.PI) * 2.2, -2.4 + u); c.rotation.set(u * 4, u * 3 + i, u * 2); });
    const L = W(0.05, 0.45), R = W(0.5, 0.95);
    P.pose({ lean: 0.15, headYaw: 0.6 * L - 0.6 * R, headPitch: 0.25, torsoYaw: 0.15 * L - 0.15 * R,
      armL: { fwd: 0.9 + 0.5 * L, out: 0.25, elbow: 0.5 }, armR: { fwd: 0.9 + 0.5 * R, out: 0.25, elbow: 0.5 } });
  };
}
