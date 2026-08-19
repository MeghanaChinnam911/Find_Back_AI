import React, { useState } from 'react';
import { Shield, Lock, Building2, UserCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthAPI } from '../services/api';
import { User } from '../types';

interface LandingPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('police@findback.demo');
  const [password, setPassword] = useState('Demo@123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter your authorization credentials.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const data = await AuthAPI.login(email, password);
      onLoginSuccess(data.user);
    } catch (err) {
      setErrorMsg('Invalid email or password. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSelect = (role: 'POLICE' | 'NGO' | 'ADMIN') => {
    const creds = {
      POLICE: { email: 'police@findback.demo', pass: 'Demo@123' },
      NGO: { email: 'ngo@findback.demo', pass: 'Demo@123' },
      ADMIN: { email: 'admin@findback.demo', pass: 'Demo@123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].pass);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-background flex flex-col justify-between py-10 px-4">
      
      <div className="max-w-4xl mx-auto w-full space-y-8 my-auto">
        
        {/* Welcome Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold border border-primary/10">
            <Shield className="w-3.5 h-3.5" />
            <span>Official Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">
            FIND-BACK <span className="text-primary">AI</span>
          </h1>

          <p className="text-lg font-medium text-text-main max-w-xl mx-auto">
            "Helping connect missing-person records with potential matches."
          </p>

          <p className="text-xs text-text-muted max-w-lg mx-auto leading-relaxed">
            A secure intelligence platform for authorized law-enforcement agencies, NGOs, shelters, and approved organizations.
          </p>
        </div>

        {/* Login Card */}
        <div className="max-w-md mx-auto panel-card p-6 sm:p-8 bg-surface space-y-6">
          
          <div className="border-b border-border pb-3">
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Portal Authentication
            </h2>
            <p className="text-xs text-text-muted">Sign in with your organizational credentials</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-danger/10 text-danger border border-danger/20 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-text-main font-semibold mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="officer@lawenforcement.gov"
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-text-main font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Preset Demo User Quick Selection */}
          <div className="border-t border-border pt-4 space-y-2">
            <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider">
              Select Demo Role Profile:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect('POLICE')}
                className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                  email === 'police@findback.demo'
                    ? 'bg-primary/5 border-primary text-primary font-bold'
                    : 'bg-surface border-border text-text-muted hover:text-text-main hover:bg-surface-subtle'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span>Police</span>
                </div>
                <span className="text-[10px] text-text-muted block font-mono truncate">police@demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('NGO')}
                className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                  email === 'ngo@findback.demo'
                    ? 'bg-accent/10 border-accent text-accent font-bold'
                    : 'bg-surface border-border text-text-muted hover:text-text-main hover:bg-surface-subtle'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Building2 className="w-3.5 h-3.5 text-accent" />
                  <span>NGO</span>
                </div>
                <span className="text-[10px] text-text-muted block font-mono truncate">ngo@demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('ADMIN')}
                className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                  email === 'admin@findback.demo'
                    ? 'bg-warning/10 border-warning text-warning font-bold'
                    : 'bg-surface border-border text-text-muted hover:text-text-main hover:bg-surface-subtle'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-warning" />
                  <span>Admin</span>
                </div>
                <span className="text-[10px] text-text-muted block font-mono truncate">admin@demo</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-center text-text-muted">
            🔒 Authorized agency access only. Confidential intelligence protocol.
          </p>

        </div>

        {/* Minimal Understated Workflow Process Diagram */}
        <div className="max-w-2xl mx-auto p-4 rounded-xl border border-border bg-surface text-xs text-text-muted">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="space-y-1">
              <span className="font-bold text-text-main block">1. Intake</span>
              <span className="text-[10px]">Record Upload</span>
            </div>
            <div className="space-y-1 border-l border-border">
              <span className="font-bold text-text-main block">2. Vector Search</span>
              <span className="text-[10px]">AI Multi-Signal Match</span>
            </div>
            <div className="space-y-1 border-l border-border">
              <span className="font-bold text-text-main block">3. Candidate Score</span>
              <span className="text-[10px]">Signal Analysis</span>
            </div>
            <div className="space-y-1 border-l border-border">
              <span className="font-bold text-emerald-700 block">4. Verification</span>
              <span className="text-[10px]">Authorized Human Review</span>
            </div>
          </div>
        </div>

      </div>

      <div className="text-center text-[11px] text-text-muted pt-4">
        FIND-BACK AI &copy; 2026. Official Missing Persons Discovery & Intelligence Network.
      </div>

    </div>
  );
};
