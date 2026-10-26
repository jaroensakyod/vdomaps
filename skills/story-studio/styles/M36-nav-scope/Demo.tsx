import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { along, Atoll, Bezel, C, Card, chartProj, clamp, Coast, Console, Defs, Engraved, Face, font, Glare, Graticule, H, Knob, Pencil, PLabel, Rings, SC, ShipMark, Snow, Track, W } from "./kit/Scope";

// M36 navigation scope: the Kon-Tiki expedition, 1947 — six men on a balsa raft from Callao, Peru, carried by the
// Humboldt and South Equatorial currents for 101 days to the reef of Raroia in the Tuamotus — plotted on an old
// ship's amber plotting scope. The chart follows the raft west, the track dots forward one fix a day, the brass
// bearing cursor turns with the heading and the DR card fills in with grease pencil. The scope is a storytelling
// device (the raft carried no such instrument); route approximate. Facts: Kon-Tiki Museum, Britannica. 18 s.
export const demo: StyleDemo = { id: "M36", name: "จอนำทางเรือเก่า", frames: 540, cover: 494, sizes: ["9x16"] };

// approximate drift (lon, lat): towed out of Callao, north-west with the Humboldt current, then west
const ROUTE: [number, number][] = [[-77.2, -12.05], [-79.5, -10.8], [-83, -9], [-88, -7.4], [-95, -6.4], [-103, -6.6], [-111, -7.6], [-119, -9], [-126, -10.6], [-132, -12.4], [-137, -14.3], [-140.6, -15.6], [-142.45, -16.05]];
const DAYS = 101;
const FIX0 = 70; // frame of day 1
const FIX1 = 452; // frame of day 101
const ATOLLS: [number, number][] = [[-142.45, -16.05], [-142.2, -15.8], [-140.85, -15.85], [-138.8, -14.8], [-145.6, -16.3], [-143.7, -16.6], [-140.9, -18.1], [-144.2, -14.5]];

const NOTES = [
  { at: 74, t: "วันที่ 1 · 28 เม.ย. 1947 · ออกจากกัลเลา เปรู" },
  { at: 150, t: "ลอยตามกระแสน้ำฮุมโบลต์ขึ้นเหนือ" },
  { at: 236, t: "กระแสน้ำศูนย์สูตรใต้ พาไปทางตะวันตก" },
  { at: 322, t: "แพไม้บัลซา · ลูกเรือ 6 คน" },
  { at: 452, t: "วันที่ 101 · 7 ส.ค. · เกยแนวปะการังราโรอา" },
];

