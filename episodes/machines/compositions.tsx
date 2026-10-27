import { Composition } from "remotion";
import { MACHINES_TEST_FRAMES, MachinesTest } from "./test/Test";

// ยักษ์เหล็ก — giant machines explainers on blueprint paper (1080×1920). In src/Root.tsx: <MachinesCompositions />.
export const MachinesCompositions = () => (
  <>
    <Composition id="MachinesTest" component={MachinesTest} durationInFrames={MACHINES_TEST_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
