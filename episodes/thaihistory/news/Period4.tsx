import { random, useCurrentFrame } from "remotion";

// Campaign pieces: a general on horseback, mountains, a Lanna timber gate, carts of rice, a palisade village.
const INK = "#1b1d24";

// Burmese general on a horse with a banner. Ground at y = 0.
export const HorseGeneral = ({ x, y, scale = 1, phase = 0, flip = false, gallop = false, banner = "#c7322a", coat = "#8e2a22" }: { x: number; y: number; scale?: number; phase?: number; flip?: boolean; gallop?: boolean; banner?: string; coat?: string }) => {
  const frame = useCurrentFrame();
  const t = frame * (gallop ? 0.45 : 0.2) + phase;
  const g = Math.sin(t);
  const bob = gallop ? -Math.abs(g) * 5 : Math.sin(frame * 0.06 + phase);
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={2} rx={52} ry={5} fill="#000" opacity={0.25} />
      {[[-30, 1], [-18, -1], [22, 1], [34, -1]].map(([lx, d], i) => (
        <g key={i} transform={`rotate(${gallop ? g * 28 * d : 0},${lx},-44)`} opacity={i % 2 ? 1 : 0.85}>
          <path d={`M${lx - 4} -46 L${lx + 4} -46 L${lx + 3} -4 L${lx - 3} -4 Z`} fill="#6b3f22" stroke={INK} strokeWidth={1.4} />
          <rect x={lx - 4} y={-5} width={8} height={5} fill="#2a1d14" />
        </g>
      ))}
      <g transform={`translate(0,${bob})`}>
        <path d="M-44 -48 Q-48 -78 -14 -78 L26 -78 Q46 -78 44 -50 Q20 -40 -44 -48 Z" fill="#7a4a28" stroke={INK} strokeWidth={1.6} />
        <path d="M32 -74 L54 -108 Q64 -114 70 -104 L62 -84 L46 -64 Z" fill="#7a4a28" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M54 -108 Q48 -96 40 -94" stroke="#2a1d14" strokeWidth={5} fill="none" />
        <circle cx={62} cy={-100} r={2} fill={INK} />
        <path d={`M-44 -66 Q-62 ${-56 + g * 4} -60 -36`} stroke="#2a1d14" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M-20 -80 L14 -80 L12 -70 L-18 -70 Z" fill="#c9a03c" stroke={INK} strokeWidth={1.2} />
        {/* rider */}
        <path d="M-10 -118 Q-12 -96 -10 -80 L10 -80 Q12 -96 10 -118 Q0 -123 -10 -118 Z" fill={coat} stroke={INK} strokeWidth={1.5} />
        <path d="M-4 -82 L-8 -60 L2 -60 Z" fill="#2f4f6b" stroke={INK} strokeWidth={1.2} />
        <g transform="translate(0,-130)">
          <ellipse cx={0} cy={0} rx={9} ry={10} fill="#a86b45" stroke={INK} strokeWidth={1.4} />
          <path d="M-10 -2 Q-10 -14 0 -14 Q10 -14 10 -2 Q0 -7 -10 -2 Z" fill="#e2b84a" stroke={INK} strokeWidth={1.2} />
          <path d="M-2 -14 L0 -26 L2 -14 Z" fill="#e2b84a" />
          <circle cx={5} cy={1} r={1.2} fill={INK} />
        </g>
        <line x1={14} y1={-110} x2={14} y2={-190} stroke="#6b4a2b" strokeWidth={2.6} />
        <path d={`M14 -190 L${54 + g * 2} ${-184 + g * 3} L${50 + g * 2} ${-160 + g * 3} L14 -164 Z`} fill={banner} stroke={INK} strokeWidth={1.3} />
      </g>
    </g>
  );
};

// Layered mountain range across a box, ridges in three tones.
export const Mountains = ({ x, y, W, s, h = 200, seed = "m" }: { x: number; y: number; W: number; s: number; h?: number; seed?: string }) => (
  <g>
    {[0, 1, 2].map((layer) => {
      const n = 7 + layer * 2;
      const pts = Array.from({ length: n + 1 }, (_, i) => `${x + (i / n) * W},${y - (h * (0.45 + random(`${seed}${layer}${i}`) * 0.55) * (1 - layer * 0.25)) * s}`).join(" L");
      return <path key={layer} d={`M${x},${y} L${pts} L${x + W},${y} Z`} fill={["#4f6a5a", "#3e5848", "#2f4637"][layer]} stroke={INK} strokeWidth={1.2 * s} strokeOpacity={0.5} />;
    })}
  </g>
);

// Lanna timber city gate with a tiered roof; `burn` 0 → 1 sets it on fire.
export const LannaGate = ({ x, y, s, burn = 0 }: { x: number; y: number; s: number; burn?: number }) => (
  <g>
    <rect x={x - 200 * s} y={y - 70 * s} width={400 * s} height={70 * s} fill="#9a6a3c" stroke={INK} strokeWidth={1.5 * s} />
    {Array.from({ length: 20 }, (_, i) => <line key={i} x1={x - 200 * s + i * 20 * s} y1={y - 70 * s} x2={x - 200 * s + i * 20 * s} y2={y} stroke="#6b4422" strokeWidth={2 * s} />)}
    <rect x={x - 50 * s} y={y - 130 * s} width={100 * s} height={130 * s} fill="#8a5a32" stroke={INK} strokeWidth={1.5 * s} />
    <rect x={x - 30 * s} y={y - 80 * s} width={60 * s} height={80 * s} fill="#3a2414" />
    <path d={`M${x - 80 * s} ${y - 130 * s} L${x} ${y - 190 * s} L${x + 80 * s} ${y - 130 * s} Z`} fill="#5a3a22" stroke={INK} strokeWidth={1.5 * s} />
    <path d={`M${x - 55 * s} ${y - 165 * s} L${x} ${y - 215 * s} L${x + 55 * s} ${y - 165 * s} Z`} fill="#5a3a22" stroke={INK} strokeWidth={1.5 * s} />
  </g>
);

