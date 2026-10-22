import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { RuinScene } from "../news/ch0";
import { RiderScene } from "../news/ch5";
import { CityRing, clamp, font, GOLD, QuizNews, RED, view, type Chapter } from "../news/kit";
import { B, FACTIONS, wf } from "./beatsKit";
import { PL, VW, FactionStory, FLEET_IN } from "./places";
import { AssaultScene, CampFireScene, CastleScene, CrownScene, FleetScene, LordScene, MonkArmyScene, NakhonScene, PeopleScene, RiverFortScene, ShipyardScene, TAK } from "./scenes";

// Chapters 1–3 of episode 2: the five factions (recap → two), Chanthaburi to Thonburi (chan → ruins),
// why Thonburi (why → crown).

// ── Chapter 1 ───────────────────────────────────────────────────────────────────────────────────────────
const C1 = {
  recap: B.recap.start,
  left: wf("recap", "เหลือ", 0.82),
  escape: B.escape.start,
  k1: B.k1.start,
  k2: B.k2.start,
  monks: B.monks.start,
  k3: B.k3.start,
  why: B.phimaiwhy.start,
  k4: B.k4.start,
  k5: B.k5.start,
  chum: B.chumnum.start,
  cmp: B.compare.start,
  two: B.two.start,
  ship: wf("two", "เรือ", 0.25),
  trade: wf("two", "เส้น", 0.4),
  end: B.chan.start,
};

// Five bars: relative size of each faction (illustrative), Phraya Tak's the smallest.
const SizeBars = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < C1.cmp + 10 || frame > C1.two + 6) return null;
  const rows: [string, string, number][] = [["เจ้าพระฝาง", FACTIONS.fang.color, 0.8], ["พิษณุโลก", FACTIONS.plk.color, 0.9], ["พิมาย", FACTIONS.phimai.color, 0.85], ["นครศรีธรรมราช", FACTIONS.nakhon.color, 1], ["พระยาตาก", GOLD, 0.35]];
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.56, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.9)", borderRadius: 16 * s, padding: `${18 * s}px ${26 * s}px`, opacity: interpolate(frame, [C1.two - 6, C1.two + 6], [1, 0], clamp) }}>
      <div style={{ fontSize: 26 * s, opacity: 0.8, marginBottom: 8 * s }}>ขนาดโดยประมาณ (ภาพอธิบาย)</div>
      {rows.map(([n, c, v], i) => {
        const k = spring({ frame: frame - C1.cmp - 10 - i * 6, fps, config: { damping: 14 } });
        return (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 14 * s, margin: `${6 * s}px 0` }}>
            <div style={{ width: 230 * s, fontSize: 30 * s, fontWeight: 700 }}>{n}</div>
            <div style={{ height: 30 * s, width: `${v * 60 * k}%`, background: c, borderRadius: 8 * s }} />
          </div>
        );
      })}
    </div>
  );
};

