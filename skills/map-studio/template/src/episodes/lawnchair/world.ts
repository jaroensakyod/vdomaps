// The whole film as one three.js scene: sky, sunlit suburb (ranch houses, lawns, streets, palms), Larry's backyard
// (fence, patio, Jeep), the neighbour's pool, the street with the power line, a cloud sea, the far town and ocean seen
// from 16,000 ft, the airliner, the museum hall, and the lawn chair rig (chair, 42 balloons on strings, tether, cable,
// water jugs) posed every frame from story.ts. update(id, f, camera) is a pure function of id + f.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, quad, tri } from "./build";
import { ctex, rep, grassHD, facadeHD, roofHD, cloudHD, rng } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone, twoTone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import {
  FPS, SHOTS, ShotDef, V3, CLOUD_Y, HOOK, JEEP, POOL, POLES_Z, WIRE_Y, CATCH, FRONT, MUSEUM, PEDESTAL_H, W,
  camAt, chairAt, planeAt, smallPlaneAt, clamp01,
} from "./story";
import { BALLOONS, bob } from "./balloons";

const SUN_SHOT: Record<number, { az?: number; el?: number }> = {
  1: { az: 110, el: 40 }, 7: { az: 140, el: 55 }, 14: { az: 120, el: 50 }, 17: { az: 140, el: 62 },
};

// ---------------- painted textures ----------------
const asphalt = () => ctex("asphalt", 512, 512, (g, r) => {
  g.fillStyle = "#6f7077"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"; g.fillRect(r() * 512, r() * 512, 3, 3); }
});
const concrete = () => ctex("concrete", 512, 512, (g, r) => {
  g.fillStyle = "#e6dfcf"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 400; i++) { g.fillStyle = "rgba(120,100,80,0.05)"; g.beginPath(); g.arc(r() * 512, r() * 512, 2 + r() * 10, 0, 7); g.fill(); }
  g.fillStyle = "rgba(90,75,60,0.35)"; g.fillRect(0, 0, 512, 3); g.fillRect(0, 0, 3, 512);
});
const fenceTex = () => ctex("fence", 512, 256, (g, r) => {
  g.fillStyle = "#c99a68"; g.fillRect(0, 0, 512, 256);
  for (let x = 0; x < 512; x += 32) {
    g.fillStyle = `rgba(${r() > 0.5 ? "255,240,220" : "90,60,40"},0.08)`; g.fillRect(x, 0, 32, 256);
    g.fillStyle = "rgba(70,45,30,0.55)"; g.fillRect(x, 0, 3, 256);
  }
});
const poolTile = () => ctex("poolTile", 256, 256, (g) => {
  g.fillStyle = "#7fd0e8"; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(30,90,140,0.35)"; for (let i = 0; i <= 256; i += 32) { g.fillRect(i, 0, 2, 256); g.fillRect(0, i, 256, 2); }
});
/** the suburb seen from the sky: 240 m tile of streets, lots, roofs and pools */
const suburbTex = () => ctex("suburb", 1024, 1024, (g, r) => {
  const S = 1024, px = S / 240;
  g.fillStyle = "#9cbf6a"; g.fillRect(0, 0, S, S);
  const roofs = ["#b45c45", "#8a6f5a", "#7d7f86", "#c98a62", "#a9715a"];
  for (let z = 0; z < 240; z += 60) {
    g.fillStyle = "#8b8c91"; g.fillRect(0, z * px, S, 9 * px);
    for (let x = 0; x < 240; x += 24) {
      for (const side of [0, 1]) {
        const lz = z + (side ? 40 : 14);
        g.fillStyle = r() > 0.5 ? "#a7c873" : "#93b763"; g.fillRect((x + 1) * px, (z + (side ? 31 : 9)) * px, 22 * px, 20 * px);
        g.fillStyle = roofs[Math.floor(r() * roofs.length)]; g.fillRect((x + 4) * px, (lz - 5) * px, 16 * px, 10 * px);
        if (r() > 0.75) { g.fillStyle = "#5ec4e0"; g.fillRect((x + 8) * px, (lz + (side ? -12 : 7)) * px, 7 * px, 3.5 * px); }
        if (r() > 0.6) { g.fillStyle = "#4f8a3c"; g.beginPath(); g.arc((x + 2 + r() * 20) * px, (z + 20 + r() * 20) * px, 2.6 * px, 0, 7); g.fill(); }
      }
    }
  }
  for (let x = 0; x < 240; x += 120) { g.fillStyle = "#8b8c91"; g.fillRect(x * px, 0, 8 * px, S); }
});
const oceanTex = () => ctex("ocean", 512, 512, (g, r) => {
  g.fillStyle = "#3f86c4"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 120; i++) { g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(r() * 512, r() * 512, 10 + r() * 30, 2); }
});
const hullTex = () => ctex("hull", 2048, 256, (g) => {
  // u = around the hull (0..1 = angle 0..2pi from +y), v = along it (0 nose .. 1 tail)
  g.fillStyle = "#f4f3ef"; g.fillRect(0, 0, 2048, 256);
  // belly grey (around angle pi = u .5)
  g.fillStyle = "#c9ccd2"; g.fillRect(0, 0, 0, 0);
  for (const u0 of [0.18, 0.82]) {
    const x = u0 * 2048;
    g.fillStyle = "#2f6fb5"; g.fillRect(0, 0, 0, 0);
    // cheat-line stripe along the hull
    g.save(); g.translate(x, 0); g.fillStyle = "#2f6fb5"; g.fillRect(-26, 20, 52, 236); g.fillStyle = "#d8342f"; g.fillRect(-34, 20, 6, 236); g.restore();
    // cabin windows above the stripe
    for (let v = 40; v < 230; v += 7) { g.fillStyle = "#2b3346"; g.fillRect(x + (u0 < 0.5 ? -46 : 40), v, 6, 4); }
  }
});
const poolWater = () => ctex("poolWater", 512, 256, (g, r) => {
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#63cfe6"); gr.addColorStop(1, "#3fb3d6");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 60; i++) { g.strokeStyle = "rgba(255,255,255,0.45)"; g.lineWidth = 3; g.beginPath(); const x = r() * 512, y = r() * 256; g.moveTo(x, y); g.quadraticCurveTo(x + 14, y - 6, x + 30, y); g.stroke(); }
});
const beachTex = () => ctex("beachball", 512, 256, (g) => {
  const cols = ["#e8473c", "#f6f2e6", "#f2c230", "#2f7fd0", "#f6f2e6", "#3aa65a"];
  cols.forEach((c, i) => { g.fillStyle = c; g.fillRect((i * 512) / 6, 0, 512 / 6 + 1, 256); });
  g.fillStyle = "#f6f2e6"; g.fillRect(0, 0, 512, 18); g.fillRect(0, 238, 512, 18);
});
const museumWall = () => ctex("museumWall", 1024, 512, (g, r) => {
  g.fillStyle = "#ece6da"; g.fillRect(0, 0, 1024, 512);
  for (let x = 40; x < 1024; x += 200) { g.fillStyle = "#9fc3e0"; g.fillRect(x, 60, 120, 300); g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x + 10, 70, 20, 280); g.strokeStyle = "#7b7f88"; g.lineWidth = 8; g.strokeRect(x, 60, 120, 300); }
  g.fillStyle = "#c9c1b2"; g.fillRect(0, 470, 1024, 42);
});
const museumFloor = () => ctex("museumFloor", 512, 512, (g, r) => {
  for (let y = 0; y < 512; y += 128) for (let x = 0; x < 512; x += 128) { g.fillStyle = (x + y) % 256 ? "#d8cfbf" : "#cfc5b3"; g.fillRect(x, y, 128, 128); }
  g.fillStyle = "rgba(255,255,255,0.08)"; for (let i = 0; i < 60; i++) g.fillRect(r() * 512, r() * 512, 30, 2);
});

