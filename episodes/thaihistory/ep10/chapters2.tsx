import type { ReactNode } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import type { Cam } from "../../../components/camera";
import { FlowWarm, type Area } from "../../../components/Flow25D";
import type { Head } from "../news/kit";
import { clamp, font, view } from "../news/kit";
import { CityDot } from "../ep05/beatsKit";
import { Battle } from "../ep06/mapkit";
import beatsText from "./beats.json";
import { B, BEATS, GOLD, RED, wp, type Chapter10 } from "./beatsKit";
import { duelPose, E10_END } from "./chapters";
import { FlowFull, FlowPanel } from "./flowscene";
import { Bed, Hit, SFX } from "./mix";
import { OLD, PL, ROUTE, VW } from "./places";

// Episode 10, chapters 1–8. Each chapter is a list of Flow stills (flow-shots.json, prepared with flow-layers) that
// appear on their spoken word, map moves and marks on the 1770 map, and the head cards straight from beats.json.

type Shot = { name: string; at: number; anchor?: [number, number]; wind?: Area[]; light?: [number, number] };
type Spec = {
  name: string;
  from: string;
  to: string | null;
  years: [number, string][];
  cams: (w: number, h: number) => { frame: number; cam: Cam }[];
  shots: Shot[];
  anchor: [number, number];
  Map: () => ReactNode;
  Full?: () => ReactNode;
  Screen?: () => ReactNode;
  sfx?: [number, string, number][];
  beds: [string, number][];
  accent?: string;
};
const range = (from: string, to: string | null) => {
  const a = BEATS.findIndex((b) => b.id === from);
  const z = to ? BEATS.findIndex((b) => b.id === to) : BEATS.length;
  return BEATS.slice(a, z);
};
const CARD: Record<string, string[]> = Object.fromEntries((beatsText as { id: string; card?: string[] }[]).filter((b) => b.card).map((b) => [b.id, b.card!]));
// head cards straight from the script's bottom-card column
const headsOf = (from: string, to: string | null, accent: string): Head[] =>
  range(from, to)
    .filter((b) => CARD[b.id])
    .map((b, i) => {
      const [tag, head] = CARD[b.id];
      return { f: b.start, tag, head: head ?? tag, color: i % 3 === 2 ? RED : accent };
    });

const make = (s: Spec): Chapter10 => {
  const from = B[s.from].start;
  const to = s.to ? B[s.to].start : E10_END;
  const shots = [...s.shots].sort((a, b) => a.at - b.at);
  return {
    name: s.name,
    from,
    to,
    cams: s.cams,
    years: s.years,
    heads: headsOf(s.from, s.to, s.accent ?? GOLD),
    Map: s.Map,
    Panels: () => (
      <>
        {shots.map((sh) => <FlowWarm key={`w${sh.name}${sh.at}`} name={sh.name} from={sh.at - 45} to={sh.at + 3} />)}
        {shots.map((sh, i) => (
          <FlowPanel key={sh.name + sh.at} id={`e10-${sh.name}-${sh.at}`} anchor={sh.anchor ?? s.anchor} start={sh.at} end={(shots[i + 1]?.at ?? to) + 14} name={sh.name} accent={s.accent ?? GOLD} wind={sh.wind} light={sh.light} />
        ))}
      </>
    ),
    Full: s.Full,
    Screen: s.Screen,
    sfx: s.sfx ?? [],
    Audio: () => (
      <>
        {s.beds.map(([id, v]) => <Bed key={id} id={id} from={from} to={to + 30} volume={v} />)}
      </>
    ),
  };
};
const at = (beat: string, word?: string, k = 0.15) => (word ? wp(beat, word, k) : B[beat].start + 4);
const shot = (name: string, beat: string, word?: string, extra: Partial<Shot> = {}): Shot => ({ name: `ep10-${name}`, at: at(beat, word), ...extra });

