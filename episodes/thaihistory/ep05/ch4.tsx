import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { Fighter, Glow, Grass, Shot } from "../../../components/Scene";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { Backdrop, Candle, House, Manuscript, PAL, Palisade, Prang, River, Tree, V2 } from "../ep04/v2";
import { Balance, Cannon, muzzle } from "../ep04/ch1_kit";
import { Rain } from "../ep04/ch3_kit";
import { B, BRIT_C, CityDot, Empire, FR_C, MapFlag, ramp, Ring, SIAM_C, VOICE, wf, wp, type AreaId, type Chapter5 } from "./beatsKit";
import { Slot, usePop } from "./cards";
import { along, BoatGlyph, MapLine, Splash } from "./ch3_kit5";
import { C5, Gunboat, PalaceRoof, PanelFlag, Sea } from "./kit5";
import { Bed, Hit, SFX } from "./mix";
import { PL, R, VW } from "./places";

// Chapter 4 (mekong → lesson): the 1893 crisis — Mekong claim, Paknam, ultimatum, blockade, treaty, Chanthaburi.
const FROM = B.mekong.start;
const END = B.collide.start;
const T = {
  claim: wp("mekong", "อ้าง", 0.15),
  viet: wp("mekong", "เวียดนาม", 0.65),
  pavie: B.pavie.start,
  pname: wp("pavie", "ปาวี", 0.5),
  lp: wp("pavie", "หลวง", 0.85),
  clash: B.clash.start,
  fight: wp("clash", "ปะทะ", 0.5),
  points: wp("clash", "จุด", 0.9),
  boats: B.gunboats.start,
  warship: wp("gunboats", "เรือรบ", 0.45),
  force: wp("gunboats", "ฝ่า", 0.75),
  fort: B.fort.start,
  shoot: wp("fort", "ยิง", 0.25),
  dead: wp("fort", "ชีวิต", 0.55),
  through: wf("fort", "ฝ่า", 0.85),
  aim: B.aim.start,
  anchor: wp("aim", "ทอดสมอ", 0.25),
  turn: wp("aim", "หัน", 0.6),
  palace: wp("aim", "พระบรม", 0.75),
  ult: B.ultimatum.start,
  demand: wp("ultimatum", "คำขาด", 0.3),
  left: wp("ultimatum", "ซ้าย", 0.45),
  pay: wp("ultimatum", "จ่าย", 0.7),
  hours: wp("ultimatum", "ตอบ", 0.85),
  block: B.blockade.start,
  uk: wp("blockade", "อังกฤษ", 0.1),
  no: wp("blockade", "ไม่", 0.4),
  close: wp("blockade", "ปิด", 0.75),
  ill: B.ill.start,
  sick: wp("ill", "ประชวร", 0.3),
  poem: wp("ill", "โคลง", 0.6),
  treaty: B.treaty.start,
  sign: wp("treaty", "นาม", 0.2),
  cede: wp("treaty", "ยก", 0.27),
  ban: wp("treaty", "ห้าม", 0.42),
  km: wp("treaty", "ยี่สิบ", 0.5),
  fine: wp("treaty", "ปรับ", 0.7),
  two: wf("treaty", "สอง", 0.75, 1),
  three: wf("treaty", "สาม", 0.92, 1),
  chan: B.chanthaburi.start,
  seize: wp("chanthaburi", "ยึด", 0.15),
  until: wp("chanthaburi", "จนถึง", 0.7),
  lesson: B.lesson.start,
  modern: wp("lesson", "ทัน", 0.35),
  help: wp("lesson", "ช่วย", 0.8),
};

// Paknam: fort guns and gunboat guns (frames), shells land as splashes 18 frames after each fort shot.
const FORT_SHOTS = [T.shoot, T.shoot + 18, T.shoot + 40, T.dead + 4];
const BOAT_SHOTS = [T.shoot + 28, T.shoot + 52, T.through - 6];
// Close framing on the fort (inside the mouthhls tile) so it sits above the panel.
const FORT_VIEW = bbox([[100.5, 13.47], [100.67, 13.66]]);
const HITS = [...FORT_SHOTS, ...BOAT_SHOTS].sort((a, b) => a - b);

// Gunboat progress along R.gunboats (0 sea → 1 French legation).
const boatK = (f: number) => interpolate(f, [T.force, T.fort, T.through, T.anchor], [0, 0.27, 0.46, 1], clamp);

// --- map layers ----------------------------------------------------------------------------------------------

// Demilitarised 25 km band on the right (Siamese) bank of the Mekong, hatched blue (approximate).
const BAND: [number, number][] = [[101.2, 17.83], [101.65, 17.79], [102.1, 17.82], [102.75, 17.77], [103.3, 18.24], [103.95, 18.22], [104.66, 17.4], [104.62, 16.9], [104.62, 16.45], [105.08, 15.95], [105.4, 15.3]];
const Band = ({ k }: { k: number }) => {
  const { path, projection, s } = useMap();
  if (k <= 0) return null;
  const pxDeg = (projection.scale() * Math.PI) / 180;
  return (
    <g opacity={k} clipPath="url(#e5clip764)">
      <defs>
        <pattern id="e5hatch" width={12 * s} height={12 * s} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={6 * s} height={12 * s} fill={FR_C} />
        </pattern>
      </defs>
      <path d={path({ type: "LineString", coordinates: BAND }) ?? ""} fill="none" stroke="url(#e5hatch)" strokeWidth={pxDeg * 0.45} strokeLinejoin="round" strokeLinecap="round" opacity={0.75} />
    </g>
  );
};

