import type { Feature } from "geojson";
import { geoCentroid } from "d3-geo";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { countries, country } from "../../../components/data";
import { useMap } from "../../../components/Map";
import { display, font, RED } from "./news";

// Extra Napoleonic-era pieces for ep01 chapters 1–2 (Toulon → the decision), drawn like kit/Period.tsx:
// side view, feet / waterline at y = 0, ~120 units tall at scale 1, two-tone fills + 1.5 px dark outline, small idle motion.
const INK = "#1b1d24";
const SKIN = "#efc6a2";
const GOLDEN = "#e2b84a";

type Fig = { x: number; y: number; scale?: number; phase?: number; flip?: boolean };

// Field gun: spoked wheel, trail, bronze barrel. `fire` 0 → 1 = muzzle flash and a puff of smoke.
export const Cannon = ({ x, y, scale = 1, flip = false, fire = 0, elev = -8 }: Fig & { fire?: number; elev?: number }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
    <ellipse cx={0} cy={1} rx={44} ry={4} fill="#000" opacity={0.3} />
    <path d="M-48 -2 L-4 -26 L2 -20 L-44 2 Z" fill="#6b4a2b" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    <g transform={`translate(0,-28) rotate(${elev})`}>
      <path d="M-26 -8 L44 -6 L46 -5 L46 5 L44 6 L-26 8 Q-34 0 -26 -8 Z" fill="#b5893a" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-26 2 L44 3 L44 6 L-26 8 Z" fill="#000" opacity={0.18} />
      <rect x={20} y={-7} width={4} height={14} fill="#8f6a2a" />
      {fire > 0 && (
        <g opacity={Math.max(0, 1 - fire * 1.2)}>
          <path d={`M46 0 L${66 + fire * 20} -14 L${60 + fire * 16} -2 L${76 + fire * 24} 4 L58 6 L${66 + fire * 18} 16 Z`} fill="#ffd36a" stroke="#ff7a1a" strokeWidth={2} />
        </g>
      )}
      {fire > 0 && <circle cx={60 + fire * 50} cy={-fire * 20} r={10 + fire * 22} fill="#e7e3da" opacity={0.75 * (1 - fire * 0.7)} />}
    </g>
    <circle cx={0} cy={-22} r={22} fill="none" stroke="#5a3c22" strokeWidth={5} />
    <circle cx={0} cy={-22} r={22} fill="none" stroke={INK} strokeWidth={1.3} />
    {[0, 45, 90, 135].map((a) => (
      <line key={a} x1={0} y1={-22} x2={22 * Math.cos((a * Math.PI) / 180)} y2={-22 + 22 * Math.sin((a * Math.PI) / 180)} stroke="#5a3c22" strokeWidth={2.5} />
    ))}
    {[0, 45, 90, 135].map((a) => (
      <line key={`b${a}`} x1={0} y1={-22} x2={-22 * Math.cos((a * Math.PI) / 180)} y2={-22 - 22 * Math.sin((a * Math.PI) / 180)} stroke="#5a3c22" strokeWidth={2.5} />
    ))}
    <circle cx={0} cy={-22} r={5} fill="#3a2a1c" stroke={INK} strokeWidth={1.2} />
  </g>
);

