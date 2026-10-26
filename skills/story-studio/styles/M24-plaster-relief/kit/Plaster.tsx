import { loadFont } from "@remotion/google-fonts/K2D";
import { useLayoutEffect, useRef } from "react";
import { Img, interpolate, staticFile } from "remotion";

// M24 plaster relief: a white plaster terrain model on a dark studio table, lit by one low lamp. The relief is
// shaded at render time from a small elevation grid (scripts/fetch-dem.mjs → raster/<name>-dem.json): raking
// diffuse light, cast shadows marched along the light, valleys a touch darker. The model plane is tilted with a CSS
// perspective; everything that stands on it (wooden blocks, pins with paper flags, the pointer stick, threads) is
// drawn in SVG with the same camera maths (`useModel().at(x, y, h)`), so it sits exactly on the plaster.

export const font = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const C = {
  studio: "#141516",
  table: "#26282a",
  plaster: "#f3f1ec",
  shade: "#8d929a", // cool grey in the shadows
  edge: "#d9d6cf",
  ink: "#3a3c40", // pencil-grey lettering on paper
  paper: "#fbfaf6",
  red: "#c4361f", // unit colour 1
  blue: "#23408f", // unit colour 2
  text: "#f4f2ee",
};

export type Dem = { bbox: [number, number, number, number]; gridWidth: number; gridHeight: number; grid: number[]; max: number };

// Camera: the plane (pw × ph units) is centred at screen (cx, cy), tilted back by `tilt` degrees, perspective P.
export type Model = { pw: number; ph: number; cx: number; cy: number; tilt: number; P: number; scale: number };
export const at = (m: Model, x: number, y: number, h = 0): [number, number] => {
  // x, y in plane units from the top-left corner; h up from the plaster surface
  const px = (x - m.pw / 2) * m.scale;
  const py = (y - m.ph / 2) * m.scale;
  const hh = h * m.scale;
  const a = (m.tilt * Math.PI) / 180;
  const y1 = py * Math.cos(a) - hh * Math.sin(a);
  const z1 = py * Math.sin(a) + hh * Math.cos(a);
  const k = m.P / (m.P - z1);
  return [m.cx + px * k, m.cy + y1 * k];
};
export const geo = (m: Model, dem: Dem, lon: number, lat: number): [number, number] => {
  const [w, s, e, n] = dem.bbox;
  return [((lon - w) / (e - w)) * m.pw, ((n - lat) / (n - s)) * m.ph];
};

