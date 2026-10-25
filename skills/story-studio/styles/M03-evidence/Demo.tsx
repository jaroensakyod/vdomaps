import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../components/camera";
import { MapFrame } from "../../components/Map";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { C, clamp, CordRun, Cut, fonts, Grain, Leaf, Table } from "./kit/Leaf";
import { BattleCut, fitBox, focusOf, Hole, LeafLand, March, Mountains, PL, PlaceCut, ROUTES, VW, Zones } from "./kit/LeafMap";
import { BAND, CompareLeaves, HeadLeaf, Layer, SourceLeaves, Subtitle, TimelineLeaf, type Head } from "./kit/Leaves";

// M03 palm-leaf evidence: the elephant duel of 2135 told by four sides, cut into a bundle of palm leaves. The map is
// incised across four leaves tied with a red cord; each chronicle is its own leaf sliding out of the stack (glaive /
// lance / gun); the two proposed sites, a lacquer seal "ยังถกเถียง", and a timeline leaf of when each text was
// written. Confidence = knots on the cord. 18 s, 9:16.
export const demo: StyleDemo = { id: "M03", name: "ใบลานหลักฐาน", frames: 540, cover: 236, sizes: ["9x16"] };

const T = { march: 20, clash: 82, src: 100, c: [128, 148, 168, 188], agree: 220, site: 270, don: 296, phan: 318, stamp: 360, tl: 410, w: [436, 456, 476], zone: 500, end: 540 };
const DUTCH = C.umber;
const PORT = "#6e5a1e";

const HEADS: Head[] = [
  { f: 0, tag: "ยุทธหัตถี พ.ศ. ๒๑๓๕", head: "จบลงด้วยอะไร?" },
  { f: T.src, tag: "หลักฐานเล่าต่างกัน", head: "ง้าว หอก หรือปืน?", sure: "mid" },
  { f: T.agree, tag: "ทุกฝ่ายตรงกัน", head: "พระมหาอุปราชาสิ้นพระชนม์", sure: "high", color: C.soot },
  { f: T.site, tag: "แล้วรบกันที่ไหน?", head: "สองที่ สองอนุสรณ์", sure: "mid" },
  { f: T.tl, tag: "ก่อนเชื่อ ดูว่าเขียนเมื่อไหร่", head: "ไม่มีฉบับไหนเขียนทันที" },
];
const LINES: [number, string][] = [
  [0, "ศึกครั้งเดียว แต่หลักฐานแต่ละฝ่ายเล่าไม่เหมือนกัน"],
  [T.src, "ไทยว่าง้าว ฟาน ฟลีตว่าหอก พม่าและโปรตุเกสว่าปืน"],
  [T.site, "สถานที่ก็ยังถกเถียง ดอนเจดีย์ หรือพนมทวน"],
  [T.tl, "ทุกฉบับเขียนหลังเหตุการณ์ 48 ถึง 240 ปี"],
];

const Audio = () => (
  <>
    <Sfx src={SFX.swell} at={0} volume={0.25} />
    <Bed id="war_drums" from={0} to={T.src + 10} volume={0.18} fade={20} />
    <Hit id="elephant" at={12} volume={0.32} />
    <Hit id="sword_clash" at={T.clash} volume={0.32} />
    {[0, 1, 2, 3].map((i) => <Sfx key={i} src={SFX.whoosh} at={T.src + i * 7 - 2} volume={0.14} />)}
    {T.c.map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.28} />)}
    <Hit id="wood_hit" at={T.agree} volume={0.4} />
    <Bed id="wind" from={T.src} to={T.end} volume={0.1} fade={30} />
    <Sfx src={SFX.whoosh} at={T.site - 6} volume={0.22} />
    <Sfx src={SFX.pop} at={T.don} volume={0.28} />
    <Sfx src={SFX.pop} at={T.phan} volume={0.28} />
    <Hit id="wood_hit" at={T.stamp} volume={0.45} />
    <Sfx src={SFX.whoosh} at={T.tl - 6} volume={0.2} />
    {T.w.map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.28} />)}
    <Sfx src={SFX.pop} at={T.zone} volume={0.28} />
  </>
);

