import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { camAt, type Cam, type CamKey } from "../../../components/camera";
import { MapFrame } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats, totalFrames } from "../../../components/subs.mjs";
import type { Beat } from "../../../components/subs.mjs";
import { FormulaCard, IconPanel, ListPanel, PollCard, Stamp } from "../kit/Cards";
import { FloodDiagram, HighGroundDiagram, TunnelDiagram } from "../kit/Diagram";
import { Chip, Locator, LowerCard, QuestionBadge, QuizCard, QuoteCard, SplitCard, YearBadge } from "../kit/Hud";
import { Boat, Camp, Cannon, Chain, Cloud, Crown, Elephant, Fire, Fort, Hourglass, Junk, Pot, RicePlant, RiceSack, Rider, scatter, Smoke, Soldier, Stupa, Sun, WhiteFlag } from "../kit/Icons";
import { At, CountryTint, fitArea, Flood, Place, ThMap, WaterLabel } from "../kit/Map";
import { C, clamp, fade, fonts, useUnit } from "../kit/theme";
import beatsText from "./beats.json";
import timing from "./timing.json";

// เสียกรุงศรีอยุธยา · one continuous 9:16 video (~10 min). Every frame hangs off beat timing (timing.json).
type BeatText = { id: string; card?: [string, string] };
const LAYOUT = { lead: 3, gap: 16 }; // VO starts on frame 3 (hook), roomier pauses for long-form
export const BEATS: Beat[] = buildBeats(timing, beatsText, LAYOUT);
export const TOTAL = totalFrames(BEATS, LAYOUT);
const B = Object.fromEntries(BEATS.map((b) => [b.id, b])) as Record<string, Beat>;
const at = (id: string, k = 0) => {
  if (!B[id]) throw new Error(`no beat "${id}"`);
  return Math.round(B[id].start + B[id].len * k);
};
const CARDS = Object.fromEntries((beatsText as unknown as BeatText[]).map((b) => [b.id, b.card ?? ["", ""]]));
export const THUMB = at("hook", 0.7);

// Places (lon, lat). Siege/route points are approximate — said in the description, not on screen.
const P = {
  ayut: [100.566, 14.357],
  huaro: [100.578, 14.366],
  ava: [96.08, 21.9],
  cm: [98.98, 18.79],
  lp: [102.13, 19.89],
  tavoy: [98.19, 14.08],
  kan: [99.53, 14.02],
  rat: [99.81, 13.54],
  bang: [100.33, 14.9],
  tak: [99.13, 16.88],
  nayok: [101.21, 14.2],
  prachin: [101.37, 14.05],
  chon: [100.98, 13.36],
  rayong: [101.28, 12.68],
  chan: [102.1, 12.61],
  posamton: [100.545, 14.3],
  thon: [100.49, 13.74],
  mouth: [100.58, 13.52],
  mahathat: [100.567, 14.357],
} satisfies Record<string, [number, number]>;

const V = {
  island: bbox([[100.535, 14.33], [100.6, 14.385]]),
  plain: bbox([[100.25, 14.05], [100.9, 14.65]]),
  central: bbox([[99.4, 13.3], [101.6, 15.4]]),
  sea: bbox([[92, 4], [112, 24]]),
  region: bbox([[96.4, 12.6], [102.8, 22.3]]),
  north: bbox([[95.2, 12.8], [104.2, 25.2]]),
  west: bbox([[97.6, 11.8], [101.0, 15.0]]),
  bang: bbox([[100.15, 14.72], [100.55, 15.06]]),
  east: bbox([[100.0, 12.4], [101.9, 14.9]]),
  chan: bbox([[101.6, 12.3], [102.5, 12.95]]),
  fleet: bbox([[100.2, 12.3], [102.3, 14.5]]),
  thon: bbox([[100.3, 13.6], [100.75, 14.45]]),
};
type View = keyof typeof V;

// Camera: [beat id, fraction into the beat, view, move frames].
const SHOTS: [string, number, View, number?][] = [
  ["hook", 0, "island"],
  ["go", 0.3, "sea", 40],
  ["island", 0, "island", 30],
  ["trade", 0, "sea", 30],
  ["weapon", 0, "plain", 30],
  ["worked", 0, "central", 30],
  ["burma", 0, "region", 35],
  ["y2303", 0, "west", 30],
  ["son", 0, "region", 30],
  ["ayutthaya", 0, "plain", 30],
  ["plan", 0, "region", 30],
  ["close", 0.1, "central", 35],
  ["butfirst", 0.2, "bang", 45],
  ["siege", 0, "plain", 40],
  ["inside", 0, "island", 30],
  ["china", 0, "north", 35],
  ["onemore", 0, "plain", 35],
  ["breakout", 0, "east", 35],
  ["three", 0, "island", 30],
  ["captives", 0, "region", 35],
  ["king", 0, "island", 30],
  ["answer", 0, "plain", 30],
  ["leave", 0, "region", 30],
  ["chanthaburi", 0, "chan", 40],
  ["return", 0, "fleet", 30],
  ["thonburi", 0, "thon", 30],
  ["today", 0, "island", 40],
  ["poll", 0, "central", 60],
];

// Year badge per beat id (last one applies until the next).
const YEARS: [string, string, string?][] = [
  ["hook", "2310", "7 เมษายน"],
  ["island", "1893"],
  ["season", "ทุกปี"],
  ["burma", "2303"],
  ["son", "2306"],
  ["ayutthaya", "2308"],
  ["close", "2309"],
  ["rain", "2309", "หน้าน้ำ"],
  ["inside", "2310", "มกราคม"],
  ["burmatoo", "2310", "มีนาคม"],
  ["china", "2310"],
  ["taksin", "2310", "มกราคม"],
  ["huaro", "2310", "เมษายน"],
  ["collapse", "2310", "7 เมษายน"],
  ["answer", "2310"],
  ["chanthaburi", "2310", "มิถุนายน"],
  ["return", "2310", "พฤศจิกายน"],
  ["thonburi", "2311"],
  ["today", "วันนี้"],
];

const ids = BEATS.map((b) => b.id);
const between = (f: number, a: string, b: string) => f >= B[a].start && f < B[b].end + 8;

// A ring of Burmese siege camps around a point.
const Ring = ({ center, r, n, size, k = 1, seed = "ring" }: { center: [number, number]; r: number; n: number; size: number; k?: number; seed?: string }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + 0.3;
      const kk = interpolate(k, [i / n / 1.4, i / n / 1.4 + 0.3], [0, 1], clamp);
      return (
        <At key={`${seed}${i}`} at={[center[0] + Math.cos(a) * r * 1.03, center[1] + Math.sin(a) * r]}>
          {(x, y, s) => <Camp x={x} y={y} size={size * s} k={kk} phase={i} />}
        </At>
      );
    })}
  </>
);

