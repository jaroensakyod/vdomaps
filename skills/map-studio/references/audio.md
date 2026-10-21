# Audio: voice-over, word timing, music, loudness

## Voice-over
- User-recorded: ask for 48 kHz WAV, quiet room, one take per beat is fine.
- TTS: use whatever engine the user has an account/key for (e.g. ElevenLabs, Google Cloud TTS th-TH,
  Azure th-TH-PremwadeeNeural / NiwatNeural, OpenAI TTS). Never put API keys in the repo — read from env.
- Generate per beat so a script fix re-generates one file, and play each beat in its own `<Sequence>` —
  beat lengths then come straight from the audio, no alignment needed.

### Gemini TTS (tested, works for Thai) — `scripts/tts-gemini.mjs`
- Keys starting `AQ.` / `AIza` from Google AI Studio work with **Gemini TTS**, not with Cloud Text-to-Speech
  (that API rejects API keys: "API keys are not supported").
- `GEMINI_API_KEY=... node scripts/tts-gemini.mjs <slug> [voice] [model]` reads `src/episodes/<slug>/beats.json`
  (`[{id, text, caption?}]`), writes `public/audio/<slug>/NN.wav` + `timing.json`. Default model
  `gemini-3.8-flash-tts`, voice `Charon` (calm male narrator). List models: `GET /v1beta/models` and look for `tts`.
