import { loadFont as loadPridi } from "@remotion/google-fonts/Pridi";
import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// N02 table: a wooden tabletop seen from a low camera, lit by one warm lamp from the back left. World units:
// x across the table, z = distance from the camera (1 = the near edge of the screen, ~6 = the far edge).
// `cam` turns (x, z) into screen px; one world unit at z = 1 is `U` px (0.3 × screen height). Everything is drawn
// once sharp and once blurred through a mask (tilt-shift: soft top and bottom, crisp middle band).
export const font = loadPridi("normal", { weights: ["400", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const hx = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const p = hx(a), q = hx(b);
  return "#" + p.map((v, i) => Math.round(v + (q[i] - v) * t).toString(16).padStart(2, "0")).join("");
};

// Enamel paint colours of the toys. Each one gets a glossy cylinder gradient `url(#n02-<name>)`.
export const PAINT: Record<string, string> = {
  blue: "#1f3f94",
  red: "#c4232c",
  white: "#ece5d2",
  black: "#1a1714",
  green: "#2f5a34",
  base: "#4b6b2e",
  gold: "#d8a436",
  skin: "#efbf9c",
  grey: "#8d8f92",
  brown: "#7a4a24",
  wood: "#b98a52",
  horse: "#6a3a1c",
  greycoat: "#8a8478",
  cream: "#efe2c2",
  char: "#2a201a",
};
export type Paint = (name: string) => string;
export const gloss: Paint = (n) => `url(#n02-${n})`;
export const shadowPaint: Paint = () => "#140a04";

export const ToyDefs = () => (
  <defs>
    {Object.entries(PAINT).map(([n, c]) => (
      <linearGradient key={n} id={`n02-${n}`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor={mix(c, "#000000", 0.45)} />
        <stop offset="0.22" stopColor={c} />
        <stop offset="0.34" stopColor={mix(c, "#fff6e0", 0.62)} />
        <stop offset="0.46" stopColor={c} />
        <stop offset="0.8" stopColor={mix(c, "#000000", 0.3)} />
        <stop offset="1" stopColor={mix(c, "#000000", 0.55)} />
      </linearGradient>
    ))}
    <radialGradient id="n02-cotton" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="0.6" stopColor="#ece6dc" />
      <stop offset="1" stopColor="#a89c8c" />
    </radialGradient>
    <radialGradient id="n02-cotton-dark" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stopColor="#8c8580" />
      <stop offset="1" stopColor="#3a3430" />
    </radialGradient>
  </defs>
);

export type Cam = { W: number; H: number; x: number; yh: number; U: number };
export const useCam = (x: number, tilt = 0): Cam => {
  const { width: W, height: H } = useVideoConfig();
  return { W, H, x, yh: H * (0.06 + tilt), U: H * (H > W ? 0.4 : 0.44) };
};
// screen position and px-per-unit of a point on the table
export const at = (c: Cam, x: number, z: number) => {
  const k = c.U / z;
  return { sx: c.W / 2 + (x - c.x) * k, sy: c.yh + (c.H - c.yh) / z, k };
};

// The tabletop: planks running away from the camera, grain, lamp pool, the dark room behind the far edge.
export const Tabletop = ({ c, far = 7 }: { c: Cam; far?: number }) => {
  const e = at(c, 0, far);
  const vx = c.W / 2 - c.x * (c.U / 60); // vanishing point shifts a little with the camera
  const p0 = Math.round(c.x / 0.9);
  const planks = Array.from({ length: 61 }, (_, i) => p0 + i - 30);
  return (
    <g>
      <defs>
        <filter id="n02-grain" x="0" y="0" width="1" height="1">
          <feTurbulence type="fractalNoise" baseFrequency="0.06 0.0025" numOctaves={3} seed={4} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.06  0 0 0 0 0.02  0 0 0 1.1 -0.35" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id="n02-lamp" cx="0.3" cy="0.38" r="0.75">
          <stop offset="0" stopColor="#ffd59a" stopOpacity={0.55} />
          <stop offset="0.45" stopColor="#ff9a4a" stopOpacity={0.14} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.62} />
        </radialGradient>
        <linearGradient id="n02-wood" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5a3418" />
          <stop offset="0.5" stopColor="#8a5428" />
          <stop offset="1" stopColor="#6a3c1c" />
        </linearGradient>
        <radialGradient id="n02-room" cx="0.25" cy="1" r="0.9">
          <stop offset="0" stopColor="#3a2414" />
          <stop offset="1" stopColor="#0c0705" />
        </radialGradient>
      </defs>
      {/* the room behind the table: dark wall with soft lamp bokeh */}
      <rect x={0} y={0} width={c.W} height={e.sy + 2} fill="url(#n02-room)" />
      {[0.12, 0.3, 0.62, 0.84].map((fx, i) => (
        <circle key={fx} cx={fx * c.W - c.x * 4} cy={e.sy * (0.35 + (i % 2) * 0.3)} r={c.H * (0.02 + (i % 3) * 0.012)} fill="#ffb862" opacity={0.18 + (i % 2) * 0.1} />
      ))}
      {/* table */}
      <rect x={0} y={e.sy} width={c.W} height={c.H - e.sy} fill="url(#n02-wood)" />
      <rect x={0} y={e.sy} width={c.W} height={c.H - e.sy} fill="#000" filter="url(#n02-grain)" />
      {planks.map((p) => {
        const px = p * 0.9; // plank seams every 0.9 units
        const a = at(c, px, far), b = at(c, px, 0.7);
        return <line key={p} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy} stroke="#2a1608" strokeWidth={Math.max(1, b.k * 0.012)} opacity={0.7} />;
      })}
      {planks.map((p) => {
        const px = p * 0.9 + 0.45;
        const a = at(c, px, far), b = at(c, px, 0.7);
        return <line key={`h${p}`} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy} stroke="#c89060" strokeWidth={Math.max(1, b.k * 0.006)} opacity={0.18} />;
      })}
      {/* far edge of the table: a bevel catching the lamp */}
      <rect x={0} y={e.sy - 3} width={c.W} height={6} fill="#c4844a" opacity={0.7} />
      <rect x={0} y={e.sy} width={c.W} height={c.H - e.sy} fill="url(#n02-lamp)" />
      {void vx}
    </g>
  );
};

