import type { Feature } from "geojson";
import { geoCentroid } from "d3-geo";
import { interpolate, useCurrentFrame } from "remotion";
import { countries } from "../../../components/data";
import { Fire } from "../../../components/Figures";
import { useMap } from "../../../components/Map";
import { region } from "../../../components/Region";
import { Horse } from "./PeriodD";
import { font } from "./news";

// Ep 2 chapters 1–2 (Rome vs Carthage → the land route): galleys, robed figures, a young general, an altar,
// city walls, a silver mine, coins, Numidian horsemen, plus a few map helpers. Drawn like kit/Ancient.tsx:
// side view, feet / waterline at y = 0, two-tone fills + 1.5 px outline #1b1d24, small idle motion.
const INK = "#1b1d24";
type Fig = { x: number; y: number; scale?: number; phase?: number; flip?: boolean };
const T = (x: number, y: number, scale: number, flip: boolean) => `translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`;

// War galley, bow (with a bronze ram) to the right. ~110 units tall at scale 1, waterline at y = 0.
// `sail` = sail colour (Rome red, Carthage purple); `row` swings the oars; `crash` 0 → 1 tilts and splinters it.
export const Galley = ({ x, y, scale = 1, phase = 0, flip = false, sail = "#b8322a", hull = "#5a3a22", row = true, crash = 0, furl = 0 }: Fig & { sail?: string; hull?: string; row?: boolean; crash?: number; furl?: number }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.07 + phase) * 1.8;
  const roll = Math.sin(frame * 0.05 + phase) * 1.2 + crash * 9;
  const oar = row ? Math.sin(frame * 0.22 + phase) * 14 : 0;
  return (
    <g transform={`${T(x, y + bob + crash * 6, scale, flip)} rotate(${roll})`}>
      {/* oars under the hull line */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={-70 + i * 17} y1={-14} x2={-78 + i * 17 + oar * 0.4} y2={10 + Math.abs(oar) * 0.2} stroke="#7a5a3a" strokeWidth={2.4} strokeLinecap="round" />
      ))}
      {/* hull: curved stern post on the left, ram on the right */}
      <path d="M-96 -22 Q-112 -44 -100 -62 Q-96 -40 -84 -30 L88 -30 Q100 -30 104 -20 L128 -14 L128 -6 L100 -4 Q90 4 70 4 L-74 4 Q-92 0 -96 -22 Z" fill={hull} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M-84 -26 L96 -26 L96 -20 L-86 -20 Z" fill="#d9b45a" stroke={INK} strokeWidth={1} />
      <path d="M104 -18 L130 -12 L130 -6 L104 -6 Z" fill="#b9873a" stroke={INK} strokeWidth={1.2} />
      {/* eye on the bow */}
      <ellipse cx={86} cy={-12} rx={6} ry={4} fill="#f2ead6" stroke={INK} strokeWidth={1} />
      <circle cx={87} cy={-12} r={2} fill={INK} />
      {/* shields along the rail */}
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-60 + i * 20} cy={-34} r={6} fill={i % 2 ? sail : "#d9b45a"} stroke={INK} strokeWidth={1.1} />)}
      {/* mast + square sail */}
      <line x1={0} y1={-30} x2={0} y2={-112} stroke="#4a3424" strokeWidth={3.5} />
      <line x1={-38} y1={-108} x2={38} y2={-108} stroke="#4a3424" strokeWidth={3} />
      <path d={`M-36 -106 L36 -106 Q${40 + Math.sin(frame * 0.1 + phase) * 3} ${-80 + furl * 20} 34 ${-52 + furl * 40} L-34 ${-52 + furl * 40} Q-30 ${-80 + furl * 20} -36 -106 Z`} fill={sail} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <path d={`M-2 -106 L2 -106 L2 ${-52 + furl * 40} L-2 ${-52 + furl * 40} Z`} fill="#000" opacity={0.18} />
      {crash > 0.2 && [0, 1, 2].map((i) => <path key={i} d={`M${110 + i * 8} ${-20 - i * 10} l${8 + i * 3} ${-6 - i * 3}`} stroke="#c9a46a" strokeWidth={3} strokeLinecap="round" opacity={crash} />)}
    </g>
  );
};

