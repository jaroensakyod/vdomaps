import { geoMercator, geoPath } from "d3-geo";
import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries50 from "world-atlas/countries-50m.json";
import { projectionFor, type Cam } from "../../../components/camera";
import { C, cardStyle, clamp, fonts, usePop, useUnit } from "./theme";

// Fixed screen furniture: year badge (top-left), locator map (top-right), lower card, quiz / quote / split cards.
// Vertical safe area: nothing in the top ~8% (status bar) and the lower card stays above the bottom 22%.

const TOP = 0.085; // top of the badges, fraction of height

export const YearBadge = ({ year, month, flash }: { year: string; month?: string; flash?: number }) => {
  const frame = useCurrentFrame();
  const { s, height } = useUnit();
  const pulse = flash === undefined ? 1 : 1 + 0.12 * Math.max(0, 1 - (frame - flash) / 10) * (frame >= flash ? 1 : 0);
  return (
    <div style={{ position: "absolute", left: 44 * s, top: height * TOP, ...cardStyle(s), padding: `${6 * s}px ${22 * s}px ${10 * s}px`, minWidth: 190 * s, transform: `scale(${pulse})`, transformOrigin: "left top" }}>
      <div style={{ fontFamily: fonts.body, fontSize: 24 * s, lineHeight: 1.3, opacity: 0.75 }}>พ.ศ.</div>
      <div style={{ fontFamily: fonts.num, fontWeight: 600, fontSize: 76 * s, lineHeight: 1.05, letterSpacing: 1 * s }}>{year}</div>
      {month && <div style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: 26 * s, lineHeight: 1.4, color: C.burma }}>{month}</div>}
    </div>
  );
};

// Mini Thailand (+ neighbours) with a red box where the camera is looking.
const world = countries50 as unknown as Topology<{ countries: GeometryCollection }>;
const all = feature(world, world.objects.countries);
const NEAR = new Set(["764", "104", "418", "116", "458", "704", "156", "050", "356"]); // TH MM LA KH MY VN CN BD IN
const near = { ...all, features: all.features.filter((f) => NEAR.has(String(f.id))) };

export const Locator = ({ cam }: { cam: Cam }) => {
  const { s, width, height } = useUnit();
  const W = 150 * s;
  const H = 190 * s;
  const proj = geoMercator().fitExtent([[0, 0], [W, H]], { type: "MultiPoint", coordinates: [[96.5, 5.6], [106.2, 20.6]] });
  const path = geoPath(proj);
  const view = projectionFor(cam, width, height);
  const corners = [[0, 0], [width, 0], [width, height], [0, height]].map((c) => view.invert?.(c as [number, number]));
  const box = corners.every(Boolean) ? corners.map((c) => proj(c as [number, number])!) : null;
  let bw = 0;
  if (box) bw = Math.max(...box.map((b) => b[0])) - Math.min(...box.map((b) => b[0]));
  return (
    <div style={{ position: "absolute", right: 44 * s, top: height * TOP, ...cardStyle(s), padding: 6 * s, background: "#b9d3dc" }}>
      <svg width={W} height={H} style={{ display: "block" }}>
        {near.features.map((f) => (
          <path key={String(f.id)} d={path(f) ?? ""} fill={f.id === "764" ? "#f2e7c9" : "#ddd2b5"} stroke={C.coast} strokeWidth={f.id === "764" ? 1.4 * s : 0.8 * s} />
        ))}
        {box && bw < W * 0.9 && (
          bw < 8 * s ? (
            <circle cx={box[0][0]} cy={box[0][1]} r={6 * s} fill="none" stroke={C.burma} strokeWidth={3 * s} />
          ) : (
            <path d={`M${box.map((b) => b.join(",")).join(" L")} Z`} fill="rgba(192,57,43,0.15)" stroke={C.burma} strokeWidth={2.6 * s} />
          )
        )}
      </svg>
    </div>
  );
};

