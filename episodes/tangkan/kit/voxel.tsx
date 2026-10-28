// Voxel pixel-art kit for the ต่างกันยังไง channel: pixel sprites extruded into lit 3D cubes (one InstancedMesh per
// sprite), so flat pixel characters get real light, shadows and depth of field from the 3D scene.
// A sprite is ASCII rows + a palette: "." is empty, every other letter is a colour key. Swap palette entries to
// animate (mouth open/closed, face going red or green) without new art.
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export const V = 0.07; // one pixel = 7 cm, a person (26 px) ≈ 1.8 m

export type Pal = Record<string, string>;
export type Sprite = { rows: string[]; pal: Pal };

// Deterministic noise so each voxel's colour jitters the same on every frame (pixel-art texture, no flicker).
const hash = (a: number, b: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

type Cell = { x: number; y: number; color: THREE.Color };

const cellsOf = ({ rows, pal }: Sprite, shade: number): Cell[] => {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const out: Cell[] = [];
  rows.forEach((row, r) =>
    [...row].forEach((k, c) => {
      const hex = pal[k];
      if (k === "." || !hex) return;
      const color = new THREE.Color(hex);
      // Right edge of a colour run is a step darker, left edge a touch lighter: reads as pixel-art shading.
      const right = row[c + 1] !== k;
      const left = row[c - 1] !== k;
      const n = 1 + (hash(r, c) - 0.5) * 0.08 - (right ? shade : 0) + (left ? shade * 0.4 : 0);
      color.multiplyScalar(n);
      out.push({ x: (c - (w - 1) / 2) * V, y: (h - 1 - r) * V + V / 2, color });
    }),
  );
  return out;
};

// A sprite as voxels. Origin = bottom centre of the sprite. `depth` = thickness in pixels.
export const Voxels = ({ sprite, depth = 3, shade = 0.14, opacity = 1, emissive = 0 }: { sprite: Sprite; depth?: number; shade?: number; opacity?: number; emissive?: number }) => {
  const sig = sprite.rows.join("|") + JSON.stringify(sprite.pal);
  const cells = useMemo(() => cellsOf(sprite, shade), [sig, shade]); // eslint-disable-line react-hooks/exhaustive-deps
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    cells.forEach((cell, i) => {
      o.position.set(cell.x, cell.y, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, cell.color);
    });
    m.count = cells.length;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [cells]);
  return (
    <instancedMesh key={cells.length} ref={ref} args={[undefined, undefined, cells.length]} castShadow receiveShadow>
      <boxGeometry args={[V, V, V * depth]} />
      <meshStandardMaterial roughness={0.85} transparent={opacity < 1} opacity={opacity} emissive="#ffffff" emissiveIntensity={emissive} />
    </instancedMesh>
  );
};

// ---------- People: head + body + two arms, built from parts so every character shares one rig ----------

export const HEAD = {
  cap: [
    "....hhhhhh....",
    "...hhhhhhhh...",
    "..hhhhhhhhhh..",
    "..yyyyyyyyyy..",
    ".kkkkkkkkkkkk.",
    "...gegssgeg...",
    "...ssssssss...",
    "...sMMMMMMs...",
    "....smmmms....",
    ".....ssss.....",
  ],
  short: [
    "....HHHHHH....",
    "...HHHHHHHH...",
    "..HHHHHHHHHH..",
    "..HHssssssHH..",
    "...ssssssss...",
    "...gegssgeg...",
    "...ssssssss...",
    "...sssmmsss...",
    "....ssssss....",
    ".....ssss.....",
  ],
  curly: [
    "...HHHHHHHH...",
    "..HHHHHHHHHH..",
    ".HHHHHHHHHHHH.",
    ".HHssssssssHH.",
    ".HHgegssgegHH.",
    ".HHssssssssHH.",
    ".HHsssmmsssHH.",
    "..HssssssssH..",
    "....ssssss....",
    ".....ssss.....",
  ],
  long: [
    "....HHHHHH....",
    "...HHHHHHHH...",
    "..HHHHHHHHHH..",
    "..HHssssssHH..",
    "..HgegssgegH..",
    "..HssssssssH..",
    "..HsssmmsssH..",
    "..HHssssssHH..",
    "..HH.ssss.HH..",
    "..HH..ss..HH..",
  ],
  bald: [
    "..............",
    "....ssssss....",
    "...ssssssss...",
    "..WssssssssW..",
    "..WgegssgegW..",
    "...ssssssss...",
    "...sWWWWWWs...",
    "...sssmmsss...",
    "....ssssss....",
    ".....ssss.....",
  ],
};