// A soft gun-flash glow on the map at a point (rises 2 frames, fades 14).
const MapFlash = ({ at: c, hits }: { at: [number, number]; hits: number[] }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(c);
  if (!p) return null;
  const v = Math.max(0, ...hits.map((h) => interpolate(frame - h, [0, 2, 16], [0, 1, 0], clamp)));
  return v > 0 ? <circle cx={p[0]} cy={p[1]} r={60 * s} fill="#ffe7a0" opacity={0.5 * v} /> : null;
};

// --- illustrated panels (style v2) ---------------------------------------------------------------------------

// The Mekong: a French officer and flag on the far (left) bank, a Siamese guard on the near bank, a boat crossing.
const MekongScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={[104.0, 17.6]} start={start} end={end} sky={["#7a9ac0", "#f0d8b0"]} accent={FR_C}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.22]} far="#7a8aa0" mid="#5a7a4a" ground="#6a5a3a" />
        <House x={g.x + g.W * 0.55 + pan * 0.4} y={g.ground - 60 * g.s} w={120 * g.s} s={g.s * 0.7} />
        <Tree x={g.x + g.W * 0.3 + pan * 0.4} y={g.ground - 60 * g.s} s={g.s * 0.8} kind="palm" />
        <Fighter x={g.x + g.W * 0.78 + pan * 0.4} y={g.ground - 58 * g.s} scale={g.sc * 0.42} mode="stand" costume={C5.french} weapon="rifle" flip />
        <PanelFlag x={g.x + g.W * 0.86 + pan * 0.4} y={g.ground - 58 * g.s} s={g.s * 0.8} kind="fr" />
        <River g={g} y={g.ground - 44 * g.s} pan={pan} color="#7a6a4a" />
        <g transform={`translate(${g.x + g.W * (0.2 + lt * 0.001) + pan * 0.7},${g.ground - 14 * g.s})`}>
          <path d={`M${-50 * g.s} 0 Q0 ${14 * g.s} ${50 * g.s} 0 L${44 * g.s} ${-8 * g.s} L${-44 * g.s} ${-8 * g.s} Z`} fill="#5a3a20" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          <Fighter x={0} y={-6 * g.s} scale={g.sc * 0.4} mode="stand" costume={C5.lao} weapon="spear" />
        </g>
        <Fighter x={g.x + g.W * 0.12 + pan * 1.4} y={g.ground + 40 * g.s} scale={g.sc * 0.9} mode="stand" costume={C5.siamArmy} weapon="rifle" />
        <Grass g={g} shift={pan * 1.6} color="#3a4a22" />
      </g>
    )}
  </V2>
);

// Pavie on the trail to Luang Prabang with Lao porters; the gilt stupa on the hill behind.
const PavieScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.luangprabang} start={start} end={end} sky={["#8aa0c0", "#f4e0b8"]} accent={FR_C}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.22]} far="#6a7a8a" mid="#4a6a4a" ground="#6a5a3a" />
        <Prang x={g.x + g.W * 0.7 + pan * 0.4} y={g.ground - 70 * g.s} h={100 * g.s} s={g.s} gold />
        <Tree x={g.x + g.W * 0.92 + pan * 0.6} y={g.ground - 10 * g.s} s={g.s * 1.2} />
        {[0, 1, 2].map((i) => (
          <Fighter key={i} x={g.x + g.W * (0.12 + i * 0.16 + lt * 0.0012) + pan * 1.0} y={g.ground + 26 * g.s} scale={g.sc * 0.78} mode="walk" costume={i === 2 ? { ...C5.french, jacket: "#d8ccb0", pants: "#8a7a5a", head: "short" } : C5.lao} weapon={i === 2 ? "none" : "spear"} phase={i * 1.4} />
        ))}
        <Grass g={g} shift={pan * 1.6} color="#2f3a24" />
      </g>
    )}
  </V2>
);

// A riverside stockade in the mist: Siamese and French riflemen exchange fire.
const OutpostScene = ({ id, start, end, shots }: { id: string; start: number; end: number; shots: number[] }) => {
  const frame = useCurrentFrame();
  const fl = (n: number) => Math.max(0, ...shots.filter((_, i) => i % 2 === n).map((h) => interpolate(frame - h, [0, 2, 12], [0, 1, 0], clamp)));
  return (
    <V2 id={id} anchor={PL.khammouane} start={start} end={end} sky={["#4a5a6a", "#b0b8a8"]} accent={RED} hits={shots}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.6, 0.25]} lightColor={["#e0e8e0", "#f8fff8"]} far="#5a6a6a" mid="#3a4a3a" ground="#4a4030" mist="#e0e8e0" />
          <Palisade x={g.x + g.W * 0.05 + pan * 0.6} y={g.ground - 4 * g.s} w={g.W * 0.35} s={g.s} />
          <PanelFlag x={g.x + g.W * 0.2 + pan * 0.6} y={g.ground - 66 * g.s} s={g.s} kind="siam" />
          <Fighter x={g.x + g.W * 0.3 + pan * 0.9} y={g.ground + 24 * g.s} scale={g.sc * 0.8} mode="aim" costume={C5.siamArmy} weapon="rifle" flash={fl(0)} />
          <Fighter x={g.x + g.W * 0.75 + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode="aim" costume={C5.french} weapon="rifle" flip flash={fl(1)} />
          <Fighter x={g.x + g.W * 0.88 + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode="walk" costume={C5.french} weapon="rifle" flip phase={2} />
          <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={50 * g.s} fill="#e0e8e0" opacity={0.2} />
          <Grass g={g} shift={pan * 1.6} color="#1f2a18" />
        </g>
      )}
    </V2>
  );
};

