import type { LineString } from "geojson";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { bbox, circleRegion } from "../../../components/Region";
import { Fighter, Glow, Grass } from "../../../components/Scene";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { Backdrop, House, Monk, PAL, Prang, River, ShadowStage, Puppet, Tree, V2 } from "../ep04/v2";
import { Balance } from "../ep04/ch1_kit";
import { Birds } from "../ep04/ch3_kit";
import { B, BRIT_C, CityDot, Empire, FR_C, MapFlag, ramp, SIAM_C, VOICE, wp, type AreaId, type Chapter5 } from "./beatsKit";
import { Compare, Slot, usePop } from "./cards";
import { ApproxTag, BoundaryStone, CEDED, MALAY, SIAM_OFF, TributeTree, VIET_COURT } from "./ch5_kit5";
import { C5, MapTable, PanelFlag, Sea, type FlagKind } from "./kit5";
import { Bed, Hit, SFX } from "./mix";
import { PL, R, VW } from "./places";

// Chapter 6 (y1904 → puppets): the price of diplomacy — 1904, 1907 and 1909 treaties, what came back, the total
// area (approximate, modern borders), tributary realms and the new single-line border, nang yai close.
const FROM = B.y1904.start;
const TO = B.inside.start;
const T = {
  price: wp("y1904", "ราคา", 0.15),
  cede: wp("y1904", "ยก", 0.4),
  lp: wp("y1904", "หลวง", 0.65),
  champ: wp("y1904", "จำปา", 0.78),
  danSai: wp("y1904", "ด่านซ้าย", 0.88),
  trat: B.trat.start,
  withdraw: wp("trat", "ถอน", 0.2),
  tratW: wp("trat", "ตราด", 0.6),
  kk: wp("trat", "กง", 0.85),
  y07: B.y1907.start,
  cede07: wp("y1907", "ยก", 0.2),
  bat: wp("y1907", "ตะบอง", 0.25),
  sr: wp("y1907", "มราฐ", 0.3),
  sis: wp("y1907", "โสภณ", 0.35),
  angkor: wp("y1907", "ปราสาท", 0.45),
  swap: wp("y1907", "แลก", 0.6),
  trat07: wp("y1907", "ตราด", 0.65),
  kut: wp("y1907", "กูด", 0.85),
  kk07: wp("y1907", "กง", 0.95),
  courts: B.courts1907.start,
  court: wp("courts1907", "ศาล", 0.8),
  y09: B.y1909.start,
  kedah: wp("y1909", "ไทรบุรี", 0.35),
  kel: wp("y1909", "กลันตัน", 0.5),
  ter: wp("y1909", "ตรัง", 0.6),
  perlis: wp("y1909", "ปะลิส", 0.75),
  uk09: wp("y1909", "อังกฤษ", 0.9),
  gain: B.gain1909.start,
  gCourt: wp("gain1909", "ศาล", 0.35),
  loan: wp("gain1909", "เงิน", 0.55),
  rail: wp("gain1909", "รถไฟ", 0.8),
  area: B.area.start,
  aLao: wp("area", "ลาว", 0.2),
  aKh: wp("area", "กัมพูชา", 0.4),
  aMy: wp("area", "มาเลเซีย", 0.5),
  aSum: wp("area", "แสน", 0.7),
  aHalf: wp("area", "ครึ่ง", 0.85),
  trib: B.tributary.start,
  vassal: wp("tributary", "ประเทศราช", 0.5),
  tribute: wp("tributary", "บรรณาการ", 0.7),
  many: wp("tributary", "หลาย", 0.85),
  bord: B.borders.start,
  infl: wp("borders", "อิทธิพล", 0.2),
  overlap: wp("borders", "ซ้อน", 0.3),
  line: wp("borders", "เส้น", 0.5),
  clear: wp("borders", "ชัดเจน", 0.6),
  choose: wp("borders", "เลือก", 0.8),
  pup: B.puppets.start,
  cut: wp("puppets", "ตัด", 0.45),
  nobody: wp("puppets", "ไม่มี", 0.8),
};

// Labels end with their part of the story (PointLabel itself never fades out).
const Lbl = ({ end, ...p }: Parameters<typeof PointLabel>[0] & { end: number }) => {
  const frame = useCurrentFrame();
  return frame < end ? <PointLabel {...p} /> : null;
};
const END_OF: Record<string, number> = {
  sayaboury: T.trat, champasak: T.trat, danSai: T.y09, chanthaburi: T.y09, trat: T.y09, kohkong: T.y09, battambang: T.y09, siemreap: T.y09, sisophon: T.y09, kohkut: T.y09,
  kedah: T.trib, kelantan: T.trib, terengganu: T.trib, perlis: T.trib, vientiane: T.bord + 30, hue: T.bord + 30, bkk: T.bord + 30,
};
const AREA_VIEW = bbox([[88.0, -16.0], [116.0, 24.0]]);

// The single hard line along the middle Mekong that replaced overlapping zones (approximate).
const HARD: [number, number][] = [[100.1, 20.3], [101.0, 19.7], [101.3, 18.4], [101.9, 17.9], [102.6, 17.95], [103.6, 17.5], [104.7, 16.6], [104.9, 15.6], [105.6, 15.2], [105.5, 14.3]];

