import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Panel } from "./Hud";
import { C, clamp, fonts, usePop, useUnit } from "./theme";

// Episode-level cards built on <Panel>: big icon + words, check lists, the "สูตรรอน้ำ" formula, a stamp, a poll.

// One big icon (SVG drawn in the 100-unit icon box) with a headline under it.
export const IconPanel = ({ icon, text, sub, start, end, y = 0.24, w = 0.6 }: { icon: ReactNode; text: string; sub?: string; start: number; end?: number; y?: number; w?: number }) => {
  const { s } = useUnit();
  return (
    <Panel start={start} end={end} y={y} w={w}>
      <svg width="100%" height={260 * s} viewBox="-80 -112 160 120" style={{ display: "block" }}>{icon}</svg>
      <div style={{ textAlign: "center", fontSize: 56 * s, fontWeight: 700, lineHeight: 1.3 }}>{text}</div>
      {sub && <div style={{ textAlign: "center", fontSize: 32 * s, lineHeight: 1.4, opacity: 0.8 }}>{sub}</div>}
    </Panel>
  );
};

// Items appear one by one at their frames. Optional `hi` = index to highlight.
export const ListPanel = ({ title, items, start, end, hi, y = 0.22, mark = "num", color = C.burma }: { title: string; items: { text: string; at: number }[]; start: number; end?: number; hi?: number; y?: number; mark?: "num" | "check" | "dot"; color?: string }) => {
  const frame = useCurrentFrame();
  const { s } = useUnit();
  return (
    <Panel start={start} end={end} y={y}>
      <div style={{ textAlign: "center", fontSize: 44 * s, fontWeight: 700, lineHeight: 1.35, marginBottom: 10 * s }}>{title}</div>
      {items.map((it, i) => {
        const k = interpolate(frame, [it.at, it.at + 8], [0, 1], clamp);
        if (k <= 0) return null;
        const on = hi === undefined || hi === i;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 * s, margin: `${8 * s}px 0`, opacity: k * (on ? 1 : 0.4), transform: `translateX(${(1 - k) * 30 * s}px)` }}>
            <div style={{ flex: "none", width: 50 * s, height: 50 * s, borderRadius: mark === "check" ? 8 * s : "50%", background: on ? color : "#9c8f7a", color: "#fff", fontFamily: fonts.num, fontSize: 32 * s, lineHeight: `${50 * s}px`, textAlign: "center" }}>
              {mark === "check" ? "✓" : mark === "dot" ? "•" : i + 1}
            </div>
            <div style={{ fontSize: 40 * s, fontWeight: 700, lineHeight: 1.35 }}>{it.text}</div>
          </div>
        );
      })}
    </Panel>
  );
};

