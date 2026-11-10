// The 42 weather balloons: a loose cluster above the chair (Fibonacci points on an ellipsoid, jittered), each on its
// own string tied to the chair's back frame. Shared by world.ts (spheres + strings) and cast.ts (pop bursts).
import { V3 } from "./story";

export type Balloon = { off: V3; r: number; col: string; tie: V3; order: number };
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
/** muted weather-balloon creams and tans, a few pale peach (readable against the day sky) */
const COLS = ["#fff1cf", "#ffe3b0", "#ffdcc6", "#fff6e2", "#f9dca0", "#ffe9d6"];
export const CLUSTER: V3 = [0, 7.4, -0.5];
export const BALLOONS: Balloon[] = Array.from({ length: 42 }, (_, i) => {
  const n = 42, y = 1 - (2 * (i + 0.5)) / n, rr = Math.sqrt(1 - y * y), th = i * 2.399963;
  const off: V3 = [CLUSTER[0] + 3.0 * rr * Math.cos(th) + (hh(i) - 0.5) * 0.5, CLUSTER[1] + 2.5 * y + (hh(i, 1) - 0.5) * 0.4, CLUSTER[2] + 3.0 * rr * Math.sin(th) + (hh(i, 2) - 0.5) * 0.5];
  const tie: V3 = [i % 2 ? 0.27 : -0.27, 0.98, -0.32];
  // order in which they appear in shot 3: bottom ones first (they are tied first), top last
  return { off, r: 0.88 + hh(i, 3) * 0.22, col: COLS[i % COLS.length], tie, order: 0 };
});
const byHeight = BALLOONS.map((b, i) => [b.off[1], i] as const).sort((a, b) => a[0] - b[0]);
byHeight.forEach(([, i], k) => (BALLOONS[i].order = k));
/** gentle per-balloon drift (world-space offset added to off) */
export const bob = (i: number, t: number): V3 => [0.08 * Math.sin(t * 0.9 + i), 0.1 * Math.sin(t * 1.3 + i * 2.1), 0.08 * Math.cos(t * 0.8 + i * 1.7)];
