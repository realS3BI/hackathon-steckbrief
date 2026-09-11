import { z } from "zod";

export const colors = ["pine", "sun", "lake", "lilac", "clay", "berry", "sky", "coral", "mint"] as const;
export const avatars = ["headphones", "piano", "mic", "radio", "mountain", "sparkles", "guitar", "drum", "music", "waveform", "cableCar", "accessibility"] as const;

export const sections = [
  { title: "This is me", subtitle: "Meet the person behind the name tag.", short: "Person" },
  { title: "My sound", subtitle: "Favorite songs, musical habits, and honest confessions.", short: "Music" },
  { title: "Our challenge", subtitle: "Making music more accessible. What drives you?", short: "Challenge" },
  { title: "Fun", subtitle: "Mountain air, good stories, and a little nonsense.", short: "Fun" },
] as const;

export const questions = [
  { key: "origin", section: 0, label: "Where are you originally from?", placeholder: "A place, a region, or a short story", max: 120 },
  { key: "home", section: 0, label: "Where do you live now?", placeholder: "Your current home base", max: 120 },
  { key: "role", section: 0, label: "What else do you do?", placeholder: "Work, studies, or a project close to your heart", max: 180 },
  { key: "skills", section: 0, label: "What do you bring to the team?", placeholder: "Design, Python, sharp questions, excellent coffee", max: 200 },
  { key: "song", section: 1, label: "Which song describes you right now?", placeholder: "Song title and artist", max: 160 },
  { key: "songUrl", section: 1, label: "Add a link to your song", placeholder: "https://open.spotify.com/... or another music link", max: 500 },
  { key: "music", section: 1, label: "What is your relationship with music?", placeholder: "Fifteen years of piano? Shower concerts? Both count.", max: 500, multiline: true },
  { key: "guiltyPleasure", section: 1, label: "What is your musical guilty pleasure?", placeholder: "No one gets kicked out of the band for this.", max: 160 },
  { key: "instrument", section: 1, label: "If you were an instrument, which one would you be?", placeholder: "And why the triangle, of all things?", max: 200 },
  { key: "motivation", section: 2, label: "Why did you choose this challenge?", placeholder: "What drew you to Accessibility & Music?", max: 800, multiline: true },
  { key: "source", section: 2, label: "How did you hear about the hackathon?", placeholder: "A friend, work, social media, or pure chance?", max: 300, multiline: true },
  { key: "barrier", section: 2, label: "Which barrier to making music would you remove?", placeholder: "Think of a specific person or situation.", max: 800, multiline: true },
  { key: "ai", section: 2, label: "What should AI do for music, and what should it leave alone?", placeholder: "A wish, a hope, or some healthy skepticism", max: 800, multiline: true },
  { key: "learn", section: 2, label: "What would you like to learn this weekend?", placeholder: "A skill, a perspective, or a new instrument", max: 400, multiline: true },
  { key: "superpower", section: 3, label: "What is your completely unnecessary superpower?", placeholder: "Plugging in a USB cable correctly on the first try", max: 200 },
  { key: "cableCar", section: 3, label: "What went through your head in the cable car?", placeholder: "Did I pack my charging cable?", max: 300, multiline: true },
  { key: "conversation", section: 3, label: "Have you had a great conversation with anyone yet? If so, what was it about?", placeholder: "A person, an idea, or the tangent that stuck with you", max: 600, multiline: true },
  { key: "fuel", section: 3, label: "What keeps you going during the hackathon?", placeholder: "Coffee, mountain air, snacks, eight hours of sleep", max: 160 },
  { key: "motto", section: 3, label: "What is your motto for this weekend?", placeholder: "It may end up on the presentation slide.", max: 180 },
] as const;

export type QuestionKey = (typeof questions)[number]["key"];
const answerShape = Object.fromEntries(questions.map(q => [q.key, z.string().trim().max(q.max).default("")])) as Record<QuestionKey, z.ZodDefault<z.ZodString>>;

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(70, "Your name can be up to 70 characters long."),
  color: z.enum(colors).default("pine"),
  avatar: z.enum(avatars).default("headphones"),
  answers: z.object(answerShape),
}).superRefine((value, ctx) => {
  const url = value.answers.songUrl;
  if (!url) return;
  try {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol)) throw new Error();
  } catch {
    ctx.addIssue({ code: "custom", path: ["answers", "songUrl"], message: "Please enter a complete link starting with https://." });
  }
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type Profile = ProfileInput & { id: string; createdAt: string; updatedAt: string };
export type Album = { profiles: Profile[]; myProfileId: string | null; recoveryCode: string | null; protected: boolean };

export function emptyProfile(): ProfileInput {
  return { name: "", color: "pine", avatar: "headphones", answers: Object.fromEntries(questions.map(q => [q.key, ""])) as Record<QuestionKey, string> };
}

export function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(n => Array.from(n)[0]).join("").toLocaleUpperCase("en") || "YOU";
}
