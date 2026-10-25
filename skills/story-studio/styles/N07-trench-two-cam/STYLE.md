# N07 สนามเพลาะสองกล้อง · War Litho Poster

![cover](cover-9x16.jpg)

**Look name:** โปสเตอร์ลิโธสงคราม · War Litho Poster
**Fits:** modern war (1860s–1940s), assaults on a fixed line, any "attack vs defence" moment where the viewer must
see the whole field and the man in the trench at once · **Formats:** 9:16 · **Code:** `Demo.tsx` + `kit/Litho.tsx`

## Look

A WW1-era stone-lithograph war poster that moves. Off-white paper with a stone grain; everything printed in **three
flat inks** (khaki, brick red, black) with no outlines. Each ink has a lithographic-crayon tooth (small speckled
holes, slightly rough edges) and shading is diagonal crayon hatching, never a gradient. The page is a poster: a black
rule and the kicker in letter-spaced brick, a huge Chonburi headline set on a slight diagonal with the verb in brick,
then **two stacked poster panels** cut on a diagonal (the paper gap between them is the poster's main diagonal) with
a hard edge and a 10 px black keyline, no rounded frames. Top panel "สมรภูมิ" (the whole field), bottom panel
"ในสนามเพลาะ" (the trench), each labelled by a flat ink block. Footer: black rule, place line in black, "ภาพประกอบ"
in brick.

Inside the panels one live side-view world: paper sky with sweeping light-khaki searchlight beams, a low brick sun, a
pale hatched far ridge, black mud rising to the right with khaki crater lips. Attackers are khaki silhouettes with
black helmets and long black bayonets thrown forward on the diagonal; defenders are black silhouettes with pale khaki
helmets behind khaki sandbags. Shell bursts are brick starbursts with a black fan of dirt spikes and pale smoke;
tracers and muzzle flashes are brick; the tank and biplanes are solid black masses.

| Role | Hex |
|---|---|
| Paper · paper shade | `#ece2c8` · `#e2d5b4` |
| Khaki ink · light khaki (smoke, beams, defenders' helmets) | `#8c7b4e` · `#b9a774` |
| Brick ink (sun, bursts, tracers, verb, labels) | `#b3402a` |
| Black ink (mud, tank, planes, defenders, type) | `#17130f` |

**Type:** Chonburi 400 only (one heavy display face, like poster letters). Kicker 38 px brick, letter-spacing 6;
headline 138 px black, rotated −2.3°; panel labels 40 px paper-coloured on ink blocks; footer 44 / 34 px; end card
100 px paper on a brick band + 44 px paper on a black strip. All type is SVG text under the light crayon filter
(`crayonT`). **Line:** none, shapes only. Keylines 10 px black around panels; hatching 4.5–6 px at −32°.

## Motion signature

- **Stepped on twos:** the picture holds each drawing 2 frames (`twos(frame)`); soldiers run in a 2-drawing cycle
  (6 frames per drawing), so the print feels hand-made. Sound uses the real frame.
- Two cameras, one world: the wide panel drifts across the field (zoom 0.56 → 0.62); the trench panel holds on the
  parapet, swings to the wire as the attack arrives and snaps back for the big hit (zoom 1.35 → 1.6). Neither panel
  ever cuts.
- Shell bursts: brick starburst 0–18 frames, black dirt spikes 0–40, pale smoke rising for 70; each burst shakes the
  wide panel 4 px × size and the trench panel 9 px × size; the last shell adds 18 px and a brick multiply flash.
- The machine gun's muzzle flash and tracers are drawn only while its recorded sound is loud
  (`levelAt("mg_ww1", …) > 0.6`): picture follows sound.
- End card: a brick band slams across the page at −6° with a black strip under it.

## Scenes in the kit (`kit/Litho.tsx`)

| Component | Shows | Props |
|---|---|---|
| `LithoDefs` | Filters `crayon` (inks), `crayonT` (type), `stone` (paper); patterns `hatch`, `hatchK`, `hatchB` | — |
| `Paper` | Paper + stone grain, full bleed | `w, h` |
| `Panel` | Slanted poster panel: polygon clip, camera on the world, crayon tooth, black keyline | `id, poly, cx, cy, zoom, shake, children` |
| `Field` | Paper sky, searchlights, brick sun, hatched ridge, black mud, crater lips (ground `GROUND` = 1000) | `frame` |
| `Burst` | Shell burst (starburst, dirt spikes, smoke) | `x, size, age` |
| `Wire`, `Sandbags`, `Stump` | Barbed wire; parapet; shattered stump | `x0, x1` / `x, n, rows` / `x, h, lean` |
| `Tank`, `Plane` | Black rhomboid tank with running track teeth; black biplane | `x, frame, gunAt` / `x, y, flip, frame, mark` |
| `Soldier` | Flat silhouette: `run` (2 drawings), `aim` (behind the parapet, brick flash), `stand` | `x, y, s, flip, pose, phase, frame, fill, helmet, flash` |
| `INK`, `twos`, `rnd`, `since` | Inks; step-on-twos; deterministic random; frames since last event | — |

## Build notes

Put the world in one component (`World`) and render it inside every `Panel`; give each `Panel` its own `id`. Keep
`<LithoDefs/>` once at the top of the `<svg>`. The filters use page coordinates, so never put `filter=` on an element
that also has a `transform`: wrap it (`<g filter><g transform>…`). Use only the three inks plus paper; a fourth colour
breaks the look. Keep the event lists at the top (`BLASTS` as `[frame, x, size]`, rifle frames per man, MG plays,
tank gun, plane crossings) and build the sound from the same lists. This demo is the house **reference sound mix**:

| Layer | Ids | Level |
|---|---|---|
| Beds under everything | `explosions_distant`, `wind` | 0.30, 0.16 |
| Shells | `shell_incoming` whistle ending on the impact, then `explosion_far` (x < 1000) / `explosion_mid` / `explosion_big` (size > 2) + `explosion_debris` | 0.35 · 0.5 / 0.7 / 0.95 |
| Small arms | `rifle_ww1`, every 3rd `rifle_echo`; `mg_ww1` started at play + its `hit` offset | 0.18–0.26 · 0.42 |
| Vehicles | `tank_move` bed while it moves, `cannon` on its gun frames; `plane_vintage` / `plane_prop_loop` beds started with `bedFrom(id, crossFrame)` | 0.4 · 0.6 · 0.45 / 0.3 |
| Story cues | `whistle_officer` (over the top), `battle_cry`, `war_horn_drums` under the end card | 0.5–0.6 |

With narration, drop every one-shot 6–10 dB under the voice and duck the beds (see `references/sound.md`). The crayon
filter runs on both panels: keep particles modest (≤ 20 men, ≤ 11 bursts).

## Don'ts

- No gradients, glows, outlines or a fourth ink; no rounded frames, no dark screen background.
- Do not copy a real recruiting or war poster's composition, slogan or figure; write your own lines.
- Do not cut between the panels; both run all the time and show one moment at two distances.
- No gore; no real unit insignia or national flags beyond simple roundels and crosses; no photos or real footage.

## Credits

None for pictures: everything is drawn in code, no map data. Sound: recorded effects from the house library
(`npm run sfx-lib`; Pixabay Content License and Mixkit Sound Effects Free License, free for commercial video, no
attribution, files not redistributed). Font: Chonburi (SIL Open Font License).
