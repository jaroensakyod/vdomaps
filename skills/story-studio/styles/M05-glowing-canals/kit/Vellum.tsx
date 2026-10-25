import { loadFont } from "@remotion/google-fonts/Itim";
import type { FeatureCollection, MultiLineString } from "geojson";
import type { ReactNode } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camForFeature, projectionFor, type Cam } from "../../../components/camera";
import { useMap } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { bbox } from "../../../components/Region";
import { useJson } from "../../../components/useJson";

// M05 light-table tracings: today's city as a dim, grey photo on a back-lit drafting table; each era of the
// waterways is traced in coloured pencil on its own sheet of tracing vellum. Sheets slide in slightly skewed,
// settle onto the registration marks and stack (each sheet lightens what is under it). Masking tape, a drafting
// ruler, a coloured pencil that draws the line, handwritten notes and a drafting title block. Font: Itim.
export const font = loadFont("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const GRAPHITE = "#2b2b30";
export const VELLUM = "#fbf3e2";
export const TAPE = "#e6d6a2";
export const TABLE = "#3a3a3c";
// coloured pencils per era
export const PENCIL: Record<string, string> = { river: "#2f6fb5", old: "#d9822b", cut: "#c8323a", thon: "#3c8d4a", rat: "#7a4fb0" };
export const ramp = (f: number, a: number, b: number, ease = Easing.inOut(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

export type Canal = { type: "Feature"; geometry: MultiLineString; properties: { name: string; era: string } };
export const useCanals = (file = "data/old-canals.json") => (useJson<FeatureCollection<MultiLineString, { name: string; era: string }>>(file)?.features ?? []) as Canal[];

export const V = {
  bangkok: bbox([[100.445, 13.715], [100.525, 13.785]]),
};
export const view = (f: Parameters<typeof camForFeature>[0], width: number, height: number, k = 1, lift = 0.0): Cam => {
  const c = camForFeature(f, width, height, 0.02);
  const scaled = { ...c, scale: c.scale * k };
  const p = projectionFor(scaled, width, height);
  const [lon, lat] = p.invert!([width / 2, height / 2 + height * lift])!;
  return { lon, lat, scale: scaled.scale };
};

// Shared SVG defs: vellum grain, pencil wobble + grain, soft sheet shadow.
export const VellumDefs = () => {
  const { s } = useMap();
  return (
    <defs>
      <filter id="m05-pencil" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={3} result="warp" />
        <feDisplacementMap in="SourceGraphic" in2="warp" scale={5 * s} xChannelSelector="R" yChannelSelector="G" result="wob" />
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={1} seed={7} result="grain" />
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.4 0 0 0 -0.55" result="mask" />
        <feComposite in="wob" in2="mask" operator="in" />
      </filter>
      <filter id="m05-paper" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves={2} seed={11} result="fib" />
        <feColorMatrix in="fib" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.52  0 0 0 0 0.46  0 0 0 0.6 -0.12" result="tint" />
        <feComposite in="tint" in2="SourceGraphic" operator="in" />
      </filter>
      <filter id="m05-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation={6 * s} />
      </filter>
    </defs>
  );
};

// The light table: grey, dim city photo with a warm back-light bloom and a vignette.
export const LightTable = ({ layers = ["world", "bkkhls"] }: { layers?: string[] }) => {
  const { width, height } = useMap();
  return (
    <g>
      <rect width={width} height={height} fill={TABLE} />
      <g style={{ filter: "grayscale(1) brightness(0.75) contrast(1.1)" }}>
        <Raster layers={layers.map((name) => ({ name }))} />
      </g>
      <defs>
        <radialGradient id="m05-bloom" cx="50%" cy="46%" r="60%">
          <stop offset="0" stopColor="#fff0c8" stopOpacity={0.5} />
          <stop offset="0.55" stopColor="#ffe8b8" stopOpacity={0.12} />
          <stop offset="1" stopColor="#000" stopOpacity={0.7} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill="url(#m05-bloom)" />
    </g>
  );
};

// Back-light glowing through the stack (screen), drawn above the sheets.
export const Glow = () => {
  const { width, height } = useMap();
  return (
    <g>
      <defs>
        <radialGradient id="m05-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor="#fff7e6" stopOpacity={0.3} />
          <stop offset="1" stopColor="#fff7e6" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="m05-amber" cx="50%" cy="45%" r="62%">
          <stop offset="0.25" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="0.7" stopColor="#f2902c" stopOpacity={0.8} />
          <stop offset="1" stopColor="#c0560f" stopOpacity={1} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill="url(#m05-glow)" style={{ mixBlendMode: "screen" }} />
      <rect width={width} height={height} fill="url(#m05-amber)" style={{ mixBlendMode: "multiply" }} />
    </g>
  );
};

// Registration mark: circle + cross in graphite.
export const Reg = ({ x, y, r, o = 0.8 }: { x: number; y: number; r: number; o?: number }) => (
  <g stroke={GRAPHITE} strokeWidth={r * 0.08} fill="none" opacity={o}>
    <circle cx={x} cy={y} r={r * 0.6} />
    <line x1={x - r} y1={y} x2={x + r} y2={y} />
    <line x1={x} y1={y - r} x2={x} y2={y + r} />
  </g>
);

// A strip of masking tape with torn ends, rotated around its centre.
export const Tape = ({ x, y, w, h, rot }: { x: number; y: number; w: number; h: number; rot: number }) => {
  const n = 6;
  const torn = (side: number) => Array.from({ length: n + 1 }, (_, i) => `${side + (i % 2 ? 0.035 : -0.035) * w * (side ? -1 : 1)},${(i / n) * h - h / 2}`).join(" ");
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <polygon points={`${torn(-w / 2)} ${torn(w / 2).split(" ").reverse().join(" ")}`} fill={TAPE} opacity={0.82} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.18} fill="#fff" opacity={0.12} />
    </g>
  );
};

// One sheet of vellum. k 0 → 1 slides it in from `from` with a skew `rot` that settles to 0 (registered).
// Children are drawn in map coordinates, so they move with the sheet and line up when it lands.
export const Sheet = ({ k, from, rot, inset, veil = 0.07, children, tape = true }: { k: number; from: "left" | "right" | "top" | "bottom"; rot: number; inset: number; veil?: number; children?: ReactNode; tape?: boolean }) => {
  const { width, height, s } = useMap();
  if (k <= 0) return null;
  const d = 1 - k;
  const tx = from === "left" ? -d * width * 1.1 : from === "right" ? d * width * 1.1 : 0;
  const ty = from === "top" ? -d * height : from === "bottom" ? d * height : 0;
  const m = inset * s;
  const x0 = m, y0 = m, w = width - 2 * m, h = height - 2 * m;
  const r = (d * rot + (k < 1 ? Math.sin(k * Math.PI) * rot * 0.15 : 0)).toFixed(3);
  return (
    <g transform={`translate(${tx},${ty}) rotate(${r} ${width / 2} ${height / 2})`}>
      <rect x={x0} y={y0} width={w} height={h} fill="#000" opacity={0.18} filter="url(#m05-shadow)" transform={`translate(${4 * s},${6 * s})`} />
      <rect x={x0} y={y0} width={w} height={h} fill={VELLUM} opacity={veil} />
      <rect x={x0} y={y0} width={w} height={h} fill="#fff" filter="url(#m05-paper)" opacity={0.16} />
      <rect x={x0} y={y0} width={w} height={h} fill="none" stroke="#fffaf0" strokeOpacity={0.7} strokeWidth={1.5 * s} />
      {[[x0 + 46 * s, y0 + 46 * s], [x0 + w - 46 * s, y0 + 46 * s], [x0 + 46 * s, y0 + h - 46 * s], [x0 + w - 46 * s, y0 + h - 46 * s]].map(([x, y], i) => <Reg key={i} x={x} y={y} r={22 * s} />)}
      <clipPath id={`m05-sheet-${inset}`}>
        <rect x={x0} y={y0} width={w} height={h} />
      </clipPath>
      <g clipPath={`url(#m05-sheet-${inset})`}>{children}</g>
      {tape && (
        <>
          <Tape x={x0 + 10 * s} y={y0 + 10 * s} w={150 * s} h={44 * s} rot={-40} />
          <Tape x={x0 + w - 10 * s} y={y0 + h - 10 * s} w={150 * s} h={44 * s} rot={-38} />
        </>
      )}
    </g>
  );
};

// A waterway in coloured pencil. River = dark edge + lighter fill stroke; canal = single line. draw 0 → 1.
export const PencilLine = ({ f, draw = 1, color, river = false, clip }: { f: Canal; draw?: number; color: string; river?: boolean; clip?: string }) => {
  const { path, projection, s } = useMap();
  if (draw <= 0) return null;
  const pxDeg = (projection.scale() * Math.PI) / 180;
  const w = Math.min(Math.max(pxDeg * 0.00028, 7 * s), 12 * s) * (river ? 2 : 1);
  const d = path(f) ?? "";
  const dash = draw < 1 ? { pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - draw } : {};
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#m05-pencil)" clipPath={clip ? `url(#${clip})` : undefined}>
      {river && <path d={d} stroke={color} strokeWidth={w + 4 * s} strokeOpacity={1} {...dash} />}
      <path d={d} stroke={river ? "#d6e6f6" : color} strokeWidth={river ? w - 2.5 * s : w} strokeOpacity={river ? 0.85 : 1} {...dash} />
      {!river && <path d={d} stroke={color} strokeWidth={w * 0.5} strokeOpacity={0.6} transform={`translate(${1.6 * s},${-1.2 * s})`} {...dash} />}
    </g>
  );
};

