// 11/25 안광주 미니 사설 「사장님 광고판이 한 화면에 모이면, 보고서도 바뀐다」
// 저녁 분식집 카운터를 AE 어깨 너머로: 앞치마 사장님이 태블릿을 받쳐 들고, 화면 막대그래프가 하나씩 자라면 고개를 끄덕인다.
// AE는 그래프를 가리키고, 뒤 냄비에서 김이 오른다.
export const secs = 3;
export const meta = { place: '저녁 분식집 카운터 태블릿', where: 'indoor', time: 'sunset', camera: 'ots', floor: 'plain', figures: 'two-facing', motion: ['bars-grow', 'steam-rise', 'nod', 'point'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  const Rm = K.room(scene, { w: 20, d: 12, h: 8, wall: 'brick', wallColor: '#a8a49c', floorStyle: 'plain', windowAt: [6, 4.8, 3.6, 2.4] });
  // 카운터
  K.box(12, 2.2, 1.6, 0x6a5f52, 0, 1.1, -0.5, scene); K.box(12.4, 0.2, 2.0, 0x4a423a, 0, 2.3, -0.5, scene);
  // 뒤쪽 화구와 냄비
  K.box(8, 1.8, 1.4, 0x5a5a58, -1, 0.9, -4.6, scene);
  const pots = [-3.5, -1, 1.5].map(x => K.cyl(0.7, 0.6, 0.8, 0x8a8a86, x, 2.2, -4.6, scene, 16));
  const steam = []; for (let i = 0; i < 18; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf0f0ec, transparent: true, opacity: 0.45 })); scene.add(s); steam.push(s); }
  // 사장님(카운터 안, 카메라 쪽) · AE(카메라 앞, 뒷모습)
  const O = K.person(scene, { x: -0.6, z: -2.3, rot: Math.PI, coat: 0xe2e0da, hair: 'bun', scale: 0.95 });
  const A = K.person(scene, { x: 1.9, z: 1.3, rot: 0.35, coat: 0x2e2e2e, hair: 'short', scale: 0.98 });
  // 태블릿(사장님 손, AE 쪽으로 기울임)
  const tab = new THREE.Group(); tab.position.set(-0.5, 2.75, -1.1); tab.rotation.x = -1.25; scene.add(tab);
  K.box(2.4, 1.6, 0.08, 0x111111, 0, 0, 0, tab); const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4), K.flat(0xf2f0ea)); scr.position.z = 0.05; tab.add(scr);
  const bars = [0, 1, 2, 3, 4].map(i => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1, 0.03), K.flat(i === 4 ? 0x1a1a1a : 0x7a7a76)); b.position.set(-0.8 + i * 0.4, -0.6, 0.08); tab.add(b); return b; });
  K.shot(cam, 'ots', [-0.4, 3, -1], 13); cam.position.set(4.2, 6.8, 6.8); cam.lookAt(-0.8, 3.0, -1.8);
  return (t, ph) => {
    const u = ph / (Math.PI * 2);
    Rm.update(ph, 0.06);
    bars.forEach((b, i) => { const g = Math.min(1, Math.max(0, (u - 0.1 - i * 0.1) / 0.15)) * (u < 0.92 ? 1 : 0); const h = 0.05 + g * (0.3 + i * 0.22); b.scale.y = h; b.position.y = -0.62 + h / 2; });
    steam.forEach((s, i) => { const k = ((u + i / 18) % 1); const px = [-3.5, -1, 1.5][i % 3]; s.position.set(px + Math.sin(ph * 2 + i) * 0.3, 2.7 + k * 3, -4.6); s.scale.setScalar(0.6 + k * 1.2); s.material.opacity = 0.45 * (1 - k); });
    const nod = Math.max(0, Math.sin(ph * 4)) * 0.2 * K.win(ph, 0.35, 0.9, 0.1);
    O.pose({ headPitch: 0.35 + nod, armL: { fwd: 1.2, elbow: 0.7 }, armR: { fwd: 1.2, elbow: 0.7 }, lean: 0.1 });
    const pt = K.win(ph, 0.2, 0.8, 0.1);
    A.pose({ headYaw: 0.25, headPitch: 0.2, lean: 0.1 + pt * 0.1, armR: { fwd: 0.4 + pt * 1.0, out: -0.2, point: pt > 0.5 }, armL: { fwd: 0.9, elbow: 2.0 } });
  };
}
