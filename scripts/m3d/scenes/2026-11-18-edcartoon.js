// 11/18 도안나 미니 사설 「추운 정류장에 '촉촉함'을 거는 법」
// 눈 오는 밤 버스 셸터, 어깨 너머 구도: 목도리 두른 사람 어깨 너머로 빛나는 세럼 포스터, 맞은편 친구가 몸을 돌려 포스터를 가리킨다. 눈이 내리고 포스터 빛이 숨 쉬듯 밝아진다.
export const secs = 3;
export const meta = { place: '눈 오는 밤 버스 셸터', where: 'outdoor', time: 'night', camera: 'ots', floor: 'asphalt', figures: 'two-facing', motion: ['snow', 'poster-glow', 'point', 'breath-puff'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'night', stars: 10 });
  K.floor(scene, { style: 'asphalt' });
  K.box(40, 0.25, 5, 0x9a9894, 0, 0.12, -3, scene);
  // 셸터: 지붕 + 기둥 + 뒤 유리 + 포스터 박스
  K.box(9, 0.3, 3.2, 0x2a2a2a, 0, 4.6, -3.6, scene);
  [-4.3, 4.3].forEach(x => K.box(0.2, 4.5, 0.2, 0x333333, x, 2.3, -4.9, scene));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(5, 3.6), new THREE.MeshLambertMaterial({ color: 0x9fa2a3, transparent: true, opacity: 0.5 })); glass.position.set(-1.5, 2.4, -5.0); scene.add(glass);
  K.box(3.0, 4.0, 0.4, 0x222222, 2.6, 2.4, -5.0, scene);
  const tex = K.canvasTex(256, 340, (g, w, h) => { g.fillStyle = '#e9e6de'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2a2a'; g.fillRect(w / 2 - 28, 150, 56, 130); g.fillRect(w / 2 - 12, 118, 24, 34); g.beginPath(); g.ellipse(w / 2, 112, 22, 14, 0, 0, 7); g.fill();
    g.strokeStyle = '#555'; g.lineWidth = 5; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * 80, 210 + Math.sin(a) * 80); g.lineTo(w / 2 + Math.cos(a) * 110, 210 + Math.sin(a) * 110); g.stroke(); }
    g.fillStyle = '#2a2a2a'; [[60, 60], [190, 80], [70, 300]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 9, 13, 0, 0, 7); g.fill(); }); });
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.5), new THREE.MeshBasicMaterial({ map: tex })); poster.position.set(2.6, 2.4, -4.78); scene.add(poster);
  K.bench(scene, { x: -1.6, z: -4.2 });
  // 친구(맞은편, 카메라 쪽을 보며 포스터를 가리킴)
  const F = K.person(scene, { x: 0.4, z: -2.6, rot: Math.PI * 0.85, coat: 0x8a8782, hair: 'bun', scale: 1.0 });
  // 앞사람(어깨 너머, 뒷모습)
  const B = K.person(scene, { x: -3.2, z: 2.0, rot: 0.3, coat: 0x3e3c3a, hair: 'short', scale: 1.05 });
  const scarf = K.cyl(0.62, 0.62, 0.35, 0x6e6a64, 0, 1.45, 0, B.torso, 16);
  const puff = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshBasicMaterial({ color: 0xf2f2ee, transparent: true, opacity: 0.6 })); scene.add(puff);
  const snow = K.weather(scene, { kind: 'snow', n: 150, box: [26, 9, 14], z0: -1 });
  cam.position.set(-3.6, 4.4, 6.6); cam.lookAt(1.2, 2.6, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    snow.update(ph);
    const g = 0.85 + 0.15 * Math.sin(ph); poster.material.color.setScalar(g);
    const pt = W(0.2, 0.8);
    F.pose({ headYaw: -0.9 * pt, torsoYaw: -0.3 * pt, armR: { fwd: 1.5 * pt, out: 0.5 * pt, point: true }, armL: { fwd: 0.2 } });
    B.pose({ headYaw: 0.35 + 0.25 * W(0.35, 0.9), headPitch: -0.05, armL: { fwd: 0.1 }, armR: { fwd: 0.1 } });
    const u = (ph / (Math.PI * 2) * 2) % 1; puff.position.set(0.2 - u * 0.4, 3.7 + u * 0.5, -2.3 + u * 0.3); puff.scale.setScalar(0.5 + u * 1.4); puff.material.opacity = 0.6 * (1 - u);
  };
}
