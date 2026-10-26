import { loadFont } from "@remotion/google-fonts/BaiJamjuree";
import type { FeatureCollection, Geometry } from "geojson";
import { geoOrthographic } from "d3-geo";
import { useMemo, type ReactNode } from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land50 from "world-atlas/land-50m.json";
import type { Cam } from "../../../components/camera";
import { useMap } from "../../../components/Map";
import { region } from "../../../components/Region";

// M18 cargo crate: the whole frame is the face of a wooden shipping crate — sawn planks with grain, dark gaps,
// nail heads, side battens with rope handles. The map is sprayed on through a stencil in blue paint (it stops at
// the gaps between planks), routes are red stencil dashes, ports are stencilled rings, goods arrive as small crates
// that slide in and stack, each with a stamped paper cargo label, and prices hang on manila tags tied with string.

export const font = loadFont("normal", { weights: ["500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;

export const C = {
  wood: "#7f4e27", // sawn pine, oiled
  dark: "#2e1c0e", // gaps, shadow
  pine: "#c99a60", // raw pine where the paint is worn and on the small crates
  paint: "#1d1b18", // black stencil paint
  red: "#b8321f", // red stencil paint, stamps
  blue: "#1f3a63", // blue stencil paint: the land
  label: "#e7d6a8", // kraft cargo label / manila tag
  string: "#efe4c6",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const fade = (frame: number, f0: number, f1: number, d = 10) => interpolate(frame, [f0, f0 + d, f1 - d, f1], [0, 1, 1, 0], clamp);

const topo = land50 as unknown as Topology<{ land: GeometryCollection }>;
export const LAND = feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>;

// Plank rows of the crate face (top y, height) at 1080×1920, and the side battens' width.
export const useCrate = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const bat = 92 * s;
  const rows: [number, number][] = [];
  const hs = [236, 250, 244, 256, 238, 248, 252, 240];
  let y = 0;
  for (const h of hs) {
    rows.push([y * s, h * s]);
    y += h;
  }
  return { s, width, height, bat, rows };
};

export const fitBox = ([w, so, e, n]: [number, number, number, number], box: number[], k = 1): Cam => {
  const lon = (w + e) / 2;
  const lat = (so + n) / 2;
  const p = geoOrthographic().rotate([-lon, -lat]).fitSize([box[2], box[3]], region([[w, so], [w, n], [e, n], [e, so]]));
  return { lon, lat, scale: p.scale() * k };
};

// Shared filters: wood grain, paint wear (a noise mask that eats into sprayed paint), overspray softness.
export const CrateDefs = () => {
  const { s, width, height, rows, bat } = useCrate();
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <defs>
        <filter id="m18-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.09" numOctaves={4} seed={9} />
          <feColorMatrix values="0 0 0 0 0.29  0 0 0 0 0.17  0 0 0 0 0.07  0 0 0 0.9 -0.28" />
        </filter>
        <filter id="m18-pgrain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.003 0.11" numOctaves={4} seed={9} />
          <feColorMatrix values="0 0 0 0 0.24  0 0 0 0 0.13  0 0 0 0 0.05  0 0 0 1.3 -0.45" />
        </filter>
        <filter id="m18-chip" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves={3} seed={23} />
          <feColorMatrix values="0 0 0 0 0.78  0 0 0 0 0.6  0 0 0 0 0.38  0 0 0 -7 4.6" />
        </filter>
        <filter id="m18-knots" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves={2} seed={4} />
          <feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.66  0 0 0 0 0.42  0 0 0 0.9 -0.4" />
        </filter>
        <filter id="m18-wear" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={3} seed={17} result="n" />
          <feColorMatrix in="n" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -10 8.3" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
        <filter id="m18-spray" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={3} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={3 * s} />
        </filter>
        {/* paint only lands on plank faces, not in the gaps */}
        <mask id="m18-planks" maskUnits="userSpaceOnUse" x={0} y={0} width={width} height={height}>
          <rect width={width} height={height} fill="#000" />
          {rows.map(([y, h], i) => <rect key={i} x={bat} y={y + 5 * s} width={width - 2 * bat} height={h - 10 * s} fill="#fff" />)}
        </mask>
      </defs>
    </svg>
  );
};

// The crate face: planks with grain, gaps, warm light from the top left, battens with nails and rope handles.
export const CrateFace = () => {
  const { s, width, height, rows, bat } = useCrate();
  const nails = (x: number, y: number, key: string) => (
    <g key={key}>
      <circle cx={x + 1.5 * s} cy={y + 2 * s} r={9 * s} fill="#000" opacity={0.35} />
      <circle cx={x} cy={y} r={8 * s} fill="url(#m18-nail)" />
      <circle cx={x - 2 * s} cy={y - 2.5 * s} r={2.4 * s} fill="#e9e4d8" opacity={0.7} />
    </g>
  );
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="m18-nail" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#bdb8ad" />
          <stop offset="0.6" stopColor="#5f5a52" />
          <stop offset="1" stopColor="#2b2722" />
        </radialGradient>
        <radialGradient id="m18-light" cx="0.3" cy="0.25" r="0.95">
          <stop offset="0" stopColor="#fff2d6" stopOpacity={0.22} />
          <stop offset="0.55" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.5} />
        </radialGradient>
        <linearGradient id="m18-plank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#965f31" />
          <stop offset="0.5" stopColor={C.wood} />
          <stop offset="1" stopColor="#5e381a" />
        </linearGradient>
        <linearGradient id="m18-bat" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5a3519" />
          <stop offset="0.5" stopColor="#714424" />
          <stop offset="1" stopColor="#4a2b13" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={C.dark} />
      {rows.map(([y, h], i) => (
        <g key={i}>
          <rect x={0} y={y + 4 * s} width={width} height={h - 8 * s} fill="url(#m18-plank)" />
          <g style={{ filter: `hue-rotate(${(random(`ph${i}`) - 0.5) * 8}deg) brightness(${0.94 + random(`pb${i}`) * 0.12})` }}>
            <rect x={-random(`gx${i}`) * 600 * s} y={y + 4 * s} width={width + 600 * s} height={h - 8 * s} filter="url(#m18-pgrain)" opacity={0.8} />
            <rect x={-random(`cx${i}`) * 400 * s} y={y + 4 * s} width={width + 400 * s} height={h - 8 * s} filter="url(#m18-chip)" opacity={0.3} />
          </g>
          {/* sawn edges: light top edge, shadow under the plank */}
          <rect x={0} y={y + 4 * s} width={width} height={2 * s} fill="#f0cf98" opacity={0.45} />
          <rect x={0} y={y + h - 6 * s} width={width} height={3 * s} fill="#101816" opacity={0.5} />
        </g>
      ))}
      {/* side battens */}
      {[0, width - bat].map((x, i) => (
        <g key={i}>
          <rect x={x} y={0} width={bat} height={height} fill="url(#m18-bat)" />
          <rect x={x} y={0} width={bat} height={height} filter="url(#m18-grain)" opacity={0.6} transform={`rotate(90 ${x + bat / 2} ${height / 2})`} style={{ display: "none" }} />
          <rect x={i ? x : x + bat - 4 * s} y={0} width={4 * s} height={height} fill="#000" opacity={0.4} />
          {rows.map(([y, h], j) => (
            <g key={j}>{nails(x + bat * 0.5, y + h * 0.3, `n${i}${j}a`)}{nails(x + bat * 0.5, y + h * 0.72, `n${i}${j}b`)}</g>
          ))}
        </g>
      ))}
      <rect width={width} height={height} fill="url(#m18-light)" />
    </svg>
  );
};