// ---------------- 1 · what happened ----------------
const DUEL_PARTS = ["elephantL", "elephantR", "parasolR", "riderR", "mahoutR", "legFR", "parasolW", "kingL", "glaive", "legFL", "headL", "trunkL", "soldiersL", "soldiersR"];
const C1 = {
  clash: wp("clash", "ปะทะ", 0.3),
};
const duelOffset = C1.clash - 20; // the hook's duel rig, replayed with its clash on this beat
export const e10c1 = make({
  name: "เกิดอะไรขึ้นในศึกนั้น",
  from: "free",
  to: "burned",
  years: [[B.free.start, "2127"], [B.uparaja.start, "2135"]],
  anchor: PL.donSuphan,
  cams: (w, h) => [
    { frame: B.free.start, cam: view(VW.ayut, w, h, 0.9, 0.06) },
    { frame: B.pass.start, cam: view(VW.route, w, h, 0.92, 0.06) },
    { frame: B.out.start, cam: view(VW.both, w, h, 0.92, 0.06) },
    { frame: B.charge.start, cam: view(VW.suphan, w, h, 0.95, 0.06) },
    { frame: B.known.start, cam: view(VW.both, w, h, 0.92, 0.06) },
  ],
  shots: [
    shot("s01-free", "free"),
    shot("s02-waves", "waves"),
    shot("s03-uparaja", "uparaja"),
    shot("s04-pass", "pass", "ด่าน"),
    shot("s05-route", "route", "แควน้อย"),
    shot("s06-out", "out"),
    shot("s07-musth", "musth"),
    shot("s08-charge", "charge"),
    shot("s09-shade", "shade"),
    shot("s10-invite", "invite"),
    shot("s11-eka", "eka"),
    shot("s12-rout", "eka", "แตก", { at: wp("eka", "แตก", 0.7) }),
    shot("s13-fifteen", "fifteen"),
  ],
  Map: () => (
    <>
      <FlowWarm name="ep10-duel-base" rig="ep10-duel" parts={DUEL_PARTS} from={B.clash.start - 45} to={B.clash.start + 3} />
      <CityDot at={PL.ayut} color={GOLD} r={13} start={B.free.start} />
      <PointLabel at={PL.ayut} text="กรุงศรีอยุธยา" start={B.free.start + 10} color={GOLD} size={0.85} />
      <CityDot at={PL.pass} color={RED} r={12} start={at("pass", "ด่าน")} />
      <PointLabel at={PL.pass} text="ด่านเจดีย์สามองค์" start={at("pass", "ด่าน") + 6} color={RED} size={0.85} />
      <Arrow points={ROUTE.burma} start={at("route", "แควน้อย")} end={B.out.start - 10} color={RED} width={14} variant="dashed" />
      <PointLabel at={PL.kanchanaburi} text="กาญจนบุรี" start={at("route", "กาญจนบุรี")} color={RED} size={0.7} />
      <PointLabel at={PL.suphanCity} text="สุพรรณบุรี" start={at("route", "สุพรรณบุรี")} color={RED} size={0.7} />
      <Arrow points={ROUTE.siam} start={B.out.start + 10} end={B.jan.start} color={GOLD} width={16} />
      <Battle at={PL.donSuphan} start={B.charge.start} end={B.known.end} color={RED} size={1.2} />
      <PointLabel at={PL.donSuphan} text="หนองสาหร่าย" start={B.known.start + 10} color={GOLD} size={1} />
    </>
  ),
  Full: () => (
    <FlowFull name="ep10-duel-base" rig="ep10-duel" pose={(p, f) => duelPose(p, f - duelOffset)} punch={0.04}
      start={B.clash.start} end={B.eka.start + 14} hits={[C1.clash, C1.clash + 54]} light={[0.22, 0.04]} smokeBehind={2}
      bursts={[{ at: [0.57, 0.52], frame: C1.clash }, { at: [0.64, 0.42], frame: C1.clash + 54, n: 16, color: "#fff2c8" }]} wind={[[0.8, 0.6, 1, 0.76]]} />
  ),
  sfx: [[at("pass", "ด่าน"), SFX.pop, 0.15], [at("route", "แควน้อย"), SFX.whoosh, 0.12], [B.out.start, SFX.whoosh, 0.12], [C1.clash, SFX.hit, 0.2], [C1.clash + 54, SFX.hit, 0.16]],
  beds: [["war_drums", 0.1], ["army_march_crowd", 0.08]],
});
// the duel's elephant calls ride on the chapter audio of c1 via an extra component
export const C1Audio = () => (
  <>
    <Hit id="elephant" at={C1.clash - 10} volume={0.4} />
    <Hit id="elephant" at={C1.clash + 60} volume={0.28} />
    <Bed id="sword_battle" from={B.clash.start} to={B.eka.end + 30} volume={0.1} />
  </>
);

