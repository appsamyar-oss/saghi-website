import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { PageView } from '../types';

interface AmbientOilCanvasProps {
  activeView: PageView;
}

export const AmbientOilCanvas: React.FC<AmbientOilCanvasProps> = ({ activeView }) => {
  const { siteConfig } = useApp();

  const prompts = siteConfig.backgroundPrompts || [];
  const settings = siteConfig.backgroundSettings;

  if (!settings || !settings.globalEnabled || prompts.length === 0) {
    return null;
  }

  // Determine active prompt for current page
  const pageSpecificId = settings.pageAssignments?.[activeView as keyof typeof settings.pageAssignments];
  const activePrompt = prompts.find(p => p.id === (pageSpecificId || settings.activePromptId)) 
    || prompts.find(p => p.enabled) 
    || prompts[0];

  if (!activePrompt || !activePrompt.enabled) {
    return null;
  }

  const opacity = (activePrompt.bgIntensity ?? 0.16) * (settings.overlayOpacity / 100 * 2);
  const glowColor = activePrompt.accentColor || '#f59e0b';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Base Layer: Subtle Rich Oil Gradient and Brush Smears */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePrompt.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full"
        >
          {activePrompt.customImageUrl && (
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000"
              style={{
                backgroundImage: `url(${activePrompt.customImageUrl})`,
                opacity: opacity,
                mixBlendMode: settings.blendMode || 'screen',
                filter: settings.blurAmount ? `blur(${settings.blurAmount}px)` : 'none',
              }}
            />
          )}

          {/* 2. Abstract Palette Knife & Impasto Dynamic Shaders/Gradients */}
          <div 
            className="absolute inset-0 w-full h-full opacity-40 mix-blend-screen"
            style={{
              background: `
                radial-gradient(ellipse 70% 50% at 20% 20%, ${glowColor}25, transparent 60%),
                radial-gradient(ellipse 60% 60% at 85% 80%, #06b6d420, transparent 60%),
                radial-gradient(ellipse 50% 40% at 50% 90%, #8b5cf618, transparent 70%)
              `
            }}
          />

          {/* 3. Fluid Animated Ambient Gold/Indigo Glow Orbs */}
          {settings.animatedGlow && (
            <>
              <motion.div
                animate={{
                  x: [0, 40, -30, 0],
                  y: [0, -40, 20, 0],
                  scale: [1, 1.1, 0.95, 1],
                  opacity: [0.15, 0.3, 0.2, 0.15],
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full blur-3xl pointer-events-none"
                style={{ backgroundColor: glowColor }}
              />

              <motion.div
                animate={{
                  x: [0, -50, 30, 0],
                  y: [0, 30, -40, 0],
                  scale: [1, 1.15, 0.9, 1],
                  opacity: [0.1, 0.25, 0.15, 0.1],
                }}
                transition={{
                  duration: 22,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 2,
                }}
                className="absolute bottom-1/4 right-1/6 w-[28rem] h-[28rem] rounded-full blur-3xl pointer-events-none bg-cyan-600/30"
              />
            </>
          )}

          {/* 4. Fine Tactile Canvas Grain Texture Overlay */}
          <div 
            className="absolute inset-0 w-full h-full opacity-[0.03] mix-blend-overlay pointer-events-none bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />

          {/* 5. Deep Jet-Black Vignette Framing for Museum Gallery Contrast */}
          <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/90 pointer-events-none" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
