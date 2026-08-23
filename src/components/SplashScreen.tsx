import React, { useState, useRef, useEffect } from 'react';
import { Play, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  // Loading phases: playing -> paused (hold on final logo frame) -> animating (smooth zoom out & fade)
  const [phase, setPhase] = useState<'playing' | 'paused' | 'animating'>('playing');
  const [needsUserTap, setNeedsUserTap] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Triggered exactly when the intro video ends
  const handleVideoEnd = () => {
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    setPhase('paused');

    // 2.2 second hold on the final full logo frame
    setTimeout(() => {
      setPhase('animating');

      // 0.8 second zoom-out transition duration before unmounting splash
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 800);
    }, 2200);
  };

  // Skip button handler
  const handleSkip = () => {
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    setPhase('animating');
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 800);
  };

  // Safari & Mobile Autoplay trigger with fallback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    (video as any).defaultMuted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setNeedsUserTap(false);
        })
        .catch((err) => {
          console.warn('Autoplay restricted by browser/iOS battery saving mode:', err);
          setNeedsUserTap(true);
        });
    }

    // Safety fallback: If video stalls or fails to end within 9 seconds, auto transition
    fallbackTimerRef.current = setTimeout(() => {
      handleSkip();
    }, 9000);

    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  const handleManualStart = () => {
    setNeedsUserTap(false);
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        handleSkip();
      });
    }
  };

  return (
    <div
      onClick={needsUserTap ? handleManualStart : undefined}
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center origin-center transition-all duration-1000 ease-in-out select-none ${
        phase === 'animating' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <video
        ref={videoRef}
        src="https://qf1mwtdvcbajjjdk.public.blob.vercel-storage.com/Art%20Gallery/Professional_logo_motion_paintin%E2%80%A6_1080p_202608211505.mp4"
        autoPlay
        muted
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        preload="auto"
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onEnded={handleVideoEnd}
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* Anti-piracy protective overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* iOS Safari Fallback Play Button if browser policy blocked silent autoplay */}
      {needsUserTap && phase !== 'animating' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
          <button
            onClick={handleManualStart}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-black flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.5)] transform hover:scale-110 active:scale-95 transition-all cursor-pointer mb-4 animate-pulse"
            aria-label="Play Gallery Intro"
          >
            <Play className="w-9 h-9 sm:w-10 sm:h-10 fill-black ml-1" />
          </button>
          <div className="text-amber-200 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>SAGHI ABYAR STUDIO</span>
          </div>
          <p className="text-white/60 text-xs mt-1 font-mono">
            لمس برای ورود به گالری و تماشای تیزر رسمی
          </p>
        </div>
      )}

      {/* Skip button - visible before exit animation begins */}
      {phase !== 'animating' && (
        <button
          onClick={handleSkip}
          className="absolute bottom-10 right-6 sm:right-10 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full backdrop-blur-md transition-all border border-white/20 z-50 text-xs font-mono uppercase tracking-widest cursor-pointer shadow-lg hover:border-amber-400 hover:text-amber-300"
          style={{
            marginBottom: 'env(safe-area-inset-bottom, 0px)',
            marginRight: 'env(safe-area-inset-right, 0px)',
          }}
        >
          Skip Intro
        </button>
      )}
    </div>
  );
}

export default SplashScreen;
