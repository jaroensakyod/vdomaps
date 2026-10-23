import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { country } from "../../../components/data";
import { Fighter, Glow, Grass } from "../../../components/Scene";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { Backdrop, Candle, House, Manuscript, Noble, PAL, Tree, V2 } from "../ep04/v2";
import { Chain, Horse, Reeds } from "../ep04/ch3_kit";
import { B, BRIT_C, CityDot, Empire, FR_C, ramp, SIAM_C, VOICE, wf, wp, type AreaId, type Chapter5 } from "./beatsKit";
import { Timeline } from "./cards";
import { Hourglass, Locomotive, MapLine, NationFlag, Pole, Rails, SurveyPole, Theodolite, Wire } from "./ch3_kit5";
import { C5, Colonnade, PanelFlag } from "./kit5";
import { Bed, Hit, SFX } from "./mix";
import { PL, R, VW } from "./places";

// Chapter 3 (slaves → late): reforms racing the clock — slavery, telegraph, ministries, monthon, maps, railway.
const FROM = B.slaves.start;
const END = B.mekong.start;
const T = {
  decree: wp("slaves", "กฎหมาย", 0.4),
  child: wp("slaves", "ลูก", 0.55),
  free: wp("slaves", "ไท", 0.85),
  grad: B.gradual.start,
  thirty: wp("gradual", "สามสิบ", 0.3),
  usa: wp("gradual", "สงคราม", 0.6),
  wires: B.wires.start,
  wire: wp("wires", "โทรเลข", 0.25),
  towns: wp("wires", "หัว", 0.55),
  post: wp("wires", "ไปรษณีย์", 0.7),
  min: B.ministries.start,
  twelve: wf("ministries", "สิบ", 0.9),
  dam: B.damrong.start,
  mon: B.monthon.start,
  monthon: wp("monthon", "มณฑล", 0.45),
  commish: wp("monthon", "ข้าหลวง", 0.6),
  why: B.why.start,
  take: wp("why", "เอา", 0.9),
  map: B.mapping.start,
  survey: wp("mapping", "แผนที่", 0.25),
  clear: wp("mapping", "ชัด", 0.6),
  rail: B.rail.start,
  ayut: wp("rail", "อยุธยา", 0.25),
  korat: wp("rail", "โคราช", 0.85),
  troops: B.korat.start,
  soldiers: wp("korat", "ทหาร", 0.45),
  days: wf("korat", "วัน", 0.9),
  adv: B.advisers.start,
  many: wp("advisers", "หลาย", 0.3),
  late: B.late.start,
  out: wf("late", "หมด", 0.85),
};

// --- map layers ----------------------------------------------------------------------------------------------
const TOWNS: [number, number][] = [PL.ayut, PL.korat, PL.chanthaburi, [100.26, 16.82], [98.98, 18.79], [99.96, 8.43], [99.81, 13.54]];
const MONTHON: [number, number][] = [[98.98, 18.79], [100.26, 16.82], [100.12, 15.7], [102.1, 14.97], [104.85, 15.24], [102.79, 17.41], [100.566, 14.357], [99.81, 13.54], [102.1, 12.61], [99.18, 10.49], [99.96, 8.43], [98.39, 7.88], [101.25, 6.87]];

// Dashed grid clipped to Siam (the monthon cells, schematic).
const Grid = ({ k }: { k: number }) => {
  const { path, s } = useMap();
  if (k <= 0) return null;
  const lines: [number, number][][] = [];
  for (let lon = 97; lon <= 106; lon += 1.5) lines.push([[lon, 5], [lon, 21]]);
  for (let lat = 5.5; lat <= 21; lat += 1.5) lines.push([[97, lat], [106, lat]]);
  return (
    <g opacity={k} clipPath="url(#e5clip764)">
      {lines.map((l, i) => <path key={i} d={path({ type: "LineString", coordinates: l }) ?? ""} stroke={GOLD} strokeWidth={2 * s} strokeDasharray={`${8 * s} ${8 * s}`} strokeOpacity={0.7} fill="none" />)}
    </g>
  );
};

// Siam's outline: faint dashed, then drawn hard in gold as the survey finishes.
const Border = ({ faint, solid }: { faint: number; solid: number }) => {
  const { path, s } = useMap();
  const d = path(country("764")) ?? "";
  return (
    <g fill="none">
      {faint > 0 && <path d={d} stroke="#fff" strokeOpacity={0.55 * faint} strokeWidth={3 * s} strokeDasharray={`${6 * s} ${12 * s}`} />}
      {solid > 0 && <path d={d} stroke={GOLD} strokeWidth={5 * s} pathLength={1} strokeDasharray={`${solid} 1`} style={{ filter: `drop-shadow(0 0 ${6 * s}px ${GOLD})` }} />}
    </g>
  );
};

