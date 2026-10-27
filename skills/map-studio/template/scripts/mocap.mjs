// Motion capture from an ordinary video: one person, whole body in frame, phone on a tripod (side view is best).
// Usage: npm run mocap -- <clip.mp4> <name> [--from 1.5] [--to 7] [--fps 30]
// Writes public/mocap/<name>.json: 33 MediaPipe pose landmarks per frame (x, y in image pixels, z depth, visibility),
// which src/components/Pose.tsx turns into a skeleton for <PoseFigure> (smoothing, ground lock, facing, in-place).
// Runs MediaPipe Pose Landmarker (full model, Apache-2.0) inside Remotion's own headless Chrome — no Python, no GPU
// setup. The model downloads once to mocap/ (git-ignored). Frames that find no person are kept as null and filled in
// by Pose.tsx from their neighbours.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";

const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args.splice(i, 2)[1] : d;
};
const from = opt("from");
const to = opt("to");
const fps = +opt("fps", 30);
const [clip, name] = args;
if (!clip || !name) throw new Error("usage: npm run mocap -- <clip.mp4> <name> [--from s] [--to s] [--fps 30]");

const MODEL = "mocap/pose_landmarker_full.task";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task";
const TASKS = "node_modules/@mediapipe/tasks-vision";
if (!existsSync(TASKS)) throw new Error("npm install --save-dev @mediapipe/tasks-vision first");
if (!existsSync(MODEL)) {
  mkdirSync("mocap", { recursive: true });
  console.log("downloading pose model…");
  const res = await fetch(MODEL_URL);
  if (!res.ok) throw new Error(`model download failed: ${res.status}`);
  writeFileSync(MODEL, Buffer.from(await res.arrayBuffer()));
}

// 1. frames (720 px tall is plenty for pose and keeps it fast)
const dir = `mocap/.frames/${name}`;
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
execFileSync("ffmpeg", ["-v", "error", "-y", ...(from ? ["-ss", from] : []), ...(to ? ["-to", to] : []), "-i", clip, "-vf", `fps=${fps},scale=-2:720`, "-q:v", "3", `${dir}/%05d.jpg`]);
const frames = readdirSync(dir).filter((f) => f.endsWith(".jpg")).sort();
if (!frames.length) throw new Error("no frames extracted — check the clip and --from/--to");
console.log(`${frames.length} frames at ${fps} fps`);

// 2. a tiny local server: the page, MediaPipe's files, the model, the frames, and a POST endpoint for results
const PAGE = `<!doctype html><meta charset="utf-8"><body><script type="module">
import { FilesetResolver, PoseLandmarker } from "/tasks/vision_bundle.mjs";
const list = ${JSON.stringify(frames)};
const report = (o) => fetch("/progress", { method: "POST", body: JSON.stringify(o) });
try {
  const files = await FilesetResolver.forVisionTasks("/tasks/wasm");
  let pose;
  for (const delegate of ["GPU", "CPU"]) {
    try { pose = await PoseLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: "/model", delegate }, runningMode: "VIDEO", numPoses: 1, minPoseDetectionConfidence: 0.4, minTrackingConfidence: 0.4 }); await report({ delegate }); break; } catch (e) { await report({ note: delegate + " failed: " + e }); }
  }
  const out = [];
  let w = 0, h = 0;
  for (let i = 0; i < list.length; i++) {
    const img = new Image();
    img.src = "/frames/" + list[i];
    await img.decode();
    w = img.naturalWidth; h = img.naturalHeight;
    const r = pose.detectForVideo(img, Math.round((i * 1000) / ${fps}));
    const lm = r.landmarks[0];
    out.push(lm ? lm.map((p) => [+(p.x * w).toFixed(1), +(p.y * h).toFixed(1), +(p.z * w).toFixed(1), +(p.visibility ?? 0).toFixed(2)]) : null);
    if (i % 30 === 0) await report({ i });
  }
  await fetch("/result", { method: "POST", body: JSON.stringify({ w, h, frames: out }) });
} catch (e) { await fetch("/result", { method: "POST", body: JSON.stringify({ error: String(e && e.stack || e) }) }); }
</script>`;
const TYPES = { ".mjs": "text/javascript", ".js": "text/javascript", ".wasm": "application/wasm", ".jpg": "image/jpeg" };
let finish;
const done = new Promise((r) => (finish = r));
const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  if (req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      res.end("ok");
      const msg = JSON.parse(body);
      if (url === "/result") finish(msg);
      else if (msg.delegate) console.log(`MediaPipe running on ${msg.delegate}`);
      else if (msg.note) console.log(msg.note);
      else process.stdout.write(`\r  frame ${msg.i}/${frames.length}`);
    });
    return;
  }
  const file = url === "/" ? null : url === "/model" ? MODEL : url.startsWith("/tasks/") ? join(TASKS, url.slice(7)) : url.startsWith("/frames/") ? join(dir, url.slice(8)) : undefined;
  if (file === null) return res.writeHead(200, { "content-type": "text/html" }), res.end(PAGE);
  if (!file || !existsSync(file)) return res.writeHead(404), res.end();
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

// 3. Remotion's headless Chrome opens the page
const chrome = readdirSync("node_modules/.remotion/chrome-headless-shell", { recursive: true }).map(String).find((f) => /chrome-headless-shell(\.exe)?$/.test(f));
if (!chrome) throw new Error("Remotion's headless Chrome not found — render anything once (npx remotion still …) to download it");
const browser = spawn(resolve("node_modules/.remotion/chrome-headless-shell", chrome), ["--headless", "--use-angle=default", "--enable-unsafe-swiftshader", `--user-data-dir=${resolve(dir, "..", ".chrome")}`, `http://127.0.0.1:${port}/`], { stdio: "ignore" });
const timer = setTimeout(() => finish({ error: "timed out after 10 minutes" }), 600000);
const result = await done;
clearTimeout(timer);
browser.kill();
server.close();
process.stdout.write("\n");
if (result.error) throw new Error(result.error);

const found = result.frames.filter(Boolean).length;
mkdirSync("public/mocap", { recursive: true });
writeFileSync(`public/mocap/${name}.json`, JSON.stringify({ source: clip.split(/[\\/]/).pop(), fps, w: result.w, h: result.h, frames: result.frames }));
rmSync(dir, { recursive: true, force: true });
console.log(`wrote public/mocap/${name}.json — person found in ${found}/${result.frames.length} frames (${Math.round((found / result.frames.length) * 100)} %)`);
if (found < result.frames.length * 0.8) console.log("⚠ many frames without a person: film the whole body, plain background, better light");
