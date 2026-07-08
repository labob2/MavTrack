import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient.js';

function LogoMark(props){
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 16L9 10L13 13L20 5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 5H20V10" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

const AUTH_CSS = `
:root{
  --bg:#0B0E12; --bg-panel:#12161C; --bg-elevated:#171C24;
  --line:#232A33; --line-soft:#1B2129;
  --text:#E7E9EA; --text-dim:#8B94A0; --text-faint:#5C6570;
  --accent:#E8A33D; --accent-glow:rgba(232,163,61,0.35);
  --bad:#F87171;
  --sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
  --mono:ui-monospace,SFMono-Regular,'SF Mono',Consolas,'Courier New',monospace;
}
.al-auth-root{ min-height:100vh; background:var(--bg); color:var(--text); font-family:var(--sans); position:relative; display:flex; align-items:center; justify-content:center; padding:20px; }
.al-bg{ position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; background:var(--bg); }
.al-bg::before{
  content:""; position:absolute; inset:-20%;
  background-image:
    linear-gradient(var(--line-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--line-soft) 1px, transparent 1px);
  background-size:46px 46px;
  animation: al-grid-drift 46s linear infinite;
  opacity:.55;
}
.al-bg::after{
  content:""; position:absolute; width:52vw; height:52vw; border-radius:50%;
  background:radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  top:-8%; left:-8%; filter:blur(70px); opacity:.5;
  animation: al-glow-move 24s ease-in-out infinite;
}
@keyframes al-grid-drift{ from{ background-position:0 0; } to{ background-position:92px 92px; } }
@keyframes al-glow-move{ 0%,100%{ transform:translate(0,0); } 50%{ transform:translate(18%,14%); } }
@media (prefers-reduced-motion: reduce){ .al-bg::before, .al-bg::after{ animation:none; } }

.al-auth-card{ position:relative; z-index:1; width:100%; max-width:380px; background:var(--bg-panel); border:1px solid var(--line); border-radius:12px; padding:32px 28px; }
.al-brand{ display:flex; align-items:center; gap:8px; }
.al-brand-name{ font-family:var(--mono); font-size:16px; font-weight:700; letter-spacing:.04em; color:var(--text); }
.al-auth-title{ font-size:19px; font-weight:700; margin:22px 0 4px; text-align:center; }
.al-auth-sub{ font-size:13px; color:var(--text-faint); text-align:center; margin:0 0 24px; }
.al-auth-form{ display:flex; flex-direction:column; gap:6px; }
.al-auth-label{ font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:var(--text-faint); margin:10px 0 2px; }
.al-auth-form input{ font-family:var(--sans); font-size:14px; padding:10px 12px; border:1px solid var(--line); border-radius:7px; background:var(--bg-elevated); color:var(--text); width:100%; }
.al-auth-form input:focus{ outline:none; border-color:var(--accent); box-shadow:0 0 0 2px var(--accent-glow); }
.al-auth-error{ font-size:12px; color:var(--bad); background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.3); border-radius:6px; padding:8px 10px; margin-top:12px; }
.al-auth-message{ font-size:12px; color:var(--accent); background:rgba(232,163,61,.08); border:1px solid rgba(232,163,61,.3); border-radius:6px; padding:8px 10px; margin-top:12px; }
.al-btn{ font-family:var(--sans); font-size:13px; font-weight:700; padding:10px 14px; border:1px solid var(--accent); border-radius:7px; background:var(--accent); color:#151008; cursor:pointer; }
.al-btn:hover{ filter:brightness(1.08); }
.al-btn:disabled{ opacity:.6; cursor:default; }
.al-auth-submit{ width:100%; margin-top:18px; }
.al-auth-toggle{ display:block; width:100%; text-align:center; margin-top:18px; background:none; border:none; color:var(--text-dim); font-size:12px; cursor:pointer; font-family:var(--sans); }
.al-auth-toggle:hover{ color:var(--accent); }
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
      <div className="al-bg" />
      <div className="al-auth-card">
        <div className="al-brand" style={{ justifyContent:'center' }}>
          <LogoMark />
          <span className="al-brand-name">MavTrack</span>
        </div>
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
  );
}
