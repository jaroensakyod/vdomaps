// Story Studio slide deck (16:9): HTML → PDF (Chrome) and PPTX (one image per slide, via pptxgenjs).
// Usage (repo root): node course/ebook/slides.mjs     → course/ebook/out/story-studio-slides.{html,pdf,pptx}
// Needs `npm install` once in course/ebook (pptxgenjs). Style grids come from styles/INDEX.md and the pack covers.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../..");
const stylesDir = path.join(repo, "skills/story-studio/styles");
const out = path.join(here, "out");
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find(existsSync);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
mkdirSync(path.join(out, "img"), { recursive: true });

const INDEX = readFileSync(path.join(stylesDir, "INDEX.md"), "utf8");
const rows = [...INDEX.matchAll(/^\| ([MN]\d\d) \| `([^`]+)` \| ([^|]+)\| ([^|]+)\| ([^|]+)\| (basic|pro|premium) \|\r?$/gm)].map((m) => ({ id: m[1], folder: m[2], name: m[3].split(" · ")[0].trim(), set: m[6] }));
const cover = (folder) => {
  const src = ["cover-9x16.jpg", "cover-4x5.jpg"].map((f) => path.join(stylesDir, folder, f)).find(existsSync);
  if (!src) return null;
  const dst = path.join(out, "img", `${folder}.jpg`);
  if (!existsSync(dst)) execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", src, "-vf", "scale=600:-2", "-q:v", "4", dst]);
  return pathToFileURL(dst).href;
};
const SET = { basic: "Basic", pro: "Pro", premium: "Premium" };
const grid = (list) => `<div class="grid">${list.map((r) => `<figure><img src="${cover(r.folder) ?? ""}"><figcaption><b>${r.id}</b> ${esc(r.name)}<span class="t ${r.set}">${SET[r.set]}</span></figcaption></figure>`).join("")}</div>`;
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
const M = rows.filter((r) => r.id[0] === "M");
const N = rows.filter((r) => r.id[0] === "N");

const S = []; // [title, html, className]
const slide = (body, cls = "") => S.push({ body, cls });
slide(`<div class="kicker">E-book + Agent Skill</div><h1 class="big">Story Studio</h1><p class="lead">ทำช่องเล่าเรื่องที่ไม่เหมือนใคร<br>วาดด้วยโค้ดทุกเฟรม ด้วย Claude Code หรือ Codex</p><div class="pills"><span>${rows.length} สไตล์</span><span>มีแผนที่ ${M.length}</span><span>ไม่มีแผนที่ ${N.length}</span></div>`, "title");
slide(`<h2>ปัญหาของช่องเล่าเรื่องทุกวันนี้</h2><ul class="xl"><li>ใช้ภาพจาก AI สร้างรูป หน้าตาเหมือนกันทุกช่อง มือเพี้ยน หน้าเพี้ยน</li><li>แผนที่ลอกจาก Google Maps เสี่ยงลิขสิทธิ์</li><li>ทำเองทีละเฟรมใช้เวลาหลายวันต่อคลิป</li><li>ซื้อเทมเพลตเดียวกัน ช่องก็ออกมาเหมือนกัน</li></ul>`);
slide(`<h2>วิธีของเรา</h2><div class="cols3"><div><h3>วาดด้วยโค้ด</h3><p>ทุกภาพเป็นโค้ด Remotion แก้ได้ทุกจุด ไม่มีภาพ AI</p></div><div><h3>ผู้ช่วย AI เป็นทีมผลิต</h3><p>Claude Code หรือ Codex ทำตามขั้นตอน หยุดให้คุณอนุมัติ 3 ครั้ง</p></div><div><h3>หน้าตาเป็นของคุณ</h3><p>ลายเซ็นช่องที่ผ่านตัวตรวจความต่างจากภาพจริง</p></div></div>`);
slide(`<h2>ตัวอย่างสไตล์</h2>${grid(rows.filter((_, i) => i % 6 === 0).slice(0, 12))}`, "gridslide");
slide(`<h2>8 ขั้น 3 ด่านอนุมัติ</h2><ol class="steps"><li>เลือกเรื่อง</li><li>ค้นข้อมูล + แหล่งอ้างอิง</li><li class="gate">เขียนบท · ด่าน 1</li><li class="gate">ภาพนิ่ง 3 ฉาก · ด่าน 2</li><li>เสียงพากย์ + จับเวลาคำ</li><li>สร้างฉากตามคำพากย์</li><li>ทดสอบ 10 วินาที</li><li class="gate">ตัวเต็ม + ซับ + ปก · ด่าน 3</li></ol><p class="note">ผู้ช่วย AI ไม่อัปโหลดเอง คุณอัปโหลดทุกครั้ง</p>`);
slide(`<h2>ติดตั้งครั้งเดียว</h2><ol class="xl"><li>แตก zip แล้วดับเบิลคลิก <code>install-windows.bat</code> (Mac: <code>install-mac.sh</code>)</li><li>เลือก Claude Code หรือ Codex</li><li>วาง Gemini key ลงในไฟล์ <code>.env</code></li><li>เปิดโฟลเดอร์งาน แล้วพิมพ์ <i>"เช็กว่าเครื่องพร้อมทำคลิปไหม"</i></li></ol><p class="note">ตัวติดตั้งเลือกโหมดการ์ดจอให้ และตรวจ Smart App Control ของ Windows 11</p>`);
slide(`<h2>คำสั่ง 4 ขั้น ใช้ได้กับทุกสไตล์</h2><pre>1. ใช้สไตล์ N05 ทำคลิปเรื่อง ศึกบางระจัน ยาว 45 วินาที แนวตั้ง — หาข้อมูล เขียนบทให้ดูก่อน
2. บทผ่านแล้ว ทำภาพนิ่ง 3 ฉากตามสไตล์ N05 ให้ดู
3. ภาพผ่าน ทำเสียงพากย์ ซับ แล้วเรนเดอร์ 10 วินาทีแรกให้ดู
4. เรนเดอร์ตัวเต็ม พร้อมปก คำอธิบายคลิป และเครดิต</pre>`);
slide(`<h2>ลายเซ็นช่อง: ไม่ซ้ำใคร วัดได้จริง</h2><div class="cols2"><div><h3>6 แกนของหน้าตา</h3><p>พื้น · สี · เส้น · ตัวอักษร · การเคลื่อนไหว · กรอบเล่า<br>เปลี่ยนอย่างน้อย 3 แกนจากสไตล์ตั้งต้น</p></div><div><h3>ตัวตรวจ <code>npm run distinct</code></h3><p>วัดจากภาพที่เรนเดอร์จริง: สี การจัดวาง พื้นผิว<br>ผ่านเมื่อคะแนนความต่าง ≥ 0.30 กับทุกสไตล์<br>ทุกสไตล์ในชุดผ่านเกณฑ์นี้ทุกคู่</p></div></div>`);
chunk(M, 12).forEach((c, i, a) => slide(`<h2>สไตล์มีแผนที่ <span class="muted">${i + 1}/${a.length}</span></h2>${grid(c)}`, "gridslide"));
chunk(N, 12).forEach((c, i, a) => slide(`<h2>สไตล์ไม่มีแผนที่ <span class="muted">${i + 1}/${a.length}</span></h2>${grid(c)}`, "gridslide"));
slide(`<h2>เสียงที่ทำให้คลิปมีชีวิต</h2><ul class="xl"><li>พากย์ด้วย Gemini TTS หลายเสียงตัวละคร</li><li>Whisper จับเวลาทุกคำ ภาพเปลี่ยนตรงคำพูด ซับตรงปาก</li><li>คลังเสียงจริง ลงตรงจุดกระแทกของแต่ละเหตุการณ์</li><li>ปรับความดังตามมาตรฐาน YouTube (−14 LUFS)</li></ul>`);
slide(`<h2>ซื่อตรงกับคนดู</h2><ul class="xl"><li>แผนที่จากข้อมูลเปิด พร้อมเครดิตที่ถูกต้องในคำอธิบายคลิป</li><li>ป้าย "ภาพประกอบ" · "ภาพจำลอง" · "โดยประมาณ" บนจอ</li><li>ทุกข้อเท็จจริงมีแหล่งอ้างอิงใน <code>sources.md</code></li><li>ไม่ใช้ภาพจาก AI สร้างรูป</li></ul>`);
slide(`<h2>คลิปยาว 10 นาที และซีรีส์ <span class="t pro">Pro ขึ้นไป</span></h2><div class="cols2"><div><h3>ซอร์สตอนเต็ม 3 ตอน</h3><p>กรุงศรีแตก 9:57 · จุดจบพระเจ้าตาก 10:51 · นโปเลียนบุกรัสเซีย 9:28<br>คัดลอกโครงตอน แล้วเปลี่ยนเป็นเรื่องของคุณ</p></div><div><h3>เล่าด้วยหลักฐานหลายฝ่าย</h3><p>รูปแบบที่ได้ยอดวิวดีที่สุด เหตุการณ์เดียว หลักฐานแต่ละฝ่ายเล่าไม่ตรงกัน ให้คนดูตัดสินเอง</p></div></div>`);
const count = (t) => rows.filter((r) => ["basic", "pro", "premium"].indexOf(r.set) <= ["basic", "pro", "premium"].indexOf(t)).length;
slide(`<h2>เลือกชุดที่ใช่</h2><div class="tiers"><div><h3>Basic</h3><div class="price">199</div><ul><li>${count("basic")} สไตล์ โค้ดสำเร็จ</li><li>Skill + ตัวติดตั้ง</li><li>เครื่องมือเสียงและซับครบ</li><li>E-book</li></ul></div><div class="hot"><h3>Pro</h3><div class="price">299</div><ul><li>${count("pro")} สไตล์</li><li>ทุกอย่างใน Basic</li><li>ซอร์สตอนเต็ม 3 ตอน</li><li>บทคลิปยาวและซีรีส์</li></ul></div><div><h3>Premium</h3><div class="price">990</div><ul><li>${count("premium")} สไตล์</li><li>ทุกอย่างใน Pro</li><li>สอนตัวต่อตัว</li><li>ตั้งช่องจนได้คลิปแรก</li></ul></div></div>`);
slide(`<h2>Premium: สอนตัวต่อตัว</h2><ol class="xl"><li>ตั้งเครื่องให้ผ่านบนเครื่องของคุณ</li><li>เลือกนิชและสไตล์ที่เหมาะกับช่อง</li><li>สร้างลายเซ็นช่องของคุณเอง</li><li>ทำคลิปแรกด้วยกันจนเรนเดอร์</li><li>วางแผน 10 ตอนแรก</li></ol>`);
slide(`<h1 class="big">เริ่มช่องของคุณวันนี้</h1><p class="lead">เลือกเรื่อง อนุมัติบท ดูภาพ แล้วปล่อยให้ผู้ช่วย AI ทำที่เหลือ</p>`, "title");

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><title>Story Studio slides</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;600;700&family=Noto+Serif+Thai:wght@700;800&family=IBM+Plex+Mono&display=swap" rel="stylesheet">
<style>
@page { size: 1920px 1080px; margin: 0; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { margin: 0; background: #141414; }
.s { width: 1920px; height: 1080px; padding: 90px 120px; background: #f4eee2; color: #1d1a16; font: 34px/1.55 "IBM Plex Sans Thai"; position: relative; overflow: hidden; break-after: page; }
.s::after { content: "Story Studio"; position: absolute; right: 120px; bottom: 44px; font: 700 22px "IBM Plex Sans Thai"; color: #b3323b; letter-spacing: .1em; }
.s.title { background: #141414; color: #f4eee2; display: flex; flex-direction: column; justify-content: center; }
h1, h2, h3 { font-family: "Noto Serif Thai"; margin: 0 0 30px; line-height: 1.2; }
h2 { font-size: 64px; border-bottom: 6px solid #b3323b; padding-bottom: 18px; display: flex; align-items: center; gap: 24px; }
h3 { font-size: 40px; color: #1f5b5c; margin-bottom: 14px; }
.big { font-size: 140px; color: #fff; }
.kicker { color: #c9a44a; font-weight: 700; letter-spacing: .25em; font-size: 28px; text-transform: uppercase; }
.lead { font-size: 46px; line-height: 1.5; color: #e9e0cf; }
.pills span { display: inline-block; background: #b3323b; color: #fff; padding: 10px 28px; border-radius: 40px; margin: 30px 16px 0 0; font-weight: 700; }
.xl li { margin: 14px 0; font-size: 40px; }
.cols3, .cols2 { display: grid; gap: 60px; } .cols3 { grid-template-columns: repeat(3, 1fr); } .cols2 { grid-template-columns: 1fr 1fr; }
.cols3 > div, .cols2 > div { background: #fff; border-radius: 24px; padding: 44px; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
.steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; padding: 0; list-style: none; counter-reset: s; }
.steps li { counter-increment: s; background: #fff; border-radius: 20px; padding: 30px 28px; font-size: 32px; min-height: 190px; }
.steps li::before { content: counter(s); display: block; font: 800 54px "Noto Serif Thai"; color: #1f5b5c; }
.steps li.gate { background: #b3323b; color: #fff; } .steps li.gate::before { color: #ffd9a8; }
.note { color: #6b6257; font-size: 30px; margin-top: 30px; }
pre { background: #1f2a2b; color: #f4eee2; font: 32px/1.7 "IBM Plex Mono", "IBM Plex Sans Thai"; padding: 44px 52px; border-radius: 20px; white-space: pre-wrap; }
code { font-family: "IBM Plex Mono"; background: #e3d8c4; padding: 0 10px; border-radius: 8px; font-size: .9em; }
.muted { color: #6b6257; font-size: 40px; font-family: "IBM Plex Sans Thai"; }
.gridslide::after { display: none; }
.gridslide { padding-top: 50px; } .gridslide h2 { font-size: 50px; margin-bottom: 20px; padding-bottom: 12px; }
.grid { display: grid; grid-template-columns: repeat(6, 225px); gap: 18px 50px; justify-content: center; }
.grid figure { margin: 0; } .grid img { width: 225px; height: 400px; object-fit: cover; border-radius: 12px; display: block; box-shadow: 0 6px 18px rgba(0,0,0,.18); }
.grid figcaption { font-size: 20px; line-height: 1.3; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .grid figcaption b { color: #b3323b; font-size: 22px; margin-right: 8px; }
.grid figcaption .t { margin: 0 0 0 6px; vertical-align: 2px; }
.t { display: inline-block; font: 700 16px "IBM Plex Sans Thai"; color: #fff; padding: 2px 10px; border-radius: 20px; margin-top: 6px; }
h2 .t { font-size: 26px; padding: 6px 18px; }
.t.basic { background: #1f5b5c; } .t.pro { background: #b3323b; } .t.premium { background: #c9a44a; color: #1d1a16; }
.tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
.tiers > div { background: #fff; border-radius: 28px; padding: 44px; } .tiers .hot { background: #1f5b5c; color: #fff; } .tiers .hot h3 { color: #ffd9a8; }
.price { font: 800 110px "Noto Serif Thai"; color: #b3323b; line-height: 1; margin-bottom: 20px; } .price::after { content: " บาท"; font-size: 34px; } .hot .price { color: #fff; }
.tiers li { font-size: 32px; margin: 8px 0; }
</style></head><body>${S.map((s) => `<section class="s ${s.cls}">${s.body}</section>`).join("\n")}</body></html>`;
const htmlFile = path.join(out, "story-studio-slides.html");
writeFileSync(htmlFile, html);
const chromeArgs = ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", "--virtual-time-budget=20000"];
execFileSync(CHROME, [...chromeArgs, "--no-pdf-header-footer", `--print-to-pdf=${path.join(out, "story-studio-slides.pdf")}`, pathToFileURL(htmlFile).href], { stdio: "ignore" });
console.log(`${S.length} slides → course/ebook/out/story-studio-slides.pdf`);

