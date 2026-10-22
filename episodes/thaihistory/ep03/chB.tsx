import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { FleetScene, LordScene, RiverFortScene } from "../ep02/scenes";
import { clamp, font, GOLD, QuizNews, RED, view, type Chapter } from "../news/kit";
import { B, BURMA_C, CityDot, SIAM_C, Stockades, wf, Zones } from "./beatsKit";
import { HOOKVIEW } from "./ch0";
import { INVADE, NAN, PL, VW } from "./places";
import { AssaultScene } from "../ep02/scenes";
import { ChronicleScene, DefendersScene, GranaryScene, MarchScene, RefugeeScene, RiverWarScene, SiegeScene, TruceScene } from "./scenes";

// Chapters 3–5 of episode 3: the march (march → quiz1), the siege (ring → cut), the two generals (meet → sankok).

// The Nan through Phitsanulok, drawn as a glowing band; `k` brightens it.
export const NAN_CITY: [number, number][] = [[100.17, 17.14], [100.22, 17.0], [100.26, 16.82], [100.29, 16.7], [100.3, 16.55], [100.32, 16.4]];
export const RiverGlow = ({ points, k, color = "#7fd0ff" }: { points: [number, number][]; k: number; color?: string }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const pts = points.map((p) => projection(p)).filter(Boolean) as [number, number][];
  const d = `M${pts.map((p) => p.join(",")).join(" L")}`;
  return (
    <g opacity={k}>
      <path d={d} fill="none" stroke={color} strokeWidth={22 * s} strokeOpacity={0.35} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `blur(${8 * s}px)` }} />
      <path d={d} fill="none" stroke={color} strokeWidth={6 * s} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// The siege ring around Phitsanulok as it stands after the creep (for later chapters).
export const RING = { center: PL.plk, n: 12, r: 0.075 };
export const SiegeRing = ({ out }: { out?: number }) => <Stockades center={RING.center} n={RING.n} r0={RING.r} start={-100} step={0} out={out} />;

const PASS = bbox([[98.0, 16.2], [99.5, 17.3]]);
const C3 = {
  march: B.march.start,
  men: wf("march", "ยก", 0.4),
  lamao: wf("march", "แม่", 0.75),
  tak: wf("march", "ตาก", 0.92),
  pass: B.pass.start,
  target: B.target.start,
  north: wf("target", "หัว", 0.45),
  sukho: B.sukho.start,
  flee: wf("sukho", "ผู้คน", 0.75),
  plk: B.plk.start,
  plkName: wf("plk", "พิษณุโลก", 0.8),
  city: B.city.start,
  gate: wf("city", "ประตู", 0.45),
  open: wf("city", "เปิด", 0.88),
  nan: B.nan.start,
  who: wf("nan", "ใคร", 0.65),
  defend: B.defend.start,
  chakri: wf("defend", "จักรี", 0.4),
  surasi: wf("defend", "สุร", 0.6),
  troops: wf("defend", "คุม", 0.75),
  odds: B.odds.start,
  quiz: B.quiz1.start,
  end: B.ring.start,
};

