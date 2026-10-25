# M12 ข่าวต่างประเทศรายวัน · Daily World News Short

![cover](cover-9x16.jpg)

**Fits:** a daily 60–90 s world-news short (6–8 stories), weekly round-ups, any "N things today" list on a map ·
**Formats:** 9:16 · **Code:** `Demo.tsx` + `kit/Daily.tsx` + `kit/Art.tsx`

## Look

The satellite news map (Blue Marble globe, red country wash, dark cards) cut to a fixed daily-short format. Frame 0
is a shock line in the card slot: red "ด่วน · <country>" badge, a 100 px white line and a red second line over a
close-up with an illustration already playing. Then an intro card with the date stamp and the headline count
("3 ข่าวใหญ่ใน 24 ชั่วโมง · 60 วินาที") while the globe spins and a pulsing red dot pops up for every story. Each story
then has ONE head card (tag `n/N · country`) whose headline and big stat swap on every shot, a pin, map overlays
(storm spiral on a dashed gold track, flood spreading, darkened cities), and a fixed-slot illustration panel at 56 %
of the height labelled "ภาพประกอบ". A top bar carries the edition badge, the date stamp and one progress pill per story.

| Role | Hex |
|---|---|
| Background (radial, centre → edge) | `#0b1830` → `#02060d` |
| Accent red (badge, bar, wash, pins) | `#ff3b30` (stat `#ff6b5f`) |
| Weather / approximate (track, storm card) | `#ffc94a` |
| Good news / politics card colours | `#3fb950` / `#4fa3ff` |
| Card · text | `rgba(8,14,26,0.86)` · `#ffffff` |

**Type:** Kanit 700/900 — hook line 100 + 76 px, head 54 px, stat 92 px, tag 26 px, top bar 32/30 px, panel chips
24 px, at 1080 wide. **Line:** borders 0.9 px white 30 %; highlight 2.5 px `#ff8a80` over a 9 px blurred glow; storm
track 4 px dashed 14/10 gold; panel frame 3 px in the card colour.

## Motion signature

- Frame 0 hits: SFX hit + the shock line springs from 0.85 → 1 over the hook close-up; fades out in 8 frames.
- Intro: camera pulls out to the whole globe and spins; story dots pop in 3 frames apart and pulse every 30 frames.
- Per story: pull back (to the midpoint, only as far as the hop needs) → push in 20 frames → 6 % creep. Card
  slides in on a spring; each new shot swaps the text with a 14 px rise. Counters count up (`stat` as a function).
- Panels chain on the cue words: `chain([cue1, cue2], end)` gives each panel `[cue, next + 14]` (overlap, no flicker).
  `SFX.pop` on each panel, `SFX.whoosh` on each fly, ambience beds (wind, rain) under the story.
- Outro: the edition card fades in on the globe ("ทุกวัน · กดติดตามไว้ แล้วพบกันพรุ่งนี้").

## Scenes in the kit

| Component | Shows | Props |
|---|---|---|
| `dailyCam` | Camera keys: hook close-up → intro spin → story flights → closing globe | `stories, width, height, hook, intro, total` |
| `HookTitle` | Frame-0 shock line in the card slot | `badge, line1, line2, to` |
| `HeadCard` | One card per story, text swaps per shot (tag, head, stat or counter, chips) | `heads: Head[], from, to` |
| `TopBar` | Edition badge, date stamp, progress pills | `title, date, stories, from` |
| `StoryDots` | Pulsing dot per story on the intro globe | `points, at, to` |
| `Highlight`, `Borders` | Red country wash (several ids), faint borders | `ids, opacity` |
| `StormTrack` | Rotating storm spiral riding a dashed forecast track, "(โดยประมาณ)" label | `track, from, to, trackAt` |
| `FloodLayer` | Translucent water spreading from a point | `at, radius (deg), k` |
| `Panel`, `chain`, `Chip`, `PanelLine`, `Flash` | Fixed-slot "ภาพประกอบ" panel and its helpers | see code |
| `Outro` | Sign-off card | `title, from` |
| `kit/Art.tsx` | `Palm`, `Rain`, `Waves`, `Car`, `Helicopter`, `RescueBoat`, `Hemicycle`, `Lectern`, `Spiral` | `x, y, scale, frame` |

Template `Props.tsx` / `Figures.tsx` add drones, aid trucks, rockets, skylines, people, fire and smoke.

## Build notes

Layout is fixed so the eye always knows where to look: card 10–27 %, map middle, panel 56–74 % (`PANEL_TOP`,
`PANEL_H = 350`), captions at 76.5 % (`CAPTION_TOP`). A story is `{ start, end, pin, focus, zoom, ids }`; stories
share boundary frames. In a real episode use `buildBeats(timing, beats)` and cue everything with `wf(beat, "คำ")`
(Whisper word timing) — one new picture every 3–4 s, 2–3 panels per story. The demo hard-codes frames instead.

## Data

Not shipped — run once in the project:

```bash
npm run imagery -- bluemarble world     # public/raster/world.jpg + .json
npm run sfx                              # template UI sounds
npm run sfx-lib                          # house library (wind_storm, rain_heavy, thunder_close)
```

Country borders come with the template (`world-atlas` countries-50m).

## Don'ts

- Never "สด", never injured people or bodies; casualties go in an info chip with "อย่างน้อย" / "ราว" as sources say.
- Every story needs two sources; preliminary results say "ผลเบื้องต้น"; approximate places and tracks say "(โดยประมาณ)".
- Don't move the card, panel or caption slots between stories, and don't drop the date stamp or progress pills.
- Don't open on the edition logo — frame 0 is the shock line.

## Credits

Imagery: NASA Blue Marble · Borders: Natural Earth — in the video description. Illustrations are drawn in code.
Sound: template UI sounds and house library (Mixkit / Pixabay licences, no attribution needed). Font: Kanit (SIL OFL).
