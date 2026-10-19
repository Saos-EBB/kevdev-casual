// Page-wide behaviour: theme toggle, reveal on scroll, count-ups, magnetic
// buttons, confetti and the copy-mail button.
import { $, $$, css, DPR, RM } from "./util";


const root = document.documentElement;
try { const t = localStorage.getItem("kev-casual-theme"); if (t) root.dataset.theme = t; } catch (e) {}
$("#themeBtn").addEventListener("click", () => {
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("kev-casual-theme", root.dataset.theme); } catch (e) {}
});

/* reveal + count-up */
function countUp(el) {
  const to = +el.dataset.to; if (RM || !to) { el.textContent = to; return; }
  const t0 = performance.now(), dur = 1200;
  const f = (n) => { const k = Math.min(1, (n - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}
const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); $$(".cnt", e.target).forEach(countUp); rio.unobserve(e.target); } }), { threshold: 0.12 });
$$(".rv").forEach((el) => rio.observe(el));
setTimeout(() => $$(".rv").forEach((el) => el.classList.add("in")), 4000);

/* magnetic buttons */
if (!RM && matchMedia("(pointer:fine)").matches) $$(".magnet").forEach((b) => {
  b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.14}px,${(e.clientY - r.top - r.height / 2) * 0.24}px)`; });
  b.addEventListener("pointerleave", () => b.style.transform = "");
});

/* small confetti in the page's own colours */
const cf = $<HTMLCanvasElement>("#confetti"), cctx = cf.getContext("2d")!;
let parts: { x: number; y: number; vx: number; vy: number; r: number; vr: number; c: string; w: number; life: number }[] = [], cfRun = false;
function fitCf() { cf.width = innerWidth * DPR; cf.height = innerHeight * DPR; cctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
fitCf(); addEventListener("resize", fitCf);
export function burst(x, y, n = 40) {
  if (RM) return;
  const cols = [css("--acc"), css("--ink"), css("--hi")];
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 7; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, c: cols[i % cols.length], w: 5 + Math.random() * 5, life: 1 }); }
  if (!cfRun) { cfRun = true; requestAnimationFrame(cfStep); }
}
function cfStep() {
  cctx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter((p) => p.life > 0);
  for (const p of parts) { p.vy += 0.26; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 0.012; cctx.save(); cctx.translate(p.x, p.y); cctx.rotate(p.r); cctx.globalAlpha = Math.min(1, p.life * 2); cctx.fillStyle = p.c; cctx.fillRect(-p.w / 2, -p.w / 4, p.w, p.w / 2); cctx.restore(); }
  if (parts.length) requestAnimationFrame(cfStep); else { cfRun = false; cctx.clearRect(0, 0, innerWidth, innerHeight); }
}
$("#logo").addEventListener("click", () => scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" }));
const toast = $("#toast");
let toastTimer = 0;
function say(msg: string) { toast.textContent = msg; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2200); }
$("#copyMail").addEventListener("click", (e) => {
  const addr = $("#addr").textContent;
  const ok = () => { say("Adresse kopiert. Bis gleich!"); burst(e.clientX, e.clientY, 50); };
  const fallback = () => { const r = document.createRange(); r.selectNodeContents($("#addr")); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); say("Markiert. Jetzt Strg+C drücken."); };
  try { navigator.clipboard.writeText(addr).then(ok, fallback); } catch (err) { fallback(); }
});
