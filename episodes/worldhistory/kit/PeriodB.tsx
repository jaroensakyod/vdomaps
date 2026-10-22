import type { ReactNode } from "react";
import { random, useCurrentFrame } from "remotion";
import { Fire, Smoke } from "../../../components/Figures";
import { POLISH, type Uniform } from "./Period";

// Campaign props for chapters 3–4 (Grande Armée, crossing the Neman), drawn like kit/Period.tsx:
// side view, feet at y = 0, ~120 units tall at scale 1, two-tone fills + 1.5 px dark outline, small idle motion.
const INK = "#1b1d24";

type Fig = { x: number; y: number; scale?: number; phase?: number; flip?: boolean };

// Horse walking to the right. `children` are drawn on the saddle (origin at the saddle seat, y = -80).
export const Horse = ({ x, y, scale = 1, phase = 0, flip = false, coat = "#7a4a28", mane = "#2a1d14", walk = true, children }: Fig & { coat?: string; mane?: string; walk?: boolean; children?: ReactNode }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.22 + phase;
  const g = walk ? Math.sin(t) : 0;
  const bob = walk ? -Math.abs(Math.sin(t)) * 1.6 : Math.sin(frame * 0.05 + phase) * 0.5;
  const shade = "#000";
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={2} rx={50} ry={4.5} fill="#000" opacity={0.28} />
      {[[-30, 1], [-20, -1], [24, -1], [34, 1]].map(([lx, d], i) => (
        <g key={i} transform={`rotate(${g * 18 * d},${lx},-46)`} opacity={i % 2 ? 1 : 0.82}>
          <path d={`M${lx - 4.5} -50 L${lx + 4.5} -50 L${lx + 3} -5 L${lx - 3} -5 Z`} fill={coat} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          <rect x={lx - 4} y={-6} width={8} height={6} rx={1} fill="#2a1d14" stroke={INK} strokeWidth={1} />
        </g>
      ))}
      <g transform={`translate(0,${bob})`}>
        <path d={`M-42 -66 Q${-58 + g * 2} -56 -54 -34`} stroke={mane} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M-44 -48 Q-50 -80 -14 -80 L24 -80 Q46 -80 44 -50 Q20 -40 -44 -48 Z" fill={coat} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M-40 -52 Q0 -44 42 -54 Q44 -48 40 -47 Q10 -40 -42 -46 Z" fill={shade} opacity={0.18} />
        <path d="M30 -74 L52 -106 Q62 -114 70 -104 L74 -92 Q72 -86 66 -88 L48 -64 Z" fill={coat} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M52 -106 Q44 -96 34 -80" stroke={mane} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M58 -110 L61 -118 L64 -109 Z" fill={coat} stroke={INK} strokeWidth={1.1} />
        <circle cx={63} cy={-100} r={2} fill={INK} />
        <path d="M70 -94 L74 -92" stroke={INK} strokeWidth={1.2} />
        {/* saddle cloth + saddle */}
        <path d="M-20 -82 L14 -82 L12 -66 L-18 -66 Z" fill="#2c4a8c" stroke={INK} strokeWidth={1.2} />
        <path d="M-18 -70 L12 -70" stroke="#e2c14a" strokeWidth={2} />
        <path d="M-12 -86 Q-2 -80 10 -86 L8 -80 L-10 -80 Z" fill="#5a3a22" stroke={INK} strokeWidth={1.2} />
        {children && <g transform="translate(0,-80)">{children}</g>}
      </g>
    </g>
  );
};