// ---------------- 2 · looking for Nong Sarai ----------------
export const e10c2 = make({
  name: "ตามหาหนองสาหร่าย",
  from: "burned",
  to: "pin1",
  years: [[B.burned.start, "2310"], [B.prasoet.start, "2224"], [B.damrong.start, "2456"], [B.register.start, "2478"]],
  anchor: PL.ayut,
  cams: (w, h) => [
    { frame: B.burned.start, cam: view(VW.ayut, w, h, 0.9, 0.06) },
    { frame: B.common.start, cam: view(VW.siam, w, h, 0.9, 0.06) },
    { frame: B.found.start, cam: view(VW.suphan, w, h, 0.95, 0.06) },
  ],
  shots: [
    shot("s14-burned", "burned"),
    shot("s15-prasoet", "prasoet"),
    shot("s16-common", "common"),
    { ...shot("s17-damrong", "damrong"), anchor: PL.donSuphan },
    { ...shot("s18-found", "found"), anchor: PL.donSuphan },
    { ...shot("s19-visit", "visit"), anchor: PL.donSuphan },
  ],
  Map: () => (
    <>
      <Battle at={PL.ayut} start={B.burned.start} end={B.prasoet.start} color={RED} size={1.1} />
      <PointLabel at={PL.ayut} text="กรุงแตก พ.ศ. 2310" start={B.burned.start + 10} color={RED} size={0.8} />
      {[PL.donSuphan, PL.donKan, PL.suphanCity, PL.phukhao, OLD.louvo, OLD.tchainat].map((p, i) => (
        <CityDot key={i} at={p} color="#3a6a9a" r={9} start={at("common", "หนอง", 0.3) + i * 6} end={B.lost.end} />
      ))}
      <PointLabel at={PL.donSuphan} text="หนองสาหร่ายไหน?" start={B.lost.start} color={RED} size={0.8} />
      <CityDot at={PL.donSuphan} color={GOLD} r={13} start={B.found.start} />
      <PointLabel at={PL.donSuphan} text="ซากเจดีย์ร้าง · หนองสาหร่าย · ดอนเจดีย์" start={B.nearby.start} color={GOLD} size={0.8} />
    </>
  ),
  sfx: [[B.found.start, SFX.pop, 0.15], [B.nearby.start, SFX.pop, 0.12]],
  beds: [["wind", 0.1]],
});

