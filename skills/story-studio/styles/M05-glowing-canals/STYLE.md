# M05 คลองและแม่น้ำเมืองเก่าเรืองแสง · Old Canals and Rivers, Glowing

![cover](cover-9x16.jpg)

**Fits:** city history, how a river city grew, floods, trade routes by water, moats and shortcut canals ·
**Formats:** 9:16 / 16:9 · **Code:** `Demo.tsx` + `kit/News.tsx`, `kit/Canals.tsx`, `kit/canals.mjs`

## Look

Real NASA HLS imagery of today's city, cooled and darkened so it reads as a night map, with the old waterways
drawn on top as neon lines: a wide blurred halo, a solid core and a thin white centre. Every waterway first draws
itself on in cyan; then the story lights one group at a time in its own colour — the river's old loop in gold, a
shortcut stretch in hot red (only that stretch, clipped), Thonburi-era canals in green, the early Rattanakosin moat
in pink — while the rest dims to 45 %. Dark pill tags with a coloured dot name the waterways on the water; the
dark head card of the news look carries the era, the headline and a year.

| Role | Hex |
|---|---|
| Background / grade over the imagery | `#02060d` / `#04102a` at 42 % |
| River and base waterways | `#5fd0ff` |
| Old course (lit) | `#ffc94a` |
| Shortcut / emphasis | `#ff6b5f` (card accent `#ff3b30`) |
| Era colours | Thonburi `#58e08f`, Rattanakosin `#ff7ad9` |
| Card / tags / text | `#080e1a` at 86 % / `#ffffff` |

**Type:** Kanit 700/900 at 1080 — head 54 px, stat 92 px, tag 26 px, water tag 32 px 900 + 22 px sub, captions
58 px. **Line:** glow — canal core 3–10 px (rivers ×2), halo 3.4–6.4× core with 6–14 px blur at 32–72 %, white
centre 0.28× core.

## Motion signature

- Camera almost still: one slow push (+17 %) over the whole scene; the water moves, not the map.
- Draw-on: each waterway grows along its length (`pathLength`) over ~70 frames, staggered 6 frames.
- Light-up: a group goes from base to lit in 14 frames (halo widens and brightens, core thickens), the rest dims.
- Emphasis: a clip zone lights only one stretch of a long river and pulses ±15 %.
- New layers (later canals) draw on in their era colour over 30 frames with a pop sound and a tag.

## Scenes in the kit

| Component | Shows | Props |
|---|---|---|
| `GlowLine` | One waterway as halo + core + white centre, draw-on and lit | `f, draw, lit, color, dim, clip` |
| `ClipZone` | Circular clip at lon/lat (radius in °) to light one stretch | `id, at, r` |
| `WaterTag` | Dark pill name tag on the water | `text, sub?, at, start, color, dx, dy` |
| `DuskGrade` | Darkens the imagery so the glow reads | `k` |
| `useCanals`, `midOf`, `ERA`, `CYAN` | Load `data/old-canals.json`; tag point; era colours | — |
| `HeadCard`, `TopBar`, `view` | News card per shot; badge + era chip; camera on a bbox | as M02 (`TopBar` takes `chip`) |
| `canals.mjs` | Builds `old-canals.json` from the OSM dump with an `era` per name | `node … [in] [out]` |

## Build notes

Raster `world` + one HLS tile under `<DuskGrade>`, then all `GlowLine`s, then the lit groups again on top, then
tags. Blur filters are per path; keep it to ~15 waterways (merge segments per name, as `canals.mjs` does). For
another city: fetch OSM `rivers` for a small bbox, edit `KEEP` in `canals.mjs` (name → era) — leave out canals dug
after the period of the story — and fetch an HLS tile of the same bbox.

## Data

Not shipped — run once in the project (network). HLS: pick a cloud-free dry-season day for `TIME=`.

```bash
npm run imagery -- bluemarble world
TIME=2025-01-20 npm run imagery -- hls bkkhls 100.40 13.66 100.58 13.82 2400
npm run osm -- th-bkk 100.44 13.68 100.54 13.80 rivers
node src/styles/M05/kit/canals.mjs          # → public/data/old-canals.json (10 waterways)
npm run sfx && npm run sfx-lib               # UI sounds + house library (ship_sailing)
```

The shortcut point and the old-loop story are approximate (the canal is said to date from King Chairacha's reign,
around พ.ศ. 2085) — keep "โดยประมาณ" on screen and in the description.

## Don'ts

- Don't draw every modern canal — an old-city story shows only the waterways of its period.
- Don't light more than one group at a time; dim the rest.
- No thick lines at wide zoom; the width is tied to zoom for a reason.
- Don't skip the grade — glow on bright daytime imagery looks washed out.

## Credits

Imagery: NASA HLS (Sentinel-2) — "Contains modified Copernicus Sentinel data 2025"; NASA Blue Marble.
Waterways: © OpenStreetMap contributors (ODbL). Sound: template UI sounds and the house library. Font: Kanit
(SIL OFL).
