import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { bbox } from "../../../components/Region";
import { useMap } from "../../../components/Map";
import { SFX } from "../../../components/Sound";
import { clamp, font, GOLD, RED, view, type Chapter } from "../news/kit";
import { B, FACTIONS, wf, type FactionId } from "./beatsKit";
import { Factions } from "./ch0";
import { PL, VW, FactionStory, FLEET_IN, NAN_RIVER } from "./places";
import { AssaultScene, AudienceScene, FleetScene, LordScene, MonkArmyScene, NakhonScene, PeopleScene, ShipyardScene, TAK, VanishScene } from "./scenes";

// Chapters 7–9 of episode 2: Nakhon Si Thammarat (south → last), Chao Phra Fang and reunification
// (raid → gold), the answer (answer → poll).

const C7 = {
  south: B.south.start,
  land: wf("south", "ทัพ", 0.47),
  failed: wf("south", "และ", 0.9),
  fleet: B.fleetsouth.start,
  why: B.southwhy.start,
  nakhon: B.nakhon.start,
  fell: wf("nakhon", "แตก", 0.35),
  pattani: wf("nakhon", "ปัตตานี", 0.58),
  back: wf("nakhon", "แต่", 0.76),
  spare: B.spare.start,
  last: B.last.start,
  end: B.raid.start,
};
const FLEET_SOUTH: [number, number][] = [PL.thon, [100.5, 13.2], [100.3, 12.0], [100.0, 10.6], [100.1, 9.4], [100.05, 8.6]];

export const e2c7: Chapter = {
  name: "นครศรีธรรมราช",
  from: C7.south,
  to: C7.end,
  cams: (w, h) => [
    { frame: C7.south, cam: view(VW.siam, w, h, 0.66, 0.1) },
    { frame: C7.south + 35, cam: view(VW.south, w, h, 0.9, 0.05) },
    { frame: C7.last, cam: view(VW.south, w, h, 0.9, 0.05) },
    { frame: C7.last + 35, cam: view(VW.siam, w, h, 0.66, 0.1) },
  ],
  years: [[C7.south, "2312"]],
  heads: [
    { f: C7.south, tag: "พ.ศ. 2312", head: "ถึงคราวปักษ์ใต้", color: FACTIONS.nakhon.color },
    { f: C7.land, tag: "ทัพบกไปตีนครครั้งแรก", head: "เดินทางไกล แล้วพ่าย", color: RED },
    { f: C7.fleet, tag: "พระเจ้าตากยกทัพเรือไปเอง", head: "ล่องอ่าวไทยลงใต้", color: TAK, portrait: "taksin_king" },
    { f: C7.why, tag: "ทางใต้ยาวและแคบ", head: "ทัพเรือได้เปรียบ", color: TAK },
    { f: C7.nakhon, tag: "นครศรีธรรมราช", head: "นครแตก", color: TAK, portrait: "nakhon_nu" },
    { f: C7.pattani, tag: "เจ้านครหนีไปปัตตานี", head: "ถูกส่งตัวกลับมา", color: FACTIONS.nakhon.color, portrait: "nakhon_nu" },
    { f: C7.spare, tag: "ไม่ประหาร", head: "ใช้คนเก่งเป็น", color: TAK, portrait: "nakhon_nu" },
    { f: C7.last, tag: "เหลือก๊กสุดท้าย", head: "เจ้าพระฝาง", color: FACTIONS.fang.color, portrait: "fang" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <FactionStory focus={frame < C7.last ? "nakhon" : "fang"} />
        {frame >= C7.land && frame < C7.nakhon && (
          <>
            <g opacity={interpolate(frame, [C7.failed, C7.failed + 10], [1, 0.3], clamp)}>
              <Arrow points={[PL.thon, [99.9, 12.6], [99.4, 11.0], [99.3, 9.8], PL.nakhon]} start={C7.land} end={C7.failed} color="#c8b090" width={14} />
            </g>
            {frame >= C7.failed && <Arrow points={[[99.6, 9.2], [99.3, 10.4], [99.5, 11.8]]} start={C7.failed} end={C7.failed + 25} color={RED} width={10} variant="dashed" />}
          </>
        )}
        {frame >= C7.fleet && frame < C7.last + 20 && <Arrow points={FLEET_SOUTH} start={C7.fleet + 10} end={C7.why + 20} color={TAK} width={20} />}
        {frame >= C7.pattani && frame < C7.spare + 20 && (
          <>
            <Arrow points={[PL.nakhon, [100.6, 7.7], PL.pattani]} start={C7.pattani} end={C7.pattani + 20} color={FACTIONS.nakhon.color} width={10} variant="dashed" />
            <Arrow points={[PL.pattani, [100.7, 7.9], PL.nakhon]} start={C7.back} end={C7.back + 20} color={TAK} width={10} variant="dashed" />
            <PointLabel at={PL.pattani} text="ปัตตานี" start={C7.pattani} color={FACTIONS.nakhon.color} size={0.7} />
          </>
        )}
        {frame >= C7.south && frame < C7.last && <PointLabel at={PL.nakhon} text="นครศรีธรรมราช" start={C7.south + 30} color={FACTIONS.nakhon.color} size={0.8} />}
      </>
    );
  },
  Panels: () => (
    <>
      <PeopleScene id="e2c7land" anchor={PL.nakhon} start={C7.land} end={C7.fleet + 14} mode="walk" />
      <FleetScene id="e2c7fleet" anchor={[100.0, 10.6]} start={C7.fleet} end={C7.nakhon + 14} n={5} />
      <NakhonScene id="e2c7fell" anchor={PL.nakhon} start={C7.nakhon} end={C7.spare + 14} captured />
      <AudienceScene id="e2c7spare" anchor={PL.thon} start={C7.spare} end={C7.last + 14} />
      <MonkArmyScene id="e2c7last" anchor={PL.fang} start={C7.last} end={C7.end + 14} />
    </>
  ),
  sfx: [
    [C7.south, SFX.whoosh, 0.35],
    [C7.failed, SFX.hit, 0.35],
    [C7.fleet, SFX.whoosh, 0.35],
    [C7.fell, SFX.hit, 0.5],
    [C7.pattani, SFX.pop, 0.3],
    [C7.spare, SFX.swell, 0.25],
    [C7.last, SFX.riser, 0.25],
  ],
};

