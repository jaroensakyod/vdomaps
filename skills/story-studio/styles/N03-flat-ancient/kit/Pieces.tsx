import { random, useCurrentFrame } from "remotion";
import { Elephant, IBERIAN, LIBYAN, Warrior, type Kit } from "./Ancient";

// Ancient Mediterranean pieces (Hannibal, Rome, Carthage) to go with kit/Ancient.tsx: side view, feet at y = 0,
// two-tone fills + 1.5 px dark outline #1b1d24, small idle motion.
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

// Pack load (bundles lashed together) to sit on a horse's back: draw at the horse's (x, y) with its scale.
export const PackLoad = ({ x, y, scale = 1, flip = false }: Fig) => (
  <g transform={T(x, y, scale, flip)}>
    <rect x={-26} y={-104} width={26} height={24} rx={5} fill="#c8a86a" stroke={INK} strokeWidth={1.4} />
    <rect x={2} y={-100} width={22} height={20} rx={5} fill="#a8865a" stroke={INK} strokeWidth={1.4} />
    <path d="M-22 -92 L20 -92" stroke="#5a3a22" strokeWidth={2.5} />
    <path d="M-13 -104 L-13 -80 M13 -100 L13 -80" stroke="#5a3a22" strokeWidth={2} />
  </g>
);

// Full moon with a soft halo.
export const Moon = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <g>
    <circle cx={x} cy={y} r={r * 2.4} fill="#dfe8ff" opacity={0.12} />
    <circle cx={x} cy={y} r={r * 1.5} fill="#dfe8ff" opacity={0.18} />
    <circle cx={x} cy={y} r={r} fill="#f3f1e2" />
    <circle cx={x - r * 0.3} cy={y - r * 0.2} r={r * 0.2} fill="#d8d4bf" />
    <circle cx={x + r * 0.35} cy={y + r * 0.3} r={r * 0.14} fill="#d8d4bf" />
  </g>
);

