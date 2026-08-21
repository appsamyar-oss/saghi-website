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
  CheckCircle2, 
  PhoneCall, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Palette,
  Copy,
  SlidersHorizontal,
  CheckCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Artwork, AdminTab, CategoryItem, CommissionInquiry, BackgroundPrompt, BackgroundSettings } from '../../types';
import { INITIAL_BACKGROUND_PROMPTS, INITIAL_BACKGROUND_SETTINGS } from '../../data/initialData';
import { AuthScreen } from '../auth/AuthScreen';
import { SaghiEmblemLogo } from '../SaghiEmblemLogo';


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
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);
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

  // Inquiry Filter & Notes State
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'new' | 'in_review' | 'contacted' | 'completed'>('all');
  const [selectedInquiryNotes, setSelectedInquiryNotes] = useState<{ [id: string]: string }>({});

  // Branding Logo Upload Refs
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const darkLogoFileInputRef = useRef<HTMLInputElement>(null);

  // Background Prompt Editor State
  const [editingPrompt, setEditingPrompt] = useState<BackgroundPrompt | null>(null);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const bgTextureInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(passcode)) {
      setAuthError(false);
      setPasscode('');
      showToast(isFa ? 'ورود با موفقیت انجام شد' : 'Authenticated successfully');
    } else {
      setAuthError(true);
    }
  };

  const handleInstantDemoLogin = () => {
    loginAdmin('1234');
    setAuthError(false);
    showToast(isFa ? 'ورود به حالت دمو انجام شد' : 'Demo access granted');
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

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    if (inquiryFilter === 'all') return true;
    return inq.status === inquiryFilter;
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

          <div className="flex items-center gap-3">
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
                        <div className="md:col-span-8 space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs font-mono text-white/50 uppercase">
                              {t.admin.fieldImageUrl}
                            </label>
                            <input
                              type="text"
                              value={editingArtwork?.imageUrl || ''}
                              onChange={(e) =>
                                setEditingArtwork(prev => prev ? { ...prev, imageUrl: e.target.value } : null)
                              }
                              placeholder="https://images.unsplash.com/..."
                              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                            />
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-mono text-white/50 uppercase">
                                {t.admin.fieldTitleEn} *
                              </label>
                              <input
                                type="text"
                                required
                                value={editingArtwork?.title || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, title: e.target.value } : null)
                                }
                                placeholder="Minimalist Oil on Linen / Cubist Composition"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-mono text-cyan-400 uppercase">
                                {t.admin.fieldTitleFa} *
                              </label>
                              <input
                                type="text"
                                dir="rtl"
                                value={editingArtwork?.titleFa || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, titleFa: e.target.value } : null)
                                }
                                placeholder="نقاشی مینیمال / کوبیسم معاصر"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-fa"
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-mono text-white/50 uppercase">
                                {t.admin.fieldSubtitleEn}
                              </label>
                              <input
                                type="text"
                                value={editingArtwork?.subtitle || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, subtitle: e.target.value } : null)
                                }
                                placeholder="Oil on Belgian Linen / Persian Tar Solo"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-mono text-cyan-400 uppercase">
                                {t.admin.fieldSubtitleFa}
                              </label>
                              <input
                                type="text"
                                dir="rtl"
                                value={editingArtwork?.subtitleFa || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, subtitleFa: e.target.value } : null)
                                }
                                placeholder="رنگ‌روغن روی بوم کتان / تکنوازی تار ایرانی"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-fa"
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-mono text-white/50 uppercase">
                                {t.admin.fieldCategory}
                              </label>
                              <select
                                value={editingArtwork?.category || 'minimalism'}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, category: e.target.value } : null)
                                }
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                              >
                                {categories.filter(c => c.id !== 'all').map((cat) => (
                                  <option key={cat.id} value={cat.id}>
                                    {isFa ? cat.labelFa : cat.labelEn}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-mono text-white/50 uppercase">
                                {t.admin.fieldYear}
                              </label>
                              <input
                                type="text"
                                value={editingArtwork?.year || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, year: e.target.value } : null)
                                }
                                placeholder="2026"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-mono text-white/50 uppercase">
                                {t.admin.fieldDimensions}
                              </label>
                              <input
                                type="text"
                                value={editingArtwork?.dimensions || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, dimensions: e.target.value } : null)
                                }
                                placeholder="120 × 90 cm"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-mono text-white/50 uppercase">
                                {t.admin.fieldArtistEn}
                              </label>
                              <input
                                type="text"
                                value={editingArtwork?.artist || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, artist: e.target.value } : null)
                                }
                                placeholder="Saghi Abyar"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-mono text-cyan-400 uppercase">
                                {t.admin.fieldArtistFa}
                              </label>
                              <input
                                type="text"
                                dir="rtl"
                                value={editingArtwork?.artistFa || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, artistFa: e.target.value } : null)
                                }
                                placeholder="ساقی آبیار"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-fa"
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-mono text-white/50 uppercase">
                                {t.admin.fieldMediumEn}
                              </label>
                              <input
                                type="text"
                                value={editingArtwork?.medium || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, medium: e.target.value } : null)
                                }
                                placeholder="Oil & Pigments on Belgian Linen"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-mono text-cyan-400 uppercase">
                                {t.admin.fieldMediumFa}
                              </label>
                              <input
                                type="text"
                                dir="rtl"
                                value={editingArtwork?.mediumFa || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, mediumFa: e.target.value } : null)
                                }
                                placeholder="رنگ‌روغن، کاردک و رنگدانه‌ها روی بوم کتان"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-fa"
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-mono text-white/50 uppercase">
                                {t.admin.fieldOriginEn}
                              </label>
                              <input
                                type="text"
                                value={editingArtwork?.culturalOrigin || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, culturalOrigin: e.target.value } : null)
                                }
                                placeholder="Isfahan & Shiraz Classical School"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-mono text-cyan-400 uppercase">
                                {t.admin.fieldOriginFa}
                              </label>
                              <input
                                type="text"
                                dir="rtl"
                                value={editingArtwork?.culturalOriginFa || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, culturalOriginFa: e.target.value } : null)
                                }
                                placeholder="مکتب کلاسیک اصفهان و شیراز"
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-fa"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-mono text-white/50 uppercase">
                              {t.admin.fieldTags}
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
                              placeholder="Nastaliq, Tazhib, Gold Leaf, Persian"
                              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                            />
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-mono text-white/50 uppercase">
                                {t.admin.fieldDescEn}
                              </label>
                              <textarea
                                rows={3}
                                value={editingArtwork?.description || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, description: e.target.value } : null)
                                }
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-mono text-cyan-400 uppercase">
                                {t.admin.fieldDescFa}
                              </label>
                              <textarea
                                rows={3}
                                dir="rtl"
                                value={editingArtwork?.descriptionFa || ''}
                                onChange={(e) =>
                                  setEditingArtwork(prev => prev ? { ...prev, descriptionFa: e.target.value } : null)
                                }
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-fa"
                              />
                            </div>
                          </div>

                          {/* Featured Toggle */}
                          <div className="flex items-center gap-3 pt-2">
                            <input
                              type="checkbox"
                              id="featuredToggle"
                              checked={editingArtwork?.featured || false}
                              onChange={(e) =>
                                setEditingArtwork(prev => prev ? { ...prev, featured: e.target.checked } : null)
                              }
                              className="w-4 h-4 rounded bg-black/60 border-white/20 text-cyan-500 focus:ring-0 cursor-pointer"
                            />
                            <label htmlFor="featuredToggle" className="text-xs text-white/80 font-mono cursor-pointer flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-amber-400" />
                              {t.admin.fieldFeatured}
                            </label>
                          </div>

                          {/* Save / Submit Button */}
                          <div className="pt-4 flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (!editingArtwork) return;
                                if (!editingArtwork.title) {
                                  alert('Title is required');
                                  return;
                                }
                                if (isCreatingArtwork) {
                                  addArtwork(editingArtwork);
                                  showToast(isFa ? 'اثر جدید با موفقیت اضافه شد' : 'Artwork added successfully');
                                } else {
                                  updateArtwork(editingArtwork.id, editingArtwork);
                                  showToast(isFa ? 'تغییرات اثر ذخیره گردید' : 'Artwork updated successfully');
                                }
                                setEditingArtwork(null);
                                setIsCreatingArtwork(false);
                              }}
                              className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-xs uppercase tracking-widest font-mono transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                            >
                              <Save className="w-4 h-4" />
                              {t.admin.saveArtworkBtn}
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
                    <h3 className="text-base font-bold font-mono text-cyan-400 uppercase tracking-wide">
                      {t.admin.contentTitle}
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-white/50 uppercase">{t.admin.heroHeadlineEn}</label>
                        <input
                          type="text"
                          value={siteConfig.heroHeadlineEn}
                          onChange={(e) => updateSiteConfig({ heroHeadlineEn: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-cyan-400 uppercase">{t.admin.heroHeadlineFa}</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={siteConfig.heroHeadlineFa}
                          onChange={(e) => updateSiteConfig({ heroHeadlineFa: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-fa"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-white/50 uppercase">{t.admin.heroSubtitleEn}</label>
                        <input
                          type="text"
                          value={siteConfig.heroSubtitleEn}
                          onChange={(e) => updateSiteConfig({ heroSubtitleEn: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-cyan-400 uppercase">{t.admin.heroSubtitleFa}</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={siteConfig.heroSubtitleFa}
                          onChange={(e) => updateSiteConfig({ heroSubtitleFa: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-fa"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-white/50 uppercase">{t.admin.aboutQuoteEn}</label>
                        <input
                          type="text"
                          value={siteConfig.quoteEn}
                          onChange={(e) => updateSiteConfig({ quoteEn: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-cyan-400 uppercase">{t.admin.aboutQuoteFa}</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={siteConfig.quoteFa}
                          onChange={(e) => updateSiteConfig({ quoteFa: e.target.value })}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 outline-none font-fa"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => showToast(t.admin.toastSaved)}
                        className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-xs uppercase tracking-widest font-mono cursor-pointer transition-all flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {t.admin.saveContentBtn}
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
                <div className="space-y-6">
                  {/* Status Filter Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {(['all', 'new', 'in_review', 'contacted', 'completed'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setInquiryFilter(st)}
                        className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                          inquiryFilter === st
                            ? 'bg-white text-black font-bold'
                            : 'bg-white/5 text-white/60 hover:text-white'
                        }`}
                      >
                        {st === 'all' ? 'All Inquiries' : t.admin[`inquiry${st.charAt(0).toUpperCase() + st.slice(1).replace('_', '')}` as keyof typeof t.admin] || st}
                        <span className="ml-2 px-1.5 py-0.2 rounded-full bg-white/10 text-[10px]">
                          {st === 'all' ? inquiries.length : inquiries.filter(i => i.status === st).length}
                        </span>
                      </button>
                    ))}
                  </div>

                  {filteredInquiries.length === 0 ? (
                    <div className="p-12 text-center text-white/40 font-light border border-dashed border-white/10 rounded-3xl">
                      {t.admin.noInquiries}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredInquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 relative overflow-hidden"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                            <div>
                              <span className="text-xs font-mono text-cyan-400">{inq.createdAt}</span>
                              <h4 className="text-base font-bold text-white mt-0.5">{inq.name}</h4>
                            </div>

                            <div className="flex items-center gap-3">
                              <select
                                value={inq.status}
                                onChange={(e) => {
                                  updateInquiryStatus(inq.id, e.target.value as CommissionInquiry['status']);
                                  showToast(isFa ? 'وضعیت سفارش بروزرسانی شد' : 'Status updated');
                                }}
                                className="bg-black/60 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono outline-none"
                              >
                                <option value="new">{t.admin.inquiryNew}</option>
                                <option value="in_review">{t.admin.inquiryReviewed}</option>
                                <option value="contacted">{t.admin.inquiryContacted}</option>
                                <option value="completed">{t.admin.inquiryCompleted}</option>
                                <option value="archived">{t.admin.inquiryArchived}</option>
                              </select>

                              <button
                                onClick={() => {
                                  if (window.confirm(t.common.confirmDelete)) {
                                    deleteInquiry(inq.id);
                                    showToast(t.admin.toastDeleted);
                                  }
                                }}
                                className="p-2 text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                                title={t.admin.inquiryDelete}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Contact Info & Interest */}
                          <div className="grid sm:grid-cols-3 gap-3 text-xs">
                            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                              <span className="text-white/40 font-mono uppercase text-[10px]">Email</span>
                              <p className="font-mono text-white/90 truncate">
                                <a href={`mailto:${inq.email}`} className="hover:text-cyan-400">
                                  {inq.email}
                                </a>
                              </p>
                            </div>
                            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                              <span className="text-white/40 font-mono uppercase text-[10px]">Phone</span>
                              <p className="font-mono text-white/90">
                                {inq.phone ? (
                                  <a href={`tel:${inq.phone}`} className="hover:text-cyan-400">
                                    {inq.phone}
                                  </a>
                                ) : 'Not provided'}
                              </p>
                            </div>
                            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                              <span className="text-white/40 font-mono uppercase text-[10px]">Dimensions</span>
                              <p className="text-white/90">{inq.dimensions || 'Bespoke'}</p>
                            </div>
                          </div>

                          {/* Interest Category */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                              {t.admin.inquiryInterest}
                            </span>
                            <p className="text-sm font-semibold text-white/90">{inq.interest}</p>
                          </div>

                          {/* Client Message */}
                          <div className="p-4 rounded-2xl bg-black/60 border border-white/5 space-y-1">
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
                              {t.admin.inquiryMessage}
                            </span>
                            <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap font-light">
                              {inq.message}
                            </p>
                          </div>

                          {/* Studio Internal Notes */}
                          <div className="space-y-2 pt-2">
                            <label className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block">
                              {t.admin.inquiryNotes}
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={selectedInquiryNotes[inq.id] !== undefined ? selectedInquiryNotes[inq.id] : (inq.adminNotes || '')}
                                onChange={(e) => setSelectedInquiryNotes({ ...selectedInquiryNotes, [inq.id]: e.target.value })}
                                placeholder="Add notes (e.g. Sent sample pigments, meeting scheduled...)"
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-amber-400"
                              />
                              <button
                                onClick={() => {
                                  const note = selectedInquiryNotes[inq.id] !== undefined ? selectedInquiryNotes[inq.id] : (inq.adminNotes || '');
                                  updateInquiryStatus(inq.id, inq.status, note);
                                  showToast(isFa ? 'یادداشت ذخیره شد' : 'Notes saved');
                                }}
                                className="px-4 py-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-mono cursor-pointer transition-colors"
                              >
                                {t.common.save}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

                    <button
                      onClick={() => showToast(t.admin.toastSaved)}
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
    </div>
  );
};
