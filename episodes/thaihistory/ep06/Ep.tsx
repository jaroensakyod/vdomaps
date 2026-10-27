import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, holdAndMove, panelHideAt, projectionFor, type Cam } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { MapFrame } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { Sfx } from "../../../components/Sound";
import { CAPTION_TOP, CLEAR, font, HeadCard, LayoutCtx, Rivers, SeaLift, TopBar } from "../news/kit";
import { B, BEATS, type Chapter6 } from "./beatsKit";
import { e6c0 } from "./ch0";
import { e6c1 } from "./ch1";
import { e6c2 } from "./ch2";
import { e6c3 } from "./ch3";
import { e6c4 } from "./ch4";
import { e6c5 } from "./ch5";
import { E6_END, e6c6 } from "./ch6";
import { Trail } from "./mapkit";
import { UI_GAIN } from "./mix";
import { ROUTE } from "./places";

// ประวัติศาสตร์บนแผนที่ ตอน 6: พระยาตากฝ่าวงล้อมออกจากกรุง (ม.ค. 2310) — news look, house standard (clear layout),
// illustration style v2, recorded sound. ~5.5 min. Built for no stutter (one narration take cut in its pauses, beds
// that cross-fade and stay ducked through the narration) and no flicker (soft flashes, tiles faded over 10 frames).
export const E6_CHAPTERS: Chapter6[] = [e6c0, e6c1, e6c2, e6c3, e6c4, e6c5, e6c6];
export const E6_FRAMES = E6_END;

// Close-up imagery fades in only when the camera is well inside its box; later tiles paint over earlier ones.
const TILES: [string, [number, number, number, number]][] = [
  ["easthls", [100.3, 12.55, 101.75, 14.5]],
  ["nnyhls", [101.0, 13.95, 101.75, 14.5]],
  ["coasthls", [100.8, 12.55, 101.45, 13.45]],
  ["rayhls", [100.75, 12.2, 101.8, 12.75]],
  ["isle", [100.46, 14.24, 100.68, 14.48]],
];
const coverage = (cam: Cam, w: number, h: number, [x0, y0, x1, y1]: [number, number, number, number]) => {
  const p = projectionFor(cam, w, h, CLEAR.focusY);
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

// Legs of the march that stay on the map once their chapter is over.
const TRAIL: [[number, number][], number][] = [
  [ROUTE.night, B.chase.start],
  [ROUTE.day4, B.elephant.start],
  [ROUTE.nny, B.crossing.start],
  [ROUTE.prachin, B.coast.start],
  [ROUTE.coast, B.route.start],
  [ROUTE.south, B.prince.start],
];

export const Ep06 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const authored = E6_CHAPTERS.flatMap((c) => c.cams(width, height)).sort((a, b) => a.frame - b.frame);
  const keys = holdAndMove(authored, 30);
  const base = camAt(keys, frame);
  const cam = { ...base, scale: base.scale * CLEAR.camScale };
  const hide = panelHideAt(keys, frame);
  // Tile opacity averaged over the last 10 frames: a fast zoom otherwise drops it in 2–3 frames (flicker).
  const tileOpacity = (bb: [number, number, number, number]) => {
    let sum = 0;
    for (let d = 0; d < 10; d++) {
      const c = camAt(keys, Math.max(0, frame - d));
      sum += Math.min(1, Math.max(0, (coverage({ ...c, scale: c.scale * CLEAR.camScale }, width, height, bb) - 0.75) * 5));
    }
    return sum / 10;
  };
  const ch = E6_CHAPTERS.find((c) => frame >= c.from && frame < c.to) ?? E6_CHAPTERS[E6_CHAPTERS.length - 1];
  const years = E6_CHAPTERS.flatMap((c) => c.years).sort((a, b) => a[0] - b[0]);
  const year = [...years].reverse().find(([f]) => frame >= f)?.[1] ?? years[0][1];
  const near = (c: Chapter6) => frame >= c.from - 30 && frame < c.to + 30;
  return (
    <LayoutCtx.Provider value={{ compact: true, panelScale: CLEAR.panelScale, panelHide: hide }}>
      <AbsoluteFill style={{ background: "#02060d" }}>
        {BEATS.map((b) => (
          <Sequence key={b.id} from={b.start} durationInFrames={b.len + 16} layout="none">
            <Html5Audio src={staticFile(b.file)} />
          </Sequence>
        ))}
        {E6_CHAPTERS.flatMap((c) => c.sfx.map(([f, src, v], i) => <Sfx key={`${c.name}${i}`} src={src} at={Math.max(0, f)} volume={v * UI_GAIN} />))}
        {E6_CHAPTERS.map((c) => (c.Audio ? <c.Audio key={`a${c.name}`} /> : null))}
        <MapFrame cam={cam} focusY={CLEAR.focusY}>
          {(() => {
            // The Nakhon Nayok patch (cloud-free day) replaces a cloud in easthls: it always shows with easthls.
            const op = Object.fromEntries(TILES.map(([name, bb]) => [name, tileOpacity(bb)]));
            op.nnyhls = Math.max(op.nnyhls, op.easthls);
            // The Rayong sea tile replaces blocky Blue Marble water whenever the coast tiles show.
            op.rayhls = Math.max(op.rayhls, op.coasthls, op.easthls);
            return <SeaLift><Raster layers={[{ name: "world" }, { name: "sea" }, ...TILES.map(([name]) => ({ name, opacity: op[name] }))]} /></SeaLift>;
          })()}
          <Rivers />
          <Trail legs={TRAIL} />
          {E6_CHAPTERS.filter(near).map((c) => <c.Map key={c.name} />)}
          {E6_CHAPTERS.filter(near).map((c) => <c.Panels key={`p${c.name}`} />)}
        </MapFrame>
        {frame >= BEATS[1].start - 4 && <TopBar chapter={ch.name} year={year} />}
        {E6_CHAPTERS.map((c) => <HeadCard key={c.name} heads={c.heads} from={c.heads[0]?.f ?? c.from} to={c.to} />)}
        {E6_CHAPTERS.filter(near).map((c) => (c.Screen ? <c.Screen key={`s${c.name}`} /> : null))}
        {BEATS.filter((b) => b.id !== "hook").map((b) => (
          <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP} />
        ))}
      </AbsoluteFill>
    </LayoutCtx.Provider>
  );
};
