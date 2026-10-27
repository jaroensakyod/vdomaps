# ดาวเทียมนักวิเคราะห์ (Satellite briefing) — คลิปทดสอบลุค

ลุคใหม่ที่ได้แรงบันดาลใจจากสไตล์ "Satellite Briefing" ของ Lemo-Opuscar (เอาแค่หลักการ ไม่ได้ลอกโค้ด) แต่ทำใน Remotion
และใช้วิธีเล่าเรื่องแบบเดิมของบ้าน: hook 3 วิ, ภาพเปลี่ยนตามคำพากย์, ซับตรงคำ, clear layout

- ภาพดาวเทียมจริงปรับเป็นโทนเทาของนักวิเคราะห์ (`GRADE` + `Tone`) **สีจริงกลับมาเฉพาะตรงที่เรื่องหักมุม**
- เส้นวัดสีขาวบางบนพิกัดจริง เส้นประ = อดีต · ตัวเลขสีอำพันแค่ 1 ค่าต่อหน้าจอ (`Reading`)
- เปลี่ยนปีด้วยแถบสแกน ไม่ใช้ภาพจาง: ย้อนเวลาสแกนใต้→เหนือ เดินหน้าสแกนเหนือ→ใต้ (`SCANS`)
- เครื่องวัดในจอ: ปี พ.ศ./ค.ศ. + ชื่อภาพ, ความสูงกล้อง, แถบมาตราส่วน · ซับเป็นแถบ transcript มุมล่างซ้าย
- เสียง: ทะเล + ลม (คลังเสียงจริง), เสียง UI สังเคราะห์สำหรับเครื่องวัด, สกอร์แต่งจากไทม์ไลน์เดียวกัน (`score.mjs`)
  มีช่วงเงียบ 0.6 วิ ก่อนจุดหักมุม แล้วตีหนักที่ตัวเลข "5 ไร่"

ทดสอบ: **วัดขุนสมุทราวาส** สมุทรปราการ "วัดนี้ เคยอยู่บนบก" (16.9 วิ, `SatBriefTest`, ไฟล์ `out/satbrief/satbrief-test.mp4`)

## ข้อมูลภาพ (ไม่เก็บใน repo) — Microsoft Planetary Computer data API, ไม่ต้องมีบัญชี

```bash
# Landsat C2 L2 (USGS, สาธารณสมบัติ) กรอบเดียวกันทุกปี: 100.47 13.45 100.59 13.57
B=100.47,13.45,100.59,13.57
for it in LT05_L2SP_129051_19881227_02_T1:y1988 LT05_L2SP_129051_20000228_02_T1:y2000 LT05_L2SP_129051_20100223_02_T1:y2010 LC08_L2SP_129051_20250115_02_T1:y2025; do
  curl -o public/raster/kscn-${it##*:}.png "https://planetarycomputer.microsoft.com/api/data/v1/item/bbox/$B/1600x1600.png?collection=landsat-c2-l2&item=${it%%:*}&assets=red&assets=green&assets=blue&nodata=0&color_formula=gamma+RGB+2.4,+saturation+1.3,+sigmoidal+RGB+12+0.5&rescale=7300,16000&resampling=bilinear"
done
# Sentinel-2 L2A 10 ม. (Copernicus) สำหรับช็อตใกล้ · ภาพกว้าง kscn-region = Landsat 8 วันเดียวกัน 100.15 13.2 100.95 13.8
```

แปลงเป็น `.jpg` + `.json` (`{bbox, credit}`) ตาม `<Raster>` แล้วยืดค่าแสง 2–98 % ให้ทุกปีเทาเท่ากัน

เส้นชายฝั่ง (`public/data/satbrief-shores.json`) วัดจากแบนด์ NIR ของแต่ละปี: ไล่น้ำจากขอบล่างของภาพ (flood fill)
ให้ได้ทะเลที่ต่อกัน (บ่อกุ้งข้างในไม่นับ) แล้วเอาขอบบนสุดทุกคอลัมน์ กรองค่ากลาง 15 px — ดู `test/_shore-measure.mjs`

## เครดิต (ใส่ในคำอธิบายคลิป)

ภาพ: USGS Landsat 5/8 · Contains modified Copernicus Sentinel data 2025 · ผ่าน Microsoft Planetary Computer
