// Timeline of "The Lawn Chair That Went to 16,000 Feet": shots timed to the voice (words.json, frames at 30 fps),
// the chair's flight (where it is, how many balloons it still has), and the camera grammar of the cartoon-3d-short
// skill: continuous slow push-ins, symmetric smootherstep glides of 18-40 f, cuts on big reframes, 7-frame flip kicks
// on impacts, no hand-held float. All places are in one world (metres, ground y = 0):
//   Larry's backyard around the origin (house to -z, fence, Jeep), neighbour's pool at x = +24, the street with the
//   power line along z = 58, Larry's front yard at z = -26, the sky over the yard (chair at y = ALT), the museum hall
//   at x = 2000.
export const FPS = 30;
export const TOTAL = 2101;
export const D0 = 0; // ground height (build.ts imports it)
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 3;
export const lin = (pts: [number, number][], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
};

// ---------------- places ----------------
export const ALT = 1300; // "sixteen thousand feet" in cartoon metres (the cloud sea sits at CLOUD_Y)
export const CLOUD_Y = 640;
export const JEEP: V3 = [6.2, 0, 2.6];          // rear bumper hook at JEEP + (-2.1, 0.62, 0)
export const HOOK: V3 = [JEEP[0] - 2.1, 0.62, JEEP[2]];
export const POOL: V3 = [24, 0, 3];            // centre of the neighbour's pool (8 x 4 m, water 0.35 m below the deck)
export const POLES_Z = 58;                     // power line along x at z = 58, poles every 30 m from x = -150
export const WIRE_Y = 9.2;
export const CATCH: V3 = [-60, WIRE_Y, POLES_Z]; // where the dangling cable snags the line
export const FRONT: V3 = [0, 0, -27];          // Larry's front lawn (house front at z = -21, street at z = -33)
export const MUSEUM: V3 = [2000, 0, 0];        // hall floor centre
export const PEDESTAL_H = 0.9;

// ---------------- word times (seconds, from words.json) ----------------
const f2s = (f: number) => f / FPS;
export const W = {
  lawnChair: f2s(153), larry: f2s(185), eyesight: f2s(264), tied: f2s(389), fortyTwo: f2s(398), chairWord: f2s(471),
  sandwich: f2s(492), soda: f2s(522), radio: f2s(542), gun: f2s(564), pop: f2s(681), cord: f2s(738), snapped: f2s(791),
  shot: f2s(865), cork: f2s(883), thousand1: f2s(900), five: f2s(918), sixteen: f2s(925), freezing: f2s(1016),
  airspace: f2s(1059), airliners: f2s(1109), man: f2s(1139), shotBalloons: f2s(1176), sinking: f2s(1214), dropped: f2s(1243),
  luckily: f2s(1282), unluckily: f2s(1341), powerLine: f2s(1395), hold: f2s(1494), under: f2s(1515), shoves: f2s(1557),
  helium: f2s(1617), fortyTwoBalls: f2s(1635), beachBalls: f2s(1660), pushing: f2s(1678), fined: f2s(1751),
  drop: f2s(1825), noLicence: f2s(1865), museum: f2s(1964), real: f2s(2040),
};

