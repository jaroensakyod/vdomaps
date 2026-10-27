import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { clamp, view } from "../news/kit";
import { CityDot } from "../ep05/beatsKit";
import { B, BURMA_C, GOLD, RED, TAK_C, wp, type Chapter6 } from "./beatsKit";
import { Battle, CampRing, DateCard } from "./mapkit";
import { Bed, Hit, SFX } from "./mix";
import { PL, ROUTE, VW } from "./places";
import { CityGlowScene, DawnMarchScene, MarchOutScene, NightClashScene, OfficersScene, PhichaiCampScene } from "./scenes";

// Chapter 2 (phichai → nolook): the camp at Wat Phichai, the night breakout, the city glowing behind them.
const T = {
  phichai: B.phichai.start,
  chinese: wp("phichai", "จีน", 0.3),
  camp: wp("phichai", "พิชัย", 0.7),
  team: B.team.start,
  n1: wp("team", "เชียงเงิน", 0.5),
  n2: wp("team", "อาสา", 0.62),
  n3: wp("team", "พิพิธ", 0.75),
  night: B.night.start,
  out: wp("night", "ออกจาก", 0.65),
  hantra: B.hantra.start,
  clash: wp("hantra", "หันตรา", 0.4),
  dark: wp("hantra", "มืด", 0.7),
  fire: B.fire.start,
  mid: wp("fire", "เที่ยงคืน", 0.1),
  glow: wp("fire", "ไฟ", 0.45),
  nolook: B.nolook.start,
  km: wp("nolook", "ข้าว", 0.5),
  sb: wp("nolook", "บัณฑิต", 0.7),
  morn: wp("nolook", "เช้า", 0.9),
};
const END = B.chase.start;

// Night over the map (from the march out to dawn) and, from midnight, the glow of the burning city.
const Night = () => {
  const frame = useCurrentFrame();
  const { projection, width, height, s } = useMap();
  const dark = interpolate(frame, [T.night - 10, T.night + 20, T.morn, T.morn + 40], [0, 1, 1, 0], clamp);
  const fire = interpolate(frame, [T.mid, T.mid + 30, T.nolook + 30, END], [0, 1, 1, 0], clamp);
  const p = projection(PL.ayut);
  if (dark <= 0) return null;
  const flick = 1 + 0.05 * Math.sin(frame * 0.09) + 0.03 * Math.sin(frame * 0.23);
  return (
    <g>
      <defs>
        <radialGradient id="e6cityfire">
          <stop offset="0" stopColor="#ff8a2a" stopOpacity={0.8} />
          <stop offset="0.5" stopColor="#ff5a1a" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ff5a1a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill="#06112b" opacity={0.5 * dark} />
      {p && fire > 0 && <circle cx={p[0]} cy={p[1]} r={260 * s * flick} fill="url(#e6cityfire)" opacity={fire} style={{ mixBlendMode: "screen" }} />}
    </g>
  );
};

