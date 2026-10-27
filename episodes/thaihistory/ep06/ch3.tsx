import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { clamp, view } from "../news/kit";
import { CityDot } from "../ep05/beatsKit";
import { B, BURMA_C, GOLD, RED, TAK_C, wp, type Chapter6 } from "./beatsKit";
import { ApproxNote, Battle } from "./mapkit";
import { Bed, Hit, SFX } from "./mix";
import { PL, ROUTE, VW } from "./places";
import { ElephantGiftScene, FiveRidersScene, ForagersScene, GrowingColumnScene, ScatterScene, StockadeScene, TurnFightScene } from "./scenes";

// Chapter 3 (chase → dongwin): the Burmese pursuit, five riders at Phran Nok, elephants and Ban Dong.
const T = {
  chase: B.chase.start,
  pursue: wp("chase", "ตาม", 0.35),
  psh: wp("chase", "โพธิ์", 0.55),
  win: wp("chase", "แตก", 0.9),
  phrannok: B.phrannok.start,
  pn: wp("phrannok", "พรานนก", 0.3),
  two: wp("phrannok", "สองพัน", 0.85),
  horse: B.horse.start,
  four: wp("horse", "สี่", 0.35),
  charge: wp("horse", "ควบ", 0.55),
  foot: wp("horse", "เดินเท้า", 0.8),
  broke: B.broke.start,
  vil: wp("broke", "ชาวบ้าน", 0.4),
  elephant: B.elephant.start,
  nny: wp("elephant", "นครนายก", 0.2),
  khun: wp("elephant", "ชำนาญ", 0.4),
  six: wp("elephant", "หก", 0.9),
  bandong: B.bandong.start,
  bd: wp("bandong", "ดง", 0.15),
  three: wp("bandong", "สาม", 0.75),
  dongwin: B.dongwin.start,
  fight: wp("dongwin", "รบ", 0.15),
  gain: wp("dongwin", "ช้าง", 0.4),
  grow: wp("dongwin", "ใหญ่", 0.9),
};
const END = B.crossing.start;
const CHARGE = T.charge + 30;

