import { Composition } from "remotion";
import { Thumbnail, type ThumbProps } from "./components/Thumbnail";
import { DATA_TOUR_FRAMES, DataTour } from "./episodes/datatour/DataTour";
import { MAP_TEST_FRAMES, MapTest } from "./episodes/test/MapTest";
import { STYLES } from "./styles/registry";

const SIZE = { "9x16": { width: 1080, height: 1920, suffix: "" }, "16x9": { width: 1920, height: 1080, suffix: "-wide" }, "4x5": { width: 1080, height: 1350, suffix: "-post" } } as const;

const MapTestThumb = (p: ThumbProps) => (
  <Thumbnail {...p}>
    <MapTest />
  </Thumbnail>
);
const thumb: ThumbProps = { headline: "ไทย → โตเกียว\nบินกี่ชั่วโมง?", accent: "กี่ชั่วโมง?", frame: 230 };

// Register every scene twice when a video ships in both formats: same component, different size.
// Thumbnails: one still composition per format, as long as the episode (Freeze cannot reach past the end).
// `npm run thumb -- MapTestThumb test --headline "..." --frame 200`
export const Root = () => (
  <>
    <Composition id="MapTest" component={MapTest} durationInFrames={MAP_TEST_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="MapTestVertical" component={MapTest} durationInFrames={MAP_TEST_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MapTestThumb" component={MapTestThumb} defaultProps={thumb} durationInFrames={MAP_TEST_FRAMES} fps={30} width={1280} height={720} />
    <Composition id="MapTestThumbVertical" component={MapTestThumb} defaultProps={thumb} durationInFrames={MAP_TEST_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="DataTour" component={DataTour} durationInFrames={DATA_TOUR_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="DataTourVertical" component={DataTour} durationInFrames={DATA_TOUR_FRAMES} fps={30} width={1080} height={1920} />
    {/* Style demos installed with `npm run style -- <id>` */}
    {STYLES.flatMap(({ demo, Demo }) =>
      demo.sizes.map((s) => (
        <Composition key={demo.id + s} id={`Style-${demo.id}${SIZE[s].suffix}`} component={Demo} defaultProps={{ cover: demo.cover }} durationInFrames={demo.frames} fps={demo.fps ?? 30} width={SIZE[s].width} height={SIZE[s].height} />
      )),
    )}
  </>
);
