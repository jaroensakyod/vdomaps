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

## Rasters (DEM, imagery)
- Pre-process outside Remotion (gdal or a Node script with `geotiff`): crop, reproject to EPSG:4326, export PNG.
- Globe imagery: `@remotion/three` sphere with the Blue Marble equirectangular texture, or render to canvas with
  `d3-geo-projection` raster reprojection for a 2D look (slower — cache per frame range).
- Hillshade: `gdaldem hillshade -multidirectional -z 1.5 dem.tif hs.tif`, multiply over colour.

## Thai text
- Load with `@remotion/google-fonts/<Font>` (`loadFont()` at module top) — e.g. NotoSansThai, IBMPlexSansThai,
  Sarabun, Kanit. Font loading is awaited by Remotion automatically.
- Thai stacks tone marks above vowels: give labels `lineHeight: 1.5` and padding-top, or they clip.
- Never animate Thai text letter-by-letter with string slicing (breaks combining marks) — use
  `Intl.Segmenter("th", {granularity: "grapheme"})` or reveal with a clip mask.
- Text outline over imagery: `paintOrder: "stroke"`, `stroke: #000`, `strokeWidth: 0.12em` (SVG text) or
  `WebkitTextStroke` + `paintOrder` for HTML.

## Performance
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
