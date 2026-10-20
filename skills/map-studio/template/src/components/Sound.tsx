import { Html5Audio, interpolate, Sequence, staticFile } from "remotion";

// Synthesised effects from `npm run sfx` (no licence needed). Paths are relative to public/.
export const SFX = {
  whoosh: "sfx/whoosh.wav", // camera moves — start it ~6 frames before the move
  pop: "sfx/pop.wav", // labels, pins, chips
  hit: "sfx/hit.wav", // reveals, big numbers
  tick: "sfx/tick.wav", // counters, clocks
  riser: "sfx/riser.wav", // 2 s build-up into a reveal
  swell: "sfx/swell.wav", // title cards
} as const;

// One effect at a frame. Keep effects 6–10 dB under the VO (volume 0.3–0.5).
export const Sfx = ({ src, at, volume = 0.4 }: { src: string; at: number; volume?: number }) => (
  <Sequence from={at} layout="none">
    <Html5Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

// Background music, looped, faded in/out, ducked under every VO span ([startFrame, endFrame] in video frames).
// Default duck = 0.12 (≈ −18 dB): the range audio.md asks for under narration.
export const Music = ({
  src,
  total,
  voice = [],
  volume = 0.5,
  duck = 0.12,
  ramp = 10,
  fade = 30,
}: {
  src: string;
  total: number;
  voice?: [number, number][];
  volume?: number;
  duck?: number;
  ramp?: number;
  fade?: number;
}) => {
  const level = (f: number) => {
    // 1 outside VO, `duck` inside, with `ramp`-frame slopes on both sides of each span
    let d = 1;
    for (const [a, b] of voice) {
      const k = interpolate(f, [a - ramp, a, b, b + ramp], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      d = Math.min(d, 1 - k * (1 - duck));
    }
    const edge = interpolate(f, [0, fade, total - fade, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return volume * d * edge;
  };
  return <Html5Audio src={staticFile(src)} loop volume={level} />;
};

// VO spans for <Music voice> from beats that have start/end frames.
export const voiceSpans = (beats: { start: number; end: number }[]): [number, number][] => beats.map((b) => [b.start, b.end]);
