import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Detailed illustrated figures for news scenes, drawn in SVG (inside <MapFrame> or any <svg>).
// Units: 1 = 1 px at scale 1; every component takes `scale` and a position. Side view, feet at y = 0.
// Style: soft shading (two-tone fills + gradient highlights), 1.6 px dark outline, small idle motion.

const INK = "#1b1d24";

export type Look = { skin: string; hair: string; top: string; topShade: string; legs: string; shoes: string };
export const LOOKS: Look[] = [
  { skin: "#f1c7a3", hair: "#3b2a20", top: "#e4572e", topShade: "#b8401f", legs: "#2f3b55", shoes: "#222" },
  { skin: "#c68b62", hair: "#1c1410", top: "#f2c14e", topShade: "#c99a2e", legs: "#3d3d3d", shoes: "#5a3b26" },
  { skin: "#8d5a3b", hair: "#120c08", top: "#4f9d69", topShade: "#3a7650", legs: "#1f2a44", shoes: "#eee" },
  { skin: "#f6d5b8", hair: "#b07a3c", top: "#3e7cb1", topShade: "#2d5d87", legs: "#4a4a4a", shoes: "#222" },
  { skin: "#e0a87e", hair: "#5b3a24", top: "#d1495b", topShade: "#a33545", legs: "#2b2b36", shoes: "#7a1f1f" },
  { skin: "#b9784f", hair: "#24170f", top: "#eae2b7", topShade: "#c4bc93", legs: "#355070", shoes: "#222" },
];

const Defs = () => (
  <defs>
    <linearGradient id="fig-visor" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#cfe6ff" stopOpacity={0.85} />
      <stop offset="0.5" stopColor="#5d7fa3" stopOpacity={0.55} />
      <stop offset="1" stopColor="#1b2a3c" stopOpacity={0.8} />
    </linearGradient>
    <linearGradient id="fig-shield" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#d9e8f5" stopOpacity={0.55} />
      <stop offset="1" stopColor="#8aa4bd" stopOpacity={0.35} />
    </linearGradient>
    <linearGradient id="fig-car" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#8a9099" />
      <stop offset="1" stopColor="#4b5059" />
    </linearGradient>
    <radialGradient id="fig-flame" cx="0.5" cy="0.8" r="0.8">
      <stop offset="0" stopColor="#fff6c2" />
      <stop offset="0.35" stopColor="#ffd04a" />
      <stop offset="0.7" stopColor="#ff7a1a" />
      <stop offset="1" stopColor="#d6331a" />
    </radialGradient>
    <radialGradient id="fig-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#ff9a3c" stopOpacity={0.55} />
      <stop offset="1" stopColor="#ff9a3c" stopOpacity={0} />
    </radialGradient>
  </defs>
);
export const FigureDefs = Defs;

