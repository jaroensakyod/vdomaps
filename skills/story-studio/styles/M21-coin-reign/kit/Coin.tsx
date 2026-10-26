import { loadFont } from "@remotion/google-fonts/Trirong";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import type { ReactNode } from "react";
import { interpolate } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import c50 from "world-atlas/countries-50m.json";

// M21 coin reign: every reign is a struck coin lying on a velvet tray. Coins are drawn face-on in SVG: a metal
// face lit by a fixed raking light from the upper left, a raised rim with an incised inscription on a text path,
// a mirror ("proof") field, frosted relief made with an emboss filter, and a milled edge that shows when the coin
// turns. All designs are new — no real coin, no portrait.

export const font = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Metal = "gold" | "silver" | "bronze";
// dark, mid, light, specular — the four stops of every metal
export const METAL: Record<Metal, [string, string, string, string]> = {
  gold: ["#4a3008", "#b8892f", "#f0d27c", "#fff7d8"],
  silver: ["#2c3036", "#8f969f", "#dde1e6", "#ffffff"],
  bronze: ["#33190a", "#94552a", "#d99a62", "#ffe3c4"],
};
export const C = {
  velvet: "#4a2372", // royal purple velvet
  velvetDeep: "#14081f",
  sheen: "#a77fd6",
  brass: "#c9a24e",
  text: "#f2ead6",
};

const TH = "๐๑๒๓๔๕๖๗๘๙";
export const thai = (n: number | string) => String(n).replace(/[0-9]/g, (d) => TH[Number(d)]);

const topo = c50 as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
export const THAILAND = (feature(topo, topo.objects.countries) as unknown as { features: Feature<Geometry, { name: string }>[] }).features.find((f) => f.id === "764")!;

// Velvet: royal purple pile with fibre grain, crushed sheen and a spotlight pool where the coin lies.
export const Velvet = ({ w, h, pool = [540, 800], light = 1 }: { w: number; h: number; pool?: [number, number]; light?: number }) => (
  <g>
    <defs>
      <radialGradient id="m21-vel" cx={pool[0]} cy={pool[1]} r={h * 0.75} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#6e3ca6" />
        <stop offset="0.35" stopColor={C.velvet} />
        <stop offset="1" stopColor={C.velvetDeep} />
      </radialGradient>
      <filter id="m21-pile" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85 0.6" numOctaves={2} seed={4} />
        <feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.6  0 0 0 0 1  0 0 0 0.16 -0.02" />
      </filter>
      <filter id="m21-crush" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.007" numOctaves={3} seed={11} />
        <feColorMatrix values="0 0 0 0 0.7  0 0 0 0 0.45  0 0 0 0 0.95  0 0 0 0.9 -0.42" />
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
    <rect width={w} height={h} fill="url(#m21-vel)" />
    <rect width={w} height={h} filter="url(#m21-crush)" opacity={0.55 * light} />
    <rect width={w} height={h} filter="url(#m21-pile)" />
  </g>
);

// Shared filters: emboss for relief and incised lettering, soft coin shadow.
export const CoinDefs = () => (
  <defs>
    <filter id="m21-emboss" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="b" />
      <feSpecularLighting in="b" surfaceScale="5" specularConstant="1.25" specularExponent="16" lightingColor="#ffffff" result="sp">
        <feDistantLight azimuth="225" elevation="38" />
      </feSpecularLighting>
      <feComposite in="sp" in2="SourceAlpha" operator="in" result="spi" />
      <feDiffuseLighting in="b" surfaceScale="5" diffuseConstant="1.25" lightingColor="#ffffff" result="df">
        <feDistantLight azimuth="225" elevation="50" />
      </feDiffuseLighting>
      <feComposite in="df" in2="SourceAlpha" operator="in" result="dfi" />
      <feBlend in="SourceGraphic" in2="dfi" mode="multiply" result="m" />
      <feComposite in="spi" in2="m" operator="arithmetic" k2="0.75" k3="1" />
    </filter>
    <filter id="m21-frost" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves={1} seed={3} result="n" />
      <feColorMatrix in="n" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 -0.1" result="w" />
      <feComposite in="w" in2="SourceAlpha" operator="in" result="wi" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="wi" />
      </feMerge>
    </filter>
    <filter id="m21-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
  </defs>
);