// The map bundle: four leaves side by side, the map cut across all of them, a red cord through the holes.
const N_LEAVES = 4;
const MapBundle = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [bx, by, bw, bh] = BAND.map;
  const gap = 30;
  const lh = (bh - gap * (N_LEAVES - 1)) / N_LEAVES;
  const rows = Array.from({ length: N_LEAVES }, (_, i) => by + i * (lh + gap));
  const box: [number, number, number, number] = [bx, by, bw, bh];
  const cam = camAt(
    [
      { frame: 0, cam: fitBox(VW.region, box, 1.0) },
      { frame: 90, cam: fitBox(VW.west, box, 1.0) },
      { frame: T.site - 10, cam: fitBox(VW.west, box, 1.04) },
      { frame: T.site + 30, cam: fitBox(VW.duel, box, 0.92) },
      { frame: T.tl - 10, cam: fitBox(VW.duel, box, 0.96) },
      { frame: T.tl + 30, cam: fitBox(VW.region, box, 1.0) },
      { frame: T.end, cam: fitBox(VW.region, box, 1.03) },
    ],
    frame,
  );
  const zones = interpolate(frame, [6, 30, T.site - 10, T.site + 20, T.tl, T.tl + 30], [0, 1, 1, 0.15, 0.15, 1], clamp);
  const wide = frame < T.site - 10 || frame > T.tl + 20;
  // the bundle itself eases in like a leaf pile being spread out
  const spread = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <>
      <Layer>
        {/* the cord runs under the leaves: it shows in the gaps and through the drilled holes */}
        {[0.27, 0.73].map((hx) => (
          <CordRun key={hx} x={bx + bw * hx} y0={rows[0] + lh / 2} y1={by + bh + 22} sway={hx < 0.5 ? 5 : -5} />
        ))}
        {rows.map((ry, i) => (
          <Leaf key={i} x={bx + (1 - spread) * (i % 2 ? 40 : -40)} y={ry} w={bw} h={lh} seed={3 + i} tone={i} holes={[0.27, 0.73]} margins={false} />
        ))}
        <text x={bx + bw - 30} y={by + bh - 16} textAnchor="end" fontFamily={fonts.body} fontWeight={700} fontSize={20} fill={C.umber} opacity={0.85}>
          แผนที่จาก Natural Earth · เขตโดยประมาณ
        </text>
      </Layer>
      <MapFrame cam={cam} {...focusOf(box, width, height)}>
        <defs>
          <clipPath id="m03-bundle">
            {rows.map((ry, i) => (
              <rect key={i} x={bx + 6} y={ry + 4} width={bw - 12} height={lh - 8} rx={18} />
            ))}
          </clipPath>
        </defs>
        <g clipPath="url(#m03-bundle)" opacity={spread}>
          <LeafLand />
          <Mountains k={wide ? 1 : 0} />
          <Zones k={{ burma: zones, siam: zones }} />
          <March points={ROUTES.swa1592} start={T.march} end={T.march + 60} opacity={interpolate(frame, [T.site - 10, T.site + 10], [1, 0], clamp)} />
          <BattleCut at={PL.nongsarai} start={T.clash} end={T.site - 10} />
          <Hole at={PL.ayut} start={8} end={T.site - 10} r={11} />
          <Hole at={PL.pegu} start={14} end={T.site - 10} r={9} color={C.lacquer} />
          <PlaceCut at={PL.ayut} text="กรุงศรีอยุธยา" start={14} end={T.site - 10} dx={-30} dy={-22} anchor="end" />
          <PlaceCut at={PL.pegu} text="หงสาวดี" start={20} end={T.site - 10} dy={-30} color={C.lacquer} />
          {wide && <PlaceCut at={[95.6, 13.6]} text="ทะเลอันดามัน" start={0} size={30} color={C.umber} />}
          {/* the two proposed sites: the accepted one a plain drilled ring, the alternative a ring of drill marks */}
          <Hole at={PL.nongsarai} start={T.don} end={T.tl} r={14} />
          <Hole at={PL.phanomthuan} start={T.phan} end={T.tl} r={13} dashed color={C.lacquer} />
          <PlaceCut at={PL.nongsarai} text="ดอนเจดีย์ สุพรรณบุรี" start={T.don + 4} end={T.tl} dx={44} dy={14} size={44} anchor="start" />
          <PlaceCut at={PL.phanomthuan} text="พนมทวน กาญจนบุรี" start={T.phan + 4} end={T.tl} dx={44} dy={2} size={44} color={C.lacquer} anchor="start" />
          <PlaceCut at={PL.phanomthuan} text="(ตำแหน่งโดยประมาณ)" start={T.phan + 14} end={T.tl} dx={46} dy={40} size={26} color={C.umber} anchor="start" />
        </g>
      </MapFrame>
    </>
  );
};

