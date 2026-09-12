import type { Composition } from "@/lib/music/composer";

export function MusicScore({ composition, beat = -1 }: { composition: Composition; beat?: number }) {
  const firstNotes = composition.melody.filter(note => note.beat < 8);
  return <div className="music-score" aria-hidden="true">
    <div className="score-labels"><span>Higher</span><span>Lower</span></div>
    <div className="score-grid">
      {[0, 1, 2, 3].map(row => <i className="score-line" key={row} style={{ top: `${row * 28 + 8}%` }} />)}
      {firstNotes.map((note, index) => <span key={index} className="score-note" data-color={["lake", "sun", "lilac", "mint"][index % 4]} data-playing={beat >= 0 && Math.floor(beat % 8) === Math.floor(note.beat)} style={{ left: `${note.beat / 8 * 100}%`, top: `${76 - (note.midi - 60) / 24 * 60}%`, width: `${composition.bpm * note.duration / 60 / 8 * 88}%` }} />)}
    </div>
    <div className="score-count"><span>1</span><span>2</span><span>3</span><span>4</span><span>1</span><span>2</span><span>3</span><span>4</span></div>
  </div>;
}
