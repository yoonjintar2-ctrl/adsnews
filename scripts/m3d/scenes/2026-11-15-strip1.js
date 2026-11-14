// 11/15 4컷 「수험표의 진짜 주인」 1칸 — 시험장 정문, 전단을 내미는 손들
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b2b2ac', tiles: 6 });
  K.building(scene, 0, -16, 22, 6, 11, 5);
  [-6, 6].forEach(x => K.box(1.2, 8, 1.2, 0x5a5a58, x, 4, -7, scene)); K.box(13.4, 1.2, 1.4, 0x2a2a2a, 0, 8.4, -7, scene);
  const lampG = new THREE.Group(); lampG.position.set(0, 8, -6); scene.add(lampG); K.line([[0, 0, 0], [0, -1.2, 0]], lampG); K.cyl(0.25, 0.8, 0.5, 0x1a1a1a, 0, -1.4, 0, lampG, 14);
  const J = K.person(scene, { x: 0, z: -2.5, rot: Math.PI, coat: 0x6e6e6a, hair: 'long', backpack: true, scale: 0.92 });
  const staff = [[-4.6, -0.6, -2.3, 0x2a2a2a, 'cap'], [-2.6, 1.4, -2.6, 0xc0c0ba, 'short'], [2.6, 1.4, 2.6, 0x8a8a86, 'bun'], [4.6, -0.6, 2.3, 0xe0e0da, 'long']]
    .map(([x, z, rot, coat, hair]) => { const p = K.person(scene, { x, z, rot, coat, hair, scale: 0.95 }); const fl = K.box(0.7, 0.9, 0.05, 0xf4f4f0, 0, 1.25, -1.35, p.torso); return { p, fl }; });
  const mo = K.motes(scene, { n: 30, size: 0.12 });
  const birdA = K.bird(scene, { cx: 0, cy: 12, cz: -12, rx: 8, rz: 2, s: 0.8 });
  cam.position.set(0, 5.4, 13.5); cam.lookAt(0, 4.2, -3);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1); mo.update(ph); birdA.update(ph);
    lampG.rotation.z = Math.sin(ph) * 0.16;
    J.pose({ bob: Math.abs(Math.sin(ph * 2)) * 0.05, headPitch: 0.35 - 0.3 * W(0.4, 0.8), headYaw: 0.5 * Math.sin(ph) * W(0.4, 0.8), lean: 0.12, armL: { fwd: 0.05 }, armR: { fwd: 0.05 } });
    staff.forEach(({ p, fl }, i) => { const push = 0.5 + 0.5 * Math.sin(ph * 2 + i * 0.9);
      p.pose({ lean: 0.1 * push, headYaw: 0.1 * Math.sin(ph + i), bob: Math.abs(Math.sin(ph * 4 + i)) * 0.06, armR: { fwd: 1.3 + 0.3 * push, out: -0.2, elbow: 0.3 }, armL: { fwd: 1.3 + 0.3 * (1 - push), out: 0.1, elbow: 0.3 } });
      fl.position.set(0.0, 1.0 + 0.15 * push, -1.6 - 0.3 * push); });
  };
}
