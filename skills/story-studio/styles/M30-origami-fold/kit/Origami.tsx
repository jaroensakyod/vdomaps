import { loadFont } from "@remotion/google-fonts/Krub";
import { geoMercator, type GeoProjection } from "d3-geo";
import type { CSSProperties, ReactNode } from "react";
import { interpolate } from "remotion";

// M30 origami fold: the map is a sheet of folded paper on a slate table under one warm lamp. It unfolds in two
// moves (bottom half down, then the side panels out) and the creases stay: each panel sits a few degrees off flat,
// so every facet catches the light differently. Paper pieces stand up out of the sheet by folding — place cards,
// a paper boat that sails the route, a paper chedi that folds up at the end. CSS 3D for the folds, SVG for the
// facets; everything drawn in code.

export const font = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;

export const C = {
  slate: "#1d2629", // table
  paper: "#f4efe4", // washi white (back of the sheet, cards, caption band)
  kami: "#a9d6cc", // aqua origami paper: the printed side of the map
  back: "#e6dfcf", // the plain back of the sheet
  jade: "#3f8a7e", // printed fields / grid (deep teal on the aqua paper)
  indigo: "#28488f", // printed rivers and lettering
  vermilion: "#e8542f", // boat paper, route
  gold: "#d9a533", // chedi paper
  ink: "#1f2a44",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const fade = (f: number, a: number, b: number, d = 10) => interpolate(f, [a, a + d, b - d, b], [0, 1, 1, 0], clamp);
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Sheet geometry: 3 columns × 2 rows of panels.
export const SHEET = { x: 90, y: 400, w: 900, h: 1140, cols: 3, rows: 2 };
export const PW = SHEET.w / SHEET.cols;
export const PH = SHEET.h / SHEET.rows;

export const printProj = (extent: [number, number, number, number], pad = 46): GeoProjection => {
  const [w, s, e, n] = extent;
  return geoMercator().fitExtent([[pad, pad], [SHEET.w - pad, SHEET.h - pad]], { type: "MultiPoint", coordinates: [[w, s], [e, s], [e, n], [w, n]] });
};

// The slate table and the lamp.
export const Table = ({ width, height }: { width: number; height: number }) => (
  <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <radialGradient id="m30-lamp" cx="0.5" cy="0.42" r="0.75">
        <stop offset="0" stopColor="#4a5a5c" />
        <stop offset="0.55" stopColor={C.slate} />
        <stop offset="1" stopColor="#0b1012" />
      </radialGradient>
      <filter id="m30-slate" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={3} seed={9} />
        <feColorMatrix values="0 0 0 0 0.7  0 0 0 0 0.8  0 0 0 0 0.8  0 0 0 0.07 0" />
      </filter>
    </defs>
    <rect width={width} height={height} fill="url(#m30-lamp)" />
    <rect width={width} height={height} filter="url(#m30-slate)" />
  </svg>
);

// Washi fibre texture for one panel face.
const Fibre = ({ id, w, h, color }: { id: string; w: number; h: number; color: string }) => (
  <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <filter id={id} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035 0.9" numOctaves={2} seed={id.length * 7} />
        <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0.16 0" />
      </filter>
    </defs>
    <rect width={w} height={h} fill={color} />
    <rect width={w} height={h} filter={`url(#${id})`} />
  </svg>
);

// One panel: front shows its part of the print (`print` is the whole-sheet SVG, offset), back is plain paper.
// `shade` −1…1 darkens / lightens the facet (from its angle to the lamp); `crease` draws the fold edges.
// CSS backface-visibility is not reliable in headless Chrome, so the side that faces the camera is chosen here:
// `flipped` = the panel has turned more than 90° and shows its back.
const Face = ({ c, r, print, shade, back, backPrint, flipped }: { c: number; r: number; print: ReactNode; shade: number; back: "X" | "Y"; backPrint?: ReactNode; flipped: boolean }) => {
  const face: CSSProperties = { position: "absolute", inset: 0, overflow: "hidden" };
  const light = shade > 0 ? `rgba(255,250,235,${shade * 0.28})` : `rgba(10,14,20,${-shade * 0.5})`;
  if (!flipped)
    return (
      <div style={face}>
        <Fibre id={`m30-f${c}${r}`} w={PW} h={PH} color={C.kami} />
        <div style={{ position: "absolute", left: -c * PW, top: -r * PH, width: SHEET.w, height: SHEET.h }}>{print}</div>
        {/* crease edges: a lit lip on one side, a shadowed one on the other */}
        <div style={{ position: "absolute", inset: 0, background: light }} />
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.55), inset -2px -2px 0 rgba(60,50,30,0.25)" }} />
      </div>
    );
  return (
      <div style={{ ...face, transform: back === "Y" ? "rotateY(180deg)" : "rotateX(180deg)" }}>
        <Fibre id={`m30-b${c}${r}`} w={PW} h={PH} color={C.back} />
        {backPrint}
        <div style={{ position: "absolute", inset: 0, background: shade < 0 ? `rgba(10,14,20,${-shade * 0.4})` : `rgba(255,250,235,${shade * 0.2})` }} />
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.5), inset -2px -2px 0 rgba(60,50,30,0.22)" }} />
      </div>
  );
};

