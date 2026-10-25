import { random, useCurrentFrame } from "remotion";
import { Elephant, IBERIAN, LIBYAN, Warrior, type Kit } from "./Ancient";
import { Horse } from "./PeriodD";

// Ep 2 ch3–ch4 pieces (the Rhône crossing, the Alpine climb), drawn like kit/Ancient.tsx:
// side view, feet (or waterline) at y = 0, two-tone fills + 1.5 px dark outline, small idle motion.
const INK = "#1b1d24";
type Fig = { x: number; y: number; scale?: number; phase?: number; flip?: boolean };
const T = (x: number, y: number, scale: number, flip: boolean) => `translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`;

// Ancient galley (bireme): ram at the bow, a row of oars, one square sail. Waterline at y = 0, ~300 units long.
export const Galley = ({ x, y, scale = 1, flip = false, phase = 0, sail = "#e8dcc0", stripe = "#a8322a", row = true }: Fig & { sail?: string; stripe?: string; row?: boolean }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.07 + phase) * 2;
  const roll = Math.sin(frame * 0.05 + phase) * 1.2;
  const oar = row ? Math.sin(frame * 0.22 + phase) * 14 : 0;
  return (
    <g transform={`${T(x, y + bob, scale, flip)} rotate(${roll})`}>
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={-100 + i * 24} y1={-14} x2={-100 + i * 24 - 18 + oar * 0.6} y2={16} stroke="#5a3a22" strokeWidth={3} strokeLinecap="round" />
      ))}
      <path d="M-140 -30 L118 -30 L132 -8 L156 -4 L128 4 L116 10 L-120 10 Q-138 2 -150 -40 Q-146 -46 -140 -30 Z" fill="#6b4a2b" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M-128 -16 L114 -16" stroke="#3a2a1e" strokeWidth={4} />
      <path d="M-120 -24 L118 -24" stroke={stripe} strokeWidth={4} />
      <path d="M-150 -40 Q-160 -66 -142 -70" stroke="#6b4a2b" strokeWidth={6} strokeLinecap="round" fill="none" />
      <circle cx={122} cy={-20} r={4} fill="#f2ead6" stroke={INK} strokeWidth={1} />
      <line x1={0} y1={-30} x2={0} y2={-150} stroke="#4a3424" strokeWidth={4.5} />
      <line x1={-50} y1={-140} x2={50} y2={-140} stroke="#4a3424" strokeWidth={3.5} />
      <path d={`M-48 -138 L48 -138 Q${56 + Math.sin(frame * 0.08 + phase) * 4} -96 46 -60 L-46 -60 Q${-38 + Math.sin(frame * 0.08 + phase) * 4} -96 -48 -138 Z`} fill={sail} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-47 -108 L47 -108 L46 -92 L-46 -92 Z" fill={stripe} opacity={0.85} />
    </g>
  );
};

// Raft of logs; `earth` (0 → 1) covers the deck with soil and grass so the animals think it is land.
// Screen units: (x, y) = left end at the waterline, W = length.
export const Raft = ({ x, y, W, s, earth = 1, tilt = 0 }: { x: number; y: number; W: number; s: number; earth?: number; tilt?: number }) => {
  const n = Math.max(3, Math.round(W / (26 * s)));
  const lw = W / n;
  return (
    <g transform={`rotate(${tilt},${x + W / 2},${y})`}>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <rect x={x + i * lw} y={y - 14 * s} width={lw} height={22 * s} rx={10 * s} fill={i % 2 ? "#7a5634" : "#8a6440"} stroke={INK} strokeWidth={1.4 * s} />
          <circle cx={x + i * lw + lw / 2} cy={y - 3 * s} r={4 * s} fill="#b08a5a" stroke={INK} strokeWidth={1 * s} />
        </g>
      ))}
      {earth > 0 && (
        <g opacity={Math.min(1, earth * 1.4)}>
          <path d={`M${x - 4 * s} ${y - 12 * s} Q${x + W * 0.5} ${y - (12 + 14 * earth) * s} ${x + W + 4 * s} ${y - 12 * s} L${x + W + 4 * s} ${y - 8 * s} L${x - 4 * s} ${y - 8 * s} Z`} fill="#7a5a36" stroke={INK} strokeWidth={1.3 * s} />
          {Array.from({ length: Math.round(n * 1.6) }, (_, i) => {
            const gx = x + (i + 0.5) * (W / Math.round(n * 1.6));
            const gy = y - (12 + 10 * earth * Math.sin(((i + 0.5) / Math.round(n * 1.6)) * Math.PI)) * s;
            return <path key={i} d={`M${gx - 5 * s} ${gy} L${gx - 2 * s} ${gy - 9 * s * earth} L${gx} ${gy} L${gx + 3 * s} ${gy - 8 * s * earth} L${gx + 5 * s} ${gy}`} fill="#5f8a3a" stroke="#3c5a24" strokeWidth={1 * s} />;
          })}
        </g>
      )}
    </g>
  );
};

