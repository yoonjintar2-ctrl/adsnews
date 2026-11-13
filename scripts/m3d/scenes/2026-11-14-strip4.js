// 11/14 4컷 4칸 — 정육 코너, '둘 다 돼지네. 회의 끝.'
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#bdbdb7', tiles: 6 });
  K.box(40, 20, 1, 0xb8b8b2, 0, 10, -9, scene);
  K.box(16, 2.6, 2.6, 0x5a5a58, 0, 1.3, -6.4, scene); K.box(16, 0.1, 2.6, 0xe8e8e2, 0, 2.65, -6.4, scene);
  K.box(16, 1.6, 0.08, 0xd8d8d2, 0, 3.45, -5.1, scene);
  for (let i = 0; i < 7; i++) { const m = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.6, 14, 10), K.lam(0xd0d0ca)), 40); m.scale.set(1.3, 0.45, 0.8); m.position.set(-6.6 + i * 2.2, 2.9, -6.4); scene.add(m); }
  K.box(16, 2.4, 0.4, 0x8a8a88, 0, 7.6, -8.6, scene);
  const lamps = [-5, 0, 5].map(x => { const g = new THREE.Group(); g.position.set(x, 13, -4); scene.add(g); K.line([[0, 0, 0], [0, -2.6, 0]], g); K.cyl(0.35, 1.2, 0.8, 0x1a1a1a, 0, -3.0, 0, g); return g; });
  const M = K.person(scene, { x: 0, z: -2.6, rot: Math.PI, coat: 0xc8c8c2, hair: 'long' });
  const meat = K.inked(new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), K.lam(0xe4e4de)), 40); meat.scale.set(1.25, 0.6, 0.7); scene.add(meat);
  const fat = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.08, 6, 20, Math.PI), K.flat(0x555555)); meat.add(fat); fat.position.z = 0.7;
  const D = K.person(scene, { x: -4.4, z: 1.2, rot: Math.PI, coat: 0x7a7a78 });
  const C = K.person(scene, { x: 4.4, z: 1.2, rot: Math.PI, coat: 0xe2e2dc, scale: 0.68 });
  const mo = K.motes(scene, { n: 20, box: [10, 4, 2], z0: -4, size: 0.18 });
  cam.position.set(0, 5.0, 13.5); cam.lookAt(0, 4.8, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    lamps.forEach((g, i) => { g.rotation.z = Math.sin(ph + i * 0.9) * 0.13; });
    mo.update(ph);
    const lift = 0.85 + 0.15 * Math.sin(ph * 2);
    M.pose({ headPitch: -0.15, armL: { fwd: 2.75 * lift, out: 0.15 }, armR: { fwd: 2.75 * lift, out: 0.15 } });
    meat.position.set(0, 1.8 + 1.3 + 1.55 * lift + 0.6, -2.6 + 0.25); meat.rotation.z = Math.sin(ph * 2) * 0.08;
    const face = W(0.15, 0.9), nod = Math.sin(ph * 6) * 0.18 * face;
    // 서로 마주 보기: 정면 인물이므로 headYaw 부호는 세계 기준 반대
    D.pose({ headYaw: 1.25 * face, torsoYaw: 0.45 * face, headPitch: 0.1 + nod, armL: { fwd: 0.05 }, armR: { fwd: 0.6 * face, elbow: 1.5 * face } });
    C.pose({ headYaw: -1.25 * face, torsoYaw: -0.45 * face, headPitch: -0.1 + nod, armL: { fwd: 0.6 * face, elbow: 1.5 * face }, armR: { fwd: 0.05 } });
  };
}
