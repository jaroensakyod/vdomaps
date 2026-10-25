# N09 การ์ดหลักฐาน · Broadsheet Clippings

![cover](cover-9x16.jpg)

**Look name:** หนังสือพิมพ์ตัดข่าว · Broadsheet Clippings
**Fits:** disputed facts, "who is right", deaths and dates that the sources tell differently, myth-busting, source
criticism segments inside a long history video · **Formats:** 9:16 / 16:9 · **Code:** `Demo.tsx` + `kit/Press.tsx`

## Look

A broadsheet front page, not a screen. Grey **newsprint** with fibres, a faint aged vignette and a horizontal fold
crease. A **masthead**: thick + thin rule, a small dateline row (kicker `N09 · การ์ดหลักฐาน` left, edition and Thai-
numeral date right), the paper's name in huge Taviraj 800, thin + thick rule. Under it the **lead**: a red kicker
with a red-pencil underline, a big serif headline, an optional big figure ringed in red pencil, and a printed
"ระดับหลักฐาน" box (●●○). The rest of the page is **multi-column body text** set as grey lines with sub-heads and
**halftone photo boxes** (dot screens drawn in code, no photos), separated by column rules.

The evidence arrives as **clippings**: pieces of lighter paper with **scissor-cut zigzag edges** and a soft paper
shadow that slide onto the page and stack: an almanac calendar, two clipped columns side by side (source tag, a
halftone picture, the claim in big serif, a few body lines), a ruled timeline chart with a halftone "written later"
band, four small source clippings in a grid, a boxed "ask three questions" sidebar. Every annotation is **red
pencil**: rings, single and double underlines, ticks and scrawled notes in Sriracha that draw themselves. Under the
clippings a photo-caption line (rule above, bold bar, serif) carries the narration. Footer: "หน้าข่าวจำลอง ·
ภาพประกอบ" (it is a mock page, never a real paper) and the page number.

| Role | Hex |
|---|---|
| Newsprint · clipping · warm clipping | `#d8d4c9` · `#e9e5da` · `#ece3cf` |
| Ink (type, rules) | `#1d1b18` |
| Grey (column rules) · body lines · halftone dots | `#8a867d` · `#9a958b` · `#3a3733` |
| Red pencil | `#c62a1f` |

**Type:** Taviraj 400/600/800 (Thai newspaper serif). Masthead 118 px (92 px on 16:9), dateline 24 px 600, kicker
30 px 800 red, headline 84 px 800 (76 px wide), figure 96 px, clipping title 34 px 800, claim 50–64 px 800,
caption 46 px 600, footer 24 px. Red-pencil notes and numbers: Sriracha 400. Sides are told apart by **name and
picture**, not by colour: the page stays black, grey and red. **Line:** rules 1–4 px, clipping edges zigzag 16 px
step ± 5 px, halftone dots 0.9 / 1.8 / 2.7 px on a 7 px 45° screen, pencil 4–7 px with grain.

## Motion signature

- **Slide-stack:** each clipping slides in from the side (alternating) with a 9° turn that settles on a spring
  (damping 15), lands on the page with a shadow, and is pushed off under the next one (out over 14 frames, sliding
  and sinking). Two-column comparisons land one column at a time on each source's cue.
- Headlines re-set rather than animate: a quick top-down wipe in 10 frames; the kicker underline draws 6 frames later.
- Every pencil mark draws itself on the spoken word: rings 12 frames, underlines 10 (+8 for the second stroke),
  ticks 9, scrawls write left to right in 14. UI sounds on the same frames (`SFX.pop` rings and columns, `SFX.tick`
  ticks and timeline, `SFX.hit` the note and the agreed line).
- Keep cue frames in order with `mono(frames, gap)`.

## Scenes in the kit (`kit/Press.tsx`)

| Component | Shows | Props |
|---|---|---|
| `NewsPage` | Newsprint, masthead, body columns, fold, footer; wrap everything in it | `title, kicker, dateline, children` |
| `Headline` | The lead: kicker + underline, headline, ringed figure, evidence-level box, scrawled chips | `heads: Head[]` (`sure: high/mid/low`), `from, to` |
| `Clipping` | A scissor-cut clipping that slides in and stacks; children get the local frame (no hooks inside) | `start, end, seed, rot, box, warm, title, children` |
| `Calendar` | Almanac month with red-pencil rings on the marked days | `title, first, days, marks: [day, frame][]` |
| `Compare` | Two clipped columns (tag, halftone picture, claim) + a scrawled note between | `left, right: Side`, `note` |
| `Timeline` | Ruled chart, ticks, marks, halftone "written later" band, ring on the event | `from, to, marks, zone` |
| `FourSources` | One small clipping per side, ticked in pencil, then the agreed line double-underlined | `sources: Source[], checks, bottom` |
| `ThreeQuestions` | Boxed sidebar: who wrote it / when / for whom, numbers ringed | `fs, title` |
| `Halftone` | Code-drawn dot-screen "photo": palace, temple, boat/ship, letter, court | `w, h, kind` |
| `Ring`, `Underline`, `Tick`, `Scrawl` | Red-pencil marks | `f` + size props |
| `Subtitle`, `useLay`, `mono`, `usePop` | Caption line; page geometry for 9:16/16:9; cue helpers | — |

The old dark-card helpers (`NotePage`, `Staircase`, `FlickerTable`, `Poll`, `BigQuestion`) are not in this kit; build
them as `Clipping`s with the same parts if an episode needs them.

## Build notes

Everything sits in `NewsPage`; the clipping zone, lead and caption positions come from `useLay()` (9:16: lead at
262 px, clippings 640–1340, caption 1392; 16:9: lead in the left 700 px, clippings on the right). One clipping per
idea, 3–5 s each; one headline per beat. Every claim names its source on the clipping ("พงศาวดารไทย (ฉบับหลัง)",
"บันทึกราชวงศ์ชิง (ถอดความ)"); quotes are paraphrases marked "ถอดความ". Keep the evidence-level box honest:
หลักฐานตรงกัน only when independent sides agree.

## Don'ts

- Never present the page as a real newspaper: keep the "หน้าข่าวจำลอง" footer and invent the paper's name.
- No dark background, glowing UI cards, rounded boxes or coloured side codes; red is only the pencil.
- No real scans, photos or newspaper logos; halftones are drawn in code.
- Never show one side's claim as fact without its source tag; one claim per column, ≤ 6 words in big type.

## Credits

None for pictures: everything is drawn in code, no map data. Sound: template UI sounds (`npm run sfx`) and the house
library bed `fire_crackle` (Pixabay / Mixkit licences, no attribution). Fonts: Taviraj, Sriracha (SIL Open Font
License).
