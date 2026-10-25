import { loadFont } from "@remotion/google-fonts/Taviraj";
import { loadFont as loadHand } from "@remotion/google-fonts/Sriracha";
import type { CSSProperties, ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Broadsheet-newspaper evidence pieces: grey newsprint with fibres and a fold, a masthead with double rules, serif
// headlines, multi-column body text set as grey lines, halftone "photo" boxes drawn in code, and the evidence as
// clipped columns with scissor-cut edges that slide onto the page and stack. Annotations are red pencil: rings,
// underlines, ticks and scrawled notes that draw themselves on the cue frame.
export const font = loadFont("normal", { weights: ["400", "600", "800"], subsets: ["thai", "latin"] }).fontFamily;
export const hand = loadHand("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
export const N = { paper: "#b9b8b0", clip: "#e6e5df", clipWarm: "#e9e3d3", ink: "#1d1b18", grey: "#8a867d", line: "#8c887f", red: "#c62a1f", dot: "#3a3733" } as const;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const rnd = (i: number) => {
  const x = Math.sin(i * 78.233 + 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
// Cue frames in spoken order: each at least `gap` after the previous and inside [lo, hi].
export const mono = (frames: number[], gap = 12, lo = -1e9, hi = 1e9) => {
  const out: number[] = [];
  for (const f of frames) out.push(Math.min(hi, Math.max(f, lo, out.length ? out[out.length - 1] + gap : -1e9)));
  return out;
};
export const usePop = (f: number, damping = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame < f ? 0 : spring({ frame: frame - f, fps, config: { damping } });
};

// Page geometry for 9:16 and 16:9: masthead, headline block, clipping zone, caption line.
export const useLay = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const wide = width > height;
  const zone = wide ? { x: 800 * s, y: 196 * s, w: width - 860 * s, h: 640 * s } : { x: 60 * s, y: 640 * s, w: width - 120 * s, h: 700 * s };
  const head = wide ? { x: 60 * s, y: 200 * s, w: 700 * s } : { x: 60 * s, y: 262 * s, w: width - 120 * s };
  const cap = wide ? { x: 60 * s, y: 870 * s, w: width - 120 * s } : { x: 60 * s, y: 1392 * s, w: width - 120 * s };
  return { s, wide, width, height, zone, head, cap };
};

// ---------- red pencil ----------
const wobble = (cx: number, cy: number, rx: number, ry: number, seed: number, turns = 1.18) => {
  const n = 46;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const t = (i / n) * Math.PI * 2 * turns - 0.6;
    const r = 1 + (rnd(seed + i) - 0.5) * 0.07 + (i / n) * 0.06;
    return [cx + Math.cos(t) * rx * r, cy + Math.sin(t) * ry * r];
  });
  return "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L");
};
const Pencil = ({ d, k, w, color = N.red }: { d: string; k: number; w: number; color?: string }) =>
  k <= 0 ? null : <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} filter="url(#pencilFx)" />;

// Filters for the red pencil and the newsprint; once per page (inside any <svg>).
export const PressDefs = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id="pencilFx" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves={1} seed={6} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 2.3" result="m" />
        <feComposite in="SourceGraphic" in2="m" operator="in" />
      </filter>
      <pattern id="dotsBig" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx={3.5} cy={3.5} r={2.7} fill={N.dot} /></pattern>
      <pattern id="dotsMid" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx={3.5} cy={3.5} r={1.8} fill={N.dot} /></pattern>
      <pattern id="dotsSmall" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx={3.5} cy={3.5} r={0.9} fill={N.dot} /></pattern>
    </defs>
  </svg>
);

