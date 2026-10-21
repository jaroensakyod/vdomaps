import { interpolate, random, useCurrentFrame } from "remotion";
import { Fire, Smoke } from "../../../components/Figures";

// 18th-century Siam / Burma pieces for news-style inset scenes, drawn like components/Figures.tsx:
// side view, feet at y = 0, ~110 units tall at scale 1, two-tone fills + 1.6 px dark outline, small idle motion.
const INK = "#1b1d24";

type Fig = { x: number; y: number; scale?: number; phase?: number; flip?: boolean };

// Burmese soldier: head cloth (gaung baung), short sleeveless jacket, longyi tucked up, spear / torch / sword.
export const BurmeseSoldier = ({ x, y, scale = 1, phase = 0, flip = false, hold = "spear", pose = "walk", jacket = "#8e2a22" }: Fig & { hold?: "spear" | "torch" | "sword"; pose?: "walk" | "climb" | "stand"; jacket?: string }) => {
  const frame = useCurrentFrame();
  const t = frame * (pose === "climb" ? 0.22 : 0.3) + phase;
  const swing = pose === "stand" ? 0 : Math.sin(t) * (pose === "climb" ? 22 : 16);
  const bob = pose === "stand" ? Math.sin(frame * 0.07 + phase) : -Math.abs(Math.sin(t)) * 2.5;
  const lean = pose === "climb" ? 18 : 6;
  const skin = "#a86b45";
  const leg = (a: number, back: boolean) => (
    <g transform={`translate(0,-40) rotate(${a})`} opacity={back ? 0.85 : 1}>
      <path d="M-4.5 0 L4.5 0 L4 38 L-3.5 38 Z" fill={skin} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-4 37 L8 37 Q9 40 7 41 L-4 41 Z" fill="#5a3a24" stroke={INK} strokeWidth={1.2} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={1} rx={13} ry={3} fill="#000" opacity={0.3} />
      {leg(-swing, true)}
      {leg(swing, false)}
      <g transform={`rotate(${lean},0,-40)`}>
        {/* longyi hitched up to the knee: checked cloth */}
        <path d="M-12 -58 L12 -58 L13 -30 Q0 -26 -13 -30 Z" fill="#2f4f6b" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
        {[-8, -2, 4, 10].map((cx) => <line key={cx} x1={cx} y1={-57} x2={cx + 1} y2={-29} stroke="#7a9cb8" strokeWidth={1.4} opacity={0.6} />)}
        <line x1={-12} y1={-46} x2={13} y2={-46} stroke="#7a9cb8" strokeWidth={1.4} opacity={0.6} />
        {/* back arm */}
        <path d={`M-4 -82 Q-10 -68 ${-6 - swing * 0.5} -56`} stroke={skin} strokeWidth={6.5} strokeLinecap="round" fill="none" />
        {/* jacket over bare arms */}
        <path d="M-11 -86 Q-12 -70 -11 -56 L11 -56 Q12 -70 11 -86 Q0 -91 -11 -86 Z" fill={jacket} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M3 -88 Q9 -72 9 -56 L11 -56 Q12 -70 11 -86 Z" fill="#000" opacity={0.18} />
        <path d="M-2 -88 L2 -60" stroke="#d9b45a" strokeWidth={1.4} />
        <rect x={-3} y={-94} width={6} height={7} fill={skin} />
        <g transform="translate(0,-103)">
          <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.5} />
          {/* head cloth with a side knot */}
          <path d="M-10 -2 Q-11 -14 0 -14 Q11 -14 10 -2 Q0 -7 -10 -2 Z" fill="#c7322a" stroke={INK} strokeWidth={1.3} />
          <path d="M-9 -9 Q-17 -12 -15 -3 Q-12 -6 -9 -5 Z" fill="#c7322a" stroke={INK} strokeWidth={1.1} />
          <circle cx={5} cy={1} r={1.3} fill={INK} />
          <path d="M2 6 Q5 7 7 5" stroke={INK} strokeWidth={1.1} fill="none" />
          <path d="M3 -1 L8 -2" stroke={INK} strokeWidth={1} />
        </g>
        {/* front arm + weapon */}
        <g transform={`translate(6,-82) rotate(${hold === "torch" ? -140 : pose === "climb" ? -120 + swing : -40 - swing * 0.4})`}>
          <path d="M0 0 L0 22" stroke={skin} strokeWidth={6.5} strokeLinecap="round" />
          <circle cx={0} cy={24} r={3.6} fill={skin} stroke={INK} strokeWidth={1.1} />
          {hold === "spear" && (
            <g transform="translate(0,24) rotate(120)">
              <line x1={-30} y1={0} x2={70} y2={0} stroke="#6b4a2b" strokeWidth={2.6} strokeLinecap="round" />
              <path d="M70 -4 L86 0 L70 4 Z" fill="#c9ced3" stroke={INK} strokeWidth={1.1} />
              <path d="M64 -3 Q60 0 64 3" fill="#c7322a" />
            </g>
          )}
          {hold === "sword" && (
            <g transform="translate(0,24) rotate(150)">
              <path d="M0 -2 L44 -3 Q50 0 44 3 L0 2 Z" fill="#dfe3e6" stroke={INK} strokeWidth={1} />
              <rect x={-10} y={-2.5} width={10} height={5} rx={1.5} fill="#7a4a24" />
            </g>
          )}
          {hold === "torch" && (
            <g transform="translate(0,26) rotate(140)">
              <line x1={0} y1={0} x2={0} y2={-30} stroke="#6b4a2b" strokeWidth={3.2} strokeLinecap="round" />
              <Fire x={0} y={-30} size={22} seed={phase * 3} />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

// City wall of Ayutthaya: whitewashed brick with rounded "bai sema" merlons. `breach` 0 → 1 opens a collapse at bx.
export const CityWall = ({ x0, x1, ground, h, s, breach = 0, bx }: { x0: number; x1: number; ground: number; h: number; s: number; breach?: number; bx?: number }) => {
  const top = ground - h;
  const mw = 26 * s;
  const gapW = 120 * s * breach;
  const cx = bx ?? (x0 + x1) / 2;
  const merlons = Math.floor((x1 - x0) / (mw * 1.6));
  const seg = (a: number, b: number, key: string) =>
    b - a < 2 ? null : (
      <g key={key}>
        <rect x={a} y={top} width={b - a} height={h} fill="#e9e1cf" stroke={INK} strokeWidth={1.6 * s} />
        <rect x={a} y={top + h * 0.72} width={b - a} height={h * 0.28} fill="#cdbfa3" />
        {Array.from({ length: Math.ceil((b - a) / (40 * s)) }, (_, i) => (
          <rect key={i} x={a + i * 40 * s + ((i * 7) % 3) * 4 * s} y={top + h * (0.3 + ((i * 13) % 5) * 0.1)} width={22 * s} height={9 * s} fill="#b5603d" opacity={0.75} />
        ))}
      </g>
    );
  return (
    <g>
      {seg(x0, cx - gapW / 2, "l")}
      {seg(cx + gapW / 2, x1, "r")}
      {Array.from({ length: merlons }, (_, i) => {
        const mx = x0 + i * mw * 1.6 + mw * 0.3;
        if (mx + mw > cx - gapW / 2 && mx < cx + gapW / 2) return null;
        return <path key={i} d={`M${mx} ${top} L${mx} ${top - 16 * s} Q${mx + mw / 2} ${top - 34 * s} ${mx + mw} ${top - 16 * s} L${mx + mw} ${top} Z`} fill="#efe8d8" stroke={INK} strokeWidth={1.5 * s} />;
      })}
      {breach > 0 && (
        <g>
          {/* rubble slope into the gap */}
          <path d={`M${cx - gapW * 0.9} ${ground} Q${cx} ${ground - h * 0.55 * breach} ${cx + gapW * 0.9} ${ground} Z`} fill="#b98a6a" stroke={INK} strokeWidth={1.4 * s} />
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={cx + (random(`rb${i}`) - 0.5) * gapW * 1.5} y={ground - h * 0.45 * breach * random(`rh${i}`) - 8 * s} width={16 * s} height={9 * s} fill={i % 3 ? "#c46a45" : "#e9e1cf"} stroke={INK} strokeWidth={s} transform={`rotate(${random(`rr${i}`) * 60 - 30},${cx},${ground})`} />
          ))}
        </g>
      )}
    </g>
  );
};