const BODY = {
  pants: [
    "...tttttttt...",
    "...tttddttt...",
    "...tttddttt...",
    "...tttddttt...",
    "...tttttttt...",
    "...tttddttt...",
    "...tttttttt...",
    "...bbbbbbbb...",
    "...pppppppp...",
    "...pppppppp...",
    "...ppp..ppp...",
    "...ppp..ppp...",
    "...ppp..ppp...",
    "...ppp..ppp...",
    "...ppp..ppp...",
    "..fff....fff..",
  ],
  skirt: [
    "...tttttttt...",
    "...tttddttt...",
    "...tttttttt...",
    "...tttddttt...",
    "...tttttttt...",
    "...tttddttt...",
    "...tttttttt...",
    "...bbbbbbbb...",
    "..kkkkkkkkkk..",
    "..kkkkkkkkkk..",
    ".kkkkkkkkkkkk.",
    "....ss..ss....",
    "....ss..ss....",
    "....ss..ss....",
    "....ss..ss....",
    "...fff..fff...",
  ],
};

const ARM = ["ttt", "ttt", "ttt", "ttt", "ttt", "ttt", "ttt", "www", ".w."];

export type Person = {
  head: keyof typeof HEAD;
  body: keyof typeof BODY;
  pal: Pal; // s skin, e eye, g glasses (or skin), m mouth (or skin), M mustache, H hair, h hat, y band, k brim/skirt, t top, d detail, b belt, p pants, f shoes, w hand, W white hair
};

const BODY_ROWS = 16;
const HEAD_ROWS = 10;

// One person. `armL` / `armR` = arm angle in degrees (0 hanging, -100 pointing to screen-left, +100 screen-right).
// `pal` overrides colours for this frame (mouth open, red face). `tiltX` falls the person backwards.
export const PersonVox = ({
  who,
  pal,
  armL = 0,
  armR = 0,
  squash = 1,
  opacity = 1,
}: {
  who: Person;
  pal?: Pal;
  armL?: number;
  armR?: number;
  squash?: number;
  opacity?: number;
}) => {
  const p = { ...who.pal, ...pal };
  const shoulderY = (BODY_ROWS - 0.5) * V;
  const head: Sprite = { rows: HEAD[who.head], pal: p };
  const body: Sprite = { rows: BODY[who.body], pal: p };
  const arm: Sprite = { rows: ARM, pal: p };
  const armDx = 5.5 * V;
  return (
    <group scale={[1 / Math.sqrt(squash), squash, 1]}>
      <Voxels sprite={body} opacity={opacity} />
      <group position={[0, BODY_ROWS * V, 0.01]}>
        <Voxels sprite={head} opacity={opacity} />
      </group>
      {/* Arms hang from a pivot at the shoulder: the sprite is shifted down so rotation turns about its top. */}
      <group position={[-armDx, shoulderY, V]} rotation={[0, 0, (armL * Math.PI) / 180]}>
        <group position={[0, -ARM.length * V + V / 2, 0]}>
          <Voxels sprite={arm} opacity={opacity} />
        </group>
      </group>
      <group position={[armDx, shoulderY, V]} rotation={[0, 0, (armR * Math.PI) / 180]}>
        <group position={[0, -ARM.length * V + V / 2, 0]}>
          <Voxels sprite={arm} opacity={opacity} />
        </group>
      </group>
    </group>
  );
};

export const PERSON_H = (BODY_ROWS + HEAD_ROWS) * V;

// ---------- Cast ----------
const SKIN = "#e2a877";
const MOUTH_SHUT = { m: SKIN };

