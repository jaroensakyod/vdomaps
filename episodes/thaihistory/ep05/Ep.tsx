import { totalFrames } from "../../../components/subs.mjs";
import { LAYOUT } from "../news/kit";
import type { ChapterN } from "../nrs/beats";
import { NrsEpisode } from "../nrs/Episode";
import { BEATS } from "./beatsKit";
import { e5c0 } from "./ch0";
import { e5c1 } from "./ch1";
import { e5c2 } from "./ch2";
import { e5c3 } from "./ch3";
import { e5c4 } from "./ch4";
import { e5c5 } from "./ch5";
import { e5c6 } from "./ch6";
import { e5c7 } from "./ch7";
import { e5c8 } from "./ch8";

// ประวัติศาสตร์บนแผนที่ ตอน 5: สมเด็จพระนเรศวร ประกาศอิสรภาพ (news look, house standard, illustration style v2).
export const E5_CHAPTERS: ChapterN[] = [e5c0, e5c1, e5c2, e5c3, e5c4, e5c5, e5c6, e5c7, e5c8];
export const E5_FRAMES = totalFrames(BEATS, LAYOUT);
export const Ep05 = () => <NrsEpisode chapters={E5_CHAPTERS} beats={BEATS} />;