// ---------------- shots ----------------
export type Set = "sky" | "yard" | "street" | "pool" | "front" | "museum";
export type Light = "day" | "golden";
export type ShotDef = { id: number; a: number; b: number; set: Set; light: Light; fog?: [number, number] };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 185, set: "sky", light: "day", fog: [300, 4200] },      // hook: up in the sky, "in a lawn chair"
  { id: 2, a: 185, b: 328, set: "yard", light: "day" },                       // Larry looks up at a plane; the eyesight
  { id: 3, a: 328, b: 485, set: "yard", light: "day" },                       // forty-two balloons tied to the chair
  { id: 4, a: 485, b: 588, set: "yard", light: "day" },                       // sandwiches, soda, radio, pellet gun
  { id: 5, a: 588, b: 738, set: "yard", light: "day" },                       // the plan: hovering, tied to the Jeep
  { id: 6, a: 738, b: 821, set: "yard", light: "day" },                       // the cord snaps
  { id: 7, a: 821, b: 900, set: "yard", light: "day", fog: [60, 900] },       // shot up like a cork
  { id: 8, a: 900, b: 1016, set: "sky", light: "day", fog: [300, 4200] },     // one thousand ... sixteen thousand
  { id: 9, a: 1016, b: 1059, set: "sky", light: "day", fog: [300, 4200] },    // freezing cold
  { id: 10, a: 1059, b: 1170, set: "sky", light: "day", fog: [300, 4200] },   // the airliner and its pilot
  { id: 11, a: 1170, b: 1282, set: "sky", light: "day", fog: [300, 4200] },   // pops balloons, sinks, drops the gun
  { id: 12, a: 1282, b: 1341, set: "street", light: "day", fog: [80, 1400] }, // luckily: coming down
  { id: 13, a: 1341, b: 1429, set: "street", light: "day" },                  // unluckily: the power line
  { id: 14, a: 1429, b: 1583, set: "pool", light: "day" },                    // beach ball under water
  { id: 15, a: 1583, b: 1727, set: "sky", light: "day", fog: [300, 4200] },   // forty-two beach balls pushing up
  { id: 16, a: 1727, b: 1930, set: "front", light: "day" },                   // the fine, the dropped charge
  { id: 17, a: 1930, b: TOTAL, set: "museum", light: "day" },                 // the chair in the museum
];
/** crossfades (frames) at place/time changes; a white 4-frame flash after the hook */
export const XFADE: Record<number, number> = { 12: 8, 14: 8, 15: 8, 16: 8, 17: 10 };
export const FLASH_AT = 185;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- the chair's flight ----------------
export type ChairState = {
  pos: V3;          // chair origin (centre of the seat footprint, on its feet)
  yaw: number;      // chair faces +z at 0
  roll: number;     // sway
  balloons: number; // how many of the 42 are visible (0..42, fractional = the last one growing in)
  popped: number[]; // indices popped so far (with their pop time) — see POPS
  beach: number;    // 0 weather balloons .. 1 beach balls
  tether: number;   // 0 no cord, 1 cord to the Jeep taut, 2 cord snapped (whipping)
  cable: number;    // 0 no dangling cable, 1 hanging, 2 caught on the power line
  onPedestal: boolean;
};
/** seconds at which balloons pop in shot 11 (with which index) */
export const POPS: [number, number][] = [[f2s(1181), 40], [f2s(1193), 33], [f2s(1204), 37]];
const hover = (t: number) => 4.6 + 0.12 * Math.sin(t * 2.1);
/** rise after the snap: fast ease-in (a cork let go under water) */
const riseY = (t: number) => { const d = Math.max(0, t - W.snapped); return hover(W.snapped) + 4 * d + 26 * d * d; };
/** the climb through the altitudes in shot 8: ~300 m at "one thousand", the cloud sea at "five thousand", ALT at "sixteen" */
export const climbY = (t: number) => lin([[f2s(900), 300], [f2s(915), 560], [f2s(930), 760], [f2s(950), 1180], [f2s(1010), ALT]], t);
const sway = (t: number, k = 1) => k * 0.035 * Math.sin(t * 1.3) + k * 0.015 * Math.sin(t * 2.9 + 1);

