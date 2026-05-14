import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function HomeTab({ onNavigate }) {
  const [user, setUser] = useLocalStorage('vw_user', {});
  const name = user.displayName || user.name || 'Singer';
  const [routines] = useLocalStorage('vw_routines', []);
  const [routinePlays] = useLocalStorage('vw_routine_plays', {});
  const [recordings] = useLocalStorage('vw_recordings', []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('vw_user');
    localStorage.removeItem('vw_onboarding_complete');
    window.location.reload();
  };

  const topRoutines = [...routines].sort((a, b) => (routinePlays[b.id] || 0) - (routinePlays[a.id] || 0)).slice(0, 5);
  const recentRecordings = [...recordings].sort((a, b) => b.id - a.id).slice(0, 5);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pt-20 px-6 max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease]">
      <header className="fixed top-0 left-0 z-40 w-full bg-[#0F0D13]/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-6 py-4 shadow-[0_4px_20px_rgba(107,79,187,0.1)]">
        <div className="flex items-center gap-3">
          <span className="font-epilogue tracking-tight text-white text-xl font-bold">VocalWarm</span>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full border border-primary/30 bg-surface-container-high flex items-center justify-center text-primary active:scale-95 transition-all hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined">person</span>
          </button>
          
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-56 glass-panel border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-[slideDown_0.2s_ease]">
                <div className="p-4 border-b border-white/10 bg-surface-container-highest/50">
                  <p className="font-headline-md text-white truncate">{name}</p>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">{user.email || 'No email provided'}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error/10 active:scale-[0.98] transition-all text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Log Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Personalized Greeting */}
      <section className="space-y-2 mt-8">
        <h1 className="font-display-lg text-4xl text-white flex items-center gap-2">
          Welcome back,
        </h1>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setUser({ ...user, displayName: e.target.value })} 
          className="font-display-lg text-4xl text-primary-fixed-dim bg-transparent border-b border-transparent focus:border-primary-fixed-dim focus:outline-none p-0 w-full"
          placeholder="Your name"
        />
        <p className="font-body-lg text-on-surface-variant">Ready to find your resonance today?</p>
      </section>

      {/* Quick Actions */}
      <section>
        <button onClick={() => onNavigate('routines_wizard')} className="w-full glass-panel rounded-xl p-4 flex items-center justify-center gap-3 group hover:border-primary/40 transition-all active:scale-95">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">add_circle</span>
          </div>
          <span className="font-headline-md text-lg text-white">Create routine</span>
        </button>
      </section>

      {/* My Routines */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="font-headline-lg text-2xl text-white">My Routines</h2>
          <button onClick={() => onNavigate('routines')} className="font-label-sm text-primary uppercase font-bold tracking-wider">View All</button>
        </div>
        
        {topRoutines.length === 0 ? (
          <div className="glass-panel rounded-2xl p-6 text-center space-y-4">
            <p className="text-on-surface-variant font-body-md">No routines yet. Create one to get started!</p>
            <button className="bg-primary-container text-white px-6 py-2 rounded-full font-label-sm uppercase tracking-wide hover:brightness-110 transition-all" onClick={() => onNavigate('routines')}>
              New Routine
            </button>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar -mx-6 px-6">
            {topRoutines.map(routine => (
              <div key={routine.id} className="flex-none w-64 glass-panel rounded-2xl overflow-hidden diffusion-glow active:scale-[0.98] transition-transform cursor-pointer" onClick={() => onNavigate('routines')}>
                <div className="relative h-40 bg-surface-container-high p-4 flex flex-col justify-end">
                  {routine.photo && <img src={routine.photo} alt={routine.name} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D13] to-transparent z-10"></div>
                  <div className="relative z-20">
                    <span className="bg-primary/20 backdrop-blur-md text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
                      {routine.duration || '0'} MINS
                    </span>
                    <h3 className="font-headline-md text-xl text-white">{routine.name}</h3>
                    <p className="text-on-surface-variant text-sm mt-1">{routine.exercises?.length || 0} exercises</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Recordings */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2 mb-2">
          <h2 className="font-headline-lg text-2xl text-white">Recent Recordings</h2>
        </div>
        
        {recentRecordings.length === 0 ? (
          <div className="glass-panel rounded-2xl p-6 text-center">
            <p className="text-on-surface-variant font-body-md">No recent recordings.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecordings.map(rec => (
              <div 
                key={rec.id} 
                className="glass-panel p-3 rounded-xl flex items-center gap-4 cursor-pointer transition-all active:scale-[0.98] hover:border-primary/40"
                onClick={() => onNavigate('recordings')}
              >
                <div className="w-14 h-14 flex-none rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">graphic_eq</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline-md text-base text-white truncate">{rec.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px] text-on-surface-variant uppercase tracking-wider">
                      {formatTime(rec.duration)}
                    </span>
                    <span className="text-xs text-on-surface-variant truncate">
                      {new Date(rec.id).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
