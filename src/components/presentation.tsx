"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Grid2X2, Maximize, Printer, X, Mountain, Music2 } from "lucide-react";
import { toast } from "sonner";
import type { Profile, QuestionKey } from "@/lib/profile";
import { Identity } from "./identity";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const highlights: { key: QuestionKey; label: string }[] = [
  { key: "skills", label: "What I bring to the team" },
  { key: "motivation", label: "Why I chose this challenge" },
  { key: "barrier", label: "The barrier I want to remove" },
  { key: "superpower", label: "My unnecessary superpower" },
];

export function ProfileSlide({ person }: { person: Profile }) {
  const answers = highlights.filter(q => person.answers[q.key]);
  return <div className="profile-slide" data-color={person.color}>
    <div className="slide-person"><Identity person={person} large /><div><p className="slide-small">Accessibility & Music</p><h2>{person.name}</h2><p className="slide-role">{person.answers.role}</p><p className="slide-place">{[person.answers.origin && `From ${person.answers.origin}`, person.answers.home && `now in ${person.answers.home}`].filter(Boolean).join(", ")}</p></div></div>
    {person.answers.motto && <blockquote className="slide-motto">&ldquo;{person.answers.motto}&rdquo;</blockquote>}
    <div className="slide-answers">{answers.map(q => <div key={q.key}><h3>{q.label}</h3><p>{person.answers[q.key].length > 220 ? `${person.answers[q.key].slice(0, 217).trim()}…` : person.answers[q.key]}</p></div>)}</div>
    {person.answers.song && <div className="slide-song"><Music2 aria-hidden="true" /><span>My soundtrack<span>{person.answers.song}</span></span></div>}
  </div>;
}

export function PrintSheets({ profiles }: { profiles: Profile[] }) {
  return <div className="print-sheets" aria-hidden="true">{profiles.map(person => <section key={person.id} className="print-sheet"><header><strong>summit sounds.</strong><span>Music & AI Hackathon 2026</span></header><ProfileSlide person={person} /><footer>Rudolfshütte, 2,315 m <span>Our Accessibility & Music team</span></footer></section>)}</div>;
}

export function Presentation({ profiles, onClose }: { profiles: Profile[]; onClose: () => void }) {
  const [index, setIndex] = useState(-1);
  const surface = useRef<HTMLDivElement>(null);
  const total = profiles.length;
  const currentIndex = Math.min(index, total - 1);
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (event.key === "ArrowRight") { event.preventDefault(); setIndex(i => Math.min(i + 1, total - 1)); }
      if (event.key === "ArrowLeft") { event.preventDefault(); setIndex(i => Math.max(i - 1, -1)); }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [total]);

  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (surface.current?.requestFullscreen) await surface.current.requestFullscreen();
      else toast("This browser does not support full screen mode.");
    } catch { toast("Full screen mode could not be opened."); }
  }

  return <Dialog open onOpenChange={open => !open && onClose()}>
    <DialogContent ref={surface} className="presentation-dialog" showCloseButton={false}>
      <DialogTitle className="sr-only">Present our team</DialogTitle><DialogDescription className="sr-only">Use the arrow keys to move through the profiles. Press Escape to close the presentation.</DialogDescription>
      <div className="presentation-toolbar"><strong>summit sounds.</strong><div className="flex gap-2"><Button variant="ghost" size="icon" onClick={() => setIndex(-1)} aria-label="Team overview"><Grid2X2 /></Button><Button variant="ghost" size="icon" onClick={() => window.print()} aria-label="Print profiles as PDF"><Printer /></Button><Button variant="ghost" size="icon" onClick={fullscreen} aria-label="Toggle full screen"><Maximize /></Button><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close presentation"><X /></Button></div></div>
      <div className="presentation-surface" aria-live="polite">
        {currentIndex === -1 ? <div className="team-slide"><div className="team-slide-heading"><p>Music & AI Hackathon 2026</p><h2>This is us.</h2><p>Different minds. Music for everyone.</p></div><div className="team-slide-grid">{profiles.map((person, i) => <button key={person.id} onClick={() => setIndex(i)} className="team-slide-person" data-color={person.color}><Identity person={person} /><h3>{person.name}</h3><p>{person.answers.role || "Part of our team"}</p></button>)}</div></div> : profiles[currentIndex] && <ProfileSlide person={profiles[currentIndex]} />}
      </div>
      <div className="presentation-controls"><span><Mountain aria-hidden="true" />Rudolfshütte · 2,315 m</span><div className="flex items-center gap-3"><Button variant="outline" size="icon" onClick={() => setIndex(i => Math.max(-1, i - 1))} disabled={currentIndex < 0} aria-label="Previous slide"><ArrowLeft /></Button><span className="slide-counter">{currentIndex + 2} / {total + 1}</span><Button variant="outline" size="icon" onClick={() => setIndex(i => Math.min(total - 1, i + 1))} disabled={currentIndex === total - 1} aria-label="Next slide"><ArrowRight /></Button></div></div>
    </DialogContent>
  </Dialog>;
}
