// Shared by style.mjs and gallery.mjs: where the project is, where the story-studio style packs are.
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// First existing styles/ folder: --from, $STORY_STYLES, the project's skill, the user's skills, the repo layout.
export const findStylesDir = (from) => {
  const candidates = [
    from,
    process.env.STORY_STYLES,
    path.join(root, ".claude/skills/story-studio/styles"),
    path.join(homedir(), ".claude/skills/story-studio/styles"),
    path.join(homedir(), ".codex/skills/story-studio/styles"),
    path.join(root, "../styles"), // the template inside a packed story-studio folder
    path.join(root, "../../story-studio/styles"), // this repo: skills/map-studio/template → skills/story-studio
  ].filter(Boolean);
  return candidates.map((c) => path.resolve(c)).find((c) => existsSync(path.join(c, "INDEX.md")));
};

// Style packs in a styles/ folder: [{ id: "N05", folder: "N05-nangyai", dir, code }]
export const listPacks = (stylesDir) =>
  readdirSync(stylesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^[MN]\d\d-/.test(d.name))
    .map((d) => ({ id: d.name.slice(0, 3), folder: d.name, dir: path.join(stylesDir, d.name), code: existsSync(path.join(stylesDir, d.name, "Demo.tsx")) }))
    .sort((a, b) => a.id.localeCompare(b.id));

export const findPack = (stylesDir, id) => listPacks(stylesDir).find((p) => p.id.toLowerCase() === id.toLowerCase());
