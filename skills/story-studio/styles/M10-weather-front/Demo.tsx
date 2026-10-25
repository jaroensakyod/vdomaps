import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, projectionFor, type Cam } from "../../components/camera";
import { MapFrame, useMap } from "../../components/Map";
import { bbox } from "../../components/Region";
import { Bed, SFX, Sfx } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Board, City, clamp, CloudSym, ColdAir, FRONT, HSymbol, Magnet, passAt, Screen, Snowflake, VHS, view, type Front, type WeatherHead } from "./kit/Retro";

// M10 1980s TV weather: a cold surge on the studio board. The "H" magnet slaps onto Mongolia, the cold front
// (blue line, big triangles) sweeps south over China and Vietnam into Thailand; at each city the sun magnet and
// warm number tile are pulled off and a snowflake and a blue tile slap on. Thailand turns ice-blue at the end.
// Values are illustrative (labelled "ภาพจำลอง"). VHS scanlines and chroma bleed over everything. 20 s.
export const demo: StyleDemo = { id: "M10", name: "พยากรณ์อากาศยุค 80", frames: 600, cover: 520, sizes: ["9x16", "16x9"] };

const FR: Front = { from: 40, to: 520, lat0: 47, lat1: 8 };
const HIGH: [number, number] = [104, 46];
const ASIA = bbox([[86, 6], [128, 50]]);
const THAI = bbox([[96.5, 5.5], [106.5, 21]]);

// Cities: [name, lon/lat, before, after, magnet offset].
const CITIES: [string, [number, number], number, number, [number, number]?][] = [
  ["ปักกิ่ง", [116.4, 39.9], 9, -3],
  ["ฮานอย", [105.85, 21.03], 25, 14, [70, -40]],
  ["เลย", [101.72, 17.49], 27, 9, [70, 20]],
  ["เชียงใหม่", [98.99, 18.79], 29, 15, [-90, -30]],
  ["กรุงเทพฯ", [100.5, 13.76], 33, 24, [0, 40]],
];
const HEADS: WeatherHead[] = [
  [0, "พยากรณ์อากาศ", "ความกดอากาศสูงจากจีน"],
  [120, "มวลอากาศเย็น", "แผ่ลงมาปกคลุมจีนตอนใต้"],
  [300, "มวลอากาศเย็น", "ถึงเวียดนาม ลาว และภาคเหนือ"],
  [430, "ประเทศไทย", "อุณหภูมิลดลงทั่วประเทศ", "−8 ถึง −18°C"],
];

const shiftX = (c: Cam, width: number, height: number, k: number): Cam => {
  if (!k) return c;
  const [lon, lat] = projectionFor(c, width, height).invert!([width / 2 - width * k, height / 2])!;
  return { lon, lat, scale: c.scale };
};

// Chunky magnetic wind arrow (white rim, blue body), grows along a lon/lat curve.
const WindArrow = ({ pts, start, end }: { pts: [number, number][]; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const k = interpolate(frame, [start, start + 40], [0, 1], clamp);
  const o = interpolate(frame, [end - 20, end], [1, 0], clamp);
  if (k <= 0 || o <= 0) return null;
  const xy = pts.map((p) => projection(p)).filter(Boolean) as [number, number][];
  const n = Math.max(2, Math.round(xy.length * k * 10) / 10);
  const cut = xy.slice(0, Math.ceil(n));
  const a = cut[cut.length - 2], b = cut[cut.length - 1];
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const d = `M${cut.map((p) => p.join(",")).join(" L")}`;
  return (
    <g opacity={o} strokeLinejoin="round" strokeLinecap="round">
      <path d={d} fill="none" stroke="#0b1a66" strokeOpacity={0.5} strokeWidth={44 * s} transform={`translate(${8 * s},${10 * s})`} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={44 * s} />
      <path d={d} fill="none" stroke={FRONT} strokeWidth={28 * s} />
      <path transform={`translate(${b[0]},${b[1]}) rotate(${ang})`} d={`M${50 * s} 0 L${-10 * s} ${-44 * s} L${-10 * s} ${44 * s} Z`} fill={FRONT} stroke="#fff" strokeWidth={8 * s} />
    </g>
  );
};

const Audio = () => (
  <>
    <Sfx src={SFX.swell} at={0} volume={0.25} />
    <Sfx src={SFX.pop} at={10} volume={0.3} />
    <Bed id="wind" from={20} to={600} volume={0.18} fade={40} />
    <Sfx src={SFX.whoosh} at={124} volume={0.25} />
    {CITIES.map(([name, at]) => <Sfx key={name} src={SFX.pop} at={passAt(FR, at) + 8} volume={0.26} />)}
    <Sfx src={SFX.riser} at={370} volume={0.18} />
    <Bed id="wind_storm" from={400} to={600} volume={0.14} fade={50} />
    <Sfx src={SFX.hit} at={430} volume={0.3} />
  </>
);

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const wide = width > height;
  const v = (f: typeof ASIA, k: number, lift: number) => shiftX(view(f, width, height, k, wide ? Math.min(lift, 0) - 0.04 : lift), width, height, wide ? 0.2 : 0);
  const cam = camAt(
    [
      { frame: 0, cam: v(ASIA, wide ? 0.85 : 0.92, 0.02) },
      { frame: 360, cam: v(ASIA, wide ? 0.9 : 0.98, 0.02) },
      { frame: 460, cam: v(THAI, 0.76, -0.04) },
      { frame: 600, cam: v(THAI, 0.8, -0.04) },
    ],
    frame,
  );
  const chill = interpolate(frame, [450, 490], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Audio />
      <VHS>
        <MapFrame cam={cam}>
          <Board chill={[{ id: "764", k: chill }]} />
          <ColdAir front={FR} lon0={wide ? 10 : 78} lon1={wide ? 200 : 144} />
          <WindArrow pts={[[106, 42], [110, 35], [110, 29], [107, 23], [102.5, 17]]} start={130} end={420} />
          <Magnet at={[93, 30]} on={60}><CloudSym s={Math.min(width, height) / 1080} /></Magnet>
          <Magnet at={[120, 31]} on={80}><CloudSym s={Math.min(width, height) / 1080 * 0.8} /></Magnet>
          <Magnet at={HIGH} on={10}><HSymbol s={Math.min(width, height) / 1080} label="ความกดอากาศสูง" /></Magnet>
          {CITIES.map(([name, at, a, b, off]) => <City key={name} name={name} at={at} from={a} to={b} pass={passAt(FR, at)} dx={off?.[0] ?? 0} dy={off?.[1] ?? 0} />)}
          <Magnet at={[103.5, 9.5]} on={470}><Snowflake s={Math.min(width, height) / 1080} r={56} /></Magnet>
        </MapFrame>
        <Screen heads={HEADS} date="อังคาร 14 ธ.ค." kicker="M10 · พยากรณ์อากาศยุค 80" />
      </VHS>
    </AbsoluteFill>
  );
};
