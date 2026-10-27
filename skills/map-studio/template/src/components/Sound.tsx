import { Html5Audio, interpolate, Sequence, staticFile } from "remotion";
import IDX from "./sfx-index.json";

// Synthesised effects from `npm run sfx` (no licence needed). Paths are relative to public/.
export const SFX = {
  whoosh: "sfx/whoosh.wav", // camera moves — start it ~6 frames before the move
  pop: "sfx/pop.wav", // labels, pins, chips
  hit: "sfx/hit.wav", // reveals, big numbers
  tick: "sfx/tick.wav", // counters, clocks
  riser: "sfx/riser.wav", // 2 s build-up into a reveal
  swell: "sfx/swell.wav", // title cards
} as const;

// Recorded effects from the house library (sfx/library.json → `npm run sfx-lib` → public/sfx/lib/<id>.mp3).
// e.g. <Sfx src={lib("explosion_big")} at={f} volume={0.6} />. Pick ids from references/sound.md.
export const lib = (id: string) => `sfx/lib/${id}.mp3`;

// Timing of each library sound (written by `npm run sfx-lib`): 30 fps loudness envelope in dB, `hit` = frame
// where the main transient starts, `peak` = loudest frame, `align` = "hit" (default) or "end" (lead-ins such
// as an incoming shell whose whistle should END on the impact).
type SfxTiming = { align: string; frames: number; hit: number; peak: number; env: number[] };
export const sfxInfo = (id: string): SfxTiming | undefined => (IDX as Record<string, SfxTiming>)[id];

// SYNC RULE: place library sounds with <Hit>, not <Sfx>. The sound's transient lands exactly on `at`, the frame
// where the picture shows the event (muzzle flash, impact, clash). Raw files often start with a lead-in.
export const Hit = ({ id, at, volume = 0.5 }: { id: string; at: number; volume?: number }) => {
  const t = sfxInfo(id);
  const start = t ? (t.align === "end" ? at - t.frames : at - t.hit) : at;
  return <Sfx src={lib(id)} at={start} volume={volume} />;
};

// Frames (absolute) where a sound started at `start` has a transient: each burst of a machine gun, each
// footstep, each thunder crack. Drive the matching picture (flash, tracer, shake) from these frames.
export const onsets = (id: string, start: number, rise = 6, gap = 2) => {
  const t = sfxInfo(id);
  if (!t) return [];
  const out: number[] = [];
  for (let i = 1; i < t.env.length; i++) if (t.env[i] - t.env[i - 1] >= rise && (!out.length || i + start - out[out.length - 1] > gap)) out.push(start + i);
  return out;
};

// Loudness 0–1 of a sound started at `start`, at `frame` — for glows, shakes, engine vibration.
export const levelAt = (id: string, start: number, frame: number, floorDb = -40) => {
  const t = sfxInfo(id);
  const i = frame - start;
  if (!t || i < 0 || i >= t.env.length) return 0;
  return Math.max(0, Math.min(1, (t.env[i] - floorDb) / (t.env[t.peak] - floorDb)));
};

// Start frame for a bed whose loudest moment (a fly-by, a cheer) must land on `peakAt`.
export const bedFrom = (id: string, peakAt: number) => peakAt - (sfxInfo(id)?.peak ?? 0);

// Ambience bed (rain, crowd, gunfire, engines): loops from `from` to `to` with fades, ducked under VO spans.
export const Bed = ({ id, from, to, volume = 0.25, fade = 20, voice = [], duck = 0.45 }: { id: string; from: number; to: number; volume?: number; fade?: number; voice?: [number, number][]; duck?: number }) => (
  <Sequence from={from} durationInFrames={to - from} layout="none">
    <Html5Audio
      src={staticFile(lib(id))}
      loop
      volume={(f) => {
        const t = f + from;
        let d = 1;
        for (const [a, b] of voice) d = Math.min(d, 1 - interpolate(t, [a - 8, a, b, b + 8], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 - duck));
        const fd = Math.max(1, Math.min(fade, (to - from) / 2 - 1)); // short beds: fades must not overlap
        return volume * d * interpolate(f, [0, fd, to - from - fd, to - from], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      }}
    />
  </Sequence>
);

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
