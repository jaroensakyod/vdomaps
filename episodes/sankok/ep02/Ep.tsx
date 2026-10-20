import { useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { camAt, camForFeature } from "../../../components/camera";
import { MapFrame } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { NovelStamp, Seal, SideCard, TitleCard } from "../kit/Cards";
import { EpisodeFrame, timeline, type EpisodeMeta, type Variant } from "../kit/Frame";
import { Blossom } from "../kit/Marks";
import { at as place } from "../kit/places";
import { Badge, C, fade, InkLabel, PaperMap, useUnit } from "../kit/theme";
import beatsText from "./beats.json";
import timing from "./timing.json";

// ตอนที่ 2 · สวนท้อที่ไม่มีอยู่จริง (ค.ศ. 184)
export const EP: EpisodeMeta = { n: 2, title: "สวนท้อที่ไม่มีอยู่จริง", next: "ผู้นำกบฏตายเพราะโรค", nextQ: ["ผู้นำกบฏหลายแสนคน", "ไม่ได้ตายในสนามรบ?"], ask: "เล่าปี่เฆี่ยนขุนนาง ทำถูกหรือผิด?" };
export const BEATS = buildBeats(timing, beatsText);
const { B, at } = timeline(BEATS);
export const THUMB = at("twist", 0.8); // thumbnail frame

const ZHUO_AT = place("zhuo");
const ANXI: [number, number] = [115.0, 38.52]; // 安喜 county, approximate
const ZHUO = bbox([[114.6, 38.6], [117.4, 40.3]]);
const ROUTE = bbox([[113.6, 37.9], [117.4, 40.2]]);
const SOUTH = bbox([[112.5, 36.2], [117.5, 40.2]]);

const Inspector = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.inspector.start} to={B.reason.start + 4}>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ขุนนางตรวจราชการ 督郵</div>
      <div style={{ fontSize: 30 * s, lineHeight: 1.55 }}>มาถึงอำเภอ · เล่าปี่ขอพบ · ถูกไล่กลับ</div>
    </SideCard>
  );
};

// Mid-episode re-hook (Dianlue): the inspector came to dismiss men who got posts from the war.
const Dismissal = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.reason.start} to={B.novel2.start + 4} tilt={2}>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>คำสั่งราชสำนัก</div>
      <div style={{ fontSize: 30 * s, lineHeight: 1.55 }}>ปลดผู้ที่ได้ตำแหน่งจากการรบ</div>
      <div style={{ fontSize: 30 * s, lineHeight: 1.55, marginTop: 6 * s }}>
        รายชื่อ: …{" "}
        <span style={{ border: `${3 * s}px solid ${C.wu}`, borderRadius: 999, padding: `0 ${10 * s}px` }}>เล่าปี่</span> …
      </div>
      <Seal text="詔" at={B.reason.start + 18} />
    </SideCard>
  );
};

