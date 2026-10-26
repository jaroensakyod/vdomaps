// Paper-marbling (ebru) simulation, no drawing: see Marble.tsx for the components.
export type Pt = [number, number];
export type Op =
  | { kind: "drop"; at: number; dur?: number; c: Pt; r: number; color: string }
  | { kind: "tine"; at: number; dur: number; p: Pt; dir: Pt; z: number; lambda: number }
  | { kind: "stroke"; at: number; dur: number; path: Pt[]; z: number; lambda: number };
export type Shape = { color: string; pts: Pt[] };

const ease = (k: number) => 1 - Math.pow(1 - k, 3);
const MAXV = 2600;
const refine = (pts: Pt[], maxLen: number) => {
  if (pts.length > MAXV) return pts;
  const out: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    out.push(a);
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L > maxLen) {
      const n = Math.min(8, Math.ceil(L / maxLen));
      for (let j = 1; j < n; j++) out.push([a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n]);
    }
  }
  return out;
};
// the part of a polyline drawn so far (fraction k of its length)
const partial = (path: Pt[], k: number): Pt[] => {
  const seg = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * k;
  const out: Pt[] = [path[0]];
  for (let i = 0; i < seg.length; i++) {
    if (left >= seg[i]) { out.push(path[i + 1]); left -= seg[i]; continue; }
    const t = seg[i] ? left / seg[i] : 0;
    out.push([path[i][0] + (path[i + 1][0] - path[i][0]) * t, path[i][1] + (path[i + 1][1] - path[i][1]) * t]);
    break;
  }
  return out;
};
export const head = (path: Pt[], k: number): Pt => {
  const p = partial(path, k);
  return p[p.length - 1];
};

export const simulate = (ops: Op[], frame: number, ground: string): Shape[] => {
  let shapes: Shape[] = [];
  for (const op of ops) {
    if (frame < op.at) break;
    const dur = op.kind === "drop" ? op.dur ?? 8 : op.dur;
    const k = ease(Math.min(1, (frame - op.at) / dur));
    if (k <= 0) continue;
    for (const s of shapes) s.pts = refine(s.pts, 7);
    if (op.kind === "drop") {
      const r = op.r * k, r2 = r * r, [cx, cy] = op.c;
      for (const s of shapes)
        s.pts = s.pts.map(([x, y]) => {
          const dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy || 1e-6;
          const f = Math.sqrt(1 + r2 / d2);
          return [cx + dx * f, cy + dy * f];
        });
      const n = Math.max(48, Math.round(op.r * 1.4));
      shapes.push({ color: op.color, pts: Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r] as Pt) });
    } else if (op.kind === "tine") {
      const [px, py] = op.p, [mx, my] = op.dir, z = op.z * k;
      for (const s of shapes)
        s.pts = s.pts.map(([x, y]) => {
          const d = Math.abs((x - px) * my - (y - py) * mx);
          const u = z * Math.exp(-d / op.lambda);
          return [x + mx * u, y + my * u];
        });
    } else {
      const path = partial(op.path, k);
      if (path.length < 2) continue;
      for (const s of shapes)
        s.pts = s.pts.map(([x, y]) => {
          let best = 1e9, tx = 0, ty = 0;
          for (let i = 0; i + 1 < path.length; i++) {
            const [ax, ay] = path[i], [bx, by] = path[i + 1];
            const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1e-6;
            const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / L2));
            const d = Math.hypot(x - ax - t * vx, y - ay - t * vy);
            if (d < best) { best = d; const L = Math.sqrt(L2); tx = vx / L; ty = vy / L; }
          }
          const u = op.z * Math.exp(-best / op.lambda) * Math.min(1, k * 1.2);
          return [x + tx * u, y + ty * u];
        });
    }
  }
  void ground;
  return shapes;
};

