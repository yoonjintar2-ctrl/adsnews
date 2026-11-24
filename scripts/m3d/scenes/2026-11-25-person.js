// 11/25 오늘의 광고인 양승춘(그래픽 디자이너) — 실존 인물이라 얼굴 없이 옆모습 실루엣
// 낮 대학 실기실 제도판 옆에서: 백발의 디자이너가 컴퍼스를 돌려 큰 원을 그리고, 원이 한 바퀴 이어진다.
// 창으로 바람이 들어 벽에 핀으로 꽂힌 스케치 종이가 들썩인다.
export const secs = 3;
export const meta = { place: '낮 대학 실기실 제도판 옆', where: 'indoor', time: 'day', camera: 'side', floor: 'wood', figures: 'solo-side', motion: ['compass-turn', 'circle-draw', 'sketch-flutter', 'curtain'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  const Rm = K.room(scene, { w: 22, d: 14, h: 9, wall: 'panel', wallColor: '#c4c1ba', floorStyle: 'wood', windowAt: [-6, 5, 4, 3] });
  // 제도판(기울어진 판)
  const board = new THREE.Group(); board.position.set(1.5, 3.2, -1); board.rotation.x = -0.7; scene.add(board);
  K.box(5, 3.4, 0.15, 0xf0eee8, 0, 0, 0, board);
  [[-2, -1.3], [2, -1.3]].forEach(([x]) => K.cyl(0.08, 0.08, 3.2, 0x333333, 1.5 + x, 1.6, -1.6, scene, 6));
  // 그려지는 원
  let ring = null; const rMat = K.flat(0x1a1a1a);
  const comp = new THREE.Group(); comp.position.set(0, 0, 0.12); board.add(comp);
  const leg1 = K.box(0.05, 0.05, 1.4, 0x222222, 0, 0, 0, comp); leg1.rotation.x = 0; leg1.position.set(0, 0.55, 0.55); leg1.rotation.x = -0.9;
  const leg2 = K.box(0.05, 1.2, 0.05, 0x222222, 0, 0.55, 0.3, comp);
  // 벽 스케치(핀 꽂힌 종이)
  const sheets = [[-2, 5.2], [-0.2, 5.8], [5.2, 5.4], [7, 6]].map(([x, y], i) => { const g = new THREE.Group(); g.position.set(x, y, -6.9); scene.add(g); const p = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.8), new THREE.MeshLambertMaterial({ color: 0xf6f4ee, side: THREE.DoubleSide })); p.position.y = -0.9; g.add(p); const c = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.42, 24), K.flat(0x333333)); c.position.set(0, -0.9, 0.01); g.add(c); return g; });
  // 디자이너(제도판을 향해, 화면 오른쪽에서 왼쪽을 봄)
  const P = K.person(scene, { x: 4.3, z: -1.0, rot: Math.PI / 2, coat: 0x8a8680, hair: 'short', hairC: 0xbcbcb6, scale: 1 });
  cam.position.set(2.6, 5.0, 8.2); cam.lookAt(2.4, 3.0, -1.3);
  return (t, ph) => {
    const u = ph / (Math.PI * 2);
    Rm.update(ph, 0.1);
    const draw = Math.min(1, Math.max(0.02, (u - 0.05) / 0.75));
    if (ring) { board.remove(ring); ring.geometry.dispose(); }
    ring = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.22, 64, 1, Math.PI / 2, Math.PI * 2 * draw * (u < 0.95 ? 1 : 0.02)), rMat); ring.position.z = 0.09; board.add(ring);
    comp.rotation.z = Math.PI * 2 * draw;
    sheets.forEach((g, i) => { g.rotation.x = Math.max(0, Math.sin(ph * 2 + i)) * 0.35; });
    const sw = Math.sin(ph * 2) * 0.15;
    P.pose({ headPitch: 0.45, lean: 0.25, armR: { fwd: 1.3 + sw, elbow: 0.5 }, armL: { fwd: 0.5, elbow: 1.4 } });
  };
}
