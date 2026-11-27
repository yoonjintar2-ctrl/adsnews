// 11/28 도안나 트렌드 「맥주캔도 연말엔 겉옷을 갈아입는다」
// 눈 오는 새벽 가게 앞 야외 나무 매대를 기울인 구도로: 캔 셋이 목도리·고깔을 걸쳤고, 위에서 내려온 손이 남은 캔에 리본을 묶는다.
// 차양이 바람에 출렁이고 고깔 방울이 까딱인다. 눈이 내린다.
export const secs = 3;
export const meta = { place: '눈 오는 새벽 가게 앞 야외 나무 매대', where: 'outdoor', time: 'dawn', camera: 'dutch', floor: 'sand', figures: 'hands-only', motion: ['snow', 'ribbon-tie', 'awning-wave', 'pompom-bob', 'can-wobble'] };
export default function (K) {
  const { THREE, scene, cam } = K;
  K.sky(scene, { time: 'dawn', clouds: 1 });
  K.floor(scene, { style: 'sand', color: '#e2e0da' });
  // 가게 앞면(벽+문틀) — 창문 빌딩 아님
  K.box(16, 9, 0.5, 0xa8a59e, 0, 4.5, -5, scene); K.box(3, 6, 0.6, 0x3a3a3a, 4.5, 3, -4.9, scene); K.box(2.4, 5.4, 0.62, 0xd8d6d0, 4.5, 2.8, -4.88, scene);
  // 차양(줄무늬, 출렁)
  const awTex = K.canvasTex(256, 64, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f2f0ea' : '#4a4a48'; g.fillRect(i * w / 8, 0, w / 8, h); } });
  const aw = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.4, 20, 4), new THREE.MeshLambertMaterial({ map: awTex, side: THREE.DoubleSide })); aw.position.set(-2, 7.0, -3.9); aw.rotation.x = -0.9; scene.add(aw);
  const A0 = aw.geometry.attributes.position.array.slice();
  // 나무 매대
  K.box(7, 0.3, 3, 0x7a6a58, -2, 2.6, -1.5, scene); [-5, 1].forEach(x => [-2.6, -0.4].forEach(z => K.box(0.25, 2.6, 0.25, 0x5a4e42, x, 1.3, z, scene)));
  // 캔 넷
  const cans = [-4.2, -2.8, -1.4, 0.0].map((x, i) => { const g = new THREE.Group(); g.position.set(x, 2.75, -1.4 + (i % 2) * 0.3); scene.add(g);
    K.cyl(0.5, 0.5, 1.6, i % 2 ? 0x6a6a68 : 0xcfcdc6, 0, 0.8, 0, g, 18); K.cyl(0.42, 0.5, 0.12, 0x8a8a86, 0, 1.66, 0, g, 18); return g; });
  // 목도리(0), 고깔(1), 털모자 띠(2)
  const scarf = K.inked(new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.14, 8, 20), K.lam(0x3a3a3a)), 30); scarf.rotation.x = Math.PI / 2; scarf.position.y = 1.35; cans[0].add(scarf);
  const tail = K.box(0.3, 0.8, 0.08, 0x3a3a3a, 0.35, 0.95, 0.5, cans[0]);
  const hat = new THREE.Group(); hat.position.y = 1.72; cans[1].add(hat);
  const cone = K.inked(new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.1, 14), K.lam(0x4a4a48)), 30); cone.position.y = 0.55; hat.add(cone);
  const pom = new THREE.Group(); pom.position.y = 1.1; hat.add(pom); const pb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), K.lam(0xf4f4f0)); pom.add(pb);
  const band = K.inked(new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.12, 8, 20), K.lam(0xf0eee8)), 30); band.rotation.x = Math.PI / 2; band.position.y = 1.5; cans[2].add(band);
  // 리본(3번 캔) + 손
  const bow = new THREE.Group(); bow.position.set(0, 1.0, 0.52); cans[3].add(bow);
  [-1, 1].forEach(sd => { const l = K.inked(new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 6, 12), K.lam(0x2a2a2a)), 30); l.position.x = sd * 0.22; l.scale.set(1, 0.6, 1); bow.add(l); });
  const ribbonBand = K.inked(new THREE.Mesh(new THREE.TorusGeometry(0.51, 0.05, 6, 20), K.lam(0x2a2a2a)), 30); ribbonBand.rotation.x = Math.PI / 2; ribbonBand.position.y = 1.0; cans[3].add(ribbonBand);
  const hands = [-1, 1].map(sd => { const g = new THREE.Group(); scene.add(g); const fo = K.inked(new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 1.3, 4, 10), K.lam(0x6a6a68)), 30); fo.position.set(0.5 + sd * 0.1, 0.6, 0.35); fo.rotation.z = -0.75; g.add(fo); const pm = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), K.lam(0xb8b4ae)); g.add(pm); return g; });
  const Sn = K.weather(scene, { kind: 'snow', n: 120, box: [24, 12, 12], z0: 0 });
  K.shot(cam, 'dutch', [-2, 3.6, -1.2], 11);
  return (t, ph) => {
    Sn.update(ph);
    const a = aw.geometry.attributes.position; for (let i = 0; i < a.count; i++) { const x = A0[i * 3], y = A0[i * 3 + 1]; a.setZ(i, Math.sin(ph * 2 + x * 0.8) * 0.12 * (1.2 - y)); } a.needsUpdate = true;
    const tie = K.win(ph, 0.15, 0.7, 0.1);
    bow.scale.setScalar(0.3 + 0.7 * K.win(ph, 0.4, 0.98, 0.08)); bow.rotation.z = Math.sin(ph * 6) * 0.15 * tie;
    const bp = new THREE.Vector3(); bow.getWorldPosition(bp);
    hands.forEach((h, i) => { const sd = i ? 1 : -1; h.position.set(bp.x + sd * (0.35 + 0.25 * Math.sin(ph * 6) * tie), bp.y + 0.1 + (1 - tie) * 1.6, bp.z + 0.25); });
    pom.rotation.z = Math.sin(ph * 4) * 0.5; hat.rotation.z = Math.sin(ph * 2) * 0.08;
    cans.forEach((c, i) => { c.rotation.z = Math.sin(ph * 2 + i) * 0.03; });
    tail.rotation.z = Math.sin(ph * 2) * 0.2;
  };
}
