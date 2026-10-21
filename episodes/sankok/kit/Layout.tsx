import { createContext, useContext, type ReactNode } from "react";
import { useVideoConfig } from "remotion";
import type { Cam } from "../../../components/camera";
import { MapFrame } from "../../../components/Map";

// 9:16 screen layout per episode.
//   "v1" (eps 1–5): character card at 57 %, illustration panels in the middle of the map.
//   "v2" (eps 6+, user request 21 Oct 2026): the illustration panel sits at the bottom, just above the captions,
//        the character card moves above it, and the map's focus point rises to 40 % so the map action stays in the
//        open band between the top cards and the panel.
export type Layout = "v1" | "v2";
const Ctx = createContext<Layout>("v1");
export const LayoutProvider = ({ layout, children }: { layout: Layout; children: ReactNode }) => <Ctx.Provider value={layout}>{children}</Ctx.Provider>;
export const useLayout = () => useContext(Ctx);

export const V2 = { panel: 0.49, card: 0.36, focus: 0.4 };

// MapFrame with the layout's focus point (9:16 only).
export const SankokMap = ({ cam, children }: { cam: Cam; children: ReactNode }) => {
  const { width, height } = useVideoConfig();
  const v2 = useLayout() === "v2" && height > width;
  return (
    <MapFrame cam={cam} focusY={v2 ? V2.focus : 0.5}>
      {children}
    </MapFrame>
  );
};
