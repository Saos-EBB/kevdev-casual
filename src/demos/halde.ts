// Halde: ceramic coffee dripper. Parts pull apart, coffee drips, the glaze is selectable.
import * as THREE from "three";
import { REDUCE, V, col, contactShadow, ease, lerp, makeEnv, makeRenderer, seg, smooth } from "./shared";

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

  // A ceramic handle: one smooth strap from the wall out and back into it,
  // with a flattened oval cross-section like pulled clay. Both ends start a
  // little inside the wall, so the open tube ends never show.
  const strap = (pts: [number, number][], r: number) => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0)));
    const geo = new THREE.TubeGeometry(curve, 72, r, 20, false);
    geo.scale(1, 1, .5);
    return new THREE.Mesh(geo, glaze);
  };

  const dripper = new THREE.Group();
  dripper.add(new THREE.Mesh(new THREE.LatheGeometry([V(0, .16), V(.3, .16), V(.98, .98), V(1.06, 1), V(1.06, 1.05), V(.98, 1.06), V(.27, .22), V(0, .22)], 120), glaze));
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(.58, .6, .07, 96), glaze); foot.position.y = .05; dripper.add(foot);
  const footRaw = new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, .016, 96), bisque); footRaw.position.y = .008; dripper.add(footRaw);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.31, .34, .1, 64), glaze); neck.position.y = .12; dripper.add(neck);
  dripper.add(strap([[.86, .86], [1.0, .9], [1.14, .83], [1.19, .68], [1.1, .54], [.9, .48], [.55, .5]], .05));

  // What makes Halde Halde: twelve ribs spiral down the inner wall (the paper
  // only touches the ribs, so air escapes and the water runs evenly) and three
  // 2.5 mm holes in the floor. You see them when the filter lifts out.
  const rIn = (y: number) => .27 + .845 * (y - .22); // inner wall radius at height y
  for (let k = 0; k < 12; k++) {
    const a0 = k / 12 * Math.PI * 2;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24, y = .3 + t * .7, a = a0 + t * 1.15, r = rIn(y) - .012;
      pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    dripper.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, .016, 6, false), glaze));
  }
  const holeMat = new THREE.MeshBasicMaterial({ color: col("#0d1311") });
  for (let k = 0; k < 3; k++) {
    const a = k / 3 * Math.PI * 2 + .5, hole = new THREE.Mesh(new THREE.CircleGeometry(.032, 24), holeMat);
    hole.rotation.x = -Math.PI / 2; hole.position.set(Math.cos(a) * .11, .223, Math.sin(a) * .11); dripper.add(hole);
  }

  // The paper filter follows the inner wall and stands well above the rim,
  // with the glued seam of a real size-02 filter.
  const filter = new THREE.Group();
  // rests on the ribs, .035 inside the wall
  filter.add(new THREE.Mesh(new THREE.LatheGeometry([V(rIn(.26) - .035, .26), V(rIn(1.36) - .035, 1.36)], 72), paper));
  const seamMat = new THREE.MeshStandardMaterial({ color: col("#e0d7c4"), roughness: .95, side: THREE.DoubleSide });
  filter.add(new THREE.Mesh(new THREE.LatheGeometry([V(rIn(.26) - .029, .26), V(rIn(1.36) - .029, 1.36)], 6, .3, .14), seamMat));

  const cup = new THREE.Group();
  cup.add(new THREE.Mesh(new THREE.LatheGeometry([V(0, 0), V(.46, 0), V(.5, .03), V(.61, .74), V(.64, .77), V(.6, .79), V(.56, .76), V(.46, .08), V(0, .08)], 120), glaze));
  const cRaw = new THREE.Mesh(new THREE.CylinderGeometry(.47, .47, .014, 96), bisque); cRaw.position.y = .007; cup.add(cRaw);
  cup.add(strap([[.57, .62], [.69, .67], [.81, .62], [.87, .46], [.83, .3], [.7, .2], [.5, .19]], .05));
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
      s = lerp(s, sp, 1 - Math.exp(-dt * 3.5));
      glaze.color.lerp(target, 1 - Math.exp(-dt * 6));
      const ex = ease(seg(s, .35, 1.25)) * (1 - ease(seg(s, 1.55, 2.1)));
      const cupY = -1.05 - .3 * ex;
      cup.position.y = cupY;
      // while brewing the dripper floats a little above the cup, so you see the drops and the cup filling
      const brewView = smooth(1.5, 2.1, s) * (1 - smooth(2.9, 3.4, s));
      const gap = .55 * brewView;
      dripper.position.y = -.27 + .5 * ex + gap;
      // the filter lifts out and drifts to the side, so the camera can look into the dripper
      filter.position.set(-.8 * ex, -.27 + 1.2 * ex + gap, -.7 * ex);
      filter.rotation.set(0, ex * .6, .35 * ex);
      shadow.position.y = cupY + .002;
      // brewing: drops fall and the cup fills during step 2
      const brew = seg(s, 1.7, 2.9);
      const level = .55 * brew;
      liquid.visible = level > .01;
      liquid.scale.set(lerp(.88, 1, brew), Math.max(level, .001), lerp(.88, 1, brew));
      liquid.position.y = .08 + level / 2;
      const dripOn = seg(s, 1.6, 1.9) * (1 - seg(s, 2.85, 3.1));
      const topY = -.27 + .16 + gap, botY = cupY + .08 + level;
      drops.forEach(d => {
        const k = REDUCE ? d.userData.o : (t * 1.4 + d.userData.o) % 1;
        d.visible = dripOn > .05;
        d.position.set(0, lerp(topY, botY, k * k), 0);
        d.scale.setScalar(dripOn);
      });
      // no constant spin: the piece turns a quarter over the whole story, handles stay readable
      root.rotation.y = -.7 + .9 * ease(seg(s, 0, 3.5)) + (REDUCE ? 0 : Math.sin(t * .35) * .05);
      const dist = (7.4 + 1.7 * ex) / Math.min(1, camera.aspect * 1.15);
      // while the parts are apart the camera rises and looks into the dripper,
      // so the ribs and the three holes show
      const el = lerp(.3, .18, ease(seg(s, 0, 1.2))) + .5 * ex + .22 * brewView;
      camera.position.set(0, Math.sin(el) * dist, Math.cos(el) * dist);
      camera.lookAt(0, -.15 + ex * .7 + .1 * brewView, 0);
    }
  };
}
