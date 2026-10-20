import { Composition } from "remotion";
import { MAP_TEST_FRAMES, MapTest } from "./episodes/test/MapTest";

// Register every scene twice when a video ships in both formats: same component, different size.
export const Root = () => (
  <>
    <Composition id="MapTest" component={MapTest} durationInFrames={MAP_TEST_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="MapTestVertical" component={MapTest} durationInFrames={MAP_TEST_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