// --- illustrated panels (style v2) ---------------------------------------------------------------------------

// A herald reads the decree under a big tree in a market square; villagers gather.
const DecreeScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#6a9ac0", "#f0d8a8"]} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.2]} far="#8a9ab0" mid="#6a7a5a" ground="#8a6a45" />
        <Tree x={g.x + g.W * 0.18 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s * 1.3} />
        <House x={g.x + g.W * 0.72 + pan * 0.5} y={g.ground - 10 * g.s} w={160 * g.s} s={g.s} />
        <g transform={`translate(${g.x + g.W * 0.42 + pan * 0.7},${g.ground - 6 * g.s})`}>
          <Fighter x={0} y={0} scale={g.sc * 0.66} mode="stand" costume={C5.official} weapon="none" />
          <rect x={18 * g.s} y={-118 * g.s} width={interpolate(lt, [0, 20], [6, 60], clamp) * g.s} height={44 * g.s} fill="#f4ecd0" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
        </g>
        {[0, 1, 2, 3, 4].map((i) => <Fighter key={i} x={g.x + g.W * (0.08 + i * 0.2) + pan * 1.4} y={g.ground + 34 * g.s} scale={g.sc * 0.9} mode="stand" flip={i >= 2} costume={C5.villager} weapon="none" phase={i * 1.3} />)}
        <Grass g={g} shift={pan * 1.6} color="#4a5a2a" />
      </g>
    )}
  </V2>
);

// A mother and child in a house yard; the chain on the ground breaks and falls away as the word "ไท" lands.
const FreedomScene = ({ id, start, end, free }: { id: string; start: number; end: number; free: number }) => {
  const frame = useCurrentFrame();
  const br = interpolate(frame, [free - 6, free + 10], [0, 1], clamp);
  return (
    <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#e8a060", "#ffe6b0"]} accent={GOLD} warm={0.12}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.3, 0.3]} lightColor={["#ffd08a", "#fff1c8"]} far="#9a8a7a" mid="#7a7a4a" ground="#8a6a45" />
          <House x={g.x + g.W * 0.75 + pan * 0.5} y={g.ground - 10 * g.s} w={200 * g.s} s={g.s} />
          <Tree x={g.x + g.W * 0.08 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s} kind="palm" />
          <Fighter x={g.x + g.W * 0.42 + pan * 0.8} y={g.ground + 8 * g.s} scale={g.sc * 0.82} mode="stand" costume={{ ...C5.villager, jacket: "#a85a3a" }} weapon="none" />
          <Fighter x={g.x + g.W * 0.52 + pan * 0.8} y={g.ground + 8 * g.s} scale={g.sc * 0.5} mode="walk" costume={{ ...C5.villager, jacket: "#e8c070" }} weapon="none" phase={2} />
          <Chain a={[g.x + g.W * 0.3 + pan * 1.2, g.ground + 40 * g.s]} b={[g.x + g.W * 0.62 + pan * 1.2, g.ground + 44 * g.s]} s={g.s * 1.3} broken={br} />
          <Glow x={g.x + g.W * 0.47 + pan * 1.2} y={g.ground + 40 * g.s} s={g.s * 0.6 * br} />
          <Grass g={g} shift={pan * 1.6} color="#5a6a2a" />
        </g>
      )}
    </V2>
  );
};

// Workers string a telegraph wire across the rice fields; a spark runs along it.
const TelegraphScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#7ab0d8", "#f4e0b0"]} accent={GOLD}>
    {(g, pan, lt) => {
      const xs = [0.06, 0.38, 0.7, 1.02].map((f) => g.x + g.W * f + pan * 0.6);
      const top = (x: number) => [x + 20 * g.s, g.ground - 140 * g.s] as [number, number];
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.8, 0.22]} far="#9ab0a0" mid="#7a9a5a" ground="#6a8a3a" />
          {xs.map((x, i) => <Pole key={i} x={x} y={g.ground - 6 * g.s} s={g.s} />)}
          {xs.slice(1).map((x, i) => <Wire key={i} a={top(xs[i])} b={top(x)} s={g.s} t={lt + i * 20} />)}
          <Fighter x={xs[1] - 30 * g.s} y={g.ground - 4 * g.s} scale={g.sc * 0.6} mode="walk" costume={C5.villager} weapon="none" phase={1} />
          <Fighter x={xs[2] + 40 * g.s} y={g.ground - 4 * g.s} scale={g.sc * 0.6} mode="stand" costume={C5.official} weapon="none" />
          <Reeds g={g} y={g.ground + 40 * g.s} wind={lt * 0.05} shift={pan * 1.6} color="#7a9a3a" />
        </g>
      );
    }}
  </V2>
);

