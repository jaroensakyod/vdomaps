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

## Signature: six axes every pack declares

`style.json` carries a `signature` block. `npm run distinct` needs every pair of packs to differ on at least 3 of
the 6 axes **and** to look different on the rendered covers (look score ≥ 0.30). Use tokens from this vocabulary
so that "different" means different, not a new word for the same thing:

```json
"signature": {
  "base": "palm-leaf",
  "palette": ["#3b2414", "#c99a5b", "#e8d3a6", "#1a0f08", "#9c2b1b"],
  "line": "incised",
  "type": "Srisakdi 700",
  "motion": "slide-stack",
  "frame": "manuscript"
}
```

| Axis | Tokens (pick one; add a new one only when none fits, and add it here) |
|---|---|
| `base` | satellite, satellite-mono, drawn-map, parchment, paper-cream, palm-leaf, lacquer, felt-diorama, stage, sky-scene, film-bw, crt-screen, print-halftone, newsprint, ceramic, papercut, tracing-vellum, game-board, cloth-screen, mural-wall, woodblock, poster-litho, enamel-tin, dark-ui, stamp-album |
| `palette` | 5 hex colours by role: background, main, second, accent, text |
| `line` | none, hairline, ink-outline, bold-outline, carved, glow, engraved-hatch, brush, incised, halftone-dot, cut-edge, pencil, keyblock, neon-tube, scanline |
| `type` | the Thai-capable font family first, then weight: Kanit, Noto Sans Thai, Sarabun, Prompt, Mitr, Chakra Petch, Taviraj, Trirong, Pridi, Chonburi, Srisakdi, Charm, Charmonman, Itim, Sriracha, Mali, Pattaya, Fahkwang, Kodchasan, Athiti, Niramit, Bai Jamjuree, K2D, Krub, KoHo, Thasadith, Noto Serif Thai, IBM Plex Sans Thai (all in `@remotion/google-fonts`, OFL) |
| `motion` | slow-push, snappy-spring, stepped-on-twos, handheld, flicker, scroll-pan, slide-stack, unfold, pop-sticker, gate-weave, wipe-reveal, parallax-depth, tabletop-tilt, swing |
| `frame` | news-card, illustration-panel, book-page, manuscript, stage, game-board, screen-ui, file-folder, poster, vase-band, newspaper-column, exhibit, broadcast, none |

## Channel signature (a buyer's own look)

A buyer must not end up with a channel that looks like the demo or like another buyer's. Before episode 1:

1. Start from the chosen style. Propose **3 directions** that each change at least 3 axes (keep what makes the
   style work: its mechanic, not its paint). Write each as a `signature` block.
2. Render one still per direction to `out/look-a.jpg`, `out/look-b.jpg`, `out/look-c.jpg`.
3. `npm run distinct -- --image out/look-a.jpg` (and b, c): each must pass against every pack, including the one
   it came from. Drop or rework any that fail.
4. Show the user the passing stills side by side; they pick one. Lock it: copy the signature into
   `project/style.json` and keep the still as `project/look.jpg`. Every episode's stills are compared with it.

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