// Two French gunboats steam in from the gulf toward the river mouth at dusk.
const ApproachScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.bar} start={start} end={end} sky={["#2a2a4a", "#e08850"]} accent={RED} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Glow x={g.x + g.W * 0.25 + pan * 0.1} y={g.ground - 64 * g.s} s={g.s * 1.2} color="#ff9a4a" core="#ffe0a0" />
        <path d={`M${g.x + g.W * 0.7} ${g.ground - 40 * g.s} q${60 * g.s} ${-30 * g.s} ${g.W * 0.4} ${-20 * g.s} V${g.ground - 40 * g.s} Z`} fill="#3a3a30" transform={`translate(${pan * 0.2},0)`} />
        <Sea g={g} y={g.ground - 40 * g.s} pan={pan} color="#3a4a6a" deep="#1f2840" />
        <Gunboat x={g.x + g.W * (0.12 + lt * 0.0011) + pan * 0.5} y={g.ground - 14 * g.s} s={g.s * 0.5} flag="fr" />
        <Gunboat x={g.x + g.W * (0.36 + lt * 0.0011) + pan * 0.7} y={g.ground + 2 * g.s} s={g.s * 0.66} flag="fr" />
      </g>
    )}
  </V2>
);

// The set piece: Phra Chulachomklao fort fires; the gunboats answer and force their way past through the splashes.
const FortScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.paknam} start={start} end={end} sky={["#3a2a3a", "#d07040"]} accent={RED} hits={HITS} warm={0.1}>
      {(g, pan, lt) => {
        const bx = (base: number) => g.x + g.W * (base - lt * 0.0011) + pan * 0.6;
        const b1: [number, number] = [bx(0.88), g.ground - 18 * g.s];
        const b2: [number, number] = [bx(1.12), g.ground - 6 * g.s];
        const gun: [number, number] = [g.x + g.W * 0.16 + pan * 1.1, g.ground + 10 * g.s];
        return (
          <g>
            <Glow x={g.x + g.W * 0.72 + pan * 0.1} y={g.ground - 80 * g.s} s={g.s * 1.1} color="#ff8a3a" core="#ffd8a0" />
            <Sea g={g} y={g.ground - 44 * g.s} pan={pan} color="#4a4a6a" deep="#22283a" near={false} />
            <Gunboat x={b1[0]} y={b1[1]} s={g.s * 0.62} flag="fr" dir={-1} fire={BOAT_SHOTS.filter((_, i) => i % 2 === 0)} />
            <Gunboat x={b2[0]} y={b2[1]} s={g.s * 0.74} flag="fr" dir={-1} fire={BOAT_SHOTS.filter((_, i) => i % 2 === 1)} />
            {FORT_SHOTS.map((f, i) => <Splash key={f} x={(i % 2 ? b2[0] : b1[0]) + (i % 2 ? -60 : 50) * g.s} y={g.ground - 30 * g.s} s={g.s} at={f + 18} />)}
            {FORT_SHOTS.map((f, i) => {
              const m = muzzle(gun[0] + (i % 2) * 70 * g.s, gun[1] - 40 * g.s, g.s * 1.5);
              return <Shot key={f} from={m} to={[(i % 2 ? b2[0] : b1[0]) + (i % 2 ? -60 : 50) * g.s, g.ground - 30 * g.s]} t={frame - f} s={g.s} />;
            })}
            <path d={`M${g.x - 40 * g.s} ${g.y + g.H} L${g.x - 40 * g.s} ${g.ground - 30 * g.s} L${g.x + g.W * 0.36 + pan * 1.1} ${g.ground - 30 * g.s} L${g.x + g.W * 0.42 + pan * 1.1} ${g.y + g.H} Z`} fill="#8a7a62" stroke={PAL.ink} strokeWidth={2 * g.s} />
            {Array.from({ length: 6 }, (_, i) => <rect key={i} x={g.x + i * g.W * 0.06 + pan * 1.1} y={g.ground - 44 * g.s} width={g.W * 0.04} height={16 * g.s} fill="#8a7a62" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
            <Cannon x={gun[0]} y={gun[1] - 40 * g.s} s={g.s * 1.5} fire={FORT_SHOTS.filter((_, i) => i % 2 === 0)} />
            <Cannon x={gun[0] + 70 * g.s} y={gun[1] - 40 * g.s} s={g.s * 1.5} fire={FORT_SHOTS.filter((_, i) => i % 2 === 1)} />
            <Fighter x={g.x + g.W * 0.06 + pan * 1.3} y={g.ground + 40 * g.s} scale={g.sc * 0.8} mode="stand" costume={C5.siamNavy} weapon="none" />
            <PanelFlag x={g.x + g.W * 0.32 + pan * 1.1} y={g.ground - 44 * g.s} s={g.s * 1.1} kind="siam" />
          </g>
        );
      }}
    </V2>
  );
};

// Anchored in the river before the French legation: the gunboat's gun swings round toward the palace roofs.
const AnchorScene = ({ id, start, end, turn }: { id: string; start: number; end: number; turn: number }) => {
  const frame = useCurrentFrame();
  const beam = interpolate(frame, [turn, turn + 16], [0, 1], clamp);
  return (
    <V2 id={id} anchor={PL.frEmbassy} start={start} end={end} sky={["#1f2440", "#8a5a5a"]} accent={RED} warm={0.05}>
      {(g, pan) => {
        const gx = g.x + g.W * 0.7 + pan * 0.8;
        const gy = g.ground + 10 * g.s;
        const px = g.x + g.W * 0.24 + pan * 0.3;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.85, 0.2]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#2a2f4a" mid="#2a2a3a" ground="#2a2418" mist="#8a90b0" ridges={false} />
            <PalaceRoof x={px} y={g.ground - 40 * g.s} w={g.W * 0.3} s={g.s * 0.8} />
            <River g={g} y={g.ground - 40 * g.s} pan={pan} color="#1f2f4a" night />
            {beam > 0 && <line x1={gx - 100 * g.s} y1={gy - 40 * g.s} x2={gx - 100 * g.s + (px - gx + 100 * g.s) * beam} y2={gy - 40 * g.s + (g.ground - 120 * g.s - gy + 40 * g.s) * beam} stroke="#ff3b30" strokeWidth={3 * g.s} strokeDasharray={`${10 * g.s} ${8 * g.s}`} opacity={0.9} />}
            <Gunboat x={gx} y={gy} s={g.s * 0.75} flag="fr" dir={-1} />
            <path d={`M${g.x - 40 * g.s} ${g.y + g.H} Q${g.x + g.W * 0.5} ${g.ground + 50 * g.s} ${g.x + g.W + 40 * g.s} ${g.y + g.H} Z`} fill="#121a2a" transform={`translate(${pan * 1.6},0)`} />
          </g>
        );
      }}
    </V2>
  );
};