export const e2c1: Chapter = {
  name: "แผ่นดิน 5 ก๊ก",
  from: C1.recap,
  to: C1.end,
  cams: (w, h) => [
    { frame: C1.recap, cam: view(VW.island, w, h, 0.6) },
    { frame: C1.escape, cam: view(VW.island, w, h, 0.6) },
    { frame: C1.escape + 30, cam: view(VW.gulf, w, h, 1, 0.08) },
    { frame: C1.k1, cam: view(VW.gulf, w, h, 1, 0.08) },
    { frame: C1.k1 + 30, cam: view(VW.north, w, h, 0.9, 0.06) },
    { frame: C1.k3, cam: view(VW.north, w, h, 0.9, 0.06) },
    { frame: C1.k3 + 30, cam: view(VW.isan, w, h, 1, 0.08) },
    { frame: C1.k4, cam: view(VW.isan, w, h, 1, 0.08) },
    { frame: C1.k4 + 30, cam: view(VW.south, w, h, 0.9, 0.05) },
    { frame: C1.k5, cam: view(VW.south, w, h, 0.9, 0.05) },
    { frame: C1.k5 + 30, cam: view(VW.east, w, h, 1, 0.08) },
    { frame: C1.chum, cam: view(VW.east, w, h, 1, 0.08) },
    { frame: C1.chum + 30, cam: view(VW.siam, w, h, 0.66, 0.1) },
  ],
  years: [[C1.recap, "2310"]],
  heads: [
    { f: C1.recap, tag: "ตอนที่แล้ว", head: "กรุงแตก 7 เม.ย. 2310", color: RED },
    { f: C1.left, tag: "พม่าเหลือไว้", head: "ค่ายโพธิ์สามต้น", color: RED },
    { f: C1.escape, tag: "ย้อนตอน 1", head: "ตีฝ่าวงล้อมก่อนกรุงแตก", color: TAK, portrait: "taksin_general" },
    { f: C1.k1, tag: "ก๊กที่ 1", head: "เจ้าพระยาพิษณุโลก (เรือง)", color: FACTIONS.plk.color, portrait: "ruang" },
    { f: C1.k2, tag: "ก๊กที่ 2 · สวางคบุรี", head: "เจ้าพระฝาง (เรือน)", color: FACTIONS.fang.color, portrait: "fang" },
    { f: C1.monks, tag: "ตามพงศาวดาร", head: "กองทัพพระ", color: FACTIONS.fang.color, portrait: "fang" },
    { f: C1.k3, tag: "ก๊กที่ 3 · พิมาย", head: "กรมหมื่นเทพพิพิธ", color: FACTIONS.phimai.color, portrait: "thepphiphit" },
    { f: C1.why, tag: "ใครคุมพิมาย", head: "คุมประตูสู่อีสานตอนล่าง", color: FACTIONS.phimai.color },
    { f: C1.k4, tag: "ก๊กที่ 4 · นครศรีธรรมราช", head: "เจ้านคร (หนู)", color: FACTIONS.nakhon.color, portrait: "nakhon_nu" },
    { f: C1.k5, tag: "ก๊กที่ 5 · จันทบุรี", head: "พระยาตาก", color: TAK, portrait: "taksin_general" },
    { f: C1.chum, tag: "คนสมัยนั้นเรียกว่า", head: "ชุมนุม = ก๊ก", color: GOLD },
    { f: C1.cmp, tag: "ถ้าวัดกันที่ขนาด", head: "ก๊กพระยาตากเล็กที่สุด", color: TAK },
    { f: C1.two, tag: "แต่มีของ 2 อย่าง", head: "อาวุธลับ", color: TAK, chips: [{ text: "① เรือ", f: C1.ship }, { text: "② การค้ากับจีน", f: C1.trade }] },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const focus = frame >= C1.k5 ? "tak" : frame >= C1.k4 ? "nakhon" : frame >= C1.k3 ? "phimai" : frame >= C1.k2 ? "fang" : frame >= C1.k1 ? "plk" : undefined;
    return (
      <>
        {frame >= C1.k1 && <FactionStory focus={frame >= C1.chum ? undefined : focus} />}
        {frame < C1.k1 && <CityRing k={interpolate(frame, [C1.recap, C1.recap + 15, C1.escape, C1.escape + 15], [0, 1, 1, 0], clamp)} color={RED} />}
        {frame >= C1.left && frame < C1.k1 && <PointLabel at={PL.posamton} text="ค่ายโพธิ์สามต้น" start={C1.left} color={RED} size={0.75} />}
        {frame >= C1.escape && frame < C1.k1 + 10 && <Arrow points={[PL.ayut, [101.2, 14.2], [101.37, 14.05], [101.0, 13.36], [101.28, 12.68]]} start={C1.escape + 10} end={C1.escape + 60} color={TAK} width={18} />}
        {frame >= C1.why && frame < C1.k4 && (
          <>
            <Arrow points={[PL.phimai, [103.6, 15.9], [104.6, 16.6]]} start={C1.why + 30} end={C1.why + 55} color={FACTIONS.phimai.color} width={12} variant="dashed" />
            <Arrow points={[PL.phimai, [103.6, 14.6], [104.6, 14.0]]} start={C1.why + 40} end={C1.why + 65} color={FACTIONS.phimai.color} width={12} variant="dashed" />
            <PointLabel at={PL.phimai} text="พิมาย" start={C1.why} color={FACTIONS.phimai.color} size={0.8} />
          </>
        )}
        {[["k1", PL.plk, "พิษณุโลก", "plk"], ["k2", PL.fang, "สวางคบุรี", "fang"], ["k4", PL.nakhon, "นครศรีธรรมราช", "nakhon"], ["k5", PL.chan, "จันทบุรี", "tak"]].map(([id, at, t, fid]) => {
          const f = B[id as string].start;
          const next = (id as string) === "k1" ? C1.k2 : (id as string) === "k2" ? C1.k3 : (id as string) === "k4" ? C1.k5 : C1.chum;
          return frame >= f && frame < next ? <PointLabel key={id as string} at={at as [number, number]} text={t as string} start={f + 10} color={FACTIONS[fid as "plk"].color} size={0.85} /> : null;
        })}
      </>
    );
  },
  Panels: () => (
    <>
      <RuinScene start={C1.recap} end={C1.escape + 14} />
      <RiderScene start={C1.escape} end={C1.k1 + 14} />
      <LordScene id="e2c1lord" anchor={PL.plk} start={C1.k1} end={C1.k2 + 14} />
      <MonkArmyScene id="e2c1fang" anchor={PL.fang} start={C1.k2} end={C1.monks + 14} />
      <MonkArmyScene id="e2c1monks" anchor={PL.fang} start={C1.monks} end={C1.k3 + 14} stamp="ตามพงศาวดาร" />
      <CastleScene id="e2c1phimai" anchor={PL.phimai} start={C1.k3} end={C1.k4 + 14} />
      <NakhonScene id="e2c1nakhon" anchor={PL.nakhon} start={C1.k4} end={C1.k5 + 14} />
      <FleetScene id="e2c1tak" anchor={PL.chan} start={C1.k5} end={C1.cmp + 14} n={2} />
      <FleetScene id="e2c1two" anchor={PL.chan} start={C1.two} end={C1.end + 14} n={4} junk />
    </>
  ),
  Screen: () => <SizeBars />,
  sfx: [
    [C1.recap, SFX.whoosh, 0.35],
    [C1.escape, SFX.whoosh, 0.3],
    [C1.k1, SFX.pop, 0.35],
    [C1.k2, SFX.pop, 0.35],
    [C1.k3, SFX.pop, 0.35],
    [C1.k4, SFX.pop, 0.35],
    [C1.k5, SFX.hit, 0.45],
    [C1.cmp + 10, SFX.tick, 0.3],
    [C1.ship, SFX.pop, 0.35],
    [C1.trade, SFX.pop, 0.35],
  ],
};

