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
- Send **plain text only**. An English style instruction in the prompt is read aloud or derails the output.
- Write numbers and abbreviations as Thai words in `text` ("สองร้อยแปด", "คริสต์ศักราช"); put the digit form in
  `caption` for subtitles.
- **Verify every VO** — you cannot listen to it. `node scripts/transcribe.mjs file.wav gemini-3.8-flash` returns
  a transcript with pauses; compare it with the script, especially proper names.

## Word timing with Whisper
Use `@remotion/install-whisper-cpp` (whisper.cpp, runs locally):

```ts
import { installWhisperCpp, downloadWhisperModel, transcribe, toCaptions } from "@remotion/install-whisper-cpp";
await installWhisperCpp({ to: "whisper.cpp", version: "1.5.5" });
await downloadWhisperModel({ model: "large-v3", folder: "whisper.cpp" }); // Thai needs large-v3 (or medium at least)
// input must be 16 kHz mono WAV: ffmpeg -i vo.wav -ar 16000 -ac 1 vo16k.wav
const out = await transcribe({ inputPath: "vo16k.wav", whisperPath: "whisper.cpp", model: "large-v3",
  tokenLevelTimestamps: true, language: "th" });
const { captions } = toCaptions({ whisperCppOutput: out }); // [{text,startMs,endMs}]
```

- Thai has no spaces: Whisper tokens are sub-word. Since you **know the script**, align it rather than trust
  the transcript: walk script words (segment with `Intl.Segmenter("th", {granularity:"word"})`) and assign each
  the time of the Whisper tokens that spell it. Keep the script text for captions, only borrow timing.
- Save `timing.json`: `{ beats: [{id, startMs}], words: [{text, startMs, endMs}] }`.
- Convert to frames: `Math.round(ms / 1000 * fps)`.

## Music & SFX
- Royalty-free with commercial use: YouTube Audio Library (check "attribution required" flag), Pixabay Music,
  or licensed libraries the user owns. Record the track + license in `sources.md`.
- Duck music under VO: −18 to −22 dB relative to VO; in Remotion use `<Audio volume={(f) => ...}>`.

## Loudness (final check)
YouTube normalises to about −14 LUFS integrated. Measure and correct:
```bash
ffmpeg -i out/video.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=summary -f null -
# then two-pass loudnorm or adjust gain on the mix
```

## Subtitles
Write `.srt` from `timing.json` in chunks of ≤ 42 characters / ≤ 2 lines, min 0.8 s per cue.
