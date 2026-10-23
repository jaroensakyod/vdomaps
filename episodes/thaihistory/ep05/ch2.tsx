import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { Fighter, Glow, Grass, Shot } from "../../../components/Scene";
import type { Cam } from "../../../components/camera";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { Backdrop, C, PAL, Prang, River, Smoke, Tree, V2 } from "../ep04/v2";
import { Cannon, muzzle } from "../ep04/ch1_kit";
import { Birds } from "../ep04/ch3_kit";
import { B, BRIT_C, CityDot, Empire, FR_C, ramp, SIAM_C, VOICE, wp, type AreaId, type Chapter5 } from "./beatsKit";
import { Slot } from "./cards";
import { Approx } from "./ch1";
import { Hourglass, Pyatthat, Stupa } from "./ch1_kit5";
import { C5, Colonnade, Gunboat, MapTable, PanelFlag, Sea } from "./kit5";
import { Bed, Hit, SFX } from "./mix";
import { PL, R, VW } from "./places";

// Chapter 2 (west → race): Britain takes Burma and Malaya, France takes Cochinchina, Cambodia and Vietnam.
const T = {
  start: B.west.start,
  brit: wp("west", "อังกฤษ", 0.35),
  lower: wp("west", "ล่าง", 0.45),
  mandalay: B.mandalay.start,
  army: wp("mandalay", "ทัพ", 0.2),
  city: wp("mandalay", "มัณฑ", 0.45),
  thibaw: wp("mandalay", "เนรเทศ", 0.55),
  dynasty: wp("mandalay", "ราชวงศ์", 0.65),
  malaya: B.malaya.start,
  control: wp("malaya", "ควบคุม", 0.5),
  east: B.east.start,
  fr: wp("east", "ฝรั่งเศส", 0.3),
  saigon: wp("east", "ไซ่ง่อน", 0.5),
  cambodia: B.cambodia.start,
  khmer: wp("cambodia", "กัมพูชา", 0.3),
  protect: wp("cambodia", "อารักขา", 0.8),
  tonkin: B.tonkin.start,
  viet: wp("tonkin", "เวียดนาม", 0.35),
  indo: wp("tonkin", "อิน", 0.6),
  squeeze: B.squeeze.start,
  left: wp("squeeze", "เหลือ", 0.6),
  excuse: B.excuse.start,
  notyet: wp("excuse", "ไม่ทัน", 0.7),
  race: B.race.start,
  first: wp("race", "แรก", 0.3),
};
// Hold each view until ~24 frames before the next move, so the camera moves on the cue, not across a whole beat.
const hold = (keys: { frame: number; cam: Cam }[]) => keys.flatMap((k, i) => (i && keys[i - 1].frame < k.frame - 24 ? [{ frame: k.frame - 24, cam: keys[i - 1].cam }, k] : [k]));
const END = B.slaves.start;
const SAIGON_SHOTS = [T.saigon - 6, T.saigon + 18, T.saigon + 44];

// ---------------- panels ----------------

// Rangoon river: British gunboats anchored below the golden stupa.
const RangoonScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.rangoon} start={start} end={end} sky={["#7a9ac0", "#f0d0a0"]} accent={BRIT_C} warm={0.1}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.3]} far="#7a8a8a" mid="#4a5a3a" ground="#4a4030" mist="#fff0d0" />
        <Stupa x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground - 40 * g.s} s={g.s} h={190} />
        <Tree x={g.x + g.W * 0.52 + pan * 0.5} y={g.ground - 40 * g.s} s={g.s} kind="palm" />
        <River g={g} y={g.ground - 40 * g.s} pan={pan} color="#5a6a5a" />
        <Gunboat x={g.x + g.W * 0.22 + pan * 0.7} y={g.ground - 6 * g.s} s={g.s * 0.6} flag="uk" />
        <Gunboat x={g.x + g.W * 0.5 + pan * 1.0} y={g.ground + 22 * g.s} s={g.s * 0.5} flag="uk" smoke={false} />
      </g>
    )}
  </V2>
);