// ── Chapter 2 ───────────────────────────────────────────────────────────────────────────────────────────
const C2 = {
  chan: B.chan.start,
  trat: wf("chan", "ตราด", 0.75),
  ships: B.ships.start,
  men: wf("ships", "รวบรวม", 0.72),
  timber: B.timber.start,
  fortm: wf("timber", "ป้อม", 0.63),
  sail: B.sail.start,
  out: wf("sail", "กอง", 0.4),
  speed: B.speed.start,
  sea: wf("speed", "แต่", 0.58),
  thongin: B.thongin.start,
  took: wf("thongin", "ทัพ", 0.77),
  pst: B.posamton.start,
  fell: wf("posamton", "แตก", 0.48),
  ruins: B.ruins.start,
  end: B.why.start,
};

export const e2c2: Chapter = {
  name: "จากจันทบุรีสู่ธนบุรี",
  from: C2.chan,
  to: C2.end,
  cams: (w, h) => [
    { frame: C2.chan, cam: view(VW.siam, w, h, 0.66, 0.1) },
    { frame: C2.chan + 35, cam: view(VW.east, w, h, 1, 0.08) },
    { frame: C2.sail, cam: view(VW.east, w, h, 1, 0.08) },
    { frame: C2.sail + 35, cam: view(VW.gulf, w, h, 1, 0.08) },
    { frame: C2.thongin, cam: view(VW.gulf, w, h, 1, 0.08) },
    { frame: C2.thongin + 35, cam: view(VW.thon, w, h, 1) },
    { frame: C2.ruins, cam: view(VW.thon, w, h, 1) },
    { frame: C2.ruins + 30, cam: view(VW.island, w, h, 0.7) },
  ],
  years: [[C2.chan, "2310 · มิถุนายน"], [C2.sail, "2310 · ตุลาคม"], [C2.pst, "2310 · พฤศจิกายน"]],
  heads: [
    { f: C2.chan, tag: "มิถุนายน 2310", head: "ตีจันทบุรีได้", color: TAK, chips: [{ text: "จันทบุรี", f: C2.chan + 10 }, { text: "ตราด", f: C2.trat }] },
    { f: C2.ships, tag: "ที่จันทบุรี", head: "ต่อเรือรบ", stat: "~100 ลำ", label: "คนราว 5,000", color: TAK },
    { f: C2.timber, tag: "ช่างไทย + ช่างจีน", head: "เรือรบ = ป้อมเคลื่อนที่", color: TAK, chips: [{ text: "ทหาร", f: C2.fortm + 20 }, { text: "ปืนใหญ่", f: C2.fortm + 40 }, { text: "เสบียง", f: C2.fortm + 60 }] },
    { f: C2.sail, tag: "ตุลาคม 2310", head: "กองเรือออกจากจันทบุรี", color: TAK },
    { f: C2.speed, tag: "บก vs เรือ", head: "ทางเรือเร็วกว่าหลายเท่า", color: TAK },
    { f: C2.thongin, tag: "ด่านแรก · ธนบุรี", head: "นายทองอิน", color: RED, portrait: "thongin" },
    { f: C2.took, tag: "ทัพเรือ", head: "ตีธนบุรีได้รวดเร็ว", color: TAK },
    { f: C2.pst, tag: "ค่ายสุดท้ายของพม่า", head: "โพธิ์สามต้นแตก", stat: "7 เดือน", label: "หลังกรุงแตก", color: TAK },
    { f: C2.ruins, tag: "อยุธยาหลังสงคราม", head: "เหลือแต่ซากกับเถ้า", color: RED, portrait: "taksin_general" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        {frame < C2.sail + 20 && <FactionStory focus="tak" />}
        {frame >= C2.chan && frame < C2.sail && (
          <>
            <PointLabel at={PL.chan} text="จันทบุรี" start={C2.chan + 10} color={TAK} size={0.85} />
            <PointLabel at={PL.trat} text="ตราด" start={C2.trat} color={TAK} size={0.75} />
          </>
        )}
        {frame >= C2.out && frame < C2.ruins && <Arrow points={FLEET_IN} start={C2.out} end={C2.speed + 10} color={TAK} width={18} />}
        {frame >= C2.speed && frame < C2.thongin + 10 && <Arrow points={[PL.chan, [101.6, 13.4], [101.0, 13.9], [100.6, 14.2]]} start={C2.speed + 10} end={C2.sea} color="#d9c8a8" width={10} variant="dashed" />}
        {frame >= C2.thongin && frame < C2.ruins && (
          <>
            <PointLabel at={PL.thon} text="ธนบุรี" start={C2.thongin + 20} color={TAK} size={0.85} />
            <Arrow points={[PL.thon, [100.52, 14.0], PL.posamton]} start={C2.pst} end={C2.pst + 30} color={TAK} width={18} />
            {frame >= C2.pst && <PointLabel at={PL.posamton} text="โพธิ์สามต้น" start={C2.pst + 10} color={RED} size={0.8} />}
          </>
        )}
      </>
    );
  },
  Panels: () => (
    <>
      <AssaultScene id="e2c2chan" anchor={PL.chan} start={C2.chan} end={C2.ships + 14} breakAt={C2.chan + 40} night />
      <ShipyardScene id="e2c2yard" anchor={PL.chan} start={C2.ships} end={C2.sail + 14} />
      <FleetScene id="e2c2sail" anchor={PL.chan} start={C2.sail} end={C2.thongin + 14} n={5} />
      <AssaultScene id="e2c2thon" anchor={PL.thon} start={C2.thongin} end={C2.pst + 14} breakAt={C2.took} />
      <CampFireScene id="e2c2pst" anchor={PL.posamton} start={C2.pst} end={C2.ruins + 14} />
      <RuinScene start={C2.ruins} end={C2.end + 14} />
    </>
  ),
  sfx: [
    [C2.chan, SFX.whoosh, 0.35],
    [C2.chan + 40, SFX.hit, 0.45],
    [C2.ships, SFX.pop, 0.35],
    [C2.out, SFX.whoosh, 0.35],
    [C2.sea, SFX.pop, 0.3],
    [C2.took, SFX.hit, 0.45],
    [C2.fell, SFX.hit, 0.55],
    [C2.ruins, SFX.swell, 0.25],
  ],
};

