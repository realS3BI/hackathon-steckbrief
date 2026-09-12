import type { Metadata } from "next";
import { TeamAlbum } from "@/components/team-album";

export const metadata: Metadata = {
  title: "Our team album | Summit Sounds",
  description: "Meet the people behind Accessibility & Music at the Music & AI Hackathon at Rudolfshütte.",
};

export default function ProfilePage() {
  return <TeamAlbum />;
}