// Steamers carry red-coated troops up the Irrawaddy.
const IrrawaddyScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.mandalay} start={start} end={end} sky={["#8aa0b8", "#e8d8b0"]} accent={BRIT_C} warm={0.08}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.25]} far="#8a8a7a" mid="#6a6a48" ground="#7a6a48" mist="#fff4d8" />
        <River g={g} y={g.ground - 40 * g.s} pan={pan} color="#7a7a5a" />
        {[0, 1].map((i) => (
          <g key={i}>
            <Gunboat x={g.x + g.W * (0.1 + i * 0.42) + lt * 0.8 * g.s + pan * 0.7} y={g.ground - 4 * g.s + i * 18 * g.s} s={g.s * (0.5 + i * 0.06)} flag="uk" />
            {[0, 1, 2].map((j) => <Fighter key={j} x={g.x + g.W * (0.07 + i * 0.42 + j * 0.035) + lt * 0.8 * g.s + pan * 0.7} y={g.ground - 30 * g.s + i * 18 * g.s} scale={g.sc * 0.3} mode="stand" weapon="rifle" costume={C5.british} phase={j} />)}
          </g>
        ))}
        <Grass g={g} shift={pan * 1.6} color="#4a4a2a" />
      </g>
    )}
  </V2>
);

// British soldiers line up before the tiered roofs of Mandalay palace.
const MandalayScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.mandalay} start={start} end={end} sky={["#c88a5a", "#f4d8a0"]} accent={BRIT_C} warm={0.12}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.15, 0.3]} far="#9a7a6a" mid="#6a5a4a" ground="#8a6a44" mist="#ffe8c0" ridges={false} />
        <rect x={g.x - 40 * g.s + pan * 0.4} y={g.ground - 70 * g.s} width={g.W + 80 * g.s} height={56 * g.s} fill="#a8322a" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <Pyatthat x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 70 * g.s} s={g.s * 0.75} w={220} />
        <PanelFlag x={g.x + g.W * 0.2 + pan * 0.6} y={g.ground - 20 * g.s} s={g.s} kind="uk" h={110} />
        {[0, 1, 2, 3, 4, 5].map((i) => <Fighter key={i} x={g.x + g.W * (0.08 + i * 0.15) + pan * 1.0} y={g.ground + 10 * g.s} scale={g.sc * 0.66} mode="stand" weapon="rifle" costume={C5.british} phase={i * 0.6} />)}
        <Grass g={g} shift={pan * 1.6} color="#5a4a28" />
      </g>
    )}
  </V2>
);

// The last Burmese king leaves by boat at dusk; his parasol lowered, people watch from the bank.
const ExileScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.mandalay} start={start} end={end} sky={["#2a1a30", "#c8603a"]} accent={RED} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.7, 0.42]} lightColor={["#ff7a3a", "#ffd0a0"]} far="#4a3a4a" mid="#3a2a2a" ground="#2a2018" mist="#e09070" />
        <Pyatthat x={g.x + g.W * 0.18 + pan * 0.3} y={g.ground - 40 * g.s} s={g.s * 0.5} w={200} />
        <River g={g} y={g.ground - 40 * g.s} pan={pan} color="#4a3a4a" />
        <Gunboat x={g.x + g.W * (0.5 + lt * 0.0018) + pan * 0.7} y={g.ground - 4 * g.s} s={g.s * 0.6} flag="uk" />
        <Birds g={g} lt={lt} />
        {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + g.W * (0.06 + i * 0.09) + pan * 1.4} y={g.ground + 30 * g.s} scale={g.sc * 0.74} mode="stand" weapon="none" costume={C5.burma} phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#1a1410" />
      </g>
    )}
  </V2>
);

