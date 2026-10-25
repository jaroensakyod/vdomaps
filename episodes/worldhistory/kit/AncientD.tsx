import { useCurrentFrame } from "remotion";
import { Horse } from "./PeriodD";
import { type Kit, LIBYAN } from "./Ancient";

// Ancient pieces for Ep 2 ch7–ch8 (Fabius, Cannae, Zama, exile), drawn like kit/Ancient.tsx:
// side view, feet at y = 0, two-tone fills + 1.5 px dark outline, small idle motion.
const INK = "#1b1d24";
type Fig = { x: number; y: number; scale?: number; phase?: number; flip?: boolean };
const T = (x: number, y: number, scale: number, flip: boolean) => `translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`;

// Commander: bronze cuirass, long cloak, crested helmet. `point` raises the right arm (0 → 1).
export const General = ({ x, y, scale = 1, phase = 0, flip = false, cloak = "#b8322a", crest = "#c8312b", armor = "#c9a24a", skin = "#e2b48e", point = 0 }: Fig & { cloak?: string; crest?: string; armor?: string; skin?: string; point?: number }) => {
  const frame = useCurrentFrame();
  const wave = Math.sin(frame * 0.08 + phase) * 3;
  const bob = Math.sin(frame * 0.06 + phase) * 0.6;
  const arm = 20 - point * 95;
  return (
    <g transform={T(x, y + bob, scale, flip)}>
      <ellipse cx={0} cy={1} rx={16} ry={3} fill="#000" opacity={0.3} />
      {/* cloak behind */}
      <path d={`M-10 -90 Q-22 -60 ${-26 + wave} -18 Q-10 -12 4 -20 L8 -88 Z`} fill={cloak} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      {/* legs */}
      {[-5, 5].map((lx) => (
        <g key={lx}>
          <path d={`M${lx - 4} -42 L${lx + 4} -42 L${lx + 3.5} -2 L${lx - 3.5} -2 Z`} fill={skin} stroke={INK} strokeWidth={1.3} />
          <path d={`M${lx - 4} -16 L${lx + 4.5} -16 L${lx + 5} 1 L${lx - 4} 1 Z`} fill="#6b4a2b" stroke={INK} strokeWidth={1.1} />
        </g>
      ))}
      {/* pteruges (leather strips) */}
      {[-10, -5, 0, 5].map((px) => <rect key={px} x={px} y={-50} width={5} height={13} fill="#8a5a32" stroke={INK} strokeWidth={0.9} />)}
      {/* cuirass */}
      <path d="M-12 -88 Q-14 -66 -11 -48 L11 -48 Q14 -66 12 -88 Q0 -93 -12 -88 Z" fill={armor} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-6 -80 Q0 -76 6 -80 M-6 -66 Q0 -62 6 -66" stroke={INK} strokeWidth={1} fill="none" opacity={0.5} />
      <path d="M-12 -50 L12 -50" stroke="#5a3a22" strokeWidth={3} />
      {/* cloak over the shoulder */}
      <path d="M-13 -90 Q-2 -96 12 -88 L10 -82 Q-2 -86 -12 -82 Z" fill={cloak} stroke={INK} strokeWidth={1.2} />
      <rect x={-3} y={-96} width={7} height={7} fill={skin} />
      {/* head + helmet with a transverse crest */}
      <g transform="translate(1,-105)">
        <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.5} />
        <circle cx={5} cy={0} r={1.3} fill={INK} />
        <path d="M-10 -1 Q-11 -15 0 -15 Q11 -15 10 -1 Q2 -6 -10 -1 Z" fill={armor} stroke={INK} strokeWidth={1.3} />
        <path d="M-12 -14 Q0 -32 12 -14 Q0 -20 -12 -14 Z" fill={crest} stroke={INK} strokeWidth={1.1} />
        <path d="M-9 -2 L-9 8 L-4 8 L-4 -1 Z" fill={armor} stroke={INK} strokeWidth={1} />
      </g>
      {/* arm */}
      <g transform={`translate(8,-86) rotate(${arm})`}>
        <path d="M-3.5 0 L3.5 0 L3 32 L-3 32 Z" fill={skin} stroke={INK} strokeWidth={1.3} />
      </g>
      <path d="M-11 -84 L-14 -54" stroke={skin} strokeWidth={6} strokeLinecap="round" />
      <path d="M-11 -84 L-14 -54" stroke={INK} strokeWidth={1} opacity={0.5} />
    </g>
  );
};

