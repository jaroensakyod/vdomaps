import { C } from "./Vase";

// N03 figures in the red-figure manner: shapes reserved in clay, every inner detail a fine black relief line,
// muscles and folds in thinner dilute brown, hair and eyes solid black, snow and old men's hair in added white.
// Strict profile, facing right, 100 units tall, feet at y = 0. Flip with <On flip>.
const L = { stroke: C.line, strokeWidth: 0.8, strokeLinejoin: "round" as const, strokeLinecap: "round" as const, fill: "none" };
const D = { stroke: C.dilute, strokeWidth: 0.5, strokeLinecap: "round" as const, fill: "none" };
const clay = { fill: C.clay, stroke: C.line, strokeWidth: 0.8, strokeLinejoin: "round" as const };

const Head = ({ x = 0, y = -86, helmet = "crest" as "crest" | "none" | "wreath" | "white" }) => (
  <g>
    {/* face in profile: straight brow-nose line, almond eye */}
    <path d={`M${x - 6} ${y - 4} Q${x - 6} ${y - 11} ${x} ${y - 11} Q${x + 6} ${y - 11} ${x + 6} ${y - 4} L${x + 9} ${y + 1} L${x + 6.5} ${y + 2} L${x + 7} ${y + 4.5} L${x + 5} ${y + 7} L${x + 1} ${y + 8} L${x - 1} ${y + 11} L${x - 5} ${y + 11} L${x - 6} ${y + 4} Z`} {...clay} />
    <path d={`M${x + 2.5} ${y - 2} q1.8 -1.2 3 0 q-1.4 0.9 -3 0 Z`} fill={C.line} />
    <path d={`M${x + 1.5} ${y - 4.5} q2.5 -1.2 4.5 0`} {...L} strokeWidth={0.5} />
    {helmet === "crest" && (
      <g>
        <path d={`M${x - 8} ${y + 3} Q${x - 9} ${y - 13} ${x + 1} ${y - 13} Q${x + 8} ${y - 13} ${x + 7} ${y - 5} L${x + 4} ${y - 4} L${x + 3} ${y + 2} L${x - 2} ${y + 3} Q${x - 4} ${y + 7} ${x - 8} ${y + 8} Z`} {...clay} />
        <path d={`M${x - 1} ${y - 1} q2 -3 5 -3`} {...L} />
        <path d={`M${x - 10} ${y - 3} Q${x - 4} ${y - 26} ${x + 9} ${y - 18} Q${x - 2} ${y - 20} ${x - 3} ${y - 12}`} fill={C.clay} stroke={C.line} strokeWidth={0.8} />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${x - 8 + i * 2.6} ${y - 6 - i * 1.6} l${1.5} ${-6 + i * 0.3}`} {...D} />)}
      </g>
    )}
    {helmet === "none" && <path d={`M${x - 6} ${y - 6} Q${x - 4} ${y - 14} ${x + 4} ${y - 11} Q${x - 1} ${y - 9} ${x - 1} ${y - 4} Q${x - 4} ${y + 2} ${x - 7} ${y + 6} Z`} fill={C.line} />}
    {(helmet === "wreath" || helmet === "white") && (
      <g>
        <path d={`M${x - 6} ${y - 6} Q${x - 4} ${y - 14} ${x + 4} ${y - 11} Q${x - 1} ${y - 9} ${x - 1} ${y - 4} Q${x - 4} ${y + 2} ${x - 7} ${y + 6} Z`} fill={helmet === "white" ? C.white : C.line} />
        <path d={`M${x + 2} ${y + 5} Q${x - 1} ${y + 14} ${x - 5} ${y + 11}`} fill={helmet === "white" ? C.white : C.line} />
        {helmet === "wreath" && [0, 1, 2, 3].map((i) => <ellipse key={i} cx={x - 4 + i * 2.6} cy={y - 10.5 + Math.abs(i - 1.5)} rx={1.3} ry={0.7} fill={C.clay} />)}
      </g>
    )}
  </g>
);

// Soldier striding right. shield: "round" (hoplon with a device) or "scutum" (tall curved, Roman). pose: walk / charge / fall
export const Warrior = ({ shield = "round", device = "star", pose = "walk", cloak = false }: { shield?: "round" | "scutum"; device?: "star" | "bolt" | "scorpion" | "eye"; pose?: "walk" | "charge" | "stand" | "fallen"; cloak?: boolean }) => {
  if (pose === "fallen")
    return (
      <g transform="translate(0,-2) rotate(-82)">
        <Warrior shield={shield} device={device} pose="stand" />
      </g>
    );
  const st = pose === "stand" ? 0.4 : pose === "charge" ? 1.4 : 1;
  const lean = pose === "charge" ? 8 : 0;
  return (
    <g transform={`rotate(${lean} 0 0)`}>
      {/* far leg, near leg with greaves */}
      <path d={`M-2 -48 Q${-8 * st} -26 ${-14 * st} -3 L${-14 * st + 6} -2 Q${-4 * st + 3} -26 4 -46 Z`} {...clay} />
      <path d={`M2 -48 Q${6 * st + 4} -26 ${12 * st + 3} -3 L${12 * st + 11} -2 L${12 * st + 8} -5 Q${6 * st + 8} -26 8 -46 Z`} {...clay} />
      <path d={`M${12 * st + 3} -24 q3 -2 6 0 M${-11 * st} -24 q3 -2 6 0`} {...L} />
      <path d={`M${7 * st + 4} -36 q2 4 1 9 M${-6 * st} -36 q1 4 0 9`} {...D} />
      {/* short chiton with folds */}
      <path d="M-9 -66 L9 -66 L12 -46 L-11 -45 Z" {...clay} />
      {[-6, -2, 2, 6].map((x) => <path key={x} d={`M${x} -56 q1 5 ${x * 0.2} 10`} {...L} strokeWidth={0.5} />)}
      <path d="M-11 -46 L12 -46" {...L} />
      {/* cuirass */}
      <path d="M-8 -78 Q0 -81 9 -77 L9 -64 L-9 -64 Z" {...clay} />
      <path d="M-6 -73 q6 3 13 -1 M0 -78 v13 M-9 -64 L9 -64" {...L} strokeWidth={0.55} />
      {cloak && <path d="M-8 -78 Q-22 -58 -20 -40 Q-14 -44 -10 -40 Q-12 -56 -4 -72 Z" {...clay} />}
      {cloak && <path d="M-12 -66 q-4 10 -5 22 M-8 -62 q-3 8 -3 18" {...L} strokeWidth={0.5} />}
      {/* spear held overarm or level */}
      <path d={pose === "charge" ? "M-30 -66 L44 -74" : "M-6 -10 L20 -132"} stroke={C.clay} strokeWidth={1.4} />
      <path d={pose === "charge" ? "M44 -74 l6 -1.2 l-6 -1.6 Z" : "M20 -132 l0.4 -6 l1.6 5.6 Z"} fill={C.clay} />
      <path d={pose === "charge" ? "M6 -74 Q14 -76 18 -72" : "M8 -76 Q16 -72 15 -64"} stroke={C.clay} strokeWidth={4.5} strokeLinecap="round" />
      <Head />
      {/* shield on the near arm */}
      {shield === "round" ? (
        <g transform="translate(-3,-62)">
          <circle r={19} {...clay} />
          <circle r={16.5} {...L} />
          <circle r={15.5} {...L} strokeWidth={0.4} />
          {device === "star" && <path d="M0 -10 L2.4 -3 L9.5 -3 L3.8 1.5 L6 8.5 L0 4 L-6 8.5 L-3.8 1.5 L-9.5 -3 L-2.4 -3 Z" fill={C.line} />}
          {device === "scorpion" && <path d="M-8 4 Q-2 -2 4 2 Q9 5 9 -2 Q9 -8 4 -9 M-8 4 l-3 3 M-8 4 l-3 -2 M-4 2 l-1 4 M0 1 l0 4" {...L} strokeWidth={1.6} />}
          {device === "eye" && <g><path d="M-10 0 Q0 -8 10 0 Q0 8 -10 0 Z" fill={C.line} /><circle r={2.6} fill={C.clay} /></g>}
        </g>
      ) : (
        <g transform="translate(-2,-58)">
          <path d="M-9 -26 Q-14 0 -9 26 L7 26 Q11 0 7 -26 Z" {...clay} />
          <path d="M-6 -22 Q-10 0 -6 22 L4 22 Q8 0 4 -22 Z" {...L} strokeWidth={0.5} />
          <circle cx={-1} cy={0} r={3.5} fill={C.line} />
          <path d="M-4 -16 l4 6 l-3 1 l5 7 M-1 2 l-3 7 l3 0 l-3 7" {...L} strokeWidth={1} />
        </g>
      )}
    </g>
  );
};

// War elephant in profile with a mahout and the general on its back. snow: added-white flecks.
export const Elephant = ({ rider = true, snow = 0 }: { rider?: boolean; snow?: number }) => {
  const leg = (x: number, near: boolean) => (
    <g key={`${x}${near}`} opacity={near ? 1 : 0.9}>
      <path d={`M${x - 6} -44 Q${x - 8} -22 ${x - 6} -1 L${x + 8} -1 Q${x + 10} -22 ${x + 7} -44 Z`} {...clay} />
      <path d={`M${x - 5} -3 q2.3 -2.4 4.6 0 q2.3 -2.4 4.6 0 q2.3 -2.4 4.6 0`} {...L} strokeWidth={0.5} />
      <path d={`M${x - 4} -26 q5 2 10 0 M${x - 4} -22 q5 2 10 0`} {...D} />
    </g>
  );
  return (
    <g>
      {leg(-24, false)}
      {leg(20, false)}
      {/* body */}
      <path d="M-44 -48 Q-48 -84 -16 -92 Q14 -98 34 -86 Q48 -78 50 -60 Q50 -46 42 -40 L-38 -38 Q-46 -40 -44 -48 Z" {...clay} />
      <path d="M-38 -44 Q0 -36 40 -44" {...D} />
      <path d="M-44 -60 Q-56 -56 -58 -38 l-2 4 l3 -1" {...L} strokeWidth={1.2} />
      {leg(-32, true)}
      {leg(28, true)}
      {/* head, trunk hanging and curling forward, ear, tusk */}
      <path d="M32 -88 Q54 -98 64 -80 Q70 -66 68 -48 Q66 -30 70 -16 Q74 -6 68 -2 Q62 -2 60 -10 Q56 -26 56 -40 Q54 -48 46 -50 Z" {...clay} />
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${63 + i * 0.3} ${-42 + i * 6} q3.5 1.2 6 -0.4`} {...L} strokeWidth={0.45} />)}
      <path d="M30 -86 Q14 -76 18 -54 Q28 -46 42 -52 Q48 -68 40 -82 Z" {...clay} />
      <path d="M22 -74 q3 10 10 14 M27 -78 q1 10 8 16 M32 -80 q0 8 5 14" {...D} />
      <path d="M58 -46 Q72 -46 80 -56 Q76 -42 60 -40 Z" fill={C.white} stroke={C.line} strokeWidth={0.6} />
      <path d="M52 -76 q2.8 -1.8 5.2 0 q-2.6 1.4 -5.2 0 Z" fill={C.line} />
      <path d="M50 -80 q4 -2.5 8 -0.5" {...L} strokeWidth={0.5} />
      {/* saddle cloth with a key border and tassels */}
      <path d="M-24 -95 L22 -93 L26 -56 L-28 -56 Z" {...clay} />
      <path d="M-27 -63 L26 -63 M-27 -57 L26 -57" {...L} strokeWidth={0.6} />
      {Array.from({ length: 9 }, (_, i) => <path key={`k${i}`} d={`M${-25 + i * 5.6} -58 v-4 h3.6 v2 h-1.8`} {...L} strokeWidth={0.55} />)}
      {[-26, -14, -2, 10, 22].map((x) => <path key={`q${x}`} d={`M${x} -56 l0 5`} {...L} strokeWidth={1} />)}
      {[-16, -6, 4, 14].map((x) => <path key={x} d={`M${x} -90 q1.5 12 0 24`} {...D} />)}
      {rider && (
        <g>
          <g transform="translate(40,-88) scale(0.6)">
            <path d="M-8 0 L-6 -30 L8 -30 L10 0 Z" {...clay} />
            <Head y={-38} helmet="none" />
            <path d="M6 -26 L28 -6" stroke={C.clay} strokeWidth={2.4} />
          </g>
          <g transform="translate(0,-95) scale(0.72)">
            <path d="M-10 0 L-8 -34 L10 -34 L12 0 Z" {...clay} />
            <path d="M-8 -34 Q-26 -16 -24 6 Q-16 0 -8 4 Z" {...clay} />
            <path d="M-4 -30 v26 M2 -30 v26 M-18 -16 q-2 8 -2 16" {...L} strokeWidth={0.5} />
            <Head y={-42} helmet="crest" />
            <path d="M8 -30 L36 -58" stroke={C.clay} strokeWidth={2.4} strokeLinecap="round" />
          </g>
        </g>
      )}
      {snow > 0 && Array.from({ length: 16 }, (_, i) => <circle key={i} cx={-40 + ((i * 37) % 90)} cy={-92 + ((i * 23) % 34)} r={0.9} fill={C.white} opacity={snow} />)}
    </g>
  );
};

