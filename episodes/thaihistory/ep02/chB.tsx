import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, font, GOLD, QuizNews, RED, view, type Chapter } from "../news/kit";
import { B, FACTIONS, wf } from "./beatsKit";
import { PL, VW, FactionStory, NAN_RIVER } from "./places";
import { CastleScene, ChineseCampScene, CrownScene, FleetScene, LordScene, MonkArmyScene, PeopleScene, RetreatBoatsScene, TAK } from "./scenes";

// Chapters 4–6 of episode 2: Bang Kung (bangkung → morale), the first Phitsanulok campaign (north → fangbig),
// Phimai (phimai → prince).

const C4 = {
  bk: B.bangkung.start,
  tavoy: wf("bangkung", "ทวาย", 0.48),
  ring: wf("bangkung", "ล้อม", 0.58),
  relief: B.relief.start,
  fleet: wf("relief", "ยก", 0.42),
  broke: wf("relief", "จน", 0.95),
  chinese: B.chinese.start,
  morale: B.morale.start,
  end: B.north.start,
};

export const e2c4: Chapter = {
  name: "ศึกบางกุ้ง",
  from: C4.bk,
  to: C4.end,
  cams: (w, h) => [
    { frame: C4.bk, cam: view(VW.thon, w, h, 1.4) },
    { frame: C4.bk + 35, cam: view(VW.west, w, h, 1, 0.08) },
    { frame: C4.morale, cam: view(VW.west, w, h, 1, 0.08) },
    { frame: C4.morale + 35, cam: view(VW.siam, w, h, 0.66, 0.1) },
  ],
  years: [[C4.bk, "2310–2311"]],
  heads: [
    { f: C4.bk, tag: "ไม่นานหลังตั้งธนบุรี", head: "พม่ายังไม่จบ", color: RED },
    { f: C4.ring, tag: "ค่ายบางกุ้ง · สมุทรสงคราม", head: "ถูกทัพพม่าล้อม", color: RED },
    { f: C4.relief, tag: "ค่ายเกือบแตก", head: "พระเจ้าตากยกทัพเรือไปเอง", color: TAK, portrait: "taksin_king" },
    { f: C4.broke, tag: "ศึกบางกุ้ง", head: "พม่าแตกพ่าย", color: TAK },
    { f: C4.chinese, tag: "ทหารในค่าย", head: "คนจีนที่มาเข้าด้วย", color: TAK, portrait: "chinese_merchant" },
    { f: C4.morale, tag: "ชนะพม่าครั้งแรก", head: "หลังขึ้นครองราชย์", color: TAK },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        {frame >= C4.tavoy && frame < C4.morale + 10 && (
          <>
            <Arrow points={[PL.tavoy, [98.9, 13.8], [99.5, 13.6], PL.bangkung]} start={C4.tavoy} end={C4.ring + 10} color={RED} width={20} />
            <PointLabel at={PL.tavoy} text="ทวาย" start={C4.tavoy} color={RED} size={0.7} />
            <PointLabel at={PL.bangkung} text="ค่ายบางกุ้ง" start={C4.ring} color={GOLD} size={0.8} />
          </>
        )}
        {frame >= C4.fleet && frame < C4.morale + 10 && <Arrow points={[PL.thon, [100.3, 13.5], [100.1, 13.43], PL.bangkung]} start={C4.fleet} end={C4.fleet + 35} color={TAK} width={18} />}
        {frame >= C4.broke && frame < C4.morale + 10 && <Arrow points={[PL.bangkung, [99.4, 13.7], [98.8, 13.85]]} start={C4.broke} end={C4.broke + 30} color={RED} width={12} variant="dashed" />}
        {frame >= C4.morale + 20 && <FactionStory />}
      </>
    );
  },
  Panels: () => (
    <>
      <ChineseCampScene id="e2c4camp" anchor={PL.bangkung} start={C4.bk + 10} end={C4.relief + 14} />
      <FleetScene id="e2c4fleet" anchor={PL.bangkung} start={C4.relief} end={C4.broke + 14} n={5} />
      <ChineseCampScene id="e2c4won" anchor={PL.bangkung} start={C4.broke} end={C4.morale + 14} relieved={1} />
      <PeopleScene id="e2c4cheer" anchor={PL.thon} start={C4.morale} end={C4.end + 14} mode="cheer" />
    </>
  ),
  sfx: [
    [C4.bk, SFX.whoosh, 0.35],
    [C4.ring, SFX.hit, 0.4],
    [C4.fleet, SFX.whoosh, 0.35],
    [C4.broke, SFX.hit, 0.55],
    [C4.morale, SFX.swell, 0.3],
  ],
};