// A protester walking, one arm raising a placard on a stick. `phase` desynchronises the crowd.
// `lift` raises the placard (px before scaling) so neighbouring signs do not cover each other.
export const Protester = ({ x, y, scale = 1, look, sign, phase = 0, walking = true, lift = 0 }: { x: number; y: number; scale?: number; look: Look; sign?: string; phase?: number; walking?: boolean; lift?: number }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.28 + phase;
  const swing = walking ? Math.sin(t) * 16 : 0;
  const bob = walking ? Math.abs(Math.sin(t)) * -2.5 : 0;
  const pump = Math.sin(frame * 0.18 + phase * 1.7) * 6; // placard pumping
  const leg = (angle: number, color: string, back: boolean) => (
    <g transform={`translate(0,-38) rotate(${angle})`}>
      <path d="M-5 0 L5 0 L4.5 36 L-4 36 Z" fill={color} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" opacity={back ? 0.85 : 1} />
      <path d="M-5 34 L9 34 Q11 38 8 40 L-5 40 Z" fill={look.shoes} stroke={INK} strokeWidth={1.4} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y + bob}) scale(${scale})`}>
      <ellipse cx={0} cy={1} rx={13} ry={3} fill="#000" opacity={0.25} />
      {leg(-swing, look.legs, true)}
      {leg(swing, look.legs, false)}
      {/* back arm */}
      <path d={`M-4 -70 Q-10 -55 ${-6 - swing * 0.4} -44`} stroke={look.topShade} strokeWidth={7} strokeLinecap="round" fill="none" />
      {/* torso: jacket with shaded side and zip line */}
      <path d="M-11 -76 Q-12 -58 -9 -36 L9 -36 Q12 -58 11 -76 Q0 -82 -11 -76 Z" fill={look.top} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M3 -78 Q9 -60 8 -37 L9 -36 Q12 -58 11 -76 Z" fill={look.topShade} />
      <line x1={0} y1={-77} x2={0} y2={-38} stroke={look.topShade} strokeWidth={1.2} />
      {/* neck + head with hair and face */}
      <rect x={-3} y={-84} width={6} height={7} fill={look.skin} />
      <g transform={`translate(0,-94)`}>
        <ellipse cx={0} cy={0} rx={10} ry={11} fill={look.skin} stroke={INK} strokeWidth={1.6} />
        <path d="M-10 -1 Q-11 -14 0 -13 Q11 -13 10 -3 Q4 -8 -3 -7 Q-8 -6 -10 -1 Z" fill={look.hair} />
        <circle cx={5} cy={0} r={1.3} fill={INK} />
        <path d="M3 6 Q6 7 8 5" stroke={INK} strokeWidth={1.2} fill="none" />
        <ellipse cx={-2} cy={2} rx={2.2} ry={1.4} fill="#e8957a" opacity={0.35} />
      </g>
      {/* front arm raising the placard */}
      <g transform={`translate(6,-72) rotate(${-150 + pump})`}>
        <path d="M0 0 L0 24" stroke={look.top} strokeWidth={7.5} strokeLinecap="round" />
        <circle cx={0} cy={26} r={4} fill={look.skin} stroke={INK} strokeWidth={1.2} />
      </g>
      {sign && (
        <g transform={`translate(${10 + pump * 0.3},-102) rotate(${pump * 0.5})`}>
          <line x1={0} y1={6} x2={0} y2={-40 - lift} stroke="#8b5a2b" strokeWidth={3} />
          <g transform={`translate(0,${-58 - lift})`}>
            <rect x={-38} y={-16} width={76} height={34} rx={3} fill="#fbf7ee" stroke={INK} strokeWidth={1.6} />
            <rect x={-38} y={12} width={76} height={6} fill="#e7dfcc" />
            <text x={0} y={6} textAnchor="middle" fontSize={sign.length > 6 ? 11 : 15} fontWeight={900} fill="#c1121f" fontFamily="Arial Black, Arial, sans-serif">
              {sign}
            </text>
          </g>
        </g>
      )}
    </g>
  );
};

// Riot police officer: helmet + visor, padded navy uniform, transparent shield with "POLICE", baton.
export const RiotPolice = ({ x, y, scale = 1, phase = 0, advance = 0 }: { x: number; y: number; scale?: number; phase?: number; advance?: number }) => {
  const frame = useCurrentFrame();
  const step = Math.sin(frame * 0.12 + phase) * 1.5;
  return (
    <g transform={`translate(${x + advance},${y}) scale(${scale})`}>
      <ellipse cx={0} cy={1} rx={15} ry={3.5} fill="#000" opacity={0.3} />
      {/* legs + boots */}
      <path d="M-8 -40 L-2 -40 L-3 -3 L-9 -3 Z" fill="#1d2738" stroke={INK} strokeWidth={1.5} />
      <path d="M2 -40 L8 -40 L8 -3 L2 -3 Z" fill="#26324a" stroke={INK} strokeWidth={1.5} />
      <rect x={-11} y={-5} width={10} height={6} rx={1.5} fill="#111" />
      <rect x={1} y={-5} width={10} height={6} rx={1.5} fill="#111" />
      <rect x={-9} y={-30} width={7} height={8} rx={2} fill="#344058" stroke={INK} strokeWidth={1} />
      <rect x={2} y={-30} width={7} height={8} rx={2} fill="#344058" stroke={INK} strokeWidth={1} />
      {/* torso armour */}
      <path d="M-13 -80 Q-14 -60 -11 -40 L11 -40 Q14 -60 13 -80 Q0 -86 -13 -80 Z" fill="#26324a" stroke={INK} strokeWidth={1.6} />
      <path d="M-9 -76 L9 -76 L8 -52 L-8 -52 Z" fill="#1d2738" stroke="#0f141e" strokeWidth={1} />
      <text x={0} y={-60} textAnchor="middle" fontSize={6} fontWeight={900} fill="#d7dde8" fontFamily="Arial, sans-serif">POLICE</text>
      <rect x={-17} y={-80} width={8} height={10} rx={3} fill="#344058" stroke={INK} strokeWidth={1.2} />
      {/* baton arm (back) */}
      <g transform={`translate(10,-74) rotate(${-25 + step * 3})`}>
        <path d="M0 0 L0 22" stroke="#26324a" strokeWidth={7} strokeLinecap="round" />
        <line x1={0} y1={20} x2={0} y2={46} stroke="#111" strokeWidth={3.5} strokeLinecap="round" />
      </g>
      {/* head: helmet, visor, chin guard */}
      <g transform="translate(0,-96)">
        <path d="M-13 4 Q-14 -15 0 -16 Q14 -15 13 4 L12 8 L-12 8 Z" fill="#1e2636" stroke={INK} strokeWidth={1.6} />
        <path d="M-4 -15 Q4 -16 9 -11" stroke="#7c8aa3" strokeWidth={2} fill="none" opacity={0.7} />
        <rect x={-12} y={-6} width={24} height={14} rx={3} fill="url(#fig-visor)" stroke={INK} strokeWidth={1.2} />
        <path d="M-9 -4 L0 -4" stroke="#fff" strokeWidth={1.4} opacity={0.8} />
        <rect x={-5} y={8} width={10} height={4} fill="#c79b7b" />
      </g>
      {/* shield in front */}
      <g transform={`translate(-15,${-92 + step})`}>
        <rect x={0} y={0} width={24} height={78} rx={4} fill="url(#fig-shield)" stroke="#c9d6e3" strokeWidth={2} />
        <rect x={2} y={2} width={20} height={74} rx={3} fill="none" stroke={INK} strokeWidth={0.8} opacity={0.6} />
        <text x={12} y={44} textAnchor="middle" fontSize={6.5} fontWeight={900} fill="#0f1a2a" fontFamily="Arial, sans-serif" transform="rotate(-90 12 44)">POLICE</text>
        <path d="M4 6 L8 70" stroke="#fff" strokeWidth={1.5} opacity={0.6} />
      </g>
    </g>
  );
};

// Layered flame with flicker; `size` ≈ height in px.
export const Fire = ({ x, y, size = 60, seed = 0, k = 1 }: { x: number; y: number; size?: number; seed?: number; k?: number }) => {
  const frame = useCurrentFrame();
  const f = (n: number) => 1 + 0.16 * Math.sin(frame * (0.55 + random(`${seed}-${n}`) * 0.5) + random(`${seed}+${n}`) * 6);
  const tongue = (w: number, h: number, dx: number, n: number, fill: string) => (
    <path
      transform={`translate(${dx},0) scale(${f(n)},${f(n + 5)})`}
      d={`M${-w} 0 C${-w} ${-h * 0.45} ${-w * 0.15} ${-h * 0.6} ${w * 0.1} ${-h} C${w * 0.3} ${-h * 0.62} ${w} ${-h * 0.45} ${w} 0 Z`}
      fill={fill}
    />
  );
  const sc = (size / 60) * k;
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x},${y}) scale(${sc})`}>
      <circle cx={0} cy={-25} r={55} fill="url(#fig-glow)" />
      {tongue(22, 58, -10, 1, "#c62d14")}
      {tongue(20, 66, 8, 2, "#e04a1a")}
      {tongue(17, 52, 0, 3, "url(#fig-flame)")}
      {tongue(8, 30, -2, 4, "#fff1a8")}
      {[0, 1, 2].map((i) => {
        const a = ((frame * 2 + i * 23 + seed * 7) % 40) / 40;
        return <circle key={i} cx={(random(`e${seed}${i}`) - 0.5) * 30 + a * 10} cy={-30 - a * 50} r={1.8} fill="#ffcf5a" opacity={1 - a} />;
      })}
    </g>
  );
};

