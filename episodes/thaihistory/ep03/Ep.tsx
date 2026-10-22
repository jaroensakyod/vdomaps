import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, projectionFor, type Cam } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { MapFrame } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { Sfx } from "../../../components/Sound";
import { totalFrames } from "../../../components/subs.mjs";
import { CAPTION_TOP, font, HeadCard, LAYOUT, NightGrade, Rivers, TopBar, type Chapter } from "../news/kit";
import { BEATS } from "./beatsKit";
import { e3ch0 } from "./ch0";
import { e3c1, e3c2 } from "./chA";
import { e3c3, e3c4, e3c5 } from "./chB";
import { e3c6, e3c7, e3c8, e3c9 } from "./chC";

// ประวัติศาสตร์บนแผนที่ ตอน 3: อะแซหวุ่นกี้ตีพิษณุโลก (news look, house standard). Same frame as episodes 1–2.
export const E3_CHAPTERS: Chapter[] = [e3ch0, e3c1, e3c2, e3c3, e3c4, e3c5, e3c6, e3c7, e3c8, e3c9];
export const E3_FRAMES = Math.min(totalFrames(BEATS, LAYOUT), E3_CHAPTERS[E3_CHAPTERS.length - 1].to + 30);

const TILES: [string, [number, number, number, number]][] = [["northhls", [98.9, 15.9, 101.3, 17.6]], ["plkhls", [99.85, 16.45, 100.7, 17.15]]];
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

export const Ep03 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = camAt(E3_CHAPTERS.flatMap((c) => c.cams(width, height)).sort((a, b) => a.frame - b.frame), frame);
  const ch = E3_CHAPTERS.find((c) => frame >= c.from && frame < c.to) ?? E3_CHAPTERS[E3_CHAPTERS.length - 1];
  const years = E3_CHAPTERS.flatMap((c) => c.years).sort((a, b) => a[0] - b[0]);
  const year = [...years].reverse().find(([f]) => frame >= f)?.[1] ?? years[0][1];
  const night = Math.max(0, ...E3_CHAPTERS.map((c) => (c.night && frame >= c.from && frame < c.to + 30 ? c.night(frame) : 0)));
  const near = (c: Chapter) => frame >= c.from - 30 && frame < c.to + 30;
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      {E3_CHAPTERS.flatMap((c) => c.sfx.map(([f, src, v], i) => <Sfx key={`${c.name}${i}`} src={src} at={Math.max(0, f)} volume={v} />))}
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "sea" }, ...TILES.map(([name, bb]) => ({ name, opacity: Math.min(1, Math.max(0, (coverage(cam, width, height, bb) - 0.8) * 5)) }))]} />
        <Rivers />
        <NightGrade k={night} fireAt={[100.566, 14.357]} />
        {E3_CHAPTERS.filter(near).map((c) => <c.Map key={c.name} />)}
        {E3_CHAPTERS.filter(near).map((c) => <c.Panels key={`p${c.name}`} />)}
      </MapFrame>
      {frame >= BEATS[1].start - 4 && <TopBar chapter={ch.name} year={year} />}
      {E3_CHAPTERS.map((c) => <HeadCard key={c.name} heads={c.heads} from={c.heads[0]?.f ?? c.from} to={c.to} />)}
      {E3_CHAPTERS.filter(near).map((c) => (c.Screen ? <c.Screen key={`s${c.name}`} /> : null))}
      {BEATS.filter((b) => b.id !== "hook").map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP} />
      ))}
    </AbsoluteFill>
  );
};
