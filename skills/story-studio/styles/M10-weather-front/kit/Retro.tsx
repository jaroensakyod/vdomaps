import { loadFont } from "@remotion/google-fonts/Kodchasan";
import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { camForFeature, projectionFor, type Cam } from "../../../components/camera";
import { countries, country } from "../../../components/data";
import { useMap } from "../../../components/Map";

// M10 1980s TV weather: a chroma-key-blue studio map (flat green land with a thick white coast and a hard drop
// shadow, like a painted board), chunky magnetic symbols (H, snowflake, sun, cloud, number tiles) that slap onto the
// map, a classic blue cold-front line with big triangles, all seen through VHS: scanlines, a little chroma bleed,
// soft focus, a tracking-noise band. Bold rounded Thai (Kodchasan), an extruded title and an analogue clock strip.
export const font = loadFont("normal", { weights: ["500", "700"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const KEY = "#1d3fd6"; // chroma-key blue sea
export const KEY_DEEP = "#132a9e";
export const LAND = "#7bbf4e";
export const LAND_EDGE = "#3c6d24";
export const SUN = "#ffd23f";
export const WARM = "#ff6a2b";
export const ICE = "#bfe8ff";
export const FRONT = "#1d5cff";
export const INK = "#141428";

export const view = (f: Parameters<typeof camForFeature>[0], width: number, height: number, k = 1, lift = 0.08): Cam => {
  const c = camForFeature(f, width, height, 0.02);
  const scaled = { ...c, scale: c.scale * k };
  const p = projectionFor(scaled, width, height);
  const [lon, lat] = p.invert!([width / 2, height / 2 + height * lift])!;
  return { lon, lat, scale: scaled.scale };
};

// "Slap": a magnet lands — starts big and lifted (shadow far), drops to the board with a small overshoot.
export const useSlap = (at: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return { k: 0, lift: 1 };
  const k = spring({ frame: frame - at, fps, config: { damping: 9, mass: 0.5, stiffness: 220 } });
  return { k: Math.min(1, k), lift: Math.max(0, 1 - k) };
};

// The studio board: chroma-blue sea with a soft studio light, flat land, thick white coast, hard drop shadow.
export const Board = ({ chill = [] }: { chill?: { id: string; k: number }[] }) => {
  const { path, s, width, height } = useMap();
  const land = path(countries) ?? "";
  return (
    <g>
      <defs>
        <radialGradient id="m10-studio" cx="45%" cy="40%" r="75%">
          <stop offset="0" stopColor="#2f57f0" />
          <stop offset="0.7" stopColor={KEY} />
          <stop offset="1" stopColor={KEY_DEEP} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill="url(#m10-studio)" />
      <path d={land} fill="#0b1a66" opacity={0.55} transform={`translate(${9 * s},${12 * s})`} />
      <path d={land} fill="none" stroke="#ffffff" strokeWidth={9 * s} strokeLinejoin="round" />
      <path d={land} fill={LAND} stroke={LAND_EDGE} strokeWidth={1.6 * s} strokeLinejoin="round" />
      {chill.map((c) => (c.k > 0 ? <path key={c.id} d={path(country(c.id)) ?? ""} fill={ICE} opacity={c.k * 0.9} stroke="#fff" strokeWidth={3 * s} /> : null))}
    </g>
  );
};

// Front: latitude at a longitude for a frame (east side leads, two slow sines for the bumps).
export type Front = { from: number; to: number; lat0: number; lat1: number; tilt?: number };
const SPREAD = Easing.bezier(0.35, 0, 0.3, 1);
export const frontLat = (fr: Front, lon: number, frame: number) => {
  const t = SPREAD(interpolate(frame, [fr.from, fr.to], [0, 1], clamp));
  const base = fr.lat0 - t * (fr.lat0 - fr.lat1);
  return base - (lon - 100) * (fr.tilt ?? 0.12) + 1.2 * Math.sin(lon * 0.32 + frame * 0.02) + 0.5 * Math.sin(lon * 0.9 - frame * 0.03);
};
export const passAt = (fr: Front, [lon, lat]: [number, number], max = 1200) => {
  for (let f = 0; f < max; f += 2) if (frontLat(fr, lon, f) <= lat) return f;
  return 1e9;
};

// Cold air: flat pale-blue screen-print over the board north of the front, diagonal hatch, then the classic front
// line (white-edged blue) with big blue triangles pointing the way it moves.
export const ColdAir = ({ front: fr, lon0 = 78, lon1 = 144, fadeIn = [20, 50] }: { front: Front; lon0?: number; lon1?: number; fadeIn?: [number, number] }) => {
  const frame = useCurrentFrame();
  const { projection, s, width } = useMap();
  const n = Math.round((lon1 - lon0) / 0.6) + 1;
  const lons = Array.from({ length: n }, (_, i) => lon0 + i * 0.6);
  const front = lons.map((lon) => projection([lon, frontLat(fr, lon, frame)])).filter(Boolean) as [number, number][];
  const north = [...lons].reverse().map((lon) => projection([lon, 80])).filter(Boolean) as [number, number][];
  if (front.length < 2) return null;
  const body = `M${front.map((p) => p.join(",")).join(" L")} L${north.map((p) => p.join(",")).join(" L")} Z`;
  const edge = `M${front.map((p) => p.join(",")).join(" L")}`;
  const k = interpolate(frame, fadeIn, [0, 1], clamp);
  const tri: string[] = [];
  let acc = 0;
  for (let i = 1; i < front.length; i++) {
    const [x0, y0] = front[i - 1];
    const [x1, y1] = front[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    acc += seg;
    if (acc > 96 * s && x1 > 0 && x1 < width) {
      acc = 0;
      const nx = -(y1 - y0) / seg;
      const ny = (x1 - x0) / seg;
      const dir = ny < 0 ? -1 : 1;
      const z = 22 * s;
      tri.push(`M${x1 - ((x1 - x0) / seg) * z},${y1 - ((y1 - y0) / seg) * z} L${x1 + nx * dir * z * 1.5},${y1 + ny * dir * z * 1.5} L${x1 + ((x1 - x0) / seg) * z},${y1 + ((y1 - y0) / seg) * z} Z`);
    }
  }
  return (
    <g opacity={k}>
      <defs>
        <pattern id="m10-hatch" width={22 * s} height={22 * s} patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <rect width={22 * s} height={7 * s} fill="#ffffff" opacity={0.28} />
        </pattern>
      </defs>
      <path d={body} fill={ICE} opacity={0.38} />
      <path d={body} fill="url(#m10-hatch)" />
      <path d={edge} fill="none" stroke="#fff" strokeWidth={17 * s} strokeLinejoin="round" strokeLinecap="round" />
      {tri.map((d, i) => <path key={`w${i}`} d={d} fill="#fff" stroke="#fff" strokeWidth={8 * s} strokeLinejoin="round" />)}
      <path d={edge} fill="none" stroke={FRONT} strokeWidth={9 * s} strokeLinejoin="round" strokeLinecap="round" />
      {tri.map((d, i) => <path key={i} d={d} fill={FRONT} />)}
    </g>
  );
};

// A magnetic piece at lon/lat that slaps on at `at`: hard shadow shrinks as it lands. Children draw at (0,0).
export const Magnet = ({ at, on, off, dx = 0, dy = 0, children }: { at: [number, number]; on: number; off?: number; dx?: number; dy?: number; children: ReactNode }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const { k, lift } = useSlap(on);
  const p = projection(at);
  if (!p || k <= 0) return null;
  const gone = off !== undefined ? interpolate(frame, [off, off + 6], [0, 1], clamp) : 0;
  if (gone >= 1) return null;
  const sc = 1 + lift * 0.45 + gone * 0.3;
  const sh = (6 + lift * 34 + gone * 30) * s;
  return (
    <g transform={`translate(${p[0] + dx * s},${p[1] + dy * s - gone * 60 * s})`} opacity={1 - gone}>
      <g transform={`translate(${sh},${sh * 1.2}) scale(${sc})`} opacity={0.4} style={{ filter: "brightness(0)" }}>{children}</g>
      <g transform={`scale(${sc})`}>{children}</g>
    </g>
  );
};

// Magnetic symbols (drawn around 0,0 at size s).
export const HSymbol = ({ s, label }: { s: number; label?: string }) => (
  <g fontFamily={font}>
    <rect x={-70 * s} y={-70 * s} width={140 * s} height={140 * s} rx={30 * s} fill={FRONT} stroke="#fff" strokeWidth={7 * s} />
    <text y={46 * s} textAnchor="middle" fontSize={128 * s} fontWeight={700} fill="#fff">H</text>
    {label && (
      <g>
        <rect x={-180 * s} y={84 * s} width={360 * s} height={56 * s} rx={28 * s} fill="#fff" />
        <text y={124 * s} textAnchor="middle" fontSize={32 * s} fontWeight={700} fill={INK}>{label}</text>
      </g>
    )}
  </g>
);
export const Snowflake = ({ s, r = 46 }: { s: number; r?: number }) => (
  <g>
    <circle r={r * s} fill="#fff" stroke={FRONT} strokeWidth={6 * s} />
    {[0, 60, 120].map((a) => (
      <g key={a} transform={`rotate(${a})`} stroke={FRONT} strokeWidth={6 * s} strokeLinecap="round">
        <line x1={-r * 0.68 * s} x2={r * 0.68 * s} y1={0} y2={0} />
        <line x1={r * 0.42 * s} y1={0} x2={r * 0.6 * s} y2={-r * 0.18 * s} />
        <line x1={r * 0.42 * s} y1={0} x2={r * 0.6 * s} y2={r * 0.18 * s} />
        <line x1={-r * 0.42 * s} y1={0} x2={-r * 0.6 * s} y2={-r * 0.18 * s} />
        <line x1={-r * 0.42 * s} y1={0} x2={-r * 0.6 * s} y2={r * 0.18 * s} />
      </g>
    ))}
  </g>
);
export const SunSym = ({ s, r = 40 }: { s: number; r?: number }) => (
  <g>
    {Array.from({ length: 10 }, (_, i) => (
      <path key={i} transform={`rotate(${i * 36})`} d={`M${-10 * s} ${-r * 1.05 * s} L0 ${-r * 1.55 * s} L${10 * s} ${-r * 1.05 * s} Z`} fill={WARM} stroke="#fff" strokeWidth={3 * s} strokeLinejoin="round" />
    ))}
    <circle r={r * s} fill={SUN} stroke="#fff" strokeWidth={6 * s} />
  </g>
);
export const CloudSym = ({ s }: { s: number }) => (
  <path d={`M${-70 * s} ${20 * s} a${30 * s} ${30 * s} 0 0 1 ${20 * s} ${-52 * s} a${38 * s} ${38 * s} 0 0 1 ${70 * s} ${-14 * s} a${30 * s} ${30 * s} 0 0 1 ${48 * s} ${40 * s} a${24 * s} ${24 * s} 0 0 1 ${-6 * s} ${46 * s} Z`} fill="#fff" stroke="#c9d4ff" strokeWidth={5 * s} />
);
// Number tile: white magnetic tile with a chunky number; `cold` switches to the blue tile.
export const Tile = ({ s, text, cold }: { s: number; text: string; cold?: boolean }) => (
  <g fontFamily={font}>
    <rect x={-62 * s} y={-40 * s} width={124 * s} height={80 * s} rx={16 * s} fill={cold ? FRONT : "#fff"} stroke={cold ? "#fff" : WARM} strokeWidth={6 * s} />
    <text y={22 * s} textAnchor="middle" fontSize={60 * s} fontWeight={700} fill={cold ? "#fff" : WARM}>{text}</text>
  </g>
);

// City: name sign + a sun magnet and warm tile; when the front passes, they are pulled off and a snowflake and a
// blue tile slap on.
export const City = ({ name, at, from, to, pass, show = 70, dx = 0, dy = 0, size = 0.8 }: { name: string; at: [number, number]; from: number; to: number; pass: number; show?: number; dx?: number; dy?: number; size?: number }) => {
  const s = useMap().s * size;
  dx /= size;
  dy /= size;
  const cold = pass + 8;
  return (
    <>
      <Magnet at={at} on={show - 6} dx={dx * size} dy={(dy + 70) * size}>
        <g fontFamily={font}>
          <rect x={-(name.length * 13 + 26) * s} y={-24 * s} width={(name.length * 26 + 52) * s} height={48 * s} rx={10 * s} fill={INK} />
          <text y={13 * s} textAnchor="middle" fontSize={32 * s} fontWeight={700} fill="#fff">{name}</text>
        </g>
      </Magnet>
      <Magnet at={at} on={show} off={pass} dx={(dx - 70) * size} dy={dy * size}><SunSym s={s * 0.8} /></Magnet>
      <Magnet at={at} on={show + 6} off={pass} dx={(dx + 66) * size} dy={dy * size}><Tile s={s} text={`${from}°`} /></Magnet>
      <Magnet at={at} on={cold} dx={(dx - 70) * size} dy={dy * size}><Snowflake s={s * 0.9} /></Magnet>
      <Magnet at={at} on={cold + 6} dx={(dx + 66) * size} dy={dy * size}><Tile s={s} text={`${to}°`} cold /></Magnet>
    </>
  );
};

// VHS over everything: soft focus + chroma bleed on the picture, scanlines, a rolling tracking band, head noise.
export const VHS = ({ children }: { children: ReactNode }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const bandY = ((frame * 9) % (height * 1.6)) - height * 0.3;
  const jit = (random(`j${frame}`) - 0.5) * 2 * s;
  return (
    <AbsoluteFill style={{ background: KEY_DEEP, overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: "url(#m10-bleed) blur(0.5px) saturate(1.25) contrast(1.05)", transform: `translateX(${jit}px)` }}>{children}</AbsoluteFill>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="m10-bleed" x="-2%" y="0" width="104%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={4 * s} dy={0} result="r2" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
          <feBlend in="r2" in2="gb" mode="screen" />
        </filter>
      </svg>
      <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) ${2 * s}px, rgba(255,255,255,0.03) ${2 * s}px, rgba(255,255,255,0.03) ${4 * s}px)`, mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: bandY, height: 26 * s, background: "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.16), rgba(255,255,255,0))", filter: `blur(${2 * s}px)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 14 * s, background: `repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 ${3 * s}px, rgba(0,0,0,0.4) ${3 * s}px ${9 * s}px)`, opacity: 0.35 + random(`n${frame}`) * 0.3, transform: `translateX(${random(`nx${frame}`) * 40 * s}px)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

// Extruded 80s title: stacked offsets for the 3D block, yellow face, white rim.
export const Extruded = ({ text, size, color = SUN, depth = 8 }: { text: string; size: number; color?: string; depth?: number }) => (
  <span style={{ fontFamily: font, fontWeight: 700, fontSize: size, color, WebkitTextStroke: `${size * 0.03}px #fff`, paintOrder: "stroke fill", textShadow: Array.from({ length: depth }, (_, i) => `${i + 1}px ${i + 1}px 0 ${i < depth - 2 ? "#b8361a" : INK}`).join(", ") + `, ${depth + 4}px ${depth + 6}px ${depth}px rgba(0,0,0,0.5)`, lineHeight: 1.25 }}>{text}</span>
);

// Forecast screen over the board: extruded programme title, a white head strip that swaps per shot, a big
// number on magnet tiles, and a bottom strip with an analogue clock, the date and the "ภาพจำลอง" note.
export type WeatherHead = [number, string, string, string?];
export const Screen = ({ heads, title = "ข่าวอากาศ", date, note = "ภาพจำลอง · ไม่ใช่ข้อมูลพยากรณ์จริง", kicker }: { heads: WeatherHead[]; title?: string; date: string; note?: string; kicker?: string }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const wide = width > height;
  const cur = [...heads].reverse().find(([f]) => frame >= f) ?? heads[0];
  const k = spring({ frame: frame - cur[0], fps, config: { damping: 10, mass: 0.6 } });
  const big = cur[3] ? spring({ frame: frame - cur[0] - 10, fps, config: { damping: 8, mass: 0.5 } }) : 0;
  const mins = 7 * 60 + 25 + frame / 30; // the clock runs (a minute per second of video)
  const hA = (mins / 720) * 360, mA = ((mins % 60) / 60) * 360;
  const R = 46 * s;
  return (
    <AbsoluteFill style={{ fontFamily: font, color: "#fff", lineHeight: 1.3 }}>
      {kicker && <div style={{ position: "absolute", top: 18 * s, left: "50%", transform: "translateX(-50%)", background: INK, padding: `${2 * s}px ${22 * s}px`, borderRadius: 8 * s, fontSize: 28 * s, fontWeight: 700, color: SUN, whiteSpace: "nowrap", textShadow: `-2px 0 rgba(255,0,80,0.6), 2px 0 rgba(0,220,255,0.6)` }}>{kicker}</div>}
      <div style={{ position: "absolute", top: height * (wide ? 0.07 : 0.045), left: 54 * s }}>
        <Extruded text={title} size={(wide ? 76 : 92) * s} />
      </div>
      <div style={{ position: "absolute", left: 54 * s, right: wide ? width * 0.56 : 54 * s, top: height * (wide ? 0.22 : 0.115), transform: `translateX(${(1 - k) * -80 * s}px)`, opacity: Math.min(1, k * 1.5) }}>
        <div style={{ display: "inline-block", background: WARM, color: "#fff", fontSize: 28 * s, fontWeight: 700, padding: `${2 * s}px ${20 * s}px`, borderRadius: `${14 * s}px ${14 * s}px 0 0` }}>{cur[1]}</div>
        <div style={{ background: "#fff", color: INK, fontSize: 52 * s, fontWeight: 700, padding: `${8 * s}px ${24 * s}px`, borderRadius: `0 ${18 * s}px ${18 * s}px ${18 * s}px`, boxShadow: `${8 * s}px ${10 * s}px 0 rgba(11,26,102,0.7)` }}>{cur[2]}</div>
      </div>
      <div style={{ position: "absolute", left: 54 * s, bottom: height * (wide ? 0.0 : 0.06) + 150 * s }}>
        {cur[3] && (
          <div style={{ display: "inline-block", transform: `scale(${0.6 + 0.4 * big}) rotate(${(1 - big) * -6}deg)`, transformOrigin: "left top", background: FRONT, border: `${6 * s}px solid #fff`, borderRadius: 18 * s, padding: `${2 * s}px ${24 * s}px`, fontSize: 84 * s, fontWeight: 700, boxShadow: `${10 * s}px ${12 * s}px 0 rgba(11,26,102,0.7)`, opacity: big }}>{cur[3]}</div>
        )}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: height * (wide ? 0.0 : 0.06), height: 124 * s, background: "linear-gradient(180deg, #2b2b4a, #101024)", borderTop: `${5 * s}px solid ${SUN}`, display: "flex", alignItems: "center", gap: 26 * s, padding: `0 ${40 * s}px` }}>
        <svg width={R * 2 + 8 * s} height={R * 2 + 8 * s} style={{ flex: "none" }}>
          <g transform={`translate(${R + 4 * s},${R + 4 * s})`}>
            <circle r={R} fill="#f4f1e8" stroke="#888" strokeWidth={4 * s} />
            {Array.from({ length: 12 }, (_, i) => <line key={i} transform={`rotate(${i * 30})`} y1={-R * 0.78} y2={-R * 0.92} stroke={INK} strokeWidth={3 * s} />)}
            <line transform={`rotate(${hA})`} y1={4 * s} y2={-R * 0.5} stroke={INK} strokeWidth={6 * s} strokeLinecap="round" />
            <line transform={`rotate(${mA})`} y1={6 * s} y2={-R * 0.78} stroke={INK} strokeWidth={4 * s} strokeLinecap="round" />
            <circle r={5 * s} fill={WARM} />
          </g>
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 40 * s, fontWeight: 700, color: SUN }}>{date}</div>
          <div style={{ fontSize: 24 * s, fontWeight: 500, opacity: 0.85 }}>{note}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
