// Kern 14: repairable laptop. On scroll it comes apart and each part is highlighted with a callout.
import * as THREE from "three";
import { REDUCE, clamp, col, contactShadow, ease, lerp, makeEnv, makeRenderer, seg } from "./shared";

/* ================= Kern 14 ================= */
const KERN_STEPS = ["", "display", "keyboard", "battery", "board", "fans", "ssd"];
const KERN_LABELS = { display: "Display · 14,2″ · 120 Hz", keyboard: "Tastatur · 1,5 mm Hub", battery: "Akku · 72 Wh, gesteckt", board: "Chip · 12 Kerne", fans: "Kühlung · 22 dB(A)", ssd: "SSD · M.2 2280" };
function screenTexture() {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 700;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, 1024, 700); bg.addColorStop(0, "#10212e"); bg.addColorStop(.6, "#1d3a4a"); bg.addColorStop(1, "#e8501c");
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 700);
  g.fillStyle = "rgba(255,255,255,.9)"; g.fillRect(90, 110, 470, 330);
  g.fillStyle = "#10212e"; g.fillRect(90, 110, 470, 34);
  g.fillStyle = "rgba(16,33,46,.18)"; for (let i = 0; i < 7; i++) g.fillRect(120, 180 + i * 34, 300 + (i * 53) % 110, 12);
  g.fillStyle = "rgba(255,255,255,.75)"; g.fillRect(610, 260, 320, 240);
  g.fillStyle = "rgba(255,255,255,.95)"; g.font = '800 64px "Schibsted Grotesk Variable", system-ui, sans-serif'; g.fillText("Kern 14", 90, 600);
  g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(0, 670, 1024, 30);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function buildKern(canvas: HTMLCanvasElement) {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  scene.environment = makeEnv(renderer, "#aab3bc");
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 80);
  scene.add(new THREE.HemisphereLight(0xffffff, col("#6b7480"), .5 * Math.PI));
  const key = new THREE.DirectionalLight(0xffffff, 1.2 * Math.PI); key.position.set(4, 7, 5); scene.add(key);
  const ACC = col("#e8501c");
  const W = 3.1, D = 2.2;
  const parts: Record<string, THREE.Group> = {};
  const part = (k: string, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.userData = { mats: [], base: new THREE.Vector3(x, y, z), anchor: new THREE.Object3D() }; g.add(g.userData.anchor); parts[k] = g; return g; };
  const mat = (k: string, o: THREE.MeshStandardMaterialParameters) => { const m = new THREE.MeshStandardMaterial(Object.assign({ transparent: true }, o)); m.userData.em = m.emissive.clone(); parts[k].userData.mats.push(m); return m; };
  const box = (g: THREE.Object3D, m: THREE.Material, w: number, h: number, d: number, x: number, y: number, z: number) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); return b; };
  const alu = { color: col("#b8bec5"), metalness: .85, roughness: .32 };

  const root = new THREE.Group(); scene.add(root);
  // bottom case
  const kase = part("case"); root.add(kase);
  const mCase = mat("case", alu);
  box(kase, mCase, W, .05, D, 0, .025, 0);
  box(kase, mCase, W, .14, .05, 0, .07, D / 2 - .025); box(kase, mCase, W, .14, .05, 0, .07, -D / 2 + .025);
  box(kase, mCase, .05, .14, D, W / 2 - .025, .07, 0); box(kase, mCase, .05, .14, D, -W / 2 + .025, .07, 0);
  // mainboard + chip + RAM
  const board = part("board", 0, .07, -.45); root.add(board);
  box(board, mat("board", { color: col("#183449"), roughness: .55 }), 1.5, .025, 1.0, 0, 0, 0);
  box(board, mat("board", { color: col("#d0d4d8"), metalness: .9, roughness: .25 }), .34, .03, .34, 0, .028, 0);
  const mRam = mat("board", { color: col("#22262b"), roughness: .5 });
  for (let i = 0; i < 4; i++) box(board, mRam, .14, .02, .2, .5, .022, -.33 + i * .22);
  board.userData.anchor.position.set(0, .05, 0);
  // SSD
  const ssd = part("ssd", -.42, .105, -.2); root.add(ssd);
  box(ssd, mat("ssd", { color: col("#1d2126"), roughness: .5 }), .8, .02, .22, 0, 0, 0);
  box(ssd, mat("ssd", { color: col("#e8ebee"), roughness: .8 }), .42, .004, .16, .1, .012, 0);
  ssd.userData.anchor.position.set(-.3, .02, 0);
  // cooling: two fans + copper heatpipe
  const fans = part("fans", 0, .11, -.62); root.add(fans);
  const mHouse = mat("fans", { color: col("#2a2f35"), roughness: .6 });
  const mBlade = mat("fans", { color: col("#4a525c"), roughness: .5 });
  box(fans, mat("fans", { color: col("#b8733f"), metalness: .9, roughness: .3 }), 2.0, .02, .07, 0, .02, .17);
  const rotors: THREE.Group[] = [];
  [-1.12, 1.12].forEach(x => {
    const h = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .06, 48), mHouse); h.position.set(x, 0, 0); fans.add(h);
    const r = new THREE.Group(); r.position.set(x, .04, 0); fans.add(r); rotors.push(r);
    for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.27, .012, .07), mBlade); b.position.x = .15; const arm = new THREE.Group(); arm.rotation.y = i / 9 * Math.PI * 2; b.rotation.x = .35; arm.add(b); r.add(arm); }
  });
  fans.userData.anchor.position.set(1.12, .05, 0);
  // battery: 6 cells
  const battery = part("battery", 0, .09, .5); root.add(battery);
  const mCell = mat("battery", { color: col("#2b333b"), roughness: .45 });
  const mStripe = mat("battery", { color: col("#e8501c"), roughness: .5 });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { box(battery, mCell, .76, .07, .4, -.82 + i * .82, 0, -.21 + j * .42); box(battery, mStripe, .76, .002, .04, -.82 + i * .82, .036, -.21 + j * .42 - .14); }
  box(battery, mCell, .16, .03, .12, 0, 0, -.5);
  battery.userData.anchor.position.set(.8, .04, .2);
  // keyboard deck
  const keyboard = part("keyboard", 0, .2, 0); root.add(keyboard);
  box(keyboard, mat("keyboard", alu), W, .04, D, 0, 0, 0);
  const mKey = mat("keyboard", { color: col("#23272c"), roughness: .6 });
  const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(.165, .03, .165), mKey, 70);
  const tmp = new THREE.Object3D(); let n = 0;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) { tmp.position.set(-1.235 + c * .19, .03, -.86 + r * .19); tmp.updateMatrix(); keys.setMatrixAt(n++, tmp.matrix); }
  keyboard.add(keys);
  box(keyboard, mKey, .95, .03, .165, 0, .03, .09);
  box(keyboard, mat("keyboard", { color: col("#a9b0b8"), metalness: .7, roughness: .45 }), 1.1, .006, .62, 0, .022, .66);
  keyboard.userData.anchor.position.set(1.0, .05, -.5);
  // lid: hinge at the back edge; display panel on its inner face
  const lid = part("lid", 0, .22, -D / 2); root.add(lid);
  box(lid, mat("lid", alu), W, .04, D, 0, .02, D / 2);
  const display = part("display", 0, -.003, D / 2); lid.add(display);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(W - .18, D - .18), mat("display", { color: 0x000000, emissive: 0xffffff, emissiveMap: screenTexture(), roughness: .25 }));
  panel.material.userData.noTint = true;
  panel.rotation.x = Math.PI / 2; display.add(panel);
  const bezelLine = new THREE.Mesh(new THREE.PlaneGeometry(W - .1, D - .1), mat("display", { color: col("#111417"), roughness: .4 }));
  bezelLine.rotation.x = Math.PI / 2; bezelLine.position.y = .001; display.add(bezelLine);
  display.userData.anchor.position.set(1.1, 0, -.6);

  const shadow = contactShadow(5.2, .28); shadow.position.y = .001; root.add(shadow);

  const LIFT = { case: 0, board: .75, ssd: 1.05, fans: .95, battery: .75, keyboard: 1.65 };
  const tgt = new THREE.Vector3(0, .3, 0), want = new THREE.Vector3(), aw = new THREE.Vector3();
  const st = { s: 0, label: "", lw: 0, x: 0, y: 0 };
  return {
    renderer, scene, camera, st,
    update(sp, t, dt) {
      const s = st.s = lerp(st.s, sp, 1 - Math.exp(-dt * 4));
      const e = ease(seg(s, .3, 1.3));
      const w: Record<string, number> = {}; let maxW = 0, top = "";
      KERN_STEPS.forEach((k, i) => { if (!k) return; const v = clamp(1 - Math.abs(s - (i + .45)) * 1.8); w[k] = v; if (v > maxW) { maxW = v; top = k; } });
      w.lid = w.display || 0;
      Object.keys(LIFT).forEach(k => { const p = parts[k]; p.position.copy(p.userData.base); p.position.y += LIFT[k] * e; });
      parts.battery.position.z += .7 * (w.battery || 0);
      parts.ssd.position.x -= .8 * (w.ssd || 0); parts.ssd.position.y += .2 * (w.ssd || 0);
      parts.board.position.y += .18 * (w.board || 0);
      parts.keyboard.position.y += .25 * (w.keyboard || 0);
      lid.rotation.x = lerp(-1.92, -Math.PI, e);
      lid.position.set(0, .22 + 2.75 * e, -D / 2 + D * e);
      display.position.y = -.003 - .4 * (w.display || 0);
      rotors.forEach(r => { r.rotation.y += dt * (REDUCE ? 0 : 1.5 + 18 * (w.fans || 0)); });
      Object.keys(parts).forEach(k => {
        const pw = w[k] || 0; const op = lerp(1, .14, maxW * (1 - pw));
        parts[k].userData.mats.forEach(m => {
          m.opacity = op; m.depthWrite = op > .9;
          if (!m.userData.noTint) m.emissive.copy(m.userData.em).lerp(ACC, pw * (.42 + .08 * Math.sin(t * 4)));
        });
      });
      want.set(0, lerp(.3, 1.35, e), 0);
      if (top) { parts[top].userData.anchor.getWorldPosition(aw); want.lerp(aw, .4 * maxW); }
      tgt.lerp(want, 1 - Math.exp(-dt * 4));
      const az = .72 + s * .12 + (REDUCE ? 0 : Math.sin(t * .25) * .08);
      const el = lerp(.3, .62, e);
      const dist = (lerp(8.6, 10.6, e) - 1.6 * maxW) / Math.min(1, camera.aspect * 1.05);
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
  const flip = x > c.clientWidth - 240;
  kernCallout.classList.toggle("flip", flip);
  kernCallout.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(${flip ? "-100%" : "0"}, -50%)`;
  kernCallout.style.opacity = String(clamp((st.lw - .3) * 3));
}
