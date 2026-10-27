import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { Fighter, Glow, Grass } from "../../../components/Scene";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { Backdrop, House, PAL, River, Tree, V2 } from "../ep04/v2";
import { Birds } from "../ep04/ch3_kit";
import { B, BRIT_C, CityDot, Empire, FR_C, ramp, Ring, SIAM_C, VOICE, wp, type AreaId, type Chapter5 } from "./beatsKit";
import { Slot, usePop } from "./cards";
import { ApproxTag, Chandelier, FlagRow, HandArea, SIAM_OFF, Sparks, SUIT } from "./ch5_kit5";
import { C5, Gunboat, MapTable, PanelFlag, Sea } from "./kit5";
import { Bed, Hit, SFX } from "./mix";
import { PL, R, VW } from "./places";
import { bbox } from "../../../components/Region";

// Voyage legs kept narrow so the 9:16 frame never reaches the polar edge of the imagery.
const LEG_A = bbox([[62.0, -4.0], [106.0, 26.0]]);
const LEG_B = bbox([[18.0, 8.0], [66.0, 46.0]]);

// Chapter 5 (collide → factor2): after 1893 Britain fears a shared border; the 1896 declaration guarantees the
// Chao Phraya basin; Siam becomes a buffer; the 1897 voyage to Europe; survival factor ② diplomacy.
const FROM = B.collide.start;
const TO = B.y1904.start;
const T = {
  brit: wp("collide", "อังกฤษ", 0.2),
  fr: wp("collide", "ฝรั่งเศส", 0.4),
  border: wp("collide", "พรมแดน", 0.65),
  clash: wp("collide", "ชน", 0.85),
  decl: B.declaration.start,
  agree: wp("declaration", "ตกลง", 0.5),
  basin: wp("declaration", "ลุ่ม", 0.8),
  buffer: B.buffer.start,
  bufWord: wp("buffer", "กันชน", 0.25),
  core: wp("buffer", "ใจกลาง", 0.45),
  edge: wp("buffer", "ชาย", 0.7),
  europe: B.europe.start,
  sail: wp("europe", "เสด็จ", 0.5),
  eu: wp("europe", "ยุโรป", 0.6),
  courts: B.courts.start,
  tsar: wp("courts", "ซาร์", 0.15),
  powers: wp("courts", "มหาอำนาจ", 0.8),
  equal: B.equal.start,
  eqEu: wp("equal", "ยุโรป", 0.35),
  eqWord: wp("equal", "ทัดเทียม", 0.7),
  notLand: wp("equal", "ไม่ใช่", 0.85),
  f2: B.factor2.start,
  two: wp("factor2", "สอง", 0.3),
  dip: wp("factor2", "ทูต", 0.5),
  shield: wp("factor2", "เกราะ", 0.9),
};

// Chao Phraya basin guaranteed by the Anglo-French declaration of 15 Jan 1896 (approximate outline).
const BASIN: [number, number][] = [[99.2, 19.9], [100.4, 19.7], [101.2, 18.5], [101.4, 16.4], [101.7, 14.4], [101.3, 13.3], [100.6, 13.3], [99.8, 13.4], [99.4, 14.6], [99.1, 16.0], [98.7, 17.6], [98.9, 19.0]];
const CAPS: [keyof typeof PL, string, number][] = [
  ["petersburg", "รัสเซีย", 0],
  ["berlin", "เยอรมนี", 1],
  ["vienna", "ออสเตรีย", 2],
  ["rome", "อิตาลี", 3],
  ["paris", "ฝรั่งเศส", 4],
  ["london", "อังกฤษ", 5],
];
const capF = (i: number) => (i === 0 ? T.tsar : Math.round(T.tsar + 18 + (i - 1) * ((T.powers + 10 - T.tsar - 18) / 4)));

// Gold periphery still open to bargaining (Laos right bank, western Cambodia, northern Malay states).
const EDGE: AreaId[] = ["bsr", "sayaboury", "champasakRB", "kedahPerlis", "kelantan", "terengganu"];

