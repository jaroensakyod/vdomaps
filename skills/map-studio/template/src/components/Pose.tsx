import { PAL } from "./Scene";

// Pose-driven figures (house style v2, ink outlines). One skeleton format feeds every figure:
//   • code-written moves — angle poses (`AngPose`) from cycles (`runCycle`, `shamble`) and keyframed actions
//     (`keyed`), turned into joint points with `fk`;
//   • real motion capture — `npm run mocap -- clip.mp4 <name>` → public/mocap/<name>.json → `mocapPose`.
// So a scene built on code moves takes a captured move later by swapping one function call.
// Units: centimetres, y down, feet on y = 0, the figure faces +x. <PoseFigure scale> maps cm to px.

export type Pt = [number, number];
export type Pose = {
  head: Pt; neck: Pt; hip: Pt;
  shN: Pt; elN: Pt; wrN: Pt; shF: Pt; elF: Pt; wrF: Pt; // N = near side (drawn on top), F = far side
  hipN: Pt; knN: Pt; anN: Pt; toeN: Pt; hipF: Pt; knF: Pt; anF: Pt; toeF: Pt;
  look: number; // +1 face forward (+x), −1 looking back
};

// ---------- angle poses (degrees; 0 = straight down, + = toward the front) ----------
export type AngPose = {
  lean: number; // torso from vertical, + = forward
  neck: number; // head tilt from the torso line, + = chin down / forward
  shN: number; elN: number; shF: number; elF: number; // upper arm from down; elbow bend (+ = forearm forward)
  thN: number; knN: number; thF: number; knF: number; // thigh from down; knee bend (+ = shin back)
  ftN?: number; ftF?: number; // foot pitch, + = toes down
  drop?: number; // hips lowered (cm), for crouches and falls
  bob?: number; // vertical bounce (cm, + = up)
  look?: number;
};
const L = { torso: 52, neck: 10, head: 12, upper: 30, fore: 27, thigh: 45, shin: 44, foot: 18, ankle: 7, hipW: 6 };
const r = Math.PI / 180;
const down = (a: number, l: number): Pt => [Math.sin(a * r) * l, Math.cos(a * r) * l];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];

// Forward kinematics: angle pose → joint points, then the lowest foot point is put on the ground (y = 0).
export const fk = (a: AngPose, x = 0): Pose => {
  const hip: Pt = [0, 0];
  const up: Pt = [Math.sin(a.lean * r) * L.torso, -Math.cos(a.lean * r) * L.torso];
  const neck = add(hip, up);
  const ha = a.lean + a.neck;
  const head = add(neck, [Math.sin(ha * r) * (L.neck + L.head), -Math.cos(ha * r) * (L.neck + L.head)]);
  const shN = add(neck, [Math.sin(a.lean * r) * -4, 4]);
  const shF = add(shN, [-3, -1]);
  const elN = add(shN, down(a.shN, L.upper));
  const wrN = add(elN, down(a.shN + a.elN, L.fore));
  const elF = add(shF, down(a.shF, L.upper));
  const wrF = add(elF, down(a.shF + a.elF, L.fore));
  const leg = (th: number, kn: number, ft = 0, side: number) => {
    const h = add(hip, [side, 0]);
    const k = add(h, down(th, L.thigh));
    const an = add(k, down(th - kn, L.shin));
    const toe = add(an, [Math.cos((ft + (th - kn) * 0.3) * r) * L.foot, Math.sin((ft + (th - kn) * 0.3) * r) * L.foot * 0.6 + L.ankle * 0.6]);
    return [h, k, an, toe] as const;
  };
  const [hipN, knN, anN, toeN] = leg(a.thN, a.knN, a.ftN, 2);
  const [hipF, knF, anF, toeF] = leg(a.thF, a.knF, a.ftF, -2);
  const p: Pose = { head, neck, hip, shN, elN, wrN, shF, elF, wrF, hipN, knN, anN, toeN, hipF, knF, anF, toeF, look: a.look ?? 1 };
  // ground: lowest of ankles/toes/knees/wrists (hands touch the ground in a fall) sits on y = 0, minus the bob
  const low = Math.max(anN[1] + L.ankle, anF[1] + L.ankle, toeN[1], toeF[1], knN[1] + 5, knF[1] + 5, wrN[1] + 3, wrF[1] + 3);
  return shift(p, x, -low - (a.bob ?? 0));
};
export const shift = (p: Pose, dx: number, dy: number): Pose => {
  const o = { ...p };
  for (const k of Object.keys(o) as (keyof Pose)[]) if (k !== "look") (o[k] as Pt) = [(p[k] as Pt)[0] + dx, (p[k] as Pt)[1] + dy];
  return o;
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (k: number) => k * k * (3 - 2 * k);
export const mixAng = (a: AngPose, b: AngPose, k: number): AngPose => {
  const o = {} as Record<string, number>;
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) o[key] = lerp((a as Record<string, number>)[key] ?? 0, (b as Record<string, number>)[key] ?? 0, k);
  if (a.look !== undefined || b.look !== undefined) o.look = k < 0.5 ? a.look ?? 1 : b.look ?? 1;
  return o as AngPose;
};
// Keyframed action: [frame, pose] pairs, eased between keys.
export const keyed = (keys: [number, AngPose][], f: number): AngPose => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) return mixAng(keys[i - 1][1], keys[i][1], smooth((f - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])));
  return keys[keys.length - 1][1];
};

