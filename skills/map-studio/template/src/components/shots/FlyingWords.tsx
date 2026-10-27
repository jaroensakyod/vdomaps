// Adapted from video-shotcraft "flying-words" (github.com/Vincentwei1021/video-shotcraft, commit 43bd349,
// Apache-2.0 — see LICENSE-video-shotcraft.txt). Changes: rewritten as one self-contained component with props,
// 9:16 tunnel (taller than wide), Thai type (Kanit, two weights instead of a Latin serif), house colours, and a
// hook title that slams in on frame 0 instead of a static wordmark.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Words are born far down a tunnel and fly past the camera (opacity life curve 0 → 1 → 0.5 → 0.2 → 0), with
// tunnel rings, light-speed streaks, a slow roll, and the hook title held in the middle over a dark halo.
// Put it on frame 0 of an episode: the title is readable at once and everything moves around it.
export type WordsLook = { bg: [string, string]; ink: string; accent: string; glow: string; font: string };
export const WORDS_NEWS: Omit<WordsLook, "font"> = { bg: ["#0d1426", "#04060d"], ink: "#f4efe2", accent: "#ffc94a", glow: "#ff3b30" };

const W = 1080;
const H = 1920;
const CX = W / 2;
const CY = H * 0.46;
const P = 4400; // perspective distance
const Z0 = -7000;
const Z1 = 3200;
const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const OP = [0, 1, 0.5, 0.2, 0];
const OT = [0, 0.25, 0.6, 0.85, 1];
const curve = (u: number) => {
  for (let k = 0; k < 4; k++) if (u <= OT[k + 1]) return OP[k] + ((OP[k + 1] - OP[k]) * (u - OT[k])) / (OT[k + 1] - OT[k]);
  return 0;
};
const project = (x: number, y: number, u: number, roll: number, drift = true) => {
  const z = Z0 + (Z1 - Z0) * u;
  const d = drift ? 0.5 + u * 1.35 : 1;
  const s = P / (P - z);
  const c = Math.cos(roll), sn = Math.sin(roll);
  return { sx: CX + (x * c - y * sn) * d * s, sy: CY + (x * sn + y * c) * d * s, s };
};
const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const FlyingWords = ({
  words,
  accents = [],
  title,
  kicker,
  look,
  duration = 180,
  cycles = 2,
  from = 0,
}: {
  words: string[];
  /** indexes of words drawn in the accent colour with a glow */
  accents?: number[];
  /** hook line, `\n` for line breaks */
  title: string;
  kicker?: string;
  look: WordsLook;
  /** frames for `cycles` full passes of the word list */
  duration?: number;
  cycles?: number;
  /** frame the title slams in (0 = hook on the first frame) */
  from?: number;
}) => {
  const frame = useCurrentFrame();
  const t = frame / duration + 0.35; // start mid-flight: words already on screen at frame 0
  const roll = ((2.5 * Math.PI) / 180) * Math.sin(t * Math.PI * 2);
  const du = cycles / duration;
  const N = words.length;
  const items = words.map((w, i) => {
    const a = i * 2.39996 + rand(i * 7 + 1) * 0.8;
    const r = 260 + rand(i * 13 + 2) * 420;
    return { text: w, accent: accents.includes(i), light: rand(i + 40) > 0.6, size: 70 + rand(i + 3) * 50, color: ["#f4efe2", "#c9c3b4", "#8f8a7d"][Math.floor(rand(i + 5) * 3)], x: Math.cos(a) * r * 0.62, y: Math.sin(a) * r * 1.25, rz: (rand(i + 21) - 0.5) * 12, ph: i / N };
  });
  const dust = Array.from({ length: 64 }, (_, i) => {
    const a = i * 2.39996 + rand(i * 5 + 77) * 1.2;
    const r = 160 + rand(i * 3 + 91) * 1400;
    return { x: Math.cos(a) * r * 0.62, y: Math.sin(a) * r * 1.2, ph: rand(i * 9 + 13), w: 1 + rand(i + 50) * 1.6 };
  });
  const slam = interpolate(frame, [from, from + 8], [1.18, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleIn = frame >= from ? 1 : 0;
  const lines = title.split("\n");
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at 50% 46%, ${look.bg[0]} 0%, ${look.bg[1]} 100%)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: CX - 520, top: CY - 760, width: 1040, height: 1520, borderRadius: "50%", opacity: 0.82 + 0.14 * Math.sin(t * Math.PI * 4), background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${hexA(look.glow, 0.3)} 0%, ${hexA(look.glow, 0.08)} 38%, ${hexA(look.glow, 0)} 70%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 10 }, (_, k) => {
          const u = (t * cycles + k / 10) % 1;
          const p = project(0, 0, u, roll, false);
          const rx = 700 * p.s;
          const op = Math.min(1, u / 0.3) * (1 - Math.min(1, Math.max(0, (u - 0.55) / 0.3)));
          if (op <= 0.01) return null;
          return <ellipse key={k} cx={CX} cy={CY} rx={rx} ry={rx * 1.75} fill="none" stroke={look.accent} strokeOpacity={op * 0.16} strokeWidth={1 + p.s * 0.8} transform={`rotate(${(roll * 180) / Math.PI} ${CX} ${CY})`} />;
        })}
        {dust.map((d, i) => {
          const u = (t * cycles + d.ph) % 1;
          const a = project(d.x, d.y, Math.max(0, u - du * 2.6), roll);
          const b = project(d.x, d.y, u, roll);
          const op = curve(u) * 0.75;
          if (op <= 0.01) return null;
          return <line key={i} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy} stroke="#ffe8b8" strokeOpacity={op} strokeWidth={d.w * Math.min(2.4, b.s)} strokeLinecap="round" />;
        })}
      </svg>
      {items.map((it, i) => {
        const u = (t * cycles + it.ph) % 1;
        const p = project(it.x, it.y, u, roll);
        const q = project(it.x, it.y, Math.max(0, u - du), roll);
        const vx = p.sx - q.sx, vy = p.sy - q.sy;
        // words passing behind the title fade to 20 % so the hook stays readable
        const k = ((p.sx - CX) / 470) ** 2 + ((p.sy - CY) / 330) ** 2;
        const op = curve(u) * (k < 1 ? 0.2 + 0.8 * k * k : 1);
        if (op <= 0.005) return null;
        const blur = (u < 0.22 ? (1 - u / 0.22) * 2.2 : 0) + (u > 0.86 ? (u - 0.86) * 60 : 0);
        const trail = Math.hypot(vx, vy) > 6 ? [1, 2, 3, 4, 5, 6].map((j) => `${(-vx * (j / 6) * 0.9 / p.s).toFixed(1)}px ${(-vy * (j / 6) * 0.9 / p.s).toFixed(1)}px ${(j * 0.8).toFixed(1)}px ${hexA(it.accent ? look.accent : "#f4efe2", 0.2 - j * 0.026)}`).join(", ") : "";
        const glow = it.accent ? `0 0 18px ${hexA(look.accent, 0.55)}, 0 0 48px ${hexA(look.glow, 0.35)}` : "";
        return (
          <div key={i} style={{ position: "absolute", left: p.sx, top: p.sy, whiteSpace: "nowrap", lineHeight: 1.3, transform: `translate(-50%,-50%) scale(${p.s.toFixed(4)}) rotate(${it.rz + (roll * 180) / Math.PI}deg)`, fontFamily: look.font, fontWeight: it.light ? 300 : 900, fontSize: it.size, color: it.accent ? look.accent : it.color, opacity: op, textShadow: [glow, trail].filter(Boolean).join(", ") || undefined, filter: blur > 0.05 ? `blur(${(blur / Math.max(0.6, p.s)).toFixed(2)}px)` : undefined }}>
            {it.text}
          </div>
        );
      })}
      {titleIn > 0 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ position: "absolute", left: CX - 520, top: CY - 380, width: 1040, height: 760, borderRadius: "50%", background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(4,6,13,0.78) 0%, rgba(4,6,13,0.4) 45%, rgba(4,6,13,0) 72%)` }} />
          <div style={{ position: "absolute", left: 40, right: 40, top: CY, transform: `translateY(-50%) scale(${slam})`, textAlign: "center", fontFamily: look.font }}>
            {kicker && <div style={{ fontSize: 46, fontWeight: 700, color: look.accent, letterSpacing: "0.08em", marginBottom: 18 }}>{kicker}</div>}
            {lines.map((l, i) => (
              <div key={i} style={{ fontSize: i === 0 ? 170 : 116, fontWeight: 900, lineHeight: 1.18, color: i === 0 ? look.accent : look.ink, WebkitTextStroke: `12px rgba(0,0,0,0.85)`, paintOrder: "stroke fill", textShadow: `0 6px 40px rgba(0,0,0,0.7)` }}>
                {l}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