// Standing person in a long robe. child = a 9-year-old boy (smaller, no beard). hold: none | scroll | raise | point.
export const Robed = ({ x, y, scale = 1, phase = 0, flip = false, robe = "#e9e2d0", shade = "#c9c0aa", cloak, skin = "#c58a5e", beard = false, child = false, hold = "none" }: Fig & { robe?: string; shade?: string; cloak?: string; skin?: string; beard?: boolean; child?: boolean; hold?: "none" | "scroll" | "raise" | "point" }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.06 + phase) * 0.7;
  const sc = child ? scale * 0.62 : scale;
  const arm = hold === "raise" ? -150 : hold === "point" ? -95 : hold === "scroll" ? -60 : -12;
  return (
    <g transform={T(x, y + bob, sc, flip)}>
      <ellipse cx={0} cy={1} rx={16} ry={3} fill="#000" opacity={0.3} />
      <path d="M-8 -6 L-6 0 L2 0 L0 -6 Z M2 -6 L4 0 L12 0 L8 -6 Z" fill="#6b4a2b" stroke={INK} strokeWidth={1} />
      {/* back arm */}
      <path d="M-8 -86 Q-16 -64 -12 -46" stroke={shade} strokeWidth={8} strokeLinecap="round" fill="none" />
      {/* robe */}
      <path d="M-13 -90 Q-18 -50 -17 -4 L17 -4 Q18 -50 13 -90 Q0 -96 -13 -90 Z" fill={robe} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M5 -92 Q12 -50 13 -4 L17 -4 Q18 -50 13 -90 Z" fill={shade} />
      <path d="M-12 -60 L12 -60" stroke="#8a6a3a" strokeWidth={2.5} />
      {cloak && <path d="M-15 -92 Q-6 -98 6 -94 L-4 -40 Q-14 -20 -22 -8 Q-24 -50 -15 -92 Z" fill={cloak} stroke={INK} strokeWidth={1.3} />}
      <rect x={-3} y={-98} width={7} height={8} fill={skin} />
      <g transform="translate(1,-108)">
        <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.5} />
        <circle cx={5} cy={-1} r={1.3} fill={INK} />
        <path d="M-10 -2 Q-10 -14 0 -13 Q10 -14 10 -4 Q3 -9 -10 -2 Z" fill="#2a1d14" />
        {beard && <path d="M-6 4 Q0 16 9 6 Q6 2 0 4 Z" fill="#2a1d14" stroke={INK} strokeWidth={1} />}
      </g>
      {/* front arm */}
      <g transform={`translate(4,-86) rotate(${arm + Math.sin(frame * 0.05 + phase) * 2})`}>
        <path d="M0 0 L0 34" stroke={robe} strokeWidth={8} strokeLinecap="round" />
        <path d="M0 0 L0 34" stroke={INK} strokeWidth={1.2} opacity={0.4} />
        <circle cx={0} cy={37} r={4} fill={skin} stroke={INK} strokeWidth={1} />
      </g>
      {hold === "scroll" && (
        <g transform="translate(26,-66)">
          <rect x={-4} y={-14} width={26} height={24} fill="#efe3c2" stroke={INK} strokeWidth={1.2} />
          <path d="M0 -6 L18 -6 M0 0 L16 0 M0 6 L14 6" stroke="#7a5a3a" strokeWidth={1.2} />
          <rect x={-7} y={-16} width={6} height={28} rx={3} fill="#c9a46a" stroke={INK} strokeWidth={1} />
        </g>
      )}
    </g>
  );
};

