import { random, useCurrentFrame } from "remotion";

// Napoleonic-era pieces for news-style inset scenes, drawn like components/Figures.tsx:
// side view, feet at y = 0, ~120 units tall at scale 1, two-tone fills + 1.5 px dark outline, small idle motion.
const INK = "#1b1d24";

type Fig = { x: number; y: number; scale?: number; phase?: number; flip?: boolean };
export type Uniform = { coat: string; coatShade: string; facing: string; legs: string; hat: string; plume?: string };
export const FRENCH: Uniform = { coat: "#2c4a8c", coatShade: "#1f3566", facing: "#c8312b", legs: "#ecebe4", hat: "#1c1c22", plume: "#c8312b" };
export const RUSSIAN: Uniform = { coat: "#2f5a3a", coatShade: "#21402a", facing: "#b8322a", legs: "#e6e4dc", hat: "#1c1c22" };
export const POLISH: Uniform = { coat: "#2a3f78", coatShade: "#1e2d58", facing: "#e2c14a", legs: "#2a3f78", hat: "#c8312b", plume: "#ffffff" };
export const BAVARIAN: Uniform = { coat: "#6f9fd0", coatShade: "#5582b0", facing: "#1c1c22", legs: "#ecebe4", hat: "#1c1c22" };
export const AUSTRIAN: Uniform = { coat: "#e8e5dc", coatShade: "#c9c5b8", facing: "#c8312b", legs: "#e8e5dc", hat: "#1c1c22" };
export const ITALIAN: Uniform = { coat: "#3d7a4a", coatShade: "#2c5a36", facing: "#ecebe4", legs: "#ecebe4", hat: "#1c1c22", plume: "#3d7a4a" };
export const PRUSSIAN: Uniform = { coat: "#1f2a4a", coatShade: "#151d36", facing: "#c8312b", legs: "#e6e4dc", hat: "#1c1c22" };
export const SWISS: Uniform = { coat: "#b8322a", coatShade: "#8e2620", facing: "#e2c14a", legs: "#ecebe4", hat: "#1c1c22" };

