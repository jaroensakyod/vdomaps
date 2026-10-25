# M03 เล่าด้วยหลักฐานหลายฝ่าย · Evidence From Several Chronicles

![cover](cover-9x16.jpg)

**Fits:** disputed events, deaths and coups, battles each side tells differently, "what really happened" long-form
history (10 min) or a 60 s short · **Formats:** 9:16 · **Code:** `Demo.tsx` + `kit/Map.tsx`, `kit/Cards.tsx`,
`kit/Head.tsx`

## Look

The news-style history map with the sources put on trial. NASA Blue Marble imagery fills the frame with Natural
Earth rivers in cyan, approximate kingdom extents as glowing outlines with a 22 % pulsing fill (gold = Siam,
red-orange = Burma), campaign arrows, a crossed-swords battle marker and glowing city dots; a disputed or proposed
location gets a dashed rotating ring instead of a glow, plus a "(ตำแหน่งโดยประมาณ)" tag. A red top bar (badge,
chapter, year chip) and a dark head card with a coloured left bar sit on top; the head card names the claim and
carries a confidence chip (●●● หลักฐานตรงกัน / ●●○ ยังถกเถียง / ●○○ หลักฐานฝ่ายเดียว). In the illustration slot
under the map, evidence cards show which source says what: one column per side with its claim in big type, A vs B
with a stamp, a timeline of when each text was written. Captions sit at 76.5 %. Each side keeps one colour in the
whole video, on the map and on the cards.

| Role | Hex |
|---|---|
| Background | `#02060d` |
| Thai side / headline accent | `#ffc94a` |
| Burmese side | `#e05a3a` |
| Conflict / top bar | `#ff3b30` |
| Agreement | `#3fbf6a` |
| Cards | `rgba(8,14,26,0.92)` / text `#ffffff` |

Other sides: Europe `#4fa3ff`, Portuguese/Vietnam `#3fa7d6`, China `#c0186a`, Lanna `#3fbf6a`; rivers `#7fd4ff`.

**Type:** Kanit 400/700/900. Head 54 px 900, stat 92 px 900, card title 30 px 900, claim 38–44 px 900, map labels
24–36 px (700/900 with a 6 px dark outline), top bar 32/30 px, captions 50 px 700 — at 1080 wide. **Line:** zone
outline 3 px + 10 px blurred glow, arrows 12 px, card borders 3 px, dashed rings 8/6.

## Motion signature

- Slow eased camera between bboxes (`camAt` + `view`), subject lifted above the card slot; one move per idea.
- The map shows *where*, the card shows *who says what*: a new card or head on each spoken claim; columns flip
  from "?" to the claim one by one on the word, each with `SFX.pop`.
- Agreement gets a hit sound and turns the head card green with ●●●; disputes get a rotated stamp ("ยังถกเถียง")
  slamming in from ×2.
- Disputed places: the accepted site pops as a solid dot, the alternative as a dashed spinning ring, both labelled
  with who proposed them; zones dim to 25 % while the close-up is on.
- Timeline of the sources' dates closes a dispute: the event in red, each text a dot on the word, a shaded
  "written later" zone.

## Scenes in the kit

| Component | Shows | Props |
|---|---|---|
| `view`, `PL`, `VW`, `ROUTES` | Camera on a bbox; demo places, views, route | `f, width, height, k, lift` |
| `Zones`, `ZONES` | Approximate kingdom extents, pulsing | `k: {zone: 0–1}, colors` |
| `BigRivers` | Natural Earth rivers (`public/data/nrs-rivers.json`) | `name` |
| `CityDot`, `BattleMark`, `MapTag` | Glowing / dashed-disputed dot, crossed swords, outlined text tag | `at, start, end, …` |
| `TopBar` | Red badge, chapter, year chip | `badge, chapter, year` |
| `HeadCard`, `Confidence` | Head card with tag, headline, stat + "โดยประมาณ", chips, confidence chip | `heads: Head[]` (`sure`) |
| `FourSources` | One column per side; "?" → what that side says (`say`), then the shared point | `sources, checks, bottom, agree, title, color` |
| `Compare` | Source A vs B with glyphs and a stamp | `left, right, stamp` |
| `Timeline` | When each text was written, with a "later" zone | `from, to, marks, zone` |
| `Calendar`, `NotePage`, `Staircase`, `FlickerTable`, `Poll`, … | The rest of the N09 card set | see N09 |
| `Subtitle` | Simple caption line (use the template `Caption` with Whisper timing in an episode) | `lines` |

## Build notes

Layers, bottom to top: `Raster` (world + regional `sea`; add an HLS close-up for zooms below ~1°), `BigRivers`,
`Zones`, arrows, dots and tags inside one `MapFrame`; then HTML `TopBar`, `HeadCard`, cards and captions. Screen
bands (9:16): head card 10–27 %, map 27–56 %, card/illustration slot 56–74 %, captions 76.5 %. In a full episode
alternate the slot between v2 illustration panels (N10 kit) and evidence cards; keep one source list
(`sources.md`) and label every claim with its source on screen. Everything placed by hand on the map (routes,
extents, sites) is approximate — say so on the map tag or in the description.

## Data

Not shipped — fetch into `public/` before rendering:

```bash
npm run imagery -- bluemarble world
npm run imagery -- bluemarble sea 88 2 112 28 7500
npm run rivers -- nrs-rivers 94 9 106 22
```

Credits (description; small on screen when shown): "Imagery: NASA Blue Marble" · "Rivers & lakes: Natural Earth" ·
borders "Natural Earth". For close-ups: `TIME=2025-01-05 npm run imagery -- hls <name> <w s e n> 3000` → "Imagery:
NASA HLS (Sentinel-2)" (check the swath covers the whole bbox; combine two dates if it does not).

## Don'ts

- Never state one chronicle's version as fact; every claim names its source.
- No confidence chip "high" unless independent sides agree.
- No AI portraits on head cards; no photos of manuscripts.
- Do not hide the map under cards — keep the middle band clear.
- Do not draw exact borders for old kingdoms; extents are soft, approximate outlines.

## Credits

Imagery NASA Blue Marble; rivers and borders Natural Earth (public domain). Sound: house library `war_drums`,
`elephant`, `sword_clash`, `wind` (`npm run sfx-lib`) and template UI sounds. Font: Kanit (SIL Open Font License).
Facts in the demo follow the episode's checked list (Thai chronicles, Hmannan Yazawin, van Vliet 1640,
Bocarro/Pimenta; Don Chedi identified 1913 / Phanom Thuan proposal).
