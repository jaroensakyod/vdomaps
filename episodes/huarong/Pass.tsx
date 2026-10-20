import { interpolate, random, useCurrentFrame } from "remotion";
import { useMap } from "../../components/Map";
import { Flame } from "../redcliffs/Fleet";
import { C } from "../redcliffs/Parchment";
import { P } from "../redcliffs/geo";

// The Huarong road (approximate — its exact course is still debated), east → west, through P.huarong.
export const ROAD: [number, number][] = [[112.75, 29.5], [112.67, 29.525], P.huarong, [112.535, 29.585], [112.46, 29.625]];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type XY = [number, number];

// Point and direction at share t (0 → 1) of a screen-space polyline.
const along = (pts: XY[], t: number) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? d / seg[i] : 0;
      const [a, b] = [pts[i], pts[i + 1]];
      const dir: XY = [(b[0] - a[0]) / (seg[i] || 1), (b[1] - a[1]) / (seg[i] || 1)];
      return { p: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k] as XY, dir, normal: [-dir[1], dir[0]] as XY };
    }
    d -= seg[i];
  }
  return { p: pts[0], dir: [1, 0] as XY, normal: [0, 1] as XY };
};

const GATE_T = 0.5; // where Guan Yu blocks the road (P.huarong)

export const Pass = ({
  appear,
  until,
  arrive, // Cao's men reach Guan Yu
  release, // Guan Yu's line steps aside
  through, // Cao's men are past
  historyAt, // Guan Yu removed: "not in the records"
  mudAt, // road turns to mud
  strawStart,
  strawEnd,
  marchStart, // the recorded crossing
  marchEnd,
  fireAt, // Liu Bei's fire, too late
}: {
  appear: number;
  until: number;
  arrive: number;
  release: number;
  through: number;
  historyAt: number;
  mudAt: number;
  strawStart: number;
  strawEnd: number;
  marchStart: number;
  marchEnd: number;
  fireAt: number;
}) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const o = interpolate(frame, [appear, appear + 15, until, until + 15], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const pts = ROAD.map((p) => (projection(p) ?? [0, 0]) as XY);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const pxPerDeg = (projection.scale() * Math.PI) / 180;
  const roadW = Math.max(18 * s, pxPerDeg * 0.011);
  const mud = interpolate(frame, [mudAt, mudAt + 20], [0, 1], clamp);

  // Novel: Cao's men walk up to the gate, wait, then pass. History: they cross the mud on straw.
  const novelT = frame < historyAt
    ? interpolate(frame, [appear, arrive], [0, GATE_T - 0.09], clamp) + interpolate(frame, [release + 10, through], [0, 0.6], clamp)
    : 0;
  const histT = interpolate(frame, [marchStart, marchEnd], [0, 1.05], clamp);
  const lead = frame < historyAt ? novelT : histT;
  const guanOut = interpolate(frame, [historyAt, historyAt + 15], [1, 0], clamp);
  const aside = interpolate(frame, [release, release + 25], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });

  const gate = along(pts, GATE_T);
  const strawN = 9;
  return (
    <g opacity={o}>
      {/* road / mud */}
      <path d={d} fill="none" stroke={C.coast} strokeOpacity={0.25} strokeWidth={roadW + 10 * s} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={mud > 0 ? "#6e5232" : "#b8955e"} strokeWidth={roadW * (1 + mud * 0.5)} strokeLinecap="round" strokeLinejoin="round" />
      {mud > 0 &&
        Array.from({ length: 70 }, (_, i) => {
          const a = along(pts, random(`m${i}`));
          const off = (random(`mo${i}`) - 0.5) * roadW * 1.3;
          return <ellipse key={i} cx={a.p[0] + a.normal[0] * off} cy={a.p[1] + a.normal[1] * off} rx={9 * s} ry={5 * s} fill="#4a3720" opacity={0.55 * mud} />;
        })}
      {/* straw laid section by section */}
      {Array.from({ length: strawN }, (_, i) => {
        const at = strawStart + ((strawEnd - strawStart) * i) / strawN;
        const k = interpolate(frame, [at, at + 8], [0, 1], clamp);
        if (k <= 0) return null;
        const a = along(pts, (i + 0.5) / strawN);
        const ang = (Math.atan2(a.dir[1], a.dir[0]) * 180) / Math.PI;
        return (
          <g key={i} transform={`translate(${a.p[0]},${a.p[1]}) rotate(${ang}) scale(${k})`}>
            <rect x={-roadW * 0.55} y={-roadW * 0.42} width={roadW * 1.1} height={roadW * 0.84} rx={4 * s} fill="#d6b04a" stroke="#8a6a1f" strokeWidth={2 * s} />
            {[-0.3, 0, 0.3].map((y) => (
              <line key={y} x1={-roadW * 0.45} x2={roadW * 0.45} y1={roadW * y} y2={roadW * y} stroke="#8a6a1f" strokeWidth={1.4 * s} />
            ))}
          </g>
        );
      })}
      {/* Guan Yu's line across the road (novel only) */}
      {guanOut > 0 &&
        frame >= appear + 10 &&
        Array.from({ length: 7 }, (_, i) => {
          const off = (i - 3) * 22 * s + aside * (i < 3.5 ? -1 : 1) * 70 * s;
          return (
            <rect key={i} x={gate.p[0] + gate.normal[0] * off - 9 * s} y={gate.p[1] + gate.normal[1] * off - 9 * s} width={18 * s} height={18 * s} fill={C.shu} stroke="#fff6dd" strokeWidth={2.5 * s} opacity={guanOut} />
          );
        })}
      {/* Cao's last few hundred men: a short column of dots; in the mud some fall behind */}
      {Array.from({ length: 26 }, (_, i) => {
        const t = lead - i * 0.012;
        if (t <= 0) return null;
        const fallen = frame >= historyAt && random(`fall${i}`) < 0.3 && t > 0.15 + random(`fp${i}`) * 0.5;
        const tt = fallen ? 0.15 + random(`fp${i}`) * 0.5 : t;
        const a = along(pts, Math.min(tt, 1));
        const off = ((i % 3) - 1) * 9 * s;
        const kneel = frame >= arrive && frame < release && frame < historyAt ? 0.75 : 1;
        return (
          <circle key={i} cx={a.p[0] + a.normal[0] * off} cy={a.p[1] + a.normal[1] * off} r={6 * s * kneel} fill={fallen ? "#5b5048" : C.wei} stroke="#fff6dd" strokeWidth={1.5 * s} opacity={fallen ? 0.7 : 1} />
        );
      })}
      {/* Liu Bei's fire, lit after Cao has gone */}
      {frame >= fireAt &&
        [0.02, 0.08, 0.14, 0.2].map((t, i) => {
          const a = along(pts, t);
          const k = interpolate(frame, [fireAt + i * 5, fireAt + i * 5 + 14], [0, 1], clamp);
          return (
            <g key={i} transform={`translate(${a.p[0] + a.normal[0] * (i % 2 ? 14 : -14) * s},${a.p[1]})`}>
              <Flame size={46 * s} seed={300 + i} frame={frame} k={k} />
            </g>
          );
        })}
    </g>
  );
};
