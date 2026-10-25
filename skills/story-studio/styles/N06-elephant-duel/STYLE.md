# N06 ยุทธหัตถี · War-Elephant Duel

![cover](cover-9x16.jpg)

**Fits:** elephant duels, decisive battles of Thai, Burmese, Khmer and Lanna history, any "two leaders meet" climax ·
**Formats:** 9:16 · **Code:** `Demo.tsx` + `kit/Duel.tsx`

## Look

One full-screen side-view battlefield at golden dusk, seen through a single moving camera. A blue-to-apricot sky
with a big low sun and its glow, a band of far green hills and a few round trees, then a sandy ground that fills the
lower third. Two armies face each other in lines of fluttering banners and jointed infantry; in the middle two war
elephants with grey ink-outlined hides, coloured caparisons with a trim of gold studs, a banner-bearer at the back
and a crowned king on the neck holding a long ngao. A blurred row of dark spear-bearers and grass runs across the
very bottom, closest to the camera. Everything has a 3–4 px ink outline, a warm orange wash and paper grain.

| Role | Hex |
|---|---|
| Sky top → horizon | `#3a4a7a` → `#d88a5a` → `#f6cf86` |
| Ground (top → bottom) | `#b8935a` → `#7a5a32` |
| Elephant hide / shadow side | `#8c8781` / `#6c6762` |
| Side A cloth (Siam) / side B cloth | `#b3261e` / `#e9e2cf` (trim `#d9a93a` / `#7a2a22`) |
| Ink outline · text accent | `#1a140f` · `#d9a93a`, `#ffb35c` on white `#ffffff` |

**Type:** Kanit 700/900, white; kicker 36 px gilt `#d9a93a`, headline 66 px with the verb in `#ffb35c`; end card
110 px on `rgba(8,14,26,0.88)` with a 5 px gilt border, radius 22. **Line:** bold ink `#1a140f`, 4 px on the
elephant body, 2.5–3.5 px on cloth and riders (world px at zoom 1).

## Motion signature

- One camera on one world: wide on both armies (zoom 0.6) → push in on the elephants as they charge (1.12) →
  tight on the duel (1.22) → pull back for the cheer (0.72). The camera keeps the elephants' feet at ~2/3 of the
  screen at every zoom (`cy = G − 330 / zoom`). Foreground spear-bearers and grass move at ×1.6 the camera pan.
- The two elephants walk in (leg cycle, ear flap), trumpet with the trunk curled up, and meet head-on; each blow
  recoils both 14 px and the riders' ngao sweep down in turn.
- Impacts: a star of sparks between the tusks, 12 px camera shake (22 px on the decisive blow), a 6-frame warm
  white flash on the clash and the decisive blow, an SFX hit on the same frame. The losing side's banners topple
  one after another.
- Arrow volleys arc both ways before the charge; dust swells under the elephants while they run.

## Scenes in the kit (`kit/Duel.tsx`)

| Component | Shows | Props |
|---|---|---|
| `Field` | Dusk sky, sun + glow, far hills, trees, ground (world x −600…3000, ground `G` = 1000) | — |
| `Elephant` | War elephant with caparison, banner-bearer and crowned king with ngao | `x, y, s, flip, walk, trumpet, swing, cloth, trim, crown, frame, rider` |
| `Arrows` | One volley of arrows on a high arc | `frame, at, x0, x1, n, dir, seed` |
| `Sparks` | Spark star on each blow frame | `frame, blows, x, y` |
| `DustPuffs` | Dust under the charge (k per puff) | `ks, x` |
| `FallingBanner` | Banner that topples `fall` degrees | `x, y, s, color, fall` |
| `since`, `G`, colours | Frames since the last event; ground line; side colours | — |

Infantry and banners are the template's `Fighter` (`COSTUME.siam`, `COSTUME.burma`, …) and `Banner`
(`components/Scene.tsx`).

## Build notes

Write one schedule of frame numbers at the top (horn, volley, charge, trumpets, clash, blows, decisive blow, cheer,
gong) and drive both picture and sound from it — every `<Hit>` sits on the frame its event is drawn. The world is
one `<svg>` 1080×1920 with a single `translate(W/2, 960) scale(zoom) translate(−cx, −cy)`; the foreground row is
drawn outside that transform with a 2.5 px blur. Finish with a `#ffb060` wash at 7 % and the template's
`PaperGrain`. Sound in the demo: beds `war_drums`, `wind`, `army_marching`; hits `war_horn_drums`, `arrows_volley`,
`arrow_hit`, `battle_cry`, `elephant` (trumpets), `sword_swish` 4 frames before each blow, `sword_clash` /
`sword_battle` on the blow, `explosion_far` low under the clash, `crowd_cheer`, `gong`. For narration, mix the beds
0.15–0.35 and duck them under the voice.

## Don'ts

- No cuts inside the duel — move the camera instead; one world, one camera.
- Do not show blood or a rider being cut; show the decisive blow with sparks, shake and falling banners.
- Do not dress both sides alike — the two caparison colours carry the story.
- No photo backgrounds or real paintings; everything is drawn in code.

## Credits

None for pictures — everything is drawn in code, no map data. Sound: recorded effects from the house library
(`npm run sfx-lib`; Pixabay Content License and Mixkit Sound Effects Free License — free for commercial video, no
attribution, files not redistributed). Font: Kanit (SIL Open Font License).