// The folding sheet. row 0 = bottom half folded up in front, 1 = open; col 0 = sides folded in, 1 = open.
// `rest` = the degrees each crease keeps when open (paper never lies perfectly flat).
export const Sheet = ({ row, col, tilt, print, cover, rest = 7, children }: { row: number; col: number; tilt: number; print: ReactNode; cover?: ReactNode; rest?: number; children?: ReactNode }) => {
  const aCol = 178 * (1 - col) + rest * col; // side panels
  const aRow = 179 * (1 - row) - rest * 0.6 * row; // bottom half (rests a little below the plane, a valley fold)
  const p3: CSSProperties = { position: "absolute", transformStyle: "preserve-3d", width: PW, height: PH };
  const rowFlip = aRow > 90;
  const colFlip = aCol > 90;
  const sideL = (r: number) => (
    <div style={{ ...p3, left: -PW, top: 0, transformOrigin: "100% 50%", transform: `translateZ(${(1 - col) * 1.5}px) rotateY(${-aCol}deg)` }}>
      <Face c={0} r={r} print={print} shade={0.45 - Math.sin((aCol * Math.PI) / 180) * 0.9 + (r ? -0.05 : 0)} back="Y" flipped={colFlip !== (r === 1 && rowFlip)} />
    </div>
  );
  const sideR = (r: number) => (
    <div style={{ ...p3, left: PW, top: 0, transformOrigin: "0% 50%", transform: `translateZ(${(1 - col) * 3}px) rotateY(${aCol}deg)` }}>
      <Face c={2} r={r} print={print} shade={-0.25 - Math.sin((aCol * Math.PI) / 180) * 0.5 + (r ? -0.05 : 0)} back="Y" flipped={colFlip !== (r === 1 && rowFlip)} />
    </div>
  );
  // shadow on the table grows as the sheet opens
  const sw = PW * (1 + 2 * col), sh = PH * (1 + row);
  return (
    <div style={{ position: "absolute", left: SHEET.x, top: SHEET.y, width: SHEET.w, height: SHEET.h, perspective: 2200, perspectiveOrigin: "50% 30%" }}>
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(${tilt}deg)`, transformOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: SHEET.w / 2 - sw / 2 + 18, top: 22, width: sw, height: sh, background: "rgba(0,0,0,0.55)", filter: "blur(22px)", transform: "translateZ(-90px)" }} />
        {/* top row: centre panel carries the two side panels */}
        <div style={{ ...p3, left: PW, top: 0 }}>
          <Face c={1} r={0} print={print} shade={0.06} back="Y" flipped={false} />
          {sideL(0)}
          {sideR(0)}
        </div>
        {/* bottom row: hinged on the middle crease (while it is folded up its side panels lie hidden behind it) */}
        <div style={{ ...p3, left: PW, top: PH, transformOrigin: "50% 0%", transform: `translateZ(${(1 - row) * 7}px) rotateX(${aRow}deg)` }}>
          <Face c={1} r={1} print={print} shade={-0.04 - Math.abs(Math.sin((aRow * Math.PI) / 180)) * 0.3 - (row > 0.99 ? 0.06 : 0)} back="X" backPrint={cover} flipped={rowFlip} />
          {!rowFlip && sideL(1)}
          {!rowFlip && sideR(1)}
        </div>
        {/* objects standing on the open sheet */}
        <div style={{ position: "absolute", left: 0, top: 0, width: SHEET.w, height: SHEET.h, transformStyle: "preserve-3d", transform: "translateZ(3px)" }}>{children}</div>
      </div>
    </div>
  );
};

// Something that folds up out of the sheet: flat at k = 0, standing (at `stand` degrees) at k = 1.
export const StandUp = ({ x, y, w, h, k, stand = 72, children, turn = 0 }: { x: number; y: number; w: number; h: number; k: number; stand?: number; children: ReactNode; turn?: number }) => {
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, transformOrigin: "50% 100%", transformStyle: "preserve-3d", transform: `rotateZ(${turn}deg) rotateX(${-stand * k}deg)` }}>
      {/* the fold line's shadow on the sheet */}
      <div style={{ position: "absolute", left: 4, right: 4, bottom: -2, height: 6, background: "rgba(40,30,20,0.25)", filter: "blur(3px)", transform: `rotateX(${stand * k}deg)`, transformOrigin: "50% 100%" }} />
      {children}
    </div>
  );
};

// A place card: tent-folded card, upper face lit, lower lip shaded, name printed in indigo.
export const PlaceCard = ({ text, sub, w = 220 }: { text: string; sub?: string; w?: number }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <svg width={w} height={sub ? 96 : 76} style={{ position: "absolute", left: 0, bottom: 0, overflow: "visible" }}>
      <path d={`M0 ${sub ? 96 : 76}L8 4H${w - 8}L${w} ${sub ? 96 : 76}Z`} fill="#faf6ec" stroke="#cfc6b1" strokeWidth={1.2} />
      <path d={`M8 4H${w - 8}L${w - 6} 14H6Z`} fill="#fffdf6" />
      <path d={`M0 ${sub ? 96 : 76}L4 ${sub ? 82 : 62}H${w - 4}L${w} ${sub ? 96 : 76}Z`} fill="#d9cfb9" />
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: sub ? 34 : 18, textAlign: "center", fontFamily: font, fontWeight: 700, fontSize: 34, color: C.indigo, lineHeight: 1 }}>{text}</div>
    {sub && <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, textAlign: "center", fontFamily: font, fontWeight: 500, fontSize: 20, color: "#5b6783" }}>{sub}</div>}
  </div>
);

// Classic paper boat in vermilion paper, three facets lit from the lamp (upper left).
export const PaperBoat = ({ w = 150 }: { w?: number }) => {
  const h = w * 0.72;
  const s = w / 150;
  return (
    <svg width={w} height={h} viewBox="0 0 150 108" style={{ position: "absolute", left: 0, bottom: 0, overflow: "visible" }}>
      {/* sail: two facets meeting on the centre crease */}
      <path d="M75 0 L44 62 L75 62 Z" fill="#ff7a52" />
      <path d="M75 0 L106 62 L75 62 Z" fill="#c63f1f" />
      {/* hull: front face, the folded brim, the shaded underside */}
      <path d="M0 58 L150 58 L122 104 L28 104 Z" fill="#e8542f" />
      <path d="M0 58 L150 58 L140 70 L10 70 Z" fill="#ff8b63" />
      <path d="M28 104 L122 104 L116 108 L34 108 Z" fill="#8f2a12" />
      <path d="M75 58 L75 104" stroke="#b8401f" strokeWidth={1.4 / s} />
      <path d="M0 58 L150 58" stroke="#ffd1bd" strokeWidth={1.6 / s} />
    </svg>
  );
};

// Paper chedi (bell-shaped stupa) folded from gold paper: each tier is a facet pair split on the centre crease.
export const PaperChedi = ({ w = 220, k = 1 }: { w?: number; k?: number }) => {
  // tiers from the base up: [half width, height]
  const tiers: [number, number][] = [
    [100, 26],
    [82, 22],
    [66, 64], // the bell
    [30, 22],
    [18, 56], // the spire
    [5, 30],
  ];
  let y = 300;
  const parts: ReactNode[] = [];
  tiers.forEach(([hw, th], i) => {
    const t = Math.max(0, Math.min(1, k * tiers.length - i)); // each tier folds up after the one below
    if (t <= 0) return;
    const top = tiers[i + 1] ? tiers[i + 1][0] : 1;
    const hh = th * t;
    const narrow = i === 2 ? hw * 0.72 : top;
    const L = `M${110 - hw} ${y} L${110 - narrow} ${y - hh} L110 ${y - hh} L110 ${y} Z`;
    const R = `M${110 + hw} ${y} L${110 + narrow} ${y - hh} L110 ${y - hh} L110 ${y} Z`;
    parts.push(
      <g key={i}>
        <path d={L} fill={i % 2 ? "#f2c75a" : "#ecbd4a"} />
        <path d={R} fill={i % 2 ? "#b5851f" : "#a87a1a"} />
        <path d={`M${110 - hw} ${y} H${110 + hw}`} stroke="#fff3c4" strokeWidth={2} />
      </g>,
    );
    y -= hh;
  });
  return (
    <svg width={w} height={(w * 300) / 220} viewBox="0 0 220 300" style={{ position: "absolute", left: 0, bottom: 0, overflow: "visible" }}>
      {parts}
    </svg>
  );
};

// Paper strip for captions: a band with one diagonal fold at each end.
export const PaperBand = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ position: "absolute", ...style }}>
    <svg width="100%" height="100%" viewBox="0 0 960 150" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, overflow: "visible", filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.45))" }}>
      <path d="M0 18 L40 0 L40 132 L0 150 Z" fill="#cdbfa3" />
      <path d="M960 18 L920 0 L920 132 L960 150 Z" fill="#b8aa8c" />
      <rect x={40} y={0} width={880} height={132} fill={C.paper} />
      <rect x={40} y={0} width={440} height={132} fill="#fffaf0" opacity={0.5} />
    </svg>
    <div style={{ position: "absolute", left: 60, right: 60, top: 0, height: "88%", display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
  </div>
);
