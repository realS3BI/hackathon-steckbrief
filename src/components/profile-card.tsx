"use client";

import { ArrowUpRight, MapPin, Music2, Quote, Pencil } from "lucide-react";
import type { Profile } from "@/lib/profile";
import { Identity } from "./identity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProfileCard({ person, mine, onOpen }: { person: Profile; mine: boolean; onOpen: () => void }) {
  return <article className="profile-card" data-color={person.color}>
    <div className="pass-top"><span>Music & AI Hackathon</span>{mine ? <Badge variant="secondary">Your profile</Badge> : <span>Team pass</span>}</div>
    <div className="pass-person"><Identity person={person} /><div className="min-w-0"><h3>{person.name}</h3><p>{person.answers.role || "Here for good ideas and good company."}</p></div></div>
    <div className="pass-facts">
      {person.answers.home && <p><MapPin aria-hidden="true" /><span>{person.answers.home}</span></p>}
      {person.answers.song && <p><Music2 aria-hidden="true" /><span>{person.answers.song}</span></p>}
      {!person.answers.home && !person.answers.song && <p><Music2 aria-hidden="true" /><span>The soundtrack is still taking shape.</span></p>}
    </div>
    <div className="pass-quote"><Quote aria-hidden="true" /><p>{person.answers.motto || person.answers.motivation || person.answers.superpower || "There is room for a good story here."}</p></div>
    <div className="pass-bottom"><span>{mine ? <><Pencil aria-hidden="true" /> That is you</> : "Glad you are here."}</span><Button variant="ghost" size="sm" onClick={onOpen} aria-label={`View ${person.name}'s profile`}>Profile<ArrowUpRight data-icon="inline-end" /></Button></div>
  </article>;
}
