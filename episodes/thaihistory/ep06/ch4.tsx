import { interpolate, useCurrentFrame } from "remotion";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { C, Elephant, Parabaik } from "../nrs/kit";
import { CityDot, MapTag } from "../nrs/map";
import { PL, VW } from "../nrs/places";
import { Backdrop, Candle, DuelSilhouetteScene, DutchScene, Fighter, Grass, LostRecordsScene, PAL, ScribeScene, V2 } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 6, chapter 4 "หลักฐานเล่าไม่ตรงกัน" (beats warn → agree): the oldest Thai chronicle, van Vliet, the Burmese
// Hmannan, the Portuguese reports and the Yodaya chronicle side by side — and the three things they all agree on.
const T = {
  warn: B.warn.start,
  pr: B.prasoet.start,
  arm: wf("prasoet", "พระกร", 0.85),
  vl: B.vliet.start,
  fifty: wf("vliet", "ห้าสิบ", 0.35),
  lance: wf("vliet", "หอก", 0.85),
  bu: B.burma.start,
  gun: wf("burma", "ปืน", 0.7),
  noDuel: wf("burma", "ตัว", 0.9),
  hold: B.hold.start,
  pt: B.portugal.start,
  merc: wf("portugal", "รับจ้าง", 0.75),
  yo: B.yodaya.start,
  kill: wf("yodaya", "สังหาร", 0.8),
  agree: B.agree.start,
  one: wf("agree", "จริง", 0.45),
  two: wf("agree", "เอง", 0.7),
  three: wf("agree", "ช้าง", 0.95),
};
const END = B.dates.start;

type Sc = { id: string; start: number; end: number };

// At dusk the Burmese crown prince's elephant turns away from the fight; a rider behind holds the prince upright.
const HoldScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.nongsarai} start={start} end={end} sky={["#3a2a4a", "#d07a4a"]} accent={RED} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.45]} lightColor={["#ff9a5a", "#ffe0a0"]} far="#4a3a4a" mid="#3a3030" ground="#3a2a1a" />
        <Elephant x={g.x + g.W * 0.55 - lt * 0.3 * g.s + pan * 0.6} y={g.ground + 16 * g.s} s={g.s * 0.52} flip walk={0.6} cloth={PAL.chalk} trim="#7a2a22" riderCostume={C.burmaPrince} slump={0.35} umbrella />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.78 + i * 0.07) - lt * 0.3 * g.s + pan * 0.8} y={g.ground + 26 * g.s} scale={g.sc * 0.5} flip mode="walk" costume={C.burma} phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#2a2014" />
      </g>
    )}
  </V2>
);

// Portuguese mercenaries with matchlocks march beside a Siamese war elephant.
const PortoScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#6f8fb8", "#f2c98a"]} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.22]} />
        <Elephant x={g.x + g.W * 0.7 + lt * 0.3 * g.s + pan * 0.5} y={g.ground + 8 * g.s} s={g.s * 0.42} walk={1} cloth={RED} trim={PAL.gilt} riderCostume={C.prince} />
        {Array.from({ length: 5 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.08 + i * 0.09) + lt * 0.3 * g.s + pan * 0.7} y={g.ground + 22 * g.s} scale={g.sc * 0.58} mode="walk" costume={C.porto} weapon="rifle" phase={i} />)}
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// An Ayutthaya chronicle in Burmese script, open beside a painted page of two elephants (the Yodaya chronicle).
const YodayaScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.pegu} start={start} end={end} sky={["#1a120c", "#3a2414"]} accent={GOLD} warm={0.1}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#24180f" />
        <rect x={g.x - 50 * g.s} y={g.ground - 40 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#5a3a20" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <Parabaik x={g.x + g.W * 0.12 + pan * 0.5} y={g.ground - 44 * g.s} w={240 * g.s} s={g.s} />
        <g transform={`translate(${g.x + g.W * 0.5 + pan * 0.6},${g.ground - 44 * g.s})`}>
          <rect x={0} y={-150 * g.s} width={260 * g.s} height={150 * g.s} fill="#e9dcc0" stroke={PAL.ink} strokeWidth={2 * g.s} />
          <Elephant x={70 * g.s} y={-20 * g.s} s={g.s * 0.22} cloth={RED} riderCostume={C.prince} />
          <Elephant x={190 * g.s} y={-20 * g.s} s={g.s * 0.22} flip cloth={PAL.chalk} trim="#7a2a22" riderCostume={C.burmaPrince} />
        </g>
        <Candle x={g.x + g.W * 0.92 + pan * 0.6} y={g.ground - 40 * g.s} s={g.s * 1.4} />
      </g>
    )}
  </V2>
);

