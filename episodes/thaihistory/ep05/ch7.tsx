import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { Banner, Fighter, Glow, Grass } from "../../../components/Scene";
import { clamp, GOLD, RED, view } from "../news/kit";
import { Rain, Torch } from "../ep04/ch3_kit";
import { Parasol } from "../ep04/ch1_kit";
import { Backdrop, Hall, House, Manuscript, Noble, PAL, Tree, V2 } from "../ep04/v2";
import { B, BRIT_C, CityDot, Empire, FR_C, MapFlag, ramp, Ring, SIAM_C, VOICE, wp, type Chapter5 } from "./beatsKit";
import { C5, Colonnade, PanelFlag } from "./kit5";
import { Bed, Hit, SFX } from "./mix";
import { PL, VW } from "./places";

// Chapter 7 (inside → nation): the price paid at home — centralisation, the 1901–02 revolts, 1905 laws, a new state.
const T = {
  from: B.inside.start,
  merge: wp("inside", "รวม", 0.35),
  bkk: wp("inside", "กรุงเทพ", 0.45),
  angry: wp("inside", "พอใจ", 0.9),
  rev: B.revolts.start,
  holy: wp("revolts", "ผีบุญ", 0.45),
  shan: wp("revolts", "เงี้ยว", 0.6),
  troops: wp("revolts", "ทหาร", 0.8),
  draft: B.draft.start,
  slave: wp("draft", "เลิก", 0.35),
  law: wp("draft", "เกณฑ์", 0.6),
  nation: B.nation.start,
  border: wp("nation", "เขตแดน", 0.45),
  govt: wp("nation", "รัฐบาล", 0.6),
  every: wp("nation", "ทุก", 0.88),
};
const END = B.answer.start;

// Provincial towns: local rulers' seats that become seats of Bangkok's commissioners (approximate points).
const TOWNS: [number, number][] = [
  [98.99, 18.79], // Chiang Mai
  [100.14, 18.14], // Phrae
  [100.26, 16.82], // Phitsanulok
  [102.79, 17.41], // Udon
  [103.65, 16.05], // Roi Et
  [104.85, 15.24], // Ubon
  [102.1, 14.97], // Nakhon Ratchasima
  [101.37, 14.05], // Prachinburi
  [102.1, 12.61], // Chanthaburi
  [99.81, 13.54], // Ratchaburi
  [99.18, 10.49], // Chumphon
  [99.96, 8.43], // Nakhon Si Thammarat
  [98.39, 7.88], // Phuket
  [101.25, 6.87], // Pattani
  [100.12, 15.7], // Nakhon Sawan
];

// The final colonial picture, shared by chapters 7–8.
export const FinalEmpire = ({ k, thai = 1 }: { k: number; thai?: number }) => (
  <Empire areas={[["thai", SIAM_C, k * thai], ["burma", BRIT_C, k], ["malaysia", BRIT_C, k], ["vietnam", FR_C, k], ["cambodia", FR_C, k], ["laos", FR_C, k]]} />
);