// Blockade: French gunboats strung across the hazy gulf; a British ship far off steams away.
const BlockadeScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={[100.6, 12.8]} start={start} end={end} sky={["#6a7a8a", "#c8c8b8"]} accent={FR_C} warm={0.03}>
    {(g, pan, lt) => (
      <g>
        <Sea g={g} y={g.ground - 60 * g.s} pan={pan} color="#5a6a7a" deep="#33404c" />
        <Gunboat x={g.x + g.W * (0.86 + lt * 0.0008) + pan * 0.2} y={g.ground - 58 * g.s} s={g.s * 0.22} flag="uk" />
        <rect x={g.x} y={g.ground - 80 * g.s} width={g.W} height={40 * g.s} fill="#c8c8b8" opacity={0.35} />
        {[0.2, 0.5, 0.78].map((f, i) => <Gunboat key={f} x={g.x + g.W * f + pan * (0.4 + i * 0.3)} y={g.ground - (30 - i * 18) * g.s} s={g.s * (0.38 + i * 0.12)} flag="fr" dir={i % 2 ? -1 : 1} />)}
      </g>
    )}
  </V2>
);

// A dark sickroom: one lamp, a desk with paper and pen, the mosquito net — no figure drawn.
const SickroomScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.palace} start={start} end={end} sky={["#120e14", "#2a1e1a"]} accent={GOLD} warm={0.08}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1a1412" />
          <g transform={`translate(${pan * 0.2},0)`}>
            <rect x={g.x + g.W * 0.08} y={g.y + 20 * g.s} width={g.W * 0.2} height={g.H * 0.4} fill="#1f2a44" stroke="#4a3a2a" strokeWidth={6 * g.s} />
            <circle cx={g.x + g.W * 0.2} cy={g.y + 50 * g.s} r={14 * g.s} fill="#dfe6ff" opacity={0.8} />
          </g>
          <g transform={`translate(${pan * 0.5},0)`}>
            <path d={`M${g.x + g.W * 0.5} ${g.y + 10 * g.s} L${g.x + g.W * 0.44} ${g.ground} L${g.x + g.W * 0.96} ${g.ground} L${g.x + g.W * 0.9} ${g.y + 10 * g.s} Z`} fill="#e8e4dc" opacity={0.16} stroke="#e8e4dc" strokeOpacity={0.3} />
            {[0.55, 0.65, 0.75, 0.85].map((f) => <line key={f} x1={g.x + g.W * f} y1={g.y + 12 * g.s} x2={g.x + g.W * (f - 0.03)} y2={g.ground} stroke="#e8e4dc" strokeOpacity={0.18} strokeWidth={2 * g.s} />)}
          </g>
          <circle cx={g.x + g.W * 0.32 + pan * 0.8} cy={g.ground - 60 * g.s} r={(110 + Math.sin(frame * 0.1) * 4) * g.s} fill="#ffb060" opacity={0.18} />
          <rect x={g.x + g.W * 0.06 + pan * 0.8} y={g.ground - 20 * g.s} width={g.W * 0.5} height={14 * g.s} fill="#5a3a1f" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          <Manuscript x={g.x + g.W * 0.1 + pan * 0.8} y={g.ground - 22 * g.s} w={150 * g.s} s={g.s} dark={false} />
          <line x1={g.x + g.W * 0.4 + pan * 0.8} y1={g.ground - 24 * g.s} x2={g.x + g.W * 0.46 + pan * 0.8} y2={g.ground - 54 * g.s} stroke="#e8e0c8" strokeWidth={3 * g.s} />
          <Candle x={g.x + g.W * 0.32 + pan * 0.8} y={g.ground - 20 * g.s} s={g.s * 1.4} />
          <rect x={g.x - 40 * g.s} y={g.ground + 30 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#0e0a08" transform={`translate(${pan * 1.6},0)`} />
        </g>
      )}
    </V2>
  );
};

