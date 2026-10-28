import { Composition } from "remotion";
import { Ep01, EP01_FRAMES } from "./ep01/Ep01";

// ต่างกันยังไง (1080×1920). In src/Root.tsx: <TangkanCompositions />.
// 3D scenes need WebGL: stills and renders use --gl=angle.
export const TangkanCompositions = () => (
  <>
    <Composition id="Tangkan-EP01" component={Ep01} durationInFrames={EP01_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
