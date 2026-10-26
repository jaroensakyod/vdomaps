import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { along, Blot, Boat, C, clamp, Defs, Desk, Envelope, estWidth, Flourish, font, H, Hand, handHead, InkRoute, Lamp, Pen, Place, RULE, RULE0, Sheet, SketchMap, sketchProj, smooth, SW, toScreen, W } from "./kit/Letter";

// M34 ink letter: "Klai Ban" (ไกลบ้าน) — King Chulalongkorn's second journey to Europe in 1907 and the 43 letters he
// wrote home to his daughter on the way, told as a narrator's fountain-pen letter on tinted ruled paper. The text
// writes itself with the nib riding the line; the sea route is sketched in the letter; the envelope gets its
// stamp, postal cancel and wax seal. The letter is the narrator's, not a royal letter (labelled on the sheet). 18 s.
export const demo: StyleDemo = { id: "M34", name: "แผนที่ในจดหมาย", frames: 540, cover: 520, sizes: ["9x16"] };

const CPF = 1.5; // handwriting speed, characters per frame
type Line = { id: string; x: number; y: number; text: string; size: number; at: number; weight?: number; anchor?: "start" | "end" | "middle" };
const L = (id: string, x: number, y: number, text: string, size: number, at: number, weight?: number, anchor?: Line["anchor"]): Line => ({ id, x, y, text, size, at, weight, anchor });
const LINES: Line[] = [
  L("m34-date", SW - 60, 230, "พ.ศ. 2450 · ค.ศ. 1907", 34, 4, 400, "end"),
  L("m34-title", 128, 246, "ไกลบ้าน", 104, 18, 700),
  L("m34-greet", 128, RULE0 - 10, "ถึง ผู้อ่านที่รัก", 44, 58),
  L("m34-l1", 128, RULE0 + RULE - 10, "ปีนี้ รัชกาลที่ 5 เสด็จประพาสยุโรปครั้งที่สอง", 44, 80),
  L("m34-l2", 128, RULE0 + RULE * 2 - 10, "ออกจากกรุงเทพฯ ด้วยเรือพระที่นั่งมหาจักรี", 44, 122),
  L("m34-l3", 128, RULE0 + RULE * 9 - 10, "ตลอดทางทรงมีพระราชหัตถเลขาถึงพระราชธิดา", 44, 334),
  L("m34-l4", 128, RULE0 + RULE * 10 - 10, "รวม 43 ฉบับ ภายหลังพิมพ์เป็นหนังสือ «ไกลบ้าน»", 44, 374),
  L("m34-sign", SW - 70, RULE0 + RULE * 11 - 10, "— ผู้เล่าเรื่อง", 44, 414, 700, "end"),
];
const dur = (l: Line) => Math.max(10, l.text.length / CPF);
const kOf = (l: Line, f: number) => interpolate(f, [l.at, l.at + dur(l)], [0, 1], clamp);

// the sketch box on the sheet and the map in it
const BOX: [number, number, number, number] = [128, RULE0 + RULE * 2 + 26, 740, 430];
const proj = sketchProj(BOX, [-2, -8, 108, 50]);
const P = (lon: number, lat: number) => proj([lon, lat]) as [number, number];
// approximate sea route: Bangkok → Singapore → Strait of Malacca → south of Ceylon → Arabian Sea → Red Sea → Suez →
// Mediterranean → Italy
const ROUTE = smooth([P(100.5, 13.6), P(102.5, 7), P(103.8, 1.3), P(98.5, 4.5), P(88, 5.5), P(80, 5.6), P(64, 11), P(50, 12.3), P(42, 14.5), P(36.5, 22), P(32.6, 29.8), P(31, 32.6), P(22, 34.2), P(16, 37.6), P(14.2, 40.6)]);
const MAP_AT = 168;
const ROUTE_A = 226;
const ROUTE_B = 330;