// Old man in a himation, both arms thrown up when alarm = 1.
export const Senator = ({ alarm = 0 }: { alarm?: number }) => (
  <g>
    <path d="M-12 -70 Q-16 -36 -14 -2 L16 -2 Q18 -36 12 -72 Z" {...clay} />
    {/* the cloth: long diagonal folds and a zig-zag hem */}
    {[-8, -3, 2, 7].map((x, i) => <path key={x} d={`M${x} -66 Q${x + 3} -36 ${x - 1 + i} -6`} {...L} strokeWidth={0.6} />)}
    <path d="M-12 -70 Q2 -50 14 -40" {...L} />
    <path d="M-14 -4 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3" {...L} strokeWidth={0.6} />
    <path d="M-12 -2 L-14 0 L-6 0 Z M8 -2 L6 0 L14 0 Z" fill={C.clay} stroke={C.line} strokeWidth={0.6} />
    <path d={`M8 -68 Q${16 + alarm * 2} ${-76 - alarm * 10} ${18 + alarm * 2} ${-84 - alarm * 18}`} stroke={C.clay} strokeWidth={4.5} strokeLinecap="round" fill="none" />
    <path d={`M8 -68 Q${16 + alarm * 2} ${-76 - alarm * 10} ${18 + alarm * 2} ${-84 - alarm * 18}`} stroke={C.line} strokeWidth={0.6} fill="none" opacity={0.6} />
    <path d={`M-6 -68 Q${-12 - alarm * 2} ${-74 - alarm * 12} ${-8 - alarm * 6} ${-82 - alarm * 20}`} stroke={C.clay} strokeWidth={4.5} strokeLinecap="round" fill="none" />
    <Head y={-80} helmet="white" />
  </g>
);

