# ออเดอร์ตีสาม (ซีรีส์ผีไทย 9:16)

- `reference.md` — คลิปต้นแบบเพจ "ถ้าวันหนึ่ง": บทถอด สูตร สถิติ
- `reference-sigmalens.md` — คลิปต้นแบบ Sigma Lens "เฝ้าศพ 7 คืน": สูตรงานแลกเงิน+กฎ การ์ด HUD ทุกช็อต
- `series.md` — คอนเซปต์ ตัวละคร รายชื่อตอน · `ep01-script.md` / `ep01-caption.txt` — บทและแคปชันตอน 1
- `kit.tsx` — ตัวละครชิบิ (เก่ง ลุงเชิด เชิดตอนหนุ่ม นางตานี) ฉากซอย ร้านสะดวกซื้อ กอกล้วย มือถือ/การ์ดออเดอร์ การ์ดกฎ · การ์ด HUD: `PayCard` `NightTrack` `ClockCard` `Stamp` `ClueRing` (SVG) `Onomato` `EndCard`
- `slim.tsx` — ตัวละครเพรียวไม่มีเส้นขอบ (ชาย/หญิง ผม 5 ทรง ผ้าถุง จีวร รองเท้าคู่โต ของถือ มีด แก้ว) · ชุดตัวละคร "เพื่อนรัก": `SLIM_PRAE` `SLIM_FON*` `SLIM_MOM` `SLIM_DAD` `SLIM_TOM` `SLIM_MONK` `SLIM_KID`
- `plan-friend.md` — แผนซีรีส์ "เพื่อนรัก" 3 ตอน (ดัดแปลงจากเรื่องเล่าทางบ้าน)
- `friend01/` — "เพื่อนรัก" EP.1: `beats.json` `voices.json` (แพร Kore · ฝน Despina · แม่ฝน Gacrux · แม่แพร Sulafat) `FriendEp01.tsx` (ฉาก Flow เบลอ 2.5D + Slim) `script.md` `caption.txt` · ฉาก Flow: `ep-friend01-sets.md`
- `yod/` — "เรื่องผีในวัด" (ดัดแปลงจากคลิปอาจารย์ยอด): `plan.md` (3 เรื่อง เรื่องย่อ ตัวละคร ฉาก Flow ช็อตลิสต์ C-1) · `transcript-asr.txt` (บทถอดเสียงจาก ASR ใช้อ่านอย่างเดียว)
- `ep01/` — `beats.json` (บท + ผู้พูด + ฉาก), `timing.json` (จาก TTS), `Ep01.tsx` (ฉาก ซับ เสียง)

ติดตั้ง: คัดลอกโฟลเดอร์นี้ (ยกเว้นไฟล์ .md) ไปที่ `src/episodes/ordertisam/` ของโปรเจกต์ แล้วใส่ `<OrderCompositions />` ใน `src/Root.tsx`
เสียง: `npm run tts -- ordertisam/ep01` (voices.json: เก่ง Puck · ลุงเชิด Algenib · นางตานี Achernar) แล้วทำเสียงก้องนางตานี
`ffmpeg -i tN.wav -af "asetrate=48000*0.97,aresample=48000,atempo=1.03,aecho=0.8:0.6:70|140:0.35|0.2,apad=pad_dur=0.25" tN-fx.wav`
เสียงประกอบ: `npm run sfx` + `npm run sfx-lib` (เพิ่ม crickets_night, moto_*, leaves_rustle, msg_pop, terror_*, deep_impact ในคลังแล้ว)
ตรวจภาพ: `node scripts/stills-at.mjs Order-EP01 out/stills <เฟรม...>` · เรนเดอร์: `node scripts/render-chunks.mjs Order-EP01 out/ordertisam-ep01.mp4 --gl angle --loudness --glitch`
