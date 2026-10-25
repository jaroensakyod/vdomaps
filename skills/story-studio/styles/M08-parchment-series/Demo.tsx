import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { camAt } from "../../components/camera";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { CharacterCard, NovelStamp, TitleCard } from "./kit/Cards";
import { SeriesFrame, SeriesMap, type EpisodeMeta, type Line, type Series } from "./kit/Frame";
import { Flags } from "./kit/Marks";
import { Badge, C, fade, fonts, InkLabel, PaperMap } from "./kit/Parchment";
import { Shots, type Shot } from "./kit/Shots";
import { tab } from "./kit/Tableau";

// M08 parchment series kit: one 18 s slice of "episode 7 of 60" — hook title card over the map, the allied
// camps' flags, leader badges, a character card with a code-drawn bust, a speaker line with its name tag, a new
// illustration panel every 3–4 s, the "ในนิยาย" twist stamp, and the next-episode card with its hook question.
export const demo: StyleDemo = { id: "M08", name: "แผนที่กระดาษ ซีรีส์ยาว", frames: 540, cover: 250, sizes: ["9x16", "16x9"] };

const SERIES: Series = { name: "สามก๊กบนแผนที่", seal: "三國圖", total: 60, show: "สามก๊ก" };
const EP: EpisodeMeta = { n: 7, title: "สิบแปดหัวเมือง", next: "เผาลั่วหยาง", nextQ: ["ตั๋งโต๊ะเผาเมืองหลวงทิ้ง", "แล้วตราหยกหายไปไหน?"], ask: "ทีมไหนน่าจะชนะ?" };

const P = {
  luoyang: [112.45, 34.62] as [number, number],
  hulao: [113.2, 34.83] as [number, number],
  suanzao: [114.45, 35.2] as [number, number],
  henei: [113.1, 35.15] as [number, number],
  nanyang: [112.53, 33.0] as [number, number],
  chenliu: [114.8, 34.8] as [number, number],
};

const LINES: Line[] = [
  { text: "ปี ค.ศ. 190 หัวเมืองสิบแปดแห่ง ยกทัพมาพร้อมกัน", start: 0, len: 80 },
  { text: "เป้าหมายเดียว คือล้มตั๋งโต๊ะ ที่ยึดเมืองหลวงไว้", start: 84, len: 106 },
  { text: "ใครขวางข้า ข้าจะเผาให้หมด", start: 194, len: 96, speaker: "dongzhuo" },
  { text: "นิยายบอกว่า กวนอูฆ่าฮัวหยง ขณะเหล้ายังอุ่น", start: 294, len: 106 },
  { text: "แต่ในบันทึกจริง คนฆ่าคือซุนเกี๋ยน", start: 404, len: 66 },
];

const SHOTS: Shot[] = [
  { id: "camp", at: 84, anchor: P.suanzao, ...tab("camp", [{ who: "soldier", x: 0.18, hold: "flag", flag: { text: "袁", color: C.yuan } }, { who: "yuanshao", x: 0.4, hold: "point" }, { who: "soldier", x: 0.62, hold: "spear", walk: 0.4 }, { who: "soldier", x: 0.8, hold: "spear", walk: 0.4 }], "สิบแปดหัวเมือง") },
  { id: "throne", at: 194, anchor: P.luoyang, ...tab("throne", [{ who: "soldier", x: 0.18, hold: "halberd" }, { who: "dongzhuo", x: 0.5, pose: "laugh", hold: "cup" }, { who: "soldier", x: 0.82, hold: "halberd", flip: true }]) },
  { id: "gate", at: 294, anchor: P.hulao, until: 470, ...tab("city", [{ who: "huaxiong", x: 0.72, hold: "halberd", flip: true, ride: true }, { who: "sunjian", x: 0.2, hold: "sword", ride: true, walk: 0.9 }]) },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const cam = camAt(
    [
      { frame: 0, cam: { lon: 112.5, lat: 33.2, scale: 2600 } },
      { frame: 90, cam: { lon: 113.4, lat: 34.3, scale: 5200 }, easing: Easing.inOut(Easing.cubic) },
      { frame: 540, cam: { lon: 113.2, lat: 34.5, scale: 5800 } },
    ],
    frame,
  );
  return (
    <AbsoluteFill>
      <SeriesFrame
        series={SERIES}
        ep={EP}
        lines={LINES}
        variant="fb"
        sounds={
          <>
            <Sfx src={SFX.hit} at={0} volume={0.5} />
            <Hit id="war_drums" at={2} volume={0.35} />
            <Bed id="army_march_crowd" from={84} to={194} volume={0.12} />
            <Sfx src={SFX.pop} at={100} volume={0.3} />
            <Hit id="sword_draw" at={196} volume={0.3} />
            <Hit id="gong" at={300} volume={0.35} />
            <Hit id="horse_gallop" at={300} volume={0.2} />
            <Sfx src={SFX.swell} at={474} volume={0.35} />
          </>
        }
        map={
          <SeriesMap cam={cam}>
            <PaperMap />
            <Flags start={12} stagger={4} items={[P.suanzao, P.henei, P.nanyang, P.chenliu, [115.6, 35.6], [116.4, 34.4], [114.0, 33.6]].map((at) => ({ at: at as [number, number], color: C.yuan }))} />
            <InkLabel at={P.hulao} text="ด่านเฮาโลก๋วน" start={280} dy={40} />
            <Badge at={P.luoyang} name="ตั๋งโต๊ะ" color={C.dong} start={96} />
            <Badge at={P.suanzao} name="อ้วนเสี้ยว" sub="แม่ทัพพันธมิตร" color={C.yuan} start={110} end={192} />
            <Shots items={SHOTS} />
          </SeriesMap>
        }
        overlay={
          <>
            <TitleCard kicker={`${SERIES.show} · ตอนที่ ${EP.n}`} lines={["สิบแปดหัวเมือง", "ล้มตั๋งโต๊ะได้ไหม?"]} from={0} to={86} />
            <CharacterCard who="dongzhuo" from={194} to={292} />
            <NovelStamp
              at={300}
              end={472}
              rows={[
                { label: "ในนิยาย", text: "กวนอูฆ่าฮัวหยง เหล้ายังอุ่น", color: C.wu, at: 336, source: "สามก๊ก ฉบับเจ้าพระยาพระคลัง (หน)" },
                { label: "บันทึก", text: "ซุนเกี๋ยนเป็นคนฆ่าฮัวหยง", color: C.wei, at: 410, source: "จดหมายเหตุสามก๊ก · ภาคซุนเกี๋ยน" },
              ]}
            />
          </>
        }
      />
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", fontFamily: fonts.body, fontSize: 40, fontWeight: 700, color: C.ink, opacity: 0.85 * fade(frame, 6, 24) * interpolate(frame, [470, 480], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), WebkitTextStroke: `6px ${C.land}`, paintOrder: "stroke fill" }}>
        M08 · แผนที่กระดาษ ซีรีส์ยาว
      </div>
    </AbsoluteFill>
  );
};
