import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { style } from "./style";

export type Reason = { text: string; at: number };

// Numbered reason chips ("เหตุผล 1 2 3"): each pops in at its frame, the newest is highlighted and the
// earlier ones dim so the viewer always knows which point the VO is on. 16:9: left column; 9:16: upper third
// (clear of the top UI band and of captions at 70% height).
export const ReasonChips = ({ items, end, title }: { items: Reason[]; end: number; title?: string }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  if (frame < items[0].at - 10 || frame > end) return null;
  const out = interpolate(frame, [end - 12, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const active = items.reduce((k, it, i) => (frame >= it.at ? i : k), -1);
  const titleIn = spring({ frame: frame - (items[0].at - 10), fps, config: { damping: 16 } });

  return (
    <AbsoluteFill style={{ fontFamily: style.font, pointerEvents: "none", opacity: out }}>
      <div
        style={{
          position: "absolute",
          left: vertical ? 60 * s : 80 * s,
          right: vertical ? 60 * s : undefined,
          top: vertical ? height * 0.15 : height * 0.2,
          maxWidth: vertical ? undefined : width * 0.38,
          display: "flex",
          flexDirection: "column",
          gap: 18 * s,
        }}
      >
        {title && (
          <div
            style={{
              fontSize: 40 * s,
              fontWeight: 900,
              color: style.highlight,
              textShadow: `0 ${3 * s}px ${12 * s}px rgba(0,0,0,0.6)`,
              opacity: titleIn,
              transform: `translateY(${(1 - titleIn) * 16 * s}px)`,
            }}
          >
            {title}
          </div>
        )}
        {items.map((it, i) => {
          if (frame < it.at) return null;
          const p = spring({ frame: frame - it.at, fps, config: { damping: 13, stiffness: 160 } });
          const on = i === active;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18 * s,
                padding: `${12 * s}px ${26 * s}px ${12 * s}px ${12 * s}px`,
                borderRadius: 999,
                background: on ? "rgba(6,16,31,0.88)" : "rgba(6,16,31,0.6)",
                border: `${3 * s}px solid ${on ? style.highlight : "rgba(255,255,255,0.15)"}`,
                boxShadow: `0 ${6 * s}px ${22 * s}px rgba(0,0,0,0.4)`,
                opacity: interpolate(p, [0, 1], [0, on ? 1 : 0.6]),
                transform: `translateX(${(1 - p) * -60 * s}px) scale(${0.85 + 0.15 * p})`,
                transformOrigin: "left center",
                alignSelf: "flex-start",
              }}
            >
              <div
                style={{
                  flex: "none",
                  width: 64 * s,
                  height: 64 * s,
                  borderRadius: "50%",
                  background: on ? style.accent : "rgba(255,255,255,0.18)",
                  color: "#fff",
                  fontSize: 38 * s,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontSize: (vertical ? 44 : 38) * s, fontWeight: 700, color: style.text, lineHeight: 1.35 }}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