// Seated rider (for Horse children). `lance`: long lance with a two-colour pennant, Polish czapka hat.
export const Rider = ({ u = POLISH, lance = false, czapka = false }: { u?: Uniform; lance?: boolean; czapka?: boolean }) => {
  const frame = useCurrentFrame();
  const flap = Math.sin(frame * 0.4) * 3;
  const skin = "#e9b994";
  return (
    <g>
      {/* leg down the horse's side */}
      <path d="M-4 -6 L10 -4 L8 26 L2 26 Z" fill={u.legs} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M1 22 L14 22 Q15 28 12 29 L1 29 Z" fill="#1c1c22" stroke={INK} strokeWidth={1.1} />
      <path d="M-11 -44 Q-12 -24 -10 -4 L10 -4 Q11 -24 10 -44 Q0 -49 -11 -44 Z" fill={u.coat} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M4 -46 Q10 -26 10 -4 L10 -4 Q11 -24 10 -44 Z" fill="#000" opacity={0.2} />
      <path d="M-1 -45 L5 -45 L5 -10 L-1 -10 Z" fill={u.facing} stroke={INK} strokeWidth={1} />
      <rect x={-3} y={-52} width={7} height={7} fill={skin} />
      <g transform="translate(1,-62)">
        <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.5} />
        <circle cx={5} cy={0} r={1.3} fill={INK} />
        <path d="M2 5 Q6 7 9 4" stroke="#5a3a22" strokeWidth={1.6} fill="none" />
        {czapka ? (
          <g>
            <path d="M-9 -5 L-8 -14 L8 -14 L9 -5 Z" fill={u.coatShade} stroke={INK} strokeWidth={1.3} />
            <path d="M-13 -26 L13 -26 L8 -14 L-8 -14 Z" fill={u.hat} stroke={INK} strokeWidth={1.3} />
            <path d="M3 -5 L15 -3 L9 -7 Z" fill={INK} />
            <ellipse cx={-6} cy={-31} rx={3} ry={6} fill={u.plume ?? "#fff"} stroke={INK} strokeWidth={1} />
          </g>
        ) : (
          <g>
            <path d="M-10 -5 L-9 -22 L10 -22 L10 -5 Z" fill={u.hat} stroke={INK} strokeWidth={1.4} />
            <path d="M3 -5 L16 -3 L10 -7 Z" fill={INK} />
            {u.plume && <ellipse cx={0} cy={-28} rx={3.5} ry={7} fill={u.plume} stroke={INK} strokeWidth={1} />}
          </g>
        )}
      </g>
      {/* arm forward to the reins */}
      <path d="M4 -40 Q14 -30 22 -26" stroke={u.coat} strokeWidth={7.5} strokeLinecap="round" fill="none" />
      <circle cx={23} cy={-26} r={3.6} fill={skin} stroke={INK} strokeWidth={1.1} />
      {lance && (
        <g transform="translate(-6,-30) rotate(-14)">
          <line x1={0} y1={30} x2={0} y2={-150} stroke="#6b4a2b" strokeWidth={3} strokeLinecap="round" />
          <path d="M-2.5 -150 L0 -166 L2.5 -150 Z" fill="#c9ced3" stroke={INK} strokeWidth={0.8} />
          <path d={`M1 -146 L${34 + flap} ${-140 + flap * 0.4} L${22 + flap} -134 L${34 + flap} ${-128 - flap * 0.4} L1 -126 Z`} fill="#ffffff" stroke={INK} strokeWidth={1} />
          <path d={`M1 -136 L${28 + flap} -136 L${34 + flap} ${-128 - flap * 0.4} L1 -126 Z`} fill="#c8312b" />
        </g>
      )}
    </g>
  );
};

const Wheel = ({ x, y, r, rot, color = "#5a3a22" }: { x: number; y: number; r: number; rot: number; color?: string }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <circle r={r} fill="none" stroke={INK} strokeWidth={r * 0.32} />
    <circle r={r} fill="none" stroke={color} strokeWidth={r * 0.22} />
    {[0, 45, 90, 135].map((a) => <line key={a} x1={0} y1={-r} x2={0} y2={r} stroke={color} strokeWidth={r * 0.12} transform={`rotate(${a})`} />)}
    <circle r={r * 0.2} fill="#3a2a1c" stroke={INK} strokeWidth={1} />
  </g>
);