// Malaya: a British resident's house above a tin-mining river, a gunboat at the jetty.
const MalayaScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.penang} start={start} end={end} sky={["#6aa0b8", "#e8e0b0"]} accent={BRIT_C} warm={0.08}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.2]} far="#5a7a6a" mid="#3a5a3a" ground="#5a4a30" mist="#f0f4d8" />
        <Colonnade x={g.x + g.W * 0.66 + pan * 0.5} y={g.ground - 40 * g.s} w={g.W * 0.26} s={g.s * 0.75} cols={4} />
        <PanelFlag x={g.x + g.W * 0.84 + pan * 0.5} y={g.ground - 40 * g.s} s={g.s} kind="uk" h={110} />
        {[0.08, 0.22, 0.42].map((f) => <Tree key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 40 * g.s} s={g.s} kind="palm" />)}
        <River g={g} y={g.ground - 36 * g.s} pan={pan} color="#7a6a4a" />
        <Gunboat x={g.x + g.W * 0.35 + pan * 0.7} y={g.ground - 2 * g.s} s={g.s * 0.55} flag="uk" />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.7 + i * 0.1) - Math.min(lt, 100) * 0.4 * g.s + pan * 1.2} y={g.ground + 24 * g.s} scale={g.sc * 0.7} mode="walk" weapon="none" costume={C5.villager} flip phase={i} />)}
      </g>
    )}
  </V2>
);

// Saigon: French gunboats shell a riverside fort; cannon answer, smoke rolls.
const SaigonScene = ({ id, start, end, hits }: { id: string; start: number; end: number; hits: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.saigon} start={start} end={end} sky={["#5a6a7a", "#e8b080"]} accent={FR_C} hits={hits} warm={0.1}>
      {(g, pan) => {
        const fort = g.x + g.W * 0.2 + pan * 0.5;
        const [mx, my] = muzzle(fort + 30 * g.s, g.ground - 50 * g.s, g.s * 0.7);
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.8, 0.3]} far="#6a6a6a" mid="#4a5a3a" ground="#5a4a30" mist="#f0c8a0" />
            <rect x={fort - 60 * g.s} y={g.ground - 70 * g.s} width={180 * g.s} height={56 * g.s} fill="#8a7a5a" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <Cannon x={fort + 30 * g.s} y={g.ground - 50 * g.s} s={g.s * 0.7} fire={hits.slice(1)} />
            <River g={g} y={g.ground - 30 * g.s} pan={pan} color="#5a6a6a" />
            <Gunboat x={g.x + g.W * 0.72 + pan * 0.7} y={g.ground + 4 * g.s} s={g.s * 0.62} flag="fr" dir={-1} fire={hits} />
            {hits.map((h) => (frame >= h - 16 && frame < h + 20 ? <Shot key={h} from={[g.x + g.W * 0.6, g.ground - 30 * g.s]} to={[fort + 40 * g.s, g.ground - 70 * g.s]} t={frame - h + 16} s={g.s} /> : null))}
            <Smoke x={fort} y={g.ground - 90 * g.s} s={g.s} dark />
            {frame > hits[1] && <Shot from={[mx, my]} to={[g.x + g.W * 0.7, g.ground]} t={frame - hits[1]} s={g.s} />}
          </g>
        );
      }}
    </V2>
  );
};

