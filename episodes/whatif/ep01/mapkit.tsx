import { geoCircle, geoInterpolate } from "d3-geo";
import type { Feature, MultiPolygon, Polygon } from "geojson";
import { interpolate, useCurrentFrame } from "remotion";
import { useMap } from "../../../components/Map";
import { clamp, display } from "../../worldhistory/kit/news";

// Map overlays shared by every chapter of ep 1. Chapter-specific ones live in the chapter files.

// A country/area tint: soft glow + translucent fill + white edge. k = 0..1.
export const AreaTint = ({ f, color, k, line = 2, fill = 0.38 }: { f: Feature; color: string; k: number; line?: number; fill?: number }) => {
  const { path, s } = useMap();
  if (k <= 0) return null;
  const d = path(f) ?? "";
  return (
    <g opacity={k}>
      <path d={d} fill="none" stroke={color} strokeWidth={12 * s} strokeOpacity={0.35} style={{ filter: `blur(${6 * s}px)` }} />
      <path d={d} fill={color} fillOpacity={fill} stroke="#fff" strokeWidth={line * s} strokeOpacity={0.85} strokeLinejoin="round" />
    </g>
  );
};

// A route drawn on over [start, start + len] along great circles, glowing; dashed if `dash`. Fades out at `end`.
export const Route = ({ pts, start, len = 40, end = Infinity, color, width = 5, dash = false, head = true }: { pts: [number, number][]; start: number; len?: number; end?: number; color: string; width?: number; dash?: boolean; head?: boolean }) => {
  const frame = useCurrentFrame();
  const { path, projection, s } = useMap();
  if (frame < start || frame > end + 12) return null;
  const k = interpolate(frame, [start, start + len], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 2 });
  const o = Number.isFinite(end) ? interpolate(frame, [end, end + 12], [1, 0], clamp) : 1; // default end = never fades
  // densify along great circles, then cut at k of the total length
  const dense: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const ip = geoInterpolate(pts[i], pts[i + 1]);
    for (let j = 0; j < 20; j++) dense.push(ip(j / 20) as [number, number]);
  }
  dense.push(pts[pts.length - 1]);
  const n = Math.max(2, Math.round(dense.length * k));
  const part = dense.slice(0, n);
  const d = path({ type: "LineString", coordinates: part }) ?? "";
  const tip = projection(part[part.length - 1]);
  return (
    <g opacity={o} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={color} strokeWidth={width * 3.2 * s} strokeOpacity={0.3} style={{ filter: `blur(${4 * s}px)` }} />
      <path d={d} stroke={color} strokeWidth={width * s} strokeDasharray={dash ? `${width * 3 * s} ${width * 2 * s}` : undefined} />
      {head && tip && k < 1 && <circle cx={tip[0]} cy={tip[1]} r={width * 1.6 * s} fill="#fff" stroke={color} strokeWidth={2 * s} />}
    </g>
  );
};

// A ring of `radius` degrees around a point, growing from `start`.
export const Ring = ({ at, radius, start, color, end = Infinity, grow = 36 }: { at: [number, number]; radius: number; start: number; color: string; end?: number; grow?: number }) => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  if (frame < start || frame > end + 12) return null;
  const r = interpolate(frame, [start, start + grow], [0.3, radius], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const o = Number.isFinite(end) ? interpolate(frame, [end, end + 12], [1, 0], clamp) : 1; // default end = never fades
  const d = path(geoCircle().center(at).radius(r)()) ?? "";
  return (
    <g opacity={o}>
      <path d={d} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={10 * s} strokeOpacity={0.3} style={{ filter: `blur(${4 * s}px)` }} />
      <path d={d} fill="none" stroke="#fff" strokeOpacity={0.8} strokeWidth={2.4 * s} strokeDasharray={`${12 * s} ${8 * s}`} />
    </g>
  );
};

// A shape (already moved with moveTrueSize) popping in with a label in its middle.
export const Shape = ({ f, color, k, label }: { f: Feature<Polygon | MultiPolygon>; color: string; k: number; label?: string }) => {
  const { path, s } = useMap();
  if (k <= 0) return null;
  const d = path(f) ?? "";
  const [cx, cy] = path.centroid(f);
  return (
    <g opacity={k}>
      <path d={d} fill={color} fillOpacity={0.35} stroke={color} strokeWidth={10 * s} strokeOpacity={0.35} style={{ filter: `blur(${5 * s}px)` }} />
      <path d={d} fill="none" stroke="#fff8dc" strokeWidth={2.6 * s} />
      {label && (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontFamily={display} fontWeight={700} fontSize={34 * s} fill="#fff" stroke="#111" strokeWidth={5 * s} paintOrder="stroke">
          {label}
        </text>
      )}
    </g>
  );
};

// A text note on the map at a point (no pin), e.g. "approx." or a distance.
export const MapText = ({ at, text, k, size = 1, color = "#fff", dy = 0 }: { at: [number, number]; text: string; k: number; size?: number; color?: string; dy?: number }) => {
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || k <= 0) return null;
  return (
    <text x={p[0]} y={p[1] + dy * s} opacity={k} textAnchor="middle" dominantBaseline="middle" fontFamily={display} fontWeight={700} fontSize={40 * s * size} fill={color} stroke="#0b0e14" strokeWidth={6 * s} paintOrder="stroke">
      {text}
    </text>
  );
};

// 0→1→0 visibility helper for overlays: in over 10 frames from f0, out over 10 frames before f1.
export const show = (frame: number, f0: number, f1: number, fade = 10) => interpolate(frame, [f0, f0 + fade, f1 - fade, f1], [0, 1, 1, 0], clamp);
