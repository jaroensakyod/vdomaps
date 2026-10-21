# World History on the Map · channel plan

A new **English-language** channel for a global audience (planned 21 Oct 2026, switched to English-only the same day).
It tells the wars and journeys that changed the world on news-style satellite maps. No Thai version.
This is the only English channel: the other three (`thaihistory`, `worldnews`, `sankok`) stay Thai and are unchanged.
No code yet; this file is the plan to start from.

## Why this niche
- **Evergreen**: unlike daily news, views keep accumulating for years.
- **English audience**: far larger, and history pays well per view in the US/UK/EU.
- **Tools already exist**: globe, illustration panels, people and weapons from `episodes/worldnews`; the
  chapter-based long-video structure (`Chapter`, `wf`) from `episodes/thaihistory/news/kit.tsx`.
- **Made for maps**: every story is an army on the move or a voyage, so the picture never stops moving.
- Safer than geopolitics (stale fast, politically fragile) and disasters (sensitive, limited ads).

## Competition and our edge
English history YouTube is crowded (Kings and Generals, Epic History, The Armchair Historian, Simple History…),
and stories like Napoleon 1812 or D-Day have been done many times. We win on:
1. **Minard-style army lines** that thin with every casualty (`kit/Army.tsx`): our signature shot in every episode.
2. **News-look pacing**: a new picture every 3–4 s on real satellite imagery, where most channels hold still images much longer.
3. **Asian stories few English channels cover** (see topics 13–16): we have an edge being from the region.

## Format
| Item | Rule |
|---|---|
| Main video | **16:9 (1920×1080) YouTube long-form, ~10 min** (~70 spoken beats, 8–9 chapters) |
| Shorts | 2–3 vertical **9:16** cuts per episode, 30–60 s each (max 3 min), for Shorts / Reels / TikTok, ending with "full story on the channel" |
| Long stories | Split into **2–3 parts** of ~10 min. Each part has its own question and answers it; end on a question that leads into the next part ("So why did the army stop at…?"). Never end mid-event |
| Structure | One question for the whole video → 8–9 chapters walking toward the answer → close with the answer + a comment prompt · a re-hook every ~1 min (sub-question, shocking number, quiz) |
| Hook | Shock line ≤ 8 words + a strong image on frame 0 (no logo, no intro) · later parts open with a fresh hook, not "Last time…" (recap ≤ 20 s, after the hook) |
| Title + thumbnail | Title ≤ 60 chars, curiosity + number ("400,000 Marched In. 10,000 Came Back.") · thumbnail: the map + one huge number or 2–3 words, 1280×720 |
| Look | **News look**, House standard rule 1 in `skills/map-studio/SKILL.md`; illustration label reads **"Illustration"** |
| Cadence | New picture every 3–4 s, cued on the spoken word (`wf(beat, "word")`) · ~180 visual changes per 10 min, 60–70 of them illustrated scenes |
| Code layout | Same as `episodes/thaihistory/news/`: `Ep.tsx` + `ch0`…`ch8.tsx` on the `Chapter` contract in `kit.tsx`, but laid out for landscape (the Thai kit is 9:16: cards, captions and panels need a 16:9 layout) |
| Voice | Gemini TTS, one English narrator, calm documentary tone, fixed for the channel (record the choice in `voices.json`) |
| Names | Standard English spellings (Borodino, Berezina, Genghis Khan, Khwarazm); keep them in `glossary.md` so they stay consistent across episodes |
| Captions | Burned-in word-timed English captions + an uploaded `.srt` |

### Script rules (English)
- Write natively in English for a spoken voice: short sentences, active verbs, no translated phrasing.
- `text` (what TTS reads) and `caption` (on screen) must have the same space-separated tokens: write numbers
  the way they are spoken in both, or keep both as digits if TTS reads them well (test once, then fix the rule here).
- English viewers check facts hard: every number needs a source and a range when historians disagree.

### No-go list (same as world news)
- Every illustration panel carries the "Illustration" label.
- No drawn bodies or wounded; show losses as number chips / counters.
- No Nazi flags or symbols on screen (use army colours), to avoid limited ads.
- Every number has a source in `sources.md` with a confidence level; if historians disagree, say a range ("around 400 to 600 thousand").

