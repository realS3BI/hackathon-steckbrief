"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MUSIC_PATH, PROFILE_PATH } from "@/lib/routes";
import { Accessibility, ArrowDown, ArrowUpRight, AudioLines, Check, Clock3, Copy, Headphones, KeyRound, LogOut, MapPin, Mountain, Pencil, Plus, Presentation as PresentationIcon, RefreshCw, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/client";
import type { Album } from "@/lib/profile";
import { Brand, RecordArtwork } from "./identity";
import { MusicTrail } from "@/components/portal/breadcrumbs";
import { ProfileCard } from "./profile-card";
import { ProfileEditor } from "./profile-editor";
import { ProfileDetail } from "./profile-detail";
import { Presentation, PrintSheets } from "./presentation";
import { RecoveryDialog, TeamGate } from "./access-dialogs";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/empty";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";

export function TeamAlbum() {
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [presenting, setPresenting] = useState(false);
  const [recovery, setRecovery] = useState<{ code?: string } | null>(null);
  const request = useRef<AbortController | null>(null);
  const createButton = useRef<HTMLButtonElement>(null);

  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      const next = await api<Album>("/api/profiles", { signal: controller.signal });
      setAlbum(next); setLocked(false); setError("");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      if (error instanceof ApiError && error.status === 401) { setLocked(true); setAlbum(null); }
      else setError(error instanceof Error ? error.message : "The team album could not be loaded.");
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    // refresh changes state only after the network request settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const interval = setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 15000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(interval); window.removeEventListener("focus", onFocus); request.current?.abort(); };
  }, [refresh]);

  const mine = album?.profiles.find(p => p.id === album.myProfileId);
  const selected = album?.profiles.find(p => p.id === selectedId);
  const query = search.trim().toLocaleLowerCase("en");
  const profiles = album?.profiles.filter(p => [p.name, ...Object.values(p.answers)].some(v => v.toLocaleLowerCase("en").includes(query))) || [];

  function closeEditor() { setEditor(false); requestAnimationFrame(() => createButton.current?.focus()); }

  async function share() {
    try { await navigator.clipboard.writeText(`${window.location.origin}${PROFILE_PATH}`); toast.success("Team link copied. Send it to your group chat."); }
    catch { toast("Copy the address from your browser and share it with your team."); }
  }

  async function logout() {
    try {
      await api("/api/session", { method: "DELETE" });
      setEditor(false); setSelectedId(null); setRecovery(null); setPresenting(false);
      await refresh();
      toast.success("You are signed out on this device.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "You could not be signed out."); }
  }

  if (locked) return <TeamGate onUnlocked={refresh} />;

  return <>
    <div className="site-shell">
      <header className="site-header"><Brand /><nav aria-label="Main navigation"><Link href={MUSIC_PATH} className="nav-link album-learn-link">Learn & create</Link><Button className="nav-presentation" variant="ghost" onClick={() => setPresenting(true)} disabled={!album?.profiles.length}><PresentationIcon data-icon="inline-start" /><span className="nav-present-label">Present</span></Button><ThemeToggle /><Button ref={createButton} onClick={() => setEditor(true)} disabled={!album}><span className="hidden sm:inline">{mine ? "My profile" : "Create profile"}</span><span className="sm:hidden">{mine ? "My profile" : "Join in"}</span>{mine ? <Pencil data-icon="inline-end" /> : <Plus data-icon="inline-end" />}</Button></nav></header>
      <MusicTrail current="Team album" />
      <main id="main">
        <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><Badge variant="outline"><span className="live-dot" />Music & AI Hackathon 2026</Badge><h1 id="hero-title">Different minds.<br />One shared<br className="desktop-break" /> rhythm.</h1><p>Before we make music more accessible together,<br className="desktop-break" /> let us get to know one another. This is our team album.</p><div className="hero-actions"><Button size="lg" onClick={() => setEditor(true)} disabled={!album}>{mine ? "Edit your profile" : "This is me"}{mine ? <Pencil data-icon="inline-end" /> : <Plus data-icon="inline-end" />}</Button><a href="#team" className="text-link">Meet the team<ArrowDown aria-hidden="true" /></a></div><div className="hero-note"><Clock3 aria-hidden="true" /><span>About five minutes. Share only what feels right.</span></div></div><RecordArtwork /></section>
        <aside className="challenge-strip" aria-label="Our challenge and location"><div className="challenge-description"><span className="challenge-icon"><Accessibility aria-hidden="true" /></span><div><span>Our challenge #6</span><h2>Accessibility & Music</h2></div><p>Everyone should be able to make music.<br />We are finding ways to make that happen.</p></div><div className="location"><Mountain aria-hidden="true" /><div><strong>Rudolfshütte</strong><span>2,315 m above the everyday</span></div></div></aside>
        <section id="team" className="team-section" aria-labelledby="team-heading"><div className="team-heading"><div><div className="flex items-center gap-3"><h2 id="team-heading">The people behind the idea.</h2>{album && <Badge variant="secondary">{album.profiles.length}</Badge>}</div><p>What shapes us, drives us, and stays on our minds.</p></div><Button variant="outline" onClick={share}><Copy data-icon="inline-start" />Invite the team</Button></div>
          {Boolean(album?.profiles.length) && <div className="team-filter"><InputGroup><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput value={search} onChange={event => setSearch(event.target.value)} placeholder="Search names, skills, or favorite songs..." aria-label="Search team" /></InputGroup><span className="team-count"><Users aria-hidden="true" />{profiles.length} {profiles.length === 1 ? "person" : "people"}</span></div>}
          {error && <Alert variant="destructive" className="mb-5"><AlertDescription>{error}<Button variant="outline" size="sm" onClick={refresh}><RefreshCw data-icon="inline-start" />Try again</Button></AlertDescription></Alert>}
          {loading ? <div className="profile-grid" aria-label="Loading profiles" role="status">{[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}</div> : album && !album.profiles.length ? <div className="album-empty"><Empty><EmptyHeader><EmptyMedia variant="icon"><Headphones /></EmptyMedia><EmptyTitle>The first hello is still missing.</EmptyTitle><EmptyDescription>Create your profile and start our team album. Favorite songs and unnecessary superpowers are very welcome.</EmptyDescription></EmptyHeader><EmptyContent><Button onClick={() => setEditor(true)}><Plus data-icon="inline-start" />Create the first profile</Button></EmptyContent></Empty><div className="empty-side"><span className="empty-note">What goes into a profile?</span><ul><li><MapPin />Where you are from and what you do</li><li><Headphones />Your soundtrack and musical quirks</li><li><Accessibility />Your ideas for music without barriers</li><li><Mountain />A little mountain fun</li></ul><span className="empty-footnote"><Check /> Everything is optional except your name.</span></div></div> : album && !profiles.length ? <Empty><EmptyHeader><EmptyMedia variant="icon"><Search /></EmptyMedia><EmptyTitle>No one matches that search.</EmptyTitle><EmptyDescription>Try another name, answer, or keyword.</EmptyDescription></EmptyHeader><EmptyContent><Button variant="outline" onClick={() => setSearch("")}>Clear search</Button></EmptyContent></Empty> : <div className="profile-grid">{profiles.map(person => <ProfileCard key={person.id} person={person} mine={person.id === mine?.id} onOpen={() => setSelectedId(person.id)} />)}{album && !mine && !query && <button className="add-pass" onClick={() => setEditor(true)}><span><Plus aria-hidden="true" /></span><strong>Your spot is waiting.</strong><p>A good band needs<br />different people.</p><span className="add-pass-link">Create profile<ArrowUpRight aria-hidden="true" /></span></button>}</div>}
          <div className="team-bottom"><span><AudioLines aria-hidden="true" /> Here together. Each with our own sound.</span>{album && !mine && <Button variant="ghost" size="sm" onClick={() => setRecovery({})}><KeyRound data-icon="inline-start" />Already have a profile?</Button>}</div>
        </section>
        <section className="presentation-invite"><div><span className="presentation-icon"><PresentationIcon aria-hidden="true" /></span><div><h2>Ready for our moment?</h2><p>Turn the team album into slides for the presentation or a keepsake.</p></div></div><Button variant="outline" onClick={() => setPresenting(true)} disabled={!album?.profiles.length}>Presentation view<ArrowUpRight data-icon="inline-end" /></Button></section>
      </main>
      <footer className="site-footer"><div><strong>summit sounds.</strong><span>Mountain air and a little AI.</span></div><a href="https://music-ai-hackathon.com/" target="_blank" rel="noopener noreferrer">Music & AI Hackathon<ArrowUpRight aria-hidden="true" /></a>{mine && <Button variant="ghost" size="sm" onClick={() => setRecovery({ code: album?.recoveryCode || undefined })}><KeyRound data-icon="inline-start" />My code</Button>}{(mine || album?.protected) && <Button variant="ghost" size="sm" onClick={logout}><LogOut data-icon="inline-start" />Sign out</Button>}</footer>
    </div>
    {editor && album && <ProfileEditor existing={mine} onClose={closeEditor} protectedAlbum={album.protected} onSaved={async code => { closeEditor(); await refresh(); if (code) setRecovery({ code }); }} />}
    {selected && <ProfileDetail person={selected} mine={selected.id === mine?.id} onClose={() => setSelectedId(null)} onEdit={() => { setSelectedId(null); setEditor(true); }} onDeleted={async () => { setSelectedId(null); await refresh(); }} onRecovery={() => { setSelectedId(null); setRecovery({ code: album?.recoveryCode || undefined }); }} />}
    {recovery && <RecoveryDialog code={recovery.code} onClose={() => setRecovery(null)} onRecovered={async () => { setRecovery(null); await refresh(); }} />}
    {presenting && album && <Presentation profiles={album.profiles} onClose={() => setPresenting(false)} />}
    {album && <PrintSheets profiles={album.profiles} />}
  </>;
}
