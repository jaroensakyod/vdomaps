import { random, useCurrentFrame } from "remotion";
import { Fire, Smoke } from "../../../components/Figures";

// Retreat and aftermath pieces (ch7–ch8), drawn like kit/Period.tsx: side view, feet at y = 0, ~120 units tall at
// scale 1, two-tone fills + 1.5 px dark outline #1b1d24, small idle motion.
const INK = "#1b1d24";
type Fig = { x: number; y: number; scale?: number; phase?: number; flip?: boolean };
const T = (x: number, y: number, scale: number, flip: boolean) => `translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`;

// Horse, side view facing right. gait: stand | walk | gallop.
export const Horse = ({ x, y, scale = 1, phase = 0, flip = false, coat = "#6b4a2e", mane = "#2a1c12", gait = "walk" }: Fig & { coat?: string; mane?: string; gait?: "stand" | "walk" | "gallop" }) => {
  const frame = useCurrentFrame();
  const sp = gait === "gallop" ? 0.45 : gait === "walk" ? 0.2 : 0;
  const t = frame * sp + phase;
  const amp = gait === "gallop" ? 24 : gait === "walk" ? 12 : 0;
  const bob = gait === "stand" ? Math.sin(frame * 0.06 + phase) * 0.6 : -Math.abs(Math.sin(t)) * (gait === "gallop" ? 5 : 2);
  const leg = (lx: number, a: number, back: boolean) => (
    <g transform={`translate(${lx},-50) rotate(${a})`} opacity={back ? 0.8 : 1}>
      <path d="M-4 0 L4 0 L3 44 L-3 44 Z" fill={coat} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M-4 44 L5 44 L5 50 L-4 50 Z" fill="#1c1c22" />
    </g>
  );
  return (
    <g transform={T(x, y + bob, scale, flip)}>
      <ellipse cx={0} cy={1} rx={38} ry={4} fill="#000" opacity={0.3} />
      {leg(-24, Math.sin(t + 1) * amp, true)}
      {leg(22, Math.sin(t + 2.6) * amp, true)}
      <path d={`M-32 -70 Q-48 -60 ${-44 + Math.sin(frame * 0.1 + phase) * 3} -34`} stroke={mane} strokeWidth={7} strokeLinecap="round" fill="none" />
      <path d="M-34 -62 Q-36 -82 -12 -82 L16 -84 Q34 -84 37 -68 Q37 -50 20 -48 L-22 -48 Q-34 -48 -34 -62 Z" fill={coat} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-30 -56 Q0 -46 34 -58 Q30 -48 20 -48 L-22 -48 Q-30 -49 -30 -56 Z" fill="#000" opacity={0.18} />
      <path d="M16 -82 L32 -108 L46 -104 L36 -66 Z" fill={coat} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M16 -82 L30 -108 L34 -108 L22 -80 Z" fill={mane} />
      <path d="M31 -110 Q38 -116 48 -110 L64 -95 Q67 -88 60 -87 L44 -92 Z" fill={coat} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M36 -112 L38 -122 L42 -112 Z" fill={coat} stroke={INK} strokeWidth={1.2} />
      <circle cx={46} cy={-103} r={1.6} fill={INK} />
      {leg(-18, Math.sin(t) * amp, false)}
      {leg(28, Math.sin(t + 3.6) * amp, false)}
    </g>
  );
};

