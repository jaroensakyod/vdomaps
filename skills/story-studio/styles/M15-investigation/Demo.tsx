import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { at, Bungalow, C, clamp, CorkBoard, IndexCard, JunglePath, LampLight, Paper, Pin, PinDefs, PrintedMap, SilkBolt, Typed, type, useSheetMap, Yarn } from "./kit/Cork";

// M15 investigation board: the disappearance of Jim Thompson, the American who revived Thai silk, in the Cameron
// Highlands, Malaysia, on 26 March 1967 — he went out for a walk and was never found. Typed cards and ink-drawn
// evidence are pinned to a cork board under a desk lamp; red yarn runs pin to pin and pulls tight as each clue
// connects. 15 s.
export const demo: StyleDemo = { id: "M15", name: "กระดานสืบสวน", frames: 450, cover: 392, sizes: ["9x16"] };

const SHEET = { x: 136, y: 360, w: 800, h: 910, rot: -3 };
const EXTENT: [number, number, number, number] = [96.4, 1.0, 106.4, 15.0];
const BKK: [number, number] = [100.5, 13.75];
const CAMERON: [number, number] = [101.38, 4.47]; // Tanah Rata, Cameron Highlands

const CARDS = {
  name: { x: 712, y: 372, rot: 5, f: 26 },
  date: { x: 30, y: 806, rot: -6, f: 112 },
  place: { x: 716, y: 1000, rot: 4, f: 190 },
};
const EVID = [
  { x: 52, y: 1296, rot: -7, f: 228, title: "บ้านพักบนเขา", Draw: Bungalow },
  { x: 392, y: 1326, rot: 4, f: 268, title: "ออกไปเดินเล่น", Draw: JunglePath },
  { x: 770, y: 62, rot: 7, f: 76, title: "ผู้ฟื้นฟูไหมไทย", Draw: SilkBolt },
];
const EW = 296;
const EH = 262;
const STATUS = { x: 120, y: 1590, rot: -2.5, f: 330 };
const THEORY = { x: 728, y: 1290, rot: -3.5, f: 300 };

const LINES = [
  { text: "26 มี.ค. 1967 จิม ทอมป์สัน ออกไปเดินเล่น", f0: 10, f1: 124 },
  { text: "บนแคเมอรอนไฮแลนด์ ประเทศมาเลเซีย", f0: 124, f1: 232 },
  { text: "แล้วไม่ได้กลับมาอีกเลย", f0: 232, f1: 340 },
  { text: "จนวันนี้ ยังไม่มีใครพบตัวเขา", f0: 340, f1: 470 },
];

