"use client";

import { useEffect, useRef, useState } from "react";
import { compose, renderWav, type Composition } from "@/lib/music/composer";
import type { MusicChoices } from "@/lib/music/knowledge";

export type MusicTrack = { url: string; title: string; choices: MusicChoices; composition: Composition };

export function useMusicTrack() {
  const audio = useRef<HTMLAudioElement>(null);
  const request = useRef<AbortController | null>(null);
  const objectUrl = useRef<string | null>(null);
  const [track, setTrack] = useState<MusicTrack | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => () => {
    request.current?.abort();
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  function pause() { audio.current?.pause(); }
  async function togglePlayback() {
    if (!audio.current) return;
    if (!audio.current.paused) { pause(); return; }
    setError("");
    try { await audio.current.play(); }
    catch { setError("Playback could not start. Try the audio player, or download your piece to listen."); }
  }
  function cancel() {
    request.current?.abort();
    setBusy(false);
    pause();
  }

  async function prepare(choices: MusicChoices, title: string, options: { seed?: number; bars?: number; layer?: "melody" | "beat"; autoplay?: boolean } = {}) {
    cancel();
    setError("");
    setBusy(true);
    const controller = new AbortController();
    request.current = controller;
    try {
      const seed = options.seed ?? crypto.getRandomValues(new Uint32Array(1))[0];
      const composition = compose(choices, seed, options.bars, options.layer);
      const blob = await renderWav(composition, controller.signal);
      controller.signal.throwIfAborted();
      const url = URL.createObjectURL(blob);
      const oldUrl = objectUrl.current;
      objectUrl.current = url;
      setTrack({ url, title, choices: { ...choices }, composition });
      setTime(0);
      if (audio.current) {
        audio.current.src = url;
        audio.current.volume = 0.5;
        audio.current.load();
      }
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      if (options.autoplay && audio.current) {
        try { await audio.current.play(); }
        catch { if (!controller.signal.aborted) setError("Your example is ready. Press Play in the audio player to listen."); }
      }
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error && error.name === "NotSupportedError" ? "This browser cannot play the audio. Try a recent browser, or download your piece to listen." : "The music could not be created. Please try again.");
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return { audio, track, busy, error, playing, time, prepare, pause, cancel, togglePlayback, setPlaying, setTime };
}

export type MusicPlayer = ReturnType<typeof useMusicTrack>;