// ---------------- 3 · site 1, Don Chedi, Suphan Buri ----------------
export const e10c3 = make({
  name: "จุดที่ 1 ดอนเจดีย์ สุพรรณบุรี",
  from: "pin1",
  to: "pin2",
  years: [[B.pin1.start, "2456"], [B.revive.start, "2493"], [B.open.start, "2502"], [B.banknote.start, "2521"]],
  anchor: PL.donSuphan,
  cams: (w, h) => [
    { frame: B.pin1.start, cam: view(VW.suphan, w, h, 0.95, 0.06) },
    { frame: B.for2.start, cam: view(VW.route, w, h, 0.92, 0.06) },
    { frame: B.shelf.start, cam: view(VW.suphan, w, h, 0.95, 0.06) },
  ],
  shots: [
    shot("s20-build", "build"),
    { name: "ep10-chedi", at: at("open"), light: [0.85, 0.08], wind: [[0.37, 0.06, 0.48, 0.26], [0, 0.34, 0.18, 0.64]] },
    shot("s21-banknote", "banknote"),
    shot("s22-hidden", "hidden"),
  ],
  Map: () => (
    <>
      <CityDot at={PL.donSuphan} color={GOLD} r={15} start={B.pin1.start} />
      <PointLabel at={PL.donSuphan} text="จุดที่ 1 · ดอนเจดีย์ สุพรรณบุรี" start={B.pin1.start + 8} color={GOLD} size={0.9} />
      <Arrow points={ROUTE.burma.slice(4)} start={B.for2.start} end={B.for3.start} color={RED} width={12} variant="dashed" />
      <Arrow points={[PL.ayut, PL.donSuphan]} start={B.for3.start} end={B.for3.start + 30} color={GOLD} width={6} variant="dashed" />
      <PointLabel at={PL.suphanCity} text="ห่างอยุธยาราว 70 กม." start={B.for3.start + 24} color={GOLD} size={0.75} />
    </>
  ),
  sfx: [[B.pin1.start, SFX.pop, 0.15], [B.for3.start, SFX.whoosh, 0.1]],
  beds: [["wind", 0.08]],
});

// ---------------- 4 · site 2, Don Chedi, Kanchanaburi ----------------
export const e10c4 = make({
  name: "จุดที่ 2 ดอนเจดีย์ กาญจนบุรี",
  from: "pin2",
  to: "pin3",
  years: [[B.pin2.start, "—"], [B.debate.start, "2515"], [B.panel.start, "2518"], [B.weak.start, "2531"], [B.kmonument.start, "2546"]],
  anchor: PL.donKan,
  accent: RED,
  cams: (w, h) => [
    { frame: B.pin2.start, cam: view(VW.both, w, h, 0.92, 0.06) },
    { frame: B.twin.start, cam: view(VW.kan, w, h, 0.95, 0.06) },
    { frame: B.close.start, cam: view(VW.route, w, h, 0.92, 0.06) },
    { frame: B.older.start, cam: view(VW.both, w, h, 0.92, 0.06) },
    { frame: B.standoff.start, cam: view(VW.both, w, h, 0.9, 0.06) },
  ],
  shots: [
    shot("s23-twin", "twin"),
    shot("s24-older", "older"),
    shot("s25-debate", "debate"),
    shot("s26-kmonument", "kmonument"),
  ],
  Map: () => (
    <>
      <CityDot at={PL.donSuphan} color={GOLD} r={12} start={B.pin2.start} />
      <Arrow points={[PL.donSuphan, PL.donKan]} start={B.pin2.start + 6} end={B.pin2.start + 40} color="#7a1f1a" width={6} variant="dashed" />
      <CityDot at={PL.donKan} color={RED} r={15} start={B.pin2.start + 36} />
      <PointLabel at={PL.donKan} text="จุดที่ 2 · ดอนเจดีย์ ต.หนองสาหร่าย" start={B.twin.start} color={RED} size={0.9} />
      <Arrow points={ROUTE.burma.slice(0, 5)} start={B.close.start} end={B.close.end} color={RED} width={12} variant="dashed" />
      <PointLabel at={PL.donSuphan} text="ดอนเจดีย์ สุพรรณ" start={B.standoff.start} color={GOLD} size={0.8} />
      <PointLabel at={PL.donKan} text="ดอนเจดีย์ กาญจน์" start={B.standoff.start + 10} color={RED} size={0.8} />
    </>
  ),
  sfx: [[B.pin2.start, SFX.whoosh, 0.12], [B.pin2.start + 36, SFX.pop, 0.15]],
  beds: [["wind", 0.08]],
});

