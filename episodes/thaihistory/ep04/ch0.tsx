import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { Bed, Hit, SFX } from "./mix";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { B, CityDot, Ring, VOICE, wf, Zones, type Chapter4 } from "./beatsKit";
import { PL, R, VW } from "./places";
import { Backdrop, Boat, C, Candle, Fighter, Fire, Grass, King, Manuscript, Noble, PAL, PalaceWall, Prang, River, Smoke, V2 } from "./v2";

// Episode 4 opening (beats hook → question): Thonburi or Nakhon Si Thammarat — how did Taksin's reign end?
const T = {
  setup: B.setup.start,
  rebels: wf("setup", "กบฏ", 0.55),
  month: wf("setup", "ราว", 0.8),
  stakes: B.stakes.start,
  disagree: wf("stakes", "ไม่", 0.35),
  believe: wf("stakes", "เชื่อ", 0.8),
  q: B.question.start,
};
const END = B.recap.start;
const STORM = [T.rebels + 8, T.rebels + 30, T.rebels + 52, T.rebels + 74];

const HookTitle = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.hook.end - 4, B.hook.end + 8], [1, 0], clamp);
  const pop = 1 + 0.06 * Math.max(0, 1 - frame / 8);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: height * 0.1, opacity: o, fontFamily: font, color: "#fff", textAlign: "center", lineHeight: 1.25 }}>
      <div style={{ transform: `scale(${pop})`, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>
        <div style={{ fontSize: 84 * s, fontWeight: 900 }}>พระเจ้าตาก<span style={{ color: "#ff6b5f" }}>สิ้นพระชนม์จริง</span></div>
        <div style={{ fontSize: 84 * s, fontWeight: 900 }}>หรือหนีไป<span style={{ color: GOLD }}>นครศรีฯ</span>?</div>
      </div>
    </AbsoluteFill>
  );
};

const QuestionMark = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.q || frame > END + 6) return null;
  const k = interpolate(frame, [T.q, T.q + 10], [0, 1], clamp);
  return <div style={{ position: "absolute", right: 70 * s, top: height * 0.34, width: 150 * s, height: 150 * s, borderRadius: "50%", background: RED, color: "#fff", fontFamily: font, fontWeight: 900, fontSize: 120 * s, lineHeight: `${150 * s}px`, textAlign: "center", transform: `scale(${k})`, boxShadow: `0 0 ${40 * s}px rgba(255,59,48,0.7)` }}>?</div>;
};

// Night: the palace burns behind its wall while a small boat slips away down the river.
const NightRiverScene = ({ id, start, end, boat = true }: { id: string; start: number; end: number; boat?: boolean }) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#0b1026", "#3a1f2a"]} accent={RED} warm={0.04}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.82, 0.22]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#1f2440" mid="#2a2f3a" ground="#1a1712" mist="#8a90b0" />
        <PalaceWall x={g.x + g.W * 0.05 + pan * 0.5} y={g.ground - 40 * g.s} w={g.W * 0.55} h={70 * g.s} s={g.s} color="#cfc6b0" />
        <Prang x={g.x + g.W * 0.4 + pan * 0.5} y={g.ground - 110 * g.s} h={130 * g.s} s={g.s} color="#bdb39c" />
        <Fire x={g.x + g.W * 0.18 + pan * 0.5} y={g.ground - 110 * g.s} h={70 * g.s} seed={1} />
        <Fire x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 110 * g.s} h={50 * g.s} seed={3} />
        <Smoke x={g.x + g.W * 0.22 + pan * 0.5} y={g.ground - 160 * g.s} s={g.s} dark />
        <River g={g} y={g.ground - 30 * g.s} pan={pan} color="#16263a" night />
        {boat && <Boat x={g.x + g.W * (0.55 + lt * 0.0016) + pan * 0.7} y={g.ground + 4 * g.s} w={150 * g.s} s={g.s} n={3} costume={C.villager} />}
        <Grass g={g} shift={pan * 1.6} color="#141a10" />
      </g>
    )}
  </V2>
);

