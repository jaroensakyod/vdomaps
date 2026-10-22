import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, projectionFor, type Cam } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { MapFrame } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { Sfx } from "../../../components/Sound";
import { totalFrames } from "../../../components/subs.mjs";
import { CAPTION_TOP, font, HeadCard, LAYOUT, NightGrade, Rivers, TopBar, type Chapter } from "../news/kit";
import { BEATS } from "./beatsKit";
import { e2ch0 } from "./ch0";
import { e2c1, e2c2, e2c3 } from "./chA";
import { e2c4, e2c5, e2c6 } from "./chB";
import { e2c7, e2c8, e2c9 } from "./chC";

// ประวัติศาสตร์บนแผนที่ ตอน 2: พระเจ้าตากรวมแผ่นดิน (news look, house standard). Same frame as episode 1.
export const E2_CHAPTERS: Chapter[] = [e2ch0, e2c1, e2c2, e2c3, e2c4, e2c5, e2c6, e2c7, e2c8, e2c9];
export const E2_FRAMES = Math.min(totalFrames(BEATS, LAYOUT), E2_CHAPTERS[E2_CHAPTERS.length - 1].to + 30);

const TILES: [string, [number, number, number, number]][] = [["banghls", [100.1, 14.4, 101.0, 15.6]], ["plainhls", [100.0, 13.6, 101.4, 15.3]], ["isle", [100.46, 14.24, 100.68, 14.48]]];
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

export const Ep02 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = camAt(E2_CHAPTERS.flatMap((c) => c.cams(width, height)).sort((a, b) => a.frame - b.frame), frame);
  const ch = E2_CHAPTERS.find((c) => frame >= c.from && frame < c.to) ?? E2_CHAPTERS[E2_CHAPTERS.length - 1];
  const years = E2_CHAPTERS.flatMap((c) => c.years).sort((a, b) => a[0] - b[0]);
  const year = [...years].reverse().find(([f]) => frame >= f)?.[1] ?? years[0][1];
  const night = Math.max(0, ...E2_CHAPTERS.map((c) => (c.night && frame >= c.from && frame < c.to + 30 ? c.night(frame) : 0)));
  const near = (c: Chapter) => frame >= c.from - 30 && frame < c.to + 30;
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      {E2_CHAPTERS.flatMap((c) => c.sfx.map(([f, src, v], i) => <Sfx key={`${c.name}${i}`} src={src} at={Math.max(0, f)} volume={v} />))}
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "sea" }, ...TILES.map(([name, bb]) => ({ name, opacity: Math.min(1, Math.max(0, (coverage(cam, width, height, bb) - 0.8) * 5)) }))]} />
        <Rivers />
        <NightGrade k={night} fireAt={[100.566, 14.357]} />
        {E2_CHAPTERS.filter(near).map((c) => <c.Map key={c.name} />)}
        {E2_CHAPTERS.filter(near).map((c) => <c.Panels key={`p${c.name}`} />)}
      </MapFrame>
      {frame >= BEATS[1].start - 4 && <TopBar chapter={ch.name} year={year} />}
      {E2_CHAPTERS.map((c) => <HeadCard key={c.name} heads={c.heads} from={c.heads[0]?.f ?? c.from} to={c.to} />)}
      {E2_CHAPTERS.filter(near).map((c) => (c.Screen ? <c.Screen key={`s${c.name}`} /> : null))}
      {BEATS.filter((b) => b.id !== "hook").map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP} />
      ))}
    </AbsoluteFill>
  );
};
