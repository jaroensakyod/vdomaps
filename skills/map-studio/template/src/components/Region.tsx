import { geoArea, geoCircle } from "d3-geo";
import type { Feature, Polygon } from "geojson";
import { useMap } from "./Map";

// A hand-drawn polygon from [lon, lat] points. d3-geo wants clockwise rings; a ring drawn the other way would
// fill the whole globe except this area, so flip it when its area is more than a hemisphere.
export const region = (ring: [number, number][]): Feature<Polygon> => {
  const closed = [...ring, ring[0]];
  const f: Feature<Polygon> = { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [closed] } };
  if (geoArea(f) > 2 * Math.PI) f.geometry.coordinates = [closed.slice().reverse()];
  return f;
};

export const circleRegion = (center: [number, number], radiusDeg: number): Feature<Polygon> => ({
  type: "Feature",
  properties: {},
  geometry: geoCircle().center(center).radius(radiusDeg).precision(4)(),
});

// Box [[west, south], [east, north]] as a polygon, e.g. to fit the camera to an area.
export const bbox = ([[w, s], [e, n]]: [[number, number], [number, number]]) =>
  region([
    [w, s],
    [w, n],
    [e, n],
    [e, s],
  ]);

// Approximate area of control: soft fill + dashed edge, clipped to land via a <clipPath id={clip}>.
// Always pair with an on-screen "approximate" note — these are not surveyed borders.
export const Region = ({
  feature,
  color,
  opacity = 1,
  clip = "land",
}: {
  feature: Feature;
  color: string;
  opacity?: number;
  clip?: string | null;
}) => {
  const { path, s } = useMap();
  if (opacity <= 0) return null;
  const d = path(feature) ?? "";
  return (
    <g opacity={opacity} clipPath={clip ? `url(#${clip})` : undefined}>
      <path d={d} fill={color} fillOpacity={0.3} />
      <path d={d} fill="none" stroke={color} strokeWidth={10 * s} strokeOpacity={0.25} />
      <path d={d} fill="none" stroke={color} strokeWidth={3 * s} strokeDasharray={`${14 * s} ${9 * s}`} strokeOpacity={0.9} />
    </g>
  );
};