// Cossack: fur cap, dark kaftan with a red stripe, long lance with a pennant, on a small galloping horse.
export const Cossack = ({ x, y, scale = 1, phase = 0, flip = false, gait = "gallop", lance = -38 }: Fig & { gait?: "stand" | "walk" | "gallop"; lance?: number }) => {
  const frame = useCurrentFrame();
  const sp = gait === "gallop" ? 0.45 : 0.2;
  const bob = gait === "stand" ? 0 : -Math.abs(Math.sin(frame * sp + phase)) * (gait === "gallop" ? 5 : 2);
  const wave = Math.sin(frame * 0.3 + phase) * 4;
  const skin = "#e2b08a";
  return (
    <g transform={T(x, y, scale, flip)}>
      <Horse x={0} y={0} phase={phase} gait={gait} coat="#4a3828" mane="#1c140c" />
      <g transform={`translate(0,${bob})`}>
        {/* leg down the horse's side */}
        <path d="M-2 -84 L10 -70 L8 -52" stroke="#2a2f45" strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d="M4 -54 L14 -54 L14 -49 L4 -49 Z" fill="#1c1c22" />
        {/* kaftan */}
        <path d="M-12 -84 Q-14 -104 -8 -122 Q2 -126 10 -120 Q14 -102 12 -84 Z" fill="#2b3550" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M4 -122 Q12 -104 12 -84 L6 -84 Q8 -104 2 -122 Z" fill="#000" opacity={0.2} />
        <path d="M-12 -86 L12 -86" stroke="#c8312b" strokeWidth={3} />
        <rect x={-2} y={-131} width={6} height={7} fill={skin} />
        <g transform="translate(1,-139)">
          <ellipse cx={0} cy={0} rx={9} ry={10} fill={skin} stroke={INK} strokeWidth={1.4} />
          <circle cx={5} cy={-1} r={1.2} fill={INK} />
          <path d="M-2 5 Q4 9 9 4" stroke="#3a2a20" strokeWidth={2.4} fill="none" />
          {/* papakha */}
          <path d="M-11 -4 L-10 -22 Q0 -27 11 -22 L11 -4 Z" fill="#2a2420" stroke={INK} strokeWidth={1.3} />
          <path d="M-8 -20 Q0 -24 9 -20 L9 -14 Q0 -18 -8 -14 Z" fill="#c8312b" />
        </g>
        {/* arm + lance */}
        <g transform={`translate(4,-116) rotate(${lance + wave * 0.3})`}>
          <line x1={-70} y1={0} x2={120} y2={0} stroke="#6b4a2b" strokeWidth={3.2} strokeLinecap="round" />
          <path d="M120 -3 L136 0 L120 3 Z" fill="#cfd5da" stroke={INK} strokeWidth={1} />
          <path d={`M104 0 L${92 + wave} ${-12 + wave * 0.5} L${88 + wave * 0.6} 0 Z`} fill="#c8312b" stroke={INK} strokeWidth={0.8} />
        </g>
        <path d="M2 -118 Q10 -108 12 -112" stroke="#2b3550" strokeWidth={7} strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
};

// Field gun on its wheeled carriage, abandoned: `snow` 0 → 1 piles snow on it.
export const Cannon = ({ x, y, scale = 1, flip = false, snow = 0, tilt = 0 }: Fig & { snow?: number; tilt?: number }) => (
  <g transform={T(x, y, scale, flip)}>
    <ellipse cx={-10} cy={1} rx={60} ry={5} fill="#000" opacity={0.25} />
    <g transform={`rotate(${tilt},0,0)`}>
      <path d="M-70 -2 L-62 -6 L-6 -30 L0 -24 L-58 2 Z" fill="#5e4a32" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-14 -36 L52 -44 Q58 -44 58 -38 L58 -34 Q58 -30 52 -30 L-14 -26 Q-22 -26 -22 -31 Q-22 -36 -14 -36 Z" fill="#8a6c34" stroke={INK} strokeWidth={1.5} />
      <path d="M-14 -33 L56 -40" stroke="#c3a35a" strokeWidth={2} opacity={0.8} />
      <circle cx={-24} cy={-31} r={4} fill="#6a5228" stroke={INK} strokeWidth={1.2} />
      <g transform="translate(-4,-24)">
        <circle r={24} fill="none" stroke="#4a3624" strokeWidth={5} />
        <circle r={24} fill="none" stroke={INK} strokeWidth={1.2} />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={0} y1={0} x2={22 * Math.cos((i * Math.PI) / 4)} y2={22 * Math.sin((i * Math.PI) / 4)} stroke="#5e4a32" strokeWidth={2.5} />)}
        <circle r={5} fill="#3a2a1c" stroke={INK} strokeWidth={1.2} />
      </g>
      {snow > 0 && (
        <g opacity={snow} fill="#f2f6f8" stroke="#c9d6df" strokeWidth={1}>
          <path d="M-12 -36 Q20 -48 56 -45 Q58 -42 52 -42 L-12 -34 Z" />
          <path d="M-22 -47 Q-4 -54 14 -44 Q-4 -48 -22 -44 Z" />
          <path d="M-66 -4 Q-40 -18 -8 -30 L-6 -28 L-60 -2 Z" />
        </g>
      )}
    </g>
    {snow > 0 && <path d="M-90 2 Q-50 -12 -10 -6 Q30 -14 70 2 Z" fill="#eef3f6" opacity={snow} />}
  </g>
);