// Sailing ship, bow to the right. kind: "war" (three masts, gun ports) | "merchant" (two masts, cargo).
// flag: "british" (red ensign) | "neutral" (white with a blue band) | "russian" (white with a blue saltire) | "none".
export type ShipFlag = "british" | "neutral" | "russian" | "none";
export const Ship = ({ x, y, scale = 1, flip = false, phase = 0, kind = "war", flag = "british", sails = 1 }: Fig & { kind?: "war" | "merchant"; flag?: ShipFlag; sails?: number }) => {
  const frame = useCurrentFrame();
  const roll = Math.sin(frame * 0.05 + phase) * 1.6;
  const bob = Math.sin(frame * 0.07 + phase) * 2;
  const war = kind === "war";
  const masts = war ? [-60, 0, 58] : [-34, 30];
  const hull = war ? "#3a2a1e" : "#6b4a2b";
  const top = war ? -150 : -120;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -scale : scale},${scale}) rotate(${roll})`}>
      {/* hull */}
      <path d={war ? "M-110 -40 L112 -40 L128 -52 L118 -18 Q110 6 80 8 L-90 8 Q-108 4 -112 -14 Z" : "M-80 -30 L84 -30 L98 -40 L88 -10 Q80 6 56 7 L-62 7 Q-78 4 -82 -10 Z"} fill={hull} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      {war && <rect x={-104} y={-32} width={212} height={9} fill="#e2c24a" stroke={INK} strokeWidth={1} />}
      {war && Array.from({ length: 9 }, (_, i) => <rect key={i} x={-92 + i * 22} y={-31} width={8} height={7} fill={INK} />)}
      {war && <rect x={-108} y={-62} width={34} height={24} fill={hull} stroke={INK} strokeWidth={1.4} />}
      {!war && (
        <g>
          <rect x={-40} y={-44} width={22} height={14} fill="#c9a36a" stroke={INK} strokeWidth={1.2} />
          <rect x={-14} y={-46} width={22} height={16} fill="#d9c79a" stroke={INK} strokeWidth={1.2} />
          <rect x={12} y={-42} width={22} height={12} fill="#a87d4a" stroke={INK} strokeWidth={1.2} />
        </g>
      )}
      {/* bowsprit */}
      <line x1={war ? 118 : 90} y1={war ? -48 : -36} x2={war ? 170 : 128} y2={war ? -72 : -56} stroke="#4a3424" strokeWidth={3} />
      {/* masts + sails */}
      {masts.map((mx, i) => {
        const h = war ? (i === 1 ? 190 : 160) : i === 0 ? 140 : 125;
        const w = war ? 60 : 50;
        return (
          <g key={mx}>
            <line x1={mx} y1={war ? -40 : -30} x2={mx} y2={-h} stroke="#4a3424" strokeWidth={3.5} />
            {sails > 0 &&
              [0.28, 0.58].map((f, j) => {
                const sy = -h + (h - 40) * f - 20;
                const sw = w * (1 - j * 0.0) * (j ? 1 : 0.82);
                const sh = (h - 60) * 0.28;
                return <path key={j} d={`M${mx - sw / 2} ${sy} Q${mx + 6} ${sy + sh * 0.5} ${mx - sw / 2} ${sy + sh} L${mx + sw / 2} ${sy + sh} Q${mx + sw / 2 + 10} ${sy + sh * 0.5} ${mx + sw / 2} ${sy} Z`} fill="#efe9da" stroke={INK} strokeWidth={1.3} opacity={sails} />;
              })}
          </g>
        );
      })}
      {/* ensign at the stern */}
      {flag !== "none" && (
        <g transform={`translate(${war ? -112 : -82},${war ? -62 : -30})`}>
          <line x1={0} y1={0} x2={0} y2={-34} stroke="#4a3424" strokeWidth={2.5} />
          <ShipEnsign flag={flag} x={-34} y={-34} w={34} h={22} wave={Math.sin(frame * 0.2 + phase) * 2} />
        </g>
      )}
      {flag !== "none" && <ShipEnsign flag={flag} x={masts[1] - 0} y={top - (war ? 52 : 34)} w={24} h={14} wave={Math.sin(frame * 0.2 + phase + 1) * 1.5} />}
    </g>
  );
};

const ShipEnsign = ({ flag, x, y, w, h, wave }: { flag: ShipFlag; x: number; y: number; w: number; h: number; wave: number }) => {
  const d = `M${x} ${y} Q${x + w / 2} ${y + wave} ${x + w} ${y} L${x + w} ${y + h} Q${x + w / 2} ${y + h + wave} ${x} ${y + h} Z`;
  const id = `ens-${flag}-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={flag === "british" ? "#c8312b" : "#f4f2ea"} stroke={INK} strokeWidth={1} />
      <g clipPath={`url(#${id})`}>
        {flag === "british" && (
          <g>
            <rect x={x + w / 2} y={y - 2} width={w / 2 + 2} height={h / 2 + 2} fill="#1f3566" />
            <line x1={x + w / 2} y1={y + h / 4} x2={x + w} y2={y + h / 4} stroke="#fff" strokeWidth={h * 0.14} />
            <line x1={x + w * 0.75} y1={y} x2={x + w * 0.75} y2={y + h / 2} stroke="#fff" strokeWidth={h * 0.14} />
            <line x1={x + w / 2} y1={y + h / 4} x2={x + w} y2={y + h / 4} stroke="#c8312b" strokeWidth={h * 0.06} />
          </g>
        )}
        {flag === "neutral" && <rect x={x} y={y + h * 0.36} width={w} height={h * 0.28} fill="#2f6fb3" />}
        {flag === "russian" && (
          <g>
            <line x1={x} y1={y} x2={x + w} y2={y + h} stroke="#2f6fb3" strokeWidth={h * 0.2} />
            <line x1={x + w} y1={y} x2={x} y2={y + h} stroke="#2f6fb3" strokeWidth={h * 0.2} />
          </g>
        )}
      </g>
    </g>
  );
};

// Flag on a pole (feet at y = 0). colors = vertical stripes; eagle = gold eagle finial (French standard).
export const Flag = ({ x, y, s, colors = ["#2c4a8c", "#f4f2ea", "#c8312b"], eagle = false, h = 150, phase = 0, horizontal = false }: { x: number; y: number; s: number; colors?: string[]; eagle?: boolean; h?: number; phase?: number; horizontal?: boolean }) => {
  const frame = useCurrentFrame();
  const w = 70;
  const fh = 46;
  const wave = (k: number) => Math.sin(frame * 0.15 + phase + k * 2) * 5;
  const top = -h + 6;
  const band = (i: number) => {
    const y0 = top + (fh / colors.length) * i;
    const y1 = top + (fh / colors.length) * (i + 1);
    return `M0 ${y0 + wave(0)} Q${w / 2} ${y0 + wave(0.5) * 2 - wave(0)} ${w} ${y0 + wave(1)} L${w} ${y1 + wave(1)} Q${w / 2} ${y1 + wave(0.5) * 2 - wave(0)} 0 ${y1 + wave(0)} Z`;
  };
  const strip = (i: number) => {
    const x0 = (w / colors.length) * i;
    const x1 = (w / colors.length) * (i + 1);
    return `M${x0} ${top + wave(x0 / w)} L${x1} ${top + wave(x1 / w)} L${x1} ${top + fh + wave(x1 / w)} L${x0} ${top + fh + wave(x0 / w)} Z`;
  };
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <line x1={0} y1={0} x2={0} y2={-h - (eagle ? 4 : 0)} stroke="#4a3424" strokeWidth={3} />
      {colors.map((c, i) => <path key={i} d={horizontal ? band(i) : strip(i)} fill={c} stroke={INK} strokeWidth={1} />)}
      {eagle && (
        <g transform={`translate(0,${-h - 6})`}>
          <path d="M0 -4 L-14 -16 L-6 -6 L-16 -4 L-4 0 L0 -2 L4 0 L16 -4 L6 -6 L14 -16 Z" fill={GOLDEN} stroke={INK} strokeWidth={1.2} />
          <circle cx={0} cy={-10} r={3.5} fill={GOLDEN} stroke={INK} strokeWidth={1} />
          <rect x={-6} y={0} width={12} height={5} fill={GOLDEN} stroke={INK} strokeWidth={1} />
        </g>
      )}
    </g>
  );
};

