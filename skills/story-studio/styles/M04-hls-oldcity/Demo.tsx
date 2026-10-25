import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { MapFrame } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { BG, BLUE, CAPTION_TOP, CityRing, clamp, font, GOLD, HeadCard, P, RED, Rivers, tileOpacity, TopBar, V, view, type Head } from "./kit/News";
import { fmtKm, Pin, ScaleBar, screenKm } from "./kit/Pins";

// M04 HLS old city: one continuous dive from Southeast Asia (Blue Marble) through the central plain to 30 m NASA HLS
// imagery of Ayutthaya island; the rivers round the island light up, then temples and forts get pins. 14 s.
export const demo: StyleDemo = { id: "M04", name: "ซูมดาวเทียม 30 ม. ลงเมืองเก่า", frames: 420, cover: 372, sizes: ["9x16", "16x9"] };

const T = { dive: 24, plain: 130, island: 150, land: 235, glow: 238, pins: 262, end: 420 };
// Tiles from coarse to sharp; each fades in only once it covers the whole screen.
const TILES: [string, [number, number, number, number]][] = [["plainhls", [100.0, 13.6, 101.4, 15.3]], ["isle", [100.5, 14.3, 100.62, 14.4]]];
const RIVERS = ["แม่น้ำเจ้าพระยา", "แม่น้ำลพบุรี", "แม่น้ำป่าสัก"];

const CAPS: [number, number, string][] = [
  [8, 120, "ภาพดาวเทียมจริง จากอวกาศ"],
  [T.plain, 100, "ซูมลง เกาะเมืองอยุธยา"],
  [T.pins, 150, "วัด ป้อม และแม่น้ำ ยังเห็นได้ จากอวกาศ"],
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const wide = width > height;
  const lift = wide ? 0.02 : 0.03;
  const close = wide ? 1.05 : 1.35;
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
  const heads: Head[] = [
    { f: 6, tag: "ดาวเทียม NASA HLS", head: "ซูมลงเกาะเมืองเก่า", stat: fmtKm(km), label: "กม. กว้างทั้งจอ", color: BLUE },
    { f: T.glow, tag: "เกาะเมืองอยุธยา", head: "แม่น้ำ 3 สายล้อมรอบ", stat: "30", label: "เมตร ต่อ 1 จุดภาพ", color: GOLD, chips: [{ text: "เจ้าพระยา", f: T.glow + 8 }, { text: "ลพบุรี", f: T.glow + 16 }, { text: "ป่าสัก", f: T.glow + 24 }] },
  ];
  const glow = interpolate(frame, [T.glow, T.glow + 16, T.pins + 40, T.pins + 70], [0, 1, 1, 0.35], clamp);
  const ring = interpolate(frame, [T.island, T.island + 20, T.glow, T.glow + 16], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sfx src={SFX.swell} at={0} volume={0.25} />
      <Sfx src={SFX.whoosh} at={T.dive - 6} volume={0.25} />
      <Sfx src={SFX.whoosh} at={T.plain + 4} volume={0.25} />
      <Sfx src={SFX.hit} at={T.glow} volume={0.3} />
      {[0, 1, 2, 3, 4].map((i) => <Sfx key={i} src={SFX.pop} at={T.pins + i * 24} volume={0.25} />)}
      <MapFrame cam={cam} focusX={wide ? 0.63 : 0.5}>
        <Raster layers={[{ name: "world" }, { name: "sea" }, ...TILES.map(([name, bb]) => ({ name, opacity: tileOpacity(cam, width, height, bb) }))]} />
        <Rivers hi={Object.fromEntries(RIVERS.map((r) => [r, glow]))} />
        <CityRing k={ring} color={GOLD} />
        <Pin at={P.sanphet} text="วัดพระศรีสรรเพชญ์" sub="วัดในวังหลวง" start={T.pins} color={GOLD} side="up" />
        <Pin at={P.mahathat} text="วัดมหาธาตุ" start={T.pins + 24} color={GOLD} side="right" />
        <Pin at={P.chaiwat} text="วัดไชยวัฒนาราม" start={T.pins + 48} color={BLUE} side="right" />
        <Pin at={P.phet} text="ป้อมเพชร" sub="ปากน้ำ 2 สาย" start={T.pins + 72} color={RED} side="down" />
        <Pin at={P.phanan} text="วัดพนัญเชิง" start={T.pins + 96} color={BLUE} side="right" size={0.9} />
        <ScaleBar note={tileOpacity(cam, width, height, TILES[0][1]) > 0.5 ? "NASA HLS · 30 ม./จุดภาพ" : "NASA Blue Marble · ราว 350 ม./จุดภาพ"} start={10} />
      </MapFrame>
      <TopBar badge="M04 · ซูมดาวเทียม 30 ม. ลงเมืองเก่า" chip="ภาพ 20 ม.ค. 2568" />
      <HeadCard heads={heads} from={heads[0].f} to={T.end + 20} />
      {CAPS.map(([start, len, text]) => (
        <Caption key={start} text={text} start={start} len={len} font={font} top={CAPTION_TOP} />
      ))}
    </AbsoluteFill>
  );
};
