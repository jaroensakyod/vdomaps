import { Composition } from "remotion";
import { CHASE_FRAMES, ZombieChase } from "./test/Chase";
import { MocapPreview, MocapSource } from "./test/MocapCheck";
import { PoseSheet } from "./test/PoseSheet";

// หนีซอมบี้ — chase scenes with pose-driven figures (1080×1920). In src/Root.tsx: <ZombieCompositions />.
export const ZombieCompositions = () => (
  <>
    <Composition id="ZombieChase" component={ZombieChase} durationInFrames={CHASE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ZombiePoseSheet" component={PoseSheet} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="MocapSource" component={MocapSource} durationInFrames={92} fps={30} width={1080} height={1920} />
    <Composition id="MocapPreview" component={MocapPreview} defaultProps={{ name: "selftest", src: "mocap/selftest.mp4" }} durationInFrames={92} fps={30} width={1080} height={1920} />
  </>
);