// Young general: bronze cuirass, red cloak, crested helmet, sword raised by `raise` (0 → 1).
export const General = ({ x, y, scale = 1, phase = 0, flip = false, raise = 0, cloak = "#8e2620" }: Fig & { raise?: number; cloak?: string }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.06 + phase) * 0.6;
  const wave = Math.sin(frame * 0.12 + phase) * 4;
  const skin = "#a8714a";
  return (
    <g transform={T(x, y + bob, scale, flip)}>
      <ellipse cx={0} cy={1} rx={16} ry={3} fill="#000" opacity={0.3} />
      <path d={`M-12 -92 Q-28 -50 ${-30 + wave} -14 L-8 -20 Z`} fill={cloak} stroke={INK} strokeWidth={1.3} />
      <path d="M-6 -40 L-5 0 L3 0 L4 -40 Z" fill={skin} stroke={INK} strokeWidth={1.3} />
      <path d="M4 -40 L6 0 L13 0 L11 -40 Z" fill={skin} stroke={INK} strokeWidth={1.3} />
      <path d="M-6 -14 L-6 2 L4 2 L4 -14 Z M4 -14 L5 2 L14 2 L12 -14 Z" fill="#6b4a2b" stroke={INK} strokeWidth={1} />
      <path d="M-12 -48 L14 -48 L16 -36 L-14 -36 Z" fill="#e9dcc0" stroke={INK} strokeWidth={1.2} />
      {[-10, -3, 4, 11].map((px) => <rect key={px} x={px - 3} y={-38} width={6} height={10} fill="#e9dcc0" stroke={INK} strokeWidth={0.9} />)}
      <path d="M-13 -90 Q-15 -66 -12 -46 L13 -46 Q15 -66 12 -90 Q0 -95 -13 -90 Z" fill="#c9973f" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-6 -80 Q0 -76 6 -80 M-6 -68 Q0 -64 6 -68" stroke="#8a6326" strokeWidth={1.4} fill="none" />
      <rect x={-3} y={-98} width={7} height={8} fill={skin} />
      <g transform="translate(1,-107)">
        <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.5} />
        <circle cx={5} cy={-1} r={1.3} fill={INK} />
        <path d="M-10 -1 Q-11 -15 0 -15 Q11 -15 10 -1 L10 6 L6 6 L6 -3 Q0 -6 -10 -1 Z" fill="#c9973f" stroke={INK} strokeWidth={1.3} />
        <path d={`M-8 -14 Q0 -30 ${12 + wave * 0.4} -16`} fill="#8e2620" stroke={INK} strokeWidth={1} />
      </g>
      <g transform={`translate(6,-86) rotate(${-10 - raise * 140})`}>
        <path d="M0 0 L0 30" stroke={skin} strokeWidth={7} strokeLinecap="round" />
        <path d="M0 30 L0 66" stroke="#d5dade" strokeWidth={4} strokeLinecap="round" />
        <path d="M-6 30 L6 30" stroke="#8a6326" strokeWidth={3} />
      </g>
    </g>
  );
};

// Carthage's colour on maps and sails (Rome = RED from news.tsx).
export const PURPLE = "#9b5bd6";

// Banner on a pole (foot at x, y; ~200 px × s tall), waving.
export const Banner = ({ x, y, s, color, phase = 0 }: { x: number; y: number; s: number; color: string; phase?: number }) => {
  const frame = useCurrentFrame();
  const wv = Math.sin(frame * 0.15 + phase) * 6 * s;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y - 200 * s} stroke="#4a3424" strokeWidth={5 * s} />
      <path d={`M${x} ${y - 196 * s} L${x + 70 * s} ${y - 190 * s + wv} L${x + 70 * s} ${y - 130 * s + wv} L${x} ${y - 136 * s} Z`} fill={color} stroke={INK} strokeWidth={1.5 * s} />
      <circle cx={x} cy={y - 204 * s} r={8 * s} fill="#d9b45a" stroke={INK} strokeWidth={1.2 * s} />
    </g>
  );
};

// Stone altar with a fire on top; `fire` 0 → 1 (flares up when it passes 1).
export const Altar = ({ x, y, s, fire = 1 }: { x: number; y: number; s: number; fire?: number }) => (
  <g>
    <rect x={x - 40 * s} y={y - 70 * s} width={80 * s} height={70 * s} fill="#cfc6b2" stroke={INK} strokeWidth={1.5 * s} />
    <rect x={x - 48 * s} y={y - 82 * s} width={96 * s} height={14 * s} fill="#e2dac6" stroke={INK} strokeWidth={1.5 * s} />
    <rect x={x - 48 * s} y={y - 8 * s} width={96 * s} height={10 * s} fill="#b8af9a" stroke={INK} strokeWidth={1.2 * s} />
    <path d={`M${x - 26 * s} ${y - 44 * s} h${52 * s}`} stroke="#9a907a" strokeWidth={3 * s} />
    {fire > 0 && <Fire x={x} y={y - 82 * s} size={46 * s * Math.min(1.5, fire)} seed={3} k={Math.min(1, fire)} />}
  </g>
);

