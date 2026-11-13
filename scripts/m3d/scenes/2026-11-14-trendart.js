// 11/14 트렌드 노트① #러너 마케팅 — 달리고, 찍고, 브랜드를 만난다
export const secs = 3;
export default function (K) {
  const { THREE, scene, cam } = K;
  K.ground(scene, { color: '#bcbcb6', tiles: 3 });
  K.box(4, 0.02, 60, 0x8f8f8b, 0, 0.02, -10, scene);
  // 결승 아치(글자 없이)
  [-5.5, 5.5].forEach(x => K.box(0.9, 8.5, 0.9, 0x4a4a48, x, 4.25, -6, scene)); K.box(12, 1.6, 1, 0x1e1e1e, 0, 8.6, -6, scene);
  for (let i = 0; i < 6; i++) K.box(0.8, 0.6, 0.05, 0xe8e8e2, -4.2 + i * 1.7, 8.6, -5.47, scene);
  const flags = K.lanternString(scene, { x0: -5.5, x1: 5.5, y: 7.4, z: -5.6, n: 8, sag: 0.5, size: 0.55 });
  // 포토존 액자
  const fr = new THREE.Group(); fr.position.set(7.5, 3.6, -3); fr.rotation.y = -0.5; scene.add(fr);
  K.box(3.4, 0.25, 0.25, 0x222222, 0, 1.4, 0, fr); K.box(3.4, 0.25, 0.25, 0x222222, 0, -1.4, 0, fr); K.box(0.25, 3, 0.25, 0x222222, -1.6, 0, 0, fr); K.box(0.25, 3, 0.25, 0x222222, 1.6, 0, 0, fr);
  K.cyl(0.08, 0.08, 2.3, 0x222222, 7.5, 1.1, -3, scene);
  // 셀카 러너(정면) + 휴대폰
  const S = K.person(scene, { x: -2.2, z: 1.0, rot: Math.PI, coat: 0xe2e2dc, hair: 'bun' });
  const phone = K.box(0.45, 0.8, 0.08, 0x111111, 0, 0, 0, scene);
  // 달려 들어오는 러너(제자리 뛰기)
  const R2 = K.person(scene, { x: 2.2, z: -1.2, rot: Math.PI, coat: 0x8a8a88, hair: 'cap' });
  // 관중 머리들
  const crowd = []; for (let i = 0; i < 6; i++) { const x = i < 3 ? -10 + i * 1.6 : 7 + (i - 3) * 1.6; const p = K.person(scene, { x, z: -7.5, rot: Math.PI, coat: 0x5a5a58, scale: 0.9 }); crowd.push(p); }
  cam.position.set(0, 4.4, 13.5); cam.lookAt(0, 4.4, -4);
  return (t, ph) => {
    const W = (a, b) => K.win(ph, a, b, 0.08);
    flags.update(ph, 0.25);
    const up = W(0.08, 0.9);
    S.pose({ headPitch: -0.25 * up, headYaw: 0.1, armR: { fwd: 2.5 * up + 0.1, out: 0.3, elbow: 0.25 }, armL: { fwd: 0.4 * W(0.4, 0.85), out: 0.9 * W(0.4, 0.85), elbow: 1.2 * W(0.4, 0.85) } });
    // 휴대폰은 오른손 근처(정면 인물: 세계 -x 쪽이 그의 오른손)
    const a = 2.5 * up + 0.1; phone.position.set(-2.2 - 0.95, 1.8 + 1.3 + Math.cos(a) * -1.5 + 0.1, 1.0 + Math.sin(a) * 1.5); phone.rotation.x = -a + Math.PI; phone.visible = up > 0.6;
    const r = Math.sin(ph * 6);
    R2.pose({ bob: Math.abs(r) * 0.25, lean: 0.12, headYaw: -0.6 * W(0.5, 0.9), armL: { fwd: r * 0.9, elbow: 1.4 }, armR: { fwd: -r * 0.9, elbow: 1.4 } });
    crowd.forEach((p, i) => p.pose({ bob: Math.abs(Math.sin(ph * 4 + i)) * 0.12, armR: { fwd: 2.4 * W(0.1 * i, 0.1 * i + 0.4), out: 0.3 }, armL: { fwd: 0.1 } }));
  };
}
