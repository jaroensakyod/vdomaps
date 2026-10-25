import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { MapFrame, useMap } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { bbox } from "../../components/Region";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { ArmyBand, ArmyCounter, type ArmyPt } from "./kit/Army";
import { ADVANCE, CITY, FAR_A, FAR_R, NORTH_A, NORTH_R, RETREAT } from "./kit/data1812";
import { BLACK, clamp, fade, FireGlow, font, GOLD, headAt, HeadCard, ICE, lonAt, MapSnow, Pin, RED, Rivers, TAN, TempChart, view, type Head } from "./kit/Minard";

// M06 Minard band: Napoleon's 1812 march on Moscow and the retreat, told with Minard's own numbers. A tan band as
// wide as the army marches east and thins; Moscow burns; a black band crawls back west under the temperature line
// and snow, with a troop counter riding the head of the band the whole way. 18 s, 9:16 and 16:9.
export const demo: StyleDemo = { id: "M06", name: "แถบกองทัพ Minard", frames: 540, cover: 452, sizes: ["9x16", "16x9"] };

// [frame, lon] keys: where the head of each band is when.
const ADV: [number, number][] = [[30, 24], [60, 25.2], [120, 28.5], [160, 30.3], [200, 32], [240, 35.6], [270, 37.6]];
const RET: [number, number][] = [[320, 37.7], [360, 35.4], [400, 32.6], [440, 30.4], [470, 28.6], [500, 26.4], [525, 24.1]];
const ROUTE = bbox([[23.4, 53.7], [38.2, 56.0]]);

const HEADS: Head[] = [
  { f: 10, tag: "มิ.ย. 1812 · ฝรั่งเศส → รัสเซีย", head: "นโปเลียนบุกรัสเซีย", stat: "422,000", label: "ทหาร" },
  { f: 270, tag: "ก.ย. 1812", head: "ถึงมอสโก แต่เมืองถูกเผา", stat: "100,000", label: "ทหารที่เหลือ", color: RED },
  { f: 330, tag: "ต.ค.–ธ.ค. 1812", head: "ถอยทัพกลางหิมะ", stat: "−37 °C", label: "หนาวที่สุด", color: ICE },
  { f: 505, tag: "ธ.ค. 1812", head: "กลับถึงแม่น้ำเนมัน", stat: "10,000", label: "จาก 422,000", color: "#e8edf2" },
];
const LINES = [
  { text: "ปี 1812 นโปเลียนยกทัพสี่แสนกว่าคน บุกรัสเซีย", start: 12, len: 120 },
  { text: "ความกว้างของแถบคือจำนวนทหาร ยิ่งเดินยิ่งบางลง", start: 136, len: 130 },
  { text: "ถึงมอสโกเหลือแสนเดียว แล้วต้องถอยกลางหิมะ", start: 270, len: 130 },
  { text: "กลับถึงชายแดนเพียงหนึ่งหมื่นคน", start: 420, len: 116 },
];