// Telegraph-style wires from Bangkok to every provincial seat, drawn one after another from `start`.
const Wires = ({ start, gap = 3, pulse = 1e9 }: { start: number; gap?: number; pulse?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const c = projection(PL.bkk);
  if (!c || frame < start) return null;
  return (
    <g>
      {TOWNS.map((t, i) => {
        const p = projection(t);
        if (!p) return null;
        const k = interpolate(frame, [start + i * gap, start + i * gap + 14], [0, 1], clamp);
        if (k <= 0) return null;
        const ex = c[0] + (p[0] - c[0]) * k;
        const ey = c[1] + (p[1] - c[1]) * k;
        const pk = frame >= pulse ? ((frame - pulse + i * 4) % 40) / 40 : -1;
        return (
          <g key={i}>
            <line x1={c[0]} y1={c[1]} x2={ex} y2={ey} stroke={GOLD} strokeWidth={8 * s} strokeOpacity={0.25} />
            <line x1={c[0]} y1={c[1]} x2={ex} y2={ey} stroke="#fff3c0" strokeWidth={2.4 * s} strokeDasharray={`${10 * s} ${6 * s}`} />
            {pk >= 0 && <circle cx={c[0] + (p[0] - c[0]) * pk} cy={c[1] + (p[1] - c[1]) * pk} r={6 * s} fill="#fff3c0" />}
            <circle cx={p[0]} cy={p[1]} r={6 * s * k} fill={GOLD} stroke="#fff" strokeWidth={2 * s} />
          </g>
        );
      })}
    </g>
  );
};

// A hard, bright national border on top of Thailand (the "line" world).
const HardBorder = ({ k }: { k: number }) => (k > 0 ? <Empire areas={[["thai", "#fff3c0", k]]} pulse={false} /> : null);

// A local lord under a parasol receives his people in a provincial hall (before centralisation).
const LordScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.ubon} start={start} end={end} sky={["#6a4a3a", "#e8b070"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.3]} lightColor={["#ffb070", "#ffe8c0"]} far="#7a6a6a" mid="#5a5a40" ground="#6b5236" mist="#f3d0a0" />
        <Tree x={g.x + g.W * 0.06 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s * 0.9} kind="palm" />
        <Hall x={g.x + g.W * 0.62 + pan * 0.5} y={g.ground - 14 * g.s} w={g.W * 0.42} s={g.s} glow={0.4} />
        <Parasol x={g.x + g.W * 0.62 + pan * 0.7} y={g.ground - 10 * g.s} s={g.s * 0.8} />
        <Noble x={g.x + g.W * 0.62 + pan * 0.7} y={g.ground - 8 * g.s} scale={g.sc * 0.62} mode="sit" jacket="#c9a24a" />
        {[0, 1, 2, 3].map((i) => <Noble key={i} x={g.x + g.W * (0.14 + i * 0.1) + pan * 1.0} y={g.ground + 4 * g.s} scale={g.sc * 0.6} mode="kneel" phase={i} bow={0.4} jacket={i % 2 ? "#8a7a5a" : "#a88a5a"} />)}
        <Grass g={g} shift={pan * 1.6} color="#3a3a1a" />
      </g>
    )}
  </V2>
);

// A Bangkok commissioner arrives at the new monthon office: Siamese flag, uniformed escort, the old lord steps aside.
const CommissionerScene = ({ id, start, end, hits }: { id: string; start: number; end: number; hits: number[] }) => (
  <V2 id={id} anchor={PL.ubon} start={start} end={end} sky={["#7aa0c8", "#f0dcb0"]} accent={GOLD} hits={hits} warm={0.08}>
    {(g, pan, lt) => {
      const walk = interpolate(lt, [0, end - start], [0, 110], clamp) * g.s;
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.2, 0.25]} lightColor={["#fff0c0", "#ffffff"]} far="#8a9aa8" mid="#6a7a5a" ground="#7a6040" mist="#f4e8c8" />
          <Colonnade x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground - 12 * g.s} w={g.W * 0.4} s={g.s * 0.9} sign="ศาลาว่าการมณฑล" />
          <PanelFlag x={g.x + g.W * 0.46 + pan * 0.6} y={g.ground - 8 * g.s} s={g.s * 1.2} kind="siam" h={150} w={60} />
          <Noble x={g.x + g.W * 0.92 + pan * 0.7} y={g.ground + 2 * g.s} scale={g.sc * 0.58} mode="kneel" jacket="#c9a24a" bow={0.3} flip />
          {[0, 1, 2].map((i) => (
            <Fighter key={i} x={g.x + g.W * (0.04 + i * 0.09) + walk + pan * 0.9} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode="walk" costume={i === 0 ? C5.official : C5.siamArmy} weapon={i === 0 ? "none" : "rifle"} phase={i * 1.3} />
          ))}
          <Grass g={g} shift={pan * 1.6} color="#4a4a24" />
        </g>
      );
    }}
  </V2>
);