// Across a misty jungle stream: a British picket on one bank, a French one on the other; rifles come up on "ชน".
const StandoffScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const aim = frame >= T.clash - 6;
  return (
    <V2 id={id} anchor={[100.4, 18.6]} start={start} end={end} sky={["#2a3a3a", "#c8b080"]} accent={RED} hits={[T.clash]} warm={0.06}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.5, 0.3]} lightColor={["#ffe0a0", "#fff4d8"]} far="#3a5a4a" mid="#2f4a38" ground="#3a3a22" mist="#d8e0c8" />
          <River g={g} y={g.ground - 18 * g.s} pan={pan} color="#3a5a5a" />
          <Tree x={g.x + g.W * 0.04 + pan * 0.5} y={g.ground - 20 * g.s} s={g.s * 1.2} kind="palm" />
          <Tree x={g.x + g.W * 0.96 + pan * 0.5} y={g.ground - 20 * g.s} s={g.s * 1.2} />
          <PanelFlag x={g.x + g.W * 0.12 + pan * 0.6} y={g.ground - 20 * g.s} s={g.s} kind="uk" h={110} />
          <PanelFlag x={g.x + g.W * 0.86 + pan * 0.6} y={g.ground - 20 * g.s} s={g.s} kind="fr" h={110} />
          {[0, 1].map((i) => (
            <Fighter key={`b${i}`} x={g.x + g.W * (0.2 + i * 0.1) + pan * 0.7} y={g.ground - 4 * g.s + i * 8 * g.s} scale={g.sc * 0.62} mode={aim ? "aim" : "stand"} costume={C5.british} weapon="rifle" phase={i} />
          ))}
          {[0, 1].map((i) => (
            <Fighter key={`f${i}`} x={g.x + g.W * (0.8 - i * 0.1) + pan * 0.7} y={g.ground - 4 * g.s + i * 8 * g.s} scale={g.sc * 0.62} flip mode={aim ? "aim" : "stand"} costume={C5.french} weapon="rifle" phase={i + 2} />
          ))}
          <Grass g={g} shift={pan * 1.6} color="#1f2a16" />
        </g>
      )}
    </V2>
  );
};

// London, 1896: two diplomats sign over a map of Siam under lamplight.
const SigningScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const stamp = interpolate(frame, [T.agree, T.agree + 8], [0, 1], clamp);
  return (
    <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#2a1a12", "#5a3a22"]} accent={GOLD} hits={[T.agree]} warm={0.12}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3a2418" />
          {[0.15, 0.85].map((f) => (
            <g key={f}>
              <rect x={g.x + g.W * f - 50 * g.s + pan * 0.2} y={g.y + 20 * g.s} width={100 * g.s} height={150 * g.s} fill="#1f2a44" stroke="#8a6a30" strokeWidth={4 * g.s} />
              <line x1={g.x + g.W * f + pan * 0.2} y1={g.y + 20 * g.s} x2={g.x + g.W * f + pan * 0.2} y2={g.y + 170 * g.s} stroke="#8a6a30" strokeWidth={3 * g.s} />
            </g>
          ))}
          <Chandelier x={g.x + g.W * 0.5 + pan * 0.3} y={g.y + 50 * g.s} s={g.s} />
          <Fighter x={g.x + g.W * 0.24 + pan * 0.5} y={g.ground - 30 * g.s} scale={g.sc * 0.6} mode="stand" costume={SUIT} weapon="none" />
          <Fighter x={g.x + g.W * 0.76 + pan * 0.5} y={g.ground - 30 * g.s} scale={g.sc * 0.6} flip mode="stand" costume={SUIT} weapon="none" phase={2} />
          <MapTable x={g.x + g.W * 0.5 + pan * 0.8} y={g.ground - 20 * g.s} w={g.W * 0.5} s={g.s} />
          <g opacity={stamp} transform={`translate(${g.x + g.W * 0.5 + pan * 0.8},${g.ground - 52 * g.s}) scale(${1.6 - 0.6 * stamp})`}>
            <circle r={18 * g.s} fill="none" stroke="#a8322a" strokeWidth={4 * g.s} />
            <circle r={8 * g.s} fill="#a8322a" />
          </g>
          <rect x={g.x - 40 * g.s} y={g.ground + 40 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#24160e" transform={`translate(${pan * 1.6},0)`} />
        </g>
      )}
    </V2>
  );
};

