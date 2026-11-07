import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n/utils';
import snapshot from './instagram.json';

/*
 * Instagram feed on the home page.
 * Data comes from `npm run instagram` (scripts/instagram_snapshot.py), which reads the
 * public @bombinabistro profile and writes ./instagram.json + src/assets/instagram-feed/.
 * Re-run it and rebuild to refresh the numbers and posts.
 * Likes/comments are hidden from logged-out visitors, so they are usually null.
 * Type them into instagram.json by hand to show them in the hover overlay.
 */

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/instagram-feed/*.{jpg,jpeg,png,webp}', { eager: true });
const image = (name: string | null | undefined): ImageMetadata | null => {
  if (!name) return null;
  const hit = Object.entries(files).find(([path]) => path.endsWith(`/${name}`));
  return hit ? hit[1].default : null;
};

export type IgPostType = 'image' | 'carousel' | 'reel';

export interface IgPost {
  shortcode: string;
  url: string;
  type: IgPostType;
  likes: number | null;
  comments: number | null;
  caption: string;
  date: string | null;
  src: ImageMetadata;
}

const { profile } = snapshot;

export const igProfile = {
  ...profile,
  avatar: image(profile.avatar),
  capturedAt: snapshot.capturedAt,
};

export const igFeed: IgPost[] = snapshot.posts.flatMap((p) => {
  const src = image(p.image);
  if (!src) return [];
  return [{ ...p, type: p.type as IgPostType, likes: p.likes ?? null, comments: p.comments ?? null, src }];
});

/** Instagram-style counts: 1.735 / 1,735 below 10K, then 18K / 18,2K, 1,2M. */
export function formatCount(n: number, lang: Lang): string {
  const [group, decimal] = lang === 'sl' ? ['.', ','] : [',', '.'];
  if (n < 10_000) return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, group); // sl-SI alone would print "1735"
  const [div, suffix] = n < 1_000_000 ? [1_000, 'K'] : [1_000_000, 'M'];
  const value = n / div;
  const digits = value < 100 ? 1 : 0;
  return value.toFixed(digits).replace(/\.0$/, '').replace('.', decimal) + suffix;
}
