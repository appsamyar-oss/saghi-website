import React from 'react';
import { PageView } from '../types';
import { Mail, Phone, Instagram, ArrowUpRight, ShoppingBag, Code, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandMotionLogo } from './BrandMotionLogo';

interface FooterProps {
  setActiveView: (view: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveView,
}) => {
  const { siteConfig, isFa, t } = useApp();

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
              <li>
                <a 
                  href="https://wa.me/989190059314" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-xs text-emerald-400/90 font-mono hover:text-emerald-300 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0">
                    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.477-.15-.678.15-.201.3-.778.979-.954 1.18-.176.2-.352.226-.653.075-.3-.15-1.267-.467-2.414-1.49-1.048-.934-1.756-2.087-1.962-2.44-.206-.352-.022-.543.129-.693.136-.135.301-.352.452-.528.15-.176.201-.301.301-.502.1-.2.05-.377-.025-.528-.075-.15-.678-1.633-.929-2.235-.245-.586-.494-.506-.678-.515-.176-.009-.377-.009-.578-.009s-.527.075-.803.377c-.276.301-1.054 1.03-1.054 2.512 0 1.482 1.079 2.913 1.23 3.114.15.201 2.124 3.243 5.145 4.548.719.311 1.28.497 1.718.636.722.23 1.378.197 1.9.12.58-.087 1.78-.728 2.03-1.431.251-.703.251-1.306.176-1.431-.076-.126-.277-.201-.578-.352z"/>
                    <path d="M12.004 2c-5.518 0-9.996 4.48-9.996 10 0 1.765.459 3.488 1.332 5.006L2 22l5.132-1.312c1.472.803 3.128 1.226 4.872 1.226 5.518 0 9.996-4.48 9.996-10S17.522 2 12.004 2zm0 18.176c-1.503 0-2.977-.406-4.262-1.173l-.306-.182-3.167.81.846-3.088-.199-.317a8.163 8.163 0 0 1-1.252-4.226c0-4.509 3.667-8.176 8.176-8.176 4.509 0 8.176 3.667 8.176 8.176 0 4.509-3.667 8.176-8.176 8.176z"/>
                  </svg>
                  <span dir="ltr">+98 919 0059314 (WhatsApp)</span>
                </a>
              </li>
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

        {/* Bottom Bar & Site Credits */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 text-center sm:text-left font-mono">
            &copy; {new Date().getFullYear()} {isFa ? siteConfig.atelierNameFa : 'SAGHI ABYAR ATELIER'} &mdash; SAGHIABYAR.COM
          </div>

          {/* Created by Saman Abyar Credit */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-amber-300/90 hover:text-amber-200 hover:border-amber-400/30 transition-all">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>
              {isFa ? 'طراحی و توسعه وب‌سایت: سامان آبیار' : 'Created & Engineered by Saman Abyar'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
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
