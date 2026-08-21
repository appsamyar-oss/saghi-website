import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Info, 
  Mail, 
  Compass, 
  Globe, 
  ShieldCheck, 
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
        {/* Brand Logo */}
        <BrandMotionLogo
          size="md"
          showSubtitle={true}
          onClick={() => setActiveView('home')}
        />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest font-mono">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`transition-all py-2 px-3.5 rounded-full flex items-center gap-1.5 cursor-pointer ${
                activeView === item.id
                  ? 'text-white bg-white/10 border border-white/20 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Action Controls: Language Switcher, Commission Button, Admin */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Purchase / Commission CTA Button */}
          <button
            onClick={() => setActiveView('contact')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/40 text-amber-300 hover:text-amber-200 text-[11px] font-semibold tracking-wide transition-all shadow-lg hover:shadow-amber-500/10 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.common.startCommission}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono flex items-center gap-1.5 text-white/90 hover:text-white transition-colors cursor-pointer"
            title="Switch Language / تغییر زبان"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">{isFa ? 'EN' : 'فا'}</span>
          </button>

          {/* Admin Studio Trigger */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title={t.nav.admin}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
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