// Field gun on its carriage, barrel to the right. `roll` = wheel turn (degrees).
export const Cannon = ({ x, y, scale = 1, flip = false, roll = 0 }: Fig & { roll?: number }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
    <ellipse cx={0} cy={2} rx={44} ry={4} fill="#000" opacity={0.28} />
    <path d="M-46 -4 L-40 -2 L6 -28 L2 -34 Z" fill="#6a7a4a" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    <path d="M-6 -40 L50 -44 Q54 -40 50 -36 L-6 -30 Q-12 -35 -6 -40 Z" fill="#3c3f44" stroke={INK} strokeWidth={1.5} />
    <path d="M-4 -38 L48 -42" stroke="#8a8f96" strokeWidth={1.6} opacity={0.7} />
    <Wheel x={4} y={-22} r={22} rot={roll} color="#6a7a4a" />
  </g>
);

// Two-horse gun team: driver on the lead horse, limber, gun towed behind (muzzle back). Moves right.
export const GunTeam = ({ x, y, scale = 1, phase = 0, u }: Fig & { u: Uniform }) => {
  const frame = useCurrentFrame();
  const roll = frame * 5;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <Cannon x={-150} y={0} scale={0.9} flip roll={roll} />
      <line x1={-110} y1={-24} x2={-60} y2={-30} stroke={INK} strokeWidth={4} />
      <rect x={-86} y={-56} width={52} height={26} rx={3} fill="#6a7a4a" stroke={INK} strokeWidth={1.4} />
      <Wheel x={-60} y={-18} r={18} rot={roll} color="#6a7a4a" />
      <line x1={-34} y1={-40} x2={10} y2={-62} stroke="#3a2a1c" strokeWidth={3} />
      <Horse x={30} y={0} scale={0.8} phase={phase} coat="#5a3a26" />
      <line x1={64} y1={-62} x2={96} y2={-62} stroke="#3a2a1c" strokeWidth={2.5} />
      <Horse x={120} y={0} scale={0.8} phase={phase + 1.4} coat="#3a2a20">
        <Rider u={u} />
      </Horse>
    </g>
  );
};

// Covered supply wagon (canvas tilt), facing right. `sink` 0 → 1 bogs it into mud (sinks + tilts).
export const Wagon = ({ x, y, scale = 1, flip = false, sink = 0, roll = 0, canvas = "#e4dcc6" }: Fig & { sink?: number; roll?: number; canvas?: string }) => (
  <g transform={`translate(${x},${y + sink * 18}) rotate(${-sink * 6}) scale(${flip ? -scale : scale},${scale})`}>
    <ellipse cx={0} cy={2} rx={62} ry={5} fill="#000" opacity={0.25} />
    <path d="M-60 -40 L60 -40 L56 -22 L-56 -22 Z" fill="#8a5a32" stroke={INK} strokeWidth={1.5} />
    <path d="M-56 -40 Q-60 -96 0 -98 Q60 -96 56 -40 Z" fill={canvas} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    {[-30, 0, 30].map((cx) => <path key={cx} d={`M${cx} -97 Q${cx + 4} -70 ${cx} -40`} stroke="#b8ae94" strokeWidth={2} fill="none" />)}
    <path d="M60 -30 L100 -46" stroke="#5a3a22" strokeWidth={4} strokeLinecap="round" />
    <Wheel x={-36} y={-18} r={18} rot={roll} />
    <Wheel x={38} y={-18} r={18} rot={roll * 1.1} />
  </g>
);

// Muddy track across a panel: brown band with puddles and ruts.
export const Mud = ({ x, y, W, H, s, wet = 1 }: { x: number; y: number; W: number; H: number; s: number; wet?: number }) => (
  <g>
    <rect x={x} y={y} width={W} height={H} fill="#5e4630" />
    <path d={`M${x} ${y + 18 * s} Q${x + W / 2} ${y + 10 * s} ${x + W} ${y + 20 * s}`} stroke="#3e2c1c" strokeWidth={5 * s} fill="none" />
    <path d={`M${x} ${y + 34 * s} Q${x + W / 2} ${y + 28 * s} ${x + W} ${y + 36 * s}`} stroke="#3e2c1c" strokeWidth={5 * s} fill="none" />
    {Array.from({ length: 7 }, (_, i) => (
      <ellipse key={i} cx={x + (i / 6) * W + random(`mp${i}`) * 40 * s} cy={y + (10 + random(`mq${i}`) * 26) * s} rx={(30 + random(`mr${i}`) * 40) * s} ry={5 * s} fill="#8aa0ac" opacity={0.55 * wet} />
    ))}
  </g>
);

