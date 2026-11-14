// 11/15 도안나 트렌드 #이종협업 — 가방에 붓질하는 화가와 루페를 든 세공사
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#b6b6b0', tiles: 5 });
  K.box(40, 20, 1, 0xa6a6a0, 0, 10, -8, scene);
  K.box(10, 0.4, 3.6, 0x5a5a58, 0, 2.8, -3, scene); [-4.6, 4.6].forEach(x => K.box(0.4, 2.8, 3.2, 0x3a3a38, x, 1.4, -3, scene));
  // 캐리어(붓질 무늬가 점점 늘어남)
  const strokes = K.canvasTex(256, 320, (g, w, h) => { g.fillStyle = '#d8d8d2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#9a9a96'; g.lineWidth = 3; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke(); }
    g.strokeStyle = '#ffffff'; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(30, 90); g.bezierCurveTo(90, 40, 160, 140, 226, 80); g.stroke(); g.beginPath(); g.moveTo(40, 220); g.bezierCurveTo(110, 270, 170, 180, 220, 240); g.stroke(); });
  const suit = K.box(2.4, 3.0, 1.2, new THREE.MeshLambertMaterial({ map: strokes }), -1.6, 4.5, -3, scene);
  K.box(1.0, 0.25, 0.3, 0x222222, -1.6, 6.2, -3, scene);
  // 화장품 병 + 회전하는 보석
  K.cyl(0.5, 0.5, 1.6, 0x8a8a86, 1.8, 3.8, -3, scene, 14); K.cyl(0.3, 0.3, 0.5, 0x222222, 1.8, 4.85, -3, scene, 10);
  const gem = K.inked(new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), K.lam(0xf4f4f0)), 10); gem.position.set(1.8, 6.0, -3); scene.add(gem);
  const lamps = [-3, 3].map(x => { const g = new THREE.Group(); g.position.set(x, 13, -3); scene.add(g); K.line([[0, 0, 0], [0, -2.6, 0]], g); K.cyl(0.3, 1.0, 0.6, 0x1a1a1a, 0, -2.9, 0, g, 14); return g; });
  const A = K.person(scene, { x: -6.0, z: -1.2, rot: -2.0, coat: 0xe0e0da, hair: 'bun', scale: 1.0 });
  const B = K.person(scene, { x: 6.0, z: -1.2, rot: 2.0, coat: 0x2e2e2e, scale: 1.0 });
  const brush = K.cyl(0.05, 0.05, 1.4, 0x222222, 0, 0, 0, scene, 6);
  const loupe = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.06, 6, 18), K.flat(0x111111)); scene.add(loupe);
  cam.position.set(0, 6.0, 14.5); cam.lookAt(0, 4.4, -3);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    lamps.forEach((g, i) => { g.rotation.z = Math.sin(ph + i * 1.4) * 0.15; }); gem.rotation.y = ph; gem.position.y = 6.0 + Math.sin(ph * 2) * 0.15;
    const paint = Math.sin(ph * 4);
    brush.position.set(-2.9 + paint * 0.4, 4.6 + Math.cos(ph * 4) * 0.5, -2.4); brush.rotation.z = 0.8 + paint * 0.2;
    loupe.position.set(2.7, 5.6 + 0.3 * W(0.3, 0.8), -2.2); loupe.rotation.y = 1.0;
    const sur = W(0.55, 0.95);
    A.pose({ lean: 0.08, headYaw: 0.9 * sur, headPitch: -0.1, armR: { fwd: 1.6 + paint * 0.25, out: -0.3, elbow: 0.4 }, armL: { fwd: 0.4 + 1.2 * sur, elbow: 1.8 * sur } });
    B.pose({ lean: 0.1, headPitch: 0.1, headYaw: -0.8 * sur, armL: { fwd: 1.9, elbow: 0.8, out: 0.1 }, armR: { fwd: 0.5 + 1.8 * sur, out: -0.2 * sur, point: sur > 0.4 } });
  };
}
