import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, projectionFor, type Cam } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { MapFrame } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { Sfx } from "../../../components/Sound";
import { totalFrames } from "../../../components/subs.mjs";
import { CAPTION_TOP, font, HeadCard, Rivers, TopBar, type Chapter } from "../kit/news";
import { ch0 } from "./ch0";
import { ch1 } from "./ch1";
import { ch2 } from "./ch2";
import { ch3 } from "./ch3";
import { ch4 } from "./ch4";
import { ch5 } from "./ch5";
import { ch6 } from "./ch6";
import { ch7 } from "./ch7";
import { ch8 } from "./ch8";
import { Campaign } from "./campaign";
import { BEATS, LAYOUT } from "./time";

// Napoleon invades Russia, 1812 · news look, 9:16. One composition; each chapter owns its beats.
export const CHAPTERS: Chapter[] = [ch0, ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8];
export const WH01_FRAMES = Math.min(totalFrames(BEATS, LAYOUT), CHAPTERS[CHAPTERS.length - 1].to + 30);

// A sharper tile only shows when it fills the whole screen (else its edge shows against the wider image).
const TILES: [string, [number, number, number, number]][] = [["rus", [20, 51, 40, 58]]];
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

export const Wh01 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const keys = CHAPTERS.flatMap((c) => c.cams(width, height)).sort((a, b) => a.frame - b.frame);
  const cam = camAt(keys, frame);
  const ch = CHAPTERS.find((c) => frame >= c.from && frame < c.to) ?? CHAPTERS[CHAPTERS.length - 1];
  const years = CHAPTERS.flatMap((c) => c.years).sort((a, b) => a[0] - b[0]);
  const year = [...years].reverse().find(([f]) => frame >= f)?.[1] ?? years[0][1];
  const near = (c: Chapter) => frame >= c.from - 30 && frame < c.to + 30;
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      {CHAPTERS.flatMap((c) => c.sfx.map(([f, src, v], i) => <Sfx key={`${c.name}${i}`} src={src} at={Math.max(0, f)} volume={v} />))}
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "europe" }, ...TILES.map(([name, bb]) => ({ name, opacity: Math.min(1, Math.max(0, (coverage(cam, width, height, bb) - 0.8) * 5)) }))]} />
        {frame >= ch1.from && <Rivers />}
        <Campaign />
        {CHAPTERS.filter(near).map((c) => <c.Map key={`m${c.from}`} />)}
        {CHAPTERS.filter(near).map((c) => <c.Panels key={`p${c.from}`} />)}
      </MapFrame>
      <TopBar chapter={ch.name} year={year} />
      {CHAPTERS.map((c) => <HeadCard key={`h${c.from}`} heads={c.heads} from={c.heads[0]?.f ?? c.from} to={c.to} />)}
      {CHAPTERS.filter(near).map((c) => (c.Screen ? <c.Screen key={`s${c.from}`} /> : null))}
      {BEATS.map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP} />
      ))}
    </AbsoluteFill>
  );
};
