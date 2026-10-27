import { AbsoluteFill } from "remotion";
import { fk, LOOKS, PoseFigure, runCycle, shamble } from "../../../components/Pose";

// Dev sheet: 6 phases of the run cycle (top) and of the shamble (bottom), to tune the code-written moves.
export const PoseSheet = () => (
  <AbsoluteFill style={{ background: "#e9e2cf" }}>
    <svg width={1080} height={1920}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <PoseFigure pose={fk(runCycle(i * 3.9))} look={LOOKS.runner} x={100 + (i % 3) * 330} y={420 + Math.floor(i / 3) * 450} scale={1.9} />
          <PoseFigure pose={fk(shamble(i * 14, i))} look={[LOOKS.zombieGrey, LOOKS.zombieOffice, LOOKS.zombieWorker][i % 3]} x={100 + (i % 3) * 330} y={1320 + Math.floor(i / 3) * 450} scale={1.9} />
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);