export const e6c3: Chapter6 = {
  name: "พม่าไล่ตาม",
  from: T.chase,
  to: END,
  cams: (w, h) => [
    { frame: T.chase, cam: view(VW.uthai, w, h, 0.95, 0.06) },
    { frame: T.phrannok, cam: view(VW.phrannok, w, h, 0.95, 0.06) },
    { frame: T.elephant, cam: view(VW.nny, w, h, 0.95, 0.06) },
  ],
  years: [[T.chase, "2310"]],
  heads: [
    { f: T.chase, tag: "4 ม.ค. 2310", head: "พม่าไล่ตามมาติด ๆ", color: RED },
    { f: T.win, tag: "บ้านโพธิ์สาวหาร", head: "หันกลับมาสู้ ชนะ", color: GOLD },
    { f: T.phrannok, tag: "บ้านพรานนก", head: "เจอทัพพม่า", stat: "ราว 2,000", label: "คน", color: RED },
    { f: T.horse, tag: "พระยาตาก + ทหารม้า 4", head: "ควบเข้าใส่ 2,000", stat: "5", label: "ม้า", color: GOLD },
    { f: T.broke, tag: "พม่าแตกกระจาย", head: "ชาวบ้านเริ่มเชื่อ", color: GOLD },
    { f: T.elephant, tag: "นครนายก", head: "ขุนชำนาญไพรสณฑ์สวามิภักดิ์", stat: "6", label: "เชือก", color: GOLD },
    { f: T.bandong, tag: "บ้านดง", head: "ชาวบ้านราวพันคนไม่ยอม", color: RED, chips: [{ text: "เจรจา 3 ครั้ง", f: T.three }] },
    { f: T.dongwin, tag: "ชนะบ้านดง", head: "กองเริ่มใหญ่ขึ้น", color: GOLD, chips: [{ text: "ช้าง", f: T.gain }, { text: "เสบียง", f: T.gain + 10 }, { text: "อาวุธ", f: T.gain + 20 }] },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <Arrow points={[PL.hantra, PL.khaomao, [100.72, 14.37]]} start={T.pursue - 6} end={T.psh} color={BURMA_C} width={10} variant="dashed" opacity={interpolate(frame, [T.phrannok, T.phrannok + 15], [1, 0], clamp)} />
        <Arrow points={ROUTE.day4.slice(0, 2)} start={T.chase} end={T.psh} color={TAK_C} width={12} />
        <Battle at={PL.phosaohan} start={T.win - 4} end={T.elephant} color={GOLD} />
        <PointLabel at={PL.phosaohan} text="โพธิ์สาวหาร" start={T.psh} color={TAK_C} size={0.75} />
        <Arrow points={ROUTE.day4.slice(1)} start={T.phrannok} end={T.pn + 10} color={TAK_C} width={12} />
        <Battle at={PL.phrannok} start={CHARGE} end={T.elephant + 20} color={GOLD} />
        <PointLabel at={PL.phrannok} text="บ้านพรานนก (ประมาณ)" start={T.pn} color={TAK_C} size={0.75} />
        <Arrow points={ROUTE.nny} start={T.elephant} end={T.nny + 20} color={TAK_C} width={12} />
        <CityDot at={PL.nakhonnayok} color={TAK_C} r={12} start={T.nny} />
        <PointLabel at={PL.nakhonnayok} text="นครนายก" start={T.nny} color={TAK_C} size={0.8} />
        <Battle at={PL.bandong} start={T.fight} end={END + 20} color={GOLD} />
        <PointLabel at={PL.bandong} text="บ้านดง (ประมาณ)" start={T.bd} color={BURMA_C} size={0.7} />
      </>
    );
  },
  Panels: () => (
    <>
      <TurnFightScene id="e6turn" anchor={PL.phosaohan} start={T.chase} end={T.phrannok + 14} hits={[T.win]} />
      <ForagersScene id="e6forage" anchor={PL.phrannok} start={T.phrannok} end={T.horse + 14} />
      <FiveRidersScene id="e6riders" anchor={PL.phrannok} start={T.horse} end={T.broke + 14} hits={[CHARGE]} />
      <ScatterScene id="e6scatter" anchor={PL.phrannok} start={T.broke} end={T.elephant + 14} />
      <ElephantGiftScene id="e6eleph" anchor={PL.nakhonnayok} start={T.elephant} end={T.bandong + 14} />
      <StockadeScene id="e6stock" anchor={PL.bandong} start={T.bandong} end={T.dongwin + 14} />
      <GrowingColumnScene id="e6grow1" anchor={PL.bandong} start={T.dongwin} end={END + 14} />
    </>
  ),
  Screen: () => <ApproxNote from={T.phrannok} to={END} />,
  sfx: [
    [T.two, SFX.hit, 0.3],
    [T.four, SFX.pop, 0.3],
    [T.six, SFX.pop, 0.3],
    [T.three, SFX.pop, 0.25],
    [T.gain, SFX.pop, 0.25],
    [T.gain + 10, SFX.pop, 0.25],
    [T.gain + 20, SFX.pop, 0.25],
  ],
  Audio: () => (
    <>
      <Bed id="army_march_crowd" from={T.chase} to={T.phrannok + 30} volume={0.16} />
      <Hit id="sword_clash" at={T.win} volume={0.5} />
      <Bed id="wind" from={T.phrannok} to={T.horse + 30} volume={0.16} />
      <Bed id="horse_gallop" from={T.horse} to={T.broke + 40} volume={0.3} />
      <Hit id="horse_neigh" at={T.charge} volume={0.4} />
      <Hit id="battle_cry" at={CHARGE} volume={0.45} />
      <Bed id="crowd_panic" from={T.broke} to={T.elephant + 20} volume={0.1} />
      <Hit id="elephant" at={T.khun} volume={0.45} />
      <Bed id="jungle_rain" from={T.elephant} to={T.dongwin + 30} volume={0.1} />
      <Hit id="crowd_angry" at={T.bd + 6} volume={0.3} />
      <Hit id="sword_clash" at={T.fight} volume={0.45} />
      <Bed id="army_marching" from={T.dongwin} to={END + 40} volume={0.16} />
    </>
  ),
};
