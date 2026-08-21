import { Artwork, ArtworkCategory } from '../types';
import { INITIAL_ARTWORKS } from './initialData';

export const ARTWORKS: Artwork[] = INITIAL_ARTWORKS;

export const CATEGORIES: { id: ArtworkCategory; name: string; nameFa: string; count: number }[] = [
  { id: 'all', name: 'All Works & Music', nameFa: 'همه آثار و نواها', count: ARTWORKS.length },
  { id: 'minimalism', name: 'Minimalist Paintings', nameFa: 'نقاشی مینیمال', count: ARTWORKS.filter(a => a.category === 'minimalism').length },
  { id: 'cubism', name: 'Cubism Artworks', nameFa: 'نقاشی کوبیسم', count: ARTWORKS.filter(a => a.category === 'cubism').length },
  { id: 'tar_music', name: 'Tar Solo Performances', nameFa: 'تکنوازی تار', count: ARTWORKS.filter(a => a.category === 'tar_music').length },
  { id: 'painting', name: 'Oil on Linen & Mixed Media', nameFa: 'رنگ‌روغن و ترکیب مواد', count: ARTWORKS.filter(a => a.category === 'painting').length },
];
