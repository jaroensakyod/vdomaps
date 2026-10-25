import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../components/Arrow";
import { camAt } from "../../components/camera";
import { country } from "../../components/data";
import { MapFrame, useMap } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { bbox } from "../../components/Region";
import { Bed, SFX, Sfx } from "../../components/Sound";
import { font, view } from "../thaihistory/news/kit";

// Weather-forecast style test (20 s): a cold air mass spreads south from a Siberian high over
// China and Vietnam into Thailand. All values are illustrative — labelled "ภาพจำลอง" on screen.
export const COLD_FRONT_FRAMES = 600;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ICE = "#7fd4ff";
const COLD = "#2f7bff";
const WARM = "#ff8a3d";
const HIGH: [number, number] = [104, 46];

const ASIA = bbox([[86, 6], [128, 50]]);
const THAI = bbox([[96.5, 5.5], [106.5, 21]]);

// Front latitude at a longitude: sweeps south over the clip, the east side leads, with drifting bumps.
const SPREAD = Easing.bezier(0.35, 0, 0.3, 1);
const frontLat = (lon: number, frame: number) => {
  const t = SPREAD(interpolate(frame, [40, 520], [0, 1], clamp));
  const base = 47 - t * 39;
  return base - (lon - 100) * 0.12 + 1.4 * Math.sin(lon * 0.32 + frame * 0.035) + 0.7 * Math.sin(lon * 0.9 - frame * 0.05);
};

// Cities: [name, lon/lat, temperature before, after].
const CITIES: [string, [number, number], number, number, [number, number]?][] = [
  ["ปักกิ่ง", [116.4, 39.9], 9, -3],
  ["ฮานอย", [105.85, 21.03], 25, 14],
  ["เลย", [101.72, 17.49], 27, 9, [30, 30]],
  ["เชียงใหม่", [98.99, 18.79], 29, 15, [-215, -40]],
  ["กรุงเทพฯ", [100.5, 13.76], 33, 24, [16, 20]],
];
// Frame when the front reaches a point.
const passAt = ([lon, lat]: [number, number]) => {
  for (let f = 0; f < COLD_FRONT_FRAMES; f += 2) if (frontLat(lon, f) <= lat) return f;
  return 1e9;
};

