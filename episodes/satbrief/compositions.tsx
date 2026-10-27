import { Composition } from "remotion";
import { SATBRIEF_TEST_FRAMES, SatBriefTest } from "./test/Test";

// Satellite briefing (analyst look), 1080×1920. In src/Root.tsx: <SatBriefCompositions />.
export const SatBriefCompositions = () => (
  <>
    <Composition id="SatBriefTest" component={SatBriefTest} durationInFrames={SATBRIEF_TEST_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
