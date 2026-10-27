import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Flow25D, Flow25DScreen, type Area, type Burst, type Pose } from "../../../components/Flow25D";
import { useJson } from "../../../components/useJson";
import { clamp, Panel, PANEL_H } from "../news/kit";

// Episode 10 pictures are Flow stills (style C, hand-coloured engraving) prepared with `npm run flow-layers` and moved
// by the template's Flow25D (depth layers, wind, smoke, light, dust). Free: no API, no Flow credits.

type Look = { wind?: Area[]; light?: [number, number]; smokeBehind?: number; hits?: number[]; rig?: string; pose?: (part: string, frame: number) => Pose; bursts?: Burst[]; punch?: number };

// Full screen, then the picture shrinks into the map pin `to` (screen px) over its last 24 frames and fades.
export const FlowFull = ({ name, start, end, to, ...look }: Look & { name: string; start: number; end: number; to?: [number, number] }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (frame < start - 2 || frame > end + 2) return null;
  const out = to ? interpolate(frame, [end - 24, end], [0, 1], clamp) : 0;
  const k = 1 - out * 0.92;
  const ox = to ? (to[0] - width / 2) * out : 0;
  const oy = to ? (to[1] - height / 2) * out : 0;
  const fade = start <= 0 ? interpolate(frame, [end - 8, end], [1, 0], clamp) : interpolate(frame, [start - 2, start + 6, end - 8, end], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: fade, transform: `translate(${ox}px, ${oy}px) scale(${k})`, overflow: "hidden", borderRadius: out * 40 }}>
      <Flow25DScreen name={name} id={`ff-${name}`} start={start} end={end} {...look} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(30,18,6,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};

// Inside the map's illustration panel; the panel box takes the picture's own aspect, so nothing is cropped.
export const FlowPanel = ({ id, anchor, start, end, name, accent, ...look }: Look & { id: string; anchor: [number, number]; start: number; end: number; name: string; accent?: string }) => {
  const meta = useJson<{ aspect: number }>(`flow/${name}.json`);
  if (!meta) return null;
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={["#e8d8b0", "#e8d8b0"]} accent={accent} size={{ w: Math.round(PANEL_H * meta.aspect), h: PANEL_H }}>
      {(g) => <Flow25D name={name} id={id} box={{ x: g.x, y: g.y, w: g.W, h: g.H }} start={start} end={end} zoom={[1.0, 1.05]} parallax={16} windStrength={3} s={g.s} dust={false} smoke={0.25} {...look} />}
    </Panel>
  );
};
