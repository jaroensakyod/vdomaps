# What if America · channel plan

An **English-language** channel for a **US audience** (planned 22 Oct 2026 in Thai, switched to English for US
viewers the same day). Each episode asks one question: **"What if one moment in American history had gone the
other way?"** The first half tells what really happened; the second half follows the what-if world on the map.
Each episode closes on **"So what would it mean for you?"**: how the change would reach a viewer in the US today.

## Why this niche
- **Built-in hook:** a what-if question makes people stay for the answer.
- **Comment fuel:** viewers argue ("No way, it would have gone like this…"), and comments push the video.
- **Made for maps:** redrawn borders, states breaking away, countries growing. Our map pipeline already does this.
- **US history is home turf for US viewers:** they know the names (Seward, Texas, Louisiana), so a twist on a familiar
  story lands harder than a foreign one. History pays well per view in the US.

## Competition and our edge
English alternate history is a crowded genre on YouTube. We win on:
1. **Real satellite maps** with a new picture every 3–4 s (house news look), where most channels hold still images.
2. **A visible line between fact and fiction:** the what-if grade, the "WHAT IF" chip and the split transition
   (below). Viewers always know which world they are in. It builds trust and keeps YouTube from reading it as misinformation.
3. **Two branches per episode** (the likely one and the scary one) instead of one guess.

## Formula for every episode
| Part | Share | Rule |
|---|---|---|
| Hook | 0:00–0:30 | ≤ 8 words + a wrong-looking map on frame 0 |
| What really happened | ~40% | Every number sourced in `sources.md` |
| The fork | ~5% | ONE moment that, if changed, changes everything, and it must have nearly happened |
| What-if world | ~45% | A chain of consequences; every step leans on at least one real fact ("in the real world…") · at least 2 branches (most likely / most dramatic) |
| What it means for you + close | ~10% | Bring it home to the viewer in the US today, flagged as one possibility · end on a comment question |

### Language in the what-if world
- Use "probably", "might", "many historians think…". Never state the what-if world as fact.
- Every what-if scene carries the **"WHAT IF"** chip in the top-right corner.

## Format
| Item | Rule |
|---|---|
| Main video | **9:16 (1080×1920) vertical long-form, ~10 min**, same as History on the Map |
| Shorts | 3–4 cuts of 30–60 s per episode from the same render (hook, the fork, the wildest what-if moment) |
| Map, real world | News look (House standard rule 1): NASA Blue Marble + HLS + OSM rivers |
| Map, what-if world | Same imagery under the **channel grade** (dark violet + magenta), what-if borders as glowing dashes, "WHAT IF" chip · into/out of the what-if world with the **split transition** (the picture cracks and slides apart). Code: `kit/WhatIf.tsx` |
| Illustrations | Style v2 (`src/components/Scene.tsx`), label "Illustration" · channel costumes `COSTUME_W`: `soviet`, `russia1860`, `usa1860` (add `britain` and Civil War blue/grey when an episode needs them) |
| Kit | English news kit `episodes/worldhistory/kit/news.tsx` (Inter + Oswald, cards, panels, quiz) + `kit/WhatIf.tsx` |
| Voice | Gemini TTS, one English narrator, **Puck** (upbeat storyteller, fixed in `voices.json`) · library sound for every event |
| Units | Miles, square miles, °F, US dollars (with "about $X in today's money" only when a source gives it) |
| Names | Standard US spellings; keep them in `glossary.md` |
| Captions | Burned-in word-timed English captions + `.srt`; run `snap-words` after `align` (`WHISPER_LANG=en`) |

### Script rules (English, US audience)
- Write natively for the ear: short sentences, active verbs, a little wit. No translated phrasing.
- `text` (TTS) and `caption` (screen) keep the same space-separated tokens (`../worldhistory/speak.mjs` style:
  "$7.2" ↔ "seven-point-two", "1867" ↔ "eighteen-sixty-seven").
- US viewers fact-check hard: every number has a source and a range where sources disagree. Bust myths only with
  evidence (e.g. "Seward's Folly" was a minority view).

### No-go list
- No side-taking in today's politics; no living politicians praised or mocked.
- No drawn bodies or wounded; losses as numbers.
- No Nazi symbols; **no Confederate flags** on screen (use plain grey for the Confederate side), to keep ads and
  avoid glorification.
- Disclose the AI voice in YouTube's altered/synthetic content setting if asked.

## First 12 episodes (draft hooks, check numbers first)
| # | Episode | The fork | Draft hook |
|---|---|---|---|
| 1 | What if Russia never sold Alaska? | 1867, no sale | "What if Alaska were still Russian?" |
| 2 | What if Napoleon never sold Louisiana? | 1803 | "Half of America, still French?" |
| 3 | What if Texas stayed independent? | 1845, no annexation | "The Republic of Texas, today." |
| 4 | What if Mexico won the 1846 war? | California stays Mexican | "What if California were Mexican?" |
| 5 | What if the Revolution failed? | 1776–1781 | "What if the British won?" |
| 6 | What if Hawaii stayed a kingdom? | 1893 | "The kingdom America took." |
| 7 | What if the Cuban Missile Crisis went hot? | Oct 1962 | "13 days from the end." |
| 8 | What if there were no Panama Canal? | 1914 | "Every ship around Cape Horn." |
| 9 | What if Japan never attacked Pearl Harbor? | 1941 | "What if America stayed out?" |
| 10 | What if the atomic bomb was never used? | 1945 | "Operation Downfall, for real." |
| 11 | What if the US bought Greenland in 1946? | Truman's $100M offer | "America almost bought Greenland." |
| 12 | What if the Union lost the Civil War? | 1863 | "Two Americas." (grey uniforms only, no Confederate flags) |

Episodes 1, 2, 11 can run as a "Land deals" arc (the purchases that made, or nearly made, the map).

Special explainer (out of order, timely): **"Why does America vote on a Tuesday?"**, system only, no side-taking,
out before the 3 Nov 2026 midterms.
