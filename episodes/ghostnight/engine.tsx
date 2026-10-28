// ออเดอร์ตีสาม — shared episode engine (EP2 on): beats + TTS timing → shots (consecutive beats with the same scene
// play as one shot), Ken Burns + shake, vignette/grain, captions with speaker borders, VO audio.
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { buildBeats, cues, totalFrames } from "../../components/subs.mjs";
import { C, Grain, H, UI, Vignette, W } from "./kit";

export type Ctx = { f: number; d: number; F: number };
// bg: drawn under the svg inside the camera move (e.g. a Flow25DScreen) · svgStyle: CSS on the character layer only (night tint)
export type Shot = { svg: ReactNode; bg?: ReactNode; svgStyle?: CSSProperties; html?: ReactNode; zoom?: [number, number]; origin?: [number, number]; shake?: number; style?: CSSProperties };
export type Scenes = Record<string, (c: Ctx) => Shot>;
type BeatMeta = { id: string; scene: string; speaker?: string; text: string };

export const SEPIA: CSSProperties = { filter: "grayscale(0.85) sepia(0.55) contrast(1.05) brightness(0.9)" };
const BORDER: Record<string, string> = { cherd: C.cherd, tani: C.tani, boy: "#7fd0ff", mom: "#ff8fb1", fon: "#ff8fb1", momfon: "#e9b65a", praemom: "#8fd08a" };
// Ghost voices use the processed take (<id>-fx.wav: echo, lower pitch).
const FX = new Set(["tani", "mom", "boy"]);

export const makeEpisode = (beats: BeatMeta[], timing: { id: string; file: string; sec: number }[], o: { dialogue: string[]; hl: string[]; noCaption?: string[] }) => {
  const layout = { lead: 6, gap: 7, tail: 75 };
  const list = buildBeats(timing, beats, layout);
  const frames = totalFrames(list, layout);
  const meta = (id: string) => beats.find((b) => b.id === id)!;
  const at = (id: string) => list.find((b) => b.id === id)!.start;
  const endOf = (id: string) => list.find((b) => b.id === id)!.end;
  const dialogue = new Set(o.dialogue);
  const talkOf = (who: string, F: number) => {
    const b = list.find((x) => F >= x.start && F < x.end && dialogue.has(x.id));
    return b && meta(b.id).speaker === who ? 0.35 + 0.65 * Math.abs(Math.sin(F * 0.8)) : 0;
  };
  const groups: { scene: string; from: number; to: number }[] = [];
  list.forEach((b, i) => {
    const scene = meta(b.id).scene;
    const last = groups[groups.length - 1];
    if (!last || last.scene !== scene) groups.push({ scene, from: i === 0 ? 0 : b.start, to: 0 });
  });
  groups.forEach((g, i) => (g.to = i < groups.length - 1 ? groups[i + 1].from : frames));

  const ShotView = ({ g, scenes }: { g: (typeof groups)[number]; scenes: Scenes }) => {
    const f = useCurrentFrame();
    const d = g.to - g.from;
    const shot = scenes[g.scene]({ f, d, F: g.from + f });
    const [z0, z1] = shot.zoom ?? [1, 1.04];
    const z = interpolate(f, [0, d], [z0, z1]);
    const [ox, oy] = shot.origin ?? [540, 960];
    const sh = shot.shake ?? 0;
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <AbsoluteFill style={{ ...shot.style, transform: `translate(${sh ? Math.sin(f * 2.3) * sh : 0}px,${sh ? Math.cos(f * 1.9) * sh : 0}px) scale(${z})`, transformOrigin: `${ox}px ${oy}px` }}>
          {shot.bg}
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", ...shot.svgStyle }}>
            {shot.svg}
          </svg>
        </AbsoluteFill>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
          <Vignette k={0.7} />
          <Grain f={g.from + f} />
        </svg>
        {shot.html}
      </AbsoluteFill>
    );
  };

  const esc = (h: string) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const Captions = () => {
    const frame = useCurrentFrame();
    // A caption stays up through the short gap to the next beat (a 1-frame blank before a cut reads as a flicker).
    const b = list.find((x, i) => frame >= x.start && frame < Math.max(x.end + 6, list[i + 1] && list[i + 1].start - x.end <= 12 ? list[i + 1].start : 0));
    if (!b || ["hook", "title", "cta2", ...(o.noCaption ?? [])].includes(b.id)) return null;
    const cl = cues({ text: b.text, spoken: b.spoken, sec: b.len / 30, maxChars: 20 });
    const t = (frame - b.start) / 30;
    const cue = cl.find((c) => t < c.end) ?? cl[cl.length - 1];
    const border = BORDER[meta(b.id).speaker ?? "kaeng"];
    const parts = cue.text.split(new RegExp(`(${o.hl.map(esc).join("|")})`));
    return (
      <div style={{ position: "absolute", top: 1590, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 60, lineHeight: 1.35, color: "#fff", background: "rgba(10,10,14,0.86)", borderRadius: 26, padding: "10px 34px", border: border ? `5px solid ${border}` : "none", maxWidth: 960, textAlign: "center" }}>
          {parts.map((p, i) => (o.hl.includes(p) ? <span key={i} style={{ color: border ?? "#ffb03a" }}>{p}</span> : <span key={i}>{p}</span>))}
        </div>
      </div>
    );
  };

  const Voice = () => (
    <>
      {list.map((b) => {
        const fx = FX.has(meta(b.id).speaker ?? "");
        return (
          <Sequence key={b.id} from={b.start}>
            <Html5Audio src={staticFile(fx ? b.file.replace(".wav", "-fx.wav") : b.file)} volume={fx ? 1.05 : 1} />
          </Sequence>
        );
      })}
    </>
  );

  const Episode = ({ scenes, sounds }: { scenes: Scenes; sounds: ReactNode }) => (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {groups.map((g) => (
        <Sequence key={`${g.scene}-${g.from}`} from={g.from} durationInFrames={g.to - g.from}>
          <ShotView g={g} scenes={scenes} />
        </Sequence>
      ))}
      <Captions />
      <Voice />
      {sounds}
    </AbsoluteFill>
  );

  const voiceSpans = list.map((b) => [b.start, b.end] as [number, number]);
  return { list, frames, at, endOf, talkOf, voiceSpans, Episode };
};