// The new post office: a postman with a satchel walks past a red letter box.
const PostScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#8ab8e0", "#f8ecd0"]} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.15, 0.2]} far="#a0a8b8" mid="#8a8a7a" ground="#9a8a6a" ridges={false} />
        <Colonnade x={g.x + g.W * 0.55 + pan * 0.5} y={g.ground - 10 * g.s} w={g.W * 0.6} s={g.s} sign="ไปรษณียาคาร" />
        <g transform={`translate(${g.x + g.W * 0.2 + pan * 0.8},${g.ground + 10 * g.s})`}>
          <rect x={-14 * g.s} y={-80 * g.s} width={28 * g.s} height={80 * g.s} rx={6 * g.s} fill="#c9302c" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          <rect x={-10 * g.s} y={-62 * g.s} width={20 * g.s} height={4 * g.s} fill={PAL.ink} />
        </g>
        <Fighter x={g.x + g.W * (0.3 + lt * 0.0015) + pan * 1.2} y={g.ground + 30 * g.s} scale={g.sc * 0.86} mode="walk" costume={{ ...C5.siamNavy, sash: "#7a3a1a" }} weapon="none" />
        <Grass g={g} shift={pan * 1.6} color="#5a6a3a" />
      </g>
    )}
  </V2>
);

// Officials walk into the new ministry buildings; twelve signboards light up on "สิบสอง".
const MinistryScene = ({ id, start, end, twelve }: { id: string; start: number; end: number; twelve: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#6a9ad0", "#f8e8c8"]} accent={GOLD}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.85, 0.2]} far="#a0a8b8" mid="#8a8a7a" ground="#8a7a5a" ridges={false} />
          <Colonnade x={g.x + g.W * 0.25 + pan * 0.4} y={g.ground - 20 * g.s} w={g.W * 0.4} s={g.s * 0.8} sign="มหาดไทย" />
          <Colonnade x={g.x + g.W * 0.75 + pan * 0.4} y={g.ground - 20 * g.s} w={g.W * 0.4} s={g.s * 0.8} roof="#3a6a4a" sign="กลาโหม" />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={g.x + g.W * (0.04 + i * 0.08) + pan * 0.6} y={g.y + 14 * g.s + (i % 2) * 10 * g.s} width={g.W * 0.065} height={16 * g.s} rx={4 * g.s} fill="#1f2a3a" stroke={PAL.gilt} strokeWidth={1.4 * g.s} opacity={interpolate(frame, [twelve + i * 2, twelve + i * 2 + 8], [0, 1], clamp)} />
          ))}
          {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + g.W * (0.1 + i * 0.24) + pan * 1.2} y={g.ground + 30 * g.s} scale={g.sc * 0.8} mode="walk" costume={C5.official} weapon="none" phase={i} />)}
          <Grass g={g} shift={pan * 1.6} color="#4a5a2a" />
        </g>
      )}
    </V2>
  );
};

// Lamp-lit office of the Interior Ministry: a big map of Siam on the wall, clerks with documents.
const InteriorScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#3a2414", "#6a4a2a"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#4a3220" />
        <g transform={`translate(${pan * 0.2},0)`}>
          <rect x={g.x + g.W * 0.3} y={g.y + 16 * g.s} width={g.W * 0.4} height={g.H * 0.55} fill="#e9dcb8" stroke="#7a5a2a" strokeWidth={6 * g.s} />
          <path d={`M${g.x + g.W * 0.48} ${g.y + 30 * g.s} q${30 * g.s} ${20 * g.s} ${20 * g.s} ${60 * g.s} q${30 * g.s} ${10 * g.s} ${20 * g.s} ${30 * g.s} q${-30 * g.s} ${20 * g.s} ${-26 * g.s} ${60 * g.s} q${-20 * g.s} ${-40 * g.s} ${-30 * g.s} ${-90 * g.s} Z`} fill="#c9a24a" stroke={PAL.ink} strokeWidth={1.4 * g.s} opacity={0.85} />
        </g>
        <rect x={g.x - 40 * g.s} y={g.ground - 30 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#2a1a10" />
        <rect x={g.x + g.W * 0.08 + pan * 0.7} y={g.ground - 44 * g.s} width={g.W * 0.84} height={14 * g.s} fill="#6a3a1a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
        <Manuscript x={g.x + g.W * 0.18 + pan * 0.7} y={g.ground - 46 * g.s} w={200 * g.s} s={g.s} />
        <Candle x={g.x + g.W * 0.82 + pan * 0.7} y={g.ground - 44 * g.s} s={g.s * 1.3} />
        <Noble x={g.x + g.W * 0.12 + pan * 1.3} y={g.ground + 40 * g.s} scale={g.sc * 0.8} mode="kneel" phase={1} />
        <Noble x={g.x + g.W * 0.88 + pan * 1.3} y={g.ground + 40 * g.s} scale={g.sc * 0.8} mode="kneel" flip phase={2} jacket="#c9b48a" />
      </g>
    )}
  </V2>
);

