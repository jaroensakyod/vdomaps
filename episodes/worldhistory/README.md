# History on the Map (English channel)

9:16 vertical long-form, ~10 min, news look (House standard in `skills/map-studio/SKILL.md`). English only.
Plan, format and topic list: `SERIES.md`.

Episode 1 **Napoleon invades Russia, 1812**: "Where did Europe's greatest army go?" (9:28, 80 beats).

| File / folder | Content |
|---|---|
| `ep01/script.md` | Approved script, 80 beats, with what is on screen |
| `ep01/sources.md` | Every fact with sources and confidence (checked 21 Oct 2026) |
| `ep01/beats.json` | `caption` (on screen) and `text` (spoken; numbers as hyphenated words from `speak.mjs`, same token count) + draft `card` |
| `ep01/timing.json` | Gemini TTS (`gemini-3.8-flash-tts`, voice Sadaltager, `BATCH=1`), Whisper word timing (medium, `WHISPER_LANG=en`) + `snap-words` |
| `ep01/meta.json` | Title, summary, chapters, sources, credits for `scripts/describe.mjs` |
| `ep01/Ep.tsx` | Composition `Wh01`: map, rasters, the global Minard band (`campaign.tsx`), chapters `ch0`–`ch8` |
| `ep01/minard.ts` | Minard's troops / cities / temperatures (HistData) + `CITY` coordinates |
| `kit/news.tsx` | English news kit: fonts (Oswald + Inter), top bar, head card, panel ("Illustration"), pin, quiz, rivers |
| `kit/Army.tsx` | Minard army band (width = men) + troop counter: the channel's signature, reusable for any march |
| `kit/Period*.tsx` | Napoleonic figures and props (soldiers by nation, Napoleon, Kutuzov, Cossacks, horses, guns, bridges, Moscow…) |
| `speak.mjs` | Fills `text` from `caption`: `node speak.mjs ep01/beats.json` |

## Set up in a render project (short path, e.g. `C:\tmp\wh`)

Copy `episodes/worldhistory/{ep01,kit}` to `src/episodes/worldhistory/`, and `ep01/{beats,timing,meta}.json` +
`voices.json` to `src/episodes/wh01/` (slug used by the audio scripts; `time.ts` imports from there). Register
`Wh01` (1080×1920) and `Wh01Thumb` in `Root.tsx`. Data (not in the repo):

```bash
node scripts/fetch-imagery.mjs bluemarble world
node scripts/fetch-imagery.mjs bluemarble europe -12 34 45 64 8192
node scripts/fetch-imagery.mjs bluemarble rus 20 51 40 58 6000
node scripts/fetch-rivers.mjs eu-rivers -12 34 45 64
```

Audio: `BATCH=1 BATCH_CHARS=1500 WHISPER_LANG=en node scripts/tts-gemini.mjs wh01 Sadaltager`, then
`WHISPER_LANG=en node scripts/align.mjs wh01` and `node scripts/snap-words.mjs wh01`.

## Render

```bash
npx remotion render Wh01 out/wh01.mp4 --gl=angle
node scripts/check-glitch.mjs out/wh01.mp4
node scripts/loudness.mjs out/wh01.mp4
node scripts/srt.mjs wh01 --lead 3 --gap 16
node scripts/describe.mjs wh01 --lead 3 --gap 16
node scripts/thumb.mjs Wh01Thumb wh01
```

On the i3-N305 laptop (Intel UHD, no CUDA): full render ≈ 1.5 h; Whisper medium on CPU ≈ 4× the audio length.
Chapters were built in parallel by four agents (A: ch1–2, B: ch3–4, C: ch5–6, D: ch7–8), each with its own
`kit/Period<letter>.tsx`.
