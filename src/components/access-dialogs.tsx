"use client";

import { useState, type FormEvent } from "react";
import { Copy, KeyRound, Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client";
import { Brand } from "./identity";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function TeamGate({ onUnlocked }: { onUnlocked: () => Promise<void> }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try { await api("/api/session", { method: "POST", body: JSON.stringify({ action: "unlock", password }) }); await onUnlocked(); }
    catch (error) { setError(error instanceof Error ? error.message : "The team album could not be opened."); }
    finally { setBusy(false); }
  }
  return <main id="main" className="gate-page"><div className="gate-theme"><ThemeToggle /></div><Brand /><div className="gate-card"><div className="gate-icon"><LockKeyhole /></div><h1>A quick hello.<br />And a password.</h1><p>This album belongs to your hackathon team. Enter the shared password to join them.</p><form onSubmit={submit}><FieldGroup><Field><FieldLabel htmlFor="team-password">Team password</FieldLabel><Input id="team-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></Field>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" data-icon="inline-start" />}Open team album</Button></FieldGroup></form></div><span className="gate-location">Rudolfshütte · Music & AI Hackathon 2026</span></main>;
}

export function RecoveryDialog({ code, onClose, onRecovered }: { code?: string; onClose: () => void; onRecovered: () => Promise<void> }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function recover(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await api("/api/session", { method: "POST", body: JSON.stringify({ action: "recover", code: input }) }); toast.success("Your profile is connected to this device again."); await onRecovered(); }
    catch (error) { setError(error instanceof Error ? error.message : "The code could not be checked."); }
    finally { setBusy(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(code!); toast.success("Edit code copied."); }
    catch { toast("Select the code and copy it manually."); }
  }
  return <Dialog open onOpenChange={open => !open && onClose()}><DialogContent className="recovery-dialog"><DialogHeader><DialogTitle><KeyRound className="inline size-5 mr-2" />{code ? "Your profile key" : "Find your profile"}</DialogTitle><DialogDescription>{code ? "Keep this code safe. It lets you edit your profile on another device. Anyone who knows it can change or delete your profile." : "Enter your personal edit code to continue working on your profile on this device."}</DialogDescription></DialogHeader>
    {code ? <FieldGroup><Field><FieldLabel htmlFor="recovery-code">Personal edit code</FieldLabel><Input id="recovery-code" readOnly value={code} onFocus={e => e.target.select()} /></Field><Button onClick={copy}><Copy data-icon="inline-start" />Copy code</Button><p className="text-sm text-muted-foreground">You stay signed in on this device. You can also find the code in your profile later.</p></FieldGroup> : <form onSubmit={recover}><FieldGroup><Field><FieldLabel htmlFor="recover-input">Edit code</FieldLabel><Input id="recover-input" required autoComplete="off" value={input} onChange={e => setInput(e.target.value)} placeholder="Your personal code" /></Field>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<Button disabled={busy} type="submit">{busy && <Loader2 className="animate-spin" data-icon="inline-start" />}Claim profile</Button></FieldGroup></form>}
    </DialogContent></Dialog>;
}