// Temple columns behind a scene (a sanctuary).
export const Columns = ({ x, W, ground, s, n = 5, h = 220, color = "#d8cfba" }: { x: number; W: number; ground: number; s: number; n?: number; h?: number; color?: string }) => (
  <g>
    <path d={`M${x - 20 * s} ${ground - h * s} L${x + W / 2} ${ground - (h + 60) * s} L${x + W + 20 * s} ${ground - h * s} Z`} fill={color} stroke={INK} strokeWidth={1.5 * s} />
    <rect x={x - 16 * s} y={ground - h * s} width={W + 32 * s} height={16 * s} fill={color} stroke={INK} strokeWidth={1.4 * s} />
    {Array.from({ length: n }, (_, i) => (
      <g key={i}>
        <rect x={x + (i / (n - 1)) * (W - 30 * s)} y={ground - (h - 16) * s} width={30 * s} height={(h - 16) * s} fill={color} stroke={INK} strokeWidth={1.3 * s} />
        <path d={`M${x + (i / (n - 1)) * (W - 30 * s) + 10 * s} ${ground - (h - 20) * s} v${(h - 24) * s} M${x + (i / (n - 1)) * (W - 30 * s) + 20 * s} ${ground - (h - 20) * s} v${(h - 24) * s}`} stroke="#a89f88" strokeWidth={1.5 * s} />
      </g>
    ))}
  </g>
);

// Stone city wall with towers (and an optional gate); `damage` 0 → 1 knocks out crenels and blackens it.
export const CityWall = ({ x, y, W, s, h = 120, towers = 3, gate = true, color = "#c9b48a", damage = 0 }: { x: number; y: number; W: number; s: number; h?: number; towers?: number; gate?: boolean; color?: string; damage?: number }) => {
  const shade = "#a8946c";
  const crenels = Math.floor(W / (28 * s));
  return (
    <g>
      <rect x={x} y={y - h * s} width={W} height={h * s} fill={color} stroke={INK} strokeWidth={1.5 * s} />
      {Array.from({ length: crenels }, (_, i) => (i % 5 === 2 && damage > 0.5 ? null : <rect key={i} x={x + i * 28 * s + 4 * s} y={y - (h + 16) * s} width={16 * s} height={16 * s} fill={color} stroke={INK} strokeWidth={1.2 * s} />))}
      {Array.from({ length: 4 }, (_, r) => <path key={r} d={`M${x} ${y - (h * (r + 1) * s) / 5} h${W}`} stroke={shade} strokeWidth={1.4 * s} />)}
      {Array.from({ length: towers }, (_, i) => {
        const tx = x + (towers === 1 ? W / 2 : (i / (towers - 1)) * (W - 70 * s) + 35 * s);
        return (
          <g key={i}>
            <rect x={tx - 35 * s} y={y - (h + 50) * s} width={70 * s} height={(h + 50) * s} fill={shade} stroke={INK} strokeWidth={1.5 * s} />
            {[-24, -4, 16].map((dx) => <rect key={dx} x={tx + dx * s - 4 * s} y={y - (h + 66) * s} width={16 * s} height={16 * s} fill={shade} stroke={INK} strokeWidth={1.2 * s} />)}
            <rect x={tx - 5 * s} y={y - (h + 30) * s} width={10 * s} height={20 * s} fill={INK} />
          </g>
        );
      })}
      {gate && <path d={`M${x + W / 2 - 30 * s} ${y} v${-60 * s} q${30 * s} ${-30 * s} ${60 * s} 0 v${60 * s} Z`} fill="#4a3424" stroke={INK} strokeWidth={1.5 * s} />}
      {damage > 0 && <rect x={x} y={y - (h + 66) * s} width={W} height={(h + 66) * s} fill="#2a2a2a" opacity={0.25 * damage} />}
    </g>
  );
};

