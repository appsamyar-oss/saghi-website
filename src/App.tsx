import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageView, Artwork } from './types';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { ArchivePage } from './components/ArchivePage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { PurchaseInquiryModal } from './components/PurchaseInquiryModal';
import { AdminModal } from './components/admin/AdminModal';
import { AmbientOilCanvas } from './components/AmbientOilCanvas';
import { SplashScreen } from './components/SplashScreen';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';

function MainApp() {
  const { isAdminOpen, setIsAdminOpen, isFa } = useApp();

  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<PageView>('home');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState<boolean>(false);
  const [inquiryTargetArtwork, setInquiryTargetArtwork] = useState<Artwork | null>(null);

  // Scroll to top on view switch
  const handleViewChange = (view: PageView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenInquiry = (artwork?: Artwork) => {
    setInquiryTargetArtwork(artwork || null);
    setIsInquiryOpen(true);
  };

  // Support hotkey to open Admin Panel (Ctrl+Shift+A)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsAdminOpen]);

  return (
    <div className={`min-h-screen bg-black text-white selection:bg-amber-500/30 font-sans relative ${isFa ? 'font-vazir' : ''}`}>
      {/* Initial Cinematic Video Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Ambient Oil Painting Texture Canvas Background */}
      <AmbientOilCanvas activeView={activeView} />

      {/* Global Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={handleViewChange}
      />

      {/* Main View Router with Smooth Transitions */}
      <AnimatePresence mode="wait">
        {activeView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <HomePage
              setActiveView={handleViewChange}
              onSelectArtwork={(art) => setSelectedArtwork(art)}
              onOpenInquiry={handleOpenInquiry}
            />
          </motion.div>
        )}

        {activeView === 'archive' && (
          <motion.div
            key="archive"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <ArchivePage
              onSelectArtwork={(art) => setSelectedArtwork(art)}
              onOpenInquiry={handleOpenInquiry}
              onOpenCommission={() => handleViewChange('contact')}
            />
          </motion.div>
        )}

        {activeView === 'about' && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <AboutPage setActiveView={handleViewChange} />
          </motion.div>
        )}

        {activeView === 'contact' && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <ContactPage />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Modals */}
      {/* 1. Artwork / Media Detail Modal with Audio/Video player & Purchase CTA */}
      <PhotoDetailModal
        artwork={selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
        onOpenInquiry={handleOpenInquiry}
      />

      {/* 2. Purchase Inquiry & Custom Commission Modal */}
      <PurchaseInquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        artwork={inquiryTargetArtwork}
      />

      {/* 3. Complete Admin Management Panel */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Floating Direct WhatsApp Button */}
      <FloatingWhatsAppButton />

      {/* Global Footer */}
      <Footer
        setActiveView={handleViewChange}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
