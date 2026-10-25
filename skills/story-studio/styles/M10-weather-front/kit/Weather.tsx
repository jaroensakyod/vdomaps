import { loadFont } from "@remotion/google-fonts/Kanit";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { camForFeature, projectionFor, type Cam } from "../../../components/camera";
import { country } from "../../../components/data";
import { useMap } from "../../../components/Map";

// M10 weather-front kit: a cold air mass (blue body, drifting cloud noise, glowing edge, front line with
// triangles, wind streaks) spreading south from a high-pressure "H", city temperature chips that count down
// when the front passes, a country that glows cold, and the forecast screen (top bar, head card, legend).

export const font = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ICE = "#7fd4ff";
export const COLD = "#2f7bff";
export const WARM = "#ff8a3d";
export const PANEL = "rgba(8,14,26,0.86)";

// Camera on a feature, zoomed by k, with the subject lifted into the upper part of the frame (cards sit below).
export const view = (f: Parameters<typeof camForFeature>[0], width: number, height: number, k = 1, lift = 0.08): Cam => {
  const c = camForFeature(f, width, height, 0.02);
  const scaled = { ...c, scale: c.scale * k };
  const p = projectionFor(scaled, width, height);
  const [lon, lat] = p.invert!([width / 2, height / 2 + height * lift])!;
  return { lon, lat, scale: scaled.scale };
};

// Front: latitude at a longitude for a frame. `from`/`to` = frames of the sweep, `lat0` → `lat1` its range.
// The east side leads (tilt), two drifting sines give the bumps.
export type Front = { from: number; to: number; lat0: number; lat1: number; tilt?: number };
const SPREAD = Easing.bezier(0.35, 0, 0.3, 1);
export const frontLat = (fr: Front, lon: number, frame: number) => {
  const t = SPREAD(interpolate(frame, [fr.from, fr.to], [0, 1], clamp));
  const base = fr.lat0 - t * (fr.lat0 - fr.lat1);
  return base - (lon - 100) * (fr.tilt ?? 0.12) + 1.4 * Math.sin(lon * 0.32 + frame * 0.035) + 0.7 * Math.sin(lon * 0.9 - frame * 0.05);
};
// Frame when the front reaches a point (searches up to `max` frames).
export const passAt = (fr: Front, [lon, lat]: [number, number], max = 1200) => {
  for (let f = 0; f < max; f += 2) if (frontLat(fr, lon, f) <= lat) return f;
  return 1e9;
};