// A ring drawn in red pencil around a box (local px), over `dur` frames from f.
export const Ring = ({ w, h, f, seed = 1, dur = 12, thick = 5, style }: { w: number; h: number; f: number; seed?: number; dur?: number; thick?: number; style?: CSSProperties }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [f, f + dur], [0, 1], clamp);
  return (
    <svg width={w * 1.3} height={h * 1.4} style={{ position: "absolute", overflow: "visible", pointerEvents: "none", ...style }}>
      <Pencil d={wobble(w * 0.65, h * 0.7, w * 0.6, h * 0.62, seed)} k={k} w={thick} />
    </svg>
  );
};
// Hand underline (one or two strokes).
export const Underline = ({ w, f, double = false, thick = 5, style }: { w: number; f: number; double?: boolean; thick?: number; style?: CSSProperties }) => {
  const frame = useCurrentFrame();
  const k1 = interpolate(frame, [f, f + 10], [0, 1], clamp);
  const k2 = interpolate(frame, [f + 8, f + 18], [0, 1], clamp);
  return (
    <svg width={w} height={30} style={{ position: "absolute", overflow: "visible", pointerEvents: "none", ...style }}>
      <Pencil d={`M2 8 Q${w * 0.4} 2 ${w * 0.7} 9 T${w - 2} 6`} k={k1} w={thick} />
      {double && <Pencil d={`M${w * 0.06} 20 Q${w * 0.5} 14 ${w * 0.96} 19`} k={k2} w={thick * 0.8} />}
    </svg>
  );
};
export const Tick = ({ size, f, style }: { size: number; f: number; style?: CSSProperties }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [f, f + 9], [0, 1], clamp);
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{ position: "absolute", overflow: "visible", ...style }}>
      <Pencil d="M6 32 Q14 38 22 50 Q34 22 56 6" k={k} w={7} />
    </svg>
  );
};
// A scrawled note in red pencil handwriting, written left to right.
export const Scrawl = ({ text, f, size, rot = -6, style }: { text: string; f: number; size: number; rot?: number; style?: CSSProperties }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [f, f + 14], [0, 1], clamp);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", fontFamily: hand, fontSize: size, color: N.red, whiteSpace: "nowrap", transform: `rotate(${rot}deg)`, clipPath: `inset(-20% ${(1 - k) * 100}% -20% -5%)`, opacity: 0.92, ...style }}>{text}</div>
  );
};

// ---------- halftone "photo" drawn in code ----------
export type Picture = "palace" | "boat" | "temple" | "letter" | "court" | "ship";
export const Halftone = ({ w, h, kind, seed = 0, dark = false }: { w: number; h: number; kind: Picture; seed?: number; dark?: boolean }) => {
  const shape = (() => {
    switch (kind) {
      case "palace":
        return `M0 ${h} L0 ${h * 0.7} L${w * 0.15} ${h * 0.7} L${w * 0.3} ${h * 0.45} L${w * 0.4} ${h * 0.45} L${w * 0.5} ${h * 0.12} L${w * 0.6} ${h * 0.45} L${w * 0.7} ${h * 0.45} L${w * 0.85} ${h * 0.7} L${w} ${h * 0.7} L${w} ${h} Z`;
      case "temple":
        return `M0 ${h} L0 ${h * 0.78} L${w * 0.38} ${h * 0.78} L${w * 0.42} ${h * 0.5} L${w * 0.47} ${h * 0.35} L${w * 0.5} ${h * 0.06} L${w * 0.53} ${h * 0.35} L${w * 0.58} ${h * 0.5} L${w * 0.62} ${h * 0.78} L${w} ${h * 0.78} L${w} ${h} Z`;
      case "boat":
      case "ship":
        return `M0 ${h} L0 ${h * 0.8} L${w * 0.15} ${h * 0.8} L${w * 0.22} ${h * 0.66} L${w * 0.45} ${h * 0.66} L${w * 0.47} ${h * 0.14} L${w * 0.5} ${h * 0.14} L${w * 0.66} ${h * 0.6} L${w * 0.5} ${h * 0.62} L${w * 0.52} ${h * 0.66} L${w * 0.8} ${h * 0.66} L${w * 0.86} ${h * 0.8} L${w} ${h * 0.8} L${w} ${h} Z`;
      case "letter":
        return `M${w * 0.18} ${h * 0.12} L${w * 0.82} ${h * 0.18} L${w * 0.78} ${h * 0.92} L${w * 0.14} ${h * 0.86} Z`;
      default:
        return `M0 ${h} L0 ${h * 0.5} L${w * 0.5} ${h * 0.2} L${w} ${h * 0.5} L${w} ${h} Z`;
    }
  })();
  return (
    <svg width={w} height={h} style={{ display: "block", background: dark ? "#77746d" : "#cfcac0" }}>
      <rect width={w} height={h} fill="url(#dotsSmall)" />
      <rect y={h * 0.35} width={w} height={h * 0.65} fill="url(#dotsMid)" opacity={0.8} />
      {kind === "letter" ? (
        <g>
          <path d={shape} fill="#e2ded3" />
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={w * 0.24} x2={w * (0.7 - rnd(i + seed) * 0.15)} y1={h * (0.26 + i * 0.09)} y2={h * (0.27 + i * 0.09)} stroke={N.dot} strokeWidth={2.4} strokeDasharray="5 3" />)}
        </g>
      ) : (
        <path d={shape} fill="url(#dotsBig)" />
      )}
      {(kind === "boat" || kind === "ship") && <rect y={h * 0.8} width={w} height={h * 0.2} fill="url(#dotsMid)" />}
      <rect width={w} height={h} fill="none" stroke={N.ink} strokeWidth={1.5} />
    </svg>
  );
};

