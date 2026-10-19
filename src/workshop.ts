// The service cards and bento tiles: one small live demo per project.
import { $, $$, css, lerp, RM } from "./util";
import { canvasLoop, roundRect } from "./canvas";

/* service 2: postings sorted into three bins (TschoBBo's real verdicts) */
const sortItems: any[] = [];
canvasLoop($("#svcInbox"), (st, _t, dt) => {
  const { ctx, w, h } = st; ctx.clearRect(0, 0, w, h);
  const bins = ["matched", "offstack", "brutal"], bw = (w - 60) / 3;
  bins.forEach((n, i) => {
    const x = 20 + i * (bw + 10), y = h - 60;
    ctx.fillStyle = i === 0 ? css("--acc") : css("--surface"); roundRect(ctx, x, y, bw, 42, 10); ctx.fill();
    ctx.strokeStyle = css("--line"); if (i) ctx.stroke();
    ctx.fillStyle = i === 0 ? css("--acc-ink") : css("--ink-2"); ctx.font = "500 12px 'JetBrains Mono Variable', monospace"; ctx.textAlign = "center"; ctx.fillText(n, x + bw / 2, y + 25);
  });
  if (!RM && sortItems.length < 5 && Math.random() < dt * 1.4) sortItems.push({ x: w / 2 + (Math.random() - 0.5) * 30, bin: Math.random() < 0.45 ? 0 : (Math.random() < 0.6 ? 1 : 2), p: 0 });
  for (let k = sortItems.length - 1; k >= 0; k--) {
    const it = sortItems[k], tx = 20 + it.bin * (bw + 10) + bw / 2;
    it.p = Math.min(1, it.p + dt * 0.5);
    let x = it.x, y = lerp(-30, h * 0.34, Math.min(1, it.p / 0.4));
    if (it.p > 0.5) { const q = (it.p - 0.5) / 0.5, qq = q * q * (3 - 2 * q); x = lerp(it.x, tx, qq); y = lerp(h * 0.34, h - 66, qq * qq); }
    ctx.globalAlpha = it.p > 0.92 ? (1 - it.p) / 0.08 : 1;
    ctx.fillStyle = css("--surface"); roundRect(ctx, x - 44, y - 15, 88, 30, 8); ctx.fill(); ctx.strokeStyle = css("--line"); ctx.stroke();
    ctx.fillStyle = css("--ink-2"); ctx.fillRect(x - 34, y - 5, 32, 3); ctx.fillStyle = css("--line"); ctx.fillRect(x - 34, y + 3, 52, 3);
    ctx.globalAlpha = 1; if (it.p >= 1) sortItems.splice(k, 1);
  }
  if (RM) { ctx.fillStyle = css("--ink-2"); ctx.font = "500 13px 'Figtree Variable', sans-serif"; ctx.textAlign = "center"; ctx.fillText("Stellen werden vorsortiert", w / 2, h * 0.35); }
});

/* cloth */
function makeCloth(cv, label) {
  let pts: any[] = [], cols = 0, rows = 0; const gap = 18;
  canvasLoop(cv, (st, t) => {
    const { ctx, w, h } = st; ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      const wind = RM ? 0 : Math.sin(t * 1.5 + p.c * 0.5 + p.r * 0.3) * 1.1;
      let fx = (p.ox - p.x) * 0.06 + wind * 0.08, fy = (p.oy - p.y) * 0.06;
      if (st.mx > -900) { const dx = p.x - st.mx, dy = p.y - st.my, d = Math.hypot(dx, dy); if (d < 70) { const f = (70 - d) / 70; fx += dx / (d || 1) * f * 6; fy += dy / (d || 1) * f * 6; } }
      p.vx = (p.vx + fx) * 0.86; p.vy = (p.vy + fy) * 0.86; p.x += p.vx; p.y += p.vy;
    }
    ctx.lineWidth = 1.2; ctx.strokeStyle = css("--ink-3"); ctx.globalAlpha = 0.55; ctx.beginPath();
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const p = pts[r * cols + c];
      if (c < cols - 1) { const q = pts[r * cols + c + 1]; ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
      if (r < rows - 1) { const q = pts[(r + 1) * cols + c]; ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
    }
    ctx.stroke(); ctx.globalAlpha = 1;
    const p = pts[Math.floor(rows / 2) * cols + Math.floor(cols / 2)];
    if (p) { ctx.fillStyle = css("--acc"); ctx.font = `700 ${Math.min(40, w / 7)}px "Bricolage Grotesque Variable", sans-serif`; ctx.textAlign = "center"; ctx.fillText(label, p.x, p.y + 12); }
  }, { resized: (st) => { cols = Math.max(4, Math.floor((st.w - 30) / gap)); rows = Math.max(4, Math.floor((st.h - 30) / gap)); const ox = (st.w - (cols - 1) * gap) / 2, oy = (st.h - (rows - 1) * gap) / 2; pts = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pts.push({ x: ox + c * gap, y: oy + r * gap, ox: ox + c * gap, oy: oy + r * gap, vx: 0, vy: 0, r, c }); } });
}
makeCloth($("#svcCloth"), "fass mich an");
makeCloth($("#tCloth"), "kev.dev");