// Elephant swimming: back and head above the water, trunk raised like a snorkel. Waterline at y = 0.
export const SwimElephant = ({ x, y, scale = 1, flip = false, phase = 0 }: Fig) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.12 + phase) * 3;
  const tr = Math.sin(frame * 0.08 + phase) * 5;
  const skin = "#8d8a86";
  const shade = "#6e6b68";
  return (
    <g transform={T(x, y, scale, flip)}>
      <g transform={`translate(0,${bob})`}>
        <path d="M-60 6 Q-58 -36 -16 -40 Q30 -44 50 -22 Q58 -10 56 6 Z" fill={skin} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M44 -36 Q72 -46 82 -22 Q86 -8 78 6 L50 6 Z" fill={skin} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
        <path d={`M56 -34 Q36 -38 34 -14 Q36 2 54 -2 Z`} fill={shade} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
        <circle cx={70} cy={-24} r={2.4} fill={INK} />
        <path d={`M80 -14 Q94 -40 ${92 + tr} -92 Q${92 + tr} -102 ${100 + tr} -100`} stroke={skin} strokeWidth={11} strokeLinecap="round" fill="none" />
        <path d={`M80 -14 Q94 -40 ${92 + tr} -92 Q${92 + tr} -102 ${100 + tr} -100`} stroke={INK} strokeWidth={1.4} fill="none" opacity={0.6} />
        <path d="M76 -4 Q90 -2 96 -10" stroke="#efe6d2" strokeWidth={4.5} strokeLinecap="round" fill="none" />
      </g>
      {/* water over the lower body + ripples */}
      <rect x={-80} y={2} width={190} height={30} fill="#3c6f8f" opacity={0.85} />
      {[0, 1, 2].map((i) => {
        const a = ((frame * 0.8 + i * 20 + phase * 10) % 60) / 60;
        return <ellipse key={i} cx={0} cy={2} rx={70 + a * 50} ry={6 + a * 4} fill="none" stroke="#e3f1f8" strokeWidth={2} opacity={(1 - a) * 0.7} />;
      })}
    </g>
  );
};

// Small boat / dugout hull, drawn over seated rowers (draw figures first, then this hull). Waterline at y = 0.
export const Boat = ({ x, y, scale = 1, flip = false, phase = 0 }: Fig) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.1 + phase) * 1.6;
  const oar = Math.sin(frame * 0.25 + phase) * 16;
  return (
    <g transform={T(x, y + bob, scale, flip)}>
      <line x1={-10} y1={-34} x2={-30 + oar} y2={12} stroke="#5a3a22" strokeWidth={3} strokeLinecap="round" />
      <line x1={30} y1={-34} x2={10 + oar} y2={12} stroke="#5a3a22" strokeWidth={3} strokeLinecap="round" />
      <path d="M-70 -30 L74 -30 Q72 -6 56 4 L-52 4 Q-68 -6 -70 -30 Z" fill="#7a5634" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-66 -22 L70 -22" stroke="#5a3a22" strokeWidth={3} />
    </g>
  );
};

// Rock / boulder, centred at (x, y) with radius r (screen units).
export const Boulder = ({ x, y, r, rot = 0, seed = 0 }: { x: number; y: number; r: number; rot?: number; seed?: number }) => {
  const pts = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2;
    const rr = r * (0.78 + random(`b${seed}${i}`) * 0.3);
    return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
  });
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <path d={`M${pts.join(" L")} Z`} fill="#8a8578" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d={`M${-r * 0.5} ${-r * 0.2} Q${-r * 0.1} ${-r * 0.7} ${r * 0.45} ${-r * 0.35}`} stroke="#b4ae9e" strokeWidth={Math.max(2, r * 0.12)} fill="none" strokeLinecap="round" />
      <path d={`M${-r * 0.3} ${r * 0.4} L${r * 0.3} ${r * 0.25}`} stroke="#5f5a50" strokeWidth={Math.max(1.5, r * 0.08)} />
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