export const chairAt = (id: number, t: number): ChairState => {
  const base: ChairState = { pos: [0, 0, 0], yaw: 0, roll: 0, balloons: 42, popped: [], beach: 0, tether: 0, cable: 0, onPedestal: false };
  const popped = POPS.filter(([tp]) => t >= tp).map(([, i]) => i);
  switch (id) {
    case 1: return { ...base, pos: [0, ALT + 0.4 * Math.sin(t * 0.9), 0], roll: sway(t), popped: [], cable: 1 };
    case 2: return { ...base, balloons: 0 };
    case 3: return { ...base, balloons: lin([[W.tied - 0.1, 0], [f2s(470), 42]], t) };
    case 4: return { ...base };
    case 5: return { ...base, pos: [0, hover(t), 0], roll: sway(t, 0.6), tether: 1 };
    case 6: return { ...base, pos: [0, t < W.snapped ? hover(t) : riseY(t), 0], roll: sway(t, 0.6), tether: t < W.snapped ? 1 : 2 };
    case 7: return { ...base, pos: [0, riseY(t), 0], roll: sway(t, 1.4), tether: 2, cable: 1 };
    case 8: return { ...base, pos: [0, climbY(t), 0], roll: sway(t, 1.2), cable: 1 };
    case 9: return { ...base, pos: [0, ALT, 0], roll: sway(t) + 0.02 * Math.sin(t * 40), cable: 1 };
    case 10: return { ...base, pos: [0, ALT, 0], roll: sway(t), cable: 1 };
    case 11: {
      const sink = Math.max(0, t - W.sinking);
      return { ...base, pos: [0, ALT - 1.2 * sink - 0.9 * sink * sink, 0], roll: sway(t), popped, cable: 1 };
    }
    case 12: {
      const u = clamp01((t - f2s(1282)) / f2s(1341 - 1282));
      return { ...base, pos: [CATCH[0] - 14 + 6 * u, 46 - 20 * u, CATCH[2] + 6], roll: sway(t), popped: POPS.map((p) => p[1]), cable: 1 };
    }
    case 13: {
      // drifts toward the line, the dangling cable snags it at "power line", the chair jerks and swings under the wire
      const u = clamp01((t - W.unluckily) / (W.powerLine - W.unluckily));
      const caught = t >= W.powerLine;
      const x = CATCH[0] - 8 + 8 * smooth(u), y = caught ? 17.2 + 0.25 * Math.exp(-(t - W.powerLine) * 3) * Math.sin((t - W.powerLine) * 14) : 26 - 8.8 * u;
      const z = CATCH[2] + 6 * (1 - smooth(u));
      const swing = caught ? 0.16 * Math.exp(-(t - W.powerLine) * 1.2) * Math.sin((t - W.powerLine) * 5) : sway(t);
      return { ...base, pos: [x, y, z], roll: swing, popped: POPS.map((p) => p[1]), cable: caught ? 2 : 1 };
    }
    case 14: return { ...base, balloons: 0 };
    case 15: return { ...base, pos: [0, 700 + 9 * (t - f2s(1583)), 0], roll: sway(t), beach: smooth((t - W.beachBalls + 0.1) / 0.25), cable: 1 };
    case 16: return { ...base, pos: [FRONT[0] + 2.4, 0, FRONT[2] + 0.4], yaw: -0.5, balloons: 0 };
    case 17: return { ...base, pos: [MUSEUM[0], PEDESTAL_H, MUSEUM[2]], yaw: 0.35, balloons: 0, onPedestal: true };
  }
  return base;
};

// ---------------- the airliner (shot 10) ----------------
/** nose position: flies along -x past the chair, 60 m behind it, slightly above */
export const planeAt = (t: number): V3 => [44 - 58 * (t - f2s(1059)), ALT + 6, -40];
/** the tiny plane Larry watches in shot 2 */
export const smallPlaneAt = (t: number): V3 => [-52 + 15 * (t - f2s(185)), 48, -120];

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const T = (f: number) => f / FPS;
/** push-in factor since f0 (subject grows ~rate per frame), `punch` raises the rate for n frames with 8 f soft edges */
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** a framing relative to the chair of shot id (follows it) */
const onChair = (id: number, off: V3, lookOff: V3, f0: number, rate: number, rest: Partial<Cam> = {}, punch = 0, n = 35) => (f: number): Shot => {
  const c = chairAt(id, T(f)).pos;
  return dolly(add(c, off), add(c, lookOff), pushK(f, f0, rate, punch, n), rest);
};
/** Larry's eyes when seated (card base sits ~0.3 m over the chair origin; eyes ~1.25 m above the card base) */
export const SEAT_EYES = 1.2;

