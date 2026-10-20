// แผนที่ข่าวโลก — Tuesday 20 Oct 2026. One entry per news beat (same ids as beats.json).
// zoom = globe radius multiple for the camera (bigger = closer). Places are approximate where marked.
export type Story = {
  id: string;
  country: string; // world-atlas id (ISO 3166-1 numeric)
  name: string; // Thai country name on the card
  tag: string; // category chip
  stat: string; // the big number
  statLabel: string;
  headline: string;
  sources: string;
  focus: [number, number]; // camera centre
  zoom: number;
  pins: { at: [number, number]; label: string; approx?: boolean }[];
  route?: { from: [number, number]; to: [number, number] };
};

export const EDITION = { title: "แผนที่ข่าวโลก", date: "อังคาร 20 ต.ค. 2569" };

export const STORIES: Story[] = [
  {
    id: "france",
    country: "250",
    name: "ฝรั่งเศส",
    tag: "ประท้วง",
    stat: "2,513",
    statLabel: "คนถูกควบคุมตัว",
    headline: "ประท้วงค่าครองชีพลามเป็นจลาจล สั่งเคอร์ฟิวหลายเมือง",
    sources: "ที่มา: Euronews, ABC News",
    focus: [2.6, 47.6],
    zoom: 6.2,
    pins: [{ at: [2.3522, 48.8566], label: "ปารีส" }],
  },
  {
    id: "ukraine",
    country: "804",
    name: "ยูเครน · รัสเซีย",
    tag: "สงคราม",
    stat: "4+",
    statLabel: "พลเรือนเสียชีวิต",
    headline: "ยูเครนส่งโดรนถล่มเซนต์ปีเตอร์สเบิร์ก แพทริออตใกล้หมด",
    sources: "ที่มา: Democracy Now!, Euronews",
    focus: [31.5, 55],
    zoom: 2.2,
    pins: [
      { at: [30.5234, 50.4501], label: "เคียฟ" },
      { at: [30.3351, 59.9343], label: "เซนต์ปีเตอร์สเบิร์ก" },
    ],
  },
  {
    id: "iran",
    country: "364",
    name: "อิหร่าน",
    tag: "การทูต",
    stat: "~$110",
    statLabel: "น้ำมันดิบต่อบาร์เรล",
    headline: "ผบ.ทบ.ปากีสถานบินถึงเตหะราน ไกล่เกลี่ยสงครามสหรัฐฯ–อิหร่าน",
    sources: "ที่มา: The National, Reuters",
    focus: [61.5, 32.5],
    zoom: 3.0,
    pins: [{ at: [51.389, 35.6892], label: "เตหะราน" }],
    route: { from: [73.0479, 33.6844], to: [51.389, 35.6892] },
  },
  {
    id: "gaza",
    country: "275",
    name: "กาซา",
    tag: "มนุษยธรรม",
    stat: "500,000",
    statLabel: "คนถูกตัดความช่วยเหลือ",
    headline: "WFP ตัดอาหารช่วยเหลือ เพราะเงินทุนไม่พอ",
    sources: "ที่มา: Euronews, France 24",
    focus: [34.4, 31.4],
    zoom: 6.5,
    pins: [{ at: [34.4668, 31.5017], label: "กาซา" }],
  },
  {
    id: "sudan",
    country: "729",
    name: "ซูดาน",
    tag: "สงคราม",
    stat: "~80",
    statLabel: "คนเสียชีวิต",
    headline: "โดรนโจมตีจุดขึ้นรถใกล้ตลาด รัฐคอร์โดฟานตะวันตก",
    sources: "ที่มา: France 24 (AFP), Al Jazeera",
    focus: [29.5, 13.5],
    zoom: 3.2,
    pins: [{ at: [29.25, 11.6], label: "อัลดีบับ (โดยประมาณ)", approx: true }],
  },
  {
    id: "brazil",
    country: "076",
    name: "บราซิล",
    tag: "เลือกตั้ง",
    stat: "25 ต.ค.",
    statLabel: "เลือกตั้งรอบชี้ขาด",
    headline: "ประท้วงหน้าเมตา กล่าวหาแทรกแซงการเลือกตั้ง",
    sources: "ที่มา: Democracy Now!, Euronews",
    focus: [-49, -17],
    zoom: 2.3,
    pins: [{ at: [-46.6333, -23.5505], label: "เซาเปาโล" }],
  },
  {
    id: "canada",
    country: "124",
    name: "แคนาดา",
    tag: "ประชามติ",
    stat: "~76%",
    statLabel: "เลือกอยู่กับแคนาดา (ผลเบื้องต้น)",
    headline: "ชาวอัลเบอร์ตาไม่เอาการแยกตัว",
    sources: "ที่มา: Al Jazeera, Poliwave (ไม่เป็นทางการ)",
    focus: [-108, 55],
    zoom: 2.4,
    pins: [{ at: [-113.4938, 53.5461], label: "อัลเบอร์ตา" }],
  },
  {
    id: "japan",
    country: "392",
    name: "ญี่ปุ่น",
    tag: "อวกาศ",
    stat: "2031",
    statLabel: "ปีที่ตัวอย่างกลับถึงโลก",
    headline: "ยาน MMX มุ่งหน้าสู่โฟบอส ดวงจันทร์ดาวอังคาร",
    sources: "ที่มา: Space.com, JAXA",
    focus: [134, 34],
    zoom: 3.4,
    pins: [{ at: [130.9752, 30.4007], label: "ทาเนกาชิมะ" }],
  },
];
