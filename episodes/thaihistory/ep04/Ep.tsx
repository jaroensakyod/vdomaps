import type { FeatureCollection, MultiLineString } from "geojson";
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, projectionFor, type Cam } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { MapFrame, useMap } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { Sfx } from "../../../components/Sound";
import { UI_GAIN } from "./mix";
import { totalFrames } from "../../../components/subs.mjs";
import { useJson } from "../../../components/useJson";
import { CAPTION_TOP, font, HeadCard, LAYOUT, NightGrade, Rivers, TopBar } from "../news/kit";
import { BEATS, type Chapter4 } from "./beatsKit";
import { e4ch0 } from "./ch0";
import { e4c1 } from "./ch1";
import { e4c2 } from "./ch2";
import { e4c3 } from "./ch3";
import { e4c4 } from "./ch4";
import { e4c5 } from "./ch5";
import { e4c6 } from "./ch6";
import { e4c7 } from "./ch7";
import { e4c8 } from "./ch8";
import { PL } from "./places";

// ประวัติศาสตร์บนแผนที่ ตอน 4: จุดจบของพระเจ้าตาก (news look, house standard, illustration style v2).
export const E4_CHAPTERS: Chapter4[] = [e4ch0, e4c1, e4c2, e4c3, e4c4, e4c5, e4c6, e4c7, e4c8];
export const E4_FRAMES = totalFrames(BEATS, LAYOUT);

const TILES: [string, [number, number, number, number]][] = [["plainhls", [100.0, 13.6, 101.4, 15.3]], ["bkkhls", [100.4, 13.66, 100.58, 13.82]]];
const coverage = (cam: Cam, w: number, h: number, [x0, y0, x1, y1]: [number, number, number, number]) => {
  const p = projectionFor(cam, w, h);
  let n = 0;
  let inside = 0;
  for (let i = 0; i <= 11; i++)
    for (let j = 0; j <= 19; j++) {
      const q = p.invert!([(w * i) / 11, (h * j) / 19]);
      n++;
      if (q && q[0] >= x0 && q[0] <= x1 && q[1] >= y0 && q[1] <= y1) inside++;
    }
  return inside / n;
};

// Thonburi/Bangkok canals (OSM), drawn only when the camera is close.
const BkkRivers = () => {
  const { path, projection, s } = useMap();
  const data = useJson<FeatureCollection<MultiLineString, { name: string }>>("data/th-bkk.json");
  const pxDeg = (projection.scale() * Math.PI) / 180;
  if (!data || pxDeg < 4000) return null;
  const w = Math.min(Math.max(pxDeg * 0.0002, 2 * s), 8 * s);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {data.features.map((f, i) => <path key={i} d={path(f) ?? ""} stroke="#7fd4ff" strokeWidth={w} strokeOpacity={0.7} />)}
    </g>
  );
};

export const Ep04 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = camAt(E4_CHAPTERS.flatMap((c) => c.cams(width, height)).sort((a, b) => a.frame - b.frame), frame);
  const ch = E4_CHAPTERS.find((c) => frame >= c.from && frame < c.to) ?? E4_CHAPTERS[E4_CHAPTERS.length - 1];
  const years = E4_CHAPTERS.flatMap((c) => c.years).sort((a, b) => a[0] - b[0]);
  const year = [...years].reverse().find(([f]) => frame >= f)?.[1] ?? years[0][1];
  const night = Math.max(0, ...E4_CHAPTERS.map((c) => (c.night && frame >= c.from && frame < c.to + 30 ? c.night(frame) : 0)));
  const near = (c: Chapter4) => frame >= c.from - 30 && frame < c.to + 30;
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      {E4_CHAPTERS.flatMap((c) => c.sfx.map(([f, src, v], i) => <Sfx key={`${c.name}${i}`} src={src} at={Math.max(0, f)} volume={v * UI_GAIN} />))}
      {E4_CHAPTERS.map((c) => (c.Audio ? <c.Audio key={`a${c.name}`} /> : null))}
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "sea" }, ...TILES.map(([name, bb]) => ({ name, opacity: Math.min(1, Math.max(0, (coverage(cam, width, height, bb) - 0.8) * 5)) }))]} />
        <Rivers />
        <BkkRivers />
        <NightGrade k={night} fireAt={PL.thon} />
        {E4_CHAPTERS.filter(near).map((c) => <c.Map key={c.name} />)}
        {E4_CHAPTERS.filter(near).map((c) => <c.Panels key={`p${c.name}`} />)}
      </MapFrame>
      {frame >= BEATS[1].start - 4 && <TopBar chapter={ch.name} year={year} />}
      {E4_CHAPTERS.map((c) => <HeadCard key={c.name} heads={c.heads} from={c.heads[0]?.f ?? c.from} to={c.to} />)}
      {E4_CHAPTERS.filter(near).map((c) => (c.Screen ? <c.Screen key={`s${c.name}`} /> : null))}
      {BEATS.filter((b) => b.id !== "hook").map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP} />
      ))}
    </AbsoluteFill>
  );
};