// Oudong: the Khmer royal court; a French tricolour rises beside the palace.
const OudongScene = ({ id, start, end, raise }: { id: string; start: number; end: number; raise: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.oudong} start={start} end={end} sky={["#7a8ab0", "#f0d0a0"]} accent={FR_C} warm={0.1}>
      {(g, pan) => {
        const up = interpolate(frame, [raise - 20, raise + 20], [0, 1], clamp);
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.2, 0.25]} far="#7a7a8a" mid="#4a5a3a" ground="#6a5236" mist="#fff0d0" />
            <Prang x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 40 * g.s} h={170 * g.s} s={g.s} gold />
            <Prang x={g.x + g.W * 0.35 + pan * 0.5} y={g.ground - 40 * g.s} h={110 * g.s} s={g.s} />
            <Prang x={g.x + g.W * 0.65 + pan * 0.5} y={g.ground - 40 * g.s} h={110 * g.s} s={g.s} />
            <g transform={`translate(0,${(1 - up) * 80 * g.s})`}>
              <PanelFlag x={g.x + g.W * 0.84 + pan * 0.6} y={g.ground - 20 * g.s} s={g.s} kind="fr" h={130} />
            </g>
            <Fighter x={g.x + g.W * 0.9 + pan * 1.0} y={g.ground + 6 * g.s} scale={g.sc * 0.66} mode="stand" weapon="rifle" costume={C5.french} flip />
            {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.08 + i * 0.1) + pan * 1.4} y={g.ground + 24 * g.s} scale={g.sc * 0.72} mode="stand" weapon="none" costume={C.khmer} phase={i} />)}
            <Grass g={g} shift={pan * 1.6} />
          </g>
        );
      }}
    </V2>
  );
};

// French troops march on the gate of a Vietnamese citadel.
const CitadelScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.hanoi} start={start} end={end} sky={["#6a7a8a", "#d8c0a0"]} accent={FR_C} warm={0.08}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.3]} far="#6a7a7a" mid="#4a5a4a" ground="#5a5038" mist="#e8e0c8" />
        <rect x={g.x + g.W * 0.45 + pan * 0.5} y={g.ground - 120 * g.s} width={g.W * 0.5} height={106 * g.s} fill="#8a8070" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <path d={`M${g.x + g.W * 0.62 + pan * 0.5} ${g.ground - 14 * g.s} v${-60 * g.s} q${30 * g.s} ${-26 * g.s} ${60 * g.s} 0 v${60 * g.s} Z`} fill="#2a2420" />
        <path d={`M${g.x + g.W * 0.55 + pan * 0.5} ${g.ground - 120 * g.s} L${g.x + g.W * 0.65 + pan * 0.5} ${g.ground - 160 * g.s} L${g.x + g.W * 0.75 + pan * 0.5} ${g.ground - 160 * g.s} L${g.x + g.W * 0.85 + pan * 0.5} ${g.ground - 120 * g.s} Z`} fill="#a8322a" stroke={PAL.ink} strokeWidth={2 * g.s} />
        {[0, 1, 2, 3, 4].map((i) => <Fighter key={i} x={g.x + g.W * (0.02 + i * 0.08) + lt * 0.7 * g.s + pan * 0.9} y={g.ground + 8 * g.s} scale={g.sc * 0.62} mode="walk" weapon="rifle" costume={C5.french} phase={i * 0.8} />)}
        <PanelFlag x={g.x + g.W * 0.06 + lt * 0.7 * g.s + pan * 0.9} y={g.ground - 30 * g.s} s={g.s} kind="fr" h={70} />
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// Indochina proclaimed: a tricolour over a colonial building at sunset, a bugler.
const IndochinaScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.hue} start={start} end={end} sky={["#2a2a4a", "#e08a5a"]} accent={FR_C} warm={0.12}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.42]} lightColor={["#ff9a5a", "#ffe0b0"]} far="#4a4a5a" mid="#3a3a3a" ground="#3a3024" mist="#f0a080" />
        <Colonnade x={g.x + g.W * 0.55 + pan * 0.5} y={g.ground - 20 * g.s} w={g.W * 0.5} s={g.s} cols={7} wall="#e8dcc0" roof="#5a6a8a" />
        <PanelFlag x={g.x + g.W * 0.55 + pan * 0.5} y={g.ground - 196 * g.s} s={g.s} kind="fr" h={50} w={56} />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.12 + i * 0.12) + pan * 1.2} y={g.ground + 20 * g.s} scale={g.sc * 0.72} mode="stand" weapon="rifle" costume={C5.french} phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#1e1a12" />
      </g>
    )}
  </V2>
);

