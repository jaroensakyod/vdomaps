// YouTube description with chapters, sources and credits. Usage: node scripts/describe.mjs <slug> [--fps 30 --lead 12 --gap 8]
// meta.json "lang": "en" switches the section headings to English (default Thai).
// Reads src/episodes/<slug>/meta.json (creates a stub to fill in on first run), beats.json and timing.json.
// Chapter times come from the beat each chapter starts on, so they follow the VO after every re-render.
// Writes out/<slug>-description.txt.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { parseArgs } from "node:util";
import { buildBeats, totalFrames } from "../src/components/subs.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { fps: { type: "string" }, lead: { type: "string" }, gap: { type: "string" } },
});
const [slug] = positionals;
if (!slug) throw new Error("usage: node scripts/describe.mjs <slug>");
const layout = Object.fromEntries(["fps", "lead", "gap"].filter((k) => values[k]).map((k) => [k, Number(values[k])]));
const fps = layout.fps ?? 30;

const dir = `src/episodes/${slug}`;
const beatText = JSON.parse(readFileSync(`${dir}/beats.json`, "utf8"));
const beats = buildBeats(JSON.parse(readFileSync(`${dir}/timing.json`, "utf8")), beatText, layout);
const metaFile = `${dir}/meta.json`;
if (!existsSync(metaFile)) {
  const stub = {
    title: "",
    summary: "",
    chapters: [{ beat: beats[0].id, title: "" }],
    sources: [],
    credits: ["แผนที่: Natural Earth"],
    music: [],
    note: "ภาพแผนที่ทุกฉากวาดด้วยโค้ดจากข้อมูลแผนที่เปิด",
    tags: [],
  };
  writeFileSync(metaFile, JSON.stringify(stub, null, 2));
  console.log(`wrote ${metaFile} — fill in title, summary, chapters (beat ids: ${beats.map((b) => b.id).join(", ")}), then run again`);
  process.exit(0);
}
const meta = JSON.parse(readFileSync(metaFile, "utf8"));

const clock = (sec) => {
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, r = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
};

const out = [];
if (meta.title) out.push(meta.title, "");
if (meta.summary) out.push(meta.summary, "");

const total = totalFrames(beats, layout) / fps;
if (meta.chapters?.length) {
  const ch = meta.chapters.map((c, i) => {
    const b = beats.find((x) => x.id === c.beat);
    if (!b) throw new Error(`chapter "${c.title}": no beat "${c.beat}"`);
    return { title: c.title, sec: i === 0 ? 0 : b.start / fps }; // YouTube needs the first chapter at 0:00
  });
  // YouTube only shows chapters when there are ≥ 3, each ≥ 10 s long.
  const short = ch.filter((c, i) => (ch[i + 1]?.sec ?? total) - c.sec < 10);
  if (ch.length < 3 || short.length) console.warn(`⚠ YouTube ignores chapters unless there are ≥ 3 and each is ≥ 10 s${short.length ? ` (too short: ${short.map((c) => c.title).join(", ")})` : ""}`);
  out.push(meta.lang === "en" ? "Chapters" : "บทในคลิป", ...ch.map((c) => `${clock(c.sec)} ${c.title}`), "");
}

let sources = meta.sources ?? [];
if (!sources.length && existsSync(`${dir}/sources.md`))
  sources = [...new Set(readFileSync(`${dir}/sources.md`, "utf8").match(/https?:\/\/[^\s)|>]+/g) ?? [])];
if (sources.length) out.push(meta.lang === "en" ? "Sources" : "แหล่งข้อมูล", ...sources.map((s) => `- ${s}`), "");
if (meta.credits?.length) out.push(meta.lang === "en" ? "Credits" : "เครดิตแผนที่", ...meta.credits.map((s) => `- ${s}`), "");
if (meta.music?.length) out.push("เพลงและเสียงประกอบ", ...meta.music.map((s) => `- ${s}`), "");
if (meta.note) out.push(meta.note);
if (meta.tags?.length) out.push("", meta.tags.map((t) => `#${t.replace(/\s+/g, "")}`).join(" "));

const file = `out/${slug}-description.txt`;
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, out.join("\n") + "\n");
console.log(`${file}  (${clock(total)} long)`);