const HardLine = ({ start }: { start: number }) => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  if (frame < start) return null;
  const p = interpolate(frame, [start, start + 30], [0, 1], clamp);
  const o = 1 - ramp(frame, TO, 15);
  const d = path({ type: "LineString", coordinates: HARD } as LineString) ?? "";
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke="#fff" strokeWidth={14 * s} strokeOpacity={0.25} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} style={{ filter: `blur(${5 * s}px)` }} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={5 * s} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} strokeLinecap="round" />
    </g>
  );
};

// Overlapping zones of influence (Siam, Lao, Vietnam) that shrink away when the hard line comes.
const Influence = () => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  const k = ramp(frame, T.infl - 6, 18) * (1 - ramp(frame, T.line, 24));
  if (k <= 0) return null;
  const circles: [[number, number], number, string][] = [[[100.9, 16.2], 3.2, GOLD], [[102.6, 18.8], 2.2, "#3fbf6a"], [[106.0, 16.6], 3.0, VIET_COURT]];
  return (
    <g opacity={k}>
      {circles.map(([c, r, col], i) => {
        const grow = 0.85 + 0.15 * Math.sin(frame * 0.08 + i * 2);
        const d = path(circleRegion(c, r * grow * (0.6 + 0.4 * k))) ?? "";
        return (
          <g key={i}>
            <path d={d} fill={col} fillOpacity={0.22} />
            <path d={d} fill="none" stroke={col} strokeWidth={3 * s} strokeDasharray={`${10 * s} ${8 * s}`} />
          </g>
        );
      })}
    </g>
  );
};

// Mekong right bank: French troops raise the tricolour as Lao villagers watch (flag rises on "ยก").
const MekongFlagScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const up = interpolate(frame, [T.cede, T.cede + 24], [0.25, 1], clamp);
  return (
    <V2 id={id} anchor={PL.luangprabang} start={start} end={end} sky={["#5a7a9a", "#f0d8a8"]} accent={FR_C} hits={[T.cede + 24]} warm={0.08}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.2, 0.25]} far="#5a6a7a" mid="#4a6a4a" ground="#6a5a3a" mist="#f4e8c8" />
          <River g={g} y={g.ground - 40 * g.s} pan={pan} color="#7a6a4a" />
          <rect x={g.x - 60 * g.s} y={g.ground - 14 * g.s} width={g.W + 120 * g.s} height={g.H} fill="#6a5a3a" />
          <Tree x={g.x + g.W * 0.9 + pan * 0.5} y={g.ground - 14 * g.s} s={g.s * 1.1} kind="palm" />
          <g transform={`translate(0,${(1 - up) * 110 * g.s})`}>
            <PanelFlag x={g.x + g.W * 0.58 + pan * 0.6} y={g.ground - 14 * g.s + (1 - up) * -110 * g.s} s={g.s} kind="fr" h={150 * up} w={56} />
          </g>
          {[0, 1, 2].map((i) => (
            <Fighter key={i} x={g.x + g.W * (0.48 + i * 0.08) + pan * 0.7} y={g.ground - 4 * g.s} scale={g.sc * 0.55} mode="stand" costume={C5.french} weapon="rifle" phase={i} />
          ))}
          {[0, 1, 2].map((i) => (
            <Fighter key={`l${i}`} x={g.x + g.W * (0.08 + i * 0.1) + pan * 1.2} y={g.ground + 34 * g.s} scale={g.sc * 0.66} mode="stand" costume={C5.lao} weapon="none" phase={i * 1.3} />
          ))}
          <Grass g={g} shift={pan * 1.6} color="#3a3a1e" />
        </g>
      )}
    </V2>
  );
};

// A coastal town of the east (Trat): palms, stilt houses, boats; a flag on the pier and troops marching.
const CoastScene = ({ id, start, end, flag, march }: { id: string; start: number; end: number; flag: FlagKind; march: "fr" | "siam" }) => (
  <V2 id={id} anchor={PL.trat} start={start} end={end} sky={flag === "fr" ? ["#4a5a7a", "#d8b890"] : ["#f0c080", "#a8d0e8"]} accent={flag === "fr" ? FR_C : GOLD} warm={0.08}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.75, 0.25]} far="#6a7a8a" mid="#4a6a4a" ground="#8a7a5a" mist="#f4e8c8" />
        <Sea g={g} y={g.ground - 30 * g.s} pan={pan} color="#3a7a8a" deep="#2a5a6a" near={false} />
        <House x={g.x + g.W * 0.62 + pan * 0.5} y={g.ground - 18 * g.s} w={100 * g.s} s={g.s} />
        <House x={g.x + g.W * 0.8 + pan * 0.5} y={g.ground - 18 * g.s} w={80 * g.s} s={g.s} />
        <Tree x={g.x + g.W * 0.55 + pan * 0.5} y={g.ground - 18 * g.s} s={g.s} kind="palm" />
        <Tree x={g.x + g.W * 0.95 + pan * 0.5} y={g.ground - 18 * g.s} s={g.s * 1.1} kind="palm" />
        <rect x={g.x - 60 * g.s} y={g.ground - 4 * g.s} width={g.W + 120 * g.s} height={g.H} fill="#a8946a" />
        <PanelFlag x={g.x + g.W * 0.45 + pan * 0.6} y={g.ground - 4 * g.s} s={g.s} kind={flag} h={130} w={54} />
        {[0, 1, 2, 3].map((i) => (
          <Fighter key={i} x={g.x + g.W * (0.04 + i * 0.09) + lt * 1.1 * g.s + pan * 0.8} y={g.ground + 22 * g.s} scale={g.sc * 0.6} mode="walk" costume={march === "fr" ? C5.french : C5.siamArmy} weapon="rifle" phase={i * 0.8} />
        ))}
        <Grass g={g} shift={pan * 1.6} color="#4a4a24" />
      </g>
    )}
  </V2>
);

