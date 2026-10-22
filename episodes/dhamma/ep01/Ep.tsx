import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, projectionFor, type Cam } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { MapFrame } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { Sfx } from "../../../components/Sound";
import { totalFrames } from "../../../components/subs.mjs";
import { CAPTION_TOP, font, HeadCard, LAYOUT, type Chapter } from "../../thaihistory/news/kit";
import { DhammaBar, DhammaRivers, Night } from "../kit/Mural";
import { BEATS } from "./beatsKit";
import { d1ch0 } from "./ch0";
import { d1c1, d1c2, d1c3 } from "./chA";
import { d1c4, d1c5, d1c6 } from "./chB";
import { d1c7, d1c8 } from "./chC";

// ตามรอยธรรม ตอน 1: ประสูติถึงตรัสรู้ (news map + gold-on-lacquer icon panels, house standard; AI art only as card portraits). Chapter.years carries the
// top-bar time chip text; Chapter.night the night veil.
export const D1_CHAPTERS: Chapter[] = [d1ch0, d1c1, d1c2, d1c3, d1c4, d1c5, d1c6, d1c7, d1c8];
export const D1_FRAMES = Math.min(totalFrames(BEATS, LAYOUT), D1_CHAPTERS[D1_CHAPTERS.length - 1].to + 30);

// HLS close-ups fade in once they fill most of the frame.
const TILES: [string, [number, number, number, number]][] = [["lumbini", [82.95, 27.15, 83.55, 27.85]], ["bodhgaya", [84.78, 24.45, 85.22, 24.98]]];
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

export const Dhamma01 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = camAt(D1_CHAPTERS.flatMap((c) => c.cams(width, height)).sort((a, b) => a.frame - b.frame), frame);
  const ch = D1_CHAPTERS.find((c) => frame >= c.from && frame < c.to) ?? D1_CHAPTERS[D1_CHAPTERS.length - 1];
  const years = D1_CHAPTERS.flatMap((c) => c.years).sort((a, b) => a[0] - b[0]);
  const when = [...years].reverse().find(([f]) => frame >= f)?.[1] ?? years[0][1];
  const night = Math.max(0, ...D1_CHAPTERS.map((c) => (c.night && frame >= c.from - 30 && frame < c.to + 30 ? c.night(frame) : 0)));
  const near = (c: Chapter) => frame >= c.from - 30 && frame < c.to + 30;
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      {D1_CHAPTERS.flatMap((c) => c.sfx.map(([f, src, v], i) => <Sfx key={`${c.name}${i}`} src={src} at={Math.max(0, f)} volume={v} />))}
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "ganga" }, ...TILES.map(([name, bb]) => ({ name, opacity: Math.min(1, Math.max(0, (coverage(cam, width, height, bb) - 0.8) * 5)) }))]} />
        <DhammaRivers />
        <Night k={night} />
        {D1_CHAPTERS.filter(near).map((c) => <c.Map key={c.name} />)}
        {D1_CHAPTERS.filter(near).map((c) => <c.Panels key={`p${c.name}`} />)}
      </MapFrame>
      {frame >= BEATS[1].start - 4 && <DhammaBar chapter={ch.name} when={when} />}
      {D1_CHAPTERS.map((c) => <HeadCard key={c.name} heads={c.heads} from={c.heads[0]?.f ?? c.from} to={c.to} />)}
      {D1_CHAPTERS.filter(near).map((c) => (c.Screen ? <c.Screen key={`s${c.name}`} /> : null))}
      {BEATS.filter((b) => b.id !== "hook").map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP + 0.03} />
      ))}
    </AbsoluteFill>
  );
};
