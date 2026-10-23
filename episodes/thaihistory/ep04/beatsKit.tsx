import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useMap } from "../../../components/Map";
import { buildBeats } from "../../../components/subs.mjs";
import { clamp, font, GOLD, LAYOUT, RED, type Chapter } from "../news/kit";
import beatsText from "./beats.json";
import timing from "./timing.json";

// Episode 4 timing (same layout as episodes 1–3): beats, lookup by id, word cue frames.
export const BEATS = buildBeats(timing, beatsText, LAYOUT);
export const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
export const wf = (id: string, word: string, k = 0.5, n = 0) => {
  const b = B[id];
  if (!b) throw new Error(`no beat ${id}`);
  const hit = (b.words ?? []).filter((w) => w.w === word)[n];
  return hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
};
export const at = (id: string, k = 0) => Math.round(B[id].start + B[id].len * k);
export const VOICE: [number, number][] = BEATS.map((b) => [b.start, b.end]);

// A chapter of this episode: the news-kit contract plus recorded sound (<Bed>, <Hit>) placed by the chapter.
export type Chapter4 = Chapter & { Audio?: () => ReactNode };

export const SIAM_C = GOLD;
export const REBEL_C = RED;
export const LAO_C = "#3fbf6a";
export const KHMER_C = "#c8a070";
export const VIET_C = "#3fa7d6";
export const CHINA_C = "#c0186a";

// Rough extents in the 1770s–80s (approximate — said in the description, not on screen).
export const ZONES = {
  siam: { color: SIAM_C, ring: [[99.2, 17.6], [100.8, 17.9], [101.6, 17.2], [102.2, 16.2], [104.4, 15.8], [104.5, 14.3], [102.9, 11.6], [101.4, 12.6], [100.9, 13.4], [100.5, 13.5], [100.0, 13.2], [99.95, 12.6], [99.8, 11.8], [99.5, 10.8], [99.3, 10.0], [99.9, 9.2], [100.3, 8.4], [100.4, 7.2], [101.3, 6.8], [100.6, 6.4], [100.1, 6.5], [99.6, 7.4], [98.4, 8.0], [98.6, 9.5], [98.7, 10.4], [99.2, 11.2], [99.4, 12.2], [99.2, 13.3], [98.6, 14.6], [98.9, 15.4], [98.5, 16.5]] as [number, number][] },
  lao: { color: LAO_C, ring: [[100.8, 17.9], [101.0, 19.6], [102.2, 20.6], [103.9, 19.4], [105.2, 18.0], [106.4, 16.4], [106.6, 14.6], [105.4, 13.9], [104.4, 14.3], [104.4, 15.8], [102.2, 16.2], [101.6, 17.2]] as [number, number][] },
  khmer: { color: KHMER_C, ring: [[102.9, 11.6], [104.5, 14.3], [105.4, 13.9], [106.6, 14.6], [107.5, 12.6], [106.4, 11.2], [105.1, 10.4], [103.6, 10.5]] as [number, number][] },
  viet: { color: VIET_C, ring: [[106.6, 14.6], [106.4, 16.4], [105.2, 18.0], [105.8, 19.6], [106.8, 20.8], [107.8, 21.5], [108.8, 15.5], [109.4, 12.4], [107.5, 10.4], [106.4, 9.6], [105.1, 10.4], [106.4, 11.2], [107.5, 12.6]] as [number, number][] },
};
export type ZoneId = keyof typeof ZONES;

