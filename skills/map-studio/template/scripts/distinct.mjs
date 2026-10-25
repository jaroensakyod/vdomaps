// How different do the styles really look? Measured on the rendered covers, not on the colour values in a file.
// Usage:
//   npm run distinct                          every pack in the styles dir against every other pack
//   npm run distinct -- --image out/look.jpg  one image (a channel's own look) against every pack
//   options: --from <styles dir>  --min 0.30 (pass mark)  --axes 3 (declared axes that must differ)  --json
// Three measures on each cover, shrunk to 72×128 (a phone thumbnail), each 0 = identical … 1 = nothing alike:
//   colour  = 1 − Bhattacharyya overlap of 4×4×4 RGB histograms (palette and how much of each colour)
//   layout  = mean difference of a 9×16 grid of brightness (where the boxes, text and dark areas sit)
//   texture = difference of a 6×8 grid of edge density from Sobel (flat fills vs line work vs grain)
// look = 0.4 colour + 0.3 layout + 0.3 texture. A pair passes when look ≥ --min AND, when both packs declare a
// `signature` in style.json, at least --axes of its 6 axes differ (base, palette, line, type, motion, frame).
// Exit 1 when any pair fails, so it can gate a build.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { findStylesDir, listPacks } from "./styles-lib.mjs";

const { values } = parseArgs({
  options: {
    from: { type: "string" },
    image: { type: "string" },
    min: { type: "string", default: "0.30" },
    axes: { type: "string", default: "3" },
    json: { type: "boolean", default: false },
  },
});
const MIN = Number(values.min);
const AXES = Number(values.axes);
const W = 72;
const H = 128;

// Pixels of an image filling W×H (centre-cropped, so a 4:5 or 16:9 cover is measured on its own pixels, not padding).
const pixels = (file) =>
  execFileSync("ffmpeg", ["-loglevel", "error", "-i", file, "-vf", `scale=${W}:${H}:force_original_aspect_ratio=increase:flags=area,crop=${W}:${H},format=rgb24`, "-frames:v", "1", "-f", "rawvideo", "-"], { maxBuffer: 1 << 24 });

const features = (file) => {
  const px = pixels(file);
  const hist = new Float64Array(64);
  const gray = new Float64Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = px[i * 3], g = px[i * 3 + 1], b = px[i * 3 + 2];
    hist[(r >> 6) * 16 + (g >> 6) * 4 + (b >> 6)]++;
    gray[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  for (let i = 0; i < 64; i++) hist[i] /= W * H;
  const grid = (gx, gy, val) => {
    const out = new Float64Array(gx * gy);
    const n = new Float64Array(gx * gy);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const c = Math.min(gy - 1, Math.floor((y / H) * gy)) * gx + Math.min(gx - 1, Math.floor((x / W) * gx));
        out[c] += val(x, y);
        n[c]++;
      }
    return out.map((v, i) => v / n[i]);
  };
  const lum = grid(9, 16, (x, y) => gray[y * W + x]);
  const at = (x, y) => gray[Math.max(0, Math.min(H - 1, y)) * W + Math.max(0, Math.min(W - 1, x))];
  const sobel = (x, y) => {
    const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
    const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
    return Math.min(1, Math.hypot(gx, gy) / 2);
  };
  const edge = grid(6, 8, sobel);
  return { hist, lum, edge };
};

const look = (a, b) => {
  let bc = 0;
  for (let i = 0; i < 64; i++) bc += Math.sqrt(a.hist[i] * b.hist[i]);
  const colour = 1 - bc;
  let l = 0;
  for (let i = 0; i < a.lum.length; i++) l += Math.abs(a.lum[i] - b.lum[i]);
  const layout = Math.min(1, (l / a.lum.length) * 2.5);
  let e = 0, s = 0;
  for (let i = 0; i < a.edge.length; i++) { e += Math.abs(a.edge[i] - b.edge[i]); s += a.edge[i] + b.edge[i]; }
  const texture = s ? e / s : 0;
  return { colour, layout, texture, look: 0.4 * colour + 0.3 * layout + 0.3 * texture };
};

