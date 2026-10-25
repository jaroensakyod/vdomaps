# N08 เรือใบรบกลางทะเล · Woodblock Sea Battle

![cover](cover-9x16.jpg)

**Look name:** ภาพพิมพ์แกะไม้ · Woodblock Print
**Fits:** naval battles of the age of sail (1500s–1860s), sea fights in Thai/Asian history, storms and voyages, any
"two ships trade fire" moment · **Formats:** 9:16 · **Code:** `Demo.tsx` + `kit/Woodblock.tsx`

## Look

A full-bleed woodblock print (inspired by the craft, not copying any print). A **black keyblock line** (4.5 px world,
round joins, edges wobbled by the `carve` filter as if cut in cherry wood) holds **flat colour blocks**. The sky is
washi paper with a **bokashi**: deep prussian at the top fading to bare paper, then a dusk-pink to vermilion band on
the horizon, crossed by soft paper-coloured kasumi mist bands. The sea is rows of **curling stylised waves**: each wave
a prussian-to-blue bokashi body with three light flow lines, a rope of paper foam along the lip and seven
**claw-like foam fingers** curling forward, spray dots above; rows get bigger toward the camera and scroll sideways.
Ships: brown hulls with vermilion and ochre wales, cream sails with seam lines, our flags vermilion, the enemy's ochre.
Powder smoke rolls out as clusters of paper puffs with one outer keyblock outline and curled inner lines; muzzle
flashes are vermilion spikes with an ochre heart; splashes are fountains of claw fingers; burning decks get
vermilion flame tongues and a leaning column of sumi-grey billows. **Wood grain** streaks and washi fibres sit over
the whole print (multiply). Title in a **cartouche** (pale box, double keyblock border) top left; the honest label
"ภาพประกอบ" is a vermilion **seal** bottom right.

| Role | Hex |
|---|---|
| Washi paper | `#efe2c4` |
| Prussian (sky top, wave bodies) · indigo · light blue (flow lines) · pale | `#1f3d6b` · `#28466f` · `#7fa6c0` · `#c9d8d6` |
| Vermilion (our flags, flames, seal, verb) · ochre (enemy flags, wales) · dusk band | `#c4432b` · `#d9a441` · `#e9b48f` |
| Hull · sail | `#6b4a2e` · `#f3ead3` |
| Keyblock / text | `#1a1611` |

**Type:** Thasadith 700. Cartouche kicker 34 px vermilion, a 2 px rule, headline 72 px keyblock with the verb in
vermilion; seal 36 / 30 px paper on vermilion; end cartouche 140 px + 46 px vermilion sub. **Line:** keyblock
4.5 px (hulls 5.4 px), detail lines 1.6–2.6 px, cartouche border 6 px + 2.2 px inner.

## Motion signature

- **Scroll-pan:** the camera slides sideways along the print like an unrolled sheet (cx 980 → 1500 → 1180) with only a
  gentle push (zoom 0.8 → 0.92 on the mast hit); the waterline stays at the same height on screen.
- Every wave row scrolls at its own speed (far 0.8 → front 3 px/frame) and its curls bob ± 12 %, so the sea pours past
  in layers; the bokashi sky stays fixed to the screen.
- Rippling broadsides: one port fires every 6 frames; each shot = vermilion spike + puff cluster that grows and drifts
  for 150 frames, a black ball on an arc, then a claw splash or a splintered hull hole.
- The mainmast hit: 14 px shake, the mast falls over 40 frames into a big splash, flames and a leaning smoke column
  grow on deck. End: the cartouche grows to the centre with the title.

## Scenes in the kit (`kit/Woodblock.tsx`)

| Component | Shows | Props |
|---|---|---|
| `PrintDefs` | Filters `carve`, `grainFx`, `washi`; gradients `skyBk`, `seaBk`, `waveBk` | — |
| `Grain` | Wood grain + washi fibres over the whole print (multiply) | `w, h` |
| `Sky`, `FarSea` | Kasumi mist bands; far sea with keyblock horizon and scalloped wavelets | `frame` |
| `Curl`, `CurlRow` | One curling claw-foam wave; a scrolling row of them on a bokashi sea | `x, y, w, h, dir` / `frame, y, h, gap, speed, ph` |
| `Ship` | Three-master: wales, sails with seams, running-out guns, hits, falling mast, flames | `x, frame, flip, flag, fires, roll, heave, mastFall, fire, hits` |
| `PowderSmoke`, `Splash`, `Ball` | Outlined puff cluster + flash; claw fountain; cannonball arc | `x, y, age, dir` / `x, age, big` / `frame, t, x0, x1` |
| `Flames`, `ShipSmoke` | Vermilion flame tongues; leaning sumi billow column | `x, y, size, frame, seed` / `frame, from, x, k` |
| `Cartouche`, `Seal` | Title box with double border; vermilion "ภาพประกอบ" seal | `x, y, w, h, children` / `x, y, s, font` |
| `P`, `SEA`, `GUNS`, `PORT`, `portX`, `since` | Palette; sea level; guns per side; port positions; frames since last event | — |

## Build notes

Draw the sky gradient as a full-page rect (page space), then the world inside `<g filter="url(#carve)">` → camera
`<g transform>` (never `filter` and `transform` on the same element), then the cartouche, seal and `<Grain/>` last.
Keep the schedule at the top (volleys, misses, hits, mast, cheer, title); flash, smoke, ball, splash and sound all
come from the same lists. Sound mix: beds `sea_rough` 0.45, `wind_storm` 0.2, `ship_creak` 0.3; `cannon_heavy` /
`cannon_old` alternating per gun (0.65 ours, 0.45 theirs); `splash_big` on misses; `wood_hit` + `wood_break` on hits;
`mast_fall`, `fire_big` bed from the mast hit, `crowd_cheer`, `ship_bell` at start and title. With narration drop
one-shots 6–10 dB under the voice.

## Don'ts

- No soft airbrush shading, glow or drop shadows: colour changes only by flat blocks and bokashi.
- Do not build the frame around one giant wave or copy any known print's composition; keep rows of waves.
- No dark screen background, rounded UI cards or sans-serif labels; the label is the seal.
- No photos, no real naval ensigns; flags are plain colour pennants.

## Credits

None for pictures: everything is drawn in code, no map data. Sound: recorded effects from the house library
(`npm run sfx-lib`; Pixabay Content License and Mixkit Sound Effects Free License, free for commercial video, no
attribution, files not redistributed). Font: Thasadith (SIL Open Font License).
