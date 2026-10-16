import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Check, 
  Search, 
  Upload, 
  Download, 
  RefreshCw, 
  Star, 
  Sliders, 
  Layers, 
  FileText, 
  Mail, 
  Settings, 
  Database, 
  Lock, 
  Unlock, 
  AlertCircle, 
  Eye, 
  EyeOff,
  CheckCircle2, 
  PhoneCall, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Palette,
  Copy,
  SlidersHorizontal,
  CheckCheck,
  Globe,
  KeyRound,
  Volume2,
  Feather,
  Music,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Artwork, AdminTab, CategoryItem, CommissionInquiry, BackgroundPrompt, BackgroundSettings } from '../../types';
import { INITIAL_BACKGROUND_PROMPTS, INITIAL_BACKGROUND_SETTINGS } from '../../data/initialData';
import { AuthScreen } from '../auth/AuthScreen';
import { SaghiEmblemLogo } from '../SaghiEmblemLogo';
import { EmailInquiriesTab } from './EmailInquiriesTab';
import { PublishPreviewModal, PreviewPayload } from './PublishPreviewModal';
import {
  auth,
  sendAdminPasswordReset,
  saveSiteConfigToFirestore,
} from '../../firebase';


export const AdminModal: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    adminTab,
    setAdminTab,
    isAuthenticated,
    loginAdmin,
    logoutAdmin,
    language,
    setLanguage,
    isFa,
    t,
    artworks,
    addArtwork,
    updateArtwork,
    deleteArtwork,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    siteConfig,
    updateSiteConfig,
    inquiries,
    updateInquiryStatus,
    deleteInquiry,
    exportDatabaseJson,
    importDatabaseJson,
    resetToFactoryDefaults,
  } = useApp();

  // Local States
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Artwork Editor State
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [isCreatingArtwork, setIsCreatingArtwork] = useState(false);
  const [artworkSearch, setArtworkSearch] = useState('');
  const [artworkFilterCat, setArtworkFilterCat] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);

  // Category Editor State
  const [newCatId, setNewCatId] = useState('');
  const [newCatLabelEn, setNewCatLabelEn] = useState('');
  const [newCatLabelFa, setNewCatLabelFa] = useState('');

  // Branding Logo Upload Refs
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const darkLogoFileInputRef = useRef<HTMLInputElement>(null);

  // Background Prompt Editor State
  const [editingPrompt, setEditingPrompt] = useState<BackgroundPrompt | null>(null);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const bgTextureInputRef = useRef<HTMLInputElement>(null);


  // Preview Before Publish Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDraft, setPreviewDraft] = useState<PreviewPayload | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmPublish = async () => {
    if (!previewDraft) return;

    if (previewDraft.type === 'artwork') {
      const artworkData = previewDraft.data;
      // addArtwork / updateArtwork also persist to Firestore for signed-in admins
      if (previewDraft.isNew) {
        addArtwork(artworkData);
      } else {
        updateArtwork(artworkData.id, artworkData);
      }
      setEditingArtwork(null);
      setIsCreatingArtwork(false);
      setIsPreviewOpen(false);
      setPreviewDraft(null);
      showToast(
        isFa 
          ? 'اثر هنری با موفقیت در سایت و دیتابیس فایربیس منتشر شد' 
          : 'Artwork successfully published live to gallery & Firebase!'
      );
    } else if (previewDraft.type === 'siteConfig') {
      // updateSiteConfig also persists to Firestore for signed-in admins
      updateSiteConfig(previewDraft.data);
      setIsPreviewOpen(false);
      setPreviewDraft(null);
      showToast(
        isFa 
          ? 'محتوا و هویت استودیو با موفقیت ذخیره و در فایربیس منتشر گردید' 
          : 'Studio content & identity published live to Firebase!'
      );
    }
  };

  // Image Upload handler (Base64)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (editingArtwork) {
          setEditingArtwork({ ...editingArtwork, imageUrl: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // JSON Import handler
  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importDatabaseJson(content)) {
          showToast(t.admin.toastSaved);
        } else {
          showToast(isFa ? 'خطا در بارگذاری فایل پشتیبان' : 'Failed to parse backup file');
        }
      };
      reader.readAsText(file);
    }
  };

  // Download Backup JSON
  const handleDownloadBackup = () => {
    const json = exportDatabaseJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saghi-abyar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isFa ? 'فایل پشتیبان دانلود شد' : 'Backup downloaded');
  };

  // Factory Reset
  const handleFactoryReset = () => {
    if (window.confirm(t.admin.factoryResetConfirm)) {
      resetToFactoryDefaults();
      showToast(t.admin.toastReset);
    }
  };

  // Filter artworks
  const filteredArtworks = artworks.filter((item) => {
    const matchesCat = artworkFilterCat === 'all' || item.category === artworkFilterCat;
    const query = artworkSearch.toLowerCase();
    const matchesQuery = 
      item.title.toLowerCase().includes(query) ||
      (item.titleFa && item.titleFa.toLowerCase().includes(query)) ||
      item.artist.toLowerCase().includes(query) ||
      (item.artistFa && item.artistFa.toLowerCase().includes(query)) ||
      item.medium.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  if (!isAdminOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full bg-cyan-500 text-black font-bold text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 font-mono"
          >
            <CheckCircle2 className="w-4 h-4" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-6xl max-h-[92vh] flex flex-col bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white my-auto"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Modal Top Header */}
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <SaghiEmblemLogo variant="dark" size="sm" glow={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight font-mono">
                  {t.admin.title}
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  SAGHI ATELIER
                </span>
              </div>
              <p className="text-xs text-white/40 font-light hidden sm:block">
                {t.admin.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Bilingual Language Switcher */}
            <button
              onClick={() => {
                const nextLang = isFa ? 'en' : 'fa';
                setLanguage(nextLang);
                showToast(nextLang === 'fa' ? 'زبان پنل مدیریت به فارسی تغییر یافت' : 'Admin language switched to English');
              }}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10"
              title={isFa ? 'Switch to English' : 'تغییر زبان به فارسی'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">{isFa ? 'English (EN)' : 'فارسی (FA)'}</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={logoutAdmin}
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                title={t.admin.logout}
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.admin.logout}</span>
              </button>
            )}
            <button
              onClick={() => setIsAdminOpen(false)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* Secure Authentication Gate */
          <div className="flex flex-col items-center justify-center p-0 m-0 w-full h-full relative min-h-[500px]">
            <AuthScreen 
              onClose={() => setIsAdminOpen(false)} 
              onSuccess={(user) => {
                loginAdmin(user);
                showToast(`Welcome back, ${user.name}`);
              }} 
            />
          </div>
        ) : (
          /* Authenticated Admin Suite */
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Sidebar Navigation Tabs */}
            <nav className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-3 sm:p-4 bg-black/40 flex-shrink-0 flex md:flex-col gap-1 overflow-x-auto">
              {[
                { id: 'artworks' as AdminTab, label: t.admin.tabArtworks, icon: Layers, badge: artworks.length },
                { id: 'categories' as AdminTab, label: t.admin.tabCategories, icon: Sliders, badge: categories.length },
                { id: 'content' as AdminTab, label: t.admin.tabContent, icon: FileText },
                { id: 'branding' as AdminTab, label: t.admin.tabBranding, icon: Sparkles },
                { id: 'backgrounds' as AdminTab, label: t.admin.tabBackgrounds, icon: Palette, badge: (siteConfig.backgroundPrompts || []).filter(p => p.enabled).length },
                { id: 'inquiries' as AdminTab, label: t.admin.tabInquiries, icon: Mail, badge: inquiries.filter(i => i.status === 'new').length },
                { id: 'settings' as AdminTab, label: t.admin.tabSettings, icon: Settings },
                { id: 'backup' as AdminTab, label: t.admin.tabBackup, icon: Database },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setAdminTab(tab.id);
                    setEditingArtwork(null);
                    setIsCreatingArtwork(false);
                    setEditingPrompt(null);
                    setIsCreatingPrompt(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    adminTab === tab.id
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        adminTab === tab.id ? 'bg-black text-white' : 'bg-cyan-500/20 text-cyan-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Tab Panels View Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-black/20">
              {/* TAB 1: ARTWORKS MANAGER */}
              {adminTab === 'artworks' && (
                <div className="space-y-6">
                  {/* Artwork Edit / Create Form View */}
                  {editingArtwork || isCreatingArtwork ? (
                    <div className="space-y-6 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h3 className="text-lg font-bold font-mono">
                          {isCreatingArtwork ? t.admin.addNewArtwork : t.admin.editArtwork}
                        </h3>
                        <button
                          onClick={() => {
                            setEditingArtwork(null);
                            setIsCreatingArtwork(false);
                          }}
                          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono cursor-pointer"
                        >
                          {t.common.cancel}
                        </button>
                      </div>

                      {/* Image Preview & URL */}
                      <div className="grid md:grid-cols-12 gap-6 items-start">
                        <div className="md:col-span-4 space-y-3">
                          <label className="text-xs font-mono text-white/50 uppercase tracking-widest block">
                            Artwork Visual Study
                          </label>
                          <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/60 flex items-center justify-center group">
                            {editingArtwork?.imageUrl ? (
                              <img
                                src={editingArtwork.imageUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <p className="text-xs text-white/40 font-mono text-center p-4">
                                No image selected
                              </p>
                            )}
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            <Upload className="w-4 h-4 text-cyan-400" />
                            {t.admin.uploadImageBtn}
                          </button>
                        </div>

                        {/* Fields Form */}
                        <div className="md:col-span-8 space-y-5">
                          {/* Media Type & Media URLs */}
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <span className="text-xs font-mono text-amber-400 uppercase font-bold tracking-wider">
                                {isFa ? 'نوع اثر / رسانه دیجیتال' : 'Media Type & Digital Master'}
                              </span>
                              <div className="flex items-center gap-2">
                                {(
                                  [
                                    { id: 'image', label: isFa ? 'نقاشی / تصویر' : 'Fine Art Image' },
                                    { id: 'audio', label: isFa ? 'تکنوازی تار (صوتی)' : 'Tar Solo (Audio)' },
                                    { id: 'video', label: isFa ? 'ویدیو اجرا' : 'Video Performance' },
                                  ] as const
                                ).map((mt) => (
                                  <button
                                    key={mt.id}
                                    type="button"
                                    onClick={() =>
                                      setEditingArtwork(prev => prev ? { ...prev, mediaType: mt.id } : null)
                                    }
                                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                                      (editingArtwork?.mediaType || 'image') === mt.id
                                        ? 'bg-amber-400 text-black font-bold shadow-md'
                                        : 'bg-black/40 text-white/60 hover:text-white border border-white/10'
                                    }`}
                                  >
                                    {mt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-mono text-white/60 uppercase flex items-center justify-between">
                                <span>{t.admin.fieldImageUrl} *</span>
                                <span className="text-[10px] text-white/40">Cover Image / Poster</span>
                              </label>
                              <input
                                type="text"
                                value={editingArtwork?.imageUrl || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, imageUrl: e.target.value } : null)
                                }
                                placeholder="https://images.unsplash.com/... or upload"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-mono"
                              />
                            </div>

                            {/* Additional URLs for Audio / Video */}
                            {(editingArtwork?.mediaType === 'audio' || editingArtwork?.category === 'tar_music') && (
                              <div className="space-y-1 pt-1 border-t border-white/5">
                                <label className="text-xs font-mono text-cyan-400 uppercase flex items-center justify-between">
                                  <span>{isFa ? 'آدرس فایل صوتی تار (HQ Audio Master URL)' : 'Tar Solo Audio URL (MP3/WAV/AAC)'}</span>
                                  <span className="text-[10px] text-white/40">Direct MP3 Link</span>
                                </label>
                                <input
                                  type="text"
                                  value={editingArtwork?.audioUrl || ''}
                                  onChange={(e) =>
                                    setEditingArtwork(prev => prev ? { ...prev, audioUrl: e.target.value } : null)
                                  }
                                  placeholder="https://.../tar-solo-master.mp3"
                                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-cyan-300 focus:border-cyan-400 outline-none font-mono"
                                />
                              </div>
                            )}

                            {editingArtwork?.mediaType === 'video' && (
                              <div className="space-y-1 pt-1 border-t border-white/5">
                                <label className="text-xs font-mono text-rose-400 uppercase flex items-center justify-between">
                                  <span>{isFa ? 'آدرس فایل تصویری (Video Performance URL)' : 'Video Performance URL (MP4 / WebM)'}</span>
                                  <span className="text-[10px] text-white/40">Direct MP4 Link</span>
                                </label>
                                <input
                                  type="text"
                                  value={editingArtwork?.videoUrl || ''}
                                  onChange={(e) =>
                                    setEditingArtwork(prev => prev ? { ...prev, videoUrl: e.target.value } : null)
                                  }
                                  placeholder="https://.../performance.mp4"
                                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-rose-300 focus:border-rose-400 outline-none font-mono"
                                />
                              </div>
                            )}
                          </div>

                          {/* DUAL TITLE */}
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-white/70 uppercase flex items-center justify-between">
                                <span>{t.admin.fieldTitleEn} *</span>
                                <span className="text-[10px] text-white/40 font-normal">LTR [English]</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={editingArtwork?.titleEn ?? editingArtwork?.title ?? ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { 
                                    ...prev, 
                                    title: e.target.value,
                                    titleEn: e.target.value 
                                  } : null)
                                }
                                placeholder="e.g. Minimalist Oil on Linen / Tar Improvisation in Esfahan"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-amber-400 uppercase flex items-center justify-between">
                                <span>{t.admin.fieldTitleFa} *</span>
                                <span className="text-[10px] text-amber-400/60 font-normal">RTL [فارسی]</span>
                              </label>
                              <input
                                type="text"
                                dir="rtl"
                                value={editingArtwork?.titleFa || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, titleFa: e.target.value } : null)
                                }
                                placeholder="مثال: بداهه‌نوازی تار در آواز بیات اصفهان / ترکیب کوبیسم"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-fa"
                              />
                            </div>
                          </div>

                          {/* DUAL SUBTITLE */}
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-white/70 uppercase flex items-center justify-between">
                                <span>{t.admin.fieldSubtitleEn}</span>
                                <span className="text-[10px] text-white/40 font-normal">LTR [English]</span>
                              </label>
                              <textarea
                                rows={4}
                                value={editingArtwork?.subtitleEn ?? editingArtwork?.subtitle ?? ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { 
                                    ...prev, 
                                    subtitle: e.target.value,
                                    subtitleEn: e.target.value 
                                  } : null)
                                }
                                placeholder="e.g. Persian Classical Tar Solo in Bayat-e Esfahan with Studio Acoustic Recording by Saghi Abyar"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none resize-y min-h-[96px] leading-relaxed"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-amber-400 uppercase flex items-center justify-between">
                                <span>{t.admin.fieldSubtitleFa}</span>
                                <span className="text-[10px] text-amber-400/60 font-normal">RTL [فارسی]</span>
                              </label>
                              <textarea
                                rows={4}
                                dir="rtl"
                                value={editingArtwork?.subtitleFa || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, subtitleFa: e.target.value } : null)
                                }
                                placeholder="مثال: تکنوازی تار ایرانی در مایه بیات اصفهان، ضبط استودیویی با اجرای ساقی آبیار"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-fa resize-y min-h-[96px] leading-relaxed"
                              />
                            </div>
                          </div>

                          {/* CATEGORY, YEAR, DURATION */}
                          <div className="grid sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-white/70 uppercase">
                                {t.admin.fieldCategory} *
                              </label>
                              <select
                                value={editingArtwork?.category || 'minimalism'}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, category: e.target.value } : null)
                                }
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                              >
                                {categories.filter(c => c.id !== 'all').map((cat) => (
                                  <option key={cat.id} value={cat.id} className="bg-zinc-950">
                                    {isFa ? cat.labelFa : cat.labelEn} ({cat.id})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-white/70 uppercase">
                                {t.admin.fieldYear}
                              </label>
                              <input
                                type="text"
                                value={editingArtwork?.year || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, year: e.target.value } : null)
                                }
                                placeholder="2026"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-mono"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-white/70 uppercase">
                                {isFa ? 'مدت زمان اجرا (Duration)' : 'Duration (e.g. 06:42)'}
                              </label>
                              <input
                                type="text"
                                value={editingArtwork?.duration || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, duration: e.target.value } : null)
                                }
                                placeholder="06:42"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-mono"
                              />
                            </div>
                          </div>

                          {/* DUAL ARTIST */}
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-white/70 uppercase flex items-center justify-between">
                                <span>{t.admin.fieldArtistEn}</span>
                                <span className="text-[10px] text-white/40 font-normal">LTR [English]</span>
                              </label>
                              <input
                                type="text"
                                value={editingArtwork?.artistEn ?? editingArtwork?.artist ?? ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { 
                                    ...prev, 
                                    artist: e.target.value,
                                    artistEn: e.target.value 
                                  } : null)
                                }
                                placeholder="Saghi Abyar"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-amber-400 uppercase flex items-center justify-between">
                                <span>{t.admin.fieldArtistFa}</span>
                                <span className="text-[10px] text-amber-400/60 font-normal">RTL [فارسی]</span>
                              </label>
                              <input
                                type="text"
                                dir="rtl"
                                value={editingArtwork?.artistFa || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, artistFa: e.target.value } : null)
                                }
                                placeholder="ساقی آبیار"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-fa"
                              />
                            </div>
                          </div>

                          {/* DUAL MEDIUM / INSTRUMENT */}
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-white/70 uppercase flex items-center justify-between">
                                <span>{t.admin.fieldMediumEn}</span>
                                <span className="text-[10px] text-white/40 font-normal">LTR [English]</span>
                              </label>
                              <input
                                type="text"
                                value={editingArtwork?.mediumEn ?? editingArtwork?.medium ?? ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { 
                                    ...prev, 
                                    medium: e.target.value,
                                    mediumEn: e.target.value 
                                  } : null)
                                }
                                placeholder="Oil & Palette Knife on Belgian Linen / Studio Master Solo"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-amber-400 uppercase flex items-center justify-between">
                                <span>{t.admin.fieldMediumFa}</span>
                                <span className="text-[10px] text-amber-400/60 font-normal">RTL [فارسی]</span>
                              </label>
                              <input
                                type="text"
                                dir="rtl"
                                value={editingArtwork?.mediumFa || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, mediumFa: e.target.value } : null)
                                }
                                placeholder="رنگ‌روغن و کاردک روی بوم کتان / تکنوازی ضبط استودیویی"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-fa"
                              />
                            </div>
                          </div>

                          {/* TAR MUSIC SPECIFICS: DASTGAH & INSTRUMENT & PERFORMANCE TYPE */}
                          {(editingArtwork?.category === 'tar_music' || editingArtwork?.mediaType === 'audio' || editingArtwork?.mediaType === 'video') && (
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4">
                              <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider block">
                                {isFa ? 'مشخصات تخصصی دستگاه موسیقی و ساز تار' : 'Tar Musical System & Dastgah Specifics'}
                              </span>

                              <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[11px] font-mono text-white/70 uppercase">
                                    Dastgah / Mode (English)
                                  </label>
                                  <input
                                    type="text"
                                    value={editingArtwork?.dastgahEn ?? editingArtwork?.dastgah ?? ''}
                                    onChange={(e) =>
                                      setEditingArtwork(prev => prev ? { 
                                        ...prev, 
                                        dastgah: e.target.value,
                                        dastgahEn: e.target.value 
                                      } : null)
                                    }
                                    placeholder="Bayat-e Esfahan (Homayoun)"
                                    className="w-full bg-black/70 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-400 outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] font-mono text-amber-400 uppercase">
                                    دستگاه / آواز موسیقی (فارسی)
                                  </label>
                                  <input
                                    type="text"
                                    dir="rtl"
                                    value={editingArtwork?.dastgahFa || ''}
                                    onChange={(e) =>
                                      setEditingArtwork(prev => prev ? { ...prev, dastgahFa: e.target.value } : null)
                                    }
                                    placeholder="آواز بیات اصفهان (دستگاه همایون)"
                                    className="w-full bg-black/70 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-400 outline-none font-fa"
                                  />
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[11px] font-mono text-white/70 uppercase">
                                    Instrument Details (English)
                                  </label>
                                  <input
                                    type="text"
                                    value={editingArtwork?.instrumentEn ?? editingArtwork?.instrument ?? ''}
                                    onChange={(e) =>
                                      setEditingArtwork(prev => prev ? { 
                                        ...prev, 
                                        instrument: e.target.value,
                                        instrumentEn: e.target.value 
                                      } : null)
                                    }
                                    placeholder="Master Persian Tar (Mulberry Wood)"
                                    className="w-full bg-black/70 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-400 outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] font-mono text-amber-400 uppercase">
                                    مشخصات ساز تار (فارسی)
                                  </label>
                                  <input
                                    type="text"
                                    dir="rtl"
                                    value={editingArtwork?.instrumentFa || ''}
                                    onChange={(e) =>
                                      setEditingArtwork(prev => prev ? { ...prev, instrumentFa: e.target.value } : null)
                                    }
                                    placeholder="تار کاسه بزرگ چوب توت کهنه ساخت استاد"
                                    className="w-full bg-black/70 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-400 outline-none font-fa"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* DUAL DIMENSIONS & DUAL PRICE */}
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-white/70 uppercase flex items-center justify-between">
                                <span>{t.admin.fieldDimensions} [En]</span>
                                <span className="text-[10px] text-white/40">120 × 90 cm</span>
                              </label>
                              <input
                                type="text"
                                value={editingArtwork?.dimensionsEn ?? editingArtwork?.dimensions ?? ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { 
                                    ...prev, 
                                    dimensions: e.target.value,
                                    dimensionsEn: e.target.value 
                                  } : null)
                                }
                                placeholder="120 × 90 cm / Studio Recording"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-mono"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-amber-400 uppercase flex items-center justify-between">
                                <span>{isFa ? 'ابعاد و اندازه (فارسی)' : 'Dimensions (Fa)'}</span>
                                <span className="text-[10px] text-amber-400/60">۱۲۰ × ۹۰ سانتی‌متر</span>
                              </label>
                              <input
                                type="text"
                                dir="rtl"
                                value={editingArtwork?.dimensionsFa || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, dimensionsFa: e.target.value } : null)
                                }
                                placeholder="۱۲۰ × ۹۰ سانتی‌متر / قطعه استودیویی"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-fa"
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-white/70 uppercase flex items-center justify-between">
                                <span>Price / Acquisition Details [En]</span>
                                <span className="text-[10px] text-white/40">USD / Inquire</span>
                              </label>
                              <input
                                type="text"
                                value={editingArtwork?.priceEn ?? editingArtwork?.price ?? ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { 
                                    ...prev, 
                                    price: e.target.value,
                                    priceEn: e.target.value 
                                  } : null)
                                }
                                placeholder="Available for Acquisition / Inquire"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-amber-400 uppercase flex items-center justify-between">
                                <span>{isFa ? 'قیمت و شرایط واگذاری (فارسی)' : 'Price (Fa)'}</span>
                                <span className="text-[10px] text-amber-400/60">درخواست سفارش / استعلام</span>
                              </label>
                              <input
                                type="text"
                                dir="rtl"
                                value={editingArtwork?.priceFa || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, priceFa: e.target.value } : null)
                                }
                                placeholder="آماده برای واگذاری به کلکسیون / استعلام قیمت"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-fa"
                              />
                            </div>
                          </div>

                          {/* DUAL ORIGIN & PROVENANCE */}
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-white/70 uppercase flex items-center justify-between">
                                <span>{t.admin.fieldOriginEn}</span>
                                <span className="text-[10px] text-white/40">LTR [English]</span>
                              </label>
                              <textarea
                                rows={4}
                                value={editingArtwork?.culturalOriginEn ?? editingArtwork?.culturalOrigin ?? ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { 
                                    ...prev, 
                                    culturalOrigin: e.target.value,
                                    culturalOriginEn: e.target.value 
                                  } : null)
                                }
                                placeholder="Isfahan & Shiraz Classical School / Radif / Saghi Abyar Studio Series"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none resize-y min-h-[96px] leading-relaxed"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-amber-400 uppercase flex items-center justify-between">
                                <span>{t.admin.fieldOriginFa}</span>
                                <span className="text-[10px] text-amber-400/60">RTL [فارسی]</span>
                              </label>
                              <textarea
                                rows={4}
                                dir="rtl"
                                value={editingArtwork?.culturalOriginFa || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, culturalOriginFa: e.target.value } : null)
                                }
                                placeholder="مکتب اصیل موسیقی و هنرهای تجسمی معاصر ایران / مجموعه اختصاصی آتلیه ساقی آبیار"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-fa resize-y min-h-[96px] leading-relaxed"
                              />
                            </div>
                          </div>

                          {/* TAGS */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-mono text-white/70 uppercase">
                              {t.admin.fieldTags} (Comma-separated)
                            </label>
                            <input
                              type="text"
                              value={editingArtwork?.tags?.join(', ') || ''}
                              onChange={(e) =>
                                setEditingArtwork(prev => prev ? {
                                  ...prev,
                                  tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                } : null)
                              }
                              placeholder="Tar, Persian Music, Minimalism, Cubism, Gold Leaf, Contemporary"
                              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-mono"
                            />
                          </div>

                          {/* DUAL DESCRIPTION / ARTIST NARRATIVE */}
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-white/70 uppercase flex items-center justify-between">
                                <span>{t.admin.fieldDescEn}</span>
                                <span className="text-[10px] text-white/40 font-normal">LTR [English]</span>
                              </label>
                              <textarea
                                rows={6}
                                value={editingArtwork?.descriptionEn ?? editingArtwork?.description ?? ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { 
                                    ...prev, 
                                    description: e.target.value,
                                    descriptionEn: e.target.value 
                                  } : null)
                                }
                                placeholder="Detailed narrative and artistic context behind this work, curatorial statement, musical interpretation, or technique..."
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 outline-none leading-relaxed resize-y min-h-[140px]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-mono text-amber-400 uppercase flex items-center justify-between">
                                <span>{t.admin.fieldDescFa}</span>
                                <span className="text-[10px] text-amber-400/60 font-normal">RTL [فارسی]</span>
                              </label>
                              <textarea
                                rows={6}
                                dir="rtl"
                                value={editingArtwork?.descriptionFa || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, descriptionFa: e.target.value } : null)
                                }
                                placeholder="بیانیه هنری، توصیف حس‌وحال، ارتعاش تار، ظرایف پرده‌بندی یا بافت‌های رنگ‌روغن و فلسفه خلق اثر..."
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-400 outline-none font-fa leading-relaxed resize-y min-h-[140px]"
                              />
                            </div>
                          </div>

                          {/* STATUS, FEATURED & COMMISSION TOGGLES */}
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-white/60 uppercase">Status:</span>
                              <select
                                value={editingArtwork?.status || 'available'}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, status: e.target.value as any } : null)
                                }
                                className="bg-black border border-white/10 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono outline-none"
                              >
                                <option value="available">Available / آماده واگذاری</option>
                                <option value="reserved">Reserved / رزرو شده</option>
                                <option value="archive">Archive / در مجموعه خصوصی</option>
                                <option value="commissioned">Commissioned / سفارش اختصاصی</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-5">
                              <label className="flex items-center gap-2 text-xs text-white/80 font-mono cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingArtwork?.featured || false}
                                  onChange={(e) =>
                                    setEditingArtwork(prev => prev ? { ...prev, featured: e.target.checked } : null)
                                  }
                                  className="w-4 h-4 rounded bg-black/60 border-white/20 text-amber-400 cursor-pointer accent-amber-400"
                                />
                                <Star className="w-3.5 h-3.5 text-amber-400" />
                                <span>{t.admin.fieldFeatured}</span>
                              </label>

                              <label className="flex items-center gap-2 text-xs text-white/80 font-mono cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingArtwork?.canPurchase ?? true}
                                  onChange={(e) =>
                                    setEditingArtwork(prev => prev ? { ...prev, canPurchase: e.target.checked } : null)
                                  }
                                  className="w-4 h-4 rounded bg-black/60 border-white/20 text-amber-400 cursor-pointer accent-amber-400"
                                />
                                <span>Allow Inquiries</span>
                              </label>
                            </div>
                          </div>

                          {/* Save / Submit Button -> Routes to Preview Before Publish Modal */}
                          <div className="pt-2 flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (!editingArtwork) return;
                                const titleVal = editingArtwork.titleEn || editingArtwork.title;
                                if (!titleVal && !editingArtwork.titleFa) {
                                  alert(isFa ? 'عنوان اثر الزامی است' : 'Title is required');
                                  return;
                                }
                                const completeArtwork: Artwork = {
                                  ...editingArtwork,
                                  title: titleVal || editingArtwork.titleFa || 'Untitled',
                                  titleEn: titleVal || editingArtwork.titleFa || 'Untitled',
                                  titleFa: editingArtwork.titleFa || titleVal || '',
                                  subtitle: editingArtwork.subtitleEn || editingArtwork.subtitle || '',
                                  subtitleEn: editingArtwork.subtitleEn || editingArtwork.subtitle || '',
                                  subtitleFa: editingArtwork.subtitleFa || '',
                                  description: editingArtwork.descriptionEn || editingArtwork.description || '',
                                  descriptionEn: editingArtwork.descriptionEn || editingArtwork.description || '',
                                  descriptionFa: editingArtwork.descriptionFa || '',
                                  medium: editingArtwork.mediumEn || editingArtwork.medium || 'Oil on Linen',
                                  mediumEn: editingArtwork.mediumEn || editingArtwork.medium || 'Oil on Linen',
                                  mediumFa: editingArtwork.mediumFa || '',
                                  artist: editingArtwork.artistEn || editingArtwork.artist || 'Saghi Abyar',
                                  artistEn: editingArtwork.artistEn || editingArtwork.artist || 'Saghi Abyar',
                                  artistFa: editingArtwork.artistFa || 'ساقی آبیار',
                                  culturalOrigin: editingArtwork.culturalOriginEn || editingArtwork.culturalOrigin || '',
                                  culturalOriginEn: editingArtwork.culturalOriginEn || editingArtwork.culturalOrigin || '',
                                  culturalOriginFa: editingArtwork.culturalOriginFa || '',
                                  dimensions: editingArtwork.dimensionsEn || editingArtwork.dimensions || '',
                                  dimensionsEn: editingArtwork.dimensionsEn || editingArtwork.dimensions || '',
                                  dimensionsFa: editingArtwork.dimensionsFa || '',
                                  price: editingArtwork.priceEn || editingArtwork.price || '',
                                  priceEn: editingArtwork.priceEn || editingArtwork.price || '',
                                  priceFa: editingArtwork.priceFa || '',
                                  dastgah: editingArtwork.dastgahEn || editingArtwork.dastgah || '',
                                  dastgahEn: editingArtwork.dastgahEn || editingArtwork.dastgah || '',
                                  dastgahFa: editingArtwork.dastgahFa || '',
                                  instrument: editingArtwork.instrumentEn || editingArtwork.instrument || '',
                                  instrumentEn: editingArtwork.instrumentEn || editingArtwork.instrument || '',
                                  instrumentFa: editingArtwork.instrumentFa || '',
                                };

                                // Intercept save -> open preview modal
                                setPreviewDraft({
                                  type: 'artwork',
                                  data: completeArtwork,
                                  isNew: isCreatingArtwork,
                                });
                                setIsPreviewOpen(true);
                              }}
                              className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-widest font-mono transition-all flex items-center gap-2 cursor-pointer shadow-lg rounded-full"
                            >
                              <Eye className="w-4 h-4" />
                              <span>{isFa ? 'پیش‌نمایش قبل از انتشار' : 'Preview Before Publish'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Artworks List View */
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative flex-1">
                            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={artworkSearch}
                              onChange={(e) => setArtworkSearch(e.target.value)}
                              placeholder={t.common.search}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-cyan-400 outline-none"
                            />
                          </div>

                          <select
                            value={artworkFilterCat}
                            onChange={(e) => setArtworkFilterCat(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id} className="bg-zinc-900">
                                {isFa ? cat.labelFa : cat.labelEn}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => {
                            setEditingArtwork({
                              id: '',
                              title: '',
                              titleFa: '',
                              subtitle: '',
                              subtitleFa: '',
                              category: 'minimalism',
                              description: '',
                              descriptionFa: '',
                              medium: '',
                              mediumFa: '',
                              year: new Date().getFullYear().toString(),
                              artist: 'Saghi Abyar',
                              artistFa: 'ساقی آبیار',
                              dimensions: '120 × 90 cm',
                              culturalOrigin: 'Modern Persian Minimal & Cubist Art',
                              culturalOriginFa: 'هنرهای تجسمی معاصر ایران',
                              provenance: 'Saghi Abyar Studio Series',
                              tags: ['Minimalism', 'Contemporary Art'],
                              imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80',
                              featured: true,
                              status: 'available',
                            });
                            setIsCreatingArtwork(true);
                          }}
                          className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-xs uppercase tracking-widest font-mono transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          {t.admin.addNewArtwork}
                        </button>
                      </div>

                      {/* Artworks Table / Cards */}
                      <div className="grid gap-3">
                        {filteredArtworks.length === 0 ? (
                          <div className="p-12 text-center text-white/40 font-light border border-dashed border-white/10 rounded-3xl">
                            {t.common.noResults}
                          </div>
                        ) : (
                          filteredArtworks.map((item) => (
                            <div
                              key={item.id}
                              className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 hover:border-white/20 transition-colors"
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-14 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm font-bold text-white truncate">
                                      {isFa && item.titleFa ? item.titleFa : item.title}
                                    </h4>
                                    {item.featured && (
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center gap-1">
                                        <Star className="w-2.5 h-2.5 fill-amber-300" />
                                        Featured
                                      </span>
                                    )}
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/60 uppercase">
                                      {item.category}
                                    </span>
                                  </div>
                                  <p className="text-xs text-white/50 truncate font-light mt-0.5">
                                    {item.artist} • {item.medium} ({item.year})
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingArtwork({ ...item });
                                    setIsCreatingArtwork(false);
                                  }}
                                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                                  title={t.common.edit}
                                >
                                  <Edit3 className="w-4 h-4 text-cyan-400" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(t.admin.deleteArtworkConfirm)) {
                                      deleteArtwork(item.id);
                                      showToast(t.admin.toastDeleted);
                                    }
                                  }}
                                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/80 hover:text-rose-400 transition-colors cursor-pointer"
                                  title={t.common.delete}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CATEGORIES MANAGER */}
              {adminTab === 'categories' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-cyan-400">
                      {t.admin.addCategory}
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={newCatId}
                        onChange={(e) => setNewCatId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        placeholder={t.admin.catId}
                        className="bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                      />
                      <input
                        type="text"
                        value={newCatLabelEn}
                        onChange={(e) => setNewCatLabelEn(e.target.value)}
                        placeholder={t.admin.catLabelEn}
                        className="bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        value={newCatLabelFa}
                        onChange={(e) => setNewCatLabelFa(e.target.value)}
                        placeholder={t.admin.catLabelFa}
                        className="bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-fa"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!newCatId || !newCatLabelEn) {
                          alert('Category ID and English label are required');
                          return;
                        }
                        addCategory({
                          id: newCatId,
                          labelEn: newCatLabelEn,
                          labelFa: newCatLabelFa || newCatLabelEn,
                        });
                        setNewCatId('');
                        setNewCatLabelEn('');
                        setNewCatLabelFa('');
                        showToast(isFa ? 'دسته‌بندی با موفقیت اضافه شد' : 'Category added');
                      }}
                      className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-xs uppercase tracking-widest font-mono cursor-pointer transition-all"
                    >
                      {t.admin.addCategory}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase text-white/40 tracking-wider">
                      Existing Categories ({categories.length})
                    </h4>
                    <div className="grid gap-2">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
                              {cat.id}
                            </span>
                            <span className="text-xs font-semibold text-white">{cat.labelEn}</span>
                            <span className="text-xs text-white/50 font-fa">({cat.labelFa})</span>
                          </div>
                          {cat.id !== 'all' && (
                            <button
                              onClick={() => {
                                if (window.confirm(t.common.confirmDelete)) {
                                  deleteCategory(cat.id);
                                  showToast(t.admin.toastDeleted);
                                }
                              }}
                              className="p-2 text-white/60 hover:text-rose-400 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CONTENT & STORIES EDITOR */}
              {adminTab === 'content' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                    <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold font-mono text-amber-400 uppercase tracking-wide">
                          {t.admin.contentTitle}
                        </h3>
                        <p className="text-xs text-white/50 font-light mt-1">
                          {isFa ? 'مدیریت و ویرایش متون، بیانیه، معرفی و اطلاعات هویت دو زبانه استودیو' : 'Manage and customize bilingual studio texts, identity, statements, and quotes'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewDraft({
                            type: 'siteConfig',
                            data: siteConfig,
                          });
                          setIsPreviewOpen(true);
                        }}
                        className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black rounded-full font-bold text-xs uppercase tracking-widest font-mono cursor-pointer transition-all flex items-center gap-2 shadow-lg"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{isFa ? 'پیش‌نمایش قبل از انتشار' : 'Preview Before Publish'}</span>
                      </button>
                    </div>

                    {/* Section 1: Artist & Studio Identity */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isFa ? '۱. هویت هنرمند و عنوان استودیو' : '1. Artist & Atelier Identity'}</span>
                      </h4>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-white/70 uppercase flex items-center justify-between">
                            <span>Artist Name (English)</span>
                            <span className="text-[10px] text-white/40">LTR</span>
                          </label>
                          <input
                            type="text"
                            value={siteConfig.artistNameEn}
                            onChange={(e) => updateSiteConfig({ artistNameEn: e.target.value })}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-amber-400 uppercase flex items-center justify-between">
                            <span>نام هنرمند (فارسی)</span>
                            <span className="text-[10px] text-amber-400/60">RTL</span>
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={siteConfig.artistNameFa}
                            onChange={(e) => updateSiteConfig({ artistNameFa: e.target.value })}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-fa"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-white/70 uppercase flex items-center justify-between">
                            <span>Atelier Name (English)</span>
                            <span className="text-[10px] text-white/40">LTR</span>
                          </label>
                          <input
                            type="text"
                            value={siteConfig.atelierNameEn}
                            onChange={(e) => updateSiteConfig({ atelierNameEn: e.target.value })}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-amber-400 uppercase flex items-center justify-between">
                            <span>نام آتلیه و استودیو (فارسی)</span>
                            <span className="text-[10px] text-amber-400/60">RTL</span>
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={siteConfig.atelierNameFa}
                            onChange={(e) => updateSiteConfig({ atelierNameFa: e.target.value })}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-fa"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Hero Banner */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5" />
                        <span>{isFa ? '۲. تیترها و متون بنر صفحه اصلی (Hero Section)' : '2. Hero Banner Headline & Subtitles'}</span>
                      </h4>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-white/70 uppercase flex items-center justify-between">
                            <span>{t.admin.heroHeadlineEn}</span>
                            <span className="text-[10px] text-white/40">LTR</span>
                          </label>
                          <input
                            type="text"
                            value={siteConfig.heroHeadlineEn}
                            onChange={(e) => updateSiteConfig({ heroHeadlineEn: e.target.value })}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-amber-400 uppercase flex items-center justify-between">
                            <span>{t.admin.heroHeadlineFa}</span>
                            <span className="text-[10px] text-amber-400/60">RTL</span>
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={siteConfig.heroHeadlineFa}
                            onChange={(e) => updateSiteConfig({ heroHeadlineFa: e.target.value })}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-fa"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-white/70 uppercase flex items-center justify-between">
                            <span>{t.admin.heroSubtitleEn}</span>
                            <span className="text-[10px] text-white/40">LTR</span>
                          </label>
                          <textarea
                            rows={4}
                            value={siteConfig.heroSubtitleEn}
                            onChange={(e) => updateSiteConfig({ heroSubtitleEn: e.target.value })}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none resize-y min-h-[96px] leading-relaxed"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-amber-400 uppercase flex items-center justify-between">
                            <span>{t.admin.heroSubtitleFa}</span>
                            <span className="text-[10px] text-amber-400/60">RTL</span>
                          </label>
                          <textarea
                            rows={4}
                            dir="rtl"
                            value={siteConfig.heroSubtitleFa}
                            onChange={(e) => updateSiteConfig({ heroSubtitleFa: e.target.value })}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-fa resize-y min-h-[96px] leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Announcement Top Bar */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider flex items-center gap-2">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isFa ? '۳. نوار اعلان بالای سایت (Top Announcement Bar)' : '3. Top Announcement Bar'}</span>
                        </h4>
                        <label className="flex items-center gap-2 text-xs font-mono text-white/80 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={siteConfig.announcementBanner?.enabled ?? false}
                            onChange={(e) => {
                              const cur = siteConfig.announcementBanner || { enabled: false, textEn: '', textFa: '', type: 'info' };
                              updateSiteConfig({ announcementBanner: { ...cur, enabled: e.target.checked } });
                            }}
                            className="w-4 h-4 rounded bg-black/60 border-white/20 text-amber-400 cursor-pointer accent-amber-400"
                          />
                          <span>{isFa ? 'فعال‌سازی نوار اعلان' : 'Enable Top Bar'}</span>
                        </label>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-white/70 uppercase">Announcement Text (English)</label>
                          <textarea
                            rows={3}
                            value={siteConfig.announcementBanner?.textEn || ''}
                            onChange={(e) => {
                              const cur = siteConfig.announcementBanner || { enabled: true, textEn: '', textFa: '', type: 'info' };
                              updateSiteConfig({ announcementBanner: { ...cur, textEn: e.target.value } });
                            }}
                            placeholder="e.g. New Classical Tar Solos & 2026 Collection Available"
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none resize-y min-h-[72px] leading-relaxed"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-amber-400 uppercase">متن اعلان بالای سایت (فارسی)</label>
                          <textarea
                            rows={3}
                            dir="rtl"
                            value={siteConfig.announcementBanner?.textFa || ''}
                            onChange={(e) => {
                              const cur = siteConfig.announcementBanner || { enabled: true, textEn: '', textFa: '', type: 'info' };
                              updateSiteConfig({ announcementBanner: { ...cur, textFa: e.target.value } });
                            }}
                            placeholder="مثال: انتشار قطعات جدید تکنوازی تار و آثار نقاشی ۲۰۲۶"
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-fa resize-y min-h-[72px] leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Studio Philosophy Quote */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider flex items-center gap-2">
                        <Feather className="w-3.5 h-3.5" />
                        <span>{isFa ? '۴. نقل‌قول و بیانیه فلسفه هنری' : '4. Philosophy & Studio Quote'}</span>
                      </h4>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-white/70 uppercase flex items-center justify-between">
                            <span>{t.admin.aboutQuoteEn}</span>
                            <span className="text-[10px] text-white/40">LTR</span>
                          </label>
                          <textarea
                            rows={5}
                            value={siteConfig.quoteEn}
                            onChange={(e) => updateSiteConfig({ quoteEn: e.target.value })}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none resize-y min-h-[120px] leading-relaxed"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-amber-400 uppercase flex items-center justify-between">
                            <span>{t.admin.aboutQuoteFa}</span>
                            <span className="text-[10px] text-amber-400/60">RTL</span>
                          </label>
                          <textarea
                            rows={5}
                            dir="rtl"
                            value={siteConfig.quoteFa}
                            onChange={(e) => updateSiteConfig({ quoteFa: e.target.value })}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-fa resize-y min-h-[120px] leading-relaxed"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-white/70 uppercase">Quote Attribution (English)</label>
                          <textarea
                            rows={2}
                            value={siteConfig.quoteAuthorEn || ''}
                            onChange={(e) => updateSiteConfig({ quoteAuthorEn: e.target.value })}
                            placeholder="Saghi Abyar — Studio Statement"
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none resize-y min-h-[60px]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-amber-400 uppercase">امضای نقل‌قول (فارسی)</label>
                          <textarea
                            rows={2}
                            dir="rtl"
                            value={siteConfig.quoteAuthorFa || ''}
                            onChange={(e) => updateSiteConfig({ quoteAuthorFa: e.target.value })}
                            placeholder="ساقی آبیار — گزیده‌ای از بیانیه هنری"
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-fa resize-y min-h-[60px]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Disciplines of Mastery */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider flex items-center gap-2">
                        <Music className="w-3.5 h-3.5" />
                        <span>{isFa ? '۵. زمینه‌های تخصصی هنرمند (Disciplines of Mastery)' : '5. Disciplines of Mastery'}</span>
                      </h4>

                      <div className="space-y-3">
                        {siteConfig.disciplines.map((item, idx) => (
                          <div key={item.id} className="p-3.5 rounded-2xl bg-black/50 border border-white/10 grid sm:grid-cols-2 gap-3 items-center">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-white/40 uppercase">Discipline #{idx + 1} (English)</span>
                              <input
                                type="text"
                                value={item.nameEn}
                                onChange={(e) => {
                                  const updated = [...siteConfig.disciplines];
                                  updated[idx] = { ...updated[idx], nameEn: e.target.value };
                                  updateSiteConfig({ disciplines: updated });
                                }}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-amber-400/60 uppercase">رشته تخصصی #{idx + 1} (فارسی)</span>
                              <input
                                type="text"
                                dir="rtl"
                                value={item.nameFa}
                                onChange={(e) => {
                                  const updated = [...siteConfig.disciplines];
                                  updated[idx] = { ...updated[idx], nameFa: e.target.value };
                                  updateSiteConfig({ disciplines: updated });
                                }}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-fa focus:border-amber-400"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 6: Studio Contacts */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <h4 className="text-xs font-mono uppercase text-amber-300 tracking-wider flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isFa ? '۶. اطلاعات تماس و شبکه‌های رسمی استودیو' : '6. Studio Contacts & Social Networks'}</span>
                      </h4>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-white/60 uppercase">Email Address</label>
                          <input
                            type="email"
                            value={siteConfig.contactEmail || ''}
                            onChange={(e) => updateSiteConfig({ contactEmail: e.target.value })}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-amber-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-white/60 uppercase">Phone / Hotline</label>
                          <input
                            type="text"
                            value={siteConfig.contactPhone || ''}
                            onChange={(e) => updateSiteConfig({ contactPhone: e.target.value })}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-amber-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-white/60 uppercase">WhatsApp (International)</label>
                          <input
                            type="text"
                            value={siteConfig.whatsappNumber || ''}
                            onChange={(e) => updateSiteConfig({ whatsappNumber: e.target.value })}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Save Bar */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewDraft({
                            type: 'siteConfig',
                            data: siteConfig,
                          });
                          setIsPreviewOpen(true);
                        }}
                        className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold rounded-full text-xs uppercase tracking-widest font-mono cursor-pointer transition-all flex items-center gap-2 shadow-xl"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{isFa ? 'پیش‌نمایش و انتشار هویت استودیو' : 'Preview & Publish Studio Content'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3.2: BRANDING & OFFICIAL LOGO MANAGER */}
              {adminTab === 'branding' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-400" />
                          <h3 className="text-base font-bold font-mono text-amber-400 uppercase tracking-wide">
                            {t.admin.brandingTitle}
                          </h3>
                        </div>
                        <p className="text-xs text-white/50 font-light mt-1 max-w-2xl leading-relaxed">
                          {t.admin.brandingSubtitle}
                        </p>
                      </div>

                      {siteConfig.customLogoUrl && (
                        <button
                          onClick={() => {
                            updateSiteConfig({ customLogoUrl: '', customLogoDarkUrl: '', customLogoTransparentUrl: '' });
                            showToast(isFa ? 'لوگو به نشان وکتور بازنشانی شد' : 'Reset to vector emblem');
                          }}
                          className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-full text-xs font-mono cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          {t.admin.logoResetDefault}
                        </button>
                      )}
                    </div>

                    {/* Logo Upload Inputs */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Main Transparent Logo */}
                      <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-mono font-bold text-amber-300 uppercase block">
                            {t.admin.logoUploadLabel}
                          </label>
                          <p className="text-[11px] text-white/40">
                            {isFa ? 'لوگوی اصلی با فرمت PNG بدون پس‌زمینه (ترنسپرنت) برای نمایش در سراسر وب‌سایت' : 'Main transparent logo (PNG/WebP/SVG) for header, hero and footer'}
                          </p>
                        </div>

                        <input
                          type="file"
                          ref={logoFileInputRef}
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                updateSiteConfig({
                                  customLogoUrl: ev.target?.result as string,
                                  customLogoTransparentUrl: ev.target?.result as string,
                                });
                                showToast(isFa ? 'لوگوی جدید با موفقیت بارگذاری شد' : 'Logo uploaded successfully');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => logoFileInputRef.current?.click()}
                            className="flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-xl text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                          >
                            <Upload className="w-4 h-4" />
                            {t.admin.logoUploadBtn}
                          </button>
                        </div>

                        <div className="space-y-1 pt-1">
                          <label className="text-[10px] font-mono text-white/40 uppercase">
                            {isFa ? 'یا آدرس اینترنتی تصویر لوگو' : 'Or direct Image URL'}
                          </label>
                          <input
                            type="text"
                            value={siteConfig.customLogoUrl || ''}
                            onChange={(e) => updateSiteConfig({ customLogoUrl: e.target.value })}
                            placeholder={t.admin.logoUrlPlaceholder}
                            className="w-full bg-black/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Dark Variant / Emblem Card */}
                      <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-mono font-bold text-white/80 uppercase block">
                            {t.admin.logoDarkUploadLabel}
                          </label>
                          <p className="text-[11px] text-white/40">
                            {isFa ? 'نسخه ویژه پس‌زمینه تاریک یا نشان دایره‌ای (اختیاری)' : 'Optional dark emblem circular variant'}
                          </p>
                        </div>

                        <input
                          type="file"
                          ref={darkLogoFileInputRef}
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                updateSiteConfig({
                                  customLogoDarkUrl: ev.target?.result as string,
                                });
                                showToast(isFa ? 'لوگوی تیره با موفقیت بارگذاری شد' : 'Dark logo uploaded');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => darkLogoFileInputRef.current?.click()}
                            className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-all"
                          >
                            <Upload className="w-4 h-4" />
                            {isFa ? 'بارگذاری نسخه تیره' : 'Upload Dark Variant'}
                          </button>
                        </div>

                        <div className="space-y-1 pt-1">
                          <label className="text-[10px] font-mono text-white/40 uppercase">
                            {isFa ? 'یا آدرس اینترنتی نسخه تیره' : 'Or direct Image URL (Dark Variant)'}
                          </label>
                          <input
                            type="text"
                            value={siteConfig.customLogoDarkUrl || ''}
                            onChange={(e) => updateSiteConfig({ customLogoDarkUrl: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-black/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Live Previews of the Logo */}
                    <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-4">
                      <h4 className="text-xs font-mono uppercase text-amber-400 tracking-wider flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        {t.admin.logoPreviewTitle}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* On Transparent Dark Backdrop (Header style) */}
                        <div className="p-6 rounded-2xl bg-black/90 border border-white/10 flex flex-col items-center justify-center gap-3 text-center">
                          <span className="text-[10px] font-mono text-white/40 uppercase">Transparent / Header</span>
                          <SaghiEmblemLogo size="lg" variant="transparent" />
                        </div>

                        {/* On Gold & Dark Backdrop */}
                        <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-900 to-black border border-amber-500/20 flex flex-col items-center justify-center gap-3 text-center">
                          <span className="text-[10px] font-mono text-amber-400/60 uppercase">Dark Variant / Hero</span>
                          <SaghiEmblemLogo size="lg" variant="dark" />
                        </div>

                        {/* On Light Backdrop */}
                        <div className="p-6 rounded-2xl bg-zinc-100 border border-black/10 flex flex-col items-center justify-center gap-3 text-center">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">White / High Contrast</span>
                          <SaghiEmblemLogo size="lg" variant="white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3.5: BACKGROUND OIL PAINT FX & PROMPTS MANAGER */}
              {adminTab === 'backgrounds' && (
                <div className="space-y-6">
                  {/* Global & Canvas FX Settings Bar */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Palette className="w-5 h-5 text-amber-400" />
                          <h3 className="text-base font-bold font-mono text-amber-400 uppercase tracking-wide">
                            {t.admin.bgTitle}
                          </h3>
                        </div>
                        <p className="text-xs text-white/50 font-light mt-1 max-w-2xl leading-relaxed">
                          {t.admin.bgSubtitle}
                        </p>
                      </div>

                      {/* Global Enable Switch */}
                      <div className="flex items-center gap-3 bg-black/50 border border-white/10 px-4 py-2.5 rounded-2xl">
                        <span className="text-xs font-mono text-white/80">
                          {t.admin.bgGlobalEnable}
                        </span>
                        <input
                          type="checkbox"
                          checked={siteConfig.backgroundSettings?.globalEnabled ?? true}
                          onChange={(e) => {
                            const curSettings = siteConfig.backgroundSettings || INITIAL_BACKGROUND_SETTINGS;
                            updateSiteConfig({
                              backgroundSettings: {
                                ...curSettings,
                                globalEnabled: e.target.checked,
                              }
                            });
                            showToast(e.target.checked ? (isFa ? 'افکت پس‌زمینه فعال شد' : 'Ambient FX Enabled') : (isFa ? 'افکت پس‌زمینه غیرفعال شد' : 'Ambient FX Disabled'));
                          }}
                          className="w-4 h-4 rounded bg-black/60 border-white/20 text-amber-500 cursor-pointer accent-amber-500"
                        />
                      </div>
                    </div>

                    {/* Page Assignments Grid */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        {t.admin.bgPageAssignments}
                      </h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { key: 'home' as const, label: t.admin.bgAssignHome },
                          { key: 'archive' as const, label: t.admin.bgAssignArchive },
                          { key: 'about' as const, label: t.admin.bgAssignAbout },
                          { key: 'contact' as const, label: t.admin.bgAssignContact },
                          { key: 'analyzer' as const, label: t.admin.bgAssignAnalyzer },
                        ].map((pg) => {
                          const curSettings = siteConfig.backgroundSettings || INITIAL_BACKGROUND_SETTINGS;
                          const currentAssigned = curSettings.pageAssignments?.[pg.key] || curSettings.activePromptId;
                          const promptsList = siteConfig.backgroundPrompts || INITIAL_BACKGROUND_PROMPTS;

                          return (
                            <div key={pg.key} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                              <label className="text-[11px] font-mono text-white/60 uppercase block truncate">
                                {pg.label}
                              </label>
                              <select
                                value={currentAssigned}
                                onChange={(e) => {
                                  updateSiteConfig({
                                    backgroundSettings: {
                                      ...curSettings,
                                      pageAssignments: {
                                        ...curSettings.pageAssignments,
                                        [pg.key]: e.target.value,
                                      }
                                    }
                                  });
                                  showToast(isFa ? 'اختصاص تم به صفحه با موفقیت ذخیره شد' : 'Page assignment updated');
                                }}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono outline-none focus:border-amber-400"
                              >
                                {promptsList.map((pr) => (
                                  <option key={pr.id} value={pr.id}>
                                    {isFa ? pr.nameFa : pr.name} {pr.enabled ? '✓' : '(Disabled)'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick FX Controls: Opacity & Ambient Glow */}
                    <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white/60">{t.admin.bgIntensity}</span>
                          <span className="text-amber-400 font-bold">{siteConfig.backgroundSettings?.overlayOpacity ?? 25}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="80"
                          value={siteConfig.backgroundSettings?.overlayOpacity ?? 25}
                          onChange={(e) => {
                            const cur = siteConfig.backgroundSettings || INITIAL_BACKGROUND_SETTINGS;
                            updateSiteConfig({
                              backgroundSettings: { ...cur, overlayOpacity: Number(e.target.value) }
                            });
                          }}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-xs font-mono text-white/60 block">Blend Mode</span>
                        <select
                          value={siteConfig.backgroundSettings?.blendMode || 'screen'}
                          onChange={(e) => {
                            const cur = siteConfig.backgroundSettings || INITIAL_BACKGROUND_SETTINGS;
                            updateSiteConfig({
                              backgroundSettings: { ...cur, blendMode: e.target.value as any }
                            });
                          }}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none"
                        >
                          <option value="screen">Screen (Golden Shimmer)</option>
                          <option value="overlay">Overlay (Rich Contrast)</option>
                          <option value="lighten">Lighten (Subtle Glow)</option>
                          <option value="color-dodge">Color Dodge (Intense Luxury)</option>
                          <option value="soft-light">Soft Light (Velvet Touch)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5 self-end">
                        <span className="text-xs font-mono text-white/70">Animated Ambient Glow</span>
                        <input
                          type="checkbox"
                          checked={siteConfig.backgroundSettings?.animatedGlow ?? true}
                          onChange={(e) => {
                            const cur = siteConfig.backgroundSettings || INITIAL_BACKGROUND_SETTINGS;
                            updateSiteConfig({
                              backgroundSettings: { ...cur, animatedGlow: e.target.checked }
                            });
                          }}
                          className="w-4 h-4 rounded bg-black/60 border-white/20 text-cyan-500 cursor-pointer accent-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add / Edit Prompt Form Modal / Card */}
                  {(editingPrompt || isCreatingPrompt) ? (
                    <div className="p-6 rounded-3xl bg-white/5 border border-amber-500/30 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h4 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-wide flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          {isCreatingPrompt ? t.admin.bgAddPrompt : (isFa ? 'ویرایش پرامپت بافت روغنی' : 'Edit Oil Paint Prompt Preset')}
                        </h4>
                        <button
                          onClick={() => {
                            setEditingPrompt(null);
                            setIsCreatingPrompt(false);
                          }}
                          className="text-xs font-mono text-white/60 hover:text-white px-3 py-1 bg-white/5 rounded-full cursor-pointer"
                        >
                          {t.common.cancel}
                        </button>
                      </div>

                      {/* Prompt Form Fields */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-mono text-white/50 uppercase">{t.admin.bgPromptNameEn} *</label>
                          <input
                            type="text"
                            value={editingPrompt?.name || ''}
                            onChange={(e) => setEditingPrompt(prev => prev ? { ...prev, name: e.target.value } : null)}
                            placeholder="e.g. Luxury Persian Gold Impasto"
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-mono text-amber-400 uppercase">{t.admin.bgPromptNameFa} *</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={editingPrompt?.nameFa || ''}
                            onChange={(e) => setEditingPrompt(prev => prev ? { ...prev, nameFa: e.target.value } : null)}
                            placeholder="مثال: پرامپت بافت رنگ‌روغن و ارتعاش تار"
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400 font-fa"
                          />
                        </div>
                      </div>

                      {/* Full Prompt Text Body */}
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-cyan-400 uppercase tracking-wide">
                          {t.admin.bgPromptBody} *
                        </label>
                        <textarea
                          rows={4}
                          value={editingPrompt?.prompt || ''}
                          onChange={(e) => setEditingPrompt(prev => prev ? { ...prev, prompt: e.target.value } : null)}
                          placeholder="High-end abstract impasto oil painting on deep jet black canvas, thick dynamic palette knife texture, minimal lines and Persian Tar resonance..."
                          className="w-full bg-black/70 border border-white/10 rounded-2xl p-4 text-xs text-white font-mono leading-relaxed outline-none focus:border-cyan-400"
                        />
                      </div>

                      {/* Style Tags and Colors */}
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-white/50 uppercase">{t.admin.bgStyleTagEn}</label>
                          <input
                            type="text"
                            value={editingPrompt?.styleTag || ''}
                            onChange={(e) => setEditingPrompt(prev => prev ? { ...prev, styleTag: e.target.value } : null)}
                            placeholder="Amber Ochre & Indigo"
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-amber-400 uppercase">{t.admin.bgStyleTagFa}</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={editingPrompt?.styleTagFa || ''}
                            onChange={(e) => setEditingPrompt(prev => prev ? { ...prev, styleTagFa: e.target.value } : null)}
                            placeholder="بافت کاردک و خطوط مینیمال"
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-fa"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-white/50 uppercase">Accent Color Hex</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={editingPrompt?.accentColor || '#f59e0b'}
                              onChange={(e) => setEditingPrompt(prev => prev ? { ...prev, accentColor: e.target.value } : null)}
                              className="w-9 h-9 rounded-lg bg-black cursor-pointer border border-white/20 p-0.5"
                            />
                            <input
                              type="text"
                              value={editingPrompt?.accentColor || '#f59e0b'}
                              onChange={(e) => setEditingPrompt(prev => prev ? { ...prev, accentColor: e.target.value } : null)}
                              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Custom Rendered Image URL or Upload */}
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-white/50 uppercase">{t.admin.bgCustomImage}</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingPrompt?.customImageUrl || ''}
                            onChange={(e) => setEditingPrompt(prev => prev ? { ...prev, customImageUrl: e.target.value } : null)}
                            placeholder="https://images.unsplash.com/... or upload texture image"
                            className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none"
                          />
                          <input
                            type="file"
                            ref={bgTextureInputRef}
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && editingPrompt) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  setEditingPrompt({ ...editingPrompt, customImageUrl: ev.target?.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => bgTextureInputRef.current?.click()}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            {t.admin.uploadImageBtn}
                          </button>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => {
                            if (!editingPrompt?.name || !editingPrompt?.prompt) {
                              alert('Preset name and prompt text are required.');
                              return;
                            }
                            const existing = siteConfig.backgroundPrompts || INITIAL_BACKGROUND_PROMPTS;
                            let updatedList: BackgroundPrompt[];
                            if (isCreatingPrompt) {
                              updatedList = [...existing, editingPrompt];
                            } else {
                              updatedList = existing.map(p => p.id === editingPrompt.id ? editingPrompt : p);
                            }
                            updateSiteConfig({ backgroundPrompts: updatedList });
                            setEditingPrompt(null);
                            setIsCreatingPrompt(false);
                            showToast(isFa ? 'پرامپت با موفقیت ذخیره شد' : 'Prompt preset saved');
                          }}
                          className="px-8 py-3 bg-amber-400 text-black hover:bg-amber-300 rounded-full font-bold text-xs uppercase tracking-widest font-mono cursor-pointer transition-all flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {t.common.save}
                        </button>
                        <button
                          onClick={() => {
                            setEditingPrompt(null);
                            setIsCreatingPrompt(false);
                          }}
                          className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-full text-xs font-mono cursor-pointer"
                        >
                          {t.common.cancel}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-mono uppercase text-white/50 tracking-wider">
                        Available Oil Paint Presets ({(siteConfig.backgroundPrompts || INITIAL_BACKGROUND_PROMPTS).length})
                      </h4>
                      <button
                        onClick={() => {
                          const newId = `bg-custom-${Date.now()}`;
                          setEditingPrompt({
                            id: newId,
                            name: '',
                            nameFa: '',
                            prompt: '',
                            styleTag: 'Custom Fine Art Impasto',
                            styleTagFa: 'بافت رنگ روغن سفارشی',
                            aspectRatio: '16:9',
                            category: 'custom',
                            accentColor: '#eab308',
                            enabled: true,
                            targetPages: ['all'],
                            bgIntensity: 0.16,
                            customImageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&q=80',
                          });
                          setIsCreatingPrompt(true);
                        }}
                        className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-xs uppercase tracking-wider font-mono cursor-pointer transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {t.admin.bgAddPrompt}
                      </button>
                    </div>
                  )}

                  {/* Prompts Cards List */}
                  <div className="grid gap-4">
                    {(siteConfig.backgroundPrompts || INITIAL_BACKGROUND_PROMPTS).map((pr) => {
                      const curSettings = siteConfig.backgroundSettings || INITIAL_BACKGROUND_SETTINGS;
                      const isPrimary = curSettings.activePromptId === pr.id;

                      return (
                        <div
                          key={pr.id}
                          className={`p-5 sm:p-6 rounded-3xl bg-white/5 border transition-all relative overflow-hidden ${
                            pr.enabled ? 'border-white/15' : 'border-white/5 opacity-60'
                          } ${isPrimary ? 'ring-1 ring-amber-400/50 bg-amber-500/5' : ''}`}
                        >
                          {/* Accent Color Bar */}
                          <div 
                            className="absolute top-0 left-0 bottom-0 w-1.5"
                            style={{ backgroundColor: pr.accentColor || '#f59e0b' }}
                          />

                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pl-2">
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <h4 className="text-sm sm:text-base font-bold text-white font-mono">
                                  {pr.name}
                                </h4>
                                {pr.nameFa && (
                                  <span className="text-xs text-white/50 font-fa">({pr.nameFa})</span>
                                )}
                                <span
                                  className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border"
                                  style={{
                                    borderColor: `${pr.accentColor}50`,
                                    color: pr.accentColor,
                                    backgroundColor: `${pr.accentColor}15`
                                  }}
                                >
                                  {isFa ? pr.styleTagFa : pr.styleTag}
                                </span>
                                {isPrimary && (
                                  <span className="text-[10px] font-mono bg-amber-400 text-black font-bold px-2 py-0.5 rounded-full">
                                    {t.admin.bgActiveBadge}
                                  </span>
                                )}
                              </div>

                              {/* Prompt Text Box */}
                              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/5 font-mono text-xs text-white/80 leading-relaxed relative group">
                                <p className="line-clamp-3 select-all text-[11px] font-light">
                                  {pr.prompt}
                                </p>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(pr.prompt);
                                    setCopiedPromptId(pr.id);
                                    showToast(t.admin.bgPromptCopied);
                                    setTimeout(() => setCopiedPromptId(null), 2500);
                                  }}
                                  className="mt-2 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1 rounded-lg transition-colors inline-flex"
                                >
                                  {copiedPromptId === pr.id ? (
                                    <>
                                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>{t.admin.bgCopyPrompt}</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Actions & Toggles */}
                            <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-start">
                              {/* Enable / Disable Toggle */}
                              <button
                                onClick={() => {
                                  const existing = siteConfig.backgroundPrompts || INITIAL_BACKGROUND_PROMPTS;
                                  const updated = existing.map(p => p.id === pr.id ? { ...p, enabled: !p.enabled } : p);
                                  updateSiteConfig({ backgroundPrompts: updated });
                                  showToast(pr.enabled ? (isFa ? 'پرامپت غیرفعال شد' : 'Prompt disabled') : (isFa ? 'پرامپت فعال شد' : 'Prompt enabled'));
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
                                  pr.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/40 border border-white/10'
                                }`}
                                title={t.admin.bgToggle}
                              >
                                {pr.enabled ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                {pr.enabled ? 'Enabled' : 'Disabled'}
                              </button>

                              {/* Set as Primary Default */}
                              <button
                                onClick={() => {
                                  const cur = siteConfig.backgroundSettings || INITIAL_BACKGROUND_SETTINGS;
                                  updateSiteConfig({
                                    backgroundSettings: {
                                      ...cur,
                                      activePromptId: pr.id,
                                    }
                                  });
                                  showToast(isFa ? 'به عنوان تم اصلی انتخاب شد' : 'Set as primary preset');
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono cursor-pointer transition-colors ${
                                  isPrimary ? 'bg-amber-400 text-black font-bold' : 'bg-white/5 hover:bg-white/10 text-white/60'
                                }`}
                              >
                                {isPrimary ? 'Active' : 'Set Active'}
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => {
                                  setEditingPrompt(pr);
                                  setIsCreatingPrompt(false);
                                }}
                                className="p-2 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                                title={t.common.edit}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => {
                                  if (window.confirm(t.common.confirmDelete)) {
                                    const existing = siteConfig.backgroundPrompts || INITIAL_BACKGROUND_PROMPTS;
                                    const updated = existing.filter(p => p.id !== pr.id);
                                    updateSiteConfig({ backgroundPrompts: updated });
                                    showToast(t.admin.toastDeleted);
                                  }
                                }}
                                className="p-2 text-white/40 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-colors"
                                title={t.common.delete}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: COMMISSION INQUIRIES & MESSAGES */}
              {adminTab === 'inquiries' && (
                <EmailInquiriesTab showToast={showToast} />
              )}

              {/* TAB 5: CONTACT & BANNER SETTINGS */}
              {adminTab === 'settings' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                    <h3 className="text-base font-bold font-mono text-cyan-400 uppercase tracking-wide">
                      {t.admin.settingsTitle}
                    </h3>

                    {/* Announcement Banner */}
                    <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-mono font-bold text-white uppercase">
                            {t.admin.bannerEnabled}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={siteConfig.announcement.enabled}
                          onChange={(e) =>
                            updateSiteConfig({
                              announcement: { ...siteConfig.announcement, enabled: e.target.checked }
                            })
                          }
                          className="w-4 h-4 rounded bg-black/60 border-white/20 text-cyan-500 cursor-pointer"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-white/50 uppercase">{t.admin.bannerTextEn}</label>
                          <input
                            type="text"
                            value={siteConfig.announcement.textEn}
                            onChange={(e) =>
                              updateSiteConfig({
                                announcement: { ...siteConfig.announcement, textEn: e.target.value }
                              })
                            }
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-cyan-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-cyan-400 uppercase">{t.admin.bannerTextFa}</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={siteConfig.announcement.textFa}
                            onChange={(e) =>
                              updateSiteConfig({
                                announcement: { ...siteConfig.announcement, textFa: e.target.value }
                              })
                            }
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-cyan-400 font-fa"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Studio Contact Information */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-white/50 uppercase">{t.admin.phone}</label>
                        <input
                          type="text"
                          value={siteConfig.phone}
                          onChange={(e) => updateSiteConfig({ phone: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-white/50 uppercase">{t.admin.email}</label>
                        <input
                          type="text"
                          value={siteConfig.email}
                          onChange={(e) => updateSiteConfig({ email: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-white/50 uppercase">{t.admin.instagram}</label>
                        <input
                          type="text"
                          value={siteConfig.instagram}
                          onChange={(e) => updateSiteConfig({ instagram: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-white/50 uppercase">{t.admin.telegram}</label>
                        <input
                          type="text"
                          value={siteConfig.telegram || ''}
                          onChange={(e) => updateSiteConfig({ telegram: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                    </div>

                    {/* Admin Access: managed by Firebase Authentication */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-black/60 to-black/80 border border-amber-500/30 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider">
                            {isFa ? 'دسترسی مدیریت' : 'Studio Admin Access'}
                          </h4>
                          <p className="text-[11px] text-white/50 font-mono">
                            {isFa
                              ? 'ورود ادمین با Firebase Authentication انجام می‌شود. برای تغییر رمز، لینک بازیابی به ایمیل شما ارسال می‌شود.'
                              : 'Admin sign-in uses Firebase Authentication. To change your password, a reset link is emailed to you.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs font-mono text-white/60">
                        <span dir="ltr">{auth.currentUser?.email || ''}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            const email = auth.currentUser?.email;
                            if (!email) return;
                            try {
                              await sendAdminPasswordReset(email);
                              showToast(isFa ? 'لینک تغییر رمز به ایمیل شما ارسال شد' : 'Password reset link sent to your email');
                            } catch {
                              showToast(isFa ? 'ارسال لینک ناموفق بود' : 'Could not send reset link');
                            }
                          }}
                          className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>{isFa ? 'تغییر رمز عبور' : 'Change Password'}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        saveSiteConfigToFirestore(siteConfig);
                        showToast(t.admin.toastSaved);
                      }}
                      className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-xs uppercase tracking-widest font-mono cursor-pointer transition-all flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {t.admin.saveSettingsBtn}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: BACKUP & RESTORE */}
              {adminTab === 'backup' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                    <div>
                      <h3 className="text-base font-bold font-mono text-cyan-400 uppercase tracking-wide">
                        {t.admin.backupTitle}
                      </h3>
                      <p className="text-xs text-white/60 font-light mt-1 max-w-xl leading-relaxed">
                        {t.admin.backupDesc}
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      <button
                        onClick={handleDownloadBackup}
                        className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-4 text-left transition-colors cursor-pointer group"
                      >
                        <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
                          <Download className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold font-mono uppercase text-white">
                            {t.admin.downloadBackup}
                          </h4>
                          <p className="text-[11px] text-white/40 font-light mt-0.5">
                            Export artworks, inquiries & settings to .json
                          </p>
                        </div>
                      </button>

                      <div>
                        <input
                          type="file"
                          ref={jsonImportRef}
                          onChange={handleJsonImport}
                          accept=".json"
                          className="hidden"
                        />
                        <button
                          onClick={() => jsonImportRef.current?.click()}
                          className="w-full p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-4 text-left transition-colors cursor-pointer group"
                        >
                          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold font-mono uppercase text-white">
                              {t.admin.restoreBackup}
                            </h4>
                            <p className="text-[11px] text-white/40 font-light mt-0.5">
                              {t.admin.restoreWarning}
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Factory Reset Area */}
                    <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-rose-400 font-mono uppercase">
                          {t.admin.factoryReset}
                        </h4>
                        <p className="text-xs text-white/40 font-light mt-0.5">
                          Restore initial dataset and clear custom changes.
                        </p>
                      </div>
                      <button
                        onClick={handleFactoryReset}
                        className="px-6 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono uppercase tracking-widest cursor-pointer transition-colors"
                      >
                        {t.admin.factoryReset}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Preview Before Publish Full Modal */}
      <PublishPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onConfirmPublish={handleConfirmPublish}
        payload={previewDraft}
      />
    </div>
  );
};
