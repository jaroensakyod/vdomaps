import type { ReactNode } from "react";

// N18 clean-line comic: a printed adventure-comic page. Even black outlines (one weight per scale), flat bright
// fills, no hatching, no dots, no screentone; panels on a grid with white gutters; Thai lettering in balloons.
// Coordinates are for a 1080×1920 page. Put <PageDefs /> inside the <svg> once.
export const K = {
  paper: "#fbf6e6",
  ink: "#141210",
  sky: "#6cc3ec",
  skyLow: "#bfe6f5",
  red: "#e23b2e",
  yellow: "#f6c623",
  green: "#3ea24f",
  leaf: "#2f7d3a",
  water: "#3d8fc6",
  wood: "#b8692e",
  cream: "#f3e2b8",
  skin: "#f1c391",
  white: "#ffffff",
};
export const LW = 4; // the one line weight at 1:1

export const PageDefs = () => (
  <defs>
    <filter id="lc-paper" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
      <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.07 0" />
    </filter>
    <linearGradient id="lc-sky" x1="0" y1="0" x2="0" y2="1">
      {/* two flat bands, not a soft gradient: clean-line skies are flat */}
      <stop offset="0" stopColor={K.sky} />
      <stop offset="0.62" stopColor={K.sky} />
      <stop offset="0.62" stopColor={K.skyLow} />
      <stop offset="1" stopColor={K.skyLow} />
    </linearGradient>
  </defs>
);

// Printed page: paper colour + faint grain + a soft fold shadow on the binding side.
export const Page = () => (
  <g>
    <rect width={1080} height={1920} fill={K.paper} />
    <rect width={1080} height={1920} filter="url(#lc-paper)" />
    <rect x={0} y={0} width={34} height={1920} fill="#000" opacity={0.05} />
  </g>
);

// A panel: clip box + black border. enter 0→1 slides it in from `from` (and fades the border in with it).
export const Panel = ({ id, x, y, w, h, enter = 1, from = "right", children }: { id: string; x: number; y: number; w: number; h: number; enter?: number; from?: "left" | "right" | "up" | "down"; children: ReactNode }) => {
  if (enter <= 0) return null;
  const d = (1 - enter) * 260;
  const [dx, dy] = from === "left" ? [-d, 0] : from === "right" ? [d, 0] : from === "up" ? [0, -d] : [0, d];
  return (
    <g transform={`translate(${dx},${dy})`} opacity={Math.min(1, enter * 1.6)}>
      <clipPath id={`lc-${id}`}><rect x={x} y={y} width={w} height={h} /></clipPath>
      <rect x={x + 7} y={y + 9} width={w} height={h} fill={K.ink} opacity={0.12} />
      <g clipPath={`url(#lc-${id})`}>
        <rect x={x} y={y} width={w} height={h} fill={K.white} />
        {children}
      </g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={K.ink} strokeWidth={6} />
    </g>
  );
};

// Speech balloon: rounded oval box with a tail to (tx, ty); text lines centred. k 0–1 pops it in.
export const Balloon = ({ x, y, w, h, tx, ty, lines, font, size = 40, k = 1 }: { x: number; y: number; w: number; h: number; tx: number; ty: number; lines: string[]; font: string; size?: number; k?: number }) => {
  if (k <= 0) return null;
  const cx = x + w / 2, cy = y + h / 2;
  const s = 0.7 + 0.3 * Math.min(1, k) + Math.sin(Math.PI * Math.min(1, k)) * 0.08;
  const bx = Math.max(x + 40, Math.min(x + w - 40, tx));
  return (
    <g transform={`translate(${cx},${cy}) scale(${s}) translate(${-cx},${-cy})`}>
      <path d={`M${bx - 22} ${ty > cy ? y + h - 10 : y + 10} L${tx} ${ty} L${bx + 22} ${ty > cy ? y + h - 10 : y + 10} Z`} fill={K.white} stroke={K.ink} strokeWidth={LW} strokeLinejoin="round" />
      <rect x={x} y={y} width={w} height={h} rx={h / 2.2} fill={K.white} stroke={K.ink} strokeWidth={LW} />
      <path d={`M${bx - 19} ${ty > cy ? y + h - 4 : y + 4} L${bx + 19} ${ty > cy ? y + h - 4 : y + 4}`} stroke={K.white} strokeWidth={9} />
      {lines.map((l, i) => (
        <text key={i} x={cx} y={cy + (i - (lines.length - 1) / 2) * size * 1.34 + size * 0.36} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={size} fill={K.ink}>{l}</text>
      ))}
    </g>
  );
};