// PPTX: screenshot each slide (one HTML per slide), then one full-bleed image per PowerPoint slide.
const shots = path.join(out, "slides");
rmSync(shots, { recursive: true, force: true });
mkdirSync(shots, { recursive: true });
S.forEach((s, i) => {
  const one = html.replace(/<body>[\s\S]*<\/body>/, `<body><section class="s ${s.cls}">${s.body}</section></body>`);
  const f = path.join(shots, `${String(i + 1).padStart(2, "0")}.html`);
  writeFileSync(f, one);
  execFileSync(CHROME, [...chromeArgs, "--window-size=1920,1080", `--screenshot=${f.replace(/\.html$/, ".png")}`, pathToFileURL(f).href], { stdio: "ignore" });
});
// The CommonJS build is the Node one (the ES build expects a browser); images go in as data URIs.
const PptxGenJS = createRequire(import.meta.url)(path.join(here, "node_modules/pptxgenjs/dist/pptxgen.cjs.js"));
const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
S.forEach((_, i) => {
  const png = readFileSync(path.join(shots, `${String(i + 1).padStart(2, "0")}.png`)).toString("base64");
  pptx.addSlide().addImage({ data: `image/png;base64,${png}`, x: 0, y: 0, w: 13.333, h: 7.5 });
});
await pptx.writeFile({ fileName: path.join(out, "story-studio-slides.pptx") });
console.log(`PPTX → course/ebook/out/story-studio-slides.pptx`);
