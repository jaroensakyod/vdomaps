import { interpolate, random, useCurrentFrame } from "remotion";
import { useMap } from "../../../components/Map";
import { FRENCH, Soldier, type Uniform } from "./Period";
import { clamp, font } from "./news";

// Props and figures for ch5 (Smolensk → Borodino) and ch6 (Moscow), drawn like kit/Period.tsx:
// side view, feet at y = 0, ~120 units tall at scale 1, two-tone fills + 1.5 px dark outline, small idle motion.
const INK = "#1b1d24";

type Fig = { x: number; y: number; scale?: number; phase?: number; flip?: boolean };

const hex = (c: string) => (c.startsWith("rgb") ? (c.match(/\d+/g) ?? ["0", "0", "0"]).slice(0, 3).map(Number) : [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)));
// Mix two colours, #rrggbb or rgb(r,g,b) (t = 0 → a, 1 → b).
export const mix = (a: string, b: string, t: number) => {
  const [x, y] = [hex(a), hex(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * Math.max(0, Math.min(1, t)))).join(",")})`;
};

// Mikhail Kutuzov: old, heavy-set general in a dark green coat, white forage cap, gold epaulettes, sash and star;
// white hair, and a scar over the closed right eye. Faces right.
export const Kutuzov = ({ x, y, scale = 1, flip = false, phase = 0 }: Fig) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.05 + phase) * 0.7;
  const skin = "#ecc2a0";
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={1} rx={18} ry={3.5} fill="#000" opacity={0.3} />
      {/* legs: white breeches, tall boots */}
      <path d="M-9 -40 L-8 0 L1 0 L2 -40 Z" fill="#ecebe4" stroke={INK} strokeWidth={1.4} />
      <path d="M-10 -22 L-9 2 L8 2 L7 -2 L2 -2 L2 -22 Z" fill="#1c1c22" stroke={INK} strokeWidth={1.2} />
      <path d="M2 -40 L4 0 L12 0 L11 -40 Z" fill="#dcdbd2" stroke={INK} strokeWidth={1.4} />
      <path d="M2 -22 L3 2 L17 2 L16 -2 L11 -2 L11 -22 Z" fill="#1c1c22" stroke={INK} strokeWidth={1.2} />
      {/* walking stick */}
      <line x1={22} y1={-56} x2={26} y2={0} stroke="#5a3a22" strokeWidth={2.6} strokeLinecap="round" />
      {/* long green coat, heavy at the front */}
      <path d="M-18 -92 Q-24 -62 -20 -30 L18 -30 Q28 -58 15 -92 Q0 -99 -18 -92 Z" fill="#2f5a3a" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M6 -95 Q22 -66 18 -30 Q28 -58 15 -92 Z" fill="#000" opacity={0.18} />
      <path d="M-15 -90 L14 -48" stroke="#7fb2e0" strokeWidth={5} opacity={0.95} />
      <path d="M3 -94 L3 -32" stroke="#d9b45a" strokeWidth={1.2} strokeDasharray="2 4" />
      <path d="M10 -76 l2 4 l4 0 l-3 3 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -3 l4 0 Z" fill="#f1d36b" stroke={INK} strokeWidth={0.6} />
      {/* epaulette */}
      <ellipse cx={-4} cy={-92} rx={12} ry={4.5} fill="#e2b84a" stroke={INK} strokeWidth={1.1} />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-13 + i * 3.6} y1={-89} x2={-13 + i * 3.6} y2={-84} stroke="#e2b84a" strokeWidth={1.4} />)}
      {/* arm resting on the stick */}
      <path d="M2 -88 Q14 -76 20 -58" stroke="#2a4f33" strokeWidth={8.5} strokeLinecap="round" fill="none" />
      <circle cx={21} cy={-57} r={4} fill={skin} stroke={INK} strokeWidth={1.1} />
      {/* red collar */}
      <rect x={-6} y={-101} width={13} height={8} rx={2} fill="#b8322a" stroke={INK} strokeWidth={1.1} />
      <g transform="translate(2,-113)">
        <ellipse cx={0} cy={0} rx={12} ry={12.5} fill={skin} stroke={INK} strokeWidth={1.5} />
        {/* jowl, white side hair */}
        <path d="M4 6 Q2 13 -4 12" fill={skin} stroke={INK} strokeWidth={1} />
        <path d="M-12 -2 Q-15 6 -9 10 Q-7 4 -8 -2 Z" fill="#f2f2ee" stroke={INK} strokeWidth={1} />
        {/* the right eye: closed, with a scar across it */}
        <path d="M3 -1 Q6 1 9 -1" stroke={INK} strokeWidth={1.4} fill="none" />
        <path d="M2 -7 L10 4" stroke="#b5564a" strokeWidth={2} strokeLinecap="round" />
        <path d="M2 -5 Q6 -7 10 -5" stroke="#f2f2ee" strokeWidth={1.6} fill="none" />
        <path d="M5 7 Q8 7 10 5" stroke={INK} strokeWidth={1.1} fill="none" />
        <path d="M10 1 Q14 3 11 5" fill={skin} stroke={INK} strokeWidth={1} />
        {/* white forage cap with a red band and a peak */}
        <path d="M-12 -6 L-11 -17 Q0 -22 12 -17 L12 -6 Z" fill="#f0efe8" stroke={INK} strokeWidth={1.3} />
        <rect x={-12} y={-9} width={24} height={4} fill="#b8322a" />
        <path d="M6 -6 L20 -3 L12 -8 Z" fill={INK} />
      </g>
    </g>
  );
};

// Imperial Guard grenadier: a line infantryman in a tall bearskin, standing at ease.
export const Grenadier = ({ x, y, scale = 1, phase = 0, flip = false }: Fig) => {
  const u: Uniform = { ...FRENCH, plume: undefined, facing: "#ecebe4" };
  return (
    <g>
      <Soldier x={x} y={y} scale={scale} phase={phase} u={u} pose="stand" flip={flip} />
      <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
        <g transform="rotate(3,0,-42)">
          <path d="M-12 -110 Q-15 -136 -4 -147 Q9 -151 13 -137 Q15 -122 12 -110 Z" fill="#1a1a1e" stroke={INK} strokeWidth={1.4} />
          <path d="M-12 -126 Q-16 -132 -11 -137 L-8 -128 Z" fill="#c8312b" />
          <ellipse cx={11} cy={-128} rx={2.5} ry={6} fill="#c8312b" stroke={INK} strokeWidth={0.8} />
        </g>
      </g>
    </g>
  );
};

// Field gun, side view, muzzle to the right. `fire` = 0 → 1 over one shot (flash, recoil, smoke).
export const Cannon = ({ x, y, scale = 1, flip = false, phase = 0, every = 70 }: Fig & { every?: number }) => {
  const frame = useCurrentFrame();
  const t = ((frame + phase * 13) % every) / every;
  const flash = t < 0.12 ? 1 - t / 0.12 : 0;
  const recoil = t < 0.2 ? Math.sin((t / 0.2) * Math.PI) * 5 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={-6} cy={1} rx={44} ry={4} fill="#000" opacity={0.3} />
      <g transform={`translate(${-recoil},0)`}>
        <path d="M-50 -2 L-6 -28 L4 -24 L-44 2 Z" fill="#6a4a2a" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
        <path d="M-12 -34 L48 -40 Q52 -40 52 -36 L52 -32 Q52 -29 48 -29 L-12 -24 Q-18 -29 -12 -34 Z" fill="#7b6a3a" stroke={INK} strokeWidth={1.5} />
        <path d="M-12 -33 L48 -39 L48 -36 L-12 -30 Z" fill="#b29a5a" opacity={0.7} />
        <circle cx={0} cy={-17} r={17} fill="none" stroke="#4a3220" strokeWidth={4} />
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI + frame * 0;
          return <line key={i} x1={-Math.cos(a) * 16} y1={-17 - Math.sin(a) * 16} x2={Math.cos(a) * 16} y2={-17 + Math.sin(a) * 16} stroke="#4a3220" strokeWidth={2} />;
        })}
        <circle cx={0} cy={-17} r={4} fill="#2a2a2a" stroke={INK} strokeWidth={1} />
      </g>
      {flash > 0 && (
        <g transform="translate(56,-35)" opacity={flash}>
          <path d="M0 0 L26 -10 L18 0 L30 8 L12 6 L6 18 Z" fill="#ffd64a" />
          <circle cx={6} cy={0} r={10} fill="#fff6c2" />
        </g>
      )}
      {Array.from({ length: 5 }, (_, i) => {
        const a = Math.min(1, t * 1.4 + i * 0.05);
        return <circle key={i} cx={60 + a * (50 + i * 12)} cy={-36 - a * (24 + i * 6)} r={6 + a * (18 + i * 3)} fill={i % 2 ? "#cfcac2" : "#e8e4dc"} opacity={(1 - a) * 0.75} />;
      })}
    </g>
  );
};

// Russian earthwork: a long earth rampart with gabions on top and gun embrasures; x0 → x1 at ground y.
export const Earthwork = ({ x0, x1, y, s, h = 46 }: { x0: number; x1: number; y: number; s: number; h?: number }) => {
  const H = h * s;
  const n = Math.max(2, Math.floor((x1 - x0) / (26 * s)));
  return (
    <g>
      <path d={`M${x0} ${y} L${x0 + 30 * s} ${y - H} L${x1 - 30 * s} ${y - H} L${x1} ${y} Z`} fill="#7a5d3a" stroke={INK} strokeWidth={1.5 * s} strokeLinejoin="round" />
      <path d={`M${x0 + 30 * s} ${y - H} L${x1 - 30 * s} ${y - H} L${x1 - 40 * s} ${y - H * 0.6} L${x0 + 40 * s} ${y - H * 0.6} Z`} fill="#8e7048" />
      {Array.from({ length: n }, (_, i) => {
        const gx = x0 + 34 * s + i * ((x1 - x0 - 68 * s) / (n - 1));
        if (i % 4 === 2) return null; // embrasure
        return <rect key={i} x={gx - 9 * s} y={y - H - 18 * s} width={18 * s} height={18 * s} rx={3 * s} fill="#9b8458" stroke={INK} strokeWidth={1.1 * s} />;
      })}
      {Array.from({ length: n }, (_, i) => {
        const gx = x0 + 34 * s + i * ((x1 - x0 - 68 * s) / (n - 1));
        return <line key={`w${i}`} x1={gx - 8 * s} y1={y - H - 9 * s} x2={gx + 8 * s} y2={y - H - 9 * s} stroke="#5d4a2c" strokeWidth={1.2 * s} opacity={i % 4 === 2 ? 0 : 1} />;
      })}
    </g>
  );
};

// Onion dome on a drum with a cross; (x, y) = base of the drum.
const Dome = ({ x, y, r, gold, wall, drum = 1.4 }: { x: number; y: number; r: number; gold: string; wall: string; drum?: number }) => {
  const top = y - r * drum;
  return (
    <g>
      <rect x={x - r * 0.62} y={top} width={r * 1.24} height={r * drum} fill={wall} stroke={INK} strokeWidth={r * 0.06} />
      <path d={`M${x - r} ${top} Q${x - r * 1.25} ${top - r * 1.1} ${x} ${top - r * 2.1} Q${x + r * 1.25} ${top - r * 1.1} ${x + r} ${top} Z`} fill={gold} stroke={INK} strokeWidth={r * 0.06} />
      <path d={`M${x + r * 0.2} ${top - r * 0.2} Q${x + r * 0.7} ${top - r * 1} ${x + r * 0.1} ${top - r * 1.8}`} stroke="#fff" strokeWidth={r * 0.12} opacity={0.3} fill="none" />
      <line x1={x} y1={top - r * 2.1} x2={x} y2={top - r * 2.8} stroke={gold} strokeWidth={r * 0.1} />
      <line x1={x - r * 0.25} y1={top - r * 2.55} x2={x + r * 0.25} y2={top - r * 2.55} stroke={gold} strokeWidth={r * 0.1} />
    </g>
  );
};

// Moscow skyline: churches with onion domes and the Ivan the Great bell tower behind the red Kremlin wall.
// `night` darkens it; `burn` 0 → 1 chars the buildings; `wall` = false hides the Kremlin wall.
export const MoscowSkyline = ({ x, y, W, s, night = 0, burn = 0, wall = true, domes = 1, bell = true }: { x: number; y: number; W: number; s: number; night?: number; burn?: number; wall?: boolean; domes?: number; bell?: boolean }) => {
  const dk = (c: string) => mix(mix(c, "#2a2522", burn * 0.7), "#141a2c", night * 0.55);
  const gold = dk("#e2b84a");
  const walls = dk("#efe6d2");
  const brick = dk("#b5473a");
  const churches: [number, number, number, string][] = [
    [0.12, 70, 16, "#3f8f6a"], [0.24, 95, 20, "#e2b84a"], [0.36, 60, 14, "#c8312b"], [0.62, 85, 18, "#e2b84a"], [0.74, 66, 15, "#3d6fb0"], [0.88, 78, 17, "#e2b84a"],
  ];
  return (
    <g>
      {/* low town roofs */}
      {Array.from({ length: 12 }, (_, i) => {
        const hx = x + (i / 11) * W - 30 * s;
        const hh = (26 + random(`mh${i}`) * 26) * s;
        return <path key={i} d={`M${hx} ${y} L${hx} ${y - hh} L${hx + 34 * s} ${y - hh - 16 * s} L${hx + 68 * s} ${y - hh} L${hx + 68 * s} ${y} Z`} fill={dk(i % 2 ? "#9c8a70" : "#b39d7c")} stroke={INK} strokeWidth={1.1 * s} />;
      })}
      {churches.map(([k, h, r, c], i) => (
        <g key={i}>
          <rect x={x + W * k - r * 1.3 * s} y={y - h * s} width={r * 2.6 * s} height={h * s} fill={walls} stroke={INK} strokeWidth={1.2 * s} />
          <Dome x={x + W * k} y={y - h * s} r={r * s * domes} gold={dk(c)} wall={walls} />
          {r > 15 && <Dome x={x + W * k - r * 1.0 * s} y={y - h * s + 2 * s} r={r * 0.5 * s * domes} gold={dk(c)} wall={walls} />}
          {r > 15 && <Dome x={x + W * k + r * 1.0 * s} y={y - h * s + 2 * s} r={r * 0.5 * s * domes} gold={dk(c)} wall={walls} />}
        </g>
      ))}
      {/* Ivan the Great bell tower */}
      {bell && <g>
        <rect x={x + W * 0.5 - 18 * s} y={y - 150 * s} width={36 * s} height={150 * s} fill={walls} stroke={INK} strokeWidth={1.3 * s} />
        <rect x={x + W * 0.5 - 14 * s} y={y - 190 * s} width={28 * s} height={40 * s} fill={walls} stroke={INK} strokeWidth={1.3 * s} />
        {[-130, -100, -172].map((dy, i) => <rect key={i} x={x + W * 0.5 - 6 * s} y={y + dy * s} width={12 * s} height={16 * s} rx={6 * s} fill={dk("#4a4038")} />)}
        <Dome x={x + W * 0.5} y={y - 190 * s} r={14 * s * domes} gold={gold} wall={walls} drum={1} />
      </g>}
      {wall && (
        <g>
          <rect x={x - 10 * s} y={y - 46 * s} width={W + 20 * s} height={46 * s} fill={brick} stroke={INK} strokeWidth={1.4 * s} />
          {Array.from({ length: Math.ceil(W / (22 * s)) + 1 }, (_, i) => (
            <path key={i} d={`M${x + i * 22 * s - 8 * s} ${y - 46 * s} l0 ${-12 * s} l${5 * s} ${5 * s} l${5 * s} ${-5 * s} l0 ${12 * s} Z`} fill={brick} stroke={INK} strokeWidth={0.9 * s} />
          ))}
          {[0.06, 0.44, 0.94].map((k, i) => (
            <g key={`t${i}`}>
              <rect x={x + W * k - 20 * s} y={y - 92 * s} width={40 * s} height={92 * s} fill={brick} stroke={INK} strokeWidth={1.4 * s} />
              <path d={`M${x + W * k - 24 * s} ${y - 92 * s} L${x + W * k} ${y - 140 * s} L${x + W * k + 24 * s} ${y - 92 * s} Z`} fill={dk("#3f7a4a")} stroke={INK} strokeWidth={1.3 * s} />
              <rect x={x + W * k - 5 * s} y={y - 72 * s} width={10 * s} height={16 * s} rx={5 * s} fill={dk("#3a2420")} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

// Wooden Moscow house with closed shutters; (x, y) = bottom-left.
export const House = ({ x, y, s, w = 120, h = 80, color = "#9a6b45", flip = false }: { x: number; y: number; s: number; w?: number; h?: number; color?: string; flip?: boolean }) => {
  const W = w * s;
  const H = h * s;
  return (
    <g>
      <rect x={x} y={y - H} width={W} height={H} fill={color} stroke={INK} strokeWidth={1.4 * s} />
      {Array.from({ length: Math.floor(h / 10) }, (_, i) => <line key={i} x1={x} y1={y - H + (i + 1) * 10 * s} x2={x + W} y2={y - H + (i + 1) * 10 * s} stroke="#000" strokeOpacity={0.18} strokeWidth={1.2 * s} />)}
      <path d={`M${x - 8 * s} ${y - H} L${x + W / 2} ${y - H - 46 * s} L${x + W + 8 * s} ${y - H} Z`} fill="#5d6b70" stroke={INK} strokeWidth={1.4 * s} />
      {[0.22, 0.62].map((k, i) => (
        <g key={i}>
          <rect x={x + W * k} y={y - H * 0.72} width={W * 0.18} height={H * 0.36} fill="#3f6a8a" stroke={INK} strokeWidth={1.1 * s} />
          <rect x={x + W * k - 1 * s} y={y - H * 0.72} width={W * 0.09 + 1 * s} height={H * 0.36} fill="#6a3f2a" stroke={INK} strokeWidth={1 * s} />
          <rect x={x + W * (k + 0.09)} y={y - H * 0.72} width={W * 0.09 + 1 * s} height={H * 0.36} fill="#6a3f2a" stroke={INK} strokeWidth={1 * s} />
        </g>
      ))}
      <rect x={x + W * (flip ? 0.05 : 0.83)} y={y - H * 0.5} width={W * 0.12} height={H * 0.5} fill="#4a2e1e" stroke={INK} strokeWidth={1 * s} />
    </g>
  );
};

// Signpost with two boards pointing left and right.
export const Signpost = ({ x, y, s, left, right, k = 1 }: { x: number; y: number; s: number; left: string; right: string; k?: number }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.08) * 1.2;
  const board = (text: string, dir: 1 | -1, dy: number, hi: number) => {
    const w = (text.length * 15 + 50) * s;
    const bx = dir > 0 ? x + 6 * s : x - 6 * s - w;
    const tip = dir > 0 ? `L${bx + w + 22 * s} ${y + dy + 20 * s}` : `L${bx - 22 * s} ${y + dy + 20 * s}`;
    const d = dir > 0 ? `M${bx} ${y + dy} L${bx + w} ${y + dy} ${tip} L${bx + w} ${y + dy + 40 * s} L${bx} ${y + dy + 40 * s} Z` : `M${bx + w} ${y + dy} L${bx} ${y + dy} ${tip} L${bx} ${y + dy + 40 * s} L${bx + w} ${y + dy + 40 * s} Z`;
    return (
      <g opacity={0.45 + 0.55 * hi}>
        <path d={d} fill={hi > 0.5 ? "#e8c27a" : "#c9a66b"} stroke={INK} strokeWidth={1.5 * s} />
        <text x={bx + w / 2} y={y + dy + 29 * s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={24 * s} fill="#2a1d10">{text}</text>
      </g>
    );
  };
  return (
    <g transform={`rotate(${sway},${x},${y + 200 * s})`}>
      <rect x={x - 6 * s} y={y - 20 * s} width={12 * s} height={220 * s} fill="#6a4a2a" stroke={INK} strokeWidth={1.4 * s} />
      {board(left, -1, 0, 1 - k)}
      {board(right, 1, 52 * s, k)}
    </g>
  );
};

// Overloaded loot cart: chests, a gilt picture frame, candlesticks, a rolled carpet, sacks. Wheels turn with `roll`.
export const LootCart = ({ x, y, scale = 1, roll = 0, flip = false }: Fig & { roll?: number }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
    <ellipse cx={0} cy={1} rx={70} ry={5} fill="#000" opacity={0.3} />
    <line x1={60} y1={-30} x2={110} y2={-22} stroke="#5a3a22" strokeWidth={4} strokeLinecap="round" />
    {/* the pile */}
    <rect x={-58} y={-78} width={40} height={30} rx={3} fill="#7a4a24" stroke={INK} strokeWidth={1.4} />
    <rect x={-58} y={-68} width={40} height={4} fill="#e2b84a" />
    <path d="M-14 -50 L-6 -112 L44 -104 L36 -46 Z" fill="#d9b45a" stroke={INK} strokeWidth={1.5} />
    <path d="M-7 -55 L-1 -102 L37 -96 L31 -52 Z" fill="#5a7a8a" stroke={INK} strokeWidth={1} />
    <path d="M2 -70 Q14 -88 30 -78 L28 -60 L0 -62 Z" fill="#7a9a6a" opacity={0.8} />
    <rect x={-40} y={-102} width={60} height={14} rx={7} fill="#a8322a" stroke={INK} strokeWidth={1.3} transform="rotate(-14,-10,-95)" />
    <ellipse cx={46} cy={-64} rx={14} ry={18} fill="#c9b48a" stroke={INK} strokeWidth={1.3} />
    <rect x={26} y={-84} width={6} height={36} fill="#f1d36b" stroke={INK} strokeWidth={1} />
    <rect x={20} y={-86} width={18} height={4} fill="#f1d36b" stroke={INK} strokeWidth={1} />
    <path d="M-70 -52 L-62 -78 M-70 -52 L-74 -76" stroke="#f1d36b" strokeWidth={3} />
    {/* cart bed + wheels */}
    <rect x={-70} y={-50} width={134} height={16} rx={2} fill="#8a6a46" stroke={INK} strokeWidth={1.5} />
    {[-40, 36].map((wx) => (
      <g key={wx} transform={`translate(${wx},-18) rotate(${roll})`}>
        <circle r={17} fill="none" stroke="#4a3220" strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={-16 * Math.cos((i * Math.PI) / 4)} y1={-16 * Math.sin((i * Math.PI) / 4)} x2={16 * Math.cos((i * Math.PI) / 4)} y2={16 * Math.sin((i * Math.PI) / 4)} stroke="#4a3220" strokeWidth={2} />)}
        <circle r={4} fill="#2a2a2a" />
      </g>
    ))}
  </g>
);

// Sealed letter (envelope + red wax seal), flat, centred at (x, y).
export const Letter = ({ x, y, scale = 1, rot = 0, open = 0 }: { x: number; y: number; scale?: number; rot?: number; open?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${scale})`}>
    <rect x={-52} y={-34} width={104} height={68} rx={3} fill="#f1e7cf" stroke={INK} strokeWidth={1.5} />
    <path d={`M-52 -34 L0 ${6 - open * 40} L52 -34`} fill="#e3d6b6" stroke={INK} strokeWidth={1.3} />
    {open <= 0 && <circle cx={0} cy={4} r={11} fill="#b8322a" stroke={INK} strokeWidth={1.2} />}
    {open <= 0 && <path d="M-5 4 L0 -3 L5 4 L0 9 Z" fill="#8a2018" />}
  </g>
);