// Supply wagon, abandoned: one wheel gone, tipped, canvas torn; `snow` piles on top.
export const Wagon = ({ x, y, scale = 1, flip = false, snow = 0, broken = true }: Fig & { snow?: number; broken?: boolean }) => (
  <g transform={T(x, y, scale, flip)}>
    <ellipse cx={0} cy={1} rx={62} ry={5} fill="#000" opacity={0.25} />
    <g transform={`rotate(${broken ? -7 : 0},40,0)`}>
      <path d="M-56 -50 L44 -50 L40 -24 L-52 -24 Z" fill="#7a5a3a" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      {[-34, -10, 14].map((lx) => <line key={lx} x1={lx} y1={-50} x2={lx} y2={-24} stroke="#5a4028" strokeWidth={2} />)}
      <path d="M-54 -50 Q-50 -92 -6 -94 Q38 -92 42 -50 Z" fill="#d8ccb0" stroke={INK} strokeWidth={1.5} />
      <path d="M-30 -86 Q-26 -66 -32 -50 M-6 -94 L-6 -50 M18 -88 Q22 -68 18 -50" stroke="#b8aa8a" strokeWidth={1.6} fill="none" />
      {broken && <path d="M8 -92 L18 -70 L4 -64 L14 -50" stroke={INK} strokeWidth={1.4} fill="#2a2a30" opacity={0.8} />}
      <line x1={44} y1={-30} x2={86} y2={-14} stroke="#5a4028" strokeWidth={4} strokeLinecap="round" />
      {(broken ? [26] : [-36, 26]).map((wx) => (
        <g key={wx} transform={`translate(${wx},-16)`}>
          <circle r={16} fill="none" stroke="#4a3624" strokeWidth={4} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={0} y1={0} x2={15 * Math.cos((i * Math.PI) / 3)} y2={15 * Math.sin((i * Math.PI) / 3)} stroke="#5e4a32" strokeWidth={2} />)}
          <circle r={4} fill="#3a2a1c" />
        </g>
      ))}
      {snow > 0 && <path d="M-52 -60 Q-44 -98 -6 -100 Q36 -98 42 -60 Q20 -82 -6 -84 Q-36 -84 -52 -60 Z" fill="#f2f6f8" opacity={snow} />}
    </g>
    {broken && (
      <g transform="translate(-58,-4) rotate(70)">
        <ellipse rx={16} ry={5} fill="none" stroke="#4a3624" strokeWidth={4} />
      </g>
    )}
    {snow > 0 && <path d="M-80 2 Q-40 -14 0 -6 Q40 -14 80 2 Z" fill="#eef3f6" opacity={snow} />}
  </g>
);

// A broken wagon wheel lying flat (seen from the side at a low angle).
const FlatWheel = ({ x, y, r = 22, rot = 0 }: { x: number; y: number; r?: number; rot?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <ellipse rx={r} ry={r * 0.36} fill="none" stroke="#4a3624" strokeWidth={5} />
    <ellipse rx={r} ry={r * 0.36} fill="none" stroke={INK} strokeWidth={1.1} />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={0} y1={0} x2={r * Math.cos((i * Math.PI) / 3)} y2={r * 0.36 * Math.sin((i * Math.PI) / 3)} stroke="#5e4a32" strokeWidth={2.4} />)}
  </g>
);

