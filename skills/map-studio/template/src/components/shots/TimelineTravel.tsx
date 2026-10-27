// Adapted from video-shotcraft "timeline-travel" (github.com/Vincentwei1021/video-shotcraft, commit 43bd349,
// Apache-2.0 — see LICENSE-video-shotcraft.txt). Changes: rewritten as one self-contained component with props,
// 9:16 layout, Thai type (Kanit), house news-card look, camera arrival on cue frames (spoken words) instead of
// one fixed 160-frame sweep, hold-then-move travel per stop.
import { Easing, interpolate, spring, useCurrentFrame } from "remotion";

// The camera glides along a horizontal time axis; at each stop a card springs up from the axis as the camera
// arrives, the big faded year drifts behind at 0.35× speed, a horizontal speed blur shows during each glide, and the
// last stop gets a push-in. Cue frames come from the voice-over (`wf(beat, "พอศอ")`), so every card lands on its word.
export type TimelineEvent = { year: string; far?: string; title: string; desc?: string; stat?: string };
export type TimelineLook = { bg: [string, string]; ink: string; dim: string; card: string; accent: string; hero: string; font: string };
export const TIMELINE_NEWS: Omit<TimelineLook, "font"> = {
  bg: ["#0d1626", "#05080f"],
  ink: "#f4efe2",
  dim: "rgba(244,239,226,0.55)",
  card: "rgba(8,14,26,0.92)",
  accent: "#ffc94a",
  hero: "#ff3b30",
};

