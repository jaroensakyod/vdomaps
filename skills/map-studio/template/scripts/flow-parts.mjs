// Cut a still into movable parts for cut-out animation (free, CPU): Segment Anything (SlimSAM via transformers.js)
// finds each part from a box + a few clicks, the holes left behind are repainted, and <Flow25D rig=…> moves the parts.
// Usage: npm run flow-parts -- <name> <parts.json>
//   <name>      a picture already in public/flow/<name>.jpg (run flow-layers first; use --vivid there if wanted)
//   parts.json  { "parts": [ { "id": "arm", "box": [x0,y0,x1,y1], "points": [[x,y]], "neg": [[x,y]],
//                               "pivot": [x,y], "parent": "elephant", "depth": 0.6 } ] }   all in fractions of the picture (0–1);
//               depth (0 far … 1 near, default 0.6) sets how much the part drifts with the 2.5D parallax;
//               list parents before their children; later parts draw on top.
// Writes public/flow/<name>-part-<id>.png (full-size RGBA, only that part, holes of its children repainted),
//        public/flow/<name>-base.jpg (the picture with every part removed and repainted) and <name>-rig.json.
// Then: npm run flow-layers -- public/flow/<name>-base.jpg <name>-base   (parallax for what does not move)
//   --plate <image>  use a clean background plate instead of the repainted base: the same picture with the moving
//                    things removed, e.g. Flow → the picture → "remove the elephants, riders and front soldiers,
//                    keep everything else exactly" (0 credits). It is graded like the picture when --vivid is given.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { AutoProcessor, RawImage, SamModel } from "@huggingface/transformers";

const argv = process.argv.slice(2);
const plateAt = argv.indexOf("--plate");
const plateFile = plateAt >= 0 ? argv[plateAt + 1] : null;
const [name, specFile] = argv.filter((a, i) => !a.startsWith("--") && (plateAt < 0 || i !== plateAt + 1));
if (!name || !specFile) {
  console.error("usage: npm run flow-parts -- <name> <parts.json> [--plate <clean background image>]");
  process.exit(1);
}
const dir = "public/flow";
const spec = JSON.parse(readFileSync(specFile, "utf8"));
const pic = `${dir}/${name}.jpg`;
const img = await RawImage.read(pic);
const W = img.width;
const H = img.height;
const rgb = execFileSync("ffmpeg", ["-v", "error", "-i", pic, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1 << 30 });

console.log("parts: loading SlimSAM (first run downloads ~40 MB)…");
const model = await SamModel.from_pretrained("Xenova/slimsam-77-uniform");
const processor = await AutoProcessor.from_pretrained("Xenova/slimsam-77-uniform");
const embeddings = await model.get_image_embeddings(await processor(img));

// One mask per part: the best of SAM's three proposals, clipped to the part's box, grown 2 px.
const masks = {};
for (const p of spec.parts) {
  const pts = [...(p.points ?? []), ...(p.neg ?? [])].map(([x, y]) => [x * W, y * H]);
  const labels = [...(p.points ?? []).map(() => 1), ...(p.neg ?? []).map(() => 0)];
  const box = p.box.map((v, i) => v * (i % 2 ? H : W));
  // SlimSAM's ONNX export takes points only; the box limits the mask afterwards
  const inputs = await processor(img, { input_points: [[pts]], input_labels: [[labels]] });
  const out = await model({ ...inputs, ...embeddings });
  const [m] = await processor.post_process_masks(out.pred_masks, inputs.original_sizes, inputs.reshaped_input_sizes);
  const scores = out.iou_scores.data;
  let best = 0;
  for (let k = 1; k < scores.length; k++) if (scores[k] > scores[best]) best = k;
  const data = m.data;
  const mask = new Uint8Array(W * H);
  for (let y = Math.floor(box[1]); y < Math.min(H, Math.ceil(box[3])); y++)
    for (let x = Math.floor(box[0]); x < Math.min(W, Math.ceil(box[2])); x++) if (data[best * W * H + y * W + x]) mask[y * W + x] = 1;
  // drop stray specks: keep only connected pieces with at least 3 % of the biggest piece's area
  const label = new Int32Array(W * H).fill(-1);
  const sizes = [];
  for (let s0 = 0; s0 < W * H; s0++) {
    if (!mask[s0] || label[s0] >= 0) continue;
    const id = sizes.length;
    const stack = [s0];
    label[s0] = id;
    let n = 0;
    while (stack.length) {
      const i = stack.pop();
      n++;
      const x = i % W;
      for (const j of [i - 1, i + 1, i - W, i + W]) {
        if (j < 0 || j >= W * H || (j === i - 1 && x === 0) || (j === i + 1 && x === W - 1)) continue;
        if (mask[j] && label[j] < 0) (label[j] = id), stack.push(j);
      }
    }
    sizes.push(n);
  }
  const keep = Math.max(0, ...sizes) * 0.03;
  for (let i = 0; i < W * H; i++) if (mask[i] && sizes[label[i]] < keep) mask[i] = 0;
  const grown = new Uint8Array(mask);
  for (let y = 2; y < H - 2; y++)
    for (let x = 2; x < W - 2; x++)
      if (mask[y * W + x]) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) grown[(y + dy) * W + x + dx] = 1;
  masks[p.id] = grown;
  console.log(`  ${p.id}: ${grown.reduce((s, v) => s + v, 0)} px (score ${scores[best].toFixed(2)})`);
}

