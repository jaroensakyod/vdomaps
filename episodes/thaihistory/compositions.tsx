import { Composition } from "remotion";
import { Ep01, TOTAL as TH01_TOTAL } from "./ep01/Ep";
import { ThNewsEp, TH_NEWS_FRAMES } from "./news/Ep";
import { ThStyle } from "./StyleFrames";

// ประวัติศาสตร์บนแผนที่ (1080×1920). In src/Root.tsx: <ThaiHistoryCompositions />.
// THNews = the episode in the approved news look (house standard). TH01 / ThStyle = first cartoon version (rejected).
export const ThaiHistoryCompositions = () => (
  <>
    <Composition id="THNews" component={ThNewsEp} durationInFrames={TH_NEWS_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="TH01" component={Ep01} durationInFrames={TH01_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="ThStyle" component={ThStyle} defaultProps={{ scene: "hook" as const }} durationInFrames={300} fps={30} width={1080} height={1920} />
  </>
);