// Rope handle on a batten: two holes and a sagging twisted rope.
export const Rope = ({ side, y }: { side: "left" | "right"; y: number }) => {
  const { s, width, bat } = useCrate();
  const x = side === "left" ? bat * 0.5 : width - bat * 0.5;
  const dir = side === "left" ? 1 : -1;
  const d = `M${x} ${y - 70 * s} C${x + dir * 70 * s} ${y - 40 * s} ${x + dir * 70 * s} ${y + 40 * s} ${x} ${y + 70 * s}`;
  return (
    <svg width={width} height={y + 200 * s} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {[y - 70 * s, y + 70 * s].map((hy, i) => <circle key={i} cx={x} cy={hy} r={13 * s} fill="#1a0f06" />)}
      <path d={d} fill="none" stroke="#000" strokeOpacity={0.4} strokeWidth={22 * s} transform={`translate(${6 * s} ${8 * s})`} style={{ filter: `blur(${4 * s}px)` }} />
      <path d={d} fill="none" stroke="#a88b5c" strokeWidth={18 * s} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#6e5530" strokeWidth={18 * s} strokeDasharray={`${4 * s} ${7 * s}`} />
      <path d={d} fill="none" stroke="#e2cfa0" strokeWidth={4 * s} strokeDasharray={`${3 * s} ${8 * s}`} transform={`translate(${-2 * s} ${-2 * s})`} opacity={0.8} />
    </svg>
  );
};

