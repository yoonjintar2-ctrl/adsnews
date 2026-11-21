// 11/22 안광주 미니 사설 「햄버거 영수증 한 장에 성적표가 두 개」(그림 도안나)
// 낮 패스트푸드점 카운터, 높은 곳에서 내려다본 구도: 카운터 위 프린터에서 영수증이 길게 나오고,
// 양쪽의 두 사람이 각자 들고 있는 다른 그래프(막대/꺾은선) 화면을 보다가 서로 고개를 돌려 마주 본다. 쟁반 위 컵 김이 오른다.
export const secs = 3;
export const meta = { place: '낮 패스트푸드점 카운터 영수증 프린터', where: 'indoor', time: 'day', camera: 'high', floor: 'carpet', figures: 'two-side', motion: ['receipt-print', 'heads-turn', 'tablet-tilt', 'steam'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  const Rm = K.room(scene, { w: 22, d: 14, h: 9, wall: 'panel', wallColor: '#b4b0a8', floorStyle: 'carpet', windowAt: [-6, 5, 4, 3] });
  // 카운터
  K.box(10, 2.6, 2.2, 0x6a645e, 0, 1.3, -1.5, scene); K.box(10.4, 0.18, 2.6, 0x3a3836, 0, 2.7, -1.5, scene);
  // 프린터 + 영수증 띠
  K.box(1.2, 0.6, 1.0, 0x2a2a2a, 0, 3.1, -1.9, scene);
  const rc = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1), new THREE.MeshLambertMaterial({ color: 0xf6f4ee, side: THREE.DoubleSide })); scene.add(rc);
  const lines = []; for (let i = 0; i < 8; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.04), K.flat(0x555555)); scene.add(l); lines.push(l); }
  // 쟁반·컵·버거
  K.box(2.2, 0.08, 1.4, 0x8a8480, -2.6, 2.84, -1.2, scene); const cup = K.cyl(0.3, 0.24, 0.8, 0xeeeeea, -3.1, 3.28, -1.3, scene, 14);
  K.cyl(0.42, 0.42, 0.18, 0x9a8a70, -2.1, 2.98, -1.1, scene, 14); K.cyl(0.44, 0.44, 0.12, 0x444444, -2.1, 3.12, -1.1, scene, 14); K.cyl(0.42, 0.38, 0.2, 0xb8a888, -2.1, 3.28, -1.1, scene, 14);
  const steam = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf6f6f2, transparent: true })); scene.add(m); return m; });
  // 두 사람(카운터 앞, 각자 태블릿)
  const gtex = (kind) => K.canvasTex(256, 192, (g, w, h) => { g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h); g.strokeStyle = '#222'; g.fillStyle = '#333'; g.lineWidth = 8;
    if (kind) { [50, 80, 120, 150].forEach((v, i) => g.fillRect(30 + i * 52, h - 20 - v * 0.9, 34, v * 0.9)); } else { g.beginPath(); g.moveTo(20, 160); g.lineTo(80, 110); g.lineTo(140, 130); g.lineTo(230, 30); g.stroke(); } });
  const mk = (x, rot, coat, hair, kind) => { const P = K.person(scene, { x, z: 1.2, rot, coat, hair, scale: 1.0 });
    const tab = new THREE.Group(); scene.add(tab); K.box(1.3, 1.0, 0.08, 0x1e1e1e, 0, 0, 0, tab); const s = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.85), K.flat(0xffffff)); s.material = new THREE.MeshBasicMaterial({ map: gtex(kind) }); s.position.z = 0.05; tab.add(s);
    return { P, tab }; };
  const A = mk(-2.4, 0.15, 0x5a5a58, 'short', 1), B = mk(2.4, -0.15, 0x9a9690, 'bun', 0);
  cam.position.set(0.5, 13.5, 9.5); cam.lookAt(0, 2.4, -0.6);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    const u = ((ph / 6.2832) % 1);
    const len = 0.6 + 2.2 * u;   // 영수증이 점점 길어짐 → 끝에 찢어 원래대로
    rc.scale.y = len; rc.position.set(0, 3.0 - 0.02, -1.35 + 0.0); rc.rotation.x = -Math.PI / 2 + 0.25; rc.position.z = -1.35 + len * 0.45; rc.position.y = 2.95 - len * 0.1;
    lines.forEach((l, i) => { const k = i / 8; l.visible = k * 2.8 < len; l.rotation.x = rc.rotation.x; l.position.set(0, rc.position.y + 0.012, -1.35 + k * 2.8 * 0.92 + 0.15); });
    const look = W(0.45, 0.8);
    A.P.pose({ headYaw: -0.9 * look, headPitch: 0.35 * (1 - look), armL: { fwd: 1.1, elbow: 1.2, out: -0.1 }, armR: { fwd: 1.1, elbow: 1.2, out: -0.1 } });
    B.P.pose({ headYaw: 0.9 * look, headPitch: 0.35 * (1 - look), armL: { fwd: 1.1, elbow: 1.2, out: -0.1 }, armR: { fwd: 1.1, elbow: 1.2, out: -0.1 } });
    A.tab.position.set(-2.4 + 0.1, 3.3, 0.4); A.tab.rotation.set(-0.6 + 0.1 * Math.sin(ph), 0.15, 0);
    B.tab.position.set(2.4 - 0.1, 3.3, 0.4); B.tab.rotation.set(-0.6 + 0.1 * Math.cos(ph), -0.15, 0);
    steam.forEach((m, i) => { const v = ((u * 2 + i / 3) % 1); m.position.set(-3.1 + Math.sin(ph * 2 + i) * 0.1, 3.8 + v * 1.2, -1.3); m.material.opacity = 0.8 * (1 - v); m.scale.setScalar(1 + v); });
    Rm.update(ph, 0.1);
  };
}
