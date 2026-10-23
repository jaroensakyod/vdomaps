import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { bbox } from "../../../components/Region";
import { Shot } from "../../../components/Scene";
import { Bed, Hit, SFX } from "./mix";
import { clamp, GOLD, RED, view } from "../news/kit";
import { B, CityDot, LAO_C, Ring, VOICE, wf, Zones, type Chapter4 } from "./beatsKit";
import { Busabok, Cannon, Cloud, Elephant, Firework, muzzle, Parasol, Show, SkyShift } from "./ch1_kit";
import { PL, R, VW } from "./places";
import { Backdrop, Banner, Boat, C, Candle, Fighter, Fire, Grass, Hall, King, Monk, Noble, PAL, PalaceWall, Palisade, Prang, River, Smoke, Tree, V2 } from "./v2";

// Episode 4, chapter 1 "จุดสูงสุด" (beats recap → peak, พ.ศ. 2321–2323): the Lao war, the Emerald Buddha, Chakri's rank.
const PLK: [number, number] = [100.26, 16.82]; // Phitsanulok
const BURMA_BACK: [number, number][] = [[100.26, 16.9], [100.0, 17.6], [99.5, 18.5], [98.9, 19.6]];
const WO_KILL: [number, number][] = [[102.6, 17.97], [103.6, 17.1], [104.4, 16.1], [105.0, 15.4]];
const RECAP_V = bbox([[97.8, 12.4], [103.0, 20.0]]);
const LAOWAR_V = bbox([[99.6, 10.6], [107.0, 18.8]]);
const VIENTIANE_V = bbox([[101.7, 17.25], [103.5, 18.7]]);
const EMERALD_V = bbox([[99.8, 13.3], [103.4, 18.5]]);
const ARRIVE_V = bbox([[99.95, 13.5], [101.3, 15.0]]);

export const T1 = {
  recap: B.recap.start,
  plk: wf("recap", "พิษณุโลก", 0.5),
  retreat: wf("recap", "ถอย", 0.85),
  strong: B.strong.start,
  thon: wf("strong", "กรุงธนบุรี", 0.15),
  expand: wf("strong", "ขยาย", 0.7),
  phrawo: B.phrawo.start,
  lao: wf("phrawo", "ลาว", 0.15),
  wo: wf("phrawo", "วอ", 0.4),
  vien: wf("phrawo", "เวียงจันทน์", 0.7),
  chase: wf("phrawo", "ตาม", 0.8),
  kill: wf("phrawo", "สังหาร", 0.92),
  laowar: B.laowar.start,
  chakri: wf("laowar", "จักรี", 0.35),
  surasi: wf("laowar", "สุร", 0.55),
  army: wf("laowar", "ราว", 0.68),
  siege: B.siege.start,
  ring: wf("siege", "ล้อม", 0.3),
  months: wf("siege", "เดือน", 0.65),
  fall: wf("siege", "แตก", 0.92),
  emerald: B.emerald.start,
  back: wf("emerald", "กลับ", 0.33),
  gem: wf("emerald", "แก้ว", 0.5),
  arrive: B.arrive.start,
  go: wf("arrive", "เสด็จ", 0.5),
  recv: wf("arrive", "รับ", 0.58),
  fest: wf("arrive", "ฉลอง", 0.88),
  promote: B.promote.start,
  raise: wf("promote", "เลื่อน", 0.2),
  rank: wf("promote", "ตำแหน่ง", 0.6),
  peak: B.peak.start,
  but: wf("peak", "แต่", 0.5),
  end: B.warn.start,
};
const T = T1;
const SHOTS = [T.siege + 6, T.ring + 6, T.months - 4, T.fall - 18];
const IMPACTS = SHOTS.map((f) => f + 18);
const FW = [T.fest, T.fest + 22, T.fest + 44, T.fest + 70, T.fest + 96];
export const count = (from: number, n: number, len = 30) => (f: number) => Math.round(interpolate(f, [from, from + len], [0, n], clamp)).toLocaleString("en-US");

type Sc = { id: string; start: number; end: number };

// Recap: the Burmese column marches away from Phitsanulok's walls at dawn; Siamese banners on the ramparts.
const RetreatScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PLK} start={start} end={end} sky={["#d98a52", "#f6d9a0"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => {
      const away = lt * 0.9 * g.s;
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.14, 0.3]} lightColor={["#ffcf8a", "#fff2c8"]} far="#9a7a7a" mid="#6f6a4a" ground="#7a5a36" mist="#f6d9a0" />
          <Prang x={g.x + g.W * 0.84 + pan * 0.5} y={g.ground - 84 * g.s} h={120 * g.s} s={g.s} color="#d9cdb0" />
          <PalaceWall x={g.x + g.W * 0.6 + pan * 0.5} y={g.ground - 8 * g.s} w={g.W * 0.46} h={76 * g.s} s={g.s} color="#d9cdb0" />
          {[0.64, 0.74, 0.92].map((f, i) => <Fighter key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 94 * g.s} scale={g.sc * 0.4} mode="stand" flip costume={C.siam} phase={i} />)}
          <Banner x={g.x + g.W * 0.69 + pan * 0.5} y={g.ground - 94 * g.s} s={g.s * 0.8} color={PAL.gilt} />
          <Banner x={g.x + g.W * 0.86 + pan * 0.5} y={g.ground - 94 * g.s} s={g.s * 0.8} color={PAL.gilt} />
          {[0, 1, 2].map((i) => <ellipse key={i} cx={g.x + g.W * (0.2 + i * 0.12) - away + pan * 0.7} cy={g.ground - 6 * g.s} rx={70 * g.s} ry={16 * g.s} fill="#c9a070" opacity={0.35} />)}
          {[0, 1, 2, 3, 4].map((i) => (
            <Fighter key={i} x={g.x + g.W * (0.08 + i * 0.1) - away + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode="walk" flip costume={C.burma} phase={i * 1.3} />
          ))}
          <Banner x={g.x + g.W * 0.36 - away + pan * 0.7} y={g.ground + 4 * g.s} s={g.s} color={PAL.ochre} />
          <Grass g={g} shift={pan * 1.6} color="#3a3a20" />
        </g>
      );
    }}
  </V2>
);

