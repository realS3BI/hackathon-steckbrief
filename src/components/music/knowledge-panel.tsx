"use client";

import { ArrowRight, BookOpen, Headphones, Lightbulb, Play, Square, Volume2 } from "lucide-react";
import { lessons, defaultChoices, type Lesson, type MusicChoices } from "@/lib/music/knowledge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { MusicPlayer } from "./use-music-track";

type Props = {
  lesson: Lesson;
  onLesson: (id: string) => void;
  onUse: (choices: Partial<MusicChoices>) => void;
  player: MusicPlayer;
  onSound: () => void;
  onRead: (text: string) => void;
  canRead: boolean;
  reading: boolean;
};

export function KnowledgePanel({ lesson, onLesson, onUse, player, onSound, onRead, canRead, reading }: Props) {
  const { audio: audioRef } = player;
  return <section className="knowledge-panel" aria-label="Music knowledge base">
    <div className="lesson-topics">
      <div className="flex items-center gap-2"><BookOpen aria-hidden="true" /><h2>A little music knowledge</h2></div>
      <p>Start anywhere. There is no test.</p>
      <ToggleGroup type="single" value={lesson.id} onValueChange={value => value && onLesson(value)} aria-label="Choose a music topic" className="topic-options" variant="outline">
        {lessons.map(item => <ToggleGroupItem key={item.id} value={item.id}>{item.title}</ToggleGroupItem>)}
      </ToggleGroup>
    </div>
    <article className="lesson-page" aria-labelledby="lesson-title">
      <div className="lesson-title-row"><h3 id="lesson-title">{lesson.question}</h3><Button variant="outline" disabled={!canRead} onClick={() => onRead(`${lesson.question} ${lesson.text} ${lesson.takeaway}`)} aria-label={reading ? "Stop reading aloud" : "Read lesson aloud"}>{reading ? <Square data-icon="inline-start" /> : <Volume2 data-icon="inline-start" />}{reading ? "Stop reading" : "Read aloud"}</Button></div>
      <p className="lesson-text">{lesson.text}</p>
      {!canRead && <p className="studio-fine-print">Read-aloud is not available in this browser. All instructions are shown as text.</p>}
      <div className="lesson-examples">
        {lesson.examples.map((example, index) => <section className="lesson-example" key={example.label} data-color={index === 0 ? "lake" : "sun"} aria-label={example.label}>
          <div className="example-pattern" aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6, 7].map(note => <i key={note} style={{ height: `${[30, 65, 45, 80, 40, 60, 85, 50][(note + index * 2) % 8]}%` }} />)}</div>
          <h4>{example.label}</h4><p>{example.description}</p>
          <div className="example-actions"><Button variant="outline" onClick={() => { onSound(); void player.prepare({ ...defaultChoices, ...example.choices }, example.label, { seed: 2026, bars: 2, layer: example.layer, autoplay: true }); }} disabled={player.busy}><Play data-icon="inline-start" />Listen<span className="sr-only"> to {example.label}</span></Button><Button variant="ghost" onClick={() => onUse(example.choices)}>Use this<ArrowRight data-icon="inline-end" /><span className="sr-only">: {example.label}</span></Button></div>
        </section>)}
      </div>
      <div className="example-player" hidden={!player.track && !player.busy}>
        <p role="status"><Headphones aria-hidden="true" />{player.busy ? "Preparing your example…" : player.track?.title}</p>
        <audio ref={audioRef} controls preload="metadata" aria-label="Lesson example player" onPlay={() => { onSound(); player.setPlaying(true); }} onPause={() => player.setPlaying(false)} onEnded={() => player.setPlaying(false)} />
        {player.busy && <Button variant="outline" onClick={player.cancel}>Cancel example</Button>}
      </div>
      {player.error && <Alert><AlertDescription>{player.error}</AlertDescription></Alert>}
      <p className="lesson-takeaway"><Lightbulb aria-hidden="true" />{lesson.takeaway}</p>
    </article>
  </section>;
}
