import { geoGraticule10, geoPath, type GeoPath, type GeoProjection } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useVideoConfig } from "remotion";
import { projectionFor, type Cam } from "./camera";
import { countries } from "./data";
import { style } from "./style";

type MapCtx = { cam: Cam; projection: GeoProjection; path: GeoPath; s: number; width: number; height: number };
const Ctx = createContext<MapCtx | null>(null);

export const useMap = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMap must be used inside <MapFrame>");
  return ctx;
};

// One SVG for the whole map; every layer inside reads the projection for the current camera.
// `s` is the size unit: 1 at 1080 px short side. Use it for every stroke width and font size.
// `size` draws on a canvas of its own size instead of the video frame (e.g. a large map sheet that is then tilted in
// 3D) and `unit` overrides `s` for it.
export const MapFrame = ({ cam, children, focusY = 0.5, focusX = 0.5, size, unit }: { cam: Cam; children: ReactNode; focusY?: number; focusX?: number; size?: { width: number; height: number }; unit?: number }) => {
  const video = useVideoConfig();
  const { width, height } = size ?? video;
  const value = useMemo(() => {
    const projection = projectionFor(cam, width, height, focusY, focusX);
    return { cam, projection, path: geoPath(projection), s: unit ?? Math.min(width, height) / 1080, width, height };
  }, [cam.lon, cam.lat, cam.scale, width, height, focusY, focusX, unit]);
  return (
    <Ctx.Provider value={value}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, fontFamily: style.font }}>
        {children}
      </svg>
    </Ctx.Provider>
  );
};

// Ocean disc + soft rim glow.
export const Sphere = () => {
  const { path, projection, s } = useMap();
  const [cx, cy] = projection.translate();
  const r = projection.scale();
  return (
    <g>
      <defs>
        <radialGradient id="rim" cx={cx} cy={cy} r={r * 1.12} gradientUnits="userSpaceOnUse">
          <stop offset="0.86" stopColor={style.highlight} stopOpacity={0} />
          <stop offset="0.9" stopColor="#7fb8ff" stopOpacity={0.25} />
          <stop offset="1" stopColor="#7fb8ff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r * 1.12} fill="url(#rim)" />
      <path d={path({ type: "Sphere" }) ?? ""} fill={style.ocean} stroke="#2c5577" strokeWidth={1.5 * s} />
    </g>
  );
};

export const Graticule = () => {
  const { path, s } = useMap();
  return <path d={path(geoGraticule10()) ?? ""} fill="none" stroke={style.graticule} strokeWidth={1 * s} />;
};

// All countries. `fillFor` lets a scene colour countries by data (choropleth) without a new component.
export const Countries = ({
  data = countries,
  fillFor,
}: {
  data?: FeatureCollection<Geometry, { name: string }>;
  fillFor?: (f: Feature<Geometry, { name: string }>) => string | undefined;
}) => {
  const { path, s } = useMap();
  return (
    <g>
      {data.features.map((f, i) => (
        <path
          key={String(f.id ?? i)}
          d={path(f) ?? ""}
          fill={fillFor?.(f) ?? style.land}
          stroke={style.border}
          strokeWidth={0.8 * s}
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
};

// One highlighted area; animate `opacity` from the scene.
export const Fill = ({
  feature,
  color = style.highlight,
  opacity = 1,
  glow = true,
}: {
  feature: Feature;
  color?: string;
  opacity?: number;
  glow?: boolean;
}) => {
  const { path, s } = useMap();
  const d = path(feature) ?? "";
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      {glow && <path d={d} fill="none" stroke={color} strokeWidth={10 * s} strokeOpacity={0.35} style={{ filter: `blur(${6 * s}px)` }} />}
      <path d={d} fill={color} fillOpacity={0.85} stroke="#fff" strokeWidth={2 * s} strokeLinejoin="round" />
    </g>
  );
};
