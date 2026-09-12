import Link from "next/link";
import { ArrowUpRight, NotebookTabs } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Brand } from "@/components/identity";
import { hackathonYears } from "@/lib/hackathons";

export function PortalHeader({ music = false, year }: { music?: boolean; year?: number }) {
  return <header className="portal-header">
    {music ? <Brand /> : <Link className="portal-brand" href="/" aria-label="Hackathon notes, home"><span className="portal-brand-icon"><NotebookTabs aria-hidden="true" /></span><span>hackathon<span className="portal-brand-rest"> notes</span><span className="portal-brand-dot">.</span><small>by schlossers.at</small></span></Link>}
    <nav aria-label="Main navigation"><Link href="/" className="portal-nav-link">All events</Link>{!music && !year && <Link className="portal-nav-year" href={`/${hackathonYears[0]}`}>{hackathonYears[0]}</Link>}<ThemeToggle /></nav>
  </header>;
}

export function PortalFooter({ music = false, website }: { music?: boolean; website?: string }) {
  return <footer className="portal-footer"><Link href="/">Hackathon notes<span>by schlossers.at</span></Link><p>{music ? "Music, mountain air, and things to try." : "A growing collection of our hackathons."}</p>{website ? <a href={website} target="_blank" rel="noopener noreferrer">The event website<ArrowUpRight aria-hidden="true" /></a> : <a href="#main">Back to the top</a>}</footer>;
}