// ---------- the page ----------
// Faux body text: columns of grey lines with paragraph breaks, sub-heads and small halftone boxes.
const Columns = ({ x, y, w, h, cols, s, seed }: { x: number; y: number; w: number; h: number; cols: number; s: number; seed: number }) => {
  const gap = 26 * s;
  const cw = (w - gap * (cols - 1)) / cols;
  const lh = 21 * s;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: x, top: y }}>
      {Array.from({ length: cols }, (_, c) => {
        const out: ReactNode[] = [];
        let yy = 0;
        let i = 0;
        while (yy < h - lh) {
          const r = rnd(seed + c * 97 + i);
          if (r < 0.06 && yy < h - 120 * s) {
            out.push(<rect key={`p${i}`} x={c * (cw + gap)} y={yy + 4 * s} width={cw} height={90 * s} fill="url(#dotsMid)" opacity={0.5} />);
            yy += 104 * s;
          } else if (r < 0.12) {
            out.push(<rect key={`h${i}`} x={c * (cw + gap)} y={yy + 2 * s} width={cw * (0.55 + r * 2)} height={13 * s} fill={N.ink} opacity={0.42} />);
            yy += lh * 1.4;
          } else {
            const end = r > 0.9;
            out.push(<rect key={`l${i}`} x={c * (cw + gap)} y={yy + 6 * s} width={cw * (end ? 0.45 + r * 0.3 : 0.94 + r * 0.06)} height={7 * s} fill={N.line} opacity={0.55} />);
            yy += end ? lh * 1.5 : lh;
          }
          i++;
        }
        return <g key={c}>{out}{c > 0 && <line x1={c * (cw + gap) - gap / 2} x2={c * (cw + gap) - gap / 2} y1={0} y2={h} stroke={N.grey} strokeWidth={1.2} />}</g>;
      })}
    </svg>
  );
};

