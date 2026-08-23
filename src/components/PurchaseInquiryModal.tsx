import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, ShoppingBag, Music, Palette, ArrowRight, ArrowLeft } from 'lucide-react';
import { Artwork } from '../types';
import { useApp } from '../context/AppContext';
import { SaghiEmblemLogo } from './SaghiEmblemLogo';

interface PurchaseInquiryModalProps {
  isOpen: boolean;
  artwork: Artwork | null;
  onClose: () => void;
  onNavigateToContact?: (artwork?: Artwork) => void;
}

export const PurchaseInquiryModal: React.FC<PurchaseInquiryModalProps> = ({
  isOpen,
  artwork,
  onClose,
  onNavigateToContact,
}) => {
  const { isFa, t, getLocalized, addInquiry } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState<'purchase' | 'commission_art' | 'music_performance' | 'general'>('purchase');
  const [message, setMessage] = useState('');
  const [dimensions, setDimensions] = useState(artwork?.dimensions || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Set default inquiry type based on mediaType
  React.useEffect(() => {
    if (artwork) {
      if (artwork.mediaType === 'audio' || artwork.mediaType === 'video') {
        setInquiryType('music_performance');
      } else {
        setInquiryType('purchase');
      }
      setDimensions(artwork.dimensions || '');
    }
  }, [artwork]);

  if (!isOpen || !artwork) return null;

  const title = getLocalized(artwork.title, artwork.titleFa);
  const medium = getLocalized(artwork.medium, artwork.mediumFa);
  const isMusic = artwork.mediaType === 'audio' || artwork.mediaType === 'video';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      addInquiry({
        name,
        email,
        phone,
        inquiryType,
        artworkId: artwork.id,
        artworkTitle: title,
        interest: `${isMusic ? 'Tar Music & Solo' : 'Fine Art'} - ${title} (${inquiryType})`,
        dimensions: dimensions.trim() ? dimensions : artwork.dimensions,
        message,
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-2xl bg-zinc-950 border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 my-auto ${
            isFa ? 'text-right' : 'text-left'
          }`}
        >
          {/* Subtle top gold accent glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-cyan-400 to-pink-500" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SaghiEmblemLogo variant="dark" size="sm" glow={false} />
              <div>
                <h3 className={`text-lg sm:text-xl font-bold text-white tracking-tight ${isFa ? 'font-vazir font-bold' : 'font-playfair'}`}>
                  {t.inquiryModal.title}
                </h3>
                <p className="text-xs text-white/50 font-light mt-0.5">
                  {t.inquiryModal.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {isSubmitted ? (
              /* Success State */
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className={`text-2xl font-bold text-white ${isFa ? 'font-vazir' : 'font-playfair'}`}>
                  {t.inquiryModal.success}
                </h4>
                <p className="text-white/70 text-sm max-w-md mx-auto font-light leading-relaxed">
                  {t.inquiryModal.successDesc}
                </p>

                <div className="pt-4">
                  <button
                    onClick={handleResetAndClose}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm transition-all shadow-lg"
                  >
                    {t.inquiryModal.close}
                  </button>
                </div>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Artwork Summary Pill Card */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                  <img
                    src={artwork.imageUrl}
                    alt={title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400/90 font-medium">
                      {isMusic ? (isFa ? 'قطعه تکنوازی تار' : 'Tar Music Solo') : (isFa ? 'اثر نقاشی / نگاره' : 'Fine Art Piece')}
                    </span>
                    <h5 className={`text-sm sm:text-base font-bold text-white truncate ${isFa ? 'font-vazir' : 'font-playfair'}`}>
                      {title}
                    </h5>
                    <p className="text-xs text-white/50 truncate mt-0.5">
                      {medium} {artwork.dimensions ? `• ${artwork.dimensions}` : ''} {artwork.duration ? `• ${artwork.duration}` : ''}
                    </p>
                  </div>
                  {artwork.price && (
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-mono text-cyan-300 font-semibold px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/40">
                        {artwork.price}
                      </span>
                    </div>
                  )}
                </div>

                {/* Inquiry Type Radio / Option Selector */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    {t.inquiryModal.inquiryType}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInquiryType('purchase')}
                      className={`p-3 rounded-xl border text-xs text-left flex items-start gap-2.5 transition-all ${
                        isFa ? 'text-right' : 'text-left'
                      } ${
                        inquiryType === 'purchase'
                          ? 'bg-amber-500/15 border-amber-400/60 text-amber-200'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                      <div>
                        <span className="font-semibold block">{t.inquiryModal.optBuy}</span>
                        <span className="text-[10px] text-white/40">{isFa ? 'خرید اصل این اثر فیزیکی یا فایل مستر' : 'Direct acquisition'}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInquiryType('commission_art')}
                      className={`p-3 rounded-xl border text-xs text-left flex items-start gap-2.5 transition-all ${
                        isFa ? 'text-right' : 'text-left'
                      } ${
                        inquiryType === 'commission_art'
                          ? 'bg-amber-500/15 border-amber-400/60 text-amber-200'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Palette className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-400" />
                      <div>
                        <span className="font-semibold block">{t.inquiryModal.optCommission}</span>
                        <span className="text-[10px] text-white/40">{isFa ? 'سفارش نقاشی یا ابعاد دلخواه' : 'Bespoke custom creation'}</span>
                      </div>
                    </button>

                    {isMusic && (
                      <button
                        type="button"
                        onClick={() => setInquiryType('music_performance')}
                        className={`p-3 rounded-xl border text-xs text-left flex items-start gap-2.5 transition-all col-span-1 sm:col-span-2 ${
                          isFa ? 'text-right' : 'text-left'
                        } ${
                          inquiryType === 'music_performance'
                            ? 'bg-purple-500/15 border-purple-400/60 text-purple-200'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <Music className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" />
                        <div>
                          <span className="font-semibold block">{t.inquiryModal.optMusic}</span>
                          <span className="text-[10px] text-white/40">{isFa ? 'لایسنس موسیقی تار یا دعوت به اجرای زنده' : 'Licensing or live recital'}</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Form Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">
                      {t.inquiryModal.fullName}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isFa ? 'مثال: سارا رضایی' : 'e.g. Eleanor Vance'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">
                      {t.inquiryModal.email}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    {t.inquiryModal.phone}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+98 912 000 0000"
                    dir="ltr"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    {t.inquiryModal.message}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.inquiryModal.messagePlaceholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Direct WhatsApp Quick Chat Option */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.477-.15-.678.15-.201.3-.778.979-.954 1.18-.176.2-.352.226-.653.075-.3-.15-1.267-.467-2.414-1.49-1.048-.934-1.756-2.087-1.962-2.44-.206-.352-.022-.543.129-.693.136-.135.301-.352.452-.528.15-.176.201-.301.301-.502.1-.2.05-.377-.025-.528-.075-.15-.678-1.633-.929-2.235-.245-.586-.494-.506-.678-.515-.176-.009-.377-.009-.578-.009s-.527.075-.803.377c-.276.301-1.054 1.03-1.054 2.512 0 1.482 1.079 2.913 1.23 3.114.15.201 2.124 3.243 5.145 4.548.719.311 1.28.497 1.718.636.722.23 1.378.197 1.9.12.58-.087 1.78-.728 2.03-1.431.251-.703.251-1.306.176-1.431-.076-.126-.277-.201-.578-.352z"/>
                        <path d="M12.004 2c-5.518 0-9.996 4.48-9.996 10 0 1.765.459 3.488 1.332 5.006L2 22l5.132-1.312c1.472.803 3.128 1.226 4.872 1.226 5.518 0 9.996-4.48 9.996-10S17.522 2 12.004 2zm0 18.176c-1.503 0-2.977-.406-4.262-1.173l-.306-.182-3.167.81.846-3.088-.199-.317a8.163 8.163 0 0 1-1.252-4.226c0-4.509 3.667-8.176 8.176-8.176 4.509 0 8.176 3.667 8.176 8.176 0 4.509-3.667 8.176-8.176 8.176z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-300">
                        {isFa ? 'استعلام مستقیم در واتساپ' : 'Direct WhatsApp Inquiry'}
                      </p>
                      <p className="text-[10px] text-white/50">
                        {isFa ? '+98 919 0059314 (پاسخ سریع)' : '+98 919 0059314 (Instant)'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/989190059314?text=${encodeURIComponent(
                      isFa 
                        ? `درود، مایل به استعلام و خرید اثر «${artwork.titleFa || artwork.title}» (${artwork.dimensions || ''}) هستم.`
                        : `Hello Saghi Abyar Atelier, I would like to inquire about acquiring "${artwork.title}" (${artwork.dimensions || ''}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
                  >
                    <span>{isFa ? 'ارسال به واتساپ' : 'Chat'}</span>
                  </a>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {onNavigateToContact && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToContact(artwork);
                      }}
                      className="text-xs text-white/50 hover:text-cyan-300 transition-colors flex items-center gap-1.5 order-2 sm:order-1"
                    >
                      {isFa ? (
                        <>
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>باز کردن فرم جامع سفارش در صفحه تماس</span>
                        </>
                      ) : (
                        <>
                          <span>Open full questionnaire on Commissions page</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2 ml-auto"
                  >
                    {isSubmitting ? (
                      <span>{t.inquiryModal.submitting}</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t.inquiryModal.submit}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
