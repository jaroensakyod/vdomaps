import type { ReactNode } from "react";

// Twilight silhouette pieces: a vivid dusk sky that deepens over the shot (gold → magenta → violet), first stars,
// and crisp pure-black silhouettes in layers. Coordinates are for a 1080-wide frame; HORIZON is the water line.
export const INK = "#06030a"; // silhouettes: pure, flat, never outlined
export const HORIZON = 1250;

// Dusk progression k 0 → 1: four sky stops from zenith to horizon.
const SKY0 = ["#3a1a6e", "#b42f86", "#f2724a", "#ffc865"];
const SKY1 = ["#120a33", "#4b1f78", "#b83a7c", "#f39a5a"];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(",")})`;
};
export const skyStops = (k: number) => SKY0.map((c, i) => mix(c, SKY1[i], k));

// Deterministic pseudo-random (same picture every render).
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const TwilightDefs = ({ k }: { k: number }) => {
  const s = skyStops(k);
  return (
    <defs>
      <linearGradient id="tw-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={s[0]} />
        <stop offset="0.42" stopColor={s[1]} />
        <stop offset="0.78" stopColor={s[2]} />
        <stop offset="1" stopColor={s[3]} />
      </linearGradient>
      {/* the water mirrors the sky, darker and inverted */}
      <linearGradient id="tw-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={s[3]} stopOpacity={0.9} />
        <stop offset="0.35" stopColor={s[2]} stopOpacity={0.8} />
        <stop offset="1" stopColor={s[1]} stopOpacity={0.45} />
      </linearGradient>
      <radialGradient id="tw-sun" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff4d2" />
        <stop offset="0.25" stopColor="#ffd98a" stopOpacity={0.9} />
        <stop offset="1" stopColor="#ff9a5a" stopOpacity={0} />
      </radialGradient>
      <filter id="tw-haze"><feGaussianBlur stdDeviation={2.2} /></filter>
      <filter id="tw-ripple" x="0" y="0" width="1" height="1">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.06" numOctaves={2} seed={3} />
        <feDisplacementMap in="SourceGraphic" scale={12} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="tw-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} />
        <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.4  0 0 0 0 0.6  0 0 0 0.07 0" />
      </filter>
    </defs>
  );
};

// Sky, sun sinking behind the horizon, a thin crescent moon and stars that appear one by one as k grows.
export const Sky = ({ k, frame, w = 1080 }: { k: number; frame: number; w?: number }) => {
  const sunY = HORIZON - 95 + k * 125;
  return (
    <g>
      <rect x={0} y={0} width={w} height={HORIZON} fill="url(#tw-sky)" />
      <circle cx={760} cy={sunY} r={560} fill="url(#tw-sun)" opacity={0.85 - k * 0.4} />
      <circle cx={760} cy={sunY} r={58} fill="#fff1c8" opacity={0.95} />
      <Stars k={k} frame={frame} w={w} />
      {/* crescent moon */}
      <g transform="translate(250,330)" opacity={0.3 + k * 0.7}>
        <circle r={34} fill="#fff6e6" />
        <circle cx={13} cy={-8} r={31} fill={skyStops(k)[0]} />
      </g>
    </g>
  );
};

export const Stars = ({ k, frame, w = 1080 }: { k: number; frame: number; w?: number }) => (
  <g>
    {Array.from({ length: 70 }, (_, i) => {
      const x = rnd(i) * w;
      const y = rnd(i + 99) * rnd(i + 7) * 880 + 30;
      const born = 0.15 + rnd(i + 31) * 0.8 + (y / 880) * 0.3; // high stars first
      const on = Math.max(0, Math.min(1, (k - born) * 6));
      const tw = 0.75 + 0.25 * Math.sin(frame * 0.09 + i * 1.7);
      const r = 1.2 + rnd(i + 51) * 1.8;
      return on > 0 ? <circle key={i} cx={x} cy={y} r={r} fill="#fff8ec" opacity={on * tw} /> : null;
    })}
    {/* the first star (evening Venus) beside the moon, always first */}
    <g transform="translate(330,250)" opacity={Math.min(1, k * 4)}>
      <circle r={4.5} fill="#fffaf0" />
      <path d="M-16 0 L16 0 M0 -16 L0 16" stroke="#fffaf0" strokeWidth={1.2} opacity={0.6} />
    </g>
  </g>
);

// Layer wrapper that drifts sideways at its own speed (far slow, near fast).
export const Drift = ({ x, children, haze = false }: { x: number; children: ReactNode; haze?: boolean }) => (
  <g transform={`translate(${x},0)`} filter={haze ? "url(#tw-haze)" : undefined}>{children}</g>
);

// Low distant hills, tinted toward the sky (atmospheric depth).
export const FarHills = ({ k, w = 1400 }: { k: number; w?: number }) => {
  const pts = Array.from({ length: 29 }, (_, i) => `L${-200 + i * 60} ${HORIZON - 70 - Math.sin(i * 0.7) * 34 - rnd(i + 3) * 30}`).join(" ");
  return <path d={`M-200 ${HORIZON} ${pts} L${w} ${HORIZON} Z`} fill={mix("#5a2462", "#24103e", k)} />;
};

// Ayutthaya-style ruins: a prang (corn-cob tower) and bell chedis, drawn as one flat silhouette.
export const Prang = ({ x, y, h }: { x: number; y: number; h: number }) => {
  const s = h / 400;
  // corn-cob body: seven stacked bands that narrow and round off, each with flared corner petals
  const bands = Array.from({ length: 7 }, (_, i) => {
    const y0 = -150 - i * 28;
    const w0 = 74 - i * 5 - i * i * 0.55;
    const w1 = 74 - (i + 1) * 5 - (i + 1) * (i + 1) * 0.55;
    return `M${-w0} ${y0} L${-w1 - 2} ${y0 - 23} L${-w1 - 10} ${y0 - 30} L${w1 + 10} ${y0 - 30} L${w1 + 2} ${y0 - 23} L${w0} ${y0} Z`;
  }).join(" ");
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} fill={INK}>
      <path d="M-130 0 L-130 -30 L-110 -30 L-110 -55 L-92 -55 L-92 -80 L92 -80 L92 -55 L110 -55 L110 -30 L130 -30 L130 0 Z" />
      <path d="M-80 -80 L-80 -150 L80 -150 L80 -80 Z" />
      {/* porch on the front with its own small roof */}
      <path d="M-150 0 L-150 -70 L-178 -70 L-150 -100 L-122 -70 L-122 0 Z" />
      <path d={bands} />
      <path d="M-20 -344 C-18 -364 -9 -374 0 -378 C9 -374 18 -364 20 -344 Z" />
      <path d="M-3 -378 L0 -432 L3 -378 Z" />
      {/* a lost corner: the ruin's broken edge */}
      <path d="M92 -80 L118 -80 L112 -66 L124 -60 L108 -48 L92 -55 Z" />
    </g>
  );
};
export const Chedi = ({ x, y, h }: { x: number; y: number; h: number }) => {
  const s = h / 300;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} fill={INK}>
      <path d="M-90 0 L-90 -24 L-76 -24 L-76 -44 L76 -44 L76 -24 L90 -24 L90 0 Z" />
      <path d="M-70 -44 C-70 -110 -40 -150 0 -158 C40 -150 70 -110 70 -44 Z" />
      <rect x={-20} y={-178} width={40} height={22} />
      {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={0} cy={-186 - i * 12} rx={16 - i * 1.6} ry={6} />)}
      <path d="M-3 -280 L0 -300 L3 -280 L3 -270 L-3 -270 Z" />
    </g>
  );
};
// Broken wall stubs and a few trees along the ruin line.
export const RuinWall = ({ x, y, w }: { x: number; y: number; w: number }) => (
  <path fill={INK} d={`M${x} ${y} ` + Array.from({ length: 12 }, (_, i) => `L${x + (i * w) / 12} ${y - 30 - rnd(i + x) * 50} L${x + ((i + 0.6) * w) / 12} ${y - 30 - rnd(i + x + 5) * 50}`).join(" ") + ` L${x + w} ${y} Z`} />
);
export const Palm = ({ x, y, h, sway = 0 }: { x: number; y: number; h: number; sway?: number }) => (
  <g transform={`translate(${x},${y})`} fill={INK}>
    <path d={`M-5 0 Q${8 + sway} ${-h * 0.5} ${sway * 2} ${-h} L${sway * 2 + 6} ${-h} Q${14 + sway} ${-h * 0.5} 5 0 Z`} />
    {Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + 0.3;
      const L = 70 + rnd(i + h) * 30;
      const ex = Math.cos(a) * L;
      const ey = Math.sin(a) * L * 0.55 + 22;
      return <path key={i} d={`M${sway * 2 + 3} ${-h} Q${sway * 2 + ex * 0.5} ${-h + ey * 0.2 - 30} ${sway * 2 + ex} ${-h + ey} Q${sway * 2 + ex * 0.45} ${-h - 12} ${sway * 2 + 3} ${-h + 6} Z`} />;
    })}
  </g>
);
export const Tree = ({ x, y, h }: { x: number; y: number; h: number }) => (
  <g transform={`translate(${x},${y})`} fill={INK}>
    <path d={`M-12 0 L-6 ${-h * 0.55} L-60 ${-h * 0.8} L-4 ${-h * 0.62} L0 ${-h} L6 ${-h * 0.6} L64 ${-h * 0.85} L10 ${-h * 0.52} L14 0 Z`} />
    {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={(rnd(i + h) - 0.5) * h * 0.9} cy={-h * (0.72 + rnd(i + 3 + h) * 0.3)} r={h * (0.1 + rnd(i + 9) * 0.08)} />)}
  </g>
);

// A boat with a rower, gliding; the oar dips with t.
export const Boat = ({ x, y, t }: { x: number; y: number; t: number }) => (
  <g transform={`translate(${x},${y})`} fill={INK}>
    <path d="M-120 -10 Q-60 14 0 14 Q60 14 120 -16 L110 -4 Q60 22 0 22 Q-60 22 -112 2 Z" />
    <path d="M-30 -12 L30 -12 L36 4 L-36 4 Z" />
    <circle cx={-56} cy={-66} r={11} />
    <path d="M-70 -54 L-44 -54 L-40 -10 L-74 -10 Z" />
    <path d="M-80 -78 L-56 -94 L-32 -78 Z" />
    <path d={`M-48 -46 L${20 + Math.sin(t) * 20} ${30} L${24 + Math.sin(t) * 20} 28 L-44 -50 Z`} />
  </g>
);

// Figures on the near bank, walking slowly: tapered legs from the hip, swinging arms, a hat or a topknot.
export const Walker = ({ x, y, h, t, child = false, hat = true }: { x: number; y: number; h: number; t: number; child?: boolean; hat?: boolean }) => {
  const sw = Math.sin(t) * 0.38;
  const s = h / 300;
  const leg = (a: number) => {
    const fx = Math.sin(a) * 78;
    return `M-12 -150 Q${fx * 0.4 - 14} -80 ${fx - 6} -6 L${fx + 22} 0 L${fx + 6} -10 Q${fx * 0.4 + 8} -80 14 -150 Z`;
  };
  const arm = (a: number) => `M-6 -246 Q${Math.sin(a) * 40 - 4} -200 ${Math.sin(a) * 70} -150 L${Math.sin(a) * 70 + 10} -148 Q${Math.sin(a) * 40 + 8} -200 10 -240 Z`;
  return (
    <g transform={`translate(${x},${y - Math.abs(Math.cos(t)) * 4}) scale(${s})`} fill={INK}>
      <path d={leg(sw)} />
      <path d={leg(-sw)} />
      <path d="M-22 -146 Q-30 -210 -20 -250 Q2 -264 26 -250 Q34 -210 22 -146 Z" />
      <path d="M-6 -264 L10 -264 L10 -248 L-6 -248 Z" />
      <ellipse cx={2} cy={-288} rx={child ? 25 : 21} ry={child ? 27 : 24} />
      <path d={arm(-sw)} />
      <path d={arm(sw)} />
      {hat ? <path d="M-48 -298 Q2 -340 52 -298 Q2 -306 -48 -298 Z" /> : <circle cx={-10} cy={-312} r={10} />}
    </g>
  );
};

// An overhanging branch from a top corner: frames the sky and is the nearest depth layer up there.
export const Branch = ({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -1 : 1},1)`} fill={INK}>
    <path d="M-60 -60 Q160 30 430 150 Q300 70 150 10 Q270 30 370 70 Q200 -6 -60 -40 Z" />
    <path d="M120 10 Q170 60 190 130 L184 132 Q160 70 112 16 Z M260 66 Q300 110 300 170 L294 170 Q290 116 252 70 Z" />
    {Array.from({ length: 40 }, (_, i) => {
      const bx = rnd(i + 70) * 430;
      const by = -20 + (bx / 430) * 160 + (rnd(i + 90) - 0.35) * 70;
      const a = rnd(i + 13) * 80 + 10;
      const L = 30 + rnd(i + 17) * 26;
      return <path key={i} d={`M0 0 Q${L * 0.5} ${-L * 0.3} ${L * 1.5} 0 Q${L * 0.5} ${L * 0.3} 0 0 Z`} transform={`translate(${bx} ${by}) rotate(${a})`} />;
    })}
  </g>
);

