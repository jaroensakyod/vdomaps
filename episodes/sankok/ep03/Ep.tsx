import { useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { camAt, camForFeature } from "../../../components/camera";
import { MapFrame } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { CharacterCard, SideCard, TitleCard } from "../kit/Cards";
import { ERAS, YELLOW_TURBAN_RISINGS } from "../kit/eras";
import { EpisodeFrame, timeline, type EpisodeMeta, type Variant } from "../kit/Frame";
import { Flags, Flames } from "../kit/Marks";
import { at as place } from "../kit/places";
import { EraMap, YearBadge } from "../kit/Scoreboard";
import { Badge, C, fonts, InkLabel, PaperMap, useUnit } from "../kit/theme";
import beatsText from "./beats.json";
import timing from "./timing.json";
import { Insets } from "./Insets";

// ตอนที่ 3 · ผู้นำกบฏตายเพราะโรค (ค.ศ. 184–189)
export const EP: EpisodeMeta = { n: 3, title: "ผู้นำกบฏตายเพราะโรค", next: "ประตูวังเปื้อนเลือด", nextQ: ["ฆ่าทุกคนที่ไม่มีหนวด", "ในวังฮ่องเต้?"], ask: "โจโฉคือวีรบุรุษ หรือกังฉิน?" };
export const BEATS = buildBeats(timing, beatsText);
const TL = timeline(BEATS);
const { B, at } = TL;
export const THUMB = at("head", 0.35); // thumbnail frame

const GUANGZONG = bbox([[113.6, 36.2], [116.6, 38.2]]);
const YINGCHUAN: [number, number] = [113.5, 34.15]; // 潁川, approximate
const CENTRAL = bbox([[110.5, 32.8], [116.5, 36.4]]);
const LUOYANG = bbox([[110.8, 33.6], [114.2, 35.6]]);
// Commanderies that raised their own armies after 188 (illustrative spread, not a list of real governors).
const WARLORDS: { at: [number, number]; color: string }[] = [
  { at: [116.4, 39.6], color: C.yuan }, { at: [114.4, 36.3], color: C.yuan }, { at: [118.4, 36.5], color: "#4f7a8a" },
  { at: [117.2, 34.3], color: "#7a6a3a" }, { at: [116.8, 32.6], color: C.yuan }, { at: [112.2, 31.0], color: "#5a7d4e" },
  { at: [104.1, 30.7], color: "#8a5a3a" }, { at: [108.9, 34.3], color: C.dong }, { at: [119.0, 31.5], color: C.wu },
  { at: [112.5, 37.9], color: "#6a6a8a" },
];

const Prophecy = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.seer.start} to={B.laugh.end}>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>คำทำนายตัวโจโฉ</div>
      <div style={{ fontFamily: "'Microsoft YaHei', 'SimSun', serif", fontSize: 38 * s, lineHeight: 1.5, letterSpacing: 4 * s }}>治世之能臣<br />亂世之奸雄</div>
      <div style={{ fontSize: 24 * s, lineHeight: 1.5, opacity: 0.75, fontFamily: fonts.body }}>ตามบันทึกของซุนเซิ่ง</div>
    </SideCard>
  );
};

// Mid-episode re-hook: 188, provincial governors get armies, taxes and officials of their own.
const Governors = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.governors.start} to={B.cao.start + 6} tilt={2}>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ค.ศ. 188 · เจ้าเมืองใหญ่ (州牧)</div>
      <div style={{ fontSize: 32 * s, lineHeight: 1.6 }}>
        คุมทัพ · คุมภาษี · ตั้งขุนนางเอง
      </div>
      <div style={{ fontSize: 26 * s, lineHeight: 1.5, opacity: 0.8 }}>จุดเริ่มของยุคขุนศึก</div>
    </SideCard>
  );
};

