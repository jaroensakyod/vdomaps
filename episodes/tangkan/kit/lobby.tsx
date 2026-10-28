// Hotel elevator lobby set for ต่างกันยังไง EP.1: pixel-textured floor and walls, two elevators with sliding doors
// and blue signs, ceiling lamps (emissive, picked up by bloom), and voxel gas clouds.
import { useMemo, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { V } from "./voxel";

// ---------- Pixel textures (drawn once on a small canvas, magnified with NearestFilter) ----------
const pixelTex = (w: number, h: number, draw: (x: CanvasRenderingContext2D) => void, repeat: [number, number] = [1, 1]) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestMipmapNearestFilter;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

let seed = 7;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const speckle = (x: CanvasRenderingContext2D, w: number, h: number, base: [number, number, number], amt: number) => {
  for (let i = 0; i < w; i++)
    for (let j = 0; j < h; j++) {
      const n = 1 + (rnd() - 0.5) * amt;
      x.fillStyle = `rgb(${base[0] * n},${base[1] * n},${base[2] * n})`;
      x.fillRect(i, j, 1, 1);
    }
};

// Checked marble floor: 16 px per tile, 2×2 tiles per texture.
const floorTex = () =>
  pixelTex(
    32,
    32,
    (x) => {
      for (let ty = 0; ty < 2; ty++)
        for (let tx = 0; tx < 2; tx++) {
          const light = (tx + ty) % 2 === 0;
          for (let i = 0; i < 16; i++)
            for (let j = 0; j < 16; j++) {
              const n = 1 + (rnd() - 0.5) * 0.07;
              const b = light ? [214, 196, 168] : [150, 112, 82];
              const edge = i === 15 || j === 15 ? 0.82 : 1;
              x.fillStyle = `rgb(${b[0] * n * edge},${b[1] * n * edge},${b[2] * n * edge})`;
              x.fillRect(tx * 16 + i, ty * 16 + j, 1, 1);
            }
        }
    },
    [8, 6],
  );

// Wall: cream plaster on top, wood wainscot below with a darker rail.
const wallTex = (rep: number) =>
  pixelTex(
    16,
    48,
    (x) => {
      speckle(x, 16, 30, [232, 220, 196], 0.06);
      x.save();
      x.translate(0, 30);
      speckle(x, 16, 18, [122, 78, 48], 0.1);
      x.restore();
      x.fillStyle = "rgb(92,56,34)";
      x.fillRect(0, 30, 16, 2);
      x.fillStyle = "rgb(150,100,64)";
      for (let i = 0; i < 16; i += 8) x.fillRect(i, 33, 1, 15);
    },
    [rep, 1],
  );

const steelTex = () =>
  pixelTex(12, 32, (x) => {
    for (let i = 0; i < 12; i++)
      for (let j = 0; j < 32; j++) {
        const n = 0.92 + (i / 12) * 0.16 + (rnd() - 0.5) * 0.04;
        x.fillStyle = `rgb(${168 * n},${172 * n},${180 * n})`;
        x.fillRect(i, j, 1, 1);
      }
  });

// Blue street-sign style label (like a hotel wayfinding sign), drawn with the loaded Thai font.
export const signTex = (text: string, font: string) => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 192;
  const x = c.getContext("2d")!;
  x.fillStyle = "#1d3f9a";
  x.fillRect(0, 0, 512, 192);
  x.strokeStyle = "#f4f4f4";
  x.lineWidth = 10;
  x.strokeRect(14, 14, 484, 164);
  x.fillStyle = "#ffffff";
  x.font = `700 112px ${font}`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(text, 256, 104);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

export const ROOM = { w: 6.6, d: 7, h: 3.4, backZ: -3 };
export const ELEV = { left: -1.45, right: 1.45, w: 1.15, h: 2.25 };

// Rectangles [x0, x1, y0, y1] covering the back wall except the two door openings.
const backPieces = () => {
  const { w, h } = ROOM;
  const half = ELEV.w / 2;
  const L = [ELEV.left - half, ELEV.left + half];
  const R = [ELEV.right - half, ELEV.right + half];
  return [
    [-w / 2, L[0], 0, h],
    [L[1], R[0], 0, h],
    [R[1], w / 2, 0, h],
    [L[0], L[1], ELEV.h, h],
    [R[0], R[1], ELEV.h, h],
  ];
};

// A wall rectangle whose texture keeps the same pixel scale and the wainscot at the same height as its neighbours.
const WallPiece = ({ x0, x1, y0, y1, z }: { x0: number; x1: number; y0: number; y1: number; z: number }) => {
  const tex = useMemo(() => {
    const t = wallTex(1).clone();
    const tileW = 0.7; // metres per texture repeat across
    t.repeat.set((x1 - x0) / tileW, (y1 - y0) / ROOM.h);
    t.offset.set(x0 / tileW, y0 / ROOM.h);
    t.needsUpdate = true;
    return t;
  }, [x0, x1, y0, y1]);
  return (
    <mesh position={[(x0 + x1) / 2, (y0 + y1) / 2, z]} receiveShadow>
      <planeGeometry args={[x1 - x0, y1 - y0]} />
      <meshStandardMaterial map={tex} roughness={0.9} />
    </mesh>
  );
};

export const Room = () => {
  const tex = useMemo(() => ({ floor: floorTex(), back: wallTex(9), side: wallTex(10) }), []);
  const { w, d, h, backZ } = ROOM;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, backZ + d / 2]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={tex.floor} roughness={0.35} metalness={0.05} />
      </mesh>
      {/* Back wall in pieces around the two elevator openings (so the cabins show when the doors open). */}
      {backPieces().map(([x0, x1, y0, y1], i) => (
        <WallPiece key={i} x0={x0} x1={x1} y0={y0} y1={y1} z={backZ} />
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * w) / 2, h / 2, backZ + d / 2]} rotation={[0, (-s * Math.PI) / 2, 0]} receiveShadow>
          <planeGeometry args={[d, h]} />
          <meshStandardMaterial map={tex.side} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, h, backZ + d / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#efe6d4" roughness={1} />
      </mesh>
      {/* Ceiling lamps: emissive panels (bloom) + warm point lights. */}
      {[-1.6, 1.6].map((x) =>
        [-1.6, 0.8].map((z) => (
          <group key={`${x}${z}`} position={[x, h - 0.03, z]}>
            <mesh>
              <boxGeometry args={[0.7, 0.05, 0.7]} />
              <meshStandardMaterial color="#fff6e0" emissive="#fff0cc" emissiveIntensity={3.2} toneMapped={false} />
            </mesh>
            <pointLight position={[0, -0.25, 0]} intensity={2.6} distance={6} decay={1.4} color="#ffe2b0" />
          </group>
        )),
      )}
    </group>
  );
};

