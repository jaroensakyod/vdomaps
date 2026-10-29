import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, holdAndMove, panelHideAt, projectionFor, type Cam } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { MapFrame } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { Sfx } from "../../../components/Sound";
import { CAPTION_TOP, CLEAR, font, HeadCard, LayoutCtx, Rivers, SeaLift, TopBar } from "../news/kit";
import { B, BEATS, END, wp, type ChapterM } from "./beatsKit";
import { M_CHAPTERS } from "./chapters";
import { BaziCard, type CardPos } from "./bazi";
import { UI_GAIN } from "./mix";

// ประวัติศาสตร์บนแผนที่ × Mumate ตอน 1: ดวงพระเจ้าตาก — news look, clear layout, illustration style v2, recorded
// sound, SeaLift. Built like episodes 6–9; the BaZi card below runs across all chapters.
export const MUMATE01_FRAMES = END;

const TILES: [string, [number, number, number, number]][] = [
  ["westhls", [99.3, 13.85, 100.65, 14.8]],
  ["plainhls", [100.0, 13.6, 101.4, 15.3]],
  ["easthls", [100.3, 12.55, 101.75, 14.5]],
  ["coasthls", [100.8, 12.55, 101.45, 13.45]],
  ["rayhls", [100.75, 12.2, 101.8, 12.75]],
  ["chanhls", [101.97, 12.0, 102.75, 12.95]],
  ["northhls", [99.9, 15.3, 100.7, 17.1]],
  ["north2hls", [99.9, 17.0, 100.7, 17.95]],
  ["isle", [100.46, 14.24, 100.68, 14.48]],
  ["bkkhls", [100.4, 13.66, 100.58, 13.82]],
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

// Where the chart card sits, beat by beat (big = centre of the map area, corner = small top right).
const CARD: [number, CardPos][] = [
  [B.twolayer.start + 10, "big"], [B.honest.start, "off"],
  [B.nohour.start, "big"], [B.earth.start, "corner"], [B.tiger.start, "big"], [B.summary.start + 20, "corner"],
  [B.breakout.start, "off"], [B.pig.start, "big"], [B.officer.start, "corner"], [B.pots.start, "off"],
  [B.luck37.start, "corner"], [B.nonstop.start, "off"],
  [B.luck47.start, "corner"], [B.thaisource.start, "off"], [B["2325"].start, "corner"], [B.revolt.start, "off"],
  [B.limits.start, "big"], [B.lesson.start, "off"],
];
const FILL = [B.nohour.start, wp("chart", "โลหะเสือ", 0.85), wp("chart", "ดินมังกร", 0.6), wp("chart", "ไม้เสือ", 0.35)];
const GLOW: [number, number, string][] = [
  [B.daymaster.start, B.earth.start, "1s"],
  [wp("tiger", "เสือ", 0.15), B.summary.start, "1b"],
  [wp("tiger", "เสือ", 0.15), B.summary.start, "3b"],
  [B.pig.start + 10, B.officer.start, "1b"],
  [B.pig.start + 10, B.officer.start, "3b"],
  [B.limits.start + 10, B.lesson.start, "0s"],
];

export const Mumate01 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const authored = M_CHAPTERS.flatMap((c) => c.cams(width, height)).sort((a, b) => a.frame - b.frame);
  const keys = holdAndMove(authored, 30);
  const base = camAt(keys, frame);
  const cam = { ...base, scale: base.scale * CLEAR.camScale };
  const hide = panelHideAt(keys, frame);
  const tileOpacity = (bb: [number, number, number, number]) => {
    let sum = 0;
    for (let d = 0; d < 10; d++) {
      const c = camAt(keys, Math.max(0, frame - d));
      sum += Math.min(1, Math.max(0, (coverage({ ...c, scale: c.scale * CLEAR.camScale }, width, height, bb) - 0.75) * 5));
    }
    return sum / 10;
  };
  const op = Object.fromEntries(TILES.map(([name, bb]) => [name, tileOpacity(bb)]));
  const plain = tileOpacity([100.0, 13.3, 101.4, 15.3]);
  op.plainhls = Math.max(op.plainhls, plain);
  const north = tileOpacity([99.7, 15.2, 100.9, 18.0]);
  op.northhls = Math.max(op.northhls, north);
  op.north2hls = Math.max(op.north2hls, north);
  const ch = M_CHAPTERS.find((c) => frame >= c.from && frame < c.to) ?? M_CHAPTERS[M_CHAPTERS.length - 1];
  const years = M_CHAPTERS.flatMap((c) => c.years).sort((a, b) => a[0] - b[0]);
  const year = [...years].reverse().find(([f]) => frame >= f)?.[1] ?? years[0][1];
  const near = (c: ChapterM) => frame >= c.from - 30 && frame < c.to + 30;
  return (
    <LayoutCtx.Provider value={{ compact: true, panelScale: CLEAR.panelScale, panelHide: hide }}>
      <AbsoluteFill style={{ background: "#02060d" }}>
        {BEATS.map((b) => (
          <Sequence key={b.id} from={b.start} durationInFrames={b.len + 16} layout="none">
            <Html5Audio src={staticFile(b.file)} />
          </Sequence>
        ))}
        {M_CHAPTERS.flatMap((c) => c.sfx.map(([f, src, v], i) => <Sfx key={`${c.name}${i}`} src={src} at={Math.max(0, f)} volume={v * UI_GAIN} />))}
        {M_CHAPTERS.map((c) => (c.Audio ? <c.Audio key={`a${c.name}`} /> : null))}
        <MapFrame cam={cam} focusY={CLEAR.focusY}>
          <SeaLift><Raster layers={[{ name: "world" }, { name: "sea2" }, ...TILES.map(([name]) => ({ name, opacity: op[name] }))]} /></SeaLift>
          <Rivers />
          {M_CHAPTERS.filter(near).map((c) => <c.Map key={c.name} />)}
          {M_CHAPTERS.filter(near).map((c) => <c.Panels key={`p${c.name}`} />)}
        </MapFrame>
        {frame >= BEATS[1].start - 4 && frame < B.cta.start && <TopBar chapter={ch.name} year={year} />}
        {M_CHAPTERS.map((c) => (c.heads.length ? <HeadCard key={c.name} heads={c.heads} from={c.heads[0]?.f ?? c.from} to={c.to} /> : null))}
        <BaziCard at={CARD} fill={FILL} glow={GLOW} />
        {M_CHAPTERS.filter(near).map((c) => (c.Screen ? <c.Screen key={`s${c.name}`} /> : null))}
        {BEATS.filter((b) => b.id !== "hook").map((b) => (
          <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP} />
        ))}
      </AbsoluteFill>
    </LayoutCtx.Provider>
  );
};