// The king on his throne; nobles prostrate before him in warm lamplight.
const ThroneScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#3a1a10", "#8a4a22"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#5a2a18" />
        {[0.12, 0.32, 0.68, 0.88].map((f) => <rect key={f} x={g.x + g.W * f - 14 * g.s + pan * 0.2} y={g.y} width={28 * g.s} height={g.H} fill="#7a3a1a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#3a2414" />
        <King x={g.x + g.W * 0.78 + pan * 0.5} y={g.ground - 14 * g.s} scale={g.sc * 0.62} light={0.6} />
        {[0, 1, 2, 3].map((i) => <Noble key={i} x={g.x + g.W * (0.14 + i * 0.13) + pan * 0.7} y={g.ground - 6 * g.s} scale={g.sc * 0.62} mode="prostrate" phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />)}
        <Candle x={g.x + g.W * 0.62 + pan * 0.7} y={g.ground - 14 * g.s} s={g.s} />
        <Candle x={g.x + g.W * 0.94 + pan * 0.7} y={g.ground - 14 * g.s} s={g.s} />
      </g>
    )}
  </V2>
);

// Rebels storm the palace gate at night; guards hold the wall.
const StormGateScene = ({ id, start, end, hits }: { id: string; start: number; end: number; hits: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#120b1e", "#5a2a1a"]} accent={RED} hits={hits}>
      {(g, pan, lt) => {
        const rush = interpolate(lt, [0, end - start], [0, 90], clamp) * g.s;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.2, 0.3]} lightColor={["#ff8a2a", "#ffd25a"]} far="#2a1f2a" mid="#2a2420" ground="#2a2018" mist="#ff9a5a" />
            <PalaceWall x={g.x + g.W * 0.52 + pan * 0.5} y={g.ground - 6 * g.s} w={g.W * 0.5} h={110 * g.s} s={g.s} gateAt={0.3} gateOpen={interpolate(frame, [hits[2] ?? 0, (hits[2] ?? 0) + 10], [0, 0.6], clamp)} />
            <Fighter x={g.x + g.W * 0.72 + pan * 0.5} y={g.ground - 120 * g.s} scale={g.sc * 0.6} flip mode="attack" costume={C.guard} phase={1} />
            <Fighter x={g.x + g.W * 0.9 + pan * 0.5} y={g.ground - 120 * g.s} scale={g.sc * 0.6} flip mode="stand" costume={C.guard} phase={2} />
            {[0, 1, 2, 3, 4].map((i) => (
              <Fighter key={i} x={g.x + g.W * (0.04 + i * 0.09) + rush + pan * 0.7} y={g.ground + 2 * g.s} scale={g.sc * 0.78} mode={i % 2 ? "run" : "attack"} costume={C.rebel} phase={i * 1.1} />
            ))}
            {hits.map((h) => (frame >= h && frame < h + 6 ? <circle key={h} cx={g.x + g.W * 0.6} cy={g.ground - 60 * g.s} r={30 * g.s} fill="#fff2b0" opacity={0.8} /> : null))}
            <Grass g={g} shift={pan * 1.6} color="#1a1f14" />
          </g>
        );
      }}
    </V2>
  );
};

