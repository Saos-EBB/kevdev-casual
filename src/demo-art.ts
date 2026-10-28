// Small 2D animations on the demo cards, hinting at what each demo does.
import { REDUCE, lerp, watch } from "./util";

export function mountDemoArt() {
  /* ---------- demo card art: small 2D canvases hinting at each demo ---------- */
  function art(id: string, draw: (g: CanvasRenderingContext2D, w: number, h: number, t: number, hover: number) => void) {
    const cv = document.getElementById(id) as HTMLCanvasElement, g = cv.getContext("2d")!;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d; g.setTransform(d, 0, 0, d, 0, 0); };
    new ResizeObserver(size).observe(cv); size();
    let hover = 0, h = 0; const card = cv.parentElement!;
    card.addEventListener("pointerenter", () => { hover = 1; }); card.addEventListener("pointerleave", () => { hover = 0; });
    watch(cv, { tick(t, dt) { h = lerp(h, hover, 1 - Math.exp(-dt * 5)); g.clearRect(0, 0, cv.clientWidth, cv.clientHeight); draw(g, cv.clientWidth, cv.clientHeight, REDUCE ? 0 : t, h); } });
  }
  // Kern: isometric exploded layers
  art("art-kern", (g, w, h, t, hv) => {
    const cx = w * .42, cy = h * .36, s = Math.min(w * .26, h * .3);
    const cols = ["#b8bec5", "#183449", "#2b333b", "#23272c", "#b8bec5"];
    const spread = 22 + 26 * hv + 6 * Math.sin(t * 1.2);
    g.save(); g.translate(cx, cy);
    for (let i = 0; i < 5; i++) {
      const y = (2 - i) * spread;
      g.beginPath(); g.moveTo(0, y - s * .5); g.lineTo(s, y); g.lineTo(0, y + s * .5); g.lineTo(-s, y); g.closePath();
      g.fillStyle = cols[i]; g.globalAlpha = i === 2 ? 1 : .9; g.fill();
      if (i === 2) { g.strokeStyle = "#e8501c"; g.lineWidth = 3; g.stroke(); }
    }
    g.globalAlpha = 1;
    g.fillStyle = "#e8501c"; g.beginPath(); g.arc(s * .55, 0, 6, 0, 7); g.fill();
    g.strokeStyle = "#0d1216"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(s * .55, 0); g.lineTo(s * .95, -40); g.stroke();
    g.fillStyle = "#0d1216"; g.fillRect(s * .95, -54, 128, 28); g.fillStyle = "#e8ebee"; g.font = '500 11px "Martian Mono Variable", monospace'; g.fillText("Akku · 72 Wh", s * .95 + 10, -36);
    g.restore();
  });
  // Halde: dripper silhouette with falling drops
  art("art-halde", (g, w, h, t, hv) => {
    const k = Math.min(1, h / 560), cx = w * .62, cy = 24 + 40 * k;
    g.save(); g.translate(cx, cy); g.scale(k, k); g.translate(-cx, -cy);
    g.fillStyle = "rgba(241,245,243,.16)";
    g.beginPath(); g.moveTo(cx - 70, cy - 40); g.lineTo(cx + 70, cy - 40); g.lineTo(cx + 18, cy + 30); g.lineTo(cx - 18, cy + 30); g.closePath(); g.fill();
    g.fillRect(cx - 40, cy + 30 + 16 * hv, 80, 8);
    for (let i = 0; i < 3; i++) { const k = (t * .9 + i / 3) % 1; g.fillStyle = "rgba(241,245,243,.7)"; g.beginPath(); g.arc(cx, cy + 44 + k * 70, 4, 0, 7); g.fill(); }
    g.fillStyle = "rgba(241,245,243,.16)"; g.beginPath(); g.moveTo(cx - 52, cy + 120); g.lineTo(cx + 52, cy + 120); g.lineTo(cx + 42, cy + 200); g.lineTo(cx - 42, cy + 200); g.closePath(); g.fill();
    g.restore();
  });
  // Zirbn: can with rising bubbles
  art("art-zirbn", (g, w, h, t, hv) => {
    const k = Math.min(1, h / 480), cx = w * .6, cy = 36 + 72 * k;
    g.save(); g.translate(cx, cy); g.scale(k, k); g.rotate(.18 * Math.sin(t * .8) + hv * .25);
    g.fillStyle = "#1f5a3a"; g.beginPath(); g.roundRect ? g.roundRect(-36, -72, 72, 144, 14) : g.rect(-36, -72, 72, 144); g.fill();
    g.fillStyle = "#f2e14c"; g.font = '26px "Bagel Fat One", "Arial Black", sans-serif'; g.textAlign = "center"; g.fillText("Zirbn", 0, 8);
    g.restore();
    for (let i = 0; i < 14; i++) { const k = (t * (.15 + (i % 4) * .05) + i / 14) % 1; const x = cx + Math.sin(i * 2.3) * 80; const y = h * .75 - k * h * .7; g.strokeStyle = "rgba(15,42,23,.35)"; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 3 + (i % 3) * 2, 0, 7); g.stroke(); }
  });
}
