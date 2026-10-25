import { random, useCurrentFrame } from "remotion";
import { type Kit, LIBYAN, ROMAN, Elephant } from "./Ancient";
import { Horse } from "./PeriodD";

// Ep 2 pieces for ch5–ch6 (the landslide, the pass debate, Italy), drawn like kit/Ancient.tsx:
// side view, feet at y = 0, two-tone fills + 1.5 px outline #1b1d24, small idle motion.
const INK = "#1b1d24";
type Fig = { x: number; y: number; scale?: number; phase?: number; flip?: boolean };
const T = (x: number, y: number, scale: number, flip: boolean) => `translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`;

// Soldier swinging a pick at a rock face to his right (~150 units tall).
export const Digger = ({ x, y, scale = 1, phase = 0, flip = false, kit = LIBYAN }: Fig & { kit?: Kit }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.18 + phase;
  const swing = Math.sin(t) * 38 - 10; // pick angle
  const bend = 10 + Math.sin(t) * 6;
  const skin = kit === LIBYAN ? "#8a5a3a" : "#e2b48e";
  return (
    <g transform={T(x, y, scale, flip)}>
      <ellipse cx={0} cy={1} rx={16} ry={3} fill="#000" opacity={0.3} />
      {[-8, 8].map((a, i) => (
        <g key={i} transform={`translate(0,-40) rotate(${a})`} opacity={i ? 1 : 0.85}>
          <path d="M-4.5 0 L4.5 0 L4 38 L-3.5 38 Z" fill={skin} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M-4 30 L5 30 L5 41 L-4 41 Z" fill="#6b4a2b" stroke={INK} strokeWidth={1.1} />
        </g>
      ))}
      <g transform={`rotate(${bend},0,-40)`}>
        <path d="M-11 -86 Q-13 -64 -12 -42 L12 -42 Q13 -64 11 -86 Q0 -91 -11 -86 Z" fill={kit.tunic} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M4 -88 Q10 -66 10 -42 L12 -42 Q13 -64 11 -86 Z" fill={kit.shade} />
        <path d="M-12 -46 L12 -46" stroke="#5a3a22" strokeWidth={3} />
        <rect x={-3} y={-94} width={7} height={7} fill={skin} />
        <g transform="translate(1,-103)">
          <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.5} />
          <circle cx={5} cy={0} r={1.3} fill={INK} />
          <path d="M-10 -1 Q-11 -15 0 -15 Q11 -15 10 -1 Q2 -6 -10 -1 Z" fill="#6a5a48" stroke={INK} strokeWidth={1.3} />
        </g>
        {/* arms + pick, pivoting at the shoulder */}
        <g transform={`translate(2,-80) rotate(${swing})`}>
          <path d="M0 0 L26 -6" stroke={kit.tunic} strokeWidth={7} strokeLinecap="round" />
          <circle cx={27} cy={-6} r={3.6} fill={skin} stroke={INK} strokeWidth={1.1} />
          <line x1={20} y1={-4} x2={58} y2={-14} stroke="#6b4a2b" strokeWidth={4} strokeLinecap="round" />
          <path d="M52 -34 Q60 -16 62 4 L58 4 Q56 -14 48 -30 Z" fill="#9aa3ab" stroke={INK} strokeWidth={1.2} />
        </g>
      </g>
    </g>
  );
};

// Rock chips flying from a point (k = 0 → 1 strength).
export const Chips = ({ x, y, s, seed = 0, k = 1 }: { x: number; y: number; s: number; seed?: number; k?: number }) => {
  const frame = useCurrentFrame();
  if (k <= 0) return null;
  return (
    <g opacity={k}>
      {Array.from({ length: 6 }, (_, i) => {
        const p = ((frame + i * 5 + seed * 7) % 24) / 24;
        const a = -0.4 - random(`ca${seed}${i}`) * 2.2;
        const r = p * (24 + random(`cr${seed}${i}`) * 26) * s;
        return <rect key={i} x={x + Math.cos(a) * r} y={y + Math.sin(a) * r + p * p * 30 * s} width={4 * s} height={4 * s} fill="#8a8478" opacity={1 - p} />;
      })}
    </g>
  );
};

