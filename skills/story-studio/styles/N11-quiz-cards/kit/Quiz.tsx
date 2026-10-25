import { loadFont } from "@remotion/google-fonts/Kanit";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";

// N11 quiz cards: the news-style end-of-chapter quiz from the history episodes as a standalone look. Dark card with a
// gold border, the question, 2–4 lettered choices, a big 3-2-1 countdown and a draining bar, then the answer turns
// green with a tick, the others fade with a red cross, and an optional one-line explanation slides in.
export const font = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["thai", "latin"] }).fontFamily;
export const BG = "#02060d";
export const CARD = "rgba(8,14,26,0.92)";
export const GOLD = "#ffc94a";
export const RED = "#ff3b30";
export const GREEN = "#3f8f4a";
export const BLUE = "#4fa3ff";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Size unit: 1 at 1080 short side; on 9:16 the cards are drawn 1.2× larger so they fill the phone screen.
const unit = (width: number, height: number) => (Math.min(width, height) / 1080) * (height > width ? 1.2 : 1);

// Backdrop drawn in code: deep navy, two slow colour glows, a faint dot grid and drifting specks.
export const QuizBackdrop = ({ accent = GOLD, second = BLUE }: { accent?: string; second?: string }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = unit(width, height);
  const gx = width * (0.25 + 0.06 * Math.sin(frame * 0.012));
  const gy = height * (0.3 + 0.04 * Math.cos(frame * 0.01));
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="qa" cx={gx} cy={gy} r={width * 0.7} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={accent} stopOpacity={0.22} />
          <stop offset="1" stopColor={accent} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="qb" cx={width - gx * 0.6} cy={height - gy * 0.8} r={width * 0.8} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={second} stopOpacity={0.2} />
          <stop offset="1" stopColor={second} stopOpacity={0} />
        </radialGradient>
        <pattern id="qdots" width={36 * s} height={36 * s} patternUnits="userSpaceOnUse">
          <circle cx={18 * s} cy={18 * s} r={1.6 * s} fill="#fff" opacity={0.09} />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={BG} />
      <rect width={width} height={height} fill="url(#qa)" />
      <rect width={width} height={height} fill="url(#qb)" />
      <rect width={width} height={height} fill="url(#qdots)" />
      {Array.from({ length: 26 }, (_, i) => {
        const k = (random(`q${i}`) + frame * (0.0008 + random(`v${i}`) * 0.0015)) % 1;
        return <circle key={i} cx={random(`x${i}`) * width} cy={height * (1 - k)} r={(1.5 + random(`r${i}`) * 2.5) * s} fill={i % 3 ? "#fff" : accent} opacity={0.25 * Math.sin(k * Math.PI)} />;
      })}
    </svg>
  );
};

// Small header over the card: "ข้อ 1/3" pill + a title.
export const QuizHeader = ({ n, of, title, start, color = GOLD, top }: { n: number; of: number; title: string; start: number; color?: string; top?: number }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = unit(width, height);
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  if (frame < start) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height * (top ?? (width > height ? 0.1 : 0.17)), textAlign: "center", fontFamily: font, color: "#fff", opacity: k, transform: `translateY(${(1 - k) * 20 * s}px)`, lineHeight: 1.4 }}>
      <span style={{ background: color, color: "#1a1206", padding: `${4 * s}px ${20 * s}px`, borderRadius: 30 * s, fontSize: 30 * s, fontWeight: 900 }}>ข้อ {n}/{of}</span>
      <div style={{ fontSize: 64 * s, fontWeight: 900, marginTop: 14 * s }}>{title}</div>
    </div>
  );
};

// The quiz card. Countdown shows from `start` to `reveal` (whole seconds left), the answer shows from `reveal`,
// `end` fades it out. `top` = card top as a fraction of the height (default centred for the size).
export const QuizNews = ({ title, question, options, answer, start, reveal, end, explain, color = GOLD, top }: { title: string; question: string; options: string[]; answer: number; start: number; reveal: number; end: number; explain?: string; color?: string; top?: number }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = unit(width, height);
  if (frame < start || frame > end) return null;
  const wide = width > height;
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const o = interpolate(frame, [end - 8, end], [1, 0], clamp);
  const left = Math.max(0, Math.ceil((reveal - frame) / 30));
  const on = frame >= reveal;
  const tick = spring({ frame: frame - reveal, fps, config: { damping: 10, mass: 0.6 } });
  const drain = interpolate(frame, [start + 10, reveal], [1, 0], clamp);
  const pulse = 1 + 0.12 * Math.max(0, 1 - ((frame - start) % 30) / 8);
  const ex = spring({ frame: frame - reveal - 12, fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", left: wide ? (width - 1100 * s) / 2 : 40, width: wide ? 1100 * s : width - 80, top: height * (top ?? (wide ? 0.3 : 0.3)), opacity: o, transform: `scale(${0.9 + 0.1 * k})`, fontFamily: font, color: "#fff", background: CARD, border: `${3 * s}px solid ${color}`, borderRadius: 18 * s, padding: `${22 * s}px ${30 * s}px`, lineHeight: 1.35, boxShadow: `0 ${14 * s}px ${40 * s}px rgba(0,0,0,0.55)`, overflow: "hidden" }}>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color }}>{title}</div>
      <div style={{ fontSize: 52 * s, fontWeight: 900, margin: `${6 * s}px 0 ${14 * s}px` }}>{question}</div>
      {options.map((t, i) => {
        const right = i === answer;
        const ok = spring({ frame: frame - start - 6 - i * 5, fps, config: { damping: 14 } });
        return (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 18 * s, margin: `${10 * s}px 0`, padding: `${10 * s}px ${20 * s}px`, borderRadius: 12 * s, background: on && right ? "rgba(63,143,74,0.9)" : "rgba(255,255,255,0.1)", opacity: (on && !right ? 0.4 : 1) * ok, transform: `translateX(${(1 - ok) * 40 * s}px) scale(${on && right ? 1 + 0.04 * Math.sin(Math.min(1, tick) * Math.PI) : 1})`, border: `${2 * s}px solid rgba(255,255,255,0.3)` }}>
            <div style={{ width: 48 * s, height: 48 * s, flex: "none", borderRadius: "50%", background: on ? (right ? "#fff" : RED) : "rgba(255,255,255,0.2)", color: on && right ? GREEN : "#fff", fontSize: 34 * s, fontWeight: 900, lineHeight: `${48 * s}px`, textAlign: "center", transform: on && right ? `scale(${tick})` : undefined }}>{on ? (right ? "✓" : "✕") : String.fromCharCode(65 + i)}</div>
            <div style={{ fontSize: 42 * s, fontWeight: 700 }}>{t}</div>
          </div>
        );
      })}
      {!on && <div style={{ textAlign: "center", fontSize: 64 * s, fontWeight: 900, color, transform: `scale(${pulse})` }}>{left}</div>}
      {on && explain && <div style={{ textAlign: "center", fontSize: 34 * s, fontWeight: 700, color, margin: `${12 * s}px 0 ${6 * s}px`, opacity: ex, transform: `translateY(${(1 - ex) * 16 * s}px)` }}>{explain}</div>}
      {/* time left: a bar along the bottom edge that drains to the reveal */}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 8 * s, width: `${drain * 100}%`, background: color, opacity: on ? 0 : 0.9 }} />
    </div>
  );
};
