export type Word = { w: string; s: number; e: number };
export type Timing = { id: string; file: string; sec: number; words?: Word[] };
// speed: TTS tempo for this beat (1.15 = 15% faster) · pause: seconds of silence before it
export type BeatText = { id: string; text: string; caption?: string; speaker?: string; voice?: string; speed?: number; pause?: number };
export type Layout = { fps: number; lead: number; gap: number; tail: number };
export type Beat = Timing & { start: number; len: number; end: number; text: string; spoken: string; speaker?: string };
export type Cue = { text: string; start: number; end: number };

export declare const LAYOUT: Layout;
export declare const buildBeats: (timing: Timing[], beats?: BeatText[], layout?: Partial<Layout>) => Beat[];
export declare const totalFrames: (beats: Beat[], layout?: Partial<Layout>) => number;
export declare const chunks: (text: string, maxChars?: number) => string[];
export declare const cues: (o: { text: string; spoken?: string; words?: Word[]; sec: number; maxChars?: number }) => Cue[];