// a point in the sheet's own pixels → screen, through the sheet's small rotation about its centre
const onSheet = ([px, py]: [number, number]): [number, number] => {
  const a = (SHEET.rot * Math.PI) / 180;
  const cx = SHEET.w / 2;
  const cy = SHEET.h / 2;
  const dx = px - cx;
  const dy = py - cy;
  return [SHEET.x + cx + dx * Math.cos(a) - dy * Math.sin(a), SHEET.y + cy + dx * Math.sin(a) + dy * Math.cos(a)];
};
const cardPin = (c: { x: number; y: number }, w = 330): [number, number] => [c.x + w / 2, c.y + 18];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { projection, path } = useSheetMap(SHEET.w, SHEET.h, EXTENT);
  const bkkS = projection(BKK) as [number, number];
  const camS = projection(CAMERON) as [number, number];
  const bkk = onSheet(bkkS);
  const cam = onSheet(camS);
  const pName = cardPin(CARDS.name);
  const pDate = cardPin(CARDS.date);
  const pPlace = cardPin(CARDS.place);
  const pEv = EVID.map((e) => cardPin(e, EW));
  const pStat = cardPin(STATUS, 520);
  const pTheory = cardPin(THEORY, 300);
  const lamp = interpolate(frame, [0, 14, 18, 22, 40], [0.3, 0.9, 0.55, 1, 1], clamp);
  // [from, to, start frame]: drawn on in 22 frames, pulled tight over the next 26
  const YARNS: [[number, number], [number, number], number, number][] = [
    [bkk, pName, 40, 150],
    [pName, pEv[2], 86, 170],
    [bkk, cam, 128, 230],
    [cam, pDate, 156, 160],
    [cam, pPlace, 204, 120],
    [cam, pEv[0], 244, 130],
    [pEv[0], pEv[1], 284, 90],
    [pEv[1], pTheory, 306, 80],
    [pEv[1], pStat, 344, 110],
  ];
  const cap = LINES.find((l) => frame >= l.f0 && frame < l.f1);
  return (
    <AbsoluteFill style={{ background: C.cork }}>
      <Bed id="rain_light" from={0} to={demo.frames} volume={0.08} />
      {[CARDS.name.f, CARDS.date.f, CARDS.place.f, ...EVID.map((e) => e.f), 300, STATUS.f].map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.22} />)}
      {YARNS.map(([, , f]) => <Sfx key={f} src={SFX.tick} at={f + 22} volume={0.25} />)}
      {LINES.flatMap((l) => Array.from({ length: 10 }, (_, i) => l.f0 + 2 + i * 3)).map((f) => <Sfx key={`t${f}`} src={SFX.tick} at={f} volume={0.07} />)}
      <CorkBoard />
      {/* kicker strip and title card */}
      <Paper x={70} y={64} w={470} h={66} rot={-1.6} bg="#d4ac6c">
        <div style={{ position: "absolute", left: 50, top: 10 }}>
          <Typed text="M15 · กระดานสืบสวน" size={34} weight={600} />
        </div>
      </Paper>
      <Paper x={56} y={150} w={700} h={176} rot={-2} bg="#d4ac6c">
        <div style={{ position: "absolute", left: 40, top: 18 }}>
          <Typed text="คดีหายตัวปริศนา" size={68} weight={700} />
          <Typed text="จิม ทอมป์สัน · มาเลเซีย ค.ศ. 1967" size={34} color="#5a4a3e" style={{ marginTop: 2 }} />
        </div>
        <svg width={700} height={176} style={{ position: "absolute", inset: 0 }}>
          <path d="M40 112 H560" stroke="#9e1c1f" strokeWidth={2.4} strokeDasharray="14 3" />
        </svg>
      </Paper>
      {/* the printed map */}
      <div style={{ position: "absolute", left: SHEET.x, top: SHEET.y, width: SHEET.w, height: SHEET.h, transform: `rotate(${SHEET.rot}deg)`, filter: "drop-shadow(8px 12px 9px rgba(20,8,0,0.6))" }}>
        <PrintedMap w={SHEET.w} h={SHEET.h} path={path}>
          {[
            [BKK, "กรุงเทพฯ", -22, 8, "end", 28],
            [CAMERON, "แคเมอรอนไฮแลนด์", -20, 40, "end", 26],
            [[100.6, 16.1], "ไทย", 0, 0, "middle", 32],
            [[102.9, 2.5], "มาเลเซีย", 0, 0, "middle", 30],
            [[97.6, 9.0], "ทะเลอันดามัน", 0, 0, "middle", 22],
            [[102.0, 9.6], "อ่าวไทย", 0, 0, "middle", 22],
          ].map(([p, t, dx, dy, anchor, size]) => {
            const [x, y] = projection(p as [number, number]) as [number, number];
            return (
              <text key={t as string} x={x + (dx as number)} y={y + (dy as number)} textAnchor={anchor as "start"} fontFamily={type} fontWeight={600} fontSize={size as number} fill={(size as number) < 24 ? "#5d7a85" : "#3d2a1c"} fontStyle={(size as number) < 24 ? "italic" : undefined}>
                {t as string}
              </text>
            );
          })}
          <text x={SHEET.w - 18} y={SHEET.h - 18} textAnchor="end" fontFamily={type} fontSize={18} fill="#6e5a48">แผนที่วาดจาก Natural Earth</text>
          <circle cx={bkkS[0]} cy={bkkS[1]} r={5} fill="#3d2a1c" />
          <circle cx={camS[0]} cy={camS[1]} r={5} fill="#3d2a1c" />
        </PrintedMap>
      </div>
      {/* index cards */}
      <IndexCard {...CARDS.name} k={at(frame, CARDS.name.f, CARDS.name.f + 14)} label="บุคคล" value={"จิม ทอมป์สัน\nนักธุรกิจผ้าไหม\nชาวอเมริกัน"} h={214} chars={(frame - CARDS.name.f - 8) * 1.6} />
      <IndexCard {...CARDS.date} k={at(frame, CARDS.date.f, CARDS.date.f + 14)} label="วันที่หายตัว" value={"26 มี.ค. 1967\nวันอาทิตย์อีสเตอร์"} chars={(frame - CARDS.date.f - 8) * 1.6} />
      <IndexCard {...CARDS.place} k={at(frame, CARDS.place.f, CARDS.place.f + 14)} label="สถานที่" value={"แคเมอรอนไฮแลนด์\nรัฐปะหัง มาเลเซีย"} chars={(frame - CARDS.place.f - 8) * 1.6} />
      {/* ink-drawn evidence cards */}
      {EVID.map(({ x, y, rot, f, title, Draw }) => (
        <Paper key={title} x={x} y={y} w={EW} h={EH} rot={rot} k={at(frame, f, f + 14)} bg="#d9bd88">
          <div style={{ position: "absolute", left: 14, top: 30, width: EW - 28, height: 160, border: "1.5px solid #7a5f3a", background: "#efe3c4" }}>
            <Draw w={EW - 28} h={160} />
          </div>
          <div style={{ position: "absolute", left: 16, top: 196, right: 12 }}>
            <Typed text={title} size={30} weight={600} />
          </div>
          <div style={{ position: "absolute", right: 14, top: 4 }}>
            <Typed text="ภาพประกอบ" size={18} color="#7a6a58" />
          </div>
        </Paper>
      ))}
      <IndexCard {...THEORY} w={300} h={262} k={at(frame, THEORY.f, THEORY.f + 14)} bg="#f3dc84" label="สมมติฐานที่มีผู้เสนอ" value={["หลงป่า?", "อุบัติเหตุ?", "ถูกลักพาตัว?"].join(String.fromCharCode(10))} chars={(frame - 308) * 1.6} />
      <IndexCard {...STATUS} w={520} h={130} k={at(frame, STATUS.f, STATUS.f + 14)} bg="#efb3a2" label="สถานะคดี" value="ยังไม่พบตัว" red chars={(frame - STATUS.f - 8) * 1.2} />
      {/* yarn and pins on top of the paper */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <PinDefs />
        {YARNS.map(([a, b, f, sag], i) => (
          <Yarn key={i} a={a} b={b} k={at(frame, f, f + 22)} tight={interpolate(frame, [f + 22, f + 48], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 4) * Math.cos(t * 9) })} sag={sag} />
        ))}
        <Pin x={88} y={96} />
        <Pin x={pTheory[0]} y={pTheory[1]} k={at(frame, THEORY.f + 6, THEORY.f + 16)} />
        <Pin x={onSheet([24, 24])[0]} y={onSheet([24, 24])[1]} />
        <Pin x={onSheet([SHEET.w - 24, 24])[0]} y={onSheet([SHEET.w - 24, 24])[1]} />
        <Pin x={bkk[0]} y={bkk[1]} k={at(frame, 30, 42)} />
        <Pin x={cam[0]} y={cam[1]} k={at(frame, 120, 132)} />
        {([[CARDS.name.f, pName], [CARDS.date.f, pDate], [CARDS.place.f, pPlace], ...EVID.map((e, i) => [e.f, pEv[i]]), [STATUS.f, pStat]] as [number, [number, number]][]).map(([f, p], i) => (
          <Pin key={i} x={p[0]} y={p[1]} k={at(frame, f + 6, f + 16)} />
        ))}
      </svg>
      <LampLight on={lamp} />
      {/* typed caption strip, typed letter by letter */}
      <Paper x={90} y={1730} w={900} h={118} rot={-1.8} bg="#f4eee0">
        {cap && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 22, textAlign: "center" }}>
            <Typed text={cap.text} size={48} weight={700} chars={(frame - cap.f0) * 2.2} color={cap.f0 === 340 ? "#9e1c1f" : C.ink} />
          </div>
        )}
      </Paper>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <PinDefs />
        <Pin x={116} y={1768} />
        <Pin x={962} y={1740} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1858, textAlign: "center", fontFamily: type, fontSize: 20, color: "#d9c6a6" }}>
        เรื่องจริงตามบันทึกข่าว · ภาพวาดเป็นภาพประกอบ · แผนที่จาก Natural Earth
      </div>
    </AbsoluteFill>
  );
};
