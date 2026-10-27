import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { clamp, view } from "../news/kit";
import { CityDot, MapFlag } from "../ep05/beatsKit";
import { B, BURMA_C, GOLD, RED, TAK_C, wp, type Chapter6 } from "./beatsKit";
import { Battle } from "./mapkit";
import { Bed, Hit, SFX } from "./mix";
import { PL, ROUTE, VW } from "./places";
import { BannerDawnScene, BridgeScene, CoastMarchScene, FishersScene, WelcomeScene, WhisperScene } from "./scenes";

// Chapter 5 (coast → fled): down to the sea, Na Kluea, along the beaches to Rayong, the trap at the bridge.
const T = {
  coast: B.coast.start,
  sea: wp("coast", "ทะเล", 0.85),
  naklua: B.naklua.start,
  nk: wp("naklua", "นาเกลือ", 0.15),
  klom: wp("naklua", "กลม", 0.35),
  drop: wp("naklua", "วาง", 0.75),
  route: B.route.start,
  pattaya: wp("route", "พัทยา", 0.25),
  jt: wp("route", "จอมเทียน", 0.45),
  sh: wp("route", "สัตหีบ", 0.62),
  ry: wp("route", "ระยอง", 0.9),
  rayong: B.rayong.start,
  wat: wp("rayong", "วัด", 0.6),
  plot: B.plot.start,
  warn: wp("plot", "เตือน", 0.3),
  men: wp("plot", "พัน", 0.65),
  raid: wp("plot", "ปล้น", 0.85),
  bridge: B.bridge.start,
  seize: wp("bridge", "จับ", 0.2),
  br: wp("bridge", "สะพาน", 0.4),
  hit: wp("bridge", "แตก", 0.75),
  water: wp("bridge", "น้ำ", 0.9),
  fled: B.fled.start,
  kl: wp("fled", "แกลง", 0.45),
  hand: wp("fled", "มือ", 0.85),
};
const END = B.prince.start;

export const e6c5: Chapter6 = {
  name: "สู่ทะเลตะวันออก",
  from: T.coast,
  to: END,
  cams: (w, h) => [
    { frame: T.coast, cam: view(VW.route, w, h, 0.95, 0.06) },
    { frame: T.naklua, cam: view(VW.coast, w, h, 0.95, 0.06) },
    { frame: T.rayong, cam: view(VW.rayong, w, h, 0.9, 0.06) },
  ],
  years: [[T.coast, "2310"]],
  heads: [
    { f: T.coast, tag: "หลังศึกโจ้โล้", head: "พม่าไม่ตามมาอีก", color: GOLD },
    { f: T.sea, tag: "เปลี่ยนเส้นทาง", head: "เดินเลียบชายทะเล", color: GOLD },
    { f: T.naklua, tag: "บ้านนาเกลือ ชลบุรี", head: "นายกลมยอมวางอาวุธ", color: GOLD },
    { f: T.route, tag: "เลียบหาด", head: "ถึงระยอง", color: GOLD, chips: [{ text: "พัทยา", f: T.pattaya }, { text: "จอมเทียน", f: T.jt }, { text: "สัตหีบ", f: T.sh }, { text: "ระยอง", f: T.ry }] },
    { f: T.rayong, tag: "ระยอง", head: "พักที่วัดลุ่มมหาชัยชุมพล", color: GOLD },
    { f: T.plot, tag: "กับดัก", head: "ขุนราม หมื่นซ่อง", stat: "ราว 1,500", label: "คน", color: RED },
    { f: T.bridge, tag: "ศึกหัวสะพาน", head: "ฝ่ายที่บุกถูกตีแตก", color: GOLD },
    { f: T.fled, tag: "ได้ระยอง", head: "ฐานแรกของพระยาตาก", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <Arrow points={ROUTE.coast} start={T.coast + 10} end={T.nk} color={TAK_C} width={12} />
        <CityDot at={PL.naklua} color={TAK_C} r={10} start={T.nk} />
        <PointLabel at={PL.naklua} text="นาเกลือ" start={T.nk} color={TAK_C} size={0.75} />
        <Arrow points={ROUTE.south} start={T.pattaya - 10} end={T.ry} color={TAK_C} width={12} />
        <PointLabel at={PL.sattahip} text="สัตหีบ" start={T.sh} color={TAK_C} size={0.7} />
        <CityDot at={PL.rayong} color={TAK_C} r={12} start={T.ry} />
        <PointLabel at={PL.rayong} text="ระยอง" start={T.ry} color={TAK_C} size={0.85} />
        <Battle at={PL.rayong} start={T.hit} end={T.fled + 30} color={GOLD} />
        <Arrow points={ROUTE.klaeng} start={T.kl - 10} end={T.kl + 20} color={BURMA_C} width={9} variant="dashed" opacity={interpolate(frame, [END - 10, END + 10], [1, 0], clamp)} />
        <PointLabel at={PL.klaeng} text="แกลง" start={T.kl} color={BURMA_C} size={0.7} />
        <MapFlag at={PL.rayong} color={GOLD} start={T.hand} />
      </>
    );
  },
  Panels: () => (
    <>
      <CoastMarchScene id="e6coast" anchor={PL.bangplasoi} start={T.coast} end={T.naklua + 14} />
      <FishersScene id="e6fish" anchor={PL.naklua} start={T.naklua} end={T.route + 14} />
      <CoastMarchScene id="e6coast2" anchor={PL.sattahip} start={T.route} end={T.rayong + 14} evening />
      <WelcomeScene id="e6welcome" anchor={PL.rayong} start={T.rayong} end={T.plot + 14} />
      <WhisperScene id="e6whisper" anchor={PL.rayong} start={T.plot} end={T.bridge + 14} />
      <BridgeScene id="e6bridge" anchor={PL.rayong} start={T.bridge} end={T.fled + 14} hits={[T.hit, T.water]} />
      <BannerDawnScene id="e6banner" anchor={PL.rayong} start={T.fled} end={END + 14} />
    </>
  ),
  sfx: [
    [T.coast - 6, SFX.whoosh, 0.25],
    [T.pattaya, SFX.pop, 0.25],
    [T.jt, SFX.pop, 0.25],
    [T.sh, SFX.pop, 0.25],
    [T.ry, SFX.pop, 0.3],
    [T.men, SFX.hit, 0.3],
    [T.hand, SFX.hit, 0.3],
  ],
  Audio: () => (
    <>
      <Bed id="sea_rough" from={T.coast} to={T.rayong + 30} volume={0.16} />
      <Hit id="wood_hit" at={T.drop} volume={0.4} />
      <Bed id="city_crowd" from={T.rayong} to={T.plot + 30} volume={0.08} />
      <Bed id="wind" from={T.plot} to={T.bridge + 30} volume={0.12} />
      <Bed id="sword_battle" from={T.bridge} to={T.fled + 20} volume={0.2} />
      <Hit id="splash_big" at={T.hit} volume={0.5} />
      <Hit id="splash" at={T.water} volume={0.45} />
      <Bed id="wind" from={T.fled} to={END + 40} volume={0.14} />
      <Hit id="gong" at={T.hand} volume={0.3} />
    </>
  ),
};
