# Story Studio — your channel project

Set up by the Story Studio installer: git, Node, ffmpeg, this Remotion project (`npm install` done) and a render
test are in place.

- **Your instruction set is `.claude/skills/story-studio/SKILL.md`.** Read it now, then `styles/INDEX.md` when a
  style is chosen, and the `references/` file it points to for each step.
- Skip SKILL.md's "First run" steps unless something is actually missing. If
  `npx remotion still MapTest out/test.png --frame=140` fails, fix the toolchain first.
- The user may be a beginner. Talk Thai, short sentences, explain each step in one line before running it, and show
  results (stills, clip paths) instead of code.
- **API key:** the Gemini key is in `.env` (`GEMINI_API_KEY=`); npm scripts load it. Never print, echo, copy or
  commit it. If it is empty, ask the user to open `.env`, paste the key and save — never to paste it into chat.
- Hard rules: stop for approval at script, style stills and final render; never upload anywhere; only licensed data,
  credited in the description; approximate or simulated content labelled on screen.
