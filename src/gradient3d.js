/* מכונת הגרדיאנט: גוש בנוי מקוביות. ב-0 הוא אטום ולבן. ככל שעולים ל-1 נפתחים חללים,
   קוביות הופכות לצמחייה, המים עולים מתחת, וחיים קטנים מקיפים אותו. הנתון קובע את הצורה, לא הקישוט. */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function mountGradient(canvas, { onReady } = {}) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  camera.position.set(17, 13, 19);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.enablePan = false; controls.enableZoom = false;
  controls.target.set(0, 3.2, 0);
  controls.autoRotate = !reduce; controls.autoRotateSpeed = 0.6;
  controls.addEventListener("start", () => { controls.autoRotate = false; });

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d2c0, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(8, 16, 6); scene.add(sun);

  const N = 6, HGT = 8, S = 0.92;
  const geo = new THREE.BoxGeometry(S, S, S);
  const mat = new THREE.MeshStandardMaterial({ roughness: .85, metalness: 0 });
  const count = N * N * HGT;
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  scene.add(mesh);

  // פיזור קבוע: כל קובייה מקבלת שני מספרים, כדי שהשינוי יהיה רציף ולא אקראי בכל הזזה
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const cells = [];
  for (let y = 0; y < HGT; y++) for (let x = 0; x < N; x++) for (let z = 0; z < N; z++) {
    const edge = x === 0 || z === 0 || x === N - 1 || z === N - 1;
    const core = (x === 2 || x === 3) && (z === 2 || z === 3);
    cells.push({ x: x - (N - 1) / 2, y: y + .5, z: z - (N - 1) / 2, edge, core, r: rnd(), g: rnd(), s: 1 });
  }
  const cSterile = new THREE.Color("#EDE8DC"), cLiving = new THREE.Color("#3E7D4F"), cStone = new THREE.Color("#C9C2B0");

  const ground = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, .2, 64), new THREE.MeshStandardMaterial({ color: "#E8E2D3", roughness: 1 }));
  ground.position.y = -.1; scene.add(ground);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(8.6, 8.6, 1, 64), new THREE.MeshStandardMaterial({ color: "#1F5E6B", transparent: true, opacity: .35, roughness: .2 }));
  scene.add(water);

  const lifeGeo = new THREE.SphereGeometry(.09, 8, 8);
  const life = new THREE.InstancedMesh(lifeGeo, new THREE.MeshStandardMaterial({ color: "#C9A227" }), 60);
  scene.add(life);
  const orbits = Array.from({ length: 60 }, () => ({ a: rnd() * Math.PI * 2, r: 4.5 + rnd() * 3, h: 1 + rnd() * 8, sp: .2 + rnd() * .5 }));

  let target = 0, cur = 0;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();

  function apply(t) {
    cells.forEach((c, i) => {
      // החללים נפתחים מבחוץ פנימה: קובייה בשפה נפתחת קודם, הליבה נשארת
      const open = c.core ? 0 : (c.edge ? t * .9 : t * .55);
      const want = c.r < open * .85 ? 0 : 1;
      c.s += (want - c.s) * .18;
      const k = Math.max(c.s, 0.0001);
      sc.set(k, k, k); v.set(c.x, c.y, c.z);
      m4.compose(v, q, sc); mesh.setMatrixAt(i, m4);
      const green = c.edge && c.g < t * .75 && c.y < HGT;
      const col = green ? cLiving : cSterile.clone().lerp(cStone, c.g * .25);
      mesh.setColorAt(i, col);
    });
    mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
    water.scale.y = .05 + t * 1.6; water.position.y = (water.scale.y) / 2 - .1;
    const n = Math.round(t * 60);
    orbits.forEach((o, i) => {
      const k = i < n ? 1 : 0;
      v.set(Math.cos(o.a) * o.r, o.h, Math.sin(o.a) * o.r); sc.set(k, k, k);
      m4.compose(v, q, sc); life.setMatrixAt(i, m4);
    });
    life.instanceMatrix.needsUpdate = true;
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();

  let raf, alive = true;
  const clock = new THREE.Clock();
  function loop() {
    if (!alive) return;
    const dt = clock.getDelta();
    cur += (target - cur) * (reduce ? 1 : .08);
    if (!reduce) orbits.forEach(o => { o.a += dt * o.sp * .4; });
    apply(cur);
    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  loop(); onReady?.();

  return {
    set(t) { target = t; },
    destroy() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); renderer.dispose(); },
  };
}