// Newsprint + fibres + a horizontal fold, masthead, body columns. `dateline` = left / right strings under the title.
export const NewsPage = ({ title, kicker, dateline, children }: { title: string; kicker: string; dateline: string; children: ReactNode }) => {
  const { s, wide, width, height } = useLay();
  const mh = (wide ? 150 : 228) * s;
  const pad = 40 * s;
  return (
    <div style={{ position: "absolute", inset: 0, background: N.paper, overflow: "hidden" }}>
      <PressDefs />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <filter id="newsprint" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={8} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.28  0 0 0 0 0.24  0 0 0 0.55 -0.18" />
        </filter>
        <radialGradient id="aged" cx="50%" cy="45%" r="75%">
          <stop offset="0.6" stopColor="#b9b8b0" stopOpacity={0} />
          <stop offset="1" stopColor="#97938a" stopOpacity={0.6} />
        </radialGradient>
        <rect width={width} height={height} fill="url(#aged)" />
        <rect width={width} height={height} filter="url(#newsprint)" />
      </svg>
      {/* body columns under everything */}
      {wide ? (
        <>
          <Columns x={pad} y={mh + 560 * s} w={700 * s} h={height - mh - 560 * s - 130 * s} cols={2} s={s} seed={3} />
          <Columns x={800 * s} y={mh + 26 * s} w={width - 840 * s} h={height - mh - 160 * s} cols={4} s={s} seed={9} />
        </>
      ) : (
        <>
          <Columns x={pad} y={mh + 360 * s} w={width - pad * 2} h={760 * s} cols={3} s={s} seed={5} />
          <Columns x={pad} y={1570 * s} w={width - pad * 2} h={250 * s} cols={3} s={s} seed={11} />
          <div style={{ position: "absolute", left: pad, top: 1576 * s, width: 660 * s, height: 236 * s, background: N.paper }}>
            <Halftone w={660 * s} h={200 * s} kind="palace" seed={2} dark />
            <div style={{ fontFamily: font, fontSize: 18 * s, fontStyle: "italic", color: N.ink, marginTop: 4 * s }}>ภาพประกอบ · วาดด้วยโค้ด</div>
          </div>
        </>
      )}
      {/* masthead */}
      <div style={{ position: "absolute", left: pad, right: pad, top: (wide ? 18 : 40) * s, fontFamily: font, color: N.ink, textAlign: "center" }}>
        <div style={{ borderTop: `${3 * s}px solid ${N.ink}`, borderBottom: `${1 * s}px solid ${N.ink}`, height: 5 * s }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24 * s, fontWeight: 600, marginTop: 8 * s, letterSpacing: 1 * s }}>
          <span>{kicker}</span>
          <span>{dateline}</span>
        </div>
        <div style={{ fontSize: (wide ? 92 : 118) * s, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1 * s, marginTop: 6 * s, background: N.ink, color: N.paper, paddingBottom: 6 * s }}>{title}</div>
        <div style={{ borderTop: `${1 * s}px solid ${N.ink}`, borderBottom: `${4 * s}px solid ${N.ink}`, height: 5 * s, marginTop: 2 * s }} />
      </div>
      {/* fold crease */}
      <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.5, height: 3 * s, background: "linear-gradient(#0000, #00000018, #ffffff40, #0000)" }} />
      {children}
      {/* footer */}
      <div style={{ position: "absolute", left: pad, right: pad, bottom: 34 * s, borderTop: `${2 * s}px solid ${N.ink}`, paddingTop: 8 * s, display: "flex", justifyContent: "space-between", fontFamily: font, fontSize: 24 * s, fontWeight: 600, color: N.ink }}>
        <span>หน้าข่าวจำลอง · ภาพประกอบ</span>
        <span>หน้า ๑</span>
      </div>
    </div>
  );
};

