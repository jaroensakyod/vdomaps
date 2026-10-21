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
| `news/` | **สไตล์ที่อนุมัติแล้ว** ได้แก่ `Period.tsx` (ทหารพม่า กำแพงใบเสมา ปรางค์ เจดีย์ ค่าย ซาก) และ `Open10.tsx` (ช่วงเปิด 17 วินาที 6 ฉาก) |
| `kit/`, `StyleFrames.tsx`, `ep01/Ep.tsx` | เวอร์ชันแรกที่เป็นแผนที่กระดาษการ์ตูน **ผู้ใช้ไม่ผ่าน** เก็บไว้ดูเป็นตัวอย่างเท่านั้น |
| `th-rivers.mjs` | สร้างไฟล์แม่น้ำภาคกลางและคลองรอบเกาะจากข้อมูล OSM |

## ข้อมูลที่ต้องดึงก่อน (ไม่ได้เก็บใน repo)

```bash
node scripts/fetch-osm.mjs th-central 99.4 13.4 101.6 15.6 bigrivers
node scripts/fetch-osm.mjs th-ayut-island 100.50 14.30 100.64 14.42 rivers
node th-rivers.mjs
node scripts/fetch-imagery.mjs bluemarble sea 88 2 112 28 7500
TIME=2025-01-05 node scripts/fetch-imagery.mjs hls plainhls 100.0 13.6 101.4 15.3 4096
TIME=2025-01-20 node scripts/fetch-imagery.mjs hls isle 100.46 14.24 100.68 14.48 2400
```

## เรนเดอร์

```bash
npx remotion render THNews10 out/th/news10.mp4 --gl=angle
node scripts/check-glitch.mjs out/th/news10.mp4
node scripts/loudness.mjs out/th/news10.mp4
```

ขั้นต่อไปคือทำทั้งคลิปในสไตล์ `news/` โดยเปลี่ยนภาพทุก 3–4 วินาทีตามคำพากย์ เริ่มจากช่วง "อาวุธลับของอยุธยา"
