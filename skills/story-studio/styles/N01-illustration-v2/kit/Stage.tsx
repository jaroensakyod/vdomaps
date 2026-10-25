import type { ReactNode } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { InsetGeom } from "../../../components/Inset";
import { Depth, impactAt } from "../../../components/Scene";
import { clamp, GOLD } from "./props";

// A map-free illustration panel for house style v2: the same framed panel the episodes pop over the map (sky
// gradient, rounded clip, accent frame, "ภาพประกอบ" tab), sized for a whole 9:16 or 16:9 screen, with the
// template's <Depth> inside (slow push-in + pan, impact shake/flash on `hits`, warm light, paper grain).
// children get the geometry g, the pan offset (far ×0.2, mid ×0.5, near ×0.7, foreground ×1.6) and local time.

// Panel geometry for the current video size. 9:16: 1000×1150 at y 300, s 1.8. 16:9: full width × 760 at y 150, s 1.6.
export const stageGeom = (width: number, height: number, frame: number): InsetGeom => {
  const vertical = height > width;
  const u = Math.min(width, height) / 1080;
  const x = (vertical ? 40 : 60) * u;
  const y = (vertical ? 300 : 150) * u;
  const W = width - 2 * x;
  const H = (vertical ? 1150 : 760) * u;
  const s = (vertical ? 1.8 : 1.6) * u;
  const ground = y + H * (vertical ? 0.8 : 0.86);
  return { x, y, W, H, ground, cx: x + W / 2, s, sc: 1.55 * s, vertical, frame };
};

// One scene on the panel. It slides up and fades in over 14 frames from `start` (overlap the outgoing scene: its
// end = this start + 14) and is drawn until `end`; `fadeOut` fades the last scene out over its final 14 frames.
export const Stage = ({ id, start, end, sky, accent = GOLD, hits = [], warm = 0.08, label = "ภาพประกอบ", font = "Kanit", fadeOut = false, children }: { id: string; start: number; end: number; sky: [string, string]; accent?: string; hits?: number[]; warm?: number; label?: string; font?: string; fadeOut?: boolean; children: (g: InsetGeom, pan: number, lt: number) => ReactNode }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (frame < start || frame > end) return null;
  const k = interpolate(frame, [start, start + 14], [0, 1], clamp) * (fadeOut ? interpolate(frame, [end - 14, end], [1, 0], clamp) : 1);
  const g = stageGeom(width, height, frame);
  const u = Math.min(width, height) / 1080;
  const clip = `stage-${id}`;
  return (
    <g opacity={k}>
      <defs>
        <clipPath id={clip}><rect x={g.x} y={g.y} width={g.W} height={g.H} rx={22 * u} /></clipPath>
        <linearGradient id={`${clip}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clip})`} transform={`translate(0,${(1 - Math.min(1, k)) * 30 * u})`}>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill={`url(#${clip}-sky)`} />
        <Depth g={g} id={id} start={start} end={end} impact={impactAt(frame, hits)} warm={warm}>
          {(pan) => children(g, pan, frame - start)}
        </Depth>
      </g>
      <rect x={g.x} y={g.y} width={g.W} height={g.H} rx={22 * u} fill="none" stroke={accent} strokeWidth={4 * u} />
      <rect x={g.x + 22 * u} y={g.y + 20 * u} width={(label.length * 19 + 48) * u} height={46 * u} rx={10 * u} fill={accent} />
      <text x={g.x + 46 * u} y={g.y + 53 * u} fontSize={28 * u} fontWeight={900} fill="#1a140f" fontFamily={font}>{label}</text>
    </g>
  );
};
