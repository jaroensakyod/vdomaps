import { totalFrames } from "../../../components/subs.mjs";
import { LAYOUT } from "../news/kit";
import type { ChapterN } from "../nrs/beats";
import { NrsEpisode } from "../nrs/Episode";
import { BEATS } from "./beatsKit";
import { e6c0 } from "./ch0";
import { e6c1 } from "./ch1";
import { e6c2 } from "./ch2";
import { e6c3 } from "./ch3";
import { e6c4 } from "./ch4";
import { e6c5 } from "./ch5";
import { e6c6 } from "./ch6";
import { e6c7 } from "./ch7";
import { e6c8 } from "./ch8";

// ประวัติศาสตร์บนแผนที่ ตอน 6: ยุทธหัตถี (news look, house standard, illustration style v2).
export const E6_CHAPTERS: ChapterN[] = [e6c0, e6c1, e6c2, e6c3, e6c4, e6c5, e6c6, e6c7, e6c8];
export const E6_FRAMES = totalFrames(BEATS, LAYOUT);
export const Ep06 = () => <NrsEpisode chapters={E6_CHAPTERS} beats={BEATS} />;
