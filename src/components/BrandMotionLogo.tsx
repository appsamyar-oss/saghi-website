import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { SaghiEmblemLogo } from './SaghiEmblemLogo';
import { HandwrittenBrandSignature } from './HandwrittenBrandSignature';

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

  // Responsive font size & emblem scales
  const sizeConfig = {
    sm: {
      emblemSize: 36,
      gap: 'gap-2.5 sm:gap-3',
    },
    md: {
      emblemSize: 48,
      gap: 'gap-3 sm:gap-3.5',
    },
    lg: {
      emblemSize: 72,
      gap: 'gap-4 sm:gap-5',
    },
    hero: {
      emblemSize: 110,
      gap: 'gap-5 sm:gap-6',
    },
  }[size];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      dir={isFa ? 'rtl' : 'ltr'}
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

      {/* Live Handwritten Calligraphic Signature */}
      <HandwrittenBrandSignature
        size={size}
        showSubtitle={showSubtitle}
        replayOnHover={true}
      />
    </div>
  );
};