// The air mass: blue body clipped north of the front, cloud texture, glowing edge, triangles, wind streaks.
export const ColdMass = ({ front: fr, lon0 = 78, lon1 = 144, wind = [84, 128], fadeIn = [20, 60] }: { front: Front; lon0?: number; lon1?: number; wind?: [number, number]; fadeIn?: [number, number] }) => {
  const frame = useCurrentFrame();
  const { projection, s, width, height } = useMap();
  const n = Math.round((lon1 - lon0) / 0.6) + 1;
  const lons = Array.from({ length: n }, (_, i) => lon0 + i * 0.6);
  const front = lons.map((lon) => projection([lon, frontLat(fr, lon, frame)])).filter(Boolean) as [number, number][];
  const north = [...lons].reverse().map((lon) => projection([lon, 80])).filter(Boolean) as [number, number][];
  if (front.length < 2) return null;
  const body = `M${front.map((p) => p.join(",")).join(" L")} L${north.map((p) => p.join(",")).join(" L")} Z`;
  const edge = `M${front.map((p) => p.join(",")).join(" L")}`;
  const k = interpolate(frame, fadeIn, [0, 1], clamp);
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
  const streaks = Array.from({ length: Math.round((260 * (wind[1] - wind[0])) / 44) }, (_, i) => {
    const r1 = Math.sin(i * 12.9898) * 43758.5453;
    const r2 = Math.sin(i * 78.233) * 12543.123;
    const lonA = wind[0] + (r1 - Math.floor(r1)) * (wind[1] - wind[0]);
    const life = 90;
    const age = (frame + i * 7) % life;
    const latA = 52 - (r2 - Math.floor(r2)) * 44;
    const lat = latA - age * 0.09;
    const lon = lonA - age * 0.035;
    if (lat < frontLat(fr, lon, frame) + 0.4) return null;
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

// High pressure: "H" with isobars that widen as the cold air spreads.
export const HighPressure = ({ at, label = "ความกดอากาศสูง", grow: [g0, g1] = [20, 470] }: { at: [number, number]; label?: string; grow?: [number, number] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p) return null;
  const k = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  const grow = interpolate(frame, [g0, g1], [1, 1.9], clamp);
  return (
    <g>
      {[1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx={p[0]} cy={p[1] + i * 18 * s * grow} rx={i * 95 * s * grow} ry={i * 62 * s * grow} fill="none" stroke="#dfefff" strokeWidth={2.4 * s} strokeOpacity={0.55 * k} strokeDasharray={i % 2 ? undefined : `${12 * s} ${8 * s}`} />
      ))}
      <g transform={`translate(${p[0]},${p[1]}) scale(${k})`}>
        <circle r={58 * s} fill="#1a4fd0" stroke="#fff" strokeWidth={4 * s} />
        <text textAnchor="middle" y={26 * s} fontSize={76 * s} fontWeight={900} fill="#fff" fontFamily={font}>H</text>
        <rect x={-150 * s} y={66 * s} width={300 * s} height={48 * s} rx={10 * s} fill="rgba(8,14,26,0.85)" />
        <text textAnchor="middle" y={100 * s} fontSize={30 * s} fontWeight={700} fill="#fff" fontFamily={font}>{label}</text>
      </g>
    </g>
  );
};

// City pin + temperature chip; the value counts down when `pass` (frame) is reached, colour warm → cold.
export const CityTemp = ({ name, at, from, to, pass, show: showAt = 70, off = [16, -24] }: { name: string; at: [number, number]; from: number; to: number; pass: number; show?: number; off?: [number, number] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p) return null;
  const show = spring({ frame: frame - showAt, fps, config: { damping: 14 } });
  const t = interpolate(frame, [pass, pass + 45], [0, 1], clamp);
  const v = Math.round(from + (to - from) * t);
  const col = t < 0.5 ? WARM : COLD;
  return (
    <g transform={`translate(${p[0]},${p[1]})`} opacity={show}>
      <circle r={9 * s} fill="#fff" stroke={col} strokeWidth={4 * s} />
      <g transform={`translate(${off[0] * s},${off[1] * s}) scale(${0.85 + 0.15 * show})`}>
        <rect width={230 * s} height={54 * s} rx={27 * s} fill="rgba(8,14,26,0.85)" stroke={col} strokeWidth={3 * s} />
        <circle cx={27 * s} cy={27 * s} r={19 * s} fill={col} />
        <text x={27 * s} y={36 * s} textAnchor="middle" fontSize={24 * s} fontWeight={900} fill="#fff" fontFamily={font}>{t < 0.5 ? "☀" : "❄"}</text>
        <text x={54 * s} y={37 * s} fontSize={26 * s} fontWeight={700} fill="#fff" fontFamily={font}>{name}</text>
        <text x={220 * s} y={38 * s} textAnchor="end" fontSize={30 * s} fontWeight={900} fill={col === COLD ? ICE : "#ffb37a"} fontFamily={font}>{v}°</text>
      </g>
    </g>
  );
};

// A country glows cold once the mass covers it (ISO numeric id, world-atlas).
export const Chill = ({ id = "764", from, color = ICE }: { id?: string; from: number; color?: string }) => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  const k = interpolate(frame, [from, from + 50], [0, 1], clamp);
  if (k <= 0) return null;
  const d = path(country(id)) ?? "";
  return (
    <g opacity={k}>
      <path d={d} fill={color} fillOpacity={0.18} />
      <path d={d} fill="none" stroke={color} strokeWidth={12 * s} strokeOpacity={0.4} style={{ filter: `blur(${6 * s}px)` }} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={2.5 * s} />
    </g>
  );
};

export const Borders = ({ ids = ["764", "418", "116", "704", "104", "156", "496", "458"] }: { ids?: string[] }) => {
  const { path, s } = useMap();
  return (
    <g fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={1.2 * s}>
      {ids.map((id) => <path key={id} d={path(country(id)) ?? ""} />)}
    </g>
  );
};

// Forecast screen (HTML over the map): kicker, top bar with day counter, head card that swaps on `heads`,
// cold→hot legend and the "ภาพจำลอง" tag. heads: [frame, tag, headline, big number?].
export type WeatherHead = [number, string, string, string?];
export const WeatherScreen = ({ heads, kicker, bar = "พยากรณ์อากาศ", days = [30, 480, 5], note = "ภาพจำลอง · ไม่ใช่ข้อมูลพยากรณ์จริง" }: { heads: WeatherHead[]; kicker?: string; bar?: string; days?: [number, number, number]; note?: string }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const cur = [...heads].reverse().find(([f]) => frame >= f) ?? heads[0];
  const swap = spring({ frame: frame - cur[0], fps, config: { damping: 16 } });
  const day = Math.min(days[2], 1 + Math.floor(interpolate(frame, [days[0], days[1]], [0, days[2]], clamp)));
  const wide = width > height;
  return (
    <AbsoluteFill style={{ fontFamily: font, color: "#fff", lineHeight: 1.35 }}>
      {kicker && <div style={{ position: "absolute", top: height * 0.018, left: 0, right: 0, textAlign: "center", fontSize: 30 * s, fontWeight: 700, opacity: 0.8, textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>{kicker}</div>}
      <div style={{ position: "absolute", top: height * (wide ? 0.08 : 0.045), left: 50 * s, right: 50 * s, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ background: COLD, padding: `${4 * s}px ${16 * s}px`, borderRadius: 8 * s, fontWeight: 900, fontSize: 32 * s }}>{bar}</div>
        <div style={{ background: "rgba(8,14,26,0.8)", border: `${2 * s}px solid rgba(255,255,255,0.25)`, padding: `${2 * s}px ${16 * s}px`, borderRadius: 30 * s, fontWeight: 700, fontSize: 30 * s }}>วันที่ {day} / {days[2]}</div>
      </div>
      <div style={{ position: "absolute", left: 50 * s, right: wide ? width * 0.55 : 50 * s, top: height * (wide ? 0.18 : 0.1), background: PANEL, borderLeft: `${8 * s}px solid ${COLD}`, borderRadius: 14 * s, padding: `${18 * s}px ${30 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)` }}>
        <span style={{ background: "rgba(255,255,255,0.14)", padding: `${2 * s}px ${14 * s}px`, borderRadius: 30 * s, fontSize: 26 * s, fontWeight: 700 }}>{cur[1]}</span>
        <div style={{ fontSize: 54 * s, fontWeight: 900, marginTop: 6 * s, opacity: swap, transform: `translateY(${(1 - swap) * 14 * s}px)` }}>{cur[2]}</div>
        {cur[3] && <div style={{ fontSize: 84 * s, fontWeight: 900, color: ICE, opacity: swap }}>{cur[3]}</div>}
      </div>
      <div style={{ position: "absolute", left: 50 * s, right: wide ? width * 0.55 : 50 * s, bottom: height * (wide ? 0.07 : 0.1), display: "flex", flexDirection: "column", gap: 10 * s }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * s, fontSize: 26 * s, fontWeight: 700 }}>
          <span>เย็น</span>
          <div style={{ flex: 1, height: 18 * s, borderRadius: 9 * s, background: `linear-gradient(90deg, #1a4fd0, ${ICE}, #f2f2a0, ${WARM}, #d12f2f)` }} />
          <span>ร้อน</span>
        </div>
        <div style={{ alignSelf: "center", background: "rgba(8,14,26,0.8)", padding: `${4 * s}px ${18 * s}px`, borderRadius: 10 * s, fontSize: 24 * s, opacity: 0.9 }}>{note}</div>
      </div>
    </AbsoluteFill>
  );
};
