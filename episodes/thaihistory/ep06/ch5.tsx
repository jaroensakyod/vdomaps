import { interpolate, useCurrentFrame } from "remotion";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { Elephant } from "../nrs/kit";
import { CityDot, Measure } from "../nrs/map";
import { PL, VW } from "../nrs/places";
import { Backdrop, Grass, LostRecordsScene, PAL, RuinScene, ThroneLightScene, Tree, V2 } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 6, chapter 5 "วันไหน ที่ไหน" (beats dates → meaning): 8 or 18 January 1593, Don Chedi or Phanom Thuan,
// why the sources differ, and what victory on an elephant meant to people of the time.
const T = {
  dates: B.dates.start,
  eight: wf("dates", "แปด", 0.3),
  eighteen: wf("dates", "สิบแปด", 0.65),
  army: wf("dates", "กองทัพ", 0.9),
  where: B.where.start,
  ruin: wf("where", "ซาก", 0.55),
  kan: B.kan.start,
  pt: wf("kan", "พนมทวน", 0.45),
  both: wf("kan", "อนุสรณ์", 0.85),
  why: B.why.start,
  lost: wf("why", "หาย", 0.45),
  bigger: wf("why", "ยิ่งใหญ่", 0.9),
  mean: B.meaning.start,
};
const END = B.flip.start;

type Sc = { id: string; start: number; end: number };

// Two calendar leaves flip side by side: 8 and 18 January.
const CalendarScene = ({ id, start, end, flip2 }: Sc & { flip2: number }) => {
  const frame = useCurrentFrame();
  const k1 = interpolate(frame, [start + 10, start + 24], [0, 1], clamp);
  const k2 = interpolate(frame, [flip2, flip2 + 14], [0, 1], clamp);
  return (
    <V2 id={id} anchor={PL.nongsarai} start={start} end={end} sky={["#1a120c", "#3a2414"]} accent={GOLD} warm={0.1}>
      {(g, pan) => {
        const page = (x: number, k: number, day: string, sub: string, color: string) => (
          <g transform={`translate(${x + pan * 0.5},${g.ground - 30 * g.s}) scale(1,${0.2 + 0.8 * k})`} opacity={k}>
            <rect x={-110 * g.s} y={-250 * g.s} width={220 * g.s} height={250 * g.s} rx={12 * g.s} fill="#f4ecd8" stroke={PAL.ink} strokeWidth={2.5 * g.s} />
            <rect x={-110 * g.s} y={-250 * g.s} width={220 * g.s} height={56 * g.s} rx={12 * g.s} fill={color} />
            <text x={0} y={-208 * g.s} textAnchor="middle" fontFamily={font} fontSize={30 * g.s} fontWeight={700} fill="#fff">มกราคม 1593</text>
            <text x={0} y={-80 * g.s} textAnchor="middle" fontFamily={font} fontSize={120 * g.s} fontWeight={900} fill={PAL.ink}>{day}</text>
            <text x={0} y={-24 * g.s} textAnchor="middle" fontFamily={font} fontSize={28 * g.s} fontWeight={700} fill="#5a4a3a">{sub}</text>
          </g>
        );
        return (
          <g>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#24180f" />
            <rect x={g.x - 50 * g.s} y={g.ground - 30 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#5a3a20" />
            {page(g.x + g.W * 0.3, k1, "8", "บันทึกพม่า", RED)}
            {page(g.x + g.W * 0.7, k2, "18", "ฝั่งไทยคำนวณ", "#c99a2e")}
          </g>
        );
      }}
    </V2>
  );
};

// A modern memorial: bronze king on a war elephant on a tall plinth, flowers below (memorials at both sites).
const MemorialScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.phanomthuan} start={start} end={end} sky={["#6f8fb8", "#f2c98a"]} accent={GOLD}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.22]} />
        <rect x={g.x + g.W * 0.4 + pan * 0.5} y={g.ground - 90 * g.s} width={g.W * 0.2} height={90 * g.s} fill="#c9c0a8" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <g style={{ filter: "sepia(1) saturate(2) brightness(0.55)" }}>
          <Elephant x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 90 * g.s} s={g.s * 0.38} cloth={PAL.gilt} riderCostume={{ jacket: PAL.gilt, sash: PAL.gilt, pants: PAL.gilt, head: "crown", headColor: PAL.gilt }} />
        </g>
        {[0.3, 0.7].map((f) => <Tree key={f} x={g.x + g.W * f + pan * 0.7} y={g.ground + 10 * g.s} s={g.s * 1.1} />)}
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={g.x + g.W * (0.42 + i * 0.022) + pan * 0.5} cy={g.ground + 6 * g.s} r={7 * g.s} fill={i % 2 ? "#ffb03a" : "#f4e2a0"} />)}
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