// A grey rock face from x0 to the right edge with cracks; `heat` 0 → 1 glows it orange, `crack` 0 → 1 opens the cracks.
export const RockFace = ({ x, y, W, H, s, heat = 0, crack = 0, steam = 0 }: { x: number; y: number; W: number; H: number; s: number; heat?: number; crack?: number; steam?: number }) => {
  const frame = useCurrentFrame();
  const c = (a: string) => a;
  return (
    <g>
      <path d={`M${x + 30 * s} ${y} L${x + W} ${y} L${x + W} ${y + H} L${x} ${y + H} Q${x + 10 * s} ${y + H * 0.5} ${x + 30 * s} ${y} Z`} fill={c("#7d7a74")} stroke={INK} strokeWidth={1.5 * s} />
      <path d={`M${x + 60 * s} ${y + H * 0.1} L${x + W} ${y + H * 0.05} L${x + W} ${y + H * 0.3} Q${x + W * 0.5} ${y + H * 0.25} ${x + 50 * s} ${y + H * 0.35} Z`} fill="#6a6762" opacity={0.7} />
      {heat > 0 && <ellipse cx={x + W * 0.28} cy={y + H * 0.62} rx={W * 0.26} ry={H * 0.3} fill="#ff7a2a" opacity={0.35 * heat} style={{ filter: `blur(${14 * s}px)` }} />}
      {[0, 1, 2, 3].map((i) => {
        const cx = x + W * (0.14 + i * 0.12);
        const cy = y + H * (0.32 + (i % 2) * 0.14);
        const L = (40 + i * 10) * s * (0.3 + 0.7 * crack);
        return <path key={i} d={`M${cx} ${cy} l${10 * s} ${L * 0.4} l${-8 * s} ${L * 0.35} l${12 * s} ${L * 0.4}`} fill="none" stroke={INK} strokeWidth={(1.5 + crack * 2) * s} />;
      })}
      {steam > 0 &&
        Array.from({ length: 5 }, (_, i) => {
          const p = ((frame * 0.8 + i * 13) % 60) / 60;
          return <circle key={i} cx={x + W * (0.12 + i * 0.07) + Math.sin(frame * 0.05 + i) * 6 * s} cy={y + H * 0.5 - p * H * 0.6} r={(10 + p * 20) * s} fill="#eef0f2" opacity={steam * 0.5 * (1 - p)} />;
        })}
    </g>
  );
};

// Small wooden bucket (vinegar / water) with a dipper.
export const Bucket = ({ x, y, scale = 1 }: Fig) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-16 0 L-19 -30 L19 -30 L16 0 Z" fill="#8a5a32" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    <path d="M-18 -22 L18 -22 M-17 -8 L17 -8" stroke="#4a3424" strokeWidth={2.4} />
    <ellipse cx={0} cy={-30} rx={19} ry={4} fill="#6a3a3a" stroke={INK} strokeWidth={1.2} />
    <path d="M6 -32 L22 -54" stroke="#6b4a2b" strokeWidth={3} strokeLinecap="round" />
  </g>
);

