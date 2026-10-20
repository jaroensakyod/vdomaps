# Map Studio — start from an empty folder

Put **only this file** in an empty folder and open the folder with Claude Code, Codex or Cursor
("set up map studio", "ทำคลิปแผนที่"). The agent reads this file and sets everything up itself:
toolchain → project → a 5-second test clip. After that it follows the full skill.

Talk to the user in their language (Thai by default). Ask before installing anything system-wide.

## 1. Toolchain

Check each; install what is missing **after the user says yes**:

| Tool | Check | Windows | macOS | Linux |
|---|---|---|---|---|
| git | `git --version` | `winget install Git.Git` | `xcode-select --install` | `sudo apt install git` |
| Node ≥ 18 (or Bun) | `node -v` / `bun -v` | `winget install OpenJS.NodeJS.LTS` | `brew install node` | `sudo apt install nodejs npm` |
| ffmpeg + ffprobe | `ffmpeg -version` | `winget install Gyan.FFmpeg` | `brew install ffmpeg` | `sudo apt install ffmpeg` |

Thai fonts come from Google Fonts through `@remotion/google-fonts` — nothing to install. Remotion downloads its
own headless Chrome on first render.

**Windows:** keep the project path short (e.g. `C:\maps\my-channel`). Long paths break npm and Remotion. If this
folder's path is longer than ~60 characters, tell the user and suggest moving it first.

## 2. Get the kit

```bash
git clone --depth 1 https://github.com/jaroensakyod/vdomaps .vdomaps
```

(No git: download https://github.com/jaroensakyod/vdomaps/archive/refs/heads/main.zip and unzip it to `.vdomaps`.)

Copy the starter project into this folder, keep the skill docs where they are:

```bash
cp -r .vdomaps/skills/map-studio/template/. .
npm install          # or: bun install
```

From now on **`.vdomaps/skills/map-studio/SKILL.md` is your instruction set** — read it now, and read the
`references/` file it points to for each step. `.vdomaps/episodes/` has finished episodes to learn from.

## 3. GPU check (rendering speed)

`remotion.config.ts` renders with Chrome on Vulkan. Check it works and is faster on this machine:

```bash
npx remotion render MapTest out/gl-vulkan.mp4 --frames=0-89 --gl=vulkan
npx remotion render MapTest out/gl-angle.mp4 --frames=0-89 --gl=angle
```

Keep the faster one in `remotion.config.ts` (`Config.setChromiumOpenGlRenderer(...)`). If vulkan fails, use
`angle`; if both fail, delete the line (software). Measured: RTX 2060 vulkan 3.8× faster than software;
Intel UHD (i3-N305) vulkan 2× faster. Delete the two test files afterwards.

## 4. The 5-second test clip

```bash
npx remotion render MapTest out/test-5s.mp4 --frames=0-149
npx remotion still MapTest out/test.png --frame=140
```

Globe → zoom to Thailand → fill → labels → tear-off calendar. Show the user the still and the clip path.
If this works, the toolchain is ready. (`npx remotion studio` opens the live editor.)

## 5. Real map data (optional check)

```bash
node scripts/fetch-imagery.mjs bluemarble world
node scripts/fetch-dem.mjs nthai 96 15.5 103 22 300
node scripts/fetch-osm.mjs cm-rivers 98.3 18.3 99.6 19.4 bigrivers
node scripts/fetch-imagery.mjs night night-sea 90 -5 125 30 6000
node scripts/fetch-imagery.mjs bluemarble sea 90 -5 125 30 6000
node scripts/fetch-rivers.mjs sea-rivers 90 -5 125 30
node scripts/fetch-history.mjs 1700 92 0 112 25
npx remotion render DataTour out/datatour.mp4
```

19 s tour: NASA satellite globe → Copernicus relief with OpenStreetMap rivers → NASA night lights →
borders in 1700 vs today, each with its credit on screen.

## 6. Voice and word timing (when the user wants VO)

- **TTS:** ask the user for a Gemini API key (Google AI Studio). Use it only as an environment variable for the
  command (`GEMINI_API_KEY=... npm run tts -- <slug>`). **Never write a key into any file, commit or log.**
- **Whisper** (word timing, `npm run align`): NVIDIA GPU → the CUDA build; otherwise the official BLAS build +
  `medium` model in one shared folder with `WHISPER_BIN`, `WHISPER_DIR`, `WHISPER_MODEL` set. Details:
  `.vdomaps/skills/map-studio/references/audio.md`.

## 7. Rules that always apply

1. Stop for the user's approval at: the script, the style stills, the final render.
2. Never upload anything to YouTube, Facebook or TikTok. Hand over files; the user uploads.
3. Only licensed map data, credited on screen and in the description (`references/data-sources.md`).
4. Historical borders, routes and battle sites are approximate — say so on screen.