// ---------- headline block ----------
export type Level = "high" | "mid" | "low";
export const LEVEL: Record<Level, [string, number]> = { high: ["หลักฐานตรงกัน", 3], mid: ["ยังถกเถียง", 2], low: ["หลักฐานฝ่ายเดียว", 1] };
export type Head = { f: number; tag: string; head: string; stat?: string; label?: string; chips?: { text: string; f: number }[]; sure?: Level };
// The page's lead: kicker with a red pencil underline, a big serif headline, an optional big figure and a printed
// "evidence level" box. Text swaps by re-setting the type (a quick wipe down), never by a card animation.
export const Headline = ({ heads, from, to }: { heads: Head[]; from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { s, wide, head } = useLay();
  if (frame < from || frame > to) return null;
  const list = heads.filter((h) => frame >= h.f);
  const h = list[list.length - 1];
  if (!h || !h.head) return null;
  const k = interpolate(frame, [h.f, h.f + 10], [0, 1], clamp);
  const o = interpolate(frame, [to - 8, to], [1, 0], clamp);
  const big = wide ? 76 : 84;
  return (
    <div style={{ position: "absolute", left: head.x, top: head.y, width: head.w, fontFamily: font, color: N.ink, opacity: o, clipPath: `inset(0 0 ${(1 - k) * 100}% 0)` }}>
      <div style={{ position: "relative", display: "inline-block", fontSize: 30 * s, fontWeight: 800, color: N.red, letterSpacing: 1 * s }}>
        {h.tag}
        <Underline w={Math.max(120, h.tag.length * 20) * s} f={h.f + 6} thick={4 * s} style={{ left: 0, top: 40 * s }} />
      </div>
      <div style={{ fontSize: big * s, fontWeight: 800, lineHeight: 1.18, marginTop: 4 * s, letterSpacing: -0.5 * s }}>{h.head}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 22 * s, marginTop: 6 * s, flexWrap: "wrap" }}>
        {h.stat && (
          <span style={{ position: "relative", fontSize: 96 * s, fontWeight: 800, lineHeight: 1.1 }}>
            {h.stat}
            <Ring w={h.stat.length * 40 * s} h={110 * s} f={h.f + 12} seed={h.f} thick={6 * s} style={{ left: -30 * s, top: -24 * s }} />
          </span>
        )}
        {h.label && <span style={{ fontSize: 32 * s, fontWeight: 600, fontStyle: "italic" }}>{h.label}</span>}
        {h.sure && (
          <span style={{ border: `${2 * s}px solid ${N.ink}`, padding: `${2 * s}px ${14 * s}px`, fontSize: 24 * s, fontWeight: 600, display: "inline-flex", gap: 10 * s, alignItems: "center", opacity: interpolate(frame, [h.f + 10, h.f + 16], [0, 1], clamp) }}>
            ระดับหลักฐาน: {LEVEL[h.sure][0]}
            <span style={{ letterSpacing: 2 * s }}>{"●".repeat(LEVEL[h.sure][1])}{"○".repeat(3 - LEVEL[h.sure][1])}</span>
          </span>
        )}
        {h.chips?.map((c) => (frame >= c.f ? <Scrawl key={c.text} text={c.text} f={c.f} size={40 * s} rot={-4} style={{ position: "relative" }} /> : null))}
      </div>
    </div>
  );
};

// Caption line (a photo caption under the clippings); use the template <Caption> with word timing in a real video.
export const Subtitle = ({ lines }: { lines: [number, string][] }) => {
  const frame = useCurrentFrame();
  const { s, cap } = useLay();
  const cur = [...lines].reverse().find(([f]) => frame >= f);
  if (!cur) return null;
  const k = interpolate(frame, [cur[0], cur[0] + 8], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: cap.x, top: cap.y, width: cap.w, fontFamily: font, color: N.paper, background: N.ink, padding: `${8 * s}px ${22 * s}px`, boxSizing: "border-box", fontSize: 46 * s, fontWeight: 600, lineHeight: 1.35, opacity: k }}>
      <span style={{ fontWeight: 800, color: "#e8574c" }}>● </span>{cur[1]}
    </div>
  );
};

// ---------- clippings ----------
// Scissor-cut edge: a zigzag polygon around a w×h box.
const cutPath = (w: number, h: number, seed: number, step = 16, amp = 5) => {
  const pts: string[] = [];
  const j = (i: number) => (rnd(seed + i) - 0.5) * amp * 2;
  for (let x = 0, i = 0; x <= w; x += step, i++) pts.push(`${x}px ${amp + j(i)}px`);
  for (let y = 0, i = 100; y <= h; y += step, i++) pts.push(`${w - amp + j(i)}px ${y}px`);
  for (let x = w, i = 200; x >= 0; x -= step, i++) pts.push(`${x}px ${h - amp + j(i)}px`);
  for (let y = h, i = 300; y >= 0; y -= step, i++) pts.push(`${amp + j(i)}px ${y}px`);
  return `polygon(${pts.join(",")})`;
};