// Night gathering of villagers with torches around a man in white — the Holy Man revolt (approximate, no likeness).
const HolyManScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.ubon} start={start} end={end} sky={["#0e1226", "#3a2430"]} accent={RED} warm={0.05}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.2]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#1f2440" mid="#262a30" ground="#1e1a14" mist="#8a90b0" />
        <Tree x={g.x + g.W * 0.9 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s} />
        <Tree x={g.x + g.W * 0.1 + pan * 0.5} y={g.ground - 14 * g.s} s={g.s * 0.8} kind="palm" />
        <Glow x={g.x + g.W * 0.5 + pan * 0.6} y={g.ground - 70 * g.s} s={g.s * 0.6} color="#ffd38a" core="#fff2c0" />
        <Fighter x={g.x + g.W * 0.5 + pan * 0.6} y={g.ground - 6 * g.s} scale={g.sc * 0.7} mode="stand" costume={{ jacket: "#f4f2ea", sash: "#e8dcc0", pants: "#f4f2ea", head: "short" }} weapon="none" />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const side = i < 3 ? -1 : 1;
          const x = g.x + g.W * (0.5 + side * (0.14 + (i % 3) * 0.1)) + pan * 1.0;
          return (
            <g key={i}>
              <Fighter x={x} y={g.ground + 8 * g.s} scale={g.sc * 0.66} mode="stand" flip={side > 0} costume={C5.villager} weapon={i % 2 ? "spear" : "none"} phase={i * 0.8} />
              {i % 2 === 0 && <Torch x={x - side * 18 * g.s} y={g.ground - 30 * g.s} s={g.s} seed={i} />}
            </g>
          );
        })}
        <Grass g={g} shift={pan * 1.6} color="#10140c" />
      </g>
    )}
  </V2>
);

// Government troops march through monsoon rain along a paddy dyke.
const RainMarchScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.phrae} start={start} end={end} sky={["#3a4250", "#6a7480"]} accent={RED} warm={0.03}>
    {(g, pan, lt) => {
      const span = g.W / g.s + 200;
      return (
        <g>
          <Backdrop g={g} pan={pan} light={null} far="#4a5260" mid="#3e4a40" ground="#4a4030" mist="#b0b8c0" />
          <rect x={g.x - 60 * g.s} y={g.ground + 12 * g.s} width={g.W + 120 * g.s} height={g.H} fill="#5a6a70" opacity={0.6} />
          {Array.from({ length: 6 }, (_, i) => (
            <Fighter key={i} x={g.x + (((i * 110 + lt * 1.1) % span) - 100) * g.s + pan * 0.8} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode="walk" costume={C5.siamArmy} weapon="rifle" phase={i * 0.9} />
          ))}
          <Rain g={g} n={70} slant={0.3} opacity={0.5} />
          <Grass g={g} shift={pan * 1.6} color="#2a3420" />
        </g>
      );
    }}
  </V2>
);

// Morning in a village yard: people walk out of the old master's compound as free people (1905 act).
const FreedomScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#f0b880", "#fff0d0"]} accent={GOLD} warm={0.14}>
    {(g, pan, lt) => {
      const walk = interpolate(lt, [0, end - start], [0, 140], clamp) * g.s;
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.85, 0.35]} lightColor={["#ffc080", "#fff2d0"]} far="#9a8a8a" mid="#6a7a50" ground="#7a6040" mist="#fff0c8" />
          <House x={g.x + g.W * 0.14 + pan * 0.5} y={g.ground - 14 * g.s} w={g.W * 0.26} s={g.s} />
          <rect x={g.x + g.W * 0.32 + pan * 0.5} y={g.ground - 74 * g.s} width={12 * g.s} height={62 * g.s} fill="#6a4a2a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
          <rect x={g.x + g.W * 0.4 + pan * 0.5} y={g.ground - 74 * g.s} width={12 * g.s} height={62 * g.s} fill="#6a4a2a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
          {[0, 1, 2].map((i) => (
            <Fighter key={i} x={g.x + g.W * (0.3 + i * 0.1) + walk + pan * 0.9} y={g.ground + 4 * g.s} scale={g.sc * (0.64 - i * 0.04)} mode="walk" costume={C5.villager} weapon="none" phase={i * 1.7} />
          ))}
          <Tree x={g.x + g.W * 0.92 + pan * 0.7} y={g.ground - 6 * g.s} s={g.s} />
          <Grass g={g} shift={pan * 1.6} color="#4a5a24" />
        </g>
      );
    }}
  </V2>
);

