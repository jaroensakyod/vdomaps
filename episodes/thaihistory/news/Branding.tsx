import { AbsoluteFill, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { camForFeature, projectionFor, type Cam } from "../../../components/camera";
import { MapFrame, useMap } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { bbox } from "../../../components/Region";
import { font, GOLD, P, RED, Rivers } from "./kit";
import { BellChedi, Prang } from "./Period";

// Facebook page branding for ประวัติศาสตร์บนแผนที่: cover 1640×624 and profile picture 1080×1080 (shown as a circle).
// Same look as the videos: real satellite map, dark grade, red / gold accents, the Ayutthaya skyline.

const shift = (c: Cam, w: number, h: number, dx: number, dy: number): Cam => {
  const p = projectionFor(c, w, h);
  const [lon, lat] = p.invert!([w / 2 + dx, h / 2 + dy])!;
  return { lon, lat, scale: c.scale };
};

const Glow = ({ at, r }: { at: [number, number]; r: number }) => {
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p) return null;
  return (
    <g>
      <defs>
        <radialGradient id="brandglow">
          <stop offset="0" stopColor="#ff8a2a" stopOpacity={0.8} />
          <stop offset="0.5" stopColor="#ff5a1a" stopOpacity={0.25} />
          <stop offset="1" stopColor="#ff5a1a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={p[0]} cy={p[1]} r={r * s} fill="url(#brandglow)" style={{ mixBlendMode: "screen" }} />
      <circle cx={p[0]} cy={p[1]} r={14 * s} fill={RED} stroke="#fff" strokeWidth={4 * s} />
      <circle cx={p[0]} cy={p[1]} r={34 * s} fill="none" stroke={RED} strokeWidth={4 * s} opacity={0.6} />
    </g>
  );
};

// Cover: the Chao Phraya plain at dusk, two campaign arrows converging on Ayutthaya, the skyline along the bottom.
// Facebook shows ~820×312 on desktop and crops the sides on phones: text stays in the middle ~1100 px, and the
// profile picture covers the bottom-left corner on desktop.
export const ThPageCover = () => {
  const { width, height } = useVideoConfig();
  // Stay inside the 30 m tile (100.0–101.4 E, 13.6–15.3 N) so its edge never shows; Ayutthaya sits left of centre.
  const base = camForFeature(bbox([[100.02, 14.08], [101.38, 14.6]]), width, height, 0);
  const cam = shift(base, width, height, width * 0.1, 0);
  const s = height / 624;
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "sea" }, { name: "plainhls" }]} />
        <Rivers />
        <rect width={width} height={height} fill="#06112b" opacity={0.3} />
        <Arrow points={[[100.05, 14.62], [100.3, 14.5], [100.52, 14.39]]} start={-60} end={-1} color={RED} width={20} />
        <Arrow points={[[100.05, 14.1], [100.3, 14.2], [100.52, 14.32]]} start={-60} end={-1} color={RED} width={20} />
        <Glow at={P.ayut} r={260} />
      </MapFrame>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(2,6,13,0.1) 0%, rgba(2,6,13,0.05) 25%, rgba(2,6,13,0.8) 42%, rgba(2,6,13,0.92) 100%)" }} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {[[0.56, 150, "p"], [0.62, 110, "c"], [0.68, 190, "p"], [0.74, 120, "c"], [0.8, 160, "p"], [0.86, 100, "c"], [0.92, 140, "p"], [0.97, 90, "c"]].map(([fx, h, t], i) =>
          t === "p" ? <Prang key={i} x={width * (fx as number)} y={height} h={(h as number) * s} color="#c9932e" /> : <BellChedi key={i} x={width * (fx as number)} y={height} h={(h as number) * s} color="#b7862a" />,
        )}
        <rect x={0} y={height - 6 * s} width={width} height={6 * s} fill={GOLD} />
      </svg>
      <div style={{ position: "absolute", left: width * 0.385, right: width * 0.05, top: height * 0.13, fontFamily: font, color: "#fff", lineHeight: 1.25, textShadow: "0 6px 24px rgba(0,0,0,0.8)" }}>
        <div style={{ display: "inline-block", background: RED, borderRadius: 14 * s, padding: `${2 * s}px ${22 * s}px`, fontSize: 30 * s, fontWeight: 700 }}>คลิปละ 10 นาที · ตอบคำถามเดียวให้ชัด</div>
        <div style={{ fontSize: 72 * s, fontWeight: 900, marginTop: 10 * s, whiteSpace: "nowrap" }}>
          ประวัติศาสตร์<span style={{ color: GOLD }}>บนแผนที่</span>
        </div>
        <div style={{ fontSize: 34 * s, fontWeight: 700, opacity: 0.92, marginTop: 4 * s }}>ศึกใหญ่ของไทยและโลก เห็นเป็นภาพ<br />บนแผนที่ดาวเทียมจริง</div>
      </div>
    </AbsoluteFill>
  );
};

// Profile picture: satellite plain around the glowing city, the skyline in gold, the name on a ribbon.
export const ThPageProfile = () => {
  const { width, height } = useVideoConfig();
  const cam = shift(camForFeature(bbox([[100.15, 14.0], [100.98, 14.72]]), width, height, 0), width, height, 0, height * 0.1);
  const s = width / 1080;
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "sea" }, { name: "plainhls" }]} />
        <Rivers />
        <rect width={width} height={height} fill="#06112b" opacity={0.5} />
        <Glow at={P.ayut} r={420} />
      </MapFrame>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.45" stopColor="#02060d" stopOpacity={0} />
            <stop offset="1" stopColor="#02060d" stopOpacity={0.85} />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill="url(#fade)" />
        {[[0.3, 230, "c"], [0.42, 300, "p"], [0.5, 380, "p"], [0.58, 300, "p"], [0.7, 230, "c"]].map(([fx, h, t], i) =>
          t === "p" ? <Prang key={i} x={width * (fx as number)} y={height * 0.66} h={(h as number) * s} color="#e2b84a" /> : <BellChedi key={i} x={width * (fx as number)} y={height * 0.66} h={(h as number) * s} color="#d9a93a" />,
        )}
      </svg>
      <AbsoluteFill style={{ borderRadius: "50%", boxShadow: `inset 0 0 0 ${width * 0.03}px ${RED}` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: width * 0.16 }}>
        <div style={{ background: RED, color: "#fff", fontFamily: font, fontWeight: 900, fontSize: width * 0.1, lineHeight: 1.3, padding: `${width * 0.004}px ${width * 0.045}px`, borderRadius: width * 0.02, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>ประวัติศาสตร์</div>
        <div style={{ marginTop: width * 0.012, color: GOLD, fontFamily: font, fontWeight: 900, fontSize: width * 0.06, textShadow: "0 4px 16px rgba(0,0,0,0.9)" }}>บนแผนที่</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
