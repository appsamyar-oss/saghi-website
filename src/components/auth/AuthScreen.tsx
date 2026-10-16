import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { X, Mail, Lock, User, Loader2, ShieldCheck, KeyRound, Eye, EyeOff, Database, Sparkles } from 'lucide-react';
import { SaghiEmblemLogo } from '../SaghiEmblemLogo';
import { FakeDecoyGateway } from './FakeDecoyGateway';
import { signInAdmin, sendAdminPasswordReset } from '../../firebase';

interface AuthScreenProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onClose, onSuccess }) => {
  const { isFa } = useApp();
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'verify'>('login');
  
  // Form States (Supports both username or email for admin login)
  const [identifier, setIdentifier] = useState(''); // admin email
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Honeypot Bot Trap States
  const [isBotTrapped, setIsBotTrapped] = useState(false);
  const [honeypotCheck, setHoneypotCheck] = useState(false);
  const [honeypotField, setHoneypotField] = useState('');

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasNumber && hasSpecial;

  // Bot trap triggered handler
  if (isBotTrapped) {
    return <FakeDecoyGateway onClose={onClose} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check Honeypot: If bot touched the invisible fields, trigger the trap immediately!
    if (honeypotCheck || honeypotField.trim() !== '') {
      console.warn('[Security Honeypot] Bot activity detected. Diverting to decoy enclave.');
      setIsBotTrapped(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (view === 'signup') {
        if (!isPasswordValid) throw new Error(isFa ? 'رمز عبور امن نیست' : 'Password does not meet security requirements');
        
        setSuccessMsg(isFa ? 'ثبت‌نام با موفقیت انجام شد' : 'Registration successful.');
        setTimeout(() => setView('login'), 1500);
      } 
      else if (view === 'login') {
        try {
          const user = await signInAdmin(identifier, password);
          onSuccess({ name: user.displayName || 'Saghi Abyar Admin', email: user.email });
        } catch (authErr: any) {
          const code = String(authErr?.code || authErr?.message || '');
          if (code === 'not-admin') {
            throw new Error(isFa ? 'این حساب دسترسی مدیریت ندارد' : 'This account does not have admin access');
          }
          if (code.includes('too-many-requests')) {
            throw new Error(isFa ? 'تلاش‌های زیاد. کمی بعد دوباره امتحان کنید' : 'Too many attempts. Please try again later');
          }
          throw new Error(isFa ? 'ایمیل یا رمز عبور اشتباه است' : 'Invalid email or password');
        }
      }
      else if (view === 'forgot') {
        // Same message whether or not the account exists, to avoid leaking which emails are registered
        await sendAdminPasswordReset(email).catch(() => {});
        setSuccessMsg(isFa ? 'در صورت مطابقت نام کاربری/ایمیل، دستورالعمل بازیابی ارسال شد.' : 'If an account matches, recovery instructions have been sent.');
        setTimeout(() => setView('login'), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
      {/* Glowing Animated Conic Gradient Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="glowing-login-box"
      >
        <div className="glowing-login-inner">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 opacity-95">
              <SaghiEmblemLogo />
            </div>
            <h2 className="text-lg font-cinzel font-bold text-amber-400 tracking-widest uppercase flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{view === 'login' ? (isFa ? 'ورود به آتلیه' : 'Studio Access') : view === 'signup' ? (isFa ? 'عضویت در آتلیه' : 'Join Studio') : (isFa ? 'بازیابی رمز' : 'Reset Password')}</span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </h2>
            <p className="text-[11px] text-white/50 mt-1 font-mono">
              {view === 'login' 
                ? (isFa ? 'مشخصات امنیتی خود را وارد نمایید' : 'Enter your credentials to continue')
                : view === 'signup' 
                  ? (isFa ? 'ایجاد حساب کاربری اختصاصی' : 'Create a secure collector account')
                  : (isFa ? 'درخواست لینک امن بازیابی' : 'Request a secure reset link')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* ======================================================== */}
            {/* BOT TRAP / HONEYPOT: Visually hidden from human users    */}
            {/* Bots reading DOM will automatically check or fill these  */}
            {/* ======================================================== */}
            <div 
              aria-hidden="true" 
              style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none', height: 0, width: 0, overflow: 'hidden' }}
            >
              <label htmlFor="bot_verification">I am not a robot human verification checkbox</label>
              <input
                id="bot_verification"
                type="checkbox"
                name="bot_verification"
                tabIndex={-1}
                autoComplete="off"
                checked={honeypotCheck}
                onChange={(e) => {
                  setHoneypotCheck(e.target.checked);
                  setIsBotTrapped(true);
                }}
              />
              <label htmlFor="website_security_token">Security Token URL</label>
              <input
                id="website_security_token"
                type="text"
                name="website_security_token"
                tabIndex={-1}
                autoComplete="off"
                value={honeypotField}
                onChange={(e) => {
                  setHoneypotField(e.target.value);
                  setIsBotTrapped(true);
                }}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setIsBotTrapped(true)}
              >
                Verify human status
              </button>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center font-mono"
                >
                  {error}
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-mono"
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
                  className="glowing-input-field pl-11"
                />
              </div>
            )}

            {view === 'login' ? (
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder={isFa ? 'ایمیل مدیریت' : 'Admin Email'}
                  dir="ltr"
                  className="glowing-input-field pl-11 font-mono text-xs sm:text-sm"
                />
              </div>
            ) : (
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={isFa ? 'آدرس ایمیل' : 'Email Address'}
                  dir="ltr"
                  className="glowing-input-field pl-11 font-mono text-xs sm:text-sm"
                />
              </div>
            )}

            {(view === 'login' || view === 'signup') && (
              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-amber-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                    placeholder={isFa ? 'رمز عبور' : 'Password'}
                    dir="ltr"
                    className="glowing-input-field pl-11 pr-11 font-mono text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Real-time Password Validation for Signup */}
                {view === 'signup' && password && (
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1 text-[10px] font-mono">
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
                  className="text-[10px] text-amber-400/80 hover:text-amber-400 font-mono tracking-wider transition-colors cursor-pointer"
                >
                  {isFa ? 'فراموشی رمز عبور؟' : 'Forgot Password?'}
                </button>
              </div>
            )}

            {view === 'forgot' && (
              <div className="space-y-3">
                <p className="text-xs text-white/50 text-center">
                  {isFa 
                    ? 'ایمیل ثبت‌شده خود را وارد کنید تا لینک بازیابی ارسال شود.' 
                    : "Enter your registered email address and we'll send you a secure link to reset your password."}
                </p>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-amber-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="glowing-input-field pl-11 font-mono text-xs sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-white/35 pt-1 px-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Encrypted Studio Shield</span>
              </div>
              <div className="flex gap-2 font-mono">
                <span>{isFa ? 'حریم امن' : 'Secured'}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || (view === 'signup' && !isPasswordValid)}
              className="w-full py-3 glowing-submit-btn text-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {view === 'login' 
                ? (isFa ? 'ورود امن به پنل مدیریت' : 'Sign in to Studio') 
                : view === 'signup' 
                  ? (isFa ? 'ایجاد حساب' : 'Create Account') 
                  : (isFa ? 'ارسال لینک بازیابی' : 'Send Reset Link')}
            </button>
          </form>

          <div className="mt-5 text-center text-xs font-mono text-white/40">
            {view === 'login' ? null : view === 'signup' ? (
              <p>
                {isFa ? 'قبلاً ثبت‌نام کرده‌اید؟ ' : 'Already a member? '}
                <button onClick={() => { setView('login'); setError(null); }} className="text-amber-400 hover:underline cursor-pointer">
                  {isFa ? 'ورود به حساب' : 'Log in here'}
                </button>
              </p>
            ) : (
              <p>
                {isFa ? 'رمز خود را به خاطر دارید؟ ' : 'Remember your password? '}
                <button onClick={() => { setView('login'); setError(null); }} className="text-amber-400 hover:underline cursor-pointer">
                  {isFa ? 'بازگشت به ورود' : 'Back to Login'}
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
