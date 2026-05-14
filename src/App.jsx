import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import AuthFlow from './components/AuthFlow'
import OnboardingFlow from './components/OnboardingFlow'
import HomeTab from './components/HomeTab'
import ExercisesTab from './components/ExercisesTab'
import RoutinesTab from './components/RoutinesTab'
import RecordingsTab from './components/RecordingsTab'
import ActiveRoutine from './components/ActiveRoutine'
import { useEffect } from 'react'

function App() {
  const [user, setUser] = useLocalStorage('vw_user', null);
  const [onboardingComplete, setOnboardingComplete] = useLocalStorage('vw_onboarding_complete', false);
  const [activeTab, setActiveTab] = useState('home')
  
  const [activeRoutineId, setActiveRoutineId] = useState(null);
  const [isRoutineMinimized, setIsRoutineMinimized] = useState(false);

  useEffect(() => {
    const handleStart = (e) => {
      setActiveRoutineId(e.detail);
      setIsRoutineMinimized(false);
    };
    window.addEventListener('vw_start_routine', handleStart);
    return () => window.removeEventListener('vw_start_routine', handleStart);
  }, []);

  if (!user) {
    return <AuthFlow onAuthSuccess={(userData) => {
      setUser(userData);
      // Check if it's a login action that explicitly skips onboarding
      if (localStorage.getItem('vw_onboarding_complete') === 'true') {
        setOnboardingComplete(true);
      }
    }} />
  }

  if (!onboardingComplete) {
    return <OnboardingFlow user={user} onComplete={() => setOnboardingComplete(true)} />
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 pb-24">
        {activeTab === 'home' && <HomeTab onNavigate={setActiveTab} />}
        {activeTab === 'exercises' && <ExercisesTab />}
        {(activeTab === 'routines' || activeTab === 'routines_wizard') && <RoutinesTab onNavigate={setActiveTab} startInWizard={activeTab === 'routines_wizard'} />}
        {activeTab === 'recordings' && <RecordingsTab />}
      </div>

      {activeRoutineId && (
        <ActiveRoutine 
          routineId={activeRoutineId} 
          isMinimized={isRoutineMinimized} 
          onMinimize={() => setIsRoutineMinimized(!isRoutineMinimized)}
          onStop={() => {
            setActiveRoutineId(null);
            setIsRoutineMinimized(false);
          }}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-8 bg-[#2D2445]/90 backdrop-blur-2xl rounded-t-3xl border-t border-white/5 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        <button 
          className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 ${activeTab === 'home' ? 'text-[#6B4FBB] drop-shadow-[0_0_8px_rgba(107,79,187,0.5)]' : 'text-gray-500 hover:text-white'}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
          <span className="font-epilogue text-[10px] font-medium uppercase tracking-widest mt-1">Home</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 ${activeTab === 'exercises' ? 'text-[#6B4FBB] drop-shadow-[0_0_8px_rgba(107,79,187,0.5)]' : 'text-gray-500 hover:text-white'}`}
          onClick={() => setActiveTab('exercises')}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'exercises' ? "'FILL' 1" : "'FILL' 0" }}>piano</span>
          <span className="font-epilogue text-[10px] font-medium uppercase tracking-widest mt-1">Exercises</span>
        </button>

        <button 
          className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 ${activeTab === 'recordings' ? 'text-[#6B4FBB] drop-shadow-[0_0_8px_rgba(107,79,187,0.5)]' : 'text-gray-500 hover:text-white'}`}
          onClick={() => setActiveTab('recordings')}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'recordings' ? "'FILL' 1" : "'FILL' 0" }}>mic</span>
          <span className="font-epilogue text-[10px] font-medium uppercase tracking-widest mt-1">Record</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 ${activeTab === 'routines' ? 'text-[#6B4FBB] drop-shadow-[0_0_8px_rgba(107,79,187,0.5)]' : 'text-gray-500 hover:text-white'}`}
          onClick={() => setActiveTab('routines')}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'routines' ? "'FILL' 1" : "'FILL' 0" }}>auto_awesome_motion</span>
          <span className="font-epilogue text-[10px] font-medium uppercase tracking-widest mt-1">Routines</span>
        </button>
      </nav>
    </div>
  )
}

export default App
