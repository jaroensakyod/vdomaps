import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, projectionFor, type Cam } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { MapFrame } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { Sfx } from "../../../components/Sound";
import { CAPTION_TOP, font, HeadCard, LAYOUT, NightGrade, Rivers, TopBar } from "../news/kit";
import type { ChapterN } from "./beats";
import { BigRivers } from "./map";
import { PL } from "./places";

// The Naresuan episodes share one frame: imagery (Blue Marble → HLS close-ups), rivers, chapters' map layers and
// panels, top bar, head cards and word-timed captions. Same layout as episode 4.
const TILES: [string, [number, number, number, number]][] = [
  ["plainhls", [100.0, 13.6, 101.4, 15.3]],
  ["suphanhls", [99.5, 14.2, 100.7, 15.0]],
  ["plokhls", [99.9, 16.5, 100.6, 17.2]],
];
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

type B = { id: string; start: number; len: number; end: number; file: string; text: string; spoken?: string; words?: unknown };
export const NrsEpisode = ({ chapters, beats, uiGain = 0.7 }: { chapters: ChapterN[]; beats: B[]; uiGain?: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = camAt(chapters.flatMap((c) => c.cams(width, height)).sort((a, b) => a.frame - b.frame), frame);
  const ch = chapters.find((c) => frame >= c.from && frame < c.to) ?? chapters[chapters.length - 1];
  const years = chapters.flatMap((c) => c.years).sort((a, b) => a[0] - b[0]);
  const year = [...years].reverse().find(([f]) => frame >= f)?.[1] ?? years[0][1];
  const night = Math.max(0, ...chapters.map((c) => (c.night && frame >= c.from && frame < c.to + 30 ? c.night(frame) : 0)));
  const fire = (ch as ChapterN & { fireAt?: [number, number] }).fireAt ?? PL.ayut;
  const near = (c: ChapterN) => frame >= c.from - 30 && frame < c.to + 30;
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      {beats.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      {chapters.flatMap((c) => c.sfx.map(([f, src, v], i) => <Sfx key={`${c.name}${i}`} src={src} at={Math.max(0, f)} volume={v * uiGain} />))}
      {chapters.map((c) => (c.Audio ? <c.Audio key={`a${c.name}`} /> : null))}
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "sea" }, ...TILES.map(([name, bb]) => ({ name, opacity: Math.min(1, Math.max(0, (coverage(cam, width, height, bb) - 0.8) * 5)) }))]} />
        <BigRivers />
        <Rivers />
        <NightGrade k={night} fireAt={fire} />
        {chapters.filter(near).map((c) => <c.Map key={c.name} />)}
        {chapters.filter(near).map((c) => <c.Panels key={`p${c.name}`} />)}
      </MapFrame>
      {frame >= beats[1].start - 4 && <TopBar chapter={ch.name} year={year} />}
      {chapters.map((c) => <HeadCard key={c.name} heads={c.heads} from={c.heads[0]?.f ?? c.from} to={c.to} />)}
      {chapters.filter(near).map((c) => (c.Screen ? <c.Screen key={`s${c.name}`} /> : null))}
      {beats.filter((b) => b.id !== "hook").map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words as never} start={b.start} len={b.len} font={font} top={CAPTION_TOP} />
      ))}
    </AbsoluteFill>
  );
};
