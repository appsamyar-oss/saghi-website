import React from 'react';
import { useApp } from '../context/AppContext';

interface SaghiEmblemLogoProps {
  variant?: 'transparent' | 'dark' | 'white';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | number;
  className?: string;
  glow?: boolean;
}

export const SaghiEmblemLogo: React.FC<SaghiEmblemLogoProps> = ({
  variant = 'transparent',
  size = 'md',
  className = '',
  glow = true,
}) => {
  const { siteConfig } = useApp();
  
  const pixelSize = typeof size === 'number' ? size : {
    xs: 34,
    sm: 48,
    md: 64,
    lg: 96,
    xl: 140,
    hero: 220,
  }[size];

  const isDark = variant === 'dark';
  const isWhite = variant === 'white';

  const DEFAULT_TRANSPARENT_LOGO = 'https://qf1mwtdvcbajjjdk.public.blob.vercel-storage.com/Art%20Gallery/saghi%20logo%20Transparent.png';

  // Check if custom uploaded logo is set in siteConfig or fallback to default studio transparent logo
  const customImgSrc = (variant === 'dark' && siteConfig.customLogoDarkUrl)
    ? siteConfig.customLogoDarkUrl 
    : siteConfig.customLogoUrl || siteConfig.customLogoTransparentUrl || DEFAULT_TRANSPARENT_LOGO;

  if (customImgSrc) {
    return (
      <div 
        className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
      >
        {glow && (
          <div 
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/25 via-yellow-300/20 to-transparent blur-md pointer-events-none"
            style={{ transform: 'scale(1.18)' }}
          />
        )}
        <div 
          className={`relative z-10 w-full h-full flex items-center justify-center overflow-hidden ${
            isDark ? 'rounded-full bg-black/90 border border-amber-400/30' : isWhite ? 'rounded-full bg-white/95 border border-amber-400/30' : ''
          }`}
        >
          <img 
            src={customImgSrc} 
            alt={siteConfig.artistNameEn || 'Saghi Abyar'} 
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] pointer-events-none select-none"
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Dynamic Ambient Gold Glow */}
      {glow && (
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/25 via-yellow-300/20 to-transparent blur-md pointer-events-none"
          style={{ transform: 'scale(1.18)' }}
        />
      )}

      <svg
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_6px_20px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Rich Multilayered Persian Gold Leaf Gradients */}
          <linearGradient id="richGoldGrad" x1="15%" y1="5%" x2="85%" y2="95%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="18%" stopColor="#E5C158" />
            <stop offset="38%" stopColor="#FAF0C0" />
            <stop offset="58%" stopColor="#B8860B" />
            <stop offset="82%" stopColor="#F5D77F" />
            <stop offset="100%" stopColor="#7E540C" />
          </linearGradient>

          <linearGradient id="brightGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF9D2" />
            <stop offset="30%" stopColor="#E5BE53" />
            <stop offset="60%" stopColor="#9C6F19" />
            <stop offset="100%" stopColor="#E2BD58" />
          </linearGradient>

          <radialGradient id="goldGlowAura" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FFF6CC" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#D4AF37" stopOpacity="0.75" />
            <stop offset="80%" stopColor="#8C5C12" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2A1803" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="tarDarkWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A1B10" />
            <stop offset="30%" stopColor="#140B05" />
            <stop offset="70%" stopColor="#3A2213" />
            <stop offset="100%" stopColor="#0B0502" />
          </linearGradient>

          <linearGradient id="tarSkinMembrane" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#3B2618" />
            <stop offset="45%" stopColor="#1B0F08" />
            <stop offset="100%" stopColor="#28170D" />
          </linearGradient>

          <filter id="goldEmbossEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1.5" dy="2.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.85" />
            <feSpecularLighting surfaceScale="2" specularConstant="0.8" specularExponent="20" lightingColor="#FFF4D0">
              <fePointLight x="200" y="150" z="300" />
            </feSpecularLighting>
          </filter>
        </defs>

        {/* Solid Background if Dark or White variant */}
        {isDark && (
          <circle cx="300" cy="300" r="280" fill="#050505" stroke="url(#richGoldGrad)" strokeWidth="2" />
        )}
        {isWhite && (
          <circle cx="300" cy="300" r="280" fill="#FFFFFF" stroke="url(#richGoldGrad)" strokeWidth="2" />
        )}

        {/* Elegant Gold Swirling Crest Circle Rings */}
        <g stroke="url(#richGoldGrad)" fill="none">
          <ellipse cx="265" cy="305" rx="230" ry="225" strokeWidth="5.5" transform="rotate(-6 265 305)" opacity="0.95" />
          <ellipse cx="270" cy="300" rx="218" ry="210" strokeWidth="2.5" transform="rotate(-3 270 300)" opacity="0.85" />
          <ellipse cx="262" cy="308" rx="205" ry="198" strokeWidth="1.5" transform="rotate(-10 262 308)" opacity="0.7" />
          
          {/* Top Decorative Flourish Curl */}
          <path d="M260 170 C270 150 285 160 275 180 C265 195 240 185 245 165" strokeWidth="2" />

          {/* Left Crescent Accent Dots */}
          <circle cx="120" cy="370" r="5" fill="url(#richGoldGrad)" />
          <circle cx="128" cy="392" r="4.5" fill="url(#richGoldGrad)" />
          <circle cx="138" cy="410" r="3.5" fill="url(#richGoldGrad)" />
        </g>

        {/* Central Persian Calligraphy: ساقی آبیار (Saghi Abyar) */}
        <g filter="url(#goldEmbossEffect)" fill="url(#richGoldGrad)">
          {/* ساقی (Saghi) - Sweeping Fluid Nastaliq */}
          <path d="M370 210 C362 195 348 190 335 198 C318 208 322 225 332 235 C345 248 358 268 348 288 C334 310 306 322 276 320 C248 318 228 298 226 276 C224 254 238 232 260 224 C266 222 268 216 262 210 C256 204 248 208 242 210 C215 224 198 254 200 284 C204 320 230 344 268 346 C308 348 344 330 362 298 C380 266 380 234 370 210 Z" />
          
          {/* Dots & Diacritics for ساقی */}
          <circle cx="355" cy="190" r="6.5" fill="url(#richGoldGrad)" />
          <circle cx="342" cy="182" r="6.5" fill="url(#richGoldGrad)" />
          <path d="M310 170 C302 178 282 196 262 206 C256 209 260 216 268 214 C292 205 310 186 318 176 Z" />

          {/* آبیار (Abyar) - Calligraphic Vertical Alef & Flowing Base */}
          {/* مد آ (Kolahak Mad) */}
          <path d="M285 158 C296 150 310 152 318 156 C305 164 292 166 278 172 C273 174 270 169 275 166 C280 163 283 160 285 158 Z" />
          {/* الف (Alef) */}
          <path d="M296 166 C292 188 286 226 280 258 C279 266 286 268 290 262 C296 246 304 200 306 170 Z" />
          
          {/* بـ - یا - ر (Byar) */}
          <path d="M246 190 C238 208 228 236 212 260 C198 280 176 294 154 296 C144 297 148 304 158 304 C188 302 212 284 228 260 C244 234 254 204 260 188 C262 180 252 178 246 190 Z" />
          <path d="M224 286 C204 300 178 310 152 312 C138 313 142 321 152 321 C184 318 216 306 236 290 Z" />
          
          {/* Dots for آبیار */}
          <circle cx="230" cy="344" r="6.5" fill="url(#richGoldGrad)" />
          <circle cx="215" cy="347" r="6.5" fill="url(#richGoldGrad)" />
          <circle cx="200" cy="350" r="6.5" fill="url(#richGoldGrad)" />
        </g>

        {/* English Brand Typography: SAGHI ABYAR */}
        <g fill="url(#richGoldGrad)" textAnchor="middle">
          <text 
            x="275" 
            y="410" 
            fontFamily="'Cinzel', 'Playfair Display', serif" 
            fontSize="32" 
            fontWeight="bold" 
            letterSpacing="10"
          >
            SAGHI ABYAR
          </text>
          
          {/* Subtitle: FINE ART STUDIO */}
          <text 
            x="275" 
            y="438" 
            fontFamily="'Cinzel', 'Plus Jakarta Sans', sans-serif" 
            fontSize="14" 
            fontWeight="600" 
            letterSpacing="8"
            opacity="0.9"
          >
            FINE ART STUDIO
          </text>
        </g>

        {/* Elegant Gold Divider Flourish */}
        <g stroke="url(#richGoldGrad)" strokeWidth="1.6" fill="none">
          <line x1="180" y1="460" x2="255" y2="460" />
          <line x1="295" y1="460" x2="370" y2="460" />
          <path d="M265 460 C270 455 275 455 275 460 C275 465 280 465 285 460" strokeWidth="2" />
          <circle cx="275" cy="468" r="2.5" fill="url(#richGoldGrad)" />
        </g>

        {/* Persian Tar Instrument (تار ایرانی) Master Structure */}
        <g id="persianTarMaster" transform="translate(30, -5)">
          {/* Tar Soundbox - Large Bowl (کاسه بزرگ) */}
          <g filter="url(#goldEmbossEffect)">
            <ellipse cx="405" cy="465" rx="66" ry="60" fill="url(#tarDarkWood)" stroke="url(#richGoldGrad)" strokeWidth="6.5" />
            <ellipse cx="405" cy="465" rx="57" ry="51" fill="#140A04" opacity="0.95" />
            
            {/* Skin Membrane (پوست بره) & Bridge (خرک) */}
            <ellipse cx="405" cy="465" rx="46" ry="40" fill="url(#tarSkinMembrane)" />
            <rect x="385" y="468" width="40" height="5" rx="2.5" fill="#E5C158" />

            {/* Intricate Gold Filigree Arabesque on Tar Bowl Rim */}
            <circle cx="405" cy="465" r="62" stroke="#FAF0C0" strokeWidth="1.4" strokeDasharray="3.5 3.5" fill="none" opacity="0.85" />
            <circle cx="405" cy="465" r="54" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.65" />
          </g>

          {/* Tar Soundbox - Small Bowl (نقاره) */}
          <g filter="url(#goldEmbossEffect)">
            <ellipse cx="450" cy="380" rx="42" ry="39" fill="url(#tarDarkWood)" stroke="url(#richGoldGrad)" strokeWidth="5.5" />
            <ellipse cx="450" cy="380" rx="34" ry="32" fill="#140A04" />
            <circle cx="450" cy="380" r="38" stroke="#FAF0C0" strokeWidth="1.2" strokeDasharray="3 3" fill="none" opacity="0.8" />
          </g>

          {/* Tar Neck (دسته تار) with Frets (پرده‌ها) & Bone Inlay (استخوان دسته) */}
          <g filter="url(#goldEmbossEffect)">
            {/* Main Wooden Neck */}
            <path d="M458 350 L408 100 L392 102 L440 354 Z" fill="url(#tarDarkWood)" stroke="url(#richGoldGrad)" strokeWidth="3" />
            {/* Camel Bone Inlay Strips (استخوان فوفل و دسته) */}
            <line x1="450" y1="344" x2="400" y2="101" stroke="#FFF7DE" strokeWidth="3" />
            
            {/* Frets (پرده‌های تار) */}
            {[115, 132, 150, 170, 192, 215, 240, 268, 298, 330].map((y, idx) => (
              <line 
                key={idx}
                x1={400 + (y - 100) * 0.2} 
                y1={y} 
                x2={410 + (y - 100) * 0.2} 
                y2={y + 2} 
                stroke="#E5C158" 
                strokeWidth="1.6" 
              />
            ))}
          </g>

          {/* Tar Headstock & Pegbox (سرپنجه و گوشی‌های تار) */}
          <g filter="url(#goldEmbossEffect)">
            <path d="M408 100 L390 42 C390 38 402 34 410 38 L424 92 Z" fill="url(#richGoldGrad)" />
            
            {/* 6 Tuning Pegs (گوشی‌های تار) */}
            <circle cx="380" cy="48" r="5.5" fill="url(#richGoldGrad)" />
            <line x1="380" y1="48" x2="395" y2="50" stroke="url(#richGoldGrad)" strokeWidth="3.5" />
            
            <circle cx="432" cy="42" r="5.5" fill="url(#richGoldGrad)" />
            <line x1="432" y1="42" x2="416" y2="44" stroke="url(#richGoldGrad)" strokeWidth="3.5" />

            <circle cx="376" cy="68" r="5.5" fill="url(#richGoldGrad)" />
            <line x1="376" y1="68" x2="392" y2="70" stroke="url(#richGoldGrad)" strokeWidth="3.5" />

            <circle cx="436" cy="64" r="5.5" fill="url(#richGoldGrad)" />
            <line x1="436" y1="64" x2="418" y2="66" stroke="url(#richGoldGrad)" strokeWidth="3.5" />

            <circle cx="382" cy="90" r="5.5" fill="url(#richGoldGrad)" />
            <line x1="382" y1="90" x2="398" y2="92" stroke="url(#richGoldGrad)" strokeWidth="3.5" />

            <circle cx="440" cy="86" r="5.5" fill="url(#richGoldGrad)" />
            <line x1="440" y1="86" x2="422" y2="88" stroke="url(#richGoldGrad)" strokeWidth="3.5" />
          </g>

          {/* Tar Strings (سیم‌های شفاف نقره و زرد تار) */}
          <g stroke="#FFFFFF" strokeWidth="1" opacity="0.9">
            <line x1="405" y1="82" x2="403" y2="470" />
            <line x1="408" y1="82" x2="407" y2="470" />
            <line x1="410" y1="82" x2="410" y2="470" stroke="#FFF2B2" />
          </g>
        </g>
      </svg>
    </div>
  );
};
