import React, { useState, useRef } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  // Loading phases: playing -> paused (hold on final logo frame) -> animating (smooth zoom out & fade)
  const [phase, setPhase] = useState<'playing' | 'paused' | 'animating'>('playing');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Triggered exactly when the intro video ends
  const handleVideoEnd = () => {
    setPhase('paused');

    // 2.5 second hold on the final full logo frame
    setTimeout(() => {
      setPhase('animating');

      // 1 second zoom-out transition duration before unmounting splash
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
    }, 2500);
  };

  // Skip button handler
  const handleSkip = () => {
    setPhase('animating');
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1000);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center origin-center transition-all duration-1000 ease-in-out select-none ${
        phase === 'animating' ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <video
        ref={videoRef}
        src="https://qf1mwtdvcbajjjdk.public.blob.vercel-storage.com/Art%20Gallery/Professional_logo_motion_paintin%E2%80%A6_1080p_202608211505.mp4"
        autoPlay
        muted
        playsInline
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

      {/* Skip button - visible only before exit animation begins */}
      {phase !== 'animating' && (
        <button
          onClick={handleSkip}
          className="absolute bottom-10 right-10 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full backdrop-blur-md transition-all border border-white/20 z-50 text-xs font-mono uppercase tracking-widest cursor-pointer shadow-lg hover:border-amber-400 hover:text-amber-300"
        >
          Skip Intro
        </button>
      )}
    </div>
  );
}

export default SplashScreen;
