import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { StyleDemo } from "../types";

// <ID> <name>: a 10–20 s scene that shows the style's signature moves. Kit components live in ./kit/.
export const demo: StyleDemo = { id: "<ID>", name: "<ชื่อไทย>", frames: 300, cover: 150, sizes: ["9x16", "16x9"] };

export const Demo = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#111" }}>{frame}</AbsoluteFill>;
};
