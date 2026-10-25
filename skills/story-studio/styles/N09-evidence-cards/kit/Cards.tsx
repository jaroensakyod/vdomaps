import { loadFont } from "@remotion/google-fonts/Kanit";
import { createContext, useContext, type ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// N09 evidence cards (news dark-card style, HTML overlays). Each card sits in ONE slot: "panel" = the big card
// box, "head" = the head-card box at the top. On a map episode the panel slot is the illustration slot (56 % of
// the height, 350 px) so the map stays visible; on its own (no map) wrap the scene in <CardLayout> with a bigger
// panel. Nothing reaches the captions at 76.5 %.

export const font = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["thai", "latin"] }).fontFamily;
export const RED = "#ff3b30";
export const GOLD = "#ffc94a";
export const BLUE = "#4fa3ff";
export const GREEN = "#3fbf6a";
export const CHINA_C = "#c0186a";
export const VIET_C = "#3fa7d6";
export const CARD_BG = "rgba(8,14,26,0.92)";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Cue frames in spoken order: each at least `gap` after the previous and inside [lo, hi] (keeps marks in order
// whatever the word timing turns out to be).
export const mono = (frames: number[], gap = 12, lo = -1e9, hi = 1e9) => {
  const out: number[] = [];
  for (const f of frames) out.push(Math.min(hi, Math.max(f, lo, out.length ? out[out.length - 1] + gap : -1e9)));
  return out;
};

// Slot boxes: top as a share of the height, height in px at 1080. `maxW` (px at 1080) caps the width on 16:9.
type Box = { top: number; h: number };
type Layout = { panel: Box; head: Box; maxW: number; scale: number };
const DEFAULT: Layout = { panel: { top: 0.56, h: 350 }, head: { top: 0.1, h: 320 }, maxW: 1300, scale: 1 };
const LayoutCtx = createContext<Layout>(DEFAULT);
// `scale` enlarges every card (type, boxes) — e.g. 1.25 when the cards are the whole picture.
export const CardLayout = ({ panel, head, maxW, scale, children }: { panel?: Box; head?: Box; maxW?: number; scale?: number; children: ReactNode }) => (
  <LayoutCtx.Provider value={{ panel: panel ?? DEFAULT.panel, head: head ?? DEFAULT.head, maxW: maxW ?? DEFAULT.maxW, scale: scale ?? 1 }}>{children}</LayoutCtx.Provider>
);
export type SlotName = "panel" | "head";

const useS = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const L = useContext(LayoutCtx);
  const side = Math.max(50 * s, (width - L.maxW * s) / 2);
  return { s: s * L.scale, width, height, side, L };
};

// Pop-in for an element shown from frame f.
export const usePop = (f: number, damping = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame < f ? 0 : spring({ frame: frame - f, fps, config: { damping } });
};

