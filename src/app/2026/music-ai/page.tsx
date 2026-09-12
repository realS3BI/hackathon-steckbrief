import type { Metadata } from "next";
import { HackathonLanding } from "@/components/portal/hackathon-landing";
import { musicAiHackathon } from "@/lib/hackathons";

export const metadata: Metadata = {
  title: "Music & AI 2026 | Hackathon notes",
  description: "Our home for the Music & AI Hackathon at Rudolfshütte. Explore the Accessibility & Music challenge, try the music creator, and meet the team.",
};

export default function MusicAiPage() {
  return <HackathonLanding event={musicAiHackathon} />;
}