// Recruitment under a big village tree: an officer with a ledger at a table, young men walking up in a line.
const ConscriptScene = ({ id, start, end, hits }: { id: string; start: number; end: number; hits: number[] }) => (
  <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#8ab0d0", "#f4e8c8"]} accent={GOLD} hits={hits} warm={0.08}>
    {(g, pan, lt) => {
      const walk = interpolate(lt, [0, end - start], [0, 90], clamp) * g.s;
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.15, 0.25]} lightColor={["#fff0c0", "#ffffff"]} far="#8a9aa8" mid="#7a8a5a" ground="#8a7050" mist="#f4e8c8" />
          <Tree x={g.x + g.W * 0.78 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s * 1.6} />
          <Banner x={g.x + g.W * 0.95 + pan * 0.6} y={g.ground - 6 * g.s} s={g.s} color="#c9302c" />
          <rect x={g.x + g.W * 0.62 + pan * 0.7} y={g.ground - 44 * g.s} width={120 * g.s} height={12 * g.s} fill="#6a3a1a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          <rect x={g.x + g.W * 0.62 + 8 * g.s + pan * 0.7} y={g.ground - 32 * g.s} width={8 * g.s} height={32 * g.s} fill="#4a2a12" />
          <rect x={g.x + g.W * 0.62 + 104 * g.s + pan * 0.7} y={g.ground - 32 * g.s} width={8 * g.s} height={32 * g.s} fill="#4a2a12" />
          <Manuscript x={g.x + g.W * 0.62 + 20 * g.s + pan * 0.7} y={g.ground - 46 * g.s} w={80 * g.s} s={g.s} lines={3} dark={false} />
          <Fighter x={g.x + g.W * 0.74 + pan * 0.7} y={g.ground - 6 * g.s} scale={g.sc * 0.62} mode="stand" flip costume={C5.siamArmy} weapon="none" />
          {Array.from({ length: 5 }, (_, i) => (
            <Fighter key={i} x={g.x + g.W * (0.04 + i * 0.1) + walk + pan * 1.0} y={g.ground + 8 * g.s} scale={g.sc * 0.62} mode="walk" costume={C5.villager} weapon="none" phase={i * 1.1} />
          ))}
          <Grass g={g} shift={pan * 1.6} color="#5a5a2a" />
        </g>
      );
    }}
  </V2>
);

