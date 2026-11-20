// 11/21 오늘의 광고인 쥘 셰레(도안나 그림)
// 해 질 녘 옛 파리풍 보도, 옆에서 본 구도: 둥근 광고 기둥에 춤추는 인물 포스터(글자 없음)가 붙어 있고, 작업복 차림 사람(옆모습)이 긴 솔로 새 포스터를 문질러 붙인다. 덜 붙은 포스터 귀퉁이가 바람에 펄럭이고 낙엽이 날린다. 가로등이 켜진다.
export const secs = 3;
export const meta = { place: '해 질 녘 파리풍 보도의 둥근 광고 기둥', where: 'outdoor', time: 'sunset', camera: 'side', floor: 'asphalt', figures: 'solo-side', motion: ['brush-stroke', 'poster-flap', 'leaves', 'lamp-on'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'sunset', sun: true, clouds: 2 });
  K.floor(scene, { style: 'asphalt' });
  K.box(30, 0.3, 6, 0x9a978f, 0, 0.15, -1, scene); // 보도
  // 광고 기둥 + 포스터 텍스처
  const tex = K.canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#d9d5cb'; g.fillRect(0, 0, w, h);
    const fig = (x, y, s, f) => { g.fillStyle = '#222'; g.beginPath(); g.arc(x, y, 18 * s, 0, 7); g.fill();
      g.beginPath(); g.moveTo(x - 10 * s, y + 20 * s); g.lineTo(x + 10 * s, y + 20 * s); g.lineTo(x + 60 * s * f, y + 150 * s); g.lineTo(x - 50 * s * f, y + 150 * s); g.closePath(); g.fillStyle = '#555'; g.fill();
      g.lineWidth = 10 * s; g.strokeStyle = '#222'; g.beginPath(); g.moveTo(x, y + 30 * s); g.lineTo(x - 50 * s, y - 30 * s); g.moveTo(x, y + 30 * s); g.lineTo(x + 55 * s, y - 10 * s); g.stroke();
      g.fillStyle = '#888'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x - 70 * s + i * 28 * s, y - 50 * s + (i % 2) * 20 * s, 6 * s, 0, 7); g.fill(); } };
    fig(130, 140, 1, 1); fig(380, 170, 0.9, -1); g.fillStyle = '#333'; g.fillRect(40, 440, 432, 26); g.fillRect(70, 476, 372, 12); });
  const col = K.cyl(1.6, 1.6, 6, new THREE.MeshLambertMaterial({ map: tex }), 0, 3.3, -2, scene, 28);
  K.cyl(1.8, 1.8, 0.3, 0x3a3a3a, 0, 6.4, -2, scene, 24); const dome = new THREE.Mesh(new THREE.SphereGeometry(1.7, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), K.lam(0x4a4a48)); dome.position.set(0, 6.5, -2); scene.add(dome);
  K.cyl(1.75, 1.8, 0.4, 0x3a3a3a, 0, 0.5, -2, scene, 24);
  // 펄럭이는 새 포스터 한 장(기둥 오른쪽 면)
  const pg = new THREE.Group(); pg.position.set(1.62, 4.6, -2); scene.add(pg);
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2, 8, 8), new THREE.MeshLambertMaterial({ color: 0xece8de, side: THREE.DoubleSide })); sheet.position.set(0, -1.1, 0.8); sheet.rotation.y = Math.PI / 2; pg.add(sheet);
  // 사람(오른쪽에서 기둥을 향함) + 긴 솔
  const P = K.person(scene, { x: 3.4, z: -1.8, rot: Math.PI / 2, coat: 0x5a5856, hair: 'cap', scale: 1.0 }); P.root.position.y = 0.3;
  const brush = new THREE.Group(); scene.add(brush); K.cyl(0.04, 0.04, 2.2, 0x6a5f52, 0, 1.1, 0, brush, 6); K.box(0.5, 0.18, 0.18, 0x2a2a2a, 0, 2.25, 0, brush);
  const bucket = K.cyl(0.35, 0.3, 0.6, 0x7a7874, 4.4, 0.6, -0.8, scene, 12);
  const lampBulb = K.streetLamp(scene, { x: -5.5, z: -1.5, h: 6 });
  const lv = K.weather(scene, { kind: 'leaves', n: 26, box: [18, 9, 6], z0: -0.5 });
  cam.position.set(1.0, 3.4, 13.5); cam.lookAt(1.0, 3.2, -2);
  return (t, ph) => {
    const st = 0.5 + 0.5 * Math.sin(ph * 2);
    P.pose({ headPitch: -0.25, armR: { fwd: 2.0 + 0.5 * st, elbow: 0.5 }, armL: { fwd: 1.8 + 0.5 * st, elbow: 0.7 } });
    brush.position.set(2.15, 2.4 + 1.1 * st, -1.85); brush.rotation.z = 0.35;
    const p = sheet.geometry.attributes.position; for (let k = 0; k < p.count; k++) { const yy = p.getY(k); const f = Math.max(0, -yy - 0.2); p.setZ(k, Math.sin(ph * 2 + p.getX(k) * 2) * 0.35 * f); } p.needsUpdate = true;
    lv.update(ph);
    lampBulb.material.color.setScalar(K.win(ph, 0.35, 0.95, 0.15) > 0.5 ? 0.98 : 0.55);
  };
}