// Flat-roofed Mediterranean houses on a slope (a harbour town). `n` houses from x across W.
export const Houses = ({ x, y, W, s, n = 7, seed = 1 }: { x: number; y: number; W: number; s: number; n?: number; seed?: number }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const r = Math.abs(Math.sin(i * 2.3 + seed));
      const w = (60 + r * 40) * s;
      const h = (50 + Math.abs(Math.sin(i * 1.7 + seed)) * 60) * s;
      const hx = x + (i / n) * W;
      const hy = y - Math.abs(Math.sin(i * 0.9 + seed)) * 40 * s;
      return (
        <g key={i}>
          <rect x={hx} y={hy - h} width={w} height={h} fill={i % 3 ? "#efe6d2" : "#e2cfa8"} stroke={INK} strokeWidth={1.3 * s} />
          <rect x={hx + w * 0.3} y={hy - h * 0.6} width={10 * s} height={14 * s} fill="#4a3424" />
          {i % 2 === 0 && <rect x={hx + w * 0.62} y={hy - h * 0.6} width={10 * s} height={14 * s} fill="#4a3424" />}
          <rect x={hx - 3 * s} y={hy - h - 6 * s} width={w + 6 * s} height={6 * s} fill="#b8a07a" stroke={INK} strokeWidth={1 * s} />
        </g>
      );
    })}
  </g>
);

// Silver mine: a hillside with a timbered tunnel mouth; an ore basket glints. `glint` 0 → 1.
export const MineMouth = ({ x, y, s, glint = 1 }: { x: number; y: number; s: number; glint?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <path d={`M${x - 260 * s} ${y} Q${x - 120 * s} ${y - 240 * s} ${x + 60 * s} ${y - 210 * s} Q${x + 220 * s} ${y - 160 * s} ${x + 300 * s} ${y} Z`} fill="#8a6a4a" stroke={INK} strokeWidth={1.5 * s} />
      <path d={`M${x - 200 * s} ${y} Q${x - 80 * s} ${y - 150 * s} ${x + 80 * s} ${y - 140 * s} Q${x + 200 * s} ${y - 100 * s} ${x + 260 * s} ${y} Z`} fill="#6e5238" />
      <path d={`M${x - 50 * s} ${y} v${-90 * s} q${50 * s} ${-40 * s} ${100 * s} 0 v${90 * s} Z`} fill="#1a1410" stroke={INK} strokeWidth={1.5 * s} />
      <path d={`M${x - 58 * s} ${y} v${-96 * s} h${116 * s} v${96 * s}`} stroke="#7a5a32" strokeWidth={10 * s} fill="none" />
      {/* ore pile with silver glints */}
      <path d={`M${x + 90 * s} ${y} q${50 * s} ${-60 * s} ${110 * s} 0 Z`} fill="#5a5a60" stroke={INK} strokeWidth={1.3 * s} />
      {[0, 1, 2, 3, 4].map((i) => {
        const tw = 0.5 + 0.5 * Math.sin(frame * 0.3 + i * 1.7);
        return <path key={i} d={`M${x + (110 + i * 18) * s} ${y - (14 + (i % 2) * 16) * s} l${4 * s} ${-8 * s} l${4 * s} ${8 * s} l${-4 * s} ${8 * s} Z`} fill="#eef3f8" opacity={glint * tw} />;
      })}
    </g>
  );
};

// Silver coin (side-on face), radius r px. `turn` spins it (0 → 1 = one turn).
export const Coin = ({ x, y, r, turn = 0, mark = true }: { x: number; y: number; r: number; turn?: number; mark?: boolean }) => {
  const sx = Math.max(0.12, Math.abs(Math.cos(turn * Math.PI * 2)));
  return (
    <g transform={`translate(${x},${y}) scale(${sx},1)`}>
      <circle r={r} fill="#c9ced6" stroke={INK} strokeWidth={Math.max(1, r * 0.08)} />
      <circle r={r * 0.78} fill="none" stroke="#9aa1ab" strokeWidth={r * 0.08} />
      {mark && <path d={`M${-r * 0.35} ${r * 0.35} Q0 ${-r * 0.6} ${r * 0.35} ${r * 0.35} M${-r * 0.2} ${-r * 0.05} h${r * 0.4}`} stroke="#7a828c" strokeWidth={r * 0.1} fill="none" strokeLinecap="round" />}
      <ellipse cx={-r * 0.35} cy={-r * 0.4} rx={r * 0.2} ry={r * 0.1} fill="#fff" opacity={0.6} />
    </g>
  );
};

