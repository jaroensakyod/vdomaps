# Style recipes

Each recipe = **look** (what the viewer sees) + **build** (how to code it) + **motion** + **fits**. Hex values
are starting points. A chosen style is saved as `project/style.json`:

```json
{ "id": "S03", "bg": "#f3ead7", "land": "#e9d9b0", "water": "#a9c8cf", "border": "#7a5c3a",
  "accent": "#c0392b", "text": "#2b2118", "font": "Sarabun", "labelWeight": 600,
  "grain": 0.06, "strokeScale": 1.0, "projection": "orthographic→mercator" }
```

Techniques referenced below are explained in `remotion-recipes.md`.

---

## A. Satellite + cartoon (Shorts-first, high-retention)

Base for all A-styles: NASA Blue Marble (globe) cross-fading into Sentinel-2 crop (city level), slight
saturation boost (+15%), vignette. Cartoon overlays are flat SVG with 4–6 px dark outline and a drop shadow,
so they read on top of busy imagery. Text: heavy weight, white with black stroke.

| # | Name | Build & motion | Fits |
|---|---|---|---|
| S01 | ดาวเทียม · วันสำคัญ (Satellite Date Event) | Globe → zoom to a city. `TearCalendar` shows the date, a timestamp chip ticks, a radius ring expands from the event point, big number callouts pop. | "On this day", disasters, battles, launches |
| S02 | ดาวเทียม · สองฝ่ายปะทะ (Satellite Two-Side Conflict) | Two colour-coded sides (e.g. #e74c3c vs #3498db). Cartoon soldier/ship/tank tokens slide along routes (`RouteFollow`), front lines drawn as thick dashed paths, explosion bursts on contact. | Wars, invasions, sieges |
| S03 | ดาวเทียม · ระยะทางและเวลา (Satellite Distance + Clock) | Globe rotates to follow a plane token on a great-circle path drawn live; km counter and an analogue clock spin with progress (`DistanceLine`). | "How far is…", flights, expeditions |
| S04 | ดาวเทียม · พรมแดนอดีต/วันนี้ (Satellite Then vs Now) | Semi-transparent (35–45%) political fills over imagery so fields/forest show through; wipe/cross-fade between year A borders and today's. Year label large. | Lost kingdoms, border changes |
| S05 | ดาวเทียม · ตัวคนแทนประชากร (Satellite People Tokens) | 1 token = N people; tokens pop in with staggered spring scale inside the country polygon (sample points with `d3.geoContains` rejection sampling or a population raster). Then the same for country B side by side. | Population comparisons |

## B. Look-driven styles (long-form documentary)

| # | Name | Look | Build | Fits |
|---|---|---|---|---|
| S06 | ภูมิประเทศ 3 มิติ (3D Relief Zoom) | Dark, dramatic hillshade, low sun, tilted camera dives at a target | Precompute hillshade PNG from DEM (gdaldem hillshade -z 2 -multidirectional), map as texture on a three.js plane displaced by the DEM (`@remotion/three`); camera dolly with eased FOV | Geopolitics, mountains, rivers, "why is X where it is" |
| S07 | มาร์กเกอร์บนแผนที่กระดาษ (Marker on Paper) | Printed atlas on paper, hand-drawn marker arrows and circles, tape & sticky notes, subtle handheld shake | Paper texture overlay (multiply); arrows drawn with `PathDraw` using a roughened path (perfect-freehand or rough.js); camera shake = low-frequency noise on translate/rotate (±0.4°) | News explainers, geopolitics |
| S08 | แบบเรียนย้อนยุค (Retro School Atlas) | Pastel fills, halftone dots, slightly misregistered coastline double-stroke, big serif labels | Halftone via SVG pattern fill; misregistration = second coastline stroke offset 2 px in another colour; serif font (Noto Serif Thai) | Kids/education, general knowledge |
| S09 | ไทม์แลปส์พรมแดน (Border Timelapse) | Flat distinct colours per state, year counter rolling, borders morph by year | Keyframe GeoJSON per year (historical-basemaps); cross-fade between snapshots (true morph is rarely worth it); `CountUp` for year | World history, empires |
| S10 | แผนที่ยุทธการ (Battle Campaign Map) | Muted military terrain (olive/khaki), unit blocks (NATO-style rectangles), tapered sweeping arrows | Tapered arrow = polygon built from offset curves of a spline with width decreasing to the tip; draw with clip-path reveal; unit blocks slide | Military history, strategy |
| S11 | อินโฟกราฟิกแบน (Flat Vector Explainer) | Deep navy sea, crisp flat land, bright accent icons racing on two routes, huge numbers | Pure SVG, no texture; ship icons follow routes (`RouteFollow`); compare routes with two counters | Economics, logistics, trade routes |
| S12 | ภาพนูนสีธรรมชาติ (Natural-Colour Relief) | Satellite-like colours (desert/forest/river), slow pans, thin white labels | Blue Marble texture × hillshade (multiply), very slow camera (≤ 2% scale/s) | Geography docs, nature |
| S13 | กระดาษนักสำรวจโบราณ (Parchment Explorer) | Sepia parchment, ink coastline, compass rose, dotted voyage routes | Paper texture, coastline stroke with slight wobble filter (feTurbulence + feDisplacementMap, low scale), dotted `PathDraw` | Exploration, trade, old history |
| S14 | พิมพ์เขียวเดินเรือ (Nautical Blueprint) | Cyan lines on dark blue, depth contours, soundings, 360° compass, bearing lines | Bathymetry contours from GEBCO (d3-contour on the grid), small depth numbers, rotating compass ring | Sea, straits, naval geopolitics |
| S15 | โลกยามค่ำคืนนีออน (Neon Night Earth) | Dark globe in space, city glows scaled by population, bloom | Black Marble texture or point sprites sized by population, additive blending + blur layer for bloom; starfield | Population, urbanisation, economy |
| S16 | ริโซกราฟ 2 สี (Risograph Two-Colour) | Pink + teal ink, halftone, slight misregistration, zine feel | Two layers only (#ff48b0, #00838a) with `mix-blend-mode: multiply`, grain, 1–3 px offset jitter per layer per 6 frames | Fun geography, travel, art channels |
| S17 | ไดโอรามากระดาษตัด (Paper Cut-out Diorama) | Layered paper by elevation band, drop shadows, craft pins, paper water rising | Quantise DEM into 6–10 bands (d3-contour), each band a paper-coloured layer with drop-shadow; water level = clip rect rising | Floods, disasters, local geography |
| S18 | สีน้ำละมุน (Watercolour Wash) | Watercolour fills with wet edges, handwritten labels | Fill + feTurbulence displacement on edges + paper texture; edge darkening via inner stroke blur | Nature, travel, kids |
| S19 | ม้วนภาพหมึกจีน (Ink-on-Scroll) | Black brush ink on rice paper, scroll unrolls, red seal at the end | Brush stroke = variable-width path (perfect-freehand); scroll unroll = horizontal clip reveal with a roller shadow | Asian history, silk road |
| S20 | กระดานชอล์ก (Chalkboard Teacher) | Chalk lines on blackboard, hand-drawn arrows, eraser smudges | Rough stroke (rough.js), chalk texture mask, low-opacity smudge sprites | Education, tutoring |
| S21 | มินิมอลสวิส (Minimal Swiss Typographic) | Thin lines, strict grid, one accent colour, big numerals are the hero | Hairline borders (0.75 px), Helvetica-like + Thai sans (IBM Plex Sans Thai), grid overlay, numbers animate with `CountUp` | Brand, business, clean data |
| S22 | แม่น้ำเรืองแสง (Glowing River Network) | Every river as a glowing line on black, thicker by flow, growing from mouth to source | HydroRIVERS lines, width ∝ log(discharge), draw order by distance from mouth (precompute `dist_dn`), additive glow (blur copy behind) | Nature, river basins, water |
| S23 | บล็อกไอโซเมตริก (Isometric Terrain Blocks) | DEM extruded into square columns, warm palette, tabletop model | Resample DEM to ~80×80 grid; draw isometric prisms back-to-front (or three.js instanced boxes); columns rise with stagger | Hiking, tourism, local geography |

## C. Shorts formats (mechanic-driven)

| # | Name | Mechanic | Build |
|---|---|---|---|
| S24 | แผนที่ไล่สีตามข้อมูล (Data Choropleth) | Countries/provinces fill by value, legend, counters, ranking bars | d3-scale `scaleQuantize`/`scaleSequential`, legend component, bar chart side panel |
| S25 | ลูกโลกหมุนกับเส้นโค้งเรืองแสง (Spinning Globe Arcs) | Dotted globe, glowing arcs between cities, ranking chart | Dot globe = land-mask sampling grid on orthographic; arcs = great circles lifted (scale radius by sin(t·π)·0.15) |
| S26 | พยากรณ์อากาศแบบทีวี (TV Weather Map) | Moving rain radar, isobars, monsoon arrows, temperature chips, bottom forecast bar | Radar = animated noise field (simplex) thresholded into radar palette, clipped to land/region; isobars via d3-contour |
| S27 | ระบายสี "ประเทศที่…" (Countries-That Fill) | Qualifying countries fill one by one, big counter, legend | Sort list, stagger fill every k frames, counter increments with each fill, pop sound per fill |
| S28 | ธงในรูปประเทศ (Flag-in-Country) | Dark map, each country pops with its flag clipped to its shape, big year | SVG `<clipPath>` from the country path, flag `<image>` fitted to the path bounds; spring scale pop |
| S29 | จัดอันดับ (Ranking Map) | Countries light up from #10 to #1 with pins, flags, growing bars | Ordered reveal, number pins, bar chart synced; #1 gets a camera push-in |
| S30 | ควิซทายประเทศ (Guess-the-Country) | Black silhouette, 5-second countdown, hint, reveal with flag + location | Silhouette = country path fitted to frame; countdown ring; reveal = zoom-out to globe with highlight; end with "next one" to loop |
| S31 | ลากเทียบขนาดจริง (True-Size Drag) | Drag a country over another continent at true size (Mercator distortion) | Re-project the country at the target latitude: rotate geometry so its centroid moves to target lat/lon (d3.geoRotation on coordinates), then project with Mercator — shape grows/shrinks naturally |
| S32 | ป้ายบนทุกประเทศ (Label-on-Every-Country) | Value or icon chip pops on each country, then summary | Label placement via `d3.geoCentroid` (or polylabel for odd shapes), collision avoidance by greedy offset, staggered pops |

---

## Inventing a new style
When the user gives a reference clip/channel: describe it in 5 axes and then map each axis to a technique.
1. **Base** (flat / relief / imagery / texture) 2. **Palette** (5 colours) 3. **Line** (hairline / bold /
rough / glow) 4. **Type** (font family, weight, case) 5. **Motion signature** (snappy springs vs slow drift,
camera behaviour). Render a style frame; never copy a channel's logo, characters or exact layout.