// Campfire built from broken wagon wheels and planks. Needs <FigureDefs/> (InsetPanel adds it).
export const WheelFire = ({ x, y, scale = 1, seed = 0 }: Fig & { seed?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <ellipse cx={0} cy={2} rx={70} ry={10} fill="#000" opacity={0.25} />
    <FlatWheel x={-14} y={-4} rot={-8} />
    <FlatWheel x={18} y={-2} r={20} rot={10} />
    <g transform="translate(4,-10) rotate(-62)">
      <circle r={22} fill="none" stroke="#4a3624" strokeWidth={5} />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={0} y1={0} x2={20 * Math.cos((i * Math.PI) / 3 + 0.3)} y2={20 * Math.sin((i * Math.PI) / 3 + 0.3)} stroke="#5e4a32" strokeWidth={2.4} />)}
    </g>
    <path d="M-40 -2 L30 -22" stroke="#6b4a2b" strokeWidth={6} strokeLinecap="round" />
    <path d="M-26 -18 L40 -4" stroke="#7a5a3a" strokeWidth={5} strokeLinecap="round" />
    <Smoke x={6} y={-60} size={26} seed={seed + 3} wind={0.25} />
    <Fire x={-6} y={-6} size={70} seed={seed} />
    <Fire x={16} y={-4} size={48} seed={seed + 7} />
  </g>
);

// Pontonnier standing chest-deep: `y` is the water surface. Bare head, coat sleeves up holding a beam overhead.
// Draw the water over him afterwards (semi-transparent) so the legs read as submerged.
export const Wader = ({ x, y, scale = 1, phase = 0, flip = false, hold = -46 }: Fig & { hold?: number }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.07 + phase) * 2;
  const shiver = Math.sin(frame * 1.7 + phase) * 0.6;
  const skin = "#e6b391";
  return (
    <g transform={`${T(x + shiver, y, scale, flip)} rotate(${sway},0,30)`}>
      <path d="M-11 40 Q-13 0 -11 -30 Q0 -36 11 -30 Q13 0 11 40 Z" fill="#2c4a8c" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M4 -33 Q11 0 10 40 L11 40 Q13 0 11 -30 Z" fill="#000" opacity={0.22} />
      <path d="M-10 -30 L10 4 M10 -30 L-10 4" stroke="#f1efe6" strokeWidth={3} opacity={0.85} />
      <rect x={-3} y={-39} width={7} height={7} fill={skin} />
      <g transform="translate(1,-49)">
        <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.5} />
        <path d="M-9 -2 Q-9 -13 1 -12 Q10 -12 9 -4 Q2 -8 -4 -6 Z" fill="#3a2a20" />
        <circle cx={5} cy={0} r={1.3} fill={INK} />
        <path d="M2 6 L8 6" stroke={INK} strokeWidth={1.1} />
      </g>
      {/* both arms up to the beam */}
      <path d={`M-8 -28 L-14 ${hold + 8}`} stroke="#2c4a8c" strokeWidth={7.5} strokeLinecap="round" />
      <path d={`M8 -28 L14 ${hold + 8}`} stroke="#1f3566" strokeWidth={7.5} strokeLinecap="round" />
      <circle cx={-14} cy={hold + 5} r={3.8} fill={skin} stroke={INK} strokeWidth={1.1} />
      <circle cx={14} cy={hold + 5} r={3.8} fill={skin} stroke={INK} strokeWidth={1.1} />
    </g>
  );
};

// Bridge trestle: two splayed legs from the riverbed up to a cap beam carrying planks.
export const Trestle = ({ x, bed, top, s, w = 60, deck = true }: { x: number; bed: number; top: number; s: number; w?: number; deck?: boolean }) => (
  <g>
    <path d={`M${x - w * 0.6 * s} ${bed} L${x - w * 0.4 * s} ${top}`} stroke="#5a4030" strokeWidth={7 * s} strokeLinecap="round" />
    <path d={`M${x + w * 0.6 * s} ${bed} L${x + w * 0.4 * s} ${top}`} stroke="#5a4030" strokeWidth={7 * s} strokeLinecap="round" />
    <path d={`M${x - w * 0.52 * s} ${(bed + top) / 2} L${x + w * 0.52 * s} ${(bed + top) / 2}`} stroke="#6b4a2b" strokeWidth={4 * s} />
    <rect x={x - w * 0.6 * s} y={top - 6 * s} width={w * 1.2 * s} height={9 * s} fill="#7a5a3a" stroke={INK} strokeWidth={1.3 * s} />
    {deck && <rect x={x - w * 0.9 * s} y={top - 13 * s} width={w * 1.8 * s} height={7 * s} fill="#9a7a50" stroke={INK} strokeWidth={1.2 * s} />}
  </g>
);

