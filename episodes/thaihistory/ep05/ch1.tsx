import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { Fighter, Glow, Grass } from "../../../components/Scene";
import type { Cam } from "../../../components/camera";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { Backdrop, Boat, Candle, Hall, Manuscript, Noble, PAL, River, Tree, V2 } from "../ep04/v2";
import { Balance, Cloud, Firework, Parasol, Ship } from "../ep04/ch1_kit";
import { Stars, Tent } from "../ep04/ch3_kit";
import { B, BRIT_C, CityDot, Empire, FR_C, MapFlag, ramp, SIAM_C, VOICE, wp, type Chapter5 } from "./beatsKit";
import { Compare } from "./cards";
import { BackFigure, Eclipse, Lamp, Mangroves, Mosquitoes, Throne } from "./ch1_kit5";
import { C5, Colonnade, Gunboat, PanelFlag, Sea } from "./kit5";
import { Bed, Hit, SFX } from "./mix";
import { PL, R, VW } from "./places";

// Chapter 1 (eclipse → crowned): the 15-year-old king, the regent, the Bowring burden, learning from colonies.
const T = {
  start: B.eclipse.start,
  wako: wp("eclipse", "หว้า", 0.8),
  total: wp("eclipse", "สุริยุปราคา", 0.6),
  fever: B.fever.start,
  died: wp("fever", "สวรรคต", 0.35),
  son: wp("fever", "ราชโอรส", 0.6),
  young: B.young.start,
  fifteen: wp("young", "สิบ", 0.8),
  regent: B.regent.start,
  bunnag: wp("regent", "ขุนนาง", 0.65),
  five: wp("regent", "ห้า", 0.95),
  bowring: B.bowring.start,
  uk: wp("bowring", "อังกฤษ", 0.6),
  unequal: B.unequal.start,
  three: wp("unequal", "สาม", 0.4),
  court: wp("unequal", "ศาล", 0.85),
  others: B.others.start,
  ask: wp("others", "ขอ", 0.6),
  travel: B.travel.start,
  sing: wp("travel", "สิงคโปร์", 0.35),
  java: wp("travel", "ชวา", 0.45),
  india: wp("travel", "อินเดีย", 0.55),
  colony: wp("travel", "อาณานิคม", 0.7),
  crowned: B.crowned.start,
  rite: wp("crowned", "ราชาภิเษก", 0.5),
  rule: wp("crowned", "บริหาร", 0.8),
};
// Hold each view until ~24 frames before the next move, so the camera moves on the cue, not across a whole beat.
const hold = (keys: { frame: number; cam: Cam }[]) => keys.flatMap((k, i) => (i && keys[i - 1].frame < k.frame - 24 ? [{ frame: k.frame - 24, cam: keys[i - 1].cam }, k] : [k]));
const END = B.west.start;
const STAMP = T.uk + 6;

// ---------------- panels ----------------

// Beach camp at Wa Ko: tents, officials and foreign astronomers walk along the shore under the morning sun.
const WakoCampScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.wako} start={start} end={end} sky={["#6aa0c8", "#f4d8a0"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.25]} far="#6a7a8a" mid="#5a6a48" ground="#d8c08a" mist="#fff0d0" />
        <Sea g={g} y={g.ground - 26 * g.s} pan={pan} near={false} color="#4a8ab0" deep="#2a5a7a" />
        <rect x={g.x - 60 * g.s} y={g.ground - 4 * g.s} width={g.W + 120 * g.s} height={g.H} fill="#d8c08a" />
        <Tent x={g.x + g.W * 0.12 + pan * 0.5} y={g.ground} w={150 * g.s} s={g.s} color="#efe6d0" />
        <Tent x={g.x + g.W * 0.32 + pan * 0.5} y={g.ground} w={110 * g.s} s={g.s} color="#e8d8b0" />
        <PanelFlag x={g.x + g.W * 0.23 + pan * 0.5} y={g.ground - 20 * g.s} s={g.s} kind="siam" h={120} />
        <Tree x={g.x + g.W * 0.9 + pan * 0.5} y={g.ground} s={g.s} kind="palm" />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.48 + i * 0.1) + lt * 0.5 * g.s + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode="walk" weapon="none" costume={i === 1 ? C5.europe : C5.official} phase={i * 1.3} />)}
        <Grass g={g} shift={pan * 1.6} color="#7a7a3a" />
      </g>
    )}
  </V2>
);

