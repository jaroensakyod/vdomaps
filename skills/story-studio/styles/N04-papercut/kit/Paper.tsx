import { loadFont as loadCharmonman } from "@remotion/google-fonts/Charmonman";
import { loadFont as loadAthiti } from "@remotion/google-fonts/Athiti";
import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// N04 paper: red paper-cuts pinned on a cream rice-paper wall. Every piece is one evenodd path — the outline plus
// the holes cut into it — so the wall shows through the cuts. Pieces lift off the wall at two heights (soft
// shadows). Each scene is a round window-cut that arrives folded in half and opens along its fold.
export const fonts = {
  title: loadCharmonman("normal", { weights: ["400", "700"], subsets: ["thai", "latin"] }).fontFamily,
  body: loadAthiti("normal", { weights: ["500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily,
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const P = {
  wall: "#f3e9d4",
  wall2: "#e8d9bb",
  red: "#c8201e",
  deep: "#97131a",
  gold: "#dba63c",
  orange: "#e8662a",
  ink: "#7e1016",
};

// ---- path helpers (all return closed subpaths; combine with spaces, draw with fillRule evenodd) ----
type Pt = [number, number];
const rot = ([x, y]: Pt, a: number, c: Pt): Pt => {
  const s = Math.sin(a), k = Math.cos(a);
  return [c[0] + (x - c[0]) * k - (y - c[1]) * s, c[1] + (x - c[0]) * s + (y - c[1]) * k];
};
const f = (n: number) => n.toFixed(1);
export const circ = (cx: number, cy: number, r: number) => `M${f(cx - r)} ${f(cy)} a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0 a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0 Z`;
// crescent ("moon tooth" cut), opening toward angle a (radians, 0 = down)
export const moon = (cx: number, cy: number, r: number, a = 0) => {
  const c: Pt = [cx, cy];
  const p1 = rot([cx - r, cy], a, c), p2 = rot([cx + r, cy], a, c), q = rot([cx, cy + r * 1.05], a, c);
  return `M${f(p1[0])} ${f(p1[1])} A${f(r)} ${f(r)} 0 0 0 ${f(p2[0])} ${f(p2[1])} Q${f(q[0])} ${f(q[1])} ${f(p1[0])} ${f(p1[1])} Z`;
};
export const diamond = (cx: number, cy: number, w: number, h: number) => `M${f(cx)} ${f(cy - h)} L${f(cx + w)} ${f(cy)} L${f(cx)} ${f(cy + h)} L${f(cx - w)} ${f(cy)} Z`;
export const slit = (x1: number, y1: number, x2: number, y2: number, w: number) => {
  const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2, dx = (Math.cos(a) * w) / 2, dy = (Math.sin(a) * w) / 2;
  return `M${f(x1 + dx)} ${f(y1 + dy)} L${f(x2 + dx)} ${f(y2 + dy)} L${f(x2 - dx)} ${f(y2 - dy)} L${f(x1 - dx)} ${f(y1 - dy)} Z`;
};
// a row of saw teeth cut between x0..x1 at y (teeth point up)
export const saw = (x0: number, x1: number, y: number, h: number, n: number) => {
  const w = (x1 - x0) / n;
  return Array.from({ length: n }, (_, i) => `M${f(x0 + i * w + w * 0.12)} ${f(y)} L${f(x0 + i * w + w / 2)} ${f(y - h)} L${f(x0 + (i + 1) * w - w * 0.12)} ${f(y)} Z`).join(" ");
};
export const rect = (x: number, y: number, w: number, h: number) => `M${f(x)} ${f(y)} h${f(w)} v${f(h)} h${f(-w)} Z`;
export const leaf = (cx: number, cy: number, l: number, a: number) => {
  const c: Pt = [cx, cy];
  const p1 = rot([cx, cy - l], a, c), p2 = rot([cx, cy + l], a, c), q1 = rot([cx + l * 0.45, cy], a, c), q2 = rot([cx - l * 0.45, cy], a, c);
  return `M${f(p1[0])} ${f(p1[1])} Q${f(q1[0])} ${f(q1[1])} ${f(p2[0])} ${f(p2[1])} Q${f(q2[0])} ${f(q2[1])} ${f(p1[0])} ${f(p1[1])} Z`;
};

// One cut piece. lift 1 = pinned flat, 2 = raised (bigger, softer shadow). Same colour pieces read as one sheet.
export const Cut = ({ d, color = P.red, lift = 1, opacity = 1 }: { d: string; color?: string; lift?: 1 | 2; opacity?: number }) => (
  <path d={d} fill={color} fillRule="evenodd" filter={`url(#n04-lift${lift})`} opacity={opacity} />
);

export const PaperDefs = () => (
  <defs>
    {[1, 2].map((l) => (
      <filter key={l} id={`n04-lift${l}`} x="-40%" y="-40%" width="180%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={3} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.02  0 0 0 0 0.04  0 0 0 0.22 0" result="nc" />
        <feComposite in="nc" in2="SourceAlpha" operator="in" result="grain" />
        <feMerge result="paper"><feMergeNode in="SourceGraphic" /><feMergeNode in="grain" /></feMerge>
        <feGaussianBlur in="SourceAlpha" stdDeviation={l === 1 ? 2.5 : 7} result="b" />
        <feOffset in="b" dx={l === 1 ? 3 : 9} dy={l === 1 ? 5 : 15} result="o" />
        <feFlood floodColor="#5a2614" floodOpacity={l === 1 ? 0.32 : 0.28} />
        <feComposite in2="o" operator="in" result="sh" />
        <feMerge><feMergeNode in="sh" /><feMergeNode in="paper" /></feMerge>
      </filter>
    ))}
  </defs>
);

// The wall: rice paper with long fibres, a soft lamp falloff.
export const Wall = () => {
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: P.wall }}>
      <svg width={W} height={H}>
        <defs>
          <filter id="n04-fibre" x="0" y="0" width="1" height="1">
            <feTurbulence type="fractalNoise" baseFrequency="0.004 0.06" numOctaves={3} seed={8} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.25  0 0 0 0.9 -0.42" />
          </filter>
          <filter id="n04-speck" x="0" y="0" width="1" height="1">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves={1} seed={2} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.38  0 0 0 0 0.25  0 0 0 4 -2.9" />
          </filter>
          <radialGradient id="n04-light" cx="0.45" cy="0.4" r="0.8">
            <stop offset="0" stopColor="#fffaf0" stopOpacity={0.5} />
            <stop offset="0.6" stopColor="#fffaf0" stopOpacity={0} />
            <stop offset="1" stopColor="#8a6a40" stopOpacity={0.28} />
          </radialGradient>
        </defs>
        <rect width={W} height={H} filter="url(#n04-fibre)" opacity={0.5} />
        <g transform={`rotate(90 ${W / 2} ${H / 2})`}>
          <rect x={(W - H) / 2} y={(H - W) / 2} width={H} height={W} filter="url(#n04-fibre)" opacity={0.25} />
        </g>
        <rect width={W} height={H} filter="url(#n04-speck)" opacity={0.5} />
        <rect width={W} height={H} fill="url(#n04-light)" />
      </svg>
    </AbsoluteFill>
  );
};

// Ring of the window-cut: scalloped outer edge, saw teeth on the inner edge, crescents between.
export const ringPath = (cx: number, cy: number, R: number, r: number) => {
  const n = 28;
  let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    const p0: Pt = [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R], p1: Pt = [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R];
    d += i === 0 ? `M${f(p0[0])} ${f(p0[1])} ` : "";
    d += `A${f(R * 0.12)} ${f(R * 0.12)} 0 0 1 ${f(p1[0])} ${f(p1[1])} `;
  }
  d += "Z ";
  // inner hole: a circle with saw teeth pointing inward
  const m = 64;
  for (let i = 0; i < m; i++) {
    const a = (i / m) * Math.PI * 2, b = ((i + 0.5) / m) * Math.PI * 2;
    const p: Pt = [cx + Math.cos(a) * r, cy + Math.sin(a) * r], q: Pt = [cx + Math.cos(b) * (r - R * 0.035), cy + Math.sin(b) * (r - R * 0.035)];
    d += `${i === 0 ? "M" : "L"}${f(p[0])} ${f(p[1])} L${f(q[0])} ${f(q[1])} `;
  }
  d += "Z ";
  // crescents and diamonds in the band
  const k = 20, mid = (R + r) / 2;
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2;
    const x = cx + Math.cos(a) * mid, y = cy + Math.sin(a) * mid;
    d += moon(x, y, (R - r) * 0.2, a - Math.PI / 2) + " ";
    const a2 = ((i + 0.5) / k) * Math.PI * 2;
    d += diamond(cx + Math.cos(a2) * mid, cy + Math.sin(a2) * mid, (R - r) * 0.06, (R - r) * 0.06) + " ";
  }
  return d;
};