// Ox cart with rice sacks. moving: wheels turn.
export const RiceCart = ({ x, y, s, flip = false, phase = 0 }: { x: number; y: number; s: number; flip?: boolean; phase?: number }) => {
  const frame = useCurrentFrame();
  const rot = frame * 4 + phase * 30;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <rect x={-50} y={-50} width={100} height={18} fill="#8a5a32" stroke={INK} strokeWidth={1.5} />
      {[-34, -12, 10, 32, -22, 0, 22].map((cx, i) => <ellipse key={i} cx={cx} cy={i < 4 ? -60 : -78} rx={12} ry={10} fill="#e3cf9e" stroke={INK} strokeWidth={1.2} />)}
      {[-30, 30].map((wx) => (
        <g key={wx} transform={`translate(${wx},-18) rotate(${rot})`}>
          <circle r={17} fill="none" stroke="#5a3a22" strokeWidth={4} />
          {[0, 60, 120].map((a) => <line key={a} x1={0} y1={-16} x2={0} y2={16} stroke="#5a3a22" strokeWidth={2.5} transform={`rotate(${a})`} />)}
        </g>
      ))}
      <line x1={50} y1={-40} x2={90} y2={-34} stroke="#6b4a2b" strokeWidth={3} />
      <g transform="translate(118,0)">
        <path d="M-30 -30 Q-32 -56 -6 -56 L18 -56 Q30 -56 30 -36 L28 -30 Z" fill="#cbb79a" stroke={INK} strokeWidth={1.5} />
        {[-24, -12, 14, 24].map((lx) => <rect key={lx} x={lx - 3} y={-32} width={6} height={32} fill="#b8a283" stroke={INK} strokeWidth={1} />)}
        <path d="M24 -54 L42 -58 Q48 -50 40 -44 L28 -44 Z" fill="#cbb79a" stroke={INK} strokeWidth={1.4} />
        <path d="M30 -58 Q24 -70 18 -66 M34 -58 Q40 -70 46 -64" stroke="#e8e0c8" strokeWidth={3} fill="none" />
      </g>
    </g>
  );
};

// Bamboo-and-timber palisade with a gate (a fortified village). Ground at y.
export const Palisade = ({ x0, x1, y, s, gateAt }: { x0: number; x1: number; y: number; s: number; gateAt?: number }) => {
  const n = Math.floor((x1 - x0) / (12 * s));
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const px = x0 + i * 12 * s;
        if (gateAt !== undefined && Math.abs(px - gateAt) < 40 * s) return null;
        const h = (70 + random(`pl${i}`) * 14) * s;
        return <path key={i} d={`M${px} ${y} l0 ${-h} l${5 * s} ${-10 * s} l${5 * s} ${10 * s} l0 ${h} Z`} fill={i % 3 ? "#9a7a45" : "#8a6a3a"} stroke={INK} strokeWidth={1 * s} />;
      })}
      <line x1={x0} y1={y - 40 * s} x2={x1} y2={y - 40 * s} stroke="#5a3a22" strokeWidth={4 * s} />
      {gateAt !== undefined && <path d={`M${gateAt - 40 * s} ${y - 96 * s} L${gateAt + 40 * s} ${y - 96 * s}`} stroke="#5a3a22" strokeWidth={8 * s} />}
    </g>
  );
};

// Thatched village house on stilts.
export const StiltHouse = ({ x, y, s, flip = false }: { x: number; y: number; s: number; flip?: boolean }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
    {[-36, -10, 16, 36].map((px) => <rect key={px} x={px - 3} y={-40} width={6} height={40} fill="#6b4a2b" />)}
    <rect x={-44} y={-82} width={88} height={42} fill="#b08a5a" stroke={INK} strokeWidth={1.4} />
    <path d="M-58 -78 L0 -130 L58 -78 Z" fill="#c9a36a" stroke={INK} strokeWidth={1.4} />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-50 + i * 18} y1={-80} x2={-40 + i * 14} y2={-110} stroke="#8f6e3f" strokeWidth={1.2} />)}
    <rect x={-12} y={-74} width={24} height={34} fill="#5a3a22" />
  </g>
);

// Giant pincer (for "ลองนึกภาพคีมยักษ์"), centred at (x, y); open 1 = wide, 0 = closed.
export const Pincer = ({ x, y, s, open = 1, color = "#ff3b30" }: { x: number; y: number; s: number; open?: number; color?: string }) => {
  const a = 18 * open;
  const arm = (dir: 1 | -1) => (
    <g transform={`rotate(${dir * a},${x},${y + 120 * s})`}>
      <path d={`M${x} ${y + 120 * s} Q${x + dir * 60 * s} ${y} ${x + dir * 20 * s} ${y - 150 * s} Q${x + dir * 6 * s} ${y - 170 * s} ${x - dir * 4 * s} ${y - 150 * s} Q${x + dir * 30 * s} ${y - 10 * s} ${x - dir * 10 * s} ${y + 120 * s} Z`} fill={color} stroke="#fff" strokeWidth={4 * s} />
    </g>
  );
  return (
    <g style={{ filter: `drop-shadow(0 0 ${14 * s}px ${color})` }}>
      {arm(1)}
      {arm(-1)}
      <circle cx={x} cy={y + 120 * s} r={14 * s} fill="#fff" />
    </g>
  );
};
