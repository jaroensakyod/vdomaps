import { geoOrthographic, geoPath } from "d3-geo";
import type { ReactNode } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land110 from "world-atlas/land-110m.json";

// N13 airbrush cutaway kit: a science poster painted with an airbrush. Everything is smooth gradients, soft glows
// and blurred highlights, plus a fine grain on top. Subjects are shown as cut-open blocks or spheres with numbered
// callout lines and bold clean labels.

export const C = {
  night: "#1b1442", // poster ground, top
  dusk: "#5e2f6e", // poster ground, middle
  ember: "#ff8a3d", // magma glow, accents, callout numbers
  crust: "#c98b5a", // rock
  sky: "#8fd3e8", // cool highlights, wave rings
  paper: "#fff6e8", // labels
  ink: "#10162b",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- shared defs: gradients, glow, grain ----------
export const PosterDefs = () => (
  <defs>
    <linearGradient id="n13-ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#140f36" />
      <stop offset="0.3" stopColor="#2e2466" />
      <stop offset="0.58" stopColor={C.dusk} />
      <stop offset="0.8" stopColor="#b4504f" />
      <stop offset="1" stopColor="#f0a05a" />
    </linearGradient>
    <radialGradient id="n13-magma" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#ffd27a" stopOpacity="0.95" />
      <stop offset="0.35" stopColor={C.ember} stopOpacity="0.7" />
      <stop offset="1" stopColor="#8a2a3f" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="n13-hot" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#fff2c4" stopOpacity="1" />
      <stop offset="0.3" stopColor="#ffb25c" stopOpacity="0.85" />
      <stop offset="1" stopColor="#ff4d2e" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="n13-ocean" cx="0.36" cy="0.32" r="0.75">
      <stop offset="0" stopColor="#bfeaf5" />
      <stop offset="0.45" stopColor="#3f8fb8" />
      <stop offset="1" stopColor="#13284f" />
    </radialGradient>
    <radialGradient id="n13-spec" cx="0.32" cy="0.28" r="0.35">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
      <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="n13-core" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#fffbe0" />
      <stop offset="0.35" stopColor="#ffd25e" />
      <stop offset="0.55" stopColor="#ff9a3d" />
      <stop offset="0.85" stopColor="#d4472f" />
      <stop offset="1" stopColor="#8f2a33" />
    </radialGradient>
    <linearGradient id="n13-top" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#c6d98a" />
      <stop offset="0.5" stopColor="#7fa35a" />
      <stop offset="1" stopColor="#4d7445" />
    </linearGradient>
    <linearGradient id="n13-sheen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
      <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.35" />
      <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
    </linearGradient>
    <filter id="n13-soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18" />
    </filter>
    <filter id="n13-mist" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
    <filter id="n13-haze" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="42" />
    </filter>
    <filter id="n13-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.45" />
    </filter>
    <filter id="n13-speck" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="3" />
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.85  0 0 0 0 0.7  0 0 0 2.2 -1.15" />
    </filter>
  </defs>
);

// Poster ground: airbrushed night-to-ember gradient, a magma glow at the bottom, soft overspray clouds.
export const PosterGround = ({ w, h, glow = 1 }: { w: number; h: number; glow?: number }) => (
  <g>
    <rect width={w} height={h} fill="url(#n13-ground)" />
    <ellipse cx={w * 0.5} cy={h * 1.02} rx={w * 0.85} ry={h * 0.2} fill="url(#n13-magma)" opacity={0.75 * glow} />
    <rect width={w} height={h} filter="url(#n13-speck)" opacity={0.09} />
    {/* sprayed horizontal bands, like masking-tape airbrush stripes */}
    <rect x={0} y={h * 0.215} width={w} height={6} fill={C.ember} opacity={0.55} filter="url(#n13-mist)" />
    <rect x={0} y={h * 0.225} width={w} height={2} fill={C.sky} opacity={0.6} />
  </g>
);

export const Grain = ({ w, h, o = 0.13 }: { w: number; h: number; o?: number }) => <rect width={w} height={h} filter="url(#n13-grain)" opacity={o} style={{ mixBlendMode: "overlay" }} />;

// ---------- oblique block projection ----------
export type Proj = (x: number, z: number, d: number) => [number, number];
export const oblique = (cx: number, top: number, kx = 0.55, ky = 0.4): Proj => (x, z, d) => [cx + x + z * kx, top + d - z * ky];
const pts = (p: [number, number][]) => p.map((q) => q.map((v) => v.toFixed(1)).join(",")).join(" ");

// Rock strata (depth of each boundary as a function of x). The last band is the hot lower crust.
const LAYERS = [
  { d: (x: number) => 0, c: ["#8d6a3e", "#6f4f2e"] },
  { d: (x: number) => 46 + 8 * Math.sin(x / 70), c: ["#e3b878", "#c48f52"] },
  { d: (x: number) => 128 + 14 * Math.sin(x / 110 + 1), c: ["#b46f4f", "#8a4c3a"] },
  { d: (x: number) => 220 + 12 * Math.sin(x / 90 + 2), c: ["#9c8ea8", "#6e6386"] },
  { d: (x: number) => 320 + 16 * Math.sin(x / 120 + 3), c: ["#d35a3a", "#7d2632"] },
];

// One half of a cut-open block: front face (strata), top face (ground) and +x side face, shifted along z by `t`.
export const BlockHalf = ({ P, x0, x1, D, H, t, id, heat = 0, children }: { P: Proj; x0: number; x1: number; D: number; H: number; t: number; id: string; heat?: number; children?: ReactNode }) => {
  const N = 24;
  const xs = Array.from({ length: N + 1 }, (_, i) => x0 + ((x1 - x0) * i) / N);
  const band = (i: number, z: number, side = false) => {
    const a = LAYERS[i].d;
    const b = i + 1 < LAYERS.length ? LAYERS[i + 1].d : () => H;
    if (side) {
      const zs = Array.from({ length: 13 }, (_, k) => (D * k) / 12);
      return pts([...zs.map((zz) => P(x1, zz + t, a(x1 + zz * 0.3))), ...zs.reverse().map((zz) => P(x1, zz + t, Math.min(H, b(x1 + zz * 0.3))))]);
    }
    return pts([...xs.map((x) => P(x, z, a(x))), ...[...xs].reverse().map((x) => P(x, z, Math.min(H, b(x))))]);
  };
  const [fx, fy] = P((x0 + x1) / 2, t, H * 0.45);
  return (
    <g>
      <defs>
        <clipPath id={`n13-front-${id}`}>
          <polygon points={pts([P(x0, t, 0), P(x1, t, 0), P(x1, t, H), P(x0, t, H)])} />
        </clipPath>
        <clipPath id={`n13-side-${id}`}>
          <polygon points={pts([P(x1, t, 0), P(x1, t + D, 0), P(x1, t + D, H), P(x1, t, H)])} />
        </clipPath>
        <linearGradient id={`n13-shade-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="0.6" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {/* front face */}
      <g clipPath={`url(#n13-front-${id})`}>
        {LAYERS.map((l, i) => <polygon key={i} points={band(i, t)} fill={l.c[0]} />)}
        {/* airbrushed shading on each band: soft dark under every boundary */}
        {LAYERS.slice(1).map((l, i) => (
          <polyline key={i} points={pts(xs.map((x) => P(x, t, l.d(x) - 6)))} fill="none" stroke="#2a1420" strokeWidth={16} opacity={0.35} filter="url(#n13-mist)" />
        ))}
        {LAYERS.slice(1).map((l, i) => (
          <polyline key={`h${i}`} points={pts(xs.map((x) => P(x, t, l.d(x) + 8)))} fill="none" stroke="#fff3d6" strokeWidth={6} opacity={0.3} filter="url(#n13-mist)" />
        ))}
        <rect x={fx - 600} y={fy - 600} width={1200} height={1200} fill={`url(#n13-shade-${id})`} />
        <ellipse cx={fx} cy={P(0, t, H)[1]} rx={260} ry={90} fill="url(#n13-hot)" opacity={0.55} filter="url(#n13-mist)" />
        {heat > 0 && <ellipse cx={P(x0 < 0 ? x1 : x0, t, 0)[0]} cy={P(0, t, H * 0.55)[1]} rx={150} ry={260} fill="url(#n13-hot)" opacity={heat * 0.8} filter="url(#n13-soft)" />}
      </g>
      {/* side face (darker: turned away from the light) */}
      <g clipPath={`url(#n13-side-${id})`}>
        {LAYERS.map((l, i) => <polygon key={i} points={band(i, t, true)} fill={l.c[1]} />)}
        <polygon points={pts([P(x1, t, 0), P(x1, t + D, 0), P(x1, t + D, H), P(x1, t, H)])} fill="#140b24" opacity={0.25} />
      </g>
      {/* top face: ground */}
      <polygon points={pts([P(x0, t, 0), P(x1, t, 0), P(x1, t + D, 0), P(x0, t + D, 0)])} fill="url(#n13-top)" />
      <polygon points={pts([P(x0, t, 0), P(x1, t, 0), P(x1, t + D, 0), P(x0, t + D, 0)])} fill="url(#n13-sheen)" opacity={0.6} />
      {/* rim highlight along the front-top edge: the airbrush "edge light" */}
      <polyline points={pts([P(x0, t, 0), P(x1, t, 0), P(x1, t + D, 0)])} fill="none" stroke="#fffbe8" strokeWidth={5} opacity={0.75} filter="url(#n13-mist)" />
      <polyline points={pts([P(x0, t, 0), P(x1, t, 0), P(x1, t + D, 0)])} fill="none" stroke="#fffbe8" strokeWidth={1.6} opacity={0.9} />
      {children}
    </g>
  );
};

// A fence across the top face, perpendicular to the fault. `zAt(x)` gives each post's depth.
export const Fence = ({ P, x0, x1, zAt }: { P: Proj; x0: number; x1: number; zAt: (x: number) => number }) => {
  const n = 22;
  const xs = Array.from({ length: n + 1 }, (_, i) => x0 + 14 + ((x1 - x0 - 28) * i) / n);
  const base = xs.map((x) => P(x, zAt(x), 0));
  const rail = (h: number) => pts(base.map(([a, b]) => [a, b - h]));
  return (
    <g>
      <polyline points={pts(base.map(([a, b]) => [a + 6, b + 4]))} fill="none" stroke="#1d2a18" strokeWidth={8} opacity={0.35} filter="url(#n13-mist)" />
      <polyline points={rail(16)} fill="none" stroke="#fff3df" strokeWidth={3} />
      <polyline points={rail(28)} fill="none" stroke="#fff3df" strokeWidth={3} />
      {base.map(([a, b], i) => <line key={i} x1={a} y1={b} x2={a} y2={b - 34} stroke="#fffaf0" strokeWidth={4} strokeLinecap="round" />)}
    </g>
  );
};

// ---------- globe cutaway (a wedge removed to show crust, mantle and core) ----------
const LAND = feature(land110 as unknown as Topology, (land110 as unknown as Topology).objects.land as GeometryCollection);

export const Globe = ({ cx, cy, r, rot, k = 1 }: { cx: number; cy: number; r: number; rot: number; k?: number }) => {
  const proj = geoOrthographic().scale(r).translate([cx, cy]).rotate([-rot, -18]).clipAngle(90);
  const path = geoPath(proj);
  // wedge: the lower-right quarter is cut away
  const wedge = `M${cx},${cy} L${cx + r},${cy} A${r},${r} 0 0 1 ${cx},${cy + r} Z`;
  return (
    <g opacity={k}>
      <circle cx={cx} cy={cy} r={r * 1.35} fill="url(#n13-magma)" opacity={0.35} filter="url(#n13-haze)" />
      <circle cx={cx} cy={cy} r={r} fill="url(#n13-ocean)" />
      <path d={path(LAND) ?? ""} fill="#e6c98a" opacity={0.92} />
      <path d={path(LAND) ?? ""} fill="none" stroke="#fff4d8" strokeWidth={1.2} opacity={0.6} />
      <circle cx={cx} cy={cy} r={r} fill="url(#n13-spec)" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.sky} strokeWidth={10} opacity={0.4} filter="url(#n13-mist)" />
      {/* cut faces */}
      <path d={wedge} fill="#140b24" />
      <g>
        <clipPath id="n13-wedge">
          <path d={wedge} />
        </clipPath>
        <g clipPath="url(#n13-wedge)">
          <circle cx={cx} cy={cy} r={r} fill="#8a5a3a" />
          <circle cx={cx} cy={cy} r={r * 0.95} fill="url(#n13-core)" />
          <circle cx={cx} cy={cy} r={r * 0.55} fill="#ffd25e" opacity={0.85} />
          <circle cx={cx} cy={cy} r={r * 0.3} fill="#fffbe6" filter="url(#n13-mist)" />
          <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="#7d2632" strokeWidth={2} opacity={0.4} />
        </g>
      </g>
      <path d={`M${cx + r},${cy} L${cx},${cy} L${cx},${cy + r}`} fill="none" stroke="#fffbe8" strokeWidth={3} opacity={0.85} />
    </g>
  );
};

// ---------- numbered callout: dot on the subject, a leader line, a number disc and a bold label ----------
export const Callout = ({ n, at, to, title, sub, k, font, align = "left", below = false }: { n: number; at: [number, number]; to: [number, number]; title: string; sub?: string; k: number; font: string; align?: "left" | "right"; below?: boolean }) => {
  if (k <= 0) return null;
  const [ax, ay] = at;
  const [tx, ty] = to;
  const ex = ax + (tx - ax) * Math.min(1, k * 1.6);
  const ey = ay + (ty - ay) * Math.min(1, k * 1.6);
  const show = Math.max(0, Math.min(1, (k - 0.45) / 0.4));
  const dir = align === "left" ? 1 : -1;
  const lx = below ? -30 : dir * 46;
  const ly = below ? 78 : -2;
  return (
    <g>
      <circle cx={ax} cy={ay} r={16} fill={C.paper} opacity={0.35 * k} filter="url(#n13-mist)" />
      <circle cx={ax} cy={ay} r={7} fill={C.paper} />
      <line x1={ax} y1={ay} x2={ex} y2={ey} stroke={C.paper} strokeWidth={3} />
      <g opacity={show} transform={`translate(${tx},${ty})`}>
        <circle r={30} fill={C.ember} />
        <circle r={30} fill="none" stroke={C.paper} strokeWidth={3} />
        <circle cx={-8} cy={-10} r={12} fill="#ffffff" opacity={0.3} filter="url(#n13-mist)" />
        <text y={12} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={36} fill={C.ink}>{n}</text>
        <text x={lx} y={ly} textAnchor={align === "left" ? "start" : "end"} fontFamily={font} fontWeight={700} fontSize={40} fill={C.paper} stroke={C.ink} strokeWidth={8} paintOrder="stroke" strokeLinejoin="round">{title}</text>
        {sub && <text x={lx} y={ly + 40} textAnchor={align === "left" ? "start" : "end"} fontFamily={font} fontWeight={600} fontSize={28} fill={C.sky} stroke={C.ink} strokeWidth={6} paintOrder="stroke" strokeLinejoin="round">{sub}</text>}
      </g>
    </g>
  );
};

// Seismic waves: soft airbrushed rings spreading from a point (ellipses squashed for the oblique view).
export const Waves = ({ x, y, age, n = 4, squash = 0.62 }: { x: number; y: number; age: number; n?: number; squash?: number }) => {
  if (age < 0) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = age - i * 14;
        if (a <= 0) return null;
        const r = a * 7.5;
        const o = Math.max(0, 1 - a / 110);
        return (
          <g key={i} opacity={o}>
            <ellipse cx={x} cy={y} rx={r} ry={r * squash} fill="none" stroke={C.sky} strokeWidth={22} opacity={0.35} filter="url(#n13-mist)" />
            <ellipse cx={x} cy={y} rx={r} ry={r * squash} fill="none" stroke="#e9fbff" strokeWidth={3} />
          </g>
        );
      })}
    </g>
  );
};
