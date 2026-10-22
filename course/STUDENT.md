# คู่มือนักเรียน — ทำคลิปแผนที่เล่าเรื่องด้วย Claude

ทำ **ก่อนวันเรียน** (ใช้เวลา 20–40 นาที ส่วนใหญ่คือรอโหลด) แล้วในคลาส 1 ชั่วโมงเราจะได้ทำคลิปจริงกันเลย

## ต้องมี

- คอมพิวเตอร์ Windows 10/11 (มีหรือไม่มีการ์ดจอก็ได้) หรือ Mac · พื้นที่ว่าง ~10 GB · เน็ตเสถียร
- บัญชี Claude แบบ **Pro หรือ Max** (Claude Code ใช้กับบัญชีฟรีไม่ได้) — สมัครที่ https://claude.ai
- บัญชี Google (สำหรับขอ Gemini API key ฟรี ใช้ทำเสียงพากย์)

## ขั้นที่ 1 — ลงแอป Claude

โหลดแอป Claude สำหรับคอมพิวเตอร์ที่ https://claude.ai/download แล้วล็อกอิน
(เราจะใช้แท็บ **Code** ในแอปนี้สั่งงาน)

## ขั้นที่ 2 — รันตัวติดตั้ง (ทำครั้งเดียว)

### Windows

กดปุ่ม Start พิมพ์ `PowerShell` เปิดขึ้นมา แล้ววางบรรทัดนี้ กด Enter:

```powershell
irm https://raw.githubusercontent.com/jaroensakyod/vdomaps/main/course/install-windows.ps1 | iex
```

(หรือดับเบิลคลิกไฟล์ `install-windows.bat` ที่ครูส่งให้ ถ้าขึ้น "Windows protected your PC" ให้กด *More info* → *Run anyway*)

### Mac

เปิดแอป **Terminal** (กด Cmd+Space พิมพ์ Terminal) แล้ววางบรรทัดนี้ กด Enter:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/jaroensakyod/vdomaps/main/course/install-mac.sh)"
```

ถ้าถามรหัสผ่าน ให้พิมพ์รหัสเครื่อง Mac (ตัวอักษรจะไม่ขึ้น เป็นเรื่องปกติ) แล้วกด Enter

### ตัวติดตั้งทำอะไรให้บ้าง

1. ลงเครื่องมือ: git, Node.js, ffmpeg และ Claude Code
2. สร้างโฟลเดอร์งาน — Windows: `C:\maps\my-channel` · Mac: `~/maps/my-channel`
3. เช็กการ์ดจอ แล้วเลือกโหมดเรนเดอร์ที่เร็วที่สุดให้เอง (NVIDIA / Intel / AMD / Apple ใช้ได้หมด ไม่มีการ์ดจอก็ใช้ได้)
4. เรนเดอร์ภาพแผนที่ทดสอบ แล้วเปิดให้ดู ← **ถ้าเห็นภาพแผนที่ แปลว่าเครื่องพร้อม**
5. เปิดไฟล์ `.env` ให้ใส่ API key (ขั้นที่ 3)

ถ้าขึ้นตัวหนังสือสีเหลือง `!!` ให้แคปหน้าจอส่งครูในกลุ่ม

## ขั้นที่ 3 — ใส่ Gemini API key

1. เปิด https://aistudio.google.com/apikey → ล็อกอิน Google → **Create API key** → กดคัดลอก
2. ในไฟล์ `.env` ที่ตัวติดตั้งเปิดไว้ (Notepad / TextEdit) วาง key ต่อท้ายบรรทัด `GEMINI_API_KEY=` ให้เป็นแบบนี้

   ```
   GEMINI_API_KEY=AIza...ของคุณ...
   ```

3. กด Save (Ctrl+S / Cmd+S) แล้วปิด

เปิดไฟล์นี้ใหม่ทีหลัง: Windows ดับเบิลคลิก `C:\maps\my-channel\.env` · Mac ใน Terminal พิมพ์ `open -e ~/maps/my-channel/.env`

> **key = รหัสผ่าน** ห้ามแปะในแชตกับ Claude ห้ามแคปลงกลุ่ม ห้ามส่งให้ใคร ถ้าหลุด ให้ลบทิ้งที่หน้า
> aistudio แล้วสร้างใหม่ — ไฟล์ `.env` ไม่ถูกอัปขึ้นที่ไหน Claude อ่านใช้ได้เองโดยไม่ต้องเห็น key

## ขั้นที่ 4 — เปิดงานกับ Claude (เช็กก่อนวันเรียน)

1. เปิดแอป Claude → แท็บ **Code** → เลือกโฟลเดอร์ `my-channel` ข้างบน
2. พิมพ์: **เช็กว่าเครื่องพร้อมทำคลิปแผนที่ไหม**
3. Claude จะเช็กทุกอย่างและบอกผล ถ้าบอกว่าพร้อม — เจอกันในคลาส

## ในคลาส

ใช้คำสั่งจาก [`PROMPTS.md`](PROMPTS.md) ทีละข้อ
