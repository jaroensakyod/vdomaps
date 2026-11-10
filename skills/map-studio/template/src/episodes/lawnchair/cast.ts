// Our cast as lit flat cards in the 3D world (machinery from the cartoon-3d-short template: canvas pool, billboards,
// blinks, contact shadows), staged for the lawn chair story: Larry (glasses, cap), a neighbour, the airline pilot,
// the kid at the pool, the inspector, museum visitors; plus effect cards (pops, sparks, frost, breath, props).
// Cards, effects and blobs live on the NOINK layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import { Pen, bodyFront, bodySide, fxBurst, fxSplash, fxStars, fxCreak, fxShadow, fxContact, fxPuff, INK, Outfit, Expr, FrontOpts, SideOpts, Prop } from "./toon";
import {
  FPS, SHOTS, V3, W, POPS, CATCH, POOL, FRONT, MUSEUM, HOOK, LARRY_SPOTS, chairAt, planeAt, smooth, clamp01,
} from "./story";
import { BALLOONS, bob } from "./balloons";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";
// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
export const SU_SWING = 2.3 / 1830; // swing canvas: rope of 1830 units = 2.3 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
/** head-shape seed: 7 shapes, so marching soldiers in step still share canvases */
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

/** front / side view and mirroring for someone at (x, z) walking along (dx, dz); fs = foreshortening of the walk */
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks and reaction timing ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half, plus a blink across
 *  every expression swap (the shut frames hide the swap) */
const LID = [0.5, 1, 1, 0.5];

const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13)); // next blink 0.5-2.3 s later
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h; // feet at v = .2 of the card
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};


