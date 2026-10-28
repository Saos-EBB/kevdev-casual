// Dot portrait in "Über mich". Placeholder until FaceDots gets a real photo.
import { css, watch } from "./util";

/* ---------- about: dot portrait placeholder (FaceDots goes here in the real build) ---------- */
export function mountDots() {
  const cv = document.getElementById("dots") as HTMLCanvasElement, g = cv.getContext("2d")!;
  let mx = -1e3, my = -1e3;
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d; g.setTransform(d, 0, 0, d, 0, 0); };
  new ResizeObserver(size).observe(cv); size();
  cv.addEventListener("pointermove", e => { const b = cv.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; });
  cv.addEventListener("pointerleave", () => { mx = my = -1e3; });
  // a simple head-and-shoulders silhouette as density field
  const dens = (u: number, v: number) => {
    const head = 1 - Math.hypot((u - .5) / .2, (v - .38) / .25);
    const body = 1 - Math.hypot((u - .5) / .42, (v - 1.02) / .34);
    return Math.max(head, body);
  };
  watch(cv, { tick() {
    const w = cv.clientWidth, h = cv.clientHeight, step = 11;
    g.clearRect(0, 0, w, h);
    const fg = css("--fg"), ac = css("--accent");
    for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) {
      const d = dens(x / w, y / h); if (d <= 0) continue;
      let px = x, py = y; const dx = x - mx, dy = y - my, dd = Math.hypot(dx, dy);
      if (dd < 70) { const f = (70 - dd) / 70 * 16; px += dx / dd * f; py += dy / dd * f; }
      const rr = 1 + Math.min(1, d * 2.2) * 2.6;
      g.fillStyle = d > .55 ? ac : fg; g.globalAlpha = .35 + Math.min(.65, d);
      g.beginPath(); g.arc(px, py, rr, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
  } });
}