// Central plain at peace: rice fields, farmers, a village — far hills carry a British flag left, a French one right.
const BufferFieldsScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const edge = interpolate(frame, [T.edge, T.edge + 20], [0, 1], clamp);
  return (
    <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#6aa0c8", "#f4e0b0"]} accent={GOLD} warm={0.1}>
      {(g, pan, lt) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.5, 0.2]} far="#7a8a9a" mid="#6a8a5a" ground="#7a8a3a" mist="#f4e8c8" />
          <g opacity={0.5 + 0.5 * edge}>
            <PanelFlag x={g.x + g.W * 0.08 + pan * 0.2} y={g.ground - 84 * g.s} s={g.s * 0.7} kind="uk" h={60} />
            <PanelFlag x={g.x + g.W * 0.9 + pan * 0.2} y={g.ground - 84 * g.s} s={g.s * 0.7} kind="fr" h={60} />
          </g>
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={g.x - 40 * g.s} y1={g.ground - (8 - i * 7) * g.s} x2={g.x + g.W + 40 * g.s} y2={g.ground - (8 - i * 7) * g.s} stroke="#a8b84a" strokeWidth={2 * g.s} opacity={0.5} />)}
          <House x={g.x + g.W * 0.55 + pan * 0.5} y={g.ground - 10 * g.s} w={110 * g.s} s={g.s} />
          <Tree x={g.x + g.W * 0.45 + pan * 0.5} y={g.ground - 14 * g.s} s={g.s} kind="palm" />
          <Tree x={g.x + g.W * 0.75 + pan * 0.5} y={g.ground - 14 * g.s} s={g.s} />
          {[0, 1, 2].map((i) => (
            <Fighter key={i} x={g.x + g.W * (0.18 + i * 0.12) + (i === 1 ? lt * 0.6 * g.s : 0) + pan * 0.8} y={g.ground + 16 * g.s} scale={g.sc * 0.52} mode={i === 1 ? "walk" : "stand"} costume={C5.villager} weapon="none" phase={i * 1.7} flip={i === 2} />
          ))}
          <Grass g={g} shift={pan * 1.6} color="#4a5a1e" />
        </g>
      )}
    </V2>
  );
};

// The royal yacht steams west across the morning sea (seen from afar, no royal likeness).
const VoyageScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.colombo} start={start} end={end} sky={["#f0b078", "#a8c8e0"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Glow x={g.x + g.W * 0.2 + pan * 0.1} y={g.ground - 60 * g.s} s={g.s * 1.2} color="#ffc080" core="#fff0d0" />
        <Birds g={g} lt={lt} />
        <Sea g={g} y={g.ground - 46 * g.s} pan={pan} color="#4a7a9a" deep="#2a5070" />
        <Gunboat x={g.x + g.W * 0.92 + pan * 0.3} y={g.ground - 30 * g.s} s={g.s * 0.34} flag="siam" dir={-1} />
        <Gunboat x={g.x + g.W * (0.62 - lt * 0.0008) + pan * 0.5} y={g.ground - 14 * g.s} s={g.s * 0.72} flag="siam" dir={-1} />
      </g>
    )}
  </V2>
);

// A European ballroom, wide: chandeliers, a row of guests standing as equals (small, no faces).
const BallroomScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.paris} start={start} end={end} sky={["#3a2418", "#8a5a30"]} accent={GOLD} warm={0.14}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#5a3a22" />
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((f) => (
          <g key={f}>
            <rect x={g.x + g.W * f - 12 * g.s + pan * 0.2} y={g.y} width={24 * g.s} height={g.H} fill="#e8dcc0" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <rect x={g.x + g.W * f - 18 * g.s + pan * 0.2} y={g.y + 8 * g.s} width={36 * g.s} height={12 * g.s} fill={PAL.gilt} />
          </g>
        ))}
        {[0.2, 0.5, 0.8].map((f) => <Chandelier key={f} x={g.x + g.W * f + pan * 0.4} y={g.y + 40 * g.s} s={g.s * 0.9} />)}
        <rect x={g.x - 40 * g.s} y={g.ground - 30 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#7a4a2a" />
        {Array.from({ length: 7 }, (_, i) => (
          <Fighter key={i} x={g.x + g.W * (0.08 + i * 0.14) + pan * 0.6} y={g.ground - 26 * g.s} scale={g.sc * 0.42} mode="stand" costume={i === 3 ? SIAM_OFF : i % 2 ? SUIT : C5.british} weapon="none" phase={i * 0.9} flip={i > 3} />
        ))}
        <path d={`M${g.x - 40 * g.s} ${g.y + g.H} L${g.x - 40 * g.s} ${g.ground + 30 * g.s} Q${g.x + g.W * 0.5} ${g.ground + 10 * g.s} ${g.x + g.W + 40 * g.s} ${g.ground + 30 * g.s} L${g.x + g.W + 40 * g.s} ${g.y + g.H} Z`} fill="#3a1a12" transform={`translate(${pan * 1.6},0)`} />
      </g>
    )}
  </V2>
);

