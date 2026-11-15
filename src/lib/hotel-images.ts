import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

const photos = import.meta.glob<ImageMetadata>('../assets/hotel/*.jpg', { eager: true, import: 'default' });

export function hotelPhoto(filename: string): ImageMetadata {
  const photo = photos[`../assets/hotel/${filename}`];
  if (!photo) throw new Error(`Unknown hotel photo: ${filename}`);
  return photo;
}

export async function fullHotelPhoto(filename: string) {
  return getImage({ src: hotelPhoto(filename), format: 'webp', quality: 82 });
}
