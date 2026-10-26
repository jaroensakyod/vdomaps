import { loadFont } from "@remotion/google-fonts/Charmonman";
import { geoEquirectangular, geoPath, type GeoProjection } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import type { ReactNode } from "react";
import { interpolate, random } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land110 from "world-atlas/land-110m.json";

// M34 ink letter: the story is a letter in fountain pen on tinted, ruled writing paper lying on a dark desk. The
// map is sketched in the letter by the same pen. Every line of text writes itself left to right with the nib
// riding the writing head; ink feathers slightly into the paper. An envelope waits at the foot of the frame:
// stamp, postal cancel and a red wax seal arrive at the end.

export const font = loadFont("normal", { weights: ["400", "700"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const C = {
  desk: "#21150f",
  deskHi: "#3b261a",
  paper: "#a9b5df", // tinted blue writing paper
  paperHi: "#b6c1e8",
  rule: "#6f80bf", // printed ruling
  margin: "#b0475a", // the red margin line
  ink: "#16204d", // blue-black fountain-pen ink
  inkWet: "#22307a",
  envelope: "#e2cfa3",
  envelopeDark: "#bfa774",
  wax: "#9c1c1f",
  waxHi: "#d4504a",
  stampInk: "#3b3a66",
  gold: "#c9a047",
};

export const W = 1080;
export const H = 1920;

// sheet placement (screen): local coords 0..SW × 0..SH, rotated slightly on the desk
export const SX = 64;
export const SY = 60;
export const SW = 952;
export const SH = 1430;
export const TILT = -1.4;
export const RULE0 = 352; // first ruled line (local y)
export const RULE = 78;

export const Defs = () => (
  <defs>
    <filter id="m34-wood" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves={3} seed={5} result="n" />
      <feColorMatrix in="n" values="0 0 0 0 0.36  0 0 0 0 0.22  0 0 0 0 0.13  0 0 0 0.85 -0.25" />
    </filter>
    <filter id="m34-fibre" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.7 0.05" numOctaves={2} seed={9} />
      <feColorMatrix values="0 0 0 0 0.92  0 0 0 0 0.95  0 0 0 0 1  0 0 0 0.18 0" />
    </filter>
    <filter id="m34-mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves={3} seed={2} />
      <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.38  0 0 0 0 0.6  0 0 0 0.5 -0.18" />
    </filter>
    {/* fountain-pen ink: a wobble, then a faint feathered halo where it soaks into the paper */}
    <filter id="m34-ink" x="-4%" y="-20%" width="108%" height="140%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves={2} seed={3} result="w" />
      <feDisplacementMap in="SourceGraphic" in2="w" scale={2.2} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feGaussianBlur in="SourceAlpha" stdDeviation={1.8} result="halo" />
      <feFlood floodColor="#16204d" floodOpacity={0.3} result="tint" />
      <feComposite in="tint" in2="halo" operator="in" result="soft" />
      <feMerge>
        <feMergeNode in="soft" />
        <feMergeNode in="d" />
      </feMerge>
    </filter>
    <radialGradient id="m34-lamp" cx="0.42" cy="0.32" r="0.85">
      <stop offset="0" stopColor="#fff3d6" stopOpacity={0.22} />
      <stop offset="0.6" stopColor="#fff3d6" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.35} />
    </radialGradient>
    <linearGradient id="m34-barrel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#4a4f5e" />
      <stop offset="0.35" stopColor="#14161d" />
      <stop offset="1" stopColor="#050608" />
    </linearGradient>
    <linearGradient id="m34-nib" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f6dc94" />
      <stop offset="0.5" stopColor="#c9a047" />
      <stop offset="1" stopColor="#7c5c1c" />
    </linearGradient>
    <radialGradient id="m34-wax" cx="0.38" cy="0.32" r="0.8">
      <stop offset="0" stopColor="#d4504a" />
      <stop offset="0.55" stopColor="#9c1c1f" />
      <stop offset="1" stopColor="#5a0c10" />
    </radialGradient>
  </defs>
);

export const Desk = () => (
  <>
    <rect width={W} height={H} fill={C.desk} />
    <rect width={W} height={H} filter="url(#m34-wood)" />
  </>
);

// The sheet: tinted paper, fibre, printed ruling and red margin, a deckled shadow. Children are in local coords.
export const Sheet = ({ children }: { children?: ReactNode }) => (
  <g transform={`translate(${SX} ${SY}) rotate(${TILT} ${SW / 2} ${SH / 2})`}>
    <rect x={10} y={16} width={SW} height={SH} fill="#000" opacity={0.5} />
    <rect width={SW} height={SH} fill={C.paper} />
    <rect width={SW} height={SH} filter="url(#m34-mottle)" />
    <rect width={SW} height={SH} filter="url(#m34-fibre)" />
    {Array.from({ length: 14 }, (_, i) => (
      <path key={i} d={`M0 ${RULE0 + i * RULE} L${SW} ${RULE0 + i * RULE}`} stroke={C.rule} strokeWidth={1.6} opacity={0.75} />
    ))}
    <path d={`M96 0 L96 ${SH}`} stroke={C.margin} strokeWidth={2} opacity={0.8} />
    <path d={`M102 0 L102 ${SH}`} stroke={C.margin} strokeWidth={1} opacity={0.5} />
    {/* fold lines: the letter was folded in three to fit the envelope */}
    <path d={`M0 ${SH / 3} L${SW} ${SH / 3}`} stroke="#fff" strokeWidth={2} opacity={0.22} />
    <path d={`M0 ${SH / 3 + 3} L${SW} ${SH / 3 + 3}`} stroke="#3a4580" strokeWidth={1.5} opacity={0.2} />
    <path d={`M0 ${(SH * 2) / 3} L${SW} ${(SH * 2) / 3}`} stroke="#fff" strokeWidth={2} opacity={0.22} />
    <path d={`M0 ${(SH * 2) / 3 + 3} L${SW} ${(SH * 2) / 3 + 3}`} stroke="#3a4580" strokeWidth={1.5} opacity={0.2} />
    {children}
  </g>
);

// Lamp light over the whole desk (top-left warm pool, dark corners).
export const Lamp = () => <rect width={W} height={H} fill="url(#m34-lamp)" />;

// Sheet-local → screen point (to place the pen in screen space).
export const toScreen = (x: number, y: number): [number, number] => {
  const a = (TILT * Math.PI) / 180;
  const cx = SW / 2, cy = SH / 2;
  const dx = x - cx, dy = y - cy;
  return [SX + cx + dx * Math.cos(a) - dy * Math.sin(a), SY + cy + dx * Math.sin(a) + dy * Math.cos(a)];
};

// One handwritten line that writes itself. `k` 0..1; returns nothing until it starts. The width is estimated
// from the text length (`em` = average advance per character, in font sizes).
export const estWidth = (text: string, size: number, em = 0.42) => text.length * size * em;
export const Hand = ({ id, x, y, text, size = 46, k, weight = 400, anchor = "start", color = C.ink }: { id: string; x: number; y: number; text: string; size?: number; k: number; weight?: number; anchor?: "start" | "end" | "middle"; color?: string }) => {
  if (k <= 0) return null;
  const w = estWidth(text, size) + size;
  const x0 = anchor === "end" ? x - w : anchor === "middle" ? x - w / 2 : x;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={x0 - size * 0.4} y={y - size * 1.5} width={(w + size * 0.6) * k} height={size * 2.3} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} filter="url(#m34-ink)">
        <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontSize={size} fontWeight={weight} fill={color}>
          {text}
        </text>
      </g>
    </g>
  );
};
// where the nib is for a Hand line at `k`
export const handHead = (x: number, y: number, text: string, size: number, k: number, anchor: "start" | "end" | "middle" = "start"): [number, number] => {
  const w = estWidth(text, size) + size * 0.2;
  const x0 = anchor === "end" ? x - w : anchor === "middle" ? x - w / 2 : x;
  return [x0 + w * k, y - size * 0.25 + Math.sin(k * 60) * size * 0.18];
};

