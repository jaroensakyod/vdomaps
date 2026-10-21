import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { B, CityRing, clamp, font, GOLD, P, Panel, RED, Skyline, V, view, wf, type Chapter } from "./kit";
import { BurmeseSoldier, CityWall, Fire, Moon, SiegeCamp, Smoke } from "./Period";
import { Sampan, SiamSoldier, WaterBand } from "./Period2";
import { HorseGeneral, Mountains } from "./Period4";

// Chapter 6 "พระยาตาก" (beats taksin → three): who he was, the breakout east, the chase, the march to Rayong,
// the debate (left the city, or saved his strength?), and "three months later".
const TAK = "#d39a1c";
const T = {
  taksin: B.taksin.start,
  tak: wf("taksin", "เคย", 0.45),
  called: wf("taksin", "ถูก", 0.72),
  out: B.breakout.start,
  before: wf("breakout", "ก่อน", 0.2),
  men: wf("breakout", "พระยา", 0.5),
  through: wf("breakout", "ตี", 0.8),
  chase: B.chase.start,
  beaten: wf("chase", "แต่", 0.6),
  east: B.east.start,
  nayok: wf("east", "นครนายก", 0.24),
  prachin: wf("east", "ปราจีนบุรี", 0.32),
  rayong: wf("east", "ระยอง", 0.57),
  sea: wf("east", "ฝั่ง", 0.67),
  debate: B.debate.start,
  left: wf("debate", "ทิ้ง", 0.25),
  saved: wf("debate", "บาง", 0.32, 1),
  keep: wf("debate", "เก็บ", 0.74, 1),
  three: B.three.start,
  fear: wf("three", "สิ่ง", 0.5),
};
const END = B.huaro.start;

const TAKC: [number, number] = [99.13, 16.88];
const ROUTE: [number, number][] = [[100.58, 14.36], [100.9, 14.3], [101.21, 14.2], [101.37, 14.05], [101.15, 13.6], [101.0, 13.36], [101.28, 12.68]];
const V6 = { tak: bbox([[98.6, 13.9], [101.2, 17.3]]), east: bbox([[100.2, 12.4], [101.9, 14.8]]) };
const NIGHT: [string, string] = ["#0b1230", "#2a3a6a"];

// Phraya Tak on the wall with the defenders, looking out at the camps.
export const TakScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c6tak" anchor={P.ayut} start={start} end={end} sky={["#e98b3a", "#f8d9a0"]} accent={GOLD}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 110 * g.s} width={g.W} height={g.H} fill="#7d8a5a" />
        {[0.15, 0.6].map((fx, i) => <SiegeCamp key={i} x={g.x + g.W * fx} y={g.ground - 106 * g.s} s={g.s * 0.5} w={200} phase={i} />)}
        <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#cfc6b0" />
        <HorseGeneral x={g.x + g.W * 0.55} y={g.ground - 36 * g.s} scale={g.sc * 0.8} banner={TAK} coat={TAK} flip />
        {[0.2, 0.8].map((fx, i) => <SiamSoldier key={i} x={g.x + g.W * fx} y={g.ground - 40 * g.s} scale={g.sc * 0.75} hold={i ? "gun" : "spear"} phase={i} />)}
      </g>
    )}
  </Panel>
);

// Night: troops with torches massing at the east gate; then the charge through a Burmese camp.
const MassScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c6mass" anchor={P.ayut} start={start} end={end} sky={NIGHT} accent={GOLD}>
    {(g) => (
      <g>
        <Moon x={g.x + g.W * 0.85} y={g.y + 80 * g.s} r={26 * g.s} />
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#1b2235" />
        <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W * 0.45} ground={g.ground - 10 * g.s} h={110 * g.s} s={g.s} />
        {[0, 1, 2, 3, 4, 5].map((i) => <SiamSoldier key={i} x={g.x + g.W * (0.42 + i * 0.09)} y={g.ground + 6 * g.s} scale={g.sc * 0.75} hold={i % 2 ? "gun" : "spear"} jacket="#5a4a2a" phase={i} />)}
        {[0.5, 0.68, 0.86].map((fx, i) => <Fire key={i} x={g.x + g.W * fx + 16 * g.s} y={g.ground - 100 * g.s} size={22 * g.s} seed={i} />)}
      </g>
    )}
  </Panel>
);

const ChargeScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6charge" anchor={P.ayut} start={start} end={end} sky={["#1a1030", "#8a2f1a"]} accent={GOLD}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#2a2016" />
            <SiegeCamp x={g.x + g.W * 0.6} y={g.ground} s={g.s * 0.9} w={260} />
            <Fire x={g.x + g.W * 0.55} y={g.ground - 60 * g.s} size={90 * g.s} seed={2} />
            <HorseGeneral x={g.x + g.W * (0.05 + m * 0.75)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} banner={TAK} coat={TAK} gallop />
            {[0, 1].map((i) => <HorseGeneral key={i} x={g.x + g.W * (-0.12 + m * 0.75 - i * 0.12)} y={g.ground + 10 * g.s} scale={g.sc * 0.7} banner={TAK} coat="#5a4a2a" gallop phase={i * 2} />)}
            {[0, 1].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.78 + i * 0.1)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold="spear" flip phase={i} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// Rear guard turns and beats back the pursuers.
const RearGuard = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6rear" anchor={[100.9, 14.3]} start={start} end={end} sky={["#6a7a9a", "#d8c8a8"]} accent={GOLD}>
      {(g) => {
        const back = interpolate(frame, [T.beaten, end], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#7a7a4a" />
            {[0, 1, 2].map((i) => <SiamSoldier key={i} x={g.x + g.W * (0.55 + i * 0.1)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold={i ? "spear" : "gun"} flip walk phase={i} />)}
            {[0, 1, 2].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.3 - i * 0.09 - back * 0.25)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold="spear" flip={back > 0} phase={i} />)}
            {back > 0 && <Smoke x={g.x + g.W * 0.42} y={g.ground - 40 * g.s} size={120 * g.s} />}
          </g>
        );
      }}
    </Panel>
  );
};

// Riding east through the hills, then the coast.
const RideScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6ride" anchor={[101.37, 14.05]} start={start} end={end} sky={["#7aa0c4", "#dbeef2"]} accent={GOLD}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <Mountains x={g.x} y={g.ground - 20 * g.s} W={g.W} s={g.s} h={140} seed="east" />
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#6f8a4a" />
            {[0, 1, 2].map((i) => <HorseGeneral key={i} x={g.x + g.W * (0.15 + m * 0.5 - i * 0.14)} y={g.ground + 6 * g.s} scale={g.sc * 0.7} banner={TAK} coat={i ? "#5a4a2a" : TAK} gallop phase={i} />)}
          </g>
        );
      }}
    </Panel>
  );
};

