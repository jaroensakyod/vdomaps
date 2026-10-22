import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { AssaultScene, FleetScene, PeopleScene, RetreatBoatsScene } from "../ep02/scenes";
import { clamp, font, GOLD, RED, view, type Chapter } from "../news/kit";
import { B, BURMA_C, CityDot, SIAM_C, Stockades, wf, Zones } from "./beatsKit";
import { HOOKVIEW } from "./ch0";
import { RiverGlow, RING } from "./chB";
import { INVADE, NAN, NAN_UP, PL, VW } from "./places";
import { BreakoutScene, BurmaCourtScene, ChaseScene, DefendersScene, GranaryScene, HungryCampScene, MarchScene, MessengerScene, RefugeeScene, RiverWarScene, RoyalCampScene, SiegeScene, TakenCityScene } from "./scenes";

// Chapters 6–9 of episode 3: the royal army (relief → back), the breakout (hunger → win),
// the twist (stuck → end), the answer (answer → poll).

const CENTRAL = bbox([[99.2, 13.5], [101.5, 17.3]]);
const RIVERWAR = bbox([[99.0, 14.9], [101.4, 17.7]]);
const EAST = bbox([[99.8, 15.9], [101.6, 17.2]]);
const LONG = bbox([[95.0, 12.0], [102.0, 24.0]]);
const AVA = bbox([[94.5, 15.5], [101.5, 25.0]]);
const PLK_RING = () => <Stockades center={RING.center} n={RING.n} r0={0.06} start={-100} step={0} />;
const CUT = () => <Stockades center={[100.3, 16.6]} n={3} r0={0.03} start={-100} step={0} />;

const C6 = {
  relief: B.relief.start,
  tak: wf("relief", "พระเจ้า", 0.25),
  land: wf("relief", "บก", 0.68),
  boats: wf("relief", "เรือ", 0.76),
  pakping: B.pakping.start,
  pp: wf("pakping", "ปาก", 0.25),
  battle: B.battle.start,
  trick: B.trick.start,
  split3k: wf("trick", "แบ่ง", 0.4),
  kp: wf("trick", "กำแพงเพชร", 0.75),
  uthai: wf("trick", "อุทัยธานี", 0.88),
  rear: B.rear.start,
  thon: wf("rear", "ธนบุรี", 0.9),
  split: B.split.start,
  two: wf("split", "แยก", 0.85),
  choice: B.choice.start,
  or: wf("choice", "หรือ", 0.65),
  back: B.back.start,
  bkt: wf("back", "บาง", 0.15),
  dim: wf("back", "ริบ", 0.85),
  end: B.hunger.start,
};
const UTHAI: [number, number] = [100.02, 15.38];
const BKT: [number, number] = [100.37, 16.3];
const AROUND: [number, number][] = [[100.15, 16.85], [99.85, 16.75], [99.55, 16.5], [99.6, 16.0], [99.85, 15.6], UTHAI];

