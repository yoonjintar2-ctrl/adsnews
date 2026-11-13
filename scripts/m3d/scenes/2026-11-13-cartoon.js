// 11/13 금로동 사설 「아이돌 얼굴로 연 서울, 다음 장면은 골목이다」 — 얼굴이 부르고, 골목이 붙잡는다
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene);
  K.building(scene, -15, -14, 8, 8, 30, 3, 0.35); K.building(scene, -8, -24, 7, 7, 40, 7, 0.1); K.building(scene, 14, -16, 9, 8, 26, 11, -0.4);
  K.building(scene, 8, -30, 8, 8, 44, 13, -0.1); K.building(scene, -22, -4, 7, 10, 18, 17, 0.6); K.building(scene, 22, -6, 8, 9, 20, 19, -0.7);
  K.box(22, 24, 6, 0x7a7a7a, 1, 12, -14, scene);
  const tex = K.imgTex('/repo/img/jp/cartoon-2026-11-13.jpg'); // 원본 삽화의 궁궐 부분만 화면에
  const scr = K.screen(scene, { tex, x: 1, y: 15.4, z: -10.9, w: 19, h: 12.6, crop: [0.44, 0.46, 0.85, 0.87] });
  const bbTex = K.canvasTex(512, 350, (g, w, h) => { g.fillStyle = '#ddd'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.beginPath(); g.moveTo(40, 300); g.lineTo(200, 90); g.lineTo(300, 210); g.lineTo(380, 130); g.lineTo(480, 300); g.fill(); g.beginPath(); g.arc(400, 70, 30, 0, 7); g.fill(); });
  const bb = new THREE.Mesh(new THREE.PlaneGeometry(5, 3.4), new THREE.MeshBasicMaterial({ map: bbTex })); bb.position.set(-12.6, 9, -9.6); bb.rotation.y = 0.35; scene.add(bb);
  const lan = K.lanternString(scene, { y: 10.6, z: 2 });
  const mo = K.motes(scene);
  const b1 = K.bird(scene, { cy: 21, cz: -12 }), b2 = K.bird(scene, { cy: 22.5, cz: -13, rx: 12, s: 0.8 });
  const P1 = K.person(scene, { x: -1.9, z: 10.2, coat: 0x9a9a9a, backpack: true });
  const P2 = K.person(scene, { x: 1.9, z: 10.2, coat: 0xcfcfca, hair: 'long', backpack: true, scale: 0.94 });
  cam.position.set(0, 3.6, 17.4); cam.lookAt(0.3, 7.2, -8);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.1);
    scr.update(ph, 0); lan.update(ph, 0.2); mo.update(ph); b1.update(ph); b2.update(ph, 2.4);
    bb.material.color.setScalar(0.75 + 0.25 * Math.max(0, Math.sin(ph * 2)));
    const point = W(0.1, 0.62), look1 = W(0.42, 0.88), look2 = W(0.3, 0.86), wow = W(0.5, 0.86);
    // 왼쪽 사람: 화면을 손가락으로 가리켰다가 → 옆 사람을 돌아본다
    P1.pose({ headPitch: 0.38 * (1 - look1) + 0.05, headYaw: -1.35 * look1, torsoYaw: -0.5 * look1,
      armR: { fwd: 2.45 * point, out: -0.15 * point, elbow: 0.15 * point, point: point > 0.3 }, armL: { fwd: 0.05 }, bob: Math.abs(Math.sin(ph * 2)) * 0.02 });
    // 오른쪽 사람: 고개를 돌려 마주 보고, 놀라서 손을 입가로
    P2.pose({ headPitch: 0.38 * (1 - look2) + 0.05, headYaw: 1.3 * look2, torsoYaw: 0.5 * look2, headTilt: 0.12 * wow,
      armL: { fwd: 0.85 * wow, out: 0.2 * wow, elbow: 2.4 * wow }, armR: { fwd: 0.05 } });
  };
}
