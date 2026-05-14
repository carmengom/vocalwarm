import React, { useState } from 'react';

export default function AuthFlow({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!email || !password) {
        setError('Please enter your email and password.');
        return;
      }
      
      const storedUser = localStorage.getItem('vw_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.email === email && parsedUser.password === password) {
          // Enforce onboarding skip for returning users who log in.
          localStorage.setItem('vw_onboarding_complete', 'true');
          onAuthSuccess(parsedUser);
        } else {
          setError('Invalid email or password.');
        }
      } else {
        setError('Account not found. Please sign up first.');
      }
    } else {
      if (!name || !email || !password) {
        setError('Please fill out all fields.');
        return;
      }
      const newUser = { name, email, password, displayName: name };
      onAuthSuccess(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0D13] flex flex-col items-center justify-center p-6 relative overflow-hidden animate-[fadeIn_0.3s_ease]">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-sm z-10 space-y-8">
        <div className="text-center space-y-4">
          {isLogin ? (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(107,79,187,0.3)] border border-primary/30">
                <span className="material-symbols-outlined text-3xl">mic</span>
              </div>
              <h1 className="font-display-lg text-4xl text-white tracking-widest uppercase">VocalWarm</h1>
              <p className="text-on-surface-variant font-body-lg">Master your voice with precision.</p>
            </>
          ) : (
            <div className="pt-8">
              <h1 className="font-display-lg text-4xl text-white">Begin Your Journey</h1>
              <p className="text-on-surface-variant font-body-lg mt-2">Step into your private rehearsal space.</p>
            </div>
          )}
        </div>

        <form onSubmit={handleAuth} className="glass-panel p-6 rounded-2xl space-y-5">
          {error && <div className="text-error text-sm text-center bg-error/10 p-2 rounded-lg">{error}</div>}
          
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-label-sm uppercase tracking-widest text-on-surface-variant">Full Name</label>
              <div className="flex items-center gap-3 bg-surface-container-high p-3 rounded-xl focus-within:ring-2 focus-within:ring-primary transition-all">
                <span className="material-symbols-outlined text-outline">person</span>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-transparent border-none text-white focus:outline-none placeholder:text-outline"
                  placeholder="Enrico Caruso"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-label-sm uppercase tracking-widest text-on-surface-variant">Email Address</label>
            <div className="flex items-center gap-3 bg-surface-container-high p-3 rounded-xl focus-within:ring-2 focus-within:ring-primary transition-all">
              <span className="material-symbols-outlined text-outline">mail</span>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-transparent border-none text-white focus:outline-none placeholder:text-outline"
                placeholder="vocalist@warmup.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-label-sm uppercase tracking-widest text-on-surface-variant">Password</label>
            <div className="flex items-center gap-3 bg-surface-container-high p-3 rounded-xl focus-within:ring-2 focus-within:ring-primary transition-all">
              <span className="material-symbols-outlined text-outline">lock</span>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent border-none text-white focus:outline-none placeholder:text-outline tracking-widest"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 mt-2 bg-primary text-white font-headline-md rounded-xl shadow-[0_0_20px_rgba(107,79,187,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
            {isLogin ? 'Login' : 'Create Account'}
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>

          <div className="text-center pt-2">
            <p className="text-on-surface-variant text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:text-white transition-colors">
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>


        </form>

        {!isLogin && (
          <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
            By signing up, you agree to our Terms of Performance & Privacy Resonance
          </p>
        )}
      </div>
    </div>
  );
}
