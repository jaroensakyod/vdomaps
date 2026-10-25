import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { MapFrame, useMap } from "../../components/Map";
import { Bed, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import {
  Circle, ClipZone, font, Glow, GRAPHITE, headOf, HeadNote, Kicker, LightTable, midOf, Note, Pencil, PENCIL, PencilLine, ramp, Ruler, Sheet, TitleBlock,
  useCanals, V, VellumDefs, view, type Canal, type Head,
} from "./kit/Vellum";

// M05 light-table tracings: old Bangkok traced era by era. Today's city lies grey and dim on a back-lit drafting
// table; sheet 1 slides in and a blue pencil traces the river and the canals; sheet 2 (ochre) traces the river's old
// loop; sheet 3 (red) rings the shortcut canal that became today's river; sheets 4 and 5 trace the moats of
// Thonburi (green) and Rattanakosin (violet). Handwritten notes, tape, ruler, title block. 14 s, 9:16 and 16:9.
export const demo: StyleDemo = { id: "M05", name: "แผ่นลอกลายคลองเก่า", frames: 420, cover: 284, sizes: ["9x16", "16x9"] };

const T = { s1: 8, draw: 34, loop: 104, cut: 206, moat: 300, rop: 336, end: 420 };
const SHORTCUT: [number, number] = [100.4905, 13.7505]; // approximate: the river between the two old-loop mouths

const HEADS: Head[] = [
  { f: 14, tag: "บางกอก ก่อนเป็นเมืองหลวง", head: "เมืองที่โตตามสายน้ำ", color: PENCIL.river },
  { f: T.loop + 10, tag: "แม่น้ำเจ้าพระยาสายเดิม", head: "ไหลอ้อมเป็นวงใหญ่", color: PENCIL.old },
  { f: T.cut + 12, tag: "สมัยพระไชยราชาธิราช", head: "ขุดคลองลัดตัดตรง", stat: "ราว 2085", label: "พ.ศ. (โดยประมาณ)", color: PENCIL.cut },
  { f: T.moat + 12, tag: "ธนบุรี → รัตนโกสินทร์", head: "ขุดคูล้อมพระนคร", color: PENCIL.thon },
];
const BLOCKS = [
  { f: T.draw, n: 1, subject: "แม่น้ำและคลอง", period: "ฐาน · แผนที่ปัจจุบัน" },
  { f: T.loop + 20, n: 2, subject: "แม่น้ำสายเดิม", period: "ก่อน พ.ศ. 2085" },
  { f: T.cut + 20, n: 3, subject: "คลองลัด", period: "ราว พ.ศ. 2085 (โดยประมาณ)" },
  { f: T.moat + 20, n: 4, subject: "คูเมืองธนบุรี", period: "พ.ศ. 2310–2325" },
  { f: T.rop + 16, n: 5, subject: "คลองรอบกรุง", period: "พ.ศ. 2326" },
];
const CAPS: [number, number, string][] = [
  [10, 90, "บางกอก เมืองที่โต ตามสายน้ำ"],
  [T.loop, 100, "แม่น้ำสายเดิม ไหลอ้อม เป็นวงใหญ่"],
  [T.cut, 92, "จนขุดคลองลัด ให้เรือผ่านตรง"],
  [T.moat, 110, "แล้วเมืองใหม่ ก็ขุดคู ล้อมรอบตัวเอง"],
];

// The pencil follows the drawing head of the line being traced.
const TracingPencil = ({ f, t, color, o }: { f?: Canal; t: number; color: string; o: number }) => {
  const { projection, s } = useMap();
  if (!f || o <= 0) return null;
  const p = headOf(f, t, projection as never);
  return p ? <Pencil x={p[0]} y={p[1]} color={color} s={s} o={o} angle={-60 + Math.sin(t * 6) * 4} /> : null;
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const wide = width > height;
  const cam = camAt(
    [
      { frame: 0, cam: view(V.bangkok, width, height, wide ? 0.95 : 1.12, wide ? 0 : 0.0) },
      { frame: T.end, cam: view(V.bangkok, width, height, wide ? 1.04 : 1.22, wide ? 0 : 0.0) },
    ],
    frame,
  );
  const canals = useCanals();
  const by = (n: string) => canals.find((c) => c.properties.name === n);
  const river = by("แม่น้ำเจ้าพระยา");
  const noi = by("คลองบางกอกน้อย");
  const yai = by("คลองบางกอกใหญ่");
  const doem = by("คลองคูเมืองเดิม");
  const rop = by("คลองรอบกรุง");
  const slide = (a: number, len = 26) => ramp(frame, a, a + len, Easing.out(Easing.cubic));
  const draw = (a: number, len: number) => interpolate(frame, [a, a + len], [0, 1], clamp);
  const k1 = slide(T.s1), k2 = slide(T.loop), k3 = slide(T.cut), k4 = slide(T.moat), k5 = slide(T.rop - 8, 22);
  const dRiver = draw(T.draw, 60);
  const dOld = draw(T.loop + 26, 56);
  const dMoat = draw(T.moat + 26, 34);
  const dRop = draw(T.rop + 16, 40);
  const pencilAt = (a: number, len: number) => interpolate(frame, [a - 6, a, a + len, a + len + 10], [0, 1, 1, 0], clamp);
  const block = [...BLOCKS].reverse().find((b) => frame >= b.f);
  return (
    <AbsoluteFill style={{ background: "#2a2a2c" }}>
      <Sfx src={SFX.swell} at={0} volume={0.2} />
      {[T.s1, T.loop, T.cut, T.moat, T.rop - 8].map((f) => <Sfx key={f} src={SFX.whoosh} at={f} volume={0.18} />)}
      {[T.draw, T.loop + 26, T.moat + 26, T.rop + 16].map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.2} />)}
      <Sfx src={SFX.hit} at={T.cut + 24} volume={0.25} />
      <Bed id="ship_sailing" from={0} to={T.end} volume={0.08} />
      <MapFrame cam={cam} focusX={wide ? 0.62 : 0.5} focusY={wide ? 0.5 : 0.47}>
        <VellumDefs />
        <LightTable />
        <ClipZone id="m05-shortcut" at={SHORTCUT} r={0.0105} />
        {/* sheet 1: the river and every waterway of the period, blue pencil */}
        <Sheet k={k1} from="left" rot={-4} inset={120} veil={0.6}>
          {canals.map((c) => (c === river ? null : <PencilLine key={c.properties.name} f={c} draw={draw(T.draw + 20, 60)} color={PENCIL.river} />))}
          {river && <PencilLine f={river} draw={dRiver} color={PENCIL.river} river />}
        </Sheet>
        {/* sheet 2: the old loop, ochre */}
        <Sheet k={k2} from="right" rot={5} inset={128}>
          {noi && <PencilLine f={noi} draw={dOld} color={PENCIL.old} />}
          {yai && <PencilLine f={yai} draw={dOld} color={PENCIL.old} />}
          {noi && <Note text="คลองบางกอกน้อย" at={midOf(noi)} start={T.loop + 60} color={PENCIL.old} dx={170} dy={-120} />}
          {yai && <Note text="คลองบางกอกใหญ่" at={midOf(yai)} start={T.loop + 74} color={PENCIL.old} dx={180} dy={120} />}
        </Sheet>
        {/* sheet 3: the shortcut, red */}
        <Sheet k={k3} from="bottom" rot={-3} inset={136}>
          {river && <PencilLine f={river} draw={1} color={PENCIL.cut} river clip="m05-shortcut" />}
          <Circle at={SHORTCUT} rx={120} ry={150} k={ramp(frame, T.cut + 26, T.cut + 50, Easing.inOut(Easing.quad))} color={PENCIL.cut} />
          <Note text="คลองลัด" sub="วันนี้คือแม่น้ำ" at={[SHORTCUT[0] + 0.006, SHORTCUT[1]]} start={T.cut + 46} color={PENCIL.cut} dx={120} dy={-110} />
        </Sheet>
        {/* sheets 4–5: the moats */}
        <Sheet k={k4} from="top" rot={4} inset={144}>
          {doem && <PencilLine f={doem} draw={dMoat} color={PENCIL.thon} />}
        </Sheet>
        <Sheet k={k5} from="right" rot={-5} inset={152}>
          {rop && <PencilLine f={rop} draw={dRop} color={PENCIL.rat} />}
          {rop && <Note text="คลองรอบกรุง" sub="พ.ศ. 2326" at={midOf(rop)} start={T.rop + 40} color={PENCIL.rat} dx={150} dy={-40} />}
        </Sheet>
        <Glow />
        <Ruler x={wide ? 80 * s : 70 * s} y={wide ? height * 0.84 : height * 0.875} len={wide ? 900 * s : 760 * s} angle={-6} k={ramp(frame, 0, 20)} />
        <TracingPencil f={river} t={dRiver} color={PENCIL.river} o={pencilAt(T.draw, 60)} />
        <TracingPencil f={noi} t={dOld} color={PENCIL.old} o={pencilAt(T.loop + 26, 56)} />
        <TracingPencil f={doem} t={dMoat} color={PENCIL.thon} o={pencilAt(T.moat + 26, 34)} />
        <TracingPencil f={rop} t={dRop} color={PENCIL.rat} o={pencilAt(T.rop + 16, 40)} />
      </MapFrame>
      <HeadNote heads={HEADS} to={T.end + 10} />
      {block && <TitleBlock key={block.n} n={block.n} total={5} subject={block.subject} period={block.period} f={block.f} />}
      {CAPS.map(([start, len, text]) => (
        <Caption key={start} text={text} start={start} len={len} font={font} color={GRAPHITE} stroke="#f3efe2" top={0.79} />
      ))}
      <Kicker text="M05 · แผ่นลอกลายคลองเก่า" />
    </AbsoluteFill>
  );
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
