import { spring, useCurrentFrame } from "remotion";
import { isVisible } from "../../../components/camera";
import { useMap } from "../../../components/Map";
import { Region } from "../../../components/Region";
import { ERAS, type Side } from "./eras";
import { card, C, fade, fonts, InkLabel, useUnit } from "./Parchment";
import { CITIES, type CityKey } from "./places";

// Scoreboard: who holds what. A schedule is a list of { year, at } — the map cross-fades from one era to the next
// over 25 frames at each `at`; city markers flip to the new holder's colour with a pop; the tally counts cities.
export type Step = { year: number; at: number };
const XF = 25;

// weight of step i at this frame (cross-fade between consecutive steps)
const weight = (steps: Step[], i: number, frame: number) => {
  const inK = i === 0 ? 1 : fade(frame, steps[i].at, steps[i].at + XF);
  const outK = i === steps.length - 1 ? 0 : fade(frame, steps[i + 1].at, steps[i + 1].at + XF);
  return inK * (1 - outK);
};
export const stepAt = (steps: Step[], frame: number) => steps.reduce((cur, s, i) => (frame >= s.at ? i : cur), 0);

// Map layer (inside <MapFrame>, after <PaperMap>): each era's areas + their names in the side colour.
export const EraMap = ({ steps, start = 0, opacity = 0.9 }: { steps: Step[]; start?: number; opacity?: number }) => {
  const frame = useCurrentFrame();
  const a = fade(frame, start, start + 20);
  return (
    <g>
      {steps.map((st, i) => {
        const o = weight(steps, i, frame) * a;
        if (o <= 0) return null;
        return ERAS[st.year].sides.map((side) => (
          <g key={`${st.year}-${side.key}`}>
            <Region feature={side.area} color={side.color} opacity={o * opacity} />
            {o > 0.5 && <InkLabel at={side.label} text={side.name} start={(i === 0 ? start : st.at) + 10} size={2.2} dot={false} color={side.color} />}
          </g>
        ));
      })}
    </g>
  );
};

const sideOf = (year: number, key?: string): Side | undefined => (key ? ERAS[year].sides.find((s) => s.key === key) : undefined);

// City markers coloured by holder. A city not held by anyone in an era is a plain ink diamond.
export const CityMarks = ({ steps, cities, start = 0 }: { steps: Step[]; cities: CityKey[]; start?: number }) => {
  const frame = useCurrentFrame();
  const { projection, cam, s: s0, width, height } = useMap();
  const { fps } = useUnit();
  const s = s0 * (height > width ? 1.5 : 1);
  const i = stepAt(steps, frame);
  const st = steps[i];
  return (
    <g>
      {cities.map((k, n) => {
        const c = CITIES[k];
        const t = start + 12 + n * 3;
        if (frame < t || !isVisible(cam, c.at)) return null;
        const xy = projection(c.at);
        if (!xy) return null;
        const side = sideOf(st.year, c.held[st.year]);
        const prev = i > 0 ? sideOf(steps[i - 1].year, c.held[steps[i - 1].year]) : undefined;
        const flipped = i > 0 && prev?.key !== side?.key;
        const born = spring({ frame: frame - t, fps, config: { damping: 12 } });
        const flip = flipped ? spring({ frame: frame - st.at - 8, fps, config: { damping: 8, mass: 0.6 } }) : 1;
        const pulse = flipped && frame >= st.at + 8 ? Math.max(0, 1 - (frame - st.at - 8) / 24) : 0;
        const color = side?.color ?? C.ink;
        return (
          <g key={k} transform={`translate(${xy[0]},${xy[1]})`}>
            {pulse > 0 && <circle r={(14 + (1 - pulse) * 40) * s} fill="none" stroke={color} strokeWidth={4 * s} opacity={pulse} />}
            <g transform={`scale(${born * (0.6 + 0.4 * flip)})`}>
              <rect x={-11 * s} y={-11 * s} width={22 * s} height={22 * s} fill={color} stroke="#fff6dd" strokeWidth={3.5 * s} transform="rotate(45)" />
            </g>
            <text y={-22 * s} textAnchor="middle" fontFamily={fonts.body} fontWeight={600} fontSize={26 * s} fill={C.ink} stroke={C.land} strokeWidth={7 * s} paintOrder="stroke" strokeLinejoin="round" opacity={Math.min(1, born)}>
              {c.th}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// Year + era title chip at the top of the frame. Shows the current step; pops on each change.
export const YearBadge = ({ steps, start = 0 }: { steps: Step[]; start?: number }) => {
  const frame = useCurrentFrame();
  const { s, fps, vertical, height } = useUnit();
  if (frame < start) return null;
  const st = steps[stepAt(steps, frame)];
  const k = spring({ frame: frame - Math.max(start, st.at), fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", left: "50%", top: vertical ? height * 0.17 : 40 * s, transform: `translateX(-50%) scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k * 1.5), ...card(s), padding: `${6 * s}px ${30 * s}px`, textAlign: "center", fontFamily: fonts.body, whiteSpace: "nowrap" }}>
      <span style={{ fontFamily: fonts.title, fontSize: 44 * s, lineHeight: 1.35 }}>ค.ศ. {st.year}</span>
      <span style={{ fontSize: 28 * s, marginLeft: 16 * s, opacity: 0.8 }}>{ERAS[st.year].title}</span>
    </div>
  );
};

// Tally card: how many of the listed cities each side holds right now (bar + number), bottom left / above captions.
export const Tally = ({ steps, cities, start = 0, title = "เมืองในมือ" }: { steps: Step[]; cities: CityKey[]; start?: number; title?: string }) => {
  const frame = useCurrentFrame();
  const { s, fps, vertical, height } = useUnit();
  const o = fade(frame, start, start + 12);
  if (o <= 0) return null;
  const st = steps[stepAt(steps, frame)];
  const sides = ERAS[st.year].sides;
  const count = (key: string) => cities.filter((c) => CITIES[c].held[st.year] === key).length;
  return (
    <div style={{ position: "absolute", left: vertical ? 40 * s : 50 * s, top: vertical ? height * 0.6 : undefined, bottom: vertical ? undefined : 60 * s, opacity: o, ...card(s), fontFamily: fonts.body, padding: `${10 * s}px ${22 * s}px`, minWidth: 330 * s }}>
      <div style={{ fontSize: 22 * s, fontWeight: 700, lineHeight: 1.5, opacity: 0.8 }}>{title} · {cities.length} เมือง</div>
      {sides.map((side) => {
        const n = count(side.key);
        const k = spring({ frame: frame - st.at - 10, fps, config: { damping: 15 } });
        return (
          <div key={`${st.year}-${side.key}`} style={{ display: "flex", alignItems: "center", gap: 10 * s, marginTop: 4 * s }}>
            <span style={{ width: 90 * s, fontSize: 26 * s, fontWeight: 700, color: side.color, lineHeight: 1.45 }}>{side.name}</span>
            <div style={{ flex: 1, height: 16 * s, border: `${2 * s}px solid ${C.ink}`, background: "rgba(59,42,26,0.1)" }}>
              <div style={{ height: "100%", width: `${(n / cities.length) * 100 * Math.min(1, k)}%`, background: side.color }} />
            </div>
            <span style={{ width: 34 * s, textAlign: "right", fontSize: 30 * s, fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1.3 }}>{n}</span>
          </div>
        );
      })}
    </div>
  );
};