// A commissioner from Bangkok rides up to a provincial town gate under the Siamese flag.
const CommissionerScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.korat} start={start} end={end} sky={["#7aa0c8", "#f0d8a0"]} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.25]} far="#8a8aa0" mid="#6a7a4a" ground="#8a6a40" />
        <g transform={`translate(${g.x + g.W * 0.78 + pan * 0.5},${g.ground - 10 * g.s})`}>
          <rect x={-90 * g.s} y={-90 * g.s} width={180 * g.s} height={90 * g.s} fill="#cfc6b0" stroke={PAL.ink} strokeWidth={2 * g.s} />
          <rect x={-26 * g.s} y={-64 * g.s} width={52 * g.s} height={64 * g.s} fill="#3a2414" />
          {Array.from({ length: 7 }, (_, i) => <rect key={i} x={(-90 + i * 26) * g.s} y={-102 * g.s} width={14 * g.s} height={12 * g.s} fill="#cfc6b0" stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
        </g>
        <PanelFlag x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground - 100 * g.s} s={g.s} kind="siam" />
        <Horse x={g.x + g.W * (0.18 + lt * 0.0012) + pan * 1.0} y={g.ground + 24 * g.s} scale={g.sc * 0.62} rider={C5.official} phase={0} />
        <Fighter x={g.x + g.W * (0.06 + lt * 0.0012) + pan * 1.0} y={g.ground + 30 * g.s} scale={g.sc * 0.66} mode="walk" costume={C5.siamArmy} weapon="rifle" phase={1} />
        <Grass g={g} shift={pan * 1.6} color="#4a5a2a" />
      </g>
    )}
  </V2>
);

// Frontier in jungle mist: a foreign officer plants a flag beside a leaning, unmarked post.
const FrontierScene = ({ id, start, end, plant }: { id: string; start: number; end: number; plant: number }) => {
  const frame = useCurrentFrame();
  const up = interpolate(frame, [plant - 10, plant + 10], [0, 1], clamp);
  return (
    <V2 id={id} anchor={[104.3, 16.0]} start={start} end={end} sky={["#4a5a5a", "#a8b8a0"]} accent={RED} warm={0.03}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.7, 0.25]} lightColor={["#dfe8d8", "#f4f8f0"]} far="#5a6a5a" mid="#3a4a3a" ground="#3a3a2a" mist="#dfe8d8" />
          {[0.05, 0.3, 0.88].map((f, i) => <Tree key={i} x={g.x + g.W * f + pan * 0.5} y={g.ground - 10 * g.s} s={g.s * (1.1 + i * 0.2)} kind={i % 2 ? "palm" : "round"} />)}
          <rect x={g.x + g.W * 0.45 + pan * 0.7} y={g.ground - 70 * g.s} width={8 * g.s} height={70 * g.s} fill="#6a4a2a" transform={`rotate(-14,${g.x + g.W * 0.45 + pan * 0.7},${g.ground})`} />
          <Fighter x={g.x + g.W * 0.64 + pan * 0.9} y={g.ground + 16 * g.s} scale={g.sc * 0.78} mode="stand" costume={C5.french} weapon="rifle" />
          <g transform={`translate(${g.x + g.W * 0.74 + pan * 0.9},${g.ground + 16 * g.s}) scale(1,${Math.max(0.01, up)})`}>
            <PanelFlag x={0} y={0} s={g.s * 1.2} kind="fr" h={110} />
          </g>
          <rect x={g.x} y={g.ground - 60 * g.s} width={g.W} height={60 * g.s} fill="#dfe8d8" opacity={0.25} />
          <Grass g={g} shift={pan * 1.6} color="#1f2a18" />
        </g>
      )}
    </V2>
  );
};

