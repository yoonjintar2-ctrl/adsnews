// 11/17 안광주 미니 사설 「PT가 돌아올 때, 브리프부터 다시 읽자」
// 새벽 강변 난간 앞을 옆에서 본 구도: 출근 전 AE가 난간에 두꺼운 브리프를 펴 놓고 한 줄씩 짚으며 고개를 끄덕인다.
// 바람에 종이가 펄럭이고, 나무가 흔들리고, 낙엽이 날린다. 멀리 강 위로 해가 뜬다.
export const secs = 3;
export const meta = { place: '새벽 강변 난간', where: 'outdoor', time: 'dawn', camera: 'side', floor: 'grass', figures: 'solo-side', motion: ['page-flutter', 'leaves-fall', 'tree-sway', 'nod'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  const S = K.sky(scene, { time: 'dawn', sun: true, clouds: 3 });
  K.floor(scene, { style: 'grass' });
  const river = new THREE.Mesh(new THREE.PlaneGeometry(200, 30), new THREE.MeshLambertMaterial({ color: 0x9aa0a2 })); river.rotation.x = -Math.PI / 2; river.position.set(0, 0.03, -28); scene.add(river);
  K.box(200, 0.4, 1.2, 0x8a8782, 0, 0.2, -12.5, scene);
  const T1 = K.tree(scene, { x: -9, z: -6, h: 8, kind: 'round' }), T2 = K.tree(scene, { x: 10, z: -9, h: 7, kind: 'bare' });
  K.box(14, 0.15, 0.9, 0x5a5650, 0, 3.0, -1.6, scene); for (let i = -3; i <= 3; i++) K.box(0.15, 3, 0.15, 0x3a3a38, i * 2, 1.5, -1.6, scene);
  const P = K.person(scene, { x: 0.3, z: 0.2, rot: 0, coat: 0x4e4e4c, hair: 'short', scale: 1 });
  // 브리프 묶음(무릎 위)과 펄럭이는 위 장
  const doc = K.box(1.6, 0.35, 1.2, 0xeeece6, 0.3, 3.25, -1.5, scene);
  const page = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), new THREE.MeshLambertMaterial({ color: 0xf8f6f0, side: THREE.DoubleSide })); page.position.set(0.3, 3.45, -1.5); page.rotation.x = -Math.PI / 2; scene.add(page);
  const L = K.weather(scene, { kind: 'leaves', n: 40, box: [26, 10, 10], z0: -2 });
  K.shot(cam, 'side', [0, 2.6, 0], 13); cam.position.set(7.5, 4.2, 4.5); cam.lookAt(-0.5, 3.2, -2.5);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    S.update(ph); L.update(ph); T1.update(ph, 0.05); T2.update(ph, 0.04, 1);
    page.rotation.z = 0.5 * Math.max(0, Math.sin(ph * 2));
    const nod = Math.max(0, Math.sin(ph * 3)) * 0.25;
    P.pose({ headPitch: -0.5 - nod, lean: 0.25, armL: { fwd: 1.0, elbow: 0.4 }, armR: { fwd: 1.15, elbow: 0.3, point: W(0.2, 0.9) > 0.5 } });
  };
}
