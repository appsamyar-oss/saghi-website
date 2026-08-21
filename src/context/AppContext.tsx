import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Language, 
  Artwork, 
  CategoryItem, 
  SiteConfig, 
  CommissionInquiry,
  AdminTab,
  PageView
} from '../types';
import { 
  INITIAL_ARTWORKS, 
  INITIAL_CATEGORIES, 
  INITIAL_SITE_CONFIG, 
  INITIAL_INQUIRIES,
  INITIAL_BACKGROUND_PROMPTS,
  INITIAL_BACKGROUND_SETTINGS
} from '../data/initialData';

import { TRANSLATIONS } from '../data/translations';

interface AppContextType {
  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof TRANSLATIONS.en;
  dir: 'ltr' | 'rtl';
  isFa: boolean;
  getLocalized: (enVal?: string, faVal?: string) => string;

  // View Routing
  activeView: PageView;
  setActiveView: (view: PageView) => void;

  // Artworks Management
  artworks: Artwork[];
  addArtwork: (artwork: Omit<Artwork, 'id'>) => Artwork;
  updateArtwork: (id: string, updated: Partial<Artwork>) => void;
  deleteArtwork: (id: string) => void;
  getArtworkById: (id: string) => Artwork | undefined;
  
  // Categories Management
  categories: CategoryItem[];
  addCategory: (cat: CategoryItem) => void;
  updateCategory: (id: string, cat: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;

  // Site Configuration & Stories
  siteConfig: SiteConfig;
  updateSiteConfig: (config: Partial<SiteConfig>) => void;

  // Inquiries / Commissions
  inquiries: CommissionInquiry[];
  addInquiry: (inquiry: Omit<CommissionInquiry, 'id' | 'createdAt' | 'status'>) => void;
  updateInquiryStatus: (id: string, status: CommissionInquiry['status'], notes?: string) => void;
  deleteInquiry: (id: string) => void;

  // Admin Access & Controls
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  isAuthenticated: boolean;
  loginAdmin: (user?: any) => boolean;
  logoutAdmin: () => void;

  // Backup & Reset
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonString: string) => boolean;
  resetToFactoryDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LANG: 'saghi_atelier_lang',
  ARTWORKS: 'saghi_atelier_artworks',
  CATEGORIES: 'saghi_atelier_categories',
  CONFIG: 'saghi_atelier_config',
  INQUIRIES: 'saghi_atelier_inquiries',
  AUTH: 'saghi_atelier_auth',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Language State
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG);
      if (saved === 'fa' || saved === 'en') return saved;
    } catch (e) {
      // Ignore error in restricted env
    }
    return 'fa'; // Default to Persian as requested, or can toggle to English easily
  });

  // 2. View Router State
  const [activeView, setActiveView] = useState<PageView>('home');

  // 3. Artworks State
  const [artworks, setArtworks] = useState<Artwork[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ARTWORKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Fallback
    }
    return INITIAL_ARTWORKS;
  });

  // 4. Categories State
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Fallback
    }
    return INITIAL_CATEGORIES;
  });

  // 5. Site Config State
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SITE_CONFIG,
          ...parsed,
          backgroundPrompts: parsed.backgroundPrompts || INITIAL_BACKGROUND_PROMPTS,
          backgroundSettings: parsed.backgroundSettings || INITIAL_BACKGROUND_SETTINGS,
        };
      }
    } catch (e) {
      // Fallback
    }
    return INITIAL_SITE_CONFIG;
  });


  // 6. Inquiries State
  const [inquiries, setInquiries] = useState<CommissionInquiry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Fallback
    }
    return INITIAL_INQUIRIES;
  });

  // 7. Admin UI & Auth State
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('artworks');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
    } catch (e) {
      return false;
    }
  });

  // Synchronize HTML attributes with active language
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, language);
    } catch (e) {
      // Ignore
    }
  }, [language]);

  // Persist Artworks
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ARTWORKS, JSON.stringify(artworks));
    } catch (e) {
      // Ignore
    }
  }, [artworks]);

  // Persist Categories
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      // Ignore
    }
  }, [categories]);

  // Persist Site Config
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(siteConfig));
    } catch (e) {
      // Ignore
    }
  }, [siteConfig]);

  // Persist Inquiries
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    } catch (e) {
      // Ignore
    }
  }, [inquiries]);

  // Language switcher
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const isFa = language === 'fa';
  const dir = isFa ? 'rtl' : 'ltr';
  const t = TRANSLATIONS[language];

  // Helper to get localized string with fallback
  const getLocalized = (enVal?: string, faVal?: string): string => {
    if (isFa && faVal && faVal.trim() !== '') return faVal;
    if (enVal && enVal.trim() !== '') return enVal;
    if (faVal && faVal.trim() !== '') return faVal;
    return '';
  };

  // Artworks CRUD
  const addArtwork = (artworkData: Omit<Artwork, 'id'>): Artwork => {
    const newId = `sa-${Date.now()}`;
    const newArtwork: Artwork = {
      ...artworkData,
      id: newId,
    };
    setArtworks((prev) => [newArtwork, ...prev]);
    return newArtwork;
  };

  const updateArtwork = (id: string, updated: Partial<Artwork>) => {
    setArtworks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const deleteArtwork = (id: string) => {
    setArtworks((prev) => prev.filter((item) => item.id !== id));
  };

  const getArtworkById = (id: string) => {
    return artworks.find((a) => a.id === id);
  };

  // Categories CRUD
  const addCategory = (cat: CategoryItem) => {
    setCategories((prev) => [...prev, cat]);
  };

  const updateCategory = (id: string, cat: Partial<CategoryItem>) => {
    setCategories((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...cat } : item))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Site Config
  const updateSiteConfig = (newConfig: Partial<SiteConfig>) => {
    setSiteConfig((prev) => ({
      ...prev,
      ...newConfig,
    }));
  };

  // Inquiries
  const addInquiry = (inquiryData: Omit<CommissionInquiry, 'id' | 'createdAt' | 'status'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newInquiry: CommissionInquiry = {
      ...inquiryData,
      id: `inq-${Date.now()}`,
      createdAt: formattedDate,
      status: 'new',
    };
    setInquiries((prev) => [newInquiry, ...prev]);
  };

  const updateInquiryStatus = (id: string, status: CommissionInquiry['status'], notes?: string) => {
    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === id
          ? {
              ...inq,
              status,
              adminNotes: notes !== undefined ? notes : inq.adminNotes,
            }
          : inq
      )
    );
  };

  const deleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
  };

  // Admin Auth
  const loginAdmin = (user?: any): boolean => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    } catch (e) {}
    return true;
  };

  const logoutAdmin = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch (e) {}
  };

  // Export JSON Database
  const exportDatabaseJson = (): string => {
    const data = {
      exportVersion: '2.0',
      exportedAt: new Date().toISOString(),
      artworks,
      categories,
      siteConfig,
      inquiries,
    };
    return JSON.stringify(data, null, 2);
  };

  // Import JSON Database
  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.artworks && Array.isArray(parsed.artworks)) {
        setArtworks(parsed.artworks);
      }
      if (parsed.categories && Array.isArray(parsed.categories)) {
        setCategories(parsed.categories);
      }
      if (parsed.siteConfig && typeof parsed.siteConfig === 'object') {
        setSiteConfig(parsed.siteConfig);
      }
      if (parsed.inquiries && Array.isArray(parsed.inquiries)) {
        setInquiries(parsed.inquiries);
      }
      return true;
    } catch (err) {
      console.error('Failed to import JSON backup', err);
      return false;
    }
  };

  // Factory Reset
  const resetToFactoryDefaults = () => {
    setArtworks(INITIAL_ARTWORKS);
    setCategories(INITIAL_CATEGORIES);
    setSiteConfig(INITIAL_SITE_CONFIG);
    setInquiries(INITIAL_INQUIRIES);
    try {
      localStorage.removeItem(STORAGE_KEYS.ARTWORKS);
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.CONFIG);
      localStorage.removeItem(STORAGE_KEYS.INQUIRIES);
    } catch (e) {}
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        dir,
        isFa,
        getLocalized,
        activeView,
        setActiveView,
        artworks,
        addArtwork,
        updateArtwork,
        deleteArtwork,
        getArtworkById,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        siteConfig,
        updateSiteConfig,
        inquiries,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
        isAdminOpen,
        setIsAdminOpen,
        adminTab,
        setAdminTab,
        isAuthenticated,
        loginAdmin,
        logoutAdmin,
        exportDatabaseJson,
        importDatabaseJson,
        resetToFactoryDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
