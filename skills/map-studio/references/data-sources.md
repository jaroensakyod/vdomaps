# Open map data — sources, licenses, credit lines

Licenses change. Before using a source for a monetised video, open its license page and confirm. If a source
is not on this list, check: (a) commercial use allowed, (b) derivatives allowed, (c) attribution text. NC
(non-commercial) or ND (no-derivatives) = do not use for a monetised channel.

| Layer | Source | License | On-screen credit |
|---|---|---|---|
| Countries, admin-1, coastlines, lakes, rivers (coarse), populated places | Natural Earth (naturalearthdata.com). Pre-made TopoJSON: npm `world-atlas` (countries/land 10m·50m·110m) | Public domain | "Natural Earth" (optional but polite) |
| Admin boundaries (provinces / ADM1–ADM3), per country | geoBoundaries gbOpen (geoboundaries.org) | **Varies per country** — read `boundaryLicense` in the API response. Thailand ADM1 is ODbL (from OSM) | Thailand: "© OpenStreetMap contributors (via geoBoundaries)"; CC BY countries: "Boundaries: geoBoundaries" |
| Roads, canals, buildings, detailed rivers, place names | OpenStreetMap via Overpass API or Geofabrik extracts | ODbL 1.0 | "© OpenStreetMap contributors" — required, visible |
| River network with discharge (line width by flow) | HydroRIVERS (hydrosheds.org) | Free incl. commercial with attribution — read the HydroSHEDS license PDF | "HydroRIVERS / HydroSHEDS (Lehner & Grill 2013)" |
| Elevation (DEM) for relief, hillshade, 3D | Copernicus DEM GLO-30/90 (via AWS open data); SRTM / NASADEM (NASA, public domain) | Copernicus: free incl. commercial with attribution; NASA: public domain | "Copernicus DEM © DLR e.V. 2010–2014 and © Airbus 2014–2018, provided under COPERNICUS by the EU and ESA" / "NASA SRTM" |
| Bathymetry | GEBCO grid | Public domain-like, attribution requested | "GEBCO Compilation Group (year) GEBCO Grid" |
| Natural-colour imagery, global | NASA Blue Marble Next Generation (visibleearth.nasa.gov) | NASA imagery is generally not copyrighted | "NASA Earth Observatory / Blue Marble" |
| Night lights | NASA Black Marble (VIIRS) | as above | "NASA Earth Observatory / Black Marble" |
| High-res imagery (city level) | Sentinel-2 L2A via Copernicus (raw scenes) | Free incl. commercial with attribution | "Contains modified Copernicus Sentinel data [year]" |
| ⚠️ Sentinel-2 cloudless mosaic (EOX) | — | 2016 version CC BY 4.0; 2018+ versions **CC BY-NC-SA** → not for monetised videos | — |
| ⚠️ Esri World Imagery, Google, Mapbox, Bing tiles | — | **Not allowed** in videos without a commercial license | — |
| Historical borders (world, by year) | `aourednik/historical-basemaps` (GitHub) | **GPL-3.0** on the data — attribution + share-alike of the data; acceptable for video output in practice, credit it | "Historical borders: historical-basemaps (A. Ourednik)" + "approximate" |
| Historical borders, Europe detail | CShapes 2.0 (country borders 1886–2019) | CC BY-NC-SA → **avoid** for monetised | — |
| Population grid | WorldPop, GPWv4 (SEDAC) | CC BY 4.0 | "WorldPop" / "CIESIN GPWv4" |
| Country statistics | World Bank Open Data, UN data, Our World in Data | CC BY 4.0 | "Data: World Bank" etc. |
| Flags | npm `flag-icons` (SVG) | MIT | none needed |
| Weather / rain radar look | Generate synthetic, or ERA5 (Copernicus C3S) for real fields | ERA5: free incl. commercial with attribution | "Contains modified Copernicus Climate Change Service information [year]" |
| Thai fonts | Noto Sans Thai, IBM Plex Sans Thai, Sarabun, Kanit, Mitr, Chakra Petch (Google Fonts) | SIL OFL | none needed |

## Fetch scripts (in `template/scripts/`, tested)

| Script | Source | Output | Credit it prints |
|---|---|---|---|
| `fetch-imagery.mjs` | NASA GIBS WMS (Blue Marble NG, VIIRS Black Marble, shaded relief) | `public/raster/<name>.jpg` + `.json` | "Imagery: NASA Blue Marble" / "NASA Black Marble (VIIRS)" |
| `fetch-dem.mjs` | Copernicus DEM GLO-90 COGs on AWS (no account; sea tiles → 0 m) | hillshade / relief PNG + `-dem.json` | Copernicus DEM line above |
| `fetch-osm.mjs` | Overpass API, presets rivers / bigrivers / roads / rail / cities | `public/data/<name>.geojson` with `name` (Thai first) | "© OpenStreetMap contributors (ODbL)" |
| `fetch-rivers.mjs` | Natural Earth 1:10m rivers + lakes (reservoirs dropped) | `public/data/<name>.json` | "Rivers & lakes: Natural Earth" |
| `fetch-history.mjs` | aourednik/historical-basemaps, one year | `public/data/history-<year>.geojson` | "historical-basemaps (A. Ourednik, GPL-3.0), approximate" |
| `fetch-data.mjs` | geoBoundaries ADM1 | `public/data/<iso>-adm1.geojson` | per-country licence it reports |

HydroRIVERS (flow-scaled widths) has no script yet: continent zips are several hundred MB of shapefile.

## Fetching recipes (manual)

```bash
# Countries (already in template via world-atlas npm package)
npm i world-atlas topojson-client

# Thailand provinces from geoBoundaries (simplified GeoJSON URL is in the API response)
curl -s https://www.geoboundaries.org/api/current/gbOpen/THA/ADM1/ | jq -r .simplifiedGeometryGeoJSON

# OSM waterways in a bbox via Overpass (south,west,north,east)
curl -s https://overpass-api.de/api/interpreter --data-urlencode \
  'data=[out:json][timeout:120];way["waterway"~"river|canal"](13.4,100.3,14.0,100.9);out geom;' > canals.json
# convert with osmtogeojson, then simplify:
npx mapshaper canals.geojson -simplify 15% keep-shapes -o format=topojson public/data/canals.json

# DEM tile (Copernicus GLO-90, 1°×1° COG on AWS, no auth)
# https://copernicus-dem-90m.s3.amazonaws.com/Copernicus_DSM_COG_30_N13_00_E100_00_DEM/Copernicus_DSM_COG_30_N13_00_E100_00_DEM.tif
```

Simplify everything with `mapshaper` (`-simplify` + `-clip bbox=`) — rendering speed and file size depend on it.

## Credit placement
- Small (≈ 1.4% of frame height), bottom corner, 60–80% opacity, visible the whole time the layer is on screen.
- Repeat all credits in the description. Template component: `<Credit lines={[...]} />`.