// Treaty signing: French envoy and Siamese minister at a table, pen and sealed document under candles.
const SigningScene = ({ id, start, end, sign }: { id: string; start: number; end: number; sign: number }) => {
  const frame = useCurrentFrame();
  const seal = interpolate(frame, [sign, sign + 8], [0, 1], clamp);
  return (
    <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#3a2414", "#7a4a2a"]} accent={RED} warm={0.1}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#4a2e1c" />
          {[0.2, 0.8].map((f) => <rect key={f} x={g.x + g.W * f - 40 * g.s + pan * 0.2} y={g.y + 10 * g.s} width={80 * g.s} height={g.H * 0.5} fill="#7a2a1a" opacity={0.6} />)}
          <Fighter x={g.x + g.W * 0.26 + pan * 0.6} y={g.ground + 10 * g.s} scale={g.sc * 0.95} mode="stand" costume={C5.official} weapon="none" />
          <Fighter x={g.x + g.W * 0.74 + pan * 0.6} y={g.ground + 10 * g.s} scale={g.sc * 0.95} mode="stand" costume={{ ...C5.french, head: "short" }} weapon="none" flip />
          <rect x={g.x + g.W * 0.08 + pan * 0.9} y={g.ground - 10 * g.s} width={g.W * 0.84} height={60 * g.s} fill="#2a4a3a" stroke={PAL.ink} strokeWidth={1.8 * g.s} />
          <rect x={g.x + g.W * 0.08 + pan * 0.9} y={g.ground - 10 * g.s} width={g.W * 0.84} height={8 * g.s} fill={PAL.gilt} />
          <path d={`M${g.x + g.W * 0.36 + pan * 0.9} ${g.ground - 10 * g.s} l${g.W * 0.04} ${-40 * g.s} h${g.W * 0.22} l${g.W * 0.02} ${40 * g.s} Z`} fill="#f4ecd8" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={g.x + g.W * 0.42 + pan * 0.9} y1={g.ground - (40 - i * 8) * g.s} x2={g.x + g.W * 0.58 + pan * 0.9} y2={g.ground - (40 - i * 8) * g.s} stroke="#7a6a5a" strokeWidth={1.4 * g.s} />)}
          <circle cx={g.x + g.W * 0.58 + pan * 0.9} cy={g.ground - 18 * g.s} r={12 * g.s * seal} fill="#a8322a" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
          <line x1={g.x + g.W * 0.5 + pan * 0.9} y1={g.ground - 20 * g.s} x2={g.x + g.W * 0.55 + pan * 0.9} y2={g.ground - 70 * g.s} stroke="#efe6d0" strokeWidth={3 * g.s} />
          <Candle x={g.x + g.W * 0.08 + pan * 1.4} y={g.ground + 40 * g.s} s={g.s * 1.3} />
          <Candle x={g.x + g.W * 0.92 + pan * 1.4} y={g.ground + 40 * g.s} s={g.s * 1.3} />
        </g>
      )}
    </V2>
  );
};

// Siamese troops march away from the Mekong past a "25 กม." post.
const WithdrawScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={[103.3, 18.0]} start={start} end={end} sky={["#7a8aa8", "#f0d8b0"]} accent={FR_C}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.22]} far="#7a8aa0" mid="#5a6a4a" ground="#7a6a40" />
        <River g={g} y={g.ground - 52 * g.s} pan={pan * 0.5} color="#7a6a4a" />
        <rect x={g.x - 40 * g.s} y={g.ground - 30 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#7a6a40" />
        <g transform={`translate(${g.x + g.W * 0.7 + pan * 0.9},${g.ground + 10 * g.s})`}>
          <rect x={-4 * g.s} y={-80 * g.s} width={8 * g.s} height={80 * g.s} fill="#5a3a1f" />
          <rect x={-46 * g.s} y={-92 * g.s} width={92 * g.s} height={30 * g.s} fill="#f4ecd8" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          <text x={0} y={-70 * g.s} textAnchor="middle" fontSize={20 * g.s} fontWeight={900} fill={PAL.ink} fontFamily={font}>25 กม.</text>
        </g>
        {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + g.W * (0.62 - i * 0.14 - lt * 0.0012) + pan * 1.2} y={g.ground + 34 * g.s} scale={g.sc * 0.8} mode="walk" flip costume={C5.siamArmy} weapon="rifle" phase={i * 1.1} />)}
        <Grass g={g} shift={pan * 1.6} color="#3a4a22" />
      </g>
    )}
  </V2>
);

// The price in silver: an open chest of coins and a balance weighing sacks of money.
const SilverScene = ({ id, start, end, three }: { id: string; start: number; end: number; three: number }) => {
  const frame = useCurrentFrame();
  const tilt = interpolate(frame, [three - 6, three + 14], [6, -14], clamp);
  return (
    <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#2a1e14", "#5a3a22"]} accent={GOLD} warm={0.12}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3a2616" />
          <Glow x={g.x + g.W * 0.5 + pan * 0.1} y={g.y + g.H * 0.18} s={g.s * 0.6} color="#ffcf7a" core="#fff0c8" />
          <rect x={g.x - 40 * g.s} y={g.ground - 14 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#5a3a1f" stroke={PAL.ink} strokeWidth={2 * g.s} />
          <Balance x={g.x + g.W * 0.72 + pan * 0.6} y={g.ground - 14 * g.s} s={g.s * 1.6} tilt={tilt} />
          <g transform={`translate(${g.x + g.W * 0.28 + pan * 0.8},${g.ground - 14 * g.s}) scale(1.6)`}>
            <rect x={-80 * g.s} y={-60 * g.s} width={160 * g.s} height={60 * g.s} fill="#6a3a1a" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <path d={`M${-80 * g.s} ${-60 * g.s} L${-70 * g.s} ${-110 * g.s} L${70 * g.s} ${-110 * g.s} L${80 * g.s} ${-60 * g.s}`} fill="#4a2a12" stroke={PAL.ink} strokeWidth={2 * g.s} />
            {Array.from({ length: 16 }, (_, i) => <ellipse key={i} cx={(-66 + (i % 8) * 19) * g.s} cy={(-62 - Math.floor(i / 8) * 9 - Math.sin(i) * 3) * g.s} rx={10 * g.s} ry={5 * g.s} fill="#d8dce0" stroke={PAL.ink} strokeWidth={1 * g.s} />)}
          </g>
          {Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={g.x + g.W * (0.08 + i * 0.13) + pan * 1.5} cy={g.ground + 44 * g.s} rx={14 * g.s} ry={6 * g.s} fill="#c8ccd0" stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
        </g>
      )}
    </V2>
  );
};