// A flourish underline, drawn on.
export const Flourish = ({ x, y, w, k }: { x: number; y: number; w: number; k: number }) =>
  k <= 0 ? null : (
    <path
      d={`M${x} ${y} C${x + w * 0.25} ${y - 14} ${x + w * 0.5} ${y + 12} ${x + w * 0.78} ${y - 2} C${x + w * 0.9} ${y - 8} ${x + w} ${y - 20} ${x + w * 0.94} ${y - 30} C${x + w * 0.88} ${y - 38} ${x + w * 0.82} ${y - 18} ${x + w * 1.02} ${y + 4}`}
      fill="none"
      stroke={C.ink}
      strokeWidth={4}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={`${k} 2`}
      filter="url(#m34-ink)"
    />
  );

// ---------------------------------------------------------------- the sketched map
const LAND = feature(land110 as unknown as Topology, (land110 as unknown as Topology).objects.land as GeometryCollection) as unknown as FeatureCollection<Geometry>;
export const sketchProj = (box: [number, number, number, number], [w, s, e, n]: [number, number, number, number]): GeoProjection =>
  geoEquirectangular()
    .fitExtent([[box[0], box[1]], [box[0] + box[2], box[1] + box[3]]], { type: "MultiPoint", coordinates: [[w, s], [e, n], [w, n], [e, s]] } as never)
    .clipExtent([[box[0] - 4, box[1] - 4], [box[0] + box[2] + 4, box[1] + box[3] + 4]]);