// Imperial crown: gold band, arches, orb and cross.
export const Crown = ({ x, y, s, glow = 0 }: { x: number; y: number; s: number; glow?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {glow > 0 && <circle cx={0} cy={-14} r={34} fill="#ffe08a" opacity={0.35 * glow} />}
    <path d="M-20 0 L20 0 L22 -10 L-22 -10 Z" fill={GOLDEN} stroke={INK} strokeWidth={1.4} />
    <path d="M-20 -10 Q-18 -32 0 -34 Q18 -32 20 -10 Z" fill="#b8322a" stroke={INK} strokeWidth={1.3} />
    <path d="M-20 -10 Q-16 -34 0 -36 M20 -10 Q16 -34 0 -36 M0 -10 L0 -36" stroke={GOLDEN} strokeWidth={4} fill="none" />
    <circle cx={0} cy={-40} r={5} fill={GOLDEN} stroke={INK} strokeWidth={1.2} />
    <path d="M0 -45 L0 -54 M-4 -50 L4 -50" stroke={GOLDEN} strokeWidth={2.5} />
    {[-12, 0, 12].map((cx) => <circle key={cx} cx={cx} cy={-5} r={2.4} fill={cx ? "#2f6fb3" : "#c8312b"} />)}
  </g>
);

// Napoleon in his coronation robes, arms raised; the crown sits `k` of the way down onto his head (0 = held high).
export const Emperor = ({ x, y, scale = 1, flip = false, k = 0 }: Fig & { k?: number }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.06) * 0.6;
  const lift = (1 - k) * 34;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={1} rx={30} ry={4} fill="#000" opacity={0.3} />
      {/* mantle: red velvet with ermine edge */}
      <path d="M-14 -96 Q-34 -40 -36 0 L30 0 Q26 -40 14 -96 Z" fill="#a8232a" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-36 0 L30 0 L30 -8 L-36 -8 Z" fill="#f4f2ea" stroke={INK} strokeWidth={1.2} />
      {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-32 + i * 9} y={-6} width={2} height={4} fill={INK} />)}
      {[[-26, -50], [-18, -30], [10, -60], [18, -24], [-6, -70]].map(([bx, by], i) => <path key={i} d={`M${bx} ${by} l3 -5 l3 5 l-3 3 z`} fill={GOLDEN} />)}
      {/* white satin robe */}
      <path d="M-8 -90 L8 -90 L12 -4 L-12 -4 Z" fill="#f1ece0" stroke={INK} strokeWidth={1.2} />
      <path d="M-14 -96 Q0 -88 14 -96 L12 -86 Q0 -80 -12 -86 Z" fill="#f4f2ea" stroke={INK} strokeWidth={1.2} />
      {/* arms raised to the crown */}
      <path d={`M-10 -90 Q-22 -110 -12 ${-136 + lift * 0.4}`} stroke="#a8232a" strokeWidth={8} strokeLinecap="round" fill="none" />
      <path d={`M10 -90 Q22 -110 12 ${-136 + lift * 0.4}`} stroke="#a8232a" strokeWidth={8} strokeLinecap="round" fill="none" />
      <rect x={-3} y={-102} width={7} height={8} fill={SKIN} />
      <g transform="translate(1,-114)">
        <ellipse cx={0} cy={0} rx={10} ry={11} fill={SKIN} stroke={INK} strokeWidth={1.5} />
        <circle cx={5} cy={0} r={1.3} fill={INK} />
        <path d="M3 6 Q6 6 8 5" stroke={INK} strokeWidth={1.1} fill="none" />
        <path d="M-9 -4 Q-6 -11 3 -9" stroke="#3a2a20" strokeWidth={3} fill="none" />
        {/* gold laurel */}
        <path d="M-10 -6 Q0 -12 10 -6" stroke={GOLDEN} strokeWidth={3} fill="none" />
        {[-8, -3, 2, 7].map((lx) => <ellipse key={lx} cx={lx} cy={-9} rx={2.4} ry={1.4} fill={GOLDEN} />)}
      </g>
      <circle cx={-12} cy={-136 + lift * 0.4} r={3.6} fill={SKIN} stroke={INK} strokeWidth={1.1} />
      <circle cx={12} cy={-136 + lift * 0.4} r={3.6} fill={SKIN} stroke={INK} strokeWidth={1.1} />
      <Crown x={1} y={-122 - lift} s={0.62} glow={k} />
    </g>
  );
};