export const e3c6: Chapter = {
  name: "ทัพหลวง",
  from: C6.relief,
  to: C6.end,
  cams: (w, h) => [
    { frame: C6.relief, cam: view(VW.plk, w, h, 0.95, 0.06) },
    { frame: C6.relief + 30, cam: view(CENTRAL, w, h, 0.9, 0.08) },
    { frame: C6.pakping, cam: view(CENTRAL, w, h, 0.9, 0.08) },
    { frame: C6.pakping + 30, cam: view(VW.plkWide, w, h, 0.9, 0.06) },
    { frame: C6.trick, cam: view(VW.plkWide, w, h, 0.9, 0.06) },
    { frame: C6.trick + 30, cam: view(RIVERWAR, w, h, 0.9, 0.06) },
    { frame: C6.end, cam: view(RIVERWAR, w, h, 0.9, 0.06) },
  ],
  years: [[C6.relief, "2318–2319"]],
  heads: [
    { f: C6.relief, tag: "ข่าวถึงธนบุรี", head: "ทัพหลวงขึ้นเหนือ", color: GOLD },
    { f: C6.tak, tag: "เสด็จด้วยพระองค์เอง", head: "พระเจ้าตาก", color: GOLD, portrait: "taksin_king", chips: [{ text: "ทัพบก", f: C6.land }, { text: "ทัพเรือ", f: C6.boats }] },
    { f: C6.pakping, tag: "ตั้งค่ายที่ปากพิง", head: "เปิดทางเสบียงเข้าเมือง", color: GOLD },
    { f: C6.battle, tag: "รบริมน้ำหลายครั้ง", head: "แย่งเส้นชีวิตของเมือง", color: GOLD },
    { f: C6.trick, tag: "อะแซหวุ่นกี้ไม่ได้มองแค่พิษณุโลก", head: "แยกทัพอ้อมลงใต้", color: RED, portrait: "azaewungyi" },
    { f: C6.split3k, tag: "ทัพพม่าแยกออกไป", head: "อ้อมกำแพงเพชร · อุทัยธานี", stat: "ราว 3,000", label: "คน", color: RED },
    { f: C6.rear, tag: "ตีลงไปข้างหลังทัพหลวง", head: "คุกคามทางลงธนบุรี", color: RED },
    { f: C6.split, tag: "ภาพบนแผนที่น่ากลัวมาก", head: "ไทยถูกแยกสองส่วน", color: RED, chips: [{ text: "ในเมือง", f: C6.two }, { text: "ทัพหลวง", f: C6.two + 8 }] },
    { f: C6.choice, tag: "พระเจ้าตากต้องเลือก", head: "พิษณุโลก หรือ ข้างหลัง?", color: GOLD, portrait: "taksin_king", chips: [{ text: "อยู่ช่วยพิษณุโลก", f: C6.choice + 50 }, { text: "กลับไปป้องกันข้างหลัง", f: C6.or }] },
    { f: C6.back, tag: "ทัพหลวงถอยไปบางข้าวตอก", head: "เสบียงหมดหวัง", color: RED },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const backK = interpolate(frame, [C6.dim, C6.dim + 20], [1, 0.2], clamp);
    return (
      <>
        <CityDot at={PL.plk} color={SIAM_C} r={16} />
        <PLK_RING />
        <CUT />
        {frame >= C6.relief + 20 && <Arrow points={NAN_UP} start={C6.relief + 30} end={C6.pakping + 20} color={GOLD} width={18} opacity={frame >= C6.back ? 0.35 : 1} />}
        {frame >= C6.pp && <g opacity={frame >= C6.back ? 0.4 : 1}><Stockades center={PL.pakping} n={1} r0={0} start={C6.pp} color={SIAM_C} /></g>}
        {frame >= C6.pp && frame < C6.end && <PointLabel at={PL.pakping} text="ปากพิง" start={C6.pp} color={GOLD} size={0.7} />}
        <RiverGlow points={NAN} k={interpolate(frame, [C6.battle, C6.battle + 15], [0, 0.6], clamp) * backK} color="#ffd36a" />
        {frame >= C6.trick + 20 && <Arrow points={AROUND} start={C6.split3k} end={C6.uthai + 20} color={BURMA_C} width={16} />}
        {frame >= C6.kp && <PointLabel at={PL.kamphaeng} text="กำแพงเพชร" start={C6.kp} color={RED} size={0.7} />}
        {frame >= C6.uthai && <PointLabel at={UTHAI} text="อุทัยธานี" start={C6.uthai} color={RED} size={0.7} />}
        {frame >= C6.rear && <Arrow points={[UTHAI, [100.1, 15.0], [100.2, 14.7]]} start={C6.rear + 20} end={C6.thon} color={BURMA_C} width={14} variant="dashed" />}
        {frame >= C6.back && <Arrow points={[PL.pakping, [100.3, 16.5], BKT]} start={C6.bkt} end={C6.bkt + 25} color={GOLD} width={14} />}
        {frame >= C6.bkt && <PointLabel at={BKT} text="บางข้าวตอก" start={C6.bkt} color={GOLD} size={0.7} />}
      </>
    );
  },
  Panels: () => (
    <>
      <FleetScene id="e3c6relief" anchor={[100.12, 15.7]} start={C6.relief} end={C6.pakping + 14} n={5} />
      <RoyalCampScene id="e3c6pp" anchor={PL.pakping} start={C6.pakping} end={C6.battle + 14} />
      <RiverWarScene id="e3c6battle" anchor={PL.pakping} start={C6.battle} end={C6.trick + 14} />
      <MarchScene id="e3c6trick" anchor={PL.kamphaeng} start={C6.trick} end={C6.rear + 14} />
      <AssaultScene id="e3c6rear" anchor={UTHAI} start={C6.rear} end={C6.split + 14} breakAt={1e9} attackers="burma" wood />
      <SiegeScene id="e3c6split" anchor={PL.plk} start={C6.split} end={C6.choice + 14} />
      <RoyalCampScene id="e3c6choice" anchor={PL.pakping} start={C6.choice} end={C6.back + 14} />
      <RetreatBoatsScene id="e3c6back" anchor={BKT} start={C6.back} end={C6.end + 14} />
    </>
  ),
  sfx: [
    [C6.relief, SFX.whoosh, 0.35],
    [C6.tak, SFX.swell, 0.3],
    [C6.pp, SFX.pop, 0.35],
    [C6.battle, SFX.hit, 0.4],
    [C6.split3k, SFX.whoosh, 0.35],
    [C6.thon, SFX.hit, 0.45],
    [C6.two, SFX.hit, 0.45],
    [C6.or, SFX.pop, 0.35],
    [C6.bkt, SFX.whoosh, 0.3],
  ],
};

