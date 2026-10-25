import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camForFeature } from "../../components/camera";
import { MapFrame } from "../../components/Map";
import { bbox } from "../../components/Region";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { C, clamp, fade, fonts, PaperMap, PaperTexture, useUnit } from "./kit/Parchment";
import type { CityKey } from "./kit/places";
import { CityMarks, EraMap, Tally, YearBadge, type Step } from "./kit/Scoreboard";

// M07 scoreboard: who holds which city. The parchment map of Han China cross-fades from 190 (Dong Zhuo vs the
// allies) to 208 (Cao Cao vs Sun Quan) to 222 (three kingdoms); city markers flip colour, the tally recounts. 15 s.
export const demo: StyleDemo = { id: "M07", name: "กระดานคะแนนครองเมือง", frames: 450, cover: 400, sizes: ["9x16", "16x9"] };

const STEPS: Step[] = [
  { year: 190, at: 0 },
  { year: 208, at: 150 },
  { year: 222, at: 300 },
];
const CITY_LIST: CityKey[] = ["luoyang", "changan", "xuchang", "ye", "xiangyang", "jiangling", "chaisang", "jianye", "chengdu", "hanzhong"];
const CHINA = bbox([[99, 21.5], [124.5, 41.5]]);

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { s, vertical } = useUnit();
  const base = camForFeature(CHINA, width, height, vertical ? 0.02 : 0.06, vertical ? [109.8, 31.4] : [111.5, 31.5]);
  const cam = { ...base, scale: base.scale * (vertical ? 1.3 : 1) * interpolate(frame, [0, demo.frames], [1, 1.05], clamp) };
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Sfx src={SFX.swell} at={0} volume={0.35} />
      <Hit id="war_drums" at={4} volume={0.35} />
      {STEPS.slice(1).map((st) => (
        <Sfx key={st.at} src={SFX.whoosh} at={st.at - 6} volume={0.4} />
      ))}
      {STEPS.slice(1).map((st) => (
        <Hit key={`g${st.at}`} id="gong" at={st.at + 8} volume={0.3} />
      ))}
      <Bed id="wind" from={0} to={demo.frames} volume={0.12} />
      <MapFrame cam={cam} focusY={vertical ? 0.5 : 0.5} focusX={vertical ? 0.5 : 0.58}>
        <PaperMap />
        <EraMap steps={STEPS} />
        <CityMarks steps={STEPS} cities={CITY_LIST} />
      </MapFrame>
      <PaperTexture />
      <YearBadge steps={STEPS} start={6} />
      <Tally steps={STEPS} cities={CITY_LIST} start={30} />
      <div style={{ position: "absolute", top: vertical ? 70 : 40 * s, left: vertical ? 0 : 50 * s, right: vertical ? 0 : undefined, textAlign: vertical ? "center" : "left", fontFamily: fonts.body, color: C.ink, opacity: fade(frame, 8, 26) }}>
        <div style={{ fontSize: 40, fontWeight: 700, opacity: 0.85, WebkitTextStroke: `6px ${C.land}`, paintOrder: "stroke fill" }}>M07 · กระดานคะแนนครองเมือง</div>
        {vertical && <div style={{ fontFamily: fonts.title, fontSize: 72, lineHeight: 1.35, color: C.wu, WebkitTextStroke: `10px ${C.land}`, paintOrder: "stroke fill" }}>ใครครองเมืองไหน</div>}
      </div>
      <div style={{ position: "absolute", right: 26 * s, bottom: vertical ? height * 0.24 : 18 * s, fontFamily: fonts.body, fontSize: 18 * s, color: C.ink, opacity: 0.75 }}>แนวโดยประมาณ · แผนที่ Natural Earth</div>
    </AbsoluteFill>
  );
};