const bearingOf = (a: [number, number], b: [number, number]) => {
  const dx = (b[0] - a[0]) * Math.cos((((a[1] + b[1]) / 2) * Math.PI) / 180);
  const dy = b[1] - a[1];
  return ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const on = interpolate(frame, [0, 26], [0, 1], { ...clamp, easing: (t) => t * t });
  const dayF = interpolate(frame, [FIX0, FIX1], [1, DAYS], clamp);
  const day = Math.floor(dayF);
  const t = (dayF - 1) / (DAYS - 1);
  const pos = along(ROUTE, t);
  const ahead = along(ROUTE, Math.min(1, t + 0.02));
  const behind = along(ROUTE, Math.max(0, t - 0.02));
  const heading = bearingOf(behind, ahead);
  // the chart follows the raft west
  const center: [number, number] = [interpolate(t, [0, 1], [-101, -117], clamp), interpolate(t, [0, 1], [-10, -12], clamp)];
  const proj = chartProj(center, 10.5);
  const P = (p: [number, number]) => proj(p) as [number, number];
  const fixes = Array.from({ length: DAYS }, (_, i) => P(along(ROUTE, i / (DAYS - 1))));
  const coastK = interpolate(frame, [18, 110], [0, 1], clamp);
  const cursor = frame < FIX0 ? interpolate(frame, [20, FIX0], [0, 300], { ...clamp, easing: (x) => x * x * (3 - 2 * x) }) : heading;
  const landed = interpolate(frame, [FIX1, FIX1 + 6, FIX1 + 40], [0, 1, 0.6], clamp);
  const flick = 0.96 + 0.04 * Math.sin(frame * 1.7) * Math.sin(frame * 0.37);
  const raroia = P([-142.45, -16.05]);
  const callao = P([-77.15, -12.05]);
  return (
    <AbsoluteFill style={{ background: C.enamel }}>
      <Bed id="sea_rough" from={0} to={demo.frames} volume={0.07} />
      <Bed id="ship_creak" from={60} to={demo.frames} volume={0.05} />
      <Sfx src={SFX.riser} at={0} volume={0.12} />
      {Array.from({ length: 20 }, (_, i) => FIX0 + Math.round(((FIX1 - FIX0) * i) / 19)).map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.1} />)}
      {NOTES.map((n) => <Sfx key={n.at} src={SFX.pop} at={n.at} volume={0.12} />)}
      <Hit id="splash_big" at={FIX1} volume={0.25} />
      <Hit id="ship_bell" at={FIX1 + 8} volume={0.18} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs />
        <Console>
          {/* brass name plate: the kicker and the title */}
          <g>
            <rect x={110 + 8} y={52 + 10} width={860} height={214} rx={14} fill="#000" opacity={0.5} />
            <rect x={110} y={52} width={860} height={214} rx={14} fill="url(#m36-brassBar)" />
            <rect x={110} y={52} width={860} height={214} rx={14} filter="url(#m36-brush)" />
            <rect x={124} y={66} width={832} height={186} rx={8} fill="none" stroke="#3a280e" strokeWidth={2} />
            {[[134, 76], [946, 76], [134, 242], [946, 242]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={7} fill="#5a3f14" />)}
            <g fontFamily={font} textAnchor="middle" opacity={on}>
              <text x={540} y={110} fontSize={28} fontWeight={700} fill="#3a280e" letterSpacing={4}>M36 · จอนำทางเรือเก่า</text>
              <text x={540} y={192} fontSize={78} fontWeight={700} fill="#2a1c08">แพคอน-ติกิ</text>
              <text x={540} y={236} fontSize={30} fontWeight={600} fill="#4a3410" letterSpacing={2}>เปรู → หมู่เกาะตูอาโมตู · ค.ศ. 1947</text>
            </g>
          </g>

          <Bezel bearing={cursor} />
          <Face k={on * flick}>
            <Graticule proj={proj} k={coastK} />
            <Rings k={coastK} />
            <Coast proj={proj} k={coastK} />
            {ATOLLS.map((a, i) => {
              const p = P(a);
              return <Atoll key={i} x={p[0]} y={p[1]} k={interpolate(frame, [300 + i * 6, 320 + i * 6], [0, 1], clamp)} r={i === 0 ? 7 : 4.5} />;
            })}
            <Track pts={fixes} n={frame >= FIX0 ? day : 0} />
            {frame >= FIX0 ? <ShipMark x={P(pos)[0]} y={P(pos)[1]} heading={heading} frame={frame} /> : null}
            {/* the bearing hairline across the face */}
            <path d={`M${SC.x} ${SC.y} L${SC.x + Math.sin((cursor * Math.PI) / 180) * SC.r} ${SC.y - Math.cos((cursor * Math.PI) / 180) * SC.r}`} stroke={C.phos} strokeWidth={1.4} opacity={0.35} strokeDasharray="10 6" />
            <PLabel x={callao[0] - 14} y={callao[1] + 40} text="กัลเลา" anchor="end" k={interpolate(frame, [60, 80], [0, 1], clamp) * interpolate(callao[0], [SC.x + SC.r - 10, SC.x + SC.r + 40], [1, 0], clamp)} />
            <PLabel x={callao[0] + 10} y={callao[1] - 60} text="เปรู" size={30} k={interpolate(frame, [60, 80], [0, 1], clamp) * interpolate(callao[0], [SC.x + SC.r, SC.x + SC.r + 80], [1, 0], clamp)} />
            <PLabel x={raroia[0] + 4} y={raroia[1] + 44} text="ราโรอา" k={interpolate(frame, [330, 350], [0, 1], clamp)} />
            <PLabel x={raroia[0] - 20} y={raroia[1] - 70} text="ตูอาโมตู" size={22} k={interpolate(frame, [330, 350], [0, 0.8], clamp)} anchor="end" />
            {/* readouts in the face */}
            <PLabel x={SC.x - 250} y={SC.y - 250} text={`วันที่ ${String(Math.max(1, day)).padStart(3, "0")}`} size={30} k={interpolate(frame, [FIX0 - 10, FIX0], [0, 1], clamp)} />
            <PLabel x={SC.x + 250} y={SC.y - 250} text={`ทิศ ${String(Math.round(cursor)).padStart(3, "0")}°`} size={30} anchor="end" k={interpolate(frame, [FIX0 - 10, FIX0], [0, 1], clamp)} />
            <PLabel x={SC.x} y={SC.y + SC.r - 44} text="ภาพจำลอง · เส้นทางโดยประมาณ" size={20} anchor="middle" k={0.7 * coastK} />
            {/* reef strike: the whole face blooms */}
            <circle cx={raroia[0]} cy={raroia[1]} r={24 + landed * 70} fill="none" stroke={C.phosHot} strokeWidth={3} opacity={landed * 0.7} filter="url(#m36-glow)" />
            <circle cx={raroia[0]} cy={raroia[1]} r={20 + landed * 30} fill={C.phos} opacity={landed * 0.18} filter="url(#m36-glow)" />
            <Snow frame={frame} />
          </Face>
          <Glare />

          {/* the panel below: knobs and the dead-reckoning card */}
          <Knob x={142} y={1430} r={52} rot={-60 + t * 120} label="ระยะ" />
          <Knob x={142} y={1680} r={52} rot={cursor} label="ทิศ" />
          <Card x={262} y={1330} w={760} h={520}>
            <text x={290} y={1396} fontFamily={font} fontSize={30} fontWeight={700} fill="#3a2c18" letterSpacing={2}>บันทึกเดินเรือ · DR</text>
            <text x={994} y={1396} textAnchor="end" fontFamily={font} fontSize={22} fontWeight={600} fill="#6a5a3a">ปลายทาง: ราโรอา</text>
            {NOTES.map((n, i) => (
              <Pencil key={n.at} id={`m36-n${i}`} x={290} y={1470 + i * 62 - 14} text={n.t} size={i === NOTES.length - 1 ? 34 : 32} k={interpolate(frame, [n.at, n.at + 26], [0, 1], clamp)} color={i === NOTES.length - 1 ? "#d8541c" : C.pencil} />
            ))}
          </Card>
          <Engraved x={540} y={1906} text="จอจำลองเพื่อเล่าเรื่อง · แผนที่จาก Natural Earth · ข้อมูล: Kon-Tiki Museum, Britannica" size={17} anchor="middle" weight={400} spacing={0} />
        </Console>
      </svg>
    </AbsoluteFill>
  );
};
