import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { camAt } from "../../components/camera";
import { MapFrame } from "../../components/Map";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { ArmyBand, ArmyCounter, type ArmyPt } from "./kit/Army";
import { ADVANCE, CITY, FAR_A, FAR_R, NORTH_A, NORTH_R, RETREAT } from "./kit/data1812";
import { Burning, C, Cartouche, clamp, EngravedLand, fade, Figure, fitBox, focusOf, font, headAt, Legend, lonAt, Neatline, PlateCaption, Sheet, TintPanel, Snow, TempGraph, Town, usePlate, type Head } from "./kit/Plate";

// M06 engraved plate: Napoleon's 1812 march on Moscow and the retreat, told with Minard's own numbers on an ivory
// copperplate sheet. A flat tan band as wide as the army marches east and thins; Moscow burns in engraved rays; a
// black band crawls back west while the engraved temperature graph below draws with it and snow falls. 18 s.
export const demo: StyleDemo = { id: "M06", name: "แผ่นภาพแกะทองแดง", frames: 540, cover: 452, sizes: ["9x16", "16x9"] };

const ADV: [number, number][] = [[30, 24], [60, 25.2], [120, 28.5], [160, 30.3], [200, 32], [240, 35.6], [270, 37.6]];
const RET: [number, number][] = [[320, 37.7], [360, 35.4], [400, 32.6], [440, 30.4], [470, 28.6], [500, 26.4], [525, 24.1]];
const ROUTE: [number, number, number, number] = [23.2, 53.6, 39.3, 56.3];

