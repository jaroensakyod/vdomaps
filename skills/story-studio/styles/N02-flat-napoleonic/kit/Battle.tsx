import { interpolate, random, useCurrentFrame } from "remotion";
import { Fire, Smoke } from "../../../components/Figures";

// Battle and retreat pieces for the Napoleonic figures (kit/Period.tsx): side view, feet at y = 0, ~120 units
// tall at scale 1, two-tone fills + 1.5 px dark outline #1b1d24, small idle motion.
const INK = "#1b1d24";
type Fig = { x: number; y: number; scale?: number; phase?: number; flip?: boolean };
const T = (x: number, y: number, scale: number, flip: boolean) => `translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

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

// Low hills / town silhouette for a harbour backdrop.
export const Hills = ({ x, W, ground, s, color = "#6b7a5a" }: { x: number; W: number; ground: number; s: number; color?: string }) => (
  <path d={`M${x} ${ground} Q${x + W * 0.15} ${ground - 90 * s} ${x + W * 0.32} ${ground - 40 * s} Q${x + W * 0.5} ${ground - 120 * s} ${x + W * 0.7} ${ground - 50 * s} Q${x + W * 0.85} ${ground - 80 * s} ${x + W} ${ground - 30 * s} L${x + W} ${ground} Z`} fill={color} />
);