// ---------------- 5 · site 3, near Ayutthaya ----------------
export const e10c5 = make({
  name: "จุดที่ 3 ใกล้กรุงศรี",
  from: "pin3",
  to: "more",
  years: [[B.pin3.start, "2537"]],
  anchor: PL.phukhao,
  cams: (w, h) => [
    { frame: B.pin3.start, cam: view(VW.ayut, w, h, 0.92, 0.06) },
    { frame: B.three.start, cam: view(VW.three, w, h, 0.9, 0.06) },
  ],
  shots: [shot("s27-phukhao", "phukhao"), shot("s28-burmese", "burmese")],
  Map: () => (
    <>
      <CityDot at={PL.phukhao} color="#3a6a9a" r={14} start={B.pin3.start + 6} />
      <PointLabel at={PL.phukhao} text="จุดที่ 3 · วัดภูเขาทอง" start={B.phukhao.start} color="#3a6a9a" size={0.9} />
      <CityDot at={PL.donSuphan} color={GOLD} r={13} start={B.three.start} />
      <CityDot at={PL.donKan} color={RED} r={13} start={B.three.start + 6} />
      <Arrow points={[PL.donKan, PL.donSuphan, PL.phukhao, PL.donKan]} start={B.three.start + 12} end={B.three.start + 60} color="#7a1f1a" width={5} variant="dashed" />
    </>
  ),
  sfx: [[B.pin3.start + 6, SFX.pop, 0.15], [B.three.start + 12, SFX.whoosh, 0.1]],
  beds: [["wind", 0.08]],
});

// ---------------- 6 · five accounts ----------------
export const e10c6 = make({
  name: "5 ฉบับ เล่าไม่เหมือนกัน",
  from: "more",
  to: "why",
  years: [[B.more.start, "2135"], [B.vliet.start, "ค.ศ. 1640"], [B.prasoet2.start, "ค.ศ. 1681"], [B.burma.start, "พม่า"], [B.portugal.start, "โปรตุเกส"], [B.yodaya.start, "โยดยา"], [B.date.start, "18 ม.ค."]],
  anchor: PL.donSuphan,
  cams: (w, h) => [{ frame: B.more.start, cam: view(VW.siam, w, h, 0.9, 0.06) }],
  shots: [
    shot("s29-vliet", "vliet"),
    shot("s30-vliet2", "vliet2"),
    shot("s15-prasoet", "prasoet2"),
    shot("s31-rename", "rename"),
    shot("s32-burma", "burma"),
    shot("s33-portugal", "portugal"),
    shot("s34-yodaya", "yodaya"),
    shot("s35-date", "date"),
    { name: "ep10-chedi", at: at("armyday"), light: [0.85, 0.08] },
  ],
  Map: () => (
    <>
      <CityDot at={PL.donSuphan} color={GOLD} r={12} start={B.more.start} />
      <CityDot at={PL.donKan} color={RED} r={12} start={B.more.start} />
      <CityDot at={PL.phukhao} color="#3a6a9a" r={12} start={B.more.start} />
    </>
  ),
  sfx: [[B.agree.start, SFX.pop, 0.12]],
  beds: [["wind", 0.06]],
});

