# M07 กระดานยึดเมือง · Territory Board Game

![cover](cover-9x16.jpg)

**Fits:** warring states, civil wars, any story where "who holds what" changes several times (Three Kingdoms,
Warring States, Wars of the Roses, Ayutthaya vs Burma city by city) · **Formats:** 9:16 / 16:9 ·
**Code:** `Demo.tsx` + `kit/Board.tsx`, `kit/eras.ts`, `kit/places.ts`

## Look

The story is a board game on a walnut table under a soft top light. The map is printed on a thick board (dark
navy slab edge, glossy cream face, a navy/yellow checker border) as a grid of chunky square tiles: aqua sea tiles
with little wave prints, sand tiles for unheld land, and every held tile in its side's bright printed colour, each
tile with a soft drop shadow and a gloss strip. Side names are printed on the board in big white letters with a dark
outline. Cities are wooden pawns standing on the board — holder colour, dark outline, a highlight, a soft shadow —
with a white name tag. Above the board an era card ("การ์ดยุค · ตาที่ n", the year, the era title, a stripe per
side) sits on its deck next to a white die. Below (right column on 16:9) a score track of numbered squares where
each side's marker cylinder stands on the number of cities it holds. The kicker is a yellow pill, the headline big
white Mitr with a hard dark drop. The whole board leans back a few degrees on the table.

| Role | Hex |
|---|---|
| Table (background) | `#2a1a10` |
| Board face / edge print | `#fbf3df` / `#1d3557` + `#f4c430` |
| Sea tile / unheld land tile | `#74d3e6` / `#f1dfb0` |
| Outline ink | `#1d2433` |
| Sides | `#2b47c9` blue · `#2fae5a` green · `#e2452f` red · `#f2b632` yellow · `#8e52c8` purple · `#f08a24` orange · `#7a7f8c` grey |

**Type:** Mitr — headline 92 px 700 (60 on 16:9), side names 64 px 700, era year 76 px 700, era title 32 px 600,
kicker 30 px 600, city tags 19 px 600, track numbers 18–24 px 700 — at 1080. **Line:** bold dark outlines on every
piece (2–3 px), tiles 34 px with 3 px gaps and 5 px corner radius.

## Motion signature

- **Tabletop tilt:** the board settles from a 12° lean to 7° at the open and leans back a little at each new era.
- The opening deal: tiles drop in as a wave from west to east (spring), pawns pop onto their cities one by one.
- A new era = a new card flips over the deck (rotateY spring) and the die tumbles and lands on the number of sides;
  then the tiles that change hands flip over in a west → east wave (8 frames each, colour swaps at the edge-on
  moment); 30 frames later the captured cities' pawns hop and land in the new colour; then the score markers hop
  to their new squares.
- Sound: wood knock on each new card and on the pawn hops, a whoosh on the flip wave, drums at the open.

## Scenes in the kit

| Component | Shows | Props |
|---|---|---|
| `Table` (`Board.tsx`) | Walnut table, soft top light | — |
| `GameBoard` | Board slab, checker border, tile map coloured by holder per step, side names; children drawn on the board | `steps, eras, bb, centre, start, cellPx` |
| `useBoardLayout`, `useBoardProjection` | Boxes per format; the fixed projection of the printed map (`proj(lonlat)` → board px) | `bb` |
| `Pawn` | Wooden pawn with name tag; `hop` 0→1 changes colour at the top | `x, y, color, from, hop, label` |
| `ScoreTrack` | Numbered squares 0…n; one marker per side on its count | `n, sides: {key, color, count, at}` |
| `EraCard`, `Die` | Era card flipping in from the deck; die tumbling to the number of sides | `steps, eras` |
| `stepAt`, `fade` | Current step; 0→1 helper | — |
| `ERAS` (`eras.ts`), `CITIES` (`places.ts`) | Sides (name, colour, area ring, label point) per year; cities with holder per year | — |

For a new story write new `ERAS` (one entry per moment, areas as rough `[lon, lat]` rings) and `CITIES`
(`held: { year: sideKey }`), set the board's bbox `BB` and pass a `steps` schedule. Keep 2–4 sides and 6–12 cities.

## Build notes

Order: `Table` → tilted wrapper (`perspective` + `rotateX`) holding `GameBoard` with the pawns as children → title,
`EraCard`, `Die`, `ScoreTrack`, credit. The tile grid (which tile is land, who holds it in each era) is computed once
per format from the fixed projection with `geoContains` on Natural Earth 110 m land, so the board never moves on its
own — only the tilt does. Smaller `cellPx` = finer map but more tiles (34 px ≈ 750 tiles on 9:16). 9:16 bands:
title 3.6–15 %, era card 15–26 %, board 27–79 %, score track 86–91 %.

## Data

Land comes from the `world-atlas` npm package (already in the template); nothing to fetch. Sound:
`npm run sfx && npm run sfx-lib` (`war_drums`, `wood_hit`).

## Don'ts

- No parchment, no ink washes, no satellite imagery — it is a printed game board with plastic/wooden pieces.
- Never present tile areas as exact borders: keep "เขตโดยประมาณ" on screen and in the description.
- Do not change a side's colour mid-video; viewers learn them in the first 10 seconds.
- Do not flip more than ~5 cities at once; no camera moves — the board stays put on the table.
- Do not copy a real game's board, logo, card frame or pieces.

## Credits

Map: Natural Earth land (via `world-atlas`) — public domain; credit line "แผนที่ Natural Earth" + "เขตโดยประมาณ".
Sound: template `SFX.swell`, `SFX.whoosh`, `SFX.tick`; house library `war_drums`, `wood_hit` (`npm run sfx-lib`).
Font: Mitr (SIL Open Font License).