// Rider for PeriodD's Horse (same transform): a Numidian (bare-headed, javelins, no armour) or a Roman (helmet,
// crest, red cloak). Use `Horseman` to draw both.
const RiderFig = ({ roman, phase }: { roman: boolean; phase: number }) => {
  const frame = useCurrentFrame();
  const flap = Math.sin(frame * 0.4 + phase) * 4;
  const skin = roman ? "#e2b48e" : "#7a4a2e";
  const tunic = roman ? ROMAN.tunic : "#e9dcc0";
  return (
    <g transform="translate(-4,-80)">
      {roman && <path d={`M-8 -40 Q-30 -30 ${-40 - flap} -8 L-10 -10 Z`} fill="#8e2620" stroke={INK} strokeWidth={1.2} />}
      <path d="M-4 -6 L10 -4 L9 24 L3 24 Z" fill={skin} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M-11 -44 Q-12 -24 -10 -4 L10 -4 Q11 -24 10 -44 Q0 -49 -11 -44 Z" fill={tunic} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      {roman && <path d="M-10 -42 L10 -42 L10 -22 L-10 -22 Z" fill="#9aa3ab" stroke={INK} strokeWidth={1.1} />}
      <rect x={-3} y={-52} width={7} height={7} fill={skin} />
      <g transform="translate(1,-62)">
        <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.5} />
        <circle cx={5} cy={0} r={1.3} fill={INK} />
        {roman ? (
          <g>
            <path d="M-10 -1 Q-11 -15 0 -15 Q11 -15 10 -1 Q2 -6 -10 -1 Z" fill="#9aa3ab" stroke={INK} strokeWidth={1.3} />
            <path d="M-7 -15 Q0 -28 9 -15" fill="#2a2a2a" stroke={INK} strokeWidth={1} />
          </g>
        ) : (
          <path d="M-10 -2 Q-10 -13 0 -13 Q10 -13 10 -3 Q4 -8 -10 -2 Z" fill="#1c1410" />
        )}
      </g>
      {/* arm forward: javelin (Numidian) or sword (Roman) */}
      {roman ? (
        <g>
          <path d="M4 -40 Q16 -42 24 -50" stroke={tunic} strokeWidth={7} strokeLinecap="round" fill="none" />
          <line x1={24} y1={-50} x2={44} y2={-70} stroke="#d5dade" strokeWidth={3.5} strokeLinecap="round" />
          <ellipse cx={-12} cy={-26} rx={11} ry={20} fill={ROMAN.shield} stroke={INK} strokeWidth={1.4} />
        </g>
      ) : (
        <g>
          <path d="M4 -40 Q12 -50 14 -60" stroke={tunic} strokeWidth={7} strokeLinecap="round" fill="none" />
          <line x1={-10} y1={-40} x2={40} y2={-78} stroke="#6b4a2b" strokeWidth={2.6} strokeLinecap="round" />
          <path d="M40 -78 L48 -86 L43 -76 Z" fill="#c9ced3" stroke={INK} strokeWidth={0.8} />
          <circle cx={-12} cy={-28} r={13} fill="#c9a86a" stroke={INK} strokeWidth={1.4} />
        </g>
      )}
    </g>
  );
};

export const Horseman = ({ x, y, scale = 1, phase = 0, flip = false, roman = false, gait = "gallop" }: Fig & { roman?: boolean; gait?: "stand" | "walk" | "gallop" }) => {
  const frame = useCurrentFrame();
  const sp = gait === "gallop" ? 0.45 : gait === "walk" ? 0.2 : 0;
  const bob = gait === "stand" ? 0 : -Math.abs(Math.sin(frame * sp + phase)) * (gait === "gallop" ? 5 : 2);
  return (
    <g>
      <Horse x={x} y={y} scale={scale} phase={phase} flip={flip} gait={gait} coat={roman ? "#5a3a24" : "#8a6a48"} />
      <g transform={T(x, y + bob * scale, scale, flip)}>
        <RiderFig roman={roman} phase={phase} />
      </g>
    </g>
  );
};

// Bronze tablet on a stone plinth; `k` 0 → 1 engraves the lines one by one.
export const BronzeTablet = ({ x, y, s, lines, k = 1, font }: { x: number; y: number; s: number; lines: string[]; k?: number; font: string }) => {
  const frame = useCurrentFrame();
  const glint = ((frame % 90) / 90) * 360 - 60;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-170} y={-12} width={340} height={24} fill="#a9a196" stroke={INK} strokeWidth={1.6} />
      <defs>
        <linearGradient id="bronzeC" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d49a52" />
          <stop offset="0.6" stopColor="#a8682c" />
          <stop offset="1" stopColor="#7a4a1c" />
        </linearGradient>
        <clipPath id="bronzeClip">
          <rect x={-150} y={-240} width={300} height={228} rx={10} />
        </clipPath>
      </defs>
      <rect x={-150} y={-240} width={300} height={228} rx={10} fill="url(#bronzeC)" stroke={INK} strokeWidth={2} />
      <rect x={-138} y={-228} width={276} height={204} rx={6} fill="none" stroke="#5a3410" strokeWidth={2} opacity={0.6} />
      {[-140, 140].map((cx) => [-230, -22].map((cy) => <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={4} fill="#5a3410" />))}
      {lines.map((t, i) => {
        const o = Math.max(0, Math.min(1, k * lines.length - i));
        return (
          <text key={i} x={0} y={-180 + i * 54} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={i === 0 ? 30 : 40} fill="#3a1e08" opacity={o} letterSpacing={2}>
            {t}
          </text>
        );
      })}
      <g clipPath="url(#bronzeClip)">
        <rect x={glint} y={-260} width={40} height={300} fill="#fff3d0" opacity={0.25} transform={`skewX(-20)`} />
      </g>
    </g>
  );
};

