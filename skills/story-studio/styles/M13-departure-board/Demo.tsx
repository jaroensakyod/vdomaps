import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { C, Casing, EnamelPlate, clamp, Digits, expand, fade, FlapText, flipFrames, font, landPath, LedCity, LedDefs, LedPanel, LedRoute, LedText, Sheen, useLedMap, type Box } from "./kit/Board";

// M13 departure board: Operation Barbarossa (22 Jun 1941) as a station split-flap board. Three army groups are
// three "routes"; their destination, day and status blades flip; each route lights up dot by dot on the amber LED
// map. North encircles Leningrad on day 79, South takes Kyiv on day 90, Centre is halted before Moscow (counter-
// offensive 5 Dec 1941, day 167). Day numbers count 22 Jun as day 1. 15 s.
export const demo: StyleDemo = { id: "M13", name: "กระดานขบวนทัพ", frames: 450, cover: 425, sizes: ["9x16"] };

const MAP: Box = [64, 528, 952, 628];
const EXTENT: [number, number, number, number] = [14, 44.5, 42, 61.5];
// [frame, day] — day 1 = 22 June 1941
const DAYS: [number, number][] = [[24, 1], [120, 25], [232, 79], [272, 90], [318, 108], [392, 167]];
const dayAt = (f: number) => interpolate(f, DAYS.map((d) => d[0]), DAYS.map((d) => d[1]), clamp);

type Way = [number, number, number]; // lon, lat, day reached
const NORTH: Way[] = [[21.4, 54.7, 1], [26.5, 55.9, 5], [28.3, 57.8, 18], [30.3, 59.9, 79]];
const CENTRE: Way[] = [[23.7, 52.1, 1], [27.56, 53.9, 7], [32.05, 54.78, 25], [32.05, 54.78, 100], [34.3, 55.2, 108], [36.6, 55.8, 160]];
const SOUTH: Way[] = [[23.4, 50.7, 1], [24.03, 49.84, 9], [28.66, 50.25, 18], [30.52, 50.45, 90]];

