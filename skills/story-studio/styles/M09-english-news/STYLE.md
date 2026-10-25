# M09 สารคดีภาษาอังกฤษ · English News-Look History

![cover](cover-9x16.jpg)

**Fits:** English-language history and explainer shorts for an international channel — campaigns, journeys, wars,
"how X happened" on a map · **Formats:** 9:16 · **Code:** `Demo.tsx` + `kit/news.tsx` + `kit/Art.tsx`

## Look

A TV-news layout for history, in English. Satellite imagery (Blue Marble world + a sharper regional crop) with
Natural Earth rivers as thin cyan lines that light up gold when named. A red channel badge in Oswald caps, the
chapter name and a year chip ("218 BC") run across the top. One dark translucent head card with a coloured left
bar holds the story: a small tag, an UPPERCASE Oswald headline and a huge Oswald number that counts up or down.
Routes are dashed gold lines drawn live with an arrow head; places are pulsing red pins with white outlined names.
Cartoon "Illustration" panels (template `Depth` parallax, `Ridge`, `Fighter`) sit low on the screen on a dashed
leader line, and a quiz card with a 3-2-1 countdown closes the chapter. All on-screen text is English.

| Role | Hex |
|---|---|
| Background | `#02060d` |
| Accent red (badge, card bar, pins, panel frame) | `#ff3b30` (big number `#ff6b5f`) |
| Gold (routes, highlighted rivers, quiz, second card colour) | `#ffc94a` / river glow `#fff3a6` |
| Rivers | `#7fd4ff` at 55 % |
| Card · text | `rgba(8,14,26,0.86)` · `#ffffff` (outline `#0b1020`) |

**Type:** Oswald 700 for the badge (32 px, caps, +1 px tracking), card headline (60 px uppercase) and numbers (100 px);
Inter 700/900 for tags (26 px), labels (30 px), pins (44 px), quiz options (42 px) and captions — at 1080 wide.
**Line:** rivers 1.6–7 px by zoom; march line 5 px dashed 16/10 over a 14 px glow; pin ring 3 px; panel frame 3 px.

## Motion signature

- Camera moves between framed areas (`view(bbox, w, h, k, lift)`, lift 0.16 keeps the subject above the panel),
  ease in-out, then a slow 4–6 % creep; no globe spins.
- One head card per chapter slides in on a spring; every new shot swaps tag/headline/number with a 14 px rise.
  Numbers are counters (`stat: (frame) => …`).
- The march line draws on the narration; rivers glow up (0 → 1 in 10 frames) when they are named; pins fade in/out.
- Panels chain every 3–4 s with a 14-frame overlap; each has three parallax layers, light and walking figures.
- Quiz: card scales in, counts 3-2-1 with `SFX.tick`, the answer turns green with `SFX.hit`.

## Scenes in the kit

| Component | Shows | Props |
|---|---|---|
| `TopBar` | Channel badge, chapter, year chip | `chapter, year, channel?` |
| `HeadCard` | One card, text swaps per shot; empty `head` frees the slot | `heads: Head[], from, to` |
| `Panel` | Template `InsetPanel` labelled "Illustration", fixed slot at 56 % | `id, anchor, start, end, sky, accent` |
| `Pin` | Pulsing pin with outlined English name | `at, text, k, color, size, dy` |
| `MarchLine` | Route drawn live along [lon, lat] points with arrow head | `pts, k, color` |
| `Rivers` | Natural Earth rivers; named ones glow gold | `file, hi: { Rhône: 0..1 }` |
| `QuizNews` | Question, options, 3-2-1 countdown, answer reveal | `title, question, options, answer, start, reveal, end` |
| `view` | Camera framing a bbox with the subject lifted | `feature, w, h, k, lift` |
| `kit/Art.tsx` | `Elephant`, `Raft`, `Water`, `Snow`, costumes `CARTHAGE`, `IBERIAN` for template `Fighter` | `x, y, scale, phase` |

## Build notes

Layout (9:16): top bar at 4.5 %, card 10–27 %, map middle, panel 56–74 % (`PANEL_TOP`, `PANEL_H`), captions at 76.5 %
(`CAPTION_TOP`), quiz at 31 %. Raster layers stack `world` under the regional crop (`europe`). In a long episode
split the story into chapters, each with its own camera keys, heads, map overlays, panels and sounds, and cue
them with Whisper word timing. Use your own channel name on the badge.

## Data

Not shipped — run once in the project (the Europe crop is ~3.6 MB at 8192 px; 4096 is enough for shorts):

```bash
npm run imagery -- bluemarble world                         # public/raster/world.jpg
npm run imagery -- bluemarble europe -12 34 45 64 4096      # public/raster/europe.jpg (lon −12…45, lat 34…64)
npm run rivers -- eu-rivers -12 34 45 64                    # public/data/eu-rivers.json
npm run sfx && npm run sfx-lib                              # UI sounds + house library (army_marching, wind_storm, elephant)
```

## Don'ts

- No Thai on screen (except the style kicker) — captions, cards, pins and panels are English.
- Numbers from ancient sources are estimates: say "approx." / "about" and name the source in the description.
- Panels always say "Illustration"; approximate routes are fine but don't draw them as surveyed lines.
- Don't use the M01/M12 globe-hop camera here — this look frames areas and walks the story along a route.

## Credits

Imagery: NASA Blue Marble · Rivers & lakes: Natural Earth · Borders: Natural Earth — in the video description.
Illustrations drawn in code. Sound: template UI sounds and house library (Mixkit / Pixabay licences, no attribution
needed). Fonts: Oswald, Inter (SIL Open Font License).