// French soldiers hold Chanthaburi in the rain under the tricolour.
const ChanthaburiScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.chanthaburi} start={start} end={end} sky={["#4a5a6a", "#a0a8a0"]} accent={FR_C} warm={0.03}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={null} far="#5a6a6a" mid="#3a5a3a" ground="#4a4030" mist="#c0c8c0" />
        <House x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 10 * g.s} w={180 * g.s} s={g.s} />
        <Tree x={g.x + g.W * 0.08 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s * 1.1} kind="palm" />
        <PanelFlag x={g.x + g.W * 0.62 + pan * 0.6} y={g.ground - 10 * g.s} s={g.s * 1.4} kind="fr" h={120} />
        <Fighter x={g.x + g.W * 0.52 + pan * 1.0} y={g.ground + 30 * g.s} scale={g.sc * 0.82} mode="stand" costume={C5.french} weapon="rifle" />
        <Fighter x={g.x + g.W * 0.78 + pan * 1.0} y={g.ground + 30 * g.s} scale={g.sc * 0.82} mode="walk" costume={C5.french} weapon="rifle" flip phase={1} />
        <Rain g={g} n={50} opacity={0.35} />
        <Grass g={g} shift={pan * 1.6} color="#2a3a20" />
      </g>
    )}
  </V2>
);

// Ultimatum terms (panel slot card), shown point by point on the spoken word.
const UltimatumCard = () => {
  const rows: [string, number][] = [["① ยกดินแดนฝั่งซ้ายแม่น้ำโขงทั้งหมด", T.left], ["② จ่ายค่าเสียหาย", T.pay], ["③ ตอบภายใน 48 ชั่วโมง", T.hours]];
  const p = rows.map(([, f]) => usePop(f));
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  return (
    <Slot start={T.ult} end={T.block + 10} color={RED} title="คำขาดของฝรั่งเศส · 20 ก.ค. 2436">
      {() => (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 * s, marginTop: 6 * s }}>
          {rows.map(([t], i) => (
            <div key={t} style={{ fontSize: 40 * s, fontWeight: 900, opacity: p[i], transform: `translateX(${(1 - p[i]) * -30 * s}px)`, color: i === 2 ? "#ff6b5f" : "#fff" }}>{t}</div>
          ))}
        </div>
      )}
    </Slot>
  );
};

// Lesson card: ① modern ✓ ② wait for help ✗ → there must be another way.
const LessonCard = () => {
  const a = usePop(T.modern);
  const b = usePop(T.help);
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  return (
    <Slot start={T.lesson} end={END + 12} color={GOLD} title="บทเรียน ร.ศ. 112">
      {() => (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 * s, marginTop: 8 * s }}>
          <div style={{ fontSize: 44 * s, fontWeight: 900, opacity: a }}>① ทันสมัย <span style={{ color: GOLD }}>✓</span> <span style={{ fontSize: 30 * s, opacity: 0.8 }}>แต่ยังไม่พอ</span></div>
          <div style={{ fontSize: 44 * s, fontWeight: 900, opacity: b }}>รอให้ใครมาช่วย <span style={{ color: "#ff6b5f" }}>✗</span></div>
          <div style={{ fontSize: 44 * s, fontWeight: 900, opacity: b, color: GOLD }}>② ต้องมีอีกทาง ?</div>
        </div>
      )}
    </Slot>
  );
};

const BASE: [AreaId, string, number][] = [["thai", SIAM_C, 1], ["burma", BRIT_C, 1], ["malayaSouth", BRIT_C, 1], ["vietnam", FR_C, 1], ["cambodia", FR_C, 1], ["bsr", SIAM_C, 1]];

