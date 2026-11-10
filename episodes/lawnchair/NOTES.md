# Lawn chair short: build notes (2026-11-09)

First short made with the cartoon-3d-short skill (cloned from github.com/mromidev/claude-animated-shorts, installed
in ~/.claude/skills/cartoon-3d-short).

## Where things are
- Script + facts: `SCRIPT.md` (this folder).
- Voice: Gemini TTS, voice Charon, 15 beats → `skills/map-studio/template/src/episodes/lawnchair/beats.json`;
  beats joined at 1.15× tempo with `build-voice.mjs` → `public/lawnchair/voice.wav` (70.0 s) + `words.json`.
- Word timing: whisper.cpp base.en (model in `D:\whisper`), `WHISPER_MODEL=base.en WHISPER_LANG=en WHISPER_DIR=D:/whisper node scripts/align.mjs lawnchair`.
- Picture: `skills/map-studio/template/src/episodes/lawnchair/` (composition `LawnChairShort`, 2101 frames).
  - `story.ts` shots, chair flight, cameras, kicks, lens blur. `world.ts` the whole world. `cast.ts` characters/effects.
  - `toon.ts` gained: glasses, tie, `squint`/`worried` faces, props (pellet gun, soda, ticket, rule book, ball, point).
  - The rest (ink, lens blur, grade, shade, paint, cardshade, build) is the skill template unchanged.
- Stills: `REMOTION_TMP=D:/remotion-tmp node scripts/short-stills.mjs out/lawnchair/<dir>/x_ <frames> 0.5`,
  contact sheets with `py scripts/still-sheet.py <dir> <prefix>`.
- Sound: `episodes/lawnchair/audio/lawnchair_audio.py <voice.wav> <words.json> <outdir>` (needs scipy):
  original score + synthesized SFX + ducking, -15 LUFS, -1.2 dBTP. Cue list in `out/cues.md`.
- Final: `out/lawnchair/video.mp4` (2K render) muxed with `mix.wav` → `out/lawnchair/lawnchair_final.mp4`.

## Lessons
- `@react-three/postprocessing` (3.2.2, three 0.187, R3F 9.8) rendered a fully transparent canvas under Remotion.
  The fix is a hand-built `postprocessing` EffectComposer driven from `useFrame(..., 1)` (see `Short.tsx`).
- Kenney GLBs are not in the skill repo; this episode builds everything procedurally (no download needed).
- The copied template files are CRLF: normalise to LF before patching them with exact-string replacements.
- Cameras that follow a fast object (the airliner) must take its position per frame, not at the key frame.
