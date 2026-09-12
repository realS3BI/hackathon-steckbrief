"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, AudioLines, BookOpen, Check, Keyboard, Music2, Square, Type, Users } from "lucide-react";
import { Brand } from "@/components/identity";
import { MusicTrail } from "@/components/portal/breadcrumbs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toggle } from "@/components/ui/toggle";
import { MUSIC_PATH, PROFILE_PATH } from "@/lib/routes";
import { defaultChoices, lessons, type MusicChoices } from "@/lib/music/knowledge";
import { compose } from "@/lib/music/composer";
import { KnowledgePanel } from "./knowledge-panel";
import { CreationPanel } from "./creation-panel";
import { MusicScore } from "./music-score";
import { useMusicTrack } from "./use-music-track";

const introductionScore = compose({ ...defaultChoices, mood: "bright" }, 2026, 2);

export function MusicStudio() {
  const [tab, setTab] = useState("learn");
  const [lessonId, setLessonId] = useState("tempo");
  const [choices, setChoices] = useState<MusicChoices>(defaultChoices);
  const [title, setTitle] = useState("");
  const [largeText, setLargeText] = useState(false);
  const [still, setStill] = useState(true);
  const [carried, setCarried] = useState(false);
  const [canRead, setCanRead] = useState(false);
  const [reading, setReading] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const createTab = useRef<HTMLButtonElement>(null);
  const learnTab = useRef<HTMLButtonElement>(null);
  const example = useMusicTrack();
  const song = useMusicTrack();
  const lesson = lessons.find(item => item.id === lessonId)!;

  useEffect(() => {
    // Browser capability is known only after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanRead("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, []);

  function stopReading() {
    if (utterance.current) {
      utterance.current.onend = null;
      utterance.current.onerror = null;
      utterance.current = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setReading(false);
  }

  function read(text: string) {
    if (reading) { stopReading(); return; }
    example.cancel(); song.cancel();
    setSpeechError("");
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en";
    speech.rate = 0.9;
    speech.volume = 0.65;
    speech.onend = () => { setReading(false); utterance.current = null; };
    speech.onerror = event => {
      setReading(false); utterance.current = null;
      if (event.error !== "canceled" && event.error !== "interrupted") setSpeechError("Read-aloud could not start. You can read the full lesson below or use your device's screen reader.");
    };
    utterance.current = speech;
    setReading(true);
    window.speechSynthesis.speak(speech);
  }

  function changeTab(value: string) {
    example.cancel(); song.cancel(); stopReading();
    setTab(value);
  }

  function goCreate(next?: Partial<MusicChoices>) {
    if (next) { setChoices(current => ({ ...current, ...next })); setCarried(true); }
    changeTab("create");
    requestAnimationFrame(() => { createTab.current?.focus(); createTab.current?.scrollIntoView({ block: "start", behavior: "instant" }); });
  }

  return <div className="site-shell music-studio" data-large-text={largeText}>
    <header className="site-header studio-header"><Brand /><nav aria-label="Main navigation"><Link className="nav-link studio-current-link" href={MUSIC_PATH} aria-current="page">Learn & create</Link><Link className="studio-team-link" href={PROFILE_PATH}><Users aria-hidden="true" />Team</Link><ThemeToggle /></nav></header>
    <MusicTrail current="Knowledge & Create" />
    <main id="main">
      <section className="studio-welcome" aria-labelledby="studio-title">
        <div><h1 id="studio-title">Make room<br />for your music.</h1><p>A little curiosity is all you need. Explore a few sounds, make a few choices, and hear what you create.</p><div className="welcome-actions"><Button size="lg" onClick={() => { changeTab("learn"); learnTab.current?.focus(); learnTab.current?.scrollIntoView({ block: "start", behavior: "instant" }); }}><BookOpen data-icon="inline-start" />Start with a little learning</Button><Button variant="ghost" onClick={() => goCreate()}>Go straight to creating<ArrowRight data-icon="inline-end" /></Button></div></div>
        <div className="welcome-score" data-color="sun"><div className="welcome-score-label"><Music2 aria-hidden="true" /><span>Every tune starts somewhere.</span></div><MusicScore composition={introductionScore} /><div className="score-caption"><span>A note. Some space. Another note.</span><span>No right or wrong.</span></div></div>
      </section>
      <div className="studio-tools" role="group" aria-label="Reading and playback options"><span><Keyboard aria-hidden="true" />Go at your own pace.</span><div className="studio-tool-buttons"><Toggle pressed={largeText} onPressedChange={setLargeText} variant="outline" aria-label="Bigger text"><Type aria-hidden="true" />Bigger text</Toggle><Toggle pressed={!still} onPressedChange={pressed => setStill(!pressed)} variant="outline" aria-label="Follow notes during playback"><AudioLines aria-hidden="true" />Follow notes</Toggle>{(reading || example.playing || song.playing || example.busy || song.busy) && <Button variant="outline" onClick={() => { example.cancel(); song.cancel(); stopReading(); }}><Square data-icon="inline-start" />Stop all sound</Button>}</div></div>
      {speechError && <Alert className="mb-5"><AlertDescription>{speechError}</AlertDescription></Alert>}
      <Tabs value={tab} onValueChange={changeTab} className="studio-workbook">
        <TabsList className="studio-tabs" aria-label="Learn and create"><TabsTrigger ref={learnTab} value="learn"><BookOpen aria-hidden="true" />Learn a little</TabsTrigger><TabsTrigger ref={createTab} value="create"><Music2 aria-hidden="true" />Create music</TabsTrigger></TabsList>
        <TabsContent value="learn" forceMount hidden={tab !== "learn"} className="studio-panel"><KnowledgePanel lesson={lesson} onLesson={value => { example.cancel(); stopReading(); setLessonId(value); }} onUse={goCreate} player={example} onSound={() => { song.pause(); stopReading(); }} onRead={read} canRead={canRead} reading={reading} /></TabsContent>
        <TabsContent value="create" forceMount hidden={tab !== "create"} className="studio-panel"><CreationPanel choices={choices} onChange={value => { setChoices(value); setCarried(false); }} title={title} onTitle={setTitle} player={song} onSound={() => { example.pause(); stopReading(); }} still={still} carried={carried} /></TabsContent>
      </Tabs>
      <details className="studio-about"><summary>About this project and accessibility</summary><div><h2>A first piece, with fewer barriers.</h2><p>We are exploring how children, older adults, and people with disabilities can create music with more independence. Everyone can use the same controls. No age, diagnosis, or account is needed.</p><ul><li><Check aria-hidden="true" />Use a keyboard, touch, or your usual assistive controls. No dragging or timed steps.</li><li><Check aria-hidden="true" />Read the short lessons or choose read-aloud. Sound starts only when you ask for it.</li><li><Check aria-hidden="true" />See a simple melody view and read a description of your piece.</li><li><Check aria-hidden="true" />Use bigger text and your preferred color theme. Follow notes is off by default.</li></ul><p>This hackathon prototype creates instrumental music with a local composition engine. A trained AI music service, voice commands, gesture controls, and ChordCat support are future work. We still need to test the experience with people who have different access needs.</p><p>Music stays in your browser until you download it. Read-aloud uses your browser&apos;s speech service and available voices.</p><Link href={PROFILE_PATH}>Meet the team behind Accessibility & Music</Link></div></details>
    </main>
    <footer className="studio-footer"><span>Summit Sounds · Rudolfshütte 2026</span><a href="https://music-ai-hackathon.com/" target="_blank" rel="noopener noreferrer">Music & AI Hackathon</a><Link href={PROFILE_PATH}>Our team album</Link></footer>
  </div>;
}
