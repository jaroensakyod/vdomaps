# Workflow — one video, 8 steps, 3 gates

## 1. Brief
Get from the user (ask only what is missing):
- Topic / question the video answers ("ทำไมกรุงเทพฯ น้ำท่วมง่าย")
- Format: long-form 16:9 (target minutes) or Short 9:16 (60–95 s), or both from the same scenes
- Language of VO and on-screen labels
- Style: an existing locked `project/style.json`, a style id from `styles.md`, or a reference clip/channel
- Voice: TTS engine/voice, or the user records it

## 2. Research
- Collect facts from at least 2 independent sources per key claim. Prefer primary sources (government data,
  academic papers, official histories) over blogs.
- Write `src/episodes/<slug>/sources.md`: claim → source URL → note on certainty.
- List every map layer the story needs (countries, provinces, rivers, DEM, historical borders, cities...).

## 3. Script  ⛔ GATE 1 — wait for approval
Write `script.md` as a table of beats:

| # | VO line | On screen (map action) | Data layer | ~sec |
|---|---|---|---|---|

Follow `pacing.md`. Mark every approximate geography with *(approx.)*. Present the script and wait.

## 4. Data
- Fetch only the layers the beats use (see `data-sources.md`), clip to the area of interest, simplify,
  save as small TopoJSON in `public/data/`. Target < 2 MB per layer.
- Record each layer's credit line in `sources.md`.

## 5. Style frame  ⛔ GATE 2 — wait for approval
- If no locked style: propose 2–3 styles from `styles.md` that fit the topic, render one still each
  (`npm run still`) of the same key beat, let the user choose. Write the choice to `project/style.json`.
- Render stills of 3–5 key beats in the chosen style (both aspect ratios if both are needed).
- Show the stills. Fix feedback on stills — they are cheap; full renders are not.

## 6. Voice & timing
- Generate or receive the VO (`public/audio/vo.wav`). See `audio.md`.
- `npm run align -- <slug>` adds word timing to `timing.json` (whisper.cpp, local). Fix any beat with a low
  match % before building scenes. Beat frames come from `buildBeats()` in `src/components/subs.mjs`.

## 7. Build & render
- Build scenes in `Scenes.tsx` with components from `src/components/`. Every animation is driven by
  `useCurrentFrame()` and timing.json — never by wall-clock or CSS animations.
- Preview with `npm run dev` (Remotion Studio). Spot-check with stills at beat boundaries.
- Render draft at lower quality (`--scale=0.5`) for review if the video is long.

## 8. Deliver  ⛔ GATE 3 — user reviews the final render
- Final render (`--crf 18`), then `npm run loudness -- out/<slug>.mp4` (−14 LUFS), `npm run srt -- <slug>`,
  `npm run describe -- <slug>` (chapters, sources, map + music credits) and `npm run thumb -- …`. See `audio.md`.
- Hand over file paths. Do not upload.

## Re-using for the next episode
Copy the episode folder, keep `project/style.json` and the components; only the script, data and timing change.
