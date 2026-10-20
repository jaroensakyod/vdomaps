import type { Feature, FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries50 from "world-atlas/countries-50m.json";

// Natural Earth 1:50m countries (public domain) via the world-atlas package. Feature ids are ISO 3166-1
// numeric codes as strings: Thailand "764", Japan "392", Myanmar "104", Laos "418", Cambodia "116".
type CountryProps = { name: string };
const topo = countries50 as unknown as Topology<{ countries: GeometryCollection<CountryProps> }>;

export const countries = feature(topo, topo.objects.countries) as FeatureCollection<Geometry, CountryProps>;

export const country = (id: string): Feature<Geometry, CountryProps> => {
  const f = countries.features.find((c) => c.id === id);
  if (!f) throw new Error(`Country ${id} not in countries-50m`);
  return f;
};

// Handy points [lon, lat].
export const places = {
  bangkok: [100.5018, 13.7563] as [number, number],
  chiangMai: [98.9853, 18.7883] as [number, number],
  ayutthaya: [100.5877, 14.3532] as [number, number],
  tokyo: [139.6917, 35.6895] as [number, number],
  singapore: [103.8198, 1.3521] as [number, number],
};