export const e5c4: Chapter5 = {
  name: "วิกฤต ร.ศ. 112",
  from: FROM,
  to: END,
  cams: (w, h) => [
    { frame: FROM, cam: view(VW.midMekong, w, h, 0.9, 0.08) },
    { frame: T.pavie, cam: view(VW.mekong, w, h, 0.9, 0.08) },
    { frame: T.clash, cam: view(VW.midMekong, w, h, 0.9, 0.08) },
    { frame: T.boats, cam: view(VW.bkkGulf, w, h, 0.9, 0.08) },
    { frame: T.force, cam: view(VW.mouth, w, h, 0.92, 0.08) },
    { frame: T.fort, cam: view(FORT_VIEW, w, h, 0.95, 0.12) },
    { frame: T.dead, cam: view(FORT_VIEW, w, h, 0.95, 0.12) },
    { frame: T.through, cam: view(VW.river, w, h, 0.92, 0.08) },
    { frame: T.anchor, cam: view(VW.bkk, w, h, 0.9, 0.08) },
    { frame: T.ult, cam: view(VW.bkk, w, h, 0.9, 0.08) },
    { frame: T.left, cam: view(VW.mekong, w, h, 0.9, 0.08) },
    { frame: T.block, cam: view(VW.bkkGulf, w, h, 0.9, 0.08) },
    { frame: T.ill, cam: view(VW.bkkGulf, w, h, 0.95, 0.08) },
    { frame: T.treaty, cam: view(VW.mekong, w, h, 0.9, 0.08) },
    { frame: T.ban, cam: view(VW.midMekong, w, h, 0.9, 0.08) },
    { frame: T.fine, cam: view(VW.mekong, w, h, 0.85, 0.08) },
    { frame: T.chan, cam: view(VW.east, w, h, 0.9, 0.08) },
    { frame: T.lesson, cam: view(VW.siam, w, h, 0.85, 0.08) },
  ],
  years: [[FROM, "2436"]],
  heads: [
    { f: FROM + 4, tag: "ฝรั่งเศสอ้าง", head: "ลาวฝั่งซ้ายแม่น้ำโขง", color: FR_C },
    { f: T.pavie, tag: "กงสุลฝรั่งเศสที่หลวงพระบาง", head: "โอกุสต์ ปาวี", color: FR_C, portrait: "pavie", photo: "ภาพถ่าย" },
    { f: T.clash, tag: "ต้น พ.ศ. 2436", head: "ปะทะริมโขงหลายจุด", color: RED },
    { f: T.boats, tag: "13 ก.ค. 2436", head: "เรือรบฝรั่งเศส 2 ลำ", color: RED },
    { f: T.force, tag: "13 ก.ค. 2436", head: "ฝ่าปากแม่น้ำเจ้าพระยา", color: RED },
    { f: T.fort, tag: "ป้อมพระจุลจอมเกล้า", head: "ยิงสกัดที่ปากน้ำ", color: GOLD },
    { f: T.through, tag: "ทั้งสองฝ่ายมีผู้เสียชีวิต", head: "แต่เรือฝ่าเข้ามาได้", color: RED },
    { f: T.anchor, tag: "ทอดสมอกลางกรุง", head: "หน้าสถานทูตฝรั่งเศส", color: RED },
    { f: T.turn, tag: "ทอดสมอกลางกรุง", head: "ปืนหันใส่พระบรมมหาราชวัง", color: RED },
    {
      f: T.ult,
      tag: "20 ก.ค. 2436",
      head: "คำขาดของฝรั่งเศส",
      color: RED,
      stat: (f) => `${String(Math.max(0, 48 - Math.max(0, Math.floor((f - T.hours) / 4)))).padStart(2, "0")}:00`,
      label: "ชั่วโมง ให้ตอบ",
    },
    { f: T.block, tag: "อังกฤษไม่ช่วย", head: "ฝรั่งเศสปิดอ่าวไทย", color: RED },
    { f: T.ill, tag: "ช่วงวิกฤต", head: "ทรงประชวรหนัก", color: GOLD },
    { f: T.treaty, tag: "3 ต.ค. 2436", head: "ยอมยกดินแดนฝั่งซ้ายแม่น้ำโขง", color: RED },
    { f: T.ban, tag: "ห้ามมีทหาร", head: "เขตฝั่งขวาแม่น้ำโขง", stat: "25 กม.", color: FR_C },
    { f: T.fine, tag: "ค่าปรับ", head: "จ่ายให้ฝรั่งเศส", stat: "2 ล้าน", label: "ฟรังก์", color: RED },
    { f: T.three, tag: "ค่าปรับ + เงินประกัน", head: "วางเงินประกันอีก", stat: "3 ล้าน", label: "ฟรังก์", color: RED },
    { f: T.chan, tag: "ฝรั่งเศสยึดเป็นประกัน", head: "จันทบุรี", stat: (f) => `${Math.round(interpolate(f, [T.until - 10, T.until + 40], [2436, 2448], clamp))}`, label: "พ.ศ.", color: FR_C },
    { f: T.lesson, tag: "วิกฤต ร.ศ. 112", head: "รอให้ใครมาช่วยไม่ได้", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const k = interpolate(frame, [FROM - 10, FROM + 8, END + 2, END + 16], [0, 1, 1, 0], clamp);
    const claim = (0.35 + 0.25 * Math.sin(frame * 0.12)) * (ramp(frame, T.claim, 16, T.boats) + ramp(frame, T.left, 16, T.block));
    const ceded = ramp(frame, T.cede, 20);
    const areas: [AreaId, string, number][] = [
      ...BASE,
      ["laos", SIAM_C, 0.5 * (1 - ceded)],
      ["laos", FR_C, Math.max(claim, ceded)],
      ["sayaboury", SIAM_C, ceded],
      ["champasakRB", SIAM_C, ceded],
    ];
    const b = boatK(frame);
    const p1 = along(R.gunboats, b);
    const p2 = along(R.gunboats, Math.max(0, b - 0.06));
    const showBoats = frame >= T.force - 4 && frame < T.ult + 20;
    return (
      <>
        <Empire areas={areas.map(([id, c, v]) => [id, c, v * k] as [AreaId, string, number])} />
        <Band k={ramp(frame, T.km - 10, 16, T.chan)} />
        {frame >= FROM && frame < T.boats && <PointLabel at={[104.6, 17.9]} text="ฝั่งซ้ายแม่น้ำโขง" start={T.claim + 6} color={FR_C} size={0.8} />}
        <CityDot at={PL.hue} color={FR_C} r={10} start={T.viet} end={T.pavie} />
        <CityDot at={PL.luangprabang} color={FR_C} r={12} start={T.lp - 6} end={T.clash} />
        {frame >= T.pavie && frame < T.clash && <PointLabel at={PL.luangprabang} text="หลวงพระบาง" start={T.lp} color={FR_C} size={0.8} />}
        {[PL.khammouane, [105.86, 13.95], [104.75, 16.55]].map((c, i) => (
          <Ring key={i} at={c as [number, number]} r={0.25} color={RED} start={T.fight + i * 10} end={T.boats} />
        ))}
        {frame >= T.clash && frame < T.boats && <PointLabel at={[105.3, 15.6]} text="จุดปะทะ (แนวโดยประมาณ)" start={T.points} color={RED} size={0.7} />}
        <CityDot at={PL.paknam} color={GOLD} r={12} start={T.force} end={T.anchor} />
        {frame >= T.force && frame < T.through && <PointLabel at={PL.paknam} text="ป้อมพระจุลจอมเกล้า" start={T.fort} color={GOLD} size={0.8} />}
        <MapFlash at={PL.paknam} hits={FORT_SHOTS} />
        {showBoats && <BoatGlyph at={p2.at} heading={p2.heading} color={FR_C} size={1.4} />}
        {showBoats && <BoatGlyph at={p1.at} heading={p1.heading} color={FR_C} size={1.4} />}
        <CityDot at={PL.palace} color={GOLD} r={12} start={T.anchor} end={T.ult + 20} />
        {frame >= T.anchor && frame < T.ult + 20 && <PointLabel at={PL.palace} text="พระบรมมหาราชวัง" start={T.palace} color={GOLD} size={0.8} />}
        <MapLine a={PL.frEmbassy} b={PL.palace} start={T.turn} end={T.ult + 10} color={RED} width={5} />
        <Ring at={PL.palace} r={0.006} color={RED} start={T.palace} end={T.ult + 10} />
        {R.blockade.slice(1).map((p, i) => <MapLine key={i} a={R.blockade[i]} b={p} start={T.close + i * 6} end={T.treaty} color={FR_C} width={6} dash={false} />)}
        {frame >= T.close - 10 && frame < T.treaty + 10 && R.blockade.map((p, i) => <BoatGlyph key={i} at={p} heading={0} color={FR_C} size={0.7} />)}
        {frame >= T.uk && frame < T.close && <BoatGlyph at={[interpolate(frame, [T.no, T.close], [100.1, 98.9], clamp), 11.6]} heading={180} color={BRIT_C} size={0.7} />}
        {frame >= T.treaty && frame < T.chan && <PointLabel at={[103.6, 19.2]} text="แนวโดยประมาณ" start={T.cede + 10} color="#fff" size={0.6} />}
        <MapFlag at={PL.chanthaburi} color={FR_C} start={T.seize} end={END} />
        {frame >= T.chan && <PointLabel at={PL.chanthaburi} text="จันทบุรี" start={T.seize + 6} color={FR_C} size={0.8} />}
      </>
    );
  },
  Panels: () => (
    <>
      <MekongScene id="e5c4mekong" start={FROM} end={T.pavie + 14} />
      <PavieScene id="e5c4pavie" start={T.pavie} end={T.clash + 14} />
      <OutpostScene id="e5c4outpost" start={T.clash} end={T.boats + 14} shots={[T.fight, T.fight + 14, T.fight + 30, T.points]} />
      <ApproachScene id="e5c4approach" start={T.boats} end={T.fort + 14} />
      <FortScene id="e5c4fort" start={T.fort} end={T.aim + 14} />
      <AnchorScene id="e5c4anchor" start={T.aim} end={T.ult + 14} turn={T.turn} />
      <BlockadeScene id="e5c4block" start={T.block} end={T.ill + 14} />
      <SickroomScene id="e5c4sick" start={T.ill} end={T.treaty + 14} />
      <SigningScene id="e5c4sign" start={T.treaty} end={T.ban + 14} sign={T.sign} />
      <WithdrawScene id="e5c4withdraw" start={T.ban} end={T.fine + 14} />
      <SilverScene id="e5c4silver" start={T.fine} end={T.chan + 14} three={T.three} />
      <ChanthaburiScene id="e5c4chan" start={T.chan} end={T.lesson + 14} />
    </>
  ),
  Screen: () => (
    <>
      <UltimatumCard />
      <LessonCard />
    </>
  ),
  sfx: [
    [T.claim, SFX.whoosh, 0.25],
    [T.demand, SFX.hit, 0.35],
    [T.left, SFX.pop, 0.25],
    [T.pay, SFX.pop, 0.25],
    [T.hours, SFX.pop, 0.3],
    [T.cede, SFX.whoosh, 0.3],
    [T.two, SFX.pop, 0.3],
    [T.three, SFX.pop, 0.3],
    [T.modern, SFX.pop, 0.3],
    [T.help, SFX.pop, 0.3],
  ],
  Audio: () => (
    <>
      <Bed id="jungle_rain" from={FROM} to={T.clash} volume={0.14} voice={VOICE} />
      <Bed id="wind" from={T.clash} to={T.boats + 10} volume={0.16} voice={VOICE} />
      {[T.fight, T.fight + 14, T.fight + 30, T.points].map((f, i) => <Hit key={f} id={i % 2 ? "rifle_echo" : "rifle_ww1"} at={f} volume={0.4} />)}
      <Bed id="sea_rough" from={T.boats} to={T.aim + 10} volume={0.22} voice={VOICE} />
      <Hit id="ship_bell" at={T.warship} volume={0.35} />
      {FORT_SHOTS.map((f) => <Hit key={`c${f}`} id="cannon" at={f} volume={0.6} />)}
      {BOAT_SHOTS.map((f) => <Hit key={`b${f}`} id="cannon_heavy" at={f} volume={0.55} />)}
      {FORT_SHOTS.map((f) => <Hit key={`s${f}`} id="splash_big" at={f + 18} volume={0.4} />)}
      <Bed id="ship_creak" from={T.aim} to={T.ult + 10} volume={0.2} voice={VOICE} />
      <Hit id="ship_bell" at={T.anchor} volume={0.35} />
      <Hit id="wood_hit" at={T.turn} volume={0.3} />
      <Hit id="war_drums" at={T.demand} volume={0.35} />
      <Bed id="sea_rough" from={T.block} to={T.ill + 10} volume={0.2} voice={VOICE} />
      <Hit id="cannon_far" at={T.close} volume={0.4} />
      <Bed id="rain_light" from={T.ill} to={T.treaty + 10} volume={0.2} voice={VOICE} />
      <Hit id="thunder_rumble" at={T.poem} volume={0.25} />
      <Bed id="fire_crackle" from={T.treaty} to={T.ban + 10} volume={0.12} voice={VOICE} />
      <Hit id="wood_hit" at={T.sign + 4} volume={0.35} />
      <Bed id="wind" from={T.ban} to={T.fine + 10} volume={0.15} voice={VOICE} />
      <Hit id="army_marching" at={T.ban + 6} volume={0.3} />
      <Hit id="gong" at={T.two} volume={0.3} />
      <Hit id="gong" at={T.three} volume={0.35} />
      <Bed id="rain_light" from={T.chan} to={T.lesson + 10} volume={0.22} voice={VOICE} />
      <Hit id="whistle_officer" at={T.seize} volume={0.3} />
      <Bed id="wind" from={T.lesson} to={END + 14} volume={0.16} voice={VOICE} />
    </>
  ),
};
