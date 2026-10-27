import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useMap } from "../../../components/Map";
import { clamp, font, GOLD, RED } from "../news/kit";
import { PL } from "./places";

// Map overlays and screen cards for episode 6.

// Ring of Burmese siege camps around the island (small red tents), fading in/out; slow pulse, never blinking.
export const CampRing = ({ k, n = 14, r = 0.045 }: { k: number; n?: number; r?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (k <= 0) return null;
  return (
    <g opacity={k}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.2;
        const c: [number, number] = [PL.ayut[0] + Math.cos(a) * r * 1.15, PL.ayut[1] + Math.sin(a) * r * 0.8];
        const p = projection(c);
        if (!p) return null;
        const glow = 0.5 + 0.2 * Math.sin(frame * 0.08 + i);
        return (
          <g key={i} transform={`translate(${p[0]},${p[1]})`}>
            <circle r={22 * s} fill={RED} opacity={0.25 * glow} />
            <path d={`M${-11 * s} ${6 * s} L0 ${-12 * s} L${11 * s} ${6 * s} Z`} fill={RED} stroke="#fff" strokeWidth={2 * s} />
          </g>
        );
      })}
    </g>
  );
};

// The road already travelled: each finished leg stays on the map as a soft gold line (no arrowheads) once its
// chapter is over, so the whole march builds up across the episode.
export const Trail = ({ legs }: { legs: [[number, number][], number][] }) => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {legs.map(([pts, from], i) => {
        const k = interpolate(frame, [from - 10, from + 10], [0, 1], clamp);
        if (k <= 0) return null;
        const d = path({ type: "LineString", coordinates: pts }) ?? "";
        return (
          <g key={i} opacity={k}>
            <path d={d} stroke="#2b1d10" strokeWidth={9 * s} strokeOpacity={0.6} />
            <path d={d} stroke={GOLD} strokeWidth={5.5 * s} strokeOpacity={0.85} />
          </g>
        );
      })}
    </g>
  );
};

// Crossed swords at a battle site: pops in, gentle glow.
export const Battle = ({ at: c, start, end = 1e9, color = RED, size = 1 }: { at: [number, number]; start: number; end?: number; color?: string; size?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { projection, s } = useMap();
  const p = projection(c);
  if (!p || frame < start || frame > end + 12) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 12 } }) * interpolate(frame, [end, end + 12], [1, 0], clamp);
  const z = s * size * k;
  return (
    <g transform={`translate(${p[0]},${p[1]}) scale(${z})`}>
      <circle r={34} fill={color} opacity={0.3} />
      <circle r={22} fill="rgba(8,14,26,0.9)" stroke={color} strokeWidth={3} />
      <path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
      <path d="M-13 -5 L-5 -13 M13 -5 L5 -13" stroke={GOLD} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};

// Big opening title (frame 0): "500 คน / ฝ่าวงล้อมพม่าได้ไง?"
export const HookTitle = ({ end }: { end: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [end - 2, end + 12], [1, 0], clamp);
  const pop = 1 + 0.06 * Math.max(0, 1 - frame / 8);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: height * 0.1, opacity: o, fontFamily: font, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
      <div style={{ transform: `scale(${pop})`, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.95)` }}>
        <div style={{ fontSize: 150 * s, fontWeight: 900, color: GOLD }}>500 คน</div>
        <div style={{ fontSize: 84 * s, fontWeight: 900 }}>ฝ่าวงล้อม<span style={{ color: "#ff6b5f" }}>พม่า</span>ได้ไง?</div>
      </div>
    </AbsoluteFill>
  );
};

// A tear-off calendar page at the top right (date, month, year).
export const DateCard = ({ start, end, day, month, year, color = RED }: { start: number; end: number; day: string; month: string; year: string; color?: string }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < start || frame > end + 10) return null;
  const k = interpolate(frame, [start, start + 12, end, end + 10], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", right: 50 * s, top: height * 0.3, opacity: k, transform: `translateY(${(1 - k) * 30 * s}px)`, fontFamily: font, width: 190 * s, borderRadius: 14 * s, overflow: "hidden", boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.6)`, textAlign: "center" }}>
      <div style={{ background: color, color: "#fff", fontSize: 30 * s, fontWeight: 900, padding: `${6 * s}px 0` }}>{month}</div>
      <div style={{ background: "#f4f0e6", color: "#1a140f", fontSize: 104 * s, fontWeight: 900, lineHeight: 1.1 }}>{day}</div>
      <div style={{ background: "#f4f0e6", color: "#7a3a1a", fontSize: 26 * s, fontWeight: 700, paddingBottom: 8 * s }}>พ.ศ. {year}</div>
    </div>
  );
};

