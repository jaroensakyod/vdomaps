import type { ComponentType } from "react";

// A style pack's demo (story-studio/styles/<id>/Demo.tsx exports `demo` and `Demo`), installed into
// src/styles/<id>/ by `npm run style -- <id>`. Root registers `Style-<id>` (9:16), `Style-<id>-wide` (16:9) and
// `Style-<id>-post` (4:5, 1080×1350 page posts).
export type StyleSize = "9x16" | "16x9" | "4x5";
export type StyleDemo = {
  id: string; // "N05"
  name: string; // "หนังใหญ่"
  frames: number;
  fps?: number; // 30
  cover: number; // frame used for cover-9x16.jpg / cover-16x9.jpg
  sizes: StyleSize[]; // the layouts the demo is drawn for
};
// Root passes `cover` as a prop so scripts/gallery.mjs can read it from the composition; demos may ignore it.
export type StyleEntry = { demo: StyleDemo; Demo: ComponentType<{ cover?: number }> };