// Rice-field border: officials of both sides watch a boundary stone go in; the flag beside it changes hands.
const BoundaryScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [T.cede07, T.cede07 + 18], [0, 1], clamp);
  const fr = frame >= T.cede07 + 10;
  return (
    <V2 id={id} anchor={PL.battambang} start={start} end={end} sky={["#7a9ab8", "#f0d8a8"]} accent={FR_C} hits={[T.cede07 + 16]} warm={0.08}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.8, 0.22]} far="#7a8a9a" mid="#5a7a4a" ground="#7a8a3a" mist="#f4e8c8" />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={g.x - 40 * g.s} y1={g.ground - (6 - i * 8) * g.s} x2={g.x + g.W + 40 * g.s} y2={g.ground - (6 - i * 8) * g.s} stroke="#a8b84a" strokeWidth={2 * g.s} opacity={0.5} />)}
          <Tree x={g.x + g.W * 0.12 + pan * 0.5} y={g.ground - 14 * g.s} s={g.s} kind="palm" />
          <BoundaryStone x={g.x + g.W * 0.5 + pan * 0.7} y={g.ground + 10 * g.s} s={g.s * 1.3} rise={rise} />
          <PanelFlag x={g.x + g.W * 0.56 + pan * 0.7} y={g.ground + 10 * g.s} s={g.s} kind={fr ? "fr" : "siam"} h={120} w={50} />
          <Fighter x={g.x + g.W * 0.3 + pan * 0.7} y={g.ground + 14 * g.s} scale={g.sc * 0.6} mode="stand" costume={SIAM_OFF} weapon="none" />
          <Fighter x={g.x + g.W * 0.22 + pan * 0.7} y={g.ground + 18 * g.s} scale={g.sc * 0.6} mode="stand" costume={C5.siamArmy} weapon="rifle" phase={1} />
          <Fighter x={g.x + g.W * 0.72 + pan * 0.7} y={g.ground + 14 * g.s} scale={g.sc * 0.6} flip mode="stand" costume={C5.french} weapon="rifle" phase={2} />
          <Fighter x={g.x + g.W * 0.8 + pan * 0.7} y={g.ground + 18 * g.s} scale={g.sc * 0.6} flip mode="stand" costume={C5.french} weapon="none" phase={3} />
          <Grass g={g} shift={pan * 1.6} color="#3a4a1a" />
        </g>
      )}
    </V2>
  );
};

// Angkor Wat at dawn: five towers, mist on the moat, monks walking on the causeway.
const AngkorScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.angkor} start={start} end={end} sky={["#3a3a6a", "#f0a868"]} accent={GOLD} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <Glow x={g.x + g.W * 0.5 + pan * 0.1} y={g.ground - 90 * g.s} s={g.s * 1.4} color="#ffa860" core="#ffe0b0" />
        <Birds g={g} lt={lt} />
        <rect x={g.x + g.W * 0.15 + pan * 0.3} y={g.ground - 70 * g.s} width={g.W * 0.7} height={50 * g.s} fill="#4a3a3a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
        {[[0.5, 200], [0.36, 140], [0.64, 140], [0.24, 110], [0.76, 110]].map(([f, h]) => (
          <Prang key={f} x={g.x + g.W * f + pan * 0.3} y={g.ground - 60 * g.s} h={h * g.s} s={g.s} color="#5a4a4a" />
        ))}
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={40 * g.s} fill="#f4d0a0" opacity={0.25} />
        <River g={g} y={g.ground - 20 * g.s} pan={pan} color="#5a4a5a" />
        <rect x={g.x + g.W * 0.4 + pan * 0.7} y={g.ground - 20 * g.s} width={g.W * 0.2} height={g.H} fill="#7a6a5a" />
        {[0, 1, 2].map((i) => (
          <Monk key={i} x={g.x + g.W * (0.44 + i * 0.05) + pan * 0.9} y={g.ground + 20 * g.s + i * 6 * g.s} scale={g.sc * 0.42} mode="walk" phase={i} />
        ))}
        <Grass g={g} shift={pan * 1.6} color="#2a2a1a" />
      </g>
    )}
  </V2>
);