// Ayutthaya skyline pieces: a Khmer-style prang (corn-cob tower) and a bell-shaped chedi. h = height in px.
export const Prang = ({ x, y, h, color = "#3a2a2a" }: { x: number; y: number; h: number; color?: string }) => {
  const w = h * 0.34;
  return (
    <g fill={color}>
      <rect x={x - w * 0.75} y={y - h * 0.18} width={w * 1.5} height={h * 0.18} />
      <rect x={x - w * 0.6} y={y - h * 0.3} width={w * 1.2} height={h * 0.12} />
      <path d={`M${x - w * 0.5} ${y - h * 0.3} Q${x - w * 0.55} ${y - h * 0.75} ${x} ${y - h * 0.92} Q${x + w * 0.55} ${y - h * 0.75} ${x + w * 0.5} ${y - h * 0.3} Z`} />
      <rect x={x - 1.5} y={y - h} width={3} height={h * 0.1} />
    </g>
  );
};

export const BellChedi = ({ x, y, h, color = "#3a2a2a" }: { x: number; y: number; h: number; color?: string }) => (
  <g fill={color}>
    <rect x={x - h * 0.3} y={y - h * 0.12} width={h * 0.6} height={h * 0.12} />
    <rect x={x - h * 0.24} y={y - h * 0.2} width={h * 0.48} height={h * 0.08} />
    <path d={`M${x - h * 0.22} ${y - h * 0.2} Q${x - h * 0.24} ${y - h * 0.5} ${x} ${y - h * 0.52} Q${x + h * 0.24} ${y - h * 0.5} ${x + h * 0.22} ${y - h * 0.2} Z`} />
    <path d={`M${x - h * 0.05} ${y - h * 0.5} L${x} ${y - h} L${x + h * 0.05} ${y - h * 0.5} Z`} />
  </g>
);

