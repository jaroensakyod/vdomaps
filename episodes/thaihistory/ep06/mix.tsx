import { Bed as BaseBed, Hit as BaseHit, SFX } from "../../../components/Sound";
import { VOICE, VOICE_FLOW } from "./beatsKit";

// Episode mix (user note 24 Oct 2026: no stutter). Beds are long, fade in/out over 30 frames and overlap the next
// bed by ≥ 30 frames, so ambience cross-fades instead of cutting; they duck gently under the voice (not pumping).
// One-shots sit lower when they land under narration — the voice always wins.
const UNDER_VO = 0.5;
const ONE_SHOT = 0.8;
const BED = 0.7;
const BED_DUCK = 0.45;
export const UI_GAIN = 0.6;

const underVoice = (f: number) => VOICE.some(([a, b]) => f >= a - 4 && f <= b + 4);

export const Hit = ({ id, at, volume = 0.5 }: { id: string; at: number; volume?: number }) => (
  <BaseHit id={id} at={at} volume={volume * ONE_SHOT * (underVoice(at) ? UNDER_VO : 1)} />
);

// Beds always get the long fade and the episode's voice spans.
export const Bed = ({ id, from, to, volume = 0.2 }: { id: string; from: number; to: number; volume?: number }) => (
  <BaseBed id={id} from={from} to={to} volume={volume * BED} duck={BED_DUCK} fade={30} voice={VOICE_FLOW} />
);

export { SFX };