// Thonburi at its height: Wat Chaeng's prang, the palace wall, boats busy on the river at sunrise.
const CapitalScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#f0a860", "#fbe6b8"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.82, 0.26]} lightColor={["#ffd38a", "#fff2c8"]} far="#b08a7a" mid="#7a7a5a" ground="#6b5236" mist="#fbe6b8" />
        <Prang x={g.x + g.W * 0.2 + pan * 0.5} y={g.ground - 30 * g.s} h={220 * g.s} s={g.s} gold />
        <Prang x={g.x + g.W * 0.08 + pan * 0.5} y={g.ground - 30 * g.s} h={110 * g.s} s={g.s} />
        <PalaceWall x={g.x + g.W * 0.4 + pan * 0.5} y={g.ground - 30 * g.s} w={g.W * 0.62} h={50 * g.s} s={g.s} />
        <Hall x={g.x + g.W * 0.52 + pan * 0.5} y={g.ground - 80 * g.s} w={220 * g.s} s={g.s} />
        {[0.46, 0.8, 0.96].map((f) => <Banner key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 80 * g.s} s={g.s * 0.8} color={PAL.gilt} />)}
        <River g={g} y={g.ground - 24 * g.s} pan={pan} color="#4a7a8f" />
        <Boat x={g.x + g.W * 0.12 + lt * 1.1 * g.s + pan * 0.7} y={g.ground + 8 * g.s} w={170 * g.s} s={g.s} n={4} />
        <Boat x={g.x + g.W * 0.9 - lt * 0.8 * g.s + pan * 0.7} y={g.ground + 30 * g.s} w={130 * g.s} s={g.s} n={3} dir={-1} costume={C.villager} />
        <Grass g={g} shift={pan * 1.6} color="#2f3a24" />
      </g>
    )}
  </V2>
);

// Night on the Mekong: Vientiane's troops rush the camp of Phra Wo; fires in the stockade.
const RaidScene = ({ id, start, end, hits }: Sc & { hits: number[] }) => (
  <V2 id={id} anchor={PL.donmot} start={start} end={end} sky={["#0b1026", "#3a1f2a"]} accent={RED} hits={hits} warm={0.04}>
    {(g, pan, lt) => {
      const rush = lt * 1.2 * g.s;
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.8, 0.2]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#1f2440" mid="#24302a" ground="#1f1a12" mist="#ff9a5a" />
          <River g={g} y={g.ground - 60 * g.s} pan={pan * 0.4} color="#16263a" night />
          <rect x={g.x - 100 * g.s} y={g.ground - 30 * g.s} width={g.W + 200 * g.s} height={g.H} fill="#1f1a12" />
          <Palisade x={g.x + g.W * 0.55 + pan * 0.5} y={g.ground - 22 * g.s} w={g.W * 0.45} s={g.s} color="#5a3a1f" />
          <Fire x={g.x + g.W * 0.68 + pan * 0.5} y={g.ground - 70 * g.s} h={70 * g.s} seed={2} />
          <Fire x={g.x + g.W * 0.88 + pan * 0.5} y={g.ground - 70 * g.s} h={56 * g.s} seed={5} />
          <Smoke x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground - 120 * g.s} s={g.s} dark />
          {[0.62, 0.8].map((f, i) => <Fighter key={f} x={g.x + g.W * f + pan * 0.7} y={g.ground + 2 * g.s} scale={g.sc * 0.58} flip mode={i ? "stand" : "attack"} costume={C.villager} phase={i} />)}
          {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + g.W * (0.04 + i * 0.1) + rush + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode={i % 2 ? "run" : "attack"} costume={C.lao} phase={i * 1.4} />)}
          <Banner x={g.x + g.W * 0.12 + rush + pan * 0.7} y={g.ground + 4 * g.s} s={g.s} color="#3fbf6a" />
          <Grass g={g} shift={pan * 1.6} color="#10140c" />
        </g>
      );
    }}
  </V2>
);

