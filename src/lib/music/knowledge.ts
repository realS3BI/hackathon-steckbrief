export const moods = [
  { value: "calm", label: "Calm", description: "Room to breathe", color: "lake" },
  { value: "bright", label: "Bright", description: "A little sunshine", color: "sun" },
  { value: "dreamy", label: "Dreamy", description: "Let your mind wander", color: "lilac" },
] as const;

export const paces = [
  { value: "slow", label: "Slow", description: "72 beats a minute", bpm: 72 },
  { value: "steady", label: "Steady", description: "96 beats a minute", bpm: 96 },
  { value: "lively", label: "Lively", description: "120 beats a minute", bpm: 120 },
] as const;

export const sounds = [
  { value: "keys", label: "Soft keys", description: "Round, gently fading notes" },
  { value: "bells", label: "Bells", description: "Clear notes that ring out" },
  { value: "air", label: "Airy flute", description: "Smooth, flowing notes" },
] as const;

export type MusicChoices = {
  mood: (typeof moods)[number]["value"];
  pace: (typeof paces)[number]["value"];
  sound: (typeof sounds)[number]["value"];
  beat: boolean;
};

export const defaultChoices: MusicChoices = { mood: "calm", pace: "steady", sound: "keys", beat: true };

export type Lesson = {
  id: string;
  title: string;
  question: string;
  text: string;
  takeaway: string;
  examples: { label: string; description: string; choices: Partial<MusicChoices>; layer?: "melody" | "beat" }[];
};

export const lessons: Lesson[] = [
  {
    id: "tempo", title: "Tempo", question: "How fast does music move?",
    text: "Tempo is the speed of the beat. A slow beat leaves more space. A fast beat can make you want to move. Try the same little tune at two speeds.",
    takeaway: "There is no right speed. Pick one that feels good to you.",
    examples: [
      { label: "A slow stroll", description: "72 beats a minute. The notes have more time between them.", choices: { pace: "slow" } },
      { label: "A lively walk", description: "120 beats a minute. The same notes follow each other faster.", choices: { pace: "lively" } },
    ],
  },
  {
    id: "rhythm", title: "Rhythm", question: "What gives music a beat?",
    text: "Rhythm is the pattern of sounds and spaces. A regular drum beat can help you follow a tune. Music can also flow without drums. Compare both ways.",
    takeaway: "A beat is optional. Your music can have one, or leave it out.",
    examples: [
      { label: "With a gentle beat", description: "A low drum marks each beat. A soft tick sits between the beats.", choices: { beat: true } },
      { label: "Without drums", description: "The tune and soft backing notes play on their own.", choices: { beat: false } },
    ],
  },
  {
    id: "melody", title: "Melody", question: "What is the tune I remember?",
    text: "A melody is a line of notes. Some notes go higher, some lower, and some repeat. You might hum a melody after a song has finished. It can stand alone or have other sounds behind it.",
    takeaway: "You do not need to read notes or sing to make a melody here.",
    examples: [
      { label: "Just the melody", description: "One line of notes, with no backing sounds or drums.", choices: { beat: false }, layer: "melody" },
      { label: "Melody with company", description: "The same tune with low backing notes and a gentle beat.", choices: { beat: true } },
    ],
  },
  {
    id: "sound", title: "Sound", question: "Why do instruments sound different?",
    text: "Two instruments can play the same note and still sound different. A bell rings out. A flute holds a smooth sound. The kind of sound you choose gives your piece its own character.",
    takeaway: "Try a different sound while keeping the same tune.",
    examples: [
      { label: "Ringing bells", description: "Bright notes start clearly, then slowly fade.", choices: { sound: "bells" } },
      { label: "Flowing air", description: "Soft flute-like notes start gently and hold their sound.", choices: { sound: "air" } },
    ],
  },
  {
    id: "mood", title: "Mood", question: "What do I want my music to feel like?",
    text: "Music can remind us of a place, a person, or a feeling. Here, a mood changes the notes and their spacing. People can feel differently about the same music. Your own reaction matters.",
    takeaway: "Choose a starting mood. You can change it whenever you like.",
    examples: [
      { label: "A quiet moment", description: "Calm. A lower tune with longer, more widely spaced notes.", choices: { mood: "calm" } },
      { label: "A brighter moment", description: "Bright. Higher notes and a busier tune.", choices: { mood: "bright" } },
    ],
  },
];

export function describeChoices(choices: MusicChoices) {
  const mood = moods.find(item => item.value === choices.mood)!;
  const pace = paces.find(item => item.value === choices.pace)!;
  const sound = sounds.find(item => item.value === choices.sound)!;
  return `${mood.label} instrumental music. ${sound.label} at ${pace.bpm} beats a minute. ${choices.beat ? "A gentle drum beat underneath." : "No drums."}`;
}