// ---------- code-written moves ----------
// Sprint: `t` in frames, ~2.6 strides a second at 30 fps.
export const runCycle = (t: number, phase = 0): AngPose => {
  const p = t * 0.27 + phase;
  const s = Math.sin(p);
  const legN = (q: number) => ({ th: 10 + 42 * Math.sin(q), kn: 25 + 75 * Math.max(0, Math.sin(q + 1.3)) ** 1.2 + 15 * Math.max(0, -Math.sin(q)) });
  const a = legN(p), b = legN(p + Math.PI);
  return { lean: 16, neck: -6, shN: -50 * s + 5, elN: 95, shF: 50 * s + 5, elF: 95, thN: a.th, knN: a.kn, thF: b.th, knF: b.kn, ftN: 10, ftF: 10, bob: 4 * Math.abs(Math.cos(p)) };
};
// Zombie shamble: slow, the far leg drags, arms half raised and swaying, torso rocking, head lolling. `seed` makes
// each zombie different (tempo, arm height, a twitch now and then).
export const shamble = (t: number, seed = 0): AngPose => {
  const rnd = (i: number) => {
    const x = Math.sin((seed + 1) * 91.7 + i * 12.9) * 43758.5;
    return x - Math.floor(x);
  };
  const tempo = 0.075 + rnd(1) * 0.035;
  const p = t * tempo + rnd(2) * 6;
  const s = Math.sin(p);
  const twitchAt = (Math.floor(t / 47) * 47 + Math.floor(rnd(Math.floor(t / 47)) * 30));
  const twitch = Math.max(0, 1 - Math.abs(t - twitchAt) / 4) * (rnd(Math.floor(t / 47) + 5) > 0.5 ? 1 : 0);
  const arm = 62 + rnd(3) * 30;
  return {
    lean: 14 + 6 * Math.sin(p * 2) + twitch * 10,
    neck: 28 + 10 * Math.sin(p + 1) - twitch * 25,
    shN: arm + 8 * Math.sin(p * 1.3), elN: 18 + 12 * rnd(4),
    shF: arm - 15 + 8 * Math.sin(p * 1.3 + 1), elF: 25,
    thN: 6 + 24 * s, knN: 12 + 30 * Math.max(0, Math.sin(p + 1.2)),
    thF: -2 - 10 * s, knF: 8, ftF: 30, // dragged foot, toes scraping
    bob: 2 * Math.abs(Math.cos(p)),
  };
};
export const STAND: AngPose = { lean: 2, neck: 0, shN: 6, elN: 10, shF: -4, elF: 10, thN: 2, knN: 2, thF: -2, knF: 2 };