// Squeeze: a lone Siamese sentry on a hill, red storm to the west, blue storm to the east.
const SentryScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#2a2030", "#5a4a5a"]} accent={GOLD} warm={0.06}>
      {(g, pan, lt) => {
        const close = interpolate(lt, [0, end - start], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x - 20 * g.s} y={g.y} width={g.W * (0.3 + close * 0.12)} height={g.H} fill="#b0262a" opacity={0.45} />
            <rect x={g.x + g.W * (0.7 - close * 0.12)} y={g.y} width={g.W * 0.32} height={g.H} fill="#2a4aa8" opacity={0.45} />
            <Glow x={g.x + g.W * 0.5 + pan * 0.1} y={g.y + g.H * 0.3} s={g.s} color="#ffd25a" core="#fff0c0" />
            <path d={`M${g.x - 40 * g.s} ${g.ground} Q${g.x + g.W * 0.5} ${g.ground - 120 * g.s} ${g.x + g.W + 40 * g.s} ${g.ground} Z`} fill="#3a3a2a" transform={`translate(${pan * 0.5},0)`} />
            <PanelFlag x={g.x + g.W * 0.56 + pan * 0.5} y={g.ground - 84 * g.s} s={g.s} kind="siam" h={110} w={54} />
            <Fighter x={g.x + g.W * 0.48 + pan * 0.5} y={g.ground - 82 * g.s} scale={g.sc * 0.6} mode="stand" weapon="rifle" costume={C5.siamArmy} />
            <rect x={g.x - 40 * g.s} y={g.ground - 2 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#24241a" />
            <Grass g={g} shift={pan * 1.6} color="#14140e" />
            <circle cx={g.x + g.W * 0.5} cy={g.y + g.H * 0.3} r={4 * g.s + Math.sin(frame * 0.1) * g.s} fill="#fff" opacity={0.3} />
          </g>
        );
      }}
    </V2>
  );
};

// Officers bent over a map table: red and blue areas, Siam in the middle.
const MapRoomScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#2a2018", "#5a4030"]} accent={RED} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3a2a1e" />
        <rect x={g.x + g.W * 0.1 + pan * 0.2} y={g.y + g.H * 0.06} width={g.W * 0.3} height={g.H * 0.38} fill="#4a3624" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
        <rect x={g.x + g.W * 0.6 + pan * 0.2} y={g.y + g.H * 0.06} width={g.W * 0.3} height={g.H * 0.38} fill="#4a3624" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
        <Glow x={g.x + g.W * 0.5 + pan * 0.2} y={g.y + g.H * 0.2} s={g.s * 0.8} color="#ffd890" core="#fff0c8" />
        <MapTable x={g.x + g.W * 0.5 + pan * 0.7} y={g.ground - 10 * g.s} w={g.W * 0.5} s={g.s} />
        <Fighter x={g.x + g.W * 0.2 + pan * 0.8} y={g.ground + 6 * g.s} scale={g.sc * 0.72} mode="aim" weapon="none" costume={C5.british} />
        <Fighter x={g.x + g.W * 0.8 + pan * 0.8} y={g.ground + 6 * g.s} scale={g.sc * 0.72} mode="aim" weapon="none" costume={C5.french} flip />
        <rect x={g.x - 40 * g.s + pan * 1.6} y={g.ground + 40 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#1e140e" />
      </g>
    )}
  </V2>
);

// Race against time: an hourglass over the gold of Siam, sand running.
const HourglassScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#1a1428", "#4a3a2a"]} accent={GOLD} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <Glow x={g.x + g.W * 0.5 + pan * 0.1} y={g.y + g.H * 0.45} s={g.s * 1.4} color="#ffc94a" core="#fff0c0" />
        <rect x={g.x - 40 * g.s + pan * 0.4} y={g.ground - 10 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#3a2a1a" />
        <Hourglass x={g.x + g.W * 0.5 + pan * 0.6} y={g.y + g.H * 0.45} s={g.s * 1.2} k={interpolate(lt, [0, end - start], [0.15, 0.6], clamp)} />
        <rect x={g.x - 40 * g.s + pan * 1.6} y={g.ground + 34 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#1a120a" />
      </g>
    )}
  </V2>
);

