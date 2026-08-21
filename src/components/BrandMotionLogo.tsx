import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { SaghiEmblemLogo } from './SaghiEmblemLogo';

interface BrandMotionLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
  showEmblem?: boolean;
  emblemVariant?: 'transparent' | 'dark' | 'white';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const BrandMotionLogo: React.FC<BrandMotionLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  showEmblem = true,
  emblemVariant = 'transparent',
  interactive = true,
  onClick,
  className = '',
}) => {
  const { isFa } = useApp();
  const [isHovered, setIsHovered] = useState(false);

  // Responsive font size scales
  const sizeConfig = {
    sm: {
      variable: 'text-base sm:text-lg',
      static: 'text-[10px] sm:text-[11px]',
      subtitle: 'text-[8px]',
      emblemSize: 34,
      gap: 'gap-2.5',
    },
    md: {
      variable: 'text-xl sm:text-2xl',
      static: 'text-xs sm:text-sm',
      subtitle: 'text-[9px] sm:text-[10px]',
      emblemSize: 46,
      gap: 'gap-3.5',
    },
    lg: {
      variable: 'text-3xl sm:text-4xl md:text-5xl',
      static: 'text-base sm:text-lg md:text-xl',
      subtitle: 'text-xs',
      emblemSize: 72,
      gap: 'gap-4',
    },
    hero: {
      variable: 'text-5xl sm:text-7xl md:text-8xl lg:text-9xl',
      static: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
      subtitle: 'text-xs sm:text-sm md:text-base',
      emblemSize: 110,
      gap: 'gap-6',
    },
  }[size];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group inline-flex items-center ${sizeConfig.gap} select-none ${
        interactive ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Official Saghi Abyar Persian Tar & Calligraphy Seal */}
      {showEmblem && (
        <motion.div
          animate={{
            scale: isHovered ? 1.08 : 1,
            rotate: isHovered ? [0, -3, 3, 0] : 0,
          }}
          transition={{ duration: 0.4 }}
          className="flex-shrink-0"
        >
          <SaghiEmblemLogo
            variant={emblemVariant}
            size={sizeConfig.emblemSize}
            glow={true}
          />
        </motion.div>
      )}

      {/* Kinetic Brand Signature with Inconsolata Variable Font */}
      <div dir="ltr" className="flex flex-col justify-center leading-none text-left">
        <div className="font-inconsolata select-none whitespace-nowrap">
          {/* Variable Row: Saghi */}
          <div className={`variable ${sizeConfig.variable} tracking-tight leading-none text-white items-baseline`}>
            <span className="work text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-100 pr-1">
              Saghi
            </span>
          </div>

          {/* Static Row: Abyar */}
          <div className={`static ${sizeConfig.static} text-white/90 uppercase tracking-widest mt-0.5 leading-none font-bold`}>
            Abyar
          </div>
        </div>

        {/* Subtitle */}
        {showSubtitle && (
          <div
            className={`${sizeConfig.subtitle} text-white/50 tracking-[0.22em] uppercase font-mono mt-1 leading-none ${isFa ? 'font-vazir' : ''}`}
          >
            {isFa ? 'نقاشی • نوازندگی تار' : 'FINE ART • PERSIAN TAR'}
          </div>
        )}
      </div>
    </div>
  );
};

