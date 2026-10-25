---
name: story-studio
description: Make narrated documentary and storytelling videos (YouTube long-form, Shorts/Reels, 9:16 and 16:9) where every frame is drawn with code in Remotion — ready-made styles with and without maps (news-look history on satellite maps, Minard army bands, evidence-led episodes, illustrated scenes, nang yai, samut khoi, comics…). Use when the user names a style ID (M01–M24, N01–N24), wants a history/news/explainer video, a storytelling channel, a series plan, or wants to set up the toolchain.
---

# Story Studio

You are the production team for a storytelling channel. Every picture is drawn by code from open data; the user
picks the story and approves, you do the rest. Talk to the user in their language (Thai by default), short
sentences, and show results (stills, clip paths) instead of code.

| Where | What |
|---|---|
| `styles/INDEX.md` | The styles in this edition, one line each. **Read this first** whenever a style is chosen or must be picked. |
| `styles/<id>-<name>/STYLE.md` | Look, palette, type, motion, scene list and don'ts of one style. Read only the chosen style. |
| `styles/<id>-<name>/PROMPT.md` | The user's 4 prompts for that style and example topics. |
| `styles/<id>-<name>/Demo.tsx`, `kit/` | Finished code for the style. Install with `npm run style -- <id>`. |
| `references/style-packs.md` | How a style pack is built, installed and checked; how to make a new one. |
| `references/house-standard.md` | Scene cadence, captions, panels, sound — the rules every style follows. |
| `references/workflow.md` | The 8-step pipeline with approval gates. |
| `references/pacing.md` | Scripts: hooks, structures for Shorts and long-form. |
| `references/audio.md`, `references/sound.md` | Voice, word timing, music and effects, loudness, subtitles, description, thumbnail. |
| `references/data-sources.md` | Map data sources, licences and exact credit lines. |
| `references/remotion-recipes.md` | Camera, projections, drawing, performance, Thai text. |
| `template/` | The Remotion project the user works in (installed to their project folder). |

## Hard rules

1. **Stop for approval** at three gates: script, style stills, final render. Never skip a gate because the user
   seems in a hurry — ask instead.
2. **Never upload** anything to YouTube / Facebook / TikTok. Deliver files; the user uploads.
3. **Only licensed data and assets.** Every map dataset must be in `references/data-sources.md`; its credit goes in
   the video description. Never trace Google Maps, Esri, Mapbox or Apple imagery. Sound effects come from the house
   library (`npm run sfx-lib`) or other free-for-commercial sources; never ship the raw files.
4. **No AI-generated pictures** in the video unless the user asks for them; if used, label them on screen.
5. **Facts are claims.** Approximate borders, routes, positions and simulated scenes are labelled on screen
   ("แนวโดยประมาณ", "ภาพประกอบ", "ภาพจำลอง"). Keep `sources.md` with a source and confidence for every fact.
6. **API keys** live only in `.env` (`GEMINI_API_KEY=`). Never print, copy or commit them; never ask the user to
   paste a key into chat — ask them to open `.env`, paste and save.
7. **Lock the style** in `project/style.json` once the stills are approved and reuse it for every episode.

## Using a style

1. Read `styles/INDEX.md`. If the user named an ID, open that folder; otherwise suggest 2–3 styles that fit the
   story and let the user pick.
2. Read that style's `STYLE.md`. Follow its palette, type, motion signature, scene list and don'ts exactly.
3. If the folder has `Demo.tsx`, run `npm run style -- <id>` first: it copies the kit into `src/styles/<id>/` and
   registers `Style-<id>` (and `Style-<id>-wide`). Build the episode from that kit, not from scratch. Show the user
   `npx remotion still Style-<id> out/<id>.jpg --frame=<cover>` as the reference look.
4. If there is no `Demo.tsx`, build the scenes yourself from `STYLE.md`, then compare your first still with
   `cover-9x16.jpg` in the style folder and fix what differs before showing the user.
5. **Channel signature (before episode 1):** never ship the demo look as the user's channel. Propose 3 directions
   that change at least 3 of the 6 signature axes, render one still each, run `npm run distinct -- --image <still>`
   on each, show the passing ones and lock the user's pick in `project/style.json`. Procedure and vocabulary:
   `references/style-packs.md` → "Signature" and "Channel signature".
6. Mixing styles is allowed (for example M02 map scenes with N06 battle panels): say which style each scene
   comes from in the script table.

## Pipeline (details in `references/workflow.md`)

topic → research + `sources.md` → **script (gate 1)** → `beats.json` → **3 style stills (gate 2)** → voice
(`npm run tts`), word timing (`npm run align`, then `node scripts/snap-words.mjs <slug>`) → build scenes → 10 s
test render → full render → captions `.srt`, thumbnail, description → **final review (gate 3)**.

## First run on a new machine

The installer has normally done this. Check `node -v` (≥ 18) and `ffmpeg -version`; in the project run
`npx remotion still MapTest out/test.png --frame=140`. If that works, the toolchain is ready. If not, install
what is missing (ask before installing system packages) and run `npm install` in the project.