// Drifting smoke column (leans with `wind`, px per unit height).
export const Smoke = ({ x, y, size = 60, seed = 0, wind = 0.35, k = 1 }: { x: number; y: number; size?: number; seed?: number; wind?: number; k?: number }) => {
  const frame = useCurrentFrame();
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x},${y})`} opacity={k}>
      {Array.from({ length: 7 }, (_, i) => {
        const a = ((frame + i * 9 + seed * 13) % 63) / 63;
        const h = a * size * 2.6;
        return <circle key={i} cx={h * wind + Math.sin(a * 6 + i) * 4} cy={-size * 0.5 - h} r={size * (0.18 + a * 0.45)} fill={i % 2 ? "#3a3632" : "#57514b"} opacity={(1 - a) * 0.55} />;
      })}
    </g>
  );
};

// A burnt-out hatchback on fire, side view; broken window, scorch marks.
export const BurningCar = ({ x, y, scale = 1, burn = 1, seed = 3 }: { x: number; y: number; scale?: number; burn?: number; seed?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <ellipse cx={0} cy={2} rx={58} ry={6} fill="#000" opacity={0.35} />
    <Smoke x={-5} y={-40} size={34} seed={seed} k={burn} />
    <path d="M-55 -10 L-52 -28 Q-46 -32 -36 -33 L-22 -50 Q-16 -55 -6 -55 L22 -55 Q32 -55 38 -46 L48 -33 Q56 -31 57 -24 L57 -10 Z" fill="url(#fig-car)" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
    <path d="M-18 -48 L-6 -50 L-6 -35 L-28 -35 Z" fill="#1f2730" stroke={INK} strokeWidth={1.2} />
    <path d="M0 -50 L20 -50 Q28 -50 32 -44 L38 -35 L0 -35 Z" fill="#2a3440" stroke={INK} strokeWidth={1.2} />
    <path d="M6 -48 L12 -40 L9 -38 L17 -36" stroke="#9fb3c8" strokeWidth={1} fill="none" />
    <path d="M-40 -24 Q-20 -30 10 -26 Q30 -22 50 -26" stroke="#2b2e33" strokeWidth={6} opacity={0.5 * burn} fill="none" />
    <rect x={44} y={-27} width={10} height={5} rx={1.5} fill="#ffd27a" opacity={0.7} />
    {[-34, 32].map((wx) => (
      <g key={wx} transform={`translate(${wx},-10)`}>
        <circle r={11} fill="#16181c" stroke={INK} strokeWidth={1.5} />
        <circle r={5} fill="#6b7078" />
      </g>
    ))}
    <Fire x={-8} y={-38} size={58} seed={seed} k={burn} />
    <Fire x={22} y={-32} size={40} seed={seed + 11} k={burn * 0.9} />
  </g>
);

// Night curfew chip: moon + hours.
export const CurfewChip = ({ x, y, scale = 1, hours, label = "เคอร์ฟิว", font, k = 1 }: { x: number; y: number; scale?: number; hours: string; label?: string; font: string; k?: number }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x},${y}) scale(${scale * k})`}>
      <rect x={-8} y={-34} width={200} height={56} rx={28} fill="#0b1426" stroke="#ffd36b" strokeWidth={2.5} />
      <circle cx={22} cy={-6} r={16} fill="#ffd36b" />
      <circle cx={30} cy={-12} r={14} fill="#0b1426" />
      <circle cx={13} cy={-14} r={1.6} fill="#fff" />
      <circle cx={46} cy={-24} r={1.2} fill="#fff" />
      <text x={52} y={-9} fontSize={17} fontWeight={900} fill="#ffd36b" fontFamily={font}>{label}</text>
      <text x={52} y={13} fontSize={19} fontWeight={900} fill="#fff" fontFamily={font}>{hours}</text>
    </g>
  );
};