// ---------------- geometry helpers ----------------
const quadUp = (x0: number, x1: number, z0: number, z1: number, u: number, v: number, y = 0) => quad(V(x0, y, z1), V(x1, y, z1), V(x1, y, z0), V(x0, y, z0), u, v);
const cyl = (a: THREE.Vector3, b: THREE.Vector3, r: number, seg = 8) => {
  const g = new THREE.CylinderGeometry(r, r, a.distanceTo(b), seg);
  const m = new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()), V(1, 1, 1));
  return g.applyMatrix4(m);
};
const ell = (c: THREE.Vector3, s: THREE.Vector3, seg = 16) => new THREE.SphereGeometry(1, seg, Math.max(6, seg * 0.6)).scale(s.x, s.y, s.z).translate(c.x, c.y, c.z);

const STUCCO = [
  { wall: "#f1e3c6", shutter: "#5a7a8f", roof: "#b45c45" }, { wall: "#e9d0b0", shutter: "#6a5040", roof: "#8a6f5a" },
  { wall: "#dfe6dd", shutter: "#3f6fb5", roof: "#7d7f86" }, { wall: "#f3d7c5", shutter: "#2f6a43", roof: "#b45c45" },
  { wall: "#ece4c4", shutter: "#8c3b4a", roof: "#a9715a" }, { wall: "#d6dfe8", shutter: "#5a3b2a", roof: "#8a6f5a" },
];
/** one-storey California ranch house with a low hip roof; front facade toward local +z */
const ranch = (b: Batch, x: number, z: number, yaw: number, w: number, d: number, si: number) => {
  const st = STUCCO[si % STUCCO.length], h = 3.1, m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, 0, z);
  const front = lam(`rf${si}_${w}`, () => ({ map: facadeHD(`rf${si}_${w}`, w, h, { wall: st.wall, shutter: st.shutter, door: true }) }));
  const back = lam(`rb${si}_${w}`, () => ({ map: facadeHD(`rb${si}_${w}`, w, h, { wall: st.wall, shutter: st.shutter }) }));
  const side = lam(`rs${si}_${d}`, () => ({ map: facadeHD(`rs${si}_${d}`, d, h, { wall: st.wall, shutter: st.shutter }) }));
  const hw = w / 2, hd = d / 2, o = 0.6, rh = 1.7;
  b.add(quad(V(-hw, 0, hd), V(hw, 0, hd), V(hw, h, hd), V(-hw, h, hd)), front, m);
  b.add(quad(V(hw, 0, -hd), V(-hw, 0, -hd), V(-hw, h, -hd), V(hw, h, -hd)), back, m);
  b.add(quad(V(-hw, 0, -hd), V(-hw, 0, hd), V(-hw, h, hd), V(-hw, h, -hd)), side, m);
  b.add(quad(V(hw, 0, hd), V(hw, 0, -hd), V(hw, h, -hd), V(hw, h, hd)), side, m);
  const rm = lam("roof" + st.roof, () => ({ map: roofHD(st.roof), side: THREE.DoubleSide }));
  const A = V(-hw - o, h - 0.2, hd + o), B = V(hw + o, h - 0.2, hd + o), C = V(hw + o, h - 0.2, -hd - o), D = V(-hw - o, h - 0.2, -hd - o);
  const r1 = V(-hw + hd * 0.9, h + rh, 0), r2 = V(hw - hd * 0.9, h + rh, 0);
  const ru = (w + 2 * o) / 4, rv = (hd + o) / 3;
  b.add(quad(A, B, r2, r1, ru, rv), rm, m); b.add(quad(C, D, r1, r2, ru, rv), rm, m);
  b.add(tri(D, A, r1), rm, m); b.add(tri(B, C, r2), rm, m);
  // fascia board under the eaves
  b.add(boxGeo(V(-hw - o, h - 0.45, hd + o - 0.08), V(hw + o, h - 0.2, hd + o)), lam("fascia", () => ({ color: "#f6f1e6" })), m);
};
const palm = (b: Batch, x: number, z: number, h: number, seed: number) => {
  const r = rng(seed), bark = lam("palmBark", () => ({ color: "#a07a52" })), leaf = lam("palmLeaf", () => ({ color: "#4f9a3e" }));
  const lean = (r() - 0.5) * 0.12, segs = 6;
  let prev = V(x, 0, z);
  for (let i = 1; i <= segs; i++) {
    const u = i / segs, p = V(x + Math.sin(lean) * h * u * u * 3, h * u, z + Math.sin(lean * 0.7) * h * u * u * 2);
    b.add(cyl(prev, p, 0.24 - 0.08 * u, 8), bark); prev = p;
  }
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + r(), dir = V(Math.cos(a), 0, Math.sin(a));
    const mid = prev.clone().addScaledVector(dir, 1.5).add(V(0, 0.1, 0)), tip = prev.clone().addScaledVector(dir, 2.9).add(V(0, -1.0, 0));
    for (const [p0, p1, w] of [[prev, mid, 0.42], [mid, tip, 0.3]] as const) {
      const c = p0.clone().add(p1).multiplyScalar(0.5), len = p0.distanceTo(p1);
      const g = new THREE.SphereGeometry(1, 10, 6).scale(w, 0.07, len / 2 + 0.15);
      const q = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), p1.clone().sub(p0).normalize());
      b.add(g, leaf, new THREE.Matrix4().compose(c, q, V(1, 1, 1)));
    }
  }
  b.add(ell(prev.clone().add(V(0, -0.15, 0)), V(0.38, 0.3, 0.38), 10), lam("palmNut", () => ({ color: "#7a5a3a" })));
};
const roundTree = (b: Batch, x: number, z: number, h: number, seed: number) => {
  const r = rng(seed), leaf = lam("treeLeaf" + (seed % 3), () => ({ color: ["#5aa83c", "#4c9a37", "#69b545"][seed % 3] }));
  b.add(cyl(V(x, 0, z), V(x, h * 0.5, z), 0.06 * h, 8), lam("bark", () => ({ color: "#8a5a3c" })));
  b.add(ell(V(x, h * 0.66, z), V(0.3 * h, 0.27 * h, 0.3 * h), 16), leaf);
  for (let k = 0; k < 4; k++) { const a = r() * 6.28; b.add(ell(V(x + Math.cos(a) * 0.2 * h, h * (0.58 + r() * 0.1), z + Math.sin(a) * 0.2 * h), V(0.2 * h, 0.18 * h, 0.2 * h), 14), leaf); }
};
const bush = (b: Batch, x: number, z: number, s: number) => b.add(ell(V(x, 0.4 * s, z), V(0.7 * s, 0.5 * s, 0.7 * s), 14), lam("bushLeaf", () => ({ color: "#4f9a3e" })));

