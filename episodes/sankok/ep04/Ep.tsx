import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { camAt, camForFeature } from "../../../components/camera";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { CharacterCard, PortraitCard, Seal, SideCard, StatCard, TitleCard } from "../kit/Cards";
import { SankokMap } from "../kit/Layout";
import { EpisodeFrame, timeline, type EpisodeMeta, type Variant } from "../kit/Frame";
import { Flames, Tint } from "../kit/Marks";
import { at as place } from "../kit/places";
import { Badge, C, clamp, fade, fonts, InkLabel, PaperMap, useUnit } from "../kit/theme";
import beatsText from "./beats.json";
import timing from "./timing.json";
import { Insets } from "./Insets";

// ตอนที่ 4 · ประตูวังเปื้อนเลือด (ค.ศ. 189)
export const EP: EpisodeMeta = { n: 4, title: "ประตูวังเปื้อนเลือด", next: "ทหารสามพันยึดเมืองหลวง", nextQ: ["ทหารแค่ 3,000 คน", "ยึดเมืองหลวงได้ยังไง?"], ask: "ถ้าเป็นโฮจิ๋น จะฟังคำเตือนของโจโฉไหม?" };
export const BEATS = buildBeats(timing, beatsText);
const TL = timeline(BEATS);
const { B, at } = TL;
export const THUMB = at("massacre", 0.8); // thumbnail frame

const LY = place("luoyang");
const CITY = bbox([[111.95, 34.3], [112.95, 35.05]]);
const REALM = bbox([[103.5, 32.5], [119.5, 39.5]]);
const RIVER: [number, number] = [112.62, 34.93]; // Yellow River bank north of Luoyang, approximate
const BEIMANG: [number, number] = [112.5, 34.8];
const PALACE: [number, number][] = [[112.42, 34.66], [112.47, 34.63], [112.44, 34.6], [112.49, 34.67], [112.4, 34.62]];

// The two boys answer Dong Zhuo: this is why he will swap emperors in the next episode.
const TestCard = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.test.start} to={B.cliff.start + 10}>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ตั๋งโต๊ะลองถามเด็กสองคน</div>
      <div style={{ fontSize: 30 * s, lineHeight: 1.6 }}>
        ฮ่องเต้ วัย 14 · <b>ร้องไห้ พูดไม่เป็นคำ</b>
        <br />
        น้องชาย วัย 8 · <b style={{ color: C.shu }}>ตอบได้ฉะฉาน</b>
      </div>
    </SideCard>
  );
};

const WhyCard = () => {
  const { s } = useUnit();
  return (
    <SideCard from={at("cliff", 0.35)} to={B.cliff.end + 6} tilt={2} width={480}>
      <div style={{ fontFamily: fonts.title, fontSize: 46 * s, lineHeight: 1.35, textAlign: "center" }}>ฮ่องเต้องค์ใหม่?</div>
      <div style={{ fontSize: 28 * s, lineHeight: 1.5, textAlign: "center", opacity: 0.8 }}>ตั๋งโต๊ะคิดอะไรอยู่</div>
      <Seal text="?" at={at("cliff", 0.6)} />
    </SideCard>
  );
};