// Malay coastal kampong: stilt houses over the water, villagers, a British officer raising the flag on "อังกฤษ".
const KampongScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const up = interpolate(frame, [T.kedah, T.uk09], [0.2, 1], clamp);
  return (
    <V2 id={id} anchor={PL.kelantan} start={start} end={end} sky={["#5a8ab0", "#f4e0b8"]} accent={BRIT_C} hits={[T.uk09]} warm={0.08}>
      {(g, pan, lt) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.3, 0.2]} far="#5a7a6a" mid="#3a6a4a" ground="#8a7a5a" mist="#f4e8c8" />
          <Sea g={g} y={g.ground - 24 * g.s} pan={pan} color="#3a8a9a" deep="#2a6a7a" near={false} />
          <House x={g.x + g.W * 0.08 + pan * 0.5} y={g.ground - 10 * g.s} w={100 * g.s} s={g.s} />
          <House x={g.x + g.W * 0.26 + pan * 0.5} y={g.ground - 10 * g.s} w={80 * g.s} s={g.s} />
          <Tree x={g.x + g.W * 0.4 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s * 1.1} kind="palm" />
          <Tree x={g.x + g.W * 0.92 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s} kind="palm" />
          <rect x={g.x - 60 * g.s} y={g.ground + 4 * g.s} width={g.W + 120 * g.s} height={g.H} fill="#c8b488" />
          <PanelFlag x={g.x + g.W * 0.68 + pan * 0.6} y={g.ground + 4 * g.s} s={g.s} kind="uk" h={60 + 80 * up} w={54} />
          <Fighter x={g.x + g.W * 0.74 + pan * 0.7} y={g.ground + 22 * g.s} scale={g.sc * 0.6} flip mode="stand" costume={C5.british} weapon="rifle" />
          {[0, 1, 2].map((i) => (
            <Fighter key={i} x={g.x + g.W * (0.3 + i * 0.1) + (i === 0 ? lt * 0.4 * g.s : 0) + pan * 1.2} y={g.ground + 40 * g.s} scale={g.sc * 0.66} mode={i === 0 ? "walk" : "stand"} costume={MALAY} weapon="none" phase={i * 1.2} />
          ))}
          <Grass g={g} shift={pan * 1.6} color="#6a6a2a" />
        </g>
      )}
    </V2>
  );
};

// Tribute procession: bearers with gold and silver trees, splitting toward two capitals.
const TributeScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const split = interpolate(frame, [T.many, T.many + 40], [0, 1], clamp);
  return (
    <V2 id={id} anchor={PL.vientiane} start={start} end={end} sky={["#6a90b8", "#f4d8a0"]} accent={GOLD} warm={0.1}>
      {(g, pan, lt) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.5, 0.22]} far="#6a7a8a" mid="#5a7a4a" ground="#8a6a40" mist="#f4e8c8" />
          <Tree x={g.x + g.W * 0.05 + pan * 0.5} y={g.ground - 14 * g.s} s={g.s} kind="palm" />
          <Tree x={g.x + g.W * 0.95 + pan * 0.5} y={g.ground - 14 * g.s} s={g.s} />
          {[0, 1, 2, 3].map((i) => {
            const dir = i < 2 ? -1 : 1;
            const x = g.x + g.W * (0.38 + i * 0.08) + dir * split * (90 + i * 10) * g.s + pan * 0.8;
            const y = g.ground + 20 * g.s;
            return (
              <g key={i}>
                <Fighter x={x} y={y} scale={g.sc * 0.56} mode="walk" costume={C5.lao} weapon="none" phase={i * 0.9} flip={dir < 0} />
                <TributeTree x={x} y={y - 150 * g.sc * 0.56} s={g.s * 0.9} metal={i % 2 ? "silver" : "gold"} />
              </g>
            );
          })}
          <g opacity={split}>
            <text x={g.x + g.W * 0.12} y={g.y + 46 * g.s} fontSize={30 * g.s} fontWeight={900} fill={GOLD} fontFamily={font} stroke={PAL.ink} strokeWidth={1.2 * g.s}>← กรุงเทพฯ</text>
            <text x={g.x + g.W * 0.88} y={g.y + 46 * g.s} textAnchor="end" fontSize={30 * g.s} fontWeight={900} fill={VIET_COURT} fontFamily={font} stroke={PAL.ink} strokeWidth={1.2 * g.s}>เว้ →</text>
          </g>
          <Grass g={g} shift={pan * 1.6} color="#4a3a1a" />
        </g>
      )}
    </V2>
  );
};

// A Siamese official over the map table, choosing where to keep the line (lamp, night).
const ChoiceScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const pen = interpolate(frame, [T.choose, T.choose + 30], [0, 1], clamp);
  return (
    <V2 id={id} anchor={[102.6, 17.95]} start={start} end={end} sky={["#1a120c", "#4a2e1a"]} accent={GOLD} hits={[T.line]} warm={0.12}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#2a1a10" />
          <Glow x={g.x + g.W * 0.7 + pan * 0.2} y={g.y + g.H * 0.3} s={g.s} color="#ffb060" core="#ffe8c0" />
          <rect x={g.x + g.W * 0.1 + pan * 0.2} y={g.y + 20 * g.s} width={g.W * 0.3} height={130 * g.s} fill="#3a2a1a" stroke="#6a4a2a" strokeWidth={3 * g.s} />
          <Fighter x={g.x + g.W * 0.24 + pan * 0.5} y={g.ground - 26 * g.s} scale={g.sc * 0.62} mode="stand" costume={SIAM_OFF} weapon="none" />
          <Fighter x={g.x + g.W * 0.8 + pan * 0.5} y={g.ground - 26 * g.s} scale={g.sc * 0.6} flip mode="stand" costume={SIAM_OFF} weapon="none" phase={2} />
          <MapTable x={g.x + g.W * 0.52 + pan * 0.8} y={g.ground - 20 * g.s} w={g.W * 0.5} s={g.s} />
          <line x1={g.x + g.W * 0.42 + pan * 0.8} y1={g.ground - 64 * g.s} x2={g.x + g.W * (0.42 + 0.2 * pen) + pan * 0.8} y2={g.ground - (64 - 34 * pen) * g.s} stroke="#fff" strokeWidth={4 * g.s} strokeLinecap="round" />
          <rect x={g.x - 40 * g.s} y={g.ground + 40 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#1a100a" transform={`translate(${pan * 1.6},0)`} />
        </g>
      )}
    </V2>
  );
};

