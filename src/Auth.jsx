import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient.js';

function LogoMark(props){
  return <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 16L9 10L13 13L20 5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 5H20V10" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

const AUTH_CSS = `
:root{
  --bg:#05070A; --bg-panel:#10141B; --bg-elevated:#171C24;
  --line:#232A33; --line-soft:#1B2129;
  --text:#E7E9EA; --text-dim:#8B94A0; --text-faint:#5C6570;
  --accent:#E8A33D; --accent-glow:rgba(232,163,61,0.35);
  --bad:#F87171;
  --sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
  --mono:ui-monospace,SFMono-Regular,'SF Mono',Consolas,'Courier New',monospace;
}
.al-auth-root{ min-height:100vh; background:var(--bg); color:var(--text); font-family:var(--sans); position:relative; display:flex; flex-direction:column; overflow-x:hidden; }
.al-auth-center{ flex:1; display:flex; align-items:center; justify-content:center; padding:40px 20px; position:relative; z-index:1; }

/* ---------- space background: symmetric starfield + centered pulsing glow ---------- */
.al-bg{ position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; background:var(--bg); }
.al-stars{
  position:absolute; inset:-10%;
  background-image:
    radial-gradient(1.4px 1.4px at 12% 18%, rgba(231,233,234,.9) 50%, transparent 100%),
    radial-gradient(1.2px 1.2px at 32% 62%, rgba(231,233,234,.7) 50%, transparent 100%),
    radial-gradient(1.6px 1.6px at 52% 28%, rgba(231,233,234,.9) 50%, transparent 100%),
    radial-gradient(1.1px 1.1px at 68% 74%, rgba(231,233,234,.6) 50%, transparent 100%),
    radial-gradient(1.5px 1.5px at 82% 22%, rgba(231,233,234,.85) 50%, transparent 100%),
    radial-gradient(1.2px 1.2px at 88% 58%, rgba(231,233,234,.6) 50%, transparent 100%),
    radial-gradient(1.3px 1.3px at 22% 84%, rgba(231,233,234,.7) 50%, transparent 100%),
    radial-gradient(1.4px 1.4px at 42% 8%, rgba(231,233,234,.8) 50%, transparent 100%),
    radial-gradient(1.1px 1.1px at 6% 46%, rgba(231,233,234,.6) 50%, transparent 100%),
    radial-gradient(1.3px 1.3px at 96% 40%, rgba(231,233,234,.75) 50%, transparent 100%);
  background-repeat: repeat;
  background-size: 340px 340px;
  animation: al-twinkle 6s ease-in-out infinite alternate;
}
.al-orbit{
  position:absolute; top:50%; left:50%; width:640px; height:640px; margin:-320px 0 0 -320px;
  border-radius:50%; border:1px solid rgba(232,163,61,.10);
  animation: al-spin 90s linear infinite;
}
.al-orbit::before{
  content:""; position:absolute; top:-1.5px; left:50%; width:3px; height:3px; margin-left:-1.5px;
  border-radius:50%; background:var(--accent); box-shadow:0 0 6px var(--accent-glow);
}
.al-orbit-outer{
  position:absolute; top:50%; left:50%; width:900px; height:900px; margin:-450px 0 0 -450px;
  border-radius:50%; border:1px solid rgba(232,163,61,.06);
  animation: al-spin 140s linear infinite reverse;
}
.al-glow{
  position:absolute; top:50%; left:50%; width:420px; height:420px; margin:-210px 0 0 -210px;
  border-radius:50%;
  background:radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  filter:blur(50px);
  animation: al-pulse 7s ease-in-out infinite;
}
@keyframes al-twinkle{ from{ opacity:.55; } to{ opacity:1; } }
@keyframes al-pulse{ 0%,100%{ opacity:.55; transform:scale(1); } 50%{ opacity:.9; transform:scale(1.08); } }
@keyframes al-spin{ from{ transform:rotate(0deg); } to{ transform:rotate(360deg); } }
@media (prefers-reduced-motion: reduce){
  .al-stars, .al-orbit, .al-orbit-outer, .al-glow{ animation:none; }
}

/* ---------- hero brand, sitting above the card ---------- */
.al-auth-wrap{ position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:26px; }
.al-hero-brand{ display:flex; flex-direction:column; align-items:center; gap:12px; }
.al-hero-wordmark{ width:200px; height:auto; display:block; }
.al-hero-tagline{ font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--text-faint); }

/* ---------- card ---------- */
.al-auth-card{ width:100%; max-width:380px; background:rgba(16,20,27,.82); backdrop-filter:blur(8px); border:1px solid var(--line); border-radius:12px; padding:30px 28px; box-shadow:0 20px 60px rgba(0,0,0,.4); }
.al-auth-title{ font-size:19px; font-weight:700; margin:0 0 4px; text-align:center; }
.al-auth-sub{ font-size:13px; color:var(--text-faint); text-align:center; margin:0 0 24px; }

.al-auth-form{ display:flex; flex-direction:column; gap:6px; }
.al-auth-label{ font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:var(--text-faint); margin:10px 0 2px; }

.al-auth-form input{
  box-sizing:border-box; display:block; font-family:var(--sans); font-size:14px;
  padding:10px 12px; border:1px solid var(--line); border-radius:7px;
  background:var(--bg-elevated); color:var(--text); width:100%; height:42px;
}
.al-auth-form input::-ms-reveal,
.al-auth-form input::-ms-clear{ display:none; }
.al-auth-form input:focus{ outline:none; border-color:var(--accent); box-shadow:0 0 0 2px var(--accent-glow); }

.al-auth-error{ font-size:12px; color:var(--bad); background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.3); border-radius:6px; padding:8px 10px; margin-top:12px; }
.al-auth-message{ font-size:12px; color:var(--accent); background:rgba(232,163,61,.08); border:1px solid rgba(232,163,61,.3); border-radius:6px; padding:8px 10px; margin-top:12px; }
.al-btn{ font-family:var(--sans); font-size:13px; font-weight:700; padding:10px 14px; border:1px solid var(--accent); border-radius:7px; background:var(--accent); color:#151008; cursor:pointer; }
.al-btn:hover{ filter:brightness(1.08); }
.al-btn:disabled{ opacity:.6; cursor:default; }
.al-auth-submit{ width:100%; margin-top:18px; }
.al-auth-toggle{ display:block; width:100%; text-align:center; margin-top:18px; background:none; border:none; color:var(--text-dim); font-size:12px; cursor:pointer; font-family:var(--sans); }
.al-auth-toggle:hover{ color:var(--accent); }
.al-auth-footer{ position:relative; z-index:1; text-align:center; padding:10px 20px 26px; font-size:11px; color:var(--text-faint); font-family:var(--mono); }
.al-auth-footer-links{ display:flex; justify-content:center; gap:16px; margin-bottom:8px; }
.al-auth-footer-link{ color:var(--text-dim); text-decoration:none; font-family:var(--mono); font-size:11px; letter-spacing:.02em; }
.al-auth-footer-link:hover{ color:var(--accent); }
`;

export default function Auth(){
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e){
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try{
      if(mode === 'signin'){
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if(error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if(error) throw error;
        setMessage('Account created. Check your email to confirm it, then sign in.');
      }
    }catch(err){
      setError(err.message || 'Something went wrong.');
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="al-auth-root">
      <style>{AUTH_CSS}</style>
      <div className="al-bg">
        <div className="al-stars" />
        <div className="al-orbit-outer" />
        <div className="al-orbit" />
        <div className="al-glow" />
      </div>
      <div className="al-auth-center">
      <div className="al-auth-wrap">
        <div className="al-hero-brand">
          <img src="/mavtrack-logo.png" alt="MavTrack" className="al-hero-wordmark" />
          <span className="al-hero-tagline">Academic mission control</span>
        </div>
        <div className="al-auth-card">
          <h1 className="al-auth-title">{mode === 'signin' ? 'Sign in' : 'Create an account'}</h1>
          <p className="al-auth-sub">
            {mode === 'signin' ? 'Your data follows you across every device.' : 'Takes a few seconds. No credit card, nothing else needed.'}
          </p>
          <form onSubmit={handleSubmit} className="al-auth-form">
            <label className="al-auth-label">Email</label>
            <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <label className="al-auth-label">Password</label>
            <input type="password" required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" />
            {error && <div className="al-auth-error">{error}</div>}
            {message && <div className="al-auth-message">{message}</div>}
            <button className="al-btn al-auth-submit" disabled={loading} type="submit">
              {loading ? 'Please wait…' : (mode === 'signin' ? 'Sign in' : 'Sign up')}
            </button>
          </form>
          <button className="al-auth-toggle" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setMessage(null); }}>
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
      </div>
      <footer className="al-auth-footer">
        <div className="al-auth-footer-links">
          <a href="https://github.com/labob2/MavTrack" target="_blank" rel="noopener noreferrer" className="al-auth-footer-link">GitHub</a>
          <a href="https://www.linkedin.com/in/labibalkarim/" target="_blank" rel="noopener noreferrer" className="al-auth-footer-link">LinkedIn</a>
        </div>
        MavTrack &middot; created by Md Labib Al Karim &middot; All rights reserved &middot; Not affiliated with the University of Texas at Arlington
      </footer>
    </div>
  );
}