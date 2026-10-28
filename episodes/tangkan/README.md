# ต่างกันยังไง (คลิปตลกร้าย 9:16, ~35–40 วิ)

แนวจากคลิปต้นแบบ @ran.domation "ซอยตัน vs ซอยตูด": จับคู่คำที่เสียงคล้ายกัน แล้วเปรียบเทียบหน้าตายเป็นข้อๆ
ส่วนภาพตีความตามตัวอักษร มุกต้องเป็นของเราเอง ไม่ทำซ้ำตอนของเขา

## สูตรทุกตอน
| ช่วง | กติกา |
|---|---|
| Hook (0–5 วิ) | ภาพแรกเห็นทั้งสองคำ (ป้าย) + "หลายคนยังสับสน ระหว่าง A กับ B" + เสียงที่เฟรม 0 |
| ข้อ 1–3 | ป้ายแดงด้านบน "ข้อ N: …" · A ก่อน B หลัง · ภาพไร้สาระขึ้นเรื่อยๆ |
| Punch card | การ์ดแดงขอบฉีก 1 ใบ กลางเรื่องค่อนท้าย |
| ปิด | ตัวละครพูดสรุปที่รวมสองคำเป็นมุกเดียว แล้วค้างภาพ ~2 วิ |

**ทะลึ่งได้ แต่ห้ามโดนแบน:** มุกขี้ ตด ฉี่ ก้น ได้ · ไม่แตะอวัยวะเพศ หน้าอก คำหยาบเพศ · ไม่มีเด็กในมุกสองแง่ ·
ปก แคปชัน และแฮชแท็กสะอาด

## ภาพและเสียง
- ฉาก 3D จริง (`@remotion/three`) + ตัวละคร pixel ที่ดันเป็นลูกบาศก์ voxel: `kit/voxel.tsx` (ตัวละครประกอบจากชิ้น หัว ตัว แขน
  สลับสีด้วย palette เช่น ปากขยับ หน้าแดง หน้าเขียว) · ฉากล็อบบี้โรงแรมกับลิฟต์ `kit/lobby.tsx` · ควัน `Gas`
- ระยะชัดตื้น + แสงฟุ้ง + vignette: `kit/post.tsx` (ห้ามใช้ `<EffectComposer>` ของ @react-three/postprocessing
  เพราะใต้ Remotion จะได้เฟรมดำ)
- ป้าย ซับ การ์ด มิเตอร์เสียง คำเสียง "ปู้ด!": `kit/hud.tsx`
- เสียงพากย์: Gemini TTS ผู้บรรยาย Charon (นิ่งๆ แบบสารคดี) · พนักงานโรงแรม Algenib (`voices.json`)
- เสียงประกอบจากคลัง: fart_small, fart_strong, fart_triple, elevator_ding, door_slide_soft, hotel_lobby,
  gasp_female, gasp_male, cat_meow_angry, trombone_fail, boing_hit

## ติดตั้งและเรนเดอร์ (โปรเจกต์ D:\ordertisam)
คัดลอกโฟลเดอร์นี้ (ยกเว้น .md) ไป `src/episodes/tangkan/` แล้วใส่ `<TangkanCompositions />` ใน `src/Root.tsx`
ต้องมี `three @react-three/fiber @remotion/three postprocessing` ใน package.json

```
BATCH=1 node scripts/tts-gemini.mjs tangkan/ep01
node scripts/stills-at.mjs Tangkan-EP01 out/tangkan/stills 10 230 480 870 1100 --scale=0.4
node scripts/render-chunks.mjs Tangkan-EP01 out/tangkan/tangkan-ep01.mp4 --parts 2 --concurrency 3 --gl angle --loudness --glitch
```

## เพจ
- `page.md` ชื่อเพจ ชื่อผู้ใช้ คำแนะนำตัว About หมวดหมู่ โพสต์แรก · `Branding.tsx` ปก 1640×624 + โปรไฟล์ 1080×1080 (`TangkanPageCover` / `TangkanPageProfile`)

## ตอน
- `ep01/` ผายมือ vs ผายลม: ปิดด้วย "ถ้าเผลอผายลมไปแล้ว ให้รีบผายมือไปทางคนข้างๆ" (ชี้ไปที่แมว)