// Pop-in helper for a group that appears at `start` and leaves at `end`.
export const usePopIn = (start: number, end?: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = frame < start ? 0 : spring({ frame: frame - start, fps, config: { damping: 13, mass: 0.7 } });
  const out = end === undefined ? 1 : interpolate(frame, [end - 10, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return k * out;
};

export type Hat = "none" | "peaked" | "hijab" | "beanie" | "cap";
export type Pose = "stand" | "walk" | "wave" | "hold" | "cheer";

// General person. `outfit`: "casual" (look colours), "suit" (dark jacket, shirt, tie), "uniform" (khaki
// officer: epaulettes, ribbons, belt), "coat" (long winter coat). `holding` is drawn at the hands for "hold".
export const Person = ({
  x,
  y,
  scale = 1,
  look,
  pose = "stand",
  hat = "none",
  outfit = "casual",
  facing = 1,
  phase = 0,
  holding,
}: {
  x: number;
  y: number;
  scale?: number;
  look: Look;
  pose?: Pose;
  hat?: Hat;
  outfit?: "casual" | "suit" | "uniform" | "coat";
  facing?: 1 | -1;
  phase?: number;
  holding?: React.ReactNode;
}) => {
  const frame = useCurrentFrame();
  const t = frame * 0.28 + phase;
  const walking = pose === "walk";
  const swing = walking ? Math.sin(t) * 16 : 0;
  const breathe = Math.sin(frame * 0.07 + phase) * 0.8;
  const bob = walking ? Math.abs(Math.sin(t)) * -2.5 : breathe;
  const top = outfit === "suit" ? "#2b2f3a" : outfit === "uniform" ? "#7d7a52" : outfit === "coat" ? look.topShade : look.top;
  const shade = outfit === "suit" ? "#1d2029" : outfit === "uniform" ? "#5f5d3d" : outfit === "coat" ? "#2a2a2a" : look.topShade;
  const legs = outfit === "suit" ? "#22252e" : outfit === "uniform" ? "#6e6b47" : look.legs;
  const shoes = outfit === "suit" || outfit === "uniform" ? "#111" : look.shoes;
  const coatLen = outfit === "coat" ? 18 : 0;
  const leg = (angle: number, back: boolean) => (
    <g transform={`translate(0,-38) rotate(${angle})`}>
      <path d="M-5 0 L5 0 L4.5 36 L-4 36 Z" fill={legs} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" opacity={back ? 0.85 : 1} />
      <path d="M-5 34 L9 34 Q11 38 8 40 L-5 40 Z" fill={shoes} stroke={INK} strokeWidth={1.4} />
    </g>
  );
  const arm = (side: 1 | -1, rot: number, len = 26) => (
    <g transform={`translate(${side * 9},-74) rotate(${rot})`}>
      <path d={`M0 0 L0 ${len}`} stroke={side === 1 ? top : shade} strokeWidth={7.5} strokeLinecap="round" />
      <circle cx={0} cy={len + 2} r={4} fill={look.skin} stroke={INK} strokeWidth={1.2} />
    </g>
  );
  const wave = Math.sin(frame * 0.35 + phase) * 18;
  const armBack = walking ? 8 - swing * 0.6 : pose === "hold" ? -40 : 6;
  const armFront = pose === "wave" ? -160 + wave : pose === "cheer" ? -165 + wave * 0.6 : pose === "hold" ? -55 : walking ? -8 + swing * 0.6 : -6;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${scale * facing},${scale})`}>
      <ellipse cx={0} cy={1} rx={13} ry={3} fill="#000" opacity={0.25} />
      {leg(-swing, true)}
      {leg(swing, false)}
      {arm(-1, armBack)}
      {/* torso */}
      <path d={`M-11 -76 Q-12 -58 -10 ${-36 + coatLen} L10 ${-36 + coatLen} Q12 -58 11 -76 Q0 -82 -11 -76 Z`} fill={top} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d={`M3 -78 Q9 -60 8 ${-37 + coatLen} L10 ${-36 + coatLen} Q12 -58 11 -76 Z`} fill={shade} />
      {outfit === "suit" && (
        <g>
          <path d="M-4 -77 L0 -64 L4 -77 Z" fill="#f2f2f2" />
          <path d="M-1.5 -72 L1.5 -72 L2 -58 L0 -55 L-2 -58 Z" fill="#8b1e2d" />
          <path d="M-4 -77 L-1 -62 M4 -77 L1 -62" stroke={INK} strokeWidth={1} />
        </g>
      )}
      {outfit === "uniform" && (
        <g>
          <rect x={-13} y={-78} width={8} height={3} fill="#d4af37" />
          <rect x={5} y={-78} width={8} height={3} fill="#d4af37" />
          <rect x={-8} y={-68} width={7} height={2} fill="#c0392b" />
          <rect x={-8} y={-65.5} width={7} height={2} fill="#2e86c1" />
          <rect x={-8} y={-63} width={7} height={2} fill="#27ae60" />
          <rect x={-11} y={-44} width={22} height={4} fill="#3b2f1f" />
          <rect x={-2} y={-45} width={4} height={6} fill="#d4af37" />
        </g>
      )}
      {outfit === "coat" && <line x1={0} y1={-77} x2={0} y2={-20} stroke="#111" strokeWidth={1.2} />}
      {/* head */}
      <rect x={-3} y={-84} width={6} height={7} fill={look.skin} />
      <g transform="translate(0,-94)">
        {hat === "hijab" ? (
          <g>
            <path d="M-13 2 Q-14 -16 0 -15 Q14 -16 13 2 L15 16 Q0 22 -15 16 Z" fill={look.top} stroke={INK} strokeWidth={1.6} />
            <ellipse cx={1} cy={1} rx={8} ry={9} fill={look.skin} />
          </g>
        ) : (
          <g>
            <ellipse cx={0} cy={0} rx={10} ry={11} fill={look.skin} stroke={INK} strokeWidth={1.6} />
            <path d="M-10 -1 Q-11 -14 0 -13 Q11 -13 10 -3 Q4 -8 -3 -7 Q-8 -6 -10 -1 Z" fill={look.hair} />
          </g>
        )}
        <circle cx={5} cy={0} r={1.3} fill={INK} />
        <path d="M3 6 Q6 7 8 5" stroke={INK} strokeWidth={1.2} fill="none" />
        {hat === "peaked" && (
          <g>
            <path d="M-12 -6 Q-12 -17 0 -17 Q13 -17 13 -6 Z" fill="#6e6b47" stroke={INK} strokeWidth={1.4} />
            <rect x={-12} y={-8} width={25} height={4} fill="#3b2f1f" />
            <path d="M4 -5 L17 -3 L4 -1 Z" fill="#1a1a1a" />
            <circle cx={1} cy={-11} r={2.4} fill="#d4af37" />
          </g>
        )}
        {hat === "beanie" && <path d="M-11 -3 Q-11 -18 0 -18 Q11 -18 11 -3 Z" fill="#b5332e" stroke={INK} strokeWidth={1.4} />}
        {hat === "cap" && (
          <g>
            <path d="M-10 -4 Q-10 -16 0 -16 Q10 -16 10 -4 Z" fill={look.topShade} stroke={INK} strokeWidth={1.4} />
            <path d="M4 -5 L18 -3 L4 -2 Z" fill={look.topShade} stroke={INK} strokeWidth={1} />
          </g>
        )}
      </g>
      {arm(1, armFront)}
      {pose === "hold" && holding && <g transform="translate(20,-66)">{holding}</g>}
    </g>
  );
};

// Small hand-held items.
export const Bowl = () => (
  <g>
    <path d="M-9 0 Q0 10 9 0 Z" fill="#e8e1d1" stroke={INK} strokeWidth={1.3} />
    <ellipse cx={0} cy={0} rx={9} ry={2} fill="#cfc6b2" stroke={INK} strokeWidth={1} />
  </g>
);
export const Ballot = () => (
  <g>
    <rect x={-6} y={-14} width={14} height={18} fill="#fff" stroke={INK} strokeWidth={1.2} />
    <path d="M-3 -9 L5 -9 M-3 -5 L5 -5 M-3 -1 L2 -1" stroke="#888" strokeWidth={1} />
    <path d="M-2 -10 L0 -7 L4 -12" stroke="#c1121f" strokeWidth={1.4} fill="none" />
  </g>
);