// Tsar Alexander I: dark green coat, gold epaulettes, white breeches, tall boots, plumed bicorne.
export const Tsar = ({ x, y, scale = 1, flip = false, phase = 0, wave = 0 }: Fig & { wave?: number }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.06 + phase) * 0.6;
  const arm = wave > 0 ? -60 - Math.sin(frame * 0.2) * 10 * wave : 0;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={1} rx={15} ry={3} fill="#000" opacity={0.3} />
      <path d="M-6 -44 L-5 0 L4 0 L5 -44 Z" fill="#f1efe6" stroke={INK} strokeWidth={1.4} />
      <path d="M-7 -22 L-6 2 L10 2 L9 -2 L4 -2 L4 -22 Z" fill="#1c1c22" stroke={INK} strokeWidth={1.2} />
      <path d="M-12 -94 Q-14 -66 -12 -44 L-16 -30 L-8 -34 L-6 -44 L12 -44 Q13 -66 11 -94 Q0 -99 -12 -94 Z" fill="#24442e" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-11 -92 L11 -50" stroke="#4a7fc0" strokeWidth={4} />
      <path d="M-12 -52 L12 -52" stroke={GOLDEN} strokeWidth={3} />
      <path d="M-1 -94 L5 -94 L5 -50 L-1 -50 Z" fill="#b8322a" opacity={0.5} />
      <ellipse cx={-9} cy={-92} rx={7} ry={3.5} fill={GOLDEN} stroke={INK} strokeWidth={1} />
      <ellipse cx={9} cy={-92} rx={7} ry={3.5} fill={GOLDEN} stroke={INK} strokeWidth={1} />
      <g transform={`translate(8,-88) rotate(${arm})`}>
        <path d="M0 0 L2 30" stroke="#24442e" strokeWidth={7.5} strokeLinecap="round" />
        <circle cx={2} cy={32} r={3.6} fill={SKIN} stroke={INK} strokeWidth={1.1} />
      </g>
      <rect x={-3} y={-102} width={7} height={8} fill={SKIN} />
      <g transform="translate(1,-113)">
        <ellipse cx={0} cy={0} rx={10} ry={11} fill={SKIN} stroke={INK} strokeWidth={1.5} />
        <circle cx={5} cy={0} r={1.3} fill={INK} />
        <path d="M3 6 Q6 6 8 5" stroke={INK} strokeWidth={1.1} fill="none" />
        <path d="M-9 4 Q-10 -6 -4 -9" stroke="#c99a5a" strokeWidth={3} fill="none" />
        {/* bicorne worn fore-and-aft with a white plume */}
        <path d="M-16 -6 Q-10 -24 0 -26 Q10 -24 16 -6 Q0 -12 -16 -6 Z" fill="#141418" stroke={INK} strokeWidth={1.3} />
        <path d="M-12 -14 Q-2 -30 12 -14" stroke="#f4f2ea" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

// The Tilsit raft (June 1807): log raft with a white pavilion, monograms N and A on the gables.
export const RaftPavilion = ({ x, y, s, k = 1 }: { x: number; y: number; s: number; k?: number }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.06) * 1.5;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${s})`} opacity={k}>
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-170 + i * 38} y={-10} width={36} height={16} rx={7} fill={i % 2 ? "#7a5634" : "#8a6440"} stroke={INK} strokeWidth={1.3} />)}
      <rect x={-172} y={-14} width={344} height={6} fill="#5a4030" stroke={INK} strokeWidth={1} />
      {/* pavilion */}
      <rect x={-110} y={-110} width={220} height={98} fill="#f1ece0" stroke={INK} strokeWidth={1.5} />
      {[-80, -40, 0, 40, 80].map((cx) => <line key={cx} x1={cx} y1={-108} x2={cx} y2={-14} stroke="#d8d0bc" strokeWidth={3} />)}
      <path d="M-20 -14 L-20 -80 Q0 -96 20 -80 L20 -14 Z" fill="#3a2a20" opacity={0.75} />
      <path d="M-124 -108 L0 -150 L124 -108 Z" fill="#e6dfcd" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      {[[-60, "N"], [60, "A"]].map(([gx, t]) => (
        <g key={String(t)}>
          <circle cx={gx as number} cy={-124} r={11} fill="#2f5a3a" stroke={GOLDEN} strokeWidth={2} />
          <text x={gx as number} y={-119} textAnchor="middle" fontSize={15} fontWeight={900} fill={GOLDEN} fontFamily="serif">{t as string}</text>
        </g>
      ))}
      <Flag x={-120} y={-108} s={0.6} h={80} phase={1} />
      <Flag x={120} y={-108} s={0.6} h={80} colors={["#f4f2ea", "#2f6fb3", "#c8312b"]} phase={2} />
    </g>
  );
};

// Crossed sabres badge (screen units), e.g. for a battle on the map.
export const Sabres = ({ x, y, size = 40, k = 1, color = "#ffc94a" }: { x: number; y: number; size?: number; k?: number; color?: string }) => {
  if (k <= 0) return null;
  const blade = (sign: number) => (
    <g transform={`rotate(${sign * 40})`}>
      <path d={`M${-3 * sign} 26 Q${8 * sign} -6 ${-2 * sign} -30 Q${3 * sign} -4 ${3 * sign} 26 Z`} fill="#e9eef2" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <rect x={-9} y={24} width={18} height={4} rx={2} fill={GOLDEN} stroke={INK} strokeWidth={1} />
      <rect x={-2.5} y={28} width={5} height={12} rx={2} fill="#4a3424" stroke={INK} strokeWidth={1} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${(size / 40) * k})`}>
      <circle r={30} fill="rgba(8,14,26,0.85)" stroke={color} strokeWidth={3} />
      <g transform="translate(0,-4) scale(0.75)">
        {blade(1)}
        {blade(-1)}
      </g>
    </g>
  );
};

