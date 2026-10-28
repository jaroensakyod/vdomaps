// Screen overlays for ต่างกันยังไง: section chip, sentence captions, the red torn punch card, comic sound words,
// and a deadpan sound meter. All sizes are for 1080×1920.
import { loadFont as loadKanit } from "@remotion/google-fonts/Kanit";
import type { CSSProperties, ReactNode } from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

export const { fontFamily: KANIT, waitUntilDone: kanitReady } = loadKanit("normal", { weights: ["500", "700", "800"], subsets: ["thai", "latin"] });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pop = (frame: number, fps: number) => spring({ frame, fps, config: { damping: 11, stiffness: 180, mass: 0.6 } });

// Small red pill at the top: "ข้อ 1: วิธีใช้".
export const Chip = ({ text, f }: { text: string; f: number }) => {
  const { fps } = useVideoConfig();
  const s = pop(f, fps);
  return (
    <div style={{ position: "absolute", top: 150, width: "100%", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: KANIT,
          fontWeight: 700,
          fontSize: 44,
          color: "#fff",
          background: "#c8202c",
          padding: "8px 30px 12px",
          borderRadius: 14,
          boxShadow: "0 6px 0 #7a0f17, 0 10px 24px rgba(0,0,0,0.35)",
          transform: `scale(${s})`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// One sentence, centred a bit below the middle, white with a dark outline (reads on any background).
export const Caption = ({ text, f, dur }: { text: string; f: number; dur: number }) => {
  const o = interpolate(f, [0, 4, dur - 4, dur], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 1180, left: 70, right: 70, textAlign: "center", opacity: o }}>
      <span
        style={{
          fontFamily: KANIT,
          fontWeight: 700,
          fontSize: 64,
          lineHeight: 1.32,
          color: "#fff",
          WebkitTextStroke: "12px #15121a",
          paintOrder: "stroke fill",
          textShadow: "0 6px 16px rgba(0,0,0,0.45)",
        }}
      >
        {text}
      </span>
    </div>
  );
};

// Torn red card for the punchline, slams in with a slight tilt.
export const PunchCard = ({ text, f }: { text: string; f: number }) => {
  const { fps } = useVideoConfig();
  const s = pop(f, fps);
  const torn = "polygon(0% 6%, 6% 0%, 14% 5%, 24% 1%, 33% 6%, 45% 0%, 56% 5%, 67% 1%, 78% 6%, 88% 0%, 100% 5%, 97% 30%, 100% 55%, 96% 78%, 100% 96%, 90% 100%, 79% 95%, 66% 100%, 54% 95%, 42% 100%, 31% 95%, 19% 100%, 8% 95%, 0% 100%, 3% 72%, 0% 48%, 4% 24%)";
  return (
    <div style={{ position: "absolute", top: 330, width: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `scale(${0.6 + 0.4 * s}) rotate(${-4 * s}deg)`, opacity: Math.min(1, f / 3) }}>
        <div style={{ background: "#b3121e", clipPath: torn, padding: "34px 60px 44px", filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.4))" }}>
          <div style={{ fontFamily: KANIT, fontWeight: 800, fontSize: 92, lineHeight: 1.12, color: "#fff", textAlign: "center", whiteSpace: "pre-line" }}>{text}</div>
        </div>
      </div>
    </div>
  );
};

// Comic sound word ("ปู้ด!") that pops at a screen position and floats up.
export const SoundWord = ({ text, f, x, y, color = "#b6f03c", size = 150, rot = -8 }: { text: string; f: number; x: number; y: number; color?: string; size?: number; rot?: number }) => {
  const { fps } = useVideoConfig();
  if (f < 0 || f > 40) return null;
  const s = pop(f, fps);
  const o = interpolate(f, [0, 2, 28, 40], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y - f * 1.5,
        transform: `translate(-50%,-50%) scale(${s}) rotate(${rot}deg)`,
        opacity: o,
        fontFamily: KANIT,
        fontWeight: 800,
        fontSize: size,
        color,
        WebkitTextStroke: "16px #1a2a0a",
        paintOrder: "stroke fill",
      }}
    >
      {text}
    </div>
  );
};

// Deadpan lab readout under the chip: "ระดับเสียง  0 dB".
export const Meter = ({ db, f, label = "ระดับเสียง" }: { db: number; f: number; label?: string }) => {
  const bars = 12;
  const lit = Math.round((db / 100) * bars);
  const style: CSSProperties = { fontFamily: KANIT, fontWeight: 700, color: "#fff" };
  return (
    <div style={{ position: "absolute", top: 250, width: "100%", display: "flex", justifyContent: "center", opacity: Math.min(1, f / 4) }}>
      <div style={{ background: "rgba(16,14,22,0.82)", borderRadius: 16, padding: "14px 26px", display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ ...style, fontSize: 38 }}>{label}</span>
        <div style={{ display: "flex", gap: 5, alignItems: "flex-end" }}>
          {Array.from({ length: bars }, (_, i) => (
            <div key={i} style={{ width: 14, height: 18 + i * 3, borderRadius: 3, background: i < lit ? (i > 8 ? "#ff4a3a" : i > 5 ? "#ffc23a" : "#7be05a") : "rgba(255,255,255,0.15)" }} />
          ))}
        </div>
        <span style={{ ...style, fontSize: 44, minWidth: 120, textAlign: "right" }}>{db} dB</span>
      </div>
    </div>
  );
};

export const Exclaim = ({ f, x, y }: { f: number; x: number; y: number }) => {
  const { fps } = useVideoConfig();
  if (f < 0) return null;
  const s = pop(f, fps);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, fontFamily: KANIT, fontWeight: 800, fontSize: 170, color: "#ffd23a", WebkitTextStroke: "16px #2a1a00", paintOrder: "stroke fill" }}>!</div>
  );
};

export const Layer = ({ children }: { children: ReactNode }) => <div style={{ position: "absolute", inset: 0 }}>{children}</div>;
