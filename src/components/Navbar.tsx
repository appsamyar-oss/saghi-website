import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Info, 
  Mail, 
  Compass, 
  Globe, 
  Menu, 
  X,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageView } from '../types';
import { BrandMotionLogo } from './BrandMotionLogo';

interface NavbarProps {
  activeView: PageView;
  setActiveView: (view: PageView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
}) => {
  const { language, setLanguage, isFa, t, siteConfig, setIsAdminOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Stealth Admin Trigger States: 5 clicks or 5 seconds long-press
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    setActiveView('home');
    
    // Stealth multi-click detector: 5 clicks within 2.5 seconds
    clickCountRef.current += 1;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      setIsAdminOpen(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      return;
    }

    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2500);
  };

  const handleTouchStart = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setIsAdminOpen(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([150, 80, 150]);
      }
    }, 5000); // 5 seconds long-press
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleMouseDown = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setIsAdminOpen(true);
    }, 5000); // 5 seconds long-press on desktop
  };

  const handleMouseUpOrLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fa' : 'en');
  };

  const navItems = [
    { id: 'home' as PageView, label: isFa ? 'گالری اصلی' : 'Gallery', icon: Compass },
    { id: 'archive' as PageView, label: t.nav.archive, icon: ImageIcon },
    { id: 'about' as PageView, label: t.nav.about, icon: Info },
    { id: 'contact' as PageView, label: t.nav.contact, icon: Mail },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/85 backdrop-blur-xl border-b border-white/10">
      {/* Announcement Banner */}
      {siteConfig.announcement?.enabled && (
        <div className="bg-gradient-to-r from-amber-950/60 via-zinc-950/80 to-black border-b border-white/5 py-1.5 px-4 text-center">
          <p className="text-[11px] font-mono tracking-widest text-amber-300 font-light flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>{isFa ? siteConfig.announcement.textFa : siteConfig.announcement.textEn}</span>
          </p>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl h-20 flex items-center justify-between">
        {/* Brand Logo with Stealth Admin Entry (5 Clicks, 5-Second Long-Press) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="select-none"
        >
          <BrandMotionLogo
            size="md"
            showSubtitle={true}
            onClick={handleLogoClick}
          />
        </div>

        {/* Desktop Nav Links - Apple Liquid Navigation Bar */}
        <nav 
          className="liquid-nav hidden md:flex items-center"
          onMouseMove={(e) => {
            const nav = e.currentTarget;
            const rect = nav.getBoundingClientRect();
            const glare = nav.querySelector('#liquid-glare') as HTMLElement | null;
            if (glare) {
              glare.style.setProperty('--x', `${e.clientX - rect.left}px`);
              glare.style.setProperty('--y', `${e.clientY - rect.top}px`);
            }
          }}
        >
          {/* 3D Liquid Glare Follower */}
          <div className="liquid-glare-container">
            <div className="liquid-glare" id="liquid-glare" />
          </div>

          <div className="nav-items-liquid">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`liquid-nav-btn ${isActive ? 'active' : ''}`}
                >
                  {/* Smooth Motion Active Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="active-liquid-pill"
                      className="absolute inset-0 rounded-full bg-white/15 border border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] z-[-1]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className="liquid-btn-content">
                    <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-white/60'}`} />
                    <span className="font-mono text-xs uppercase tracking-wider">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="liquid-divider" />

          {/* Quick Language Toggle Integrated in Liquid Bar */}
          <button
            onClick={toggleLanguage}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Switch Language / تغییر زبان"
          >
            <span className="font-mono text-xs font-bold text-amber-300">{isFa ? 'EN' : 'فا'}</span>
          </button>
        </nav>

        {/* Action Controls: Language Switcher, Commission Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Purchase / Commission CTA Button */}
          <button
            onClick={() => setActiveView('contact')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/40 text-amber-300 hover:text-amber-200 text-[11px] font-semibold tracking-wide transition-all shadow-lg hover:shadow-amber-500/10 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.common.startCommission}</span>
          </button>

          {/* Language Switcher on mobile */}
          <button
            onClick={toggleLanguage}
            className="md:hidden px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono flex items-center gap-1.5 text-white/90 hover:text-white transition-colors cursor-pointer"
            title="Switch Language / تغییر زبان"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">{isFa ? 'EN' : 'فا'}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-black/95 px-6 py-6 space-y-4"
          >
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl text-sm font-mono uppercase tracking-wider ${
                    activeView === item.id
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setActiveView('contact');
                  setMobileMenuOpen(false);
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t.common.startCommission}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
