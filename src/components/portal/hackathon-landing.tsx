import Link from "next/link";
import { Accessibility, ArrowDown, ArrowRight, BookOpen, Hand, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Hackathon } from "@/lib/hackathons";
import { MusicCover, NotebookCover, ResourcePreview } from "./artwork";
import { PageTrail } from "./breadcrumbs";
import { PortalHeader, PortalFooter } from "./portal-shell";

export function HackathonLanding({ event }: { event: Hackathon }) {
  return <div className="portal-shell event-landing"><PortalHeader music={event.cover === "music"} year={event.year} /><main id="main">
    <PageTrail items={[{ label: "All hackathons", href: "/" }, { label: String(event.year), href: `/${event.year}` }, { label: event.title }]} />
    <section className="event-hero" aria-labelledby="event-title"><div className="event-hero-copy"><div className="flex flex-wrap gap-2"><Badge variant="outline">Hackathon {event.year}</Badge><Badge variant="secondary">Challenge {event.challenge.number}</Badge></div><h1 id="event-title">{event.title}<span>Made at the hackathon.</span></h1><p>{event.summary}</p><div className="event-location"><MapPin aria-hidden="true" /><span>{event.location}, {event.country}</span></div><Button asChild size="lg"><a href="#projects">Explore the projects<ArrowDown data-icon="inline-end" /></a></Button></div><div className="event-hero-cover" data-color="sun">{event.cover === "music" ? <MusicCover /> : <NotebookCover title={event.title} year={event.year} />}</div></section>
    <section className="event-challenge" aria-labelledby="challenge-title"><div><span className="challenge-label"><Accessibility aria-hidden="true" />{event.challenge.title}</span><h2 id="challenge-title">{event.challenge.invitation.split("\n").map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h2></div><div><p>{event.challenge.description}</p><p className="event-question">{event.challenge.question}</p></div></section>
    <section className="event-projects" id="projects" aria-labelledby="projects-title"><div className="projects-heading"><h2 id="projects-title">Come on in.</h2><p>Try the idea. Get to know the people making it.</p></div><div className="resource-grid">
      {event.resources.map(({ title, description, href, action, detail, icon: Icon, color, preview }) => <Card key={href} className="resource-card">
        <CardHeader><div className="resource-heading"><span className="resource-icon" data-color={color}><Icon aria-hidden="true" /></span><CardTitle><h3>{title}</h3></CardTitle></div><CardDescription>{description}</CardDescription></CardHeader>
        <CardContent><div data-color={color}><ResourcePreview kind={preview} /></div><p className="resource-detail">{detail}</p></CardContent>
        <CardFooter><Button asChild size="lg"><Link href={href}>{action}<ArrowRight data-icon="inline-end" /></Link></Button></CardFooter>
      </Card>)}
    </div></section>
    {event.cover === "music" && <section className="event-questions" aria-labelledby="questions-title"><h2 id="questions-title">What we are figuring out.</h2><div>{[
      { icon: Accessibility, title: "More ways to take part", text: "How can AI help people with different abilities create and perform music?" },
      { icon: Hand, title: "Tools that fit the person", text: "How can touch, voice, gestures, or other controls make music easier to create?" },
      { icon: BookOpen, title: "A first tune, sooner", text: "How can beginners start making music without a long course or complicated tools?" },
    ].map(({ icon: Icon, title, text }) => <article key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div></section>}
  </main><PortalFooter music={event.cover === "music"} website={event.externalUrl} /></div>;
}
