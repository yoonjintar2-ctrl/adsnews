// 11/17 도안나 트렌드 노트 #수집 카드 — 광고가 손바닥만 한 카드로 접힌다
// 편의점 앞 파라솔 테이블, 친구 어깨 너머로 본 구도: 맞은편 친구가 반짝이는 카드를 부채처럼 펼쳐 보이고,
// 이쪽 친구는 손가락으로 한 장을 가리킨다. 파라솔 끝이 바람에 들썩이고 카드 한 장이 반짝 뒤집힌다.
export const secs = 3;
export const meta = { place: '편의점 앞 파라솔 테이블', where: 'outdoor', time: 'sunset', camera: 'ots', floor: 'plain', figures: 'two-facing', motion: ['card-fan', 'parasol-flap', 'card-flip'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'sunset', sun: true });
  K.floor(scene, { style: 'plain', color: '#a9a7a1' });
  // 편의점 유리창(멀리), 도형 간판
  K.box(26, 9, 1, 0x6e6c68, 0, 4.5, -16, scene); for (let i = 0; i < 4; i++) { const g = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), K.flat(0xe6e3da)); g.position.set(-9 + i * 6, 4, -15.4); scene.add(g); }
  // 둥근 테이블 + 파라솔
  K.cyl(2.4, 2.4, 0.2, 0xdedcd6, 0, 2.6, 0, scene, 28); K.cyl(0.15, 0.15, 2.6, 0x333333, 0, 1.3, 0, scene, 8); K.cyl(0.06, 0.06, 6, 0x333333, 0.9, 5, 0.8, scene, 6);
  const par = K.inked(new THREE.Mesh(new THREE.ConeGeometry(4.6, 1.6, 8, 1, true), new THREE.MeshLambertMaterial({ color: 0x8c8882, side: THREE.DoubleSide })), 30); par.position.set(0.9, 8, 0.8); scene.add(par);
  const A = K.person(scene, { x: 0, z: -3.2, rot: Math.PI, coat: 0xd6d4ce, hair: 'long', scale: 1 }); A.root.position.y = -0.9;
  const B = K.person(scene, { x: -0.9, z: 3.3, rot: 0, coat: 0x4c4c4a, hair: 'cap', scale: 1 }); B.root.position.y = -0.9;
  // 카드 부채(A 손 앞)
  const fan = new THREE.Group(); fan.position.set(0, 4.3, -2.2); scene.add(fan);
  const cards = []; for (let i = 0; i < 5; i++) { const piv = new THREE.Group(); fan.add(piv); const c = K.inked(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.02), K.lam(i === 2 ? 0xf4f2ea : 0xbcb9b2)), 30); c.position.y = 0.4; piv.add(c); cards.push(piv); }
  cam.position.set(-1.6, 5.2, 6.4); cam.lookAt(0.6, 4.0, -2.4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    const open = W(0.1, 0.9);
    cards.forEach((c, i) => { c.rotation.z = (i - 2) * 0.32 * open; c.rotation.y = i === 2 ? Math.PI * 2 * W(0.45, 0.6) : 0; });
    par.rotation.z = Math.sin(ph * 2) * 0.03; par.position.y = 8 + Math.max(0, Math.sin(ph * 3)) * 0.08;
    A.pose({ headPitch: -0.2, armL: { fwd: 1.4, elbow: 0.7 }, armR: { fwd: 1.4, elbow: 0.7 }, bob: 0 });
    B.pose({ headPitch: -0.15, headYaw: 0.1, armR: { fwd: 1.6 * W(0.3, 0.85), point: true }, armL: { fwd: 0.6, elbow: 0.8 } });
  };
}