// Sledge drawn by a horse, the Emperor wrapped in furs; feet (runners) at y = 0, facing right.
export const Sledge = ({ x, y, scale = 1, phase = 0, flip = false }: Fig) => {
  const frame = useCurrentFrame();
  const jolt = Math.sin(frame * 0.5 + phase) * 1.2;
  const skin = "#efc6a2";
  return (
    <g transform={T(x, y, scale, flip)}>
      <ellipse cx={20} cy={2} rx={110} ry={5} fill="#000" opacity={0.2} />
      <Horse x={92} y={0} phase={phase} gait="gallop" coat="#3a2a20" mane="#140c08" />
      <path d="M-20 -40 L64 -66" stroke="#5a4030" strokeWidth={3} />
      <g transform={`translate(0,${jolt})`}>
        <path d="M-60 -2 L36 -2 Q56 -2 58 -22" stroke="#3a2a1c" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M-50 -10 L-50 -2 M-10 -10 L-10 -2 M24 -10 L24 -2" stroke="#3a2a1c" strokeWidth={3} />
        <path d="M-58 -12 L30 -12 Q44 -14 46 -34 L36 -36 Q32 -24 20 -26 L-50 -26 Q-60 -40 -60 -58 L-66 -56 Q-66 -26 -58 -12 Z" fill="#6e2a24" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M-58 -16 L30 -16" stroke="#d9b45a" strokeWidth={2} />
        {/* the Emperor in a fur-collared greatcoat */}
        <path d="M-40 -26 Q-42 -56 -30 -64 Q-18 -68 -10 -60 Q-6 -40 -8 -26 Z" fill="#8a8d93" stroke={INK} strokeWidth={1.5} />
        <path d="M-38 -60 Q-24 -70 -10 -60 Q-22 -54 -38 -60 Z" fill="#5a4a3a" stroke={INK} strokeWidth={1.1} />
        <g transform="translate(-24,-74)">
          <ellipse cx={0} cy={0} rx={9} ry={10} fill={skin} stroke={INK} strokeWidth={1.4} />
          <circle cx={5} cy={-1} r={1.2} fill={INK} />
          <path d="M-20 -6 Q-10 -24 0 -22 Q10 -24 20 -6 Q0 -13 -20 -6 Z" fill="#141418" stroke={INK} strokeWidth={1.2} />
          <circle cx={3} cy={-13} r={2.6} fill="#2c4a8c" stroke="#fff" strokeWidth={0.8} />
        </g>
      </g>
    </g>
  );
};

// French eagle standard: pole, gilded eagle, tricolour. `fall` tips it over (0 upright → 1 lying in the snow).
export const EagleStandard = ({ x, y, scale = 1, phase = 0, fall = 0 }: Fig & { fall?: number }) => {
  const frame = useCurrentFrame();
  const wave = Math.sin(frame * 0.12 + phase);
  return (
    <g transform={`translate(${x},${y}) scale(${scale}) rotate(${fall * 72})`}>
      <line x1={0} y1={0} x2={0} y2={-150} stroke="#5a4030" strokeWidth={4} strokeLinecap="round" />
      <g transform="translate(0,-150)">
        <rect x={-7} y={-6} width={14} height={6} fill="#c79a3a" stroke={INK} strokeWidth={1} />
        <path d="M0 -8 Q-6 -16 -18 -22 Q-10 -24 -4 -20 Q-4 -28 0 -30 Q4 -28 4 -20 Q10 -24 18 -22 Q6 -16 0 -8 Z" fill="#e2b84a" stroke={INK} strokeWidth={1.2} />
      </g>
      <g transform="translate(2,-140)">
        {["#2c4a8c", "#f1efe6", "#c8312b"].map((c, i) => (
          <path key={c} d={`M${i * 18} ${wave * i * 1.5} L${(i + 1) * 18} ${wave * (i + 1) * 1.5} L${(i + 1) * 18} ${46 + wave * (i + 1) * 1.5} L${i * 18} ${46 + wave * i * 1.5} Z`} fill={c} stroke={INK} strokeWidth={1} />
        ))}
      </g>
    </g>
  );
};