export const Ep = ({ variant }: { variant: Variant }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fit = (f: Parameters<typeof camForFeature>[0], pad = 0.06) => camForFeature(f, width, height, pad);
  const han = fit(ERAS[184].sides[0].area, 0.05);
  const cam = camAt(
    [
      { frame: 0, cam: { ...fit(GUANGZONG), scale: fit(GUANGZONG).scale * 1.15 } },
      { frame: B.head.start, cam: fit(GUANGZONG) },
      { frame: B.head.start + 40, cam: han },
      { frame: B.cost.end, cam: han },
      { frame: B.cao.start + 30, cam: fit(CENTRAL) },
      { frame: B.laugh.end, cam: fit(CENTRAL) },
      { frame: B.emperor.start + 30, cam: fit(LUOYANG) },
    ],
    frame,
  );
  const luoyang = place("luoyang");

  return (
    <EpisodeFrame
      ep={EP}
      beats={BEATS}
      variant={variant}
      sounds={
        <>
          <Sfx src={SFX.swell} at={0} volume={0.25} />
          <Sfx src={SFX.hit} at={at("ill", 0.3)} volume={0.4} />
          <Sfx src={SFX.whoosh} at={B.head.start + 4} />
          <Sfx src={SFX.hit} at={B.governors.start + 6} volume={0.35} />
          <Sfx src={SFX.whoosh} at={B.cao.start} />
          <Sfx src={SFX.pop} at={B.seer.start} volume={0.3} />
          <Sfx src={SFX.whoosh} at={B.emperor.start} />
          <Sfx src={SFX.hit} at={at("cliff", 0.6)} volume={0.4} />
        </>
      }
      map={
        <MapFrame cam={cam}>
          <PaperMap />
          <EraMap from={184} start={B.head.start + 20} end={B.cao.start + 30} opacity={0.65} />
          <Badge at={place("guangzong")} name="เตียวก๊ก" sub="ป่วยตาย" color={C.yellow} start={B.ill.start} end={at("head", 0.4)} />
          <InkLabel at={place("guangzong")} text="กองจง" start={4} end={B.head.end} dy={48} />
          <Flames points={YELLOW_TURBAN_RISINGS.map((r) => r.at)} start={-200} stagger={0} outAt={at("head", 0.5)} />
          <Flags items={WARLORDS} start={B.cost.start + 15} stagger={Math.round((B.governors.end - B.cost.start - 15) / WARLORDS.length)} end={B.cao.start + 25} />
          <Badge at={YINGCHUAN} name="โจโฉ" sub="ปราบโจรที่เองฉวน" color={C.wei} start={at("cao", 0.4)} end={B.emperor.start + 10} />
          <Arrow points={[[114.6, 34.6], [114.1, 34.35], YINGCHUAN]} start={at("cao", 0.3)} end={B.cao.end} color={C.wei} width={16} />
          <InkLabel at={luoyang} text="ลกเอี๋ยง · เมืองหลวง" start={B.emperor.start + 25} dy={48} size={1.1} />
          <Badge at={[luoyang[0] - 0.45, luoyang[1] + 0.25]} name="แม่ทัพ" sub="โฮจิ๋น" color={C.han} start={at("cliff", 0.2)} />
          <Badge at={[luoyang[0] + 0.45, luoyang[1] + 0.25]} name="ขันที" sub="สิบขันที" color={C.dong} start={at("cliff", 0.35)} />
          <Insets {...TL} />
        </MapFrame>
      }
      overlay={
        <>
          <TitleCard kicker="สามก๊ก · ตอนที่ 3" lines={["ผู้นำกบฏหลายแสนคน", "ไม่ได้ตายในสนามรบ?"]} from={4} to={B.hook.end} />
          <CharacterCard who="huangfusong" from={B.head.start + 6} to={B.head.end} />
          <Governors />
          <CharacterCard who="caocao" from={at("cao", 0.35)} to={B.seer.start} role="นายทหารร่างเล็ก อายุราว 30" />
          <Prophecy />
          <YearBadge year={189} title="พระเจ้าเลนเต้สวรรคต" start={B.emperor.start + 10} end={at("cliff", 0.15)} />
        </>
      }
    />
  );
};
