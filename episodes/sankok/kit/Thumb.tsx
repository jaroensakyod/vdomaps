import type { ComponentType } from "react";
import { AbsoluteFill, Freeze } from "remotion";
import type { Variant } from "./Frame";
import { C, CHANNEL, fonts, useUnit } from "./theme";

// Series thumbnail: one frozen frame of the episode (thumb variant: no captions or cards) + the hook question
// big, the second line in red, and the page seal. 16:9 → text on the left; 9:16 → text in the upper third.
export type ThumbData = { n: number; lines: [string, string]; frame: number; kicker?: string };
export type SeriesThumbProps = ThumbData & { Ep: ComponentType<{ variant: Variant }> };

export const SeriesThumb = ({ n, lines, frame, Ep, kicker }: SeriesThumbProps) => {
  const { s, width, height, vertical } = useUnit();
  const stroke = { WebkitTextStroke: `${14 * s}px ${C.paper}`, paintOrder: "stroke fill" } as const;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Freeze frame={frame}>
        <Ep variant="thumb" />
      </Freeze>
      <AbsoluteFill
        style={{
          background: vertical
            ? "linear-gradient(180deg, rgba(239,225,187,0) 12%, rgba(239,225,187,0.85) 26%, rgba(239,225,187,0.85) 44%, rgba(239,225,187,0) 58%)"
            : "linear-gradient(90deg, rgba(239,225,187,0.92) 0%, rgba(239,225,187,0.75) 45%, rgba(239,225,187,0) 70%)",
        }}
      />
      <div style={{ position: "absolute", left: vertical ? 50 * s : 60 * s, right: vertical ? 50 * s : width * 0.36, top: vertical ? height * 0.26 : undefined, bottom: vertical ? undefined : 70 * s, textAlign: vertical ? "center" : "left", fontFamily: fonts.title, color: C.ink, lineHeight: 1.25 }}>
        <div style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: 34 * s, color: C.wu, ...stroke, WebkitTextStroke: `${8 * s}px ${C.paper}` }}>{kicker ?? `สามก๊ก · ตอนที่ ${n}`}</div>
        <div style={{ fontSize: (vertical ? 60 : 96) * s, ...stroke }}>{lines[0]}</div>
        <div style={{ fontSize: (vertical ? 60 : 96) * s, color: C.wu, ...stroke }}>{lines[1]}</div>
      </div>
      <div style={{ position: "absolute", right: 40 * s, top: vertical ? height * 0.13 : 34 * s, display: "flex", alignItems: "center", gap: 12 * s }}>
        <div style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: 30 * s, color: C.ink, ...stroke, WebkitTextStroke: `${6 * s}px ${C.paper}` }}>{CHANNEL.name}</div>
        <div style={{ width: 84 * s, height: 84 * s, background: C.wu, color: "#fff6dd", borderRadius: 8 * s, fontFamily: "'Microsoft YaHei', 'SimSun', serif", fontSize: 26 * s, lineHeight: 1.05, display: "flex", alignItems: "center", justifyContent: "center", writingMode: "vertical-rl", transform: "rotate(4deg)" }}>
          {CHANNEL.seal}
        </div>
      </div>
    </AbsoluteFill>
  );
};