// The relief, shaded on a canvas the size of the plane, then tilted with CSS so it matches `at()`.
export const Relief = ({ m, dem, azimuth = 300, elevation = 22, exaggeration = 3.2, res = 2, detail }: { m: Model; dem: Dem; detail?: string; azimuth?: number; elevation?: number; exaggeration?: number; res?: number }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const W = Math.round(m.pw * res);
  const H = Math.round(m.ph * res);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const gw = dem.gridWidth;
    const gh = dem.gridHeight;
    const g = dem.grid;
    // cell size in metres (approx, equirectangular)
    const [w, s, e, n] = dem.bbox;
    const cellX = (((e - w) * 111320 * Math.cos((((s + n) / 2) * Math.PI) / 180)) / gw) / exaggeration;
    const cellY = (((n - s) * 110540) / gh) / exaggeration;
    const hAt = (x: number, y: number) => g[Math.max(0, Math.min(gh - 1, y)) * gw + Math.max(0, Math.min(gw - 1, x))];
    // smooth the grid once (plaster is soft): 3×3 box
    const sm = new Float32Array(gw * gh);
    for (let y = 0; y < gh; y++)
      for (let x = 0; x < gw; x++) {
        let t = 0;
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) t += hAt(x + i, y + j);
        sm[y * gw + x] = t / 9;
      }
    const H2 = (x: number, y: number) => sm[Math.max(0, Math.min(gh - 1, y)) * gw + Math.max(0, Math.min(gw - 1, x))];
    const az = ((azimuth - 90) * Math.PI) / 180; // 0 = north, clockwise → screen angle
    const el = (elevation * Math.PI) / 180;
    const L = [Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el)];
    const shade = new Float32Array(gw * gh);
    for (let y = 0; y < gh; y++)
      for (let x = 0; x < gw; x++) {
        const dx = (H2(x + 1, y) - H2(x - 1, y)) / (2 * cellX);
        const dy = (H2(x, y + 1) - H2(x, y - 1)) / (2 * cellY);
        const nl = Math.hypot(dx, dy, 1);
        let d = (-dx * L[0] - dy * L[1] + L[2]) / nl;
        // cast shadow: march toward the lamp
        const h0 = H2(x, y);
        let shadow = 0;
        for (let k = 1; k < 40; k++) {
          const sx = Math.round(x + L[0] * k);
          const sy = Math.round(y + L[1] * k);
          if (sx < 0 || sy < 0 || sx >= gw || sy >= gh) break;
          const rise = H2(sx, sy) - h0;
          const need = k * Math.hypot(L[0] * cellX, L[1] * cellY) * Math.tan(el);
          if (rise > need) {
            shadow = Math.min(1, (rise - need) / 120 + 0.5);
            break;
          }
        }
        // valleys a little darker than ridges (cavity)
        let mean = 0;
        for (let j = -4; j <= 4; j += 2) for (let i = -4; i <= 4; i += 2) mean += H2(x + i, y + j);
        mean /= 25;
        const cav = Math.max(-0.12, Math.min(0.06, (h0 - mean) / 900));
        d = Math.max(0, d) * (1 - 0.55 * shadow);
        shade[y * gw + x] = Math.max(0, Math.min(1.15, 0.22 + 0.9 * d + cav * 1.4));
      }
    // flat reference: what a level surface gets, so the plain reads as the plaster white
    const flat = 0.22 + 0.9 * L[2];
    const img = ctx.createImageData(W, H);
    const P0 = [0xf3, 0xf1, 0xec];
    const S0 = [0x62, 0x68, 0x73];
    for (let py = 0; py < H; py++) {
      const gy = (py / H) * gh - 0.5;
      const y0 = Math.floor(gy);
      const fy = gy - y0;
      for (let px = 0; px < W; px++) {
        const gx = (px / W) * gw - 0.5;
        const x0 = Math.floor(gx);
        const fx = gx - x0;
        const S = (x: number, y: number) => shade[Math.max(0, Math.min(gh - 1, y)) * gw + Math.max(0, Math.min(gw - 1, x))];
        const v = S(x0, y0) * (1 - fx) * (1 - fy) + S(x0 + 1, y0) * fx * (1 - fy) + S(x0, y0 + 1) * (1 - fx) * fy + S(x0 + 1, y0 + 1) * fx * fy;
        const t = Math.max(0, Math.min(1, v / flat));
        const hi = Math.max(0, v / flat - 1) * 0.6;
        const o = (py * W + px) * 4;
        for (let c = 0; c < 3; c++) img.data[o + c] = Math.min(255, S0[c] + (P0[c] - S0[c]) * t + hi * 40);
        img.data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [dem, W, H, azimuth, elevation, exaggeration, m.pw, m.ph]);
  const a = m.tilt;
  return (
    <div
      style={{
        position: "absolute",
        left: m.cx - (m.pw * m.scale) / 2,
        top: m.cy - (m.ph * m.scale) / 2,
        width: m.pw * m.scale,
        height: m.ph * m.scale,
        transform: `perspective(${m.P}px) rotateX(${a}deg)`,
        transformOrigin: "50% 50%",
      }}
    >
      <canvas ref={ref} width={W} height={H} style={{ width: "100%", height: "100%", display: "block" }} />
      {/* fine detail from the hillshade of the same bbox, multiplied in lightly */}
      {detail && <Img src={staticFile(`raster/${detail}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "multiply", opacity: 0.4 }} />}
      {/* plaster grain */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <filter id="m24-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={9} />
          <feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.4  0 0 0 0 0.42  0 0 0 0.18 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#m24-grain)" />
      </svg>
    </div>
  );
};

// The slab: front and side faces of the model block and its shadow on the table (SVG, under the relief div).
export const Slab = ({ m, thick = 150 }: { m: Model; thick?: number }) => {
  const p = (x: number, y: number, h: number) => at(m, x, y, h).join(" ");
  const { pw, ph } = m;
  return (
    <g>
      <defs>
        <linearGradient id="m24-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9e6df" />
          <stop offset="1" stopColor="#b7b4ad" />
        </linearGradient>
        <filter id="m24-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>
      {/* contact shadow on the table */}
      <path d={`M${p(-10, 20, -thick)} L${p(pw + 40, 20, -thick)} L${p(pw + 50, ph + 60, -thick)} L${p(-10, ph + 60, -thick)} Z`} fill="#000" opacity={0.75} filter="url(#m24-soft)" />
      {/* front face */}
      <path d={`M${p(0, ph, 0)} L${p(pw, ph, 0)} L${p(pw, ph, -thick)} L${p(0, ph, -thick)} Z`} fill="url(#m24-front)" />
      {/* plaster casting layers on the cut face */}
      {[0.3, 0.55, 0.75].map((t) => (
        <path key={t} d={`M${p(0, ph, -thick * t)} L${p(pw, ph, -thick * t)}`} stroke="#a8a59e" strokeWidth={1} opacity={0.6} />
      ))}
      {/* right side face, in shade */}
      <path d={`M${p(pw, 0, 0)} L${p(pw, ph, 0)} L${p(pw, ph, -thick)} L${p(pw, 0, -thick)} Z`} fill="#8f8c86" />
      <path d={`M${p(0, ph, 0)} L${p(pw, ph, 0)}`} stroke="#ffffff" strokeWidth={2} opacity={0.7} />
    </g>
  );
};

// A painted wooden block (unit marker): top, front, side faces; `w × d × h` in plane units.
export const Block = ({ m, x, y, color, w = 30, d = 18, h = 12, k = 1, lift = 0 }: { m: Model; x: number; y: number; color: string; w?: number; d?: number; h?: number; k?: number; lift?: number }) => {
  if (k <= 0) return null;
  const P = (dx: number, dy: number, dh: number) => at(m, x + dx, y + dy, dh + lift).join(" ");
  const x0 = -w / 2, x1 = w / 2, y0 = -d / 2, y1 = d / 2;
  const [sx, sy] = at(m, x + 10, y + 7, 0);
  return (
    <g opacity={k}>
      {/* soft shadow cast away from the lamp */}
      <ellipse cx={sx} cy={sy} rx={w * m.scale * 0.75} ry={d * m.scale * 0.45} fill="#2c2f34" opacity={0.35 / (1 + lift * 0.05)} filter="url(#m24-blur)" />
      <path d={`M${P(x0, y1, 0)} L${P(x1, y1, 0)} L${P(x1, y1, h)} L${P(x0, y1, h)} Z`} fill={color} style={{ filter: "brightness(0.72)" }} />
      <path d={`M${P(x1, y0, 0)} L${P(x1, y1, 0)} L${P(x1, y1, h)} L${P(x1, y0, h)} Z`} fill={color} style={{ filter: "brightness(0.5)" }} />
      <path d={`M${P(x0, y0, h)} L${P(x1, y0, h)} L${P(x1, y1, h)} L${P(x0, y1, h)} Z`} fill={color} />
      <path d={`M${P(x0, y0, h)} L${P(x1, y0, h)}`} stroke="#fff" strokeWidth={1.2} opacity={0.45} />
    </g>
  );
};

// A pin with a paper flag. The flag faces the camera; text is pencil-grey.
export const Flag = ({ m, x, y, text, k = 1, side = 1, tall = 70 }: { m: Model; x: number; y: number; text: string; k?: number; side?: 1 | -1; tall?: number }) => {
  if (k <= 0) return null;
  const [bx, by] = at(m, x, y, 0);
  const [tx, ty] = at(m, x, y, tall * Math.min(1, k * 1.4));
  const fs = 25;
  const fw = text.length * fs * 0.56 + 26;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <line x1={bx + 12} y1={by + 5} x2={tx + 34} y2={ty + 30} stroke="#2a2c30" strokeWidth={2} opacity={0.25} />
      <line x1={bx} y1={by} x2={tx} y2={ty} stroke="#5d6066" strokeWidth={2.4} />
      <circle cx={bx} cy={by} r={2.5} fill="#2a2c30" />
      <g transform={`translate(${tx} ${ty})`}>
        <path d={side > 0 ? `M0 0 H${fw} l-8 ${19} l8 ${19} H0 Z` : `M0 0 H${-fw} l8 ${19} l-8 ${19} H0 Z`} fill={C.paper} stroke="#c9c6bf" strokeWidth={1} />
        <text x={side > 0 ? 10 : -10} y={27} fontFamily={font} fontSize={fs} fontWeight={600} fill={C.ink} textAnchor={side > 0 ? "start" : "end"}>
          {text}
        </text>
      </g>
      <circle cx={tx} cy={ty} r={4.5} fill="#e9e7e1" stroke="#6d7076" strokeWidth={1} />
    </g>
  );
};

// A thread pinned across the model (the plan): a coloured line slightly above the surface, drawn on with k.
export const Thread = ({ m, pts, color, k = 1, h = 3, dash }: { m: Model; pts: [number, number][]; color: string; k?: number; h?: number; dash?: string }) => {
  if (k <= 0) return null;
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * Math.min(1, k);
  const out: [number, number][] = [pts[0]];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const t = Math.min(1, left / seg[i]);
    out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]);
    left -= seg[i];
  }
  const d = out.map((p, i) => `${i ? "L" : "M"}${at(m, p[0], p[1], h).join(" ")}`).join(" ");
  const ds = out.map((p, i) => `${i ? "L" : "M"}${at(m, p[0] + 3, p[1] + 2, 0).join(" ")}`).join(" ");
  const end = out[out.length - 1];
  const prev = out[Math.max(0, out.length - 2)];
  const [ex, ey] = at(m, end[0], end[1], h);
  const [qx, qy] = at(m, prev[0], prev[1], h);
  const ang = Math.atan2(ey - qy, ex - qx);
  return (
    <g>
      <path d={ds} fill="none" stroke="#4a4e55" strokeWidth={3} opacity={0.22} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash} />
      {k >= 1 && out.length > 1 && (
        <path d={`M${ex} ${ey} l${Math.cos(ang + 2.6) * 20} ${Math.sin(ang + 2.6) * 20} M${ex} ${ey} l${Math.cos(ang - 2.6) * 20} ${Math.sin(ang - 2.6) * 20}`} stroke={color} strokeWidth={4.5} strokeLinecap="round" />
      )}
    </g>
  );
};

// The pointer stick: from off-screen bottom right to a tip just above the surface, with its shadow.
export const Pointer = ({ m, x, y, tap = 0, k = 1, from = [1240, 960] }: { m: Model; x: number; y: number; tap?: number; k?: number; from?: [number, number] }) => {
  if (k <= 0) return null;
  const [tx, ty] = at(m, x, y, 6 + tap * 10);
  const [sx, sy] = at(m, x + 14, y + 10, 0);
  const [fx, fy] = from;
  const ang = Math.atan2(fy - ty, fx - tx);
  const nx = -Math.sin(ang);
  const ny = Math.cos(ang);
  const w0 = 3;
  const w1 = 13;
  return (
    <g opacity={k}>
      <defs>
        <linearGradient id="m24-stick" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d8d5ce" />
          <stop offset="1" stopColor="#6e6b65" />
        </linearGradient>
      </defs>
      <path d={`M${sx} ${sy} L${fx + 120} ${fy + 40}`} stroke="#2c2f34" strokeWidth={10} opacity={0.18} filter="url(#m24-blur)" />
      <path d={`M${tx + nx * w0} ${ty + ny * w0} L${fx + nx * w1} ${fy + ny * w1} L${fx - nx * w1} ${fy - ny * w1} L${tx - nx * w0} ${ty - ny * w0} Z`} fill="#4a4c50" />
      <path d={`M${tx + nx * w0 * 0.4} ${ty + ny * w0 * 0.4} L${fx + nx * w1 * 0.4} ${fy + ny * w1 * 0.4}`} stroke="#9a9ca1" strokeWidth={2} opacity={0.8} />
      {/* white tip */}
      <path d={`M${tx} ${ty} L${tx + Math.cos(ang) * 26 + nx * 4} ${ty + Math.sin(ang) * 26 + ny * 4} L${tx + Math.cos(ang) * 26 - nx * 4} ${ty + Math.sin(ang) * 26 - ny * 4} Z`} fill="#f2f0ea" />
    </g>
  );
};

export const BlurDefs = () => (
  <defs>
    <filter id="m24-soft2" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="40" />
    </filter>
    <filter id="m24-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" />
    </filter>
  </defs>
);

// Path helper for the pointer: position along a polyline at k (0..1).
export const along = (pts: [number, number][], k: number): [number, number] => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * Math.max(0, Math.min(1, k));
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i]) {
      const t = left / seg[i];
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t];
    }
    left -= seg[i];
  }
  return pts[pts.length - 1];
};

export const ease = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