### YouTube monetisation (AI narration)
Since mid-2025 YouTube demonetises mass-produced, repetitive content. Each episode must show real original work:
our own research (`sources.md` listed in the description), our own maps and animation, a script written for the
story (not a template with names swapped). Disclose AI voice in the upload settings if YouTube asks for synthetic content.

## Build once, use in every episode
`episodes/worldhistory/kit/`
- `theme.ts` side colours (attacker = red, defender = blue, neutral = gold) + channel colour
- `Layout.tsx` 16:9 news layout: card positions, caption band, panel slots; plus a 9:16 variant for Shorts
- `Army.tsx` **Minard army line**: a band as thick as the troop count, following the route and thinning at each
  data point. The channel's signature; works for any march
- `Counter.tsx` troop counter riding on the army's head, counting down/up
- `Era.tsx` year badge + timeline bar along the top (the year advances with the picture)
- `Borders.tsx` period borders. Suggested source: historical-basemaps (aourednik, GeoJSON per century,
  CC BY 4.0, credit in the description)
- `Period/` characters and props by era: Napoleonic infantry / Cossacks, Mongol rider + horse, WW2 soldiers +
  landing craft, ocean liner, Macedonian phalanx

Draw period characters in the style of `episodes/thaihistory/news/Period*.tsx` (code-drawn, dark news tone).

## First 16 stories (in production order)
Hooks are drafts: **check the numbers before using them** · part counts are rough; decide after `sources.md`
(script runs over ~12 min → split).

| # | Story | Parts | Draft hook | Map / key visual |
|---|---|---|---|---|
| 1 | Napoleon invades Russia, 1812 | 1 | "400,000 went in. 10,000 came back." | Minard line from the Neman to Moscow, thinning on the retreat |
| 2 | Genghis Khan and the Mongol Empire | 3 | "A shepherd boy conquered half the world?" | P1 uniting the tribes · P2 China and Khwarazm · P3 heirs reach Europe / Baghdad |
| 3 | D-Day, 1944 | 1 | "7,000 ships crossed in one night." | English Channel, landing arrows on 5 beaches + the Calais deception |
| 4 | Titanic, 1912 | 1 | "Why didn't the ship just turn?" | Southampton → sinking point, repeated ice warnings, Carpathia racing in |
| 5 | Alexander the Great | 2 | "Ruled to India by age 30." | P1 Macedon → Egypt · P2 Persia → Indus → back to Babylon |
| 6 | Hannibal crosses the Alps | 1–2 | "Elephants over snowy mountains?" | Alps relief + route Spain → Italy → Cannae |
| 7 | Stalingrad, 1942 | 1 | "One city decided the war." | Operation Uranus closing the ring |
| 8 | Magellan's voyage around the world | 1 | "270 sailed. 18 came home." | Route around a spinning globe |
| 9 | The Black Death | 1 | "A third of Europe, gone." | Plague spreading along trade routes month by month |
| 10 | The Berlin Wall | 1 | "They woke up in a city cut in half." | Zoom Europe → Berlin, the wall line, up to its fall in 1989 |
| 11 | The Spanish Armada, 1588 | 1 | "The invincible fleet lost to the weather." | Fleet track around England, Scotland, Ireland |
| 12 | The fall of Rome | 2–3 | "How does a 1,000-year empire end?" | Roman borders shrinking century by century + invasions → 476 |
| 13 | Mongols invade Japan, 1274 & 1281 | 1 | "The storm that saved Japan?" | Fleets from Korea to Hakata Bay, the kamikaze typhoon |
| 14 | Zheng He's treasure fleet | 1 | "China's fleet was 10× Columbus's." | Seven voyages from Nanjing to East Africa |
| 15 | Angkor: rise and fall of the Khmer Empire | 1–2 | "The biggest city on Earth, swallowed by jungle." | Khmer borders + Angkor water network from satellite |
| 16 | The fall of Ayutthaya, 1767 | 1 | "A 400-year capital, burned in one night." | Burmese two-pronged march converging on the island city |

