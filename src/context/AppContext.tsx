import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Language, 
  Artwork, 
  CategoryItem, 
  SiteConfig, 
  CommissionInquiry,
  ThreadMessage,
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
import { dispatchInquiryEmail, sendAdminReply, syncInboundEmails, simulateInboundEmail } from '../utils/emailApi';
import {
  saveInquiryToFirestore,
  fetchInquiriesFromFirestore,
  deleteInquiryFromFirestore,
  fetchPublicContent,
  saveArtworkToFirestore,
  deleteArtworkFromFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  publishAllContent,
  saveSiteConfigToFirestore,
  onAdminAuthChange,
  signOutAdmin,
} from '../firebase';

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

  // Inquiries & Email Conversation Threads
  inquiries: CommissionInquiry[];
  addInquiry: (inquiry: Omit<CommissionInquiry, 'id' | 'createdAt' | 'status'>) => Promise<CommissionInquiry>;
  updateInquiryStatus: (id: string, status: CommissionInquiry['status'], notes?: string) => void;
  replyToInquiry: (id: string, subject: string, replyText: string) => Promise<{ success: boolean; error?: string }>;
  deleteInquiry: (id: string) => void;
  addInquiryTag: (inquiryId: string, tag: string) => void;
  removeInquiryTag: (inquiryId: string, tag: string) => void;
  addMessageTag: (inquiryId: string, messageId: string, tag: string) => void;
  removeMessageTag: (inquiryId: string, messageId: string, tag: string) => void;
  appendInboundMessage: (inquiryId: string, message: ThreadMessage) => void;
  syncInboundResendEmails: () => Promise<{ success: boolean; count: number; message?: string }>;
  simulateCollectorReply: (inquiryId: string, customMessage?: string) => Promise<{ success: boolean; message?: string }>;

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

const APP_RELEASE_VERSION = 'saghi_atelier_v2026_08_24_update';

const STORAGE_KEYS = {
  VERSION: 'saghi_atelier_app_version',
  LANG: 'saghi_atelier_lang',
  ARTWORKS: 'saghi_atelier_artworks',
  CATEGORIES: 'saghi_atelier_categories',
  CONFIG: 'saghi_atelier_config',
  INQUIRIES: 'saghi_atelier_inquiries',
  AUTH: 'saghi_atelier_auth',
};