const C7 = {
  hunger: B.hunger.start,
  starve: wf("hunger", "อดอยาก", 0.8),
  decide: B.decide.start,
  hardest: wf("decide", "ยาก", 0.85),
  quiz: B.quiz2.start,
  bo: B.breakout.start,
  hit: wf("breakout", "ตี", 0.35),
  east: wf("breakout", "ตะวัน", 0.6),
  pb: wf("breakout", "เพชรบูรณ์", 0.92),
  escaped: B.escaped.start,
  empty: B.empty.start,
  nothing: wf("empty", "ว่าง", 0.85),
  burned: B.burned.start,
  win: B.win.start,
  look: wf("win", "แผนที่", 0.85),
  end: B.stuck.start,
};
const BREAK: [number, number][] = [PL.plk, [100.45, 16.88], [100.75, 16.8], [101.0, 16.6], PL.phetchabun];

export const e3c7: Chapter = {
  name: "ตีฝ่าวงล้อม",
  from: C7.hunger,
  to: C7.end,
  cams: (w, h) => [
    { frame: C7.hunger, cam: view(RIVERWAR, w, h, 0.9, 0.06) },
    { frame: C7.hunger + 30, cam: view(VW.plk, w, h, 0.95, 0.06) },
    { frame: C7.bo + 30, cam: view(VW.plk, w, h, 0.95, 0.06) },
    { frame: C7.east, cam: view(EAST, w, h, 0.9, 0.06) },
    { frame: C7.empty, cam: view(EAST, w, h, 0.9, 0.06) },
    { frame: C7.empty + 30, cam: view(VW.plk, w, h, 0.95, 0.06) },
    { frame: C7.look - 10, cam: view(VW.plk, w, h, 0.95, 0.06) },
    { frame: C7.look + 25, cam: view(HOOKVIEW, w, h, 0.85, 0.08) },
  ],
  years: [[C7.hunger, "ต้นปี 2319"]],
  heads: [
    { f: C7.hunger, tag: "ในเมือง ข้าวเริ่มหมด", head: "ทหารและชาวเมืองอดอยาก", color: RED, chips: [{ text: "ล้อมมาหลายเดือน", f: C7.starve }] },
    { f: C7.decide, tag: "สองพี่น้องรู้ว่า", head: "อยู่ต่อ = อดตาย หรือยอมแพ้", color: GOLD, portrait: "chakri" },
    { f: C7.hardest, tag: "จึงตัดสินใจ", head: "ทำสิ่งที่ยากที่สุด", color: GOLD, portrait: "surasi" },
    { f: C7.quiz, tag: "ถ้าคุณเป็นแม่ทัพในเมือง", head: "จะทำยังไง?", color: GOLD },
    { f: C7.bo, tag: "15 มี.ค. 2319", head: "ตีฝ่าวงล้อม", color: GOLD, portrait: "chakri", chips: [{ text: "ออกทางตะวันออก", f: C7.east }, { text: "มุ่งเพชรบูรณ์", f: C7.pb }] },
    { f: C7.escaped, tag: "แผนสำเร็จ", head: "ไม่ถูกจับ ไม่ถูกบดขยี้", color: GOLD },
    { f: C7.empty, tag: "พม่าเข้าเมืองได้", head: "แต่เมืองว่างเปล่า", color: RED },
    { f: C7.burned, tag: "พิษณุโลกถูกเผา", head: "เสียหายหนัก", color: RED },
    { f: C7.win, tag: "ฟังดูเหมือนพม่าชนะ", head: "แต่ดูบนแผนที่อีกครั้ง", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const taken = frame >= C7.empty + 20;
    return (
      <>
        <Stockades center={RING.center} n={RING.n} r0={0.06} start={-100} step={0} gapAt={C7.hit} out={C7.empty + 10} />
        <CUT />
        <CityDot at={PL.plk} color={taken ? BURMA_C : SIAM_C} r={16} />
        {frame >= C7.burned && <CityDot at={PL.plk} color="#ff7a1a" r={26} start={C7.burned} />}
        {frame >= C7.hit && <Arrow points={BREAK} start={C7.hit} end={C7.pb + 10} color={GOLD} width={24} opacity={frame >= C7.win ? 0.5 : 1} />}
        {frame >= C7.pb && <CityDot at={PL.phetchabun} color={SIAM_C} r={14} start={C7.pb} />}
        {frame >= C7.pb && <PointLabel at={PL.phetchabun} text="เพชรบูรณ์" start={C7.pb} color={GOLD} size={0.75} />}
        {frame >= C7.look && <Zones k={{ burma: interpolate(frame, [C7.look, C7.look + 20], [0, 0.7], clamp) }} />}
        {frame >= C7.look && <Arrow points={INVADE} start={C7.look} end={C7.look + 30} color={BURMA_C} width={18} />}
      </>
    );
  },
  Panels: () => (
    <>
      <GranaryScene id="e3c7hunger" anchor={PL.plk} start={C7.hunger} end={C7.decide + 14} from={C7.hunger} to={C7.starve} hungry />
      <DefendersScene id="e3c7decide" anchor={PL.plk} start={C7.decide} end={C7.quiz + 14} />
      <SiegeScene id="e3c7quiz" anchor={PL.plk} start={C7.quiz} end={C7.bo + 14} night />
      <BreakoutScene id="e3c7bo" anchor={PL.plk} start={C7.bo} end={C7.escaped + 14} breakAt={C7.hit} />
      <RefugeeScene id="e3c7esc" anchor={PL.phetchabun} start={C7.escaped} end={C7.empty + 14} cloth="#2f4f86" />
      <TakenCityScene id="e3c7empty" anchor={PL.plk} start={C7.empty} end={C7.burned + 14} />
      <TakenCityScene id="e3c7burn" anchor={PL.plk} start={C7.burned} end={C7.win + 14} burn={1} />
      <MarchScene id="e3c7win" anchor={PL.plk} start={C7.win} end={C7.end + 14} />
    </>
  ),
  sfx: [
    [C7.hunger, SFX.swell, 0.25],
    [C7.hardest, SFX.hit, 0.4],
    [C7.quiz, SFX.riser, 0.25],
    [C7.hit, SFX.hit, 0.55],
    [C7.east - 6, SFX.whoosh, 0.35],
    [C7.pb, SFX.pop, 0.35],
    [C7.empty + 20, SFX.hit, 0.4],
    [C7.burned, SFX.whoosh, 0.3],
    [C7.look, SFX.whoosh, 0.35],
  ],
};

const C8 = {
  stuck: B.stuck.start,
  far: wf("stuck", "ห่าง", 0.5),
  low: wf("stuck", "เสบียง", 0.8),
  forage: B.forage.start,
  ambush: wf("forage", "ทหารไทย", 0.72),
  news: B.news.start,
  king: B.hsinbyushin.start,
  died: wf("hsinbyushin", "สวรรคต", 0.95),
  recall: B.recall.start,
  rush: wf("recall", "รีบ", 0.3),
  leftBehind: wf("recall", "ทิ้ง", 0.5),
  loot: wf("recall", "เชลย", 0.75),
  left: B.left.start,
  pursue: B.pursue.start,
  scatter: wf("pursue", "แตก", 0.8),
  end: B.end.start,
  fin: B.answer.start,
};

export const e3c8: Chapter = {
  name: "ตอนจบที่ไม่มีใครคาด",
  from: C8.stuck,
  to: C8.fin,
  cams: (w, h) => [
    { frame: C8.stuck, cam: view(HOOKVIEW, w, h, 0.85, 0.08) },
    { frame: C8.stuck + 30, cam: view(LONG, w, h, 0.8, 0.08) },
    { frame: C8.forage, cam: view(LONG, w, h, 0.8, 0.08) },
    { frame: C8.forage + 30, cam: view(VW.plkWide, w, h, 0.9, 0.06) },
    { frame: C8.news - 6, cam: view(VW.plkWide, w, h, 0.9, 0.06) },
    { frame: C8.news + 25, cam: view(AVA, w, h, 0.8, 0.08) },
    { frame: C8.recall, cam: view(AVA, w, h, 0.8, 0.08) },
    { frame: C8.recall + 30, cam: view(LONG, w, h, 0.8, 0.08) },
    { frame: C8.end, cam: view(LONG, w, h, 0.8, 0.08) },
    { frame: C8.end + 30, cam: view(VW.siam, w, h, 0.66, 0.1) },
  ],
  years: [[C8.stuck, "2319"]],
  heads: [
    { f: C8.stuck, tag: "ทัพพม่าหลายหมื่นคน", head: "อยู่ลึกกลางแผ่นดินไทย", color: RED },
    { f: C8.far, tag: "ห่างบ้าน", head: "หลายร้อยกิโลเมตร", color: RED, chips: [{ text: "เสบียงพม่าเริ่มหมด", f: C8.low }] },
    { f: C8.forage, tag: "ชาวบ้านหนีเข้าป่า", head: "หาข้าวในพื้นที่ไม่ได้", color: RED, chips: [{ text: "ทหารไทยดักตีรอบด้าน", f: C8.ambush }] },
    { f: C8.news, tag: "แล้วข่าวหนึ่งก็มาถึง", head: "ข่าวจากกรุงอังวะ", color: RED },
    { f: C8.king, tag: "มิถุนายน 2319", head: "พระเจ้ามังระสวรรคต", color: RED, portrait: "hsinbyushin" },
    { f: C8.recall, tag: "กษัตริย์องค์ใหม่", head: "เรียกอะแซหวุ่นกี้กลับ", color: RED, portrait: "azaewungyi", chips: [{ text: "ทิ้งทัพที่เหลือ", f: C8.leftBehind }, { text: "ได้แค่เชลยกับทรัพย์สิน", f: C8.loot }] },
    { f: C8.left, tag: "ทัพที่ถูกทิ้งไว้", head: "ไม่มีแม่ทัพใหญ่ ไม่มีเสบียง", color: RED },
    { f: C8.pursue, tag: "ทัพไทยไล่ตี", head: "ทัพพม่าตกค้างแตกกระจาย", color: GOLD },
    { f: C8.end, tag: "จบศึก", head: "พม่ายึดแผ่นดินไทยไว้ไม่ได้", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const redOut = interpolate(frame, [C8.pursue, C8.end], [1, 0], clamp);
    return (
      <>
        <Zones k={{ burma: 0.6, siam: interpolate(frame, [C8.end, C8.end + 20], [0.3, 1], clamp) }} />
        {frame >= C8.stuck + 20 && frame < C8.recall + 40 && <Arrow points={[PL.ava, [96.8, 20.0], [97.6, 17.6], PL.maelamao, PL.tak, PL.plk]} start={C8.stuck + 20} end={C8.far + 20} color={BURMA_C} width={10} variant="dashed" opacity={0.5 + 0.5 * Math.abs(Math.sin(frame * 0.12))} />}
        <g opacity={redOut}>
          <CityDot at={PL.plk} color={BURMA_C} r={18} />
          {frame >= C8.left && [[99.6, 16.9], [100.6, 16.4], [99.9, 16.2], [100.9, 17.0]].map((p, i) => <CityDot key={i} at={p as [number, number]} color={BURMA_C} r={9} start={C8.left + i * 6} />)}
        </g>
        {frame >= C8.ambush && frame < C8.news + 20 && <Stockades center={PL.plk} n={8} r0={0.45} start={C8.ambush} step={4} color={SIAM_C} />}
        {frame >= C8.news && frame < C8.recall + 40 && <CityDot at={PL.ava} color={BURMA_C} r={16} start={C8.news} />}
        {frame >= C8.news && frame < C8.recall + 40 && <PointLabel at={PL.ava} text="อังวะ" start={C8.news} color={RED} size={0.8} />}
        {frame >= C8.rush && <Arrow points={[...INVADE].reverse()} start={C8.rush} end={C8.rush + 40} color={BURMA_C} width={18} variant="dashed" />}
        {frame >= C8.pursue && <Arrow points={[[100.6, 16.4], [99.9, 16.6], [99.3, 16.8]]} start={C8.pursue} end={C8.scatter} color={GOLD} width={16} />}
      </>
    );
  },
  Panels: () => (
    <>
      <HungryCampScene id="e3c8stuck" anchor={PL.plk} start={C8.stuck} end={C8.forage + 14} />
      <RefugeeScene id="e3c8forage" anchor={PL.plk} start={C8.forage} end={C8.news + 14} cloth="#6b5a44" />
      <MessengerScene id="e3c8news" anchor={PL.ava} start={C8.news} end={C8.king + 14} />
      <BurmaCourtScene id="e3c8king" anchor={PL.ava} start={C8.king} end={C8.recall + 14} mourning />
      <MarchScene id="e3c8recall" anchor={PL.maelamao} start={C8.recall} end={C8.left + 14} />
      <HungryCampScene id="e3c8left" anchor={PL.plk} start={C8.left} end={C8.pursue + 14} />
      <ChaseScene id="e3c8pursue" anchor={PL.kamphaeng} start={C8.pursue} end={C8.end + 14} />
      <PeopleScene id="e3c8end" anchor={PL.thon} start={C8.end} end={C8.fin + 14} mode="cheer" />
    </>
  ),
  sfx: [
    [C8.stuck, SFX.whoosh, 0.3],
    [C8.low, SFX.tick, 0.3],
    [C8.ambush, SFX.pop, 0.3],
    [C8.news - 6, SFX.riser, 0.3],
    [C8.died, SFX.hit, 0.55],
    [C8.rush, SFX.whoosh, 0.35],
    [C8.scatter, SFX.hit, 0.4],
    [C8.end, SFX.swell, 0.4],
  ],
};

const C9 = {
  answer: B.answer.start,
  a1: B.a1.start,
  a2: B.a2.start,
  a3: B.a3.start,
  a4: B.a4.start,
  luck: wf("a4", "โชค", 0.4),
  lesson: B.lesson.start,
  war: wf("lesson", "แต่", 0.3),
  endure: wf("lesson", "ใคร", 0.9),
  poll: B.poll.start,
  type: wf("poll", "พิมพ์", 0.85),
  end: B.poll.end + 45,
};

// Closing poll: stay or break out?
const Poll = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < C9.poll + 10) return null;
  const k = spring({ frame: frame - C9.poll - 10, fps, config: { damping: 14 } });
  const btn = spring({ frame: frame - C9.type, fps, config: { damping: 9 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, transform: `scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k), fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${GOLD}`, borderRadius: 18 * s, padding: `${20 * s}px ${28 * s}px`, lineHeight: 1.35 }}>
        <div style={{ fontSize: 28 * s, fontWeight: 700, color: GOLD }}>ถ้าคุณเป็นเจ้าพระยาจักรี · ข้าวกำลังจะหมด</div>
        <div style={{ fontSize: 52 * s, fontWeight: 900, margin: `${4 * s}px 0 ${14 * s}px` }}>สู้ต่อ หรือ ฝ่าออก?</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 * s }}>
          {[["สู้ต่อในเมือง", RED], ["ตีฝ่าออกไป", GOLD]].map(([t, c]) => <div key={t} style={{ border: `${4 * s}px solid ${c}`, borderRadius: 12 * s, padding: `${14 * s}px`, textAlign: "center", fontSize: 38 * s, fontWeight: 900 }}>{t}</div>)}
        </div>
        <div style={{ textAlign: "center", fontSize: 30 * s, opacity: 0.85, marginTop: 12 * s }}>พิมพ์บอกในคอมเมนต์ได้เลย</div>
      </div>
      {frame >= C9.type && (
        <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.42, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `scale(${btn})`, background: RED, color: "#fff", borderRadius: 50 * s, padding: `${12 * s}px ${60 * s}px`, fontFamily: font, fontWeight: 900, fontSize: 48 * s }}>ติดตาม</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const e3c9: Chapter = {
  name: "คำตอบ",
  from: C9.answer,
  to: C9.end,
  cams: (w, h) => [
    { frame: C9.answer, cam: view(VW.siam, w, h, 0.66, 0.1) },
    { frame: C9.answer + 30, cam: view(HOOKVIEW, w, h, 0.85, 0.08) },
    { frame: C9.a3, cam: view(HOOKVIEW, w, h, 0.85, 0.08) },
    { frame: C9.a3 + 30, cam: view(LONG, w, h, 0.8, 0.08) },
    { frame: C9.lesson, cam: view(LONG, w, h, 0.8, 0.08) },
    { frame: C9.lesson + 30, cam: view(VW.siam, w, h, 0.66, 0.1) },
  ],
  years: [[C9.answer, "2318–2319"]],
  heads: [
    { f: C9.answer, tag: "คำถามของวันนี้", head: "แม่ทัพที่ชนะจีน ทำไมเอาไทยไม่ลง?", color: GOLD },
    { f: C9.a1, tag: "คำตอบ ①", head: "พิษณุโลกยื้อเวลา", stat: "ราว 4 เดือน", color: GOLD, chips: [{ text: "พม่าต้องกินเสบียงตัวเองทุกวัน", f: C9.a1 + 120 }] },
    { f: C9.a2, tag: "คำตอบ ②", head: "ไม่จมไปกับเมือง", color: GOLD, chips: [{ text: "ตีฝ่าออก รักษากำลังรบไว้", f: C9.a2 + 120 }] },
    { f: C9.a3, tag: "คำตอบ ③", head: "ยิ่งลึก ยิ่งเปราะ", color: GOLD, chips: [{ text: "เส้นเสบียงยาวเหยียด", f: C9.a3 + 120 }] },
    { f: C9.a4, tag: "คำตอบ ④", head: "โชค", color: GOLD, portrait: "hsinbyushin", chips: [{ text: "ศึกจบเร็วกว่าที่คิด", f: C9.luck + 60 }] },
    { f: C9.lesson, tag: "อะแซหวุ่นกี้", head: "ชนะการรบ แต่ไม่ชนะสงคราม", color: RED, portrait: "azaewungyi", chips: [{ text: "ชนะการรบ ✓", f: C9.lesson + 30 }, { text: "ชนะสงคราม ✕", f: C9.war + 20 }, { text: "ใครทนได้นานกว่า", f: C9.endure }] },
    { f: C9.poll, tag: "", head: "" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <Zones k={{ siam: 1, burma: 0.5 }} />
        {frame >= C9.a1 && frame < C9.a2 && <PLK_RING />}
        <CityDot at={PL.plk} color={SIAM_C} r={14} />
        {frame >= C9.a2 && frame < C9.a3 + 10 && <Arrow points={BREAK} start={C9.a2 + 20} end={C9.a2 + 60} color={GOLD} width={22} />}
        {frame >= C9.a3 && frame < C9.lesson + 20 && <Arrow points={[PL.ava, [96.8, 20.0], [97.6, 17.6], PL.maelamao, PL.tak, PL.plk]} start={C9.a3 + 20} end={C9.a3 + 70} color={BURMA_C} width={10} variant="dashed" opacity={0.5 + 0.5 * Math.abs(Math.sin(frame * 0.15))} />}
        {frame >= C9.a4 && frame < C9.lesson + 20 && <CityDot at={PL.ava} color={BURMA_C} r={14} start={C9.a4} />}
      </>
    );
  },
  Panels: () => (
    <>
      <DefendersScene id="e3c9answer" anchor={PL.plk} start={C9.answer} end={C9.a1 + 14} />
      <GranaryScene id="e3c9a1" anchor={PL.plk} start={C9.a1} end={C9.a2 + 14} from={C9.a1} to={C9.a2} />
      <BreakoutScene id="e3c9a2" anchor={PL.plk} start={C9.a2} end={C9.a3 + 14} breakAt={C9.a2 + 30} />
      <HungryCampScene id="e3c9a3" anchor={PL.plk} start={C9.a3} end={C9.a4 + 14} />
      <BurmaCourtScene id="e3c9a4" anchor={PL.ava} start={C9.a4} end={C9.lesson + 14} mourning />
      <SiegeScene id="e3c9lesson" anchor={PL.plk} start={C9.lesson} end={C9.poll + 14} />
      <BreakoutScene id="e3c9poll" anchor={PL.plk} start={C9.poll} end={C9.end + 30} breakAt={C9.poll + 60} />
    </>
  ),
  Screen: () => <Poll />,
  sfx: [
    [C9.answer, SFX.riser, 0.3],
    [C9.a1, SFX.pop, 0.4],
    [C9.a2, SFX.pop, 0.4],
    [C9.a3, SFX.pop, 0.4],
    [C9.a4, SFX.pop, 0.4],
    [C9.war + 20, SFX.hit, 0.45],
    [C9.poll + 10, SFX.pop, 0.4],
  ],
};
void RiverWarScene;