/* TschoBBo pipeline (stages and statuses from the JoBBoT repo) */
const IC = {
  search: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="9" cy="9" r="5"/><path d="M13 13l4 4"/></svg>',
  filter: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 5h14l-5 6v5l-4-2v-3z"/></svg>',
  pen: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 16l1-4 8-8 3 3-8 8z"/></svg>',
  eye: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"/><circle cx="10" cy="10" r="2.2"/></svg>',
  mail: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="5" width="14" height="10" rx="2"/><path d="M3.5 6l6.5 5 6.5-5"/></svg>',
};
const STAGES = [["search", "Suchen", "new"], ["filter", "Filtern", "triaged"], ["pen", "Entwurf", "generated"], ["eye", "Prüfen", "freigegeben"], ["mail", "Gmail", "postausgang"]];
const pipe = $("#pipe");
STAGES.forEach(([ic, n, s]) => { const d = document.createElement("div"); d.className = "st"; d.innerHTML = `<b aria-hidden="true">${IC[ic]}</b><span></span><code></code>`; $("span", d).textContent = n; $("code", d).textContent = s; pipe.appendChild(d); });
let pStep = 0, jobNo = 14;
function stepPipe() {
  const st = $$(".st", pipe); st.forEach((e, k) => e.classList.toggle("on", k === pStep));
  const card = $("#jobcard"), pr = $("#pipeVis").getBoundingClientRect(), tr = st[pStep].getBoundingClientRect();
  card.style.left = (tr.left - pr.left + tr.width / 2 - card.offsetWidth / 2) + "px";
  pStep++; if (pStep >= STAGES.length) { pStep = 0; setTimeout(() => { jobNo++; card.textContent = "job #" + jobNo; }, 700); }
}
stepPipe(); if (!RM) setInterval(stepPipe, 1400);

/* Oskalizer (A–Z from woerter.json) */
const OSK = { A: ["Affe", "🐒"], B: ["Bär", "🐻"], C: ["Chamäleon", "🦎"], D: ["Delfin", "🐬"], E: ["Elefant", "🐘"], F: ["Frosch", "🐸"], G: ["Giraffe", "🦒"], H: ["Hund", "🐶"], I: ["Igel", "🦔"], J: ["Jaguar", "🐆"], K: ["Katze", "🐱"], L: ["Löwe", "🦁"], M: ["Maus", "🐭"], N: ["Nashorn", "🦏"], O: ["Oktopus", "🐙"], P: ["Pinguin", "🐧"], Q: ["Qualle", "🪼"], R: ["Raupe", "🐛"], S: ["Schwein", "🐷"], T: ["Tiger", "🐯"], U: ["Uhu", "🦉"], V: ["Vogel", "🐦"], W: ["Wal", "🐳"], X: ["Xerus", "🐿️"], Y: ["Yak", "🐃"], Z: ["Zebra", "🦓"] };
const osk = $("#osk"); let oskHover = false;
osk.addEventListener("pointerenter", () => oskHover = true); osk.addEventListener("pointerleave", () => oskHover = false);
function oskPress(L: string, x?: number, y?: number) {
  const [n, e] = OSK[L];
  $("#oskL").textContent = L; $("#oskE").textContent = e; $("#oskS").textContent = `${L} wie ${n}`;
  osk.classList.remove("hit"); void osk.offsetWidth; osk.classList.add("hit"); setTimeout(() => osk.classList.remove("hit"), 240);
  if (RM) return;
  const r = osk.getBoundingClientRect(), sp = document.createElement("span"), sz = 90;
  sp.className = "ring"; sp.style.cssText = `width:${sz}px;height:${sz}px;left:${(x ?? r.width / 2) - sz / 2}px;top:${(y ?? r.height / 2) - sz / 2}px`;
  osk.appendChild(sp); setTimeout(() => sp.remove(), 900);
}
osk.addEventListener("click", (e) => { const r = osk.getBoundingClientRect(), ks = Object.keys(OSK); oskPress(ks[Math.floor(Math.random() * ks.length)], e.clientX - r.left, e.clientY - r.top); });
addEventListener("keydown", (e) => { if (!(oskHover || document.activeElement === osk)) return; const L = (e.key || "").toUpperCase(); if (OSK[L]) { e.preventDefault(); oskPress(L); } });