export const e6c4: ChapterN = {
  name: "หลักฐานเล่าไม่ตรงกัน",
  from: B.warn.start,
  to: END,
  cams: (w, h) => [
    { frame: T.warn, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.vl, cam: view(VW.central, w, h, 0.8, 0.1) },
    { frame: T.bu, cam: view(VW.pegu, w, h, 0.9, 0.1) },
    { frame: T.pt, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.yo, cam: view(VW.pegu, w, h, 0.9, 0.1) },
    { frame: T.agree, cam: view(VW.suphan, w, h, 0.9, 0.1) },
  ],
  years: [[T.warn, "2135"]],
  heads: [
    ...heads(["warn"], { warn: { color: RED } }),
    ...heads(["prasoet"], { prasoet: { stat: "ราว 2223", label: "ฉบับเก่าที่สุดของไทย" } }),
    ...heads(["vliet"], { vliet: { stat: "ค.ศ. 1640", label: "เกือบ 50 ปีหลังศึก" } }),
    ...heads(["burma", "hold"], { burma: { color: RED }, hold: { color: RED } }),
    ...heads(["portugal", "yodaya"]),
    ...heads(["agree"], { agree: { chips: [{ text: "① รบบนหลังช้างจริง", f: T.one }, { text: "② พระนเรศวรอยู่ในศึก", f: T.two }, { text: "③ พระมหาอุปราชาสิ้นพระชนม์", f: T.three }] } }),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const o = interpolate(frame, [T.agree, T.agree + 15], [0, 1], clamp);
    return (
      <>
        <CityDot at={PL.ayut} color={GOLD} r={14} start={T.warn} />
        <PointLabel at={PL.ayut} text="อยุธยา" start={T.vl} color={GOLD} size={0.8} />
        <CityDot at={PL.pegu} color={RED} r={14} start={T.bu} />
        <PointLabel at={PL.pegu} text="หงสาวดี" start={T.bu + 10} color={RED} size={0.8} />
        <MapTag at={[99.0, 15.4]} text="ง้าว · หอก · ปืน ?" start={T.pt} end={T.agree} color={GOLD} size={40} />
        <CityDot at={PL.nongsarai} color={GOLD} r={14 + o * 6} start={T.agree} />
        <PointLabel at={PL.nongsarai} text="หนองสาหร่าย" start={T.agree + 6} color={GOLD} size={0.8} />
      </>
    );
  },
  Panels: () =>
    chain(
      [
        [T.warn, (a, b) => <LostRecordsScene id="e6c4lost" start={a} end={b} />],
        [T.pr, (a, b) => <ScribeScene id="e6c4khoi" book="khoi" at={PL.ayut} start={a} end={b} />],
        [T.vl, (a, b) => <DutchScene id="e6c4dutch" start={a} end={b} />],
        [T.bu, (a, b) => <ScribeScene id="e6c4para" start={a} end={b} />],
        [T.hold, (a, b) => <HoldScene id="e6c4hold" start={a} end={b} />],
        [T.pt, (a, b) => <PortoScene id="e6c4porto" start={a} end={b} />],
        [T.yo, (a, b) => <YodayaScene id="e6c4yod" start={a} end={b} />],
        [T.agree, (a, b) => <DuelSilhouetteScene id="e6c4agree" start={a} end={b} />],
      ],
      END,
    ),
  sfx: [
    [T.arm, SFX.pop, 0.3],
    [T.lance, SFX.pop, 0.3],
    [T.gun, SFX.pop, 0.3],
    [T.one, SFX.pop, 0.3],
    [T.two, SFX.pop, 0.3],
    [T.three, SFX.pop, 0.3],
  ],
  Audio: () => (
    <>
      <Bed id="fire_crackle" from={T.warn} to={T.hold} volume={0.15} />
      <Hit id="ship_bell" at={T.vl + 10} volume={0.25} />
      <Hit id="rifle_echo" at={T.gun} volume={0.35} />
      <Bed id="wind" from={T.hold} to={T.pt} volume={0.18} />
      <Bed id="army_marching" from={T.pt} to={T.yo} volume={0.15} />
      <Hit id="elephant" at={T.agree + 20} volume={0.45} />
      <Bed id="war_drums" from={T.agree} to={END} volume={0.2} />
    </>
  ),
};
