import { useCurrentFrame } from "remotion";

// Ancient Mediterranean pieces (Second Punic War) for news-style inset scenes, drawn like kit/Period.tsx:
// side view, feet at y = 0, two-tone fills + 1.5 px dark outline, small idle motion.
const INK = "#1b1d24";

type Fig = { x: number; y: number; scale?: number; phase?: number; flip?: boolean };

// War elephant (North African forest elephant: small, big ears, sloping back) with a mahout on its neck.
// ~150 units tall at scale 1. `walk` swings the legs; `thin` > 0 shows ribs (half-starved, 0 → 1).
export const Elephant = ({ x, y, scale = 1, phase = 0, flip = false, walk = true, thin = 0, rider = true, snow = 0 }: Fig & { walk?: boolean; thin?: number; rider?: boolean; snow?: number }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.14 + phase;
  const sw = walk ? Math.sin(t) * 9 : 0;
  const bob = walk ? -Math.abs(Math.sin(t)) * 2 : Math.sin(frame * 0.05 + phase) * 0.8;
  const trunk = Math.sin(frame * 0.07 + phase) * 6;
  const ear = Math.sin(frame * 0.09 + phase) * 4;
  const skin = "#8d8a86";
  const shade = "#6e6b68";
  const leg = (lx: number, a: number, back: boolean) => (
    <g transform={`translate(${lx},-46) rotate(${a})`} opacity={back ? 0.82 : 1}>
      <path d="M-9 0 L9 0 L8 46 L-8 46 Z" fill={back ? shade : skin} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-9 43 L9 43 L9 47 L-9 47 Z" fill="#cfc9bd" stroke={INK} strokeWidth={1} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={2} rx={58} ry={6} fill="#000" opacity={0.3} />
      {leg(-34, -sw, true)}
      {leg(26, sw, true)}
      {/* body */}
      <path d="M-58 -70 Q-60 -112 -20 -118 Q20 -124 44 -104 Q58 -92 56 -64 Q50 -44 30 -42 L-40 -42 Q-60 -46 -58 -70 Z" fill={skin} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M-50 -56 Q0 -40 50 -58 L48 -48 Q0 -36 -48 -46 Z" fill={shade} opacity={0.6} />
      {thin > 0 && [-24, -12, 0, 12].map((rx) => <path key={rx} d={`M${rx} -98 Q${rx + 4} -78 ${rx} -58`} stroke={INK} strokeWidth={1.4} fill="none" opacity={0.5 * thin} />)}
      {/* tail */}
      <path d="M-58 -82 Q-68 -70 -64 -54" stroke={INK} strokeWidth={2.4} fill="none" />
      {leg(-22, sw, false)}
      {leg(38, -sw, false)}
      {/* head, big ear, tusk, trunk */}
      <path d="M40 -112 Q70 -122 80 -96 Q86 -78 76 -64 L54 -62 Z" fill={skin} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d={`M56 -108 Q${34 + ear} -112 ${30 + ear} -86 Q${34 + ear} -64 54 -70 Z`} fill={shade} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <circle cx={70} cy={-94} r={2.2} fill={INK} />
      <path d="M74 -70 Q90 -66 96 -76" stroke="#efe6d2" strokeWidth={4.5} strokeLinecap="round" fill="none" />
      <path d={`M78 -76 Q92 -56 ${86 + trunk} -30 Q${84 + trunk} -22 ${78 + trunk} -24`} stroke={skin} strokeWidth={10} strokeLinecap="round" fill="none" />
      <path d={`M78 -76 Q92 -56 ${86 + trunk} -30 Q${84 + trunk} -22 ${78 + trunk} -24`} stroke={INK} strokeWidth={1.4} fill="none" opacity={0.6} />
      {/* saddle cloth */}
      <path d="M-30 -116 Q0 -124 26 -114 L22 -84 Q-2 -78 -28 -86 Z" fill="#7a2230" stroke={INK} strokeWidth={1.4} />
      <path d="M-28 -90 Q-2 -82 22 -88" stroke="#d9b45a" strokeWidth={3} fill="none" />
      {snow > 0 && <path d="M-50 -110 Q-10 -128 40 -112 Q10 -118 -50 -104 Z" fill="#f4f8fb" opacity={snow} />}
      {rider && (
        <g transform="translate(46,-118)">
          <path d="M-6 0 L6 0 L8 -26 L-6 -26 Z" fill="#e9d9b8" stroke={INK} strokeWidth={1.3} />
          <circle cx={1} cy={-34} r={7.5} fill="#8a5a3a" stroke={INK} strokeWidth={1.3} />
          <path d="M-7 -37 Q1 -46 9 -37" fill="#e9d9b8" stroke={INK} strokeWidth={1.1} />
          <path d="M6 -18 L22 -30" stroke="#6b4a2b" strokeWidth={2.4} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

export type Kit = { tunic: string; shade: string; shield: string; helmet: string; crest?: string };
export const LIBYAN: Kit = { tunic: "#c9b48a", shade: "#a8946c", shield: "#8a2a2a", helmet: "#b9a46a" };
export const IBERIAN: Kit = { tunic: "#f0ebe0", shade: "#cfc8b8", shield: "#3a3a44", helmet: "#4a3a2a", crest: "#8e2620" };
export const GAUL: Kit = { tunic: "#4f7a3a", shade: "#3b5c2c", shield: "#2f5a7a", helmet: "#c27b2a" };
export const ROMAN: Kit = { tunic: "#b8322a", shade: "#8e2620", shield: "#a8322a", helmet: "#9aa3ab", crest: "#2a2a2a" };

// Foot soldier with oval/curved shield and spear. `roman` swaps to a big curved scutum and a short sword.
export const Warrior = ({ x, y, scale = 1, phase = 0, flip = false, kit = LIBYAN, roman = false, pose = "walk", cloak = 0 }: Fig & { kit?: Kit; roman?: boolean; pose?: "walk" | "stand" | "trudge" | "charge"; cloak?: number }) => {
  const frame = useCurrentFrame();
  const speed = pose === "trudge" ? 0.16 : pose === "charge" ? 0.42 : 0.3;
  const t = frame * speed + phase;
  const swing = pose === "stand" ? 0 : Math.sin(t) * (pose === "charge" ? 22 : pose === "trudge" ? 9 : 16);
  const bob = pose === "stand" ? Math.sin(frame * 0.07 + phase) * 0.6 : -Math.abs(Math.sin(t)) * 2.4;
  const lean = pose === "trudge" ? 14 : pose === "charge" ? 12 : 3;
  const skin = kit === LIBYAN ? "#8a5a3a" : "#e2b48e";
  const leg = (a: number, back: boolean) => (
    <g transform={`translate(0,-40) rotate(${a})`} opacity={back ? 0.85 : 1}>
      <path d="M-4.5 0 L4.5 0 L4 38 L-3.5 38 Z" fill={skin} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M-4 30 L5 30 L5 41 L-4 41 Z" fill="#6b4a2b" stroke={INK} strokeWidth={1.1} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={1} rx={14} ry={3} fill="#000" opacity={0.3} />
      {leg(-swing, true)}
      {leg(swing, false)}
      <g transform={`rotate(${lean},0,-40)`}>
        {/* spear behind */}
        {!roman && <line x1={-6} y1={-30} x2={10} y2={-150} stroke="#6b4a2b" strokeWidth={2.6} strokeLinecap="round" />}
        {!roman && <path d="M10 -150 L7 -164 L14 -152 Z" fill="#c9ced3" stroke={INK} strokeWidth={1} />}
        <path d="M-11 -86 Q-13 -64 -12 -42 L12 -42 Q13 -64 11 -86 Q0 -91 -11 -86 Z" fill={kit.tunic} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M4 -88 Q10 -66 10 -42 L12 -42 Q13 -64 11 -86 Z" fill={kit.shade} />
        {roman && <path d="M-11 -84 L11 -84 L11 -60 L-11 -60 Z" fill="#9aa3ab" stroke={INK} strokeWidth={1.2} />}
        <path d="M-12 -46 L12 -46" stroke="#5a3a22" strokeWidth={3} />
        {cloak > 0 && <path d="M-14 -94 Q0 -100 14 -92 L18 -48 Q0 -40 -18 -50 Z" fill="#6a5a48" stroke={INK} strokeWidth={1.3} opacity={cloak} />}
        <rect x={-3} y={-94} width={7} height={7} fill={skin} />
        <g transform="translate(1,-103)">
          <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.5} />
          <circle cx={5} cy={0} r={1.3} fill={INK} />
          <path d="M-10 -1 Q-11 -15 0 -15 Q11 -15 10 -1 Q2 -6 -10 -1 Z" fill={kit.helmet} stroke={INK} strokeWidth={1.3} />
          {kit.crest && <path d="M-6 -15 Q0 -26 8 -15" fill={kit.crest} stroke={INK} strokeWidth={1} />}
          {roman && <path d="M-9 -2 L-9 8 L-4 8 L-4 -1 Z" fill={kit.helmet} stroke={INK} strokeWidth={1} />}
        </g>
        {/* shield in front */}
        {roman ? (
          <path d="M6 -92 Q22 -88 22 -60 Q22 -32 6 -28 Q12 -60 6 -92 Z" fill={kit.shield} stroke={INK} strokeWidth={1.5} />
        ) : (
          <ellipse cx={12} cy={-64} rx={10} ry={24} fill={kit.shield} stroke={INK} strokeWidth={1.5} />
        )}
        {roman ? <path d="M10 -62 L30 -66" stroke="#d5dade" strokeWidth={3} strokeLinecap="round" /> : <circle cx={12} cy={-64} r={3} fill="#d9b45a" stroke={INK} strokeWidth={1} />}
      </g>
    </g>
  );
};

// Mountain backdrop for Alpine panels: two ridges with snow caps.
export const Mountains = ({ x, W, ground, s, snow = 1, far = "#6a7a90", near = "#3d4a5e" }: { x: number; W: number; ground: number; s: number; snow?: number; far?: string; near?: string }) => {
  const peaks = (n: number, h: number, off: number) =>
    Array.from({ length: n + 1 }, (_, i) => `${x + (i / n) * W},${ground - h * s * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + off)))}`).join(" L");
  const pk = (n: number, h: number, off: number) => Array.from({ length: n + 1 }, (_, i) => [x + (i / n) * W, ground - h * s * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + off)))]);
  return (
    <g>
      <path d={`M${x} ${ground} L${peaks(6, 230, 0.3)} L${x + W} ${ground} Z`} fill={far} />
      {pk(6, 230, 0.3).map(([px, py], i) => (i % 2 ? null : <path key={`f${i}`} d={`M${px} ${py} l${-22 * s} ${30 * s} l${44 * s} 0 Z`} fill="#eef4f8" opacity={snow * 0.9} />))}
      <path d={`M${x} ${ground} L${peaks(4, 160, 1.1)} L${x + W} ${ground} Z`} fill={near} />
      {pk(4, 160, 1.1).map(([px, py], i) => <path key={`n${i}`} d={`M${px} ${py} l${-26 * s} ${34 * s} l${52 * s} 0 Z`} fill="#f4f8fb" opacity={snow} />)}
    </g>
  );
};
