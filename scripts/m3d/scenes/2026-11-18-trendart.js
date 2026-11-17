// 11/18 금로동 트렌드 노트 「모깅」
// 흐린 날 부둣가 단체 사진, 기울인 구도: 나무 데크 위 다섯 명이 줄을 섰는데 가운데 한 명만 크게 뛰어오르며 두 팔을 펼치고, 양옆은 고개를 돌려 쳐다본다. 삼각대 카메라 플래시가 번쩍, 깃발이 펄럭인다.
export const secs = 3;
export const meta = { place: '흐린 날 부둣가 나무 데크', where: 'outdoor', time: 'overcast', camera: 'dutch', floor: 'water', figures: 'crowd', motion: ['jump-pose', 'camera-flash', 'flag-wave', 'heads-turn'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'overcast', clouds: 4 });
  K.floor(scene, { style: 'water' });
  // 데크
  const deck = K.box(18, 0.4, 7, 0x8a7d6a, 0, 0.2, -1, scene);
  for (let i = 0; i < 9; i++) K.box(0.05, 0.02, 7, 0x4a4238, -8 + i * 2, 0.41, -1, scene);
  [-8.6, 8.6].forEach(x => [-4.3, 2.3].forEach(z => K.cyl(0.25, 0.25, 2.2, 0x4a4238, x, 0.6, z, scene, 8)));
  // 깃대 + 깃발
  K.cyl(0.07, 0.07, 6, 0x333333, 7.5, 3.4, -4, scene, 8);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.2, 10, 3), new THREE.MeshLambertMaterial({ color: 0x5a5856, side: THREE.DoubleSide })); flag.position.set(8.5, 5.6, -4); scene.add(flag);
  // 사람들(카메라 쪽을 향함)
  const C = [[-4.4, 0x6a6a68, 'short'], [-2.2, 0x8a8782, 'bun'], [0, 0x2e2d2c, 'long'], [2.2, 0x7e7a74, 'cap'], [4.4, 0x5c5a57, 'short']].map(([x, c, h], i) => K.person(scene, { x, z: -2.2, rot: Math.PI, coat: c, hair: h, scale: i === 2 ? 1.1 : 0.95 }));
  C.forEach(p => { p.root.position.y = 0.4; });
  // 삼각대 카메라
  const tri = new THREE.Group(); tri.position.set(1.2, 0.4, 3.0); scene.add(tri);
  [0, 2.1, 4.2].forEach(a => { const l = K.cyl(0.04, 0.04, 2.4, 0x222222, Math.sin(a) * 0.4, 1.1, Math.cos(a) * 0.4, tri, 6); l.rotation.set(Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3); });
  K.box(0.9, 0.6, 0.6, 0x1e1e1e, 0, 2.5, 0, tri); K.cyl(0.22, 0.22, 0.4, 0x333333, 0, 2.5, -0.45, tri, 12).rotation.x = Math.PI / 2;
  const flash = new THREE.Mesh(new THREE.CircleGeometry(0.5, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })); flash.position.set(0.25, 2.95, -0.32); flash.rotation.y = Math.PI; tri.add(flash);
  cam.position.set(4.5, 3.8, 11.5); cam.lookAt(0, 2.6, -2); cam.rotation.z += 0.12;
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.08);
    const j = W(0.25, 0.65); const air = Math.sin(Math.min(1, Math.max(0, (ph / (Math.PI * 2) - 0.25) / 0.4)) * Math.PI);
    C[2].pose({ bob: 0.4 + 0.9 * air, headPitch: -0.2 * j, armL: { fwd: 0.4 * j, out: 1.9 * j }, armR: { fwd: 0.4 * j, out: 1.9 * j } });
    C.forEach((p, i) => { if (i === 2) return; const sd = i < 2 ? -1 : 1; const look = W(0.32, 0.85);
      p.pose({ bob: 0.4, headYaw: sd * 0.9 * look, torsoYaw: sd * 0.25 * look, armL: { fwd: 0.1 }, armR: { fwd: 0.1 } }); });
    flash.material.opacity = K.win(ph, 0.42, 0.5, 0.03);
    const fp = flag.geometry.attributes.position; for (let k = 0; k < fp.count; k++) { const x = fp.getX(k); fp.setZ(k, Math.sin(ph * 2 + x * 2.5) * 0.25 * (x + 1) / 2); } fp.needsUpdate = true;
  };
}