// Reeds and a lotus at the very front: the darkest, sharpest layer.
export const Reeds = ({ x, y, sway = 0 }: { x: number; y: number; sway?: number }) => (
  <g transform={`translate(${x},${y})`} fill={INK}>
    {Array.from({ length: 9 }, (_, i) => {
      const rx = i * 26 - 100;
      const rh = 160 + rnd(i + 40) * 200;
      return <path key={i} d={`M${rx - 4} 0 Q${rx + sway * 0.5} ${-rh * 0.5} ${rx + sway + (rnd(i) - 0.5) * 60} ${-rh} Q${rx + 3} ${-rh * 0.5} ${rx + 4} 0 Z`} />;
    })}
    <path d={`M60 0 Q66 -120 ${70 + sway} -230 L${76 + sway} -230 Q72 -120 68 0 Z`} />
    <path d={`M${73 + sway} -226 C${46 + sway} -246 ${48 + sway} -290 ${73 + sway} -314 C${98 + sway} -290 ${100 + sway} -246 ${73 + sway} -226 Z`} />
    <path d="M150 0 Q160 -60 170 -110 L176 -110 Q166 -60 158 0 Z" />
    <ellipse cx={200} cy={-112} rx={70} ry={14} transform="rotate(-8 200 -112)" />
  </g>
);

