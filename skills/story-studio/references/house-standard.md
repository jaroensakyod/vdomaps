# House standard (every style)

The rules that made the long-form channels work. Styles change the look; these stay.

1. **A new picture every 3–4 s, cued on the spoken word.** Use Whisper word timing: `wf(beat, "คำ")` returns the
   frame a word is spoken. Roughly one illustrated scene per sentence plus map moves, arrows, pins and counters in
   between. A 10-minute video has ~180 visual changes, 60–70 of them illustrated scenes. One static picture for a
   whole beat is too few.
2. **Captions in sync.** After `npm run align -- <slug>` always run `node scripts/snap-words.mjs <slug>` (Whisper
   puts word starts 0.3–0.5 s early). `caption` (on screen) and `text` (spoken) in `beats.json` must have the same
   number of space-separated tokens ("พ.ศ. 2310" ↔ "พอศอ สองพันสามร้อยสิบ").
3. **Check the voice.** Batch TTS sometimes drops the opening words of a beat. Compare the "heard" text from
   `align` with `text`; re-voice any beat that lost words.
4. **No flicker.** Consecutive panels overlap ~14 frames (outgoing `end` = incoming `start + 14`). Final renders
   use `--gl=angle`, then `node scripts/check-glitch.mjs out/<file>.mp4` must report 0 glitch frames.
5. **Test first.** Render a 10–15 s test in the final look before building a whole video.
6. **Credits.** Map and imagery credits go in the video description (`npm run describe`), not on screen.
7. **Illustrated scenes have depth, light and life** (`src/components/Scene.tsx`): at least three layers moving at
   different speeds (far × 0.2, mid × 0.5–0.7, foreground × 1.6) inside `<Depth>`; a sky gradient and a `Glow`
   (sun, moon or fire); jointed `Fighter`s that walk, strike or breathe, with ground shadows; impacts with `Shot`
   (flash, smoke, dust) plus `impactAt()` shake and an SFX hit on the same frame. Never flat cut-outs sliding over
   one background. At most 2 uses of the same scene per episode.
8. **Realistic sound, narration wins.** Story events use recorded effects from the house library
   (`sfx/library.json`, `npm run sfx-lib`, `<Hit id at>`), every scene has an ambience `<Bed>`, and effects sit
   well under the voice from the first mix (see `references/sound.md`). Synthetic `SFX.*` sounds are for UI moments
   only.
9. **Honest pictures.** Simulated or approximate content carries an on-screen label: "ภาพประกอบ" on illustration
   panels, "ภาพจำลอง" on simulated data, "แนวโดยประมาณ" on approximate borders and routes.
