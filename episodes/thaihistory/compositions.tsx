import { Composition } from "remotion";
import { Ep01, TOTAL as TH01_TOTAL } from "./ep01/Ep";
import { Ep04, E4_FRAMES } from "./ep04/Ep";
import { ThNewsEp, TH_NEWS_FRAMES } from "./news/Ep";
import { Ep05, E5_FRAMES } from "./ep05/Ep";
import { B as B5 } from "./ep05/beatsKit";
import { Ep05Cover } from "./ep05/Cover";
import { Ep06, E6_FRAMES } from "./ep06/Ep";
import { Ep07, E7_FRAMES } from "./ep07/Ep";
import { Ep08, E8_FRAMES } from "./ep08/Ep";
import { Ep09, E9_FRAMES } from "./ep09/Ep";
import { Ep10, E10_FRAMES } from "./ep10/Ep";
import { AntiqueTest, ANTIQUE_FRAMES } from "./lab/AntiqueTest";
import { AntiqueTable, TABLE_FRAMES } from "./lab/AntiqueTable";
import { AntiqueCalm, CALM_FRAMES } from "./lab/AntiqueCalm";
import { DioramaTest, DIORAMA_FRAMES } from "./lab/DioramaTest";
import { PiyaPost } from "./piya/Post";
import { ThStyle } from "./StyleFrames";

// ประวัติศาสตร์บนแผนที่ (1080×1920). In src/Root.tsx: <ThaiHistoryCompositions />.
// THNews = the episode in the approved news look (house standard). TH01 / ThStyle = first cartoon version (rejected).
// Ep04 = episode 4, จุดจบของพระเจ้าตาก (news look + illustration style v2).
// Ep05 = episode 5, สยามรอดได้อย่างไร (วันปิยมหาราช) · Ep05Clear = the same in the clear layout (house standard
// from 23 Oct 2026) · Ep05Cover = its 9:16 cover.
// Ep06 = episode 6, พระยาตากฝ่าวงล้อมออกจากกรุง (~5.5 min, clear layout).
// Ep07 = episode 7, ทุบหม้อข้าว ตีจันทบุรี (~4.5 min, clear layout).
// Ep08 = episode 8, ธนบุรีและค่ายโพธิ์สามต้น (~3.5 min, clear layout).
// Ep09 = episode 9, กษัตริย์โดนยิงขา ศึกเกยไชย (~3.5 min, clear layout).
// Ep10 = episode 10, ยุทธหัตถีเกิดที่ไหนกันแน่ (~10 min, clear layout).
export const ThaiHistoryCompositions = () => (
  <>
    <Composition id="THNews" component={ThNewsEp} durationInFrames={TH_NEWS_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="TH01" component={Ep01} durationInFrames={TH01_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="ThStyle" component={ThStyle} defaultProps={{ scene: "hook" as const }} durationInFrames={300} fps={30} width={1080} height={1920} />
    <Composition id="Ep04" component={Ep04} durationInFrames={E4_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Ep05" component={Ep05} durationInFrames={E5_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Ep05Clear" component={Ep05} defaultProps={{ clear: true }} durationInFrames={E5_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Ep05Demo" component={Ep05} defaultProps={{ clear: true }} durationInFrames={B5.eclipse.start} fps={30} width={1080} height={1920} />
    <Composition id="Ep05Cover" component={Ep05Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Ep06" component={Ep06} durationInFrames={E6_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Ep07" component={Ep07} durationInFrames={E7_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Ep08" component={Ep08} durationInFrames={E8_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Ep09" component={Ep09} durationInFrames={E9_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Ep10" component={Ep10} durationInFrames={E10_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="AntiqueTest" component={AntiqueTest} durationInFrames={ANTIQUE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="AntiqueTable" component={AntiqueTable} durationInFrames={TABLE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="AntiqueCalm" component={AntiqueCalm} durationInFrames={CALM_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="DioramaTest" component={DioramaTest} durationInFrames={DIORAMA_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="PiyaPost" component={PiyaPost} durationInFrames={1} fps={30} width={1080} height={1350} />
  </>
);
