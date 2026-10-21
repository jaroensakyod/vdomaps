import { useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { camAt, camForFeature } from "../../../components/camera";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { CharacterCard, NovelStamp, PortraitCard, Seal, SideCard, TitleCard } from "../kit/Cards";
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

// ตอนที่ 10 · หญิงงามคนเดียว (ค.ศ. 192)
export const EP: EpisodeMeta = { n: 10, title: meta.chapter, next: meta.next, nextQ: meta.nextQ as [string, string], ask: meta.ask };
export const BEATS = buildBeats(timing, beatsText);
const TL = timeline(BEATS);
const { B, at } = TL;
export const THUMB = at("hook", 0.6); // thumbnail frame

const CA = place("changan");
const CITY = bbox([[108.4, 33.95], [109.5, 34.6]]);
const WEST = bbox([[103.5, 33.0], [112.5, 37.5]]);
const LIANG: [number, number] = [104.6, 35.9]; // Dong Zhuo's old frontier base, approximate

const Lamp = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.navel.start} to={B.cliff.start + 6} tilt={2}>
      <div style={{ fontSize: 26 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ตามบันทึก</div>
      <div style={{ fontSize: 30 * s, lineHeight: 1.55 }}>ทหารเฝ้าศพจุดไส้ตะเกียงที่สะดือ ไฟลุกอยู่หลายวัน</div>
      <div style={{ fontSize: 22 * s, lineHeight: 1.5, opacity: 0.75 }}>ตามบันทึกประวัติศาสตร์ · ภาคตั๋งโต๊ะ</div>
    </SideCard>
  );
};

const Runs = () => {
  const { s } = useUnit();
  return (
    <SideCard from={at("cliff", 0.55)} to={B.cliff.end + 6} tilt={-2} width={480}>
      <div style={{ fontFamily: fonts.title, fontSize: 48 * s, lineHeight: 1.35, textAlign: "center" }}>ลิโป้หนี</div>
      <div style={{ fontSize: 28 * s, lineHeight: 1.5, textAlign: "center", opacity: 0.8 }}>จะไปพึ่งใคร?</div>
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
      { frame: 0, cam: { ...fit(CITY), scale: fit(CITY).scale * 1.1 } },
      { frame: B.hookq.end, cam: fit(CITY) },
      { frame: B.cliff.start, cam: fit(CITY) },
      { frame: B.cliff.start + 35, cam: fit(WEST) },
    ],
    frame,
  );
  const dark = (f: number) => 0.3 * fade(f, B.kill.start, B.kill.start + 8, B.kill.end, B.kill.end + 10);

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
          <Sfx src={SFX.riser} at={B.hookq.start} volume={0.2} />
          <Sfx src={SFX.pop} at={B.novel.start + 10} volume={0.3} />
          <Sfx src={SFX.whoosh} at={at("halberd", 0.4)} volume={0.7} />
          <Sfx src={SFX.hit} at={B.record.start} volume={0.45} />
          <Sfx src={SFX.riser} at={B.wangyun.start - 20} volume={0.2} />
          <Sfx src={SFX.hit} at={at("kill", 0.6)} volume={0.55} />
          <Sfx src={SFX.whoosh} at={B.cliff.start + 20} />
          <Sfx src={SFX.hit} at={at("cliff", 0.55)} volume={0.4} />
        </>
      }
      map={
        <SankokMap cam={cam}>
          <PaperMap />
          <InkLabel at={CA} text="เตียงอัน" start={0} dy={60} size={1.3} />
          <Badge at={[CA[0] - 0.18, CA[1] + 0.1]} name="ตั๋งโต๊ะ" color={C.dong} start={B.hookq.start} end={at("kill", 0.6)} />
          <Badge at={[CA[0] + 0.18, CA[1] + 0.1]} name="ลิโป้" color={C.lvbu} start={B.hookq.start + 6} />
          <Badge at={[CA[0] + 0.05, CA[1] - 0.14]} name="อ้องอุ้น" color={C.han} start={B.plot.start} end={B.cliff.start + 20} above={false} />
          <Arrow points={[LIANG, [106.6, 35.3], CA]} start={at("cliff", 0.25)} end={at("cliff", 0.6)} color={C.dong} width={24} />
          <Badge at={[106.2, 35.6]} name="ลูกน้องตั๋งโต๊ะ" sub="ลิฉุย · กุยกี" color={C.dong} start={at("cliff", 0.3)} />
          <Arrow points={[CA, [110.5, 34.6], [112.2, 34.7]]} start={at("cliff", 0.6)} end={B.cliff.end} color={C.lvbu} width={16} variant="dashed" />
          <Insets {...TL} />
        </SankokMap>
      }
      overlay={
        <>
          <Tint color="#3a1d3c" opacity={dark} />
          <TitleCard kicker="สามก๊ก · ตอนที่ 10" lines={["หญิงงามคนเดียว", "ทำให้ลิโป้ฆ่าพ่อบุญธรรม"]} from={0} to={B.hookq.end} />
          <CharacterCard who="diaochan" from={B.hookq.start} to={B.novel.start + 10} role="หญิงงามในนิยาย" />
          <NovelStamp
            at={B.record.start}
            end={B.plot.start + 6}
            rows={[
              { label: "ในนิยาย", text: "แผนสาวงาม เตียวเสี้ยน", color: C.shu, at: B.record.start + 8, source: "นิยายสามก๊ก ตอนที่ 8–9" },
              { label: "ตามบันทึก", text: "ไม่มีเตียวเสี้ยน มีแค่สาวใช้", color: C.wu, at: at("record", 0.35), source: "จดหมายเหตุสามก๊ก · ภาคลิโป้" },
            ]}
          />
          <CharacterCard who="wangyun" from={at("plot", 0.15)} to={B.wangyun.start} />
          <PortraitCard who="wangyun" from={B.wangyun.start} to={B.wangyun.end + 6} />
          <YearBadge year={192} title="ตั๋งโต๊ะตาย" start={B.kill.start + 6} end={B.navel.start} />
          <Lamp />
          <Runs />
        </>
      }
    />
  );
};
