import { interpolate, useCurrentFrame } from "remotion";
import { useMap } from "../../../components/Map";
import { PAL } from "../../../components/Scene";
import { clamp } from "../news/kit";
import type { G } from "../ep04/v2";

// Scene pieces for chapters 3–4 of episode 5: railway, telegraph, survey, desks, flags, the 1893 crisis.

// Steam locomotive with tender and two carriages, facing right. Base at (x, y).
export const Locomotive = ({ x, y, s, cars = 2 }: { x: number; y: number; s: number; cars?: number }) => {
  const frame = useCurrentFrame();
  const wheel = (cx: number, r: number, key: string) => (
    <g key={key} transform={`rotate(${frame * 9},${cx},${-r})`}>
      <circle cx={cx} cy={-r} r={r} fill="#2a2a2a" stroke={PAL.ink} strokeWidth={2} />
      <line x1={cx - r} y1={-r} x2={cx + r} y2={-r} stroke="#8a8a80" strokeWidth={2} />
      <line x1={cx} y1={-2 * r} x2={cx} y2={0} stroke="#8a8a80" strokeWidth={2} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {Array.from({ length: 7 }, (_, i) => {
        const t = (frame * 0.9 + i * 12) % 84;
        return <circle key={i} cx={70 - t * 2.2} cy={-150 - t * 0.7} r={12 + t * 0.4} fill="#e9e2d6" opacity={0.6 * (1 - t / 84)} />;
      })}
      {Array.from({ length: cars }, (_, i) => (
        <g key={i} transform={`translate(${-250 - i * 150},0)`}>
          <rect x={-66} y={-92} width={132} height={68} rx={6} fill={i % 2 ? "#6a3a22" : "#7a2a1a"} stroke={PAL.ink} strokeWidth={2} />
          <rect x={-72} y={-100} width={144} height={10} rx={4} fill="#3a2a1a" />
          {[-44, -14, 16, 46].map((wx) => <rect key={wx} x={wx - 10} y={-80} width={20} height={20} fill="#f3d9a0" stroke={PAL.ink} strokeWidth={1.2} />)}
          {wheel(-40, 12, "a")}
          {wheel(40, 12, "b")}
        </g>
      ))}
      <rect x={-150} y={-70} width={90} height={46} fill="#2a2a2a" stroke={PAL.ink} strokeWidth={2} />
      <rect x={-50} y={-88} width={140} height={64} rx={20} fill="#1f3a2a" stroke={PAL.ink} strokeWidth={2.2} />
      <rect x={-60} y={-128} width={56} height={104} fill="#7a2a1a" stroke={PAL.ink} strokeWidth={2} />
      <rect x={-54} y={-118} width={20} height={22} fill="#f3d9a0" />
      <rect x={58} y={-140} width={20} height={56} fill="#2a2a2a" stroke={PAL.ink} strokeWidth={2} />
      <path d="M50 -142 L86 -142 L80 -132 L56 -132 Z" fill="#2a2a2a" stroke={PAL.ink} strokeWidth={1.6} />
      <path d="M90 -30 L118 -10 L90 -10 Z" fill="#3a3a3a" stroke={PAL.ink} strokeWidth={1.6} />
      {wheel(-20, 22, "w1")}
      {wheel(34, 22, "w2")}
      {wheel(76, 12, "w3")}
      {wheel(-120, 12, "t1")}
      {wheel(-86, 12, "t2")}
    </g>
  );
};

// Rails across the panel at height y (perspective-free, side view).
export const Rails = ({ g, y, pan = 0 }: { g: G; y: number; pan?: number }) => (
  <g>
    <rect x={g.x - 60 * g.s} y={y} width={g.W + 120 * g.s} height={10 * g.s} fill="#6b5236" />
    {Array.from({ length: 40 }, (_, i) => <rect key={i} x={g.x + ((i * 34 * g.s + pan * 0.8) % (g.W + 80 * g.s)) - 40 * g.s} y={y - 2 * g.s} width={14 * g.s} height={14 * g.s} fill="#4a3220" />)}
    <rect x={g.x - 60 * g.s} y={y - 4 * g.s} width={g.W + 120 * g.s} height={4 * g.s} fill="#9a9a90" />
  </g>
);