// Cargo props (feet at y = 0).
export const Sack = ({ x, y, s, rot = 0, rotten = 0 }: { x: number; y: number; s: number; rot?: number; rotten?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-16 0 Q-20 -24 -10 -36 L-12 -42 L12 -42 L10 -36 Q20 -24 16 0 Z" fill={rotten ? "#9c8a5c" : "#d8c08a"} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
    <path d="M-11 -37 L11 -37" stroke="#7a5a3a" strokeWidth={2.5} />
    {rotten > 0 && [[-6, -14], [5, -22], [8, -8]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={3.5} fill="#5a6a3a" opacity={rotten} />)}
  </g>
);
export const Logs = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[[0, -10], [22, -10], [44, -10], [11, -30], [33, -30], [22, -50]].map(([lx, ly], i) => (
      <g key={i}>
        <rect x={lx - 60} y={ly - 10} width={60} height={20} fill="#8a6440" stroke={INK} strokeWidth={1.2} />
        <circle cx={lx} cy={ly} r={10} fill="#d9b27a" stroke={INK} strokeWidth={1.3} />
        <circle cx={lx} cy={ly} r={4} fill="none" stroke="#a87d4a" strokeWidth={1} />
      </g>
    ))}
  </g>
);
export const Bale = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-22} y={-36} width={44} height={36} rx={6} fill="#b8a46a" stroke={INK} strokeWidth={1.4} />
    {[-10, 0, 10].map((ly) => <line key={ly} x1={-20} y1={-18 + ly} x2={20} y2={-18 + ly} stroke="#8a7a4a" strokeWidth={1.2} />)}
    <line x1={-8} y1={-36} x2={-8} y2={0} stroke="#5a4030" strokeWidth={2.5} />
    <line x1={8} y1={-36} x2={8} y2={0} stroke="#5a4030" strokeWidth={2.5} />
  </g>
);
export const Crate = ({ x, y, s, label, color = "#a87d4a" }: { x: number; y: number; s: number; label?: string; color?: string }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-26} y={-44} width={52} height={44} fill={color} stroke={INK} strokeWidth={1.5} />
    <path d="M-26 -44 L26 0 M26 -44 L-26 0" stroke="#7a5634" strokeWidth={2} />
    <rect x={-26} y={-44} width={52} height={44} fill="none" stroke={INK} strokeWidth={1.5} />
    {label && <text x={0} y={-16} textAnchor="middle" fontSize={11} fontWeight={900} fill="#fff" stroke={INK} strokeWidth={2.5} paintOrder="stroke">{label}</text>}
  </g>
);

// Wooden quay along the bottom of a panel, with bollards. Deck top at `y`.
export const Quay = ({ x, y, W, s }: { x: number; y: number; W: number; s: number }) => (
  <g>
    <rect x={x} y={y} width={W} height={60 * s} fill="#6b4a2b" />
    <rect x={x} y={y} width={W} height={8 * s} fill="#8a6440" stroke={INK} strokeWidth={1.2 * s} />
    {Array.from({ length: Math.ceil(W / (60 * s)) }, (_, i) => <line key={i} x1={x + i * 60 * s} y1={y + 8 * s} x2={x + i * 60 * s} y2={y + 60 * s} stroke="#4a3424" strokeWidth={2 * s} />)}
  </g>
);

// Napoleon's map table: table, spread map with a red arrow, compass, candle. Table top at y - 70·s.
export const MapTable = ({ x, y, s, arrow = 1 }: { x: number; y: number; s: number; arrow?: number }) => {
  const frame = useCurrentFrame();
  const flick = 1 + Math.sin(frame * 0.5) * 0.15;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-120} y={-70} width={10} height={70} fill="#4a3424" stroke={INK} strokeWidth={1.2} />
      <rect x={110} y={-70} width={10} height={70} fill="#4a3424" stroke={INK} strokeWidth={1.2} />
      <rect x={-130} y={-78} width={260} height={12} fill="#6b4a2b" stroke={INK} strokeWidth={1.4} />
      <path d="M-110 -78 L110 -78 L96 -96 L-96 -96 Z" fill="#e8dcb8" stroke={INK} strokeWidth={1.3} />
      <path d="M-80 -86 Q-40 -92 0 -86 T80 -90" stroke="#7fa6c0" strokeWidth={2} fill="none" />
      <path d="M-70 -84 L60 -91" stroke="#c8312b" strokeWidth={3} strokeDasharray={`${8 * Math.min(1, arrow)} 5`} opacity={arrow} />
      <path d="M58 -95 L68 -91 L58 -87 Z" fill="#c8312b" opacity={arrow} />
      <circle cx={-40} cy={-84} r={3} fill="#2c4a8c" />
      <rect x={96} y={-118} width={8} height={22} fill="#f1ece0" stroke={INK} strokeWidth={1} />
      <ellipse cx={100} cy={-124} rx={3.5 * flick} ry={6 * flick} fill="#ffcf5a" />
      <circle cx={100} cy={-124} r={20} fill="#ffcf5a" opacity={0.15} />
    </g>
  );
};

