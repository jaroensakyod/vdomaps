import { loadFont } from "@remotion/google-fonts/Kanit";
import type { FeatureCollection, LineString, MultiLineString } from "geojson";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { camForFeature, projectionFor, type Cam } from "../../../components/camera";
import { useMap } from "../../../components/Map";
import { useJson } from "../../../components/useJson";
import type { ArmyPt } from "./Army";
import { RETREAT, TEMPS } from "./data1812";

// Minard look (after Charles Minard's 1869 chart of the 1812 campaign) on satellite imagery: a tan advance band and
// a black retreat band whose width is the number of men, a troop counter riding the head of the band, a temperature
// line under the retreat, snow and pulsing city pins. Use with kit/Army.tsx (bands) and kit/minard.ts (data).
export const font = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["thai", "latin"] }).fontFamily;
export const TAN = "#e3b77a"; // Minard's advance
export const BLACK = "#15161b"; // Minard's retreat
export const GOLD = "#ffc94a"; // advance counter, highlights
export const ICE = "#9fd4ff"; // temperature line
export const RED = "#ff3b30";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const fade = (frame: number, f0: number, f1: number, d = 10) => interpolate(frame, [f0, f0 + d, f1 - d, f1], [0, 1, 1, 0], clamp);

// Camera on a feature, zoomed by k, with the subject lifted (positive lift moves it up the screen).
export const view = (f: Parameters<typeof camForFeature>[0], width: number, height: number, k = 1, lift = 0.08): Cam => {
  const c = camForFeature(f, width, height, 0.02);
  const scaled = { ...c, scale: c.scale * k };
  const p = projectionFor(scaled, width, height);
  const [lon, lat] = p.invert!([width / 2, height / 2 + height * lift])!;
  return { lon, lat, scale: scaled.scale };
};

// Share of the route's length (in degrees) at which the route first reaches `lon` (advance: east; retreat: west).
const lens = (pts: ArmyPt[]) => pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
export const kAt = (pts: ArmyPt[], lon: number) => {
  const l = lens(pts);
  const total = l.reduce((a, b) => a + b, 0);
  const east = pts[pts.length - 1][0] > pts[0][0];
  let acc = 0;
  for (let i = 0; i < l.length; i++) {
    const [a, b] = [pts[i][0], pts[i + 1][0]];
    if (east ? lon <= b : lon >= b) return (acc + l[i] * Math.max(0, Math.min(1, (lon - a) / (b - a || 1)))) / total;
    acc += l[i];
  }
  return 1;
};
// [frame, lon] keys → band progress k at `frame` (0 before the first key).
export const headAt = (keys: [number, number][], pts: ArmyPt[], frame: number) => {
  const lon = interpolate(frame, keys.map((k) => k[0]), keys.map((k) => k[1]), clamp);
  return frame < keys[0][0] ? 0 : kAt(pts, lon);
};
// Longitude of the band head at `frame`.
export const lonAt = (keys: [number, number][], frame: number) => interpolate(frame, keys.map((k) => k[0]), keys.map((k) => k[1]), clamp);

// Natural Earth rivers: thin cyan; named rivers glow gold (`hi` 0 → 1).
export const Rivers = ({ file = "data/eu-rivers.json", hi = {} }: { file?: string; hi?: Record<string, number> }) => {
  const { path, projection, s } = useMap();
  const data = useJson<{ rivers: FeatureCollection<LineString | MultiLineString, { name: string }> }>(file);
  const pxDeg = (projection.scale() * Math.PI) / 180;
  const w = Math.min(Math.max(pxDeg * 0.004, 1.6 * s), 7 * s);
  const all = data?.rivers?.features ?? [];
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {all.map((f, i) => <path key={`l${i}`} d={path(f) ?? ""} stroke="#7fd4ff" strokeWidth={w} strokeOpacity={0.5} />)}
      {all.map((f, i) => {
        const k = hi[f.properties.name] ?? 0;
        return k > 0 ? <path key={`h${i}`} d={path(f) ?? ""} stroke="#fff3a6" strokeWidth={w * 3} strokeOpacity={k} style={{ filter: `drop-shadow(0 0 ${8 * s}px #ffd84a)` }} /> : null;
      })}
    </g>
  );
};