export const e3c3: Chapter = {
  name: "ทัพใหญ่ลงมา",
  from: C3.march,
  to: C3.end,
  cams: (w, h) => [
    { frame: C3.march, cam: view(HOOKVIEW, w, h, 0.85, 0.08) },
    { frame: C3.pass - 6, cam: view(HOOKVIEW, w, h, 0.85, 0.08) },
    { frame: C3.pass + 25, cam: view(PASS, w, h, 0.95, 0.06) },
    { frame: C3.target - 6, cam: view(PASS, w, h, 0.95, 0.06) },
    { frame: C3.target + 25, cam: view(HOOKVIEW, w, h, 0.85, 0.08) },
    { frame: C3.plk, cam: view(HOOKVIEW, w, h, 0.85, 0.08) },
    { frame: C3.plk + 35, cam: view(VW.plk, w, h, 0.95, 0.06) },
    { frame: C3.end, cam: view(VW.plk, w, h, 0.95, 0.06) },
  ],
  years: [[C3.march, "ปลายปี 2318"]],
  heads: [
    { f: C3.march, tag: "ปลายปี 2318", head: "อะแซหวุ่นกี้ยกทัพ", color: RED, portrait: "azaewungyi" },
    { f: C3.men, tag: "ทัพพม่า", head: "ข้ามช่องเขาแม่ละเมา", stat: "ราว 35,000", label: "คน", color: RED },
    { f: C3.pass, tag: "ด่านแม่ละเมา", head: "ทางเข้าของทัพพม่า", color: RED, chips: [{ text: "ใช้มาหลายครั้งในประวัติศาสตร์", f: C3.pass + 110 }] },
    { f: C3.target, tag: "เป้าหมาย", head: "หัวเมืองเหนือ", color: RED, chips: [{ text: "ไม่ใช่ธนบุรีโดยตรง", f: C3.target + 20 }] },
    { f: C3.sukho, tag: "ผ่านสุโขทัย", head: "ผู้คนหนีเข้าป่า", color: RED },
    { f: C3.plk, tag: "เมืองสำคัญที่สุดของภาคเหนือ", head: "พิษณุโลก", color: GOLD },
    { f: C3.city, tag: "เมืองสองฝั่งแม่น้ำน่าน", head: "ประตูสู่ภาคกลาง", color: GOLD, chips: [{ text: "ถ้าแตก ทางลงใต้เปิดโล่ง", f: C3.open - 20 }] },
    { f: C3.nan, tag: "ภาพที่ต้องจำไว้", head: "แม่น้ำน่าน", color: "#7fd0ff", chips: [{ text: "ใครคุมน้ำ คุมเสบียง", f: C3.who }] },
    { f: C3.chakri - 10, tag: "สองพี่น้องรักษาเมือง", head: "เจ้าพระยาจักรี", color: GOLD, portrait: "chakri" },
    { f: C3.surasi - 6, tag: "สองพี่น้องรักษาเมือง", head: "เจ้าพระยาสุรสีห์", color: GOLD, portrait: "surasi" },
    { f: C3.troops, tag: "ทหารในเมือง", head: "รักษาพิษณุโลก", stat: "≤ 10,000", label: "คน", color: GOLD },
    { f: C3.odds, tag: "ทหารพม่ามากกว่า", head: "ราว 3 เท่า", color: RED, chips: [{ text: "พม่า ~35,000", f: C3.odds + 20 }, { text: "ไทย ≤10,000", f: C3.odds + 35 }, { text: "แม่ทัพเพิ่งชนะจีน", f: wf("odds", "เพิ่ง", 0.8) }] },
    { f: C3.quiz, tag: "", head: "" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const north = frame >= C3.north && frame < C3.plk;
    return (
      <>
        <Zones k={{ siam: interpolate(frame, [C3.plk, C3.plk + 30], [0.6, 0], clamp), burma: interpolate(frame, [C3.plk, C3.plk + 30], [0.6, 0], clamp) }} />
        {frame < C3.plk + 40 && <Arrow points={INVADE} start={C3.men} end={C3.plk} color={BURMA_C} width={24} />}
        {frame >= C3.lamao && frame < C3.plk && <PointLabel at={PL.maelamao} text="ด่านแม่ละเมา" start={C3.lamao} color={RED} size={0.75} />}
        {frame >= C3.tak && frame < C3.plk && <PointLabel at={PL.tak} text="ตาก" start={C3.tak} color={RED} size={0.7} />}
        {frame >= C3.sukho && frame < C3.plk && <PointLabel at={PL.sukhothai} text="สุโขทัย" start={C3.sukho + 15} color={RED} size={0.7} />}
        {north && [PL.tak, PL.sukhothai, PL.kamphaeng, PL.plk].map((p, i) => <CityDot key={i} at={p} color={BURMA_C} r={10} start={C3.north + i * 6} />)}
        <CityDot at={PL.plk} color={SIAM_C} r={16} start={C3.plk} />
        {frame >= C3.plkName && <PointLabel at={PL.plk} text="พิษณุโลก" start={C3.plkName} color={GOLD} size={0.85} />}
        <RiverGlow points={NAN_CITY} k={interpolate(frame, [C3.city + 30, C3.city + 50], [0, 0.6], clamp) + interpolate(frame, [C3.nan + 40, C3.nan + 60, C3.defend, C3.defend + 20], [0, 0.4, 0.4, 0], clamp)} />
        {frame >= C3.open && frame < C3.nan && <Arrow points={[PL.plk, [100.29, 16.7], [100.3, 16.5]]} start={C3.open} end={C3.open + 20} color={RED} width={14} variant="dashed" />}
      </>
    );
  },
  Panels: () => (
    <>
      <MarchScene id="e3c3march" anchor={PL.maelamao} start={C3.march} end={C3.pass + 14} />
      <MarchScene id="e3c3pass" anchor={PL.maelamao} start={C3.pass} end={C3.target + 14} />
      <LordScene id="e3c3target" anchor={PL.sukhothai} start={C3.target} end={C3.sukho + 14} banner={GOLD} />
      <RefugeeScene id="e3c3sukho" anchor={PL.sukhothai} start={C3.sukho} end={C3.plk + 14} cloth="#6b5a44" />
      <DefendersScene id="e3c3plk" anchor={PL.plk} start={C3.plk} end={C3.city + 14} />
      <RiverFortScene id="e3c3city" anchor={PL.plk} start={C3.city} end={C3.nan + 14} />
      <FleetScene id="e3c3nan" anchor={PL.plk} start={C3.nan} end={C3.defend + 14} n={3} />
      <DefendersScene id="e3c3def" anchor={PL.plk} start={C3.defend} end={C3.odds + 14} />
      <SiegeScene id="e3c3odds" anchor={PL.plk} start={C3.odds} end={C3.quiz + 14} />
    </>
  ),
  Screen: () => <QuizNews title="ทายกันหน่อย" question="ทหารน้อยกว่า 3 เท่า ต้านได้นานแค่ไหน?" options={["1 สัปดาห์", "1 เดือน", "นานกว่านั้น"]} answer={2} start={C3.quiz} reveal={B.quiz1.end - 6} end={C3.end + 24} />,
  sfx: [
    [C3.march, SFX.whoosh, 0.35],
    [C3.men, SFX.hit, 0.45],
    [C3.pass - 6, SFX.whoosh, 0.3],
    [C3.target + 20, SFX.pop, 0.3],
    [C3.plk + 30, SFX.whoosh, 0.35],
    [C3.open, SFX.hit, 0.35],
    [C3.chakri - 10, SFX.pop, 0.35],
    [C3.surasi - 6, SFX.pop, 0.35],
    [C3.odds, SFX.hit, 0.45],
    [C3.quiz, SFX.riser, 0.25],
    [B.quiz1.end - 6, SFX.hit, 0.5],
  ],
};

const C4 = {
  ring: B.ring.start,
  camps: wf("ring", "ตั้ง", 0.35),
  closed: wf("ring", "ปิด", 0.8),
  creep: B.creep.start,
  sortie: B.sortie.start,
  out: wf("sortie", "ยก", 0.7),
  stale: B.stalemate.start,
  no: wf("stalemate", "แตก", 0.3),
  food: B.food.start,
  rice: wf("food", "ข้าว", 0.95),
  supply: B.supply.start,
  river: wf("supply", "ลำน้ำ", 0.75),
  cut: B.cut.start,
  cutAt: wf("cut", "ตัด", 0.7),
  end: B.meet.start,
};
const SUPPLY_UP: [number, number][] = [...NAN].reverse();
const CUTPOINT: [number, number] = [100.3, 16.6];

export const e3c4: Chapter = {
  name: "ล้อมเมือง",
  from: C4.ring,
  to: C4.end,
  cams: (w, h) => [
    { frame: C4.ring, cam: view(VW.plk, w, h, 0.95, 0.06) },
    { frame: C4.supply, cam: view(VW.plk, w, h, 0.95, 0.06) },
    { frame: C4.supply + 30, cam: view(VW.plkWide, w, h, 0.9, 0.06) },
    { frame: C4.end, cam: view(VW.plkWide, w, h, 0.9, 0.06) },
  ],
  years: [[C4.ring, "2318"]],
  heads: [
    { f: C4.ring + 10, tag: "อะแซหวุ่นกี้ไม่รีบบุก", head: "ตั้งค่ายล้อมทีละค่าย", color: RED, portrait: "azaewungyi" },
    { f: C4.closed, tag: "วงล้อม", head: "ปิดทางเข้าออกทุกทาง", color: RED },
    { f: C4.creep, tag: "ทีละนิด", head: "ขยับค่ายเข้าใกล้กำแพง", color: RED },
    { f: C4.sortie, tag: "ฝ่ายไทยไม่นั่งรอ", head: "ออกตีค่ายพม่า", color: GOLD, portrait: "surasi" },
    { f: C4.stale, tag: "ออกตีกี่ครั้ง", head: "ตีค่ายพม่าไม่แตก", color: RED, chips: [{ text: "ใครทนได้นานกว่า?", f: wf("stalemate", "แข่ง", 0.7) }] },
    { f: C4.food, tag: "สิ่งที่ตัดสินการล้อมเมือง", head: "ไม่ใช่ดาบ แต่เป็นข้าว", color: GOLD },
    { f: C4.supply, tag: "เสบียงเข้าได้ทางเดียว", head: "ตามลำน้ำน่าน จากทางใต้", color: "#7fd0ff" },
    { f: C4.cut, tag: "อะแซหวุ่นกี้รู้ดี", head: "ตั้งค่ายตัดลำน้ำ", color: RED, portrait: "azaewungyi" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const cutK = interpolate(frame, [C4.cutAt, C4.cutAt + 15], [1, 0.2], clamp);
    return (
      <>
        <CityDot at={PL.plk} color={SIAM_C} r={16} />
        <PointLabel at={PL.plk} text="พิษณุโลก" start={C4.ring - 30} color={GOLD} size={0.8} />
        <Stockades center={PL.plk} n={RING.n} r0={0.13} r1={RING.r} start={C4.camps} step={6} creepFrom={C4.creep} creepTo={B.creep.end + 10} />
        {frame >= C4.out && frame < C4.food && [0, 1, 2].map((i) => {
          const a = 0.3 + (i * Math.PI * 2) / 3;
          return <Arrow key={i} points={[[PL.plk[0] + Math.cos(a) * 0.02, PL.plk[1] + Math.sin(a) * 0.02], [PL.plk[0] + Math.cos(a) * 0.065, PL.plk[1] + Math.sin(a) * 0.062]]} start={C4.out + i * 8} end={C4.out + i * 8 + 15} color={GOLD} width={12} opacity={frame > C4.no ? 0.4 : 1} />;
        })}
        <RiverGlow points={NAN} k={interpolate(frame, [C4.river, C4.river + 20], [0, 0.8], clamp) * cutK} />
        {frame >= C4.river && <Arrow points={SUPPLY_UP} start={C4.river} end={C4.river + 40} color={GOLD} width={14} opacity={cutK} />}
        {frame >= C4.cut && <Stockades center={CUTPOINT} n={3} r0={0.03} start={C4.cut + 30} step={5} />}
        {frame >= C4.cutAt && <PointLabel at={CUTPOINT} text="ค่ายตัดลำน้ำ" start={C4.cutAt} color={RED} size={0.7} />}
      </>
    );
  },
  Panels: () => (
    <>
      <SiegeScene id="e3c4ring" anchor={PL.plk} start={C4.ring} end={C4.sortie + 14} />
      <AssaultScene id="e3c4sortie" anchor={PL.plk} start={C4.sortie} end={C4.stale + 14} breakAt={1e9} wood />
      <SiegeScene id="e3c4stale" anchor={PL.plk} start={C4.stale} end={C4.food + 14} night />
      <GranaryScene id="e3c4food" anchor={PL.plk} start={C4.food} end={C4.supply + 14} from={C4.food + 20} to={C4.supply} />
      <FleetScene id="e3c4supply" anchor={[100.3, 16.4]} start={C4.supply} end={C4.cut + 14} n={4} />
      <RiverWarScene id="e3c4cut" anchor={CUTPOINT} start={C4.cut} end={C4.end + 14} />
    </>
  ),
  sfx: [
    [C4.camps, SFX.tick, 0.3],
    [C4.closed, SFX.hit, 0.4],
    [C4.creep, SFX.riser, 0.2],
    [C4.out, SFX.whoosh, 0.35],
    [C4.no, SFX.hit, 0.45],
    [C4.rice, SFX.pop, 0.35],
    [C4.river, SFX.whoosh, 0.3],
    [C4.cutAt, SFX.hit, 0.5],
  ],
};

const C5 = {
  meet: B.meet.start,
  truce: B.truce.start,
  see: wf("truce", "พบ", 0.4),
  look: B.look.start,
  azae: wf("look", "อะ", 0.45),
  quote: B.quote.start,
  respect: B.respect.start,
  resume: B.resume.start,
  tighter: wf("resume", "วงล้อม", 0.75),
  sankok: B.sankok.start,
  maybe: wf("sankok", "อาจ", 0.8),
  end: B.relief.start,
};

// "(ถอดความ)" quote card for Azaewungyi's line.
const QuoteCard = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < C5.quote - 4 || frame > C5.respect + 10) return null;
  const k = spring({ frame: frame - C5.quote + 4, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, transform: `scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k) * interpolate(frame, [C5.respect, C5.respect + 10], [1, 0], clamp), fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${RED}`, borderRadius: 18 * s, padding: `${20 * s}px ${30 * s}px`, lineHeight: 1.45, display: "flex", gap: 22 * s, alignItems: "center" }}>
        <Img src={staticFile("portraits/thaihistory/azaewungyi.jpg")} style={{ width: 150 * s, height: 150 * s, borderRadius: 12 * s, objectFit: "cover", border: `${2 * s}px solid ${RED}` }} />
        <div>
          <div style={{ fontSize: 26 * s, fontWeight: 700, color: "#ff8a80" }}>อะแซหวุ่นกี้ · (ถอดความ)</div>
          <div style={{ fontSize: 50 * s, fontWeight: 900, marginTop: 6 * s }}>“ท่านผู้นี้ รูปก็งาม ฝีมือก็เข้มแข็ง จงรักษาตัวให้ดี”</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const e3c5: Chapter = {
  name: "สองแม่ทัพพบกัน",
  from: C5.meet,
  to: C5.end,
  cams: (w, h) => [
    { frame: C5.meet, cam: view(VW.plkWide, w, h, 0.9, 0.06) },
    { frame: C5.meet + 30, cam: view(VW.plk, w, h, 0.95, 0.06) },
    { frame: C5.end, cam: view(VW.plk, w, h, 0.95, 0.06) },
  ],
  years: [[C5.meet, "2318–2319"]],
  heads: [
    { f: C5.meet, tag: "เรื่องที่คนไทยจำได้", head: "ตามพงศาวดารฉบับหลัง", color: GOLD },
    { f: C5.truce, tag: "อะแซหวุ่นกี้ขอพักรบ", head: "ขอพบแม่ทัพไทย", color: RED, portrait: "azaewungyi" },
    { f: C5.look, tag: "ออกไปพบ", head: "เจ้าพระยาจักรี", color: GOLD, portrait: "chakri" },
    { f: C5.quote, tag: "", head: "" },
    { f: C5.respect, tag: "ตามที่พงศาวดารเล่า", head: "ศัตรูยอมรับฝีมือ", color: GOLD, portrait: "chakri" },
    { f: C5.resume, tag: "พักรบจบ", head: "วงล้อมแน่นขึ้นกว่าเดิม", color: RED },
    { f: C5.sankok, tag: "เหมือนฉากในสามก๊ก?", head: "ข้อสังเกตของนักประวัติศาสตร์", color: GOLD, chips: [{ text: "มีในพงศาวดารฉบับหลัง", f: C5.sankok + 110 }, { text: "ไม่มีในฉบับที่เก่ากว่า", f: C5.maybe }] },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <CityDot at={PL.plk} color={SIAM_C} r={16} />
        <Stockades center={PL.plk} n={RING.n} r0={RING.r} r1={0.06} start={-100} step={0} creepFrom={C5.tighter} creepTo={C5.tighter + 30} />
        {frame >= C5.truce && frame < C5.resume && (
          <g opacity={interpolate(frame, [C5.truce, C5.truce + 15, C5.resume - 10, C5.resume], [0, 1, 1, 0], clamp)}>
            <PointLabel at={[PL.plk[0] + 0.05, PL.plk[1] - 0.05]} text="พักรบ" start={C5.truce} color="#f4f1e8" size={0.75} />
          </g>
        )}
        <Stockades center={[100.3, 16.6]} n={3} r0={0.03} start={-100} step={0} />
      </>
    );
  },
  Panels: () => (
    <>
      <ChronicleScene id="e3c5meet" anchor={PL.plk} start={C5.meet} end={C5.truce + 14} stamp="ตามพงศาวดารฉบับหลัง" />
      <TruceScene id="e3c5truce" anchor={PL.plk} start={C5.truce} end={C5.resume + 14} bowAt={C5.quote} />
      <SiegeScene id="e3c5resume" anchor={PL.plk} start={C5.resume} end={C5.sankok + 14} night />
      <ChronicleScene id="e3c5sankok" anchor={PL.plk} start={C5.sankok} end={C5.end + 14} stamp="สามก๊ก?" />
    </>
  ),
  Screen: () => <QuoteCard />,
  sfx: [
    [C5.meet, SFX.swell, 0.3],
    [C5.see, SFX.pop, 0.3],
    [C5.azae, SFX.pop, 0.3],
    [C5.quote - 4, SFX.swell, 0.35],
    [C5.tighter, SFX.hit, 0.4],
    [C5.maybe, SFX.pop, 0.3],
  ],
};
void RefugeeScene;
void bbox;
