"use client";

import { Bell, Check, Cloud, Download, Drum, Feather, Flower2, Gauge, Leaf, Music2, Pause, Piano, Play, RefreshCw, Sparkles, Sun, Turtle, Wind, type LucideIcon } from "lucide-react";
import { moods, paces, sounds, describeChoices, type MusicChoices } from "@/lib/music/knowledge";
import { compose } from "@/lib/music/composer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MusicScore } from "./music-score";
import type { MusicPlayer } from "./use-music-track";

type Option = { value: string; label: string; description: string; icon: LucideIcon };

function ChoiceField({ title, value, options, onChange }: { title: string; value: string; options: Option[]; onChange: (value: string) => void }) {
  return <FieldSet><FieldLegend>{title}</FieldLegend><ToggleGroup className="music-choices" type="single" variant="outline" value={value} onValueChange={next => next && onChange(next)} aria-label={title}>
    {options.map(({ value: item, label, description, icon: Icon }) => <ToggleGroupItem value={item} key={item} className="music-choice" aria-label={label}><Icon aria-hidden="true" /><span><strong>{label}</strong><small>{description}</small></span><Check className="choice-check" aria-hidden="true" /></ToggleGroupItem>)}
  </ToggleGroup></FieldSet>;
}

type Props = {
  choices: MusicChoices;
  onChange: (choices: MusicChoices) => void;
  title: string;
  onTitle: (title: string) => void;
  player: MusicPlayer;
  onSound: () => void;
  still: boolean;
  carried: boolean;
};

export function CreationPanel({ choices, onChange, title, onTitle, player, onSound, still, carried }: Props) {
  const { audio: audioRef } = player;
  const sketch = player.track?.composition ?? compose(choices, 2026);
  const changed = player.track && (JSON.stringify(player.track.choices) !== JSON.stringify(choices) || player.track.title !== (title.trim() || "My first piece"));
  return <section className="creation-panel" aria-label="Music creator">
    <form className="music-form" onSubmit={event => { event.preventDefault(); onSound(); void player.prepare(choices, title.trim() || "My first piece"); }}>
      <div className="creator-intro"><h2>What will your music be like?</h2><p>Pick what feels right. You can change anything.</p></div>
      {carried && <p className="choice-carried" role="status"><Check aria-hidden="true" />Your choice from the lesson is ready below.</p>}
      <FieldGroup>
        <ChoiceField title="1. Choose a mood" value={choices.mood} onChange={mood => onChange({ ...choices, mood: mood as MusicChoices["mood"] })} options={moods.map((mood, i) => ({ ...mood, icon: [Leaf, Sun, Cloud][i] }))} />
        <ChoiceField title="2. Choose a speed" value={choices.pace} onChange={pace => onChange({ ...choices, pace: pace as MusicChoices["pace"] })} options={paces.map((pace, i) => ({ ...pace, icon: [Turtle, Flower2, Gauge][i] }))} />
        <ChoiceField title="3. Choose a sound" value={choices.sound} onChange={sound => onChange({ ...choices, sound: sound as MusicChoices["sound"] })} options={sounds.map((sound, i) => ({ ...sound, icon: [Piano, Bell, Wind][i] }))} />
        <ChoiceField title="4. Add a beat?" value={choices.beat ? "yes" : "no"} onChange={beat => onChange({ ...choices, beat: beat === "yes" })} options={[{ value: "yes", label: "With a beat", description: "Gentle drums underneath", icon: Drum }, { value: "no", label: "No drums", description: "Let the tune flow", icon: Feather }]} />
        <Field><FieldLabel htmlFor="piece-title">Give it a name <span className="text-muted-foreground">· optional</span></FieldLabel><Input id="piece-title" value={title} onChange={event => onTitle(event.target.value)} maxLength={80} placeholder="My first piece" autoComplete="off" /></Field>
        <div className="create-action"><Button type="submit" size="lg" disabled={player.busy}><Sparkles data-icon="inline-start" />{player.busy ? "Making your music…" : player.track ? "Create a new version" : "Create my music"}</Button>{player.busy && <Button type="button" variant="outline" onClick={player.cancel}>Cancel</Button>}</div>
        <p className="studio-fine-print">Instrumental prototype. Creates a short piece from your choices. No account or music experience needed.</p>
      </FieldGroup>
    </form>
    <aside className="your-music" aria-labelledby="your-music-heading">
      <div className="flex items-center gap-2"><Music2 aria-hidden="true" /><h2 id="your-music-heading">Your music</h2></div>
      <div className="piece-cover" data-color={moods.find(mood => mood.value === (player.track?.choices.mood ?? choices.mood))!.color}>
        <div className="piece-cover-title"><span>Summit Sounds</span><span>Made by you</span></div>
        <MusicScore composition={sketch} beat={!still && player.playing ? player.time * sketch.bpm / 60 : -1} />
        <h3>{player.track?.title ?? (title.trim() || "My first piece")}</h3>
        <p>{player.track ? `${Math.round(sketch.duration)} seconds of your own music` : "A few choices. Your own little tune."}</p>
      </div>
      <p className="piece-description">{describeChoices(player.track?.choices ?? choices)}</p>
      <p className="studio-fine-print">The colored lines show the first eight beats of the melody. Higher lines mean higher notes.</p>
      <div className="song-status" role="status">{player.busy ? "Creating your piece. You can cancel at any time." : player.track ? "Your piece is ready. Press Play to listen." : "Choose your sounds, then select Create my music."}</div>
      <audio ref={audioRef} controls hidden={!player.track} preload="metadata" aria-label="Your music player" onPlay={() => { onSound(); player.setPlaying(true); }} onPause={() => player.setPlaying(false)} onEnded={() => player.setPlaying(false)} onTimeUpdate={event => player.setTime(event.currentTarget.currentTime)} />
      {player.track && <Button onClick={() => { onSound(); void player.togglePlayback(); }} disabled={player.busy}>{player.playing ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}{player.playing ? "Pause music" : "Play my music"}</Button>}
      {player.track && <Button variant="outline" asChild><a href={player.track.url} download={`${player.track.title.replace(/[^a-z0-9_-]/gi, "-").replace(/-+/g, "-").slice(0, 80) || "my-music"}.wav`}><Download data-icon="inline-start" />Download WAV</a></Button>}
      {changed && <p className="changed-note"><RefreshCw aria-hidden="true" />Your choices have changed. Create a new version to hear them. Your current piece stays here until then.</p>}
      {player.error && <Alert variant="destructive"><AlertDescription>{player.error}</AlertDescription></Alert>}
      <p className="studio-fine-print">Download a piece you want to keep before creating another or leaving this page. Music is not uploaded or shared with the team.</p>
    </aside>
  </section>;
}
