import { geoCentroid } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, camForFeature, globeCam, type CamKey } from "../../components/camera";
import { country, countries, places } from "../../components/data";
import { PointLabel } from "../../components/Labels";
import { MapFrame, Sphere, useMap } from "../../components/Map";
import { Credit, Title } from "../../components/Overlays";
import { Raster } from "../../components/Raster";
import { bbox } from "../../components/Region";
import { style } from "../../components/style";
import { useJson } from "../../components/useJson";

// 19 s tour of the open data layers. Fetch first (from the project folder):
//   node scripts/fetch-imagery.mjs bluemarble world
//   node scripts/fetch-imagery.mjs night night-sea 90 -5 125 30 6000
//   node scripts/fetch-imagery.mjs bluemarble sea 90 -5 125 30 6000
//   node scripts/fetch-dem.mjs nthai 96 15.5 103 22 300   (wider than the shot so 9:16 is covered too)
//   node scripts/fetch-osm.mjs cm-rivers 98.3 18.3 99.6 19.4 bigrivers
//   node scripts/fetch-rivers.mjs sea-rivers 90 -5 125 30
//   node scripts/fetch-history.mjs 1700 92 0 112 25
export const DATA_TOUR_FRAMES = 570;

const S = { satellite: 0, relief: 150, night: 300, history: 420 };
const thailand = country("764");
const NORTH = bbox([[98.15, 17.95], [100.15, 19.95]]);
const SEA = bbox([[93, 3], [113, 25]]);
const INTHANON: [number, number] = [98.4867, 18.5886];

const THAI_1700: Record<string, string> = {
  Ayutthaya: "อยุธยา",
  "Lan Na": "ล้านนา",
  Ava: "อังวะ",
  "Đại Việt": "ไดเวียด",
  Cambodia: "กัมพูชา",
  "Laotian states": "รัฐลาว",
  "Shan states": "รัฐฉาน",
  Malaya: "มลายู",
};
// Centroids of these two land on each other; place their names by hand.
const LABEL_AT: Record<string, [number, number]> = { "Laotian states": [102.4, 19.6], "Đại Việt": [105.9, 20.4] };
const PALETTE = ["#e4a23c", "#5fa8d3", "#d1495b", "#8fbc5a", "#b07cc6", "#ef8354", "#4fb3a9", "#c9b458"];

const ramp = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Borders = ({ opacity }: { opacity: number }) => {
  const { path, s } = useMap();
  if (opacity <= 0) return null;
  return <path d={path(countries) ?? ""} fill="none" stroke="#fff" strokeOpacity={0.55 * opacity} strokeWidth={1.2 * s} />;
};

const Outline = ({ feature, opacity, color = style.highlight }: { feature: Feature; opacity: number; color?: string }) => {
  const { path, s } = useMap();
  if (opacity <= 0) return null;
  const d = path(feature) ?? "";
  return (
    <g opacity={opacity}>
      <path d={d} fill="none" stroke={color} strokeWidth={10 * s} strokeOpacity={0.35} style={{ filter: `blur(${5 * s}px)` }} />
      <path d={d} fill="none" stroke={color} strokeWidth={3 * s} strokeLinejoin="round" />
    </g>
  );
};

// OSM rivers grow in (pathLength=1 lets every path reveal with the same dash offset).
const Rivers = ({ data, progress }: { data: FeatureCollection<Geometry, { name: string | null }> | null; progress: number }) => {
  const { path, s } = useMap();
  if (!data || progress <= 0) return null;
  return (
    <g>
      {data.features.map((f, i) => {
        const main = f.properties.name === "แม่น้ำปิง";
        return (
          <path
            key={i}
            d={path(f) ?? ""}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - progress}
            fill="none"
            stroke={main ? "#7fd8ff" : "#a8e4ff"}
            strokeWidth={(main ? 5 : 2.2) * s}
            strokeOpacity={main ? 1 : 0.8}
            strokeLinecap="round"
            style={main ? { filter: `drop-shadow(0 0 ${4 * s}px #2aa9ff)` } : undefined}
          />
        );
      })}
    </g>
  );
};

const History = ({ data, opacity }: { data: FeatureCollection<Geometry, { NAME: string }> | null; opacity: number }) => {
  const { path, projection, s } = useMap();
  if (!data || opacity <= 0) return null;
  const named = data.features.filter((f) => THAI_1700[f.properties.NAME]);
  return (
    <g opacity={opacity}>
      {named.map((f, i) => (
        <path key={i} d={path(f) ?? ""} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.42} stroke="#fff" strokeWidth={2 * s} strokeOpacity={0.9} />
      ))}
      {named.map((f, i) => {
        const xy = projection(LABEL_AT[f.properties.NAME] ?? (geoCentroid(f) as [number, number]));
        if (!xy) return null;
        return (
          <text key={i} x={xy[0]} y={xy[1]} textAnchor="middle" fontSize={40 * s} fontWeight={900} fill="#fff" stroke="#0b1622" strokeWidth={7 * s} paintOrder="stroke" fontFamily={style.font}>
            {THAI_1700[f.properties.NAME]}
          </text>
        );
      })}
    </g>
  );
};

