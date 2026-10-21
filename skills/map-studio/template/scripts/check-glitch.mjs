// Find single-frame render glitches in a video. Usage: node scripts/check-glitch.mjs out/video.mp4 [--jump 2]
// A GPU compositing glitch shows up as one frame whose brightness jumps away from both neighbours while the
// neighbours agree with each other. Prints those frame numbers (re-render with --gl=angle, or those frames).
// Exit code 1 when any are found, so it can gate a render script.
import { spawnSync } from "node:child_process";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({ allowPositionals: true, options: { jump: { type: "string", default: "2" } } });
const [file] = positionals;
if (!file) throw new Error("usage: node scripts/check-glitch.mjs <video.mp4>");
const jump = Number(values.jump);
const { stderr } = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-vf", "signalstats,metadata=print:key=lavfi.signalstats.YAVG", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 28 });
const y = [...stderr.matchAll(/YAVG=([\d.]+)/g)].map((m) => +m[1]);
const bad = [];
for (let i = 1; i < y.length - 1; i++) if (Math.abs(y[i] - y[i - 1]) > jump && Math.abs(y[i + 1] - y[i - 1]) < jump / 2) bad.push(i);
console.log(`${file}: ${y.length} frames, ${bad.length} glitch frame(s)${bad.length ? ": " + bad.join(" ") : ""}`);
process.exit(bad.length ? 1 : 0);
