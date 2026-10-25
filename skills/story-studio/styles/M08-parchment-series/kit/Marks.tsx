import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { isVisible } from "../../../components/camera";
import { useMap } from "../../../components/Map";
import { C, fade } from "./Parchment";

type LL = [number, number];

// Map-layer marks (inside <SeriesMap>). Everything is approximate (the description says so).

// Small pennants that pop up at places (warlords raising their own armies, camps).
export const Flags = ({ items, start, stagger = 5, end }: { items: { at: LL; color: string }[]; start: number; stagger?: number; end?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { projection, cam, s: s0, width, height } = useMap();
  const s = s0 * (height > width ? 1.5 : 1);
  const out = end === undefined ? 1 : 1 - fade(frame, end - 10, end);
  if (out <= 0) return null;
  return (
    <g opacity={out}>
      {items.map((it, i) => {
        const t = start + i * stagger;
        if (frame < t || !isVisible(cam, it.at)) return null;
        const xy = projection(it.at);
        if (!xy) return null;
        const k = spring({ frame: frame - t, fps, config: { damping: 11 } });
        const wave = Math.sin((frame + i * 9) * 0.25) * 3 * s;
        return (
          <g key={i} transform={`translate(${xy[0]},${xy[1]}) scale(${k})`}>
            <line x1={0} y1={0} x2={0} y2={-46 * s} stroke={C.ink} strokeWidth={3 * s} />
            <path d={`M0 ${-46 * s} Q${14 * s} ${-42 * s + wave} ${28 * s} ${-38 * s} L0 ${-28 * s} Z`} fill={it.color} stroke={C.ink} strokeWidth={1.5 * s} />
          </g>
        );
      })}
    </g>
  );
};

// Full-frame colour wash: night, a yellow flash, blood red. `opacity` is a per-frame function.
export const Tint = ({ color, opacity }: { color: string; opacity: (frame: number) => number }) => {
  const frame = useCurrentFrame();
  const o = opacity(frame);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none", mixBlendMode: "multiply" }} />;
};