// Doric column with fluting; 100 units tall, centred on x = 0.
export const Column = () => (
  <g>
    <path d="M-10 0 L-8 -88 L8 -88 L10 0 Z" {...clay} />
    {[-5, -1.5, 2, 5.5].map((x) => <path key={x} d={`M${x} -4 L${x * 0.85} -86`} {...L} strokeWidth={0.5} />)}
    <path d="M-12 -88 Q0 -84 12 -88 L14 -94 L-14 -94 Z" {...clay} />
    <rect x={-16} y={-100} width={32} height={6} {...clay} />
  </g>
);

// Mountain range drawn the potter's way: a row of sharp peaks, dotted rock texture, white snow caps.
export const Mountain = ({ w = 200, h = 80, snow = 1, peaks = 3 }: { w?: number; h?: number; snow?: number; peaks?: number }) => {
  const step = w / peaks;
  const tops = Array.from({ length: peaks }, (_, i) => [-w / 2 + step * (i + 0.5), -h * (0.75 + ((i * 7) % 3) * 0.12)]);
  const d = `M${-w / 2} 0 ` + tops.map(([x, y], i) => `L${x} ${y} L${x + step / 2} ${i === peaks - 1 ? 0 : -h * 0.3}`).join(" ") + " Z";
  return (
    <g>
      <path d={d} {...clay} />
      {tops.map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x - step * 0.22} ${y + h * 0.22} L${x} ${y} L${x + step * 0.22} ${y + h * 0.22} l-${step * 0.07} -${h * 0.05} l-${step * 0.08} ${h * 0.07} l-${step * 0.07} -${h * 0.07} l-${step * 0.08} ${h * 0.07} Z`} fill={C.white} opacity={snow} />
          {Array.from({ length: 12 }, (_, j) => <circle key={j} cx={x - step * 0.22 + (j % 4) * step * 0.14 + (Math.floor(j / 4) % 2) * 4} cy={y + h * 0.36 + Math.floor(j / 4) * h * 0.12} r={0.9} fill={C.line} />)}
          <path d={`M${x} ${y + h * 0.22} q-4 ${h * 0.3} -${step * 0.3} ${-y - h * 0.04}`} {...L} strokeWidth={0.6} />
        </g>
      ))}
    </g>
  );
};

// Roman standard (eagle on a pole) that tips over with fall 0 → 1.
export const Standard = ({ fall = 0 }: { fall?: number }) => (
  <g transform={`rotate(${fall * 70})`}>
    <path d="M0 0 L0 -120" stroke={C.clay} strokeWidth={1.6} />
    <path d="M-8 -96 h16 v16 h-16 Z" {...clay} />
    <path d="M-5 -92 h10 M-5 -88 h10 M-5 -84 h10" {...L} strokeWidth={0.5} />
    <path d="M-10 -124 Q0 -134 10 -124 L4 -122 Q0 -128 -4 -122 Z" {...clay} />
    <circle cx={0} cy={-128} r={2.6} {...clay} />
  </g>
);

// A palmette (filler ornament the painters put between scenes).
export const Palmette = () => (
  <g>
    {[-60, -36, -12, 12, 36, 60].map((a) => <path key={a} d="M0 0 Q-3 -16 0 -30 Q3 -16 0 0 Z" fill={C.clay} stroke={C.line} strokeWidth={0.6} transform={`rotate(${a})`} />)}
    <path d="M-10 4 Q0 -6 10 4" {...clay} />
    <path d="M-14 8 Q-24 0 -20 -10 M14 8 Q24 0 20 -10" stroke={C.clay} strokeWidth={1.6} fill="none" />
  </g>
);