// ---------------- 7 · why it cannot be found ----------------
export const e10c7 = make({
  name: "ทำไมถึงหาไม่เจอ",
  from: "why",
  to: "answer",
  years: [[B.why.start, "—"]],
  anchor: PL.donSuphan,
  cams: (w, h) => [
    { frame: B.why.start, cam: view(VW.siam, w, h, 0.9, 0.06) },
    { frame: B.r2.start, cam: view(VW.cambori, w, h, 0.9, 0.06) },
    { frame: B.r3.start, cam: view(VW.both, w, h, 0.92, 0.06) },
  ],
  shots: [shot("s14-burned", "r1"), shot("s36-empty", "r3")],
  Map: () => (
    <>
      {/* the 1770 map itself misplaces Kanchanaburi: "Cambori" is printed ~200 km too far north */}
      <CityDot at={OLD.cambori} color={RED} r={13} start={B.r2.start + 6} />
      <PointLabel at={OLD.cambori} text="Cambori = กาญจนบุรี? (แผนที่ 1770)" start={B.r2.start + 10} color={RED} size={0.8} />
      <CityDot at={PL.kanchanaburi} color={GOLD} r={13} start={B.r2.start + 30} />
      <PointLabel at={PL.kanchanaburi} text="กาญจนบุรีจริง" start={B.r2.start + 34} color={GOLD} size={0.8} />
      <Arrow points={[OLD.cambori, PL.kanchanaburi]} start={B.r2.start + 36} end={B.r2.start + 70} color="#7a1f1a" width={6} variant="dashed" />
    </>
  ),
  sfx: [[B.r2.start + 6, SFX.pop, 0.15], [B.r2.start + 36, SFX.whoosh, 0.1]],
  beds: [["wind", 0.08]],
});

// ---------------- 8 · the answer ----------------
const PollScreen = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const s = width / 1080;
  const o = interpolate(frame, [B.poll.start, B.poll.start + 12, B.next.start, B.next.start + 12], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const opts: [string, string][] = [["สุพรรณบุรี", GOLD], ["กาญจนบุรี", RED], ["อยุธยา", "#5b8fd0"]];
  return (
    <div style={{ position: "absolute", left: 60 * s, right: 60 * s, top: "40%", opacity: o, fontFamily: font, color: "#fff" }}>
      <div style={{ background: "rgba(8,14,26,0.86)", borderLeft: `${8 * s}px solid ${RED}`, borderRadius: 16 * s, padding: `${24 * s}px ${30 * s}px` }}>
        <div style={{ fontSize: 44 * s, fontWeight: 900, marginBottom: 18 * s }}>คุณเชื่อจุดไหน?</div>
        {opts.map(([t, c], i) => {
          const k = interpolate(frame, [B.poll.start + 10 + i * 8, B.poll.start + 22 + i * 8], [0, 1], clamp);
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 16 * s, margin: `${10 * s}px 0`, opacity: k, transform: `translateX(${(1 - k) * 30 * s}px)` }}>
              <div style={{ width: 44 * s, height: 44 * s, borderRadius: 22 * s, background: c, fontWeight: 900, fontSize: 28 * s, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
              <div style={{ fontSize: 40 * s, fontWeight: 700 }}>{t}</div>
            </div>
          );
        })}
        <div style={{ fontSize: 28 * s, opacity: 0.8, marginTop: 12 * s }}>พิมพ์บอกในคอมเมนต์</div>
      </div>
    </div>
  );
};
export const e10c8 = make({
  name: "คำตอบ",
  from: "answer",
  to: null,
  years: [[B.answer.start, "2135"]],
  anchor: PL.donSuphan,
  cams: (w, h) => [
    { frame: B.answer.start, cam: view(VW.route, w, h, 0.92, 0.06) },
    { frame: B.likely.start, cam: view(VW.three, w, h, 0.9, 0.06) },
  ],
  shots: [{ name: "ep10-s06-out", at: at("remain") }],
  Map: () => (
    <>
      <Arrow points={ROUTE.burma} start={B.answer.start + 10} end={B.likely.start - 10} color={GOLD} width={22} />
      <CityDot at={PL.donSuphan} color={GOLD} r={14} start={B.likely.start} />
      <CityDot at={PL.donKan} color={RED} r={14} start={B.likely.start + 6} />
      <CityDot at={PL.phukhao} color="#3a6a9a" r={14} start={B.likely.start + 12} />
      <PointLabel at={PL.donSuphan} text="จุดทางการ" start={B.likely.start + 10} color={GOLD} size={0.85} />
    </>
  ),
  Screen: PollScreen,
  sfx: [[B.answer.start + 10, SFX.whoosh, 0.12], [B.poll.start, SFX.pop, 0.15]],
  beds: [["wind", 0.08]],
});
