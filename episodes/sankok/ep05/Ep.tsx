import { useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { camAt, camForFeature } from "../../../components/camera";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { CharacterCard, NovelStamp, PortraitCard, SideCard, StatCard, TitleCard } from "../kit/Cards";
import { SankokMap } from "../kit/Layout";
import { EpisodeFrame, timeline, type EpisodeMeta, type Variant } from "../kit/Frame";
import { Tint } from "../kit/Marks";
import { at as place } from "../kit/places";
import { Badge, C, fade, fonts, InkLabel, PaperMap, useUnit } from "../kit/theme";
import beatsText from "./beats.json";
import timing from "./timing.json";
import { Insets } from "./Insets";

// ตอนที่ 5 · ทหารสามพันยึดเมืองหลวง (ค.ศ. 189)
export const EP: EpisodeMeta = { n: 5, title: "ทหารสามพันยึดเมืองหลวง", next: "ดาบเจ็ดดาว", nextQ: ["ดาบเล่มเดียว", "ฆ่าตั๋งโต๊ะได้ไหม?"], ask: "ถ้าเป็นลิโป้ จะทรยศเต๊งหงวนไหม?" };
export const BEATS = buildBeats(timing, beatsText);
const TL = timeline(BEATS);
const { B, at } = TL;
export const THUMB = at("trick", 0.4); // thumbnail frame

const LY = place("luoyang");
const AREA = bbox([[111.6, 34.25], [113.3, 35.0]]);
const OUTSIDE: [number, number] = [111.9, 34.72];

// Three nights inside the "trick" beat: troops leave in the dark, march back in at dawn.
const cycles = () => {
  const { start, len } = B.trick;
  return [0, 1, 2].map((i) => {
    const a = start + Math.round((len * i) / 3);
    const w = Math.round(len / 3);
    return { night: a, dawn: a + Math.round(w * 0.5), next: a + w };
  });
};

// Dong Zhuo's privileges at court (劍履上殿, 入朝不趨).
const Power = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.power.start} to={B.cliff.start + 6}>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color: C.dong, lineHeight: 1.5 }}>สิทธิ์ของตั๋งโต๊ะ</div>
      <div style={{ fontSize: 30 * s, lineHeight: 1.6 }}>
        ใส่รองเท้าเข้าท้องพระโรง
        <br />
        พกดาบเข้าเฝ้า
        <br />
        ไม่ต้องก้มรีบเดินอย่างขุนนาง
      </div>
    </SideCard>
  );
};

const Sword = () => {
  const { s } = useUnit();
  return (
    <SideCard from={at("cliff", 0.45)} to={B.cliff.end + 6} tilt={3} width={460}>
      <div style={{ fontFamily: fonts.title, fontSize: 48 * s, lineHeight: 1.35, textAlign: "center" }}>ดาบเล่มเดียว</div>
      <div style={{ fontSize: 28 * s, lineHeight: 1.5, textAlign: "center", opacity: 0.8 }}>จะพอฆ่าตั๋งโต๊ะไหม?</div>
    </SideCard>
  );
};