// ---------- motion capture ----------
// MediaPipe landmark indices (scripts/mocap.mjs keeps all 33).
const MP = { nose: 0, earL: 7, earR: 8, shL: 11, shR: 12, elL: 13, elR: 14, wrL: 15, wrR: 16, hipL: 23, hipR: 24, knL: 25, knR: 26, anL: 27, anR: 28, heelL: 29, heelR: 30, toeL: 31, toeR: 32 };
export type MocapData = { fps: number; w: number; h: number; frames: ([number, number, number, number][] | null)[] };
type Prepared = { pts: Pt[][]; z: number[][]; scale: number; ground: number; face: number };
const prepared = new WeakMap<MocapData, Prepared>();
const prepare = (d: MocapData): Prepared => {
  const hit = prepared.get(d);
  if (hit) return hit;
  const n = d.frames.length;
  // fill frames without a person from the nearest frame that has one
  const filled = d.frames.map((f, i) => {
    if (f) return f;
    for (let k = 1; k < n; k++) {
      if (d.frames[i - k]) return d.frames[i - k]!;
      if (d.frames[i + k]) return d.frames[i + k]!;
    }
    throw new Error("mocap: no frame has a person in it");
  });
  // centred moving average over ±2 frames takes out MediaPipe's jitter
  const pts: Pt[][] = [];
  const z: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: Pt[] = [];
    const zr: number[] = [];
    for (let j = 0; j < 33; j++) {
      let sx = 0, sy = 0, sz = 0, c = 0;
      for (let k = Math.max(0, i - 2); k <= Math.min(n - 1, i + 2); k++) (sx += filled[k][j][0]), (sy += filled[k][j][1]), (sz += filled[k][j][2]), c++;
      row.push([sx / c, sy / c]);
      zr.push(sz / c);
    }
    pts.push(row);
    z.push(zr);
  }
  const median = (a: number[]) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
  // body height: nose → lowest foot, plus ~10 % for the top of the head; scaled to a 175-cm person
  const tall = median(pts.map((p) => Math.max(p[MP.heelL][1], p[MP.heelR][1], p[MP.toeL][1], p[MP.toeR][1]) - p[MP.nose][1])) * 1.1;
  // ground: near the lowest foot positions over the clip (a fixed camera keeps jumps as jumps)
  const feet = pts.map((p) => Math.max(p[MP.heelL][1], p[MP.heelR][1], p[MP.toeL][1], p[MP.toeR][1])).sort((a, b) => a - b);
  const ground = feet[Math.floor(feet.length * 0.9)];
  // facing: nose ahead of the ears' midpoint on most frames
  const face = median(pts.map((p) => p[MP.nose][0] - (p[MP.earL][0] + p[MP.earR][0]) / 2)) >= 0 ? 1 : -1;
  const out = { pts, z, scale: 175 / Math.max(1, tall), ground, face };
  prepared.set(d, out);
  return out;
};
// Skeleton for one video frame. `loop` wraps (for walk/run cycles), `inPlace` removes the travel across the frame
// (the scene moves the figure instead), `mirror` flips it. Output faces +x like the code-written poses.
export const mocapPose = (d: MocapData, frame: number, { loop = true, inPlace = true, mirror = false }: { loop?: boolean; inPlace?: boolean; mirror?: boolean } = {}): Pose => {
  const P = prepare(d);
  const n = P.pts.length;
  const i = loop ? ((Math.floor(frame) % n) + n) % n : Math.max(0, Math.min(n - 1, Math.floor(frame)));
  const p = P.pts[i];
  const zz = P.z[i];
  const hipX = (p[MP.hipL][0] + p[MP.hipR][0]) / 2;
  const ox = inPlace ? hipX : P.pts[0][MP.hipL][0];
  const sx = P.scale * P.face * (mirror ? -1 : 1);
  const c = (j: number): Pt => [(p[j][0] - ox) * sx, (p[j][1] - P.ground) * P.scale];
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  // near side = the side closer to the camera (smaller z)
  const leftNear = zz[MP.shL] + zz[MP.hipL] < zz[MP.shR] + zz[MP.hipR];
  const [N, F] = leftNear ? (["L", "R"] as const) : (["R", "L"] as const);
  const j = (k: string) => c((MP as Record<string, number>)[k]);
  const ears = mid(j("earL"), j("earR"));
  const nose = j("nose");
  const look = Math.sign(nose[0] - ears[0] || 1);
  return {
    head: [ears[0] * 0.6 + nose[0] * 0.4, ears[1] - 2],
    neck: mid(j("shL"), j("shR")),
    hip: mid(j("hipL"), j("hipR")),
    shN: j(`sh${N}`), elN: j(`el${N}`), wrN: j(`wr${N}`), shF: j(`sh${F}`), elF: j(`el${F}`), wrF: j(`wr${F}`),
    hipN: j(`hip${N}`), knN: j(`kn${N}`), anN: j(`an${N}`), toeN: j(`toe${N}`),
    hipF: j(`hip${F}`), knF: j(`kn${F}`), anF: j(`an${F}`), toeF: j(`toe${F}`),
    look,
  };
};