/** fuselage + nose as one lathe mesh (local x = 0 at the nose tip, tail toward +x) with the left cockpit window left
 *  open (so the pilot card inside shows), uv u around (from +y), v along */
const hullGeo = () => {
  const NA = 40, xs: number[] = [];
  for (let i = 0; i <= 16; i++) xs.push((4 * i) / 16);
  for (let x = 5; x <= 30; x += 1) xs.push(x);
  for (let i = 1; i <= 8; i++) xs.push(30 + (6 * i) / 8);
  const rad = (x: number) => (x < 4 ? 2 * Math.sqrt(Math.max(0, 1 - ((x - 4) / 4) ** 2)) : x <= 30 ? 2 : 2 - 1.55 * ((x - 30) / 6) ** 1.3);
  const yOff = (x: number) => (x > 30 ? 0.9 * ((x - 30) / 6) ** 1.5 : 0); // tail sweeps up
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (const x of xs) for (let k = 0; k <= NA; k++) {
    const a = (k / NA) * Math.PI * 2, r = Math.max(0.001, rad(x));
    pos.push(x, yOff(x) + r * Math.cos(a), r * Math.sin(a)); uv.push(k / NA, 1 - x / 36);
  }
  const win = (a: number, x: number) => x > 2.4 && x < 3.9 && a > 0.62 && a < 1.15; // left side (+z), upper
  for (let i = 0; i < xs.length - 1; i++) for (let k = 0; k < NA; k++) {
    const a = ((k + 0.5) / NA) * Math.PI * 2, xm = (xs[i] + xs[i + 1]) / 2;
    if (win(a, xm)) continue;
    const p = i * (NA + 1) + k, q = p + NA + 1;
    idx.push(p, q, p + 1, p + 1, q, q + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};
const airliner = () => {
  const grp = new THREE.Group(), b = new Batch();
  const body = lam("hull", () => ({ map: hullTex(), side: THREE.DoubleSide }));
  const white = lam("planeWhite", () => ({ color: "#f1f0ec" })), blue = lam("planeBlue", () => ({ color: "#2f6fb5" })), grey = lam("planeGrey", () => ({ color: "#b9bec6" }));
  b.add(hullGeo(), body);
  // wings (swept), engines, tail
  for (const s of [-1, 1]) {
    b.add(quad(V(13, -1.1, 0), V(18, -1.1, 0), V(22.5, -0.6, s * 15.5), V(20.5, -0.6, s * 15.5)).scale(1, 1, 1), white);
    b.add(boxGeo(V(13, -1.25, s > 0 ? 0 : -15.5), V(22.5, -1.05, s > 0 ? 15.5 : 0)).scale(1, 1, 1), white);
    b.add(cyl(V(12.5, -1.9, s * 5.8), V(16.5, -1.9, s * 5.8), 0.85, 14), grey);
    b.add(quad(V(31, 1.3, 0), V(35.5, 2.0, 0), V(36.5, 2.2, s * 5.8), V(35, 2.1, s * 5.8)), white);
  }
  b.add(quad(V(29.5, 1.6, 0), V(35.8, 2.6, 0), V(36.6, 8.2, 0), V(34.3, 8.2, 0)), blue);
  b.add(quad(V(35.8, 2.6, 0), V(29.5, 1.6, 0), V(34.3, 8.2, 0), V(36.6, 8.2, 0)), blue);
  b.build(grp);
  // a dark cockpit interior shell behind the open window, so the pilot reads against shade, not the far hull wall
  const inner = new THREE.Mesh(new THREE.SphereGeometry(1.75, 16, 10, 0, Math.PI * 2, 0, Math.PI).scale(1.7, 1, 1).translate(4.2, 0.2, 0), twoTone(new THREE.MeshLambertMaterial({ color: "#3a4256", side: THREE.BackSide })));
  grp.add(inner);
  grp.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
  return grp;
};
const smallPlane = () => {
  const grp = new THREE.Group(), b = new Batch(), m = lam("smallPlane", () => ({ color: "#f3efe6" })), red = lam("smallRed", () => ({ color: "#d8342f" }));
  b.add(cyl(V(0, 0, 0), V(-7, 0, 0), 0.7, 10), m);
  b.add(boxGeo(V(-3.2, 0.5, -5.5), V(-1.8, 0.65, 5.5)), red);
  b.add(boxGeo(V(-7.3, 0.2, -1.8), V(-6.4, 0.3, 1.8)), red);
  b.add(boxGeo(V(-7.3, 0.2, -0.08), V(-6.3, 1.9, 0.08)), red);
  b.build(grp);
  return grp;
};
const biplane = (col: string) => {
  const grp = new THREE.Group(), b = new Batch(), m = lam("bi" + col, () => ({ color: col })), dark = lam("biDark", () => ({ color: "#4a3a30" }));
  b.add(cyl(V(0, 0, 0), V(-5.5, 0, 0), 0.45, 10), m);
  for (const y of [-0.35, 1.05]) b.add(boxGeo(V(-2.2, y, -4.2), V(-0.9, y + 0.12, 4.2)), m);
  for (const z of [-3, 3]) for (const x of [-2, -1.1]) b.add(cyl(V(x, -0.3, z), V(x, 1.05, z), 0.04, 6), dark);
  b.add(boxGeo(V(-5.7, 0, -1.5), V(-5.0, 0.1, 1.5)), m);
  b.add(boxGeo(V(-5.8, 0, -0.06), V(-5.0, 1.2, 0.06)), m);
  b.add(boxGeo(V(0.05, -0.9, -0.08), V(0.15, 0.9, 0.08)), dark); // propeller
  b.build(grp);
  return grp;
};

/** cloud puff cluster (smooth spheres, flat-ish bottom) */
const puff = (b: Batch, x: number, y: number, z: number, s: number, seed: number) => {
  const r = rng(seed), m = lam("cloudPuff", () => ({ color: "#ffffff" }));
  const n = 5 + Math.floor(r() * 4);
  for (let i = 0; i < n; i++) {
    const a = r() * 6.28, d = r() * 1.3 * s, rr = s * (0.55 + r() * 0.5);
    b.add(ell(V(x + Math.cos(a) * d, y + rr * 0.35 + r() * 0.3 * s, z + Math.sin(a) * d * 0.8), V(rr, rr * 0.72, rr), 14), m);
  }
};

// ---------------- the chair ----------------
const chairGeo = (b: Batch) => {
  const al = twoTone(new THREE.MeshPhongMaterial({ color: "#c7ccd3", specular: "#ffffff", shininess: 70 }), 0.2);
  const web1 = lam("web1", () => ({ color: "#3e9a5a" })), web2 = lam("web2", () => ({ color: "#f3efe2" }));
  const T = 0.022, sx = 0.29, y = 0.42;
  const tube = (a: V3, c: V3) => b.add(cyl(V(...a), V(...c), T, 8), al);
  for (const s of [-1, 1]) {
    tube([s * sx, 0, 0.26], [s * sx, y, -0.24]); tube([s * sx, 0, -0.24], [s * sx, y, 0.26]);       // X legs
    tube([s * sx, y, -0.26], [s * sx, y, 0.26]);                                              // seat rail
    tube([s * (sx + 0.03), 0.64, -0.26], [s * (sx + 0.03), 0.64, 0.22]);                      // arm rail
    tube([s * (sx + 0.03), 0.64, 0.22], [s * sx, y, 0.26]);
    tube([s * sx, y, -0.26], [s * sx, 1.0, -0.36]);                                           // back post
  }
  tube([-sx, 1.0, -0.36], [sx, 1.0, -0.36]); tube([-sx, y, 0.26], [sx, y, 0.26]); tube([-sx, y, -0.26], [sx, y, -0.26]);
  // webbing: seat strips across x, back strips across x, alternating colours
  for (let i = 0; i < 6; i++) {
    const z0 = -0.24 + i * 0.085;
    b.add(boxGeo(V(-sx, y - 0.01, z0), V(sx, y + 0.008, z0 + 0.07)), i % 2 ? web2 : web1);
  }
  for (let i = 0; i < 6; i++) {
    const u0 = i / 6, u1 = u0 + 0.13, p0 = V(-sx, y + (1 - y) * u0, -0.26 - 0.1 * u0), p1 = V(sx, y + (1 - y) * u1, -0.26 - 0.1 * u1);
    b.add(quad(V(-sx, p0.y, p0.z), V(sx, p0.y, p0.z), V(sx, p1.y, p1.z), V(-sx, p1.y, p1.z)), i % 2 ? web2 : web1);
    b.add(quad(V(sx, p0.y, p0.z - 0.01), V(-sx, p0.y, p0.z - 0.01), V(-sx, p1.y, p1.z - 0.01), V(sx, p1.y, p1.z - 0.01)), i % 2 ? web2 : web1);
  }
};

/** world-space line pieces as instanced thin cylinders (strings, cords, wires) */
class Lines {
  mesh: THREE.InstancedMesh; private n = 0; private m4 = new THREE.Matrix4(); private q = new THREE.Quaternion(); private up = V(0, 1, 0);
  private a = V(0, 0, 0); private d = V(0, 0, 0); private s = V(1, 1, 1);
  constructor(parent: THREE.Object3D, max: number, r: number, col: string) {
    this.mesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(r, r, 1, 5).translate(0, 0.5, 0), twoTone(new THREE.MeshLambertMaterial({ color: col }), 0.3), max);
    this.mesh.frustumCulled = false; this.mesh.castShadow = true; parent.add(this.mesh);
  }
  noInk() { this.mesh.layers.set(NOINK); return this; }
  begin() { this.n = 0; }
  seg(p: THREE.Vector3, e: THREE.Vector3) {
    this.d.subVectors(e, p); const L = this.d.length();
    if (L < 1e-4) return;
    this.q.setFromUnitVectors(this.up, this.d.divideScalar(L));
    this.mesh.setMatrixAt(this.n++, this.m4.compose(p, this.q, this.s.set(1, L, 1)));
  }
  /** sagging rope from p to e: n pieces, dip metres at the middle, optional sideways sway */
  rope(p: THREE.Vector3, e: THREE.Vector3, n: number, dip: number, sway = V(0, 0, 0)) {
    let prev = p.clone();
    for (let i = 1; i <= n; i++) {
      const u = i / n, c = p.clone().lerp(e, u).add(V(0, -dip * 4 * u * (1 - u), 0)).addScaledVector(sway, Math.sin(Math.PI * u));
      this.seg(prev, c); prev = c;
    }
  }
  end() { this.mesh.count = this.n; this.mesh.instanceMatrix.needsUpdate = true; }
}

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private sun: THREE.DirectionalLight; private hemi: THREE.HemisphereLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunCache = new Map<number, THREE.Vector3>();
  private clouds: THREE.Mesh[] = [];
  private cloudSea = new THREE.Group();
  private chair = new THREE.Group(); private rig = new THREE.Group();
  private balloons: THREE.Mesh[] = [];
  private balloonMats: THREE.MeshLambertMaterial[] = [];
  private beachMat: THREE.MeshLambertMaterial;
  private strings: Lines; private cords: Lines;
  private plane: THREE.Group; private small: THREE.Group;
  private ball: THREE.Mesh;
  private museum = new THREE.Group();
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor() {
    const R = this.root;
    // ---- sky + light (template) ----
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(4500, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    const cmaps = [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud));
    for (let i = 0; i < 10; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cmaps[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.layers.set(NOINK); m.userData.k = i; this.clouds.push(m); R.add(m);
    }

    // ---- ground: modelled suburb (+-252 m) inside a far painted suburb, desert to the north, ocean to the south ----
    const b = new Batch();
    const grassM = lam("grassHD", () => ({ map: grassHD() })), roadM = lam("asphalt", () => ({ map: asphalt() })), conc = lam("concrete", () => ({ map: concrete() }));
    const E = 252;
    // lawns with a hole for the pool (20..28 x 1..5)
    const [px0, px1, pz0, pz1] = [POOL[0] - 4, POOL[0] + 4, POOL[2] - 2, POOL[2] + 2];
    const lawn = (x0: number, x1: number, z0: number, z1: number) => b.add(quadUp(x0, x1, z0, z1, (x1 - x0) / 4, (z1 - z0) / 4, 0), grassM);
    lawn(-E, E, -E, pz0); lawn(-E, E, pz1, E); lawn(-E, px0, pz0, pz1); lawn(px1, E, pz0, pz1);
    // streets along x (front of Larry's row at z = -33, the power-line street at z = 52) and a cross street every 120 m
    for (const zc of [-33, 52, -93, 112, -153, 172]) b.add(quadUp(-E, E, zc - 4.5, zc + 4.5, 2 * E / 6, 9 / 6, 0.02), roadM);
    for (const xc of [-180, -60, 60, 180]) b.add(quadUp(xc - 4, xc + 4, -E, E, 8 / 6, 2 * E / 6, 0.025), roadM);
    for (const zc of [-33, 52]) for (const s of [-1, 1]) b.add(quadUp(-E, E, zc + s * 4.5 - (s < 0 ? 1.4 : 0), zc + s * 4.5 + (s > 0 ? 1.4 : 0), 2 * E / 3, 0.5, 0.04), conc); // sidewalks
    // far ground (the town from the sky): four quads around the modelled square, plus ocean and hills
    const sub = lam("suburbFar", () => ({ map: rep(suburbTex(), 1, 1) }));
    const far = 7000, tile = 240;
    const farQ = (x0: number, x1: number, z0: number, z1: number) => b.add(quadUp(x0, x1, z0, z1, (x1 - x0) / tile, (z1 - z0) / tile, -0.05), sub);
    farQ(-far, far, -2600, -E); farQ(-far, far, E, far); farQ(-far, -E, -E, E); farQ(E, far, -E, E);
    b.add(quadUp(-far, far, -far, -2600, 30, 10, -0.05), lam("ocean", () => ({ map: rep(oceanTex(), 1, 1) })));
    // ---- houses: rows facing the streets, lots 24 m wide ----
    let si = 0;
    const rows: [number, number][] = [[-16, Math.PI], [-50, 0], [36, 0], [68, Math.PI], [-110, Math.PI], [-76, 0], [96, 0], [128, Math.PI]];
    for (const [zc, yaw] of rows) for (let x = -240; x <= 240; x += 24) {
      if (Math.abs(x % 120) === 60 && x !== 0) continue; // cross streets
      const w = 13 + ((si * 7) % 4), d = 9 + ((si * 3) % 2);
      ranch(b, x + ((si * 5) % 3) - 1, zc, yaw, w, d, si++);
      if (si % 3 === 0) palm(b, x + 9, zc + (yaw ? -9 : 9), 9 + (si % 4), si);
      else if (si % 3 === 1) roundTree(b, x - 9, zc + (yaw ? -8 : 8), 5 + (si % 3), si);
      // driveway
      b.add(quadUp(x + 7, x + 10, Math.min(zc + (yaw ? -4.5 : 4.5), zc + (yaw ? -12.5 : 12.5)), Math.max(zc + (yaw ? -4.5 : 4.5), zc + (yaw ? -12.5 : 12.5)), 1, 2, 0.03), conc);
    }
    // ---- Larry's backyard: fence, patio, palms, bushes ----
    const fm = lam("fence", () => ({ map: fenceTex() }));
    const fence = (a: THREE.Vector3, c: THREE.Vector3) => {
      const L = a.distanceTo(c), dir = c.clone().sub(a).normalize(), n = V(-dir.z, 0, dir.x);
      b.add(quad(a, c, c.clone().add(V(0, 1.8, 0)), a.clone().add(V(0, 1.8, 0)), L / 4, 1), fm);
      b.add(quad(c.clone().addScaledVector(n, 0.04), a.clone().addScaledVector(n, 0.04), a.clone().addScaledVector(n, 0.04).add(V(0, 1.8, 0)), c.clone().addScaledVector(n, 0.04).add(V(0, 1.8, 0)), L / 4, 1), fm);
    };
    for (const x of [-60, -36, -12, 12, 36, 60]) fence(V(x, 0, -11), V(x, 0, 14));
    fence(V(-72, 0, 14), V(72, 0, 14));
    b.add(quadUp(-6, 6, -11, -7.5, 3, 1, 0.05), conc); // patio
    palm(b, -9.5, 10.5, 10, 7); palm(b, 9.8, 11, 11.5, 11); palm(b, 33, 11.5, 9.5, 13);
    for (const [x, z, s] of [[-10.5, -6, 1.2], [-10.8, 3, 1], [10.6, -8, 1.1], [4, -10.4, 0.9], [-4, -10.4, 0.9], [20, 12.5, 1], [29, -9, 1]] as const) bush(b, x, z, s);
    // ---- the Jeep (olive, open top) ----
    const olive = lam("jeep", () => ({ color: "#7e8f3f" })), tyre = lam("tyre", () => ({ color: "#2b2b30" })), chrome = lam("chrome", () => ({ color: "#c9ccd2" }));
    const J = JEEP;
    b.add(boxGeo(V(J[0] - 2.0, 0.55, J[2] - 0.85), V(J[0] + 1.9, 1.15, J[2] + 0.85)), olive);
    b.add(boxGeo(V(J[0] + 0.6, 1.15, J[2] - 0.8), V(J[0] + 1.9, 1.35, J[2] + 0.8)), olive); // hood
    b.add(boxGeo(V(J[0] + 0.5, 1.15, J[2] - 0.8), V(J[0] + 0.58, 1.75, J[2] + 0.8)), chrome); // windshield frame
    for (const [dx, dz] of [[-1.3, -0.9], [-1.3, 0.9], [1.25, -0.9], [1.25, 0.9]]) {
      const g = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 18); g.rotateX(Math.PI / 2);
      b.add(g, tyre, new THREE.Matrix4().makeTranslation(J[0] + dx, 0.42, J[2] + dz));
    }
    b.add(boxGeo(V(J[0] - 2.15, 0.5, J[2] - 0.9), V(J[0] - 2.0, 0.66, J[2] + 0.9)), chrome); // rear bumper
    b.add(cyl(V(HOOK[0] - 0.12, HOOK[1], HOOK[2]), V(HOOK[0] + 0.05, HOOK[1], HOOK[2]), 0.05, 8), chrome);
    // ---- neighbour's pool ----
    const tileM = lam("poolTile", () => ({ map: poolTile() }));
    b.add(quadUp(px0 - 0.6, px1 + 0.6, pz0 - 0.6, pz0, 4, 1, 0.04), conc); b.add(quadUp(px0 - 0.6, px1 + 0.6, pz1, pz1 + 0.6, 4, 1, 0.04), conc);
    b.add(quadUp(px0 - 0.6, px0, pz0, pz1, 1, 2, 0.04), conc); b.add(quadUp(px1, px1 + 0.6, pz0, pz1, 1, 2, 0.04), conc);
    b.add(quad(V(px0, -1.3, pz1), V(px1, -1.3, pz1), V(px1, 0, pz1), V(px0, 0, pz1), 8, 1.3).scale(1, 1, 1), tileM);
    b.add(quad(V(px1, -1.3, pz0), V(px0, -1.3, pz0), V(px0, 0, pz0), V(px1, 0, pz0), 8, 1.3), tileM);
    b.add(quad(V(px0, -1.3, pz0), V(px0, -1.3, pz1), V(px0, 0, pz1), V(px0, 0, pz0), 4, 1.3), tileM);
    b.add(quad(V(px1, -1.3, pz1), V(px1, -1.3, pz0), V(px1, 0, pz0), V(px1, 0, pz1), 4, 1.3), tileM);
    b.add(quadUp(px0, px1, pz0, pz1, 8, 4, -1.3), tileM);
    // ---- power line: poles every 30 m, three wires sagging to WIRE_Y mid-span ----
    const wood = lam("pole", () => ({ color: "#7a5a3c" })), wire = lam("wire", () => ({ color: "#2a2a30" }));
    const poleXs: number[] = []; for (let x = -225; x <= 225; x += 30) poleXs.push(x);
    for (const x of poleXs) {
      b.add(cyl(V(x, 0, POLES_Z), V(x, WIRE_Y + 1.6, POLES_Z), 0.16, 8), wood);
      b.add(boxGeo(V(x - 0.08, WIRE_Y + 0.6, POLES_Z - 1.1), V(x + 0.08, WIRE_Y + 0.78, POLES_Z + 1.1)), wood);
      b.add(cyl(V(x, WIRE_Y + 0.9, POLES_Z + 0.5), V(x, WIRE_Y + 1.4, POLES_Z + 0.5), 0.28, 10), lam("transformer", () => ({ color: "#8a8f98" })));
    }
    for (let i = 0; i < poleXs.length - 1; i++) for (const dz of [-0.9, 0, 0.9]) {
      let prev = V(poleXs[i], WIRE_Y + 0.82, POLES_Z + dz);
      for (let k = 1; k <= 10; k++) {
        const u = k / 10, p = V(poleXs[i] + 30 * u, WIRE_Y + 0.82 - 0.82 * 4 * u * (1 - u) * (dz === 0 ? 1 : 0.95), POLES_Z + dz);
        b.add(cyl(prev, p, 0.025, 5), wire); prev = p;
      }
    }
    b.build(R);

    // ---- cloud sea (only in the sky shots) ----
    const cb = new Batch(), cr = rng(99);
    for (let i = 0; i < 70; i++) {
      const a = cr() * 6.28, d = 34 + Math.sqrt(cr()) * 620, s = 7 + cr() * 9;
      puff(cb, Math.cos(a) * d, CLOUD_Y + (cr() - 0.5) * 40, Math.sin(a) * d, s, i + 3);
    }
    // a few high puffs around the cruising height, off to the sides
    for (let i = 0; i < 14; i++) { const a = cr() * 6.28, d = 140 + cr() * 360; puff(cb, Math.cos(a) * d, 1150 + cr() * 260, Math.sin(a) * d, 9 + cr() * 8, 200 + i); }
    cb.build(this.cloudSea, false);
    R.add(this.cloudSea);

    // ---- the museum hall ----
    const mb = new Batch(), M0 = MUSEUM, wallM = lam("museumWall", () => ({ map: museumWall() })), floorM = lam("museumFloor", () => ({ map: museumFloor() }));
    const [mx0, mx1, mz0, mz1, mh] = [M0[0] - 22, M0[0] + 22, M0[2] - 16, M0[2] + 16, 14];
    mb.add(quadUp(mx0, mx1, mz0, mz1, 11, 8, 0.01), floorM);
    // walls face into the hall
    mb.add(quad(V(mx0, 0, mz0), V(mx1, 0, mz0), V(mx1, mh, mz0), V(mx0, mh, mz0), 4, 1), wallM);
    mb.add(quad(V(mx0, 0, mz1), V(mx0, 0, mz0), V(mx0, mh, mz0), V(mx0, mh, mz1), 3, 1), wallM);
    mb.add(quad(V(mx1, 0, mz0), V(mx1, 0, mz1), V(mx1, mh, mz1), V(mx1, mh, mz0), 3, 1), wallM);
    mb.add(quad(V(mx1, 0, mz1), V(mx0, 0, mz1), V(mx0, mh, mz1), V(mx1, mh, mz1), 4, 1), wallM);
    mb.add(quadUp(mx0 - 40, mx1 + 40, mz0 - 40, mz1 + 40, 1, 1, -0.02), lam("museumYard", () => ({ color: "#cfc5b3" })));
    for (let x = mx0; x <= mx1; x += 5.5) mb.add(boxGeo(V(x - 0.15, mh - 0.4, mz0), V(x + 0.15, mh, mz1)), lam("truss", () => ({ color: "#8a8f98" })));
    const ped = lam("pedestal", () => ({ color: "#f3f0ea" }));
    mb.add(boxGeo(V(M0[0] - 1.6, 0, M0[2] - 1.2), V(M0[0] + 1.6, PEDESTAL_H, M0[2] + 1.2)), ped);
    mb.add(boxGeo(V(M0[0] - 1.65, PEDESTAL_H - 0.08, M0[2] - 1.25), V(M0[0] + 1.65, PEDESTAL_H, M0[2] + 1.25)), lam("pedTop", () => ({ color: "#3a3f4a" })));
    const brass = lam("brass", () => ({ color: "#c9a24a" }));
    for (const [x, z] of [[-2.3, -1.9], [2.3, -1.9], [-2.3, 1.9], [2.3, 1.9], [0, 1.9]]) mb.add(cyl(V(M0[0] + x, 0, M0[2] + z), V(M0[0] + x, 0.95, M0[2] + z), 0.05, 8), brass);
    mb.build(this.museum);
    const bp = biplane("#e8b83a"); bp.position.set(M0[0] - 2, 8.6, M0[2] - 4); bp.rotation.y = 0.5; this.museum.add(bp);
    const bp2 = biplane("#c94a3a"); bp2.position.set(M0[0] + 9, 10.5, M0[2] - 8); bp2.rotation.set(0, -0.8, 0.15); this.museum.add(bp2);
    const hang = new Lines(this.museum, 8, 0.012, "#3a3f4a");
    hang.begin(); for (const [p, top] of [[V(M0[0] - 4, 8.9, M0[2] - 4.5), V(M0[0] - 4, 13.6, M0[2] - 4.5)], [V(M0[0], 8.9, M0[2] - 3.5), V(M0[0], 13.6, M0[2] - 3.5)], [V(M0[0] + 7, 10.8, M0[2] - 7), V(M0[0] + 7, 13.6, M0[2] - 7)], [V(M0[0] + 11, 10.8, M0[2] - 9.3), V(M0[0] + 11, 13.6, M0[2] - 9.3)]] as const) hang.seg(p, top); hang.end();
    this.museum.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
    R.add(this.museum);

    // ---- the chair rig: rig (pivots under the balloons) > chair + balloons ----
    const chb = new Batch(); chairGeo(chb); chb.build(this.chair);
    this.beachMat = twoTone(new THREE.MeshLambertMaterial({ map: beachTex() }));
    const sphere = new THREE.SphereGeometry(1, 24, 16);
    for (const bl of BALLOONS) {
      const mat = twoTone(new THREE.MeshPhongMaterial({ color: bl.col, specular: "#ffffff", shininess: 40, emissive: new THREE.Color(bl.col).multiplyScalar(0.22) }) as unknown as THREE.MeshLambertMaterial, 1.6);
      this.balloonMats.push(mat);
      const m = new THREE.Mesh(sphere, mat); m.castShadow = true; m.receiveShadow = true; m.scale.set(bl.r, bl.r * 1.12, bl.r);
      this.balloons.push(m); this.rig.add(m);
    }
    this.rig.add(this.chair);
    R.add(this.rig);
    this.strings = new Lines(R, 60, 0.009, "#e9e2d2").noInk();
    this.cords = new Lines(R, 80, 0.02, "#4a3a2e");
    // ---- the airliner, the small plane, the beach ball ----
    this.plane = airliner(); R.add(this.plane);
    this.small = smallPlane(); this.small.scale.setScalar(1.6); R.add(this.small);
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(0.33, 24, 16), this.beachMat); this.ball.castShadow = true; R.add(this.ball);
    // pool water: its own mesh (ripples)
    const water = new THREE.Mesh(quadUp(px0, px1, pz0, pz1, 2, 1, -0.35), lam("poolWater", () => ({ map: poolWater() })));
    water.receiveShadow = true; R.add(water);
  }

  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(SUN_SHOT[id]?.az ?? L.az), el = THREE.MathUtils.degToRad(SUN_SHOT[id]?.el ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS[s.light], K = LOOK[s.light];
    // ---- camera ----
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.15; cam.far = 9000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- light ----
    const sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 95);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- sky, fog, clouds ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color);
    [this.fog.near, this.fog.far] = s.fog ?? [L.fogNear, L.fogFar];
    if (s.set === "museum") [this.fog.near, this.fog.far] = [200, 2000];
    scene.fog = this.fog; scene.background = null;
    const sky = s.set === "sky";
    this.clouds.forEach((m, i) => {
      const a = (i / this.clouds.length) * Math.PI * 2 + 0.3, d = 900 + (i % 3) * 120, w = 260 + (i % 4) * 60;
      const baseY = sky ? cam.position.y + 40 + (i % 4) * 50 : 160 + (i % 4) * 45;
      m.position.set(cam.position.x + Math.cos(a) * d, baseY, cam.position.z + Math.sin(a) * d);
      m.scale.set(w, w / 2, 1); m.lookAt(cam.position.x, m.position.y, cam.position.z);
      m.visible = s.set !== "museum";
    });
    this.cloudSea.visible = sky;
    this.museum.visible = s.set === "museum";
    // ---- the chair rig ----
    const ch = chairAt(id, t);
    this.rig.position.set(ch.pos[0], ch.pos[1], ch.pos[2]);
    // pivot: the chair hangs under the cluster, so roll swings it about the cluster centre (7.4 m up)
    this.rig.rotation.set(0, ch.yaw, 0);
    this.chair.position.set(0, 0, 0); this.chair.rotation.set(0, 0, 0);
    const piv = 7.4, rr = ch.roll;
    this.chair.position.set(Math.sin(rr) * piv, piv - Math.cos(rr) * piv, 0); this.chair.rotation.z = rr;
    this.rig.updateMatrixWorld(true);
    const nb = Math.floor(ch.balloons), part = ch.balloons - nb;
    this.strings.begin();
    BALLOONS.forEach((bl, i) => {
      const m = this.balloons[i];
      const on = bl.order < nb || (bl.order === nb && part > 0.02);
      const visible = on && !ch.popped.includes(i);
      m.visible = visible;
      if (!visible) return;
      const grow = bl.order === nb ? part : 1, o = bob(i, t);
      m.position.set(bl.off[0] + o[0], bl.off[1] + o[1], bl.off[2] + o[2]);
      const sGrow = 0.2 + 0.8 * grow;
      const bs = ch.beach > 0.5 ? 0.85 : 1;
      m.scale.set(bl.r * sGrow * bs, bl.r * (ch.beach > 0.5 ? 1 : 1.12) * sGrow * bs, bl.r * sGrow * bs);
      m.material = ch.beach > 0.5 ? this.beachMat : this.balloonMats[i];
      m.rotation.set(0, i * 0.7 + t * 0.3 * ch.beach, 0);
      // string from the chair's back frame to the balloon's bottom
      const tie = this.chair.localToWorld(V(...bl.tie)), bot = m.localToWorld(V(0, -1, 0));
      this.strings.seg(tie, bot);
    });
    this.strings.end();
    this.rig.visible = !(s.set === "pool");
    // tether / cable / jugs' cords
    this.cords.begin();
    const under = this.chair.localToWorld(V(0, 0.05, 0.1));
    if (ch.tether === 1) this.cords.rope(under, V(...HOOK), 10, 0.05);
    if (ch.tether === 2) {
      const d = Math.max(0, t - W.snapped), len = 4.6;
      this.cords.rope(under, under.clone().add(V(1.2 * Math.sin(d * 3) * Math.exp(-d), -len, 0.4 * Math.cos(d * 4))), 8, 0.4);
      this.cords.rope(V(...HOOK), V(HOOK[0] - 1.4 - 2 * Math.min(1, d * 3), 0.02, HOOK[2] + 0.6), 6, 0.1);
    }
    if (ch.cable === 1) this.cords.rope(under, under.clone().add(V(0.5 * Math.sin(t * 0.9), -7.5, 0.3 * Math.cos(t * 1.1))), 10, 0.2, V(0.4 * Math.sin(t * 1.3), 0, 0));
    if (ch.cable === 2) this.cords.rope(under, V(...CATCH), 8, 0.05);
    if (ch.balloons > 0 && ch.pos[1] > 1) for (const [dx, dz] of [[-0.3, 0.1], [0.32, -0.05]]) this.cords.seg(this.chair.localToWorld(V(dx, 0.4, dz)), this.chair.localToWorld(V(dx, -0.1, dz)));
    this.cords.end();
    // ---- planes, beach ball ----
    this.plane.visible = id === 10;
    if (id === 10) this.plane.position.set(...planeAt(t));
    this.small.visible = id === 2;
    if (id === 2) this.small.position.set(...smallPlaneAt(t));
    this.ball.visible = id === 14;
    if (id === 14) {
      const k = [POOL[0] - 0.2, POOL[2] + 0.62];
      const d = t - W.shoves + 2 / FPS;
      const y = d < 0 ? -0.4 + 0.03 * Math.sin(t * 9) : -0.4 + 6.2 * d - 4.9 * d * d;
      this.ball.position.set(k[0] + (d > 0 ? 0.5 * d : 0), Math.max(-0.4, y), k[1]);
      this.ball.rotation.set(d > 0 ? d * 6 : 0, t * 0.5, 0);
    }
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, t, { pos: cam.position, right });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e2 = this.fx(fi++);
      e2.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e2.use(!!p.soft);
      e2.mesh.visible = true;
      e2.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e2.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e2.mesh.quaternion.copy(cam.quaternion); e2.mesh.rotateZ(p.rot ?? 0); }
      e2.mesh.scale.set(p.w, p.h, 1);
      fused.push(e2);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e3 of fused) e3.bind();
    return focus;
  }
}
export const _unused = clamp01;