// Line infantryman: shako, coat with coloured facings, crossbelts, pack, musket with bayonet.
// pose: walk (marching, musket on shoulder) | stand | trudge (head down, musket dragged, for the retreat).
export const Soldier = ({ x, y, scale = 1, phase = 0, flip = false, u = FRENCH, pose = "walk", wrap = 0 }: Fig & { u?: Uniform; pose?: "walk" | "stand" | "trudge"; wrap?: number }) => {
  const frame = useCurrentFrame();
  const speed = pose === "trudge" ? 0.16 : 0.3;
  const t = frame * speed + phase;
  const swing = pose === "stand" ? 0 : Math.sin(t) * (pose === "trudge" ? 9 : 16);
  const bob = pose === "stand" ? Math.sin(frame * 0.07 + phase) * 0.6 : -Math.abs(Math.sin(t)) * 2.4;
  const lean = pose === "trudge" ? 16 : 3;
  const skin = "#e9b994";
  const leg = (a: number, back: boolean) => (
    <g transform={`translate(0,-42) rotate(${a})`} opacity={back ? 0.85 : 1}>
      <path d="M-5 0 L5 0 L4.5 40 L-4 40 Z" fill={u.legs} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-4.5 26 L4.8 26 L4.5 40 L-4 40 Z" fill="#2a2a30" stroke={INK} strokeWidth={1.2} />
      <path d="M-4.5 39 L9 39 Q10 42 8 43 L-4.5 43 Z" fill="#1c1c22" stroke={INK} strokeWidth={1.2} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={1} rx={14} ry={3} fill="#000" opacity={0.3} />
      {leg(-swing, true)}
      {leg(swing, false)}
      <g transform={`rotate(${lean},0,-42)`}>
        {/* pack + rolled greatcoat */}
        <rect x={-19} y={-88} width={10} height={24} rx={2} fill="#7a5a3a" stroke={INK} strokeWidth={1.3} />
        <rect x={-21} y={-93} width={14} height={7} rx={3.5} fill="#8a8f96" stroke={INK} strokeWidth={1.2} />
        {/* back arm */}
        <path d={`M-4 -84 Q-8 -70 ${-5 - swing * 0.4} -58`} stroke={u.coatShade} strokeWidth={7.5} strokeLinecap="round" fill="none" />
        {/* coat: short front, tails behind */}
        <path d="M-11 -88 Q-13 -70 -12 -52 L-16 -38 L-8 -40 L-6 -50 L11 -50 Q12 -70 11 -88 Q0 -93 -11 -88 Z" fill={u.coat} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M4 -90 Q10 -72 10 -50 L11 -50 Q12 -70 11 -88 Z" fill="#000" opacity={0.2} />
        <path d="M-1 -89 L5 -89 L5 -60 L-1 -60 Z" fill={u.facing} stroke={INK} strokeWidth={1} />
        <path d="M-10 -88 L10 -54 M10 -88 L-10 -54" stroke="#f1efe6" strokeWidth={3} opacity={0.95} />
        <rect x={-3} y={-96} width={7} height={7} fill={skin} />
        {/* blanket over the shoulders for the retreat */}
        {wrap > 0 && <path d="M-15 -100 Q0 -108 14 -98 L16 -62 Q0 -56 -16 -64 Z" fill="#7d6f5c" stroke={INK} strokeWidth={1.4} opacity={wrap} />}
        <g transform={`translate(1,-106) rotate(${pose === "trudge" ? 18 : 0})`}>
          <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.5} />
          <circle cx={5} cy={0} r={1.3} fill={INK} />
          <path d="M3 6 Q6 7 8 5" stroke={INK} strokeWidth={1.1} fill="none" />
          <path d="M-6 3 Q-9 8 -4 9" stroke="#6b4a2b" strokeWidth={2} fill="none" />
          {/* shako with peak, plate and plume */}
          <path d="M-10 -5 L-9 -24 L10 -24 L10 -5 Z" fill={u.hat} stroke={INK} strokeWidth={1.4} />
          <path d="M3 -5 L16 -3 L10 -7 Z" fill={INK} />
          <path d="M-2 -18 L4 -18 L5 -11 L1 -8 L-3 -11 Z" fill="#d9b45a" />
          <rect x={-10} y={-24} width={20} height={3} fill="#d9b45a" />
          {u.plume && <ellipse cx={0} cy={-30} rx={3.5} ry={7} fill={u.plume} stroke={INK} strokeWidth={1} />}
          {wrap > 0 && <path d="M-12 -6 Q0 -14 12 -6 L12 6 Q0 10 -12 4 Z" fill="#9b8b72" stroke={INK} strokeWidth={1.1} opacity={wrap} />}
        </g>
        {/* front arm + musket */}
        {pose === "trudge" ? (
          <g transform={`translate(6,-84) rotate(${-12 - swing * 0.3})`}>
            <path d="M0 0 L2 26" stroke={u.coat} strokeWidth={7.5} strokeLinecap="round" />
            <circle cx={2} cy={28} r={3.6} fill={skin} stroke={INK} strokeWidth={1.1} />
            <g transform="translate(2,28) rotate(-70)">
              <line x1={-50} y1={0} x2={30} y2={0} stroke="#6b4a2b" strokeWidth={4} strokeLinecap="round" />
              <line x1={-50} y1={-1} x2={-80} y2={-1} stroke="#8a8f96" strokeWidth={2} />
            </g>
          </g>
        ) : (
          <g>
            <g transform="translate(-2,-80) rotate(-8)">
              <line x1={0} y1={0} x2={0} y2={-58} stroke="#6b4a2b" strokeWidth={4.2} strokeLinecap="round" />
              <line x1={1} y1={-56} x2={1} y2={-74} stroke="#8a8f96" strokeWidth={2.2} />
              <line x1={1} y1={-70} x2={1} y2={-96} stroke="#d5dade" strokeWidth={1.6} />
            </g>
            <path d="M6 -84 Q3 -70 -1 -78" stroke={u.coat} strokeWidth={7.5} strokeLinecap="round" fill="none" />
            <circle cx={-1} cy={-79} r={3.6} fill={skin} stroke={INK} strokeWidth={1.1} />
          </g>
        )}
      </g>
    </g>
  );
};

