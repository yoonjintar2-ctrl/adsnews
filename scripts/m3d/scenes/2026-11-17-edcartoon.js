// 11/17 도안나 미니 사설 「두꺼비에게 산타 옷을 입히면 생기는 일」 — 새로 그리지 않고 옷만 갈아입힌다
// 책상 위를 높은 곳에서 비스듬히 내려다본 구도: 동그란 캐릭터 인형(가상의 캐릭터)에 두 손이 작은 산타 모자를 씌우고,
// 옆 스케치북 위 같은 얼굴 그림 석 장에 모자·뿔·목도리만 다르게 그려져 있다. 연필이 굴러가고 종이 귀가 들린다.
export const secs = 3;
export const meta = { place: '디자이너 책상 위(내려다봄)', where: 'indoor', time: 'day', camera: 'high', floor: 'wood', figures: 'hands-only', motion: ['hat-placing', 'pencil-roll', 'page-curl'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  scene.background = new THREE.Color(0x9a958e);
  K.floor(scene, { style: 'wood', color: '#a59a88', size: 60 });
  // 스케치북 석 장: 같은 얼굴 + 다른 옷(모자/뿔/목도리) — 글자 없음
  const draw = (kind) => K.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h); g.strokeStyle = '#222'; g.lineWidth = 6;
    g.beginPath(); g.arc(128, 140, 70, 0, 7); g.stroke(); g.fillStyle = '#222'; g.beginPath(); g.arc(102, 130, 8, 0, 7); g.arc(154, 130, 8, 0, 7); g.fill(); g.beginPath(); g.arc(128, 160, 22, 0.2, Math.PI - 0.2); g.stroke();
    if (kind === 0) { g.beginPath(); g.moveTo(70, 90); g.lineTo(128, 20); g.lineTo(186, 90); g.closePath(); g.stroke(); g.beginPath(); g.arc(128, 20, 10, 0, 7); g.stroke(); }
    if (kind === 1) { [[90, 80, 60, 20], [166, 80, 196, 20]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.moveTo((a + c) / 2, (b + d) / 2); g.lineTo((a + c) / 2 + (c > a ? 20 : -20), (b + d) / 2 + 5); g.stroke(); }); }
    if (kind === 2) { g.beginPath(); g.moveTo(60, 205); g.quadraticCurveTo(128, 240, 196, 205); g.stroke(); g.strokeRect(150, 210, 22, 40); } });
  const pages = [0, 1, 2].map(i => { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshLambertMaterial({ map: draw(i), side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(-5.4, 0.05 + i * 0.01, -3.6 + i * 3.6); scene.add(m); return m; });
  // 동그란 캐릭터 인형(가상)
  const toy = new THREE.Group(); toy.position.set(2, 0, 0); scene.add(toy);
  const body = K.inked(new THREE.Mesh(new THREE.SphereGeometry(1.9, 28, 20), K.lam(0x9fa29a)), 50); body.scale.y = 0.8; body.position.y = 1.5; toy.add(body);
  [-0.7, 0.7].forEach(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), K.flat(0x161616)); e.position.set(x, 1.9, 1.45); toy.add(e); });
  // 산타 모자(콘 + 방울 + 테두리)를 든 두 손
  const hat = new THREE.Group(); scene.add(hat);
  const cone = K.inked(new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.4, 20), K.lam(0x3e3e3c)), 40); cone.position.y = 1.2; hat.add(cone);
  const rim = K.inked(new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.28, 10, 24), K.lam(0xf0eee8)), 40); rim.rotation.x = Math.PI / 2; hat.add(rim);
  const pom = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), K.lam(0xf0eee8)); pom.position.y = 2.5; hat.add(pom);
  const hand = (sd) => { const g = new THREE.Group(); scene.add(g); K.cyl(0.42, 0.5, 10, 0x5a5a58, 0, 0, 5.2, g, 12).rotation.x = Math.PI / 2; const p = K.inked(new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), K.lam(0xb8b4ae)), 40); p.scale.set(1, 0.6, 1.2); g.add(p); return g; };
  const HL = hand(-1), HR = hand(1);
  // 연필(굴러감)과 지우개 가루
  const pen = K.cyl(0.18, 0.18, 4.4, 0x6a6a68, 4.6, 0.2, 4.2, scene, 6); pen.rotation.z = Math.PI / 2;
  K.box(1.2, 0.4, 0.7, 0xdedcd4, -1.2, 0.2, 5, scene);
  cam.position.set(-1, 11.5, 10.5); cam.lookAt(0.2, 1.2, -0.5);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.12);
    const down = W(0.2, 0.75);
    const hy = 6.2 - 2.7 * down; hat.position.set(2, hy, 0.1); hat.rotation.z = Math.sin(ph * 2) * 0.08 * (1 - down);
    HL.position.set(2 - 1.6, hy + 0.5, 0.1); HL.rotation.y = -0.45; HR.position.set(2 + 1.6, hy + 0.5, 0.1); HR.rotation.y = 0.45;
    toy.rotation.z = Math.sin(ph * 2) * 0.06 * down; toy.position.y = 0.1 * Math.max(0, Math.sin(ph * 4)) * down;
    pen.position.x = 4.6 + Math.sin(ph) * 1.2; pen.rotation.x = -Math.sin(ph) * 1.2 / 0.18;
    pages[2].rotation.x = -Math.PI / 2 + 0.25 * Math.max(0, Math.sin(ph));
  };
}