// A toy placed on the table at (x, z): its own drawing is 100 units tall, feet at 0. Draws the hard lamp shadow
// first (same drawing, flattened and thrown forward-right), then the toy. `lift` raises it off the table (hops).
export const Place = ({ c, x, z, size = 1, lift = 0, tilt = 0, flip = false, draw }: { c: Cam; x: number; z: number; size?: number; lift?: number; tilt?: number; flip?: boolean; draw: (p: Paint) => ReactNode }) => {
  const { sx, sy, k } = at(c, x, z);
  const s = (k * size) / 100;
  const f = flip ? -1 : 1;
  const sh = Math.max(0.25, 1 - lift * 2.2);
  return (
    <g>
      <g transform={`translate(${sx + lift * 30 * s},${sy}) scale(${s}) matrix(${f * sh},0,${-0.75 * sh},${-0.32 * sh},0,0)`} opacity={0.5 * sh}>
        {draw(shadowPaint)}
      </g>
      <g transform={`translate(${sx},${sy - lift * 100 * s}) scale(${s}) rotate(${tilt}) scale(${f},1)`}>{draw(gloss)}</g>
    </g>
  );
};

// Hop motion: a toy pushed forward by hand in small jumps. Returns the distance moved, lift and tilt.
export const hop = (t: number, period: number, step: number, phase = 0) => {
  const tt = Math.max(0, t + phase);
  const n = Math.floor(tt / period);
  const p = (tt % period) / period;
  const air = Math.min(1, p / 0.3);
  const k = p < 0.3 ? air : 1;
  const lift = p < 0.3 ? Math.sin(air * Math.PI) * 0.09 : 0;
  const wob = p >= 0.3 && p < 0.55 ? Math.sin(((p - 0.3) / 0.25) * Math.PI * 2) * 3 * (1 - (p - 0.3) / 0.25) : 0;
  return { d: (n + k) * step, lift, tilt: p < 0.3 ? -7 * Math.sin(air * Math.PI) : wob };
};

// Cotton-wool puff (cannon smoke, explosions, smoke from a burnt house).
export const Cotton = ({ x, y, r, k = 1, seed = 0, dark = false }: { x: number; y: number; r: number; k?: number; seed?: number; dark?: boolean }) => {
  if (k <= 0) return null;
  const blobs = Array.from({ length: 7 }, (_, i) => {
    const a = seed * 1.7 + i * 2.39;
    return { dx: Math.cos(a) * r * 0.55 * (0.4 + (i % 3) * 0.3), dy: Math.sin(a) * r * 0.35 - i * r * 0.08, rr: r * (0.38 + ((i * 7 + seed) % 4) * 0.08) };
  });
  return (
    <g opacity={Math.min(1, k * 1.5)} transform={`translate(${x},${y}) scale(${0.4 + 0.6 * Math.min(1, k * 1.4)}) translate(${-x},${-y})`}>
      {blobs.map((b, i) => <circle key={i} cx={x + b.dx} cy={y + b.dy} r={b.rr} fill={dark ? "url(#n02-cotton-dark)" : "url(#n02-cotton)"} />)}
    </g>
  );
};

