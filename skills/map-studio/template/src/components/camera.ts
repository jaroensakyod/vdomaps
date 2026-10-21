import { geoCentroid, geoDistance, geoInterpolate, geoOrthographic, type GeoProjection } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
import { Easing } from "remotion";

// A camera looks at [lon, lat] with a d3 projection scale (pixels). Scale ≈ globe radius in px.
export type Cam = { lon: number; lat: number; scale: number };
export type CamKey = { frame: number; cam: Cam; easing?: (t: number) => number };

const defaultEase = Easing.inOut(Easing.cubic);

// Centre travels along the great circle, scale interpolates in log space so zooms feel constant-speed.
export const camAt = (keys: CamKey[], frame: number): Cam => {
  if (frame <= keys[0].frame) return keys[0].cam;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame >= b.frame) continue;
    const t = (b.easing ?? defaultEase)((frame - a.frame) / (b.frame - a.frame));
    const [lon, lat] = geoInterpolate([a.cam.lon, a.cam.lat], [b.cam.lon, b.cam.lat])(t);
    const scale = Math.exp(Math.log(a.cam.scale) + (Math.log(b.cam.scale) - Math.log(a.cam.scale)) * t);
    return { lon, lat, scale };
  }
  return keys[keys.length - 1].cam;
};

const CLIP_MARGIN = 120; // px: wider than any stroke, so clip edges never show

// focusY / focusX: where the camera centre sits on screen (0.5 = middle); move it away from a panel that covers
// part of the frame (lower part on phones, right side on 16:9).
export const projectionFor = (cam: Cam, width: number, height: number, focusY = 0.5, focusX = 0.5): GeoProjection =>
  geoOrthographic()
    .rotate([-cam.lon, -cam.lat])
    .scale(cam.scale)
    .translate([width * focusX, height * focusY])
    .clipAngle(90)
    // Cut paths just outside the frame: Chrome then paints only what is on screen (far fewer path segments).
    .clipExtent([[-CLIP_MARGIN, -CLIP_MARGIN], [width + CLIP_MARGIN, height + CLIP_MARGIN]])
    .precision(0.3);

// Whole globe on screen, `fill` = radius as a fraction of the short side.
export const globeCam = (lon: number, lat: number, width: number, height: number, fill = 0.42): Cam => ({
  lon,
  lat,
  scale: Math.min(width, height) * fill,
});

// Fit a feature (or FeatureCollection / LineString) into the frame with padding as a fraction of each side.
export const camForFeature = (
  object: GeoPermissibleObjects,
  width: number,
  height: number,
  pad = 0.15,
  centre?: [number, number],
): Cam => {
  const [lon, lat] = centre ?? geoCentroid(object as never);
  const p = geoOrthographic().rotate([-lon, -lat]).clipAngle(90);
  p.fitExtent(
    [
      [width * pad, height * pad],
      [width * (1 - pad), height * (1 - pad)],
    ],
    object as never,
  );
  return { lon, lat, scale: p.scale() };
};

// True when a point is on the visible hemisphere (with a small margin so labels fade before the rim).
export const isVisible = (cam: Cam, point: [number, number], margin = 0.08) =>
  geoDistance([cam.lon, cam.lat], point) < Math.PI / 2 - margin;