// Declared signature: 6 axes in style.json → how many differ. Palette differs when the closest-colour match
// between the two 5-colour sets is on average more than 60 (RGB distance).
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const paletteGap = (p, q) => {
  const d = (a, b) => Math.hypot(...hex(a).map((v, i) => v - hex(b)[i]));
  return p.reduce((s, c) => s + Math.min(...q.map((x) => d(c, x))), 0) / p.length;
};
// Other axes are tokens from the vocabulary in references/style-packs.md; `type` compares the font family only
// ("Kanit 900" and "Kanit 700" are the same type).
const AXIS_NAMES = ["base", "palette", "line", "type", "motion", "frame"];
const token = (k, v) => (k === "type" ? String(v ?? "").trim().split(/\s+/)[0] : String(v ?? "")).toLowerCase();
const axesDiffer = (s, t) => {
  if (!s || !t) return null;
  return AXIS_NAMES.filter((k) => (k === "palette" ? paletteGap(s.palette ?? [], t.palette ?? []) > 60 : token(k, s[k]) !== token(k, t[k])));
};

const stylesDir = findStylesDir(values.from);
if (!stylesDir) {
  console.error("ไม่พบโฟลเดอร์ styles — ใส่ --from <โฟลเดอร์ styles>");
  process.exit(1);
}
const packs = listPacks(stylesDir)
  .map((p) => {
    const cover = ["cover-9x16.jpg", "cover-4x5.jpg", "cover-16x9.jpg"].map((f) => path.join(p.dir, f)).find(existsSync);
    const sj = path.join(p.dir, "style.json");
    const signature = existsSync(sj) ? JSON.parse(readFileSync(sj, "utf8")).signature : undefined;
    return { ...p, cover, signature };
  })
  .filter((p) => p.cover);
const feats = new Map(packs.map((p) => [p.id, features(p.cover)]));
const pct = (v) => v.toFixed(2);

if (values.image) {
  const me = features(values.image);
  const rows = packs.map((p) => ({ id: p.id, ...look(me, feats.get(p.id)) })).sort((a, b) => a.look - b.look);
  console.log(`${values.image} against ${rows.length} styles (pass ≥ ${MIN}):`);
  for (const r of rows.slice(0, 8)) console.log(`  ${r.look < MIN ? "FAIL" : " ok "}  ${r.id}  look ${pct(r.look)}  (colour ${pct(r.colour)} · layout ${pct(r.layout)} · texture ${pct(r.texture)})`);
  process.exit(rows[0].look < MIN ? 1 : 0);
}

const pairs = [];
for (let i = 0; i < packs.length; i++)
  for (let j = i + 1; j < packs.length; j++) {
    const a = packs[i], b = packs[j];
    const m = look(feats.get(a.id), feats.get(b.id));
    const differ = axesDiffer(a.signature, b.signature);
    const fail = m.look < MIN || (differ !== null && differ.length < AXES);
    pairs.push({ a: a.id, b: b.id, ...m, axes: differ ? differ.length : null, fail });
  }
if (values.json) {
  console.log(JSON.stringify(pairs, null, 1));
} else {
  console.log(`${packs.length} styles · ${pairs.length} pairs · pass: look ≥ ${MIN} and ≥ ${AXES}/6 declared axes differ\n`);
  console.log("closest neighbour of each style:");
  for (const p of packs) {
    const mine = pairs.filter((x) => x.a === p.id || x.b === p.id).sort((x, y) => x.look - y.look)[0];
    if (!mine) continue;
    const other = mine.a === p.id ? mine.b : mine.a;
    console.log(`  ${mine.fail ? "FAIL" : " ok "}  ${p.id} ↔ ${other}  look ${pct(mine.look)}  (colour ${pct(mine.colour)} · layout ${pct(mine.layout)} · texture ${pct(mine.texture)})${mine.axes === null ? "  axes ?" : `  axes ${mine.axes}/6`}`);
  }
  const fails = pairs.filter((x) => x.fail).sort((x, y) => x.look - y.look);
  console.log(`\n${fails.length} failing pair(s)${fails.length ? ":" : ""}`);
  for (const f of fails) console.log(`  ${f.a} ↔ ${f.b}  look ${pct(f.look)}${f.axes === null ? "" : `  axes ${f.axes}/6`}`);
  const noSig = packs.filter((p) => !p.signature).map((p) => p.id);
  if (noSig.length) console.log(`\nno signature in style.json: ${noSig.join(", ")}`);
}
process.exit(pairs.some((x) => x.fail) ? 1 : 0);