// The "สูตรรอน้ำ" formula card. crack: 0 → 1 draws a crack, broken: 0 → 1 splits it apart.
export const FormulaCard = ({ start, end, crack = 0, broken = 0, y = 0.24, small = false }: { start: number; end?: number; crack?: number; broken?: number; y?: number; small?: boolean }) => {
  const { s, width, height } = useUnit();
  const { k, o } = usePop(start, end, 12);
  if (o <= 0) return null;
  const w = width * (small ? 0.52 : 0.72);
  const body = (
    <div style={{ background: C.card, border: `${3 * s}px solid ${C.ink}`, borderRadius: 10 * s, padding: `${16 * s}px ${26 * s}px`, fontFamily: fonts.body, boxShadow: `0 ${6 * s}px 0 rgba(51,38,27,0.25)` }}>
      <div style={{ textAlign: "center", fontSize: (small ? 34 : 46) * s, fontWeight: 700, color: C.ayut, lineHeight: 1.35 }}>สูตรรอน้ำ</div>
      {["ปิดประตูเมือง", "ตั้งรับหลังกำแพง", "รอฝน รอน้ำ"].map((t) => (
        <div key={t} style={{ fontSize: (small ? 28 : 38) * s, fontWeight: 700, lineHeight: 1.5 }}>
          <span style={{ color: C.village }}>✓</span> {t}
        </div>
      ))}
    </div>
  );
  const half = (side: 1 | -1) => (
    <div style={{ position: "absolute", inset: 0, clipPath: side < 0 ? "polygon(0 0, 55% 0, 42% 50%, 52% 100%, 0 100%)" : "polygon(55% 0, 100% 0, 100% 100%, 52% 100%, 42% 50%)", transform: `translate(${side * broken * 40 * s}px, ${broken * 30 * s}px) rotate(${side * broken * 8}deg)` }}>{body}</div>
  );
  return (
    <div style={{ position: "absolute", left: (width - w) / 2, top: height * y, width: w, opacity: o, transform: `scale(${0.85 + 0.15 * Math.min(1.05, k)})` }}>
      <div style={{ visibility: "hidden" }}>{body}</div>
      {broken > 0 ? <>{half(-1)}{half(1)}</> : <div style={{ position: "absolute", inset: 0 }}>{body}</div>}
      {crack > 0 && broken <= 0 && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path d="M55 0 L46 22 L52 34 L42 50 L50 70 L46 86 L52 100" fill="none" stroke={C.ink} strokeWidth={1.2} strokeDasharray="120" strokeDashoffset={120 * (1 - crack)} vectorEffect="non-scaling-stroke" style={{ strokeWidth: 4 * s }} />
        </svg>
      )}
    </div>
  );
};

// Rubber stamp ("ตามพงศาวดารไทย"), slams in at `start`.
export const Stamp = ({ text, start, end, color = C.burma, x = 0.5, y = 0.3 }: { text: string; start: number; end?: number; color?: string; x?: number; y?: number }) => {
  const { s, width, height } = useUnit();
  const { k, o } = usePop(start, end, 8);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: width * x, top: height * y, transform: `translate(-50%,-50%) scale(${2.2 - 1.2 * Math.min(1, k)}) rotate(-8deg)`, opacity: o * Math.min(1, k * 1.5), border: `${6 * s}px solid ${color}`, borderRadius: 12 * s, padding: `${6 * s}px ${26 * s}px`, color, fontFamily: fonts.body, fontWeight: 700, fontSize: 52 * s, lineHeight: 1.3, whiteSpace: "nowrap", background: "rgba(246,237,214,0.75)" }}>
      {text}
    </div>
  );
};

// Closing poll: two choices + a red "ติดตาม" button that pops after.
export const PollCard = ({ question, a, b, start, button }: { question: string; a: string; b: string; start: number; button: number }) => {
  const { s } = useUnit();
  const btn = usePop(button, undefined, 8);
  const opt = (t: string, c: string) => (
    <div style={{ flex: 1, border: `${4 * s}px solid ${c}`, borderRadius: 12 * s, background: "#fffaf0", color: c, padding: `${18 * s}px ${10 * s}px`, textAlign: "center", fontSize: 40 * s, fontWeight: 700, lineHeight: 1.35 }}>{t}</div>
  );
  return (
    <Panel start={start} y={0.22}>
      <div style={{ textAlign: "center", fontSize: 46 * s, fontWeight: 700, lineHeight: 1.35, marginBottom: 16 * s }}>{question}</div>
      <div style={{ display: "flex", gap: 18 * s }}>
        {opt(a, C.ayut)}
        {opt(b, C.taksin)}
      </div>
      <div style={{ textAlign: "center", fontSize: 30 * s, opacity: 0.8, lineHeight: 1.4, marginTop: 14 * s }}>พิมพ์บอกในคอมเมนต์ได้เลย</div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 * s }}>
        <div style={{ transform: `scale(${btn.k})`, background: C.burma, color: "#fff", borderRadius: 40 * s, padding: `${8 * s}px ${44 * s}px`, fontSize: 40 * s, fontWeight: 700, lineHeight: 1.4, border: `${3 * s}px solid ${C.ink}` }}>ติดตาม</div>
      </div>
    </Panel>
  );
};
