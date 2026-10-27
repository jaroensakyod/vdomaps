// Turn one still (a Flow / Nano Banana image, a painting, a photo) into depth layers for a free 2.5D move.
// Usage: npm run flow-layers -- <image> [name] [layers=6] [--vivid]
//   --vivid  lift a sepia / old-paper picture so it stands out on an old map: paper → white, a blue wash on the sky,
//            more saturation. Only colours change; every line of the drawing stays as it was.
//   → public/flow/<name>.jpg            the picture (graded when --vivid)
//     public/flow/<name>-depth.png      depth map (white = near), Depth Anything V2 small, run locally on the CPU
//     public/flow/<name>-L0..Ln.png     L0 = the farthest band, L1..Ln = nearer bands (soft alpha); what each layer hides
//                                       behind nearer layers is repainted from its own colours, so drifting never doubles
//     public/flow/<name>.json           { width, height, aspect, layers, thresholds }
// Draw it with <Flow25D name="<name>" … /> (src/components/Flow25D.tsx). No API, no credits: the model (~100 MB) is
// downloaded once from Hugging Face into the npm cache and runs offline after that.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { pipeline, RawImage } from "@huggingface/transformers";

const argv = process.argv.slice(2);
const vivid = argv.includes("--vivid");
const [input, nameArg, layersArg = "6"] = argv.filter((a) => !a.startsWith("--"));
if (!input) {
  console.error("usage: npm run flow-layers -- <image> [name] [layers=6] [--vivid]");
  process.exit(1);
}
const name = nameArg ?? basename(input, extname(input)).replace(/[^\w-]+/g, "-");
const layers = Math.max(2, Math.min(10, Number(layersArg)));
const dir = "public/flow";
mkdirSync(dir, { recursive: true });
const ff = (...args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args]);