// Field scientist in a red jacket pushing a soil corer into the ground to his right; `push` 0 → 1.
export const Scientist = ({ x, y, scale = 1, flip = false, push = 0 }: Fig & { push?: number }) => {
  const frame = useCurrentFrame();
  const b = Math.sin(frame * 0.06) * 0.6;
  const dip = push * 26;
  return (
    <g transform={T(x, y, scale, flip)}>
      <ellipse cx={0} cy={1} rx={16} ry={3} fill="#000" opacity={0.3} />
      {[-4, 6].map((a, i) => (
        <g key={i} transform={`translate(0,-40) rotate(${a})`}>
          <path d="M-5 0 L5 0 L4.5 38 L-4 38 Z" fill="#3a4250" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M-5 34 L8 34 L8 41 L-5 41 Z" fill="#5a3a22" stroke={INK} strokeWidth={1.1} />
        </g>
      ))}
      <g transform={`translate(0,${b}) rotate(${8 + push * 6},0,-40)`}>
        <path d="M-13 -88 Q-15 -64 -13 -40 L13 -40 Q15 -64 13 -88 Q0 -94 -13 -88 Z" fill="#d23a2a" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M5 -90 Q11 -66 11 -40 L13 -40 Q15 -64 13 -88 Z" fill="#a82a1e" />
        <rect x={-3} y={-96} width={7} height={7} fill="#e2b48e" />
        <g transform="translate(1,-105)">
          <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill="#e2b48e" stroke={INK} strokeWidth={1.5} />
          <circle cx={5} cy={0} r={1.3} fill={INK} />
          <path d="M-10 -2 Q-10 -15 0 -15 Q10 -15 10 -2 Q0 -8 -10 -2 Z" fill="#2f5a7a" stroke={INK} strokeWidth={1.2} />
          <rect x={2} y={-4} width={8} height={4} rx={1} fill="#1b1d24" opacity={0.7} />
        </g>
        <path d="M2 -82 Q16 -70 26 -66" stroke="#d23a2a" strokeWidth={7} strokeLinecap="round" fill="none" />
      </g>
      {/* T-handle corer */}
      <g transform={`translate(30,${-70 + dip})`}>
        <line x1={-10} y1={0} x2={10} y2={0} stroke="#5a5d63" strokeWidth={4} strokeLinecap="round" />
        <rect x={-3} y={0} width={6} height={74} fill="#c9ced3" stroke={INK} strokeWidth={1.2} />
      </g>
      <circle cx={26} cy={-64 + dip * 0.2} r={3.6} fill="#e2b48e" stroke={INK} strokeWidth={1.1} />
    </g>
  );
};

// Soil cross-section with layers; `hi` 0 → 1 highlights the dark churned layer (index `hiLayer`).
export const SoilLayers = ({ x, y, W, H, s, hi = 0, hiLayer = 2 }: { x: number; y: number; W: number; H: number; s: number; hi?: number; hiLayer?: number }) => {
  const colors = ["#8a7a5a", "#a08a62", "#3a2a1c", "#7a6a52", "#5a5048"];
  const n = colors.length;
  return (
    <g>
      {colors.map((c, i) => {
        const y0 = y + (H / n) * i;
        const wob = (k: number) => Math.sin(k * 3.1 + i) * 5 * s;
        return <path key={i} d={`M${x} ${y0 + wob(0)} Q${x + W / 2} ${y0 + wob(1) * 2} ${x + W} ${y0 + wob(2)} L${x + W} ${y + H} L${x} ${y + H} Z`} fill={c} stroke={INK} strokeWidth={1 * s} />;
      })}
      {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={x + random(`sp${i}`) * W} cy={y + random(`sq${i}`) * H} r={(1.5 + random(`sr${i}`) * 3) * s} fill="#2a2018" opacity={0.4} />)}
      {hi > 0 && <rect x={x} y={y + (H / n) * hiLayer - 4 * s} width={W} height={H / n + 4 * s} fill="none" stroke="#ffc94a" strokeWidth={4 * s} opacity={hi} />}
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

// Bust of Hannibal for a portrait panel; `patch` 0 → 1 puts a cloth over the right eye.
export const HannibalBust = ({ x, y, scale = 1, patch = 0 }: Fig & { patch?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-46 0 Q-44 -40 -16 -48 L16 -48 Q44 -40 46 0 Z" fill="#c9a24a" stroke={INK} strokeWidth={1.5} />
    <path d="M-46 0 Q-50 -30 -30 -44 L-20 -10 Z" fill="#8e2620" stroke={INK} strokeWidth={1.2} />
    <rect x={-6} y={-60} width={12} height={14} fill="#c08a62" stroke={INK} strokeWidth={1} />
    <g transform="translate(0,-82) scale(2)">
      <HannibalHead patch={patch} />
    </g>
  </g>
);

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

// Row of reeds along a stream bed (x .. x + W), swaying.
export const Reeds = ({ x, W, ground, s, n = 26, h = 70, color = "#7a8a4a" }: { x: number; W: number; ground: number; s: number; n?: number; h?: number; color?: string }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const rx = x + (i / (n - 1)) * W + random(`rx${i}`) * 10 * s;
        const rh = h * (0.6 + random(`rh${i}`) * 0.6) * s;
        const sway = Math.sin(frame * 0.06 + i) * 6 * s;
        return (
          <g key={i}>
            <path d={`M${rx} ${ground} Q${rx + sway * 0.4} ${ground - rh * 0.5} ${rx + sway} ${ground - rh}`} stroke={color} strokeWidth={3 * s} fill="none" />
            {i % 3 === 0 && <ellipse cx={rx + sway} cy={ground - rh} rx={3 * s} ry={9 * s} fill="#6a4a2a" stroke={INK} strokeWidth={1 * s} />}
          </g>
        );
      })}
    </g>
  );
};