const C8 = {
  raid: B.raid.start,
  chainat: wf("raid", "ชัยนาท", 0.55),
  three: B.three.start,
  quote: B.quote.start,
  plk2: B.plk2.start,
  plkFell: wf("plk2", "แตก", 0.45),
  sawang: B.sawang.start,
  days: wf("sawang", "เพียง", 0.88),
  fell: wf("sawang", "แตก", 0.95),
  vanish: B.vanish.start,
  order: B.order.start,
  united: B.united.start,
  gold: B.gold.start,
  end: B.answer.start,
};

// "(ถอดความ)" quote card for the Taksin line (not a chronicle quote).
const QuoteCard = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < C8.quote - 4 || frame > C8.plk2 + 10) return null;
  const k = spring({ frame: frame - C8.quote + 4, fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, transform: `scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k) * interpolate(frame, [C8.plk2, C8.plk2 + 10], [1, 0], clamp), fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${TAK}`, borderRadius: 18 * s, padding: `${20 * s}px ${30 * s}px`, lineHeight: 1.45 }}>
      <div style={{ fontSize: 26 * s, fontWeight: 700, color: TAK }}>พระเจ้าตาก · (ถอดความ)</div>
      <div style={{ fontSize: 56 * s, fontWeight: 900, marginTop: 6 * s }}>“ครั้งนี้ต้องเอาพิษณุโลกคืนให้ได้”</div>
    </div>
  );
};

// Map: the whole land turning gold, faction by faction (for "gold" beat — a replay from the small dot).
const GoldSweep = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const order: FactionId[] = ["tak", "phimai", "nakhon", "plk", "fang"];
  const k: Partial<Record<FactionId, number>> = {};
  const colors: Partial<Record<FactionId, string>> = {};
  order.forEach((id, i) => {
    k[id] = interpolate(frame, [C8.gold + 30 + i * 12, C8.gold + 44 + i * 12], [0, 1], clamp);
    colors[id] = GOLD;
  });
  const p = projection(PL.chan);
  return (
    <g>
      <Factions k={k} colors={colors} />
      {p && <circle cx={p[0]} cy={p[1]} r={(16 + 10 * Math.sin(frame * 0.3)) * s} fill={GOLD} stroke="#fff" strokeWidth={3 * s} />}
    </g>
  );
};

