import { geoDistance, geoInterpolate } from "d3-geo";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { isVisible } from "./camera";
import { useMap } from "./Map";
import { style } from "./style";

const EARTH_KM = 6371;

export const routeProgress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

export const routeKm = (from: [number, number], to: [number, number]) => geoDistance(from, to) * EARTH_KM;

// Great-circle line drawn live from `from` to `to`, with a plane on its head.
// The line is sliced by progress (not dash-offset) so it stays correct while the camera moves.
export const Route = ({
  from,
  to,
  start,
  end,
  color = style.highlight,
  dashed = true,
}: {
  from: [number, number];
  to: [number, number];
  start: number;
  end: number;
  color?: string;
  dashed?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { path, projection, cam, s } = useMap();
  if (frame < start) return null;
  const p = routeProgress(frame, start, end);
  const along = geoInterpolate(from, to);
  const n = 96;
  const coords: [number, number][] = [];
  for (let i = 0; i <= n * p; i++) coords.push(along(i / n));
  const head = along(p);
  coords.push(head);
  const d = path({ type: "LineString", coordinates: coords }) ?? "";
  const a = projection(along(Math.max(0, p - 0.01)));
  const b = projection(head);
  const angle = a && b ? (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI : 0;
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={10 * s} strokeOpacity={0.25} strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={4 * s}
        strokeLinecap="round"
        strokeDasharray={dashed ? `${14 * s} ${10 * s}` : undefined}
      />
      {b && isVisible(cam, head) && p < 1 && (
        <g transform={`translate(${b[0]},${b[1]}) rotate(${angle}) scale(${1.6 * s})`}>
          {/* simple plane silhouette pointing right */}
          <path
            d="M16 0 L4 -3 L-2 -14 L-7 -14 L-3 -3 L-12 -2 L-15 -7 L-18 -7 L-16 0 L-18 7 L-15 7 L-12 2 L-3 3 L-7 14 L-2 14 L4 3 Z"
            fill="#fff"
            stroke={style.textStroke}
            strokeWidth={1.5}
          />
        </g>
      )}
    </g>
  );
};

// Distance counter + analogue clock. Place outside <MapFrame> (it is HTML).
export const DistanceHud = ({
  from,
  to,
  start,
  end,
  hours,
}: {
  from: [number, number];
  to: [number, number];
  start: number;
  end: number;
  hours: number;
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < start - 10) return null;
  const p = routeProgress(frame, start, end);
  const km = Math.round(routeKm(from, to) * p);
  const h = hours * p;
  const o = interpolate(frame, [start - 10, start], [0, 1], { extrapolateRight: "clamp" });
  const r = 46 * s;
  const vertical = height > width;
  return (
    <AbsoluteFill style={{ opacity: o, fontFamily: style.font }}>
      <div
        style={{
          position: "absolute",
          left: vertical ? "50%" : 70 * s,
          top: vertical ? height * 0.14 : 70 * s,
          transform: vertical ? "translateX(-50%)" : undefined,
          display: "flex",
          alignItems: "center",
          gap: 26 * s,
          padding: `${18 * s}px ${30 * s}px`,
          background: "rgba(6,16,31,0.78)",
          border: `${2 * s}px solid rgba(255,255,255,0.15)`,
          borderRadius: 22 * s,
          color: style.text,
        }}
      >
        <svg width={r * 2} height={r * 2} viewBox={`${-r} ${-r} ${r * 2} ${r * 2}`}>
          <circle r={r - 3 * s} fill="#fff" stroke={style.highlight} strokeWidth={4 * s} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} y1={-(r - 9 * s)} y2={-(r - 15 * s)} stroke="#334" strokeWidth={3 * s} transform={`rotate(${i * 30})`} />
          ))}
          <line y2={-r * 0.45} stroke="#111" strokeWidth={5 * s} strokeLinecap="round" transform={`rotate(${h * 30})`} />
          <line y2={-r * 0.7} stroke={style.accent} strokeWidth={3 * s} strokeLinecap="round" transform={`rotate(${h * 360})`} />
          <circle r={4 * s} fill="#111" />
        </svg>
        <div style={{ lineHeight: 1.35 }}>
          <div style={{ fontSize: 60 * s, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
            {km.toLocaleString("th-TH")} <span style={{ fontSize: 34 * s, fontWeight: 700 }}>กม.</span>
          </div>
          <div style={{ fontSize: 30 * s, opacity: 0.8 }}>
            ใช้เวลา {Math.floor(h)} ชม. {String(Math.floor((h % 1) * 60)).padStart(2, "0")} นาที
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