// The round window-cut that holds one scene. `sym` is the symmetric part (cut on the fold): it arrives folded and
// opens; `children` (figures, sets) are pinned on afterwards. open: 0 folded → 1 open.
export const Window = ({ id, cx, cy, R, open, sym, children, alpha = 1 }: { id: string; cx: number; cy: number; R: number; open: number; sym: ReactNode; children?: ReactNode; alpha?: number }) => {
  const u = -Math.cos(Math.PI * open); // -1 folded on the left half → 1 opened
  const r = R * 0.84;
  return (
    <g opacity={alpha}>
      <defs>
        <clipPath id={`${id}-half`}><rect x={cx - R * 1.2} y={cy - R * 1.2} width={R * 1.2} height={R * 2.4} /></clipPath>
        <clipPath id={`${id}-in`}><circle cx={cx} cy={cy} r={r} /></clipPath>
      </defs>
      {[0, 1].map((side) => (
        <g key={side} transform={side ? `translate(${cx},0) scale(${-u},1) translate(${-cx},0)` : undefined} opacity={side && Math.abs(u) < 0.15 ? 0.6 : 1}>
          <g clipPath={`url(#${id}-half)`}>
            <g clipPath={`url(#${id}-in)`}>{sym}</g>
            <Cut d={ringPath(cx, cy, R, r)} lift={side && open < 1 ? 2 : 1} />
          </g>
        </g>
      ))}
      {open >= 1 && <g clipPath={`url(#${id}-in)`}>{children}</g>}
    </g>
  );
};