// Roman citizen in a toga; `raise` lifts a pointing arm (mocking), with a little shake when > 0.
export const Citizen = ({ x, y, scale = 1, phase = 0, flip = false, toga = "#efe9da", tunic = "#c9b48a", skin = "#e2b48e", hair = "#3a2a1a", raise = 0 }: Fig & { toga?: string; tunic?: string; skin?: string; hair?: string; raise?: number }) => {
  const frame = useCurrentFrame();
  const shake = raise > 0 ? Math.sin(frame * 0.5 + phase) * 6 * raise : 0;
  const bob = Math.sin(frame * 0.07 + phase) * 0.8 + (raise > 0 ? -Math.abs(Math.sin(frame * 0.25 + phase)) * 1.5 : 0);
  return (
    <g transform={T(x, y + bob, scale, flip)}>
      <ellipse cx={0} cy={1} rx={15} ry={3} fill="#000" opacity={0.3} />
      <path d="M-6 -6 L-1 -6 L-1 1 L-8 1 Z M2 -6 L7 -6 L9 1 L2 1 Z" fill="#6b4a2b" stroke={INK} strokeWidth={1} />
      <path d="M-13 -86 Q-17 -40 -14 -6 L14 -6 Q17 -40 13 -86 Q0 -92 -13 -86 Z" fill={tunic} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      {/* toga: wrapped over the left shoulder, hanging in folds */}
      <path d="M-14 -88 Q4 -90 12 -78 Q16 -40 10 -6 L-15 -6 Q-18 -46 -14 -88 Z" fill={toga} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-12 -86 Q2 -60 12 -40 M-14 -60 Q-2 -40 6 -10 M-15 -36 Q-8 -22 -6 -8" stroke={INK} strokeWidth={0.9} fill="none" opacity={0.35} />
      <rect x={-3} y={-95} width={7} height={8} fill={skin} />
      <g transform="translate(1,-104)">
        <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.5} />
        <circle cx={5} cy={-1} r={1.3} fill={INK} />
        <path d="M-10 -2 Q-10 -13 1 -12 Q10 -12 9 -5 Q2 -9 -10 -2 Z" fill={hair} />
        {raise > 0 && <path d="M3 5 Q6 8 9 5" stroke={INK} strokeWidth={1.2} fill="none" />}
      </g>
      <g transform={`translate(9,-84) rotate(${20 - raise * 110 + shake})`}>
        <path d="M-3.5 0 L3.5 0 L3 30 L-3 30 Z" fill={skin} stroke={INK} strokeWidth={1.3} />
      </g>
    </g>
  );
};

// Horseman: a light rider (javelins, round shield) on a horse from kit/PeriodD.
export const Cavalry = ({ x, y, scale = 1, phase = 0, flip = false, kit = LIBYAN, coat = "#7a4a28", gait = "gallop" }: Fig & { kit?: Kit; coat?: string; gait?: "stand" | "walk" | "gallop" }) => {
  const frame = useCurrentFrame();
  const sp = gait === "gallop" ? 0.45 : gait === "walk" ? 0.2 : 0;
  const bob = gait === "stand" ? 0 : -Math.abs(Math.sin(frame * sp + phase)) * (gait === "gallop" ? 5 : 2);
  const skin = kit === LIBYAN ? "#8a5a3a" : "#e2b48e";
  return (
    <g transform={T(x, y, scale, flip)}>
      <Horse x={0} y={0} gait={gait} phase={phase} coat={coat} />
      <g transform={`translate(0,${bob - 80})`}>
        <path d="M-2 -2 L10 18 L8 36" stroke={skin} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M-12 -46 Q-13 -24 -10 -2 L10 -2 Q11 -24 10 -46 Q0 -50 -12 -46 Z" fill={kit.tunic} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
        <rect x={-3} y={-54} width={7} height={8} fill={skin} />
        <g transform="translate(1,-62)">
          <ellipse cx={0} cy={0} rx={9} ry={10} fill={skin} stroke={INK} strokeWidth={1.5} />
          <circle cx={5} cy={-1} r={1.3} fill={INK} />
          <path d="M-10 -1 Q-11 -14 0 -14 Q11 -14 10 -1 Q2 -6 -10 -1 Z" fill={kit.helmet} stroke={INK} strokeWidth={1.3} />
          {kit.crest && <path d="M-6 -14 Q0 -24 8 -14" fill={kit.crest} stroke={INK} strokeWidth={1} />}
        </g>
        <line x1={-4} y1={-20} x2={34} y2={-74} stroke="#6b4a2b" strokeWidth={2.4} strokeLinecap="round" />
        <path d="M34 -74 L33 -86 L39 -76 Z" fill="#c9ced3" stroke={INK} strokeWidth={1} />
        <circle cx={-6} cy={-24} r={13} fill={kit.shield} stroke={INK} strokeWidth={1.5} />
        <circle cx={-6} cy={-24} r={3} fill="#d9b45a" stroke={INK} strokeWidth={1} />
      </g>
    </g>
  );
};