// Log hut with a thatched roof; `burn` 0 → 1 sets it alight and chars it.
export const Hut = ({ x, y, scale = 1, burn = 0, seed = 1 }: Fig & { burn?: number; seed?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-46} y={-50} width={92} height={50} fill={burn > 0.5 ? "#4a3626" : "#8a6440"} stroke={INK} strokeWidth={1.5} />
    {[-40, -30, -20, -10].map((ly) => <line key={ly} x1={-46} y1={ly} x2={46} y2={ly} stroke="#5a3e26" strokeWidth={1.5} />)}
    <rect x={-10} y={-34} width={20} height={34} fill="#2a1d14" stroke={INK} strokeWidth={1.2} />
    <rect x={20} y={-38} width={14} height={12} fill="#3a2a1c" stroke={INK} strokeWidth={1.1} />
    <path d="M-58 -48 L0 -96 L58 -48 Z" fill={burn > 0.5 ? "#3a3026" : "#c9a45a"} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    <path d="M-40 -58 L0 -90 M-20 -54 L0 -80 M40 -58 L0 -90" stroke="#a8843e" strokeWidth={1.5} opacity={burn > 0.5 ? 0 : 1} />
    {burn > 0 && <Smoke x={6} y={-80} size={34} seed={seed} k={burn} />}
    {burn > 0 && <Fire x={-12} y={-64} size={60} seed={seed} k={burn} />}
    {burn > 0 && <Fire x={20} y={-58} size={44} seed={seed + 5} k={burn * 0.9} />}
  </g>
);

// A strip of ripe grain across a panel; `burn` 0 → 1 runs fire along it from the left and leaves it black.
export const GrainField = ({ x, y, W, s, burn = 0, seed = 2 }: { x: number; y: number; W: number; s: number; burn?: number; seed?: number }) => {
  const front = x + W * burn;
  return (
    <g>
      <rect x={x} y={y - 26 * s} width={W} height={30 * s} fill="#d8b04e" />
      {Array.from({ length: 40 }, (_, i) => {
        const sx = x + (i / 39) * W;
        const burnt = sx < front;
        return <path key={i} d={`M${sx} ${y} L${sx + 2 * s} ${y - (34 + random(`g${seed}${i}`) * 12) * s}`} stroke={burnt ? "#2a2420" : "#b88f2e"} strokeWidth={3 * s} />;
      })}
      {burn > 0 && <rect x={x} y={y - 30 * s} width={W * burn} height={34 * s} fill="#2a2420" opacity={0.85} />}
      {burn > 0 && burn < 1.05 &&
        [0, 1, 2].map((i) => <Fire key={i} x={front - i * 40 * s} y={y - 6 * s} size={(70 - i * 15) * s} seed={seed + i} />)}
      {burn > 0 && <Smoke x={front - 30 * s} y={y - 50 * s} size={60 * s} seed={seed} />}
    </g>
  );
};

// Large white marquee tent (field hospital, no people). `flag` colour on the pole.
export const FieldTent = ({ x, y, scale = 1, flag = "#e2c14a" }: Fig & { flag?: string }) => {
  const frame = useCurrentFrame();
  const wave = Math.sin(frame * 0.2) * 3;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={110} ry={6} fill="#000" opacity={0.25} />
      <path d="M-100 0 L-80 -70 L80 -70 L100 0 Z" fill="#ecebe4" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M40 0 L60 -70 L80 -70 L100 0 Z" fill="#c9c5b8" />
      <path d="M-80 -70 L-60 -96 L60 -96 L80 -70 Z" fill="#f4f2ea" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-22 0 L-14 -60 L14 -60 L22 0 Z" fill="#3a3a3a" stroke={INK} strokeWidth={1.2} />
      <path d="M-14 -60 L-30 0 M14 -60 L30 0" stroke="#c9c5b8" strokeWidth={4} />
      {[-110, 110].map((px) => <line key={px} x1={px} y1={0} x2={px * 0.75} y2={-70} stroke="#8a8a80" strokeWidth={1.5} />)}
      <line x1={0} y1={-96} x2={0} y2={-150} stroke="#5a3a22" strokeWidth={3} />
      <path d={`M0 -150 L${36 + wave} ${-144 + wave * 0.3} L${34 + wave} -128 L0 -132 Z`} fill={flag} stroke={INK} strokeWidth={1.2} />
    </g>
  );
};