export const Ep = ({ variant }: { variant: Variant }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fit = (f: Parameters<typeof camForFeature>[0], pad = 0.06) => camForFeature(f, width, height, pad);
  const cam = camAt(
    [
      { frame: 0, cam: { ...fit(CITY), scale: fit(CITY).scale * 1.2 } },
      { frame: B.hejin.end, cam: fit(CITY) },
      { frame: B.summon.start + 30, cam: fit(REALM) },
      { frame: B.summon.end + 10, cam: fit(REALM) },
      { frame: B.caolaugh.start + 30, cam: fit(CITY) },
    ],
    frame,
  );
  const blood = (f: number) =>
    0.35 * fade(f, B.zhangrang.start, B.zhangrang.start + 10, B.massacre.end - 10, B.massacre.end + 10) + 0.25 * fade(f, 0, 6, at("hookq", 0.8), B.hookq.end);
  const summonOut = 1 - fade(frame, B.caolaugh.start, B.caolaugh.start + 20);
  const dead = Math.round(interpolate(frame, [at("massacre", 0.45), at("massacre", 0.9)], [0, 2000], clamp));

  return (
    <EpisodeFrame
      layout="v2"
      ep={EP}
      beats={BEATS}
      variant={variant}
      sounds={
        <>
          <Sfx src={SFX.hit} at={0} volume={0.5} />
          <Sfx src={SFX.whoosh} at={B.summon.start} />
          <Sfx src={SFX.whoosh} at={B.caolaugh.start} />
          <Sfx src={SFX.hit} at={B.zhangrang.end} volume={0.5} />
          {Array.from({ length: 8 }, (_, i) => (
            <Sfx key={i} src={SFX.tick} at={at("massacre", 0.45) + i * 5} volume={0.25} />
          ))}
          <Sfx src={SFX.riser} at={at("meet", 0.2)} volume={0.25} />
          <Sfx src={SFX.hit} at={at("meet", 0.75)} volume={0.45} />
          <Sfx src={SFX.pop} at={B.test.start + 6} volume={0.3} />
          <Sfx src={SFX.hit} at={at("cliff", 0.6)} volume={0.4} />
        </>
      }
      map={
        <SankokMap cam={cam}>
          <PaperMap />
          <InkLabel at={LY} text="ลกเอี๋ยง" start={0} end={B.summon.start + 10} dy={60} size={1.3} />
          <Flames points={PALACE} start={0} stagger={4} outAt={B.hook.end} />
          <Badge at={[LY[0] - 0.2, LY[1] + 0.1]} name="โฮจิ๋น" sub="แม่ทัพใหญ่" color={C.han} start={B.hejin.start + 10} end={at("massacre", 0.15)} />
          <Arrow points={[[104.5, 35.8], [108, 34.9], [111.5, 34.7], LY]} start={B.summon.start + 25} end={B.summon.end} color={C.dong} width={20} opacity={summonOut} />
          <Arrow points={[[112.5, 37.9], [112.6, 36.2], LY]} start={B.summon.start + 35} end={B.summon.end + 5} color={C.han} width={16} opacity={summonOut} />
          <Arrow points={[[117.2, 36.0], [114.8, 35.2], LY]} start={B.summon.start + 45} end={B.summon.end + 10} color={C.yuan} width={14} opacity={summonOut} />
          <Badge at={[LY[0] + 0.2, LY[1] - 0.14]} name="โจโฉ" color={C.wei} start={B.caolaugh.start + 20} end={B.trap.start + 10} above={false} />
          <Badge at={[LY[0] + 0.2, LY[1] + 0.1]} name="เตียวเหยียง" sub="หัวหน้าขันที" color={C.dong} start={B.trap.start + 10} end={B.river.end} />
          <Flames points={PALACE} start={at("massacre", 0.3)} stagger={5} outAt={B.river.start + 20} size={1.2} />
          <Badge at={[LY[0] - 0.2, LY[1] - 0.14]} name="อ้วนเสี้ยว" color={C.yuan} start={at("massacre", 0.25)} end={B.river.start + 10} above={false} />
          <Arrow points={[LY, [112.55, 34.8], RIVER]} start={B.river.start + 10} end={at("river", 0.7)} color={C.han} width={12} variant="dashed" />
          <InkLabel at={RIVER} text="แม่น้ำหวงโห" start={at("river", 0.5)} dy={-30} dot={false} color={C.river} size={1.1} />
          <Arrow points={[[111.75, 34.75], [112.15, 34.8], BEIMANG]} start={at("meet", 0.4)} end={at("meet", 0.95)} color={C.dong} width={22} />
          <Badge at={BEIMANG} name="ตั๋งโต๊ะ" color={C.dong} start={at("meet", 0.75)} />
          <Insets {...TL} />
        </SankokMap>
      }
      overlay={
        <>
          <PortraitCard who="caocao" from={B.cao.start} to={B.cao.end + 6} />
          <PortraitCard who="zhangrang" from={B.zhangrang.start} to={B.zhangrang.end + 6} />
          <Tint color="#b0302a" opacity={blood} />
          <TitleCard kicker="สามก๊ก · ตอนที่ 4" lines={["ใครไม่มีหนวด", "ถูกฆ่าทั้งวัง"]} from={0} to={B.hookq.end} />
          <CharacterCard who="hejin" from={B.hejin.start + 6} to={B.summon.start + 10} />
          <CharacterCard who="zhangrang" from={B.trap.start + 10} to={B.zhangrang.start + 10} />
          <StatCard label="ขันทีที่ถูกฆ่า" value={`${dead.toLocaleString("th-TH")}${dead >= 2000 ? "+" : ""}`} sub="ภายในคืนเดียว · โฮ่วฮั่นซู" from={at("massacre", 0.4)} to={B.river.start + 10} color={C.wu} />
          <CharacterCard who="dongzhuo" from={at("meet", 0.7)} to={B.test.start} />
          <TestCard />
          <WhyCard />
        </>
      }
    />
  );
};