// Log hut (isba). burnt: charred walls, roof gone, only the chimney standing; `fire` adds flames.
export const Isba = ({ x, y, scale = 1, burnt = false, fire = 0, seed = 0, snow = 0 }: Fig & { burnt?: boolean; fire?: number; seed?: number; snow?: number }) => {
  const wall = burnt ? "#3a2e26" : "#8a6440";
  const shade = burnt ? "#241c18" : "#6e4e30";
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx={0} cy={1} rx={60} ry={4} fill="#000" opacity={0.25} />
      {burnt ? (
        <path d="M-50 0 L-50 -34 L-36 -46 L-22 -30 L-6 -52 L10 -36 L26 -48 L50 -30 L50 0 Z" fill={wall} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      ) : (
        <g>
          <rect x={-50} y={-50} width={100} height={50} fill={wall} stroke={INK} strokeWidth={1.5} />
          <path d="M-60 -48 L0 -92 L60 -48 Z" fill={shade} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
          {snow > 0 && <path d="M-60 -48 L0 -92 L60 -48 L50 -50 L0 -84 L-50 -50 Z" fill="#f2f6f8" opacity={snow} />}
          <rect x={-14} y={-36} width={20} height={16} fill="#e9c46a" stroke={INK} strokeWidth={1.3} />
          <path d="M-4 -36 L-4 -20 M-14 -28 L6 -28" stroke={INK} strokeWidth={1.2} />
        </g>
      )}
      {Array.from({ length: 5 }, (_, i) => <line key={i} x1={-50} y1={-8 - i * 9} x2={50} y2={-8 - i * 9} stroke={shade} strokeWidth={2} opacity={burnt ? 0.6 : 0.8} />)}
      <rect x={24} y={burnt ? -70 : -86} width={12} height={burnt ? 70 : 24} fill="#6a6058" stroke={INK} strokeWidth={1.3} />
      {fire > 0 && (
        <g>
          <Smoke x={0} y={-60} size={40} seed={seed} k={fire} />
          <Fire x={-20} y={-30} size={64} seed={seed} k={fire} />
          <Fire x={14} y={-26} size={52} seed={seed + 5} k={fire} />
        </g>
      )}
    </g>
  );
};

// Snowdrift ground strip with a few lumps; drawn from `ground` down.
export const SnowGround = ({ x, W, ground, H, s, seed = 0 }: { x: number; W: number; ground: number; H: number; s: number; seed?: number }) => (
  <g>
    <rect x={x} y={ground} width={W} height={H} fill="#e6edf1" />
    {Array.from({ length: 8 }, (_, i) => {
      const lx = x + (i / 7) * W + (random(`sg${seed}${i}`) - 0.5) * 60 * s;
      return <ellipse key={i} cx={lx} cy={ground + 4 * s} rx={(50 + random(`sgr${seed}${i}`) * 50) * s} ry={10 * s} fill="#f6f9fb" />;
    })}
  </g>
);

// Onion-domed village church (memorial scene).
export const Church = ({ x, y, scale = 1, snow = 0 }: Fig & { snow?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <ellipse cx={0} cy={1} rx={56} ry={4} fill="#000" opacity={0.25} />
    <rect x={-44} y={-70} width={88} height={70} fill="#ece6d8" stroke={INK} strokeWidth={1.5} />
    <rect x={-16} y={-120} width={32} height={50} fill="#e2dac8" stroke={INK} strokeWidth={1.5} />
    <path d="M-20 -120 Q-24 -146 0 -162 Q24 -146 20 -120 Z" fill="#3f8f6a" stroke={INK} strokeWidth={1.5} />
    {snow > 0 && <path d="M-18 -132 Q-14 -150 0 -160 Q14 -150 18 -132 Q0 -142 -18 -132 Z" fill="#f6f9fb" opacity={snow} />}
    <line x1={0} y1={-162} x2={0} y2={-184} stroke="#d9b45a" strokeWidth={3} />
    <line x1={-7} y1={-176} x2={7} y2={-176} stroke="#d9b45a" strokeWidth={3} />
    <path d="M-10 0 L-10 -30 Q0 -40 10 -30 L10 0 Z" fill="#5a4030" stroke={INK} strokeWidth={1.3} />
    <rect x={-6} y={-106} width={12} height={18} rx={6} fill="#ffd27a" stroke={INK} strokeWidth={1.1} />
    {[-30, 22].map((wx) => <rect key={wx} x={wx} y={-56} width={10} height={16} rx={5} fill="#ffd27a" stroke={INK} strokeWidth={1.1} />)}
  </g>
);
