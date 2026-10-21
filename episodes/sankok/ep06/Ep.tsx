import { useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { camAt, camForFeature } from "../../../components/camera";
import { MapFrame } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { CharacterCard, NovelStamp, PortraitCard, Seal, SideCard, TitleCard } from "../kit/Cards";
import { EpisodeFrame, timeline, type EpisodeMeta, type Variant } from "../kit/Frame";
import { Flags, Tint } from "../kit/Marks";
import { at as place } from "../kit/places";
import { Badge, C, fade, fonts, InkLabel, PaperMap, useUnit } from "../kit/theme";
import beatsText from "./beats.json";
import meta from "./meta.json";
import timing from "./timing.json";
import { Insets } from "./Insets";

// ตอนที่ 6 · ดาบเจ็ดดาว (ค.ศ. 189)
export const EP: EpisodeMeta = { n: 6, title: meta.chapter, next: meta.next, nextQ: meta.nextQ as [string, string], ask: meta.ask };
export const BEATS = buildBeats(timing, beatsText);
const TL = timeline(BEATS);
const { B, at } = TL;
export const THUMB = at("mirror", 0.5); // thumbnail frame

const LY = place("luoyang");
const CG = place("chenggao");
const CL = place("chenliu");
const CITY = bbox([[111.9, 34.3], [113.0, 35.0]]);
const ROAD = bbox([[111.9, 34.0], [115.3, 35.4]]);
const EAST = bbox([[110.5, 32.5], [119.5, 39.5]]);

// The record: the quote as Sun Sheng's Zaji has it, not the novel's "the whole world".
const Quote = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.twist.start} to={B.cliff.start + 6} tilt={2}>
      <div style={{ fontSize: 26 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>คำที่จดไว้จริง · ซุนเซ่ง</div>
      <div style={{ fontFamily: "'Microsoft YaHei', 'SimSun', serif", fontSize: 40 * s, lineHeight: 1.4 }}>寧我負人，毋人負我</div>
      <div style={{ fontSize: 28 * s, lineHeight: 1.55 }}>ข้ายอมทรยศคนอื่น ดีกว่าให้คนอื่นทรยศข้า</div>
      <div style={{ fontSize: 22 * s, lineHeight: 1.5, opacity: 0.75 }}>ไม่มีคำว่า "คนทั้งแผ่นดิน" · บางฉบับว่าครอบครัวนั้นคิดปล้นเขาก่อน</div>
    </SideCard>
  );
};

const HowMany = () => {
  const { s } = useUnit();
  return (
    <SideCard from={at("cliff", 0.45)} to={B.cliff.end + 6} tilt={-2} width={480}>
      <div style={{ fontFamily: fonts.title, fontSize: 48 * s, lineHeight: 1.35, textAlign: "center" }}>สิบแปดหัวเมือง</div>
      <div style={{ fontSize: 28 * s, lineHeight: 1.5, textAlign: "center", opacity: 0.8 }}>จริง ๆ มีกี่คน?</div>
      <Seal text="?" at={at("cliff", 0.7)} />
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
      { frame: B.flee.start, cam: fit(CITY) },
      { frame: B.record.start + 20, cam: fit(ROAD) },
      { frame: B.twist.end, cam: fit(ROAD) },
      { frame: B.cliff.start + 30, cam: fit(EAST) },
    ],
    frame,
  );
  const night = (f: number) => 0.4 * fade(f, B.inn.start, B.inn.start + 10, B.kill.end, B.kill.end + 12);
  const fleeK = fade(frame, B.flee.start + 6, B.record.end);

  return (
    <EpisodeFrame
      ep={EP}
      beats={BEATS}
      variant={variant}
      sounds={
        <>
          <Sfx src={SFX.hit} at={0} volume={0.5} />
          <Sfx src={SFX.swell} at={0} volume={0.25} />
          <Sfx src={SFX.riser} at={B.hookq.start} volume={0.2} />
          <Sfx src={SFX.hit} at={at("mirror", 0.15)} volume={0.45} />
          <Sfx src={SFX.whoosh} at={B.flee.start} />
          <Sfx src={SFX.hit} at={B.record.start} volume={0.4} />
          <Sfx src={SFX.riser} at={B.inn.start} volume={0.2} />
          <Sfx src={SFX.hit} at={at("kill", 0.2)} volume={0.5} />
          <Sfx src={SFX.pop} at={B.twist.start + 8} volume={0.3} />
          <Sfx src={SFX.hit} at={at("cliff", 0.45)} volume={0.4} />
        </>
      }
      map={
        <MapFrame cam={cam}>
          <PaperMap />
          <InkLabel at={LY} text="ลกเอี๋ยง" start={0} end={B.cliff.start + 20} dy={60} size={1.3} />
          <Badge at={[LY[0] - 0.22, LY[1] + 0.12]} name="ตั๋งโต๊ะ" color={C.dong} start={B.hookq.start} end={B.record.end} />
          <Arrow points={[LY, [113.0, 34.95], CG, CL]} start={B.flee.start + 6} end={B.record.end} color={C.wei} width={14} variant="dashed" opacity={1 - fade(frame, B.cliff.start, B.cliff.start + 15)} />
          <Badge at={[LY[0] + (CL[0] - LY[0]) * fleeK, LY[1] + (CL[1] - LY[1]) * fleeK - 0.1]} name="โจโฉ" color={C.wei} start={B.flee.start} end={B.cliff.start + 10} above={false} />
          <InkLabel at={CG} text="บ้านลิแปะเฉีย" start={B.inn.start} end={B.twist.end} dy={-44} />
          <InkLabel at={CL} text="ตันลิว" start={at("record", 0.6)} end={B.cliff.start + 20} dy={48} />
          <Flags
            items={[[114.45, 35.2], [113.1, 35.15], [112.53, 33.0], [115.5, 36.8], [116.6, 35.4], [117.4, 34.2], [114.8, 34.8], [118.4, 36.6]].map((p) => ({ at: p as [number, number], color: C.yuan }))}
            start={at("cliff", 0.15)}
            stagger={5}
          />
          <Insets {...TL} />
        </MapFrame>
      }
      overlay={
        <>
          <Tint color="#151a2e" opacity={night} />
          <TitleCard kicker="สามก๊ก · ตอนที่ 6" lines={["ดาบเล่มเดียว", "ซ่อนในแขนเสื้อ"]} from={0} to={B.hookq.end} />
          <CharacterCard who="wangyun" from={at("novel", 0.15)} to={B.mirror.start} role="ผู้ให้ยืมดาบเจ็ดดาว (ในนิยาย)" />
          <NovelStamp
            at={B.record.start}
            end={B.inn.start + 6}
            rows={[
              { label: "ในนิยาย", text: "ลอบฆ่าด้วยดาบเจ็ดดาว", color: C.shu, at: B.record.start + 6, source: "นิยายสามก๊ก ตอนที่ 4" },
              { label: "ตามบันทึก", text: "ปฏิเสธตำแหน่ง แล้วปลอมชื่อหนี", color: C.wu, at: at("record", 0.35), source: "จดหมายเหตุสามก๊ก · ภาคโจโฉ" },
            ]}
          />
          <CharacterCard who="lvboshe" from={at("inn", 0.2)} to={B.kill.start} />
          <PortraitCard who="caocao" from={B.quote.start} to={B.quote.end + 6} />
          <Quote />
          <HowMany />
        </>
      }
    />
  );
};