// Pile of silver coins and ingots; `k` 0 → 1 grows it.
export const SilverPile = ({ x, y, s, k = 1 }: { x: number; y: number; s: number; k?: number }) => {
  const n = Math.round(14 * k);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const row = Math.floor(Math.sqrt(i * 2));
        const cx = x + ((i * 37) % 120 - 60) * s * (1 - row * 0.15);
        const cy = y - 8 * s - row * 12 * s;
        return i % 4 === 3 ? (
          <path key={i} d={`M${cx - 20 * s} ${cy} l${8 * s} ${-12 * s} h${24 * s} l${8 * s} ${12 * s} Z`} fill="#b9c0c9" stroke={INK} strokeWidth={1.2 * s} />
        ) : (
          <ellipse key={i} cx={cx} cy={cy} rx={14 * s} ry={6 * s} fill="#c9ced6" stroke={INK} strokeWidth={1.2 * s} />
        );
      })}
    </g>
  );
};

// Treasure chest; `open` 0 → 1 lifts the lid and shows silver.
export const Chest = ({ x, y, s, open = 0 }: { x: number; y: number; s: number; open?: number }) => (
  <g>
    <rect x={x - 50 * s} y={y - 50 * s} width={100 * s} height={50 * s} fill="#7a4a28" stroke={INK} strokeWidth={1.5 * s} />
    <rect x={x - 50 * s} y={y - 30 * s} width={100 * s} height={6 * s} fill="#c9973f" />
    {open > 0 && <ellipse cx={x} cy={y - 50 * s} rx={44 * s} ry={10 * s} fill="#d9dde3" stroke={INK} strokeWidth={1 * s} />}
    <g transform={`rotate(${-open * 70},${x - 50 * s},${y - 50 * s})`}>
      <path d={`M${x - 50 * s} ${y - 50 * s} q${50 * s} ${-30 * s} ${100 * s} 0 Z`} fill="#8a5a32" stroke={INK} strokeWidth={1.5 * s} />
    </g>
  </g>
);

// Siege ladder leaning on a wall (bottom at x, y; top at x + lean, y - h).
export const Ladder = ({ x, y, s, h = 160, lean = 50 }: { x: number; y: number; s: number; h?: number; lean?: number }) => (
  <g stroke="#6b4a2b" strokeWidth={4 * s} strokeLinecap="round">
    <line x1={x} y1={y} x2={x + lean * s} y2={y - h * s} />
    <line x1={x + 22 * s} y1={y} x2={x + (lean + 22) * s} y2={y - h * s} />
    {Array.from({ length: 7 }, (_, i) => {
      const t = (i + 0.5) / 7;
      return <line key={i} x1={x + lean * s * t} y1={y - h * s * t} x2={x + (lean * t + 22) * s} y2={y - h * s * t} strokeWidth={3 * s} />;
    })}
  </g>
);

// Numidian horseman: bareback on a small horse, light tunic, javelins. Faces right.
export const Horseman = ({ x, y, scale = 1, phase = 0, flip = false, gait = "walk" }: Fig & { gait?: "stand" | "walk" | "gallop" }) => {
  const frame = useCurrentFrame();
  const sp = gait === "gallop" ? 0.45 : gait === "walk" ? 0.2 : 0;
  const bob = gait === "stand" ? 0 : -Math.abs(Math.sin(frame * sp + phase)) * (gait === "gallop" ? 5 : 2);
  const skin = "#7a4e30";
  return (
    <g transform={T(x, y, scale, flip)}>
      <Horse x={0} y={0} phase={phase} gait={gait} coat="#8a5a32" mane="#2a1c12" />
      <g transform={`translate(0,${bob})`}>
        <path d="M-2 -84 L8 -68 L6 -54" stroke={skin} strokeWidth={7} strokeLinecap="round" fill="none" />
        <path d="M-12 -82 Q-14 -104 -8 -120 Q2 -124 10 -118 Q14 -100 12 -82 Z" fill="#e9dcc0" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M4 -120 Q12 -100 12 -82 L6 -82 Q8 -102 2 -120 Z" fill="#000" opacity={0.15} />
        <rect x={-2} y={-129} width={6} height={7} fill={skin} />
        <g transform="translate(1,-137)">
          <ellipse cx={0} cy={0} rx={9} ry={10} fill={skin} stroke={INK} strokeWidth={1.4} />
          <circle cx={5} cy={-1} r={1.2} fill={INK} />
          <path d="M-10 -2 Q-10 -13 0 -12 Q10 -13 10 -3 Q2 -8 -10 -2 Z" fill="#1c140c" />
        </g>
        <g transform="translate(2,-112) rotate(-60)">
          <line x1={-40} y1={0} x2={70} y2={0} stroke="#6b4a2b" strokeWidth={2.6} strokeLinecap="round" />
          <path d="M70 -3 L82 0 L70 3 Z" fill="#cfd5da" stroke={INK} strokeWidth={1} />
        </g>
        <ellipse cx={-14} cy={-98} rx={8} ry={16} fill="#8a2a2a" stroke={INK} strokeWidth={1.3} />
      </g>
    </g>
  );
};