const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const dateOf = (day: number) => {
  const d = new Date(Date.UTC(1941, 5, 21 + Math.max(1, Math.floor(day))));
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} 1941`;
};
const POOL = ["ริกา", "วอร์ซอ", "มินสค์", "โอเดสซา", "คาร์คอฟ", "ทาลลินน์", "เคิร์สก์", "ลวีฟ", "ปัสคอฟ"];
const STATUS_POOL = ["ตามกำหนด", "ล่าช้า", "รอสัญญาณ", "ยกเลิก"];

const ROWS = [
  { badge: "เหนือ", color: "#2f6db0", way: NORTH, dest: "เลนินกราด", arrive: 79, status: [[40, "กำลังรุก", 3], [232, "ปิดล้อม", 3]] as [number, string, number][] },
  { badge: "กลาง", color: "#6b7471", way: CENTRE, dest: "มอสโก", arrive: 167, status: [[48, "กำลังรุก", 3], [392, "ถูกหยุด", 4]] as [number, string, number][] },
  { badge: "ใต้", color: "#2e8a57", way: SOUTH, dest: "เคียฟ", arrive: 90, status: [[56, "กำลังรุก", 3], [272, "ยึดได้", 3]] as [number, string, number][] },
];
const LINES = [
  { text: "22 มิ.ย. 1941 เยอรมนีบุกโซเวียตสามสาย", f0: 6, f1: 136 },
  { text: "สายเหนือปิดล้อมเลนินกราด วันที่ 79", f0: 136, f1: 262 },
  { text: "สายใต้ยึดเคียฟได้ ในวันที่ 90", f0: 262, f1: 372 },
  { text: "สายกลางถูกหยุด หน้ากรุงมอสโก", f0: 372, f1: 470 },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const day = dayAt(frame);
  const { projection, path } = useLedMap(MAP, EXTENT);
  const land = landPath(path);
  const scr = (w: Way[]) => w.map(([lon, lat]) => projection([lon, lat]) as [number, number]);
  // fraction of a route's screen length reached on `day`
  const progress = (w: Way[]) => {
    const pts = scr(w);
    const seg = pts.map((p, i) => (i ? Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0));
    const total = seg.reduce((a, b) => a + b, 0);
    let acc = 0;
    for (let i = 1; i < w.length; i++) {
      if (day <= w[i][2]) return (acc + seg[i] * Math.max(0, (day - w[i - 1][2]) / Math.max(1e-6, w[i][2] - w[i - 1][2]))) / total;
      acc += seg[i];
    }
    return 1;
  };
  const halted = frame >= 392;
  const destLists = ROWS.map((r, i) => expand([[30 + i * 8, r.dest, 5]], POOL, 5, `d${i}`));
  const statusLists = ROWS.map((r, i) => expand(r.status, STATUS_POOL, 5, `s${i}`));
  const titleList = expand([[8, "ปฏิบัติการบาร์บารอสซา", 4]], ["ขบวนพิเศษ", "เที่ยวเดียว", "แนวรบตะวันออก", "ไม่หยุดทุกสถานี"], 5, "t");
  const dateList: [number, string][] = Array.from({ length: 450 }, (_, f) => [f, dateOf(dayAt(f))] as [number, string]).filter((d, i, a) => i === 0 || d[1] !== a[i - 1][1]);
  const flips = [...titleList, ...destLists.flat(), ...statusLists.flat()].map((d) => d[0]);
  const on = interpolate(frame, [4, 20], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#c2c7c5" }}>
      <Bed id="army_marching" from={20} to={392} volume={0.07} />
      <Bed id="wind_storm" from={380} to={demo.frames} volume={0.1} />
      <Hit id="explosions_distant" at={392} volume={0.18} />
      {flipFrames(flips.map((f) => [f, ""] as [number, string])).filter((f, i, a) => a.indexOf(f) === i).map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.12} />)}
      <Sfx src={SFX.hit} at={232} volume={0.2} />
      <Sfx src={SFX.hit} at={272} volume={0.2} />
      <Casing modules={[]} />
      <div style={{ position: "absolute", inset: 0, transform: "scale(0.92)", transformOrigin: "50% 62%" }}>
      <Casing bare modules={[[168, 494], [512, 1172], [1192, 1616], [1636, 1790]]} />
      <EnamelPlate x={48} y={44} w={984} h={104} left="M13 · กระดานขบวนทัพ" right="ขบวนทัพออก" />
      {/* header: kicker in LED, title blade, day counter and date blade */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <LedDefs box={MAP} />
      </svg>
      <FlapText list={titleList} frame={frame} x={60} y={192} w={960} h={100} size={58} weight={700} />
      <div style={{ position: "absolute", left: 66, top: 310, fontFamily: font, fontSize: 26, fontWeight: 600, color: "#8f8a7c", letterSpacing: 4 }}>วันที่</div>
      <div style={{ position: "absolute", left: 454, top: 310, fontFamily: font, fontSize: 26, fontWeight: 600, color: "#8f8a7c", letterSpacing: 4 }}>วันที่ตามปฏิทิน</div>
      <Digits value={(f) => (f < 24 ? 0 : dayAt(f))} frame={frame} n={3} x={60} y={348} w={112} h={128} size={98} color={halted ? "#ff8a6b" : C.cream} />
      <FlapText list={dateList} frame={frame} dur={3} x={454} y={348} w={566} h={128} size={60} weight={700} />
      {/* the LED map */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: on }}>
        <LedDefs box={MAP} />
        <LedPanel box={MAP} land={land}>
          {ROWS.map((r, i) => <LedRoute key={i} id={`${i}`} pts={scr(r.way)} k={progress(r.way)} frame={frame} red={i === 1 && halted} />)}
          <LedCity at={projection([30.3, 59.9]) as [number, number]} text="เลนินกราด" dx={18} dy={-14} on={fade(frame, 40, 999)} flash={fade(frame, 232, 262, 6)} />
          <LedCity at={projection([37.62, 55.75]) as [number, number]} text="มอสโก" dx={18} dy={-26} anchor="start" on={fade(frame, 48, 999)} red={halted} flash={halted ? fade(frame, 392, 440, 6) : 0} />
          <LedCity at={projection([30.52, 50.45]) as [number, number]} text="เคียฟ" dx={18} dy={40} on={fade(frame, 56, 999)} flash={fade(frame, 272, 302, 6)} />
          <LedCity at={projection([32.05, 54.78]) as [number, number]} text="สโมเลนสค์" dx={14} dy={46} anchor="start" size={30} on={fade(frame, 118, 999)} />
          <LedCity at={projection([27.56, 53.9]) as [number, number]} text="มินสค์" dx={-18} dy={12} anchor="end" size={30} on={fade(frame, 40, 999)} />
          <rect x={MAP[0]} y={MAP[1] + MAP[3] - 50} width={250} height={50} fill="#050505" />
          <LedText x={MAP[0] + 14} y={MAP[1] + MAP[3] - 16} text="เส้นทางโดยประมาณ" size={28} weight={600} glow={false} />
        </LedPanel>
      </svg>
      {/* route rows */}
      {["สาย", "ปลายทาง", "วันที่", "สถานะ"].map((t, i) => (
        <div key={t} style={{ position: "absolute", left: [66, 214, 556, 788][i], top: 1198, fontFamily: font, fontSize: 24, fontWeight: 600, color: "#8f8a7c", letterSpacing: 3 }}>{t}</div>
      ))}
      {ROWS.map((r, i) => {
        const y = 1236 + i * 126;
        const stopped = i === 1 && halted;
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: 60, top: y, width: 136, height: 112, borderRadius: 8, background: stopped ? C.red : r.color, color: "#fff", fontFamily: font, fontWeight: 700, fontSize: 40, lineHeight: "112px", textAlign: "center", boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.25)" }}>{r.badge}</div>
            <FlapText list={destLists[i]} frame={frame} x={210} y={y} w={330} h={112} size={52} weight={700} />
            <Digits value={(f) => (f < 30 + i * 8 ? 0 : Math.min(r.arrive, dayAt(f)))} frame={frame} n={3} x={552} y={y} w={68} h={112} gap={6} size={64} />
            <FlapText list={statusLists[i]} frame={frame} x={782} y={y} w={238} h={112} size={42} weight={700} color={(t) => (t === "ถูกหยุด" ? "#ff7656" : t === "ปิดล้อม" || t === "ยึดได้" ? "#ffcf5a" : C.cream)} />
          </div>
        );
      })}
      {/* caption on an LED strip */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <LedDefs box={MAP} />
        
        <rect x={56} y={1642} width={968} height={138} fill="url(#m13-off)" opacity={0.5} />
        {LINES.map((l) => {
          if (frame < l.f0 || frame >= l.f1) return null;
          // the strip types itself in from the left, one column of dots at a time
          const wipe = interpolate(frame, [l.f0, l.f0 + 12], [0, 1], clamp);
          return (
            <g key={l.f0}>
              <clipPath id={`m13-cap-${l.f0}`}>
                <rect x={56} y={1642} width={Math.floor((968 * wipe) / 10) * 10} height={138} />
              </clipPath>
              <g clipPath={`url(#m13-cap-${l.f0})`}>
                <LedText x={540} y={1732} text={l.text} size={54} anchor="middle" red={l.f0 === 372} />
              </g>
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1818, textAlign: "center", fontFamily: font, fontSize: 22, fontWeight: 600, color: "#3a403e" }}>
        ภาพจำลอง · วันที่นับ 22 มิ.ย. 1941 เป็นวันที่ 1 · แผนที่วาดจาก Natural Earth
      </div>
      </div>
      <Sheen />
    </AbsoluteFill>
  );
};
