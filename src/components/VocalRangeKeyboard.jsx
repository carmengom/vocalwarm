import React, { useState, useRef, useEffect } from 'react';
import { autoCorrelate, freqToNoteString } from '../utils/pitch';

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const ALL_NOTES = [];
for (let octave = 2; octave <= 6; octave++) {
  for (let note of NOTES) {
    if (octave === 6 && NOTES.indexOf(note) > NOTES.indexOf('A')) continue;
    ALL_NOTES.push(`${note}${octave}`);
  }
}

const VOICE_TYPES = [
  { label: 'Select your voice type', value: '', low: '', high: '' },
  { label: 'Soprano (High Female)', value: 'soprano', low: 'C4', high: 'C6' },
  { label: 'Mezzo-Soprano (Mid Female)', value: 'mezzo', low: 'A3', high: 'A5' },
  { label: 'Contralto/Alto (Low Female)', value: 'alto', low: 'F3', high: 'F5' },
  { label: 'Countertenor (High Male)', value: 'countertenor', low: 'E3', high: 'E5' },
  { label: 'Tenor (Mid/High Male)', value: 'tenor', low: 'C3', high: 'C5' },
  { label: 'Baritone (Mid Male)', value: 'baritone', low: 'A2', high: 'A4' },
  { label: 'Bass (Low Male)', value: 'bass', low: 'E2', high: 'E4' },
];

export default function VocalRangeKeyboard({ lowNote, highNote, onNoteChange }) {
  const [recordingType, setRecordingType] = useState(null); // 'low' or 'high'
  const [recordingStatus, setRecordingStatus] = useState('');
  const [voiceType, setVoiceType] = useState('');
  
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const pitchesRef = useRef([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const handleVoiceTypeChange = (e) => {
    const val = e.target.value;
    setVoiceType(val);
    const selected = VOICE_TYPES.find(vt => vt.value === val);
    if (selected && selected.low && selected.high) {
      if (onNoteChange) onNoteChange(selected.low, selected.high);
    }
  };

  const startRecording = async (type) => {
    setRecordingType(type);
    setRecordingStatus('Listening...');
    pitchesRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.fftSize;
      const buffer = new Float32Array(bufferLength);

      const detectPitch = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(buffer);
        const freq = autoCorrelate(buffer, audioCtxRef.current.sampleRate);
        if (freq !== -1) {
          pitchesRef.current.push(freq);
        }
        rafRef.current = requestAnimationFrame(detectPitch);
      };
      
      detectPitch();

      setTimeout(() => {
        stopRecording(stream, type);
      }, 3000);
      
    } catch (err) {
      setRecordingStatus('Error: Could not access microphone');
      setRecordingType(null);
    }
  };

  const stopRecording = (stream, type) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    stream.getTracks().forEach(track => track.stop());

    const freqs = pitchesRef.current;
    setRecordingType(null);

    if (freqs.length === 0) {
      setRecordingStatus('Could not detect pitch, please try again');
      return;
    }

    // Get median frequency to avoid outliers
    freqs.sort((a, b) => a - b);
    const medianFreq = freqs[Math.floor(freqs.length / 2)];
    const detectedNote = freqToNoteString(medianFreq);

    if (detectedNote) {
      setRecordingStatus(`Detected: ${detectedNote}`);
      if (onNoteChange) {
        if (type === 'low') {
          // ensure low <= high
          const lowIdx = ALL_NOTES.indexOf(detectedNote);
          const highIdx = ALL_NOTES.indexOf(highNote);
          if (lowIdx > highIdx) onNoteChange(detectedNote, detectedNote);
          else onNoteChange(detectedNote, highNote);
        } else {
          const highIdx = ALL_NOTES.indexOf(detectedNote);
          const lowIdx = ALL_NOTES.indexOf(lowNote);
          if (highIdx < lowIdx) onNoteChange(detectedNote, detectedNote);
          else onNoteChange(lowNote, detectedNote);
        }
      }
    } else {
      setRecordingStatus('Could not detect pitch, please try again');
    }
    
    // Clear status after 3s
    setTimeout(() => {
      setRecordingStatus(prev => {
        if (prev && (prev.startsWith('Detected:') || prev.startsWith('Could not') || prev.startsWith('Error'))) return '';
        return prev;
      });
    }, 3000);
  };

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
    <div className="flex flex-col space-y-4">
      <div className="w-full">
        <select 
          value={voiceType} 
          onChange={handleVoiceTypeChange}
          className="w-full bg-surface-container-highest text-white border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
        >
          {VOICE_TYPES.map(vt => (
            <option key={vt.label} value={vt.value}>{vt.label}</option>
          ))}
        </select>
      </div>

      <div className="relative h-48 w-full flex overflow-x-auto no-scrollbar rounded-lg">
        {[2, 3, 4, 5, 6].map(octave => renderPianoOctave(octave))}
      </div>

      <div className="flex flex-col space-y-3">
        <div className="flex justify-between gap-4">
          <button 
            onClick={() => startRecording('low')}
            disabled={recordingType !== null}
            className={`flex-1 py-3 rounded-xl font-headline-md text-sm flex flex-col items-center justify-center gap-1 transition-all ${recordingType === 'low' ? 'bg-error/20 text-error ring-1 ring-error' : 'bg-surface-container-highest text-white hover:brightness-110 disabled:opacity-50'}`}
          >
            {recordingType === 'low' ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                Listening...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">mic</span>
                Record Lowest Note
              </span>
            )}
          </button>
          
          <button 
            onClick={() => startRecording('high')}
            disabled={recordingType !== null}
            className={`flex-1 py-3 rounded-xl font-headline-md text-sm flex flex-col items-center justify-center gap-1 transition-all ${recordingType === 'high' ? 'bg-error/20 text-error ring-1 ring-error' : 'bg-surface-container-highest text-white hover:brightness-110 disabled:opacity-50'}`}
          >
            {recordingType === 'high' ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                Listening...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">mic</span>
                Record Highest Note
              </span>
            )}
          </button>
        </div>

        {recordingStatus && (
          <div className={`text-center text-sm font-medium ${recordingStatus.startsWith('Error') || recordingStatus.startsWith('Could not') ? 'text-error' : 'text-primary'}`}>
            {recordingStatus}
          </div>
        )}
      </div>
    </div>
  );
}