// Lower card: bold title + one-line subtitle, coloured bar on the left. Pops in on `start`.
export const LowerCard = ({ title, sub, color, start, end }: { title: string; sub?: string; color: string; start: number; end?: number }) => {
  const { s, height, width } = useUnit();
  const { k, o } = usePop(start, end, 14);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 44 * s, width: width - 88 * s, top: height * 0.665, opacity: o, transform: `translateY(${(1 - Math.min(1, k)) * 26 * s}px)` }}>
      <div style={{ ...cardStyle(s), borderLeft: `${16 * s}px solid ${color}`, padding: `${12 * s}px ${26 * s}px ${14 * s}px`, fontFamily: fonts.body }}>
        <div style={{ fontWeight: 700, fontSize: 50 * s, lineHeight: 1.35 }}>{title}</div>
        {sub && <div style={{ fontWeight: 500, fontSize: 32 * s, lineHeight: 1.45, opacity: 0.8 }}>{sub}</div>}
      </div>
    </div>
  );
};

// Red "?" badge (the question of the day).
export const QuestionBadge = ({ start, end }: { start: number; end?: number }) => {
  const { s, width, height } = useUnit();
  const { k, o } = usePop(start, end, 9);
  if (o <= 0) return null;
  const r = 66 * s;
  return (
    <div style={{ position: "absolute", left: width * 0.78 - r, top: height * 0.5 - r, width: r * 2, height: r * 2, borderRadius: "50%", background: "#fbf3e2", border: `${7 * s}px solid ${C.burma}`, color: C.burma, fontFamily: fonts.num, fontWeight: 600, fontSize: 92 * s, lineHeight: `${r * 2 - 14 * s}px`, textAlign: "center", transform: `scale(${k}) rotate(${(1 - k) * -40}deg)`, opacity: o, boxShadow: `0 ${6 * s}px 0 rgba(51,38,27,0.25)` }}>
      ?
    </div>
  );
};

// Centre panel used by quiz, quote, split and diagram cards. y = top as a fraction of height.
export const Panel = ({ start, end, children, y = 0.22, w = 0.84 }: { start: number; end?: number; children: ReactNode; y?: number; w?: number }) => {
  const { s, width, height } = useUnit();
  const { k, o } = usePop(start, end, 13);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: (width * (1 - w)) / 2, width: width * w, top: height * y, opacity: o, transform: `scale(${0.85 + 0.15 * Math.min(1.05, k)})` }}>
      <div style={{ ...cardStyle(s), padding: `${22 * s}px ${30 * s}px`, fontFamily: fonts.body }}>{children}</div>
    </div>
  );
};

// Quiz: question + options; `reveal` frame ticks the right one and fades the others. Countdown dots before it.
export const QuizCard = ({ title, question, options, answer, start, reveal, end }: { title: string; question: string; options: string[]; answer: number; start: number; reveal: number; end?: number }) => {
  const frame = useCurrentFrame();
  const { s } = useUnit();
  const left = Math.max(0, Math.ceil((reveal - frame) / 30));
  return (
    <Panel start={start} end={end}>
      <div style={{ textAlign: "center", fontSize: 28 * s, fontWeight: 700, color: C.burma, lineHeight: 1.4 }}>{title}</div>
      <div style={{ textAlign: "center", fontSize: 44 * s, fontWeight: 700, lineHeight: 1.35, margin: `${6 * s}px 0 ${16 * s}px` }}>{question}</div>
      {options.map((t, i) => {
        const on = frame >= reveal;
        const right = i === answer;
        return (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 18 * s, margin: `${10 * s}px 0`, padding: `${10 * s}px ${20 * s}px`, borderRadius: 10 * s, border: `${3 * s}px solid ${C.ink}`, background: on && right ? "#dff0d0" : "#fffaf0", opacity: on && !right ? 0.45 : 1 }}>
            <div style={{ width: 46 * s, height: 46 * s, borderRadius: 8 * s, border: `${3 * s}px solid ${C.ink}`, background: on && right ? C.village : "#fff", color: "#fff", fontSize: 36 * s, fontWeight: 700, lineHeight: `${40 * s}px`, textAlign: "center" }}>{on && right ? "✓" : ""}</div>
            <div style={{ fontSize: 38 * s, fontWeight: 700, lineHeight: 1.4 }}>{t}</div>
          </div>
        );
      })}
      {frame < reveal && (
        <div style={{ textAlign: "center", fontFamily: fonts.num, fontSize: 40 * s, color: C.burma, lineHeight: 1.3, marginTop: 6 * s }}>{left}</div>
      )}
    </Panel>
  );
};