const C5 = {
  north: B.north.start,
  fleet: wf("north", "ยก", 0.84),
  why: B.whyfirst.start,
  gate: wf("whyfirst", "ประตู", 0.57),
  quiz: B.quiz2.start,
  lose: B.lose.start,
  no: wf("lose", "แพ้", 0.1),
  koei: wf("lose", "เกย", 0.25),
  shot: wf("lose", "พระเจ้า", 0.62),
  retreat: B.retreat.start,
  back: wf("retreat", "ถอย", 0.75),
  ruang: B.ruang.start,
  king: wf("ruang", "ตั้ง", 0.53),
  died: wf("ruang", "แต่", 0.7),
  merge: B.merge.start,
  eaten: wf("merge", "กลืน", 0.55),
  four: wf("merge", "เหลือ", 0.82),
  big: B.fangbig.start,
  end: B.phimai.start,
};

// "ถอย ≠ แพ้" big card.
const RetreatCard = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < C5.back || frame > C5.ruang + 4) return null;
  const k = interpolate(frame, [C5.back, C5.back + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: interpolate(frame, [C5.ruang - 8, C5.ruang + 4], [1, 0], clamp) }}>
      <div style={{ transform: `scale(${k})`, background: "rgba(8,14,26,0.85)", border: `${8 * s}px solid ${GOLD}`, borderRadius: 20 * s, padding: `${10 * s}px ${44 * s}px`, color: GOLD, fontFamily: font, fontWeight: 900, fontSize: 110 * s }}>ถอย ≠ แพ้</div>
    </AbsoluteFill>
  );
};

export const e2c5: Chapter = {
  name: "พิษณุโลกครั้งแรก",
  from: C5.north,
  to: C5.end,
  cams: (w, h) => [
    { frame: C5.north, cam: view(VW.siam, w, h, 0.66, 0.1) },
    { frame: C5.north + 35, cam: view(VW.north, w, h, 0.9, 0.06) },
    { frame: C5.end, cam: view(VW.north, w, h, 0.9, 0.06) },
  ],
  years: [[C5.north, "2311"]],
  heads: [
    { f: C5.north, tag: "พ.ศ. 2311", head: "บุกพิษณุโลก", color: TAK, portrait: "taksin_king" },
    { f: C5.why, tag: "ทำไมพิษณุโลกก่อน", head: "ประตูขึ้นเหนือ", color: TAK, chips: [{ text: "ใกล้สุดตามลำน้ำ", f: C5.why + 60 }, { text: "เปิดทางไปเจ้าพระฝาง", f: C5.gate + 20 }] },
    { f: C5.quiz, tag: "", head: "" },
    { f: C5.lose + 30, tag: "ตำบลเกยไชย", head: "แพ้ ถูกยิงที่หน้าแข้ง", color: RED, portrait: "taksin_king" },
    { f: C5.retreat, tag: "แพ้ศึกแรกหนัก", head: "ถอยไปตั้งหลักใหม่", color: GOLD },
    { f: C5.ruang, tag: "เจ้าพระยาพิษณุโลก", head: "ตั้งตัวเป็นกษัตริย์", color: FACTIONS.plk.color, portrait: "ruang" },
    { f: C5.died, tag: "ไม่กี่วันหลังตั้งตัว", head: "ถึงแก่พิราลัย", color: FACTIONS.plk.color, portrait: "ruang" },
    { f: C5.merge, tag: "ก๊กพิษณุโลกไร้ผู้นำ", head: "เจ้าพระฝางกลืนไป", color: FACTIONS.fang.color, stat: (f) => (f >= C5.four ? "4 ก๊ก" : "5 ก๊ก"), label: "เหลืออยู่", portrait: "fang" },
    { f: C5.big, tag: "ได้ทั้งคนทั้งอาวุธ", head: "ก๊กใหญ่ที่สุด", color: FACTIONS.fang.color, portrait: "fang" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <FactionStory focus={frame >= C5.merge ? "fang" : frame >= C5.north + 35 ? "plk" : undefined} />
        {frame >= C5.fleet && frame < C5.retreat && <Arrow points={NAN_RIVER} start={C5.fleet} end={C5.why + 50} color={TAK} width={16} />}
        {frame >= C5.koei && frame < C5.ruang && <PointLabel at={PL.koeichai} text="เกยไชย" start={C5.koei} color={RED} size={0.8} />}
        {frame >= C5.shot && frame < C5.ruang && <Arrow points={[PL.koeichai, [100.13, 15.5], PL.chainat]} start={C5.shot + 20} end={C5.shot + 50} color={TAK} width={12} variant="dashed" />}
        {frame >= C5.north + 30 && frame < C5.end && <PointLabel at={PL.plk} text="พิษณุโลก" start={C5.north + 30} color={FACTIONS.plk.color} size={0.8} />}
      </>
    );
  },
  Panels: () => (
    <>
      <FleetScene id="e2c5up" anchor={PL.plk} start={C5.north} end={C5.lose + 14} n={4} sky={["#7aa0c4", "#dbeef2"]} />
      <RetreatBoatsScene id="e2c5lose" anchor={PL.koeichai} start={C5.lose} end={C5.ruang + 14} />
      <CrownScene id="e2c5ruang" anchor={PL.plk} start={C5.ruang} end={C5.died + 14} />
      <LordScene id="e2c5mourn" anchor={PL.plk} start={C5.died} end={C5.merge + 14} banner="#5a6a7a" />
      <MonkArmyScene id="e2c5fang" anchor={PL.fang} start={C5.merge} end={C5.end + 14} />
    </>
  ),
  Screen: () => (
    <>
      <QuizNews title="ทายกันหน่อย" question="ศึกพิษณุโลกครั้งแรก ชนะไหม?" options={["ชนะ", "แพ้"]} answer={1} start={C5.quiz} reveal={C5.no} end={C5.no + 30} />
      <RetreatCard />
    </>
  ),
  sfx: [
    [C5.north, SFX.whoosh, 0.35],
    [C5.fleet, SFX.whoosh, 0.3],
    [C5.quiz, SFX.riser, 0.25],
    [C5.no, SFX.hit, 0.55],
    [C5.shot, SFX.hit, 0.4],
    [C5.back, SFX.pop, 0.4],
    [C5.died, SFX.swell, 0.25],
    [C5.eaten, SFX.hit, 0.4],
  ],
};