// Pinned-on piece: rises off the wall and settles (k 0 → 1).
export const Pin = ({ k, x, y, children }: { k: number; x: number; y: number; children: ReactNode }) => {
  if (k <= 0) return null;
  const e = Math.min(1, k);
  return <g opacity={Math.min(1, k * 3)} transform={`translate(${x},${y + (1 - e) * 40}) rotate(${(1 - e) * -6})`}>{children}</g>;
};

// ---- type ----
export const Kicker = ({ title }: { title: string }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const k = interpolate(frame, [4, 22], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: v ? 80 : 120, left: v ? 0 : 110, right: v ? 0 : undefined, width: v ? undefined : 640, textAlign: v ? "center" : "left", opacity: k }}>
      <div style={{ fontFamily: fonts.body, fontSize: v ? 34 : 32, fontWeight: 700, letterSpacing: 3, color: P.ink }}>N04 · ลายตัดกระดาษแดง</div>
      {/* the title is cut out of a red paper band with sawn edges */}
      <div style={{ filter: "drop-shadow(4px 7px 5px rgba(90,38,20,0.32))", marginTop: 14, display: v ? "block" : "inline-block" }}>
        <div style={{ background: P.red, clipPath: SAWN, padding: v ? "26px 0 34px" : "26px 60px 34px", fontFamily: fonts.title, fontSize: v ? 96 : 88, fontWeight: 700, color: P.wall, lineHeight: 1.5 }}>{title}</div>
      </div>
    </div>
  );
};

export const Line = ({ text, start, end }: { text: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (frame < start || frame >= end) return null;
  const v = height > width;
  const k = interpolate(frame, [start, start + 10, end - 8, end], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: v ? 1560 : 600, left: v ? 60 : 110, right: v ? 60 : undefined, width: v ? undefined : 640, textAlign: v ? "center" : "left", opacity: k, transform: `translateY(${(1 - k) * 10}px)`, fontFamily: fonts.title, fontWeight: 700, fontSize: v ? 62 : 60, lineHeight: 1.6, color: P.ink }}>
      {text}
    </div>
  );
};

// The honest label: a small red tag with the words cut out of it.
export const Label = () => {
  const { width, height } = useVideoConfig();
  const v = height > width;
  return (
    <div style={{ position: "absolute", top: v ? 1790 : 960, left: v ? 0 : 110, right: v ? 0 : undefined, textAlign: v ? "center" : "left" }}>
      <span style={{ display: "inline-block", background: P.red, color: P.wall, fontFamily: fonts.body, fontWeight: 700, fontSize: 28, padding: "4px 22px", borderRadius: 6, boxShadow: "3px 5px 5px rgba(90,38,20,0.3)" }}>ภาพประกอบ</span>
    </div>
  );
};

// Clip polygon for a paper band whose top and bottom edges are cut in saw teeth.
const SAWN = (() => {
  const n = 40;
  const top = Array.from({ length: n + 1 }, (_, i) => `${(i / n) * 100}% ${i % 2 ? 0 : 12}px`);
  const bot = Array.from({ length: n + 1 }, (_, i) => `${100 - (i / n) * 100}% calc(100% - ${i % 2 ? 0 : 12}px)`);
  return `polygon(${[...top, ...bot].join(",")})`;
})();