// Writing desk with an inkwell and a quill; (x, y) = floor under its middle.
export const Desk = ({ x, y, s, w = 260 }: { x: number; y: number; s: number; w?: number }) => {
  const frame = useCurrentFrame();
  const top = y - 70 * s;
  return (
    <g>
      <rect x={x - (w / 2) * s} y={top} width={w * s} height={12 * s} fill="#6a4226" stroke={INK} strokeWidth={1.4 * s} />
      {[-1, 1].map((d) => <rect key={d} x={x + d * (w / 2 - 14) * s - 5 * s} y={top + 12 * s} width={10 * s} height={58 * s} fill="#5a3820" stroke={INK} strokeWidth={1.2 * s} />)}
      <rect x={x + 60 * s} y={top - 16 * s} width={20 * s} height={16 * s} rx={4 * s} fill="#2a2a32" stroke={INK} strokeWidth={1.2 * s} />
      <path d={`M${x + 70 * s} ${top - 14 * s} Q${x + 96 * s + Math.sin(frame * 0.2) * 3 * s} ${top - 60 * s} ${x + 116 * s} ${top - 74 * s} Q${x + 92 * s} ${top - 46 * s} ${x + 72 * s} ${top - 14 * s} Z`} fill="#f2f2ee" stroke={INK} strokeWidth={1 * s} />
      <rect x={x - 90 * s} y={top - 4 * s} width={70 * s} height={5 * s} fill="#f1e7cf" stroke={INK} strokeWidth={0.8 * s} />
      <rect x={x - 70 * s} y={top - 30 * s} width={8 * s} height={26 * s} fill="#f2ead8" stroke={INK} strokeWidth={0.8 * s} />
      <ellipse cx={x - 66 * s} cy={top - 36 * s + Math.sin(frame * 0.5) * 0.8 * s} rx={3.5 * s} ry={7 * s} fill="#ffd64a" />
    </g>
  );
};

