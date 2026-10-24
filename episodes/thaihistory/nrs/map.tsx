import type { FeatureCollection, MultiLineString, LineString } from "geojson";
import { interpolate, useCurrentFrame } from "remotion";
import { useMap } from "../../../components/Map";
import { useJson } from "../../../components/useJson";
import { clamp, font } from "../news/kit";
import { ZONES, type ZoneId } from "./places";

export { CityDot, Measure, Ring } from "../ep04/beatsKit";

// Kingdom extents (approximate) with a soft pulse; k per zone 0–1, colours can be overridden (e.g. vassal = burma red).
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

// Natural Earth rivers of Burma and Siam (Sittaung, Salween, Irrawaddy, Chao Phraya …); `hi` lights one up by name.
export const BigRivers = ({ hi = {} }: { hi?: Record<string, number> }) => {
  const { path, projection, s } = useMap();
  const data = useJson<{ rivers: FeatureCollection<MultiLineString | LineString, { name: string | null; rank: number }> }>("data/nrs-rivers.json");
  if (!data) return null;
  const pxDeg = (projection.scale() * Math.PI) / 180;
  if (pxDeg > 3000) return null;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {data.rivers.features.map((f, i) => {
        const w = Math.max(1.2, (9 - f.properties.rank) * 0.5) * s * Math.min(2, Math.max(0.7, pxDeg / 300));
        const k = (f.properties.name && hi[f.properties.name]) || 0;
        return (
          <g key={i}>
            <path d={path(f) ?? ""} stroke="#7fd4ff" strokeWidth={w} strokeOpacity={0.6} />
            {k > 0 && <path d={path(f) ?? ""} stroke="#fff3a6" strokeWidth={w * 3} strokeOpacity={k} style={{ filter: `drop-shadow(0 0 ${8 * s}px #ffd84a)` }} />}
          </g>
        );
      })}
    </g>
  );
};

// A crossed-swords battle marker that pops at `start` and pulses.
export const BattleMark = ({ at: c, start, end = 1e9, color = "#ff3b30", size = 1 }: { at: [number, number]; start: number; end?: number; color?: string; size?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(c);
  if (!p || frame < start || frame > end + 10) return null;
  const k = interpolate(frame, [start, start + 8, end, end + 10], [0, 1, 1, 0], clamp);
  const pulse = 1 + 0.12 * Math.sin(frame * 0.3);
  const r = 26 * s * size;
  return (
    <g transform={`translate(${p[0]},${p[1]}) scale(${k * pulse})`}>
      <circle r={r * 1.8} fill={color} opacity={0.22} />
      <circle r={r} fill="rgba(8,14,26,0.86)" stroke={color} strokeWidth={3 * s} />
      <path d={`M${-r * 0.55} ${-r * 0.55} L${r * 0.55} ${r * 0.55} M${r * 0.55} ${-r * 0.55} L${-r * 0.55} ${r * 0.55}`} stroke="#fff" strokeWidth={5 * s} strokeLinecap="round" />
    </g>
  );
};

// A text tag on the map (no pin): e.g. "แนวโดยประมาณ" or a river name.
export const MapTag = ({ at: c, text, start, end = 1e9, color = "#fff", size = 30 }: { at: [number, number]; text: string; start: number; end?: number; color?: string; size?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(c);
  if (!p || frame < start || frame > end + 10) return null;
  const k = interpolate(frame, [start, start + 10, end, end + 10], [0, 1, 1, 0], clamp);
  return (
    <text x={p[0]} y={p[1]} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={size * s} fill={color} opacity={k} stroke="rgba(8,14,26,0.85)" strokeWidth={6 * s} paintOrder="stroke">
      {text}
    </text>
  );
};
