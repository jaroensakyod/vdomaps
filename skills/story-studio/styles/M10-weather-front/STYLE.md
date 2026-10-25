# M10 พยากรณ์อากาศยุค 80 · 1980s TV Weather Board

![cover](cover-9x16.jpg)

**Fits:** weather explainers — cold surges, monsoon onset, heat waves, storm tracks — told the way an old evening
forecast did, with magnets on a board · **Formats:** 9:16 / 16:9 · **Code:** `Demo.tsx` + `kit/Retro.tsx`

## Look

An evening forecast from a 1980s TV studio, recorded off air on VHS. The map is a painted studio board, not
imagery: the sea is chroma-key blue with a soft studio light falling off to deep blue, the land is flat green with
a thick white coastline and a hard navy drop shadow (the board has thickness), borders are thin dark green. Weather
is put on by hand: chunky magnetic symbols slap onto the board — a blue rounded "H" tile with a white label, white
cloud magnets, yellow sun discs with orange rays, white snowflake discs, number tiles (white with orange numbers
while warm, blue with white numbers once the cold arrives) and black city name plates. Every magnet casts a hard
offset shadow that shrinks as it lands. The cold air is a flat pale-blue print with white diagonal hatching north of
a classic front line (white-edged blue line with big triangles); a fat blue wind arrow with a white rim shows the
flow. The picture is soft and a little smeared: red channel bleeds 4 px to the right, scanlines over everything, a
rolling tracking band, head-switching noise at the bottom, vignette. Type is bold rounded Kodchasan: an extruded
yellow-and-red programme title, a white head strip with an orange tab, a big number on a blue magnet tile, and a
bottom strip with an analogue clock (the hands run), the date and the "ภาพจำลอง" note.

| Role | Hex |
|---|---|
| Chroma-key sea (light → deep) | `#2f57f0` → `#1d3fd6` → `#132a9e` |
| Land / border | `#7bbf4e` / `#3c6d24`, coast `#ffffff`, board shadow `#0b1a66` |
| Cold: front, tiles, arrow / air | `#1d5cff` / `#bfe8ff` |
| Warm: sun, tiles, tab | `#ffd23f` / `#ff6a2b` |
| Plates, clock strip, text | `#141428` / `#ffffff` |

**Type:** Kodchasan 500/700 — title 92 px extruded (8 px red/ink stack), head 52 px on white, tab 28 px, big number
84 px on a blue tile, city plates 32 px, number tiles 60 px, date 40 px, note 24 px, kicker 28 px, at 1080.
**Line:** bold-outline — coast 9 px white, front 9 px blue on 17 px white, magnets 5–7 px white rims, wind arrow
28 px blue on 44 px white.

## Motion signature

- Pop-sticker as magnets: every symbol slaps on (spring, damping 9, from 1.45× with a far shadow to 1× with a 6 px
  shadow); when the front passes a city its sun and warm tile lift off (6 frames, up and fading) and a snowflake and
  a blue tile slap on 8 frames later.
- The front sweeps south slowly and evenly (ease in-out over 16 s); the camera drifts and reframes once, smoothly.
- The head strip swaps with a sideways spring; the big number tile drops in rotated −6° and straightens.
- VHS never stops: tracking band rolls down, head noise flickers, the picture jitters ±1 px.
- Sound: `SFX.pop` for every magnet, `wind` / `wind_storm` beds, `SFX.whoosh` for the arrow, `SFX.hit` on the
  country.

## Scenes in the kit (`kit/Retro.tsx`)

| Component | Shows | Props |
|---|---|---|
| `VHS` | Wraps the frame: chroma bleed, soft focus, scanlines, tracking band, head noise, vignette | `children` |
| `Board` | Studio board: chroma sea, flat land, white coast, hard shadow; `chill` fills countries ice blue | `chill: {id, k}[]` |
| `ColdAir`, `frontLat`, `passAt` | Pale hatched cold air + classic front with triangles; front maths | `front, lon0, lon1, fadeIn` |
| `Magnet`, `useSlap` | Any symbol at lon/lat that slaps on (and lifts off) with a hard shadow | `at, on, off, dx, dy, children` |
| `HSymbol`, `Snowflake`, `SunSym`, `CloudSym`, `Tile` | Magnetic symbols, drawn round 0,0 | `s` (+ `label`, `r`, `text`, `cold`) |
| `City` | Name plate + sun and warm tile, swapped for snowflake and blue tile when the front passes | `name, at, from, to, pass, dx, dy, size` |
| `Screen`, `Extruded` | Title, head strip, big number tile, clock strip with "ภาพจำลอง" | `heads, title, date, note, kicker` |
| `view` | Camera on a bbox, lifted | `f, width, height, k, lift` |

`WeatherHead` = `[frame, tag, headline, big number?]`.

## Build notes

Everything inside one `<VHS>`: `MapFrame` (`Board`, `ColdAir`, arrows, magnets, cities), then `Screen`. 9:16: title
4.5 %, head strip 11.5 %, big tile above the clock strip, clock strip 6 % from the bottom (124 px). 16:9: the map is
shifted right by 20 % of the width, head on the left, clock strip on the bottom edge. Place city magnets with
`dx/dy` so tiles never overlap — the board must stay readable at phone size; no more than six cities on screen.
For heat stories flip the logic: suns and orange tiles slap on, the air print turns warm.

## Data

No imagery needed — the board is drawn from the template's Natural Earth borders (`world-atlas` countries-50m).

```bash
npm run sfx && npm run sfx-lib     # UI sounds + house library (wind, wind_storm)
```

For real forecast fields use ERA5 and credit "Contains modified Copernicus Climate Change Service information [year]".

## Don'ts

- Never present the simulated front or temperatures as a real forecast; keep the "ภาพจำลอง" note on screen.
- No satellite imagery, no glow, no glass cards — it is a painted board with magnets.
- Never a magnet without a hard shadow, never a symbol that fades in: they slap on.
- No red/orange for cold or blue for heat; the colour logic is the point of the style.
- Don't fake a real TV station's name or logo; the programme title is generic ("ข่าวอากาศ").

## Credits

Borders: Natural Earth via `world-atlas` (public domain). Everything else drawn in code. Sound: template UI sounds
(`SFX.pop`, `SFX.whoosh`, `SFX.riser`, `SFX.hit`, `SFX.swell`) and house library beds `wind`, `wind_storm`
(`npm run sfx-lib`). Font: Kodchasan (SIL Open Font License).
