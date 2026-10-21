import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { at, B, CityRing, clamp, font, GOLD, NightGrade, P, Panel, RED, Skyline, V, view, wf, type Chapter } from "./kit";
import { BurmeseSoldier, CityWall, Dust, Embers, Moon, RuinedPrang, SiegeCamp, Smoke } from "./Period";

// Opening: "อยุธยา 417 ปี แตกในคืนเดียวได้ไง" + the night of 7 April 1767 (beats hook, night, question).
const T = {
  date: B.night.start,
  wall: wf("night", "กำแพง", 0.25),
  fall: wf("night", "พัง", 0.37),
  storm: wf("night", "ทหาร", 0.42),
  dawn: wf("night", "พอ", 0.62),
  end: wf("night", "ราชธานี", 0.7),
  gone: wf("night", "เหลือ", 0.92),
  q: B.question.start,
  qRiver: wf("question", "แม่น้ำ", 0.3),
  qWall: wf("question", "กำแพง", 0.5),
  qWars: wf("question", "ศึก", 0.7),
  qHow: wf("question", "แตก", 0.85),
};
const END = B.go.start; // the next chapter takes over on "ไปดูกันครับ"

export const StormScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={P.huaro} start={start} end={end} sky={["#0b1230", "#c8461f"]}>
      {(g) => {
        const climb = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <Skyline g={g} color="#2a1a1f" burn={1} />
            <Smoke x={g.x + g.W * 0.5} y={g.ground - 140 * g.s} size={160 * g.s} />
            <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#2b2016" />
            <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={90 * g.s} s={g.s} breach={1} bx={g.x + g.W * 0.55} />
            {[0, 1, 2, 3, 4].map((i) => {
              const p = (climb * 0.9 + i * 0.16) % 1;
              const sx = g.x + g.W * (0.18 + p * 0.5);
              const sy = g.ground + 6 * g.s - Math.sin(Math.min(1, p * 1.4) * Math.PI) * 50 * g.s * (p > 0.25 ? 1 : 0);
              return <BurmeseSoldier key={i} x={sx} y={sy} scale={g.sc * 0.95} phase={i * 1.3} hold={i % 2 ? "torch" : "spear"} pose={p > 0.25 && p < 0.7 ? "climb" : "walk"} />;
            })}
            <Embers x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} />
          </g>
        );
      }}
    </Panel>
  );
};

const NightScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="night" anchor={P.ayut} start={start} end={end} sky={["#050a1e", "#1c2d5a"]}>
    {(g) => (
      <g>
        <Moon x={g.x + g.W * 0.82} y={g.y + 80 * g.s} r={34 * g.s} />
        {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={g.x + (((i * 97) % 100) / 100) * g.W} cy={g.y + (((i * 37) % 100) / 100) * 140 * g.s} r={1.6 * g.s} fill="#fff" opacity={0.6} />)}
        <Skyline g={g} color="#1a1f36" />
        <rect x={g.x} y={g.ground - 4 * g.s} width={g.W} height={g.H} fill="#1b2235" />
        <CityWall x0={g.x + g.W * 0.38} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={80 * g.s} s={g.s} />
        <SiegeCamp x={g.x + g.W * 0.16} y={g.ground + 2 * g.s} s={g.s} w={230} />
        <BurmeseSoldier x={g.x + g.W * 0.3} y={g.ground + 4 * g.s} scale={g.sc * 0.9} pose="stand" hold="spear" />
      </g>
    )}
  </Panel>
);

const CollapseScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const breach = interpolate(frame, [T.fall - 4, T.fall + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const shake = frame > T.fall - 4 && frame < T.fall + 12 ? Math.sin(frame * 3) * 4 : 0;
  return (
    <Panel id="collapse" anchor={P.huaro} start={start} end={end} sky={["#0b1230", "#8a2f1a"]}>
      {(g) => (
        <g transform={`translate(${shake * g.s},0)`}>
          <Skyline g={g} color="#2a1a1f" burn={0.6} />
          <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#2b2016" />
          <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={95 * g.s} s={g.s} breach={breach} bx={g.x + g.W * 0.5} />
          {breach === 0 && <path d={`M${g.x + g.W * 0.5} ${g.ground - 90 * g.s} l${-8 * g.s} ${25 * g.s} l${12 * g.s} ${18 * g.s} l${-10 * g.s} ${30 * g.s}`} stroke="#3a2a20" strokeWidth={3 * g.s} fill="none" opacity={interpolate(frame, [start, T.fall], [0.2, 1], clamp)} />}
          <Dust x={g.x + g.W * 0.5} y={g.ground} s={g.s} k={interpolate(frame, [T.fall, T.fall + 30], [0, 1], clamp)} />
          {[0.12, 0.25, 0.8].map((fx, i) => <BurmeseSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc} pose="stand" hold={i === 1 ? "torch" : "spear"} phase={i} flip={fx > 0.5} />)}
        </g>
      )}
    </Panel>
  );
};

