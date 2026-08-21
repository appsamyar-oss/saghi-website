import React from 'react';
import { PageView } from '../types';
import { Mail, Phone, Instagram, ArrowUpRight, ShieldCheck, ShoppingBag, Music, Palette } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandMotionLogo } from './BrandMotionLogo';

interface FooterProps {
  setActiveView: (view: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveView,
}) => {
  const { siteConfig, isFa, t, setIsAdminOpen } = useApp();

  return (
    <footer className="relative bg-black text-white border-t border-white/10 pt-20 pb-16 overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-amber-950/20 via-rose-950/10 to-transparent blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Col 1: Brand & Atelier */}
          <div className={`md:col-span-2 space-y-4 ${isFa ? 'text-right' : 'text-left'}`}>
            <div className="mb-2">
              <BrandMotionLogo
                size="lg"
                showSubtitle={true}
                onClick={() => { setActiveView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
            </div>
            <p className={`text-amber-400/90 text-sm font-medium tracking-wide ${isFa ? 'font-vazir' : 'font-mono'}`}>
              {isFa ? 'نقاشی، هنرهای تجسمی و تکنوازی تار ایرانی' : 'Fine Art, Painting & Classical Persian Tar Music'}
            </p>
            <p className={`text-gray-400 text-sm leading-relaxed max-w-md ${isFa ? 'font-vazir' : ''}`}>
              {isFa
                ? 'استودیو و آرشیو رسمی ساقی آبیار؛ آفرینش بوم‌های غلیظ رنگ‌روغن، نگارگری نوین و اجرای بداهه‌نوازی‌های تار در دستگاه‌های موسیقی اصیل ایرانی.'
                : 'The official atelier of Saghi Abyar — intertwining emotive contemporary oil paintings, Persian miniature aesthetics, and classical Tar solo improvisations.'
              }
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                <span>{isFa ? siteConfig.locationFa : siteConfig.locationEn}</span>
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className={`space-y-4 ${isFa ? 'text-right' : 'text-left'}`}>
            <h4 className={`text-xs font-mono text-amber-400 uppercase tracking-widest ${isFa ? 'font-vazir font-bold' : ''}`}>
              {isFa ? 'بخش‌های آتلیه' : 'Explore Atelier'}
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400 font-mono">
              <li>
                <button
                  onClick={() => { setActiveView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isFa ? 'گالری اصلی' : 'Gallery Home'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveView('archive'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>{t.nav.archive}</span>
                  <ArrowUpRight className={`w-3 h-3 ${isFa ? 'rotate-[-90deg]' : ''}`} />
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.nav.about}
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveView('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-300 text-amber-200/90 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{t.nav.contact}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="hover:text-amber-300 text-white/40 transition-colors cursor-pointer flex items-center gap-1.5 pt-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>{t.nav.admin}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Connect & Studio Inquiries */}
          <div className={`space-y-4 ${isFa ? 'text-right' : 'text-left'}`}>
            <h4 className={`text-xs font-mono text-rose-400 uppercase tracking-widest ${isFa ? 'font-vazir font-bold' : ''}`}>
              {isFa ? 'ارتباط و سفارش' : 'Acquisitions & Contact'}
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {siteConfig.instagram && (
                <li>
                  <a
                    href={`https://instagram.com/${siteConfig.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-300 transition-colors flex items-center gap-2 text-xs font-mono"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                    <span dir="ltr">{siteConfig.instagram}</span>
                  </a>
                </li>
              )}
              {siteConfig.telegram && (
                <li>
                  <a
                    href={`https://t.me/${siteConfig.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sky-300 transition-colors flex items-center gap-2 text-xs font-mono"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-sky-400 flex-shrink-0">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    <span dir="ltr">{siteConfig.telegram}</span>
                  </a>
                </li>
              )}
              {siteConfig.whatsapp && (
                <li className="flex items-center gap-2 text-xs text-gray-400 font-mono hover:text-emerald-300 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <a href={`https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" dir="ltr" className="truncate">
                    {siteConfig.whatsapp}
                  </a>
                </li>
              )}
              {siteConfig.email && (
                <li className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                  <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <a href={`mailto:${siteConfig.email}`} dir="ltr" className="hover:text-white truncate">
                    {siteConfig.email}
                  </a>
                </li>
              )}
              {siteConfig.phone && (
                <li className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span dir="ltr">{siteConfig.phone}</span>
                </li>
              )}
              <li className="pt-2">
                <button
                  onClick={() => {
                    setActiveView('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold flex items-center gap-2 transition-all w-full justify-center"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isFa ? 'ثبت سفارش یا خرید اثر' : 'Inquire for Acquisition'}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 text-center sm:text-left font-mono">
            &copy; {new Date().getFullYear()} {isFa ? siteConfig.atelierNameFa : 'SAGHI ABYAR ATELIER'} &mdash; SAGHIABYAR.COM
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
              title={t.nav.admin}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => {
                setActiveView('archive');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 h-10 rounded-full border border-white/15 flex items-center justify-center bg-white/5 text-[10px] uppercase tracking-widest text-white/80 hover:border-amber-400/50 hover:text-white cursor-pointer transition-all font-mono"
            >
              {t.common.viewArchive}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