/* ReleaseWatcher calendar */
const SRC = ["TMDB", "AniList", "MangaDex", "TVDB"];
const calPops: any[] = [];
canvasLoop($("#tCal"), (st, _t, dt) => {
  const { ctx, w, h } = st; ctx.clearRect(0, 0, w, h);
  const cols = 7, rows = 4, pad = 16, top = 38, cw = (w - pad * 2) / cols, ch = (h - top - pad) / rows;
  ctx.font = "500 10.5px 'JetBrains Mono Variable', monospace"; ctx.textAlign = "center"; ctx.fillStyle = css("--ink-3");
  ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].forEach((d, i) => ctx.fillText(d, pad + cw * i + cw / 2, 26));
  ctx.fillStyle = css("--surface");
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { roundRect(ctx, pad + c * cw + 3, top + r * ch + 3, cw - 6, ch - 6, 7); ctx.fill(); }
  if (!RM && Math.random() < dt * 1.2 && calPops.length < 8) calPops.push({ c: Math.floor(Math.random() * cols), r: Math.floor(Math.random() * rows), s: SRC[Math.floor(Math.random() * 4)], age: 0 });
  if (RM && !calPops.length) for (let k = 0; k < 6; k++) calPops.push({ c: (k * 3) % 7, r: k % 4, s: SRC[k % 4], age: 1 });
  for (let k = calPops.length - 1; k >= 0; k--) {
    const p = calPops[k]; if (!RM) p.age += dt;
    const x = pad + p.c * cw + cw / 2, y = top + p.r * ch + ch / 2;
    const sc = p.age < 0.35 ? 1 + Math.sin(p.age / 0.35 * Math.PI) * 0.35 : 1, a = p.age > 3.2 ? Math.max(0, 1 - (p.age - 3.2) / 0.6) : 1;
    ctx.globalAlpha = a; ctx.fillStyle = css("--acc"); ctx.beginPath(); ctx.arc(x, y - 5, Math.min(cw, ch) * 0.13 * sc, 0, 7); ctx.fill();
    ctx.fillStyle = css("--ink-2"); ctx.font = "500 9.5px 'JetBrains Mono Variable', monospace"; ctx.fillText(p.s, x, y + Math.min(cw, ch) * 0.3);
    ctx.globalAlpha = 1; if (a <= 0) calPops.splice(k, 1);
  }
});

/* cube */
const V = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
let cubeA = 0.6, cubeB = 0.4;
canvasLoop($("#tCube"), (st, _t, dt) => {
  const { ctx, w, h } = st; ctx.clearRect(0, 0, w, h);
  const tgt = st.mx > -900 ? (st.mx / w - 0.5) * 3 : null;
  if (!RM) cubeA += dt * 0.6; cubeB = tgt !== null ? lerp(cubeB, tgt, 0.08) : cubeB + (RM ? 0 : dt * 0.4);
  const s = Math.min(w, h) * 0.85;
  const P = V.map(([x, y, z]) => { let c = Math.cos(cubeA), sn = Math.sin(cubeA); [x, z] = [x * c - z * sn, x * sn + z * c]; c = Math.cos(cubeB); sn = Math.sin(cubeB); [y, z] = [y * c - z * sn, y * sn + z * c]; z += 4; return [w / 2 + x / z * s * 0.9, h / 2 + y / z * s * 0.9, z]; });
  E.forEach(([a, b]) => { const za = (P[a][2] + P[b][2]) / 2; ctx.strokeStyle = css("--acc"); ctx.globalAlpha = Math.max(0.2, Math.min(1, (6 - za) / 2.6)); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P[a][0], P[a][1]); ctx.lineTo(P[b][0], P[b][1]); ctx.stroke(); });
  ctx.globalAlpha = 1; ctx.fillStyle = css("--ink"); P.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 2.8, 0, 7); ctx.fill(); });
  ctx.fillStyle = css("--ink-3"); ctx.font = "500 11px 'JetBrains Mono Variable', monospace"; ctx.textAlign = "left"; ctx.fillText("x' = x / z", 12, 20);
});

