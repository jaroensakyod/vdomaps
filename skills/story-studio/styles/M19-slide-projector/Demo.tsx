import { Fragment } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { MapFrame } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Beam, C, clamp, ease, fitBox, font, GRADES, hand, Mount, Note, PencilLine, Projected, Projector, Room, useMoat, useRoom, Veil, Waters, type Grade } from "./kit/Projector";

// M19 slide projector: Bangkok's edge moving outwards, shown as three slides in a carousel — the moat of 1783
// (Khlong Rop Krung), the outer moat of 1851 (Khlong Phadung Krung Kasem), and the city today. One NASA HLS image
// of today, graded as three film stocks (faded magenta Ektachrome, warm Kodachrome, modern colour); grease-pencil
// marks trace each moat; the carousel clicks between slides; a bright dusty beam fills the dark room. 16 s.
export const demo: StyleDemo = { id: "M19", name: "สไลด์ฉายภาพ", frames: 480, cover: 150, sizes: ["9x16"] };

type Slide = { at: number; grade: Grade; box: [number, number, number, number]; push: number; no: string; label: string; year: string };
const SLIDES: Slide[] = [
  { at: 0, grade: "ekta", box: [100.462, 13.722, 100.536, 13.786], push: 1.06, no: "#1", label: "เกาะรัตนโกสินทร์", year: "พ.ศ. 2326" },
  { at: 170, grade: "koda", box: [100.458, 13.716, 100.548, 13.792], push: 1.05, no: "#2", label: "คลองชั้นนอก", year: "พ.ศ. 2394" },
  { at: 320, grade: "now", box: [100.405, 13.665, 100.575, 13.815], push: 1.08, no: "#3", label: "กรุงเทพฯ วันนี้", year: "พ.ศ. 2568" },
];
const LINES = [
  { text: "ปี 2326 กรุงเทพฯ ทั้งเมือง\nอยู่ในคลองรอบกรุง", start: 24, len: 146 },
  { text: "ปี 2394 เมืองโตจนต้องขุด\nคลองชั้นนอก ผดุงกรุงเกษม", start: 172, len: 148 },
  { text: "วันนี้ เมืองล้นออกไป\nไกลสุดขอบภาพ", start: 322, len: 158 },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { s, width, height, pic, screen } = useRoom();
  const [px, py, pw, ph] = pic;
  const rop = useMoat("คลองรอบกรุง");
  const pha = useMoat("คลองผดุงกรุงเกษม");
  const close = (pts: [number, number][]) => (pts.length ? [...pts, [pts[pts.length - 1][0], pts[pts.length - 1][1] - 0.004] as [number, number], [100.45, pts[pts.length - 1][1] - 0.004] as [number, number], [100.45, pts[0][1] + 0.004] as [number, number], [pts[0][0], pts[0][1] + 0.004] as [number, number]] : []);
  const idx = SLIDES.filter((sl) => frame >= sl.at + 3).length - 1;
  const slide = SLIDES[Math.max(0, idx)];
  const next = SLIDES[idx + 1];
  const light = interpolate(frame, [0, 4, 6, 10, 18], [0, 0.6, 0.2, 0.9, 1], clamp);
  // shutter: closes over the 5 frames before a change, stays shut 3 frames, then the next slide drops in
  const dark = next ? interpolate(frame, [next.at - 5, next.at], [0, 1], clamp) : 0;
  const cut = frame - (slide.at + 3);
  const life = frame - slide.at;
  const cam0 = fitBox(slide.box, pw);
  const cam = { ...cam0, scale: cam0.scale * interpolate(life, [0, 160], [1, slide.push], { ...clamp, easing: (t) => t }) };
  const draw = (f0: number, d = 50) => interpolate(life, [f0, f0 + d], [0, 1], { ...clamp, easing: ease });
  const line = LINES.find((l) => frame >= l.start && frame < l.start + l.len);
  const lo = line ? interpolate(frame, [line.start, line.start + 8, line.start + line.len - 6, line.start + line.len], [0, 1, 1, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{ background: C.room }}>
      <Bed id="wind" from={0} to={demo.frames} volume={0.05} />
      <Sfx src={SFX.hit} at={2} volume={0.2} />
      {SLIDES.slice(1).map((sl) => (
        <Fragment key={sl.at}>
          <Sfx src={SFX.tick} at={sl.at - 4} volume={0.5} />
          <Hit id="wood_hit" at={sl.at + 3} volume={0.18} />
        </Fragment>
      ))}
      {[40, 196, 352].map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.12} />)}
      <Room light={light} />
      <Projected grade={slide.grade} light={light} dark={dark} cut={cut} seed={slide.no}>
        <MapFrame cam={cam} focusX={(px + pw / 2) / width} focusY={(py + ph / 2) / height}>
          <Raster layers={[{ name: "bkkhls" }]} />
          <Waters opacity={0.25} />
          {slide.no === "#1" && (
            <>
              <Veil ring={close(rop)} k={draw(30, 30)} />
              <PencilLine pts={rop} k={draw(26, 60)} />
              <Note at={rop[Math.floor(rop.length * 0.6)] ?? [100.5, 13.75]} text="คลองรอบกรุง" sub="ขุด พ.ศ. 2326" k={draw(70, 16)} dx={40} dy={-170} anchor="start" />
            </>
          )}
          {slide.no === "#2" && (
            <>
              <Veil ring={close(pha)} k={draw(24, 30)} />
              <PencilLine pts={rop} k={1} color="#fff1d6" width={4} dashed />
              <PencilLine pts={pha} k={draw(20, 60)} />
              <Note at={pha[Math.floor(pha.length * 0.5)] ?? [100.51, 13.75]} text="ผดุงกรุงเกษม" sub="ขุด พ.ศ. 2394" k={draw(66, 16)} dx={-40} dy={-220} anchor="end" />
            </>
          )}
          {slide.no === "#3" && (
            <>
              <PencilLine pts={rop} k={1} color="#fff1d6" width={4} dashed />
              <PencilLine pts={pha} k={1} color={C.mark} width={5} />
              <Note at={[100.5, 13.756]} text="เมืองเดิม" k={draw(20, 16)} dx={-150} dy={-180} />
              <Note at={[100.556, 13.742]} text="เมืองวันนี้ เต็มภาพ" k={draw(60, 16)} dx={-40} dy={200} anchor="end" />
            </>
          )}
        </MapFrame>
      </Projected>
      <Beam light={light * (1 - dark * 0.85)} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1800 * s, bottom: 0, background: "#17110c", borderTop: `${3 * s}px solid #4a3826` }} />
      <Projector slot={Math.max(0, idx)} light={light * (1 - dark)} />
      {/* top: kicker on tape and the title */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 34 * s, textAlign: "center", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 24 * s }}>
        <div style={{ display: "inline-block", padding: `${4 * s}px ${18 * s}px`, background: "#d8cfb8", color: "#3a2a1a", fontFamily: hand, fontSize: 28 * s, transform: "rotate(-1.5deg)", boxShadow: `0 ${3 * s}px ${8 * s}px rgba(0,0,0,0.6)` }}>M19 · สไลด์ฉายภาพ</div>
        <div style={{ color: C.text, fontSize: 58 * s, fontWeight: 700, lineHeight: 1.25 }}>กรุงเทพฯ ขยายตัว</div>
      </div>
      {/* screen footer: which film this slide imitates, and the honest label */}
      <div style={{ position: "absolute", left: px, width: pw, top: py + ph + 4 * s, display: "flex", justifyContent: "space-between", fontFamily: font, fontSize: 18 * s, color: "#57514a", fontWeight: 600 }}>
        <span>{GRADES[slide.grade].label}</span>
        <span>เส้นคลองจาก OSM · เขตเมืองโดยประมาณ</span>
      </div>
      {/* caption in the beam */}
      <div style={{ position: "absolute", left: 60 * s, right: 60 * s, top: screen[1] + screen[3] + 110 * s, height: 150 * s, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", whiteSpace: "pre-line", fontFamily: font, fontWeight: 700, fontSize: 48 * s, lineHeight: 1.35, color: "#fffaf0", opacity: lo, textShadow: `0 ${2 * s}px ${14 * s}px rgba(40,20,0,0.95), 0 0 ${3 * s}px rgba(0,0,0,0.9)` }}>
        {line?.text}
      </div>
      {/* slide mounts: the one in the gate glows; the others wait on the table */}
      {SLIDES.map((sl, i) => {
        const on = i === Math.max(0, idx);
        const rest = SLIDES.map((_, j) => j).filter((j) => j !== Math.max(0, idx)).indexOf(i);
        const k = interpolate(frame, [sl.at, sl.at + 10], [0, 1], clamp);
        return (
          <Mount key={sl.no} x={(on ? 40 : 846) * s} y={(on ? 1500 : [1440, 1640][Math.max(0, rest)]) * s} no={sl.no} label={sl.label} year={sl.year} note={i === 2 ? "ภาพ NASA HLS" : "ภาพจำลอง"} lit={on ? k : 0} rot={on ? -4 : 3 + i} w={on ? 230 : 180} />
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: height - 46 * s, textAlign: "center", fontFamily: font, fontSize: 17 * s, color: "#8a8073" }}>
        ภาพ: NASA HLS (Sentinel-2) 20 ม.ค. 2568 ปรับโทนเป็นฟิล์ม · คลอง © OpenStreetMap
      </div>
    </AbsoluteFill>
  );
};
