# N12 โพสต์เพจและปก 4:5 · Page Post and Cover

![cover](cover-9x16.jpg)

**Fits:** commemoration days, anniversaries, "new clip coming" announcements, episode covers for a Facebook page ·
**Formats:** 4:5 (1080×1350, composition `Style-N12-post`) · **Code:** `Demo.tsx` + `kit/Post.tsx`

## Look

A single 4:5 feed card. The base is dark NASA Blue Marble imagery under a navy tint, with the story's countries
coloured flat (42 % fill, 3 px line) and the hero country glowing gold. Dark fades top (to ~40 %) and bottom keep
the text readable. Top left: a red rounded date badge, a heavy three-line headline whose question ends in gold,
and a sub line with years. Top right: an arched picture frame with a 7 px gold border and a gold glow (rounded top,
square-ish bottom) — the page's own photo, or a code-drawn picture — with a small gold caption under it. Bottom: a
gold "coming soon" chip on the left, the page name on the right with its second word in gold, and a faint credits
line. Map labels are white Kanit 900 with a thick outline in the area's colour.

| Role | Hex |
|---|---|
| Background / fades | `#02060d` (map tint `#06112b` at 40 %) |
| Hero, question word, frame | `#ffc94a` |
| Date badge, side A | `#ff3b30` |
| Side B | `#3d8bff` |
| Text | `#ffffff` (chip text `#1a1200`, credits 55 % white) |

**Type:** Kanit 700/900. Headline 80 px 900 (line-height 1.2), badge 38 px 700, sub 38 px 700, chip 36 px 900,
page name 32 px 900, caption 22 px 700, credits 17 px, map labels 40–64 px 900 with a 10 px stroke — at 1080 wide.
**Line:** area outlines 3 px, hero 5 px + 22 px blurred glow, frame border 7 px, marker 4 px rings.

## Motion signature

A post is a still; the demo shows how it animates when used as a video cover or a 5–10 s teaser:

- Card fades in over 14 frames; badge slides in from the left, headline rises 24 px, sub, then frame and footer
  follow on springs (damping 16), 8 frames apart.
- Very slow push-in on the map (scale +4 % over 10 s); the hero glow breathes (0.75 ± 0.25).
- The place marker ring pulses every 2 s; labels fade in at ~1.5 s.
- The picture inside the arch moves gently (smoke, bobbing, water glints) — no cuts.

## Scenes in the kit (`kit/Post.tsx`)

| Component | Shows | Props |
|---|---|---|
| `PostCard` | The 4:5 card: background + dark fades + layers, centred and clipped in any frame | `background, children` |
| `PostMap` | Raster map clipped to the card, `focusY` as a share of the card height | `cam, focusY, raster, tint` |
| `Areas`, `Hero` | Coloured countries; gold glowing hero country | `ids, color` / `id, glow` |
| `MapLabel`, `Spot` | Outlined map label; gold marker with a pulsing ring | `at, text, color, size, k` / `at, pulse` |
| `Headline` | Red date badge, headline lines + gold question, sub line | `badge, lines, ask, sub, at` |
| `ArchFrame` | Arched gold picture frame + caption; `photo` = file in `public/` (the page's own picture), else SVG children in a 330×420 box | `photo, caption, children, at` |
| `Footer` | Gold chip, page name (two parts), credits line | `chip, brand, credit, at` |
| `usePostBox` | Card geometry in the current frame (`s, left, top, w, h`) | — |

## Build notes

The demo is registered as `Style-N12-post` (1080×1350). For a real post, copy the demo into your episode folder,
change the text and picture, and render one frame: `npx remotion still Style-N12-post out/post.jpg --frame=200`.
The card also centres itself in any other frame size. Keep the headline to 2–3 lines and 8–12
words, the question word always in gold. The picture in the arch must be the page's own photo (with its licence
in the credits line) or a code drawing; never an AI image. Write the post caption in the same order: date line,
2–3 short paragraphs (context, the question, "คลิปใหม่ เร็ว ๆ นี้" + follow), picture and map credits, 6–8
hashtags.

## Data

Not shipped — fetch the regional Blue Marble raster into `public/raster/`:

```bash
npm run imagery -- bluemarble sea 88 2 112 28 7500
```

Credit (on the card and in the caption): "ภาพดาวเทียม NASA Blue Marble" · borders: Natural Earth (via
`world-atlas`). Modern borders used for old ones must say "เส้นเขตแดนโดยประมาณ".

## Don'ts

- No AI portraits or AI pictures in the arch; a real photo only if the page owns it or it is public domain, credited.
- No more than three colours on the map (hero gold + two sides); no busy legends.
- Do not push text into the middle band — the map story sits between the top and bottom fades.
- Do not shrink the headline below 70 px; the card must read at feed-thumbnail size.

## Credits

Imagery NASA Blue Marble (not copyrighted; credited). Borders Natural Earth (public domain). The warship in the demo
is drawn in code. Sound (teaser only): template `SFX.swell`, `SFX.pop`, `SFX.whoosh`. Font: Kanit (SIL Open Font
License).