export const e6c5: ChapterN = {
  name: "วันไหน ที่ไหน",
  from: B.dates.start,
  to: END,
  cams: (w, h) => [
    { frame: T.dates, cam: view(VW.suphan, w, h, 0.9, 0.1) },
    { frame: T.where, cam: view(VW.suphan, w, h, 0.9, 0.1) },
    { frame: T.ruin, cam: view(VW.nongsarai, w, h, 0.9, 0.1) },
    { frame: T.kan, cam: view(VW.nongsarai, w, h, 0.9, 0.1) },
    { frame: T.pt, cam: view(VW.central, w, h, 1.1, 0.1) },
    { frame: T.why, cam: view(VW.central, w, h, 1.1, 0.1) },
    { frame: T.mean, cam: view(VW.suphan, w, h, 0.9, 0.1) },
  ],
  years: [[T.dates, "2135"], [T.where, "2456"], [T.why, "2135"]],
  heads: [
    ...heads(["dates"], { dates: { chips: [{ text: "พม่า: 8 ม.ค.", f: T.eight }, { text: "ไทย: 18 ม.ค.", f: T.eighteen }, { text: "วันกองทัพไทย", f: T.army }] } }),
    ...heads(["where", "kan"]),
    ...heads(["why"], { why: { color: RED } }),
    ...heads(["meaning"]),
  ],
  Map: () => (
    <>
      <CityDot at={PL.nongsarai} color={GOLD} r={16} start={T.dates} />
      <PointLabel at={PL.nongsarai} text="ดอนเจดีย์" start={T.where + 10} color={GOLD} size={0.8} />
      <CityDot at={PL.phanomthuan} color={RED} r={14} start={T.pt - 10} />
      <PointLabel at={PL.phanomthuan} text="พนมทวน" start={T.pt} color={RED} size={0.8} />
      <Measure a={PL.nongsarai} b={PL.phanomthuan} text="ราว 60 กม." start={T.pt + 20} />
      <CityDot at={PL.ayut} color={GOLD} r={12} start={T.lost} />
      <PointLabel at={PL.ayut} text="อยุธยา 2310" start={T.lost} color={RED} size={0.7} />
    </>
  ),
  Panels: () =>
    chain(
      [
        [T.dates, (a, b) => <CalendarScene id="e6c5cal" flip2={T.eighteen} start={a} end={b} />],
        [T.where, (a, b) => <RuinScene id="e6c5ruin" start={a} end={b} />],
        [T.kan, (a, b) => <RuinScene id="e6c5ruin2" at={PL.phanomthuan} explorers={false} start={a} end={b} />],
        [T.both, (a, b) => <MemorialScene id="e6c5mem" start={a} end={b} />],
        [T.why, (a, b) => <LostRecordsScene id="e6c5lost" start={a} end={b} />],
        [T.mean, (a, b) => <ThroneLightScene id="e6c5throne" start={a} end={b} />],
      ],
      END,
    ),
  sfx: [
    [T.eight, SFX.pop, 0.3],
    [T.eighteen, SFX.pop, 0.3],
    [T.army, SFX.pop, 0.3],
    [T.pt + 20, SFX.whoosh, 0.25],
  ],
  Audio: () => (
    <>
      <Bed id="wind" from={T.dates} to={T.why} volume={0.15} />
      <Bed id="fire_big" from={T.why} to={T.mean} volume={0.2} />
      <Hit id="gong" at={T.mean + 4} volume={0.35} />
    </>
  ),
};
