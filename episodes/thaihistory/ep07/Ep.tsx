import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, holdAndMove, panelHideAt, projectionFor, type Cam } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { MapFrame } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { Sfx } from "../../../components/Sound";
import { CAPTION_TOP, CLEAR, font, HeadCard, LayoutCtx, Rivers, SeaLift, TopBar } from "../news/kit";
import { BEATS, type Chapter7 } from "./beatsKit";
import { E7_END, e7c0, e7c1, e7c2, e7c3, e7c4, e7c5, e7c6 } from "./chapters";
import { ChanRivers } from "./mapkit";
import { UI_GAIN } from "./mix";

// ประวัติศาสตร์บนแผนที่ ตอน 7: ทุบหม้อข้าว ตีจันทบุรี (ก.พ.–ต.ค. 2310) — news look, clear layout, illustration
// style v2, recorded sound. Same no-stutter / no-flicker build as episode 6.
export const E7_CHAPTERS: Chapter7[] = [e7c0, e7c1, e7c2, e7c3, e7c4, e7c5, e7c6];
export const E7_FRAMES = E7_END;

// Close-up imagery fades in only when the camera is well inside its box; later tiles paint over earlier ones.
const TILES: [string, [number, number, number, number]][] = [
  ["easthls", [100.3, 12.55, 101.75, 14.5]],
  ["coasthls", [100.8, 12.55, 101.45, 13.45]],
  ["rayhls", [100.75, 12.2, 101.8, 12.75]],
  ["klaenghls", [101.4, 12.45, 102.0, 12.95]],
  ["chanhls", [101.97, 12.0, 102.75, 12.95]],
  ["chancity", [101.98, 12.5, 102.24, 12.76]],
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

export const Ep07 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const authored = E7_CHAPTERS.flatMap((c) => c.cams(width, height)).sort((a, b) => a.frame - b.frame);
  const keys = holdAndMove(authored, 30);
  const base = camAt(keys, frame);
  const cam = { ...base, scale: base.scale * CLEAR.camScale };
  const hide = panelHideAt(keys, frame);
  // Tile opacity averaged over the last 10 frames (no flicker on fast zooms). The east-coast tiles sit side by side,
  // so each shows once the camera is mostly over the coast tiles as a whole.
  const tileOpacity = (bb: [number, number, number, number]) => {
    let sum = 0;
    for (let d = 0; d < 10; d++) {
      const c = camAt(keys, Math.max(0, frame - d));
      sum += Math.min(1, Math.max(0, (coverage({ ...c, scale: c.scale * CLEAR.camScale }, width, height, bb) - 0.75) * 5));
    }
    return sum / 10;
  };
  const op = Object.fromEntries(TILES.map(([name, bb]) => [name, tileOpacity(bb)]));
  const coast = tileOpacity([100.75, 12.0, 102.75, 12.95]);
  for (const n of ["easthls", "rayhls", "klaenghls", "chanhls"]) op[n] = Math.max(op[n], coast);
  const ch = E7_CHAPTERS.find((c) => frame >= c.from && frame < c.to) ?? E7_CHAPTERS[E7_CHAPTERS.length - 1];
  const years = E7_CHAPTERS.flatMap((c) => c.years).sort((a, b) => a[0] - b[0]);
  const year = [...years].reverse().find(([f]) => frame >= f)?.[1] ?? years[0][1];
  const near = (c: Chapter7) => frame >= c.from - 30 && frame < c.to + 30;
  return (
    <LayoutCtx.Provider value={{ compact: true, panelScale: CLEAR.panelScale, panelHide: hide }}>
      <AbsoluteFill style={{ background: "#02060d" }}>
        {BEATS.map((b) => (
          <Sequence key={b.id} from={b.start} durationInFrames={b.len + 16} layout="none">
            <Html5Audio src={staticFile(b.file)} />
          </Sequence>
        ))}
        {E7_CHAPTERS.flatMap((c) => c.sfx.map(([f, src, v], i) => <Sfx key={`${c.name}${i}`} src={src} at={Math.max(0, f)} volume={v * UI_GAIN} />))}
        {E7_CHAPTERS.map((c) => (c.Audio ? <c.Audio key={`a${c.name}`} /> : null))}
        <MapFrame cam={cam} focusY={CLEAR.focusY}>
          <SeaLift><Raster layers={[{ name: "world" }, { name: "sea2" }, ...TILES.map(([name]) => ({ name, opacity: op[name] }))]} /></SeaLift>
          <Rivers />
          <ChanRivers />
          {E7_CHAPTERS.filter(near).map((c) => <c.Map key={c.name} />)}
          {E7_CHAPTERS.filter(near).map((c) => <c.Panels key={`p${c.name}`} />)}
        </MapFrame>
        {frame >= BEATS[1].start - 4 && <TopBar chapter={ch.name} year={year} />}
        {E7_CHAPTERS.map((c) => <HeadCard key={c.name} heads={c.heads} from={c.heads[0]?.f ?? c.from} to={c.to} />)}
        {E7_CHAPTERS.filter(near).map((c) => (c.Screen ? <c.Screen key={`s${c.name}`} /> : null))}
        {BEATS.filter((b) => b.id !== "hook").map((b) => (
          <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP} />
        ))}
      </AbsoluteFill>
    </LayoutCtx.Provider>
  );
};