// City pin: pulsing ring, dot, outlined Thai name; `k` fades it.
export const Pin = ({ at, text, k, color = RED, size = 1, dy = -30 }: { at: [number, number]; text: string; k: number; color?: string; size?: number; dy?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const xy = projection(at);
  if (!xy) return null;
  const cycle = (frame % 36) / 36;
  return (
    <g transform={`translate(${xy[0]},${xy[1]})`} opacity={k}>
      <circle r={(9 + cycle * 30) * s} fill="none" stroke={color} strokeWidth={3 * s} opacity={1 - cycle} />
      <circle r={9 * s} fill={color} stroke="#fff" strokeWidth={3 * s} />
      <text y={dy * s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={40 * s * size} fill="#fff" stroke="#0b1020" strokeWidth={9 * s} paintOrder="stroke" strokeLinejoin="round">{text}</text>
    </g>
  );
};

// Fire glow over a city (Moscow burning) + a dark grade over the map.
export const FireGlow = ({ at, k }: { at: [number, number]; k: number }) => {
  const { projection, width, height, s } = useMap();
  const frame = useCurrentFrame();
  if (k <= 0) return null;
  const p = projection(at);
  const flicker = 1 + Math.sin(frame * 0.4) * 0.04 + Math.sin(frame * 1.1) * 0.03;
  return (
    <g>
      <defs>
        <radialGradient id="mn-fire">
          <stop offset="0" stopColor="#ff8a2a" stopOpacity={0.75} />
          <stop offset="0.45" stopColor="#ff5a1a" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ff5a1a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill="#06112b" opacity={0.35 * k} />
      {p && <circle cx={p[0]} cy={p[1]} r={260 * s * flicker} fill="url(#mn-fire)" opacity={k} style={{ mixBlendMode: "screen" }} />}
    </g>
  );
};

// Snow over the whole map.
export const MapSnow = ({ k, n = 110 }: { k: number; n?: number }) => {
  const frame = useCurrentFrame();
  const { width, height, s } = useMap();
  if (k <= 0) return null;
  return (
    <g opacity={k}>
      {Array.from({ length: n }, (_, i) => {
        const sp = 0.8 + random(`sp${i}`) * 1.4;
        const sy = (random(`sy${i}`) * height + frame * sp * 2.6) % height;
        const sx = (random(`sx${i}`) * width + Math.sin(frame * 0.05 + i) * 10 * s + frame * 0.8) % width;
        return <circle key={i} cx={sx} cy={sy} r={(1.6 + random(`sr${i}`) * 2.4) * s} fill="#fff" opacity={0.8} />;
      })}
    </g>
  );
};

// Latitude of the retreat route at a longitude (to drop lines from the band to the chart).
const latAt = (lon: number) => {
  for (let i = 0; i < RETREAT.length - 1; i++) {
    const [a, b] = [RETREAT[i], RETREAT[i + 1]];
    if (lon <= a[0] && lon >= b[0]) return a[1] + ((b[1] - a[1]) * (a[0] - lon)) / (a[0] - b[0] || 1);
  }
  return RETREAT[RETREAT.length - 1][1];
};

// Minard's temperature line under the retreat, drawn up to longitude `upto` (east → west). `top` = chart top (px),
// `h` = chart height for 0 → −40 °C. `hot` 0–1 rings the coldest reading.
export const TempChart = ({ k, upto, top, h, hot = 0 }: { k: number; upto: number; top: number; h: number; hot?: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const X = (lon: number) => projection([lon, 54.4])?.[0] ?? 0;
  const Y = (t: number) => top + 34 * s + (-t / 40) * h;
  const shown = TEMPS.filter((p) => p[0] >= upto);
  const nxt = TEMPS.find((p) => p[0] < upto);
  const last = shown[shown.length - 1];
  const tip: [number, number] | null = nxt && last ? [upto, last[1] + ((nxt[1] - last[1]) * (last[0] - upto)) / (last[0] - nxt[0])] : null;
  const pts = [...shown.map((p) => [p[0], p[1]] as [number, number]), ...(tip ? [tip] : [])];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${X(p[0])},${Y(p[1])}`).join(" ");
  const x0 = Math.min(X(38.2), X(24.6));
  const x1 = Math.max(X(38.2), X(24.6));
  const LABEL = new Set(["18 Oct", "14 Nov", "6 Dec"]);
  const TH: Record<string, string> = { "18 Oct": "18 ต.ค.", "14 Nov": "14 พ.ย.", "6 Dec": "6 ธ.ค." };
  return (
    <g opacity={k} fontFamily={font}>
      <rect x={x0 - 14 * s} y={top} width={x1 - x0 + 28 * s} height={Y(-44) - top} rx={12 * s} fill="rgba(8,14,26,0.62)" />
      <text x={x0} y={top + 26 * s} fontSize={24 * s} fontWeight={700} fill={ICE}>อุณหภูมิ °C ตอนถอยทัพ (Minard)</text>
      {[0, -10, -20, -30].map((t) => (
        <g key={t}>
          <line x1={x0} x2={x1} y1={Y(t)} y2={Y(t)} stroke="#fff" strokeOpacity={0.18} strokeWidth={1.5 * s} strokeDasharray={`${6 * s} ${6 * s}`} />
          <text x={x1 + 4 * s} y={Y(t) + 7 * s} fontSize={20 * s} fill="#fff" opacity={0.6} textAnchor="end">{t === 0 ? "0" : `−${-t}`}</text>
        </g>
      ))}
      {shown.map((p) => {
        const by = projection([p[0], latAt(p[0])])?.[1] ?? 0;
        return <line key={`v${p[0]}`} x1={X(p[0])} x2={X(p[0])} y1={by + 10 * s} y2={Y(p[1])} stroke="#fff" strokeOpacity={0.3} strokeWidth={1.4 * s} />;
      })}
      <path d={d} fill="none" stroke={ICE} strokeWidth={5 * s} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 ${6 * s}px ${ICE})` }} />
      {shown.map((p) => (
        <g key={p[0]}>
          <circle cx={X(p[0])} cy={Y(p[1])} r={6 * s} fill="#fff" stroke={ICE} strokeWidth={2.5 * s} />
          {LABEL.has(p[2]) && (
            <text x={X(p[0])} y={Y(p[1]) + 32 * s} textAnchor="middle" fontSize={22 * s} fontWeight={700} fill="#fff" stroke="#0b1020" strokeWidth={6 * s} paintOrder="stroke">{`${p[1] === 0 ? "0" : `−${-p[1]}`}° · ${TH[p[2]]}`}</text>
          )}
        </g>
      ))}
      {hot > 0 && (
        <g transform={`translate(${X(26.7)},${Y(-37)})`} opacity={hot}>
          <circle r={(14 + 8 * Math.sin(hot * 6)) * s} fill="none" stroke={RED} strokeWidth={4 * s} />
          <rect x={-70 * s} y={-82 * s} width={140 * s} height={48 * s} rx={10 * s} fill={RED} />
          <text y={-47 * s} textAnchor="middle" fontSize={32 * s} fontWeight={900} fill="#fff">−37 °C</text>
        </g>
      )}
    </g>
  );
};