const C6 = {
  ph: B.phimai.start,
  dk: B.dankhun.start,
  took: wf("dankhun", "ยึด", 0.68),
  prince: B.prince.start,
  three: wf("prince", "เหลือ", 0.9),
  end: B.south.start,
};

export const e2c6: Chapter = {
  name: "ก๊กพิมาย",
  from: C6.ph,
  to: C6.end,
  cams: (w, h) => [
    { frame: C6.ph, cam: view(VW.north, w, h, 0.9, 0.06) },
    { frame: C6.ph + 35, cam: view(VW.isan, w, h, 1, 0.08) },
    { frame: C6.prince + 40, cam: view(VW.isan, w, h, 1, 0.08) },
    { frame: C6.end, cam: view(VW.siam, w, h, 0.66, 0.1) },
  ],
  years: [[C6.ph, "2311"]],
  heads: [
    { f: C6.ph, tag: "ปีเดียวกันนั้น", head: "ตีก๊กพิมาย", color: TAK, portrait: "taksin_king" },
    { f: C6.dk, tag: "ปะทะที่ด่านขุนทด", head: "ยึดนครราชสีมาและพิมาย", color: TAK },
    { f: C6.prince, tag: "กรมหมื่นเทพพิพิธ", head: "ถูกจับได้ · ก๊กพิมายจบ", color: FACTIONS.phimai.color, portrait: "thepphiphit", stat: (f) => (f >= C6.three ? "3 ก๊ก" : "4 ก๊ก"), label: "เหลืออยู่" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <FactionStory focus={frame < C6.end ? "phimai" : undefined} />
        {frame >= C6.ph && frame < C6.end && (
          <>
            <Arrow points={[PL.thon, [101.0, 14.4], PL.korat, PL.dankhun]} start={C6.ph + 20} end={C6.dk + 10} color={TAK} width={18} />
            <PointLabel at={PL.dankhun} text="ด่านขุนทด" start={C6.dk} color={TAK} size={0.75} />
            <PointLabel at={PL.korat} text="นครราชสีมา" start={C6.took} color={TAK} size={0.7} />
            <PointLabel at={PL.phimai} text="พิมาย" start={C6.took + 10} color={FACTIONS.phimai.color} size={0.8} />
          </>
        )}
      </>
    );
  },
  Panels: () => (
    <>
      <CastleScene id="e2c6march" anchor={PL.phimai} start={C6.ph} end={C6.dk + 14} />
      <CastleScene id="e2c6battle" anchor={PL.dankhun} start={C6.dk} end={C6.prince + 14} battle={1} />
      <CastleScene id="e2c6end" anchor={PL.phimai} start={C6.prince} end={C6.end + 14} battle={1} />
    </>
  ),
  sfx: [
    [C6.ph, SFX.whoosh, 0.35],
    [C6.dk, SFX.hit, 0.45],
    [C6.took, SFX.pop, 0.35],
    [C6.three, SFX.hit, 0.4],
  ],
};
