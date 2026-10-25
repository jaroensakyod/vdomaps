import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { PointLabel } from "../../components/Labels";
import { MapFrame } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { BG, BLUE, CAPTION_TOP, CityRing, clamp, font, GOLD, HeadCard, NightGrade, P, Panel, RED, Rivers, Skyline, tileOpacity, TopBar, V, view, type Head } from "./kit/News";
import { BurmeseSoldier, CityWall, Embers, Moon, SiamSoldier, Smoke } from "./kit/Period";

// M02 history vertical: the long-form history news look. Central plain on NASA HLS imagery → the rivers light up →
// dive onto the island city → night falls, the city glows red, the illustration panel shows the walls burning. 12 s.
export const demo: StyleDemo = { id: "M02", name: "ประวัติศาสตร์แนวตั้ง 10 นาที", frames: 360, cover: 318, sizes: ["9x16"] };

const T = { rivers: 30, dive: 120, city: 128, night: 232, ring: 246, end: 360 };
const TILES: [string, [number, number, number, number]][] = [["plainhls", [100.0, 13.6, 101.4, 15.3]], ["isle", [100.5, 14.3, 100.62, 14.4]]];

const HEADS: Head[] = [
  { f: 8, tag: "ภูมิศาสตร์", head: "เมืองบนเกาะกลางแม่น้ำ", stat: "3", label: "แม่น้ำล้อมรอบ", color: BLUE },
  { f: T.city, tag: "ราชธานี", head: "มั่นคงมาหลายร้อยปี", stat: (f) => String(Math.round(interpolate(f, [T.city + 6, T.city + 60], [0, 417], clamp))), label: "ปี", color: GOLD },
  { f: T.night, tag: "7 เมษายน 2310", head: "กรุงแตกในคืนเดียว", stat: "1", label: "คืน", color: RED, chips: [{ text: "กำแพงพัง", f: T.ring + 10 }, { text: "ไฟไหม้ทั้งเมือง", f: T.ring + 30 }] },
];

const CAPS: [number, number, string][] = [
  [10, 110, "กรุงศรีอยุธยา มีแม่น้ำ สามสาย ล้อมรอบ"],
  [T.city, 100, "เป็นราชธานี ที่มั่นคง มาถึง 417 ปี"],
  [T.night + 4, 120, "แต่กลับแตก ได้ในคืนเดียว"],
];

// Daytime: the city at its strongest — gold skyline, wall, river in front.
const StrongScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="strong" anchor={P.ayut} start={start} end={end} sky={["#3a6ea5", "#bfe0f2"]} accent={BLUE}>
    {(g) => (
      <g>
        <Skyline g={g} color="#5b4436" gold base={95} />
        <rect x={g.x} y={g.ground - 6 * g.s} width={g.W} height={g.H} fill="#4f8db5" />
        <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground - 10 * g.s} h={86 * g.s} s={g.s} />
        {[0.3, 0.62].map((fx, i) => <SiamSoldier key={i} x={g.x + g.W * fx} y={g.ground - 96 * g.s} scale={g.sc * 0.55} phase={i} />)}
        <rect x={g.x} y={g.ground + 2 * g.s} width={g.W} height={g.H} fill="#5f97b5" opacity={0.95} />
      </g>
    )}
  </Panel>
);

// Night of the fall: burning skyline, breached wall, soldiers pouring in, embers.
const StormScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="storm" anchor={P.huaro} start={start} end={end} sky={["#0b1230", "#c8461f"]}>
      {(g) => {
        const climb = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <Moon x={g.x + g.W * 0.86} y={g.y + 70 * g.s} r={26 * g.s} />
            <Skyline g={g} color="#2a1a1f" burn={1} />
            <Smoke x={g.x + g.W * 0.5} y={g.ground - 140 * g.s} size={160 * g.s} />
            <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#2b2016" />
            <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={90 * g.s} s={g.s} breach={1} bx={g.x + g.W * 0.55} />
            {[0, 1, 2, 3, 4].map((i) => {
              const p = (climb * 0.9 + i * 0.16) % 1;
              const sx = g.x + g.W * (0.18 + p * 0.5);
              const sy = g.ground + 6 * g.s - Math.sin(Math.min(1, p * 1.4) * Math.PI) * 50 * g.s * (p > 0.25 ? 1 : 0);
              return <BurmeseSoldier key={i} x={sx} y={sy} scale={g.sc * 0.95} phase={i * 1.3} hold={i % 2 ? "torch" : "spear"} pose={p > 0.25 && p < 0.7 ? "climb" : "walk"} />;
            })}
            <Embers x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} />
          </g>
        );
      }}
    </Panel>
  );
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = camAt(
    [
      { frame: 0, cam: view(V.central, width, height, 1) },
      { frame: 20, cam: view(V.central, width, height, 1) },
      { frame: 105, cam: view(V.plain, width, height, 1.05) },
      { frame: T.dive, cam: view(V.plain, width, height, 1.05) },
      { frame: 200, cam: view(V.island, width, height, 1.05, 0.1) },
      { frame: T.end, cam: view(V.island, width, height, 1.15, 0.1) },
    ],
    frame,
  );
  const hi = interpolate(frame, [T.rivers, T.rivers + 20, T.dive - 10, T.dive + 10], [0, 1, 1, 0], clamp);
  const night = interpolate(frame, [T.night, T.night + 30], [0, 1], clamp);
  const ring = interpolate(frame, [T.ring, T.ring + 12], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sfx src={SFX.swell} at={0} volume={0.25} />
      <Sfx src={SFX.whoosh} at={T.rivers - 4} volume={0.2} />
      <Sfx src={SFX.whoosh} at={T.dive - 6} volume={0.25} />
      <Sfx src={SFX.pop} at={T.city} volume={0.25} />
      <Sfx src={SFX.tick} at={T.city + 30} volume={0.2} />
      <Hit id="cannon_far" at={T.night} volume={0.4} />
      <Sfx src={SFX.hit} at={T.ring} volume={0.3} />
      <Bed id="fire_crackle" from={T.night} to={T.end} volume={0.18} />
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "sea" }, ...TILES.map(([name, bb]) => ({ name, opacity: tileOpacity(cam, width, height, bb) }))]} />
        <Rivers hi={{ แม่น้ำเจ้าพระยา: hi, แม่น้ำลพบุรี: hi, แม่น้ำป่าสัก: hi }} />
        <NightGrade k={night} fireAt={P.ayut} />
        <CityRing k={ring} />
        <PointLabel at={P.ayut} text="อยุธยา" start={T.city} color={night > 0.5 ? RED : GOLD} size={0.85} />
        <StrongScene start={T.city + 4} end={T.night + 14} />
        <StormScene start={T.night} end={T.end + 20} />
      </MapFrame>
      <TopBar badge="M02 · ประวัติศาสตร์แนวตั้ง 10 นาที" year={frame < T.night ? "1893–2310" : "2310"} />
      <HeadCard heads={HEADS} from={HEADS[0].f} to={T.end + 20} />
      {CAPS.map(([start, len, text]) => (
        <Caption key={start} text={text} start={start} len={len} font={font} top={CAPTION_TOP} />
      ))}
    </AbsoluteFill>
  );
};