const grad = (id: string, m: Metal, angle = 0) => {
  const [d, mi, l, sp] = METAL[m];
  return (
    <linearGradient id={id} x1="0.1" y1="0" x2="0.9" y2="1" gradientTransform={`rotate(${angle} 0.5 0.5)`}>
      <stop offset="0" stopColor={sp} />
      <stop offset="0.22" stopColor={l} />
      <stop offset="0.55" stopColor={mi} />
      <stop offset="1" stopColor={d} />
    </linearGradient>
  );
};

// A text ring on the rim: incised letters (dark cut with a light lip below).
export const RimText = ({ id, r, text, size, color, start = 0 }: { id: string; r: number; text: string; size: number; color: string; start?: number }) => (
  <g>
    <defs>
      <path id={id} d={`M0 ${r} A${r} ${r} 0 1 1 0 ${-r} A${r} ${r} 0 1 1 0 ${r}`} />
    </defs>
    {[
      { dy: 1.4, fill: "#ffffff", op: 0.45 },
      { dy: 0, fill: color, op: 0.9 },
    ].map((l, i) => (
      <text key={i} transform={`translate(0 ${l.dy}) rotate(${start})`} fontFamily={font} fontWeight={700} fontSize={size} fill={l.fill} opacity={l.op} letterSpacing={size * 0.03}>
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
    ))}
  </g>
);

// One coin face, centred on 0,0, radius r. `spin` turns the design (rolling); the light stays put.
// `flip` 0..1 turns it about its vertical axis (0 face-on, 0.5 edge-on): the milled edge shows as a band.
export const Coin = ({ id, r, metal, spin = 0, flip = 0, children, rim, shadow = true }: { id: string; r: number; metal: Metal; spin?: number; flip?: number; children?: ReactNode; rim?: string; shadow?: boolean }) => {
  const [d, mi, l, sp] = METAL[metal];
  const c = Math.cos(flip * Math.PI);
  const sx = Math.max(0.02, Math.abs(c));
  const thick = r * 0.13;
  const sideways = Math.sin(flip * Math.PI) * thick;
  const rimW = r * 0.1;
  return (
    <g>
      <defs>
        {grad(`${id}-face`, metal)}
        {grad(`${id}-rim`, metal)}
        {grad(`${id}-bevel`, metal, 180)}
        <radialGradient id={`${id}-field`} cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor={mi} />
          <stop offset="0.65" stopColor={d} />
          <stop offset="1" stopColor={mi} />
        </radialGradient>
        <pattern id={`${id}-mill`} width={r * 0.035} height={10} patternUnits="userSpaceOnUse">
          <rect width={r * 0.035} height={10} fill={mi} />
          <rect width={r * 0.014} height={10} fill={d} />
          <rect x={r * 0.016} width={r * 0.006} height={10} fill={l} />
        </pattern>
        <clipPath id={`${id}-clip`}>
          <circle r={r - rimW} />
        </clipPath>
      </defs>
      {shadow && <ellipse cx={r * 0.12} cy={r * 0.16} rx={r * sx + Math.abs(sideways)} ry={r * 1.02} fill="#000" opacity={0.7} filter="url(#m21-shadow)" />}
      {/* milled edge: the coin's thickness, seen as it turns */}
      {Math.abs(sideways) > 0.5 && (
        <g>
          <rect x={Math.min(0, sideways)} y={-r} width={Math.abs(sideways)} height={2 * r} fill={`url(#${id}-mill)`} />
          <ellipse cx={sideways} cy={0} rx={r * sx} ry={r} fill={d} />
          <rect x={Math.min(0, sideways)} y={-r} width={Math.abs(sideways)} height={2 * r} fill={`url(#${id}-mill)`} opacity={0.9} />
        </g>
      )}
      <g transform={`scale(${sx} 1)`}>
        {/* rim, raised and lit */}
        <circle r={r} fill={`url(#${id}-rim)`} />
        <circle r={r - 1.5} fill="none" stroke={d} strokeWidth={2} opacity={0.6} />
        {/* toothed border inside the rim */}
        <circle r={r - rimW * 0.55} fill="none" stroke={d} strokeWidth={rimW * 0.28} strokeDasharray={`${r * 0.012} ${r * 0.018}`} opacity={0.55} />
        <circle r={r - rimW} fill={`url(#${id}-bevel)`} />
        {/* mirror field */}
        <circle r={r - rimW - r * 0.018} fill={`url(#${id}-field)`} />
        <g clipPath={`url(#${id}-clip)`}>
          <g transform={`rotate(${spin})`}>
            {rim && <RimText id={`${id}-rt`} r={r - rimW - r * 0.1} text={rim} size={r * 0.085} color={d} />}
            {children}
          </g>
          {/* the velvet reflected in the mirror field: a soft diagonal band, fixed to the light */}
          <rect x={-r} y={-r * 0.2} width={2 * r} height={r * 0.32} fill={sp} opacity={0.1} transform="rotate(-38)" />
          <rect x={-r} y={r * 0.25} width={2 * r} height={r * 0.06} fill={sp} opacity={0.08} transform="rotate(-38)" />
        </g>
        {/* rim glint */}
        <path d={`M${-r * 0.92} ${-r * 0.38} A${r} ${r} 0 0 1 ${-r * 0.38} ${-r * 0.92}`} fill="none" stroke={sp} strokeWidth={r * 0.016} strokeLinecap="round" opacity={0.6} />
        <circle r={r} fill="none" stroke={l} strokeWidth={1.2} opacity={0.5} />
        {/* darkening as it turns away from the light */}
        {flip > 0 && <circle r={r} fill="#000" opacity={0.55 * (1 - sx)} />}
      </g>
    </g>
  );
};

