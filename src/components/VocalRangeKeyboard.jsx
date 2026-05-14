import React from 'react';

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const ALL_NOTES = [];
for (let octave = 2; octave <= 6; octave++) {
  for (let note of NOTES) {
    if (octave === 6 && NOTES.indexOf(note) > NOTES.indexOf('A')) continue;
    ALL_NOTES.push(`${note}${octave}`);
  }
}

export default function VocalRangeKeyboard({ lowNote, highNote, onNoteChange }) {
  const handleKeyClick = (noteStr) => {
    // Play note
    const noteMap = { 'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2 };
    const note = noteStr.slice(0, -1);
    const octave = parseInt(noteStr.slice(-1));
    const n = noteMap[note] + (octave - 4) * 12;
    const freq = 440 * Math.pow(2, n / 12);
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.005); // fast attack
    masterGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.305); // short decay
    masterGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.5); // sustain holds
    masterGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5 + 0.1); // clean release
    
    // Fundamental (Sine)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    osc1.connect(masterGain);

    // Attack Transient (Sawtooth)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.value = freq;
    const gain2 = ctx.createGain();
    gain2.gain.value = 0.05; // low gain
    osc2.connect(gain2);
    gain2.connect(masterGain);

    osc1.start();
    osc2.start();

    osc1.stop(ctx.currentTime + 0.5 + 0.15);
    osc2.stop(ctx.currentTime + 0.5 + 0.15);

    if (!onNoteChange) return;
    const lowIdx = ALL_NOTES.indexOf(lowNote);
    const highIdx = ALL_NOTES.indexOf(highNote);
    const clickedIdx = ALL_NOTES.indexOf(noteStr);
    
    if (Math.abs(clickedIdx - lowIdx) < Math.abs(clickedIdx - highIdx)) {
      onNoteChange(noteStr, highNote);
    } else {
      onNoteChange(lowNote, noteStr);
    }
  };

  const renderPianoOctave = (octave) => {
    const notesInOctave = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(n => `${n}${octave}`);
    const whiteNotes = notesInOctave.filter(n => !n.includes('#'));
    
    const whiteKeys = whiteNotes.map(n => {
      if (!ALL_NOTES.includes(n)) return null;
      const isLow = n === lowNote;
      const isHigh = n === highNote;
      const inRange = ALL_NOTES.indexOf(n) >= ALL_NOTES.indexOf(lowNote) && ALL_NOTES.indexOf(n) <= ALL_NOTES.indexOf(highNote);
      
      return (
        <div 
          key={n}
          onClick={() => handleKeyClick(n)}
          className={`flex-none w-8 piano-key-white border-r border-surface-container-lowest/20 rounded-b-sm relative cursor-pointer active:brightness-90 ${inRange ? 'bg-primary/20 ring-2 ring-primary ring-inset' : ''}`}
        >
          {isLow && <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-primary font-bold">L</div>}
          {isHigh && <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-secondary font-bold">H</div>}
          {(n.startsWith('C') || n.startsWith('G')) && <div className="absolute bottom-1 w-full text-center text-[10px] text-surface-variant">{n}</div>}
        </div>
      );
    });

    const getBlackKeyLeft = (note) => {
      const idx = whiteNotes.indexOf(note.replace('#', ''));
      return (idx * 32) + 20; 
    };

    const blackKeys = notesInOctave.filter(n => n.includes('#')).map(n => {
      if (!ALL_NOTES.includes(n)) return null;
      const inRange = ALL_NOTES.indexOf(n) >= ALL_NOTES.indexOf(lowNote) && ALL_NOTES.indexOf(n) <= ALL_NOTES.indexOf(highNote);
      return (
        <div 
          key={n}
          onClick={() => handleKeyClick(n)}
          className={`absolute top-0 w-6 h-[60%] piano-key-black rounded-b-sm z-10 cursor-pointer active:brightness-125 ${inRange ? 'ring-1 ring-primary' : ''}`}
          style={{ left: `${getBlackKeyLeft(n)}px` }}
        />
      );
    });

    return (
      <div key={octave} className="relative flex">
        {whiteKeys}
        {blackKeys}
      </div>
    );
  };

  return (
    <div className="relative h-48 w-full flex overflow-x-auto no-scrollbar rounded-lg">
      {[2, 3, 4, 5, 6].map(octave => renderPianoOctave(octave))}
    </div>
  );
}