// Flags of equal height in a harbour wind: Siam among the powers.
const FlagsScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.london} start={start} end={end} sky={["#7aa8d0", "#e8eef4"]} accent={GOLD} warm={0.06}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.2]} far="#8a9ab0" mid="#6a7a8a" ground="#8a8070" mist="#ffffff" ridges={false} />
        <Sea g={g} y={g.ground - 10 * g.s} pan={pan} color="#5a8aa8" deep="#3a6a88" near={false} />
        <FlagRow g={g} y={g.ground + 10 * g.s} pan={pan} colors={[["#f4f2ea", "#2a3f9a", "#c9302c"], ["#1a1a1a", "#c9302c", "#f0c020"], ["#c9302c"], ["#2a3f9a", "#f4f2ea", "#c9302c"], ["#b0262a", "#1f2a6a"]]} />
        <rect x={g.x - 40 * g.s} y={g.ground + 10 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#5a5048" transform={`translate(${pan * 1.6},0)`} />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.2 + i * 0.3) + pan * 1.4} y={g.y + g.H + 4 * g.s} scale={g.sc * 0.7} mode="walk" costume={i === 1 ? SIAM_OFF : SUIT} weapon="none" phase={i} />)}
      </g>
    )}
  </V2>
);

// Card ② การทูต with a shield between red and blue.
const DiplomacyCard = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const k2 = usePop(T.dip);
  const k3 = usePop(T.shield - 6);
  return (
    <Slot start={T.two - 4} end={TO + 10} color={GOLD} title="ทางรอดข้อสอง">
      {() => (
        <div style={{ display: "flex", alignItems: "center", gap: 30 * s, height: "100%", fontFamily: font }}>
          <div style={{ fontSize: 150 * s, fontWeight: 900, color: GOLD, lineHeight: 1 }}>②</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 76 * s, fontWeight: 900, opacity: Math.min(1, k2), transform: `translateY(${(1 - k2) * 20 * s}px)` }}>การทูต</div>
            <div style={{ fontSize: 34 * s, fontWeight: 700, opacity: Math.min(1, k3), marginTop: 6 * s }}>
              <span style={{ color: BRIT_C }}>อังกฤษ</span> ⟷ <span style={{ color: GOLD }}>สยาม</span> ⟷ <span style={{ color: FR_C }}>ฝรั่งเศส</span>
            </div>
            <div style={{ fontSize: 30 * s, opacity: Math.min(1, k3) * 0.9 }}>ใช้ความขัดแย้งของมหาอำนาจเป็นเกราะ</div>
          </div>
          <svg width={150 * s} height={170 * s} viewBox="0 0 150 170" style={{ opacity: Math.min(1, k3), transform: `scale(${0.6 + 0.4 * Math.min(1, k3)})` }}>
            <path d="M75 8 L138 30 Q136 116 75 162 Q14 116 12 30 Z" fill={GOLD} stroke="#fff" strokeWidth={5} />
            <path d="M75 30 L116 44 Q114 104 75 136 Q36 104 34 44 Z" fill="#c9302c" />
          </svg>
        </div>
      )}
    </Slot>
  );
};

