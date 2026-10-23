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

// Camera speed at a frame: centre shift in screen px + zoom change (log scale). 0 when the map is still.
export const camSpeed = (keys: CamKey[], f: number) => {
  const a = camAt(keys, f);
  const b = camAt(keys, f + 1);
  const pxDeg = (a.scale * Math.PI) / 180;
  const shift = Math.hypot((b.lon - a.lon) * Math.cos((a.lat * Math.PI) / 180), b.lat - a.lat) * pxDeg;
  return shift + Math.abs(Math.log(b.scale / a.scale)) * 900;
};

// House standard "clear" layout (set 23 Oct 2026): how far (0..1) the illustration panel is tucked away at `frame`.
// 1 while the camera moves (looking 8 frames ahead, so the panel is gone before the move starts), back to 0 once the
// map has been still for a few frames; averaged over 8 frames so it slides instead of blinking.
export const panelHideAt = (keys: CamKey[], frame: number, threshold = 1.2) => {
  const moving = (f: number) => {
    for (let d = -4; d <= 8; d++) if (camSpeed(keys, f + d) > threshold) return 1;
    return 0;
  };
  let hide = 0;
  for (let d = 0; d < 8; d++) hide += moving(frame - d);
  return hide / 8;
};

// Clear layout: turn slow drifts between keyframes into "hold, then a move that lands on the key" — the map stays
// still most of the time, so the illustration panel (hidden while the camera moves) gets its time on screen. Keys
// that repeat the previous view are merged; each move lasts `min` frames plus more for long pans and big zooms (a
// 100× zoom squeezed into 30 frames changes the picture too fast and trips check-glitch), capped at `max`.
export const holdAndMove = (keys: CamKey[], min = 30, max = 120, width = 1080): CamKey[] => {
  const same = (a: Cam, b: Cam) => Math.abs(a.lon - b.lon) < 1e-4 && Math.abs(a.lat - b.lat) < 1e-4 && Math.abs(Math.log(a.scale / b.scale)) < 1e-3;
  const kept = keys.filter((k, i) => i === 0 || !same(k.cam, keys[i - 1].cam));
  const out: CamKey[] = [];
  kept.forEach((k, i) => {
    const prev = out[out.length - 1];
    if (i > 0 && prev) {
      const zoom = Math.abs(Math.log(k.cam.scale / prev.cam.scale));
      const deg = Math.hypot((k.cam.lon - prev.cam.lon) * Math.cos((prev.cam.lat * Math.PI) / 180), k.cam.lat - prev.cam.lat);
      const screens = (deg * Math.min(k.cam.scale, prev.cam.scale) * Math.PI) / 180 / width;
      const len = Math.round(Math.min(max, min + 14 * zoom + 20 * Math.min(screens, 3)));
      if (k.frame - prev.frame > len) out.push({ frame: k.frame - len, cam: prev.cam });
    }
    out.push(k);
  });
  return out;
};