// The air mass: blue body clipped to the area north of the front, drifting cloud texture, glowing edge,
// cold-front line with triangles, wind streaks inside.
const ColdMass = () => {
  const frame = useCurrentFrame();
  const { projection, s, width, height } = useMap();
  const lons = Array.from({ length: 111 }, (_, i) => 78 + i * 0.6);
  const front = lons.map((lon) => projection([lon, frontLat(lon, frame)])).filter(Boolean) as [number, number][];
  const north = [...lons].reverse().map((lon) => projection([lon, 62])).filter(Boolean) as [number, number][];
  if (front.length < 2) return null;
  const body = `M${front.map((p) => p.join(",")).join(" L")} L${north.map((p) => p.join(",")).join(" L")} Z`;
  const edge = `M${front.map((p) => p.join(",")).join(" L")}`;
  const k = interpolate(frame, [20, 60], [0, 1], clamp);
  // cold-front triangles every ~70 px along the front line, pointing south
  const tri: string[] = [];
  let acc = 0;
  for (let i = 1; i < front.length; i++) {
    const [x0, y0] = front[i - 1];
    const [x1, y1] = front[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    acc += seg;
    if (acc > 70 * s && x1 > 0 && x1 < width) {
      acc = 0;
      const nx = -(y1 - y0) / seg;
      const ny = (x1 - x0) / seg;
      const dir = ny < 0 ? -1 : 1;
      const z = 13 * s;
      tri.push(`M${x1 - ((x1 - x0) / seg) * z},${y1 - ((y1 - y0) / seg) * z} L${x1 + nx * dir * z * 1.3},${y1 + ny * dir * z * 1.3} L${x1 + ((x1 - x0) / seg) * z},${y1 + ((y1 - y0) / seg) * z} Z`);
    }
  }
  // wind streaks: particles flowing SSW, drawn only inside the mass
  const streaks = Array.from({ length: 260 }, (_, i) => {
    const r1 = Math.sin(i * 12.9898) * 43758.5453;
    const r2 = Math.sin(i * 78.233) * 12543.123;
    const lon0 = 84 + (r1 - Math.floor(r1)) * 44;
    const life = 90;
    const age = (frame + i * 7) % life;
    const lat0 = 52 - (r2 - Math.floor(r2)) * 44;
    const lat = lat0 - age * 0.09;
    const lon = lon0 - age * 0.035;
    if (lat < frontLat(lon, frame) + 0.4) return null;
    const a = projection([lon, lat]);
    const b = projection([lon + 0.25, lat + 0.65]);
    if (!a || !b) return null;
    const o = Math.sin((age / life) * Math.PI) * 0.75;
    return <line key={i} x1={b[0]} y1={b[1]} x2={a[0]} y2={a[1]} stroke="#e8f8ff" strokeWidth={2.2 * s} strokeLinecap="round" opacity={o} />;
  });
  const drift = frame * 1.6 * s;
  return (
    <g opacity={k}>
      <defs>
        <clipPath id="coldclip">
          <path d={body} />
        </clipPath>
        <linearGradient id="coldfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a4fd0" stopOpacity={0.5} />
          <stop offset="1" stopColor={COLD} stopOpacity={0.24} />
        </linearGradient>
        <filter id="coldnoise" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves={3} seed={7} />
          <feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.95  0 0 0 0 1  0 0 0 1.4 -0.55" />
        </filter>
      </defs>
      <path d={body} fill="url(#coldfill)" />
      <g clipPath="url(#coldclip)">
        <rect x={-width + drift * 0.6} y={-height + drift} width={width * 3} height={height * 3} filter="url(#coldnoise)" opacity={0.42} />
        <path d={edge} fill="none" stroke={ICE} strokeWidth={70 * s} strokeOpacity={0.35} style={{ filter: `blur(${22 * s}px)` }} />
        {streaks}
      </g>
      <path d={edge} fill="none" stroke={ICE} strokeWidth={14 * s} strokeOpacity={0.35} style={{ filter: `blur(${6 * s}px)` }} />
      <path d={edge} fill="none" stroke="#2a6bff" strokeWidth={5 * s} strokeLinejoin="round" />
      {tri.map((d, i) => <path key={i} d={d} fill="#2a6bff" stroke="#cfeaff" strokeWidth={1.5 * s} />)}
    </g>
  );
};

// Siberian high: "H" with isobars that widen as the cold air spreads.
const HighPressure = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { projection, s } = useMap();
  const p = projection(HIGH);
  if (!p) return null;
  const k = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  const grow = interpolate(frame, [20, 470], [1, 1.9], clamp);
  return (
    <g>
      {[1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx={p[0]} cy={p[1] + i * 18 * s * grow} rx={i * 95 * s * grow} ry={i * 62 * s * grow} fill="none" stroke="#dfefff" strokeWidth={2.4 * s} strokeOpacity={0.55 * k} strokeDasharray={i % 2 ? undefined : `${12 * s} ${8 * s}`} />
      ))}
      <g transform={`translate(${p[0]},${p[1]}) scale(${k})`}>
        <circle r={58 * s} fill="#1a4fd0" stroke="#fff" strokeWidth={4 * s} />
        <text textAnchor="middle" y={26 * s} fontSize={76 * s} fontWeight={900} fill="#fff" fontFamily={font}>H</text>
        <rect x={-150 * s} y={66 * s} width={300 * s} height={48 * s} rx={10 * s} fill="rgba(8,14,26,0.85)" />
        <text textAnchor="middle" y={100 * s} fontSize={30 * s} fontWeight={700} fill="#fff" fontFamily={font}>ความกดอากาศสูง</text>
      </g>
    </g>
  );
};

