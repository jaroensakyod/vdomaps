import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { C, Casing, clamp, Dial, Drum, fade, font, Glass, GridPaper, Lamp, Lettering, PenLine, PenMap, Plate, Plotter, pointAt, ringPath, seismo, usePaperMap, type Box } from "./kit/Recorder";

// M14 seismograph: the M7.7 earthquake of 28 March 2025 (Sagaing Fault, near Mandalay, Myanmar; USGS) told on a
// chart recorder. The drum writes the seismogram, the magnitude dial climbs, the alarm lamp blinks, and the pen
// plotter draws the epicentre rings on the millimetre-paper map until the 1,000 km ring reaches Bangkok. 15 s.
export const demo: StyleDemo = { id: "M14", name: "เครื่องบันทึกแผ่นดินไหว", frames: 450, cover: 340, sizes: ["9x16"] };

const MAP: Box = [70, 440, 940, 760];
const DRUM: Box = [84, 1262, 912, 300];
const TAPE: Box = [70, 1628, 940, 150];
const EXTENT: [number, number, number, number] = [91, 12.2, 104.5, 26.2];
const EPI: [number, number] = [95.92, 22.01]; // USGS epicentre (approx.)
const BKK: [number, number] = [100.5, 13.76];
const FAULT: [number, number][] = [[96.1, 25.6], [95.95, 23.6], [95.98, 22.0], [96.15, 20.4], [96.3, 18.9], [96.4, 17.7], [96.2, 16.4]];
const RINGS = [100, 250, 500, 750, 1000];
const RING_F = (i: number) => 92 + i * 32; // each ring takes 30 frames to draw
const P = 52; // P-wave arrival on the drum
const S = 84; // S-wave arrival