// Army on the march with war elephants carrying the commanders; banners. Used twice (Lao war, Cambodia).
export const MarchScene = ({ id, start, end, anchor, sky, light, trumpet = -99, mid = "#6f7a50", far = "#8a8a9a" }: Sc & { anchor: [number, number]; sky: [string, string]; light: [number, number]; trumpet?: number; mid?: string; far?: string }) => (
  <V2 id={id} anchor={anchor} start={start} end={end} sky={sky} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => {
      const go = lt * 0.7 * g.s;
      return (
        <g>
          <Backdrop g={g} pan={pan} light={light} lightColor={["#ffd38a", "#fff2c8"]} far={far} mid={mid} ground="#7a5a36" mist="#fbe6b8" />
          {[0.1, 0.34, 0.7, 0.9].map((f, i) => <Tree key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 14 * g.s} s={g.s * 0.9} kind={i % 2 ? "palm" : "round"} />)}
          {[0, 1, 2, 3, 4, 5].map((i) => <Fighter key={i} x={g.x + g.W * (0.02 + i * 0.16) + go * 0.8 + pan * 0.6} y={g.ground - 10 * g.s} scale={g.sc * 0.45} mode="walk" costume={C.siam} phase={i * 0.9} />)}
          <Elephant x={g.x + g.W * 0.3 + go + pan * 0.7} y={g.ground + 2 * g.s} scale={g.sc * 0.5} rider="#efe6d0" phase={0.4} />
          <Elephant x={g.x + g.W * 0.62 + go + pan * 0.7} y={g.ground + 6 * g.s} scale={g.sc * 0.52} rider={PAL.gilt} phase={1.9} trumpet={trumpet} />
          {[0.12, 0.46, 0.8].map((f, i) => <Fighter key={f} x={g.x + g.W * f + go + pan * 0.8} y={g.ground + 12 * g.s} scale={g.sc * 0.6} mode="walk" costume={C.siam} phase={i * 1.7} />)}
          <Banner x={g.x + g.W * 0.14 + go + pan * 0.8} y={g.ground + 12 * g.s} s={g.s} color={PAL.gilt} />
          <Banner x={g.x + g.W * 0.82 + go + pan * 0.8} y={g.ground + 12 * g.s} s={g.s} color={PAL.ochre} />
          <Grass g={g} shift={pan * 1.6} color="#3a3a20" />
        </g>
      );
    }}
  </V2>
);

// Siege of Vientiane: Siamese cannon pound the wall by the Mekong until the gate gives way.
const SiegeScene = ({ id, start, end }: Sc) => {
  const frame = useCurrentFrame();
  const fallen = interpolate(frame, [T.fall, T.fall + 12], [0, 1], clamp);
  return (
    <V2 id={id} anchor={PL.vientiane} start={start} end={end} sky={["#4a3a4a", "#d9a070"]} accent={GOLD} hits={[...SHOTS, ...IMPACTS]} warm={0.08}>
      {(g, pan) => {
        const c1x = g.x + g.W * 0.08 + pan * 0.7;
        const c2x = g.x + g.W * 0.24 + pan * 0.7;
        const cy = g.ground + 6 * g.s;
        const wallX = g.x + g.W * 0.58 + pan * 0.5;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.5, 0.3]} lightColor={["#ffb070", "#ffe0b0"]} far="#7a6a7a" mid="#5a5a48" ground="#5a4630" mist="#e0b080" />
            <Prang x={wallX + g.W * 0.2} y={g.ground - 70 * g.s} h={150 * g.s} s={g.s} color="#e0c890" gold />
            <PalaceWall x={wallX} y={g.ground - 6 * g.s} w={g.W * 0.44} h={90 * g.s} s={g.s} gateAt={0.3} gateOpen={fallen} color="#cfc0a0" />
            {[0.12, 0.62].map((f, i) => <Fighter key={f} x={wallX + g.W * 0.44 * f} y={g.ground - 102 * g.s} scale={g.sc * 0.42} mode={i ? "stand" : "attack"} flip costume={C.lao} phase={i} />)}
            {fallen > 0 && <Fire x={wallX + g.W * 0.13} y={g.ground - 80 * g.s} h={60 * g.s * fallen} seed={3} />}
            <Smoke x={wallX + g.W * 0.13} y={g.ground - 110 * g.s} s={g.s} dark />
            <Cannon x={c1x} y={cy} s={g.s * 1.2} fire={SHOTS.filter((_, i) => i % 2 === 0)} />
            <Cannon x={c2x} y={cy} s={g.s * 1.2} fire={SHOTS.filter((_, i) => i % 2 === 1)} />
            {SHOTS.map((f, i) => <Shot key={f} from={muzzle(i % 2 ? c2x : c1x, cy, g.s * 1.2)} to={[wallX + g.W * (0.08 + (i % 3) * 0.06), g.ground - 50 * g.s]} t={frame - f} s={g.s} />)}
            <Fighter x={c1x - 40 * g.s} y={g.ground + 10 * g.s} scale={g.sc * 0.6} mode="stand" costume={C.siam} weapon="none" />
            <Fighter x={c2x + 120 * g.s} y={g.ground + 10 * g.s} scale={g.sc * 0.6} mode="attack" costume={C.siam} phase={2} />
            <Banner x={c2x + 160 * g.s} y={g.ground + 10 * g.s} s={g.s} color={PAL.gilt} />
            <Grass g={g} shift={pan * 1.6} color="#2a2a18" />
          </g>
        );
      }}
    </V2>
  );
};