// Stencil paint: children are painted (black or red) and masked by wear; `k` 0…1 sprays them on left to right.
// The overspray halo is a soft, faint copy. Draw inside an <svg>; set `planks` to stop paint at the gaps.
export const Paint = ({ children, k = 1, box, planks = true, id, wear = true }: { children: ReactNode; k?: number; box: number[]; planks?: boolean; id: string; wear?: boolean }) => {
  const [x, y, w, h] = box;
  const { s } = useCrate();
  if (k <= 0) return null;
  return (
    <g mask={planks ? "url(#m18-planks)" : undefined}>
      <defs>
        <clipPath id={`m18-k-${id}`}>
          <rect x={x - 40 * s} y={y - 40 * s} width={(w + 80 * s) * k} height={h + 80 * s} />
        </clipPath>
      </defs>
      <g clipPath={`url(#m18-k-${id})`}>
        <g opacity={0.18} style={{ filter: `blur(${5 * s}px)` }}>{children}</g>
        <g filter={wear ? "url(#m18-wear)" : undefined}>
          <g filter="url(#m18-spray)">{children}</g>
        </g>
      </g>
    </g>
  );
};

// Stencilled text: the type with stencil bridges (thin horizontal and vertical breaks), painted.
export const StencilText = ({ x, y, text, size, color = C.paint, anchor = "start", weight = 700, spacing = 2 }: { x: number; y: number; text: string; size: number; color?: string; anchor?: "start" | "middle" | "end"; weight?: number; spacing?: number }) => {
  const { s, width } = useCrate();
  const id = `m18-br-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={0} y={y - size * 1.4} width={width} height={size * 2}>
          <rect x={0} y={y - size * 1.4} width={width} height={size * 2} fill="#fff" />
          <rect x={0} y={y - size * 0.4} width={width} height={Math.max(2.5 * s, size * 0.055)} fill="#000" />
        </mask>
      </defs>
      <text x={x} y={y} mask={`url(#${id})`} textAnchor={anchor} fontFamily={font} fontWeight={weight} fontSize={size} fill={color} letterSpacing={spacing * s}>
        {text}
      </text>
    </g>
  );
};

// The stencilled map: land in black paint with a stencil-cut coastline (a thin bare-wood line just inside it).
export const StencilLand = () => {
  const { path, s } = useMap();
  const d = useMemo(() => path(LAND) ?? "", [path]);
  return (
    <g>
      <path d={d} fill={C.blue} opacity={0.92} />
      <path d={d} fill="none" stroke={C.wood} strokeWidth={3 * s} strokeOpacity={0.55} transform={`translate(${0} ${0})`} strokeDasharray={`${60 * s} ${7 * s}`} />
    </g>
  );
};

// A stencilled port: red ring with a cross, and its name sprayed beside it.
export const Port = ({ at, name, dx = 24, dy = 12, anchor = "start", k = 1 }: { at: [number, number]; name: string; dx?: number; dy?: number; anchor?: "start" | "middle" | "end"; k?: number }) => {
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || k <= 0) return null;
  const r = 15 * s * (0.6 + 0.4 * k);
  return (
    <g opacity={Math.min(1, k * 2)}>
      <circle cx={p[0]} cy={p[1]} r={r} fill="none" stroke={C.red} strokeWidth={7 * s} strokeDasharray={`${r * 1.35} ${3 * s}`} />
      <circle cx={p[0]} cy={p[1]} r={4.5 * s} fill={C.red} />
      <StencilText x={p[0] + dx * s} y={p[1] + dy * s} text={name} size={38 * s} color={C.label} anchor={anchor} />
    </g>
  );
};