// Repaint pixels with weight 0 from their neighbours (push-pull, bilinear pull) — same fill as flow-layers.
const fill = (col, wt, w, h) => {
  if (w <= 1 && h <= 1) return;
  const w2 = Math.ceil(w / 2);
  const h2 = Math.ceil(h / 2);
  const c2 = new Float32Array(w2 * h2 * 3);
  const k2 = new Float32Array(w2 * h2);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const j = (y >> 1) * w2 + (x >> 1);
      if (!wt[i]) continue;
      k2[j] += wt[i];
      for (let c = 0; c < 3; c++) c2[j * 3 + c] += col[i * 3 + c] * wt[i];
    }
  for (let j = 0; j < w2 * h2; j++) if (k2[j]) for (let c = 0; c < 3; c++) c2[j * 3 + c] /= k2[j];
  for (let j = 0; j < w2 * h2; j++) k2[j] = Math.min(1, k2[j]);
  fill(c2, k2, w2, h2);
  for (let y = 0; y < h; y++) {
    const fy = Math.min(Math.max((y + 0.5) / 2 - 0.5, 0), h2 - 1);
    const y0 = Math.floor(fy);
    const y1 = Math.min(y0 + 1, h2 - 1);
    const ty = fy - y0;
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (wt[i] >= 1) continue;
      const fx = Math.min(Math.max((x + 0.5) / 2 - 0.5, 0), w2 - 1);
      const x0 = Math.floor(fx);
      const x1 = Math.min(x0 + 1, w2 - 1);
      const tx = fx - x0;
      for (let c = 0; c < 3; c++) {
        const a = c2[(y0 * w2 + x0) * 3 + c] * (1 - tx) + c2[(y0 * w2 + x1) * 3 + c] * tx;
        const b = c2[(y1 * w2 + x0) * 3 + c] * (1 - tx) + c2[(y1 * w2 + x1) * 3 + c] * tx;
        col[i * 3 + c] = col[i * 3 + c] * wt[i] + (a * (1 - ty) + b * ty) * (1 - wt[i]);
      }
    }
  }
};
const save = (buf, fmt, file) => execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", fmt, "-s", `${W}x${H}`, "-i", "-", "-frames:v", "1", ...(file.endsWith(".jpg") ? ["-q:v", "2"] : []), file], { input: buf, maxBuffer: 1 << 30 });

// Grow a mask by r px (separable box max).
const dilate = (m, r) => {
  const a = new Uint8Array(W * H);
  const b = new Uint8Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let v = 0;
      for (let d = -r; d <= r && !v; d++) v = m[y * W + Math.min(W - 1, Math.max(0, x + d))];
      a[y * W + x] = v;
    }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let v = 0;
      for (let d = -r; d <= r && !v; d++) v = a[Math.min(H - 1, Math.max(0, y + d)) * W + x];
      b[y * W + x] = v;
    }
  return b;
};

// A part owns its mask minus its children's masks (so a moving child never leaves a copy behind). Where a child sat
// on the part's body, the part's sprite also covers that area, repainted from the part's own colours, so the child
// uncovers the parent; where the child stuck out (a parasol in the sky), the base shows instead.
// Overlaps between siblings stay in both; the later part simply draws over the earlier one.
const childrenOf = (id) => spec.parts.filter((q) => q.parent === id).map((q) => q.id);
const descendants = (id) => childrenOf(id).flatMap((c) => [c, ...descendants(c)]);
const any = new Uint8Array(W * H);
for (const p of spec.parts) {
  const own = new Uint8Array(masks[p.id]);
  const under = new Uint8Array(W * H);
  for (const c of descendants(p.id)) for (let i = 0; i < W * H; i++) if (masks[c][i]) (own[i] = 0), (under[i] = 1);
  const body = dilate(own, 10);
  for (let i = 0; i < W * H; i++) if (!body[i]) under[i] = 0;
  const col = new Float32Array(W * H * 3);
  const wt = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    wt[i] = own[i];
    for (let c = 0; c < 3; c++) col[i * 3 + c] = rgb[i * 3 + c];
  }
  fill(col, wt, W, H);
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    for (let c = 0; c < 3; c++) out[i * 4 + c] = Math.round(col[i * 3 + c]);
    out[i * 4 + 3] = own[i] || under[i] ? 255 : 0;
    if (masks[p.id][i]) any[i] = 1;
  }
  save(out, "rgba", `${dir}/${name}-part-${p.id}.png`);
}
// soften sprite edges: 1 px blur of the alpha only
for (const p of spec.parts) {
  const f = `${dir}/${name}-part-${p.id}.png`;
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", f, "-filter_complex", "[0]split[c][a];[a]alphaextract,gblur=sigma=0.8[m];[c][m]alphamerge", `${dir}/_tmp.png`]);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", `${dir}/_tmp.png`, f]);
}

// The base: the clean plate when given (fitted to the picture's size; grade it with flow-layers --vivid like the
// picture), else every part removed and repainted from what is left.
if (plateFile) {
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", plateFile, "-vf", `scale=${W}:${H}`, "-q:v", "2", `${dir}/${name}-base.jpg`]);
} else {
  const col = new Float32Array(W * H * 3);
  const wt = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    wt[i] = any[i] ? 0 : 1;
    for (let c = 0; c < 3; c++) col[i * 3 + c] = rgb[i * 3 + c];
  }
  fill(col, wt, W, H);
  const base = Buffer.alloc(W * H * 3);
  for (let i = 0; i < W * H * 3; i++) base[i] = Math.round(col[i]);
  save(base, "rgb24", `${dir}/${name}-base.jpg`);
}

writeFileSync(`${dir}/${name}-rig.json`, JSON.stringify({ width: W, height: H, parts: spec.parts.map(({ id, pivot, parent, depth }) => ({ id, pivot, parent: parent ?? null, depth: depth ?? 0.6 })) }, null, 2));
console.log(`${dir}/${name}: ${spec.parts.length} parts + base. Next: npm run flow-layers -- ${dir}/${name}-base.jpg ${name}-base`);
