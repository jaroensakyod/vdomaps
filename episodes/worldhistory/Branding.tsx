import { AbsoluteFill, useVideoConfig } from "remotion";
import { camForFeature, globeCam, projectionFor, type Cam } from "../../components/camera";
import { Graticule, MapFrame, Sphere, useMap } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { bbox } from "../../components/Region";
import { ArmyBand } from "./kit/Army";
import { BLACK, display, font, GOLD, RED, Rivers, TAN } from "./kit/news";
import { ADVANCE, CITY, FAR_A, FAR_R, NORTH_A, NORTH_R, RETREAT } from "./ep01/minard";

// Facebook page branding for History on the Map (English): cover 1640×624 and profile picture 1080×1080 (a circle).
// Same look as the videos: real satellite imagery, dark grade, red / gold accents, Minard's army band as the mark.

const shift = (c: Cam, w: number, h: number, dx: number, dy: number): Cam => {
  const p = projectionFor(c, w, h);
  const [lon, lat] = p.invert!([w / 2 + dx, h / 2 + dy])!;
  return { lon, lat, scale: c.scale };
};

const Dot = ({ at, color = RED, label }: { at: [number, number]; color?: string; label?: string }) => {
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p) return null;
  return (
    <g>
      <circle cx={p[0]} cy={p[1]} r={30 * s} fill="none" stroke={color} strokeWidth={4 * s} opacity={0.55} />
      <circle cx={p[0]} cy={p[1]} r={12 * s} fill={color} stroke="#fff" strokeWidth={4 * s} />
      {label && <text x={p[0]} y={p[1] - 40 * s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={34 * s} fill="#fff" stroke="#0b1020" strokeWidth={8 * s} paintOrder="stroke">{label}</text>}
    </g>
  );
};

// Minard's whole figure: advance in tan, retreat in black.
const Minard = ({ perMan, main = false }: { perMan: number; main?: boolean }) => (
  <g>
    {!main && <ArmyBand pts={FAR_A} k={1} color={TAN} perMan={perMan} />}
    {!main && <ArmyBand pts={NORTH_A} k={1} color={TAN} perMan={perMan} />}
    <ArmyBand pts={ADVANCE} k={1} color={TAN} perMan={perMan} glow />
    {!main && <ArmyBand pts={NORTH_R} k={1} color={BLACK} edge="#f2f2f2" perMan={perMan} />}
    {!main && <ArmyBand pts={FAR_R} k={1} color={BLACK} edge="#f2f2f2" perMan={perMan} />}
    <ArmyBand pts={RETREAT} k={1} color={BLACK} edge="#f2f2f2" perMan={perMan} />
  </g>
);

// Cover: Europe at night-ish grade, Minard's band from Kovno to Moscow on the right, the name on the left.
// Facebook shows ~820×312 on desktop and crops the sides on phones: text stays in the middle ~1100 px; the
// profile picture covers the bottom-left corner on desktop, so the left edge stays empty.
export const WhPageCover = () => {
  const { width, height } = useVideoConfig();
  const base = camForFeature(bbox([[23.5, 53.6], [38.2, 56.2]]), width * 0.42, height * 0.8, 0.02);
  const cam = shift(base, width, height, -width * 0.29, height * 0.02);
  const s = height / 624;
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "europe" }, { name: "rus" }]} />
        <Rivers />
        <rect width={width} height={height} fill="#06112b" opacity={0.15} />
        <Minard perMan={1 / 3400} />
        <Dot at={CITY.kovno} color={GOLD} label="1812" />
        <Dot at={CITY.moscow} label="Moscow" />
      </MapFrame>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(2,6,13,0.85) 0%, rgba(2,6,13,0.85) 34%, rgba(2,6,13,0.1) 58%, rgba(2,6,13,0) 100%)" }} />
      <div style={{ position: "absolute", left: width * 0.07, width: width * 0.45, top: height * 0.2, color: "#fff", lineHeight: 1.15, textShadow: "0 6px 24px rgba(0,0,0,0.8)" }}>
        <div style={{ display: "inline-block", background: RED, borderRadius: 12 * s, padding: `${4 * s}px ${20 * s}px`, fontFamily: font, fontSize: 26 * s, fontWeight: 700 }}>One big question · 10 minutes · real maps</div>
        <div style={{ fontFamily: display, fontSize: 86 * s, fontWeight: 700, marginTop: 14 * s, letterSpacing: 1 * s, whiteSpace: "nowrap" }}>
          HISTORY <span style={{ color: GOLD }}>ON THE MAP</span>
        </div>
        <div style={{ fontFamily: font, fontSize: 28 * s, fontWeight: 700, opacity: 0.92, marginTop: 12 * s, lineHeight: 1.4, whiteSpace: "nowrap" }}>
          The wars and journeys that changed the world,<br />told on real satellite maps.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Profile picture: a satellite globe over Europe with Minard's band on it, the name on a ribbon.
export const WhPageProfile = () => {
  const { width, height } = useVideoConfig();
  const s = width / 1080;
  const cam = globeCam(31.2, 54.2, width, height, 3.6);
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <MapFrame cam={shift(cam, width, height, 0, height * 0.14)}>
        <Sphere />
        <Raster layers={[{ name: "world" }, { name: "europe" }]} />
        <Graticule />
        <rect width={width} height={height} fill="#06112b" opacity={0.25} />
        <Minard perMan={1 / 2400} main />
        <Dot at={CITY.moscow} />
      </MapFrame>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="pfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.5" stopColor="#02060d" stopOpacity={0} />
            <stop offset="1" stopColor="#02060d" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill="url(#pfade)" />
      </svg>
      <AbsoluteFill style={{ borderRadius: "50%", boxShadow: `inset 0 0 0 ${width * 0.03}px ${RED}` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: width * 0.17 }}>
        <div style={{ background: RED, color: "#fff", fontFamily: display, fontWeight: 700, fontSize: width * 0.13, lineHeight: 1.15, padding: `0 ${width * 0.045}px`, borderRadius: width * 0.02, letterSpacing: width * 0.003, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>HISTORY</div>
        <div style={{ marginTop: width * 0.012, color: GOLD, fontFamily: display, fontWeight: 700, fontSize: width * 0.075, letterSpacing: width * 0.004, textShadow: "0 4px 16px rgba(0,0,0,0.9)", fontStyle: "normal" }}>ON THE MAP</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