// Where the drawing head of a waterway is: point at fraction t along its longest line (screen px) + direction.
export const headOf = (f: Canal, t: number, projection: (p: [number, number]) => [number, number] | null): [number, number] | null => {
  const longest = f.geometry.coordinates.reduce((a, b) => (b.length > a.length ? b : a));
  const pts = longest.map((p) => projection(p as [number, number])).filter(Boolean) as [number, number][];
  if (pts.length < 2) return null;
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i]) {
      const u = seg[i] ? left / seg[i] : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
    }
    left -= seg[i];
  }
  return pts[pts.length - 1];
};

// A coloured pencil whose tip sits at (x, y); body in the pencil's colour, bare wood cone, graphite-coloured tip.
export const Pencil = ({ x, y, color, s, angle = -58, o = 1 }: { x: number; y: number; color: string; s: number; angle?: number; o?: number }) => {
  const L = 330 * s, W = 30 * s, cone = 58 * s;
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`} opacity={o}>
      <polygon points={`0,0 ${cone},${-W / 2} ${cone + L},${-W / 2} ${cone + L},${W / 2} ${cone},${W / 2}`} fill="#000" opacity={0.25} transform={`translate(${14 * s},${18 * s})`} />
      <polygon points={`${cone},${-W / 2} ${cone + L},${-W / 2} ${cone + L},${W / 2} ${cone},${W / 2}`} fill={color} />
      <rect x={cone} y={-W / 2} width={L} height={W / 3} fill="#fff" opacity={0.22} />
      <rect x={cone} y={W / 6} width={L} height={W / 3} fill="#000" opacity={0.15} />
      <polygon points={`0,0 ${cone},${-W / 2} ${cone},${W / 2}`} fill="#e3c393" />
      <polygon points={`0,0 ${cone * 0.34},${-W * 0.17} ${cone * 0.34},${W * 0.17}`} fill={color} />
      <rect x={cone + L - 18 * s} y={-W / 2} width={18 * s} height={W} fill="#c9c9c9" />
      <text x={cone + 60 * s} y={6 * s} fontSize={16 * s} fill="#fff" opacity={0.7} fontFamily={font}>2B</text>
    </g>
  );
};

// Drafting ruler: translucent smoky-yellow acrylic with cm ticks, lying at an angle across a corner.
export const Ruler = ({ x, y, len, angle, k }: { x: number; y: number; len: number; angle: number; k: number }) => {
  const { s } = useMap();
  if (k <= 0) return null;
  const h = 86 * s;
  const ticks = Math.floor(len / (18 * s));
  return (
    <g transform={`translate(${x - (1 - k) * 400 * s},${y}) rotate(${angle})`} opacity={k}>
      <rect x={0} y={0} width={len} height={h} fill="#000" opacity={0.18} transform={`translate(${8 * s},${12 * s})`} filter="url(#m05-shadow)" />
      <rect x={0} y={0} width={len} height={h} fill="#f3dd8a" opacity={0.42} stroke="#fff6cf" strokeOpacity={0.8} strokeWidth={2 * s} />
      {Array.from({ length: ticks }, (_, i) => (
        <line key={i} x1={i * 18 * s + 10 * s} y1={0} x2={i * 18 * s + 10 * s} y2={(i % 10 === 0 ? 30 : i % 5 === 0 ? 22 : 13) * s} stroke={GRAPHITE} strokeWidth={1.4 * s} opacity={0.85} />
      ))}
      {Array.from({ length: Math.floor(ticks / 10) + 1 }, (_, i) => (
        <text key={i} x={i * 180 * s + 10 * s} y={52 * s} textAnchor="middle" fontSize={20 * s} fill={GRAPHITE} fontFamily={font}>{i}</text>
      ))}
    </g>
  );
};

// Handwritten label on the sheet with a hand-drawn curved arrow to the water. at = lon/lat, dx/dy = text offset.
export const Note = ({ text, sub, at, start, color, dx = 0, dy = -60 }: { text: string; sub?: string; at: [number, number]; start: number; color: string; dx?: number; dy?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (frame < start) return null;
  const p = projection(at);
  if (!p) return null;
  const k = ramp(frame, start, start + 16, Easing.out(Easing.quad));
  const tx = p[0] + dx * s, ty = p[1] + dy * s;
  const ax = tx + (p[0] - tx) * 0.15, ay = ty + (dy < 0 ? 14 : -40) * s;
  const mx = (ax + p[0]) / 2 + (dx > 0 ? -30 : 30) * s, my = (ay + p[1]) / 2;
  const ang = Math.atan2(p[1] - my, p[0] - mx);
  const tip = (a: number) => `${p[0] - Math.cos(ang + a) * 16 * s},${p[1] - Math.sin(ang + a) * 16 * s}`;
  return (
    <g fontFamily={font} filter="url(#m05-pencil)">
      <path d={`M${ax},${ay} Q${mx},${my} ${p[0]},${p[1]}`} fill="none" stroke={GRAPHITE} strokeWidth={2.4 * s} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />
      {k > 0.9 && <polyline points={`${tip(0.45)} ${p[0]},${p[1]} ${tip(-0.45)}`} fill="none" stroke={GRAPHITE} strokeWidth={2.4 * s} strokeLinecap="round" />}
      <g style={{ clipPath: `inset(0 ${(1 - k) * 100}% 0 0)` }}>
        <text x={tx} y={ty} textAnchor="middle" fontSize={40 * s} fill={GRAPHITE}>{text}</text>
        <path d={`M${tx - text.length * 9 * s},${ty + 10 * s} q${text.length * 9 * s},${6 * s} ${text.length * 18 * s},${-2 * s}`} fill="none" stroke={color} strokeWidth={5 * s} strokeLinecap="round" />
        {sub && <text x={tx} y={ty + 46 * s} textAnchor="middle" fontSize={30 * s} fill={color}>{sub}</text>}
      </g>
    </g>
  );
};

// Loose hand-drawn ellipse (pencil) around a place, drawn on with an overshoot.
export const Circle = ({ at, rx, ry, k, color }: { at: [number, number]; rx: number; ry: number; k: number; color: string }) => {
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || k <= 0) return null;
  const pts = Array.from({ length: 49 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2.15 - 0.6;
    const wob = 1 + 0.05 * Math.sin(i * 1.7) + i * 0.0012;
    return `${p[0] + Math.cos(a) * rx * s * wob},${p[1] + Math.sin(a) * ry * s * wob}`;
  });
  return <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={5 * s} strokeLinecap="round" filter="url(#m05-pencil)" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />;
};

// Circular clip at lon/lat (radius in degrees) to colour only one stretch of a long river.
export const ClipZone = ({ id, at, r }: { id: string; at: [number, number]; r: number }) => {
  const { projection } = useMap();
  const p = projection(at);
  if (!p) return null;
  return (
    <defs>
      <clipPath id={id}>
        <circle cx={p[0]} cy={p[1]} r={(r * projection.scale() * Math.PI) / 180} />
      </clipPath>
    </defs>
  );
};

export const midOf = (f: Canal): [number, number] => {
  const longest = f.geometry.coordinates.reduce((a, b) => (b.length > a.length ? b : a));
  return longest[Math.floor(longest.length / 2)] as [number, number];
};

// Handwritten heading at the top: small tag, big head (written on left → right), optional stat double-underlined.
export type Head = { f: number; tag: string; head: string; stat?: string; label?: string; color: string };
export const HeadNote = ({ heads, to }: { heads: Head[]; to: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  const list = heads.filter((h) => frame >= h.f);
  if (!list.length || frame > to) return null;
  const h = list[list.length - 1];
  const k = ramp(frame, h.f, h.f + 22, Easing.out(Easing.quad));
  const ks = ramp(frame, h.f + 16, h.f + 34, Easing.out(Easing.quad));
  return (
    <div style={{ position: "absolute", left: vertical ? 90 * s : 110 * s, right: vertical ? 90 * s : undefined, top: vertical ? height * 0.075 : 110 * s, width: vertical ? undefined : 720 * s, fontFamily: font, color: GRAPHITE, lineHeight: 1.3, textShadow: `0 0 ${8 * s}px rgba(243,239,226,0.9), 0 0 ${2 * s}px rgba(243,239,226,0.9)` }}>
      <div style={{ fontSize: 34 * s, opacity: 0.85, clipPath: `inset(0 ${(1 - k) * 100}% 0 0)` }}>— {h.tag}</div>
      <div style={{ fontSize: 84 * s, color: h.color, clipPath: `inset(0 ${(1 - k) * 100}% 0 0)`, transform: "rotate(-1.2deg)", transformOrigin: "left" }}>{h.head}</div>
      {h.stat && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 * s, clipPath: `inset(0 ${(1 - ks) * 100}% 0 0)` }}>
          <span style={{ fontSize: 96 * s, color: GRAPHITE, borderBottom: `${4 * s}px double ${h.color}`, lineHeight: 1.1 }}>{h.stat}</span>
          <span style={{ fontSize: 32 * s }}>{h.label}</span>
        </div>
      )}
    </div>
  );
};

// Drafting title block on the top sheet: sheet n/N, subject, period, sources.
export const TitleBlock = ({ n, total, subject, period, f }: { n: number; total: number; subject: string; period: string; f: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  const k = ramp(frame, f, f + 14);
  const cell = { borderRight: `${1.5 * s}px solid ${GRAPHITE}`, padding: `${6 * s}px ${14 * s}px` };
  return (
    <div style={{ position: "absolute", right: vertical ? 90 * s : 110 * s, top: vertical ? height * 0.655 : undefined, bottom: vertical ? undefined : 120 * s, width: 560 * s, fontFamily: font, color: GRAPHITE, border: `${2.5 * s}px solid ${GRAPHITE}`, background: "rgba(243,239,226,0.72)", opacity: k, fontSize: 24 * s, lineHeight: 1.35 }}>
      <div style={{ display: "flex", borderBottom: `${1.5 * s}px solid ${GRAPHITE}` }}>
        <div style={{ ...cell, width: 150 * s }}>แผ่นที่<div style={{ fontSize: 40 * s }}>{String(n).padStart(2, "0")}/{String(total).padStart(2, "0")}</div></div>
        <div style={{ ...cell, borderRight: "none", flex: 1 }}>เรื่อง<div style={{ fontSize: 36 * s }}>{subject}</div></div>
      </div>
      <div style={{ ...cell, borderRight: "none", borderBottom: `${1.5 * s}px solid ${GRAPHITE}` }}>{period}</div>
      <div style={{ ...cell, borderRight: "none", fontSize: 19 * s, opacity: 0.8 }}>ลอกจาก NASA HLS · © OpenStreetMap · แนวโดยประมาณ</div>
    </div>
  );
};

// Kicker on a strip of masking tape at the top.
export const Kicker = ({ text }: { text: string }) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  return (
    <div style={{ position: "absolute", top: vertical ? 26 * s : 24 * s, left: vertical ? "50%" : undefined, right: vertical ? undefined : 90 * s, transform: `${vertical ? "translateX(-50%) " : ""}rotate(-1.5deg)`, background: "rgba(230,214,162,0.9)", padding: `${4 * s}px ${26 * s}px`, fontFamily: font, fontSize: 30 * s, color: GRAPHITE, boxShadow: `0 ${3 * s}px ${8 * s}px rgba(0,0,0,0.3)` }}>{text}</div>
  );
};
