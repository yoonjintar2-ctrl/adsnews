// 11/21 금로동 트렌드 노트 「미니 김장」 그림(도안나)
// 흐린 날 아파트 베란다를 위에서 내려다본 구도: 작은 김장 매트 위에 배추 한 포기, 마주 앉은 두 사람. 한 사람이 소금을 뿌리고, 다른 사람이 배추 반쪽을 들어 보이며 웃는다. 빨래 건조대의 수건이 바람에 흔들린다.
export const secs = 3;
export const meta = { place: '흐린 날 아파트 베란다 김장 매트', where: 'outdoor', time: 'overcast', camera: 'high', floor: 'plain', figures: 'two-facing', motion: ['salt-shake', 'cabbage-lift', 'towel-sway'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'overcast', clouds: 2 });
  K.floor(scene, { style: 'plain', color: '#a4a29c' });
  // 베란다 난간 + 바닥 판
  K.box(16, 0.2, 9, 0xb8b6b0, 0, 0.1, -1, scene);
  K.box(16, 0.15, 0.15, 0x333333, 0, 2.6, -5.4, scene); for (let i = 0; i < 17; i++) K.cyl(0.05, 0.05, 2.5, 0x333333, -8 + i, 1.3, -5.4, scene, 6);
  // 김장 매트
  K.box(5.6, 0.08, 3.6, 0x7e8a7a, 0, 0.24, -1, scene);
  K.cyl(0.8, 0.6, 0.5, 0xbab8b2, 1.6, 0.5, -0.4, scene, 18); // 양념 그릇
  // 배추 한 포기(반쪽)
  const cab = new THREE.Group(); scene.add(cab);
  const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12, 0, Math.PI), K.lam(0xcfd4c4)); c1.scale.set(1, 1, 1.9); c1.rotation.y = Math.PI / 2; cab.add(c1);
  const c2 = new THREE.Mesh(new THREE.CircleGeometry(0.55, 16), K.lam(0xeeeee6)); c2.scale.set(1.9, 1, 1); c2.rotation.x = -Math.PI / 2; cab.add(c2);
  // 두 사람(마주 봄)
  const A = K.person(scene, { x: -3.2, z: -1, rot: Math.PI / 2, coat: 0x8a8580, hair: 'bun', scale: 0.9 });
  const B = K.person(scene, { x: 3.4, z: -1.2, rot: -Math.PI / 2, coat: 0x4e4c4a, hair: 'short', scale: 0.9 });
  const salt = K.cyl(0.12, 0.12, 0.35, 0xf0efe9, 0, 0, 0, scene, 10);
  const grains = [0, 1, 2, 3, 4].map(() => { const g = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), K.flat(0xf8f8f4)); scene.add(g); return g; });
  // 빨래 건조대 + 수건
  K.box(0.08, 3, 0.08, 0x333333, -6, 1.5, -3.8, scene); K.box(0.08, 3, 0.08, 0x333333, -2, 1.5, -3.8, scene); K.box(4.2, 0.08, 0.08, 0x333333, -4, 3.0, -3.8, scene);
  const towels = [-5.3, -4.0, -2.7].map((x, i) => { const g = new THREE.Group(); g.position.set(x, 3.0, -3.8); scene.add(g); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.5, 4, 6), new THREE.MeshLambertMaterial({ color: [0xe6e4de, 0x8a8782, 0xcfcac2][i], side: THREE.DoubleSide })); m.position.y = -0.75; g.add(m); return g; });
  cam.position.set(0.5, 11, 6.5); cam.lookAt(0, 0.8, -1.3);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    const sh = Math.sin(ph * 6) * 0.5 + 0.5;
    A.pose({ headPitch: 0.35, armR: { fwd: 1.3 + 0.3 * sh, elbow: 0.4 }, armL: { fwd: 0.6, elbow: 0.8 } });
    salt.position.set(-3.2 + 1.5, 2.6 + 0.2 * sh, -1 + 0.45); salt.rotation.z = 2.4;
    grains.forEach((g, i) => { const u = ((ph * 2 / 6.283 + i / 5) % 1); g.position.set(-1.6 + Math.sin(i * 3) * 0.2, 2.4 - u * 2.0, -0.6 + Math.cos(i * 2) * 0.2); });
    const up = W(0.3, 0.8);
    B.pose({ headPitch: 0.2 - 0.3 * up, headYaw: 0, armL: { fwd: 0.5 + 1.1 * up, elbow: 0.6 }, armR: { fwd: 0.5 + 1.1 * up, elbow: 0.6 } });
    cab.position.set(0.3 + 1.4 * up, 0.32 + 2.0 * up, -1.1); cab.rotation.z = -0.6 * up;
    towels.forEach((g, i) => { g.rotation.x = 0.25 * Math.sin(ph + i * 0.8); g.rotation.z = 0.05 * Math.sin(ph * 2 + i); });
  };
}