export const e5c5: Chapter5 = {
  name: "รัฐกันชน",
  from: FROM,
  to: TO,
  cams: (w, h) => [
    { frame: FROM, cam: view(VW.indochina, w, h, 0.9, 0.08) },
    { frame: T.border, cam: view(VW.siam, w, h, 0.9, 0.08) },
    { frame: T.decl, cam: view(VW.siam, w, h, 0.95, 0.08) },
    { frame: T.basin, cam: view(VW.siam, w, h, 1.15, 0.06) },
    { frame: T.buffer, cam: view(VW.siam, w, h, 1.1, 0.06) },
    { frame: T.edge, cam: view(VW.sea, w, h, 0.9, 0.08) },
    { frame: T.europe + 10, cam: view(VW.sea, w, h, 0.85, 0.08) },
    { frame: T.sail, cam: view(LEG_A, w, h, 0.9, 0.1) },
    { frame: T.eu + 10, cam: view(LEG_B, w, h, 0.9, 0.1) },
    { frame: T.courts, cam: view(LEG_B, w, h, 0.95, 0.1) },
    { frame: T.tsar + 6, cam: view(VW.europe, w, h, 0.9, 0.08) },
    { frame: T.equal + 20, cam: view(VW.europe, w, h, 0.95, 0.08) },
    { frame: T.f2, cam: view(LEG_B, w, h, 0.9, 0.1) },
    { frame: T.f2 + 25, cam: view(LEG_A, w, h, 0.9, 0.1) },
    { frame: T.f2 + 60, cam: view(VW.sea, w, h, 0.88, 0.08) },
    { frame: TO, cam: view(VW.sea, w, h, 0.9, 0.08) },
  ],
  years: [[FROM, "2439"], [T.europe, "2440"]],
  heads: [
    { f: FROM, tag: "หลัง ร.ศ. 112", head: "อังกฤษเริ่มกังวล", color: BRIT_C },
    { f: T.border, tag: "ถ้าสยามหายไป", head: "สองจักรวรรดิชนกันตรง ๆ", color: RED, chips: [{ text: "อังกฤษ", f: T.border + 8 }, { text: "ฝรั่งเศส", f: T.border + 20 }] },
    { f: T.decl, tag: "15 ม.ค. 2439 · ลอนดอน", head: "ปฏิญญาอังกฤษ–ฝรั่งเศส", color: GOLD },
    { f: T.basin, tag: "ไม่ส่งทหารเข้ามาใน", head: "ลุ่มแม่น้ำเจ้าพระยา", color: GOLD },
    { f: T.bufWord, tag: "สยามกลายเป็น", head: "รัฐกันชน", color: GOLD },
    { f: T.edge, tag: "แต่ชายขอบ", head: "ยังเปิดให้ต่อรอง", color: RED },
    { f: T.europe, tag: "พ.ศ. 2440", head: "เสด็จประพาสยุโรปครั้งแรก", stat: "ราว 9 เดือน", color: GOLD },
    { f: T.courts, tag: "ทรงพบ", head: "พระเจ้าซาร์และประมุขมหาอำนาจ", color: GOLD, chips: CAPS.map(([, n], i) => ({ text: n, f: capF(i) })) },
    { f: T.equal, tag: "บอกโลกว่า", head: "สยามทัดเทียมนานาประเทศ", color: GOLD },
    { f: T.notLand, tag: "ไม่ใช่", head: "ดินแดนรอผู้ปกครอง", color: RED },
    { f: T.f2, tag: "ทางรอดข้อสอง", head: "การทูตเป็นเกราะ", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const fade = ramp(frame, FROM, 15, TO);
    const areas: [AreaId, string, number][] = [
      ["burma", BRIT_C, fade],
      ["malayaSouth", BRIT_C, fade],
      ["vietnam", FR_C, fade],
      ["cambodia", FR_C, fade],
      ["laos", FR_C, fade],
      ["thai", SIAM_C, fade],
      ...EDGE.map((id) => [id, SIAM_C, fade] as [AreaId, string, number]),
    ];
    const wob = (0.5 + 0.5 * Math.sin(frame * 0.12)) * ramp(frame, T.edge, 20, T.europe);
    return (
      <>
        <Empire areas={areas} />
        <Empire areas={EDGE.map((id) => [id, RED, wob * fade * 0.6] as [AreaId, string, number])} pulse={false} />
        <Arrow points={[[96.6, 20.4], [98.6, 18.6], [99.6, 17.6]]} start={T.brit} end={T.brit + 30} color={BRIT_C} width={14} opacity={1 - ramp(frame, T.decl, 15)} />
        <Arrow points={[[104.6, 18.2], [102.8, 17.0], [101.6, 16.4]]} start={T.fr} end={T.fr + 30} color={FR_C} width={14} opacity={1 - ramp(frame, T.decl, 15)} />
        <Sparks at={[100.6, 17.0]} f={T.clash} size={1.4} />
        <Sparks at={[100.6, 17.0]} f={T.clash + 14} />
        <HandArea ring={BASIN} color={GOLD} k={ramp(frame, T.basin - 6, 20, T.europe)} />
        <ApproxTag at={[100.0, 12.9]} start={T.basin + 10} end={T.europe} />
        <PointLabel at={[100.2, 16.4]} text="ลุ่มเจ้าพระยา" start={T.basin + 8} color={GOLD} size={0.8} />
        <CityDot at={PL.bkk} color={GOLD} r={12} start={FROM} end={TO} />
        <Arrow points={R.europe1897} start={T.sail} end={T.courts - 6} color={GOLD} width={10} variant="dashed" opacity={1 - ramp(frame, T.f2, 15)} />
        {CAPS.map(([p, name, i]) => (
          <g key={p}>
            <CityDot at={PL[p]} color={GOLD} r={10} start={capF(i)} end={T.f2 + 20} />
            <PointLabel at={PL[p]} text={name} start={capF(i)} color={GOLD} size={0.7} />
          </g>
        ))}
        <Ring at={PL.bkk} r={5.5} color={GOLD} start={T.shield - 20} end={TO + 10} />
      </>
    );
  },
  Panels: () => (
    <>
      <StandoffScene id="e5c5stand" start={FROM} end={T.decl + 14} />
      <SigningScene id="e5c5sign" start={T.decl} end={T.buffer + 14} />
      <BufferFieldsScene id="e5c5fields" start={T.buffer} end={T.europe + 14} />
      <VoyageScene id="e5c5voy" start={T.europe} end={T.courts + 60} />
      <BallroomScene id="e5c5ball" start={T.courts + 46} end={T.eqWord + 14} />
      <FlagsScene id="e5c5flags" start={T.eqWord} end={T.two + 10} />
    </>
  ),
  Screen: () => <DiplomacyCard />,
  sfx: [
    [T.border + 8, SFX.pop, 0.25],
    [T.border + 20, SFX.pop, 0.25],
    [T.basin, SFX.swell, 0.3],
    [T.sail, SFX.whoosh, 0.3],
    ...CAPS.map(([, , i]) => [capF(i), SFX.pop, 0.25] as [number, string, number]),
    [T.two, SFX.pop, 0.35],
  ],
  Audio: () => (
    <>
      <Bed id="jungle_rain" from={FROM} to={T.decl + 10} volume={0.18} voice={VOICE} />
      <Hit id="sword_draw" at={T.clash - 6} volume={0.45} />
      <Hit id="thunder_rumble" at={T.clash} volume={0.35} />
      <Bed id="wind" from={T.decl} to={T.buffer + 10} volume={0.12} voice={VOICE} />
      <Hit id="wood_hit" at={T.agree} volume={0.5} />
      <Hit id="gong" at={T.bufWord} volume={0.4} />
      <Bed id="wind" from={T.buffer} to={T.europe + 10} volume={0.15} voice={VOICE} />
      <Bed id="ship_sailing" from={T.europe} to={T.courts + 60} volume={0.25} voice={VOICE} />
      <Hit id="ship_bell" at={T.sail} volume={0.4} />
      <Hit id="church_bell" at={T.tsar} volume={0.35} />
      <Bed id="applause_conference" from={T.courts + 46} to={T.eqWord + 10} volume={0.15} voice={VOICE} />
      <Bed id="wind" from={T.eqWord} to={T.two + 10} volume={0.2} voice={VOICE} />
      <Hit id="gong" at={T.shield - 6} volume={0.4} />
    </>
  ),
};
