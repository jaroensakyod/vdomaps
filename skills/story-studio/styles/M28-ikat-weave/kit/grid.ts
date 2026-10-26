// Grid helpers for the weave: rasterise SVG paths (countries, rivers) onto the thread grid with a canvas.
// Runs in the render browser (Remotion).

export type Grid = { cols: number; rows: number; v: Float32Array };

// Coverage 0..1 of each cell by the filled (or stroked) path(s), drawn in screen units w×h.
export const rasterise = (paths: string[], w: number, h: number, cols: number, rows: number, stroke?: number, ox = 0, oy = 0): Grid => {
  const v = new Float32Array(cols * rows);
  if (typeof document === "undefined") return { cols, rows, v };
  const k = 3; // supersample, so coverage is smooth at the coast
  const cv = document.createElement("canvas");
  cv.width = cols * k;
  cv.height = rows * k;
  const ctx = cv.getContext("2d");
  if (!ctx) return { cols, rows, v };
  ctx.scale((cols * k) / w, (rows * k) / h);
  ctx.translate(ox, oy);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const d of paths) {
    if (!d) continue;
    const p = new Path2D(d);
    if (stroke) {
      ctx.lineWidth = stroke;
      ctx.stroke(p);
    } else ctx.fill(p);
  }
  const img = ctx.getImageData(0, 0, cols * k, rows * k).data;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      let s = 0;
      for (let y = 0; y < k; y++) for (let x = 0; x < k; x++) s += img[((r * k + y) * cols * k + c * k + x) * 4 + 3];
      v[r * cols + c] = s / (k * k * 255);
    }
  return { cols, rows, v };
};

// Chamfer distance (in cells) from every cell to the nearest cell where `on(i)` is true.
export const distance = (cols: number, rows: number, on: (i: number) => boolean): Float32Array => {
  const d = new Float32Array(cols * rows).fill(1e6);
  for (let i = 0; i < d.length; i++) if (on(i)) d[i] = 0;
  const a = 1, b = Math.SQRT2;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (c > 0) d[i] = Math.min(d[i], d[i - 1] + a);
      if (r > 0) {
        d[i] = Math.min(d[i], d[i - cols] + a);
        if (c > 0) d[i] = Math.min(d[i], d[i - cols - 1] + b);
        if (c < cols - 1) d[i] = Math.min(d[i], d[i - cols + 1] + b);
      }
    }
  for (let r = rows - 1; r >= 0; r--)
    for (let c = cols - 1; c >= 0; c--) {
      const i = r * cols + c;
      if (c < cols - 1) d[i] = Math.min(d[i], d[i + 1] + a);
      if (r < rows - 1) {
        d[i] = Math.min(d[i], d[i + cols] + a);
        if (c < cols - 1) d[i] = Math.min(d[i], d[i + cols + 1] + b);
        if (c > 0) d[i] = Math.min(d[i], d[i + cols - 1] + b);
      }
    }
  return d;
};

// Small deterministic hash noise 0..1.
export const hash = (x: number, y: number, s = 0) => {
  const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return n - Math.floor(n);
};
