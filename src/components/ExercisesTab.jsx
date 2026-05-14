import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { SCALES_DEF, getNoteString } from '../utils/music';

import VocalRangeKeyboard, { ALL_NOTES } from './VocalRangeKeyboard';

export default function ExercisesTab() {
  const [range, setRange] = useLocalStorage('vw_range', { low: 'C3', high: 'C5' });
  const [lowNote, setLowNote] = useState(range.low);
  const [highNote, setHighNote] = useState(range.high);
  const [isRangeExpanded, setIsRangeExpanded] = useState(false);
  const [search, setSearch] = useState('');
  
  // Playback State
  const [playingScale, setPlayingScale] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [isLooping, setIsLooping] = useState(false);
  const [direction, setDirection] = useState('asc_desc');
  
  const { isPlaying, currentModulation, setCurrentModulation, startEngine, stopPlayback } = useAudioEngine(range);

  useEffect(() => {
    setLowNote(range.low);
    setHighNote(range.high);
  }, [range]);

  const saveRange = () => {
    setRange({ low: lowNote, high: highNote });
    setIsRangeExpanded(false);
  };

  const handleNoteChange = (newLow, newHigh) => {
    setLowNote(newLow);
    setHighNote(newHigh);
  };

  const handleStop = () => {
    stopPlayback();
    setCurrentModulation(0);
  };

  const handleStartEngine = (modOffset = currentModulation) => {
    const scaleDef = SCALES_DEF.find(s => s.id === playingScale);
    startEngine(scaleDef, bpm, isLooping, modOffset, null, direction);
  };

  const openScale = (scaleId) => {
    setPlayingScale(scaleId);
    setCurrentModulation(0);
    const scaleDef = SCALES_DEF.find(s => s.id === scaleId);
    if (scaleDef) {
      startEngine(scaleDef, bpm, isLooping, 0, null, direction);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      handleStartEngine(currentModulation);
    }
    // eslint-disable-next-line
  }, [bpm, isLooping, direction]);

  useEffect(() => {
    return stopPlayback;
  }, []);



  const filteredScales = SCALES_DEF.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const categories = [...new Set(filteredScales.map(s => s.category))];

  const currentScaleDef = SCALES_DEF.find(s => s.id === playingScale);
  const currentRootKey = getNoteString(ALL_NOTES.indexOf(range.low) + currentModulation) || range.low;

  return (
    <div className="pt-20 px-6 max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease] pb-32">
      <header className="fixed top-0 left-0 z-40 w-full bg-[#0F0D13]/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-6 py-4 shadow-[0_4px_20px_rgba(107,79,187,0.1)]">
        <div className="text-slate-100 font-epilogue text-lg font-bold">Exercises</div>
      </header>

      {/* Vocal Range Top Section */}
      <section>
        {!isRangeExpanded ? (
          <div 
            className="glass-panel rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-primary/40 transition-all"
            onClick={() => setIsRangeExpanded(true)}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">piano</span>
              <div>
                <span className="text-label-sm uppercase tracking-widest text-on-surface-variant block">Your Range</span>
                <span className="font-headline-md text-white">{range.low} <span className="text-primary mx-1">→</span> {range.high}</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline">expand_more</span>
          </div>
        ) : (
          <div className="glass-panel rounded-xl p-6 diffusion-glow animate-[slideDown_0.3s_ease]">
            <div className="flex justify-between items-end mb-6">
              <div className="text-center">
                <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-tighter">Lowest Note</span>
                <span className="font-headline-lg text-headline-lg text-primary">{lowNote}</span>
              </div>
              <div className="flex-grow mx-6 h-1 vocal-range-indicator rounded-full opacity-50 relative top-[-12px]">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg shadow-primary/40 border-2 border-surface"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-secondary rounded-full shadow-lg shadow-secondary/40 border-2 border-surface"></div>
              </div>
              <div className="text-center">
                <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-tighter">Highest Note</span>
                <span className="font-headline-lg text-headline-lg text-secondary">{highNote}</span>
              </div>
            </div>

            <VocalRangeKeyboard lowNote={lowNote} highNote={highNote} onNoteChange={handleNoteChange} />

            <button className="w-full mt-6 py-4 bg-primary-container text-white font-headline-md text-headline-md rounded-xl shadow-lg shadow-primary-container/20 border-t border-white/10 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2" onClick={saveRange}>
              <span className="material-symbols-outlined text-[20px]">save</span>
              Save Range
            </button>
          </div>
        )}
      </section>

      {/* Main Section - Searchable Scale Library */}
      <section className="space-y-6">
        <div className="glass-panel rounded-xl p-2 flex items-center gap-3 focus-within:ring-2 focus-within:ring-primary focus-within:diffusion-glow transition-all">
          <span className="material-symbols-outlined text-outline ml-2">search</span>
          <input 
            type="text" 
            placeholder="Search exercises..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-white py-2 focus:outline-none focus:ring-0 placeholder:text-outline"
          />
        </div>

        <div className="space-y-8">
          {categories.map(category => (
            <div key={category} className="space-y-3">
              <h3 className="font-headline-sm text-lg text-white/80 pb-1 border-b border-white/10">{category}</h3>
              {filteredScales.filter(s => s.category === category).map(scale => (
                <div 
                  key={scale.id} 
                  className="glass-panel p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:border-primary/40 active:scale-[0.98] transition-all"
                  onClick={() => openScale(scale.id)}
                >
                  <div className={`w-12 h-12 flex-none rounded-lg flex items-center justify-center font-bold text-[11px] tracking-widest ${scale.badgeColor}`}>
                    {scale.badge}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-headline-md text-white text-base truncate">{scale.name}</h4>
                    <p className="text-on-surface-variant text-xs truncate mt-0.5">{scale.solfeo}</p>
                  </div>
                  <span className="material-symbols-outlined text-outline">chevron_right</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Playback Modal */}
      {isModalOpen && currentScaleDef && (
        <div className="fixed inset-0 z-50 bg-[#0F0D13] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
          <header className="flex justify-between items-center px-6 py-4 border-b border-white/5">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant active:scale-95 transition-all" onClick={() => setIsModalOpen(false)}>
              <span className="material-symbols-outlined text-white">expand_more</span>
            </button>
            <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest ${currentScaleDef.badgeColor}`}>
              {currentScaleDef.badge}
            </div>
            <div className="w-10"></div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center justify-center space-y-10">
            <div className="text-center space-y-2 w-full">
              <h2 className="font-display-lg text-4xl text-white">{currentScaleDef.name}</h2>
              <p className="text-primary text-lg font-medium">{currentRootKey}</p>
              <div className="bg-surface-container-highest rounded-lg p-4 mt-6 max-w-sm mx-auto">
                <p className="text-on-surface-variant text-sm leading-relaxed text-center">
                  {currentScaleDef.solfeo} <br/> 
                  <span className="opacity-50 block mt-2">
                    {currentScaleDef.solfeo.split(' ').reverse().slice(1).join(' ')}
                  </span>
                </p>
              </div>
            </div>

            <div className="w-full max-w-sm space-y-6">
              <div className="flex items-center justify-between text-label-sm text-on-surface-variant uppercase tracking-widest">
                <span>Range</span>
                <span className="text-white">{range.low} → {range.high}</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-label-sm text-on-surface-variant uppercase tracking-widest">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">swap_vert</span> Direction</span>
                </div>
                <select 
                  value={direction} 
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full bg-surface-container-highest text-white border-none rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="asc_desc">Ascending, then descending</option>
                  <option value="desc_asc">Descending, then ascending</option>
                  <option value="asc">Ascending only</option>
                  <option value="desc">Descending only</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-label-sm text-on-surface-variant uppercase tracking-widest">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">music_note</span> BPM</span>
                  <span className="text-white">{bpm}</span>
                </div>
                <input type="range" min="60" max="160" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>

              <div className="flex justify-between items-center glass-panel p-4 rounded-xl">
                <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">Loop on current key</span>
                <button 
                  className={`w-12 h-6 rounded-full relative transition-colors ${isLooping ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  onClick={() => setIsLooping(!isLooping)}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isLooping ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 pt-4">
              <button 
                className="w-14 h-14 flex items-center justify-center rounded-full hover:bg-surface-variant active:scale-95 transition-all disabled:opacity-30"
                onClick={() => {
                  if (currentModulation > 0) {
                    const newMod = currentModulation - 1;
                    setCurrentModulation(newMod);
                    if (isPlaying) handleStartEngine(newMod);
                  }
                }}
                disabled={currentModulation <= 0}
              >
                <span className="material-symbols-outlined text-3xl text-white">skip_previous</span>
              </button>
              
              <button 
                className="w-20 h-20 flex items-center justify-center rounded-full bg-primary text-white shadow-[0_0_30px_rgba(107,79,187,0.4)] hover:brightness-110 active:scale-95 transition-all"
                onClick={() => {
                  if (isPlaying) {
                    stopPlayback();
                  } else {
                    handleStartEngine(currentModulation);
                  }
                }}
              >
                <span className="material-symbols-outlined text-5xl" style={{fontVariationSettings: "'FILL' 1"}}>
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <button 
                className="w-14 h-14 flex items-center justify-center rounded-full hover:bg-surface-variant active:scale-95 transition-all"
                onClick={() => {
                  const newMod = currentModulation + 1;
                  setCurrentModulation(newMod);
                  if (isPlaying) handleStartEngine(newMod);
                }}
              >
                <span className="material-symbols-outlined text-3xl text-white">skip_next</span>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
               <button className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-surface-variant active:scale-95 transition-all" onClick={handleStop}>
                 <span className="material-symbols-outlined text-error text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>stop_circle</span>
               </button>
               {isPlaying && <div className="text-primary text-sm font-bold tracking-widest animate-pulse">PLAYING IN {currentRootKey}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Mini Player Bar */}
      {isPlaying && !isModalOpen && currentScaleDef && (
        <div className="fixed bottom-20 left-4 right-4 z-40 glass-panel border border-primary/20 p-3 rounded-xl flex items-center justify-between shadow-2xl shadow-[#0F0D13] animate-[slideUp_0.3s_ease]">
           <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setIsModalOpen(true)}>
             <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
               <span className="material-symbols-outlined">music_note</span>
             </div>
             <div className="flex-1 min-w-0 cursor-pointer">
                <p className="text-white font-headline-md text-sm truncate">{currentScaleDef.name}</p>
                <p className="text-primary text-[10px] uppercase tracking-widest">Key: {currentRootKey}</p>
             </div>
           </div>
           <div className="flex items-center gap-2">
             <button className="w-10 h-10 flex items-center justify-center text-white" onClick={stopPlayback}>
               <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>pause</span>
             </button>
             <button className="w-10 h-10 flex items-center justify-center text-error" onClick={handleStop}>
               <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>stop</span>
             </button>
           </div>
        </div>
      )}
    </div>
  );
}
