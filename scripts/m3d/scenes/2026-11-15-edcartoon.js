// 11/15 도안나 미니 사설 「처음 보는 이름엔 얼굴부터 그려 준다」 — 진열대 앞 캐릭터 입간판(가상의 캐릭터)
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#bdbdb7', tiles: 6 });
  K.box(40, 20, 1, 0xc4c4be, 0, 10, -9, scene);
  // 진열대 두 개 + 상자(귀퉁이에 작은 얼굴)
  const face = K.canvasTex(128, 160, (g, w, h) => { g.fillStyle = '#ecece6'; g.fillRect(0, 0, w, h); g.fillStyle = '#9a9a96'; g.fillRect(0, 100, w, 60);
    g.fillStyle = '#fff'; g.strokeStyle = '#222'; g.lineWidth = 5; g.beginPath(); g.arc(88, 36, 22, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#222'; g.beginPath(); g.arc(80, 32, 4, 0, 7); g.arc(96, 32, 4, 0, 7); g.fill(); });
  const boxMat = new THREE.MeshLambertMaterial({ map: face });
  [-7.5, 7.5].forEach(sx => { K.box(9, 9, 2, 0x8a8a86, sx, 4.5, -7.6, scene);
    [1.6, 4.4, 7.2].forEach(y => { K.box(9, 0.2, 2.4, 0x5a5a58, sx, y - 0.1, -6.8, scene); for (let i = 0; i < 6; i++) K.box(1.1, 1.8, 1.0, boxMat, sx - 3.6 + i * 1.45, y + 0.9, -6.6, scene); }); });
  // 캐릭터 입간판(둥근 몸 + 줄무늬 + 날개 + 더듬이) — 흔들흔들
  const M = new THREE.Group(); M.position.set(0.6, 0, -4.6); scene.add(M);
  K.cyl(0.12, 0.12, 2.6, 0x333333, 0, 1.3, 0, M, 8); K.cyl(1.0, 1.1, 0.2, 0x222222, 0, 0.1, 0, M);
  const top = new THREE.Group(); top.position.y = 2.6; M.add(top);
  const body = K.inked(new THREE.Mesh(new THREE.SphereGeometry(1.7, 28, 20), K.lam(0xeeeeea)), 60); body.position.y = 1.7; top.add(body);
  [-0.4, 0.5].forEach(y => { const r = new THREE.Mesh(new THREE.TorusGeometry(1.66 - Math.abs(y) * 0.12, 0.13, 8, 36), K.flat(0x222222)); r.rotation.x = Math.PI / 2; r.position.y = 1.7 + y; top.add(r); });
  [-1, 1].forEach(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), K.flat(0x111111)); e.position.set(s * 0.5, 2.3, 1.55); top.add(e); });
  const sm = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.06, 6, 16, Math.PI), K.flat(0x111111)); sm.rotation.z = Math.PI; sm.position.set(0, 2.0, 1.62); top.add(sm);
  const wings = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 1.2, 2.6, -0.3); top.add(g); const w = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 10), new THREE.MeshLambertMaterial({ color: 0xf6f6f2, transparent: true, opacity: 0.85 })), 50); w.scale.set(1.2, 0.55, 0.15); w.position.x = s * 0.9; g.add(w); return g; });
  const ant = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.45, 3.25, 0.2); top.add(g); K.cyl(0.04, 0.04, 0.9, 0x222222, 0, 0.45, 0, g, 6); const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), K.flat(0x111111)); b.position.y = 0.95; g.add(b); return g; });
  const lamps = K.lanternString(scene, { x0: -8, x1: 8, y: 13, z: -3, n: 5, sag: 0.6, size: 0.8 });
  const Mom = K.person(scene, { x: -3.6, z: -0.4, rot: -2.5, coat: 0x9a9a96, hair: 'bun', scale: 1.05 });
  const Kid = K.person(scene, { x: -1.6, z: 0.2, rot: -2.9, coat: 0xd2d2cc, hair: 'long', scale: 0.62 });
  K.box(0.7, 1.0, 0.4, 0xf0f0ea, 0, 1.0, -0.7, Mom.torso);
  cam.position.set(-0.6, 5.0, 12.5); cam.lookAt(-0.4, 4.0, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1); lamps.update(ph, 0.14);
    top.rotation.z = Math.sin(ph) * 0.08; top.rotation.y = Math.sin(ph) * 0.25; M.position.y = Math.abs(Math.sin(ph * 2)) * 0.15;
    wings.forEach((g, i) => { g.rotation.y = (i ? -1 : 1) * (0.3 + 0.35 * Math.sin(ph * 6)); }); ant.forEach((g, i) => { g.rotation.z = Math.sin(ph * 3 + i) * 0.3; });
    const pt = W(0.15, 0.75), look = W(0.45, 0.95);
    Kid.pose({ bob: Math.abs(Math.sin(ph * 6)) * 0.12 * pt, headPitch: -0.35, headYaw: 0.6 * look, armR: { fwd: 2.5 * pt + 0.1, out: -0.1, point: pt > 0.4 }, armL: { fwd: 0.2 } });
    Mom.pose({ lean: 0.12 * look, headYaw: -0.4 * look, headPitch: -0.15, headTilt: 0.12 * look, armL: { fwd: 0.9, elbow: 1.2 }, armR: { fwd: 0.9, elbow: 1.2 } });
  };
}
