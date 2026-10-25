import { loadFont as loadSrisakdi } from "@remotion/google-fonts/Srisakdi";
import { loadFont as loadCharm } from "@remotion/google-fonts/Charm";
import type { ReactNode } from "react";

// N06 mural: a Thai temple-wall painting. One long wall (world x −300…3500, y 0…1920) in three registers:
// a dark heaven band with falling gold flowers, the battle register on pale earth with stepped rocks and trees,
// a red dado with a lozenge frieze. Registers are split by zig-zag "sinthao" bands. Flat mineral colours, fine
// red-brown outlines, no perspective: rows higher on the wall are further away. Aged plaster on top: mottling,
// cracks and flaking. The camera is a dolly along the wall.
export const fonts = {
  deco: loadSrisakdi("normal", { weights: ["700"], subsets: ["thai", "latin"] }).fontFamily,
  text: loadCharm("normal", { weights: ["700"], subsets: ["thai", "latin"] }).fontFamily,
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const M = {
  plaster: "#dccaa2",
  plasterLight: "#efe5cc",
  earth: "#cdb98a",
  red: "#9c3b25",
  deepRed: "#6e2318",
  indigo: "#2d3a5c",
  night: "#1a1f33",
  green: "#4f7d5c",
  greenDark: "#2f5a44",
  gold: "#c9973a",
  goldLight: "#e6c272",
  ink: "#3a1a10",
  skin: "#ecdcb8",
  white: "#efe6cf",
  hideA: "#4a4f62", // Siam elephant: slate
  hideB: "#e2d6bc", // the other elephant: pale
};

export const WX0 = -300, WX1 = 3500;
export const SKY = 560; // heaven band bottom
export const FLOOR = 1500; // dado top
export const G = 1400; // ground line of the main figures

const ln = { stroke: M.ink, strokeWidth: 2.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

// Zig-zag sinthao band along y (teeth pointing down when dir = 1).
export const Sinthao = ({ y, h = 34, dir = 1 }: { y: number; h?: number; dir?: 1 | -1 }) => {
  const w = 44;
  const n = Math.ceil((WX1 - WX0) / w);
  let d = `M${WX0} ${y}`;
  for (let i = 0; i < n; i++) d += ` L${WX0 + i * w + w / 2} ${y + h * dir} L${WX0 + (i + 1) * w} ${y}`;
  return (
    <g>
      <path d={d + ` L${WX1} ${y - 10 * dir} L${WX0} ${y - 10 * dir} Z`} fill={M.white} {...ln} strokeWidth={2.6} />
      <path d={d} fill="none" stroke={M.red} strokeWidth={3} />
      <rect x={WX0} y={dir > 0 ? y - 16 : y + 6} width={WX1 - WX0} height={10} fill={M.red} />
    </g>
  );
};

// Gold four-petal flower (scattered in the heaven band).
const Flower = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[0, 90, 180, 270].map((a) => <ellipse key={a} cx={0} cy={-6} rx={3.6} ry={6} fill={M.goldLight} transform={`rotate(${a + 45})`} />)}
    <circle r={2.6} fill={M.red} />
  </g>
);

// Stepped rock (khao mo): a stack of blocky facets, outlined, darker at the base of each step.
export const Rock = ({ x, y, s = 1, color = M.green, dark = M.greenDark }: { x: number; y: number; s?: number; color?: string; dark?: string }) => {
  const blocks = [
    [-120, 0, 240, 70], [-100, -60, 120, 70], [10, -50, 100, 60], [-70, -120, 90, 70], [20, -110, 70, 70], [-40, -180, 70, 70], [-10, -230, 40, 60],
  ];
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {blocks.map(([bx, by, bw, bh], i) => (
        <g key={i}>
          <path d={`M${bx} ${by} L${bx + bw * 0.12} ${by - bh} L${bx + bw * 0.88} ${by - bh} L${bx + bw} ${by} Z`} fill={i % 2 ? color : dark} {...ln} />
          <path d={`M${bx + bw * 0.12} ${by - bh} L${bx + bw * 0.3} ${by - bh * 0.6} L${bx + bw * 0.7} ${by - bh * 0.6} L${bx + bw * 0.88} ${by - bh}`} fill="none" stroke={M.white} strokeWidth={1.6} opacity={0.55} />
        </g>
      ))}
    </g>
  );
};