// Totality: the sun goes dark over the sea, stars come out, people look up.
const TotalityScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.wako} start={start} end={end} sky={["#141a30", "#4a4a6a"]} accent={GOLD} warm={0.03}>
    {(g, pan, lt) => {
      const k = interpolate(lt, [0, 50], [0.55, 1], clamp);
      return (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#0e1428" opacity={0.6 * k} />
          <g opacity={Math.max(0, (k - 0.8) * 5)}>
            <Stars g={g} n={22} />
          </g>
          <Eclipse x={g.x + g.W * 0.62 + pan * 0.1} y={g.y + g.H * 0.3} r={34 * g.s} k={k} />
          <Sea g={g} y={g.ground - 40 * g.s} pan={pan} near={false} color="#2a3a5a" deep="#141e34" />
          <rect x={g.x - 60 * g.s} y={g.ground - 6 * g.s} width={g.W + 120 * g.s} height={g.H} fill="#5a4a34" />
          {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + g.W * (0.12 + i * 0.12) + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode="stand" weapon="none" costume={i === 2 ? C5.europe : C5.official} phase={i} />)}
          <Grass g={g} shift={pan * 1.6} color="#1a1a14" />
        </g>
      );
    }}
  </V2>
);

// Malaria: mangrove swamp at night, mosquitoes swarm in the damp mist.
const FeverScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.wako} start={start} end={end} sky={["#0e1a1e", "#2a3a34"]} accent={RED} warm={0.03}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.2]} lightColor={["#c8e0d0", "#f0fff4"]} far="#1e2a28" mid="#18221e" ground="#14201a" mist="#8ab0a0" />
        <rect x={g.x - 60 * g.s} y={g.ground - 30 * g.s} width={g.W + 120 * g.s} height={g.H} fill="#1a2a2a" />
        <Mangroves g={g} pan={pan * 0.5} color="#0e1812" />
        <rect x={g.x} y={g.ground - 80 * g.s} width={g.W} height={60 * g.s} fill="#a0c8b8" opacity={0.15} />
        <Mosquitoes x={g.x + g.W * 0.55 + pan * 0.7} y={g.y + g.H * 0.4} s={g.s * 1.4} n={18} />
        <Mangroves g={{ ...g, ground: g.ground + 40 * g.s }} pan={pan * 1.6} color="#060c08" />
      </g>
    )}
  </V2>
);

// Mourning: the hall at night, nobles prostrate in white before candles.
const MourningScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.palace} start={start} end={end} sky={["#14121e", "#2a2430"]} accent={GOLD} warm={0.05}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1c1820" />
        {[0.1, 0.3, 0.7, 0.9].map((f) => <rect key={f} x={g.x + g.W * f - 12 * g.s + pan * 0.2} y={g.y} width={24 * g.s} height={g.H} fill="#2a2228" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        <rect x={g.x + g.W * 0.42 + pan * 0.4} y={g.y + g.H * 0.1} width={g.W * 0.16} height={g.H * 0.55} fill="#efe6d0" opacity={0.85} />
        <Candle x={g.x + g.W * 0.38 + pan * 0.5} y={g.ground - 20 * g.s} s={g.s * 1.2} />
        <Candle x={g.x + g.W * 0.62 + pan * 0.5} y={g.ground - 20 * g.s} s={g.s * 1.2} />
        <rect x={g.x - 40 * g.s} y={g.ground - 20 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#2a2018" />
        {[0, 1, 2, 3, 4].map((i) => <Noble key={i} x={g.x + g.W * (0.08 + i * 0.2) + pan * 1.2} y={g.ground + 10 * g.s} scale={g.sc * 0.6} mode="prostrate" jacket="#f4f2ea" phase={i} />)}
      </g>
    )}
  </V2>
);

