import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../components/camera";
import { MapFrame } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Mark, Note, PencilDefs, PencilRing, RiverTrace } from "./kit/Pencil";
import { C, clamp, DataBlock, Dossier, FilmFrame, fmtKm, P, Print, screenKm, TapeCaption, tileOpacity, useLayout, V, view, type Head } from "./kit/Recon";

// M04 recon film: one continuous analyst zoom from Southeast Asia (Blue Marble) through the central plain to 30 m
// NASA HLS imagery of Ayutthaya island, graded to grainy green-grey film on a light box. A typed dossier label
// (with a "ลับ" stamp) counts the ground width down; on arrival the rivers are traced in grease pencil, then
// temples and forts get numbered pencil circles. 14 s, 9:16 and 16:9.
export const demo: StyleDemo = { id: "M04", name: "ฟิล์มลาดตระเวน", frames: 420, cover: 372, sizes: ["9x16", "16x9"] };

const T = { dive: 24, plain: 130, island: 150, land: 235, glow: 238, pins: 262, end: 420 };
const TILES: [string, [number, number, number, number]][] = [["plainhls", [100.0, 13.6, 101.4, 15.3]], ["isle", [100.5, 14.3, 100.62, 14.4]]];
const RIVERS = ["แม่น้ำเจ้าพระยา", "แม่น้ำลพบุรี", "แม่น้ำป่าสัก"];
const SHOTS = [0, T.plain - 10, T.land - 12]; // a new frame number at each sharper tile

const CAPS: [number, number, string][] = [
  [8, 120, "ภาพดาวเทียมจริง จากอวกาศ"],
  [T.plain, 100, "ซูมลง เกาะเมืองอยุธยา"],
  [T.pins, 150, "วัด ป้อม และแม่น้ำ ยังเห็นได้ จากอวกาศ"],
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { vertical, s, img } = useLayout();
  const lift = vertical ? 0.03 : 0.02;
  const close = vertical ? 1.35 : 1.05;
  const cam = camAt(
    [
      { frame: 0, cam: view(V.region, width, height, 1, lift) },
      { frame: T.dive, cam: view(V.region, width, height, 1, lift) },
      { frame: T.plain, cam: view(V.central, width, height, 1.3, lift) },
      { frame: T.land, cam: view(V.island, width, height, close, lift) },
      { frame: T.end, cam: view(V.island, width, height, close * 1.08, lift) },
    ],
    frame,
  );
  const km = screenKm(cam.scale, width);
  const shot = SHOTS.filter((f) => frame >= f).length - 1;
  const counter = String(14 + shot).padStart(3, "0");
  const flash = SHOTS.slice(1).reduce((a, f) => Math.max(a, interpolate(frame, [f, f + 1, f + 5], [0, 0.85, 0], clamp)), 0);
  const heads: Head[] = [
    { f: 6, tag: `ภาพ ${counter}`, head: "ซูมลงเกาะเมืองเก่า", stat: fmtKm(km), label: "กว้าง|กม." },
    { f: T.glow, tag: `ภาพ ${counter}`, head: "แม่น้ำ 3 สายล้อมรอบ", stat: "30", label: "ละเอียด|ม. ต่อจุดภาพ" },
  ];
  const trace = interpolate(frame, [T.glow, T.glow + 30], [0, 1], clamp);
  const ring = interpolate(frame, [T.glow, T.glow + 12], [1, 0], clamp);
  const hls = tileOpacity(cam, width, height, TILES[0][1]) > 0.5;
  const kmPerPx = 6371 / cam.scale;
  const steps = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  const target = 240 * s * kmPerPx;
  const bar = steps.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a));
  const focus = { focusX: vertical ? 0.5 : 0.63 };
  return (
    <AbsoluteFill style={{ background: C.base }}>
      <Sfx src={SFX.swell} at={0} volume={0.2} />
      {SHOTS.slice(1).map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.45} />)}
      <Sfx src={SFX.whoosh} at={T.dive - 6} volume={0.18} />
      <Sfx src={SFX.whoosh} at={T.plain + 4} volume={0.18} />
      <Sfx src={SFX.riser} at={T.glow - 30} volume={0.12} />
      {[0, 1, 2, 3, 4].map((i) => <Sfx key={i} src={SFX.pop} at={T.pins + i * 24 + 2} volume={0.2} />)}
      <Print>
        <MapFrame cam={cam} {...focus}>
          <Raster layers={[{ name: "world" }, { name: "sea" }, ...TILES.map(([name, bb]) => ({ name, opacity: tileOpacity(cam, width, height, bb) }))]} />
        </MapFrame>
      </Print>
      <AbsoluteFill style={{ clipPath: `inset(${img.y}px ${width - img.x - img.w}px ${height - img.y - img.h}px ${img.x}px)` }}>
        <MapFrame cam={cam} {...focus}>
          <PencilDefs />
          <PencilRing at={P.ayut} rx={130} ry={90} start={T.island} k={ring} />
          <Note at={[P.ayut[0] + 0.06, P.ayut[1] + 0.07]} text="เป้าหมาย?" start={T.island + 14} color={C.red} size={42} rot={-6} />
          <RiverTrace hi={Object.fromEntries(RIVERS.map((r) => [r, trace]))} />
          <Note at={vertical ? [100.549, 14.331] : [100.537, 14.326]} text="เจ้าพระยา" start={T.glow + 14} size={34} rot={-12} />
          <Note at={[100.552, 14.372]} text="ลพบุรี" start={T.glow + 20} size={34} rot={-3} />
          <Note at={vertical ? [100.5875, 14.383] : [100.6, 14.37]} text="ป่าสัก" start={T.glow + 26} size={34} rot={80} />
          <Mark at={P.sanphet} n={1} text="วัดพระศรีสรรเพชญ์" sub="วัดในวังหลวง" start={T.pins} side="up" />
          <Mark at={P.mahathat} n={2} text="วัดมหาธาตุ" start={T.pins + 24} side="right" />
          <Mark at={P.chaiwat} n={3} text="วัดไชยวัฒนาราม" start={T.pins + 48} side={vertical ? "down" : "left"} />
          <Mark at={P.phet} n={4} text="ป้อมเพชร" sub="ปากน้ำ 2 สาย" start={T.pins + 72} side="down" color={C.red} />
          <Mark at={P.phanan} n={5} text="วัดพนัญเชิง" start={T.pins + 96} side={vertical ? "left" : "right"} r={28} />
          <Note at={[P.ayut[0] - 0.035, P.ayut[1] - 0.028]} text="ตำแหน่งโดยประมาณ" start={T.pins + 110} size={26} color="#eef3e6" rot={-2} />
        </MapFrame>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#f4f6ee", opacity: flash, mixBlendMode: "screen" }} />
      <FilmFrame counter={counter} />
      <Dossier heads={heads} end={T.end + 20} />
      <DataBlock lines={["20 ม.ค. 2568 · 10:42", hls ? "NASA HLS · 30 ม./จุดภาพ" : "NASA BLUE MARBLE · 500 ม.", `ภาพ ${counter} · ม้วน 0417`]} scale={{ px: bar / kmPerPx, label: bar < 1 ? `${bar * 1000} ม.` : `${bar.toLocaleString("en-US")} กม.` }} />
      {CAPS.map(([start, len, text]) => <TapeCaption key={start} text={text} start={start} len={len} />)}
    </AbsoluteFill>
  );
};