// Mural tree: a trunk and a round crown made of rows of small leaf scallops.
export const Tree = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-8 0 Q-4 -60 -14 -120 L6 -120 Q4 -60 10 0 Z" fill={M.deepRed} {...ln} />
    <ellipse cx={0} cy={-170} rx={90} ry={80} fill={M.greenDark} {...ln} />
    {Array.from({ length: 5 }, (_, r) =>
      Array.from({ length: 6 - Math.abs(r - 2) }, (_, i) => {
        const n = 6 - Math.abs(r - 2);
        const cx = (i - (n - 1) / 2) * 26, cy = -230 + r * 28;
        return <path key={`${r}-${i}`} d={`M${cx - 11} ${cy} Q${cx} ${cy - 16} ${cx + 11} ${cy} Q${cx} ${cy + 6} ${cx - 11} ${cy} Z`} fill={M.green} stroke={M.goldLight} strokeWidth={1} />;
      }),
    )}
  </g>
);

// The painted wall in world coordinates (static parts).
export const WallPaint = ({ children }: { children?: ReactNode }) => (
  <g>
    <rect x={WX0} y={-500} width={WX1 - WX0} height={2900} fill={M.plaster} />
    {/* heaven */}
    <rect x={WX0} y={-500} width={WX1 - WX0} height={SKY + 500} fill={M.night} />
    {Array.from({ length: 120 }, (_, i) => <Flower key={i} x={WX0 + ((i * 337) % (WX1 - WX0))} y={40 + ((i * 151) % (SKY - 90))} s={0.9 + (i % 3) * 0.35} />)}
    {/* battle register: pale earth with a faint wash of green */}
    <rect x={WX0} y={SKY} width={WX1 - WX0} height={FLOOR - SKY} fill={M.earth} />
    <defs><linearGradient id="n06-earth" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={M.green} stopOpacity={0.35} /><stop offset="0.45" stopColor={M.green} stopOpacity={0} /></linearGradient></defs><rect x={WX0} y={SKY} width={WX1 - WX0} height={FLOOR - SKY} fill="url(#n06-earth)" />{TUFTS.map(([x, y], i) => <path key={i} d={`M${x - 10} ${y} q4 -16 10 -22 M${x} ${y} q0 -18 2 -26 M${x + 10} ${y} q-4 -16 -10 -22`} fill="none" stroke={M.greenDark} strokeWidth={2} opacity={0.75} />)}
    {children}
    {/* dado: red ochre with a lozenge frieze */}
    <rect x={WX0} y={FLOOR} width={WX1 - WX0} height={2400 - FLOOR} fill={M.red} />
    {Array.from({ length: Math.ceil((WX1 - WX0) / 120) }, (_, i) => {
      const x = WX0 + i * 120 + 60, y = FLOOR + 92;
      return (
        <g key={i}>
          <path d={`M${x} ${y - 46} L${x + 46} ${y} L${x} ${y + 46} L${x - 46} ${y} Z`} fill={M.deepRed} stroke={M.goldLight} strokeWidth={2.4} />
          <path d={`M${x} ${y - 20} L${x + 20} ${y} L${x} ${y + 20} L${x - 20} ${y} Z`} fill={M.gold} />
          <circle cx={x} cy={y} r={6} fill={M.red} />
        </g>
      );
    })}
    <rect x={WX0} y={FLOOR + 160} width={WX1 - WX0} height={8} fill={M.gold} />
    <Sinthao y={SKY} />
    <Sinthao y={FLOOR} dir={-1} />
  </g>
);