// The royal barge rows home up the river at dusk, carrying the sick prince.
const BargeHomeScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#3a2a4a", "#e0905a"]} accent={GOLD} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.75, 0.38]} lightColor={["#ff9a50", "#ffe0b0"]} far="#5a4a6a" mid="#3a3a3a" ground="#2a2a20" mist="#f0b080" />
        <River g={g} y={g.ground - 30 * g.s} pan={pan} color="#3a4a6a" />
        <Boat x={g.x + g.W * (0.2 + lt * 0.0012) + pan * 0.7} y={g.ground + 8 * g.s} w={260 * g.s} s={g.s} n={6} canopy gilt />
        <Boat x={g.x + g.W * (0.6 + lt * 0.0012) + pan * 0.7} y={g.ground + 2 * g.s} w={150 * g.s} s={g.s} n={4} />
        <Grass g={g} shift={pan * 1.6} color="#1a1a12" />
      </g>
    )}
  </V2>
);

// The new king, seen from behind on the high throne; nobles kneel far below.
const YoungThroneScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.palace} start={start} end={end} sky={["#3a1a10", "#8a4a22"]} accent={GOLD} warm={0.14}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#4a2214" />
        {[0.08, 0.26, 0.74, 0.92].map((f) => <rect key={f} x={g.x + g.W * f - 14 * g.s + pan * 0.2} y={g.y} width={28 * g.s} height={g.H} fill="#6a3018" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        <Throne x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 30 * g.s} s={g.s} />
        <BackFigure x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 80 * g.s} scale={g.sc * 0.42} />
        <rect x={g.x - 40 * g.s} y={g.ground - 30 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#3a2414" />
        {[0, 1, 2, 3, 4, 5].map((i) => <Noble key={i} x={g.x + g.W * (0.04 + i * 0.18) + pan * 1.4} y={g.ground + 16 * g.s} scale={g.sc * 0.7} mode="prostrate" phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />)}
      </g>
    )}
  </V2>
);

// The regent's council: officials around a low table of documents and seals.
const RegentCouncilScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.palace} start={start} end={end} sky={["#2a1a10", "#6a3a1a"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3a2214" />
        <Hall x={g.x + g.W * 0.5 + pan * 0.2} y={g.ground - 40 * g.s} w={g.W * 0.9} s={g.s} glow={0.6} />
        <rect x={g.x - 40 * g.s} y={g.ground - 30 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#4a2e1a" />
        <rect x={g.x + g.W * 0.3 + pan * 0.7} y={g.ground - 30 * g.s} width={g.W * 0.4} height={16 * g.s} fill="#7a4a24" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
        <Manuscript x={g.x + g.W * 0.33 + pan * 0.7} y={g.ground - 32 * g.s} w={150 * g.s} s={g.s} lines={4} />
        <Candle x={g.x + g.W * 0.64 + pan * 0.7} y={g.ground - 30 * g.s} s={g.s} />
        <Noble x={g.x + g.W * 0.18 + pan * 1.0} y={g.ground + 10 * g.s} scale={g.sc * 0.7} mode="sit" jacket="#efe6d0" />
        <Noble x={g.x + g.W * 0.82 + pan * 1.0} y={g.ground + 10 * g.s} scale={g.sc * 0.7} mode="kneel" jacket="#c9b48a" flip phase={1} />
        <Noble x={g.x + g.W * 0.5 + pan * 1.6} y={g.ground + 40 * g.s} scale={g.sc * 0.8} mode="prostrate" jacket="#e8dcc0" phase={2} />
      </g>
    )}
  </V2>
);

