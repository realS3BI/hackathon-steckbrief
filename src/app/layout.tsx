import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Summit Sounds | Music for everyone",
  description: "Learn, create music, and meet our Accessibility & Music hackathon team.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body><ThemeProvider><a className="skip-link" href="#main">Skip to content</a>{children}<Toaster position="bottom-center" closeButton customAriaLabel="Close notification" containerAriaLabel="Notifications" /></ThemeProvider></body></html>;
}
