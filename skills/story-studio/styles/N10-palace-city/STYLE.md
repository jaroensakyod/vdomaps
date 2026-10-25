# N10 ฉากวังและพระนคร · Palace and Capital Scenes

![cover](cover-9x16.jpg)

**Fits:** court history, capitals and coronations, palace coups, royal ceremonies, temple life, old riverside
cities (Ayutthaya, Thonburi, early Bangkok) · **Formats:** 9:16 / 16:9 · **Code:** `Demo.tsx` + `kit/Palace.tsx`

## Look

Illustrated scenes in the house style v2: flat colour shapes with dark ink outlines on a paper grain, inside a
rounded panel with a thin gold (or red, for violence) border and a "ภาพประกอบ" chip. Every scene has depth — a
sky gradient with a sun, moon or fire glow, far and mid ridges or back walls, a mist band, the subject in the middle
and grass or waves in front — and everything breathes or moves. The set is a Thai court city: whitewashed walls
with bai sema merlons and a gate, a Khmer-style prang with a gold tip, ordination/palace halls with stacked red
roofs and gold chofa, stilted houses, long boats with rowers and the gilt royal barge with a canopy and tiered
parasols, saffron-robed monks, kneeling and prostrate nobles, a king on a gilt throne under a halo, candles, a black
samut khoi on a table, fire and smoke. The panel sits on a dark warm vignette with a gold kicker, a white title and
a gold year chip above it and a one-line caption below.

| Role | Hex |
|---|---|
| Background (around the panel) | `#120c08` (centre `#2a1a10`) |
| Ink outline | `#1a140f` |
| Roofs / red | `#a8322a` |
| Gilt | `#d9a93a` (UI gold `#ffc94a`) |
| Chalk walls / text | `#efe6d0` / `#ffffff` |

Other PAL colours: indigo `#2b3a67`, green `#5b6e4a`, earth `#6b5236`, skin `#b9784e`, robe `#d9822b`. Skies per
scene: night `#0a1430→#2a3a6a`, lamplight `#3a1a10→#8a4a22`, dawn `#e8a87a→#f8e0b8`, day `#8ab0c8→#f4e2b8`, attack
`#120b1e→#5a2a1a`.

**Type:** Kanit 700/900. Kicker 40 px 700 gold, title 76 px 900 (64 at 16:9), year chip 32 px 900, caption 50 px
700 (44 at 16:9), panel chip 22 px 900 — at 1080 on the short side. **Line:** ink outlines 1.4–2.2 px (scaled with
`g.s`), panel border 3 px.

## Motion signature

- A new scene every ~2.7–3.5 s; scenes overlap 14 frames (outgoing `end` = incoming `start + 14`) and pop in on
  a spring (damping 13), so the frame never flashes empty.
- Inside each scene `Depth` pushes in +7 % and pans 40 px over its life; layers move at ×0.2 (far), ×0.5 (mid),
  ×0.7 (near), ×1.6 (foreground grass/waves).
- Figures are always alive: monks walk, rowers stroke, nobles breathe and bow, flames and candles flicker, smoke
  rises, river ripples run.
- Impacts (`hits`): 8-frame shake (6 px) and white flash, a light burst at the contact point, a library hit sound
  on the same frame; the panel border turns red for violent scenes.
- Caption swaps with a 16 px spring rise on each scene change.

## Scenes in the kit (`kit/Palace.tsx`)

| Component | Shows | Props |
|---|---|---|
| `V2` | One scene: framed `Stage` + `Depth` (push-in, pan, shake, warm light, grain) | `id, start, end, sky, accent, hits, warm` → `(g, pan, lt)` |
| `Stage`, `useStage` | The framed panel without a map; geometry for 9:16 / 16:9 | `id, start, end, sky, accent, label` |
| `Backdrop` | Sky glow, far/mid ridges, mist, ground | `g, pan, light, lightColor, far, mid, ground, mist, ridges` |
| `River` | Water band with running ripples | `g, y, pan, color, night` |
| `PalaceWall`, `Prang`, `Hall`, `House` | Merlon wall + gate (opens), prang, stacked-roof hall, stilted house (burns) | `x, y, w/h, s, …` |
| `Boat`, `Parasol` | Long boat with rowers / gilt royal barge with canopy; tiered royal parasol | `x, y, w, s, n, dir, canopy, gilt` |
| `Monk`, `Noble`, `King`, `Fighter` | Walking/sitting/kneeling monk; kneeling/prostrate noble; throne king; jointed soldier | `x, y, scale, mode, …` |
| `Fire`, `Smoke`, `Candle` | Animated flames, smoke column, candle | `x, y, h/s` |
| `Manuscript` | Black samut khoi open on a table, writing fades in | `x, y, w, s, lines, fade, dark` |
| `Tree`, `Palisade`, `Banner`, `Grass` | Round/palm tree, spear palisade, flag, foreground tufts | — |
| `ShadowStage`, `Puppet` | Nang yai cloth screen and perforated leather puppets (thai / plain / boatman) | `id, start, end` / `x, y, s, arm, kind` |
| `C` | Costume presets: guard, rebel, villager, lao, viet, khmer + template siam/burma/qing… | — |

## Build notes

One SVG for the whole frame; each scene is a `V2` with absolute `start`/`end` frames. In 9:16 the panel is
980×820 from 22 % height and the drawing unit `g.s` is 1.25× the screen unit so the figures fill it; in 16:9 it
is 1400×640 at 1×. Place everything by fractions of `g.W` and offsets in `g.s` from `g.ground`, add `pan × layer
factor` to x. At most 2 uses of the same scene per episode — vary the sky, light and figures. Keep a library
`<Bed>` under every scene (wind, city crowd, fire) and `<Hit>` for gongs and blows; synthetic `SFX` only for UI.
On a map episode the same scenes drop into an inset panel tied to a place (swap `Stage` for the template
`InsetPanel`).

## Don'ts

- No flat cut-outs sliding over one background — every scene needs at least three moving layers and a light.
- No real portraits or recognisable likenesses; the king is a generic figure.
- No hard cuts between scenes; always the 14-frame overlap.
- No photos or AI images; everything is drawn with the kit.
- Do not drop the "ภาพประกอบ" chip.

## Credits

None for pictures — everything is drawn in code. Sound: house library `gong`, `war_drums`, `wood_hit`, beds
`wind`, `city_crowd`, `fire_crackle`, `crowd_angry` (`npm run sfx-lib`, licences in `sfx/library.json`) and template
`SFX.swell`, `SFX.hit`. Font: Kanit (SIL Open Font License).