export const CoastScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c6coast" anchor={[101.28, 12.68]} start={start} end={end} sky={["#4fa3d4", "#d8eef6"]} accent={GOLD}>
    {(g) => (
      <g>
        <WaterBand x={g.x} y={g.ground - 70 * g.s} W={g.W} H={g.H} s={g.s} color="#3d8fc4" />
        <path d={`M${g.x} ${g.ground - 30 * g.s} Q${g.cx} ${g.ground - 60 * g.s} ${g.x + g.W} ${g.ground - 20 * g.s} L${g.x + g.W} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#e9d8a6" />
        {[0.15, 0.85].map((fx, i) => (
          <g key={i}>
            <path d={`M${g.x + g.W * fx} ${g.ground - 30 * g.s} q${10 * g.s} ${-80 * g.s} ${-6 * g.s} ${-150 * g.s}`} stroke="#6b4a2b" strokeWidth={8 * g.s} fill="none" />
            {[-60, -20, 20, 60].map((a) => <path key={a} d={`M${g.x + g.W * fx - 6 * g.s} ${g.ground - 180 * g.s} q${40 * g.s * Math.cos((a * Math.PI) / 180)} ${-20 * g.s} ${70 * g.s * Math.cos((a * Math.PI) / 180)} ${10 * g.s}`} stroke="#3f8f4a" strokeWidth={10 * g.s} fill="none" strokeLinecap="round" />)}
          </g>
        ))}
        <Sampan x={g.x + g.W * 0.5} y={g.ground - 60 * g.s} scale={g.sc * 0.7} people={2} />
        {[0.35, 0.6].map((fx, i) => <SiamSoldier key={i} x={g.x + g.W * fx} y={g.ground - 20 * g.s} scale={g.sc * 0.75} hold="spear" jacket="#5a4a2a" phase={i} />)}
      </g>
    )}
  </Panel>
);

// The debate as a split panel: left = riding away from the burning city, right = rallying men on the coast.
const DebateScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6debate" anchor={P.ayut} start={start} end={end} sky={["#2a2f4a", "#7a6a8a"]} accent={GOLD}>
      {(g) => {
        const l = frame >= T.left ? 1 : 0.4;
        const r = frame >= T.saved ? 1 : 0.4;
        return (
          <g>
            <g opacity={l}>
              <rect x={g.x} y={g.y} width={g.W / 2} height={g.H} fill="#3a2a2a" />
              <Skyline g={{ x: g.x, W: g.W / 2, ground: g.ground, s: g.s * 0.6 }} color="#1a1010" burn={0.6} base={40} />
              <HorseGeneral x={g.x + g.W * 0.32} y={g.ground + 6 * g.s} scale={g.sc * 0.55} banner={TAK} coat={TAK} gallop flip />
              <text x={g.x + g.W * 0.25} y={g.y + 92 * g.s} textAnchor="middle" fill="#fff" fontFamily={font} fontWeight={900} fontSize={34 * g.s}>ทิ้งเมือง?</text>
            </g>
            <g opacity={r}>
              <rect x={g.cx} y={g.y} width={g.W / 2} height={g.H} fill="#2f4f6b" />
              <WaterBand x={g.cx} y={g.ground - 40 * g.s} W={g.W / 2} H={g.H} s={g.s} color="#3d7fa8" />
              {[0.6, 0.7, 0.8].map((fx, i) => <SiamSoldier key={i} x={g.x + g.W * fx} y={g.ground + 4 * g.s} scale={g.sc * 0.6} hold="spear" phase={i} />)}
              <HorseGeneral x={g.x + g.W * 0.9} y={g.ground + 6 * g.s} scale={g.sc * 0.55} banner={TAK} coat={TAK} flip />
              <text x={g.x + g.W * 0.75} y={g.y + 92 * g.s} textAnchor="middle" fill="#fff" fontFamily={font} fontWeight={900} fontSize={34 * g.s}>เก็บกำลัง?</text>
            </g>
            <line x1={g.cx} y1={g.y} x2={g.cx} y2={g.y + g.H} stroke="#fff" strokeWidth={4 * g.s} />
          </g>
        );
      }}
    </Panel>
  );
};

// "สิ่งที่ทุกคนกลัวที่สุด": the city under a red sky.
const DreadScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c6dread" anchor={P.ayut} start={start} end={end} sky={["#1a0a0a", "#8a1f1a"]} accent={RED}>
    {(g) => (
      <g>
        <Skyline g={g} color="#120808" base={95} />
        <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#1a1010" />
        <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={90 * g.s} s={g.s} />
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#000" opacity={0.25} />
      </g>
    )}
  </Panel>
);

// Calendar flipping มกราคม → เมษายน.
const MonthFlip = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.three || frame > T.fear + 10) return null;
  const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน"];
  const i = Math.min(3, Math.floor(interpolate(frame, [T.three + 10, T.fear - 6], [0, 3.99], clamp)));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: interpolate(frame, [T.fear, T.fear + 10], [1, 0], clamp) }}>
      <div style={{ width: 280 * s, background: "#fff", borderRadius: 18 * s, overflow: "hidden", textAlign: "center", fontFamily: font, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.6)` }}>
        <div style={{ background: RED, color: "#fff", fontWeight: 900, fontSize: 40 * s, padding: `${8 * s}px 0` }}>{months[i]}</div>
        <div style={{ fontWeight: 900, fontSize: 110 * s, lineHeight: 1.2, color: "#1b1d24" }}>2310</div>
      </div>
    </AbsoluteFill>
  );
};