// The excuse quote card (panel slot).
const QuoteCard = ({ start, end }: { start: number; end: number }) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  return (
    <Slot start={start} end={end} color={RED} title="ข้ออ้างของจักรวรรดิ">
      {(lt) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", fontFamily: font }}>
          <div style={{ fontSize: 76 * s, fontWeight: 900, color: "#fff", transform: `scale(${interpolate(lt, [0, 10], [1.3, 1], clamp)})` }}>“ยังไม่ทันสมัย”</div>
          <div style={{ fontSize: 44 * s, fontWeight: 900, color: "#ff6b5f", opacity: interpolate(lt, [20, 32], [0, 1], clamp) }}>“ปกครองตัวเองไม่ได้”</div>
        </div>
      )}
    </Slot>
  );
};

const LeftOne = ({ from, to }: { from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const k = interpolate(frame, [from, from + 10, to - 10, to], [0, 1, 1, 0], clamp);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", right: 60 * s, top: height * 0.31, opacity: k, transform: `scale(${0.8 + 0.2 * k})`, fontFamily: font, color: "#fff", textAlign: "center", background: "rgba(8,14,26,0.86)", borderRadius: 16 * s, padding: `${10 * s}px ${26 * s}px`, borderTop: `${6 * s}px solid ${GOLD}` }}>
      <div style={{ fontSize: 26 * s, fontWeight: 700 }}>ประเทศเอกราช</div>
      <div style={{ fontSize: 96 * s, fontWeight: 900, color: GOLD, lineHeight: 1.1 }}>เหลือ 1</div>
    </div>
  );
};