export const Ep = ({ variant }: { variant: Variant }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fit = (f: Parameters<typeof camForFeature>[0], pad = 0.06) => camForFeature(f, width, height, pad);
  const cam = camAt(
    [
      { frame: 0, cam: { ...fit(ZHUO), scale: fit(ZHUO).scale * 1.25 } },
      { frame: B.record.end, cam: fit(ZHUO) },
      { frame: B.war.start + 30, cam: fit(ROUTE) },
      { frame: B.flee.end, cam: fit(ROUTE) },
      { frame: B.cliff.start + 35, cam: fit(SOUTH) },
    ],
    frame,
  );
  const three = (dx: number, dy: number): [number, number] => {
    const k = fade(frame, B.war.start + 10, B.war.end);
    return [ZHUO_AT[0] + (ANXI[0] - ZHUO_AT[0]) * k + dx, ZHUO_AT[1] + (ANXI[1] - ZHUO_AT[1]) * k + dy];
  };
  const gone = fade(frame, at("flee", 0.5), B.flee.end);

  return (
    <EpisodeFrame
      ep={EP}
      beats={BEATS}
      variant={variant}
      sounds={
        <>
          <Sfx src={SFX.swell} at={0} volume={0.25} />
          <Sfx src={SFX.hit} at={B.novel.start} volume={0.5} />
          <Sfx src={SFX.whoosh} at={B.war.start} />
          <Sfx src={SFX.pop} at={B.inspector.start} volume={0.3} />
          <Sfx src={SFX.hit} at={B.reason.start + 18} volume={0.4} />
          <Sfx src={SFX.hit} at={B.novel2.start} volume={0.45} />
          <Sfx src={SFX.hit} at={at("twist", 0.3)} volume={0.5} />
          <Sfx src={SFX.whoosh} at={B.cliff.start} />
        </>
      }
      map={
        <MapFrame cam={cam}>
          <PaperMap />
          <Blossom at={[ZHUO_AT[0], ZHUO_AT[1] + 0.12]} start={0} end={B.war.start + 10} />
          <InkLabel at={ZHUO_AT} text="โต๊ะกุ๋น · โดยประมาณ" start={0} end={B.war.start + 20} dy={48} />
          <Arrow points={[ZHUO_AT, [115.6, 39.0], ANXI]} start={B.war.start + 10} end={B.war.end} color={C.shu} width={16} opacity={1 - gone} />
          <InkLabel at={[ANXI[0] + 1.25, ANXI[1] + 0.12]} text="อันฮี · โดยประมาณ" start={at("war", 0.7)} end={B.cliff.start + 20} dot={false} />
          <g opacity={1 - gone}>
            <Badge at={three(0, 0)} name="เล่าปี่" color={C.shu} start={0} />
            <Badge at={three(0.62, -0.24)} name="เตียวหุย" color={C.shu} start={6} above={false} />
            <Badge at={three(-0.62, -0.24)} name="กวนอู" color={C.shu} start={12} above={false} />
          </g>
          <Arrow points={[ANXI, [114.5, 38.75], [114.0, 39.1]]} start={at("flee", 0.4)} end={B.flee.end} color={C.shu} width={14} variant="dashed" opacity={1 - fade(frame, B.cliff.start, B.cliff.start + 20)} />
          <InkLabel at={place("julu")} text="เตียวก๊ก · กิลก" start={B.cliff.start + 30} color={C.yellow} size={1.2} />
        </MapFrame>
      }
      overlay={
        <>
          <NovelStamp
            at={B.novel.start}
            end={B.war.start + 6}
            rows={[
              { label: "ในนิยาย", text: "สาบานเป็นพี่น้องในสวนท้อ", color: C.shu, at: B.record.start, source: "นิยายสามก๊ก ตอนที่ 1" },
              { label: "ตามบันทึก", text: "นอนเตียงเดียวกัน รักกันเหมือนพี่น้อง", color: C.wu, at: at("record", 0.35), source: "จดหมายเหตุสามก๊ก · ภาคกวนอู" },
            ]}
          />
          <TitleCard kicker="สามก๊ก · ตอนที่ 2" lines={["คนใจดีที่สุดในสามก๊ก", "เฆี่ยนขุนนาง 200 ที?"]} from={4} to={B.hook.end} />
          <Inspector />
          <Dismissal />
          <NovelStamp
            at={B.novel2.start}
            end={at("flee", 0.6)}
            rows={[
              { label: "ในนิยาย", text: "เตียวหุยเฆี่ยนจนกิ่งหลิวหัก", color: C.shu, at: at("novel2", 0.4), source: "นิยายสามก๊ก ตอนที่ 2" },
              { label: "ตามบันทึก", text: <b>เล่าปี่เฆี่ยนเอง 200 ที</b>, color: C.wu, at: at("twist", 0.35), source: "จดหมายเหตุสามก๊ก · ภาคเล่าปี่" },
            ]}
          />
        </>
      }
    />
  );
};
