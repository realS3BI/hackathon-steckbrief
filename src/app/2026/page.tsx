import type { Metadata } from "next";
import { YearLanding } from "@/components/portal/archive-landing";

export const metadata: Metadata = {
  title: "2026 | Hackathon notes",
  description: "Our 2026 hackathons. Explore Music & AI at Rudolfshütte and the projects we are making together.",
};

export default function YearPage() {
  return <YearLanding year={2026} />;
}
