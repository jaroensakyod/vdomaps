import { useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, camForFeature, globeCam } from "../../../components/camera";
import { MapFrame } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { CharacterCard, Seal, SideCard, StatCard, TitleCard } from "../kit/Cards";
import { ERAS, YELLOW_TURBAN_RISINGS } from "../kit/eras";
import { EpisodeFrame, timeline, type EpisodeMeta, type Variant } from "../kit/Frame";
import { Flames, Tint } from "../kit/Marks";
import { at as place } from "../kit/places";
import { EraMap, YearBadge } from "../kit/Scoreboard";
import { Badge, C, fade, fonts, InkLabel, PaperMap, useUnit } from "../kit/theme";
import beatsText from "./beats.json";
import timing from "./timing.json";

// ตอนที่ 1 · ฟ้าเหลืองจะขึ้นแทน (ค.ศ. 184)
export const EP: EpisodeMeta = { n: 1, title: "ฟ้าเหลืองจะขึ้นแทน", next: "สวนท้อที่ไม่มีอยู่จริง", nextQ: ["คนใจดีที่สุดในสามก๊ก", "เฆี่ยนขุนนาง 200 ที?"], ask: "ถ้าเป็นคุณ จะเข้าร่วมกบฏผ้าเหลืองไหม?" };
export const BEATS = buildBeats(timing, beatsText);
const { B, at } = timeline(BEATS);
export const THUMB = at("slogan", 0.5); // thumbnail frame

const NORTH = bbox([[111.5, 34.2], [119.5, 41]]);
const ZHUO = bbox([[114.6, 38.6], [117.4, 40.3]]);
const ZHUO_AT = place("zhuo");
// More fires around each rising for the "spread" beat (illustrative, not specific towns).
const SPREAD = YELLOW_TURBAN_RISINGS.flatMap((r): [number, number][] => [
  [r.at[0] + 0.9, r.at[1] + 0.5],
  [r.at[0] - 0.8, r.at[1] - 0.6],
]);

const Court = () => {
  const { s } = useUnit();
  return (
    <SideCard from={at("why", 0.3)} to={B.zhangjiao.start + 6}>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ค.ศ. 184 · ฮั่นใกล้ล่ม</div>
      <div style={{ fontSize: 30 * s, lineHeight: 1.6 }}>
        <b>ในวัง:</b> ขันทีกุมอำนาจ
        <br />
        <b>นอกวัง:</b> ภัยแล้ง ชาวนาอดตาย
      </div>
    </SideCard>
  );
};

const Proclamation = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.call.start} to={at("liubei", 0.3)} tilt={2}>
      <div style={{ fontFamily: fonts.title, fontSize: 44 * s, lineHeight: 1.4 }}>ประกาศ</div>
      <div style={{ fontSize: 30 * s, lineHeight: 1.55 }}>ทุกเมืองเปิดรับอาสาสมัคร ไปปราบโจรโพกผ้าเหลือง</div>
      <Seal text="詔" at={B.call.start + 14} />
    </SideCard>
  );
};

// Mid-episode re-hook: the record itself describes Liu Bei's odd looks.
const Ears = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.ears.start} to={B.zhangfei.start + 6} tilt={2}>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ตามบันทึก · จดหมายเหตุสามก๊ก</div>
      <div style={{ fontSize: 32 * s, lineHeight: 1.6 }}>
        แขนยาวเลยเข่า
        <br />
        เหลือบตาเห็นใบหูตัวเอง
      </div>
      <Seal text="垂手下膝" at={B.ears.start + 16} />
    </SideCard>
  );
};

const PeachQuestion = () => {
  const { s } = useUnit();
  return (
    <SideCard from={at("cliff", 0.1)} to={B.cliff.end + 6}>
      <div style={{ fontFamily: fonts.title, fontSize: 52 * s, lineHeight: 1.35, textAlign: "center" }}>สาบานในสวนท้อ</div>
      <div style={{ fontSize: 28 * s, lineHeight: 1.5, textAlign: "center", opacity: 0.8 }}>มีจริงไหม?</div>
      <Seal text="?" at={at("cliff", 0.55)} />
    </SideCard>
  );
};

