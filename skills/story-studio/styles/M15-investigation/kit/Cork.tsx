import { loadFont as loadCourier } from "@remotion/google-fonts/CourierPrime";
import { loadFont as loadLooped } from "@remotion/google-fonts/IBMPlexSansThaiLooped";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { useMemo, type CSSProperties, type ReactNode } from "react";
import { interpolate } from "remotion";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries50 from "world-atlas/countries-50m.json";
import land50 from "world-atlas/land-50m.json";
import { region } from "../../../components/Region";

// M15 investigation board: a cork board under a desk lamp. A printed map pinned with brass pins, typed index cards
// and ink-drawn evidence cards, red yarn stretched pin to pin that pulls tight as each clue connects. No photos,
// no sticky notes, no marker: typewriter ink, printed paper, wool and brass.

const courier = loadCourier("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;
const looped = loadLooped("normal", { weights: ["400", "500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
// Latin and digits from Courier Prime (a typewriter face), Thai from IBM Plex Sans Thai Looped (looped, monoline,
// close to Thai typewriter letters).
export const type = `${courier}, ${looped}`;

export const C = {
  cork: "#b9773f",
  card: "#f6f1e3",
  yarn: "#c3262b",
  brass: "#c9a246",
  ink: "#2a2420", // typewriter ribbon black-brown
  blue: "#8fb3cf", // ruled lines on index cards
  sea: "#8cb2d4",
  land: "#efe6cf",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = (t: number) => 1 - Math.pow(1 - t, 3);
export const at = (frame: number, f0: number, f1: number) => interpolate(frame, [f0, f1], [0, 1], { ...clamp, easing: ease });

const topoL = land50 as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topoL, topoL.objects.land) as unknown as FeatureCollection<Geometry>;
const topoC = countries50 as unknown as Topology<{ countries: GeometryCollection }>;
const BORDERS = mesh(topoC, topoC.objects.countries, (a, b) => a !== b);

// ---------- the board and the lamp ----------
export const CorkBoard = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <filter id="m15-cork" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={2} seed={3} result="g" />
        <feColorMatrix in="g" values="0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0 0.05  0 0 0 -2.2 1.25" result="dark" />
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={8} result="h" />
        <feColorMatrix in="h" values="0 0 0 0 0.95  0 0 0 0 0.8  0 0 0 0 0.55  0 0 0 -2.6 1.35" result="light" />
        <feMerge>
          <feMergeNode in="dark" />
          <feMergeNode in="light" />
        </feMerge>
      </filter>
      <filter id="m15-blotch" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={3} seed={14} />
        <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0 0.08  0 0 0 0.5 -0.1" />
      </filter>
    </defs>
    <rect width={1080} height={1920} fill={C.cork} />
    <rect width={1080} height={1920} filter="url(#m15-blotch)" />
    <rect width={1080} height={1920} filter="url(#m15-cork)" opacity={0.55} />
    {/* wooden frame: the board's edge */}
    <path fillRule="evenodd" d="M0 0 H1080 V1920 H0 Z M26 26 V1894 H1054 V26 Z" fill="#5b3a22" />
    <path fillRule="evenodd" d="M26 26 H1054 V1894 H26 Z M34 34 V1886 H1046 V34 Z" fill="#2d1b0f" opacity={0.7} />
  </svg>
);

// Warm desk-lamp pool: light where the lamp points, falling off to dark corners. `on` 0–1 (the lamp warms up).
export const LampLight = ({ cx = 820, cy = 480, on = 1 }: { cx?: number; cy?: number; on?: number }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <defs>
      <radialGradient id="m15-lamp" cx={cx} cy={cy} r={1250} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffd9a0" stopOpacity={0.2 * on} />
        <stop offset="0.38" stopColor="#ffb860" stopOpacity={0.04 * on} />
        <stop offset="0.6" stopColor="#1a0d05" stopOpacity={0.36 + 0.2 * (1 - on)} />
        <stop offset="1" stopColor="#0d0603" stopOpacity={0.8} />
      </radialGradient>
      <radialGradient id="m15-pool" cx={cx} cy={cy - 80} r={560} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffcf8a" stopOpacity={0.5 * on} />
        <stop offset="0.55" stopColor="#ffb35c" stopOpacity={0.12 * on} />
        <stop offset="1" stopColor="#ffb35c" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#m15-lamp)" style={{ mixBlendMode: "multiply" }} />
    <rect width={1080} height={1920} fill="url(#m15-lamp)" opacity={0.6} />
    <rect width={1080} height={1920} fill="url(#m15-pool)" style={{ mixBlendMode: "screen" }} />
  </svg>
);

// ---------- pins and yarn ----------
export const Pin = ({ x, y, k = 1 }: { x: number; y: number; k?: number }) => {
  if (k <= 0) return null;
  const s = 0.6 + 0.4 * k;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <ellipse cx={7} cy={9} rx={14} ry={10} fill="#000" opacity={0.35} style={{ filter: "blur(3px)" }} />
      <circle r={13} fill="url(#m15-brass)" stroke="#6b4e14" strokeWidth={1.4} />
      <circle r={7} fill="none" stroke="#f3dc8e" strokeOpacity={0.5} strokeWidth={1.2} />
      <ellipse cx={-4} cy={-5} rx={4} ry={3} fill="#fff6d0" opacity={0.85} />
    </g>
  );
};
export const PinDefs = () => (
  <defs>
    <radialGradient id="m15-brass" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stopColor="#fbe7a1" />
      <stop offset="0.45" stopColor={C.brass} />
      <stop offset="1" stopColor="#7a5a17" />
    </radialGradient>
  </defs>
);

// Red wool yarn from a to b: drawn on to fraction `k`, sagging under its weight until `tight` pulls it straight.
export const Yarn = ({ a, b, k, tight, sag = 140 }: { a: [number, number]; b: [number, number]; k: number; tight: number; sag?: number }) => {
  if (k <= 0) return null;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2 + sag * (1 - tight) + 6;
  const q = (t: number): [number, number] => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * mx + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * my + t * t * b[1]];
  const n = 40;
  const pts = Array.from({ length: Math.max(2, Math.ceil(n * k)) + 1 }, (_, i) => q(Math.min(k, i / n)));
  const d = `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L")}`;
  // a tight yarn hums: a tiny vibration right after it snaps straight
  return (
    <g>
      <path d={d} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={5} transform="translate(5,8)" style={{ filter: "blur(2.5px)" }} />
      <path d={d} fill="none" stroke={C.yarn} strokeWidth={4.6} strokeLinecap="round" />
      {/* the twist of the wool */}
      <path d={d} fill="none" stroke="#7d1216" strokeWidth={4.6} strokeDasharray="2.2 3.4" strokeOpacity={0.55} />
      <path d={d} fill="none" stroke="#ff8a7a" strokeWidth={1.2} strokeDasharray="1.5 4" strokeOpacity={0.6} transform="translate(-0.8,-1)" />
    </g>
  );
};

// ---------- paper ----------
const paperShadow = "drop-shadow(6px 10px 7px rgba(20,8,0,0.55))";
export const Paper = ({ x, y, w, h, rot = 0, k = 1, children, bg = C.card, style }: { x: number; y: number; w: number; h: number; rot?: number; k?: number; children?: ReactNode; bg?: string; style?: CSSProperties }) => {
  if (k <= 0) return null;
  // pinned on: drops a little and settles
  const drop = (1 - k) * -40;
  return (
    <div style={{ position: "absolute", left: x, top: y + drop, width: w, height: h, transform: `rotate(${rot + (1 - k) * 4}deg)`, opacity: Math.min(1, k * 1.6), filter: paperShadow, ...style }}>
      <div style={{ position: "absolute", inset: 0, background: bg, overflow: "hidden" }}>
        <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
          <filter id={`m15-pap-${x}-${y}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={x + y} />
            <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.28  0 0 0 0.12 0" />
          </filter>
          <rect width={w} height={h} filter={`url(#m15-pap-${x}-${y})`} />
        </svg>
        {children}
      </div>
    </div>
  );
};

// Typed text: typewriter ink with a slightly uneven ribbon. `chars` types it out letter by letter.
export const Typed = ({ text, size = 34, color = C.ink, weight = 500, chars, style }: { text: string; size?: number; color?: string; weight?: number; chars?: number; style?: CSSProperties }) => {
  const shown = chars === undefined ? text : Array.from(text).slice(0, Math.max(0, Math.floor(chars))).join("");
  return (
    <div style={{ fontFamily: type, fontSize: size, fontWeight: weight, color, lineHeight: 1.35, textShadow: `0 0 0.8px ${color}, 0.6px 0.3px 0 rgba(42,36,32,0.25)`, whiteSpace: "pre-wrap", ...style }}>
      {shown}
    </div>
  );
};

// A 5×3 index card: red head rule, blue ruled lines, typed label and value. Colour-coded stock: white for facts,
// canary for theories, salmon for the case status.
export const IndexCard = ({ x, y, w = 330, h = 200, rot = 0, k = 1, label, value, chars, red = false, bg }: { x: number; y: number; w?: number; h?: number; rot?: number; k?: number; label: string; value: string; chars?: number; red?: boolean; bg?: string }) => (
  <Paper x={x} y={y} w={w} h={h} rot={rot} k={k} bg={bg}>
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
      <line x1={0} x2={w} y1={52} y2={52} stroke="#d0605a" strokeWidth={1.6} />
      {Array.from({ length: Math.floor((h - 60) / 34) }, (_, i) => <line key={i} x1={0} x2={w} y1={86 + i * 34} y2={86 + i * 34} stroke={C.blue} strokeWidth={1} />)}
    </svg>
    <div style={{ position: "absolute", left: 20, top: 12, right: 16 }}>
      <Typed text={label} size={24} color="#6a5a4c" />
    </div>
    <div style={{ position: "absolute", left: 20, top: 56, right: 14 }}>
      <Typed text={value} size={32} weight={600} chars={chars} color={red ? "#9e1c1f" : C.ink} style={{ lineHeight: "34px" }} />
    </div>
  </Paper>
);

// ---------- the printed map ----------
export const useSheetMap = (w: number, h: number, extent: [number, number, number, number]) =>
  useMemo(() => {
    const [a, s, e, n] = extent;
    const projection = geoMercator().fitExtent([[0, 0], [w, h]], region([[a, s], [a, n], [e, n], [e, s]]));
    return { projection, path: geoPath(projection) };
  }, [w, h, extent.join()]);

// A folded printed map: pale sea with offset-printed water lines, cream land, brown coast, dashed borders, two
// fold creases. Children are drawn in map pixel space (labels, marks).
export const PrintedMap = ({ w, h, path, children }: { w: number; h: number; path: ReturnType<typeof geoPath>; children?: ReactNode }) => {
  const land = path(LAND) ?? "";
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="m15-water" width={9} height={9} patternUnits="userSpaceOnUse">
          <path d="M0 4.5 Q2.25 2.5 4.5 4.5 T9 4.5" fill="none" stroke="#6a92b6" strokeWidth={0.9} />
        </pattern>
        <linearGradient id="m15-fold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity={0} />
          <stop offset="0.48" stopColor="#000" stopOpacity={0.1} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0.3} />
          <stop offset="0.52" stopColor="#000" stopOpacity={0.06} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="m15-foldh" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0} />
          <stop offset="0.48" stopColor="#000" stopOpacity={0.08} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0.28} />
          <stop offset="0.52" stopColor="#000" stopOpacity={0.05} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={C.sea} />
      <rect width={w} height={h} fill="url(#m15-water)" opacity={0.7} />
      <path d={land} fill={C.land} />
      <path d={land} fill="none" stroke="#6e4a2a" strokeWidth={1.6} />
      <path d={path(BORDERS) ?? ""} fill="none" stroke="#8a4b5a" strokeWidth={1.4} strokeDasharray="7 3 2 3" />
      {children}
      {/* fold creases: one vertical, one horizontal */}
      <rect x={w / 2 - 40} y={0} width={80} height={h} fill="url(#m15-fold)" />
      <rect x={0} y={h * 0.46 - 40} width={w} height={80} fill="url(#m15-foldh)" />
      <rect width={w} height={h} fill="none" stroke="#c7bba0" strokeWidth={10} />
    </svg>
  );
};

