import { useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { camAt, camForFeature } from "../../../components/camera";
import { MapFrame } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { CharacterCard, NovelStamp, PortraitCard, Seal, SideCard, StatCard, TitleCard } from "../kit/Cards";
import { EpisodeFrame, timeline, type EpisodeMeta, type Variant } from "../kit/Frame";
import { Flags, Flames } from "../kit/Marks";
import { at as place } from "../kit/places";
import { EraMap, YearBadge } from "../kit/Scoreboard";
import { Badge, C, fade, fonts, InkLabel, PaperMap, useUnit } from "../kit/theme";
import beatsText from "./beats.json";
import meta from "./meta.json";
import timing from "./timing.json";
import { Insets } from "./Insets";

// ตอนที่ 7 · เหล้ายังอุ่น (ค.ศ. 190) — act 2 opens: the scoreboard map for 190.
export const EP: EpisodeMeta = { n: 7, title: meta.chapter, next: meta.next, nextQ: meta.nextQ as [string, string], ask: meta.ask };
export const BEATS = buildBeats(timing, beatsText);
const TL = timeline(BEATS);
const { B, at } = TL;
export const THUMB = at("warm", 0.5); // thumbnail frame

const LY = place("luoyang");
const SZ = place("suanzao");
const HN = place("henei");
const NY = place("nanyang");
const XY = place("xingyang");
const FRONT = bbox([[111.2, 32.6], [115.4, 35.8]]);
const REALM = bbox([[104, 31.5], [120, 40]]);
// The allied camps: three sides of the capital (as many flags as the novel's "18 lords", roughly placed).
const CAMPS: [number, number][] = [SZ, HN, NY, [114.2, 35.0], [114.7, 35.4], [113.6, 35.3], [112.9, 33.3], [115.0, 34.6], [114.0, 34.5], [113.3, 33.6], [115.3, 35.1]];

const Feast = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.drink.start} to={B.cao.start + 6} tilt={2}>
      <div style={{ fontSize: 26 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ตามบันทึก</div>
      <div style={{ fontSize: 32 * s, lineHeight: 1.55 }}>ตั้งเลี้ยงสุราทุกวัน ไม่มีใครคิดจะบุก</div>
      <Seal text="置酒高會" at={B.drink.start + 14} />
    </SideCard>
  );
};

