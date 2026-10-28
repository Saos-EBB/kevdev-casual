// Halde: ceramic coffee dripper. Parts pull apart, coffee drips, the glaze is selectable.
import * as THREE from "three";
import { REDUCE, V, col, contactShadow, ease, lerp, makeEnv, makeRenderer, seg } from "./shared";

/* ================= Halde ================= */
export function buildHalde(canvas: HTMLCanvasElement) {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  scene.environment = makeEnv(renderer, "#9fb0a8");
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 60);
  scene.add(new THREE.HemisphereLight(col("#f4f7f5"), col("#5f6f68"), .5 * Math.PI));
  const key = new THREE.DirectionalLight(0xffffff, 1.6 * Math.PI); key.position.set(3, 5, 4); scene.add(key);

  const glaze = new THREE.MeshStandardMaterial({ color: col("#2f5d62"), roughness: .22, metalness: 0, side: THREE.DoubleSide });
  const bisque = new THREE.MeshStandardMaterial({ color: col("#cfc6b6"), roughness: .95 });
  const paper = new THREE.MeshStandardMaterial({ color: col("#efe9dc"), roughness: .95, side: THREE.DoubleSide });
  const coffee = new THREE.MeshStandardMaterial({ color: col("#2b170d"), roughness: .08 });

  const root = new THREE.Group(); scene.add(root);

  const dripper = new THREE.Group();
  dripper.add(new THREE.Mesh(new THREE.LatheGeometry([V(0, .16), V(.3, .16), V(.98, .98), V(1.06, 1), V(1.06, 1.05), V(.98, 1.06), V(.27, .22), V(0, .22)], 120), glaze));
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(.58, .6, .07, 96), glaze); foot.position.y = .05; dripper.add(foot);
  const footRaw = new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, .016, 96), bisque); footRaw.position.y = .008; dripper.add(footRaw);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.31, .34, .1, 64), glaze); neck.position.y = .12; dripper.add(neck);
  const dHandle = new THREE.Mesh(new THREE.TorusGeometry(.2, .045, 16, 48, Math.PI), glaze);
  dHandle.rotation.z = -Math.PI / 2; dHandle.position.set(.68, .6, 0); dripper.add(dHandle);

  const filter = new THREE.Mesh(new THREE.LatheGeometry([V(.29, .24), V(.95, 1.13)], 64), paper);

  const cup = new THREE.Group();
  cup.add(new THREE.Mesh(new THREE.LatheGeometry([V(0, 0), V(.46, 0), V(.5, .03), V(.61, .74), V(.64, .77), V(.6, .79), V(.56, .76), V(.46, .08), V(0, .08)], 120), glaze));
  const cRaw = new THREE.Mesh(new THREE.CylinderGeometry(.47, .47, .014, 96), bisque); cRaw.position.y = .007; cup.add(cRaw);
  const cHandle = new THREE.Mesh(new THREE.TorusGeometry(.2, .05, 16, 48, Math.PI), glaze);
  cHandle.rotation.z = -Math.PI / 2; cHandle.position.set(.6, .4, 0); cup.add(cHandle);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(.53, .47, 1, 64), coffee);
  cup.add(liquid);

  const drops: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(.028, 12, 12), coffee); d.userData.o = i / 5; drops.push(d); root.add(d); }
  const shadow = contactShadow(2.4, .35);
  root.add(dripper, filter, cup, shadow);

  const target = new THREE.Color().copy(glaze.color);
  let s = 0;
  return {
    renderer, scene, camera,
    setGlaze(hex) { target.copy(col(hex)); },
    update(sp, t, dt) {
      s = lerp(s, sp, 1 - Math.exp(-dt * 5));
      glaze.color.lerp(target, 1 - Math.exp(-dt * 6));
      const ex = ease(seg(s, .35, 1.25)) * (1 - ease(seg(s, 1.55, 2.1)));
      const cupY = -1.05 - .3 * ex;
      cup.position.y = cupY;
      dripper.position.y = -.27 + .5 * ex;
      filter.position.y = -.27 + 1.15 * ex;
      filter.rotation.y = ex * .6;
      shadow.position.y = cupY + .002;
      // brewing: drops fall and the cup fills during step 2
      const brew = seg(s, 1.7, 2.9);
      const level = .55 * brew;
      liquid.visible = level > .01;
      liquid.scale.set(lerp(.88, 1, brew), Math.max(level, .001), lerp(.88, 1, brew));
      liquid.position.y = .08 + level / 2;
      const dripOn = seg(s, 1.6, 1.9) * (1 - seg(s, 2.85, 3.1));
      const topY = -.27 + .16, botY = cupY + .08 + level;
      drops.forEach(d => {
        const k = REDUCE ? d.userData.o : (t * 1.4 + d.userData.o) % 1;
        d.visible = dripOn > .05;
        d.position.set(0, lerp(topY, botY, k * k), 0);
        d.scale.setScalar(dripOn);
      });
      const spin = REDUCE ? 0 : t * .18;
      root.rotation.y = spin + s * 1.1 - .5;
      root.rotation.x = .05 * Math.sin(s * 1.3);
      const aspect = camera.aspect;
      const dist = 7.2 / Math.min(1, aspect * 1.15) - ex * .4;
      const el = lerp(.32, .14, ease(seg(s, 0, 2)));
      camera.position.set(0, Math.sin(el) * dist, Math.cos(el) * dist);
      camera.lookAt(0, -.15 + ex * .15, 0);
    }
  };
}
