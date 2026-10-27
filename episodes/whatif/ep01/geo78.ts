import { geoArea } from "d3-geo";

// A hand-drawn outer ring in the winding d3 fills (inside, not the rest of the globe).
export const wound = (ring: [number, number][]): [number, number][] =>
  geoArea({ type: "Polygon", coordinates: [ring] }) > 2 * Math.PI ? [...ring].reverse() : ring;