// Bell tent for a camp row.
export const CampTent = ({ x, y, scale = 1, color = "#e4dcc6" }: Fig & { color?: string }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-34 0 L0 -56 L34 0 Z" fill={color} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    <path d="M0 -56 L34 0 L12 0 Z" fill="#000" opacity={0.15} />
    <path d="M-6 0 L0 -30 L6 0 Z" fill="#3a3a3a" />
    <line x1={0} y1={-56} x2={0} y2={-66} stroke="#5a3a22" strokeWidth={2} />
  </g>
);

// Regimental standard: pole with a gilt eagle and a tricolour flag.
export const Standard = ({ x, y, scale = 1, colors = ["#2c4a8c", "#f4f2ea", "#c8312b"] }: Fig & { colors?: [string, string, string] | string[] }) => {
  const frame = useCurrentFrame();
  const w = Math.sin(frame * 0.18 + x) * 3;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <line x1={0} y1={0} x2={0} y2={-170} stroke="#5a3a22" strokeWidth={3.5} />
      <path d="M-7 -170 Q0 -184 7 -170 L4 -176 L0 -172 L-4 -176 Z" fill="#d9b45a" stroke={INK} strokeWidth={1} />
      {colors.map((c, i) => (
        <path key={i} d={`M${2 + i * 18} -164 L${20 + i * 18} ${-164 + w * (i + 1) * 0.3} L${20 + i * 18} ${-122 + w * (i + 1) * 0.3} L${2 + i * 18} -122 Z`} fill={c} stroke={INK} strokeWidth={1} />
      ))}
    </g>
  );
};

// A heap of sacks, barrels and loaves that grows with k (0 → 1): "a mountain of food".
export const FoodPile = ({ x, y, s, k = 1 }: { x: number; y: number; s: number; k?: number }) => {
  const items: [number, number, "sack" | "barrel" | "loaf"][] = [];
  for (let row = 0; row < 6; row++) for (let i = 0; i < 9 - row; i++) items.push([(i - (8 - row) / 2) * 46, row * 32, (["sack", "barrel", "sack", "loaf"] as const)[(i + row) % 4]]);
  const n = Math.round(items.length * Math.max(0, Math.min(1, k)));
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {items.slice(0, n).map(([ix, iy, kind], i) =>
        kind === "barrel" ? (
          <g key={i}>
            <rect x={ix - 18} y={-iy - 34} width={36} height={32} rx={6} fill="#8a5a32" stroke={INK} strokeWidth={1.4} />
            <line x1={ix - 18} y1={-iy - 24} x2={ix + 18} y2={-iy - 24} stroke="#3a3a3a" strokeWidth={2} />
            <line x1={ix - 18} y1={-iy - 12} x2={ix + 18} y2={-iy - 12} stroke="#3a3a3a" strokeWidth={2} />
          </g>
        ) : kind === "loaf" ? (
          <g key={i}>
            <ellipse cx={ix} cy={-iy - 14} rx={22} ry={13} fill="#c98a3e" stroke={INK} strokeWidth={1.4} />
            <path d={`M${ix - 10} ${-iy - 20} L${ix - 4} ${-iy - 10} M${ix + 2} ${-iy - 22} L${ix + 8} ${-iy - 12}`} stroke="#8a5a22" strokeWidth={1.6} />
          </g>
        ) : (
          <g key={i}>
            <path d={`M${ix - 20} ${-iy - 2} Q${ix - 24} ${-iy - 26} ${ix - 12} ${-iy - 34} L${ix + 12} ${-iy - 34} Q${ix + 24} ${-iy - 26} ${ix + 20} ${-iy - 2} Z`} fill="#e3cf9e" stroke={INK} strokeWidth={1.4} />
            <path d={`M${ix - 8} ${-iy - 34} L${ix} ${-iy - 40} L${ix + 8} ${-iy - 34}`} stroke={INK} strokeWidth={1.2} fill="#d4bf8a" />
          </g>
        ),
      )}
    </g>
  );
};