export const DawnScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="dawn" anchor={P.ayut} start={start} end={end} sky={["#6b5a73", "#f0a35e"]}>
    {(g) => (
      <g>
        <circle cx={g.x + g.W * 0.2} cy={g.ground - 60 * g.s} r={46 * g.s} fill="#ffd38a" opacity={0.9} />
        {[0.25, 0.5, 0.75].map((fx, i) => <Smoke key={i} x={g.x + g.W * fx} y={g.ground - 120 * g.s} size={200 * g.s} />)}
        <Skyline g={g} color="#3b2c2c" burn={0.35} />
        <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#4a3a2c" />
        <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={90 * g.s} s={g.s} breach={1} bx={g.x + g.W * 0.55} />
      </g>
    )}
  </Panel>
);

export const RuinScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="ruin" anchor={P.ayut} start={start} end={end} sky={["#7d8a99", "#d9c3a0"]}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#6b5a44" />
        {[0.18, 0.5, 0.82].map((fx, i) => <RuinedPrang key={i} x={g.x + g.W * fx} y={g.ground + 4 * g.s} h={(190 - i * 20) * g.s} s={g.s} />)}
        {[0.34, 0.66].map((fx, i) => <Smoke key={i} x={g.x + g.W * fx} y={g.ground - 40 * g.s} size={130 * g.s} />)}
      </g>
    )}
  </Panel>
);

// "คำถามของวันนี้": the city at its strongest — river, wall, a list of wars survived.
const StrongScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="strong" anchor={P.ayut} start={start} end={end} sky={["#3a6ea5", "#bfe0f2"]} accent="#4fa3ff">
    {(g) => (
      <g>
        <Skyline g={g} color="#5b4436" gold base={95} />
        <rect x={g.x} y={g.ground - 6 * g.s} width={g.W} height={g.H} fill="#4f8db5" />
        <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground - 10 * g.s} h={86 * g.s} s={g.s} />
        <rect x={g.x} y={g.ground + 2 * g.s} width={g.W} height={g.H} fill="#5f97b5" opacity={0.95} />
      </g>
    )}
  </Panel>
);

const QuestionMark = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.qHow || frame > END + 6) return null;
  const k = interpolate(frame, [T.qHow, T.qHow + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(3)) });
  return (
    <div style={{ position: "absolute", right: 70 * s, top: height * 0.36, width: 150 * s, height: 150 * s, borderRadius: "50%", background: RED, color: "#fff", fontFamily: font, fontWeight: 900, fontSize: 120 * s, lineHeight: `${150 * s}px`, textAlign: "center", transform: `scale(${k}) rotate(${(1 - k) * -30}deg)`, boxShadow: `0 0 ${40 * s}px rgba(255,59,48,0.7)` }}>?</div>
  );
};

const HookTitle = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.hook.end - 4, B.hook.end + 8], [1, 0], clamp);
  const pop = 1 + 0.06 * Math.max(0, 1 - frame / 8);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: height * 0.11, opacity: o, fontFamily: font, color: "#fff", textAlign: "center", lineHeight: 1.25 }}>
      <div style={{ transform: `scale(${pop})`, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>
        <div style={{ fontSize: 120 * s, fontWeight: 900 }}>อยุธยา <span style={{ color: GOLD }}>417 ปี</span></div>
        <div style={{ fontSize: 96 * s, fontWeight: 900 }}>แตกใน<span style={{ color: "#ff6b5f" }}>คืนเดียว</span>ได้ไง?</div>
      </div>
    </AbsoluteFill>
  );
};

