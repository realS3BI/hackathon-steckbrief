"use client";

import { useState } from "react";
import { ExternalLink, KeyRound, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { questions, sections, type Profile } from "@/lib/profile";
import { api } from "@/lib/client";
import { Identity } from "./identity";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

export function ProfileDetail({ person, mine, onClose, onEdit, onDeleted, onRecovery }: { person: Profile; mine: boolean; onClose: () => void; onEdit: () => void; onDeleted: () => Promise<void>; onRecovery: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  async function remove() {
    setDeleting(true);
    try {
      await api(`/api/profiles/${person.id}`, { method: "DELETE" });
      try { localStorage.removeItem(`huettentoene:draft:${person.id}`); } catch { /* The server-side deletion is complete. */ }
      toast.success("Your profile was deleted.");
      await onDeleted();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Your profile could not be deleted."); }
    finally { setDeleting(false); }
  }
  return <>
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="detail-dialog">
        <DialogHeader><div className="detail-person" data-color={person.color}><Identity person={person} large /><div><DialogTitle>{person.name}</DialogTitle><DialogDescription>{person.answers.role || "With us at Rudolfshütte."}</DialogDescription></div></div></DialogHeader>
        <div className="detail-scroll">
          {person.answers.motto && <blockquote className="detail-motto">&ldquo;{person.answers.motto}&rdquo;</blockquote>}
          {sections.map((section, i) => {
            const answered = questions.filter(q => q.section === i && person.answers[q.key]);
            if (!answered.length) return null;
            return <section key={section.short} className="answer-section"><h3>{section.title}</h3><dl>{answered.map(q => <div key={q.key}><dt>{q.label}</dt><dd>{q.key === "songUrl" ? <a href={person.answers[q.key]} target="_blank" rel="noopener noreferrer" className="text-link">Open song<ExternalLink aria-hidden="true" /></a> : person.answers[q.key]}</dd></div>)}</dl></section>;
          })}
          {!questions.some(q => person.answers[q.key]) && <p className="text-muted-foreground">The first step is done. The stories can come later.</p>}
        </div>
        {mine && <div className="detail-actions"><Button variant="ghost" size="icon" aria-label="Delete profile" onClick={() => setConfirmDelete(true)}><Trash2 /></Button><Button variant="outline" onClick={onRecovery}><KeyRound data-icon="inline-start" />Edit code</Button><Button onClick={onEdit}><Pencil data-icon="inline-start" />Edit</Button></div>}
      </DialogContent>
    </Dialog>
    <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete your profile?</AlertDialogTitle><AlertDialogDescription>Your profile and all its answers will be removed from the team album. This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={deleting}>Keep it</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={deleting} onClick={event => { event.preventDefault(); void remove(); }}>{deleting ? "Deleting..." : "Delete profile"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
    </AlertDialog>
  </>;
}
