import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../components/Arrow";
import { camAt } from "../../components/camera";
import { MapFrame } from "../../components/Map";
import { bbox } from "../../components/Region";
import { Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Locator, LowerCard, QuizCard, YearBadge } from "./kit/Hud";
import { Camp, Cloud, Elephant, Fort, Soldier, scatter } from "./kit/Icons";
import { At, fitArea, Flood, Place, ThMap } from "./kit/Map";
import { C, clamp, fonts, useUnit } from "./kit/theme";

// M11 cartoon paper map: a light history short. Two armies close on the city as tapered arrows with cartoon
// elephants → camera drops onto the island, the monsoon flood spreads round the enemy camps → a village quiz card
// with a countdown and a tick. Cream paper, ink outlines, year badge, locator and lower card. 15 s.
export const demo: StyleDemo = { id: "M11", name: "แผนที่การ์ตูนกระดาษ", frames: 450, cover: 112, sizes: ["9x16"] };

const AYUT: [number, number] = [100.566, 14.357];
const BANGRAJAN: [number, number] = [100.33, 14.9]; // approximate
const REGION = bbox([[95.2, 11.6], [103.6, 21.4]]);
const PLAIN = bbox([[100.4, 14.2], [100.75, 14.5]]);
const VILLAGE = bbox([[100.15, 14.75], [100.5, 15.05]]);
const NORTH: [number, number][] = [[96.08, 21.9], [97.6, 20.4], [98.98, 18.79], [100.4, 17.3], [100.1, 15.7], [100.45, 14.6]];
const WEST: [number, number][] = [[98.19, 14.08], [98.9, 14.3], [99.53, 14.02], [99.81, 13.54], [100.3, 14.1]];
const T = { north: 14, west: 30, zoom: 150, flood: 190, village: 300, quiz: 318, reveal: 408, end: 450 };