// Tree: conifer (dark) or larch in autumn gold. ~120 units tall at scale 1.
export const Tree = ({ x, y, scale = 1, color = "#2f4a34", snow = 0, phase = 0 }: Fig & { color?: string; snow?: number }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.05 + phase) * 1.5;
  return (
    <g transform={`${T(x, y, scale, false)} rotate(${sway})`}>
      <rect x={-4} y={-20} width={8} height={20} fill="#4a3424" stroke={INK} strokeWidth={1.2} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M0 ${-124 + i * 30} L${-26 - i * 8} ${-64 + i * 22} L${26 + i * 8} ${-64 + i * 22} Z`} fill={color} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
      ))}
      {snow > 0 && [0, 1, 2].map((i) => <path key={`s${i}`} d={`M0 ${-124 + i * 30} L${-12 - i * 4} ${-96 + i * 30} L${12 + i * 4} ${-96 + i * 30} Z`} fill="#f4f8fb" opacity={snow} />)}
    </g>
  );
};

// A marching column across a panel: "w" warrior, "e" elephant, "h" horse, "p" pack horse.
// loop = the column wraps around the panel width (endless march); else it just advances from x.
export const Column = ({ x, y, W, s, sc, order = "wwewwe", kits = [LIBYAN, IBERIAN], speed = 1, t0 = 0, pose = "walk", flip = false, cloak = 0, snow = 0, loop = true, gap, size = 1 }: { x: number; y: number; W: number; s: number; sc: number; order?: string; kits?: Kit[]; speed?: number; t0?: number; pose?: "walk" | "stand" | "trudge" | "charge"; flip?: boolean; cloak?: number; snow?: number; loop?: boolean; gap?: number; size?: number }) => {
  const frame = useCurrentFrame();
  const n = order.length;
  const g = gap ?? (W + 240 * s) / n;
  const span = n * g;
  const off = Math.max(0, frame - t0) * speed * s;
  return (
    <g>
      {order.split("").map((t, i) => {
        const d = loop ? ((((i * g + off) % span) + span) % span) - 120 * s : i * g + off;
        const px = flip ? x + W - d : x + d;
        const walk = pose !== "stand";
        if (t === "e") return <Elephant key={i} x={px} y={y} scale={sc * 0.5 * size} phase={i} flip={flip} walk={walk} snow={snow} />;
        if (t === "h" || t === "p")
          return (
            <g key={i}>
              <Horse x={px} y={y} scale={sc * 0.62 * size} phase={i} flip={flip} gait={walk ? "walk" : "stand"} coat={i % 2 ? "#6b4a2e" : "#8a6a48"} />
              {t === "p" && <PackLoad x={px} y={y} scale={sc * 0.62 * size} flip={flip} />}
            </g>
          );
        return <Warrior key={i} x={px} y={y} scale={sc * 0.6 * size} phase={i * 1.3} flip={flip} kit={kits[i % kits.length]} pose={pose} cloak={cloak} />;
      })}
    </g>
  );
};

// Hannibal: bronze helmet with a red crest, red cloak, seated (for an elephant) or as a bust.
const HannibalHead = ({ patch = 0 }: { patch?: number }) => (
  <g>
    <ellipse cx={0} cy={0} rx={10} ry={11} fill="#c08a62" stroke={INK} strokeWidth={1.5} />
    <path d="M-8 4 Q0 14 8 6 Q6 12 0 13 Q-6 12 -8 4 Z" fill="#2a1d14" />
    {patch < 0.5 ? <circle cx={5} cy={-1} r={1.4} fill={INK} /> : null}
    {patch > 0 && <path d="M-11 -13 L12 -2 L12 2 L-11 -9 Z" fill="#e9dcc0" stroke={INK} strokeWidth={0.8} opacity={patch} />}
    {patch > 0 && <ellipse cx={5} cy={-1} rx={4} ry={3.5} fill="#e9dcc0" stroke={INK} strokeWidth={0.8} opacity={patch} />}
    <path d="M-11 -2 Q-12 -17 0 -17 Q12 -17 11 -2 Q2 -8 -11 -2 Z" fill="#c9a24a" stroke={INK} strokeWidth={1.3} />
    <path d="M-7 -17 Q-2 -32 10 -17" fill="#b8322a" stroke={INK} strokeWidth={1} />
  </g>
);

const HannibalSeated = ({ patch = 0 }: { patch?: number }) => {
  const frame = useCurrentFrame();
  const flap = Math.sin(frame * 0.12) * 3;
  return (
    <g>
      <path d={`M-8 -36 Q-26 -24 ${-30 - flap} 0 L-6 -6 Z`} fill="#8e2620" stroke={INK} strokeWidth={1.2} />
      <path d="M-4 -6 L12 -4 L10 22 L4 22 Z" fill="#c08a62" stroke={INK} strokeWidth={1.4} />
      <path d="M-11 -42 Q-12 -22 -10 -2 L10 -2 Q11 -22 10 -42 Q0 -47 -11 -42 Z" fill="#c9a24a" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-10 -26 L10 -26" stroke="#8a6a2a" strokeWidth={2} />
      <rect x={-3} y={-50} width={7} height={7} fill="#c08a62" />
      <g transform="translate(1,-60)">
        <HannibalHead patch={patch} />
      </g>
      <path d="M4 -38 Q14 -30 22 -30" stroke="#c9a24a" strokeWidth={7} strokeLinecap="round" fill="none" />
    </g>
  );
};

// Hannibal riding an elephant (the elephant's mahout stays on the neck).
export const HannibalOnElephant = ({ x, y, scale = 1, phase = 0, flip = false, walk = true, thin = 0, patch = 0, snow = 0 }: Fig & { walk?: boolean; thin?: number; patch?: number; snow?: number }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.14 + phase;
  const bob = walk ? -Math.abs(Math.sin(t)) * 2 : Math.sin(frame * 0.05 + phase) * 0.8;
  return (
    <g>
      <Elephant x={x} y={y} scale={scale} phase={phase} flip={flip} walk={walk} thin={thin} snow={snow} />
      <g transform={`translate(${x},${y + bob * scale}) scale(${flip ? -scale : scale},${scale})`}>
        <g transform="translate(-2,-118)">
          <HannibalSeated patch={patch} />
        </g>
      </g>
    </g>
  );
};

// Roman senator in a white toga, one arm raised in alarm (`alarm` 0 → 1).
export const Senator = ({ x, y, scale = 1, phase = 0, flip = false, alarm = 0 }: Fig & { alarm?: number }) => {
  const frame = useCurrentFrame();
  const b = Math.sin(frame * 0.06 + phase) * 0.6;
  const arm = -20 - alarm * 90 + Math.sin(frame * 0.3 + phase) * 6 * alarm;
  return (
    <g transform={T(x, y + b, scale, flip)}>
      <ellipse cx={0} cy={1} rx={16} ry={3} fill="#000" opacity={0.3} />
      <path d="M-14 -88 Q-18 -40 -16 0 L16 0 Q18 -40 14 -88 Q0 -94 -14 -88 Z" fill="#f2efe6" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-12 -84 Q4 -60 14 -20" stroke="#a8322a" strokeWidth={4} fill="none" />
      <path d="M6 -88 Q14 -50 14 0 L16 0 Q18 -40 14 -88 Z" fill="#d8d3c4" />
      <rect x={-3} y={-96} width={7} height={7} fill="#e2b48e" />
      <g transform="translate(1,-105)">
        <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill="#e2b48e" stroke={INK} strokeWidth={1.5} />
        <circle cx={5} cy={0} r={1.3} fill={INK} />
        <path d="M-10 -3 Q-6 -13 4 -12 Q10 -10 10 -4 Q2 -9 -10 -3 Z" fill="#cfcac0" />
        {alarm > 0.3 && <ellipse cx={6} cy={6} rx={2.4} ry={3 * alarm} fill={INK} />}
      </g>
      <g transform={`translate(2,-82) rotate(${arm})`}>
        <path d="M0 0 L28 0" stroke="#f2efe6" strokeWidth={8} strokeLinecap="round" />
        <circle cx={30} cy={0} r={3.6} fill="#e2b48e" stroke={INK} strokeWidth={1.1} />
      </g>
    </g>
  );
};

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
