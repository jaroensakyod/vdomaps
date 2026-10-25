# Style packs

One folder per style under `styles/`, named `<ID>-<slug>` (for example `N05-nangyai`). IDs: `M01`–`M24` with a
map, `N01`–`N24` without. `styles/_template/` is the starting point for a new pack.

| File | Content |
|---|---|
| `STYLE.md` | Look, palette (5 hex), type, motion signature, scene list, fits, don'ts, credits |
| `PROMPT.md` | The user's 4 prompts (story → stills → voice + 10 s test → full render) + 3 example topics |
| `style.json` | Values to lock into `project/style.json` |
| `cover-9x16.jpg`, `cover-16x9.jpg`, `cover-4x5.jpg` | Reference stills, one per size in `demo.sizes` (made by `npm run gallery`) |
| `sample.mp4` | 15 s sample with sound (made by `npm run gallery -- --clips`) |
| `Demo.tsx` | Exports `demo: StyleDemo` (`src/styles/types.ts`) and `Demo` |
| `kit/` | The style's components. Import template components as `../../../components/...` |

A pack still being made may have only `STYLE.md`; `npm run style` then copies the guide to `project/styles/<id>/`.

## Install into a project

```bash
npm run style -- list            # styles found and whether they have code
npm run style -- N05             # copy Demo.tsx + kit/ into src/styles/N05/, register Style-N05
npm run style -- N05 --lock      # also copy style.json to project/style.json
npx remotion still Style-N05 out/N05.jpg --frame=150
```

The script looks for `styles/` in `--from <dir>`, `$STORY_STYLES`, the project's
`.claude/skills/story-studio/styles`, `~/.claude/skills/story-studio/styles`, `~/.codex/skills/story-studio/styles`,
then the repo layout (`skills/story-studio/styles` next to the template).

## Import paths inside a pack

`Demo.tsx` sits at `src/styles/<id>/Demo.tsx` after install and imports its own kit as `./kit/...` and template
components as `../../components/...`. Files inside `kit/` import template components as `../../../components/...`.
A pack must not import from any other pack or from an episode folder; copy what it needs into its `kit/`.

## Gallery (covers and samples)

```bash
npm run gallery                  # every installed style: out/gallery/<id>-9x16.jpg, <id>-16x9.jpg, sheet.jpg
npm run gallery -- N05 M02       # only these
npm run gallery -- --clips       # also render out/gallery/<id>.mp4 (the sample clip)
npm run gallery -- --into <styles dir>   # also copy covers / sample.mp4 into each pack folder
```

## Checking a pack

1. `npm run typecheck` passes with the pack installed.
2. `npm run gallery -- <id> --clips` renders without errors and the cover shows the style clearly at phone size.
3. In an empty project, an agent given only `STYLE.md` + `PROMPT.md` prompt 2 produces a still that is recognisably
   the same style as `cover-9x16.jpg`. If not, fix `STYLE.md`, not the cover.
4. No AI images, no raw sound files, no key, every data credit listed in `STYLE.md`.

## Making a new style

Describe the reference in 5 axes — base (flat / relief / imagery / texture / stage), palette (5 colours), line
(hairline / bold / rough / glow / carved), type (family, weight), motion signature (snappy springs or slow drift,
camera) — then map each axis to a technique, build `Demo.tsx` as a 10–20 s scene that shows the signature moves,
and fill `STYLE.md` from the template. Never copy a channel's logo, characters or exact layout.
