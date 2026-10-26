import type { Feature, MultiLineString } from "geojson";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import { useJson } from "../../components/useJson";
import type { StyleDemo } from "../types";
import { Bamboo, C, clamp, Cloth, fade, fitProjection, font, H, IkatDefs, Loom, Tag, useWoven, W } from "./kit/Ikat";

// M28 ikat (มัดหมี่): Lan Xang told on a woven cloth. The cloth is woven top to bottom while we watch — the reed
// beats each pick in, the shuttle crosses — and the map appears in tie-dyed threads: Laos in lac red with diamond
// lattice, Isan in indigo with hooks, the Mekong a pale thread, cities woven yellow diamonds. Fa Ngum founds Lan
// Xang at Xieng Thong (1353), Setthathirath moves the capital to Vientiane (1560) and builds That Luang (1566). 16 s.
export const demo: StyleDemo = { id: "M28", name: "แผนที่ผ้ามัดหมี่", frames: 480, cover: 285, sizes: ["9x16"] };

type Rivers = { rivers: { features: Feature<MultiLineString, { name: string }>[] } };
const proj = fitProjection([100.3, 14.9, 106.8, 22.3], [20, 380, 1040, 1160]);
const P = { lp: [102.135, 19.886], vte: [102.6, 17.97] } as Record<string, [number, number]>;
const CLOTH_END = 1572;
const BANDS = [
  { from: 0, to: 30, g: "band" as const },
  { from: 30, to: 90, g: "stripe" as const },
  { from: 90, to: 300, g: "band" as const },
  { from: 300, to: 342, g: "stripe" as const },
  { from: 342, to: 354, g: "band" as const },
];
const BEATS = [
  { f: 12, e: 150, tag: "พ.ศ. 1896 · ค.ศ. 1353", head: "เจ้าฟ้างุ้มตั้งอาณาจักรล้านช้าง", line: "ราชธานีแรกอยู่ที่เมืองเชียงทอง (หลวงพระบาง)" },
  { f: 146, e: 260, tag: "ล้านช้าง", head: "ช้างล้านตัว", line: "อาณาจักรแผ่ไปทั้งสองฝั่งแม่น้ำโขง" },
  { f: 256, e: 370, tag: "พ.ศ. 2103 · ค.ศ. 1560", head: "ย้ายราชธานีไปเวียงจันทน์", line: "พระเจ้าไชยเชษฐาธิราชย้ายเมืองหลวงลงใต้ ริมแม่น้ำโขง" },
  { f: 366, e: 500, tag: "พ.ศ. 2109 · ค.ศ. 1566", head: "สร้างพระธาตุหลวง", line: "เจดีย์ใหญ่กลางเวียงจันทน์ สัญลักษณ์ของลาวจนทุกวันนี้" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const data = useJson<Rivers>("data/nrs-rivers.json");
  const riv = (name: string, w: number) => (data?.rivers.features ?? []).filter((f) => f.properties.name === name).map((f) => ({ f, w }));
  const woven = useWoven(
    data ? "m28-demo" : "m28-empty",
    proj,
    0,
    CLOTH_END,
    [...riv("Mekong", 12), ...riv("Ou", 7), ...riv("Ngun", 7), ...riv("Mun", 7), ...riv("Chi", 7)],
    [P.lp, P.vte],
    BANDS,
  );
  // the fell line: the edge of the woven cloth, moving down a pick at a time
  const fell = Math.round(interpolate(frame, [0, 330], [0, CLOTH_END], clamp) / 6) * 6;
  const beat = BEATS.filter((b) => frame >= b.f).pop() ?? BEATS[0];
  const bk = fade(frame, beat.f, beat.e, 10);
  const at = (p: [number, number]) => proj(p) as [number, number];
  const [lx, ly] = at(P.lp), [vx, vy] = at(P.vte);
  const woveAt = (y: number) => interpolate(fell, [y, y + 40], [0, 1], clamp);
  const hot = (a: number, b: number) => frame >= a && frame < b;
  const labelStyle = { position: "absolute" as const, fontFamily: font, fontWeight: 700, color: C.cream, textShadow: "0 2px 0 #000, 0 0 10px rgba(0,0,0,0.8)", transform: "translate(-50%, -50%)" };
  return (
    <AbsoluteFill style={{ background: C.loom }}>
      <Bed id="wind" from={0} to={demo.frames} volume={0.05} />
      <Sfx src={SFX.swell} at={4} volume={0.2} />
      {Array.from({ length: 30 }, (_, i) => Math.round(i * 7.5 + 4)).map((f) => <Hit key={f} id="wood_hit" at={f} volume={0.1} />)}
      {[60, 262, 372].map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.22} />)}
      <Hit id="gong" at={372} volume={0.12} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <IkatDefs />
        <Cloth woven={woven} fell={Math.min(fell, CLOTH_END)} />
        <Loom fell={Math.min(fell, CLOTH_END)} frame={frame} bottom={H} />
        {/* breast beam of the loom: the caption board */}
        <Bamboo y={1716} h={204} />
      </svg>
      <div style={{ position: "absolute", top: 108, left: 0, right: 0, textAlign: "center", fontFamily: font, color: C.cream, opacity: woveAt(250), textShadow: "0 3px 0 #000" }}>
        <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: 2, color: C.yellow }}>M28 · แผนที่ผ้ามัดหมี่</div>
        <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.2 }}>ล้านช้าง</div>
        <div style={{ fontSize: 28, fontWeight: 500, opacity: 0.9 }}>อาณาจักรสองฝั่งโขง</div>
      </div>
      <div style={{ ...labelStyle, left: 610, top: 760, fontSize: 52, opacity: woveAt(780) }}>ลาว</div>
      <div style={{ ...labelStyle, left: 330, top: 1280, fontSize: 40, opacity: woveAt(1290) }}>อีสาน (ไทย)</div>
      <div style={{ ...labelStyle, left: 930, top: 700, fontSize: 30, opacity: woveAt(720), color: C.cream, textShadow: "0 2px 0 #000" }}>เวียดนาม</div>
      <div style={{ ...labelStyle, left: 300, top: 470, fontSize: 30, opacity: woveAt(480), color: C.cream, textShadow: "0 2px 0 #000" }}>พม่า · จีน</div>
      <div style={{ ...labelStyle, left: 784, top: 1282, fontSize: 26, opacity: woveAt(1300), color: "#f6efda", transform: "translate(-50%, -50%) rotate(64deg)" }}>แม่น้ำโขง</div>
      <Tag x={lx + 10} y={ly - 74} text="หลวงพระบาง" sub="เมืองเชียงทอง" k={woveAt(ly)} hot={hot(20, 150)} />
      <Tag x={vx - 10} y={vy + 78} text="เวียงจันทน์" sub={frame >= 366 ? "พระธาตุหลวง" : undefined} k={woveAt(vy) * interpolate(frame, [250, 262], [0, 1], clamp)} hot={hot(256, 999)} />
      <div style={{ position: "absolute", left: 50, right: 50, top: 1740, textAlign: "center", fontFamily: font, color: C.ground, opacity: bk }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: C.lacDark }}>{beat.tag}</div>
        <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.25 }}>{beat.head}</div>
        <div style={{ fontSize: 27, fontWeight: 500, lineHeight: 1.35 }}>{beat.line}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: H - 30, textAlign: "center", fontFamily: font, fontSize: 15, color: "#5a4220", opacity: 0.85 }}>
        ภาพประกอบ · เส้นเขตแดนปัจจุบันเพื่ออ้างอิง · แผนที่ Natural Earth
      </div>
    </AbsoluteFill>
  );
};
