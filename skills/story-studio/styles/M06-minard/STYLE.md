# M06 แผ่นภาพแกะทองแดง · Engraved Statistical Plate

![cover](cover-9x16.jpg)

**Fits:** campaigns, marches, retreats, migrations, any journey where the number of people changes along the way ·
**Formats:** 9:16 / 16:9 · **Code:** `Demo.tsx` + `kit/Plate.tsx`, `kit/Army.tsx`, `kit/data1812.ts`

## Look

A 19th-century statistical plate printed from copper on an ivory sheet — no imagery at all. The sheet has soft
foxing and paper fibre, a pressed plate mark and an engraved border band of dense sepia diagonal hatching between two heavy rules. At the top (left column on
16:9) a title cartouche: double rules with scrolled corners and a little laurel of strokes round a bistre ground on
which everything is reserved in paper white — a letter-spaced kicker, the title, an italic sub-title, two fine rules,
then the live figure: tag, headline and one big plate numeral that wipes in. The map sits in a neatline with degree ticks and italic longitude figures: land shaded with patchy
engraved hatching, the coast water-lined with rings that fade outwards, rivers as fine double cuts (the named river
inked heavier when it matters), small engraved forest marks, towns as small rings with italic names, the target
city as a bold ring with an upright name. The army is a flat tan ribbon with a fine black edge and two engraved
shade lines (out), a solid black ribbon (back); the width is the number of men. The figure riding the head of the
band is an engraved italic numeral on a hairline leader. Below the map, an engraved temperature graph: ruled scale,
dotted drop lines from the retreat band, the line drawn west with the army, dates in italic. The burning city is a
burst of short vermilion rays; winter is small engraved snow stars. Captions are set in the plate's own type
on a flat tan tint panel (a second litho stone) with a double rule; a legend inset sits in the corner of the map.

| Role | Hex |
|---|---|
| Ivory sheet (background) | `#f8f4ea` |
| Advance band (flat tan tint) | `#c9a46c` |
| Copperplate brown-black ink (retreat band, lines, text) | `#21140b` |
| Bistre title ground | `#66290f` (text on it `#f8f4ea`, italics `#e3c9a0`) |
| Sepia (hatching, border band, small italics) | `#8a5530` |
| Vermilion accent (burning city, coldest day, one figure) | `#a8432a` |

**Type:** Taviraj (serif Thai) — title 50 px 700 (40 on 16:9), live figure 64 px 700 (86 on 16:9), headline 40 px
600, tags and sub-title 26 px italic, towns 32 px italic 600, target 38 px 700, graph labels 18–20 px italic,
captions 52 px 600 — at 1080. **Line:** coast 1.8 px + water-lines every 11 px; rivers 1.4–4 px double; neatline
2 px + 0.8 px; border band 22 px of 1.6 px diagonal hatching; band edge 1.3 px, shade lines 0.8 px; graph line 2.6 px; drop lines 0.7 px dotted.

## Motion signature

- **Wipe-reveal:** the map prints itself left to right in the first second; every new figure in the cartouche
  wipes in left to right (14 frames); the graph line and the bands draw on along their route. Nothing pops or
  bounces.
- The camera frames the whole route and barely moves (a 2 % breathe); the band does the moving, keyed to the
  narration with `[frame, lon]`.
- Arrival: the target town is inked in vermilion and the engraved rays flicker for ~70 frames.
- Retreat: black band crawls back, the temperature line draws west with it, snow stars drift in, the coldest
  reading gets a double vermilion ring and "−37°".
- Sound: marching crowd on the advance, fire crackle at the city, winter wind on the retreat, soft ticks on towns.

## Scenes in the kit

| Component | Shows | Props |
|---|---|---|
| `Sheet` (`Plate.tsx`) | Ivory paper, foxing, plate mark, double border | — |
| `usePlate`, `fitBox`, `focusOf` | Screen boxes per format; camera fitting `[w, s, e, n]` into the map box | — |
| `Cartouche`, `Figure`, `Legend` | Title cartouche; live figure (`heads`); band legend | `box, kicker, title, sub` / `heads` |
| `EngravedLand` | Relief hatching, water-lined coast, double-line rivers, forest marks | `rivers, forests, hi` |
| `Neatline` | Map frame with degree ticks | `box` |
| `Town`, `Burning`, `Snow` | Ring + italic name; vermilion rays; engraved snow | `at, text, k, big` / `k, box` |
| `TempGraph` | Engraved temperature graph under the map | `k, upto, box, hot` |
| `TintPanel`, `PlateCaption` | Tan tint panel for captions; the caption text in it | `text, start, len` |
| `headAt`, `kAt`, `lonAt` | `[frame, lon]` keys → band progress / head longitude | `keys, pts, frame` |
| `ArmyBand`, `ArmyCounter` (`Army.tsx`) | Flat band along `[lon, lat, men]`; engraved figure at the head | `pts, k, color, perMan, shade` |
| `kit/data1812.ts` | Minard's 1812 numbers: `ADVANCE`, `RETREAT`, `NORTH_*`, `FAR_*`, `CITY`, `TEMPS` | — |

## Build notes

One `MapFrame` (camera from `fitBox(ROUTE, map)`, focus from `focusOf(map)`), map layers inside a clip to the map
box (it also carries the opening wipe): `EngravedLand` → `Burning` → bands → towns → counter → `Snow`; then
`Neatline` and `TempGraph` outside the clip (the graph uses the projection so its longitudes line up with the band).
HTML on top: `Cartouche` + `Figure`, the legend inset, `TintPanel` + captions, the credit line. 9:16 boxes: title
3–26 %, map 27–55 %, graph 57.5–71.5 %, caption panel 74–86 %. 16:9: cartouche + caption panel in the left column,
map and graph on the right. Keep `perMan` fixed for the whole video (biggest force ≈ 115 px). The paper and relief filters are static per
frame; for a 10-minute video still `Sheet` once to a PNG.

## Data

Land from `world-atlas` (in the template). Rivers are not shipped — fetch once (Europe crop):

```bash
npm run rivers -- eu-rivers -12 34 45 64                    # public/data/eu-rivers.json
npm run sfx && npm run sfx-lib                              # army_march_crowd, fire_crackle, wind_storm
```

The 1812 numbers are in `kit/data1812.ts` (from Minard's chart via the HistData R package).

## Don'ts

- No satellite imagery, no glow, no dark cards — the whole frame is one printed sheet.
- Don't copy the 1869 plate's layout or lettering; keep this composition (cartouche, neatline, graph below).
- Don't scale the band with the zoom; don't use colours other than tan (out) and black (back) for the main army.
- One vermilion accent at a time. Don't present Minard's routes or counts as exact: say "ตามแผนภาพของ Minard".

## Credits

Data: Charles Joseph Minard (1869), via the HistData R package (M. Friendly; Minard.troops / cities / temp).
Map drawn from Natural Earth land, rivers and lakes (public domain). Sound: template UI sounds and house library
(Mixkit / Pixabay licences). Font: Taviraj (SIL Open Font License).