export const Zones = ({ k, colors = {} }: { k: Partial<Record<ZoneId, number>>; colors?: Partial<Record<ZoneId, string>> }) => {
  const { projection, s } = useMap();
  const frame = useCurrentFrame();
  return (
    <g>
      {(Object.keys(ZONES) as ZoneId[]).map((id, i) => {
        const kk = k[id] ?? 0;
        if (kk <= 0) return null;
        const color = colors[id] ?? ZONES[id].color;
        const pts = ZONES[id].ring.map((p) => projection(p)).filter(Boolean) as [number, number][];
        if (pts.length < 3) return null;
        const d = `M${pts.map((p) => p.join(",")).join(" L")} Z`;
        const pulse = 0.85 + 0.15 * Math.sin(frame * 0.15 + i);
        return (
          <g key={id} opacity={kk}>
            <path d={d} fill={color} fillOpacity={0.22 * pulse} />
            <path d={d} fill="none" stroke={color} strokeWidth={10 * s} strokeOpacity={0.3} style={{ filter: `blur(${6 * s}px)` }} strokeLinejoin="round" />
            <path d={d} fill="none" stroke={color} strokeWidth={3 * s} strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

// A glowing city dot.
export const CityDot = ({ at: c, color = SIAM_C, r = 14, start = 0, end = 1e9 }: { at: [number, number]; color?: string; r?: number; start?: number; end?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(c);
  if (!p || frame < start || frame > end + 10) return null;
  const k = interpolate(frame, [start, start + 10, end, end + 10], [0, 1, 1, 0], clamp);
  const pulse = 1 + 0.25 * Math.sin(frame * 0.25);
  return (
    <g transform={`translate(${p[0]},${p[1]})`} opacity={k}>
      <circle r={r * 2.2 * pulse * s} fill={color} opacity={0.25} />
      <circle r={r * s} fill={color} stroke="#fff" strokeWidth={3 * s} />
    </g>
  );
};

// Ring of guards / siege ring around a point (radius in degrees), dashed and slowly turning.
export const Ring = ({ at: c, r, color = RED, start, end = 1e9 }: { at: [number, number]; r: number; color?: string; start: number; end?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(c);
  if (!p || frame < start || frame > end + 12) return null;
  const k = interpolate(frame, [start, start + 12, end, end + 12], [0, 1, 1, 0], clamp);
  const pxDeg = (projection.scale() * Math.PI) / 180;
  const rr = Math.max(r * pxDeg, 30 * s) * (0.6 + 0.4 * k);
  return (
    <g opacity={k}>
      <circle cx={p[0]} cy={p[1]} r={rr} fill={color} fillOpacity={0.1} stroke={color} strokeWidth={10 * s} strokeOpacity={0.3} style={{ filter: `blur(${5 * s}px)` }} />
      <circle cx={p[0]} cy={p[1]} r={rr} fill="none" stroke={color} strokeWidth={3 * s} strokeDasharray={`${14 * s} ${9 * s}`} transform={`rotate(${frame * 0.6},${p[0]},${p[1]})`} />
    </g>
  );
};

// Distance line between two points with a label in the middle.
export const Measure = ({ a, b, text, start, color = GOLD }: { a: [number, number]; b: [number, number]; text: string; start: number; color?: string }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const pa = projection(a);
  const pb = projection(b);
  if (!pa || !pb || frame < start) return null;
  const k = interpolate(frame, [start, start + 20], [0, 1], clamp);
  const ex = pa[0] + (pb[0] - pa[0]) * k;
  const ey = pa[1] + (pb[1] - pa[1]) * k;
  const mx = (pa[0] + pb[0]) / 2;
  const my = (pa[1] + pb[1]) / 2;
  return (
    <g>
      <line x1={pa[0]} y1={pa[1]} x2={ex} y2={ey} stroke={color} strokeWidth={4 * s} strokeDasharray={`${10 * s} ${8 * s}`} />
      {k >= 1 && (
        <g transform={`translate(${mx},${my - 30 * s})`}>
          <rect x={-110 * s} y={-30 * s} width={220 * s} height={56 * s} rx={10 * s} fill="rgba(8,14,26,0.86)" stroke={color} strokeWidth={2 * s} />
          <text textAnchor="middle" y={10 * s} fontSize={34 * s} fontWeight={900} fill="#fff" fontFamily={font}>{text}</text>
        </g>
      )}
    </g>
  );
};
