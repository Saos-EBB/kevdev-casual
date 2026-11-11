// Kern 14: repairable laptop. On scroll it comes apart and each part is highlighted with a callout.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { REDUCE, clamp, col, ease, lerp, makeGround, makeStudio, rrect, seg, shade, slab, smooth } from "./shared";

/* ================= Kern 14 ================= */
const KERN_STEPS = ["", "display", "keyboard", "battery", "board", "fans", "ssd"];
const KERN_LABELS = { display: "Display · 14,2″ · 120 Hz", keyboard: "Tastatur · 1,5 mm Hub", battery: "Akku · 72 Wh, gesteckt", board: "Chip · 12 Kerne", fans: "Kühlung · 22 dB(A)", ssd: "SSD · M.2 2280" };
// The wallpaper on the display: a few soft colour fields on a dark ground.
function screenTexture() {
  const c = document.createElement("canvas"); c.width = 1280; c.height = 800;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0b1622"; g.fillRect(0, 0, 1280, 800);
  const glow = (x: number, y: number, r: number, rgb: string, a: number) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 1280, 800);
  };
  glow(1050, 760, 760, "232,80,28", .95);
  glow(320, 820, 620, "255,170,90", .55);
  glow(240, 120, 700, "28,92,120", .8);
  glow(900, 100, 520, "120,60,110", .45);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// stable pseudo-random numbers, so the small parts on the board sit in the same place on every visit
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export function buildKern(canvas: HTMLCanvasElement) {
  const { renderer, scene } = makeStudio(canvas, 4.6, [4, 8, 5]);
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 80);
  const LIT = col("#ffffff");
  const W = 3.1, D = 2.2, R = .15;
  const parts: Record<string, THREE.Group> = {};
  const part = (k: string, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.userData = { mats: [], base: new THREE.Vector3(x, y, z), anchor: new THREE.Object3D() }; g.add(g.userData.anchor); parts[k] = g; return g; };
  const mat = (k: string, o: THREE.MeshStandardMaterialParameters) => { const m = new THREE.MeshStandardMaterial(Object.assign({ transparent: true }, o)); m.userData.em = m.emissive.clone(); parts[k].userData.mats.push(m); return m; };
  const add = (g: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => { const b = new THREE.Mesh(geo, m); b.position.set(x, y, z); g.add(b); return b; };
  const box = (g: THREE.Object3D, m: THREE.Material, w: number, h: number, d: number, x: number, y: number, z: number, r = Math.min(w, h, d) * .3) => add(g, new RoundedBoxGeometry(w, h, d, 2, r), m, x, y, z);
  const alu = { color: col("#d2d6db"), metalness: 1, roughness: .4 };

  const root = new THREE.Group(); scene.add(root);
  // bottom case: a shallow aluminium tub with rounded corners
  const kase = part("case"); root.add(kase);
  const mCase = mat("case", alu);
  add(kase, slab(W, D, .03, R, .008), mCase);
  const wall = rrect(W, D, R); wall.holes.push(rrect(W - .09, D - .09, R - .045));
  const wallGeo = new THREE.ExtrudeGeometry(wall, { depth: .13, bevelEnabled: false, curveSegments: 12 }); wallGeo.rotateX(-Math.PI / 2);
  add(kase, wallGeo, mCase, 0, .03, 0);
  const mPort = mat("case", { color: col("#15181c"), roughness: .5 });
  [[-1, -.55], [-1, -.3], [1, -.55], [1, -.2]].forEach(([s, z]) => box(kase, mPort, .012, .034, .11, s * (W / 2 + .001), .095, z, .005));
  // mainboard: chip under its heat spreader, two memory modules, small parts
  const board = part("board", 0, .05, -.45); root.add(board);
  add(board, slab(1.56, 1.0, .022, .04), mat("board", { color: col("#12222e"), roughness: .5, metalness: .1 }));
  box(board, mat("board", { color: col("#d6d9dc"), metalness: 1, roughness: .28 }), .36, .03, .36, 0, .037, 0, .012);
  const mRam = mat("board", { color: col("#1b3b2c"), roughness: .5 });
  const mIc = mat("board", { color: col("#191c20"), roughness: .45 });
  [-.18, .2].forEach(z => { box(board, mRam, .2, .012, .3, .52, .028, z, .004); for (let i = 0; i < 4; i++) box(board, mIc, .15, .012, .05, .52, .04, z - .105 + i * .07, .004); });
  const smd = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mIc, 46);
  const tmp = new THREE.Object3D();
  for (let i = 0; i < 46; i++) {
    // keep clear of the chip in the middle and the memory on the right
    let x = 0, z = 0, n = i * 3;
    do { x = (rnd(n) - .5) * 1.4; z = (rnd(n + 1) - .5) * .86; n += 7; } while ((Math.abs(x) < .26 && Math.abs(z) < .26) || x > .36);
    tmp.position.set(x, .03, z); tmp.scale.set(.03 + rnd(n + 2) * .08, .016, .03 + rnd(n + 3) * .05); tmp.updateMatrix(); smd.setMatrixAt(i, tmp.matrix);
  }
  board.add(smd);
  board.userData.anchor.position.set(0, .06, 0);
  // SSD: a plain M.2 stick with its label
  const ssd = part("ssd", -.42, .1, -.2); root.add(ssd);
  box(ssd, mat("ssd", { color: col("#161a1e"), roughness: .5 }), .8, .016, .22, 0, 0, 0, .006);
  box(ssd, mat("ssd", { color: col("#eceff1"), roughness: .7 }), .44, .004, .16, .08, .01, 0, .002);
  box(ssd, mat("ssd", { color: col("#c9a24a"), metalness: 1, roughness: .35 }), .05, .017, .2, -.385, 0, 0, .004);
  ssd.userData.anchor.position.set(-.3, .02, 0);
  // cooling: two fans joined by a copper heatpipe
  const fans = part("fans", 0, .1, -.62); root.add(fans);
  const mHouse = mat("fans", { color: col("#1e2227"), roughness: .55 });
  const mBlade = mat("fans", { color: col("#3c434b"), roughness: .45 });
  box(fans, mat("fans", { color: col("#c07a45"), metalness: 1, roughness: .32 }), 2.0, .024, .08, 0, .02, .17, .011);
  const rotors: THREE.Group[] = [];
  [-1.12, 1.12].forEach(x => {
    const ringShape = new THREE.Shape(); ringShape.absarc(0, 0, .35, 0, Math.PI * 2, false);
    const hole = new THREE.Path(); hole.absarc(0, 0, .3, 0, Math.PI * 2, true); ringShape.holes.push(hole);
    const ring = new THREE.ExtrudeGeometry(ringShape, { depth: .07, bevelEnabled: false, curveSegments: 40 }); ring.rotateX(-Math.PI / 2);
    add(fans, ring, mHouse, x, -.03, 0);
    add(fans, new THREE.CylinderGeometry(.35, .35, .012, 48), mHouse, x, -.03, 0);
    const r = new THREE.Group(); r.position.set(x, .012, 0); fans.add(r); rotors.push(r);
    r.add(new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .05, 32), mBlade));
    for (let i = 0; i < 11; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.2, .008, .07), mBlade); b.position.x = .19; const arm = new THREE.Group(); arm.rotation.y = i / 11 * Math.PI * 2; b.rotation.set(.5, .35, 0); arm.add(b); r.add(arm); }
  });
  fans.userData.anchor.position.set(1.12, .05, 0);
  // battery: six cells under one label
  const battery = part("battery", 0, .09, .5); root.add(battery);
  const mCell = mat("battery", { color: col("#23282e"), roughness: .42, metalness: .2 });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) box(battery, mCell, .78, .07, .4, -.82 + i * .82, 0, -.21 + j * .42, .022);
  box(battery, mat("battery", { color: col("#e9ecee"), roughness: .75 }), .62, .003, .2, 0, .036, .21, .001);
  box(battery, mat("battery", { color: col("#e8501c"), roughness: .6 }), .1, .003, .2, .38, .036, .21, .001);
  box(battery, mCell, .16, .03, .1, 0, 0, -.46, .01);
  battery.userData.anchor.position.set(.8, .04, .2);
  // keyboard deck: black key well, keys, glass trackpad
  const keyboard = part("keyboard", 0, .17, 0); root.add(keyboard);
  add(keyboard, slab(W, D, .045, R, .008), mat("keyboard", alu));
  const mKey = mat("keyboard", { color: col("#1c1f23"), roughness: .55 });
  add(keyboard, slab(2.78, 1.2, .004, .05), mat("keyboard", { color: col("#111316"), roughness: .7 }), 0, .044, -.42);
  const keyGeo = new RoundedBoxGeometry(.17, .028, .17, 2, .012);
  const keys = new THREE.InstancedMesh(keyGeo, mKey, 14 * 5 + 9);
  let n = 0;
  const key = (x: number, z: number, sx = 1, sz = 1) => { tmp.position.set(x, .06, z); tmp.scale.set(sx, 1, sz); tmp.updateMatrix(); keys.setMatrixAt(n++, tmp.matrix); };
  for (let c = 0; c < 14; c++) key(-1.235 + c * .19, -.925, 1, .5);                       // function row, half height
  for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) key(-1.235 + c * .19, -.76 + r * .19);
  for (let c = 0; c < 14; c++) if (c < 4 || c > 8) key(-1.235 + c * .19, 0);              // bottom row around the space bar
  keys.count = n;
  keyboard.add(keys);
  add(keyboard, new RoundedBoxGeometry(.93, .028, .17, 2, .012), mKey, -1.235 + 6 * .19, .06, 0);
  add(keyboard, slab(1.2, .7, .004, .05), mat("keyboard", { color: col("#b4b9bf"), metalness: 1, roughness: .22 }), 0, .044, .63);
  keyboard.userData.anchor.position.set(1.0, .07, -.5);
  // lid: hinge at the back edge; display panel on its inner face
  const lid = part("lid", 0, .22, -D / 2); root.add(lid);
  add(lid, slab(W, D, .04, R, .008), mat("lid", alu), 0, 0, D / 2);
  const display = part("display", 0, -.002, D / 2); lid.add(display);
  const glass = new THREE.Mesh(new THREE.ShapeGeometry(rrect(W - .05, D - .05, R - .03), 12), mat("display", { color: col("#08090b"), roughness: .18 }));
  glass.rotation.x = Math.PI / 2; display.add(glass);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(W - .2, D - .2), mat("display", { color: 0x000000, emissive: 0xffffff, emissiveMap: screenTexture(), roughness: .3 }));
  panel.material.userData.noTint = true;
  panel.rotation.x = Math.PI / 2; panel.position.y = -.002; display.add(panel);
  display.userData.anchor.position.set(1.1, 0, -.6);

  shade(root);
  const ground = makeGround(6.4); root.add(ground);

  const LIFT: Record<string, number> = { case: 0, board: .75, ssd: 1.05, fans: .95, battery: .75, keyboard: 1.68 };
  const DELAY: Record<string, number> = { case: 0, keyboard: 0, fans: .12, ssd: .16, board: .2, battery: .24 };
  const tgt = new THREE.Vector3(0, .3, 0), want = new THREE.Vector3(), aw = new THREE.Vector3();
  const st = { s: 0, label: "", lw: 0, x: 0, y: 0 };
  return {
    renderer, scene, camera, st,
    update(sp, t, dt) {
      const s = st.s = lerp(st.s, sp, 1 - Math.exp(-dt * 3.5));
      const e = ease(seg(s, .2, 1.1));
      // Each part owns most of its step: short fade in, a long hold, short fade out.
      // So only one part is lit at a time instead of two half-lit ones.
      const w: Record<string, number> = {}; let maxW = 0, top = "";
      KERN_STEPS.forEach((k, i) => {
        if (!k) return;
        const last = i === KERN_STEPS.length - 1;
        const v = smooth(i - .05, i + .25, s) * (last ? 1 : 1 - smooth(i + .75, i + 1.05, s));
        w[k] = v; if (v > maxW) { maxW = v; top = k; }
      });
      w.lid = w.display || 0;
      // layers come apart one after another, top first
      Object.keys(LIFT).forEach(k => { const p = parts[k]; p.position.copy(p.userData.base); p.position.y += LIFT[k] * ease(seg(s, .25 + DELAY[k], .85 + DELAY[k])); });
      parts.battery.position.z += .7 * (w.battery || 0);
      parts.ssd.position.x -= .8 * (w.ssd || 0); parts.ssd.position.y += .2 * (w.ssd || 0);
      parts.board.position.y += .18 * (w.board || 0);
      parts.keyboard.position.y += .25 * (w.keyboard || 0);
      lid.rotation.x = lerp(-1.92, -Math.PI, e);
      lid.position.set(0, .22 + 2.75 * e, -D / 2 + D * e);
      display.position.y = -.002 - .4 * (w.display || 0);
      rotors.forEach(r => { r.rotation.y += dt * (REDUCE ? 0 : 1.5 + 18 * (w.fans || 0)); });
      Object.keys(parts).forEach(k => {
        const pw = w[k] || 0, op = lerp(1, .22, maxW * (1 - pw)), lit = pw > .5;
        // the lit part is drawn last and keeps its depth, so the see-through layers never cover it
        parts[k].traverse(o => { if ((o as THREE.Mesh).isMesh) o.renderOrder = lit ? 10 : 0; });
        parts[k].userData.mats.forEach(m => {
          m.opacity = op; m.depthWrite = op > .99 || lit;
          if (!m.userData.noTint) m.emissive.copy(m.userData.em).lerp(LIT, pw * .06);
        });
      });
      // the camera stays put and only leans slightly towards the lit part
      want.set(0, lerp(.55, 1.35, e), 0);
      if (top) { parts[top].userData.anchor.getWorldPosition(aw); want.lerp(aw, .12 * maxW); }
      tgt.lerp(want, 1 - Math.exp(-dt * 2.5));
      const az = .72 + s * .04 + (REDUCE ? 0 : Math.sin(t * .2) * .04);
      const el = lerp(.32, .6, e);
      const dist = (lerp(10.6, 11.4, e) - .6 * maxW) / Math.min(1, camera.aspect * 1.05);
      camera.position.set(tgt.x + Math.sin(az) * Math.cos(el) * dist, tgt.y + Math.sin(el) * dist, tgt.z + Math.cos(az) * Math.cos(el) * dist);
      camera.lookAt(tgt);
      st.label = maxW > .3 ? top : ""; st.lw = maxW;
      if (st.label) { parts[top].userData.anchor.getWorldPosition(aw); aw.project(camera); st.x = (aw.x + 1) / 2; st.y = (1 - aw.y) / 2; }
    }
  };
}
const kernCallout = document.getElementById("kern-callout")!;
let kernLabel = "";
export function placeCallout(sc) {
  const c = sc.renderer.domElement, st = sc.st;
  if (!st.label) { kernCallout.style.opacity = "0"; return; }
  if (st.label !== kernLabel) { kernLabel = st.label; kernCallout.querySelector("span")!.textContent = KERN_LABELS[st.label]; }
  const x = st.x * c.clientWidth, y = st.y * c.clientHeight;
  const span = kernCallout.querySelector("span")!;
  // Narrow stage (phones): dot + line + label don't fit beside the part,
  // so only the dot sits on it and the label pins to the stage's top left.
  const narrow = c.clientWidth < 560;
  kernCallout.classList.toggle("narrow", narrow);
  if (narrow) {
    kernCallout.classList.remove("flip");
    span.style.left = `${(12 - x).toFixed(1)}px`;
    span.style.top = `${(12 - y).toFixed(1)}px`;
    kernCallout.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  } else {
    span.style.left = span.style.top = "";
    const flip = x > c.clientWidth - 240;
    kernCallout.classList.toggle("flip", flip);
    kernCallout.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(${flip ? "-100%" : "0"}, -50%)`;
  }
  kernCallout.style.opacity = String(clamp((st.lw - .3) * 3));
}
