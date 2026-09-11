"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, CloudOff, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client";
import { avatars, colors, emptyProfile, profileSchema, questions, sections, type Profile, type ProfileInput } from "@/lib/profile";
import { Identity, avatarIcons, avatarLabels, colorLabels } from "./identity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

function readDraft(key: string): ProfileInput | null {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(key) || "null");
    if (!stored || typeof stored !== "object") return null;
    const value = stored as Record<string, unknown>;
    const fallback = emptyProfile();
    const answers = value.answers && typeof value.answers === "object" ? value.answers as Record<string, unknown> : {};
    return {
      name: typeof value.name === "string" ? value.name.slice(0, 70) : "",
      color: typeof value.color === "string" && colors.includes(value.color as ProfileInput["color"]) ? value.color as ProfileInput["color"] : fallback.color,
      avatar: typeof value.avatar === "string" && avatars.includes(value.avatar as ProfileInput["avatar"]) ? value.avatar as ProfileInput["avatar"] : fallback.avatar,
      answers: Object.fromEntries(questions.map(question => {
        const answer = answers[question.key];
        return [question.key, typeof answer === "string" ? answer.slice(0, question.max) : ""];
      })) as ProfileInput["answers"],
    };
  } catch { return null; }
}

export function ProfileEditor({ existing, onClose, onSaved, protectedAlbum }: { existing?: Profile; onClose: () => void; onSaved: (code?: string) => Promise<void>; protectedAlbum: boolean }) {
  const draftKey = `huettentoene:draft:${existing?.id || "new"}`;
  const [draft] = useState(() => readDraft(draftKey));
  const [value, setValue] = useState<ProfileInput>(() => existing || draft || emptyProfile());
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState("");
  const [draftNotice, setDraftNotice] = useState(Boolean(draft));
  const [draftFailed, setDraftFailed] = useState(false);
  const completed = Number(Boolean(value.name.trim())) + questions.filter(q => value.answers[q.key].trim()).length;
  const total = questions.length + 1;

  function change(next: ProfileInput) {
    setValue(next);
    setInvalid("");
    setError("");
    try { localStorage.setItem(draftKey, JSON.stringify(next)); setDraftFailed(false); }
    catch { setDraftFailed(true); }
  }

  function resetDraft() {
    const next = existing || emptyProfile();
    setValue(next);
    setDraftNotice(false);
    try { localStorage.removeItem(draftKey); } catch { /* Editing works without local storage. */ }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = profileSchema.safeParse(value);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const key = String(issue.path.at(-1));
      setInvalid(key);
      setError(issue.message);
      setStep(key === "name" ? 0 : questions.find(q => q.key === key)?.section || 0);
      requestAnimationFrame(() => document.getElementById(`profile-${key}`)?.focus());
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api<{ profile: Profile; recoveryCode?: string }>(existing ? `/api/profiles/${existing.id}` : "/api/profiles", {
        method: existing ? "PUT" : "POST",
        body: JSON.stringify(existing ? { profile: parsed.data, version: existing.updatedAt } : parsed.data),
      });
      try { localStorage.removeItem(draftKey); } catch { /* The server has already saved the profile. */ }
      toast.success(existing ? "Your profile is up to date." : "You are in the team album!");
      await onSaved(result.recoveryCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your profile could not be saved.");
    } finally { setBusy(false); }
  }

  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <DialogContent className="editor-dialog" onInteractOutside={event => event.preventDefault()}>
      <DialogHeader>
        <DialogTitle>{existing ? "Edit your profile" : "Your place in the team album"}</DialogTitle>
        <DialogDescription>Only your name is required. Answer as much or as little as you like.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} noValidate className="editor-form">
        <Tabs value={String(step)} onValueChange={v => setStep(Number(v))}>
          <TabsList className="editor-tabs" aria-label="Profile sections">
            {sections.map((section, i) => <TabsTrigger key={section.short} value={String(i)} aria-controls={`editor-section-${i}`}><span className="step-number">{i + 1}</span>{section.short}</TabsTrigger>)}
          </TabsList>
        </Tabs>
        <div className="editor-scroll" id={`editor-section-${step}`}>
          {draftNotice && <Alert className="mb-5"><RotateCcw /><AlertDescription>
            {existing ? "There is an unsaved draft on this device." : "Your last draft is back."}
            <div className="flex flex-wrap gap-2 mt-2">
              {existing && <Button type="button" size="sm" variant="outline" onClick={() => { change(draft!); setDraftNotice(false); }}>Load draft</Button>}
              <Button type="button" size="sm" variant="ghost" onClick={resetDraft}>Discard draft</Button>
            </div>
          </AlertDescription></Alert>}
          <div className="section-intro"><h3>{sections[step].title}</h3><p>{sections[step].subtitle}</p></div>
          <FieldGroup>
            {step === 0 && <>
              <div className="editor-identity"><Identity person={value} large /><div><strong>This is your backstage pass.</strong><p>Make it yours with a name, color, and symbol.</p></div></div>
              <Field data-invalid={invalid === "name"}>
                <FieldLabel htmlFor="profile-name">What is your name? <span aria-hidden="true">*</span></FieldLabel>
                <Input id="profile-name" name="name" autoComplete="name" maxLength={70} placeholder="What should we call you?" value={value.name} aria-required="true" aria-invalid={invalid === "name"} aria-describedby={invalid === "name" ? "editor-error" : undefined} onChange={e => change({ ...value, name: e.target.value })} />
              </Field>
              <div className="identity-options">
                <Field><FieldLabel id="color-label">Your color</FieldLabel><ToggleGroup type="single" value={value.color} onValueChange={v => v && change({ ...value, color: v as ProfileInput["color"] })} aria-labelledby="color-label" className="color-picker">
                  {colors.map(color => <ToggleGroupItem key={color} value={color} aria-label={colorLabels[color]} title={colorLabels[color]}><span className="color-swatch" data-color={color}>{value.color === color && <Check />}</span></ToggleGroupItem>)}
                </ToggleGroup></Field>
                <Field><FieldLabel id="avatar-label">Your symbol</FieldLabel><ToggleGroup type="single" value={value.avatar} onValueChange={v => v && change({ ...value, avatar: v as ProfileInput["avatar"] })} aria-labelledby="avatar-label" className="avatar-picker">
                  {avatars.map(avatar => { const Icon = avatarIcons[avatar]; return <ToggleGroupItem key={avatar} value={avatar} aria-label={avatarLabels[avatar]} title={avatarLabels[avatar]}><Icon /></ToggleGroupItem>; })}
                </ToggleGroup></Field>
              </div>
            </>}
            {questions.filter(q => q.section === step).map(q => <Field key={q.key} data-invalid={invalid === q.key}>
              <FieldLabel htmlFor={`profile-${q.key}`}>{q.label}</FieldLabel>
              {"multiline" in q ? <Textarea id={`profile-${q.key}`} name={q.key} placeholder={q.placeholder} maxLength={q.max} rows={3} value={value.answers[q.key]} aria-invalid={invalid === q.key} aria-describedby={invalid === q.key ? "editor-error" : undefined} onChange={e => change({ ...value, answers: { ...value.answers, [q.key]: e.target.value } })} /> : <Input id={`profile-${q.key}`} name={q.key} type={q.key === "songUrl" ? "url" : "text"} placeholder={q.placeholder} maxLength={q.max} value={value.answers[q.key]} aria-invalid={invalid === q.key} aria-describedby={invalid === q.key ? "editor-error" : undefined} onChange={e => change({ ...value, answers: { ...value.answers, [q.key]: e.target.value } })} />}
              {"multiline" in q && <FieldDescription>{value.answers[q.key].length} / {q.max} characters</FieldDescription>}
            </Field>)}
          </FieldGroup>
          {step === 3 && <p className="sharing-note">When you publish, your answers become visible {protectedAlbum ? "to everyone with the team password" : "to everyone with the link"} and may appear in the presentation.</p>}
        </div>
        <div className="editor-bottom">
          {error && <Alert variant="destructive" id="editor-error" className="mb-3"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="completion-label"><span>{completed} of {total} questions answered</span><span>{draftFailed ? <><CloudOff className="inline size-3" /> Draft only exists in this open form</> : "Draft stays on this device"}</span></div>
          <Progress value={completed / total * 100} aria-label={`${completed} of ${total} questions answered`} className="mb-4" />
          <div className="editor-actions">
            <Button type="button" variant="ghost" disabled={busy} onClick={() => step ? setStep(step - 1) : onClose()}>{step ? <><ArrowLeft data-icon="inline-start" />Back</> : "Continue later"}</Button>
            <div className="flex gap-2">
              {step < 3 && <Button type="button" variant="outline" onClick={() => setStep(step + 1)} disabled={busy}>Next<ArrowRight data-icon="inline-end" /></Button>}
              <Button type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Check data-icon="inline-start" />}{existing ? "Save" : "Publish"}</Button>
            </div>
          </div>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}
