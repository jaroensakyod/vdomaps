import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, font, GOLD, GREEN, RED } from "./Cards";

// Head card (news style): one card per shot, text swaps on each entry — tag pill, 54 px headline, optional big
// stat with a label (put "โดยประมาณ" there), chips that pop on cue, and a confidence chip ("ความน่าเชื่อถือ").
export type Level = "high" | "mid" | "low";
export type Head = { f: number; tag: string; head: string; stat?: string | ((frame: number) => string); label?: string; color?: string; chips?: { text: string; f: number }[]; sure?: Level };

// Confidence wording + colour: สูง = all sides agree, ปานกลาง = most agree / later copies, ต่ำ = one side only.
export const LEVEL: Record<Level, [string, string]> = { high: ["หลักฐานตรงกัน", GREEN], mid: ["ยังถกเถียง", GOLD], low: ["หลักฐานฝ่ายเดียว", RED] };
export const Confidence = ({ level, f, size = 1 }: { level: Level; f: number; size?: number }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = (Math.min(width, height) / 1080) * size;
  const k = frame < f ? 0 : spring({ frame: frame - f, fps, config: { damping: 11 } });
  const [text, c] = LEVEL[level];
  const dots = level === "high" ? 3 : level === "mid" ? 2 : 1;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 * s, transform: `scale(${k})`, transformOrigin: "left center", border: `${3 * s}px solid ${c}`, background: `${c}26`, color: "#fff", padding: `${2 * s}px ${16 * s}px`, borderRadius: 30 * s, fontSize: 26 * s, fontWeight: 900, fontFamily: font, whiteSpace: "nowrap" }}>
      <span style={{ display: "inline-flex", gap: 4 * s }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 12 * s, height: 12 * s, borderRadius: "50%", background: i < dots ? c : "rgba(255,255,255,0.2)" }} />)}</span>
      {text}
    </span>
  );
};

export const HeadCard = ({ heads, from, to, top = 0.1 }: { heads: Head[]; from: number; to: number; top?: number }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < from || frame > to) return null;
  const list = heads.filter((h) => frame >= h.f);
  if (!list.length) return null;
  const h = list[list.length - 1];
  if (!h.head) return null; // an empty head hands the top slot to a card in the "head" slot
  const k = spring({ frame: frame - from, fps, config: { damping: 14 } });
  const o = interpolate(frame, [to - 8, to], [1, 0], clamp);
  const swap = spring({ frame: frame - h.f, fps, config: { damping: 16 } });
  const color = h.color ?? RED;
  const stat = typeof h.stat === "function" ? h.stat(frame) : h.stat;
  const side = Math.max(50 * s, (width - 1300 * s) / 2);
  return (
    <div style={{ position: "absolute", left: side, right: side, top: height * top, transform: `translateX(${(1 - k) * -60 * s}px)`, opacity: k * o, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.86)", borderLeft: `${8 * s}px solid ${color}`, borderRadius: 14 * s, padding: `${18 * s}px ${30 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)`, lineHeight: 1.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 * s, flexWrap: "wrap" }}>
        <span style={{ background: "rgba(255,255,255,0.14)", padding: `${2 * s}px ${14 * s}px`, borderRadius: 30 * s, fontSize: 26 * s, fontWeight: 700 }}>{h.tag}</span>
        {h.sure && <Confidence level={h.sure} f={h.f + 8} />}
      </div>
      <div style={{ fontSize: 54 * s, fontWeight: 900, marginTop: 6 * s, transform: `translateY(${(1 - swap) * 14 * s}px)`, opacity: swap }}>{h.head}</div>
      {stat && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 * s, opacity: swap }}>
          <span style={{ fontSize: 92 * s, fontWeight: 900, color: color === RED ? "#ff6b5f" : color, lineHeight: 1.15 }}>{stat}</span>
          {h.label && <span style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.9 }}>{h.label}</span>}
        </div>
      )}
      {h.chips && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 * s, marginTop: 10 * s }}>
          {h.chips.map((c) => {
            const ck = spring({ frame: frame - c.f, fps, config: { damping: 12 } });
            return frame < c.f ? null : (
              <span key={c.text} style={{ transform: `scale(${ck})`, background: color, color: color === GOLD ? "#1a1200" : "#fff", padding: `${2 * s}px ${16 * s}px`, borderRadius: 30 * s, fontSize: 30 * s, fontWeight: 700 }}>{c.text}</span>
            );
          })}
        </div>
      )}
    </div>
  );
};

// One subtitle line in the caption band (76.5 % of the height); a real episode uses the template <Caption> with
// word timing instead.
export const Subtitle = ({ lines, top = 0.765 }: { lines: [number, string][]; top?: number }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const cur = [...lines].reverse().find(([f]) => frame >= f);
  if (!cur) return null;
  const k = spring({ frame: frame - cur[0], fps, config: { damping: 16 } });
  return (
    <div style={{ position: "absolute", left: 60 * s, right: 60 * s, top: height * top, textAlign: "center", fontFamily: font, color: "#fff", fontSize: 50 * s, fontWeight: 700, lineHeight: 1.35, opacity: k, textShadow: "0 4px 16px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.9)" }}>{cur[1]}</div>
  );
};