/* dots face */
function makeDots(cv) {
  let dots: any[] = [];
  canvasLoop(cv, (st) => {
    const { ctx, w, h } = st; ctx.clearRect(0, 0, w, h); ctx.fillStyle = css("--acc");
    ctx.beginPath();
    for (const d of dots) {
      let fx = (d.ox - d.x) * 0.08, fy = (d.oy - d.y) * 0.08;
      if (st.mx > -900) { const dx = d.x - st.mx, dy = d.y - st.my, dd = Math.hypot(dx, dy); if (dd < 60) { const f = (60 - dd) / 60; fx += dx / (dd || 1) * f * 5; fy += dy / (dd || 1) * f * 5; } }
      d.vx = (d.vx + fx) * 0.82; d.vy = (d.vy + fy) * 0.82; d.x += d.vx; d.y += d.vy;
      ctx.moveTo(d.x + d.r, d.y); ctx.arc(d.x, d.y, d.r, 0, 7);
    }
    ctx.fill();
  }, { resized: (st) => {
    dots = []; const g = Math.max(8, Math.min(st.w, st.h) / 30), cx = st.w / 2, cy = st.h * 0.52, R = Math.min(st.w, st.h) * 0.36;
    for (let y = g / 2; y < st.h; y += g) for (let x = g / 2; x < st.w; x += g) {
      const nx = (x - cx) / R, ny = (y - cy) / R; let b = 0; const head = nx * nx / 0.78 + ny * ny;
      if (head < 1) b = 0.45 + 0.45 * (1 - head);
      if (ny < -0.45 && ny > -1.05 && Math.abs(nx) < 0.95 - (ny + 1) * 0.1 && head < 1.25) b = 0.95;
      if (ny > -0.5 && ny < -0.38 && nx > -0.2 && nx < 1.25) b = 0.95;
      if (Math.hypot(nx + 0.32, ny + 0.05) < 0.11 || Math.hypot(nx - 0.32, ny + 0.05) < 0.11) b = 0.1;
      const sm = Math.hypot(nx, ny - 0.15); if (sm > 0.38 && sm < 0.48 && ny > 0.3) b = 0.1;
      if (b > 0) dots.push({ x, y, ox: x, oy: y, vx: 0, vy: 0, r: g * 0.46 * b });
    }
  } });
}
makeDots($("#tDots")); makeDots($("#polaDots"));

/* terminal */
const termLines = ["$ java Mastermind", "Rate die Farben: RGBY", "> R G B Y", "  ●●○○  2 richtig", "> R G Y B", "  ●●●●  geschafft!"];
canvasLoop($("#tTerm"), (st, t) => {
  const { ctx, w, h } = st; ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#17141C"; roundRect(ctx, 12, 12, w - 24, h - 24, 12); ctx.fill();
  ctx.fillStyle = "#3A3542"; [0, 1, 2].forEach((i) => { ctx.beginPath(); ctx.arc(28 + i * 14, 28, 4, 0, 7); ctx.fill(); });
  let chars = RM ? 999 : (t % 9) * 14;
  ctx.font = "500 12.5px 'JetBrains Mono Variable', monospace"; ctx.textAlign = "left";
  termLines.forEach((ln, i) => { if (chars <= 0) return; const s = ln.slice(0, Math.max(0, Math.floor(chars))); chars -= ln.length + 4; ctx.fillStyle = ln.startsWith("$") ? "#B9A8FF" : "#E6E1EC"; ctx.fillText(s, 26, 56 + i * 20); });
});

/* AniScript bars */
const barA = $("#barA"), barB = $("#barB"); barA.style.width = barB.style.width = "8%";
new IntersectionObserver(([e]) => { if (e.isIntersecting) { barA.style.width = "100%"; barB.style.width = "20%"; } }, { threshold: .5 }).observe($("#aniVis"));
