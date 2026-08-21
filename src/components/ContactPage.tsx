import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, Instagram, Send, CheckCircle2, ShoppingBag, Music, Palette } from 'lucide-react';
import { CommissionForm } from '../types';
import { useApp } from '../context/AppContext';
import { SaghiEmblemLogo } from './SaghiEmblemLogo';

export const ContactPage: React.FC = () => {
  const { siteConfig, isFa, t, addInquiry } = useApp();

  const [form, setForm] = useState<CommissionForm>({
    name: '',
    email: '',
    phone: '',
    interest: isFa ? 'سفارش خلق تابلوی نقاشی رنگ‌روغن روی بوم' : 'Commission Custom Fine Art Oil Painting',
    budgetRange: '$1,000 - $3,000',
    dimensions: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Save inquiry to global state & local storage for Admin Panel
      addInquiry({
        name: form.name,
        email: form.email,
        phone: form.phone,
        interest: form.interest,
        dimensions: form.dimensions,
        message: form.message,
      });

      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <main className="min-h-screen bg-black text-white pt-28 pb-32 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-rose-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Info Section */}
          <div className={`lg:col-span-5 space-y-8 ${isFa ? 'text-right' : 'text-left'}`}>
            <header>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-amber-400 font-medium text-xs sm:text-sm tracking-widest uppercase font-mono">
                  {t.contact.headerTag}
                </span>
                <div className="h-px flex-grow bg-white/10" />
              </div>
              <div className="flex items-center gap-4 my-4">
                <SaghiEmblemLogo variant="dark" size="md" glow={true} />
                <div>
                  <span className="text-xs font-mono font-bold text-amber-300 tracking-widest uppercase block">SAGHI ABYAR</span>
                  <span className="text-[11px] text-white/50 font-mono">{isFa ? 'استودیوی اختصاصی هنر و موسیقی' : 'Official Fine Art & Tar Atelier'}</span>
                </div>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-tight ${
                  isFa ? 'font-vazir font-extrabold text-4xl sm:text-5xl md:text-6xl py-1' : 'font-playfair'
                }`}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-300">
                  {t.contact.headerTitle}
                </span>
              </motion.h1>
            </header>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className={`text-white/70 text-base md:text-lg max-w-lg font-light leading-relaxed ${isFa ? 'font-vazir' : 'font-serif'}`}
            >
              {t.contact.headerSubtitle}
            </motion.p>

            <div className="space-y-4 pt-2">
              <motion.div
                initial={{ opacity: 0, x: isFa ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-pink-400 flex-shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold text-white uppercase tracking-wider font-mono ${isFa ? 'font-vazir' : ''}`}>
                    {t.contact.instagramTitle}
                  </h3>
                  <a
                    href="https://instagram.com/saghiabyar__art"
                    target="_blank"
                    rel="noopener noreferrer"
                    dir="ltr"
                    className="text-amber-300 hover:text-amber-200 text-sm mt-0.5 font-mono block text-left transition-colors"
                  >
                    {siteConfig.instagram}
                  </a>
                  <p className={`text-xs text-white/50 font-mono mt-0.5 ${isFa ? 'font-vazir' : ''}`}>{t.contact.instagramSub}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: isFa ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-amber-400 flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold text-white uppercase tracking-wider font-mono ${isFa ? 'font-vazir' : ''}`}>
                    {t.contact.emailTitle}
                  </h3>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    dir="ltr"
                    className="text-white/80 hover:text-white font-mono text-sm mt-0.5 block truncate max-w-[240px] sm:max-w-none text-left"
                  >
                    {siteConfig.email}
                  </a>
                  <p className={`text-xs text-white/50 ${isFa ? 'font-vazir' : ''}`}>{t.contact.emailSub}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: isFa ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-emerald-400 flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold text-white uppercase tracking-wider font-mono ${isFa ? 'font-vazir' : ''}`}>
                    {t.contact.phoneTitle}
                  </h3>
                  <p dir="ltr" className="text-white/80 font-mono text-sm mt-0.5 text-left">{siteConfig.phone}</p>
                  <p className={`text-xs text-white/50 ${isFa ? 'font-vazir' : ''}`}>{t.contact.phoneHours}</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: isFa ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className={`lg:col-span-7 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl relative ${isFa ? 'text-right' : 'text-left'}`}
          >
            {submitted ? (
              <div className="py-16 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className={`text-2xl sm:text-3xl font-bold text-white ${isFa ? 'font-vazir font-bold' : ''}`}>{t.contact.successTitle}</h3>
                <p className={`text-white/70 text-sm max-w-sm mx-auto leading-relaxed font-light ${isFa ? 'font-vazir' : ''}`}>
                  {t.contact.successDesc}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      name: '',
                      email: '',
                      phone: '',
                      interest: isFa ? 'سفارش خلق تابلوی نقاشی رنگ‌روغن روی بوم' : 'Commission Custom Fine Art Oil Painting',
                      budgetRange: '$1,000 - $3,000',
                      dimensions: '',
                      message: '',
                    });
                  }}
                  className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-widest font-mono transition-colors cursor-pointer"
                >
                  {t.contact.submitAnother}
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-amber-400 font-mono text-xs tracking-widest uppercase">
                      {t.contact.formTag}
                    </span>
                    <div className="h-px flex-grow bg-white/10" />
                  </div>
                  <h2 className={`text-2xl md:text-3xl font-bold text-white tracking-tight ${isFa ? 'font-vazir font-extrabold text-amber-200' : 'font-playfair'}`}>
                    {t.contact.formTitle}
                  </h2>
                  <p className={`text-white/60 text-xs mt-1 font-light ${isFa ? 'font-vazir' : ''}`}>
                    {t.contact.formDesc}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={`text-xs font-mono text-white/60 uppercase tracking-widest block ${isFa ? 'font-vazir' : ''}`}>
                        {t.contact.nameLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={`w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors ${isFa ? 'font-vazir text-right' : ''}`}
                        placeholder={isFa ? 'مثال: سارا تهرانی' : 'e.g. Sara Tehrani'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={`text-xs font-mono text-white/60 uppercase tracking-widest block ${isFa ? 'font-vazir' : ''}`}>
                        {t.contact.emailLabel}
                      </label>
                      <input
                        type="email"
                        required
                        dir="ltr"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors text-left font-mono"
                        placeholder="sara@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={`text-xs font-mono text-white/60 uppercase tracking-widest block ${isFa ? 'font-vazir' : ''}`}>
                        {t.contact.phoneLabel}
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors font-mono text-left"
                        placeholder="+98 912 000 0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={`text-xs font-mono text-white/60 uppercase tracking-widest block ${isFa ? 'font-vazir' : ''}`}>
                        {t.contact.dimensionsLabel}
                      </label>
                      <input
                        type="text"
                        value={form.dimensions}
                        onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                        className={`w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors ${isFa ? 'font-vazir' : ''}`}
                        placeholder={isFa ? 'مثال: بوم ۱۰۰ × ۷۰ سانتی‌متر یا اختصاصی' : 'e.g. 100 x 70 cm canvas or custom scale'}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs font-mono text-white/60 uppercase tracking-widest block ${isFa ? 'font-vazir' : ''}`}>
                      {t.contact.interestLabel}
                    </label>
                    <select
                      value={form.interest}
                      onChange={(e) => setForm({ ...form, interest: e.target.value })}
                      className={`w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white/90 focus:outline-none focus:border-amber-400 transition-colors ${isFa ? 'font-vazir text-right' : ''}`}
                    >
                      <option value={isFa ? 'سفارش خلق تابلوی نقاشی رنگ‌روغن روی بوم' : 'Commission Custom Fine Art Oil Painting'}>
                        {isFa ? 'سفارش خلق تابلوی نقاشی رنگ‌روغن روی بوم' : 'Commission Custom Fine Art Oil Painting'}
                      </option>
                      <option value={isFa ? 'خرید مستقیم یکی از آثار نقاشی موجود در آرشیو' : 'Direct Purchase of an Existing Archive Artwork'}>
                        {isFa ? 'خرید مستقیم یکی از آثار نقاشی موجود در آرشیو' : 'Direct Purchase of an Existing Archive Artwork'}
                      </option>
                      <option value={isFa ? 'هماهنگی ضبط یا اجرای تکنوازی تار ایرانی' : 'Booking / Collaboration for Persian Tar Solo Performance'}>
                        {isFa ? 'هماهنگی ضبط یا اجرای تکنوازی تار ایرانی' : 'Booking / Collaboration for Persian Tar Solo Performance'}
                      </option>
                      <option value={isFa ? 'سفارش پرتره یا فیگوراتیو اختصاصی با رنگ‌روغن' : 'Custom Figurative / Portrait Oil Painting'}>
                        {isFa ? 'سفارش پرتره یا فیگوراتیو اختصاصی با رنگ‌روغن' : 'Custom Figurative / Portrait Oil Painting'}
                      </option>
                      <option value={isFa ? 'همکاری در پروژه‌های بین‌رشته‌ای هنر و موسیقی' : 'Interdisciplinary Art & Music Project Inquiry'}>
                        {isFa ? 'همکاری در پروژه‌های بین‌رشته‌ای هنر و موسیقی' : 'Interdisciplinary Art & Music Project Inquiry'}
                      </option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs font-mono text-white/60 uppercase tracking-widest block ${isFa ? 'font-vazir' : ''}`}>
                      {t.contact.messageLabel}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors ${isFa ? 'font-vazir' : ''}`}
                      placeholder={t.contact.messagePlaceholder}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs uppercase tracking-widest font-mono transition-all rounded-full shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className={`w-4 h-4 ${isFa ? 'rotate-180' : ''}`} />
                        <span>{t.contact.submitBtn}</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
};
