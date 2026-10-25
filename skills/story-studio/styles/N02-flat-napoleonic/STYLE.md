# N02 ตัวละครแบนสองโทน ยุคนโปเลียน · Flat Two-Tone Napoleonic

![cover](cover-9x16.jpg)

**Fits:** Europe 1700s–1800s — Napoleon's campaigns, the Seven Years' War, revolutions, colonial armies of the
period · **Formats:** 9:16 / 16:9 · **Code:** `Demo.tsx` + `kit/Period.tsx`, `kit/Battle.tsx`, `kit/Panel.tsx`

## Look

Clean, flat, two-tone figures in the news look of the world-history channel. Each figure is built from solid
fills — a base colour plus one darker shade on the far side (a 20 % black overlay) — with a thin, even dark navy
outline; round faces with a dot eye, coloured facings and white crossbelts make every army readable by its
uniform (French blue/red/white, Russian green, Austrian white…). Backdrops are equally flat: two-colour sky
gradient, soft hill silhouettes, a flat ground band, simple water with moving glints, falling snow. Everything
sits in a rounded illustration panel with a bright accent border and a "ภาพประกอบ" tag, under a dark news head
card with a coloured left edge and a big number, on a deep navy page.

| Role | Hex |
|---|---|
| Background (page) | `#0d1422` → `#1b2233` |
| Outline | `#1b1d24` |
| French coat / facing / legs | `#2c4a8c` / `#c8312b` / `#ecebe4` |
| Russian coat | `#2f5a3a` |
| Accents (panel border, card edge, stat) | `#ff3b30` red · `#ffc94a` gold · `#4fa3ff` blue |
| Text | `#ffffff` on `rgba(8,14,26,0.86)` cards |

Other uniforms in `Period.tsx`: Polish `#2a3f78`, Bavarian `#6f9fd0`, Austrian `#e8e5dc`, Italian `#3d7a4a`,
Prussian `#1f2a4a`, Swiss `#b8322a`. Skin `#e9b994`. Skies: dawn `#e8a868 → #f6dfb0`, smoke
`#6a6a70 → #c8b89a`, winter `#7a8a94 → #d8dee2`, summer `#8ab8de → #e8f0f2`.

**Type:** Kanit 900 for headlines (58 px) and stats (90 px), Kanit 700 for tags, the top bar and the channel
chip (30 px), Kanit 900 subtitles 60 px with a 12 px `#0b0f18` outline (sizes at 1080 wide). **Line:** 1.5 units
on figures (≈ 3 px at panel scale), 1.1–1.4 on details; panel border 4 px accent; 18 px corners.

## Motion signature

- Inside a panel: slow push-in (+6 %), 60 px pan, three parallax layers (far × 0.2, mid × 0.6, front × 1.6).
- Figures march in a steady cycle (leg swing ±16°, 2.4 px bob), trudge slower with the head down, stand with
  a breathing bob; flags wave, cannon recoil and smoke on a fixed period.
- Panels spring up 30 px into place, fade out over 14 frames, overlap the next by 14 frames.
- The head card slides in from the left once; its tag, headline and stat swap with a small rise on each panel.
- Impacts: explosion burst + 8-frame shake and white flash on the panel, an SFX hit on the same frame.

## Scenes in the kit

| Component | Shows | Props |
|---|---|---|
| `Page`, `TopBar`, `HeadCard`, `Line` (`Panel.tsx`) | Navy page; channel chip + chapter + year pill; head card with stat; subtitle | `heads: {f, tag, head, stat, label, color}[]` |
| `Panel`, `Layers` | Framed illustration panel (children get an `InsetGeom`); push-in + parallax + impact | `id, start, end, sky, accent, box` |
| `Soldier` (`Period.tsx`) | Line infantryman: walk / stand / trudge, blanket `wrap`, any `Uniform` | `x, y, scale, u, pose, flip` |
| `Napoleon`, `PontoonBridge`, `Water`, `Snow`, `Treeline` | Napoleon; boat bridge built by `k`; river; snow; fir line with snow | — |
| `FRENCH`, `RUSSIAN`, `POLISH`, `BAVARIAN`, `AUSTRIAN`, `ITALIAN`, `PRUSSIAN`, `SWISS` | Uniform colour sets | — |
| `Kutuzov`, `Cannon`, `Explosion`, `Tricolour`, `Tent` (`Battle.tsx`) | General; firing field gun (`every` frames); blast `k` 0→1; flag; tent | — |
| `Horse`, `Cossack`, `EagleStandard`, `Isba`, `SnowGround`, `Hills` | Horse (stand/walk/gallop); Cossack lancer; eagle that falls; log hut (burnt/fire); snow ground; hills | — |

The same pieces work small inside a map's `<InsetPanel>` — that is how the world-history channel uses them.

## Build notes

All SVG. `Panel` gives `x, y, W, H, ground, cx, s, sc`; figures go at `g.sc × 0.4–0.75` with feet on or just
below `ground`, smaller and higher for the far rank. Draw back to front: sky (panel), hills, far rank, effects,
ground band, front rank. Fire and smoke come from `components/Figures.tsx` (`FigureDefs` is inside `Panel`).
A new army = a new `Uniform` object; a new person = a new figure function in the same idiom (one shaded side,
1.5 outline, idle bob).

## Don'ts

- No gradients, textures or soft shading on figures — two tones and an outline only.
- No realistic faces or proportions; keep the round heads and dot eyes.
- No photos, paintings or AI images.
- Do not mix with the sepia Chinese figures (N04) in one scene.
- Keep blood off-screen; casualties are numbers on the head card.

## Credits

None for pictures — everything is drawn in code. Sound: template `SFX.swell`; house library `army_marching`,
`cannon`, `explosion_mid`, `wind_storm`, `horse_gallop` (`npm run sfx-lib`). Font: Kanit (SIL Open Font License).
