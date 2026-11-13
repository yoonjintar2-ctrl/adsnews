// 11/14 도안나 트렌드 노트 #호두까기 홀리데이 — 화장품 상자에 막이 오르다
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b2b2ad', tiles: 5 });
  K.box(40, 20, 1, 0xa8a8a3, 0, 10, -10, scene);
  K.box(12, 0.5, 5, 0x5a5a58, 0, 2.6, -4, scene); [-5.4, 5.4].forEach(x => K.box(0.4, 2.4, 4.6, 0x3a3a38, x, 1.2, -4, scene));
  // 선물 상자 = 무대
  const bx = new THREE.Group(); bx.position.set(0, 2.85, -4.2); scene.add(bx);
  K.box(5, 0.25, 3.4, 0xe6e6e0, 0, 0.12, 0, bx); K.box(5, 3.2, 0.2, 0xe6e6e0, 0, 1.6, -1.6, bx);
  [-2.4, 2.4].forEach(x => K.box(0.2, 3.2, 3.4, 0xe6e6e0, x, 1.6, 0, bx));
  K.box(4.6, 2.9, 0.1, 0x5a5a58, 0, 1.6, -1.45, bx);
  [-1, 1].forEach(s => { const c = K.inked(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 2.9, 10, 1, true, 0, Math.PI), K.lam(0x3a3a38, { side: THREE.DoubleSide })), 20); c.position.set(s * 1.9, 1.6, -1.1); bx.add(c); });
  K.box(4.8, 0.45, 0.15, 0x2a2a2a, 0, 3.0, -1.2, bx);
  const lidG = new THREE.Group(); lidG.position.set(0, 3.2, -1.7); bx.add(lidG); K.box(5.1, 0.2, 3.5, 0xd0d0ca, 0, 0, 1.75, lidG);
  // 발레리나 인형(회전)
  const bal = new THREE.Group(); bal.position.set(0, 0.25, 0.2); bx.add(bal);
  K.cyl(0.6, 0.6, 0.12, 0x9a9a98, 0, 0.06, 0, bal);
  const fig = new THREE.Group(); fig.position.y = 0.12; bal.add(fig);
  K.cyl(0.04, 0.04, 0.8, 0xdcdcd6, 0, 0.4, 0, fig); const sk = K.inked(new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.32, 18, 1, true), K.lam(0xf4f4f0, { side: THREE.DoubleSide })), 10); sk.position.y = 0.9; sk.rotation.x = Math.PI; fig.add(sk);
  K.cyl(0.12, 0.17, 0.55, 0x2a2a2a, 0, 1.25, 0, fig); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), K.lam(0xdcdcd6)); hd.position.y = 1.65; fig.add(hd);
  const arms = K.inked(new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 6, 16, Math.PI), K.lam(0xdcdcd6)), 10); arms.position.y = 1.62; fig.add(arms);
  const snow = K.motes(scene, { n: 40, box: [16, 10, 6], z0: -6, size: 0.16 });
  const stars = K.lanternString(scene, { x0: -7, x1: 7, y: 9.9, z: -3, n: 6, sag: 0.6, size: 0.6 });
  const A = K.person(scene, { x: -5.2, z: 1.4, coat: 0x8a8a88, rot: 0.5 });
  const B = K.person(scene, { x: 5.2, z: 1.4, coat: 0xd0d0ca, hair: 'long', rot: -0.5, scale: 0.95 });
  cam.position.set(0, 5.4, 10.8); cam.lookAt(0, 4.8, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    fig.rotation.y = ph * 2; lidG.rotation.x = -1.45 - Math.sin(ph) * 0.08; snow.update(ph); stars.update(ph, 0.15);
    const pt = W(0.1, 0.6), lean = W(0.35, 0.9), turn = W(0.55, 0.92);
    A.pose({ headPitch: 0.25, headYaw: -0.2 - 1.1 * turn, armR: { fwd: 1.6 * pt, out: 0.4 * pt, point: pt > 0.3 }, armL: { fwd: 0.05 } });
    B.pose({ lean: 0.22 * lean, headPitch: 0.3, headYaw: 0.1 + 1.1 * turn, armL: { fwd: 0.9 * lean, elbow: 2.3 * lean }, armR: { fwd: 0.6 * lean, elbow: 2.2 * lean } });
  };
}