// where the nib is: on the line being written, on the route head, sweeping over the sketch, or resting
const REST: [number, number] = [996, 1140];
const penAt = (f: number): { p: [number, number]; lift: number } => {
  type Seg = { a: number; b: number; at: (f: number) => [number, number] };
  const segs: Seg[] = LINES.map((l) => ({ a: l.at, b: l.at + dur(l), at: (ff: number) => toScreen(...handHead(l.x, l.y, l.text, l.size, kOf(l, ff), l.anchor)) }));
  segs.push({ a: MAP_AT, b: MAP_AT + 50, at: (ff) => toScreen(BOX[0] + BOX[2] * interpolate(ff, [MAP_AT, MAP_AT + 50], [0.95, 0.3], clamp), BOX[1] + BOX[3] * (0.3 + 0.25 * Math.sin(ff * 0.3))) });
  segs.push({ a: ROUTE_A, b: ROUTE_B, at: (ff) => { const h = along(ROUTE, interpolate(ff, [ROUTE_A, ROUTE_B], [0, 1], clamp)); return toScreen(h.x, h.y); } });
  segs.sort((x, y) => x.a - y.a);
  const cur = segs.find((s) => f >= s.a && f <= s.b);
  if (cur) return { p: cur.at(f), lift: 0 };
  const prev = [...segs].reverse().find((s) => s.b < f);
  const next = segs.find((s) => s.a > f);
  const from = prev ? prev.at(prev.b) : REST;
  if (!next || next.a - f > 40) {
    // done writing for a while: drift back to rest
    const t = prev ? interpolate(f, [prev.b, prev.b + 18], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) }) : 1;
    return { p: [from[0] + (REST[0] - from[0]) * t, from[1] + (REST[1] - from[1]) * t], lift: t };
  }
  const to = next.at(next.a);
  const t = prev ? interpolate(f, [prev.b, next.a], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) }) : 1;
  return { p: [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t], lift: Math.sin(t * Math.PI) * 0.6 };
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const mapK = interpolate(frame, [MAP_AT, MAP_AT + 70], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 1.6) });
  const routeK = interpolate(frame, [ROUTE_A, ROUTE_B], [0, 1], clamp);
  const head = along(ROUTE, routeK);
  const pen = penAt(frame);
  const env = interpolate(frame, [432, 462], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <AbsoluteFill style={{ background: C.desk }}>
      <Bed id="rain_light" from={0} to={demo.frames} volume={0.07} />
      {LINES.map((l) => <Sfx key={l.id} src={SFX.tick} at={l.at} volume={0.12} />)}
      <Sfx src={SFX.whoosh} at={MAP_AT - 4} volume={0.12} />
      <Hit id="ship_bell" at={ROUTE_B} volume={0.18} />
      <Sfx src={SFX.whoosh} at={430} volume={0.16} />
      <Sfx src={SFX.pop} at={458} volume={0.18} />
      <Hit id="wood_hit" at={476} volume={0.3} />
      <Sfx src={SFX.hit} at={496} volume={0.16} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs />
        <Desk />
        <Sheet>
          {/* letterhead: the kicker, printed on the stationery */}
          <text x={SW / 2} y={82} textAnchor="middle" fontFamily={font} fontSize={30} fontWeight={700} fill={C.rule} letterSpacing={3}>M34 · แผนที่ในจดหมาย</text>
          <path d={`M${SW / 2 - 230} 104 L${SW / 2 + 230} 104 M${SW / 2 - 180} 111 L${SW / 2 + 180} 111`} stroke={C.rule} strokeWidth={1.6} />
          {LINES.map((l) => <Hand key={l.id} id={l.id} x={l.x} y={l.y} text={l.text} size={l.size} weight={l.weight} anchor={l.anchor} k={kOf(l, frame)} />)}
          <Flourish x={130} y={272} w={estWidth("ไกลบ้าน", 104) * 0.95} k={interpolate(frame, [44, 60], [0, 1], clamp)} />
          <SketchMap id="m34-map" proj={proj} box={BOX} k={mapK} />
          <InkRoute id="m34-route" pts={ROUTE} k={routeK} />
          <Place x={P(100.5, 13.75)[0]} y={P(100.5, 13.75)[1]} name="กรุงเทพฯ" k={interpolate(frame, [ROUTE_A - 10, ROUTE_A + 6], [0, 1], clamp)} dx={-14} dy={-16} anchor="end" />
          <Place x={P(103.8, 1.3)[0]} y={P(103.8, 1.3)[1]} name="สิงคโปร์" k={interpolate(frame, [ROUTE_A + 16, ROUTE_A + 30], [0, 1], clamp)} dx={-10} dy={40} anchor="end" />
          <Place x={P(13.5, 41.6)[0]} y={P(13.5, 41.6)[1]} name="อิตาลี" k={interpolate(frame, [ROUTE_B - 8, ROUTE_B + 8], [0, 1], clamp)} dx={-12} dy={-18} anchor="end" />
          <text x={BOX[0] + BOX[2] * 0.52} y={BOX[1] + BOX[3] - 22} fontFamily={font} fontSize={26} fill={C.ink} opacity={interpolate(frame, [ROUTE_A + 40, ROUTE_A + 60], [0, 0.85], clamp)} filter="url(#m34-ink)">
            มหาสมุทรอินเดีย
          </text>
          {routeK > 0 && routeK < 1 ? <Boat x={head.x} y={head.y - 14} flip={head.dx < 0} /> : null}
          {routeK >= 1 ? <Boat x={along(ROUTE, 0.62).x + 6} y={along(ROUTE, 0.62).y - 16} flip /> : null}
          <Blot x={BOX[0] + BOX[2] + 40} y={BOX[1] + 60} r={11} k={interpolate(frame, [MAP_AT + 30, MAP_AT + 34], [0, 1], clamp)} />
          <text x={128} y={RULE0 + RULE * 12 - 22} fontFamily={font} fontSize={23} fill={C.ink} opacity={interpolate(frame, [420, 440], [0, 0.7], clamp)}>
            จดหมายเล่าเรื่อง ไม่ใช่ลายพระราชหัตถเลขา · แผนที่ร่างและเส้นทางโดยประมาณ
          </text>
        </Sheet>
        <Envelope
          x={600}
          y={1658}
          k={env}
          stampK={interpolate(frame, [450, 462], [0, 1], clamp)}
          cancelK={interpolate(frame, [474, 478], [0, 1], clamp)}
          sealK={interpolate(frame, [490, 506], [0, 1], clamp)}
          to={["ถึง ผู้ชมทุกท่าน", "ช่องเล่าเรื่องแผนที่"]}
          from="จาก ผู้เล่าเรื่อง · กรุงเทพฯ"
        />
        <Pen x={pen.p[0]} y={pen.p[1] - pen.lift * 10} lift={pen.lift} />
        <Lamp />
      </svg>
      <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center", fontFamily: font, fontSize: 18, color: "#7d6a58" }}>
        แผนที่จาก Natural Earth · ข้อมูล: วิกิพีเดีย "ไกลบ้าน", ศิลปวัฒนธรรม
      </div>
    </AbsoluteFill>
  );
};