// Glowing embers drifting up across a box.
export const Embers = ({ x, y, W, H, s, n = 40 }: { x: number; y: number; W: number; H: number; s: number; n?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const sp = 0.004 + random(`es${i}`) * 0.006;
        const k = (random(`e0${i}`) + frame * sp) % 1;
        const ex = x + random(`ex${i}`) * W + Math.sin(frame * 0.05 + i) * 10 * s;
        const ey = y + H - k * H;
        return <circle key={i} cx={ex} cy={ey} r={(1.5 + random(`er${i}`) * 2.5) * s} fill="#ffcf6b" opacity={interpolate(k, [0, 0.2, 1], [0, 1, 0])} />;
      })}
    </g>
  );
};

export { Fire, Smoke };

export const Moon = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <g>
    <circle cx={x} cy={y} r={r * 2.4} fill="#fff6d8" opacity={0.08} />
    <circle cx={x} cy={y} r={r} fill="#f4ecd0" />
    <circle cx={x + r * 0.35} cy={y - r * 0.15} r={r * 0.85} fill="#0b1230" opacity={0.0} />
    {[[-0.3, -0.2, 0.18], [0.25, 0.3, 0.12], [0.1, -0.4, 0.09]].map(([dx, dy, rr], i) => <circle key={i} cx={x + dx * r} cy={y + dy * r} r={rr * r} fill="#d9cfae" />)}
  </g>
);

