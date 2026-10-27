import { Composition } from "remotion";
import { WhatIfPageCover, WhatIfPageProfile } from "./Branding";
import { WhatIf01, WI01_FRAMES } from "./ep01/Ep";
import { WHATIF_TEST_FRAMES, WhatIfTest } from "./test/Test";

// What if America (1080×1920). In src/Root.tsx: <WhatIfCompositions />.
// Thumbnail = the hook frame itself (its title is already the thumbnail headline):
//   npx remotion still WhatIf01 out/whatif/ep01-thumb.png --frame=20
export const WhatIfCompositions = () => (
  <>
    <Composition id="WhatIf01" component={WhatIf01} durationInFrames={WI01_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="WhatIfPageCover" component={WhatIfPageCover} durationInFrames={1} fps={30} width={1640} height={624} />
    <Composition id="WhatIfPageProfile" component={WhatIfPageProfile} durationInFrames={1} fps={30} width={1080} height={1080} />
    <Composition id="WhatIfTest" component={WhatIfTest} durationInFrames={WHATIF_TEST_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