// Fog bank over a panel: soft drifting white ellipses (k 0 → 1).
export const FogBank = ({ x, y, W, H, s, k = 1, n = 9 }: { x: number; y: number; W: number; H: number; s: number; k?: number; n?: number }) => {
  const frame = useCurrentFrame();
  if (k <= 0) return null;
  return (
    <g opacity={k} style={{ filter: `blur(${12 * s}px)` }}>
      {Array.from({ length: n }, (_, i) => {
        const fx = x + ((random(`fx${i}`) * W + frame * (0.4 + random(`fv${i}`) * 0.4) * s) % (W + 200 * s)) - 100 * s;
        const fy = y + random(`fy${i}`) * H;
        return <ellipse key={i} cx={fx} cy={fy} rx={(120 + random(`fr${i}`) * 100) * s} ry={(26 + random(`fq${i}`) * 20) * s} fill="#eef2f4" opacity={0.75} />;
      })}
    </g>
  );
};

// Wooded hills with an optional row of crouching soldiers' helmets peeking over the crest (`peek` 0 → 1).
export const WoodedHills = ({ x, W, ground, s, color = "#4a6a3a", peek = 0, helmet = "#c9a24a" }: { x: number; W: number; ground: number; s: number; color?: string; peek?: number; helmet?: string }) => {
  const crest = (t: number) => ground - (110 + Math.sin(t * 5.2) * 30 + Math.sin(t * 11) * 12) * s;
  const pts = Array.from({ length: 21 }, (_, i) => `${x + (i / 20) * W},${crest(i / 20)}`).join(" L");
  return (
    <g>
      {peek > 0 &&
        Array.from({ length: 12 }, (_, i) => {
          const t = (i + 0.5) / 12;
          const hx = x + t * W;
          const hy = crest(t) + (1 - peek) * 18 * s + 4 * s;
          return <path key={i} d={`M${hx - 9 * s} ${hy} Q${hx} ${hy - 18 * s} ${hx + 9 * s} ${hy} Z`} fill={helmet} stroke={INK} strokeWidth={1.2 * s} />;
        })}
      <path d={`M${x} ${ground} L${pts} L${x + W} ${ground} Z`} fill={color} stroke={INK} strokeWidth={1.2 * s} />
      {Array.from({ length: 16 }, (_, i) => {
        const t = (i + 0.3) / 16;
        const tx = x + t * W;
        const ty = crest(t) + 10 * s;
        return <path key={`t${i}`} d={`M${tx - 12 * s} ${ty + 14 * s} L${tx} ${ty - 22 * s} L${tx + 12 * s} ${ty + 14 * s} Z`} fill="#2f4a2a" stroke={INK} strokeWidth={1 * s} />;
      })}
    </g>
  );
};