// Surveyors on a hill: theodolite, a striped pole raised on the ridge.
const SurveyScene = ({ id, start, end, raise }: { id: string; start: number; end: number; raise: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={[101.2, 17.9]} start={start} end={end} sky={["#5a8ac0", "#f0e0b8"]} accent={GOLD}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.85, 0.22]} far="#7a8aa0" mid="#5a7a4a" ground="#6a6a3a" />
          <Theodolite x={g.x + g.W * 0.3 + pan * 0.8} y={g.ground + 4 * g.s} s={g.s * 1.1} />
          <Fighter x={g.x + g.W * 0.22 + pan * 0.8} y={g.ground + 8 * g.s} scale={g.sc * 0.74} mode="aim" costume={C5.official} weapon="none" />
          <SurveyPole x={g.x + g.W * 0.78 + pan * 0.5} y={g.ground - 30 * g.s} s={g.s} up={interpolate(frame, [raise - 12, raise + 6], [0, 1], clamp)} />
          <Fighter x={g.x + g.W * 0.84 + pan * 0.5} y={g.ground - 26 * g.s} scale={g.sc * 0.5} mode="stand" costume={C5.villager} weapon="none" flip />
          <Grass g={g} shift={pan * 1.6} color="#3a4a22" />
        </g>
      )}
    </V2>
  );
};

// The first steam train crosses the rice plain north of Bangkok.
const TrainScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#7ab0e0", "#f8e8c0"]} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.15, 0.22]} far="#9aa8b8" mid="#7a9a5a" ground="#7a9a3a" />
        <Tree x={g.x + g.W * 0.85 + pan * 0.5} y={g.ground - 20 * g.s} s={g.s} kind="palm" />
        <Rails g={g} y={g.ground - 4 * g.s} pan={pan} />
        <Locomotive x={g.x + g.W * (0.3 + lt * 0.0016) + pan * 0.7} y={g.ground - 8 * g.s} s={g.s * 0.62} />
        <Reeds g={g} y={g.ground + 44 * g.s} wind={lt * 0.06} shift={pan * 1.6} color="#8aa03a" />
      </g>
    )}
  </V2>
);

// Soldiers in white tunics board the train at a station platform.
const BoardScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.korat} start={start} end={end} sky={["#6a90c0", "#f0d8b0"]} accent={RED}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.25]} far="#8a90a0" mid="#7a7a6a" ground="#8a7a5a" ridges={false} />
        <rect x={g.x - 40 * g.s} y={g.y + 10 * g.s} width={g.W + 80 * g.s} height={22 * g.s} fill="#7a2a1a" transform={`translate(${pan * 0.3},0)`} />
        <Locomotive x={g.x + g.W * 0.95 + pan * 0.5} y={g.ground - 18 * g.s} s={g.s * 0.6} cars={3} />
        <rect x={g.x - 40 * g.s} y={g.ground - 6 * g.s} width={g.W + 80 * g.s} height={20 * g.s} fill="#9a9a8a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
        {[0, 1, 2, 3, 4, 5].map((i) => <Fighter key={i} x={g.x + g.W * (0.04 + i * 0.16) + pan * 1.3} y={g.ground + 36 * g.s} scale={g.sc * 0.84} mode="walk" costume={C5.siamArmy} weapon="rifle" phase={i * 0.9} />)}
        <PanelFlag x={g.x + g.W * 0.06 + pan * 1.3} y={g.ground - 10 * g.s} s={g.s * 1.2} kind="siam" />
      </g>
    )}
  </V2>
);

// Advisers from many countries around one council table, each with a small flag.
const CouncilScene = ({ id, start, end, many }: { id: string; start: number; end: number; many: number }) => {
  const frame = useCurrentFrame();
  const flags = ["be", "dk", "uk", "de", "us", "fr"] as const;
  return (
    <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#3a2a1a", "#7a5a3a"]} accent={GOLD} warm={0.1}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#5a3a22" />
          {[0.15, 0.5, 0.85].map((f) => <rect key={f} x={g.x + g.W * f - 30 * g.s + pan * 0.2} y={g.y + 20 * g.s} width={60 * g.s} height={g.H * 0.4} rx={30 * g.s} fill="#f3d9a0" opacity={0.25} />)}
          {flags.map((k, i) => <Fighter key={k} x={g.x + g.W * (0.1 + i * 0.16) + pan * 0.6} y={g.ground - 10 * g.s} scale={g.sc * 0.6} mode="stand" costume={{ ...C5.europe, head: "short", jacket: ["#1a1a2a", "#3a2a2a", "#2a3a2a", "#2a2a3a", "#3a3a2a", "#2a3f7a"][i] }} weapon="none" phase={i} flip={i > 2} />)}
          <rect x={g.x + g.W * 0.04 + pan * 0.8} y={g.ground - 30 * g.s} width={g.W * 0.92} height={18 * g.s} fill="#2a5a3a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          {flags.map((k, i) => (
            <g key={k} opacity={interpolate(frame, [many + i * 5, many + i * 5 + 8], [0, 1], clamp)}>
              <NationFlag x={g.x + g.W * (0.08 + i * 0.16) + pan * 0.8} y={g.ground - 30 * g.s} s={g.s * 0.8} kind={k} />
            </g>
          ))}
          <rect x={g.x - 40 * g.s} y={g.ground - 12 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#3a2414" />
          <Candle x={g.x + g.W * 0.5 + pan * 1.3} y={g.ground + 40 * g.s} s={g.s * 1.3} />
        </g>
      )}
    </V2>
  );
};