// An old engineer (white hair, black frock coat, spectacles) standing at a drafting table. The sheet shows a tan
// band drawn as k goes 0 → 1, thinning to a black thread on its way back.
export const EngineerDesk = ({ x, y, scale = 1, k = 1 }: Fig & { k?: number }) => {
  const frame = useCurrentFrame();
  const pen = Math.sin(frame * 0.5) * 2;
  const skin = "#efc6a2";
  const a = Math.min(1, k * 1.6);
  const r = Math.max(0, k * 1.6 - 0.6);
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx={30} cy={2} rx={120} ry={5} fill="#000" opacity={0.25} />
      {/* table legs + slanted board with the sheet */}
      <path d="M40 0 L56 -70 M150 0 L134 -70" stroke="#5a3a22" strokeWidth={5} />
      <path d="M26 -74 L168 -96 L172 -84 L30 -62 Z" fill="#8a5a32" stroke={INK} strokeWidth={1.5} />
      <path d="M36 -76 L160 -95 L163 -87 L39 -68 Z" fill="#f2ead6" stroke={INK} strokeWidth={1} />
      <g transform="translate(40,-72) skewY(-8.7)">
        <path d={`M4 -4 L${4 + 110 * a} ${-2 + 2 * a} L${4 + 110 * a} ${-1 + 2 * a} L4 2 Z`} fill="#d9a35e" stroke="#8a5a22" strokeWidth={0.6} />
        {r > 0 && <path d={`M${114 - 110 * r} 5 L114 5`} stroke="#15161b" strokeWidth={1.2} />}
      </g>
      {/* oil lamp */}
      <rect x={150} y={-112} width={8} height={14} fill="#d9b45a" stroke={INK} strokeWidth={1} />
      <ellipse cx={154} cy={-118} rx={4} ry={7} fill="#ffe08a" opacity={0.9 + Math.sin(frame * 0.3) * 0.1} />
      {/* the engineer */}
      <path d="M-14 -42 L-12 0 L-3 0 L-4 -42 Z" fill="#2a2a30" stroke={INK} strokeWidth={1.4} />
      <path d="M2 -42 L4 0 L13 0 L12 -42 Z" fill="#2a2a30" stroke={INK} strokeWidth={1.4} />
      <path d="M-14 -2 L-2 -2 L-1 2 L-14 2 Z M3 -2 L16 -2 L17 2 L3 2 Z" fill="#111" />
      <path d="M-16 -96 Q-20 -60 -18 -30 L16 -30 Q18 -60 14 -96 Q0 -102 -16 -96 Z" fill="#26262c" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-4 -96 L4 -96 L2 -78 L-2 -78 Z" fill="#f4f2ea" />
      <path d="M-2 -94 L2 -94 L1 -86 L-1 -86 Z" fill="#1c1c22" />
      <rect x={-3} y={-104} width={7} height={8} fill={skin} />
      <g transform="translate(1,-114)">
        <ellipse cx={0} cy={0} rx={10} ry={11} fill={skin} stroke={INK} strokeWidth={1.5} />
        <path d="M-10 -2 Q-12 -14 -2 -12 Q-8 -8 -9 2 Z" fill="#e8e8e8" stroke={INK} strokeWidth={0.8} />
        <path d="M-9 4 Q-7 12 -1 13 Q4 13 6 8" fill="#e8e8e8" stroke={INK} strokeWidth={0.8} />
        <circle cx={6} cy={-1} r={3} fill="none" stroke={INK} strokeWidth={1} />
        <circle cx={6} cy={-1} r={0.9} fill={INK} />
      </g>
      {/* arm with pen on the sheet */}
      <path d={`M6 -90 Q30 -78 ${58 + pen} -80`} stroke="#26262c" strokeWidth={8} strokeLinecap="round" fill="none" />
      <circle cx={60 + pen} cy={-80} r={4} fill={skin} stroke={INK} strokeWidth={1.1} />
      <line x1={60 + pen} y1={-80} x2={66 + pen} y2={-94} stroke="#2a2a30" strokeWidth={1.6} />
    </g>
  );
};

