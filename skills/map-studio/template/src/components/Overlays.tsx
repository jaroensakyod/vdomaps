import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { style } from "./style";

const useUnit = () => {
  const { width, height } = useVideoConfig();
  return { s: Math.min(width, height) / 1080, width, height, vertical: height > width };
};

export type CalendarPage = { frame: number; day: string; month: string; year: string };

// Tear-off calendar. Each page appears at its frame; the previous page tears off and falls.
export const TearCalendar = ({ pages, start }: { pages: CalendarPage[]; start: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s, width, height, vertical } = useUnit();
  if (frame < start) return null;
  const enter = spring({ frame: frame - start, fps, config: { damping: 14 } });
  let idx = 0;
  pages.forEach((p, i) => {
    if (frame >= p.frame) idx = i;
  });
  const w = 230 * s;
  const tearing = idx > 0 ? frame - pages[idx].frame : 99;
  const T = 16;

  const Page = ({ p, style: extra }: { p: CalendarPage; style?: React.CSSProperties }) => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#fff",
        borderRadius: 18 * s,
        overflow: "hidden",
        boxShadow: `0 ${8 * s}px ${24 * s}px rgba(0,0,0,0.35)`,
        textAlign: "center",
        color: "#1b1b1b",
        lineHeight: 1.3,
        ...extra,
      }}
    >
      <div style={{ background: style.accent, color: "#fff", fontSize: 38 * s, fontWeight: 900, padding: `${8 * s}px 0` }}>
        {p.month}
      </div>
      <div style={{ fontSize: 120 * s, fontWeight: 900, lineHeight: 1.15 }}>{p.day}</div>
      <div style={{ fontSize: 34 * s, fontWeight: 700, opacity: 0.7 }}>{p.year}</div>
    </div>
  );

  return (
    <AbsoluteFill style={{ fontFamily: style.font }}>
      <div
        style={{
          position: "absolute",
          width: w,
          height: w * 1.12,
          right: vertical ? width / 2 - w / 2 : 80 * s,
          top: vertical ? height * 0.66 : 80 * s,
          transform: `scale(${enter}) rotate(${-4 * enter}deg)`,
          perspective: 900 * s,
        }}
      >
        <Page p={pages[idx]} />
        {tearing < T && (
          <Page
            p={pages[idx - 1]}
            style={{
              transformOrigin: "50% 0%",
              transform: `translateY(${interpolate(tearing, [0, T], [0, 260], { easing: Easing.in(Easing.quad) }) * s}px) rotateX(${interpolate(tearing, [0, T], [0, 70])}deg) rotateZ(${interpolate(tearing, [0, T], [0, 18])}deg)`,
              opacity: interpolate(tearing, [T * 0.6, T], [1, 0], { extrapolateLeft: "clamp" }),
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

// Title card that fades in and out.
export const Title = ({ text, sub, start, end }: { text: string; sub?: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { s, height, vertical } = useUnit();
  const o = interpolate(frame, [start, start + 10, end - 12, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (o <= 0) return null;
  const y = interpolate(frame, [start, start + 14], [20, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill
      style={{
        fontFamily: style.font,
        color: style.text,
        alignItems: "center",
        justifyContent: vertical ? "flex-start" : "flex-end",
        paddingTop: vertical ? height * 0.14 : 0,
        paddingBottom: vertical ? 0 : 110 * s,
        opacity: o,
        textAlign: "center",
        lineHeight: 1.45,
      }}
    >
      <div style={{ transform: `translateY(${y * s}px)`, textShadow: `0 ${4 * s}px ${18 * s}px rgba(0,0,0,0.7)` }}>
        <div style={{ fontSize: 84 * s, fontWeight: 900 }}>{text}</div>
        {sub && <div style={{ fontSize: 40 * s, fontWeight: 400, opacity: 0.85 }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

// Map data credit, always visible while the layer is on screen. Required by OSM/CC BY sources.
export const Credit = ({ lines }: { lines: string[] }) => {
  const { s, vertical, height } = useUnit();
  return (
    <AbsoluteFill style={{ fontFamily: style.font, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          right: 28 * s,
          bottom: vertical ? height * 0.21 : 20 * s,
          fontSize: 18 * s,
          color: "rgba(255,255,255,0.7)",
          textAlign: "right",
          lineHeight: 1.4,
        }}
      >
        {lines.join(" · ")}
      </div>
    </AbsoluteFill>
  );
};

// Number that counts up between frames.
export const CountUp = ({ from = 0, to, start, end, suffix = "" }: { from?: number; to: number; start: number; end: number; suffix?: string }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {Math.round(v).toLocaleString("th-TH")}
      {suffix}
    </span>
  );
};
