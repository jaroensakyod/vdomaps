import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../components/Arrow";
import { camAt, projectionFor, type Cam } from "../../components/camera";
import { MapFrame } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { bbox } from "../../components/Region";
import { Bed, SFX, Sfx } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Borders, Chill, CityTemp, clamp, ColdMass, HighPressure, ICE, passAt, view, WeatherScreen, type Front, type WeatherHead } from "./kit/Weather";

// M10 weather front: TV-forecast look on NASA Blue Marble. A cold air mass spreads south from a Siberian high
// over China and Vietnam into Thailand; city chips count down as the front passes. Values are illustrative
// (labelled "ภาพจำลอง"). 20 s.
export const demo: StyleDemo = { id: "M10", name: "ข่าวอากาศ แนวปะทะอากาศเย็น", frames: 600, cover: 520, sizes: ["9x16", "16x9"] };

const FRONT: Front = { from: 40, to: 520, lat0: 47, lat1: 8 };
const HIGH: [number, number] = [104, 46];
const ASIA = bbox([[86, 6], [128, 50]]);
const THAI = bbox([[96.5, 5.5], [106.5, 21]]);

// Cities: [name, lon/lat, temperature before, after, chip offset].
const CITIES: [string, [number, number], number, number, [number, number]?][] = [
  ["ปักกิ่ง", [116.4, 39.9], 9, -3],
  ["ฮานอย", [105.85, 21.03], 25, 14],
  ["เลย", [101.72, 17.49], 27, 9, [30, 30]],
  ["เชียงใหม่", [98.99, 18.79], 29, 15, [-255, -40]],
  ["กรุงเทพฯ", [100.5, 13.76], 33, 24, [16, 20]],
];
const HEADS: WeatherHead[] = [
  [0, "พยากรณ์อากาศ", "ความกดอากาศสูงจากจีน"],
  [120, "มวลอากาศเย็น", "แผ่ลงมาปกคลุมจีนตอนใต้"],
  [300, "มวลอากาศเย็น", "ถึงเวียดนาม ลาว และภาคเหนือ"],
  [430, "ประเทศไทย", "อุณหภูมิลดลงทั่วประเทศ", "−8 ถึง −18°C"],
];

// 16:9: the cards sit on the left, so move the subject into the right part of the frame.
const shiftX = (c: Cam, width: number, height: number, k: number): Cam => {
  if (!k) return c;
  const [lon, lat] = projectionFor(c, width, height).invert!([width / 2 - width * k, height / 2])!;
  return { lon, lat, scale: c.scale };
};

// Sound: wind that builds as the cold air spreads, gusts when it reaches Thailand, soft UI sounds on the
// pins, cards and temperature drops.
const Audio = () => (
  <>
    <Sfx src={SFX.swell} at={0} volume={0.3} />
    <Sfx src={SFX.pop} at={10} volume={0.3} />
    <Bed id="wind" from={20} to={600} volume={0.22} fade={40} />
    <Sfx src={SFX.pop} at={72} volume={0.22} />
    <Sfx src={SFX.pop} at={120} volume={0.25} />
    <Sfx src={SFX.whoosh} at={124} volume={0.3} />
    <Sfx src={SFX.pop} at={300} volume={0.25} />
    {CITIES.map(([name, at]) => <Sfx key={name} src={SFX.tick} at={passAt(FRONT, at)} volume={0.28} />)}
    <Sfx src={SFX.whoosh} at={354} volume={0.35} />
    <Sfx src={SFX.riser} at={370} volume={0.22} />
    <Bed id="wind_storm" from={400} to={600} volume={0.16} fade={50} />
    <Sfx src={SFX.hit} at={430} volume={0.35} />
  </>
);

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const wide = width > height;
  const v = (f: typeof ASIA, k: number, lift: number) => shiftX(view(f, width, height, k, wide ? Math.min(lift, 0) - 0.06 : lift), width, height, wide ? 0.2 : 0);
  const cam = camAt(
    [
      { frame: 0, cam: v(ASIA, wide ? 0.85 : 0.95, 0.04) },
      { frame: 360, cam: v(ASIA, wide ? 0.9 : 1.0, 0.04) },
      { frame: 460, cam: v(THAI, 0.78, -0.05) },
      { frame: 600, cam: v(THAI, 0.82, -0.05) },
    ],
    frame,
  );
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <Audio />
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "sea" }]} />
        <Borders />
        <Chill id="764" from={450} />
        <ColdMass front={FRONT} lon0={wide ? 10 : 78} lon1={wide ? 200 : 144} wind={wide ? [60, 140] : [84, 128]} />
        <Arrow points={[[106, 42], [111, 32], [108, 24], [102, 16.5]]} start={130} end={330} color={ICE} width={26} opacity={interpolate(frame, [400, 450], [1, 0], clamp)} />
        <HighPressure at={HIGH} />
        {CITIES.map(([name, at, a, b, off]) => <CityTemp key={name} name={name} at={at} from={a} to={b} off={off} pass={passAt(FRONT, at)} />)}
      </MapFrame>
      <WeatherScreen heads={HEADS} kicker="M10 · ข่าวอากาศ แนวปะทะอากาศเย็น" />
    </AbsoluteFill>
  );
};
