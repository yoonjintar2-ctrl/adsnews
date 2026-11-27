// 11/28 오늘의 광고인 에이브럼 게임스(포스터 디자이너) — 실존 인물이라 얼굴 없이 비스듬한 옆 실루엣
// 흐린 날 오래된 지하철 승강장 벽: 디자이너가 긴 솔로 포스터(원 하나·굵은 사선·화살표, 글자 없음)를 벽에 쓸어 붙인다.
// 아래 귀퉁이가 바람에 들썩이고 벽시계 초침이 돈다. 선로 너머 신호등이 깜박인다.
export const secs = 3;
export const meta = { place: '흐린 날 옛 지하철 승강장 포스터 벽', where: 'indoor', time: 'overcast', camera: 'side', floor: 'plain', figures: 'solo-side', motion: ['brush-sweep', 'poster-corner-flap', 'clock-hand', 'signal-blink', 'head-nod'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  scene.background = new THREE.Color(0x9a9b99); if (scene.fog) scene.fog.color = new THREE.Color(0x9a9b99);
  K.floor(scene, { style: 'plain', color: '#a8a7a2' });
  // 승강장 바닥 단 + 선로 홈
  K.box(30, 1.2, 8, 0xb6b4ae, 0, 0.6, -2, scene); K.box(30, 0.2, 0.5, 0xe8e6e0, 0, 1.25, 1.8, scene);
  // 벽(뒤, 아치 터널 느낌의 둥근 천장 일부)
  const wallTex = K.canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#c8c6c0'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, h * 0.62, w, 10); });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), new THREE.MeshLambertMaterial({ map: wallTex })); wall.position.set(0, 7.2, -6); scene.add(wall);
  const vault = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 12, 24, 1, true, Math.PI * 1.5 - 0.6, 1.2), new THREE.MeshLambertMaterial({ color: 0xbdbbb5, side: THREE.DoubleSide })); vault.rotation.z = Math.PI / 2; vault.position.set(0, 2, -1); scene.add(vault);
  // 포스터
  const pTex = K.canvasTex(256, 360, (g, w, h) => { g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#6a6a68'; g.beginPath(); g.arc(w * 0.45, h * 0.34, 62, 0, 7); g.fill();
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.moveTo(0, h * 0.9); g.lineTo(w, h * 0.42); g.lineTo(w, h * 0.52); g.lineTo(0, h); g.fill();
    g.beginPath(); g.moveTo(w * 0.55, h * 0.78); g.lineTo(w * 0.8, h * 0.74); g.lineTo(w * 0.78, h * 0.68); g.lineTo(w * 0.92, h * 0.78); g.lineTo(w * 0.8, h * 0.88); g.lineTo(w * 0.8, h * 0.82); g.lineTo(w * 0.56, h * 0.86); g.fillStyle = '#f2f0ea'; g.fill(); g.strokeStyle = '#1a1a1a'; g.lineWidth = 4; g.stroke(); });
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 5, 6, 8), new THREE.MeshLambertMaterial({ map: pTex, side: THREE.DoubleSide })); poster.position.set(-1.0, 5.6, -5.85); scene.add(poster); K.box(3.9, 5.3, 0.08, 0x2a2a2a, -1.0, 5.6, -5.95, scene);
  const P0 = poster.geometry.attributes.position.array.slice();
  // 옆 포스터 틀 두 개(비어 있음)
  [-6.5, 4.5].forEach(x => { K.box(3.8, 5.2, 0.1, 0x3a3a3a, x, 5.6, -5.95, scene); K.box(3.5, 4.9, 0.12, 0xd8d6d0, x, 5.6, -5.92, scene); });
  // 벽시계(벽에 붙은)
  const clock = new THREE.Group(); clock.position.set(8.5, 8.6, -5.85); scene.add(clock);
  K.cyl(0.9, 0.9, 0.15, 0xeeeeea, 0, 0, 0, clock, 24).rotation.x = Math.PI / 2;
  const hand = K.box(0.06, 0.75, 0.04, 0x1a1a1a, 0, 0.35, 0.12, null); const hp = new THREE.Group(); hp.position.z = 0.0; hp.add(hand); clock.add(hp);
  K.box(0.08, 0.5, 0.04, 0x1a1a1a, 0, 0.22, 0.1, clock);
  // 신호등
  const sig = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), K.flat(0xf2f0ea)); sig.position.set(12, 3.2, 2.6); scene.add(sig); K.box(0.5, 1.2, 0.4, 0x222222, 12, 3.2, 2.4, scene);
  // 디자이너(벽을 향해, 비스듬한 옆모습) — 얼굴은 어둡게
  const D = K.person(scene, { x: 1.4, z: -3.8, rot: 0.5, coat: 0x3a3a3a, skin: 0x5a5856, hair: 'short', hairC: 0x2a2a2a, scale: 1.0 });
  D.root.position.y = 1.2;
  const brush = new THREE.Group(); scene.add(brush);
  K.cyl(0.05, 0.05, 2.4, 0x5a4e42, 0, 1.2, 0, brush, 6); K.box(0.9, 0.3, 0.2, 0x2a2a2a, 0, 2.5, 0, brush);
  const bucket = K.cyl(0.45, 0.38, 0.8, 0x6a6a68, 3.2, 1.6, -3.4, scene, 14);
  cam.position.set(9.5, 5.2, 4.5); cam.lookAt(-0.6, 4.6, -4.6);
  return (t, ph) => {
    const sw = Math.sin(ph * 2);
    D.pose({ bob: 1.2, headPitch: -0.15 + sw * 0.05, headYaw: 0.2, lean: 0.05, armR: { fwd: 2.1 + sw * 0.35, out: -0.25, elbow: 0.3 }, armL: { fwd: 0.4, elbow: 1.2 } });
    brush.position.set(-0.6 + sw * 0.6, 3.6 + sw * 1.2, -5.6); brush.rotation.z = 0.35 + sw * 0.25;
    const a = poster.geometry.attributes.position; for (let i = 0; i < a.count; i++) { const x = P0[i * 3], y = P0[i * 3 + 1]; const k = Math.max(0, (-y - 1.2) / 1.3) * Math.max(0, (x + 0.6) / 1.2); a.setZ(i, k * (0.35 + 0.25 * Math.sin(ph * 3))); } a.needsUpdate = true;
    hp.rotation.z = -ph;
    sig.material.color.setScalar(Math.sin(ph * 4) > 0 ? 1 : 0.35);
  };
}