export const Ep = ({ variant }: { variant: Variant }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fit = (f: Parameters<typeof camForFeature>[0], pad = 0.06) => camForFeature(f, width, height, pad);
  const cam = camAt([{ frame: 0, cam: { ...fit(AREA), scale: fit(AREA).scale * 0.85 } }, { frame: B.hook.end, cam: fit(AREA) }], frame);
  const cyc = cycles();
  const night = (f: number) => Math.max(0, ...cyc.map((c) => 0.55 * fade(f, c.night, c.night + 8, c.dawn - 4, c.dawn + 6)));
  const seen = cyc.filter((c) => frame >= c.dawn).length;
  const dark = (f: number) => 0.3 * fade(f, B.dong.start, B.dong.start + 10, B.dong.end, B.dong.end + 12);
  const dingGone = fade(frame, at("betray", 0.25), at("betray", 0.45));
  const lvbuDong = fade(frame, at("betray", 0.5), at("betray", 0.7));

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
          {cyc.map((c) => (
            <Sfx key={c.dawn} src={SFX.hit} at={c.dawn} volume={0.3} />
          ))}
          <Sfx src={SFX.pop} at={B.fear.start + 10} volume={0.3} />
          <Sfx src={SFX.pop} at={B.lvbu.start + 10} volume={0.3} />
          <Sfx src={SFX.hit} at={B.horse.start} volume={0.45} />
          <Sfx src={SFX.hit} at={at("betray", 0.3)} volume={0.5} />
          <Sfx src={SFX.riser} at={B.dong.start - 20} volume={0.2} />
          <Sfx src={SFX.pop} at={B.puppet.start + 10} volume={0.3} />
          <Sfx src={SFX.hit} at={at("cliff", 0.45)} volume={0.4} />
        </>
      }
      map={
        <SankokMap cam={cam}>
          <PaperMap />
          <InkLabel at={LY} text="ลกเอี๋ยง" start={0} dy={60} size={1.3} />
          {cyc.map((c) => (
            <g key={c.night}>
              <Arrow points={[LY, [112.15, 34.68], OUTSIDE]} start={c.night + 4} end={c.dawn - 4} color={C.dong} width={14} variant="dashed" opacity={1 - fade(frame, c.dawn, c.dawn + 6)} />
              <Arrow points={[OUTSIDE, [112.15, 34.62], LY]} start={c.dawn} end={c.next - 4} color={C.dong} width={22} opacity={1 - fade(frame, c.next - 2, c.next + 6)} />
            </g>
          ))}
          <Badge at={[LY[0] - 0.25, LY[1] + 0.12]} name="ตั๋งโต๊ะ" sub="ทหาร 3,000" color={C.dong} start={8} />
          <g opacity={1 - dingGone}>
            <Badge at={[LY[0] + 0.25, LY[1] + 0.12]} name="เต๊งหงวน" color={C.han} start={at("fear", 0.6)} />
          </g>
          <g opacity={1 - lvbuDong}>
            <Badge at={[LY[0] + 0.25, LY[1] - 0.14]} name="ลิโป้" color={C.lvbu} start={B.lvbu.start + 10} above={false} />
          </g>
          <g opacity={lvbuDong}>
            <Badge at={[LY[0] + 0.25, LY[1] - 0.14]} name="ลิโป้" sub="ฝ่ายตั๋งโต๊ะ" color={C.dong} start={at("betray", 0.5)} above={false} />
          </g>
          <Badge at={[LY[0] - 0.25, LY[1] - 0.14]} name="โจโฉ" color={C.wei} start={at("cliff", 0.25)} above={false} />
          <Insets {...TL} />
        </SankokMap>
      }
      overlay={
        <>
          <PortraitCard who="dongzhuo" from={B.dong.start} to={B.dong.end + 6} />
          <Tint color="#1d2340" opacity={night} />
          <Tint color="#3a1d3c" opacity={dark} />
          <TitleCard kicker="สามก๊ก · ตอนที่ 5" lines={["ทหารแค่ 3,000", "ยึดทั้งเมืองหลวง"]} from={0} to={B.hookq.end} />
          <CharacterCard who="dongzhuo" from={-6} to={B.hookq.end + 4} role="มีทหารแค่ 3,000 คน" />
          <StatCard label="ทัพที่คนในเมืองเห็น" value={seen === 0 ? "3,000" : `${(3000 * (seen + 1)).toLocaleString("th-TH")}${seen === 3 ? "+" : ""}`} sub={seen === 0 ? "ทหารจริงของตั๋งโต๊ะ" : `วันที่ ${seen} · ทหารจริงยังเท่าเดิม`} from={B.trick.start} to={B.fear.start + 10} color={C.dong} />
          <CharacterCard who="dingyuan" from={at("fear", 0.6)} to={B.lvbu.start} />
          <CharacterCard who="lvbu" from={B.lvbu.start + 10} to={B.horse.start} />
          <NovelStamp
            at={B.horse.start}
            end={B.dong.start}
            rows={[
              { label: "ในนิยาย", text: "ซื้อลิโป้ด้วยม้าเซ็กเธาว์", color: C.shu, at: at("horse", 0.45), source: "นิยายสามก๊ก ตอนที่ 3" },
              { label: "ตามบันทึก", text: "ตั๋งโต๊ะยุให้ลิโป้ฆ่าเต๊งหงวนจริง", color: C.wu, at: B.betray.start + 10, source: "จดหมายเหตุสามก๊ก · ภาคลิโป้" },
            ]}
          />
          <CharacterCard who="emperor" from={B.puppet.start + 10} to={B.power.start} role="ฮ่องเต้วัย 8 ขวบ" />
          <Power />
          <Sword />
        </>
      }
    />
  );
};
