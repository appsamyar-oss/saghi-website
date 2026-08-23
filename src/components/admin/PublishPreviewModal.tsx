import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  ArrowLeft, 
  CheckCircle, 
  Globe, 
  Sparkles, 
  Palette, 
  Music, 
  Layers, 
  Tag, 
  Calendar, 
  Maximize2, 
  Volume2, 
  Video, 
  Star, 
  ShoppingBag,
  Feather,
  Info,
  Loader2,
  FileCheck2,
  SlidersHorizontal
} from 'lucide-react';
import { Artwork, SiteConfig } from '../../types';
import { SaghiEmblemLogo } from '../SaghiEmblemLogo';

export type PreviewPayload = 
  | { type: 'artwork'; data: Artwork; isNew: boolean }
  | { type: 'siteConfig'; data: SiteConfig }
  | { type: 'prompt'; data: any; isNew: boolean };

interface PublishPreviewModalProps {
  isOpen: boolean;
  payload: PreviewPayload | null;
  onClose: () => void;
  onConfirmPublish: () => Promise<void> | void;
  isFa: boolean;
}

export const PublishPreviewModal: React.FC<PublishPreviewModalProps> = ({
  isOpen,
  payload,
  onClose,
  onConfirmPublish,
  isFa: initialIsFa,
}) => {
  const [activeLangTab, setActiveLangTab] = useState<'both' | 'en' | 'fa'>('both');
  const [viewMode, setViewMode] = useState<'mockup' | 'inspector'>('mockup');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  if (!isOpen || !payload) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onConfirmPublish();
      setPublishSuccess(true);
      setTimeout(() => {
        setPublishSuccess(false);
        setIsPublishing(false);
      }, 1500);
    } catch (err) {
      setIsPublishing(false);
      console.error('[PublishPreviewModal] Publish error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 25 }}
        className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-zinc-950 border border-amber-400/30 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden text-white my-auto"
        dir={initialIsFa ? 'rtl' : 'ltr'}
      >
        {/* Top Header Bar */}
        <header className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-zinc-900 to-black flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold tracking-wider">
                  PREVIEW BEFORE PUBLISH
                </span>
                <h3 className="text-sm sm:text-base font-bold font-mono text-white">
                  {payload.type === 'artwork'
                    ? (initialIsFa ? 'پیش‌نمایش نهایی انتشار اثر هنری / موسیقی' : 'Artwork / Masterpiece Publication Preview')
                    : payload.type === 'siteConfig'
                    ? (initialIsFa ? 'پیش‌نمایش محتوا و هویت استودیو' : 'Studio Content & Identity Publication Preview')
                    : (initialIsFa ? 'پیش‌نمایش پرامپت بافت' : 'Texture Preset Preview')}
                </h3>
              </div>
              <p className="text-xs text-white/50 font-light mt-0.5">
                {initialIsFa 
                  ? 'بررسی و تایید نهایی چیدمان دوزبانه پیش از ثبت در پایگاه داده فایربیس و وب‌سایت اصلی' 
                  : 'Review exact dual-language typography, media masters, and layouts before committing live to Firestore'}
              </p>
            </div>
          </div>

          {/* Quick View Switchers */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-black/60 p-1 rounded-full border border-white/10 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode('mockup')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  viewMode === 'mockup' ? 'bg-amber-400 text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                {initialIsFa ? 'نمای زنده سایت' : 'Live Mockup'}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('inspector')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  viewMode === 'inspector' ? 'bg-amber-400 text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                {initialIsFa ? 'بررسی فیلدها' : 'Field Inspector'}
              </button>
            </div>

            {/* Language preview selector */}
            <div className="flex items-center bg-black/60 p-1 rounded-full border border-white/10 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveLangTab('both')}
                className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                  activeLangTab === 'both' ? 'bg-white/20 text-white font-bold' : 'text-white/50 hover:text-white'
                }`}
                title="Side by Side (EN & FA)"
              >
                EN & FA
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('en')}
                className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                  activeLangTab === 'en' ? 'bg-white/20 text-white font-bold' : 'text-white/50 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('fa')}
                className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                  activeLangTab === 'fa' ? 'bg-white/20 text-white font-bold' : 'text-white/50 hover:text-white'
                }`}
              >
                فارسی
              </button>
            </div>
          </div>
        </header>

        {/* Modal Scrollable Body */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6 bg-black/30">
          {/* =========================================================================
              1. ARTWORK / MASTERPIECE PREVIEW CONTENT
             ========================================================================= */}
          {payload.type === 'artwork' && (
            <div className="space-y-6">
              {/* Media & Key Info Banner Mockup */}
              <div className="grid lg:grid-cols-12 gap-6 bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6">
                {/* Artwork Media Display */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-black/80 border border-white/10 group shadow-2xl flex items-center justify-center">
                    <img
                      src={payload.data.imageUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80'}
                      alt={payload.data.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                    {/* Featured / Status Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-amber-300 font-bold">
                        {payload.data.category}
                      </span>
                      {payload.data.featured && (
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-400 text-black font-bold flex items-center gap-1 shadow-lg">
                          <Star className="w-3 h-3 fill-black" />
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80">
                        {payload.data.year || new Date().getFullYear()}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 font-bold">
                        {payload.data.status || 'Available'}
                      </span>
                    </div>
                  </div>

                  {/* Audio / Video Digital Master Previews */}
                  {payload.data.audioUrl && (
                    <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                          <Volume2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">Tar Solo Audio Master</span>
                          <span className="text-xs text-white/80 truncate block font-mono">{payload.data.audioUrl}</span>
                        </div>
                      </div>
                      {payload.data.duration && (
                        <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                          {payload.data.duration}
                        </span>
                      )}
                    </div>
                  )}

                  {payload.data.videoUrl && (
                    <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block">Performance Video Master</span>
                        <span className="text-xs text-white/80 truncate block font-mono">{payload.data.videoUrl}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata & Curatorial Showcase */}
                <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header Titles (Dual language) */}
                    <div className="space-y-2 border-b border-white/10 pb-4">
                      {(activeLangTab === 'both' || activeLangTab === 'en') && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
                            English Title & Subtitle
                          </span>
                          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                            {payload.data.titleEn || payload.data.title || 'Untitled Artwork'}
                          </h2>
                          {(payload.data.subtitleEn || payload.data.subtitle) && (
                            <p className="text-xs sm:text-sm text-amber-300/90 font-light">
                              {payload.data.subtitleEn || payload.data.subtitle}
                            </p>
                          )}
                        </div>
                      )}

                      {(activeLangTab === 'both' || activeLangTab === 'fa') && (
                        <div className="space-y-1 pt-2" dir="rtl">
                          <span className="text-[10px] font-mono text-amber-400/60 uppercase tracking-widest block font-fa">
                            عنوان و زیرعنوان فارسی
                          </span>
                          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-amber-200 font-fa">
                            {payload.data.titleFa || payload.data.titleEn || payload.data.title || 'بدون عنوان'}
                          </h2>
                          {payload.data.subtitleFa && (
                            <p className="text-xs sm:text-sm text-white/80 font-light font-fa">
                              {payload.data.subtitleFa}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-black/50 border border-white/5 space-y-0.5">
                        <span className="text-[10px] font-mono text-white/40 uppercase block">Artist</span>
                        <div className="font-semibold text-white">
                          {payload.data.artistEn || payload.data.artist || 'Saghi Abyar'}
                          {payload.data.artistFa && (
                            <span className="text-white/50 font-fa font-normal ml-1.5 mr-1.5">
                              ({payload.data.artistFa})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-black/50 border border-white/5 space-y-0.5">
                        <span className="text-[10px] font-mono text-white/40 uppercase block">Medium & Technique</span>
                        <div className="font-semibold text-white">
                          {payload.data.mediumEn || payload.data.medium || 'Oil on Linen'}
                          {payload.data.mediumFa && (
                            <div className="text-[11px] text-amber-400/80 font-fa font-normal">
                              {payload.data.mediumFa}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-black/50 border border-white/5 space-y-0.5">
                        <span className="text-[10px] font-mono text-white/40 uppercase block">Dimensions / Format</span>
                        <div className="font-mono text-amber-300">
                          {payload.data.dimensionsEn || payload.data.dimensions || '120 × 90 cm'}
                          {payload.data.dimensionsFa && (
                            <span className="text-white/60 font-fa font-normal ml-2">
                              {payload.data.dimensionsFa}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-black/50 border border-white/5 space-y-0.5">
                        <span className="text-[10px] font-mono text-white/40 uppercase block">Acquisition & Terms</span>
                        <div className="font-semibold text-emerald-400">
                          {payload.data.priceEn || payload.data.price || 'Available for Acquisition / Inquire'}
                          {payload.data.priceFa && (
                            <div className="text-[11px] text-emerald-400/80 font-fa font-normal">
                              {payload.data.priceFa}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tar Music Special Details (if available) */}
                    {(payload.data.dastgahEn || payload.data.dastgahFa || payload.data.instrumentEn || payload.data.instrumentFa) && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                        <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider block">
                          Tar Music Specifics
                        </span>
                        <div className="grid sm:grid-cols-2 gap-2 text-xs">
                          {(payload.data.dastgahEn || payload.data.dastgahFa) && (
                            <div>
                              <span className="text-[10px] text-white/40 font-mono block">Dastgah / Mode:</span>
                              <span className="text-amber-200">{payload.data.dastgahEn}</span>
                              {payload.data.dastgahFa && (
                                <span className="font-fa text-white/70 block text-[11px]" dir="rtl">
                                  {payload.data.dastgahFa}
                                </span>
                              )}
                            </div>
                          )}
                          {(payload.data.instrumentEn || payload.data.instrumentFa) && (
                            <div>
                              <span className="text-[10px] text-white/40 font-mono block">Instrument:</span>
                              <span className="text-amber-200">{payload.data.instrumentEn}</span>
                              {payload.data.instrumentFa && (
                                <span className="font-fa text-white/70 block text-[11px]" dir="rtl">
                                  {payload.data.instrumentFa}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cultural Origin / Provenance */}
                    {(payload.data.culturalOriginEn || payload.data.culturalOriginFa || payload.data.culturalOrigin) && (
                      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                        <span className="text-[10px] font-mono text-white/40 uppercase block">Cultural Origin & Provenance</span>
                        <p className="text-xs text-white/80 leading-relaxed">
                          {payload.data.culturalOriginEn || payload.data.culturalOrigin}
                        </p>
                        {payload.data.culturalOriginFa && (
                          <p className="text-xs text-amber-300/80 font-fa leading-relaxed pt-1" dir="rtl">
                            {payload.data.culturalOriginFa}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {payload.data.tags && payload.data.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {payload.data.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/70"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Curatorial Narrative & Descriptions (Expanded Preview) */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider flex items-center gap-2">
                  <Feather className="w-4 h-4" />
                  <span>Curatorial Statement & Artwork Narrative</span>
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  {(activeLangTab === 'both' || activeLangTab === 'en') && (
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs font-mono font-bold text-white uppercase">
                          English Narrative
                        </span>
                        <span className="text-[10px] font-mono text-white/40">LTR Format</span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-light">
                        {payload.data.descriptionEn || payload.data.description || 'No English narrative entered.'}
                      </p>
                    </div>
                  )}

                  {(activeLangTab === 'both' || activeLangTab === 'fa') && (
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-2" dir="rtl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs font-mono font-bold text-amber-300 uppercase font-fa">
                          بیانیه و توصیف فارسی اثر
                        </span>
                        <span className="text-[10px] font-mono text-amber-400/40">قالب راست‌به‌چپ (RTL)</span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-fa font-light">
                        {payload.data.descriptionFa || payload.data.descriptionEn || payload.data.description || 'توصیف فارسی وارد نشده است.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              2. STUDIO CONTENT & IDENTITY PREVIEW CONTENT
             ========================================================================= */}
          {payload.type === 'siteConfig' && (
            <div className="space-y-6">
              {/* Announcement Banner Preview */}
              {payload.data.announcementBanner?.enabled && (
                <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Volume2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="font-mono text-amber-300 font-bold uppercase text-[10px] flex-shrink-0">
                      Live Top Announcement Bar:
                    </span>
                    <span className="text-white/90 truncate">
                      {payload.data.announcementBanner.textEn}
                    </span>
                  </div>
                  {payload.data.announcementBanner.textFa && (
                    <span className="font-fa text-amber-200/90 text-xs hidden sm:inline" dir="rtl">
                      {payload.data.announcementBanner.textFa}
                    </span>
                  )}
                </div>
              )}

              {/* Hero Banner Mockup */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border border-white/10 space-y-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="max-w-2xl mx-auto space-y-4 relative z-10">
                  <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                    {payload.data.atelierNameEn} • {payload.data.atelierNameFa}
                  </span>

                  {(activeLangTab === 'both' || activeLangTab === 'en') && (
                    <div className="space-y-2">
                      <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                        {payload.data.heroHeadlineEn}
                      </h1>
                      <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed whitespace-pre-wrap">
                        {payload.data.heroSubtitleEn}
                      </p>
                    </div>
                  )}

                  {(activeLangTab === 'both' || activeLangTab === 'fa') && (
                    <div className="space-y-2 pt-2 border-t border-white/5" dir="rtl">
                      <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-amber-200 font-fa">
                        {payload.data.heroHeadlineFa}
                      </h1>
                      <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed whitespace-pre-wrap font-fa">
                        {payload.data.heroSubtitleFa}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Studio Philosophy & Quote Mockup */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider flex items-center gap-2">
                  <Feather className="w-4 h-4" />
                  <span>Philosophy & Artist Statement Mockup</span>
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  {(activeLangTab === 'both' || activeLangTab === 'en') && (
                    <div className="p-5 rounded-2xl bg-black/60 border border-white/5 space-y-3">
                      <p className="text-xs sm:text-sm text-white/90 italic leading-relaxed whitespace-pre-wrap font-light">
                        "{payload.data.quoteEn}"
                      </p>
                      <div className="text-[11px] font-mono text-amber-400">
                        — {payload.data.quoteAuthorEn || payload.data.artistNameEn}
                      </div>
                    </div>
                  )}

                  {(activeLangTab === 'both' || activeLangTab === 'fa') && (
                    <div className="p-5 rounded-2xl bg-black/60 border border-white/5 space-y-3" dir="rtl">
                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed whitespace-pre-wrap font-fa font-light">
                        «{payload.data.quoteFa}»
                      </p>
                      <div className="text-[11px] font-mono text-amber-400 font-fa">
                        — {payload.data.quoteAuthorFa || payload.data.artistNameFa}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Disciplines & Contacts Mockup */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="text-xs font-mono uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                    <Music className="w-3.5 h-3.5" />
                    <span>Disciplines of Mastery</span>
                  </h4>
                  <div className="space-y-1.5">
                    {payload.data.disciplines.map((d, i) => (
                      <div key={d.id || i} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                        <span className="text-white/90">{d.nameEn}</span>
                        <span className="font-fa text-amber-300">{d.nameFa}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="text-xs font-mono uppercase text-amber-400 tracking-wider flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Studio Inquiries & Contacts</span>
                  </h4>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-white/40">Email:</span>
                      <span className="text-white">{payload.data.contactEmail || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-white/40">Phone:</span>
                      <span className="text-white">{payload.data.contactPhone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-white/40">WhatsApp:</span>
                      <span className="text-white">{payload.data.whatsappNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <footer className="px-6 py-4 border-t border-white/10 bg-zinc-950/90 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              {initialIsFa 
                ? 'کلیک بر روی ویرایش شما را به فرم بازمی‌گرداند. کلیک بر روی انتشار، تغییرات را نهایی می‌کند.'
                : 'Click "Edit / Go Back" to keep drafting, or "Confirm & Publish" to commit live to Firebase.'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* 1. EDIT / GO BACK BUTTON */}
            <button
              type="button"
              onClick={onClose}
              disabled={isPublishing}
              className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider font-mono cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{initialIsFa ? 'ویرایش و بازگشت به فرم' : 'Edit / Go Back'}</span>
            </button>

            {/* 2. CONFIRM & PUBLISH BUTTON */}
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || publishSuccess}
              className={`flex-1 sm:flex-none px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest font-mono cursor-pointer transition-all flex items-center justify-center gap-2.5 shadow-xl ${
                publishSuccess
                  ? 'bg-emerald-500 text-black'
                  : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/20'
              } disabled:opacity-50`}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{initialIsFa ? 'در حال انتشار در فایربیس...' : 'Publishing to Firebase...'}</span>
                </>
              ) : publishSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{initialIsFa ? 'با موفقیت منتشر شد!' : 'Published Successfully!'}</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>{initialIsFa ? 'تایید و انتشار نهایی' : 'Confirm & Publish'}</span>
                </>
              )}
            </button>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};
