# Old Siam short: "อยุธยาไม่มีนาฬิกา ไม่มีตู้เย็น อยู่กันยังไง?" (10 พ.ย. 2569)

Format test for a new series in the painted-background + cartoon-cast style (inspired by an "ancient China without
electricity" channel; our own characters and our own Thai story).

- Script + sources: `SCRIPT.md` (approved). Gates passed: script ✔, style frames ✔ (`out/oldsiam/style_sheet.jpg`).
- Code: `skills/map-studio/template/src/episodes/oldsiam/`
  - `cast.tsx` นายมั่น, แมววิเชียรมาศ, mouse, fish, cowrie (SVG, posable); `props.tsx` the envoy (La Loubère) + effect marks.
  - `Short.tsx` composition `OldSiamShort` (1080x1920): 16 scenes, Ken Burns keys, word-cued pops, captions (subs.mjs).
  - `bg-jobs.json` Gemini background prompts → `public/oldsiam/bg/*.jpg` (AI art, labelled ภาพประกอบ on screen). ~$0.74.
  - Voice: Gemini TTS Charon (Thai), beats.json → timing.json; Whisper medium (C:\whisper) + `snap-words`.
- Sound: `episodes/oldsiam/audio/oldsiam_audio.py <template root> out` (reads `layout.json` exported from buildBeats):
  pentatonic score, synthesized drum/gong/fire/cat/mice/cowries, -14 LUFS.
- Render: `npx remotion render src/index.ts OldSiamShort out/oldsiam/video.mp4 --muted --gl angle --concurrency 3`,
  mux with `audio/out/mix.wav` → `out/oldsiam/oldsiam_final.mp4`, then `node scripts/check-glitch.mjs`.

## For the next episodes of this series
- Re-use the cast and props; one new background costs ~$0.07. Keep characters on the bottom third, captions at top 0.11.
- Prompts must ask for "no people, no animals, no text" and an empty ground band at the bottom.
- The tower3 painting has the tower at ~60 % of the image width: measure positions on the painting before placing marks.
- Single quotes inside `node -e '...'` break the shell: write helper scripts to files instead.