// The card box. children get the local frame.
export const Slot = ({ start, end, slot = "panel", color = GOLD, title, children, pad = 22 }: { start: number; end: number; slot?: SlotName; color?: string; title?: string; children: (lt: number) => ReactNode; pad?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s, height, side, L } = useS();
  if (frame < start || frame > end) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const o = interpolate(frame, [end - 8, end], [1, 0], clamp) * Math.min(1, k * 1.4);
  const top = height * L[slot].top;
  const h = L[slot].h * s;
  return (
    <div style={{ position: "absolute", left: side, right: side, top, height: h, boxSizing: "border-box", opacity: o, transform: `translateY(${(1 - k) * 24 * s}px) scale(${0.96 + 0.04 * k})`, fontFamily: font, color: "#fff", background: CARD_BG, border: `${3 * s}px solid ${color}`, borderRadius: 18 * s, padding: `${(title ? 14 : pad) * s}px ${26 * s}px ${pad * 0.8 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.55)`, lineHeight: 1.3, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {title && <div style={{ fontSize: 30 * s, fontWeight: 900, color, marginBottom: 8 * s, whiteSpace: "nowrap" }}>{title}</div>}
      <div style={{ position: "relative", flex: 1 }}>{children(frame - start)}</div>
    </div>
  );
};

// ---------- calendar: one month, red rings drawn on the marked days ([day, frame]). first = weekday of day 1 (0 = Sunday) ----------
export const Calendar = ({ start, end, marks, title, first = 1, days: nDays = 30, slot = "panel" }: { start: number; end: number; marks: [number, number][]; title: string; first?: number; days?: number; slot?: SlotName }) => {
  const frame = useCurrentFrame();
  const { s } = useS();
  const days = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const cells = Array.from({ length: Math.ceil((first + nDays) / 7) * 7 }, (_, i) => i - first + 1);
  return (
    <Slot start={start} end={end} slot={slot} color={RED} title={title}>
      {() => (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: 41 * s, columnGap: 6 * s, rowGap: 3 * s, fontSize: 28 * s, fontWeight: 700, textAlign: "center" }}>
          {days.map((d) => <div key={d} style={{ fontSize: 22 * s, opacity: 0.6, lineHeight: `${41 * s}px` }}>{d}</div>)}
          {cells.map((d, i) => {
            const m = marks.find(([day]) => day === d);
            const k = m ? interpolate(frame, [m[1], m[1] + 12], [0, 1], clamp) : 0;
            const valid = d >= 1 && d <= nDays;
            return (
              <div key={i} style={{ position: "relative", lineHeight: `${41 * s}px`, borderRadius: 8 * s, background: valid ? (k > 0 ? `rgba(255,59,48,${0.22 * k})` : "rgba(255,255,255,0.06)") : "transparent", color: k > 0.5 ? "#fff" : valid ? "rgba(255,255,255,0.75)" : "transparent", fontWeight: k > 0.5 ? 900 : 700 }}>
                {valid ? d : ""}
                {k > 0 && (
                  <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ position: "absolute", left: -6 * s, top: -4 * s, width: `calc(100% + ${12 * s}px)`, height: `calc(100% + ${8 * s}px)`, overflow: "visible" }}>
                    <ellipse cx={50} cy={30} rx={46} ry={27} fill="none" stroke={RED} strokeWidth={6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 5 * s }} transform="rotate(-8 50 30)" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Slot>
  );
};

// ---------- two columns side by side, each with a manuscript glyph ----------
export type Side = { tag: string; text: string; color: string; f: number; icon?: "thai" | "viet" | "china" | "book" };
const Glyph = ({ kind, color, s }: { kind: Side["icon"]; color: string; s: number }) => (
  <svg width={70 * s} height={46 * s} viewBox="0 0 70 46" style={{ flex: "none" }}>
    {kind === "china" || kind === "viet" ? (
      <g>
        <rect x={10} y={4} width={50} height={38} fill="#efe2c0" stroke="#1a140f" strokeWidth={1.5} />
        <rect x={6} y={2} width={58} height={5} rx={2.5} fill={kind === "china" ? "#8a1a2a" : "#2a4a6a"} />
        <rect x={6} y={39} width={58} height={5} rx={2.5} fill={kind === "china" ? "#8a1a2a" : "#2a4a6a"} />
        {[18, 28, 38, 48].map((x) => <line key={x} x1={x} y1={10} x2={x} y2={34} stroke="#1a140f" strokeWidth={2.4} strokeDasharray="5 3" />)}
      </g>
    ) : kind === "book" ? (
      <g>
        <path d="M6 8 L35 12 L64 8 L64 40 L35 44 L6 40 Z" fill="#f4ecd8" stroke="#1a140f" strokeWidth={1.5} />
        <line x1={35} y1={12} x2={35} y2={44} stroke="#1a140f" strokeWidth={1.5} />
        {[18, 24, 30].map((y) => <g key={y}><line x1={11} y1={y} x2={30} y2={y + 1} stroke="#555" strokeWidth={1.6} /><line x1={40} y1={y + 1} x2={59} y2={y} stroke="#555" strokeWidth={1.6} /></g>)}
      </g>
    ) : (
      <g>
        <path d="M2 40 L35 36 L68 40 L68 10 L35 6 L2 10 Z" fill="#2a2420" stroke="#1a140f" strokeWidth={1.5} />
        {[15, 21, 27, 33].map((y) => <g key={y}><line x1={7} y1={y} x2={31} y2={y - 2} stroke="#e8dcc0" strokeWidth={1.6} strokeDasharray="4 2" /><line x1={39} y1={y - 2} x2={63} y2={y} stroke="#e8dcc0" strokeWidth={1.6} strokeDasharray="4 2" /></g>)}
      </g>
    )}
    <rect x={0} y={0} width={70} height={46} fill="none" stroke={color} strokeWidth={0} />
  </svg>
);

export const Compare = ({ start, end, title, left, right, vs = "vs", slot = "panel", color = GOLD, stamp }: { start: number; end: number; title?: string; left: Side; right: Side; vs?: string; slot?: SlotName; color?: string; stamp?: { text: string; f: number; color?: string } }) => {
  const { s } = useS();
  const lk = usePop(left.f);
  const rk = usePop(right.f);
  const sk = usePop(stamp?.f ?? 1e9, 9);
  const col = (side: Side, k: number) => (
    <div style={{ flex: 1, opacity: Math.min(1, k), transform: `translateY(${(1 - k) * 30 * s}px)`, border: `${3 * s}px solid ${side.color}`, borderRadius: 14 * s, background: "rgba(255,255,255,0.06)", padding: `${12 * s}px ${16 * s}px`, display: "flex", flexDirection: "column", gap: 8 * s }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 * s }}>
        <Glyph kind={side.icon ?? "thai"} color={side.color} s={s} />
        <div style={{ fontSize: 28 * s, fontWeight: 700, color: side.color, lineHeight: 1.2 }}>{side.tag}</div>
      </div>
      <div style={{ fontSize: 44 * s, fontWeight: 900, lineHeight: 1.2 }}>{side.text}</div>
    </div>
  );
  return (
    <Slot start={start} end={end} slot={slot} color={color} title={title}>
      {() => (
        <div style={{ display: "flex", alignItems: "stretch", gap: 14 * s, height: "100%" }}>
          {col(left, lk)}
          <div style={{ alignSelf: "center", fontSize: 34 * s, fontWeight: 900, color: RED, opacity: Math.min(1, rk) }}>{vs}</div>
          {col(right, rk)}
          {stamp && sk > 0 && (
            <div style={{ position: "absolute", left: "50%", top: "80%", transform: `translate(-50%,-50%) rotate(-4deg) scale(${2 - sk})`, opacity: Math.min(1, sk), border: `${5 * s}px solid ${stamp.color ?? RED}`, color: stamp.color ?? RED, background: "rgba(8,14,26,0.85)", borderRadius: 12 * s, padding: `${4 * s}px ${22 * s}px`, fontSize: 44 * s, fontWeight: 900, whiteSpace: "nowrap" }}>{stamp.text}</div>
          )}
        </div>
      )}
    </Slot>
  );
};

// ---------- a page that says almost nothing: title, a few lines, then a blank gap with a note ----------
export const NotePage = ({ start, end, title, gapAt, note }: { start: number; end: number; title: string; gapAt: number; note: string }) => {
  const frame = useCurrentFrame();
  const { s } = useS();
  const gk = interpolate(frame, [gapAt, gapAt + 14], [0, 1], clamp);
  return (
    <Slot start={start} end={end} color={GOLD} title={title}>
      {(lt) => (
        <div style={{ background: "#efe2c0", borderRadius: 8 * s, height: "100%", boxSizing: "border-box", padding: `${14 * s}px ${22 * s}px`, position: "relative" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const gap = i >= 2 && i <= 3;
            const w = interpolate(lt, [i * 5, i * 5 + 14], [0, [92, 80, 88, 70, 90, 60][i]], clamp);
            return <div key={i} style={{ height: 12 * s, margin: `${(i ? 16 : 4) * s}px 0`, width: `${w}%`, borderRadius: 6 * s, background: "#3a2a1a", opacity: gap ? 0.75 * (1 - gk) : 0.75 }} />;
          })}
          <div style={{ position: "absolute", left: 0, right: 0, top: "40%", textAlign: "center", opacity: gk, transform: `scale(${0.9 + 0.1 * gk})` }}>
            <span style={{ border: `${4 * s}px dashed ${RED}`, color: "#8a1a10", borderRadius: 10 * s, padding: `${2 * s}px ${22 * s}px`, fontSize: 40 * s, fontWeight: 900, background: "rgba(239,226,192,0.9)" }}>{note}</span>
          </div>
        </div>
      )}
    </Slot>
  );
};

// ---------- timeline with a "behind this line" zone ----------
export type Mark = { at: number; top: string; bottom?: string; f: number; color?: string; big?: boolean };
export const Timeline = ({ start, end, title, from, to, marks, zone, color = GOLD, blink, dotted = false, slot = "panel" }: { start: number; end: number; title?: string; from: number; to: number; marks: Mark[]; zone?: { from: number; text: string; f: number }; color?: string; blink?: { a: number; b: number; text: string; f: number }; dotted?: boolean; slot?: SlotName }) => {
  const frame = useCurrentFrame();
  const { s } = useS();
  const x = (v: number) => `${4 + ((v - from) / (to - from)) * 92}%`;
  const zk = zone ? interpolate(frame, [zone.f, zone.f + 16], [0, 1], clamp) : 0;
  const lineK = interpolate(frame, [start, start + 18], [0, 1], clamp);
  return (
    <Slot start={start} end={end} slot={slot} color={color} title={title}>
      {() => (
        <div style={{ position: "relative", height: "100%" }}>
          {zone && zk > 0 && (
            <div style={{ position: "absolute", left: x(zone.from), right: "2%", top: "8%", bottom: "8%", background: `rgba(255,201,74,${0.16 * zk})`, border: `${2 * s}px dashed rgba(255,201,74,${0.7 * zk})`, borderRadius: 12 * s }}>
              <div style={{ position: "absolute", right: 12 * s, bottom: 6 * s, fontSize: 28 * s, fontWeight: 900, color: GOLD, opacity: zk, whiteSpace: "nowrap" }}>{zone.text}</div>
            </div>
          )}
          <div style={{ position: "absolute", left: "2%", width: `${96 * lineK}%`, top: "50%", height: 0, borderTop: `${6 * s}px ${dotted ? "dotted" : "solid"} rgba(255,255,255,0.7)` }} />
          {blink && frame >= blink.f && (
            <div style={{ position: "absolute", left: x(blink.a), width: `${((blink.b - blink.a) / (to - from)) * 92}%`, top: "50%", transform: "translateY(-50%)", textAlign: "center" }}>
              <div style={{ height: 22 * s, margin: `0 ${30 * s}px`, borderRadius: 11 * s, background: RED, opacity: 0.25 + 0.75 * (Math.floor((frame - blink.f) / 12) % 2 ? 0.25 : 1) }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: -64 * s, fontSize: 46 * s, fontWeight: 900, color: "#ff6b5f", opacity: Math.floor((frame - blink.f) / 12) % 2 ? 0.35 : 1, whiteSpace: "nowrap" }}>{blink.text}</div>
            </div>
          )}
          {marks.map((m) => {
            const k = usePopRaw(frame, m.f);
            if (k <= 0) return null;
            const c = m.color ?? GOLD;
            return (
              <div key={m.top + m.at} style={{ position: "absolute", left: x(m.at), top: "50%", transform: `translate(-50%,-50%) scale(${Math.min(1.1, k)})`, display: "flex", flexDirection: "column", alignItems: "center", width: 0 }}>
                <div style={{ position: "absolute", bottom: 26 * s, fontSize: (m.big ? 44 : 34) * s, fontWeight: 900, color: c, whiteSpace: "nowrap", textAlign: "center", lineHeight: 1.15 }}>{m.top}</div>
                <div style={{ width: (m.big ? 34 : 26) * s, height: (m.big ? 34 : 26) * s, borderRadius: "50%", background: c, border: `${4 * s}px solid #fff`, flex: "none" }} />
                {m.bottom && <div style={{ position: "absolute", top: 30 * s, fontSize: 26 * s, fontWeight: 700, whiteSpace: "pre", textAlign: "center", opacity: 0.9, lineHeight: 1.2 }}>{m.bottom}</div>}
              </div>
            );
          })}
        </div>
      )}
    </Slot>
  );
};
const usePopRaw = (frame: number, f: number) => (frame < f ? 0 : interpolate(frame, [f, f + 6, f + 10], [0, 1.15, 1], clamp));

// ---------- staircase: the later the text, the heavier the wording ----------
export type Step = { year: string; text: string; f: number; color?: string };
export const Staircase = ({ start, end, steps, title, axis = "หนักขึ้น →" }: { start: number; end: number; steps: Step[]; title: string; axis?: string }) => {
  const frame = useCurrentFrame();
  const { s } = useS();
  return (
    <Slot start={start} end={end} color={RED} title={title}>
      {() => (
        <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "flex-end", gap: 10 * s, paddingLeft: 34 * s }}>
          <div style={{ position: "absolute", left: 0, bottom: 0, top: 0, width: 26 * s, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap", fontSize: 22 * s, opacity: 0.7 }}>{axis}</div>
          </div>
          {steps.map((st, i) => {
            const k = interpolate(frame, [st.f, st.f + 14], [0, 1], clamp);
            const hFull = 18 + (i / (steps.length - 1)) * 62;
            const c = st.color ?? (i === steps.length - 1 ? RED : GOLD);
            return (
              <div key={st.year} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "stretch", opacity: k > 0 ? 1 : 0.15 }}>
                <div style={{ fontSize: 26 * s, fontWeight: 900, textAlign: "center", color: c, lineHeight: 1.15, marginBottom: 6 * s, opacity: k }}>{st.text}</div>
                <div style={{ height: `${hFull * k}%`, minHeight: 4 * s, background: `linear-gradient(${c}, rgba(255,255,255,0.08))`, borderRadius: `${8 * s}px ${8 * s}px 0 0`, border: `${2 * s}px solid ${c}`, borderBottom: "none" }} />
                <div style={{ fontSize: 24 * s, fontWeight: 700, textAlign: "center", padding: `${4 * s}px 0 0`, borderTop: `${3 * s}px solid rgba(255,255,255,0.6)`, whiteSpace: "nowrap" }}>{st.year}</div>
              </div>
            );
          })}
        </div>
      )}
    </Slot>
  );
};

