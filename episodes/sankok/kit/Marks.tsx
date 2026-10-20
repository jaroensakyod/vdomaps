import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { isVisible } from "../../../components/camera";
import { useMap } from "../../../components/Map";
import { Flame } from "../../redcliffs/Fleet";
import { C, clamp, fade } from "./theme";

type LL = [number, number];

// Map-layer marks (inside <MapFrame>). Everything is approximate on screen; pair with "โดยประมาณ".

// Fires that light one by one (`stagger` frames apart) and, with `outAt`, go out one by one too.
export const Flames = ({ points, start, stagger = 6, outAt, end, size = 1 }: { points: LL[]; start: number; stagger?: number; outAt?: number; end?: number; size?: number }) => {
  const frame = useCurrentFrame();
  const { projection, cam, s } = useMap();
  return (
    <g>
      {points.map((p, i) => {
        const on = start + i * stagger;
        const off = outAt === undefined ? Infinity : outAt + i * stagger;
        if (frame < on || frame > off + 12 || (end !== undefined && frame > end) || !isVisible(cam, p)) return null;
        const k = interpolate(frame, [on, on + 12, off, off + 12], [0, 1, 1, 0], clamp);
        const xy = projection(p);
        if (!xy) return null;
        return (
          <g key={i} transform={`translate(${xy[0]},${xy[1]})`}>
            <Flame size={44 * s * size} seed={i * 17} frame={frame} k={k} />
          </g>
        );
      })}
    </g>
  );
};

// Small pennants that pop up at places (warlords raising their own armies).
export const Flags = ({ items, start, stagger = 5, end }: { items: { at: LL; color: string }[]; start: number; stagger?: number; end?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { projection, cam, s } = useMap();
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

// A peach tree sketched in ink with pink blossoms (the oath of the peach garden).
export const Blossom = ({ at, start, end }: { at: LL; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const o = fade(frame, start, start + 20, end - 15, end);
  const xy = projection(at);
  if (o <= 0 || !xy) return null;
  return (
    <g transform={`translate(${xy[0]},${xy[1]})`} opacity={o}>
      <path d={`M0 0 C${-4 * s} ${-40 * s} ${6 * s} ${-70 * s} ${-2 * s} ${-110 * s} M${-1 * s} ${-60 * s} C${-30 * s} ${-80 * s} ${-50 * s} ${-90 * s} ${-70 * s} ${-120 * s} M${2 * s} ${-75 * s} C${30 * s} ${-95 * s} ${45 * s} ${-110 * s} ${60 * s} ${-135 * s}`} fill="none" stroke={C.ink} strokeWidth={6 * s} strokeLinecap="round" />
      {Array.from({ length: 34 }, (_, i) => {
        const bloom = fade(frame, start + 10 + i * 1.5, start + 22 + i * 1.5);
        const x = (random(`bx${i}`) - 0.5) * 190 * s;
        const y = -100 * s - random(`by${i}`) * 80 * s + Math.abs(x) * 0.2;
        return <circle key={i} cx={x} cy={y} r={(7 + random(`br${i}`) * 6) * s * bloom} fill={random(`bc${i}`) > 0.5 ? "#f2a5b8" : "#e9849c"} stroke="#b4566c" strokeWidth={1 * s} opacity={0.9} />;
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