// shot 1 — hook: low under the balloon cluster looking up past Larry, glide down to the side; cut to the MS on "lawn chair"
const S1a = onChair(1, [4.5, -2.8, 7.5], [0, 5.0, 0], 0, 0.0022, { fov: 46, roll: -0.04 });
const S1b = onChair(1, [6.5, 1.6, 10.5], [0, 3.2, 0], 52, 0.0018, { fov: 44, roll: 0.03 });
const S1c = onChair(1, [0.6, 1.55, 3.3], [0, SEAT_EYES - 0.15, 0], 137, 0.0025, { fov: 38 }, 0.006, 30);
// shot 2 — backyard: Larry stands on the lawn looking up (low 3/4), then a CU on "eyesight" (glasses)
const LARRY_STAND: V3 = [-1.6, 0, 3.2];
const S2a = (f: number) => dolly([2.6, 0.75, 9.6], [-1.4, 2.2, 1.5], pushK(f, 185, 0.0022), { fov: 44, roll: 0.03 });
const S2b = (f: number) => dolly([-1.25, 1.62, 5.4], [LARRY_STAND[0], 1.6, LARRY_STAND[2]], pushK(f, 258, 0.0025, 0.006, 30), { fov: 36 });
// shot 3 — the chair on the lawn, balloons appearing, crane up the cluster on "weather balloons"
const S3a = (f: number) => dolly([5.5, 2.2, 11], [0, 1.6, 0], pushK(f, 328, 0.002), { fov: 44 });
const S3b = (f: number) => dolly([7.5, 3.2, 13], [0, 5.2, 0], pushK(f, 405, 0.0018), { fov: 46, roll: -0.03 });
// shot 4 — MS of Larry in the chair, items pop in around him
const S4a = (f: number) => dolly([0.4, 1.35, 3.6], [0, 0.95, 0], pushK(f, 485, 0.0025), { fov: 40 });
const S4b = (f: number) => dolly([-0.4, 1.4, 2.9], [0, 1.1, 0], pushK(f, 555, 0.002), { fov: 38, roll: 0.035 });
// shot 5 — hovering over the lawn tied to the Jeep: wide 3/4 from behind the Jeep, then lower and closer on "pop"
const S5a = (f: number) => dolly([13, 2.4, 13], [1.5, 4.2, 0], pushK(f, 588, 0.0018), { fov: 46 });
const S5b = onChair(5, [2.4, -1.2, 5.6], [0, 1.6, 0], 672, 0.002, { fov: 40, roll: 0.03 });
// shot 6 — insert: the cord on the Jeep's bumper (creaks), snap on "snapped" (cut to the bumper wide as the cord whips)
const S6a = (f: number) => dolly([HOOK[0] + 0.5, 1.3, HOOK[2] + 7.5], [HOOK[0] - 1.8, 2.6, HOOK[2] - 1.2], pushK(f, 738, 0.003, 0.006, 30), { fov: 46 });
const S6b = (f: number) => dolly([HOOK[0] + 4.2, 1.2, HOOK[2] + 6.5], [HOOK[0] - 1.6, 3.2, HOOK[2] - 1], pushK(f, 791, 0.002), { fov: 44, roll: -0.04 });
// shot 7 — low on the lawn looking straight up as the chair shrinks away; CU of Larry's face rising on "shot up"
const S7a = (f: number) => zoom([3.2, 0.5, 6.5], [0.2, 0.75 * chairAt(7, T(f)).pos[1] + 2, -0.5], 58, pushK(f, 821, 0.002));
const S7b = onChair(7, [0.5, -0.1, 2.6], [0, SEAT_EYES, 0], 864, 0.003, { fov: 40, roll: -0.05 });
// shot 8 — riding with the chair: above, looking down past it at the town; then level with the cloud sea; then high
const S8a = onChair(8, [3.5, 9, 8.5], [0, -2, -1], 900, 0.0018, { fov: 50, roll: 0.04 });
const S8b = onChair(8, [7.5, 1.8, 11], [0, 3.2, 0], 918, 0.0018, { fov: 46 });
const S8c = onChair(8, [11, -3.5, 16], [0, 3.8, 0], 949, 0.0018, { fov: 46, roll: -0.03 });
// shot 9 — freezing: CU of Larry shivering
const S9a = onChair(9, [0.3, -0.05, 2.5], [0, SEAT_EYES - 0.05, 0], 1016, 0.003, { fov: 38 }, 0.006, 25);
// shot 10 — the airliner slides past behind the chair (wide), then the cockpit window CU (pilot's double take)
const S10a = onChair(10, [3, 0.8, 13], [-3, 4.5, -40], 1059, 0.0016, { fov: 48 });
const COCKPIT = (f: number): V3 => add(planeAt(T(f)), [3.2, 1.2, 1.6]); // left cockpit window (plane flies -x)
const S10b = (f: number): Shot => { const w = COCKPIT(f), k = pushK(f, 1109, 0.0025, 0.007, 30); return dolly([w[0] - 3.5, w[1] - 0.3, w[2] + 7], [w[0] - 1.2, w[1], w[2]], k, { fov: 34 }); };
// shot 11 — Larry aims up (low 3/4 under the cluster), pops; tilt down as he sinks; the gun falls past the lens
const S11a = onChair(11, [3.4, -1.6, 7.8], [0, 3.4, 0], 1170, 0.0018, { fov: 46, roll: 0.03 });
const S11b = onChair(11, [-2.2, 0.6, 4.8], [0, 1.2, 0], 1214, 0.002, { fov: 42, roll: -0.03 });
const S11c = onChair(11, [1.2, 2.4, 3.6], [0, -1.5, 0], 1243, 0.002, { fov: 44 });
// shot 12 — "Luckily": coming down over the roofs, relief
const S12a = onChair(12, [9, 3.5, 13], [0, 1.2, 0], 1282, 0.0018, { fov: 44, roll: 0.03 });
// shot 13 — "Unluckily": wide of the street and the line, the snag (kick), MS of Larry dangling
const S13a = (f: number) => dolly([CATCH[0] + 14, 6.5, CATCH[2] + 26], [CATCH[0] - 3, 14, CATCH[2] + 2], pushK(f, 1341, 0.0018), { fov: 48 });
const S13b = onChair(13, [6, -4, 9.5], [0, -3.8, 0], 1404, 0.0022, { fov: 54, roll: 0.04 });
// shot 14 — the pool: wide on "Here's why", MS of the kid holding the ball under, the ball shooting up
const S14a = (f: number) => dolly([POOL[0] + 7, 2.6, POOL[2] + 9], [POOL[0], 0.2, POOL[2]], pushK(f, 1429, 0.002), { fov: 44 });
const S14b = (f: number) => dolly([POOL[0] + 1.4, 0.45, POOL[2] + 4.4], [POOL[0] - 0.2, 0.25, POOL[2] + 0.4], pushK(f, 1481, 0.0022), { fov: 40 });
const S14c = (f: number) => dolly([POOL[0] + 2.2, 0.3, POOL[2] + 5.6], [POOL[0] - 0.2, 1.3, POOL[2] + 0.4], pushK(f, 1553, 0.0018), { fov: 44, roll: -0.04 });
// shot 15 — the chair rising through the sky: wide; on "beach balls" the balloons swap; roll on "pushing up"
const S15a = onChair(15, [12, -6, 17], [0, 4.5, 0], 1583, 0.0018, { fov: 46 });
const S15b = onChair(15, [8, -2.5, 12], [0, 4.6, 0], 1655, 0.002, { fov: 46, roll: 0.04 });
// shot 16 — front yard: the inspector hands over the fine; closer on the dropped charge; the shrug at the chair
const INSP: V3 = [FRONT[0] - 0.9, 0, FRONT[2] - 0.6];
const LARRY_FRONT: V3 = [FRONT[0] + 0.7, 0, FRONT[2] - 0.2];
const S16a = (f: number) => dolly([-0.4, 1.5, FRONT[2] - 6.8], [-0.1, 1.2, FRONT[2]], pushK(f, 1727, 0.002), { fov: 42 });
const S16b = (f: number) => dolly([INSP[0] - 0.4, 1.6, INSP[2] - 3.0], [INSP[0], 1.5, INSP[2]], pushK(f, 1815, 0.0025), { fov: 38, roll: 0.035 });
const S16c = (f: number) => dolly([-1.4, 1.5, FRONT[2] - 6.2], [0.8, 1.1, FRONT[2] + 0.2], pushK(f, 1859, 0.002, 0.006, 30), { fov: 42 });
// shot 17 — museum: chair on its pedestal, visitors; crane up to the aircraft hanging above
const S17a = (f: number) => dolly([MUSEUM[0] + 3.5, 1.7, MUSEUM[2] + 7.5], [MUSEUM[0], 1.4, MUSEUM[2]], pushK(f, 1926, 0.002), { fov: 44 });
const S17b = (f: number): Shot => {
  const u = glide((f - 2020) / 60);
  return { pos: [MUSEUM[0] + 3.5 + 3 * u, 1.7 + 5.5 * u, MUSEUM[2] + 7.5 + 7 * u], look: [MUSEUM[0], 1.4 + 6.5 * u, MUSEUM[2] - 2 * u], fov: 44 + 6 * u, roll: 0 };
};

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }, { f: 52, dur: 40, s: S1b }, { f: 137, cut: true, s: S1c }],
  2: [{ f: 185, s: S2a }, { f: 258, cut: true, s: S2b }],
  3: [{ f: 328, s: S3a }, { f: 405, dur: 36, s: S3b }],
  4: [{ f: 485, s: S4a }, { f: 555, dur: 22, s: S4b }],
  5: [{ f: 588, s: S5a }, { f: 672, cut: true, s: S5b }],
  6: [{ f: 738, s: S6a }, { f: 791, cut: true, s: S6b }],
  7: [{ f: 821, s: S7a }, { f: 864, cut: true, s: S7b }],
  8: [{ f: 900, s: S8a }, { f: 918, cut: true, s: S8b }, { f: 949, cut: true, s: S8c }],
  9: [{ f: 1016, s: S9a }],
  10: [{ f: 1059, s: S10a }, { f: 1109, cut: true, s: S10b }],
  11: [{ f: 1170, s: S11a }, { f: 1214, cut: true, s: S11b }, { f: 1243, dur: 22, s: S11c }],
  12: [{ f: 1282, s: S12a }],
  13: [{ f: 1341, s: S13a }, { f: 1404, cut: true, s: S13b }],
  14: [{ f: 1429, s: S14a }, { f: 1481, cut: true, s: S14b }, { f: 1553, cut: true, s: S14c }],
  15: [{ f: 1583, s: S15a }, { f: 1655, dur: 30, s: S15b }],
  16: [{ f: 1727, s: S16a }, { f: 1815, cut: true, s: S16b }, { f: 1859, cut: true, s: S16c }],
  17: [{ f: 1926, s: S17a }, { f: 2020, cut: true, s: S17b }],
};
export const LARRY_SPOTS = { stand: LARRY_STAND, front: LARRY_FRONT, insp: INSP };

