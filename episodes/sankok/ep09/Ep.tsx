import { useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { camAt, camForFeature } from "../../../components/camera";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { CharacterCard, NovelStamp, PortraitCard, Seal, SideCard, StatCard, TitleCard } from "../kit/Cards";
import { SankokMap } from "../kit/Layout";
import { EpisodeFrame, timeline, type EpisodeMeta, type Variant } from "../kit/Frame";
import { Tint } from "../kit/Marks";
import { at as place } from "../kit/places";
import { YearBadge } from "../kit/Scoreboard";
import { Badge, C, fade, fonts, InkLabel, PaperMap, useUnit } from "../kit/theme";
import beatsText from "./beats.json";
import meta from "./meta.json";
import timing from "./timing.json";
import { Insets } from "./Insets";

// ตอนที่ 9 · ลูกธนูดอกเดียว (ค.ศ. 191)
export const EP: EpisodeMeta = { n: 9, title: meta.chapter, next: meta.next, nextQ: meta.nextQ as [string, string], ask: meta.ask };
export const BEATS = buildBeats(timing, beatsText);
const TL = timeline(BEATS);
const { B, at } = TL;
export const THUMB = at("night", 0.5); // thumbnail frame

const NY = place("nanyang");
const XY = place("xiangyang");
const XS = place("xianshan");
const CA = place("changan");
const JING = bbox([[110.6, 31.2], [113.8, 33.6]]);
const HILL = bbox([[111.7, 31.7], [112.6, 32.3]]);
const WEST = bbox([[107.5, 31.0], [114.0, 35.5]]);

const Vow = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.seal.start} to={B.cliff.start + 6} tilt={2}>
      <div style={{ fontSize: 26 * s, fontWeight: 700, color: C.yuan, lineHeight: 1.5 }}>ตราหยกตกอยู่กับอ้วนสุด</div>
      <div style={{ fontSize: 30 * s, lineHeight: 1.55 }}>ภายหลังเขาใช้มันประกาศตั้งตัวเป็นฮ่องเต้</div>
      <Seal text="傳國璽" at={B.seal.start + 12} color={C.yuan} />
    </SideCard>
  );
};

const Beauty = () => {
  const { s } = useUnit();
  return (
    <SideCard from={at("cliff", 0.5)} to={B.cliff.end + 6} tilt={-2} width={480}>
      <div style={{ fontFamily: fonts.title, fontSize: 48 * s, lineHeight: 1.35, textAlign: "center" }}>หญิงงามคนเดียว</div>
      <div style={{ fontSize: 28 * s, lineHeight: 1.5, textAlign: "center", opacity: 0.8 }}>ทำลายตั๋งโต๊ะได้จริงหรือ?</div>
      <Seal text="?" at={at("cliff", 0.75)} />
    </SideCard>
  );
};

