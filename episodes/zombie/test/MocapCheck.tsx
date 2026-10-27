import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { fk, LOOKS, mocapPose, PoseFigure, runCycle, type MocapData } from "../../../components/Pose";
import { useJson } from "../../../components/useJson";

// Mocap checks. MocapSource: a plain clip of our runner to feed `npm run mocap` when no real footage is at hand.
// MocapPreview: the source clip (top) beside a figure driven by public/mocap/<name>.json (bottom) — put any captured
// clip here to check it before using it in a scene: `npm run mocap -- clip.mp4 run1` then props { name: "run1", src }.
export const MocapSource = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#d8d4c8" }}>
      <svg width={1080} height={1920}>
        <PoseFigure pose={fk(runCycle(f))} look={{ ...LOOKS.runner, hair: "#1f1712" }} x={540} y={1500} scale={4.6} shadow={false} />
      </svg>
    </AbsoluteFill>
  );
};
export const MocapPreview = ({ name, src }: { name: string; src?: string }) => {
  const f = useCurrentFrame();
  const data = useJson<MocapData>(`mocap/${name}.json`);
  return (
    <AbsoluteFill style={{ background: "#1b2125" }}>
      {src && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 960, overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(src)} muted style={{ width: 1080, height: 960, objectFit: "contain" }} />
        </div>
      )}
      <svg width={1080} height={1920}>
        {data && <PoseFigure pose={mocapPose(data, f)} look={LOOKS.zombieGrey} x={540} y={1820} scale={4.2} />}
      </svg>
    </AbsoluteFill>
  );
};