// The Emerald Buddha on its gilt pavilion; monks kneel on both sides in temple lamplight.
const EmeraldScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.vientiane} start={start} end={end} sky={["#2a120c", "#5a2a18"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#4a1a12" />
        {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={g.x + ((i * 71) % g.W) + pan * 0.2} cy={g.y + 20 * g.s + ((i * 37) % 200) * g.s} r={3 * g.s} fill={PAL.gilt} opacity={0.35} />)}
        {[0.06, 0.3, 0.7, 0.94].map((f) => <rect key={f} x={g.x + g.W * f - 16 * g.s + pan * 0.2} y={g.y} width={32 * g.s} height={g.H} fill="#6a2416" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        <rect x={g.x - 50 * g.s} y={g.ground - 14 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#3a2010" />
        <Busabok x={g.cx + pan * 0.5} y={g.ground - 14 * g.s} s={g.s * 1.05} />
        {[0, 1].map((i) => <Monk key={i} x={g.x + g.W * (0.16 + i * 0.12) + pan * 0.7} y={g.ground - 4 * g.s} scale={g.sc * 0.6} mode="kneel" bow={0.3 + 0.2 * i} phase={i} />)}
        {[0, 1].map((i) => <Monk key={i} x={g.x + g.W * (0.72 + i * 0.12) + pan * 0.7} y={g.ground - 4 * g.s} scale={g.sc * 0.6} mode="kneel" bow={0.35} flip phase={i + 2} />)}
        <Candle x={g.x + g.W * 0.38 + pan * 0.7} y={g.ground - 10 * g.s} s={g.s} />
        <Candle x={g.x + g.W * 0.62 + pan * 0.7} y={g.ground - 10 * g.s} s={g.s} />
        {[0.02, 0.98].map((f) => <rect key={f} x={g.x + g.W * f - 30 * g.s + pan * 1.6} y={g.y} width={60 * g.s} height={g.H} fill="#1a0a06" opacity={0.85} />)}
      </g>
    )}
  </V2>
);

// The royal barge brings the Emerald Buddha down the river; boats with banners, crowds on the bank.
const BargeScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.saraburi} start={start} end={end} sky={["#7ab0d0", "#f4e2b8"]} accent={GOLD} warm={0.08}>
    {(g, pan, lt) => {
      const go = lt * 0.8 * g.s;
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.85, 0.2]} lightColor={["#fff0c0", "#fffbe8"]} far="#8aa0a8" mid="#5b6e4a" ground="#5b6e4a" mist="#f4e2b8" />
          {[0, 1, 2, 3, 4, 5].map((i) => <Fighter key={i} x={g.x + g.W * (0.08 + i * 0.16) + pan * 0.5} y={g.ground - 70 * g.s} scale={g.sc * 0.32} mode="stand" weapon="none" costume={i % 2 ? C.villager : C.lao} phase={i} />)}
          {[0.2, 0.6, 0.9].map((f) => <Tree key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 70 * g.s} s={g.s * 0.6} kind="palm" />)}
          <River g={g} y={g.ground - 62 * g.s} pan={pan} color="#4a7a8f" />
          <Boat x={g.x + g.W * 0.18 + go + pan * 0.7} y={g.ground - 20 * g.s} w={150 * g.s} s={g.s * 0.8} n={4} />
          <Boat x={g.x + g.W * 0.5 + go + pan * 0.7} y={g.ground + 24 * g.s} w={340 * g.s} s={g.s} n={6} gilt />
          <Busabok x={g.x + g.W * 0.5 + 40 * g.s + go + pan * 0.7} y={g.ground + 8 * g.s} s={g.s * 0.42} glow={0.7} />
          <Banner x={g.x + g.W * 0.5 - 150 * g.s + go + pan * 0.7} y={g.ground + 6 * g.s} s={g.s * 0.9} color={PAL.gilt} />
          <Banner x={g.x + g.W * 0.5 + 170 * g.s + go + pan * 0.7} y={g.ground + 6 * g.s} s={g.s * 0.9} color={PAL.ochre} />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${g.x + i * 130 * g.s + pan * 1.6} ${g.y + g.H} q${8 * g.s} ${-40 * g.s} ${4 * g.s} ${-60 * g.s}`} stroke="#3a4a28" strokeWidth={5 * g.s} fill="none" />)}
        </g>
      );
    }}
  </V2>
);

// Night festival at Wat Chaeng: fireworks over the prang, lanterns, crowds on the bank.
const FestivalScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.watArun} start={start} end={end} sky={["#0a1430", "#3a2a5a"]} accent={GOLD} warm={0.05}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={null} far="#1f2a4a" mid="#25304a" ground="#151a24" mist="#c8a0d0" ridges={false} />
        {FW.map((f, i) => <Firework key={f} x={g.x + g.W * [0.2, 0.75, 0.45, 0.88, 0.3][i] + pan * 0.2} y={g.y + g.H * [0.22, 0.18, 0.12, 0.3, 0.3][i]} s={g.s} at={f} color={["#ffd25a", "#ff6b5f", "#9fffd0", "#ffd25a", "#cfd8ff"][i]} />)}
        <Prang x={g.x + g.W * 0.55 + pan * 0.4} y={g.ground - 40 * g.s} h={230 * g.s} s={g.s} color="#d9cdb0" gold />
        <Prang x={g.x + g.W * 0.36 + pan * 0.4} y={g.ground - 40 * g.s} h={120 * g.s} s={g.s} color="#c9c2b0" />
        <Prang x={g.x + g.W * 0.74 + pan * 0.4} y={g.ground - 40 * g.s} h={120 * g.s} s={g.s} color="#c9c2b0" />
        <path d={`M${g.x + pan * 0.5} ${g.ground - 120 * g.s} Q${g.cx + pan * 0.5} ${g.ground - 60 * g.s} ${g.x + g.W + pan * 0.5} ${g.ground - 120 * g.s}`} stroke="#3a2a22" strokeWidth={1.5 * g.s} fill="none" />
        {Array.from({ length: 11 }, (_, i) => <circle key={i} cx={g.x + g.W * (i / 10) + pan * 0.5} cy={g.ground - 120 * g.s + Math.sin((i / 10) * Math.PI) * 30 * g.s} r={7 * g.s} fill={i % 2 ? "#ff8a2a" : "#ffd25a"} />)}
        <River g={g} y={g.ground - 30 * g.s} pan={pan} color="#101c34" night />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <Fighter key={i} x={g.x + g.W * (0.05 + i * 0.15) + pan * 0.7} y={g.ground + 40 * g.s} scale={g.sc * 0.5} mode="stand" weapon="none" costume={{ jacket: "#2a2030", sash: "#3a2a3a", pants: "#1a1420", head: "short" }} phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#0e1410" />
      </g>
    )}
  </V2>
);

// Investiture: the king on the throne, Chakri bowing to receive the new rank, nobles prostrate behind him.
const InvestitureScene = ({ id, start, end }: Sc) => {
  const frame = useCurrentFrame();
  const bow = interpolate(frame, [T.raise - 6, T.raise + 10], [0, 1], clamp);
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#3a1a10", "#8a4a22"]} accent={GOLD} warm={0.12}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#5a2418" />
          {[0.1, 0.36, 0.64, 0.9].map((f) => <rect key={f} x={g.x + g.W * f - 14 * g.s + pan * 0.2} y={g.y} width={28 * g.s} height={g.H} fill="#7a3418" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
          {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M${g.x + i * 44 * g.s + pan * 0.2} ${g.y + 24 * g.s} l${10 * g.s} ${14 * g.s} l${-10 * g.s} ${14 * g.s} l${-10 * g.s} ${-14 * g.s} Z`} fill={PAL.gilt} opacity={0.35} />)}
          <rect x={g.x - 50 * g.s} y={g.ground - 14 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#3a2414" />
          <rect x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground - 40 * g.s} width={g.W * 0.26} height={26 * g.s} fill="#b8862a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          <King x={g.x + g.W * 0.83 + pan * 0.5} y={g.ground - 40 * g.s} scale={g.sc * 0.62} light={0.7} />
          <Noble x={g.x + g.W * 0.56 + pan * 0.7} y={g.ground - 4 * g.s} scale={g.sc * 0.72} mode="kneel" bow={bow} jacket={PAL.gilt} />
          <g transform={`translate(${g.x + g.W * 0.64 + pan * 0.7},${g.ground - 8 * g.s})`}>
            <path d={`M${-26 * g.s} 0 L${26 * g.s} 0 L${18 * g.s} ${-14 * g.s} L${-18 * g.s} ${-14 * g.s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <rect x={-12 * g.s} y={-30 * g.s} width={24 * g.s} height={16 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
          </g>
          {[0, 1, 2].map((i) => <Noble key={i} x={g.x + g.W * (0.1 + i * 0.13) + pan * 0.7} y={g.ground - 4 * g.s} scale={g.sc * 0.6} mode="prostrate" phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />)}
          <Candle x={g.x + g.W * 0.03 + pan * 1.6} y={g.y + g.H - 8 * g.s} s={g.s * 1.5} />
          <Candle x={g.x + g.W * 0.48 + pan * 1.6} y={g.y + g.H - 8 * g.s} s={g.s * 1.5} />
        </g>
      )}
    </V2>
  );
};

// The highest rank: Chakri seated under a tiered parasol, lesser nobles prostrate in rows before him.
const RankScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#e0a060", "#f8e0b0"]} accent={GOLD} warm={0.1}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.15, 0.25]} lightColor={["#ffd38a", "#fff2c8"]} far="#a08a7a" mid="#7a6a50" ground="#8a6c45" mist="#f8e0b0" />
        <Hall x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 30 * g.s} w={300 * g.s} s={g.s} />
        <rect x={g.x + g.W * 0.66 + pan * 0.6} y={g.ground - 40 * g.s} width={150 * g.s} height={30 * g.s} fill="#b8862a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
        <Parasol x={g.x + g.W * 0.66 + 110 * g.s + pan * 0.6} y={g.ground - 40 * g.s} s={g.s} h={180} />
        <Noble x={g.x + g.W * 0.66 + 70 * g.s + pan * 0.6} y={g.ground - 40 * g.s} scale={g.sc * 0.62} mode="sit" jacket={PAL.gilt} flip />
        {[0, 1, 2, 3].map((i) => <Noble key={i} x={g.x + g.W * (0.08 + i * 0.13) + pan * 0.7} y={g.ground + (i % 2 ? 4 : 16) * g.s} scale={g.sc * 0.6} mode="prostrate" phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />)}
        <Fighter x={g.x + g.W * 0.94 + pan * 0.7} y={g.ground + 8 * g.s} scale={g.sc * 0.6} mode="stand" flip costume={C.guard} />
        <Banner x={g.x + g.W * 0.97 + pan * 0.7} y={g.ground + 8 * g.s} s={g.s} color={PAL.gilt} />
        <Grass g={g} shift={pan * 1.6} color="#4a3a20" />
      </g>
    )}
  </V2>
);

// The old palace at dusk: the golden light drains to a grey, heavy sky as clouds roll in.
const DuskScene = ({ id, start, end }: Sc) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [T.but - 10, T.but + 50], [0, 1], clamp);
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#e8903a", "#ffd890"]} accent={GOLD} warm={0.1 - k * 0.08}>
      {(g, pan, lt) => (
        <g>
          <SkyShift id={id} x={g.x - 60 * g.s} y={g.y - 20 * g.s} w={g.W + 120 * g.s} h={g.H + 40 * g.s} from={["#e8903a", "#ffd890"]} to={["#2a2f4a", "#6a6a7a"]} k={k} />
          <Backdrop g={g} pan={pan} light={[0.78, 0.3 + k * 0.4]} lightColor={k > 0.5 ? ["#8a8aa0", "#b0b0c0"] : ["#ffb060", "#fff0c0"]} far={k > 0.5 ? "#3a3a50" : "#a0706a"} mid={k > 0.5 ? "#2a3028" : "#6a5a40"} ground="#4a3a26" mist={k > 0.5 ? "#8a90a0" : "#ffd890"} />
          {[0, 1, 2].map((i) => <Cloud key={i} x={g.x + g.W * (1.1 - i * 0.3) - lt * 0.6 * g.s + pan * 0.2} y={g.y + (40 + i * 30) * g.s} s={g.s * 1.4} color="#3a3a48" o={k * 0.85} />)}
          <Prang x={g.x + g.W * 0.82 + pan * 0.5} y={g.ground - 30 * g.s} h={180 * g.s} s={g.s} color="#cfc6b0" gold />
          <PalaceWall x={g.x + g.W * 0.02 + pan * 0.5} y={g.ground - 10 * g.s} w={g.W * 0.7} h={60 * g.s} s={g.s} gateAt={0.5} />
          <Hall x={g.x + g.W * 0.18 + pan * 0.5} y={g.ground - 70 * g.s} w={260 * g.s} s={g.s} glow={k} />
          {[0.3, 0.62].map((f, i) => <Fighter key={f} x={g.x + g.W * f + pan * 0.7} y={g.ground + 10 * g.s} scale={g.sc * 0.6} mode="stand" costume={C.guard} flip={i === 1} phase={i} />)}
          <Banner x={g.x + g.W * 0.34 + pan * 0.7} y={g.ground + 10 * g.s} s={g.s} color={PAL.gilt} />
          <Grass g={g} shift={pan * 1.6} color="#262a18" />
        </g>
      )}
    </V2>
  );
};

export const e4c1: Chapter4 = {
  name: "จุดสูงสุด",
  from: T.recap,
  to: T.end,
  cams: (w, h) => [
    { frame: T.recap, cam: view(RECAP_V, w, h, 0.9, 0.04) },
    { frame: T.expand - 6, cam: view(RECAP_V, w, h, 0.9, 0.04) },
    { frame: T.expand + 34, cam: view(LAOWAR_V, w, h, 0.92, 0.0) },
    { frame: T.lao, cam: view(LAOWAR_V, w, h, 0.92, 0.0) },
    { frame: T.lao + 36, cam: view(VW.mekong, w, h, 1, 0.1) },
    { frame: T.chakri - 10, cam: view(VW.mekong, w, h, 1, 0.1) },
    { frame: T.chakri + 26, cam: view(LAOWAR_V, w, h, 0.92, 0.0) },
    { frame: T.siege - 4, cam: view(LAOWAR_V, w, h, 0.92, 0.0) },
    { frame: T.siege + 30, cam: view(VIENTIANE_V, w, h, 0.9, 0.1) },
    { frame: T.back - 8, cam: view(VIENTIANE_V, w, h, 0.9, 0.1) },
    { frame: T.back + 34, cam: view(EMERALD_V, w, h, 0.5, 0.12) },
    { frame: T.arrive, cam: view(EMERALD_V, w, h, 0.5, 0.12) },
    { frame: T.arrive + 36, cam: view(ARRIVE_V, w, h, 0.6, 0.12) },
    { frame: T.recv, cam: view(ARRIVE_V, w, h, 0.6, 0.12) },
    { frame: T.recv + 40, cam: view(VW.thonWide, w, h, 0.9, 0.1) },
    { frame: T.peak, cam: view(VW.thonWide, w, h, 0.95, 0.1) },
    { frame: T.peak + 50, cam: view(VW.thonWide, w, h, 1.15, 0.1) },
  ],
  years: [[T.recap, "2321–2323"]],
  heads: [
    { f: T.recap, tag: "ตอนที่แล้ว", head: "พม่าถอยกลับ", color: GOLD },
    { f: T.strong, tag: "ธนบุรีแข็งแรงที่สุด", head: "ขยายไปตะวันออก", color: GOLD, portrait: "taksin_king" },
    { f: T.phrawo, tag: "ชนวนศึก", head: "พระวอถูกสังหาร", color: RED },
    { f: T.laowar, tag: "ศึกเวียงจันทน์", head: "เจ้าพระยาจักรี", color: GOLD, portrait: "chakri" },
    { f: T.surasi, tag: "ศึกเวียงจันทน์", head: "เจ้าพระยาสุรสีห์", color: GOLD, portrait: "surasi" },
    { f: T.army, tag: "ศึกเวียงจันทน์", head: "ทัพไทยราว", stat: count(T.army, 20000), label: "คน", color: GOLD },
    { f: T.siege, tag: "ศึกเวียงจันทน์", head: "เวียงจันทน์ถูกล้อม", color: GOLD },
    { f: T.months - 10, tag: "ล้อมเวียงจันทน์", head: "ล้อมอยู่ราว", stat: (f) => `${Math.round(interpolate(f, [T.months - 10, T.months + 10], [1, 4], clamp))} เดือน`, color: GOLD },
    { f: T.fall, tag: "ล้อมราว 4 เดือน", head: "เวียงจันทน์แตก", color: RED },
    { f: T.emerald, tag: "อัญเชิญพระแก้วมรกต", head: "มาธนบุรี", color: GOLD },
    { f: T.arrive, tag: "ราว 2322–2323", head: "เสด็จไปรับด้วยพระองค์เอง", color: GOLD, portrait: "taksin_king" },
    { f: T.fest, tag: "ราว 2322–2323", head: "ฉลองหลายวัน", color: GOLD },
    { f: T.promote, tag: "สมเด็จเจ้าพระยา", head: "มหากษัตริย์ศึก", color: GOLD, portrait: "chakri" },
    { f: T.rank, tag: "สมเด็จเจ้าพระยามหากษัตริย์ศึก", head: "ตำแหน่งสูงที่สุดของขุนนาง", color: GOLD, portrait: "chakri" },
    { f: T.peak, tag: "ภายนอก", head: "จุดสูงสุดของกรุงธนบุรี", color: GOLD },
    { f: T.but, tag: "จุดสูงสุด", head: "แต่ในวังกำลังเปลี่ยน", color: RED },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const zs = interpolate(frame, [T.recap, T.recap + 15, T.arrive + 20, T.arrive + 50], [0.6, 1, 1, 0], clamp);
    const zg = interpolate(frame, [T.expand, T.expand + 25, T.phrawo, T.phrawo + 20], [0, 0.8, 0.8, 0], clamp);
    const zl = interpolate(frame, [T.phrawo, T.phrawo + 20, T.arrive + 20, T.arrive + 50], [0, 0.9, 0.9, 0], clamp);
    return (
      <>
        <Zones k={{ siam: zs, lao: zg, khmer: zg }} colors={{ lao: GOLD, khmer: GOLD }} />
        <Zones k={{ lao: zl }} />
        <Show from={T.recap} to={T.strong + 20}>
          <CityDot at={PLK} color={GOLD} r={14} start={T.recap + 4} end={T.strong} />
          <PointLabel at={PLK} text="พิษณุโลก" start={T.recap + 10} color={GOLD} size={0.85} />
          <Arrow points={BURMA_BACK} start={T.plk} end={T.retreat + 20} color={RED} width={12} variant="dashed" opacity={interpolate(frame, [T.strong, T.strong + 20], [1, 0], clamp)} />
        </Show>
        <CityDot at={PL.thon} color={GOLD} r={14} start={T.strong} end={T.arrive - 10} />
        <Show from={T.strong} to={T.lao + 30}>
          <PointLabel at={PL.thon} text="ธนบุรี" start={T.thon} color={GOLD} size={0.85} />
        </Show>
        <CityDot at={PL.vientiane} color={LAO_C} r={14} start={T.lao} end={T.arrive - 10} />
        <Show from={T.lao} to={T.arrive}>
          <PointLabel at={PL.vientiane} text="เวียงจันทน์" start={T.vien} color={LAO_C} size={0.85} />
        </Show>
        <Show from={T.wo} to={T.laowar + 20}>
          <PointLabel at={PL.donmot} text="ดอนมดแดง" start={T.wo} color="#fff" size={0.75} />
          <Arrow points={WO_KILL} start={T.chase} end={T.kill + 10} color={RED} width={10} variant="dashed" opacity={interpolate(frame, [T.laowar, T.laowar + 20], [1, 0], clamp)} />
        </Show>
        <Show from={T.chakri} to={T.emerald + 20}>
          <Arrow points={R.laoKorat} start={T.chakri} end={T.chakri + 50} color={GOLD} width={20} opacity={interpolate(frame, [T.siege + 10, T.siege + 30], [1, 0.5], clamp)} />
          <PointLabel at={PL.korat} text="โคราช" start={T.chakri + 26} color={GOLD} size={0.75} />
        </Show>
        <Show from={T.surasi} to={T.emerald + 20}>
          <Arrow points={R.laoChampasak} start={T.surasi} end={T.surasi + 55} color={GOLD} width={20} opacity={interpolate(frame, [T.siege + 10, T.siege + 30], [1, 0.5], clamp)} />
          <PointLabel at={PL.champasak} text="จำปาศักดิ์" start={T.surasi + 30} color={GOLD} size={0.75} />
        </Show>
        <Ring at={PL.vientiane} r={0.22} color={GOLD} start={T.ring} end={T.fall} />
        <CityDot at={PL.vientiane} color={RED} r={22} start={T.fall} end={T.emerald + 10} />
        <Show from={T.back} to={T.recv + 40}>
          <Arrow points={R.emeraldBack} start={T.back} end={T.back + 70} color={GOLD} width={10} variant="dashed" />
        </Show>
        <CityDot at={PL.saraburi} color={GOLD} r={12} start={T.arrive + 20} end={T.recv + 30} />
        <Show from={T.arrive} to={T.recv + 40}>
          <PointLabel at={PL.saraburi} text="ท่าเจ้าสนุก" start={T.arrive + 24} color={GOLD} size={0.8} />
        </Show>
        <Show from={T.recv + 30} to={T.peak}>
          <PointLabel at={PL.watArun} text="วัดแจ้ง" start={T.recv + 36} color={GOLD} size={0.85} />
        </Show>
        <Show from={T.peak} to={T.end + 30}>
          <PointLabel at={PL.thon} text="พระราชวังเดิม" start={T.peak + 10} color={GOLD} size={0.85} />
        </Show>
        <Ring at={PL.thon} r={0.002} color={RED} start={T.but} end={T.end} />
      </>
    );
  },
  Panels: () => (
    <>
      <RetreatScene id="e4c1recap" start={T.recap} end={T.strong + 14} />
      <CapitalScene id="e4c1strong" start={T.strong} end={T.phrawo + 14} />
      <RaidScene id="e4c1raid" start={T.phrawo} end={T.laowar + 14} hits={[T.chase, T.kill]} />
      <MarchScene id="e4c1march" anchor={PL.korat} start={T.laowar} end={T.siege + 14} sky={["#e8a868", "#f8e2b0"]} light={[0.86, 0.24]} trumpet={T.army} />
      <SiegeScene id="e4c1siege" start={T.siege} end={T.emerald + 14} />
      <EmeraldScene id="e4c1emerald" start={T.emerald} end={T.arrive + 14} />
      <BargeScene id="e4c1barge" start={T.arrive} end={T.recv + 14} />
      <FestivalScene id="e4c1fest" start={T.recv} end={T.promote + 14} />
      <InvestitureScene id="e4c1invest" start={T.promote} end={T.rank + 14} />
      <RankScene id="e4c1rank" start={T.rank} end={T.peak + 14} />
      <DuskScene id="e4c1dusk" start={T.peak} end={T.end + 14} />
    </>
  ),
  sfx: [
    [T.recap + 10, SFX.pop, 0.3],
    [T.thon, SFX.pop, 0.3],
    [T.expand - 6, SFX.whoosh, 0.3],
    [T.vien, SFX.pop, 0.3],
    [T.wo, SFX.pop, 0.3],
    [T.chakri - 16, SFX.whoosh, 0.3],
    [T.chakri + 26, SFX.pop, 0.25],
    [T.surasi + 30, SFX.pop, 0.25],
    [T.army, SFX.tick, 0.3],
    [T.siege - 4, SFX.whoosh, 0.3],
    [T.months - 10, SFX.tick, 0.3],
    [T.fall, SFX.hit, 0.35],
    [T.back - 8, SFX.whoosh, 0.3],
    [T.arrive + 20, SFX.pop, 0.3],
    [T.recv - 4, SFX.whoosh, 0.3],
    [T.recv + 36, SFX.pop, 0.3],
    [T.promote, SFX.swell, 0.3],
    [T.peak + 10, SFX.pop, 0.25],
    [T.but, SFX.hit, 0.3],
  ],
  Audio: () => (
    <>
      <Bed id="army_marching" from={T.recap - 10} to={T.strong + 10} volume={0.22} voice={VOICE} />
      <Bed id="city_crowd" from={T.strong - 10} to={T.phrawo + 10} volume={0.14} voice={VOICE} />
      <Bed id="fire_crackle" from={T.phrawo - 10} to={T.laowar + 10} volume={0.25} voice={VOICE} />
      <Hit id="battle_cry" at={T.chase} volume={0.35} />
      <Hit id="sword_clash" at={T.kill} volume={0.4} />
      <Bed id="army_marching" from={T.laowar - 10} to={T.siege + 10} volume={0.22} voice={VOICE} />
      <Bed id="war_drums" from={T.laowar - 10} to={T.emerald + 10} volume={0.18} voice={VOICE} />
      <Hit id="elephant" at={T.army} volume={0.4} />
      {SHOTS.map((f, i) => <Hit key={f} id={i % 2 ? "cannon" : "cannon_old"} at={f} volume={0.45} />)}
      {IMPACTS.slice(0, -1).map((f) => <Hit key={f} id="wood_hit" at={f} volume={0.3} />)}
      <Hit id="wood_break" at={T.fall} volume={0.5} />
      <Bed id="wind" from={T.emerald - 10} to={T.arrive + 10} volume={0.14} voice={VOICE} />
      <Hit id="gong" at={T.gem} volume={0.4} />
      <Bed id="city_crowd" from={T.arrive - 10} to={T.promote + 10} volume={0.2} voice={VOICE} />
      <Hit id="gong" at={T.go} volume={0.3} />
      <Hit id="crowd_cheer" at={T.fest} volume={0.35} />
      {FW.map((f) => <Hit key={f} id="cannon_far" at={f} volume={0.25} />)}
      <Bed id="fire_crackle" from={T.promote - 10} to={T.peak + 10} volume={0.12} voice={VOICE} />
      <Hit id="gong" at={T.raise} volume={0.4} />
      <Bed id="wind" from={T.peak - 10} to={T.end + 14} volume={0.2} voice={VOICE} />
    </>
  ),
};
