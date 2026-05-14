import { useRef, useState, useEffect } from 'react';
import { noteToFreq } from '../utils/music';
import { ALL_NOTES } from '../components/VocalRangeKeyboard';

export function useAudioEngine(range) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentModulation, setCurrentModulation] = useState(0);
  
  const audioCtxRef = useRef(null);
  const playStateRef = useRef({
    isPlaying: false,
    timeoutIds: [],
    modulation: 0
  });

  const stopPlayback = () => {
    playStateRef.current.isPlaying = false;
    setIsPlaying(false);
    playStateRef.current.timeoutIds.forEach(id => clearTimeout(id));
    playStateRef.current.timeoutIds = [];
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const playNote = (freq, startTime, duration) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    masterGain.gain.setValueAtTime(0, startTime);
    masterGain.gain.linearRampToValueAtTime(0.4, startTime + 0.005); // fast attack
    masterGain.gain.exponentialRampToValueAtTime(0.08, startTime + 0.305); // short decay
    masterGain.gain.setValueAtTime(0.08, startTime + duration); // sustain holds
    masterGain.gain.linearRampToValueAtTime(0.001, startTime + duration + 0.1); // clean release
    
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

    osc1.start(startTime);
    osc2.start(startTime);

    osc1.stop(startTime + duration + 0.15);
    osc2.stop(startTime + duration + 0.15);
  };

  const startEngine = async (scaleDef, bpm, isLooping, modulationOffset = currentModulation, onFinishScale = null, direction = 'asc_desc') => {
    stopPlayback();
    playStateRef.current.isPlaying = true;
    setIsPlaying(true);
    
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    if (!scaleDef) return;

    const baseRootIdx = ALL_NOTES.indexOf(range.low);
    const maxHighIdx = ALL_NOTES.indexOf(range.high);

    const scheduleSequence = (modOffset) => {
      if (!playStateRef.current.isPlaying) return;
      setCurrentModulation(modOffset);
      playStateRef.current.modulation = modOffset;

      const currentRootIdx = baseRootIdx + modOffset;
      const highestNoteInScaleIdx = currentRootIdx + Math.max(...scaleDef.pattern);
      
      // Stop if top note exceeds user's saved vocal range
      if (highestNoteInScaleIdx > maxHighIdx) {
        stopPlayback();
        if (onFinishScale) onFinishScale();
        return;
      }

      const beatDuration = 60 / bpm;
      const rootFreq = noteToFreq(ALL_NOTES[currentRootIdx]);
      let nextNoteTime = ctx.currentTime + 0.1;

      // Play chord cue
      const root = rootFreq;
      const thirdIndex = scaleDef.pattern.includes(3) ? 3 : (scaleDef.pattern.includes(4) ? 4 : 4);
      const thirdFreq = rootFreq * Math.pow(2, thirdIndex / 12);
      const fifthFreq = rootFreq * Math.pow(2, 7 / 12);
      
      playNote(root, nextNoteTime, 1.0);
      playNote(thirdFreq, nextNoteTime, 1.0);
      playNote(fifthFreq, nextNoteTime, 1.0);
      nextNoteTime += 1.0;

      const ascending = scaleDef.pattern;
      const descending = [...scaleDef.pattern].reverse();
      
      let fullSequence = [];
      if (direction === 'asc_desc') fullSequence = [...ascending, ...descending.slice(1)];
      else if (direction === 'desc_asc') fullSequence = [...descending, ...ascending.slice(1)];
      else if (direction === 'asc') fullSequence = [...ascending];
      else if (direction === 'desc') fullSequence = [...descending];

      fullSequence.forEach((offset) => {
        const freq = rootFreq * Math.pow(2, offset / 12);
        playNote(freq, nextNoteTime, beatDuration * 0.9);
        nextNoteTime += beatDuration;
      });

      // Pause 1.0s before next sequence or stop
      const totalTimeMs = (nextNoteTime - ctx.currentTime + 1.0) * 1000;
      
      const timeoutId = setTimeout(() => {
        if (!playStateRef.current.isPlaying) return;
        if (isLooping) {
          scheduleSequence(modOffset);
        } else {
          scheduleSequence(modOffset + 1);
        }
      }, totalTimeMs);
      
      playStateRef.current.timeoutIds.push(timeoutId);
    };

    scheduleSequence(modulationOffset);
  };

  const playPreview = async (scaleDef) => {
    stopPlayback();
    playStateRef.current.isPlaying = true;
    setIsPlaying(true);
    
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    if (!scaleDef) return;

    const baseRootIdx = ALL_NOTES.indexOf(range.low);
    const rootFreq = noteToFreq(ALL_NOTES[baseRootIdx]);
    
    const bpm = 120; // Default for preview
    const beatDuration = 60 / bpm;
    let nextNoteTime = ctx.currentTime + 0.1;

    // Full ascending pass
    const previewNotes = scaleDef.pattern;
    
    previewNotes.forEach((offset) => {
      const freq = rootFreq * Math.pow(2, offset / 12);
      playNote(freq, nextNoteTime, beatDuration);
      nextNoteTime += beatDuration;
    });

    const totalTimeMs = (nextNoteTime - ctx.currentTime + 0.5) * 1000; // wait for release
    const timeoutId = setTimeout(() => {
      stopPlayback();
    }, totalTimeMs);
    
    playStateRef.current.timeoutIds.push(timeoutId);
  };

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  return {
    isPlaying,
    currentModulation,
    setCurrentModulation,
    startEngine,
    playPreview,
    stopPlayback
  };
}
