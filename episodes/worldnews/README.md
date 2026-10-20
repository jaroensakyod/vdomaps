# แผนที่ข่าวโลก (รายวัน)

คลิปสรุปข่าวโลก 8 เรื่องใน 24 ชั่วโมง ยาวประมาณ 90 วินาที ใช้แผนที่ดาวเทียม NASA และเสียง Gemini TTS
ฉบับตัวอย่างคือวันอังคาร 20 ต.ค. 2569 ทำได้ทั้ง 9:16 (Reels / Shorts) และ 16:9

| ไฟล์ | ใช้ทำอะไร |
|---|---|
| `stories.ts` | ข้อมูลข่าวแต่ละเรื่อง: ประเทศ, หมวด, ตัวเลขเด่น, หัวข่าว, ที่มา, จุดศูนย์กลางกล้อง, ระดับซูม, หมุด |
| `beats.json` | บทพากย์ (`text` ให้ TTS อ่าน เขียนตัวเลขเป็นคำ / `caption` ข้อความขึ้นจอ) |
| `timing.json` | ความยาวเสียงและเวลารายคำ (สร้างโดย `tts` และ `align`) |
| `WorldNews.tsx` | ฉากทั้งหมด: ลูกโลกบินไปทีละประเทศ, ไฮไลต์ประเทศ, การ์ดข่าว, แถบความคืบหน้า, คำบรรยาย, เสียงประกอบ |
| `France.tsx`, `Scenes.tsx` | ภาพประกอบแบบละเอียดของแต่ละข่าว (กรอบ "ภาพประกอบ" ต่อเส้นไปยังหมุด) ขึ้นตามคำที่พากย์ผ่าน `wordFrame(beat, "คำ")` |
| `Branding.tsx` | ภาพปกเพจ 1640×624 (`PageCover`) และรูปโปรไฟล์ 1080×1080 (`PageProfile`) |

ชิ้นส่วนที่ใช้ซ้ำได้อยู่ใน `template/src/components/`:
- `Figures.tsx`: คนประท้วง, ตำรวจปราบจลาจล, คนทั่วไปหลายชุด (สูท, เครื่องแบบทหาร, ฮิญาบ, เสื้อโค้ต), ไฟ, ควัน, รถถูกเผา
- `Props.tsx`: โดรน, ขีปนาวุธ, ระบบแพทริออต, เครื่องบิน, รถช่วยเหลือ, แผงตลาด, หีบบัตร, จรวด และเส้นขอบฟ้าเมืองต่าง ๆ
- `Inset.tsx`: กรอบภาพประกอบที่จัดตำแหน่งเองทั้ง 9:16 และ 16:9

ภาพประกอบทุกกรอบต้องติดป้าย "ภาพประกอบ" เสมอ ห้ามใช้คำว่า "สด" และห้ามวาดผู้บาดเจ็บหรือศพ ให้บอกตัวเลขด้วยชิปข้อมูลแทน

## ติดตั้งในโปรเจกต์

คัดลอกโฟลเดอร์นี้ไปไว้ที่ `src/episodes/worldnews/` ของโปรเจกต์ (ที่สร้างจาก `skills/map-studio/template`) แล้วเพิ่มใน `src/Root.tsx`:

```tsx
import { PageCover, PageProfile } from "./episodes/worldnews/Branding";
import { NEWS_FRAMES, WorldNews } from "./episodes/worldnews/WorldNews";
<Composition id="WorldNewsVertical" component={WorldNews} durationInFrames={NEWS_FRAMES} fps={30} width={1080} height={1920} />
<Composition id="WorldNews" component={WorldNews} durationInFrames={NEWS_FRAMES} fps={30} width={1920} height={1080} />
<Composition id="PageCover" component={PageCover} durationInFrames={1} fps={30} width={1640} height={624} />
<Composition id="PageProfile" component={PageProfile} durationInFrames={1} fps={30} width={1080} height={1080} />
```

## ขั้นตอนทำฉบับของวันใหม่

1. **หาข่าว** ใน 24 ชั่วโมง ให้กระจายหลายทวีป เลือก 8 เรื่อง ทุกเรื่องต้องยืนยันได้จาก **อย่างน้อย 2 แหล่ง**
   ใช้ตัวเลขตามแหล่งข่าวเท่านั้น ถ้าเป็นผลเบื้องต้นหรือตำแหน่งโดยประมาณ ต้องบอกบนจอ
2. **แก้ `stories.ts`** (ใส่ id ประเทศแบบ ISO 3166-1 numeric ตาม world-atlas เช่น ฝรั่งเศส `250`, บราซิล `076`)
   และแก้วันที่ใน `EDITION`
3. **แก้ `beats.json`** ให้ id ตรงกับ `stories.ts` เรียงตามลำดับเดียวกัน มี `hook` อยู่หน้าสุด และ `outro` อยู่ท้ายสุด
4. **พากย์:** `GEMINI_API_KEY=... npm run tts -- worldnews` (ใช้ `FORCE=1` เมื่อต้องการสร้างเสียงใหม่ทั้งหมด)
5. **ตรวจเสียง:** `npm run transcribe -- <ไฟล์.wav>` แล้วเทียบกับบท โดยเฉพาะชื่อคนและชื่อสถานที่
6. **จับจังหวะคำ:** `npm run align -- worldnews` (FORCE=1 เมื่อสร้างเสียงใหม่)
7. **ภาพนิ่ง:** `npx remotion still WorldNewsVertical out/x.png --frame=N --scale=0.5` ตรวจทุกเรื่องก่อนเรนเดอร์
8. **เรนเดอร์:** `npx remotion render WorldNewsVertical out/worldnews-YYYY-MM-DD-9x16.mp4` (เพจใช้แค่ 9:16) แล้ว
   `npm run loudness -- out/worldnews-YYYY-MM-DD-9x16.mp4` ปรับเสียงให้ได้ −14 LUFS
9. **ข้อความโพสต์:** สรุป 8 ข้อ + ลิงก์ที่มา + เครดิตแผนที่ + บอกว่าเสียงสร้างด้วย AI (ดูตัวอย่าง `out/worldnews-2026-10-20-post.txt`)

ต้องดึงข้อมูลก่อนครั้งแรก: `npm run imagery -- bluemarble world` และ `npm run sfx`

## ข้อควรระวัง

- ข่าวสงครามและภัยพิบัติ: ใช้ตัวเลขผู้เสียชีวิตตามแหล่งข่าว และใส่คำว่า "อย่างน้อย" หรือ "ราว" ตามที่แหล่งข่าวใช้
- อย่าใส่ความเห็นหรือเดาสาเหตุเอง ถ้าแต่ละฝ่ายกล่าวหากัน ให้บอกว่าใครกล่าวหาใคร
- ผลเลือกตั้งหรือประชามติที่ยังนับไม่จบ ต้องเขียนว่า "ผลเบื้องต้น" เสมอ
