import { useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { camAt, camForFeature, globeCam } from "../../../components/camera";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { Willowed } from "../ep02/Insets";
import { EmptyThrone, Reading } from "../ep03/Insets";
import { Riverbank, Storm } from "../ep04/Insets";
import { Court, Trick } from "../ep05/Insets";
import { Chamber, Inn } from "../ep06/Insets";
import { Banquet, Warm } from "../ep07/Insets";
import { Blaze, March } from "../ep08/Insets";
import { Ambush, Sons } from "../ep09/Insets";
import { Gate, Triangle } from "../ep10/Insets";
import { PalaceVsFields, RebelsBurn } from "../ep01/Ep";
import { CharacterCard, PortraitCard, TitleCard } from "../kit/Cards";
import { ERAS, YELLOW_TURBAN_RISINGS } from "../kit/eras";
import { EpisodeFrame, timeline, type EpisodeMeta, type Variant } from "../kit/Frame";
import { SankokMap } from "../kit/Layout";
import { Flags, Flames, Tint } from "../kit/Marks";
import { at as place } from "../kit/places";
import { EraMap, YearBadge } from "../kit/Scoreboard";
import { Shots } from "../kit/Shots";
import { tab } from "../kit/Tableau";
import { Badge, C, fade, InkLabel, PaperMap } from "../kit/theme";
import beatsText from "./beats.json";
import timing from "./timing.json";

// ฉบับยาว 1 · แปดปีที่ฮั่นพัง (ค.ศ. 184–192): eps 1–10 retold as one 5-minute timeline for YouTube (16:9).
// Not a join of the shorts: its own script, VO and shot list, a picture every 3–4 s, map on the left, panels right.
export const EP: EpisodeMeta = { n: 0, title: "แปดปีที่ฮั่นพัง" };
export const BEATS = buildBeats(timing, beatsText);
const TL = timeline(BEATS);
const { B, at, word } = TL;
export const THUMB = at("burn", 0.4);

const P = {
  ly: place("luoyang"),
  ca: place("changan"),
  zhuo: place("zhuo"),
  julu: place("julu"),
  gz: place("guangzong"),
  cg: place("chenggao"),
  cl: place("chenliu"),
  sz: place("suanzao"),
  hn: place("henei"),
  ny: place("nanyang"),
  xy: place("xiangyang"),
  xs: place("xianshan"),
  river: [112.6, 34.95] as [number, number],
  anxi: [115.0, 38.52] as [number, number],
};
const HAN = ERAS[184].sides[0].area;
const NORTH = bbox([[111.5, 34.2], [119.5, 41]]);
const ZHUO = bbox([[114.4, 38.2], [117.4, 40.3]]);
const CITY = bbox([[111.9, 34.3], [113.0, 35.0]]);
const AREA = bbox([[111.6, 34.0], [115.3, 35.5]]);
const ROUTE = bbox([[108.3, 33.6], [113.2, 35.4]]);
const FRONT = bbox([[111.2, 32.6], [115.4, 35.8]]);
const JING = bbox([[110.6, 31.2], [113.8, 33.6]]);
const WEST = bbox([[107.5, 33.6], [110.5, 35.0]]);
const NOVEL = "ภาพประกอบ · ในนิยาย";

const brothers = (pose?: "bow" | "sit" | "walk", walk?: number) => [
  { who: "liubei", x: 0.3, pose, walk },
  { who: "guanyu", x: 0.48, pose, walk },
  { who: "zhangfei", x: 0.66, pose, walk },
];

const ShotList = () => (
  <Shots
    items={[
      // เปิด
      { id: "l-burn-open", at: -8, anchor: P.ly, sky: ["#2a1408", "#c0602e"], draw: (g) => <Blaze g={g} /> },
      { id: "l-rebels-open", at: word("hookq", "ชาวนา"), anchor: P.julu, sky: ["#3a2416", "#c0602e"], draw: (g, a) => <RebelsBurn g={g} start={a} fire={a} flee={1e9} /> },
      { id: "l-eunuchs-open", at: word("hookq", "ขันที"), anchor: P.ly, ...tab("palace", [{ who: "zhangrang", x: 0.3 }, { who: "zhangrang", x: 0.5, robe: "#3d4f6b" }, { who: "zhangrang", x: 0.7, flip: true }], "ขันทีสิบคน") },
      { id: "l-dong-open", at: word("hookq", "ขุนศึก"), anchor: P.ly, ...tab("road", [{ who: "dongzhuo", x: 0.5, ride: true, walk: 1.2, size: 1.1 }], "ขุนศึกอ้วนจากชายแดน") },
      // 184
      { id: "l-palace", at: word("y184", "ใน"), anchor: P.ly, sky: ["#f0dfb2", "#d6bf8f"], draw: (g) => <PalaceVsFields g={g} outside={word("y184", "นอก")} /> },
      { id: "l-healer", at: B.zhangjiao.start, anchor: P.julu, until: B.slogan.start + 4, ...tab("field", [{ who: "zhangjiao", x: 0.36, hold: "bowl", size: 1.1 }, { who: "rebel", x: 0.6, pose: "bow", flip: true }, { who: "rebel", x: 0.76, pose: "bow", flip: true }], "หมอยาเตียวก๊ก ลูกศิษย์หลายแสน") },
      // slogan: Zhang Jiao's portrait is the picture
      { id: "l-rise", at: B.rise.start, anchor: P.julu, sky: ["#3a2416", "#c0602e"], draw: (g, a) => <RebelsBurn g={g} start={a} fire={word("rise", "เผา")} flee={1e9} /> },
      { id: "l-meet", at: B.brothers.start, anchor: P.zhuo, ...tab("field", [{ who: "liubei", x: 0.3, hold: "bundle" }, { who: "zhangfei", x: 0.55, flip: true, from: word("brothers", "เนื้อ") }, { who: "guanyu", x: 0.75, flip: true, from: word("brothers", "หน้า") }], "สามคนพบกันที่โต๊ะกุ๋น") },
      { id: "l-ears", at: B.ears.start, anchor: P.zhuo, ...tab("field", [{ who: "liubei", x: 0.45, size: 1.25 }], "แขนยาวเลยเข่า เห็นใบหูตัวเอง") },
      { id: "l-peach", at: B.peach.start, anchor: P.zhuo, label: NOVEL, ...tab("field", brothers("bow"), "สาบานในสวนท้อ") },
      { id: "l-bed", at: word("peach", "นอน"), anchor: P.zhuo, ...tab("study", brothers("sit"), "บันทึกจริง: นอนเตียงเดียวกัน") },
      { id: "l-post", at: B.whip.start, anchor: P.anxi, ...tab("gate", [{ who: "liubei", x: 0.3, head: "official", robe: "#3d4f6b" }, { who: "official", x: 0.7, hold: "point", flip: true, robe: "#7a2a24", from: word("whip", "ขุนนาง") }], "งานแรก แล้วถูกไล่") },
      { id: "l-willow", at: word("whip", "มัด"), anchor: P.anxi, until: B.ill.start + 8, sky: ["#e9d7a6", "#cdb27a"], draw: (g) => <Willowed g={g} twist={-1e6} hang={1e9} flee={1e9} /> },
      { id: "l-ill", at: word("ill", "ป่วย"), anchor: P.gz, ...tab("night", [{ who: "zhangjiao", x: 0.4, pose: "sit" }, { who: "rebel", x: 0.66, hold: "bowl", flip: true }], "เตียวก๊กป่วยตาย") },
      { id: "l-rout", at: word("ill", "กบฏ"), anchor: P.gz, ...tab("field", [{ who: "rebel", x: 0.3, pose: "flee", walk: 2.4 }, { who: "rebel", x: 0.46, pose: "flee", walk: 2.4 }, { who: "huangfusong", x: 0.12, walk: 2, hold: "spear" }], "กบฏแตกพ่ายในปีเดียว") },
      { id: "l-lords", at: B.warlords.start, anchor: P.ly, ...tab("camp", [{ who: "yuanshao", x: 0.3 }, { who: "soldier", x: 0.5, flag: { text: "袁", color: "#7a5230" } }, { who: "official", x: 0.72, robe: "#5a6b4a", flip: true }], "เจ้าเมืองตั้งทัพเอง") },
      { id: "l-small", at: word("cao", "ร่าง"), anchor: P.ly, ...tab("camp", [{ who: "soldier", x: 0.3, size: 1.15, hold: "spear" }, { who: "caocao", x: 0.5, size: 0.85 }, { who: "soldier", x: 0.7, size: 1.15, hold: "spear", flip: true }], "ชายร่างเล็ก ชื่อโจโฉ") },
      { id: "l-reading", at: word("cao", "ทำนาย"), anchor: P.ly, sky: ["#d9c39a", "#d9c39a"], until: B.prophecy.start + 4, draw: (g) => <Reading g={g} laugh={1e9} /> },
      // prophecy: the seer's portrait is the picture
      { id: "l-laugh", at: B.laugh.start, anchor: P.ly, sky: ["#d9c39a", "#d9c39a"], draw: (g) => <Reading g={g} laugh={word("laugh", "หัวเราะ")} /> },
      // 189
      { id: "l-throne", at: word("y189", "ฮ่องเต้"), anchor: P.ly, sky: ["#6e2a1f", "#6e2a1f"], draw: (g) => <EmptyThrone g={g} ask={-1} rivals={word("y189", "แม่ทัพ")} /> },
      { id: "l-summon", at: word("y189", "เรียก"), anchor: P.ly, ...tab("road", [{ who: "soldier", x: 0.2, ride: true, walk: 3, robe: "#9a7b2f" }], "เรียกขุนศึกเข้าเมืองหลวง") },
      { id: "l-trap", at: B.trap.start, anchor: P.ly, ...tab("palace", [{ who: "hejin", x: 0.15, walk: 1.2 }, { who: "zhangrang", x: 0.82, flip: true }], "ขันทีลงมือก่อน") },
      { id: "l-storm", at: word("trap", "อ้วน"), anchor: P.ly, sky: ["#e2c79a", "#c9a46a"], draw: (g, a) => <Storm g={g} start={a} /> },
      { id: "l-flee", at: word("trap", "ขันที", 1), anchor: P.ly, ...tab("palace", [{ who: "zhangrang", x: 0.3, pose: "flee", walk: 3 }, { who: "zhangrang", x: 0.45, pose: "flee", walk: 3, robe: "#3d4f6b" }, { who: "soldier", x: 0.1, walk: 2.6, hold: "spear" }], "ขันทีตายกว่าสองพันคน") },
      { id: "l-river", at: B.river.start, anchor: P.river, sky: ["#0e1626", "#24324a"], until: B.test.start + 8, draw: (g, a) => <Riverbank g={g} start={a} army={word("river", "เจอ")} dong={word("river", "ตั๋ง")} /> },
      { id: "l-test", at: B.test.start, anchor: P.river, ...tab("night", [{ who: "dongzhuo", x: 0.72, ride: true, flip: true }, { who: "prince", x: 0.28, pose: "hunch", size: 0.8 }, { who: "emperor", x: 0.42, size: 0.65 }], "องค์น้องตอบได้ฉะฉาน") },
      { id: "l-smile", at: word("test", "ยิ้ม"), anchor: P.ly, ...tab("throne", [{ who: "dongzhuo", x: 0.62, pose: "laugh", flip: true, size: 1.1 }, { who: "emperor", x: 0.36, size: 0.65 }], "ตั๋งโต๊ะยิ้ม") },
      { id: "l-trick", at: B.trick.start, anchor: P.ly, sky: ["#e6c98e", "#e6c98e"], draw: (g, a) => <Trick g={g} start={a} dawn={word("trick", "เช้า")} /> },
      { id: "l-lvbu", at: word("lvbu", "ลิ"), anchor: P.ly, ...tab("camp", [{ who: "lvbu", x: 0.45, hold: "halberd", size: 1.2 }], "ขุนพลที่เก่งที่สุดในแผ่นดิน") },
      { id: "l-betray", at: word("lvbu", "ตัด"), anchor: P.ly, ...tab("night", [{ who: "lvbu", x: 0.45, pose: "raise", hold: "halberd", size: 1.1 }], "ทรยศผู้มีพระคุณ") },
      { id: "l-redhare", at: B.horse.start, anchor: P.ly, label: NOVEL, ...tab("road", [{ who: "horse", x: 0.5, robe: "#b0302a" }, { who: "lvbu", x: 0.28 }], "ม้าเซ็กเธาว์ วันละพันลี้") },
      { id: "l-puppet", at: B.puppet.start, anchor: P.ly, ...tab("throne", [{ who: "prince", x: 0.22, pose: "hunch", walk: -0.8, flip: true, size: 0.8 }, { who: "emperor", x: 0.5, size: 0.65 }, { who: "dongzhuo", x: 0.76, flip: true }], "ตั้งน้องชายวัยแปดขวบ") },
      { id: "l-court", at: word("puppet", "พก"), anchor: P.ly, sky: ["#6e2a1f", "#6e2a1f"], draw: (g, a) => <Court g={g} dong={a} /> },
      { id: "l-chamber", at: B.sword.start, anchor: P.ly, label: NOVEL, sky: ["#5a2a1f", "#5a2a1f"], draw: (g, a) => <Chamber g={g} from={a} lvbuOut={-1000} glint={word("sword", "เงา")} kneel={word("sword", "เงา") + 30} /> },
      { id: "l-disguise", at: word("sword", "ปฏิเสธ"), anchor: P.ly, ...tab("road", [{ who: "caocao", x: 0.2, walk: 1.6, robe: "#6b5a44", hold: "bundle" }], "บันทึกจริง: ปลอมชื่อหนี") },
      { id: "l-inn", at: B.inn.start, anchor: P.cg, sky: ["#0e1626", "#24324a"], until: B.quote.start + 4, draw: (g) => <Inn g={g} draw={word("inn", "ชัก")} pig={word("inn", "หมู")} /> },
      // quote: Cao Cao's portrait is the picture
      // 190
      { id: "l-allies", at: B.y190.start, anchor: P.sz, ...tab("camp", [{ who: "yuanshao", x: 0.45, size: 1.2, pose: "raise", hold: "sword" }, { who: "soldier", x: 0.2, flag: { text: "袁", color: "#7a5230" } }, { who: "soldier", x: 0.75, flag: { text: "盟", color: "#a8382a" }, flip: true }], "พันธมิตรปราบตั๋งโต๊ะ") },
      { id: "l-banquet", at: word("y190", "เลี้ยง"), anchor: P.sz, sky: ["#e2c79a", "#e2c79a"], draw: (g) => <Banquet g={g} /> },
      { id: "l-cao-go", at: B.cao190.start, anchor: P.sz, ...tab("road", [{ who: "caocao", x: 0.2, ride: true, walk: 2.4 }, { who: "soldier", x: 0.06, walk: 2.4, hold: "spear", robe: "#2f4f86" }], "โจโฉบุกลำพัง") },
      { id: "l-cao-lost", at: word("cao190", "แพ้"), anchor: place("xingyang"), ...tab("field", [{ who: "caocao", x: 0.7, pose: "flee", walk: -2.2, flip: true }, { who: "soldier", x: 0.95, walk: -2.2, hold: "spear", robe: "#3d3f5c", flip: true }], "แพ้ยับ") },
      { id: "l-warm", at: B.warm.start, anchor: place("hulao"), label: NOVEL, sky: ["#d9c39a", "#d9c39a"], draw: (g) => <Warm g={g} back={word("warm", "ตัด")} /> },
      { id: "l-sun-win", at: word("warm", "บันทึก"), anchor: P.ny, ...tab("field", [{ who: "sunjian", x: 0.35, pose: "raise", hold: "sword", size: 1.1 }, { who: "soldier", x: 0.15, robe: "#a8382a", flag: { text: "孫", color: "#a8382a" } }], "บันทึกจริง: ทัพซุนเกี๋ยน") },
      { id: "l-sun-go", at: B.sun.start, anchor: P.ny, ...tab("road", [{ who: "sunjian", x: 0.25, ride: true, walk: 2.4 }, { who: "soldier", x: 0.08, walk: 2.4, robe: "#a8382a", flag: { text: "孫", color: "#a8382a" } }], "บุกใกล้ถึงเมืองหลวง") },
      { id: "l-blaze", at: B.burn.start, anchor: P.ly, sky: ["#2a1408", "#c0602e"], draw: (g) => <Blaze g={g} /> },
      { id: "l-march", at: word("burn", "ต้อน"), anchor: [110.6, 34.55], sky: ["#d6bf8f", "#c9a46a"], until: B.dong.start + 4, draw: (g, a) => <March g={g} start={a} /> },
      // dong: his portrait is the picture
      { id: "l-cavalry", at: B.tombs.start, anchor: [110.6, 34.55], ...tab("road", [{ who: "official", x: 0.2, pose: "hunch", walk: -1.2, flip: true, robe: "#8a7a5c", hold: "bundle" }, { who: "soldier", x: 0.72, ride: true, walk: -1.4, flip: true, robe: "#3d3f5c" }], "คนที่เดินไม่ไหว ถูกเหยียบ") },
      { id: "l-tombs", at: word("tombs", "ลิ"), anchor: P.ly, ...tab("tomb", [{ who: "lvbu", x: 0.25, hold: "halberd" }, { who: "soldier", x: 0.45, pose: "hunch", hold: "hoe" }, { who: "soldier", x: 0.85, pose: "hunch", hold: "hoe", flip: true }], "ขุดสุสานฮ่องเต้") },
      { id: "l-well", at: B.seal.start, anchor: P.ly, ...tab("well", [{ who: "soldier", x: 0.2, hold: "point", robe: "#a8382a" }, { who: "soldier", x: 0.34, robe: "#a8382a" }], "บ่อน้ำร้างในซากเมือง") },
      { id: "l-seal", at: word("seal", "ตรา"), anchor: P.ly, ...tab("seal", [], "ตราหยกประจำแผ่นดิน") },
      { id: "l-doubt", at: B.doubt.start, anchor: P.ly, ...tab("study", [{ who: "seer", x: 0.4, pose: "sit", hold: "scroll" }], "อาจถูกแต่งขึ้น?") },
      // 191
      { id: "l-order", at: B.y191.start, anchor: P.ny, ...tab("camp", [{ who: "yuanshu", x: 0.62, pose: "sit", flip: true }, { who: "sunjian", x: 0.3, pose: "bow" }], "ไปตีเล่าเปียว") },
      { id: "l-siege", at: word("y191", "ล้อม"), anchor: P.xy, ...tab("city", [{ who: "soldier", x: 0.12, robe: "#a8382a", flag: { text: "孫", color: "#a8382a" } }, { who: "soldier", x: 0.26, robe: "#a8382a", hold: "spear" }, { who: "sunjian", x: 0.38 }], "ล้อมเมืองซงหยง") },
      { id: "l-ambush", at: B.arrow.start, anchor: P.xs, sky: ["#0e1626", "#24324a"], draw: (g, a) => <Ambush g={g} start={a} shoot={word("arrow", "ยิง")} /> },
      { id: "l-horse", at: word("arrow", "อายุ"), anchor: P.xs, ...tab("night", [{ who: "horse", x: 0.45 }], "อายุเพียง 37 ปี") },
      { id: "l-sons", at: B.sons.start, anchor: P.xy, until: B.vow.start + 4, sky: ["#d9d2bc", "#b9b29a"], draw: (g) => <Sons g={g} /> },
      // vow: Sun Ce's portrait is the picture
      // 192
      { id: "l-plot", at: B.y192.start, anchor: P.ca, ...tab("study", [{ who: "wangyun", x: 0.4, hold: "scroll", size: 1.1 }], "อ้องอุ้นวางแผน") },
      { id: "l-triangle", at: B.beauty.start, anchor: P.ca, label: NOVEL, sky: ["#6e2a1f", "#6e2a1f"], draw: (g) => <Triangle g={g} throwAt={word("beauty", "ขว้าง")} /> },
      { id: "l-maid", at: word("beauty", "สาว"), anchor: P.ca, ...tab("palace", [{ who: "lvbu", x: 0.36 }, { who: "diaochan", x: 0.56, flip: true, robe: "#b9a888" }], "บันทึกจริง: สาวใช้ที่ลิโป้แอบคบ") },
      { id: "l-gate", at: B.kill.start, anchor: P.ca, sky: ["#d6bf8f", "#c9a46a"], draw: (g) => <Gate g={g} strike={word("kill", "แทง")} /> },
      { id: "l-lamp", at: word("kill", "ทหาร"), anchor: P.ca, ...tab("night", [{ who: "soldier", x: 0.3, hold: "torch" }, { who: "soldier", x: 0.72, hold: "spear", flip: true }], "ไฟลุกอยู่หลายวัน") },
      { id: "l-hero", at: B.lvbuflee.start, anchor: P.ca, ...tab("palace", [{ who: "lvbu", x: 0.45, pose: "raise", hold: "halberd", size: 1.15 }], "ลิโป้กลายเป็นวีรบุรุษ") },
      { id: "l-run", at: word("lvbuflee", "หนี"), anchor: P.ca, ...tab("road", [{ who: "lvbu", x: 0.7, ride: true, walk: -2.6, flip: true }], "ลิโป้หนีออกจากเตียงอัน") },
      // ปิด
      { id: "l-puppet2", at: B.recap.start, anchor: P.ca, ...tab("throne", [{ who: "emperor", x: 0.5, size: 0.65 }], "ฮ่องเต้เป็นหุ่นเชิด") },
      { id: "l-three", at: B.cliff.start, anchor: P.ly, ...tab("field", [{ who: "liubei", x: 0.22 }, { who: "caocao", x: 0.5, from: word("cliff", "เพิ่ง") }, { who: "sunquan", x: 0.78, size: 0.7, from: word("cliff", "เด็ก") }], "สามคนที่จะแบ่งแผ่นดิน") },
      { id: "l-who", at: word("cliff", "ใคร"), anchor: P.ly, until: B.cliff.end + 60, ...tab("throne", [], "ใครจะได้รวมแผ่นดิน?") },
    ]}
  />
);

export const Ep = ({ variant }: { variant: Variant }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fit = (f: Parameters<typeof camForFeature>[0], pad = 0.08) => camForFeature(f, width, height, pad);
  const han = fit(HAN);
  const cam = camAt(
    [
      { frame: 0, cam: { ...fit(CITY), scale: fit(CITY).scale * 0.7 } },
      { frame: B.hookq.end, cam: han },
      { frame: B.zhangjiao.start, cam: han },
      { frame: B.zhangjiao.start + 30, cam: fit(NORTH) },
      { frame: B.rise.end, cam: fit(NORTH) },
      { frame: B.brothers.start + 30, cam: fit(ZHUO) },
      { frame: B.whip.end, cam: fit(ZHUO) },
      { frame: B.ill.start + 30, cam: fit(NORTH) },
      { frame: B.warlords.start, cam: fit(NORTH) },
      { frame: B.warlords.start + 30, cam: han },
      { frame: B.y189.start, cam: han },
      { frame: B.y189.start + 30, cam: fit(CITY) },
      { frame: B.sword.start, cam: fit(CITY) },
      { frame: B.inn.start + 20, cam: fit(AREA) },
      { frame: B.y190.start, cam: fit(AREA) },
      { frame: B.y190.start + 30, cam: fit(FRONT) },
      { frame: B.burn.start, cam: fit(FRONT) },
      { frame: B.burn.start + 30, cam: fit(ROUTE) },
      { frame: B.seal.start, cam: fit(ROUTE) },
      { frame: B.seal.start + 25, cam: fit(CITY) },
      { frame: B.y191.start, cam: fit(CITY) },
      { frame: B.y191.start + 30, cam: fit(JING) },
      { frame: B.y192.start, cam: fit(JING) },
      { frame: B.y192.start + 30, cam: fit(WEST) },
      { frame: B.recap.start, cam: fit(WEST) },
      { frame: B.recap.start + 40, cam: han },
      { frame: B.cliff.end + 60, cam: { ...globeCam(110, 32, width, height, 0.42) } },
    ],
    frame,
  );
  const burnTint = (f: number) => 0.3 * fade(f, 0, 6, B.hookq.start, B.hookq.start + 10) + 0.3 * fade(f, B.burn.start, B.burn.start + 10, B.dong.end, B.dong.end + 12);
  const flee = fade(frame, B.sword.start + 20, B.inn.start + 10);

  return (
    <EpisodeFrame
      layout="wide"
      ep={EP}
      beats={BEATS}
      variant={variant}
      sounds={
        <>
          <Sfx src={SFX.hit} at={0} volume={0.5} />
          <Sfx src={SFX.swell} at={0} volume={0.25} />
          {(["y184", "y189", "y190", "y191", "y192"] as const).map((y) => (
            <Sfx key={y} src={SFX.hit} at={B[y].start} volume={0.4} />
          ))}
          <Sfx src={SFX.hit} at={B.slogan.start} volume={0.45} />
          <Sfx src={SFX.hit} at={word("trap", "อ้วน")} volume={0.45} />
          <Sfx src={SFX.hit} at={B.burn.start + 6} volume={0.5} />
          <Sfx src={SFX.whoosh} at={word("arrow", "ยิง")} volume={0.6} />
          <Sfx src={SFX.hit} at={word("kill", "แทง")} volume={0.5} />
          <Sfx src={SFX.riser} at={B.cliff.start} volume={0.25} />
          <Sfx src={SFX.hit} at={word("cliff", "ใคร")} volume={0.45} />
        </>
      }
      map={
        <SankokMap cam={cam}>
          <PaperMap />
          <EraMap from={184} start={B.hookq.start} end={B.ill.end} opacity={0.6} />
          <Flames points={YELLOW_TURBAN_RISINGS.map((r) => r.at)} start={B.rise.start} stagger={4} outAt={B.brothers.start + 10} size={1.1} />
          <InkLabel at={P.zhuo} text="โต๊ะกุ๋น" start={B.brothers.start + 20} end={B.whip.end} dy={48} />
          <Badge at={P.julu} name="เตียวก๊ก" color={C.yellow} start={B.zhangjiao.start + 30} end={B.ill.end} />
          <InkLabel at={P.ly} text="ลกเอี๋ยง" start={B.y189.start + 20} end={B.y190.start + 30} dy={60} size={1.3} />
          <Badge at={[P.ly[0] - 0.22, P.ly[1] + 0.12]} name="ตั๋งโต๊ะ" color={C.dong} start={B.river.start} end={B.y190.start + 30} />
          <Arrow points={[P.ly, [113.0, 34.95], P.cg, P.cl]} start={B.sword.start + 20} end={B.inn.end} color={C.wei} width={14} variant="dashed" opacity={1 - fade(frame, B.y190.start, B.y190.start + 15)} />
          <Badge at={[P.ly[0] + (P.cl[0] - P.ly[0]) * flee, P.ly[1] + (P.cl[1] - P.ly[1]) * flee - 0.1]} name="โจโฉ" color={C.wei} start={B.sword.start} end={B.y190.start + 10} above={false} />
          <EraMap from={190} start={B.y190.start + 20} end={B.burn.start + 20} opacity={0.6} />
          <Flags items={[P.sz, P.hn, P.ny, [114.2, 35.0], [114.7, 35.4], [113.6, 35.3], [112.9, 33.3]].map((p) => ({ at: p as [number, number], color: C.yuan }))} start={B.y190.start + 30} stagger={3} end={B.burn.start} />
          <Flames points={[P.ly, [112.52, 34.68], [112.38, 34.66], [112.5, 34.56]]} start={B.burn.start} stagger={3} outAt={B.seal.start} size={1.2} />
          <Arrow points={[P.ly, [110.8, 34.7], P.ca]} start={word("burn", "ต้อน")} end={B.dong.end} color={C.dong} width={20} opacity={1 - fade(frame, B.seal.start, B.seal.start + 15)} />
          <InkLabel at={P.ca} text="เตียงอัน" start={word("burn", "เตียง")} end={B.seal.start + 20} dy={60} size={1.2} />
          <InkLabel at={P.xy} text="ซงหยง" start={B.y191.start + 20} end={B.y192.start + 20} dy={60} size={1.3} />
          <Badge at={[P.xy[0] + 0.1, P.xy[1] - 0.12]} name="ซุนเกี๋ยน" color={C.wu} start={B.y191.start + 30} end={B.arrow.end} above={false} />
          <InkLabel at={P.ca} text="เตียงอัน" start={B.y192.start + 20} end={B.recap.start + 20} dy={60} size={1.3} />
          <Badge at={[P.ca[0] - 0.2, P.ca[1] + 0.1]} name="ตั๋งโต๊ะ" color={C.dong} start={B.y192.start + 30} end={word("kill", "แทง")} />
          <Badge at={[P.ca[0] + 0.2, P.ca[1] + 0.1]} name="ลิโป้" color={C.lvbu} start={B.y192.start + 40} end={B.recap.start + 10} />
          <EraMap from={190} start={B.recap.start + 30} opacity={0.6} />
          <ShotList />
        </SankokMap>
      }
      overlay={
        <>
          <Tint color="#b0401a" opacity={burnTint} />
          <TitleCard kicker="สามก๊กบนแผนที่ · ฉบับยาว" lines={["8 ปี ราชวงศ์ 400 ปี", "พังลงทั้งราชวงศ์"]} from={0} to={B.hook.end + 4} />
          {(["y184", "y189", "y190", "y191", "y192"] as const).map((y) => (
            <YearBadge key={y} year={Number(y.slice(1))} title={{ y184: "ฟ้าเหลืองจะขึ้นแทน", y189: "วังนองเลือด", y190: "พันธมิตรปราบตั๋งโต๊ะ", y191: "ลูกธนูดอกเดียว", y192: "หญิงงามคนเดียว" }[y]} start={B[y].start} end={B[y].end + 10} />
          ))}
          <CharacterCard who="zhangjiao" from={at("zhangjiao", 0.2)} to={B.slogan.start} />
          <PortraitCard who="zhangjiao" from={B.slogan.start} to={B.slogan.end + 6} />
          <CharacterCard who="liubei" from={at("brothers", 0.3)} to={B.ears.end} />
          <CharacterCard who="caocao" from={at("cao", 0.4)} to={B.prophecy.start} />
          <PortraitCard who="seer" from={B.prophecy.start} to={B.prophecy.end + 6} />
          <CharacterCard who="hejin" from={at("y189", 0.4)} to={B.trap.start + 10} />
          <CharacterCard who="dongzhuo" from={at("river", 0.7)} to={B.test.end} />
          <CharacterCard who="lvbu" from={at("lvbu", 0.2)} to={B.horse.end} />
          <PortraitCard who="caocao" from={B.quote.start} to={B.quote.end + 6} />
          <CharacterCard who="sunjian" from={at("warm", 0.6)} to={B.sun.end} />
          <PortraitCard who="dongzhuo" from={B.dong.start} to={B.dong.end + 6} />
          <PortraitCard who="sunce" from={B.vow.start} to={B.vow.end + 6} />
          <CharacterCard who="wangyun" from={at("y192", 0.3)} to={B.beauty.start + 10} />
          <CharacterCard who="diaochan" from={at("beauty", 0.1)} to={at("beauty", 0.45)} role="หญิงงามในนิยาย" />
        </>
      }
    />
  );
};
