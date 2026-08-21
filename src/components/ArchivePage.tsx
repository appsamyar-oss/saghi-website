import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Artwork } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Filter, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  Layers, 
  X, 
  Box, 
  LayoutGrid,
  ShoppingBag,
  Music,
  Play
} from 'lucide-react';
import { InfiniteGallery3D } from './InfiniteGallery3D';

interface ArchivePageProps {
  onSelectArtwork: (artwork: Artwork) => void;
  onOpenInquiry: (artwork?: Artwork) => void;
  onOpenCommission: () => void;
}

export const ArchivePage: React.FC<ArchivePageProps> = ({
  onSelectArtwork,
  onOpenInquiry,
  onOpenCommission,
}) => {
  const { artworks, categories, isFa, t, getLocalized } = useApp();

  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredArtworks = useMemo(() => {
    return artworks.filter((art) => {
      const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
      const matchesTag = !selectedTag || art.tags.includes(selectedTag);
      const query = searchQuery.trim().toLowerCase();
      
      const titleMatch = art.title.toLowerCase().includes(query) || (art.titleFa && art.titleFa.toLowerCase().includes(query));
      const descMatch = art.description.toLowerCase().includes(query) || (art.descriptionFa && art.descriptionFa.toLowerCase().includes(query));
      const mediumMatch = art.medium.toLowerCase().includes(query) || (art.mediumFa && art.mediumFa.toLowerCase().includes(query));
      const artistMatch = art.artist.toLowerCase().includes(query) || (art.artistFa && art.artistFa.toLowerCase().includes(query));
      const tagMatch = art.tags.some((tg) => tg.toLowerCase().includes(query));

      const matchesSearch = !query || titleMatch || descMatch || mediumMatch || artistMatch || tagMatch;

      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [artworks, selectedCategory, selectedTag, searchQuery]);

  return (
    <main className="min-h-screen bg-black text-white pt-28 pb-32">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Editorial Header with View Mode Switcher */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-medium text-xs md:text-sm tracking-[0.25em] uppercase font-mono flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  {t.archive.headerTag}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-xs font-mono tracking-widest text-white/50 uppercase">
                  {filteredArtworks.length} {t.archive.artworks}
                </span>
              </div>

              <h1 className={`text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mt-2 ${isFa ? 'font-vazir font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-200 py-1' : 'font-playfair'}`}>
                <span>
                  {t.archive.headerTitle}
                </span>
              </h1>
              <p className={`text-white/70 text-xs sm:text-sm mt-2 font-light leading-relaxed max-w-2xl ${isFa ? 'font-vazir' : 'font-serif'}`}>
                {t.archive.headerDesc}
              </p>
            </div>

            {/* View Mode Toggle: 3D Spatial Gallery vs Catalog Grid */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md self-start md:self-auto">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  viewMode === '3d'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-lg shadow-amber-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>{isFa ? 'نمایش سه‌بعدی (3D)' : '3D Spatial'}</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-black font-bold shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{isFa ? 'چیدمان کاتالوگ' : 'Archive Grid'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Search & Category Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 space-y-4"
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-4 md:p-5 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none ${isFa ? 'right-4 left-auto' : 'left-4 right-auto'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.archive.searchPlaceholder}
                  className={`w-full bg-black/70 border border-white/10 rounded-2xl py-3 text-xs md:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition-colors font-light ${
                    isFa ? 'pr-11 pl-10 text-right font-vazir' : 'pl-11 pr-10 text-left'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 cursor-pointer ${
                      isFa ? 'left-3.5 right-auto' : 'right-3.5 left-auto'
                    }`}
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {selectedTag && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono">
                  <span>#{selectedTag}</span>
                  <button onClick={() => setSelectedTag(null)} className="hover:text-white ml-1 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none border-t border-white/5 mt-3">
              <span className="text-[11px] text-white/40 font-mono flex items-center gap-1 pl-1 pr-2 uppercase tracking-wider flex-shrink-0">
                <Filter className="w-3 h-3 text-amber-400" />
                {isFa ? 'دسته‌بندی:' : 'Filter:'}
              </span>
              {categories.map((cat) => {
                const count = cat.id === 'all' 
                  ? artworks.length 
                  : artworks.filter(a => a.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500/25 border border-amber-400 text-amber-300 shadow-sm'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{isFa ? cat.labelFa : cat.labelEn}</span>
                    <span dir="ltr" className="opacity-50 text-[10px] font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* View Switch: 3D Infinite Spatial Gallery vs Catalog Grid */}
        <AnimatePresence mode="wait">
          {viewMode === '3d' ? (
            <motion.div
              key="3d-mode"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {filteredArtworks.length === 0 ? (
                <div className="text-center py-24 border border-white/10 rounded-3xl bg-white/5 p-12">
                  <Layers className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">{t.archive.emptyTitle}</h3>
                  <p className="text-white/40 mb-6 max-w-md mx-auto text-sm font-light">
                    {t.archive.emptyDesc}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setSelectedTag(null);
                    }}
                    className="px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-xs uppercase tracking-widest hover:bg-white/20 transition-all cursor-pointer font-mono"
                  >
                    {t.archive.clearFilters}
                  </button>
                </div>
              ) : (
                <InfiniteGallery3D
                  artworks={filteredArtworks}
                  onSelectArtwork={onSelectArtwork}
                  onOpenInquiry={onOpenInquiry}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="grid-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {filteredArtworks.length === 0 ? (
                <div className="text-center py-24 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm p-12">
                  <Layers className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">{t.archive.emptyTitle}</h3>
                  <p className="text-white/40 mb-6 max-w-md mx-auto text-sm font-light leading-relaxed">
                    {t.archive.emptyDesc}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setSelectedTag(null);
                    }}
                    className="px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-xs uppercase tracking-widest hover:bg-white/20 transition-all cursor-pointer font-mono"
                  >
                    {t.archive.clearFilters}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredArtworks.map((art, index) => {
                    const title = getLocalized(art.title, art.titleFa);
                    const subtitle = getLocalized(art.subtitle, art.subtitleFa);
                    const desc = getLocalized(art.description, art.descriptionFa);
                    const medium = getLocalized(art.medium, art.mediumFa);
                    const isMusic = art.mediaType === 'audio' || art.mediaType === 'video';

                    return (
                      <motion.article
                        key={art.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
                        className="group relative h-full flex flex-col"
                      >
                        <div className="relative h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-amber-400/40 transition-colors shadow-2xl">
                          {/* Image Frame with B&W to Color on Hover */}
                          <div>
                            <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/10 aspect-[4/3] bg-neutral-950 group">
                              <img
                                src={art.imageUrl}
                                alt={title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                                loading="lazy"
                              />

                              {/* Badges */}
                              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                                <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur border border-white/10 text-[9px] font-mono uppercase tracking-widest text-amber-300 flex items-center gap-1">
                                  {isMusic && <Music className="w-2.5 h-2.5" />}
                                  <span>{art.category}</span>
                                </span>
                                <span dir="ltr" className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur border border-white/10 text-[9px] font-mono text-white/70">
                                  {art.duration || art.year}
                                </span>
                              </div>

                              {/* Overlay actions */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                                <button
                                  onClick={() => onSelectArtwork(art)}
                                  className="px-3.5 py-2 rounded-xl bg-white text-black text-xs font-bold flex items-center gap-1.5 hover:bg-amber-200 transition-colors cursor-pointer shadow-lg"
                                >
                                  {isMusic ? <Play className="w-3.5 h-3.5 fill-black" /> : <Eye className="w-3.5 h-3.5" />}
                                  <span>{isMusic ? t.common.playAudio : t.common.viewDetails}</span>
                                </button>
                                
                                <button
                                  onClick={() => onOpenInquiry(art)}
                                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 backdrop-blur transition-colors cursor-pointer shadow-lg"
                                  title={t.common.inquirePiece}
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  <span>{t.common.inquirePiece}</span>
                                </button>
                              </div>
                            </div>

                            {/* Titles & Info */}
                            <div className={isFa ? 'text-right' : 'text-left'}>
                              <span className="text-xs text-amber-400 font-mono mb-1 block uppercase tracking-wider font-light flex items-center gap-1.5">
                                <span>{t.common.volArchive}</span>
                                <span dir="ltr" className="font-mono">{String(index + 1).padStart(2, '0')}</span>
                                <span className="text-white/30">/</span>
                                <span dir="ltr" className="font-mono">{art.year}</span>
                              </span>
                              <h3
                                onClick={() => onSelectArtwork(art)}
                                className={`text-xl sm:text-2xl font-bold tracking-tight text-white hover:text-amber-300 transition-colors cursor-pointer line-clamp-1 ${
                                  isFa ? 'font-vazir font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-200' : 'font-playfair'
                                }`}
                              >
                                {title}
                              </h3>
                              {subtitle && (
                                <p className={`text-xs text-amber-300/70 font-light mt-0.5 line-clamp-1 ${isFa ? 'font-vazir' : 'font-serif'}`}>
                                  {subtitle}
                                </p>
                              )}
                              <p className={`text-white/60 text-sm mt-2 font-light leading-relaxed line-clamp-2 ${isFa ? 'font-vazir' : ''}`}>
                                {desc}
                              </p>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                            <div className="flex items-center justify-between text-[11px] text-white/50 gap-2">
                              <span className={`truncate max-w-[170px] ${isFa ? 'font-vazir text-right' : 'font-serif'}`}>{art.dastgah ? `${art.dastgahFa || art.dastgah}` : medium}</span>
                              {art.price && <span dir="ltr" className="font-mono text-amber-400 font-semibold flex-shrink-0">{art.price}</span>}
                            </div>

                            <div className={`flex flex-wrap gap-1.5 ${isFa ? 'justify-start' : 'justify-start'}`}>
                              {art.tags.slice(0, 3).map((tag) => (
                                <button
                                  key={tag}
                                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer font-mono flex items-center gap-0.5 ${
                                    selectedTag === tag
                                      ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
                                  }`}
                                >
                                  <span className="text-amber-400/80">#</span>{tag}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-1 text-xs">
                              <button
                                onClick={() => onSelectArtwork(art)}
                                className="font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1.5 group/btn cursor-pointer"
                              >
                                <span>{isMusic ? t.common.playAudio : t.common.viewDetails}</span>
                                <ArrowRight className={`w-3 h-3 transform ${isFa ? 'rotate-180 group-hover/btn:-translate-x-1' : 'group-hover/btn:translate-x-1'} transition-transform`} />
                              </button>
                              <button
                                onClick={() => onOpenInquiry(art)}
                                className="text-amber-300/80 hover:text-amber-200 flex items-center gap-1 cursor-pointer text-xs"
                              >
                                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                                <span>{t.common.inquirePiece}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editorial Commission Callout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`mt-28 p-8 md:p-14 border border-amber-500/20 rounded-3xl bg-gradient-to-r from-amber-950/20 via-zinc-900/50 to-zinc-950/80 backdrop-blur-sm shadow-2xl relative overflow-hidden ${isFa ? 'text-right' : 'text-left'}`}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-amber-400 font-medium text-sm tracking-widest uppercase font-mono">
                {t.about.ctaTag}
              </span>
              <div className="h-px flex-grow bg-white/10" />
            </div>
            <h3 className={`text-2xl md:text-4xl font-bold tracking-tight mb-4 text-white ${isFa ? 'font-vazir font-extrabold text-amber-200' : 'font-playfair'}`}>
              {t.about.ctaTitle}
            </h3>
            <p className={`text-white/70 mb-8 text-sm md:text-base font-light leading-relaxed ${isFa ? 'font-vazir' : 'font-serif'}`}>
              {t.about.ctaDesc}
            </p>
            <button
              onClick={onOpenCommission}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold rounded-full transition-all shadow-xl shadow-amber-500/20 cursor-pointer text-xs uppercase tracking-widest font-mono"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.about.ctaBtn}</span>
              <ArrowRight className={`w-4 h-4 ${isFa ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};