// Nang yai: two giants (the empires) pull a cloth from both sides; small villagers stand on it; it tears on "ตัด".
const PuppetScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <ShadowStage id={id} anchor={[102.6, 17.95]} start={start} end={end}>
      {(g) => {
        const pull = Math.sin(frame * 0.12) * 10 * g.s;
        const tear = interpolate(frame, [T.cut, T.cut + 14], [0, 1], clamp);
        const y = g.ground - 10 * g.s;
        const lx = g.x + g.W * 0.2 - pull;
        const rx = g.x + g.W * 0.8 + pull;
        const mid = (lx + rx) / 2;
        const gap = tear * 30 * g.s;
        return (
          <g>
            <Puppet x={lx - 30 * g.s} y={y + 30 * g.s} s={g.s * 1.5} arm={0.4} />
            <Puppet x={rx + 30 * g.s} y={y + 30 * g.s} s={g.s * 1.5} flip arm={0.4} />
            <path d={`M${lx} ${y - 90 * g.s} L${mid - gap} ${y - 80 * g.s + tear * 20 * g.s} L${mid - gap} ${y - 60 * g.s + tear * 20 * g.s} L${lx} ${y - 70 * g.s} Z`} fill="#100a06" />
            <path d={`M${rx} ${y - 90 * g.s} L${mid + gap} ${y - 80 * g.s + tear * 20 * g.s} L${mid + gap} ${y - 60 * g.s + tear * 20 * g.s} L${rx} ${y - 70 * g.s} Z`} fill="#100a06" />
            {[-0.18, -0.06, 0.06, 0.18].map((f, i) => (
              <Puppet key={f} x={mid + f * g.W * 0.6 + (f < 0 ? -gap : gap)} y={y - 80 * g.s + tear * (16 + i * 6) * g.s} s={g.s * 0.55} kind="plain" arm={tear * 0.8} flip={f > 0} />
            ))}
          </g>
        );
      }}
    </ShadowStage>
  );
};

// Courts card: Asian subjects of France come under Thai courts — the scale tilts back a little.
const CourtCard = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const tilt = interpolate(frame, [T.court - 10, T.court + 14], [-16, -5], clamp);
  return (
    <Slot start={T.courts - 2} end={T.y09 + 8} color={GOLD} title="พ.ศ. 2450 · ศาล">
      {() => (
        <div style={{ display: "flex", alignItems: "center", gap: 24 * s, height: "100%", fontFamily: font }}>
          <svg width={260 * s} height={250 * s} viewBox="-95 -150 190 165">
            <Balance x={0} y={10} s={1.0} tilt={tilt} />
          </svg>
          <div>
            <div style={{ fontSize: 36 * s, fontWeight: 700, color: FR_C }}>คนเอเชียในบังคับฝรั่งเศส</div>
            <div style={{ fontSize: 64 * s, fontWeight: 900 }}>ขึ้นศาลไทย</div>
          </div>
        </div>
      )}
    </Slot>
  );
};

// Area tally (modern-border approximation).
const AreaCard = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const rows: [string, string, number, string][] = [
    ["ลาว", "236,800", T.aLao, FR_C],
    ["กัมพูชา (3 จังหวัด)", "~28,700", T.aKh, FR_C],
    ["มลายู (4 รัฐ)", "~38,500", T.aMy, BRIT_C],
  ];
  const ks = usePop(T.aSum);
  const kh = usePop(T.aHalf);
  const k0 = usePop(T.aLao);
  const k1 = usePop(T.aKh);
  const k2 = usePop(T.aMy);
  const kk = [k0, k1, k2];
  return (
    <Slot start={T.area} end={T.trib + 8} color={CEDED} title="ดินแดนที่ยอมยก (ตร.กม.)">
      {() => (
        <div style={{ fontFamily: font, display: "flex", flexDirection: "column", gap: 4 * s }}>
          {rows.map(([n, v, , c], i) => (
            <div key={n} style={{ display: "flex", justifyContent: "space-between", fontSize: 36 * s, fontWeight: 700, opacity: Math.min(1, kk[i]), transform: `translateX(${(1 - Math.min(1, kk[i])) * -30 * s}px)` }}>
              <span style={{ color: c }}>{n}</span>
              <span>{v}</span>
            </div>
          ))}
          <div style={{ borderTop: `${3 * s}px solid rgba(255,255,255,0.4)`, display: "flex", justifyContent: "space-between", alignItems: "baseline", opacity: Math.min(1, ks), marginTop: 4 * s }}>
            <span style={{ fontSize: 36 * s, fontWeight: 900 }}>รวม ≈</span>
            <span style={{ fontSize: 70 * s, fontWeight: 900, color: GOLD }}>304,000</span>
          </div>
          <div style={{ fontSize: 28 * s, opacity: Math.min(1, kh), display: "flex", justifyContent: "space-between" }}>
            <span>เกินครึ่งของไทยวันนี้ (~513,000)</span>
            <span style={{ opacity: 0.75 }}>ประมาณ ตามเขตแดนปัจจุบัน</span>
          </div>
        </div>
      )}
    </Slot>
  );
};