// The chart sits under the band: its top is just below the southern edge of the route.
const Chart = ({ frame }: { frame: number }) => {
  const { projection, height, width, s } = useMap();
  const top = (projection([30, 53.85])?.[1] ?? height * 0.5) + 30 * s;
  const h = (height > width ? 0.15 : 0.13) * height;
  return <TempChart k={fade(frame, 326, demo.frames + 20, 14)} upto={lonAt(RET, frame)} top={top} h={h} hot={interpolate(frame, [495, 510], [0, 1], clamp)} />;
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const s = Math.min(width, height) / 1080;
  const lift = vertical ? 0.08 : 0.08;
  const cam = camAt(
    [
      { frame: 0, cam: view(ROUTE, width, height, vertical ? 0.9 : 0.64, lift) },
      { frame: 300, cam: view(ROUTE, width, height, vertical ? 0.94 : 0.66, lift), easing: (t) => t },
      { frame: demo.frames, cam: view(ROUTE, width, height, vertical ? 0.9 : 0.64, lift), easing: (t) => t },
    ],
    frame,
  );
  const a = headAt(ADV, ADVANCE, frame);
  const r = headAt(RET, RETREAT, frame);
  const side = (k: number) => Math.min(1, k * 2.2);
  const on = interpolate(frame, [10, 25], [0, 1], clamp);
  const legend = frame < 330 ? "ความกว้างแถบ = จำนวนทหาร" : undefined;
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <Sfx src={SFX.swell} at={6} volume={0.3} />
      <Bed id="army_march_crowd" from={30} to={280} volume={0.14} />
      <Hit id="fire_big" at={272} volume={0.3} />
      <Bed id="wind_storm" from={330} to={demo.frames} volume={0.16} />
      {[30, 60, 160, 200, 270, 470].map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.25} />)}
      <Sfx src={SFX.hit} at={505} volume={0.35} />
      <MapFrame cam={cam} focusX={vertical ? 0.5 : 0.63}>
        <Raster layers={[{ name: "world" }, { name: "europe" }]} />
        <Rivers hi={{ Neman: fade(frame, 14, 130), Daugava: 0 }} />
        <FireGlow at={CITY.moscow} k={fade(frame, 266, 336, 12)} />
        <g opacity={on}>
          <ArmyBand pts={FAR_A} k={side(a)} color={TAN} />
          <ArmyBand pts={NORTH_A} k={side(a)} color={TAN} />
          <ArmyBand pts={ADVANCE} k={a} color={TAN} glow />
          <ArmyBand pts={NORTH_R} k={side(r)} color={BLACK} edge="#f2f2f2" />
          <ArmyBand pts={FAR_R} k={side(r)} color={BLACK} edge="#f2f2f2" />
          <ArmyBand pts={RETREAT} k={r} color={BLACK} edge="#f2f2f2" />
        </g>
        <Chart frame={frame} />
        <Pin at={CITY.kovno as [number, number]} text="โคฟโน" k={fade(frame, 30, demo.frames + 20)} size={0.85} dy={62} />
        <Pin at={CITY.vilna as [number, number]} text="วิลนา" k={fade(frame, 60, 330)} size={0.85} dy={58} />
        <Pin at={CITY.vitebsk as [number, number]} text="วีเต็บสค์" k={fade(frame, 160, 330)} size={0.85} dy={-74} />
        <Pin at={CITY.smolensk as [number, number]} text="สโมเลนสค์" k={fade(frame, 200, 420)} size={0.85} dy={-74} />
        <Pin at={CITY.moscow as [number, number]} text="มอสโก" k={fade(frame, 262, demo.frames + 20)} size={1} dy={-64} color={GOLD} />
        <Pin at={CITY.studianka as [number, number]} text="แม่น้ำเบเรซินา" k={fade(frame, 466, demo.frames + 20)} size={0.8} dy={-60} color={ICE} />
        {r > 0 ? <ArmyCounter pts={RETREAT as ArmyPt[]} k={r} color="#e8edf2" font={font} dy={-80} /> : <ArmyCounter pts={ADVANCE as ArmyPt[]} k={Math.max(a, 0.0001)} color={GOLD} font={font} dy={-80} />}
        <MapSnow k={interpolate(frame, [380, 420], [0, 1], clamp)} />
      </MapFrame>
      <HeadCard heads={HEADS} from={10} to={demo.frames} legend={legend} />
      {LINES.map((l) => <Caption key={l.start} text={l.text} start={l.start} len={l.len} font={font} top={0.78} />)}
      <div style={{ position: "absolute", ...(vertical ? { top: 22, left: 0, right: 0, textAlign: "center" as const } : { top: 30, right: 40 }), fontFamily: font, fontSize: 30 * s, fontWeight: 700, color: "#fff", opacity: 0.8 }}>M06 · แถบกองทัพ Minard</div>
    </AbsoluteFill>
  );
};