// 1 · the picture itself, as a JPEG at its own size (graded first with --vivid)
const pic = `${dir}/${name}.jpg`;
ff("-i", input, "-q:v", "2", pic);
if (vivid) {
  const [w, h] = execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", pic]).toString().trim().split(",").map(Number);
  const src = execFileSync("ffmpeg", ["-v", "error", "-i", pic, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1 << 30 });
  // paper colour = mean of the brightest tenth of the low-saturation pixels; white-balance it to near white
  // (gain capped at 1.3 so dust and highlights do not burn out)
  const cand = [];
  for (let i = 0; i < w * h; i += 7) {
    const r = src[i * 3], g = src[i * 3 + 1], b = src[i * 3 + 2];
    if (Math.max(r, g, b) - Math.min(r, g, b) < 60) cand.push([r + g + b, r, g, b]);
  }
  cand.sort((a, b) => b[0] - a[0]);
  const top = cand.slice(0, Math.max(1, Math.floor(cand.length / 10)));
  const paper = [1, 2, 3].map((k) => top.reduce((s, p) => s + p[k], 0) / top.length);
  const lift = Math.min(1.3, 244 / Math.max(...paper)); // brightness, capped
  const gain = paper.map((p) => (lift * Math.max(...paper)) / p); // white balance: paper channels equal
  const SKY = [92, 146, 214];
  const out = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      let c = [0, 1, 2].map((k) => Math.min(255, src[i + k] * gain[k]));
      const l = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
      c = c.map((v) => l + (v - l) * 1.6);
      // sky: bright, near-neutral pixels in the upper half take a blue wash that fades toward the horizon
      const bright = Math.min(1, Math.max(0, (l - 170) / 50));
      const neutral = Math.min(1, Math.max(0, 1 - (Math.max(...c) - Math.min(...c)) / 70));
      const high = Math.min(1, Math.max(0, 1.15 - y / (h * 0.5)));
      const k = 0.7 * bright * neutral * high;
      c = c.map((v, j) => v * (1 - k) + ((v * (SKY[j] + (255 - SKY[j]) * Math.min(1, y / (h * 0.55)))) / 255) * k);
      for (let j = 0; j < 3; j++) out[i + j] = Math.round(Math.min(255, Math.max(0, c[j])));
    }
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${w}x${h}`, "-i", "-", "-frames:v", "1", "-q:v", "2", pic], { input: out });
}

// 2 · depth map
console.log("depth: loading Depth Anything V2 small (first run downloads ~100 MB)…");
const estimate = await pipeline("depth-estimation", "onnx-community/depth-anything-v2-small", { dtype: "fp32" });
const img = await RawImage.read(pic);
const { depth } = await estimate(img);
await (await depth.resize(img.width, img.height)).save(`${dir}/${name}-depth.png`);

// 3 · layers. Thresholds spread over the depth range actually used by this picture (5th–95th percentile), so a
// picture that is mostly far away still gets its layers where the detail is.
const vals = Float32Array.from((await depth.resize(64, 64)).data).sort();
const lo = vals[Math.floor(vals.length * 0.05)] / 255;
const hi = vals[Math.floor(vals.length * 0.95)] / 255;
const thresholds = Array.from({ length: layers - 1 }, (_, i) => +(lo + ((hi - lo) * (i + 0.5)) / (layers - 1)).toFixed(3));
// Each layer holds its own depth band plus everything nearer — but the nearer part is repainted from the band's own
// colours (push-pull fill), so when a near layer drifts it uncovers plausible background, never a second copy of
// itself (a cumulative cut without the fill shows doubled parasols and spears).
const W = img.width;
const H = img.height;
const raw = (file, fmt, ch) => {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", fmt, "-"], { maxBuffer: 1 << 30 });
  if (buf.length !== W * H * ch) throw new Error(`${file}: unexpected size`);
  return buf;
};
const rgb = raw(pic, "rgb24", 3);
const dep = raw(`${dir}/${name}-depth.png`, "gray", 1);
const edges = [0, ...thresholds.map((t) => Math.round(t * 255)), 256];
const soft = (d, T) => (T <= 0 ? 1 : Math.min(1, Math.max(0, (d - T) / 14)));

// Fill pixels with weight 0 from their neighbours: average down a pyramid (weighted), then fill back up.
const pushPull = (col, wt, w, h) => {
  if (w <= 1 && h <= 1) return;
  const w2 = Math.ceil(w / 2);
  const h2 = Math.ceil(h / 2);
  const c2 = new Float32Array(w2 * h2 * 3);
  const k2 = new Float32Array(w2 * h2);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const j = (y >> 1) * w2 + (x >> 1);
      const k = wt[i];
      if (!k) continue;
      k2[j] += k;
      c2[j * 3] += col[i * 3] * k;
      c2[j * 3 + 1] += col[i * 3 + 1] * k;
      c2[j * 3 + 2] += col[i * 3 + 2] * k;
    }
  for (let j = 0; j < w2 * h2; j++)
    if (k2[j]) {
      c2[j * 3] /= k2[j];
      c2[j * 3 + 1] /= k2[j];
      c2[j * 3 + 2] /= k2[j];
      k2[j] = Math.min(1, k2[j]);
    }
  pushPull(c2, k2, w2, h2);
  // pull: bilinear from the coarser level, so the fill is smooth, not blocky
  for (let y = 0; y < h; y++) {
    const fy = Math.min(Math.max((y + 0.5) / 2 - 0.5, 0), h2 - 1);
    const y0 = Math.floor(fy);
    const y1 = Math.min(y0 + 1, h2 - 1);
    const ty = fy - y0;
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const k = wt[i];
      if (k >= 1) continue;
      const fx = Math.min(Math.max((x + 0.5) / 2 - 0.5, 0), w2 - 1);
      const x0 = Math.floor(fx);
      const x1 = Math.min(x0 + 1, w2 - 1);
      const tx = fx - x0;
      for (let c = 0; c < 3; c++) {
        const a = c2[(y0 * w2 + x0) * 3 + c] * (1 - tx) + c2[(y0 * w2 + x1) * 3 + c] * tx;
        const b = c2[(y1 * w2 + x0) * 3 + c] * (1 - tx) + c2[(y1 * w2 + x1) * 3 + c] * tx;
        col[i * 3 + c] = col[i * 3 + c] * k + (a * (1 - ty) + b * ty) * (1 - k);
      }
    }
  }
};

for (let L = 0; L < layers; L++) {
  const col = new Float32Array(W * H * 3);
  const wt = new Float32Array(W * H);
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    // keep this layer's own pixels (fading out where the next layer takes over); the rest gets filled
    wt[i] = L === layers - 1 ? 1 : 1 - soft(dep[i], edges[L + 1]);
    for (let c = 0; c < 3; c++) col[i * 3 + c] = rgb[i * 3 + c];
  }
  pushPull(col, wt, W, H);
  for (let i = 0; i < W * H; i++) {
    for (let c = 0; c < 3; c++) out[i * 4 + c] = Math.round(col[i * 3 + c]);
    out[i * 4 + 3] = Math.round(255 * soft(dep[i], edges[L]));
  }
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-i", "-", "-frames:v", "1", `${dir}/${name}-L${L}.png`], { input: out, maxBuffer: 1 << 30 });
}

const meta = { width: img.width, height: img.height, aspect: +(img.width / img.height).toFixed(4), layers, thresholds };
writeFileSync(`${dir}/${name}.json`, JSON.stringify(meta, null, 2));
console.log(`${dir}/${name}: ${img.width}×${img.height}, ${layers} layers at depth ${thresholds.join(", ")}`);
