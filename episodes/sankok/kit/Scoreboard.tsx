import { interpolate, spring, useCurrentFrame } from "remotion";
import { Region } from "../../../components/Region";
import { ERAS } from "./eras";
import { card, clamp, fade, fonts, InkLabel, useUnit } from "./theme";

// Scoreboard map layer (inside <MapFrame>): who holds what in `from`, cross-fading to `to` at `switchAt`.
export const EraMap = ({ from, to, start, switchAt, end, opacity = 0.9 }: { from: number; to?: number; start: number; switchAt?: number; end?: number; opacity?: number }) => {
  const frame = useCurrentFrame();
  const out = end === undefined ? 1 : 1 - fade(frame, end - 15, end);
  const k = to !== undefined && switchAt !== undefined ? fade(frame, switchAt, switchAt + 25) : 0;
  const a = fade(frame, start, start + 20) * out;
  const layer = (year: number, o: number, labelAt: number) =>
    ERAS[year].sides.map((side) => (
      <g key={`${year}-${side.key}`}>
        <Region feature={side.area} color={side.color} opacity={o * opacity} />
        {o > 0.5 && <InkLabel at={side.label} text={side.name} start={labelAt} end={end} size={2.2} dot={false} color={side.color} />}
      </g>
    ));
  return (
    <g>
      {layer(from, a * (1 - k), start + 10)}
      {to !== undefined && switchAt !== undefined && layer(to, a * k, switchAt + 10)}
    </g>
  );
};

// Year + era title chip at the top of the frame.
export const YearBadge = ({ year, title, start, end }: { year: number; title?: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { s, fps, vertical, height } = useUnit();
  const o = fade(frame, start, start + 6, end - 8, end);
  if (o <= 0) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", left: "50%", top: vertical ? height * 0.2 : 40 * s, transform: `translateX(-50%) scale(${0.9 + 0.1 * k})`, opacity: o, ...card(s), padding: `${6 * s}px ${30 * s}px`, textAlign: "center", fontFamily: fonts.body, whiteSpace: "nowrap" }}>
      <span style={{ fontFamily: fonts.title, fontSize: 44 * s, lineHeight: 1.35 }}>ค.ศ. {year}</span>
      {title && <span style={{ fontSize: 28 * s, marginLeft: 16 * s, opacity: 0.8 }}>{title}</span>}
    </div>
  );
};