// Aged plaster over everything (world space): mottled stains, flaking and cracks.
export const Age = () => (
  <g>
    <defs>
      <filter id="n06-mottle" x="0" y="0" width="1" height="1">
        <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={4} seed={21} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 1.4 -0.5" />
      </filter>
      <filter id="n06-flake" x="0" y="0" width="1" height="1">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={5} seed={7} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.91  0 0 0 0 0.86  0 0 0 0 0.75  -16 0 0 0 4.75" />
      </filter>
      <filter id="n06-grain" x="0" y="0" width="1" height="1">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={1} seed={4} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.5 -0.1" />
      </filter>
    </defs>
    <rect x={WX0} y={-500} width={WX1 - WX0} height={2900} filter="url(#n06-mottle)" opacity={0.45} />
    <rect x={WX0} y={-500} width={WX1 - WX0} height={2900} filter="url(#n06-flake)" opacity={0.55} />
    <rect x={WX0} y={-500} width={WX1 - WX0} height={2900} filter="url(#n06-grain)" opacity={0.35} />
    {CRACKS.map((d, i) => <path key={i} d={d} fill="none" stroke="#2a160c" strokeWidth={i % 3 ? 1.4 : 2.4} opacity={0.5} />)}
  </g>
);
const CRACKS = (() => {
  const out: string[] = [];
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let c = 0; c < 26; c++) {
    let x = WX0 + rnd() * (WX1 - WX0), y = rnd() * 1920;
    let d = `M${x.toFixed(0)} ${y.toFixed(0)}`;
    const a0 = rnd() * Math.PI * 2;
    for (let k = 0; k < 9; k++) {
      const a = a0 + (rnd() - 0.5) * 1.6;
      x += Math.cos(a) * (20 + rnd() * 40);
      y += Math.sin(a) * (20 + rnd() * 40);
      d += ` L${x.toFixed(0)} ${y.toFixed(0)}`;
    }
    out.push(d);
  }
  return out;
})();

// ---- figures (facing right; flip mirrors). Feet at y = 0. ----

export type Side = { coat: string; trim: string; hat: "siam" | "turban" };
export const SIAM: Side = { coat: M.red, trim: M.gold, hat: "siam" };
export const BURMA: Side = { coat: M.indigo, trim: M.white, hat: "turban" };

