import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../components/Arrow";
import { camForFeature, type Cam } from "../../components/camera";
import { MapFrame } from "../../components/Map";
import { bbox } from "../../components/Region";
import { HighGroundDiagram } from "./kit/Diagram";
import { Chip, Locator, LowerCard, QuestionBadge, QuizCard, YearBadge } from "./kit/Hud";
import { Boat, Camp, Cloud, Elephant, Fire, Fort, Rider, Smoke, Soldier, scatter } from "./kit/Icons";
import { At, fitArea, Flood, Place, ThMap } from "./kit/Map";
import { C, clamp, fonts, useUnit } from "./kit/theme";

// Gate 2 style frames: five key beats of the Ayutthaya episode, rendered as stills (npx remotion still ThStyle --props).
export type Scene = "hook" | "pincer" | "diagram" | "quiz" | "breakout";

export const AYUT: [number, number] = [100.566, 14.357];
const HUARO: [number, number] = [100.578, 14.366]; // approximate
const ISLAND = bbox([[100.535, 14.33], [100.6, 14.385]]);
const REGION = bbox([[95.2, 11.6], [103.6, 21.4]]);
const BANGRAJAN: [number, number] = [100.33, 14.9]; // approximate
const EAST = bbox([[100.0, 12.4], [101.9, 14.9]]);

const Credit = () => {
  const { s, height } = useUnit();
  return <div style={{ position: "absolute", right: 30 * s, top: height * 0.645, fontFamily: fonts.body, fontSize: 18 * s, color: C.ink, opacity: 0.6 }}>แผนที่ © OpenStreetMap contributors · Natural Earth</div>;
};

const Hud = ({ cam, year, month, title, sub, color }: { cam: Cam; year: string; month?: string; title: string; sub: string; color: string }) => (
  <>
    <YearBadge year={year} month={month} />
    <Locator cam={cam} />
    <Credit />
    <LowerCard title={title} sub={sub} color={color} start={0} />
  </>
);