export const e5c2: Chapter5 = {
  name: "วงล้อม",
  from: T.start,
  to: END,
  cams: (w, h) => hold([
    { frame: T.start, cam: view(VW.lowerBurma, w, h, 0.9, 0.08) },
    { frame: T.mandalay, cam: view(VW.burma, w, h, 0.88, 0.08) },
    { frame: T.malaya, cam: view(VW.malaya, w, h, 0.9, 0.08) },
    { frame: T.east, cam: view(VW.cochin, w, h, 0.9, 0.08) },
    { frame: T.cambodia, cam: view(VW.cambodia, w, h, 0.9, 0.08) },
    { frame: T.tonkin, cam: view(VW.indochina, w, h, 0.88, 0.08) },
    { frame: T.squeeze, cam: view(VW.hook, w, h, 0.88, 0.1) },
    { frame: T.race, cam: view(VW.siam, w, h, 0.85, 0.08) },
  ]),
  years: [[T.start, "2395"], [T.mandalay, "2428"], [T.malaya, "2417–2439"], [T.east, "2405"], [T.cambodia, "2406"], [T.tonkin, "2430"]],
  heads: [
    { f: T.start, tag: "อังกฤษ", head: "ยึดพม่าตอนล่าง", stat: "2395", color: BRIT_C },
    { f: T.mandalay, tag: "พ.ศ. 2428", head: "ทัพอังกฤษถึงมัณฑะเลย์", color: BRIT_C },
    { f: T.thibaw, tag: "พระเจ้าธีบอถูกเนรเทศ", head: "ราชวงศ์พม่าสิ้นสุด", color: RED },
    { f: T.malaya, tag: "อังกฤษ", head: "คุมรัฐมลายูทีละรัฐ", color: BRIT_C },
    { f: T.east, tag: "ฝรั่งเศส", head: "ยึดไซ่ง่อน · โคชินไชน่า", color: FR_C },
    { f: T.cambodia, tag: "พ.ศ. 2406", head: "กัมพูชาอยู่ใต้อารักขาฝรั่งเศส", color: FR_C },
    { f: T.tonkin, tag: "ฝรั่งเศส", head: "ยึดเวียดนามทั้งประเทศ", color: FR_C },
    { f: T.indo, tag: "พ.ศ. 2430", head: "อินโดจีนฝรั่งเศส", color: FR_C },
    { f: T.squeeze, tag: "สยาม", head: "ถูกขนาบทั้งสองข้าง", color: GOLD, chips: [{ text: "อังกฤษ", f: T.squeeze + 20 }, { text: "ฝรั่งเศส", f: T.squeeze + 34 }] },
    { f: T.excuse, tag: "ข้ออ้างที่ใช้ทุกที่", head: "“บ้านเมืองยังไม่ทันสมัย”", color: RED },
    { f: T.race, tag: "ทางรอดข้อแรก", head: "① ทันสมัยให้ทัน", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const fade = ramp(frame, T.start - 15, 15, END + 15);
    const areas: [AreaId, string, number][] = [
      ["thai", SIAM_C, fade * 0.7],
      ["lowerBurma", BRIT_C, fade * ramp(frame, T.lower - 8, 16)],
      ["burma", BRIT_C, fade * ramp(frame, T.city - 6, 18)],
      ["malayaSouth", BRIT_C, fade * ramp(frame, T.control - 6, 40)],
      ["cochin", FR_C, fade * ramp(frame, T.saigon - 6, 16)],
      ["cambodia", SIAM_C, fade * ramp(frame, T.khmer - 10, 14) * (1 - ramp(frame, T.protect - 4, 16))],
      ["cambodia", FR_C, fade * ramp(frame, T.protect - 4, 16)],
      ["bsr", SIAM_C, fade * ramp(frame, T.protect + 10, 16)],
      ["vietnam", FR_C, fade * ramp(frame, T.viet - 6, 18)],
      ["laos", SIAM_C, fade * ramp(frame, T.squeeze, 16) * 0.5],
    ];
    return (
      <>
        <Empire areas={areas} />
        <CityDot at={PL.rangoon} color={BRIT_C} r={12} start={T.brit} end={T.malaya} />
        <PointLabel at={PL.rangoon} text="ย่างกุ้ง" start={T.brit + 6} color={BRIT_C} size={0.8} />
        <Arrow points={R.irrawaddy} start={T.army} end={T.city} color={BRIT_C} width={11} opacity={interpolate(frame, [T.malaya, T.malaya + 15], [1, 0], clamp)} />
        <CityDot at={PL.mandalay} color={BRIT_C} r={13} start={T.city} end={T.malaya} />
        <PointLabel at={PL.mandalay} text="มัณฑะเลย์" start={T.city} color={BRIT_C} size={0.85} />
        <CityDot at={PL.penang} color={BRIT_C} r={11} start={T.malaya} end={T.east} />
        <CityDot at={PL.singapore} color={BRIT_C} r={11} start={T.malaya + 10} end={T.east} />
        <PointLabel at={PL.penang} text="ปีนัง" start={T.malaya + 6} color={BRIT_C} size={0.75} />
        <PointLabel at={PL.singapore} text="สิงคโปร์" start={T.malaya + 14} color={BRIT_C} size={0.75} />
        <CityDot at={PL.saigon} color={FR_C} r={12} start={T.saigon} end={T.tonkin} />
        <PointLabel at={PL.saigon} text="ไซ่ง่อน" start={T.saigon} color={FR_C} size={0.8} />
        <CityDot at={PL.oudong} color={FR_C} r={12} start={T.khmer} end={T.tonkin} />
        <PointLabel at={PL.oudong} text="อุดงค์" start={T.khmer} color={FR_C} size={0.8} />
        <CityDot at={PL.hanoi} color={FR_C} r={12} start={T.viet} end={T.squeeze} />
        <PointLabel at={PL.hanoi} text="ฮานอย" start={T.viet} color={FR_C} size={0.8} />
        <CityDot at={PL.bkk} color={GOLD} r={15} start={T.squeeze} />
      </>
    );
  },
  Panels: () => (
    <>
      <RangoonScene id="e5c2rangoon" start={T.start} end={T.mandalay + 14} />
      <IrrawaddyScene id="e5c2irra" start={T.mandalay} end={T.city + 14} />
      <MandalayScene id="e5c2mandalay" start={T.city} end={T.dynasty + 14} />
      <ExileScene id="e5c2exile" start={T.dynasty} end={T.malaya + 14} />
      <MalayaScene id="e5c2malaya" start={T.malaya} end={T.east + 14} />
      <SaigonScene id="e5c2saigon" start={T.east} end={T.cambodia + 14} hits={SAIGON_SHOTS} />
      <OudongScene id="e5c2oudong" start={T.cambodia} end={T.tonkin + 14} raise={T.protect} />
      <CitadelScene id="e5c2citadel" start={T.tonkin} end={T.indo + 14} />
      <IndochinaScene id="e5c2indo" start={T.indo} end={T.squeeze + 14} />
      <SentryScene id="e5c2sentry" start={T.squeeze} end={T.excuse + 14} />
      <MapRoomScene id="e5c2maproom" start={T.excuse} end={T.notyet + 14} />
      <HourglassScene id="e5c2hourglass" start={T.race} end={END + 14} />
    </>
  ),
  Screen: () => (
    <>
      <QuoteCard start={T.notyet} end={T.race + 14} />
      <LeftOne from={T.left} to={T.excuse} />
      <Approx from={T.start + 20} to={T.squeeze} />
    </>
  ),
  sfx: [
    [T.lower, SFX.pop, 0.3],
    [T.city, SFX.pop, 0.3],
    [T.saigon, SFX.pop, 0.25],
    [T.protect, SFX.pop, 0.3],
    [T.viet, SFX.pop, 0.3],
    [T.indo, SFX.whoosh, 0.25],
    [T.squeeze, SFX.swell, 0.3],
    [T.left, SFX.hit, 0.4],
    [T.notyet, SFX.whoosh, 0.25],
    [T.first, SFX.pop, 0.35],
  ],
  Audio: () => (
    <>
      <Bed id="ship_creak" from={T.start} to={T.mandalay + 10} volume={0.2} voice={VOICE} />
      <Hit id="ship_bell" at={T.start + 20} volume={0.35} />
      <Bed id="army_marching" from={T.army} to={T.dynasty} volume={0.25} voice={VOICE} />
      <Hit id="war_drums" at={T.city} volume={0.4} />
      <Hit id="gong" at={T.dynasty + 6} volume={0.4} />
      <Bed id="wind" from={T.dynasty} to={T.malaya + 10} volume={0.15} voice={VOICE} />
      <Bed id="jungle_rain" from={T.malaya} to={T.east + 10} volume={0.15} voice={VOICE} />
      {SAIGON_SHOTS.map((f, i) => <Hit key={f} id={i === 1 ? "cannon_old" : "cannon"} at={f} volume={0.5} />)}
      <Bed id="fire_crackle" from={T.east} to={T.cambodia + 10} volume={0.15} voice={VOICE} />
      <Hit id="whistle_officer" at={T.protect - 20} volume={0.3} />
      <Bed id="wind" from={T.cambodia} to={T.tonkin + 10} volume={0.12} voice={VOICE} />
      <Bed id="army_march_crowd" from={T.tonkin} to={T.indo + 10} volume={0.25} voice={VOICE} />
      <Hit id="war_horn" at={T.indo} volume={0.3} />
      <Bed id="thunder_rumble" from={T.squeeze} to={T.excuse + 10} volume={0.2} voice={VOICE} />
      <Hit id="thunder_close" at={T.left} volume={0.3} />
      <Bed id="fire_crackle" from={T.excuse} to={T.race} volume={0.1} voice={VOICE} />
      <Bed id="wind" from={T.race} to={END + 14} volume={0.15} voice={VOICE} />
    </>
  ),
};