// One elevator in the back wall. `open` 0–1 slides the doors apart; `inside` lights the cabin.
export const Elevator = ({ x, open, sign, inside = 1 }: { x: number; open: number; sign: THREE.Texture | null; inside?: number }) => {
  const steel = useMemo(steelTex, []);
  const { w, h } = ELEV;
  const z = ROOM.backZ;
  const half = w / 2;
  return (
    <group position={[x, 0, z]}>
      {/* Cabin behind the opening */}
      {/* Cabin behind the opening: back, sides, ceiling, floor (no front face, so a camera inside can look out). */}
      {(
        [
          [[0, h / 2, -1.6], [0, 0, 0], [w, h]],
          [[-half, h / 2, -0.8], [0, Math.PI / 2, 0], [1.6, h]],
          [[half, h / 2, -0.8], [0, -Math.PI / 2, 0], [1.6, h]],
          [[0, h, -0.8], [Math.PI / 2, 0, 0], [w, 1.6]],
          [[0, 0.002, -0.8], [-Math.PI / 2, 0, 0], [w, 1.6]],
        ] as [[number, number, number], [number, number, number], [number, number]][]
      ).map(([p, r, s], i) => (
        <mesh key={i} position={p} rotation={r} receiveShadow>
          <planeGeometry args={s} />
          <meshStandardMaterial color={i === 4 ? "#6a4a32" : "#c9a46a"} emissive="#ffcf8a" emissiveIntensity={(i === 4 ? 0.05 : 0.22) * inside} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <pointLight position={[0, h - 0.2, -0.8]} intensity={1.8 * inside * open} distance={3} color="#ffd9a0" />
      {/* Brass frame */}
      {[
        [-(half + 0.06), h / 2, 0.12, h + 0.12],
        [half + 0.06, h / 2, 0.12, h + 0.12],
        [0, h + 0.06, w + 0.24, 0.12],
      ].map(([px, py, sx, sy], i) => (
        <mesh key={i} position={[px, py, 0.03]} castShadow>
          <boxGeometry args={[sx, sy, 0.1]} />
          <meshStandardMaterial color="#c8a04a" metalness={0.75} roughness={0.3} />
        </mesh>
      ))}
      {/* Doors */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (half / 2 + open * half * 0.98), h / 2, 0.02]} castShadow>
          <boxGeometry args={[half - 0.01, h, 0.05]} />
          <meshStandardMaterial map={steel} metalness={0.55} roughness={0.35} />
        </mesh>
      ))}
      {/* Floor indicator + call button */}
      <mesh position={[0, h + 0.28, 0.02]}>
        <boxGeometry args={[0.3, 0.12, 0.03]} />
        <meshStandardMaterial color="#220c00" emissive="#ff9a2a" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <mesh position={[half + 0.3, 1.1, 0.02]}>
        <boxGeometry args={[0.12, 0.26, 0.03]} />
        <meshStandardMaterial color="#c8a04a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Sign */}
      {sign ? (
        <mesh position={[0, h + 0.72, 0.06]}>
          <planeGeometry args={[1.25, 0.47]} />
          <meshStandardMaterial map={sign} roughness={0.6} emissive="#ffffff" emissiveMap={sign} emissiveIntensity={0.18} />
        </mesh>
      ) : null}
    </group>
  );
};