const Burn = () => {
  const { s } = useUnit();
  return (
    <SideCard from={at("cliff", 0.45)} to={B.cliff.end + 6} tilt={-2} width={480}>
      <div style={{ fontFamily: fonts.title, fontSize: 48 * s, lineHeight: 1.35, textAlign: "center" }}>เผาเมืองหลวง</div>
      <div style={{ fontSize: 28 * s, lineHeight: 1.5, textAlign: "center", opacity: 0.8 }}>แล้วจะพาฮ่องเต้หนีไปไหน?</div>
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
      { frame: 0, cam: { ...fit(FRONT), scale: fit(FRONT).scale * 1.08 } },
      { frame: B.hookq.end, cam: fit(FRONT) },
      { frame: B.count.start, cam: fit(FRONT) },
      { frame: B.count.start + 25, cam: fit(REALM) },
      { frame: B.count.end, cam: fit(REALM) },
      { frame: B.drink.start + 20, cam: fit(FRONT) },
    ],
    frame,
  );
  const sunK = fade(frame, B.sun.start + 10, B.sun.end);

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
          <Sfx src={SFX.whoosh} at={B.camps.start} />
          <Sfx src={SFX.hit} at={B.count.start + 10} volume={0.4} />
          <Sfx src={SFX.whoosh} at={B.cao.start + 6} />
          <Sfx src={SFX.pop} at={B.huaxiong.start + 10} volume={0.3} />
          <Sfx src={SFX.hit} at={at("warm", 0.4)} volume={0.45} />
          <Sfx src={SFX.hit} at={B.record.start} volume={0.45} />
          <Sfx src={SFX.whoosh} at={B.sun.start + 10} />
          <Sfx src={SFX.riser} at={B.cliff.start} volume={0.2} />
          <Sfx src={SFX.hit} at={at("cliff", 0.45)} volume={0.4} />
        </>
      }
      map={
        <MapFrame cam={cam}>
          <PaperMap />
          <EraMap from={190} start={B.count.start} end={B.drink.start + 10} opacity={0.75} />
          <Flags items={CAMPS.map((p) => ({ at: p, color: C.yuan }))} start={-20} stagger={2} end={B.record.start} />
          <InkLabel at={LY} text="ลกเอี๋ยง" start={0} dy={60} size={1.3} />
          <Badge at={[LY[0] - 0.3, LY[1] + 0.15]} name="ตั๋งโต๊ะ" color={C.dong} start={B.hookq.start} />
          <Badge at={HN} name="อ้วนเสี้ยว" sub="แม่ทัพใหญ่พันธมิตร" color={C.yuan} start={at("camps", 0.3)} end={B.count.start + 6} />
          <Badge at={SZ} name="ค่ายซวนเจ๋า" color={C.yuan} start={at("camps", 0.45)} end={B.count.start + 6} above={false} />
          <Badge at={NY} name="อ้วนสุด" color={C.yuan} start={at("camps", 0.6)} end={B.count.start + 6} above={false} />
          <Arrow points={[SZ, [113.9, 34.95], XY]} start={B.cao.start + 6} end={B.cao.end} color={C.wei} width={16} opacity={1 - fade(frame, B.huaxiong.start, B.huaxiong.start + 12)} />
          <Badge at={XY} name="โจโฉแพ้" sub="บุกลำพัง" color={C.wei} start={at("cao", 0.6)} end={B.huaxiong.start + 6} above={false} />
          <Arrow points={[[112.9, 33.2], [112.7, 33.9], [112.55, 34.4]]} start={B.sun.start + 10} end={B.sun.end} color={C.wu} width={20} />
          <Badge at={[112.9 + (112.55 - 112.9) * sunK, 33.2 + (34.4 - 33.2) * sunK]} name="ซุนเกี๋ยน" color={C.wu} start={B.sun.start} above={false} />
          <Flames points={[LY, [LY[0] + 0.08, LY[1] + 0.05], [LY[0] - 0.08, LY[1] - 0.04]]} start={at("cliff", 0.35)} stagger={4} />
          <Insets {...TL} />
        </MapFrame>
      }
      overlay={
        <>
          <TitleCard kicker="สามก๊ก · ตอนที่ 7" lines={["ทหารกว่าแสนคน", "ไม่มีใครกล้าบุก"]} from={0} to={B.hookq.end} />
          <YearBadge year={190} title="พันธมิตรปราบตั๋งโต๊ะ" start={B.camps.start + 6} end={B.count.start + 4} />
          <NovelStamp
            at={B.count.start}
            end={B.drink.start + 4}
            rows={[
              { label: "ในนิยาย", text: "สิบแปดหัวเมือง", color: C.shu, at: B.count.start + 8, source: "นิยายสามก๊ก ตอนที่ 5" },
              { label: "ตามบันทึก", text: "ราวสิบเอ็ดคน ส่วนใหญ่ไม่กล้ารบ", color: C.wu, at: at("count", 0.45), source: "จดหมายเหตุสามก๊ก · ภาคโจโฉ" },
            ]}
          />
          <Feast />
          <CharacterCard who="huaxiong" from={at("huaxiong", 0.15)} to={B.guanyu.start} />
          <PortraitCard who="guanyu" from={B.guanyu.start} to={B.guanyu.end + 6} />
          <NovelStamp
            at={B.record.start}
            end={B.sun.start + 4}
            rows={[
              { label: "ในนิยาย", text: "กวนอูฆ่าฮัวหยง เหล้ายังอุ่น", color: C.shu, at: B.record.start + 8, source: "นิยายสามก๊ก ตอนที่ 5" },
              { label: "ตามบันทึก", text: "ทัพซุนเกี๋ยนตัดหัวฮัวหยง", color: C.wu, at: at("record", 0.3), source: "จดหมายเหตุสามก๊ก · ภาคซุนเกี๋ยน" },
            ]}
          />
          <CharacterCard who="sunjian" from={at("sun", 0.15)} to={B.cliff.start} />
          <Burn />
        </>
      }
    />
  );
};
