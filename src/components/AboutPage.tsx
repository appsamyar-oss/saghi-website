import React from 'react';
import { motion } from 'motion/react';
import { PageView } from '../types';
import { Palette, Feather, Music, Sparkles, ShoppingBag, ShieldCheck, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SaghiEmblemLogo } from './SaghiEmblemLogo';

interface AboutPageProps {
  setActiveView: (view: PageView) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setActiveView }) => {
  const { siteConfig, isFa, t, getLocalized } = useApp();
  const [isPortraitLoaded, setIsPortraitLoaded] = React.useState(false);

  const disciplineIcons = [Music, Palette, Sparkles, Feather];
  const artistPortraitUrl = 'https://qf1mwtdvcbajjjdk.public.blob.vercel-storage.com/Art%20Gallery/753205968_17937444480315827_3004804003390789664_n.jpg';
  const aboutVideoUrl = 'https://qf1mwtdvcbajjjdk.public.blob.vercel-storage.com/Art%20Gallery/%D9%85%D9%86_%D8%B1%D9%86%DA%AF_%D9%88_%D8%B7%D9%86%DB%8C%D9%86_%D8%AA%D8%A7%D8%B1_202608211517.mp4';

  return (
    <main className="min-h-screen bg-black text-white pt-28 pb-32 select-none">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Editorial Header with Official Seal */}
        <header className={`mb-16 ${isFa ? 'text-right' : 'text-left'}`}>
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
        <div className="space-y-24">
          {/* Section 1: Introduction & Artist Portrait Statement */}
          <section className="grid md:grid-cols-12 gap-10 items-center">
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
                {isFa ? '«من، رنگ و طنین تار»' : 'Me, Color & Resonance of Tar'}
              </h2>
              <p className={`text-white/80 text-base md:text-lg leading-relaxed font-light ${isFa ? 'font-vazir' : ''}`}>
                {t.about.originBody1}
              </p>
              <p className={`text-white/60 text-sm md:text-base leading-relaxed font-light ${isFa ? 'font-vazir' : ''}`}>
                {t.about.originBody2}
              </p>
            </motion.div>

            {/* Artist Portrait Card with Anti-Piracy Shield */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:col-span-6 relative group flex justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-amber-700/10 to-transparent rounded-3xl transform rotate-1 blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative w-full max-w-lg rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-zinc-950/90 backdrop-blur-md p-3 sm:p-4">
                <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-900 aspect-[3/4] flex items-center justify-center">
                  {/* Progressive Loading Placeholder Pulse */}
                  {!isPortraitLoaded && (
                    <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full border border-amber-500/20 border-t-amber-400 animate-spin" />
                    </div>
                  )}

                  <img
                    src={artistPortraitUrl}
                    alt={isFa ? 'ساقی آبیار - استودیو هنر و تار' : 'Saghi Abyar - Fine Art & Tar Studio'}
                    referrerPolicy="no-referrer"
                    decoding="async"
                    fetchPriority="high"
                    onLoad={() => setIsPortraitLoaded(true)}
                    onContextMenu={(e) => e.preventDefault()}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
                    className={`w-full h-full object-cover object-top pointer-events-none transition-all duration-700 grayscale group-hover:grayscale-0 hover:grayscale-0 active:grayscale-0 ${
                      isPortraitLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-md'
                    } group-hover:scale-102`}
                    style={{ imageRendering: 'auto' }}
                  />
                  {/* Anti-Theft Protective Transparent Overlay */}
                  <div
                    className="absolute inset-0 z-10 pointer-events-none"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  {/* Refined subtle bottom shadow for badge readability without dulling image clarity */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />

                  <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-xs font-mono text-white/90">
                    <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/30 text-amber-300 font-bold shadow-lg">
                      {isFa ? 'ساقی آبیار' : 'SAGHI ABYAR'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-white/90 shadow-lg">
                      {isFa ? 'پرتره رسمی استودیو' : 'Studio Portrait'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Section: Dedicated Video Feature ("من، رنگ و طنین تار") with Anti-Theft */}
          <section className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-b from-zinc-950 to-black p-6 sm:p-10 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-white/10">
              <div className={isFa ? 'text-right' : 'text-left'}>
                <span className="text-amber-400 font-mono text-xs tracking-widest uppercase flex items-center gap-2">
                  <Music className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFa ? 'ویدیو مستند و اجرای تار' : 'Documentary & Tar Solo Performance'}</span>
                </span>
                <h3 className={`text-2xl sm:text-3xl font-bold text-white mt-1 ${isFa ? 'font-vazir font-bold text-amber-200' : 'font-playfair'}`}>
                  {isFa ? 'طنین تار و قلم‌مو: «من، رنگ و طنین تار»' : 'Me, Color & The Resonance of Tar'}
                </h3>
              </div>
              <div className="text-xs font-mono text-white/50">
                {isFa ? 'کیفیت استودیویی 4K • محافظت شده' : '4K Studio Master • Protected Stream'}
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video max-h-[65vh] mx-auto shadow-2xl flex items-center justify-center">
              <video
                src={aboutVideoUrl}
                poster={artistPortraitUrl}
                controls
                playsInline
                webkit-playsinline="true"
                preload="metadata"
                controlsList="nodownload"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-contain"
              />
            </div>
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
                <div className="relative h-64 overflow-hidden rounded-2xl">
                  <img
                    src="https://qf1mwtdvcbajjjdk.public.blob.vercel-storage.com/Art%20Gallery/603041437_17905300002315827_2091870345981580017_n.jpg"
                    alt="Minimalist & Cubist Paintings"
                    referrerPolicy="no-referrer"
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-cover pointer-events-none transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 z-10 pointer-events-none" onContextMenu={(e) => e.preventDefault()} />
                </div>
                <div className="p-2 text-center text-xs font-mono text-amber-300">
                  {isFa ? 'نقاشی مینیمال و کوبیسم' : 'Minimalist & Cubist Paintings'}
                </div>
              </div>
              <div className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-lg bg-white/5 p-2">
                <div className="relative h-64 overflow-hidden rounded-2xl">
                  <img
                    src="https://qf1mwtdvcbajjjdk.public.blob.vercel-storage.com/Art%20Gallery/535370282_18174766348343323_31405188512772339_n.jpg"
                    alt="Persian Tar Performance"
                    referrerPolicy="no-referrer"
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-cover pointer-events-none transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 z-10 pointer-events-none" onContextMenu={(e) => e.preventDefault()} />
                </div>
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
              src="https://qf1mwtdvcbajjjdk.public.blob.vercel-storage.com/Art%20Gallery/771822975_17940985809315827_2593308570518048505_n.jpg"
              alt="Studio Life"
              referrerPolicy="no-referrer"
              onContextMenu={(e) => e.preventDefault()}
              className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />
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