// Palace front for Paris: columns, pediment, steps (base at y).
export const Palace = ({ x, y, s, W = 420 }: { x: number; y: number; s: number; W?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-W / 2} y={-150} width={W} height={150} fill="#e3d9c2" stroke={INK} strokeWidth={1.5} />
    <rect x={-W / 2} y={-160} width={W} height={12} fill="#cfc3a8" stroke={INK} strokeWidth={1.2} />
    <path d={`M-90 -160 L0 -205 L90 -160 Z`} fill="#d6cab0" stroke={INK} strokeWidth={1.5} />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-75 + i * 28} y={-148} width={12} height={136} fill="#f1ece0" stroke={INK} strokeWidth={1} />)}
    {[-W / 2 + 30, -W / 2 + 80, W / 2 - 110, W / 2 - 60].map((wx) => (
      <g key={wx}>
        <rect x={wx} y={-130} width={30} height={46} fill="#5a6a7a" stroke={INK} strokeWidth={1} />
        <rect x={wx} y={-66} width={30} height={46} fill="#5a6a7a" stroke={INK} strokeWidth={1} />
      </g>
    ))}
    <rect x={-W / 2 - 10} y={-12} width={W + 20} height={12} fill="#bfb59e" stroke={INK} strokeWidth={1.2} />
  </g>
);

// Wavy sea band with glints, horizon at y.
export const Sea = ({ x, y, W, H, s, color = "#2f5f80" }: { x: number; y: number; W: number; H: number; s: number; color?: string }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={x} y={y} width={W} height={H} fill={color} />
      {Array.from({ length: 22 }, (_, i) => {
        const gx = x + ((random(`sa${i}`) * W + frame * (0.4 + random(`sb${i}`) * 0.6)) % W);
        const gy = y + 6 * s + random(`sc${i}`) * (H - 10 * s);
        return <path key={i} d={`M${gx} ${gy} q${8 * s} ${-4 * s} ${16 * s} 0 t${16 * s} 0`} stroke="#cfe6f5" strokeWidth={2 * s} fill="none" opacity={0.35} />;
      })}
    </g>
  );
};

// Low hills / town silhouette for a harbour backdrop.
export const Hills = ({ x, W, ground, s, color = "#6b7a5a" }: { x: number; W: number; ground: number; s: number; color?: string }) => (
  <path d={`M${x} ${ground} Q${x + W * 0.15} ${ground - 90 * s} ${x + W * 0.32} ${ground - 40 * s} Q${x + W * 0.5} ${ground - 120 * s} ${x + W * 0.7} ${ground - 50 * s} Q${x + W * 0.85} ${ground - 80 * s} ${x + W} ${ground - 30 * s} L${x + W} ${ground} Z`} fill={color} />
);

// ---- Map helpers for chapters 1–2 (drawn inside <MapFrame>) ----

// Land mask for Europe from today's coastlines (Natural Earth via world-atlas), so hand-drawn approximate
// areas can be loose at sea and still end at the coast. Use once per chapter: <LandClip id="..." />.
const EU_LAND = countries.features.filter((f) => {
  if (String(f.id) === "643") return true; // Russia crosses the antimeridian
  const [lon, lat] = geoCentroid(f);
  return lon > -25 && lon < 60 && lat > 30 && lat < 72;
});
export const LandClip = ({ id }: { id: string }) => {
  const { path } = useMap();
  return (
    <defs>
      <clipPath id={id}>
        {EU_LAND.map((f, i) => <path key={i} d={path(f) ?? ""} />)}
      </clipPath>
    </defs>
  );
};

// Approximate area: soft fill + glowing dashed edge, clipped to land. Always pair with an "approximate" note.
export const SoftArea = ({ feature, color, k, clip, fill = 0.42, edge = color, dash = true }: { feature: Feature; color: string; k: number; clip?: string; fill?: number; edge?: string; dash?: boolean }) => {
  const { path, s } = useMap();
  if (k <= 0) return null;
  const d = path(feature) ?? "";
  return (
    <g opacity={Math.min(1, k)} clipPath={clip ? `url(#${clip})` : undefined}>
      <path d={d} fill={color} fillOpacity={fill} />
      <path d={d} fill="none" stroke={edge} strokeWidth={9 * s} strokeOpacity={0.3} style={{ filter: `blur(${4 * s}px)` }} />
      <path d={d} fill="none" stroke={edge} strokeWidth={3 * s} strokeDasharray={dash ? `${12 * s} ${8 * s}` : undefined} strokeOpacity={0.95} />
    </g>
  );
};

// Small outlined map text (screen y as a share of the height), e.g. "Borders approximate".
export const MapNote = ({ text, k, y = 0.535, x = 0.06, size = 26, anchor = "start" }: { text: string; k: number; y?: number; x?: number; size?: number; anchor?: "start" | "middle" | "end" }) => {
  const { width, height, s } = useMap();
  if (k <= 0) return null;
  return (
    <text x={width * x} y={height * y} textAnchor={anchor} opacity={k} fontFamily={font} fontWeight={700} fontSize={size * s} fill="#fff" stroke="#0b1020" strokeWidth={7 * s} paintOrder="stroke" strokeLinejoin="round">
      {text}
    </text>
  );
};