// ---------- drawing ----------
export type Look = {
  skin: string; top: string; pants: string; shoes: string;
  hair?: string; hood?: string; // hood colour draws a hood instead of hair
  zombie?: boolean; // pale, torn hem and sleeves, glowing eyes
  eye?: string;
};
export const LOOKS: Record<string, Look> = {
  runner: { skin: "#d9a07a", top: "#c8322a", pants: "#2c3a5a", shoes: "#efe6d0", hair: "#1f1712" },
  zombieGrey: { skin: "#9fb39a", top: "#5f6660", pants: "#3a3f46", shoes: "#2a2a2a", hair: "#2a2a24", zombie: true, eye: "#e8ff8a" },
  zombieOffice: { skin: "#a9bba0", top: "#cfd3c8", pants: "#2f3440", shoes: "#1c1c1c", hair: "#3a2a1a", zombie: true, eye: "#e8ff8a" },
  zombieWorker: { skin: "#93a98d", top: "#c77a2a", pants: "#334055", shoes: "#2a2622", hair: "#151515", zombie: true, eye: "#e8ff8a" },
  zombieNurse: { skin: "#a7b9a8", top: "#6f9aa0", pants: "#6f9aa0", shoes: "#d8d8d0", hair: "#4a3424", zombie: true, eye: "#e8ff8a" },
};

