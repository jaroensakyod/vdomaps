# M01 ข่าวโลกยามเช้า · Morning World Bulletin

![cover](cover-9x16.jpg)

**Fits:** world news round-ups, current events, "N stories in 90 seconds", any story that jumps between countries ·
**Formats:** 9:16 / 16:9 · **Code:** `Demo.tsx` + `kit/Morning.tsx` (plus template `Raster`, `Caption`, `Props`, `Figures`, `Street`)

## Look

A calm morning broadcast on a sunlit satellite globe. The page is a pale morning sky (white at the top, soft blue
at the bottom, a warm sun bloom top-right). The NASA Blue Marble globe is lifted, not darkened: land at natural
colour with a little extra exposure, the sea screened to a soft daylight blue, a white atmosphere halo round the
rim, faint white graticule and white country borders. The story's country gets a teal wash with a navy hairline
and a wide soft white edge — never a glow. Cards are frosted white sheets (80 % white + backdrop blur, a soft
blue shadow, square corners) with deep-navy text, a 4 px teal rule on top and thin navy rules inside; the big
number is teal. The pin is a navy dot in a breathing teal ring with a white flag tag on a short hairline. The
illustration is a round "lens" (white rim, teal progress arc) on a hairline from the pin, labelled
"<place> · ภาพประกอบ" on a white tag below. A white lower-third ticker with a teal label block runs all the time.
Captions are navy with a white outline. Nothing dark, no red.

| Role | Hex |
|---|---|
| Sky background (top → bottom) | `#f6f9fc` → `#e9f2fa` → `#c9ddee`, sun bloom `#fffaf0` |
| Sea (screen over imagery, masked to water) | `#62acdf` at 85 % |
| Cards / ticker / tags | `#ffffff` at 80–92 % |
| Accent teal (rules, stat, wash, ring, label block) | `#009fb0` |
| Text navy / secondary | `#0d2342` / `#5f7a96` |

**Type:** IBM Plex Sans Thai 500/600/700 — masthead 40 px 700, card country 58 px 700, stat 96 px 600, headline
34 px 500, n/N + tag 26 px 600 teal, pin tag 34 px 600, ticker 30 px 500, hook 104 px 700, captions 58 px, at 1080.
**Line:** hairline everywhere — borders 0.9 px white at 75 %, highlight 1.6 px navy over 7 px white, rules 1.5 px
navy at 16–35 %, teal rules 3–4 px. No glow, no blurred strokes.

## Motion signature

- Wipe-reveal: every card, title, ticker and masthead appears by a left-to-right clip wipe (18–20 frames, ease
  in-out) and leaves by wiping from the left; the teal top rule grows with it. Nothing bounces.
- Camera: hook turn of the globe, then per story a wide arc through globe size (22 frames, sine) and a calm push
  in (26 frames, ease-out quad), then a 4 % creep. Phones lift the place 12.5 % so it sits above the lens.
- The stat rises 14 px and fades in 12 frames after the card; the pin ring breathes (sine), the flag tag wipes out.
- The lens opens as a growing circle (22 frames); the teal arc on its rim fills over the lens's life (a clock for
  the story); it closes as a shrinking circle in 10 frames.
- Sound: soft `SFX.swell` on the hook, quiet `SFX.whoosh` before each fly, `SFX.tick` on each pin; house-library
  `<Hit>` / `<Bed>` low under the voice.

## Scenes in the kit (`kit/Morning.tsx`)

| Component | Shows | Props |
|---|---|---|
| `DayGlobe` | Lifted satellite globe: halo, daylight sea, graticule, white borders | `imagery` (default `world`) |
| `Highlight` | Teal wash + navy hairline + white edge on one country | `id` (ISO numeric), `opacity` |
| `Pin` | Navy dot, breathing teal ring, white flag tag | `at, text, start` |
| `newsCam` | Camera keys: hook turn + arc-and-push per story | `stories, width, height, [lon0, lat0, lon1, lat1]` |
| `Masthead` | Programme name, hairline, clock, date, one segment per story | `title, date, clock, stories` |
| `StoryCard` | Frosted white card: n/N · tag, country, teal stat, headline, sources | `story, index, count` |
| `HookTitle` | Navy hook title with a teal rule | `title, sub, from, to` |
| `Ticker` | White lower-third ticker with a teal label block | `label, items, from` |
| `Lens` | Round illustration on a hairline, teal progress arc, "ภาพประกอบ" tag | `id, anchor, label, start, end, sky, children(g)` |
| `MapCredit`, `Kicker` | Small navy credit; "M01 · ข่าวโลกยามเช้า" | `text` |

`Story` = `{ id, country, name, tag, stat, statLabel, headline, sources, focus, zoom, start, end }`. `Lens` children
get an `InsetGeom` scaled so scenes written for the 980 × 380 panel strip fit the circle; use pale morning skies
(`["#8ec5ea", "#f3f8fb"]`). Illustration props come from the template `Props.tsx` / `Figures.tsx` — set their
accent colours to teal/navy where the prop takes a colour.

## Build notes

One `MapFrame` holds `DayGlobe`, highlights, pins and lenses; masthead, cards, captions and ticker are HTML on top.
9:16: masthead 5 %, card 13.5 %, lens centre 56 % (radius 250 px), captions 74.5 %, ticker 8.5 % from the bottom.
16:9: the card is a 660 px column on the left, the lens on the right (radius 230 px), the ticker on the bottom
edge. The sea tint uses a mask of the country shapes, so only water is screened blue. In an episode cue every lens
and chip on a spoken word and change the picture every 3–4 s; ticker lines are the coming stories' one-liners.

## Data

Not shipped — run once in the project:

```bash
npm run imagery -- bluemarble world     # public/raster/world.jpg + .json (8192 × 4096)
npm run sfx                              # template UI sounds
npm run sfx-lib                          # house library (thunder_rumble, city_crowd)
```

Country borders come with the template (`world-atlas` countries-50m).

## Don'ts

- Never darken the globe or the page, no night map, no red bars, no glow lines — it is a morning programme.
- Never the word "สด" (live) and never draw injured people or bodies — numbers go in a chip instead.
- Every lens carries "ภาพประกอบ"; approximate places say "(โดยประมาณ)".
- One highlighted country at a time (two only for a joint story); the wash is always teal.
- No bouncy springs or pops: wipes and eases only. No rounded pill cards.
- Numbers on the card come from at least two sources; the sources line stays on the card.

## Credits

Imagery: NASA Blue Marble (NASA Earth Observatory) · Borders: Natural Earth (public domain) — in the video
description and the small on-screen credit. Illustrations are drawn in code. Sound: template UI sounds and house
library effects (Mixkit / Pixabay licences, no attribution needed). Font: IBM Plex Sans Thai (SIL Open Font License).