// City pin + temperature chip; the value counts down after the front passes, colour warm → cold.
const CityTemp = ({ name, at, from, to, off = [16, -24] }: { name: string; at: [number, number]; from: number; to: number; off?: [number, number] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p) return null;
  const show = spring({ frame: frame - 70, fps, config: { damping: 14 } });
  const pass = passAt(at);
  const t = interpolate(frame, [pass, pass + 45], [0, 1], clamp);
  const v = Math.round(from + (to - from) * t);
  const col = t < 0.5 ? WARM : COLD;
  return (
    <g transform={`translate(${p[0]},${p[1]})`} opacity={show}>
      <circle r={9 * s} fill="#fff" stroke={col} strokeWidth={4 * s} />
      <g transform={`translate(${off[0] * s},${off[1] * s}) scale(${0.85 + 0.15 * show})`}>
        <rect width={190 * s} height={54 * s} rx={27 * s} fill="rgba(8,14,26,0.85)" stroke={col} strokeWidth={3 * s} />
        <circle cx={27 * s} cy={27 * s} r={19 * s} fill={col} />
        <text x={27 * s} y={36 * s} textAnchor="middle" fontSize={24 * s} fontWeight={900} fill="#fff" fontFamily={font}>{t < 0.5 ? "☀" : "❄"}</text>
        <text x={54 * s} y={37 * s} fontSize={26 * s} fontWeight={700} fill="#fff" fontFamily={font}>{name}</text>
        <text x={182 * s} y={38 * s} textAnchor="end" fontSize={30 * s} fontWeight={900} fill={col === COLD ? ICE : "#ffb37a"} fontFamily={font}>{v}°</text>
      </g>
    </g>
  );
};

// Thailand glows cold once the mass covers it.
const ThaiChill = () => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  const k = interpolate(frame, [450, 500], [0, 1], clamp);
  if (k <= 0) return null;
  const d = path(country("764")) ?? "";
  return (
    <g opacity={k}>
      <path d={d} fill={ICE} fillOpacity={0.18} />
      <path d={d} fill="none" stroke={ICE} strokeWidth={12 * s} strokeOpacity={0.4} style={{ filter: `blur(${6 * s}px)` }} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={2.5 * s} />
    </g>
  );
};

const Borders = () => {
  const { path, s } = useMap();
  return (
    <g fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={1.2 * s}>
      {["764", "418", "116", "704", "104", "156", "496", "458"].map((id) => <path key={id} d={path(country(id)) ?? ""} />)}
    </g>
  );
};

