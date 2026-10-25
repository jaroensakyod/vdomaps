import { random, useCurrentFrame } from "remotion";
import type { Costume } from "../../../components/Scene";

// Ancient-world pieces for "Illustration" panels, drawn like template components/Figures.tsx: side view,
// feet at y = 0, two-tone fills + dark outline, small idle motion. Use with template Scene.tsx (Depth, Ridge, Fighter).
const INK = "#1b1d24";

// Costumes for template <Fighter costume={...}>.
export const CARTHAGE: Costume = { jacket: "#a8322a", sash: "#d9a93a", pants: "#efe6d0", head: "helmet", headColor: "#b08a3a", skin: "#c08a5e" };
export const IBERIAN: Costume = { jacket: "#efe6d0", sash: "#a8322a", pants: "#6b5236", head: "short", skin: "#d39a6e" };

// War elephant, facing right, walking (phase t), with a rider and a red saddle cloth. ~150 units tall at scale 1.
export const Elephant = ({ x, y, scale = 1, phase = 0, walk = 1 }: { x: number; y: number; scale?: number; phase?: number; walk?: number }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.18 + phase;
  const leg = (dx: number, k: number, shade: boolean) => {
    const a = Math.sin(t + k) * 12 * walk;
    return <path key={dx} transform={`translate(${dx},-46) rotate(${a})`} d="M-11 0 L-10 46 L11 46 L12 0 Z" fill={shade ? "#6f7177" : "#8d8f94"} stroke={INK} strokeWidth={1.6} />;
  };
  const bob = Math.abs(Math.sin(t)) * 2 * walk;
  return (
    <g transform={`translate(${x},${y - bob}) scale(${scale})`}>
      <ellipse cx={0} cy={bob + 2} rx={70} ry={6} fill="#000" opacity={0.18} />
      {leg(-42, Math.PI, true)}
      {leg(34, 0, true)}
      <path d="M-70 -70 Q-74 -120 -20 -124 Q40 -128 58 -98 Q66 -70 50 -48 L-62 -46 Q-72 -52 -70 -70 Z" fill="#8d8f94" stroke={INK} strokeWidth={1.8} />
      <path d="M-72 -74 q-10 10 -6 30" stroke={INK} strokeWidth={2} fill="none" />
      {/* head, ear, trunk, tusk */}
      <path d="M44 -112 Q86 -122 92 -88 Q96 -66 88 -40 Q86 -20 96 -8 L88 -4 Q74 -20 76 -46 Q60 -60 50 -78 Z" fill="#8d8f94" stroke={INK} strokeWidth={1.8} />
      <path d="M50 -108 Q30 -104 34 -78 Q44 -66 58 -74 Q62 -96 50 -108 Z" fill="#7b7d83" stroke={INK} strokeWidth={1.4} />
      <path d="M80 -62 Q98 -58 104 -70" stroke="#f2ead8" strokeWidth={5} fill="none" strokeLinecap="round" />
      <circle cx={76} cy={-92} r={2.6} fill={INK} />
      {/* saddle cloth + rider */}
      <path d="M-34 -122 L22 -124 L26 -84 L-30 -82 Z" fill="#a8322a" stroke={INK} strokeWidth={1.4} />
      <path d="M-34 -96 L26 -98" stroke="#d9a93a" strokeWidth={4} />
      <path d="M-4 -124 L-8 -152 L10 -152 L12 -124 Z" fill="#a8322a" stroke={INK} strokeWidth={1.4} />
      <circle cx={2} cy={-160} r={9} fill="#c08a5e" stroke={INK} strokeWidth={1.4} />
      <path d="M-8 -162 Q2 -176 12 -162 Z" fill="#b08a3a" stroke={INK} strokeWidth={1.2} />
      {leg(-30, Math.PI * 0.5, false)}
      {leg(46, Math.PI * 1.5, false)}
    </g>
  );
};

// Log raft with a rope rail, for river crossings.
export const Raft = ({ x, y, w, s }: { x: number; y: number; w: number; s: number }) => (
  <g>
    {Array.from({ length: Math.floor(w / (16 * s)) }, (_, i) => (
      <rect key={i} x={x + i * 16 * s} y={y - 12 * s} width={15 * s} height={14 * s} rx={6 * s} fill={i % 2 ? "#7a5a3a" : "#8d6a45"} stroke={INK} strokeWidth={1.2 * s} />
    ))}
    <path d={`M${x} ${y - 34 * s} L${x + w} ${y - 34 * s}`} stroke="#c9b48a" strokeWidth={2.4 * s} />
    {[0.05, 0.5, 0.95].map((f) => <line key={f} x1={x + w * f} y1={y - 12 * s} x2={x + w * f} y2={y - 36 * s} stroke="#5a4028" strokeWidth={3 * s} />)}
  </g>
);

// River water with drifting glints (optionally ice floes).
export const Water = ({ x, y, W, H, s, color = "#3c6f8f", ice = 0 }: { x: number; y: number; W: number; H: number; s: number; color?: string; ice?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={x} y={y} width={W} height={H} fill={color} />
      {Array.from({ length: 18 }, (_, i) => {
        const gx = x + ((random(`w${i}`) * W + frame * (0.6 + random(`v${i}`))) % W);
        const gy = y + 8 * s + random(`h${i}`) * (H - 16 * s);
        return <line key={i} x1={gx} y1={gy} x2={gx + 26 * s} y2={gy} stroke="#cfe6f5" strokeWidth={2 * s} opacity={0.35} />;
      })}
      {ice > 0 && Array.from({ length: 10 }, (_, i) => <ellipse key={`i${i}`} cx={x + random(`ix${i}`) * W} cy={y + random(`iy${i}`) * H} rx={(20 + random(`ir${i}`) * 30) * s} ry={5 * s} fill="#e8f2f7" opacity={0.75 * ice} />)}
    </g>
  );
};

// Falling snow over a panel.
export const Snow = ({ x, y, W, H, s, k = 1, n = 70 }: { x: number; y: number; W: number; H: number; s: number; k?: number; n?: number }) => {
  const frame = useCurrentFrame();
  if (k <= 0) return null;
  return (
    <g opacity={k}>
      {Array.from({ length: n }, (_, i) => {
        const sp = 0.8 + random(`sp${i}`) * 1.4;
        const sy = y + ((random(`sy${i}`) * H + frame * sp * 2) % H);
        const sx = x + ((random(`sx${i}`) * W + Math.sin(frame * 0.05 + i) * 8 * s + frame * 0.6) % W);
        return <circle key={i} cx={sx} cy={sy} r={(1.4 + random(`sr${i}`) * 2) * s} fill="#fff" opacity={0.85} />;
      })}
    </g>
  );
};