// Telegraph pole (cross-arm with insulators), base (x, y).
export const Pole = ({ x, y, s, h = 150 }: { x: number; y: number; s: number; h?: number }) => (
  <g>
    <rect x={x - 3.5 * s} y={y - h * s} width={7 * s} height={h * s} fill="#5a3a1f" stroke={PAL.ink} strokeWidth={1.2 * s} />
    <rect x={x - 26 * s} y={y - (h - 14) * s} width={52 * s} height={6 * s} fill="#5a3a1f" stroke={PAL.ink} strokeWidth={1.2 * s} />
    {[-20, 20].map((d) => <circle key={d} cx={x + d * s} cy={y - (h - 10) * s} r={4 * s} fill="#cfe6f0" stroke={PAL.ink} strokeWidth={1 * s} />)}
  </g>
);

// Wire between poles with a travelling spark (message) — a soft glow, no blinking.
export const Wire = ({ a, b, s, t }: { a: [number, number]; b: [number, number]; s: number; t: number }) => {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2 + 16 * s;
  const k = (t % 60) / 60;
  const px = (1 - k) * (1 - k) * a[0] + 2 * (1 - k) * k * mx + k * k * b[0];
  const py = (1 - k) * (1 - k) * a[1] + 2 * (1 - k) * k * my + k * k * b[1];
  return (
    <g>
      <path d={`M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`} stroke="#2a2a2a" strokeWidth={1.6 * s} fill="none" />
      <circle cx={px} cy={py} r={9 * s} fill="#ffe7a0" opacity={0.35} />
      <circle cx={px} cy={py} r={3.5 * s} fill="#fff6c8" />
    </g>
  );
};

// Surveyor's theodolite on a tripod, base (x, y).
export const Theodolite = ({ x, y, s }: { x: number; y: number; s: number }) => {
  const frame = useCurrentFrame();
  const turn = Math.sin(frame * 0.03) * 8;
  return (
    <g>
      {[-22, 0, 22].map((d) => <line key={d} x1={x} y1={y - 70 * s} x2={x + d * s} y2={y} stroke="#5a3a1f" strokeWidth={4 * s} />)}
      <g transform={`rotate(${turn},${x},${y - 80 * s})`}>
        <rect x={x - 14 * s} y={y - 92 * s} width={28 * s} height={20 * s} rx={4 * s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * s} />
        <rect x={x - 26 * s} y={y - 104 * s} width={52 * s} height={11 * s} rx={5 * s} fill="#3a3a3a" stroke={PAL.ink} strokeWidth={1.2 * s} />
      </g>
    </g>
  );
};

// Striped survey pole / boundary flag (red-white), base (x, y). `up` 0..1 raises it.
export const SurveyPole = ({ x, y, s, up = 1 }: { x: number; y: number; s: number; up?: number }) => {
  const frame = useCurrentFrame();
  const h = 120 * s * up;
  return (
    <g>
      {Array.from({ length: 6 }, (_, i) => (i * 20 * s < h ? <rect key={i} x={x - 3 * s} y={y - Math.min(h, (i + 1) * 20 * s)} width={6 * s} height={Math.min(20 * s, h - i * 20 * s)} fill={i % 2 ? "#f4f2ea" : "#c9302c"} /> : null))}
      {up > 0.95 && <path d={`M${x} ${y - h} q${18 * s} ${-4 * s + Math.sin(frame * 0.3) * 3 * s} ${30 * s} 0 v${18 * s} q${-14 * s} ${4 * s} ${-30 * s} 0 Z`} fill="#c9302c" stroke={PAL.ink} strokeWidth={1.2 * s} />}
    </g>
  );
};

