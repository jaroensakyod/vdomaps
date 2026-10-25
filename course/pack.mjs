// Build the Story Studio product folders and zips. Usage (from the repo root):
//   node course/pack.mjs 199|399 [--out dist] [--no-zip]
// Files are picked with git (tracked + untracked, minus .gitignore), so node_modules, .env, downloaded sounds and
// rasters never ship. Both editions get every style with its code; 399 adds the full long-form episode sources.
// The build stops if it finds an API key, a .env file, a raw sound file or a Gemini portrait in the output.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { values, positionals } = parseArgs({ allowPositionals: true, options: { out: { type: "string", default: "dist" }, "no-zip": { type: "boolean", default: false } } });
const tier = positionals[0];
if (tier !== "199" && tier !== "399") {
  console.error("Usage: node course/pack.mjs 199|399 [--out dist] [--no-zip]");
  process.exit(1);
}
const full = tier === "399";
const name = `story-studio-${tier}`;
const dist = path.resolve(repo, values.out);
const dest = path.join(dist, name);

// [repo path, product path, keep(relative path inside the source) → boolean]
const all = () => true;
// Styles marked `399` in the Set column of styles/INDEX.md ship only in the full edition.
const INDEX = readFileSync(path.join(repo, "skills/story-studio/styles/INDEX.md"), "utf8");
const fullOnly = new Set([...INDEX.matchAll(/^\| ([MN]\d\d) \|.*\| 399 \|$/gm)].map((m) => m[1]));
const styleFilter = (rel) => full || !fullOnly.has(rel.slice(0, 3));
const liteIndex = (s) =>
  s
    .split("\n")
    .filter((l) => !/^\| [MN]\d\d \|.*\| 399 \|$/.test(l))
    .join("\n")
    .replace(/^# 48 styles$/m, `# ${48 - fullOnly.size} styles`)
    .replace(/^\*\*Set:\*\*.*$/m, `This is the 199 edition. ${fullOnly.size} more styles (${[...fullOnly].join(", ")}) are in the 399 edition — if the user asks for one, say so.`);
const noPictures = (rel) => !/(^|\/)portraits(\/|\.json$|-[^/]*\.json$)/.test(rel) && !/\.(jpe?g|png|webp)$/i.test(rel);
// The map book's 45 recipes (styles.md) are a separate product: leave them out and point the workflow at INDEX.md.
const sharedRefs = (rel) => rel !== "styles.md";
const PATCH = {
  "story-studio/references/workflow.md": (s) => s.replaceAll("`styles.md`", "`styles/INDEX.md`"),
  // The product .bat runs it with -File: Windows PowerShell 5.1 reads a BOM-less file as ANSI and breaks the Thai text.
  "install-windows.ps1": (s) => (s.startsWith("﻿") ? s : "﻿" + s),
  ...(full ? {} : { "story-studio/styles/INDEX.md": liteIndex }),
};
const MAP = [
  ["skills/story-studio/SKILL.md", "story-studio/SKILL.md", all],
  ["skills/story-studio/AGENTS.md", "story-studio/AGENTS.md", all],
  ["skills/map-studio/references", "story-studio/references", sharedRefs],
  ["skills/story-studio/references", "story-studio/references", all],
  ["skills/story-studio/styles", "story-studio/styles", styleFilter],
  ["skills/map-studio/template", "story-studio/template", all],
  ["course/install-windows.ps1", "install-windows.ps1", all],
  ["course/product/install-windows.bat", "install-windows.bat", all],
  ["course/install-mac.sh", "install-mac.sh", all],
  ["course/env.example", "env.example", all],
  ["course/product/CLAUDE.md", "project/CLAUDE.md", all],
  ["course/product/AGENTS.md", "project/AGENTS.md", all],
  ["course/product/README.md", "README.md", all],
];
if (full) {
  MAP.push(["skills/story-studio/pro", "story-studio/pro", all]); // long-form + series kit (399 only)
  for (const p of ["news", "ep01", "ep04", "kit", "README.md", "th-rivers.mjs", "voices.json"]) MAP.push([`episodes/thaihistory/${p}`, `story-studio/episodes/thaihistory/${p}`, noPictures]);
  for (const p of ["ep01", "kit", "README.md", "SERIES.md", "speak.mjs", "voices.json"]) MAP.push([`episodes/worldhistory/${p}`, `story-studio/episodes/worldhistory/${p}`, noPictures]);
  MAP.push(["episodes/lab", "story-studio/episodes/lab", noPictures]);
}

const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" });
const listed = (p) => [...new Set(git("ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", p).split("\0").filter(Boolean))].filter((f) => existsSync(path.join(repo, f)));

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
let count = 0;
for (const [src, to, keep] of MAP) {
  const files = listed(src);
  if (files.length === 0) {
    console.warn(`!! nothing at ${src}`);
    continue;
  }
  const isFile = files.length === 1 && files[0] === src;
  for (const f of files) {
    const rel = isFile ? "" : path.posix.relative(src, f);
    if (!isFile && !keep(rel)) continue;
    const target = isFile ? path.join(dest, to) : path.join(dest, to, rel);
    mkdirSync(path.dirname(target), { recursive: true });
    const patch = PATCH[isFile ? to : path.posix.join(to, rel)];
    if (patch) writeFileSync(target, patch(readFileSync(path.join(repo, f), "utf8")));
    else cpSync(path.join(repo, f), target);
    count++;
  }
}

// Safety checks on the output.
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(path.join(dir, n)).isDirectory() ? walk(path.join(dir, n)) : [path.join(dir, n)]));
const problems = [];
const TEXT = /\.(md|mdx|txt|json|ts|tsx|mjs|js|cjs|ps1|sh|bat|ya?ml|example)$/i;
for (const f of walk(dest)) {
  const rel = path.relative(dest, f).split(path.sep).join("/");
  if (/(^|\/)\.env(\.|$)/.test(rel) && !rel.endsWith(".example")) problems.push(`env file: ${rel}`);
  if (/\.(mp3|wav|ogg|flac|m4a)$/i.test(rel) && !/^story-studio\/template\/public\/sfx\/[a-z]+\.wav$/.test(rel)) problems.push(`sound file: ${rel}`);
  if (/(^|\/)portraits\//.test(rel)) problems.push(`AI portrait: ${rel}`);
  if (!full && /^story-studio\/(episodes|pro)\//.test(rel)) problems.push(`399-only file in 199: ${rel}`);
  if (!full && fullOnly.has(rel.match(/^story-studio\/styles\/([MN]\d\d)-/)?.[1])) problems.push(`399-only style in 199: ${rel}`);
  if (TEXT.test(rel) || rel.endsWith(".env.example")) {
    const s = readFileSync(f, "utf8");
    if (/AIza[0-9A-Za-z_-]{30,}/.test(s)) problems.push(`Google API key: ${rel}`);
    if (/sk-(ant-)?[A-Za-z0-9_-]{20,}/.test(s)) problems.push(`secret key: ${rel}`);
    if (/^\s*GEMINI_API_KEY\s*=\s*[^\s#]+/m.test(s)) problems.push(`GEMINI_API_KEY with a value: ${rel}`);
  }
}
if (problems.length) {
  console.error(`STOP — ${problems.length} problem(s):\n   ${problems.join("\n   ")}`);
  rmSync(dest, { recursive: true, force: true });
  process.exit(1);
}
const packs = existsSync(path.join(dest, "story-studio/styles")) ? readdirSync(path.join(dest, "story-studio/styles")).filter((n) => /^[MN]\d\d-/.test(n)) : [];
console.log(`${name}: ${count} files, ${packs.length} style pack(s) → ${path.relative(repo, dest)}`);

if (!values["no-zip"]) {
  const zip = path.join(dist, `${name}.zip`);
  rmSync(zip, { force: true });
  if (process.platform === "win32") execFileSync("powershell", ["-NoProfile", "-Command", `Compress-Archive -Path '${dest}' -DestinationPath '${zip}'`], { stdio: "inherit" });
  else execFileSync("zip", ["-qr", zip, name], { cwd: dist, stdio: "inherit" });
  console.log(`zip → ${path.relative(repo, zip)} (${(statSync(zip).size / 1e6).toFixed(1)} MB)`);
}