// The Bunnag household by the river: a mansion with a western ship moored in front.
const BunnagRiverScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#7aa8c8", "#f0d8a8"]} accent={GOLD} warm={0.1}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.25]} far="#7a8a9a" mid="#5a6a4a" ground="#5a4a30" mist="#fff0d0" ridges={false} />
        <Hall x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 40 * g.s} w={g.W * 0.4} s={g.s} />
        <Tree x={g.x + g.W * 0.06 + pan * 0.5} y={g.ground - 40 * g.s} s={g.s} />
        <Tree x={g.x + g.W * 0.58 + pan * 0.5} y={g.ground - 40 * g.s} s={g.s} kind="palm" />
        <River g={g} y={g.ground - 36 * g.s} pan={pan} />
        <Ship x={g.x + g.W * 0.78 + pan * 0.7} y={g.ground - 8 * g.s} s={g.s * 0.5} />
        <Boat x={g.x + g.W * 0.3 + pan * 1.2} y={g.ground + 20 * g.s} w={150 * g.s} s={g.s} n={3} />
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// Bowring treaty: British envoy and Siamese official at a table, flags behind; the seal comes down.
const TreatyScene = ({ id, start, end, stamp }: { id: string; start: number; end: number; stamp: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#3a2a1a", "#7a5a3a"]} accent={BRIT_C} hits={[stamp]} warm={0.1}>
      {(g, pan) => {
        const down = interpolate(frame, [stamp - 10, stamp], [-40, 0], clamp) * g.s;
        const cx = g.x + g.W * 0.5 + pan * 1.0;
        return (
          <g>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#4a3424" />
            <rect x={g.x + g.W * 0.1 + pan * 0.2} y={g.y + g.H * 0.08} width={g.W * 0.8} height={g.H * 0.35} fill="#5a4030" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <PanelFlag x={g.x + g.W * 0.3 + pan * 0.4} y={g.ground - 90 * g.s} s={g.s * 1.3} kind="uk" h={80} w={60} />
            <PanelFlag x={g.x + g.W * 0.66 + pan * 0.4} y={g.ground - 90 * g.s} s={g.s * 1.3} kind="siam" h={80} w={60} />
            <Fighter x={g.x + g.W * 0.18 + pan * 0.7} y={g.ground + 2 * g.s} scale={g.sc * 0.7} mode="stand" weapon="none" costume={C5.british} />
            <Fighter x={g.x + g.W * 0.82 + pan * 0.7} y={g.ground + 2 * g.s} scale={g.sc * 0.7} mode="stand" weapon="none" costume={C5.official} flip />
            <rect x={g.x + g.W * 0.28 + pan * 1.0} y={g.ground - 40 * g.s} width={g.W * 0.44} height={18 * g.s} fill="#6a4020" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <rect x={g.x + g.W * 0.36 + pan * 1.0} y={g.ground - 48 * g.s} width={g.W * 0.28} height={10 * g.s} fill="#f4ecd8" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
            <g transform={`translate(${cx},${g.ground - 56 * g.s + down})`}>
              <rect x={-8 * g.s} y={-50 * g.s} width={16 * g.s} height={40 * g.s} fill="#5a3a20" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
              <rect x={-18 * g.s} y={-12 * g.s} width={36 * g.s} height={12 * g.s} fill="#a8322a" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
            </g>
            {frame >= stamp && <circle cx={cx + 40 * g.s} cy={g.ground - 44 * g.s} r={10 * g.s} fill="#c9302c" opacity={0.85} />}
            <rect x={g.x - 40 * g.s} y={g.ground - 22 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#2a1c12" />
          </g>
        );
      }}
    </V2>
  );
};

// Customs at the river port: crates from western ships, an official's balance tips the wrong way.
const CustomsScene = ({ id, start, end, three }: { id: string; start: number; end: number; three: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#8ab0c8", "#f0dcb0"]} accent={RED} warm={0.08}>
      {(g, pan, lt) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.85, 0.2]} far="#8a9aa8" mid="#6a7a5a" ground="#6a5236" mist="#fff0d0" ridges={false} />
          <River g={g} y={g.ground - 60 * g.s} pan={pan} />
          <Ship x={g.x + g.W * 0.18 + pan * 0.5} y={g.ground - 40 * g.s} s={g.s * 0.45} />
          <Ship x={g.x + g.W * 0.48 + pan * 0.5} y={g.ground - 44 * g.s} s={g.s * 0.4} />
          <rect x={g.x - 60 * g.s} y={g.ground - 24 * g.s} width={g.W + 120 * g.s} height={g.H} fill="#7a5a36" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={g.x + g.W * (0.08 + i * 0.07) + pan * 0.8} y={g.ground - (40 + (i % 2) * 26) * g.s} width={40 * g.s} height={26 * g.s} fill="#b88a50" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
          <Fighter x={g.x + g.W * (0.4 + Math.min(lt, 90) * 0.001) + pan * 0.8} y={g.ground + 2 * g.s} scale={g.sc * 0.6} mode="walk" weapon="none" costume={C5.villager} />
          <Balance x={g.x + g.W * 0.74 + pan * 0.8} y={g.ground - 4 * g.s} s={g.s * 0.9} tilt={interpolate(frame, [three, three + 20], [0, -18], clamp)} />
          <Fighter x={g.x + g.W * 0.88 + pan * 0.8} y={g.ground + 2 * g.s} scale={g.sc * 0.62} mode="stand" weapon="none" costume={C5.official} flip />
          <Grass g={g} shift={pan * 1.6} color="#4a4a2a" />
        </g>
      )}
    </V2>
  );
};

