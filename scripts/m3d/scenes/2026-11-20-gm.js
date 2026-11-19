// 11/20 안광주 미니 사설 「고3에게 AI를 건네는 통신사, 성적표는 석 달 뒤」(도안나 그림)
// 흐린 오후 교문 앞 언덕길을 위에서 내려다본다: 배낭 멘 학생이 걸어 나오고, 길가 부스 세 곳의 깃발이 펄럭이며 표가 바람에 날린다. 모래시계가 뒤집힌다.
export const secs = 3;
export const meta = { place: '흐린 오후 학교 교문 앞 언덕길 부스', where: 'outdoor', time: 'overcast', camera: 'high', floor: 'asphalt', figures: 'solo-front', motion: ['flag-wave', 'ticket-flutter', 'hourglass-flip'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'overcast', clouds: 4 });
  K.floor(scene, { style: 'asphalt' });
  // 교문 기둥
  K.box(1.2, 4, 1.2, 0x8c8a85, -3.5, 2, -6, scene); K.box(1.2, 4, 1.2, 0x8c8a85, 3.5, 2, -6, scene);
  K.box(14, 1.6, 0.6, 0x9c9a95, -10.5, 0.8, -6, scene); K.box(14, 1.6, 0.6, 0x9c9a95, 10.5, 0.8, -6, scene);
  K.tree(scene, { x: -7, z: -9, h: 6, kind: 'bare' }); K.tree(scene, { x: 7, z: -9, h: 5, kind: 'bare' });
  // 부스 세 개 + 깃발
  const flags = [];
  [[-6, 0], [6, -1], [-6, 4]].forEach(([x, z], i) => {
    K.box(2.6, 1.1, 1.4, 0x6e6c68, x, 0.55, z, scene); K.box(2.8, 0.1, 1.6, 0xd8d6d0, x, 1.15, z, scene);
    K.cyl(0.05, 0.05, 3.4, 0x222222, x + (x < 0 ? 1.2 : -1.2), 1.7, z - 0.6, scene, 8);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8, 8, 1), new THREE.MeshLambertMaterial({ color: i === 1 ? 0x3a3a38 : 0xe6e4de, side: THREE.DoubleSide }));
    f.position.set(x + (x < 0 ? 1.8 : -0.6), 3.0, z - 0.6); scene.add(f); flags.push(f);
  });
  // 날리는 표들
  const tix = []; for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.28), new THREE.MeshLambertMaterial({ color: 0xf4f2ec, side: THREE.DoubleSide })); scene.add(m); tix.push(m); }
  // 모래시계 (부스 위)
  const hg = new THREE.Group(); hg.position.set(6, 1.7, -1); scene.add(hg);
  const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.45, 12), K.lam(0xdedcd6)); c1.position.y = 0.22; c1.rotation.x = Math.PI; hg.add(c1);
  const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.45, 12), K.lam(0x5a5854)); c2.position.y = -0.22; hg.add(c2);
  // 학생
  const P = K.person(scene, { x: 0, z: 0, rot: Math.PI, coat: 0x6e6c68, hair: 'short', backpack: true, scale: 1.05 });
  K.shot(cam, 'high', [0, 0.5, 0], 13);
  return (t, ph) => {
    const u = ph / 6.2832;
    flags.forEach((f, i) => { const p = f.geometry.attributes.position; for (let k = 0; k < p.count; k++) { const x = p.getX(k); p.setZ(k, Math.sin(x * 4 + ph * 2 + i) * 0.15 * (x + 0.6)); } p.needsUpdate = true; });
    tix.forEach((m, i) => { const s = (i / 9 + u) % 1; m.position.set(-6 + s * 12 + Math.sin(i) * 1.5, 1.4 + Math.sin(s * 6 + i) * 0.8 + s * 1.5, -1 + Math.cos(i * 2) * 3); m.rotation.set(ph * 2 + i, ph + i, i); });
    hg.rotation.z = Math.PI * K.win(ph, 0.4, 0.95, 0.1);
    P.pose({ bob: Math.abs(Math.sin(ph * 2)) * 0.08, armL: { fwd: 0.35 * Math.sin(ph * 2) }, armR: { fwd: -0.35 * Math.sin(ph * 2) }, headYaw: 0.4 * Math.sin(ph) });
    P.root ? (P.root.position.z = 2 - u * 3) : 0;
  };
}
