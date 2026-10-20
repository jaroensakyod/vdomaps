import { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { useMap } from "./Map";

// Equirectangular images (NASA imagery, DEM relief/hillshade from scripts/fetch-*.mjs) drawn under any d3
// projection — globe or flat. The image's bbox is cut into a grid; every cell is split into two triangles and each
// triangle is drawn with the affine transform that maps it onto its projected corners. Cells on the far side of the
// globe are skipped and the result is clipped to the sphere, so the rim stays clean. Assumes the orthographic
// camera of <MapFrame> (projectionFor); at country zoom it looks flat anyway.
//
// <Raster layers={[{ name: "world" }, { name: "nthai-hillshade", op: "multiply", opacity: 0.8 }]} />
// `name` = public/raster/<name>.jpg|png + <name>.json from the fetch scripts. Layers draw in order on one canvas.

export type RasterLayer = {
  name: string;
  op?: GlobalCompositeOperation; // "multiply" for hillshade, "screen"/"lighter" for night lights
  opacity?: number;
};
type Meta = { bbox: [number, number, number, number]; credit: string };
type Loaded = { meta: Meta; img: HTMLImageElement };

const cache = new Map<string, Promise<Loaded>>();
const load = (name: string) => {
  if (!cache.has(name)) {
    cache.set(
      name,
      (async () => {
        const meta: Meta = await (await fetch(staticFile(`raster/${name}.json`))).json();
        const ext = /hillshade|relief/.test(name) ? "png" : "jpg";
        const img = new Image();
        img.src = staticFile(`raster/${name}.${ext}`);
        await img.decode();
        return { meta, img };
      })(),
    );
  }
  return cache.get(name)!;
};

type XY = [number, number];

// Draw source triangle (image px) s0,s1,s2 onto screen triangle d0,d1,d2.
const drawTriangle = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, s: XY[], d: XY[], crop: [number, number, number, number]) => {
  const [[x0, y0], [x1, y1], [x2, y2]] = s;
  const [[u0, v0], [u1, v1], [u2, v2]] = d;
  const det = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
  if (!det) return;
  const a = ((u1 - u0) * (y2 - y0) - (u2 - u0) * (y1 - y0)) / det;
  const b = ((v1 - v0) * (y2 - y0) - (v2 - v0) * (y1 - y0)) / det;
  const c = ((u2 - u0) * (x1 - x0) - (u1 - u0) * (x2 - x0)) / det;
  const dd = ((v2 - v0) * (x1 - x0) - (v1 - v0) * (x2 - x0)) / det;
  const e = u0 - a * x0 - c * y0;
  const f = v0 - b * x0 - dd * y0;
  // Grow the clip triangle by ~0.7 px around its centroid so neighbouring triangles overlap (no hairline seams).
  const cx = (u0 + u1 + u2) / 3;
  const cy = (v0 + v1 + v2) / 3;
  const grow = (u: number, v: number): XY => {
    const l = Math.hypot(u - cx, v - cy) || 1;
    return [u + ((u - cx) / l) * 0.7, v + ((v - cy) / l) * 0.7];
  };
  const g = d.map(([u, v]) => grow(u, v));
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(g[0][0], g[0][1]);
  ctx.lineTo(g[1][0], g[1][1]);
  ctx.lineTo(g[2][0], g[2][1]);
  ctx.closePath();
  ctx.clip();
  ctx.transform(a, b, c, dd, e, f);
  const [sx, sy, sw, sh] = crop;
  ctx.drawImage(img, sx, sy, sw, sh, sx, sy, sw, sh);
  ctx.restore();
};

export const Raster = ({ layers, cell = 2.5 }: { layers: RasterLayer[]; cell?: number /** grid cell size in degrees, at most */ }) => {
  const { projection, width, height } = useMap();
  const ref = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState<Loaded[] | null>(null);
  const [handle] = useState(() => delayRender(`raster ${layers.map((l) => l.name).join(",")}`));
  const released = useRef(false);
  const key = layers.map((l) => l.name).join("|");

  useLayoutEffect(() => {
    let alive = true;
    Promise.all(layers.map((l) => load(l.name))).then((x) => alive && setLoaded(x));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas || !loaded) return;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const [tx, ty] = projection.translate();
    const r = projection.scale();
    const rotate = projection.rotate();
    const centre: XY = [-rotate[0], -rotate[1]];
    const cosC = Math.cos((centre[1] * Math.PI) / 180);
    const sinC = Math.sin((centre[1] * Math.PI) / 180);
    // Visible hemisphere test without allocations: dot product of unit vectors > small margin.
    const visible = (lon: number, lat: number) => {
      const p = (lat * Math.PI) / 180;
      const dl = ((lon - centre[0]) * Math.PI) / 180;
      return sinC * Math.sin(p) + cosC * Math.cos(p) * Math.cos(dl) > 0.02;
    };
    ctx.save();
    ctx.beginPath();
    ctx.arc(tx, ty, r, 0, Math.PI * 2);
    ctx.clip();
    layers.forEach((layer, li) => {
      const { meta, img } = loaded[li];
      const [w, s, e, n] = meta.bbox;
      const nx = Math.max(2, Math.ceil((e - w) / cell));
      const ny = Math.max(2, Math.ceil((n - s) / cell));
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      ctx.globalCompositeOperation = layer.op ?? "source-over";
      ctx.globalAlpha = layer.opacity ?? 1;
      for (let j = 0; j < ny; j++) {
        const lat0 = n - ((n - s) * j) / ny;
        const lat1 = n - ((n - s) * (j + 1)) / ny;
        for (let i = 0; i < nx; i++) {
          const lon0 = w + ((e - w) * i) / nx;
          const lon1 = w + ((e - w) * (i + 1)) / nx;
          if (!visible(lon0, lat0) || !visible(lon1, lat0) || !visible(lon0, lat1) || !visible(lon1, lat1)) continue;
          const p00 = projection([lon0, lat0]) as XY;
          const p10 = projection([lon1, lat0]) as XY;
          const p01 = projection([lon0, lat1]) as XY;
          const p11 = projection([lon1, lat1]) as XY;
          const xs = [p00[0], p10[0], p01[0], p11[0]];
          const ys = [p00[1], p10[1], p01[1], p11[1]];
          if (Math.max(...xs) < 0 || Math.min(...xs) > width || Math.max(...ys) < 0 || Math.min(...ys) > height) continue;
          const x0 = (i / nx) * W, x1 = ((i + 1) / nx) * W, y0 = (j / ny) * H, y1 = ((j + 1) / ny) * H;
          const crop: [number, number, number, number] = [Math.max(0, x0 - 2), Math.max(0, y0 - 2), Math.min(W, x1 + 2) - Math.max(0, x0 - 2), Math.min(H, y1 + 2) - Math.max(0, y0 - 2)];
          drawTriangle(ctx, img, [[x0, y0], [x1, y0], [x0, y1]], [p00, p10, p01], crop);
          drawTriangle(ctx, img, [[x1, y1], [x0, y1], [x1, y0]], [p11, p01, p10], crop);
        }
      }
    });
    ctx.restore();
    if (!released.current) {
      released.current = true;
      continueRender(handle);
    }
  });

  return (
    <foreignObject x={0} y={0} width={width} height={height}>
      <canvas ref={ref} width={width} height={height} style={{ display: "block" }} />
    </foreignObject>
  );
};

