// 11/18 금로동 사설 「사막 행성에 보습크림을, 세라비의 능청」
// 한낮 모래 언덕: 망토 두른 여행자가 사람 키만 한 크림 통 앞에서 볼에 크림을 찍어 바르고, 모래바람이 흩날리며 망토 자락이 펄럭인다.
export const secs = 3;
export const meta = { place: '한낮 사막 모래 언덕', where: 'outdoor', time: 'day', camera: 'wide', floor: 'sand', figures: 'solo-side', motion: ['cream-dab', 'sand-drift', 'cloak-flutter', 'lid-wobble'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'day', sun: true });
  K.floor(scene, { style: 'sand' });
  // 모래 언덕(납작한 구)
  [[-14, -22, 9, 3.2], [6, -30, 14, 4.5], [22, -18, 8, 2.6], [-28, -34, 12, 4]].forEach(([x, z, r, h]) => { const d = K.inked(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), K.lam(0xcac2b0)), 50); d.scale.y = h / r; d.position.set(x, 0, z); scene.add(d); });
  // 크림 통
  const jar = K.cyl(1.5, 1.5, 3.2, 0xf2f0ea, 2.4, 1.6, -2, scene, 28);
  const lid = K.cyl(1.62, 1.62, 0.6, 0x2a2a2a, 2.4, 3.5, -2, scene, 28);
  const band = K.cyl(1.52, 1.52, 0.5, 0x8a8a86, 2.4, 1.9, -2, scene, 28);
  // 여행자(옆모습) + 망토
  const P = K.person(scene, { x: -1.4, z: -1.6, rot: -Math.PI / 2, coat: 0x6c675f, hair: 'long', scale: 1.0 });
  const cloak = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.8, 6, 6), new THREE.MeshLambertMaterial({ color: 0x55514a, side: THREE.DoubleSide }));
  cloak.position.set(0, 0.9, 0.62); P.torso.add(cloak);
  // 모래 알갱이 바람
  const N = 60, sand = []; for (let i = 0; i < N; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 5, 4), K.flat(0x8a8274)); scene.add(m); sand.push([m, Math.sin(i * 12.3) * 0.5 + 0.5, Math.abs(Math.cos(i * 7.1)) * 3.5, -6 + Math.sin(i * 3.7) * 5]); }
  cam.position.set(0.6, 2.9, 7.2); cam.lookAt(0.4, 2.4, -2);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    const dab = W(0.2, 0.75);
    P.pose({ headYaw: 0.2, headTilt: 0.12 * dab, armL: { fwd: 0.2 }, armR: { fwd: 0.9 * dab + 0.2, elbow: 2.1 * dab, out: 0.05 }, bob: 0.02 * Math.sin(ph * 2) });
    const cp = cloak.geometry.attributes.position; for (let k = 0; k < cp.count; k++) { const y = cp.getY(k); cp.setZ(k, Math.sin(ph * 2 + cp.getX(k) * 2 + y) * 0.18 * (0.9 - y) / 1.8); } cp.needsUpdate = true;
    lid.rotation.z = Math.sin(ph * 2) * 0.03;
    const u = ph / (Math.PI * 2);
    sand.forEach(([m, s, y, z], i) => { const x = ((s + u) % 1) * 30 - 15; m.position.set(x, y + Math.sin(ph * 2 + i) * 0.2, z); });
  };
}