// A village school sala: children sit before a teacher while the national flag goes up the pole — one country.
const SchoolFlagScene = ({ id, start, end, hits }: { id: string; start: number; end: number; hits: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.korat} start={start} end={end} sky={["#f0a868", "#ffeccc"]} accent={GOLD} hits={hits} warm={0.12}>
      {(g, pan) => {
        const rise = interpolate(frame, [start, hits[0] ?? start + 60], [0, 1], clamp);
        const px = g.x + g.W * 0.86 + pan * 0.6;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.6, 0.36]} lightColor={["#ffb070", "#fff0d0"]} far="#8a7a8a" mid="#6a7048" ground="#7a6242" mist="#ffe0b0" />
            <Tree x={g.x + g.W * 0.06 + pan * 0.5} y={g.ground - 12 * g.s} s={g.s} kind="palm" />
            <Hall x={g.x + g.W * 0.42 + pan * 0.5} y={g.ground - 14 * g.s} w={g.W * 0.5} s={g.s} roof="#8a5a2a" glow={0.2} />
            <line x1={px} y1={g.ground} x2={px} y2={g.ground - 210 * g.s} stroke="#e8e2d0" strokeWidth={4 * g.s} />
            <PanelFlag x={px} y={g.ground - (70 + rise * 110) * g.s} s={g.s * 1.1} kind="siam" h={40} w={60} />
            <Fighter x={g.x + g.W * 0.7 + pan * 0.8} y={g.ground + 6 * g.s} scale={g.sc * 0.62} mode="stand" flip costume={C5.official} weapon="none" />
            {[0, 1, 2, 3, 4, 5].map((i) => <Noble key={i} x={g.x + g.W * (0.12 + i * 0.09) + pan * 1.1} y={g.ground + 20 * g.s} scale={g.sc * 0.46} mode="sit" phase={i} jacket={i % 2 ? "#f4f2ea" : "#d8c8a0"} />)}
            <Grass g={g} shift={pan * 1.6} color="#4a4a20" />
          </g>
        );
      }}
    </V2>
  );
};

