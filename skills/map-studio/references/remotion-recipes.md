# Remotion + d3-geo recipes

All components referenced here are in `template/src/components/`. Read their source before writing a scene.

## Golden rules
- Everything is a pure function of `frame`. No `useEffect` timers, no CSS transitions, no `Math.random()`
  (use `random(seed)` from remotion).
- Data loads with `staticFile()` + `delayRender()/continueRender()` (see `useTopo`), or import small JSON directly.
- Design at 1920×1080 and 1080×1920 with the same scene code: read `useVideoConfig()` and lay out relative to
  `width`/`height`; `const s = Math.min(width, height) / 1080` is the unit for stroke widths and font sizes.

## Camera (the most important piece)
`src/components/camera.ts`:
- A camera = `{ lon, lat, scale }` where `scale` is d3 projection scale in "frame units" (s·px).
- `cameraForFeature(feature, w, h, pad)` fits a GeoJSON feature: rotate to its centroid, then
  `projection.fitExtent` gives the scale.
- `useCamera(keys)` interpolates between keyframes `{frame, cam}`: centre moves along the **great circle**
  (`d3.geoInterpolate`), scale interpolates in **log space** (zooms feel constant-speed), easing
  `Easing.inOut(Easing.cubic)`. Hold = two keys with the same cam.
- Orthographic for globe shots; it still looks fine zoomed to country level. For a flat look at city level,
  cross-fade (or switch at a cut) to `geoMercator` with the same centre and an equivalent scale
  (orthographic scale ≈ mercator scale near the centre).
- Clip the globe: `projection.clipAngle(90)`; draw the sphere outline `{type:"Sphere"}` for ocean + rim.

## Drawing
- `geoPath(projection)` → SVG `d`. For > ~5k paths per frame or rasters, use `<canvas>` with
  `geoPath(projection, ctx)` inside a `useLayoutEffect` keyed on frame (still deterministic).
- **Line reveal (`PathDraw`):** measure total length once (`SVGPathElement.getTotalLength()` from a hidden
  path, or approximate with `d3.geoLength × scale`), animate `strokeDashoffset`. For lines that move with the
  camera, prefer slicing the coordinate array by progress (`lineSlice`) — dash tricks break when length changes.
- **Great-circle routes:** sample 128 points with `geoInterpolate(a,b)`; distance in km = `geoDistance(a,b) × 6371`.
- **Tapered arrows:** build left/right offset polylines with width w(t) = w0·(1−t)^0.6, close into a polygon,
  add a triangle head; reveal with a clip-path rect or by slicing.
- **Fills:** animate `fillOpacity` and/or a radial clip from the centroid ("ink spread").
- **Labels:** position at `projection(centroid)`; hide when the point is behind the globe
  (`geoDistance(centre, point) > π/2`). Pop with `spring({frame: frame - start, fps, config:{damping: 12}})`.
- **Halftone / paper / grain:** SVG `<pattern>` or a pre-rendered PNG overlay with `mix-blend-mode: multiply`.
  Animated grain: swap among 4 noise PNGs by `frame % 4`.
- **Glow:** duplicate the layer behind itself with `filter: blur(6s px)` and higher brightness; for many
  glowing lines use canvas with `globalCompositeOperation = "lighter"`.

## Overlays & sound
- `ReasonChips` (`Reasons.tsx`): numbered reasons 1 2 3 that pop in on cue; the newest is highlighted, earlier
  ones dim. Put a pop SFX on each `at`.
- `Thumbnail` (`Thumbnail.tsx`): a frozen episode frame + headline with an accent word.
- `Music`, `Sfx`, `SFX`, `voiceSpans` (`Sound.tsx`): ducked music bed and synthesised effects (`audio.md`).
- `Caption` takes `words` + `spoken` from `buildBeats()` for word-timed subtitles.

## Rasters (DEM, imagery)
- Fetch as equirectangular images + bbox sidecar: `scripts/fetch-imagery.mjs` (NASA GIBS: Blue Marble, Black
  Marble, shaded relief) and `scripts/fetch-dem.mjs` (Copernicus GLO-90 → `-hillshade.png`, `-relief.png`,
  `-dem.json` with min/max/peak and a ~200-wide elevation grid). No gdal needed.
- Draw with `<Raster layers={[{ name: "world" }, { name: "x-hillshade", op: "multiply", opacity: 0.8 }]} />`:
  the bbox is cut into ≤ 2.5° cells, each split into two triangles drawn with an affine transform onto the
  projected corners (canvas in a `<foreignObject>`), clipped to the globe. Works from whole-globe to valley
  zoom; animate `opacity` per layer to cross-fade (day → night: night layer with `op: "lighter"`).
- Fetch rasters wider than the shot so 9:16 framing does not show the edge.
- Keep big images ≤ 8192 px; one world Blue Marble (8192×4096) + one regional image is plenty.

## Stills that move (free 2.5D: Flow images, paintings, photos)

Real character motion from AI video (local Wan/FramePack, Flow or Grok video) is optional and costs GPU time or
credits. The default, which runs on any student laptop with no API and no credits:

1. Make the still: Google Flow → Nano Banana, 0 credits (9:16 for full screen, 16:9 for map panels). Keep the style
   one look per episode (e.g. hand-coloured engraving next to an old map). Never show a real king's face up close.