// Bookmark: "เก็บคำถามนี้ไว้ ท้ายคลิปถาม".
const Bookmark = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.keep || frame > T.three + 6) return null;
  const k = interpolate(frame, [T.keep, T.keep + 8], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", right: 60 * s, top: height * 0.34, transform: `scale(${k})`, background: GOLD, color: "#1b1d24", fontFamily: font, fontWeight: 900, fontSize: 34 * s, padding: `${10 * s}px ${22 * s}px`, borderRadius: 12 * s, boxShadow: `0 0 ${30 * s}px rgba(255,201,74,0.6)` }}>★ ถามท้ายคลิป</div>
  );
};

export const ch6: Chapter = {
  name: "พระยาตากตีฝ่าวงล้อม",
  from: B.taksin.start,
  to: END,
  cams: (w, h) => [
    { frame: T.taksin, cam: view(V.island, w, h, 0.8) },
    { frame: T.tak - 5, cam: view(V.island, w, h, 0.8) },
    { frame: T.tak + 30, cam: view(V6.tak, w, h, 1, 0.08) },
    { frame: T.out - 10, cam: view(V6.tak, w, h, 1, 0.08) },
    { frame: T.out + 25, cam: view(V.plain, w, h, 1.3) },
    { frame: T.east - 10, cam: view(V.plain, w, h, 1.3) },
    { frame: T.east + 30, cam: view(V6.east, w, h, 1, 0.08) },
    { frame: T.debate + 20, cam: view(V6.east, w, h, 1, 0.08) },
    { frame: T.three, cam: view(V.island, w, h, 0.7) },
  ],
  years: [[T.taksin, "2310"], [T.out, "2310 · มกราคม"]],
  heads: [
    { f: T.taksin, tag: "ขุนนางเชื้อสายจีน", head: "พระยาตาก", color: TAK },
    { f: T.tak, tag: "เคยครอง", head: "เมืองตาก", color: TAK },
    { f: T.called, tag: "ถูกเรียกมา", head: "ช่วยป้องกันกรุง", color: TAK },
    { f: T.out, tag: "ต้นเดือนมกราคม 2310", head: "ก่อนกรุงแตกราว 3 เดือน", color: TAK },
    { f: T.men, tag: "พระยาตากพาทหาร", head: "ตีฝ่าวงล้อม", stat: (f) => `${Math.round(interpolate(f, [T.men, T.men + 40], [0, 500], clamp))}–${Math.round(interpolate(f, [T.men, T.men + 40], [0, 1000], clamp))} คน`, color: TAK },
    { f: T.chase, tag: "พม่าไล่ตามหลายรอบ", head: "แตกกลับทุกรอบ", color: TAK },
    { f: T.east, tag: "มุ่งหน้าตะวันออก", head: "ถึงระยอง", color: TAK, chips: [{ text: "นครนายก", f: T.nayok }, { text: "ปราจีนบุรี", f: T.prachin }, { text: "ระยอง", f: T.rayong }] },
    { f: T.sea, tag: "ฝั่งทะเลตะวันออก", head: "พม่ายังมาไม่ถึง", color: TAK },
    { f: T.debate, tag: "คนเถียงกันมานาน", head: "ทิ้งเมือง หรือ เก็บกำลัง?", color: GOLD },
    { f: T.three, tag: "อีกแค่", head: "3 เดือน", color: RED },
    { f: T.fear, tag: "สิ่งที่ทุกคนกลัวที่สุด", head: "ก็เกิดขึ้น", color: RED },
  ],
  night: (f) => (f >= T.out && f < T.east ? 0.8 : f >= T.three ? interpolate(f, [T.three, T.fear], [0, 0.7], clamp) : 0),
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        {frame >= T.tak && frame < T.out + 10 && (
          <>
            <PointLabel at={TAKC} text="เมืองตาก" start={T.tak} color={TAK} size={0.8} />
            <Arrow points={[TAKC, [99.8, 15.6], [100.5, 14.45]]} start={T.called} end={T.called + 30} color={TAK} width={14} variant="dashed" />
          </>
        )}
        {frame >= T.out && frame < T.debate + 30 && (
          <>
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return <PointLabel key={i} at={[P.ayut[0] + Math.cos(a) * 0.12, P.ayut[1] + Math.sin(a) * 0.09]} text="" start={T.out + i * 2} color={RED} size={0.5} />;
            })}
            <Arrow points={ROUTE.slice(0, 2)} start={T.through} end={T.through + 20} color={TAK} width={24} />
            <Arrow points={ROUTE.slice(1)} start={T.nayok - 10} end={T.rayong + 10} color={TAK} width={22} />
            {frame >= T.chase && frame < T.east + 10 &&
              [0, 1].map((i) => {
                const f = T.chase + i * 20;
                return (
                  <g key={i}>
                    <g opacity={interpolate(frame, [T.beaten + i * 6, T.beaten + 10 + i * 6], [1, 0], clamp)}><Arrow points={[[100.62, 14.5 - i * 0.25], [100.88, 14.33 - i * 0.1]]} start={f} end={f + 20} color={RED} width={14} /></g>
                    <Arrow points={[[100.88, 14.33 - i * 0.1], [100.62, 14.5 - i * 0.25]]} start={T.beaten + i * 6} end={T.beaten + 25 + i * 6} color={RED} width={10} variant="dashed" />
                  </g>
                );
              })}
            <PointLabel at={[101.21, 14.2]} text="นครนายก" start={T.nayok} color={TAK} size={0.7} />
            <PointLabel at={[101.37, 14.05]} text="ปราจีนบุรี" start={T.prachin} color={TAK} size={0.7} />
            <PointLabel at={[101.28, 12.68]} text="ระยอง" start={T.rayong} color={TAK} size={0.8} />
          </>
        )}
        <CityRing k={interpolate(frame, [T.three, T.three + 15], [0, 1], clamp)} color={RED} />
      </>
    );
  },
  Panels: () => (
    <>
      <TakScene start={T.taksin} end={T.out + 14} />
      <MassScene start={T.out} end={T.through + 14} />
      <ChargeScene start={T.through} end={T.chase + 14} />
      <RearGuard start={T.chase} end={T.east + 14} />
      <RideScene start={T.east} end={T.sea + 14} />
      <CoastScene start={T.sea} end={T.debate + 14} />
      <DebateScene start={T.debate} end={T.three + 14} />
      <DreadScene start={T.fear - 10} end={END + 14} />
    </>
  ),
  Screen: () => (
    <>
      <Bookmark />
      <MonthFlip />
    </>
  ),
  sfx: [
    [T.taksin, SFX.swell, 0.3],
    [T.tak, SFX.pop, 0.3],
    [T.out, SFX.whoosh, 0.35],
    [T.men, SFX.riser, 0.3],
    [T.through, SFX.hit, 0.55],
    [T.beaten, SFX.hit, 0.4],
    [T.nayok, SFX.pop, 0.25],
    [T.prachin, SFX.pop, 0.25],
    [T.rayong, SFX.pop, 0.35],
    [T.left, SFX.pop, 0.3],
    [T.saved, SFX.pop, 0.3],
    [T.keep, SFX.tick, 0.35],
    [T.three + 10, SFX.tick, 0.3],
    [T.three + 30, SFX.tick, 0.3],
    [T.fear, SFX.hit, 0.55],
  ],
};