// Supply gauge: half dial from FULL to EMPTY; `level` 1 → 0 moves the needle. Labels in the given font.
export const Gauge = ({ x, y, s, level, font, title = "SUPPLIES" }: { x: number; y: number; s: number; level: number; font: string; title?: string }) => {
  const R = 110;
  const arc = (a0: number, a1: number, color: string) => {
    const p = (a: number) => [Math.cos(Math.PI * (1 - a)) * R, -Math.sin(Math.PI * (1 - a)) * R];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return <path d={`M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`} stroke={color} strokeWidth={22} fill="none" />;
  };
  const ang = Math.PI * Math.max(0, Math.min(1, level)); // level 1 = right (FULL)
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d={`M${-R - 26} 10 A${R + 26} ${R + 26} 0 0 1 ${R + 26} 10 Z`} fill="rgba(8,14,26,0.9)" stroke="#fff" strokeOpacity={0.4} strokeWidth={2} />
      {arc(0, 0.3, "#ff3b30")}
      {arc(0.3, 0.6, "#ffc94a")}
      {arc(0.6, 1, "#3fae6a")}
      <line x1={0} y1={0} x2={Math.cos(Math.PI - ang) * (R - 14)} y2={-Math.sin(Math.PI - ang) * (R - 14)} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      <circle r={10} fill="#fff" />
      <text x={-R} y={34} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={20} fill="#ff6b5f">EMPTY</text>
      <text x={R} y={34} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={20} fill="#7be09a">FULL</text>
      <text x={0} y={-36} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={22} fill="#fff">{title}</text>
    </g>
  );
};

// Tear-off calendar page with a day count.
export const Calendar = ({ x, y, s, day, font, head = "DAYS" }: { x: number; y: number; s: number; day: number; font: string; head?: string }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-60} y={-70} width={120} height={140} rx={10} fill="#fbf7ee" stroke={INK} strokeWidth={2} />
    <rect x={-60} y={-70} width={120} height={38} rx={10} fill="#c8312b" />
    <rect x={-60} y={-44} width={120} height={12} fill="#c8312b" />
    <circle cx={-30} cy={-70} r={6} fill="#3a3a3a" />
    <circle cx={30} cy={-70} r={6} fill="#3a3a3a" />
    <text x={0} y={-42} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={22} fill="#fff">{head}</text>
    <text x={0} y={46} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={76} fill="#1b1d24">{day}</text>
  </g>
);

// Hot sun with slowly turning rays.
export const HotSun = ({ x, y, r, k = 1 }: { x: number; y: number; r: number; k?: number }) => {
  const frame = useCurrentFrame();
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x},${y}) rotate(${frame * 0.4})`} opacity={k}>
      <circle r={r * 2.2} fill="#ffcf5a" opacity={0.25} />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-r * 0.12} ${-r * 1.15} L0 ${-r * 1.7} L${r * 0.12} ${-r * 1.15} Z`} fill="#ffd34a" transform={`rotate(${i * 30})`} />)}
      <circle r={r} fill="#ffe27a" stroke="#ffb02e" strokeWidth={r * 0.08} />
    </g>
  );
};

// Slanted rain over a box, with an occasional lightning flash.
export const Storm = ({ x, y, W, H, s, k = 1, n = 90, lightning = true }: { x: number; y: number; W: number; H: number; s: number; k?: number; n?: number; lightning?: boolean }) => {
  const frame = useCurrentFrame();
  if (k <= 0) return null;
  const flash = lightning && frame % 70 < 3 ? 1 : 0;
  return (
    <g opacity={k}>
      {Array.from({ length: n }, (_, i) => {
        const sp = 9 + random(`rs${i}`) * 6;
        const ry = y + ((random(`ry${i}`) * H + frame * sp) % H);
        const rx = x + ((random(`rx${i}`) * W - frame * sp * 0.25) % W + W) % W;
        return <line key={i} x1={rx} y1={ry} x2={rx - 6 * s} y2={ry + 22 * s} stroke="#cfe0ee" strokeWidth={2 * s} opacity={0.6} />;
      })}
      {flash > 0 && <rect x={x} y={y} width={W} height={H} fill="#fff" opacity={0.35} />}
      {flash > 0 && <path d={`M${x + W * 0.7} ${y} L${x + W * 0.66} ${y + H * 0.25} L${x + W * 0.7} ${y + H * 0.25} L${x + W * 0.64} ${y + H * 0.5}`} stroke="#fffbe0" strokeWidth={4 * s} fill="none" />}
    </g>
  );
};