// Quote from a chronicle: paper card with a red rule and a source line.
export const QuoteCard = ({ who, text, source, start, end }: { who: string; text: string; source: string; start: number; end?: number }) => {
  const { s } = useUnit();
  return (
    <Panel start={start} end={end} y={0.25}>
      <div style={{ textAlign: "center", fontSize: 26 * s, opacity: 0.75, lineHeight: 1.4 }}>{who}</div>
      <div style={{ textAlign: "center", fontSize: 48 * s, fontWeight: 700, lineHeight: 1.45, margin: `${8 * s}px 0` }}>“{text}”</div>
      <div style={{ height: 3 * s, background: C.burma, width: "40%", margin: `${10 * s}px auto` }} />
      <div style={{ textAlign: "center", fontSize: 26 * s, color: C.burma, lineHeight: 1.4 }}>{source}</div>
    </Panel>
  );
};

// Two versions side by side ("พงศาวดารไทย" vs "บันทึกพม่า", "ทิ้งเมือง?" vs "เก็บกำลัง?").
export const SplitCard = ({ left, right, start, end, title }: { left: { head: string; body: string; color: string; icon?: ReactNode }; right: { head: string; body: string; color: string; icon?: ReactNode }; start: number; end?: number; title?: string }) => {
  const { s } = useUnit();
  const side = (x: typeof left) => (
    <div style={{ flex: 1, border: `${3 * s}px solid ${x.color}`, borderRadius: 10 * s, background: "#fffaf0", padding: `${12 * s}px ${14 * s}px`, textAlign: "center" }}>
      <div style={{ fontSize: 32 * s, fontWeight: 700, color: x.color, lineHeight: 1.4 }}>{x.head}</div>
      {x.icon && <svg width={120 * s} height={110 * s} viewBox="-60 -105 120 110" style={{ display: "block", margin: "0 auto" }}>{x.icon}</svg>}
      <div style={{ fontSize: 32 * s, fontWeight: 500, lineHeight: 1.4 }}>{x.body}</div>
    </div>
  );
  return (
    <Panel start={start} end={end}>
      {title && <div style={{ textAlign: "center", fontSize: 40 * s, fontWeight: 700, lineHeight: 1.4, marginBottom: 12 * s }}>{title}</div>}
      <div style={{ display: "flex", gap: 18 * s }}>
        {side(left)}
        {side(right)}
      </div>
    </Panel>
  );
};

// Count up between frames; shown inside whatever wraps it.
export const useCount = (from: number, to: number, a: number, b: number) => Math.round(interpolate(useCurrentFrame(), [a, b], [from, to], clamp));

// Floating chip on the map in screen px (counter, name tag).
export const Chip = ({ x, y, text, color = C.ink, start, end, size = 1 }: { x: number; y: number; text: string; color?: string; start: number; end?: number; size?: number }) => {
  const { s } = useUnit();
  const { k, o } = usePop(start, end, 12);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${k})`, opacity: o, ...cardStyle(s), borderColor: color, padding: `${4 * s}px ${16 * s}px`, fontFamily: fonts.body, fontWeight: 700, fontSize: 32 * s * size, lineHeight: 1.4, color, whiteSpace: "nowrap" }}>
      {text}
    </div>
  );
};