export const e6c2: Chapter6 = {
  name: "คืนฝ่าวงล้อม",
  from: T.phichai,
  to: END,
  cams: (w, h) => [
    { frame: T.phichai, cam: view(VW.island, w, h, 0.8, 0.06) },
    { frame: T.night, cam: view(VW.hook, w, h, 0.95, 0.06) },
    { frame: T.hantra, cam: view(VW.uthai, w, h, 1.0, 0.06) },
    { frame: T.fire, cam: view(VW.uthai, w, h, 0.85, 0.06) },
  ],
  years: [[T.phichai, "2310"]],
  heads: [
    { f: T.phichai, tag: "ค่ายวัดพิชัย", head: "คนไทยและคนจีน", stat: "ราว 500", label: "คน", color: GOLD },
    { f: T.team, tag: "ชื่อในพงศาวดาร", head: "คนที่ตามมา", color: GOLD, chips: [{ text: "พระเชียงเงิน", f: T.n1 }, { text: "หลวงพิชัยอาสา", f: T.n2 }, { text: "ขุนพิพิธวาที", f: T.n3 }] },
    { f: T.night, tag: "คืน 3 ม.ค. 2310", head: "ออกทางตะวันออก", color: GOLD },
    { f: T.hantra, tag: "ปะทะแรก", head: "บ้านหันตรา", color: RED },
    { f: T.fire, tag: "ราวเที่ยงคืน", head: "ไฟลุกในกรุง", color: RED },
    { f: T.nolook, tag: "เดินทั้งคืน", head: "ไม่มีใครย้อนกลับ", color: GOLD, chips: [{ text: "ข้าวเม่า", f: T.km }, { text: "สามบัณฑิต", f: T.sb }] },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const ring = interpolate(frame, [T.phichai, T.phichai + 10, T.nolook, T.nolook + 30], [0.7, 1, 1, 0.4], clamp);
    return (
      <>
        <Night />
        <CampRing k={ring} />
        <CityDot at={PL.ayut} color={RED} r={12} start={T.phichai} />
        <CityDot at={PL.phichai} color={TAK_C} r={14} start={T.camp - 6} />
        <PointLabel at={PL.phichai} text="วัดพิชัย" start={T.camp} color={TAK_C} size={0.85} />
        <Arrow points={ROUTE.night.slice(0, 2)} start={T.out} end={T.clash} color={TAK_C} width={12} />
        <Battle at={PL.hantra} start={T.clash} end={T.fire + 20} />
        {frame >= T.hantra && <PointLabel at={PL.hantra} text="บ้านหันตรา" start={T.clash + 4} color={BURMA_C} size={0.75} />}
        <Arrow points={ROUTE.night.slice(1)} start={T.km - 10} end={T.sb + 10} color={TAK_C} width={12} />
        <PointLabel at={PL.khaomao} text="ข้าวเม่า" start={T.km} color={TAK_C} size={0.7} />
        <PointLabel at={PL.sambandit} text="สามบัณฑิต" start={T.sb} color={TAK_C} size={0.7} />
      </>
    );
  },
  Panels: () => (
    <>
      <PhichaiCampScene id="e6camp" anchor={PL.phichai} start={T.phichai} end={T.team + 14} />
      <OfficersScene id="e6officers" anchor={PL.phichai} start={T.team} end={T.night + 14} />
      <MarchOutScene id="e6march" anchor={PL.phichai} start={T.night} end={T.hantra + 14} />
      <NightClashScene id="e6clash" anchor={PL.hantra} start={T.hantra} end={T.fire + 14} shots={[T.clash + 6, T.clash + 30, T.dark + 4]} />
      <CityGlowScene id="e6glow" anchor={PL.ayut} start={T.fire} end={T.nolook + 14} />
      <DawnMarchScene id="e6dawn" anchor={PL.sambandit} start={T.nolook} end={END + 14} />
    </>
  ),
  Screen: () => <DateCard start={T.night} end={T.hantra} day="3" month="มกราคม" year="2310" color={GOLD} />,
  sfx: [
    [T.n1, SFX.pop, 0.25],
    [T.n2, SFX.pop, 0.25],
    [T.n3, SFX.pop, 0.25],
    [T.night, SFX.whoosh, 0.25],
    [T.km, SFX.pop, 0.25],
    [T.sb, SFX.pop, 0.25],
  ],
  Audio: () => (
    <>
      <Bed id="fire_crackle" from={T.phichai} to={T.night + 40} volume={0.18} />
      <Hit id="sword_draw" at={T.camp} volume={0.35} />
      <Bed id="army_marching" from={T.night} to={T.hantra + 40} volume={0.16} />
      <Bed id="sword_battle" from={T.hantra} to={T.fire + 30} volume={0.2} />
      <Hit id="rifle_echo" at={T.clash + 6} volume={0.45} />
      <Hit id="rifle_echo" at={T.clash + 30} volume={0.4} />
      <Hit id="rifle_echo" at={T.dark + 4} volume={0.4} />
      <Bed id="fire_big" from={T.fire} to={T.nolook + 40} volume={0.16} />
      <Bed id="wind" from={T.nolook} to={END + 40} volume={0.16} />
      <Bed id="army_marching" from={T.nolook + 10} to={END + 40} volume={0.12} />
    </>
  ),
};
