import { Fragment, type ReactNode } from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "../../../components/Caption";
import type { Cam } from "../../../components/camera";
import { MapFrame } from "../../../components/Map";
import { person } from "./cast";
import { C, card, fade, fonts, PaperTexture, useUnit } from "./Parchment";

// The series frame: everything that makes one episode of a 60-part series look like the others.
//   brand (seal + page name, top left) · "ตอนที่ N/total" badge (top right, Reels cut only) · captions with a
//   speaker tag for character lines · credit · a "next episode" card after the last line (Reels cut only).
// Variants: "fb" = Reels (badge + next card) · "yt" = parts joined into a long cut (no badge, no card) ·
//           "thumb" = map only, for thumbnails.
export type Series = { name: string; seal: string; total: number; show: string };
export type Variant = "fb" | "yt" | "thumb";
// next = next episode title · nextQ = its hook question (instead of a generic "follow us") · ask = comment prompt
export type EpisodeMeta = { n: number; title: string; next?: string; nextQ?: [string, string]; ask?: string; credit?: string };
// One spoken line. No `speaker` = narrator; with `speaker` = a character (CAST key): caption in quotes + name tag.
export type Line = { text: string; start: number; len: number; speaker?: string };

// 9:16 layout "v2": illustration panel at 49 % (just above captions at 70 %), character card at 36 %, map focus
// raised to 40 % so map action sits in the open band between the top cards and the panel.
// 16:9: panels on the right, map focus at 36 % from the left.
export const V2 = { panel: 0.49, card: 0.36, focus: 0.4 };
export const WIDE = { focusX: 0.36 };

export const SeriesMap = ({ cam, children }: { cam: Cam; children: ReactNode }) => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return (
    <MapFrame cam={cam} focusY={vertical ? V2.focus : 0.5} focusX={vertical ? 0.5 : WIDE.focusX}>
      {children}
    </MapFrame>
  );
};

// Speaker name above the subtitle while a character's line plays.
const SpeakerTag = ({ who, start, len }: { who: string; start: number; len: number }) => {
  const frame = useCurrentFrame();
  const { s, fps, height, vertical } = useUnit();
  if (frame < start || frame >= start + len + 4) return null;
  const p = person(who);
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", left: "50%", top: vertical ? height * 0.7 - 70 * s : undefined, bottom: vertical ? undefined : 150 * s, transform: `translateX(-50%) scale(${k})`, background: p.color, color: "#fff6dd", border: `${3 * s}px solid #fff6dd`, borderRadius: 10 * s, padding: `${2 * s}px ${20 * s}px`, fontFamily: fonts.body, fontWeight: 700, fontSize: 30 * s, lineHeight: 1.45, whiteSpace: "nowrap", boxShadow: `0 ${4 * s}px ${10 * s}px rgba(40,25,10,0.4)` }}>
      {p.name}
    </div>
  );
};

const PartBadge = ({ series, n }: { series: Series; n: number }) => {
  const { s, height, width, vertical } = useUnit();
  return (
    <div style={{ position: "absolute", right: vertical ? 40 * s : 30 * s, top: vertical ? height * 0.13 : 24 * s, maxWidth: width * 0.4, ...card(s), fontFamily: fonts.body, fontSize: 22 * s, lineHeight: 1.5, padding: `${2 * s}px ${14 * s}px`, opacity: 0.85, whiteSpace: "nowrap" }}>
      {series.show} · ตอนที่ {n}/{series.total}
    </div>
  );
};

