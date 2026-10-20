# สามก๊ก: ขงเบ้งยืมธนูแสนดอก (1 นาที)

ตอนก่อนศึกผาแดง สไตล์ S13 แผนที่กระดาษ ใช้ธีม แผนที่ และพิกัดร่วมกับ `../redcliffs`
ปม: สัญญาสามวัน → คลายปม: ให้ศัตรูยิงธนูมาให้ → พลิก: ในประวัติศาสตร์จริงคือซุนกวน → ชวนดูตอนศึกผาแดง

| ไฟล์ | เนื้อหา |
|---|---|
| `script.md` | บทพร้อมแผนภาพแต่ละช่วง |
| `beats.json` | บท 9 ช่วง (`text` สำหรับ TTS, `caption` สำหรับขึ้นจอ) |
| `timing.json` | ความยาวเสียง + จังหวะรายคำจาก `npm run align` (Whisper large-v3) |
| `meta.json` | ข้อมูลคำอธิบายคลิป บท แหล่งข้อมูล เครดิต |
| `sources.md` | ข้อเท็จจริงกับแหล่งอ้างอิง |
| `Straw.tsx` | เรือฟาง ค่ายโจโฉ ฝนลูกธนู หมอก เรือซุนกวนที่ยี่สู |
| `Arrows.tsx` | ไทม์ไลน์ กล้อง ตัวนับธนู สัญญา ตราประทับ "ในนิยาย" การ์ดตอนต่อไป |

## เรนเดอร์เอง

ต้องมี `episodes/redcliffs` อยู่ใน `src/episodes/` ด้วย (ใช้ Parchment / geo / china-water.json)

```tsx
import { Thumbnail, type ThumbProps } from "./components/Thumbnail";
import { Arrows, FPS, TOTAL_FRAMES } from "./episodes/arrows/Arrows";

const ArrowsThumb = (p: ThumbProps) => (
  <Thumbnail {...p}>
    <Arrows captions={false} />
  </Thumbnail>
);
const thumb: ThumbProps = { headline: "ธนูแสนดอก\nที่ศัตรูยิงมาให้", accent: "ศัตรูยิงมาให้", frame: 1430 };

<Composition id="Arrows" component={Arrows} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
<Composition id="ArrowsVertical" component={Arrows} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
<Composition id="ArrowsThumb" component={ArrowsThumb} defaultProps={thumb} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1280} height={720} />
<Composition id="ArrowsThumbVertical" component={ArrowsThumb} defaultProps={thumb} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
```

```bash
GEMINI_API_KEY=xxxx npm run tts -- arrows     # เสียงพากย์ (ไฟล์เสียงไม่ได้เก็บใน repo)
npm run align -- arrows                       # จังหวะรายคำ
npm run sfx                                   # เสียงเอฟเฟกต์
npx remotion render Arrows out/arrows.mp4 --crf=18
npx remotion render ArrowsVertical out/arrows-vertical.mp4 --crf=18
npm run loudness -- out/arrows.mp4 && npm run loudness -- out/arrows-vertical.mp4
npm run srt -- arrows && npm run describe -- arrows
npm run thumb -- ArrowsThumb arrows
```