// ── Chapter 3 ───────────────────────────────────────────────────────────────────────────────────────────
const C3 = {
  why: B.why.start,
  guess: wf("why", "ลอง", 0.75),
  r1: B.r1.start,
  r2: B.r2.start,
  fort: B.fort.start,
  r3: B.r3.start,
  hunger: B.hunger.start,
  buy: B.buyrice.start,
  people: B.people.start,
  crown: B.crown.start,
  end: B.bangkung.start,
};

// Size outlines: Ayutthaya's long wall vs Thonburi's small one (illustrative rings).
const SizeRings = () => {
  const frame = useCurrentFrame();
  if (frame < C3.r1 || frame > C3.r2 + 10) return null;
  const k = interpolate(frame, [C3.r1 + 10, C3.r1 + 30], [0, 1], clamp);
  return (
    <g opacity={k}>
      <CityRing k={1} color={RED} />
    </g>
  );
};

export const e2c3: Chapter = {
  name: "ทำไมธนบุรี",
  from: C3.why,
  to: C3.end,
  cams: (w, h) => [
    { frame: C3.why, cam: view(VW.island, w, h, 0.7) },
    { frame: C3.why + 35, cam: view(VW.thon, w, h, 0.9) },
    { frame: C3.r2, cam: view(VW.thon, w, h, 0.9) },
    { frame: C3.r2 + 30, cam: view(VW.gulf, w, h, 1, 0.08) },
    { frame: C3.fort, cam: view(VW.gulf, w, h, 1, 0.08) },
    { frame: C3.fort + 30, cam: view(VW.thon, w, h, 1.6) },
    { frame: C3.people, cam: view(VW.thon, w, h, 1.6) },
    { frame: C3.people + 30, cam: view(VW.central, w, h, 1, 0.08) },
    { frame: C3.crown, cam: view(VW.central, w, h, 1, 0.08) },
    { frame: C3.crown + 30, cam: view(VW.thon, w, h, 1.4) },
  ],
  years: [[C3.why, "2310"]],
  heads: [
    { f: C3.why, tag: "ไม่ฟื้นอยุธยา", head: "ตั้งเมืองหลวงที่ธนบุรี", color: TAK },
    { f: C3.guess, tag: "", head: "" },
    { f: C3.r1, tag: "เหตุผลที่ ①", head: "อยุธยาใหญ่เกินรักษา", color: TAK },
    { f: C3.r2, tag: "เหตุผลที่ ②", head: "ใกล้ทะเล ถอยทางเรือได้", color: TAK },
    { f: C3.fort, tag: "ฝั่งธนบุรี", head: "ป้อมวิชัยประสิทธิ์", color: TAK },
    { f: C3.r3, tag: "เหตุผลที่ ③", head: "เรือสินค้าจีนเข้าถึงง่าย", color: TAK, portrait: "chinese_merchant" },
    { f: C3.hunger, tag: "หลังสงคราม", head: "ข้าวยากหมากแพง", color: RED },
    { f: C3.buy, tag: "ซื้อข้าวจากเรือจีน", head: "แจกจ่ายคนหิว", color: TAK, portrait: "chinese_merchant" },
    { f: C3.people, tag: "คนกลับมารวมกัน", head: "คน = กำลังรบ", color: TAK, chips: [{ text: "อาวุธลับข้อ ②", f: wf("people", "อาวุธ", 0.85) }] },
    { f: C3.crown, tag: "ไม่นานหลังจากนั้น", head: "ปราบดาภิเษกที่กรุงธนบุรี", color: TAK, portrait: "taksin_king" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <SizeRings />
        {frame >= C3.r1 && frame < C3.r2 + 10 && <PointLabel at={PL.thon} text="ธนบุรี" start={C3.r1 + 20} color={TAK} size={0.8} />}
        {frame >= C3.r2 && frame < C3.fort + 10 && <Arrow points={[PL.thon, PL.mouth, [101.0, 12.9], [101.6, 12.55], PL.chan]} start={C3.r2 + 20} end={C3.r2 + 70} color={TAK} width={12} variant="dashed" />}
        {frame >= C3.fort && frame < C3.hunger && <PointLabel at={PL.fort} text="ป้อมวิชัยประสิทธิ์" start={C3.fort + 20} color={TAK} size={0.75} />}
        {frame >= C3.r3 && frame < C3.hunger && <Arrow points={[[101.5, 12.6], [100.9, 13.1], PL.mouth, PL.thon]} start={C3.r3} end={C3.r3 + 40} color={GOLD} width={10} variant="dashed" />}
        {frame >= C3.people && frame < C3.crown + 10 &&
          [[99.8, 14.6], [100.1, 15.0], [100.9, 14.8], [101.2, 14.1], [99.9, 13.6], [100.6, 15.1]].map((p, i) => (
            <Arrow key={i} points={[p as [number, number], PL.thon]} start={C3.people + 10 + i * 6} end={C3.people + 40 + i * 6} color={GOLD} width={8} />
          ))}
      </>
    );
  },
  Panels: () => (
    <>
      <LordScene id="e2c3why" anchor={PL.thon} start={C3.why} end={C3.r1 + 14} banner={TAK} />
      <PeopleScene id="e2c3walls" anchor={PL.ayut} start={C3.r1} end={C3.r2 + 14} mode="walk" />
      <FleetScene id="e2c3sea" anchor={PL.thon} start={C3.r2} end={C3.fort + 14} n={3} />
      <RiverFortScene id="e2c3fort" anchor={PL.fort} start={C3.fort} end={C3.r3 + 14} />
      <FleetScene id="e2c3junk" anchor={PL.thon} start={C3.r3} end={C3.hunger + 14} n={1} junk />
      <PeopleScene id="e2c3hunger" anchor={PL.thon} start={C3.hunger} end={C3.buy + 14} mode="hunger" />
      <PeopleScene id="e2c3rice" anchor={PL.thon} start={C3.buy} end={C3.people + 14} mode="rice" />
      <PeopleScene id="e2c3people" anchor={PL.thon} start={C3.people} end={C3.crown + 14} mode="walk" />
      <CrownScene id="e2c3crown" anchor={PL.thon} start={C3.crown} end={C3.end + 14} />
    </>
  ),
  Screen: () => <QuizNews title="ทายกันหน่อย" question="ทำไมไม่ฟื้นอยุธยา?" options={["เมืองพังเกินซ่อม", "ธนบุรีใกล้ทะเล", "ถูกทุกข้อ"]} answer={2} start={C3.guess} reveal={C3.r1 - 4} end={C3.r1 + 26} />,
  sfx: [
    [C3.why, SFX.whoosh, 0.3],
    [C3.guess, SFX.riser, 0.25],
    [C3.r1 - 4, SFX.hit, 0.45],
    [C3.r2, SFX.pop, 0.3],
    [C3.fort, SFX.pop, 0.3],
    [C3.r3, SFX.pop, 0.3],
    [C3.hunger, SFX.swell, 0.25],
    [C3.people, SFX.whoosh, 0.3],
    [C3.crown, SFX.swell, 0.35],
  ],
};
void CastleScene;
void NakhonScene;
void AbsoluteFill;