export const e2c8: Chapter = {
  name: "เจ้าพระฝาง",
  from: C8.raid,
  to: C8.end,
  cams: (w, h) => [
    { frame: C8.raid, cam: view(VW.siam, w, h, 0.66, 0.1) },
    { frame: C8.raid + 35, cam: view(VW.north, w, h, 0.9, 0.06) },
    { frame: C8.order + 30, cam: view(VW.north, w, h, 0.9, 0.06) },
    { frame: C8.united + 10, cam: view(VW.siam, w, h, 0.66, 0.1) },
  ],
  years: [[C8.raid, "2313"]],
  heads: [
    { f: C8.raid, tag: "พ.ศ. 2313", head: "เจ้าพระฝางบุกชัยนาท", color: FACTIONS.fang.color, portrait: "fang" },
    { f: C8.three, tag: "ทัพใหญ่หลายทาง", head: "บก + เรือ", color: TAK, portrait: "taksin_king" },
    { f: C8.quote, tag: "", head: "" },
    { f: C8.plk2, tag: "ครั้งที่ 2", head: "พิษณุโลกแตก", color: TAK, chips: [{ text: "ครั้งที่ 1: แพ้", f: C8.plk2 + 10 }, { text: "ครั้งที่ 2: ชนะ", f: C8.plkFell }] },
    { f: C8.sawang, tag: "สวางคบุรี", head: "เมืองของเจ้าพระฝาง", color: FACTIONS.fang.color, stat: (f) => `${Math.min(3, Math.max(1, Math.ceil((f - C8.days) / 6)))} วัน`, label: "ต้านได้" },
    { f: C8.vanish, tag: "เจ้าพระฝาง", head: "หายสาบสูญ", color: FACTIONS.fang.color, portrait: "fang" },
    { f: C8.order, tag: "จัดระเบียบหัวเมืองเหนือ", head: "ปราบโจร · ชำระพระสงฆ์", color: TAK },
    { f: C8.united, tag: "ราว 3 ปีหลังกรุงแตก", head: "รวมแผ่นดินสำเร็จ", color: GOLD, portrait: "taksin_king" },
    { f: C8.gold, tag: "จากจุดเล็ก ๆ ที่จันทบุรี", head: "สีทองเหนือจรดใต้", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        {frame < C8.gold ? <FactionStory focus={frame < C8.order ? "fang" : undefined} /> : <GoldSweep />}
        {frame >= C8.raid && frame < C8.three + 10 && <Arrow points={[PL.fang, PL.plk, [100.2, 16.1], PL.chainat]} start={C8.raid + 30} end={C8.chainat + 10} color={FACTIONS.fang.color} width={18} />}
        {frame >= C8.chainat && frame < C8.plk2 && <PointLabel at={PL.chainat} text="ชัยนาท" start={C8.chainat} color={RED} size={0.8} />}
        {frame >= C8.three && frame < C8.vanish && (
          <>
            <Arrow points={NAN_RIVER} start={C8.three} end={C8.plk2} color={TAK} width={18} />
            <Arrow points={[PL.chainat, [99.8, 15.8], [99.9, 16.5], PL.plk]} start={C8.three + 8} end={C8.plk2 + 6} color={TAK} width={14} />
            <Arrow points={[[100.9, 15.3], [100.8, 16.2], PL.plk]} start={C8.three + 16} end={C8.plk2 + 12} color={TAK} width={14} />
          </>
        )}
        {frame >= C8.plkFell && frame < C8.vanish && <Arrow points={[PL.plk, [100.2, 17.2], PL.fang]} start={C8.sawang} end={C8.sawang + 30} color={TAK} width={18} />}
        {frame >= C8.sawang && frame < C8.order && <PointLabel at={PL.fang} text="สวางคบุรี" start={C8.sawang + 20} color={FACTIONS.fang.color} size={0.8} />}
      </>
    );
  },
  Panels: () => (
    <>
      <MonkArmyScene id="e2c8raid" anchor={PL.chainat} start={C8.raid} end={C8.three + 14} />
      <FleetScene id="e2c8three" anchor={PL.plk} start={C8.three} end={C8.plk2 + 14} n={5} />
      <AssaultScene id="e2c8plk" anchor={PL.plk} start={C8.plk2} end={C8.sawang + 14} breakAt={C8.plkFell} />
      <AssaultScene id="e2c8sawang" anchor={PL.fang} start={C8.sawang} end={C8.vanish + 14} breakAt={C8.fell} wood />
      <VanishScene id="e2c8vanish" anchor={PL.fang} start={C8.vanish} end={C8.order + 14} />
      <LordScene id="e2c8order" anchor={PL.plk} start={C8.order} end={C8.united + 14} banner={TAK} />
      <PeopleScene id="e2c8united" anchor={PL.thon} start={C8.united} end={C8.end + 14} mode="cheer" />
    </>
  ),
  Screen: () => <QuoteCard />,
  sfx: [
    [C8.raid, SFX.whoosh, 0.35],
    [C8.chainat, SFX.hit, 0.4],
    [C8.three, SFX.whoosh, 0.35],
    [C8.quote, SFX.swell, 0.3],
    [C8.plkFell, SFX.hit, 0.55],
    [C8.fell, SFX.hit, 0.55],
    [C8.vanish, SFX.riser, 0.2],
    [C8.united, SFX.swell, 0.4],
    [C8.gold + 30, SFX.tick, 0.3],
  ],
};

