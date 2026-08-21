import React from 'react';
import { motion } from 'motion/react';
import { PageView } from '../types';
import { Palette, Feather, Music, Sparkles, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SaghiEmblemLogo } from './SaghiEmblemLogo';

interface AboutPageProps {
  setActiveView: (view: PageView) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setActiveView }) => {
  const { siteConfig, isFa, t, getLocalized } = useApp();

  const disciplineIcons = [Music, Palette, Sparkles, Feather];

  return (
    <main className="min-h-screen bg-black text-white pt-28 pb-32">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Editorial Header with Official Seal */}
        <header className={`mb-20 ${isFa ? 'text-right' : 'text-left'}`}>
          <div className="flex items-baseline gap-4">
            <span className="text-amber-400 font-medium text-xs sm:text-sm tracking-widest uppercase font-mono">
              {t.about.headerTag}
            </span>
            <div className="h-px flex-grow bg-white/10" />
            <span className="text-xs font-mono tracking-[0.2em] text-white/40 uppercase hidden sm:inline">
              {t.common.estLocation}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4">
            <div>
              <h1 className={`text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight ${
                isFa ? 'font-vazir font-extrabold text-4xl sm:text-6xl md:text-7xl py-1' : 'font-playfair'
              }`}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-amber-400">
                  {isFa ? siteConfig.artistNameFa : siteConfig.artistNameEn}
                </span>
              </h1>
              <p className={`text-amber-400/90 text-sm sm:text-base mt-2 font-mono uppercase tracking-widest ${isFa ? 'font-vazir' : ''}`}>
                {isFa ? 'هنرمند نقاش و نوازنده ساز تار ایرانی' : 'Fine Art Painter & Classical Persian Tar Soloist'}
              </p>
              <p className={`text-white/70 text-base mt-3 font-light leading-relaxed max-w-2xl ${isFa ? 'font-vazir' : 'font-serif'}`}>
                {t.about.headerDesc}
              </p>
            </div>

            {/* Official Studio Seal (Dark Variant) */}
            <div className="flex-shrink-0 flex items-center gap-4 bg-white/5 border border-white/10 p-3 sm:p-4 rounded-3xl backdrop-blur-md">
              <SaghiEmblemLogo variant="dark" size="lg" glow={true} />
              <div className="text-left font-mono">
                <div className="text-xs font-bold text-amber-300 tracking-wider">SAGHI ABYAR</div>
                <div className="text-[10px] text-white/60 uppercase tracking-widest">OFFICIAL ATELIER SEAL</div>
                <div className="text-[9px] text-amber-400/80 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>AUTHENTIC ART & MUSIC</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Story Sections */}
        <div className="space-y-32">
          {/* Section 1: Introduction & Artist Statement */}
          <section className="grid md:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: isFa ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={`md:col-span-6 space-y-6 ${isFa ? 'text-right' : 'text-left'}`}
            >
              <div className="flex items-baseline gap-4">
                <span className="text-amber-400 font-mono text-xs tracking-widest uppercase">
                  {t.about.originTag}
                </span>
                <div className="h-px flex-grow bg-white/10" />
              </div>
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-200 tracking-tight ${
                isFa ? 'font-vazir font-extrabold text-2xl sm:text-4xl md:text-5xl' : 'font-playfair'
              }`}>
                {t.about.originTitle}
              </h2>
              <p className={`text-white/80 text-base md:text-lg leading-relaxed font-light ${isFa ? 'font-vazir' : ''}`}>
                {t.about.originBody1}
              </p>
              <p className={`text-white/60 text-sm md:text-base leading-relaxed font-light ${isFa ? 'font-vazir' : ''}`}>
                {t.about.originBody2}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:col-span-6 relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-3xl transform rotate-2 blur-sm opacity-25 group-hover:opacity-45 transition-opacity duration-500" />
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black p-6 bg-white/5 flex flex-col items-center justify-center text-center">
                {/* Transparent Master Seal */}
                <div className="py-4">
                  <SaghiEmblemLogo variant="transparent" size="hero" glow={true} />
                </div>
                <div className="mt-4 flex items-center justify-between w-full text-xs font-mono text-white/50 border-t border-white/10 pt-4">
                  <span className="text-amber-400 font-bold">SAGHI ABYAR</span>
                  <span>{isFa ? 'نقاشی • تکنوازی تار' : 'FINE ART & PERSIAN TAR'}</span>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Section 2: Disciplines & Mastery */}
          <section className="grid md:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:col-span-6 order-2 md:order-1 grid grid-cols-2 gap-4 items-center"
            >
              <div className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-lg transform translate-y-6 bg-white/5 p-2">
                <img
                  src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80"
                  alt="Impasto Oil Painting"
                  referrerPolicy="no-referrer"
                  className="w-full h-64 object-cover rounded-2xl grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="p-2 text-center text-xs font-mono text-amber-300">
                  {isFa ? 'نقاشی مینیمال و کوبیسم' : 'Minimalist & Cubist Paintings'}
                </div>
              </div>
              <div className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-lg bg-white/5 p-2">
                <img
                  src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
                  alt="Persian Tar Solo"
                  referrerPolicy="no-referrer"
                  className="w-full h-64 object-cover rounded-2xl grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="p-2 text-center text-xs font-mono text-amber-300">
                  {isFa ? 'تکنوازی و نوازندگی تار' : 'Classical Persian Tar'}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: isFa ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={`md:col-span-6 order-1 md:order-2 space-y-6 ${isFa ? 'text-right' : 'text-left'}`}
            >
              <div className="flex items-baseline gap-4">
                <span className="text-rose-400 font-mono text-xs tracking-widest uppercase">
                  {t.about.disciplinesTag}
                </span>
                <div className="h-px flex-grow bg-white/10" />
              </div>
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-amber-300 ${
                isFa ? 'font-vazir font-extrabold text-2xl sm:text-4xl md:text-5xl' : 'font-playfair'
              }`}>
                {t.about.disciplinesTitle}
              </h2>
              <p className={`text-white/70 text-base md:text-lg leading-relaxed font-light ${isFa ? 'font-vazir' : ''}`}>
                {t.about.disciplinesDesc}
              </p>
              <ul className="space-y-3 pt-2">
                {siteConfig.disciplines.map((item, i) => {
                  const IconComponent = disciplineIcons[i % disciplineIcons.length];
                  return (
                    <li key={item.id} className="flex items-center gap-3 text-sm text-white/80">
                      <span className="p-1.5 rounded-lg bg-white/5 text-amber-400 border border-white/10">
                        <IconComponent className="w-3.5 h-3.5" />
                      </span>
                      <span className={isFa ? 'font-vazir' : ''}>{isFa ? item.nameFa : item.nameEn}</span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </section>

          {/* Full Width Impact Quote */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`relative w-full min-h-[380px] rounded-3xl overflow-hidden bg-white/5 border border-white/10 flex items-end p-8 md:p-14 ${isFa ? 'text-right' : 'text-left'}`}
          >
            <img
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&q=80"
              alt="Studio Life"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-35 grayscale hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="relative z-10 max-w-2xl space-y-3">
              <h3 className={`text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-relaxed ${
                isFa ? 'font-vazir font-bold text-amber-200 py-1' : 'font-playfair'
              }`}>
                {getLocalized(siteConfig.quoteEn, siteConfig.quoteFa)}
              </h3>
              <p className="text-amber-400 font-mono text-xs tracking-[0.25em] uppercase">
                {getLocalized(siteConfig.quoteAuthorEn, siteConfig.quoteAuthorFa)}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Commission CTA Panel */}
        <div className={`mt-32 p-8 md:p-12 border border-amber-500/20 rounded-3xl bg-gradient-to-r from-amber-950/20 via-zinc-900/50 to-zinc-950/80 backdrop-blur-sm shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 ${isFa ? 'text-right' : 'text-left'}`}>
          <div>
            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-amber-400 font-mono text-xs tracking-widest uppercase">
                {t.about.ctaTag}
              </span>
              <div className="h-px w-16 bg-white/10" />
            </div>
            <h3 className={`text-2xl md:text-3xl font-bold text-white tracking-tight ${isFa ? 'font-vazir font-extrabold text-amber-200' : 'font-playfair'}`}>{t.about.ctaTitle}</h3>
            <p className={`text-white/60 mt-1 max-w-lg text-sm font-light ${isFa ? 'font-vazir' : ''}`}>
              {t.about.ctaDesc}
            </p>
          </div>
          <button
            onClick={() => setActiveView('contact')}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-400 text-black font-bold rounded-full transition-all shadow-lg shadow-amber-500/20 cursor-pointer text-xs uppercase tracking-widest font-mono flex-shrink-0 flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.about.ctaBtn}</span>
          </button>
        </div>
      </div>
    </main>
  );
};

