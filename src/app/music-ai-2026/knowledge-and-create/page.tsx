import type { Metadata } from "next";
import { MusicStudio } from "@/components/music/music-studio";
import "./music.css";

export const metadata: Metadata = {
  title: "Learn & create music | Summit Sounds",
  description: "Learn a little about music, choose your sound, and make your first instrumental piece. No musical experience needed.",
};

export default function KnowledgeAndCreatePage() {
  return <MusicStudio />;
}
