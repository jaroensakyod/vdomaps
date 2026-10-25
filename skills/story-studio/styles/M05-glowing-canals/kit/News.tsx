import { loadFont } from "@remotion/google-fonts/Kanit";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { camForFeature, projectionFor, type Cam } from "../../../components/camera";
import { bbox } from "../../../components/Region";

// M05 glowing canals: the news look of the history episodes over NASA HLS imagery of an old river city, with the
// old canals and rivers drawn on as glowing lines (kit/Canals.tsx). Dark head card per shot, top bar, captions.
// Everything here is scheduled by frame numbers passed in by the scene.
export const font = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["thai", "latin"] }).fontFamily;
export const RED = "#ff3b30";
export const GOLD = "#ffc94a";
export const BLUE = "#4fa3ff";
export const CARD = "rgba(8,14,26,0.86)";
export const BG = "#02060d";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Approximate points and views (central plain / Ayutthaya).
export const V = {
  bangkok: bbox([[100.445, 13.715], [100.525, 13.785]]), // old Bangkok / Thonburi: the river loop and the shortcut
  thon: bbox([[100.474, 13.728], [100.506, 13.768]]),
};

// Camera on a feature, zoomed by k, with the subject lifted into the upper part of the frame (panels sit below).
export const view = (f: Parameters<typeof camForFeature>[0], width: number, height: number, k = 1, lift = 0.08): Cam => {
  const c = camForFeature(f, width, height, 0.02);
  const scaled = { ...c, scale: c.scale * k };
  const p = projectionFor(scaled, width, height);
  const [lon, lat] = p.invert!([width / 2, height / 2 + height * lift])!;
  return { lon, lat, scale: scaled.scale };
};

// Top bar: red channel badge (left), chapter name, chip on the right (year, imagery date).
export const TopBar = ({ badge, chapter, chip, start = 0 }: { badge: string; chapter?: string; chip: string; start?: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [start, start + 8], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: height * 0.045, left: 50 * s, right: 50 * s, opacity: o, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font, color: "#fff", lineHeight: 1.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
        <div style={{ background: RED, padding: `${4 * s}px ${16 * s}px`, borderRadius: 8 * s, fontWeight: 900, fontSize: 32 * s }}>{badge}</div>
        {chapter && <div style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.92 }}>{chapter}</div>}
      </div>
      <div style={{ background: "rgba(8,14,26,0.8)", border: `${2 * s}px solid rgba(255,255,255,0.25)`, padding: `${2 * s}px ${16 * s}px`, borderRadius: 30 * s, fontWeight: 700, fontSize: 30 * s }}>{chip}</div>
    </div>
  );
};

// One card per shot. The card stays; tag/headline/stat swap with a small spring on each head's frame `f`.
export type Head = { f: number; tag: string; head: string; stat?: string | ((frame: number) => string); label?: string; color?: string; chips?: { text: string; f: number }[] };
export const HeadCard = ({ heads, from, to }: { heads: Head[]; from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < from || frame > to) return null;
  const list = heads.filter((h) => frame >= h.f);
  if (!list.length) return null;
  const h = list[list.length - 1];
  if (!h.head) return null;
  const k = spring({ frame: frame - from, fps, config: { damping: 14 } });
  const o = interpolate(frame, [to - 8, to], [1, 0], clamp);
  const swap = spring({ frame: frame - h.f, fps, config: { damping: 16 } });
  const color = h.color ?? RED;
  const stat = typeof h.stat === "function" ? h.stat(frame) : h.stat;
  const wide = width > height;
  return (
    <div style={{ position: "absolute", left: 50 * s, right: wide ? undefined : 50 * s, width: wide ? 760 * s : undefined, top: height * (wide ? 0.15 : 0.1), transform: `translateX(${(1 - k) * -60 * s}px)`, opacity: k * o, fontFamily: font, color: "#fff", background: CARD, borderLeft: `${8 * s}px solid ${color}`, borderRadius: 14 * s, padding: `${18 * s}px ${30 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)`, lineHeight: 1.4 }}>
      <span style={{ background: "rgba(255,255,255,0.14)", padding: `${2 * s}px ${14 * s}px`, borderRadius: 30 * s, fontSize: 26 * s, fontWeight: 700 }}>{h.tag}</span>
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
              <span key={c.text} style={{ transform: `scale(${ck})`, background: color, color: "#fff", padding: `${2 * s}px ${16 * s}px`, borderRadius: 30 * s, fontSize: 30 * s, fontWeight: 700 }}>{c.text}</span>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Captions sit at 76.5 % of the height on 9:16 (bottom on 16:9, handled by <Caption>).
export const CAPTION_TOP = 0.765;