// Area name in big outlined letters at a [lon, lat].
export const AreaName = ({ at, text, k, color = "#fff", size = 1 }: { at: [number, number]; text: string; k: number; color?: string; size?: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const xy = projection(at);
  if (!xy) return null;
  return (
    <text x={xy[0]} y={xy[1]} textAnchor="middle" opacity={Math.min(1, k)} fontFamily={display} fontWeight={700} fontSize={50 * s * size} letterSpacing={2 * s} fill={color} stroke="#0b1020" strokeWidth={9 * s} paintOrder="stroke" strokeLinejoin="round">
      {text.toUpperCase()}
    </text>
  );
};

// Crossed sabres on a map point, popping in with a spring.
export const BattleMark = ({ at, start, end = Infinity, size = 46 }: { at: [number, number]; start: number; end?: number; size?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { projection, s } = useMap();
  if (frame < start || frame > end) return null;
  const xy = projection(at);
  if (!xy) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 10, mass: 0.6 } }) * interpolate(frame, [end - 10, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <Sabres x={xy[0]} y={xy[1]} size={size * s} k={k} />;
};

// Approximate areas around 1810, hand-drawn [lon, lat] rings (loose at sea: clip with LandClip).
// Rough sketches for a news map, not surveyed borders: always show "approximate" with them.
export const AREA_1810 = {
  // French Empire: France, the Low Countries, the North Sea coast to Lübeck, the Rhine's left bank, Piedmont to Rome.
  empire: [[-1.8, 43.4], [-6, 46], [-6, 49], [-1, 50.5], [2.5, 51.6], [4.2, 53.4], [7, 54.3], [8.4, 54.6], [10.9, 54.4], [10.9, 53.6], [10.4, 53.2], [9.4, 52.6], [8.3, 52.0], [6.8, 51.4], [7.4, 50.4], [8.2, 49.9], [8.1, 48.9], [7.6, 47.6], [6.9, 47.4], [6.0, 46.3], [7.0, 45.9], [8.5, 45.4], [9.1, 44.9], [9.8, 44.5], [11.8, 44.0], [12.5, 43.5], [13.0, 42.8], [14.0, 42.0], [13.5, 41.2], [12.0, 40.5], [9.5, 41.5], [9.6, 43.2], [7.5, 43.2], [5.9, 42.6], [3.4, 42.4], [1.7, 42.5], [0.0, 42.7]],
  // the Illyrian Provinces on the Adriatic
  illyria: [[13.4, 46.6], [15.6, 46.5], [16.2, 45.5], [16.5, 44.4], [18.6, 42.3], [17.2, 42.4], [15.2, 43.6], [14.0, 44.8], [13.5, 45.6]],
  // satellites
  spain: [[-1.8, 43.4], [0.0, 42.7], [1.7, 42.5], [3.4, 42.4], [4.5, 41.0], [0.5, 39.5], [0.2, 37.5], [-2, 36.2], [-5.6, 35.6], [-7.4, 37.2], [-7.0, 38.2], [-7.3, 39.6], [-6.9, 41.9], [-8.9, 41.9], [-9.8, 43.8]],
  rhine: [[8.2, 49.9], [7.4, 50.4], [6.8, 51.4], [8.3, 52.0], [9.4, 52.6], [10.4, 53.2], [10.9, 53.6], [10.9, 54.4], [12.4, 54.6], [13.0, 54.0], [12.3, 53.2], [12.2, 52.3], [13.4, 51.8], [15.0, 51.3], [14.8, 50.9], [12.3, 50.3], [13.8, 48.8], [13.0, 47.5], [12.3, 47.0], [11.2, 46.6], [10.4, 46.8], [9.6, 47.5], [7.6, 47.6], [8.1, 48.9]],
  swiss: [[6.0, 46.3], [6.9, 47.4], [7.6, 47.6], [9.6, 47.5], [10.4, 46.8], [9.0, 45.9], [7.0, 45.9]],
  italy: [[8.5, 45.4], [9.0, 45.9], [10.4, 46.8], [11.2, 46.6], [12.3, 47.0], [13.4, 46.6], [13.5, 45.6], [12.6, 45.0], [13.9, 43.4], [14.4, 42.6], [13.0, 42.8], [12.5, 43.5], [11.8, 44.0], [9.8, 44.5], [9.1, 44.9]],
  naples: [[13.5, 41.2], [14.0, 42.0], [14.4, 42.6], [15.5, 42.2], [16.5, 41.6], [18.8, 40.2], [16.8, 37.6], [15.4, 37.8], [15.4, 40.0], [14.0, 40.6]],
  warsaw: [[15.8, 52.3], [16.4, 53.2], [17.6, 53.4], [19.4, 53.4], [20.6, 53.2], [22.6, 53.4], [23.2, 54.2], [23.9, 53.8], [23.8, 53.1], [23.6, 52.4], [23.9, 51.6], [24.1, 50.8], [23.1, 50.3], [22.0, 50.3], [21.2, 50.3], [19.9, 50.0], [19.2, 50.3], [18.6, 51.0], [17.6, 51.4], [16.6, 51.8]],
  // Russian Empire, western part (the rest runs off-screen)
  russia: [[21.0, 56.0], [22.4, 55.2], [23.2, 54.9], [24.0, 55.0], [23.9, 53.8], [23.8, 53.1], [23.6, 52.4], [23.9, 51.6], [24.1, 50.8], [25.6, 50.2], [26.6, 48.6], [28.2, 48.2], [30.0, 46.4], [33, 45], [45, 44], [60, 50], [60, 70], [31, 70], [29.5, 64], [28.5, 61], [24, 66], [21.5, 63.5], [21.2, 60.5], [21.5, 58]],
  // the Russian side of the Duchy's border (for a red edge)
  border: [[23.2, 54.2], [23.9, 53.8], [23.8, 53.1], [23.6, 52.4], [23.9, 51.6], [24.1, 50.8]],
} satisfies Record<string, [number, number][]>;

// Britain (with Ireland, part of the United Kingdom then) in a red glow.
const UK = [country("826"), country("372")];
export const BritainGlow = ({ k }: { k: number }) => {
  const { path, s } = useMap();
  if (k <= 0) return null;
  return (
    <g opacity={Math.min(1, k)}>
      {UK.map((f, i) => {
        const d = path(f) ?? "";
        return (
          <g key={i}>
            <path d={d} fill={RED} fillOpacity={0.4} />
            <path d={d} fill="none" stroke={RED} strokeWidth={10 * s} strokeOpacity={0.4} style={{ filter: `blur(${5 * s}px)` }} />
            <path d={d} fill="none" stroke="#ff9a90" strokeWidth={2.5 * s} />
          </g>
        );
      })}
    </g>
  );
};

// A drawn line through [lon, lat] points, grown 0 → k by length (screen space). For barriers and borders.
export const MapLine = ({ pts, k, color, width = 6, dash, glow = true, opacity = 1 }: { pts: [number, number][]; k: number; color: string; width?: number; dash?: string; glow?: boolean; opacity?: number }) => {
  const { projection, s } = useMap();
  if (k <= 0 || opacity <= 0) return null;
  const xy = pts.map((p) => projection(p)).filter((p): p is [number, number] => !!p);
  const seg = xy.slice(1).map((p, i) => Math.hypot(p[0] - xy[i][0], p[1] - xy[i][1]));
  let left = seg.reduce((a, b) => a + b, 0) * Math.min(1, k);
  const out: [number, number][] = [xy[0]];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const t = Math.min(1, left / (seg[i] || 1));
    out.push([xy[i][0] + (xy[i + 1][0] - xy[i][0]) * t, xy[i][1] + (xy[i + 1][1] - xy[i][1]) * t]);
    left -= seg[i];
  }
  const d = out.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  return (
    <g opacity={opacity} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {glow && <path d={d} stroke={color} strokeWidth={width * 3 * s} strokeOpacity={0.35} style={{ filter: `blur(${5 * s}px)` }} />}
      <path d={d} stroke="#1b1d24" strokeWidth={(width + 3) * s} strokeDasharray={dash} />
      <path d={d} stroke={color} strokeWidth={width * s} strokeDasharray={dash} />
    </g>
  );
};

