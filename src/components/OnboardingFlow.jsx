import React, { useState } from 'react';
import VocalRangeKeyboard from './VocalRangeKeyboard';

export default function OnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  
  // Keyboard State
  const [lowNote, setLowNote] = useState('C3');
  const [highNote, setHighNote] = useState('B4');

  const handleNameContinue = () => {
    const updatedUser = { ...(user || {}), displayName: name };
    localStorage.setItem('vw_user', JSON.stringify(updatedUser));
    setStep(2);
  };

  const handleNameSkip = () => {
    // Uses the default name from signup which is already in user object
    setStep(2);
  };

  const handleRangeSave = () => {
    localStorage.setItem('vw_range', JSON.stringify({ low: lowNote, high: highNote }));
    setStep(3);
  };

  const handleRangeSkip = () => {
    localStorage.setItem('vw_range', JSON.stringify({ low: 'C3', high: 'B4' }));
    setStep(3);
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#0F0D13] flex flex-col p-6 animate-[fadeIn_0.3s_ease]">
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-8">
          <div className="space-y-4">
            <h1 className="font-display-lg text-5xl text-white">What should we call you?</h1>
            <p className="font-body-lg text-on-surface-variant">Your name will be displayed in your rehearsal studio and practice logs.</p>
          </div>

          <div className="pt-4 pb-8 border-b border-white/10 focus-within:border-primary transition-colors">
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-transparent border-none text-2xl text-white focus:outline-none placeholder:text-outline"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            This is how your mentor will address you.
          </div>
        </div>

        <div className="pb-8 space-y-6 max-w-sm mx-auto w-full">
          <div className="flex justify-center gap-2">
            <div className="w-8 h-1 bg-primary rounded-full"></div>
            <div className="w-2 h-1 bg-white/20 rounded-full"></div>
            <div className="w-2 h-1 bg-white/20 rounded-full"></div>
            <span className="text-xs text-on-surface-variant ml-2">1 of 3</span>
          </div>

          <button 
            onClick={handleNameContinue}
            disabled={!name.trim()}
            className="w-full py-4 bg-primary text-white font-headline-md text-lg rounded-xl shadow-[0_0_20px_rgba(107,79,187,0.3)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            Continue <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          
          <div className="text-center">
            <button onClick={handleNameSkip} className="text-label-sm text-on-surface-variant hover:text-white transition-colors">I'll do this later</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#0F0D13] flex flex-col p-6 animate-[fadeIn_0.3s_ease]">
        <header className="flex justify-between items-center py-4 text-white">
          <button onClick={() => setStep(1)}><span className="material-symbols-outlined">arrow_back</span></button>
          <span className="font-epilogue font-bold tracking-widest">Nocturne</span>
          <button onClick={handleRangeSkip} className="text-primary text-sm font-bold">Skip</button>
        </header>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-6">
          <div className="space-y-4 text-center">
            <h1 className="font-display-lg text-4xl text-white">Calibrate your voice</h1>
            <p className="font-body-md text-on-surface-variant">Find your limits or skip to use our standard profile. This helps us tailor exercises to your unique instrument.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-end mb-6">
              <div className="text-center">
                <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-tighter">Lowest Note</span>
                <span className="font-headline-lg text-2xl text-primary">{lowNote}</span>
              </div>
              <div className="flex-grow mx-4 h-0.5 bg-white/20 relative top-[-10px] flex items-center justify-between">
                <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(107,79,187,0.8)]"></div>
                <div className="w-2 h-2 bg-secondary rounded-full shadow-[0_0_8px_rgba(100,100,100,0.8)]"></div>
              </div>
              <div className="text-center">
                <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-tighter">Highest Note</span>
                <span className="font-headline-lg text-2xl text-secondary">{highNote}</span>
              </div>
            </div>

            <VocalRangeKeyboard lowNote={lowNote} highNote={highNote} onNoteChange={(low, high) => { setLowNote(low); setHighNote(high); }} />
            
            <div className="mt-4 flex items-center gap-2 text-on-surface-variant text-xs justify-center opacity-50">
              <span className="material-symbols-outlined text-[14px]">mic</span> Sing your lowest and highest note to auto-detect
            </div>
          </div>

          <div className="space-y-3">
          </div>
        </div>

        <div className="pb-8 space-y-6 max-w-sm mx-auto w-full pt-4">
          <div className="flex justify-center gap-2">
            <div className="w-2 h-1 bg-white/20 rounded-full"></div>
            <div className="w-8 h-1 bg-primary rounded-full"></div>
            <div className="w-2 h-1 bg-white/20 rounded-full"></div>
            <span className="text-xs text-on-surface-variant ml-2">2 of 3</span>
          </div>

          <button 
            onClick={handleRangeSave}
            className="w-full py-4 bg-primary text-white font-headline-md text-lg rounded-xl shadow-[0_0_20px_rgba(107,79,187,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Save Range
          </button>
          
          <div className="text-center">
            <button onClick={handleRangeSkip} className="text-label-sm text-on-surface-variant hover:text-white transition-colors">Skip for now</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3
  const currentName = user?.displayName || user?.name;
  return (
    <div className="min-h-screen bg-[#0F0D13] flex flex-col items-center justify-center p-6 relative overflow-hidden animate-[fadeIn_0.5s_ease]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="z-10 text-center space-y-6 max-w-sm w-full">
        <h1 className="font-display-lg text-5xl text-white">Welcome, {currentName}! 🎤</h1>
        <p className="font-body-lg text-on-surface-variant text-xl">Your studio is ready.</p>
      </div>

      <div className="absolute bottom-12 w-full max-w-sm px-6 space-y-8">
        <div className="flex justify-center gap-2">
          <div className="w-2 h-1 bg-white/20 rounded-full"></div>
          <div className="w-2 h-1 bg-white/20 rounded-full"></div>
          <div className="w-8 h-1 bg-primary rounded-full"></div>
          <span className="text-xs text-on-surface-variant ml-2">3 of 3</span>
        </div>
        <button 
          onClick={onComplete}
          className="w-full py-4 bg-primary text-white font-headline-md text-lg rounded-xl shadow-[0_0_30px_rgba(107,79,187,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Let's go <span className="material-symbols-outlined text-xl">rocket_launch</span>
        </button>
      </div>
    </div>
  );
}
