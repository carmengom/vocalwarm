import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { SCALES_DEF, getNoteString } from '../utils/music';
import { ALL_NOTES } from '../utils/music';

export default function ActiveRoutine({ routineId, isMinimized, onMinimize, onStop }) {
  const [routines] = useLocalStorage('vw_routines', []);
  const [recordings] = useLocalStorage('vw_recordings', []);
  const [range] = useLocalStorage('vw_range', { low: 'C3', high: 'C5' });
  
  const routine = routines.find(r => r.id === routineId);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMediaSessionSetup, setIsMediaSessionSetup] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [isLooping, setIsLooping] = useState(false);
  const [direction, setDirection] = useState('asc_desc');

  const { isPlaying, currentModulation, setCurrentModulation, startEngine, stopPlayback } = useAudioEngine(range);
  const timerRef = useRef(null);
  const audioRef = useRef(null); // For recordings

  const exercises = routine?.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];
  const nextExercise = exercises[currentExerciseIndex + 1];

  const totalExercises = exercises.length;
  const progressPercent = totalExercises > 0 ? Math.round(((currentExerciseIndex) / totalExercises) * 100) : 0;

  // Setup Media Session
  useEffect(() => {
    if ('mediaSession' in navigator && currentExercise) {
      const isRecording = currentExercise.id.toString().length > 10; // Simple check if it's a timestamp ID
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentExercise.name,
        artist: routine.name,
        album: 'VocalWarm',
        artwork: [
          { src: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%236B4FBB%22><path d=%22M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.39-.9.88 0 2.76-2.24 5-5 5s-5-2.24-5-5c0-.49-.41-.88-.9-.88s-.9.39-.9.88c0 3.24 2.54 5.92 5.74 6.27V21c0 .55.45 1 1 1s1-.45 1-1v-2.85c3.2-.35 5.74-3.03 5.74-6.27 0-.49-.41-.88-.9-.88z%22/></svg>', sizes: '512x512', type: 'image/svg+xml' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', playCurrent);
      navigator.mediaSession.setActionHandler('pause', pauseCurrent);
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);
      setIsMediaSessionSetup(true);
    }
    
    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
    };
  }, [currentExercise, routine]);

  // Load and start exercise
  useEffect(() => {
    if (!currentExercise) return;
    
    const scaleDef = SCALES_DEF.find(s => s.id === currentExercise.id);
    if (scaleDef) {
      const baseRootIdx = ALL_NOTES.indexOf(range.low);
      const maxHighIdx = ALL_NOTES.indexOf(range.high);
      const scaleMax = Math.max(...scaleDef.pattern);
      const maxMods = Math.max(0, maxHighIdx - baseRootIdx - scaleMax + 1);
      
      let fullSequenceLength = 0;
      if (direction === 'asc_desc' || direction === 'desc_asc') fullSequenceLength = scaleDef.pattern.length * 2 - 1;
      else fullSequenceLength = scaleDef.pattern.length;

      const seqDur = 2.0 + fullSequenceLength * (60 / bpm);
      setExerciseTimeLeft(Math.ceil(maxMods * seqDur));
    } else {
      setExerciseTimeLeft(currentExercise.duration * 60);
    }
    
    setIsPaused(false);
    setCurrentModulation(0);
    
    playCurrent(0);

    return () => {
      stopPlayback();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      clearInterval(timerRef.current);
    };
  }, [currentExerciseIndex]);

  // Handle BPM/Loop/Direction changes
  useEffect(() => {
    if (isPlaying && !isPaused) {
      playCurrent(currentModulation);
    }
    // eslint-disable-next-line
  }, [bpm, isLooping, direction]);

  // Timer logic
  useEffect(() => {
    if (!isPaused && exerciseTimeLeft > 0) {
      timerRef.current = setInterval(() => {
        setExerciseTimeLeft(prev => {
          if (prev <= 1) {
            handleNext();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused, exerciseTimeLeft]);

  const playCurrent = (modOffset = currentModulation) => {
    setIsPaused(false);
    const scaleDef = SCALES_DEF.find(s => s.id === currentExercise.id);
    if (scaleDef) {
      startEngine(scaleDef, bpm, isLooping, typeof modOffset === 'number' ? modOffset : currentModulation, handleNext, direction);
    } else {
      // Must be a recording
      const rec = recordings.find(r => r.id === currentExercise.id);
      if (rec && rec.blobUrl) {
        if (!audioRef.current) {
          audioRef.current = new Audio(rec.blobUrl);
          audioRef.current.loop = true;
        }
        audioRef.current.play();
      }
    }
  };

  const pauseCurrent = () => {
    setIsPaused(true);
    stopPlayback();
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const togglePlayPause = () => {
    if (isPaused) playCurrent();
    else pauseCurrent();
  };

  const handleNext = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Routine finished
      onStop();
    }
  };

  const handlePrev = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const handleJumpPrev = () => {
    if (currentModulation > 0) {
      const newMod = currentModulation - 1;
      setCurrentModulation(newMod);
      if (!isPaused && isPlaying) playCurrent(newMod);
    }
  };

  const handleJumpNext = () => {
    const newMod = currentModulation + 1;
    setCurrentModulation(newMod);
    if (!isPaused && isPlaying) playCurrent(newMod);
  };

  const handleStopAll = (e) => {
    if (e) e.stopPropagation();
    stopPlayback();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    onStop();
  };

  if (!routine || !currentExercise) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isRecording = currentExercise.id.toString().length > 10;
  const scaleDef = SCALES_DEF.find(s => s.id === currentExercise.id);
  const groupLabel = isRecording ? 'MY RECORDING' : (scaleDef?.category?.toUpperCase() || 'EXERCISE');

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-40 glass-panel border border-primary/20 p-3 rounded-xl flex items-center justify-between shadow-2xl shadow-[#0F0D13] animate-[slideUp_0.3s_ease]">
        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={onMinimize}>
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-none">
            <span className="material-symbols-outlined">play_circle</span>
          </div>
          <div className="flex-1 min-w-0 cursor-pointer">
            <p className="text-white font-headline-md text-sm truncate">{currentExercise.name}</p>
            <p className="text-primary text-[10px] uppercase tracking-widest truncate">{routine.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-none">
          <button className="w-10 h-10 flex items-center justify-center text-white" onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}>
            <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>{isPaused ? 'play_arrow' : 'pause'}</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-error" onClick={handleStopAll}>
            <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>stop</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0F0D13] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-white/5">
        <div className="w-10 h-10 flex items-center justify-center invisible"></div>
        <div className="text-center">
          <span className="text-[10px] text-primary uppercase tracking-widest font-bold">Active Routine</span>
          <h2 className="text-white font-headline-md text-lg truncate max-w-[200px]">{routine.name}</h2>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant active:scale-95 transition-all text-white" onClick={onMinimize}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      {/* Progress */}
      <div className="px-6 pt-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-white font-bold tracking-widest text-xs uppercase">Step {currentExerciseIndex + 1} of {totalExercises}</span>
          <span className="text-on-surface-variant text-xs">{progressPercent}% Complete</span>
        </div>
        <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center justify-center space-y-8">
        
        <div className="text-center space-y-4 w-full">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest bg-primary/20 text-primary">
            {groupLabel}
          </div>
          <h1 className="font-display-lg text-4xl text-white">{currentExercise.name}</h1>
          {!isRecording && scaleDef && (
            <p className="text-on-surface-variant text-sm max-w-[250px] mx-auto">
              {scaleDef.solfeo}
            </p>
          )}
        </div>

        {/* Timer Display */}
        <div className="text-center py-6">
          <div className="font-display-lg text-[80px] leading-none text-white font-bold tracking-tighter">
            {formatTime(exerciseTimeLeft)}
          </div>
          <div className="text-primary text-xs uppercase tracking-widest font-bold mt-2">Remaining</div>
        </div>

        {/* Per-Exercise Controls */}
        {!isRecording && scaleDef && (
          <div className="w-full max-w-[280px] mx-auto space-y-5 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-on-surface-variant text-sm uppercase tracking-widest">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">swap_vert</span> Direction</span>
              </div>
              <select 
                value={direction} 
                onChange={(e) => setDirection(e.target.value)}
                className="w-full bg-surface-container-highest text-white border-none rounded-xl p-2 focus:ring-2 focus:ring-primary outline-none text-sm"
              >
                <option value="asc_desc">Ascending, then descending</option>
                <option value="desc_asc">Descending, then ascending</option>
                <option value="asc">Ascending only</option>
                <option value="desc">Descending only</option>
              </select>
            </div>
            
            <div className="flex justify-between items-center text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-[18px]">speed</span>
              <span className="font-bold">{bpm} BPM</span>
            </div>
            <input type="range" min="60" max="160" value={bpm} onChange={e => setBpm(Number(e.target.value))} className="w-full accent-primary" />
            
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Loop on current key</span>
              <button 
                className={`w-12 h-6 rounded-full transition-colors relative ${isLooping ? 'bg-primary' : 'bg-surface-variant'}`}
                onClick={() => setIsLooping(!isLooping)}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isLooping ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex justify-between items-center border-t border-white/10 pt-4">
              <button className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all disabled:opacity-30" onClick={handleJumpPrev} disabled={currentModulation <= 0}>
                <span className="material-symbols-outlined text-[20px]">fast_rewind</span>
              </button>
              <div className="text-center text-primary font-bold text-sm tracking-widest uppercase">
                Playing in {getNoteString(ALL_NOTES.indexOf(range.low) + currentModulation) || range.low}
              </div>
              <button className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all disabled:opacity-30" onClick={handleJumpNext}>
                <span className="material-symbols-outlined text-[20px]">fast_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-8 w-full pt-4">
          <button 
            className="w-14 h-14 flex items-center justify-center rounded-full hover:bg-surface-variant active:scale-95 transition-all disabled:opacity-30 text-white"
            onClick={handlePrev}
            disabled={currentExerciseIndex === 0}
          >
            <span className="material-symbols-outlined text-3xl">skip_previous</span>
          </button>
          
          <button 
            className="w-24 h-24 flex items-center justify-center rounded-full bg-primary text-white shadow-[0_0_30px_rgba(107,79,187,0.4)] hover:brightness-110 active:scale-95 transition-all"
            onClick={togglePlayPause}
          >
            <span className="material-symbols-outlined text-5xl" style={{fontVariationSettings: "'FILL' 1"}}>
              {isPaused ? 'play_arrow' : 'pause'}
            </span>
          </button>

          <button 
            className="w-14 h-14 flex items-center justify-center rounded-full hover:bg-surface-variant active:scale-95 transition-all disabled:opacity-30 text-white"
            onClick={handleNext}
          >
            <span className="material-symbols-outlined text-3xl">skip_next</span>
          </button>
        </div>
      </div>

      {/* Next Card */}
      {nextExercise && (
        <div className="px-6 pb-8">
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4 bg-surface-container-highest/30">
            <div className="w-12 h-12 flex-none rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">queue_music</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-0.5">Coming up next</p>
              <h4 className="font-headline-md text-white text-base truncate">{nextExercise.name}</h4>
            </div>
            <span className="material-symbols-outlined text-outline">chevron_right</span>
          </div>
        </div>
      )}
    </div>
  );
}
