// 11/28 금로동 사설 「상은 두 번 받았다, 이제 광고가 답할 차례」
// 비 오는 밤 버스 정류장 유리 쉘터를 낮은 눈높이에서: 두 사람이 옆 벽 광고판(웃는 동그라미, 글자 없음)을 가리키며 웃고,
// 벤치 위엔 아무도 보지 않는 트로피 하나. 광고판 불빛이 깜박이고 빗줄기가 내린다.
export const secs = 3;
export const meta = { place: '비 오는 밤 버스 정류장 유리 쉘터', where: 'outdoor', time: 'night', camera: 'low', floor: 'asphalt', figures: 'two-facing', motion: ['rain', 'point-laugh', 'lightbox-flicker', 'head-turn'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'night', moon: true, stars: 18 });
  K.floor(scene, { style: 'asphalt' });
  // 보도 턱
  K.box(40, 0.3, 6, 0x9a9a96, 0, 0.15, -1, scene);
  // 쉘터: 지붕·기둥·뒤 유리
  K.box(9, 0.25, 3.2, 0x2a2a2a, 0, 6.2, -1.2, scene);
  [[-4.3, -2.6], [4.3, -2.6], [-4.3, 0.2], [4.3, 0.2]].forEach(([x, z]) => K.cyl(0.1, 0.1, 6, 0x333333, x, 3.2, z, scene, 8));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 4.6), new THREE.MeshLambertMaterial({ color: 0xcfd2d0, transparent: true, opacity: 0.35 })); glass.position.set(0, 3.0, -2.65); scene.add(glass);
  // 옆 광고판(라이트박스)
  const tex = K.canvasTex(256, 384, (g, w, h) => { g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h); g.lineWidth = 12; g.strokeStyle = '#1a1a1a';
    g.beginPath(); g.arc(w / 2, h * 0.38, 70, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(w / 2, h * 0.4, 38, 0.2, Math.PI - 0.2); g.stroke();
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(w / 2 - 25, h * 0.33, 9, 0, 7); g.arc(w / 2 + 25, h * 0.33, 9, 0, 7); g.fill();
    g.beginPath(); g.moveTo(30, h * 0.8); for (let x = 30; x <= w - 30; x += 8) g.lineTo(x, h * 0.8 + Math.sin(x / 18) * 14); g.stroke(); });
  const lbMat = new THREE.MeshBasicMaterial({ map: tex });
  const lb = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.6), lbMat); lb.rotation.y = -Math.PI / 2; lb.position.set(4.15, 3.2, -1.2); scene.add(lb);
  K.box(0.25, 4.0, 2.8, 0x222222, 4.35, 3.2, -1.2, scene);
  // 벤치 + 트로피
  K.bench(scene, { x: -2.2, z: -1.9 });
  const tro = new THREE.Group(); tro.position.set(-3.0, 1.0, -1.7); scene.add(tro);
  K.cyl(0.35, 0.35, 0.18, 0x333333, 0, 0.09, 0, tro, 12); K.cyl(0.08, 0.08, 0.5, 0x8a8a86, 0, 0.42, 0, tro, 8); K.cyl(0.42, 0.14, 0.6, 0xdcdcd6, 0, 0.95, 0, tro, 14);
  // 두 사람: 광고판(+x)을 향해
  const A = K.person(scene, { x: 1.2, z: -0.4, rot: -Math.PI / 2, coat: 0x8a8680, hair: 'short', scale: 0.9 });
  const B = K.person(scene, { x: -0.6, z: 0.6, rot: -Math.PI / 2 + 0.3, coat: 0x55534f, hair: 'long', scale: 0.85 });
  K.streetLamp(scene, { x: -7, z: 0.5, h: 6.5 });
  const R = K.weather(scene, { kind: 'rain', n: 140, box: [26, 12, 12], z0: 1 });
  cam.position.set(-1.5, 0.9, 9.5); cam.lookAt(0.8, 3.0, -0.8);
  return (t, ph) => {
    R.update(ph);
    const f = 0.85 + 0.15 * Math.max(0, Math.sin(ph * 9)) * K.win(ph, 0.55, 0.75, 0.05);
    lbMat.color.setScalar(f);
    const p = K.win(ph, 0.12, 0.8, 0.1), laugh = Math.abs(Math.sin(ph * 6)) * p;
    A.pose({ headYaw: -0.2 + K.win(ph, 0.5, 0.75, 0.08) * 1.2, headPitch: -0.1 - laugh * 0.12, lean: -laugh * 0.08, bob: laugh * 0.05,
      armR: { fwd: 0.3 + p * 1.25, out: 0.1, elbow: 0.15, point: p > 0.3 }, armL: { fwd: 0.4 + laugh * 0.8, elbow: 1.9 * laugh } });
    const turn = K.win(ph, 0.35, 0.95, 0.1);
    B.pose({ headYaw: 0.6 - turn * 0.9, headPitch: -0.05, bob: Math.abs(Math.sin(ph * 6 + 1)) * turn * 0.05,
      armL: { fwd: 0.3 + turn * 1.6, elbow: 2.1 * turn }, armR: { fwd: 0.2, elbow: 0.3 } });
  };
}
