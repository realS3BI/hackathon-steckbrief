import { paces, type MusicChoices } from "./knowledge";

export type Note = {
  midi: number;
  start: number;
  duration: number;
  gain: number;
  voice: MusicChoices["sound"] | "bass" | "kick" | "tick";
  beat: number;
};

export type Composition = {
  notes: Note[];
  melody: Note[];
  bpm: number;
  duration: number;
  beats: number;
};

// A small procedural composer, not a trained AI model. Kept separate from the UI
// so a future provider can replace generation without changing the learning flow.
export function compose(choices: MusicChoices, seed: number, bars = 8, layer?: "melody" | "beat"): Composition {
  let state = seed >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const bpm = paces.find(item => item.value === choices.pace)!.bpm;
  const seconds = 60 / bpm;
  const beats = bars * 4;
  const scale = choices.mood === "dreamy" ? [0, 3, 5, 7, 10] : [0, 2, 4, 7, 9];
  const root = choices.mood === "bright" ? 60 : 48;
  const stride = choices.mood === "bright" ? 0.5 : 1;
  const motif = Array.from({ length: 8 }, () => Math.floor(random() * scale.length));
  const melody: Note[] = [];
  const backing: Note[] = [];
  for (let beat = 0; beat < beats; beat += stride) {
    if (choices.mood !== "bright" && beat % 4 === 3) continue;
    const index = motif[Math.floor(beat / stride) % motif.length];
    const last = beat >= beats - 1;
    melody.push({ midi: root + 12 + (last ? 0 : scale[index]), start: beat * seconds, duration: seconds * (choices.mood === "dreamy" ? 1.4 : stride * 0.85), gain: 0.21, voice: choices.sound, beat });
  }
  for (let bar = 0; bar < bars; bar++) {
    const chordRoot = root + [0, -3, -5, 0][bar % 4];
    for (const interval of [0, 7, 12]) {
      backing.push({ midi: chordRoot + interval, start: bar * 4 * seconds, duration: 3.8 * seconds, gain: interval === 0 ? 0.12 : 0.045, voice: "bass", beat: bar * 4 });
    }
  }
  const drums: Note[] = [];
  if (choices.beat || layer === "beat") {
    for (let beat = 0; beat < beats; beat++) {
      drums.push({ midi: 36, start: beat * seconds, duration: 0.15, gain: beat % 4 === 0 ? 0.22 : 0.14, voice: "kick", beat });
      drums.push({ midi: 80, start: (beat + 0.5) * seconds, duration: 0.045, gain: 0.035, voice: "tick", beat: beat + 0.5 });
    }
  }
  const notes = layer === "melody" ? melody : layer === "beat" ? drums : [...melody, ...backing, ...drums];
  return { notes, melody, bpm, duration: beats * seconds + 0.7, beats };
}

function tone(voice: Note["voice"], phase: number, time: number, progress: number) {
  switch (voice) {
    case "keys": return (Math.sin(phase) + 0.3 * Math.sin(phase * 2) + 0.1 * Math.sin(phase * 3)) * Math.exp(-3 * progress);
    case "bells": return (Math.sin(phase) + 0.35 * Math.sin(phase * 2.76) + 0.15 * Math.sin(phase * 5.4)) * Math.exp(-4 * progress);
    case "air": return (Math.sin(phase) + 0.12 * Math.sin(phase * 2)) * (0.95 + 0.05 * Math.sin(time * 30));
    case "bass": return Math.sin(phase) * Math.exp(-1.5 * progress);
    case "kick": return Math.sin(2 * Math.PI * (48 * time + 6 * (1 - Math.exp(-time * 35)))) * Math.exp(-25 * time);
    case "tick": return (Math.sin(phase * 7.13) + Math.sin(phase * 11.71)) * Math.exp(-90 * time);
  }
}

export async function renderWav(composition: Composition, signal?: AbortSignal): Promise<Blob> {
  const sampleRate = 22050;
  const samples = new Float32Array(Math.ceil(composition.duration * sampleRate));
  for (let n = 0; n < composition.notes.length; n++) {
    signal?.throwIfAborted();
    const note = composition.notes[n];
    const offset = Math.round(note.start * sampleRate);
    const length = Math.min(Math.ceil(note.duration * sampleRate), samples.length - offset);
    const frequency = 440 * 2 ** ((note.midi - 69) / 12);
    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      const attack = Math.min(1, time / (note.voice === "air" ? 0.07 : 0.009));
      const release = Math.min(1, (length - i) / (sampleRate * 0.06));
      samples[offset + i] += tone(note.voice, 2 * Math.PI * frequency * time, time, i / length) * note.gain * attack * release;
    }
    // Yield between groups of notes so cancel and navigation remain responsive.
    if (n % 12 === 0) await new Promise<void>(resolve => setTimeout(resolve, 0));
  }
  signal?.throwIfAborted();
  const data = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(data);
  const word = (offset: number, value: string) => { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)); };
  word(0, "RIFF"); view.setUint32(4, data.byteLength - 8, true); word(8, "WAVE");
  word(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  word(36, "data"); view.setUint32(40, samples.length * 2, true);
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  const scale = peak > 0.7 ? 0.7 / peak : 1;
  for (let i = 0; i < samples.length; i++) view.setInt16(44 + i * 2, Math.round(samples[i] * scale * 32767), true);
  return new Blob([data], { type: "audio/wav" });
}
