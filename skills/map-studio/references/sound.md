# Sound effects: the house library and how to use it

Set by the user on 22 Oct 2026: every channel uses realistic recorded SFX, free and safe for monetised videos.
The synthetic `SFX.*` set (whoosh, pop, hit, tick, riser, swell) stays for UI moments only — cards, pins,
counters, camera moves. Anything that happens *in the story* (a gun, a sword, rain, a crowd) uses a recording.

## Sources (only these)

| Source | Licence | Use |
|---|---|---|
| **Mixkit** (mixkit.co/free-sound-effects) | Mixkit Sound Effects Free License: commercial OK, no credit | first choice for nature, crowds, swords, explosions; plain HTTP works (`scripts/sfx-lib.mjs`) |
| **Pixabay** (pixabay.com/sound-effects) | Pixabay Content License: commercial OK, no credit | guns, cannons, WW1/WW2, marching, protests, elephants. Search pages block scripts: open them in the built-in browser and read each sound's page with `fetch(href)` from the page; the `cdn.pixabay.com/download/audio/…mp3` URL in that HTML downloads with plain HTTP |
| Freesound.org | only items marked **CC0** | needs an account, so the user downloads; put the file in `public/sfx/lib/.raw/<id>.mp3` and add an entry with `"src": "freesound"` |
| Synthesised (`npm run sfx`) | none needed | UI sounds only |

Never: BBC Sound Effects (personal/educational licence only), YouTube rips, game/film rips, anything with
"non-commercial" or "attribution required" that we cannot credit.

**Neither Mixkit nor Pixabay allows redistributing the raw files**, so the audio is never committed:
`sfx/library.json` (the catalogue) and `scripts/sfx-lib.mjs` (download + process) are in git,
`public/sfx/lib/` is git-ignored. On a new machine: `npm run sfx-lib`.

## Adding a sound

1. Find it on Mixkit (note the numeric id) or Pixabay (note the page URL and the cdn download URL).
2. Add an entry to `sfx/library.json`: `id` (snake_case, what it *is*: `sword_clash`, `rain_heavy`),
   `cat` (war, battle, people, nature, places, ui), `kind` (`shot` = one-off, `bed` = ambience to loop),
   `src`, `mixkit` or `page` + `url`, `title`; optional `start`/`len` (seconds) or `loudest` (pick the loudest
   window of that many seconds from a long recording).
3. `node scripts/sfx-lib.mjs <id>` downloads it and writes `public/sfx/lib/<id>.mp3`: cut, leading silence
   trimmed (shots), fades (beds 0.4 s so they loop), loudness normalised (shots −16 LUFS, beds −20 LUFS).
4. You cannot listen. Check the title is literally the sound you want, check `volumedetect` shows real
   signal, and prefer recordings whose title names the exact thing ("Gewehr 98 rifle shot", not "gun sfx").
5. Tell the user which new sounds were added so they can spot-check by ear.

## Sync rule (picture and sound share one schedule)

Raw recordings rarely start on the bang: the Gewehr 98 shot cracks 0.7 s into its file, the debris rain 0.8 s,
a fly-by is loudest 5 s in. So `npm run sfx-lib` measures every file (30 fps loudness envelope, `hit` = start of
the main transient, `peak` = loudest frame) into `src/components/sfx-index.json`, and scenes place sounds by
those numbers:

- **`<Hit id at>` for every one-shot** — the transient lands exactly on `at`. Never `<Sfx src={lib(...)}>` with a
  hand-guessed offset. Lead-ins (`"align": "end"` in the library, e.g. `shell_incoming`) end on `at` instead.
- **One schedule drives both sides.** Keep the event frames in one constant (`RIFLE = [[frame, who], …]`,
  `TANK_GUN = [330, 450]`) and use it for the muzzle flash, the shake *and* the `<Hit>`. Never time flashes with
  `frame % n` and sounds with a separate list.
- **Continuous sounds drive the picture.** Machine guns, engines, crowds: start the sound, then draw from it —
  `levelAt(id, start, frame)` (0–1) for bursts and glows, `onsets(id, start)` for distinct strikes. The gun fires
  on screen exactly while its burst is loud.
- **Fly-bys and swells:** `<Bed from={bedFrom(id, peakFrame)}>` so the loudest moment lands when the plane
  crosses the middle of the frame, the crowd roars, the wave breaks.
- Check: every event frame in the schedule has its `<Hit>`; nothing in the mix plays on a frame with no event
  on screen (except beds).

## Using sounds in a scene

```tsx
import { Bed, Hit, voiceSpans } from "../../components/Sound";
<Bed id="rain_heavy" from={B.storm.start} to={B.calm.start} volume={0.25} voice={voiceSpans(BEATS)} />
<Hit id="sword_clash" at={wf("duel", "ฟัน")} volume={0.5} />
```

- **Every illustrated event gets its sound on the same frame** as the picture (the impact frame, the muzzle
  flash, the moment the gate breaks). Shots that travel (shells, arrows) start their whistle/whoosh
  ~15 frames before the impact.
- **Each scene has a bed** that sets the place: rain, wind, sea, crowd, distant battle, fire. One or two beds at
  a time, never more. Beds fade in/out over ~20 frames at scene changes.
- **Narration always wins.** Pass `voice={voiceSpans(BEATS)}` to beds (ducks to 45 % under VO). One-shots under
  VO: volume 0.3–0.5; big hits in a pause: up to 0.9.
- Vary repeated sounds: alternate `explosion_mid` / `explosion_far` / `explosion_big` by size and distance, and
  don't fire the same rifle sample more than ~once a second.
- Distance = volume: far events 0.3–0.5, near 0.6–0.9.
- After the render, `node scripts/loudness.mjs` brings the mix to −14 LUFS as usual.

## What to reach for (current library)

| Story need | ids |
|---|---|
| Shellfire, bombing | `shell_incoming` → `explosion_mid` / `explosion_far` / `explosion_big`, `explosion_debris`, bed `explosions_distant` |
| WW1/WW2 infantry | `rifle_ww1`, `rifle_echo`, `mg_ww1`, `mg_heavy`, bed `firefight`, `whistle_officer`, `battle_cry` |
| Artillery, ships' guns, old cannon | `cannon`, `cannon_old` (black powder), `cannon_far` |
| Tanks, planes | bed `tank_move`, `tank_tracks`, bed `plane_vintage`, bed `plane_prop_loop` |
| Air raid, emergency | bed `air_raid_siren`, `siren_police` |
| Ancient battle | `sword_clash`, `sword_battle`, `sword_draw`, `sword_swish`, `arrows_volley`, `arrow_hit`, `battle_cry`, bed `war_drums`, `war_horn_drums`, bed `war_horn` |
| Armies on the move | bed `army_marching`, `army_march_crowd`, bed `horse_gallop`, `horse_neigh`, `elephant` |
| Court, temple, ceremony | `gong`, `church_bell` (Europe) |
| Protest, riot, crowds | bed `crowd_protest` (chanting), bed `crowd_protest_march`, bed `crowd_riot`, bed `crowd_angry`, `crowd_cheer`, bed `crowd_panic`, bed `city_crowd` |
| Weather | bed `rain_light`, bed `rain_heavy`, bed `storm`, `thunder_close`, `thunder_rumble`, bed `wind`, bed `wind_storm` |
| Fire, burning city | bed `fire_big`, bed `fire_crackle` |
| Sea, ships, jungle | bed `sea_rough`, bed `ship_sailing`, bed `jungle_rain` |

Missing something (a Thai temple bell, a steam train, a market)? Add it with the steps above before using a
generic stand-in, and add the row here.
