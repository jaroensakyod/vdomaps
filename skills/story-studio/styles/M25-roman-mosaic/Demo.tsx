import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { C, clamp, cut, fade, FIELD, fitProjection, H, MosaicDefs, Mortar, NameStone, Sinopia, Sketch, Stones, Tablet, useMosaic, W, type City, type Road } from "./kit/Mosaic";

// M25 Roman mosaic: the first three Roman highways told on a stone floor. The design of Italy is drawn on the dark
// bed, the stones are laid tile by tile out from Rome, then each road is set in red stones city to city —
// Via Appia (312 BC), Via Flaminia (220 BC), Via Aemilia (187 BC). 18 s.
export const demo: StyleDemo = { id: "M25", name: "แผนที่โมเสก", frames: 540, cover: 60, sizes: ["9x16"] };

// [lon, lat] of the Roman towns (modern sites); routes are simplified city-to-city lines (approximate).
const P = {
  roma: [12.49, 41.89], tarracina: [13.25, 41.29], capua: [14.25, 41.08], beneventum: [14.78, 41.13], venusia: [15.81, 40.96],
  tarentum: [17.24, 40.47], brundisium: [17.94, 40.64], narnia: [12.52, 42.52], fanum: [13.02, 43.84], ariminum: [12.57, 44.06],
  bononia: [11.34, 44.49], mutina: [10.93, 44.65], parma: [10.33, 44.8], placentia: [9.69, 45.05],
} as Record<string, [number, number]>;
const ROADS: Road[] = [
  { pts: [P.roma, P.tarracina, P.capua, P.beneventum, P.venusia, P.tarentum, P.brundisium], at: 128, len: 96 },
  { pts: [P.roma, P.narnia, P.fanum, P.ariminum], at: 246, len: 76 },
  { pts: [P.ariminum, P.bononia, P.mutina, P.parma, P.placentia], at: 354, len: 76 },
];
const CITIES: City[] = [
  { at: P.roma, t: 92, big: true },
  { at: P.capua, t: 166 },
  { at: P.tarentum, t: 205 },
  { at: P.brundisium, t: 224 },
  { at: P.ariminum, t: 322 },
  { at: P.bononia, t: 380 },
  { at: P.placentia, t: 430 },
];
const SKETCH = [14, 20, 26]; // the roads are drawn on the bed with the rest of the design
const BEATS = [
  { f: 8, e: 122, tag: "กรุงโรม", head: "ทุกเส้นทางมุ่งสู่โรม", line: "ชาวโรมันปูถนนหินจากเมืองหลวงออกไปทั่วคาบสมุทร" },
  { f: 116, e: 240, tag: "312 ปีก่อน ค.ศ.", head: "วีอาอัปปีอา · VIA APPIA", line: "สายแรก ลงใต้จากโรมถึงคาปัว ภายหลังต่อไปถึงบรันดิเซียม" },
  { f: 234, e: 348, tag: "220 ปีก่อน ค.ศ.", head: "วีอาฟลามีเนีย · VIA FLAMINIA", line: "ข้ามเทือกเขาแอเพนไนน์ ขึ้นเหนือไปเมืองอาริมินุม" },
  { f: 342, e: 452, tag: "187 ปีก่อน ค.ศ.", head: "วีอาเอมีเลีย · VIA AEMILIA", line: "จากอาริมินุมตัดตรงไปพลาเซนเทียริมแม่น้ำโป" },
  { f: 446, e: 560, tag: "125 ปี · สามสาย", head: "ยังเป็นทางหลวงจนทุกวันนี้", line: "ถนนสายใหม่ของอิตาลียังวิ่งตามแนวถนนโรมันทั้งสามสาย" },
];
const LABELS = [
  { at: P.roma, th: "โรม", la: "ROMA", dx: -112, dy: 24, big: true, t: 96 },
  { at: P.capua, th: "คาปัว", la: "CAPVA", dx: -86, dy: 46, t: 170 },
  { at: P.brundisium, th: "บรันดิเซียม", la: "BRVNDISIVM", dx: -40, dy: -62, t: 228 },
  { at: P.ariminum, th: "อาริมินุม", la: "ARIMINVM", dx: 98, dy: -40, t: 326 },
  { at: P.placentia, th: "พลาเซนเทีย", la: "PLACENTIA", dx: 0, dy: -64, t: 434 },
];