// Hourglass; k = share of sand already fallen (0..1).
export const Hourglass = ({ x, y, s, k }: { x: number; y: number; s: number; k: number }) => {
  const frame = useCurrentFrame();
  const top = 1 - k;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-46} y={-8} width={92} height={10} rx={3} fill="#5a3a1f" stroke={PAL.ink} strokeWidth={1.6} />
      <rect x={-46} y={-170} width={92} height={10} rx={3} fill="#5a3a1f" stroke={PAL.ink} strokeWidth={1.6} />
      <path d="M-36 -160 Q-36 -110 -4 -88 Q-36 -66 -36 -8 L36 -8 Q36 -66 4 -88 Q36 -110 36 -160 Z" fill="#dfeff4" opacity={0.35} stroke={PAL.ink} strokeWidth={2} />
      <path d={`M${-30 * top} ${-96 - 50 * top} Q0 ${-100 - 54 * top} ${30 * top} ${-96 - 50 * top} L4 -90 L-4 -90 Z`} fill={PAL.gilt} />
      <path d={`M-34 -10 Q0 ${-10 - 60 * k} 34 -10 Z`} fill={PAL.gilt} />
      {k < 0.98 && <line x1={0} y1={-88} x2={0} y2={-12 - 50 * k} stroke={PAL.gilt} strokeWidth={2.4} strokeDasharray="4 4" strokeDashoffset={-frame * 1.5} />}
    </g>
  );
};

// Simple national flag on a short pole (vertical tricolours / Nordic cross), base (x, y).
export const NationFlag = ({ x, y, s, kind }: { x: number; y: number; s: number; kind: "be" | "dk" | "de" | "uk" | "fr" | "us" | "siam" }) => {
  const frame = useCurrentFrame();
  const w = 40 * s;
  const h = 26 * s;
  const top = y - 80 * s;
  const sway = Math.sin(frame * 0.2 + x * 0.01) * 2 * s;
  const cloth = (() => {
    switch (kind) {
      case "be": return [["#1a1a1a", 0, 1 / 3], ["#f2c230", 1 / 3, 1 / 3], ["#c9302c", 2 / 3, 1 / 3]] as const;
      case "fr": return [["#2a3f9a", 0, 1 / 3], ["#f4f2ea", 1 / 3, 1 / 3], ["#c9302c", 2 / 3, 1 / 3]] as const;
      default: return null;
    }
  })();
  return (
    <g transform={`translate(0,${sway})`}>
      <line x1={x} y1={y} x2={x} y2={top - 2 * s} stroke="#e8e2d0" strokeWidth={2.4 * s} />
      {cloth && cloth.map(([c, a, b]) => <rect key={a} x={x + w * a} y={top} width={w * b + 0.5} height={h} fill={c} />)}
      {kind === "dk" && (
        <g>
          <rect x={x} y={top} width={w} height={h} fill="#c9302c" />
          <rect x={x + w * 0.3} y={top} width={5 * s} height={h} fill="#f4f2ea" />
          <rect x={x} y={top + h / 2 - 2.5 * s} width={w} height={5 * s} fill="#f4f2ea" />
        </g>
      )}
      {kind === "de" && [["#1a1a1a", 0], ["#f4f2ea", 1], ["#c9302c", 2]].map(([c, i]) => <rect key={i as number} x={x} y={top + (h / 3) * (i as number)} width={w} height={h / 3 + 0.5} fill={c as string} />)}
      {kind === "us" && (
        <g>
          {Array.from({ length: 7 }, (_, i) => <rect key={i} x={x} y={top + (h / 7) * i} width={w} height={h / 7 + 0.3} fill={i % 2 ? "#f4f2ea" : "#b0262a"} />)}
          <rect x={x} y={top} width={w * 0.42} height={h * 0.55} fill="#1f2a6a" />
        </g>
      )}
      {kind === "uk" && (
        <g>
          <rect x={x} y={top} width={w} height={h} fill="#1f2a6a" />
          <path d={`M${x} ${top} L${x + w} ${top + h} M${x + w} ${top} L${x} ${top + h}`} stroke="#f4f2ea" strokeWidth={4 * s} />
          <path d={`M${x + w / 2} ${top} V${top + h} M${x} ${top + h / 2} H${x + w}`} stroke="#c9302c" strokeWidth={5 * s} />
        </g>
      )}
      {kind === "siam" && (
        <g>
          <rect x={x} y={top} width={w} height={h} fill="#c9302c" />
          <ellipse cx={x + w / 2} cy={top + h / 2} rx={8 * s} ry={5 * s} fill="#f4f2ea" />
        </g>
      )}
      <rect x={x} y={top} width={w} height={h} fill="none" stroke={PAL.ink} strokeWidth={1.2 * s} />
    </g>
  );
};

