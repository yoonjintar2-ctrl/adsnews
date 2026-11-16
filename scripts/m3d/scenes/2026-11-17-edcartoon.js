// 11/17 도안나 미니 사설 「두꺼비에게 산타 옷을 입히면 생기는 일」 — 산타 모자·루돌프 뿔을 쓴 동그란 캐릭터 인형을 알아보고 가리키는 손님(실제 캐릭터 아님)
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b8b8b2', tiles: 5 });
  K.box(40, 20, 1, 0xa2a29e, 0, 10, -9, scene);
  K.box(14, 3.4, 2.4, 0x5a5a58, 0, 1.7, -6, scene); K.box(14.4, 0.3, 2.8, 0x1a1a1a, 0, 3.5, -6, scene);
  const masc = (x, s, acc) => { const g = new THREE.Group(); g.position.set(x, 3.65, -6); scene.add(g);
    const b = K.inked(new THREE.Mesh(new THREE.SphereGeometry(1.3 * s, 22, 16), K.lam(0xeeeeea))); b.scale.y = 0.85; b.position.y = 1.1 * s; g.add(b);
    [-1, 1].forEach(sd => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.13 * s, 8, 6), K.flat(0x111111)); e.position.set(sd * 0.45 * s, 1.35 * s, 1.18 * s); g.add(e); });
    const hat = new THREE.Group(); hat.position.y = 2.0 * s; g.add(hat);
    if (acc === 'santa') { const c = K.inked(new THREE.Mesh(new THREE.ConeGeometry(0.9 * s, 1.8 * s, 16), K.lam(0x4a4a48))); c.position.y = 0.9 * s; c.rotation.z = -0.25; hat.add(c); K.cyl(1.0 * s, 1.0 * s, 0.3 * s, 0xf4f4f0, 0, 0, 0, hat);
      const p = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.25 * s, 10, 8), K.lam(0xf4f4f0))); p.position.set(0.45 * s, 1.75 * s, 0); hat.add(p); }
    if (acc === 'deer') [-1, 1].forEach(sd => { K.cyl(0.08, 0.1, 1.2 * s, 0x2a2a2a, sd * 0.5 * s, 0.4 * s, 0, hat, 6).rotation.z = -sd * 0.4; K.cyl(0.07, 0.08, 0.6 * s, 0x2a2a2a, sd * 0.75 * s, 0.6 * s, 0, hat, 6).rotation.z = -sd * 1.1; });
    return { g, hat }; };
  const Ms = [masc(-4.2, 0.85, 'deer'), masc(0, 1.15, 'santa'), masc(4.2, 0.85, 'none')];
  const lan = K.lanternString(scene, { x0: -12, x1: 12, y: 15, z: -5, n: 9, sag: 1.4 });
  const P = K.person(scene, { x: -4.2, z: 2.2, rot: -1.1, coat: 0x6a6a68, scale: 1.1 });
  const F = K.person(scene, { x: -7.4, z: 3.0, rot: -1.6, coat: 0xd8d8d2, hair: 'long', scale: 1.05 });
  const D = K.person(scene, { x: 6.0, z: 1.5, rot: 1.3, coat: 0xeeeeea, hair: 'bun', scale: 1.08 });
  const mini = K.inked(new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 12), K.lam(0x4a4a48))); scene.add(mini);
  const mo = K.motes(scene, { n: 20, box: [20, 10, 6], z0: -3, size: 0.14 });
  cam.position.set(-0.5, 6.2, 14.5); cam.lookAt(-0.5, 5.6, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    lan.update(ph); mo.update(ph);
    Ms.forEach((m, i) => { m.g.rotation.y = Math.sin(ph + i * 2) * 0.25; m.g.position.y = 3.65 + 0.15 * Math.abs(Math.sin(ph * 2 + i)); m.hat.rotation.z = Math.sin(ph * 2 + i) * 0.15; });
    const p = W(0.1, 0.75);
    P.pose({ headYaw: 1.2 * W(0.55, 0.85), headPitch: -0.3 * p, torsoYaw: 0.1, armR: { fwd: 2.1 * p + 0.2, out: 0.2 * p, point: p > 0.4 }, armL: { fwd: 0.2 }, bob: 0.05 * p * Math.abs(Math.sin(ph * 5)) });
    const n = W(0.5, 0.95);
    F.pose({ headYaw: -0.6 * n + 0.3, torsoYaw: -0.2 * n, headPitch: 0.15 * Math.abs(Math.sin(ph * 5)) * n, armL: { fwd: 0.4, elbow: 2.1 * n }, armR: { fwd: 0.3, elbow: 2.2 * n } });
    const r = 0.5 + 0.5 * Math.sin(ph);
    D.pose({ headYaw: 0.3, armL: { fwd: 1.2 + 0.6 * r, out: -0.1, elbow: 0.3 }, armR: { fwd: 0.3, elbow: 0.6 } });
    D.root.updateMatrixWorld(true); const v = new THREE.Vector3(-0.8, 2.2 + 0.5 * r, -1.9); D.torso.localToWorld(v); mini.position.copy(v); mini.rotation.z = Math.sin(ph * 3) * 0.3;
  };
}
