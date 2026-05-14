import React, { useState, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { SCALES_DEF } from '../utils/music';

const TYPES = [
  { id: 'warmup', name: 'Warm-up', desc: 'Gentle start', icon: 'wb_twilight', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'agility', name: 'Melismas & Agility', desc: 'Fast & flexible', icon: 'bolt', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'cooldown', name: 'Cool-down', desc: 'Relax the voice', icon: 'bedtime', color: 'bg-teal-500/20 text-teal-400' },
  { id: 'custom', name: 'Custom', desc: 'Build your own', icon: 'build', color: 'bg-slate-500/20 text-slate-400' }
];

const SCALES = SCALES_DEF.map(s => ({ id: s.id, name: s.name, duration: s.duration }));

export default function RoutinesTab({ onNavigate, startInWizard }) {
  const [routines, setRoutines] = useLocalStorage('vw_routines', []);
  const [recordings] = useLocalStorage('vw_recordings', []);
  const [routinePlays, setRoutinePlays] = useLocalStorage('vw_routine_plays', {});
  const [range] = useLocalStorage('vw_range', { low: 'C3', high: 'C5' });
  const [expandedId, setExpandedId] = useState(null);
  
  const { playPreview, stopPlayback } = useAudioEngine(range);
  const [previewingScaleId, setPreviewingScaleId] = useState(null);
  
  const [isWizardOpen, setIsWizardOpen] = useState(startInWizard || false);
  const [wizardStep, setWizardStep] = useState(1);
  
  // Wizard State
  const [newType, setNewType] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhoto, setNewPhoto] = useState(null);
  const [newExercises, setNewExercises] = useState([]);
  
  // Edit State
  const [editModeId, setEditModeId] = useState(null);
  const [editRoutineName, setEditRoutineName] = useState('');
  const [editRoutinePhoto, setEditRoutinePhoto] = useState(null);
  const [editExercises, setEditExercises] = useState([]);
  
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  React.useEffect(() => {
    if (startInWizard) {
      setWizardStep(1);
      setNewType('');
      setNewName('');
      setNewPhoto(null);
      setNewExercises([]);
      setIsWizardOpen(true);
    }
  }, [startInWizard]);

  const openWizard = () => {
    setWizardStep(1);
    setNewType('');
    setNewName('');
    setNewPhoto(null);
    setNewExercises([]);
    setIsWizardOpen(true);
  };

  const closeWizard = () => {
    stopPlayback();
    setPreviewingScaleId(null);
    setIsWizardOpen(false);
    if (startInWizard && onNavigate) {
      onNavigate('routines');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditRoutinePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleExercise = (id) => {
    setNewExercises(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const moveExercise = (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === newExercises.length - 1) return;
    const items = [...newExercises];
    const temp = items[index];
    items[index] = items[index + direction];
    items[index + direction] = temp;
    setNewExercises(items);
  };

  const saveRoutine = () => {
    if (!newName || newExercises.length === 0) return;
    
    const exercisesList = newExercises.map(id => {
      const scale = SCALES.find(s => s.id === id);
      if (scale) return scale;
      const rec = recordings.find(r => r.id === id);
      if (rec) return { id: rec.id, name: rec.name, duration: Math.max(1, Math.ceil(rec.duration / 60)) };
      return null;
    }).filter(Boolean);

    const totalDuration = exercisesList.reduce((acc, curr) => acc + curr.duration, 0);
    
    const routine = {
      id: Date.now(),
      type: newType,
      name: newName,
      photo: newPhoto,
      exercises: exercisesList,
      duration: totalDuration
    };
    
    setRoutines(prev => [routine, ...prev]);
    closeWizard();
  };

  const startRoutine = (id) => {
    setRoutinePlays(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    // We will trigger active routine here soon.
    // For now, let's dispatch a custom event to notify App.jsx
    window.dispatchEvent(new CustomEvent('vw_start_routine', { detail: id }));
  };

  const deleteRoutine = (id) => {
    if (window.confirm("Are you sure you want to delete this routine?")) {
      setRoutines(prev => prev.filter(r => r.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
  };

  const openEditMode = (routine) => {
    setEditModeId(routine.id);
    setEditRoutineName(routine.name);
    setEditRoutinePhoto(routine.photo || null);
    setEditExercises(routine.exercises.map(ex => ex.id));
  };

  const saveEditMode = () => {
    stopPlayback();
    setPreviewingScaleId(null);
    const exercisesList = editExercises.map(id => {
      const scale = SCALES.find(s => s.id === id);
      if (scale) return scale;
      const rec = recordings.find(r => r.id === id);
      if (rec) return { id: rec.id, name: rec.name, duration: Math.max(1, Math.ceil(rec.duration / 60)) };
      return null;
    }).filter(Boolean);

    const totalDuration = exercisesList.reduce((acc, curr) => acc + curr.duration, 0);

    setRoutines(prev => prev.map(r => r.id === editModeId ? { ...r, name: editRoutineName, photo: editRoutinePhoto, exercises: exercisesList, duration: totalDuration } : r));
    setEditModeId(null);
  };

  const moveEditExercise = (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === editExercises.length - 1) return;
    const items = [...editExercises];
    const temp = items[index];
    items[index] = items[index + direction];
    items[index + direction] = temp;
    setEditExercises(items);
  };

  const toggleEditExercise = (id) => {
    setEditExercises(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (editModeId) {
    const routine = routines.find(r => r.id === editModeId);
    if (!routine) {
      setEditModeId(null);
      return null;
    }

    const totalDuration = editExercises.map(id => {
      const scale = SCALES.find(s => s.id === id);
      if (scale) return scale;
      const rec = recordings.find(r => r.id === id);
      if (rec) return { duration: Math.max(1, Math.ceil(rec.duration / 60)) };
      return { duration: 0 };
    }).reduce((acc, curr) => acc + curr.duration, 0);

    return (
      <div className="fixed inset-0 z-50 bg-[#0F0D13] overflow-y-auto pb-32 animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        <header className="sticky top-0 z-40 w-full bg-[#0F0D13]/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-6 py-4 shadow-[0_4px_20px_rgba(107,79,187,0.1)]">
          <button className="text-on-surface-variant hover:text-white transition-colors" onClick={() => { stopPlayback(); setPreviewingScaleId(null); setEditModeId(null); }}>
            Cancel
          </button>
          <div className="text-slate-100 font-epilogue text-lg font-bold">Edit Routine</div>
          <button className="text-primary font-bold hover:text-primary-container transition-colors disabled:opacity-50" onClick={saveEditMode} disabled={editExercises.length === 0}>
            Save
          </button>
        </header>

        <div className="px-6 max-w-4xl mx-auto space-y-6 pt-8">
          <div className="space-y-4">
            <label className="block text-label-sm uppercase tracking-widest text-on-surface-variant">Routine Name</label>
            <div className="glass-panel rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary focus-within:diffusion-glow transition-all">
              <input 
                type="text" 
                value={editRoutineName} 
                onChange={e => setEditRoutineName(e.target.value)}
                className="w-full bg-transparent border-none text-2xl font-headline-md text-white p-4 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <label className="block text-label-sm uppercase tracking-widest text-on-surface-variant">Cover Photo</label>
            <div 
              className="relative h-40 glass-panel rounded-xl border-dashed border-2 border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
              onClick={() => editFileInputRef.current?.click()}
            >
              {editRoutinePhoto ? (
                <>
                  <img src={editRoutinePhoto} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-white drop-shadow-md">edit</span>
                    <span className="text-sm text-white drop-shadow-md font-medium">Tap to change</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-outline">add_photo_alternate</span>
                  <span className="text-sm text-on-surface-variant">Tap to upload</span>
                </>
              )}
            </div>
            <input type="file" accept="image/*" ref={editFileInputRef} onChange={handleEditPhotoUpload} className="hidden" />
          </div>

          <div className="flex justify-between items-end mt-8">
            <h2 className="font-display-lg text-4xl text-white">Edit Exercises</h2>
            <div className="text-right">
              <p className="font-label-sm text-primary">{editExercises.length} selected</p>
              <p className="text-on-surface-variant text-sm flex items-center gap-1 justify-end"><span className="material-symbols-outlined text-[16px]">schedule</span> {totalDuration} min</p>
            </div>
          </div>

          {editExercises.length > 0 && (
            <div className="space-y-2 mb-6">
              <h3 className="text-label-sm uppercase tracking-widest text-on-surface-variant mb-2">Selected (Drag to reorder)</h3>
              {editExercises.map((id, index) => {
                const scale = SCALES.find(s => s.id === id) || recordings.find(r => r.id === id);
                const name = scale ? scale.name : id;
                return (
                  <div key={`edit-sel-${id}-${index}`} className="glass-panel p-3 rounded-lg flex items-center gap-3 bg-primary/10 border-primary/30">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveEditExercise(index, -1)} disabled={index === 0} className="disabled:opacity-20 text-on-surface-variant hover:text-white"><span className="material-symbols-outlined text-[16px]">expand_less</span></button>
                      <button onClick={() => moveEditExercise(index, 1)} disabled={index === editExercises.length - 1} className="disabled:opacity-20 text-on-surface-variant hover:text-white"><span className="material-symbols-outlined text-[16px]">expand_more</span></button>
                    </div>
                    <span className="flex-1 text-white font-medium">{name}</span>
                    <button onClick={() => toggleEditExercise(id)} className="w-8 h-8 flex items-center justify-center text-outline hover:text-error rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="space-y-3">
            <h3 className="text-label-sm uppercase tracking-widest text-on-surface-variant">Available Scales</h3>
            {SCALES.map(scale => {
              const isSelected = editExercises.includes(scale.id);
              if (isSelected) return null;
              const isPreviewing = previewingScaleId === scale.id;
              return (
                <div 
                  key={scale.id} 
                  className="glass-panel p-4 rounded-xl flex items-center justify-between transition-all hover:border-primary/40"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => toggleEditExercise(scale.id)}>
                    <span className="font-headline-md text-base text-white block">{scale.name}</span>
                    <span className="text-label-sm text-on-surface-variant">{scale.duration} min</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isPreviewing ? 'bg-primary text-white' : 'bg-surface-container-highest text-primary hover:bg-primary/20'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPreviewing) {
                          stopPlayback();
                          setPreviewingScaleId(null);
                        } else {
                          const scaleDef = SCALES_DEF.find(s => s.id === scale.id);
                          if (scaleDef) {
                            playPreview(scaleDef);
                            setPreviewingScaleId(scale.id);
                          }
                        }
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>{isPreviewing ? 'stop' : 'play_arrow'}</span>
                    </button>
                    <div className="w-6 h-6 rounded-full border-2 border-outline-variant flex items-center justify-center transition-colors cursor-pointer" onClick={() => toggleEditExercise(scale.id)}>
                      <span className="material-symbols-outlined text-[16px] text-transparent">add</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {recordings.length > 0 && <h3 className="text-label-sm uppercase tracking-widest text-on-surface-variant pt-4">My Recordings</h3>}
            {recordings.map(rec => {
              const isSelected = editExercises.includes(rec.id);
              if (isSelected) return null;
              const durMin = Math.max(1, Math.ceil(rec.duration / 60));
              return (
                <div 
                  key={rec.id} 
                  className="glass-panel p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] hover:border-primary/40"
                  onClick={() => toggleEditExercise(rec.id)}
                >
                  <div>
                    <span className="font-headline-md text-base text-white block">{rec.name}</span>
                    <span className="text-label-sm text-on-surface-variant">{durMin} min</span>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-outline-variant flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[16px] text-transparent">add</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (isWizardOpen) {
    const totalDuration = newExercises.map(id => {
      const scale = SCALES.find(s => s.id === id);
      if (scale) return scale;
      const rec = recordings.find(r => r.id === id);
      if (rec) return { duration: Math.max(1, Math.ceil(rec.duration / 60)) };
      return { duration: 0 };
    }).reduce((acc, curr) => acc + curr.duration, 0);

    return (
      <div className="pt-20 px-6 max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease] pb-32">
        <header className="fixed top-0 left-0 z-40 w-full bg-[#0F0D13]/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-6 py-4 shadow-[0_4px_20px_rgba(107,79,187,0.1)]">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant active:scale-95 transition-all" onClick={wizardStep > 1 ? () => setWizardStep(wizardStep - 1) : closeWizard}>
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <div className="text-slate-100 font-epilogue text-lg font-bold">Step {wizardStep} of 3</div>
          <div className="w-10"></div>
        </header>

        {wizardStep === 1 && (
          <div className="space-y-6 animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <h2 className="font-display-lg text-4xl text-white">Choose Type</h2>
            <div className="grid grid-cols-2 gap-4">
              {TYPES.map(t => {
                const isSelected = newType === t.id;
                return (
                  <div 
                    key={t.id} 
                    className={`glass-panel p-5 rounded-xl flex flex-col gap-3 cursor-pointer transition-all active:scale-[0.98] ${isSelected ? 'ring-2 ring-primary diffusion-glow bg-primary/10' : 'hover:border-primary/40'}`}
                    onClick={() => { setNewType(t.id); setWizardStep(2); }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-surface-container-highest text-primary'}`}>
                      <span className="material-symbols-outlined">{t.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-lg text-white mb-1">{t.name}</h3>
                      <p className="text-label-sm text-on-surface-variant">{t.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="space-y-6 animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <h2 className="font-display-lg text-4xl text-white">Routine Info</h2>
            
            <div className="space-y-4">
              <label className="block text-label-sm uppercase tracking-widest text-on-surface-variant">Name</label>
              <div className="glass-panel rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary focus-within:diffusion-glow transition-all">
                <input 
                  type="text" 
                  placeholder="e.g. Morning Wake Up" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-transparent border-none text-2xl font-headline-md text-white p-4 focus:outline-none focus:ring-0"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <label className="block text-label-sm uppercase tracking-widest text-on-surface-variant">Cover Photo (Optional)</label>
              <div 
                className="relative h-40 glass-panel rounded-xl border-dashed border-2 border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {newPhoto ? (
                  <img src={newPhoto} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-outline">add_photo_alternate</span>
                    <span className="text-sm text-on-surface-variant">Tap to upload</span>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />
            </div>
            
            <button 
              className="w-full py-4 mt-8 bg-primary-container text-white font-headline-md text-lg rounded-xl shadow-lg shadow-primary-container/20 border-t border-white/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
              onClick={() => setWizardStep(3)}
              disabled={!newName.trim()}
            >
              Next Step
            </button>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="space-y-6 animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex justify-between items-end">
              <h2 className="font-display-lg text-4xl text-white">Add Exercises</h2>
              <div className="text-right">
                <p className="font-label-sm text-primary">{newExercises.length} selected</p>
                <p className="text-on-surface-variant text-sm flex items-center gap-1 justify-end"><span className="material-symbols-outlined text-[16px]">schedule</span> {totalDuration} min</p>
              </div>
            </div>

            {newExercises.length > 0 && (
              <div className="space-y-2 mb-6">
                <h3 className="text-label-sm uppercase tracking-widest text-on-surface-variant mb-2">Selected (Drag to reorder)</h3>
                {newExercises.map((id, index) => {
                  const scale = SCALES.find(s => s.id === id) || recordings.find(r => r.id === id);
                  const name = scale ? scale.name : id;
                  return (
                    <div key={`sel-${id}-${index}`} className="glass-panel p-3 rounded-lg flex items-center gap-3 bg-primary/10 border-primary/30">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveExercise(index, -1)} disabled={index === 0} className="disabled:opacity-20 text-on-surface-variant hover:text-white"><span className="material-symbols-outlined text-[16px]">expand_less</span></button>
                        <button onClick={() => moveExercise(index, 1)} disabled={index === newExercises.length - 1} className="disabled:opacity-20 text-on-surface-variant hover:text-white"><span className="material-symbols-outlined text-[16px]">expand_more</span></button>
                      </div>
                      <span className="flex-1 text-white font-medium">{name}</span>
                      <button onClick={() => toggleExercise(id)} className="w-8 h-8 flex items-center justify-center text-outline hover:text-error rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="space-y-3">
              <h3 className="text-label-sm uppercase tracking-widest text-on-surface-variant">Available Scales</h3>
              {SCALES.map(scale => {
                const isSelected = newExercises.includes(scale.id);
                if (isSelected) return null;
                const isPreviewing = previewingScaleId === scale.id;
                return (
                  <div 
                    key={scale.id} 
                    className="glass-panel p-4 rounded-xl flex items-center justify-between transition-all hover:border-primary/40"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => toggleExercise(scale.id)}>
                      <span className="font-headline-md text-base text-white block">{scale.name}</span>
                      <span className="text-label-sm text-on-surface-variant">{scale.duration} min</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isPreviewing ? 'bg-primary text-white' : 'bg-surface-container-highest text-primary hover:bg-primary/20'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPreviewing) {
                            stopPlayback();
                            setPreviewingScaleId(null);
                          } else {
                            const scaleDef = SCALES_DEF.find(s => s.id === scale.id);
                            if (scaleDef) {
                              playPreview(scaleDef);
                              setPreviewingScaleId(scale.id);
                            }
                          }
                        }}
                      >
                        <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>{isPreviewing ? 'stop' : 'play_arrow'}</span>
                      </button>
                      <div className="w-6 h-6 rounded-full border-2 border-outline-variant flex items-center justify-center transition-colors cursor-pointer" onClick={() => toggleExercise(scale.id)}>
                        <span className="material-symbols-outlined text-[16px] text-transparent">add</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {recordings.length > 0 && <h3 className="text-label-sm uppercase tracking-widest text-on-surface-variant pt-4">My Recordings</h3>}
              {recordings.map(rec => {
                const isSelected = newExercises.includes(rec.id);
                if (isSelected) return null;
                const durMin = Math.max(1, Math.ceil(rec.duration / 60));
                return (
                  <div 
                    key={rec.id} 
                    className="glass-panel p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] hover:border-primary/40"
                    onClick={() => toggleExercise(rec.id)}
                  >
                    <div>
                      <span className="font-headline-md text-base text-white block">{rec.name}</span>
                      <span className="text-label-sm text-on-surface-variant">{durMin} min</span>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-outline-variant flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-transparent">add</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="fixed bottom-[96px] left-0 w-full px-6 z-40 pointer-events-none">
              <button 
                className="w-full py-4 bg-primary-container text-white font-headline-md text-lg rounded-xl shadow-[0_0_30px_rgba(107,79,187,0.4)] border-t border-white/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:active:scale-100 max-w-4xl mx-auto block pointer-events-auto"
                onClick={saveRoutine}
                disabled={newExercises.length === 0 || !newName.trim()}
              >
                Save Routine
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pt-20 px-6 max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease]">
      <header className="fixed top-0 left-0 z-40 w-full bg-[#0F0D13]/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-6 py-4 shadow-[0_4px_20px_rgba(107,79,187,0.1)]">
        <div className="text-slate-100 font-epilogue text-lg font-bold">Routines</div>
        <button className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 active:scale-95 transition-all" onClick={openWizard}>
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
      </header>

      <section className="space-y-6">
        <div className="mb-4">
          <h1 className="font-display-lg text-4xl text-white mb-2">My Routines</h1>
          <p className="font-body-lg text-on-surface-variant">Your personal warmups</p>
        </div>

        <div className="space-y-4">
          {routines.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center border-dashed">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">auto_awesome_motion</span>
              <p className="text-on-surface-variant font-body-md">No routines yet.</p>
            </div>
          ) : (
            routines.map(routine => {
              const isExpanded = expandedId === routine.id;
              const typeInfo = TYPES.find(t => t.id === routine.type);
              const colorClass = typeInfo?.color || 'bg-slate-500/20 text-slate-400';
              
              return (
                <div key={routine.id} className="glass-panel rounded-xl overflow-hidden transition-all duration-300">
                  <div 
                    className="p-3 flex items-center justify-between cursor-pointer active:bg-white/5 gap-4" 
                    onClick={() => setExpandedId(isExpanded ? null : routine.id)}
                  >
                    <div className={`w-[70px] h-[70px] flex-none rounded-lg overflow-hidden flex items-center justify-center ${routine.photo ? '' : colorClass}`}>
                      {routine.photo ? (
                        <img src={routine.photo} alt={routine.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-3xl">{typeInfo?.icon || 'music_note'}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-headline-md text-lg text-white mb-1 truncate">{routine.name}</h3>
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px] text-white uppercase tracking-wider">{typeInfo?.name || 'Custom'}</span>
                        <span className="text-on-surface-variant text-[12px] flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {routine.duration} min</span>
                      </div>
                    </div>
                    
                    <span className={`material-symbols-outlined text-outline transition-transform duration-300 pr-2 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                  </div>
                  
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-5 pt-0 border-t border-white/5 mt-2">
                      <div className="space-y-2 mt-4">
                        {routine.exercises.map((ex, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                            <span className="text-primary font-epilogue font-bold text-sm w-4">{idx + 1}</span>
                            <span className="text-white text-sm flex-1">{ex.name}</span>
                            <span className="text-on-surface-variant text-xs">{ex.duration}m</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-6">
                        <button 
                          className="flex-1 py-3 bg-primary/20 text-primary font-headline-md text-sm rounded-xl hover:bg-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                          onClick={(e) => { e.stopPropagation(); startRoutine(routine.id); }}
                        >
                          <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>play_circle</span>
                          Start Routine
                        </button>
                        <button 
                          className="w-12 h-12 flex-none bg-surface-container-highest text-white rounded-xl hover:bg-surface-variant active:scale-95 transition-all flex items-center justify-center"
                          onClick={(e) => { e.stopPropagation(); openEditMode(routine); }}
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button 
                          className="w-12 h-12 flex-none bg-error/10 text-error rounded-xl hover:bg-error/20 active:scale-95 transition-all flex items-center justify-center"
                          onClick={(e) => { e.stopPropagation(); deleteRoutine(routine.id); }}
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