// Drifting dust haze along the ground.
export const Dust = ({ x, y, W, s, k = 1, n = 14 }: { x: number; y: number; W: number; s: number; k?: number; n?: number }) => {
  const frame = useCurrentFrame();
  if (k <= 0) return null;
  return (
    <g opacity={k}>
      {Array.from({ length: n }, (_, i) => {
        const dx = x + ((random(`dx${i}`) * W + frame * (0.8 + random(`dv${i}`))) % W);
        const r = (30 + random(`dr${i}`) * 50) * s;
        return <circle key={i} cx={dx} cy={y - r * 0.4 - random(`dy${i}`) * 40 * s} r={r} fill="#d8b98a" opacity={0.28} />;
      })}
    </g>
  );
};

// Small water barrel with a ladle (bad water).
export const WaterBarrel = ({ x, y, scale = 1 }: Fig) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <ellipse cx={0} cy={2} rx={24} ry={4} fill="#000" opacity={0.25} />
    <rect x={-20} y={-44} width={40} height={44} rx={6} fill="#8a5a32" stroke={INK} strokeWidth={1.4} />
    <line x1={-20} y1={-32} x2={20} y2={-32} stroke="#3a3a3a" strokeWidth={2.5} />
    <line x1={-20} y1={-12} x2={20} y2={-12} stroke="#3a3a3a" strokeWidth={2.5} />
    <ellipse cx={0} cy={-44} rx={20} ry={5} fill="#6f7a4a" stroke={INK} strokeWidth={1.2} />
    <ellipse cx={-6} cy={-45} rx={5} ry={1.5} fill="#9aa86a" />
    <path d="M8 -44 L22 -64" stroke="#5a3a22" strokeWidth={2.5} />
  </g>
);

// Small baroque town skyline (houses, two church towers with domes) along a base line; width ~ 600 units.
export const Town = ({ x, y, scale = 1, wall = "#e8dcc4", roof = "#a4473a" }: Fig & { wall?: string; roof?: string }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    {[-300, -230, -150, -40, 60, 150, 240].map((hx, i) => {
      const w = 60 + (i % 3) * 14;
      const h = 54 + ((i * 37) % 30);
      return (
        <g key={hx}>
          <rect x={hx} y={-h} width={w} height={h} fill={i % 2 ? wall : "#d9c9a8"} stroke={INK} strokeWidth={1.4} />
          <path d={`M${hx - 4} ${-h} L${hx + w / 2} ${-h - 30} L${hx + w + 4} ${-h} Z`} fill={roof} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          {[0.25, 0.65].map((wx) => <rect key={wx} x={hx + w * wx - 5} y={-h + 16} width={10} height={14} fill="#3a3a44" />)}
        </g>
      );
    })}
    {[-95, 115].map((tx) => (
      <g key={tx}>
        <rect x={tx - 16} y={-170} width={32} height={170} fill="#f2ead6" stroke={INK} strokeWidth={1.5} />
        <rect x={tx - 7} y={-150} width={14} height={22} rx={7} fill="#3a3a44" />
        <path d={`M${tx - 18} -170 Q${tx} -206 ${tx + 18} -170 Z`} fill="#5f7f6a" stroke={INK} strokeWidth={1.4} />
        <line x1={tx} y1={-200} x2={tx} y2={-224} stroke={INK} strokeWidth={2} />
        <line x1={tx - 6} y1={-216} x2={tx + 6} y2={-216} stroke={INK} strokeWidth={2} />
      </g>
    ))}
  </g>
);
