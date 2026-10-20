import { interpolate, useVideoConfig } from "remotion";
import { C as BASE } from "../../redcliffs/Parchment";

// Series look = style S13 parchment from ศึกผาแดง. Map layers and labels come straight from there.
export { Badge, fonts, InkLabel, land, PaperMap, PaperTexture, PaperTextureLive } from "../../redcliffs/Parchment";

// Faction colours. The three kingdoms keep the colours viewers already learned; early warlords get muted ones.
export const C = {
  ...BASE,
  han: "#9a7b2f", // Han court
  yellow: "#c9a227", // Yellow Turbans
  dong: "#6b3f6e", // Dong Zhuo
  yuan: "#7a5230", // Yuan Shao / Yuan Shu
  lvbu: "#8c2f4f", // Lü Bu
  jin: "#4a4a52", // Jin (the Sima)
};

// The page: name on screen + a red seal, on every episode in both formats.
export const CHANNEL = { name: "สามก๊กบนแผนที่", seal: "三國圖", tagline: "นิยาย vs ความจริง ดูครั้งเดียวเข้าใจทั้งศึก" };

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0 → 1 between a and b; with c, d also back to 0 between c and d.
export const fade = (f: number, a: number, b: number, c?: number, d?: number) =>
  c === undefined ? interpolate(f, [a, b], [0, 1], clamp) : interpolate(f, [a, b, c, d!], [0, 1, 1, 0], clamp);

// Overlay unit. 9:16 is watched on phones, so cards and text are 1.3× larger there.
export const useUnit = () => {
  const { width, height, fps } = useVideoConfig();
  const vertical = height > width;
  return { width, height, fps, vertical, s: (Math.min(width, height) / 1080) * (vertical ? 1.3 : 1) };
};

export const card = (s: number) =>
  ({
    background: "rgba(239,225,187,0.94)",
    border: `${3 * s}px solid ${BASE.ink}`,
    boxShadow: `0 ${8 * s}px ${24 * s}px rgba(40,25,10,0.4)`,
    color: BASE.ink,
  }) as const;