export const Ep = ({ variant }: { variant: Variant }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fit = (f: Parameters<typeof camForFeature>[0], pad = 0.06) => camForFeature(f, width, height, pad);
  const cam = camAt(
    [
      { frame: 0, cam: { ...fit(HILL), scale: fit(HILL).scale * 0.9 } },
      { frame: B.war.start, cam: fit(HILL) },
      { frame: B.war.start + 30, cam: fit(JING) },
      { frame: B.siege.end, cam: fit(JING) },
      { frame: B.night.start + 25, cam: fit(HILL) },
      { frame: B.sons.start, cam: fit(HILL) },
      { frame: B.sons.start + 30, cam: fit(JING) },
      { frame: B.cliff.start, cam: fit(JING) },
      { frame: B.cliff.start + 35, cam: fit(WEST) },
    ],
    frame,
  );
  const night = (f: number) => 0.45 * fade(f, 0, 6, B.hookq.end, B.hookq.end + 10) + 0.45 * fade(f, B.night.start, B.night.start + 10, B.age.end, B.age.end + 10);
  const warK = fade(frame, B.war.start + 10, B.siege.start + 10);

  return (
    <EpisodeFrame
      layout="v2"
      ep={EP}
      beats={BEATS}
      variant={variant}
      sounds={
        <>
          <Sfx src={SFX.hit} at={0} volume={0.5} />
          <Sfx src={SFX.swell} at={0} volume={0.25} />
          <Sfx src={SFX.whoosh} at={8} volume={0.6} />
          <Sfx src={SFX.riser} at={B.hookq.start} volume={0.2} />
          <Sfx src={SFX.whoosh} at={B.war.start + 10} />
          <Sfx src={SFX.hit} at={at("siege", 0.5)} volume={0.4} />
          <Sfx src={SFX.whoosh} at={at("night", 0.6)} volume={0.6} />
          <Sfx src={SFX.hit} at={B.age.start + 6} volume={0.45} />
          <Sfx src={SFX.hit} at={B.record.start} volume={0.45} />
          <Sfx src={SFX.swell} at={B.sons.start} volume={0.2} />
          <Sfx src={SFX.pop} at={B.seal.start + 12} volume={0.3} />
          <Sfx src={SFX.hit} at={at("cliff", 0.5)} volume={0.4} />
        </>
      }
      map={
        <SankokMap cam={cam}>
          <PaperMap />
          <InkLabel at={XY} text="ซงหยง" start={B.war.start} dy={60} size={1.3} />
          <Badge at={[XY[0] - 0.12, XY[1] + 0.1]} name="เล่าเปียว" sub="เจ้าเมืองเกงจิ๋ว" color="#5a7d4e" start={at("war", 0.45)} end={B.sons.start} />
          <Arrow points={[NY, [112.4, 32.6], [112.2, 32.15]]} start={B.war.start + 10} end={B.siege.start + 10} color={C.wu} width={20} />
          <Badge at={[NY[0] + (112.25 - NY[0]) * warK, NY[1] + (32.2 - NY[1]) * warK]} name="ซุนเกี๋ยน" color={C.wu} start={B.war.start + 6} end={B.night.end} above={false} />
          <Badge at={[XY[0] + 0.16, XY[1] - 0.1]} name="หองจอ" sub="แตกพ่าย" color="#5a7d4e" start={at("siege", 0.2)} end={B.night.start} above={false} />
          <InkLabel at={XS} text="เขาเหียนสัน" start={B.night.start} end={B.sons.start} dy={-48} />
          <Badge at={NY} name="อ้วนสุด" sub="ได้ตราหยก" color={C.yuan} start={B.seal.start + 6} end={B.cliff.start + 20} above={false} />
          <InkLabel at={CA} text="เตียงอัน" start={at("cliff", 0.3)} dy={60} size={1.3} />
          <Badge at={[CA[0], CA[1] + 0.25]} name="อ้องอุ้น" color={C.han} start={at("cliff", 0.45)} />
          <Insets {...TL} />
        </SankokMap>
      }
      overlay={
        <>
          <Tint color="#151a2e" opacity={night} />
          <TitleCard kicker="สามก๊ก · ตอนที่ 9" lines={["ชนะตั๋งโต๊ะ แต่ตาย", "เพราะธนูดอกเดียว"]} from={0} to={B.hookq.end} />
          <CharacterCard who="sunjian" from={-6} to={B.hookq.end + 4} role="ขุนพลคนเดียวที่ตีทัพตั๋งโต๊ะแตก" />
          <YearBadge year={191} title="ศึกเกงจิ๋ว" start={B.war.start + 6} end={B.siege.start} />
          <CharacterCard who="huangzu" from={at("siege", 0.15)} to={B.night.start} />
          <StatCard label="ซุนเกี๋ยนอายุ" value="37 ปี" sub="ตามบันทึก" from={B.age.start} to={B.novel.start + 6} color={C.wu} />
          <NovelStamp
            at={B.novel.start}
            end={B.sons.start + 4}
            rows={[
              { label: "ในนิยาย", text: "หินและธนูนับร้อย เพราะตราหยก", color: C.shu, at: at("novel", 0.3), source: "นิยายสามก๊ก ตอนที่ 7" },
              { label: "ตามบันทึก", text: "ถูกทหารหองจอยิงตาย ในศึกธรรมดา", color: C.wu, at: at("record", 0.3), source: "จดหมายเหตุสามก๊ก · ภาคซุนเกี๋ยน" },
            ]}
          />
          <PortraitCard who="sunce" from={B.vow.start} to={B.vow.end + 6} />
          <Vow />
          <CharacterCard who="yuanshu" from={at("seal", 0.3)} to={B.cliff.start} />
          <Beauty />
        </>
      }
    />
  );
};