export const ThStyle = ({ scene }: { scene: Scene }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  if (scene === "hook") {
    const cam = fitArea(ISLAND, width, height, [0.02, 0.15, 0.98, 0.66]);
    const pour = interpolate(frame, [0, 60], [0, 1], clamp);
    return (
      <AbsoluteFill style={{ background: C.paper }}>
        <MapFrame cam={cam}>
          <ThMap night={0.75}>
            <defs><radialGradient id="glow"><stop offset="0" stopColor="#ff9a3c" stopOpacity={0.55} /><stop offset="1" stopColor="#ff9a3c" stopOpacity={0} /></radialGradient></defs>
            <At at={AYUT}>{(x, y, s) => <circle cx={x} cy={y} r={520 * s} fill="url(#glow)" />}</At>
            <At at={AYUT}>{(x, y, s) => <Fort x={x} y={y + 150 * s} size={360 * s} burnt={0.6} />}</At>
            {scatter(9, "fire", 0.014, 0.01).map(([dx, dy], i) => (
              <At key={i} at={[AYUT[0] + dx, AYUT[1] + dy]}>{(x, y, s) => <Fire x={x} y={y} size={(70 + (i % 3) * 20) * s} phase={i} seed={i} />}</At>
            ))}
            <At at={HUARO}>{(x, y, s) => <Smoke x={x} y={y - 40 * s} size={260 * s} />}</At>
            {scatter(10, "pour", 0.007, 0.004).map(([dx, dy], i) => (
              <At key={`p${i}`} at={[HUARO[0] + 0.01 - dx * pour - 0.012 * pour, HUARO[1] + 0.006 + dy - 0.008 * pour]}>
                {(x, y, s) => <Soldier x={x} y={y} size={70 * s} walk flip hold={i % 3 ? "spear" : "torch"} phase={i} />}
              </At>
            ))}
          </ThMap>
        </MapFrame>
        <QuestionBadge start={0} />
        <Hud cam={cam} year="2310" month="7 เมษายน" title="อยุธยา 417 ปี แตกในคืนเดียวได้ไง?" sub="7 เมษายน 2310 · กำแพงหัวรอพัง" color={C.burma} />
      </AbsoluteFill>
    );
  }

  if (scene === "pincer") {
    const cam = fitArea(REGION, width, height);
    const N: [number, number][] = [[96.08, 21.9], [97.6, 20.4], [98.98, 18.79], [100.4, 17.3], [100.1, 15.7], [100.45, 14.6]];
    const W: [number, number][] = [[98.19, 14.08], [98.9, 14.3], [99.53, 14.02], [99.81, 13.54], [100.3, 14.1]];
    return (
      <AbsoluteFill style={{ background: C.paper }}>
        <MapFrame cam={cam}>
          <ThMap island={false}>
            <Arrow points={N} start={0} end={40} color={C.burma} width={26} />
            <Arrow points={W} start={10} end={50} color={C.burma} width={26} />
            <At at={[98.0, 19.9]}>{(x, y, s) => <Elephant x={x} y={y} size={90 * s} />}</At>
            <At at={[100.35, 16.4]}>{(x, y, s) => <Elephant x={x - 30 * s} y={y} size={80 * s} phase={2} />}</At>
            <At at={[99.0, 13.85]}>{(x, y, s) => <Elephant x={x} y={y + 50 * s} size={80 * s} phase={4} />}</At>
            <At at={AYUT}>{(x, y, s) => <Fort x={x} y={y + 30 * s} size={90 * s} />}</At>
            <Place at={[96.08, 21.9]} name="อังวะ" color={C.burma} />
            <Place at={[98.98, 18.79]} name="เชียงใหม่" />
            <Place at={[102.13, 19.89]} name="หลวงพระบาง" anchor="end" />
            <Place at={[98.19, 14.08]} name="ทวาย" color={C.burma} anchor="end" />
            <Place at={[99.53, 14.02]} name="กาญจนบุรี" dy={-34} anchor="middle" dx={0} />
            <Place at={AYUT} name="อยุธยา" color={C.ayut} size={1.25} dx={70} />
          </ThMap>
        </MapFrame>
        <Hud cam={cam} year="2308" title="คีมสองขา" sub="ทัพเหนือ เนเมียวสีหบดี + ทัพตะวันตก มังมหานรธา" color={C.burma} />
      </AbsoluteFill>
    );
  }

  if (scene === "diagram") {
    const cam = fitArea(bbox([[100.4, 14.2], [100.75, 14.5]]), width, height);
    return (
      <AbsoluteFill style={{ background: C.paper }}>
        <MapFrame cam={cam}>
          <ThMap under={<Flood at={AYUT} radius={0.2} k={1} squash={1.1} />}>
            <At at={AYUT}>{(x, y, s) => <Fort x={x} y={y + 40 * s} size={110 * s} />}</At>
            {scatter(7, "camps", 0.12, 0.1).map(([dx, dy], i) => (
              <At key={i} at={[AYUT[0] + dx + (dx > 0 ? 0.04 : -0.04), AYUT[1] + dy]}>{(x, y, s) => <Camp x={x} y={y} size={80 * s} phase={i} />}</At>
            ))}
            <At at={[100.68, 14.45]}>{(x, y, s) => <Cloud x={x} y={y} size={120 * s} />}</At>
          </ThMap>
        </MapFrame>
        <HighGroundDiagram start={-90} y={0.2} />
        <Hud cam={cam} year="2309" month="กันยายน" title="ภาพที่ 2: ค่ายบนที่ดอน" sub="น้ำท่วมทุ่งก็จริง แต่ไม่ถึงค่าย แถมมีเรือใช้" color={C.burma} />
      </AbsoluteFill>
    );
  }

  if (scene === "quiz") {
    const cam = fitArea(bbox([[100.15, 14.75], [100.5, 15.05]]), width, height);
    return (
      <AbsoluteFill style={{ background: C.paper }}>
        <MapFrame cam={cam}>
          <ThMap>
            <At at={BANGRAJAN}>{(x, y, s) => <Camp x={x} y={y} size={150 * s} color={C.village} />}</At>
            {scatter(6, "vil", 0.05, 0.035).map(([dx, dy], i) => (
              <At key={i} at={[BANGRAJAN[0] + dx, BANGRAJAN[1] + dy - 0.03]}>{(x, y, s) => <Soldier x={x} y={y} size={80 * s} color={C.village} hat="band" hold={i % 2 ? "hoe" : "spear"} phase={i} />}</At>
            ))}
            <Place at={BANGRAJAN} name="บ้านบางระจัน" color={C.village} dy={50} />
          </ThMap>
        </MapFrame>
        <QuizCard title="ทายกันหน่อย" question="ราชสำนักจะให้ปืนใหญ่ไหม?" options={["ให้", "ไม่ให้"]} answer={1} start={-30} reveal={60} />
        <Hud cam={cam} year="2309" title="ทายกันหน่อย" sub="ชาวบางระจันขอปืนใหญ่จากกรุงศรีอยุธยา" color={C.village} />
      </AbsoluteFill>
    );
  }

  // breakout
  const cam = fitArea(EAST, width, height, [0.08, 0.2, 0.92, 0.64]);
  const R: [number, number][] = [[100.58, 14.36], [101.2, 14.2], [101.37, 14.05], [101.0, 13.36], [101.28, 12.68]];
  const p = interpolate(frame, [0, 60], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <MapFrame cam={cam}>
        <ThMap island={false}>
          {scatter(6, "ring", 0.09, 0.07).map(([dx, dy], i) => (
            <At key={i} at={[AYUT[0] + dx, AYUT[1] + dy]}>{(x, y, s) => <Camp x={x} y={y} size={50 * s} phase={i} />}</At>
          ))}
          <At at={AYUT}>{(x, y, s) => <Fort x={x} y={y + 30 * s} size={80 * s} />}</At>
          <Arrow points={R} start={-20} end={40} color={C.taksin} width={22} />
          <At at={[101.0, 13.5]}>{(x, y, s) => <Rider x={x + 40 * s} y={y} size={110 * s} />}</At>
          <Place at={[101.21, 14.2]} name="นครนายก" />
          <Place at={[101.37, 14.05]} name="ปราจีนบุรี" dy={30} />
          <Place at={[100.98, 13.36]} name="ชลบุรี" anchor="end" />
          <Place at={[101.28, 12.68]} name="ระยอง" color={C.taksin} />
          <Place at={AYUT} name="อยุธยา" color={C.ayut} anchor="end" dx={40} />
          <At at={[100.9, 12.9]}>{(x, y, s) => <Boat x={x} y={y} size={60 * s} color={C.taksin} />}</At>
        </ThMap>
      </MapFrame>
      <Chip x={width * 0.72} y={height * 0.27} text={`ทหาร ${Math.round(500 * p)}–${Math.round(1000 * p)} คน`} color={C.taksin} start={-10} />
      <Hud cam={cam} year="2310" month="มกราคม" title="ตีฝ่าวงล้อม" sub="พระยาตากพาทหารราว 500–1,000 คน มุ่งหน้าตะวันออก" color={C.taksin} />
    </AbsoluteFill>
  );
};