// Raised relief (frosted metal with an emboss). Children are plain filled shapes.
export const Relief = ({ metal, children, frost = true }: { metal: Metal; children: ReactNode; frost?: boolean }) => {
  const [, , l] = METAL[metal];
  return (
    <g filter="url(#m21-emboss)">
      <g filter={frost ? "url(#m21-frost)" : undefined} fill={l}>
        {children}
      </g>
    </g>
  );
};

// The realm embossed on the coin: modern Thailand outline, fitted into r, with the capital as a raised star.
export const RealmFace = ({ r, metal, k = 1 }: { r: number; metal: Metal; k?: number }) => {
  const proj = geoMercator().fitExtent([[-r * 0.36, -r * 0.6], [r * 0.36, r * 0.56]], THAILAND);
  const path = geoPath(proj);
  const [bx, by] = proj([100.5, 13.75])!;
  const star = Array.from({ length: 16 }, (_, i) => {
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    const rr = i % 2 ? r * 0.018 : r * 0.05;
    return `${i ? "L" : "M"}${bx + Math.cos(a) * rr} ${by + Math.sin(a) * rr}`;
  }).join(" ") + "Z";
  return (
    <g opacity={k}>
      <Relief metal={metal}>
        <path d={path(THAILAND) ?? ""} />
      </Relief>
      <Relief metal={metal} frost={false}>
        <path d={star} />
      </Relief>
      <text x={bx - r * 0.07} y={by + r * 0.015} textAnchor="end" fontFamily={font} fontWeight={700} fontSize={r * 0.06} fill={METAL[metal][0]} opacity={0.85}>
        กรุงเทพฯ
      </text>
    </g>
  );
};

