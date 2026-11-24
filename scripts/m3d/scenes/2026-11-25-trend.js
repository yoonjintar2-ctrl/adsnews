// 11/25 도안나 트렌드 노트 「시청 계정이 짤을 입을 때」(#공공 계정의 밈)
// 흐린 오후 정류장 옆 안내 게시판을 아래에서: 반듯한 안내문이 휙 뒤집히면 선글라스 낀 손그림 얼굴이 나오고, 아래 고정 안내 칸은 그대로다.
// 지나가던 두 사람이 마주 보며 가리키고 웃는다. 비둘기 한 마리가 지나간다.
export const secs = 3;
export const meta = { place: '흐린 오후 정류장 옆 안내 게시판', where: 'outdoor', time: 'overcast', camera: 'low', floor: 'asphalt', figures: 'two-facing', motion: ['poster-flip', 'point-laugh', 'pigeon', 'tree-sway'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'overcast', clouds: 3 });
  K.floor(scene, { style: 'asphalt', color: '#8a8884' });
  K.box(30, 0.3, 4, 0xa8a6a0, 0, 0.15, -1, scene);
  const T = K.tree(scene, { x: -8, z: -4, h: 8, kind: 'round' });
  // 게시판
  K.box(5.6, 6.4, 0.3, 0x3a3a38, 0, 4.2, -2.5, scene); K.cyl(0.15, 0.15, 2, 0x333333, -2, 0.9, -2.5, scene); K.cyl(0.15, 0.15, 2, 0x333333, 2, 0.9, -2.5, scene);
  const info = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 1.3), K.flat(0xf2f0ea)); info.position.set(0, 1.85, -2.33); scene.add(info);
  [-1.6, -0.4].forEach((x, i) => K.box(0.5, 0.5, 0.05, 0x333333, x - 0.2, 1.85, -2.3, scene));
  K.box(2.4, 0.12, 0.05, 0x333333, 0.9, 2.05, -2.3, scene); K.box(2.0, 0.12, 0.05, 0x333333, 0.7, 1.65, -2.3, scene);
  const formal = K.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#333'; for (let i = 0; i < 9; i++) g.fillRect(28, 28 + i * 24, i % 3 === 2 ? 130 : 200, 9); });
  const meme = K.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e8e6e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8c6c0'; g.beginPath(); g.arc(128, 112, 74, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#1a1a1a'; g.stroke(); g.fillStyle = '#1a1a1a'; g.fillRect(70, 86, 50, 24); g.fillRect(136, 86, 50, 24); g.fillRect(118, 92, 20, 6); g.beginPath(); g.arc(128, 132, 34, 0.2, Math.PI - 0.2); g.stroke(); g.fillRect(24, 206, 208, 30); });
  const flipG = new THREE.Group(); flipG.position.set(0, 4.9, -2.2); scene.add(flipG);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.2), new THREE.MeshLambertMaterial({ map: formal })); front.position.z = 0.02; flipG.add(front);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.2), new THREE.MeshLambertMaterial({ map: meme })); back.rotation.y = Math.PI; back.position.z = -0.02; flipG.add(back);
  const A = K.person(scene, { x: -3.6, z: 0.8, rot: -0.9, coat: 0x6a6a66, hair: 'long', scale: 0.95 });
  const B = K.person(scene, { x: 3.4, z: 0.6, rot: 0.9, coat: 0x9a968e, hair: 'cap', scale: 0.92 });
  const bird = K.bird(scene, { cx: 0, cy: 9, cz: -6, rx: 10, rz: 3, s: 1 });
  K.shot(cam, 'low', [0, 3, -1], 16); cam.position.set(0.5, 0.9, 11); cam.lookAt(0, 4.2, -2);
  return (t, ph) => {
    T.update(ph, 0.05);
    if (bird && bird.update) bird.update(ph);
    const f = K.win(ph, 0.2, 0.85, 0.12);
    flipG.rotation.y = Math.PI * f;
    const p = K.win(ph, 0.3, 0.85, 0.1), laugh = Math.abs(Math.sin(ph * 6)) * 0.08 * p;
    A.pose({ headYaw: -0.6 + p * 1.2, headPitch: -0.2, bob: laugh, torsoYaw: p * 0.3, armR: { fwd: 0.4 + p * 1.6, out: 0.1, point: p > 0.5 }, armL: { fwd: 0.3 } });
    B.pose({ headYaw: 0.6 - p * 1.2, headPitch: -0.2, bob: laugh, torsoYaw: -p * 0.3, armL: { fwd: 0.4 + p * 1.5, point: p > 0.5 }, armR: { fwd: 0.3 + p * 1.2, elbow: 2.0 * p } });
  };
}