// One clipping that slides onto the page (slide-stack): in from the side with a turn that settles, held, then
// pushed off under the next one. `box` in px inside the clipping zone (default: the whole zone).
export const Clipping = ({ start, end, seed = 1, rot = -1.5, box, warm = false, title, children }: { start: number; end: number; seed?: number; rot?: number; box?: { x: number; y: number; w: number; h: number }; warm?: boolean; title?: string; children: (lt: number) => ReactNode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s, zone } = useLay();
  if (frame < start || frame > end + 14) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 15, mass: 0.9 } });
  const out = interpolate(frame, [end, end + 14], [0, 1], { ...clamp, easing: (t) => t * t });
  const b = box ?? { x: 0, y: 0, w: zone.w, h: zone.h };
  const dir = seed % 2 ? 1 : -1;
  return (
    <div style={{ position: "absolute", left: zone.x + b.x, top: zone.y + b.y, width: b.w, height: b.h, transform: `translate(${(1 - k) * dir * 900 * s - out * dir * 120 * s}px, ${out * 60 * s}px) rotate(${rot + (1 - k) * dir * 9 - out * dir * 4}deg)`, opacity: 1 - out, filter: `drop-shadow(${4 * s}px ${8 * s}px ${6 * s}px rgba(40,30,20,0.35))` }}>
      <div style={{ position: "absolute", inset: 0, background: warm ? N.clipWarm : N.clip, clipPath: cutPath(b.w, b.h, seed * 13), padding: `${24 * s}px ${30 * s}px`, boxSizing: "border-box", fontFamily: font, color: N.ink, display: "flex", flexDirection: "column" }}>
        {title && (
          <div style={{ fontSize: 34 * s, fontWeight: 800, borderBottom: `${2 * s}px solid ${N.ink}`, paddingBottom: 4 * s, marginBottom: 12 * s, lineHeight: 1.3 }}>{title}</div>
        )}
        <div style={{ position: "relative", flex: 1 }}>{children(frame - start)}</div>
      </div>
    </div>
  );
};