// ---------- Gas: a cloud of translucent green voxels ----------
// Each puff flies from `origin` along a random direction (biased by `drift`), grows, and fades. `t` = frames since
// release. `flat` keeps it low to the floor (the silent creeping kind).
type Puff = { dir: THREE.Vector3; size: number; delay: number; speed: number; wob: number };
export const Gas = ({
  t,
  origin,
  count = 40,
  spread = 1,
  drift = [0, 0.4, 0],
  life = 60,
  flat = false,
  seedN = 1,
  color = "#9bd94a",
  hold = false,
  opacity = 0.42,
}: {
  t: number;
  origin: [number, number, number];
  count?: number;
  spread?: number;
  drift?: [number, number, number];
  life?: number;
  flat?: boolean;
  seedN?: number;
  color?: string;
  hold?: boolean;
  opacity?: number;
}) => {
  const puffs = useMemo<Puff[]>(() => {
    let s = seedN * 9301 + 49297;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: count }, () => {
      const a = r() * Math.PI * 2;
      const e = flat ? r() * 0.12 : (r() - 0.3) * 1.2;
      return {
        dir: new THREE.Vector3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)).add(new THREE.Vector3(...drift)),
        size: (1.2 + r() * 2.4) * V,
        delay: r() * 10,
        speed: 0.6 + r() * 0.8,
        wob: r() * 6,
      };
    });
  }, [count, flat, seedN, drift[0], drift[1], drift[2]]); // eslint-disable-line react-hooks/exhaustive-deps
  const ref = useRef<THREE.InstancedMesh>(null);
  const fade = hold ? 1 : Math.max(0, Math.min(1, t / 6, (life - t) / 20));
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    puffs.forEach((p, i) => {
      const k = Math.max(0, t - p.delay);
      const go = 1 - Math.exp(-k / (18 / p.speed));
      const grow = Math.min(1, k / 8) * (1 + go * 1.4);
      o.position.set(
        origin[0] + p.dir.x * spread * go + Math.sin(k * 0.08 + p.wob) * 0.03,
        Math.max(p.size / 2, origin[1] + p.dir.y * spread * go + (flat ? 0 : k * 0.002)),
        origin[2] + p.dir.z * spread * go,
      );
      o.scale.setScalar(Math.max(0.001, p.size * grow));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  if (fade <= 0) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, puffs.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} transparent opacity={opacity * fade} depthWrite={false} emissive={color} emissiveIntensity={0.25} roughness={1} />
    </instancedMesh>
  );
};
