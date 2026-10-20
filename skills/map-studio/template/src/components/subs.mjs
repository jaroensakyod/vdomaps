// Beat timeline + subtitle timing, shared by the Remotion scenes (Caption) and the Node scripts (srt, describe).
// Plain JS so `node scripts/*.mjs` can import it without a TypeScript step. Types live in subs.d.mts.

// Same layout every episode uses: LEAD frames of silence, then each beat's audio, GAP frames between beats.
export const LAYOUT = { fps: 30, lead: 12, gap: 8, tail: 45 };

// timing.json [{id, file, sec, words?}] + beats.json [{id, text, caption?}] → beats with frame positions.
export const buildBeats = (timing, beats = [], layout = {}) => {
  const { fps, lead, gap } = { ...LAYOUT, ...layout };
  let f = lead;
  return timing.map((t, i) => {
    const len = Math.ceil(t.sec * fps);
    const b = beats.find((x) => x.id === t.id) ?? beats[i] ?? {};
    const out = { ...t, start: f, len, end: f + len, text: b.caption ?? b.text ?? "", spoken: b.text ?? "" };
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
    if (last && (last + " " + phrase).length <= maxChars) out[out.length - 1] = last + " " + phrase;
    else out.push(phrase);
  }
  return out;
};

const bare = (s) => s.replace(/\s+/g, "");

// Time (s, from beat start) at which character `pos` of the spoken text is said.
// words: [{w, s, e}] from scripts/align.mjs; without them, characters are spread evenly over the beat.
const charTime = (words, total, dur) => {
  if (!words?.length) return (pos) => (pos / total) * dur;
  return (pos) => {
    let acc = 0;
    for (const { w, s, e } of words) {
      const n = bare(w).length;
      if (pos <= acc + n) return s + ((pos - acc) / Math.max(n, 1)) * (e - s);
      acc += n;
    }
    return words[words.length - 1].e;
  };
};

// Subtitle cues for one beat: [{text, start, end}] in seconds from the beat start.
// `text` is what appears on screen (digits allowed); `spoken` is what the VO says (what `words` were timed on).
// When they differ, display positions are mapped proportionally onto the spoken text.
export const cues = ({ text, spoken = text, words, sec, maxChars = 26 }) => {
  const parts = chunks(text, maxChars);
  const dispTotal = parts.reduce((a, p) => a + bare(p).length, 0) || 1;
  const spokenTotal = bare(spoken).length || dispTotal;
  const at = charTime(words, spokenTotal, sec);
  let acc = 0;
  return parts.map((p, i) => {
    const a = acc;
    acc += bare(p).length;
    const start = i === 0 ? 0 : at((a / dispTotal) * spokenTotal);
    const end = i === parts.length - 1 ? sec : at((acc / dispTotal) * spokenTotal);
    return { text: p, start, end };
  });
};
