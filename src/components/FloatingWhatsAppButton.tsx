import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FloatingWhatsAppButton: React.FC = () => {
  const { isFa } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  const whatsappNumber = '+98 919 0059314';
  const whatsappUrl = 'https://wa.me/989190059314';

  const defaultMessage = isFa
    ? 'درود خدمت آتلیه ساقی آبیار، جهت استعلام و سفارش اثر هنری پیام می‌دهم.'
    : 'Hello Saghi Abyar Studio, I am contacting you regarding an artwork inquiry/commission.';

  const chatLink = `${whatsappUrl}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div 
      className={`fixed bottom-6 ${isFa ? 'left-6' : 'right-6'} z-40 flex items-center gap-3 select-none`}
      style={{
        bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))',
        left: isFa ? 'max(1.5rem, env(safe-area-inset-left, 0px))' : undefined,
        right: !isFa ? 'max(1.5rem, env(safe-area-inset-right, 0px))' : undefined,
      }}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Interactive Tooltip Card */}
      <AnimatePresence>
        {(isHovered || showPrompt) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: isFa ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: isFa ? -10 : 10 }}
            className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-zinc-950/90 border border-emerald-500/30 text-white shadow-2xl backdrop-blur-xl font-mono text-xs relative group max-w-xs"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{isFa ? 'واتساپ آتلیه ساقی آبیار' : 'Saghi Abyar Studio'}</span>
              </div>
              <p className="text-[10px] text-white/70 font-sans truncate">
                {isFa ? 'گفتگوی مستقیم با مدیر آتلیه' : 'Direct acquisition & commission chat'}
              </p>
            </div>

            {showPrompt && !isHovered && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPrompt(false);
                }}
                className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors ml-1"
                title={isFa ? 'بستن پیام' : 'Dismiss'}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dark Artistic Glass WhatsApp Button */}
      <motion.a
        href={chatLink}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative group p-3.5 sm:p-4 rounded-full bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 border border-emerald-500/40 text-white shadow-2xl hover:border-emerald-400/80 transition-all cursor-pointer flex items-center justify-center overflow-hidden"
        title={isFa ? `ارتباط در واتساپ: ${whatsappNumber}` : `Chat on WhatsApp: ${whatsappNumber}`}
        aria-label="Direct WhatsApp Contact"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 bg-emerald-500/15 group-hover:bg-emerald-500/25 transition-colors rounded-full blur-sm" />
        
        {/* Ring Animation */}
        <span className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ping opacity-30 pointer-events-none" />

        {/* WhatsApp Custom Artistic Icon */}
        <div className="relative z-10 text-emerald-400 group-hover:text-emerald-300 transition-colors">
          <svg 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-6 h-6 sm:w-7 sm:h-7"
          >
            <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.477-.15-.678.15-.201.3-.778.979-.954 1.18-.176.2-.352.226-.653.075-.3-.15-1.267-.467-2.414-1.49-1.048-.934-1.756-2.087-1.962-2.44-.206-.352-.022-.543.129-.693.136-.135.301-.352.452-.528.15-.176.201-.301.301-.502.1-.2.05-.377-.025-.528-.075-.15-.678-1.633-.929-2.235-.245-.586-.494-.506-.678-.515-.176-.009-.377-.009-.578-.009s-.527.075-.803.377c-.276.301-1.054 1.03-1.054 2.512 0 1.482 1.079 2.913 1.23 3.114.15.201 2.124 3.243 5.145 4.548.719.311 1.28.497 1.718.636.722.23 1.378.197 1.9.12.58-.087 1.78-.728 2.03-1.431.251-.703.251-1.306.176-1.431-.076-.126-.277-.201-.578-.352z"/>
            <path d="M12.004 2c-5.518 0-9.996 4.48-9.996 10 0 1.765.459 3.488 1.332 5.006L2 22l5.132-1.312c1.472.803 3.128 1.226 4.872 1.226 5.518 0 9.996-4.48 9.996-10S17.522 2 12.004 2zm0 18.176c-1.503 0-2.977-.406-4.262-1.173l-.306-.182-3.167.81.846-3.088-.199-.317a8.163 8.163 0 0 1-1.252-4.226c0-4.509 3.667-8.176 8.176-8.176 4.509 0 8.176 3.667 8.176 8.176 0 4.509-3.667 8.176-8.176 8.176z"/>
          </svg>
        </div>
      </motion.a>
    </div>
  );
};
