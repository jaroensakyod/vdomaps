import { interpolate } from "remotion";
import { useMap } from "../../../components/Map";

// The army band: a ribbon along its route, as wide as the number of men at each point, printed flat like a
// lithographed plate (flat colour, a fine black edge, a few engraved shade lines along it).
// pts = [lon, lat, men]; k = how far along the route it has marched (0 → 1, by screen length).
// Width is screen-constant (perMan × men px at 1080), so the band reads the same at any zoom.
export type ArmyPt = [number, number, number];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const cutRoute = (pts: ArmyPt[], k: number, project: (p: [number, number]) => [number, number] | null) => {
  const xy = pts.map((p) => project([p[0], p[1]]) ?? [0, 0]);
  const seg = xy.slice(1).map((p, i) => Math.hypot(p[0] - xy[i][0], p[1] - xy[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = Math.max(0, Math.min(1, k)) * total;
  const out: { x: number; y: number; men: number }[] = [{ x: xy[0][0], y: xy[0][1], men: pts[0][2] }];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const t = Math.min(1, left / (seg[i] || 1));
    out.push({ x: lerp(xy[i][0], xy[i + 1][0], t), y: lerp(xy[i][1], xy[i + 1][1], t), men: lerp(pts[i][2], pts[i + 1][2], t) });
    left -= seg[i];
  }
  return out;
};

export const ArmyBand = ({ pts, k, color, edge = "#21140b", perMan = 1 / 3600, opacity = 1, shade = true }: { pts: ArmyPt[]; k: number; color: string; edge?: string; perMan?: number; opacity?: number; shade?: boolean }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const line = cutRoute(pts, k, (p) => projection(p) as [number, number] | null);
  if (line.length < 2) return null;
  const side = (sign: number, f = 1) =>
    line.map((p, i) => {
      const a = line[Math.max(0, i - 1)];
      const b = line[Math.min(line.length - 1, i + 1)];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const half = ((Math.max(p.men * perMan, 1.6) * s) / 2) * f;
      return `${p.x + (-dy / len) * half * sign},${p.y + (dx / len) * half * sign}`;
    });
  const d = `M${side(1).join(" L")} L${side(-1).reverse().join(" L")} Z`;
  return (
    <g opacity={opacity}>
      <path d={d} fill={color} stroke={edge} strokeWidth={1.3 * s} strokeLinejoin="round" />
      {/* engraved shade lines along the lower edge of the band */}
      {shade && [0.72, 0.84].map((f) => <path key={f} d={`M${side(-1, f).join(" L")}`} fill="none" stroke={edge} strokeWidth={0.8 * s} opacity={0.45} />)}
    </g>
  );
};

export const armyHead = (pts: ArmyPt[], k: number, project: (p: [number, number]) => [number, number] | null) => {
  const line = cutRoute(pts, k, project);
  return line[line.length - 1];
};

// Engraved figure riding the head of the band: a fine leader, a small ring, the number in plate numerals.
export const ArmyCounter = ({ pts, k, font, dy = -70, round = 1000, color = "#21140b" }: { pts: ArmyPt[]; k: number; font: string; dy?: number; round?: number; color?: string }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const head = armyHead(pts, k, (p) => projection(p) as [number, number] | null);
  const men = Math.round(head.men / round) * round;
  const y = head.y + dy * s;
  const o = interpolate(k, [0, 0.02], [0, 1]);
  return (
    <g opacity={o}>
      <line x1={head.x} y1={head.y} x2={head.x} y2={y + 12 * s} stroke={color} strokeWidth={1 * s} />
      <circle cx={head.x} cy={head.y} r={6 * s} fill="#f8f4ea" stroke={color} strokeWidth={1.6 * s} />
      <text x={head.x} y={y} textAnchor="middle" fontFamily={font} fontWeight={700} fontStyle="italic" fontSize={46 * s} fill={color} stroke="#f8f4ea" strokeWidth={8 * s} paintOrder="stroke">
        {men.toLocaleString("en-US")}
      </text>
    </g>
  );
};