// Top bar + headline card + legend + simulation tag (HTML over the map).
const HEADS: [number, string, string, string?][] = [
  [0, "พยากรณ์อากาศ", "ความกดอากาศสูงจากจีน"],
  [120, "มวลอากาศเย็น", "แผ่ลงมาปกคลุมจีนตอนใต้"],
  [300, "มวลอากาศเย็น", "ถึงเวียดนาม ลาว และภาคเหนือ"],
  [430, "ประเทศไทย", "อุณหภูมิลดลงทั่วประเทศ", "−8 ถึง −18°C"],
];
const Screen = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const cur = [...HEADS].reverse().find(([f]) => frame >= f)!;
  const swap = spring({ frame: frame - cur[0], fps, config: { damping: 16 } });
  const day = Math.min(5, 1 + Math.floor(interpolate(frame, [30, 480], [0, 5], clamp)));
  return (
    <AbsoluteFill style={{ fontFamily: font, color: "#fff", lineHeight: 1.35 }}>
      <div style={{ position: "absolute", top: height * 0.045, left: 50 * s, right: 50 * s, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ background: COLD, padding: `${4 * s}px ${16 * s}px`, borderRadius: 8 * s, fontWeight: 900, fontSize: 32 * s }}>พยากรณ์อากาศ</div>
        <div style={{ background: "rgba(8,14,26,0.8)", border: `${2 * s}px solid rgba(255,255,255,0.25)`, padding: `${2 * s}px ${16 * s}px`, borderRadius: 30 * s, fontWeight: 700, fontSize: 30 * s }}>วันที่ {day} / 5</div>
      </div>
      <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, background: "rgba(8,14,26,0.86)", borderLeft: `${8 * s}px solid ${COLD}`, borderRadius: 14 * s, padding: `${18 * s}px ${30 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)` }}>
        <span style={{ background: "rgba(255,255,255,0.14)", padding: `${2 * s}px ${14 * s}px`, borderRadius: 30 * s, fontSize: 26 * s, fontWeight: 700 }}>{cur[1]}</span>
        <div style={{ fontSize: 54 * s, fontWeight: 900, marginTop: 6 * s, opacity: swap, transform: `translateY(${(1 - swap) * 14 * s}px)` }}>{cur[2]}</div>
        {cur[3] && <div style={{ fontSize: 84 * s, fontWeight: 900, color: ICE, opacity: swap }}>{cur[3]}</div>}
      </div>
      <div style={{ position: "absolute", left: 50 * s, right: 50 * s, bottom: height * 0.1, display: "flex", flexDirection: "column", gap: 10 * s }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * s, fontSize: 26 * s, fontWeight: 700 }}>
          <span>เย็น</span>
          <div style={{ flex: 1, height: 18 * s, borderRadius: 9 * s, background: `linear-gradient(90deg, #1a4fd0, ${ICE}, #f2f2a0, ${WARM}, #d12f2f)` }} />
          <span>ร้อน</span>
        </div>
        <div style={{ alignSelf: "center", background: "rgba(8,14,26,0.8)", padding: `${4 * s}px ${18 * s}px`, borderRadius: 10 * s, fontSize: 24 * s, opacity: 0.9 }}>ภาพจำลองเพื่อทดสอบรูปแบบ · ไม่ใช่ข้อมูลพยากรณ์จริง</div>
      </div>
    </AbsoluteFill>
  );
};

// Sound: wind that builds as the cold air spreads, gusts when it reaches Thailand, soft UI sounds on the
// pins, cards and temperature drops (no narration, still kept low).
const Audio = () => (
  <>
    <Sfx src={SFX.swell} at={0} volume={0.3} />
    <Sfx src={SFX.pop} at={10} volume={0.3} />
    <Bed id="wind" from={20} to={600} volume={0.22} fade={40} />
    <Sfx src={SFX.pop} at={72} volume={0.22} />
    <Sfx src={SFX.pop} at={120} volume={0.25} />
    <Sfx src={SFX.whoosh} at={124} volume={0.3} />
    <Sfx src={SFX.pop} at={300} volume={0.25} />
    {CITIES.map(([name, at]) => <Sfx key={name} src={SFX.tick} at={passAt(at)} volume={0.28} />)}
    <Sfx src={SFX.whoosh} at={354} volume={0.35} />
    <Sfx src={SFX.riser} at={370} volume={0.22} />
    <Bed id="wind_storm" from={400} to={600} volume={0.16} fade={50} />
    <Sfx src={SFX.hit} at={430} volume={0.35} />
  </>
);

export const ColdFront = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = camAt(
    [
      { frame: 0, cam: view(ASIA, width, height, 0.95, 0.04) },
      { frame: 360, cam: view(ASIA, width, height, 1.0, 0.04) },
      { frame: 460, cam: view(THAI, width, height, 0.78, -0.05) },
      { frame: 600, cam: view(THAI, width, height, 0.82, -0.05) },
    ],
    frame,
  );
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <Audio />
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "sea" }]} />
        <Borders />
        <ThaiChill />
        <ColdMass />
        <Arrow points={[[106, 42], [111, 32], [108, 24], [102, 16.5]]} start={130} end={330} color={ICE} width={26} opacity={interpolate(frame, [400, 450], [1, 0], clamp)} />
        <HighPressure />
        {CITIES.map(([name, at, a, b, off]) => <CityTemp key={name} name={name} at={at} from={a} to={b} off={off} />)}
      </MapFrame>
      <Screen />
    </AbsoluteFill>
  );
};
