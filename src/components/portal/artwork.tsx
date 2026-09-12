import { AudioLines, BookOpen, Code2, Headphones, Leaf, Music2, Pencil, Users } from "lucide-react";

export function MusicCover() {
  return <div className="music-cover" aria-hidden="true">
    <div className="cover-corners"><span>Music & AI</span><span>2026</span></div>
    <svg className="cover-landscape" viewBox="0 0 600 370" fill="none">
      <circle cx="393" cy="145" r="118" fill="var(--record-ink)" />
      {[72, 84, 96, 108].map(radius => <circle key={radius} cx="393" cy="145" r={radius} stroke="var(--person-bg)" opacity=".35" />)}
      <circle cx="393" cy="145" r="47" fill="var(--sun)" /><circle cx="393" cy="145" r="6" fill="var(--record-ink)" />
      <path d="M-20 345 143 103 260 249 340 161 620 375H-20Z" fill="var(--person-bg)" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="m99 168 44-65 45 56-25-7-18 23-17-18-29 11Zm212 26 29-33 43 42-21-5-18 15-16-24-17 5Z" fill="currentColor" />
      <path d="m-5 360 168-117 101 104 89-81 135 93m-462-140 219-41" stroke="currentColor" strokeWidth="2" opacity=".45" />
      <path d="m58 216 4 23m-17 1 36-4 3 34-36 4-3-34Zm18-2 4 33" stroke="currentColor" strokeWidth="2" />
      <path d="M405 313c16-26 30 26 46 0s30 26 46 0 30 26 46 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
    <div className="cover-bottom"><span>Music for<br />more of us.</span><span>Rudolfshütte<br />Austria</span></div>
  </div>;
}

export function FolderArtwork() {
  return <div className="folder-artwork" aria-hidden="true"><div className="folder-back"><span>Field notes</span></div><div className="folder-sheet"><span>Music & AI</span><AudioLines /><span>Rudolfshütte, 2026</span><div className="folder-sheet-lines"><i /><i /><i /></div></div><div className="folder-front"><span className="folder-year">2026</span><div><Code2 /><BookOpen /><Music2 /></div><span>Ideas worth keeping.</span></div><span className="folder-stamp"><Pencil />Made together</span></div>;
}

export function NotebookCover({ title, year }: { title: string; year: number }) {
  return <div className="notebook-cover" data-color="lilac" aria-hidden="true"><span>{year}</span><Code2 /><strong>{title}</strong><span>Ideas, experiments, and people.</span></div>;
}

export function ResourcePreview({ kind }: { kind: "music" | "people" }) {
  if (kind === "people") return <div className="resource-preview people-preview" aria-hidden="true"><div><span data-color="sun"><Headphones /></span><span data-color="mint"><Leaf /></span><span data-color="lilac"><Users /></span></div><span>Different minds. A shared rhythm.</span></div>;
  return <div className="resource-preview tune-preview" aria-hidden="true"><div>{[2, 1, 3, 2, 4, 3, 1, 2].map((height, index) => <span key={index} data-color={["lake", "sun", "lilac", "mint"][index % 4]} style={{ transform: `translateY(${(height - 2) * -9}px)` }} />)}</div><span>A little learning. Your own little tune.</span></div>;
}