const seg = (pts: Pt[], color: string, w: number, ink = PAL.ink) => {
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
  return (
    <g>
      <path d={d} stroke={ink} strokeWidth={w + 4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (s: number) => Math.round(Math.min(255, Math.max(0, ((n >> s) & 255) * k))).toString(16).padStart(2, "0");
  return `#${c(16)}${c(8)}${c(0)}`;
};

// One figure. (x, y) = ground point under the hips, `scale` = px per cm, `flip` faces −x.
export const PoseFigure = ({ pose: p, look: L2, x, y, scale, flip = false, shadow = true, glow = 1 }: { pose: Pose; look: Look; x: number; y: number; scale: number; flip?: boolean; shadow?: boolean; glow?: number }) => {
  const far = 0.72; // far limbs a little darker
  const sleeve = L2.zombie ? 0.05 : 0.55; // sleeve ends this far down the forearm (zombies: torn at the elbow)
  const arm = (sh: Pt, el: Pt, wr: Pt, k: number) => {
    const cut: Pt = [el[0] + (wr[0] - el[0]) * sleeve, el[1] + (wr[1] - el[1]) * sleeve];
    return (
      <g>
        {seg([sh, el, wr], shade(L2.skin, k), 8)}
        {seg([sh, el, cut], shade(L2.top, k), 10)}
        <circle cx={wr[0]} cy={wr[1]} r={4.6} fill={shade(L2.skin, k)} stroke={PAL.ink} strokeWidth={2} />
      </g>
    );
  };
  const legSeg = (h: Pt, kn: Pt, an: Pt, toe: Pt, k: number) => (
    <g>
      {seg([h, kn, an], shade(L2.pants, k), 12)}
      {seg([an, toe], shade(L2.shoes, k), 7)}
    </g>
  );
  const { head, neck, hip } = p;
  const dir = p.look;
  // torso as a tapered quad from hips to shoulders
  const tv: Pt = [neck[0] - hip[0], neck[1] - hip[1]];
  const len = Math.hypot(tv[0], tv[1]) || 1;
  const nx = -tv[1] / len, ny = tv[0] / len;
  const quad = [
    [hip[0] + nx * 10, hip[1] + ny * 10], [neck[0] + nx * 12, neck[1] + ny * 12],
    [neck[0] - nx * 12, neck[1] - ny * 12], [hip[0] - nx * 10, hip[1] - ny * 10],
  ];
  const hem = Array.from({ length: 6 }, (_, i) => {
    const k = i / 5;
    const bx = hip[0] + nx * (10 - 20 * k), by = hip[1] + ny * (10 - 20 * k);
    return `${bx + tv[0] * 0.04 * (i % 2 ? -1 : 1) * -1},${by - tv[1] * (i % 2 ? 0.1 : -0.06)}`;
  });
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      {shadow && <ellipse cx={hip[0]} cy={2} rx={34} ry={6} fill="#000" opacity={0.35} />}
      {arm(p.shF, p.elF, p.wrF, far)}
      {legSeg(p.hipF, p.knF, p.anF, p.toeF, far)}
      <path d={`M${quad.map((q) => q.join(",")).join("L")}Z`} fill={L2.top} stroke={PAL.ink} strokeWidth={2.4} strokeLinejoin="round" />
      {L2.zombie && <path d={`M${quad[0].join(",")}L${hem.join("L")}L${quad[3].join(",")}`} fill={L2.top} stroke={PAL.ink} strokeWidth={1.6} />}
      {L2.zombie && <path d={`M${(hip[0] + neck[0]) / 2 + nx * 4},${(hip[1] + neck[1]) / 2 + ny * 4}l4,6l-3,5`} stroke={PAL.ink} strokeWidth={1.4} fill="none" />}
      {legSeg(p.hipN, p.knN, p.anN, p.toeN, 1)}
      {/* head */}
      <g transform={`translate(${head[0]},${head[1]}) scale(${dir},1)`}>
        {seg([[neck[0] - head[0], neck[1] - head[1]].map((v, i) => (i ? v : v * dir)) as Pt, [0, 6]], L2.skin, 8)}
        <ellipse cx={0} cy={0} rx={11} ry={12.5} fill={L2.skin} stroke={PAL.ink} strokeWidth={2.2} />
        {L2.hood ? (
          <path d="M-13 6 Q-15 -16 0 -16 Q13 -16 12 -4 Q4 -10 -4 -6 Q-6 2 -13 6 Z" fill={L2.hood} stroke={PAL.ink} strokeWidth={1.8} />
        ) : (
          <path d={L2.zombie ? "M-11 -2 Q-12 -15 0 -14 Q11 -15 10 -6 L7 -9 L4 -5 L0 -10 L-4 -6 L-8 -8 Z" : "M-11 -1 Q-12 -15 1 -15 Q12 -14 10 -5 Q2 -9 -11 -1 Z"} fill={L2.hair ?? "#1f1712"} />
        )}
        {L2.zombie ? (
          <g>
            <ellipse cx={6} cy={-1} rx={3.4} ry={2.6} fill="#1a1f16" />
            <circle cx={6.4} cy={-1} r={1.6} fill={L2.eye ?? "#e8ff8a"} opacity={glow} />
            <circle cx={6.4} cy={-1} r={4} fill={L2.eye ?? "#e8ff8a"} opacity={0.25 * glow} />
            <path d="M3 7 L9 6.5" stroke={PAL.ink} strokeWidth={1.6} />
          </g>
        ) : (
          <g>
            <circle cx={6} cy={-1} r={1.5} fill={PAL.ink} />
            <path d="M5 -5 L9 -5.5" stroke={PAL.ink} strokeWidth={1.4} />
            <ellipse cx={6} cy={7} rx={2} ry={1.4} fill={PAL.ink} />
          </g>
        )}
      </g>
      {arm(p.shN, p.elN, p.wrN, 1)}
    </g>
  );
};