const HEADS: Head[] = [
  { f: 10, tag: "มิถุนายน ค.ศ. 1812", head: "นโปเลียนข้ามแม่น้ำเนมัน", stat: "422,000", label: "นาย" },
  { f: 270, tag: "กันยายน ค.ศ. 1812", head: "ถึงมอสโก แต่เมืองถูกเผา", stat: "100,000", label: "นายที่เหลือ", color: C.red },
  { f: 330, tag: "ตุลาคม – ธันวาคม", head: "ถอยทัพกลางหิมะ", stat: "−37°", label: "หนาวที่สุด" },
  { f: 505, tag: "ธันวาคม ค.ศ. 1812", head: "กลับถึงแม่น้ำเนมัน", stat: "10,000", label: "จาก 422,000" },
];
const LINES = [
  { text: "ปี 1812 นโปเลียนยกทัพสี่แสนกว่าคน บุกรัสเซีย", start: 12, len: 120 },
  { text: "ความกว้างของแถบคือจำนวนทหาร ยิ่งเดินยิ่งบางลง", start: 136, len: 130 },
  { text: "ถึงมอสโกเหลือแสนเดียว แล้วต้องถอยกลางหิมะ", start: 270, len: 130 },
  { text: "กลับถึงชายแดนเพียงหนึ่งหมื่นคน", start: 420, len: 116 },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { vertical, s, width, height, title, map, graph } = usePlate();
  const cam = camAt(
    [
      { frame: 0, cam: fitBox(ROUTE, map, 1) },
      { frame: 300, cam: fitBox(ROUTE, map, 1.02), easing: (t) => t },
      { frame: demo.frames, cam: fitBox(ROUTE, map, 1), easing: (t) => t },
    ],
    frame,
  );
  const a = headAt(ADV, ADVANCE, frame);
  const r = headAt(RET, RETREAT, frame);
  const side = (k: number) => Math.min(1, k * 2.2);
  const on = interpolate(frame, [10, 25], [0, 1], clamp);
  // the plate prints itself: map wipes in left to right in the first second
  const wipe = interpolate(frame, [0, 26], [0, 100], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const graphK = fade(frame, 40, demo.frames + 20, 20);
  const [mx, my, mw, mh] = map;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Sfx src={SFX.swell} at={6} volume={0.25} />
      <Bed id="army_march_crowd" from={30} to={280} volume={0.12} />
      <Hit id="fire_crackle" at={272} volume={0.22} />
      <Bed id="wind_storm" from={330} to={demo.frames} volume={0.13} />
      {[30, 60, 160, 200, 270, 470].map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.25} />)}
      <Sfx src={SFX.hit} at={505} volume={0.28} />
      <Sheet />
      <MapFrame cam={cam} {...focusOf(map, width, height)}>
        <defs>
          <clipPath id="m06-map">
            <rect x={mx} y={my} width={(mw * wipe) / 100} height={mh} />
          </clipPath>
        </defs>
        <g clipPath="url(#m06-map)">
          <EngravedLand hi={{ Neman: fade(frame, 14, 130), Berezina: fade(frame, 460, demo.frames + 20) }} />
          <Burning at={CITY.moscow as [number, number]} k={fade(frame, 266, 336, 12)} />
          <g opacity={on}>
            <ArmyBand pts={FAR_A} k={side(a)} color={C.tan} />
            <ArmyBand pts={NORTH_A} k={side(a)} color={C.tan} />
            <ArmyBand pts={ADVANCE} k={a} color={C.tan} />
            <ArmyBand pts={NORTH_R} k={side(r)} color={C.ink} shade={false} />
            <ArmyBand pts={FAR_R} k={side(r)} color={C.ink} shade={false} />
            <ArmyBand pts={RETREAT} k={r} color={C.ink} shade={false} />
          </g>
          <Town at={CITY.kovno as [number, number]} text="โคฟโน" k={fade(frame, 30, demo.frames + 20)} dy={52} />
          <Town at={CITY.vilna as [number, number]} text="วิลนา" k={fade(frame, 60, demo.frames + 20)} dy={-58} />
          <Town at={CITY.vitebsk as [number, number]} text="วีเต็บสค์" k={fade(frame, 160, demo.frames + 20)} dy={-40} />
          <Town at={CITY.smolensk as [number, number]} text="สโมเลนสค์" k={fade(frame, 200, demo.frames + 20)} dy={-50} />
          <Town at={CITY.moscow as [number, number]} text="มอสโก" k={fade(frame, 262, demo.frames + 20)} dy={-56} big color={frame > 266 && frame < 336 ? C.red : C.ink} />
          <Town at={CITY.studianka as [number, number]} text="แม่น้ำเบเรซินา" k={fade(frame, 466, demo.frames + 20)} dy={-44} size={0.85} />
          {r > 0 ? <ArmyCounter pts={RETREAT as ArmyPt[]} k={r} font={font} dy={64} /> : <ArmyCounter pts={ADVANCE as ArmyPt[]} k={Math.max(a, 0.0001)} font={font} dy={-62} />}
          <Snow k={interpolate(frame, [380, 420], [0, 1], clamp)} box={map} />
        </g>
        <Neatline box={map} />
        <TempGraph k={graphK} upto={lonAt(RET, frame)} box={graph} hot={interpolate(frame, [495, 510], [0, 1], clamp)} />
      </MapFrame>
      <Cartouche box={title} kicker="M06 · แผ่นภาพแกะทองแดง" title="นโปเลียนบุกรัสเซีย ค.ศ. 1812" sub="แผนภาพแสดงจำนวนทหารที่เหลือตลอดเส้นทาง">
        <Figure heads={HEADS} />
      </Cartouche>
      {(
        <div style={{ position: "absolute", right: width - mx - mw + 16 * s, top: my + mh - 58 * s, padding: `${4 * s}px ${16 * s}px`, background: C.paper, border: `${1.2 * s}px solid ${C.ink}`, opacity: on }}>
          <Legend k={1} />
        </div>
      )}
      <TintPanel />
      {LINES.map((l) => <PlateCaption key={l.start} text={l.text} start={l.start} len={l.len} />)}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: (vertical ? 64 : 52) * s, textAlign: "center", fontFamily: font, fontStyle: "italic", fontSize: 19 * s, color: C.sepia }}>
        ข้อมูลจากแผนภาพของ C. J. Minard (1869) · แผนที่วาดจาก Natural Earth · เส้นทางโดยประมาณ
      </div>
    </AbsoluteFill>
  );
};