// A flock in a loose V crossing the sky: wings beat with t.
export const Birds = ({ x, y, t, n = 7 }: { x: number; y: number; t: number; n?: number }) => (
  <g fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round">
    {Array.from({ length: n }, (_, i) => {
      const bx = x - Math.abs(i - (n - 1) / 2) * 46 + i * 6;
      const by = y + Math.abs(i - (n - 1) / 2) * 30 + rnd(i) * 10;
      const f = Math.sin(t * 1.6 + i * 0.9) * 9;
      return <path key={i} d={`M${bx - 16} ${by - f} Q${bx - 7} ${by - 6} ${bx} ${by} Q${bx + 7} ${by - 6} ${bx + 16} ${by - f}`} />;
    })}
  </g>
);

// Water band: mirrored sky, a mirrored copy of the ruin line (rippled), and glitter under the sun.
export const Water = ({ top, h, w = 1080, frame, k, mirror }: { top: number; h: number; w?: number; frame: number; k: number; mirror: ReactNode }) => (
  <g>
    <rect x={0} y={top} width={w} height={h} fill="url(#tw-water)" />
    <rect x={0} y={top} width={w} height={h} fill={INK} opacity={0.25 + k * 0.2} />
    <g filter="url(#tw-ripple)" opacity={0.75}>
      <g transform={`translate(0,${2 * top}) scale(1,-1)`}>{mirror}</g>
    </g>
    {Array.from({ length: 26 }, (_, i) => {
      const yy = top + 10 + i * i * 0.36;
      const ww = (60 - i * 1.8) * (0.6 + 0.4 * Math.sin(frame * 0.12 + i * 2.1));
      return <rect key={i} x={760 - ww / 2 + Math.sin(i * 3.3) * 18} y={yy} width={Math.max(2, ww)} height={2.4} fill="#ffe2a6" opacity={(0.8 - i * 0.025) * (1 - k * 0.6)} />;
    })}
  </g>
);

// The near bank: a flat black foreground with grass blades along its edge.
export const Bank = ({ y, w = 1080, x0 = -200, sway = 0 }: { y: number; w?: number; x0?: number; sway?: number }) => (
  <g fill={INK}>
    <path d={`M${x0} ${y + 30} Q${w * 0.3} ${y - 30} ${w * 0.62} ${y + 4} T${w + 300} ${y - 10} L${w + 300} 2000 L${x0} 2000 Z`} />
    {Array.from({ length: 70 }, (_, i) => {
      const gx = x0 + i * 22 + rnd(i) * 10;
      const gy = y + 20 - Math.sin((gx + 200) / 300) * 18;
      const gh = 26 + rnd(i + 4) * 44;
      return <path key={i} d={`M${gx - 3} ${gy + 20} Q${gx + sway * 0.4} ${gy - gh * 0.5} ${gx + sway + (rnd(i + 8) - 0.5) * 20} ${gy - gh} Q${gx + 2} ${gy - gh * 0.4} ${gx + 4} ${gy + 20} Z`} />;
    })}
  </g>
);