// Coast drawn twice (a quick second pass a hair off, the way a pen sketch is), a wash of diluted ink on the land.
export const SketchMap = ({ id, proj, box, k }: { id: string; proj: GeoProjection; box: [number, number, number, number]; k: number }) => {
  if (k <= 0) return null;
  const path = geoPath(proj);
  const d = path(LAND) ?? "";
  const [bx, by, bw, bh] = box;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-box`}>
          <path d={`M${bx + 6} ${by + 4} L${bx + bw - 10} ${by} L${bx + bw} ${by + bh - 6} L${bx + 4} ${by + bh} Z`} />
        </clipPath>
        <clipPath id={`${id}-land`}>
          <path d={d} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-box)`} filter="url(#m34-ink)">
        {/* light wash of diluted ink on the land */}
        <path d={d} fill={C.ink} opacity={interpolate(k, [0.6, 1], [0, 0.17], clamp)} />
        {/* a hand-drawn north arrow in the corner */}
        <g opacity={interpolate(k, [0.7, 1], [0, 1], clamp)} stroke={C.ink} strokeWidth={2.4} fill="none" strokeLinecap="round">
          <path d={`M${bx + 46} ${by + bh - 30} L${bx + 46} ${by + bh - 100} M${bx + 36} ${by + bh - 84} L${bx + 46} ${by + bh - 102} L${bx + 56} ${by + bh - 84}`} />
          <text x={bx + 46} y={by + bh - 110} textAnchor="middle" fontFamily={font} fontSize={26} fontWeight={700} fill={C.ink} stroke="none">N</text>
        </g>
        <path d={d} fill="none" stroke={C.ink} strokeWidth={2.6} strokeLinejoin="round" pathLength={1} strokeDasharray={`${k} 2`} />
        <path d={d} fill="none" stroke={C.ink} strokeWidth={1.1} opacity={0.6} transform="translate(2.5 1.8)" pathLength={1} strokeDasharray={`${Math.max(0, k - 0.15)} 2`} />
      </g>
      {/* hand-ruled frame round the sketch */}
      <path d={`M${bx + 6} ${by + 4} L${bx + bw - 10} ${by} L${bx + bw} ${by + bh - 6} L${bx + 4} ${by + bh} Z`} fill="none" stroke={C.ink} strokeWidth={2.4} pathLength={1} strokeDasharray={`${Math.min(1, k * 1.6)} 2`} filter="url(#m34-ink)" />
    </g>
  );
};

