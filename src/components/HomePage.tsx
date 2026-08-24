import React from 'react';
import { motion } from 'motion/react';
import { Artwork, PageView } from '../types';
import { useApp } from '../context/AppContext';
import { 
  ArrowRight, 
  Sparkles, 
  Music, 
  Palette, 
  Feather, 
  Box, 
  ShoppingBag, 
  Play, 
  Volume2 
} from 'lucide-react';
import { BrandMotionLogo } from './BrandMotionLogo';

interface HomePageProps {
  setActiveView: (view: PageView) => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onOpenInquiry?: (artwork: Artwork) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setActiveView,
  onSelectArtwork,
  onOpenInquiry,
}) => {
  const { artworks, siteConfig, isFa, t, getLocalized } = useApp();

  const featuredArtworks = artworks.filter((a) => a.featured);
  const displayFeatured = featuredArtworks.length > 0 ? featuredArtworks.slice(0, 4) : artworks.slice(0, 4);
  const heroArtwork = artworks.find(a => a.category === 'tar_music') || artworks[0];

  return (
    <main className="min-h-screen bg-black text-white pt-28 pb-32">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Editorial Hero Section */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-baseline gap-4 mb-6"
          >
            <span className="text-amber-400 font-medium text-xs sm:text-sm tracking-widest uppercase font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.home.badge}</span>
            </span>
            <div className="h-px flex-grow bg-white/10" />
            <span className="text-xs font-mono tracking-[0.2em] text-white/40 uppercase hidden sm:inline">
              {t.common.estLocation}
            </span>
          </motion.div>

          {/* Hero Brand Signature */}
          <div className="mb-8 overflow-visible py-2">
            <BrandMotionLogo
              size="hero"
              showSubtitle={false}
              interactive={true}
              onClick={() => setActiveView('archive')}
            />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight mb-6 ${
              isFa ? 'font-vazir font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl' : 'font-playfair'
            }`}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-100 to-amber-300">
              {getLocalized(siteConfig.heroHeadlineEn, siteConfig.heroHeadlineFa)}
            </span>
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className={`lg:col-span-8 text-white/70 text-base sm:text-lg md:text-xl font-light leading-relaxed ${
                isFa ? 'font-vazir' : 'font-serif'
              }`}
            >
              {getLocalized(siteConfig.heroDescriptionEn, siteConfig.heroDescriptionFa)}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className={`lg:col-span-4 flex flex-wrap items-center gap-3 ${isFa ? 'lg:justify-start' : 'lg:justify-end'}`}
            >
              <button
                onClick={() => setActiveView('archive')}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold rounded-full transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider font-mono"
              >
                <Box className="w-4 h-4" />
                <span>{t.home.exploreArchiveBtn}</span>
              </button>

              <button
                onClick={() => setActiveView('contact')}
                className="px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-amber-400/30 text-amber-300 rounded-full transition-all flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider font-mono"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.home.commissionBtn}</span>
              </button>
            </motion.div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t.home.statsWorks, value: `${artworks.length}+` },
              { label: t.home.statsDisciplines, value: '5+' },
              { label: t.home.statsHeritage, value: '12+' },
              { label: t.home.statsGold, value: '100%' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center"
              >
                <div dir="ltr" className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-300 font-mono">
                  {stat.value}
                </div>
                <div className={`text-[11px] text-white/60 font-light mt-1 uppercase tracking-wider ${isFa ? 'font-vazir' : ''}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <div className="space-y-32">
          {/* Hero Featured Solo / Piece */}
          {heroArtwork && (
            <section className="grid md:grid-cols-12 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: isFa ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={`md:col-span-6 space-y-6 ${isFa ? 'text-right' : 'text-left'}`}
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-amber-400 font-mono text-xs tracking-widest uppercase flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" />
                    <span>{t.home.heroAudioBadge}</span>
                  </span>
                  <div className="h-px flex-grow bg-white/10" />
                </div>

                <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-200 tracking-tight ${
                  isFa ? 'font-vazir font-extrabold text-2xl sm:text-4xl md:text-5xl' : 'font-playfair'
                }`}>
                  {getLocalized(heroArtwork.title, heroArtwork.titleFa)}
                </h2>

                <p className={`text-white/70 text-base md:text-lg leading-relaxed font-light ${isFa ? 'font-vazir' : ''}`}>
                  {getLocalized(heroArtwork.description, heroArtwork.descriptionFa)}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onSelectArtwork(heroArtwork)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-semibold uppercase tracking-wider text-amber-200 hover:bg-amber-500/30 transition-colors cursor-pointer group"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{heroArtwork.mediaType === 'audio' ? t.common.playAudio : t.common.viewDetails}</span>
                  </button>

                  {onOpenInquiry && (
                    <button
                      onClick={() => onOpenInquiry(heroArtwork)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-wider text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.common.inquirePiece}</span>
                    </button>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="md:col-span-6 relative group cursor-pointer"
                onClick={() => onSelectArtwork(heroArtwork)}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-3xl transform rotate-2 blur-sm opacity-25 group-hover:opacity-45 transition-opacity duration-500" />
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black p-4 bg-white/5 select-none">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      src={heroArtwork.imageUrl}
                      alt={heroArtwork.title}
                      referrerPolicy="no-referrer"
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full h-auto max-h-[460px] object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-700 mx-auto pointer-events-none"
                    />
                    <div className="absolute inset-0 z-10 pointer-events-none" onContextMenu={(e) => e.preventDefault()} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-mono text-white/60">
                    <span className="text-amber-400 font-bold">{getLocalized(heroArtwork.artist, heroArtwork.artistFa)}</span>
                    <span dir="ltr">{heroArtwork.dastgah ? `${heroArtwork.dastgah} • ` : ''}{heroArtwork.duration || heroArtwork.year}</span>
                  </div>
                </div>
              </motion.div>
            </section>
          )}

          {/* Curated Masterpieces Grid */}
          <section className="space-y-8">
            <div className="flex items-baseline gap-4">
              <span className="text-amber-300 font-medium text-base md:text-lg tracking-widest uppercase font-mono">
                {t.home.featuredTitle}
              </span>
              <div className="h-px flex-grow bg-white/10" />
              <button
                onClick={() => setActiveView('archive')}
                className="text-xs font-mono uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>{t.common.viewArchive}</span>
                <span className={isFa ? 'rotate-180 inline-block' : ''}>→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayFeatured.map((art, i) => {
                const rotation =
                  i % 3 === 0
                    ? 'rotate-1'
                    : i % 3 === 1
                    ? '-rotate-1'
                    : 'rotate-2';

                const title = getLocalized(art.title, art.titleFa);
                const desc = getLocalized(art.description, art.descriptionFa);
                const isMusic = art.mediaType === 'audio' || art.mediaType === 'video';

                return (
                  <motion.div
                    key={art.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.12 }}
                    onClick={() => onSelectArtwork(art)}
                    className="group relative h-full flex flex-col cursor-pointer"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-tr from-amber-500 via-rose-500 to-cyan-500 rounded-3xl transform ${rotation} blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                    />
                    <div className={`relative h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-5 flex flex-col justify-between ${isFa ? 'text-right' : 'text-left'}`}>
                      <div>
                        <div className="relative mb-5 overflow-hidden rounded-2xl border border-white/10 aspect-square bg-neutral-900 select-none">
                          <img
                            src={art.imageUrl}
                            alt={title}
                            referrerPolicy="no-referrer"
                            onContextMenu={(e) => e.preventDefault()}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105 pointer-events-none"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 z-10 pointer-events-none" onContextMenu={(e) => e.preventDefault()} />
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20">
                            <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur border border-white/10 text-[9px] font-mono text-amber-300 uppercase tracking-widest flex items-center gap-1">
                              {isMusic && <Music className="w-2.5 h-2.5" />}
                              <span>{art.category}</span>
                            </span>
                            <span dir="ltr" className="px-2 py-0.5 rounded bg-black/80 backdrop-blur border border-white/10 text-[9px] font-mono text-white/70">
                              {art.duration || art.year}
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] text-amber-400 font-mono mb-1 block uppercase tracking-wider flex items-center gap-1">
                          <span>{t.common.volArchive}</span>
                          <span dir="ltr" className="font-mono">{String(i + 1).padStart(2, '0')}</span>
                          <span className="text-white/30">/</span>
                          <span dir="ltr" className="font-mono">{art.year}</span>
                        </span>
                        <h4 className={`text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors line-clamp-1 ${
                          isFa ? 'font-vazir font-bold text-amber-100' : 'font-playfair'
                        }`}>
                          {title}
                        </h4>
                        <p className={`text-white/50 text-xs mt-2 font-light leading-relaxed line-clamp-2 ${isFa ? 'font-vazir' : ''}`}>
                          {desc}
                        </p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50">
                        <span dir="ltr" className="font-mono">{art.price || art.year}</span>
                        <span className="text-amber-400 group-hover:text-amber-300 flex items-center gap-1">
                          <span>{isMusic ? t.common.playAudio : t.common.viewDetails}</span>
                          <span className={isFa ? 'rotate-180 inline-block' : ''}>→</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Section 2: Craft & Philosophy */}
          <section className="grid md:grid-cols-12 gap-12 items-center select-none">
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
                    src="https://qf1mwtdvcbajjjdk.public.blob.vercel-storage.com/Art%20Gallery/535370282_18174766348343323_31405188512772339_n.jpg"
                    alt="Tar Resonance"
                    referrerPolicy="no-referrer"
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-700 pointer-events-none group-hover:scale-105"
                  />
                  <div className="absolute inset-0 z-10 pointer-events-none" onContextMenu={(e) => e.preventDefault()} />
                </div>
              </div>
              <div className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-lg bg-white/5 p-2">
                <div className="relative h-64 overflow-hidden rounded-2xl">
                  <img
                    src="https://qf1mwtdvcbajjjdk.public.blob.vercel-storage.com/Art%20Gallery/603041437_17905300002315827_2091870345981580017_n.jpg"
                    alt="Oil Canvas"
                    referrerPolicy="no-referrer"
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-700 pointer-events-none group-hover:scale-105"
                  />
                  <div className="absolute inset-0 z-10 pointer-events-none" onContextMenu={(e) => e.preventDefault()} />
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
                  {t.home.philosophyTag}
                </span>
                <div className="h-px flex-grow bg-white/10" />
              </div>
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-amber-400 ${
                isFa ? 'font-vazir font-extrabold text-2xl sm:text-4xl md:text-5xl' : ''
              }`}>
                {t.home.philosophyTitle}
              </h2>
              <p className={`text-white/70 text-base md:text-lg leading-relaxed font-light ${isFa ? 'font-vazir' : ''}`}>
                {t.home.philosophyDesc}
              </p>
              <ul className="space-y-3 pt-2">
                {siteConfig.disciplines.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 text-sm text-white/80">
                    <span className="p-1.5 rounded-lg bg-white/5 text-amber-400 border border-white/10">
                      <Feather className="w-3.5 h-3.5" />
                    </span>
                    <span className={isFa ? 'font-vazir' : ''}>{isFa ? item.nameFa : item.nameEn}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </section>

          {/* Full-width Master Quote Banner */}
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
            <div className="relative z-10 max-w-2xl space-y-4">
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

          {/* Commission & Acquisition CTA Panel */}
          <div className={`p-8 md:p-12 border border-amber-500/20 rounded-3xl bg-gradient-to-r from-amber-950/20 via-zinc-900/50 to-zinc-950/80 backdrop-blur-sm shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 ${isFa ? 'text-right' : 'text-left'}`}>
            <div>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-amber-400 font-mono text-xs tracking-widest uppercase">
                  {t.about.ctaTag}
                </span>
                <div className="h-px w-16 bg-white/10" />
              </div>
              <h3 className={`text-2xl md:text-3xl font-bold text-white tracking-tight ${isFa ? 'font-vazir font-extrabold text-amber-200' : 'font-playfair'}`}>{t.about.ctaTitle}</h3>
              <p className={`text-white/60 mt-1 max-w-xl text-sm font-light ${isFa ? 'font-vazir' : ''}`}>
                {t.about.ctaDesc}
              </p>
            </div>
            <button
              onClick={() => setActiveView('contact')}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-400 text-black font-bold rounded-full transition-all shadow-lg shadow-amber-500/20 cursor-pointer text-xs uppercase tracking-widest font-mono flex-shrink-0"
            >
              {t.about.ctaBtn}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
