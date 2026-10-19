// YourBrand: the five tenants (colours, fonts, menu labels from their tenant.json)
// in the big bento tile and in the first service card.
import { $, $$, RM } from "./util";

/* ---------- tenants: colours, fonts, nav and menu labels from the real tenant.json files ---------- */
const TENANTS = [
  { name: "YourBrand", kind: "Die neutrale Basis. Dunkles Candy-Theme, alle neun Sprachen inklusive Leichter Sprache und Leetspeak.", tier: "Premium", c: "#FF5FC8", bg: "#141218", side: "#1F1C24", ink: "#F3EBF6", on: "#2A0020", font: "'Figtree Variable',sans-serif", nav: "side", items: ["Entdecken", "Matching", "Chat", "Benachrichtigungen", "Admin"], mods: ["Chat", "Matching", "Bezahlung", "Hidden Zone"] },
  { name: "Campus Match", kind: "Dating und Freundschaften an der Uni. Deutsch und Englisch.", tier: "Premium", c: "#F0568C", bg: "#15122B", side: "#211C40", ink: "#F4EFFF", on: "#2B0012", font: "'DM Sans Variable',sans-serif", head: "'Bricolage Grotesque Variable',sans-serif", nav: "top", rad: "12px", items: ["Entdecken", "Matches", "Anfragen", "Ich"], mods: ["Chat", "Matching", "Bezahlung"] },
  { name: "KiezConnect", kind: "Schwarzes Brett für die Nachbarschaft, mit Abreißzetteln wie am echten Brett.", tier: "Core", c: "#C2410C", bg: "#EEF0EC", side: "#FFFFFF", ink: "#1E2226", on: "#FFFFFF", font: "'Archivo',sans-serif", nav: "top", rad: "4px", items: ["Kiez", "Brett", "Anfragen", "Neuigkeiten", "Ich"], mods: ["Chat", "Bezahlung", "Schwarzes Brett"] },
  { name: "Miteinander", kind: "Barrierearm, für betreutes Wohnen. Leichte Sprache als Standard, große Schrift.", tier: "Connect", c: "#1C4FB0", bg: "#FFFFFF", side: "#EEF3FB", ink: "#0E1A2E", on: "#FFFFFF", font: "'Atkinson Hyperlegible',sans-serif", nav: "side", fs: "15px", sidew: "172px", rad: "8px", items: ["Start", "Nachrichten", "Anfragen", "Betreuung", "Ich"], mods: ["Chat", "Betreuung", "Organisation"] },
  { name: "Underground", kind: "Gaming-Crew mit Hidden Zone. Navigation als Linienplan.", tier: "Premium", c: "#FFC400", bg: "#0F1013", side: "#1A1C21", ink: "#ECEDEF", on: "#1A1400", font: "'Figtree Variable',sans-serif", head: "'Big Shoulders Display',sans-serif", nav: "side", rad: "2px", items: ["Leitstand", "Durchsagen", "Crew", "Stellwerk", "Ich"], mods: ["Chat", "Matching", "Bezahlung", "Hidden Zone"] },
];
const dev = $("#device"), tabs = $("#tenantTabs");
let tIdx = 0, tAuto;
TENANTS.forEach((tn, i) => {
  const b = document.createElement("button"); b.type = "button"; b.style.setProperty("--c", tn.c); b.innerHTML = "<i></i>"; b.append(tn.name);
  b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
  b.addEventListener("click", (e) => { setTenant(i, e); clearInterval(tAuto); });
  tabs.appendChild(b);
});
function setTenant(i: number, ev?: MouseEvent) {
  tIdx = i; const tn = TENANTS[i];
  $$("button", tabs).forEach((b, k) => b.setAttribute("aria-pressed", k === i ? "true" : "false"));
  const wipe = $("#wipe"), r = dev.getBoundingClientRect();
  wipe.style.setProperty("--wx", ev && ev.clientX ? (ev.clientX - r.left) + "px" : "50%");
  wipe.style.setProperty("--wy", ev && ev.clientY ? (ev.clientY - r.top) + "px" : "0%");
  wipe.style.setProperty("--wc", tn.c);
  wipe.classList.remove("go"); void wipe.offsetWidth; if (!RM) wipe.classList.add("go");
  setTimeout(() => {
    const s = dev.style;
    [["--t-bg", tn.bg], ["--t-side", tn.side], ["--t-ink", tn.ink], ["--t-acc", tn.c], ["--t-on", tn.on], ["--t-font", tn.font], ["--t-head", tn.head || tn.font], ["--t-fs", tn.fs || "13px"], ["--t-sidew", tn.sidew || "150px"], ["--t-rad", tn.rad || "8px"]].forEach(([k, v]) => s.setProperty(k, v));
    dev.classList.toggle("topbar", tn.nav === "top");
    for (const el of [$("#dTop"), $("#dSide")]) {
      el.textContent = "";
      const br = document.createElement("div"); br.className = "d-brand"; br.innerHTML = "<i></i>"; br.append(tn.name); el.appendChild(br);
      tn.items.forEach((it, k) => { const n = document.createElement("div"); n.className = "d-nav" + (k === 0 ? " on" : ""); n.textContent = it; el.appendChild(n); });
    }
    $("#dTier").textContent = "Paket " + tn.tier;
    $("#dHello").textContent = tn.name;
    $("#dKind").textContent = tn.kind;
    const mods = $("#dMods"); mods.textContent = "";
    tn.mods.forEach((m, k) => { const sp = document.createElement("span"); sp.textContent = m; sp.style.setProperty("--i", String(k)); mods.appendChild(sp); });
  }, RM ? 0 : 280);
}
setTenant(0);
new IntersectionObserver(([e]) => { clearInterval(tAuto); if (e.isIntersecting && !RM) tAuto = setInterval(() => setTenant((tIdx + 1) % TENANTS.length), 4500); }).observe(dev);
let mIdx = 0;
function miniTenant() {
  const tn = TENANTS[mIdx], s = $("#miniApp").style;
  [["--t-bg", tn.bg], ["--t-side", tn.side], ["--t-ink", tn.ink], ["--t-acc", tn.c], ["--t-on", tn.on], ["--t-font", tn.head || tn.font]].forEach(([k, v]) => s.setProperty(k, v));
  $("#miniName").textContent = tn.name; $("#miniKind").textContent = tn.kind.split(".")[0]; $("#miniTier").textContent = tn.tier;
  mIdx = (mIdx + 1) % TENANTS.length;
}
miniTenant(); if (!RM) setInterval(miniTenant, 2800);