// Foot soldier in the mural stance: deep knee bend, spear forward, shield up. ~160 tall at s = 1.
export const Soldier = ({ x, y, s = 1, side, flip = false, t = 0, run = false, fallen = 0 }: { x: number; y: number; s?: number; side: Side; flip?: boolean; t?: number; run?: boolean; fallen?: number }) => {
  const step = run ? Math.sin(t / 3) * 8 : Math.sin(t / 14) * 1.5;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s}) rotate(${fallen * 70})`}>
      {/* legs: wide bent stance */}
      <path d={`M-4 -70 L${-30 - step} -36 L${-24 - step} -2 L${-14 - step} -2 L${-20 - step} -34 L4 -60 Z`} fill={M.skin} {...ln} />
      <path d={`M2 -70 L${30 + step} -42 L${26 + step} -2 L${36 + step} -2 L${40 + step} -44 L12 -66 Z`} fill={M.skin} {...ln} />
      {/* loincloth */}
      <path d="M-14 -84 L16 -84 L22 -58 L4 -64 L-18 -56 Z" fill={side.coat} {...ln} />
      <path d="M-14 -84 L16 -84" stroke={side.trim} strokeWidth={4} />
      {/* torso, jacket */}
      <path d="M-12 -86 Q-14 -112 -6 -124 L10 -124 Q18 -110 16 -86 Z" fill={side.coat} {...ln} />
      <path d="M-6 -120 L10 -96 M10 -120 L-4 -96" stroke={side.trim} strokeWidth={2} />
      {/* spear arm forward */}
      <path d="M10 -118 Q30 -112 40 -100" fill="none" stroke={M.skin} strokeWidth={9} strokeLinecap="round" />
      <path d="M-40 -84 L96 -128" stroke={M.ink} strokeWidth={3} />
      <path d="M96 -128 l16 -6 l-12 12 Z" fill={M.white} {...ln} strokeWidth={1.4} />
      {/* head in profile */}
      <path d="M-6 -126 Q-10 -150 4 -152 Q18 -152 18 -138 L22 -134 L18 -132 Q16 -124 6 -124 Z" fill={M.skin} {...ln} />
      <path d="M8 -142 q4 -2 7 0" stroke={M.ink} strokeWidth={1.6} fill="none" />
      {side.hat === "siam" ? (
        <path d="M-8 -146 Q4 -162 18 -146 L8 -186 Z" fill={M.gold} {...ln} />
      ) : (
        <path d="M-10 -142 Q-12 -160 6 -160 Q22 -160 20 -146 Q6 -150 -10 -142 Z M-10 -150 q-14 -4 -16 8 q8 -4 14 -2 Z" fill={M.white} {...ln} />
      )}
      {/* shield on the back arm */}
      <ellipse cx={-16} cy={-112} rx={16} ry={20} fill={side.trim === M.gold ? M.gold : M.white} {...ln} />
      <circle cx={-16} cy={-112} r={6} fill={side.coat} />
    </g>
  );
};

// Swallow-tail banner on a pole; fall = degrees it has tipped.
export const Banner = ({ x, y, s = 1, color, fall = 0, t = 0 }: { x: number; y: number; s?: number; color: string; fall?: number; t?: number }) => {
  const w = Math.sin(t / 9 + x) * 6;
  return (
    <g transform={`translate(${x},${y}) scale(${s}) rotate(${fall})`}>
      <path d="M0 0 L0 -260" stroke={M.ink} strokeWidth={4} />
      <path d={`M0 -250 L${70 + w} ${-236 + w * 0.3} L${50 + w} -214 L${74 + w} ${-192 - w * 0.3} L0 -176 Z`} fill={color} {...ln} />
      <path d="M0 -240 L40 -226" stroke={M.goldLight} strokeWidth={2} />
      <path d="M-6 -262 L0 -282 L6 -262 Z" fill={M.gold} {...ln} />
    </g>
  );
};

// War elephant in mural convention, with the king on the neck holding the ngao and a rear rider with a fan.
// walk: leg cycle on; trumpet: trunk raised 0→1; swing: the ngao strike 0→1; rider = king still seated.
export const Elephant = ({ x, y, s = 1, flip = false, hide, cloth, walk = 0, trumpet = 0, swing = 0, t = 0, rider = true }: { x: number; y: number; s?: number; flip?: boolean; hide: string; cloth: string; walk?: number; trumpet?: number; swing?: number; t?: number; rider?: boolean }) => {
  const lg = (i: number) => walk * Math.sin(t / 5 + i * Math.PI) * 10;
  const line = hide === M.hideB ? M.ink : "#191b26";
  const wr = { stroke: hide === M.hideB ? "#9a8a6a" : "#7a8096", strokeWidth: 1.6, fill: "none" };
  const ngao = -40 + swing * 95; // degrees: raised back → swept forward
  const trunk = trumpet > 0.5
    ? "M180 -250 Q236 -270 246 -330 Q252 -370 226 -384 Q240 -350 222 -318 Q204 -290 176 -282 Z"
    : "M180 -250 Q218 -220 214 -150 Q212 -100 232 -82 Q216 -70 196 -96 Q186 -150 168 -200 Z";
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      {/* far legs */}
      {[-110, 90].map((lx, i) => <path key={i} d={`M${lx - 26 + lg(i)} -150 Q${lx - 34 + lg(i)} -70 ${lx - 24 + lg(i)} -6 L${lx + 22 + lg(i)} -6 Q${lx + 32 + lg(i)} -70 ${lx + 26 + lg(i)} -150 Z`} fill={hide} stroke={line} strokeWidth={2.4} opacity={0.85} />)}
      {/* body */}
      <path d="M-170 -170 Q-190 -300 -60 -330 Q80 -352 160 -300 Q200 -270 196 -200 Q190 -150 160 -140 L-150 -136 Q-178 -140 -170 -170 Z" fill={hide} stroke={line} strokeWidth={3} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-120 + i * 70} -150 q10 -30 0 -60`} {...wr} />)}
      <path d="M-170 -200 Q-196 -190 -200 -150" stroke={line} strokeWidth={4} fill="none" />
      {/* near legs with gold anklets */}
      {[-140, 110].map((lx, i) => (
        <g key={i}>
          <path d={`M${lx - 28 - lg(i)} -160 Q${lx - 36 - lg(i)} -80 ${lx - 26 - lg(i)} 0 L${lx + 26 - lg(i)} 0 Q${lx + 36 - lg(i)} -80 ${lx + 28 - lg(i)} -160 Z`} fill={hide} stroke={line} strokeWidth={3} />
          <rect x={lx - 28 - lg(i)} y={-40} width={56} height={12} fill={M.gold} stroke={line} strokeWidth={1.6} />
          <path d={`M${lx - 24 - lg(i)} -2 q8 -10 16 0 q8 -10 16 0 q8 -10 16 0`} stroke={line} strokeWidth={1.6} fill="none" />
        </g>
      ))}
      {/* head with the twin dome, ear, eye, tusk, trunk */}
      <path d="M130 -310 Q150 -366 196 -350 Q212 -372 236 -344 Q252 -300 230 -250 Q206 -220 180 -230 Z" fill={hide} stroke={line} strokeWidth={3} />
      <path d={trunk} fill={hide} stroke={line} strokeWidth={3} />
      <path d="M120 -310 Q86 -290 96 -220 Q120 -196 160 -214 Q172 -260 150 -300 Z" fill={hide} stroke={line} strokeWidth={2.6} />
      <path d="M110 -290 q-6 30 8 60 M126 -296 q-4 30 6 64" {...wr} />
      <path d="M200 -232 Q250 -230 282 -262 Q262 -222 206 -218 Z" fill={M.white} stroke={line} strokeWidth={2} />
      <path d="M200 -300 q8 -5 15 0 q-7 4 -15 0 Z" fill={line} />
      {/* head ornament: gold net */}
      <path d="M150 -346 Q190 -372 226 -350 L220 -334 Q188 -350 156 -330 Z" fill={M.gold} stroke={line} strokeWidth={1.6} />
      {/* caparison */}
      <path d="M-110 -330 L110 -334 L130 -170 L-130 -170 Z" fill={cloth} stroke={M.ink} strokeWidth={2.6} />
      <path d="M-124 -196 L126 -196 L130 -170 L-130 -170 Z" fill={M.gold} stroke={M.ink} strokeWidth={2} />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-120 + i * 21} -194 l10 22 l10 -22`} fill="none" stroke={M.deepRed} strokeWidth={2} />)}
      {Array.from({ length: 6 }, (_, i) => <path key={`t${i}`} d={`M${-120 + i * 48} -170 l0 34 l-6 10 l12 0 l-6 -10`} fill={M.gold} stroke={M.ink} strokeWidth={1.4} />)}
      {[-60, 0, 60].map((cx) => <path key={cx} d={`M${cx} -300 l22 40 l-22 40 l-22 -40 Z`} fill="none" stroke={M.goldLight} strokeWidth={2.4} />)}
      {/* rear rider with a tall fan (bannerette) */}
      <g transform="translate(-70,-330)">
        <path d="M-14 0 Q-16 -40 0 -56 Q16 -40 14 0 Z" fill={cloth === M.white ? M.indigo : M.red} {...ln} />
        <circle cx={2} cy={-66} r={13} fill={M.skin} {...ln} />
        <path d="M-6 -76 L4 -110 L12 -76 Z" fill={M.gold} {...ln} />
        <path d="M-20 10 L-30 -170" stroke={M.ink} strokeWidth={4} />
        <path d="M-30 -170 Q-70 -200 -30 -236 Q10 -200 -30 -170 Z" fill={M.gold} {...ln} />
      </g>
      {/* the king on the neck */}
      {rider && (
        <g transform="translate(100,-330) scale(1.3)">
          <path d="M-22 0 L-8 40 L30 30 L22 0 Z" fill={M.skin} {...ln} />
          <path d="M-20 4 Q-26 -56 2 -72 Q30 -56 22 4 Z" fill={M.gold} {...ln} />
          <path d="M-14 -30 L18 -30 M-10 -48 L14 -48" stroke={M.red} strokeWidth={4} />
          <path d="M-4 -74 Q-10 -100 6 -104 Q22 -102 22 -86 L28 -82 L22 -78 Q18 -70 8 -70 Z" fill={M.skin} {...ln} />
          <path d="M12 -90 q4 -2 7 0" stroke={M.ink} strokeWidth={1.6} fill="none" />
          {/* chada crown: stacked tiers to a spire */}
          <path d="M-8 -96 Q6 -108 22 -96 L18 -118 L14 -132 L10 -168 L6 -132 L0 -118 Z" fill={M.gold} {...ln} />
          <path d="M-2 -110 L18 -110 M2 -126 L14 -126" stroke={M.red} strokeWidth={2} />
          {/* the ngao, swung about the shoulder */}
          <g transform={`translate(10,-56) rotate(${ngao})`}>
            <path d="M0 0 Q40 -10 60 -6" fill="none" stroke={M.skin} strokeWidth={10} strokeLinecap="round" />
            <path d="M-60 30 L180 -40" stroke={M.ink} strokeWidth={5} />
            <path d="M176 -38 Q216 -74 250 -62 Q226 -52 188 -26 Z" fill={M.white} {...ln} />
            <path d="M150 -30 l12 -6 l4 10 Z" fill={M.gold} />
          </g>
        </g>
      )}
    </g>
  );
};

// Arrow volley: fine black lines on a flat arc (murals draw them as lines in flight).
export const Arrows = ({ frame, at, x0, x1, y, n, seed = 0 }: { frame: number; at: number; x0: number; x1: number; y: number; n: number; seed?: number }) => {
  const k = (frame - at) / 34;
  if (k < 0 || k > 1.05) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const dx = (((i * 53 + seed * 17) % 100) / 100) * 160 - 80;
        const kk = Math.min(1, Math.max(0, k - (i % 4) * 0.03));
        const px = x0 + (x1 - x0) * kk + dx, py = y - Math.sin(kk * Math.PI) * 300 + (i % 5) * 18;
        const a = Math.atan2(-Math.cos(kk * Math.PI) * 300 * Math.PI, x1 - x0);
        return (
          <g key={i} transform={`translate(${px},${py}) rotate(${(a * 180) / Math.PI})`}>
            <path d="M-36 0 L30 0" stroke={M.ink} strokeWidth={2.4} />
            <path d="M30 0 l-10 -5 l0 10 Z" fill={M.ink} />
            <path d="M-36 0 l-8 -6 M-36 0 l-8 6" stroke={M.red} strokeWidth={2} />
          </g>
        );
      })}
    </g>
  );
};

// Gold flame-tongues bursting from a blow (kanok flame motif instead of sparks).
export const Flare = ({ x, y, k, s = 1 }: { x: number; y: number; k: number; s?: number }) => {
  if (k <= 0 || k >= 1) return null;
  const r = (40 + k * 120) * s;
  return (
    <g transform={`translate(${x},${y})`} opacity={1 - k}>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * 360;
        return <path key={i} d={`M0 ${-r * 0.3} Q${r * 0.14} ${-r * 0.7} 0 ${-r} Q${-r * 0.05} ${-r * 0.7} ${-r * 0.1} ${-r * 0.45} Z`} fill={i % 2 ? M.goldLight : M.gold} stroke={M.ink} strokeWidth={1.4} transform={`rotate(${a})`} />;
      })}
      <circle r={r * 0.22} fill={M.goldLight} stroke={M.ink} strokeWidth={1.6} />
    </g>
  );
};

// Dust as stylised curling cloud scrolls (painted puffs) under the charge.
export const Dust = ({ x, y, k }: { x: number; y: number; k: number }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x},${y}) scale(${0.5 + k * 0.6})`} opacity={Math.min(1, k * 2) * 0.85}>
      <path d="M-60 0 Q-70 -30 -40 -36 Q-30 -60 0 -50 Q30 -64 44 -36 Q70 -30 60 0 Z" fill={M.plasterLight} stroke={M.ink} strokeWidth={1.6} />
      <path d="M-30 -20 q8 -12 18 -4 q-6 8 -14 4 M14 -26 q8 -12 18 -4 q-6 8 -14 4" fill="none" stroke={M.ink} strokeWidth={1.4} />
    </g>
  );
};

// Grass tufts scattered over the battle register (fixed pseudo-random positions).
const TUFTS: [number, number][] = Array.from({ length: 160 }, (_, i) => [WX0 + ((i * 397) % (WX1 - WX0)), 700 + ((i * 211) % 760)]);