// Explosion flash: k 0 → 1 runs the blast (white flash, fireball, flying debris, then smoke).
export const Explosion = ({ x, y, size, k }: { x: number; y: number; size: number; k: number }) => {
  if (k <= 0 || k >= 1) return null;
  const flash = interpolate(k, [0, 0.08, 0.35], [0, 1, 0], clamp);
  const ball = interpolate(k, [0, 0.25, 1], [0.2, 1, 1.3], clamp);
  const fade = interpolate(k, [0.4, 1], [1, 0], clamp);
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={size * 2.2 * ball} fill="#fff6c2" opacity={flash * 0.8} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + random(`xa${i}`) * 0.3;
        const r0 = size * 0.5 * ball;
        const r1 = size * (1.2 + random(`xr${i}`) * 0.8) * ball;
        return <path key={i} d={`M${Math.cos(a - 0.12) * r0} ${Math.sin(a - 0.12) * r0} L${Math.cos(a) * r1} ${Math.sin(a) * r1} L${Math.cos(a + 0.12) * r0} ${Math.sin(a + 0.12) * r0} Z`} fill="#ffb02e" opacity={fade} />;
      })}
      <circle r={size * 0.8 * ball} fill="#ff7a1a" opacity={fade} />
      <circle r={size * 0.5 * ball} fill="#ffd64a" opacity={fade} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = -Math.PI * (0.1 + 0.8 * random(`da${i}`));
        const d = size * 2.4 * k;
        return <rect key={`d${i}`} x={Math.cos(a) * d} y={Math.sin(a) * d + k * k * size} width={size * 0.14} height={size * 0.1} fill="#7a3a2a" opacity={fade} transform={`rotate(${k * 400 + i * 40},${Math.cos(a) * d},${Math.sin(a) * d})`} />;
      })}
      {Array.from({ length: 6 }, (_, i) => <circle key={`s${i}`} cx={(random(`sx${i}`) - 0.5) * size * 2} cy={-size * k * (1 + random(`sy${i}`))} r={size * (0.4 + k * 0.6)} fill="#4a4440" opacity={interpolate(k, [0.2, 0.5, 1], [0, 0.6, 0], clamp)} />)}
    </g>
  );
};

