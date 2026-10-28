// Demo product pages: three fictional products, one tab each. Each scene is
// built the first time its tab opens and only renders while it is visible.
import "@fontsource/gloock";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource-variable/schibsted-grotesk";
import "@fontsource-variable/martian-mono";
import "@fontsource/bagel-fat-one";
import "@fontsource-variable/rethink-sans";
import "./demos.css";
import { REDUCE, clamp } from "./shared";
import { buildHalde } from "./halde";
import { buildKern, placeCallout } from "./kern";
import { FLAVORS, buildZirbn } from "./zirbn";

document.documentElement.classList.add("js");

const DEMOS = ["halde", "kern", "zirbn"];
/* ================= wiring ================= */
const builders = { halde: buildHalde, kern: buildKern, zirbn: buildZirbn };
const scenes: Record<string, any> = {};
let active: string | null = null;

function sizeScene(sc) {
  const c = sc.renderer.domElement; const w = c.clientWidth, h = c.clientHeight;
  if (!w || !h) return;
  sc.renderer.setSize(w, h, false);
  sc.camera.aspect = w / h; sc.camera.updateProjectionMatrix();
}
function ensureScene(id: string) {
  if (scenes[id]) return scenes[id];
  const canvas = document.getElementById("cv-" + id) as HTMLCanvasElement;
  try {
    const sc = builders[id](canvas);
    sc.visible = true;
    new ResizeObserver(() => sizeScene(sc)).observe(canvas);
    new IntersectionObserver(es => { sc.visible = es[0].isIntersecting; }).observe(canvas);
    sizeScene(sc);
    scenes[id] = sc;
    if (id === "zirbn") sc.setFlavor(FLAVORS[currentFlavor]);
    if (id === "halde") sc.setGlaze(currentGlaze);
  } catch (e) { console.warn("3D nicht verfügbar:", e); }
  return scenes[id];
}
function show(id: string, scroll = true) {
  if (!DEMOS.includes(id)) id = "halde";
  active = id;
  DEMOS.forEach(d => {
    document.getElementById(d)!.hidden = d !== id;
    document.getElementById("tab-" + d)!.setAttribute("aria-selected", String(d === id));
  });
  document.body.style.setProperty("--page", getComputedStyle(document.getElementById(id)!).getPropertyValue("--bg"));
  if (scroll) window.scrollTo(0, 0);
  ensureScene(id);
  if (scenes[id]) sizeScene(scenes[id]);
  try { history.replaceState(null, "", "#" + id); } catch (e) {}
}
document.querySelectorAll<HTMLElement>("[data-go]").forEach(b => b.addEventListener("click", () => show(b.dataset.go!)));

function stepFloat(art: Element) {
  const steps = art.querySelectorAll(".step");
  const anchor = innerHeight * (innerWidth <= 820 ? .74 : .55);
  let sp = 0;
  steps.forEach((el, i) => { const r = el.getBoundingClientRect(); if (r.top <= anchor) sp = i + clamp((anchor - r.top) / r.height); });
  const on = Math.min(steps.length - 1, Math.floor(sp));
  steps.forEach((el, i) => el.classList.toggle("on", i === on));
  return sp;
}
document.querySelectorAll<HTMLElement>("[data-jump]").forEach(b => b.addEventListener("click", () => {
  const step = b.closest(".demo")!.querySelectorAll(".step")[+b.dataset.jump!];
  const y = step.getBoundingClientRect().top + scrollY - innerHeight * (innerWidth <= 820 ? .1 : .05);
  window.scrollTo({ top: y, behavior: REDUCE ? "auto" : "smooth" });
}));
document.querySelectorAll<HTMLElement>("[data-buy]").forEach(b => b.addEventListener("click", () => {
  const old = b.textContent; b.textContent = "Demo: hier ginge es zur Kasse"; setTimeout(() => { b.textContent = old; }, 1800);
}));

// Halde glaze
let currentGlaze = "#2f5d62";
const haldeBuy = document.getElementById("halde-buy")!;
document.querySelectorAll<HTMLElement>("#halde-glaze .swatch").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll("#halde-glaze .swatch").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  currentGlaze = b.dataset.glaze!;
  haldeBuy.textContent = `Halde in ${b.dataset.name} · 49 €`;
  if (scenes.halde) scenes.halde.setGlaze(currentGlaze);
}));

// Zirbn flavors
let currentFlavor = "zirbe";
const zArt = document.getElementById("zirbn")!;
function applyFlavor(key: string) {
  const f = FLAVORS[key]; currentFlavor = key;
  const set = (n: string, v: string) => zArt.style.setProperty(n, v);
  set("--bg", f.bg); set("--fg", f.fg); set("--soft", f.soft); set("--muted", f.muted); set("--accent", f.accent); set("--accent-fg", f.accentFg);
  if (active === "zirbn") document.body.style.setProperty("--page", f.bg);
  document.getElementById("zirbn-desc")!.textContent = f.desc;
  document.querySelectorAll<HTMLElement>("#zirbn-flavors .chip").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.flavor === key)));
  if (scenes.zirbn) scenes.zirbn.setFlavor(f);
}
document.querySelectorAll<HTMLElement>("#zirbn-flavors .chip").forEach(b => b.addEventListener("click", () => applyFlavor(b.dataset.flavor!)));
const band = document.getElementById("zirbn-band")!;
let bandX = 0, lastScroll = scrollY;
band.innerHTML = Array(8).fill("<span>Zischt · Zirbn · Eiskalt ·</span>").join("");

// transform-only reveals: text is readable before they run
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

let last = performance.now();
function frame(now: number) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (active) {
    const art = document.getElementById(active)!;
    const sp = stepFloat(art);
    if (active === "zirbn" && !REDUCE) {
      // runs on its own and speeds up while you scroll
      bandX += dt * 70 + Math.abs(scrollY - lastScroll) * .4;
      band.style.transform = `translateX(${-(bandX % (band.scrollWidth / 2))}px)`;
    }
    lastScroll = scrollY;
    const sc = scenes[active];
    if (sc && sc.visible) { sc.update(sp, now / 1000, dt); sc.renderer.render(sc.scene, sc.camera); if (active === "kern") placeCallout(sc); }
  }
  requestAnimationFrame(frame);
}
const initial = (location.hash || "").slice(1);
show(DEMOS.includes(initial) ? initial : "halde", false);
requestAnimationFrame(frame);