// Roman standard (signum): pole with discs, a crossbar and a red banner. `fall` tips it over (0 → 1).
export const Signum = ({ x, y, scale = 1, phase = 0, fall = 0, broken = false }: Fig & { fall?: number; broken?: boolean }) => {
  const frame = useCurrentFrame();
  const sway = fall > 0 ? 0 : Math.sin(frame * 0.06 + phase) * 1.5;
  return (
    <g transform={`translate(${x},${y}) scale(${scale}) rotate(${sway + fall * 72})`}>
      <line x1={0} y1={0} x2={0} y2={broken ? -110 : -190} stroke="#6b4a2b" strokeWidth={4} strokeLinecap="round" />
      {[-60, -78, -96].map((dy) => <circle key={dy} cx={0} cy={dy} r={7} fill="#d9b45a" stroke={INK} strokeWidth={1.2} />)}
      {!broken && (
        <g>
          <line x1={-18} y1={-150} x2={18} y2={-150} stroke="#6b4a2b" strokeWidth={3} />
          <path d={`M-16 -150 L16 -150 L16 -114 Q0 ${-110 + Math.sin(frame * 0.1 + phase) * 2} -16 -114 Z`} fill="#b8322a" stroke={INK} strokeWidth={1.4} />
          <path d="M-12 -142 L12 -142" stroke="#d9b45a" strokeWidth={2.5} />
          <path d="M-5 -192 L0 -206 L5 -192 Z" fill="#d9b45a" stroke={INK} strokeWidth={1} />
          <circle cx={0} cy={-170} r={9} fill="#d9b45a" stroke={INK} strokeWidth={1.2} />
        </g>
      )}
      {broken && <path d="M-3 -110 L2 -118 L4 -108 Z" fill="#6b4a2b" />}
    </g>
  );
};

// Ancient war galley with a ram, a square sail and a row of oars. ~300 long, waterline at y = 0.
export const Galley = ({ x, y, scale = 1, phase = 0, flip = false, sail = "#e9dcc0", stripe = "#b8322a", hull = "#6a4428" }: Fig & { sail?: string; stripe?: string; hull?: string }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.18 + phase;
  const bob = Math.sin(frame * 0.07 + phase) * 2;
  return (
    <g transform={T(x, y + bob, scale, flip)}>
      {/* oars */}
      {Array.from({ length: 10 }, (_, i) => {
        const ox = -100 + i * 21;
        const a = Math.sin(t) * 14;
        return <line key={i} x1={ox} y1={-14} x2={ox - 18 + a} y2={18} stroke="#5a3a22" strokeWidth={2.4} strokeLinecap="round" />;
      })}
      <path d="M-150 -40 Q-140 -10 -110 -6 L120 -6 L156 2 L130 -12 Q150 -30 140 -44 Z" fill={hull} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M-146 -32 L136 -32" stroke={stripe} strokeWidth={5} />
      <path d="M-150 -40 Q-168 -60 -156 -76" stroke={hull} strokeWidth={6} fill="none" strokeLinecap="round" />
      <circle cx={126} cy={-22} r={4} fill="#fff" stroke={INK} strokeWidth={1} />
      <circle cx={127} cy={-22} r={1.6} fill={INK} />
      {/* mast + sail */}
      <line x1={0} y1={-40} x2={0} y2={-170} stroke="#5a3a22" strokeWidth={4} />
      <line x1={-60} y1={-160} x2={60} y2={-160} stroke="#5a3a22" strokeWidth={3} />
      <path d={`M-58 -158 L58 -158 Q${62 + Math.sin(t * 0.4) * 3} -110 56 -62 L-56 -62 Q${-50 + Math.sin(t * 0.4) * 3} -110 -58 -158 Z`} fill={sail} stroke={INK} strokeWidth={1.4} />
      <path d="M-8 -158 L-8 -62 M8 -158 L8 -62" stroke={stripe} strokeWidth={6} opacity={0.85} />
    </g>
  );
};

