import { loadFont as loadAnuphan } from "@remotion/google-fonts/Anuphan";
import { loadFont as loadMitr } from "@remotion/google-fonts/Mitr";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Channel look "ประวัติศาสตร์บนแผนที่": flat cartoon icons on a cream paper map, one system for the whole video.
export const fonts = {
  body: loadAnuphan("normal", { weights: ["400", "500", "700"], subsets: ["thai", "latin"] }).fontFamily,
  num: loadMitr("normal", { weights: ["500", "600"], subsets: ["thai", "latin"] }).fontFamily,
};

export const C = {
  paper: "#e9dcbc", // sea / outside the land
  land: "#f2e7c9",
  land2: "#e6d6ae", // hills, shaded plain
  coast: "#8a6a45",
  bank: "#b08a5c", // river bank band
  water: "#7fb0c4",
  waterHi: "#a9cfdc",
  flood: "#8fbfd0",
  ink: "#33261b",
  card: "#f6edd6",
  ayut: "#2f5aa8", // Ayutthaya — indigo
  burma: "#c0392b", // Burma — vermilion
  taksin: "#d39a1c", // Phraya Tak — gold
  village: "#3f8f4a", // Bang Rachan villagers — green
  china: "#7a4b9a",
  fire: "#ff8a1f",
  skin: "#f1c79b",
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const fade = (f: number, a: number, b: number, c?: number, d?: number) =>
  c === undefined ? interpolate(f, [a, b], [0, 1], clamp) : interpolate(f, [a, b, c, d!], [0, 1, 1, 0], clamp);

// s = 1 at 1080 px short side. Everything (cards, icons, text) is sized in s.
export const useUnit = () => {
  const { width, height, fps } = useVideoConfig();
  return { width, height, fps, vertical: height > width, s: Math.min(width, height) / 1080 };
};

// Spring pop-in from `start`, optional fade-out ending at `end`. k: 0 → 1 (overshoots a little), o: opacity.
export const usePop = (start: number, end?: number, damping = 11) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = frame < start ? 0 : spring({ frame: frame - start, fps, config: { damping, mass: 0.55 } });
  const o = end === undefined ? (frame >= start ? 1 : 0) : (frame >= start ? 1 : 0) * interpolate(frame, [end - 8, end], [1, 0], clamp);
  return { frame, k, o };
};

export const cardStyle = (s: number) =>
  ({
    background: C.card,
    border: `${3 * s}px solid ${C.ink}`,
    borderRadius: 10 * s,
    boxShadow: `0 ${6 * s}px 0 rgba(51,38,27,0.25)`,
    color: C.ink,
  }) as const;
