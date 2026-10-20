import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// Subtitles for one VO beat. Phrases are the space-separated parts of the line, merged up to `maxChars`,
// and timed by their share of characters (good enough without word timestamps; swap in Whisper timing later).
export const chunks = (text: string, maxChars = 26) => {
  const out: string[] = [];
  for (const phrase of text.split(/\s+/).filter(Boolean)) {
    const last = out[out.length - 1];
    if (last && (last + " " + phrase).length <= maxChars) out[out.length - 1] = last + " " + phrase;
    else out.push(phrase);
  }
  return out;
};

export const Caption = ({
  text,
  start,
  len,
  font,
  color = "#fff",
  stroke = "#1b130b",
}: {
  text: string;
  start: number;
  len: number;
  font: string;
  color?: string;
  stroke?: string;
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  if (frame < start || frame >= start + len + 4) return null;
  const parts = chunks(text, vertical ? 20 : 30);
  const total = parts.reduce((a, p) => a + p.length, 0);
  const t = ((frame - start) / len) * total;
  let acc = 0;
  let idx = parts.length - 1;
  for (let i = 0; i < parts.length; i++) {
    acc += parts[i].length;
    if (t < acc) {
      idx = i;
      break;
    }
  }
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
        {parts[idx]}
      </div>
    </AbsoluteFill>
  );
};
