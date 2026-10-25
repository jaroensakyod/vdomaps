// Install a story-studio style pack into this project. Usage:
//   npm run style -- list                  styles found, whether they have code, whether installed
//   npm run style -- N05 [--lock]          copy Demo.tsx + kit/ to src/styles/N05/, register Style-N05 (--lock: style.json → project/)
//   npm run style -- N05 --remove          uninstall
//   --from <styles dir>                    use another styles/ folder (default: see styles-lib.mjs)
// A pack without Demo.tsx (a style still being made) only gets STYLE.md + PROMPT.md copied to project/styles/<id>/.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { findPack, findStylesDir, listPacks, root } from "./styles-lib.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { from: { type: "string" }, lock: { type: "boolean", default: false }, remove: { type: "boolean", default: false } },
});
const [cmd] = positionals;
const installedDir = path.join(root, "src/styles");
const installed = () => readdirSync(installedDir, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(path.join(installedDir, d.name, "Demo.tsx"))).map((d) => d.name).sort();

const writeRegistry = () => {
  const ids = installed();
  const v = (id) => `S_${id.replace(/\W/g, "_")}`;
  writeFileSync(
    path.join(installedDir, "registry.ts"),
    [
      "// Written by `npm run style -- <id>` (scripts/style.mjs). Do not edit by hand.",
      'import type { StyleEntry } from "./types";',
      ...ids.map((id) => `import * as ${v(id)} from "./${id}/Demo";`),
      "",
      `export const STYLES: StyleEntry[] = [${ids.map(v).join(", ")}];`,
      "",
    ].join("\n"),
  );
  return ids;
};

if (!cmd) {
  console.log("Usage: npm run style -- list | <ID> [--lock] [--remove] [--from <styles dir>]");
  process.exit(1);
}

if (values.remove) {
  rmSync(path.join(installedDir, cmd.toUpperCase()), { recursive: true, force: true });
  console.log(`removed ${cmd.toUpperCase()} · installed: ${writeRegistry().join(", ") || "none"}`);
  process.exit(0);
}

const stylesDir = findStylesDir(values.from);
if (!stylesDir) {
  console.error("ไม่พบโฟลเดอร์ styles ของ story-studio — ใส่ --from <โฟลเดอร์ styles> หรือตั้ง STORY_STYLES");
  process.exit(1);
}

if (cmd === "list") {
  const have = new Set(installed());
  console.log(`styles: ${stylesDir}`);
  for (const p of listPacks(stylesDir)) console.log(`${p.id}  ${p.folder.padEnd(26)} ${p.code ? "code" : "guide"}${have.has(p.id) ? "  (installed)" : ""}`);
  process.exit(0);
}

const pack = findPack(stylesDir, cmd);
if (!pack) {
  console.error(`ไม่พบสไตล์ ${cmd} ใน ${stylesDir} — ดูรายการด้วย: npm run style -- list`);
  process.exit(1);
}

if (values.lock && existsSync(path.join(pack.dir, "style.json"))) {
  mkdirSync(path.join(root, "project"), { recursive: true });
  cpSync(path.join(pack.dir, "style.json"), path.join(root, "project/style.json"));
  console.log("locked project/style.json");
}

if (!pack.code) {
  const ref = path.join(root, "project/styles", pack.id);
  mkdirSync(ref, { recursive: true });
  for (const f of ["STYLE.md", "PROMPT.md", "style.json", "cover-9x16.jpg", "cover-16x9.jpg"]) if (existsSync(path.join(pack.dir, f))) cpSync(path.join(pack.dir, f), path.join(ref, f));
  console.log(`${pack.id}: สไตล์นี้ยังไม่มีโค้ด — คัดลอกคู่มือไว้ที่ project/styles/${pack.id}/ ให้ผู้ช่วย AI สร้างฉากตาม STYLE.md`);
  process.exit(0);
}

const dest = path.join(installedDir, pack.id);
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(path.join(pack.dir, "Demo.tsx"), path.join(dest, "Demo.tsx"));
if (existsSync(path.join(pack.dir, "kit"))) cpSync(path.join(pack.dir, "kit"), path.join(dest, "kit"), { recursive: true });
const ids = writeRegistry();
console.log(`installed ${pack.id} (${pack.folder}) → src/styles/${pack.id}/ · registered: ${ids.join(", ")}`);
console.log(`preview: npx remotion studio  ·  still: npx remotion still Style-${pack.id} out/${pack.id}.jpg --frame=<cover>`);
