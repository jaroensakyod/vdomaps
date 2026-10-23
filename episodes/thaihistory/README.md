# ประวัติศาสตร์บนแผนที่ (คลิปยาวแนวตั้ง)

คลิปยาวราว 10 นาที แนวตั้ง 1080×1920 ทั้งคลิปเป็นตอนเดียวต่อเนื่อง เปิดด้วยคำถาม และทั้งคลิปเดินไปหาคำตอบข้อเดียว
ใช้กฎ "House standard" ใน `skills/map-studio/SKILL.md` แบบสไตล์ข่าว

ตอนแรก **เสียกรุงศรีอยุธยา** "อยุธยา 417 ปี แตกในคืนเดียวได้ไง?"

| ไฟล์ / โฟลเดอร์ | เนื้อหา |
|---|---|
| `ep01/script.md` | บทที่อนุมัติแล้ว 71 ช่วง พร้อมสิ่งที่ขึ้นจอ |
| `ep01/sources.md` | ข้อเท็จจริงทุกข้อ พร้อมแหล่งอ้างอิงและระดับความแน่นอน (ตรวจแล้ว 21 ต.ค. 2569) |
| `ep01/beats.json` | `text` คือข้อความที่ให้ TTS อ่าน ส่วน `caption` คือข้อความที่ขึ้นจอ ทั้งสองต้องแบ่งช่องว่างเป็นคำจำนวนเท่ากัน และมี `card` สำหรับการ์ด |
| `ep01/timing.json` | เสียงจาก Gemini 3.8 Flash Lite (Charon) ทำให้ช้าลงเหลือ 0.95 เท่า มีเวลารายคำจาก Whisper และปรับด้วย `snap-words` แล้ว |
| `news/` | **ตอนเต็มสไตล์ข่าว (อนุมัติแล้ว)**: `Ep.tsx` = คอมโพสิชัน `THNews` ทั้งคลิป 9:57 · `kit.tsx` = เวลา/หมุด/การ์ด/กรอบภาพประกอบ/ควิซ · `ch0`–`ch8` = 9 ช่วง แต่ละช่วงเปลี่ยนภาพตามคำพากย์ (`wf(beat, "คำ")`) · `Period*.tsx` = ตัวละครและฉากยุคอยุธยา (ทหารไทย/พม่า/จีน ชาวบ้าน พระ ช้าง ม้า กำแพงใบเสมา ปรางค์ วัง ค่าย เรือ ฯลฯ) |
| `kit/`, `StyleFrames.tsx`, `ep01/Ep.tsx` | เวอร์ชันแรกที่เป็นแผนที่กระดาษการ์ตูน **ผู้ใช้ไม่ผ่าน** เก็บไว้ดูเป็นตัวอย่างเท่านั้น |
| `th-rivers.mjs` | สร้างไฟล์แม่น้ำภาคกลางและคลองรอบเกาะจากข้อมูล OSM |
| `ep04/` | **ตอน 4 จุดจบของพระเจ้าตาก** (10:51) ภาพประกอบสไตล์ v2 + เสียงจริงจากคลังเสียง · คอมโพสิชัน `Ep04` · `v2.tsx` = ชุดฉาก (วัง ปรางค์ พระ ขุนนาง เรือ ไฟ สมุดข่อย หนังใหญ่) · `ch0`–`ch8` = 9 ช่วง · `bkk-rivers.mjs` = คลองสมัยธนบุรีจาก OSM (`fetch-osm.mjs th-bkk 100.44 13.68 100.54 13.80 rivers`) · ภาพ HLS `bkkhls` (100.40 13.66 100.58 13.82, 2025-01-20) และ `plainhls` |
| `ep05/` | **ตอน 5 สยามรอดได้อย่างไร (วันปิยมหาราช)** (10:13) ภาพประกอบสไตล์ v2 + เสียงจริงจากคลัง · คอมโพสิชัน `Ep05` และปก `Ep05Cover` · `beatsKit.tsx` = `Empire` ระบายสีอาณานิคม (อังกฤษแดง ฝรั่งเศสน้ำเงิน สยามทอง แนวโดยประมาณ) · `kit5.tsx` = เรือปืน ธง ทะเล อาคารตะวันตก โต๊ะแผนที่ · `ch0`–`ch8` = 9 ช่วง · ภาพบุคคลทั้งหมดเป็นภาพถ่ายสาธารณสมบัติจาก Wikimedia Commons (`portraits/`) ไม่ใช้ AI · ภาพ HLS `mouthhls` (100.44 13.36 100.70 13.80, 2025-01-20) · Blue Marble `sea2` (88 −8 112 28) · แม่น้ำ `searivers` |

## ข้อมูลที่ต้องดึงก่อน (ไม่ได้เก็บใน repo)

```bash
node scripts/fetch-osm.mjs th-central 99.4 13.4 101.6 15.6 bigrivers
node scripts/fetch-osm.mjs th-ayut-island 100.50 14.30 100.64 14.42 rivers
node th-rivers.mjs
node scripts/fetch-imagery.mjs bluemarble sea 88 2 112 28 7500
TIME=2025-01-05 node scripts/fetch-imagery.mjs hls plainhls 100.0 13.6 101.4 15.3 4096
TIME=2025-01-20 node scripts/fetch-imagery.mjs hls isle 100.46 14.24 100.68 14.48 2400
TIME=2025-01-10 node scripts/fetch-imagery.mjs hls banghls 100.1 14.4 101.0 15.6 3000
node scripts/fetch-imagery.mjs bluemarble world
TIME=2025-01-20 node scripts/fetch-imagery.mjs hls mouthhls 100.44 13.36 100.70 13.80 2400
node scripts/fetch-imagery.mjs bluemarble sea2 88 -8 112 28 5400
node scripts/fetch-rivers.mjs searivers 88 -2 112 28
```

## เรนเดอร์

```bash
npx remotion render THNews out/th/full.mp4 --gl=angle
node scripts/check-glitch.mjs out/th/full.mp4
node scripts/loudness.mjs out/th/full.mp4
```

เพิ่มช่วงใหม่: เขียน `chN.tsx` ตามสัญญา `Chapter` ใน `kit.tsx` แล้วใส่ใน `CHAPTERS` ของ `news/Ep.tsx` · ตรวจด้วยภาพนิ่งทุก ~3 วิ ก่อนเรนเดอร์