// ---- Map helpers (inside <MapFrame>) ----

// Land mask around the Mediterranean (Europe + North Africa) from today's coastlines, so hand-drawn
// approximate areas can be loose at sea. Use once: <MedLandClip id="..." />, then clip="..." on MedArea.
const MED_LAND = countries.features.filter((f) => {
  const [lon, lat] = geoCentroid(f);
  return lon > -20 && lon < 40 && lat > 20 && lat < 60;
});
export const MedLandClip = ({ id }: { id: string }) => {
  const { path } = useMap();
  return (
    <defs>
      <clipPath id={id}>
        {MED_LAND.map((f, i) => <path key={i} d={path(f) ?? ""} />)}
      </clipPath>
    </defs>
  );
};

// Approximate area from a [lon, lat] ring: soft fill + glowing dashed edge. `grow` 0 → 1 expands it from `from`.
export const MedArea = ({ ring, color, k, clip, edge = color, fill = 0.42, grow = 1, from }: { ring: [number, number][]; color: string; k: number; clip?: string; edge?: string; fill?: number; grow?: number; from?: [number, number] }) => {
  const { path, s } = useMap();
  if (k <= 0 || grow <= 0) return null;
  const c = from ?? ring[0];
  const g = Math.max(0.02, Math.min(1, grow));
  const f: Feature = region(ring.map(([lon, lat]) => [c[0] + (lon - c[0]) * g, c[1] + (lat - c[1]) * g]));
  const d = path(f) ?? "";
  return (
    <g opacity={Math.min(1, k)} clipPath={clip ? `url(#${clip})` : undefined}>
      <path d={d} fill={color} fillOpacity={fill} />
      <path d={d} fill="none" stroke={edge} strokeWidth={9 * s} strokeOpacity={0.3} style={{ filter: `blur(${4 * s}px)` }} />
      <path d={d} fill="none" stroke={edge} strokeWidth={3 * s} strokeDasharray={`${12 * s} ${8 * s}`} strokeOpacity={0.95} />
    </g>
  );
};