// Small army tent (an outpost).
export const Tent = ({ x, y, s, color = "#e9e4d6" }: { x: number; y: number; s: number; color?: string }) => (
  <g>
    <path d={`M${x - 46 * s} ${y} L${x} ${y - 60 * s} L${x + 46 * s} ${y} Z`} fill={color} stroke={INK} strokeWidth={1.4 * s} />
    <path d={`M${x} ${y - 60 * s} L${x + 12 * s} ${y} L${x - 8 * s} ${y} Z`} fill="#3a3530" />
    <line x1={x} y1={y - 60 * s} x2={x} y2={y - 74 * s} stroke={INK} strokeWidth={2 * s} />
  </g>
);

// Tattered French tricolour on a pole, waving.
export const Tricolour = ({ x, y, s, h = 170, tatter = 1 }: { x: number; y: number; s: number; h?: number; tatter?: number }) => {
  const frame = useCurrentFrame();
  const w = (dx: number) => Math.sin(frame * 0.12 + dx * 0.05) * 6 * s;
  const top = y - h * s;
  const cols = ["#2c4a8c", "#f1efe6", "#c8312b"];
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={top - 10 * s} stroke="#5a3a22" strokeWidth={5 * s} strokeLinecap="round" />
      <circle cx={x} cy={top - 12 * s} r={5 * s} fill="#d9b45a" />
      {cols.map((c, i) => {
        const x0 = x + i * 30 * s;
        const x1 = x0 + 30 * s;
        const rag = i === 2 ? tatter : 0;
        return (
          <path key={i} d={`M${x0} ${top + w(i * 30)} L${x1} ${top + w(i * 30 + 30)} ${rag ? `L${x1 - 8 * s} ${top + 22 * s + w(80)} L${x1} ${top + 40 * s + w(84)} L${x1 - 6 * s} ${top + 60 * s + w(88)}` : `L${x1} ${top + 70 * s + w(i * 30 + 30)}`} L${x0} ${top + 70 * s + w(i * 30)} Z`} fill={c} stroke={INK} strokeWidth={1.2 * s} />
        );
      })}
      {tatter > 0 && <circle cx={x + 40 * s} cy={top + 30 * s + w(40)} r={5 * s} fill="#7a8a9a" />}
    </g>
  );
};