export const e5c7: Chapter5 = {
  name: "ราคาในบ้าน",
  from: T.from,
  to: END,
  cams: (w, h) => [
    { frame: T.from, cam: view(VW.siam, w, h, 0.85, 0.08) },
    { frame: T.rev, cam: view(VW.siam, w, h, 0.88, 0.08) },
    { frame: T.holy, cam: view(VW.northeast, w, h, 0.85, 0.08) },
    { frame: T.draft, cam: view(VW.northeast, w, h, 0.88, 0.08) },
    { frame: T.draft + 40, cam: view(VW.siam, w, h, 0.85, 0.08) },
    { frame: T.nation + 20, cam: view(VW.siam, w, h, 0.9, 0.08) },
  ],
  years: [[T.from, "2444"], [T.draft, "2448"]],
  heads: [
    { f: T.from, tag: "ราคาไม่ได้จ่ายแค่ที่ชายแดน", head: "รวมอำนาจเข้ากรุงเทพฯ", color: GOLD },
    { f: T.angry, tag: "เจ้าเมืองและคนท้องถิ่น", head: "หลายแห่งไม่พอใจ", color: RED },
    { f: T.rev, tag: "พ.ศ. 2444–2445", head: "กบฏในหัวเมือง", color: RED, chips: [{ text: "กบฏผีบุญ · อีสาน", f: T.holy }, { text: "กบฏเงี้ยว · แพร่", f: T.shan }] },
    { f: T.troops, tag: "รัฐบาลส่งทหาร", head: "ไปปราบทั้งสองแห่ง", color: RED },
    { f: T.draft, tag: "พ.ศ. 2448", head: "สองกฎหมายในปีเดียว", color: GOLD, chips: [{ text: "เลิกทาส", f: T.slave }, { text: "เกณฑ์ทหาร", f: T.law }] },
    { f: T.nation, tag: "ประเทศแบบใหม่", head: "เส้นชัด รัฐบาลเดียว", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const ek = ramp(frame, T.from - 15, 15, END + 10);
    const border = ramp(frame, T.border, 16, END + 10);
    const fadeOut = interpolate(frame, [T.draft, T.draft + 15], [1, 0], clamp);
    return (
      <>
        <FinalEmpire k={ek} />
        <HardBorder k={border} />
        {TOWNS.map((t, i) => <CityDot key={`l${i}`} at={t} color={GOLD} r={7} start={T.from + i * 2} end={T.merge + i * 2} />)}
        {TOWNS.map((t, i) => <MapFlag key={`c${i}`} at={t} color="#c9302c" start={T.bkk + i * 3} end={T.rev} size={0.45} />)}
        <CityDot at={PL.bkk} color={GOLD} r={14} start={T.from} />
        <Ring at={PL.ubon} r={0.6} color={RED} start={T.holy} end={T.draft} />
        <Ring at={PL.phrae} r={0.5} color={RED} start={T.shan} end={T.draft} />
        {frame >= T.holy && frame < T.draft + 10 && <PointLabel at={PL.ubon} text="กบฏผีบุญ (ประมาณ)" start={T.holy} color={RED} size={0.7} />}
        {frame >= T.shan && frame < T.draft + 10 && <PointLabel at={PL.phrae} text="กบฏเงี้ยว · แพร่" start={T.shan} color={RED} size={0.7} />}
        <Arrow points={[PL.bkk, [102.1, 14.97], [103.9, 15.2], PL.ubon]} start={T.troops} end={T.troops + 30} color={GOLD} width={12} variant="dashed" opacity={fadeOut} />
        <Arrow points={[PL.bkk, [100.3, 15.4], [100.1, 17.0], PL.phrae]} start={T.troops + 6} end={T.troops + 36} color={GOLD} width={12} variant="dashed" opacity={fadeOut} />
        <Wires start={T.govt} gap={3} pulse={T.every} />
      </>
    );
  },
  Panels: () => (
    <>
      <LordScene id="e5c7lord" start={T.from - 4} end={T.merge + 14} />
      <CommissionerScene id="e5c7comm" start={T.merge} end={T.rev + 14} hits={[T.bkk]} />
      <HolyManScene id="e5c7holy" start={T.rev} end={T.troops + 14} />
      <RainMarchScene id="e5c7rain" start={T.troops} end={T.draft + 14} />
      <FreedomScene id="e5c7free" start={T.draft} end={T.law + 14} />
      <ConscriptScene id="e5c7draft" start={T.law} end={T.nation + 14} hits={[T.law + 6]} />
      <SchoolFlagScene id="e5c7school" start={T.nation} end={END + 14} hits={[T.govt]} />
    </>
  ),
  sfx: [
    [T.angry, SFX.pop, 0.25],
    [T.holy, SFX.pop, 0.3],
    [T.shan, SFX.pop, 0.3],
    [T.slave, SFX.pop, 0.3],
    [T.law, SFX.pop, 0.3],
    [T.border, SFX.whoosh, 0.25],
  ],
  Audio: () => (
    <>
      <Bed id="wind" from={T.from - 6} to={T.merge + 10} volume={0.15} voice={VOICE} />
      <Hit id="gong" at={T.from + 6} volume={0.3} />
      <Bed id="city_crowd" from={T.merge} to={T.rev + 10} volume={0.15} voice={VOICE} />
      <Hit id="army_marching" at={T.merge + 4} volume={0.35} />
      <Hit id="whistle_officer" at={T.bkk} volume={0.3} />
      <Bed id="fire_crackle" from={T.rev} to={T.troops + 10} volume={0.2} voice={VOICE} />
      <Hit id="crowd_angry" at={T.holy} volume={0.35} />
      <Hit id="war_drums" at={T.shan} volume={0.3} />
      <Bed id="rain_heavy" from={T.troops - 4} to={T.draft + 12} volume={0.25} voice={VOICE} />
      <Hit id="army_march_crowd" at={T.troops} volume={0.4} />
      <Hit id="thunder_rumble" at={T.troops + 40} volume={0.3} />
      <Bed id="wind" from={T.draft} to={T.law + 10} volume={0.12} voice={VOICE} />
      <Hit id="whistle_officer" at={T.law + 6} volume={0.4} />
      <Bed id="army_marching" from={T.law} to={T.nation + 10} volume={0.18} voice={VOICE} />
      <Bed id="city_crowd" from={T.nation} to={END + 14} volume={0.12} voice={VOICE} />
      <Hit id="gong" at={T.govt} volume={0.35} />
    </>
  ),
};