export const e5c6: Chapter5 = {
  name: "ยอมแลก",
  from: FROM,
  to: TO,
  cams: (w, h) => [
    { frame: FROM, cam: view(VW.mekong, w, h, 0.9, 0.08) },
    { frame: T.lp, cam: view(VW.mekong, w, h, 1.0, 0.08) },
    { frame: T.trat, cam: view(VW.east, w, h, 0.9, 0.08) },
    { frame: T.y07 + 10, cam: view(VW.west1907, w, h, 0.9, 0.08) },
    { frame: T.courts, cam: view(VW.west1907, w, h, 0.95, 0.08) },
    { frame: T.y09 + 10, cam: view(VW.north4, w, h, 0.9, 0.08) },
    { frame: T.loan - 10, cam: view(VW.south, w, h, 0.9, 0.08) },
    { frame: T.area, cam: view(AREA_VIEW, w, h, 0.95, 0.08) },
    { frame: T.trib, cam: view(AREA_VIEW, w, h, 1.0, 0.08) },
    { frame: T.trib + 40, cam: view(VW.mekong, w, h, 0.95, 0.08) },
    { frame: T.pup, cam: view(VW.mekong, w, h, 0.9, 0.08) },
    { frame: TO, cam: view(VW.mekong, w, h, 0.95, 0.08) },
  ],
  years: [[FROM, "2447"], [T.y07, "2450"], [T.y09, "2452"]],
  heads: [
    { f: FROM, tag: "แต่การทูตมีราคา", head: "พ.ศ. 2447 · ฝั่งขวาโขงบางส่วน", color: FR_C, chips: [{ text: "ไซยะบุรี", f: T.lp }, { text: "จำปาศักดิ์", f: T.champ }, { text: "ด่านซ้าย", f: T.danSai }] },
    { f: T.trat, tag: "ฝรั่งเศสถอนจากจันทบุรี", head: "ไปยึดตราด · เกาะกงแทน", color: FR_C },
    { f: T.y07, tag: "พ.ศ. 2450", head: "พระตะบอง เสียมราฐ ศรีโสภณ", color: FR_C },
    { f: T.swap, tag: "แลกคืนมา", head: "ตราด · ด่านซ้าย · ถึงเกาะกูด", color: GOLD, chips: [{ text: "เกาะกงไม่ได้คืน", f: T.kk07 }] },
    { f: T.y09, tag: "พ.ศ. 2452", head: "สี่รัฐมลายูให้อังกฤษ", color: BRIT_C, chips: [{ text: "ไทรบุรี", f: T.kedah }, { text: "กลันตัน", f: T.kel }, { text: "ตรังกานู", f: T.ter }, { text: "ปะลิส", f: T.perlis }] },
    { f: T.gain, tag: "แลกกับ", head: "ศาลไทย + รถไฟสายใต้", color: GOLD },
    { f: T.area, tag: "ถ้าวัดตามเขตแดนวันนี้", head: "ราว 3 แสน ตร.กม. (ประมาณ)", color: CEDED },
    { f: T.trib, tag: "แต่ส่วนใหญ่เป็น", head: "ประเทศราช ขึ้นกับหลายฝ่าย", color: GOLD },
    { f: T.bord, tag: "พรมแดนแบบเก่า", head: "เขตอิทธิพลซ้อนกันได้", color: GOLD },
    { f: T.line, tag: "โลกแบบฝรั่ง", head: "เส้นเดียวที่ชัดเจน", color: RED },
    { f: T.pup, tag: "เส้นจากห้องประชุมยุโรป", head: "ไม่มีใครถามคนในดินแดนนั้น", color: RED },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const fade = ramp(frame, FROM, 15, TO);
    const swapTo = (id: AreaId, f: number, col: string): [AreaId, string, number][] => {
      const a = ramp(frame, f, 18);
      return [[id, SIAM_C, fade * (1 - a)], [id, col, fade * a]];
    };
    const areas: [AreaId, string, number][] = [
      ["burma", BRIT_C, fade],
      ["malayaSouth", BRIT_C, fade],
      ["vietnam", FR_C, fade],
      ["cambodia", FR_C, fade],
      ["laos", FR_C, fade],
      ["thai", SIAM_C, fade],
      ...swapTo("sayaboury", T.lp, FR_C),
      ...swapTo("champasakRB", T.champ, FR_C),
      ...swapTo("bsr", T.cede07, FR_C),
      ...swapTo("kedahPerlis", T.kedah, BRIT_C),
      ...swapTo("kelantan", T.kel, BRIT_C),
      ...swapTo("terengganu", T.ter, BRIT_C),
    ];
    const ceded: [AreaId, string, number][] = [
      ["laos", CEDED, ramp(frame, T.aLao, 14, T.trib)],
      ["bsr", CEDED, ramp(frame, T.aKh, 14, T.trib)],
      ["kedahPerlis", CEDED, ramp(frame, T.aMy, 14, T.trib)],
      ["kelantan", CEDED, ramp(frame, T.aMy, 14, T.trib)],
      ["terengganu", CEDED, ramp(frame, T.aMy, 14, T.trib)],
    ];
    return (
      <>
        <Empire areas={areas} />
        <Empire areas={ceded} />
        <Empire areas={ceded} pulse={false} />
        <ApproxTag at={[101.2, 21.2]} start={T.lp} end={T.trat} />
        <Lbl at={PL.sayaboury} text="ไซยะบุรี" start={T.lp} end={END_OF["sayaboury"] ?? TO} color={FR_C} size={0.7} />
        <Lbl at={PL.champasak} text="จำปาศักดิ์" start={T.champ} end={END_OF["champasak"] ?? TO} color={FR_C} size={0.7} />
        <MapFlag at={PL.danSai} color={FR_C} start={T.danSai} end={T.trat07} />
        <Lbl at={PL.danSai} text="ด่านซ้าย" start={T.danSai} end={END_OF["danSai"] ?? TO} color={FR_C} size={0.65} />
        <MapFlag at={PL.chanthaburi} color={FR_C} start={FROM} end={T.withdraw} />
        <Arrow points={[PL.chanthaburi, [102.35, 12.45], PL.trat]} start={T.withdraw} end={T.tratW} color={FR_C} width={10} variant="dashed" opacity={1 - ramp(frame, T.y07, 12)} />
        <Lbl at={PL.chanthaburi} text="จันทบุรี" start={T.trat} end={END_OF["chanthaburi"] ?? TO} color={GOLD} size={0.7} />
        <MapFlag at={PL.trat} color={FR_C} start={T.tratW} end={T.trat07} />
        <Lbl at={PL.trat} text="ตราด" start={T.tratW} end={END_OF["trat"] ?? TO} color={FR_C} size={0.7} />
        <MapFlag at={PL.kohkong} color={FR_C} start={T.kk} end={T.y09} />
        <Lbl at={PL.kohkong} text="เกาะกง" start={T.kk} end={END_OF["kohkong"] ?? TO} color={FR_C} size={0.7} />
        <CityDot at={PL.battambang} color={FR_C} r={9} start={T.bat} end={T.courts} />
        <Lbl at={PL.battambang} text="พระตะบอง" start={T.bat} end={END_OF["battambang"] ?? TO} color={FR_C} size={0.65} />
        <Lbl at={PL.siemreap} text="เสียมราฐ" start={T.sr} end={END_OF["siemreap"] ?? TO} color={FR_C} size={0.65} />
        <Lbl at={PL.sisophon} text="ศรีโสภณ" start={T.sis} end={END_OF["sisophon"] ?? TO} color={FR_C} size={0.65} />
        <CityDot at={PL.angkor} color={GOLD} r={10} start={T.angkor} end={T.courts} />
        <ApproxTag at={[103.4, 14.9]} start={T.cede07} end={T.y09} />
        <CityDot at={PL.trat} color={GOLD} r={10} start={T.trat07 + 6} end={T.y09} />
        <CityDot at={PL.danSai} color={GOLD} r={9} start={T.trat07 + 6} end={T.y09} />
        <CityDot at={PL.kohkut} color={GOLD} r={9} start={T.kut} end={T.y09} />
        <Lbl at={PL.kohkut} text="เกาะกูด" start={T.kut} end={END_OF["kohkut"] ?? TO} color={GOLD} size={0.65} />
        <Lbl at={PL.kedah} text="ไทรบุรี" start={T.kedah} end={END_OF["kedah"] ?? TO} color={BRIT_C} size={0.65} />
        <Lbl at={PL.kelantan} text="กลันตัน" start={T.kel} end={END_OF["kelantan"] ?? TO} color={BRIT_C} size={0.65} />
        <Lbl at={PL.terengganu} text="ตรังกานู" start={T.ter} end={END_OF["terengganu"] ?? TO} color={BRIT_C} size={0.65} />
        <Lbl at={PL.perlis} text="ปะลิส" start={T.perlis} end={END_OF["perlis"] ?? TO} color={BRIT_C} size={0.65} />
        <ApproxTag at={[101.8, 3.6]} start={T.kedah} end={T.area} />
        <Arrow points={R.railSouth} start={T.rail - 30} end={T.rail + 50} color={GOLD} width={10} opacity={1 - ramp(frame, T.area, 15)} />
        <ApproxTag at={[100.5, 0.6]} start={T.area + 10} end={T.trib} text="ประมาณ ตามเขตแดนปัจจุบัน" />
        <CityDot at={PL.vientiane} color="#3fbf6a" r={11} start={T.trib} end={T.bord} />
        <PointLabel at={PL.vientiane} text="เวียงจันทน์" start={T.trib + 10} color="#3fbf6a" size={0.7} />
        <Arrow points={R.tributeA} start={T.tribute} end={T.tribute + 30} color={GOLD} width={10} variant="dashed" opacity={1 - ramp(frame, T.bord + 20, 15)} />
        <Arrow points={R.tributeB} start={T.many} end={T.many + 30} color={VIET_COURT} width={10} variant="dashed" opacity={1 - ramp(frame, T.bord + 20, 15)} />
        <Lbl at={PL.hue} text="เว้" start={T.many} end={END_OF["hue"] ?? TO} color={VIET_COURT} size={0.7} />
        <Lbl at={PL.bkk} text="กรุงเทพฯ" start={T.tribute} end={END_OF["bkk"] ?? TO} color={GOLD} size={0.7} />
        <Influence />
        <HardLine start={T.line} />
        <ApproxTag at={[103.2, 19.4]} start={T.clear} end={TO} />
      </>
    );
  },
  Panels: () => (
    <>
      <MekongFlagScene id="e5c6mekong" start={FROM} end={T.trat + 14} />
      <CoastScene id="e5c6trat" start={T.trat} end={T.y07 + 14} flag="fr" march="fr" />
      <BoundaryScene id="e5c6bound" start={T.y07} end={T.angkor + 14} />
      <AngkorScene id="e5c6angkor" start={T.angkor} end={T.trat07 + 14} />
      <CoastScene id="e5c6back" start={T.trat07} end={T.courts + 6} flag="siam" march="siam" />
      <KampongScene id="e5c6malay" start={T.y09} end={T.gain + 6} />
      <TributeScene id="e5c6trib" start={T.trib} end={T.bord + 14} />
      <ChoiceScene id="e5c6choice" start={T.bord} end={T.pup + 14} />
      <PuppetScene id="e5c6pup" start={T.pup} end={TO + 14} />
    </>
  ),
  Screen: () => (
    <>
      <CourtCard />
      <Compare
        start={T.gain - 2}
        end={T.area + 6}
        title="พ.ศ. 2452 · แลกกัน"
        left={{ tag: "สยามยอมยก", text: "4 รัฐมลายู", color: BRIT_C, f: T.gain, icon: "book" }}
        right={{ tag: "สยามได้", text: "ศาลไทยมากขึ้น + เงินกู้สร้างรถไฟสายใต้", color: GOLD, f: T.gCourt, icon: "thai" }}
        vs="⇄"
      />
      <AreaCard />
    </>
  ),
  sfx: [
    [T.lp, SFX.pop, 0.25],
    [T.champ, SFX.pop, 0.25],
    [T.danSai, SFX.pop, 0.25],
    [T.bat, SFX.pop, 0.25],
    [T.sr, SFX.pop, 0.25],
    [T.sis, SFX.pop, 0.25],
    [T.kedah, SFX.pop, 0.25],
    [T.kel, SFX.pop, 0.25],
    [T.ter, SFX.pop, 0.25],
    [T.perlis, SFX.pop, 0.25],
    [T.aLao, SFX.pop, 0.3],
    [T.aKh, SFX.pop, 0.3],
    [T.aMy, SFX.pop, 0.3],
    [T.aSum, SFX.swell, 0.3],
    [T.many, SFX.whoosh, 0.25],
  ],
  Audio: () => (
    <>
      <Bed id="wind" from={FROM} to={T.trat + 10} volume={0.15} voice={VOICE} />
      <Hit id="wood_hit" at={T.cede + 24} volume={0.5} />
      <Bed id="sea_rough" from={T.trat} to={T.y07 + 10} volume={0.15} voice={VOICE} />
      <Hit id="war_drums" at={T.tratW} volume={0.35} />
      <Bed id="wind" from={T.y07} to={T.angkor + 10} volume={0.12} voice={VOICE} />
      <Hit id="wood_hit" at={T.cede07 + 16} volume={0.5} />
      <Hit id="gong" at={T.angkor + 4} volume={0.4} />
      <Bed id="sea_rough" from={T.trat07} to={T.courts + 6} volume={0.12} voice={VOICE} />
      <Hit id="crowd_cheer" at={T.trat07 + 6} volume={0.25} />
      <Hit id="wood_hit" at={T.court} volume={0.5} />
      <Bed id="sea_rough" from={T.y09} to={T.gain + 6} volume={0.15} voice={VOICE} />
      <Hit id="ship_bell" at={T.uk09} volume={0.35} />
      <Hit id="electric_switch" at={T.rail} volume={0.3} />
      <Bed id="war_drums" from={T.trib} to={T.bord + 10} volume={0.12} voice={VOICE} />
      <Hit id="gong" at={T.tribute} volume={0.35} />
      <Bed id="wind" from={T.bord} to={T.pup + 10} volume={0.15} voice={VOICE} />
      <Hit id="sword_draw" at={T.line} volume={0.45} />
      <Bed id="fire_crackle" from={T.pup} to={TO + 14} volume={0.2} voice={VOICE} />
      <Hit id="wood_break" at={T.cut} volume={0.45} />
    </>
  ),
};
