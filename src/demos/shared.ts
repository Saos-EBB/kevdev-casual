// Helpers shared by the three demo scenes.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const seg = (x: number, a: number, b: number) => clamp((x - a) / (b - a));
export const smooth = (a: number, b: number, x: number) => { const k = seg(x, a, b); return k * k * (3 - 2 * k); };
export const col = (h: THREE.ColorRepresentation) => new THREE.Color(h);
export const V = (x: number, y: number) => new THREE.Vector2(x, y);

// A product-photo setup: neutral tone mapping (the Khronos commerce curve, so
// product colours stay true), a soft studio room for reflections and one key
// light that casts a real shadow. `reach` is the half-size of the area the
// shadow has to cover.
export function makeStudio(canvas: HTMLCanvasElement, reach = 3, keyPos: [number, number, number] = [3, 6, 4]) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  pm.dispose();

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(...keyPos);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 7; key.shadow.blurSamples = 16;
  key.shadow.bias = -.0004;
  key.shadow.normalBias = .02;
  const c = key.shadow.camera;
  c.left = c.bottom = -reach; c.right = c.top = reach; c.near = .5; c.far = 30;
  scene.add(key);
  return { renderer, scene, key };
}

// Invisible floor that only shows the shadow falling on it, plus a soft dark
// patch right under the product (what a real studio sweep does).
export function makeGround(size: number, strength = .13) {
  const g = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(size * 3, size * 3), new THREE.ShadowMaterial({ opacity: strength, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const ctx = c.getContext("2d")!; const gr = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(0,0,0,.16)"); gr.addColorStop(.55, "rgba(0,0,0,.04)"); gr.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gr; ctx.fillRect(0, 0, 128, 128);
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  patch.rotation.x = -Math.PI / 2; patch.position.y = .001;
  g.add(floor, patch);
  return g;
}

// Every mesh below `root` casts (and optionally receives) shadows.
export function shade(root: THREE.Object3D, receive = true) {
  root.traverse(o => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = receive; } });
}

// Outline of a rectangle with rounded corners, centred on the origin.
export function rrect(w: number, d: number, r: number) {
  const s = new THREE.Shape(), x = w / 2, y = d / 2;
  s.moveTo(-x + r, -y); s.lineTo(x - r, -y); s.absarc(x - r, -y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x, y - r); s.absarc(x - r, y - r, r, 0, Math.PI / 2, false);
  s.lineTo(-x + r, y); s.absarc(-x + r, y - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-x, -y + r); s.absarc(-x + r, -y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}
// A flat slab with rounded corners lying in the XZ plane, from y = 0 up to y = h.
// `bevel` softens the top and bottom edges.
export function slab(w: number, d: number, h: number, r: number, bevel = 0) {
  const geo = new THREE.ExtrudeGeometry(rrect(w - 2 * bevel, d - 2 * bevel, Math.max(.001, r - bevel)), bevel
    ? { depth: h - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 12 }
    : { depth: h, bevelEnabled: false, curveSegments: 12 });
  geo.rotateX(-Math.PI / 2);
  if (bevel) geo.translate(0, bevel, 0);
  return geo;
}
