import type { ComponentType } from "react";
import { Composition } from "remotion";
import type { Beat } from "../../components/subs.mjs";
import * as ep01 from "./ep01/Ep";
import m01 from "./ep01/meta.json";
import * as ep02 from "./ep02/Ep";
import m02 from "./ep02/meta.json";
import * as ep03 from "./ep03/Ep";
import m03 from "./ep03/meta.json";
import * as ep04 from "./ep04/Ep";
import m04 from "./ep04/meta.json";
import * as ep05 from "./ep05/Ep";
import m05 from "./ep05/meta.json";
import * as ep06 from "./ep06/Ep";
import m06 from "./ep06/meta.json";
import * as ep07 from "./ep07/Ep";
import m07 from "./ep07/meta.json";
import * as ep08 from "./ep08/Ep";
import m08 from "./ep08/meta.json";
import * as ep09 from "./ep09/Ep";
import m09 from "./ep09/meta.json";
import * as ep10 from "./ep10/Ep";
import m10 from "./ep10/meta.json";
import { episodeFrames, type EpisodeMeta, type Variant } from "./kit/Frame";
import { SeriesThumb, type ThumbData } from "./kit/Thumb";

// Every series episode, registered four times:
//   S<NN>fb (9:16 Reels) · S<NN>yt (16:9, joins into the YouTube cut) · S<NN>thumb (1280×720) · S<NN>thumbV (1080×1920)
// Add each new episode module + its meta.json to this list. In src/Root.tsx: <SankokCompositions />.
type EpModule = { EP: EpisodeMeta; BEATS: Beat[]; THUMB: number; Ep: ComponentType<{ variant: Variant }> };
type Meta = { question: string[] };
const EPISODES: [EpModule, Meta][] = [
  [ep01, m01], [ep02, m02], [ep03, m03], [ep04, m04], [ep05, m05],
  [ep06, m06], [ep07, m07], [ep08, m08], [ep09, m09], [ep10, m10],
];

// Remotion passes props as JSON, so the episode component cannot travel in props: one wrapper per episode instead.
const THUMBS = EPISODES.map(([{ Ep }]) => (p: ThumbData) => <SeriesThumb {...p} Ep={Ep} />);

const id = (n: number) => `S${String(n).padStart(2, "0")}`;

export const SankokCompositions = () => (
  <>
    {EPISODES.map(([{ EP, BEATS, Ep }]) => (
      <Composition key={`${EP.n}fb`} id={`${id(EP.n)}fb`} component={Ep} defaultProps={{ variant: "fb" as Variant }} durationInFrames={episodeFrames(BEATS, "fb")} fps={30} width={1080} height={1920} />
    ))}
    {EPISODES.map(([{ EP, BEATS, Ep }]) => (
      <Composition key={`${EP.n}yt`} id={`${id(EP.n)}yt`} component={Ep} defaultProps={{ variant: "yt" as Variant }} durationInFrames={episodeFrames(BEATS, "yt")} fps={30} width={1920} height={1080} />
    ))}
    {EPISODES.map(([{ EP, BEATS, THUMB }, meta], i) =>
      [
        { suffix: "thumb", width: 1280, height: 720 },
        { suffix: "thumbV", width: 1080, height: 1920 },
      ].map((t) => (
        <Composition
          key={`${EP.n}${t.suffix}`}
          id={`${id(EP.n)}${t.suffix}`}
          component={THUMBS[i]}
          defaultProps={{ n: EP.n, lines: [meta.question[0], meta.question[1]] as [string, string], frame: THUMB }}
          // Freeze cannot reach past the composition end, so thumbnails run as long as the episode.
          durationInFrames={episodeFrames(BEATS, "yt")}
          fps={30}
          width={t.width}
          height={t.height}
        />
      )),
    )}
  </>
);
