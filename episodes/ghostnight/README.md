# ออเดอร์ตีสาม (ซีรีส์ผีไทย 9:16)

- `reference.md` — คลิปต้นแบบเพจ "ถ้าวันหนึ่ง": บทถอด สูตร สถิติ
- `series.md` — คอนเซปต์ ตัวละคร รายชื่อตอน · `ep01-script.md` / `ep01-caption.txt` — บทและแคปชันตอน 1
- `kit.tsx` — ตัวละครชิบิ (เก่ง ลุงเชิด เชิดตอนหนุ่ม นางตานี) ฉากซอย ร้านสะดวกซื้อ กอกล้วย มือถือ/การ์ดออเดอร์ การ์ดกฎ
- `ep01/` — `beats.json` (บท + ผู้พูด + ฉาก), `timing.json` (จาก TTS), `Ep01.tsx` (ฉาก ซับ เสียง)

ติดตั้ง: คัดลอกโฟลเดอร์นี้ (ยกเว้นไฟล์ .md) ไปที่ `src/episodes/ordertisam/` ของโปรเจกต์ แล้วใส่ `<OrderCompositions />` ใน `src/Root.tsx`
เสียง: `npm run tts -- ordertisam/ep01` (voices.json: เก่ง Puck · ลุงเชิด Algenib · นางตานี Achernar) แล้วทำเสียงก้องนางตานี
`ffmpeg -i tN.wav -af "asetrate=48000*0.97,aresample=48000,atempo=1.03,aecho=0.8:0.6:70|140:0.35|0.2,apad=pad_dur=0.25" tN-fx.wav`
เสียงประกอบ: `npm run sfx` + `npm run sfx-lib` (เพิ่ม crickets_night, moto_*, leaves_rustle, msg_pop, terror_*, deep_impact ในคลังแล้ว)
ตรวจภาพ: `node scripts/stills-at.mjs Order-EP01 out/stills <เฟรม...>` · เรนเดอร์: `node scripts/render-chunks.mjs Order-EP01 out/ordertisam-ep01.mp4 --gl angle --loudness --glitch`