// The route as pen dots and dashes, drawn on to `k`; a little boat doodle at the head.
export const InkRoute = ({ id, pts, k }: { id: string; pts: [number, number][]; k: number }) => {
  if (k <= 0) return null;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  return (
    <g filter="url(#m34-ink)">
      <defs>
        <mask id={id}>
          <path d={d} stroke="#fff" strokeWidth={20} fill="none" pathLength={1} strokeDasharray={`${k} 2`} />
        </mask>
      </defs>
      <path d={d} mask={`url(#${id})`} fill="none" stroke={C.inkWet} strokeWidth={4.2} strokeDasharray="14 9" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};
export const Boat = ({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} fill="none" stroke={C.ink} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" filter="url(#m34-ink)">
    <path d="M-22 0 L22 0 L15 9 L-16 9 Z" fill={C.paperHi} />
    <path d="M-6 0 L-6 -20 M6 0 L6 -16" />
    <path d="M-12 -8 L-2 -8 M2 -6 L10 -6" />
    <path d="M-4 -22 q 8 -6 14 0" />
  </g>
);
// A place: a pen cross-in-circle and the handwritten name.
export const Place = ({ x, y, name, k, dx = 14, dy = -14, anchor = "start", size = 32 }: { x: number; y: number; name: string; k: number; dx?: number; dy?: number; anchor?: "start" | "end" | "middle"; size?: number }) =>
  k <= 0 ? null : (
    <g opacity={interpolate(k, [0, 0.3], [0, 1], clamp)} filter="url(#m34-ink)">
      <circle cx={x} cy={y} r={8} fill="none" stroke={C.ink} strokeWidth={2.6} />
      <circle cx={x} cy={y} r={2.8} fill={C.ink} />
      <text x={x + dx} y={y + dy} textAnchor={anchor} fontFamily={font} fontSize={size} fontWeight={700} fill={C.ink}>{name}</text>
    </g>
  );

// Ink blot with a few satellite drops (a slip of the pen).
export const Blot = ({ x, y, r = 16, k = 1 }: { x: number; y: number; r?: number; k?: number }) => {
  const pts = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    const rr = r * (0.75 + random(`b${i}`) * 0.5);
    return [x + Math.cos(a) * rr, y + Math.sin(a) * rr];
  });
  return (
    <g opacity={k} filter="url(#m34-ink)">
      <path d={pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ") + "Z"} fill={C.ink} opacity={0.85} />
      <circle cx={x + r * 1.9} cy={y - r * 0.6} r={r * 0.22} fill={C.ink} />
      <circle cx={x - r * 1.5} cy={y + r * 1.1} r={r * 0.15} fill={C.ink} />
    </g>
  );
};

// ---------------------------------------------------------------- the pen
// A fountain pen whose nib tip is at (x, y), lying at `angle` degrees (barrel up and to the right).
export const Pen = ({ x, y, angle = -52, lift = 0 }: { x: number; y: number; angle?: number; lift?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    {/* shadow on the paper, further away when lifted */}
    <g transform={`translate(${16 + lift * 26} ${20 + lift * 30})`} opacity={0.28 - lift * 0.1}>
      <path d="M0 0 L40 -10 L40 10 Z M40 -14 L560 -22 L560 22 L40 14 Z" fill="#000" />
    </g>
    <path d="M0 0 L46 -11 L50 0 L46 11 Z" fill="url(#m34-nib)" stroke="#5a4210" strokeWidth={1.2} />
    <path d="M4 0 L40 0" stroke="#3a2a08" strokeWidth={1.4} />
    <circle cx={34} cy={0} r={2.4} fill="#3a2a08" />
    <path d="M46 -13 L96 -16 L96 16 L46 13 Z" fill="#0d0e12" />
    <path d="M96 -18 L106 -18 L106 18 L96 18 Z" fill={C.gold} />
    <path d="M106 -18 L520 -21 Q548 -20 552 0 Q548 20 520 21 L106 18 Z" fill="url(#m34-barrel)" />
    <path d="M300 -20 L316 -20 L316 20 L300 20 Z" fill={C.gold} />
    <path d="M330 -24 L470 -24 L470 -16 L340 -16 Z" fill={C.gold} />
    <path d="M120 -12 L520 -14" stroke="#9aa0b4" strokeWidth={2.4} opacity={0.5} />
  </g>
);

// ---------------------------------------------------------------- the envelope
export const Envelope = ({ x, y, rot = 4, k, stampK, cancelK, sealK, to, from }: { x: number; y: number; rot?: number; k: number; stampK: number; cancelK: number; sealK: number; to: string[]; from: string }) => {
  if (k <= 0) return null;
  const ew = 760, eh = 430;
  const slide = interpolate(k, [0, 1], [260, 0], clamp);
  const sealS = interpolate(sealK, [0, 0.4, 0.7, 1], [1.6, 0.94, 1.04, 1], clamp);
  return (
    <g transform={`translate(${x} ${y + slide}) rotate(${rot})`} opacity={interpolate(k, [0, 0.4], [0, 1], clamp)}>
      <rect x={-ew / 2 + 14} y={-eh / 2 + 22} width={ew} height={eh} fill="#000" opacity={0.45} />
      <rect x={-ew / 2} y={-eh / 2} width={ew} height={eh} fill={C.envelope} />
      <rect x={-ew / 2} y={-eh / 2} width={ew} height={eh} filter="url(#m34-fibre)" opacity={0.6} />
      <path d={`M${-ew / 2} ${-eh / 2} L0 ${eh * 0.06} L${ew / 2} ${-eh / 2}`} fill="none" stroke={C.envelopeDark} strokeWidth={3} />
      <path d={`M${-ew / 2} ${eh / 2} L${-ew * 0.12} ${-eh * 0.02} M${ew / 2} ${eh / 2} L${ew * 0.12} ${-eh * 0.02}`} stroke={C.envelopeDark} strokeWidth={2} opacity={0.6} />
      {/* address */}
      <g filter="url(#m34-ink)">
        {to.map((t, i) => (
          <text key={i} x={-ew * 0.44} y={eh * 0.27 + i * 50} fontFamily={font} fontSize={40} fontWeight={i === 0 ? 700 : 400} fill={C.ink}>{t}</text>
        ))}
        <text x={-ew / 2 + 30} y={-eh / 2 + 52} fontFamily={font} fontSize={24} fill={C.ink} opacity={0.8}>{from}</text>
      </g>
      {/* stamp (original design: a sailing ship over waves) */}
      <g transform={`translate(${ew / 2 - 150} ${-eh / 2 + 28}) rotate(${interpolate(stampK, [0, 1], [-12, 2], clamp)})`} opacity={stampK}>
        <rect x={-6} y={-6} width={128} height={152} fill="#f4ecd8" />
        {Array.from({ length: 12 }, (_, i) => <circle key={`t${i}`} cx={-6 + i * 11.6} cy={-6} r={4} fill={C.envelope} />)}
        {Array.from({ length: 12 }, (_, i) => <circle key={`b${i}`} cx={-6 + i * 11.6} cy={146} r={4} fill={C.envelope} />)}
        {Array.from({ length: 14 }, (_, i) => <circle key={`l${i}`} cx={-6} cy={-6 + i * 11.6} r={4} fill={C.envelope} />)}
        {Array.from({ length: 14 }, (_, i) => <circle key={`r${i}`} cx={122} cy={-6 + i * 11.6} r={4} fill={C.envelope} />)}
        <rect x={6} y={6} width={104} height={128} fill="#7a2a3a" />
        <rect x={12} y={12} width={92} height={96} fill="#e9d9b8" />
        <g fill="none" stroke="#7a2a3a" strokeWidth={2.2} strokeLinecap="round">
          <path d="M26 86 L90 86 L82 96 L34 96 Z" fill="#7a2a3a" />
          <path d="M58 86 L58 30 M58 34 L84 80 L58 80 M56 40 L34 80 L56 80" />
          <path d="M16 102 q 10 -6 20 0 q 10 6 20 0 q 10 -6 20 0 q 10 6 22 0" />
        </g>
        <text x={58} y={128} textAnchor="middle" fontFamily={font} fontSize={20} fontWeight={700} fill="#f4ecd8">ไปรษณีย์</text>
      </g>
      {/* postal cancel: rings with the town, wavy lines across the stamp */}
      <g transform={`translate(${ew / 2 - 236} ${-eh / 2 + 104})`} opacity={cancelK * 0.85} fill="none" stroke={C.stampInk} strokeWidth={3.2}>
        <circle r={62} />
        <circle r={46} strokeWidth={2} />
        <text x={0} y={-14} textAnchor="middle" fontFamily={font} fontSize={20} fontWeight={700} fill={C.stampInk} stroke="none">กรุงเทพฯ</text>
        <text x={0} y={16} textAnchor="middle" fontFamily={font} fontSize={24} fontWeight={700} fill={C.stampInk} stroke="none">2450</text>
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M70 ${-30 + i * 20} q 18 -10 36 0 q 18 10 36 0 q 18 -10 36 0 q 18 10 36 0`} />)}
      </g>
      {/* wax seal on the flap point */}
      {sealK > 0 ? (
        <g transform={`translate(0 ${eh * 0.06}) scale(${sealS})`} opacity={interpolate(sealK, [0, 0.2], [0, 1], clamp)}>
          <path d="M-58 -8 C-62 -44 -30 -66 4 -62 C40 -64 66 -36 60 0 C66 38 34 64 -2 60 C-40 66 -66 30 -58 -8 Z" fill="url(#m34-wax)" />
          <circle r={38} fill="none" stroke="#5a0c10" strokeWidth={4} opacity={0.6} />
          <circle r={38} fill="none" stroke={C.waxHi} strokeWidth={2} opacity={0.5} transform="translate(-1.5 -1.5)" />
          <text x={0} y={16} textAnchor="middle" fontFamily={font} fontSize={46} fontWeight={700} fill="#5a0c10">ก</text>
          <text x={-1.5} y={14.5} textAnchor="middle" fontFamily={font} fontSize={46} fontWeight={700} fill={C.waxHi} opacity={0.45}>ก</text>
          <path d="M-36 -34 C-24 -46 -8 -50 6 -48" stroke="#f0a090" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
        </g>
      ) : null}
    </g>
  );
};

// Point at `t` along a polyline, with direction.
export const along = (pts: [number, number][], t: number) => {
  const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let d = Math.max(0, Math.min(1, t)) * L.reduce((a, b) => a + b, 0);
  for (let i = 0; i < L.length; i++) {
    if (d <= L[i] || i === L.length - 1) {
      const u = L[i] ? Math.min(1, d / L[i]) : 0;
      return { x: pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, y: pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u, dx: pts[i + 1][0] - pts[i][0] };
    }
    d -= L[i];
  }
  return { x: pts[0][0], y: pts[0][1], dx: 1 };
};
export const smooth = (p: [number, number][], n = 10): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)) as [number, number]);
    }
  }
  out.push(p[p.length - 1]);
  return out;
};
