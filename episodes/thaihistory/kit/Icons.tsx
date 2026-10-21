import type { ReactNode } from "react";
import { random, useCurrentFrame } from "remotion";
import { C } from "./theme";

// Flat cartoon icons with a dark outline, drawn in SVG. Every icon: (x, y) = the ground point under it (bottom
// centre), `size` = height in px, designed in a 100-unit box (y from -100 to 0). `phase` de-syncs idle motion.
type P = { x: number; y: number; size?: number; phase?: number; flip?: boolean; k?: number };

const O = C.ink;
const SW = 3; // outline width in icon units

const Box = ({ x, y, size = 60, flip, k = 1, children }: P & { children: ReactNode }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x},${y}) scale(${(size / 100) * k}) ${flip ? "scale(-1,1)" : ""}`}>{children}</g>
  );

const useT = (phase = 0) => useCurrentFrame() + phase * 13;

// Waving pennant on a pole; pole top at (0, top).
const Pennant = ({ top, color, t, len = 26, x = 0 }: { top: number; color: string; t: number; len?: number; x?: number }) => {
  const w = Math.sin(t * 0.25) * 3;
  return (
    <g>
      <line x1={x} y1={top + 40} x2={x} y2={top} stroke={O} strokeWidth={SW} strokeLinecap="round" />
      <path d={`M${x} ${top} Q${x + len / 2} ${top + 2 + w} ${x + len} ${top + 6 + w * 1.4} L${x + len - 3} ${top + 14 + w} Q${x + len / 2} ${top + 12 - w} ${x} ${top + 16} Z`} fill={color} stroke={O} strokeWidth={SW * 0.8} strokeLinejoin="round" />
    </g>
  );
};

export type Hold = "none" | "spear" | "sword" | "flag" | "sickle" | "torch" | "hoe";

// Chibi soldier / person. color = shirt (faction), hat: helmet (Burma), cap (Siam), band (villager), none.
export const Soldier = ({ color = C.burma, hat = "helmet", hold = "spear", walk = false, ...p }: P & { color?: string; hat?: "helmet" | "cap" | "band" | "none" | "tak"; hold?: Hold; walk?: boolean }) => {
  const t = useT(p.phase);
  const bob = walk ? -Math.abs(Math.sin(t * 0.35)) * 4 : Math.sin(t * 0.08) * 1;
  const leg = walk ? Math.sin(t * 0.35) * 14 : 0;
  return (
    <Box {...p}>
      <g transform={`translate(0,${bob})`}>
        <ellipse cx={0} cy={2 - bob} rx={18} ry={4} fill="rgba(51,38,27,0.18)" />
        <g transform={`rotate(${leg},-6,-26)`}><rect x={-10} y={-28} width={8} height={26} rx={3} fill="#5a4636" stroke={O} strokeWidth={SW} /></g>
        <g transform={`rotate(${-leg},6,-26)`}><rect x={2} y={-28} width={8} height={26} rx={3} fill="#5a4636" stroke={O} strokeWidth={SW} /></g>
        <path d="M-16 -26 Q-18 -56 0 -58 Q18 -56 16 -26 Z" fill={color} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
        {hold === "spear" && <g><line x1={20} y1={-6} x2={20} y2={-96} stroke="#6b4a2b" strokeWidth={4} strokeLinecap="round" /><path d="M15 -94 L20 -108 L25 -94 Z" fill="#cfd3d6" stroke={O} strokeWidth={2} /></g>}
        {hold === "sword" && <g transform="rotate(-30,18,-40)"><rect x={16} y={-80} width={5} height={40} rx={1} fill="#e2e6e9" stroke={O} strokeWidth={2} /><rect x={11} y={-42} width={15} height={5} rx={2} fill={C.taksin} stroke={O} strokeWidth={2} /></g>}
        {hold === "flag" && <Pennant top={-104} color={color} t={t} x={20} len={30} />}
        {hold === "sickle" && <path d="M18 -40 Q34 -52 26 -66 Q30 -52 18 -46 Z" fill="#cfd3d6" stroke={O} strokeWidth={2} />}
        {hold === "hoe" && <g><line x1={20} y1={-10} x2={20} y2={-70} stroke="#6b4a2b" strokeWidth={4} strokeLinecap="round" /><path d="M20 -70 L36 -66 L36 -60 L20 -62 Z" fill="#9aa0a4" stroke={O} strokeWidth={2} /></g>}
        {hold === "torch" && <g><line x1={20} y1={-20} x2={20} y2={-66} stroke="#6b4a2b" strokeWidth={4} strokeLinecap="round" /><Flame x={20} y={-64} size={22} t={t} /></g>}
        <circle cx={hold === "none" ? 14 : 20} cy={-40} r={5} fill={C.skin} stroke={O} strokeWidth={2} />
        <circle cx={0} cy={-74} r={19} fill={C.skin} stroke={O} strokeWidth={SW} />
        <circle cx={-6} cy={-74} r={2.4} fill={O} />
        <circle cx={6} cy={-74} r={2.4} fill={O} />
        <path d="M-4 -66 Q0 -63 4 -66" stroke={O} strokeWidth={2} fill="none" strokeLinecap="round" />
        {hat === "helmet" && <path d="M-21 -78 Q-20 -100 0 -101 Q20 -100 21 -78 Q0 -84 -21 -78 Z M-3 -101 L0 -112 L3 -101 Z" fill={color} stroke={O} strokeWidth={SW} strokeLinejoin="round" />}
        {hat === "cap" && <path d="M-20 -80 Q-18 -97 0 -97 Q18 -97 20 -80 Q0 -86 -20 -80 Z" fill="#3a3a44" stroke={O} strokeWidth={SW} strokeLinejoin="round" />}
        {hat === "band" && <g><path d="M-19 -82 Q0 -90 19 -82 L19 -77 Q0 -85 -19 -77 Z" fill={C.burma} stroke={O} strokeWidth={2} /><path d="M17 -80 L28 -76 L24 -70" fill="none" stroke={C.burma} strokeWidth={4} strokeLinecap="round" /></g>}
        {hat === "tak" && <path d="M-20 -80 Q-18 -98 0 -99 Q18 -98 20 -80 Q0 -86 -20 -80 Z M-4 -99 L0 -116 L4 -99 Z" fill={C.taksin} stroke={O} strokeWidth={SW} strokeLinejoin="round" />}
      </g>
    </Box>
  );
};

// Cartoon flame, base at (x, y).
export const Flame = ({ x, y, size = 40, t }: { x: number; y: number; size?: number; t: number }) => {
  const f = 1 + Math.sin(t * 0.6) * 0.08 + Math.sin(t * 1.3) * 0.05;
  return (
    <g transform={`translate(${x},${y}) scale(${(size / 40) * f},${(size / 40) / f})`}>
      <path d="M0 0 C-16 0 -18 -14 -10 -24 C-8 -16 -4 -16 -4 -20 C-6 -30 0 -36 4 -42 C4 -32 14 -28 14 -14 C14 -4 8 0 0 0 Z" fill={C.fire} stroke={O} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M0 -3 C-7 -3 -8 -10 -3 -16 C-2 -12 2 -12 3 -18 C6 -14 8 -10 6 -6 C5 -4 3 -3 0 -3 Z" fill="#ffd34d" />
    </g>
  );
};

export const Fire = ({ seed = 0, ...p }: P & { seed?: number }) => {
  const t = useT(p.phase);
  return (
    <Box {...p}>
      <Flame x={-14} y={0} size={56} t={t + seed * 7} />
      <Flame x={14} y={0} size={46} t={t + 9 + seed * 3} />
      <Flame x={0} y={0} size={80} t={t + 4 + seed} />
    </Box>
  );
};

export const Smoke = ({ ...p }: P) => {
  const t = useT(p.phase);
  return (
    <Box {...p}>
      {[0, 1, 2].map((i) => {
        const a = ((t * 0.02 + i / 3) % 1);
        return <circle key={i} cx={a * 20} cy={-20 - a * 80} r={14 + a * 18} fill="#8b8682" opacity={0.55 * (1 - a)} />;
      })}
    </Box>
  );
};

// Walled city seen from above-ish: square wall with corner bastions, little roofs inside, pennant.
export const Fort = ({ color = C.ayut, burnt = 0, ...p }: P & { color?: string; burnt?: number }) => {
  const t = useT(p.phase);
  const roofs: [number, number][] = [[-20, -70], [0, -74], [20, -70], [-22, -46], [0, -50], [22, -46], [-10, -26], [12, -26]];
  return (
    <Box {...p}>
      <rect x={-44} y={-92} width={88} height={88} fill="#e8d6ac" stroke="#9c4a2c" strokeWidth={6} />
      {roofs.map(([rx, ry], i) => (
        <path key={i} d={`M${rx - 9} ${ry} L${rx} ${ry - 10} L${rx + 9} ${ry} L${rx + 7} ${ry + 7} L${rx - 7} ${ry + 7} Z`} fill={burnt > (i + 1) / roofs.length ? "#6b4a3a" : "#b3784e"} stroke={O} strokeWidth={2} strokeLinejoin="round" />
      ))}
      {[[-44, -92], [44, -92], [-44, -4], [44, -4]].map(([bx, by], i) => <rect key={i} x={bx - 7} y={by - 7} width={14} height={14} fill="#c8643c" stroke={O} strokeWidth={2.4} />)}
      <Pennant top={-132} color={color} t={t} x={44} len={30} />
    </Box>
  );
};

// Round palisade camp with tents and a pennant (Burmese siege camp by default).
export const Camp = ({ color = C.burma, ...p }: P & { color?: string }) => {
  const t = useT(p.phase);
  return (
    <Box {...p}>
      <ellipse cx={0} cy={-30} rx={46} ry={30} fill="#d9c597" stroke="#7b5634" strokeWidth={7} strokeDasharray="5 3" />
      {[[-18, -32], [10, -40], [16, -18], [-6, -14]].map(([tx, ty], i) => (
        <path key={i} d={`M${tx - 11} ${ty} L${tx} ${ty - 16} L${tx + 11} ${ty} Z`} fill={i % 2 ? "#f0e2c0" : color} stroke={O} strokeWidth={2.2} strokeLinejoin="round" />
      ))}
      <Pennant top={-96} color={color} t={t} x={2} len={28} />
    </Box>
  );
};

export const Tent = ({ color = C.burma, ...p }: P & { color?: string }) => (
  <Box {...p}>
    <path d="M-40 0 L0 -60 L40 0 Z" fill={color} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M-10 0 L0 -26 L10 0 Z" fill="#3b2a1a" />
  </Box>
);

// Small rowing boat with one rower and a pennant at the stern.
export const Boat = ({ color = C.ayut, rowers = 1, ...p }: P & { color?: string; rowers?: number }) => {
  const t = useT(p.phase);
  const bob = Math.sin(t * 0.12) * 2;
  return (
    <Box {...p}>
      <g transform={`translate(0,${bob}) rotate(${Math.sin(t * 0.1) * 2})`}>
        {Array.from({ length: rowers }, (_, i) => {
          const rx = -16 + i * (32 / Math.max(1, rowers - 1 || 1)) * (rowers > 1 ? 1 : 0) + (rowers > 1 ? 0 : 6);
          return (
            <g key={i}>
              <line x1={rx + 6} y1={-30} x2={rx + 22 + Math.sin(t * 0.3 + i) * 6} y2={-2} stroke="#6b4a2b" strokeWidth={3} strokeLinecap="round" />
              <rect x={rx - 7} y={-46} width={14} height={18} rx={4} fill={color} stroke={O} strokeWidth={2.4} />
              <circle cx={rx} cy={-54} r={9} fill={C.skin} stroke={O} strokeWidth={2.4} />
            </g>
          );
        })}
        <path d="M-56 -26 Q-50 -6 -28 -4 L34 -4 Q54 -8 60 -28 Z" fill="#a5683a" stroke={O} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M-50 -20 L54 -20" stroke="#7e4c27" strokeWidth={2} />
        <Pennant top={-70} color={color} t={t} x={-48} len={22} />
      </g>
    </Box>
  );
};

// Chinese-style junk (trade ship).
export const Junk = ({ ...p }: P) => {
  const t = useT(p.phase);
  const bob = Math.sin(t * 0.1) * 2;
  return (
    <Box {...p}>
      <g transform={`translate(0,${bob})`}>
        <path d="M-52 -30 L-44 -4 L44 -4 L56 -34 Z" fill="#8e5530" stroke={O} strokeWidth={SW} strokeLinejoin="round" />
        <line x1={-6} y1={-30} x2={-6} y2={-96} stroke={O} strokeWidth={SW} />
        <path d="M-6 -94 L-38 -88 L-34 -40 L-6 -42 Z" fill="#e7c98a" stroke={O} strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M-6 -94 L24 -86 L26 -40 L-6 -42 Z" fill="#d9b36c" stroke={O} strokeWidth={2.5} strokeLinejoin="round" />
        {[-80, -66, -52].map((yy) => <line key={yy} x1={-36} y1={yy} x2={25} y2={yy + 2} stroke={O} strokeWidth={1.5} opacity={0.6} />)}
      </g>
    </Box>
  );
};

// War elephant with a rider under a parasol.
export const Elephant = ({ color = C.burma, walk = true, ...p }: P & { color?: string; walk?: boolean }) => {
  const t = useT(p.phase);
  const sw = walk ? Math.sin(t * 0.25) * 8 : 0;
  return (
    <Box {...p}>
      <ellipse cx={0} cy={2} rx={44} ry={5} fill="rgba(51,38,27,0.18)" />
      {[-26, -12, 10, 24].map((lx, i) => (
        <g key={lx} transform={`rotate(${i % 2 ? sw : -sw},${lx},-30)`}><rect x={lx - 6} y={-32} width={12} height={32} rx={4} fill="#9a9aa2" stroke={O} strokeWidth={SW} /></g>
      ))}
      <path d="M-40 -30 Q-44 -72 -4 -74 Q30 -76 34 -50 L34 -30 Z" fill="#a9a9b1" stroke={O} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M28 -66 Q52 -72 50 -46 Q50 -26 44 -10 Q40 -6 38 -12 Q42 -30 36 -42" fill="#a9a9b1" stroke={O} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M22 -60 Q14 -46 26 -40" fill="#9696a0" stroke={O} strokeWidth={2.4} />
      <circle cx={40} cy={-58} r={2.6} fill={O} />
      <path d="M44 -44 L56 -40" stroke="#f4ecd8" strokeWidth={4} strokeLinecap="round" />
      <rect x={-26} y={-88} width={30} height={16} rx={3} fill={color} stroke={O} strokeWidth={2.4} />
      <circle cx={-11} cy={-98} r={8} fill={C.skin} stroke={O} strokeWidth={2.2} />
      <line x1={-11} y1={-104} x2={-11} y2={-122} stroke={O} strokeWidth={2.4} />
      <path d="M-30 -118 Q-11 -134 8 -118 Z" fill={C.taksin} stroke={O} strokeWidth={2.2} />
    </Box>
  );
};

// Bronze cannon on a wooden carriage. fire: 0 → 1 = muzzle flash + smoke puff.
export const Cannon = ({ fire = 0, cracked = false, ...p }: P & { fire?: number; cracked?: boolean }) => (
  <Box {...p}>
    <circle cx={-14} cy={-14} r={14} fill="#8e5a2e" stroke={O} strokeWidth={SW} />
    <circle cx={-14} cy={-14} r={4} fill={O} />
    <path d="M-44 -34 L40 -46 L42 -30 L-40 -16 Z" fill="#b08236" stroke={O} strokeWidth={SW} strokeLinejoin="round" />
    <rect x={36} y={-50} width={10} height={24} rx={3} fill="#9a6d27" stroke={O} strokeWidth={SW} transform="rotate(-8,41,-38)" />
    {cracked && <path d="M-6 -36 L0 -28 L-4 -24 L4 -18" fill="none" stroke={O} strokeWidth={3} strokeLinecap="round" />}
    {fire > 0 && fire < 1 && (
      <g opacity={1 - fire}>
        <path d={`M48 -40 l${20 + fire * 20} -10 l-8 10 l${18 + fire * 14} 6 l-22 2 Z`} fill="#ffcf3f" stroke={O} strokeWidth={2} />
        <circle cx={70 + fire * 40} cy={-46 - fire * 16} r={10 + fire * 20} fill="#9a958f" opacity={0.7} />
      </g>
    )}
  </Box>
);

export const Cloud = ({ rain = true, ...p }: P & { rain?: boolean }) => {
  const t = useT(p.phase);
  return (
    <Box {...p}>
      {rain &&
        [-24, -8, 8, 24].map((dx, i) => {
          const a = ((t * 0.06 + i * 0.27) % 1);
          return <line key={i} x1={dx - a * 4} y1={-40 + a * 40} x2={dx - 4 - a * 4} y2={-30 + a * 40} stroke="#3f7fa0" strokeWidth={4} strokeLinecap="round" opacity={1 - a * 0.6} />;
        })}
      <path d="M-40 -46 Q-52 -48 -50 -60 Q-48 -74 -32 -72 Q-28 -92 -6 -90 Q12 -100 24 -84 Q44 -88 46 -70 Q58 -64 50 -50 Q46 -44 38 -46 Z" fill="#7d8792" stroke={O} strokeWidth={SW} strokeLinejoin="round" />
    </Box>
  );
};

export const Sun = ({ ...p }: P) => {
  const t = useT(p.phase);
  return (
    <Box {...p}>
      <g transform={`translate(0,-50) rotate(${t * 0.6})`}>
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={0} y1={-34} x2={0} y2={-46} stroke={O} strokeWidth={3} strokeLinecap="round" transform={`rotate(${i * 36})`} />)}
      </g>
      <circle cx={0} cy={-50} r={26} fill="#f28c38" stroke={O} strokeWidth={SW} />
    </Box>
  );
};

// Thai stupa (chedi). brick = ruined red brick instead of gold.
export const Stupa = ({ brick = false, ...p }: P & { brick?: boolean }) => {
  const g = brick ? "#b5674a" : "#e2b33c";
  const d = brick ? "#8f4c35" : "#c08f22";
  return (
    <Box {...p}>
      <rect x={-30} y={-14} width={60} height={14} fill={d} stroke={O} strokeWidth={SW} />
      <rect x={-22} y={-26} width={44} height={12} fill={g} stroke={O} strokeWidth={SW} />
      <path d="M-20 -26 Q-22 -58 0 -60 Q22 -58 20 -26 Z" fill={g} stroke={O} strokeWidth={SW} />
      <path d="M-6 -60 L0 -100 L6 -60 Z" fill={d} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
      {[-70, -78, -86].map((yy) => <line key={yy} x1={-4} y1={yy} x2={4} y2={yy} stroke={O} strokeWidth={2} />)}
    </Box>
  );
};

export const RiceSack = ({ ...p }: P) => (
  <Box {...p}>
    <path d="M-28 0 Q-36 -40 -16 -58 L-20 -70 L20 -70 L16 -58 Q36 -40 28 0 Z" fill="#e3cf9e" stroke={O} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M-18 -58 L18 -58" stroke={O} strokeWidth={3} />
    <ellipse cx={0} cy={-28} rx={9} ry={12} fill="none" stroke="#b18a43" strokeWidth={3} />
  </Box>
);

export const RicePlant = ({ ...p }: P) => {
  const t = useT(p.phase);
  return (
    <Box {...p}>
      {[-14, -5, 5, 14].map((dx, i) => (
        <path key={i} d={`M${dx} 0 Q${dx + Math.sin(t * 0.08 + i) * 4} -40 ${dx * 2.2 + Math.sin(t * 0.08 + i) * 6} -76`} fill="none" stroke="#4f9a3a" strokeWidth={6} strokeLinecap="round" />
      ))}
      {[-26, 30].map((dx) => <ellipse key={dx} cx={dx} cy={-74} rx={6} ry={12} fill="#e2c35a" stroke={O} strokeWidth={2} />)}
    </Box>
  );
};

export const Chain = ({ ...p }: P) => (
  <Box {...p}>
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-40 + i * 20} y={-56 + (i % 2) * 6} width={30} height={18} rx={9} fill="none" stroke="#6d6f73" strokeWidth={7} />
    ))}
  </Box>
);

// Clay rice pot; broken = split in two with shards.
export const Pot = ({ broken = 0, ...p }: P & { broken?: number }) => {
  const g = broken * 22;
  return (
    <Box {...p}>
      <g transform={`translate(${-g},${broken * 4}) rotate(${-broken * 18})`}>
        <path d="M0 0 L-30 0 Q-44 -26 -30 -52 L-20 -60 L0 -60 Z" fill="#9b5a33" stroke={O} strokeWidth={SW} strokeLinejoin="round" />
      </g>
      <g transform={`translate(${g},${broken * 4}) rotate(${broken * 18})`}>
        <path d="M0 0 L30 0 Q44 -26 30 -52 L20 -60 L0 -60 Z" fill="#a8653b" stroke={O} strokeWidth={SW} strokeLinejoin="round" />
      </g>
      {broken > 0 && [[-8, -76], [10, -82], [0, -90]].map(([sx, sy], i) => <path key={i} d={`M${sx} ${sy * broken} l8 -4 l2 8 Z`} fill="#9b5a33" stroke={O} strokeWidth={2} />)}
    </Box>
  );
};

export const Shovel = ({ ...p }: P) => (
  <Box {...p}>
    <g transform="rotate(25)">
      <rect x={-3} y={-96} width={6} height={64} fill="#8b5a32" stroke={O} strokeWidth={2.4} />
      <path d="M-14 -34 L14 -34 L12 -8 Q0 4 -12 -8 Z" fill="#a4abb0" stroke={O} strokeWidth={SW} strokeLinejoin="round" />
    </g>
  </Box>
);

export const Firewood = ({ ...p }: P) => (
  <Box {...p}>
    {[[-24, -8, -12], [0, -10, 8], [-12, -24, -4], [14, -24, 10]].map(([fx, fy, r], i) => (
      <g key={i} transform={`rotate(${r},${fx},${fy})`}>
        <rect x={fx - 26} y={fy - 7} width={52} height={14} rx={7} fill="#9a6a3c" stroke={O} strokeWidth={2.4} />
        <circle cx={fx + 26} cy={fy} r={6} fill="#d8b183" stroke={O} strokeWidth={2} />
      </g>
    ))}
  </Box>
);

// Siamese crown (chada) — color by faction.
export const Crown = ({ color = C.taksin, ...p }: P & { color?: string }) => (
  <Box {...p}>
    <path d="M-30 0 L30 0 L26 -16 L-26 -16 Z" fill={color} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M-24 -16 Q-22 -50 0 -54 Q22 -50 24 -16 Z" fill={color} stroke={O} strokeWidth={SW} />
    <path d="M-10 -52 L0 -96 L10 -52 Z" fill={color} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
    {[-28, -40].map((yy) => <path key={yy} d={`M-14 ${yy} Q0 ${yy - 8} 14 ${yy}`} fill="none" stroke={O} strokeWidth={2} />)}
    <circle cx={0} cy={-8} r={4} fill="#c0392b" stroke={O} strokeWidth={1.6} />
  </Box>
);

// Horse and rider at a gallop.
export const Rider = ({ color = C.taksin, gallop = true, ...p }: P & { color?: string; gallop?: boolean }) => {
  const t = useT(p.phase);
  const g = gallop ? Math.sin(t * 0.45) : 0;
  return (
    <Box {...p}>
      <ellipse cx={0} cy={2} rx={40} ry={5} fill="rgba(51,38,27,0.18)" />
      {[-24, -12, 16, 28].map((lx, i) => (
        <g key={lx} transform={`rotate(${(i < 2 ? 1 : -1) * g * 26},${lx},-34)`}><rect x={lx - 4} y={-36} width={8} height={34} rx={3} fill="#7a4e2c" stroke={O} strokeWidth={2.4} /></g>
      ))}
      <g transform={`translate(0,${-Math.abs(g) * 4})`}>
        <path d="M-34 -36 Q-38 -60 -10 -60 L22 -60 Q38 -60 36 -36 Z" fill="#8e5a33" stroke={O} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M26 -58 L44 -88 Q52 -92 56 -84 L50 -64 L36 -48 Z" fill="#8e5a33" stroke={O} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M-34 -52 Q-50 -46 -48 -30" fill="none" stroke="#4a2e1a" strokeWidth={6} strokeLinecap="round" />
        <rect x={-10} y={-90} width={18} height={30} rx={5} fill={color} stroke={O} strokeWidth={2.4} />
        <circle cx={-1} cy={-100} r={11} fill={C.skin} stroke={O} strokeWidth={2.4} />
        <path d="M-12 -104 Q-12 -116 -1 -117 Q10 -116 10 -104 Z M-3 -117 L-1 -128 L1 -117 Z" fill={color} stroke={O} strokeWidth={2.2} />
        <g transform="rotate(-50,8,-80)"><rect x={6} y={-120} width={4} height={40} fill="#e2e6e9" stroke={O} strokeWidth={1.6} /></g>
      </g>
    </Box>
  );
};

export const Hourglass = ({ ...p }: P) => {
  const t = useT(p.phase);
  const a = (t * 0.02) % 1;
  return (
    <Box {...p}>
      <rect x={-30} y={-100} width={60} height={8} rx={3} fill="#8b5a32" stroke={O} strokeWidth={2.4} />
      <rect x={-30} y={-8} width={60} height={8} rx={3} fill="#8b5a32" stroke={O} strokeWidth={2.4} />
      <path d="M-22 -92 L22 -92 L4 -50 L22 -8 L-22 -8 L-4 -50 Z" fill="#eaf3f6" stroke={O} strokeWidth={SW} strokeLinejoin="round" />
      <path d={`M${-16 + a * 12} ${-86 + a * 30} L${16 - a * 12} ${-86 + a * 30} L0 -52 Z`} fill="#e2b85a" />
      <path d={`M-18 -10 L18 -10 L${10 - a * 6} ${-18 - a * 16} L${-10 + a * 6} ${-18 - a * 16} Z`} fill="#e2b85a" />
    </Box>
  );
};

export const WhiteFlag = ({ ...p }: P) => {
  const t = useT(p.phase);
  return (
    <Box {...p}>
      <line x1={0} y1={0} x2={0} y2={-100} stroke={O} strokeWidth={4} strokeLinecap="round" />
      <path d={`M0 -98 Q20 ${-94 + Math.sin(t * 0.2) * 4} 42 -92 L40 -62 Q20 ${-66 + Math.sin(t * 0.2) * 4} 0 -66 Z`} fill="#fbf8ef" stroke={O} strokeWidth={2.6} strokeLinejoin="round" />
    </Box>
  );
};

// Group of icons scattered around a point with stable jitter (for crowds, many camps, many boats).
export const scatter = (n: number, seed: string, rx: number, ry: number) =>
  Array.from({ length: n }, (_, i) => [(random(`${seed}x${i}`) - 0.5) * 2 * rx, (random(`${seed}y${i}`) - 0.5) * 2 * ry] as [number, number]);
