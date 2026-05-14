import React, { useState, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function RecordingsTab() {
  const [recordings, setRecordings] = useLocalStorage('vw_recordings', []);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result;
          const newRecording = {
            id: Date.now(),
            name: `Vocal Log`,
            audio: base64Audio,
            duration: recordingTime
          };
          setRecordings(prev => [newRecording, ...prev]);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
  };

  const deleteRecording = (id) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
  };

  const startEditing = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveEditing = (id) => {
    setRecordings(prev => prev.map(r => r.id === id ? { ...r, name: editName } : r));
    setEditingId(null);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pt-20 px-6 max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease]">
      <header className="fixed top-0 left-0 z-40 w-full bg-[#0F0D13]/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-6 py-4 shadow-[0_4px_20px_rgba(107,79,187,0.1)]">
        <div className="text-slate-100 font-epilogue text-lg font-bold">Recordings</div>
      </header>

      <div className="text-center space-y-2 mb-8">
        <h1 className="font-display-lg text-4xl text-white">Capture Progress</h1>
        <p className="font-body-lg text-on-surface-variant">Log your voice daily</p>
      </div>

      <div className="flex flex-col items-center justify-center my-12">
        <div className={`text-5xl font-epilogue font-bold mb-8 transition-colors duration-300 ${isRecording ? 'text-error' : 'text-white'}`}>
          {formatTime(recordingTime)}
        </div>
        <button 
          className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${isRecording ? 'bg-error/20' : 'bg-primary-container hover:brightness-110'} active:scale-95`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-2 border-error animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          )}
          <span className={`material-symbols-outlined text-4xl ${isRecording ? 'text-error' : 'text-white'}`} style={{fontVariationSettings: "'FILL' 1"}}>
            {isRecording ? 'stop' : 'mic'}
          </span>
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="font-headline-lg text-2xl text-white mb-4">Past Logs</h2>
        {recordings.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center border-dashed">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">mic_off</span>
            <p className="text-on-surface-variant font-body-md">No recordings yet.</p>
          </div>
        ) : (
          recordings.map(rec => (
            <div key={rec.id} className="glass-panel p-4 rounded-xl flex flex-col gap-3">
              <div className="flex justify-between items-start">
                {editingId === rec.id ? (
                  <div className="flex-1 flex gap-2">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-surface-container-highest border border-white/10 text-white px-3 py-1 rounded-lg focus:outline-none focus:border-primary"
                      autoFocus
                    />
                    <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg" onClick={() => saveEditing(rec.id)}>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-md text-lg text-white">{rec.name}</span>
                      <button className="text-outline hover:text-primary transition-colors" onClick={() => startEditing(rec.id, rec.name)}>
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
                        {formatTime(rec.duration)}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {new Date(rec.id).toLocaleDateString()} at {new Date(rec.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                )}
                
                <button className="w-8 h-8 flex items-center justify-center text-outline hover:text-error hover:bg-error/10 rounded-full transition-colors ml-2" onClick={() => deleteRecording(rec.id)}>
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
              
              <audio controls src={rec.audio} className="w-full h-10 mt-2 opacity-80 hue-rotate-[240deg]" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
