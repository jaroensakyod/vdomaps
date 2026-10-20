import { geoCentroid } from "d3-geo";
import type { Feature } from "geojson";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { isVisible } from "./camera";
import { useMap } from "./Map";
import { style } from "./style";

const pop = (frame: number, start: number, fps: number) =>
  spring({ frame: frame - start, fps, config: { damping: 11, mass: 0.6 } });

// SVG text with a dark outline so it reads on any background. Thai needs the generous line box (tone marks).
const OutlinedText = ({ y, size, children, color = style.text }: { y: number; size: number; children: string; color?: string }) => (
  <text
    y={y}
    textAnchor="middle"
    fontSize={size}
    fontWeight={900}
    fill={color}
    stroke={style.textStroke}
    strokeWidth={size * 0.14}
    strokeLinejoin="round"
    paintOrder="stroke"
  >
    {children}
  </text>
);

// A city/point: dot with a pulsing ring and a label above. Hidden when on the far side of the globe.
export const PointLabel = ({
  at,
  text,
  start,
  color = style.accent,
  size = 1,
}: {
  at: [number, number];
  text: string;
  start: number;
  color?: string;
  size?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { projection, cam, s } = useMap();
  if (frame < start || !isVisible(cam, at)) return null;
  const xy = projection(at);
  if (!xy) return null;
  const k = pop(frame, start, fps);
  const cycle = ((frame - start) % 36) / 36;
  return (
    <g transform={`translate(${xy[0]},${xy[1]})`}>
      <circle r={(10 + cycle * 34) * s} fill="none" stroke={color} strokeWidth={3 * s} opacity={1 - cycle} />
      <circle r={10 * s * k} fill={color} stroke="#fff" strokeWidth={3 * s} />
      <g transform={`scale(${k})`}>
        <OutlinedText y={-30 * s} size={46 * s * size}>{text}</OutlinedText>
      </g>
    </g>
  );
};

// A big name on an area (country / province), placed at its centroid unless `at` is given.
export const AreaLabel = ({
  feature,
  text,
  start,
  at,
  size = 1,
  minWidth = 420,
}: {
  feature: Feature;
  text: string;
  start: number;
  at?: [number, number];
  size?: number;
  /** on-screen width (px at 1080p) below which the label fades out */
  minWidth?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { projection, path, cam, s } = useMap();
  const p = at ?? (geoCentroid(feature) as [number, number]);
  // Fade out as the area shrinks on screen (zooming out), so its name never covers neighbours or city labels.
  const [[x0], [x1]] = path.bounds(feature);
  const fit = interpolate(x1 - x0, [minWidth * s * 0.6, minWidth * s], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < start || !isVisible(cam, p)) return null;
  const xy = projection(p);
  if (!xy) return null;
  const k = pop(frame, start, fps);
  const o = interpolate(frame - start, [0, 6], [0, 1], { extrapolateRight: "clamp" }) * fit;
  if (o <= 0) return null;
  return (
    <g transform={`translate(${xy[0]},${xy[1]}) scale(${k})`} opacity={o}>
      <OutlinedText y={0} size={72 * s * size}>{text}</OutlinedText>
    </g>
  );
};
