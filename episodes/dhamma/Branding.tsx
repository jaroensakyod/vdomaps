import type { ReactNode } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Arrow } from "../../components/Arrow";
import { camForFeature, projectionFor, type Cam } from "../../components/camera";
import { PointLabel } from "../../components/Labels";
import { MapFrame, useMap } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { bbox } from "../../components/Region";
import { font } from "../thaihistory/news/kit";
import { LEG_ANOMA, LEG_RAJGIR, LEG_URUVELA, PL } from "./ep01/places";
import { Mountains } from "./kit/Icons";
import { CINNABAR, DhammaRivers, LEAF } from "./kit/Mural";
import { Buddha, Footprint, Lotus, Tree, Wheel } from "./kit/Pictos";

// Facebook page branding for ตามรอยธรรม: cover 1640×624 and profile picture 1080×1080 (shown as a circle).
// Same look as the videos: satellite Ganges plain, the Buddha's gold route, gold-on-lacquer pictograms.

const shift = (c: Cam, w: number, h: number, dx: number, dy: number): Cam => {
  const p = projectionFor(c, w, h);
  const [lon, lat] = p.invert!([w / 2 + dx, h / 2 + dy])!;
  return { lon, lat, scale: c.scale };
};

const Pin = ({ at, r }: { at: [number, number]; r: number }) => {
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p) return null;
  return (
    <g>
      <defs>
        <radialGradient id="dhglow">
          <stop offset="0" stopColor="#fff3c4" stopOpacity={0.85} />
          <stop offset="0.45" stopColor={LEAF} stopOpacity={0.3} />
          <stop offset="1" stopColor={LEAF} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={p[0]} cy={p[1]} r={r * s} fill="url(#dhglow)" style={{ mixBlendMode: "screen" }} />
      <circle cx={p[0]} cy={p[1]} r={11 * s} fill={LEAF} stroke="#fff" strokeWidth={3 * s} />
    </g>
  );
};

const Route = () => (
  <>
    {[LEG_ANOMA, LEG_RAJGIR, LEG_URUVELA].map((pts, i) => <Arrow key={i} points={pts} start={-60} end={-1} color={LEAF} width={16} />)}
  </>
);

// Cover: the route from Lumbini to the bodhi tree on the left, the name on the right, a lacquer strip of
// pictograms along the bottom. Text stays in the middle ~1100 px (phones crop the sides); the profile picture
// covers the bottom-left corner on desktop.
export const DhammaPageCover = () => {
  const { width, height } = useVideoConfig();
  // Route (Lumbini → Bodh Gaya) on the left quarter, clear of the text and the icon strip.
  const cam = camForFeature(bbox([[81.55, 24.0], [92.05, 28.6]]), width, height, 0);
  const s = height / 624;
  const strip = 120 * s;
  const icons: [(p: { x: number; y: number; size: number }) => ReactNode, number, number][] = [
    [Lotus, 0.5, 80],
    [Footprint, 0.57, 80],
    [(p) => <Tree {...p} kind="bodhi" />, 0.65, 104],
    [Buddha, 0.73, 100],
    [Wheel, 0.81, 82],
    [Mountains, 0.89, 84],
    [Lotus, 0.96, 80],
  ];
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "ganga" }]} />
        <DhammaRivers />
        <rect width={width} height={height} fill="#06112b" opacity={0.35} />
        <Route />
        <Pin at={PL.lumbini} r={150} />
        <Pin at={PL.bodhgaya} r={220} />
        <PointLabel at={PL.lumbini} text="ลุมพินี" start={-30} color={LEAF} size={0.9} />
        <PointLabel at={PL.bodhgaya} text="พุทธคยา" start={-30} color={LEAF} size={0.9} />
      </MapFrame>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(2,6,13,0.05) 0%, rgba(2,6,13,0.1) 28%, rgba(2,6,13,0.82) 44%, rgba(2,6,13,0.94) 100%)" }} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <rect x={width * 0.44} y={height - strip} width={width * 0.56} height={strip} fill="#0c0704" />
        <rect x={width * 0.44} y={height - strip} width={width * 0.56} height={3 * s} fill={LEAF} opacity={0.6} />
        {icons.map(([C, fx, size], i) => (
          <C key={i} x={width * fx} y={height - 14 * s} size={size * s} />
        ))}
        <rect x={0} y={height - 6 * s} width={width} height={6 * s} fill={LEAF} />
      </svg>
      <div style={{ position: "absolute", left: width * 0.47, right: width * 0.04, top: height * 0.1, fontFamily: font, color: "#fff", lineHeight: 1.25, textShadow: "0 6px 24px rgba(0,0,0,0.8)" }}>
        <div style={{ display: "inline-block", background: CINNABAR, border: `${2 * s}px solid ${LEAF}`, borderRadius: 14 * s, padding: `${2 * s}px ${22 * s}px`, fontSize: 28 * s, fontWeight: 700 }}>พุทธประวัติ · พระสาวก · ครูบาอาจารย์</div>
        <div style={{ fontSize: 92 * s, fontWeight: 900, marginTop: 6 * s, whiteSpace: "nowrap" }}>
          ตามรอย<span style={{ color: LEAF }}>ธรรม</span>
        </div>
        <div style={{ fontSize: 32 * s, fontWeight: 700, opacity: 0.92 }}>เดินตามเส้นทางจริงของพระพุทธเจ้าและครูบาอาจารย์<br />บนแผนที่ดาวเทียม · คลิปละราว 10 นาที</div>
      </div>
    </AbsoluteFill>
  );
};

// Profile picture: dark satellite plain, the gold bodhi tree with the meditating Buddha, the name on a ribbon.
export const DhammaPageProfile = () => {
  const { width, height } = useVideoConfig();
  const cam = shift(camForFeature(bbox([[84.2, 24.1], [85.8, 25.4]]), width, height, 0), width, height, 0, height * 0.08);
  const s = width / 1080;
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "ganga" }]} />
        <rect width={width} height={height} fill="#06112b" opacity={0.55} />
        <Pin at={PL.bodhgaya} r={520} />
      </MapFrame>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="dhfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.45" stopColor="#02060d" stopOpacity={0} />
            <stop offset="1" stopColor="#02060d" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill="url(#dhfade)" />
        <Tree x={width * 0.5} y={height * 0.6} size={520 * s} kind="bodhi" />
        <Buddha x={width * 0.5} y={height * 0.66} size={300 * s} glow={0.5} />
        <Lotus x={width * 0.27} y={height * 0.66} size={110 * s} />
        <Lotus x={width * 0.73} y={height * 0.66} size={110 * s} />
      </svg>
      <AbsoluteFill style={{ borderRadius: "50%", boxShadow: `inset 0 0 0 ${width * 0.03}px ${LEAF}` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: width * 0.13 }}>
        <div style={{ background: CINNABAR, border: `${width * 0.005}px solid ${LEAF}`, color: "#fff", fontFamily: font, fontWeight: 900, fontSize: width * 0.105, lineHeight: 1.3, padding: `${width * 0.004}px ${width * 0.05}px`, borderRadius: width * 0.02, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          ตามรอย<span style={{ color: "#ffe3a0" }}>ธรรม</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
