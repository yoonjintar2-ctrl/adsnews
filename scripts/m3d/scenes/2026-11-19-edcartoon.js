// 11/19 도안나 미니 사설 「똑똑한 안경일수록 평범하게 찍는다」
// 낮 안경점 전신 거울 앞, 어깨 너머 구도: 손님이 새 안경을 써 보며 테를 살짝 들어 올리고, 거울 속 모습이 같은 몸짓을 한다. 진열대 가격표 카드가 흔들리고 렌즈 위 반사광이 지나간다.
export const secs = 3;
export const meta = { place: '낮 안경점 전신 거울 앞', where: 'indoor', time: 'day', camera: 'ots', floor: 'carpet', figures: 'solo-front', motion: ['glasses-lift', 'mirror-echo', 'tag-swing', 'lens-glint'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.room(scene, { w: 16, d: 12, h: 7, wall: 'panel', wallColor: '#c4c1ba', floorStyle: 'carpet', windowAt: null });
  // 전신 거울: 테두리 + 옅은 유리
  [[0, 5.9, 3.4, 0.25], [0, 0.1, 3.4, 0.25]].forEach(([x, y, w, h]) => K.box(w, h, 0.3, 0x2c2c2c, x, y, -3.7, scene)); [-1.6, 1.6].forEach(x => K.box(0.25, 6.0, 0.3, 0x2c2c2c, x, 3.0, -3.7, scene)); K.box(2.6, 0.2, 1.2, 0x2c2c2c, 0, 0.1, -3.7, scene);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 5.6), K.lam(0xd4d6d6)); glass.position.set(0, 3.0, -3.53); scene.add(glass);
  // 진열대(왼쪽 벽) + 안경 모형 + 흔들리는 카드
  K.box(4, 0.2, 1.2, 0x5a544c, -5, 3.2, -4.2, scene); K.box(4, 0.2, 1.2, 0x5a544c, -5, 1.9, -4.2, scene);
  const mini = (x, y) => { const g = new THREE.Group(); g.position.set(x, y, -4); scene.add(g); [-0.22, 0.22].forEach(sx => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 6, 16), K.flat(0x1a1a1a)); r.position.x = sx; g.add(r); }); return g; };
  [[-6.2, 3.55], [-5.2, 3.55], [-4.2, 3.55], [-5.7, 2.25], [-4.6, 2.25]].forEach(([x, y]) => mini(x, y));
  const tags = [-6.0, -4.8, -3.8].map((x, i) => { const g = new THREE.Group(); g.position.set(x, 3.1, -3.55); scene.add(g); K.box(0.35, 0.5, 0.02, 0xeeeeea, 0, -0.3, 0, g); return g; });
  // 손님(뒷모습, 어깨 너머) + 거울 속 손님(카메라를 봄)
  const P = K.person(scene, { x: -0.9, z: -1.6, rot: 0, coat: 0x6b6760, hair: 'short', scale: 1.0 });
  const M = K.person(scene, { x: -0.9, z: -5.4, rot: Math.PI, coat: 0x6b6760, hair: 'short', scale: 1.0 });
  // 거울 속 사람은 유리 뒤: 유리를 반투명하게
  glass.material.transparent = true; glass.material.opacity = 0.35;
  
  const specs = (parent) => { const g = new THREE.Group(); g.position.set(0, 0.36, -0.4); parent.headG.add(g); [-0.15, 0.15].forEach(sx => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 6, 16), K.flat(0x111111)); r.position.x = sx; g.add(r); }); K.box(0.08, 0.02, 0.02, 0x111111, 0, 0, 0, g); return g; };
  const sP = specs(P), sM = specs(M);
  const glint = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.3), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })); M.headG.add(glint);
  cam.position.set(2.3, 4.2, 2.0); cam.lookAt(-0.5, 3.4, -5);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    const lift = W(0.2, 0.7);
    const pose = { headYaw: 0.15 * Math.sin(ph), headTilt: 0.08 * lift, armR: { fwd: 1.1 * lift + 0.15, elbow: 2.3 * lift, out: 0.15 * lift }, armL: { fwd: 0.15 } };
    P.pose(pose); M.pose(Object.assign({}, pose, { headYaw: -pose.headYaw, armR: { fwd: 0.15 }, armL: { fwd: 1.1 * lift + 0.15, elbow: 2.3 * lift, out: 0.15 * lift } }));
    sP.position.y = 0.36 + 0.06 * lift; sM.position.y = 0.36 + 0.06 * lift;
    tags.forEach((g, i) => { g.rotation.z = 0.25 * Math.sin(ph * 2 + i); });
    const u = ((ph / 6.283) * 1.0) % 1; glint.position.set(-0.3 + u * 0.6, 0.36 + 0.06 * lift, -0.43); glint.material.opacity = 0.9 * Math.sin(u * Math.PI);
  };
}