// Siege camp on the plain: palisade, tents and camp fires (Burmese red pennants).
export const SiegeCamp = ({ x, y, s, w = 220, phase = 0 }: { x: number; y: number; s: number; w?: number; phase?: number }) => {
  const frame = useCurrentFrame();
  const W = w * s;
  return (
    <g>
      {Array.from({ length: Math.floor(W / (9 * s)) }, (_, i) => (
        <path key={i} d={`M${x - W / 2 + i * 9 * s} ${y} l0 ${-26 * s} l${3 * s} ${-6 * s} l${3 * s} ${6 * s} l0 ${26 * s} Z`} fill="#7a5532" stroke={INK} strokeWidth={0.8 * s} />
      ))}
      {[-0.3, 0, 0.3].map((f, i) => (
        <g key={i}>
          <path d={`M${x + f * W - 28 * s} ${y - 20 * s} L${x + f * W} ${y - 64 * s} L${x + f * W + 28 * s} ${y - 20 * s} Z`} fill={i % 2 ? "#e8dcc0" : "#b8362c"} stroke={INK} strokeWidth={1.3 * s} />
          <line x1={x + f * W} y1={y - 64 * s} x2={x + f * W} y2={y - 92 * s} stroke={INK} strokeWidth={1.6 * s} />
          <path d={`M${x + f * W} ${y - 92 * s} l${22 * s} ${4 * s + Math.sin(frame * 0.2 + i + phase) * 2 * s} l${-22 * s} ${8 * s} Z`} fill="#d23b2f" />
        </g>
      ))}
      <Fire x={x - W * 0.15} y={y - 2 * s} size={34 * s} seed={phase} />
      <Fire x={x + W * 0.16} y={y - 2 * s} size={28 * s} seed={phase + 4} />
    </g>
  );
};

// Dust burst at a point, k: 0 → 1 over the burst.
export const Dust = ({ x, y, s, k }: { x: number; y: number; s: number; k: number }) =>
  k <= 0 || k >= 1 ? null : (
    <g opacity={1 - k}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI - Math.PI;
        return <circle key={i} cx={x + Math.cos(a) * 90 * s * k} cy={y + Math.sin(a) * 60 * s * k} r={(30 + k * 40) * s} fill="#b9a58c" opacity={0.8} />;
      })}
    </g>
  );

// Ruined brick prang: broken top, soot, a leaning tree.
export const RuinedPrang = ({ x, y, h, s }: { x: number; y: number; h: number; s: number }) => {
  const w = h * 0.34;
  return (
    <g>
      <rect x={x - w * 0.75} y={y - h * 0.18} width={w * 1.5} height={h * 0.18} fill="#9a4f36" stroke={INK} strokeWidth={1.4 * s} />
      <rect x={x - w * 0.6} y={y - h * 0.3} width={w * 1.2} height={h * 0.12} fill="#a65a3e" stroke={INK} strokeWidth={1.4 * s} />
      <path d={`M${x - w * 0.5} ${y - h * 0.3} Q${x - w * 0.55} ${y - h * 0.62} ${x - w * 0.2} ${y - h * 0.74} L${x - w * 0.05} ${y - h * 0.66} L${x + w * 0.15} ${y - h * 0.72} L${x + w * 0.3} ${y - h * 0.6} Q${x + w * 0.52} ${y - h * 0.5} ${x + w * 0.5} ${y - h * 0.3} Z`} fill="#b0623f" stroke={INK} strokeWidth={1.5 * s} />
      {[0.38, 0.48, 0.58].map((f) => <line key={f} x1={x - w * 0.48} y1={y - h * f} x2={x + w * 0.48} y2={y - h * f} stroke="#7d3a26" strokeWidth={1.4 * s} />)}
      <path d={`M${x - w * 0.4} ${y - h * 0.32} Q${x - w * 0.3} ${y - h * 0.55} ${x - w * 0.1} ${y - h * 0.68}`} stroke="#2a1a14" strokeWidth={6 * s} fill="none" opacity={0.35} />
    </g>
  );
};
