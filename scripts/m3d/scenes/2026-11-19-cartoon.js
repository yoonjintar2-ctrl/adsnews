// 11/19 금로동 사설 「10년 만에 입체가 된 기은센, 은행이 표정을 고쳤다」
// 흐린 겨울 오후 공원 잔디밭: 납작한 판지 캐릭터 옆에서 같은 얼굴의 큰 풍선이 숨 쉬듯 부풀고, 작은 친구 풍선 셋이 줄에 매달려 떠오른다. 아이와 어른이 올려다보며 가리킨다.
export const secs = 3;
export const meta = { place: '흐린 오후 공원 잔디밭 풍선 행사', where: 'outdoor', time: 'overcast', camera: 'low', floor: 'grass', figures: 'two-facing', motion: ['balloon-inflate', 'friend-bob', 'point', 'tree-sway'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'overcast', clouds: 3 });
  K.floor(scene, { style: 'grass' });
  const trees = [[-12, -16, 'bare'], [11, -18, 'bare'], [-6, -24, 'pine'], [15, -10, 'pine']].map(([x, z, k]) => K.tree(scene, { x, z, h: 7, kind: k }));
  // 납작한 판지 캐릭터(평면) — 원판 + 귀 두 개
  const flatTex = K.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e8e6e0'; g.beginPath(); g.arc(128, 140, 100, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#222'; [[95, 125], [161, 125]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); }); g.beginPath(); g.arc(128, 165, 30, 0.2, Math.PI - 0.2); g.stroke();
    g.beginPath(); g.moveTo(80, 60); g.quadraticCurveTo(60, 10, 100, 30); g.moveTo(176, 60); g.quadraticCurveTo(196, 10, 156, 30); g.stroke(); });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: flatTex, transparent: true }));
  card.position.set(-6.0, 2.4, -4.5); card.rotation.y = 0.45; scene.add(card);
  K.box(0.12, 1.2, 0.12, 0x444444, -6.0, 0.6, -4.55, scene);
  // 큰 입체 풍선 캐릭터
  const big = new THREE.Group(); big.position.set(1.2, 3.6, -5); scene.add(big);
  const body = K.inked(new THREE.Mesh(new THREE.SphereGeometry(2.4, 32, 22), K.lam(0xdedbd4)), 50); big.add(body);
  [-1, 1].forEach(sd => { const ear = K.inked(new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.6, 12), K.lam(0x8f8c86)), 40); ear.position.set(sd * 1.2, 2.3, 0); ear.rotation.z = -sd * 0.35; big.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), K.flat(0x111111)); eye.position.set(sd * 0.75, 0.35, 2.25); big.add(eye); });
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.07, 6, 18, Math.PI), K.flat(0x222222)); smile.rotation.z = Math.PI; smile.position.set(0, -0.3, 2.3); big.add(smile);
  K.cyl(0.6, 0.9, 0.6, 0x333333, 1.2, 0.3, -5, scene, 16);
  // 작은 친구 풍선들
  const fr = [[4.6, 5.8, -3.5, 0.75], [6.2, 4.6, -5.5, 0.6], [3.6, 7.4, -6.5, 0.55]].map(([x, y, z, r], i) => {
    const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    g.add(K.inked(new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), K.lam([0xc9c6bf, 0xa9a6a0, 0xe4e2dc][i])), 50));
    [-1, 1].forEach(sd => { const e = new THREE.Mesh(new THREE.SphereGeometry(r * 0.1, 6, 5), K.flat(0x111111)); e.position.set(sd * r * 0.32, r * 0.15, r * 0.95); g.add(e); });
    const str = K.line([[x, y - r, z], [x - 0.6, 0.2, z + 1.2]], scene); return { g, x, y, z, str };
  });
  // 두 사람: 아이(작게)와 어른, 서로 마주 보다 풍선을 가리킴
  const A = K.person(scene, { x: -3.6, z: 1.0, rot: Math.PI * 0.7, coat: 0x55524e, hair: 'long', scale: 1.0 });
  const C = K.person(scene, { x: -1.7, z: 1.9, rot: -Math.PI * 0.8, coat: 0x9a968f, hair: 'cap', scale: 0.62 });
  cam.position.set(1.4, 0.9, 10.5); cam.lookAt(0.2, 3.4, -3);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    const s = 1 + 0.06 * Math.sin(ph); big.scale.set(s, s * 0.98 + 0.02, s); big.position.y = 3.6 + 0.12 * Math.sin(ph);
    fr.forEach((f, i) => { f.g.position.y = f.y + 0.25 * Math.sin(ph + i * 2); f.g.position.x = f.x + 0.15 * Math.cos(ph + i); f.g.rotation.z = 0.12 * Math.sin(ph + i); });
    trees.forEach((tr, i) => tr.update(ph, 0.04, i));
    const p = W(0.15, 0.7), q = W(0.45, 0.95);
    A.pose({ headYaw: 0.6 - 1.0 * q, headPitch: -0.35 * p, armR: { fwd: 2.3 * p, out: 0.2, point: true }, armL: { fwd: 0.2 } });
    C.pose({ headYaw: -0.5 + 0.9 * p, headPitch: -0.4, armL: { fwd: 2.0 * q, out: 0.3, point: true }, armR: { fwd: 0.3, elbow: 1.2 * q }, bob: 0.08 * Math.max(0, Math.sin(ph * 4)) * q });
  };
}
