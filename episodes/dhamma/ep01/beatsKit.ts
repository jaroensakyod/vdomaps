import { buildBeats } from "../../../components/subs.mjs";
import { LAYOUT } from "../../thaihistory/news/kit";
import beatsText from "./beats.json";
import timing from "./timing.json";

// Episode 1 timing (Thai history news layout): beats, lookup by id, word cue frames.
export const BEATS = buildBeats(timing, beatsText, LAYOUT);
export const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
// Frame where `word` (n-th occurrence) is spoken; else share k of the beat. Whisper splits Thai names into
// sub-words ("สิทธั|ต|ถะ"), so the word is looked up in the joined tokens and timed by the token it starts in.
export const wf = (id: string, word: string, k = 0.5, n = 0) => {
  const b = B[id];
  if (!b) throw new Error(`no beat ${id}`);
  const words = b.words ?? [];
  const joined = words.map((w) => w.w).join("");
  let pos = -1;
  for (let i = 0; i <= n; i++) {
    pos = joined.indexOf(word, pos + 1);
    if (pos < 0) break;
  }
  if (pos < 0) return Math.round(b.start + b.len * k);
  let c = 0;
  const hit = words.find((w) => (c += w.w.length) > pos)!;
  return Math.round(b.start + hit.s * 30);
};
export const at = (id: string, k = 0) => Math.round(B[id].start + B[id].len * k);

// Story card for a beat from its script row: big line = card[0], small tag = card[1] + where it comes from.
// Portrait on the card (AI art is used only for people). WHO = who each beat is about; HAVE = portraits that exist
// in public/portraits/dhamma (cut from murals or made from ../portraits.json). A missing one is simply left off.
const HAVE = new Set(["siddhattha_prince", "yasodhara", "buddha", "thorani", "suddhodana", "maya", "asita", "kondanna", "channa", "bimbisara", "ascetic", "sujata", "mara"]);
const WHO: Record<string, string> = {
  sakya: "suddhodana", father: "suddhodana", palaces: "suddhodana",
  maya: "maya", garden: "maya", maya7: "maya",
  asita: "asita", laughcry: "asita", kondanna: "kondanna", five: "kondanna",
  marry: "yasodhara", rahula: "yasodhara", look: "yasodhara",
  outside: "siddhattha_prince", old: "siddhattha_prince", monk: "siddhattha_prince", night2: "siddhattha_prince", ride: "siddhattha_prince", cut: "siddhattha_prince", great: "siddhattha_prince", channa: "channa",
  gate: "mara", mara: "mara",
  walk: "ascetic", alms: "ascetic", bimbisara: "bimbisara", promise: "bimbisara", teachers: "ascetic", jhana: "ascetic", notenough: "ascetic", uruvela: "ascetic", austerity: "ascetic", middle: "ascetic", eat: "ascetic",
  sujata: "sujata", tray: "sujata", grass: "ascetic", vow: "ascetic",
  witness: "buddha", thorani: "thorani", dawn: "buddha", bodhgaya: "buddha", answer: "buddha", next: "buddha",
};
type HeadExtra = { f?: number; stat?: string | ((frame: number) => string); label?: string; color?: string; chips?: { text: string; f: number }[] };
export const card = (id: string, color: string, extra: HeadExtra = {}) => {
  const b = beatsText.find((x) => x.id === id) as { card: string[]; src?: string } | undefined;
  if (!b) throw new Error(`no beat ${id}`);
  const [head, sub = ""] = b.card;
  const who = WHO[id];
  const portrait = who && HAVE.has(who) ? `dhamma/${who}` : undefined;
  return { f: B[id].start, tag: [sub, b.src].filter(Boolean).join(" · "), head, color, portrait, ...extra };
};