export const ch0: Chapter = {
  name: "คืนกรุงแตก",
  from: 0,
  to: END,
  cams: (w, h) => {
    const z = (k: number, lift = 0.13) => view(V.island, w, h, k, lift);
    return [
      { frame: 0, cam: z(1.35) },
      { frame: T.date, cam: z(1.15) },
      { frame: T.date + 30, cam: z(0.8) },
      { frame: T.storm, cam: z(0.85) },
      { frame: T.storm + 20, cam: z(1.3) },
      { frame: T.end, cam: z(1.3) },
      { frame: T.end + 40, cam: z(0.45, 0.12) },
      { frame: T.q, cam: z(0.45, 0.12) },
      { frame: T.q + 40, cam: z(0.8) },
    ];
  },
  years: [[0, "2310 · 7 เมษายน"], [T.end, "1893 – 2310"], [T.q, "2310"]],
  heads: [
    { f: T.date, tag: "7 เมษายน 2310", head: "คืนสุดท้ายของกรุงศรีฯ" },
    { f: T.wall, tag: "หัวรอ · มุมตะวันออกเฉียงเหนือ", head: "กำแพงเมืองพังลงมา" },
    { f: T.storm, tag: "ค่ำ 7 เมษายน 2310", head: "ทหารพม่าบุกเข้าเมือง" },
    { f: T.dawn, tag: "เช้าวันรุ่งขึ้น", head: "ควันไฟทั่วเกาะเมือง" },
    { f: T.end, tag: "พ.ศ. 1893 – 2310", head: "ราชธานีที่ไม่เหลืออีกแล้ว", stat: (f) => `${Math.round(interpolate(f, [T.end + 6, T.end + 50], [0, 417], clamp))} ปี`, label: "ราชธานีของสยาม" },
    { f: T.q, tag: "คำถามของวันนี้", head: "แตกในคืนเดียวได้ยังไง?", color: GOLD, chips: [{ text: "แม่น้ำล้อมรอบ", f: T.qRiver }, { text: "กำแพงหนา", f: T.qWall }, { text: "รอดศึกมานับไม่ถ้วน", f: T.qWars }] },
  ],
  night: (f) => (f < T.dawn ? 1 : interpolate(f, [T.dawn, T.dawn + 25, T.q, T.q + 20], [1, 0.25, 0.25, 0], clamp)),
  Map: () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    return (
      <>
        {frame >= T.dawn && frame < T.q + 20 && <rect width={width} height={height} fill="#ff9a4a" opacity={interpolate(frame, [T.dawn, T.dawn + 25, T.end, T.end + 20], [0, 0.12, 0.12, 0], clamp)} />}
        <CityRing k={interpolate(frame, [T.date, T.date + 12], [0, 1], clamp) * interpolate(frame, [T.gone, T.gone + 15, T.q, T.q + 10], [1, 0.35, 0.35, 1], clamp)} color={frame >= T.q ? GOLD : RED} />
        {frame >= T.storm && frame < T.dawn + 10 && (
          <>
            <Arrow points={[[100.6, 14.4], [100.585, 14.375], [100.572, 14.362]]} start={T.storm} end={T.storm + 25} color={RED} width={20} />
            <Arrow points={[[100.61, 14.37], [100.59, 14.364], [100.575, 14.358]]} start={T.storm + 8} end={T.storm + 33} color={RED} width={16} />
          </>
        )}
        {frame < T.q && <PointLabel at={P.huaro} text="หัวรอ" start={T.wall} color={RED} size={0.8} />}
      </>
    );
  },
  Panels: () => (
    <>
      <StormScene id="hook" start={-12} end={T.date + 14} />
      <NightScene start={T.date} end={T.wall + 14} />
      <CollapseScene start={T.wall} end={T.storm + 14} />
      <StormScene id="storm" start={T.storm} end={T.dawn + 14} />
      <DawnScene start={T.dawn} end={T.end + 14} />
      <RuinScene start={T.end} end={T.q + 14} />
      <StrongScene start={T.q} end={at("go", 0.5) + 14} />
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
    [T.date - 6, SFX.whoosh, 0.35],
    [T.wall, SFX.pop, 0.3],
    [T.fall, SFX.hit, 0.6],
    [T.storm - 4, SFX.whoosh, 0.35],
    [T.dawn - 4, SFX.whoosh, 0.3],
    [T.end + 6, SFX.tick, 0.3],
    [T.gone, SFX.hit, 0.45],
    [T.q, SFX.riser, 0.25],
    [T.qHow, SFX.pop, 0.4],
  ],
};
