import type { ReactNode } from "react";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import { V2 } from "./Layout";
import { C, fonts } from "./theme";

// House standard (SKILL.md, 21 Oct 2026): a new picture every 3–4 s, cued on the spoken word. A Shot list is one
// illustration panel after another in the series' ink-on-paper style; each starts on its cue frame and the outgoing
// one stays 14 frames past the next one's start, so the map never blinks through between panels.
export const OVERLAP = 14;
// 9:16: the panel sits at the bottom, just above the captions (layout v2, kit/Layout.tsx).
export const SLOT = V2.panel;

export type Shot = {
  id: string;
  at: number; // first frame (cue word)
  anchor: [number, number];
  draw: (g: InsetGeom, start: number) => ReactNode;
  sky?: [string, string];
  label?: string; // default "ภาพประกอบ"
  until?: number; // last frame for the final shot of a run (default: next shot's start + OVERLAP)
  top?: number; // this shot's 9:16 slot, when a taller card sits above it
};

export const Shots = ({ items, top = SLOT }: { items: Shot[]; top?: number }) => (
  <>
    {items.map((s, i) => {
      const next = items[i + 1];
      const end = s.until ?? (next ? next.at + OVERLAP : s.at + 90);
      return (
        <InsetPanel key={s.id} id={s.id} anchor={s.anchor} label={s.label ?? "ภาพประกอบ"} start={s.at} end={end} sky={s.sky ?? ["#e9d7a6", "#cdb27a"]} font={fonts.body} accent={C.wu} top={s.top ?? top}>
          {(g) => s.draw(g, s.at)}
        </InsetPanel>
      );
    })}
  </>
);