// Calendar printed like a newspaper almanac box; red pencil rings on the marked days ([day, frame]).
export const Calendar = ({ start, end, marks, title, first = 1, days = 30 }: { start: number; end: number; marks: [number, number][]; title: string; first?: number; days?: number }) => {
  const { s, wide } = useLay();
  const wk = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const cell = (wide ? 74 : 104) * s;
  return (
    <Clipping start={start} end={end} seed={3} rot={-2} title={title}>
      {() => (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${cell}px)`, justifyContent: "center", rowGap: 4 * s }}>
          {wk.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 24 * s, fontWeight: 800, borderBottom: `${1.5 * s}px solid ${N.ink}` }}>{d}</div>)}
          {Array.from({ length: first }, (_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: days }, (_, i) => {
            const m = marks.find(([d]) => d === i + 1);
            return (
              <div key={i} style={{ position: "relative", textAlign: "center", fontSize: (m ? 44 : 34) * s, fontWeight: m ? 800 : 400, lineHeight: `${cell * 0.62}px`, height: cell * 0.62 }}>
                {i + 1}
                {m && <Ring w={cell * 0.75} h={cell * 0.5} f={m[1]} seed={i * 7} thick={6 * s} style={{ left: cell * -0.02, top: cell * -0.06 }} />}
              </div>
            );
          })}
        </div>
      )}
    </Clipping>
  );
};

// Two clipped columns, source A vs source B, each with its halftone picture and the claim in big serif;
// `note` is a red pencil scrawl between them.
export type Side = { tag: string; text: string; f: number; pic: Picture };
export const Compare = ({ start, end, left, right, note }: { start: number; end: number; left: Side; right: Side; note?: { text: string; f: number } }) => {
  const { s, zone, wide } = useLay();
  const frame = useCurrentFrame();
  const w = zone.w * 0.5 - 14 * s;
  const col = (sd: Side, i: number) => (
    <Clipping key={sd.tag} start={Math.max(start, sd.f - 14)} end={end} seed={i ? 6 : 5} rot={i ? 1.6 : -2.2} warm={i === 1} box={{ x: i * (w + 28 * s), y: i * 34 * s, w, h: zone.h - 40 * s }}>
      {() => (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 * s, height: "100%" }}>
          <div style={{ fontSize: 26 * s, fontWeight: 800, borderBottom: `${2 * s}px solid ${N.ink}`, paddingBottom: 4 * s }}>{sd.tag}</div>
          <Halftone w={w - 60 * s} h={(wide ? 220 : 250) * s} kind={sd.pic} seed={i} />
          <div style={{ fontSize: (sd.text.length > 10 ? 50 : 64) * s, fontWeight: 800, lineHeight: 1.15, whiteSpace: "pre-line" }}>{sd.text}</div>
          <svg width={w - 60 * s} height={110 * s}>
            {Array.from({ length: 5 }, (_, j) => <rect key={j} y={j * 21 * s} width={(w - 60 * s) * (j === 4 ? 0.5 : 0.96)} height={7 * s} fill={N.line} opacity={0.6} />)}
          </svg>
        </div>
      )}
    </Clipping>
  );
  return (
    <>
      {col(left, 0)}
      {col(right, 1)}
      {note && frame <= end + 4 && (
        <div style={{ position: "absolute", left: zone.x + zone.w * 0.5, top: zone.y + zone.h * 0.9 }}>
          <Ring w={330 * s} h={110 * s} f={note.f + 10} seed={44} thick={6 * s} style={{ left: -210 * s, top: -40 * s }} />
          <Scrawl text={note.text} f={note.f} size={64 * s} rot={-8} style={{ left: -170 * s, top: -30 * s }} />
        </div>
      )}
    </>
  );
};

// Timeline set as a ruled newspaper chart; the "written later" zone is a halftone band; pencil ring on the event.
export type Mark = { at: number; top: string; bottom?: string; f: number; big?: boolean };
export const Timeline = ({ start, end, title, from, to, marks, zone }: { start: number; end: number; title?: string; from: number; to: number; marks: Mark[]; zone?: { from: number; text: string; f: number } }) => {
  const frame = useCurrentFrame();
  const { s } = useLay();
  const x = (v: number) => `${4 + ((v - from) / (to - from)) * 92}%`;
  const zk = zone ? interpolate(frame, [zone.f, zone.f + 16], [0, 1], clamp) : 0;
  const lineK = interpolate(frame, [start + 6, start + 24], [0, 1], clamp);
  return (
    <Clipping start={start} end={end} seed={7} rot={1.2} title={title}>
      {() => (
        <div style={{ position: "relative", height: "100%" }}>
          {zone && zk > 0 && (
            <div style={{ position: "absolute", left: x(zone.from), right: "2%", top: "16%", bottom: "20%", opacity: zk }}>
              <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}><rect width="100%" height="100%" fill="url(#dotsMid)" opacity={0.55} /></svg>
              <div style={{ position: "absolute", right: 14 * s, bottom: -64 * s, fontSize: 32 * s, fontWeight: 800, whiteSpace: "nowrap" }}>
                {zone.text}
                <Underline w={360 * s} f={zone.f + 8} thick={5 * s} style={{ right: 0, top: 44 * s }} />
              </div>
            </div>
          )}
          <div style={{ position: "absolute", left: "2%", width: `${96 * lineK}%`, top: "50%", borderTop: `${4 * s}px solid ${N.ink}` }} />
          {Array.from({ length: 11 }, (_, i) => <div key={i} style={{ position: "absolute", left: `${4 + i * 9.2}%`, top: "50%", height: (i % 5 ? 12 : 22) * s, borderLeft: `${2 * s}px solid ${N.ink}`, opacity: lineK }} />)}
          {marks.map((m) => {
            const k = interpolate(frame, [m.f, m.f + 8], [0, 1], clamp);
            if (k <= 0) return null;
            return (
              <div key={m.top + m.at} style={{ position: "absolute", left: x(m.at), top: "50%", width: 0, opacity: k }}>
                <div style={{ position: "absolute", left: -9 * s, top: -9 * s, width: 18 * s, height: 18 * s, background: N.ink, borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: 26 * s, transform: "translateX(-50%)", fontSize: (m.big ? 50 : 34) * s, fontWeight: 800, whiteSpace: "nowrap" }}>
                  {m.top}
                  {m.big && <Ring w={170 * s} h={70 * s} f={m.f + 6} seed={m.at} thick={6 * s} style={{ left: -34 * s, top: -12 * s }} />}
                </div>
                {m.bottom && <div style={{ position: "absolute", top: 30 * s, transform: "translateX(-50%)", fontSize: 24 * s, whiteSpace: "pre", textAlign: "center", lineHeight: 1.2 }}>{m.bottom}</div>}
              </div>
            );
          })}
        </div>
      )}
    </Clipping>
  );
};

// N small clippings (one per side) pinned in a grid; a red pencil tick lands on each; then the agreed line,
// double-underlined.
export type Source = [string, string, Picture];
export const FourSources = ({ start, end, checks, sources, bottom }: { start: number; end: number; checks: number[]; sources: Source[]; bottom?: { text: string; f: number } }) => {
  const { s, zone, wide } = useLay();
  const cols = wide ? 4 : 2;
  const rows = Math.ceil(sources.length / cols);
  const gw = (zone.w - (cols - 1) * 20 * s) / cols;
  const gh = (zone.h - 150 * s - (rows - 1) * 20 * s) / rows;
  return (
    <>
      {sources.map(([name, what, pic], i) => (
        <Clipping key={name} start={start + i * 5} end={end} seed={11 + i} rot={(rnd(i + 4) - 0.5) * 5} warm={i % 2 === 1} box={{ x: (i % cols) * (gw + 20 * s), y: Math.floor(i / cols) * (gh + 20 * s), w: gw, h: gh }}>
          {() => (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 * s }}>
              <div style={{ fontSize: 40 * s, fontWeight: 800, lineHeight: 1.1 }}>{name}</div>
              <div style={{ fontSize: 22 * s, fontStyle: "italic", borderBottom: `${1.5 * s}px solid ${N.ink}`, paddingBottom: 4 * s }}>{what}</div>
              <Halftone w={gw - 60 * s} h={Math.max(60, gh - 170 * s)} kind={pic} seed={i + 3} />
              <Tick size={100 * s} f={checks[i]} style={{ right: -6 * s, top: -10 * s }} />
            </div>
          )}
        </Clipping>
      ))}
      {bottom && <AgreeLine text={bottom.text} f={bottom.f} y={zone.y + zone.h - 110 * s} />}
    </>
  );
};
const AgreeLine = ({ text, f, y }: { text: string; f: number; y: number }) => {
  const frame = useCurrentFrame();
  const { s, zone } = useLay();
  const k = interpolate(frame, [f, f + 8], [0, 1], clamp);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: zone.x, width: zone.w, top: y, textAlign: "center", fontFamily: font, fontSize: 54 * s, fontWeight: 800, color: N.ink, opacity: k, background: N.clip, padding: `${6 * s}px 0`, clipPath: `inset(0 ${(1 - k) * 50}% 0 ${(1 - k) * 50}%)` }}>
      <span style={{ position: "relative" }}>
        {text}
        <Underline w={text.length * 26 * s} f={f + 6} double thick={6 * s} style={{ left: 0, top: 70 * s }} />
      </span>
    </div>
  );
};

// "Before you believe a source, ask:" — a boxed sidebar with three numbered questions; pencil rings the numbers.
export const ThreeQuestions = ({ start, end, fs, title = "ก่อนเชื่อหลักฐาน ถามเสมอว่า" }: { start: number; end: number; fs: number[]; title?: string }) => {
  const { s } = useLay();
  const frame = useCurrentFrame();
  const qs = ["ใครเขียน", "เมื่อไหร่", "ให้ใครอ่าน"];
  return (
    <Clipping start={start} end={end} seed={21} rot={-1} warm title={title}>
      {() => (
        <div style={{ display: "flex", flexDirection: "column", gap: 26 * s, paddingTop: 20 * s }}>
          {qs.map((q, i) => (
            <div key={q} style={{ display: "flex", alignItems: "center", gap: 36 * s, opacity: interpolate(frame, [fs[i], fs[i] + 6], [0, 1], clamp), borderBottom: `${1.5 * s}px solid ${N.grey}`, paddingBottom: 14 * s }}>
              <span style={{ position: "relative", fontFamily: hand, fontSize: 76 * s, color: N.red, width: 70 * s, textAlign: "center" }}>
                {i + 1}
                <Ring w={80 * s} h={80 * s} f={fs[i] + 4} seed={i * 9} thick={5 * s} style={{ left: -18 * s, top: 4 * s }} />
              </span>
              <span style={{ fontSize: 72 * s, fontWeight: 800 }}>{q}</span>
            </div>
          ))}
        </div>
      )}
    </Clipping>
  );
};
