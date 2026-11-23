// 11/24 오늘의 광고인 허브 루발린 — 「글자를 읽히는 것에서 보이는 것으로 바꾼 사람」
// 흐린 오후 오래된 활판 인쇄소 조판대를 낮은 눈높이에서: 굵은 기하 글자 블록 셋(원·삼각·고리, 실제 서체 아님)이 서로 다가가 맞물렸다 떨어지고,
// 옆모습 인물(얼굴 세부 없음)이 몸을 숙여 블록을 밀어 넣고 고개를 끄덕인다. 잉크 롤러가 오간다.
export const secs = 3;
export const meta = { place: '흐린 오후 활판 인쇄소 조판대', where: 'indoor', time: 'overcast', camera: 'low', floor: 'plain', figures: 'solo-side', motion: ['blocks-interlock', 'ink-roller', 'nod-push'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'overcast' });
  K.room(scene, { w: 22, d: 14, h: 9, wall: 'panel', wallColor: '#a8a59e', floorStyle: 'plain', windowAt: [5, 5, 4, 3], curtain: false });
  // 활자 서랍장(뒤 벽)
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) K.box(1.1, 0.5, 0.6, 0x6a625a, -8 + c * 1.2, 1 + r * 0.6, -6.4, scene);
  // 조판대
  K.box(9, 0.3, 3.4, 0x5e564e, 0, 2.2, 0, scene); K.box(8.6, 2.0, 3.0, 0x4a443e, 0, 1.0, 0, scene);
  // 글자 블록: 큰 고리(토러스), 원기둥 'O', 삼각 'A'
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.28, 12, 32), K.lam(0x2a2a28)); scene.add(K.inked(ring, 40));
  const oo = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.32, 12, 32), K.lam(0x5a5a56)); scene.add(K.inked(oo, 40));
  const tri = new THREE.Mesh(new THREE.ConeGeometry(1.0, 2.0, 3), K.lam(0x8a8680)); scene.add(K.inked(tri, 40));
  // 잉크 롤러
  const roll = new THREE.Group(); scene.add(roll); const rc = K.cyl(0.25, 0.25, 1.4, 0x222222, 0, 0, 0, roll, 14); rc.rotation.x = Math.PI / 2; K.box(0.1, 1.0, 0.1, 0x6a5a4a, 0, 0.5, 0, roll);
  // 옆모습 인물(조판대 오른쪽)
  const P = K.person(scene, { x: 4.7, z: 0.4, rot: -Math.PI / 2, coat: 0x6e6a64, hair: 'short', scale: 1.05 });
  cam.position.set(0.2, 1.9, 9.0); cam.lookAt(0.6, 3.4, 0);
  return (t, ph) => {
    const k = K.win(ph, 0.25, 0.7, 0.15);   // 맞물림
    ring.position.set(-2.4 + k * 0.9, 3.4, 0.2); ring.rotation.set(0, 0.3 + Math.sin(ph) * 0.1, 0);
    oo.position.set(0.2 - k * 0.5, 3.35 + 0.15 * Math.sin(ph * 2), 0.1); oo.rotation.set(0, -0.2, 0.2 * k);
    tri.position.set(2.4 - k * 0.7, 3.4, 0.1); tri.rotation.set(0, 0.5, -0.15 * k);
    roll.position.set(-3 + 2.2 * (0.5 - 0.5 * Math.cos(ph)), 2.55, 1.2);
    P.pose({ lean: 0.28 + 0.1 * k, headPitch: 0.25 + 0.12 * Math.sin(ph * 4) * k, armR: { fwd: 1.2 + 0.3 * k, elbow: 0.4 }, armL: { fwd: 1.0 + 0.2 * k, elbow: 0.6 } });
  };
}