// An hourglass running out on a desk; outside the window the sky darkens.
const HourglassScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [start, end], [0.45, 1], clamp);
  return (
    <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#2a2a3a", "#6a4a3a"]} accent={RED} warm={0.06}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3a2a1e" />
          <g transform={`translate(${pan * 0.2},0)`}>
            <rect x={g.x + g.W * 0.55} y={g.y + 16 * g.s} width={g.W * 0.36} height={g.H * 0.55} fill={`rgb(${Math.round(140 - 100 * k)},${Math.round(110 - 80 * k)},${Math.round(120 - 60 * k)})`} stroke="#6a4a2a" strokeWidth={8 * g.s} />
            <line x1={g.x + g.W * 0.73} y1={g.y + 16 * g.s} x2={g.x + g.W * 0.73} y2={g.y + 16 * g.s + g.H * 0.55} stroke="#6a4a2a" strokeWidth={5 * g.s} />
          </g>
          <rect x={g.x - 40 * g.s} y={g.ground - 20 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#5a3a1f" stroke={PAL.ink} strokeWidth={2 * g.s} />
          <Hourglass x={g.x + g.W * 0.3 + pan * 0.7} y={g.ground - 20 * g.s} s={g.s * 0.95} k={k} />
          <Manuscript x={g.x + g.W * 0.5 + pan * 0.7} y={g.ground - 22 * g.s} w={160 * g.s} s={g.s} />
          <Candle x={g.x + g.W * 0.1 + pan * 1.3} y={g.ground + 30 * g.s} s={g.s * 1.2} />
        </g>
      )}
    </V2>
  );
};

// "Weeks → a few days" counter while troops ride east.
const DaysCard = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.soldiers || frame > T.adv + 6) return null;
  const k = interpolate(frame, [T.soldiers, T.soldiers + 10, T.adv - 6, T.adv + 6], [0, 1, 1, 0], clamp);
  const fast = interpolate(frame, [T.days - 8, T.days + 6], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", right: 60 * s, top: height * 0.33, opacity: k, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.86)", borderRadius: 16 * s, padding: `${10 * s}px ${24 * s}px`, borderTop: `${6 * s}px solid ${RED}`, textAlign: "center", lineHeight: 1.25 }}>
      <div style={{ fontSize: 26 * s, fontWeight: 700 }}>กรุงเทพฯ → ชายแดน</div>
      <div style={{ fontSize: 40 * s, fontWeight: 900, opacity: 1 - 0.6 * fast, textDecoration: fast > 0.5 ? "line-through" : "none" }}>หลายสัปดาห์</div>
      <div style={{ fontSize: 56 * s, fontWeight: 900, color: GOLD, opacity: fast }}>ไม่กี่วัน</div>
    </div>
  );
};

const EMPIRE: [AreaId, string, number][] = [["thai", SIAM_C, 1], ["burma", BRIT_C, 1], ["malayaSouth", BRIT_C, 1], ["vietnam", FR_C, 1], ["cambodia", FR_C, 1], ["bsr", SIAM_C, 1], ["laos", SIAM_C, 0.5]];