const W = 1080;
const H = 1920;
const AXIS_Y = 1330;
const GAP = 980; // world distance between stops
const CARD_W = 860;
const CARD_H = 540;
const STEM = 46;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const TimelineTravel = ({
  events,
  cues,
  look,
  kicker,
  heading,
  travel = 24,
  from = 0,
}: {
  events: TimelineEvent[];
  /** frame (absolute) when the camera arrives at each stop */
  cues: number[];
  look: TimelineLook;
  kicker?: string;
  heading?: string;
  /** frames per glide between stops */
  travel?: number;
  /** first frame of the shot (header entrance) */
  from?: number;
}) => {
  const frame = useCurrentFrame();
  // camera: hold on stop i, then glide to i+1 so it lands on cue[i+1]; glide = slow start, fast middle, hard brake
  const camAt = (f: number) => {
    if (f <= cues[0]) return 0;
    for (let i = 1; i < cues.length; i++) {
      if (f <= cues[i]) {
        const t = interpolate(f, [cues[i] - travel, cues[i]], [0, 1], clamp);
        const e = interpolate(t, [0, 0.15, 0.88, 1], [0, 0.055, 0.9, 1], { easing: Easing.inOut(Easing.quad) });
        return (i - 1 + e) * GAP;
      }
    }
    return (cues.length - 1) * GAP;
  };
  const camX = camAt(frame);
  const vx = camAt(frame + 0.5) - camAt(frame - 0.5);
  const blur = Math.min(9, Math.abs(vx) * 0.12);
  const last = cues[cues.length - 1];
  const zoom = interpolate(frame, [last, last + 14], [1, 1.12], { ...clamp, easing: Easing.out(Easing.cubic) });
  const headIn = interpolate(frame, [from, from + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const worldW = W + GAP * (events.length - 1);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily: look.font, background: `linear-gradient(180deg, ${look.bg[0]} 0%, ${look.bg[1]} 100%)` }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 40% at 50% 45%, rgba(255,201,74,0.10) 0%, rgba(255,201,74,0) 70%)` }} />
      {/* far layer: the big year at 0.35× speed, only the nearest one readable */}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + (zoom - 1) * 0.35})`, transformOrigin: "50% 62%" }}>
        {events.map((e, i) => {
          const d = Math.abs(camX - i * GAP) / GAP;
          const op = Math.max(0, 1 - d / 0.62);
          if (op <= 0) return null;
          return (
            <div key={i} style={{ position: "absolute", left: W / 2 + i * GAP * 0.35 - camX * 0.35 - 600, width: 1200, top: 400, textAlign: "center", fontSize: 300, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", color: look.ink, opacity: 0.06 * op }}>
              {e.far ?? e.year}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "50% 62%" }}>
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id="tt-speed" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={`${blur.toFixed(2)} 0`} />
          </filter>
        </svg>
        <div style={{ position: "absolute", left: 0, top: 0, width: worldW, height: H, transform: `translateX(${(-camX).toFixed(2)}px)`, filter: blur > 0.35 ? "url(#tt-speed)" : undefined }}>
          {/* axis and minor ticks (speed reference) */}
          <div style={{ position: "absolute", left: 0, top: AXIS_Y - 2, width: worldW, height: 4, background: `linear-gradient(90deg, rgba(244,239,226,0) 0%, ${look.dim} 6%, ${look.dim} 94%, rgba(244,239,226,0) 100%)` }} />
          {Array.from({ length: (events.length - 1) * 5 + 9 }, (_, k) => k - 4).map((k) =>
            k % 5 === 0 ? null : <div key={k} style={{ position: "absolute", left: W / 2 + k * (GAP / 5) - 1.5, top: AXIS_Y - 12, width: 3, height: 24, borderRadius: 2, background: look.dim, opacity: 0.6 }} />,
          )}
          {events.map((e, i) => {
            const x = W / 2 + i * GAP;
            const hero = i === events.length - 1;
            const color = hero ? look.hero : look.accent;
            const pop = cues[i] - 6; // start rising just before the camera stops
            const s = spring({ frame: frame - pop, fps: 30, config: { damping: 11, stiffness: 160, mass: 0.9 }, durationInFrames: 26 });
            const lit = interpolate(frame, [pop, pop + 6], [0, 1], clamp);
            return (
              <div key={i} style={{ position: "absolute", left: x, top: 0 }}>
                <div style={{ position: "absolute", left: -26, top: AXIS_Y - 26, width: 52, height: 52, borderRadius: 26, background: color, opacity: 0.18, transform: `scale(${0.6 + 0.4 * lit})` }} />
                <div style={{ position: "absolute", left: -13, top: AXIS_Y - 13, width: 26, height: 26, borderRadius: 13, boxSizing: "border-box", border: `5px solid ${color}`, background: lit > 0.5 ? color : look.bg[1] }} />
                <div style={{ position: "absolute", left: -260, top: AXIS_Y + 40, width: 520, textAlign: "center", fontSize: 64, fontWeight: 900, color: lit > 0.5 ? color : look.dim }}>{e.year}</div>
                {frame >= pop && (
                  <>
                    <div style={{ position: "absolute", left: -1.5, top: AXIS_Y - 14 - STEM * Math.min(1, s), width: 3, height: STEM * Math.min(1, s), background: color, opacity: 0.7 }} />
                    <div style={{ position: "absolute", left: -CARD_W / 2, top: AXIS_Y - 14 - STEM - CARD_H, transform: `scaleY(${s}) scaleX(${0.85 + 0.15 * s})`, transformOrigin: "50% 100%", opacity: Math.min(1, s * 2) }}>
                      <div style={{ width: CARD_W, height: CARD_H, boxSizing: "border-box", borderRadius: 26, padding: "38px 44px", background: look.card, borderTop: `10px solid ${color}`, boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 2px ${hero ? "rgba(255,59,48,0.45)" : "rgba(255,201,74,0.18)"}`, display: "flex", flexDirection: "column", color: look.ink }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ padding: "4px 20px", borderRadius: 12, background: color, color: hero ? "#fff" : "#1a1206", fontSize: 38, fontWeight: 900 }}>{e.year}</div>
                        </div>
                        <div style={{ marginTop: 22, fontSize: 70, fontWeight: 900, lineHeight: 1.2 }}>{e.title}</div>
                        {e.desc && <div style={{ marginTop: 14, fontSize: 42, lineHeight: 1.4, color: look.dim }}>{e.desc}</div>}
                        {e.stat && <div style={{ marginTop: "auto", fontSize: 50, fontWeight: 900, color }}>{e.stat}</div>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {(kicker || heading) && (
        <div style={{ position: "absolute", left: 70, right: 70, top: 130, opacity: headIn, transform: `translateY(${(1 - headIn) * 10}px)` }}>
          {kicker && <div style={{ fontSize: 40, fontWeight: 700, color: look.accent, letterSpacing: "0.04em" }}>{kicker}</div>}
          {heading && <div style={{ marginTop: 4, fontSize: 76, fontWeight: 900, color: look.ink, lineHeight: 1.15 }}>{heading}</div>}
        </div>
      )}
    </div>
  );
};
