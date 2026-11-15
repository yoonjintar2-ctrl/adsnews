// 11/16 도안나 미니 사설 「선물 상자보다 '푹 빠진 얼굴'을 크게」 — 선물을 끌어안은 손님과 가리키며 웃는 친구
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b8b8b2', tiles: 5 });
  K.box(40, 20, 1, 0xa2a29e, 0, 10, -9, scene);
  // 선반과 선물 상자
  let s = 5; const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const gift = (w, h, d, c, x, y, z, p) => { const g = K.box(w, h, d, c, x, y, z, p); K.box(w + 0.02, h + 0.02, 0.18, 0xeeeeea, x, y, z, p); K.box(0.18, h + 0.02, d + 0.02, 0xeeeeea, x, y, z, p); return g; };
  [3, 6.2, 9.4].forEach(y => { K.box(11, 0.25, 2, 0x4a4a48, -6, y, -7.5, scene); let x = -11; while (x < -1.5) { const w = 1 + r() * 0.8, h = 0.9 + r() * 1.2; gift(w, h, 1.2, [0x6a6a68, 0x9a9a96, 0x3a3a38, 0xcacac4][(r() * 4) | 0], x + w / 2, y + 0.12 + h / 2, -7.5, scene); x += w + 0.35; } });
  // 매달린 별
  const stars = [2, 4.5, 7, 9.5, 12].map((x, i) => { const g = new THREE.Group(); g.position.set(x - 1, 15.6, -5); scene.add(g); const L = 2 + (i % 2) * 1.6; K.line([[0, 0, 0], [0, -L, 0]], g);
    const sh = new THREE.Shape(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 0.35 : 0.8; const px = Math.cos(a) * rr, py = -Math.sin(a) * rr; k ? sh.lineTo(px, py) : sh.moveTo(px, py); }
    const m = K.inked(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.15, bevelEnabled: false }), K.lam(i % 2 ? 0xeeeeea : 0x8a8a86))); m.position.y = -L - 0.8; g.add(m); return g; });
  // 계산대
  K.box(10, 3.2, 2.4, 0x6a6a68, 6.5, 1.6, -5.5, scene); K.box(10.4, 0.3, 2.8, 0x1a1a1a, 6.5, 3.3, -5.5, scene);
  // 선물을 끌어안은 손님 / 가리키며 웃는 친구
  const A = K.person(scene, { x: 0.5, z: 0.8, rot: Math.PI - 0.3, coat: 0xeeeeea, hair: 'long', scale: 1.1 });
  const gb = new THREE.Group(); gb.position.set(0, 0.95, -0.95); A.torso.add(gb); gift(1.6, 1.3, 1.1, 0x3a3a38, 0, 0, 0, gb);
  const B = K.person(scene, { x: 5.4, z: 1.6, rot: Math.PI + 0.7, coat: 0x8a8a86, scale: 1.05 });
  const mo = K.motes(scene, { n: 30, box: [12, 8, 4], z0: -1, size: 0.16 });
  cam.position.set(1, 7, 17); cam.lookAt(1, 6, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    stars.forEach((g, i) => { g.rotation.z = Math.sin(ph + i * 0.9) * 0.15; g.children[1].rotation.y = ph + i; });
    mo.update(ph);
    const sq = Math.abs(Math.sin(ph * 3));
    A.pose({ bob: 0.12 * sq, headTilt: 0.2 * Math.sin(ph * 2), headYaw: -0.2, armL: { fwd: 1.3, out: -0.25, elbow: 1.3 }, armR: { fwd: 1.3, out: -0.25, elbow: 1.3 } });
    gb.rotation.z = 0.12 * Math.sin(ph * 2);
    const pt = W(0.15, 0.85);
    B.pose({ headYaw: 0.8, torsoYaw: 0.3, lean: -0.08 * Math.abs(Math.sin(ph * 6)) * pt, headPitch: -0.15 * Math.abs(Math.sin(ph * 6)) * pt,
      armR: { fwd: 1.5 * pt, out: -0.5 * pt, elbow: 0.1, point: pt > 0.3 }, armL: { fwd: 1.2, elbow: 2.2 * pt } });
  };
}
