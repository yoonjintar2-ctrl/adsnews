// 11/20 도안나 트렌드 「완성본 옆에 스케치를 붙이는 이유」
// 밤 제도 테이블을 바로 위에서: 반듯한 완성 포스터 옆으로 스케치 종이들이 차례로 밀려 나오고, 손이 연필로 원을 그린다. 지우개가 구른다.
export const secs = 3;
export const meta = { place: '밤 제도 테이블 위 스케치 더미', where: 'indoor', time: 'night', camera: 'top', floor: 'wood', figures: 'hands-only', motion: ['pencil-draw', 'paper-slide', 'eraser-roll'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  scene.background = new THREE.Color(0x3a3936);
  K.box(14, 0.4, 10, 0x8a7d6c, 0, -0.2, 0, scene); // 테이블
  const grid = K.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#d9d6cc'; g.fillRect(0, 0, w, h); g.strokeStyle = '#a8a59c'; g.lineWidth = 1; for (let i = 0; i <= w; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } });
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(12, 8.4), new THREE.MeshLambertMaterial({ map: grid })); mat.rotation.x = -Math.PI / 2; mat.position.y = 0.01; scene.add(mat);
  // 완성 포스터
  const poster = K.canvasTex(200, 280, (g, w, h) => { g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(100, 110, 60, 0, 7); g.fill(); g.fillRect(30, 205, 140, 14); g.fillRect(30, 230, 90, 8); g.fillRect(30, 246, 110, 8); });
  const P = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4.5), new THREE.MeshLambertMaterial({ map: poster })); P.rotation.x = -Math.PI / 2; P.position.set(2.8, 0.03, 0); scene.add(P); K.inked(P);
  // 스케치 종이들
  const sk = (seed) => K.canvasTex(160, 200, (g, w, h) => { g.fillStyle = '#f6f4ee'; g.fillRect(0, 0, w, h); g.strokeStyle = '#222'; g.setLineDash([6, 4]); g.lineWidth = 4; g.beginPath(); g.arc(80, 80, 30 + seed * 6, 0, 7); g.stroke(); g.setLineDash([]); g.lineWidth = 3; g.beginPath(); g.moveTo(25, 160 - seed * 4); g.quadraticCurveTo(80, 130, 135, 160); g.stroke(); });
  const papers = [0, 1, 2, 3].map(i => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.8), new THREE.MeshLambertMaterial({ map: sk(i) })); m.rotation.x = -Math.PI / 2; scene.add(m); return m; });
  // 연필 든 손
  const H = new THREE.Group(); scene.add(H);
  const pencil = K.cyl(0.07, 0.07, 1.8, 0xd8cf9a, 0, 0, 0, H, 6); pencil.rotation.z = 0.5;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.25, 6), K.lam(0x222222)); tip.position.set(-0.47, -0.84, 0); tip.rotation.z = 0.5 + Math.PI; H.add(tip);
  const fist = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), K.lam(0xb8b4ae)), 30); fist.position.set(0.15, 0.2, 0); H.add(fist);
  const arm = K.inked(new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 3, 4, 10), K.lam(0x5a5752)), 40); arm.rotation.x = Math.PI / 2; arm.position.set(0.3, 0.4, 1.8); H.add(arm);
  const eraser = K.box(0.5, 0.25, 0.3, 0xe8e2dc, -4.5, 0.13, 3, scene);
  // 스탠드 불빛 원
  const glow = new THREE.Mesh(new THREE.CircleGeometry(4.2, 40), new THREE.MeshBasicMaterial({ color: 0xfffbe8, transparent: true, opacity: 0.12 })); glow.rotation.x = -Math.PI / 2; glow.position.set(-1, 0.05, 0); scene.add(glow);
  K.shot(cam, 'top', [0, 0, 0], 9.5); cam.up.set(0, 0, -1); cam.position.set(0, 12, 0.01); cam.lookAt(0, 0, 0);
  return (t, ph) => {
    const u = ph / 6.2832;
    papers.forEach((m, i) => { const s = K.win(ph, i * 0.18, 0.6 + i * 0.08, 0.1); m.position.set(-1.0 - i * 0.7 - 1.2 * s, 0.02 + i * 0.002, -1.6 + i * 1.0 - 0.2 * s); m.rotation.z = (i - 1.5) * 0.12 + 0.1 * s; });
    H.position.set(-1.6 + Math.cos(ph * 2) * 0.5, 0.9, -0.4 + Math.sin(ph * 2) * 0.5);
    eraser.position.x = -4.5 + 0.6 * Math.sin(ph); eraser.rotation.x = Math.sin(ph) * 2;
    glow.material.opacity = 0.1 + 0.03 * Math.sin(ph * 3);
  };
}
