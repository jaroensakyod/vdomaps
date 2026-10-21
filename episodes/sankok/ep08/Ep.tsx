import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { camAt, camForFeature } from "../../../components/camera";
import { MapFrame } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { CharacterCard, PortraitCard, Seal, SideCard, StatCard, TitleCard } from "../kit/Cards";
import { EpisodeFrame, timeline, type EpisodeMeta, type Variant } from "../kit/Frame";
import { Flames, Tint } from "../kit/Marks";
import { at as place } from "../kit/places";
import { Badge, C, clamp, fade, fonts, InkLabel, PaperMap, useUnit } from "../kit/theme";
import beatsText from "./beats.json";
import meta from "./meta.json";
import timing from "./timing.json";
import { Insets } from "./Insets";

// ตอนที่ 8 · เผาเมืองหลวง (ค.ศ. 190–191)
export const EP: EpisodeMeta = { n: 8, title: meta.chapter, next: meta.next, nextQ: meta.nextQ as [string, string], ask: meta.ask };
export const BEATS = buildBeats(timing, beatsText);
const TL = timeline(BEATS);
const { B, at } = TL;
export const THUMB = at("burn", 0.5); // thumbnail frame

const LY = place("luoyang");
const CA = place("changan");
const CITY = bbox([[111.9, 34.3], [113.0, 35.0]]);
const ROUTE = bbox([[108.3, 33.6], [113.2, 35.4]]);
const SOUTH = bbox([[110.5, 27.5], [115.5, 35.2]]);
const BLAZE: [number, number][] = [LY, [112.52, 34.68], [112.38, 34.66], [112.5, 34.56], [112.4, 34.58], [112.58, 34.62]];

const SealCard = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.seal.start} to={B.doubt.start + 6} tilt={2}>
      <div style={{ fontSize: 26 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ตราหยกประจำแผ่นดิน</div>
      <div style={{ fontFamily: "'Microsoft YaHei', 'SimSun', serif", fontSize: 44 * s, lineHeight: 1.35 }}>受命於天 既壽永昌</div>
      <div style={{ fontSize: 26 * s, lineHeight: 1.55 }}>"รับอาณัติจากฟ้า ขอให้ยืนยาวรุ่งเรือง" · ใช้ประทับราชโองการทุกฉบับ</div>
      <Seal text="傳國璽" at={B.seal.start + 12} />
    </SideCard>
  );
};

const Doubt = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.doubt.start} to={B.cliff.start + 6} tilt={-2}>
      <div style={{ fontSize: 26 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ข้อสงสัย</div>
      <div style={{ fontSize: 30 * s, lineHeight: 1.55 }}>เรื่องตราหยกในบ่อน้ำ อาจถูกแต่งขึ้นเพื่อยกย่องตระกูลซุน</div>
      <div style={{ fontSize: 22 * s, lineHeight: 1.5, opacity: 0.75 }}>ผู้อธิบายจดหมายเหตุสามก๊กรุ่นหลัง ก็ตั้งข้อสงสัยไว้</div>
    </SideCard>
  );
};