export const e5c3: Chapter5 = {
  name: "ปฏิรูปแข่งกับเวลา",
  from: FROM,
  to: END,
  cams: (w, h) => [
    { frame: FROM, cam: view(VW.siam, w, h, 0.85, 0.08) },
    { frame: T.wires, cam: view(VW.siam, w, h, 0.85, 0.08) },
    { frame: T.min, cam: view(VW.rail, w, h, 0.9, 0.08) },
    { frame: T.mon, cam: view(VW.siam, w, h, 0.85, 0.08) },
    { frame: T.why, cam: view(VW.hook, w, h, 0.9, 0.1) },
    { frame: T.map, cam: view(VW.siam, w, h, 0.85, 0.08) },
    { frame: T.rail, cam: view(VW.rail, w, h, 0.9, 0.08) },
    { frame: T.troops, cam: view(VW.northeast, w, h, 0.9, 0.08) },
    { frame: T.adv, cam: view(VW.siam, w, h, 0.85, 0.08) },
    { frame: T.late, cam: view(VW.sea, w, h, 0.85, 0.1) },
  ],
  years: [[FROM, "2417"], [T.post, "2426"], [T.min, "2435"], [T.rail, "2440"]],
  heads: [
    { f: FROM + 4, tag: "พ.ศ. 2417", head: "ลูกทาสค่อย ๆ เป็นไท", color: GOLD },
    { f: T.grad, tag: "เลิกทาสทีละขั้น", head: "ค่อยเป็นค่อยไป", stat: "กว่า 30 ปี", color: GOLD },
    { f: T.wires, tag: "การสื่อสาร", head: "สายโทรเลขถึงหัวเมือง", color: GOLD },
    { f: T.post, tag: "พ.ศ. 2426", head: "ไปรษณีย์ไทยเปิด", color: GOLD },
    { f: T.min, tag: "พ.ศ. 2435", head: "ยกเลิกจตุสดมภ์", stat: "4", label: "กรมแบบเดิม", color: RED },
    { f: T.twelve, tag: "พ.ศ. 2435", head: "ตั้งกระทรวงแบบใหม่", stat: "12", label: "กระทรวง", color: GOLD },
    { f: T.dam, tag: "เสนาบดีกระทรวงมหาดไทย", head: "กรมพระยาดำรงราชานุภาพ", color: GOLD, portrait: "damrong", photo: "ภาพถ่าย" },
    { f: T.mon, tag: "มณฑลเทศาภิบาล", head: "ข้าหลวงจากกรุงเทพฯ", color: GOLD },
    { f: T.why, tag: "ในสายตาฝรั่ง", head: "ไม่มีใครปกครองจริง = เอาได้", color: RED },
    { f: T.map, tag: "ทำแผนที่", head: "ปักเขตแดนให้ชัด", color: GOLD },
    { f: T.rail, tag: "พ.ศ. 2440", head: "รถไฟสายแรก กรุงเทพฯ–อยุธยา", color: GOLD },
    { f: T.korat, tag: "ต่อไปถึง", head: "นครราชสีมา (โคราช)", color: GOLD },
    { f: T.troops, tag: "ไม่ใช่แค่ขนข้าว", head: "ส่งทหารถึงชายแดน", color: RED },
    { f: T.adv, tag: "ที่ปรึกษาหลายชาติ", head: "ไม่ให้ใครคุมได้หมด", color: GOLD, portrait: "rolin", photo: "ภาพถ่าย", chips: [{ text: "เบลเยียม", f: T.many }, { text: "เดนมาร์ก", f: T.many + 6 }, { text: "อังกฤษ", f: T.many + 12 }, { text: "เยอรมนี", f: T.many + 18 }] },
    { f: T.late, tag: "แต่ต้องใช้เวลา", head: "เวลาของสยามกำลังหมด", color: RED },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const k = interpolate(frame, [FROM - 10, FROM + 8, END + 2, END + 16], [0, 1, 1, 0], clamp);
    const fadeAt = (f: number) => 1 - ramp(frame, f, 12);
    return (
      <>
        <Empire areas={EMPIRE.map(([id, c, v]) => [id, c, v * k] as [AreaId, string, number])} />
        <CityDot at={PL.bkk} color={GOLD} r={13} start={FROM} end={END} />
        {TOWNS.map((t, i) => <MapLine key={i} a={PL.bkk} b={t} start={T.wire + i * 8} end={T.min} color="#ffe7a0" width={3} />)}
        <Grid k={ramp(frame, T.monthon, 18, T.why)} />
        {MONTHON.map((p, i) => <CityDot key={i} at={p} color={GOLD} r={9} start={T.commish + i * 4} end={T.why} />)}
        <Border faint={ramp(frame, T.why, 14, T.map + 10)} solid={interpolate(frame, [T.survey, T.clear], [0, 1], clamp) * fadeAt(T.rail)} />
        <Arrow points={[[95.6, 18.4], [98.0, 17.2]]} start={T.take - 14} end={T.take + 6} color={BRIT_C} width={14} opacity={fadeAt(T.map)} />
        <Arrow points={[[107.0, 15.6], [104.6, 15.4]]} start={T.take - 8} end={T.take + 12} color={FR_C} width={14} opacity={fadeAt(T.map)} />
        <Arrow points={R.railNorth.slice(0, 3)} start={T.rail + 6} end={T.ayut + 6} color={RED} width={9} variant="dashed" opacity={fadeAt(T.adv)} />
        <Arrow points={R.railNorth.slice(2)} start={T.korat - 14} end={T.korat + 10} color={RED} width={9} variant="dashed" opacity={fadeAt(T.adv)} />
        <Arrow points={R.koratEast} start={T.soldiers} end={T.soldiers + 30} color={GOLD} width={14} opacity={fadeAt(T.adv)} />
        {frame >= T.rail && frame < T.adv && (
          <>
            <PointLabel at={PL.ayut} text="อยุธยา" start={T.ayut} color={GOLD} size={0.8} />
            <PointLabel at={PL.korat} text="โคราช" start={T.korat} color={GOLD} size={0.8} />
          </>
        )}
        {frame >= T.troops && frame < T.adv && <PointLabel at={PL.khammouane} text="แม่น้ำโขง" start={T.soldiers + 20} color={RED} size={0.75} />}
      </>
    );
  },
  Panels: () => (
    <>
      <DecreeScene id="e5c3decree" start={FROM} end={T.child + 14} />
      <FreedomScene id="e5c3free" start={T.child} end={T.grad + 14} free={T.free} />
      <TelegraphScene id="e5c3tele" start={T.wires} end={T.post + 14} />
      <PostScene id="e5c3post" start={T.post} end={T.min + 14} />
      <MinistryScene id="e5c3min" start={T.min} end={T.dam + 14} twelve={T.twelve} />
      <InteriorScene id="e5c3int" start={T.dam} end={T.mon + 14} />
      <CommissionerScene id="e5c3com" start={T.mon} end={T.why + 14} />
      <FrontierScene id="e5c3front" start={T.why} end={T.map + 14} plant={T.take} />
      <SurveyScene id="e5c3survey" start={T.map} end={T.rail + 14} raise={T.clear} />
      <TrainScene id="e5c3train" start={T.rail} end={T.troops + 14} />
      <BoardScene id="e5c3board" start={T.troops} end={T.adv + 14} />
      <CouncilScene id="e5c3council" start={T.adv} end={T.late + 14} many={T.many} />
      <HourglassScene id="e5c3hour" start={T.late} end={END + 14} />
    </>
  ),
  Screen: () => {
    const frame = useCurrentFrame();
    return (
      <>
        {frame >= T.grad - 2 && frame <= T.wires + 14 && (
          <Timeline
            start={T.grad}
            end={T.wires + 12}
            title="เลิกทาสทีละขั้น"
            from={2400}
            to={2452}
            marks={[
              { at: 2406, top: "อเมริกา", bottom: "สงครามกลางเมือง", f: T.usa, color: RED },
              { at: 2417, top: "2417", bottom: "ลูกทาสเป็นไท", f: T.grad + 6 },
              { at: 2448, top: "2448", bottom: "เลิกทาสครบ", f: T.thirty, big: true },
            ]}
          />
        )}
        <DaysCard />
      </>
    );
  },
  sfx: [
    [T.grad, SFX.whoosh, 0.25],
    [T.twelve, SFX.pop, 0.3],
    [T.many, SFX.pop, 0.25],
    [T.days, SFX.pop, 0.3],
  ],
  Audio: () => (
    <>
      <Bed id="city_crowd" from={FROM} to={T.grad + 10} volume={0.18} voice={VOICE} />
      <Hit id="gong" at={T.decree} volume={0.35} />
      <Hit id="wood_break" at={T.free} volume={0.35} />
      <Bed id="wind" from={T.wires} to={T.post + 10} volume={0.18} voice={VOICE} />
      <Hit id="electric_switch" at={T.wire + 4} volume={0.35} />
      <Hit id="keyboard_typing" at={T.towns} volume={0.3} />
      <Bed id="city_crowd" from={T.post} to={T.dam + 10} volume={0.16} voice={VOICE} />
      <Hit id="gong" at={T.twelve} volume={0.3} />
      <Bed id="fire_crackle" from={T.dam} to={T.mon + 10} volume={0.12} voice={VOICE} />
      <Hit id="horse_gallop" at={T.mon + 6} volume={0.35} />
      <Bed id="jungle_rain" from={T.why} to={T.map + 10} volume={0.2} voice={VOICE} />
      <Hit id="wood_hit" at={T.take} volume={0.4} />
      <Bed id="wind" from={T.map} to={T.rail + 10} volume={0.18} voice={VOICE} />
      <Hit id="wood_hit" at={T.clear} volume={0.35} />
      <Bed id="wind" from={T.rail} to={T.adv} volume={0.14} voice={VOICE} />
      <Hit id="whistle_officer" at={T.rail + 8} volume={0.35} />
      <Hit id="army_marching" at={T.soldiers} volume={0.35} />
      <Bed id="city_crowd" from={T.adv} to={T.late + 10} volume={0.12} voice={VOICE} />
      <Bed id="wind" from={T.late} to={END + 14} volume={0.2} voice={VOICE} />
      <Hit id="gong" at={T.out} volume={0.3} />
    </>
  ),
};