const Sounds = () => (
  <>
    <Sfx src={SFX.hit} at={0} volume={0.55} />
    <Sfx src={SFX.swell} at={0} volume={0.3} />
    <Sfx src={SFX.pop} at={at("question", 0.1)} volume={0.35} />
    <Sfx src={SFX.whoosh} at={at("go", 0.25)} volume={0.6} />
    {SHOTS.slice(2).map(([id, k]) => <Sfx key={`w${id}`} src={SFX.whoosh} at={at(id, k) - 6} volume={0.35} />)}
    {["formula", "lesson", "leaders", "quiz1", "quiz2", "answer", "poll"].map((id) => <Sfx key={`p${id}`} src={SFX.pop} at={at(id, 0.05)} volume={0.35} />)}
    {["quiz1a", "quiz2a"].map((id) => <Sfx key={`t${id}`} src={SFX.tick} at={at(id)} volume={0.4} />)}
    {["pincer", "close", "nomove", "collapse", "breach", "end417", "spoiler", "compare"].filter((id) => B[id]).map((id) => <Sfx key={`h${id}`} src={SFX.hit} at={at(id, id === "nomove" ? 0.35 : 0.05)} volume={0.5} />)}
    <Sfx src={SFX.riser} at={at("three") - 10} volume={0.3} />
    <Sfx src={SFX.hit} at={at("pots", 0.1)} volume={0.45} />
    <Sfx src={SFX.hit} at={at("cast", 0.6)} volume={0.35} />
  </>
);

