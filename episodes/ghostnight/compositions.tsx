import { Composition } from "remotion";
import { OrderPageCover, OrderPageProfile } from "./Branding";
import { Ep01, EP01_FRAMES } from "./ep01/Ep01";
import { Ep02, EP02_FRAMES } from "./ep02/Ep02";

export const OrderCompositions = () => (
  <>
    <Composition id="Order-EP01" component={Ep01} durationInFrames={EP01_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Order-EP02" component={Ep02} durationInFrames={EP02_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="OrderPageCover" component={OrderPageCover} durationInFrames={1} fps={30} width={1640} height={624} />
    <Composition id="OrderPageProfile" component={OrderPageProfile} durationInFrames={1} fps={30} width={1080} height={1080} />
  </>
);
