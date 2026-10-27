import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { MapFrame } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { Sfx } from "../../../components/Sound";
import { totalFrames } from "../../../components/subs.mjs";
import { CAPTION_TOP, font, HeadCard } from "../../worldhistory/kit/news";
import { SplitIn, SplitOut, WhatIfBar, WhatIfGrade } from "../kit/WhatIf";
import type { Chapter } from "./chapter";
import { ch0 } from "./ch0";
import { ch1 } from "./ch1";
import { ch2 } from "./ch2";
import { ch3 } from "./ch3";
import { ch4 } from "./ch4";
import { ch5 } from "./ch5";
import { ch6 } from "./ch6";
import { ch7 } from "./ch7";
import { ch8 } from "./ch8";
import { BEATS, isWhatIf, LAYOUT, SPLIT_LEN, whatIfK, WORLD } from "./time";

// What if America ep 1: "What if Russia never sold Alaska?" · news look + what-if grade, 9:16.
// One composition; each chapter owns its beats, camera keys, overlays, panels, cards and sounds.
export const CHAPTERS: Chapter[] = [ch0, ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8];
export const WI01_FRAMES = Math.min(totalFrames(BEATS, LAYOUT), CHAPTERS[CHAPTERS.length - 1].to + 30);

// Regional imagery over the world mosaic; each layer only draws where its bbox is.
const RASTERS = ["world", "alaska", "chukotka", "bering", "kamchatka", "norcal", "cuba", "vlad", "blacksea"].map((name) => ({ name }));

// The grade layer with the channel transitions at split edges.
const Grade = () => {
  const frame = useCurrentFrame();
  const k = whatIfK(frame);
  return (
    <g>
      {k > 0 && <WhatIfGrade k={k} />}
      {WORLD.filter((w) => w.in === "split").map((w) => (
        <SplitIn key={`i${w.from}`} at={w.from} len={SPLIT_LEN}>
          <WhatIfGrade k={1} />
        </SplitIn>
      ))}
      {WORLD.filter((w) => w.out === "split").map((w) =>
        frame >= w.to && frame < w.to + SPLIT_LEN ? (
          <SplitOut key={`o${w.to}`} at={w.to} len={SPLIT_LEN}>
            <WhatIfGrade k={1} />
          </SplitOut>
        ) : null,
      )}
    </g>
  );
};

export const WhatIf01 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const keys = CHAPTERS.flatMap((c) => c.cams(width, height)).sort((a, b) => a.frame - b.frame);
  const cam = camAt(keys, frame);
  const ch = CHAPTERS.find((c) => frame >= c.from && frame < c.to) ?? CHAPTERS[CHAPTERS.length - 1];
  const years = CHAPTERS.flatMap((c) => c.years).sort((a, b) => a[0] - b[0]);
  const year = [...years].reverse().find(([f]) => frame >= f)?.[1] ?? years[0]?.[1] ?? "";
  const near = (c: Chapter) => frame >= c.from - 30 && frame < c.to + 30;
  const wi = isWhatIf(frame);
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      {CHAPTERS.flatMap((c) => c.sfx.map(([f, src, v], i) => <Sfx key={`${c.name}${c.from}${i}`} src={src} at={Math.max(0, f)} volume={v} />))}
      {CHAPTERS.map((c) => (c.Sound ? <c.Sound key={`snd${c.from}`} /> : null))}
      <MapFrame cam={cam}>
        <Raster layers={RASTERS} />
        {CHAPTERS.filter(near).map((c) => <c.Map key={`m${c.from}`} />)}
        <Grade />
        {CHAPTERS.filter(near).map((c) => <c.Panels key={`p${c.from}`} />)}
      </MapFrame>
      <WhatIfBar chapter={ch.name} chip={wi ? "WHAT IF" : year} whatIf={wi} />
      {CHAPTERS.map((c) => <HeadCard key={`h${c.from}`} heads={c.heads} from={c.heads[0]?.f ?? c.from} to={c.to} />)}
      {CHAPTERS.filter(near).map((c) => (c.Screen ? <c.Screen key={`s${c.from}`} /> : null))}
      {BEATS.filter((b) => b.id !== "hook").map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP + 0.03} />
      ))}
    </AbsoluteFill>
  );
};
