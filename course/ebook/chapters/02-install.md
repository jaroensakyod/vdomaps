---
tiers: basic, pro, premium
---
# ติดตั้งในครั้งเดียว

## ต้องมี

- Windows 10/11 หรือ Mac · พื้นที่ว่างราว 10 GB · อินเทอร์เน็ตที่เสถียร
- ผู้ช่วย AI หนึ่งตัว: **Claude Code** (บัญชี Claude Pro หรือ Max) หรือ **Codex** (บัญชี ChatGPT)
- บัญชี Google สำหรับขอ Gemini API key ฟรี ใช้ทำเสียงพากย์ (ขอที่ aistudio.google.com/apikey)

## ขั้นตอน

1. แตกไฟล์ที่ได้รับ ให้ไฟล์ติดตั้งอยู่ข้างโฟลเดอร์ `story-studio`
2. **Windows:** ดับเบิลคลิก `install-windows.bat` ถ้าขึ้น "Windows protected your PC" ให้กด *More info* แล้ว *Run anyway*
   **Mac:** เปิด Terminal พิมพ์ `bash ` (มีเว้นวรรค) ลากไฟล์ `install-mac.sh` มาวาง แล้วกด Enter
3. ตัวติดตั้งถามว่าใช้ผู้ช่วย AI ตัวไหน พิมพ์ 1 (Claude Code), 2 (Codex) หรือ 3 (ทั้งสอง)
4. รอให้ลง git, Node.js, ffmpeg และแพ็กเกจของโปรเจกต์ (ครั้งแรก 5–15 นาที)
5. ตัวติดตั้งเปิดไฟล์ `.env` ขึ้นมา วาง key ต่อจาก `GEMINI_API_KEY=` แล้วกด Save
6. เปิดโฟลเดอร์งาน (Windows `C:\maps\my-channel` · Mac `~/maps/my-channel`) ในผู้ช่วย AI แล้วพิมพ์
   `เช็กว่าเครื่องพร้อมทำคลิปไหม`

## ตัวติดตั้งทำอะไรให้

- เลือกโหมดการ์ดจอที่เร็วที่สุดเอง (Vulkan / ANGLE / CPU)
- วาง skill ไว้ที่ `.claude/skills/story-studio` ในโฟลเดอร์งาน ทั้ง Claude Code และ Codex อ่านได้
- เรนเดอร์ภาพทดสอบ `out/test.png` ถ้าเห็นภาพแผนที่ แปลว่าพร้อมแล้ว

## ถ้าเจอ Smart App Control

Windows 11 บางเครื่องเปิด Smart App Control ไว้ ซึ่งบล็อกตัวเข้ารหัสวิดีโอของ Remotion
อาการคือ **ทำภาพนิ่งได้ แต่เรนเดอร์คลิปไม่ได้** ตัวติดตั้งจะตรวจเจอและบอกเอง

วิธีแก้: Windows Security → App & browser control → Smart App control → Off แล้วรันตัวติดตั้งซ้ำ
(ปิดแล้วเปิดคืนไม่ได้ถ้าไม่ล้างเครื่อง เป็นการตั้งค่าความปลอดภัยของเครื่องคุณ ตัดสินใจเอง)

## ห้ามทำ

- ห้ามวาง API key ลงในแชต ให้วางในไฟล์ `.env` เท่านั้น
- ห้ามส่งไฟล์ `.env` ให้ใคร
