import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

interface HandwrittenBrandSignatureProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
  replayOnHover?: boolean;
  className?: string;
}

export const HandwrittenBrandSignature: React.FC<HandwrittenBrandSignatureProps> = ({
  size = 'md',
  showSubtitle = true,
  replayOnHover = true,
  className = '',
}) => {
  const { isFa } = useApp();

  const [progress, setProgress] = useState<number>(0); // 0 to 100%
  const [isWriting, setIsWriting] = useState<boolean>(true);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [writeKey, setWriteKey] = useState<number>(0);

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Scaled dimensions and font sizes with zero vertical clipping
  const sizeStyles = {
    sm: {
      enFont: 'text-xl sm:text-2xl',
      faFont: 'text-xl sm:text-2xl',
      subtitle: 'text-[8px] sm:text-[9px]',
      penSize: 'w-3.5 h-3.5',
      py: 'py-1',
      subtitleMargin: 'mt-0.5',
    },
    md: {
      enFont: 'text-2.5xl sm:text-3.5xl',
      faFont: 'text-2xl sm:text-3xl',
      subtitle: 'text-[9px] sm:text-[10px]',
      penSize: 'w-4 h-4',
      py: 'py-1.5',
      subtitleMargin: 'mt-1',
    },
    lg: {
      enFont: 'text-4xl sm:text-5xl md:text-6xl',
      faFont: 'text-3.5xl sm:text-4.5xl md:text-5xl',
      subtitle: 'text-xs sm:text-sm',
      penSize: 'w-5 h-5',
      py: 'py-2',
      subtitleMargin: 'mt-1.5',
    },
    hero: {
      enFont: 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl',
      faFont: 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl',
      subtitle: 'text-sm sm:text-base',
      penSize: 'w-7 h-7',
      py: 'py-4',
      subtitleMargin: 'mt-2',
    },
  }[size];

  // Smooth signature stroke reveal animation
  useEffect(() => {
    setIsWriting(true);
    setIsFinished(false);
    setProgress(0);
    startTimeRef.current = null;

    const duration = isFa ? 1400 : 1300; // ms to write full signature

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(currentProgress);

      if (currentProgress < 100) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setIsWriting(false);
        setIsFinished(true);
      }
    };

    const delayTimer = setTimeout(() => {
      animFrameRef.current = requestAnimationFrame(step);
    }, 120);

    return () => {
      clearTimeout(delayTimer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isFa, writeKey]);

  const handleMouseEnter = () => {
    if (replayOnHover && !isWriting) {
      setWriteKey((prev) => prev + 1);
    }
  };

  // Directional clip path with generous Y bounds (-200% to +300%)
  // This guarantees that top ascenders (like 'S', 'A', 'آ') and bottom descenders (like 'g', 'y', 'ی') are NEVER clipped vertically!
  const clipPathStyle = isFa
    ? `polygon(${100 - progress}% -200%, 200% -200%, 200% 300%, ${100 - progress}% 300%)`
    : `polygon(-100% -200%, ${progress}% -200%, ${progress}% 300%, -100% 300%)`;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      dir={isFa ? 'rtl' : 'ltr'}
      className={`relative inline-flex flex-col justify-center select-none ${className}`}
      style={{ overflow: 'visible' }}
    >
      {/* Signature Writing Container */}
      <div className={`relative inline-flex items-center ${sizeStyles.py} overflow-visible`} style={{ overflow: 'visible' }}>
        {/* Invisible spacer so the container has exact fixed width and height with zero text jump */}
        <div
          className={`invisible select-none pointer-events-none whitespace-nowrap px-1 ${
            isFa ? 'font-nastaliq font-bold' : 'font-handwriting font-medium'
          } ${isFa ? sizeStyles.faFont : sizeStyles.enFont}`}
          aria-hidden="true"
          style={{ lineHeight: isFa ? 1.6 : 1.4 }}
        >
          {isFa ? 'ساقی آبیار' : 'Saghi Abyar'}
        </div>

        {/* Revealed Signature Text */}
        <div
          className={`absolute inset-0 flex items-center whitespace-nowrap px-1 overflow-visible ${
            isFa ? 'font-nastaliq font-bold' : 'font-handwriting font-medium'
          } ${isFa ? sizeStyles.faFont : sizeStyles.enFont}`}
          style={{
            clipPath: clipPathStyle,
            WebkitClipPath: clipPathStyle,
            overflow: 'visible',
            lineHeight: isFa ? 1.6 : 1.4,
            transition: 'clip-path 0.04s linear, -webkit-clip-path 0.04s linear',
          }}
        >
          <span
            className="gold-ink-text gold-ink-shimmer inline-block py-2"
            style={{
              textShadow: '0 0 18px rgba(251, 191, 36, 0.5), 0 2px 6px rgba(0,0,0,0.9)',
              letterSpacing: isFa ? '0' : '0.03em',
            }}
          >
            {isFa ? 'ساقی آبیار' : 'Saghi Abyar'}
          </span>
        </div>

        {/* Moving Golden Stylus / Fountain Pen Nib following the stroke */}
        <AnimatePresence>
          {isWriting && progress < 99 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3 }}
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-20 flex items-center justify-center"
              style={{
                [isFa ? 'right' : 'left']: `${progress}%`,
                transform: `translate(${isFa ? '50%' : '-50%'}, -50%)`,
                transition: 'left 0.04s linear, right 0.04s linear',
              }}
            >
              {/* Pulsing golden ink droplet / glow */}
              <span className="absolute w-4 h-4 rounded-full bg-amber-300/80 animate-ping" />
              <span className="absolute w-2.5 h-2.5 rounded-full bg-yellow-200 shadow-[0_0_12px_#fef08a]" />

              {/* Calligraphic Pen Nib Icon */}
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`${sizeStyles.penSize} text-amber-300 drop-shadow-[0_0_12px_rgba(253,224,71,1)] transform ${
                  isFa ? '-rotate-45' : 'rotate-12'
                }`}
              >
                <path d="M7.127 22.564l-4.691-1.443 1.443-4.691 11.89-11.89 3.248 3.248-11.89 11.876zm13.14-14.582l-1.697-1.697c-.781-.781-2.047-.781-2.828 0l-1.061 1.061 3.248 3.248 1.061-1.061c.781-.781.781-2.047 0-2.828l1.277 1.277zM3 21l2-2" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Finishing Golden Star Sparkle */}
        {isFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.2] }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className={`absolute top-1/2 -translate-y-1/2 ${
              isFa ? 'left-0' : 'right-0'
            } text-amber-300 text-sm pointer-events-none`}
          >
            ✦
          </motion.div>
        )}
      </div>

      {/* Subtitle - Clean separation with generous spacing */}
      {showSubtitle && (
        <div
          className={`flex items-center gap-1.5 ${sizeStyles.subtitle} ${sizeStyles.subtitleMargin} text-amber-200/70 tracking-[0.25em] uppercase font-mono leading-none ${
            isFa ? 'font-vazir' : ''
          }`}
        >
          <span className="w-1 h-1 rounded-full bg-amber-400/80 flex-shrink-0" />
          <span className="whitespace-nowrap">
            {isFa ? 'نقاشی • نوازندگی تار' : 'FINE ART • PERSIAN TAR'}
          </span>
        </div>
      )}
    </div>
  );
};

