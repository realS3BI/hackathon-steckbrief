import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, FolderOpen, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { hackathons, hackathonYears, type Hackathon } from "@/lib/hackathons";
import { PageTrail } from "./breadcrumbs";
import { FolderArtwork, MusicCover, NotebookCover } from "./artwork";
import { PortalFooter, PortalHeader } from "./portal-shell";

function EventDirectory({ events, year }: { events: Hackathon[]; year?: number }) {
  return <section className="event-directory" id="hackathons" aria-labelledby="directory-heading">
    <div className="directory-heading"><div><h2 id="directory-heading">{year ? `The ${year} collection` : "Pick a hackathon."}</h2><p>Open the event. Find the projects and people inside.</p></div>{!year && <nav className="year-links" aria-label="Browse by year"><span>Browse by year</span>{hackathonYears.map(value => <Button key={value} asChild variant="outline"><Link href={`/${value}`}><CalendarDays data-icon="inline-start" />{value}<ArrowUpRight data-icon="inline-end" /></Link></Button>)}</nav>}</div>
    <div className="event-list">{events.map(event => <article key={event.href} aria-labelledby={`event-${event.slug}`}>
      <Card className="event-entry"><div className="event-entry-cover" data-color="sun">{event.cover === "music" ? <MusicCover /> : <NotebookCover title={event.title} year={event.year} />}</div><div className="event-entry-copy">
        <CardHeader><div className="event-entry-meta"><span>{event.year}</span><span><MapPin aria-hidden="true" />{event.location}, {event.country}</span></div><CardTitle><h3 id={`event-${event.slug}`} className="event-entry-title">{event.title}</h3></CardTitle></CardHeader>
        <CardContent><p className="event-entry-description">{event.summary}</p><div className="event-tags">{event.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div></CardContent>
        <CardFooter><Button asChild size="lg"><Link href={event.href}>Explore {event.title}<ArrowRight data-icon="inline-end" /></Link></Button><span>{event.resources.length} {event.resources.length === 1 ? "space" : "spaces"} to explore</span></CardFooter>
      </div></Card>
    </article>)}</div>
  </section>;
}

export function ArchiveLanding() {
  return <div className="archive-surface"><div className="portal-shell"><PortalHeader /><main id="main">
    <section className="archive-hero" aria-labelledby="archive-title"><div><h1 id="archive-title">Made together.<br />Collected here.</h1><p>Projects, experiments, and the people behind them. A home for what we make at hackathons.</p><Button asChild size="lg"><a href="#hackathons">Browse the hackathons<ArrowDown data-icon="inline-end" /></a></Button></div><FolderArtwork /></section>
    <EventDirectory events={hackathons} />
    <aside className="archive-closing"><FolderOpen aria-hidden="true" /><div><h2>Room for the next idea.</h2><p>This collection grows with each hackathon. Each event keeps its own projects and team in one place.</p></div><Link href={`/${hackathonYears[0]}`}>Explore {hackathonYears[0]}<ArrowUpRight aria-hidden="true" /></Link></aside>
  </main><PortalFooter /></div></div>;
}

export function YearLanding({ year }: { year: number }) {
  const events = hackathons.filter(event => event.year === year);
  return <div className="archive-surface"><div className="portal-shell"><PortalHeader year={year} /><main id="main">
    <PageTrail items={[{ label: "All hackathons", href: "/" }, { label: String(year) }]} />
    <section className="year-hero" aria-labelledby="year-title"><div className="year-cover"><CalendarDays aria-hidden="true" /><h1 id="year-title">{year}</h1><span>A year of making things together.</span></div><div className="year-introduction"><h2>The people we met.<br />The things we tried.</h2><p>{events.length === 1 ? "One hackathon in the collection so far." : `${events.length} hackathons in the collection.`} Open an event to explore its challenge, projects, and team.</p><Button asChild variant="outline"><a href="#hackathons">See the {year} hackathons<ArrowDown data-icon="inline-end" /></a></Button></div></section>
    <EventDirectory events={events} year={year} />
  </main><PortalFooter /></div></div>;
}
