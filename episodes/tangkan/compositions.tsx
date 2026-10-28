import { Composition } from "remotion";
import { TangkanPageCover, TangkanPageProfile } from "./Branding";
import { Ep01, EP01_FRAMES } from "./ep01/Ep01";

// ต่างกันยังไง (1080×1920). In src/Root.tsx: <TangkanCompositions />.
// 3D scenes need WebGL: stills and renders use --gl=angle.
export const TangkanCompositions = () => (
  <>
    <Composition id="TangkanPageCover" component={TangkanPageCover} durationInFrames={1} fps={30} width={1640} height={624} />
    <Composition id="TangkanPageProfile" component={TangkanPageProfile} durationInFrames={1} fps={30} width={1080} height={1080} />
    <Composition id="Tangkan-EP01" component={Ep01} durationInFrames={EP01_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
