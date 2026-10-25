# M04 ฟิล์มลาดตระเวน · Recon Film

![cover](cover-9x16.jpg)

**Fits:** capitals, island cities, forts, "where exactly was it" moments, the opening dive of a history video, any
"look what you can still see from above" story · **Formats:** 9:16 / 16:9 · **Code:** `Demo.tsx` +
`kit/Recon.tsx`, `kit/Pencil.tsx`, `kit/th-rivers.mjs`

## Look

A cold-war aerial reconnaissance print. The real imagery — NASA Blue Marble, then the 30 m NASA HLS mosaic, then a
sharp HLS tile of the city — is graded to grainy green-grey monochrome: grayscale, hard contrast, a green-grey
colour wash, lifted blacks, live film grain, dust specks, the odd hair scratch and a dark vignette. The print sits
in a film frame on a light box: black film base, bright sprocket holes along both long edges, yellowish edge print
with the roll and a frame counter that steps up (014 → 015 → 016) with a shutter flash each time a sharper tile
comes in, fiducial crosses at the middle of each edge, a thin centre reticle and measuring ticks round the image.
A typed dossier label (off-white paper, two strips of tape, slightly crooked) carries the shot: kicker, headline
typed in letter by letter, and a live number — the ground width of the frame counting down — with a red
rubber-stamped "ลับ". The analyst works on top in grease pencil: waxy wobbling strokes drawn on in real time, red
loops round targets, yellow numbered circles with leader strokes and handwritten names, rivers traced in white.
A burned-in data block (date, time, source, frame) and a black/white scale bar sit bottom left; captions are
typed on paper tape.

| Role | Hex |
|---|---|
| Film base (background) | `#0b0c0a` |
| Emulsion mid tone (grade wash `#7d8f74`, lift `#1c2219`) | `#8f9a84` |
| Silver highlight / light box / reticle | `#d8dccf` · `#eef3e6` |
| Grease pencil red (targets, stamp) | `#d9342b` |
| Grease pencil yellow (marks) · white (rivers) | `#f2d64b` · `#eef3e6` |
| Dossier paper / typewriter ink | `#e9e3d0` / `#1b1c18` |

**Type:** Chakra Petch 500–700 for everything typed (dossier head 54 px 700, live stat 84 px, kicker 24 px, data
block 22 px, captions 54 px 600 on tape, edge print 17 px); Sriracha for the analyst's handwriting (names 40 px,
numbers 28 px, notes 26–42 px, with a dark under-stroke) — at 1080. **Line:** grease pencil 4–7 px through a
displacement + wax-texture filter (`#m04-wax`), circles overshoot their start by a tenth of a turn; ticks 1.6 px,
fiducials 2.4 px.

## Motion signature

- **Gate weave:** the print drifts 1–2 px in the gate and its brightness breathes; grain changes every frame.
- One slow continuous analyst zoom (`camAt`, log scale): ~3,300 km → ~190 km → ~9 km of ground width in ~8 s; each
  sharper tile fades in only once it covers the screen, and its arrival is a new frame number with a 5-frame
  shutter flash and a click.
- Dossier headlines type in over 16 frames with a blinking block cursor; the stamp thumps in at the open.
- Pencil work is drawn on: a red loop on the city (16 frames), then the rivers traced together (30 frames) with
  handwritten names, then numbered marks 24 frames apart — circle, leader stroke, name.

## Scenes in the kit

| Component | Shows | Props |
|---|---|---|
| `Print` (`Recon.tsx`) | Grades its children (the `Raster` MapFrame) to film: mono, tint, grain, dust, vignette, gate weave | children |
| `FilmFrame` | Film base, sprocket holes, edge print + counter, fiducials, reticle, ticks | `counter, roll` |
| `Dossier` | Typed label with live stat and "ลับ" stamp; `label` = "before\|after" the number | `heads, end` |
| `DataBlock` | Burned-in data lines + scale bar | `lines, scale` |
| `TapeCaption` | Caption typed on paper tape | `text, start, len, top` |
| `useLayout`, `view`, `tileOpacity`, `screenKm`, `fmtKm`, `P`, `V` | Image window; camera; tile fade; ground width | — |
| `PencilDefs` (`Pencil.tsx`) | The wax filter — once inside the overlay `MapFrame` | — |
| `PencilRing` | Hand loop round a place, drawn on | `at, rx, ry, start, color, k` |
| `Mark` | Numbered pencil circle + leader + handwritten name / sub | `at, n, text, sub, start, side, color` |
| `RiverTrace` | OSM rivers traced in pencil, by name (0 → 1) | `hi` |
| `Note` | Handwritten note on the print | `at, text, start, size, rot` |

`P` holds approximate points on Ayutthaya island (Wat Phra Si Sanphet, Wat Mahathat, Wat Chaiwatthanaram, Wat
Phanan Choeng, Phet fortress). On 16:9 the map is shifted right (`focusX 0.63`) to clear the dossier label.

## Build notes

Two `MapFrame`s with the same camera: the first inside `Print` holds only the `Raster` (so the grade never touches
the pencil); the second, clipped to the image window, holds `PencilDefs` and all pencil marks. Then the shutter
flash, `FilmFrame`, `Dossier`, `DataBlock`, captions. Raster layers in order `world`, `sea`, `plainhls`, `isle`,
the last two faded with `tileOpacity`. HLS is 30 m per pixel — do not zoom past ~4 km of frame width. Not more than
~6 marks on screen; pick each mark's `side` so its name stays inside the image window (9:16 and 16:9 differ). The
grain and wax filters run every frame; that is fine for shorts, for a 10-minute video keep the pencil layer small.

## Data

Not shipped — run once in the project (network). The HLS layer is dated: put a cloud-free dry-season day in
`TIME=` (Thailand: November–February; look at the JPEG and re-fetch with another day if there are clouds):

```bash
# TIME=YYYY-MM-DD npm run imagery -- hls <name> <w s e n> <px>
npm run imagery -- bluemarble world
npm run imagery -- bluemarble sea 88 2 112 28 7500
TIME=2025-01-05 npm run imagery -- hls plainhls 100.0 13.6 101.4 15.3 4096
TIME=2025-01-20 npm run imagery -- hls isle 100.50 14.30 100.62 14.40 2000
npm run osm -- th-central 99.4 13.4 101.6 15.6 bigrivers
npm run osm -- th-ayut-island 100.50 14.30 100.64 14.42 rivers
node src/styles/M04/kit/th-rivers.mjs      # → public/data/th-plain.json, th-island.json
npm run sfx
```

Change the date in the `DataBlock` lines to the day you fetched (the demo says "20 ม.ค. 2568").

## Don'ts

- No colour imagery and no glowing lines: the print is always monochrome, only the pencil and the stamp have colour.
- No Google / Esri / Mapbox imagery, no screenshots of map apps — NASA GIBS layers only; don't sharpen or AI-upscale.
- Do not imitate a real agency's markings, seals or document numbers; the "ลับ" stamp and roll numbers are props.
- Don't cover the city with pencil — a loop, the rivers and up to ~6 marks; points are approximate, say so.

## Credits

Imagery: NASA Blue Marble · NASA HLS (Sentinel-2) — "Contains modified Copernicus Sentinel data 2025".
Rivers: © OpenStreetMap contributors (ODbL). Sound: template UI sounds. Fonts: Chakra Petch, Sriracha (SIL OFL).
