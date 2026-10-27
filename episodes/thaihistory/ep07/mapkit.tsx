import type { FeatureCollection, MultiLineString } from "geojson";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useMap } from "../../../components/Map";
import { useJson } from "../../../components/useJson";
import { clamp, font, GOLD, RED } from "../news/kit";

// Map overlays and screen cards for episode 7.

// OSM rivers outside the central plain (Chanthaburi/Trat by default; episode 9 passes th-north), same look as the
// central-plain rivers.
export const ChanRivers = ({ file = "data/th-chan.json" }: { file?: string }) => {
  const { path, projection, s } = useMap();
  const data = useJson<FeatureCollection<MultiLineString, { name: string }>>(file);
  const pxDeg = (projection.scale() * Math.PI) / 180;
  const w = Math.min(Math.max(pxDeg * 0.0009, 2.5 * s), 16 * s);
  if (!data) return null;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {data.features.map((f, i) => <path key={`g${i}`} d={path(f) ?? ""} stroke="#4fc3ff" strokeWidth={w * 2.2} strokeOpacity={0.16} />)}
      {data.features.map((f, i) => <path key={`l${i}`} d={path(f) ?? ""} stroke="#7fd4ff" strokeWidth={w} strokeOpacity={0.85} />)}
    </g>
  );
};

// Opening title at frame 0.
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
        <div style={{ fontSize: 110 * s, fontWeight: 900 }}><span style={{ color: "#ff6b5f" }}>ทุบหม้อข้าว</span></div>
        <div style={{ fontSize: 96 * s, fontWeight: 900 }}>ตัวเอง <span style={{ color: GOLD }}>ทำไม?</span></div>
      </div>
    </AbsoluteFill>
  );
};

// Chronicle quote card (paper + red rule) in the panel slot.
export const QuoteCard = ({ start, end, lines }: { start: number; end: number; lines: [string, number][] }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < start || frame > end) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const o = interpolate(frame, [end - 8, end], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 60 * s, right: 60 * s, top: height * 0.56, opacity: o * Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 24 * s}px)`, fontFamily: font, color: "#2a1a10", background: "#f4ecd8", borderLeft: `${10 * s}px solid ${RED}`, borderRadius: 12 * s, padding: `${20 * s}px ${30 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.55)`, lineHeight: 1.4 }}>
      <div style={{ fontSize: 26 * s, fontWeight: 700, color: RED }}>พระราชพงศาวดาร (ถอดความ)</div>
      {lines.map(([t, f]) => (
        <div key={t} style={{ fontSize: 44 * s, fontWeight: 900, opacity: interpolate(frame, [f, f + 10], [0, 1], clamp) }}>{t}</div>
      ))}
    </div>
  );
};

// Counter card "500 → 5,000" (screen, below the head card).
export const TenFold = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < start || frame > end) return null;
  const k = interpolate(frame, [start, start + 12, end - 10, end], [0, 1, 1, 0], clamp);
  const n = Math.round(interpolate(frame, [start + 10, start + 50], [500, 5000], clamp) / 100) * 100;
  return (
    <div style={{ position: "absolute", right: 50 * s, top: height * 0.3, opacity: k, fontFamily: font, color: "#fff", textAlign: "center", background: "rgba(8,14,26,0.86)", borderRadius: 16 * s, padding: `${10 * s}px ${26 * s}px`, borderTop: `${6 * s}px solid ${GOLD}` }}>
      <div style={{ fontSize: 26 * s, fontWeight: 700 }}>ทหาร</div>
      <div style={{ fontSize: 84 * s, fontWeight: 900, color: GOLD, lineHeight: 1.1 }}>{n.toLocaleString("en-US")}</div>
    </div>
  );
};
