// Beat timeline + subtitle timing, shared by the Remotion scenes (Caption) and the Node scripts (srt, describe).
// Plain JS so `node scripts/*.mjs` can import it without a TypeScript step. Types live in subs.d.mts.

// Same layout every episode uses: LEAD frames of silence, then each beat's audio, GAP frames between beats.
export const LAYOUT = { fps: 30, lead: 12, gap: 8, tail: 45 };

// timing.json [{id, file, sec, words?}] + beats.json [{id, text, caption?, speaker?}] → beats with frame positions.
// `speaker` (a cast key) marks a character line; without it the narrator speaks. `pause` (seconds) adds silence
// before the beat, for a dramatic beat-drop before a reveal.
export const buildBeats = (timing, beats = [], layout = {}) => {
  const { fps, lead, gap } = { ...LAYOUT, ...layout };
  let f = lead;
  return timing.map((t, i) => {
    const len = Math.ceil(t.sec * fps);
    const b = beats.find((x) => x.id === t.id) ?? beats[i] ?? {};
    f += Math.round((b.pause ?? 0) * fps);
    const out = { ...t, start: f, len, end: f + len, text: b.caption ?? b.text ?? "", spoken: b.text ?? "", speaker: b.speaker };
    f += len + gap;
    return out;
  });
};

export const totalFrames = (beats, layout = {}) => beats[beats.length - 1].end + { ...LAYOUT, ...layout }.tail;

// Space-separated phrases merged up to maxChars (Thai has no word spaces; the script's spaces are the pauses).
export const chunks = (text, maxChars = 26) => {
  const out = [];
  for (const phrase of text.split(/\s+/).filter(Boolean)) {
    const last = out[out.length - 1];
    // a 1–2 letter token ("ปี", "คน") stays with the word before it, so "417 | ปี" never splits
    if (last && ((last + " " + phrase).length <= maxChars || phrase.length <= 2)) out[out.length - 1] = last + " " + phrase;
    else out.push(phrase);
  }
  return out;
};

const bare = (s) => s.replace(/\s+/g, "");

// Time (s, from beat start) at which character `pos` of the spoken text is said.
// words: [{w, s, e}] from scripts/align.mjs; without them, characters are spread evenly over the beat.
const charTime = (words, total, dur) => {
  if (!words?.length) return (pos) => (pos / total) * dur;
  // `pos` is the first character of a phrase: a boundary between two words belongs to the next word, so the
  // phrase starts when that word starts (not when the previous one ended — that showed captions early by the pause).
  return (pos) => {
    let acc = 0;
    for (const { w, s, e } of words) {
      const n = bare(w).length;
      if (pos < acc + n) return s + ((pos - acc) / Math.max(n, 1)) * (e - s);
      acc += n;
    }
    return words[words.length - 1].e;
  };
};

// Subtitle cues for one beat: [{text, start, end}] in seconds from the beat start.
// `text` is what appears on screen (digits allowed); `spoken` is what the VO says (what `words` were timed on).
// When both have the same number of space-separated tokens ("พ.ศ. 2310" ↔ "พอศอ สองพันสามร้อยสิบ"), each display
// token is mapped onto its spoken token — a number on screen is much shorter than its words, so mapping by
// character share drifted by over a second. Otherwise positions are mapped proportionally.
export const cues = ({ text, spoken = text, words, sec, maxChars = 26 }) => {
  const parts = chunks(text, maxChars);
  const dTok = text.split(/\s+/).filter(Boolean);
  const sTok = spoken.split(/\s+/).filter(Boolean);
  const dispTotal = parts.reduce((a, p) => a + bare(p).length, 0) || 1;
  const spokenTotal = bare(spoken).length || dispTotal;
  const at = charTime(words, spokenTotal, sec);
  // spoken character offset where display token k starts
  const tokenStart = (k) => sTok.slice(0, k).reduce((a, t) => a + t.length, 0);
  const sameTokens = dTok.length === sTok.length;
  let acc = 0;
  let tok = 0;
  return parts.map((p, i) => {
    const a = acc;
    const t0 = tok;
    acc += bare(p).length;
    tok += p.split(/\s+/).filter(Boolean).length;
    const from = sameTokens ? tokenStart(t0) : (a / dispTotal) * spokenTotal;
    const to = sameTokens ? tokenStart(tok) : (acc / dispTotal) * spokenTotal;
    const start = i === 0 ? 0 : at(from);
    const end = i === parts.length - 1 ? sec : at(to);
    return { text: p, start, end };
  });
};