// A scribe's table: Thai manuscript, a Chinese scroll and a French letter side by side under one candle.
const ArchiveScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#1a120c", "#3a2414"]} accent={GOLD} warm={0.1}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#24180f" />
        <rect x={g.x - 50 * g.s} y={g.ground - 40 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#5a3a20" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <Manuscript x={g.x + g.W * 0.06 + pan * 0.5} y={g.ground - 44 * g.s} w={260 * g.s} s={g.s} />
        <g transform={`translate(${g.x + g.W * 0.42 + pan * 0.6},${g.ground - 44 * g.s})`}>
          <rect x={0} y={-150 * g.s} width={110 * g.s} height={150 * g.s} fill="#efe2c0" stroke={PAL.ink} strokeWidth={2 * g.s} />
          <rect x={-8 * g.s} y={-158 * g.s} width={126 * g.s} height={12 * g.s} rx={6 * g.s} fill="#7a3a1a" />
          {Array.from({ length: 4 }, (_, i) => <line key={i} x1={(18 + i * 24) * g.s} y1={-138 * g.s} x2={(18 + i * 24) * g.s} y2={-20 * g.s} stroke={PAL.ink} strokeWidth={3 * g.s} strokeDasharray={`${10 * g.s} ${6 * g.s}`} />)}
        </g>
        <g transform={`translate(${g.x + g.W * 0.62 + pan * 0.7},${g.ground - 44 * g.s}) rotate(-6)`}>
          <rect x={0} y={-120 * g.s} width={150 * g.s} height={110 * g.s} fill="#f4ecd8" stroke={PAL.ink} strokeWidth={2 * g.s} />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${12 * g.s} ${(-104 + i * 15) * g.s} q${30 * g.s} ${-5 * g.s} ${60 * g.s} 0 t${60 * g.s} 0`} stroke="#3a2a6a" strokeWidth={1.6 * g.s} fill="none" />)}
          <circle cx={120 * g.s} cy={-24 * g.s} r={12 * g.s} fill="#a8322a" />
        </g>
        <Candle x={g.x + g.W * 0.9 + pan * 0.7} y={g.ground - 40 * g.s} s={g.s * 1.4} />
      </g>
    )}
  </V2>
);

// Moonlit Wat Arun across the river, an empty landing — the question.
const MoonPrangScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.watArun} start={start} end={end} sky={["#0a1430", "#2a3a6a"]} accent={GOLD} warm={0.03}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.22]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#1f2a4a" mid="#25304a" ground="#151a24" mist="#9aa8d0" ridges={false} />
        <Prang x={g.x + g.W * 0.55 + pan * 0.2} y={g.ground - 30 * g.s} h={250 * g.s} s={g.s} color="#c9c2b0" gold />
        <Prang x={g.x + g.W * 0.32 + pan * 0.2} y={g.ground - 30 * g.s} h={130 * g.s} s={g.s} color="#b7b09e" />
        <Prang x={g.x + g.W * 0.78 + pan * 0.2} y={g.ground - 30 * g.s} h={130 * g.s} s={g.s} color="#b7b09e" />
        <River g={g} y={g.ground - 24 * g.s} pan={pan} color="#101c34" night />
        <Grass g={g} shift={pan * 1.6} color="#0e1410" />
      </g>
    )}
  </V2>
);

export const e4ch0: Chapter4 = {
  name: "จุดจบของพระเจ้าตาก",
  from: 0,
  to: END,
  cams: (w, h) => [
    { frame: 0, cam: view(VW.hook, w, h, 0.8, 0.1) },
    { frame: T.setup, cam: view(VW.hook, w, h, 0.82, 0.1) },
    { frame: T.setup + 40, cam: view(VW.thonWide, w, h, 0.9, 0.08) },
    { frame: T.stakes, cam: view(VW.thonWide, w, h, 0.95, 0.08) },
    { frame: T.stakes + 40, cam: view(VW.asia, w, h, 0.85, 0.1) },
    { frame: T.q, cam: view(VW.asia, w, h, 0.85, 0.1) },
    { frame: T.q + 40, cam: view(VW.hook, w, h, 0.8, 0.1) },
  ],
  years: [[0, "2325"]],
  heads: [
    { f: T.setup, tag: "พ.ศ. 2325", head: "กษัตริย์ผู้กู้แผ่นดิน", stat: "ราว 14 ปี", label: "ครองราชย์", color: GOLD, portrait: "taksin_king" },
    { f: T.rebels, tag: "กบฏบุก", head: "ถึงพระราชวัง", color: RED },
    { f: T.month, tag: "ราวหนึ่งเดือนต่อมา", head: "แผ่นดินมีกษัตริย์องค์ใหม่", color: GOLD },
    { f: T.stakes, tag: "หลักฐาน 4 ฝ่าย", head: "เล่าไม่ตรงกัน", color: RED, chips: [{ text: "ไทย", f: T.stakes + 15 }, { text: "จีน", f: T.stakes + 30 }, { text: "เวียดนาม", f: T.stakes + 45 }, { text: "ฝรั่ง", f: T.stakes + 60 }] },
    { f: T.believe, tag: "บางคนเชื่อว่า", head: "ท่านไม่ได้สิ้นพระชนม์", color: GOLD },
    { f: T.q, tag: "คำถามของวันนี้", head: "สิ้นพระชนม์จริงไหม?", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const zk = interpolate(frame, [0, 10], [0, 1], clamp) * interpolate(frame, [T.setup, T.setup + 20], [1, 0.35], clamp);
    return (
      <>
        <Zones k={{ siam: zk }} />
        <CityDot at={PL.thon} color={RED} r={16} />
        <CityDot at={PL.nakhonsi} color={GOLD} r={16} start={4} />
        <Arrow points={R.escape} start={6} end={40} color={GOLD} width={10} variant="dashed" opacity={interpolate(frame, [T.setup, T.setup + 15, T.q, T.q + 15], [1, 0, 0, 1], clamp)} />
        <PointLabel at={PL.thon} text="ธนบุรี" start={6} color={RED} size={0.85} />
        <PointLabel at={PL.nakhonsi} text="นครศรีธรรมราช" start={14} color={GOLD} size={0.8} />
        <Ring at={PL.thon} r={0.012} start={T.rebels} end={T.stakes} />
        {frame >= T.stakes + 30 && frame < T.q + 30 && (
          <>
            <PointLabel at={PL.beijing} text="จีน" start={T.stakes + 30} color="#c0186a" size={0.8} />
            <PointLabel at={PL.hue} text="เวียดนาม" start={T.stakes + 45} color="#3fa7d6" size={0.8} />
          </>
        )}
      </>
    );
  },
  Panels: () => (
    <>
      <NightRiverScene id="e4hook" start={-12} end={T.setup + 14} />
      <ThroneScene id="e4throne" start={T.setup} end={T.rebels + 14} />
      <StormGateScene id="e4storm" start={T.rebels} end={T.stakes + 14} hits={STORM} />
      <ArchiveScene id="e4archive" start={T.stakes} end={T.q + 14} />
      <MoonPrangScene id="e4q" start={T.q} end={END + 14} />
    </>
  ),
  Screen: () => (
    <>
      <HookTitle />
      <QuestionMark />
    </>
  ),
  sfx: [
    [0, SFX.hit, 0.6],
    [0, SFX.swell, 0.3],
    [T.month, SFX.pop, 0.3],
    [T.stakes + 15, SFX.pop, 0.3],
    [T.stakes + 30, SFX.pop, 0.3],
    [T.stakes + 45, SFX.pop, 0.3],
    [T.stakes + 60, SFX.pop, 0.3],
    [T.stakes + 30, SFX.whoosh, 0.3],
    [T.q, SFX.pop, 0.35],
  ],
  Audio: () => (
    <>
      <Bed id="fire_crackle" from={0} to={T.setup + 14} volume={0.3} voice={VOICE} />
      <Hit id="gong" at={T.setup + 4} volume={0.45} />
      <Bed id="crowd_angry" from={T.rebels - 10} to={T.stakes + 10} volume={0.3} voice={VOICE} />
      {STORM.map((f, i) => <Hit key={f} id={i % 2 ? "sword_clash" : "wood_hit"} at={f} volume={0.45} />)}
      <Bed id="wind" from={T.q - 10} to={END + 14} volume={0.2} voice={VOICE} />
    </>
  ),
};