// Dagger (screen units), point along +x before rotation.
export const Dagger = ({ x, y, size = 60, rot = 0, k = 1 }: { x: number; y: number; size?: number; rot?: number; k?: number }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${(size / 60) * k})`}>
      <path d="M-4 -6 L40 -4 L56 0 L40 4 L-4 6 Z" fill="#e9eef2" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M-4 0 L52 0" stroke="#aab4bc" strokeWidth={1.4} />
      <rect x={-8} y={-16} width={6} height={32} rx={2} fill={GOLDEN} stroke={INK} strokeWidth={1.4} />
      <rect x={-30} y={-5} width={22} height={10} rx={3} fill="#4a3424" stroke={INK} strokeWidth={1.4} />
      <circle cx={-32} cy={0} r={6} fill={GOLDEN} stroke={INK} strokeWidth={1.4} />
    </g>
  );
};

// A treaty scroll that tears in two (tear 0 → 1).
export const Scroll = ({ x, y, s, tear = 0, title = "TREATY", sub = "" }: { x: number; y: number; s: number; tear?: number; title?: string; sub?: string }) => {
  const half = (side: number) => (
    <g transform={`translate(${side * tear * 60},${tear * 20}) rotate(${side * tear * 12})`}>
      <clipPath id={`scroll${side}`}>
        <path d={side < 0 ? "M-120 -100 L4 -100 L-8 -60 L8 -20 L-6 20 L6 60 L-4 100 L-120 100 Z" : "M4 -100 L120 -100 L120 100 L-4 100 L6 60 L-6 20 L8 -20 L-8 -60 Z"} />
      </clipPath>
      <g clipPath={`url(#scroll${side})`}>
        <rect x={-100} y={-90} width={200} height={180} fill="#efe3c0" stroke={INK} strokeWidth={1.6} />
        <text x={0} y={-50} textAnchor="middle" fontFamily="serif" fontWeight={700} fontSize={24} fill="#3a2a1c">{title}</text>
        <text x={0} y={-22} textAnchor="middle" fontFamily="serif" fontSize={16} fill="#3a2a1c">{sub}</text>
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={-70} y1={2 + i * 14} x2={70} y2={2 + i * 14} stroke="#8a7a5a" strokeWidth={2} />)}
        <circle cx={50} cy={72} r={11} fill="#b8322a" stroke={INK} strokeWidth={1.2} />
      </g>
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {half(-1)}
      {half(1)}
    </g>
  );
};

// Writing desk with a sheet and a quill (top at y - 64·s).
export const Desk = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-80} y={-64} width={160} height={12} fill="#6b4a2b" stroke={INK} strokeWidth={1.4} />
    <rect x={-74} y={-52} width={10} height={52} fill="#4a3424" stroke={INK} strokeWidth={1.2} />
    <rect x={64} y={-52} width={10} height={52} fill="#4a3424" stroke={INK} strokeWidth={1.2} />
    <path d="M-40 -64 L20 -64 L26 -70 L-34 -70 Z" fill="#f4f0e2" stroke={INK} strokeWidth={1} />
    <path d="M30 -66 L58 -104 Q62 -100 34 -64 Z" fill="#f4f2ea" stroke={INK} strokeWidth={1} />
    <rect x={40} y={-72} width={12} height={8} fill="#1c1c22" />
  </g>
);