// A stretch of city wall (stone, battlements, towers, a shut gate), drawn from `ground` up across x..x+W.
export const CityWall = ({ x, W, ground, s, h = 150, gate = true, color = "#cbbf9f", shade = "#a89c7c" }: { x: number; W: number; ground: number; s: number; h?: number; gate?: boolean; color?: string; shade?: string }) => {
  const top = ground - h * s;
  const merlon = 22 * s;
  const towers = [0.12, 0.5, 0.88];
  return (
    <g>
      <rect x={x} y={top} width={W} height={h * s} fill={color} stroke={INK} strokeWidth={1.5 * s} />
      {Array.from({ length: Math.ceil(W / (merlon * 2)) }, (_, i) => <rect key={i} x={x + i * merlon * 2} y={top - 16 * s} width={merlon} height={16 * s} fill={color} stroke={INK} strokeWidth={1.2 * s} />)}
      {Array.from({ length: Math.floor(h / 22) }, (_, r) => <line key={`r${r}`} x1={x} x2={x + W} y1={top + (r + 1) * 22 * s} y2={top + (r + 1) * 22 * s} stroke={shade} strokeWidth={1.4 * s} />)}
      {towers.map((fx) => {
        const tx = x + W * fx - 40 * s;
        return (
          <g key={fx}>
            <rect x={tx} y={top - 50 * s} width={80 * s} height={(h + 50) * s} fill={shade} stroke={INK} strokeWidth={1.5 * s} />
            {[0, 1, 2].map((i) => <rect key={i} x={tx + i * 30 * s} y={top - 66 * s} width={20 * s} height={16 * s} fill={shade} stroke={INK} strokeWidth={1.2 * s} />)}
            <rect x={tx + 34 * s} y={top - 30 * s} width={12 * s} height={22 * s} rx={6 * s} fill="#2a2420" />
          </g>
        );
      })}
      {gate && (
        <g>
          <path d={`M${x + W * 0.3 - 46 * s} ${ground} L${x + W * 0.3 - 46 * s} ${ground - 80 * s} Q${x + W * 0.3} ${ground - 130 * s} ${x + W * 0.3 + 46 * s} ${ground - 80 * s} L${x + W * 0.3 + 46 * s} ${ground} Z`} fill="#6a4428" stroke={INK} strokeWidth={1.6 * s} />
          <line x1={x + W * 0.3} x2={x + W * 0.3} y1={ground - 112 * s} y2={ground} stroke={INK} strokeWidth={1.6 * s} />
          {[0.3, 0.6].map((f) => <line key={f} x1={x + W * 0.3 - 46 * s} x2={x + W * 0.3 + 46 * s} y1={ground - 100 * s * f} y2={ground - 100 * s * f} stroke="#3a2a1a" strokeWidth={3 * s} />)}
        </g>
      )}
    </g>
  );
};

// Wooden siege tower on wheels, ~210 tall at scale 1.
export const SiegeTower = ({ x, y, scale = 1, flip = false }: Fig) => (
  <g transform={T(x, y, scale, flip)}>
    <path d="M-46 -12 L-34 -210 L34 -210 L46 -12 Z" fill="#8a6a42" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
    {[-60, -110, -160].map((dy) => <line key={dy} x1={-44 + (-dy / 210) * 12} x2={44 - (-dy / 210) * 12} y1={dy} y2={dy} stroke={INK} strokeWidth={1.4} />)}
    <path d="M-40 -60 L40 -110 M40 -60 L-40 -110 M-37 -110 L37 -160 M37 -110 L-37 -160" stroke="#5a3a22" strokeWidth={2.2} />
    <rect x={-14} y={-200} width={28} height={30} fill="#3a2a1a" stroke={INK} strokeWidth={1.2} />
    {[-32, 32].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy={-12} r={12} fill="#5a3a22" stroke={INK} strokeWidth={1.5} />
        <circle cx={wx} cy={-12} r={3} fill="#c9ced3" />
      </g>
    ))}
  </g>
);