const NextCard = ({ series, ep, from }: { series: Series; ep: EpisodeMeta; from: number }) => {
  const frame = useCurrentFrame();
  const { s, fps, height, vertical } = useUnit();
  if (frame < from || !ep.next) return null;
  const k = spring({ frame: frame - from, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: vertical ? "flex-start" : "center", paddingTop: vertical ? height * 0.36 : 0, background: `rgba(42,27,14,${0.35 * fade(frame, from, from + 10)})` }}>
      <div style={{ ...card(s), fontFamily: fonts.body, textAlign: "center", padding: `${16 * s}px ${40 * s}px`, transform: `scale(${k})` }}>
        <div style={{ fontSize: 30 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ตอนที่ {ep.n + 1}/{series.total} ▶</div>
        {ep.nextQ ? (
          <div style={{ fontFamily: fonts.title, fontSize: 52 * s, lineHeight: 1.3 }}>
            {ep.nextQ[0]}
            <br />
            <span style={{ color: C.wu }}>{ep.nextQ[1]}</span>
          </div>
        ) : (
          <div style={{ fontFamily: fonts.title, fontSize: 64 * s, lineHeight: 1.35 }}>{ep.next}</div>
        )}
        <div style={{ fontSize: 24 * s, lineHeight: 1.5, opacity: 0.75 }}>{ep.nextQ ? `ตอนต่อไป: ${ep.next}` : "ตอนต่อไป"}</div>
        {ep.ask && <div style={{ marginTop: 12 * s, paddingTop: 10 * s, borderTop: `${2 * s}px dashed ${C.ink}`, fontSize: 28 * s, lineHeight: 1.45, fontWeight: 600 }}>เมนต์บอกหน่อย: {ep.ask}</div>}
      </div>
    </AbsoluteFill>
  );
};

// Channel mark: red seal + page name, top-left, both formats.
const Brand = ({ series }: { series: Series }) => {
  const { s, height, vertical } = useUnit();
  return (
    <div style={{ position: "absolute", left: vertical ? 40 * s : 30 * s, top: vertical ? height * 0.13 : 24 * s, display: "flex", alignItems: "center", gap: 10 * s, opacity: 0.9 }}>
      <div style={{ width: 52 * s, height: 52 * s, background: C.wu, color: "#fff6dd", borderRadius: 6 * s, fontFamily: "'Microsoft YaHei', 'SimSun', serif", fontSize: 17 * s, lineHeight: 1.05, display: "flex", alignItems: "center", justifyContent: "center", writingMode: "vertical-rl", boxShadow: `0 ${3 * s}px ${8 * s}px rgba(40,25,10,0.35)` }}>
        {series.seal}
      </div>
      <div style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: 24 * s, color: C.ink, lineHeight: 1.3, WebkitTextStroke: `${5 * s}px ${C.land}`, paintOrder: "stroke fill" }}>{series.name}</div>
    </div>
  );
};

const Credit = ({ text }: { text: string }) => {
  const { s, height, vertical } = useUnit();
  return <div style={{ position: "absolute", right: 26 * s, bottom: vertical ? height * 0.2 : 18 * s, fontFamily: fonts.body, fontSize: 18 * s, color: C.ink, opacity: 0.75, lineHeight: 1.4, textAlign: "right" }}>{text}</div>;
};

// One episode: paper background, the map (under the texture), overlays (above it), captions, brand, badge, end card.
// Voice audio goes in `sounds` (e.g. one <Sequence><Html5Audio/></Sequence> per line) together with the effects.
export const SeriesFrame = ({ series, ep, lines, variant = "fb", map, overlay, sounds }: { series: Series; ep: EpisodeMeta; lines: Line[]; variant?: Variant; map: ReactNode; overlay?: ReactNode; sounds?: ReactNode }) => {
  const last = lines[lines.length - 1];
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {sounds}
      {map}
      <PaperTexture />
      {variant !== "thumb" && overlay}
      {variant !== "thumb" &&
        lines.map((b, i) =>
          b.speaker ? (
            <Fragment key={i}>
              <SpeakerTag who={b.speaker} start={b.start} len={b.len} />
              <Caption text={`“${b.text}”`} start={b.start} len={b.len} font={fonts.body} color="#ffe9a8" stroke="#2a1b0e" />
            </Fragment>
          ) : (
            <Caption key={i} text={b.text} start={b.start} len={b.len} font={fonts.body} color="#fff6dd" stroke="#2a1b0e" />
          ),
        )}
      {ep.credit && <Credit text={ep.credit} />}
      {variant !== "thumb" && <Brand series={series} />}
      {variant === "fb" && <PartBadge series={series} n={ep.n} />}
      {variant === "fb" && <NextCard series={series} ep={ep} from={last.start + last.len + 4} />}
    </AbsoluteFill>
  );
};