// Gaulish roundhouse: wattle wall, tall thatched cone. ~130 units tall at scale 1.
export const Roundhouse = ({ x, y, scale = 1, snow = 0, glow = 0 }: Fig & { snow?: number; glow?: number }) => (
  <g transform={T(x, y, scale, false)}>
    <rect x={-46} y={-40} width={92} height={40} fill="#b89a6a" stroke={INK} strokeWidth={1.5} />
    {[-30, -10, 10, 30].map((wx) => <line key={wx} x1={wx} y1={-40} x2={wx} y2={0} stroke="#8a6c44" strokeWidth={2} />)}
    <rect x={-10} y={-26} width={20} height={26} fill={glow > 0 ? "#ffb347" : "#3a2a1e"} stroke={INK} strokeWidth={1.2} />
    <path d="M-58 -36 L0 -128 L58 -36 Z" fill="#c9a24a" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    <path d="M0 -128 L58 -36 L24 -36 Z" fill="#000" opacity={0.15} />
    {[-90, -66].map((ty) => <path key={ty} d={`M${(ty + 128) * -0.63} ${ty} L${(ty + 128) * 0.63} ${ty}`} stroke="#9a7a30" strokeWidth={2} />)}
    {snow > 0 && <path d="M-40 -64 L0 -128 L40 -64 Q0 -74 -40 -64 Z" fill="#f4f8fb" opacity={snow} />}
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

// Roman officer (consul): red cloak, crested helmet, arm pointing forward. ~125 units tall at scale 1.
export const Consul = ({ x, y, scale = 1, flip = false, phase = 0, point = 0 }: Fig & { point?: number }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.06 + phase) * 0.6;
  const cape = Math.sin(frame * 0.09 + phase) * 3;
  const skin = "#e2b48e";
  return (
    <g transform={T(x, y + bob, scale, flip)}>
      <ellipse cx={0} cy={1} rx={15} ry={3} fill="#000" opacity={0.3} />
      <path d={`M-12 -92 Q${-30 - cape} -50 ${-26 - cape} -6 L-6 -10 Z`} fill="#a8221c" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M-5 -42 L-4 0 L4 0 L5 -42 Z" fill={skin} stroke={INK} strokeWidth={1.3} />
      <path d="M-6 -6 L-6 1 L9 1 L8 -6 Z" fill="#6b4a2b" />
      <path d="M-12 -90 Q-14 -66 -13 -40 L13 -40 Q14 -66 12 -90 Q0 -95 -12 -90 Z" fill="#c9a24a" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-13 -48 L13 -48 L14 -36 L-14 -36 Z" fill="#b8322a" stroke={INK} strokeWidth={1.2} />
      {[-8, -2, 4, 10].map((px) => <line key={px} x1={px} y1={-36} x2={px} y2={-28} stroke="#8e2620" strokeWidth={4} />)}
      <rect x={-3} y={-98} width={7} height={8} fill={skin} />
      <g transform="translate(1,-107)">
        <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.5} />
        <circle cx={5} cy={0} r={1.3} fill={INK} />
        <path d="M-10 -1 Q-11 -15 0 -15 Q11 -15 10 -1 Q2 -6 -10 -1 Z" fill="#9aa3ab" stroke={INK} strokeWidth={1.3} />
        <path d="M-10 -14 Q0 -30 12 -14" fill="#b8221c" stroke={INK} strokeWidth={1.1} />
      </g>
      <g transform={`translate(6,-86) rotate(${-90 * point + 10 * (1 - point)})`}>
        <path d="M0 0 L2 28" stroke="#c9a24a" strokeWidth={7.5} strokeLinecap="round" />
        <circle cx={2} cy={30} r={3.6} fill={skin} stroke={INK} strokeWidth={1.1} />
      </g>
    </g>
  );
};

// Steep ground: a slope polygon from (x0, y0) down to (x1, y1), filled to `bottom`.
export const Slope = ({ x0, y0, x1, y1, bottom, color = "#7a7468", snow = 0, s }: { x0: number; y0: number; x1: number; y1: number; bottom: number; color?: string; snow?: number; s: number }) => (
  <g>
    <path d={`M${x0} ${y0} L${x1} ${y1} L${x1} ${bottom} L${x0} ${bottom} Z`} fill={color} />
    {snow > 0 && <path d={`M${x0} ${y0} L${x1} ${y1} L${x1} ${y1 + 12 * s} L${x0} ${y0 + 12 * s} Z`} fill="#f2f6f9" opacity={snow} />}
  </g>
);

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