- **Quota:** the TTS models allow ~10 requests a minute and ~100 a day per project, even with billing on (the
  limit follows the project's usage tier). One request per beat ≈ 11 per episode ≈ 9 episodes a day.
  `BATCH=1` sends each voice's beats in **one** request (one paragraph per beat), finds the paragraphs with
  Whisper and cuts in the nearest silence (`whisper-lib.mjs`: `silences` + `snapToSilence`; Whisper alone runs
  30–80 ms late and clips the next word). Offline test on eps 2/4/5 (29 beats glued with 0.35–0.7 s gaps): every
  cut inside its gap. ~3 requests per episode. Falls back to one request per beat for a voice if the match is
  < 75 % or paragraphs overlap. On the daily cap the script stops with a message instead of waiting hours.
- Send **plain text only**. An English style instruction in the prompt is read aloud or derails the output.
- Write numbers and abbreviations as Thai words in `text` ("สองร้อยแปด", "คริสต์ศักราช"); put the digit form in
  `caption` for subtitles.
- **Verify every VO** — you cannot listen to it. `node scripts/transcribe.mjs file.wav gemini-3.8-flash` returns
  a transcript with pauses; compare it with the script, especially proper names.

## Word timing with Whisper — `scripts/align.mjs`
`npm run align -- <slug>` runs whisper.cpp locally (free, no key) on every beat file and adds
`words: [{w, s, e}]` (seconds from the beat audio start) to each entry of `timing.json`.
`<Caption words={b.words} spoken={b.spoken}>` and `npm run srt` then show each phrase when it is spoken
instead of spreading it by character count.

- **GPU (NVIDIA):** unzip an official CUDA build from github.com/ggml-org/whisper.cpp releases
  (e.g. `whisper-bin-win-cuda-11.8.0-x64.zip`) so its `Release/` folder becomes `whisper-cuda/build/bin/` (git-ignored).
  `align` then sends every pending beat through `whisper-cli` in one call: a 9–11-beat episode in ~27 s on an
  RTX 2060, vs 3–4 min on the CPU build, word starts within ~60 ms of the CPU result. `WHISPER_BIN` overrides the path.
- **No NVIDIA GPU (e.g. Intel UHD laptop):** there is no CUDA, and whisper.cpp ships no Windows Vulkan build. Use the
  official BLAS CPU build `whisper-blas-bin-x64.zip` + the `medium` model in one shared folder, then set user env vars
  `WHISPER_BIN=C:\whisper\blas\Release\whisper-cli.exe`, `WHISPER_DIR=C:\whisper`, `WHISPER_MODEL=medium`.
  `align` passes all CPU threads (`-t`). Measured on an i3-N305 / 8 GB: the 9-beat Red Cliffs VO (62 s) in 264 s,
  every beat ≥ 77 % match. large-v3 needs ~4 GB RAM and is much slower there.
- First run installs whisper.cpp into `whisper.cpp/` (git-ignored) and downloads the model. Default
  `WHISPER_MODEL=large-v3` (≈ 3 GB) — Thai needs large-v3, or medium at least. `WHISPER_VERSION` defaults
  to 1.5.5, the build Remotion ships for Windows. `WHISPER_LANG` defaults to `th`.
- The script text is kept; Whisper only lends its timing. Thai tokens are sub-word (sometimes split
  mid-character), so script and transcript are aligned character by character with an edit-distance path,
  words come from `Intl.Segmenter("th", {granularity: "word"})`, unmatched characters are interpolated.
- It prints a **match %** per beat. Below 70 % it also prints what Whisper heard: the VO probably skipped or
  misread a word — check it with `npm run transcribe` and regenerate that beat (`FORCE=1` in `tts`).
- `text` (spoken) and `caption` (on screen) may differ ("สองร้อยแปด" vs "208"): caption positions are
  mapped proportionally onto the spoken text, so digits still land at the right moment.

## Beat layout — `src/components/subs.mjs`
`buildBeats(timing, beats)` gives every beat `start/len/end` frames: `LAYOUT` = 30 fps, 12 frames lead,
8 frames between beats, 45 frames tail. Scenes, `srt.mjs` and `describe.mjs` all use it, so subtitles and
chapter times always match the render. If an episode needs other values, pass them to `buildBeats` and the
same numbers to the scripts (`--fps --lead --gap`).

## Music & SFX — `src/components/Sound.tsx`
- **SFX without licences:** `npm run sfx` synthesises `public/sfx/{whoosh,pop,hit,tick,riser,swell}.wav`
  with ffmpeg (pure maths, nothing to credit). Use `<Sfx src={SFX.whoosh} at={frame} volume={0.4} />`:
  whoosh ≈ 6 frames before a camera move, pop on labels/chips, hit on reveals, tick on counters, riser into a
  reveal, swell under a title card. Keep effects 6–10 dB under the VO (volume 0.3–0.5).
- **Music:** royalty-free with commercial use: YouTube Audio Library (check the "attribution required" flag),
  Pixabay Music, or a library the user licensed. Record the track + license in `meta.json` → `music`.
- `<Music src="music/bed.mp3" total={TOTAL_FRAMES} voice={voiceSpans(BEATS)} />` loops the track, fades it
  in/out over 30 frames and ducks it to 0.12 (≈ −18 dB) under every VO span with 10-frame ramps.

## Loudness — `scripts/loudness.mjs`
YouTube normalises to about −14 LUFS integrated. After the final render:
```bash
npm run loudness -- out/<slug>.mp4            # two-pass loudnorm to −14 LUFS / −1.5 dBTP; video copied, file replaced
npm run loudness -- out/<slug>.mp4 --check    # measure only
```
If it lands more than 1 LU short, a peak (usually an SFX hit) is limiting the gain: lower it and re-render.

## Subtitles, description, thumbnail
- `npm run srt -- <slug>` → `out/<slug>.srt`: one line ≤ 42 characters, ≥ 0.8 s per cue, timed by `words`
  when present.
- `npm run describe -- <slug>` → `out/<slug>-description.txt`. First run writes `src/episodes/<slug>/meta.json`
  to fill in: title, summary, `chapters: [{beat, title}]` (times come from the beat, so they follow the VO),
  sources (or URLs are taken from `sources.md`), map credits, music credits, tags. Warns when YouTube would
  hide the chapters (needs ≥ 3, each ≥ 10 s; the first is forced to 0:00).
- `npm run thumb -- <Slug>Thumb <slug> --headline "..." --accent "..." --frame N` → `out/<slug>-thumb.png`
  (JPG if over YouTube's 2 MB). Register a `Thumbnail` composition per format, like `MapTestThumb` in
  `Root.tsx`, with the episode's `durationInFrames` — `Freeze` cannot reach past the composition's end.
