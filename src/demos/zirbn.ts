// Zirbn: soda can. Spins with the scroll; switching the flavour recolours label and page.
import * as THREE from "three";
import { REDUCE, V, col, ease, lerp, makeStudio, seg } from "./shared";

export type Flavor = { name: string; can: string; ink: string; pop: string; bg: string; fg: string; soft: string; muted: string; accent: string; accentFg: string; desc: string };
/* ================= Zirbn ================= */
export const FLAVORS: Record<string, Flavor> = {
  zirbe:   { name: "Zirbe & Zitrone",    can: "#1e5638", ink: "#f4efdc", pop: "#e9d94a", bg: "#e6eedb", fg: "#10261a", soft: "#2c4636", muted: "#55705f", accent: "#1e5638", accentFg: "#f4f7ee", desc: "Harzig, frisch, mit Zitrone. Die Sorte, mit der alles angefangen hat." },
  holler:  { name: "Holler & Minze",     can: "#54386f", ink: "#f6effa", pop: "#bfe3cb", bg: "#ece6f3", fg: "#24153a", soft: "#40305a", muted: "#6a5a80", accent: "#54386f", accentFg: "#f8f3fc", desc: "Blumig und mild, mit einem Hauch Minze. Für warme Abende auf dem Balkon." },
  marille: { name: "Marille & Rosmarin", can: "#e2702f", ink: "#fff4e2", pop: "#ffe08a", bg: "#fbeada", fg: "#3a1808", soft: "#5c2e16", muted: "#8b5530", accent: "#b3501c", accentFg: "#fff6ea", desc: "Fruchtig mit Rosmarin. Schmeckt nach Wachau im Juli." }
};
const LW = 2048, LH = 1024;
// The printed label, unrolled: two identical fronts, and between them the
// small print a real can carries (deposit mark, nutrition line, barcode).
function drawLabel(g: CanvasRenderingContext2D, f: Flavor) {
  const D = '"Gabarito Variable", "Arial Black", sans-serif', B = '"Rethink Sans Variable", system-ui, sans-serif';
  g.fillStyle = f.can; g.fillRect(0, 0, LW, LH);
  g.textAlign = "center"; g.textBaseline = "alphabetic";
  const text = (s: string, x: number, y: number, font: string, colr = f.ink, a = 1) => { g.font = font; g.fillStyle = colr; g.globalAlpha = a; g.fillText(s, x, y); g.globalAlpha = 1; };
  [512, 1536].forEach(x => {
    g.globalAlpha = .1; g.fillStyle = f.ink; g.beginPath(); g.arc(x, 500, 330, 0, 7); g.fill(); g.globalAlpha = 1;
    text("KRACHERL AUS DEM MÜHLVIERTEL", x, 212, "700 27px " + B, f.ink, .85);
    // fit the wordmark to the part of the can you see from the front
    let size = 260; g.font = `900 ${size}px ${D}`; size *= Math.min(1, 560 / g.measureText("Zirbn").width);
    text("Zirbn", x, 560, `900 ${size}px ${D}`);
    g.fillStyle = f.pop; g.fillRect(x - 44, 622, 88, 6);
    text(f.name.toUpperCase(), x, 706, "800 44px " + B, f.pop);
    text("330 ml", x, 868, "700 30px " + B, f.ink, .85);
  });
  // back, left of the seam: deposit mark and the nutrition line
  g.strokeStyle = f.ink; g.lineWidth = 5; g.beginPath(); g.arc(1024, 330, 74, 0, 7); g.stroke();
  text("PFAND", 1024, 322, "800 26px " + B); text("25 ct", 1024, 356, "700 26px " + B);
  ["Pro 100 ml: 76 kJ / 18 kcal", "Kohlenhydrate 4,3 g", "davon Zucker 4,1 g", "Fett 0 g · Eiweiß 0 g · Salz 0,01 g"].forEach((s, i) => text(s, 1024, 478 + i * 34, "500 21px " + B, f.ink, .8));
  // barcode
  g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect ? g.roundRect(1024 - 120, 660, 240, 170, 10) : g.rect(1024 - 120, 660, 240, 170); g.fill();
  g.fillStyle = "#111111"; let bx = 1024 - 100, i = 0;
  while (bx < 1024 + 98) { const w = 2 + (Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1) * 5; if (i % 2 === 0) g.fillRect(bx, 676, Math.min(w, 1024 + 100 - bx), 116); bx += w; i++; }
  text("9 012345 678907", 1024, 818, "500 18px " + B, "#111111");
  // thin rings top and bottom, as printed on the real thing
  g.fillStyle = f.ink; g.globalAlpha = .9; g.fillRect(0, 70, LW, 5); g.fillRect(0, LH - 75, LW, 5); g.globalAlpha = 1;
}
export function buildZirbn(canvas: HTMLCanvasElement) {
  const { renderer, scene, key } = makeStudio(canvas, 3, [-3, 5, 5]);
  // the can hangs in the air, there is nothing for a shadow to fall on
  renderer.shadowMap.enabled = false; key.castShadow = false;
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 60);

  const lc = document.createElement("canvas"); lc.width = LW; lc.height = LH;
  const lctx = lc.getContext("2d")!;
  const labelTex = new THREE.CanvasTexture(lc);
  labelTex.colorSpace = THREE.SRGBColorSpace; labelTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const silver = new THREE.MeshStandardMaterial({ color: col("#d9dbdd"), metalness: 1, roughness: .24 });
  // printed aluminium: the metal shines through the ink a little
  const labelMat = new THREE.MeshStandardMaterial({ map: labelTex, metalness: .55, roughness: .34 });
  const paint = new THREE.MeshStandardMaterial({ color: col(FLAVORS.zirbe.can), metalness: .55, roughness: .34 });

  // A standard 330 ml can, turned from its profile: body, tapered shoulder,
  // rolled rim with the recessed lid, and the domed bottom with its foot ring.
  const R = .62, Y0 = -1, Y1 = .88;
  const can = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, Y1 - Y0, 128, 1, true), labelMat); body.position.y = (Y0 + Y1) / 2; can.add(body);
  can.add(new THREE.Mesh(new THREE.LatheGeometry([V(R, Y1), V(.612, .95), V(.585, 1.01), V(.545, 1.06), V(.52, 1.085), V(.515, 1.1)], 128), paint));
  can.add(new THREE.Mesh(new THREE.LatheGeometry([V(.515, 1.1), V(.53, 1.105), V(.538, 1.125), V(.53, 1.145), V(.512, 1.15), V(.498, 1.138), V(.49, 1.1), V(.47, 1.085), V(0, 1.085)], 128), silver));
  can.add(new THREE.Mesh(new THREE.LatheGeometry([V(R, Y0), V(.61, -1.05), V(.57, -1.1), V(.5, -1.14), V(.47, -1.15), V(.44, -1.13), V(.36, -1.07), V(0, -1.03)], 128), silver));
  // pull tab with its finger hole, the rivet and the scored opening
  const tabShape = new THREE.Shape(); tabShape.absellipse(0, 0, .1, .17, 0, Math.PI * 2, false, 0);
  const tabHole = new THREE.Path(); tabHole.absellipse(0, .075, .05, .055, 0, Math.PI * 2, true, 0); tabShape.holes.push(tabHole);
  const tabGeo = new THREE.ExtrudeGeometry(tabShape, { depth: .012, bevelEnabled: true, bevelThickness: .004, bevelSize: .004, bevelSegments: 2, curveSegments: 24 }); tabGeo.rotateX(-Math.PI / 2);
  const tab = new THREE.Mesh(tabGeo, silver); tab.position.set(0, 1.092, .02); can.add(tab);
  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .03, 24), silver); rivet.position.set(0, 1.098, .09); can.add(rivet);
  const score = new THREE.Mesh(new THREE.TorusGeometry(.13, .005, 8, 48), silver); score.rotation.x = Math.PI / 2; score.scale.set(1, 1.3, 1); score.position.set(0, 1.087, .26); can.add(score);

  // "am besten eiskalt": fine condensation on the body
  const dropMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .04, metalness: 0, transparent: true, opacity: .3, depthWrite: false });
  const dew = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), dropMat, 420);
  const tmp = new THREE.Object3D();
  for (let i = 0; i < 420; i++) {
    const a = Math.random() * Math.PI * 2, y = lerp(Y0 + .06, Y1 - .04, Math.random()), sz = .004 + Math.pow(Math.random(), 2) * .009;
    tmp.position.set(Math.cos(a) * R, y, Math.sin(a) * R); tmp.lookAt(Math.cos(a) * 2, y, Math.sin(a) * 2);
    tmp.scale.set(sz, sz * (1 + Math.random() * .5), sz * .45); tmp.updateMatrix(); dew.setMatrixAt(i, tmp.matrix);
  }
  can.add(dew);

  const root = new THREE.Group(); root.add(can); scene.add(root);
  const bubbleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .02, metalness: 0, transparent: true, opacity: .55, depthWrite: false });
  const bubbles: THREE.Mesh[] = [];
  for (let i = 0; i < 22; i++) {
    const r = .01 + Math.random() * .022;
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), bubbleMat);
    m.userData = { a: Math.random() * Math.PI * 2, rad: .95 + Math.random() * .9, y: -1.8 + Math.random() * 3.6, v: .2 + Math.random() * .4 };
    bubbles.push(m); scene.add(m);
  }
  let flavor: Flavor = FLAVORS.zirbe, spinBoost = 0, s = 0;
  const redraw = () => { drawLabel(lctx, flavor); labelTex.needsUpdate = true; };
  redraw();
  if (document.fonts) document.fonts.load('900 200px "Gabarito Variable"').then(() => document.fonts.load('800 44px "Rethink Sans Variable"')).then(redraw, () => {});
  return {
    renderer, scene, camera,
    setFlavor(f: Flavor) { flavor = f; redraw(); paint.color.copy(col(f.can)); spinBoost += Math.PI * 2; },
    update(sp, t, dt) {
      s = lerp(s, sp, 1 - Math.exp(-dt * 4));
      const boostStep = spinBoost * (1 - Math.exp(-dt * 3)); spinBoost -= boostStep;
      can.rotation.y += boostStep + (REDUCE ? 0 : dt * .3);
      const tilt = lerp(.16, -.1, ease(seg(s, 0, 1)));
      const pour = ease(seg(s, 2.4, 3.2));
      root.rotation.z = lerp(tilt, .5, pour);
      root.rotation.x = lerp(.06, .22, pour);
      root.position.y = REDUCE ? 0 : Math.sin(t * 1.1) * .05;
      root.rotation.y = s * .9;
      const spread = 1 + .5 * pour;
      bubbles.forEach(b => {
        const u = b.userData;
        if (!REDUCE) { u.y += u.v * dt; if (u.y > 1.9) u.y = -1.9; }
        b.position.set(Math.cos(u.a + s * .5) * u.rad * spread, u.y, Math.sin(u.a + s * .5) * u.rad * spread);
      });
      const dist = lerp(7.6, 6.4, ease(seg(s, .2, 1.2))) / Math.min(1, camera.aspect * 1.15);
      camera.position.set(0, .35, dist);
      camera.lookAt(0, 0, 0);
    }
  };
}