const Chip = ({ text, sub, opacity }: { text: string; sub?: string; opacity: number }) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: height > width ? "50%" : 70 * s,
        top: height > width ? height * 0.13 : 60 * s,
        transform: height > width ? "translateX(-50%)" : undefined,
        opacity,
        fontFamily: style.font,
        color: "#fff",
        background: "rgba(6,16,31,0.78)",
        border: `${2 * s}px solid rgba(255,255,255,0.2)`,
        borderRadius: 18 * s,
        padding: `${10 * s}px ${30 * s}px`,
        lineHeight: 1.4,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 58 * s, fontWeight: 900 }}>{text}</div>
      {sub && <div style={{ fontSize: 28 * s, opacity: 0.8 }}>{sub}</div>}
    </div>
  );
};

export const DataTour = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const osm = useJson<FeatureCollection<Geometry, { name: string | null }>>("data/cm-rivers.geojson");
  const hist = useJson<FeatureCollection<Geometry, { NAME: string }>>("data/history-1700.geojson");

  const north = camForFeature(NORTH, width, height, 0.02);
  const sea = camForFeature(SEA, width, height, 0.03);
  const keys: CamKey[] = [
    { frame: 0, cam: globeCam(40, 12, width, height, 0.42) },
    { frame: 50, cam: globeCam(85, 14, width, height, 0.42) },
    { frame: 130, cam: camForFeature(thailand, width, height, 0.12) },
    { frame: S.relief + 10, cam: camForFeature(thailand, width, height, 0.12) },
    { frame: S.relief + 60, cam: north },
    { frame: S.night - 10, cam: { ...north, scale: north.scale * 1.08 } },
    { frame: S.night + 40, cam: sea },
    { frame: S.history + 120, cam: { ...sea, scale: sea.scale * 1.06 } },
  ];
  const cam = camAt(keys, frame);

  const relief = ramp(frame, S.relief + 30, S.relief + 70) * (1 - ramp(frame, S.night, S.night + 30));
  const night = ramp(frame, S.night, S.night + 30) * (1 - ramp(frame, S.history, S.history + 25));
  const day = 1 - night;
  const then = ramp(frame, S.history + 15, S.history + 35) * (1 - ramp(frame, S.history + 90, S.history + 110));
  const now = ramp(frame, S.history + 95, S.history + 115);

  const credit =
    frame < S.relief + 30
      ? ["Imagery: NASA Blue Marble", "Borders: Natural Earth"]
      : frame < S.night
        ? ["Elevation: Copernicus DEM GLO-90 © DLR e.V., © Airbus", "Rivers: © OpenStreetMap contributors"]
        : frame < S.history
          ? ["Imagery: NASA Black Marble (VIIRS)"]
          : ["Imagery: NASA Blue Marble", "Borders 1700: historical-basemaps (A. Ourednik), approximate", "Borders today: Natural Earth"];

  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <MapFrame cam={cam}>
        <Sphere />
        <Raster
          layers={[
            { name: "world", opacity: day + night * 0.18 }, // dim day map outside the night-lights area
            { name: "sea", opacity: day * ramp(frame, S.night - 20, S.night) },
            { name: "nthai-relief", opacity: relief },
            { name: "night-sea", op: "lighter", opacity: night },
          ]}
        />
        <Borders opacity={(1 - relief) * (1 - then) * (frame < S.history ? 0.6 : now)} />
        <Outline feature={thailand} opacity={ramp(frame, 100, 125) * (1 - ramp(frame, S.relief + 30, S.relief + 55))} />
        <Rivers data={osm} progress={ramp(frame, S.relief + 70, S.relief + 125) * (1 - ramp(frame, S.night, S.night + 20))} />
        {frame < S.night && <PointLabel at={INTHANON} text="ดอยอินทนนท์ 2,565 ม." start={S.relief + 85} />}
        {frame < S.night && <PointLabel at={places.chiangMai} text="เชียงใหม่" start={S.relief + 100} color="#2aa9ff" />}
        {frame >= S.night + 30 && frame < S.history && (
          <>
            <PointLabel at={places.bangkok} text="กรุงเทพฯ" start={S.night + 35} color="#ffd36b" />
            <PointLabel at={[105.8342, 21.0278]} text="ฮานอย" start={S.night + 45} color="#ffd36b" />
            <PointLabel at={[106.6297, 10.8231]} text="โฮจิมินห์" start={S.night + 55} color="#ffd36b" />
            <PointLabel at={[101.6869, 3.139]} text="กัวลาลัมเปอร์" start={S.night + 65} color="#ffd36b" />
          </>
        )}
        <History data={hist} opacity={then} />
      </MapFrame>
      <Title text="แผนที่จากข้อมูลจริง" sub="ดาวเทียม · ความสูงภูเขา · แม่น้ำ · แสงไฟกลางคืน · พรมแดนในอดีต" start={0} end={80} />
      <Chip text="ความสูงภูเขาจริง" sub="Copernicus DEM + แม่น้ำจาก OpenStreetMap" opacity={ramp(frame, S.relief + 60, S.relief + 75) * (1 - ramp(frame, S.night - 15, S.night))} />
      <Chip text="แสงไฟยามค่ำคืน" sub="NASA Black Marble" opacity={ramp(frame, S.night + 25, S.night + 40) * (1 - ramp(frame, S.history - 15, S.history))} />
      <Chip text="ค.ศ. 1700 · พ.ศ. 2243" sub="พรมแดนโดยประมาณ" opacity={then} />
      <Chip text="ปัจจุบัน" opacity={now} />
      <Credit lines={credit} />
    </AbsoluteFill>
  );
};
