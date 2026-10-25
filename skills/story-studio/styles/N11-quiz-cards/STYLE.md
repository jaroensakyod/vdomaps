# N11 ควิซท้ายบท · Quiz Question Cards

![cover](cover-9x16.jpg)

**Fits:** end-of-chapter recap, "guess before I tell you" moments, retention breaks in long videos, quiz shorts ·
**Formats:** 9:16 / 16:9 · **Code:** `Demo.tsx` + `kit/Quiz.tsx`

## Look

The quiz card of the history news episodes on its own. A dark navy, slightly transparent card with a gold
border holds a small gold title ("ทายกันหน่อย"), a heavy one-line question and 2–4 choice rows, each a faint white
bar with a lettered circle (A, B, C, D). Under them a big gold countdown number and a gold bar along the bottom edge
drain to zero. On the reveal the right row turns green with a white tick, the wrong rows fade to 40 % with red
crosses, and a gold one-line explanation slides in. Standalone it sits on a code-drawn backdrop: deep navy, a gold
glow and a blue glow drifting slowly, a faint dot grid and rising specks; over a map it simply floats over the
map (episodes put it at 56 % height, where the illustration panel goes).

| Role | Hex |
|---|---|
| Background | `#02060d` (glows `#ffc94a` 22 %, `#4fa3ff` 20 %) |
| Card | `#080e1a` at 92 %, border `#ffc94a` |
| Right answer | `#3f8f4a` at 90 %, tick `#ffffff` on white circle |
| Wrong answer | `#ff3b30` circle, row at 40 % |
| Text / rows | `#ffffff` / white at 10 %, 2 px white 30 % edge |

**Type:** Kanit 700/900 at 1080 (9:16 drawn 1.2× larger) — question 52 px 900, choices 42 px 700, title 28 px,
countdown 64 px 900, explanation 34 px, header pill 30 px + 64 px title. **Line:** card border 3 px, rows 2 px,
radius 18 / 12 px.

## Motion signature

- Card springs in (scale 0.9 → 1, damping 14); choices slide in from the right 5 frames apart.
- Countdown: whole seconds left, the number pulses on each new second, a tick sound each second, a riser into the
  reveal, the bottom bar drains linearly.
- Reveal on one frame: colours swap, the tick circle springs (damping 10), the right row bumps 4 %, hit sound.
- Explanation slides up 12 frames after the reveal; the card fades out over 8 frames at `end`.

## Scenes in the kit

| Component | Shows | Props |
|---|---|---|
| `QuizNews` | The quiz card: question, choices, countdown, reveal, explanation | `title, question, options, answer, start, reveal, end, explain?, color, top?` |
| `QuizHeader` | "ข้อ 1/3" pill + a title above the card | `n, of, title, start, color, top?` |
| `QuizBackdrop` | Navy backdrop with drifting glows, dot grid, specks | `accent, second` |

Timing rule used in the episodes: `start` on the question word, `reveal` = start + 3–4 s (the narrator says
"ลองทายดู"), `end` = a second after the explanation is spoken.

## Build notes

Plain HTML/CSS in an `AbsoluteFill`; the backdrop is one SVG. Sizes come from the short side (×1.2 on 9:16). Keep
questions to one line (~30 Thai characters on 9:16) and choices to one line each; 4 choices is the maximum. Inside
a map episode drop `QuizBackdrop` and pass `top={0.56}`.

## Don'ts

- No more than 4 choices; no two-line choices.
- Don't reveal before the countdown ends or skip the sound on the reveal.
- No photos or AI pictures inside the card — text only (an icon drawn in code at most).
- Don't put the card over captions; captions stay at 76.5 % on 9:16.

## Credits

None for pictures — everything is drawn in code. Sound: template UI sounds (`SFX.tick`, `SFX.riser`, `SFX.hit`,
`SFX.whoosh`). Font: Kanit (SIL OFL).