const LINES = [
  { text: "แผ่นดินไหวขนาด 7.7 ที่เมียนมา", f0: 8, f1: 132 },
  { text: "ศูนย์กลางอยู่บนรอยเลื่อนสะกาย", f0: 132, f1: 252 },
  { text: "คลื่นเดินทางไกลราว 1,000 กิโลเมตร", f0: 252, f1: 352 },
  { text: "จนตึกสูงในกรุงเทพฯ ยังโยกไหว", f0: 352, f1: 470 },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { projection, path } = usePaperMap(MAP, EXTENT);
  const pr = (p: [number, number]) => projection(p) as [number, number];
  const rings = RINGS.map((km) => ringPath(projection, EPI, km));
  const ringK = (i: number) => interpolate(frame, [RING_F(i), RING_F(i) + 30], [0, 1], clamp);
  const line = [pr(EPI), pr(BKK)];
  const lineK = interpolate(frame, [262, 300], [0, 1], clamp);
  // where the plotter pen is: drawing a ring, travelling between rings, drawing the distance line, then parked
  let pen: [number, number] = [MAP[0] + MAP[2] - 60, MAP[1] + 60];
  let down = false;
  const active = RINGS.findIndex((_, i) => frame >= RING_F(i) && frame < RING_F(i) + 30);
  if (frame < RING_F(0)) pen = [interpolate(frame, [60, RING_F(0)], [pen[0], rings[0][0][0]], clamp), interpolate(frame, [60, RING_F(0)], [pen[1], rings[0][0][1]], clamp)];
  else if (active >= 0) [pen, down] = [pointAt(rings[active], ringK(active)), true];
  else if (frame < RING_F(RINGS.length)) {
    const i = RINGS.findIndex((_, j) => frame >= RING_F(j) + 30 && frame < RING_F(j + 1));
    const t = (frame - RING_F(i) - 30) / 2;
    const a = rings[i][rings[i].length - 1];
    const b = rings[Math.min(RINGS.length - 1, i + 1)][0];
    pen = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  } else if (frame < 262) pen = [interpolate(frame, [RING_F(RINGS.length), 262], [rings[4][0][0], line[0][0]], clamp), interpolate(frame, [RING_F(RINGS.length), 262], [rings[4][0][1], line[0][1]], clamp)];
  else if (frame < 300) [pen, down] = [pointAt(line, lineK), true];
  else pen = [interpolate(frame, [300, 330], [line[1][0], MAP[0] + MAP[2] - 60], clamp), interpolate(frame, [300, 330], [line[1][1], MAP[1] + 20], clamp)];
  // pen-up travel inside the window only
  pen = [Math.max(MAP[0] + 30, Math.min(MAP[0] + MAP[2] - 30, pen[0])), Math.max(MAP[1] + 30, Math.min(MAP[1] + MAP[3] - 30, pen[1]))];

  const mag = interpolate(frame, [S, S + 46], [0, 7.7], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }) + (frame > S && frame < S + 120 ? Math.sin(frame * 1.9) * 0.12 * (1 - (frame - S) / 120) : 0);
  const km = active >= 0 ? RINGS[active] * ringK(active) + (active ? 0 : 0) : frame >= RING_F(4) + 30 ? 1000 : frame >= RING_F(0) ? RINGS[Math.max(0, RINGS.findIndex((_, j) => frame < RING_F(j)) - 1)] : 0;
  const alarm = frame >= S && frame < 330 ? (Math.floor(frame / 8) % 2 === 0 ? 1 : 0.15) : 0;
  const print = interpolate(frame, [0, 40], [0, 1], clamp);
  const [ex, ey] = pr(EPI);
  const [bx, by] = pr(BKK);
  return (
    <AbsoluteFill style={{ background: C.casing }}>
      <Sfx src={SFX.swell} at={4} volume={0.2} />
      <Hit id="thunder_rumble" at={S} volume={0.45} />
      <Bed id="wind" from={S} to={330} volume={0.06} />
      {RINGS.map((_, i) => <Sfx key={i} src={SFX.tick} at={RING_F(i)} volume={0.22} />)}
      {Array.from({ length: 15 }, (_, i) => S + i * 16).map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.08} />)}
      <Sfx src={SFX.hit} at={300} volume={0.25} />
      <Casing windows={[MAP, DRUM]} />
      {/* instrument row: two meters, the alarm lamp and an engraved data plate */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Dial cx={180} cy={268} r={104} value={Math.max(0, mag)} max={9} ticks={[3, 6]} label="ขนาด" unit="M" />
        <Dial cx={420} cy={268} r={104} value={km} max={1200} ticks={[400, 800]} label="ระยะคลื่น" unit="กม." digits={0} />
        <Lamp cx={624} cy={238} on={alarm} label="เตือนภัย" />
        <g fontFamily={font} fill={C.label}>
          <rect x={712} y={156} width={300} height={220} rx={8} fill="#1d2328" stroke="#77828a" strokeWidth={1.5} />
          {[
            ["วันที่", "28 มี.ค. 2568"],
            ["เวลา", "13:20 น."],
            ["ความลึก", "~10 กม."],
            ["ที่มา", "USGS"],
          ].map(([k, v], i) => (
            <g key={k}>
              <text x={732} y={200 + i * 48} fontSize={20} fontWeight={500} fill="#9aa5ac">{k}</text>
              <text x={994} y={200 + i * 48} fontSize={27} fontWeight={700} textAnchor="end">{v}</text>
              {i < 3 && <line x1={732} x2={994} y1={214 + i * 48} y2={214 + i * 48} stroke="#4a545b" strokeWidth={1} />}
            </g>
          ))}
        </g>
      </svg>
      <Plate x={70} y={50} w={940} h={68}>
        <span style={{ fontSize: 32 }}>M14 · เครื่องบันทึกแผ่นดินไหว</span>
      </Plate>
      {/* the map sheet */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <clipPath id="m14-map">
          <rect x={MAP[0]} y={MAP[1]} width={MAP[2]} height={MAP[3]} />
        </clipPath>
        <g clipPath="url(#m14-map)">
          <GridPaper box={MAP} />
          <PenMap box={MAP} path={path} print={print} />
          <PenLine pts={FAULT.map(pr)} k={interpolate(frame, [134, 176], [0, 1], clamp)} color={C.ink} width={3} dash="16 6" />
          <Lettering x={pr(FAULT[1])[0] + 18} y={pr(FAULT[1])[1]} text="รอยเลื่อนสะกาย" size={26} on={fade(frame, 150, 999)} />
          <Lettering x={pr(FAULT[1])[0] + 18} y={pr(FAULT[1])[1] + 28} text="(แนวโดยประมาณ)" size={20} weight={500} on={fade(frame, 150, 999)} />
          {rings.map((r, i) => <PenLine key={i} pts={r} k={ringK(i)} width={i === 4 ? 3.2 : 2.2} />)}
          {RINGS.map((km, i) => {
            const p = rings[i][Math.floor(rings[i].length * 0.13)];
            return <Lettering key={km} x={p[0] + 6} y={p[1] - 6} text={`${km.toLocaleString("en-US")} กม.`} size={20} color={C.red} on={frame >= RING_F(i) + 26 && i > 0 ? 1 : 0} />;
          })}
          <PenLine pts={line} k={lineK} color={C.red} width={2.4} dash="6 6" />
          {/* epicentre: a plotted star, Bangkok: a circled dot */}
          <g opacity={fade(frame, S, 999, 4)}>
            <path d={Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5 - Math.PI / 2; const rr = i % 2 ? 9 : 22; return `${i ? "L" : "M"}${ex + Math.cos(a) * rr} ${ey + Math.sin(a) * rr}`; }).join(" ") + "Z"} fill={C.red} stroke={C.ink} strokeWidth={1.5} />
            <Lettering x={ex - 28} y={ey - 26} text="ศูนย์กลาง" size={26} anchor="end" color={C.red} weight={700} />
            <Lettering x={ex - 28} y={ey + 4} text="ใกล้มัณฑะเลย์" size={22} anchor="end" weight={500} />
          </g>
          <g opacity={fade(frame, 290, 999, 6)}>
            <circle cx={bx} cy={by} r={13} fill="none" stroke={C.ink} strokeWidth={2.4} />
            <circle cx={bx} cy={by} r={4.5} fill={C.ink} />
            <Lettering x={bx + 18} y={by - 18} text="กรุงเทพฯ" size={32} weight={700} />
            <Lettering x={bx + 18} y={by + 14} text="ราว 1,000 กม." size={26} color={C.red} weight={700} />
          </g>
          <Lettering x={pr([96.16, 16.84])[0] + 12} y={pr([96.16, 16.84])[1] + 8} text="ย่างกุ้ง" size={22} weight={500} on={print} />
          <Lettering x={pr([98.99, 18.79])[0] + 10} y={pr([98.99, 18.79])[1] + 8} text="เชียงใหม่" size={22} weight={500} on={print} />
          <circle cx={pr([96.16, 16.84])[0]} cy={pr([96.16, 16.84])[1]} r={4} fill={C.ink} opacity={print} />
          <circle cx={pr([98.99, 18.79])[0]} cy={pr([98.99, 18.79])[1]} r={4} fill={C.ink} opacity={print} />
          {/* engineering title block in the empty Andaman Sea corner */}
          <g opacity={print} fontFamily={font} fill={C.ink}>
            <rect x={90} y={1004} width={420} height={176} fill={C.paper} stroke={C.ink} strokeWidth={2.4} />
            <line x1={90} x2={510} y1={1092} y2={1092} stroke={C.ink} strokeWidth={1.4} />
            <line x1={90} x2={510} y1={1136} y2={1136} stroke={C.ink} strokeWidth={1.4} />
            <line x1={300} x2={300} y1={1136} y2={1180} stroke={C.ink} strokeWidth={1.4} />
            <text x={106} y={1046} fontSize={38} fontWeight={700}>แผ่นดินไหว M 7.7</text>
            <text x={106} y={1080} fontSize={24} fontWeight={500}>เมียนมา · 28 มีนาคม 2568</text>
            <text x={106} y={1123} fontSize={21} fontWeight={500}>วงรัศมีจากศูนย์กลาง 100–1,000 กม.</text>
            <text x={106} y={1166} fontSize={19} fontWeight={500}>แผ่นที่ 01/01</text>
            <text x={316} y={1166} fontSize={19} fontWeight={600} fill={C.red}>ข้อมูล: USGS</text>
          </g>
          <Plotter box={MAP} pen={pen} down={down} />
        </g>
        <Glass box={MAP} />
        {/* the drum */}
        <Drum box={DRUM} frame={frame} speed={2.4} stylusX={790} signal={(t) => seismo(t, P, S)} marks={[{ f: 20, text: "13:20" }, { f: 80, text: "13:21" }, { f: 140, text: "13:22" }, { f: 200, text: "13:23" }, { f: 260, text: "13:24" }, { f: 320, text: "13:25" }, { f: 380, text: "13:26" }]} />
        <rect x={DRUM[0] + 12} y={DRUM[1] + 10} width={268} height={34} rx={4} fill={C.paper} opacity={0.9} />
        <text x={DRUM[0] + 24} y={DRUM[1] + 35} fontFamily={font} fontWeight={600} fontSize={21} fill={C.ink}>ภาพจำลอง · เวลาย่นย่อ</text>
        <Glass box={[DRUM[0] - 14, DRUM[1] - 14, DRUM[2] + 28, DRUM[3] + 28]} />
        {/* caption on a printed tape */}
        <rect x={TAPE[0]} y={TAPE[1]} width={TAPE[2]} height={TAPE[3]} rx={8} fill="#15191c" stroke="#7d888f" strokeWidth={2} />
        <rect x={TAPE[0] + 8} y={TAPE[1] + 8} width={TAPE[2] - 16} height={TAPE[3] - 16} rx={4} fill="none" stroke="#3c454b" strokeWidth={1.5} />
        {LINES.map((l) => {
          if (frame < l.f0 || frame >= l.f1) return null;
          const wipe = interpolate(frame, [l.f0, l.f0 + 16], [0, 1], clamp);
          return (
            <g key={l.f0}>
              <clipPath id={`m14-cap-${l.f0}`}>
                <rect x={TAPE[0]} y={TAPE[1]} width={TAPE[2] * wipe} height={TAPE[3]} />
              </clipPath>
              <text x={540} y={TAPE[1] + 94} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={50} fill={l.f0 === 252 ? "#ff6a55" : "#e8ece9"} clipPath={`url(#m14-cap-${l.f0})`}>
                {l.text}
              </text>
            </g>
          );
        })}
        {[[TAPE[0] + 22, TAPE[1] + 22], [TAPE[0] + TAPE[2] - 22, TAPE[1] + 22], [TAPE[0] + 22, TAPE[1] + TAPE[3] - 22], [TAPE[0] + TAPE[2] - 22, TAPE[1] + TAPE[3] - 22]].map(([cx, cy], i) => <g key={i}><circle cx={cx} cy={cy} r={7} fill="#aab1b5" stroke="#2b3238" strokeWidth={1.5} /><path d={`M${cx - 4} ${cy - 2} l8 4`} stroke="#3d454b" strokeWidth={2} /></g>)}
        <text x={540} y={1850} textAnchor="middle" fontFamily={font} fontWeight={500} fontSize={21} fill="#dfe8e0">
          ข้อมูลแผ่นดินไหว: USGS · แผนที่วาดจาก Natural Earth · คลื่นในเครื่องบันทึกเป็นภาพจำลอง
        </text>
      </svg>
    </AbsoluteFill>
  );
};
