// 11/24 도안나 미니 사설 「후루룩이 빠진 자리에 무엇을 그릴까」 삽화
// 새벽 캠핑장 텐트 앞 버너 위 냄비 클로즈업: 얼굴 없이 젓가락 쥔 손이 면발을 들어 올렸다 내리고, 김이 피어오르고, 비스듬히 얹힌 뚜껑이 달그락거린다.
export const secs = 3;
export const meta = { place: '새벽 캠핑장 텐트 앞 버너 냄비', where: 'outdoor', time: 'dawn', camera: 'close', floor: 'grass', figures: 'hands-only', motion: ['noodle-lift', 'steam', 'lid-rattle', 'flame-flicker'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'dawn', clouds: 2 });
  K.floor(scene, { style: 'grass' });
  // 뒤로 텐트와 소나무
  const tent = new THREE.Mesh(new THREE.ConeGeometry(3.2, 3.4, 4), K.lam(0x8a8680)); tent.position.set(-3.5, 1.7, -8); tent.rotation.y = 0.6; scene.add(K.inked(tent));
  K.tree(scene, { x: 4, z: -11, h: 7, kind: 'pine' }); K.tree(scene, { x: 7.5, z: -14, h: 6, kind: 'pine', s: 0.9 });
  // 접이식 테이블
  K.box(4.6, 0.12, 2.6, 0x7a6f62, 0, 1.6, 0, scene); [[-2.1, -1.1], [2.1, -1.1], [-2.1, 1.1], [2.1, 1.1]].forEach(([a, b]) => K.box(0.08, 1.6, 0.08, 0x333333, a, 0.8, b, scene));
  // 버너 + 불꽃
  K.cyl(0.7, 0.8, 0.35, 0x444444, 0, 1.84, 0, scene);
  const flames = [0, 1, 2, 3, 4, 5].map(i => { const f = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 6), K.flat(0xf2efe6)); const a = i / 6 * 6.28; f.position.set(Math.cos(a) * 0.45, 2.1, Math.sin(a) * 0.45); scene.add(f); return f; });
  // 냄비 + 국물
  const pot = K.cyl(1.05, 0.95, 0.9, 0x8e8e8a, 0, 2.55, 0, scene, 28);
  const soup = new THREE.Mesh(new THREE.CircleGeometry(0.98, 28), K.lam(0xc9c3b4)); soup.rotation.x = -Math.PI / 2; soup.position.set(0, 2.92, 0); scene.add(soup);
  [-1, 1].forEach(sd => K.box(0.5, 0.1, 0.16, 0x222222, sd * 1.25, 2.9, 0, scene));
  // 뚜껑(옆에 비스듬히 기대)
  const lid = new THREE.Group(); lid.position.set(-1.5, 3.0, 0.6); scene.add(lid);
  const lm = K.cyl(1.05, 1.05, 0.06, 0xb0aea8, 0, 0, 0, lid, 28); K.cyl(0.15, 0.15, 0.15, 0x222222, 0, 0.1, 0, lid, 10); lid.rotation.z = 1.0;
  // 젓가락 쥔 손(화면 오른쪽 위에서)
  const H = new THREE.Group(); scene.add(H);
  const sleeve = K.cyl(0.38, 0.42, 3, 0x6a6a66, 0, 0, 0, H, 14); sleeve.rotation.z = -1.1; sleeve.position.set(1.6, 0.6, 0);
  const fist = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10), K.lam(0xb8b4ae)); fist.scale.set(1, 0.85, 0.9); fist.position.set(0.2, 0, 0); H.add(K.inked(fist, 50));
  const ch = [-0.06, 0.06].map(dz => { const c = K.cyl(0.035, 0.025, 1.6, 0x3a3a36, -0.5, -0.6, dz, H, 6); c.rotation.z = -0.55; return c; });
  // 면발: 젓가락 끝에서 국물까지 늘어지는 곡선 6가닥
  const nMat = K.lam(0xe8e2d0); const noodles = [0, 1, 2, 3, 4, 5].map(i => { const l = new THREE.Mesh(new THREE.BufferGeometry(), nMat); scene.add(l); return l; });
  const steam = Array.from({ length: 6 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf6f6f2, transparent: true })); scene.add(m); return m; });
  cam.position.set(0.4, 5.0, 7.6); cam.lookAt(0.1, 3.8, 0);
  return (t, ph) => {
    const u = ph / 6.2832;
    const lift = 0.5 - 0.5 * Math.cos(ph);   // 0 → 1 → 0
    H.position.set(0.95 + lift * 0.15, 3.9 + lift * 1.5, 0.3);
    H.rotation.z = 0.05 * Math.sin(ph * 2);
    const tip = new THREE.Vector3(); ch[0].getWorldPosition(tip); const tipY = H.position.y - 1.28, tipX = H.position.x - 0.92;
    noodles.forEach((l, i) => { const ox = (i - 2.5) * 0.07; const pts = [];
      for (let k = 0; k < 12; k++) { const s = k / 11; pts.push(new THREE.Vector3(tipX + ox + (0.1 - tipX) * s * s * 0.6 + Math.sin(ph * 3 + i + s * 4) * 0.06 * s, tipY + (2.92 - tipY) * s, 0.3 - s * 0.2 + (i % 3) * 0.04)); }
      l.geometry.dispose(); l.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.035, 5, false); });
    steam.forEach((m, i) => { const v = (u * 2 + i / 6) % 1; m.position.set(-0.5 + (i % 3) * 0.45 + Math.sin(ph * 2 + i) * 0.15, 3.05 + v * 2.4, -0.2 + (i % 2) * 0.3); m.material.opacity = 0.6 * (1 - v); m.scale.setScalar(0.8 + v * 1.4); });
    lid.rotation.x = 0.06 * Math.sin(ph * 12) * K.win(ph, 0.1, 0.45);
    flames.forEach((f, i) => { f.scale.y = 0.8 + 0.4 * Math.abs(Math.sin(ph * 7 + i * 1.7)); });
  };
}