export const Ep = ({ variant }: { variant: Variant }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fit = (f: Parameters<typeof camForFeature>[0], pad = 0.05) => camForFeature(f, width, height, pad);
  const han = fit(ERAS[184].sides[0].area);
  const cam = camAt(
    [
      { frame: 0, cam: globeCam(100, 30, width, height, 0.42) },
      { frame: at("hook", 0.35), cam: han },
      { frame: B.zhangjiao.start, cam: han },
      { frame: B.zhangjiao.start + 30, cam: fit(NORTH) },
      { frame: B.call.end, cam: fit(NORTH) },
      { frame: B.liubei.start + 25, cam: fit(ZHUO, 0.08) },
    ],
    frame,
  );
  const yellow = (f: number) => 0.55 * fade(f, B.slogan.start, B.slogan.start + 8, B.slogan.end - 6, B.slogan.end + 10);

  return (
    <EpisodeFrame
      ep={EP}
      beats={BEATS}
      variant={variant}
      sounds={
        <>
          <Sfx src={SFX.swell} at={0} volume={0.25} />
          <Sfx src={SFX.riser} at={at("hook", 0.2)} volume={0.2} />
          <Sfx src={SFX.whoosh} at={B.zhangjiao.start - 4} />
          <Sfx src={SFX.hit} at={B.slogan.start} volume={0.45} />
          <Sfx src={SFX.riser} at={B.spread.start} volume={0.2} />
          <Sfx src={SFX.pop} at={B.call.start + 14} volume={0.3} />
          <Sfx src={SFX.hit} at={B.ears.start + 16} volume={0.35} />
          <Sfx src={SFX.whoosh} at={B.liubei.start} />
          <Sfx src={SFX.pop} at={B.zhangfei.start} volume={0.3} />
          <Sfx src={SFX.pop} at={at("three", 0.55)} volume={0.3} />
          <Sfx src={SFX.hit} at={at("cliff", 0.55)} volume={0.4} />
        </>
      }
      map={
        <MapFrame cam={cam}>
          <PaperMap />
          <EraMap from={184} start={at("hook", 0.2)} end={B.liubei.start + 20} opacity={0.75} />
          <Flames points={YELLOW_TURBAN_RISINGS.map((r) => r.at)} start={at("hook", 0.35)} stagger={7} outAt={B.liubei.start} size={1.1} />
          <Flames points={SPREAD} start={B.spread.start + 4} stagger={3} outAt={B.liubei.start} size={0.8} />
          <Badge at={place("julu")} name="เตียวก๊ก" sub="กิลก · โดยประมาณ" color={C.yellow} start={B.zhangjiao.start + 30} end={B.call.end} />
          <InkLabel at={ZHUO_AT} text="โต๊ะกุ๋น · โดยประมาณ" start={B.liubei.start + 20} dy={48} />
          <Badge at={ZHUO_AT} name="เล่าปี่" color={C.shu} start={B.liubei.start + 30} />
          <Badge at={[ZHUO_AT[0] + 0.55, ZHUO_AT[1] + 0.32]} name="เตียวหุย" color={C.shu} start={B.zhangfei.start} />
          <Badge at={[ZHUO_AT[0] - 0.55, ZHUO_AT[1] + 0.32]} name="กวนอู" color={C.shu} start={at("three", 0.55)} />
        </MapFrame>
      }
      overlay={
        <>
          <Tint color="#e8c22a" opacity={yellow} />
          <TitleCard kicker="สามก๊ก · ตอนที่ 1" lines={["ชาวนาหลายแสนคน", "ลุกฮือในเดือนเดียว?"]} from={4} to={at("hook", 0.6)} />
          <StatCard label="ผู้ลุกฮือ" value="หลายแสนคน" sub="ใน 8 มณฑล · ค.ศ. 184" from={at("hook", 0.6)} to={at("why", 0.25)} color={C.yellow} />
          <YearBadge year={184} title="ราชวงศ์ฮั่น" start={at("why", 0.05)} end={at("why", 0.3)} />
          <Court />
          <CharacterCard who="zhangjiao" from={at("zhangjiao", 0.3)} to={B.slogan.start} />
          <Proclamation />
          <CharacterCard who="liubei" from={at("liubei", 0.35)} to={B.ears.start} />
          <Ears />
          <CharacterCard who="zhangfei" from={B.three.start} to={at("three", 0.5)} />
          <CharacterCard who="guanyu" from={at("three", 0.55)} to={B.cliff.start} />
          <PeachQuestion />
        </>
      }
    />
  );
};