const proj = fitProjection([8.4, 37.9, 18.7, 46.3], [FIELD[0], 340, FIELD[2], 1220]);

export const Demo = () => {
  const frame = useCurrentFrame();
  const m = useMosaic("m25-demo", proj, ROADS, CITIES, P.roma, 2, 170);
  const push = interpolate(frame, [0, demo.frames], [1, 1.045], clamp);
  const az = interpolate(frame, [0, demo.frames], [212, 238], clamp);
  const beat = BEATS.filter((b) => frame >= b.f).pop() ?? BEATS[0];
  const bk = fade(frame, beat.f, beat.e, 12);
  return (
    <AbsoluteFill style={{ background: C.mortar }}>
      <Bed id="wind" from={0} to={demo.frames} volume={0.07} />
      <Sfx src={SFX.swell} at={4} volume={0.22} />
      {Array.from({ length: 40 }, (_, i) => 6 + i * 2.4).map((f) => <Sfx key={f} src={SFX.tick} at={Math.round(f)} volume={0.06} />)}
      {ROADS.flatMap((r) => Array.from({ length: Math.floor(r.len / 4) }, (_, i) => r.at + i * 4)).map((f) => <Sfx key={`r${f}`} src={SFX.tick} at={f} volume={0.12} />)}
      {CITIES.map((c) => <Hit key={c.t} id="wood_hit" at={c.t + 2} volume={0.16} />)}
      <Sfx src={SFX.hit} at={448} volume={0.25} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <MosaicDefs az={az} />
        <g transform={`translate(540 900) scale(${push}) translate(-540 -900)`}>
          <Mortar />
          <Sketch coast={m.coast} cities={m.cityPx} k={interpolate(frame, [2, 30], [0, 1], clamp)} origin={proj(P.roma) as [number, number]} />
          {m.paths.map((d, i) => (
            <Sinopia key={i} d={d} k={interpolate(frame, [SKETCH[i], SKETCH[i] + 22], [0, 1], clamp)} />
          ))}
          <g filter="url(#m25-stone)">
            <Stones tiles={m.border} frame={frame} />
            <Stones tiles={m.field} frame={frame} />
            {m.roads.map((r, i) => <Stones key={i} tiles={r} frame={frame} drop={6} />)}
            {m.cities.map((r, i) => <Stones key={`c${i}`} tiles={r} frame={frame} drop={8} />)}
          </g>
          <rect width={W} height={H} filter="url(#m25-grime)" opacity={0.15} />
        </g>
        <rect width={W} height={H} fill="url(#m25-vig)" />
      </svg>
      {LABELS.map((l) => {
        const [x, y] = proj(l.at) as [number, number];
        const sx = 540 + (x - 540) * push, sy = 900 + (y - 900) * push;
        return <NameStone key={l.th} x={sx + l.dx} y={sy + l.dy} th={l.th} la={l.la} big={l.big} k={interpolate(frame, [l.t, l.t + 10], [0, 1], clamp)} />;
      })}
      <Tablet box={[176, 104, 728, 214]} k={interpolate(frame, [6, 26], [0, 1], clamp)}>
        <div style={{ ...cut(26, 700, C.terracotta), letterSpacing: "0.16em" }}>M25 · แผนที่โมเสก</div>
        <div style={{ ...cut(74, 800), marginTop: 2 }}>ถนนโรมันสามสายแรก</div>
        <div style={{ ...cut(24, 500, "#5c4a3a"), marginTop: 4, letterSpacing: "0.3em" }}>VIAE · ROMANAE</div>
      </Tablet>
      <Tablet box={[150, 1580, 780, 250]} k={interpolate(frame, [10, 30], [0, 1], clamp)}>
        <div style={{ opacity: bk, transform: `translateY(${(1 - bk) * 8}px)` }}>
          <div style={{ ...cut(26, 700, C.terracotta), letterSpacing: "0.08em" }}>{beat.tag}</div>
          <div style={{ ...cut(46, 800), marginTop: 2 }}>{beat.head}</div>
          <div style={{ ...cut(28, 500, "#3d3129"), marginTop: 6, padding: "0 30px" }}>{beat.line}</div>
        </div>
        <div style={{ ...cut(15, 500, "#8d7f66"), marginTop: 10, letterSpacing: "0.05em" }}>ภาพประกอบ · แนวเส้นทางโดยประมาณ · แผนที่จาก Natural Earth</div>
      </Tablet>
    </AbsoluteFill>
  );
};