export const DOORMAN: Person = {
  head: "cap",
  body: "pants",
  pal: { s: SKIN, e: "#1a1410", g: SKIN, ...MOUTH_SHUT, M: "#3b2414", h: "#a8202c", y: "#e8b83a", k: "#1d1a22", t: "#b3222e", d: "#f0c040", b: "#1d1a22", p: "#20243f", f: "#141218", w: "#f4f1ea" },
};
export const SALARYMAN: Person = {
  head: "short",
  body: "pants",
  pal: { s: SKIN, e: "#1a1410", g: "#2a2a30", ...MOUTH_SHUT, H: "#1f1712", t: "#f1f0ec", d: "#2b5fae", b: "#2a2420", p: "#3a3e48", f: "#1b1714", w: SKIN },
};
export const AUNTIE: Person = {
  head: "curly",
  body: "skirt",
  pal: { s: "#d99f72", e: "#1a1410", g: "#d99f72", m: "#c0485a", H: "#3a2a26", t: "#8a3fa8", d: "#f1c95a", b: "#5d2a73", k: "#6a2e86", f: "#c0485a", w: "#d99f72" },
};
export const NERD: Person = {
  head: "short",
  body: "pants",
  pal: { s: "#f0bf92", e: "#1a1410", g: "#141414", ...{ m: "#f0bf92" }, H: "#5a3a1e", t: "#3f8f5a", d: "#2e6b42", b: "#2a2420", p: "#7a6a4e", f: "#2a2018", w: "#f0bf92" },
};
export const GIRL: Person = {
  head: "long",
  body: "skirt",
  pal: { s: "#f2c39b", e: "#1a1410", g: "#f2c39b", m: "#d4606a", H: "#1c1414", t: "#f2c53d", d: "#e0a92a", b: "#3a3a48", k: "#3d4f86", f: "#f4f1ea", w: "#f2c39b" },
};
export const GRANDPA: Person = {
  head: "bald",
  body: "pants",
  pal: { s: "#d39a6c", e: "#1a1410", g: "#d39a6c", m: "#d39a6c", W: "#e8e6e0", t: "#5b7fa6", d: "#e8e6e0", b: "#3b3026", p: "#8a7c66", f: "#3b3026", w: "#d39a6c" },
};

// Mouth open while talking (palette swap, no new art).
export const mouthOpen = (who: Person, open: boolean): Pal => ({ m: open ? "#5a1a1a" : who.pal.m });
export const faceTint = (hex: string): Pal => ({ s: hex });

// ---------- Cat (sits, front view) ----------
const CAT_ROWS = {
  calm: [
    "..o........o..",
    ".ooo......ooo.",
    ".oOoo....ooOo.",
    ".oooooooooooo.",
    "oooooooooooooo",
    "oooeeooooeeooo",
    "oooeeooooeeooo",
    "oooooonnoooooo",
    ".ooooowwooooo.",
    "..oooooooooo..",
    "..oOoooooOoo..",
    ".ooOoooooOooo.",
    ".oooowwwwoooo.",
    ".oooowwwwoooo.",
    ".oooowwwwoooot",
    "..wwoooooww.tt",
  ],
  shock: [
    "..o........o..",
    ".ooo......ooo.",
    ".oOoo....ooOo.",
    ".oooooooooooo.",
    "ooxxxooooxxxoo",
    "ooxexooooxexoo",
    "ooxxxooooxxxoo",
    "oooooonnoooooo",
    ".oooookkooooo.",
    "..oooookoooo..",
    "..oOoooooOoo..",
    ".ooOoooooOooo.",
    ".oooowwwwoooo.",
    ".oooowwwwoooo.",
    ".oooowwwwoooot",
    "..wwoooooww.tt",
  ],
};
const CAT_PAL: Pal = { o: "#e08a3a", O: "#b8622a", e: "#1a1410", x: "#f6f2e6", n: "#e07080", w: "#f6efe2", k: "#5a1a1a", t: "#c9702e" };
export const CatVox = ({ shock = false }: { shock?: boolean }) => <Voxels sprite={{ rows: CAT_ROWS[shock ? "shock" : "calm"], pal: CAT_PAL }} depth={4} />;

// ---------- Potted plant: pot + leaves; `wilt` 0–1 droops the leaves and browns them ----------
export const PlantVox = ({ wilt = 0 }: { wilt?: number }) => {
  const leaf = new THREE.Color("#4f9a3a").lerp(new THREE.Color("#8a7a3a"), wilt).getStyle();
  const dark = new THREE.Color("#2f6e2a").lerp(new THREE.Color("#6a5a2a"), wilt).getStyle();
  const pot: Sprite = {
    rows: ["cccccccc", "CCCCCCCC", ".cccccc.", ".cccccc.", ".cccccc.", "..cccc.."],
    pal: { c: "#b8653a", C: "#8a4626" },
  };
  const blade: Sprite = { rows: [".l.", "lLl", "lLl", "lLl", "lLl", ".L.", ".L.", ".L."], pal: { l: leaf, L: dark } };
  const angles = [-38, -18, 4, 18, 38];
  return (
    <group>
      <Voxels sprite={pot} depth={8} />
      {angles.map((a, i) => (
        <group key={i} position={[(i - 2) * V * 0.8, 6 * V, ((i % 2) - 0.5) * V * 2]} rotation={[0, 0, ((a + Math.sign(a) * wilt * 75) * Math.PI) / 180]}>
          <Voxels sprite={blade} depth={2} />
        </group>
      ))}
    </group>
  );
};