// ---------- ink-drawn evidence (no photos) ----------
export const Bungalow = ({ w, h }: { w: number; h: number }) => (
  <svg width={w} height={h} viewBox="0 0 300 200" style={{ position: "absolute", inset: 0 }}>
    <g fill="none" stroke={C.ink} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round">
      <path d="M20 170 H280" />
      <path d="M60 170 V95 H240 V170" />
      <path d="M40 98 L150 40 L260 98" />
      <path d="M150 40 V20 M138 22 H162" opacity={0} />
      <path d="M215 64 V40 H232 V73" />
      <path d="M60 95 L240 95 M60 120 H240" strokeWidth={1.2} />
      {[80, 110, 190, 215].map((x) => <rect key={x} x={x} y={128} width={18} height={24} />)}
      <path d="M140 170 V130 H162 V170" />
      {/* timber frame strokes */}
      {[70, 100, 130, 172, 202, 232].map((x) => <path key={x} d={`M${x} 98 V120`} strokeWidth={1} />)}
      {/* hill and pines behind */}
      <path d="M0 150 Q40 110 70 120" strokeWidth={1.2} />
      {[268, 284].map((x) => <path key={x} d={`M${x} 170 V120 M${x - 12} 140 L${x} 112 L${x + 12} 140 M${x - 10} 128 L${x} 104 L${x + 10} 128`} strokeWidth={1.4} />)}
      {/* hatching for the roof's shadow side */}
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${158 + i * 11} ${46 + i * 5.6} l-8 14`} strokeWidth={1} />)}
    </g>
  </svg>
);
export const JunglePath = ({ w, h }: { w: number; h: number }) => (
  <svg width={w} height={h} viewBox="0 0 300 200" style={{ position: "absolute", inset: 0 }}>
    <g fill="none" stroke={C.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M120 200 C135 160 170 140 150 110 C135 90 160 70 168 52" />
      <path d="M180 200 C178 165 200 140 182 112 C172 94 180 72 176 52" />
      {[[40, 190, 1.2], [70, 180, 0.9], [240, 190, 1.3], [265, 170, 0.8], [215, 150, 0.7], [95, 140, 0.7]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
          <path d="M0 0 V-110" strokeWidth={3} />
          <path d="M0 -110 C-30 -120 -50 -100 -60 -80 M0 -110 C30 -125 50 -105 62 -84 M0 -108 C-20 -140 -10 -150 8 -158 M0 -108 C25 -140 40 -136 48 -130" strokeWidth={1.8} />
        </g>
      ))}
      {/* footprints fading out */}
      {[[146, 180], [158, 160], [150, 140], [162, 122], [158, 100]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={4} ry={7} strokeWidth={1.2} opacity={1 - i * 0.2} />
      ))}
      <text x={168} y={44} fontFamily={type} fontSize={34} fill={C.yarn} stroke="none">?</text>
    </g>
  </svg>
);
export const SilkBolt = ({ w, h }: { w: number; h: number }) => (
  <svg width={w} height={h} viewBox="0 0 300 200" style={{ position: "absolute", inset: 0 }}>
    <g fill="none" stroke={C.ink} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
      {/* three folded bolts stacked, the top one unrolling into a drape */}
      {[0, 1, 2].map((i) => {
        const y = 150 - i * 30;
        return (
          <g key={i}>
            <path d={`M40 ${y} h150 q14 0 14 -14 q0 -14 -14 -14 h-150 q-14 0 -14 14 q0 14 14 14 Z`} />
            <path d={`M190 ${y} q14 0 14 -14 q0 -14 -14 -14`} strokeWidth={1.2} transform="translate(-8 0)" />
            {/* woven diamonds along the fold */}
            {Array.from({ length: 6 }, (_, j) => <path key={j} d={`M${58 + j * 22} ${y - 14} l7 -7 l7 7 l-7 7 Z`} strokeWidth={1} />)}
          </g>
        );
      })}
      <path d="M204 78 C238 74 250 98 246 124 C242 150 262 168 284 172" />
      <path d="M204 100 C226 100 232 116 230 136 C228 156 246 176 270 186" />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${232 + i * 5} ${110 + i * 14} l10 4`} strokeWidth={1} />)}
      <path d="M20 170 H280" strokeWidth={1.2} />
    </g>
  </svg>
);