// The whole frame: scene drawn sharp + blurred copy masked to the top and bottom (tilt-shift), lamp vignette.
export const TiltShift = ({ id, children }: { id: string; children: ReactNode }) => {
  const { width: W, height: H } = useVideoConfig();
  const v = H > W;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <ToyDefs />
      <defs>
        <filter id={`${id}-blur`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={H * 0.0045} />
        </filter>
        <linearGradient id={`${id}-mg`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset={v ? 0.25 : 0.22} stopColor="#fff" />
          <stop offset={v ? 0.39 : 0.4} stopColor="#000" />
          <stop offset={v ? 0.74 : 0.7} stopColor="#000" />
          <stop offset={v ? 0.9 : 0.92} stopColor="#fff" />
        </linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <rect width={W} height={H} fill={`url(#${id}-mg)`} />
        </mask>
        <radialGradient id={`${id}-vig`} cx="0.42" cy="0.55" r="0.8">
          <stop offset="0.55" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.6} />
        </radialGradient>
      </defs>
      <g id={`${id}-scene`}>{children}</g>
      <use href={`#${id}-scene`} filter={`url(#${id}-blur)`} mask={`url(#${id}-mask)`} />
      <rect width={W} height={H} fill={`url(#${id}-vig)`} />
    </svg>
  );
};

// ---- type: one serif family, gold and cream, no cards ----
export const GOLD = "#e3b452";
export const CREAM = "#f6ead0";

export type Head = { f: number; tag: string; head: string; stat?: string; label?: string };
export const Titles = ({ id, year, heads, end }: { id: string; year: string; heads: Head[]; end: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const s = v ? 1 : height / 1080;
  const cur = [...heads].reverse().find((h) => frame >= h.f) ?? heads[0];
  const k = interpolate(frame, [cur.f, cur.f + 16], [0, 1], clamp);
  const out = interpolate(frame, [end - 10, end], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ fontFamily: font, color: CREAM, opacity: out, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: v ? 96 : 44 * s, left: v ? 70 : 80 * s, right: v ? 70 : undefined, textShadow: "0 3px 14px rgba(0,0,0,0.75)" }}>
        <div style={{ fontSize: 30 * s * (v ? 1 : 0.9), fontWeight: 600, letterSpacing: 4, color: GOLD }}>
          {id} · ทหารดีบุกบนโต๊ะ <span style={{ opacity: 0.7, marginLeft: 14 }}>— {year}</span>
        </div>
        <div style={{ width: 120 * s, height: 2, background: GOLD, margin: `${14 * s}px 0`, opacity: 0.8 }} />
        <div style={{ opacity: k, transform: `translateY(${(1 - k) * 16}px)` }}>
          <div style={{ fontSize: 30 * s, fontWeight: 400, fontStyle: "italic", opacity: 0.85 }}>{cur.tag}</div>
          <div style={{ fontSize: (v ? 74 : 64) * s, fontWeight: 700, lineHeight: 1.25 }}>{cur.head}</div>
          {cur.stat && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 18 * s, marginTop: 4 * s }}>
              <span style={{ fontSize: (v ? 118 : 96) * s, fontWeight: 700, color: GOLD, lineHeight: 1.05, letterSpacing: 2 }}>{cur.stat}</span>
              <span style={{ fontSize: 36 * s, fontWeight: 600 }}>{cur.label}</span>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// A cream shop tag on a string: the honest label (a model, not a picture of the event).
export const Tag = ({ text = "ภาพจำลอง" }: { text?: string }) => {
  const { width, height } = useVideoConfig();
  const v = height > width;
  const s = v ? 1 : height / 1080;
  const sway = Math.sin(useCurrentFrame() / 22) * 2;
  return (
    <div style={{ position: "absolute", right: v ? 70 : 80 * s, top: v ? 1290 : 640 * s, transform: `rotate(${-6 + sway}deg)`, transformOrigin: "100% 0", fontFamily: font }}>
      <div style={{ background: "#efe2c2", color: "#5a2a14", fontSize: 28 * s, fontWeight: 600, padding: `${6 * s}px ${18 * s}px ${6 * s}px ${34 * s}px`, borderRadius: 4, clipPath: "polygon(14% 0,100% 0,100% 100%,14% 100%,0 50%)", boxShadow: "6px 8px 0 rgba(0,0,0,0.35)" }}>
        {text}
      </div>
    </div>
  );
};

// The spoken line at the bottom, over the blurred near edge of the table.
export const Line = ({ text, start, end }: { text: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (frame < start || frame >= end) return null;
  const v = height > width;
  const s = v ? 1 : height / 1080;
  const k = interpolate(frame, [start, start + 8, end - 8, end], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: v ? 230 : 70 * s, pointerEvents: "none" }}>
      <div style={{ opacity: k, fontFamily: font, fontWeight: 600, fontSize: (v ? 58 : 50) * s, color: CREAM, textAlign: "center", maxWidth: v ? 940 : 1500 * s, lineHeight: 1.35, textShadow: "0 2px 0 #2a1608, 0 4px 18px rgba(0,0,0,0.9)" }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};
