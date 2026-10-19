// One shared requestAnimationFrame loop for every canvas on the page; a
// canvas is only drawn while it is on screen.
import { DPR } from "./util";

export interface LoopState {
  cv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  vis: boolean;
  t0: number;
  mx: number;
  my: number;
  inside: boolean;
  draw: (st: LoopState, t: number, dt: number) => void;
  resized?: (st: LoopState) => void;
  [extra: string]: any;
}

/* canvas helper: sized, only drawn while visible */
const loops: LoopState[] = [];
export function canvasLoop(cv: HTMLCanvasElement, draw: LoopState["draw"], opts: { host?: HTMLElement; resized?: LoopState["resized"]; [extra: string]: any } = {}) {
  const ctx = cv.getContext("2d")!;
  const st: LoopState = { cv, ctx, w: 0, h: 0, vis: false, t0: performance.now(), mx: -999, my: -999, draw, inside: false, ...opts };
  const fit = () => { const r = cv.getBoundingClientRect(); st.w = r.width; st.h = r.height; cv.width = Math.max(1, r.width * DPR); cv.height = Math.max(1, r.height * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); st.resized && st.resized(st); };
  fit(); new ResizeObserver(fit).observe(cv);
  new IntersectionObserver(([e]) => { st.vis = e.isIntersecting; }).observe(cv);
  const host = opts.host || cv;
  host.addEventListener("pointermove", (e) => { const r = cv.getBoundingClientRect(); st.mx = e.clientX - r.left; st.my = e.clientY - r.top; st.inside = true; });
  host.addEventListener("pointerleave", () => { st.mx = st.my = -999; st.inside = false; });
  loops.push(st); return st;
}
let lastT = performance.now();
(function tick(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  for (const st of loops) if (st.vis) st.draw(st, (now - st.t0) / 1000, dt);
  requestAnimationFrame(tick);
})(performance.now());
export function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
