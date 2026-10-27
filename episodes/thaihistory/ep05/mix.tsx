import { Bed as BaseBed, Hit as BaseHit, SFX } from "../../../components/Sound";
import { VOICE } from "./beatsKit";

// Episode mix (user note 23 Oct 2026: effects a little loud, sometimes masking the voice). Chapters import Bed/Hit
// from here: every one-shot is lowered, more so when it lands under narration, and beds sit lower and duck deeper.
const UNDER_VO = 0.5;
const ONE_SHOT = 0.8;
const BED = 0.7;
const BED_DUCK = 0.3;
export const UI_GAIN = 0.7; // synthetic UI sounds (Ep.tsx `sfx`)

const underVoice = (f: number) => VOICE.some(([a, b]) => f >= a - 4 && f <= b + 4);

export const Hit = ({ id, at, volume = 0.5 }: { id: string; at: number; volume?: number }) => (
  <BaseHit id={id} at={at} volume={volume * ONE_SHOT * (underVoice(at) ? UNDER_VO : 1)} />
);

export const Bed = ({ volume = 0.25, ...p }: Parameters<typeof BaseBed>[0]) => <BaseBed {...p} volume={volume * BED} duck={BED_DUCK} />;

export { SFX };
