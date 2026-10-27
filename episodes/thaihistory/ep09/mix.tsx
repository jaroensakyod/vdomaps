import { Bed as BaseBed, Hit as BaseHit, SFX } from "../../../components/Sound";
import { VOICE, VOICE_FLOW } from "./beatsKit";

// Episode 9 mix, same rules as episodes 6–8: long cross-fading beds ducked through the narration, one-shots lower under
// the voice — no stutter.
const UNDER_VO = 0.5;
const ONE_SHOT = 0.8;
const BED = 0.7;
const BED_DUCK = 0.45;
export const UI_GAIN = 0.6;

const underVoice = (f: number) => VOICE.some(([a, b]) => f >= a - 4 && f <= b + 4);

export const Hit = ({ id, at, volume = 0.5 }: { id: string; at: number; volume?: number }) => (
  <BaseHit id={id} at={at} volume={volume * ONE_SHOT * (underVoice(at) ? UNDER_VO : 1)} />
);

export const Bed = ({ id, from, to, volume = 0.2 }: { id: string; from: number; to: number; volume?: number }) => (
  <BaseBed id={id} from={from} to={to} volume={volume * BED} duck={BED_DUCK} fade={30} voice={VOICE_FLOW} />
);

export { SFX };