// Bangkok roadstead: ships of several nations at anchor, each with its own flag.
const RoadsteadScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#5a8ab8", "#e8d0a0"]} accent={GOLD} warm={0.08}>
    {(g, pan) => (
      <g>
        <Glow x={g.x + g.W * 0.3 + pan * 0.1} y={g.y + g.H * 0.25} s={g.s} />
        <Cloud x={g.x + g.W * 0.6 + pan * 0.2} y={g.y + g.H * 0.2} s={g.s} />
        <Sea g={g} y={g.ground - 50 * g.s} pan={pan} color="#4a7a98" deep="#2a4a62" />
        <Ship x={g.x + g.W * 0.12 + pan * 0.4} y={g.ground - 30 * g.s} s={g.s * 0.38} />
        <Gunboat x={g.x + g.W * 0.38 + pan * 0.5} y={g.ground - 20 * g.s} s={g.s * 0.5} flag="uk" />
        <Gunboat x={g.x + g.W * 0.7 + pan * 0.6} y={g.ground - 14 * g.s} s={g.s * 0.55} flag="fr" dir={-1} />
        <Ship x={g.x + g.W * 0.92 + pan * 0.5} y={g.ground - 26 * g.s} s={g.s * 0.36} />
      </g>
    )}
  </V2>
);

// Arriving at Singapore: a steamer flying the Siamese flag enters a harbour lined with colonial buildings.
const SingaporeScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.singapore} start={start} end={end} sky={["#6aa0d0", "#f4e0b0"]} accent={GOLD} warm={0.08}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.22]} far="#7a9ab0" mid="#5a7a5a" ground="#6a5a40" mist="#fff4d8" />
        <Colonnade x={g.x + g.W * 0.25 + pan * 0.5} y={g.ground - 40 * g.s} w={g.W * 0.3} s={g.s * 0.8} />
        <Colonnade x={g.x + g.W * 0.62 + pan * 0.5} y={g.ground - 40 * g.s} w={g.W * 0.22} s={g.s * 0.7} roof="#8a3a2a" cols={4} />
        <Tree x={g.x + g.W * 0.84 + pan * 0.5} y={g.ground - 40 * g.s} s={g.s} kind="palm" />
        <Sea g={g} y={g.ground - 40 * g.s} pan={pan} color="#3a7a9a" deep="#1f4a62" />
        <Gunboat x={g.x + g.W * (0.1 + Math.min(lt, 140) * 0.0025) + pan * 0.7} y={g.ground - 6 * g.s} s={g.s * 0.62} flag="siam" />
      </g>
    )}
  </V2>
);

// A colonial street: British soldiers march past a government building while locals watch.
const ColonyStreetScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.calcutta} start={start} end={end} sky={["#c8a878", "#f4e4c0"]} accent={BRIT_C} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.15, 0.25]} far="#a89878" mid="#8a7a5a" ground="#a88a5a" mist="#fff0d0" ridges={false} />
        <Colonnade x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 20 * g.s} w={g.W * 0.6} s={g.s} cols={8} />
        <PanelFlag x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 196 * g.s} s={g.s} kind="uk" h={40} />
        {[0, 1, 2, 3, 4].map((i) => <Fighter key={i} x={g.x + g.W * (0.02 + i * 0.1) + lt * 0.9 * g.s + pan * 0.8} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode="walk" weapon="rifle" costume={C5.british} phase={i * 0.7} />)}
        {[0, 1].map((i) => <Fighter key={i} x={g.x + g.W * (0.86 + i * 0.08) + pan * 1.2} y={g.ground + 18 * g.s} scale={g.sc * 0.72} mode="stand" weapon="none" costume={C5.villager} flip phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#6a5a30" />
      </g>
    )}
  </V2>
);