// Narration box: a flat yellow rectangle in a panel corner.
export const Narration = ({ x, y, w, lines, font, size = 30, k = 1, color = K.yellow }: { x: number; y: number; w: number; lines: string[]; font: string; size?: number; k?: number; color?: string }) =>
  k <= 0 ? null : (
    <g opacity={Math.min(1, k * 2)} transform={`translate(0,${(1 - Math.min(1, k)) * -16})`}>
      <rect x={x} y={y} width={w} height={lines.length * size * 1.3 + 22} fill={color} stroke={K.ink} strokeWidth={LW} />
      {lines.map((l, i) => <text key={i} x={x + 16} y={y + 14 + size * 1.02 + i * size * 1.3} fontFamily={font} fontWeight={600} fontSize={size} fill={K.ink}>{l}</text>)}
    </g>
  );

const o = { stroke: K.ink, strokeWidth: LW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

// A limb drawn as an outlined tube (black stroke under the colour stroke) — even line, no shading.
const Limb = ({ d, color, w }: { d: string; color: string; w: number }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={K.ink} strokeWidth={w + LW * 2} />
    <path d={d} stroke={color} strokeWidth={w} />
  </g>
);

export type Toon = { shirt: string; pants: string; skin?: string; hair?: string; hat?: "straw" | "cap" | "none" | "bun"; capColor?: string };

// An original clean-line character, feet at (x, y). wave 0–1 raises the right arm; phase drives a small bounce.
export const Person = ({ x, y, s = 1, look, wave = 0, phase = 0, flip = false, mouth = "smile" }: { x: number; y: number; s?: number; look: Toon; wave?: number; phase?: number; flip?: boolean; mouth?: "smile" | "open" }) => {
  const skin = look.skin ?? K.skin;
  const b = Math.abs(Math.sin(phase)) * 4;
  const ax = 30 + wave * 14, ay = -110 - wave * 70 + Math.sin(phase * 2) * wave * 10;
  return (
    <g transform={`translate(${x},${y - b}) scale(${flip ? -s : s},${s})`}>
      <Limb d="M-12 -62 L-16 -4" color={look.pants} w={18} />
      <Limb d="M12 -62 L16 -4" color={look.pants} w={18} />
      <path d="M-28 -4 h22 v8 h-26 Z M8 -4 h22 l2 8 h-24 Z" fill={K.ink} />
      <path d="M-30 -66 Q-34 -122 0 -128 Q34 -122 30 -66 Z" fill={look.shirt} {...o} />
      <Limb d={`M-24 -116 L-38 -76 L-30 -52`} color={look.shirt} w={14} />
      <Limb d={`M24 -116 L${ax} ${ay + 40} L${ax + 4} ${ay}`} color={look.shirt} w={14} />
      <circle cx={-30} cy={-50} r={8} fill={skin} {...o} />
      <circle cx={ax + 4} cy={ay - 4} r={8} fill={skin} {...o} />
      <path d="M-8 -128 v-10 h16 v10" fill={skin} {...o} />
      <circle cx={0} cy={-166} r={30} fill={skin} {...o} />
      {look.hat !== "straw" && look.hat !== "cap" && <path d="M-30 -170 Q-28 -200 0 -199 Q28 -200 30 -170 Q14 -184 -30 -170 Z" fill={look.hair ?? K.ink} {...o} />}
      {look.hat === "bun" && <circle cx={-6} cy={-204} r={11} fill={look.hair ?? K.ink} {...o} />}
      <circle cx={-10} cy={-168} r={3.4} fill={K.ink} />
      <circle cx={12} cy={-168} r={3.4} fill={K.ink} />
      <path d="M2 -164 q5 6 0 8" fill="none" stroke={K.ink} strokeWidth={2.4} strokeLinecap="round" />
      {mouth === "open" ? <ellipse cx={2} cy={-148} rx={7} ry={6} fill={K.red} {...o} strokeWidth={3} /> : <path d="M-8 -150 q10 8 20 0" fill="none" stroke={K.ink} strokeWidth={3} strokeLinecap="round" />}
      {look.hat === "straw" && (
        <g {...o}>
          <path d="M-52 -184 Q0 -172 52 -184 Q30 -194 22 -196 Q0 -230 -22 -196 Q-30 -194 -52 -184 Z" fill={K.yellow} />
          <path d="M-22 -196 Q0 -188 22 -196" fill="none" stroke={K.red} strokeWidth={6} />
        </g>
      )}
      {look.hat === "cap" && (
        <g {...o}>
          <path d="M-30 -180 Q-30 -206 0 -208 Q30 -206 30 -180 Z" fill={look.capColor ?? K.ink} />
          <path d="M-32 -180 H38 Q38 -172 30 -172 H-32 Z" fill={K.ink} />
          <circle cx={0} cy={-194} r={5} fill={K.yellow} stroke="none" />
        </g>
      )}
    </g>
  );
};

// A small steam tank engine (side view), front to the right, wheels turning with `spin` (radians).
export const Loco = ({ x, y, s = 1, spin = 0 }: { x: number; y: number; s?: number; spin?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-150} y={-150} width={250} height={86} rx={14} fill={K.green} {...o} />
    {[-110, -40, 30].map((bx) => <path key={bx} d={`M${bx} -150 v86`} stroke={K.yellow} strokeWidth={5} />)}
    <rect x={-230} y={-210} width={100} height={150} fill={K.green} {...o} />
    <rect x={-216} y={-196} width={34} height={44} fill={K.skyLow} {...o} />
    <rect x={-176} y={-196} width={34} height={44} fill={K.skyLow} {...o} />
    <path d="M-242 -214 H-118 V-204 H-242 Z" fill={K.ink} />
    <path d="M60 -150 L70 -214 H104 L112 -150 Z" fill={K.ink} {...o} />
    <path d="M60 -224 H114 V-210 H60 Z" fill={K.ink} />
    <ellipse cx={-30} cy={-160} rx={30} ry={18} fill={K.yellow} {...o} />
    <rect x={100} y={-136} width={18} height={60} fill={K.ink} {...o} />
    <rect x={-250} y={-64} width={380} height={22} fill={K.red} {...o} />
    <circle cx={132} cy={-104} r={10} fill={K.yellow} {...o} />
    {[-170, -60, 50].map((wx) => (
      <g key={wx} transform={`translate(${wx},-30)`}>
        <circle r={34} fill={K.red} {...o} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M0 0 L${Math.cos(spin + (i * Math.PI) / 2) * 30} ${Math.sin(spin + (i * Math.PI) / 2) * 30}`} stroke={K.ink} strokeWidth={4} />)}
        <circle r={7} fill={K.ink} />
      </g>
    ))}
    <path d={`M${-170 + Math.cos(spin) * 18} ${-30 + Math.sin(spin) * 18} L${50 + Math.cos(spin) * 18} ${-30 + Math.sin(spin) * 18}`} stroke={K.ink} strokeWidth={8} strokeLinecap="round" />
  </g>
);

// A wooden passenger coach with heads in the windows.
export const Coach = ({ x, y, s = 1, spin = 0, faces = 3 }: { x: number; y: number; s?: number; spin?: number; faces?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-170 -200 Q0 -226 170 -200 V-196 H-170 Z" fill={K.red} {...o} />
    <rect x={-160} y={-196} width={320} height={140} fill={K.cream} {...o} />
    {Array.from({ length: 4 }, (_, i) => (
      <g key={i}>
        <rect x={-140 + i * 74} y={-176} width={54} height={60} fill={K.sky} {...o} />
        {i < faces && <g><circle cx={-113 + i * 74} cy={-134} r={16} fill={K.skin} {...o} strokeWidth={3} /><path d={`M${-129 + i * 74} -140 Q${-113 + i * 74} -162 ${-97 + i * 74} -140 Z`} fill={i % 2 ? K.ink : "#7a3b16"} /></g>}
      </g>
    ))}
    <rect x={-160} y={-100} width={320} height={10} fill={K.wood} stroke="none" />
    <rect x={-176} y={-60} width={352} height={18} fill={K.ink} />
    {[-100, 100].map((wx) => (
      <g key={wx} transform={`translate(${wx},-30)`}>
        <circle r={26} fill={K.ink} />
        {[0, 1, 2].map((i) => <path key={i} d={`M0 0 L${Math.cos(spin + (i * 2 * Math.PI) / 3) * 22} ${Math.sin(spin + (i * 2 * Math.PI) / 3) * 22}`} stroke={K.white} strokeWidth={3} />)}
      </g>
    ))}
  </g>
);

// Clean-line steam puff: a lumpy outlined cloud (flat white, no shading).
export const Puff = ({ x, y, r, k = 1 }: { x: number; y: number; r: number; k?: number }) => (
  <g transform={`translate(${x},${y}) scale(${r / 40})`} opacity={k}>
    <path d="M-40 10 Q-52 -14 -28 -22 Q-24 -46 2 -40 Q20 -56 36 -34 Q58 -26 46 0 Q52 22 26 22 Q8 36 -12 24 Q-40 32 -40 10 Z" fill={K.white} {...o} strokeWidth={LW * (40 / r)} />
  </g>
);

export const Palm = ({ x, y, s = 1, sway = 0 }: { x: number; y: number; s?: number; sway?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-6 0 Q-14 -90 6 -190 L18 -190 Q2 -90 10 0 Z" fill={K.wood} {...o} />
    <g transform={`translate(12,-192) rotate(${sway})`}>
      {[-150, -110, -60, -20, 20, 200].map((a) => (
        <path key={a} d={`M0 0 Q${Math.cos((a * Math.PI) / 180) * 60} ${Math.sin((a * Math.PI) / 180) * 60 - 30} ${Math.cos((a * Math.PI) / 180) * 110} ${Math.sin((a * Math.PI) / 180) * 110 + 20} Q${Math.cos((a * Math.PI) / 180) * 50} ${Math.sin((a * Math.PI) / 180) * 50 - 6} 0 0 Z`} fill={K.green} {...o} />
      ))}
      <circle cx={-6} cy={8} r={9} fill="#7a4a1a" {...o} strokeWidth={3} />
    </g>
  </g>
);

// Wooden house on stilts by the water.
export const StiltHouse = ({ x, y, s = 1, roof = K.red }: { x: number; y: number; s?: number; roof?: string }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[-70, -20, 30, 70].map((px) => <rect key={px} x={px - 5} y={-40} width={10} height={60} fill={K.wood} {...o} strokeWidth={3} />)}
    <rect x={-90} y={-150} width={180} height={110} fill={K.cream} {...o} />
    <path d="M-110 -146 L0 -222 L110 -146 Z" fill={roof} {...o} />
    <rect x={-60} y={-120} width={40} height={46} fill={K.wood} {...o} />
    <rect x={14} y={-122} width={44} height={36} fill={K.sky} {...o} />
  </g>
);

// A rowing boat with an original boatman.
export const Boat = ({ x, y, s = 1, row = 0 }: { x: number; y: number; s?: number; row?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-120 -30 Q0 10 120 -40 L104 -8 Q0 24 -104 -4 Z" fill={K.wood} {...o} />
    <g transform="translate(40,-30)">
      <path d="M-14 0 Q-16 -50 0 -54 Q16 -50 14 0 Z" fill={K.red} {...o} />
      <circle cx={0} cy={-70} r={16} fill={K.skin} {...o} />
      <path d="M-30 -80 Q0 -100 30 -80 Q0 -90 -30 -80 Z" fill={K.yellow} {...o} />
      <path d={`M0 -40 L${-70 + row * 30} 40`} stroke={K.ink} strokeWidth={6} strokeLinecap="round" />
    </g>
  </g>
);

// Flat water with clean wave lines.
export const Water = ({ x, y, w, h, t = 0 }: { x: number; y: number; w: number; h: number; t?: number }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={K.water} />
    <path d={`M${x} ${y} H${x + w}`} stroke={K.ink} strokeWidth={LW} />
    {Array.from({ length: Math.ceil(w / 120) * 3 }, (_, i) => {
      const row = i % 3;
      const wx = x + ((i * 97 + t * (12 + row * 6)) % (w + 120)) - 60;
      const wy = y + 30 + row * (h / 3.4);
      return <path key={i} d={`M${wx} ${wy} q15 -10 30 0 q15 10 30 0`} fill="none" stroke={K.white} strokeWidth={3.5} strokeLinecap="round" />;
    })}
  </g>
);