// The reign face: big raised Thai numeral, "รัชกาลที่" above, a wreath of small leaves.
export const ReignFace = ({ r, metal, n }: { r: number; metal: Metal; n: number }) => (
  <g>
    <Relief metal={metal} frost={false}>
      {Array.from({ length: 26 }, (_, i) => {
        const side = i < 13 ? -1 : 1;
        const j = i % 13;
        const a = (Math.PI / 2) + side * (0.35 + j * 0.17);
        const x = Math.cos(a) * r * 0.62;
        const y = Math.sin(a) * r * 0.62;
        const rot = (a * 180) / Math.PI + (side > 0 ? -60 : 60);
        return <ellipse key={i} cx={x} cy={y} rx={r * 0.045} ry={r * 0.018} transform={`rotate(${rot} ${x} ${y})`} />;
      })}
    </Relief>
    <Relief metal={metal}>
      <text y={r * 0.3} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={r * 0.82}>
        {thai(n)}
      </text>
    </Relief>
    <text y={-r * 0.36} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={r * 0.12} fill={METAL[metal][0]} letterSpacing={r * 0.01}>
      รัชกาลที่
    </text>
  </g>
);

// The tray: a recessed velvet channel with a brass rule; coins stand in it and roll along.
export const Tray = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
  <g>
    <defs>
      <linearGradient id="m21-tray" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#07020c" />
        <stop offset="0.18" stopColor="#25103a" />
        <stop offset="1" stopColor="#4a2372" />
      </linearGradient>
      <linearGradient id="m21-brass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4dc95" />
        <stop offset="0.5" stopColor="#b68a3a" />
        <stop offset="1" stopColor="#5c3f12" />
      </linearGradient>
    </defs>
    <rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} rx={22} fill="url(#m21-brass)" />
    <rect x={x} y={y} width={w} height={h} rx={18} fill="url(#m21-tray)" />
    <rect x={x} y={y} width={w} height={h} rx={18} filter="url(#m21-pile)" opacity={0.8} />
    {/* the timeline groove */}
    <rect x={x + 24} y={y + h - 54} width={w - 48} height={6} rx={3} fill="#08020c" />
    <rect x={x + 24} y={y + h - 48} width={w - 48} height={1.5} fill={C.sheen} opacity={0.7} />
  </g>
);

// Small brass plate with engraved text (years under each tray coin, caption plaque under the big coin).
export const Plate = ({ x, y, w, h, children, k = 1 }: { x: number; y: number; w: number; h: number; children: ReactNode; k?: number }) => (
  <g opacity={k}>
    <rect x={x - w / 2} y={y} width={w} height={h} rx={h * 0.12} fill="url(#m21-brass)" />
    <rect x={x - w / 2 + 3} y={y + 3} width={w - 6} height={h - 6} rx={h * 0.1} fill="none" stroke="#5c3f12" strokeWidth={1.2} opacity={0.7} />
    {children}
  </g>
);

// Engraved text for brass: dark cut over a light lip.
export const Cut = ({ x, y, size, children, weight = 700, anchor = "middle", color = "#3b2608" }: { x: number; y: number; size: number; children: ReactNode; weight?: number; anchor?: "middle" | "start" | "end"; color?: string }) => (
  <g fontFamily={font} fontWeight={weight} fontSize={size} textAnchor={anchor}>
    <text x={x} y={y + 1.3} fill="#fff4cf" opacity={0.6}>
      {children}
    </text>
    <text x={x} y={y} fill={color}>
      {children}
    </text>
  </g>
);

// A coin rolling into its slot: x from `from` to `to` over [f0, f1]; spin follows the distance rolled.
export const rollAt = (frame: number, f0: number, f1: number, from: number, to: number, r: number) => {
  const t = interpolate(frame, [f0, f1], [0, 1], { ...clamp, easing: (u) => 1 - Math.pow(1 - u, 3) });
  // a small settle-back after it stops, like a coin rocking in a groove
  const settle = frame > f1 ? Math.sin((frame - f1) * 0.5) * Math.exp(-(frame - f1) * 0.12) * 6 : 0;
  const x = from + (to - from) * t + settle;
  return { x, spin: ((x - from) / r) * (180 / Math.PI), on: t > 0 || frame >= f0 };
};