// Automatic Cache Busting: If new version is released, refresh stale stored artworks and config
try {
  const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
  if (currentVersion !== APP_RELEASE_VERSION) {
    localStorage.removeItem(STORAGE_KEYS.ARTWORKS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.setItem(STORAGE_KEYS.VERSION, APP_RELEASE_VERSION);
  }
} catch (e) {
  // Ignore in SSR/restricted environments
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Language State
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG);
      if (saved === 'fa' || saved === 'en') return saved;
    } catch (e) {
      // Ignore error in restricted env
    }
    return 'en'; // Default to English as requested
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
  // Admin access comes only from a verified Firebase Auth session (see firebase.ts)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [remoteContentLoaded, setRemoteContentLoaded] = useState<boolean>(false);
  const [remoteHasArtworks, setRemoteHasArtworks] = useState<boolean>(false);
  const [remoteFetchOk, setRemoteFetchOk] = useState<boolean>(false);

  // Remove the legacy client-side auth flag that let anyone open the admin panel
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch (e) {}
  }, []);

  // Load published content from Firestore so every visitor sees the admin's changes
  useEffect(() => {
    let cancelled = false;
    fetchPublicContent()
      .then((content) => {
        if (cancelled) return;
        setRemoteFetchOk(true);
        if (content.artworks.length > 0) {
          setArtworks(content.artworks as Artwork[]);
          setRemoteHasArtworks(true);
        }
        if (content.categories.length > 0) {
          setCategories(content.categories as CategoryItem[]);
        }
        if (content.siteConfig) {
          const { adminCredentials: _legacy, updatedAt: _u, ...remoteConfig } = content.siteConfig;
          setSiteConfig((prev) => ({ ...prev, ...remoteConfig }));
        }
      })
      .catch((err) => console.warn('[AppContext] Could not load published content:', err))
      .finally(() => {
        if (!cancelled) setRemoteContentLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Track the Firebase admin session
  useEffect(() => onAdminAuthChange((user) => setIsAuthenticated(Boolean(user))), []);

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

  // When the admin signs in: load every inquiry from Firestore, and if the
  // database has no artworks yet, publish what the admin currently sees.
  useEffect(() => {
    if (!isAuthenticated || !remoteContentLoaded) return;
    let cancelled = false;
    fetchInquiriesFromFirestore().then((remote) => {
      if (cancelled || remote.length === 0) return;
      setInquiries((prev) => {
        const byId = new Map<string, CommissionInquiry>();
        prev.forEach((inq) => byId.set(inq.id, inq));
        remote.forEach((inq: CommissionInquiry) => byId.set(inq.id, { ...byId.get(inq.id), ...inq }));
        return Array.from(byId.values()).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      });
    });
    // Only seed when we know for sure the database is empty (never after a failed read)
    if (remoteFetchOk && !remoteHasArtworks) {
      publishAllContent(artworks, categories).then((ok) => {
        if (ok && !cancelled) setRemoteHasArtworks(true);
      });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, remoteContentLoaded]);

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
    setArtworks((prev) => {
      const minOrder = prev.reduce((min, a) => Math.min(min, typeof a.sortOrder === 'number' ? a.sortOrder : 0), 0);
      const withOrder = { ...newArtwork, sortOrder: minOrder - 1 };
      if (isAuthenticated) saveArtworkToFirestore(withOrder);
      return [withOrder, ...prev];
    });
    return newArtwork;
  };

  const updateArtwork = (id: string, updated: Partial<Artwork>) => {
    setArtworks((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...updated };
        if (isAuthenticated) saveArtworkToFirestore(next);
        return next;
      })
    );
  };

  const deleteArtwork = (id: string) => {
    setArtworks((prev) => prev.filter((item) => item.id !== id));
    if (isAuthenticated) deleteArtworkFromFirestore(id);
  };

  const getArtworkById = (id: string) => {
    return artworks.find((a) => a.id === id);
  };

  // Categories CRUD
  const addCategory = (cat: CategoryItem) => {
    setCategories((prev) => {
      const withOrder = { ...cat, sortOrder: prev.length };
      if (isAuthenticated) saveCategoryToFirestore(withOrder);
      return [...prev, withOrder];
    });
  };

  const updateCategory = (id: string, cat: Partial<CategoryItem>) => {
    setCategories((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...cat };
        if (isAuthenticated) saveCategoryToFirestore(next);
        return next;
      })
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (isAuthenticated) deleteCategoryFromFirestore(id);
  };

  // Site Config
  const updateSiteConfig = (newConfig: Partial<SiteConfig>) => {
    setSiteConfig((prev) => ({
      ...prev,
      ...newConfig,
    }));
    if (isAuthenticated) saveSiteConfigToFirestore(newConfig);
  };

  // Inquiries
  const addInquiry = async (inquiryData: Omit<CommissionInquiry, 'id' | 'createdAt' | 'status'>): Promise<CommissionInquiry> => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newId = `inq-${Date.now()}`;

    const initialMessage: ThreadMessage = {
      id: `msg-${Date.now()}-init`,
      senderType: 'user',
      senderName: inquiryData.name,
      senderEmail: inquiryData.email,
      recipientEmail: 'contact@saghiabyar.com',
      subject: `Inquiry: ${inquiryData.interest || inquiryData.artworkTitle || 'Studio Art & Music'}`,
      message: inquiryData.message,
      createdAt: formattedDate,
      status: 'received',
      tags: ['Initial Inquiry'],
    };

    const newInquiry: CommissionInquiry = {
      ...inquiryData,
      id: newId,
      createdAt: formattedDate,
      status: 'new',
      emailDeliveryStatus: 'simulated',
      tags: ['New Inquiry'],
      messages: [initialMessage],
    };

    // 1. Immediately store in local state for rapid UI feedback
    setInquiries((prev) => [newInquiry, ...prev]);

    // Save to Firestore
    saveInquiryToFirestore(newInquiry).catch(() => {});

    // 2. Dispatch live automated double-email (User Confirmation + Admin Notification) via serverless Resend API
    try {
      const emailResult = await dispatchInquiryEmail({
        name: newInquiry.name,
        email: newInquiry.email,
        phone: newInquiry.phone,
        inquiryType: newInquiry.inquiryType,
        artworkTitle: newInquiry.artworkTitle,
        dimensions: newInquiry.dimensions,
        interest: newInquiry.interest,
        message: newInquiry.message,
        inquiryId: newInquiry.id,
      });

      // Update inquiry status with actual delivery result
      setInquiries((prev) =>
        prev.map((item) => {
          if (item.id === newInquiry.id) {
            const updated = {
              ...item,
              emailDeliveryStatus: emailResult.success ? (emailResult.mode === 'live' ? 'sent' : 'simulated') : 'failed',
              userEmailSent: emailResult.userEmailSent,
              adminEmailSent: emailResult.adminEmailSent,
            };
            // Visitors may only create inquiries; status updates are admin-only
            if (isAuthenticated) saveInquiryToFirestore(updated).catch(() => {});
            return updated;
          }
          return item;
        })
      );
    } catch (err) {
      console.warn('[AppContext] Background email dispatch caught:', err);
    }

    return newInquiry;
  };

  const updateInquiryStatus = (id: string, status: CommissionInquiry['status'], notes?: string) => {
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id === id) {
          const updated = {
            ...inq,
            status,
            adminNotes: notes !== undefined ? notes : inq.adminNotes,
          };
          saveInquiryToFirestore(updated).catch(() => {});
          return updated;
        }
        return inq;
      })
    );
  };

  const replyToInquiry = async (id: string, subject: string, replyText: string): Promise<{ success: boolean; error?: string }> => {
    const target = inquiries.find((inq) => inq.id === id);
    if (!target) {
      return { success: false, error: 'Inquiry not found' };
    }

    try {
      const result = await sendAdminReply({
        toEmail: target.email,
        toName: target.name,
        subject,
        message: replyText,
        originalMessage: target.message,
        inquiryId: target.id,
      });

      if (result.success) {
        const now = new Date().toISOString();
        const newReplyMessage: ThreadMessage = {
          id: `msg-reply-${Date.now()}`,
          senderType: 'admin',
          senderName: 'Saghi Abyar Studio',
          senderEmail: 'contact@saghiabyar.com',
          recipientEmail: target.email,
          subject,
          message: replyText,
          createdAt: now,
          status: result.mode === 'live' ? 'sent' : 'simulated',
          tags: ['Admin Reply', 'Official Studio'],
          emailId: result.emailId,
        };

        setInquiries((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              const currentMessages = Array.isArray(item.messages) && item.messages.length > 0
                ? item.messages
                : [
                    {
                      id: `msg-${Date.now()}-orig`,
                      senderType: 'user' as const,
                      senderName: item.name,
                      senderEmail: item.email,
                      recipientEmail: 'contact@saghiabyar.com',
                      subject: item.interest || item.artworkTitle || 'Studio Inquiry',
                      message: item.message,
                      createdAt: item.createdAt,
                      status: 'received' as const,
                      tags: ['Initial Inquiry'],
                    }
                  ];

              const updated: CommissionInquiry = {
                ...item,
                status: 'contacted',
                repliedAt: now,
                replySubject: subject,
                replyMessage: replyText,
                messages: [...currentMessages, newReplyMessage],
              };
              saveInquiryToFirestore(updated).catch(() => {});
              return updated;
            }
            return item;
          })
        );
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to send reply' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error executing email reply' };
    }
  };

  const deleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    deleteInquiryFromFirestore(id).catch(() => {});
  };

  // Tag Management for Thread
  const addInquiryTag = (inquiryId: string, tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id === inquiryId) {
          const currentTags = inq.tags || [];
          if (currentTags.includes(trimmed)) return inq;
          const updated = {
            ...inq,
            tags: [...currentTags, trimmed],
          };
          saveInquiryToFirestore(updated).catch(() => {});
          return updated;
        }
        return inq;
      })
    );
  };

  const removeInquiryTag = (inquiryId: string, tag: string) => {
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id === inquiryId) {
          const updated = {
            ...inq,
            tags: (inq.tags || []).filter((t) => t !== tag),
          };
          saveInquiryToFirestore(updated).catch(() => {});
          return updated;
        }
        return inq;
      })
    );
  };

  // Tag Management for Individual Messages in a Thread
  const addMessageTag = (inquiryId: string, messageId: string, tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id === inquiryId && Array.isArray(inq.messages)) {
          const updatedMessages = inq.messages.map((msg) => {
            if (msg.id === messageId) {
              const currentTags = msg.tags || [];
              if (currentTags.includes(trimmed)) return msg;
              return { ...msg, tags: [...currentTags, trimmed] };
            }
            return msg;
          });
          const updated = { ...inq, messages: updatedMessages };
          saveInquiryToFirestore(updated).catch(() => {});
          return updated;
        }
        return inq;
      })
    );
  };

  const removeMessageTag = (inquiryId: string, messageId: string, tag: string) => {
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id === inquiryId && Array.isArray(inq.messages)) {
          const updatedMessages = inq.messages.map((msg) => {
            if (msg.id === messageId) {
              return { ...msg, tags: (msg.tags || []).filter((t) => t !== tag) };
            }
            return msg;
          });
          const updated = { ...inq, messages: updatedMessages };
          saveInquiryToFirestore(updated).catch(() => {});
          return updated;
        }
        return inq;
      })
    );
  };

  // Append Inbound Message to Thread
  const appendInboundMessage = (inquiryId: string, message: ThreadMessage) => {
    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id === inquiryId) {
          const currentMessages = Array.isArray(inq.messages) && inq.messages.length > 0
            ? inq.messages
            : [
                {
                  id: `msg-${Date.now()}-orig`,
                  senderType: 'user' as const,
                  senderName: inq.name,
                  senderEmail: inq.email,
                  recipientEmail: 'contact@saghiabyar.com',
                  subject: inq.interest || inq.artworkTitle || 'Studio Inquiry',
                  message: inq.message,
                  createdAt: inq.createdAt,
                  status: 'received' as const,
                  tags: ['Initial Inquiry'],
                }
              ];
          const updated: CommissionInquiry = {
            ...inq,
            status: 'in_review',
            messages: [...currentMessages, message],
          };
          saveInquiryToFirestore(updated).catch(() => {});
          return updated;
        }
        return inq;
      })
    );
  };

  // Sync Inbound Emails from Resend Receiving API
  const syncInboundResendEmails = async (): Promise<{ success: boolean; count: number; message?: string }> => {
    try {
      const res = await syncInboundEmails();
      if (res.success && Array.isArray(res.emails) && res.emails.length > 0) {
        let syncedCount = 0;
        for (const raw of res.emails) {
          const senderEmail = typeof raw.from === 'string' ? raw.from : raw.from?.email;
          const subject = raw.subject || '';
          
          // Match thread by email or subject
          const matchedInquiry = inquiries.find(
            (inq) => (senderEmail && inq.email.toLowerCase() === senderEmail.toLowerCase()) ||
                     (inq.id && subject.includes(inq.id))
          );

          if (matchedInquiry) {
            const newMsg: ThreadMessage = {
              id: `msg-inb-${raw.id || Date.now()}`,
              senderType: 'user',
              senderName: raw.from_name || matchedInquiry.name,
              senderEmail: senderEmail || matchedInquiry.email,
              recipientEmail: 'contact@saghiabyar.com',
              subject: subject || `Re: ${matchedInquiry.interest || 'Inquiry'}`,
              message: raw.text || raw.snippet || 'Received reply from patron via email.',
              createdAt: raw.created_at || new Date().toISOString(),
              status: 'received',
              tags: ['Inbound Email', 'Resend Sync'],
              emailId: raw.id,
            };
            appendInboundMessage(matchedInquiry.id, newMsg);
            syncedCount++;
          }
        }
        return { success: true, count: syncedCount, message: `Successfully synced ${syncedCount} inbound email(s)` };
      }
      return { 
        success: true, 
        count: 0, 
        message: res.mode === 'simulated' ? 'Email service running in simulated mode. Use Simulate Collector Reply to test.' : 'Inbox is up to date (0 new messages).' 
      };
    } catch (err: any) {
      return { success: false, count: 0, message: err.message || 'Failed to sync inbound emails' };
    }
  };

  // Simulate collector reply for immediate testing
  const simulateCollectorReply = async (inquiryId: string, customMessage?: string): Promise<{ success: boolean; message?: string }> => {
    const target = inquiries.find((inq) => inq.id === inquiryId);
    if (!target) return { success: false, message: 'Inquiry not found' };

    const simulatedText = customMessage || 'Hello Saghi Abyar Studio! Thank you for the detailed information. We would be delighted to confirm the acquisition schedule and finalize the payment.';
    
    try {
      const res = await simulateInboundEmail({
        inquiryId,
        senderName: target.name,
        senderEmail: target.email,
        message: simulatedText,
        subject: `Re: ${target.replySubject || target.interest || 'Studio Inquiry'} [${target.id}]`,
      });

      if (res.success && res.receivedMessage) {
        appendInboundMessage(inquiryId, res.receivedMessage);
        return { success: true, message: 'Simulated collector reply received in thread' };
      }
      return { success: false, message: 'Failed to simulate response' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  // Admin Auth
  // Called by AuthScreen after a successful Firebase sign-in (admin membership already checked)
  const loginAdmin = (_user?: any): boolean => {
    setIsAuthenticated(true);
    return true;
  };

  const logoutAdmin = () => {
    setIsAuthenticated(false);
    signOutAdmin().catch(() => {});
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
      // Publish the restored backup so visitors see it too
      if (isAuthenticated) {
        publishAllContent(
          Array.isArray(parsed.artworks) ? parsed.artworks : artworks,
          Array.isArray(parsed.categories) ? parsed.categories : categories
        );
        if (parsed.siteConfig && typeof parsed.siteConfig === 'object') {
          saveSiteConfigToFirestore(parsed.siteConfig);
        }
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
        replyToInquiry,
        deleteInquiry,
        addInquiryTag,
        removeInquiryTag,
        addMessageTag,
        removeMessageTag,
        appendInboundMessage,
        syncInboundResendEmails,
        simulateCollectorReply,
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
