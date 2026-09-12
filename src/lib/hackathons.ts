import { BookOpen, Users, type LucideIcon } from "lucide-react";
import { MUSIC_EVENT_PATH, MUSIC_PATH, PROFILE_PATH } from "./routes";

export type HackathonResource = {
  title: string;
  description: string;
  href: string;
  action: string;
  detail: string;
  icon: LucideIcon;
  color: "lake" | "lilac";
  preview: "music" | "people";
};

export type Hackathon = {
  slug: string;
  year: number;
  title: string;
  href: string;
  location: string;
  country: string;
  summary: string;
  tags: string[];
  cover: "music" | "notebook";
  externalUrl?: string;
  challenge: { number: number; title: string; invitation: string; description: string; question: string };
  resources: HackathonResource[];
};

export const musicAiHackathon: Hackathon = {
  slug: "music-ai",
  year: 2026,
  title: "Music & AI",
  href: MUSIC_EVENT_PATH,
  location: "Rudolfshütte",
  country: "Austria",
  summary: "Music, curious minds, and a mountain hut. Our experiments in making music easier for everyone to create.",
  tags: ["Music", "Artificial intelligence", "Accessibility"],
  cover: "music",
  externalUrl: "https://music-ai-hackathon.com/",
  challenge: {
    number: 6,
    title: "Accessibility & Music",
    invitation: "More people.\nMore ways to make music.",
    description: "A first tune should feel within reach. We are exploring how children, older adults, and people with disabilities can create music with simple choices and a little guidance.",
    question: "How can we make creating music more accessible and intuitive for anyone?",
  },
  resources: [
    {
      title: "Knowledge & Create",
      description: "Learn what makes a tune, try a few sounds, and turn your choices into an instrumental piece you can keep.",
      href: MUSIC_PATH,
      action: "Try making music",
      detail: "Short lessons, a playable prototype, and WAV downloads.",
      icon: BookOpen,
      color: "lake",
      preview: "music",
    },
    {
      title: "Our team album",
      description: "The people behind the project. Meet the team, share your own profile, and bring our stories into the presentation.",
      href: PROFILE_PATH,
      action: "Meet the team",
      detail: "Personal profiles and a shared presentation view.",
      icon: Users,
      color: "lilac",
      preview: "people",
    },
  ],
};

// Add only real events with an existing page under src/app/<year>/<slug>.
export const hackathons: Hackathon[] = [musicAiHackathon];
export const hackathonYears = [...new Set(hackathons.map(event => event.year))].sort((a, b) => b - a);
