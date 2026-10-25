import { geoDistance } from "d3-geo";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useMap } from "../../../components/Map";
import { CARD, clamp, font, GOLD } from "./News";

// Labels and pins on real imagery, a scale bar and the live "screen width" readout used by the HLS close-up.

const EARTH_KM = 6371;

// Width of the screen on the ground, in km, for the current camera (orthographic: px per radian = scale).
export const screenKm = (scale: number, width: number) => (width / scale) * EARTH_KM;
export const fmtKm = (km: number) => (km >= 100 ? Math.round(km / 10) * 10 : km >= 10 ? Math.round(km) : Math.round(km * 10) / 10).toLocaleString("en-US");

// Pin on a place: dot + pulse ring + a short stem up to a dark label card with a coloured edge.
// side: where the card sits relative to the pin. Pops in at `start` (spring), stays.
export const Pin = ({ at, text, sub, start, color = GOLD, side = "up", size = 1 }: { at: [number, number]; text: string; sub?: string; start: number; color?: string; side?: "up" | "down" | "left" | "right"; size?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { projection, cam, s } = useMap();
  if (frame < start || geoDistance([cam.lon, cam.lat], at) > 1.4) return null;
  const p = projection(at);
  if (!p) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 12, mass: 0.6 } });
  const cycle = ((frame - start) % 40) / 40;
  const fs = 34 * s * size;
  const w = Math.max(text.length, (sub?.length ?? 0) * 0.75) * fs * 0.52 + 40 * s;
  const h = (sub ? 92 : 62) * s * size;
  const stem = 46 * s;
  const [dx, dy] = { up: [0, -stem], down: [0, stem], left: [-stem, 0], right: [stem, 0] }[side];
  const bx = side === "left" ? dx - w : side === "right" ? dx : -w / 2;
  const by = side === "up" ? dy - h : side === "down" ? dy : -h / 2;
  return (
    <g transform={`translate(${p[0]},${p[1]})`}>
      <circle r={(9 + cycle * 30) * s} fill="none" stroke={color} strokeWidth={3 * s} opacity={1 - cycle} />
      <line x1={0} y1={0} x2={dx * k} y2={dy * k} stroke={color} strokeWidth={3 * s} />
      <circle r={9 * s * k} fill={color} stroke="#fff" strokeWidth={3 * s} />
      <g transform={`translate(${dx},${dy}) scale(${k}) translate(${-dx},${-dy})`} opacity={Math.min(1, k)}>
        <rect x={bx} y={by} width={w} height={h} rx={10 * s} fill={CARD} stroke={color} strokeWidth={2.5 * s} />
        <rect x={bx} y={by} width={8 * s} height={h} rx={3 * s} fill={color} />
        <text x={bx + 24 * s} y={by + 44 * s * size} fontFamily={font} fontWeight={900} fontSize={fs} fill="#fff">
          {text}
        </text>
        {sub && (
          <text x={bx + 24 * s} y={by + 78 * s * size} fontFamily={font} fontWeight={700} fontSize={24 * s * size} fill={color}>
            {sub}
          </text>
        )}
      </g>
    </g>
  );
};

// Scale bar + imagery chip. Picks a round length (50 m … 500 km) about 1/4 of the screen wide.
export const ScaleBar = ({ note, start = 0 }: { note: string; start?: number }) => {
  const frame = useCurrentFrame();
  const { projection, width, height, s } = useMap();
  const kmPerPx = EARTH_KM / projection.scale();
  const target = (width * 0.22) * kmPerPx;
  const steps = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  const km = steps.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a));
  const len = km / kmPerPx;
  const wide = width > height;
  const x = width - 50 * s - Math.max(len, 260 * s);
  const y = wide ? 230 * s : height * 0.705; // 16:9: top right, clear of captions and pins
  const o = interpolate(frame, [start, start + 10], [0, 1], clamp);
  const label = km < 1 ? `${km * 1000} ม.` : `${km.toLocaleString("en-US")} กม.`;
  return (
    <g opacity={o} fontFamily={font}>
      <rect x={x - 16 * s} y={y - 44 * s} width={Math.max(len, 260 * s) + 32 * s} height={96 * s} rx={10 * s} fill={CARD} />
      <text x={x} y={y - 12 * s} fontSize={26 * s} fontWeight={900} fill="#fff">{label}</text>
      <rect x={x} y={y} width={len} height={10 * s} fill="#fff" />
      <rect x={x} y={y} width={len / 2} height={10 * s} fill={GOLD} />
      <text x={x} y={y + 38 * s} fontSize={20 * s} fontWeight={700} fill="#fff" opacity={0.75}>{note}</text>
    </g>
  );
};
