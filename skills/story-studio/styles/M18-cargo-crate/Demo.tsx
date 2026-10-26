import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { camAt } from "../../components/camera";
import { MapFrame } from "../../components/Map";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { C, clamp, CrateDefs, CrateFace, fitBox, font, Paint, PriceTag, Port, Stamp, Rope, SmallCrate, StencilLand, StencilRoute, StencilText, useCrate } from "./kit/Crate";

// M18 cargo crate: a generic sample (ตัวอย่าง, made-up prices) of two shipping routes out of Bangkok, sprayed
// through stencils onto the face of a wooden crate. The map and title spray on, red stencil dashes run to
// Singapore and Hong Kong, small crates with stamped cargo labels slide in and stack, manila price tags swing in on
// string from nails. 15 s.
export const demo: StyleDemo = { id: "M18", name: "ลังสินค้า", frames: 450, cover: 405, sizes: ["9x16"] };

const BKK: [number, number] = [100.52, 13.72];
const SIN: [number, number] = [103.85, 1.29];
const HKG: [number, number] = [114.16, 22.28];
const R1: [number, number][] = [BKK, [100.8, 12.7], [101.6, 10.5], [102.6, 8.3], [103.9, 6.0], [104.7, 3.5], [104.5, 1.9], [103.95, 1.33]];
const R2: [number, number][] = [BKK, [100.9, 12.6], [102.6, 10.2], [104.6, 7.9], [107.0, 8.1], [109.9, 11.2], [110.8, 14.5], [112.4, 18.0], [113.6, 21.0], [114.1, 22.1]];
const MAPBOX = [110, 250, 860, 960];