// impact kicks: image offset flips sign every frame, decays to 0 in 7 f
const KICKS: [number, number][] = [[W.snapped, 1.2], [W.powerLine, 1.4], [W.shoves, 0.6], [POPS[0][0], 0.4], [POPS[1][0], 0.3], [POPS[2][0], 0.3]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};

// ---------------- lens ----------------
/** cInf = blur radius in px at 1080x1920 for things at infinity (0 = all sharp); focus = world point (else the look point) */
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
const larryEyes = (id: number) => (f: number): V3 => add(chairAt(id, T(f)).pos, [0, SEAT_EYES, 0]);
export const DOF: Dof[] = [
  { f: 0, cInf: 0 },                                       // hook wides: sharp
  { f: 137, cInf: 13, focus: larryEyes(1) },               // MS "in a lawn chair"
  { f: 185, cInf: 0 },                                     // backyard wide
  { f: 258, cInf: 14, focus: () => [LARRY_STAND[0], 1.62, LARRY_STAND[2]] }, // eyesight CU
  { f: 328, cInf: 0 },                                     // balloons
  { f: 485, cInf: 11, focus: () => [0, 1.42, 0] },          // MS in the chair
  { f: 588, cInf: 0 },                                     // hover wide
  { f: 672, cInf: 9, focus: larryEyes(5) },
  { f: 738, cInf: 14 },                                    // bumper insert (focus = look)
  { f: 791, cInf: 0 },
  { f: 864, cInf: 14, focus: larryEyes(7) },               // face rising
  { f: 900, cInf: 0 },                                     // climb wides
  { f: 1016, cInf: 14, focus: larryEyes(9) },              // freezing CU
  { f: 1059, cInf: 0 },                                    // airliner wide
  { f: 1109, cInf: 12 },                                   // cockpit window (focus = look)
  { f: 1170, cInf: 0 },
  { f: 1214, cInf: 10, focus: larryEyes(11) },
  { f: 1243, cInf: 0 },
  { f: 1404, cInf: 10, focus: larryEyes(13) },             // dangling MS
  { f: 1429, cInf: 0 },
  { f: 1481, cInf: 12 },                                   // kid + ball MS (focus = look)
  { f: 1553, cInf: 0 },
  { f: 1727, cInf: 8, focus: () => [0, 1.5, FRONT[2] - 0.4] }, // front yard pair
  { f: 1815, cInf: 12, focus: () => [INSP[0], 1.55, INSP[2]] },
  { f: 1859, cInf: 8, focus: () => [0.4, 1.4, FRONT[2]] },
  { f: 1930, cInf: 7 },                                    // museum (focus = look)
  { f: 2020, dur: 60, cInf: 0 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
