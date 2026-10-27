import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, holdAndMove, panelHideAt } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { MapFrame } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { Sfx } from "../../../components/Sound";
import { CAPTION_TOP, CLEAR, font, HeadCard, LayoutCtx, TopBar } from "../news/kit";
import { BEATS, type Chapter10 } from "./beatsKit";
import { E10_END, e10c0 } from "./chapters";
import { C1Audio, e10c1, e10c2, e10c3, e10c4, e10c5, e10c6, e10c7, e10c8 } from "./chapters2";
import { UI_GAIN } from "./mix";

// ประวัติศาสตร์บนแผนที่ ตอน 10: ยุทธหัตถีเกิดที่ไหนกันแน่ — news look, clear layout, illustration style v2,
// recorded sound. The base map is Bellin / van der Schley 1770 (a real scan, public domain), not satellite. Same no-stutter / no-flicker build as episodes 6–9.
export const E10_CHAPTERS: Chapter10[] = [e10c0, e10c1, e10c2, e10c3, e10c4, e10c5, e10c6, e10c7, e10c8];
export const E10_FRAMES = E10_END;

// Soft vignette over the old map so pins and captions read; the paper stays visible.
const OldMapTint = () => {
  const { width, height } = useVideoConfig();
  return (
    <g>
      <defs>
        <radialGradient id="e10vig" cx="50%" cy="45%" r="75%">
          <stop offset="0.55" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#1a1006" stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill="url(#e10vig)" />
    </g>
  );
};

export const Ep10 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const authored = E10_CHAPTERS.flatMap((c) => c.cams(width, height)).sort((a, b) => a.frame - b.frame);
  const keys = holdAndMove(authored, 30);
  const base = camAt(keys, frame);
  const cam = { ...base, scale: base.scale * CLEAR.camScale };
  const hide = panelHideAt(keys, frame);
  const ch = E10_CHAPTERS.find((c) => frame >= c.from && frame < c.to) ?? E10_CHAPTERS[E10_CHAPTERS.length - 1];
  const years = E10_CHAPTERS.flatMap((c) => c.years).sort((a, b) => a[0] - b[0]);
  const year = [...years].reverse().find(([f]) => frame >= f)?.[1] ?? years[0][1];
  const near = (c: Chapter10) => frame >= c.from - 30 && frame < c.to + 30;
  return (
    <LayoutCtx.Provider value={{ compact: true, panelScale: CLEAR.panelScale, panelHide: hide }}>
      <AbsoluteFill style={{ background: "#d9c9a0" }}>
        {BEATS.filter((b) => b.file).map((b) => (
          <Sequence key={b.id} from={b.start} durationInFrames={b.len + 16} layout="none">
            <Html5Audio src={staticFile(b.file)} />
          </Sequence>
        ))}
        {E10_CHAPTERS.flatMap((c) => c.sfx.map(([f, src, v], i) => <Sfx key={`${c.name}${i}`} src={src} at={Math.max(0, f)} volume={v * UI_GAIN} />))}
        {E10_CHAPTERS.map((c) => (c.Audio ? <c.Audio key={`a${c.name}`} /> : null))}
        <C1Audio />
        <MapFrame cam={cam} focusY={CLEAR.focusY}>
          <Raster layers={[{ name: "bellin1770" }]} />
          <OldMapTint />
          {E10_CHAPTERS.filter(near).map((c) => <c.Map key={c.name} />)}
          {E10_CHAPTERS.filter(near).map((c) => <c.Panels key={`p${c.name}`} />)}
        </MapFrame>
        {E10_CHAPTERS.filter(near).map((c) => (c.Full ? <c.Full key={`f${c.name}`} /> : null))}
        {frame >= BEATS[1].start - 4 && <TopBar chapter={ch.name} year={year} />}
        {E10_CHAPTERS.map((c) => <HeadCard key={c.name} heads={c.heads} from={c.heads[0]?.f ?? c.from} to={c.to} />)}
        {E10_CHAPTERS.filter(near).map((c) => (c.Screen ? <c.Screen key={`s${c.name}`} /> : null))}
        {BEATS.filter((b) => b.id !== "hook").map((b) => (
          <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP} />
        ))}
      </AbsoluteFill>
    </LayoutCtx.Provider>
  );
};
