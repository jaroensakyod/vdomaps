import type { ReactNode } from "react";
import { AbsoluteFill, Freeze, useVideoConfig } from "remotion";
import { style } from "./style";

export type ThumbProps = { headline: string; accent?: string; sub?: string; frame?: number };

// Thumbnail = one frozen frame of the episode + a big headline. `accent` is the part of the headline drawn in
// the accent colour (the hook word); "\n" forces a line break. Register it at 1280×720 (or 1080×1920) with the
// episode's durationInFrames — Freeze is clamped to the composition length — and render with scripts/thumb.mjs.
export const Thumbnail = ({ headline, accent, sub, frame = 0, children }: ThumbProps & { children: ReactNode }) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  const [before, after] = accent && headline.includes(accent) ? headline.split(accent, 2) : [headline, undefined];
  const text = { WebkitTextStroke: `${16 * s}px ${style.textStroke}`, paintOrder: "stroke fill" } as const;
  return (
    <AbsoluteFill style={{ background: style.bg }}>
      <Freeze frame={frame}>{children}</Freeze>
      <AbsoluteFill
        style={{
          background: vertical
            ? "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 45%)"
            : "linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 62%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 70 * s,
          right: vertical ? 70 * s : width * 0.3,
          top: vertical ? height * 0.12 : undefined,
          bottom: vertical ? undefined : 90 * s,
          fontFamily: style.font,
          lineHeight: 1.25,
          textAlign: vertical ? "center" : "left",
          whiteSpace: "pre-line",
        }}
      >
        <div style={{ ...text, fontSize: (vertical ? 120 : 112) * s, fontWeight: 900, color: style.text }}>
          {before}
          {after !== undefined && <span style={{ color: style.highlight }}>{accent}</span>}
          {after}
        </div>
        {sub && <div style={{ ...text, fontSize: 52 * s, fontWeight: 700, color: style.text, marginTop: 14 * s }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};
