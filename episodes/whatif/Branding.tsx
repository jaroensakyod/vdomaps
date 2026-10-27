import { AbsoluteFill, useVideoConfig } from "remotion";
import { camForFeature, globeCam, projectionFor, type Cam } from "../../components/camera";
import { Graticule, MapFrame, Sphere, useMap } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { bbox } from "../../components/Region";
import { display, font } from "../worldhistory/kit/news";
import { alaska, REAL, RUSSIA, WHATIF } from "./kit/WhatIf";

// Page branding for What if America (English, US audience): cover 1640×624 and profile picture 1080×1080.
// The channel's mark is the split itself: one map, cracked in two, real world on one side, the what-if grade
// on the other. Here Alaska is US blue on the real side and Russian red on the what-if side.

const shift = (c: Cam, w: number, h: number, dx: number, dy: number): Cam => {
  const p = projectionFor(c, w, h);
  const [lon, lat] = p.invert!([w / 2 + dx, h / 2 + dy])!;
  return { lon, lat, scale: c.scale };
};

// Real map everywhere; the what-if half (above-left of the crack) gets the grade and a red Alaska.
// `crack` = jagged line across the frame in px, from the left/top edge to the right/bottom edge.
const SplitMap = ({ crack }: { crack: [number, number][] }) => {
  const { path, width, height, s } = useMap();
  const line = crack.map((p) => p.join(",")).join(" L");
  const whatIf = `M0,0 L${width},0 L${line.split(" L").reverse().join(" L")} Z`;
  const d = path(alaska) ?? "";
  return (
    <g>
      <path d={d} fill={REAL} fillOpacity={0.4} stroke="#fff" strokeWidth={2 * s} strokeOpacity={0.85} />
      <defs>
        <clipPath id="brand-wi"><path d={whatIf} /></clipPath>
      </defs>
      <g clipPath="url(#brand-wi)">
        <rect width={width} height={height} fill="#2a0636" opacity={0.55} />
        <rect width={width} height={height} fill="#ff3a8a" opacity={0.14} />
        <path d={d} fill={RUSSIA} fillOpacity={0.6} stroke="#fff" strokeWidth={2 * s} strokeOpacity={0.85} />
      </g>
      <path d={`M${line}`} fill="none" stroke="#fff" strokeWidth={7 * s} style={{ filter: `drop-shadow(0 0 ${12 * s}px ${WHATIF})` }} />
    </g>
  );
};

const Chip = ({ text, color, size }: { text: string; color: string; size: number }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.35, background: color, color: "#fff", borderRadius: size * 2, padding: `${size * 0.1}px ${size * 0.6}px`, fontFamily: font, fontWeight: 900, fontSize: size }}>
    <span style={{ width: size * 0.45, height: size * 0.45, borderRadius: "50%", background: "#fff" }} />
    {text}
  </span>
);

// Cover: Alaska on the right, split by the crack; the name on the left (inside the middle ~1100 px that phones keep;
// the desktop profile picture covers the bottom-left corner, so that corner stays empty).
export const WhatIfPageCover = () => {
  const { width, height } = useVideoConfig();
  const s = height / 624;
  const base = camForFeature(bbox([[-172, 52], [-128, 71.5]]), width * 0.46, height * 0.95, 0.02);
  const cam = shift(base, width, height, -width * 0.24, height * 0.02);
  const crack: [number, number][] = [[0.5, -0.02], [0.6, 0.22], [0.66, 0.18], [0.72, 0.46], [0.8, 0.42], [0.86, 0.72], [0.93, 0.7], [1.02, 1.02]].map(([x, y]) => [x * width, y * height]);
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "alaska" }, { name: "chukotka" }, { name: "bering" }]} />
        <SplitMap crack={crack} />
      </MapFrame>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(2,6,13,0.9) 0%, rgba(2,6,13,0.85) 36%, rgba(2,6,13,0.15) 56%, rgba(2,6,13,0) 100%)" }} />
      <div style={{ position: "absolute", left: width * 0.07, width: width * 0.5, top: height * 0.17, color: "#fff", lineHeight: 1.15, textShadow: "0 6px 24px rgba(0,0,0,0.8)" }}>
        <div style={{ display: "flex", gap: 12 * s }}>
          <Chip text="REAL" color={REAL} size={24 * s} />
          <Chip text="WHAT IF" color={WHATIF} size={24 * s} />
        </div>
        <div style={{ fontFamily: display, fontSize: 104 * s, fontWeight: 700, marginTop: 12 * s, letterSpacing: 1 * s, whiteSpace: "nowrap" }}>
          WHAT IF <span style={{ color: "#ff6b6f" }}>AMERICA</span>
        </div>
        <div style={{ fontFamily: font, fontSize: 30 * s, fontWeight: 700, opacity: 0.92, marginTop: 10 * s, lineHeight: 1.4, whiteSpace: "nowrap" }}>
          One moment in American history goes the other way.<br />We redraw the map, on real satellite imagery.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Profile picture (shown as a circle): a satellite globe on Alaska, cracked in two, "WHAT IF?" on a ribbon.
export const WhatIfPageProfile = () => {
  const { width, height } = useVideoConfig();
  const cam = globeCam(-152, 60, width, height, 1.25);
  const crack: [number, number][] = [[-0.02, 0.12], [0.22, 0.3], [0.32, 0.26], [0.44, 0.5], [0.54, 0.46], [0.64, 0.76], [0.74, 0.72], [0.9, 1.02]].map(([x, y]) => [x * width, y * height]);
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <MapFrame cam={shift(cam, width, height, 0, -height * 0.06)}>
        <Sphere />
        <Raster layers={[{ name: "world" }, { name: "alaska" }, { name: "chukotka" }]} />
        <Graticule />
        <SplitMap crack={crack} />
      </MapFrame>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="pfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.55" stopColor="#02060d" stopOpacity={0} />
            <stop offset="1" stopColor="#02060d" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill="url(#pfade)" />
      </svg>
      <AbsoluteFill style={{ borderRadius: "50%", boxShadow: `inset 0 0 0 ${width * 0.03}px ${WHATIF}` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: width * 0.16 }}>
        <div style={{ background: WHATIF, color: "#fff", fontFamily: display, fontWeight: 700, fontSize: width * 0.15, lineHeight: 1.12, padding: `0 ${width * 0.045}px`, borderRadius: width * 0.02, letterSpacing: width * 0.003, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>WHAT IF?</div>
        <div style={{ marginTop: width * 0.012, color: "#fff", fontFamily: display, fontWeight: 700, fontSize: width * 0.08, letterSpacing: width * 0.006, textShadow: "0 4px 16px rgba(0,0,0,0.9)" }}>
          AMERICA
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
