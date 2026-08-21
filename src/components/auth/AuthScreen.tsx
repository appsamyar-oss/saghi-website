import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { X, Mail, Lock, User, Loader2, ShieldCheck } from 'lucide-react';
import { SaghiEmblemLogo } from '../SaghiEmblemLogo';

interface AuthScreenProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onClose, onSuccess }) => {
  const { isFa, t } = useApp();
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'verify'>('login');
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Mock network delay
      await new Promise(res => setTimeout(res, 1500));

      if (view === 'signup') {
        if (!isPasswordValid) throw new Error(isFa ? 'رمز عبور امن نیست' : 'Password does not meet security requirements');
        
        // Mock successful registration
        setSuccessMsg(isFa ? 'ثبت‌نام با موفقیت انجام شد' : 'Registration successful.');
        setTimeout(() => setView('login'), 2000);
      } 
      else if (view === 'login') {
        // Mock simple validation: admin access with specific credentials or accept any valid structure for demo
        if (email === 'admin@saghiabyar.com' || password.length >= 8) {
          onSuccess({ name: 'Saghi Abyar Admin', email });
        } else {
          throw new Error('Invalid email or password');
        }
      }
      else if (view === 'forgot') {
        setSuccessMsg('If an account with that email exists, a reset link has been sent.');
        setTimeout(() => setView('login'), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 opacity-90">
            <SaghiEmblemLogo />
          </div>
          <h2 className="text-xl font-cinzel font-bold text-amber-400 tracking-widest uppercase">
            {view === 'login' ? 'Studio Access' : view === 'signup' ? 'Join Studio' : 'Reset Password'}
          </h2>
          <p className="text-xs text-white/40 mt-2 font-mono">
            {view === 'login' 
              ? 'Enter your credentials to continue' 
              : view === 'signup' 
                ? 'Create a secure collector account' 
                : 'Request a secure reset link'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center"
              >
                {error}
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center"
              >
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {view === 'signup' && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-amber-400 transition-colors" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={isFa ? 'نام و نام خانوادگی' : 'Full Name'}
                className="w-full bg-black/50 border border-white/10 focus:border-amber-400 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none transition-all"
              />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-amber-400 transition-colors" />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={isFa ? 'آدرس ایمیل' : 'Email Address'}
              className="w-full bg-black/50 border border-white/10 focus:border-amber-400 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none transition-all"
            />
          </div>

          {(view === 'login' || view === 'signup') && (
            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={isFa ? 'رمز عبور' : 'Password'}
                  className="w-full bg-black/50 border border-white/10 focus:border-amber-400 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none transition-all"
                />
              </div>

              {/* Real-time Password Validation for Signup */}
              {view === 'signup' && password && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-[10px] font-mono">
                  <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-400' : 'text-white/40'}`}>
                    <ShieldCheck className="w-3 h-3" /> 8+ Characters
                  </div>
                  <div className={`flex items-center gap-2 ${hasUpper ? 'text-emerald-400' : 'text-white/40'}`}>
                    <ShieldCheck className="w-3 h-3" /> Uppercase Letter
                  </div>
                  <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-400' : 'text-white/40'}`}>
                    <ShieldCheck className="w-3 h-3" /> Number
                  </div>
                  <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-400' : 'text-white/40'}`}>
                    <ShieldCheck className="w-3 h-3" /> Special Character
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setView('forgot')}
                className="text-[10px] text-amber-400/80 hover:text-amber-400 font-mono tracking-wider transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {view === 'forgot' && (
            <div className="space-y-4">
              <p className="text-xs text-white/50 text-center mb-4">
                Enter your registered email address and we'll send you a secure link to reset your password.
              </p>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-black/50 border border-white/10 focus:border-amber-400 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-white/30 mt-2 px-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-500/70" />
              Protected by reCAPTCHA v3
            </div>
            <div className="flex gap-2">
              <span className="hover:text-white/50 cursor-pointer">Privacy</span>
              <span className="hover:text-white/50 cursor-pointer">Terms</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (view === 'signup' && !isPasswordValid)}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {view === 'login' ? 'Secure Login' : view === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-mono text-white/40">
          {view === 'login' ? (
            <p>
              New to the studio?{' '}
              <button onClick={() => { setView('signup'); setError(null); setPassword(''); }} className="text-amber-400 hover:underline">
                Create an account
              </button>
            </p>
          ) : view === 'signup' ? (
            <p>
              Already a member?{' '}
              <button onClick={() => { setView('login'); setError(null); }} className="text-amber-400 hover:underline">
                Log in here
              </button>
            </p>
          ) : (
            <p>
              Remember your password?{' '}
              <button onClick={() => { setView('login'); setError(null); }} className="text-amber-400 hover:underline">
                Back to Login
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