// Coronation: the gilt hall blazes with lamps, parasols, nobles prostrate; fireworks outside.
const CoronationScene = ({ id, start, end, rite }: { id: string; start: number; end: number; rite: number }) => (
  <V2 id={id} anchor={PL.palace} start={start} end={end} sky={["#1a1030", "#5a2a3a"]} accent={GOLD} warm={0.14}>
    {(g, pan) => (
      <g>
        <Firework x={g.x + g.W * 0.2} y={g.y + g.H * 0.25} s={g.s} at={rite} />
        <Firework x={g.x + g.W * 0.8} y={g.y + g.H * 0.2} s={g.s} at={rite + 14} color="#ff8a6a" />
        <Hall x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 30 * g.s} w={g.W * 0.6} s={g.s} glow={1} />
        <Parasol x={g.x + g.W * 0.24 + pan * 0.6} y={g.ground} s={g.s} />
        <Parasol x={g.x + g.W * 0.76 + pan * 0.6} y={g.ground} s={g.s} />
        <BackFigure x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 30 * g.s} scale={g.sc * 0.36} />
        <rect x={g.x - 40 * g.s} y={g.ground - 4 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#3a2414" />
        {[0, 1, 2, 3, 4, 5].map((i) => <Noble key={i} x={g.x + g.W * (0.04 + i * 0.18) + pan * 1.5} y={g.ground + 28 * g.s} scale={g.sc * 0.7} mode="prostrate" jacket={i % 2 ? "#efe6d0" : "#d9c08a"} phase={i} />)}
      </g>
    )}
  </V2>
);

// Late night at the writing desk: a lamp, papers, a figure from behind at work.
const DeskScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.palace} start={start} end={end} sky={["#10121e", "#2a2430"]} accent={GOLD} warm={0.1}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1e1a20" />
        <rect x={g.x + g.W * 0.62 + pan * 0.2} y={g.y + g.H * 0.08} width={g.W * 0.24} height={g.H * 0.4} fill="#2a3a5a" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <circle cx={g.x + g.W * 0.78 + pan * 0.2} cy={g.y + g.H * 0.2} r={16 * g.s} fill="#f4f6ff" opacity={0.8} />
        <BackFigure x={g.x + g.W * 0.4 + pan * 0.6} y={g.ground - 10 * g.s} scale={g.sc * 0.5} robe="#efe6d0" crown={false} />
        <rect x={g.x + g.W * 0.48 + pan * 0.8} y={g.ground - 60 * g.s} width={g.W * 0.36} height={14 * g.s} fill="#5a3a20" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
        <Manuscript x={g.x + g.W * 0.52 + pan * 0.8} y={g.ground - 62 * g.s} w={120 * g.s} s={g.s} lines={4} dark={false} />
        <Lamp x={g.x + g.W * 0.78 + pan * 0.8} y={g.ground - 60 * g.s} s={g.s} />
        <rect x={g.x - 40 * g.s + pan * 1.6} y={g.ground + 20 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#120e10" />
      </g>
    )}
  </V2>
);

