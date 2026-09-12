import { Accessibility, AudioLines, AudioWaveform, CableCar, Drum, Guitar, Headphones, Mic2, Mountain, Music, Piano, Radio, Sparkles } from "lucide-react";
import Link from "next/link";
import { initials, type ProfileInput } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { MUSIC_PATH } from "@/lib/routes";

export const avatarIcons = {
  headphones: Headphones,
  piano: Piano,
  mic: Mic2,
  radio: Radio,
  mountain: Mountain,
  sparkles: Sparkles,
  guitar: Guitar,
  drum: Drum,
  music: Music,
  waveform: AudioWaveform,
  cableCar: CableCar,
  accessibility: Accessibility,
};
export const avatarLabels = {
  headphones: "Headphones",
  piano: "Piano",
  mic: "Microphone",
  radio: "Radio",
  mountain: "Mountain",
  sparkles: "Sparkles",
  guitar: "Guitar",
  drum: "Drum",
  music: "Music note",
  waveform: "Sound wave",
  cableCar: "Cable car",
  accessibility: "Accessibility",
};
export const colorLabels = {
  pine: "Pine",
  sun: "Sun",
  lake: "Mountain lake",
  lilac: "Lilac",
  clay: "Clay",
  berry: "Berry",
  sky: "Sky",
  coral: "Coral",
  mint: "Mint",
};

export function Identity({ person, large = false }: { person: Pick<ProfileInput, "name" | "color" | "avatar">; large?: boolean }) {
  const Icon = avatarIcons[person.avatar];
  return <div className={cn("identity", large && "identity-large")} data-color={person.color} aria-hidden="true">
    <span className="identity-initials">{initials(person.name)}</span>
    <span className="identity-icon"><Icon /></span>
  </div>;
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link className="brand" href={MUSIC_PATH} aria-label="Summit Sounds, home"><span className="brand-symbol"><AudioLines aria-hidden="true" /></span><span>summit<span className="brand-rest"> sounds</span><span className="brand-dot">.</span>{!compact && <small>Music for everyone</small>}</span></Link>;
}

export function RecordArtwork() {
  return <div className="record-art" aria-hidden="true">
    <div className="record-sleeve">
      <div className="sleeve-top"><span>Music & AI</span><span>2026</span></div>
      <svg className="mountain-art" viewBox="0 0 320 230" fill="none">
        <circle cx="231" cy="61" r="29" fill="currentColor" opacity=".16" />
        <path d="M-15 221 95 61 158 137 203 83 340 233" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="m62 108 34-47 36 44-23-9-12 20-14-16-21 8Zm115 7 26-32 36 40-18-5-14 8-14-18-16 7Z" fill="currentColor" />
        <path d="m-15 230 109-97 74 97m-40-38 53-47 75 85M-10 46 180 5" stroke="currentColor" strokeWidth="2" opacity=".35" />
        <path d="m41 35 4 17m-12 2 26-5 3 27-26 5-3-27Z" stroke="currentColor" strokeWidth="2" />
      </svg>
      <div className="sleeve-title">Better<br />together.</div>
      <div className="sleeve-bottom"><span>Rudolfshütte</span><span>2,315 m</span></div>
    </div>
    <div className="vinyl"><div className="vinyl-label"><AudioLines /><span>Side A</span><i /></div></div>
    <div className="record-sticker">Fresh minds.<br />Mountain air.</div>
  </div>;
}
