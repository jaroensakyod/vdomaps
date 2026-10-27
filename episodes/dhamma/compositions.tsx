import { Composition } from "remotion";
import { DhammaPageCover, DhammaPageProfile } from "./Branding";
import { D1_FRAMES, Dhamma01 } from "./ep01/Ep";
import { DHAMMA_TEST_FRAMES, DhammaTest } from "./test/Test";
import { DhammaIconTest, ICON_TEST_FRAMES } from "./test/IconTest";

// ตามรอยธรรม (1080×1920). In src/Root.tsx: <DhammaCompositions />.
export const DhammaCompositions = () => (
  <>
    <Composition id="DhammaPageCover" component={DhammaPageCover} durationInFrames={1} fps={30} width={1640} height={624} />
    <Composition id="DhammaPageProfile" component={DhammaPageProfile} durationInFrames={1} fps={30} width={1080} height={1080} />
    <Composition id="Dhamma01" component={Dhamma01} durationInFrames={D1_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="DhammaIconTest" component={DhammaIconTest} durationInFrames={ICON_TEST_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="DhammaTest" component={DhammaTest} durationInFrames={DHAMMA_TEST_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
