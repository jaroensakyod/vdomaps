// Story Studio e-book: chapters (chapters/*.md) + one page per style (from each pack) → HTML → PDF with Chrome.
// Usage (repo root): node course/ebook/build.mjs basic|pro|premium|all
// Writes course/ebook/out/story-studio-<tier>.html and .pdf. Covers are shrunk into out/img/ with ffmpeg.
// Thai copy for each style page comes from styles-th.json ({ "M01": { "fits": "...", "look": "..." } }); a style
// without an entry falls back to its INDEX.md row.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../..");
const stylesDir = path.join(repo, "skills/story-studio/styles");
const out = path.join(here, "out");
const TIERS = ["basic", "pro", "premium"];
const EDITION = {
  basic: { name: "Basic", price: "199", note: "24 สไตล์ · โค้ดสำเร็จทุกสไตล์" },
  pro: { name: "Pro", price: "299", note: "48 สไตล์ · ซอร์สตอนเต็ม 3 ตอน · คลิปยาวและซีรีส์" },
  premium: { name: "Premium", price: "990", note: "72 สไตล์ · ทุกอย่างใน Pro · สอนตัวต่อตัว" },
};
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find(existsSync);

const arg = process.argv[2];
const tiers = arg === "all" ? TIERS : TIERS.includes(arg) ? [arg] : null;
if (!tiers) {
  console.error("Usage: node course/ebook/build.mjs basic|pro|premium|all");
  process.exit(1);
}
const rank = (t) => TIERS.indexOf(t);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---- a small Markdown subset: headings, paragraphs, lists, tables, code fences, bold, inline code
const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\*([^*]+)\*/g, "<i>$1</i>");
const md = (src) => {
  const lines = src.split(/\r?\n/);
  const html = [];
  for (let i = 0; i < lines.length; ) {
    const l = lines[i];
    if (l.startsWith("```")) {
      const body = [];
      for (i++; i < lines.length && !lines[i].startsWith("```"); i++) body.push(lines[i]);
      i++;
      html.push(`<pre>${esc(body.join("\n"))}</pre>`);
    } else if (/^#{1,3} /.test(l)) {
      const n = l.match(/^#+/)[0].length;
      html.push(`<h${n}>${inline(l.slice(n + 1))}</h${n}>`);
      i++;
    } else if (l.startsWith("|")) {
      const rows = [];
      for (; i < lines.length && lines[i].startsWith("|"); i++) rows.push(lines[i]);
      const cells = (r) => r.slice(1, r.endsWith("|") ? -1 : undefined).split("|").map((c) => c.trim());
      html.push(`<table><tr>${cells(rows[0]).map((c) => `<th>${inline(c)}</th>`).join("")}</tr>${rows.slice(2).map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</table>`);
    } else if (/^(\d+\.|-) /.test(l)) {
      const ordered = /^\d+\./.test(l);
      const items = [];
      for (; i < lines.length && /^(\d+\.|-) /.test(lines[i]); i++) {
        let item = lines[i].replace(/^(\d+\.|-) /, "");
        while (i + 1 < lines.length && /^ {2,}\S/.test(lines[i + 1])) item += "<br>" + inline(lines[++i].trim());
        items.push(item.includes("<br>") ? inline(item.split("<br>")[0]) + "<br>" + item.split("<br>").slice(1).join("<br>") : inline(item));
      }
      html.push(`<${ordered ? "ol" : "ul"}>${items.map((x) => `<li>${x}</li>`).join("")}</${ordered ? "ol" : "ul"}>`);
    } else if (/^<!-- styles:([MN]) -->$/.test(l.trim())) {
      html.push(l.trim());
      i++;
    } else if (l.trim() === "") {
      i++;
    } else {
      const para = [];
      for (; i < lines.length && lines[i].trim() && !/^(#|\||```|(\d+\.|-) |<!--)/.test(lines[i]); i++) para.push(lines[i].trim());
      html.push(`<p>${inline(para.join(" "))}</p>`);
    }
  }
  return html.join("\n");
};

// ---- styles
const INDEX = readFileSync(path.join(stylesDir, "INDEX.md"), "utf8");
const rows = [...INDEX.matchAll(/^\| ([MN]\d\d) \| `([^`]+)` \| ([^|]+)\| ([^|]+)\| ([^|]+)\| (basic|pro|premium) \|\r?$/gm)].map((m) => ({ id: m[1], folder: m[2], title: m[3].trim(), fits: m[4].trim(), formats: m[5].trim(), set: m[6] }));
const thai = existsSync(path.join(here, "styles-th.json")) ? JSON.parse(readFileSync(path.join(here, "styles-th.json"), "utf8")) : {};
mkdirSync(path.join(out, "img"), { recursive: true });
const cover = (folder) => {
  const dir = path.join(stylesDir, folder);
  const src = ["cover-9x16.jpg", "cover-4x5.jpg"].map((f) => path.join(dir, f)).find(existsSync);
  if (!src) return null;
  const dst = path.join(out, "img", `${folder}.jpg`);
  if (!existsSync(dst)) execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", src, "-vf", "scale=600:-2", "-q:v", "4", dst]);
  return pathToFileURL(dst).href;
};
const promptOf = (folder) => {
  const f = path.join(stylesDir, folder, "PROMPT.md");
  if (!existsSync(f)) return { first: "", topics: [] };
  const s = readFileSync(f, "utf8");
  const first = (s.match(/```[a-z]*\r?\n([\s\S]*?)```/) ?? [, ""])[1].trim();
  // the numbered list under the "ตัวอย่างเรื่อง…" heading
  const tail = s.split(/^##\s*ตัวอย่างเรื่อง.*$/m)[1] ?? "";
  const topics = [...tail.matchAll(/^\s*\d+\.\s+(.+)$/gm)].map((m) => m[1].replace(/\*\*/g, "").trim()).slice(0, 3);
  return { first, topics };
};
const wide = (folder) => {
  const src = path.join(stylesDir, folder, "cover-16x9.jpg");
  if (!existsSync(src)) return null;
  const dst = path.join(out, "img", `${folder}-wide.jpg`);
  if (!existsSync(dst)) execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", src, "-vf", "scale=800:-2", "-q:v", "4", dst]);
  return pathToFileURL(dst).href;
};
const AXIS_TH = { base: "พื้น", line: "เส้น", type: "ตัวอักษร", motion: "การเคลื่อนไหว", frame: "กรอบ" };
const SET_TH = { basic: "Basic ขึ้นไป", pro: "Pro ขึ้นไป", premium: "Premium" };
const stylePage = (r) => {
  const sj = path.join(stylesDir, r.folder, "style.json");
  const sig = existsSync(sj) ? JSON.parse(readFileSync(sj, "utf8")).signature ?? {} : {};
  const [nameTh, nameEn] = r.title.split(" · ");
  const th = thai[r.id] ?? {};
  const img = cover(r.folder);
  const wideImg = wide(r.folder);
  const { first, topics } = promptOf(r.folder);
  return `<section class="style">
  <div class="shot">${img ? `<img src="${img}">` : `<div class="noimg">ยังไม่มีภาพ</div>`}${wideImg ? `<img class="wide" src="${wideImg}"><div class="cap">แนวนอน 16:9</div>` : ""}</div>
  <div class="info">
    <div class="sid">${r.id}<span class="set">${SET_TH[r.set]}</span></div>
    <h2>${esc(nameTh)}</h2>
    <div class="en">${esc(nameEn ?? "")}</div>
    <h4>เหมาะกับ</h4><p>${esc(th.fits ?? r.fits)}</p>
    ${th.look ? `<h4>หน้าตา</h4><p>${esc(th.look)}</p>` : ""}
    <h4>สี</h4><div class="swatches">${(sig.palette ?? []).map((c) => `<span style="background:${c}" title="${c}"></span>`).join("")}</div>
    <h4>ลายเซ็น</h4><div class="chips">${Object.entries(AXIS_TH).map(([k, t]) => (sig[k] ? `<span><i>${t}</i> ${esc(sig[k])}</span>` : "")).join("")}</div>
    <div class="meta">ขนาด ${esc(r.formats.replace("V", "9:16").replace("W", "16:9"))} · โฟลเดอร์ <code>${esc(r.folder)}</code></div>
    <h4>คำสั่งแรก</h4><pre>${esc(first)}</pre>
    ${topics.length ? `<h4>ตัวอย่างเรื่องที่เหมาะ</h4><ol class="topics">${topics.map((t) => `<li>${inline(t)}</li>`).join("")}</ol>` : ""}
    <div class="more">คำสั่งครบ 4 ขั้นอยู่ใน <code>${esc(r.folder)}/PROMPT.md</code> · รายละเอียดสไตล์ใน <code>STYLE.md</code></div>
  </div>
</section>`;
};

// ---- lesson clips on Drive (course/lessons.json): an edition gets its own clips and every lower edition's
const LESSONS = JSON.parse(readFileSync(path.join(repo, "course/lessons.json"), "utf8")).lessons;
const clipUrl = (l) => `https://drive.google.com/file/d/${l.id}/view`;
const clipLink = (l) => `<a href="${clipUrl(l)}"><b>${l.code}</b> ${esc(l.title)}</a>`;
const clipBox = (ls) => (ls.length ? `<div class="clips"><span>▶ คลิปสอน</span>${ls.map(clipLink).join("")}</div>` : "");

// ---- chapters
const chapters = readdirSync(path.join(here, "chapters"))
  .filter((f) => f.endsWith(".md"))
  .sort()
  .map((f) => {
    const src = readFileSync(path.join(here, "chapters", f), "utf8");
    const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    const tiersOf = fm ? (fm[1].match(/tiers:\s*(.+)/)?.[1] ?? "").split(",").map((s) => s.trim()) : TIERS;
    const body = fm ? src.slice(fm[0].length) : src;
    return { file: f, tiers: tiersOf, title: body.match(/^# (.+)$/m)?.[1] ?? f, body };
  });

const CSS = readFileSync(path.join(here, "theme.css"), "utf8");
for (const tier of tiers) {
  const ed = EDITION[tier];
  const mine = rows.filter((r) => rank(r.set) <= rank(tier));
  const chs = chapters.filter((c) => c.tiers.includes(tier));
  const mosaic = mine.filter((_, i) => i % Math.max(1, Math.floor(mine.length / 12)) === 0).slice(0, 12).map((r) => cover(r.folder)).filter(Boolean);
  const toc = chs.map((c, i) => `<li><span>${i + 1}</span>${inline(c.title)}</li>`).join("");
  const lessons = LESSONS.filter((l) => rank(l.tier) <= rank(tier));
  const body = chs
    .map((c, i) => {
      const box = clipBox(lessons.filter((l) => l.chapters.includes(c.file.replace(/\.md$/, ""))));
      let h = md(c.body).replace(/^<h1>(.*?)<\/h1>/, `<div class="chno">บทที่ ${i + 1}</div><h1>$1</h1>${box}`);
      h = h.replace(/<!-- styles:([MN]) -->/g, (_, k) => mine.filter((r) => r.id[0] === k).map(stylePage).join("\n"));
      return `<article class="chapter">${h}</article>`;
    })
    .join("\n");
  const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><title>Story Studio ${ed.name}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;600;700&family=Noto+Serif+Thai:wght@600;800&family=IBM+Plex+Mono&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
<section class="cover">
  <div class="mosaic">${mosaic.map((u) => `<img src="${u}">`).join("")}</div>
  <div class="cover-text">
    <div class="kicker">E-book + Agent Skill</div>
    <h1 class="title">Story Studio</h1>
    <div class="sub">ทำช่องเล่าเรื่องที่ไม่เหมือนใคร<br>วาดด้วยโค้ดทุกเฟรม ด้วย Claude Code หรือ Codex</div>
    <div class="edition">${ed.name} · ${ed.price} บาท</div>
    <div class="ednote">${ed.note}</div>
  </div>
</section>
<section class="toc"><h1>สารบัญ</h1><ol>${toc}</ol>
  <div class="tocstyles">สไตล์ในเล่มนี้ ${mine.length} แบบ: มีแผนที่ ${mine.filter((r) => r.id[0] === "M").length} · ไม่มีแผนที่ ${mine.filter((r) => r.id[0] === "N").length}</div></section>
<section class="toc lessons"><h1>คลิปสอน ${lessons.length} คลิป</h1>
  <p>ดูคู่กับบทในเล่มนี้ กดที่ชื่อคลิปเพื่อเปิดใน Google Drive (ทุกบทที่มีคลิปจะมีกล่อง ▶ คลิปสอน ใต้หัวบท)</p>
  <ol>${lessons.map((l) => `<li><span>${l.code}</span><a href="${clipUrl(l)}">${esc(l.title)}</a></li>`).join("")}</ol></section>
${body}
<section class="back"><div>Story Studio · ${ed.name}</div><div class="small">ภาพทุกภาพในเล่มวาดด้วยโค้ด ไม่มีภาพจาก AI สร้างรูป · ห้ามแจกหรือขายต่อ</div></section>
</body></html>`;
  const htmlFile = path.join(out, `story-studio-${tier}.html`);
  writeFileSync(htmlFile, html);
  const pdf = path.join(out, `story-studio-${tier}.pdf`);
  if (!CHROME) {
    console.log(`${tier}: HTML only (no Chrome/Edge found) → ${path.relative(repo, htmlFile)}`);
    continue;
  }
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--allow-file-access-from-files", "--virtual-time-budget=20000", `--print-to-pdf=${pdf}`, pathToFileURL(htmlFile).href], { stdio: "ignore" });
  console.log(`${tier}: ${mine.length} styles, ${chs.length} chapters → ${path.relative(repo, pdf)}`);
}