// Helmet, shield and a dropped sword lying on the ground (no figure).
export const DroppedGear = ({ x, y, scale = 1, flip = false, shield = "#8a6a3a", crest = "#d9b45a" }: Fig & { shield?: string; crest?: string }) => (
  <g transform={T(x, y, scale, flip)}>
    <ellipse cx={0} cy={2} rx={70} ry={6} fill="#000" opacity={0.25} />
    <path d="M-60 -4 Q-30 -22 20 -16 Q40 -12 36 -2 Q-10 6 -60 -4 Z" fill={shield} stroke={INK} strokeWidth={1.5} />
    <ellipse cx={-10} cy={-10} rx={8} ry={4} fill="#d9b45a" stroke={INK} strokeWidth={1} />
    <path d="M30 -2 L84 -6" stroke="#d5dade" strokeWidth={4} strokeLinecap="round" />
    <path d="M28 -6 L28 2" stroke="#6b4a2b" strokeWidth={4} />
    <g transform="translate(58,-4) rotate(-24)">
      <path d="M-16 0 Q-17 -22 0 -22 Q17 -22 16 0 Q4 -6 -16 0 Z" fill="#9aa3ab" stroke={INK} strokeWidth={1.4} />
      <path d="M-14 -20 Q0 -40 14 -20 Q0 -26 -14 -20 Z" fill={crest} stroke={INK} strokeWidth={1.1} />
    </g>
  </g>
);

// A small table with a cup and an oil lamp (quiet still life).
export const CupTable = ({ x, y, scale = 1 }: Fig) => {
  const frame = useCurrentFrame();
  const fl = 1 + Math.sin(frame * 0.5) * 0.12 + Math.sin(frame * 1.3) * 0.06;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={90} ry={6} fill="#000" opacity={0.3} />
      <rect x={-90} y={-80} width={180} height={12} rx={3} fill="#7a5233" stroke={INK} strokeWidth={1.5} />
      <path d="M-76 -68 L-70 0 L-62 0 L-66 -68 Z M76 -68 L70 0 L62 0 L66 -68 Z" fill="#5e3e26" stroke={INK} strokeWidth={1.3} />
      {/* cup (kylix on a stem) */}
      <path d="M-34 -122 Q-30 -100 -14 -98 L-4 -98 Q12 -100 16 -122 Z" fill="#c9a24a" stroke={INK} strokeWidth={1.5} />
      <path d="M-6 -98 L-6 -86 M-18 -82 L6 -82 L4 -86 L-16 -86 Z" stroke={INK} strokeWidth={1.4} fill="#b08a3a" />
      <ellipse cx={-9} cy={-122} rx={25} ry={4} fill="#3a1a1a" stroke={INK} strokeWidth={1.2} />
      {/* oil lamp */}
      <path d="M40 -80 Q44 -94 62 -94 Q74 -94 78 -86 L84 -88 L82 -82 Q70 -78 40 -80 Z" fill="#b5835a" stroke={INK} strokeWidth={1.3} />
      <g transform={`translate(84,-90) scale(${fl})`}>
        <path d="M0 0 Q-6 -10 0 -22 Q6 -10 0 0 Z" fill="#ffcf4a" />
        <path d="M0 0 Q-3 -6 0 -13 Q3 -6 0 0 Z" fill="#fff3c2" />
      </g>
      <circle cx={84} cy={-98} r={36 * fl} fill="#ffcf4a" opacity={0.12} />
    </g>
  );
};

// Temple front (columns + pediment), for the Forum; `W` wide, drawn from `ground` up.
export const Temple = ({ x, W, ground, s, color = "#e6dcc4", shade = "#c4b89a" }: { x: number; W: number; ground: number; s: number; color?: string; shade?: string }) => {
  const h = 170 * s;
  const n = 6;
  return (
    <g>
      <path d={`M${x - 10 * s} ${ground - h - 20 * s} L${x + W / 2} ${ground - h - 80 * s} L${x + W + 10 * s} ${ground - h - 20 * s} Z`} fill={color} stroke={INK} strokeWidth={1.5 * s} />
      <rect x={x - 10 * s} y={ground - h - 20 * s} width={W + 20 * s} height={20 * s} fill={shade} stroke={INK} strokeWidth={1.4 * s} />
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + (i / (n - 1)) * (W - 24 * s)} y={ground - h} width={24 * s} height={h} fill={color} stroke={INK} strokeWidth={1.3 * s} />
      ))}
      <rect x={x - 20 * s} y={ground - 4 * s} width={W + 40 * s} height={14 * s} fill={shade} stroke={INK} strokeWidth={1.3 * s} />
    </g>
  );
};

// Leather army tent.
export const ArmyTent = ({ x, y, scale = 1, color = "#b89a6a" }: Fig & { color?: string }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-70 0 L0 -80 L70 0 Z" fill={color} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
    <path d="M0 -80 L-16 0 L16 0 Z" fill="#3a2a1a" opacity={0.75} />
    <line x1={0} y1={-80} x2={0} y2={-96} stroke="#5a3a22" strokeWidth={3} />
  </g>
);
