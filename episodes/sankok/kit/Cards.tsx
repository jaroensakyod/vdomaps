import type { ReactNode } from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { person } from "./cast";
import { useLayout, V2 } from "./Layout";
import { C, card, clamp, fade, fonts, useUnit } from "./theme";

const portrait = (img: string) => staticFile(`portraits/sankok/${img}.jpg`);

// Overlay cards shared by every episode. 16:9 puts cards on the right; 9:16 in the upper third, clear of the
// top UI band and the captions at 70% height.

// Question title in the hook: small episode name on top, the hook question below (second line in red).
export const TitleCard = ({ kicker, lines, from, to }: { kicker: string; lines: [string, string]; from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { s, height, vertical } = useUnit();
  const o = fade(frame, from, from + 10, to - 12, to);
  if (o <= 0) return null;
  const y = interpolate(frame, [from, from + 20], [24, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: vertical ? height * 0.2 : 70 * s, opacity: o }}>
      <div style={{ ...card(s), fontFamily: fonts.body, transform: `translateY(${y * s}px)`, textAlign: "center", padding: `${12 * s}px ${44 * s}px ${16 * s}px`, outline: `${2 * s}px solid ${C.ink}`, outlineOffset: `${6 * s}px` }}>
        <div style={{ fontSize: 28 * s, color: C.wu, fontWeight: 700, lineHeight: 1.5 }}>{kicker}</div>
        <div style={{ fontFamily: fonts.title, fontSize: (vertical ? 60 : 80) * s, lineHeight: 1.3 }}>
          {lines[0]}
          <br />
          <span style={{ color: C.wu }}>{lines[1]}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Generic paper card that pops in at `from` and fades out at `to`.
export const SideCard = ({ from, to, children, tilt = -2, width = 540 }: { from: number; to: number; children: ReactNode; tilt?: number; width?: number }) => {
  const frame = useCurrentFrame();
  const { s, fps, height, vertical } = useUnit();
  const o = fade(frame, from, from + 8, to - 10, to);
  if (o <= 0) return null;
  const k = spring({ frame: frame - from, fps, config: { damping: 13 } });
  return (
    <AbsoluteFill style={{ alignItems: vertical ? "center" : "flex-end", justifyContent: vertical ? "flex-start" : "center", paddingTop: vertical ? height * 0.2 : 0, paddingRight: vertical ? 0 : 90 * s, opacity: o }}>
      <div style={{ ...card(s), fontFamily: fonts.body, width: width * s, padding: `${22 * s}px ${34 * s}px`, transform: `scale(${0.8 + 0.2 * k}) rotate(${tilt * k}deg)`, position: "relative" }}>{children}</div>
    </AbsoluteFill>
  );
};

// Square red seal in the corner of a SideCard (e.g. 軍令狀 on a pledge).
export const Seal = ({ text, at, color = C.wu }: { text: string; at: number; color?: string }) => {
  const frame = useCurrentFrame();
  const { s, fps } = useUnit();
  if (frame < at) return null;
  const k = spring({ frame: frame - at, fps, config: { damping: 9 } });
  return (
    <div style={{ position: "absolute", right: -34 * s, top: -34 * s, width: 104 * s, height: 104 * s, background: "rgba(239,225,187,0.9)", border: `${5 * s}px solid ${color}`, color, borderRadius: 10 * s, fontSize: 34 * s, fontFamily: "'Microsoft YaHei', 'SimSun', serif", display: "flex", alignItems: "center", justifyContent: "center", writingMode: "vertical-rl", transform: `scale(${k}) rotate(-12deg)`, opacity: Math.min(1, k) * 0.92 }}>
      {text}
    </div>
  );
};

// Character card the first time someone appears: Thai name, Chinese name, one-line role, faction colour.
export const CharacterCard = ({ who, from, to, role }: { who: string; from: number; to: number; role?: string }) => {
  const frame = useCurrentFrame();
  const { s, fps, width, height, vertical } = useUnit();
  const p = person(who);
  const cardTop = useLayout() === "v2" ? V2.card : 0.57;
  const o = fade(frame, from, from + 6, to - 8, to);
  if (o <= 0) return null;
  const k = spring({ frame: frame - from, fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", left: vertical ? width / 2 : 70 * s, top: vertical ? height * cardTop : undefined, bottom: vertical ? undefined : 170 * s, transform: `${vertical ? "translateX(-50%) " : ""}translateY(${(1 - k) * 30 * s}px)`, opacity: o, ...card(s), fontFamily: fonts.body, display: "flex", alignItems: "center", gap: 18 * s, padding: `${10 * s}px ${28 * s}px ${10 * s}px ${12 * s}px`, borderLeft: `${14 * s}px solid ${p.color}`, whiteSpace: "nowrap" }}>
      {p.img && <Img src={portrait(p.img)} style={{ width: 150 * s, height: 150 * s, objectFit: "cover", borderRadius: 10 * s, border: `${3 * s}px solid ${C.ink}` }} />}
      <div style={{ fontFamily: "'Microsoft YaHei', 'SimSun', serif", fontSize: 40 * s, color: p.color, writingMode: "vertical-rl", lineHeight: 1 }}>{p.zh}</div>
      <div>
        <div style={{ fontFamily: fonts.title, fontSize: 48 * s, lineHeight: 1.3 }}>{p.name}</div>
        <div style={{ fontSize: 26 * s, lineHeight: 1.4, opacity: 0.8 }}>{role ?? p.role}</div>
      </div>
    </div>
  );
};

// Large painted portrait while a character speaks: slow push-in, name plate, "ภาพประกอบ" (AI art) label.
// 9:16: upper middle, above the speaker tag; 16:9: left side.
export const PortraitCard = ({ who, from, to }: { who: string; from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { s, fps, height, vertical } = useUnit();
  const p = person(who);
  const o = fade(frame, from, from + 6, to - 8, to);
  if (o <= 0 || !p.img) return null;
  const k = spring({ frame: frame - from, fps, config: { damping: 13 } });
  const zoom = interpolate(frame, [from, to], [1, 1.08], clamp);
  const size = (vertical ? 400 : 440) * s;
  return (
    <AbsoluteFill style={{ alignItems: vertical ? "center" : "flex-start", justifyContent: "flex-start", padding: vertical ? `${height * 0.2}px 0 0` : `${110 * s}px 0 0 ${70 * s}px`, opacity: o }}>
      <div style={{ ...card(s), padding: 10 * s, transform: `scale(${0.85 + 0.15 * k}) rotate(${-1.5 * k}deg)`, position: "relative" }}>
        <div style={{ width: size, height: size, overflow: "hidden", borderRadius: 6 * s, border: `${2 * s}px solid ${C.ink}` }}>
          <Img src={portrait(p.img)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
        </div>
        <div style={{ position: "absolute", left: 20 * s, top: 20 * s, background: "rgba(42,27,14,0.7)", color: "#fff6dd", fontFamily: fonts.body, fontSize: 16 * s, lineHeight: 1.4, padding: `${1 * s}px ${10 * s}px`, borderRadius: 6 * s }}>ภาพประกอบ</div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 14 * s, paddingTop: 6 * s, fontFamily: fonts.body }}>
          <span style={{ fontFamily: fonts.title, fontSize: 44 * s, lineHeight: 1.3, color: C.ink, borderBottom: `${5 * s}px solid ${p.color}` }}>{p.name}</span>
          <span style={{ fontFamily: "'Microsoft YaHei', 'SimSun', serif", fontSize: 30 * s, opacity: 0.75 }}>{p.zh}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Big number card (counter, headcount, distance…). `value` is computed by the caller per frame.
export const StatCard = ({ label, value, sub, from, to, color = C.ink }: { label: string; value: string; sub?: string; from: number; to: number; color?: string }) => {
  const frame = useCurrentFrame();
  const { s, fps, height, vertical } = useUnit();
  const o = fade(frame, from, from + 6, to - 8, to);
  if (o <= 0) return null;
  const k = spring({ frame: frame - from, fps, config: { damping: 13 } });
  return (
    <AbsoluteFill style={{ alignItems: vertical ? "center" : "flex-start", justifyContent: "flex-start", padding: vertical ? `${height * 0.2}px 0 0` : `${100 * s}px 0 0 ${70 * s}px`, opacity: o }}>
      <div style={{ ...card(s), fontFamily: fonts.body, textAlign: "center", padding: `${12 * s}px ${36 * s}px`, transform: `scale(${0.85 + 0.15 * k})` }}>
        <div style={{ fontSize: 30 * s, fontWeight: 600, lineHeight: 1.5 }}>{label}</div>
        <div style={{ fontSize: 88 * s, fontWeight: 700, lineHeight: 1.2, fontVariantNumeric: "tabular-nums", color }}>{value}</div>
        {sub && <div style={{ fontSize: 26 * s, lineHeight: 1.5, opacity: 0.75 }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

// The series' signature twist: an "ในนิยาย" stamp slams onto the frame, parks in a corner, and a two-row
// novel-vs-record card follows. Rows appear at their own frames.
// source = short citation under the row (e.g. "จดหมายเหตุสามก๊ก · ภาคเล่าปี่") — viewers trust a named source.
export type CompareRow = { label: string; text: ReactNode; color: string; at: number; source?: string };
export const NovelStamp = ({ at, end, text = "ในนิยาย", rows = [] }: { at: number; end: number; text?: string; rows?: CompareRow[] }) => {
  const frame = useCurrentFrame();
  const { s, fps, width, height, vertical } = useUnit();
  const o = fade(frame, at, at + 4, end - 8, end);
  if (o <= 0) return null;
  const hit = spring({ frame: frame - at, fps, config: { damping: 10, mass: 0.7 } });
  const park = interpolate(frame, [at + 34, at + 52], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const x = width / 2 + ((vertical ? width / 2 : width - 230 * s) - width / 2) * park;
  const y = height * 0.45 + ((vertical ? height * 0.14 : 110 * s) - height * 0.45) * park;
  const k = (2.2 - 1.2 * hit) * (1 - 0.45 * park);
  return (
    <AbsoluteFill style={{ opacity: o, fontFamily: fonts.body, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${k}) rotate(-10deg)`, border: `${6 * s}px solid ${C.wu}`, color: C.wu, fontFamily: fonts.title, fontSize: 64 * s, lineHeight: 1.3, padding: `${4 * s}px ${26 * s}px`, borderRadius: 12 * s, background: "rgba(239,225,187,0.6)", whiteSpace: "nowrap", opacity: Math.min(1, hit * 1.4) }}>
        {text}
      </div>
      <div style={{ position: "absolute", left: vertical ? 60 * s : 80 * s, right: vertical ? 60 * s : undefined, top: vertical ? height * 0.22 : height * 0.5, display: "flex", flexDirection: "column", gap: 14 * s }}>
        {rows.map((r) => {
          if (frame < r.at) return null;
          const p = spring({ frame: frame - r.at, fps, config: { damping: 14 } });
          return (
            <div key={r.label} style={{ ...card(s), display: "flex", alignItems: "center", gap: 18 * s, padding: `${10 * s}px ${24 * s}px`, opacity: p, transform: `translateX(${(1 - p) * -50 * s}px)`, borderLeft: `${14 * s}px solid ${r.color}` }}>
              <div style={{ fontSize: 28 * s, fontWeight: 700, color: r.color, width: 150 * s, lineHeight: 1.4, flex: "none" }}>{r.label}</div>
              <div style={{ fontSize: 30 * s, lineHeight: 1.45 }}>
                {r.text}
                {r.source && <div style={{ fontSize: 20 * s, lineHeight: 1.4, opacity: 0.65 }}>{r.source}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Strength bars ("Total War" style): one bar per side, length ∝ value, growing in at `from`. Values may change
// per frame (casualties), so the caller computes them.
export type ForceSide = { name: string; color: string; value: number; label?: string };
export const ForceBars = ({ title, sides, from, to, max }: { title?: string; sides: ForceSide[]; from: number; to: number; max?: number }) => {
  const frame = useCurrentFrame();
  const { s, fps, height, vertical } = useUnit();
  const o = fade(frame, from, from + 6, to - 8, to);
  if (o <= 0) return null;
  const top = max ?? Math.max(...sides.map((x) => x.value));
  const w = (vertical ? 640 : 560) * s;
  return (
    <AbsoluteFill style={{ alignItems: vertical ? "center" : "flex-start", padding: vertical ? `${height * 0.2}px 0 0` : `${110 * s}px 0 0 ${70 * s}px`, opacity: o }}>
      <div style={{ ...card(s), fontFamily: fonts.body, width: w + 60 * s, padding: `${14 * s}px ${30 * s}px` }}>
        {title && <div style={{ fontSize: 28 * s, fontWeight: 700, lineHeight: 1.5 }}>{title}</div>}
        {sides.map((x, i) => {
          const k = spring({ frame: frame - from - i * 6, fps, config: { damping: 16 } });
          return (
            <div key={x.name} style={{ marginTop: 8 * s }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26 * s, lineHeight: 1.45 }}>
                <span style={{ fontWeight: 700, color: x.color }}>{x.name}</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{x.label ?? Math.round(x.value).toLocaleString("th-TH")}</span>
              </div>
              <div style={{ height: 22 * s, background: "rgba(59,42,26,0.12)", border: `${2 * s}px solid ${C.ink}` }}>
                <div style={{ height: "100%", width: `${(x.value / top) * 100 * Math.min(1, k)}%`, background: x.color, minWidth: 4 * s }} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
