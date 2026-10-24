import { Composition } from "remotion";
import { Ep01, TOTAL as TH01_TOTAL } from "./ep01/Ep";
import { Ep04, E4_FRAMES } from "./ep04/Ep";
import { ThNewsEp, TH_NEWS_FRAMES } from "./news/Ep";
import { PiyaPost } from "./piya/Post";
import { ThStyle } from "./StyleFrames";
import { Ep05, E5_FRAMES } from "./ep05/Ep";
import { Ep06, E6_FRAMES } from "./ep06/Ep";
import { NrsSceneTest, SCENE_TEST_FRAMES } from "./nrs/SceneTest";

// ประวัติศาสตร์บนแผนที่ (1080×1920). In src/Root.tsx: <ThaiHistoryCompositions />.
// THNews = the episode in the approved news look (house standard). TH01 / ThStyle = first cartoon version (rejected).
// Ep04 = episode 4, จุดจบของพระเจ้าตาก (news look + illustration style v2).
// Ep05 / Ep06 = episodes 5–6, สมเด็จพระนเรศวร (ประกาศอิสรภาพ, ยุทธหัตถี); shared kit in nrs/. NrsSceneTest = dev sheet.
export const ThaiHistoryCompositions = () => (
  <>
    <Composition id="THNews" component={ThNewsEp} durationInFrames={TH_NEWS_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="TH01" component={Ep01} durationInFrames={TH01_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="ThStyle" component={ThStyle} defaultProps={{ scene: "hook" as const }} durationInFrames={300} fps={30} width={1080} height={1920} />
    <Composition id="Ep04" component={Ep04} durationInFrames={E4_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Ep05" component={Ep05} durationInFrames={E5_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Ep06" component={Ep06} durationInFrames={E6_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="NrsSceneTest" component={NrsSceneTest} durationInFrames={SCENE_TEST_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="PiyaPost" component={PiyaPost} durationInFrames={1} fps={30} width={1080} height={1350} />
  </>
);