export const Demo = () => (
  <AbsoluteFill style={{ background: C.table }}>
    <Audio />
    <Table />
    <MapBundle />
    <HeadLeaf heads={HEADS} kicker="M03 · ใบลานหลักฐาน" end={T.end} />
    <SourceLeaves
      start={T.src}
      end={T.site - 4}
      checks={T.c}
      sources={[
        { side: "ไทย", text: "พงศาวดารไทย", color: C.soot, say: "ง้าว" },
        { side: "ดัตช์", text: "ฟาน ฟลีต (๒๑๘๓)", color: DUTCH, say: "หอก" },
        { side: "พม่า", text: "ฉบับหอแก้ว", color: C.lacquer, say: "ปืน" },
        { side: "โปรตุเกส", text: "Bocarro · Pimenta", color: PORT, say: "ปืน" },
      ]}
      agree={{ f: T.agree, text: "สิ้นพระชนม์ในศึกนี้" }}
    />
    <CompareLeaves
      start={T.site}
      end={T.tl - 4}
      title="ยุทธหัตถีเกิดที่ไหน"
      left={{ tag: "กรมพระยาดำรงฯ ระบุ ๒๔๕๖", text: "ดอนเจดีย์", color: C.soot, f: T.don }}
      right={{ tag: "ข้อเสนอนักวิชาการบางกลุ่ม", text: "พนมทวน", color: C.lacquer, f: T.phan, dashed: true }}
      stamp={{ text: "ยังถกเถียง", f: T.stamp }}
    />
    <TimelineLeaf
      start={T.tl}
      end={T.end + 40}
      title="แต่ละฉบับเขียนเมื่อไหร่"
      from={2120}
      to={2400}
      marks={[
        { at: 2135, top: "2135", bottom: "ศึก", f: T.tl + 8, big: true, color: C.lacquer },
        { at: 2183, top: "2183", bottom: "ฟาน ฟลีต", f: T.w[0], color: DUTCH },
        { at: 2223, top: "2223", bottom: "ฉบับหลวงประเสริฐ", f: T.w[1] },
        { at: 2375, top: "2375", bottom: "ฉบับหอแก้ว", f: T.w[2], color: C.lacquer },
      ]}
      zone={{ from: 2150, text: "เขียนหลังเหตุการณ์ทั้งหมด", f: T.zone }}
    />
    <Subtitle lines={LINES} end={T.end} />
    <Layer>
      {/* loose leaves of the bundle at the bottom; the top one carries the credits */}
      <g transform="rotate(-2.2 540 1760)">
        <Leaf x={90} y={1700} w={900} h={120} seed={97} tone={2} holes={[0.04, 0.96]} margins={false} />
      </g>
      <g transform="rotate(1.6 540 1760)">
        <Leaf x={80} y={1690} w={920} h={124} seed={98} tone={0} holes={[0.04, 0.96]} margins={[0.08, 0.92]}>
          <Cut x={460} y={56} size={34} anchor="middle" font={fonts.title} color={C.lacquer}>
            ใบลานหลักฐาน · เล่าจากทุกฉบับ
          </Cut>
          <Cut x={460} y={94} size={19} anchor="middle" color={C.umber}>
            แผนที่วาดจาก Natural Earth · หลักฐาน: พงศาวดารไทย ฉบับหอแก้ว ฟาน ฟลีต Bocarro · Pimenta
          </Cut>
        </Leaf>
      </g>
    </Layer>
    <Grain opacity={0.16} />
  </AbsoluteFill>
);
