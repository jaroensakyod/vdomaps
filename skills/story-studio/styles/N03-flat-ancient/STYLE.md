# N03 ภาพเขียนแดงบนไห · Red-Figure Vase

![cover](cover-9x16.jpg)

**Fits:** the ancient Mediterranean — Rome and Carthage, Hannibal, Greece and Persia, Alexander, Troy, Greek myth ·
**Formats:** 9:16 / 16:9 · **Code:** `Demo.tsx` + `kit/Vase.tsx`, `kit/Figures.tsx`

## Look

The screen is a painted pot in the red-figure manner. The neck at the top is bare orange clay and carries the
titles, painted in black glaze. Below it a row of black tongues, a key (meander) border, then the picture band:
black glaze with a faint lustre, the figures left in the orange clay, every inner detail drawn with fine black
relief lines (eyes, helmets, shield rims, drapery folds) and thinner dilute-brown lines for muscles and folds;
hair solid black, snow and old men's hair in added white. Figures are in strict profile, striding, with large
round shields carrying a black device (star, eye, scorpion) or tall curved Roman shields with a thunderbolt.
Below the band a second key border and a row of rays. The band curves with the pot: borders and figures sag
in the middle and squeeze into shadow at both sides, and a soft vertical sheen sits on the glaze.

| Role | Hex |
|---|---|
| Black glaze (band ground) | `#120b07` (body gradient to `#050302`) |
| Clay (figures, neck, borders) | `#dc7438`, light `#ea9a5e` |
| Relief line / glaze text | `#140a05` |
| Dilute line | `#8a4320` |
| Added white | `#efe3cc` |
| Text on glaze | `#f0d2a8` |

**Type:** Noto Serif Thai — kicker 28 px 600, wide letter-spacing; tag 30 px 400; headline 76 px 800 in black
glaze on the clay neck; stat 96 px 800 in `#5a1e0c`; the spoken line 56 px 700 (sizes at 1080 wide). In 16:9 the
headline and stat share one row and the spoken line sits on the clay foot. **Line:** 0.8 local units on figures
(≈ 2–3 px), dilute 0.5; relief lines on every overlap of clay on clay.

## Motion signature

- **The pot turns.** Everything lives at an arc position `u` round the pot; the camera is the rotation `rot`. While a
  scene is told the pot drifts slowly (≈ 2 px/frame), then swings round ≈ 1200 px to the next scene in ~22
  frames with an ease-in-out. Shapes compress and darken toward the sides as they turn away.
- Figures barely move — this is a painting: arms rise (senators in alarm), a standard tips over, the fallen
  soldier lies across the ground line.
- Impacts: the pot is knocked — a short damped wobble of `rot` — with the clash SFX on the same frame.
- Palmettes fill the gaps between scenes so the swing never shows an empty pot.

## Scenes in the kit

| Component | Shows | Props |
|---|---|---|
| `useVase(rot)` (`Vase.tsx`) | Pot geometry: band top/bottom, radius, sag `e`, scale `s` | `rot` |
| `Pot` | Glaze body, clay neck, tongues, key borders, rays, (16:9) clay foot, sheen | `z, children` |
| `On` | Places a figure at arc position `u`, ground `y`, scale `s`, `flip` | — |
| `Meander`, `Tongues` | Wrapped key border; tongues or rays | `z, y, h, rays` |
| `Titles`, `Line`, `Label` | Neck titles with stat; spoken line; "ภาพประกอบ" inscription | — |
| `Warrior` (`Figures.tsx`) | Soldier: walk / charge / stand / fallen; `round` shield with `device` or `scutum`; `cloak` | — |
| `Elephant`, `Senator`, `Column`, `Mountain`, `Standard`, `Palmette` | War elephant with mahout and general; old man in alarm; Doric column; snowy peaks; Roman standard (`fall`); filler | — |

## Build notes

All SVG. Figures are drawn 100 units tall, feet at 0, facing right, then placed with `<On z u y s>` — s ≈ 5–7.5
in 9:16. Put scenes ~1500 px apart on the circumference and a `Palmette` between them; drive `rot` from one
interpolate. Draw every clay shape with the `clay` style (fill + 0.8 line) so overlaps get their relief line.
New peoples: give the `Warrior` a different shield device or helmet; new people: add a figure function in the
same idiom (profile, almond eye, line folds).

## Don'ts

- No gradients or shading on figures — flat clay, black lines, dilute lines, added white only.
- No three-quarter views or perspective; strict profile and one ground line.
- No colours outside clay / black / dilute / white (no blue, no gold).
- No copy of a real vase or a known painter's composition; no museum photos, no AI images.
- No gore; losses are the stat on the neck.

## Credits

None for pictures — everything is drawn in code. Sound: template `SFX.swell`; house library `wind_storm`,
`elephant`, `war_horn`, `sword_battle`, `sword_clash`, `crowd_panic` (`npm run sfx-lib`). Font: Noto Serif Thai
(SIL Open Font License).
