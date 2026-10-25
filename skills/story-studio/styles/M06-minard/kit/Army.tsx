import { useMap } from "../../../components/Map";

// Minard-style army band: a ribbon along the route, as wide as the number of men at each point.
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

export const ArmyBand = ({ pts, k, color, edge = "#1b1d24", perMan = 1 / 4200, opacity = 1, glow = false }: { pts: ArmyPt[]; k: number; color: string; edge?: string; perMan?: number; opacity?: number; glow?: boolean }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const line = cutRoute(pts, k, (p) => projection(p) as [number, number] | null);
  if (line.length < 2) return null;
  // Offset each vertex along the averaged normal of its two segments.
  const side = (sign: number) =>
    line.map((p, i) => {
      const a = line[Math.max(0, i - 1)];
      const b = line[Math.min(line.length - 1, i + 1)];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const half = (Math.max(p.men * perMan, 1.6) * s) / 2;
      return `${p.x + (-dy / len) * half * sign},${p.y + (dx / len) * half * sign}`;
    });
  const d = `M${side(1).join(" L")} L${side(-1).reverse().join(" L")} Z`;
  return (
    <g opacity={opacity}>
      {glow && <path d={d} fill={color} opacity={0.35} style={{ filter: `blur(${10 * s}px)` }} />}
      <path d={d} fill={color} stroke={edge} strokeWidth={(edge === "#1b1d24" ? 1.4 : 2.6) * s} strokeOpacity={0.85} strokeLinejoin="round" />
    </g>
  );
};

// Where the head of the band is, and how many men are there.
export const armyHead = (pts: ArmyPt[], k: number, project: (p: [number, number]) => [number, number] | null) => {
  const line = cutRoute(pts, k, project);
  return line[line.length - 1];
};

// Troop counter riding on the head of the band.
export const ArmyCounter = ({ pts, k, color, font, dy = -70, round = 1000 }: { pts: ArmyPt[]; k: number; color: string; font: string; dy?: number; round?: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const head = armyHead(pts, k, (p) => projection(p) as [number, number] | null);
  const men = Math.round(head.men / round) * round;
  const text = men.toLocaleString("en-US");
  const w = (text.length * 26 + 40) * s;
  const h = 58 * s;
  const y = head.y + dy * s;
  return (
    <g>
      <line x1={head.x} y1={head.y} x2={head.x} y2={y + h / 2} stroke="#fff" strokeWidth={2 * s} strokeOpacity={0.7} />
      <circle cx={head.x} cy={head.y} r={7 * s} fill="#fff" stroke={color} strokeWidth={3 * s} />
      <rect x={head.x - w / 2} y={y - h / 2} width={w} height={h} rx={12 * s} fill="rgba(8,14,26,0.9)" stroke={color} strokeWidth={3 * s} />
      <text x={head.x} y={y + 15 * s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={44 * s} fill="#fff">{text}</text>
    </g>
  );
};