// Small "approximate" note under the map band.
export const ApproxNote = ({ from, to, text = "เส้นทาง/ตำแหน่ง = แนวโดยประมาณ" }: { from: number; to: number; text?: string }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const k = interpolate(frame, [from, from + 12, to - 12, to], [0, 1, 1, 0], clamp);
  if (k <= 0) return null;
  return <div style={{ position: "absolute", right: 40, top: height * 0.53, opacity: k * 0.85, fontFamily: font, fontSize: 22 * s, color: "#fff", background: "rgba(8,14,26,0.7)", padding: `${2 * s}px ${12 * s}px`, borderRadius: 8 * s }}>{text}</div>;
};

// Closing poll: two choices + the follow button, in the head-card slot.
export const Poll2 = ({ start, end, a, b, button, title = "คืนที่เห็นไฟลุกในกรุง คุณจะ…", optA = "เดินต่อ", optB = "ย้อนกลับ" }: { start: number; end: number; a: number; b: number; button: number; title?: string; optA?: string; optB?: string }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < start || frame > end) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const ka = spring({ frame: frame - a, fps, config: { damping: 12 } });
  const kb = spring({ frame: frame - b, fps, config: { damping: 12 } });
  const bk = spring({ frame: frame - button, fps, config: { damping: 9 } });
  const o = interpolate(frame, [end - 8, end], [1, 0], clamp);
  const opt = (t: string, c: string, kk: number, letter: string) => (
    <div style={{ flex: 1, opacity: frame < (letter === "A" ? a : b) ? 0 : Math.min(1, kk), transform: `scale(${0.8 + 0.2 * Math.min(1, kk)})`, border: `${4 * s}px solid ${c}`, borderRadius: 14 * s, padding: `${14 * s}px`, display: "flex", alignItems: "center", gap: 14 * s }}>
      <div style={{ width: 52 * s, height: 52 * s, borderRadius: "50%", background: c, color: "#0a0f1a", fontSize: 34 * s, fontWeight: 900, lineHeight: `${52 * s}px`, textAlign: "center", flex: "none" }}>{letter}</div>
      <div style={{ fontSize: 46 * s, fontWeight: 900 }}>{t}</div>
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", left: 40 * s, right: 40 * s, top: height * 0.085, opacity: o * Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 24 * s}px)`, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${GOLD}`, borderRadius: 18 * s, padding: `${16 * s}px ${24 * s}px`, lineHeight: 1.3 }}>
        <div style={{ fontSize: 32 * s, fontWeight: 900, color: GOLD, marginBottom: 10 * s }}>{title}</div>
        <div style={{ display: "flex", gap: 16 * s }}>
          {opt(optA, GOLD, ka, "A")}
          {opt(optB, "#ff6b5f", kb, "B")}
        </div>
      </div>
      {frame >= button && (
        <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.385, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * s, fontFamily: font, opacity: o }}>
          <div style={{ transform: `scale(${bk})`, background: RED, color: "#fff", borderRadius: 50 * s, padding: `${12 * s}px ${64 * s}px`, fontWeight: 900, fontSize: 50 * s, boxShadow: `0 ${8 * s}px ${30 * s}px rgba(255,59,48,0.55)` }}>ติดตาม</div>
          <div style={{ transform: `scale(${bk})`, background: "rgba(8,14,26,0.85)", color: "#fff", borderRadius: 30 * s, padding: `${4 * s}px ${24 * s}px`, fontWeight: 700, fontSize: 30 * s }}>พิมพ์บอกในคอมเมนต์ได้เลย</div>
        </div>
      )}
    </>
  );
};