2. `npm run flow-layers -- <image> <name>` → `public/flow/<name>-depth.png`, `<name>-L0..L5.png`, `<name>.json`.
   Depth Anything V2 small runs on the CPU (~5–10 s an image; the ~100 MB model downloads once). Each layer is
   its depth band plus what lies nearer, repainted from the band's own colours, so drifting never doubles objects.
   Add `--vivid` for sepia / old-paper pictures over an old map (they blend in otherwise): paper → white, blue sky
   wash, more saturation — colours only, the lines stay exactly as drawn.
3. Draw it with `<Flow25D>` (`src/components/Flow25D.tsx`) inside any svg — `box` = the InsetPanel geom for a map
   panel (give the panel the picture's aspect: news-kit `Panel size={{ w: PANEL_H * aspect, h: PANEL_H }}`, so the
   frame fits the picture) — or `<Flow25DScreen>` full screen. Options: `zoom`, `pan`, `parallax`, `hits` (soft
   shake + flash), `wind` areas in picture fractions (flags, parasols, trees), `smokeBehind`, `light` [x, y] with
   rays, `dust`. Keep `windStrength` ≤ 3: thin spires and spears melt above that.
4. More motion (cut-out animation, still free): list the parts in a `parts.json` (box + a few clicks + pivot in
   picture fractions, `parent` for parts that ride on another, `depth`), run `npm run flow-parts -- <name> parts.json`
   (SlimSAM on the CPU, ~15 s; holes are repainted) and `npm run flow-layers -- public/flow/<name>-base.jpg
   <name>-base`, then `<Flow25D name="<name>-base" rig="<name>" pose={(part, frame) => ({ rotate, dx, dy })}>`.
   Keep body moves to a few degrees / px; only tools and arms swing far. Reference: `episodes/thaihistory/ep10`
   (`duel-parts.json`, `duelPose` in chapters.tsx).
5. One still carries ~5–7 s; check a tile of frames (`ffmpeg -i clip.mp4 -vf fps=3,tile=6x2 -frames:v 1 tile.jpg`)
   for doubled edges before a full render.
Reference: `episodes/thaihistory/ep10` (old-map base + Flow stills).

## Thai text
- Load with `@remotion/google-fonts/<Font>` (`loadFont()` at module top) — e.g. NotoSansThai, IBMPlexSansThai,
  Sarabun, Kanit. Font loading is awaited by Remotion automatically.
- Thai stacks tone marks above vowels: give labels `lineHeight: 1.5` and padding-top, or they clip.
- Never animate Thai text letter-by-letter with string slicing (breaks combining marks) — use
  `Intl.Segmenter("th", {granularity: "grapheme"})` or reveal with a clip mask.
- Text outline over imagery: `paintOrder: "stroke"`, `stroke: #000`, `strokeWidth: 0.12em` (SVG text) or
  `WebkitTextStroke` + `paintOrder` for HTML.

## Performance
- **Render on the GPU:** `template/remotion.config.ts` sets `setChromiumOpenGlRenderer("vulkan")` + 50% concurrency.
  Measured (RTX 2060, 150 frames of a map scene): software 49.8 s, angle 37 s, **vulkan 13.1 s**, identical image
  (PSNR 42 dB). More concurrency did not help with vulkan. No working Vulkan driver → remove the line or `--gl=angle`.
  Intel UHD (i3-N305, 90 frames of the Red Cliffs battle): software 74 s, angle 45 s, **vulkan 38 s** (PSNR 46.7 dB
  vs software); concurrency 25 %, 50 % and 100 % all within 2 s.
- **Where render time goes** (RTX 2060, 600 frames 9:16, concurrency 8): blank frame 16.9 s (capture alone ≈ 60 fps),
  map only 42.6 s, projecting the map in JS without drawing 22 s. The cost is Chrome **painting long SVG paths**,
  not d3 and not encoding (x264 = 2.8 s per 300 frames; NVENC 1.5 s and no faster overall; JPEG quality 60 no faster).
- **Clip paths to the frame:** `projectionFor` in `camera.ts` sets `clipExtent` 120 px outside the frame, so
  off-screen coastline is never handed to Chrome. Same pixels (PSNR ∞), episode render 39 s → 28.5 s per 600 frames.
- **Batches:** `npm run render:batch -- --loudness S02fb=out/ep02-fb.mp4 …` bundles once and runs 3 renders side by
  side at concurrency 6 (one render leaves the GPU ~70 % idle). 4 × 75 s episodes in 5:17 min incl. loudness,
  ~79 s each (was ~3:06 each one at a time). 2 side by side: 1.4×, 3 side by side: 1.6× over one render.
- **Never run full-frame SVG noise filters (feTurbulence) per frame** — a 1-minute video went from minutes to
  well over 25 minutes. Render textures once to PNG with a 1-frame composition (`npx remotion still … --image-format=png`)
  and overlay them with `<Img>`.
- Simplify data (mapshaper) — the #1 render-speed lever. 50m countries for world/continent shots, 10m only
  when zoomed to a region, and clip 10m to the bbox first.
- Memoise projected paths when the camera is static (`useMemo` keyed on cam values).
- Render: `npx remotion render <id> out/x.mp4 --concurrency=50%`. Draft: `--scale=0.5 --crf=28`.
- Same scene in 16:9 and 9:16: register two `<Composition>`s with the same component and different size.

## Rendering commands
```bash
npm run dev                                   # Remotion Studio
npx remotion still MapTest out/f.png --frame=120
npx remotion render MapTest out/test.mp4 --crf=18
npx remotion render MapTestVertical out/test-v.mp4
```
