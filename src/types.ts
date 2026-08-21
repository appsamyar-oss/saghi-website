export type Language = 'en' | 'fa';

export type ArtworkCategory = 
  | 'all' 
  | 'minimalism' 
  | 'cubism' 
  | 'tar_music' 
  | 'painting';

export interface CategoryItem {
  id: string;
  labelEn: string;
  labelFa: string;
}

export type MediaType = 'image' | 'audio' | 'video';

export interface Artwork {
  id: string;
  title: string;
  titleFa?: string;
  subtitle?: string;
  subtitleFa?: string;
  description: string;
  descriptionFa?: string;
  category: string;
  medium: string;
  mediumFa?: string;
  year: string;
  dimensions?: string;
  artist: string;
  artistFa?: string;
  tags: string[];
  imageUrl: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  featured?: boolean;
  provenance?: string;
  provenanceFa?: string;
  culturalOrigin?: string;
  culturalOriginFa?: string;
  price?: string;
  status?: 'available' | 'reserved' | 'archive' | 'commissioned';
  
  // Media extension for Tar Music & Performance Clips
  mediaType?: MediaType;
  audioUrl?: string;
  videoUrl?: string;
  duration?: string;
  dastgah?: string;
  dastgahFa?: string;
  instrument?: string;
  instrumentFa?: string;
  performanceType?: string;
  performanceTypeFa?: string;
  waveformSeed?: number[];
  
  // Purchase & Commission features
  canPurchase?: boolean;
  canCommission?: boolean;
}

export interface CommissionInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  inquiryType?: 'purchase' | 'commission_art' | 'music_performance' | 'general';
  artworkId?: string;
  artworkTitle?: string;
  interest: string;
  dimensions?: string;
  message: string;
  createdAt: string;
  status: 'new' | 'reviewed' | 'contacted' | 'completed' | 'archived';
  adminNotes?: string;
}

export interface DisciplineItem {
  id: string;
  nameEn: string;
  nameFa: string;
  iconName: 'Music' | 'Palette' | 'Feather' | 'Sparkles' | 'Layers' | 'Volume2';
  descEn?: string;
  descFa?: string;
}

export interface SiteStory {
  id: string;
  tagEn: string;
  tagFa: string;
  titleEn: string;
  titleFa: string;
  body1En: string;
  body1Fa: string;
  body2En: string;
  body2Fa: string;
  imageUrl: string;
  badgeEn: string;
  badgeFa: string;
}

export interface BackgroundPrompt {
  id: string;
  name: string;
  nameFa: string;
  prompt: string;
  styleTag: string;
  styleTagFa: string;
  aspectRatio: string;
  category: 'gold' | 'dark' | 'calligraphy' | 'minimal' | 'music';
  accentColor: string;
  enabled: boolean;
  targetPages: ('all' | 'home' | 'archive' | 'about' | 'contact')[];
  bgIntensity: number;
  customImageUrl?: string;
}

export interface BackgroundSettings {
  activePromptId: string;
  globalEnabled: boolean;
  overlayOpacity: number;
  blendMode: 'screen' | 'overlay' | 'lighten' | 'color-dodge' | 'soft-light';
  blurAmount: number;
  animatedGlow: boolean;
  pageAssignments: {
    home?: string;
    archive?: string;
    about?: string;
    contact?: string;
  };
}

export interface SiteConfig {
  atelierNameEn: string;
  atelierNameFa: string;
  artistNameEn: string;
  artistNameFa: string;
  heroTagEn: string;
  heroTagFa: string;
  heroHeadlineEn: string;
  heroHeadlineFa: string;
  heroSubtitleEn: string;
  heroSubtitleFa: string;
  heroDescriptionEn: string;
  heroDescriptionFa: string;
  aboutIntroEn: string;
  aboutIntroFa: string;
  quoteEn: string;
  quoteFa: string;
  quoteAuthorEn: string;
  quoteAuthorFa: string;
  phone: string;
  email: string;
  instagram: string;
  website: string;
  telegram?: string;
  whatsapp?: string;
  locationEn: string;
  locationFa: string;
  announcement: {
    enabled: boolean;
    textEn: string;
    textFa: string;
    type: 'gold' | 'cyan' | 'purple';
  };
  customLogoUrl?: string;
  customLogoDarkUrl?: string;
  customLogoTransparentUrl?: string;
  logoScale?: number;
  disciplines: DisciplineItem[];
  stories: SiteStory[];
  backgroundSettings?: BackgroundSettings;
  backgroundPrompts?: BackgroundPrompt[];
}

export interface CommissionForm {
  name: string;
  email: string;
  phone?: string;
  inquiryType: 'purchase' | 'commission_art' | 'music_performance' | 'general';
  artworkId?: string;
  artworkTitle?: string;
  interest: string;
  budgetRange?: string;
  message: string;
  dimensions?: string;
}

export type PageView = 'home' | 'archive' | 'about' | 'contact';
export type AdminTab = 'artworks' | 'categories' | 'content' | 'branding' | 'backgrounds' | 'inquiries' | 'settings' | 'backup';
