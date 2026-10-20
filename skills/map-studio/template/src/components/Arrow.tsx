import { Easing, interpolate, useCurrentFrame } from "remotion";
import { useMap } from "./Map";

type XY = [number, number];

// Catmull-Rom through screen points so a few waypoints make a sweeping curve.
const smooth = (pts: XY[], seg = 14): XY[] => {
  if (pts.length < 3) return pts;
  const out: XY[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    for (let j = 0; j < seg; j++) {
      const t = j / seg;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

// Cut a polyline at length `len`; returns the points up to there plus cumulative lengths.
const cut = (pts: XY[], len: number) => {
  const out: XY[] = [pts[0]];
  const at: number[] = [0];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + d >= len) {
      const k = (len - acc) / d;
      out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]);
      at.push(len);
      return { out, at };
    }
    acc += d;
    out.push(pts[i]);
    at.push(acc);
  }
  return { out, at };
};

const totalLength = (pts: XY[]) => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

// Campaign arrow through [lon, lat] waypoints, grown from `start` to `end`.
// variant "solid" = tapered filled body (an army advancing); "dashed" = thin dashed line (a retreat, an envoy).
export const Arrow = ({
  points,
  start,
  end,
  color,
  width = 24,
  variant = "solid",
  outline = "#2b1d10",
  opacity = 1,
}: {
  points: [number, number][];
  start: number;
  end: number;
  color: string;
  width?: number;
  variant?: "solid" | "dashed";
  outline?: string;
  opacity?: number;
}) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (frame < start || opacity <= 0) return null;
  const p = interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const scr = points.map((pt) => projection(pt)).filter((x): x is XY => !!x);
  if (scr.length < 2) return null;
  const pts = smooth(scr);
  const L = totalLength(pts);
  const len = L * p;
  if (len < 2) return null;
  const w0 = width * s;
  const headLen = Math.min(w0 * 2.1, len * 0.6);
  const headW = w0 * (variant === "solid" ? 2.0 : 1.6);
  const { out: body, at } = cut(pts, Math.max(1, len - headLen));
  const { out: whole } = cut(pts, len);
  const tip = whole[whole.length - 1];
  const base = body[body.length - 1];
  const dx = tip[0] - base[0];
  const dy = tip[1] - base[1];
  const dl = Math.hypot(dx, dy) || 1;
  const n: XY = [-dy / dl, dx / dl];
  const head = `M${base[0] + (n[0] * headW) / 2},${base[1] + (n[1] * headW) / 2} L${tip[0]},${tip[1]} L${base[0] - (n[0] * headW) / 2},${base[1] - (n[1] * headW) / 2} Z`;

  if (variant === "dashed") {
    const d = body.map((q, i) => `${i ? "L" : "M"}${q[0]},${q[1]}`).join(" ");
    return (
      <g opacity={opacity}>
        <path d={d} fill="none" stroke={outline} strokeWidth={w0 * 0.42 + 3 * s} strokeLinecap="round" strokeDasharray={`${w0 * 0.9} ${w0 * 0.6}`} />
        <path d={d} fill="none" stroke={color} strokeWidth={w0 * 0.42} strokeLinecap="round" strokeDasharray={`${w0 * 0.9} ${w0 * 0.6}`} />
        <path d={head} fill={color} stroke={outline} strokeWidth={2 * s} strokeLinejoin="round" />
      </g>
    );
  }

  // Tapered body: narrower at the tail, full width behind the head.
  const left: XY[] = [];
  const right: XY[] = [];
  body.forEach((q, i) => {
    const a = body[Math.max(0, i - 1)];
    const b = body[Math.min(body.length - 1, i + 1)];
    const ex = b[0] - a[0];
    const ey = b[1] - a[1];
    const el = Math.hypot(ex, ey) || 1;
    const t = L ? at[i] / L : 0;
    const w = (w0 * (0.45 + 0.55 * Math.min(1, t / Math.max(p, 0.01)))) / 2;
    left.push([q[0] - (ey / el) * w, q[1] + (ex / el) * w]);
    right.push([q[0] + (ey / el) * w, q[1] - (ex / el) * w]);
  });
  const hl: XY = [base[0] + (n[0] * headW) / 2, base[1] + (n[1] * headW) / 2];
  const hr: XY = [base[0] - (n[0] * headW) / 2, base[1] - (n[1] * headW) / 2];
  const poly = [...left, hl, tip, hr, ...right.reverse()];
  const d = poly.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ") + " Z";
  return (
    <g opacity={opacity}>
      <path d={d} fill="rgba(40,25,10,0.25)" transform={`translate(${4 * s},${5 * s})`} />
      <path d={d} fill={color} stroke={outline} strokeWidth={2.5 * s} strokeLinejoin="round" />
    </g>
  );
};
