// Helpers shared by the three demo scenes.
import * as THREE from "three";

export const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const seg = (x: number, a: number, b: number) => clamp((x - a) / (b - a));
export const col = (h: THREE.ColorRepresentation) => new THREE.Color(h);

export function makeRenderer(canvas: HTMLCanvasElement, shadows = false) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
 
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.setClearColor(0x000000, 0);
  if (shadows) { r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; }
  return r;
}
// Cheap studio environment for reflections: a few bright panels around a soft room.
export function makeEnv(renderer: THREE.WebGLRenderer, wall: string) {
  const env = new THREE.Scene();
  env.background = col(wall);
  const panel = (w: number, h: number, x: number, y: number, z: number, i: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(i, i, i), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  };
  panel(6, 3, 0, 6, 2, 3); panel(3, 5, -6, 1, 1, 1.6); panel(3, 5, 6, 2, -2, 1.2); panel(8, 1, 0, -1, -7, .8);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(env, .04).texture;
  pm.dispose();
  return tex;
}
export function contactShadow(size: number, strength: number) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d")!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(0,0,0,${strength})`); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; return m;
}
export const V = (x: number, y: number) => new THREE.Vector2(x, y);