// ---------- the sides: "?" turns into ✓ (or into what that source says, `say`) one by one ----------
// [side, what the source is, colour, what it says (optional)]
export type Source = [string, string, string, string?];
export const SOURCES: Source[] = [
  ["ไทย", "พงศาวดาร", GOLD],
  ["จีน", "บันทึกราชวงศ์ชิง", CHINA_C],
  ["เวียดนาม", "พงศาวดารเวียดนาม", VIET_C],
  ["ฝรั่งเศส", "จดหมายบาทหลวง", BLUE],
];
export const FourSources = ({ start, end, checks, bottom, sources = SOURCES, agree = "ตรงกัน:", slot = "panel", title = "หลักฐานร่วมสมัย 4 ฝ่าย", color = GREEN }: { start: number; end: number; checks: number[]; bottom?: { text: string; f: number }; sources?: Source[]; agree?: string; slot?: SlotName; title?: string; color?: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useS();
  const bk = usePop(bottom?.f ?? 1e9);
  return (
    <Slot start={start} end={end} slot={slot} color={color} title={title}>
      {(lt) => (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 10 * s }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${sources.length}, 1fr)`, gap: 12 * s, flex: 1 }}>
            {sources.map(([name, what, c, say], i) => {
              const ck = frame < checks[i] ? 0 : spring({ frame: frame - checks[i], fps, config: { damping: 10 } });
              const ok = ck > 0;
              const ik = interpolate(lt, [i * 4, i * 4 + 10], [0, 1], clamp);
              return (
                <div key={name} style={{ opacity: ik, transform: `translateY(${(1 - ik) * 20 * s}px)`, borderRadius: 14 * s, border: `${3 * s}px solid ${c}`, background: ok ? (say ? `${c}2e` : "rgba(63,191,106,0.18)") : "rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: `${6 * s}px`, textAlign: "center" }}>
                  <div style={{ fontSize: 34 * s, fontWeight: 900, color: c, whiteSpace: "nowrap" }}>{name}</div>
                  <div style={{ fontSize: 19 * s, opacity: 0.8, lineHeight: 1.15, minHeight: 44 * s }}>{what}</div>
                  {say && ok ? (
                    <div style={{ marginTop: 4 * s, minHeight: 64 * s, display: "flex", alignItems: "center", fontSize: 38 * s, fontWeight: 900, lineHeight: 1.1, color: "#fff", transform: `scale(${0.6 + 0.4 * Math.min(1, ck)})` }}>{say}</div>
                  ) : (
                    <div style={{ width: 64 * s, height: 64 * s, borderRadius: "50%", marginTop: 4 * s, background: ok ? GREEN : "rgba(255,255,255,0.15)", fontSize: 44 * s, fontWeight: 900, lineHeight: `${64 * s}px`, transform: `scale(${ok ? 0.6 + 0.4 * ck : 1}) rotate(${ok ? (1 - ck) * -90 : 0}deg)` }}>{ok ? "✓" : "?"}</div>
                  )}
                </div>
              );
            })}
          </div>
          {bottom && (
            <div style={{ textAlign: "center", fontSize: 36 * s, fontWeight: 900, opacity: Math.min(1, bk), transform: `scale(${0.8 + 0.2 * Math.min(1, bk)})`, color: "#fff", whiteSpace: "nowrap" }}>
              <span style={{ color }}>{agree}</span> {bottom.text}
            </div>
          )}
        </div>
      )}
    </Slot>
  );
};

// ---------- 3×3 table whose answer cells keep changing ----------
export const FlickerTable = ({ start, end, rows, cols, values, rowF }: { start: number; end: number; rows: string[]; cols: string[]; values: string[]; rowF: number[] }) => {
  const frame = useCurrentFrame();
  const { s } = useS();
  return (
    <Slot start={start} end={end} color={RED} title="ตำนานฉบับต่าง ๆ เล่าว่า…" pad={18}>
      {() => (
        <div style={{ display: "grid", gridTemplateColumns: `1.35fr repeat(${cols.length}, 1fr)`, gridTemplateRows: `${34 * s}px repeat(${rows.length}, 1fr)`, gap: 6 * s, height: "100%" }}>
          <div />
          {cols.map((c) => <div key={c} style={{ fontSize: 24 * s, fontWeight: 700, textAlign: "center", opacity: 0.75, whiteSpace: "nowrap" }}>{c}</div>)}
          {rows.map((r, i) => {
            const on = frame >= rowF[i];
            return [
              <div key={r} style={{ fontSize: 28 * s, fontWeight: 900, display: "flex", alignItems: "center", color: on ? GOLD : "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>{r}</div>,
              ...cols.map((c, j) => {
                const tick = Math.floor((frame - rowF[i]) / (7 + ((i * 3 + j) % 4))) + i * 2 + j;
                const v = on ? values[(tick + i + j * 2) % values.length] : "?";
                const flash = on && (frame - rowF[i]) % (7 + ((i * 3 + j) % 4)) < 2;
                return (
                  <div key={r + c} style={{ borderRadius: 10 * s, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 * s, fontWeight: 900, background: on ? (flash ? "rgba(255,59,48,0.45)" : "rgba(255,59,48,0.16)") : "rgba(255,255,255,0.06)", border: `${2 * s}px solid ${on ? RED : "rgba(255,255,255,0.15)"}`, whiteSpace: "nowrap" }}>{v}</div>
                );
              }),
            ];
          })}
        </div>
      )}
    </Slot>
  );
};

// ---------- three questions (head slot) ----------
export const ThreeQuestions = ({ start, end, fs }: { start: number; end: number; fs: number[] }) => {
  const { s } = useS();
  const qs = [["①", "ใครเขียน"], ["②", "เมื่อไหร่"], ["③", "ให้ใครอ่าน"]];
  const ks = [usePop(fs[0]), usePop(fs[1]), usePop(fs[2])];
  return (
    <Slot start={start} end={end} slot="head" color={GOLD} title="ก่อนเชื่อหลักฐาน ถามเสมอว่า">
      {() => (
        <div style={{ display: "flex", gap: 12 * s, height: "100%", alignItems: "stretch" }}>
          {qs.map(([n, q], i) => (
            <div key={q} style={{ flex: 1, borderRadius: 14 * s, border: `${3 * s}px solid ${GOLD}`, background: "rgba(255,201,74,0.12)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: Math.min(1, ks[i]), transform: `scale(${0.7 + 0.3 * Math.min(1.05, ks[i])})` }}>
              <div style={{ fontSize: 50 * s, fontWeight: 900, color: GOLD, lineHeight: 1.1 }}>{n}</div>
              <div style={{ fontSize: 42 * s, fontWeight: 900, whiteSpace: "nowrap" }}>{q}</div>
            </div>
          ))}
        </div>
      )}
    </Slot>
  );
};

// ---------- closing poll (head slot) + follow button over the map ----------
export const Poll = ({ start, end, opts, button, sources = SOURCES, title = "คุณเชื่อหลักฐานฝั่งไหนมากที่สุด?" }: { start: number; end: number; opts: number[]; button: number; sources?: Source[]; title?: string }) => {
  const frame = useCurrentFrame();
  const { s, height } = useS();
  const bk = usePop(button, 9);
  const ks = [usePop(opts[0]), usePop(opts[1]), usePop(opts[2]), usePop(opts[3])];
  return (
    <>
      <Slot start={start} end={end} slot="head" color={GOLD} title={title} pad={18}>
        {() => (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 12 * s, height: "100%" }}>
            {sources.map(([name, what, c], i) => (
              <div key={name} style={{ border: `${4 * s}px solid ${c}`, borderRadius: 12 * s, display: "flex", alignItems: "center", gap: 14 * s, padding: `0 ${16 * s}px`, opacity: Math.min(1, ks[i]), transform: `scale(${0.8 + 0.2 * Math.min(1, ks[i])})`, background: ks[i] > 0 && frame - opts[i] < 12 ? `${c}44` : "transparent" }}>
                <div style={{ width: 46 * s, height: 46 * s, borderRadius: "50%", background: c, color: "#0a0f1a", fontSize: 30 * s, fontWeight: 900, lineHeight: `${46 * s}px`, textAlign: "center", flex: "none" }}>{String.fromCharCode(65 + i)}</div>
                <div style={{ lineHeight: 1.1 }}>
                  <div style={{ fontSize: 38 * s, fontWeight: 900 }}>{name}</div>
                  <div style={{ fontSize: 20 * s, opacity: 0.8 }}>{what}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Slot>
      {frame >= button && frame <= end && (
        <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.385, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * s, fontFamily: font }}>
          <div style={{ transform: `scale(${bk})`, background: RED, color: "#fff", borderRadius: 50 * s, padding: `${12 * s}px ${64 * s}px`, fontWeight: 900, fontSize: 50 * s, boxShadow: `0 ${8 * s}px ${30 * s}px rgba(255,59,48,0.55)` }}>ติดตาม</div>
          <div style={{ transform: `scale(${bk})`, background: "rgba(8,14,26,0.85)", color: "#fff", borderRadius: 30 * s, padding: `${4 * s}px ${24 * s}px`, fontWeight: 700, fontSize: 30 * s }}>พิมพ์บอกในคอมเมนต์ได้เลย</div>
        </div>
      )}
    </>
  );
};

// ---------- the big golden question (reprise of the opening title) ----------
// lines: [text, highlight?, colour?][] — e.g. [["สิ้นพระชนม์จริง", "", "#ff6b5f"], ["หรือหนีไป", "นครศรีฯ"]] + "?"
export const BigQuestion = ({ start, end, lines }: { start: number; end: number; lines: [string, string?, string?][] }) => {
  const frame = useCurrentFrame();
  const { s, height } = useS();
  if (frame < start || frame > end) return null;
  const k = usePopRaw(frame, start);
  const o = interpolate(frame, [end - 8, end], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.31, textAlign: "center", fontFamily: font, color: "#fff", opacity: o, transform: `scale(${0.8 + 0.2 * Math.min(1, k)})`, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.95)`, lineHeight: 1.25 }}>
      {lines.map(([a, b, c], i) => <div key={i} style={{ fontSize: 66 * s, fontWeight: 900 }}><span style={{ color: c ?? "#fff" }}>{a}</span>{b && <span style={{ color: GOLD }}>{b}</span>}</div>)}
    </div>
  );
};
