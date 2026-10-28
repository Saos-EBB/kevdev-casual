// The intro: a stack of Kevin's five business cards (85 × 55 mm). While the
// text steps scroll past, the top card is flicked away to reveal the next one.
import * as THREE from "three";
import { REDUCE, clamp, lerp, smooth, watch } from "./util";

/* ---------- intro: Kevin's business cards ---------- */
function cardCanvas(kind: string) {
  const c = document.createElement("canvas"); c.width = 1020; c.height = 660;
  const g = c.getContext("2d")!;
  const D = '"Gabarito Variable", system-ui, sans-serif', M = '"Martian Mono Variable", ui-monospace, monospace', B = '"Onest Variable", system-ui, sans-serif';
  const ORANGE = "#ec5320", INK = "#12151a";
  const fill = (col) => { g.fillStyle = col; g.fillRect(0, 0, 1020, 660); };
  const t = (txt: string, x: number, y: number, font: string, col: string, align: CanvasTextAlign = "left") => { g.font = font; g.fillStyle = col; g.textAlign = align; g.fillText(txt, x, y); };
  const foot = (n, col) => t(n + " / 05", 950, 610, "500 24px " + M, col, "right");
  const logo = (col, dot = ORANGE) => { t("kev", 70, 112, "800 46px " + D, col); const w = g.measureText("kev").width; t(".", 70 + w, 112, "800 46px " + D, dot); t("dev", 70 + w + g.measureText(".").width, 112, "800 46px " + D, col); };
  if (kind === "back") {
    fill(ORANGE);
    g.globalAlpha = .12; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(900, 560, 90 + i * 70, 0, 7); g.lineWidth = 3; g.strokeStyle = "#fff"; g.stroke(); } g.globalAlpha = 1;
    t("kev.dev", 510, 350, "800 150px " + D, "#ffffff", "center");
    t("Produktseiten, die man anfassen will", 510, 430, "500 26px " + M, "rgba(255,255,255,.8)", "center");
  } else if (kind === "name") {
    fill("#ffffff"); logo(INK);
    t("sofort verfügbar", 950, 112, "500 24px " + M, "#5a6270", "right");
    const aw = g.measureText("sofort verfügbar").width;
    g.fillStyle = "#2fbf71"; g.beginPath(); g.arc(950 - aw - 22, 103, 10, 0, 7); g.fill();
    t("Kevin", 70, 300, "800 140px " + D, INK); t("Schaberl", 70, 430, "800 140px " + D, INK);
    t("Webentwickler · Produktseiten in 3D", 74, 500, "500 36px " + B, "#3a4250");
    t("Linz · remote im DACH-Raum", 74, 610, "500 24px " + M, "#6a7382"); foot("01", "#6a7382");
    g.fillStyle = ORANGE; g.fillRect(0, 640, 1020, 20);
  } else if (kind === "build") {
    fill(INK); logo("#ffffff");
    t("WAS ICH BAUE", 70, 200, "500 26px " + M, ORANGE);
    ["Produktseiten in 3D", "Scroll-Storytelling", "Eigene Handy-Variante"].forEach((s, i) => { t(s, 70, 300 + i * 96, "700 70px " + D, "#ffffff"); });
    foot("02", "rgba(255,255,255,.55)");
  } else if (kind === "tools") {
    fill("#e3e8ee"); logo(INK);
    t("WOMIT", 70, 200, "500 26px " + M, ORANGE);
    const chips = ["TypeScript", "Three.js", "GSAP", "Vite", "React", "PostgreSQL", "Docker", "C++"];
    let x = 70, y = 236;
    g.font = "700 46px " + D;
    chips.forEach(s => {
      const w = g.measureText(s).width + 56;
      if (x + w > 950) { x = 70; y += 96; }
      g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect ? g.roundRect(x, y, w, 74, 37) : g.rect(x, y, w, 74); g.fill();
      t(s, x + 28, y + 53, "700 46px " + D, INK); g.font = "700 46px " + D;
      x += w + 16;
    });
    t("Full-Stack-Bootcamp · Talent Hub Linz", 70, 610, "500 24px " + M, "#6a7382"); foot("03", "#6a7382");
  } else if (kind === "work") {
    fill(ORANGE); logo("#ffffff", INK);
    t("9 Projekte,", 70, 270, "800 100px " + D, "#ffffff"); t("alle solo.", 70, 370, "800 100px " + D, "#ffffff");
    const names = ["YourBrand", "TschoBBo", "kev.dev", "FaceDots", "3D-Renderer", "Oskalizer", "ReleaseWatcher", "AniScript", "Grundlagen"];
    names.forEach((n, i) => t(n, 70 + (i % 3) * 300, 470 + Math.floor(i / 3) * 46, "500 26px " + M, "rgba(255,255,255,.92)"));
    foot("04", "rgba(255,255,255,.7)");
  } else if (kind === "hello") {
    fill("#ffffff"); logo(INK);
    t("SAG HALLO", 70, 220, "500 26px " + M, ORANGE);
    t("kevin.schaberl.work@gmail.com", 70, 320, "700 54px " + D, INK);
    t("github.com/Saos-EBB", 70, 400, "500 38px " + B, "#3a4250");
    t("Ich antworte persönlich.", 70, 610, "500 24px " + M, "#6a7382"); foot("05", "#6a7382");
    g.fillStyle = ORANGE; g.fillRect(0, 640, 1020, 20);
  }
  return c;
}
function stepFloat(root: Element) {
  const steps = root.querySelectorAll<HTMLElement>(".cs-step");
  const anchor = innerHeight * (innerWidth <= 860 ? .8 : .55);
  let sp = 0;
  steps.forEach((el, i) => { const r = el.getBoundingClientRect(); if (r.top <= anchor) sp = i + clamp((anchor - r.top) / r.height); });
  const on = Math.min(steps.length - 1, Math.floor(sp));
  steps.forEach((el, i) => el.classList.toggle("on", i === on));
  return { sp, on };
}
export function mountCards() {
  try {
  const canvas = document.getElementById("cards") as HTMLCanvasElement;
  const intro = document.querySelector(".intro")!;
  const counter = document.getElementById("card-n")!;
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, .1, 80);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c0cc, 1 * Math.PI));

  // 85 × 55 mm card with rounded corners (3 mm radius), built in the XY plane, face towards +z
  const W = 3.4, H = 2.2, R = .12, T = .03;
  const shape = new THREE.Shape();
  shape.moveTo(-W / 2 + R, -H / 2); shape.lineTo(W / 2 - R, -H / 2); shape.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + R);
  shape.lineTo(W / 2, H / 2 - R); shape.quadraticCurveTo(W / 2, H / 2, W / 2 - R, H / 2); shape.lineTo(-W / 2 + R, H / 2);
  shape.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - R); shape.lineTo(-W / 2, -H / 2 + R); shape.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + R, -H / 2);
  const faceGeo = new THREE.ShapeGeometry(shape, 8);
  const bodyGeo = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false, curveSegments: 8 }); bodyGeo.translate(0, 0, -T);
  const edge = new THREE.MeshLambertMaterial({ color: new THREE.Color("#e9ecf0") });
  const tex = cv => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = r.capabilities.getMaxAnisotropy(); t.repeat.set(1 / W, 1 / H); t.offset.set(.5, .5); return t; };
  // soft drop shadow, one per card, so each card shades the ones below it
  const sc = document.createElement("canvas"); sc.width = 256; sc.height = 180;
  const sg = sc.getContext("2d")!; sg.filter = "blur(14px)"; sg.fillStyle = "rgba(20,30,45,.55)"; sg.fillRect(34, 34, 188, 112);
  const shadowTex = new THREE.CanvasTexture(sc);
  const shadowGeo = new THREE.PlaneGeometry(W * 1.36, H * 1.56);

  const KINDS = ["name", "build", "tools", "work", "hello"];
  const N = KINDS.length;
  const backTex = tex(cardCanvas("back"));
  const stack = new THREE.Group(); scene.add(stack);
  const cards = KINDS.map((k, i) => {
    const g = new THREE.Group();
    // own materials per card so a card can fade out on its own while it is flicked away
    const frontMat = new THREE.MeshBasicMaterial({ map: tex(cardCanvas(k)), transparent: true });
    const backMat = new THREE.MeshBasicMaterial({ map: backTex, transparent: true });
    const edgeMat = edge.clone(); edgeMat.transparent = true;
    const front = new THREE.Mesh(faceGeo, frontMat); front.position.z = .001;
    const back = new THREE.Mesh(faceGeo, backMat); back.rotation.y = Math.PI; back.position.z = -T - .001;
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: .5 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat); shadow.position.set(.06, -.1, -T - .012);
    g.add(new THREE.Mesh(bodyGeo, edgeMat), front, back, shadow);
    g.userData = { k, i, frontMat, mats: [frontMat, backMat, edgeMat], shadowMat, jx: Math.sin(i * 7.1) * .09, jy: Math.cos(i * 4.3) * .07, jr: Math.sin(i * 3.7) * .07 };
    stack.add(g); return g;
  });
  const redraw = () => cards.forEach(c => { const t = c.userData.frontMat.map; t.image = cardCanvas(c.userData.k); t.needsUpdate = true; });
  if (document.fonts) document.fonts.ready.then(redraw);

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  canvas.addEventListener("pointermove", e => { const b = canvas.getBoundingClientRect(); tmx = (e.clientX - b.left) / b.width - .5; tmy = (e.clientY - b.top) / b.height - .5; });
  canvas.addEventListener("pointerleave", () => { tmx = tmy = 0; });
  const size = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  new ResizeObserver(size).observe(canvas); size();

  let s = 0;
  watch(canvas, {
    tick(t, dt) {
      const st = stepFloat(intro);
      s = lerp(s, st.sp, 1 - Math.exp(-dt * 3.5));
      counter.textContent = `Karte ${st.on + 1} / ${N}`;
      mx = lerp(mx, tmx, 1 - Math.exp(-dt * 6)); my = lerp(my, tmy, 1 - Math.exp(-dt * 6));
      // the stack leans back like cards on a desk; the mouse tilts it a little
      stack.rotation.set(-.42 + my * .18, -.22 + mx * .3, .05);
      stack.position.y = REDUCE ? 0 : Math.sin(t * 1.2) * .03;
      // a card leaves over most of its step, so the motion follows the scroll instead of snapping
      const outs = cards.map(c => c.userData.i === N - 1 ? 0 : smooth(.3, 1, s - c.userData.i));
      let gone = 0;
      cards.forEach((c, i) => {
        const u = c.userData, out = outs[i];
        const d = Math.max(0, i - gone);             // position in the remaining stack, 0 = top
        gone += out;
        const mess = Math.min(d, 2);
        // flick: lift towards the viewer, drift up, turn and fade out
        // well before it reaches the edge of the canvas
        const fade = 1 - smooth(.35, .85, out);
        c.position.set(u.jx * mess - .7 * out, u.jy * mess + 1.6 * out, -d * .07 + 1.4 * Math.sin(Math.PI * .5 * out));
        c.rotation.set(-.3 * out, .45 * out, u.jr * mess + .55 * out);
        c.visible = fade > .001;
        c.renderOrder = N - i;
        u.mats.forEach(m => { m.opacity = fade; m.depthWrite = fade > .99; });
        u.shadowMat.opacity = .5 * fade * (1 - out);
      });
      // fit the card width (plus tilt and jitter) to the canvas width
      const dist = 4.7 / (.536 * Math.min(cam.aspect, 1.25));
      cam.position.set(0, .15, dist); cam.lookAt(0, 0, 0);
      r.render(scene, cam);
    }
  });
  } catch (e) { console.warn("3D nicht verfügbar:", e); }
}
