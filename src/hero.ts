// Hero: the quiet dot field behind the work card, the wobbling word, the tools strip.
import { $, css, RM } from "./util";
import { canvasLoop } from "./canvas";

/* ---------- hero: a quiet dot field that leans toward the pointer ---------- */
const stage = $("#stage");
canvasLoop($("#field"), (st, t) => {
  const { ctx, w, h } = st; ctx.clearRect(0, 0, w, h);
  const g = 18, acc = css("--acc"), base = css("--ink-3");
  for (let y = g / 2; y < h; y += g) for (let x = g / 2; x < w; x += g) {
    let r = 1.1, a = 0.28, c = base;
    if (st.mx > -900) {
      const d = Math.hypot(x - st.mx, y - st.my), k = Math.max(0, 1 - d / 150);
      if (k > 0) { r = 1.1 + k * 3.2; a = 0.28 + k * 0.6; c = acc; }
    } else if (!RM) {
      const k = Math.max(0, Math.sin(t * 0.8 + x * 0.012 + y * 0.008) - 0.85) / 0.15;
      if (k > 0) { r = 1.1 + k * 1.4; a = 0.28 + k * 0.3; c = acc; }
    }
    ctx.globalAlpha = a; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}, { host: stage });
const alive = $("#alive"), word = alive.textContent; alive.textContent = "";
[...word].forEach((c, j) => { const sp = document.createElement("span"); sp.textContent = c; sp.style.setProperty("--j", String(j)); alive.appendChild(sp); });

/* tools strip */
const tools = ["TypeScript", "NestJS", "PostgreSQL", "PostGIS", "Next.js", "React", "Tailwind", "Docker", "Stripe", "WebSockets", "Redis", "Playwright", "llama.cpp", "Bun", "SQLite", "GSAP", "Canvas 2D", "Python", "Java", "MediaPipe"];
const tt = $("#tools");
for (let k = 0; k < 2; k++) tools.forEach((n) => { const el = document.createElement("span"); el.textContent = n; if (k) el.setAttribute("aria-hidden", "true"); tt.appendChild(el); });
