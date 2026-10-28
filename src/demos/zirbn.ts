// Zirbn: soda can. Spins with the scroll; switching the flavour recolours label and page.
import * as THREE from "three";
import { REDUCE, col, ease, lerp, makeEnv, makeRenderer, seg } from "./shared";

export type Flavor = { name: string; can: string; ink: string; bg: string; fg: string; soft: string; muted: string; accent: string; accentFg: string; bit: string; desc: string };
/* ================= Zirbn ================= */
export const FLAVORS: Record<string, Flavor> = {
  zirbe:   { name: "Zirbe & Zitrone",    can: "#1f5a3a", ink: "#f2e14c", bg: "#dcefb6", fg: "#0f2a17", soft: "#23432c", muted: "#3f6249", accent: "#1f5a3a", accentFg: "#f2f7e6", bit: "#f2e14c", desc: "Harzig, frisch, mit Zitrone. Die Sorte, mit der alles angefangen hat." },
  holler:  { name: "Holler & Minze",     can: "#5b3b7a", ink: "#f4eafa", bg: "#eadff3", fg: "#26143a", soft: "#3e2a55", muted: "#64507a", accent: "#5b3b7a", accentFg: "#f8f2fc", bit: "#b9e3c6", desc: "Blumig und mild, mit einem Hauch Minze. Für warme Abende auf dem Balkon." },
  marille: { name: "Marille & Rosmarin", can: "#e0662c", ink: "#fff1d8", bg: "#ffe0c0", fg: "#3a1606", soft: "#5a2a12", muted: "#8a4a26", accent: "#b84a17", accentFg: "#fff6ea", bit: "#6f8f5a", desc: "Fruchtig mit Rosmarin. Schmeckt nach Wachau im Juli." }
};
function drawLabel(ctx: CanvasRenderingContext2D, f: Flavor) {
  const W = 1024, H = 512;
  ctx.fillStyle = f.can; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = f.ink; ctx.globalAlpha = .18;
  for (let i = -2; i < 12; i++) { ctx.beginPath(); ctx.moveTo(i * 110, H); ctx.lineTo(i * 110 + 60, H); ctx.lineTo(i * 110 + 260, 0); ctx.lineTo(i * 110 + 200, 0); ctx.fill(); }
  ctx.globalAlpha = 1;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  [256, 768].forEach(x => {
    ctx.fillStyle = f.ink;
    ctx.font = '132px "Bagel Fat One", "Arial Black", sans-serif';
    ctx.fillText("Zirbn", x, 228);
    ctx.font = '800 34px "Rethink Sans Variable", system-ui, sans-serif';
    ctx.fillText(f.name.toUpperCase(), x, 330);
    ctx.font = '600 22px "Rethink Sans Variable", system-ui, sans-serif';
    ctx.fillText("KRACHERL · 330 ml", x, 110);
    ctx.fillText("4,1 g Zucker / 100 ml", x, 400);
  });
  ctx.fillStyle = f.ink; ctx.fillRect(0, 30, W, 6); ctx.fillRect(0, H - 36, W, 6);
}
export function buildZirbn(canvas: HTMLCanvasElement) {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  scene.environment = makeEnv(renderer, "#c8c8c8");
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 60);
  scene.add(new THREE.HemisphereLight(0xffffff, col("#888888"), .45 * Math.PI));
  const key = new THREE.DirectionalLight(0xffffff, 1.4 * Math.PI); key.position.set(-3, 4, 5); scene.add(key);

  const lc = document.createElement("canvas"); lc.width = 1024; lc.height = 512;
  const lctx = lc.getContext("2d")!;
  const labelTex = new THREE.CanvasTexture(lc);
  labelTex.colorSpace = THREE.SRGBColorSpace; labelTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const silver = new THREE.MeshStandardMaterial({ color: col("#d4d6d8"), metalness: 1, roughness: .22 });
  const labelMat = new THREE.MeshStandardMaterial({ map: labelTex, metalness: .35, roughness: .3 });

  const can = new THREE.Group();
  can.add(new THREE.Mesh(new THREE.CylinderGeometry(.62, .62, 2, 96, 1, true), labelMat));
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(.5, .62, .16, 96, 1, true), silver); shoulder.position.y = 1.08; can.add(shoulder);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .02, 96), silver); lid.position.y = 1.14; can.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.5, .028, 16, 96), silver); rim.rotation.x = Math.PI / 2; rim.position.y = 1.16; can.add(rim);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(.16, .015, .32), silver); tab.position.set(0, 1.16, .12); can.add(tab);
  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(.62, .5, .12, 96, 1, true), silver); bottom.position.y = -1.06; can.add(bottom);
  const floorCap = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .01, 64), silver); floorCap.position.y = -1.12; can.add(floorCap);

  const root = new THREE.Group(); root.add(can); scene.add(root);
  const bubbleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .05, metalness: 0, transparent: true, opacity: .6 });
  const bubbles: THREE.Mesh[] = [];
  for (let i = 0; i < 34; i++) {
    const r = .02 + Math.random() * .045;
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), bubbleMat);
    m.userData = { a: Math.random() * Math.PI * 2, rad: .85 + Math.random() * .9, y: -1.8 + Math.random() * 3.6, v: .25 + Math.random() * .5 };
    bubbles.push(m); scene.add(m);
  }
  const bitMat = new THREE.MeshStandardMaterial({ color: col(FLAVORS.zirbe.bit), roughness: .5, flatShading: true });
  const bits: THREE.Mesh[] = [];
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(.1 + Math.random() * .07, 0), bitMat);
    m.scale.y = .55; m.userData = { a: i / 9 * Math.PI * 2, rad: 1.35 + Math.random() * .5, y: -1 + Math.random() * 2, sp: .2 + Math.random() * .25 };
    bits.push(m); scene.add(m);
  }
  let flavor: Flavor = FLAVORS.zirbe, spinBoost = 0, s = 0;
  const redraw = () => { drawLabel(lctx, flavor); labelTex.needsUpdate = true; };
  redraw();
  if (document.fonts) document.fonts.load('132px "Bagel Fat One"').then(() => document.fonts.load('800 34px "Rethink Sans Variable"')).then(redraw, () => {});
  return {
    renderer, scene, camera,
    setFlavor(f: Flavor) { flavor = f; redraw(); bitMat.color.copy(col(f.bit)); spinBoost += Math.PI * 2; },
    update(sp, t, dt) {
      s = lerp(s, sp, 1 - Math.exp(-dt * 4));
      const boostStep = spinBoost * (1 - Math.exp(-dt * 3)); spinBoost -= boostStep;
      can.rotation.y += boostStep + (REDUCE ? 0 : dt * .35);
      const tilt = lerp(.2, -.12, ease(seg(s, 0, 1)));
      const pour = ease(seg(s, 2.4, 3.2));
      root.rotation.z = lerp(tilt, .55, pour);
      root.rotation.x = lerp(.08, .25, pour);
      root.position.y = REDUCE ? 0 : Math.sin(t * 1.1) * .06;
      root.rotation.y = s * .9;
      const spread = 1 + .5 * pour;
      bubbles.forEach(b => {
        const u = b.userData;
        if (!REDUCE) { u.y += u.v * dt; if (u.y > 1.9) u.y = -1.9; }
        b.position.set(Math.cos(u.a + s * .5) * u.rad * spread, u.y, Math.sin(u.a + s * .5) * u.rad * spread);
      });
      bits.forEach(b => {
        const u = b.userData; const a = u.a + (REDUCE ? 0 : t * u.sp) + s * .8;
        b.position.set(Math.cos(a) * u.rad * spread, u.y + Math.sin(a * 2) * .15, Math.sin(a) * u.rad * spread);
        b.rotation.set(a * 1.3, a, a * .7);
      });
      const dist = lerp(7.4, 6.2, ease(seg(s, .2, 1.2))) / Math.min(1, camera.aspect * 1.15);
      camera.position.set(0, .4, dist);
      camera.lookAt(0, 0, 0);
    }
  };
}
