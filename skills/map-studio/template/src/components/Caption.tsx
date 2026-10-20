import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { cues, type Word } from "./subs.mjs";

// Subtitles for one VO beat. Phrases are the space-separated parts of the line, merged up to a max length.
// With `words` (timing.json after `npm run align`) each phrase appears when it is spoken; without them,
// phrases are timed by their share of characters. `spoken` is the TTS text when it differs from `text`.
export { chunks } from "./subs.mjs";

export const Caption = ({
  text,
  start,
  len,
  font,
  color = "#fff",
  stroke = "#1b130b",
  spoken,
  words,
}: {
  text: string;
  start: number;
  len: number;
  font: string;
  color?: string;
  stroke?: string;
  spoken?: string;
  words?: Word[];
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  if (frame < start || frame >= start + len + 4) return null;
  const list = cues({ text, spoken, words, sec: len / fps, maxChars: vertical ? 20 : 30 });
  const t = (frame - start) / fps;
  const cue = list.find((c) => t < c.end) ?? list[list.length - 1];
  const fadeIn = interpolate(frame - start, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: vertical ? height * 0.7 : undefined,
          bottom: vertical ? undefined : 64 * s,
          textAlign: "center",
          fontFamily: font,
          fontWeight: 700,
          fontSize: (vertical ? 58 : 50) * s,
          lineHeight: 1.5,
          color,
          WebkitTextStroke: `${10 * s}px ${stroke}`,
          paintOrder: "stroke fill",
          opacity: fadeIn,
          padding: `0 ${60 * s}px`,
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};