// Small galley icon on the map (screen-constant size), bobbing; `k` pops it in.
export const FleetIcon = ({ at, k, color = "#ff3b30", size = 1, flip = false, phase = 0 }: { at: [number, number]; k: number; color?: string; size?: number; flip?: boolean; phase?: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const p = projection(at);
  if (!p) return null;
  const sc = Math.min(1, k) * size;
  return (
    <g transform={`translate(${p[0]},${p[1]}) scale(${sc})`} opacity={Math.min(1, k * 1.5)}>
      <circle r={34 * s} fill="rgba(8,14,26,0.55)" stroke={color} strokeWidth={3 * s} />
      <Galley x={0} y={16 * s} scale={0.36 * s} sail={color} phase={phase} flip={flip} />
    </g>
  );
};

// Ring of siege marks (little triangles pointing inward) around a place; `k` 0 → 1 closes the ring.
export const SiegeRing = ({ at, k, color = "#ffc94a", r = 52, n = 12 }: { at: [number, number]; k: number; color?: string; r?: number; n?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const p = projection(at);
  if (!p) return null;
  const pulse = 1 + Math.sin(frame * 0.25) * 0.04;
  return (
    <g transform={`translate(${p[0]},${p[1]})`}>
      <circle r={r * s * pulse} fill="none" stroke={color} strokeWidth={3 * s} strokeDasharray={`${8 * s} ${6 * s}`} opacity={0.6 * Math.min(1, k)} />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const o = interpolate(k * n, [i, i + 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (o <= 0) return null;
        const rr = (r + 18) * s * pulse;
        return (
          <g key={i} transform={`translate(${Math.cos(a) * rr},${Math.sin(a) * rr}) rotate(${(a * 180) / Math.PI + 180})`} opacity={o}>
            <path d={`M${10 * s} 0 L${-8 * s} ${-9 * s} L${-8 * s} ${9 * s} Z`} fill={color} stroke="#1b1d24" strokeWidth={1.5 * s} />
          </g>
        );
      })}
    </g>
  );
};

// Big red X on the map at [lon, lat]; `k` 0 → 1 draws it.
export const CrossOut = ({ at, k, size = 40, color = "#ff3b30" }: { at: [number, number]; k: number; size?: number; color?: string }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const p = projection(at);
  if (!p) return null;
  const r = size * s;
  const a = Math.min(1, k * 2);
  const b = Math.max(0, Math.min(1, k * 2 - 1));
  return (
    <g transform={`translate(${p[0]},${p[1]})`} strokeLinecap="round">
      <line x1={-r} y1={-r} x2={-r + 2 * r * a} y2={-r + 2 * r * a} stroke="#0b1020" strokeWidth={18 * s} />
      <line x1={-r} y1={-r} x2={-r + 2 * r * a} y2={-r + 2 * r * a} stroke={color} strokeWidth={12 * s} />
      {b > 0 && <line x1={r} y1={-r} x2={r - 2 * r * b} y2={-r + 2 * r * b} stroke="#0b1020" strokeWidth={18 * s} />}
      {b > 0 && <line x1={r} y1={-r} x2={r - 2 * r * b} y2={-r + 2 * r * b} stroke={color} strokeWidth={12 * s} />}
    </g>
  );
};

// Glowing dot travelling along a [lon, lat] polyline (k 0 → 1 by screen length), e.g. a distance runner.
export const RunnerDot = ({ pts, k, color = "#ffc94a" }: { pts: [number, number][]; k: number; color?: string }) => {
  const { projection, s } = useMap();
  if (k <= 0 || k >= 1.001) return null;
  const xy = pts.map((p) => projection(p) ?? [0, 0]);
  const seg = xy.slice(1).map((p, i) => Math.hypot(p[0] - xy[i][0], p[1] - xy[i][1]));
  let left = Math.min(1, k) * seg.reduce((a, b) => a + b, 0);
  let q = xy[0];
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i]) {
      const t = left / (seg[i] || 1);
      q = [xy[i][0] + (xy[i + 1][0] - xy[i][0]) * t, xy[i][1] + (xy[i + 1][1] - xy[i][1]) * t];
      break;
    }
    left -= seg[i];
    q = xy[i + 1];
  }
  return (
    <g>
      <circle cx={q[0]} cy={q[1]} r={22 * s} fill={color} opacity={0.35} style={{ filter: `blur(${6 * s}px)` }} />
      <circle cx={q[0]} cy={q[1]} r={10 * s} fill="#fff" stroke={color} strokeWidth={4 * s} />
    </g>
  );
};

// Label in a panel (white rounded tag), e.g. "NEVER A FRIEND OF ROME".
export const PanelTag = ({ x, y, s, text, k = 1, color = "#ffc94a", size = 30 }: { x: number; y: number; s: number; text: string; k?: number; color?: string; size?: number }) => {
  if (k <= 0) return null;
  const w = (text.length * size * 0.6 + 40) * s;
  const h = size * 1.6 * s;
  return (
    <g transform={`translate(${x},${y}) scale(${Math.min(1, k)})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10 * s} fill="rgba(8,14,26,0.88)" stroke={color} strokeWidth={3 * s} />
      <text y={size * 0.36 * s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={size * s} fill="#fff">{text}</text>
    </g>
  );
};
