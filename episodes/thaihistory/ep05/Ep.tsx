import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, panelHideAt, projectionFor, type Cam } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import type { FeatureCollection, MultiLineString } from "geojson";
import { MapFrame, useMap } from "../../../components/Map";
import { useJson } from "../../../components/useJson";
import { Raster } from "../../../components/Raster";
import { Sfx } from "../../../components/Sound";
import { totalFrames } from "../../../components/subs.mjs";
import { CAPTION_TOP, CLEAR, font, HeadCard, LAYOUT, LayoutCtx, Rivers, TopBar } from "../news/kit";
import { BEATS, type Chapter5 } from "./beatsKit";
import { e5c0 } from "./ch0";
import { e5c1 } from "./ch1";
import { e5c2 } from "./ch2";
import { e5c3 } from "./ch3";
import { e5c4 } from "./ch4";
import { e5c5 } from "./ch5";
import { e5c6 } from "./ch6";
import { e5c7 } from "./ch7";
import { e5c8 } from "./ch8";
import { UI_GAIN } from "./mix";

// ประวัติศาสตร์บนแผนที่ ตอน 5: สยามรอดได้อย่างไร (วันปิยมหาราช) — news look, house standard, illustration style v2.
export const E5_CHAPTERS: Chapter5[] = [e5c0, e5c1, e5c2, e5c3, e5c4, e5c5, e5c6, e5c7, e5c8];
export const E5_FRAMES = totalFrames(BEATS, LAYOUT) + 30; // ~2 s hold on the poll

// Close-up imagery fades in only when the camera is well inside its box.
const TILES: [string, [number, number, number, number]][] = [["mouthhls", [100.44, 13.36, 100.7, 13.8]]];
const coverage = (cam: Cam, w: number, h: number, [x0, y0, x1, y1]: [number, number, number, number]) => {
  const p = projectionFor(cam, w, h);
  let n = 0;
  let inside = 0;
  for (let i = 0; i <= 17; i++)
    for (let j = 0; j <= 31; j++) {
      const q = p.invert!([(w * i) / 17, (h * j) / 31]);
      n++;
      if (q && q[0] >= x0 && q[0] <= x1 && q[1] >= y0 && q[1] <= y1) inside++;
    }
  return inside / n;
};

// Mekong, Irrawaddy, Chao Phraya and other big rivers (Natural Earth), thicker as the camera closes in.
const BigRivers = () => {
  const { path, projection, s } = useMap();
  const data = useJson<{ rivers: FeatureCollection<MultiLineString, { name: string; rank: number }> }>("data/searivers.json");
  const pxDeg = (projection.scale() * Math.PI) / 180;
  if (!data) return null;
  const w = Math.min(Math.max(pxDeg * 0.004, 1.6 * s), 7 * s);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {data.rivers.features.map((f, i) => <path key={i} d={path(f) ?? ""} stroke="#7fd4ff" strokeWidth={w * (f.properties.rank <= 3 ? 1 : 0.6)} strokeOpacity={0.55} />)}
    </g>
  );
};

// clear = house-standard layout (23 Oct 2026, after this episode was delivered — Ep05 keeps the classic look,
// Ep05Clear shows the new one): compact head card, panel shrunk to 80 % about its bottom edge and tucked away while
// the camera moves, map zoomed out to 80 % with its focus moved up into the open band (≈17–60 % of the height).
export const Ep05 = ({ clear = false }: { clear?: boolean }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const keys = E5_CHAPTERS.flatMap((c) => c.cams(width, height)).sort((a, b) => a.frame - b.frame);
  const base = camAt(keys, frame);
  const cam = clear ? { ...base, scale: base.scale * CLEAR.camScale } : base;
  const hide = clear ? panelHideAt(keys, frame) : 0;
  // Tile opacity averaged over the last 10 frames: a fast zoom-out otherwise drops it in 2–3 frames (flicker).
  const tileOpacity = (bb: [number, number, number, number]) => {
    let sum = 0;
    for (let d = 0; d < 10; d++) sum += Math.min(1, Math.max(0, (coverage(camAt(keys, Math.max(0, frame - d)), width, height, bb) - 0.8) * 5));
    return sum / 10;
  };
  const ch = E5_CHAPTERS.find((c) => frame >= c.from && frame < c.to) ?? E5_CHAPTERS[E5_CHAPTERS.length - 1];
  const years = E5_CHAPTERS.flatMap((c) => c.years).sort((a, b) => a[0] - b[0]);
  const year = [...years].reverse().find(([f]) => frame >= f)?.[1] ?? years[0][1];
  const near = (c: Chapter5) => frame >= c.from - 30 && frame < c.to + 30;
  return (
    <LayoutCtx.Provider value={clear ? { compact: true, panelScale: CLEAR.panelScale, panelHide: hide } : { compact: false, panelScale: 1, panelHide: 0 }}>
    <AbsoluteFill style={{ background: "#02060d" }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      {E5_CHAPTERS.flatMap((c) => c.sfx.map(([f, src, v], i) => <Sfx key={`${c.name}${i}`} src={src} at={Math.max(0, f)} volume={v * UI_GAIN} />))}
      {E5_CHAPTERS.map((c) => (c.Audio ? <c.Audio key={`a${c.name}`} /> : null))}
      <MapFrame cam={cam} focusY={clear ? CLEAR.focusY : 0.5}>
        <Raster layers={[{ name: "world" }, { name: "sea2" }, ...TILES.map(([name, bb]) => ({ name, opacity: tileOpacity(bb) }))]} />
        <BigRivers />
        <Rivers />
        {E5_CHAPTERS.filter(near).map((c) => <c.Map key={c.name} />)}
        {E5_CHAPTERS.filter(near).map((c) => <c.Panels key={`p${c.name}`} />)}
      </MapFrame>
      {frame >= BEATS[1].start - 4 && <TopBar chapter={ch.name} year={year} />}
      {E5_CHAPTERS.map((c) => <HeadCard key={c.name} heads={c.heads} from={c.heads[0]?.f ?? c.from} to={c.to} />)}
      {E5_CHAPTERS.filter(near).map((c) => (c.Screen ? <c.Screen key={`s${c.name}`} /> : null))}
      {BEATS.filter((b) => b.id !== "hook").map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP} />
      ))}
    </AbsoluteFill>
    </LayoutCtx.Provider>
  );
};
