import { Fragment, type ReactNode } from "react";
import { AbsoluteFill, Html5Audio, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { Caption } from "../../../components/Caption";
import type { Beat } from "../../../components/subs.mjs";
import { LAYOUT } from "../../../components/subs.mjs";
import { person } from "./cast";
import { C, card, CHANNEL, fade, fonts, PaperTexture, useUnit } from "./theme";

export const TOTAL_EPISODES = 60;
// "thumb" = a frame for the thumbnail: no captions, badge or end card.
export type Variant = "fb" | "yt" | "thumb";
// next = next episode title · nextQ = its hook question (shown on the fb end card instead of a generic "follow us")
// ask = a question for the comments, on the fb end card only (keeps the VO clean for the long YouTube cut)
export type EpisodeMeta = { n: number; title: string; next?: string; nextQ?: [string, string]; ask?: string; credit?: string };

// "fb" (Reels): part badge + a 2 s "next episode" card after the last line.
// "yt" (to be joined into the long YouTube cut): no badge, no card, only a short tail so parts flow together.
const TAIL = { fb: 60, yt: 12, thumb: 12 } as const;
export const episodeFrames = (beats: Beat[], variant: Variant) => beats[beats.length - 1].end + TAIL[variant];

// B.id = a beat by id; at(id, k) = the frame k (0 → 1) of the way through that beat.
export const timeline = (beats: Beat[]) => {
  const B = Object.fromEntries(beats.map((b) => [b.id, b])) as Record<string, Beat>;
  const at = (id: string, k = 0) => {
    if (!B[id]) throw new Error(`no beat "${id}"`);
    return Math.round(B[id].start + B[id].len * k);
  };
  // word(id, w) = the frame where Whisper heard word `w` (n-th occurrence) in that beat; falls back to the beat start.
  const word = (id: string, w: string, n = 0) => {
    const hit = (B[id]?.words ?? []).filter((x) => x.w === w)[n];
    return hit ? Math.round(B[id].start + hit.s * LAYOUT.fps) : at(id);
  };
  return { B, at, word };
};

export type Timeline = ReturnType<typeof timeline>;

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

const PartBadge = ({ n }: { n: number }) => {
  const { s, height, width, vertical } = useUnit();
  return (
    <div style={{ position: "absolute", right: vertical ? 40 * s : 30 * s, top: vertical ? height * 0.13 : 24 * s, maxWidth: width * 0.4, ...card(s), fontFamily: fonts.body, fontSize: 22 * s, lineHeight: 1.5, padding: `${2 * s}px ${14 * s}px`, opacity: 0.85, whiteSpace: "nowrap" }}>
      สามก๊ก · ตอนที่ {n}/{TOTAL_EPISODES}
    </div>
  );
};

const NextCard = ({ ep, from }: { ep: EpisodeMeta; from: number }) => {
  const frame = useCurrentFrame();
  const { s, fps, height, vertical } = useUnit();
  if (frame < from || !ep.next) return null;
  const k = spring({ frame: frame - from, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: vertical ? "flex-start" : "center", paddingTop: vertical ? height * 0.36 : 0, background: `rgba(42,27,14,${0.35 * fade(frame, from, from + 10)})` }}>
      <div style={{ ...card(s), fontFamily: fonts.body, textAlign: "center", padding: `${16 * s}px ${40 * s}px`, transform: `scale(${k})` }}>
        <div style={{ fontSize: 30 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ตอนที่ {ep.n + 1}/{TOTAL_EPISODES} ▶</div>
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
        {ep.ask && (
          <div style={{ marginTop: 12 * s, paddingTop: 10 * s, borderTop: `${2 * s}px dashed ${C.ink}`, fontSize: 28 * s, lineHeight: 1.45, fontWeight: 600 }}>
            เมนต์บอกหน่อย: {ep.ask}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// Channel mark: red seal + page name, top-left, both formats.
const Brand = () => {
  const { s, height, vertical } = useUnit();
  return (
    <div style={{ position: "absolute", left: vertical ? 40 * s : 30 * s, top: vertical ? height * 0.13 : 24 * s, display: "flex", alignItems: "center", gap: 10 * s, opacity: 0.9 }}>
      <div style={{ width: 52 * s, height: 52 * s, background: C.wu, color: "#fff6dd", borderRadius: 6 * s, fontFamily: "'Microsoft YaHei', 'SimSun', serif", fontSize: 17 * s, lineHeight: 1.05, display: "flex", alignItems: "center", justifyContent: "center", writingMode: "vertical-rl", boxShadow: `0 ${3 * s}px ${8 * s}px rgba(40,25,10,0.35)` }}>
        {CHANNEL.seal}
      </div>
      <div style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: 24 * s, color: C.ink, lineHeight: 1.3, WebkitTextStroke: `${5 * s}px ${C.land}`, paintOrder: "stroke fill" }}>{CHANNEL.name}</div>
    </div>
  );
};

const Credit = ({ text }: { text: string }) => {
  const { s, height, vertical } = useUnit();
  return (
    <div style={{ position: "absolute", right: 26 * s, bottom: vertical ? height * 0.2 : 18 * s, fontFamily: fonts.body, fontSize: 18 * s, color: C.ink, opacity: 0.75, lineHeight: 1.4, textAlign: "right" }}>{text}</div>
  );
};

// One episode: paper background, every VO beat as its own audio clip, the map/overlays passed as children,
// texture, captions (character lines in quotes with a speaker tag), credit, and the fb-only badge and end card.
// `map` sits under the paper texture, `overlay` above it.
export const EpisodeFrame = ({ ep, beats, variant, map, overlay, sounds }: { ep: EpisodeMeta; beats: Beat[]; variant: Variant; map: ReactNode; overlay?: ReactNode; sounds?: ReactNode }) => {
  const last = beats[beats.length - 1];
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {beats.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      {sounds}
      {map}
      <PaperTexture />
      {variant !== "thumb" && overlay /* thumbnails: map only, the headline is the overlay */}
      {variant !== "thumb" &&
        beats.map((b) =>
        b.speaker ? (
          <Fragment key={b.id}>
            <SpeakerTag who={b.speaker} start={b.start} len={b.len} />
            <Caption text={`“${b.text}”`} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={fonts.body} color="#ffe9a8" stroke="#2a1b0e" />
          </Fragment>
        ) : (
          <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={fonts.body} color="#fff6dd" stroke="#2a1b0e" />
        ),
      )}
      {ep.credit && <Credit text={ep.credit} /> /* map source + "approximate" go in the description, not on screen */}
      {variant !== "thumb" && <Brand />}
      {variant === "fb" && <PartBadge n={ep.n} />}
      {variant === "fb" && <NextCard ep={ep} from={last.end + 4} />}
    </AbsoluteFill>
  );
};