// Falling autumn leaves over a panel.
export const Leaves = ({ x, y, W, H, s, n = 18, k = 1 }: { x: number; y: number; W: number; H: number; s: number; n?: number; k?: number }) => {
  const frame = useCurrentFrame();
  if (k <= 0) return null;
  return (
    <g opacity={k}>
      {Array.from({ length: n }, (_, i) => {
        const sp = 0.6 + random(`lf${i}`) * 0.8;
        const ly = y + ((random(`ly${i}`) * H + frame * sp * 1.6) % H);
        const lx = x + ((random(`lx${i}`) * W + Math.sin(frame * 0.06 + i) * 20 * s + frame * 0.8) % W);
        return <ellipse key={i} cx={lx} cy={ly} rx={6 * s} ry={3 * s} fill={["#c8692a", "#d9a03a", "#9a3a22"][i % 3]} transform={`rotate(${frame * 3 + i * 40},${lx},${ly})`} />;
      })}
    </g>
  );
};

// ---- Map pieces (inside <MapFrame>) ----

// Army block on the map: a screen-constant rectangle at [lon, lat] with an optional label.
export const Block = ({ at, k, color, w = 70, h = 26, rot = 0, text, dy = 0, size = 0.9 }: { at: [number, number]; k: number; color: string; w?: number; h?: number; rot?: number; text?: string; dy?: number; size?: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const p = projection(at);
  if (!p) return null;
  const sc = Math.min(1, k);
  return (
    <g transform={`translate(${p[0]},${p[1]})`} opacity={Math.min(1, k * 1.5)}>
      <g transform={`rotate(${rot}) scale(${sc})`}>
        <rect x={(-w / 2) * s} y={(-h / 2) * s} width={w * s} height={h * s} rx={4 * s} fill={color} stroke="#fff" strokeWidth={3 * s} />
        <line x1={(-w / 2) * s} y1={(-h / 2) * s} x2={(w / 2) * s} y2={(h / 2) * s} stroke="#fff" strokeWidth={2 * s} opacity={0.6} />
        <line x1={(-w / 2) * s} y1={(h / 2) * s} x2={(w / 2) * s} y2={(-h / 2) * s} stroke="#fff" strokeWidth={2 * s} opacity={0.6} />
      </g>
      {text && (
        <text y={(dy || -h / 2 - 14) * s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={34 * s * size} fill="#fff" stroke="#0b1020" strokeWidth={8 * s} paintOrder="stroke" strokeLinejoin="round">{text}</text>
      )}
    </g>
  );
};

// A rounded label chip on the map at [lon, lat] (screen offset dx, dy).
export const MapChip = ({ at, text, k, color = "#ff3b30", dx = 0, dy = 0, size = 1, textColor = "#fff" }: { at: [number, number]; text: string; k: number; color?: string; dx?: number; dy?: number; size?: number; textColor?: string }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const p = projection(at);
  if (!p) return null;
  const fs = 34 * size * s;
  const w = text.length * fs * 0.56 + 36 * s;
  const h = fs * 1.55;
  return (
    <g transform={`translate(${p[0] + dx * s},${p[1] + dy * s}) scale(${Math.min(1, k)})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={color} stroke="#fff" strokeWidth={2.5 * s} />
      <text y={fs * 0.36} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={fs} fill={textColor}>{text}</text>
    </g>
  );
};

// Earthwork symbols for the battle map: "fleche" = arrow-shaped (V pointing west), "redoubt" = closed square.
export const Fort = ({ at, k, kind, rot = 0 }: { at: [number, number]; k: number; kind: "fleche" | "redoubt"; rot?: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const p = projection(at);
  if (!p) return null;
  const d = kind === "fleche" ? `M${16 * s} ${-20 * s} L${-14 * s} 0 L${16 * s} ${20 * s}` : `M${-20 * s} ${-20 * s} L${20 * s} ${-20 * s} L${20 * s} ${20 * s} L${-20 * s} ${20 * s} Z`;
  return (
    <g transform={`translate(${p[0]},${p[1]}) rotate(${rot}) scale(${Math.min(1, k)})`} opacity={Math.min(1, k * 1.5)}>
      <path d={d} fill="none" stroke="#0b1020" strokeWidth={14 * s} strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill={kind === "redoubt" ? "rgba(122,93,58,0.6)" : "none"} stroke="#e8c27a" strokeWidth={7 * s} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
};

// Fire icons (flames + smoke) at map points; needs <FigureDefs /> for the flame gradient.
export const MapGlow = ({ at, k, r = 60, color = "#ff5a1a" }: { at: [number, number]; k: number; r?: number; color?: string }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const p = projection(at);
  if (!p) return null;
  const f = 1 + Math.sin(frame * 0.35) * 0.06;
  return (
    <g opacity={k} style={{ mixBlendMode: "screen" }}>
      <circle cx={p[0]} cy={p[1]} r={r * s * f} fill={color} opacity={0.35} style={{ filter: `blur(${r * 0.4 * s}px)` }} />
      <circle cx={p[0]} cy={p[1]} r={r * 0.45 * s * f} fill="#ffb02e" opacity={0.6} style={{ filter: `blur(${r * 0.2 * s}px)` }} />
    </g>
  );
};
