import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import "./portal.css";

export const metadata: Metadata = {
  title: "Hackathon notes | Projects, experiments & people",
  description: "Explore our hackathons, try the projects, and meet the people who made them. A collection by schlossers.at.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body><ThemeProvider><a className="skip-link" href="#main">Skip to content</a>{children}<Toaster position="bottom-center" closeButton customAriaLabel="Close notification" containerAriaLabel="Notifications" /></ThemeProvider></body></html>;
}
