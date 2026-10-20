# สามก๊ก: กวนอูปล่อยโจโฉที่ฮัวหยง (ราว 1 นาที)

ต่อจากศึกผาแดง สไตล์ S13 แผนที่กระดาษ ใช้ธีม แผนที่ และพิกัดร่วมกับ `../redcliffs` (ต้องมีโฟลเดอร์นั้นใน `src/episodes/` ด้วย)
ปม: สัญญาตาย vs บุญคุณ → คลายปม: ปล่อย และขงเบ้งรู้อยู่แล้ว → พลิก: ในบันทึกมีแต่โคลน → ชวนดูต่อ: เกงจิ๋ว

| ไฟล์ | เนื้อหา |
|---|---|
| `script.md` / `sources.md` | บทพร้อมแผนภาพ และแหล่งอ้างอิง |
| `beats.json` / `timing.json` | บท 9 ช่วง + ความยาวเสียงและจังหวะรายคำ (Whisper large-v3) |
| `meta.json` | ข้อมูลคำอธิบายคลิป บท เครดิต |
| `Pass.tsx` | ทางแคบฮัวหยง แถวทหารกวนอู ทหารโจโฉ โคลน หญ้าถมทาง ไฟของเล่าปี่ |
| `Huarong.tsx` | ไทม์ไลน์ กล้อง การ์ดสัญญา / บุญคุณ / ขงเบ้งดูดาว ตรา "ในนิยาย" คำพูดโจโฉ เขตเกงจิ๋ว |

```tsx
import { Huarong, FPS, TOTAL_FRAMES } from "./episodes/huarong/Huarong";
const HuarongThumb = (p: ThumbProps) => (<Thumbnail {...p}><Huarong captions={false} /></Thumbnail>);
const hthumb: ThumbProps = { headline: "กวนอูไม่ได้อยู่ที่นั่น?", accent: "ไม่ได้อยู่", frame: 1560 };
// แนวตั้งใช้ --props '{"headline":"กวนอู\nไม่ได้อยู่ที่นั่น?","accent":"ไม่ได้อยู่","frame":1560}'
```

ขั้นตอนเรนเดอร์เหมือน `../arrows/README.md` (เปลี่ยน slug เป็น `huarong`)