// Dark card with a coloured bar: tag, headline, big number, legend chip. Top on phones, left column on 16:9.
export type Head = { f: number; tag: string; head: string; stat?: string; label?: string; color?: string };
export const HeadCard = ({ heads, from, to, legend }: { heads: Head[]; from: number; to: number; legend?: string }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  if (frame < from || frame > to) return null;
  const list = heads.filter((h) => frame >= h.f);
  if (!list.length) return null;
  const h = list[list.length - 1];
  const k = spring({ frame: frame - from, fps, config: { damping: 14 } });
  const o = interpolate(frame, [to - 8, to], [1, 0], clamp);
  const swap = spring({ frame: frame - h.f, fps, config: { damping: 16 } });
  const color = h.color ?? GOLD;
  return (
    <div style={{ position: "absolute", left: 50 * s, right: vertical ? 50 * s : undefined, width: vertical ? undefined : 560 * s, top: vertical ? height * 0.1 : 110 * s, transform: `translateX(${(1 - k) * -60 * s}px)`, opacity: k * o, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.86)", borderLeft: `${8 * s}px solid ${color}`, borderRadius: 14 * s, padding: `${18 * s}px ${30 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)`, lineHeight: 1.35 }}>
      <span style={{ background: "rgba(255,255,255,0.14)", padding: `${2 * s}px ${14 * s}px`, borderRadius: 30 * s, fontSize: 26 * s, fontWeight: 700 }}>{h.tag}</span>
      <div style={{ fontSize: 54 * s, fontWeight: 900, marginTop: 6 * s, transform: `translateY(${(1 - swap) * 14 * s}px)`, opacity: swap }}>{h.head}</div>
      {h.stat && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 * s, opacity: swap }}>
          <span style={{ fontSize: 88 * s, fontWeight: 900, color, lineHeight: 1.15 }}>{h.stat}</span>
          {h.label && <span style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.9 }}>{h.label}</span>}
        </div>
      )}
      {legend && (
        <div style={{ display: "flex", alignItems: "center", gap: 14 * s, marginTop: 8 * s, fontSize: 26 * s, fontWeight: 700, opacity: 0.9 }}>
          <svg width={90 * s} height={30 * s}><path d={`M0 ${6 * s} L${90 * s} ${12 * s} L${90 * s} ${18 * s} L0 ${24 * s} Z`} fill={TAN} stroke="#1b1d24" strokeWidth={1.4 * s} /></svg>
          {legend}
        </div>
      )}
    </div>
  );
};