// A route as red stencil dashes along a gentle curve, painted on up to `k`; a small arrowhead at the tip.
export const StencilRoute = ({ pts, k }: { pts: [number, number][]; k: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const xy = pts.map((p) => projection(p)).filter(Boolean) as [number, number][];
  const seg = xy.slice(1).map((p, i) => Math.hypot(p[0] - xy[i][0], p[1] - xy[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * k;
  const out: [number, number][] = [xy[0]];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const t = Math.min(1, left / seg[i]);
    out.push([xy[i][0] + (xy[i + 1][0] - xy[i][0]) * t, xy[i][1] + (xy[i + 1][1] - xy[i][1]) * t]);
    left -= seg[i];
  }
  const d = out.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  const [a, b] = [out[out.length - 2] ?? out[0], out[out.length - 1]];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return (
    <g>
      <path d={d} fill="none" stroke={C.red} strokeWidth={11 * s} strokeDasharray={`${26 * s} ${16 * s}`} strokeLinejoin="round" />
      <path d={`M${18 * s} 0 L${-12 * s} ${-16 * s} L${-12 * s} ${16 * s} Z`} fill={C.red} transform={`translate(${b[0]} ${b[1]}) rotate(${(ang * 180) / Math.PI})`} />
    </g>
  );
};

// A small crate that slides in from the right and drops onto the stack: planks, battens, a stamped cargo label.
export const SmallCrate = ({ x, y, w, h, at, goods, sub, tilt = 0 }: { x: number; y: number; w: number; h: number; at: number; goods: string; sub: string; tilt?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s, width } = useCrate();
  if (frame < at) return null;
  const slide = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 120, mass: 0.9 } });
  const drop = spring({ frame: frame - at - 14, fps, config: { damping: 9, stiffness: 220 } });
  const ox = (1 - slide) * (width - x + 60 * s);
  const oy = (1 - drop) * -40 * s;
  const lw = w * 0.7;
  const lh = h * 0.56;
  return (
    <div style={{ position: "absolute", left: x + ox, top: y + oy, width: w, height: h, transform: `rotate(${tilt * (1 - drop * 0.6)}deg)` }}>
      <svg width={w + 30 * s} height={h + 30 * s} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <rect x={10 * s} y={14 * s} width={w} height={h} fill="#000" opacity={0.45} style={{ filter: `blur(${8 * s}px)` }} />
        <rect width={w} height={h} fill="#8d6131" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={0} y={(i * h) / 3 + 2 * s} width={w} height={h / 3 - 4 * s} fill="#b88a50" />
            <svg x={0} y={(i * h) / 3 + 2 * s} width={w} height={h / 3 - 4 * s}><rect x={-random(`sc${goods}${i}`) * 300 * s} y={0} width={w + 300 * s} height={h / 3 - 4 * s} filter="url(#m18-grain)" opacity={0.7} /></svg>
          </g>
        ))}
        <rect x={0} y={0} width={w} height={h} fill="none" stroke="#5a3a1a" strokeWidth={4 * s} />
        {[0, w - 26 * s].map((bx, i) => <rect key={i} x={bx} y={0} width={26 * s} height={h} fill="#7d5428" />)}
        {[[13, 16], [13, h / s - 16], [w / s - 13, 16], [w / s - 13, h / s - 16]].map(([nx, ny], i) => <circle key={i} cx={nx * s} cy={ny * s} r={4.5 * s} fill="url(#m18-nail)" />)}
      </svg>
      {/* stamped paper label, pasted on a little crooked */}
      <div style={{ position: "absolute", left: (w - lw) / 2, top: (h - lh) / 2, width: lw, height: lh, background: C.label, transform: `rotate(${-2 + random(`lt${goods}`) * 4}deg)`, boxShadow: `0 ${2 * s}px ${5 * s}px rgba(0,0,0,0.35)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: font, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 5 * s, border: `${2.5 * s}px solid ${C.red}`, opacity: 0.85 }} />
        <div style={{ fontSize: 36 * s, fontWeight: 700, color: C.paint, lineHeight: 1.15 }}>{goods}</div>
        <div style={{ fontSize: 20 * s, fontWeight: 600, color: C.red, letterSpacing: 2 * s }}>{sub}</div>
      </div>
    </div>
  );
};

// A manila price tag tied with string to a nail, swinging in on arrival and settling.
export const PriceTag = ({ nail, at, price, unit, note, len = 120, w = 300 }: { nail: [number, number]; at: number; price: string; unit: string; note: string; len?: number; w?: number }) => {
  const frame = useCurrentFrame();
  const { s } = useCrate();
  if (frame < at) return null;
  const t = frame - at;
  const swing = 24 * Math.exp(-t / 22) * Math.cos(t / 5.2) + 3 * Math.sin(frame / 30);
  const drop = interpolate(t, [0, 10], [-60, 0], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const L = len * s;
  const W = w * s;
  const H = 190 * s;
  return (
    <div style={{ position: "absolute", left: nail[0], top: nail[1], width: 0, height: 0 }}>
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `rotate(${swing}deg) translateY(${drop * s}px)` }}>
        <svg width={W + 40 * s} height={L + H + 40 * s} style={{ position: "absolute", left: -W / 2 - 20 * s, top: 0, overflow: "visible" }}>
          <path d={`M${W / 2 + 20 * s} 0 Q${W / 2 + 8 * s} ${L * 0.5} ${W / 2 + 20 * s} ${L + 26 * s}`} fill="none" stroke={C.string} strokeWidth={3 * s} />
          <path d={`M${W / 2 + 20 * s} 0 Q${W / 2 + 32 * s} ${L * 0.5} ${W / 2 + 20 * s} ${L + 26 * s}`} fill="none" stroke={C.string} strokeWidth={2.4 * s} opacity={0.8} />
          <g transform={`translate(${20 * s} ${L})`}>
            <path d={`M${W * 0.22} 0 H${W * 0.78} L${W} ${H * 0.2} V${H} H0 V${H * 0.2} Z`} fill="#000" opacity={0.35} transform={`translate(${8 * s} ${10 * s})`} style={{ filter: `blur(${6 * s}px)` }} />
            <path d={`M${W * 0.22} 0 H${W * 0.78} L${W} ${H * 0.2} V${H} H0 V${H * 0.2} Z`} fill={C.label} />
            <circle cx={W / 2} cy={26 * s} r={14 * s} fill="none" stroke="#c9b27a" strokeWidth={7 * s} />
            <circle cx={W / 2} cy={26 * s} r={8 * s} fill="#3a2412" />
            <text x={W / 2} y={92 * s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={50 * s} fill={C.red}>
              {price}
            </text>
            <text x={W / 2} y={128 * s} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={24 * s} fill={C.paint}>
              {unit}
            </text>
            <text x={W / 2} y={164 * s} textAnchor="middle" fontFamily={font} fontWeight={500} fontSize={19 * s} fill={C.paint} opacity={0.7}>
              {note}
            </text>
          </g>
        </svg>
      </div>
      <svg width={20 * s} height={20 * s} style={{ position: "absolute", left: -10 * s, top: -10 * s, overflow: "visible" }}>
        <circle cx={10 * s} cy={10 * s} r={8 * s} fill="url(#m18-nail)" />
      </svg>
    </div>
  );
};

// A round red rubber stamp ("ตัวอย่าง" on demos), slightly rotated and worn.
export const Stamp = ({ x, y, text, sub, k = 1, rot = -14 }: { x: number; y: number; text: string; sub: string; k?: number; rot?: number }) => {
  const { s } = useCrate();
  if (k <= 0) return null;
  const sc = 1.25 - 0.25 * k;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={0.85 * Math.min(1, k * 1.5)} filter="url(#m18-wear)">
      <circle r={86 * s} fill="none" stroke={C.red} strokeWidth={7 * s} />
      <circle r={70 * s} fill="none" stroke={C.red} strokeWidth={2.5 * s} />
      <text y={12 * s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={40 * s} fill={C.red}>
        {text}
      </text>
      <text y={46 * s} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={17 * s} fill={C.red} letterSpacing={2 * s}>
        {sub}
      </text>
      <text y={-34 * s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={20 * s} fill={C.red}>
        ★ ★ ★
      </text>
    </g>
  );
};