// Napoleon: bicorne worn sideways, grey greatcoat, hand behind the back.
export const Napoleon = ({ x, y, scale = 1, flip = false, phase = 0 }: Fig) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.06 + phase) * 0.6;
  const skin = "#efc6a2";
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={1} rx={15} ry={3} fill="#000" opacity={0.3} />
      <path d="M-6 -40 L-5 0 L4 0 L5 -40 Z" fill="#ecebe4" stroke={INK} strokeWidth={1.4} />
      <path d="M-7 -18 L-6 2 L10 2 L9 -2 L4 -2 L4 -18 Z" fill="#1c1c22" stroke={INK} strokeWidth={1.2} />
      <path d="M-14 -92 Q-17 -60 -16 -34 L14 -34 Q16 -60 13 -92 Q0 -98 -14 -92 Z" fill="#8a8d93" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M5 -94 Q13 -70 13 -34 L14 -34 Q16 -60 13 -92 Z" fill="#000" opacity={0.2} />
      <path d="M-3 -94 L4 -94 L4 -60 L-3 -60 Z" fill="#2c4a8c" />
      <path d="M-3 -80 L4 -80" stroke="#f1efe6" strokeWidth={6} />
      <rect x={-3} y={-100} width={7} height={7} fill={skin} />
      <g transform="translate(1,-110)">
        <ellipse cx={0} cy={0} rx={10} ry={11} fill={skin} stroke={INK} strokeWidth={1.5} />
        <circle cx={5} cy={0} r={1.3} fill={INK} />
        <path d="M3 6 Q6 6 8 5" stroke={INK} strokeWidth={1.1} fill="none" />
        <path d="M-9 -4 Q-6 -10 2 -8" stroke="#3a2a20" strokeWidth={3} fill="none" />
        {/* bicorne, side-on */}
        <path d="M-22 -6 Q-12 -26 0 -24 Q12 -26 22 -6 Q0 -14 -22 -6 Z" fill="#141418" stroke={INK} strokeWidth={1.3} />
        <circle cx={4} cy={-14} r={3} fill="#2c4a8c" stroke="#fff" strokeWidth={1} />
      </g>
    </g>
  );
};

// Pontoon bridge seen from the side: boats on the water carrying a plank deck. `k` 0 → 1 builds it from the left.
export const PontoonBridge = ({ x0, x1, deck, water, s, k = 1 }: { x0: number; x1: number; deck: number; water: number; s: number; k?: number }) => {
  const w = (x1 - x0) * k;
  const n = Math.max(1, Math.floor(w / (70 * s)));
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const bx = x0 + i * 70 * s + 10 * s;
        return <path key={i} d={`M${bx} ${water - 6 * s} L${bx + 50 * s} ${water - 6 * s} L${bx + 44 * s} ${water + 10 * s} L${bx + 6 * s} ${water + 10 * s} Z`} fill="#4a3424" stroke={INK} strokeWidth={1.3 * s} />;
      })}
      {Array.from({ length: n }, (_, i) => <line key={`p${i}`} x1={x0 + i * 70 * s + 35 * s} y1={water - 6 * s} x2={x0 + i * 70 * s + 35 * s} y2={deck} stroke="#3a2a1c" strokeWidth={3 * s} />)}
      <rect x={x0} y={deck - 7 * s} width={w} height={9 * s} fill="#8a6a46" stroke={INK} strokeWidth={1.3 * s} />
      <line x1={x0} y1={deck - 22 * s} x2={x0 + w} y2={deck - 22 * s} stroke="#5a4030" strokeWidth={2 * s} />
    </g>
  );
};

// River surface with moving glints.
export const Water = ({ x, y, W, H, s, color = "#3c6f8f", ice = 0 }: { x: number; y: number; W: number; H: number; s: number; color?: string; ice?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={x} y={y} width={W} height={H} fill={color} />
      {Array.from({ length: 18 }, (_, i) => {
        const gx = x + ((random(`w${i}`) * W + frame * (0.6 + random(`v${i}`))) % W);
        const gy = y + 8 * s + random(`h${i}`) * (H - 16 * s);
        return <line key={i} x1={gx} y1={gy} x2={gx + 26 * s} y2={gy} stroke="#cfe6f5" strokeWidth={2 * s} opacity={0.35} />;
      })}
      {ice > 0 && Array.from({ length: 10 }, (_, i) => <ellipse key={`i${i}`} cx={x + random(`ix${i}`) * W} cy={y + random(`iy${i}`) * H} rx={(20 + random(`ir${i}`) * 30) * s} ry={5 * s} fill="#e8f2f7" opacity={0.75 * ice} />)}
    </g>
  );
};

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

// Bare birch / fir treeline on the horizon.
export const Treeline = ({ x, W, ground, s, color = "#1b2a24", snow = 0 }: { x: number; W: number; ground: number; s: number; color?: string; snow?: number }) => (
  <g>
    {Array.from({ length: 14 }, (_, i) => {
      const tx = x + (i / 13) * W + random(`t${i}`) * 20 * s;
      const h = (60 + random(`th${i}`) * 50) * s;
      return (
        <g key={i}>
          <path d={`M${tx} ${ground - h} L${tx - h * 0.28} ${ground} L${tx + h * 0.28} ${ground} Z`} fill={color} />
          {snow > 0 && <path d={`M${tx} ${ground - h} L${tx - h * 0.12} ${ground - h * 0.55} L${tx + h * 0.12} ${ground - h * 0.55} Z`} fill="#f2f6f8" opacity={snow} />}
        </g>
      );
    })}
  </g>
);
