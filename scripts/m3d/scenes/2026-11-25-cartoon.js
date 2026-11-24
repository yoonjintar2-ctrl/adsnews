// 11/25 금로동 사설 「후킹은 남이 쳐도, 이름은 브랜드가 진다」
// 해 질 녘 호숫가 낚시 잔교를 멀리서: 크리에이터 셋이 차례로 낚싯대를 휘두르고, 물에 뜬 이름판(글자 없음)에 바늘 하나가 걸려 끌려간다.
// 잔교 끝 정장 차림 담당자가 머리를 감싸 쥐었다 놓는다. 물결에 이름판이 까딱인다.
export const secs = 3;
export const meta = { place: '해 질 녘 호숫가 낚시 잔교', where: 'outdoor', time: 'sunset', camera: 'wide', floor: 'water', figures: 'crowd', motion: ['rod-cast', 'line-sway', 'sign-drag', 'head-clutch'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  const S = K.sky(scene, { time: 'sunset', sun: true, clouds: 2 });
  K.floor(scene, { style: 'water' });
  // 잔교
  K.box(14, 0.4, 2.4, 0x6a5f52, -4, 1.2, 0, scene);
  for (let i = 0; i < 6; i++) K.cyl(0.15, 0.15, 1.6, 0x3a342e, -10 + i * 2.4, 0.4, 1.1, scene, 8);
  for (let i = 0; i < 6; i++) K.cyl(0.15, 0.15, 1.6, 0x3a342e, -10 + i * 2.4, 0.4, -1.1, scene, 8);
  // 이름판(물 위)
  const sign = new THREE.Group(); scene.add(sign);
  K.box(3.2, 1.8, 0.3, 0xf2f0ea, 0, 0, 0, sign); K.box(2.6, 1.3, 0.32, 0xdcdad4, 0, 0, 0.01, sign);
  const star = new THREE.Mesh(new THREE.CircleGeometry(0.45, 5), K.flat(0x1a1a1a)); star.position.z = 0.2; sign.add(star);
  // 크리에이터 셋(잔교 위, 오른쪽 물을 봄)
  const ppl = [-9, -6.6, -4.2].map((x, i) => K.person(scene, { x, z: 0, rot: -Math.PI / 2, coat: [0x9a968e, 0x6a6a68, 0x8a8680][i], hair: ['short', 'long', 'cap'][i], scale: 0.8 }));
  const rods = ppl.map((p, i) => { const r = K.cyl(0.03, 0.05, 4.2, 0x2a2a2a, 0, 0, 0, scene, 6); return r; });
  const lines = ppl.map(() => { const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x1a1a1a })); scene.add(l); return l; });
  const hooks = ppl.map(() => { const h = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 6, 12, Math.PI * 1.4), K.flat(0x1a1a1a)); scene.add(h); return h; });
  // 담당자(잔교 끝, 카메라 쪽을 봄)
  const M = K.person(scene, { x: 1.6, z: 0.3, rot: Math.PI * 0.85, coat: 0x2e2e2e, hair: 'short', scale: 0.85 });
  K.tree(scene, { x: -14, z: -10, h: 7, kind: 'pine' }); K.tree(scene, { x: 12, z: -16, h: 8, kind: 'pine' });
  cam.position.set(-1.6, 4.0, 13.5); cam.lookAt(-1.6, 2.4, -1);
  const tip = new THREE.Vector3(), end = new THREE.Vector3();
  return (t, ph) => {
    S.update(ph);
    const u = ph / (Math.PI * 2);
    const drag = K.win(ph, 0.35, 0.95, 0.15);
    sign.position.set(5.2 - drag * 1.4, 0.75 + Math.sin(ph * 2) * 0.12, -1.5);
    sign.rotation.z = Math.sin(ph * 2 + 1) * 0.08 + drag * 0.15; sign.rotation.y = -0.4;
    ppl.forEach((p, i) => {
      const cast = K.win(ph, 0.08 + i * 0.1, 0.3 + i * 0.1, 0.06);
      const a = 0.5 + cast * 0.9 - (i === 1 ? drag * 0.4 : 0);
      p.pose({ lean: -0.1, armR: { fwd: 1.2 + cast * 0.6, elbow: 0.5 }, armL: { fwd: 1.0, elbow: 0.8 }, headPitch: 0.1 });
      const bx = p.root.position.x + 0.8, by = 3.2;
      const ra = 0.9 + cast * 0.4; rods[i].position.set(bx + Math.sin(ra) * 2.0, by + Math.cos(ra) * 2.0, 0.2); rods[i].rotation.z = -ra;
      tip.set(bx + Math.sin(ra) * 4.1, by + Math.cos(ra) * 4.1, 0.2);
      if (i === 1) end.set(sign.position.x - 0.2, sign.position.y + 0.95, sign.position.z);
      else end.set(tip.x + 3 + i * 0.5 + Math.sin(ph + i) * 0.4, 0.35, -2 + i * 1.5);
      lines[i].geometry.setFromPoints([tip.clone(), end.clone()]);
      hooks[i].position.copy(end); hooks[i].rotation.z = Math.sin(ph * 3 + i) * 0.3;
    });
    const clutch = K.win(ph, 0.4, 0.9, 0.1);
    M.pose({ headPitch: -0.1 + clutch * 0.15, headTilt: Math.sin(ph * 4) * 0.08 * clutch, armL: { fwd: 0.4 + clutch * 2.2, out: 0.3, elbow: 1.8 * clutch }, armR: { fwd: 0.4 + clutch * 2.2, out: 0.3, elbow: 1.8 * clutch } });
  };
}