export const Ep01 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { s } = useUnit();
  const cam: Cam = camAt(
    SHOTS.flatMap(([id, k, view, move = 30]) => {
      const f = at(id, k);
      const c = fitArea(V[view], width, height);
      return [{ frame: f, cam: c }] as CamKey[];
    }).reduce<CamKey[]>((keys, key, i) => {
      // each shot holds until the next one starts moving
      const [, , , move = 30] = SHOTS[i];
      if (i === 0) return [{ frame: 0, cam: { ...key.cam, scale: key.cam.scale * 1.12 } }, { frame: at("question"), cam: key.cam }];
      const prev = keys[keys.length - 1];
      return [...keys, { frame: Math.max(prev.frame + 1, key.frame), cam: prev.cam }, { frame: Math.max(prev.frame + 2, key.frame + move), cam: key.cam }];
    }, []),
    frame,
  );

  const yearRow = [...YEARS].reverse().find(([id]) => frame >= at(id)) ?? YEARS[0];
  const goRoll = between(frame, "go", "go") ? Math.round(interpolate(frame, [at("go", 0.2), B.go.end], [2310, 1893], clamp)) : null;
  const threeRoll = between(frame, "three", "three") ? ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน"][Math.min(3, Math.floor(interpolate(frame, [at("three"), B.three.end], [0, 3.99], clamp)))] : null;

  const night = Math.max(fade(frame, -1, 0, at("question", 0.7), B.go.start + 10), fade(frame, B.breach.start - 20, B.breach.start, B.end417.end, B.end417.end + 20));
  const flood = Math.max(
    fade(frame, at("season", 0.45), at("season", 0.9), B.worked.start, B.worked.start + 20),
    fade(frame, at("rain", 0.1), B.rain.end, B.inside.start, B.inside.start + 15),
  );
  const glow = {
    แม่น้ำเจ้าพระยา: fade(frame, at("island", 0.4), at("island", 0.5), B.trade.start, B.trade.start + 10),
    แม่น้ำลพบุรี: fade(frame, at("island", 0.55), at("island", 0.65), B.trade.start, B.trade.start + 10),
    แม่น้ำป่าสัก: fade(frame, at("island", 0.72), at("island", 0.82), B.trade.start, B.trade.start + 10),
  };
  const ring = interpolate(frame, [at("close", 0.2), at("close", 0.9)], [0, 1], clamp);
  const siegeOn = frame >= at("close", 0.2) && frame < B.collapse.start;
  const burnt = interpolate(frame, [B.breach.start, B.fire.end], [0, 1], clamp);
  const fortColor = frame >= at("breach", 0.6) && frame < B.leave.start ? C.burma : C.ayut;

  // --- Map layer --------------------------------------------------------------------------------------------
  const mapLayer = (
    <MapFrame cam={cam}>
      <ThMap under={<Flood at={P.ayut} radius={0.32} k={flood} squash={1.1} />} glow={glow} night={night}>
        {night > 0 && (
          <>
            <defs>
              <radialGradient id="glow">
                <stop offset="0" stopColor="#ff9a3c" stopOpacity={0.55} />
                <stop offset="1" stopColor="#ff9a3c" stopOpacity={0} />
              </radialGradient>
            </defs>
            <At at={P.ayut}>{(x, y) => <circle cx={x} cy={y} r={520 * s} fill="url(#glow)" opacity={night} />}</At>
          </>
        )}

        {/* Burma tint (the new dynasty) */}
        <CountryTint id="104" color={C.burma} k={fade(frame, at("burma", 0.1), at("burma", 0.4), B.ayutthaya.start, B.ayutthaya.start + 15)} />
        <CountryTint id="104" color={C.burma} k={0.6 * fade(frame, at("plan"), at("plan", 0.3), B.close.start, B.close.start + 15)} />
        <CountryTint id="156" color={C.china} k={fade(frame, at("china", 0.1), at("china", 0.4), B.onemore.start, B.onemore.start + 10)} />

        {/* City of Ayutthaya — always there */}
        <At at={P.ayut}>{(x, y) => {
          const pxDeg = 1;
          void pxDeg;
          const big = cam.scale > 200000;
          const size = big ? 360 * s : cam.scale > 30000 ? 120 * s : 70 * s;
          return <Fort x={x} y={y + size * (big ? 0.42 : 0.4)} size={size} burnt={Math.max(burnt, frame < B.question.end ? 0.6 : 0, frame >= B.today.start ? 1 : 0)} color={fortColor} />;
        }}</At>

        {/* Hook: the night of the fall (also replayed at the breach) */}
        {(frame < B.go.start + 20 || between(frame, "breach", "end417")) &&
          scatter(9, "fire", 0.014, 0.01).map(([dx, dy], i) => (
            <At key={`f${i}`} at={[P.ayut[0] + dx, P.ayut[1] + dy]}>{(x, y) => <Fire x={x} y={y} size={(70 + (i % 3) * 20) * s * (frame < B.go.start + 20 ? 1 : interpolate(frame, [B.breach.start + i * 6, B.breach.start + i * 6 + 20], [0, 1], clamp))} phase={i} seed={i} />}</At>
          ))}
        {(frame < B.go.start + 20 || between(frame, "breach", "fire")) && (() => {
          const a = frame < B.go.start ? 0 : B.breach.start;
          const pour = interpolate(frame, [a, a + 80], [0, 1], clamp);
          return scatter(12, "pour", 0.007, 0.004).map(([dx, dy], i) => (
            <At key={`p${i}`} at={[P.huaro[0] + 0.012 - 0.016 * pour + dx, P.huaro[1] + 0.008 - 0.01 * pour + dy]}>
              {(x, y) => <Soldier x={x} y={y} size={70 * s} walk flip hold={i % 3 ? "spear" : "torch"} phase={i} />}
            </At>
          ));
        })()}

        {/* Island beat: rivers + labels */}
        {between(frame, "island", "island") && (
          <>
            <WaterLabel at={[100.545, 14.343]} name="เจ้าพระยา" k={glow["แม่น้ำเจ้าพระยา"]} rotate={-60} />
            <WaterLabel at={[100.565, 14.372]} name="ลพบุรี" k={glow["แม่น้ำลพบุรี"]} />
            <WaterLabel at={[100.588, 14.35]} name="ป่าสัก" k={glow["แม่น้ำป่าสัก"]} rotate={80} />
          </>
        )}

        {/* Trade: junks sailing up from the sea */}
        {between(frame, "trade", "trade") && (
          <>
            {[[[108, 18], [104, 11], P.mouth], [[112, 22], [106, 13], P.mouth], [[92, 8], [97.5, 6.5], [100.3, 7.5], [101, 11], P.mouth], [[93, 15], [97, 8], [99.6, 9], P.mouth], [[110, 6], [104, 8], [101.5, 11.5], P.mouth]].map((pts, i) => (
              <Arrow key={i} points={pts as [number, number][]} start={at("trade", 0.05 + i * 0.1)} end={at("trade", 0.45 + i * 0.1)} color="#8e5530" width={9} variant="dashed" />
            ))}
            {[[104.5, 10.5], [106.5, 14.5], [98, 7.2], [97.6, 9.5], [103.5, 8.6]].map((pt, i) => (
              <At key={`j${i}`} at={pt as [number, number]}>{(x, y) => <Junk x={x} y={y} size={70 * s} k={fade(frame, at("trade", 0.1 + i * 0.1), at("trade", 0.2 + i * 0.1))} phase={i} />}</At>
            ))}
            <Place at={[106.5, 16.5]} name="จีน · ญี่ปุ่น" k={fade(frame, at("trade", 0.15), at("trade", 0.25))} color={C.china} />
            <Place at={[93.5, 13]} name="อินเดีย · เปอร์เซีย" k={fade(frame, at("trade", 0.4), at("trade", 0.5))} color={C.china} />
            <Place at={[93.5, 6]} name="ฝรั่ง" k={fade(frame, at("trade", 0.6), at("trade", 0.7))} color={C.china} />
          </>
        )}

        {/* Seasons */}
        {between(frame, "season", "diagram1") && (
          <>
            <At at={[100.35, 14.6]}>{(x, y) => <Sun x={x} y={y} size={150 * s} k={fade(frame, at("season"), at("season", 0.05), at("season", 0.4), at("season", 0.45))} />}</At>
            <At at={[100.35, 14.6]}>{(x, y) => <Cloud x={x} y={y} size={170 * s} k={fade(frame, at("season", 0.42), at("season", 0.5))} />}</At>
            <At at={[100.78, 14.55]}>{(x, y) => <Cloud x={x} y={y} size={130 * s} phase={3} k={fade(frame, at("season", 0.5), at("season", 0.6))} />}</At>
          </>
        )}

        {/* Worked: enemies came and left */}
        {between(frame, "worked", "worked") &&
          [[[99.5, 14.6], [100.4, 14.4]], [[99.6, 13.6], [100.4, 14.25]], [[100.6, 15.3], [100.57, 14.5]]].map((pts, i) => (
            <g key={i} opacity={fade(frame, at("worked", 0.2 + i * 0.1), at("worked", 0.3 + i * 0.1), at("worked", 0.7 + i * 0.08), at("worked", 0.8 + i * 0.08))}>
              <Arrow points={pts as [number, number][]} start={at("worked", 0.05 + i * 0.1)} end={at("worked", 0.3 + i * 0.1)} color={C.burma} width={18} />
            </g>
          ))}

        {/* Burma + Alaungpaya 1760 */}
        {between(frame, "burma", "twoversions") && (
          <>
            <At at={P.ava}>{(x, y) => <Crown x={x} y={y} size={90 * s} color={C.burma} k={fade(frame, at("burma", 0.3), at("burma", 0.4))} />}</At>
            <Place at={P.ava} name="อังวะ" color={C.burma} k={fade(frame, at("burma", 0.3), at("burma", 0.4))} dy={30} />
          </>
        )}
        {between(frame, "y2303", "twoversions") && (
          <>
            <Arrow points={[[98.3, 12.3], [99.3, 12.4], [99.9, 13.3], [100.15, 14.1], [100.5, 14.33]]} start={at("y2303", 0.1)} end={at("y2303", 0.45)} color={C.burma} width={20} />
            <Ring center={P.ayut} r={0.12} n={5} size={50} k={interpolate(frame, [at("y2303", 0.4), at("y2303", 0.6)], [0, 1], clamp)} seed="y60" />
            <Arrow points={[[100.45, 14.4], [99.8, 14.8], [99.0, 15.4], [98.4, 16.2]]} start={at("y2303", 0.72)} end={at("y2303", 0.95)} color={C.burma} width={14} variant="dashed" />
            <Place at={[98.6, 12.45]} name="มะริด · ตะนาวศรี" color={C.burma} anchor="end" k={fade(frame, at("y2303", 0.1), at("y2303", 0.2))} />
            <Place at={P.ayut} name="อยุธยา" color={C.ayut} dx={50} />
          </>
        )}
        {between(frame, "son", "lesson") && <At at={P.ava}>{(x, y) => <Crown x={x} y={y} size={110 * s} color={C.burma} />}</At>}

        {/* Pincer */}
        {between(frame, "plan", "plan") && (
          <g opacity={0.45}>
            <Arrow points={[[96.08, 21.9], [98.98, 18.79], [100.3, 16.6], [100.5, 14.6]]} start={at("plan", 0.3)} end={at("plan", 0.55)} color={C.burma} width={22} variant="dashed" />
            <Arrow points={[[98.19, 14.08], [99.53, 14.02], [100.3, 14.2]]} start={at("plan", 0.55)} end={at("plan", 0.8)} color={C.burma} width={22} variant="dashed" />
          </g>
        )}
        {between(frame, "north", "close") && (() => {
          const N: [number, number][] = [[96.08, 21.9], [97.6, 20.4], [98.98, 18.79], [100.4, 17.3], [100.1, 15.7], [100.45, 14.6]];
          const W: [number, number][] = [[98.19, 14.08], [98.9, 14.3], [99.53, 14.02], [99.81, 13.54], [100.3, 14.1]];
          const ne = interpolate(frame, [at("north", 0.1), at("north", 0.9)], [0, 1], clamp);
          return (
            <>
              <Arrow points={[[96.08, 21.9], [97.6, 20.4], [98.98, 18.79]]} start={at("north", 0.1)} end={at("north", 0.4)} color={C.burma} width={24} />
              <Arrow points={[[98.98, 18.79], [100.6, 19.6], [102.13, 19.89]]} start={at("north", 0.45)} end={at("north", 0.7)} color={C.burma} width={14} variant="dashed" />
              <Arrow points={N} start={at("slow")} end={at("close", 0.3)} color={C.burma} width={24} />
              <Arrow points={W} start={at("west", 0.15)} end={at("west", 0.8)} color={C.burma} width={24} />
              <At at={[97.3 + ne * 1.4, 20.7 - ne * 1.7]}>{(x, y) => <Elephant x={x} y={y} size={90 * s} k={fade(frame, at("north", 0.1), at("north", 0.2))} />}</At>
              <At at={[98.6 + interpolate(frame, [at("west", 0.15), at("west", 0.8)], [0, 1], clamp) * 0.9, 14.25]}>{(x, y) => <Elephant x={x} y={y + 40 * s} size={80 * s} phase={4} k={fade(frame, at("west", 0.15), at("west", 0.25))} />}</At>
              <Place at={P.ava} name="อังวะ" color={C.burma} />
              <Place at={P.cm} name="เชียงใหม่" k={fade(frame, at("north", 0.3), at("north", 0.4))} />
              <Place at={P.lp} name="หลวงพระบาง" anchor="end" k={fade(frame, at("north", 0.6), at("north", 0.7))} />
              <Place at={P.tavoy} name="ทวาย" color={C.burma} anchor="end" k={fade(frame, at("west", 0.1), at("west", 0.2))} />
              <Place at={P.kan} name="กาญจนบุรี" anchor="middle" dx={0} dy={-36} k={fade(frame, at("west", 0.45), at("west", 0.55))} />
              <Place at={P.rat} name="ราชบุรี" anchor="end" k={fade(frame, at("west", 0.65), at("west", 0.75))} />
              <Place at={P.ayut} name="อยุธยา" color={C.ayut} dx={50} size={1.2} />
            </>
          );
        })()}
        {between(frame, "slow", "why_slow") &&
          ([[99.8, 17.6], [100.26, 16.82], [100.1, 15.7], [99.6, 18.3], [99.53, 14.02], [99.81, 13.54], [99.97, 14.47], [100.12, 15.0]] as [number, number][]).map((pt, i) => (
            <g key={i}>
              <Place at={pt} name="" color={frame > at("slow", 0.1 + i * 0.09) ? C.burma : C.ink} />
              <At at={pt}>{(x, y) => <RiceSack x={x + 22 * s} y={y - 4 * s} size={34 * s} k={fade(frame, at("slow", 0.15 + i * 0.09), at("slow", 0.2 + i * 0.09))} />}</At>
            </g>
          ))}
        {between(frame, "slow", "slow") &&
          ([[99.9, 16.4], [99.7, 13.9], [100.3, 15.5], [99.2, 17.2]] as [number, number][]).map((pt, i) => (
            <At key={i} at={pt}>{(x, y) => (i % 2 ? <WhiteFlag x={x} y={y} size={70 * s} k={fade(frame, at("slow", 0.4 + i * 0.13), at("slow", 0.45 + i * 0.13))} /> : <Fire x={x} y={y} size={60 * s} k={fade(frame, at("slow", 0.4 + i * 0.13), at("slow", 0.45 + i * 0.13))} />)}</At>
          ))}

        {/* Siege ring around the island (from the close of the pincer to the wall's fall) */}
        {siegeOn && <Ring center={P.ayut} r={cam.scale > 30000 ? 0.13 : 0.16} n={9} size={cam.scale > 30000 ? 70 : 46} k={ring} />}

        {/* Bang Rachan */}
        {between(frame, "butfirst", "note") && (() => {
          const fallK = fade(frame, at("fall", 0.6), at("fall", 0.8));
          return (
            <>
              <At at={P.bang}>{(x, y) => <Camp x={x} y={y} size={150 * s} color={C.village} k={fade(frame, at("village", 0.2), at("village", 0.35))} />}</At>
              {fallK > 0 && <At at={P.bang}>{(x, y) => <Fire x={x} y={y} size={140 * s} k={fallK} />}</At>}
              {scatter(7, "vil", 0.06, 0.04).map(([dx, dy], i) => {
                const k = interpolate(frame, [at("village", 0.1 + i * 0.06), at("village", 0.6 + i * 0.04)], [0, 1], clamp);
                return (
                  <At key={i} at={[P.bang[0] + dx * (2 - k) * 1.4, P.bang[1] + dy * (2 - k) * 1.2 - 0.035]}>
                    {(x, y) => <Soldier x={x} y={y} size={80 * s} color={C.village} hat="band" hold={i % 2 ? "hoe" : "spear"} walk={k < 1} phase={i} k={k > 0 ? 1 : 0} />}
                  </At>
                );
              })}
              {between(frame, "fight", "fight") &&
                [0, 1, 2].map((i) => {
                  const a = (i / 3) * Math.PI * 1.2 + 2.4;
                  const from: [number, number] = [P.bang[0] + Math.cos(a) * 0.17, P.bang[1] + Math.sin(a) * 0.13];
                  const to: [number, number] = [P.bang[0] + Math.cos(a) * 0.05, P.bang[1] + Math.sin(a) * 0.04];
                  return (
                    <g key={i}>
                      <g opacity={fade(frame, -1, 0, at("fight", 0.3 + i * 0.2), at("fight", 0.35 + i * 0.2))}>
                        <Arrow points={[from, to]} start={at("fight", 0.05 + i * 0.2)} end={at("fight", 0.25 + i * 0.2)} color={C.burma} width={18} />
                      </g>
                      <Arrow points={[to, from]} start={at("fight", 0.32 + i * 0.2)} end={at("fight", 0.5 + i * 0.2)} color={C.burma} width={12} variant="dashed" />
                    </g>
                  );
                })}
              {between(frame, "quiz1", "quiz1a") && <Arrow points={[P.bang, [100.45, 14.6], P.ayut]} start={at("quiz1", 0.05)} end={at("quiz1", 0.4)} color={C.village} width={12} variant="dashed" />}
              <Place at={P.bang} name="บ้านบางระจัน" color={C.village} dy={52} k={fade(frame, at("butfirst", 0.5), at("butfirst", 0.7))} />
              <Place at={[100.4, 14.89]} name="สิงห์บุรี" k={fade(frame, at("village"), at("village", 0.1))} />
            </>
          );
        })()}

        {/* Siege: sorties, rain, high ground, rice */}
        {between(frame, "quiz2a", "quiz2a") &&
          [0, 1, 2].map((i) => {
            const a = i * 2.1 + 0.5;
            const to: [number, number] = [P.ayut[0] + Math.cos(a) * 0.12, P.ayut[1] + Math.sin(a) * 0.1];
            return (
              <g key={i}>
                <Arrow points={[P.ayut, to]} start={at("quiz2a", 0.2 + i * 0.2)} end={at("quiz2a", 0.35 + i * 0.2)} color={C.ayut} width={14} />
                <Arrow points={[to, P.ayut]} start={at("quiz2a", 0.38 + i * 0.2)} end={at("quiz2a", 0.5 + i * 0.2)} color={C.ayut} width={10} variant="dashed" />
              </g>
            );
          })}
        {between(frame, "rain", "nomove") && (
          <>
            <At at={[100.35, 14.6]}>{(x, y) => <Cloud x={x} y={y} size={170 * s} />}</At>
            <At at={[100.8, 14.58]}>{(x, y) => <Cloud x={x} y={y} size={140 * s} phase={4} />}</At>
          </>
        )}
        {between(frame, "rice", "compare") &&
          scatter(6, "rice", 0.17, 0.14).map(([dx, dy], i) => (
            <At key={i} at={[P.ayut[0] + dx + (dx > 0 ? 0.06 : -0.06), P.ayut[1] + dy]}>{(x, y) => <RicePlant x={x} y={y} size={60 * s} k={fade(frame, at("rice", 0.1 + i * 0.08), at("rice", 0.2 + i * 0.08))} phase={i} />}</At>
          ))}

        {/* Inside the city: food runs out, fire */}
        {between(frame, "inside", "inside") && (
          <>
            {[0, 1, 2, 3].map((i) => (
              <At key={i} at={[100.553 + i * 0.008, 14.374]}>{(x, y) => <RiceSack x={x} y={y} size={60 * s} k={fade(frame, -1, 0, at("inside", 0.25 + i * 0.08), at("inside", 0.3 + i * 0.08))} />}</At>
            ))}
            {scatter(5, "ifire", 0.012, 0.008).map(([dx, dy], i) => (
              <At key={`f${i}`} at={[P.ayut[0] + dx, P.ayut[1] + dy]}>{(x, y) => <Fire x={x} y={y} size={70 * s} k={fade(frame, at("inside", 0.6 + i * 0.05), at("inside", 0.65 + i * 0.05))} phase={i} />}</At>
            ))}
          </>
        )}

        {/* China */}
        {between(frame, "china", "china") && (
          <>
            <Arrow points={[[102.7, 25.0], [100.5, 24.6], [98.6, 24.0], [97.4, 23.6]]} start={at("china", 0.1)} end={at("china", 0.45)} color={C.china} width={26} />
            <Place at={[102.7, 25.0]} name="จีน (ราชวงศ์ชิง)" color={C.china} anchor="end" dy={-30} />
            <Place at={P.ava} name="อังวะ" color={C.burma} />
            <At at={[99.5, 20.5]}>{(x, y) => <Hourglass x={x} y={y} size={110 * s} k={fade(frame, at("china", 0.55), at("china", 0.62))} />}</At>
          </>
        )}

        {/* Phraya Tak */}
        {between(frame, "onemore", "taksin") && <At at={[P.ayut[0] + 0.1, P.ayut[1] + 0.02]}>{(x, y) => <Rider x={x} y={y} size={110 * s} gallop={false} k={fade(frame, at("onemore", 0.5), at("onemore", 0.6))} />}</At>}
        {between(frame, "taksin", "taksin") && <Place at={P.tak} name="ตาก" k={1} />}
        {between(frame, "breakout", "debate") && (() => {
          const R: [number, number][] = [[100.58, 14.36], [101.2, 14.2], [101.37, 14.05], [101.0, 13.36], [101.28, 12.68]];
          const k = interpolate(frame, [at("east", 0.05), at("east", 0.9)], [0, 1], clamp);
          return (
            <>
              <Ring center={P.ayut} r={0.12} n={7} size={40} seed="tring" />
              <Arrow points={R.slice(0, 2)} start={at("breakout", 0.4)} end={at("breakout", 0.8)} color={C.taksin} width={22} />
              <Arrow points={R} start={at("east")} end={at("east", 0.9)} color={C.taksin} width={22} />
              {between(frame, "chase", "chase") && [0, 1].map((i) => (
                <g key={i} opacity={fade(frame, -1, 0, at("chase", 0.6 + i * 0.15), at("chase", 0.7 + i * 0.15))}>
                  <Arrow points={[[100.62, 14.5 - i * 0.3], [101.05, 14.3 - i * 0.15]]} start={at("chase", 0.05 + i * 0.25)} end={at("chase", 0.3 + i * 0.25)} color={C.burma} width={14} />
                </g>
              ))}
              <At at={[101.2 - k * 0.15 + 0.0, 14.2 - k * 1.3]}>{(x, y) => <Rider x={x} y={y} size={110 * s} k={fade(frame, at("breakout", 0.5), at("breakout", 0.6))} />}</At>
              <Place at={P.nayok} name="นครนายก" k={fade(frame, at("east", 0.1), at("east", 0.2))} />
              <Place at={P.prachin} name="ปราจีนบุรี" dy={30} k={fade(frame, at("east", 0.3), at("east", 0.4))} />
              <Place at={P.chon} name="ชลบุรี" anchor="end" k={fade(frame, at("east", 0.55), at("east", 0.65))} />
              <Place at={P.rayong} name="ระยอง" color={C.taksin} k={fade(frame, at("east", 0.8), at("east", 0.9))} />
              <Place at={P.ayut} name="อยุธยา" color={C.ayut} anchor="end" dx={40} />
            </>
          );
        })()}

        {/* The fall: forts, cannons at Hua Ro */}
        {between(frame, "huaro", "diagram3") && (
          <>
            <At at={P.huaro}>{(x, y) => <circle cx={x} cy={y} r={90 * s} fill="none" stroke={C.burma} strokeWidth={6 * s} strokeDasharray={`${14 * s} ${10 * s}`} opacity={fade(frame, at("huaro", 0.2), at("huaro", 0.3)) * (0.6 + 0.4 * Math.sin(frame * 0.2))} />}</At>
            <Place at={[P.huaro[0] + 0.004, P.huaro[1] + 0.006]} name="หัวรอ" color={C.burma} k={fade(frame, at("huaro", 0.2), at("huaro", 0.3))} />
            {[0, 1, 2].map((i) => (
              <At key={i} at={[P.huaro[0] + 0.01 + i * 0.006, P.huaro[1] + 0.01 - i * 0.004]}>
                {(x, y) => <Cannon x={x} y={y} size={70 * s} flip fire={frame >= at("forts") ? ((frame + i * 11) % 40) / 14 : 0} k={fade(frame, at("forts", 0.05 + i * 0.1), at("forts", 0.1 + i * 0.1))} />}
              </At>
            ))}
            {frame >= at("forts", 0.3) && <At at={P.ayut}>{(x, y) => <Smoke x={x + 40 * s} y={y - 60 * s} size={200 * s} />}</At>}
          </>
        )}
        {between(frame, "fire", "fire") &&
          scatter(5, "stupa", 0.012, 0.008).map(([dx, dy], i) => (
            <At key={i} at={[P.ayut[0] + dx, P.ayut[1] + dy - 0.004]}>{(x, y) => <Stupa x={x} y={y} size={80 * s} brick={frame > at("fire", 0.2 + i * 0.12)} />}</At>
          ))}

        {/* Captives to Ava */}
        {between(frame, "captives", "captives") && (
          <>
            <Arrow points={[P.ayut, [99.7, 15.6], [98.6, 17.6], [97.4, 19.8], P.ava]} start={at("captives", 0.1)} end={at("captives", 0.6)} color={C.burma} width={14} variant="dashed" />
            {[0, 1, 2, 3, 4].map((i) => {
              const k = interpolate(frame, [at("captives", 0.1 + i * 0.05), at("captives", 0.9)], [0, 0.85], clamp);
              const pt: [number, number] = [P.ayut[0] + (P.ava[0] - P.ayut[0]) * k, P.ayut[1] + (P.ava[1] - P.ayut[1]) * k];
              return <At key={i} at={pt}>{(x, y) => <Soldier x={x} y={y} size={60 * s} color="#9c8f7a" hat="none" hold="none" walk flip phase={i} />}</At>;
            })}
            <Place at={P.ava} name="อังวะ" color={C.burma} />
          </>
        )}

        {/* After the fall */}
        {between(frame, "leave", "leave") && (
          <>
            <Arrow points={[[100.4, 14.6], [99.4, 15.6], [98.4, 17.5], [97.2, 19.8], [96.2, 21.6]]} start={at("leave", 0.05)} end={at("leave", 0.5)} color={C.burma} width={20} variant="dashed" />
            <At at={P.posamton}>{(x, y) => <Camp x={x} y={y} size={70 * s} k={fade(frame, at("leave", 0.55), at("leave", 0.65))} />}</At>
            <Place at={P.posamton} name="ค่ายโพธิ์สามต้น" color={C.burma} anchor="end" dx={40} k={fade(frame, at("leave", 0.6), at("leave", 0.7))} />
          </>
        )}
        {between(frame, "chanthaburi", "win") && (
          <>
            <At at={P.chan}>{(x, y) => <Fort x={x} y={y + 40 * s} size={140 * s} color={frame > at("win", 0.7) ? C.taksin : "#7a6a55"} />}</At>
            <Place at={P.chan} name="จันทบุรี" dx={90} size={1.2} />
            <At at={[101.75, 12.75]}>{(x, y) => <Camp x={x} y={y} size={110 * s} color={C.taksin} />}</At>
            {between(frame, "win", "win") && <Arrow points={[[101.75, 12.75], [101.95, 12.66], [102.06, 12.62]]} start={at("win", 0.4)} end={at("win", 0.7)} color={C.taksin} width={26} />}
            {scatter(4, "tsol", 0.07, 0.04).map(([dx, dy], i) => (
              <At key={i} at={[101.75 + dx, 12.68 + dy]}>{(x, y) => <Soldier x={x} y={y} size={80 * s} color={C.taksin} hat="cap" hold="sword" phase={i} walk={frame > at("win", 0.4)} />}</At>
            ))}
          </>
        )}
        {between(frame, "return", "return") && (() => {
          const R: [number, number][] = [[102.0, 12.45], [101.3, 12.55], [100.85, 12.9], [100.58, 13.45], [100.52, 13.9], [100.545, 14.3]];
          const k = interpolate(frame, [at("return", 0.15), at("return", 0.75)], [0, 1], clamp);
          const i = Math.min(R.length - 2, Math.floor(k * (R.length - 1)));
          const t = k * (R.length - 1) - i;
          const pt: [number, number] = [R[i][0] + (R[i + 1][0] - R[i][0]) * t, R[i][1] + (R[i + 1][1] - R[i][1]) * t];
          return (
            <>
              <Arrow points={R} start={at("return", 0.1)} end={at("return", 0.75)} color={C.taksin} width={18} />
              {[0, 1, 2].map((j) => <At key={j} at={[pt[0] + j * 0.08, pt[1] - j * 0.05]}>{(x, y) => <Boat x={x} y={y} size={70 * s} color={C.taksin} rowers={2} phase={j} />}</At>)}
              <At at={P.posamton}>{(x, y) => (frame < at("return", 0.8) ? <Camp x={x} y={y} size={60 * s} /> : <Fire x={x} y={y} size={70 * s} />)}</At>
              <Place at={P.chan} name="จันทบุรี" color={C.taksin} />
            </>
          );
        })()}
        {between(frame, "thonburi", "thonburi") && (
          <>
            <Arrow points={[[100.56, 14.32], [100.52, 14.05], [100.49, 13.78]]} start={at("thonburi", 0.25)} end={at("thonburi", 0.5)} color={C.taksin} width={22} />
            <At at={P.thon}>{(x, y) => <Crown x={x} y={y - 20 * s} size={120 * s} k={fade(frame, at("thonburi", 0.6), at("thonburi", 0.7))} />}</At>
            <Place at={P.thon} name="ธนบุรี" color={C.taksin} dx={60} size={1.3} />
            <Place at={P.ayut} name="อยุธยา" color={C.ayut} dx={50} />
          </>
        )}
        {between(frame, "today", "today") &&
          scatter(6, "today", 0.016, 0.01).map(([dx, dy], i) => (
            <At key={i} at={[P.ayut[0] + dx, P.ayut[1] + dy]}>{(x, y) => <Stupa x={x} y={y} size={90 * s} brick k={fade(frame, at("today", 0.1 + i * 0.06), at("today", 0.16 + i * 0.06))} />}</At>
          ))}
      </ThMap>
    </MapFrame>
  );

  // --- Screen layer -----------------------------------------------------------------------------------------
  const cur = [...BEATS].reverse().find((b) => frame >= b.start - 4) ?? BEATS[0];
  const cardOf = (id: string) => CARDS[id] ?? ["", ""];
  const cardColor = (id: string) => {
    const i = ids.indexOf(id);
    if (i <= ids.indexOf("question")) return C.burma;
    if (i < ids.indexOf("burma")) return C.ayut;
    if (["ayutthaya", "spoiler", "quiz2", "quiz2a", "inside", "king", "end417", "answer", "answer2", "today"].includes(id)) return C.ayut;
    if (i >= ids.indexOf("village") && i <= ids.indexOf("note")) return C.village;
    if (["taksin", "breakout", "chase", "east", "debate", "chanthaburi", "pots", "win", "return", "thonburi", "poll", "onemore"].includes(id)) return C.taksin;
    if (id === "china") return C.china;
    return C.burma;
  };
  const [title, sub] = cardOf(cur.id);

  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + 16}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      <Sounds />
      {mapLayer}

      {/* Top furniture */}
      <YearBadge year={goRoll !== null ? String(goRoll) : yearRow[1]} month={threeRoll ?? (goRoll !== null ? undefined : yearRow[2])} flash={at(yearRow[0])} />
      <Locator cam={cam} />
      <div style={{ position: "absolute", right: 30 * s, top: height * 0.645, fontFamily: fonts.body, fontSize: 18 * s, color: C.ink, opacity: 0.6 }}>แผนที่ © OpenStreetMap contributors · Natural Earth</div>

      {/* Opening */}
      <QuestionBadge start={0} end={B.go.start + 6} />
      <Chip x={width * 0.5} y={height * 0.2} text="417 ปี" color={C.burma} size={1.6} start={at("night", 0.75)} end={B.night.end + 8} />

      {/* Act 1 */}
      <IconPanel icon={<g><path d="M0 -100 C-30 -60 -44 -36 -44 -18 C-44 4 -24 14 0 14 C24 14 44 4 44 -18 C44 -36 30 -60 0 -100 Z" fill={C.water} stroke={C.ink} strokeWidth={4} /><path d="M-22 -24 Q-22 -6 -6 0" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" /></g>} text="น้ำ" start={at("weapon", 0.4)} end={B.weapon.end + 6} />
      <FloodDiagram start={at("diagram1")} end={B.diagram1.end + 8} rise={Math.round(B.diagram1.len * 0.45)} />
      <FormulaCard start={at("formula", 0.05)} end={B.formula.end + 8} />
      <FormulaCard start={at("ayutthaya", 0.6)} end={B.spoiler.end + 8} crack={interpolate(frame, [at("spoiler", 0.5), at("spoiler", 0.8)], [0, 1], clamp)} small y={0.22} />

      {/* Act 2 */}
      <SplitCard start={at("twoversions", 0.05)} end={B.twoversions.end + 8} title="ทำไมถอย? มีสองฉบับ"
        left={{ head: "พงศาวดารไทย", body: "ปืนใหญ่แตกใส่", color: C.ayut, icon: <Cannon x={0} y={-6} size={90} cracked fire={0.4} /> }}
        right={{ head: "บันทึกพม่า", body: "ประชวรหนัก", color: C.burma, icon: <Hourglass x={0} y={-4} size={90} /> }} />
      <Chip x={width * 0.5} y={height * 0.25} text="พระเจ้ามังระ" color={C.burma} size={1.4} start={at("son", 0.2)} end={B.son.end + 8} />
      <ListPanel title="บทเรียนของพม่า" start={at("lesson")} end={B.lesson.end + 8} items={[{ text: "บุกทางเดียวไม่พอ", at: at("lesson", 0.05) }, { text: "ต้องอยู่ให้ได้ข้ามหน้าฝน", at: at("lesson", 0.45) }]} />
      <Chip x={width * 0.5} y={height * 0.2} text="พระเจ้าเอกทัศ" color={C.ayut} size={1.3} start={at("ayutthaya", 0.1)} end={at("ayutthaya", 0.6)} />
      <Stamp text="สปอยล์!" start={at("spoiler", 0.1)} end={B.spoiler.end + 6} x={0.72} y={0.5} />

      {/* Act 3 */}
      <Chip x={width * 0.36} y={height * 0.2} text="ทัพเหนือ: เนเมียวสีหบดี" color={C.burma} start={at("north", 0.05)} end={B.north.end + 8} />
      <Chip x={width * 0.4} y={height * 0.56} text="ทัพตะวันตก: มังมหานรธา" color={C.burma} start={at("west", 0.05)} end={B.west.end + 8} />
      <Chip x={width * 0.72} y={height * 0.3} text={`เมืองที่เสีย ${Math.round(interpolate(frame, [at("slow", 0.1), B.slow.end], [0, 8], clamp))}`} color={C.burma} start={at("slow", 0.1)} end={B.slow.end + 8} />
      <ListPanel title="บทเรียนของพม่า" start={at("why_slow")} end={B.why_slow.end + 8} hi={1} items={[{ text: "บุกทางเดียวไม่พอ", at: at("why_slow") }, { text: "ต้องอยู่ให้ได้ข้ามหน้าฝน", at: at("why_slow") }]} />

      {/* Act 4 */}
      <ListPanel title="ผู้นำบางระจัน" mark="dot" color={C.village} start={at("leaders")} end={B.leaders.end + 8} items={[
        { text: "พระอาจารย์ธรรมโชติ", at: at("leaders", 0.05) },
        { text: "นายแท่น", at: at("leaders", 0.4) },
        { text: "นายอิน · นายเมือง", at: at("leaders", 0.55) },
        { text: "นายจันหนวดเขี้ยว", at: at("leaders", 0.7) },
      ]} />
      <Chip x={width * 0.72} y={height * 0.24} text={`ชนะ ${Math.min(3, Math.floor(interpolate(frame, [at("fight", 0.3), at("fight", 0.95)], [0, 3.99], clamp)))} ครั้ง`} color={C.village} start={at("fight", 0.3)} end={B.fight.end + 8} />
      <QuizCard title="ทายกันหน่อย" question="ราชสำนักจะให้ปืนใหญ่ไหม?" options={["ให้", "ไม่ให้"]} answer={1} start={at("quiz1", 0.3)} reveal={at("quiz1a")} end={B.quiz1a.end + 8} />
      <IconPanel icon={<Cannon x={0} y={-10} size={110} cracked />} text="ปืนร้าว" sub="หล่อเองครั้งแรก ใช้ไม่ได้" start={at("cast", 0.4)} end={B.cast.end + 8} />
      <Chip x={width * 0.5} y={height * 0.22} text={`ยืนหยัด ${Math.max(1, Math.min(5, Math.ceil(interpolate(frame, [at("fall"), at("fall", 0.6)], [0, 5], clamp))))} เดือน`} color={C.village} size={1.5} start={at("fall")} end={B.fall.end + 8} />
      <Stamp text="ตามพงศาวดารไทย" start={at("note", 0.05)} end={B.note.end + 8} y={0.28} />

      {/* Act 5 */}
      <QuizCard title="ถ้าคุณเป็นพระเจ้าเอกทัศ" question="จะทำยังไงดี?" options={["ออกไปตีค่ายพม่า", "ใช้สูตรรอน้ำ"]} answer={1} start={at("quiz2", 0.2)} reveal={at("quiz2a")} end={at("quiz2a", 0.2)} />
      <IconPanel icon={<g><Camp x={0} y={0} size={110} /></g>} text="พม่าไม่ถอย" start={at("nomove", 0.35)} end={B.nomove.end + 6} />
      <HighGroundDiagram start={at("how", 0.2)} end={B.diagram2.end + 8} rise={Math.round(B.diagram2.len * 0.3)} />
      <div style={{ position: "absolute", inset: 0, opacity: between(frame, "compare", "compare") ? 1 : 0 }}>
        <FormulaCard start={at("compare", 0.1)} end={B.compare.end + 8} broken={interpolate(frame, [at("compare", 0.5), at("compare", 0.7)], [0, 1], clamp)} />
      </div>
      <Chip x={width * 0.5} y={height * 0.22} text="มังมหานรธา เสียชีวิต" color="#7d7468" size={1.2} start={at("burmatoo", 0.3)} end={B.burmatoo.end + 8} />

      {/* Act 6 */}
      <IconPanel icon={<Soldier x={0} y={4} size={110} color={C.taksin} hat="tak" hold="sword" />} text="พระยาตาก" sub="ขุนนางเชื้อสายจีน เคยครองเมืองตาก" start={at("taksin", 0.05)} end={B.taksin.end + 8} />
      <Chip x={width * 0.7} y={height * 0.23} text={`ทหาร ${Math.round(interpolate(frame, [at("breakout", 0.5), at("breakout", 0.9)], [0, 500], clamp))}–${Math.round(interpolate(frame, [at("breakout", 0.5), at("breakout", 0.9)], [0, 1000], clamp))} คน`} color={C.taksin} start={at("breakout", 0.5)} end={B.east.end + 8} />
      <SplitCard start={at("debate", 0.05)} end={B.debate.end + 8} title="พระยาตากทิ้งเมือง?"
        left={{ head: "ทิ้งเมือง?", body: "หนีออกก่อนกรุงแตก", color: C.ayut }}
        right={{ head: "เก็บกำลัง?", body: "ออกไปตั้งหลักสู้ใหม่", color: C.taksin }} />

      {/* Act 7 */}
      <TunnelDiagram start={at("diagram3")} end={B.collapse.end + 8} />
      <Chip x={width * 0.5} y={height * 0.22} text="ล้อม 14 เดือน" color={C.burma} size={1.5} start={at("breach", 0.6)} end={B.breach.end + 8} />
      <Chip x={width * 0.5} y={height * 0.22} text="เชลยหลายหมื่นคน" color={C.burma} size={1.4} start={at("captives", 0.4)} end={B.captives.end + 8} />
      {between(frame, "captives", "captives") && <div style={{ position: "absolute", left: width * 0.5 - 80 * s, top: height * 0.25 }}><svg width={160 * s} height={80 * s} viewBox="-60 -70 120 70"><Chain x={0} y={0} size={70} /></svg></div>}
      <SplitCard start={at("king", 0.08)} end={B.king.end + 8} title="พระเจ้าเอกทัศ"
        left={{ head: "พงศาวดารไทย", body: "พบใกล้วัดสังฆาวาส", color: C.ayut }}
        right={{ head: "บันทึกพม่า", body: "ถูกยิงระหว่างหนี", color: C.burma }} />
      <Chip x={width * 0.5} y={height * 0.24} text={`${Math.round(interpolate(frame, [at("end417", 0.1), at("end417", 0.7)], [1893, 2310], clamp))}`} color={C.ayut} size={2} start={at("end417")} end={B.end417.end + 8} />

      {/* Act 8 */}
      <ListPanel title="คำตอบของวันนี้" start={at("answer", 0.25)} end={B.answer.end + 8} items={[
        { text: "คีมสองขา ตีหัวเมืองรอบนอก", at: at("answer", 0.45) },
        { text: "สูตรรอน้ำพัง ค่ายบนที่ดอน", at: at("answer", 0.62) },
        { text: "ล้อม 14 เดือน ข้าวหมดเมือง", at: at("answer", 0.8) },
      ]} />
      <FormulaCard start={at("answer2", 0.3)} end={B.answer2.end + 8} broken={1} />
      <QuoteCard who="พระยาตาก ก่อนตีเมืองจันทบูร" text="ในเพลากลางคืนวันนี้ตีเอาเมืองจันทบูรให้ได้ ไปหาข้าวกินเช้าเอาในเมือง ถ้ามิได้ก็ให้ตายเสียด้วยกันเถิด" source="พระราชพงศาวดารกรุงธนบุรี" start={at("pots")} end={B.pots.end + 6} />
      <IconPanel icon={<Pot x={0} y={0} size={100} broken={interpolate(frame, [at("win", 0.05), at("win", 0.2)], [0, 1], clamp)} />} text="ทุบหม้อข้าว" sub="ไม่ชนะก็ไม่มีข้าวกิน" start={at("win")} end={at("win", 0.45)} />
      <Chip x={width * 0.7} y={height * 0.23} text="7 เดือนหลังกรุงแตก" color={C.taksin} start={at("return", 0.75)} end={B.return.end + 8} />
      <Chip x={width * 0.5} y={height * 0.22} text="สมเด็จพระเจ้าตากสินมหาราช" color={C.taksin} size={1.2} start={at("thonburi", 0.7)} end={B.thonburi.end + 8} />
      <Chip x={width * 0.5} y={height * 0.22} text="มรดกโลก ยูเนสโก" color={C.ayut} size={1.3} start={at("today", 0.15)} end={B.today.end + 8} />
      <PollCard question="ถ้าคุณเป็นพระยาตาก จะเลือกทางไหน?" a="อยู่สู้ในกรุง" b="ตีฝ่าออกไป" start={at("poll", 0.25)} button={at("poll", 0.85)} />

      {title && <LowerCard key={cur.id} title={title} sub={sub} color={cardColor(cur.id)} start={cur.start - 4} />}
    </AbsoluteFill>
  );
};