// "Approximate" note for the colour areas.
export const Approx = ({ from, to }: { from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const k = interpolate(frame, [from, from + 12, to - 12, to], [0, 1, 1, 0], clamp);
  if (k <= 0) return null;
  return <div style={{ position: "absolute", left: 50 * s, top: height * 0.515, opacity: k * 0.85, fontFamily: font, fontSize: 22 * s, color: "#fff", background: "rgba(8,14,26,0.7)", padding: `${2 * s}px ${12 * s}px`, borderRadius: 8 * s }}>สีบนแผนที่ = แนวโดยประมาณ</div>;
};

export const e5c1: Chapter5 = {
  name: "กษัตริย์ 15 พรรษา",
  from: T.start,
  to: END,
  cams: (w, h) => hold([
    { frame: T.start, cam: view(VW.wako, w, h, 0.9, 0.08) },
    { frame: T.fever + 30, cam: view(VW.wako, w, h, 0.92, 0.08) },
    { frame: T.son, cam: view(VW.bkkGulf, w, h, 0.9, 0.08) },
    { frame: T.young, cam: view(VW.siam, w, h, 0.85, 0.08) },
    { frame: T.bowring, cam: view(VW.bkkGulf, w, h, 0.9, 0.08) },
    { frame: T.others, cam: view(VW.bkkGulf, w, h, 0.95, 0.08) },
    { frame: T.travel, cam: view(VW.asiaRoute, w, h, 0.85, 0.1) },
    { frame: T.india + 20, cam: view(VW.asiaRoute, w, h, 0.88, 0.1) },
    { frame: T.crowned, cam: view(VW.siam, w, h, 0.85, 0.08) },
  ]),
  years: [[T.start, "2411"], [T.travel, "2414–2415"], [T.crowned, "2416"]],
  heads: [
    { f: T.start, tag: "พ.ศ. 2411", head: "สุริยุปราคาที่หว้ากอ", color: GOLD },
    { f: T.fever, tag: "ไข้ป่า", head: "รัชกาลที่ 4 เสด็จสวรรคต", color: RED },
    { f: T.young, tag: "ขึ้นครองราชย์", head: "พระชนมายุเพียง", stat: "15", label: "พรรษา", color: GOLD, portrait: "rama5_young", photo: "ภาพถ่าย" },
    { f: T.regent, tag: "ผู้สำเร็จราชการ", head: "ศรีสุริยวงศ์ (ช่วง บุนนาค)", stat: "ราว 5 ปี", color: GOLD, portrait: "suriyawong", photo: "ภาพถ่าย" },
    { f: T.bowring, tag: "พ.ศ. 2398", head: "สนธิสัญญาเบาว์ริง", color: BRIT_C },
    { f: T.unequal, tag: "ภาษีนำเข้า", head: "เก็บได้ไม่เกิน", stat: "3%", color: RED },
    { f: T.others, tag: "ชาติตะวันตกอื่น ๆ", head: "ขอสิทธิแบบเดียวกัน", color: RED },
    { f: T.travel, tag: "เสด็จต่างประเทศ", head: "ดูการปกครองอาณานิคม", color: GOLD, chips: [{ text: "สิงคโปร์", f: T.sing }, { text: "ชวา", f: T.java }, { text: "อินเดีย", f: T.india }] },
    { f: T.crowned, tag: "พ.ศ. 2416", head: "บรมราชาภิเษกอีกครั้ง", stat: "20", label: "พรรษา", color: GOLD },
    { f: T.rule, tag: "พ.ศ. 2416", head: "ทรงบริหารแผ่นดินเอง", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const k = ramp(frame, T.start - 15, 15, END + 15) * 0.55;
    const siam = ramp(frame, T.start - 15, 15, END + 15);
    return (
      <>
        <Empire areas={[["thai", SIAM_C, siam * 0.6], ["lowerBurma", BRIT_C, k], ["cambodia", FR_C, k], ["bsr", SIAM_C, k], ["cochin", FR_C, k]]} />
        <CityDot at={PL.wako} color={GOLD} r={14} start={T.wako - 6} end={T.son} />
        {frame < T.young && <PointLabel at={PL.wako} text="หว้ากอ" start={T.wako} color={GOLD} size={0.85} />}
        <Arrow points={R.wakoBack} start={T.son} end={T.son + 40} color={GOLD} width={10} variant="dashed" opacity={interpolate(frame, [T.young, T.young + 15], [1, 0], clamp)} />
        <CityDot at={PL.bkk} color={GOLD} r={14} start={T.son} />
        <MapFlag at={[100.62, 13.52]} color={BRIT_C} start={T.uk} end={T.travel} />
        <MapFlag at={[100.75, 13.6]} color={FR_C} start={T.ask} end={T.travel} />
        <MapFlag at={[100.4, 13.55]} color="#3a6ac8" start={T.ask + 10} end={T.travel} size={0.85} />
        <MapFlag at={[100.85, 13.45]} color="#e8e8e8" start={T.ask + 20} end={T.travel} size={0.85} />
        <Arrow points={R.travel1871} start={T.sing - 20} end={T.java} color={GOLD} width={9} />
        <Arrow points={R.travel1872} start={T.india - 20} end={T.india + 20} color={GOLD} width={9} />
        <CityDot at={PL.singapore} color={BRIT_C} r={12} start={T.sing} end={T.crowned} />
        <CityDot at={PL.batavia} color="#e8a030" r={12} start={T.java} end={T.crowned} />
        <CityDot at={PL.calcutta} color={BRIT_C} r={12} start={T.india} end={T.crowned} />
        <PointLabel at={PL.singapore} text="สิงคโปร์" start={T.sing} color={BRIT_C} size={0.8} />
        <PointLabel at={PL.batavia} text="ชวา" start={T.java} color="#e8a030" size={0.8} />
        <PointLabel at={PL.calcutta} text="อินเดีย" start={T.india} color={BRIT_C} size={0.8} />
      </>
    );
  },
  Panels: () => (
    <>
      <WakoCampScene id="e5c1wako" start={T.start} end={T.total + 14} />
      <TotalityScene id="e5c1total" start={T.total} end={T.fever + 14} />
      <FeverScene id="e5c1fever" start={T.fever} end={T.died + 14} />
      <MourningScene id="e5c1mourn" start={T.died} end={T.son + 14} />
      <BargeHomeScene id="e5c1barge" start={T.son} end={T.young + 14} />
      <YoungThroneScene id="e5c1throne" start={T.young} end={T.regent + 14} />
      <RegentCouncilScene id="e5c1council" start={T.regent} end={T.bunnag + 14} />
      <BunnagRiverScene id="e5c1bunnag" start={T.bunnag} end={T.bowring + 14} />
      <TreatyScene id="e5c1treaty" start={T.bowring} end={T.unequal + 14} stamp={STAMP} />
      <CustomsScene id="e5c1customs" start={T.unequal} end={T.court + 14} three={T.three} />
      <RoadsteadScene id="e5c1road" start={T.ask} end={T.travel + 14} />
      <SingaporeScene id="e5c1sing" start={T.travel} end={T.colony + 14} />
      <ColonyStreetScene id="e5c1street" start={T.colony} end={T.crowned + 14} />
      <CoronationScene id="e5c1crown" start={T.crowned} end={T.rule + 14} rite={T.rite} />
      <DeskScene id="e5c1desk" start={T.rule} end={END + 14} />
    </>
  ),
  Screen: () => (
    <>
      <Compare start={T.court} end={T.ask + 14} title="คดีของคนในบังคับอังกฤษ" left={{ tag: "ไม่ต้องขึ้น", text: "ศาลไทย", color: SIAM_C, f: T.court, icon: "thai" }} right={{ tag: "ขึ้นศาล", text: "กงสุลอังกฤษ", color: BRIT_C, f: T.court + 15, icon: "book" }} />
      <Approx from={T.young} to={T.bowring} />
      <Approx from={T.travel} to={T.crowned} />
    </>
  ),
  sfx: [
    [T.fifteen, SFX.pop, 0.3],
    [T.five, SFX.pop, 0.3],
    [T.three, SFX.hit, 0.35],
    [T.court, SFX.whoosh, 0.25],
    [T.travel, SFX.whoosh, 0.3],
    [T.sing, SFX.pop, 0.25],
    [T.java, SFX.pop, 0.25],
    [T.india, SFX.pop, 0.25],
  ],
  Audio: () => (
    <>
      <Bed id="sea_rough" from={T.start} to={T.fever + 10} volume={0.18} voice={VOICE} />
      <Hit id="gong" at={T.total + 20} volume={0.45} />
      <Bed id="jungle_rain" from={T.fever} to={T.died + 14} volume={0.25} voice={VOICE} />
      <Hit id="gong" at={T.died + 4} volume={0.35} />
      <Bed id="ship_creak" from={T.son} to={T.young + 14} volume={0.22} voice={VOICE} />
      <Bed id="wind" from={T.young} to={T.bowring} volume={0.12} voice={VOICE} />
      <Hit id="wood_hit" at={STAMP} volume={0.55} />
      <Bed id="city_crowd" from={T.unequal} to={T.ask + 10} volume={0.15} voice={VOICE} />
      <Hit id="ship_bell" at={T.ask + 6} volume={0.4} />
      <Bed id="ship_sailing" from={T.ask} to={T.colony + 10} volume={0.2} voice={VOICE} />
      <Bed id="army_marching" from={T.colony} to={T.crowned + 10} volume={0.25} voice={VOICE} />
      <Hit id="gong" at={T.rite} volume={0.5} />
      <Hit id="explosion_far" at={T.rite} volume={0.25} />
      <Hit id="explosion_far" at={T.rite + 14} volume={0.2} />
      <Bed id="crowd_cheer" from={T.rite} to={T.rule + 10} volume={0.15} voice={VOICE} />
      <Bed id="rain_light" from={T.rule} to={END + 14} volume={0.15} voice={VOICE} />
    </>
  ),
};
