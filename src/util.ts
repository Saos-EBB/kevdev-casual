// Small shared helpers for the canvas and 3D bits of the page.
export const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, x: number) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
export const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

// One shared rAF loop; every canvas only draws while it is on screen.
type Loop = { visible?: boolean; tick: (t: number, dt: number) => void };
const loops: Loop[] = [];
let last = performance.now();
function frame(now: number) { const dt = Math.min(.05, (now - last) / 1000); last = now; loops.forEach(f => f.visible && f.tick(now / 1000, dt)); requestAnimationFrame(frame); }
export function watch(el: Element, obj: Loop) { obj.visible = true; new IntersectionObserver(es => { obj.visible = es[0].isIntersecting; }).observe(el); loops.push(obj); }
requestAnimationFrame(frame);
