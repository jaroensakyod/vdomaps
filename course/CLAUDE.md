# Map Studio — student project

This folder was set up by the course installer (`course/install-windows.ps1` or `course/install-mac.sh`):
git, Node, ffmpeg, the Remotion project (`npm install` done) and a render test are already in place.

- **Your instruction set is `.vdomaps/skills/map-studio/SKILL.md`.** Read it now, then read the `references/` file
  it points to for each step. `.vdomaps/episodes/` has finished episodes to learn from (worldnews = the news look).
- Skip SKILL.md's "First run on a new machine" install steps unless something is actually missing — the installer
  did them. If `npx remotion render MapTest` fails, follow `.vdomaps/bootstrap/AGENTS.md` to repair.
- The user is a beginner taking a 1-hour class. Talk Thai, short sentences, explain each step in one line before
  running it, and show results (stills, clip paths) instead of code.
- **API key:** the user's Gemini key is in `.env` (`GEMINI_API_KEY=`). The npm scripts load it automatically.
  Never print, echo, copy or commit it. If it is empty, ask the user to open `.env`, paste the key and save —
  never ask them to paste the key into chat.
- Default format for class: a 30–45 s Short (9:16) in the news look (`episodes/worldnews`), Thai VO with Gemini TTS.
- Hard rules: stop for approval at script, style stills and final render; never upload anywhere; only licensed map
  data, credited in the description; approximate borders/routes labelled as approximate.
- Whisper: `WHISPER_MODEL` in `.env` (default medium). NVIDIA GPU → offer the CUDA build per
  `references/audio.md` once the first clip works, not before.