// ---------------- our cast ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };
const LARRY: Outfit = { jacket: "#c8553d", pants: "#3b5b9a", boots: "#5a3b2a", hat: "cap", cap: "#2f6fb5", glasses: true, moustache: "#6a4a30" };
const INSPECTOR: Outfit = { jacket: "#6b7280", pants: "#4b5160", boots: INK, hat: "hair", hair: "#3a2a20", tie: "#a8323a", build: "stout" };
const PILOT: Outfit = { jacket: "#1f2f55", pants: "#1f2f55", boots: INK, hat: "cap", cap: "#1f2f55", buttons: "#e8c45a" };
const SWIMKID: Outfit = { jacket: "#2fa7c9", pants: "#f0b03c", boots: "#ffe2c2", hat: "hair", hair: "#3b2a1e", build: "kid" };
const NEIGHBOUR: Outfit = { jacket: "#f2c94c", pants: "#6a8f5a", boots: "#f4f1ea", hat: "hair", hair: "#b8692e", dress: "#f2c94c" };
const FOLK: Outfit[] = [
  { jacket: "#4f8a8b", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#2d2018" },
  { jacket: "#e07a5f", pants: "#3d405b", boots: INK, hat: "hair", hair: "#7a4a2a", dress: "#e07a5f" },
  { jacket: "#81b29a", pants: "#4a4e69", boots: "#5a3b2a", hat: "cap", cap: "#d1495b" },
  { jacket: "#9a7bc0", pants: "#3b3f52", boots: INK, hat: "hair", hair: "#c9a26b", dress: "#9a7bc0" },
];
const VISITKID: Outfit = { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", build: "kid" };

const who = (i: number, o: Outfit, okey: string): Who => ({ i, o, okey });
const L = LEAD;
/** Larry seated in the chair: card base sits 0.32 m over the chair origin (hips on the seat) */
const seated = (out: Stage, cam: CamInfo, c: V3, fo: FrontOpts, t: number, swaps: number[] = []) => {
  out.places.push(person(cam, who(1, LARRY, "larry"), c[0], c[1] + 0.32, c[2] + 0.04, { side: false, mirror: false },
    { mode: "sit", blink: lidAt(t, 1, swaps), ...fo }, {}));
};
const standing = (out: Stage, cam: CamInfo, i: number, o: Outfit, okey: string, p: V3, fo: FrontOpts, t: number, scale = 1, swaps: number[] = []) => {
  out.places.push(person(cam, who(i, o, okey), p[0], p[1], p[2], { side: false, mirror: false }, { mode: "stand", blink: lidAt(t, i, swaps), ...fo }, {}, scale));
  blob(out, p[0], p[1], p[2], scale);
};
/** an effect card that pops in with a small overshoot (6 f) at t0 */
const popScale = (t: number, t0: number) => { const n = (t - t0) * FPS; return n < 0 ? 0 : n > 6 ? 1 : [0.3, 0.7, 1.12, 1.18, 1.08, 1.0, 1.0][Math.floor(n)]; };
const icon = (out: Stage, key: string, draw: (p: Pen) => void, at: V3, w: number, h: number, t: number, t0: number, rot = 0) => {
  const s = popScale(t, t0);
  if (s > 0) out.fx.push({ key, cw: 400, ch: 400, draw, x: at[0], y: at[1], z: at[2], w: w * s, h: h * s, rot });
};
const burst = (out: Stage, t: number, t0: number, at: V3, size: number, col = "#fff3b0", dur = 0.4) => {
  if (t < t0 || t >= t0 + dur) return;
  const u = q((t - t0) / dur, 30);
  out.fx.push({ key: `burst${col}${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, col), x: at[0], y: at[1], z: at[2], w: size, h: size });
};
const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// ---- prop drawings (400 x 400 canvases) ----
const drawSandwich = (p: Pen) => {
  p.poly([[60, 250], [340, 250], [320, 300], [80, 300]], "#e9c27a", 8);
  p.poly([[50, 225], [350, 225], [340, 252], [60, 252]], "#7cc16a", 6);
  p.poly([[60, 205], [340, 205], [345, 228], [55, 228]], "#d85a4a", 6);
  p.poly([[70, 110], [330, 110], [345, 205], [55, 205]], "#efcf86", 8);
};
const drawRadio = (p: Pen) => {
  p.stroke([[270, 110], [330, 20]], 8);
  p.poly([[60, 120], [340, 120], [340, 320], [60, 320]], "#3a3f4a", 9);
  p.ell(140, 220, 60, 60, "#22252c", 6);
  for (let i = 0; i < 4; i++) p.stroke([[230, 170 + i * 30], [310, 170 + i * 30]], 6, "#c9ccd2");
};
const drawGun = (p: Pen) => {
  p.band([[40, 230], [150, 210]], "#8a5a34", 34, 7, "round");
  p.band([[140, 212], [370, 170]], "#4a4f58", 15, 6, "round");
  p.poly([[150, 225], [180, 222], [175, 290], [150, 292]], "#8a5a34", 6);
};
const drawSoda = (p: Pen) => {
  p.poly([[150, 90], [250, 90], [250, 330], [150, 330]], "#d8342f", 9);
  p.ell(200, 90, 50, 14, "#c9ccd2", 6);
  p.band([[150, 200], [250, 200]], "#f4f1ea", 22, 4);
};
const drawFlake = (p: Pen) => {
  for (let k = 0; k < 3; k++) { const a = (k * Math.PI) / 3; p.stroke([[200 - 150 * Math.cos(a), 200 - 150 * Math.sin(a)], [200 + 150 * Math.cos(a), 200 + 150 * Math.sin(a)]], 18, "#eaf6ff"); }
  p.ell(200, 200, 34, 34, "#eaf6ff", 0);
};
const drawJug = (p: Pen) => { p.poly([[120, 120], [280, 120], [290, 360], [110, 360]], "#eef3f6", 8); p.poly([[170, 60], [230, 60], [230, 120], [170, 120]], "#3f6fb5", 6); };

const SW: Record<number, number[]> = { 2: [W.eyesight], 3: [W.fortyTwo], 6: [W.snapped], 9: [W.freezing], 11: [W.sinking, W.dropped], 13: [W.powerLine], 16: [W.fined, W.drop, W.noLicence] };

/** everything with a face (and the effect cards) in shot `id` at time t */
export const stage = (id: number, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  LNAME = s.light;
  findSun(cam, SUN);
  const ch = chairAt(id, t), c = ch.pos, sw = SW[id] ?? [];
  switch (id) {
    case 1: seated(out, cam, c, { expr: t < W.lawnChair - L ? "smile" : "smile_closed", prop: "soda" }, t); break;
    case 2: {
      const sp = LARRY_SPOTS.stand;
      standing(out, cam, 1, LARRY, "larry", sp, { expr: t < W.eyesight - L ? "smile" : "squint", headTilt: t < W.eyesight - L ? -4 : 0 }, t, 1, sw);
      break;
    }
    case 3: {
      standing(out, cam, 1, LARRY, "larry", [-1.5, 0, 1.0], { expr: t < W.fortyTwo - L ? "smile" : "grin", facing: 1 }, t, 1, sw);
      break;
    }
    case 4: {
      const prop: Prop = t < W.soda - L ? null : t < W.gun - L ? "soda" : ["gun", 0];
      seated(out, cam, c, { expr: t < W.gun - L ? "smile" : "grin", prop }, t);
      icon(out, "sandwich", drawSandwich, add3(c, [-0.5, 0.78, 0.18]), 0.32, 0.32, t, W.sandwich - L);
      icon(out, "radio", drawRadio, add3(c, [0.52, 0.8, 0.16]), 0.3, 0.3, t, W.radio - L);
      if (t >= W.gun - L) icon(out, "soda", drawSoda, add3(c, [0.48, 1.05, 0.12]), 0.22, 0.22, t, W.gun - L);
      break;
    }
    case 5: {
      const up = t >= W.pop - L && t < W.pop + 1.4;
      seated(out, cam, c, { expr: up ? "grin" : "smile_closed", prop: ["gun", up ? 1 : 0] }, t);
      break;
    }
    case 6: {
      if (t < W.snapped) creakFxs(t, [add3(HOOK, [0.15, 0.25, 0.25]), add3(HOOK, [-0.3, 0.45, 0.2])], out, 0.35);
      burst(out, t, W.snapped - L / 2, add3(HOOK, [0, 0.15, 0.3]), 1.1);
      if (t >= W.snapped) seated(out, cam, c, { expr: "shock" }, t, sw);
      neighbour(out, cam, t, t >= W.snapped ? "shock" : "smile");
      break;
    }
    case 7: seated(out, cam, c, { expr: "shock" }, t); neighbour(out, cam, t, "shock"); break;
    case 8: seated(out, cam, c, { expr: t < W.sixteen ? "shock" : "nervous" }, t); break;
    case 9: {
      const shiver = 2.2 * Math.sin(t * 55);
      seated(out, cam, c, { expr: "pained", tilt: shiver, prop: ["gun", 0] }, t, sw);
      // breath puffs every 0.9 s and drifting snowflakes
      const bt = ((t - W.freezing) % 0.9) / 0.9;
      out.fx.push({ key: `puff${q(bt, 30)}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, q(bt, 30)), x: c[0] + 0.12, y: c[1] + 1.08 + 0.1 * bt, z: c[2] + 0.35, w: 0.32, h: 0.32 });
      for (let k = 0; k < 9; k++) {
        const u = ((t * 0.35 + k * 0.137) % 1), x = c[0] + (hh(k, 3) - 0.5) * 2.4 + 0.15 * Math.sin(t * 2 + k), y = c[1] + 2.2 - 2.6 * u, z = c[2] + 0.3 + hh(k, 4) * 1.2;
        out.fx.push({ key: "flake", cw: 400, ch: 400, draw: drawFlake, x, y, z, w: 0.07 + 0.05 * hh(k, 5), h: 0.07 + 0.05 * hh(k, 5), rot: t * 2 + k });
      }
      break;
    }
    case 10: {
      seated(out, cam, c, { expr: "nervous", prop: ["gun", 0] }, t);
      // the pilot in the left cockpit window (inside the hull, 0.35 m behind the window plane)
      const w = add3(planeAt(t), [3.4, -0.2, 1.0]);
      const shock = t >= W.man - L;
      out.places.push({ ...person(cam, who(5, PILOT, "pilot"), w[0], w[1], w[2], { side: false, mirror: false },
        { mode: "stand", expr: shock ? "shock" : "neutral", blink: lidAt(t, 5, [W.man]), facing: shock ? 0 : -1 }, {}), yaw: 0 });
      break;
    }
    case 11: {
      const aiming = t < W.sinking - L, gone = t >= W.dropped - L;
      seated(out, cam, c, { expr: aiming ? "squint" : gone ? "shock" : "relief", prop: gone ? null : ["gun", aiming ? 1 : 0.2] }, t, sw);
      for (const [tp, i] of POPS) burst(out, t, tp, add3(add3(c, BALLOONS[i].off), bob(i, t)), 2.6, "#fff6c9", 0.3);
      if (gone) { // the gun tumbles away below the chair
        const d = t - (W.dropped - L);
        out.fx.push({ key: "gun", cw: 400, ch: 400, draw: drawGun, x: c[0] + 0.35 + 0.6 * d, y: c[1] + 0.7 - 4.9 * d * d, z: c[2] + 0.3, w: 0.55, h: 0.55, rot: d * 7 });
      }
      break;
    }
    case 12: seated(out, cam, c, { expr: "relief" }, t); break;
    case 13: {
      const caught = t >= W.powerLine - L;
      seated(out, cam, c, { expr: caught ? "dazed" : "nervous", tilt: caught ? 4 * Math.sin(t * 5) : 0 }, t, sw);
      if (caught) {
        const u = q(((t - W.powerLine) * 0.9) % 1, 30);
        out.fx.push({ key: `stars${u}`, cw: 420, ch: 210, draw: (p) => fxStars(p, u), x: c[0], y: c[1] + 1.95, z: c[2] + 0.1, w: 0.8, h: 0.4 });
        for (const [k, dt] of [[0, 0], [1, 0.22], [2, 0.5], [3, 0.95]] as const) burst(out, t, W.powerLine + dt - L, add3(CATCH, [0.4 * k - 0.6, 0, 0.1]), 2.2 - 0.3 * k, "#ffe04a", 0.3);
      }
      break;
    }
    case 14: {
      const up = t >= W.shoves - L;
      const kid: V3 = [POOL[0] - 0.2, -1.05, POOL[2] + 0.2];
      out.places.push(person(cam, who(7, SWIMKID, "swimkid"), kid[0], kid[1], kid[2], { side: false, mirror: false },
        { mode: "stand", expr: up ? (t < W.shoves + 0.5 ? "shock" : "laugh") : "grin", prop: up ? null : "ball", blink: lidAt(t, 7, [W.shoves]) }, {}, 1));
      if (up) {
        const u = q(clamp01((t - W.shoves + L) / 1.1), 30);
        out.fx.push({ key: `splash${u}`, cw: 800, ch: 800, draw: (p) => fxSplash(p, u), x: kid[0], y: -0.35 + 0.55, z: kid[2] + 0.5, w: 1.5, h: 1.5 });
      }
      break;
    }
    case 15: seated(out, cam, c, { expr: t < W.beachBalls - L ? "smile" : "grin" }, t); break;
    case 16: {
      const handed = t >= W.fined - L, flip = t >= W.drop - L, shrug = t >= W.noLicence - L;
      standing(out, cam, 3, INSPECTOR, "insp", LARRY_SPOTS.insp,
        { expr: shrug ? "worried" : flip ? "squint" : "stern", prop: flip ? "book" : handed ? null : "ticket", facing: 1 }, t, 1, sw);
      standing(out, cam, 1, LARRY, "larry", LARRY_SPOTS.front,
        { expr: shrug ? "smile" : handed ? "worried" : "nervous", prop: handed ? "ticket" : null, facing: -1 }, t, 1, sw);
      break;
    }
    case 17: {
      const pts: [V3, Outfit, string, number][] = [
        [[MUSEUM[0] - 2.6, 0, MUSEUM[2] + 1.6], FOLK[0], "f0", 1], [[MUSEUM[0] - 1.6, 0, MUSEUM[2] + 2.6], FOLK[1], "f1", 1],
        [[MUSEUM[0] + 2.6, 0, MUSEUM[2] + 0.4], FOLK[2], "f2", 1], [[MUSEUM[0] + 2.9, 0, MUSEUM[2] + 2.3], VISITKID, "vk", 0.72],
        [[MUSEUM[0] - 4.5, 0, MUSEUM[2] - 1.5], FOLK[3], "f3", 1],
      ];
      pts.forEach(([p, o, k, sc], i) => {
        const pointing = k === "vk" && t >= W.real - 0.8;
        standing(out, cam, 20 + i, o, k, p, { expr: (["smile", "smile_closed", "grin", "grin", "smile"] as Expr[])[i], prop: pointing ? "point" : null, facing: p[0] < MUSEUM[0] ? 1 : -1 }, t, sc);
      });
      break;
    }
  }
  // water jugs hanging under the chair while it flies (ballast)
  if (ch.balloons > 0 && c[1] > 1 && !ch.onPedestal)
    for (const [dx, dz] of [[-0.3, 0.1], [0.32, -0.05]]) out.fx.push({ key: "jug", cw: 400, ch: 400, draw: drawJug, x: c[0] + dx, y: c[1] - 0.25, z: c[2] + dz, w: 0.32, h: 0.32 });
  return out;
};

const neighbour = (out: Stage, cam: CamInfo, t: number, expr: Expr) =>
  standing(out, cam, 9, NEIGHBOUR, "nb", [-7.5, 0, 7.5], { expr, prop: expr === "shock" ? "point" : null, facing: 1 }, t, 1, [W.snapped]);

export const creakFxs = (t: number, pts: V3[], out: Stage, size = 0.8) =>
  pts.forEach(([x, y, z], i) => {
    const u = q((t * 1.3 + i * 0.37) % 1, 30);
    out.fx.push({ key: `creak${u}`, cw: 300, ch: 300, draw: (p) => fxCreak(p, u), x, y, z, w: size, h: size, rot: i * 0.6 - 0.6 });
  });
export { FPS, smooth };