const Credit = () => {
  const { s, height } = useUnit();
  return <div style={{ position: "absolute", right: 30 * s, top: height * 0.645, fontFamily: fonts.body, fontSize: 18 * s, color: C.ink, opacity: 0.6 }}>แผนที่ © OpenStreetMap contributors · Natural Earth</div>;
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { s } = useUnit();
  const cam = camAt(
    [
      { frame: 0, cam: fitArea(REGION, width, height) },
      { frame: T.zoom, cam: fitArea(REGION, width, height) },
      { frame: T.zoom + 40, cam: fitArea(PLAIN, width, height) },
      { frame: T.village, cam: fitArea(PLAIN, width, height) },
      { frame: T.village + 30, cam: fitArea(VILLAGE, width, height, [0.1, 0.42, 0.9, 0.64]) },
    ],
    frame,
  );
  const region = frame < T.zoom + 20;
  const flood = interpolate(frame, [T.flood, T.flood + 70], [0, 1], clamp);
  const year = frame < T.zoom ? "2308" : "2309";
  const month = frame < T.zoom ? undefined : frame < T.village ? "กันยายน" : "ต้นปี";
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Sfx src={SFX.swell} at={0} volume={0.25} />
      <Hit id="war_drums" at={T.north} volume={0.25} />
      <Hit id="elephant" at={T.west + 20} volume={0.3} />
      <Sfx src={SFX.whoosh} at={T.zoom - 6} volume={0.25} />
      <Hit id="rain_light" at={T.flood} volume={0.15} />
      <Sfx src={SFX.whoosh} at={T.village - 6} volume={0.25} />
      {[3, 2, 1].map((n) => <Sfx key={n} src={SFX.tick} at={T.reveal - n * 30} volume={0.3} />)}
      <Sfx src={SFX.hit} at={T.reveal} volume={0.4} />
      <MapFrame cam={cam}>
        <ThMap island={!region} under={<Flood at={AYUT} radius={0.2} k={flood} squash={1.1} />}>
          {region && (
            <g opacity={interpolate(frame, [T.zoom, T.zoom + 20], [1, 0], clamp)}>
              <Arrow points={NORTH} start={T.north} end={T.north + 50} color={C.burma} width={26} />
              <Arrow points={WEST} start={T.west} end={T.west + 50} color={C.burma} width={26} />
              <At at={[98.0, 19.9]}>{(x, y, u) => <Elephant x={x} y={y} size={90 * u} />}</At>
              <At at={[100.35, 16.4]}>{(x, y, u) => <Elephant x={x - 30 * u} y={y} size={80 * u} phase={2} />}</At>
              <At at={[99.0, 13.85]}>{(x, y, u) => <Elephant x={x} y={y + 50 * u} size={80 * u} phase={4} />}</At>
              <At at={AYUT}>{(x, y, u) => <Fort x={x} y={y + 30 * u} size={90 * u} />}</At>
              <Place at={[96.08, 21.9]} name="อังวะ" color={C.burma} />
              <Place at={[98.98, 18.79]} name="เชียงใหม่" />
              <Place at={[98.19, 14.08]} name="ทวาย" color={C.burma} anchor="end" />
              <Place at={AYUT} name="อยุธยา" color={C.ayut} size={1.25} dx={70} />
            </g>
          )}
          {!region && frame < T.village + 20 && (
            <g>
              <At at={AYUT}>{(x, y, u) => <Fort x={x} y={y + 40 * u} size={110 * u} />}</At>
              {scatter(7, "camps", 0.12, 0.1).map(([dx, dy], i) => (
                <At key={i} at={[AYUT[0] + dx + (dx > 0 ? 0.04 : -0.04), AYUT[1] + dy]}>{(x, y, u) => <Camp x={x} y={y} size={80 * u} phase={i} k={interpolate(frame, [T.zoom + 30 + i * 5, T.zoom + 42 + i * 5], [0, 1], clamp)} />}</At>
              ))}
              <At at={[100.68, 14.45]}>{(x, y, u) => <Cloud x={x + Math.sin(frame * 0.03) * 20 * u} y={y} size={120 * u} k={interpolate(frame, [T.flood - 20, T.flood], [0, 1], clamp)} />}</At>
              <Place at={AYUT} name="อยุธยา" color={C.ayut} dx={70} dy={-10} />
            </g>
          )}
          {frame >= T.village && (
            <g>
              <At at={BANGRAJAN}>{(x, y, u) => <Camp x={x} y={y} size={150 * u} color={C.village} />}</At>
              {scatter(6, "vil", 0.05, 0.035).map(([dx, dy], i) => (
                <At key={i} at={[BANGRAJAN[0] + dx, BANGRAJAN[1] + dy - 0.03]}>{(x, y, u) => <Soldier x={x} y={y} size={80 * u} color={C.village} hat="band" hold={i % 2 ? "hoe" : "spear"} phase={i} />}</At>
              ))}
              <Place at={BANGRAJAN} name="บ้านบางระจัน" color={C.village} dy={50} />
            </g>
          )}
        </ThMap>
      </MapFrame>
      <YearBadge year={year} month={month} flash={frame < T.zoom ? undefined : frame < T.village ? T.zoom : T.village} />
      <Locator cam={cam} />
      <Credit />
      <LowerCard title="ทัพพม่าบุกสองทาง" sub="ทัพเหนือลงจากเชียงใหม่ · ทัพตะวันตกข้ามจากทวาย" color={C.burma} start={T.north + 10} end={T.zoom + 6} />
      <LowerCard title="น้ำหลากล้อมกรุง" sub="หน้าน้ำ ทุ่งรอบเกาะเมืองกลายเป็นทะเล" color={C.ayut} start={T.zoom + 8} end={T.village + 6} />
      <LowerCard title="ทายกันหน่อย" sub="ชาวบางระจันขอปืนใหญ่จากกรุงศรีอยุธยา" color={C.village} start={T.village + 8} />
      <QuizCard title="ทายกันหน่อย" question="ราชสำนักจะให้ปืนใหญ่ไหม?" options={["ให้", "ไม่ให้"]} answer={1} start={T.quiz} reveal={T.reveal} />
      <div style={{ position: "absolute", top: height * 0.03, left: 0, right: 0, textAlign: "center", fontFamily: fonts.body, fontWeight: 700, fontSize: 34 * s, color: C.ink, opacity: 0.8 }}>M11 · แผนที่การ์ตูนกระดาษ</div>
    </AbsoluteFill>
  );
};
