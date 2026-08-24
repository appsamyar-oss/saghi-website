import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Artwork } from '../types';
import { useApp } from '../context/AppContext';
import { SaghiEmblemLogo } from './SaghiEmblemLogo';
import { 
  X, 
  Download, 
  Share2, 
  ArrowLeft, 
  ArrowRight,
  Check, 
  ShoppingBag, 
  Play, 
  Pause, 
  Volume2, 
  Music, 
  Film, 
  Maximize2 
} from 'lucide-react';

interface PhotoDetailModalProps {
  artwork: Artwork | null;
  onClose: () => void;
  onOpenInquiry: (artwork: Artwork) => void;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  artwork,
  onClose,
  onOpenInquiry,
}) => {
  const { isFa, t, getLocalized } = useApp();
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);
  const fallbackAnimationRef = useRef<number>(0);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  if (!artwork) return null;

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!isPlaying) return;
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Check if data is completely silent (CORS issue workaround)
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (sum === 0) {
        // Fallback fake waveform if CORS blocked Web Audio API
        drawFakeWaveform(ctx, width, height);
        return;
      }

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        
        // Gradient color for bars
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#fbbf24'); // amber-400
        gradient.addColorStop(1, '#f43f5e'); // rose-500

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };
    draw();
  };

  const drawFakeWaveform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    fallbackAnimationRef.current += 0.05;
    const time = fallbackAnimationRef.current;
    const bars = 40;
    const barWidth = width / bars;
    
    for (let i = 0; i < bars; i++) {
      const sinValue = Math.sin(i * 0.2 + time) + Math.cos(i * 0.5 - time) + 2;
      const normalized = sinValue / 4; // 0 to 1
      const barHeight = normalized * height * 0.8 + 5;
      
      const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
      gradient.addColorStop(0, '#fbbf24'); 
      gradient.addColorStop(1, '#f43f5e');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
    }
  };

  const initAudio = () => {
    if (!audioRef.current || audioCtxRef.current) return;
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      
      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (e) {
      console.warn("Web Audio API could not be initialized", e);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = artwork.imageUrl;
    link.download = `${artwork.title.replace(/\s+/g, '_')}_preview.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleAudioPlay = async () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      initAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        drawWaveform();
      }).catch((e) => {
        console.error("Audio playback error:", e);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const title = getLocalized(artwork.titleEn || artwork.title, artwork.titleFa);
  const subtitle = getLocalized(artwork.subtitleEn || artwork.subtitle, artwork.subtitleFa);
  const desc = getLocalized(artwork.descriptionEn || artwork.description, artwork.descriptionFa);
  const medium = getLocalized(artwork.mediumEn || artwork.medium, artwork.mediumFa);
  const artist = getLocalized(artwork.artistEn || artwork.artist, artwork.artistFa);
  const origin = getLocalized(artwork.culturalOriginEn || artwork.culturalOrigin, artwork.culturalOriginFa);
  const provenance = getLocalized(artwork.provenance, artwork.provenanceFa);
  const dastgah = getLocalized(artwork.dastgahEn || artwork.dastgah, artwork.dastgahFa);
  const instrument = getLocalized(artwork.instrumentEn || artwork.instrument, artwork.instrumentFa);
  const dimensions = getLocalized(artwork.dimensionsEn || artwork.dimensions, artwork.dimensionsFa);
  const price = getLocalized(artwork.priceEn || artwork.price, artwork.priceFa);

  const isAudio = artwork.mediaType === 'audio';
  const isVideo = artwork.mediaType === 'video';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-5xl bg-zinc-950 border border-white/15 rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl my-auto overflow-hidden text-white"
        >
          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/15 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar Actions */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-amber-300 transition-colors cursor-pointer group"
            >
              {isFa ? (
                <>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  <span>{t.common.back}</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                  <span>{t.common.back}</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual / Media Container */}
            <div className="lg:col-span-7 space-y-4 select-none">
              <div 
                className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black flex items-center justify-center min-h-[260px] max-h-[60vh]"
                onContextMenu={(e) => e.preventDefault()}
              >
                {isVideo && artwork.videoUrl ? (
                  <div className="w-full h-full aspect-video bg-black flex items-center justify-center">
                    <video
                      controls
                      playsInline
                      webkit-playsinline="true"
                      x5-playsinline="true"
                      preload="metadata"
                      controlsList="nodownload"
                      disablePictureInPicture
                      onContextMenu={(e) => e.preventDefault()}
                      poster={artwork.imageUrl}
                      src={artwork.videoUrl}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center group overflow-hidden">
                    <img
                      src={artwork.imageUrl}
                      alt={title}
                      referrerPolicy="no-referrer"
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full h-auto max-h-[58vh] object-contain transition-all duration-500 pointer-events-none"
                    />

                    {/* Anti-Theft Transparent Protective Shield */}
                    <div 
                      className="absolute inset-0 z-10" 
                      onContextMenu={(e) => e.preventDefault()} 
                    />

                    {/* Media Type Floating Tag */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-mono uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                        {isAudio && <Music className="w-3 h-3 text-amber-400" />}
                        {isVideo && <Film className="w-3 h-3 text-cyan-400" />}
                        <span>{artwork.category}</span>
                      </span>
                      {artwork.duration ? (
                        <span dir="ltr" className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-mono text-amber-300/90 font-semibold">
                          {artwork.duration}
                        </span>
                      ) : (
                        <span dir="ltr" className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/80">
                          {artwork.year}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Integrated Audio Player Bar for Tar Solos */}
              {isAudio && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
                  {artwork.audioUrl && (
                    <audio
                      ref={audioRef}
                      src={artwork.audioUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={() => setIsPlaying(false)}
                      preload="metadata"
                      crossOrigin="anonymous"
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleAudioPlay}
                        className="w-11 h-11 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-amber-400/20 cursor-pointer"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                      </button>
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          {isPlaying ? (isFa ? 'در حال پخش تکنوازی تار...' : 'Playing Tar Solo...') : (isFa ? 'شنیدن بداهه‌نوازی تار' : 'Listen to Tar Solo')}
                        </span>
                        <span className="text-[10px] text-white/50 font-mono">
                          {dastgah ? `${dastgah} • ` : ''} {artwork.duration || 'HQ Studio Master'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300/80">
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span dir="ltr">{formatTime(currentTime)} / {formatTime(duration || 402)}</span>
                    </div>
                  </div>

                  {/* Canvas-Based Waveform Visualization */}
                  <div className="relative h-12 w-full px-1 overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full opacity-90 transition-opacity duration-300"
                      width={400}
                      height={48}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Artwork Metadata & Details */}
            <div className={`lg:col-span-5 space-y-5 ${isFa ? 'text-right' : 'text-left'}`}>
              <div>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-amber-400 font-mono text-xs tracking-widest uppercase flex items-center gap-1.5">
                    <span>{isAudio ? (isFa ? 'تکنوازی تار' : 'TAR SOLO') : isVideo ? (isFa ? 'اجرای تصویری' : 'PERFORMANCE') : (isFa ? 'اثر تجسمی' : 'FINE ART')}</span>
                    <span className="text-white/30">/</span>
                    <span dir="ltr" className="font-mono">{artwork.year}</span>
                  </span>
                  <div className="h-px flex-grow bg-white/10" />
                </div>
                <h1 className={`text-2xl sm:text-3xl font-bold text-white tracking-tight ${isFa ? 'font-vazir font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-200 py-1' : 'font-playfair'}`}>
                  {title}
                </h1>
                {subtitle && (
                  <p className={`text-sm text-amber-300/80 font-light mt-1 ${isFa ? 'font-vazir' : 'font-serif'}`}>
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Metadata Box */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 space-y-2 text-xs relative overflow-hidden">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <SaghiEmblemLogo variant="dark" size="xs" glow={false} />
                    <span className="font-mono text-[11px] font-bold text-amber-300 tracking-wider">SAGHI ABYAR</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                    {isFa ? 'گواهی اصالت اثر' : 'CERTIFIED ORIGINAL'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-300 gap-2">
                  <span className="text-gray-400 font-mono uppercase text-[10px] tracking-wider flex-shrink-0">{t.detail.artist}:</span>
                  <span className={`font-semibold text-white truncate ${isFa ? 'font-vazir' : ''}`}>{artist}</span>
                </div>

                {dastgah && (
                  <div className="flex justify-between items-center text-gray-300 gap-2">
                    <span className="text-gray-400 font-mono uppercase text-[10px] tracking-wider flex-shrink-0">{t.detail.dastgahInfo}:</span>
                    <span className={`text-amber-300 font-semibold truncate ${isFa ? 'font-vazir' : ''}`}>{dastgah}</span>
                  </div>
                )}

                {instrument && (
                  <div className="flex justify-between items-center text-gray-300 gap-2">
                    <span className="text-gray-400 font-mono uppercase text-[10px] tracking-wider flex-shrink-0">{t.detail.instrumentInfo}:</span>
                    <span className={`text-rose-300 truncate ${isFa ? 'font-vazir' : ''}`}>{instrument}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-gray-300 gap-2">
                  <span className="text-gray-400 font-mono uppercase text-[10px] tracking-wider flex-shrink-0">{t.detail.medium}:</span>
                  <span className={`text-cyan-300 truncate max-w-[240px] ${isFa ? 'text-left font-vazir' : 'text-right'}`}>{medium}</span>
                </div>

                {dimensions && (
                  <div className="flex justify-between items-center text-gray-300 gap-2">
                    <span className="text-gray-400 font-mono uppercase text-[10px] tracking-wider flex-shrink-0">{t.detail.dimensions}:</span>
                    <span dir={isFa ? "rtl" : "ltr"} className={`font-mono text-gray-200 ${isFa ? 'font-vazir' : ''}`}>{dimensions}</span>
                  </div>
                )}

                {price && (
                  <div className="flex justify-between items-center text-gray-300 gap-2 pt-1 border-t border-white/5">
                    <span className="text-gray-400 font-mono uppercase text-[10px] tracking-wider flex-shrink-0">{t.detail.priceInfo}:</span>
                    <span className={`font-mono font-bold text-amber-400 ${isFa ? 'font-vazir' : ''}`}>{price}</span>
                  </div>
                )}
              </div>

              {/* Narrative */}
              <div>
                <h4 className="text-[10px] font-mono uppercase text-gray-400 tracking-[0.2em] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {t.detail.narrative}
                </h4>
                <p className={`text-gray-300 text-sm leading-relaxed font-light ${isFa ? 'font-vazir' : ''}`}>
                  {desc}
                </p>
              </div>

              {/* Tags */}
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {artwork.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-gray-300 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* High-Contrast CTA Action Buttons */}
              <div className="space-y-3 pt-2">
                {/* PRIMARY CTA: Purchase / Commission Inquiry Button */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenInquiry(artwork);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs uppercase tracking-widest transition-all rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2.5 cursor-pointer transform hover:scale-[1.01]"
                >
                  <ShoppingBag className="w-4 h-4 fill-black" />
                  <span>{t.detail.purchaseBtn}</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownload}
                    className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.detail.downloadStudy}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.common.copied}</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>{t.detail.shareStudy}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