const C9 = {
  answer: B.answer.start,
  a1: B.a1.start,
  a2: B.a2.start,
  a3: B.a3.start,
  a4: B.a4.start,
  burma: B.burma.start,
  poll: B.poll.start,
  end: B.poll.end + 45,
};

// Closing poll: which faction first?
const Poll = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < C9.poll + 20) return null;
  const k = spring({ frame: frame - C9.poll - 20, fps, config: { damping: 14 } });
  const opts: [string, string][] = [["พิษณุโลก", FACTIONS.plk.color], ["เจ้าพระฝาง", FACTIONS.fang.color], ["พิมาย", FACTIONS.phimai.color], ["นครศรีธรรมราช", FACTIONS.nakhon.color]];
  const btn = spring({ frame: frame - wf("poll", "พิมพ์", 0.8), fps, config: { damping: 9 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, transform: `scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k), fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${GOLD}`, borderRadius: 18 * s, padding: `${20 * s}px ${28 * s}px`, lineHeight: 1.35 }}>
        <div style={{ fontSize: 28 * s, fontWeight: 700, color: GOLD }}>ถ้าคุณเป็นพระเจ้าตาก</div>
        <div style={{ fontSize: 52 * s, fontWeight: 900, margin: `${4 * s}px 0 ${14 * s}px` }}>จะตีก๊กไหนก่อน?</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 * s }}>
          {opts.map(([t, c]) => <div key={t} style={{ border: `${4 * s}px solid ${c}`, borderRadius: 12 * s, padding: `${12 * s}px`, textAlign: "center", fontSize: 36 * s, fontWeight: 900 }}>{t}</div>)}
        </div>
        <div style={{ textAlign: "center", fontSize: 30 * s, opacity: 0.85, marginTop: 12 * s }}>พิมพ์บอกในคอมเมนต์ได้เลย</div>
      </div>
      {frame >= wf("poll", "พิมพ์", 0.8) && (
        <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.42, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `scale(${btn})`, background: RED, color: "#fff", borderRadius: 50 * s, padding: `${12 * s}px ${60 * s}px`, fontFamily: font, fontWeight: 900, fontSize: 48 * s }}>ติดตาม</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const e2c9: Chapter = {
  name: "คำตอบ",
  from: C9.answer,
  to: C9.end,
  cams: (w, h) => [
    { frame: C9.answer, cam: view(VW.siam, w, h, 0.66, 0.1) },
    { frame: C9.burma, cam: view(VW.siam, w, h, 0.66, 0.1) },
    { frame: C9.burma + 35, cam: view(bbox([[95.0, 6.6], [105.4, 22.4]]), w, h, 0.62, 0.12) },
  ],
  years: [[C9.answer, "2310–2313"]],
  heads: [
    { f: C9.answer, tag: "คำถามของวันนี้", head: "ทหารไม่กี่พัน รวม 5 ก๊กได้ไง?", color: GOLD },
    { f: C9.a1, tag: "คำตอบ ①", head: "เรือ", color: TAK, chips: [{ text: "ไปถึงทุกก๊กเร็วกว่า", f: C9.a1 + 60 }] },
    { f: C9.a2, tag: "คำตอบ ②", head: "ข้าว + การค้ากับจีน", color: TAK, chips: [{ text: "คนมาก กำลังมาก", f: C9.a2 + 150 }] },
    { f: C9.a3, tag: "คำตอบ ③", head: "ตีทีละก๊ก", color: TAK, chips: [{ text: "ก๊กอื่นไม่เคยรวมกัน", f: C9.a3 + 90 }] },
    { f: C9.a4, tag: "และอีกเรื่อง", head: "แพ้ก็ถอย แล้วกลับมาใหม่", color: GOLD, chips: [{ text: "พิษณุโลก: แพ้ → ชนะ", f: C9.a4 + 160 }] },
    { f: C9.burma, tag: "ทางตะวันตก", head: "พม่ายังไม่ยอมแพ้", color: RED },
    { f: C9.poll, tag: "", head: "" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const fadeOrder: FactionId[] = ["plk", "phimai", "nakhon", "fang"];
    const dim: Partial<Record<FactionId, number>> = {};
    if (frame >= C9.a3) fadeOrder.forEach((id, i) => (dim[id] = interpolate(frame, [C9.a3 + 40 + i * 15, C9.a3 + 52 + i * 15], [0, 1], clamp)));
    return (
      <>
        <Factions k={{ tak: 1, plk: 1, fang: 1, phimai: 1, nakhon: 1 }} colors={{ tak: GOLD, plk: GOLD, fang: GOLD, phimai: GOLD, nakhon: GOLD }} dim={frame >= C9.a3 && frame < C9.a4 ? dim : {}} />
        {frame >= C9.a1 && frame < C9.a2 + 10 && (
          <>
            <Arrow points={FLEET_IN} start={C9.a1 + 30} end={C9.a1 + 70} color={TAK} width={16} />
            <Arrow points={FLEET_SOUTH} start={C9.a1 + 50} end={C9.a1 + 100} color={TAK} width={16} />
            <Arrow points={NAN_RIVER} start={C9.a1 + 140} end={C9.a1 + 200} color={TAK} width={16} />
          </>
        )}
        {frame >= C9.burma && frame < C9.poll + 20 && (
          <>
            <Arrow points={[[96.1, 21.9], [97.4, 19.5], [98.6, 17.6]]} start={C9.burma + 30} end={C9.burma + 70} color={RED} width={18} />
            <PointLabel at={[98.6, 17.6]} text="ทัพพม่า" start={C9.burma + 60} color={RED} size={0.8} />
          </>
        )}
      </>
    );
  },
  Panels: () => (
    <>
      <FleetScene id="e2c9a1" anchor={PL.thon} start={C9.a1} end={C9.a2 + 14} n={5} />
      <PeopleScene id="e2c9a2" anchor={PL.thon} start={C9.a2} end={C9.a3 + 14} mode="rice" />
      <AssaultScene id="e2c9a3" anchor={PL.plk} start={C9.a3} end={C9.a4 + 14} breakAt={C9.a3 + 60} />
      <ShipyardScene id="e2c9a4" anchor={PL.chan} start={C9.a4} end={C9.burma + 14} />
      <AssaultScene id="e2c9burma" anchor={[98.6, 17.6]} start={C9.burma} end={C9.poll + 14} breakAt={C9.end + 999} attackers="burma" night />
      <FleetScene id="e2c9end" anchor={PL.thon} start={C9.poll} end={C9.end + 30} n={3} night />
    </>
  ),
  Screen: () => <Poll />,
  sfx: [
    [C9.answer, SFX.riser, 0.3],
    [C9.a1, SFX.pop, 0.4],
    [C9.a2, SFX.pop, 0.4],
    [C9.a3, SFX.pop, 0.4],
    [C9.a4, SFX.pop, 0.4],
    [C9.burma, SFX.hit, 0.45],
    [C9.poll + 20, SFX.pop, 0.4],
  ],
};