const Who = () => {
  const { s } = useUnit();
  return (
    <SideCard from={at("cliff", 0.5)} to={B.cliff.end + 6} tilt={2} width={480}>
      <div style={{ fontFamily: fonts.title, fontSize: 48 * s, lineHeight: 1.35, textAlign: "center" }}>ลูกธนูดอกเดียว</div>
      <div style={{ fontSize: 28 * s, lineHeight: 1.5, textAlign: "center", opacity: 0.8 }}>ใครเป็นคนยิง?</div>
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
      { frame: B.why.start, cam: fit(CITY) },
      { frame: B.why.start + 30, cam: fit(ROUTE) },
      { frame: B.why.end, cam: fit(ROUTE) },
      { frame: B.burn.start + 20, cam: fit(CITY) },
      { frame: B.march.start, cam: fit(CITY) },
      { frame: B.march.start + 30, cam: fit(ROUTE) },
      { frame: B.tombs.end, cam: fit(ROUTE) },
      { frame: B.sunjian.start + 25, cam: fit(CITY) },
      { frame: B.cliff.start, cam: fit(CITY) },
      { frame: B.cliff.start + 35, cam: fit(SOUTH) },
    ],
    frame,
  );
  const fire = (f: number) => 0.3 * fade(f, 0, 6, B.hookq.end, B.hookq.end + 10) + 0.35 * fade(f, B.burn.start, B.burn.start + 10, B.dong.end, B.dong.end + 12);
  const km = Math.round(interpolate(frame, [B.march.start + 10, B.march.end - 10], [0, 300], clamp));

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
          <Sfx src={SFX.whoosh} at={B.why.start + 20} />
          <Sfx src={SFX.hit} at={B.burn.start + 6} volume={0.5} />
          <Sfx src={SFX.whoosh} at={B.march.start + 20} />
          <Sfx src={SFX.pop} at={B.tombs.start + 8} volume={0.3} />
          <Sfx src={SFX.whoosh} at={B.sunjian.start} />
          <Sfx src={SFX.riser} at={B.well.start} volume={0.2} />
          <Sfx src={SFX.hit} at={B.seal.start + 12} volume={0.45} />
          <Sfx src={SFX.hit} at={at("cliff", 0.5)} volume={0.4} />
        </>
      }
      map={
        <MapFrame cam={cam}>
          <PaperMap />
          <Flames points={BLAZE} start={-12} stagger={2} outAt={B.march.start + 20} size={1.2} />
          <InkLabel at={LY} text="ลกเอี๋ยง" start={0} dy={60} size={1.3} />
          <InkLabel at={CA} text="เตียงอัน" start={at("why", 0.3)} dy={60} size={1.3} />
          <Arrow points={[LY, [110.8, 34.7], CA]} start={at("why", 0.3)} end={B.why.end} color={C.dong} width={18} opacity={1 - fade(frame, B.sunjian.start, B.sunjian.start + 15)} />
          <Arrow points={[LY, [110.6, 34.55], CA]} start={B.march.start + 10} end={B.march.end} color="#6b5a44" width={30} variant="dashed" opacity={1 - fade(frame, B.sunjian.start, B.sunjian.start + 15)} />
          <Badge at={[LY[0] - 0.25, LY[1] + 0.14]} name="ตั๋งโต๊ะ" color={C.dong} start={B.hookq.start} end={B.march.start + 10} />
          <Badge at={[LY[0] + 0.25, LY[1] - 0.14]} name="ลิโป้" sub="ขุดสุสานฮ่องเต้" color={C.lvbu} start={B.tombs.start + 8} end={B.sunjian.start + 10} above={false} />
          <Arrow points={[[112.8, 33.9], [112.6, 34.3], LY]} start={B.sunjian.start} end={B.sunjian.end} color={C.wu} width={20} opacity={1 - fade(frame, B.seal.start, B.seal.start + 15)} />
          <Badge at={[LY[0] + 0.22, LY[1] + 0.14]} name="ซุนเกี๋ยน" color={C.wu} start={at("sunjian", 0.5)} />
          <Arrow points={[LY, [112.6, 33.0], place("nanyang")]} start={at("cliff", 0.15)} end={at("cliff", 0.5)} color={C.wu} width={18} variant="dashed" />
          <Insets {...TL} />
        </MapFrame>
      }
      overlay={
        <>
          <Tint color="#b0401a" opacity={fire} />
          <TitleCard kicker="สามก๊ก · ตอนที่ 8" lines={["ตั๋งโต๊ะเผาเมืองหลวง", "ของตัวเอง"]} from={0} to={B.hookq.end} />
          <StatCard label="ย้ายเมืองหลวง" value="ลกเอี๋ยง → เตียงอัน" sub="ค.ศ. 190 · มีภูเขาล้อม ป้องกันง่ายกว่า" from={at("why", 0.35)} to={B.burn.start + 6} color={C.dong} />
          <PortraitCard who="dongzhuo" from={B.dong.start} to={B.dong.end + 6} />
          <StatCard label="ราษฎรถูกต้อนเดิน" value={`${km} กม.`} sub="ลกเอี๋ยง → เตียงอัน · ราว 300 กม." from={B.march.start + 6} to={B.tombs.start + 6} color="#6b5a44" />
          <CharacterCard who="sunjian" from={at("sunjian", 0.3)} to={B.well.start} />
          <SealCard />
          <Doubt />
          <Who />
        </>
      }
    />
  );
};
