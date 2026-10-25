import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { MapFrame } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { Bed, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { ClipZone, DuskGrade, ERA, GlowLine, midOf, useCanals, WaterTag } from "./kit/Canals";
import { BG, CAPTION_TOP, clamp, font, GOLD, HeadCard, RED, TopBar, V, view, type Head } from "./kit/News";

// M05 glowing canals: old Bangkok on NASA HLS imagery. The waterways draw on, the river's old loop lights up gold,
// the shortcut canal that became today's river flashes red, then the city moats appear in their own colours. 14 s.
export const demo: StyleDemo = { id: "M05", name: "คลองและแม่น้ำเมืองเก่าเรืองแสง", frames: 420, cover: 282, sizes: ["9x16", "16x9"] };

const T = { draw: 12, loop: 104, cut: 206, moat: 300, rop: 336, end: 420 };
const SHORTCUT: [number, number] = [100.4905, 13.7505]; // approximate: the river between the two old-loop mouths

const HEADS: Head[] = [
  { f: 6, tag: "บางกอก ก่อนเป็นเมืองหลวง", head: "เมืองที่โตตามสายน้ำ", color: "#5fd0ff" },
  { f: T.loop, tag: "แม่น้ำเจ้าพระยาสายเดิม", head: "ไหลอ้อมเป็นวงใหญ่", color: GOLD, chips: [{ text: "คลองบางกอกน้อย", f: T.loop + 20 }, { text: "คลองบางกอกใหญ่", f: T.loop + 34 }] },
  { f: T.cut, tag: "สมัยพระไชยราชาธิราช", head: "ขุดคลองลัดตัดตรง", stat: "ราว 2085", label: "พ.ศ. (โดยประมาณ)", color: RED },
  { f: T.moat, tag: "ธนบุรี → รัตนโกสินทร์", head: "ขุดคูเมืองล้อมพระนคร", color: ERA.thon, chips: [{ text: "คูเมืองเดิม · ธนบุรี", f: T.moat + 12 }, { text: "คลองรอบกรุง · 2326", f: T.rop + 6 }] },
];

const CAPS: [number, number, string][] = [
  [10, 90, "บางกอก เมืองที่โต ตามสายน้ำ"],
  [T.loop, 100, "แม่น้ำสายเดิม ไหลอ้อม เป็นวงใหญ่"],
  [T.cut, 92, "จนขุดคลองลัด ให้เรือผ่านตรง"],
  [T.moat, 110, "แล้วเมืองใหม่ ก็ขุดคู ล้อมรอบตัวเอง"],
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const wide = width > height;
  const cam = camAt(
    [
      { frame: 0, cam: view(V.bangkok, width, height, wide ? 0.95 : 1.15, 0.02) },
      { frame: T.end, cam: view(V.bangkok, width, height, wide ? 1.1 : 1.35, 0.02) },
    ],
    frame,
  );
  const canals = useCanals();
  const by = (n: string) => canals.find((c) => c.properties.name === n);
  const on = (a: number, len = 14) => interpolate(frame, [a, a + len], [0, 1], clamp);
  const draw = (i: number) => interpolate(frame, [T.draw + i * 6, T.draw + 70 + i * 6], [0, 1], clamp);
  const loopLit = on(T.loop) * interpolate(frame, [T.cut + 40, T.cut + 60], [1, 0.45], clamp);
  const cutLit = on(T.cut, 10) * (0.85 + 0.15 * Math.sin(frame * 0.25));
  const dimRest = interpolate(frame, [T.loop, T.loop + 14, T.moat, T.moat + 14], [1, 0.45, 0.45, 0.8], clamp);
  const river = by("แม่น้ำเจ้าพระยา");
  const noi = by("คลองบางกอกน้อย");
  const yai = by("คลองบางกอกใหญ่");
  const doem = by("คลองคูเมืองเดิม");
  const rop = by("คลองรอบกรุง");
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sfx src={SFX.swell} at={0} volume={0.25} />
      <Sfx src={SFX.whoosh} at={T.draw} volume={0.2} />
      <Sfx src={SFX.hit} at={T.loop} volume={0.25} />
      <Sfx src={SFX.riser} at={T.cut - 50} volume={0.2} />
      <Sfx src={SFX.hit} at={T.cut} volume={0.35} />
      <Sfx src={SFX.pop} at={T.moat + 12} volume={0.25} />
      <Sfx src={SFX.pop} at={T.rop + 6} volume={0.25} />
      <Bed id="ship_sailing" from={0} to={T.end} volume={0.12} />
      <MapFrame cam={cam} focusX={wide ? 0.6 : 0.5}>
        <Raster layers={[{ name: "world" }, { name: "bkkhls" }]} />
        <DuskGrade k={on(0, 24)} />
        <ClipZone id="shortcut" at={SHORTCUT} r={0.0105} />
        {/* every waterway, drawn on and then dimmed while one story line is lit */}
        {canals.map((c, i) => (
          <GlowLine key={c.properties.name} f={c} draw={draw(i)} dim={c === noi || c === yai || c === river ? 1 : dimRest} lit={0} color={c.properties.era === "old" || c.properties.era === "river" ? ERA.river : undefined} />
        ))}
        {noi && <GlowLine f={noi} lit={loopLit} color={ERA.old} dim={on(T.loop)} />}
        {yai && <GlowLine f={yai} lit={loopLit} color={ERA.old} dim={on(T.loop)} />}
        {river && <GlowLine f={river} lit={cutLit} color="#ff6b5f" dim={on(T.cut, 10)} clip="shortcut" />}
        {doem && <GlowLine f={doem} lit={on(T.moat)} draw={on(T.moat, 30)} color={ERA.thon} />}
        {rop && <GlowLine f={rop} lit={on(T.rop)} draw={on(T.rop, 30)} color={ERA.rat} />}
        {noi && <WaterTag text="คลองบางกอกน้อย" at={midOf(noi)} start={T.loop + 20} color={ERA.old} dy={-44} />}
        {yai && <WaterTag text="คลองบางกอกใหญ่" at={midOf(yai)} start={T.loop + 34} color={ERA.old} dx={90} dy={44} />}
        <WaterTag text="คลองลัด" sub="วันนี้คือแม่น้ำ" at={SHORTCUT} start={T.cut + 8} color="#ff6b5f" dx={150} dy={0} />
        {rop && <WaterTag text="คลองรอบกรุง" sub="พ.ศ. 2326" at={midOf(rop)} start={T.rop + 6} color={ERA.rat} dx={120} dy={-20} />}
      </MapFrame>
      <TopBar badge="M05 · คลองและแม่น้ำเมืองเก่าเรืองแสง" chip={frame < T.cut ? "บางกอก" : frame < T.moat ? "พ.ศ. ราว 2085" : "พ.ศ. 2310–2326"} />
      <HeadCard heads={HEADS} from={HEADS[0].f} to={T.end + 20} />
      {CAPS.map(([start, len, text]) => (
        <Caption key={start} text={text} start={start} len={len} font={font} top={CAPTION_TOP} />
      ))}
    </AbsoluteFill>
  );
};