const LINES = [
  { text: "ตัวอย่าง: ส่งสินค้าเกษตรจากกรุงเทพฯ ทางเรือ", start: 18, len: 118 },
  { text: "ข้าวหอมมะลิ ลงเรือใต้ไปสิงคโปร์", start: 136, len: 110 },
  { text: "ทุเรียน ขึ้นเหนือไปฮ่องกง", start: 246, len: 100 },
  { text: "ป้ายราคาบอกราคาต่อตัน ของแต่ละเส้นทาง", start: 346, len: 104 },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { s, width, height } = useCrate();
  const [mx, my, mw, mh] = MAPBOX.map((v) => v * s);
  const cam = camAt(
    [
      { frame: 0, cam: fitBox([96.5, 0, 117.5, 24], [0, 0, mw, mh], 1.0) },
      { frame: demo.frames, cam: fitBox([96.5, 0, 117.5, 24], [0, 0, mw, mh], 1.04), easing: (t) => t },
    ],
    frame,
  );
  const spray = (f0: number, d = 26) => interpolate(frame, [f0, f0 + d], [0, 1], clamp);
  const route = (f0: number, d = 60) => interpolate(frame, [f0, f0 + d], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const line = LINES.filter((l) => frame >= l.start && frame < l.start + l.len)[0];
  const lo = line ? interpolate(frame, [line.start, line.start + 6, line.start + line.len - 5, line.start + line.len], [0, 1, 1, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{ background: C.dark }}>
      <Bed id="ship_creak" from={0} to={demo.frames} volume={0.1} />
      <Sfx src={SFX.whoosh} at={2} volume={0.18} />
      <Sfx src={SFX.whoosh} at={24} volume={0.15} />
      <Sfx src={SFX.whoosh} at={100} volume={0.14} />
      <Sfx src={SFX.whoosh} at={230} volume={0.14} />
      {[164, 189, 294].map((f) => <Hit key={f} id="wood_hit" at={f} volume={0.35} />)}
      {[200, 312].map((f) => <Sfx key={`t${f}`} src={SFX.tick} at={f} volume={0.25} />)}
      {[60, 76, 90].map((f) => <Sfx key={`p${f}`} src={SFX.pop} at={f} volume={0.15} />)}
      <CrateDefs />
      <CrateFace />
      <Rope side="left" y={1340 * s} />
      <Rope side="right" y={1340 * s} />
      {/* title plank: kicker in red stencil, title in black, sprayed on */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <Paint id="band" box={[0, 0, width, 240 * s]} k={spray(0, 10)}>
          <rect x={92 * s} y={0} width={width - 184 * s} height={236 * s} fill={C.red} />
        </Paint>
        <Paint id="band2" box={[0, 1220 * s, width, 30 * s]} k={spray(30, 20)}>
          <rect x={92 * s} y={1236 * s} width={width - 184 * s} height={22 * s} fill={C.red} />
        </Paint>
        <Paint id="kick" wear={false} box={[140 * s, 40 * s, 800 * s, 60 * s]} k={spray(0, 16)}>
          <StencilText x={540 * s} y={84 * s} text="M18 · ลังสินค้า" size={34 * s} color={C.paint} anchor="middle" spacing={8} />
        </Paint>
        <Paint id="title" box={[120 * s, 100 * s, 840 * s, 120 * s]} k={spray(8, 22)}>
          <StencilText x={540 * s} y={190 * s} text="ส่งออกทางเรือ" size={98 * s} color={C.label} anchor="middle" spacing={4} />
        </Paint>
      </svg>
        <MapFrame cam={cam} focusX={(mx + mw / 2) / width} focusY={(my + mh / 2) / height}>
          <defs>
            <clipPath id="m18-mapbox">
              <rect x={mx} y={my} width={mw} height={mh} />
            </clipPath>
          </defs>
          <Paint id="map" box={[mx, my, mw, mh]} k={spray(22, 40)}>
            <g clipPath="url(#m18-mapbox)">
              <StencilLand />
            </g>
            <rect x={mx - 14 * s} y={my - 14 * s} width={mw + 28 * s} height={mh + 28 * s} fill="none" stroke={C.paint} strokeWidth={6 * s} strokeDasharray={`${90 * s} ${10 * s}`} />
          </Paint>
          <Paint id="r1" box={[0, 0, width, height]} k={1}>
            <StencilRoute pts={R1} k={route(100)} />
            <StencilRoute pts={R2} k={route(230, 70)} />
          </Paint>
          <Stamp x={575 * s} y={1120 * s} text="ตัวอย่าง" sub="ราคาสมมติ" k={interpolate(frame, [70, 80], [0, 1], clamp)} />
          <Port at={BKK} name="กรุงเทพฯ" dx={26} dy={-20} anchor="start" k={spray(56, 12)} />
          <Port at={SIN} name="สิงคโปร์" dx={-30} dy={52} anchor="middle" k={spray(150, 12)} />
          <Port at={HKG} name="ฮ่องกง" dx={-14} dy={62} anchor="end" k={spray(290, 12)} />
        </MapFrame>
      <PriceTag nail={[655 * s, 760 * s]} at={196} price="฿21,000" unit="ข้าวหอมมะลิ / ตัน" note="ราคาสมมติ · ตัวอย่าง" len={70} />
      <PriceTag nail={[820 * s, 420 * s]} at={306} price="฿95,000" unit="ทุเรียน / ตัน" note="ราคาสมมติ · ตัวอย่าง" len={150} w={270} />
      {/* the stack: crates slide in from the right and drop into place */}
      <SmallCrate x={140 * s} y={1450 * s} w={330 * s} h={190 * s} at={146} goods="ข้าวหอมมะลิ" sub="ไป · สิงคโปร์" tilt={-3} />
      <SmallCrate x={490 * s} y={1450 * s} w={330 * s} h={190 * s} at={172} goods="ข้าวหอมมะลิ" sub="ไป · สิงคโปร์" tilt={2} />
      <SmallCrate x={310 * s} y={1262 * s} w={330 * s} h={190 * s} at={276} goods="ทุเรียน" sub="ไป · ฮ่องกง" tilt={-4} />
      {/* caption: a long stamped paper strip pasted across the bottom planks */}
      <div style={{ position: "absolute", left: 120 * s, right: 120 * s, top: 1688 * s, height: 136 * s, background: C.label, transform: "rotate(-0.6deg)", boxShadow: `0 ${4 * s}px ${10 * s}px rgba(0,0,0,0.45)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>
        <div style={{ position: "absolute", inset: 8 * s, border: `${2 * s}px dashed ${C.dark}`, opacity: 0.4 }} />
        <div style={{ opacity: lo, fontSize: 42 * s, fontWeight: 700, color: C.paint, textAlign: "center", lineHeight: 1.3, whiteSpace: "nowrap", padding: `0 ${30 * s}px` }}>{line?.text}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1858 * s, textAlign: "center", fontFamily: font, fontSize: 18 * s, fontWeight: 600, color: C.label, opacity: 0.8 }}>
        ตัวอย่าง · ราคาสมมติ · เส้นทางเรือโดยประมาณ · แผนที่ Natural Earth
      </div>
    </AbsoluteFill>
  );
};