// Water column thrown up by a shell landing at frame `at` (rises over 6 frames, falls over ~24).
export const Splash = ({ x, y, s, at }: { x: number; y: number; s: number; at: number }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 34) return null;
  const h = interpolate(t, [0, 6, 34], [0, 110, 0], clamp) * s;
  const o = interpolate(t, [0, 3, 34], [0, 0.9, 0], clamp);
  return (
    <g opacity={o}>
      <path d={`M${x - 22 * s} ${y} Q${x - 10 * s} ${y - h} ${x} ${y - h * 1.05} Q${x + 10 * s} ${y - h} ${x + 22 * s} ${y} Z`} fill="#e8f4f8" />
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={x + (i - 2.5) * 12 * s} cy={y - h * (0.6 + 0.3 * Math.sin(i))} r={5 * s} fill="#e8f4f8" />)}
    </g>
  );
};

// Map: a gunboat glyph at a lon/lat (heading in degrees, 0 = east).
export const BoatGlyph = ({ at, heading = 0, color, size = 1 }: { at: [number, number]; heading?: number; color: string; size?: number }) => {
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p) return null;
  const z = s * size;
  return (
    <g transform={`translate(${p[0]},${p[1]}) rotate(${heading})`}>
      <circle r={26 * z} fill={color} opacity={0.25} />
      <path d={`M${-20 * z} ${-7 * z} L${14 * z} ${-7 * z} L${24 * z} 0 L${14 * z} ${7 * z} L${-20 * z} ${7 * z} Z`} fill="#23262c" stroke="#fff" strokeWidth={2 * z} />
      <rect x={-4 * z} y={-4 * z} width={7 * z} height={8 * z} fill={color} />
    </g>
  );
};

// Position along a polyline (lon/lat) at fraction k, with heading in screen degrees (approximate: lon→x, lat→−y).
export const along = (pts: [number, number][], k: number): { at: [number, number]; heading: number } => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, k)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const f = seg[i] ? Math.min(1, d / seg[i]) : 0;
      const a = pts[i];
      const b = pts[i + 1];
      return { at: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], heading: (Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180) / Math.PI };
    }
    d -= seg[i];
  }
  return { at: pts[pts.length - 1], heading: 0 };
};

// Map: dashed glowing line between two lon/lat points, drawn in over 20 frames from `start`, dashes flowing.
export const MapLine = ({ a, b, start, end = 1e9, color, width = 4, dash = true }: { a: [number, number]; b: [number, number]; start: number; end?: number; color: string; width?: number; dash?: boolean }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const pa = projection(a);
  const pb = projection(b);
  if (!pa || !pb || frame < start || frame > end + 12) return null;
  const k = interpolate(frame, [start, start + 20], [0, 1], clamp);
  const o = interpolate(frame, [end, end + 12], [1, 0], clamp);
  const ex = pa[0] + (pb[0] - pa[0]) * k;
  const ey = pa[1] + (pb[1] - pa[1]) * k;
  return (
    <g opacity={o}>
      <line x1={pa[0]} y1={pa[1]} x2={ex} y2={ey} stroke={color} strokeWidth={width * 3 * s} strokeOpacity={0.25} strokeLinecap="round" />
      <line x1={pa[0]} y1={pa[1]} x2={ex} y2={ey} stroke={color} strokeWidth={width * s} strokeLinecap="round" strokeDasharray={dash ? `${12 * s} ${8 * s}` : undefined} strokeDashoffset={-frame * 1.5 * s} />
    </g>
  );
};