## Episode 1: Napoleon invades Russia (draft outline, ~10 min)
Question for the whole video: **"Where did Europe's greatest army go?"**

| Chapter | ~Time | Content | Key visual |
|---|---|---|---|
| ch0 Hook | 0:30 | Numbers going in vs coming out + the question | The full Minard line flashes up, then cuts to a thin thread |
| ch1 Who was Napoleon | 1:00 | Artillery officer to emperor; most of Europe under France | French borders spreading year by year 1796–1810 |
| ch2 Why invade | 1:00 | The Continental System; Russia trading with Britain; the split with Tsar Alexander I | Arrows of British goods into Russian ports |
| ch3 The Grande Armée | 1:00 | Troops from many nations, supplies, horses, distance | Soldiers of many nations in a row + count chips |
| ch4 Crossing the Neman | 1:15 | 24 Jun 1812; Russia retreats and burns the fields; men die of disease and heat before any battle | Thick band moving east, counter starts falling |
| ch5 Smolensk–Borodino | 1:30 | 7 Sep, the bloodiest single day; no decisive winner | Zoom to the battlefield, army layout, loss chips for both sides |
| ch6 Empty Moscow | 1:15 | Enters 14 Sep; the city burns; the Tsar won't negotiate; 5 weeks of waiting | Illustration of the burning city (no people) |
| ch7 Retreat in the snow | 1:30 | Leaves 19 Oct; deep cold; Cossack raids; crossing the Berezina | Black line getting thinner + Minard-style temperature chart under the map |
| ch8 The answer | 1:00 | Not just winter: distance, supply, disease and Russia's retreat · the start of Napoleon's fall | All lines layered + closing question "When would you have turned back?" |

Numbers to verify in `sources.md`: troops across the Neman (Minard 422,000 / some historians 600,000+ with
reserves), survivors (~10–40 thousand depending on counting), Borodino losses, temperatures on the retreat.

Shorts from this episode: the hook + Minard line (ch0), Borodino in 45 s (ch5), the Berezina crossing (ch7).

Data to fetch:
```bash
node scripts/fetch-imagery.mjs bluemarble eu 20 50 40 58 6000      # Neman–Moscow
node scripts/fetch-imagery.mjs relief eu-relief 20 50 40 58 6000   # terrain for the retreat
node scripts/fetch-osm.mjs ru-rivers 20 50 40 58 bigrivers          # Neman, Dnieper, Berezina, Moskva
```
Minard route coordinates: the Minard dataset used by Tufte / R (troops / cities / temps) works directly as
lon/lat points + troop counts.

## Steps per episode (per `skills/map-studio/SKILL.md`)
1. `sources.md`: facts + sources + confidence levels
2. `script.md` + `beats.json` (`text` for TTS / `caption` on screen, same tokens) → **user approves the script**
3. TTS → `align` → `node scripts/snap-words.mjs <slug>` → `timing.json`
4. 10–15 s test in the final 16:9 look first (House standard rule 5) → **user approves**
5. Build `ch0`…`ch8.tsx`, check a still every ~3 s (later parts: folders `epNN-2`, `epNN-3`)
6. Render `--gl=angle` → `check-glitch.mjs` must report 0 → `loudness.mjs`
7. Cut 2–3 Shorts in 9:16
8. Description (summary, chapter timestamps, sources, map/data credits) + `.srt` + thumbnail

## First tasks (checklist)
- [ ] Pick the channel name (draft: "History on the Map" / "Maps of History"; check it's free on YouTube) and the narrator voice
- [ ] Build `kit/Layout.tsx` (16:9) and `kit/Army.tsx` (Minard line); test with the Napoleon data as a still
- [ ] Test whether TTS reads digits well in English; settle the `text`/`caption` number rule above
- [ ] Write `ep01/sources.md` + `ep01/script.md` for Napoleon
- [ ] 10–15 s hook test
- [ ] Add this channel's row to the House standard table in `skills/map-studio/SKILL.md` once code exists
